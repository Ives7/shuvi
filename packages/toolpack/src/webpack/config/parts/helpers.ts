import { WebpackChain } from '../base';
import { ExternalsFunction, IWebpackHelpers } from '../../types';

export const webpackHelpers = (): IWebpackHelpers => {
  const externalFns: ExternalsFunction[] = [];

  const defaultExternalsFn: ExternalsFunction = (
    { context, request },
    callback
  ) => {
    let callbackCalled = false;
    const nextHandler = (err?: any, result?: any) => {
      if (err) {
        callback(err, undefined);
        callbackCalled = true;
      } else {
        if (result !== 'next') {
          callback(err, result);
          callbackCalled = true;
        }
      }
    };

    for (let i = 0; i < externalFns.length; i++) {
      externalFns[i]({ context, request }, nextHandler);
      if (callbackCalled) {
        break;
      }
    }

    if (!callbackCalled) {
      callback(null, undefined);
    }
  };

  return {
    addExternals: (
      webpackChain: WebpackChain,
      externalFn: ExternalsFunction
    ) => {
      let externals = webpackChain.get('externals');
      if (!externals) {
        externals = defaultExternalsFn;
        webpackChain.externals(externals);
      }

      if (
        typeof externals === 'function' &&
        externals.name === 'defaultExternalsFn'
      ) {
        externalFns.push(externalFn);
        return;
      }

      throw new Error(
        'Externals was modified directly, addExternals will have no effect.'
      );
    }
  };
};

export function shouldUseRelativeAssetPaths(publicPath: string) {
  return publicPath === './';
}

export function splitChunksFilter(chunk: any) {
  const excludes: Record<string, boolean> = {
    // 'static/polyfill': true
  };

  return excludes[chunk.name] !== true;
}

export const commonChunkFilename = ({ dev }: { dev: boolean }) => {
  return `static/common/${dev ? '[name]' : '[name].[contenthash:8]'}.js`;
};
