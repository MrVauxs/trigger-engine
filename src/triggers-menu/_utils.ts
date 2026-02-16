import { localize, waitDialog } from "foundry-helpers";

async function editLabelDialog(
    type: "gate" | "variable",
    { placeholder, value }: { placeholder?: string; value?: string } = {},
): Promise<string | undefined | null> {
    const group = foundry.applications.fields.createFormGroup({
        label: localize("edit-label.label"),
        input: foundry.applications.fields.createTextInput({
            name: "label",
            autofocus: true,
            placeholder: placeholder || value,
            value: value,
        }),
    });

    const result = await waitDialog<{ label: string }>({
        content: group.outerHTML,
        i18n: "edit-label",
        title: localize("edit-label.title", type, value ? "edit" : "create"),
        yes: {
            label: localize("edit-label.yes", value ? "edit" : "create"),
        },
    });

    if (!result) return null;
    return result && result.label && (!value || value !== result.label) ? result.label : undefined;
}

export { editLabelDialog };
