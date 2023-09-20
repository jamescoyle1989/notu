'use strict';


export default class Note {
    id: number = 0;
    date: Date = new Date();
    text: string = '';
    archived: boolean = false;
    spaceId: number = 0;

    duplicate(): Note {
        const output = new Note();
        output.id = this.id;
        output.date = this.date;
        output.text = this.text;
        output.archived = this.archived;
        output.spaceId = this.spaceId;
        return output;
    }
}