import { BuiltInEntryField } from ".";
import fields = foundry.data.fields;

class BooleanField extends BuiltInEntryField<boolean, BooleanFieldSchema> {
    static get defineSchema(): BooleanFieldSchema {
        return {
            default: new fields.BooleanField({
                required: false,
                nullable: false,
                initial: undefined,
            }),
        };
    }

    get cursor(): PIXI.Cursor {
        return "pointer";
    }

    get height(): number {
        return this.maxHeight * 0.75;
    }

    get width(): number {
        return this.height;
    }

    get activeColor(): ColorSource {
        return 0xad0303;
    }

    draw(): void {
        if (this.isConnected || this.value) {
            this.beginFill(this.isConnected ? this.backgroundColor : this.activeColor);
        }

        this.lineStyle({ color: this.borderColor, width: this.borderWidth });
        this.drawRect(0, 0, this.width, this.height);

        this.endFill();
    }

    async onClick(): Promise<boolean> {
        return !this.value;
    }
}

type BooleanFieldSchema = {
    default: fields.BooleanField<boolean, boolean, false, false, false>;
};

export { BooleanField };
export type { BooleanFieldSchema };
