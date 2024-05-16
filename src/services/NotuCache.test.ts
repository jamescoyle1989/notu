import { expect, test } from 'vitest';
import { NotuCache } from './NotuCache';
import { newNote, testCacheFetcher } from '../TestHelpers';


test('noteFromJSON pulls ownTag from cache if state is clean', async () => {
    const cache = new NotuCache(testCacheFetcher());
    await cache.populate();
    const note = newNote('Hello', 1).in(cache.getSpace(1)).setOwnTag('Horse').clean();
    note.ownTag.clean();

    const fromJSON = cache.noteFromJSON(note.toJSON());

    expect(fromJSON.ownTag).toBe(cache.getTag(1));
});

test('noteFromJSON uses existing ownTag data if state is not clean', async () => {
    const cache = new NotuCache(testCacheFetcher());
    await cache.populate();
    const note = newNote('Hello', 1).in(cache.getSpace(1)).setOwnTag('Pony').clean();

    const fromJSON = cache.noteFromJSON(note.toJSON());

    expect(fromJSON.ownTag.name).toBe('Pony');
    expect(fromJSON.ownTag.state).toBe('NEW');
});

test('noteFromJSON handles if ownTag is null', async () => {
    const cache = new NotuCache(testCacheFetcher());
    await cache.populate();
    const note = newNote('Hello', 1).in(cache.getSpace(1)).clean();

    const fromJSON = cache.noteFromJSON(note.toJSON());

    expect(fromJSON.ownTag.name).toBe('Tag 1');
});