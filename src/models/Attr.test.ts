import { expect, test } from 'vitest';
import Attr from './Attr';
import Space from './Space';
import { newSpace } from '../TestHelpers';


test('Gets initiated as new', () => {
    const attr = new Attr();
    expect(attr.isNew).toBe(true);
});


test('Set name marks attr as dirty if currently clean', () => {
    const attr = new Attr().clean();
    attr.name = 'asdf';
    expect(attr.isDirty).toBe(true);
});

test('Set name doesnt change attr state if new', () => {
    const attr = new Attr().new();
    attr.name = 'asdf';
    expect(attr.isNew).toBe(true);
});

test('Set name doesnt change attr state if value not different', () => {
    const attr = new Attr().clean();
    attr.name = '';
    expect(attr.isClean).toBe(true);
});


test('Set type is allowed if attr is new', () => {
    const attr = new Attr().new();
    attr.type = 'BOOLEAN';
    expect(attr.type).toBe('BOOLEAN');
});

test('Set type is not allowed if attr is not new', () => {
    const attr = new Attr().clean();
    expect(() => attr.type = 'BOOLEAN').toThrowError();
});

test('isText returns true if type is text', () => {
    const attr = new Attr();
    attr.type = 'TEXT';
    expect(attr.isText).toBe(true);
    attr.type = 'NUMBER';
    expect(attr.isText).toBe(false);
});

test('isNumber returns true if type is number', () => {
    const attr = new Attr();
    attr.type = 'TEXT';
    expect(attr.isNumber).toBe(false);
    attr.type = 'NUMBER';
    expect(attr.isNumber).toBe(true);
});

test('isBoolean returns true if type is boolean', () => {
    const attr = new Attr();
    attr.type = 'TEXT';
    expect(attr.isBoolean).toBe(false);
    attr.type = 'BOOLEAN';
    expect(attr.isBoolean).toBe(true);
});

test('isDate returns true if type is date', () => {
    const attr = new Attr();
    attr.type = 'TEXT';
    expect(attr.isDate).toBe(false);
    attr.type = 'DATE';
    expect(attr.isDate).toBe(true);
});

test('asText sets type', () => {
    const attr = new Attr().asText();
    expect(attr.type).toBe('TEXT');
});

test('asNumber sets type', () => {
    const attr = new Attr().asNumber();
    expect(attr.type).toBe('NUMBER');
});

test('asBoolean sets type', () => {
    const attr = new Attr().asBoolean();
    expect(attr.type).toBe('BOOLEAN');
});

test('asDate sets type', () => {
    const attr = new Attr().asDate();
    expect(attr.type).toBe('DATE');
});


test('Set space marks attr as dirty if currently clean', () => {
    const attr = new Attr().clean();
    attr.space = newSpace('Space', 123);
    expect(attr.isDirty).toBe(true);
});

test('Set spaceId doesnt change attr state if new', () => {
    const attr = new Attr().new();
    attr.space = newSpace('Space', 123);
    expect(attr.isNew).toBe(true);
});

test('Set spaceId doesnt change attr state if value not different', () => {
    const attr = new Attr().clean();
    attr.space = attr.space;
    expect(attr.isClean).toBe(true);
});

test('Setting space with id different than current spaceId updates state', () => {
    const attr = new Attr().in(newSpace('Space', 123)).clean();
    const space = newSpace('Space2', 124);

    attr.space = space;

    expect(attr.isDirty).toBe(true);
});

test('Setting space with id same as current spaceId preserves state', () => {
    const attr = new Attr().in(newSpace('Space', 123)).clean();
    const space = newSpace('Space', 123);

    attr.space = space;

    expect(attr.isClean).toBe(true);
});


test('Can duplicate itself', () => {
    const space = new Space('hello');
    space.id = 123;
    const attr = new Attr('Howdy', 'I say nice things').in(space);

    const copy = attr.duplicate();

    expect(copy.id).toBe(attr.id);
    expect(copy.name).toBe(attr.name);
    expect(copy.description).toBe(attr.description);
    expect(copy.type).toBe(attr.type);
    expect(copy.space).toBe(attr.space);
});


test('validate fails if space is not set', () => {
    const model = new Attr();
    
    expect(model.validate()).toBe(false);
});

test('validate fails if not new and id <= 0', () => {
    const model = new Attr().in(newSpace('Space', 123)).clean();
    model.id = 0;
    
    expect(model.validate()).toBe(false);
});

test('validate throws error if arg set to true', () => {
    const model = new Attr();
    
    expect(() => model.validate(true)).toThrowError();
});


test('defaultValue returns correct value for text', () => {
    const model = new Attr().asText();
    expect(model.defaultValue).toBe('');
});

test('defaultValue returns correct value for number', () => {
    const model = new Attr().asNumber();
    expect(model.defaultValue).toBe(0);
});

test('defaultValue returns correct value for boolean', () => {
    const model = new Attr().asBoolean();
    expect(model.defaultValue).toBe(false);
});

test('defaultValue returns correct value for date', () => {
    const model = new Attr().asDate();
    expect(model.defaultValue.getSeconds()).toBe(new Date().getSeconds());
});


test('constructor accepts optional name value', () => {
    const model = new Attr('Test');

    expect(model.name).toBe('Test');
});

test('in method allows chained space setting', () => {
    const model = new Attr('Hello').in(newSpace('Space', 123));

    expect(model.space.id).toBe(123);
});

test('in method allows chained space setting 2', () => {
    const space = new Space('Test');
    const model = new Attr('Hello').in(space);

    expect(model.space).toBe(space);
});