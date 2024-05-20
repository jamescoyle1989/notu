import { expect, test } from 'vitest';
import { Notu } from './Notu';
import { NotuClient, NotuLoginResult } from './HttpClient';
import { Attr, Note, NotuCache, Space, Tag } from '..';
import { newNote, newSpace, testCacheFetcher } from '../TestHelpers';

class MockClient implements NotuClient {
    log: Array<string> = [];
    
    login(username: string, password: string): Promise<NotuLoginResult> {
        this.log.push(`login('${username}', '${password}')`);
        return Promise.resolve({ success: true, error: null, token: 'abc.def.ghi' });
    }

    setup(): Promise<void> {
        this.log.push('setup');
        return Promise.resolve();
    }

    saveSpace(space: Space): Promise<Space> {
        this.log.push('saveSpace');
        return Promise.resolve(space);
    }

    saveAttr(attr: Attr): Promise<Attr> {
        this.log.push('saveAttr');
        return Promise.resolve(attr);
    }

    getNotes(query: string, spaceId: number): Promise<Array<any>> {
        this.log.push(`getNotes('${query}', ${spaceId})`);
        return Promise.resolve([
            {
                id: 2,
                state: 'CLEAN',
                date: new Date(),
                text: 'Hello, this is a test',
                spaceId: 1,
                ownTag: { id: 2, state: 'CLEAN', name: 'Test', spaceId: 1, color: '#FF00FF', isPublic: true },
                tags: [
                    { tagId: 1, state: 'CLEAN', attrs: [] }
                ],
                attrs: [
                    { attrId: 1, state: 'CLEAN', tagId: null, value: 'Im an attr value' },
                    { attrId: 2, state: 'CLEAN', tagId: null, value: 123 },
                    { attrId: 4, state: 'CLEAN', tagId: null, value: '2024-04-17' }
                ]
            }
        ]);
    }

    getNoteCount(query: string, spaceId: number): Promise<number> {
        this.log.push(`getNoteCount('${query}', ${spaceId})`);
        return Promise.resolve(1);
    }

    getRelatedNotes(tag: Tag | Note | number): Promise<Array<any>> {
        this.log.push(`getRelatedNotes('${tag})`);
        return Promise.resolve([
            {
                id: 2,
                state: 'CLEAN',
                date: new Date(),
                text: 'Hello, this is a test',
                spaceId: 1,
                ownTag: { id: 2, state: 'CLEAN', name: 'Test', spaceId: 1, color: '#FF00FF', isPublic: true },
                tags: [
                    { tagId: 1, state: 'CLEAN', attrs: [] }
                ],
                attrs: [
                    { attrId: 1, state: 'CLEAN', tagId: null, value: 'Im an attr value' },
                    { attrId: 2, state: 'CLEAN', tagId: null, value: 123 },
                    { attrId: 4, state: 'CLEAN', tagId: null, value: '2024-04-17' }
                ]
            }
        ]);
    }

    saveNotes(notes: Array<Note>): Promise<Array<any>> {
        this.log.push('saveNotes');
        return Promise.resolve(JSON.parse(JSON.stringify(notes)));
    }

    customJob(name: string, data: any): Promise<any> {
        this.log.push(`customJob(${name})`);
        return Promise.resolve(null);
    }
}



test('constructor takes NotuClient implementation', () => {
    new Notu(new MockClient(), new NotuCache(testCacheFetcher()));
});


test('saveSpace updates the cache', async () => {
    const notu = new Notu(new MockClient(), new NotuCache(testCacheFetcher()));
    await notu.cache.populate();
    const space = newSpace('Test', 999).clean();

    await notu.saveSpace(space);

    expect(notu.getSpace(999)).toStrictEqual(space);
});


test('saveNote updates the cache if note has its own tag', async () => {
    const notu = new Notu(new MockClient(), new NotuCache(testCacheFetcher()));
    await notu.cache.populate();
    const space = notu.cache.getSpace(1);
    const myNote = newNote('I have my own tag', 777).in(space).setOwnTag('Sexy').clean();

    await notu.saveNotes([myNote]);

    expect(notu.getTag(777)).toStrictEqual(myNote.ownTag);
});

test('getNotes will populate related tags & attrs', async () => {
    const notu = new Notu(new MockClient(), new NotuCache(testCacheFetcher()));
    await notu.cache.populate();

    const note = (await notu.getNotes('some query', 1))[0];

    expect(note.space.name).toBe('Space 1');
    expect(note.tags[0].tag.name).toBe('Tag 1');
    expect(note.attrs[0].attr.name).toBe('Attr 1');
    expect(note.ownTag.name).toBe('Tag 2');
});

test('getNotes returns clean objects', async () => {
    const notu = new Notu(new MockClient(), new NotuCache(testCacheFetcher()));
    await notu.cache.populate();

    const note = (await notu.getNotes('some query', 1))[0];

    expect(note.isClean).toBeTruthy();
    expect(note.tags[0].isClean).toBeTruthy();
    expect(note.attrs[0].isClean).toBeTruthy();
    expect(note.ownTag.isClean).toBeTruthy();
});

test('getNotes ensures NoteAttr values for date attrs are actually dates', async () => {
    const notu = new Notu(new MockClient(), new NotuCache(testCacheFetcher()));
    await notu.cache.populate();

    const note = (await notu.getNotes('some query', 1))[0];

    expect(note.attrs.find(x => x.attr.isDate).value.getTime()).toBe(new Date('2024-04-17').getTime());
    expect(note.attrs.find(x => x.attr.isNumber).value).toBe(123);
});