'use strict';

import { Space } from '..';
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

    in(space: number | Space): Tag {
        if (typeof(space) === 'number')
            this.spaceId = space;
        else
            this.space = space;
        return this;
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

    getQualifiedName(contextSpaceId: number): string {
        if (contextSpaceId == this.spaceId)
            return this.name;
        return `${this.space.name}.${this.name}`;
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


    private _isPublic: boolean = true;
    get isPublic(): boolean { return this._isPublic; }
    set isPublic(value: boolean) {
        if (value !== this._isPublic) {
            this._isPublic = value;
            if (this.isClean)
                this.dirty();
        }
    }

    asPublic(): Tag {
        this.isPublic = true;
        return this;
    }
    asPrivate(): Tag {
        this.isPublic = false;
        return this;
    }


    constructor(name: string = '') {
        super();
        this._name = name;
    }


    duplicate(): Tag {
        const output = new Tag(this.name);
        output.id = this.id;
        output.state = this.state;
        output.color = this.color;
        output.space = this.space;
        output.isPublic = this.isPublic;
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


    toJSON() {
        return {
            state: this.state,
            id: this.id,
            name: this.name,
            spaceId: this.spaceId,
            color: this.color,
            isPublic: this.isPublic
        };
    }


    static fromJSON(json: any) {
        const output = new Tag(json.name);
        output.id = json.id;
        output.spaceId = json.spaceId;
        output.color = json.color;
        output.isPublic = json.isPublic;
        output.state = json.state;
        return output;
    }
}