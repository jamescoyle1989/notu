import { expect, test } from 'vitest';
import NoteTag from './NoteTag';
import Note from './Note';
import Tag from './Tag';
import Attr from './Attr';


test('Gets initiated as new', () => {
    const nt = new NoteTag();
    expect(nt.isNew).toBe(true);
});

test('Gets initiated with sensible defaults', () => {
    const nt = new NoteTag();
    expect(nt.noteId).toBe(0);
    expect(nt.tagId).toBe(0);
});

test('Can duplicate itself', () => {
    const nt = new NoteTag();
    nt.noteId = 123;
    nt.tagId = 234;
    const copy = nt.duplicate();
    expect(copy.noteId).toBe(nt.noteId);
    expect(copy.tagId).toBe(nt.tagId);
});


test('Set noteId marks object as dirty if currently clean', () => {
    const nt = new NoteTag().clean();
    nt.noteId = 123;
    expect(nt.isDirty).toBe(true);
});

test('Set noteId doesnt change state if new', () => {
    const nt = new NoteTag().new();
    nt.noteId = 123;
    expect(nt.isNew).toBe(true);
});

test('Set noteId doesnt change state if value not different', () => {
    const nt = new NoteTag().clean();
    nt.noteId = nt.noteId;
    expect(nt.isClean).toBe(true);
});


test('Set tagId marks object as dirty if currently clean', () => {
    const nt = new NoteTag().clean();
    nt.tagId = 123;
    expect(nt.isDirty).toBe(true);
});

test('Set tagId doesnt change state if new', () => {
    const nt = new NoteTag().new();
    nt.tagId = 123;
    expect(nt.isNew).toBe(true);
});

test('Set tagId doesnt change state if value not different', () => {
    const nt = new NoteTag().clean();
    nt.tagId = nt.tagId;
    expect(nt.isClean).toBe(true);
});


test('Setting note with id different than current noteId updates state', () => {
    const nt = new NoteTag();
    nt.noteId = 123;
    nt.clean();
    const note = new Note();
    note.id = 234;

    nt.note = note;

    expect(nt.noteId).toBe(234);
    expect(nt.isDirty).toBe(true);
});

test('Setting note with id same as current noteId preserves state', () => {
    const nt = new NoteTag();
    nt.noteId = 27;
    nt.clean();
    const note = new Note();
    note.id = 27;

    nt.note = note;

    expect(nt.noteId).toBe(27);
    expect(nt.isClean).toBe(true);
});

test('Setting noteId to new value removes note object', () => {
    const nt = new NoteTag();
    const note = new Note();
    note.id = 80;
    nt.note = note;

    nt.noteId = 81;

    expect(nt.note).toBeNull();
});

test('Setting noteId to same as current note id preserves it', () => {
    const nt = new NoteTag();
    const note = new Note();
    note.id = 80;
    nt.note = note;

    nt.noteId = 80;

    expect(nt.note).not.toBeNull();
});


test('Setting tag with id different than current tagId updates state', () => {
    const nt = new NoteTag();
    nt.tagId = 123;
    nt.clean();
    const tag = new Tag();
    tag.id = 234;

    nt.tag = tag;

    expect(nt.tagId).toBe(234);
    expect(nt.isDirty).toBe(true);
});

test('Setting tag with id same as current tagId preserves state', () => {
    const nt = new NoteTag();
    nt.tagId = 27;
    nt.clean();
    const tag = new Tag();
    tag.id = 27;

    nt.tag = tag;

    expect(nt.tagId).toBe(27);
    expect(nt.isClean).toBe(true);
});

test('Setting tagId to new value removes tag object', () => {
    const nt = new NoteTag();
    const tag = new Tag();
    tag.id = 80;
    nt.tag = tag;

    nt.tagId = 81;

    expect(nt.tag).toBeNull();
});

test('Setting tagId to same as current tag id preserves it', () => {
    const nt = new NoteTag();
    const tag = new Tag();
    tag.id = 80;
    nt.tag = tag;

    nt.tagId = 80;

    expect(nt.tag).not.toBeNull();
});


test('validate passes if noteId is 0 and state is new', () => {
    const nt = new NoteTag();
    nt.tagId = 123;
    expect(nt.validate()).toBe(true);
});

test('validate fails if noteId is 0 and state is not new', () => {
    const nt = new NoteTag();
    nt.tagId = 123;
    nt.clean();
    expect(nt.validate()).toBe(false);
});

test('validate fails if tagId is 0', () => {
    const nt = new NoteTag();
    nt.noteId = 123;
    expect(nt.validate()).toBe(false);
});

test('validate throws error if arg set to true', () => {
    const nt = new NoteTag();
    expect(() => nt.validate(true)).toThrowError();
});

test('validate fails if noteId = tagId', () => {
    const nt = new NoteTag();
    nt.noteId = 123;
    nt.tagId = 123;
    expect(nt.validate()).toBe(false);
});

test('validate succeeds if noteId & tagId are both positive, different values', () => {
    const nt = new NoteTag();
    nt.noteId = 123;
    nt.tagId = 234;
    expect(nt.validate()).toBe(true);
});


test('addAttr adds NoteAttr object to parent note', () => {
    const note = new Note();
    const tag = new Tag('hello').clean();
    tag.id = 123;
    const attr = new Attr().clean();
    attr.id = 234;
    const nt = note.addTag(tag);

    nt.addAttr(attr);

    expect(note.attrs.length).toBe(1);
    expect(note.attrs[0].note).toBe(note);
    expect(note.attrs[0].attr).toBe(attr);
    expect(note.attrs[0].tag).toBe(tag);
});

test('addAttr throws error if note property not set', () => {
    const nt = new NoteTag();
    nt.noteId = 123;
    nt.tag = new Tag('hello');
    nt.tag.id = 234;
    const attr = new Attr().clean();
    attr.id = 345;
    
    expect(() => nt.addAttr(attr)).toThrowError();
});

test('attrs returns NoteAttr objects with matching tagId', () => {
    const note = new Note();
    const tag = new Tag('hello').clean();
    tag.id = 123;
    const attr1 = new Attr().clean();
    attr1.id = 234;
    const attr2 = new Attr().clean();
    attr2.id = 345;
    const nt = note.addTag(tag);
    nt.addAttr(attr1);
    note.addAttr(attr2);

    expect(nt.attrs.length).toBe(1);
    expect(nt.attrs[0].attr).toBe(attr1);
});