'use strict';

import ModelWithState from './ModelWithState';
import Tag from './Tag';
import Attr from './Attr';
import NoteAttr from './NoteAttr';


export default class NoteTag extends ModelWithState<NoteTag> {
    constructor(tag: Tag) {
        super();
        if (!tag)
            throw Error('Cannot instanciate new NoteTag without a passed in tag.');
        if (tag.isNew)
            throw Error('Cannot create a NoteTag object for a tag that hasn\'t been saved yet.');
        if (tag.isDeleted)
            throw Error('Cannot create a NoteTag object for a tag marked as deleted.');
        this._tag = tag;
    }


    private _tag: Tag;
    get tag(): Tag { return this._tag; }


    private _data: any;
    get data(): any { return this._data; }
    set data(value: any) {
        this._data = value;
        if (this.isClean)
            this.dirty();
    }
    withData(data: any): NoteTag {
        this.data = data;
        return this;
    }


    private _attrs: Array<NoteAttr> = [];
    get attrs(): Array<NoteAttr> { return this._attrs.filter(x => !x.isDeleted); }
    get attrsPendingDeletion(): Array<NoteAttr> { return this._attrs.filter(x => x.isDeleted); }

    addAttr(attr: Attr, value?: any): NoteTag {
        if (attr.isDeleted)
            throw Error('Cannot add an attribute marked as deleted.');
        if (attr.isNew)
            throw Error('Cannot add an attribute that hasn\'t yet been saved.');
        let na = this.attrs.find(x => x.attr.id == attr.id);
        if (!!na) {
            if (na.isDeleted)
                na.dirty();
            if (value != undefined)
                na.value = value;
            return this;
        }
        na = new NoteAttr(attr, this.tag, value);
        this._attrs.push(na);
        return this;
    }

    removeAttr(attr: Attr): NoteTag {
        const na = this._attrs.find(x => x.attr.id == attr.id);
        if (!na)
            return this;

        if (na.isNew)
            this._attrs = this._attrs.filter(x => x !== na);
        else
            na.delete();
        return this;
    }

    getAttr(attr: string | Attr): NoteAttr {
        if (attr instanceof Attr)
            attr = attr.name;

        return this.attrs.find(x => x.attr.name == attr);
    }

    getValue(attr: string | Attr): any {
        return this.getAttr(attr)?.value;
    }


    duplicate(): NoteTag {
        const output = this.duplicateAsNew();
        output.state = this.state;
        return output;
    }

    duplicateAsNew(): NoteTag {
        const output = new NoteTag(this.tag);
        if (!!this.data)
            output._data = JSON.parse(JSON.stringify(this.data));
        output._attrs = this.attrs.map(x => x.duplicateAsNew());
        return output;
    }


    validate(throwError: boolean = false): boolean {
        function exit(message: string): boolean {
            if (throwError && message != null)
                throw Error(message);
            return message == null;
        }

        if (!this.tag)
            return exit('NoteTag must have a tag set.');

        for (const na of this._attrs) {
            if (!na.validate(throwError))
                return false;
        }

        return true;
    }


    toJSON() {
        return {
            state: this.state,
            tagId: this.tag.id,
            data: this.data,
            attrs: this._attrs.map(x => x.toJSON())
        };
    }
}