'use strict';

import ModelWithState from './ModelWithState';
import Space from './Space';


const ATTR_TYPE = {
    TEXT: 'TEXT',
    NUMBER: 'NUMBER',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE'
};

export type AttrType = keyof typeof ATTR_TYPE;


export default class Attr extends ModelWithState<Attr> {
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

    private _type: AttrType = 'TEXT';
    get type(): AttrType { return this._type; }
    set type(value: AttrType) {
        if (!this.isNew)
            throw Error('Cannot change an attribute\'s type once it has been created.');
        this._type = value;
    }

    get isText(): boolean { return this.type == 'TEXT'; }

    get isNumber(): boolean { return this.type == 'NUMBER'; }

    get isBoolean(): boolean { return this.type == 'BOOLEAN'; }

    get isDate(): boolean { return this.type == 'DATE'; }

    asText(): Attr {
        this.type = 'TEXT';
        return this;
    }

    asNumber(): Attr {
        this.type = 'NUMBER';
        return this;
    }

    asBoolean(): Attr {
        this.type = 'BOOLEAN';
        return this;
    }

    asDate(): Attr {
        this.type = 'DATE';
        return this;
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


    duplicate(): Attr {
        const output = new Attr();
        output.id = this.id;
        output.name = this.name;
        output.type = this.type;
        output.space = this.space;
        return output;
    }


    validate(throwError: boolean = false): boolean {
        let output = null;

        if (this.spaceId <= 0)
            output = 'Note spaceId must be greater than zero.';
        else if (!this.isNew && this.id <= 0)
            output = 'Attr id must be greater than zero if in non-new state.';

        if (throwError && output != null)
            throw Error(output);

        return output == null;
    }
}