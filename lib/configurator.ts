import fs from 'fs';
import keyDataSchema from '../schemas/key-data.schema.json';
import HeaderParser from './header-parser';
import JSONValidator from './json-validator';
import types from './typings/typings';

namespace Configurator {
    /**
     * The options that can be passed to `configure()`.
     */
    export interface IFileConfigOptions {
        /**
         * The encoding of the file. Defaults to `utf-8`.
         */
        encoding?: string;

        /**
         * Decides whether the file should be cached. Defaults to `false`.
         */
        cache?: boolean;
    }

    interface IProcessedFileConfigOptions {
        encoding: string;
        cache: boolean;
    }

    /**
     * The context that can be passed to `configure()` and `configureString()`.
     */
    export interface IContext {
        /**
         * A single context entry.
         */
        [key: string]: string | string[] | undefined | boolean | null;
    }

    interface IFullKey {
        name: string;
        data: string | undefined;
    }

    let cache: { [key: string]: string } = {};

    /**
     * Asynchronously configures the contents of a file.
     *
     * @param path The path to the input file.
     * @param context The context object.
     * @param options Optional options that control the file encoding and cache usage.
     *
     * @returns The configured file content as string.
     */
    export async function configure(path: string, context: IContext, options?: IFileConfigOptions): Promise<string> {
        return configureSync(path, context, options);
    }

    /**
     * Synchronously configures the contents of a file.
     *
     * @param path The path to the input file.
     * @param context The context object.
     * @param options Optional options that control the file encoding and cache usage.
     *
     * @returns The configured file content as string.
     */
    export function configureSync(path: string, context: IContext, options?: IFileConfigOptions): string {
        const processOptions = makeOptions(options);
        const input = loadFile(path, processOptions.encoding);
        cacheFile(path, input, processOptions.cache);

        return configureStringSync(input, context);
    }

    /**
     * Asynchronously configures the contents of a string.
     *
     * @param input The input string. This string will not be changed.
     * @param context The context object.
     *
     * @returns The configured input.
     */
    export async function configureString(input: string, context: IContext): Promise<string> {
        return configureStringSync(input, context);
    }

    /**
     * Synchronously configures the contents of a string.
     *
     * @param input The input string. This string will not be changed.
     * @param context The context object.
     *
     * @returns The configured input.
     */
    export function configureStringSync(input: string, context: IContext): string {
        const header = HeaderParser.getHeader(input);
        const ret = input.substring(header.raw.length);

        return ret.replace(makeGlobalKeyRegex(), key => {
            return makeReplacementValue(context, parseKey(key), header.processed);
        });
    }

    export function clearCache(): void {
        cache = {};
    }

    function parseKey(key: string): IFullKey {
        const matches = makeKeyDataRegex(key.startsWith('$')).exec(key)!;

        return {
            name: matches[1],
            data: matches[2]
        };
    }

    function makeOptions(options?: IFileConfigOptions): IProcessedFileConfigOptions {
        const DEFAULT_ENCODING = 'utf-8';
        const DEFAULT_CACHE = false;

        if (!options) {
            return {
                encoding: DEFAULT_ENCODING,
                cache: DEFAULT_CACHE
            };
        } else {
            const ret: IProcessedFileConfigOptions = {
                encoding: options.encoding === undefined ? DEFAULT_ENCODING : options.encoding,
                cache: options.cache === undefined ? DEFAULT_CACHE : options.cache
            };

            return ret;
        }
    }

    function loadFile(path: string, encoding: string): string {
        if (cache[path]) {
            return cache[path];
        } else {
            return fs.readFileSync(path, encoding);
        }
    }

    function cacheFile(path: string, input: string, shouldCache: boolean): void {
        if (shouldCache && !cache[path]) {
            cache[path] = input;
        }
    }

    function makeGlobalKeyRegex(): RegExp {
        return /(@.*?@)|((\$.*?\$))/g;
    }

    function makeKeyDataRegex(useDollar: boolean): RegExp {
        if (useDollar) {
            return /[$](.*?)(?::(.+?))?[$]/;
        } else {
            return /@(.*?)(?::(.+?))?@/;
        }
    }

    function makeReplacementValue(context: IContext, key: IFullKey, header: types.IHeader): string {
        const contextValue = getContextValue(context, key);

        const data = processKeyData(getKeyData(key, header));

        // undefined values behave the same for arrays and strings
        if (contextValue === undefined) {
            if (data.ignoreIfUndefined) {
                return data.ignoreIfUndefinedReplacement;
            } else {
                return 'undefined';
            }
        } else if (typeof contextValue === 'string') {
            if (data.switch) {
                const caseValue = data.switch.cases[contextValue];
                const value = caseValue !== undefined ? caseValue : data.switch.default;

                return configureStringSync(`[header]${JSON.stringify(header)}[header]${value}`, context);
            } else {
                return `${data.padLeft}${contextValue}${data.padRight}`;
            }
        } else {
            return contextValue.map(v => `${data.padLeft}${v}${data.padRight}`).join(data.arrayJoin);
        }
    }

    function getContextValue(context: IContext, key: IFullKey): string | string[] | undefined {
        const unprocessedValue = context[key.name];
        let ret: string | string[] | undefined;

        if (typeof unprocessedValue === 'boolean') {
            ret = unprocessedValue.toString();
        } else if (unprocessedValue === null) {
            ret = 'null';
        } else {
            ret = unprocessedValue;
        }

        return ret;
    }

    function getKeyData(key: IFullKey, header: types.IHeader): types.IData {
        if (!key.data) {
            return {};
        }

        if (key.data.startsWith('#')) {
            const dataName = key.data.substring(1);
            return header[dataName];
        } else {
            const rawJSON = JSON.parse(key.data);
            return JSONValidator.validate(rawJSON, keyDataSchema);
        }
    }

    function processKeyData(data: types.IData): types.IProcessedData {
        const DEFAULT_PAD_LEFT = '';
        const DEFAULT_PAD_RIGHT = '';
        const DEFAULT_IGNORE_IF_UNDEFINED = true;
        const DEFAULT_IGNORE_IF_UNDEFINED_REPLACEMENT = '';
        const DEFAULT_ARRAY_JOIN = '';

        // iiu = ignore if undefined
        const iiuIn = data.ignoreIfUndefined;
        const iiu = iiuIn === undefined ? DEFAULT_IGNORE_IF_UNDEFINED : iiuIn;

        // iiu = ignore if undefined replacement
        const iiurIn = data.ignoreIfUndefinedReplacement;
        const iiur = iiurIn === undefined ? DEFAULT_IGNORE_IF_UNDEFINED_REPLACEMENT : iiurIn;

        const ret: types.IProcessedData = {
            padLeft: data.padLeft === undefined ? DEFAULT_PAD_LEFT : data.padLeft,
            padRight: data.padRight === undefined ? DEFAULT_PAD_RIGHT : data.padRight,
            ignoreIfUndefined: iiu,
            ignoreIfUndefinedReplacement: iiur,
            switch: processSwitchData(data.switch),
            arrayJoin: data.arrayJoin === undefined ? DEFAULT_ARRAY_JOIN : data.arrayJoin
        };

        return ret;
    }

    function processSwitchData(switchData?: types.ISwitch): types.IProcessedSwitch | undefined {
        const DEFAULT_SWITCH_DEFAULT = '';

        if (!switchData) {
            return undefined;
        }

        const ret: types.IProcessedSwitch = {
            cases: switchData.cases,
            default: switchData.default === undefined ? DEFAULT_SWITCH_DEFAULT : switchData.default
        };

        return ret;
    }
}

export = Configurator;
