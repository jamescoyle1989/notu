import { expect, test } from 'vitest';
import Note from './Note';


test('gets initiated with sensible defaults', () => {
    const note = new Note();
    expect(note.id).toBe(0);
    expect(note.date.getTime() / 1000).toBeCloseTo(new Date().getTime() / 1000);
    expect(note.text).toBe('');
    expect(note.archived).toBe(false);
    expect(note.spaceId).toBe(0);
});

test('can duplicate itself', () => {
    const note = new Note();
    const copy = note.duplicate();
    expect(copy.id).toBe(note.id);
    expect(copy.date).toBe(note.date);
    expect(copy.text).toBe(note.text);
    expect(copy.archived).toBe(note.archived);
    expect(copy.spaceId).toBe(note.spaceId);
});