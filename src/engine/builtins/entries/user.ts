import { NodeEntry } from "engine";
import { UserPF2e } from "module-helpers";

class UserEntry extends NodeEntry<UserPF2e | undefined> {
    static get type(): "user" {
        return "user";
    }

    static get default(): undefined {
        return undefined;
    }

    static get color(): ColorSource {
        return 0x8a8a8a;
    }

    static isValidType(value: unknown): value is UserPF2e {
        return value instanceof User;
    }

    static toJSON(value: UserPF2e): string {
        return value.id;
    }

    static async fromJSON(value: string): Promise<UserPF2e | undefined> {
        return game.users.get(value);
    }
}

export { UserEntry };
