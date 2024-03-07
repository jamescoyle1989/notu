'use strict';


export class ParsedQuery {
    where: string = null;
    order: string = null;
    tags: Array<ParsedTag> = [];
    attrs: Array<ParsedAttr> = [];
}

export class ParsedTag {
    space: string = null;
    name: string = null;
    searchDepth: number = 0;
    strictSearchDepth: boolean = true;
    includeOwner: boolean = false;
}

export class ParsedAttr {
    name: string = null;
    exists: boolean = false;
    tagNameFilters: Array<ParsedTag> = null;
}


export default function parseQuery(query: string): ParsedQuery {
    const output = splitQuery(query);

    output.where = identifyTags(output.where, output);
    output.order = identifyTags(output.order, output);

    output.where = identifyAttrs(output.where, output);
    output.order = identifyAttrs(output.order, output);

    return output;
}


export function splitQuery(query: string): ParsedQuery {
    query = ' ' + query + ' ';
    const output = new ParsedQuery();

    const orderByIndex = query.toUpperCase().indexOf(' ORDER BY ');
    if (orderByIndex < 0) {
        output.where = query.trim();
    }
    else {
        output.where = query.substring(0, orderByIndex).trim();
        output.order = query.substring(orderByIndex + ' ORDER BY '.length).trim();
    }
    if (output.where == '')
        output.where = null;
    return output;
}


export function identifyTags(query: string, parsedQuery: ParsedQuery): string {
    const regexes: Array<RegExp> = [
        /(#+\??~?|~)([\w\d]+\.)?([\w\d]+)/,            //Single word tags and space names
        /(#+\??~?|~)\[([\w\d\s]+\.)?([\w\d\s]+)\]/     //Multi-word tags and space names wrapped in []
    ];
    for (const regex of regexes) {
        while (true) {
            const match = regex.exec(query);
            if (!match)
                break;
    
            const hashPrefix = match[1];
            const parsedTag = new ParsedTag();
            parsedTag.space = !!match[2] ? match[2].substring(0, match[2].length - 1) : null;
            parsedTag.name = match[3];
            parsedTag.includeOwner = hashPrefix.includes('~');
            parsedTag.searchDepth = (hashPrefix.match(/#/g)||[]).length;
            parsedTag.strictSearchDepth = !hashPrefix.includes('?');
            
            const fullMatch = match[0];
            const matchStart = query.indexOf(fullMatch);
            const matchEnd = matchStart + fullMatch.length;
            query = query.substring(0, matchStart) + `{tag${parsedQuery.tags.length}}` + query.substring(matchEnd);
            parsedQuery.tags.push(parsedTag);
        }
    }
    return query;
}


export function identifyAttrs(query: string, parsedQuery: ParsedQuery): string {
    const regexes: Array<RegExp> = [
        /@([\w\d]+)/,
        /@\[([\w\d\s]+)\]/
    ];
    for (const regex of regexes) {
        while (true) {
            //If no more matches to be found, continue to next regex test
            const match = regex.exec(query);
            if (!match)
                break;
            
            //Build up basic properties of ParsedAttr object
            const parsedAttr = new ParsedAttr();
            parsedAttr.name = match[1];
            
            //Record the positions of where the match starts and ends
            const matchStart = query.indexOf(match[0]);
            let matchEnd = matchStart + match[0].length;

            //Check if there's a test for existance of the attribute on notes
            if (query.substring(matchEnd, matchEnd + '.Exists()'.length) == '.Exists()') {
                parsedAttr.exists = true;
                matchEnd += '.Exists()'.length;
            }

            //Check if there's any conditions about which tags to look for the attribute on
            if (query.substring(matchEnd, matchEnd + '.On('.length) == '.On(') {
                let tagFilterStart = matchEnd + '.On('.length;
                matchEnd = query.indexOf(')', tagFilterStart);
                if (matchEnd < 0)
                    throw Error('Unclosed bracket detected');
                let tagNameFilters = query.substring(tagFilterStart, matchEnd).split('|');
                const dummyParsedQuery = new ParsedQuery();
                for (let tagNameFilter of tagNameFilters) {
                    if (!tagNameFilter.startsWith('~'))
                        tagNameFilter = '~' + tagNameFilter;
                    identifyTags(tagNameFilter, dummyParsedQuery);
                }
                parsedAttr.tagNameFilters = dummyParsedQuery.tags;
                matchEnd++;
            }

            query = query.substring(0, matchStart) + `{attr${parsedQuery.attrs.length}}` + query.substring(matchEnd);
            parsedQuery.attrs.push(parsedAttr);
        }
    }
    return query;
}