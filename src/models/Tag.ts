'use strict';

import ModelWithState from './ModelWithState';


export default class Tag extends ModelWithState<Tag> {
    private _id: number = 0;
    get id(): number { return this._id; }
    set id(value: number) {
        if (value !== this._id) {
            this._id = value;
            if (this.isClean)
                this.dirty();
        }
    }

    
    private _name: string = '';
    get name(): string { return this._name; }
    set name(value: string) {
        if (value !== this._name) {
            this._name = value;
            if (this.isClean)
                this.dirty();
        }
    }


    constructor(name: string = '') {
        super();
        this._name = name;
    }


    duplicate(): Tag {
        const output = new Tag();
        output.id = this.id;
        output.name = this.name;
        output.state = this.state;
        return output;
    }


    validate(throwError: boolean = false): boolean {
        let output = null;

        if (!this.isNew && this.id <= 0)
            output = 'Tag id must be greater than zero if in non-new state.';
        else if (!this.name || !/^[a-zA-Z][a-zA-Z0-9 ]*[a-zA-Z0-9]?$/.test(this.name))
            output = 'Note name is invalid, must only contain letters, numbers, and spaces, starting with a letter';

        if (throwError && output != null)
            throw Error(output);
        return output == null;
    }
}