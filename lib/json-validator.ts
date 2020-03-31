import Ajv from 'ajv';

namespace JSONValidator {
    export function validate<T>(object: any, schema: any, ...additionalSchemas: any[]): T {
        const ajv = new Ajv({
            schemas: [schema, ...additionalSchemas]
        });

        const validateFunction = ajv.compile(schema);
        const valid = validateFunction(object);
        delete object.default; // remove default property which is added by ajv

        if (valid) {
            return object as T;
        } else {
            throw new ValidationError(validateFunction.errors!);
        }
    }

    // for some reason, this can not be a member of class ValidationError
    function formatErrors(errors: Ajv.ErrorObject[]): string {
        return errors.map(error => formatError(error)).join(';');
    }

    // for some reason, this can not be a member of class ValidationError
    function formatError(error: Ajv.ErrorObject): string {
        return (
            `Validation failed with message: '${error.message}'. ` +
            `Constraint '${error.schemaPath}' failed for '${error.dataPath}'.`
        );
    }

    export class ValidationError extends Error {
        public readonly errors: (Ajv.ErrorObject & { fullMessage: string })[];

        public constructor(errors: Ajv.ErrorObject[]) {
            super();
            this.message = formatErrors(errors);
            this.errors = [];

            for (const error of errors) {
                this.errors.push({ ...error, fullMessage: '' });
                this.errors[this.errors.length - 1].fullMessage = formatError(error);
            }
        }
    }
}

export = JSONValidator;
