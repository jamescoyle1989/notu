'use strict';

export interface NotuCacheFetcher {
    getSpacesData(): Promise<Array<any>>;

    getTagsData(): Promise<Array<any>>;
}


export class NotuHttpCacheFetcher implements NotuCacheFetcher {

    private _url: string = null;
    get url(): string { return this._url; }

    private _token: string = null;
    get token(): string { return this._token; }

    //Added for testing support
    private _fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

    constructor(
        url: string,
        token: string,
        fetchMethod: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = null
    ) {
        if (!url)
            throw Error('Endpoint URL must be passed into NotuHttpCacheFetcher constructor');
        if (!token)
            throw Error('Security token must be passed into NotuHttpCacheFetcher constructor');

        if (url.endsWith('/'))
            url = url.substring(0, url.length - 1);
        this._url = url;
        this._token = token;
        this._fetch = fetchMethod ?? window.fetch.bind(window);
    }

    async getSpacesData(): Promise<Array<any>> {
        return await this._getX('/spaces');
    }

    async getTagsData(): Promise<Array<any>> {
        return await this._getX('/tags');
    }

    private async _getX(endpoint: string): Promise<Array<any>> {
        const result = await this._fetch(this.url + endpoint,
            {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + this.token }
            }
        );
        return (await result.json());
    }
}