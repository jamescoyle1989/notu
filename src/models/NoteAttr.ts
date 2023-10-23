'use strict';

import ModelWithState from './ModelWithState';
import Note from './Note';
import Attr from './Attr';
import Tag from './Tag';


export default class NoteAttr extends ModelWithState<NoteAttr> {
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


    private _attrId: number = 0;
    get attrId(): number { return this._attrId; }
    set attrId(value: number) {
        if (value !== this._attrId) {
            this._attrId = value;
            if (value !== this.attr?.id ?? 0)
                this._attr = null;
            if (this.isClean)
                this.dirty();
        }
    }

    private _attr: Attr = null;
    get attr(): Attr { return this._attr; }
    set attr(newAttr: Attr) {
        const oldAttr = this._attr;
        this._attr = newAttr;
        if (!!newAttr) {
            if (!oldAttr || newAttr.type != oldAttr.type)
                this.value = newAttr.defaultValue;
        }
        else
            this.value = null;
        this.attrId = newAttr?.id ?? 0;
    }


    private _value: any = null;
    get value(): any { return this._value; }
    set value(newVal: any) {
        if (newVal != this._value) {
            this._value = newVal;
            if (this.isClean)
                this.dirty();
        }
    }


    private _tagId: number = null;
    get tagId(): number { return this._tagId; }
    set tagId(value: number) {
        if (value !== this._tagId) {
            this._tagId = value;
            if (value !== this.tag?.id)
                this._tag = null;
            if (this.isClean)
                this.dirty();
        }
    }

    private _tag: Tag = null;
    get tag(): Tag { return this._tag; }
    set tag(value: Tag) {
        this._tag = value;
        this.tagId = value?.id ?? null;
    }


    duplicate(): NoteAttr {
        const output = new NoteAttr();
        output.noteId = this.noteId;
        output.note = this.note;
        output.attrId = this.attrId;
        output.attr = this.attr;
        output.tagId = this.tagId;
        output.tag = this.tag;
        output.value = this.value;
        return output;
    }


    validate(throwError: boolean = false): boolean {
        let output = null;

        if (this.noteId <= 0 && !this.isNew)
            output = 'NoteAttr noteId must be greater than zero';
        else if (this.attrId <= 0)
            output = 'NoteAttr attrId must be greater than zero';

        if (throwError && output != null)
            throw Error(output);
        return output == null;
    }
}