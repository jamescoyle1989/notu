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
    const nameRegex = /<(\/)?\s*(\w[\w\d]*)\s*[/>\w]/y;
    nameRegex.lastIndex = wd.textIndex;
    const nameMatch = nameRegex.exec(wd.text);
    if (!nameMatch || nameMatch.index != wd.textIndex) {
        wd.resolveStack();
        wd.addTextUpTo(wd.textIndex + 1);
        return;
    }
    const isClosing = nameMatch[1] != undefined;

    //Create the element object we'll be working with
    const newElement = new NmlElement();
    newElement.tag = nameMatch[2];
    newElement.startIndex = wd.textIndex;

    //This keeps track of our overall position as we move through the element
    //It's important to make sure it starts on a space if possible, since we want to make sure
    //each attribute is space-separated
    let index = wd.textIndex + nameMatch[0].length - 1;
    if (isSpace(wd.text.charCodeAt(index - 1)))
        index--;

    //Loop through each attribute on the element, also detecting if we've hit a closing tag
    while (true) {
        const attributeRegex = /(?:\s+(\w[\w\d]*)\s*=\s*\")?(?:\s*(\/?>))?/y;
        attributeRegex.lastIndex = index;
        const attributeMatch = attributeRegex.exec(wd.text);
        if (attributeMatch[0] == '' || attributeMatch.index != index) {
            wd.resolveStack();
            wd.addTextUpTo(index);
            return;
        }

        //Handle the scenario we've found the end of the element
        if (attributeMatch[2] == '>') {
            wd.textIndex = attributeMatch.index + attributeMatch[0].length;
            if (isClosing)
                newElement.closeText = wd.text.substring(newElement.startIndex, wd.textIndex);
            else
                newElement.openText = wd.text.substring(newElement.startIndex, wd.textIndex);
            wd.addElement(newElement);
            return
        }
        else if (attributeMatch[2] == '/>') {
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
        const attributeName = attributeMatch[1];
        let attributeValueStartIndex = attributeMatch.index + attributeMatch[0].length;
        let attributeValueEndIndex = attributeValueStartIndex;
        while (true) {
            attributeValueEndIndex = wd.text.indexOf('"', attributeValueStartIndex);
            if (attributeValueEndIndex == -1) {
                wd.resolveStack();
                wd.addTextUpTo(index);
                return;
            }
            if (!isSlash(wd.text.charCodeAt(attributeValueEndIndex - 1)))
                break;
        }
        const attributeValue = wd.text.substring(attributeValueStartIndex, attributeValueEndIndex);
        newElement.attributes[attributeName] = attributeValue;
        index = attributeValueEndIndex + 1;
    }
}


function isSlash(charCode: number) {
    return charCode == 47;
}

function isSpace(charCode: number) {
    return charCode == 32;
}