import { TriggerApplication } from "engine";
import { MODULE } from "module-helpers";

class BuiltinApplication extends TriggerApplication {
    constructor() {
        super(MODULE.id, "builtins", {
            mode: "free",
            nodes: [],
        });
    }

    get mode(): "builtin" {
        return "builtin";
    }
}
