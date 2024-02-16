'use strict';

import Note from './Note';
import ModelWithState from './ModelWithState';
import Tag from './Tag';
import Attr from './Attr';
import NoteAttr from './NoteAttr';


export default class NoteTag extends ModelWithState<NoteTag> {
    constructor(note?: number | Note, tag?: number | Tag) {
        super();
        if (note != null && note != undefined) {
            if (typeof(note) === 'number')
                this.noteId = note;
            else
                this.note = note;
        }
        if (tag != null && tag != undefined) {
            if (typeof(tag) === 'number')
                this.tagId = tag;
            else
                this.tag = tag;
        }
    }
    
    
    private _noteId: number = 0;
    get noteId(): number { return this._noteId; }
    set noteId(value: number) {
        if (value !== this._noteId) {
            this._noteId = value;
            if (value !== this.note?.id ?? 0)
                this._note = null;
            if (this.isClean)
                this.dirty();
        }
    }

    private _note: Note = null;
    get note(): Note { return this._note; }
    set note(value: Note) {
        this._note = value;
        this.noteId = value?.id ?? 0;
    }


    private _tagId: number = 0;
    get tagId(): number { return this._tagId; }
    set tagId(value: number) {
        if (value !== this._tagId) {
            this._tagId = value;
            if (value !== this.tag?.id ?? 0)
                this._tag = null;
            if (this.isClean)
                this.dirty();
        }
    }

    private _tag: Tag = null;
    get tag(): Tag { return this._tag; }
    set tag(value: Tag) {
        this._tag = value;
        this.tagId = value?.id ?? 0;
    }


    get attrs(): Array<NoteAttr> {
        return this.note.attrs.filter(x => x.tagId == this.tagId);
    }

    addAttr(attr: Attr): NoteAttr {
        if (!this.note)
            throw new Error('Cannot call addAttr on NoteTag where note property has not been set');
        const na = this.note.addAttr(attr);
        na.tag = this.tag;
        return na;
    }


    duplicate(): NoteTag {
        const output = new NoteTag();
        output.noteId = this.noteId;
        output.tagId = this.tagId;
        return output;
    }


    validate(throwError: boolean = false): boolean {
        let output = null;

        if (this.noteId <= 0 && !this.isNew)
            output = 'NoteTag noteId must be greater than zero';
        else if (this.tagId <= 0)
            output = 'NoteTag tagId must be greater than zero';
        else if (this.noteId == this.tagId)
            output = 'NoteTag cannot link a note to its own tag';

        if (throwError && output != null)
            throw Error(output);
        return output == null;
    }


    toJSON() {
        return {
            state: this.state,
            noteId: this.noteId,
            tagId: this.tagId
        };
    }

    static fromJSON(json: any): NoteTag {
        const output = new NoteTag(json.noteId, json.tagId);
        output.state = json.state;
        return output;
    }
}