import { BaseExtractorNode, BuiltinsCustomEntry } from "engine";
import { R } from "module-helpers";

abstract class BaseDocumentExtractorNode<
    TInput extends any,
    TDocument extends foundry.abstract.Document,
> extends BaseExtractorNode<{ input: TInput | undefined }, any, never, "path", never> {
    static get defineCustomOutputs(): BuiltinsCustomEntry[] | null {
        return [{ slug: "path", array: true, input: {} }];
    }

    abstract _castDocument(document: TInput): TDocument | undefined;

    async _execute(): Promise<boolean> {
        const rawDocument = await this.getInputValue("input");
        const document = R.isNonNullish(rawDocument) ? this._castDocument(rawDocument) : null;

        if (document) {
            const entries = this.getCustomOutputs("path");

            for (const { key, input } of entries) {
                const value = R.isString(input) ? foundry.utils.getProperty(document, input) : undefined;
                this.setOutputValue(key, value);
            }
        }

        return this.executeNext("out");
    }
}

export { BaseDocumentExtractorNode };
