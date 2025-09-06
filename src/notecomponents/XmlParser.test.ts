import { expect, test } from 'vitest';
import { parseNoteXml, NoteXmlElement } from './XmlParser';


test ('parseNoteXml can correctly process just text on its own', () => {
    const result = parseNoteXml('This is some text');

    expect(result.length).toBe(1);
    expect(result[0]).toBe('This is some text');
});


test('parseNoteXml can correctly process an xml element on its own', () => {
    const result = parseNoteXml('<Test></Test>');

    expect(result.length).toBe(1);
    const elem1 = result[0] as NoteXmlElement;
    expect(elem1.tag).toBe('Test');
    expect(elem1.children).toHaveLength(0);
    expect(elem1.length).toBe(13);
});


test('parseNoteXml can correctly process a self-closing xml element', () => {
    const result = parseNoteXml('<Test/>');

    expect(result.length).toBe(1);
    const elem1 = result[0] as NoteXmlElement;
    expect(elem1.tag).toBe('Test');
    expect(elem1.children).toHaveLength(0);
    expect(elem1.length).toBe(7);
});


test('parseNoteXml can correctly process an xml element with text inside', () => {
    const result = parseNoteXml('<Test>123</Test>');

    expect(result.length).toBe(1);
    const elem1 = result[0] as NoteXmlElement;
    expect(elem1.tag).toBe('Test');
    expect(elem1.children).toHaveLength(1);
    expect(elem1.children[0]).toBe('123');
    expect(elem1.length).toBe(16);
});


test('parseNoteXml can correctly process an xml element with text before it', () => {
    const result = parseNoteXml('123 <Test/>');

    expect(result.length).toBe(2);
    expect(result[0]).toBe('123 ');
    const elem1 = result[1] as NoteXmlElement;
    expect(elem1.tag).toBe('Test');
    expect(elem1.children).toHaveLength(0);
    expect(elem1.length).toBe(7);
});


test('parseNoteXml can correctly process an xml element with text after it', () => {
    const result = parseNoteXml('<Test/> 123');

    expect(result.length).toBe(2);
    const elem1 = result[0] as NoteXmlElement;
    expect(elem1.tag).toBe('Test');
    expect(elem1.children).toHaveLength(0);
    expect(elem1.length).toBe(7);
    expect(result[1]).toBe(' 123');
});


test('parseNoteXml correctly splits up text into elements', () => {
    const text = "Hello this is a <test>with some inner text</test> that I'm trying";

    const result = parseNoteXml(text);

    expect(result.length).toBe(3);
    expect(result[0]).toBe("Hello this is a ");
    const testElem = result[1] as NoteXmlElement;
    expect(testElem.tag).toBe('test');
    expect(testElem.children).toHaveLength(1);
    expect(testElem.length).toBe(33);
    expect(testElem.children[0]).toBe('with some inner text');
    expect(result[2]).toBe(" that I'm trying");
});


test('parseNoteXml can correctly process an xml element with text inside and attributes', () => {
    const result = parseNoteXml('<Test name="abc">123</Test>');

    expect(result.length).toBe(1);
    const elem1 = result[0] as NoteXmlElement;
    expect(elem1.tag).toBe('Test');
    expect(elem1.attributes.name).toBe('abc');
    expect(elem1.children).toHaveLength(1);
    expect(elem1.children[0]).toBe('123');
    expect(elem1.length).toBe(27);
});


test('parseNoteXml can correctly process a nested xml element', () => {
    const result = parseNoteXml(`<Test1 >< Test2> hi </Test2 ></ Test1>`);
    console.log(result);

    expect(result.length).toBe(1);

    const test1 = result[0] as NoteXmlElement;
    expect(test1.tag).toBe('Test1');
    expect(test1.children).toHaveLength(1);
    expect(test1.length).toBe(38);

    const test2 = test1.children[0] as NoteXmlElement;
    expect(test2.tag).toBe('Test2');
    expect(test2.children).toHaveLength(1);
    expect(test2.children[0]).toBe(' hi ');
    expect(test2.length).toBe(21);
});