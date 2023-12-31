import { expect, test } from 'vitest';
import Note from './Note';
import Tag from './Tag';
import Space from './Space';
import Attr from './Attr';


function newCleanTag(): Tag {
    const tag = new Tag('hello');
    tag.id = 123;
    tag.clean();
    return tag;
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


test('Set id also sets id on ownTag', () => {
    const note = new Note();
    note.setOwnTag('test');

    note.id = 456;

    expect(note.ownTag.id).toBe(456);
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

test('setOwnTag doesnt mark note as dirty', () => {
    const note = new Note().clean().setOwnTag('hello');
    expect(note.isClean).toBe(true);
});

test('setOwnTag with string creates tag with same id as note', () => {
    const note = new Note();
    note.id = 123;
    note.setOwnTag('hello');
    expect(note.ownTag.id).toBe(note.id);
});

test('setOwnTag can take tag object, rather than just name', () => {
    const note = new Note().setOwnTag(new Tag('hello'));
    expect(note.ownTag.name).toBe('hello');
});

test('setOwnTag with tag object will throw error if tag already set', () => {
    const note = new Note().setOwnTag('hello');
    expect(() => note.setOwnTag(new Tag('goodbye'))).toThrowError();
});

test('setOwnTag with tag object will throw error if tag id is non-zero and doesnt match note id', () => {
    const note = new Note().clean();
    note.id = 123;
    const tag = new Tag('hello');
    tag.id = 57;
    expect(() => note.setOwnTag(tag)).toThrowError();
});

test('removeOwnTag marks existing tag as deleted if clean', () => {
    const note = new Note().setOwnTag('hello');
    note.ownTag.clean();
    note.removeOwnTag();
    expect(note.ownTag.isDeleted).toBe(true);
});

test('removeOwnTag nulls out new tag', () => {
    const note = new Note().setOwnTag('hello');
    note.removeOwnTag();
    expect(note.ownTag).toBeNull();
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

test('validate calls validate on ownTag', () => {
    const note = new Note().setOwnTag('asdf');
    note.spaceId = 123;
    expect(note.validate()).toBe(true);
    note.ownTag.clean();
    expect(note.validate()).toBe(false);
});

test('validate calls validate on each added tag', () => {
    const note = new Note();
    note.spaceId = 123;
    const nt = note.addTag(newCleanTag());
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
    const tag = newCleanTag();
    const note = new Note();

    note.addTag(tag);

    expect(note.tags.length).toBe(1);
    expect(note.tags[0].note).toBe(note);
    expect(note.tags[0].tag).toBe(tag);
});

test('addTag returns existing NoteTag object if trying to add duplicate tag', () => {
    const tag = newCleanTag();
    const note = new Note();
    note.addTag(tag);

    note.addTag(tag);

    expect(note.tags.length).toBe(1);
    expect(note.tags[0].note).toBe(note);
    expect(note.tags[0].tag).toBe(tag);
});

test('addTag undeletes existing NoteTag if trying to add duplicate tag', () => {
    const tag = newCleanTag();
    const note = new Note();
    const nt = note.addTag(tag);
    nt.delete();

    note.addTag(tag);

    expect(note.tags.length).toBe(1);
    expect(nt.isDirty).toBe(true);
});

test('addTag throws error if trying to add deleted tag', () => {
    const tag = newCleanTag().delete();
    const note = new Note();
    expect(() => note.addTag(tag)).toThrowError();
});

test('addTag prevents note from adding its own tag', () => {
    const note = new Note();
    note.id = 123;
    note.setOwnTag('test');

    expect(() => note.addTag(note.ownTag)).toThrowError();
});

test('addTag prevents note from adding tag that hasnt been saved yet', () => {
    const note = new Note();
    expect(() => note.addTag(new Tag())).toThrowError();
});

test('removeTag removes newly added tag from note', () => {
    const tag = newCleanTag();
    const note = new Note();
    note.addTag(tag);

    note.removeTag(tag);

    expect(note.tags.length).toBe(0);
});

test('removeTag marks existing tag on note as deleted', () => {
    const tag = newCleanTag();
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

test('constructor accepts optional text value', () => {
    const note = new Note('Hello');
    
    expect(note.text).toBe('Hello');
});

test('at method allows chained date setting', () => {
    const note = new Note('Hello').at(new Date(2023, 11, 25));

    expect(note.date.getTime()).toBe(new Date(2023, 11, 25).getTime());
});

test('in method allows chained space setting', () => {
    const note = new Note('Hello').in(3);

    expect(note.spaceId).toBe(3);
});

test('in method allows chained space setting 2', () => {
    const space = new Space('Test');
    const note = new Note('Hello').in(space);

    expect(note.space).toBe(space);
});

test('stringifying shouldnt throw error', () => {
    const tag = new Tag('test', 1).clean();
    tag.id = 1;
    const note = new Note('Hello');
    note.addTag(tag);
    JSON.stringify(note);
});