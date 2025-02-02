import { join, dirname } from 'path';
import webpack from 'webpack';
export { webpack as default };
export { WebpackChain } from './config';
export { DynamicDll } from './dynamic-dll';
/**
 * re-export for shuvi plugin
 */
export {
  webpack,
  validate,
  validateSchema,
  version,
  cli,
  ModuleFilenameHelpers,
  RuntimeGlobals,
  UsageState,
  WebpackOptionsValidationError,
  ValidationError,
  cache,
  config,
  dependencies,
  ids,
  javascript,
  optimize,
  runtime,
  prefetch,
  web,
  webworker,
  node,
  electron,
  wasm,
  library,
  container,
  sharing,
  debug,
  util,
  sources,
  experiments,
  WebpackPluginFunction,
  /** export */
  AutomaticPrefetchPlugin,
  AsyncDependenciesBlock,
  BannerPlugin,
  Cache,
  Chunk,
  ChunkGraph,
  CleanPlugin,
  Compilation,
  Compiler,
  ConcatenationScope,
  ContextExclusionPlugin,
  ContextReplacementPlugin,
  DefinePlugin,
  DelegatedPlugin,
  Dependency,
  DllPlugin,
  DllReferencePlugin,
  DynamicEntryPlugin,
  EntryOptionPlugin,
  EntryPlugin,
  EnvironmentPlugin,
  EvalDevToolModulePlugin,
  EvalSourceMapDevToolPlugin,
  ExternalModule,
  ExternalsPlugin,
  Generator,
  HotUpdateChunk,
  HotModuleReplacementPlugin,
  IgnorePlugin,
  JavascriptModulesPlugin,
  LibManifestPlugin,
  LibraryTemplatePlugin,
  LoaderOptionsPlugin,
  LoaderTargetPlugin,
  Module,
  ModuleGraph,
  ModuleGraphConnection,
  NoEmitOnErrorsPlugin,
  NormalModule,
  NormalModuleReplacementPlugin,
  MultiCompiler,
  Parser,
  Plugin,
  PrefetchPlugin,
  ProgressPlugin,
  ProvidePlugin,
  RuntimeModule,
  EntryPlugin as SingleEntryPlugin,
  SourceMapDevToolPlugin,
  Stats,
  Template,
  WatchIgnorePlugin,
  WebpackError,
  WebpackOptionsApply,
  WebpackOptionsDefaulter,
  Entry,
  EntryNormalized,
  EntryObject,
  LibraryOptions,
  ModuleOptions,
  ResolveOptions,
  RuleSetCondition,
  RuleSetConditionAbsolute,
  RuleSetRule,
  RuleSetUse,
  RuleSetUseItem,
  Configuration,
  WebpackOptionsNormalized,
  WebpackPluginInstance,
  Asset,
  AssetInfo,
  MultiStats,
  ParserState,
  Watching,
  StatsAsset,
  StatsChunk,
  StatsChunkGroup,
  StatsChunkOrigin,
  StatsCompilation,
  StatsError,
  StatsLogging,
  StatsLoggingEntry,
  StatsModule,
  StatsModuleIssuer,
  StatsModuleReason,
  StatsModuleTraceDependency,
  StatsModuleTraceItem,
  StatsProfile
} from 'webpack';

/**
 * resolve webpack module for not shuvi plugin
 */
const webpackResolveContext = join(
  dirname(require.resolve('webpack/package.json')),
  '../'
);
export { webpackResolveContext };
