# file-configurator

A glorified search-and-replace tool for files and strings.

The module is able to replace certain keys in text with replacement values. It also allows the definition of additional rules that apply when replacing keys (for example padding before or after the inserted value).

The module is intended to work with file contents and not strings that are defined directly in a program (in this case it should be simpler to use other mechanics, like template strings).

## Contents

-   [Installation](#installation)
-   [Usage](#usage)
    -   [Function Overview](#function-overview)
    -   [The Context Object](#the-context-object)
-   [Advanced Usage](#advanced-usage)
    -   [Attaching Metadata](#attaching-metadata)
    -   [Header](#header)
    -   [Example](#example)
    -   [Caching](#caching)
-   [JSON schema files](#json-schema-files)

## Installation

```
npm install file-configurator
```

There is no need to install additional typings (such as the package `@types/file-configurator`), the module comes with its typings included.

## Usage

A file can be configured using the following code:

```javascript
const FileConfigurator = require('file-configurator');
const configured = await FileConfigurator.configure('./input-file.txt', {
    myKey: 'my-value'
});
```

For a file with the content

```
My configured value is '@myKey@'.
```

the output would be:

```
My configured value is 'my-value'.
```

As has been shown, the key `@myKey@` has been substituted with the value `my-value`. It is also possible to use `$` instead of `@`. However, the two can not be mixed within a single key (for example, `@myKey$` is not a valid key).

This is what happened:

1. The configurator searched the file for any keys.
2. The configurator will look for each found key in the object that was passed as second parameter to `.configure()` (also called context object or just context).
3. Each key in the input will be replaced with its corresponding value from the context object.

### Function Overview

The following functions are available for usage:

-   `.configure(path, context, options)`: Reads the file from `path` and configures its contents. The configured file contents will be returned as string in a promise.
    -   `path`: The path to the file.
    -   `context`: The context object. See [The Context Object](the-context-object).
    -   `options`: Additional options. Allowed keys are:
        -   `encoding`: The encoding of the input file. Type is `string`. Default is `utf-8`.
        -   `cache`: Whether the loaded file will be cached. Type is `boolean`. Default is `false`. See chapter [caching](#caching) for further information.
-   `.configureSync(path, context, options)`: The same as `.configure()`, but synchronously.
-   `.configureString(input, context)`: Configures the string that pass passed as the parameter `input` and returns the configured string in a promise.
    -   `input`: The input string.
    -   `context`: The context object. This is an object with strings as both keys and values.
-   `.configureStringSync(path, context, options)`: The same as `.configureString()`, but synchronously.

### The Context Object

The context object is used to pass data that is used for the configuration to the configurator.

The keys in the object are strings. The values can be:

-   `string`
-   `string[]`
-   `null`
-   `boolean`
-   `undefined`

All of these types are in some way transformed into strings (except `undefined`, which behaves a bit differently, see `ignoreIfUndefined` in [Attaching Metadata](#attaching-metadata)).

The transformations are the following:

-   `string`: This is already a string, hence no transformation is required.
-   `string[]`: All of the elements in the array will be joined into a single string. See `arrayJoin` in [Attaching Metadata](#attaching-metadata).
-   `null`: Will be transformed into the string `'null'`.
-   `boolean`: Will be transformed into either `'true'` or `'false'`, depending on the value.

## Advanced Usage

So far, each key has been a simple key that will only be replaced without any further actions (except transforming the values to strings, as described above). However, it is possible to further configure the behavior of keys.

### Attaching Metadata

A simple key looks like this: `@myKey@` i.e. a key that only contains the key name (`myKey` in this case). Additionally, it is also possible to attach JSON data to such a key. This JSON data is put after the key name with a colon separating the two. For example:

```
@myKey:{"padLeft": " "}@
```

In this case, the key name is string `myKey`. The attached JSON data is

```json
{
    "padLeft": " "
}
```

There are a lot of predefined keys that can be used in this JSON data:

-   `padLeft`: A string that will be placed left of the replacement value. Type is `string`. Default is an empty string. If the value type is an array, then the padding will be applied to each line before joining them.
-   `padRight`: A string that will be placed right of the replacement value. Type is `string`. Default is an empty string. If the value type is an array, then the padding will be applied to each line before joining them.
-   `ignoreIfUndefined`: If the replacement value is `undefined`, then the key will be replaced with the value in `ignoreIfUndefinedReplacement` (Since `ignoreIfUndefinedReplacement` is an empty string by default, the behavior of `ignoreIfUndefined` is usually that the key will simply be removed from the input, hence the term 'ignore'). Type is `boolean`. Default is `true`.
-   `ignoreIfUndefinedReplacement`: The value that will be used as replacement value if the rule `ignoreIfUndefinedReplacement` is triggered. Note that this value will not be padded by the value(s) in `padLeft` and `padRight`.
-   `switch`: When this key is used, the behavior of the replacement will be changed entirely. Instead of using the value in the context as replacement value, it will be used as a condition to select the actual value from a list of predefined values. The type is object, see the following properties. The default is `undefined` - i.e. the default behavior will be used instead of the switch behavior. The behavior of a switch replacement is rather similar to that of a `switch` statement from a programming language like JavaScript. Only has an effect if the value type is a string. The value that the switch produces will again be configured if that value is a regular key (with the same context and header as the original input). In this case, the keys using `$` are very important to avoid parsing issues.
-   `switch.cases`: An object that maps the possible values from the context to the values that will actually be used. Each key in this object is a possible value from the context and each value is its corresponding replacement value. The type is an object, that has strings as both keys and values. This property is always required, hence no default.
-   `switch.default`: The replacement value that will be used if none of the cases in `switch.cases` match the context-value. The type is string. Default is an empty string.
-   `arrayJoin`: A string that will be used to join the values in an array. Only has any effect if the value type is an array.

### Header

As described before, it is possible to attach JSON data to a key. However, depending on the attached data, the JSON will be made of quite a lot characters (which makes it hard to read, especially because no line breaks are allowed).

In order to resolve this issue, a header can be used. A header is a text block at the beginning of the file that can be used to declare JSON data. This header text block will not be part of the configured output.

The header content is enclosed by `[header]` tags - one tag at the start and one at the end. The start header tag needs to be the thirst text in the input (including whitespace and line breaks). If tag is preceded by any other text, it will be interpreted as regular content that will be configured.

The content of the header is a single JSON object. In it are the declarations for the various JSON objects that can be attached to a key. Each of the declared JSON objects has a name (i.e. the key that the JSON object was declared under). This name is used to reference the JSON data from a key (the referencing is done by placing the name preceded by a `#` after the colon in the key).

Headers are the preferred form of providing JSON data for keys.

### Example

The following text is an exemplary input for the configurator.

```
[header]
{
    "myKey": {
        "padLeft": "==="
    },
    "anotherKey": {
        "ignoreIfUndefined": false
    },
    "switchKey": {
        "switch": {
            "cases": {
                "firstCase": "first case",
                "secondCase": "second case"
            },
            "default: "default case"
        }
    }
}
[header]
This is the start of the actual text.

After this, a key with left padding will be inserted: @myKey:#myKey@.

The following text will be 'undefined': @anotherKey:#anotherKey@.

The case that was chosen is the '@switchKey:#switchKey@'.
```

When configured with the following context

```javascript
{
    "myKey": "my-value",
    "anotherKey": undefined,
    "switchKey": "secondCase"
}
```

the following output will be produced:

```
This is the start of the actual text.

After this, a key with left padding will be inserted: ===my-value.

The following text will be 'undefined': undefined.

The case that was chosen is the 'second case'.
```

### Caching

The two functions that read files (`.configure()`) share a cache for files that have been read by them. If a file is configured multiple times and it has been cached, then the cached file will be used instead of re-reading the file from the disc. A file will be cached if it is not cached yet and the option `cache` is `true` (default is `false`).

Caching should be used if 1) The same file is configured multiple times and 2) The file contents do not change between configurations.

Note that if a file is already cached and configured again, then the cache will be used, even if the option `cache` is `false`.

## JSON schema files

The JSON schema files that are used to validate key JSON data and header data can be found in the directory `schemas` in the root directory of the module.
