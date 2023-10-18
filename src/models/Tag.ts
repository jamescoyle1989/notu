'use strict';

import Note from './Note';


export default class Tag {
    private _note: Note = null;

    get id(): number { return this._note.id; }

    get name(): string { return this._note.name; }

    constructor(note: Note) {
        if (!note)
            throw Error('Tag constructor must take a note object');
        this._note = note;
    }


    duplicate(): Tag {
        return new Tag(this._note.duplicate());
    }
}