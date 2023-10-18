import { expect, test } from 'vitest';
import Note from './Note';
import Tag from './Tag';
import Space from './Space';
import Attr from './Attr';


function newTag(id: number, name: string): Tag {
    const note = new Note();
    note.id = id;
    note.name = name;
    return new Tag(note);
}

function newCleanAttr(): Attr {
    const attr = new Attr();
    attr.id = 234;
    attr.clean();
    return attr;
}


test('gets initiated with sensible defaults', () => {
    const note = new Note();
    expect(note.id).toBe(0);
    expect(note.date.getTime() / 1000).toBeCloseTo(new Date().getTime() / 1000);
    expect(note.text).toBe('');
    expect(note.archived).toBe(false);
    expect(note.spaceId).toBe(0);
});

test('can duplicate itself', () => {
    const note = new Note().clean();
    const space = new Space('hello');
    space.id = 123;
    note.space = space;
    const copy = note.duplicate();
    expect(copy.id).toBe(note.id);
    expect(copy.date).toBe(note.date);
    expect(copy.text).toBe(note.text);
    expect(copy.archived).toBe(note.archived);
    expect(copy.space).toBe(note.space);
    expect(copy.spaceId).toBe(note.spaceId);
    expect(copy.state).toBe(note.state);
});

test('Gets initiated as new', () => {
    const note = new Note();
    expect(note.isNew).toBe(true);
});


test('Set date marks note as dirty if currently clean', () => {
    const note = new Note().clean();
    note.date = new Date();
    expect(note.isDirty).toBe(true);
});

test('Set date doesnt change note state if new', () => {
    const note = new Note().new();
    note.date = new Date();
    expect(note.isNew).toBe(true);
});

test('Set date doesnt change note state if value not different', () => {
    const note = new Note().clean();
    note.date = note.date;
    expect(note.isClean).toBe(true);
});


test('Set text marks note as dirty if currently clean', () => {
    const note = new Note().clean();
    note.text = 'asdf';
    expect(note.isDirty).toBe(true);
});

test('Set text doesnt change note state if new', () => {
    const note = new Note().new();
    note.text = 'asdf';
    expect(note.isNew).toBe(true);
});

test('Set text doesnt change note state if value not different', () => {
    const note = new Note().clean();
    note.text = '';
    expect(note.isClean).toBe(true);
});


test('Set archived marks note as dirty if currently clean', () => {
    const note = new Note().clean();
    note.archived = !note.archived;
    expect(note.isDirty).toBe(true);
});

test('Set archived doesnt change note state if new', () => {
    const note = new Note().new();
    note.archived = !note.archived;
    expect(note.isNew).toBe(true);
});

test('Set archived doesnt change note state if value not different', () => {
    const note = new Note().clean();
    note.archived = note.archived;
    expect(note.isClean).toBe(true);
});


test('Set spaceId marks note as dirty if currently clean', () => {
    const note = new Note().clean();
    note.spaceId = 123;
    expect(note.isDirty).toBe(true);
});

test('Set spaceId doesnt change note state if new', () => {
    const note = new Note().new();
    note.spaceId = 123;
    expect(note.isNew).toBe(true);
});

test('Set spaceId doesnt change note state if value not different', () => {
    const note = new Note().clean();
    note.spaceId = note.spaceId;
    expect(note.isClean).toBe(true);
});


test('Set name marks note as dirty if currently clean', () => {
    const note = new Note().clean();
    note.name = 'asdf';
    expect(note.isDirty).toBe(true);
});

test('Set name doesnt change note state if new', () => {
    const note = new Note().new();
    note.name = 'asdf';
    expect(note.isNew).toBe(true);
});

test('Set name doesnt change note state if value not different', () => {
    const note = new Note().clean();
    note.name = '';
    expect(note.isClean).toBe(true);
});


test('Setting space with id different than current spaceId updates state', () => {
    const note = new Note();
    note.spaceId = 57;
    note.clean();
    const space = new Space('hello');
    space.id = 60;

    note.space = space;

    expect(note.spaceId).toBe(60);
    expect(note.isDirty).toBe(true);
});

test('Setting space with id same as current spaceId preserves state', () => {
    const note = new Note();
    note.spaceId = 80;
    note.clean();
    const space = new Space('hello');
    space.id = 80;

    note.space = space;

    expect(note.spaceId).toBe(80);
    expect(note.isClean).toBe(true);
});

test('Setting spaceId to new value removes space object', () => {
    const note = new Note();
    const space = new Space('hello');
    space.id = 80;
    note.space = space;

    note.spaceId = 81;

    expect(note.space).toBeNull();
});

test('Setting spaceId to same as current space id preserves it', () => {
    const note = new Note();
    const space = new Space('hello');
    space.id = 80;
    note.space = space;
    
    note.spaceId = 80;

    expect(note.space.name).toBe('hello');
});


test('validate fails if spaceId is 0', () => {
    const model = new Note();
    model.spaceId = 0;
    expect(model.validate()).toBe(false);
});

test('validate fails if not new and id <= 0', () => {
    const model = new Note().clean();
    model.id = 0;
    model.spaceId = 123;
    expect(model.validate()).toBe(false);
});

test('validate throws error if arg set to true', () => {
    const model = new Note();
    model.spaceId = 0;
    expect(() => model.validate(true)).toThrowError();
});

test('validate calls validate on each added tag', () => {
    const note = new Note();
    note.spaceId = 123;
    const nt = note.addTag(newTag(10, 'hello'));
    expect(note.validate()).toBe(true);
    nt.tagId = 0;
    expect(note.validate()).toBe(false);
});

test('validate calls validate on each added attr', () => {
    const note = new Note();
    note.spaceId = 123;
    const na = note.addAttr(newCleanAttr());
    expect(note.validate()).toBe(true);
    na.attrId = 0;
    expect(note.validate()).toBe(false);
});


test('addTag adds new NoteTag object', () => {
    const tag = newTag(10, 'hello');
    const note = new Note();

    note.addTag(tag);

    expect(note.tags.length).toBe(1);
    expect(note.tags[0].note).toBe(note);
    expect(note.tags[0].tag).toBe(tag);
});

test('addTag returns existing NoteTag object if trying to add duplicate tag', () => {
    const tag = newTag(10, 'hello');
    const note = new Note();
    note.addTag(tag);

    note.addTag(tag);

    expect(note.tags.length).toBe(1);
    expect(note.tags[0].note).toBe(note);
    expect(note.tags[0].tag).toBe(tag);
});

test('addTag undeletes existing NoteTag if trying to add duplicate tag', () => {
    const tag = newTag(10, 'hello');
    const note = new Note();
    const nt = note.addTag(tag);
    nt.delete();

    note.addTag(tag);

    expect(note.tags.length).toBe(1);
    expect(nt.isDirty).toBe(true);
});

test('addTag prevents note from adding its own tag', () => {
    const note = new Note();
    note.id = 123;
    note.name = 'test';
    const tag = new Tag(note);

    expect(() => note.addTag(tag)).toThrowError();
});

test('removeTag removes newly added tag from note', () => {
    const tag = newTag(10, 'hello');
    const note = new Note();
    note.addTag(tag);

    note.removeTag(tag);

    expect(note.tags.length).toBe(0);
});

test('removeTag marks existing tag on note as deleted', () => {
    const tag = newTag(10, 'hello');
    const note = new Note();
    note.addTag(tag).clean();

    note.removeTag(tag);

    expect(note.tags.length).toBe(1);
    expect(note.tags[0].isDeleted).toBe(true);
});


test('addAttr adds new NoteAttr object', () => {
    const attr = newCleanAttr();
    const note = new Note();

    note.addAttr(attr);
    
    expect(note.attrs.length).toBe(1);
    expect(note.attrs[0].note).toBe(note);
    expect(note.attrs[0].attr).toBe(attr);
});

test('addAttr returns existing NoteAttr object if trying to add duplicate attr', () => {
    const attr = newCleanAttr();
    const note = new Note();
    note.addAttr(attr);

    note.addAttr(attr);

    expect(note.attrs.length).toBe(1);
    expect(note.attrs[0].note).toBe(note);
    expect(note.attrs[0].attr).toBe(attr);
});

test('addAttr undeletes existing NoteAttr if trying to add duplicate tag', () => {
    const attr = newCleanAttr();
    const note = new Note();
    const na = note.addAttr(attr);
    na.delete();

    note.addAttr(attr);

    expect(note.attrs.length).toBe(1);
    expect(na.isDirty).toBe(true);
});

test('addAttr throws error if trying to add deleted attr', () => {
    const attr = newCleanAttr().delete();
    const note = new Note();
    expect(() => note.addAttr(attr)).toThrowError();
});

test('addAttr prevents note from adding attr that hasnt been saved yet', () => {
    const note = new Note();
    expect(() => note.addAttr(new Attr())).toThrowError();
});

test('removeAttr removes newly added attr from note', () => {
    const attr = newCleanAttr();
    const note = new Note();
    note.addAttr(attr);

    note.removeAttr(attr);

    expect(note.attrs.length).toBe(0);
});

test('removeAttr marks existing attr on note as deleted', () => {
    const attr = newCleanAttr();
    const note = new Note();
    note.addAttr(attr).clean();

    note.removeAttr(attr);

    expect(note.attrs.length).toBe(1);
    expect(note.attrs[0].isDeleted).toBe(true);
});