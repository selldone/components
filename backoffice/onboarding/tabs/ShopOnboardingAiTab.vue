<template>
  <section class="s-onboarding-ai text-start">
    <h4>{{ $t("onboarding.modern.ai.title") }}</h4>
    <p class="s-onboarding-ai__intro">
      {{ $t("onboarding.modern.ai.description") }}
    </p>

    <figure class="sd-modern-illustration s-onboarding-ai__illustration">
      <div class="s-onboarding-ai__stage" aria-hidden="true">
        <div class="s-onboarding-ai__chat">
          <div class="s-onboarding-ai__brands">
            <img
              :src="'/assets/img/mcp-agents/chatgpt.svg'"
              width="23"
              height="23"
              alt=""
            />
            <img
              :src="'/assets/img/mcp-agents/claude.svg'"
              width="23"
              height="23"
              alt=""
            />
            <span>{{ $t("onboarding.modern.ai.your_agent") }}</span>
          </div>
          <p>{{ $t("onboarding.modern.ai.example_prompt") }}</p>
          <span class="sd-modern-illustration__action">{{
            $t("onboarding.modern.ai.example_action")
          }}</span>
        </div>
        <svg
          class="s-onboarding-ai__wire"
          viewBox="0 0 48 24"
          fill="none"
          focusable="false"
        >
          <path d="M1 12 C15 12 33 12 47 12" pathLength="1" />
        </svg>
        <div class="s-onboarding-ai__bridge">
          <svg
            class="sd-modern-illustration__icon"
            viewBox="0 0 24 24"
            focusable="false"
          >
            <path
              d="M9 15 15 9M8 17l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 7l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"
              transform="translate(1 0) scale(.9)"
            />
          </svg>
          <strong>Selldone MCP</strong>
          <span>OAuth</span>
        </div>
        <svg
          class="s-onboarding-ai__wire s-onboarding-ai__wire--result"
          viewBox="0 0 48 24"
          fill="none"
          focusable="false"
        >
          <path d="M1 12 C15 12 33 12 47 12" pathLength="1" />
        </svg>
        <div class="s-onboarding-ai__results">
          <span v-for="item in capabilities" :key="item.key">
            <svg
              class="sd-modern-illustration__icon"
              viewBox="0 0 24 24"
              focusable="false"
            >
              <path :d="item.path" />
            </svg>
            {{ $t("onboarding.modern.ai." + item.key) }}
          </span>
        </div>
      </div>
      <figcaption>
        <span>{{ $t("onboarding.modern.ai.illustration") }}</span>
        {{ $t("onboarding.modern.ai.illustration_summary") }}
      </figcaption>
    </figure>

    <div
      class="s-onboarding-ai__providers"
      role="group"
      :aria-label="$t('onboarding.modern.ai.choose_agent')"
    >
      <button
        v-for="item in providers"
        :key="item.code"
        type="button"
        :aria-pressed="provider === item.code"
        @click="provider = item.code"
      >
        <img
          :src="'/assets/img/mcp-agents/' + item.code + '.svg'"
          width="22"
          height="22"
          alt=""
        />
        {{ item.label }}
      </button>
    </div>

    <ol class="sd-modern-steps s-onboarding-ai__steps">
      <li class="sd-modern-step">
        <span class="sd-modern-step__number" aria-hidden="true">1</span>
        <div class="s-onboarding-ai__step-content">
          <h5>{{ $t("onboarding.modern.ai.copy_title") }}</h5>
          <div v-if="mcp_url" class="s-onboarding-ai__endpoint">
            <label :for="'onboarding-mcp-url-' + shop.id">{{
              $t("onboarding.modern.ai.server_url")
            }}</label>
            <div class="s-onboarding-ai__copy-row">
              <textarea
                :id="'onboarding-mcp-url-' + shop.id"
                ref="urlField"
                :value="mcp_url"
                readonly
                rows="1"
                dir="ltr"
                spellcheck="false"
                @focus="$event.target.select()"
              />
              <v-btn
                class="sd-modern-button"
                color="primary"
                variant="flat"
                :prepend-icon="
                  copy_state === 'copied' ? 'check' : 'content_copy'
                "
                :loading="copy_state === 'copying'"
                @click="copyUrl"
              >
                {{
                  $t(
                    copy_state === "copied"
                      ? "onboarding.modern.ai.copied"
                      : "onboarding.modern.ai.copy_url",
                  )
                }}
              </v-btn>
            </div>
            <p class="s-onboarding-ai__feedback" role="status">
              {{
                copy_state === "failed"
                  ? $t("onboarding.modern.ai.copy_fallback")
                  : ""
              }}
            </p>
            <p v-if="local_url" class="s-onboarding-ai__local-note">
              {{ $t("onboarding.modern.ai.local_url") }}
            </p>
          </div>
          <p v-else role="status" class="s-onboarding-ai__unavailable">
            {{
              $t(
                loading
                  ? "onboarding.modern.ai.loading"
                  : "onboarding.modern.ai.unavailable",
              )
            }}
          </p>
        </div>
      </li>
      <li class="sd-modern-step">
        <span class="sd-modern-step__number" aria-hidden="true">2</span>
        <div class="s-onboarding-ai__step-content">
          <h5>
            {{
              $t("onboarding.modern.ai.add_title", { provider: provider_label })
            }}
          </h5>
          <p>{{ $t("onboarding.modern.ai.add_" + provider) }}</p>
          <v-btn
            :href="provider_guide"
            target="_blank"
            rel="noopener noreferrer"
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
          >
            {{
              $t("onboarding.modern.ai.provider_guide", {
                provider: provider_label,
              })
            }}<v-icon end size="15">north_east</v-icon>
          </v-btn>
        </div>
      </li>
      <li class="sd-modern-step">
        <span class="sd-modern-step__number" aria-hidden="true">3</span>
        <div class="s-onboarding-ai__step-content">
          <h5>{{ $t("onboarding.modern.ai.authorize_title") }}</h5>
          <p>{{ $t("onboarding.modern.ai.authorize_description") }}</p>
        </div>
      </li>
    </ol>

    <div class="s-onboarding-ai__status" :aria-busy="loading">
      <p role="status">
        <v-icon
          :icon="connected ? 'check_circle_outline' : 'link'"
          size="17"
          aria-hidden="true"
        />
        {{
          $t(
            error
              ? "onboarding.modern.ai.refresh_error"
              : connected
                ? "onboarding.modern.ai.connected"
                : "onboarding.modern.ai.check_connection",
          )
        }}
      </p>
      <v-btn
        class="sd-modern-button sd-modern-button--inline"
        color="primary"
        variant="text"
        prepend-icon="refresh"
        :loading="loading"
        @click="$emit('refresh')"
        >{{ $t("onboarding.modern.ai.refresh") }}</v-btn
      >
    </div>
    <v-btn
      :to="{
        name: 'BPageShopDashboard',
        params: { shop_id: shop.id },
        query: { dashboard: 'ai-agents' },
      }"
      target="_blank"
      rel="noopener noreferrer"
      class="sd-modern-button sd-modern-button--inline"
      color="primary"
      variant="text"
    >
      {{ $t("onboarding.modern.ai.manage")
      }}<v-icon end size="15">north_east</v-icon>
    </v-btn>
  </section>
</template>

<script lang="ts">
export default {
  name: "ShopOnboardingAiTab",
  emits: ["refresh"],
  props: {
    shop: { type: Object, required: true },
    connection: { type: Object, default: null },
    loading: Boolean,
    error: Boolean,
  },
  data: () => ({
    provider: "chatgpt",
    copy_state: "",
    copy_request: 0,
    disposed: false,
    capabilities: [
      {
        key: "products",
        path: "m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm-8 4.5 8 4.5 8-4.5M12 12v9M8 5.2l8 4.5",
      },
      { key: "orders", path: "M6 8h14l-2 9H8L5 3H2M9 21h.01M17 21h.01M10 5h7" },
      { key: "content", path: "M5 3h10l4 4v14H5V3Zm10 0v5h4M8 12h8M8 16h6" },
      { key: "reports", path: "M4 3v17h17M8 15v-4M13 15V7M18 15V5" },
    ],
  }),
  computed: {
    providers() {
      return [
        { code: "chatgpt", label: "ChatGPT" },
        { code: "claude", label: "Claude" },
        { code: "custom", label: this.$t("onboarding.modern.ai.other_agent") },
      ];
    },
    provider_label() {
      return this.providers.find((item) => item.code === this.provider)?.label;
    },
    provider_guide() {
      return {
        chatgpt:
          "https://developers.openai.com/api/docs/guides/custom-mcp-server",
        claude:
          "https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp",
        custom: "https://selldone.com/mcp",
      }[this.provider];
    },
    mcp_url() {
      const value = this.connection?.mcp_url;
      if (typeof value !== "string") return "";
      try {
        const url = new URL(value);
        if (url.username || url.password || url.search || url.hash) return "";
        if (
          url.protocol !== "https:" &&
          !(
            url.protocol === "http:" &&
            ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
          )
        )
          return "";
        return url.href;
      } catch {
        return "";
      }
    },
    local_url() {
      return (
        this.mcp_url &&
        ["localhost", "127.0.0.1", "[::1]"].includes(
          new URL(this.mcp_url).hostname,
        )
      );
    },
    connected() {
      return (
        Number.isInteger(this.connection?.active_connections) &&
        this.connection.active_connections > 0
      );
    },
  },
  watch: {
    "shop.id": {
      flush: "sync",
      handler() {
        this.provider = "chatgpt";
        this.resetCopy();
      },
    },
    mcp_url: {
      flush: "sync",
      handler() {
        this.resetCopy();
      },
    },
  },
  beforeUnmount() {
    this.disposed = true;
    this.resetCopy();
  },
  methods: {
    resetCopy() {
      this.copy_request++;
      this.copy_state = "";
    },
    async copyUrl() {
      if (!this.mcp_url || this.copy_state === "copying" || this.disposed)
        return;
      const value = this.mcp_url;
      const request = ++this.copy_request;
      this.copy_state = "copying";
      try {
        await navigator.clipboard.writeText(value);
        if (!this.disposed && request === this.copy_request)
          this.copy_state = "copied";
      } catch {
        if (this.disposed || request !== this.copy_request) return;
        this.copy_state = "failed";
        await this.$nextTick();
        if (this.disposed || request !== this.copy_request) return;
        this.$refs.urlField?.focus();
        this.$refs.urlField?.select();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.s-onboarding-ai {
  min-width: 0;
  font-size: 13px;
  line-height: 1.6;
  h4 {
    font: inherit;
    font-size: 19px;
    font-weight: 500;
    margin: 0 0 6px;
  }
  h5 {
    font: inherit;
    font-weight: 500;
    margin: 0 0 6px;
  }
  p {
    margin: 0;
  }
  &__intro,
  &__step-content > p,
  figcaption,
  &__feedback,
  &__local-note {
    color: var(--sd-modern-muted);
  }
  &__illustration {
    margin: 22px 0;
  }
  &__stage {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 32px 104px 32px minmax(0, 1fr);
    align-items: center;
    padding: 22px 18px;
    border-radius: 18px;
    background: rgba(var(--sd-modern-illustration-accent-rgb), 0.035);
  }
  &__chat,
  &__bridge,
  &__results {
    min-width: 0;
    background: rgb(var(--v-theme-surface));
    border: 1px solid var(--sd-modern-border);
  }
  &__chat {
    border-radius: 18px;
    padding: 16px;
  }
  &__brands {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
  }
  &__brands img {
    object-fit: contain;
  }
  &__chat p {
    margin: 16px 0 12px;
    font-size: 12px;
  }
  &__chat .sd-modern-illustration__action {
    display: inline-block;
    padding: 5px 10px;
    font-size: 11px;
  }
  &__bridge {
    border-radius: 14px;
    padding: 16px 6px;
    display: grid;
    justify-items: center;
    gap: 8px;
    text-align: center;
    strong {
      font-size: 11px;
      font-weight: 500;
    }
    span {
      font-size: 10px;
      color: var(--sd-modern-muted);
    }
    svg {
      width: 23px;
      height: 23px;
      color: rgb(var(--sd-modern-illustration-accent-rgb));
    }
  }
  &__wire {
    width: 100%;
    height: 24px;
    color: rgba(var(--sd-modern-illustration-accent-rgb), 0.6);
    path {
      stroke: currentColor;
      stroke-width: 1.6;
      stroke-linecap: round;
      stroke-dasharray: 1;
      animation: s-onboarding-ai-connect 0.8s 0.4s both;
    }
  }
  &__wire--result path {
    animation-delay: 1.2s;
  }
  &__results {
    display: grid;
    gap: 12px;
    padding: 16px;
    border-radius: 14px;
    animation: s-onboarding-ai-reveal 0.6s 2s both;
    span {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 11px;
    }
    svg {
      width: 18px;
      height: 18px;
      color: rgb(var(--sd-modern-illustration-accent-rgb));
    }
  }
  figcaption {
    font-size: 11px;
    margin-block-start: 9px;
    span {
      font-weight: 500;
      margin-inline-end: 8px;
    }
  }
  &__providers {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin: 24px 0;
  }
  &__providers button {
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 40px;
    padding: 8px 14px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    color: inherit;
    background: rgb(var(--v-theme-surface));
    font: inherit;
    &[aria-pressed="true"] {
      border-color: rgb(var(--v-theme-primary));
      background: rgba(var(--v-theme-primary), 0.04);
    }
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }
    img {
      object-fit: contain;
    }
  }
  &__steps {
    h5 {
      line-height: 28px;
    }
    .sd-modern-step__number {
      font-size: 12px;
      font-weight: 400;
    }
  }
  &__step-content {
    min-width: 0;
  }
  &__endpoint label {
    font-size: 11px;
    color: var(--sd-modern-muted);
  }
  &__copy-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-block-start: 5px;
  }
  &__copy-row textarea {
    resize: none;
    flex: 1;
    min-width: 0;
    height: 39px;
    padding: 9px 10px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 8px;
    color: inherit;
    background: rgb(var(--v-theme-surface));
    font-size: 12px;
    white-space: pre;
    overflow: auto;
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
  }
  &__feedback {
    font-size: 11px;
    min-height: 18px;
    margin-block-start: 4px !important;
  }
  &__local-note {
    font-size: 11px;
  }
  &__unavailable {
    padding-block: 10px;
  }
  &__steps .sd-modern-button--inline {
    margin-block-start: 5px;
  }
  &__status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-block-start: 24px;
    padding-block: 14px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__status p {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    font-size: 12px;
    .v-icon {
      margin-block-start: 2px;
    }
  }
  @media (max-width: 700px) {
    &__stage {
      grid-template-columns: 1fr;
      justify-items: stretch;
      padding: 20px;
    }
    &__wire {
      width: 32px;
      height: 24px;
      transform: rotate(90deg);
      justify-self: center;
      margin-block: 4px;
    }
    &__bridge {
      padding: 12px;
    }
    &__results {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    &__copy-row {
      flex-wrap: wrap;
      textarea {
        flex-basis: 100%;
      }
    }
    &__status {
      flex-wrap: wrap;
    }
    &__providers button {
      min-height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    &__wire path,
    &__results {
      animation: none;
    }
  }
}
@keyframes s-onboarding-ai-connect {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes s-onboarding-ai-reveal {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
