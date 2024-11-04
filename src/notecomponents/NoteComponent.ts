import Note from '../models/Note';
import { Notu } from '../services/Notu';

/** The base interface that all note components must implement */
export interface NoteComponent {

    /** Gets the text which would be used for saving the current state of the note component's contents */
    getText(): string;
}


/** Stores info about a found NoteComponenet in a note's text until it is ready to be generated */
export class NoteComponentInfo {

    text: string;

    start: number;

    get end(): number { return this.start + this.text.length; }

    processor: NoteComponentProcessor;

    constructor(text: string, start: number, processor: NoteComponentProcessor) {
        this.text = text;
        this.start = start;
        this.processor = processor;
    }
}


/** Defines the interface for an object which can identify and then create instances of a particular type of note component */
export interface NoteComponentProcessor {

    identify(text: string): NoteComponentInfo;

    /** Accepts a function which converts a NoteComponentInfo object into an actual NoteComponent that can be rendered */
    creator: (
        info: NoteComponentInfo,
        note: Note,
        save: () => Promise<void>,
        previous: NoteComponentInfo,
        next: NoteComponentInfo
    ) => NoteComponent;

    get componentShowsInlineInParagraph(): boolean;
}


/** Takes a note and a set of processors, returns an array of all the note components which make up that note's text */
export function splitNoteTextIntoComponents(
    note: Note,
    notu: Notu,
    componentProcessors: Array<NoteComponentProcessor>,
    defaultProcessor: NoteComponentProcessor
): Array<NoteComponent> {
    
    const componentInfos = recursiveSplitNoteText(note.text, note, componentProcessors, defaultProcessor);

    const components: Array<NoteComponent> = [];
    async function save(): Promise<void> {
        note.text = components.map(x => x.getText()).join('');
        await notu.saveNotes([note]);
    }

    let previous: NoteComponentInfo = null;
    let current: NoteComponentInfo = componentInfos[0] ?? null;
    let next: NoteComponentInfo = componentInfos[1] ?? null;
    for (let i = 0; i < componentInfos.length; i++) {
        components.push(current.processor.creator(current, note, save, previous, next));
        previous = current;
        current = next;
        next = componentInfos[i + 2] ?? null;
    }

    return components;
}

function recursiveSplitNoteText(
    text: string,
    note: Note,
    componentProcessors: Array<NoteComponentProcessor>,
    defaultProcessor: NoteComponentProcessor
): Array<NoteComponentInfo> {
    let componentInfo: NoteComponentInfo = null;
    for (const processor of componentProcessors) {
        componentInfo = processor.identify(text);
        if (!!componentInfo)
            break;
    }
    if (!componentInfo)
        return [new NoteComponentInfo(text, 0, defaultProcessor)];

    const output: Array<NoteComponentInfo> = [];
    if (componentInfo.start > 0)
        output.push(...recursiveSplitNoteText(text.substring(0, componentInfo.start), note, componentProcessors, defaultProcessor));
    output.push(componentInfo);
    if (componentInfo.end < text.length)
        output.push(...recursiveSplitNoteText(text.substring(componentInfo.end), note, componentProcessors, defaultProcessor));
    return output;
}