'use strict';

import { NotuCache, Space } from '..';
import ModelWithState from './ModelWithState';


export default class Tag extends ModelWithState<Tag> {
    private _id: number = 0;
    get id(): number { return this._id; }
    set id(value: number) {
        if (!this.isNew)
            throw Error('Cannot change the id of a Tag once it has already been created.');
        this._id = value;
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

    in(space: Space): Tag {
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

    /** Returns the name of the tag along with the name of the space that it belongs to. */
    getFullName(): string {
        return `${this.space.name}.${this.name}`;
    }

    /** Returns the name of the tag, adds the name of the space only if different from the contextSpaceId passed in. */
    getQualifiedName(contextSpaceId: number): string {
        if (contextSpaceId == this.space?.id)
            return this.name;
        return this.getFullName();
    }

    /** Returns the name of the tag, if there are no other tags with the same name, otherwise returns the full name. */
    getUniqueName(cache: NotuCache): string {
        const sameNameTags = cache.getTagsByName(this.name);
        if (sameNameTags.length == 1)
            return this.name;
        return this.getFullName();
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


    private _availability: number = 0;
    get availability(): number { return this._availability; }
    set availability(value: number) {
        if (!this.isNew && value < this.availability)
            throw Error('Cannot change a tag to private once its already been saved.');
        if (value != this._availability) {
            this._availability = value;
            if (this.isClean)
                this.dirty();
        }
    }

    get isPrivate(): boolean { return this._availability == 0; }

    get isCommon(): boolean { return this._availability == 1; }

    get isPublic(): boolean { return this.availability == 2; }

    asPrivate(): Tag {
        this.availability = 0;
        return this;
    }

    asCommon(): Tag {
        this.availability = 1;
        return this;
    }

    asPublic(): Tag {
        this.availability = 2;
        return this;
    }


    links: Array<Tag> = [];

    linksTo(tag: Tag): boolean {
        return !!this.links.find(x => x == tag);
    }


    constructor(name: string = '') {
        super();
        this._name = name;
    }


    duplicate(): Tag {
        const output = this.duplicateAsNew();
        output.id = this.id;
        output.state = this.state;
        return output;
    }

    duplicateAsNew(): Tag {
        const output = new Tag(this.name);
        output.color = this.color;
        output.space = this.space;
        output.availability = this.availability;
        output.links = this.links.slice();
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


    toJSON() {
        return {
            state: this.state,
            id: this.id,
            name: this.name,
            spaceId: this.space?.id,
            color: this.color,
            availability: this.availability,
            links: this.links.map(x => x.id)
        };
    }
}