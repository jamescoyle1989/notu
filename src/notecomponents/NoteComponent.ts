import Note from '../models/Note';
import { Notu } from '../services/Notu';
import { NmlElement, parseNml } from './NmlParser';

/** The base interface that all note components must implement */
export interface NoteComponent {

    /** Gets the text which would be used for saving the current state of the note component's contents */
    getText(): string;

    /** Returns some text data about what type of text component this is */
    get typeInfo(): string;

    get displaysInline(): boolean;

    get displaysInlineForEdit(): boolean;

    getThisPlusAllChildComponents(): Array<NoteComponent>
}


/** Defines the interface for an object which can identify and then create instances of a particular type of note component */
export interface NoteComponentProcessor {

    get displayName(): string;

    get tagName(): string;

    newComponentText(contentText: string): string;

    /** Accepts a function which converts a NoteComponentInfo object into an actual NoteComponent that can be rendered */
    create(
        data: NmlElement,
        note: Note,
        save: () => Promise<void>,
        childComponentFactory: (childElement: string | NmlElement) => NoteComponent
    ): NoteComponent;
}


/** Takes a note and a set of processors, returns an array of all the note components which make up that note's text */
export function splitNoteTextIntoComponents(
    note: Note,
    notu: Notu,
    forEdit: boolean,
    componentProcessors: Array<NoteComponentProcessor>,
    textComponentFactory: (text: string) => NoteComponent,
    paragraphComponentFactory: (components: Array<NoteComponent>) => NoteComponent
): Array<NoteComponent> {

    const xmlData = parseNml(note.text);
    
    const components: Array<NoteComponent> = [];
    async function save(): Promise<void> {
        note.text = components.map(x => x.getText()).join('');
        await notu.saveNotes([note]);
    }

    function displaysInline(comp: NoteComponent): boolean {
        return (
            (!forEdit && comp.displaysInline) ||
            (forEdit && comp.displaysInlineForEdit)
        );
    }

    const ungroupedComponents: Array<NoteComponent> = [];
    for (const item of xmlData) {
        ungroupedComponents.push(
            getComponentFromXmlElement(item, componentProcessors, textComponentFactory, note, save)
        );
    }

    for (let groupStart = 0; groupStart < ungroupedComponents.length; groupStart++) {
        const startComp = ungroupedComponents[groupStart];
        if (!displaysInline(startComp)) {
            components.push(startComp);
            continue;
        }
        for (let groupEnd = groupStart; groupEnd <= ungroupedComponents.length; groupEnd++) {
            const endComp = ungroupedComponents[groupEnd];
            if (!endComp || !displaysInline(endComp)) {
                const groupedComps = ungroupedComponents.slice(groupStart, groupEnd);
                components.push(paragraphComponentFactory(groupedComps));
                groupStart = groupEnd - 1;
                break;
            }
        }
    }

    return components;
}


function getComponentFromXmlElement(
    element: string | NmlElement,
    componentProcessors: Array<NoteComponentProcessor>,
    textComponentFactory: (text: string) => NoteComponent,
    note: Note,
    save: () => Promise<void>
) {
    if (typeof element === 'string')
        return textComponentFactory(element);

    for (const processor of componentProcessors) {
        if (processor.tagName == element.tag) {
            return processor.create(
                element,
                note,
                save,
                childElement => getComponentFromXmlElement(childElement, componentProcessors, textComponentFactory, note, save)
            );
        }
    }
    return textComponentFactory(element.fullText);
}