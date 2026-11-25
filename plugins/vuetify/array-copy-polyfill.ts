/*
 * Copyright (c) 2026. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 */

/**
 * Vuetify 4 (through `@vuetify/v0`) calls the ES2023 copy methods
 * `Array#toSorted` and `Array#toReversed` while creating the display service.
 * The apps still target Chrome 107 and Firefox 104, which lack them, so the
 * whole app crashed on start there. Add only these two, before `createVuetify()`.
 */
const copies: Record<
  string,
  (this: ArrayLike<unknown>, ...args: any[]) => unknown[]
> = {
  toSorted(compare?: (a: unknown, b: unknown) => number) {
    return Array.from(this).sort(compare);
  },
  toReversed() {
    return Array.from(this).reverse();
  },
};

for (const [name, copy] of Object.entries(copies)) {
  if (!(name in Array.prototype)) {
    Object.defineProperty(Array.prototype, name, {
      value: copy,
      writable: true,
      configurable: true,
    });
  }
}

export {};
