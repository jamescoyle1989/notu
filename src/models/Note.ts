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


    private _spaceId: number = 0;
    get spaceId(): number { return this._spaceId; }
    set spaceId(value: number) {
        if (value !== this._spaceId) {
            this._spaceId = value;
            if (value !== this.space?.id ?? 0)
                this._space = null;
            if (this.isClean)
                this.dirty();
            this._setOwnTagSpace();
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
            this._setOwnTagSpace();
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

    private _setOwnTagSpace(): void {
        if (!this.ownTag)
            return;
        if (!!this.space)
            this.ownTag.space = this.space;
        else
            this.ownTag.spaceId = this.spaceId;
    }


    private _tags: Array<NoteTag> = [];
    get tags(): Array<NoteTag> { return this._tags.filter(x => !x.isDeleted); }

    addTag(tag: Tag): NoteTag {
        if (tag.isDeleted)
            throw Error('Cannot add a tag marked as deleted to a note');
        if (tag.isNew)
            throw Error('Cannot add a tag that hasn\'t yet been saved to a note');
        if (tag.id == this.id)
            throw Error('Note cannot add its own tag as a linked tag');
        if (!tag.isPublic && tag.spaceId != this.spaceId)
            throw Error('Cannot add a private tag from another space');
        let nt = this._tags.find(x => x.tagId == tag.id);
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
        const nt = this._tags.find(x => x.tagId == tag.id);
        if (!nt)
            return this;

        if (nt.isNew)
            this._tags = this._tags.filter(x => x !== nt);
        else
            nt.delete();
        for (const na of this._attrs.filter(x => !x.isDeleted && x.tagId == tag.id))
            this.removeAttr(na.attr, na.tag);
        return this;
    }

    getTag(tag: string | Tag, space: number | Space = null): NoteTag {
        if (tag instanceof Tag)
            tag = tag.name;
        if (!!space && (space instanceof Space))
            space = space.id;

        if (space != null)
            return this.tags.find(x => x.tag.name == tag && x.tag.spaceId == space);

        return this.tags.find(x => x.tag.name == tag && x.tag.spaceId == this.spaceId);
    }


    private _attrs: Array<NoteAttr> = [];
    get attrs(): Array<NoteAttr> { return this._attrs.filter(x => !x.isDeleted); }

    addAttr(attr: Attr): NoteAttr {
        if (attr.isDeleted)
            throw Error('Cannot add an attribute marked as deleted to a note');
        if (attr.isNew)
            throw Error('Cannot add an attribute that hasn\'t yet been saved to a note');
        const na = new NoteAttr(this, attr);
        this._attrs.push(na);
        return na;
    }

    removeAttr(attr: Attr, tag: Tag = null): Note {
        const na = this._attrs.find(x => x.attrId == attr.id && x.tagId == tag?.id);
        if (!na)
            return this;

        if (na.isNew)
            this._attrs = this._attrs.filter(x => x !== na);
        else
            na.delete();
        return this;
    }

    getValue(attr: string | Attr): any {
        if (attr instanceof Attr)
            attr = attr.name;

        return this.attrs.find(x => !x.tag && x.attr.name == attr)?.value;
    }

    getAttr(attr: string | Attr): NoteAttr {
        if (attr instanceof Attr)
            attr = attr.name;

        return this.attrs.find(x => !x.tag && x.attr.name == attr);
    }


    duplicate(): Note {
        const output = new Note();
        output.id = this.id;
        output.date = this.date;
        output.text = this.text;
        if (!!this.space)
            output.space = this.space;
        else
            output.spaceId = this.spaceId;
        output._tags = this.tags.map(x => { 
            const ntCopy = x.duplicate();
            ntCopy.note = output;
            return ntCopy;
        });
        output._attrs = this.attrs.map(x => {
            const naCopy = x.duplicate();
            naCopy.note = output;
            return naCopy;
        });
        if (!!this.ownTag)
            output.setOwnTag(this.ownTag.duplicate());
        output.state = this.state;
        return output;
    }


    toJSON() {
        return {
            state: this.state,
            id: this.id,
            date: this.date,
            text: this.text,
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
        output.spaceId = json.spaceId;
        if (!!json.ownTag)
            output.setOwnTag(Tag.fromJSON(json.ownTag));
        if (!!json.tags) {
            output._tags = json.tags.map(x => NoteTag.fromJSON(x));
            for (const nt of output._tags)
                nt.note = output;
        }
        if (!!json.attrs) {
            output._attrs = json.attrs.map(x => NoteAttr.fromJSON(x));
            for (const na of output._attrs)
                na.note = output;
        }
        output.state = json.state;
        return output;
    }


    validate(throwError: boolean = false): boolean {
        let output = null;

        if (this.spaceId <= 0)
            output = 'Note spaceId must be greater than zero.';
        else if (!this.isNew && this.id <= 0)
            output = 'Note id must be greater than zero if in non-new state.';
        else if (!!this.ownTag && this.ownTag.spaceId != this.spaceId)
            output = 'Note cannot belong to a different space than its own tag';

        const survivingAttrs = this._attrs.filter(x => !x.isDeleted);
        for (let i = 0; i < survivingAttrs.length; i++) {
            const na = survivingAttrs[i];
            for (let j = i + 1; j < survivingAttrs.length; j++) {
                const na2 = survivingAttrs[j];
                if (na.attrId == na2.attrId && na.tagId == na2.tagId)
                    output = `Attr '${na.attr.name}' is duplicated.`;
            }
        }

        if (throwError && output != null)
            throw Error(output);

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

        return output == null;
    }
}