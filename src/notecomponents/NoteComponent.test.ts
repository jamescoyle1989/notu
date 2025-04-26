import { expect, test } from 'vitest';
import { NoteComponent, NoteComponentInfo, NoteComponentProcessor, splitNoteTextIntoComponents } from './NoteComponent';
import Note from '../models/Note';


class NoteTest1 implements NoteComponent {
    getText(): string {
        return 'Test1';
    }

    getTypeInfo(): string {
        return 'NoteTest1';
    }
}

class Test1Processor implements NoteComponentProcessor {
    get displayName(): string { return 'Test 1'; }

    newComponentText(contentText: string): string {
        return `<Test1>${contentText}</Test1>`;
    }

    get componentShowsInlineInParagraph(): boolean { return false; }

    identify(text: string): NoteComponentInfo {
        const start = text.indexOf('<Test1>');
        if (start < 0)
            return null;

        return new NoteComponentInfo('<Test1>', start, this);
    }

    create(info: NoteComponentInfo, note: Note, save: () => Promise<void>): NoteTest1 {
        return new NoteTest1();
    }
}


class NoteTest2 implements NoteComponent {
    getText(): string {
        return 'Test2';
    }

    getTypeInfo(): string {
        return 'NoteTest2';
    }
}

class Test2Processor implements NoteComponentProcessor {
    get displayName(): string { return 'Test 2'; }

    newComponentText(contentText: string): string {
        return `<Test2>${contentText}</Test2>`;
    }

    get componentShowsInlineInParagraph(): boolean { return false; }

    identify(text: string): NoteComponentInfo {
        const start = text.indexOf('<Test2>');
        if (start < 0)
            return null;

        return new NoteComponentInfo('<Test2>', start, this);
    }

    create(info: NoteComponentInfo, note: Note, save: () => Promise<void>): NoteTest2 {
        return new NoteTest2();
    }
}


class InlineTest implements NoteComponent {
    getText(): string {
        return 'Inline';
    }

    getTypeInfo(): string {
        return 'InlineTest';
    }
}

class InlineTestProcessor implements NoteComponentProcessor {
    get displayName(): string { return 'Inline'; }

    newComponentText(contentText: string): string {
        return `<Inline>${contentText}</Inline>`;
    }

    get componentShowsInlineInParagraph(): boolean { return true; }

    identify(text: string): NoteComponentInfo {
        const start = text.indexOf('<Inline>');
        if (start < 0)
            return null;

        return new NoteComponentInfo('<Inline>', start, this);
    }

    create(info: NoteComponentInfo, note: Note, save: () => Promise<void>): InlineTest {
        return new InlineTest();
    }
}


class Text implements NoteComponent {
    text: string;

    getText(): string {
        return this.text;
    }

    getTypeInfo(): string {
        return 'Text';
    }
}

class DefaultProcessor implements NoteComponentProcessor {
    get displayName(): string { return null; }

    newComponentText(contentText: string): string {
        return contentText;
    }

    get componentShowsInlineInParagraph(): boolean { return true; }

    identify(text: string): NoteComponentInfo {
        return new NoteComponentInfo(text, 0, this);
    }

    create(info: NoteComponentInfo, note: Note, save: () => Promise<void>): Text {
        const output = new Text();
        output.text = info.text;
        return output;
    }
}


class Paragraph implements NoteComponent {
    children: Array<NoteComponent>;

    constructor(children: Array<NoteComponent>) {
        this.children = children;
    }

    getText(): string {
        return this.children.map(x => x.getText()).join('');
    }

    getTypeInfo(): string {
        return 'Paragraph';
    }
}

function groupComponents(components: Array<NoteComponent>): NoteComponent {
    return new Paragraph(components);
}


test('splitNoteTextIntoComponents returns components array correctly', () => {
    const note = new Note('<Test1><Test1><Test2>');

    const components = splitNoteTextIntoComponents(
        note,
        null,
        [new Test1Processor(), new Test2Processor(), new InlineTestProcessor()],
        new DefaultProcessor(),
        groupComponents
    );

    expect(components.length).toBe(3);
    expect(components[0].getText()).toBe('Test1');
    expect(components[1].getText()).toBe('Test1');
    expect(components[2].getText()).toBe('Test2');
});

test('splitNoteTextIntoComponents can correctly handle default text', () => {
    const note = new Note('I am some text <Test2>');

    const components = splitNoteTextIntoComponents(
        note,
        null,
        [new Test1Processor(), new Test2Processor(), new InlineTestProcessor()],
        new DefaultProcessor(),
        groupComponents
    );

    expect(components.length).toBe(2);
    expect(components[0].getText()).toBe('I am some text ');
    expect(components[1].getText()).toBe('Test2');
});

test('splitNoteTextIntoComponents can correctly group inline components', () => {
    const note = new Note('I am some <Inline> text <Test1>');

    const components = splitNoteTextIntoComponents(
        note,
        null,
        [new Test1Processor(), new Test2Processor(), new InlineTestProcessor()],
        new DefaultProcessor(),
        groupComponents
    );

    expect(components.length).toBe(2);
    const paragraph = components[0] as Paragraph;
    expect(paragraph.children.length).toBe(3);
    expect(paragraph.children[0].getText()).toBe('I am some ');
    expect(paragraph.children[1].getText()).toBe('Inline');
    expect(paragraph.children[2].getText()).toBe(' text ');
    expect(components[1].getText()).toBe('Test1');
});