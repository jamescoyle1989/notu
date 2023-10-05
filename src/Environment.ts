'use strict';

import { Note } from '.';
import Space from './models/Space';
import { NotuClient } from './services/HttpClient';


export default class Environment {

    private _client: NotuClient = null;
    get client(): NotuClient { return this._client; }

    private _spaces: Array<Space> = [];
    get spaces(): Array<Space> { return this._spaces; }

    constructor(client: NotuClient) {
        if (!client)
            throw Error('Client must be set on Environment constructor');
        this._client = client;
    }

    async loadSpaces(): Promise<Array<Space>> {
        this._spaces = await this.client.getSpaces();
        return this.spaces;
    }

    async saveSpace(space: Space): Promise<Space> {
        return await this.client.saveSpace(space);
    }

    async getNotes(query: string, spaceId: number): Promise<Array<Note>> {
        return await this.client.getNotes(query, spaceId);
    }

    async getNoteCount(query: string, spaceId: number): Promise<number> {
        return await this.client.getNoteCount(query, spaceId);
    }

    async saveNote(note: Note): Promise<Note> {
        return (await this.client.saveNotes([note]))[0];
    }

    async saveNotes(notes: Array<Note>): Promise<Array<Note>> {
        return await this.client.saveNotes(notes);
    }

    async customJob(name: string, data: any): Promise<any> {
        return await this.client.customJob(name, data);
    }

}