// out

type CustomOutDataSchema = BaseCustomDataSchema;

type CustomeOutSchema = BaseCustomSchema;

// output

type CustomOutputDataSchema = BaseCustomDataSchema;

type CustomOutputSchema = BaseCustomSchema;

// input

type CustomInputDataSchema = BaseCustomDataSchema;

type CustomInputSchema<TFieldSchema extends fields.DataSchema | undefined = any> = Prettify<
    BaseCustomSchema & {
        field?: EntryField<TFieldSchema>;
    }
>;

// base

type BaseCustomDataSchema = {
    /** selected to be an array entry */
    isArray: boolean;
    /** auto-generated id */
    key: string;
    /** provided label by user or auto-generated from schema type */
    label: string;
    /** way to find which schema should be used */
    slug: string;
    /** the entry type selected */
    type: string;
};

type BaseCustomSchema = {
    /** should this entry belong to a group */
    group?: boolean;
    /** should the custom entry have an extra user input */
    input?: {
        /** should the input be a number instead of a text */
        isNumber?: boolean;
        /** the label for the input */
        label?: string;
        /** should the custom entry label be excluded */
        replaceLabel?: boolean;
    };
    /** unique slug to identify the customs */
    slug: string;
    /** the entry types allowed for this custom (empty means all) */
    types: string[];
};
