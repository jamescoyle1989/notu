'use strict';


const MODEL_STATE = {
    NEW: 'NEW',
    CLEAN: 'CLEAN',
    DIRTY: 'DIRTY',
    DELETED: 'DELETED'
};

export type ModelState = keyof typeof MODEL_STATE;


export default class ModelWithState<T extends ModelWithState<T>> {
    state: ModelState = 'NEW';

    new(): T {
        this.state = 'NEW';
        return (this as any) as T;
    }

    clean(): T {
        this.state = 'CLEAN';
        return (this as any) as T;
    }

    dirty(): T {
        this.state = 'DIRTY';
        return (this as any) as T;
    }

    delete(): T {
        this.state = 'DELETED';
        return (this as any) as T;
    }

    get isNew(): boolean {
        return this.state == 'NEW';
    }

    get isClean(): boolean {
        return this.state == 'CLEAN';
    }

    get isDirty(): boolean {
        return this.state == 'DIRTY';
    }

    get isDeleted(): boolean {
        return this.state == 'DELETED';
    }


    validate(throwError: boolean = false): boolean {
        return true;
    }
}