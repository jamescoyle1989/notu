'use strict';

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import Space from "../models/Space";
import { Note } from "..";


export interface NotuLoginResult {
    success: boolean;
    error: string;
    token: string;
}


export interface NotuClient {
    login(username: string, password: string): Promise<NotuLoginResult>;

    getSpaces(): Promise<Array<Space>>;

    saveSpace(space: Space): Promise<Space>;

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
    private _httpRequester: (config: AxiosRequestConfig<any>) => Promise<AxiosResponse<any, any>>;

    constructor(
        url: string,
        httpRequester: (config: AxiosRequestConfig<any>) => Promise<AxiosResponse<any, any>> = null
    ) {
        if (!url)
            throw Error('Endpoint URL must be passed in to NotuClient constructor');
        this._url = url;
        this._httpRequester = httpRequester ?? axios;
    }


    async login(username: string, password: string): Promise<NotuLoginResult> {
        try {
            const result = await this._httpRequester({
                method: 'post',
                url: (this.url + '/login').replace('//', '/'),
                data: { username, password }
            });
            this._token = result.data;
            return { success: true, error: null, token: result.data };
        }
        catch (ex) {
            if (ex.response.status == 401)
                return { success: false, error: 'Invalid username & password.', token: null };
            throw ex;
        }
    }


    async getSpaces(): Promise<Array<Space>> {
        const result = await this._httpRequester({
            method: 'get',
            url: (this.url + '/spaces').replace('//', '/'),
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });

        return result.data;
    }

    async saveSpace(space: Space): Promise<Space> {
        const result = await this._httpRequester({
            method: 'post',
            url: (this.url + '/spaces').replace('//', '/'),
            data: space,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });

        return result.data;
    }


    async getNotes(query: string, spaceId: number): Promise<Array<Note>> {
        const result = await this._httpRequester({
            method: 'get',
            url: (this.url + '/notes').replace('//', '/'),
            data: { query, spaceId },
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });

        return result.data;
    }

    async getNoteCount(query: string, spaceId: number): Promise<number> {
        const result = await this._httpRequester({
            method: 'get',
            url: (this.url + '/notes').replace('//', '/'),
            data: { query, spaceId },
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });

        return result.data;
    }

    async saveNotes(notes: Array<Note>): Promise<Array<Note>> {
        const result = await this._httpRequester({
            method: 'post',
            url: (this.url + '/notes').replace('//', '/'),
            data: { notes },
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });

        return result.data;
    }


    async customJob(name: string, data: any): Promise<any> {
        const result = await this._httpRequester({
            method: 'post',
            url: (this.url + 'customjob').replace('//', '/'),
            data: { name, data },
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });

        return result.data;
    }
}