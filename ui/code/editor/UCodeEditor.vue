<template>
  <div class="prism-editor-wrapper" dir="ltr">
    <div v-if="lineNumbers" class="prism-editor__line-numbers" aria-hidden="true">
      <div v-for="line in lineCount" :key="line" class="prism-editor__line-number token comment">
        {{ line }}
      </div>
    </div>
    <div class="prism-editor__container">
      <!-- The feature's Prism highlighter escapes the source before adding token markup. -->
      <pre
        class="prism-editor__editor"
        :aria-hidden="!previewOnly || undefined"
        :aria-label="previewOnly ? ariaLabel : undefined"
        :aria-describedby="previewOnly ? ariaDescribedby : undefined"
        :tabindex="previewOnly ? 0 : undefined"
        v-html="highlighted"
      ></pre>
      <textarea
        v-if="!previewOnly"
        :id="id"
        v-model="text"
        class="prism-editor__textarea"
        :readonly="readonly"
        :maxlength="maxlength"
        :aria-label="ariaLabel"
        :aria-describedby="ariaDescribedby"
        :aria-invalid="ariaInvalid"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        data-gramm="false"
        @blur="emit('blur', $event)"
        @keydown="handleKeydown"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  highlight: (code: string) => string;
  lineNumbers?: boolean;
  readonly?: boolean;
  previewOnly?: boolean;
  ignoreTabKey?: boolean;
  id?: string;
  maxlength?: number;
  ariaLabel?: string;
  ariaDescribedby?: string;
  ariaInvalid?: boolean;
}>();

const model = defineModel<string | null>({ default: "" });
const emit = defineEmits<{ blur: [event: FocusEvent] }>();
const text = computed({
  get: () => (model.value ?? "").replace(/\r\n?/g, "\n"),
  set: (value: string) => {
    if (!props.readonly) model.value = value;
  },
});
const lineCount = computed(() => text.value.split("\n").length);
const highlighted = computed(() =>
  props.highlight(text.value) +
  (!text.value || text.value.endsWith("\n") ? "<br>" : ""),
);
const captureTab = ref(true);
const indent = "  ";
const closers: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
  "`": "`",
};

function handleKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing) return;
  const input = event.currentTarget as HTMLTextAreaElement;
  if (event.key === "Escape") input.blur();
  if (props.readonly) return;

  if (event.ctrlKey && event.key.toLowerCase() === "m" && !props.ignoreTabKey) {
    event.preventDefault();
    captureTab.value = !captureTab.value;
    return;
  }
  if (event.altKey || event.ctrlKey || event.metaKey) return;

  const { value, selectionStart: start, selectionEnd: end } = input;
  if (event.key === "Tab" && !props.ignoreTabKey && captureTab.value) {
    event.preventDefault();
    if (start === end && !event.shiftKey) {
      replaceText(input, start, end, indent);
      return;
    }

    const lineStart = value.slice(0, start).lastIndexOf("\n") + 1;
    const newlineAfterSelection = value.indexOf("\n", end);
    const lineEnd =
      newlineAfterSelection === -1 ? value.length : newlineAfterSelection;
    const selectedLines = value.slice(lineStart, lineEnd);
    const lines = selectedLines.split("\n");
    const updated = lines.map((line) =>
      event.shiftKey ? line.replace(/^(?: {1,2}|\t)/, "") : indent + line,
    );
    const replacement = updated.join("\n");
    if (replacement === selectedLines) return;
    const newStart = Math.max(
      lineStart,
      start + updated[0].length - lines[0].length,
    );
    const newEnd = Math.max(
      newStart,
      end + replacement.length - selectedLines.length,
    );
    replaceText(input, lineStart, lineEnd, replacement, newStart, newEnd);
  } else if (
    event.key === "Backspace" &&
    start === end &&
    value.slice(0, start).endsWith(indent)
  ) {
    event.preventDefault();
    replaceText(input, start - indent.length, end, "");
  } else if (event.key === "Enter" && start === end) {
    const line = value.slice(0, start).split("\n").at(-1);
    const leadingWhitespace = line?.match(/^[ \t]+/)?.[0];
    if (!leadingWhitespace) return;
    event.preventDefault();
    replaceText(input, start, end, "\n" + leadingWhitespace);
  } else if (start !== end && Object.hasOwn(closers, event.key)) {
    event.preventDefault();
    replaceText(
      input, start, end,
      event.key + value.slice(start, end) + closers[event.key],
      start, end + 2,
    );
  }
}

function replaceText(
  input: HTMLTextAreaElement,
  start: number,
  end: number,
  replacement: string,
  selectionStart = start + replacement.length,
  selectionEnd = selectionStart,
) {
  const maxlength = props.maxlength;
  if (
    maxlength !== undefined &&
    input.value.length - (end - start) + replacement.length > maxlength
  ) return;

  input.setSelectionRange(start, end);
  let inputEventFired = false;
  const markInput = () => {
    inputEventFired = true;
  };
  input.addEventListener("input", markInput, { once: true });
  // Keep shortcut edits in the browser's native undo history when insertText is available.
  const owner = input.ownerDocument;
  const command = replacement ? "insertText" : "delete";
  const inserted =
    owner.activeElement === input && owner.execCommand?.(command, false, replacement);
  input.removeEventListener("input", markInput);
  if (!inserted) input.setRangeText(replacement, start, end);
  if (!inserted || !inputEventFired) text.value = input.value;
  input.setSelectionRange(selectionStart, selectionEnd);
}
</script>

<style scoped>
.prism-editor-wrapper {
  display: flex;
  align-items: start;
  width: 100%;
  height: 100%;
  overflow: auto;
  tab-size: 2;
}

/* These hooks also carry the existing light, dark and feature-specific styles. */
.prism-editor__container {
  position: relative;
  width: 100%;
  min-width: 0;
  text-align: left;
}

.prism-editor__line-numbers {
  align-self: stretch;
  flex-shrink: 0;
  min-width: 3ch;
  margin-inline-end: 10px;
  text-align: end;
  user-select: none;
}

.prism-editor__editor,
.prism-editor__textarea {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  text-align: inherit;
  tab-size: inherit;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.prism-editor__editor[aria-hidden="true"] {
  pointer-events: none;
}

.prism-editor__textarea {
  position: absolute;
  inset: 0;
  height: 100%;
  overflow: hidden;
  resize: none;
  color: inherit;
  -webkit-text-fill-color: transparent;
}

@media (forced-colors: active) {
  .prism-editor__textarea { -webkit-text-fill-color: CanvasText; }
  .prism-editor__editor[aria-hidden="true"] { visibility: hidden; }
}
</style>
