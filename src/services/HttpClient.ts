'use strict';

import Attr from '../models/Attr';
import Note from '../models/Note';
import Space from '../models/Space';
import Tag from '../models/Tag';




export interface NotuLoginResult {
    error: string;
    token: string;
}


export interface NotuClient {
    login(username: string, password: string): Promise<NotuLoginResult>;

    setup(): Promise<void>;

    saveSpace(space: Space): Promise<any>;

    saveAttr(attr: Attr): Promise<any>;

    getNotes(query: string, space: number | Space): Promise<Array<any>>;

    getNoteCount(query: string, space: number | Space): Promise<number>;

    getRelatedNotes(tag: Tag | Note | number): Promise<Array<any>>;

    saveNotes(notes: Array<Note>): Promise<Array<any>>;

    customJob(name: string, data: any): Promise<any>;
}


export default class NotuHttpClient implements NotuClient {

    private _url: string = null;
    get url(): string { return this._url; }

    private _token: string = null;
    get token(): string { return this._token; }
    set token(value: string) { this._token = value; }

    //Added for testing support
    private _fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

    constructor(
        url: string,
        fetchMethod: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = null
    ) {
        if (!url)
            throw Error('Endpoint URL must be passed in to NotuClient constructor');
        if (url.endsWith('/'))
            url = url.substring(0, url.length - 1);
        this._url = url;
        this._fetch = fetchMethod ?? window.fetch.bind(window);
    }


    async login(username: string, password: string): Promise<NotuLoginResult> {
        const response = await this._fetch(this.url + '/login',
            {
                method: 'POST',
                body: JSON.stringify({username, password})
            }
        );
        if (response.body != null) {
            const result = (await response.json()) as NotuLoginResult;
            if (!!result.token)
                this._token = result.token;
            return result;
        }
        return { token: null, error: 'Unknown error occurred on the server' };
    }


    async setup(): Promise<void> {
        const response = await this._fetch(this.url + '/setup',
            {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        await response.json();
    }


    async saveSpace(space: Space): Promise<any> {
        const response = await this._fetch(this.url + '/spaces',
            {
                method: 'POST',
                body: JSON.stringify(space),
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return await response.json();
    }


    async saveAttr(attr: Attr): Promise<any> {
        const response = await this._fetch(this.url + '/attrs',
            {
                method: 'POST',
                body: JSON.stringify(attr),
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return await response.json();
    }


    async getNotes(query: string, space: number | Space): Promise<Array<any>> {
        if (space instanceof Space)
            space = space.id;

        const response = await this._fetch(this.url + `/notes?space=${space}&query=${encodeURIComponent(query)}`,
            {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return await response.json();
    }

    async getNoteCount(query: string, space: number | Space): Promise<number> {
        if (space instanceof Space)
            space = space.id;

        const response = await this._fetch(this.url + `/notes?count=true&space=${space}&query=${encodeURIComponent(query)}`,
            {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return (await response.json()).count;
    }

    async getRelatedNotes(tag: Tag | Note | number): Promise<Array<any>> {
        if (tag instanceof Tag)
            tag = tag.id;
        if (tag instanceof Note)
            tag = tag.id;

        const response = await this._fetch(this.url + `/notes?tag=${tag}`,
            {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return await response.json();
    }

    async saveNotes(notes: Array<Note>): Promise<Array<any>> {
        const response = await this._fetch(this.url + '/notes',
            {
                method: 'POST',
                body: JSON.stringify(notes),
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return await response.json();
    }


    async customJob(name: string, data: any): Promise<any> {
        const response = await this._fetch(this.url + '/customjob',
            {
                method: 'POST',
                body: JSON.stringify({ name, data }),
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return await response.json();
    }
}