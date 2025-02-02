import { ReactiveEffect } from '@vue/reactivity';
import {
  FileOptions,
  FileInternalInstance,
  FilePublicInstance,
  FileInternalContentFunction
} from './fileTypes';
import { EMPTY_OBJ, extend, hasOwn, isObject } from '@shuvi/utils';
import { injectHook } from './lifecycle';
import { queueJob } from './scheduler';

export * from './fileTypes';

const AccessTypes = {
  SETUP: 0,
  PROPS: 1,
  CONTEXT: 2,
  OTHER: 3,
  LISTENERS: 4
};

export let currentInstance: FileInternalInstance | null = null;

export const getCurrentInstance: () => FileInternalInstance | null = () =>
  currentInstance;

export const setCurrentInstance = (instance: FileInternalInstance | null) => {
  currentInstance = instance;
};

// record effects created during a component's setup() so that they can be
// stopped when the component unmounts
export function recordInstanceBoundEffect(effect: ReactiveEffect) {
  if (currentInstance) {
    (currentInstance.effects || (currentInstance.effects = [])).push(effect);
  }
}

type PublicPropertiesMap = Record<string, (i: FileInternalInstance) => any>;

const publicPropertiesMap: PublicPropertiesMap = extend(Object.create(null), {
  $setup: i => i.setupState,
  $forceUpdate: i => () => queueJob(i.update)
} as PublicPropertiesMap);

interface ComponentRenderContext {
  [key: string]: any;
  _: FileInternalInstance;
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }: ComponentRenderContext, key: string) {
    const { ctx, setupState, accessCache } = instance;

    // let @vue/reactivity know it should never observe Vue public instances.
    if (key === '__v_skip' /* ReactiveFlags.SKIP */) {
      return true;
    }

    const publicGetter = publicPropertiesMap[key];
    // public $xxx properties
    if (publicGetter) {
      return publicGetter(instance);
    }

    // data / props / ctx
    // This getter gets called for every property access on the render context
    // during render and is a major hotspot. The most expensive part of this
    // is the multiple hasOwn() calls. It's much faster to do a simple property
    // access on a plain object, so we use an accessCache object (with null
    // prototype) to memoize what access type a key corresponds to.
    if (key[0] !== '$') {
      const n = accessCache![key];
      if (n !== undefined) {
        switch (n) {
          case AccessTypes.SETUP:
            return setupState[key];
          case AccessTypes.CONTEXT:
            return ctx[key];
          // default: just fallthrough
        }
      } else if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
        accessCache![key] = AccessTypes.SETUP;
        return setupState[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache![key] = AccessTypes.CONTEXT;
        return ctx[key];
      }
    }

    if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      // user may set custom properties to `this` that start with `$`
      accessCache![key] = AccessTypes.CONTEXT;
      return ctx[key];
    }
  },

  set(
    { _: instance }: ComponentRenderContext,
    key: string,
    value: any
  ): boolean {
    const { setupState, ctx } = instance;
    if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
      setupState[key] = value;
    }

    if (key[0] === '$' && key.slice(1) in instance) {
      return false;
    } else {
      ctx[key] = value;
    }
    return true;
  },

  has(
    { _: { setupState, accessCache, ctx } }: ComponentRenderContext,
    key: string
  ) {
    return (
      accessCache![key] !== undefined ||
      (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) ||
      hasOwn(ctx, key) ||
      hasOwn(publicPropertiesMap, key)
    );
  }
};

export function createFileInstance(options: FileOptions): FileInternalInstance {
  const instance: FileInternalInstance = {
    type: options,
    id: options.id,
    name: options.name,

    content: options.content as FileInternalContentFunction,
    fileContent: '',
    update: null!, // will be set synchronously right after creation
    destroy: null!, // will be set synchronously right after creation
    proxy: null,
    accessCache: {},

    // state
    ctx: EMPTY_OBJ,
    setupState: EMPTY_OBJ,

    // lifecycle
    isMounted: false,
    isUnmounted: false,
    mounted: [],
    unmounted: []
  };

  instance.ctx = { _: instance };
  instance.proxy = new Proxy(
    instance.ctx,
    PublicInstanceProxyHandlers
  ) as FilePublicInstance;

  const { setup } = options;

  currentInstance = instance;
  if (setup) {
    const setupResult = setup();
    if (isObject(setupResult)) {
      instance.setupState = setupResult;
    }
  }
  applyOptions(instance, options);
  currentInstance = null;

  return instance;
}

function applyOptions(instance: FileInternalInstance, options: FileOptions) {
  const publicThis = instance.proxy!;
  const {
    methods: methodsOptions,

    // lifecycle
    mounted,
    unmounted
  } = options;
  const ctx = instance.ctx;
  if (methodsOptions) {
    const publicThis = instance.proxy;
    for (const key in methodsOptions) {
      // todo: check duplicated
      ctx[key] = methodsOptions[key].bind(publicThis);
    }
  }

  if (mounted) {
    injectHook('mounted', mounted.bind(publicThis));
  }
  if (unmounted) {
    injectHook('unmounted', unmounted.bind(publicThis));
  }
}
