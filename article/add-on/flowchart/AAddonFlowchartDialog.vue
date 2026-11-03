<template>
  <v-dialog
    :model-value="modelValue && available"
    max-width="1180"
    scrollable
    :aria-labelledby="`${uid}-title`"
    @update:model-value="$emit('update:modelValue', $event)"
    @after-enter="labelEditor"
  >
    <v-card class="a-article-flowchart-dialog text-start" rounded="xl">
      <v-card-title class="a-article-flowchart-dialog__heading">
        <h2 :id="`${uid}-title`">
          {{
            $t(
              definition === null
                ? "global.article.flowchart.insert"
                : "global.article.flowchart.edit",
            )
          }}
        </h2>
        <v-btn
          class="a-article-flowchart-dialog__close"
          icon
          variant="text"
          :aria-label="$t('global.actions.close')"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon size="18" aria-hidden="true">close</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.actions.close") }}</v-tooltip
          >
        </v-btn>
      </v-card-title>
      <v-card-text class="a-article-flowchart-dialog__body">
        <div class="a-article-flowchart-dialog__intro">
          <p :id="`${uid}-hint`">
            {{ $t("global.article.flowchart.editor_hint") }}
          </p>
          <v-btn
            variant="text"
            prepend-icon="auto_awesome"
            :disabled="!available"
            :loading="copyState === 'copying'"
            @click="copyPrompt"
            >{{ $t("global.article.flowchart.copy_ai_prompt") }}</v-btn
          >
          <p
            v-if="copyState === 'copied' || copyState === 'failed'"
            class="a-article-flowchart-dialog__copy-status"
            role="status"
          >
            {{
              $t(
                copyState === "copied"
                  ? "global.article.flowchart.prompt_copied"
                  : "global.article.flowchart.copy_failed",
              )
            }}
          </p>
        </div>
        <div class="a-article-flowchart-dialog__grid">
          <section class="a-article-flowchart-dialog__definition">
            <label
              :for="`${uid}-code`"
              class="a-article-flowchart-dialog__label"
              >{{ $t("global.article.flowchart.definition") }}</label
            >
            <prism-editor
              ref="definitionEditor"
              v-model="code"
              :highlight="highlight"
              :readonly="!available"
              ignore-tab-key
              line-numbers
              class="a-article-flowchart-dialog__code"
              dir="ltr"
            />
            <p
              v-if="!parsed"
              :id="`${uid}-error`"
              class="a-article-flowchart-dialog__error"
              role="status"
            >
              {{ $t("global.article.flowchart.invalid") }}
            </p>
          </section>
          <section
            class="a-article-flowchart-dialog__preview"
            :aria-label="$t('global.article.flowchart.preview')"
          >
            <p class="a-article-flowchart-dialog__label">
              {{ $t("global.article.flowchart.preview") }}
            </p>
            <s-article-flow
              v-if="parsed"
              :block="parsed"
              :legend-labels="legendLabels"
              show-text-version
            />
            <p v-else class="a-article-flowchart-dialog__empty">
              {{ $t("global.article.flowchart.preview_empty") }}
            </p>
          </section>
        </div>
      </v-card-text>
      <v-card-actions class="a-article-flowchart-dialog__actions">
        <v-btn variant="text" @click="$emit('update:modelValue', false)">{{
          $t("global.actions.cancel")
        }}</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="check"
          :disabled="!available || !parsed"
          @click="submit"
          >{{ $t("global.actions.apply") }}</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Prism from "prismjs";
import "prismjs/components/prism-json";
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";
import SArticleFlow from "./SArticleFlow.vue";
import {
  ARTICLE_FLOWCHART_SCHEMA,
  MAX_FLOWCHART_BYTES,
  canUseArticleFlowchart,
  createArticleFlowchart,
  parseArticleFlowchart,
} from "./article-flowchart";

let instances = 0;

export default {
  name: "AAddonFlowchartDialog",
  components: { PrismEditor, SArticleFlow },
  props: {
    modelValue: { type: Boolean, default: false },
    definition: { type: [Object, String], default: null },
    articleType: { type: String, default: "" },
    active: { type: Boolean, default: false },
  },
  emits: ["update:modelValue", "apply"],
  data: () => ({
    uid: `article-flowchart-dialog-${++instances}`,
    code: "",
    copyState: "",
    copyGeneration: 0,
  }),
  computed: {
    available() {
      return this.active && canUseArticleFlowchart(this.articleType);
    },
    parsed() {
      return parseArticleFlowchart(this.code);
    },
    legendLabels() {
      return {
        data: this.$t("global.article.flowchart.legend_in_flight"),
        error: this.$t("global.article.flowchart.legend_error"),
        warning: this.$t("global.article.flowchart.legend_warning"),
        success: this.$t("global.article.flowchart.legend_success"),
      };
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(open) {
        if (open && this.available) this.resetDefinition();
        else {
          this.code = "";
          this.resetCopy();
        }
      },
    },
    definition() {
      if (this.modelValue && this.available) this.resetDefinition();
    },
    available(value) {
      if (!value && this.modelValue) {
        this.code = "";
        this.resetCopy();
        this.$emit("update:modelValue", false);
      } else if (value && this.modelValue) this.resetDefinition();
    },
    parsed() {
      this.$nextTick(() => this.labelEditor());
    },
  },
  beforeUnmount() {
    this.copyGeneration++;
  },
  methods: {
    resetCopy() {
      this.copyGeneration++;
      this.copyState = "";
    },
    resetDefinition() {
      this.resetCopy();
      const flow =
        this.definition === null
          ? createArticleFlowchart()
          : parseArticleFlowchart(this.definition);
      // Keep an invalid existing definition available to repair; never replace it with a fabricated valid flow.
      this.code = flow
        ? JSON.stringify(flow, null, 2)
        : typeof this.definition === "string"
          ? this.definition
          : JSON.stringify(this.definition, null, 2) || "";
      this.$nextTick(() => this.labelEditor());
    },
    highlight(code: string) {
      return Prism.highlight(
        code.slice(0, MAX_FLOWCHART_BYTES),
        Prism.languages.json,
        "json",
      );
    },
    labelEditor() {
      const textarea =
        this.$refs.definitionEditor?.$el.querySelector("textarea");
      if (!textarea) return;
      textarea.id = `${this.uid}-code`;
      textarea.maxLength = MAX_FLOWCHART_BYTES;
      textarea.setAttribute(
        "aria-describedby",
        `${this.uid}-hint${this.parsed ? "" : ` ${this.uid}-error`}`,
      );
      textarea.setAttribute("aria-invalid", String(!this.parsed));
    },
    async copyPrompt() {
      if (!this.modelValue || !this.available || this.copyState === "copying")
        return;
      const prompt = `${this.$t("global.article.flowchart.ai_prompt")}\n\n${ARTICLE_FLOWCHART_SCHEMA}\n\n${JSON.stringify(createArticleFlowchart(), null, 2)}`;
      const generation = ++this.copyGeneration;
      this.copyState = "copying";
      try {
        await navigator.clipboard.writeText(prompt);
        if (
          generation === this.copyGeneration &&
          this.modelValue &&
          this.available
        )
          this.copyState = "copied";
      } catch {
        if (
          generation === this.copyGeneration &&
          this.modelValue &&
          this.available
        )
          this.copyState = "failed";
      }
    },
    submit() {
      if (!this.modelValue || !this.available || !this.parsed) return;
      // The owner rechecks the current editor context and closes only after accepting this local change.
      this.$emit("apply", this.parsed);
    },
  },
};
</script>

<style scoped lang="scss">
.a-article-flowchart-dialog {
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));

  &__heading {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px 8px;
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      line-height: 1.4;
      white-space: normal;
    }
  }
  &__close {
    margin-inline-start: auto;
    flex: none;
  }
  &__body {
    padding: 12px 24px 24px;
  }
  &__intro {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 22px;
    p {
      flex: 1 1 300px;
      margin: 0;
      font-size: 14px;
      line-height: 1.7;
      color: rgba(var(--v-theme-on-surface), 0.72);
    }
    .v-btn {
      flex: none;
    }
  }
  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }
  &__intro &__copy-status {
    flex-basis: 100%;
    margin: 0;
    color: rgb(var(--v-theme-on-surface));
    font-size: 13px;
  }
  &__definition,
  &__preview {
    min-width: 0;
  }
  &__label {
    display: block;
    margin: 0 0 12px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.6;
  }
  &__code {
    min-height: 420px;
    max-height: 62vh;
    padding: 14px;
    overflow: auto;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.16);
    border-radius: 10px;
    background: rgba(var(--v-theme-on-surface), 0.025);
    color: rgb(var(--v-theme-on-surface));
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 12.5px;
    line-height: 21px;
    &:focus-within {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
    :deep(.prism-editor__textarea) {
      outline: none;
    }
  }
  &__error,
  &__empty {
    margin: 12px 0 0;
    font-size: 13px;
    line-height: 1.7;
    color: rgb(var(--v-theme-on-surface));
  }
  &__actions {
    padding: 16px 24px;
    gap: 12px;
    justify-content: flex-end;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    .v-btn {
      min-height: 42px;
      text-transform: none;
      letter-spacing: 0;
    }
  }
  @media (max-width: 800px) {
    &__grid {
      grid-template-columns: minmax(0, 1fr);
    }
    &__code {
      min-height: 300px;
      max-height: 48vh;
      font-size: 13px;
    }
  }
  @media (max-width: 600px) {
    &__heading,
    &__body,
    &__actions {
      padding-inline: 16px;
    }
    .v-btn {
      min-height: 44px;
    }
  }
}
</style>
