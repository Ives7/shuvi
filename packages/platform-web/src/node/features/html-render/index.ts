import {
  BUILD_SERVER_DIR,
  BUILD_SERVER_FILE_SERVER,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_CLIENT_RUNTIME_POLYFILLS,
  ResolvedPlugin,
  createPlugin
} from '@shuvi/service';
import { IPlatformContext } from '@shuvi/service/lib/core';
import {
  BUNDLER_DEFAULT_TARGET,
  BUNDLER_TARGET_SERVER,
  BUILD_CLIENT_RUNTIME_POLYFILLS_SYMBOL
} from '@shuvi/shared/lib/constants';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';
import { CopyFilePlugin } from '@shuvi/toolpack/lib/webpack/plugins/copy-file-plugin';
import { IWebpackEntry } from '@shuvi/service/lib/bundler/config';
import { resolvePkgFile } from '../../paths';
import { getVersion } from '../../version';
import { getMiddlewares } from '../middlewares';
import generateResource from './lib/generateResource';
import { buildHtml } from './lib/buildHtml';
import server from './server';

const ENTRY_FLAG = 'shuviEntry';

function makeEntryRequest(req: string): string {
  return `${req}?${ENTRY_FLAG}=true`;
}

function getClientEntry(): IWebpackEntry {
  return {
    [BUILD_CLIENT_RUNTIME_MAIN]: [
      makeEntryRequest(resolvePkgFile('esm/shuvi-app/entry/client'))
    ]
  };
}

function getServerEntry(): IWebpackEntry {
  return {
    [BUILD_SERVER_FILE_SERVER]: [
      makeEntryRequest(resolvePkgFile('esm/shuvi-app/entry/server'))
    ]
  };
}

export {
  getPageMiddleware,
  IHtmlDocument,
  ITemplateData,
  IViewServer,
  IViewClient
} from './lib';

/** This plugin uses `platformContext` so that it is set to a plugin getter */
export const getPlugin = (
  platformContext: IPlatformContext
): ResolvedPlugin => {
  const core = createPlugin({
    configWebpack: (chain, { name }) => {
      const pkgVersion = getVersion();
      if (name === BUNDLER_DEFAULT_TARGET) {
        chain.merge({
          entry: getClientEntry()
        });
        chain.plugin('polyfills').use(CopyFilePlugin, [
          {
            filePath: resolvePkgFile('polyfills/polyfills.js'),
            cacheKey: pkgVersion,
            name: BUILD_CLIENT_RUNTIME_POLYFILLS,
            info: {
              [BUILD_CLIENT_RUNTIME_POLYFILLS_SYMBOL]: 1,
              // This file is already minified
              minimized: true
            }
          }
        ]);
      }
      return chain;
    },
    addExtraTarget: ({ createConfig }, context) => {
      const serverWebpackHelpers = webpackHelpers();
      const serverChain = createConfig({
        name: BUNDLER_TARGET_SERVER,
        node: true,
        entry: getServerEntry(),
        outputDir: BUILD_SERVER_DIR,
        webpackHelpers: serverWebpackHelpers
      });
      return {
        name: BUNDLER_TARGET_SERVER,
        chain: serverChain
      };
    },
    addRuntimeFile: ({ defineFile }, context) => {
      const {
        config: {
          router: { history }
        }
      } = context;
      const routerConfigFile = defineFile({
        name: 'routerConfig.js',
        content: () => {
          return `export const historyMode = "${history}";`;
        }
      });

      return [routerConfigFile];
    },
    addRuntimeService: () => [
      {
        source: resolvePkgFile('esm/shuvi-app/shuvi-runtime-index'),
        exported: '*'
      },
      {
        source: resolvePkgFile('lib/node/shuvi-runtime-server'),
        filepath: 'server.ts',
        exported: '*'
      }
    ],
    addResource: context => generateResource(context),
    afterBuild: async context => {
      await buildHtml({
        context,
        serverPlugins: platformContext.serverPlugins,
        getMiddlewares,
        pathname: '/',
        filename: 'index.html'
      });
    }
  });

  return {
    core,
    server,
    types: resolvePkgFile('lib/node/features/html-render/shuvi-app.d.ts')
  };
};
