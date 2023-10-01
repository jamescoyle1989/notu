import { expect, test } from 'vitest';
import NotuClient from './NotuClient';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Space from '../models/Space';


function mockAxiosResponse(status: number, data: any): AxiosResponse<any, any> {
    const response = {
        data,
        status,
        statusText: 'hello',
        headers: null,
        config: null
    };
    if (status < 200 || status >= 300) {
        const error = new Error('Something went wrong');
        error['response'] = response;
        throw error;
    }
    return response;
}

async function mockAxios(config: AxiosRequestConfig<any>): Promise<AxiosResponse<any, any>> {
    if (config.method == 'post' && config.url.endsWith('/login')) {
        if (config.data.username == 'ValidUser' && config.data.password == 'ValidPassword')
            return mockAxiosResponse(200, 'qwer.asdf.zxcv');
        return mockAxiosResponse(401, null);
    }
    if (config.method == 'get' && config.url.endsWith('/spaces')) {
        return mockAxiosResponse(200, [
            new Space('Space 1'),
            new Space('Space 2')
        ]);
    }
    return mockAxiosResponse(404, null);
}




test('constructor takes api root url', () => {
    const client = new NotuClient('https://www.test.com');

    expect(client.url).toBe('https://www.test.com');
});

test('constructor throws error if url not provided', () => {
    expect(() => new NotuClient()).toThrowError();
});

test('If no httpRequester method passed in, then defaults to using axios', () => {
    const client = new NotuClient('abcd');
    
    expect(client['_httpRequester']).toBe(axios);
});


test('login asyncronously gets token from web service', async () => {
    const client = new NotuClient('abcd', mockAxios);
    const loginResult = await client.login('ValidUser', 'ValidPassword');

    expect(loginResult.success).toBe(true);
    expect(loginResult.error).toBeNull();
    expect(loginResult.token).toBe('qwer.asdf.zxcv');
});

test('login fails if username and password are invalid', async () => {
    const client = new NotuClient('abcd', mockAxios);
    const loginResult = await client.login('InvalidUser', 'InvalidPassword');

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('Invalid username & password.');
    expect(loginResult.token).toBeNull();
});

test('login sets token on the client', async () => {
    const client = new NotuClient('abcd', mockAxios);
    await client.login('ValidUser', 'ValidPassword');

    expect(client.token).toBe('qwer.asdf.zxcv');
});

test('Token can be manually set if already known', () => {
    const client = new NotuClient('abcd', mockAxios);
    client.token = 'qwer.asdf.zxcv';

    expect(client.token).toBe('qwer.asdf.zxcv');
});


test('getSpaces makes async call to correct URL endpoint, returns space objects', async () => {
    let request: AxiosRequestConfig<any> = null;
    const client = new NotuClient('abcd', r => {
        request = r;
        return mockAxios(r);
    });
    client.token = 'qwer.asdf.zxcv';

    const result = await client.getSpaces();

    expect(request.method).toBe('get');
    expect(request.url).toBe('abcd/spaces');
    expect(request.data).toBeFalsy();
    expect(request.headers.Authorization).toBe('Bearer qwer.asdf.zxcv');
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('Space 1');
    expect(result[1].name).toBe('Space 2');
});