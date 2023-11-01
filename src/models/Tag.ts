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


    private _color: string = null;
    get color(): string { return this._color; }
    set color(value: string) {
        if (value !== this._color) {
            this._color = value;
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
            output = 'Tag name is invalid, must only contain letters, numbers, and spaces, starting with a letter';
        else if (!!this.color && !/^#?[A-z0-9]{6}$/.test(this.color))
            output = 'Tag color is invalid, must be a 6 character hexadecimal.';

        if (throwError && output != null)
            throw Error(output);
        return output == null;
    }


    getColorInt(): number {
        let hex = this.color;
        if (!hex)
            return null;
        if (hex.startsWith('#'))
            hex = hex.substring(1);
        return parseInt(hex, 16);
    }
}