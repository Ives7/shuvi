import * as path from 'path';
import chalk from '@shuvi/utils/lib/chalk';
import fs from 'fs-extra';
import { Error } from '../../error';
import { IPaths } from '../../core/apiTypes';
import { getPkgManager } from '../helper/getPkgManager';
import { TypeScriptModule, TsCompilerOptions } from './types';
import { writeDefaultConfigurations } from './configTypeScript';
import {
  hasTsConfig,
  hasTypescriptFiles,
  checkNecessarytDeps,
  getTsConfig,
  PackageDep
} from './getTypeScriptInfo';

let hasSetup = false;

interface TypeScriptInfo {
  useTypeScript: boolean;
  typeScriptPath?: string;
  tsConfigPath?: string;
  tsCompilerOptions: TsCompilerOptions;
  resolvedBaseUrl?: string;
}

let useTypeScript: boolean;
let typeScriptPath: string | undefined;
let tsConfigPath: string | undefined;
let tsCompilerOptions: TsCompilerOptions;
let resolvedBaseUrl: string | undefined;

function missingPackagesError(dir: string, pkgs: PackageDep[]) {
  const packageManager = getPkgManager(dir);
  const packagesHuman = pkgs
    .map(
      (p, index, { length }) =>
        (index > 0
          ? index === length - 1
            ? length > 2
              ? ', and '
              : ' and '
            : ', '
          : '') + p.pkg
    )
    .join('');
  const packagesCli = pkgs.map(p => p.pkg).join(' ');

  const removalMsg =
    '\n\n' +
    chalk.bold(
      'If you are not trying to use TypeScript, please remove the ' +
        chalk.cyan('tsconfig.json') +
        ' file from your package root (and any TypeScript files in your pages directory).'
    );

  throw Error.Fatal(
    chalk.bold.red(
      `It looks like you're trying to use TypeScript but do not have the required package(s) installed.`
    ) +
      '\n\n' +
      chalk.bold(`Please install ${chalk.bold(packagesHuman)} by running:`) +
      '\n\n' +
      `\t${chalk.bold.cyan(
        (packageManager === 'yarn'
          ? 'yarn add --dev'
          : packageManager === 'pnpm'
          ? 'pnpm install --save-dev'
          : 'npm install --save-dev') +
          ' ' +
          packagesCli
      )}` +
      removalMsg +
      '\n'
  );
}

export function getTypeScriptInfo(): TypeScriptInfo {
  if (!hasSetup) {
    throw Error.Fatal(
      "please call 'setupTypeScript' before calling 'getTypeScriptInfo'"
    );
  }

  return {
    useTypeScript,
    typeScriptPath,
    tsConfigPath,
    tsCompilerOptions,
    resolvedBaseUrl
  };
}

export async function setupTypeScript(paths: IPaths) {
  if (hasSetup) {
    return;
  }

  hasSetup = true;
  const projectDir = paths.rootDir;
  useTypeScript = await hasTypescriptFiles(paths.srcDir);
  tsCompilerOptions = {};
  if (useTypeScript) {
    const deps = checkNecessarytDeps(projectDir);
    if (deps.missing.length > 0) {
      missingPackagesError(projectDir, deps.missing);
    }

    typeScriptPath = deps.resovled.get('typescript');
    tsConfigPath = path.join(projectDir, 'tsconfig.json');
    const needDefaultTsConfig = !(await hasTsConfig(tsConfigPath));
    if (needDefaultTsConfig) {
      console.log(
        chalk.cyan(
          `We detected TypeScript in your project and created a ${chalk.bold(
            'tsconfig.json'
          )} file for you.`
        )
      );
      console.log();
      await fs.writeJson(tsConfigPath, {});
    }
    // @ts-ignore
    const { default: ts } = (await import(typeScriptPath!)) as TypeScriptModule;
    const tsConfig = await getTsConfig(ts, tsConfigPath);
    tsCompilerOptions = tsConfig.options;
    await writeDefaultConfigurations(
      ts,
      tsConfigPath,
      tsConfig,
      paths,
      needDefaultTsConfig
    );
  }

  const jsConfigPath = path.join(projectDir, 'jsconfig.json');
  if (!useTypeScript && (await fs.pathExists(jsConfigPath))) {
    const userJsConfig = await fs.readJSON(jsConfigPath);
    tsCompilerOptions = userJsConfig.compilerOptions;
  }

  if (tsCompilerOptions?.baseUrl) {
    resolvedBaseUrl = path.resolve(projectDir, tsCompilerOptions.baseUrl);
  }
}
