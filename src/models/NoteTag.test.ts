import { expect, test } from 'vitest';
import NoteTag from './NoteTag';
import { newTag } from '../TestHelpers';


test('Gets initiated as new', () => {
    const nt = new NoteTag(newTag('Test', 123).clean());
    expect(nt.isNew).toBe(true);
});

test('Throws error if tag is falsy', () => {
    expect(() => new NoteTag(null)).toThrow();
});

test('Can duplicate itself', () => {
    const nt = new NoteTag(newTag('Test', 123).clean())
        .withData({foo: 'bar'}).clean();
    const copy = nt.duplicate();

    expect(copy.tag).toBe(nt.tag);
    expect(copy.data.foo).toBe('bar');
    expect(copy.state).toBe(nt.state);
});

test('Can duplicate itself as new', () => {
    const nt = new NoteTag(newTag('Test', 123).clean());
    const copy = nt.duplicateAsNew();

    expect(copy.tag).toBe(nt.tag);
    expect(copy.state).toBe('NEW');
});


test('validate fails if tag is null', () => {
    const nt = new NoteTag(newTag('Test', 123).clean());
    nt['_tag'] = null;
    expect(nt.validate()).toBe(false);
});

test('validate throws error if arg set to true', () => {
    const nt = new NoteTag(newTag('Test', 123).clean());
    nt['_tag'] = null;
    expect(() => nt.validate(true)).toThrowError();
});
