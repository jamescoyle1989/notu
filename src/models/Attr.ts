'use strict';

import ModelWithState from './ModelWithState';
import Space from './Space';
import Tag from './Tag';


const ATTR_TYPE = {
    TEXT: 'TEXT',
    NUMBER: 'NUMBER',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE'
};

export type AttrType = keyof typeof ATTR_TYPE;


export default class Attr extends ModelWithState<Attr> {
    constructor(name?: string, description?: string) {
        super();
        if (!!name)
            this.name = name;
        if (!!description)
            this.description = description;
    }
    
    
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

    private _description: string = '';
    get description(): string { return this._description; }
    set description(value: string) {
        if (value !== this._description) {
            this._description = value;
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


    private _space: Space = null;
    get space(): Space { return this._space; }
    set space(value: Space) {
        if (value !== this._space) {
            const idChanged = value?.id != this._space?.id;
            this._space = value;
            if (this.isClean && idChanged)
                this.dirty();
        }
    }

    in(space: Space): Attr {
        this.space = space;
        return this;
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


    duplicate(): Attr {
        const output = new Attr();
        output.id = this.id;
        output.name = this.name;
        output.description = this.description;
        output.type = this.type;
        output.space = this.space;
        output.color = this.color;
        output.state = this.state;
        return output;
    }


    validate(throwError: boolean = false): boolean {
        let output = null;

        if (!this.space)
            output = 'Attr must belong to a space.';
        else if (!this.isNew && this.id <= 0)
            output = 'Attr id must be greater than zero if in non-new state.';
        else if (!!this.color && !/^#?[A-z0-9]{6}$/.test(this.color))
            output = 'Tag color is invalid, must be a 6 character hexadecimal.';

        if (throwError && output != null)
            throw Error(output);

        return output == null;
    }


    get defaultValue(): any {
        switch (this.type) {
            case 'TEXT':
                return '';
            case 'NUMBER':
                return 0;
            case 'BOOLEAN':
                return false;
            case 'DATE':
                return new Date();
        }
    }


    getColorInt(): number {
        let hex = this.color;
        if (!hex)
            return null;
        if (hex.startsWith('#'))
            hex = hex.substring(1);
        return parseInt(hex, 16);
    }

    static getColorFromInt(color: number): string {
        return Tag.getColorFromInt(color);
    }


    toJSON() {
        return {
            state: this.state,
            id: this.id,
            name: this.name,
            description: this.description,
            type: this.type,
            spaceId: this.space?.id,
            color: this.color
        };
    }
}