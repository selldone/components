import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';
import * as Vue from 'vue';
import numeral from 'numeral';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import { parse, compileTemplate, compileStyleAsync } from '@vue/compiler-sfc';

const chartFile = new URL('./BProductFileStorageChart.vue', import.meta.url);
const donutFile = new URL('../../../../../ui/chart/donut-leader/UChartDonutLeader.vue', import.meta.url);
const paletteFile = new URL('../../../../../ui/chart/donut-leader/donutSlices.ts', import.meta.url);
const transpile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const palette = { exports: {} };
vm.runInNewContext(transpile(readFileSync(paletteFile, 'utf8')), palette);

function load(file) {
  const filename = fileURLToPath(file);
  const { descriptor, errors } = parse(readFileSync(file, 'utf8'), { filename });
  assert.deepEqual(errors, []);
  const compiled = compileTemplate({ source: descriptor.template.content, filename, id: 'file-storage-test', compilerOptions: { hoistStatic: false } });
  assert.deepEqual(compiled.errors, []);
  const context = { exports: {}, Intl, Function, console, require(name) {
    if (name === 'vue') return Vue;
    if (name === 'numeral') return { default: numeral };
    if (name.endsWith('donutSlices')) return palette.exports;
    if (name.endsWith('UChartDonutLeader.vue')) return { default: load(donutFile).component };
    throw new Error(`Unexpected chart dependency: ${name}`);
  } };
  vm.runInNewContext(transpile(descriptor.script.content + '\n' + compiled.code), context);
  return { component: { ...context.exports.default, render: context.exports.render }, descriptor };
}

const translations = {
  'product_file.modern.product_storage': 'Product files storage',
  'product_file.modern.product_storage_help': 'File sizes for this product only.',
  'product_file.modern.other_formats': 'Other formats',
  'product_file.modern.more_files': '{count} more files',
  'product_file.modern.no_stored_files': 'No stored files yet.',
  'product_file.modern.unknown_format': 'Unknown format',
};
const translate = (key, values = {}) => (translations[key] || key).replace(/\{(\w+)\}/g, (_, name) => values[name]);
const plain = value => JSON.parse(JSON.stringify(value));
function state(files) {
  const options = load(chartFile).component;
  const value = { files, $t: translate, ...options.data?.() };
  for (const [key, method] of Object.entries(options.methods)) value[key] = method.bind(value);
  for (const [key, getter] of Object.entries(options.computed)) Object.defineProperty(value, key, { get: () => getter.call(value) });
  return value;
}
const file = (id, size, patch = {}) => ({ id, name: `file-${id}.pdf`, size, ...patch });

test('file storage uses exact product KB values without mutating file data or order', () => {
  const files = [file(1, 2.75), file(2, 100), file(3, 50, { sample: true })];
  const before = JSON.stringify(files);
  const chart = state(files);
  assert.equal(chart.total, 152750);
  assert.deepEqual(Array.from(chart.storedFiles, value => value.key), ['file-2', 'file-3', 'file-1']);
  assert.equal(chart.slices.reduce((sum, slice) => sum + slice.value, 0), chart.total);
  assert.equal(chart.slices.length, 1);
  assert.equal(chart.slices[0].label, 'PDF');
  assert.equal(chart.formatBytes(chart.total), numeral(152750).format('0.[0] b'));
  assert.equal(JSON.stringify(files), before);
});

const formats = ['png', 'jpg', 'pdf', 'mp3', 'mp4', 'zip', 'svg', 'csv', 'docx', 'xlsx', 'wav', 'txt'];
const distinctFormats = () => formats.map((format, index) => file(index, 100 - index, { name: `file-${index}.${format}` }));

test('case-insensitive extensions combine file bytes into format groups', () => {
  const files = [file(1, 25, { name: 'cover.PNG' }), file(2, 15, { name: 'thumb.png' }), file(3, 10, { name: 'guide.pdf' }), file(4, 2, { name: 'README' }), file(5, 1, { name: 'trailing.' })];
  const chart = state(files);
  assert.deepEqual(Array.from(chart.formatGroups, group => [group.label, group.value]), [['PNG', 40000], ['PDF', 10000], ['Unknown format', 3000]]);
  assert.deepEqual(Array.from(chart.formatGroups[0].members, member => member.label), ['cover.PNG', 'thumb.png']);
  assert.equal(chart.slices.reduce((sum, slice) => sum + slice.value, 0), 53000);
});

test('at most five large formats stay separate and the remainder retains exact file members', () => {
  const chart = state(distinctFormats());
  assert.equal(chart.slices.length, 6);
  const rest = chart.slices.at(-1);
  assert.equal(rest.key, 'other-formats');
  assert.equal(rest.members.length, 7);
  assert.equal(rest.value, rest.members.reduce((sum, item) => sum + item.value, 0));
  assert.deepEqual(Array.from(rest.members, value => value.label), formats.slice(5).map((format, index) => `file-${index + 5}.${format}`));
  assert.equal(chart.slices.reduce((sum, slice) => sum + slice.value, 0), chart.total);
});

test('up to six formats keep their own identity even when their byte share is tiny', () => {
  const png = size => file(1, size, { name: 'cover.png' });
  const pdf = size => file(2, size, { name: 'guide.pdf' });
  const grouped = state([png(970), pdf(20), file(3, 10, { name: 'photo.jpg' })]);
  assert.equal(grouped.slices.length, 3);
  assert.deepEqual(Array.from(grouped.slices, slice => slice.label), ['PNG', 'PDF', 'JPG']);
  assert.equal(grouped.slices[1].value, 20000);
  assert.equal(state([png(99), pdf(1)]).slices.length, 2);
  assert.equal(state([png(99), pdf(1)]).slices.some(slice => slice.key === 'other-formats'), false);
  assert.equal(state(distinctFormats().slice(0, 6)).slices.length, 6);
  assert.equal(state([png(97), pdf(3)]).slices[1].key, 'format-PDF', 'the three-percent boundary remains individual');
});

test('empty, invalid and pending files never fabricate stored bytes or slices', () => {
  const chart = state([null, file(1, 0), file(2, -1), file(3, null), file(4, '10'), file(5, NaN), file(6, Infinity), file(7, Number.MAX_VALUE), file(8, 25, { uploading: true })]);
  assert.equal(chart.total, 0);
  assert.deepEqual(plain(chart.slices), []);
  assert.equal(state([]).total, 0);
  chart.files.push(file(9, 25, { uploading: false }));
  assert.equal(chart.total, 25000);
  assert.equal(chart.slices.length, 1);
});

const node = (type, text = '') => ({ type, text, props: {}, children: [], parent: null });
const renderer = Vue.createRenderer({
  createElement: type => node(type), createText: value => node('text', value), createComment: value => node('comment', value),
  insert(child, parent, anchor = null) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    parent.children.splice(anchor ? parent.children.indexOf(anchor) : parent.children.length, 0, child); child.parent = parent;
  },
  remove(child) { if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); },
  setText(child, value) { child.text = value; }, setElementText(child, value) { child.text = value; child.children = []; },
  patchProp(child, key, previous, next) { child.props[key] = next; }, parentNode: child => child.parent,
  nextSibling: child => child.parent?.children[child.parent.children.indexOf(child) + 1] || null,
});
const findAll = (root, predicate) => [...(predicate(root) ? [root] : []), ...root.children.flatMap(child => findAll(child, predicate))];
const text = root => root.text + root.children.map(text).join('');
const emit = (target, name, key) => {
  for (const handler of [target.props[name]].flat()) handler({ key, target, currentTarget: target, stopPropagation() {}, preventDefault() {} });
};
async function mount(t, filename, props, slots) {
  const options = load(filename).component;
  let instance;
  const errors = [], warnings = [];
  const component = { ...options, render(...args) { instance = this; return options.render.apply(this, args); } };
  const app = renderer.createApp({ render: () => Vue.h(component, props, slots) });
  app.config.globalProperties.$t = translate;
  app.config.errorHandler = error => errors.push(error);
  app.config.warnHandler = warning => warnings.push(warning);
  app.component('VTooltip', { name: 'VTooltip', props: ['modelValue'], setup: (props, { attrs, slots }) => () => Vue.h('tooltip', { ...attrs, modelValue: props.modelValue }, [slots.activator?.({ props: { 'aria-describedby': 'fixture-tip' } }), slots.default?.()]) });
  const root = node('root'); app.mount(root); await Vue.nextTick();
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  t.after(() => { app.unmount(); assert.deepEqual(errors, []); assert.deepEqual(warnings, []); });
  return { root, get instance() { return instance; }, all: predicate => findAll(root, predicate) };
}

test('default shared donut preserves native SVG titles without new interaction controls', async t => {
  const f = await mount(t, donutFile, { slices: [{ key: 'one', label: 'Original', value: 5, color: '#2a78d6' }], format: value => `${value} bytes` });
  assert.equal(f.all(value => value.type === 'svg')[0].props.role, 'img');
  assert.equal(f.all(value => value.type === 'tooltip').length, 0);
  assert.equal(f.all(value => value.type === 'foreignObject').length, 0);
  assert.equal(f.all(value => value.type === 'title').length, 1);
  assert.match(text(f.all(value => value.type === 'title')[0]), /Original · 100% · 5 bytes/);
  assert.equal(f.all(value => value.props.tabindex != null).length, 0);
});

test('a positive slice below the rounded precision never claims a zero-percent share', async t => {
  const f = await mount(t, donutFile, { slices: [
    { key: 'large', label: 'Large', value: 999999, color: '#2a78d6' },
    { key: 'tiny', label: 'Tiny', value: 1, color: '#eb6834' },
  ], labels: 2, minLabelShare: 0 });
  assert.equal(f.instance.arcs[0].percent, '100%');
  assert.equal(f.instance.arcs[1].percent, '<0.1%');
  assert.match(text(f.all(value => value.type === 'title')[1]), /Tiny · <0\.1%/);
  assert.ok(f.all(value => value.type === 'text').some(value => text(value) === '<0.1%'));
});

test('shared tooltip slot receives the actual slice and supports tap and Escape without toggling on focus', async t => {
  let received;
  const f = await mount(t, donutFile, { slices: [{ key: 'one', label: 'First', value: 5, color: '#2a78d6', members: [{ label: 'one.pdf' }] }] }, { tooltip: ({ slice }) => { received = slice; return Vue.h('span', slice.label); } });
  assert.equal(f.all(value => value.type === 'svg')[0].props.role, 'group');
  const arc = f.all(value => value.type === 'circle' && value.props.tabindex === '0')[0];
  assert.ok(arc);
  assert.equal(received.members[0].label, 'one.pdf');
  const tooltip = f.all(value => value.type === 'tooltip')[0];
  assert.equal(tooltip.props['open-on-focus'], true);
  assert.equal(tooltip.props['open-on-click'], false);
  assert.equal(tooltip.props['content-class'], 'sd-modern-tooltip text-start');
  emit(arc, 'onClick'); await Vue.nextTick();
  assert.equal(f.instance.tooltipKey, 'one');
  emit(arc, 'onKeydown', 'Escape'); await Vue.nextTick();
  assert.equal(f.instance.tooltipKey, null);
  emit(arc, 'onKeydown', 'Enter'); await Vue.nextTick();
  assert.equal(f.instance.tooltipKey, 'one');
});

test('every format gets a leader callout and exact-value tooltip without a duplicate filename legend', async t => {
  const f = await mount(t, chartFile, { files: distinctFormats() });
  assert.equal(f.all(value => value.type === 'button').length, 0);
  assert.equal(f.all(value => value.type === 'h3').length, 0);
  assert.equal(f.all(value => value.type === 'svg')[0].props.viewBox, '0 0 360 180');
  assert.equal(f.all(value => value.type === 'polyline').length, 6);
  assert.equal(f.all(value => value.type === 'circle' && value.props.tabindex === '0').length, 6);
  assert.match(text(f.all(value => value.type === 'figcaption')[0]), /File sizes for this product only/);
  const tooltipBodies = f.all(value => value.props.class === 'b-product-file-storage-tooltip text-start');
  const grouped = tooltipBodies.filter(value => text(value).includes('Other formats'));
  assert.equal(grouped.length, 1);
  for (const body of grouped) {
    assert.equal(findAll(body, value => value.type === 'li').length, 5);
    assert.match(text(body), /2 more files/);
  }
  const png = tooltipBodies.find(value => text(value).startsWith('PNG'));
  assert.ok(png);
  assert.match(text(png), new RegExp(numeral(100000).format('0.[0] b').replace('.', '\\.')));
  assert.match(text(png), /file-0\.png/);
});

test('empty product renders honest guidance without a donut or zero-valued samples', async t => {
  const f = await mount(t, chartFile, { files: [] });
  assert.match(text(f.root), /No stored files yet/);
  assert.equal(f.all(value => value.type === 'svg').length, 0);
  assert.equal(f.all(value => value.type === 'button').length, 0);
});

test('six uneven formats retain every callout and left-to-right numbers in an RTL card', async t => {
  const files = formats.slice(0, 6).map((format, index) => file(index, index === 0 ? 100000 : 1, { name: `file-${index}.${format}` }));
  const f = await mount(t, chartFile, { files, dir: 'rtl' });
  assert.equal(f.all(value => value.type === 'figure')[0].props.dir, 'rtl');
  assert.equal(f.all(value => value.type === 'svg')[0].props.dir, 'ltr');
  assert.deepEqual(f.all(value => value.props.class === 'b-donut__label').map(text).sort(), formats.slice(0, 6).map(format => format.toUpperCase()).sort());
  assert.equal(f.all(value => value.type === 'polyline').length, 6);
  assert.equal(f.all(value => value.props.class === 'b-donut__value' && text(value) === '<0.1%').length, 5);
  assert.equal(text(f.all(value => value.props.class === 'b-donut__total')[0]), numeral(100005000).format('0.[0] b'));
});

test('SVG activators keep teleported tooltip markup in the HTML namespace with real DOM keyboard events', async () => {
  const dom = new JSDOM('<main id="fixture"></main>');
  const document = dom.window.document;
  const previousSVGElement = globalThis.SVGElement;
  globalThis.SVGElement = dom.window.SVGElement;
  const htmlNamespace = 'http://www.w3.org/1999/xhtml';
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const domRenderer = Vue.createRenderer({
    createElement: (tag, namespace) => namespace === 'svg' ? document.createElementNS(svgNamespace, tag) : document.createElement(tag),
    createText: text => document.createTextNode(text), createComment: text => document.createComment(text),
    setText: (element, text) => { element.nodeValue = text; }, setElementText: (element, text) => { element.textContent = text; },
    parentNode: element => element.parentNode, nextSibling: element => element.nextSibling,
    insert: (element, parent, anchor = null) => parent.insertBefore(element, anchor), remove: element => element.remove(),
    querySelector: selector => document.querySelector(selector),
    patchProp(element, key, previous, next) {
      if (/^on[A-Z]/.test(key)) {
        const event = key.slice(2).toLowerCase();
        for (const callback of [previous].flat().filter(Boolean)) element.removeEventListener(event, callback);
        for (const callback of [next].flat().filter(Boolean)) element.addEventListener(event, callback);
      } else if (next == null || next === false) element.removeAttribute(key);
      else element.setAttribute(key, String(next));
    },
  });
  const chart = Vue.ref();
  const errors = [], warnings = [];
  const component = load(donutFile).component;
  const app = domRenderer.createApp({ render: () => Vue.h(component, {
    ref: chart, slices: [{ key: 'pdf', label: 'PDF', value: 10, color: '#2a78d6' }],
  }, { tooltip: ({ slice }) => Vue.h('span', `${slice.label} exact details`) }) });
  // Keep the real Vue Teleport/DOM boundary; Vuetify's CSS/layout remains browser-owned.
  app.component('VTooltip', {
    props: ['activator', 'modelValue', 'openOnFocus', 'openOnClick', 'interactive', 'location', 'contentClass'], emits: ['update:modelValue'],
    setup(props, { emit, slots }) {
      const open = () => emit('update:modelValue', true);
      let activator;
      Vue.onMounted(() => { activator = document.querySelector(props.activator); if (props.openOnFocus) activator.addEventListener('focus', open); });
      Vue.onBeforeUnmount(() => activator?.removeEventListener('focus', open));
      return () => Vue.h(Vue.Teleport, { to: document.body }, Vue.h('div', { 'data-tooltip-open': String(props.modelValue) }, slots.default?.()));
    },
  });
  app.config.errorHandler = error => errors.push(error);
  app.config.warnHandler = warning => warnings.push(warning);
  try {
    app.mount(document.getElementById('fixture')); await Vue.nextTick();
    const svg = document.querySelector('svg');
    const arc = document.querySelector('.b-donut__arc--help');
    const tooltip = document.querySelector('[data-tooltip-open]');
    assert.equal(svg.namespaceURI, svgNamespace);
    assert.equal(arc.namespaceURI, svgNamespace);
    assert.equal(tooltip.namespaceURI, htmlNamespace);
    assert.equal(tooltip.firstElementChild.namespaceURI, htmlNamespace);
    assert.equal(document.querySelector('foreignObject > div').namespaceURI, htmlNamespace);
    assert.match(tooltip.textContent, /PDF exact details/);
    arc.dispatchEvent(new dom.window.FocusEvent('focus')); await Vue.nextTick();
    assert.equal(tooltip.getAttribute('data-tooltip-open'), 'true');
    arc.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await Vue.nextTick();
    assert.equal(tooltip.getAttribute('data-tooltip-open'), 'false');
    arc.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await Vue.nextTick();
    assert.equal(tooltip.getAttribute('data-tooltip-open'), 'true');
    assert.equal(chart.value.tooltipKey, 'pdf');
  } finally {
    app.unmount();
    globalThis.SVGElement = previousSVGElement;
    dom.window.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('real shared and feature templates and scoped Sass compile', async () => {
  for (const filename of [chartFile, donutFile]) {
    const { descriptor } = load(filename);
    for (const style of descriptor.styles) {
      const result = await compileStyleAsync({ source: style.content, filename: fileURLToPath(filename), id: 'file-storage-test', scoped: style.scoped, preprocessLang: style.lang });
      assert.deepEqual(result.errors, []);
    }
  }
});
