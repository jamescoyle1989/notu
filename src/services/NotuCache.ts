'use strict';

import Attr from '../models/Attr';
import Space from '../models/Space';
import Tag from '../models/Tag';
import { NotuCacheFetcher } from './HttpCacheFetcher';


export class NotuCache {

    private _fetcher: NotuCacheFetcher;

    constructor(fetcher: NotuCacheFetcher) {
        if (!fetcher)
            throw Error('NotuCache constructor must have a fetcher argument supplied.');
        this._fetcher = fetcher;
    }


    private _spaces: Map<number, Space> = null;
    private _tags: Map<number, Tag> = null;
    private _attrs: Map<number, Attr> = null;


    async populate(): Promise<void> {
        await this._populateSpaces();
        const tagsPromise = this._populateTags();
        const attrsPromise = this._populateAttrs();
        await Promise.all([tagsPromise, attrsPromise]);
    }

    async _populateSpaces(): Promise<void> {
        const spacesData = await this._fetcher.getSpacesData();
        this._spaces = new Map<number, Space>();
        for (const spaceData of spacesData) {
            const space = new Space(spaceData.name);
            space.id = spaceData.id;
            space.version = spaceData.version;
            space.state = spaceData.state;
            this._spaces.set(space.id, space);
        }
    }

    async _populateTags(): Promise<void> {
        const tagsData = await this._fetcher.getTagsData();
        this._tags = new Map<number, Tag>();
        for (const tagData of tagsData) {
            const tag = new Tag(tagData.name);
            tag.id = tagData.id;
            tag.space = this._spaces.get(tagData.spaceId);
            tag.color = tagData.color;
            tag.isPublic = tagData.isPublic;
            tag.state = tagData.state;
            this._tags.set(tag.id, tag);
        }
    }

    async _populateAttrs(): Promise<void> {
        const attrsData = await this._fetcher.getAttrsData();
        this._attrs = new Map<number, Attr>();
        for (const attrData of attrsData) {
            const attr = new Attr(attrData.name, attrData.description);
            attr.id = attrData.id;
            attr.type = attrData.type;
            attr.space = this._spaces.get(attrData.spaceId);
            attr.state = attrData.state;
            this._attrs.set(attr.id, attr);
        }
    }



    getSpaces(): Array<Space> {
        return Array.from(this._spaces.values());
    }

    getSpaceById(id: number): Space {
        return this._spaces.get(id);
    }

    getSpaceByName(name: string): Space {
        for (const space of this._spaces.values()) {
            if (space.name == name)
                return space;
        }
        return undefined;
    }

    spaceSaved(space: Space): void {
        if (space.state == 'DELETED')
            this._spaces.delete(space.id);
        else
            this._spaces.set(space.id, space);
    }



    getTags(space: number | Space, includeOtherSpacePublics: boolean = false): Array<Tag> {
        if (space instanceof Space)
            space = space.id;

        return Array.from(this._tags.values())
            .filter(x => (x.isPublic && includeOtherSpacePublics) || x.space.id == space);
    }

    getTagById(id: number): Tag {
        return this._tags.get(id);
    }

    getTagByName(name: string, space: number | Space): Tag {
        if (space instanceof Space)
            space = space.id;

        for (const tag of this._tags.values()) {
            if (tag.name == name && tag.space.id == space)
                return tag;
        }
        return undefined;
    }

    tagSaved(tag: Tag): void {
        if (tag.state == 'DELETED')
            this._tags.delete(tag.id);
        else
            this._tags.set(tag.id, tag);
    }



    getAttrs(space: number | Space): Array<Attr> {
        if (space instanceof Space)
            space = space.id;

        return Array.from(this._attrs.values())
            .filter(x => x.space.id == space);
    }

    getAttrById(id: number): Attr {
        return this._attrs.get(id);
    }

    getAttrByName(name: string, space: number | Space): Attr {
        if (space instanceof Space)
            space = space.id;

        for (const attr of this._attrs.values()) {
            if (attr.name == name && attr.space.id == space)
                return attr;
        }
        return undefined;
    }

    attrSaved(attr: Attr): void {
        if (attr.state == 'DELETED')
            this._attrs.delete(attr.id);
        else
            this._attrs.set(attr.id, attr);
    }

}