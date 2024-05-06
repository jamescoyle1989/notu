'use strict';

import ModelWithState from './ModelWithState';
import Attr from './Attr';
import Tag from './Tag';


export default class NoteAttr extends ModelWithState<NoteAttr> {
    constructor(attr: Attr, tag?: Tag, value?: any) {
        super();
        if (!attr)
            throw Error('Cannot instanciate new NoteAttr without a passed in attr.');
        if (attr.isNew)
            throw Error('Cannot create a NoteAttr object for an attr that hasn\'t been saved yet.');
        if (attr.isDeleted)
            throw Error('Cannot create a NoteAttr object for an attr marked as deleted.');
        this._attr = attr;
        if (!!tag) {
            if (tag.isNew)
                throw Error('Cannot create a NoteAttr object linked to a tag that hasn\'t been saved yet.');
            if (tag.isDeleted)
                throw Error('Cannot create a NoteAttr object linked to a tag marked as deleted.');
            this._tag = tag;
        }
        if (value != null && value != undefined)
            this._value = value;
        else
            this._value = attr.defaultValue;
    }
    
    
    private _tag: Tag = null;
    get tag(): Tag { return this._tag; }


    private _attr: Attr = null;
    get attr(): Attr { return this._attr; }


    private _value: any = null;
    get value(): any { return this._value; }
    set value(newVal: any) {
        if (this.attr.isDate && !(newVal instanceof Date))
            newVal = new Date(newVal);

        if (newVal != this._value) {
            this._value = newVal;
            if (this.isClean)
                this.dirty();
        }
    }

    withValue(value: any): NoteAttr {
        this.value = value;
        return this;
    }


    duplicate(): NoteAttr {
        return new NoteAttr(this.attr, this.tag, this.value);
    }


    validate(throwError: boolean = false): boolean {
        let output = null;

        if (throwError && output != null)
            throw Error(output);
        return output == null;
    }


    toJSON() {
        return {
            state: this.state,
            attrId: this.attr.id,
            tagId: this.tag.id,
            value: this.value
        };
    }
}