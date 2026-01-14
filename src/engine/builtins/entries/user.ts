import { NodeEntry } from "engine";
import { R, UserPF2e } from "module-helpers";

class UserEntry extends NodeEntry<UserPF2e | undefined> {
    static get type(): "user" {
        return "user";
    }

    static get default(): undefined {
        return undefined;
    }

    static get color(): ColorSource {
        return 0x1682c9;
    }

    static isValidType(value: unknown): value is UserPF2e {
        return value instanceof User;
    }

    static toJSON(value: UserPF2e): string {
        return value.id;
    }

    static async fromJSON(value: unknown): Promise<UserPF2e | undefined> {
        return R.isString(value) ? game.users.get(value) : undefined;
    }
}

export { UserEntry };
