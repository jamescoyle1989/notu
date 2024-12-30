import { expect, test } from 'vitest';
import Note from './Note';
import Tag from './Tag';
import Space from './Space';
import { newNote, newSpace, newTag } from '../TestHelpers';
import NoteTag from './NoteTag';


test('gets initiated with sensible defaults', () => {
    const note = new Note();
    expect(note.id).toBe(0);
    expect(note.date.getTime() / 1000).toBeCloseTo(new Date().getTime() / 1000);
    expect(note.text).toBe('');
    expect(note.space).toBeNull();
});

test('can duplicate itself', () => {
    const space = newSpace('hello', 123).clean();
    const tag = newTag('Tag1', 345).in(space).clean();
    const note = newNote('asdf', 789).in(space).setOwnTag('My Tag').clean();
    note.addTag(tag);

    const copy = note.duplicate();

    expect(copy.id).toBe(note.id);
    expect(copy.date).toBe(note.date);
    expect(copy.text).toBe(note.text);
    expect(copy.space).toBe(note.space);
    expect(copy.space.id).toBe(note.space.id);
    expect(copy.state).toBe(note.state);
    expect(copy.tags.length).toBe(note.tags.length);
    expect(copy.ownTag.name).toBe(note.ownTag.name);
});

test('can duplicate itself as new', () => {
    const space = newSpace('hello', 123).clean();
    const tag = newTag('Tag1', 345).in(space).clean();
    const note = newNote('asdf', 789).in(space).setOwnTag('My Tag').clean();
    note.addTag(tag);

    const copy = note.duplicateAsNew();

    expect(copy.id).toBe(0);
    expect(copy.date).toBe(note.date);
    expect(copy.text).toBe(note.text);
    expect(copy.space).toBe(note.space);
    expect(copy.space.id).toBe(note.space.id);
    expect(copy.state).toBe('NEW');
    expect(copy.tags.length).toBe(note.tags.length);
    expect(copy.tags[0].state).toBe('NEW');
    expect(copy.ownTag).toBeFalsy()
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
    const note = new Note().setOwnTag('hello');
    expect(note.ownTag.name).toBe('hello');
});

test('setOwnTag will update existing tag name if tag already set', () => {
    const note = new Note().setOwnTag('hello');
    note.ownTag.clean();

    note.setOwnTag('goodbye');

    expect(note.ownTag.name).toBe('goodbye');
    expect(note.ownTag.isDirty).toBe(true);
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

test('Setting space with id different than current space.id updates state', () => {
    const note = new Note().in(newSpace('Space1', 123).clean()).clean();

    note.space = newSpace('Space2', 234).clean();

    expect(note.space.id).toBe(234);
    expect(note.isDirty).toBe(true);
});

test('Setting space with id same as current space.id preserves state', () => {
    const note = new Note().in(newSpace('Space1', 123).clean()).clean();

    note.space = newSpace('Space2', 123).clean();

    expect(note.space.id).toBe(123);
    expect(note.isClean).toBe(true);
});


test('validate fails if space not set', () => {
    const model = new Note();
    expect(model.validate()).toBe(false);
});

test('validate fails if not new and id <= 0', () => {
    const model = new Note().in(newSpace('Space', 123).clean()).clean();
    expect(model.validate()).toBe(false);
});

test('validate fails if ownTag set to different space', () => {
    const model = new Note('Hello').in(newSpace('Space', 123));
    model.setOwnTag('My Tag');
    model.ownTag.in(newSpace('Space2', 234));
    expect(model.validate()).toBe(false);
});

test('validate throws error if arg set to true', () => {
    const model = new Note();
    expect(() => model.validate(true)).toThrowError();
});

test('validate calls validate on ownTag', () => {
    const note = new Note().in(newSpace('Space', 123)).setOwnTag('asdf');
    expect(note.validate()).toBe(true);
    note.ownTag.clean();
    expect(note.validate()).toBe(false);
});

test('validate calls validate on each added tag', () => {
    const space = newSpace('Space', 123).clean()
    const note = new Note().in(space);
    note.id = 123;
    const nt = note.addTag(newTag('Tag', 0).in(space).clean());
    expect(note.validate()).toBe(true);
    nt['_tag'] = null;
    expect(note.validate()).toBe(false);
});


test('addTag adds new NoteTag object', () => {
    const tag = newTag('Tag', 123).asPublic().clean();
    const note = new Note();

    note.addTag(tag);

    expect(note.tags.length).toBe(1);
    expect(note.tags[0].tag).toBe(tag);
});

test('addTag returns existing NoteTag object if trying to add duplicate tag', () => {
    const tag = newTag('Tag', 123).asPublic().clean();
    const note = new Note();
    note.addTag(tag);

    note.addTag(tag);

    expect(note.tags.length).toBe(1);
    expect(note.tags[0].tag).toBe(tag);
});

test('addTag undeletes existing NoteTag if trying to add duplicate tag', () => {
    const tag = newTag('Tag', 123).asPublic().clean();
    const note = new Note();
    const nt = note.addTag(tag);
    nt.delete();

    note.addTag(tag);

    expect(note.tags.length).toBe(1);
    expect(nt.isDirty).toBe(true);
});

test('addTag throws error if trying to add deleted tag', () => {
    const tag = newTag('Tag', 123).clean().delete();
    const note = new Note();
    expect(() => note.addTag(tag)).toThrowError();
});

test('addTag throws error if trying to add private tag from different space', () => {
    const tag = newTag('Tag', 123).in(newSpace('Space1', 1)).asPrivate().clean();
    const note = new Note().in(newSpace('Space2', 2));
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
    const tag = newTag('Tag', 123).asPublic().clean();
    const note = new Note();
    note.addTag(tag);

    note.removeTag(tag);

    expect(note.tags.length).toBe(0);
});

test('removeTag marks existing tag on note as deleted', () => {
    const tag = newTag('Tag', 123).asPublic().clean();
    const note = new Note();
    note.addTag(tag).clean();

    note.removeTag(tag);

    expect(note.tags.length).toBe(0);
    expect(note['_tags'].length).toBe(1);
    expect(note['_tags'][0].isDeleted).toBe(true);
});

test('getTag returns correct value for tags in same space as it', () => {
    const space = newSpace('Space', 1).clean();
    const tag = newTag('Test', 123).in(space).clean();
    const note = new Note().in(space);
    note.addTag(tag);

    expect(note.getTag('Test')).toBeTruthy();
    expect(note.getTag(tag)).toBeTruthy();
    expect(note.getTag('Willy')).toBeFalsy();
    expect(note.getTag('Test', 2)).toBeFalsy();
});

test('getTag returns correct value for tags in different space from the note', () => {
    const space1 = newSpace('Space 1', 1).clean();
    const space2 = newSpace('Space 2', 2).clean();
    const tag = newTag('Hello', 123).in(space2).asPublic().clean();
    const note = new Note().in(space1);
    note.addTag(tag);

    expect(note.getTag('Hello')).toBeFalsy();
    expect(note.getTag('Hello', 2)).toBeTruthy();
    expect(note.getTag('Hello', space2)).toBeTruthy();
    expect(note.getTag('Hello', space1)).toBeFalsy();
    expect(note.getTag('Goodbye', space2)).toBeFalsy();
});

test('getTag ignores the space parameter if the actual tag object is passed in', () => {
    const space1 = newSpace('Space 1', 1).clean();
    const space2 = newSpace('Space 2', 2).clean();
    const tag1 = newTag('Tag 1', 3).in(space1).asPublic().clean();
    const tag2 = newTag('Tag 2', 4).in(space2).asPublic().clean();
    const note = new Note().in(space1);
    note.addTag(tag1);
    note.addTag(tag2);

    expect(note.getTag(tag1).tag).toBe(tag1);
    expect(note.getTag(tag2).tag).toBe(tag2);
    expect(note.getTag(tag2, space1).tag).toBe(tag2);
    expect(note.getTag(tag2, space2).tag).toBe(tag2);
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
    const note = new Note('Hello').in(newSpace('Space', 3));

    expect(note.space.id).toBe(3);
});

test('in method allows chained space setting 2', () => {
    const space = new Space('Test');
    const note = new Note('Hello').in(space);

    expect(note.space).toBe(space);
});

test('stringifying shouldnt throw error', () => {
    const space = newSpace('Space', 123);
    const tag = newTag('Tag', 234).in(space).clean();
    const note = new Note('Hello').in(space);
    note.addTag(tag);
    JSON.stringify(note);
});


class TestData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        this._nt = noteTag;
    }

    get foo(): string { return this._nt.data.foo; }
    set foo(value: string) { this._nt.data.foo = value; }
}

test('getTagData returns correct result', () => {
    const space = newSpace('Space', 1);
    const tag = newTag('Tag', 2).in(space).clean();
    const note = new Note('Hello').in(space);
    note.addTag(tag).withData({foo: 'bar'});

    const data = note.getTagData(tag, TestData);

    expect(data.foo).toBe('bar');
});