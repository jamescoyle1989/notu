import { expect, test } from 'vitest';
import { CachedClient } from './CachedClient';
import { NotuClient, NotuLoginResult } from './HttpClient';
import { Attr, Note, NoteAttr, NoteTag, Space, Tag } from '..';
import { newAttr, newSpace, newTag, newNote } from '../TestHelpers';

const _spaceId = 100;
const _attrId = 200;
const _noteId = 300;

class MockClient implements NotuClient {
    log: Array<string> = [];
    
    login(username: string, password: string): Promise<NotuLoginResult> {
        this.log.push(`login('${username}', '${password}')`);
        return Promise.resolve({ success: true, error: null, token: 'abc.def.ghi' });
    }

    getSpaces(): Promise<Array<Space>> {
        this.log.push('getSpaces');
        return Promise.resolve([newSpace('Space1', _spaceId).clean()]);
    }

    saveSpace(space: Space): Promise<Space> {
        this.log.push('saveSpace');
        return Promise.resolve(space);
    }

    getAttrs(spaceId: number): Promise<Array<Attr>> {
        this.log.push(`getAttrs(${spaceId})`);
        return Promise.resolve([newAttr('Attr1', _attrId).in(_spaceId).asText().clean()]);
    }

    saveAttr(attr: Attr): Promise<Attr> {
        this.log.push('saveAttr');
        return Promise.resolve(attr);
    }

    getTags(): Promise<Array<Tag>> {
        this.log.push('getTags');
        return Promise.resolve([
            newTag('Tag1', _spaceId, 123),
            newTag('Tag2', _spaceId, _noteId)
        ]);
    }

    getNotes(query: string, spaceId: number): Promise<Array<Note>> {
        this.log.push(`getNotes('${query}', ${spaceId})`);
        const note = newNote('ghi', _noteId).in(_spaceId);
        note.tags.push(new NoteTag(note, 123));
        note.attrs.push(new NoteAttr(note, _attrId, 'hello'));
        note.clean();
        return Promise.resolve([note]);
    }

    getNoteCount(query: string, spaceId: number): Promise<number> {
        this.log.push(`getNoteCount('${query}', ${spaceId})`);
        return Promise.resolve(1);
    }

    saveNotes(notes: Array<Note>): Promise<Array<Note>> {
        this.log.push('saveNotes');
        return Promise.resolve(notes);
    }

    customJob(name: string, data: any): Promise<any> {
        this.log.push(`customJob(${name})`);
        return Promise.resolve(null);
    }
}



test('constructor takes NotuClient implementation', () => {
    new CachedClient(new MockClient());
});


test('getSpaces wont fetch twice', async () => {
    const internal = new MockClient();
    const client = new CachedClient(internal);

    await client.getSpaces();
    expect(internal.log.filter(x => x == 'getSpaces').length).toBe(1);

    await client.getSpaces();
    expect(internal.log.filter(x => x == 'getSpaces').length).toBe(1);
});

test('saveSpace updates the cache', async () => {
    const client = new CachedClient(new MockClient());
    await client.getSpaces();
    const newSpace = new Space('Test').clean();
    newSpace.id = 999;

    await client.saveSpace(newSpace);

    const spaces = await client.getSpaces();
    expect(spaces).toContain(newSpace);
});


test('getTags wont fetch twice', async () => {
    const internal = new MockClient();
    const client = new CachedClient(internal);

    await client.getTags();
    expect(internal.log.filter(x => x == 'getTags').length).toBe(1);

    await client.getTags();
    expect(internal.log.filter(x => x == 'getTags').length).toBe(1);
});

test('saveNote updates the cache if note has its own tag', async () => {
    const client = new CachedClient(new MockClient());
    await client.getTags();
    const myNote = newNote('I have my own tag', 777).setOwnTag('Sexy');
    myNote.ownTag.id = 777;
    myNote.clean();
    myNote.ownTag.clean();

    await client.saveNotes([myNote]);

    const tags = await client.getTags();
    expect(tags).toContain(myNote.ownTag);
});

test('getNotes will populate related tags & attrs', async () => {
    const client = new CachedClient(new MockClient());
    await client.getSpaces();
    await client.getTags();
    await client.getAttrs(0);

    const note = (await client.getNotes('some query', _spaceId))[0];

    expect(note.space.name).toBe('Space1');
    expect(note.tags[0].tag.name).toBe('Tag1');
    expect(note.attrs[0].attr.name).toBe('Attr1');
    expect(note.ownTag.name).toBe('Tag2');
    expect(note.isClean).toBeTruthy();
});

test('cacheAll allows for specifying a spaceId to limit attrs that are retrieved', async () => {
    const internal = new MockClient();
    const client = new CachedClient(internal);

    await client.cacheAll(_spaceId);

    expect(internal.log).toContain('getSpaces');
    expect(internal.log).toContain('getTags');
    expect(internal.log).toContain(`getAttrs(${_spaceId})`);
});