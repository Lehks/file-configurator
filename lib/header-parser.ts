import JSONValidator from './json-validator';
import types from './typings/typings';

import headerSchema from '../header.schema.json';
import keyDataSchema from '../key-data.schema.json';

namespace HeaderParser {
    const HEADER_TAG = '\\[header\\]';
    const HEADER_REGEX = new RegExp(`^${HEADER_TAG}([\\s\\S]*?)${HEADER_TAG}`);

    export function getHeader(input: string): types.IFullHeader {

        const headerContent = input.match(HEADER_REGEX);

        if (headerContent === null) {
            return {
                processed: {},
                raw: ''
            }; // empty header
        }

        // if there is no JSON in the header
        if (headerContent[1].trim().length === 0) {
            return {
                processed: {},
                raw: headerContent[0]
            };
        }

        const rawHeaderObject = JSON.parse(headerContent[1]);

        return {
            processed: JSONValidator.validate<types.IHeader>(rawHeaderObject, headerSchema, keyDataSchema),
            raw: headerContent[0]
        };
    }
}

export = HeaderParser;
