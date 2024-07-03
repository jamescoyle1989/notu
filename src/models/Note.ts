'use strict';

import ModelWithState from './ModelWithState';
import NoteAttr from './NoteAttr';
import NoteTag from './NoteTag';
import Space from './Space';
import Tag from './Tag';
import Attr from './Attr';


export default class Note extends ModelWithState<Note> {

    constructor(text?: string, ownTag?: Tag) {
        super();
        if (!!text)
            this.text = text;
        this._ownTag = ownTag;
    }
    
    
    private _id: number = 0;
    get id(): number { return this._id; }
    set id(value: number) {
        if (!this.isNew)
            throw Error('Cannot change the id of a Note once it has already been created.');
        this._id = value;
        if (!!this.ownTag && this.ownTag.id != value)
            this.ownTag.id = value;
    }


    private _date: Date = new Date();
    get date(): Date { return this._date; }
    set date(value: Date) {
        if (value !== this._date) {
            this._date = value;
            if (this.isClean)
                this.dirty();
        }
    }

    at(value: Date): Note {
        this.date = value;
        return this;
    }


    private _text: string = '';
    get text(): string { return this._text; }
    set text(value: string) {
        if (value !== this._text) {
            this._text = value;
            if (this.isClean)
                this.dirty();
        }
    }


    private _space: Space = null;
    get space(): Space { return this._space; }
    set space(value: Space) {
        if (value !== this._space) {
            const idChanged = value?.id != this._space?.id;
            this._space = value;
            if (this.isClean && idChanged)
                this.dirty();
            this._setOwnTagSpace();
        }
    }

    in(space: Space): Note {
        this.space = space;
        return this;
    }


    private _ownTag: Tag = null;
    get ownTag(): Tag { return this._ownTag; }

    setOwnTag(tagName: string): Note {
        if (this.ownTag == null) {
            this._ownTag = new Tag(tagName);
            this.ownTag.id = this.id;
        }
        else if (this.ownTag.isDeleted)
            this.ownTag.dirty();
        this.ownTag.name = tagName;
        this._setOwnTagSpace();
        return this;
    }

    removeOwnTag(): Note {
        if (!this.ownTag)
            return this;
        if (this.ownTag.isNew)
            this._ownTag = null;
        else
            this.ownTag.delete();
        return this;
    }

    private _setOwnTagSpace(): void {
        if (!this.ownTag)
            return;
        if (!!this.space)
            this.ownTag.space = this.space;
    }


    private _tags: Array<NoteTag> = [];
    get tags(): Array<NoteTag> { return this._tags.filter(x => !x.isDeleted); }
    get tagsPendingDeletion(): Array<NoteTag> { return this._tags.filter(x => x.isDeleted); }

    addTag(tag: Tag): NoteTag {
        if (tag.isDeleted)
            throw Error('Cannot add a tag marked as deleted to a note');
        if (tag.isNew)
            throw Error('Cannot add a tag that hasn\'t yet been saved to a note');
        if (tag.id == this.id)
            throw Error('Note cannot add its own tag as a linked tag');
        if (!tag.isPublic && tag.space.id != this.space.id)
            throw Error('Cannot add a private tag from another space');
        let nt = this._tags.find(x => x.tag.id == tag.id);
        if (!!nt) {
            if (nt.isDeleted)
                nt.dirty();
            return nt;
        }
        nt = new NoteTag(tag);
        this._tags.push(nt);
        return nt;
    }

    removeTag(tag: Tag): Note {
        const nt = this._tags.find(x => x.tag.id == tag.id);
        if (!nt)
            return this;

        if (nt.isNew)
            this._tags = this._tags.filter(x => x !== nt);
        else
            nt.delete();
        return this;
    }

    getTag(tag: string | Tag, space: number | Space = null): NoteTag {
        if (tag instanceof Tag)
            return this.tags.find(x => x.tag === tag);
        if (!!space && (space instanceof Space))
            space = space.id;

        if (space != null)
            return this.tags.find(x => x.tag.name == tag && x.tag.space.id == space);

        return this.tags.find(x => x.tag.name == tag && x.tag.space.id == this.space.id);
    }


    private _attrs: Array<NoteAttr> = [];
    get attrs(): Array<NoteAttr> { return this._attrs.filter(x => !x.isDeleted); }
    get attrsPendingDeletion(): Array<NoteAttr> { return this._attrs.filter(x => x.isDeleted); }

    addAttr(attr: Attr, value?: any): Note {
        if (attr.isDeleted)
            throw Error('Cannot add an attribute marked as deleted to a note');
        if (attr.isNew)
            throw Error('Cannot add an attribute that hasn\'t yet been saved to a note');
        let na = this.attrs.find(x => x.attr.id == attr.id);
        if (!!na) {
            if (na.isDeleted)
                na.dirty();
            if (value != undefined)
                na.value = value;
            return this;
        }
        na = new NoteAttr(attr, null, value);
        this._attrs.push(na);
        return this;
    }

    removeAttr(attr: Attr): Note {
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


    duplicate(): Note {
        const output = new Note(this.text, this.ownTag?.duplicate())
            .at(this.date).in(this.space);
        output._attrs = this.attrs.map(x => x.duplicate());
        output._tags = this.tags.map(x => x.duplicate());
        output.id = this.id;
        output.state = this.state;
        return output;
    }

    duplicateAsNew(): Note {
        const output = new Note(this.text)
            .at(this.date).in(this.space);
        output._attrs = this.attrs.map(x => x.duplicateAsNew());
        output._tags = this.tags.map(x => x.duplicateAsNew());
        return output;
    }


    toJSON() {
        return {
            state: this.state,
            id: this.id,
            date: this.date,
            text: this.text,
            spaceId: this.space.id,
            ownTag: this.ownTag?.toJSON(),
            tags: this._tags.map(x => x.toJSON()),
            attrs: this._attrs.map(x => x.toJSON())
        }
    }


    validate(throwError: boolean = false): boolean {
        function exit(message: string): boolean {
            if (throwError && message != null)
                throw Error(message);
            return message == null;
        }

        if (!this.space)
            return exit('Note must belong to a space.');
        else if (!this.isNew && this.id <= 0)
            return exit('Note id must be greater than zero if in non-new state.');
        else if (!!this.ownTag && this.ownTag.space.id != this.space.id)
            return exit('Note cannot belong to a different space than its own tag');

        const survivingAttrs = this.attrs;
        for (let i = 0; i < survivingAttrs.length; i++) {
            const na = survivingAttrs[i];
            for (let j = i + 1; j < survivingAttrs.length; j++) {
                const na2 = survivingAttrs[j];
                if (na.attr.id == na2.attr.id)
                    return exit(`Attr '${na.attr.name}' is duplicated.`);
            }
        }

        if (!!this.ownTag && !this.ownTag.validate(throwError))
            return false;
        for (const nt of this._tags) {
            if (!nt.validate(throwError))
                return false;
        }
        for (const na of this._attrs) {
            if (!na.validate(throwError))
                return false;
        }

        return true;
    }
}