import { expect, test } from 'vitest';
import Tag from './Tag';
import { Note } from '..';


test('constructor requires note object', () => {
    expect(() => new Tag(null)).toThrowError();
});


test('can duplicate itself', () => {
    const note = new Note();
    note.id = 10;
    note.name = 'hello';
    const tag = new Tag(note);
    const copy = tag.duplicate();
    expect(copy.id).toBe(tag.id);
    expect(copy.name).toBe(tag.name);
});