<template>
  <div class="s-article-workspace-faqs text-start">
    <section class="sd-modern-widget s-article-workspace-faqs__list">
      <header class="s-article-workspace-faqs__section-heading">
        <div><h2>{{ t('questions') }} <span>{{ items.length }}</span></h2><p>{{ t('help') }}</p></div>
        <v-btn ref="addButton" class="sd-modern-button s-article-workspace-faqs__button" variant="outlined" prepend-icon="add" :disabled="!mayEdit" @click="openEditor()">{{ t('add') }}</v-btn>
      </header>
      <div v-if="!items.length" class="sd-modern-empty-state s-article-workspace-faqs__empty"><v-icon size="24" aria-hidden="true">live_help</v-icon><h3>{{ t('empty_title') }}</h3><p>{{ t('empty_description') }}</p></div>
      <div v-for="(faq, index) in items" :key="index" class="s-article-workspace-faqs__row">
        <span class="s-article-workspace-faqs__order">{{ index + 1 }}</span>
        <div class="s-article-workspace-faqs__copy">
          <h3 dir="auto">{{ faq?.question }}</h3>
          <v-tooltip :disabled="!truncated[index]" location="top" content-class="sd-modern-tooltip text-start" open-on-click>
            <template #activator="{ props }"><p v-bind="props" v-overflow-check="(value) => { truncated[index] = value; }" :tabindex="truncated[index] ? 0 : undefined" class="s-article-workspace-faqs__excerpt" dir="auto">{{ answerText(faq?.answer) }}</p></template>{{ answerText(faq?.answer) }}
          </v-tooltip>
        </div>
        <div class="s-article-workspace-faqs__row-actions">
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="t('edit')" :disabled="!mayEdit" @click="openEditor(index)"><v-icon size="16" aria-hidden="true">edit</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ t('edit') }}</v-tooltip></v-btn>
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="t('delete')" :disabled="!mayEdit" @click="openRemoval(index)"><v-icon size="16" aria-hidden="true">delete_outline</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ t('delete') }}</v-tooltip></v-btn>
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="t('up')" :disabled="!mayEdit || index === 0" @click="move(index, -1)"><v-icon size="16" aria-hidden="true">arrow_upward</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ t('up') }}</v-tooltip></v-btn>
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="t('down')" :disabled="!mayEdit || index === items.length - 1" @click="move(index, 1)"><v-icon size="16" aria-hidden="true">arrow_downward</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ t('down') }}</v-tooltip></v-btn>
        </div>
      </div>
      <p v-if="!editMode" class="s-article-workspace-faqs__readonly">{{ t('read_only') }}</p>
    </section>
    <aside class="s-article-workspace-faqs__preview">
      <h2>{{ t('preview_title') }}</h2><p class="s-article-workspace-faqs__subtitle">{{ t('preview_subtitle') }}</p>
      <div class="sd-modern-widget s-article-workspace-faqs__reader">
        <p class="s-article-workspace-faqs__hint">{{ t('preview_hint') }}</p><h2>{{ t('reader_title') }}</h2>
        <details v-for="(faq, index) in items" :key="index" :open="index === 0"><summary dir="auto">{{ faq?.question }}</summary><div class="s-article-workspace-faqs__answer" dir="auto" v-html="safeAnswer(faq?.answer)"></div></details>
        <p v-if="!items.length" class="s-article-workspace-faqs__subtitle">{{ t('preview_empty') }}</p>
      </div>
    </aside>

    <v-dialog :model-value="dialog_open && active" max-width="720" :content-props="dialog_content_props" scrollable :aria-labelledby="dialog_id" @update:model-value="(open) => !open && requestClose()" @after-leave="restoreFocus">
      <v-card class="sd-modern-widget s-article-workspace-faqs__dialog text-start">
        <header class="s-article-workspace-faqs__dialog-heading"><div><h2 :id="dialog_id">{{ t(mode === 'remove' ? 'delete_title' : editing_index < 0 ? 'dialog_add' : 'dialog_edit') }}</h2><p>{{ t(mode === 'remove' ? 'delete_message' : 'dialog_subtitle') }}</p></div><v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="t('close')" @click="requestClose"><v-icon size="16" aria-hidden="true">close</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ t('close') }}</v-tooltip></v-btn></header>
        <v-card-text class="s-article-workspace-faqs__dialog-body">
          <p v-if="mode === 'remove'" class="s-article-workspace-faqs__remove-question" dir="auto">{{ original_question }}</p>
          <template v-else>
            <v-text-field ref="questionInput" v-model="question" :label="t('question')" variant="underlined" class="sd-modern-underlined-field" dir="auto" :disabled="!mayEdit" :error="invalid && !question.trim()" hide-details persistent-placeholder />
            <div class="s-article-workspace-faqs__format"><v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="t('bold')" :disabled="!mayEdit" @click="formatAnswer('b')"><v-icon size="16" aria-hidden="true">format_bold</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ t('bold') }}</v-tooltip></v-btn><v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="t('italic')" :disabled="!mayEdit" @click="formatAnswer('i')"><v-icon size="16" aria-hidden="true">format_italic</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ t('italic') }}</v-tooltip></v-btn><span>{{ t('html_answer') }}</span></div>
            <v-textarea ref="answerInput" v-model="answer" :label="t('answer')" variant="underlined" class="sd-modern-underlined-field" rows="5" auto-grow dir="auto" :disabled="!mayEdit" :error="invalid && !answerText(answer).trim()" hide-details persistent-placeholder />
            <p class="s-article-workspace-faqs__hint">{{ t('answer_hint') }}</p>
          </template>
          <p v-if="error" class="sd-modern-notice s-article-workspace-faqs__error" role="alert">{{ error }}</p>
        </v-card-text>
        <footer class="s-article-workspace-faqs__dialog-footer"><p>{{ t('apply_hint') }}</p><div class="s-article-workspace-faqs__buttons"><v-btn class="sd-modern-button s-article-workspace-faqs__button" variant="text" @click="requestClose">{{ t('cancel') }}</v-btn><v-btn v-if="mode === 'remove'" class="sd-modern-button sd-modern-button--danger s-article-workspace-faqs__button" color="error" variant="elevated" prepend-icon="delete_outline" :disabled="!mayEdit" @click="removeQuestion">{{ t('remove') }}</v-btn><v-btn v-else class="sd-modern-button s-article-workspace-faqs__button" color="primary" variant="flat" prepend-icon="check" :disabled="!mayEdit" @click="apply">{{ t('apply') }}</v-btn></div></footer>
      </v-card>
    </v-dialog>
    <v-dialog :model-value="discard_open && active" max-width="440" :content-props="dialog_content_props" :aria-labelledby="`${dialog_id}-discard`" @update:model-value="(open) => !open && keepEditing()" @after-leave="focusEditor">
      <v-card class="sd-modern-widget s-article-workspace-faqs__discard text-start"><h2 :id="`${dialog_id}-discard`">{{ t('discard_title') }}</h2><p>{{ t('discard_message') }}</p><div class="s-article-workspace-faqs__buttons"><v-btn class="sd-modern-button s-article-workspace-faqs__button" variant="text" @click="keepEditing">{{ t('keep_editing') }}</v-btn><v-btn class="sd-modern-button s-article-workspace-faqs__button" color="primary" variant="flat" @click="discardChanges">{{ t('discard') }}</v-btn></div></v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { useId } from 'vue';
// Answers remain unchanged in the draft; only this inert, local reader preview is filtered.
export function sanitizeFaqAnswer(value) {
  const html = String(value ?? '');
  if (typeof document === 'undefined') return html.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const template = document.createElement('template'); template.innerHTML = html;
  const allowed = new Set(['p', 'div', 'br', 'b', 'strong', 'i', 'ol', 'ul', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
  const blocked = new Set(['script', 'style', 'iframe', 'object', 'embed', 'template', 'base', 'meta', 'link']);
  for (const element of Array.from(template.content.querySelectorAll('*'))) {
    const tag = element.tagName.toLowerCase();
    if (blocked.has(tag) || element.namespaceURI !== 'http://www.w3.org/1999/xhtml') { element.remove(); continue; }
    if (!allowed.has(tag)) { element.replaceWith(...element.childNodes); continue; }
    const href = tag === 'a' ? element.getAttribute('href') : null;
    for (const attribute of Array.from(element.attributes)) element.removeAttribute(attribute.name);
    if (href && !/[\u0000-\u001f\u007f]/.test(href)) {
      try { const url = new URL(href, document.baseURI); if (['http:', 'https:', 'mailto:'].includes(url.protocol) && !url.username && !url.password) element.setAttribute('href', href); } catch { /* Invalid links remain plain text. */ }
    }
  }
  return template.innerHTML;
}

const overflowCheck = {
  mounted(element, binding) {
    const state = { notify: binding.value, observer: null, measure: null };
    state.measure = () => state.notify(element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1);
    if (typeof ResizeObserver !== 'undefined') { state.observer = new ResizeObserver(state.measure); state.observer.observe(element); }
    element._articleFaqOverflow = state; state.measure();
  },
  updated(element, binding) { const state = element._articleFaqOverflow; if (state) { state.notify = binding.value; state.measure(); } },
  beforeUnmount(element) { element._articleFaqOverflow?.observer?.disconnect(); delete element._articleFaqOverflow; },
};

export default {
  name: 'SArticleWorkspaceFaqs', directives: { overflowCheck }, emits: ['update:modelValue', 'change', 'pending-change'],
  setup() { return { dialog_id: `article-faq-editor-${useId()}` }; },
  props: { modelValue: { type: Array, default: () => [] }, editMode: { type: Boolean, default: true }, disabled: { type: Boolean, default: false }, active: { type: Boolean, default: true } },
  data: () => ({ disposed: false, dialog_open: false, discard_open: false, mode: 'edit', editing_index: -1, question: '', answer: '', original_question: '', original_answer: '', error: '', invalid: false, truncated: {} }),
  computed: {
    items() { return Array.isArray(this.modelValue) ? this.modelValue : []; },
    dialog_content_props() { return this.$vuetify.display.width <= 580 ? { style: { width: 'calc(100% - 16px)', maxWidth: 'calc(100% - 16px)', margin: '8px' } } : undefined; },
    mayEdit() { return this.active && this.editMode && !this.disabled && !this.disposed; },
    pendingDraft() { return this.dialog_open && this.mode === 'edit' && (this.question !== this.original_question || this.answer !== this.original_answer); },
  },
  watch: {
    pendingDraft(value) { this.$emit('pending-change', value); },
    active(value) { if (!value) { this.discard_open = false; this._pendingAction = null; } },
  },
  beforeUnmount() { this.disposed = true; this._pendingAction = null; this.$emit('pending-change', false); },
  methods: {
    t(key) { return this.$t(`global.article.workspace.faq_manager.${key}`); },
    safeAnswer: sanitizeFaqAnswer,
    answerText(value) {
      if (typeof document === 'undefined') return String(value ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;|&#160;/g, ' ');
      const template = document.createElement('template'); template.innerHTML = sanitizeFaqAnswer(value); return template.content.textContent || '';
    },
    transition(action) { if (this.disposed) return; if (this.pendingDraft) { this._pendingAction = action; this.discard_open = true; } else action(); },
    captureTarget(index) {
      this.editing_index = index; this._source = index < 0 ? null : this.items[index];
      this.original_question = String(this._source?.question ?? ''); this.original_answer = String(this._source?.answer ?? '');
      this.question = this.original_question; this.answer = this.original_answer; this.error = ''; this.invalid = false;
      this._returnFocus = typeof document === 'undefined' ? null : document.activeElement;
    },
    openEditor(index = -1) {
      if (!this.mayEdit || !Number.isInteger(index) || index < -1 || index >= this.items.length) return;
      this.transition(() => { if (!this.mayEdit) return; this.captureTarget(index); this.mode = 'edit'; this.dialog_open = true; this.focusEditor(); });
    },
    openRemoval(index) {
      if (!this.mayEdit || !Number.isInteger(index) || index < 0 || index >= this.items.length) return;
      this.transition(() => { if (!this.mayEdit) return; this.captureTarget(index); this.mode = 'remove'; this.dialog_open = true; });
    },
    targetUnchanged() {
      const current = this.items[this.editing_index];
      if (current === this._source && String(current?.question ?? '') === this.original_question && String(current?.answer ?? '') === this.original_answer) return true;
      this.error = this.t('changed_target'); return false;
    },
    apply() {
      if (!this.mayEdit || !this.dialog_open || this.mode !== 'edit') return;
      this.invalid = !this.question.trim() || !this.answerText(this.answer).trim();
      if (this.invalid) { this.error = this.t('required'); this.focusEditor(); return; }
      if (this.editing_index >= 0 && !this.targetUnchanged()) return;
      const next = [...this.items], value = { ...(this.editing_index < 0 ? {} : this.items[this.editing_index]), question: this.question.trim(), answer: this.answer };
      if (this.editing_index < 0) next.push(value); else next.splice(this.editing_index, 1, value);
      const changed = this.editing_index < 0 || value.question !== this.original_question || value.answer !== this.original_answer;
      this.closeEditor(); if (changed) this.publish(next);
    },
    removeQuestion() { if (!this.mayEdit || !this.dialog_open || this.mode !== 'remove' || !this.targetUnchanged()) return; const next = [...this.items]; next.splice(this.editing_index, 1); this.closeEditor(); this.publish(next); },
    move(index, delta) {
      if (!this.mayEdit || this.dialog_open || !Number.isInteger(index) || ![-1, 1].includes(delta) || index < 0 || index >= this.items.length || index + delta < 0 || index + delta >= this.items.length) return;
      const next = [...this.items]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; this.publish(next);
    },
    publish(items) { if (!this.mayEdit) return; this.$emit('update:modelValue', items); this.$emit('change'); },
    formatAnswer(tag) {
      if (!this.mayEdit || !this.dialog_open || this.mode !== 'edit' || !['b', 'i'].includes(tag)) return;
      const input = this.$refs.answerInput?.$el?.querySelector('textarea'), start = input?.selectionStart ?? this.answer.length, end = input?.selectionEnd ?? start;
      this.answer = `${this.answer.slice(0, start)}<${tag}>${this.answer.slice(start, end)}</${tag}>${this.answer.slice(end)}`;
      this.$nextTick(() => { if (!this.active || !this.dialog_open) return; input?.focus(); input?.setSelectionRange(start + tag.length + 2, end + tag.length + 2); });
    },
    requestClose() { this.transition(() => this.closeEditor()); },
    closeEditor() { this.dialog_open = false; this.discard_open = false; this._pendingAction = null; this.question = ''; this.answer = ''; this.error = ''; this.invalid = false; },
    keepEditing() { this.discard_open = false; this._pendingAction = null; },
    discardChanges() { const action = this._pendingAction; this._pendingAction = null; this.discard_open = false; if (this.disposed || !action) return; this.question = this.original_question; this.answer = this.original_answer; action(); },
    focusEditor() { this.$nextTick(() => { if (!this.active || !this.dialog_open || this.mode !== 'edit' || this.discard_open) return; const input = this.invalid && this.question.trim() ? this.$refs.answerInput : this.$refs.questionInput; input?.$el?.querySelector('input, textarea')?.focus(); }); },
    restoreFocus() { if (this.active && !this.dialog_open) this.$nextTick(() => { if (this._returnFocus?.isConnected) this._returnFocus.focus(); else this.$refs.addButton?.$el?.focus(); }); },
  },
};
</script>

<style lang="scss" scoped>
.s-article-workspace-faqs {
  display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 26px; min-width: 0; font-family: inherit; font-size: 13px; line-height: 20px; color: rgb(var(--v-theme-on-surface));
  h2 { margin: 0; font: inherit; font-size: 14px !important; font-weight: 500; line-height: 22px; }
  h2 span { margin-inline-start: 5px; color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; }
  h3 { margin: 0; font: inherit; font-size: 12px !important; font-weight: 500; line-height: 20px; overflow-wrap: anywhere; }
  &__list, &__reader { padding: 24px; border-radius: 18px; min-width: 0; }
  &__section-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-block-end: 22px; }
  &__section-heading p, &__subtitle { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 12px !important; line-height: 19px; }
  &__row { display: flex; align-items: flex-start; gap: 14px; padding-block: 18px; border-block-end: 1px solid var(--sd-modern-border); }
  &__row:last-child { border-block-end: 0; padding-block-end: 0; }
  &__order { flex: 0 0 18px; padding-block-start: 3px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  &__copy { flex: 1; min-width: 0; }
  &__excerpt { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 5px 0 0; white-space: normal; font-size: 12px !important; line-height: 19px; color: var(--sd-modern-muted); overflow-wrap: anywhere; }
  &__row-actions { display: flex; flex: 0 0 72px; max-width: 72px; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
  &__reader { margin-block-start: 14px; }
  &__reader > h2 { margin-block-start: 12px; }
  &__reader details { padding-block: 14px; border-block-end: 1px solid var(--sd-modern-border); }
  &__reader details:last-child { border-block-end: 0; padding-block-end: 0; }
  &__reader summary { cursor: pointer; font-size: 13px; line-height: 21px; font-weight: 500; overflow-wrap: anywhere; }
  &__answer { padding-block-start: 10px; font-size: 13px; line-height: 22px; overflow-wrap: anywhere; }
  &__answer :deep(p), &__answer :deep(div) { margin-block: 0 8px; font-size: inherit !important; line-height: inherit; }
  &__answer :deep(h1), &__answer :deep(h2), &__answer :deep(h3), &__answer :deep(h4), &__answer :deep(h5), &__answer :deep(h6) { margin-block: 10px 6px; font-size: 14px !important; line-height: 22px; font-weight: 500; }
  &__answer :deep(ul), &__answer :deep(ol) { margin-block: 6px; padding-inline-start: 22px; }
  &__hint { margin: 7px 0 0; color: var(--sd-modern-muted); font-size: 11px !important; line-height: 18px; }
  &__empty { padding: 30px 12px; }
  &__empty h3 { margin-block: 10px 5px; }
  &__empty p, &__readonly { color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__readonly { margin: 18px 0 0; }
}
.s-article-workspace-faqs__button { min-height: 36px; height: 36px; padding-inline: 12px; border-radius: 8px; font-family: inherit; font-size: 12px !important; line-height: 20px; font-weight: 500; letter-spacing: 0; text-transform: none; }
.s-article-workspace-faqs .sd-modern-icon-button, .s-article-workspace-faqs__dialog .sd-modern-icon-button { --sd-modern-icon-button-size: 32px; border-radius: 8px; }
.s-article-workspace-faqs__dialog.v-card { padding: 0; border-radius: 18px !important; }
.s-article-workspace-faqs__dialog, .s-article-workspace-faqs__discard {
  font-family: inherit; font-size: 13px; line-height: 20px;
  h2 { margin: 0; font: inherit; font-size: 17px !important; line-height: 25px; font-weight: 500; }
  .s-article-workspace-faqs__dialog-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 22px 24px; border-block-end: 1px solid var(--sd-modern-border); }
  .s-article-workspace-faqs__dialog-heading p { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .s-article-workspace-faqs__dialog-body { padding: 24px !important; font: inherit; }
  .s-article-workspace-faqs__format { display: flex; align-items: center; gap: 8px; margin-block: 22px 8px; }
  .s-article-workspace-faqs__format span, .s-article-workspace-faqs__hint { font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); }
  .s-article-workspace-faqs__hint { margin-block: 7px 0; }
  .s-article-workspace-faqs__error { margin-block: 14px 0; font-size: 12px; line-height: 19px; }
  .s-article-workspace-faqs__remove-question { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
  .s-article-workspace-faqs__dialog-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 24px; border-block-start: 1px solid var(--sd-modern-border); }
  .s-article-workspace-faqs__dialog-footer > p { max-width: 280px; margin: 0; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  .s-article-workspace-faqs__buttons { display: flex; gap: 8px; align-items: center; justify-content: flex-end; flex-wrap: wrap; margin-inline-start: auto; }
  .sd-modern-underlined-field :deep(input), .sd-modern-underlined-field :deep(textarea) { font-family: inherit; font-size: 13px !important; line-height: 20px !important; }
}
.s-article-workspace-faqs__discard { padding: 24px; }
.s-article-workspace-faqs__discard > p { margin-block: 12px 20px; font-size: 13px; line-height: 20px; }
@media (max-width: 760px) { .s-article-workspace-faqs { grid-template-columns: 1fr; } }
@media (max-width: 580px) {
  .s-article-workspace-faqs__list, .s-article-workspace-faqs__reader { padding: 18px; }
  .s-article-workspace-faqs__section-heading { flex-wrap: wrap; }
  .s-article-workspace-faqs__row { flex-wrap: wrap; gap: 8px; }
  .s-article-workspace-faqs__row-actions { flex: 1 0 100%; max-width: none; justify-content: flex-start; padding-inline-start: 26px; }
  .s-article-workspace-faqs__dialog .s-article-workspace-faqs__dialog-heading, .s-article-workspace-faqs__dialog .s-article-workspace-faqs__dialog-body { padding: 20px !important; }
  .s-article-workspace-faqs__dialog .s-article-workspace-faqs__dialog-footer { flex-wrap: wrap; padding: 16px 20px; }
  .s-article-workspace-faqs__dialog .sd-modern-underlined-field :deep(input), .s-article-workspace-faqs__dialog .sd-modern-underlined-field :deep(textarea) { font-size: 16px !important; }
}
@media (max-width: 580px), (pointer: coarse) {
  .s-article-workspace-faqs .sd-modern-icon-button, .s-article-workspace-faqs__dialog .sd-modern-icon-button { --sd-modern-icon-button-size: 44px; }
  .s-article-workspace-faqs__button { min-height: 44px; height: auto; }
}
</style>
