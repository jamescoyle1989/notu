export class NmlElement {
    tag: string;
    children: Array<string | NmlElement> = [];
    attributes: any = {};
    openText: string;
    closeText: string;
    isSelfClosing: boolean = false;
    startIndex: number;

    get length(): number {
        return this.openText.length
             + (this.closeText?.length ?? 0)
             + this.children.map(x => x.length).reduce((acc, cur) => acc + cur, 0);
    }

    get fullText(): string {
        let output = this.openText;
        for (const child of this.children) {
            if (typeof child === 'string')
                output += child;
            else
                output += child.fullText;
        }
        if (!!this.closeText)
            output += this.closeText;
        return output;
    }

    get isComplete(): boolean {
        if (this.isSelfClosing)
            return true;
        if (!!this.openText && !!this.closeText)
            return true;
        return false;
    }
}


export class NmlParserWorkingData {
    text: string;
    textIndex: number = 0;
    results: Array<string | NmlElement> = [];
    elementStack: Array<NmlElement> = [];

    constructor(text: string) {
        this.text = text;
    }

    addTextUpTo(index: number) {
        const newText = this.text.substring(this.textIndex, index);
        this.textIndex = index;

        if (this.elementStack.length > 0) {
            const topElement = this.elementStack[this.elementStack.length - 1];
            if (topElement.children.length > 0) {
                const lastItem = topElement.children[topElement.children.length - 1];
                if (typeof lastItem == 'string') {
                    topElement.children[topElement.children.length - 1] = lastItem + newText;
                    return;
                }
            }
            topElement.children.push(newText);
        }
        else {
            if (this.results.length > 0) {
                const lastItem = this.results[this.results.length - 1];
                if (typeof lastItem == 'string') {
                    this.results[this.results.length - 1] = lastItem + newText;
                    return;
                }
            }
            this.results.push(newText);
        }
    }

    addElement(element: NmlElement) {
        if (element.isSelfClosing) {
            if (this.elementStack.length == 0)
                this.results.push(element);
            else {
                this.elementStack[this.elementStack.length - 1].children.push(element);
            }
        }
        else if (!element.closeText) {
            if (this.elementStack.length > 0)
                this.elementStack[this.elementStack.length - 1].children.push(element);
            this.elementStack.push(element);
        }
        else {
            const topElement = this.elementStack[this.elementStack.length - 1];
            if (topElement?.tag == element.tag) {
                this.elementStack.pop();
                topElement.closeText = element.closeText;
                if (this.elementStack.length == 0)
                    this.results.push(topElement);
            }
            else {
                this.resolveStack();
                this.textIndex = element.startIndex;
                this.addTextUpTo(element.startIndex + element.closeText.length);
            }
        }
    }

    resolveStack() {
        if (this.elementStack.length == 0)
            return;
        const elStack = this.elementStack;
        this.elementStack = [];
        this.resolveStackElement(elStack[0]);
    }

    resolveStackElement(element: NmlElement) {
        this.textIndex = element.startIndex;
        if (element.isComplete) {
            this.results.push(element);
            this.textIndex = element.startIndex + element.length;
            return;
        }
        this.addTextUpTo(element.startIndex + element.openText.length);
        for (const child of element.children) {
            if (typeof child === 'string')
                this.addTextUpTo(this.textIndex + child.length);
            else
                this.resolveStackElement(child);
        }
    }
}


export function parseNml(text: string): Array<string | NmlElement> {
    const wd = new NmlParserWorkingData(text);
    while (wd.textIndex < text.length) {
        if (wd.text[wd.textIndex] == '<')
            parseNmlElement(wd);
        else
            parseNmlTextFragment(wd);
    }
    wd.resolveStack();
    return wd.results;
}


function parseNmlTextFragment(wd: NmlParserWorkingData): void {
    let openStart = wd.text.indexOf('<', wd.textIndex);
    if (openStart == -1) {
        wd.addTextUpTo(wd.text.length);
        return;
    }
    wd.addTextUpTo(openStart);
}


export function parseNmlElement(wd: NmlParserWorkingData): void {
    //Get the name of the element and if it is a closing tag or not
    const nameRegex = /<(\/)?\s*(\w[\w\d]*)\s*(\/?>|\s\w)/y;
    nameRegex.lastIndex = wd.textIndex;
    const nameMatch = nameRegex.exec(wd.text);
    if (!nameMatch || nameMatch.index != wd.textIndex) {
        wd.resolveStack();
        wd.addTextUpTo(wd.textIndex + 1);
        return;
    }
    const isClosing = nameMatch[1] != undefined;
    const afterTagName = nameMatch[3];

    //Create the element object we'll be working with
    const newElement = new NmlElement();
    newElement.tag = nameMatch[2];
    newElement.startIndex = wd.textIndex;

    //This keeps track of our overall position as we move through the element
    let index = wd.textIndex + nameMatch[0].length - afterTagName.length;

    //Loop through each attribute on the element, also detecting if we've hit a closing tag
    while (true) {
        /*                      Capture if this is the end of the element
                                  |     Capture the attribute name
                                  |            |        Capture if there's an equal sign after the attribute name, or if this is a flag
                                  |            |          |    Capture everything that comes after the name, for correctly repositioning the index
                                  |            |         |+|     |
                                |-+--|    |----+----||-----------+-------------|    */
        const attributeRegex = /(\/?>)|\s+(\w[\w\d]*)(\s*(=)\s*\"|\s+\w|\s*\/?>)/y;
        attributeRegex.lastIndex = index;
        const attributeMatch = attributeRegex.exec(wd.text);
        if (!attributeMatch || attributeMatch.index != index) {
            wd.resolveStack();
            wd.addTextUpTo(index);
            return;
        }
        const closingBracket = attributeMatch[1];
        const attributeName = attributeMatch[2];
        const afterAttributeName = attributeMatch[3];
        const hasEqualSign = attributeMatch[4] == '=';

        //Handle the scenario we've found the end of the element
        if (closingBracket == '>') {
            wd.textIndex = attributeMatch.index + attributeMatch[0].length;
            if (isClosing)
                newElement.closeText = wd.text.substring(newElement.startIndex, wd.textIndex);
            else
                newElement.openText = wd.text.substring(newElement.startIndex, wd.textIndex);
            wd.addElement(newElement);
            return
        }
        else if (closingBracket == '/>') {
            if (isClosing) {
                wd.resolveStack();
                wd.addTextUpTo(attributeMatch.index + attributeMatch[0].length);
                return;
            }
            wd.textIndex = attributeMatch.index + attributeMatch[0].length;
            newElement.openText = wd.text.substring(newElement.startIndex, attributeMatch.index + attributeMatch[0].length);
            newElement.isSelfClosing = true;
            wd.addElement(newElement);
            return;
        }

        //Rather than handle the complexity of handling escaped quotes with regex, we instead just loop through
        if (hasEqualSign) {
            const attributeValueStartIndex = attributeMatch.index + attributeMatch[0].length;
            const attributeValue = parseAttributeValue(wd, attributeMatch.index + attributeMatch[0].length);
            if (attributeValue == null) {
                wd.resolveStack();
                wd.addTextUpTo(attributeValueStartIndex);
                return;
            }
            newElement.attributes[attributeName] = attributeValue.replace(/\/"/g, '"');
            index = attributeValueStartIndex + attributeValue.length + 1;
        }
        else {
            newElement.attributes[attributeName] = true;
            index = attributeMatch.index + attributeMatch[0].length - afterAttributeName.length;
        }
    }
}


export function parseAttributeValue(wd: NmlParserWorkingData, startIndex: number): string | null {
    let currentIndex = startIndex;
    while (true) {
        const nextIndex = wd.text.indexOf('"', currentIndex);
        if (nextIndex == -1)
            return null;
        if (!isSlash(wd.text.charCodeAt(nextIndex - 1)))
            return wd.text.substring(startIndex, nextIndex);
        currentIndex = nextIndex + 1;
    }
}


function isSlash(charCode: number) {
    return charCode == 47;
}