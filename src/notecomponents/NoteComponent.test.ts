import { expect, test } from 'vitest';
import { NoteComponent, NoteComponentProcessor, splitNoteTextIntoComponents } from './NoteComponent';
import Note from '../models/Note';
import { NmlElement } from './NmlParser';


class NoteTest1 implements NoteComponent {
    getText(): string { return '<Test1/>'; }

    get typeInfo(): string { return 'NoteTest1'; }

    get displaysInline(): boolean { return false; }
}

class Test1Processor implements NoteComponentProcessor {q
    get displayName(): string { return 'Test 1'; }

    get tagName(): string { return 'Test1'; }

    newComponentText(contentText: string): string {
        return `<Test1>${contentText}</Test1>`;
    }

    create(data: NmlElement, note: Note, save: () => Promise<void>): NoteTest1 {
        return new NoteTest1();
    }
}


class NoteTest2 implements NoteComponent {
    getText(): string { return '<Test2/>'; }

    get typeInfo(): string { return 'NoteTest2'; }

    get displaysInline(): boolean { return false; }
}

class Test2Processor implements NoteComponentProcessor {
    get displayName(): string { return 'Test 2'; }

    get tagName(): string { return 'Test2'; }

    newComponentText(contentText: string): string {
        return `<Test2>${contentText}</Test2>`;
    }

    create(data: NmlElement, note: Note, save: () => Promise<void>): NoteTest2 {
        return new NoteTest2();
    }
}


class InlineTest implements NoteComponent {
    getText(): string { return '<Inline/>'; }

    get typeInfo(): string { return 'InlineTest'; }

    get displaysInline(): boolean { return true; }
}

class InlineTestProcessor implements NoteComponentProcessor {
    get displayName(): string { return 'Inline'; }

    get tagName(): string { return 'Inline'; }

    newComponentText(contentText: string): string {
        return `<Inline>${contentText}</Inline>`;
    }

    create(data: NmlElement, note: Note, save: () => Promise<void>): InlineTest {
        return new InlineTest();
    }
}


class Text implements NoteComponent {
    private _text: string;

    constructor(text: string) {
        this._text = text;
    }

    getText(): string { return this._text; }

    get typeInfo(): string { return 'Text'; }

    get displaysInline(): boolean { return true; }
}


class Paragraph implements NoteComponent {
    children: Array<NoteComponent>;

    constructor(children: Array<NoteComponent>) {
        this.children = children;
    }

    getText(): string { return this.children.map(x => x.getText()).join(''); }

    get typeInfo(): string { return 'Paragraph'; }

    get displaysInline(): boolean { return false; }
}

function groupComponents(components: Array<NoteComponent>): NoteComponent {
    return new Paragraph(components);
}


test('splitNoteTextIntoComponents returns components array correctly', () => {
    const note = new Note('<Test1/><Test1/><Test2/>');

    const components = splitNoteTextIntoComponents(
        note,
        null,
        [new Test1Processor(), new Test2Processor(), new InlineTestProcessor()],
        text => new Text(text),
        groupComponents
    );

    expect(components.length).toBe(3);
    expect(components[0].getText()).toBe('<Test1/>');
    expect(components[1].getText()).toBe('<Test1/>');
    expect(components[2].getText()).toBe('<Test2/>');
});

test('splitNoteTextIntoComponents can correctly handle default text', () => {
    const note = new Note('I am some text <Test2/>');

    const components = splitNoteTextIntoComponents(
        note,
        null,
        [new Test1Processor(), new Test2Processor(), new InlineTestProcessor()],
        text => new Text(text),
        groupComponents
    );

    expect(components.length).toBe(2);
    expect(components[0].getText()).toBe('I am some text ');
    expect(components[1].getText()).toBe('<Test2/>');
});

test('splitNoteTextIntoComponents can correctly group inline components', () => {
    const note = new Note('I am some <Inline/> text <Test1/>');

    const components = splitNoteTextIntoComponents(
        note,
        null,
        [new Test1Processor(), new Test2Processor(), new InlineTestProcessor()],
        text => new Text(text),
        groupComponents
    );

    expect(components.length).toBe(2);
    const paragraph = components[0] as Paragraph;
    expect(paragraph.children.length).toBe(3);
    expect(paragraph.children[0].getText()).toBe('I am some ');
    expect(paragraph.children[1].getText()).toBe('<Inline/>');
    expect(paragraph.children[2].getText()).toBe(' text ');
    expect(components[1].getText()).toBe('<Test1/>');
});