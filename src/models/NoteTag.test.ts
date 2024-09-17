import { expect, test } from 'vitest';
import NoteTag from './NoteTag';
import { newAttr, newTag } from '../TestHelpers';


test('Gets initiated as new', () => {
    const nt = new NoteTag(newTag('Test', 123).clean());
    expect(nt.isNew).toBe(true);
});

test('Throws error if tag is falsy', () => {
    expect(() => new NoteTag(null)).toThrow();
});

test('Can duplicate itself', () => {
    const nt = new NoteTag(newTag('Test', 123).clean())
        .withData({foo: 'bar'})
        .addAttr(newAttr('Attr', 234).asText().clean(), 'Hello').clean();
    const copy = nt.duplicate();

    expect(copy.tag).toBe(nt.tag);
    expect(copy.data.foo).toBe('bar');
    expect(copy.attrs[0]).not.toBe(nt.attrs[0]);
    expect(copy.attrs[0].attr).toBe(nt.attrs[0].attr);
    expect(copy.state).toBe(nt.state);
});

test('Can duplicate itself as new', () => {
    const nt = new NoteTag(newTag('Test', 123).clean())
        .addAttr(newAttr('Attr', 234).asText().clean(), 'Hello');
    nt.clean().attrs[0].clean();
    const copy = nt.duplicateAsNew();

    expect(copy.tag).toBe(nt.tag);
    expect(copy.attrs[0]).not.toBe(nt.attrs[0]);
    expect(copy.attrs[0].attr).toBe(nt.attrs[0].attr);
    expect(copy.state).toBe('NEW');
    expect(copy.attrs[0].state).toBe('NEW');
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


test('addAttr adds NoteAttr object', () => {
    const nt = new NoteTag(newTag('Tag', 123).clean());
    const attr = newAttr('Attr', 234).clean();

    nt.addAttr(attr);

    expect(nt.attrs.length).toBe(1);
    expect(nt.attrs[0].attr).toBe(attr);
    expect(nt.attrs[0].tag).toBe(nt.tag);
});

test('addAttr doesnt add duplicates', () => {
    const attr = newAttr('Attr', 234).asNumber().clean();
    const nt = new NoteTag(newTag('Tag', 123).clean());
    nt.addAttr(attr, 10);
    nt.addAttr(attr, 20);
    expect(nt.attrs.length).toBe(1);
    expect(nt.attrs[0].value).toBe(20);
});