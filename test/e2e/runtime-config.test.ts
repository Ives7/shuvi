import { AppCtx, Page, devFixture, check } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('SSR: Runtime Config', () => {
  beforeAll(async () => {
    ctx = await devFixture('runtime-config');
  });

  beforeEach(() => {
    // runtimeConfig is stored in modules and this will prevent it to be reset.
    Object.assign(process.env, {
      DISABLE_RESET_MODULES: 'true'
    });
  });
  afterAll(async () => {
    await ctx.close();
  });

  afterEach(async () => {
    await page.close();
  });

  test('should works on server-side and client-sdie', async () => {
    page = await ctx.browser.page(ctx.url('/basic'));

    expect(await page.$text('#server-a')).toBe('a');
    expect(await page.$text('#server-b')).toBe('b');
    await page.waitForSelector('#client-a');
    expect(await page.$text('#client-a')).toBe('a');
  });

  test('should get runtimeConfig on client-side before render', async () => {
    page = await ctx.browser.page(ctx.url('/basic'));
    let error = false;
    try {
      await check(
        async () => await page.$text('#app'),
        v => v === 'a'
      );
    } catch {
      error = true;
    }
    expect(error).toBe(false);
  });

  test('should not access private config on client-side', async () => {
    page = await ctx.browser.page(ctx.url('/no-private'));
    await page.waitForSelector('#no-private');
    expect(await page.$text('#no-private')).toBe('');
  });
});

describe('CSR: Runtime Config', () => {
  beforeAll(async () => {
    ctx = await devFixture('runtime-config', {
      ssr: false,
      router: {
        history: 'browser'
      }
    });
  });
  afterAll(async () => {
    await ctx.close();
  });

  afterEach(async () => {
    await page.close();
  });

  test('should works', async () => {
    page = await ctx.browser.page(ctx.url('/ssr-false'));

    await page.waitForSelector('#a');
    expect(await page.$text('#a')).toBe('a');
    expect(await page.$text('#b')).toBe('b');
  });
});
