import { expect, test } from 'vitest';
import Environment from './Environment';
import { NotuClient, NotuLoginResult } from './services/HttpClient';
import Space from './models/Space';
import { Note } from '.';


class TestClient implements NotuClient {
    login(username: string, password: string): Promise<NotuLoginResult> {
        return Promise.resolve({ success: true, error: null, token: 'qwer.asdf.zxcv' });
    }

    getSpaces(): Promise<Array<Space>> {
        const output = [
            new Space('Space 1'),
            new Space('Space 2')
        ];
        output[0].id = 1;
        output[1].id = 2;
        for (const space of output)
            space.clean();
        return Promise.resolve(output);
    }

    saveSpace(space: Space): Promise<Space> {
        return Promise.resolve(space.duplicate());
    }

    getNotes(query: string, spaceId: number): Promise<Array<Note>> {
        const output = [
            new Note(),
            new Note(),
            new Note()
        ];
        for (let i = 0; i < output.length; i++) {
            output[i].text = 'Note ' + (i+1);
            output[i].id = i+1;
            output[i].spaceId = (i % 2) + 1;
            output[i].clean();
        }
        return Promise.resolve(output);
    }

    getNoteCount(query: string, spaceId: number): Promise<number> {
        return Promise.resolve(3);
    }

    saveNotes(notes: Array<Note>): Promise<Array<Note>> {
        return Promise.resolve(notes.map(n => n.duplicate()));
    }

    customJob(name: string, data: any): Promise<any> {
        return Promise.resolve({ test: 123 });
    }
}


test('constructor takes client parameter', () => {
    const client = new TestClient();
    const env = new Environment(client);

    expect(env.client).toBe(client);
});

test('constructor throws error if client not set', () => {
    expect(() => new Environment(null)).toThrowError();
});


test('loadSpaces stores the list of spaces on the environment', async () => {
    const env = new Environment(new TestClient());

    await env.loadSpaces();

    expect(env.spaces.length).toBe(2);
});