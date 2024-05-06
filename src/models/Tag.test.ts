import { expect, test } from 'vitest';
import Tag from './Tag';
import { newTag } from '../TestHelpers';


test('Gets initiated as new', () => {
    const tag = new Tag();
    expect(tag.isNew).toBe(true);
});


test('Set id doesnt change tag state if new', () => {
    const tag = new Tag().new();
    tag.id = 123;
    expect(tag.isNew).toBe(true);
});

test('Set id throws error if tag not new', () => {
    const tag = newTag('Test', 1).clean();
    expect(() => tag.id = 2).toThrow();
});


test('Set space property handles null value being passed in', () => {
    const tag = new Tag('Test').clean();
    tag.space = null;
    expect(tag.space).toBe(null);
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


test('Set color marks tag as dirty if currently clean', () => {
    const tag = new Tag().clean();
    tag.color = '112233';
    expect(tag.isDirty).toBe(true);
});

test('Set color doesnt change tag state if new', () => {
    const tag = new Tag().new();
    tag.color = '112233';
    expect(tag.isNew).toBe(true);
});

test('Set color doesnt change tag state if value not different', () => {
    const tag = new Tag().clean();
    tag.color = null;
    expect(tag.isClean).toBe(true);
});


test('can duplicate itself', () => {
    const tag = new Tag('hello').asPrivate();
    const copy = tag.duplicate();
    expect(copy.id).toBe(tag.id);
    expect(copy.name).toBe(tag.name);
    expect(copy.state).toBe(tag.state);
    expect(copy.isPublic).toBe(tag.isPublic);
});

test('validate fails if not new and id <= 0', () => {
    const model = newTag('Test', 0).clean();
    expect(model.validate()).toBe(false);
});

test('validate throws error if arg set to true', () => {
    const model = newTag('Test', 0).clean();
    expect(() => model.validate(true)).toThrowError();
});

test('validate prevents empty name', () => {
    const model = new Tag();
    model.name = null;
    expect(model.validate()).toBe(false);
});

test('validate accepts name with letters, numbers and spaces', () => {
    const model = new Tag();
    model.name = 'My Tag 1';
    expect(model.validate()).toBe(true);
});

test('validate prevents name with special characters', () => {
    const model = new Tag();
    model.name = 'Hello$';
    expect(model.validate()).toBe(false);
});

test('validate prevents name starting with number', () => {
    const model = new Tag();
    model.name = '1he';
    expect(model.validate()).toBe(false);
});

test('validate allows null color value', () => {
    const model = new Tag('hello');
    model.color = null;
    expect(model.validate()).toBe(true);
});

test('validate allows valid color value', () => {
    const model = new Tag('hello');
    model.color = '#a1B2F7';
    expect(model.validate()).toBe(true);
});

test('validate throws error if color is not valid hex', () => {
    const model = new Tag('hello');
    model.color = 'A9C10G8';
    expect(model.validate()).toBe(false);
});


test('getColorInt returns correct value with hash prefix', () => {
    const model = new Tag('hello');
    model.color = '#A1B2C3';
    expect(model.getColorInt()).toBe(10597059);
});

test('getColorInt returns correct value without hash prefix', () => {
    const model = new Tag('hello');
    model.color = 'A1B2C3';
    expect(model.getColorInt()).toBe(10597059);
});

test('getColorInt returns null if color is null', () => {
    const model = new Tag('hello');
    model.color = null;
    expect(model.getColorInt()).toBe(null);
});