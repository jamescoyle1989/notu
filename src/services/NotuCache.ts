'use strict';

import Attr from '../models/Attr';
import Note from '../models/Note';
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

    private async _populateSpaces(): Promise<void> {
        const spacesData = await this._fetcher.getSpacesData();
        this._spaces = new Map<number, Space>();
        for (const spaceData of spacesData) {
            const space = this.spaceFromJSON(spaceData);
            this._spaces.set(space.id, space);
        }
    }

    spaceFromJSON(spaceData: any): Space {
        const space = new Space(spaceData.name);
        space.id = spaceData.id;
        space.version = spaceData.version;
        space.state = spaceData.state;
        return space;
    }

    private async _populateTags(): Promise<void> {
        const tagsData = await this._fetcher.getTagsData();
        this._tags = new Map<number, Tag>();
        for (const tagData of tagsData) {
            const tag = this.tagFromJSON(tagData);
            this._tags.set(tag.id, tag);
        }
    }

    tagFromJSON(tagData: any): Tag {
        const tag = new Tag(tagData.name);
        tag.id = tagData.id;
        tag.space = this._spaces.get(tagData.spaceId);
        tag.color = tagData.color;
        tag.isPublic = tagData.isPublic;
        tag.state = tagData.state;
        return tag;
    }

    private async _populateAttrs(): Promise<void> {
        const attrsData = await this._fetcher.getAttrsData();
        this._attrs = new Map<number, Attr>();
        for (const attrData of attrsData) {
            const attr = this.attrFromJSON(attrData);
            this._attrs.set(attr.id, attr);
        }
    }

    attrFromJSON(attrData: any): Attr {
        const attr = new Attr(attrData.name, attrData.description);
        attr.id = attrData.id;
        attr.type = attrData.type;
        attr.space = this._spaces.get(attrData.spaceId);
        attr.state = attrData.state;
        return attr;
    }


    noteFromJSON(noteData: any): Note {
        const ownTag = !noteData.ownTag || noteData.ownTag.state == 'CLEAN'
            ? this.getTag(noteData.id)
            : this.tagFromJSON(noteData.ownTag);
        const note = new Note(noteData.text, ownTag)
            .at(new Date(noteData.date))
            .in(this.getSpace(noteData.spaceId));
        note.id = noteData.id;
        note.state = noteData.state;

        for (const naData of noteData.attrs) {
            const attr = this.getAttr(naData.attrId)
            note.addAttr(attr, naData.value);
            note.getAttr(attr).state = naData.state;
        }

        for (const ntData of noteData.tags) {
            const nt = note.addTag(this.getTag(ntData.tagId));
            nt.state = ntData.state;

            for (const ntaData of ntData.attrs) {
                const attr = this.getAttr(ntaData.attrId);
                nt.addAttr(attr, ntaData.value);
                nt.getAttr(attr).state = ntaData.state;
            }
        }

        return note;
    }



    getSpaces(): Array<Space> {
        return Array.from(this._spaces.values());
    }

    getSpace(id: number): Space {
        return this._spaces.get(id);
    }

    getSpaceByName(name: string): Space {
        for (const space of this._spaces.values()) {
            if (space.name == name)
                return space;
        }
        return undefined;
    }

    spaceSaved(spaceData: any): Space {
        const space = this.spaceFromJSON(spaceData);
        if (space.state == 'DELETED')
            this._spaces.delete(space.id);
        else
            this._spaces.set(space.id, space);
        return space;
    }



    getTags(space: number | Space = null, includeOtherSpacePublics: boolean = false): Array<Tag> {
        if (space == null)
            return Array.from(this._tags.values());
        
        if (space instanceof Space)
            space = space.id;

        return Array.from(this._tags.values())
            .filter(x => (x.isPublic && includeOtherSpacePublics) || x.space.id == space);
    }

    getTag(id: number): Tag {
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

    tagSaved(tagData: any): Tag {
        const tag = this.tagFromJSON(tagData);
        if (tag.state == 'DELETED')
            this._tags.delete(tag.id);
        else
            this._tags.set(tag.id, tag);
        return tag;
    }



    getAttrs(space: number | Space = null): Array<Attr> {
        if (space == null)
            return Array.from(this._attrs.values());

        if (space instanceof Space)
            space = space.id;

        return Array.from(this._attrs.values())
            .filter(x => x.space.id == space);
    }

    getAttr(id: number): Attr {
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

    attrSaved(attrData: any): Attr {
        const attr = this.attrFromJSON(attrData);
        if (attr.state == 'DELETED')
            this._attrs.delete(attr.id);
        else
            this._attrs.set(attr.id, attr);
        return attr;
    }

}