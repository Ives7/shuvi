import { IRuntimeConfig } from '@shuvi/platform-core';
import { FileSnippets } from '../project/file-snippets';
import { ProjectBuilder } from '../project';
import { IServerMiddleware } from './serverMiddleware';
import { ICliPluginConstructor, ICliPluginInstance } from './cliHooks';

export interface IUserRouteConfig {
  children?: IUserRouteConfig[];
  name?: string;
  component?: string;
  middlewares?: string[];
  redirect?: string;
  path: string;
  id?: string;
}

export interface IApiRouteConfig {
  path: string;
  apiModule: string;
}

export interface IMiddlewareRouteConfig {
  path: string;
  middlewares: string[];
}

export type IShuviMode = 'development' | 'production';

export interface IPaths {
  rootDir: string;
  buildDir: string;

  // dir to store shuvi generated src files
  appDir: string;

  // user src dir
  srcDir: string;

  // functional dirs
  pagesDir: string;

  // api dirs
  apisDir: string;

  publicDir: string;
}

export interface IConfigCore {
  outputPath: string;
}

export type IRouterHistoryMode = 'browser' | 'hash' | 'memory' | 'auto';

export type IPluginConfig =
  | string
  | ICliPluginConstructor
  | ICliPluginInstance
  | [string | ((param: any) => ICliPluginInstance), any?];
export type IPresetConfig =
  | string
  | [string /* plugin module */, any? /* plugin options */];

export declare type IPhase =
  | 'PHASE_PRODUCTION_BUILD'
  | 'PHASE_PRODUCTION_SERVER'
  | 'PHASE_DEVELOPMENT_SERVER'
  | 'PHASE_INSPECT_WEBPACK';

interface IPlatform {
  name: string;
  framework?: string;
  target?: string;
  [index: string]: any;
}

export interface IApiConfig {
  outputPath: string;
  rootDir: string;
  ssr: boolean;
  publicDir: string;
  publicPath: string;
  env: Record<string, string>;
  router: {
    history: IRouterHistoryMode;
  };
  routes?: IUserRouteConfig[]; // generate by files what under src/pages or user defined
  apiRoutes?: IApiRouteConfig[]; // generate by files what under src/apis or user defined
  apiConfig?: {
    prefix?: string;
    /**
     * The byte limit of the body. This is the number of bytes or any string
     * format supported by `bytes`, for example `1000`, `'500kb'` or `'3mb'`
     * default is 1mb.
     */
    bodyParser?: { sizeLimit: number | string } | boolean;
  };
  runtimeConfig?: IRuntimeConfig;
  /**
   * specifically target for `platform-web`
   */
  target?: 'spa' | 'ssr';
  platform: IPlatform;
  proxy?: any;
  plugins?: IPluginConfig[];
  presets?: IPresetConfig[];
  analyze?: boolean;
  asyncEntry?: boolean;
}

export type IConfig = Partial<IApiConfig>;

interface ApiHelpers {
  fileSnippets: FileSnippets;
}

export type IRuntimeOrServerPlugin = {
  plugin: string;
  options?: any;
};

// api for plugins
export interface IApi {
  readonly mode: IShuviMode;
  readonly paths: IPaths;
  readonly config: IApiConfig;
  readonly phase: IPhase;
  readonly helpers: ApiHelpers;

  addEntryCode: typeof ProjectBuilder.prototype.addEntryCode;
  addAppFile: typeof ProjectBuilder.prototype.addFile;
  addAppExport: typeof ProjectBuilder.prototype.addExport;
  addAppService: typeof ProjectBuilder.prototype.addService;
  addAppPolyfill: typeof ProjectBuilder.prototype.addPolyfill;
  addRuntimePlugin: (config: IRuntimeOrServerPlugin) => void;
  addServerPlugin: (config: IRuntimeOrServerPlugin) => void;

  setPlatformModule: typeof ProjectBuilder.prototype.setPlatformModule;
  setClientModule: typeof ProjectBuilder.prototype.setClientModule;

  addServerMiddleware: (serverMiddleware: IServerMiddleware) => void;
  addServerMiddlewareLast: (serverMiddleware: IServerMiddleware) => void;

  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
  getAssetPublicUrl(...paths: string[]): string;
}

export type IResources<Extra = {}> = {
  [x: string]: any;
} & { [K in keyof Extra]: Extra[K] };

export interface IPresetSpec {
  (context: IPluginContext): {
    presets?: IApiConfig['presets'];
    plugins?: IApiConfig['plugins'];
  };
}

export interface IPreset {
  id: string;
  get: () => IPresetSpec;
}

export type IPluginContext = {
  mode: IShuviMode;
  paths: IPaths;
  config: IApiConfig;
  phase: IPhase;
  // helpers
  helpers: IApi['helpers'];
  // resources
  resources: IResources;
  getAssetPublicUrl: (...paths: string[]) => string;
};
