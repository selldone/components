import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { parse } from '@vue/compiler-sfc';
import ts from 'typescript';

test('vendor name help follows clipping, resize, updated text and cleanup', () => {
  const source = fs.readFileSync(new URL('./BVendorBox.vue', import.meta.url), 'utf8');
  const { descriptor } = parse(source);
  const script = descriptor.script.content.replace(/^import .*;\r?\n/gm, '').replace('export default', 'const component =');
  let resize;
  let disconnected = false;
  const context = {
    RouteMixin: {}, UAvatarFolder: {},
    ResizeObserver: class {
      constructor(callback) { resize = callback; }
      observe() {}
      disconnect() { disconnected = true; }
    },
  };
  vm.runInNewContext(ts.transpileModule(script + '\nthis.component = component;', { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context);
  const directive = context.component.directives.overflowCheck;
  const states = [];
  const element = { scrollWidth: 80, clientWidth: 100 };
  directive.mounted(element, { value: clipped => states.push(clipped) });
  assert.deepEqual(states, [false]);
  element.scrollWidth = 150;
  resize();
  assert.deepEqual(states, [false, true]);
  element.clientWidth = 180;
  resize();
  assert.equal(states.at(-1), false);
  element.scrollWidth = 220;
  const next = [];
  directive.updated(element, { value: clipped => next.push(clipped) });
  assert.deepEqual(next, [true]);
  directive.beforeUnmount(element);
  assert.equal(disconnected, true);
  assert.equal(element._vendorNameOverflow, undefined);
});
