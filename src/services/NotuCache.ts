'use strict';

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
    private _tagNames: Map<string, Array<Tag>> = null;


    async populate(): Promise<void> {
        await this._populateSpaces();
        await this._populateTags();
        this._populateTagNames();
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
        const allTags = new Map<number, Tag>();
        for (const tagData of tagsData) {
            const tag = this.tagFromJSON(tagData);
            allTags.set(tag.id, tag);
            tagData.tag = tag;
        }
        this._tags = allTags;
        for (const tagData of tagsData)
            this._populateTagLinks(tagData.tag, tagData);
    }

    private _populateTagNames(): void {
        const result = new Map<string, Array<Tag>>();
        for (const tag of this._tags.values()) {
            if (result.has(tag.name))
                result.get(tag.name).push(tag);
            else
                result.set(tag.name, [tag]);
        }
        this._tagNames = result;
    }

    tagFromJSON(tagData: any): Tag {
        const tag = new Tag(tagData.name);
        tag.id = tagData.id;
        tag.space = this._spaces.get(tagData.spaceId);
        tag.color = tagData.color;
        tag.isPublic = tagData.isPublic;
        tag.state = tagData.state;
        if (!!this._tags)
            this._populateTagLinks(tag, tagData);
        return tag;
    }

    private _populateTagLinks(tag: Tag, tagData: any) {
        tag.links = tagData.links.map(x => this._tags.get(x));
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

        for (const ntData of noteData.tags) {
            const nt = note.addTag(this.getTag(ntData.tagId));
            nt.data = ntData.data;
            nt.state = ntData.state;
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

        for (const tag of this._tagNames.get(name) ?? []) {
            if (tag.name == name && tag.space.id == space)
                return tag;
        }
        return undefined;
    }

    getTagsByName(name: string): Array<Tag> {
        return this._tagNames.get(name) ?? [];
    }

    tagSaved(tagData: any): Tag {
        const tag = this.tagFromJSON(tagData);
        if (tag.state == 'DELETED')
            this._tags.delete(tag.id);
        else
            this._tags.set(tag.id, tag);
        this._populateTagNames();
        return tag;
    }
}