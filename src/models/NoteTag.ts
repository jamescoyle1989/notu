'use strict';

import ModelWithState from './ModelWithState';
import Tag from './Tag';


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


    duplicate(): NoteTag {
        const output = this.duplicateAsNew();
        output.state = this.state;
        return output;
    }

    duplicateAsNew(): NoteTag {
        const output = new NoteTag(this.tag);
        if (!!this.data)
            output._data = JSON.parse(JSON.stringify(this.data));
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

        return true;
    }


    toJSON() {
        return {
            state: this.state,
            tagId: this.tag.id,
            data: this.data
        };
    }
}