'use strict';

import ModelWithState from './ModelWithState';
import NoteAttr from './NoteAttr';
import NoteTag from './NoteTag';
import Space from './Space';
import Tag from './Tag';
import Attr from './Attr';


export default class Note extends ModelWithState<Note> {
    constructor(text?: string) {
        super();
        if (!!text)
            this.text = text;
    }
    
    
    private _id: number = 0;
    get id(): number { return this._id; }
    set id(value: number) {
        this._id = value;
        if (!!this.ownTag)
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


    private _archived: boolean = false;
    get archived(): boolean { return this._archived; }
    set archived(value: boolean) {
        if (value !== this._archived) {
            this._archived = value;
            if (this.isClean)
                this.dirty();
        }
    }


    private _spaceId: number = 0;
    get spaceId(): number { return this._spaceId; }
    set spaceId(value: number) {
        if (value !== this._spaceId) {
            this._spaceId = value;
            if (value !== this.space?.id ?? 0)
                this._space = null;
            if (this.isClean)
                this.dirty();
        }
    }

    private _space: Space = null;
    get space(): Space { return this._space; }
    set space(value: Space) {
        this._space = value;
        this.spaceId = value?.id ?? 0;
    }

    in(space: number | Space): Note {
        if (typeof(space) === 'number')
            this.spaceId = space;
        else
            this.space = space;
        return this;
    }


    private _ownTag: Tag = null;
    get ownTag(): Tag { return this._ownTag; }

    setOwnTag(tag: string | Tag): Note {
        if (typeof tag === 'string') {
            if (this.ownTag == null)
                this._ownTag = new Tag();
            this.ownTag.name = tag;
            this.ownTag.id = this.id;
        }
        else {
            if (!!this.ownTag)
                throw new Error('Note has already had its tag set. If you would like to change the tag name, call setTag with just a string specifying the new tag name.');
            if (tag.id != 0 && tag.id != this.id)
                throw new Error('Attempted to set tag to note with non-matching ID. Added tag id must either match the note id, which indicates that the tag has already been added to the note. Otherwise the tag id must be zero, indicating that the tag still needs to be added.')
            this._ownTag = tag;
        }
        return this;
    }

    removeOwnTag(): Note {
        if (!this.ownTag)
            return;
        if (this.ownTag.isNew)
            this._ownTag = null;
        else
            this.ownTag.delete();
    }


    private _tags: Array<NoteTag> = [];
    get tags(): Array<NoteTag> { return this._tags; }

    addTag(tag: Tag): NoteTag {
        if (tag.isDeleted)
            throw Error('Cannot add a tag marked as deleted to a note');
        if (tag.isNew)
            throw Error('Cannot add a tag that hasn\'t yet been saved to a note');
        if (tag.id == this.id)
            throw Error('Note cannot add its own tag as a linked tag');
        let nt = this.tags.find(x => x.tagId == tag.id);
        if (!!nt) {
            if (nt.isDeleted)
                nt.dirty();
            return nt;
        }
        nt = new NoteTag();
        nt.note = this;
        nt.tag = tag;
        this._tags.push(nt);
        return nt;
    }

    removeTag(tag: Tag): Note {
        const nt = this.tags.find(x => x.tagId == tag.id);
        if (!nt)
            return this;

        if (nt.isNew)
            this._tags = this._tags.filter(x => x !== nt);
        else
            nt.delete();
        return this;
    }


    private _attrs: Array<NoteAttr> = [];
    get attrs(): Array<NoteAttr> { return this._attrs; }

    addAttr(attr: Attr): NoteAttr {
        if (attr.isDeleted)
            throw Error('Cannot add an attribute marked as deleted to a note');
        if (attr.isNew)
            throw Error('Cannot add an attribute that hasn\'t yet been saved to a note');
        let na = this.attrs.find(x => x.attrId == attr.id);
        if (!!na) {
            if (na.isDeleted)
                na.dirty();
            return na;
        }
        na = new NoteAttr();
        na.note = this;
        na.attr = attr;
        this._attrs.push(na);
        return na;
    }

    removeAttr(attr: Attr): Note {
        const na = this.attrs.find(x => x.attrId == attr.id);
        if (!na)
            return this;

        if (na.isNew)
            this._attrs = this._attrs.filter(x => x !== na);
        else
            na.delete();
        return this;
    }


    duplicate(): Note {
        const output = new Note();
        output.id = this.id;
        output.date = this.date;
        output.text = this.text;
        output.archived = this.archived;
        output.space = this.space;
        output.state = this.state;
        return output;
    }


    toJSON() {
        return {
            state: this.state,
            id: this.id,
            date: this.date,
            text: this.text,
            archived: this.archived,
            spaceId: this.spaceId,
            ownTag: this.ownTag,
            tags: this.tags,
            attrs: this.attrs
        }
    }


    static fromJSON(json: any): Note {
        const output = new Note(json.text);
        output.id = json.id;
        output.date = new Date(json.date);
        output.archived = json.archived;
        output.spaceId = json.spaceId;
        if (json.ownTag != undefined)
            output.setOwnTag(Tag.fromJSON(json.ownTag));
        output._tags = json.tags.map(x => NoteTag.fromJSON(x));
        output._attrs = json.attrs.map(x => NoteAttr.fromJSON(x));
        output.state = json.state;
        return output;
    }


    validate(throwError: boolean = false): boolean {
        let output = null;

        if (this.spaceId <= 0)
            output = 'Note spaceId must be greater than zero.';
        else if (!this.isNew && this.id <= 0)
            output = 'Note id must be greater than zero if in non-new state.';

        if (throwError && output != null)
            throw Error(output);

        if (!!this.ownTag && !this.ownTag.validate(throwError))
            return false;
        for (const nt of this.tags) {
            if (!nt.validate(throwError))
                return false;
        }
        for (const na of this.attrs) {
            if (!na.validate(throwError))
                return false;
        }

        return output == null;
    }
}