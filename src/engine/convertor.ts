import { R, UserPF2e } from "module-helpers";

function mapConvertors<T extends EntryConvertor>(convertors: T[]): [ExtractConvertorsKeys<T>, EntryConvertor][] {
    return R.pipe(
        convertors,
        R.filter(({ input, output, convertToInput }) => {
            return R.isString(input) && R.isString(output) && R.isFunction(convertToInput);
        }),
        R.map((convertor) => {
            return [createConvertorKey(convertor.output, convertor.input), convertor] as const;
        }),
    ) as [ExtractConvertorsKeys<T>, T][];
}

function createConvertorKey(output: string, input: string): `${string}-to-${string}` {
    return `${output}-to-${input}`;
}

type ExtractConvertorsKeys<T extends EntryConvertor> = T extends {
    input: infer I extends string;
    output: infer O extends string;
}
    ? `${O}-to-${I}`
    : never;

type EntryConvertor<TInput extends any = any, TOutput extends any = any> = {
    input: string;
    output: string;
    convertToInput: (value: TOutput, userContext: UserPF2e) => Promise<TInput> | TInput;
};

export { createConvertorKey, mapConvertors };
export type { EntryConvertor };
