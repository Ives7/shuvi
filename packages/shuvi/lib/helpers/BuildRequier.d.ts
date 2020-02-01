import { ModuleManifest } from "@shuvi/types/build";
interface BuildRequireConstructionOptions {
    buildDir: string;
}
export default class BuildRequire {
    private _options;
    constructor(options: BuildRequireConstructionOptions);
    requireDocument(): any;
    requireApp(): any;
    getEntryAssets(name: string): string[];
    getModules(): {
        [moduleId: string]: ModuleManifest[];
    };
    private _resolveServerModule;
    private _requireDefault;
    private _getServerManifest;
    private _getClientManifest;
    private _getManifest;
}
export {};
