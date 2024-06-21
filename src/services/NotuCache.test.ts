import { expect, test } from 'vitest';
import { NotuCache } from './NotuCache';
import { newNote, newTag, testCacheFetcher } from '../TestHelpers';


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

test('initial populate creates links between tags', async () => {
    const cache = new NotuCache(testCacheFetcher());
    await cache.populate();

    for (const tag of cache.getTags())
        expect(tag.links.length).toBe(2);
    expect(cache.getTag(1).links).toContain(cache.getTag(2));
    expect(cache.getTag(1).links).toContain(cache.getTag(3));
});

test('tagSaved for new tag sets up links', async () => {
    const cache = new NotuCache(testCacheFetcher());
    await cache.populate();

    const hippoData = newTag('hippo', 123).toJSON();
    hippoData.links = [1, 3];
    const hippo = cache.tagSaved(hippoData);

    expect(hippo.links.length).toBe(2);
    expect(hippo.links[0].name).toBe('Tag 1');
    expect(hippo.links[1].name).toBe('Tag 3');
});