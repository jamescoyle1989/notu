import { expect, test } from 'vitest';
import Note from './Note';
import Tag from './Tag';
import Space from './Space';
import Attr from './Attr';
import { NoteAttr, NoteTag } from '..';
import { newAttr, newSpace, newTag } from '../TestHelpers';


function newCleanTag(): Tag {
    const tag = new Tag('hello');
    tag.id = 123;
    tag.clean();
    return tag;
}

function newCleanAttr(): Attr {
    const attr = new Attr('Height');
    attr.id = 234;
    attr.clean();
    return attr;
}


test('gets initiated with sensible defaults', () => {
    const note = new Note();
    expect(note.id).toBe(0);
    expect(note.date.getTime() / 1000).toBeCloseTo(new Date().getTime() / 1000);
    expect(note.text).toBe('');
    expect(note.spaceId).toBe(0);
});

test('can duplicate itself', () => {
    const space = newSpace('hello', 123).clean();
    const attr = newAttr('Attr1', 234).asText().clean();
    const tag = newTag('Tag1', 345).clean();
    const note = new Note().in(space).setOwnTag('My Tag').clean();
    note.addAttr(attr).withValue('hotpot');
    note.addTag(tag);

    const copy = note.duplicate();

    expect(copy.id).toBe(note.id);
    expect(copy.date).toBe(note.date);
    expect(copy.text).toBe(note.text);
    expect(copy.space).toBe(note.space);
    expect(copy.spaceId).toBe(note.spaceId);
    expect(copy.state).toBe(note.state);
    expect(copy.tags.length).toBe(note.tags.length);
    expect(copy.attrs.length).toBe(note.attrs.length);
    expect(copy.ownTag.name).toBe(note.ownTag.name);
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

test('validate fails if same attr has been added to note twice', () => {
    const model = new Note();
    const attr = newCleanAttr();
    model.addAttr(attr);
    model.addAttr(attr);
    expect(model.validate()).toBe(false);
});

test('validate fails if same attr has been added to tag twice', () => {
    const model = new Note();
    const attr = newCleanAttr();
    const tag = newCleanTag();
    model.addAttr(attr).onTag(tag);
    model.addAttr(attr).onTag(tag);
    expect(model.validate()).toBe(false);
});

test('validate fails if ownTag set to different space', () => {
    const model = new Note('Hello').in(123);
    model.setOwnTag('My Tag');
    model.ownTag.in(234);
    expect(model.validate()).toBe(false);
});

test('validate passes if same attr has been added on note and tag', () => {
    const model = new Note().in(1);
    const attr = newCleanAttr();
    const tag = newCleanTag();
    model.addAttr(attr);
    model.addAttr(attr).onTag(tag);
    expect(model.validate()).toBe(true);
});

test('validate throws error if arg set to true', () => {
    const model = new Note();
    model.spaceId = 0;
    expect(() => model.validate(true)).toThrowError();
});

test('validate calls validate on ownTag', () => {
    const note = new Note().in(123).setOwnTag('asdf');
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

test('addTag throws error if trying to add private tag from different space', () => {
    const tag = newCleanTag().in(newSpace('Space1', 1)).asPrivate().clean();
    tag.id = 123;
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

test('removeTag removes any attributes that have been added on the tag', () => {
    const tag = newCleanTag();
    const attr = newCleanAttr();
    const note = new Note();
    note.addTag(tag);
    const attrToStay = note.addAttr(attr);
    const attrToGo = note.addAttr(attr).onTag(tag);

    note.removeTag(tag);

    expect(note.attrs.length).toBe(1);
    expect(note.attrs[0]).toBe(attrToStay);
});

test('hasTag returns correct value for tags in same space as it', () => {
    const tag = newCleanTag();
    tag.name = 'Test';
    const note = new Note();
    note.addTag(tag);

    expect(note.getTag('Test')).toBeTruthy();
    expect(note.getTag(tag)).toBeTruthy();
    expect(note.getTag('Willy')).toBeFalsy();
});

test('hasTag returns correct value for tags in different space as it', () => {
    const space1 = new Space('Space 1').clean();
    space1.id = 1;
    const space2 = new Space('Space 2').clean();
    space2.id = 2;
    const tag = newCleanTag().in(space2).clean();
    tag.name = 'Hello';
    tag.id = 3;
    const note = new Note().in(space1);
    note.addTag(tag);

    expect(note.getTag('Hello')).toBeFalsy();
    expect(note.getTag('Hello', 2)).toBeTruthy();
    expect(note.getTag('Hello', space2)).toBeTruthy();
    expect(note.getTag('Hello', space1)).toBeFalsy();
    expect(note.getTag('Goodbye', space2)).toBeFalsy();
});


test('addAttr adds new NoteAttr object', () => {
    const attr = newCleanAttr();
    const note = new Note();

    note.addAttr(attr);
    
    expect(note.attrs.length).toBe(1);
    expect(note.attrs[0].note).toBe(note);
    expect(note.attrs[0].attr).toBe(attr);
});

test('addAttr creates new NoteAttr object even if trying to add duplicate attr', () => {
    const attr = newCleanAttr();
    const note = new Note();
    note.addAttr(attr);

    note.addAttr(attr);

    expect(note.attrs.length).toBe(2);
    expect(note.attrs[0].note).toBe(note);
    expect(note.attrs[0].attr).toBe(attr);
    expect(note.attrs[1].note).toBe(note);
    expect(note.attrs[1].attr).toBe(attr);
});

test('addAttr doesnt undelete existing NoteAttr if trying to add duplicate attr', () => {
    const attr = newCleanAttr();
    const note = new Note();
    const na1 = note.addAttr(attr);
    na1.delete();

    const na2 = note.addAttr(attr);

    expect(note.attrs.length).toBe(2);
    expect(na1.isDeleted).toBe(true);
    expect(na2.isNew).toBe(true);
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

test('removeAttr can remove attr thats been added on tag', () => {
    const attr = newCleanAttr();
    const tag = newCleanTag();
    const note = new Note();
    const na1 = note.addAttr(attr);
    note.addAttr(attr).onTag(tag);

    note.removeAttr(attr, tag);

    expect(note.attrs.length).toBe(1);
    expect(note.attrs[0]).toBe(na1);
});

test('getValue returns correct value for attrs directly on note', () => {
    const attr = newCleanAttr();
    attr.name = 'Rumpy';
    const note = new Note();
    note.addAttr(attr).withValue('Pumpy');

    expect(note.getValue('Rumpy')).toBe('Pumpy');
    expect(note.getValue(attr)).toBe('Pumpy');

    expect(note.getValue('Lumpy')).toBeUndefined();
});

test('hasValue returns correct value for attrs directly on note', () => {
    const attr = newCleanAttr();
    attr.name = 'Rumpy';
    const note = new Note();
    note.addAttr(attr).withValue('Pumpy');

    expect(note.getAttr('Rumpy')).toBeTruthy();
    expect(note.getAttr(attr)).toBeTruthy();
    expect(note.getAttr('Lumpy')).toBeFalsy();
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
    const tag = new Tag('test').in(1).clean();
    tag.id = 1;
    const note = new Note('Hello');
    note.addTag(tag);
    JSON.stringify(note);
});

test('fromJSON reconstructs note correctly', () => {
    const note = new Note('Hello')
        .at(new Date(2024, 1, 15))
        .in(234)
        .setOwnTag('Taggy')
        .dirty();
    note.id = 123;
    const tag = new Tag('Testag').in(234).clean();
    tag.id = 345;
    note.addTag(tag);
    const attr = new Attr('Testat')
        .asNumber()
        .in(234).clean();
    attr.id = 456;
    note.addAttr(attr);

    const noteCopy = Note.fromJSON(JSON.parse(JSON.stringify(note)));

    expect(noteCopy).toBeInstanceOf(Note);
    expect(noteCopy.state).toBe(note.state);
    expect(noteCopy.id).toBe(note.id);
    expect(noteCopy.date).toBeInstanceOf(Date);
    expect(noteCopy.date.getTime()).toBe(note.date.getTime());
    expect(noteCopy.text).toBe(note.text);
    expect(noteCopy.spaceId).toBe(note.spaceId);

    expect(noteCopy.ownTag).toBeInstanceOf(Tag);
    expect(noteCopy.ownTag.id).toBe(note.ownTag.id);
    expect(noteCopy.ownTag.state).toBe(note.ownTag.state);

    expect(noteCopy.tags.length).toBe(1);
    expect(noteCopy.tags[0]).toBeInstanceOf(NoteTag);
    expect(noteCopy.tags[0].state).toBe(note.tags[0].state);
    expect(noteCopy.tags[0].tagId).toBe(note.tags[0].tagId);
    expect(noteCopy.tags[0].note).toBe(noteCopy);

    expect(noteCopy.attrs.length).toBe(1);
    expect(noteCopy.attrs[0]).toBeInstanceOf(NoteAttr);
    expect(noteCopy.attrs[0].state).toBe(note.attrs[0].state);
    expect(noteCopy.attrs[0].attrId).toBe(note.attrs[0].attrId);
    expect(noteCopy.attrs[0].note).toBe(noteCopy);
});

test('fromJSON reconstructs note correctly 2', () => {
    const noteJson = {
        state: 'NEW',
        id: 0,
        date: '2024-03-03T15:36:04.511Z',
        text: 'I plan to do something very important at some specific moment in the near future',
        spaceId: 2,
        ownTag: null,
        tags: undefined,
        attrs: undefined
    };
    const note = Note.fromJSON(noteJson);

    expect(note).toBeInstanceOf(Note);
    expect(note.state).toBe('NEW');
    expect(note.id).toBe(0);
    expect(note.date).toBeInstanceOf(Date);
    expect(note.text).toBe('I plan to do something very important at some specific moment in the near future');
    expect(note.spaceId).toBe(2);
    expect(note.ownTag).toBe(null);
    expect(note.tags.length).toBe(0);
    expect(note.attrs.length).toBe(0);
});