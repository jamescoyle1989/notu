'use strict';

import ModelWithState from "./ModelWithState";
import Space from "./Space";


export default class SpaceLink extends ModelWithState<SpaceLink> {
    private _name: string;
    get name(): string { return this._name; }
    set name(value: string) {
        if (value !== this._name) {
            this._name = value;
            if (this.isClean)
                this.dirty();
        }
    }


    private _toSpace: Space;
    get toSpace(): Space { return this._toSpace; }
    set toSpace(value: Space) {
        if (value?.id !== this._toSpace?.id) {
            if (value.isNew)
                throw Error('Cannot create a link to a space that hasn\'t been saved yet');
            if (value.isDeleted)
                throw Error('Cannot create a link to a space marked as deleted');
            this._toSpace = value;
            if (this.isClean)
                this.dirty();
        }
        else
            this._toSpace = value;
    }


    duplicate(): SpaceLink {
        const output = this.duplicateAsNew();
        output.state = this.state;
        return output;
    }

    duplicateAsNew(): SpaceLink {
        const output = new SpaceLink();
        output.name = this.name;
        output.toSpace = this.toSpace;
        return output;
    }


    toJSON() {
        return {
            state: this.state,
            name: this.name,
            toSpaceId: this.toSpace?.id
        }
    }
}