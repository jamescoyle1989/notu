import { expect, test } from 'vitest';
import NoteAttr from './NoteAttr';
import Note from './Note';
import Attr from './Attr';
import Tag from './Tag';


test('Gets initiated as new', () => {
    const na = new NoteAttr();
    expect(na.isNew).toBe(true);
});

test('Gets initiated with sensible defaults', () => {
    const na = new NoteAttr();
    expect(na.noteId).toBe(0);
    expect(na.attrId).toBe(0);
    expect(na.value).toBe(null);
    expect(na.tagId).toBe(null);
});


test('Set noteId marks object as dirty if currently clean', () => {
    const na = new NoteAttr().clean();
    na.noteId = 123;
    expect(na.isDirty).toBe(true);
});

test('Set noteId doesnt change state if new', () => {
    const na = new NoteAttr().new();
    na.noteId = 123;
    expect(na.isNew).toBe(true);
});

test('Set noteId doesnt change state if value not different', () => {
    const na = new NoteAttr().clean();
    na.noteId = na.noteId;
    expect(na.isClean).toBe(true);
});

test('Setting note with id different than current noteId updates state', () => {
    const na = new NoteAttr();
    na.noteId = 123;
    na.clean();
    const note = new Note();
    note.id = 234;

    na.note = note;

    expect(na.noteId).toBe(234);
    expect(na.isDirty).toBe(true);
});

test('Setting note with id same as current noteId preserves state', () => {
    const na = new NoteAttr();
    na.noteId = 27;
    na.clean();
    const note = new Note();
    note.id = 27;

    na.note = note;

    expect(na.noteId).toBe(27);
    expect(na.isClean).toBe(true);
});

test('Setting noteId to new value removes note object', () => {
    const na = new NoteAttr();
    const note = new Note();
    note.id = 80;
    na.note = note;

    na.noteId = 81;

    expect(na.note).toBeNull();
});

test('Setting noteId to same as current note id preserves it', () => {
    const na = new NoteAttr();
    const note = new Note();
    note.id = 80;
    na.note = note;

    na.noteId = 80;

    expect(na.note).not.toBeNull();
});


test('Set attrId marks object as dirty if currently clean', () => {
    const na = new NoteAttr().clean();
    na.attrId = 123;
    expect(na.isDirty).toBe(true);
});

test('Set attrId doesnt change state if new', () => {
    const na = new NoteAttr().new();
    na.attrId = 123;
    expect(na.isNew).toBe(true);
});

test('Set attrId doesnt change state if value not different', () => {
    const na = new NoteAttr().clean();
    na.attrId = na.attrId;
    expect(na.isClean).toBe(true);
});

test('Setting attr with id different than current attrId updates state', () => {
    const na = new NoteAttr();
    na.attrId = 123;
    na.clean();
    const attr = new Attr();
    attr.id = 234;

    na.attr = attr;

    expect(na.attrId).toBe(234);
    expect(na.isDirty).toBe(true);
});

test('Setting attr with id same as current attrId preserves state', () => {
    const na = new NoteAttr();
    na.attrId = 27;
    na.value = '';
    na.clean();
    const attr = new Attr();
    attr.id = 27;

    na.attr = attr;

    expect(na.attrId).toBe(27);
    expect(na.isClean).toBe(true);
});

test('Setting attrId to new value removes attr object', () => {
    const na = new NoteAttr();
    const attr = new Attr();
    attr.id = 80;
    na.attr = attr;

    na.attrId = 81;

    expect(na.attr).toBeNull();
});

test('Setting attrId to same as current attr id preserves it', () => {
    const na = new NoteAttr();
    const attr = new Attr();
    attr.id = 80;
    na.attr = attr;

    na.attrId = 80;

    expect(na.attr).not.toBeNull();
});

test('Setting attr updates the default value', () => {
    const na = new NoteAttr();
    const attr1 = new Attr().asNumber();
    attr1.id = 1;

    na.attr = attr1;

    expect(na.value).toBe(0);
});

test('Setting attr to null clears out value', () => {
    const na = new NoteAttr();
    const attr = new Attr().asNumber();
    attr.id = 1;
    na.attr = attr;

    na.attr = null;

    expect(na.value).toBe(null);
});

test('Setting attr to new value of same type doesnt update value', () => {
    const na = new NoteAttr();
    const attr1 = new Attr().asNumber();
    const attr2 = new Attr().asNumber();
    attr1.id = 1;
    attr2.id = 2;
    na.attr = attr1;
    na.value = 123;

    na.attr = attr2;

    expect(na.value).toBe(123);
});

test('Setting attr to new value of different type does update value', () => {
    const na = new NoteAttr();
    const attr1 = new Attr().asNumber();
    const attr2 = new Attr().asText();
    attr1.id = 1;
    attr2.id = 2;
    na.attr = attr1;
    na.value = 123;

    na.attr = attr2;

    expect(na.value).toBe('');
});


test('Set value marks object as dirty if currently clean', () => {
    const na = new NoteAttr().clean();
    na.value = 123;
    expect(na.isDirty).toBe(true);
});

test('Set value doesnt change state if new', () => {
    const na = new NoteAttr().new();
    na.value = 123;
    expect(na.isNew).toBe(true);
});

test('Set value doesnt change state if value not different', () => {
    const na = new NoteAttr().clean();
    na.value = na.value;
    expect(na.isClean).toBe(true);
});


test('Set tagId marks object as dirty if currently clean', () => {
    const na = new NoteAttr().clean();
    na.tagId = 123;
    expect(na.isDirty).toBe(true);
});

test('Set tagId doesnt change state if new', () => {
    const na = new NoteAttr().new();
    na.tagId = 123;
    expect(na.isNew).toBe(true);
});

test('Set tagId doesnt change state if value not different', () => {
    const na = new NoteAttr().clean();
    na.tagId = na.tagId;
    expect(na.isClean).toBe(true);
});

test('Setting tag with id different than current tagId updates state', () => {
    const na = new NoteAttr();
    na.tagId = 123;
    na.clean();
    const tag = new Tag();
    tag.id = 234;

    na.tag = tag;

    expect(na.tagId).toBe(234);
    expect(na.isDirty).toBe(true);
});

test('Setting tag with id same as current tagId preserves state', () => {
    const na = new NoteAttr();
    na.tagId = 27;
    na.clean();
    const tag = new Tag();
    tag.id = 27;

    na.tag = tag;

    expect(na.tagId).toBe(27);
    expect(na.isClean).toBe(true);
});

test('Setting tagId to new value removes tag object', () => {
    const na = new NoteAttr();
    const tag = new Tag();
    tag.id = 80;
    na.tag = tag;

    na.tagId = 81;

    expect(na.tag).toBeNull();
});

test('Setting tagId to same as current tag id preserves it', () => {
    const na = new NoteAttr();
    const tag = new Tag();
    tag.id = 80;
    na.tag = tag;

    na.tagId = 80;

    expect(na.tag).not.toBeNull();
});

test('Setting tag to null also nulls tagId', () => {
    const na = new NoteAttr();
    const tag = new Tag();
    tag.id = 80;
    na.tag = tag;
    expect(na.tagId).toBe(80);

    na.tag = null;

    expect(na.tagId).toBe(null);
});


test('Can duplicate itself', () => {
    const na = new NoteAttr();
    const note = new Note();
    note.id = 24;
    const attr = new Attr();
    attr.id = 25;
    const tag = new Tag();
    tag.id = 26;
    na.note = note;
    na.attr = attr;
    na.tag = tag;
    na.value = 'hello';

    const copy = na.duplicate();

    expect(copy.note).toBe(na.note);
    expect(copy.noteId).toBe(na.noteId);
    expect(copy.attr).toBe(na.attr);
    expect(copy.attrId).toBe(na.attrId);
    expect(copy.tag).toBe(na.tag);
    expect(copy.tagId).toBe(na.tagId);
    expect(copy.value).toBe(na.value);
});


test('validate passes if noteId is 0 and state is new', () => {
    const nt = new NoteAttr();
    nt.attrId = 123;
    expect(nt.validate()).toBe(true);
});

test('validate fails if noteId is 0 and state is not new', () => {
    const nt = new NoteAttr();
    nt.attrId = 123;
    nt.clean();
    expect(nt.validate()).toBe(false);
});

test('validate fails if attrId is 0', () => {
    const nt = new NoteAttr();
    nt.noteId = 123;
    expect(nt.validate()).toBe(false);
});

test('validate throws error if arg set to true', () => {
    const nt = new NoteAttr();
    expect(() => nt.validate(true)).toThrowError();
});

test('validate succeeds if noteId & attrId are both positive values', () => {
    const nt = new NoteAttr();
    nt.noteId = 123;
    nt.attrId = 234;
    expect(nt.validate()).toBe(true);
});


test('constructor allows setting note, attr & value', () => {
    const na = new NoteAttr(123, 234, 345);

    expect(na.noteId).toBe(123);
    expect(na.attrId).toBe(234);
    expect(na.value).toBe(345);
});

test('constructor allows setting note, attr & value 2', () => {
    const na = new NoteAttr(new Note('test'), new Attr('blah'), 'hello');

    expect(na.note.text).toBe('test');
    expect(na.attr.name).toBe('blah');
    expect(na.value).toBe('hello');
});

test('onTag allows chained setting of tag', () => {
    const na = new NoteAttr().onTag(234);

    expect(na.tagId).toBe(234);
});

test('onTag allows chained setting of tag 2', () => {
    const na = new NoteAttr().onTag(new Tag('Test Tag'));

    expect(na.tag.name).toBe('Test Tag');
});

test('fromJSON reconstructs NoteAttr correctly', () => {
    const note = new Note('Sample text');
    note.id = 123;
    const attr = new Attr('Testat').asText().clean();
    attr.id = 234;
    const tag = new Tag('Testag', 345);
    tag.id = 456;
    const na = new NoteAttr(note, attr, 'Hello!').dirty();
    na.tag = tag;

    const naCopy = NoteAttr.fromJSON(na.toJSON());

    expect(naCopy).toBeInstanceOf(NoteAttr);
    expect(naCopy.state).toBe(na.state);
    expect(naCopy.noteId).toBe(na.noteId);
    expect(naCopy.attrId).toBe(na.attrId);
    expect(naCopy.tagId).toBe(na.tagId);
    expect(naCopy.value).toBe(na.value);
});