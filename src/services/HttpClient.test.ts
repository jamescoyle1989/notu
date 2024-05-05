import { expect, test } from 'vitest';
import HttpClient from './HttpClient';
import Space from '../models/Space';
import { Attr, Note } from '..';


async function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (init.method == 'POST' && input.toString().includes('/login')) {
        const body = JSON.parse(init.body.toString());
        if (body.username == 'ValidUser' && body.password == 'ValidPassword')
            return new Response(JSON.stringify({token: 'qwer.asdf.zxcv'}), {status: 200});
        return new Response(null, {status: 401});
    }
    if (init.method == 'GET' && input.toString().includes('/spaces')) {
        return new Response(JSON.stringify([
            new Space('Space 1'),
            new Space('Space 2')
        ]), {status: 200});
    }
    if (init.method == 'GET' && input.toString().includes('/attrs')) {
        return new Response(JSON.stringify([
            new Attr('Attr 1'),
            new Attr('Attr 2')
        ]), {status: 200});
    }
    if (init.method == 'GET' && input.toString().includes('/notes?')) {
        if (input.toString().includes('count=true')) {
            return new Response(JSON.stringify({count: 2}), {status: 200});
        }
        else {
            return new Response(JSON.stringify([
                new Note('test1'),
                new Note('test2')
            ]), {status: 200});
        }
    }
    if (input.toString().includes('customjob')) {
        return new Response(JSON.stringify({}), {status: 200});
    }
    return new Response(null, {status: 404});
}




test('constructor takes api root url', () => {
    const client = new HttpClient('https://www.test.com', mockFetch);

    expect(client.url).toBe('https://www.test.com');
});

test('constructor throws error if url not provided', () => {
    expect(() => new HttpClient(null)).toThrowError();
});


test('login asyncronously gets token from web service', async () => {
    const client = new HttpClient('abcd', mockFetch);
    const loginResult = await client.login('ValidUser', 'ValidPassword');

    expect(loginResult.success).toBe(true);
    expect(loginResult.error).toBeNull();
    expect(loginResult.token).toBe('qwer.asdf.zxcv');
});

test('login fails if username and password are invalid', async () => {
    const client = new HttpClient('abcd', mockFetch);
    const loginResult = await client.login('InvalidUser', 'InvalidPassword');

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('Invalid username & password.');
    expect(loginResult.token).toBeNull();
});

test('login sets token on the client', async () => {
    const client = new HttpClient('abcd', mockFetch);
    await client.login('ValidUser', 'ValidPassword');

    expect(client.token).toBe('qwer.asdf.zxcv');
});

test('Token can be manually set if already known', () => {
    const client = new HttpClient('abcd', mockFetch);
    client.token = 'qwer.asdf.zxcv';

    expect(client.token).toBe('qwer.asdf.zxcv');
});


test('getSpaces makes async call to correct URL endpoint, returns space objects', async () => {
    let input: string;
    let init: RequestInit;
    const client = new HttpClient('abcd', (inp, ini) => {
        input = inp.toString();
        init = ini;
        return mockFetch(inp, ini);
    });
    client.token = 'qwer.asdf.zxcv';

    const result = await client.getSpaces();

    expect(init.method).toBe('GET');
    expect(input).toBe('abcd/spaces');
    expect(init.body).toBeFalsy();
    expect(init.headers['Authorization']).toBe('Bearer qwer.asdf.zxcv');
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('Space 1');
    expect(result[1].name).toBe('Space 2');
});


test('getAttrs makes async call to correct URL endpoint, returns attr objects', async () => {
    let input: string;
    let init: RequestInit;
    const client = new HttpClient('abcd', (inp, ini) => {
        input = inp.toString();
        init = ini;
        return mockFetch(inp, ini);
    });
    client.token = 'qwer.asdf.zxcv';

    const result = await client.getAttrs();

    expect(init.method).toBe('GET');
    expect(input).toBe('abcd/attrs?space=0');
    expect(init.body).toBeFalsy();
    expect(init.headers['Authorization']).toBe('Bearer qwer.asdf.zxcv');
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('Attr 1');
    expect(result[1].name).toBe('Attr 2');
});


test('getNotes passes spaceId and query in URL', async () => {
    let input: string;
    let init: RequestInit;
    const client = new HttpClient('abcd', (inp, ini) => {
        input = inp.toString();
        init = ini;
        return mockFetch(inp, ini);
    });
    client.token = 'qwer.asdf.zxcv';

    const result = await client.getNotes('#Tag AND @Attr = 100', 1);

    expect(init.method).toBe('GET');
    expect(input).toBe('abcd/notes?space=1&query=%23Tag%20AND%20%40Attr%20%3D%20100');
    expect(init.body).toBeFalsy();
    expect(init.headers['Authorization']).toBe('Bearer qwer.asdf.zxcv');
    expect(result.length).toBe(2);
    expect(result[0].text).toBe('test1');
    expect(result[1].text).toBe('test2');
    expect(result[0]).toBeInstanceOf(Note);
});


test('getNoteCount passes spaceId and query in URL', async () => {
    let input: string;
    let init: RequestInit;
    const client = new HttpClient('abcd', (inp, ini) => {
        input = inp.toString();
        init = ini;
        return mockFetch(inp, ini);
    });
    client.token = 'qwer.asdf.zxcv';

    const result = await client.getNoteCount('#Tag AND @Attr = 100', 1);

    expect(init.method).toBe('GET');
    expect(input).toBe('abcd/notes?count=true&space=1&query=%23Tag%20AND%20%40Attr%20%3D%20100');
    expect(init.body).toBeFalsy();
    expect(init.headers['Authorization']).toBe('Bearer qwer.asdf.zxcv');
    expect(result).toBe(2);
});


test('customJob makes async call to correct URL endpoint', async () => {
    let input: string;
    let init: RequestInit;
    const client = new HttpClient('abcd', (inp, ini) => {
        input = inp.toString();
        init = ini;
        return mockFetch(inp, ini);
    });
    client.token = 'qwer.asdf.zxcv';

    const result = await client.customJob('DoSomething', 'xyz');

    expect(init.method).toBe('POST');
    expect(input).toBe('abcd/customjob');
    const body = JSON.parse(init.body.toString());
    expect(body.name).toBe('DoSomething');
    expect(body.data).toBe('xyz');
    expect(init.headers['Authorization']).toBe('Bearer qwer.asdf.zxcv');
});