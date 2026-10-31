<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template>
  <div class="sd-modern-content b-openai-chatgpt text-start">
    <header
      class="sd-modern-provider-header sd-modern-provider-header--compact b-openai-chatgpt__provider"
    >
      <div class="sd-modern-title">
        <img
          :src="require('../../../assets/trademark/chatgpt.svg')"
          alt=""
          width="42"
          height="42"
        />
        <div>
          <h1 class="sd-modern-provider-title">{{ t("title") }}</h1>
          <p class="sd-modern-subtitle">{{ t("providerSubtitle") }}</p>
        </div>
      </div>
    </header>

    <section class="sd-modern-widget" aria-labelledby="openai-builder-title">
      <header class="sd-modern-title b-openai-chatgpt__heading">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon aria-hidden="true">forum</v-icon></span
        >
        <div>
          <h2 id="openai-builder-title" class="sd-modern-title-text">
            {{ t("builderTitle") }}
          </h2>
          <p class="sd-modern-subtitle">{{ t("builderDescription") }}</p>
          <div
            class="sd-modern-status sd-modern-status--plain b-openai-chatgpt__status"
          >
            <span
              class="sd-modern-status__dot sd-modern-status__dot--warning"
            ></span
            >{{ t(context.private ? "privateStatus" : "setupStatus") }}
          </div>
        </div>
      </header>

      <ol class="sd-modern-steps b-openai-chatgpt__steps">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="sd-modern-step"
        >
          <span class="sd-modern-step__number">{{ $n(index + 1) }}</span>
          <div>
            <h3 class="sd-modern-step__title">{{ t(step.title) }}</h3>
            <p class="sd-modern-step__body">{{ t(step.body) }}</p>
          </div>
        </li>
      </ol>

      <div class="b-openai-chatgpt__form">
        <v-text-field
          v-model="assistantName"
          class="sd-modern-underlined-field"
          :label="t('assistantName')"
          variant="underlined"
          persistent-placeholder
          hide-details="auto"
          maxlength="80"
          required
          :error-messages="nameTouched && !validName ? [t('invalidName')] : []"
          @update:model-value="clearFeedback"
          @blur="nameTouched = true"
        />
        <v-select
          v-model="responseLanguage"
          class="sd-modern-underlined-field"
          :label="t('answerLanguage')"
          :items="responseLanguages"
          item-title="title"
          item-value="value"
          variant="underlined"
          persistent-placeholder
          hide-details
          @update:model-value="clearFeedback"
        />
      </div>
      <div class="b-openai-chatgpt__context">
        <v-icon size="14" aria-hidden="true">storefront</v-icon
        ><span>{{ t("storeLabel") }}</span
        ><span dir="ltr">{{ context.storeUrl || "—" }}</span>
      </div>
      <div
        v-if="unavailableMessage"
        class="sd-modern-notice b-openai-chatgpt__notice"
      >
        <v-icon size="16" aria-hidden="true">{{
          context.private ? "lock" : "info_outline"
        }}</v-icon>
        <p>{{ unavailableMessage }}</p>
      </div>

      <div class="b-openai-chatgpt__workspace">
        <section aria-labelledby="openai-files-title">
          <h3 id="openai-files-title" class="sd-modern-eyebrow">
            {{ t("filesTitle") }}
          </h3>
          <div class="b-openai-chatgpt__resource">
            <v-icon size="21" aria-hidden="true">table_chart</v-icon>
            <div class="b-openai-chatgpt__resource-copy">
              <div class="b-openai-chatgpt__resource-name">
                {{ t("catalogName") }}<span>CSV</span>
              </div>
              <p>{{ t("catalogDescription") }}</p>
            </div>
            <v-btn
              class="sd-modern-icon-button"
              icon
              variant="text"
              :aria-label="t('catalogLabel')"
              :loading="catalogBusy"
              :disabled="!isAvailable || catalogBusy"
              @click="downloadCatalog"
              ><v-icon size="17" aria-hidden="true">download</v-icon
              ><v-tooltip
                activator="parent"
                location="top"
                open-on-focus
                content-class="sd-modern-tooltip text-start"
                >{{ t("catalogLabel") }}</v-tooltip
              ></v-btn
            >
          </div>
          <div class="b-openai-chatgpt__resource">
            <v-icon size="21" aria-hidden="true">description</v-icon>
            <div class="b-openai-chatgpt__resource-copy">
              <div class="b-openai-chatgpt__resource-name">
                {{ t("instructionsName") }}<span>MD</span>
              </div>
              <p>{{ t("instructionsDescription") }}</p>
            </div>
            <v-btn
              class="sd-modern-icon-button"
              icon
              variant="text"
              :aria-label="t('instructionsLabel')"
              :disabled="!isAvailable"
              @click="downloadInstructions"
              ><v-icon size="17" aria-hidden="true">download</v-icon
              ><v-tooltip
                activator="parent"
                location="top"
                open-on-focus
                content-class="sd-modern-tooltip text-start"
                >{{ t("instructionsLabel") }}</v-tooltip
              ></v-btn
            >
          </div>
          <div class="sd-modern-notice b-openai-chatgpt__notice">
            <v-icon size="16" aria-hidden="true">sync</v-icon>
            <p>{{ t("snapshotNote") }}</p>
          </div>
          <details class="b-openai-chatgpt__help">
            <summary>{{ t("includedFields") }}</summary>
            <p>{{ t("fieldsBody") }}</p>
            <p>{{ t("snapshotLimit") }}</p>
          </details>
        </section>

        <section aria-labelledby="openai-prompt-title">
          <h3 id="openai-prompt-title" class="sd-modern-eyebrow">
            {{ t("promptTitle") }}
          </h3>
          <div class="b-openai-chatgpt__prompt">
            <div class="b-openai-chatgpt__prompt-heading">
              <span>{{ t("promptPreview") }}</span
              ><v-icon size="18" aria-hidden="true">notes</v-icon>
            </div>
            <p class="b-openai-chatgpt__prompt-text">{{ promptPreview }}</p>
            <details ref="promptDetails" class="b-openai-chatgpt__help">
              <summary>{{ t("fullPrompt") }}</summary>
              <pre
                ref="promptText"
                :dir="interfaceLanguage === 'fa' ? 'rtl' : 'ltr'"
                >{{ creationPrompt }}</pre
              >
            </details>
          </div>
          <div class="b-openai-chatgpt__actions">
            <v-btn
              class="sd-modern-button sd-modern-button--primary b-openai-chatgpt__action"
              :color="isAvailable ? 'primary' : undefined"
              :variant="isAvailable ? 'flat' : 'tonal'"
              :disabled="!isAvailable"
              @click="copyPrompt"
              ><v-icon start size="16" aria-hidden="true">content_copy</v-icon
              >{{ t("copyPrompt") }}</v-btn
            ><a
              class="b-openai-chatgpt__link"
              href="https://developers.openai.com/plugins/build/skills"
              target="_blank"
              rel="noopener noreferrer"
              >{{ t("setupGuide")
              }}<v-icon size="13" aria-hidden="true">north_east</v-icon></a
            >
          </div>
          <p class="b-openai-chatgpt__hint">{{ t("buildHint") }}</p>
        </section>
      </div>
      <p
        v-if="catalogBusy"
        class="b-openai-chatgpt__feedback"
        role="status"
        aria-live="polite"
      >
        {{ t("catalogLoading") }}
      </p>
      <p
        v-else-if="feedback.key"
        class="b-openai-chatgpt__feedback"
        :role="feedback.tone === 'error' ? 'alert' : 'status'"
        aria-live="polite"
      >
        <v-icon
          v-if="feedback.tone !== 'neutral'"
          size="16"
          :color="feedback.tone === 'error' ? 'error' : 'warning'"
          aria-hidden="true"
          >{{
            feedback.tone === "error" ? "error_outline" : "warning_amber"
          }}</v-icon
        >{{ t(feedback.key, feedback.values) }}
      </p>
    </section>

    <section
      class="sd-modern-widget b-openai-chatgpt__test"
      aria-labelledby="openai-test-title"
    >
      <header class="sd-modern-title b-openai-chatgpt__heading">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon aria-hidden="true">checklist</v-icon></span
        >
        <div>
          <h2 id="openai-test-title" class="sd-modern-title-text">
            {{ t("testTitle") }}
          </h2>
          <p class="sd-modern-subtitle">{{ t("testDescription") }}</p>
        </div>
      </header>
      <div
        class="b-openai-chatgpt__choices"
        role="group"
        :aria-label="t('testTitle')"
      >
        <v-btn
          v-for="test in testKeys"
          :key="test"
          variant="outlined"
          class="b-openai-chatgpt__choice"
          :aria-pressed="selectedTest === test"
          @click="selectedTest = test"
          >{{ t(test) }}</v-btn
        >
      </div>
      <div class="b-openai-chatgpt__question">
        <p ref="testQuestion">{{ t(`tests.${selectedTest}.prompt`) }}</p>
        <v-btn
          class="sd-modern-icon-button"
          icon
          variant="text"
          :aria-label="t('testLabel')"
          @click="copyTest"
          ><v-icon size="17" aria-hidden="true">content_copy</v-icon
          ><v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{ t("testLabel") }}</v-tooltip
          ></v-btn
        >
      </div>
      <p class="b-openai-chatgpt__expected">
        <span>{{ t("expectedTitle") }}</span
        ><span aria-live="polite">{{
          t(`tests.${selectedTest}.expected`)
        }}</span>
      </p>
      <p v-if="testFeedback" class="b-openai-chatgpt__feedback" role="status">
        {{ t(testFeedback) }}
      </p>
    </section>

    <details
      class="sd-modern-widget sd-modern-disclosure b-openai-chatgpt__advanced"
    >
      <summary class="sd-modern-disclosure__summary">
        <v-icon size="21" aria-hidden="true">data_object</v-icon>
        <div class="sd-modern-disclosure__copy">
          <h3>{{ t("liveTitle") }}</h3>
          <p>{{ t("liveDescription") }}</p>
        </div>
        <v-icon
          class="sd-modern-disclosure__chevron"
          size="17"
          aria-hidden="true"
          >expand_more</v-icon
        >
      </summary>
      <div class="sd-modern-disclosure__content">
        <p>{{ t("liveBody") }}</p>
        <ul>
          <li>{{ t("liveOne") }}</li>
          <li>{{ t("liveTwo") }}</li>
          <li>{{ t("liveThree") }}</li>
        </ul>
        <code dir="ltr"
          >GET /shops/@{{ context.name }}/products/all<br />GET /shops/@{{
            context.name
          }}/products/{product_id}/info</code
        >
        <div
          v-if="isAvailable && context.actionsUnavailableReason"
          class="sd-modern-notice b-openai-chatgpt__notice"
        >
          <v-icon size="16" aria-hidden="true">info_outline</v-icon>
          <p>{{ t("unavailableHttps") }}</p>
        </div>
        <div class="b-openai-chatgpt__actions">
          <v-btn
            class="sd-modern-button b-openai-chatgpt__action"
            variant="outlined"
            :disabled="!canDownloadSchema"
            @click="downloadSchema"
            ><v-icon start size="16" aria-hidden="true">download</v-icon
            >{{ t("downloadSchema") }}</v-btn
          ><a
            class="b-openai-chatgpt__link"
            href="https://developers.openai.com/api/docs/actions/getting-started"
            target="_blank"
            rel="noopener noreferrer"
            >{{ t("actionsGuide")
            }}<v-icon size="13" aria-hidden="true">north_east</v-icon></a
          >
        </div>
        <p class="b-openai-chatgpt__hint">{{ t("mcpHint") }}</p>
      </div>
    </details>
    <footer class="b-openai-chatgpt__footer">{{ t("footerFlow") }}</footer>
  </div>
</template>

<script lang="ts">
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import { saveAs } from "file-saver";
import {
  createChannelContext,
  buildInstructions,
  buildCreationPrompt,
  buildOpenApiSchema,
  fetchPublicCatalog,
} from "./ChatgptChannel";

export default {
  name: "BOpenaiChatgpt",
  props: { shop: { type: Object, required: true } },
  data: () => ({
    assistantName: "",
    responseLanguage: "shopper",
    selectedTest: "discover",
    testKeys: ["discover", "compare", "buy"],
    steps: [
      { title: "stepOne", body: "stepOneBody" },
      { title: "stepTwo", body: "stepTwoBody" },
      { title: "stepThree", body: "stepThreeBody" },
    ],
    nameTouched: false,
    catalogBusy: false,
    catalogController: null as AbortController | null,
    catalogRequest: 0,
    feedback: { key: "", values: {}, tone: "neutral" },
    testFeedback: "",
    active: true,
  }),
  computed: {
    context() {
      return createChannelContext(this.shop);
    },
    canRead() {
      return (
        this.readShopAccess(ShopPermissionRegions.CHANNELS.code) &&
        this.readShopAccess(ShopPermissionRegions.PRODUCTS.code)
      );
    },
    isAvailable() {
      return this.canRead && !this.context.unavailableReason;
    },
    canDownloadSchema() {
      return this.isAvailable && !this.context.actionsUnavailableReason;
    },
    validName() {
      return !!this.assistantName.trim() && this.assistantName.length <= 80;
    },
    interfaceLanguage() {
      return String(this.$i18n.locale).startsWith("fa") ? "fa" : "en";
    },
    responseLanguages() {
      return [
        { value: "shopper", title: this.t("responseMatch") },
        { value: "en", title: this.t("responseEnglish") },
        { value: "fa", title: this.t("responsePersian") },
      ];
    },
    creationPrompt() {
      return this.validName
        ? buildCreationPrompt(
            this.context,
            this.assistantName,
            this.responseLanguage,
            this.interfaceLanguage,
          )
        : "";
    },
    promptPreview() {
      const language = this.responseLanguages.find(
        (item) => item.value === this.responseLanguage,
      )?.title;
      return `${this.t("previewStart", { name: this.assistantName.trim(), shop: this.context.title })}\n\n${this.t("previewEnd")}\n\n${this.t("answerLanguage")}: ${language}`;
    },
    unavailableMessage() {
      if (!this.canRead) return this.t("noAccess");
      const reasons = {
        private: "privateNote",
        preview: "unavailablePreview",
        storefront: "unavailableStorefront",
        xapi: "unavailableXapi",
      };
      return this.context.unavailableReason
        ? this.t(reasons[this.context.unavailableReason])
        : "";
    },
  },
  watch: {
    context: {
      handler() {
        this.resetDraft();
      },
      deep: true,
    },
    canRead(value) {
      if (!value) this.cancelCatalog();
    },
    selectedTest() {
      this.testFeedback = "";
    },
  },
  created() {
    this.resetDraft();
  },
  beforeUnmount() {
    this.active = false;
    this.cancelCatalog();
  },
  methods: {
    t(key, values = {}) {
      return this.$t(`channel_openai.modern.${key}`, values);
    },
    clearFeedback() {
      this.feedback = { key: "", values: {}, tone: "neutral" };
    },
    resetDraft() {
      this.cancelCatalog();
      this.assistantName = this.t("defaultAssistantName", {
        shop: this.context.title,
      }).slice(0, 80);
      this.responseLanguage = "shopper";
      this.selectedTest = "discover";
      this.nameTouched = false;
      this.testFeedback = "";
      this.clearFeedback();
    },
    cancelCatalog() {
      this.catalogController?.abort();
      this.catalogController = null;
      this.catalogRequest += 1;
      this.catalogBusy = false;
    },
    async downloadCatalog() {
      // Recheck current shop access before every export and before delivering its result.
      if (!this.isAvailable || this.catalogBusy) return;
      const context = this.context;
      const request = ++this.catalogRequest;
      const controller = new AbortController();
      this.catalogController = controller;
      this.catalogBusy = true;
      this.clearFeedback();
      try {
        const result = await fetchPublicCatalog(context, {
          signal: controller.signal,
        });
        if (
          request !== this.catalogRequest ||
          !this.isAvailable ||
          this.context !== context
        )
          return;
        if (!result.count) {
          this.feedback = { key: "catalogEmpty", values: {}, tone: "neutral" };
          return;
        }
        saveAs(
          new Blob([result.csv], { type: "text/csv;charset=utf-8" }),
          result.truncated
            ? "public-catalog-partial.csv"
            : "public-catalog.csv",
        );
        this.feedback = {
          key: result.truncated ? "catalogPartial" : "catalogReady",
          values: {
            count: this.$n(result.count),
            date: new Date(result.generatedAt).toLocaleString(
              this.$i18n.locale,
            ),
          },
          tone: result.truncated ? "warning" : "neutral",
        };
      } catch (error) {
        if (request !== this.catalogRequest || controller.signal.aborted)
          return;
        this.feedback = { key: "catalogFailed", values: {}, tone: "error" };
      } finally {
        if (request === this.catalogRequest) {
          this.catalogBusy = false;
          this.catalogController = null;
        }
      }
    },
    downloadInstructions() {
      if (!this.isAvailable) return;
      this.nameTouched = true;
      if (!this.validName) return;
      saveAs(
        new Blob(
          [
            buildInstructions(
              this.context,
              this.assistantName,
              this.responseLanguage,
            ),
          ],
          { type: "text/markdown;charset=utf-8" },
        ),
        "shopping-instructions.md",
      );
      this.feedback = { key: "instructionsDone", values: {}, tone: "neutral" };
    },
    downloadSchema() {
      if (!this.canDownloadSchema) return;
      saveAs(
        new Blob([buildOpenApiSchema(this.context)], {
          type: "application/json;charset=utf-8",
        }),
        "openapi.json",
      );
      this.feedback = { key: "schemaDone", values: {}, tone: "neutral" };
    },
    copyPrompt() {
      if (!this.isAvailable) return;
      this.nameTouched = true;
      if (!this.validName) return;
      return this.copyText(this.creationPrompt, false);
    },
    copyTest() {
      return this.copyText(this.t(`tests.${this.selectedTest}.prompt`), true);
    },
    async copyText(text, test) {
      const context = this.context;
      let key = test ? "copyTestDone" : "copyDone";
      try {
        if (!navigator.clipboard?.writeText)
          throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(text);
      } catch (_) {
        if (!this.active || this.context !== context) return;
        key = "clipboardFallback";
        if (!test) this.$refs.promptDetails.open = true;
        await this.$nextTick();
        if (!this.active || this.context !== context) return;
        const target = test ? this.$refs.testQuestion : this.$refs.promptText;
        if (target) {
          const range = document.createRange();
          range.selectNodeContents(target);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
      if (!this.active || this.context !== context) return;
      if (test) this.testFeedback = key;
      else this.feedback = { key, values: {}, tone: "neutral" };
    },
  },
};
</script>

<style lang="scss" scoped>
.b-openai-chatgpt {
  width: 100%;
  max-width: 900px;
  font-family: inherit;
  font-size: 13px;
  line-height: 21px;
  p {
    margin: 0;
  }
  .sd-modern-widget {
    padding: 26px;
    font-family: inherit;
    font-size: 13px;
    line-height: 21px;
  }
  &__provider {
    margin-block-end: 24px;
  }
  &__provider > .sd-modern-title {
    gap: 14px;
    align-items: center;
  }
  &__provider img {
    flex: 0 0 42px;
    object-fit: contain;
  }
  &__provider .sd-modern-provider-title {
    margin: 0 0 4px;
    font-size: 22px;
    font-weight: 500;
    line-height: 28px;
    letter-spacing: -0.3px;
  }
  &__provider .sd-modern-subtitle,
  &__heading .sd-modern-subtitle {
    margin: 0;
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
  }
  &__heading .sd-modern-title-text {
    margin: 0 0 5px;
    font-size: 18px;
    font-weight: 500;
    line-height: 25px;
    letter-spacing: -0.15px;
  }
  &__status {
    margin-block-start: 12px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
    gap: 7px;
  }
  &__steps {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
    padding-block: 23px;
    margin-block: 22px 24px;
    border-block: 1px solid var(--sd-modern-border);
  }
  &__steps .sd-modern-step {
    grid-template-columns: 24px minmax(0, 1fr);
    gap: 10px;
    margin: 0;
    padding: 0;
    border: 0;
  }
  &__steps .sd-modern-step__number {
    width: 23px;
    height: 23px;
    border: 0;
    background: var(--sd-modern-inset);
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
  }
  &__steps .sd-modern-step__title {
    margin: 0 0 3px;
    font-size: 13px;
    font-weight: 500;
    line-height: 21px;
  }
  &__steps .sd-modern-step__body {
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
  }
  &__form {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 24px;
  }
  &__form .sd-modern-underlined-field {
    --sd-modern-field-height: 58px;
  }
  &__form :deep(.v-field.v-field--variant-underlined .v-field__input),
  &__form :deep(.v-field--variant-underlined .v-select__selection) {
    line-height: 22px;
  }
  &__form :deep(.v-field.v-field--variant-underlined .v-field-label--floating) {
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
    opacity: 1;
  }
  &__context {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 9px;
    margin-block-start: 14px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__context > span[dir] {
    color: rgb(var(--v-theme-on-surface));
    overflow-wrap: anywhere;
    unicode-bidi: isolate;
  }
  &__workspace {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
    margin-block-start: 28px;
  }
  &__workspace > section {
    min-width: 0;
  }
  &__workspace .sd-modern-eyebrow {
    margin-block-end: 13px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 500;
    line-height: 17px;
    letter-spacing: 0.6px;
  }
  &__resource {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding-block: 13px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__resource:first-of-type {
    padding-block-start: 0;
  }
  &__resource > .v-icon {
    margin-block-start: 2px;
    color: var(--sd-modern-muted);
  }
  &__resource-copy {
    flex: 1;
    min-width: 0;
  }
  &__resource-name {
    margin-block-end: 3px;
    font-size: 13px;
    font-weight: 500;
    line-height: 21px;
  }
  &__resource-name > span {
    margin-inline-start: 5px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 17px;
  }
  &__resource-copy > p {
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
  }
  .sd-modern-icon-button {
    flex-shrink: 0;
    border-radius: 8px;
  }
  &__notice {
    flex-wrap: nowrap;
    align-items: flex-start;
    gap: 9px;
    margin-block-start: 14px;
    padding: 12px 13px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
  }
  &__notice > .v-icon {
    margin-block-start: 2px;
    flex-shrink: 0;
    color: var(--sd-modern-muted);
  }
  &__help {
    margin-block-start: 15px;
    font-size: 12px;
    line-height: 20px;
  }
  &__help > summary {
    width: fit-content;
    padding-block: 5px;
    color: rgb(var(--v-theme-primary));
    cursor: pointer;
  }
  &__help p {
    margin-block-start: 10px;
    color: var(--sd-modern-muted);
  }
  &__help pre {
    margin-block: 10px 0;
    color: rgb(var(--v-theme-on-surface));
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  &__prompt {
    padding: 16px;
    background: var(--sd-modern-inset);
    border-radius: 11px;
  }
  &__prompt-heading {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-block-end: 10px;
    font-size: 12px;
    font-weight: 500;
    line-height: 19px;
  }
  &__prompt-heading .v-icon {
    color: var(--sd-modern-muted);
  }
  &__prompt-text {
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-block-start: 16px;
  }
  &__action.sd-modern-button {
    --v-btn-height: 36px;
    min-height: 36px;
    padding: 8px 14px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }
  &__link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: rgb(var(--v-theme-primary));
    text-decoration: none;
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
  }
  p.b-openai-chatgpt__hint {
    margin-block-start: 12px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__feedback {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-block-start: 14px !important;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__feedback > .v-icon {
    margin-block-start: 2px;
    flex-shrink: 0;
  }
  &__test,
  &__advanced {
    margin-block-start: 18px;
  }
  &__choices {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-block: 20px 15px;
  }
  &__choice.v-btn {
    --v-btn-height: 36px;
    min-width: 0;
    min-height: 36px;
    height: auto;
    padding: 7px 11px;
    border-radius: 8px;
    border-color: var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0 !important;
    text-transform: none;
  }
  &__choice[aria-pressed="true"] {
    background: var(--sd-modern-inset);
    color: rgb(var(--v-theme-on-surface));
    border-color: rgb(var(--v-theme-on-surface));
  }
  &__question {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  &__question > p {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 23px;
  }
  p.b-openai-chatgpt__expected {
    margin-block-start: 14px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__expected > span {
    display: block;
  }
  &__expected > span:first-child {
    margin-block-end: 3px;
    color: rgb(var(--v-theme-on-surface));
    font-weight: 500;
  }
  &__advanced.sd-modern-widget {
    padding: 0;
  }
  &__advanced > summary {
    align-items: center;
    padding: 26px;
  }
  &__advanced > summary > .v-icon {
    color: var(--sd-modern-muted);
    flex-shrink: 0;
  }
  &__advanced h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }
  &__advanced summary p {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__advanced .sd-modern-disclosure__content {
    padding: 22px 26px 26px;
    font-size: 13px;
    line-height: 21px;
  }
  &__advanced ul {
    margin: 13px 0;
    padding-inline-start: 20px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__advanced li {
    margin-block: 5px;
    padding-inline-start: 3px;
  }
  &__advanced code {
    display: block;
    padding: 12px 14px;
    border-radius: 9px;
    background: var(--sd-modern-inset);
    color: rgb(var(--v-theme-on-surface));
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    text-align: left;
    overflow-wrap: anywhere;
  }
  &__footer {
    margin-block-start: 17px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  @media (max-width: 650px) {
    .sd-modern-widget {
      padding: 21px;
    }
    &__workspace,
    &__form,
    &__steps {
      grid-template-columns: minmax(0, 1fr);
    }
    &__form {
      gap: 17px;
    }
    &__steps {
      gap: 15px;
    }
    &__advanced.sd-modern-widget {
      padding: 0;
    }
    &__advanced > summary {
      padding: 21px;
    }
    &__advanced .sd-modern-disclosure__content {
      padding: 21px;
    }
  }
  @media (max-width: 400px) {
    .sd-modern-widget {
      padding: 18px;
    }
    &__provider > .sd-modern-title {
      gap: 10px;
      align-items: flex-start;
    }
    &__provider img {
      width: 34px;
      height: 34px;
      flex-basis: 34px;
    }
    &__provider .sd-modern-provider-title {
      font-size: 21px;
    }
    &__actions > .v-btn {
      width: 100%;
      white-space: normal;
    }
    &__advanced.sd-modern-widget {
      padding: 0;
    }
    &__advanced > summary,
    &__advanced .sd-modern-disclosure__content {
      padding: 18px;
    }
  }
  @media (max-width: 599px), (pointer: coarse) {
    &__form .sd-modern-underlined-field {
      --sd-modern-field-height: 72px;
    }
    &__action.sd-modern-button,
    &__choice.v-btn {
      --v-btn-height: 44px;
      min-height: 44px;
    }
    &__help > summary {
      min-height: 44px;
      padding-block: 12px;
    }
  }
}
</style>
