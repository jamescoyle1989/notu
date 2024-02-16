'use strict';

import ModelWithState from './ModelWithState';


export default class Space extends ModelWithState<Space> {
    id: number = 0;

    
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


    duplicate(): Space {
        const output = new Space();
        output.id = this.id;
        output.name = this.name;
        output.state = this.state;
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
            name: this.name
        }
    }


    static fromJSON(json: any): Space {
        const output = new Space(json.name);
        output.id = json.id;
        output.state = json.state;
        return output;
    }
}