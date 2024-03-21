import { Attr, Note, Space, Tag } from ".";

export function newNote(text?: string, id: number = null): Note {
    const output = new Note(text);
    output.id = id;
    return output;
}

export function newSpace(name?: string, id: number = null): Space {
    const output = new Space(name);
    output.id = id;
    return output;
}

export function newAttr(name?: string, id: number = null): Attr {
    const output = new Attr(name);
    output.id = id;
    return output;
}

export function newTag(name?: string, id: number = null): Tag {
    const output = new Tag(name);
    output.id = id;
    return output;
}