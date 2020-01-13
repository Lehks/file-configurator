import fs from 'fs';
import HeaderParser from './header-parser';
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
        [key: string]: string;
    }

    interface IFullKey {
        name: string;
        data: string | undefined;
    }

    const cache: {[key: string]: string} = {};

    /**
     * Configures the contents of a file.
     *
     * @param path The path to the input file.
     * @param context The context object.
     * @param options Optional options that control the file encoding and cache usage.
     *
     * @returns The configured file content as string.
     */
    export async function configure(path: string, context: IContext, options?: IFileConfigOptions): Promise<string> {
        const processOptions = makeOptions(options);
        const input = loadFile(path, processOptions.encoding);
        cacheFile(path, input, processOptions.cache);

        return configureString(input, context);
    }

    /**
     * Configures the contents of a string.
     *
     * @param input The input string. This string will not be changed.
     * @param context The context object.
     *
     * @returns The configured input.
     */
    export async function configureString(input: string, context: IContext): Promise<string> {
        const header = await HeaderParser.getHeader(input);
        const ret = input.substring(header.raw.length);

        return ret.replace(makeGlobalKeyRegex(), key => {
            return makeReplacementValue(context, parseKey(key), header.processed);
        });
    }

    function parseKey(key: string): IFullKey {
        const matches = key.match(makeKeyDataRegex())!;
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

    function cacheFile(path: string, input: string, shouldCache: boolean) {
        if (shouldCache && !cache[path]) {
            cache[path] = input;
        }
    }

    function makeGlobalKeyRegex(): RegExp {
        return /@.*?@/g;
    }

    function makeKeyDataRegex(): RegExp {
        return /@(.*?)(?::(.+?))?@/;
    }

    function makeReplacementValue(context: IContext, key: IFullKey, header: types.IHeader): string {
        const contextValue = context[key.name];

        const data = processKeyData(getKeyData(key, header));

        if (data.ignoreIfUndefined && contextValue === undefined) {
            return data.ignoreIfUndefinedReplacement;
        } else if (!data.switch) {
            return `${data.padLeft}${contextValue}${data.padRight}`;
        } else {
            // return default value if the contextValue is undefined
            if (contextValue === undefined) {
                return data.switch.default;
            } else {
                const caseValue = data.switch.cases[contextValue];
                if (caseValue) {
                    return caseValue;
                } else {
                    return data.switch.default;
                }
            }
        }
    }

    function getKeyData(key: IFullKey, header: types.IHeader): types.IData {
        if (!key.data) {
            return {};
        }

        if (key.data.startsWith('#')) {
            const dataName = key.data.substring(1);
            return header[dataName];
        } else {
            return JSON.parse(key.data);
        }
    }

    function processKeyData(data: types.IData): types.IProcessedData {
        const DEFAULT_PAD_LEFT = '';
        const DEFAULT_PAD_RIGHT = '';
        const DEFAULT_IGNORE_IF_UNDEFINED = true;
        const DEFAULT_IGNORE_IF_UNDEFINED_REPLACEMENT = '';

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
            switch: processSwitchData(data.switch)
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
