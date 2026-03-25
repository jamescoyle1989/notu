'use strict';


export class ParsedQuery {
    where: string = null;
    order: string = null;
    groupings: Array<ParsedGrouping> = [];
    tags: Array<ParsedTag> = [];

    compose(): string {
        let output = '';
        if (!!this.where)
            output = this.where;
        if (!!this.order)
            output += ` ORDER BY ${this.order}`;
        if (!!this.groupings && this.groupings.length > 0)
            output += ` GROUP BY ${this.groupings.map(x => x.compose()).join(', ')}`;
        for (let i = 0; i < this.tags.length; i++)
            output = output.replace(`{tag${i}}`, this.tags[i].compose());
        return output.trimStart();
    }
}

export class ParsedTag {
    space: string = null;
    name: string = null;
    searchDepths: Array<number> = [];
    filter: ParsedTagFilter = null;

    compose(): string {
        const maxDepth = this.searchDepths.reduce((a, b) => Math.max(a, b), 0);

        let hasZeroSearchDepth = false;
        let prefixArray = new Array(maxDepth).fill('_');
        for (const searchDepth of this.searchDepths) {
            if (searchDepth == 0)
                hasZeroSearchDepth = true;
            prefixArray[searchDepth - 1] = '#';
        }

        let output = `${hasZeroSearchDepth ? '@' : ''}${prefixArray.join('')}`;
        let fullName = this.name;
        if (!!this.space)
            fullName = `${this.space}.${fullName}`;
        const requiresBrackets = fullName.includes(' ');
        output += `${requiresBrackets ? '[' : ''}${fullName}${requiresBrackets ? ']' : ''}`;

        if (!!this.filter)
            output += this.filter.compose();

        return output;
    }
}

export class ParsedTagFilter {
    pattern: string = null;
    exps: Array<string> = [];

    compose(): string {
        let output = `{${this.pattern}}`;
        for (let i = 0; i < this.exps.length; i++)
            output = output.replace(`{exp${i}}`, `.${this.exps[i]}`);
        return output;
    }
}

export class ParsedGrouping {
    criteria: string;
    name: string;

    compose(): string {
        return `${this.criteria} AS '${this.name}'`;
    }
}


export default function parseQuery(query: string): ParsedQuery {
    const output = splitQuery(query);

    output.where = identifyTags(output.where, output);
    output.order = identifyTags(output.order, output);
    for (const grouping of output.groupings)
        grouping.criteria = identifyTags(grouping.criteria, output);

    return output;
}


export function splitQuery(query: string): ParsedQuery {
    query = ' ' + query + ' ';
    const output = new ParsedQuery();

    const groupByIndex = query.toUpperCase().indexOf(' GROUP BY ');
    if (groupByIndex >= 0) {
        const groupings = query.substring(groupByIndex + ' GROUP BY '.length).trim().split(',');
        for (const g of groupings) {
            const asIndex = g.toUpperCase().indexOf(' AS ');
            const grouping = new ParsedGrouping();
            grouping.criteria = g.substring(0, asIndex).trim();
            grouping.name = g.substring(asIndex + ' AS '.length).replace(/'/g, '').trim();
            output.groupings.push(grouping);
        }
        query = query.substring(0, groupByIndex + 1);
    }
    const orderByIndex = query.toUpperCase().indexOf(' ORDER BY ');
    if (orderByIndex >= 0) {
        output.order = query.substring(orderByIndex + ' ORDER BY '.length).trim();
        query = query.substring(0, orderByIndex + 1);
    }
    output.where = query.trim();
    if (output.where == '')
        output.where = null;
    return output;
}


export function identifyTags(query: string, parsedQuery: ParsedQuery): string {
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
            const parsedTag = new ParsedTag();
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

function processTagDataFilter(parsedTag: ParsedTag, filterText: string): void {
    filterText = ` ${filterText}`;
    parsedTag.filter = new ParsedTagFilter();
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