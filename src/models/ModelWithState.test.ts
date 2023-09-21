import { expect, test } from 'vitest';
import ModelWithState from './ModelWithState';


class TestModel extends ModelWithState<TestModel> {
}


test('state gets defaulted to new', () => {
    const model = new ModelWithState<TestModel>();
    expect(model.state).toBe('NEW');
});

test('clean() changes model state', () => {
    const model = new ModelWithState<TestModel>().clean();
    expect(model.state).toBe('CLEAN');
});

test('dirty() changes model state', () => {
    const model = new ModelWithState<TestModel>().dirty();
    expect(model.state).toBe('DIRTY');
});

test('delete() changes model state', () => {
    const model = new ModelWithState<TestModel>().delete();
    expect(model.state).toBe('DELETED');
});

test('new() changes model state', () => {
    const model = new ModelWithState<TestModel>().dirty().new();
    expect(model.state).toBe('NEW');
});

test('isNew returns correct value', () => {
    const model = new ModelWithState<TestModel>().new();
    expect(model.isNew).toBe(true);
    model.dirty();
    expect(model.isNew).toBe(false);
});

test('isClean returns correct value', () => {
    const model = new ModelWithState<TestModel>().new();
    expect(model.isClean).toBe(false);
    model.clean();
    expect(model.isClean).toBe(true);
});

test('isDirty returns correct value', () => {
    const model = new ModelWithState<TestModel>().new();
    expect(model.isDirty).toBe(false);
    model.dirty();
    expect(model.isDirty).toBe(true);
});

test('isDeleted returns correct value', () => {
    const model = new ModelWithState<TestModel>().new();
    expect(model.isDeleted).toBe(false);
    model.delete();
    expect(model.isDeleted).toBe(true);
});


test('validate does nothing', () => {
    const model = new ModelWithState<TestModel>().new();
    expect(model.validate()).toBe(true);
});