import path from 'path';
import JSONValidator from './json-validator';
import types from './typings/typings';

import headerSchema from '../header.schema.json';
import keyDataSchema from '../key-data.schema.json';

namespace HeaderParser {
    const HEADER_TAG = '\\[header\\]';
    const HEADER_REGEX = new RegExp(`^\\s*?${HEADER_TAG}([\\s\\S]*?)${HEADER_TAG}`);

    export async function getHeader(input: string): Promise<types.IFullHeader> {

        const headerContent = input.match(HEADER_REGEX);

        if (headerContent === null) {
            return {
                processed: {},
                raw: ''
            }; // empty header
        }

        const rawHeaderObject = JSON.parse(headerContent[1]);

        return {
            processed: await JSONValidator.validate<types.IHeader>(rawHeaderObject, headerSchema, keyDataSchema),
            raw: headerContent[0]
        };
    }
}

export = HeaderParser;
