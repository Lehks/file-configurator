import fs from 'fs';
import path from 'path';
import Configurator from '../lib/configurator';

beforeEach(() => {
    jest.restoreAllMocks();
    Configurator.clearCache();
});

it('should not modify input that has no keys', async () => {
    await expect(Configurator.configureString('input', {})).resolves.toBe('input');
});

it('should correctly removed the head', async () => {
    await expect(Configurator.configureString('[header][header]input', {})).resolves.toBe('input');
});

it('should correctly do simple-search and replace', async () => {
    await expect(Configurator.configureString('My value is @key@.', {
        key: 'value'
    })).resolves.toBe('My value is value.');
});

it('should correctly insert left padding', async () => {
    const input = 'My value is @key:{"padLeft": "padLeft:"}@.';

    await expect(Configurator.configureString(input, {
        key: 'value'
    })).resolves.toBe('My value is padLeft:value.');
});

it('should correctly insert right padding', async () => {
    const input = 'My value is @key:{"padRight": ":padRight"}@.';

    await expect(Configurator.configureString(input, {
        key: 'value'
    })).resolves.toBe('My value is value:padRight.');
});

it('should ignore a key if it is configured like that', async () => {
    await expect(Configurator.configureString('No text after this@ignored@', {})).resolves.toBe('No text after this');
});

it('should insert "undefined" if the ignore setting is set to "false"', async () => {
    const input = 'Undefined after this @key:{"ignoreIfUndefined": false}@.';

    await expect(Configurator.configureString(input, {})).resolves.toBe('Undefined after this undefined.');
});

it('should insert a custom ignore replacement if one is configured', async () => {
    const input = '"replace" after this @key:{"ignoreIfUndefinedReplacement": "replace"}@.';

    await expect(Configurator.configureString(input, {})).resolves.toBe('"replace" after this replace.');
});

it('should correctly select a case in a switch statement #1', async () => {
    const data = {
        switch: {
            cases: {
                first: 'first-case',
                second: 'second-case'
            },
            default: 'default-case'
        }
    };

    const input = `The selected case is: @key:${JSON.stringify(data)}@.`;

    await expect(Configurator.configureString(input, {
        key: 'first'
    })).resolves.toBe('The selected case is: first-case.');
});

it('should correctly select a case in a switch statement #2', async () => {
    const data = {
        switch: {
            cases: {
                first: 'first-case',
                second: 'second-case'
            },
            default: 'default-case'
        }
    };

    const input = `The selected case is: @key:${JSON.stringify(data)}@.`;

    await expect(Configurator.configureString(input, {
        key: 'second'
    })).resolves.toBe('The selected case is: second-case.');
});

it('should select the default case in a switch statement if necessary', async () => {
    const data = {
        switch: {
            cases: {
                first: 'first-case',
                second: 'second-case'
            },
            default: 'default-case'
        }
    };

    const input = `The selected case is: @key:${JSON.stringify(data)}@.`;

    await expect(Configurator.configureString(input, {
        key: 'invalid'
    })).resolves.toBe('The selected case is: default-case.');
});

it('should select the default case in a switch statement if necessary (if key does not exist in context)', async () => {
    const data = {
        switch: {
            cases: {
                first: 'first-case',
                second: 'second-case'
            },
            default: 'default-case'
        }
    };

    const input = `The selected case is: @key:${JSON.stringify(data)}@.`;

    await expect(Configurator.configureString(input, {})).resolves.toBe('The selected case is: default-case.');
});

it('should default the default case in a switch statement to an empty string', async () => {
    const data = {
        switch: {
            cases: {
                first: 'first-case',
                second: 'second-case'
            }
        }
    };

    const input = `The selected case is: @key:${JSON.stringify(data)}@.`;

    await expect(Configurator.configureString(input, {})).resolves.toBe('The selected case is: .');
});

it('should be able to use JSON data that is defined directly in the key', async () => {
    await expect(Configurator.configureString('My value is @key:{"padLeft": "padLeft:"}@.', {
        key: 'value'
    })).resolves.toBe('My value is padLeft:value.');
});

it('should be able to use JSON data that is defined in the header', async () => {
    const data = {
        data: {
            padLeft: 'padLeft:'
        }
    };

    await expect(Configurator.configureString(`[header]${JSON.stringify(data)}[header]My value is @key:#data@.`, {
        key: 'value'
    })).resolves.toBe('My value is padLeft:value.');
});

it('should correctly load and configure file content', async () => {
    await expect(Configurator.configure(path.join(__dirname, 'test-file.txt.in'), {
        key: 'value'
    })).resolves.toBe('This is a test file. The value is: value.');
});

it('should correctly cache files if caching is enabled', async () => {
    const spy = jest.spyOn(fs, 'readFileSync');
    const filePath = path.join(__dirname, 'test-file.txt.in');

    await expect(Configurator.configure(filePath, {
        key: 'value'
    }, {
        cache: true
    })).resolves.toBe('This is a test file. The value is: value.');

    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockReturnValueOnce('This is another text. The value is: @key@.');

    await expect(Configurator.configure(filePath, {
        key: 'value'
    }, {
        cache: true
    })).resolves.toBe('This is a test file. The value is: value.');

    expect(spy).toHaveBeenCalledTimes(1);
});

it('should correctly cache files if caching is enabled', async () => {
    const spy = jest.spyOn(fs, 'readFileSync');
    const filePath = path.join(__dirname, 'test-file.txt.in');

    await expect(Configurator.configure(filePath, {
        key: 'value'
    }, {
        cache: false
    })).resolves.toBe('This is a test file. The value is: value.');

    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockReturnValueOnce('This is another text. The value is: @key@.');

    await expect(Configurator.configure(filePath, {
        key: 'value'
    }, {
        cache: false
    })).resolves.toBe('This is another text. The value is: value.');

    expect(spy).toHaveBeenCalledTimes(2);
});

it('should use the correct encoding', async () => {
    const output = await Configurator.configure(path.join(__dirname, 'test-file-utf-16le.txt.in'), {
        key: 'value'
    }, {
        encoding: 'utf-16le'
    });

    const compareFile = fs.readFileSync(path.join(__dirname, 'test-file-utf-16le.txt'), 'utf-16le');

    expect(output).toEqual(compareFile);
});

it('should throw if key JSON data is malformed', async () => {
    const input = 'My value is @key:invalid-json@.';

    await expect(Configurator.configureString(input, {
        key: 'value'
    })).rejects.toBeDefined();
});

it('should throw if key JSON data can not be validated', async () => {
    const input = 'My value is @key:{"invalidKey": "value"}@.';

    await expect(Configurator.configureString(input, {
        key: 'value'
    })).rejects.toBeDefined();
});

it('should configure a complex input file', async () => {
    const input = fs.readFileSync(path.join(__dirname, 'complex.txt.in'), 'utf-8');

    await expect(Configurator.configureString(input, {
        padded1: 'value',
        padded2: 'value2',
        switch1: 'first',
        switch2: 'second'
    })).rejects.toBeDefined();
});
