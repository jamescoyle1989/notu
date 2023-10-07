import { expect, test } from 'vitest';
import { splitQuery, identifyTags, identifyAttrs } from './QueryParser';


test('splitQuery should split out string into where, order', () => {
    const result = splitQuery('#Test AND #Info ORDER BY @Price DESC');

    expect(result.where).toBe('#Test AND #Info');
    expect(result.order).toBe('@Price DESC');
});

test('splitQuery should leave order null if not specified', () => {
    const result = splitQuery('#Test AND #Info');

    expect(result.where).toBe('#Test AND #Info');
    expect(result.order).toBeNull();
});

test('splitQuery should leave where null if not specified', () => {
    const result = splitQuery('ORDER BY @Price DESC');

    expect(result.where).toBeNull();
    expect(result.order).toBe('@Price DESC');
});


test('identifyTags should correctly identify multiple tags in query', () => {
    const result = splitQuery('#Test AND ~Info OR #~Me');

    result.where = identifyTags(result.where, result);

    expect(result.where).toBe('{tag0} AND {tag1} OR {tag2}');
    expect(result.tags[0].space).toBeNull();
    expect(result.tags[0].name).toBe('Test');
    expect(result.tags[0].includeOwner).toBe(false);
    expect(result.tags[0].searchDepth).toBe(1);
    expect(result.tags[0].strictSearchDepth).toBe(true);
    expect(result.tags[1].space).toBeNull();
    expect(result.tags[1].name).toBe('Info');
    expect(result.tags[1].includeOwner).toBe(true);
    expect(result.tags[1].searchDepth).toBe(0);
    expect(result.tags[1].strictSearchDepth).toBe(true);
    expect(result.tags[2].space).toBeNull();
    expect(result.tags[2].name).toBe('Me');
    expect(result.tags[2].includeOwner).toBe(true);
    expect(result.tags[2].searchDepth).toBe(1);
    expect(result.tags[2].strictSearchDepth).toBe(true);
});

test('identifyTags handles spaces in tag names if wrapped in brackets', () => {
    const result = splitQuery('#[I Am Long]');

    result.where = identifyTags(result.where, result);

    expect(result.where).toBe('{tag0}');
    expect(result.tags[0].space).toBeNull();
    expect(result.tags[0].name).toBe('I Am Long');
    expect(result.tags[0].includeOwner).toBe(false);
    expect(result.tags[0].searchDepth).toBe(1);
    expect(result.tags[0].strictSearchDepth).toBe(true);
});

test('identifyTags can identify tag spaces', () => {
    const result = splitQuery('#Space1.Tag1 AND #[Space 2.Tag 2]');

    result.where = identifyTags(result.where, result);
    
    expect(result.where).toBe('{tag0} AND {tag1}');
    expect(result.tags[0].space).toBe('Space1');
    expect(result.tags[0].name).toBe('Tag1');
    expect(result.tags[0].includeOwner).toBe(false);
    expect(result.tags[0].searchDepth).toBe(1);
    expect(result.tags[0].strictSearchDepth).toBe(true);
    expect(result.tags[1].space).toBe('Space 2');
    expect(result.tags[1].name).toBe('Tag 2');
    expect(result.tags[1].includeOwner).toBe(false);
    expect(result.tags[1].searchDepth).toBe(1);
    expect(result.tags[1].strictSearchDepth).toBe(true);
});

test('identifyAttrs can correctly identify multiple attrs in query', () => {
    const result = splitQuery('@Count > 3 AND @Depth < 4');

    result.where = identifyAttrs(result.where, result);

    expect(result.where).toBe('{attr0} > 3 AND {attr1} < 4');
    expect(result.attrs[0].space).toBeNull();
    expect(result.attrs[0].name).toBe('Count');
    expect(result.attrs[0].exists).toBe(false);
    expect(result.attrs[1].space).toBeNull();
    expect(result.attrs[1].name).toBe('Depth');
    expect(result.attrs[1].exists).toBe(false);
});

test('identifyAttrs can identify space names', () => {
    const result = splitQuery('@MySpace.Count = 123');
    
    result.where = identifyAttrs(result.where, result);

    expect(result.where).toBe('{attr0} = 123');
    expect(result.attrs[0].space).toBe('MySpace');
    expect(result.attrs[0].name).toBe('Count');
    expect(result.attrs[0].exists).toBe(false);
});

test('identifyAttrs can identify exists queries', () => {
    const result = splitQuery('@Help.Exists()');

    result.where = identifyAttrs(result.where, result);

    expect(result.where).toBe('{attr0}');
    expect(result.attrs[0].space).toBeNull();
    expect(result.attrs[0].name).toBe('Help');
    expect(result.attrs[0].exists).toBe(true);
});

test('identifyAttrs can identify on tag filters', () => {
    const result = splitQuery('@Abc.On(MyTag) > 1');

    result.where = identifyAttrs(result.where, result);

    expect(result.where).toBe('{attr0} > 1');
    expect(result.attrs[0].name).toBe('Abc');
    expect(result.attrs[0].exists).toBe(false);
    expect(result.attrs[0].tagNameFilters[0].name).toBe('MyTag');
});

test('identifyAttrs can handle attr and space names with spaces in them', () => {
    const result = splitQuery('@[My Space.Test Test] = 123');

    result.where = identifyAttrs(result.where, result);

    expect(result.where).toBe('{attr0} = 123');
    expect(result.attrs[0].space).toBe('My Space');
    expect(result.attrs[0].name).toBe('Test Test');
});

test('identifyAttrs can support multiple pipe-separated on(tag) filters', () => {
    const result = splitQuery('@Abc.Exists().On(Tag1|#Space2.Tag2)');

    result.where = identifyAttrs(result.where, result);

    expect(result.where).toBe('{attr0}');
    expect(result.attrs[0].name).toBe('Abc');
    expect(result.attrs[0].exists).toBe(true);
    expect(result.attrs[0].tagNameFilters.length).toBe(2);
    expect(result.attrs[0].tagNameFilters[0].name).toBe('Tag1');
    expect(result.attrs[0].tagNameFilters[0].space).toBeNull();
    expect(result.attrs[0].tagNameFilters[0].searchDepth).toBe(0);
    expect(result.attrs[0].tagNameFilters[1].name).toBe('Tag2');
    expect(result.attrs[0].tagNameFilters[1].space).toBe('Space2');
    expect(result.attrs[0].tagNameFilters[1].searchDepth).toBe(1);
});