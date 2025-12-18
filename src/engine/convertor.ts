import { R } from "module-helpers";

function mapConvertors<T extends EntryConvertor>(
    convertors: T[]
): [ExtractConvertorsKeys<T>, EntryConvertor][] {
    return R.pipe(
        convertors,
        R.filter(({ input, output, convertToInput }) => {
            return R.isString(input) && R.isString(output) && R.isFunction(convertToInput);
        }),
        R.map((convertor) => {
            return [`${convertor.output}-to-${convertor.input}`, convertor] as const;
        })
    ) as [ExtractConvertorsKeys<T>, T][];
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
    convertToInput: (value: TOutput) => TInput;
};

export { mapConvertors };
export type { EntryConvertor };
