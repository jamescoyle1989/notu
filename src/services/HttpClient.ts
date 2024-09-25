'use strict';

import Attr from '../models/Attr';
import Note from '../models/Note';
import Space from '../models/Space';
import Tag from '../models/Tag';


export interface NotuClient {
    login(username: string, password: string): Promise<string>;

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

    //Used to handle error responses that come in and take some custom action on them
    //Returns true if the response was handled, otherwise returns in which case an error will be thrown
    errorHandler: (response: Response) => boolean = null;

    private _validateResponseStatus(response: Response) {
        if (response.status >= 400 && response.status < 600) {
            if (!!this.errorHandler) {
                if (this.errorHandler(response))
                    return;
            }
            throw Error(response.statusText);
        }
    }

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


    async login(username: string, password: string): Promise<string> {
        const response = await this._fetch(this.url + '/login',
            {
                method: 'POST',
                body: JSON.stringify({username, password})
            }
        );
        this._validateResponseStatus(response);
        if (response.body != null) {
            const result = (await response.json()) as string;
            if (!!result)
                this._token = result;
            return result;
        }
        throw Error('Unknown error occurred on the server');
    }


    async setup(): Promise<void> {
        const response = await this._fetch(this.url + '/setup',
            {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        this._validateResponseStatus(response);
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
        this._validateResponseStatus(response);
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
        this._validateResponseStatus(response);
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
        this._validateResponseStatus(response);
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
        this._validateResponseStatus(response);
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
        this._validateResponseStatus(response);
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
        this._validateResponseStatus(response);
        return await response.json();
    }


    async customJob(name: string, data: any): Promise<any> {
        const response = await this._fetch(this.url + '/customJob',
            {
                method: 'POST',
                body: JSON.stringify({ name, data, clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        this._validateResponseStatus(response);
        return await response.json();
    }
}