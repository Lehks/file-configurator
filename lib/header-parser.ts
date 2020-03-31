import headerSchema from '../schemas/header.schema.json';
import keyDataSchema from '../schemas/key-data.schema.json';
import JSONValidator from './json-validator';
import types from './typings/typings';

namespace HeaderParser {
    const HEADER_TAG = '\\[header\\]';
    const HEADER_REGEX = new RegExp(`^${HEADER_TAG}([\\s\\S]*?)${HEADER_TAG}`);

    export function getHeader(input: string): types.IFullHeader {
        const headerContent = HEADER_REGEX.exec(input);

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
