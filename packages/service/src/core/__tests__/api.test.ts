import { getApi } from '../api';
import { Config } from '..';
import * as path from 'path';
import rimraf from 'rimraf';
import { readFileSync } from 'fs';
import { resolveFxiture } from './utils';

test('should has "production" be default mode', async () => {
  const prodApi = await getApi({
    cwd: resolveFxiture('basic')
  });
  expect(prodApi.mode).toBe('production');
});

describe('plugins', () => {
  test('should work', async () => {
    let context: any;
    await getApi({
      cwd: resolveFxiture('basic'),
      plugins: [
        {
          afterInit: cliContext => {
            context = cliContext;
          }
        }
      ],
      config: {}
    });
    expect(context!).toBeDefined();
    expect(context!.paths).toBeDefined();
  });

  test('should access config and paths', async () => {
    let config: Config;

    const api = await getApi({
      cwd: resolveFxiture('dotenv'),
      config: {
        publicPath: '/test'
      },
      plugins: [
        {
          afterInit: api => {
            config = api.config;
          }
        }
      ]
    });
    expect(config!.publicPath).toBe('/test');
    expect(api.cwd).toBe(path.join(__dirname, 'fixtures', 'dotenv'));
  });
});

test('add App files, add App services', async () => {
  const shuviDir = path.join(__dirname, 'fixtures', 'rootDir', '.shuvi');
  rimraf.sync(shuviDir);
  function resolveBuildFile(...paths: string[]) {
    return path.join(shuviDir, ...paths);
  }
  type TestRule = [string, string | RegExp];
  function checkMatch(tests: TestRule[]) {
    tests.forEach(([file, expected]) => {
      if (typeof expected === 'string') {
        expect(readFileSync(resolveBuildFile(file), 'utf8')).toBe(expected);
      } else {
        expect(readFileSync(resolveBuildFile(file), 'utf8')).toMatch(expected);
      }
    });
  }
  const api = await getApi({
    cwd: path.join(__dirname, 'fixtures', 'rootDir'),
    plugins: [
      {
        addRuntimeFile: () => [
          {
            id: 'fileA.js',
            name: 'fileA.js',
            content: () => 'test.js'
          },
          {
            id: 'fileB.js',
            name: '../fileB.js',
            content: () => 'test.js'
          },
          {
            id: 'fileC.js',
            name: '/fileC.js',
            content: () => 'test.js'
          }
        ],
        addRuntimeService: () => ({
          source: 'source',
          exported: 'exported',
          filepath: 'a.js'
        })
      }
    ]
  });
  await api.buildApp();
  checkMatch([
    ['app/files/fileA.js', 'test.js'],
    ['app/files/fileC.js', 'test.js'],
    ['app/files/fileC.js', 'test.js'],
    ['app/runtime/a.js', 'export exported from "source"']
  ]);
  await api.destory();
  rimraf.sync(shuviDir);
});
