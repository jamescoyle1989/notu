import { expect, test } from 'vitest';
import Space from './Space';


test('Gets initiated as new', () => {
    const space = new Space();
    expect(space.isNew).toBe(true);
});


test('Set name marks space as dirty if currently clean', () => {
    const space = new Space().clean();
    space.name = 'asdf';
    expect(space.isDirty).toBe(true);
});

test('Set name doesnt change space state if new', () => {
    const space = new Space().new();
    space.name = 'asdf';
    expect(space.isNew).toBe(true);
});

test('Set name doesnt change space state if value not different', () => {
    const space = new Space().clean();
    space.name = '';
    expect(space.isClean).toBe(true);
});


test('Space can be initiated with name in constructor', () => {
    const space = new Space('hello');
    expect(space.name).toBe('hello');
});

test('can duplicate itself', () => {
    const space = new Space('hello').clean();
    const copy = space.duplicate();
    expect(copy.id).toBe(space.id);
    expect(copy.name).toBe(space.name);
    expect(copy.state).toBe(space.state);
});

test('validate fails if not new and id <= 0', () => {
    const model = new Space().clean();
    model.id = 0;
    expect(model.validate()).toBe(false);
});

test('validate throws error if arg set to true', () => {
    const model = new Space().clean();
    model.id = 0;
    expect(() => model.validate(true)).toThrowError();
});

test('fromJSON reconstructs Space correctly', () => {
    const space = new Space('Test').clean();
    space.id = 123;

    const spaceCopy = Space.fromJSON(space.toJSON());

    expect(spaceCopy).toBeInstanceOf(Space);
    expect(spaceCopy.state).toBe(space.state);
    expect(spaceCopy.id).toBe(space.id);
    expect(spaceCopy.name).toBe(space.name);
});