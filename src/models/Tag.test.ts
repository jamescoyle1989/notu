import { expect, test } from 'vitest';
import Tag from './Tag';


test('Gets initiated as new', () => {
    const tag = new Tag();
    expect(tag.isNew).toBe(true);
});


test('Set id marks tag as dirty if currently clean', () => {
    const tag = new Tag().clean();
    tag.id = 123;
    expect(tag.isDirty).toBe(true);
});

test('Set id doesnt change tag state if new', () => {
    const tag = new Tag().new();
    tag.id = 123;
    expect(tag.isNew).toBe(true);
});

test('Set id doesnt change tag state if value not different', () => {
    const tag = new Tag().clean();
    tag.id = 0;
    expect(tag.isClean).toBe(true);
});


test('Set name marks tag as dirty if currently clean', () => {
    const tag = new Tag().clean();
    tag.name = 'asdf';
    expect(tag.isDirty).toBe(true);
});

test('Set name doesnt change tag state if new', () => {
    const tag = new Tag().new();
    tag.name = 'asdf';
    expect(tag.isNew).toBe(true);
});

test('Set name doesnt change tag state if value not different', () => {
    const tag = new Tag().clean();
    tag.name = '';
    expect(tag.isClean).toBe(true);
});

test('Tag can be initiated with name in constructor', () => {
    const tag = new Tag('hello');
    expect(tag.name).toBe('hello');
});

test('can duplicate itself', () => {
    const tag = new Tag('hello');
    const copy = tag.duplicate();
    expect(copy.id).toBe(tag.id);
    expect(copy.name).toBe(tag.name);
    expect(copy.state).toBe(tag.state);
});

test('validate fails if not new and id <= 0', () => {
    const model = new Tag().clean();
    model.id = 0;
    expect(model.validate()).toBe(false);
});

test('validate throws error if arg set to true', () => {
    const model = new Tag().clean();
    model.id = 0;
    expect(() => model.validate(true)).toThrowError();
});