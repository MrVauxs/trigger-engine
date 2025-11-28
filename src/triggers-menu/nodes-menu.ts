import { NodeEntry, TriggerApplication } from "engine";
import { ApplicationConfiguration, ApplicationRenderOptions, render } from "module-helpers";

class BlueprintNodesMenu extends foundry.applications.api.ApplicationV2 {
    #application: TriggerApplication;
    #entry: NodeEntry | undefined;
    #resolve: BlueprintNodesMenuResolve;

    constructor(
        application: TriggerApplication,
        resolve: BlueprintNodesMenuResolve,
        entry: NodeEntry | undefined,
        options?: DeepPartial<ApplicationConfiguration>
    ) {
        super(options);

        this.#application = application;
        this.#entry = entry;
        this.#resolve = resolve;
    }

    static async wait(
        application: TriggerApplication,
        entry?: NodeEntry
    ): Promise<BlueprintNodesMenuResult | null> {
        return new Promise((resolve: BlueprintNodesMenuResolve, entry) => {
            new BlueprintNodesMenu(application, resolve, entry).render(true);
        });
    }

    async _prepareContext(options: ApplicationRenderOptions): Promise<NodesMenuContext> {
        return {};
    }

    _renderHTML(context: NodesMenuContext, options: ApplicationRenderOptions): Promise<string> {
        return render("nodes-menu", context);
    }

    _replaceHTML(result: string, content: HTMLElement, options: ApplicationRenderOptions): void {
        content.innerHTML = result;
    }
}

type NodesMenuContext = {};

type BlueprintNodesMenuResolve = (value: BlueprintNodesMenuResult | null) => void;

type BlueprintNodesMenuResult = {};

export { BlueprintNodesMenu };
