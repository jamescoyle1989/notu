'use strict';

import { Attr, Note, Space, Tag } from '..';
import { NotuClient, NotuLoginResult } from './HttpClient';


export class CachedClient implements NotuClient {
    private _internalClient: NotuClient;

    constructor(internalClient: NotuClient) {
        this._internalClient = internalClient;
    }
    

    //Caches
    private _spaces: Map<number, Space> = null;
    private _attrs: Map<number, Attr> = null;
    private _tags: Map<number, Tag> = null;

    private _linkTagsToSpaces() {
        for (const tag of this._tags.values()) {
            const space = this._spaces.get(tag.spaceId);
            if (!!space)
                tag.space = space;
        }
    }

    private _linkAttrsToSpaces() {
        for (const attr of this._attrs.values()) {
            const space = this._spaces.get(attr.spaceId);
            if (!!space)
                attr.space = space;
        }
    }


    /////////////////////////////////////
    // NotuClient implementation start //
    /////////////////////////////////////

    async login(username: string, password: string): Promise<NotuLoginResult> {
        return await this._internalClient.login(username, password);
    }

    async getSpaces(): Promise<Array<Space>> {
        if (this._spaces == null) {
            const spaces = await this._internalClient.getSpaces();
            this._spaces = new Map<number, Space>();
            for (const space of spaces)
                this._spaces.set(space.id, space);

            if (this._tags != null)
                this._linkTagsToSpaces();
            if (this._attrs != null)
                this._linkAttrsToSpaces();
        }
        return [...this._spaces.values()];
    }

    async saveSpace(space: Space): Promise<Space> {
        const saveResult = await this._internalClient.saveSpace(space);
        if (this._spaces != null)
            this._spaces.set(saveResult.id, saveResult);
        return saveResult;
    }

    async getAttrs(spaceId: number): Promise<Array<Attr>> {
        if (this._attrs == null) {
            const attrs = await this._internalClient.getAttrs(spaceId);
            this._attrs = new Map<number, Attr>();
            for (const attr of attrs)
                this._attrs.set(attr.id, attr);
            
            if (this._spaces != null)
                this._linkAttrsToSpaces();
        }
        return [...this._attrs.values()];
    }

    async saveAttr(attr: Attr): Promise<Attr> {
        const saveResult = await this._internalClient.saveAttr(attr);
        if (this._attrs != null)
            this._attrs.set(saveResult.id, saveResult);
        return saveResult;
    }

    async getTags(): Promise<Array<Tag>> {
        if (this._tags == null) {
            const tags = await this._internalClient.getTags();
            this._tags = new Map<number, Tag>();
            for (const tag of tags)
                this._tags.set(tag.id, tag);
            
            if (this._spaces != null)
                this._linkTagsToSpaces();
        }
        return [...this._tags.values()];
    }

    async getNotes(query: string, spaceId: number): Promise<Array<Note>> {
        const results = await this._internalClient.getNotes(query, spaceId);

        if (this._spaces != null) {
            for (const note of results) {
                const space = this._spaces.get(note.spaceId);
                if (!!space)
                    note.space = space;
            }
        }
        if (this._attrs != null) {
            for (const note of results) {
                for (const na of note.attrs) {
                    const attr = this._attrs.get(na.attrId);
                    if (!!attr) {
                        na.attr = attr;
                        na.clean();
                    }
                }
            }
        }
        if (this._tags != null) {
            for (const note of results) {
                {
                    const tag = this._tags.get(note.id);
                    if (!!tag) {
                        note.setOwnTag(tag);
                        note.clean();
                        note.ownTag.clean();
                    }
                }
                for (const nt of note.tags) {
                    const tag = this._tags.get(nt.tagId);
                    if (!!tag) {
                        nt.tag = tag;
                        nt.clean();
                    }
                }
                for (const na of note.attrs.filter(x => x.tagId != null)) {
                    const tag = this._tags.get(na.tagId);
                    if (!!tag) {
                        na.tag = tag;
                        na.clean();
                    }
                }
            }
        }

        return results;
    }

    async getNoteCount(query: string, spaceId: number): Promise<number> {
        return await this._internalClient.getNoteCount(query, spaceId);
    }

    async saveNotes(notes: Array<Note>): Promise<Array<Note>> {
        const saveResults = await this._internalClient.saveNotes(notes);
        if (this._tags != null) {
            for (const note of saveResults.filter(x => !!x.ownTag))
                this._tags.set(note.ownTag.id, note.ownTag);
        }
        return saveResults;
    }

    async customJob(name: string, data: any): Promise<any> {
        return await this._internalClient.customJob(name, data);
    }

    ///////////////////////////////////
    // NotuClient implementation end //
    ///////////////////////////////////


    //Synchronous cache methods
    //These are introduced to make it far easier to lookup the cached values
    //Especially in React where async is kind of a pain

    //Make sure this method has been called before any of the other methods in this section

    async cacheAll(spaceId: number = 0): Promise<void> {
        await this.getSpaces();
        const tagsPromise = this.getTags();
        const attrsPromise = this.getAttrs(spaceId);
        await Promise.all([tagsPromise, attrsPromise]);
    }

    get spaces(): Array<Space> {
        return [...this._spaces.values()];
    }

    get tags(): Array<Tag> {
        return [...this._tags.values()];
    }

    get attrs(): Array<Attr> {
        return [...this._attrs.values()];
    }
}