import Note from '../models/Note';

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
}