'use strict';

import Space from "../models/Space";
import { Note, Attr } from "..";


export interface NotuLoginResult {
    success: boolean;
    error: string;
    token: string;
}


export interface NotuClient {
    login(username: string, password: string): Promise<NotuLoginResult>;

    getSpaces(): Promise<Array<Space>>;

    saveSpace(space: Space): Promise<Space>;

    getAttrs(): Promise<Array<Attr>>;

    saveAttr(attr: Attr): Promise<Attr>;

    getNotes(query: string, spaceId: number): Promise<Array<Note>>;

    getNoteCount(query: string, spaceId: number): Promise<number>;

    saveNotes(notes: Array<Note>): Promise<Array<Note>>;

    customJob(name: string, data: any): Promise<any>;
}


export default class HttpClient {

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
        const result = await this._fetch(this.url + '/login',
            {
                method: 'POST',
                body: JSON.stringify({username, password})
            }
        );
        if (result.body != null) {
            this._token = (await result.json()).token;
            return { success: true, error: null, token: this._token };
        }
        return { success: false, error: 'Invalid username & password.', token: null };
    }


    async getSpaces(): Promise<Array<Space>> {
        const result = await this._fetch(this.url + '/spaces',
            {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return await result.json();
    }

    async saveSpace(space: Space): Promise<Space> {
        const result = await this._fetch(this.url + '/spaces',
            {
                method: 'POST',
                body: JSON.stringify(space),
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return await result.json();
    }


    async getAttrs(): Promise<Array<Attr>> {
        const result = await this._fetch(this.url + '/attrs',
            {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return await result.json();
    }

    async saveAttr(attr: Attr): Promise<Attr> {
        const result = await this._fetch(this.url + '/attrs',
            {
                method: 'POST',
                body: JSON.stringify(attr),
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return await result.json();
    }


    async getNotes(query: string, spaceId: number): Promise<Array<Note>> {
        const result = await this._fetch(this.url + `/notes?space=${spaceId}&query=${encodeURIComponent(query)}`,
            {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return await result.json();
    }

    async getNoteCount(query: string, spaceId: number): Promise<number> {
        const result = await this._fetch(this.url + `/notes?count=true&space=${spaceId}&query=${encodeURIComponent(query)}`,
            {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return (await result.json()).count;
    }

    async saveNotes(notes: Array<Note>): Promise<Array<Note>> {
        const result = await this._fetch(this.url + '/notes',
            {
                method: 'POST',
                body: JSON.stringify(notes),
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return await result.json();
    }


    async customJob(name: string, data: any): Promise<any> {
        const result = await this._fetch(this.url + 'customjob',
            {
                method: 'POST',
                body: JSON.stringify({ name, data }),
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return await result.json();
    }
}