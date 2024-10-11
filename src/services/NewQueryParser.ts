'use strict';


export class NewParsedQuery {
    where: string = null;
    order: string = null;
    tags: Array<NewParsedTag> = [];
}

export class NewParsedTag {
    space: string = null;
    name: string = null;
    searchDepths: Array<number> = [];
    filter: NewParsedTagFilter = null;
}

export class NewParsedTagFilter {
    pattern: string = null;
    exps: Array<string> = [];
}


export default function newParseQuery(query: string): NewParsedQuery {
    const output = splitQuery(query);

    output.where = identifyTags(output.where, output);
    output.order = identifyTags(output.order, output);

    return output;
}


export function splitQuery(query: string): NewParsedQuery {
    query = ' ' + query + ' ';
    const output = new NewParsedQuery();

    const orderByIndex = query.toUpperCase().indexOf(' ORDER BY ');
    if (orderByIndex < 0)
        output.where = query.trim();
    else {
        output.where = query.substring(0, orderByIndex).trim();
        output.order = query.substring(orderByIndex + ' ORDER BY '.length).trim();
    }
    if (output.where == '')
        output.where = null;
    return output;
}


export function identifyTags(query: string, parsedQuery: NewParsedQuery): string {
    const regexes: Array<RegExp> = [
        /([#@_]+)([\w\d]+\.)?([\w\d]+)/,            //Single word tags and space names
        /([#@_]+)\[([\w\d\s]+\.)?([\w\d\s]+)\]/     //Multi-word tags and space names wrapped in []
    ];
    for (const regex of regexes) {
        while (true) {
            const match = regex.exec(query);
            if (!match)
                break;

            let hashPrefix = match[1];
            const parsedTag = new NewParsedTag();
            parsedTag.space = !!match[2] ? match[2].substring(0, match[2].length - 1) : null;
            parsedTag.name = match[3];
            if (hashPrefix.startsWith('@')) {
                parsedTag.searchDepths.push(0);
                hashPrefix = hashPrefix.substring(1);
            }
            for (let i = 0; i < hashPrefix.length; i++) {
                if (hashPrefix[i] == '#')
                    parsedTag.searchDepths.push(i + 1);
            }

            const fullMatch = match[0];
            const matchStart = query.indexOf(fullMatch);
            const matchEnd = matchStart + fullMatch.length;
            const tagDataFilter = getTagDataFilterText(query, matchEnd);
            if (!!tagDataFilter) {
                query = query.substring(0, matchEnd) + query.substring(matchEnd + tagDataFilter.length + 2);
                processTagDataFilter(parsedTag, tagDataFilter);
            }
            query = query.substring(0, matchStart) + `{tag${parsedQuery.tags.length}}` + query.substring(matchEnd);
            parsedQuery.tags.push(parsedTag);
        }
    }
    return query;
}


function getTagDataFilterText(query: string, tagEndIndex: number): string {
    if (query.charAt(tagEndIndex) != '{')
        return null;

    let i = tagEndIndex + 1;
    let braceDepth = 1;
    while (true) {
        if (i >= query.length)
            throw Error(`Invalid query syntax, expected closing '}' symbol.`);
        const char = query.charAt(i);
        if (char == '{')
            braceDepth++;
        else if (char == '}') {
            braceDepth--;
            if (braceDepth == 0)
                break;
        }
        i++;
    }
    return query.substring(tagEndIndex + 1, i);
}

function processTagDataFilter(parsedTag: NewParsedTag, filterText: string): void {
    filterText = ` ${filterText}`;
    parsedTag.filter = new NewParsedTagFilter();
    parsedTag.filter.pattern = filterText;
    const expressionRegex = /[\s\(]\.([\w\d\[\]\.]+)/;

    while (true) {
        const match = expressionRegex.exec(parsedTag.filter.pattern);
        if (!match)
            break;

        const expression = match[1];
        parsedTag.filter.pattern = parsedTag.filter.pattern.replace(`.${expression}`, `{exp${parsedTag.filter.exps.length}}`);
        parsedTag.filter.exps.push(expression);
    }
    parsedTag.filter.pattern = parsedTag.filter.pattern.trim();
}