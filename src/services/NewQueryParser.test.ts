import { expect, test } from 'vitest';
import newParseQuery, { splitQuery, identifyTags } from './NewQueryParser';


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
    const result = splitQuery('#Test AND @Info OR @_#Me');

    result.where = identifyTags(result.where, result);

    expect(result.where).toBe('{tag0} AND {tag1} OR {tag2}');
    expect(result.tags[0].space).toBeNull();
    expect(result.tags[0].name).toBe('Test');
    expect(result.tags[0].searchDepths).toEqual([1]);
    expect(result.tags[1].space).toBeNull();
    expect(result.tags[1].name).toBe('Info');
    expect(result.tags[1].searchDepths).toEqual([0]);
    expect(result.tags[2].space).toBeNull();
    expect(result.tags[2].name).toBe('Me');
    expect(result.tags[2].searchDepths).toEqual([0, 2]);
});

test('identifyTags handles spaces in tag names if wrapped in brackets', () => {
    const result = splitQuery('#[I Am Long]');

    result.where = identifyTags(result.where, result);

    expect(result.where).toBe('{tag0}');
    expect(result.tags[0].space).toBeNull();
    expect(result.tags[0].name).toBe('I Am Long');
    expect(result.tags[0].searchDepths).toEqual([1]);
});

test('identifyTags can identify tag spaces', () => {
    const result = splitQuery('#Space1.Tag1 AND #[Space 2.Tag 2]');

    result.where = identifyTags(result.where, result);
    
    expect(result.where).toBe('{tag0} AND {tag1}');
    expect(result.tags[0].space).toBe('Space1');
    expect(result.tags[0].name).toBe('Tag1');
    expect(result.tags[0].searchDepths).toEqual([1]);
    expect(result.tags[1].space).toBe('Space 2');
    expect(result.tags[1].name).toBe('Tag 2');
    expect(result.tags[1].searchDepths).toEqual([1]);
});

test('identifyTags can identify data criteria attached to tag', () => {
    const result = splitQuery('#Person{.height.meters > 1.8 AND .weight[0] < 80} OR #Dog');

    result.where = identifyTags(result.where, result);

    expect(result.where).toBe('{tag0} OR {tag1}');
    expect(result.tags[0].space).toBeNull();
    expect(result.tags[0].name).toBe('Person');
    expect(result.tags[0].searchDepths).toEqual([1]);
    expect(result.tags[0].filter.pattern).toBe('{exp0} > 1.8 AND {exp1} < 80');
    expect(result.tags[0].filter.exps[0]).toBe('height.meters');
    expect(result.tags[0].filter.exps[1]).toBe('weight[0]');
    expect(result.tags[1].space).toBeNull();
    expect(result.tags[1].name).toBe('Dog');
    expect(result.tags[1].searchDepths).toEqual([1]);
    expect(result.tags[1].filter).toBeNull();
});

test('ordering by date property works correctly', () => {
    const result = newParseQuery(`_#Tasks.Setup AND #General.Finished ORDER BY #General.Finished{(.date)::date} DESC`);

    expect(result.where).toBe(`{tag0} AND {tag1}`);
    expect(result.order).toBe(`{tag2} DESC`);
    expect(result.tags).toHaveLength(3);

    expect(result.tags[0].space).toBe('Tasks');
    expect(result.tags[0].name).toBe('Setup');
    expect(result.tags[0].searchDepths).toEqual([2]);
    expect(result.tags[0].filter).toBeNull();

    expect(result.tags[1].space).toBe('General');
    expect(result.tags[1].name).toBe('Finished');
    expect(result.tags[1].searchDepths).toEqual([1]);
    expect(result.tags[1].filter).toBeNull();

    expect(result.tags[2].space).toBe('General');
    expect(result.tags[2].name).toBe('Finished');
    expect(result.tags[2].searchDepths).toEqual([1]);
    expect(result.tags[2].filter.pattern).toBe(`({exp0})::date`);
    expect(result.tags[2].filter.exps).toHaveLength(1);
    expect(result.tags[2].filter.exps[0]).toBe(`date`);
});