import { expect, test } from 'vitest';
import { CachedClient } from './CachedClient';
import { NotuClient, NotuLoginResult } from './HttpClient';
import { Attr, Note, NoteAttr, NoteTag, Space, Tag } from '..';


class MockClient implements NotuClient {
    log: Array<string> = [];
    
    login(username: string, password: string): Promise<NotuLoginResult> {
        this.log.push('login');
        return Promise.resolve({ success: true, error: null, token: 'abc.def.ghi' });
    }

    getSpaces(): Promise<Array<Space>> {
        this.log.push('getSpaces');
        const space = new Space('abc').clean();
        space.id = 123;
        return Promise.resolve([space]);
    }

    saveSpace(space: Space): Promise<Space> {
        this.log.push('saveSpace');
        return Promise.resolve(space);
    }

    getAttrs(spaceId: number): Promise<Array<Attr>> {
        this.log.push('getAttrs');
        const attr = new Attr('def').in(123).asText().clean();
        attr.id = 456;
        return Promise.resolve([attr]);
    }

    saveAttr(attr: Attr): Promise<Attr> {
        this.log.push('saveAttr');
        return Promise.resolve(attr);
    }

    getTags(): Promise<Array<Tag>> {
        this.log.push('getTags');
        const tag = new Tag('jkl', 123);
        tag.id = 234;
        return Promise.resolve([tag]);
    }

    getNotes(query: string, spaceId: number): Promise<Array<Note>> {
        this.log.push('getNotes');
        const note = new Note('ghi').in(123);
        note.tags.push(new NoteTag(note, 234));
        note.attrs.push(new NoteAttr(note, 456, 'hello'));
        note.id = 789;
        note.clean();
        return Promise.resolve([note]);
    }

    getNoteCount(query: string, spaceId: number): Promise<number> {
        this.log.push('getNoteCount');
        return Promise.resolve(1);
    }

    saveNotes(notes: Array<Note>): Promise<Array<Note>> {
        this.log.push('saveNotes');
        return Promise.resolve(notes);
    }

    customJob(name: string, data: any): Promise<any> {
        this.log.push('customJob');
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
    const newNote = new Note('I have my own tag').setOwnTag('Sexy');
    newNote.id = 777;
    newNote.ownTag.id = 777;
    newNote.clean();
    newNote.ownTag.clean();

    await client.saveNotes([newNote]);

    const tags = await client.getTags();
    expect(tags).toContain(newNote.ownTag);
});

test('getNotes will populate related tags & attrs', async () => {
    const client = new CachedClient(new MockClient());
    await client.getSpaces();
    await client.getTags();
    await client.getAttrs(0);

    const note = (await client.getNotes('asdf', 123))[0];

    expect(note.space.name).toBe('abc');
    expect(note.tags[0].tag.name).toBe('jkl');
    expect(note.attrs[0].attr.name).toBe('def');
});