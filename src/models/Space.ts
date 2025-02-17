'use strict';

import ModelWithState from './ModelWithState';


export default class Space extends ModelWithState<Space> {

    private _id: number = 0;
    get id(): number { return this._id; }
    set id(value: number) {
        if (!this.isNew)
            throw Error('Cannot change the id of a Space once it has already been created.');
        this._id = value;
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


    private _version: string = '0.0.1';
    get version(): string { return this._version; }
    set version(value: string) {
        if (value !== this._version) {
            this._version = value;
            if (this.isClean)
                this.dirty();
        }
    }

    v(version: string): Space {
        this.version = version;
        return this;
    }


    private _useCommonSpace: boolean = false;
    get useCommonSpace(): boolean { return this._useCommonSpace; }
    set useCommonSpace(value: boolean) {
        if (value !== this._useCommonSpace) {
            this._useCommonSpace = value;
            if (this.isClean)
                this.dirty();
        }
    }


    constructor(name: string = '') {
        super();
        this._name = name;
    }


    duplicate(): Space {
        const output = this.duplicateAsNew();
        output.id = this.id;
        output.state = this.state;
        return output;
    }

    duplicateAsNew(): Space {
        const output = new Space();
        output.name = this.name;
        output.version = this.version;
        output.useCommonSpace = this.useCommonSpace;
        return output;
    }


    validate(throwError: boolean = false): boolean {
        let output = null;

        if (!this.isNew && this.id <= 0)
            output = 'Space id must be greater than zero if in non-new state.';

        if (throwError && output != null)
            throw Error(output);
        return output == null;
    }


    toJSON() {
        return {
            state: this.state,
            id: this.id,
            name: this.name,
            version: this.version,
            useCommonSpace: this.useCommonSpace
        }
    }
}