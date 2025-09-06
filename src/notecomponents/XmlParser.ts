export class NoteXmlElement {
    tag: string;
    children: Array<any> = [];
    attributes: any;
    text: string;
    get length(): number { return this.text.length; }
}


/**
 * This function will take in some text from a note and return a mixed array of string portions and xml data.
 * This is beneficial over using an existing xml parser library because the proper xml protocol doesn't keep track of whitespace. */
export function parseNoteXml(text: string): Array<NoteXmlElement | string> {
    const output = [];
    let i = 0;
    while (i < text.length) {
        const child = parseXmlText(text, i);
        output.push(child);
        i += child.length;
    }
    return output;
}


/** This function will start from the beginning of the inside of an xml element and continue until it reaches a closing tag */
function parseXmlChildren(text: string, startIndex: number): Array<NoteXmlElement | string> {
    const output = [];
    let i = startIndex;
    while (true) {
        if (i >= text.length)
            break;
        if (i + 2 < text.length && text[i] == '<' && text[i + 1] == '|' && text[i + 2] == '/')
            break;
        const child = parseXmlText(text, i);
        output.push(child);
        i += child.length;
    }
    return output;
}


/** This function will try to grab the next string portion, but fall back to getting the next xml element if that's what's next */
function parseXmlText(text: string, startIndex: number): NoteXmlElement | string {
    let openStart = text.indexOf('<|', startIndex);
    if (openStart == startIndex)
        return parseXmlElement(text, startIndex);
    if (openStart == -1)
        return text.substring(startIndex);
    return text.substring(startIndex, openStart);
}


/** This function will parse an xml element as well as all of its child elements */
function parseXmlElement(text: string, startIndex: number): NoteXmlElement | string {
    const openEnd = text.indexOf('|>', startIndex + 2);
    if (openEnd == -1)
        return text.substring(startIndex);
    const isSelfClosing = text[openEnd - 1] == '/';
    const output = parseXmlOpeningTag(text, startIndex + 2, openEnd - Number(isSelfClosing));

    if (isSelfClosing) {
        output.text = text.substring(startIndex, openEnd + 2);
        return output;
    }

    const children = parseXmlChildren(text, openEnd + 2);
    const childrenLength = children.map(x => x.length).reduce((acc, cur) => acc + cur, 0);
    
    const closeStart = text.indexOf('<|/', openEnd + 2 + childrenLength);
    if (closeStart != openEnd + 2 + childrenLength)
        return text.substring(startIndex);
    const closeEnd = text.indexOf('|>', closeStart + 3);
    const closeTagName = text.substring(closeStart + 3, closeEnd).trim();
    if (output.tag != closeTagName)
        return text.substring(startIndex);

    output.children = children;
    output.text = text.substring(startIndex, closeEnd + 2);
    return output;
}


/** This function will parse the name and attributes of an xml element */
function parseXmlOpeningTag(text: string, startIndex: number, endIndex: number): NoteXmlElement {
    let substr = text.substring(startIndex, endIndex).trim();
    const output = new NoteXmlElement();

    const spaceIndex = substr.indexOf(' ');
    if (spaceIndex == -1) {
        output.tag = substr.trim();
        return output;
    }
    else {
        output.tag = substr.substring(0, spaceIndex).trim();
        substr = substr.substring(spaceIndex + 1).trim();
    }

    output.attributes = {};
    const quotesSplit = substr.split('"');
    for (let i = 0; i < quotesSplit.length; i += 2) {
        let attrName = quotesSplit[i].replace('=', '').trim();
        let attrVal = quotesSplit[i + 1];
        output.attributes[attrName] = attrVal;
    }

    return output;
}