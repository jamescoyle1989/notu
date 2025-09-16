'use strict';

import ModelWithState from "./ModelWithState";
import Space from "./Space";


export default class Page extends ModelWithState<Page> {

    private _id: number = 0;
    get id(): number { return this._id; }
    set id(value: number) {
        if (!this.isNew)
            throw Error('Cannot change the id of a Page once it has already been created.');
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


    private _order: number = 0;
    get order(): number { return this._order; }
    set order(value: number) {
        if (value !== this._order) {
            this._order = value;
            if (this.isClean)
                this.dirty();
        }
    }


    private _group: string = null;
    get group(): string { return this._group; }
    set group(value: string) {
        if (value !== this._group) {
            this._group = value;
            if (this.isClean)
                this.dirty();
        }
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


    private _query: string = null;
    get query(): string { return this._query; }
    set query(value: string) {
        if (value !== this._query) {
            this._query = value;
            if (this.isClean)
                this.dirty();
        }
    }


    toJSON() {
        return {
            state: this.state,
            id: this.id,
            name: this.name,
            order: this.order,
            group: this.group,
            spaceId: this.space?.id,
            query: this.query
        };
    }
}