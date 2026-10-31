<!--
  - Copyright (c) 2023. Selldone® Business OS™
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
  <div class="b-stream-endpoint text-start">
    <header class="b-stream-endpoint__intro">
      <h2 class="sd-modern-title-text">{{ $t("stream_form.title") }}</h2>
      <div class="b-stream-endpoint__endpoint" :aria-busy="busy_fetch">
        <span class="b-stream-endpoint__method">POST</span>
        <code v-if="post_endpoint" dir="ltr">{{ post_endpoint }}</code>
        <span v-else role="status" class="b-stream-endpoint__endpoint-state">{{
          $t(busy_fetch ? "stream_form.loading" : "stream_form.unavailable")
        }}</span>
        <v-btn
          v-if="post_endpoint"
          class="sd-modern-button"
          variant="text"
          prepend-icon="content_copy"
          @click="copyText(post_endpoint, 'endpoint')"
          >{{ $t("stream_form.copy_endpoint") }}</v-btn
        >
        <v-btn
          v-else
          class="sd-modern-button"
          variant="text"
          prepend-icon="refresh"
          :loading="busy_fetch"
          @click="fetchStreams()"
          >{{ $t("stream_form.retry") }}</v-btn
        >
      </div>
      <p class="sd-modern-subtitle">{{ $t("stream_form.subtitle") }}</p>
    </header>
    <div class="b-stream-endpoint__workspace">
      <section class="b-stream-endpoint__guide">
        <ol class="sd-modern-steps">
          <li v-for="(step, index) in steps" :key="step" class="sd-modern-step">
            <span class="sd-modern-step__number" aria-hidden="true">{{
              index + 1
            }}</span>
            <h3 class="sd-modern-step__title">
              {{ $t("stream_form.step_" + step) }}
            </h3>
            <p class="sd-modern-step__body">
              {{ $t("stream_form.step_" + step + "_help") }}
            </p>
          </li>
        </ol>
        <section class="b-stream-endpoint__builder">
          <h3 class="sd-modern-step__title">
            {{ $t("stream_form.prompt_title") }}
          </h3>
          <p class="sd-modern-subtitle">
            {{ $t("stream_form.prompt_help") }}
          </p>
          <v-btn
            class="sd-modern-button sd-modern-button--primary"
            color="primary"
            variant="flat"
            prepend-icon="content_copy"
            @click="copyText(aiPrompt, 'prompt')"
            >{{ $t("stream_form.copy_prompt") }}</v-btn
          >
          <details
            :open="show_prompt"
            @toggle="show_prompt = $event.target.open"
            class="b-stream-endpoint__preview"
          >
            <summary>{{ $t("stream_form.preview_prompt") }}</summary>
            <pre tabindex="0" dir="auto">{{ aiPrompt }}</pre>
          </details>
        </section>
      </section>

      <figure class="sd-modern-illustration b-stream-endpoint__illustration">
        <figcaption class="b-stream-endpoint__illustration-heading">
          <div>
            <h3 class="sd-modern-step__title">
              {{ $t("stream_form.preview_title") }}
            </h3>
            <p class="sd-modern-subtitle">
              {{ $t("stream_form.preview_help") }}
            </p>
          </div>
        </figcaption>
        <div class="b-stream-endpoint__stage" aria-hidden="true">
          <span class="b-stream-endpoint__demo-label">{{
            $t("stream_form.preview_badge")
          }}</span>
          <svg
            class="b-stream-endpoint__route"
            viewBox="0 0 520 360"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              class="b-stream-endpoint__route-band"
              d="M 280 242 C 354 242 306 178 376 178"
            />
            <path
              class="b-stream-endpoint__route-dashes"
              d="M 280 242 C 354 242 306 178 376 178"
            />
            <circle
              cx="376"
              cy="178"
              r="4"
              class="b-stream-endpoint__route-end"
            />
          </svg>
          <svg
            class="b-stream-endpoint__route b-stream-endpoint__route--mobile"
            viewBox="0 0 320 550"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              class="b-stream-endpoint__route-band"
              d="M 156 360 C 156 420 220 382 220 442"
            />
            <path
              class="b-stream-endpoint__route-dashes"
              d="M 156 360 C 156 420 220 382 220 442"
            />
          </svg>
          <div class="b-stream-endpoint__demo-form">
            <div class="b-stream-endpoint__demo-mark">
              <svg
                class="sd-modern-illustration__icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2Z"
                />
                <path d="M20 2v4m-2-2h4" />
              </svg>
            </div>
            <strong class="b-stream-endpoint__demo-title">{{
              $t("stream_form.preview_form_title")
            }}</strong>
            <p>{{ $t("stream_form.preview_form_help") }}</p>
            <div class="b-stream-endpoint__demo-field">
              <span>{{ $t("stream_form.preview_name") }}</span
              ><b
                class="b-stream-endpoint__demo-value b-stream-endpoint__demo-value--name"
                >Alex</b
              >
            </div>
            <div class="b-stream-endpoint__demo-field">
              <span>{{ $t("stream_form.preview_email") }}</span
              ><b
                dir="ltr"
                class="b-stream-endpoint__demo-value b-stream-endpoint__demo-value--email"
                >demo@example.com</b
              >
            </div>
            <div class="b-stream-endpoint__demo-field">
              <span>{{ $t("stream_form.preview_interest") }}</span
              ><b
                class="b-stream-endpoint__demo-value b-stream-endpoint__demo-value--interest"
                >{{ $t("stream_form.preview_interest_value") }}</b
              >
            </div>
            <div
              class="sd-modern-illustration__action b-stream-endpoint__demo-submit"
            >
              <span>{{ $t("stream_form.preview_submit") }}</span
              ><svg
                class="sd-modern-illustration__icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </div>
            <small>{{ $t("stream_form.preview_privacy") }}</small>
          </div>
          <div class="b-stream-endpoint__demo-stream">
            <div class="b-stream-endpoint__demo-stream-title">
              <svg
                class="sd-modern-illustration__icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path d="m4 7 8-4 8 4-8 4-8-4Z" />
                <path d="m4 12 8 4 8-4M4 17l8 4 8-4" /></svg
              >{{ $t("stream_form.preview_stream") }}
            </div>
            <div class="b-stream-endpoint__demo-record">
              <span class="b-stream-endpoint__demo-avatar">A</span>
              <div>
                <strong>Alex</strong
                ><span>{{ $t("stream_form.preview_record") }}</span>
              </div>
            </div>
            <div class="b-stream-endpoint__demo-saved">
              <svg
                class="sd-modern-illustration__icon"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path d="m5 12 4 4L19 6" /></svg
              >{{ $t("stream_form.preview_saved") }}
            </div>
          </div>
        </div>
      </figure>
    </div>
    <p class="sd-modern-notice b-stream-endpoint__notice">
      <v-icon size="18" aria-hidden="true">info_outline</v-icon>
      <span>{{ $t("stream_form.capture_help") }}</span>
    </p>
    <p class="b-stream-endpoint__feedback" role="status" aria-live="polite">
      {{ feedback }}
    </p>
    <details class="b-stream-endpoint__technical">
      <summary>
        <v-icon size="20" aria-hidden="true">code</v-icon>
        <span>{{ $t("stream_form.technical_title") }}</span>
        <v-icon class="b-stream-endpoint__chevron" size="20" aria-hidden="true"
          >expand_more</v-icon
        >
      </summary>
      <div class="b-stream-endpoint__technical-body">
        <p>{{ $t("stream_form.endpoint_help") }}</p>
        <p class="sd-modern-subtitle">
          {{ $t("stream_form.technical_help") }}
        </p>
        <div class="b-stream-endpoint__reference">
          <table class="sd-modern-table b-stream-endpoint__fields">
            <thead>
              <tr>
                <th>{{ $t("stream_form.field_caption") }}</th>
                <th>{{ $t("stream_form.requirement_caption") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="field in fields" :key="field">
                <td dir="ltr">
                  <code>{{ field }}</code>
                </td>
                <td>
                  <span class="b-stream-endpoint__requirement">{{
                    $t(
                      field === "email"
                        ? "stream_form.required"
                        : "stream_form.optional",
                    )
                  }}</span
                  >{{ $t("stream_form.field_" + field) }}
                </td>
              </tr>
            </tbody>
          </table>
          <section>
            <h3 class="sd-modern-step__title">
              {{ $t("stream_form.payload_title") }}
            </h3>
            <pre tabindex="0" dir="ltr">{{ examplePayload }}</pre>
          </section>
        </div>
        <p>{{ $t("stream_form.duplicate_help") }}</p>
        <p class="sd-modern-subtitle">
          {{ $t("stream_form.consent_help") }}
        </p>
        <details
          :open="show_sample"
          @toggle="show_sample = $event.target.open"
          class="b-stream-endpoint__preview"
        >
          <summary>{{ $t("stream_form.sample_title") }}</summary>
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            prepend-icon="content_copy"
            @click="copyText(sampleCode, 'sample')"
            >{{ $t("stream_form.copy_sample") }}</v-btn
          >
          <pre tabindex="0" dir="ltr">{{ sampleCode }}</pre>
        </details>
      </div>
    </details>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { SetupService } from "@selldone/core-js/server/SetupService";

export default {
  name: "BStreamEndpoint",
  props: { shop: { type: Object, required: true } },
  data() {
    return {
      steps: ["design", "connect", "collect"],
      fields: ["email", "name", "phone", "data", "tags"],
      busy_fetch: false,
      streams: [],
      feedback: "",
      show_prompt: false,
      show_sample: false,
    };
  },
  computed: {
    web_agent() {
      return this.streams.find((stream) => stream.agent === "web");
    },
    post_endpoint() {
      return this.web_agent
        ? window.XAPI.POST_STREAM_USER_ADD(
            SetupService.GetApiSubdomain("xapi"),
            this.shop.id,
            this.web_agent.access_key,
          )
        : null;
    },
    examplePayload() {
      return JSON.stringify(
        {
          email: "visitor@example.com",
          name: "Alex",
          phone: null,
          data: { interest: "New collection", consent: true },
          tags: ["custom-form"],
        },
        null,
        2,
      );
    },
    aiPrompt() {
      return [
        this.$t("stream_form.prompt_intro", {
          brief: this.$t("stream_form.brief_default"),
        }),
        ...[
          "contract",
          "behavior",
          "duplicates",
          "scope",
          "privacy",
          "delivery",
        ].map((key) => this.$t("stream_form.prompt_" + key)),
        this.$t("stream_form.prompt_example"),
        this.examplePayload,
      ].join("\n\n");
    },
    sampleCode() {
      // Keep the example independent of the shop's collection key.
      return `<!-- Replace SELLDONE_STREAM_ENDPOINT with your copied endpoint. -->
<form id="stream-form">
  <label>Email <input name="email" type="email" required></label>
  <label>Name <input name="name" autocomplete="name"></label>
  <label>Phone <input name="phone" type="tel" autocomplete="tel"></label>
  <label>Interest <input name="interest"></label>
  <label><input name="consent" type="checkbox" required> I agree to share these details with this shop.</label>
  <button type="submit">Submit</button>
  <p role="status" aria-live="polite"></p>
</form>
<script>
const endpoint = "SELLDONE_STREAM_ENDPOINT";
const form = document.querySelector("#stream-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  if (button.disabled) return;
  const status = form.querySelector('[role="status"]');
  button.disabled = true;
  status.textContent = "Submitting…";
  try {
    if (!endpoint.startsWith("https://") && !endpoint.startsWith("http://")) {
      throw new Error("Replace the endpoint placeholder before publishing.");
    }
    const fields = new FormData(form);
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email: fields.get("email").trim(),
        name: fields.get("name").trim() || null,
        phone: fields.get("phone").trim() || null,
        data: { interest: fields.get("interest").trim(), consent: fields.get("consent") === "on" },
        tags: ["custom-form"]
      })
    });
    const result = await response.json();
    if (!response.ok || result?.success !== true || result?.error) {
      throw new Error(result?.error_msg || result?.message || "Could not save your details. Please try again.");
    }
    status.textContent = "Your details were saved.";
  } catch (error) {
    status.textContent = error.message || "Could not save your details. Please try again.";
  } finally {
    button.disabled = false;
  }
});
<\/script>`;
    },
  },
  watch: {
    "shop.id"() {
      this.streams = [];
      this.feedback = "";
      this.fetchStreams();
    },
  },
  created() {
    this.fetchStreams();
  },
  methods: {
    async copyText(value, section) {
      if (!value) return;
      this.feedback = "";
      try {
        await navigator.clipboard.writeText(value);
        this.feedback = this.$t("stream_form.copied");
      } catch {
        this.feedback = this.$t("stream_form.copy_failed");
        if (section === "prompt") this.show_prompt = true;
        if (section === "sample") this.show_sample = true;
      }
    },
    // Preserve the existing source API and its authorized shop context.
    async fetchStreams() {
      if (this.busy_fetch) return;
      const shopId = this.shop.id;
      this.busy_fetch = true;
      try {
        const { data } = await axios.get(window.API.GET_SHOP_STREAMS(shopId), {
          params: {
            offset: 0,
            limit: 10,
            sortBy: null,
            sortDesc: null,
            search: null,
          },
        });
        if (this.shop.id === shopId) this.streams = data.streams || [];
      } catch (error) {
        if (this.shop.id === shopId)
          NotificationService.showLaravelError(error);
      } finally {
        this.busy_fetch = false;
        if (this.shop.id !== shopId) this.fetchStreams();
      }
    },
  },
};
</script>

<style scoped lang="scss">
.b-stream-endpoint {
  font-size: var(--sd-modern-font-body, 14px);
  line-height: 1.65;
  color: rgb(var(--v-theme-on-surface));
  min-width: 0;
  p {
    margin-block: 0 12px;
  }
  &__intro {
    margin-block-end: 28px;
  }
  &__intro h2 {
    margin-block-end: 8px;
  }
  &__workspace {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: 28px;
  }
  .sd-modern-step__body {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: var(--sd-modern-font-small, 13px);
    line-height: 21px;
  }
  .sd-modern-step + .sd-modern-step {
    margin-block-start: 18px;
    padding-block-start: 18px;
  }
  &__builder {
    min-width: 0;
    margin-block-start: 24px;
    padding-block-start: 24px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__builder .sd-modern-subtitle {
    margin-block: 6px 16px;
  }
  &__preview {
    margin-block-start: 18px;
  }
  summary {
    cursor: pointer;
    min-height: 44px;
    align-content: center;
  }
  summary:focus-visible,
  pre:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 4px;
    border-radius: 4px;
  }
  &__notice {
    margin-block-start: 28px !important;
    align-items: flex-start;
    gap: 10px;
  }
  &__notice .v-icon {
    flex: 0 0 auto;
    margin-block-start: 2px;
  }
  &__feedback {
    min-height: 24px;
    margin-block-end: 12px !important;
    font-size: var(--sd-modern-font-small, 13px);
  }
  &__technical {
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__technical > summary {
    display: flex;
    gap: 12px;
    padding-block: 16px;
    font-weight: 500;
    list-style: none;
  }
  &__technical > summary::-webkit-details-marker {
    display: none;
  }
  &__chevron {
    margin-inline-start: auto;
  }
  &__technical[open] > summary .b-stream-endpoint__chevron {
    transform: rotate(180deg);
  }
  &__technical-body {
    padding-block: 8px 0;
  }
  &__endpoint {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 12px 16px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    margin-block: 16px;
    min-height: 68px;
  }
  &__endpoint code {
    min-width: 0;
    flex: 1;
    overflow-wrap: anywhere;
    user-select: all;
    line-height: 1.7;
  }
  &__endpoint-state {
    flex: 1;
    color: var(--sd-modern-muted);
  }
  &__method {
    color: rgb(var(--v-theme-primary));
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.8px;
  }

  &__illustration {
    min-width: 0;
    margin: 0;
    padding-inline-start: 28px;
    border-inline-start: 1px solid var(--sd-modern-border);
    display: flex;
    flex-direction: column;
  }
  &__illustration-heading {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  &__illustration-heading > div {
    flex: 1;
    min-width: 0;
  }
  &__illustration-heading .sd-modern-subtitle {
    margin-block-start: 6px;
  }
  &__stage {
    position: relative;
    isolation: isolate;
    min-height: 380px;
    margin-block-start: 18px;
    flex: 1;
    border-radius: 20px;
    background:
      radial-gradient(
        ellipse at 50% 45%,
        rgba(var(--sd-modern-illustration-accent-rgb), 0.08),
        transparent 70%
      ),
      radial-gradient(
        ellipse at 85% 65%,
        rgba(var(--sd-modern-illustration-highlight-rgb), 0.065),
        transparent 60%
      );
  }
  &__demo-label {
    position: absolute;
    inset-block-start: 2px;
    inset-inline-end: 10px;
    font-size: 11px;
    color: var(--sd-modern-muted);
    letter-spacing: 0.3px;
  }
  &__route {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    color: rgb(var(--sd-modern-illustration-accent-rgb));
    z-index: -1;
  }
  &__route--mobile {
    display: none;
  }
  &__route-band {
    stroke: currentColor;
    stroke-opacity: 0.07;
    stroke-width: 12;
  }
  &__route-dashes {
    stroke: currentColor;
    stroke-width: 2;
    stroke-dasharray: 3 7;
    animation: stream-form-route 3.2s linear both;
  }
  &__route-end {
    fill: currentColor;
  }
  &__demo-form {
    position: absolute;
    left: 0;
    top: 30px;
    width: 62%;
    padding: 18px;
    border-radius: 18px;
    border: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 12px 32px rgba(var(--v-theme-on-surface), 0.07);
  }
  &__demo-mark {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    margin-block-end: 10px;
    border-radius: 10px;
    background: rgba(var(--sd-modern-illustration-accent-rgb), 0.08);
    color: rgb(var(--sd-modern-illustration-accent-rgb));
  }
  &__demo-title {
    display: block;
    font-size: 16px;
    line-height: 24px;
    font-weight: 600;
  }
  &__demo-form > p {
    color: var(--sd-modern-muted);
    font-size: 12px;
    margin-block: 3px 14px;
    line-height: 18px;
  }
  &__demo-field {
    display: flex;
    flex-direction: column;
    min-height: 46px;
    padding-block: 5px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__demo-field > span {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 16px;
  }
  &__demo-value {
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
    animation: stream-form-type 3.2s ease both;
  }
  &__demo-value--email {
    animation-delay: 0.35s;
    text-align: start;
  }
  &__demo-value--interest {
    animation-delay: 0.7s;
  }
  &__demo-submit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    min-height: 36px;
    padding: 6px 12px;
    border-radius: 9px;
    margin-block: 14px 10px;
    font-size: 12px;
    font-weight: 500;
    animation: stream-form-submit 3.2s ease both;
  }
  &__demo-form > small {
    display: block;
    font-size: 10px;
    line-height: 16px;
    color: var(--sd-modern-muted);
  }
  &__demo-stream {
    position: absolute;
    right: 0;
    top: 43%;
    width: 33%;
    padding: 13px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 14px;
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 8px 24px rgba(var(--v-theme-on-surface), 0.05);
  }
  &__demo-stream-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
  }
  &__demo-record {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-block: 14px 12px;
    animation: stream-form-record 3.2s ease both;
  }
  &__demo-avatar {
    display: grid;
    place-items: center;
    flex: 0 0 26px;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: rgba(var(--sd-modern-illustration-accent-rgb), 0.08);
    color: rgb(var(--sd-modern-illustration-accent-rgb));
    font-size: 12px;
  }
  &__demo-record strong {
    display: block;
    font-size: 12px;
    font-weight: 500;
  }
  &__demo-record div > span {
    display: block;
    font-size: 10px;
    color: var(--sd-modern-muted);
    line-height: 16px;
  }
  &__demo-saved {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    line-height: 16px;
    animation: stream-form-record 3.2s ease both;
  }
  &__demo-saved .sd-modern-illustration__icon {
    color: rgb(var(--sd-modern-illustration-accent-rgb));
  }
  &__reference {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 28px;
    margin-block: 18px 24px;
  }
  &__fields {
    width: 100%;
  }
  &__fields td {
    vertical-align: top;
    padding-block: 12px;
  }
  &__fields td:first-child {
    padding-inline-end: 14px;
  }
  &__requirement {
    display: block;
    color: var(--sd-modern-muted);
    font-size: var(--sd-modern-font-small, 13px);
  }
  pre {
    margin-block: 12px;
    padding: 16px;
    border-radius: 12px;
    background: var(--sd-modern-inset);
    color: inherit;
    font-size: var(--sd-modern-font-small, 13px);
    line-height: 1.7;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    max-height: 320px;
    overflow: auto;
    text-align: start;
  }
  code {
    font-size: var(--sd-modern-font-small, 13px);
  }
  @media (max-width: 700px) {
    &__workspace,
    &__reference {
      grid-template-columns: minmax(0, 1fr);
      gap: 28px;
    }
    &__builder {
      margin-block-start: 20px;
    }
    &__endpoint {
      flex-wrap: wrap;
      gap: 8px 12px;
    }
    &__endpoint code,
    &__endpoint-state {
      flex-basis: calc(100% - 60px);
    }
    &__endpoint > .v-btn {
      margin-inline-start: auto;
    }
    &__illustration {
      padding-inline-start: 0;
      border-inline-start: 0;
      padding-block-start: 24px;
      border-block-start: 1px solid var(--sd-modern-border);
    }
    &__stage {
      min-height: 550px;
    }
    &__demo-form {
      width: calc(100% - 52px);
      max-width: 290px;
      top: 30px;
    }
    &__demo-stream {
      top: auto;
      bottom: 2px;
      width: 58%;
      max-width: 210px;
    }
    &__route {
      display: none;
    }
    &__route--mobile {
      display: block;
    }
    &__builder > .v-btn {
      width: 100%;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    &__stage * {
      animation: none !important;
    }
  }
}

@keyframes stream-form-route {
  to {
    stroke-dashoffset: -20;
  }
}
@keyframes stream-form-type {
  0%,
  8% {
    clip-path: inset(0 100% 0 0);
  }
  28%,
  100% {
    clip-path: inset(0);
  }
}
@keyframes stream-form-submit {
  0%,
  42%,
  70%,
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-on-surface), 0);
  }
  52% {
    box-shadow: 0 0 0 5px rgba(var(--v-theme-on-surface), 0.12);
  }
}
@keyframes stream-form-record {
  0%,
  54% {
    opacity: 0.25;
    transform: translateY(5px);
  }
  66%,
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
