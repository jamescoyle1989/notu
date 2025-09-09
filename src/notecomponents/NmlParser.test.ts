import { expect, test } from 'vitest';
import { NmlElement, NmlParserWorkingData, parseNml, parseNmlElement } from './NmlParser';


test('parseNmlElement can correctly process the name and attributes of an element', () => {
    const wd = new NmlParserWorkingData('Test <Link url="www.google.com">');
    wd.textIndex = 5;

    parseNmlElement(wd);

    expect(wd.textIndex).toBe(wd.text.length);
    expect(wd.elementStack).toHaveLength(1);
    expect(wd.elementStack[0].tag).toBe('Link');
    expect(wd.elementStack[0].attributes['url']).toBe('www.google.com');
});


test('parseNmlElement can correctly process matching opening and closing tags', () => {
    const wd = new NmlParserWorkingData('Test <Link url="www.google.com"></Link>');
    wd.textIndex = 5;

    parseNmlElement(wd);
    parseNmlElement(wd);

    expect(wd.elementStack).toHaveLength(0);
    expect(wd.results).toHaveLength(1);
    const link = wd.results[0] as NmlElement;
    expect(link.tag).toBe('Link');
    expect(link.attributes['url']).toBe('www.google.com');
    expect(link.openText).toBe('<Link url="www.google.com">');
    expect(link.closeText).toBe('</Link>');
    expect(wd.textIndex).toBe(wd.text.length);
});


test('parseNmlElement can correctly process child tag', () => {
    const wd = new NmlParserWorkingData('<Link url="www.google.com">< Test /></Link>');

    parseNmlElement(wd);
    parseNmlElement(wd);
    parseNmlElement(wd);

    expect(wd.elementStack).toHaveLength(0);
    expect(wd.results).toHaveLength(1);

    const link = wd.results[0] as NmlElement;
    expect(link.tag).toBe('Link');
    expect(link.attributes['url']).toBe('www.google.com');
    expect(link.openText).toBe('<Link url="www.google.com">');
    expect(link.closeText).toBe('</Link>');

    const test = link.children[0] as NmlElement;
    expect(test.tag).toBe('Test');
    expect(test.openText).toBe('< Test />');
    expect(test.isSelfClosing).toBe(true);

    expect(wd.textIndex).toBe(wd.text.length);
});


test('parseNmlElement can handle syntax error in element', () => {
    const wd = new NmlParserWorkingData('<Link asdf="hello"time="1:30">');

    parseNmlElement(wd);

    expect(wd.results).toHaveLength(1);
    expect(wd.results[0]).toBe('<Link asdf="hello"');
});


test('parseNml can handle outer element being invalid while inner element is fine', () => {
    const result = parseNml('<Parent><Child>content</Child>');

    expect(result.length).toBe(2);
    expect(result[0]).toBe('<Parent>');

    const child = result[1] as NmlElement;
    expect(child.tag).toBe('Child');
    expect(child.children).toHaveLength(1);
    expect(child.children[0]).toBe('content');
    expect(child.openText).toBe('<Child>');
    expect(child.closeText).toBe('</Child>');
});


test('parseNml can handle syntax error on element', () => {
    const result = parseNml('<Parent attr="123" test="456"');

    expect(result.length).toBe(1);
    expect(result[0]).toBe('<Parent attr="123" test="456"');
});


test('parseNml correctly handles failure in child sibling element', () => {
    const result = parseNml('<Parent><Child1></Child1></Child2/><Child3/></Parent>');
    console.log(result);

    expect(result.length).toBe(5);
    expect(result[0]).toBe('<Parent>');
    const child1 = result[1] as NmlElement;
    expect(child1.openText).toBe('<Child1>');
    expect(child1.closeText).toBe('</Child1>');
    expect(result[2]).toBe('</Child2/>');
    const child3 = result[3] as NmlElement;
    expect(child3.openText).toBe('<Child3/>');
    expect(child3.isSelfClosing).toBe(true);
    expect(result[4]).toBe('</Parent>');
});