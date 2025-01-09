'use strict';

import { Note, Space, Tag } from '..';
import { NotuClient } from './HttpClient';
import { NotuCache } from './NotuCache';


export class Notu {
    private _client: NotuClient;
    get client(): NotuClient { return this._client; }

    private _cache: NotuCache;
    get cache(): NotuCache { return this._cache; }

    constructor(client: NotuClient, cache: NotuCache) {
        this._client = client;
        this._cache = cache;
    }


    async login(username: string, password: string): Promise<string> {
        return await this.client.login(username, password);
    }

    async setup(): Promise<void> {
        return await this.client.setup();
    }

    getSpaces(): Array<Space> {
        return this.cache.getSpaces();
    }

    getSpace(id: number): Space {
        return this.cache.getSpace(id);
    }

    getSpaceByName(name: string): Space {
        return this.cache.getSpaceByName(name);
    }

    async saveSpace(space: Space): Promise<Space> {
        const spaceData = await this.client.saveSpace(space);
        return this.cache.spaceSaved(spaceData);
    }

    getTags(space: number | Space = null, includeOtherSpacePublics: boolean = false): Array<Tag> {
        return this.cache.getTags(space, includeOtherSpacePublics)
    }

    getTag(id: number): Tag {
        return this.cache.getTag(id);
    }

    getTagByName(name: string, space: number | Space): Tag {
        return this.cache.getTagByName(name, space);
    }

    async getNotes(query: string, spaceId?: number): Promise<Array<Note>> {
        const notesData = await this.client.getNotes(query, spaceId);
        return notesData.map(n => this.cache.noteFromJSON(n));
    }

    async getNoteCount(query: string, spaceId?: number): Promise<number> {
        return await this.client.getNoteCount(query, spaceId);
    }

    async saveNotes(notes: Array<Note>): Promise<Array<Note>> {
        const tagsBeingDeletedData = notes
            .filter(x => !!x.ownTag)
            .filter(x => x.isDeleted || x.ownTag.isDeleted)
            .map(x => x.ownTag.toJSON());
        const notesData = await this.client.saveNotes(notes);
        for (const noteData of notesData.filter(x => !!x.ownTag && !x.ownTag.isDeleted)) {
            noteData.ownTag.links = noteData.tags.map(x => x.tagId);
            this.cache.tagSaved(noteData.ownTag);
        }
        for (const tagData of tagsBeingDeletedData) {
            tagData.state = 'DELETED';
            this.cache.tagSaved(tagData);
        }
        notes = notesData.map(n => this.cache.noteFromJSON(n));
        return notes;
    }

    async customJob(name: string, data: any): Promise<any> {
        return await this.client.customJob(name, data);
    }
}