import { expect, test } from 'vitest';
import NoteAttr from './NoteAttr';
import { newAttr, newTag } from '../TestHelpers';


test('Gets initiated as new', () => {
    const na = new NoteAttr(newAttr('Attr', 123).clean());
    expect(na.isNew).toBe(true);
});

test('Gets initiated with sensible defaults', () => {
    const na = new NoteAttr(newAttr('Attr', 123).asNumber().clean());
    expect(na.tag).toBe(null);
    expect(na.value).toBe(0);
});


test('Set value marks object as dirty if currently clean', () => {
    const na = new NoteAttr(newAttr('Attr', 123).asNumber().clean()).clean();
    na.value = 234;
    expect(na.isDirty).toBe(true);
});

test('Set value doesnt change state if new', () => {
    const na = new NoteAttr(newAttr('Attr', 123).asNumber().clean()).new();
    na.value = 234;
    expect(na.isNew).toBe(true);
});

test('Set value doesnt change state if value not different', () => {
    const na = new NoteAttr(newAttr('Attr', 123).asNumber().clean()).clean();
    na.value = na.value;
    expect(na.isClean).toBe(true);
});


test('Can duplicate itself', () => {
    const na = new NoteAttr(
        newAttr('Attr', 123).clean(),
        newTag('Tag', 234).clean(),
        'hello'
    ).clean();

    const copy = na.duplicate();

    expect(copy.attr).toBe(na.attr);
    expect(copy.tag).toBe(na.tag);
    expect(copy.value).toBe(na.value);
    expect(copy.state).toBe('NEW');
});


test('validate succeeds', () => {
    const nt = new NoteAttr(newAttr('Attr', 123).clean());
    expect(nt.validate()).toBe(true);
});


test('constructor allows setting attr, tag & value', () => {
    const na = new NoteAttr(
        newAttr('Attr', 123).clean(),
        newTag('Tag', 234).clean(),
        12345
    );

    expect(na.attr.name).toBe('Attr');
    expect(na.tag.name).toBe('Tag');
    expect(na.value).toBe(12345);
});