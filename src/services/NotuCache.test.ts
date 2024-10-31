import { expect, test } from 'vitest';
import { NotuCache } from './NotuCache';
import { newNote, newSpace, newTag, testCacheFetcher } from '../TestHelpers';


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

test('noteFromJSON populates data if present', async () => {
    const cache = new NotuCache(testCacheFetcher());
    await cache.populate();
    const note = newNote('Hello', 1).in(cache.getSpace(1)).clean();
    note.addTag(newTag('Address', 2).in(cache.getSpace(1)).clean()).withData({name: '123 Fake Street'});

    const fromJSON = cache.noteFromJSON(note.toJSON());

    expect(fromJSON.tags[0].data.name).toBe('123 Fake Street');
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


test('getTagByName returns correct tag if found', async () => {
    const cache = new NotuCache(testCacheFetcher());
    await cache.populate();

    expect(cache.getTagByName('Tag 2', 1).id).toBe(2);
    expect(cache.getTagByName('Tag 2', newSpace('Space 1', 1).clean()).id).toBe(2);
});

test('getTagByName returns undefined if tag not found', async () => {
    const cache = new NotuCache(testCacheFetcher());
    await cache.populate();

    expect(cache.getTagByName('Non-existent', 5)).toBe(undefined);
});

test('getTagByName returns correct result when there are multiple tags with the same name', async () => {
    const cache = new NotuCache(testCacheFetcher());
    await cache.populate();
    cache.tagSaved({id: 5, state: 'NEW', name: 'Duplicate', spaceId: 1, links: []});
    cache.tagSaved({id: 6, state: 'NEW', name: 'Duplicate', spaceId: 2, links: []});

    expect(cache.getTagByName('Duplicate', 1).id).toBe(5);
    expect(cache.getTagByName('Duplicate', 2).id).toBe(6);
});

test('getTagsByName returns all tags with particular name', async () => {
    const cache = new NotuCache(testCacheFetcher());
    await cache.populate();
    cache.tagSaved({id: 5, state: 'NEW', name: 'Duplicate', spaceId: 1, links: []});
    cache.tagSaved({id: 6, state: 'NEW', name: 'Duplicate', spaceId: 2, links: []});

    expect(cache.getTagsByName('Duplicate').map(x => x.id)).toEqual([5,6]);
});

test('getTagsByName returns empty array if tag name doesnt exist', async () => {
    const cache = new NotuCache(testCacheFetcher());
    await cache.populate();

    expect(cache.getTagsByName('Doesnt Exist').map(x => x.id)).toHaveLength(0);
});