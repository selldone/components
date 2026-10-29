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
  <v-card
    color="transparent"
    flat
    :class="{ 's--onboarding-migration text-start': modern }"
  >
    <div v-if="modern">
      <p class="s--onboarding-migration__intro">
        {{ $t("onboarding.modern.migration.intro") }}
      </p>
      <div class="sd-modern-records s--onboarding-migration__rows">
        <div class="sd-modern-record s--onboarding-migration__row">
          <img
            :src="require('../assets/shopify.png')"
            width="32"
            height="32"
            alt=""
          />
          <div>
            <h3>Shopify</h3>
            <p>{{ $t("onboarding.modern.migration.shopify") }}</p>
          </div>
          <v-btn
            :to="{ name: 'BPageShopChannelConnect', add: true }"
            exact
            :active="false"
            target="_blank"
            rel="noopener noreferrer"
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
            >{{ $t("onboarding.modern.migration.connect_shopify")
            }}<v-icon end size="15">north_east</v-icon></v-btn
          >
        </div>
        <div class="sd-modern-record s--onboarding-migration__row">
          <img
            :src="require('../assets/woocommerce.svg')"
            width="32"
            height="32"
            alt=""
          />
          <div>
            <h3>WooCommerce</h3>
            <p>{{ $t("onboarding.modern.migration.woocommerce") }}</p>
          </div>
          <v-btn
            :to="{ name: 'BPageShopChannelConnect', add: true }"
            exact
            :active="false"
            target="_blank"
            rel="noopener noreferrer"
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
            >{{ $t("onboarding.modern.migration.connect_woocommerce")
            }}<v-icon end size="15">north_east</v-icon></v-btn
          >
        </div>
      </div>
      <section
        class="s--onboarding-migration__ai"
        aria-labelledby="onboarding-migration-ai-title"
      >
        <h4
          id="onboarding-migration-ai-title"
          class="s--onboarding-migration__ai-title"
        >
          {{ $t("onboarding.modern.migration.ai_title") }}
        </h4>
        <p class="s--onboarding-migration__ai-description">
          {{ $t("onboarding.modern.migration.ai_description") }}
        </p>
        <div class="s--onboarding-migration__services">
          <span
            ><v-icon
              icon="fa:fab fa-openai"
              size="17"
              aria-hidden="true"
            />ChatGPT</span
          >
          <span
            ><v-icon
              icon="fa:fab fa-claude"
              size="17"
              aria-hidden="true"
            />Claude</span
          >
          <span>{{ $t("onboarding.modern.migration.any_mcp") }}</span>
        </div>
        <p class="s--onboarding-migration__instructions">
          {{ $t("onboarding.modern.migration.ai_instructions") }}
        </p>
        <div class="s--onboarding-migration__actions">
          <v-btn
            class="sd-modern-button"
            color="primary"
            variant="flat"
            prepend-icon="content_copy"
            :loading="copy_state === 'copying'"
            :disabled="!migrationPrompt"
            @click="copyPrompt"
            >{{
              $t(
                copy_state === "copied"
                  ? "onboarding.modern.migration.copied"
                  : "onboarding.modern.migration.copy_prompt",
              )
            }}</v-btn
          >
          <v-btn
            :href="mcpGuideUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
            >{{ $t("onboarding.modern.migration.mcp_guide")
            }}<v-icon end size="15">north_east</v-icon></v-btn
          >
        </div>
        <p
          class="s--onboarding-migration__copy-state"
          role="status"
          aria-live="polite"
        >
          {{ copyMessage }}
        </p>
        <details
          ref="promptDisclosure"
          class="s--onboarding-migration__disclosure"
        >
          <summary>
            <v-icon icon="code" size="16" aria-hidden="true" />
            <span>{{ $t("onboarding.modern.migration.view_prompt") }}</span>
            <v-icon
              class="s--onboarding-migration__chevron"
              icon="expand_more"
              size="16"
              aria-hidden="true"
            />
          </summary>
          <pre
            ref="promptText"
            class="s--onboarding-migration__prompt"
            tabindex="0"
            dir="auto"
            :aria-label="$t('onboarding.modern.migration.prompt_label')"
            >{{ migrationPrompt }}</pre
          >
        </details>
      </section>
      <p class="s--onboarding-migration__note">
        <v-icon size="16" aria-hidden="true">info_outline</v-icon
        ><span>{{ $t("onboarding.modern.migration.note") }}</span>
      </p>
    </div>
    <v-card-text v-else>
      <u-widget-header
        title="Shopify Migration"
        :src="require('../../onboarding/assets/shopify.png')"
      ></u-widget-header>

      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.migration.shopify.msg") }}
        </p>

        <v-img
          :src="require('../../onboarding/assets/shopify.png')"
          class="m-2 imgi"
        ></v-img>
      </div>
      <div class="widget-buttons">
        <v-btn
          :to="{ name: 'BPageShopChannelConnect', add: true }"
          color="#000"
          exact
          size="x-large"
        >
          Free migration from shopify

          <img
            class="mx-1"
            height="24"
            src="../assets/shopify.png"
            width="24"
          />
          <v-icon class="me-1" size="small">sync_alt</v-icon>
          <img
            class="mx-1"
            height="24"
            src="../../../assets/selldone-logo/selldone-w.svg"
            width="24"
          />
        </v-btn>
      </div>

      <hr class="my-5" />

      <u-widget-header
        title="Woocommerce Migration"
        :src="require('../../onboarding/assets/woocommerce.svg')"
      ></u-widget-header>

      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.migration.woocommerce.msg") }}
        </p>
        <v-img
          :src="require('../../onboarding/assets/woocommerce.svg')"
          class="m-2 imgi"
        ></v-img>
      </div>

      <div class="widget-buttons">
        <v-btn
          :to="{ name: 'BPageShopChannelConnect', add: true }"
          color="#000"
          exact
          size="x-large"
        >
          Free migration from woocommerce

          <img
            class="mx-1"
            height="24"
            src="../assets/woocommerce.svg"
            width="24"
          />
          <v-icon class="me-1" size="small">sync_alt</v-icon>
          <img
            class="mx-1"
            height="24"
            src="../../../assets/selldone-logo/selldone-w.svg"
            width="24"
          />
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
export default {
  name: "ShopOnboardingMigrationTab",
  components: {},
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    copy_state: "",
    copy_request_id: 0,
    disposed: false,
    mcpGuideUrl: "https://selldone.com/mcp",
  }),

  computed: {
    migrationPrompt() {
      if (!this.modern || !this.shop.id) return "";
      return this.$t("onboarding.modern.migration.ai_prompt", {
        shop: "#" + this.shop.id,
      });
    },
    copyMessage() {
      if (!this.copy_state) return "";
      return this.$t(
        "onboarding.modern.migration." +
          (this.copy_state === "copied"
            ? "copy_success"
            : this.copy_state === "selected"
              ? "copy_fallback"
              : "copying"),
      );
    },
  },

  watch: {
    migrationPrompt: {
      flush: "sync",
      handler() {
        this.copy_request_id++;
        this.copy_state = "";
      },
    },
  },

  beforeUnmount() {
    this.disposed = true;
    this.copy_request_id++;
  },

  methods: {
    async copyPrompt() {
      if (
        this.disposed ||
        this.copy_state === "copying" ||
        !this.migrationPrompt
      )
        return;
      const prompt = this.migrationPrompt;
      const shopId = this.shop.id;
      const requestId = ++this.copy_request_id;
      this.copy_state = "copying";
      try {
        await navigator.clipboard.writeText(prompt);
        if (
          this.disposed ||
          requestId !== this.copy_request_id ||
          shopId !== this.shop.id ||
          prompt !== this.migrationPrompt
        )
          return;
        this.copy_state = "copied";
      } catch {
        if (
          this.disposed ||
          requestId !== this.copy_request_id ||
          shopId !== this.shop.id ||
          prompt !== this.migrationPrompt
        )
          return;
        // A denied clipboard keeps the same prompt available for manual copying.
        if (this.$refs.promptDisclosure)
          this.$refs.promptDisclosure.open = true;
        await this.$nextTick();
        if (
          this.disposed ||
          requestId !== this.copy_request_id ||
          shopId !== this.shop.id ||
          prompt !== this.migrationPrompt
        )
          return;
        const node = this.$refs.promptText;
        if (node) {
          node.focus({ preventScroll: true });
          const range = document.createRange();
          range.selectNodeContents(node);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        this.copy_state = "selected";
      }
    },
  },

  created() {},
};
</script>

<style lang="scss" scoped>
.s--onboarding-migration {
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  min-width: 0;

  &__intro {
    margin: 0;
    color: var(--sd-modern-muted);
  }
  &__rows {
    margin-block-start: 18px;
  }
  &__row {
    grid-template-columns: 32px minmax(0, 1fr) auto;
    padding-block: 14px;
    gap: 10px 14px;
    img {
      object-fit: contain;
    }
    h3 {
      margin: 0;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.5;
    }
    p {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--sd-modern-muted);
    }
  }
  &__ai {
    margin-block-start: 20px;
    padding-block-start: 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__ai-title {
    margin: 0;
    font-family: inherit;
    font-size: 15px;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: -0.1px;
  }
  &__ai-description,
  &__instructions {
    margin: 9px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.55;
  }
  &__services {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 20px;
    margin-block: 14px;
    font-size: 12px;
    color: var(--sd-modern-muted);
    span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }
  &__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 18px;
    margin-block-start: 16px;
  }
  .sd-modern-button {
    --v-btn-height: 36px;
    min-height: 36px;
    max-width: 100%;
    height: auto;
    padding: 7px 11px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.45;
    letter-spacing: 0;
    white-space: normal;
    :deep(.v-btn__content) {
      white-space: normal;
    }
  }
  .sd-modern-button.sd-modern-button--inline {
    border: 0;
    font-weight: 400;
  }
  &__copy-state {
    min-height: 18px;
    margin: 6px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__disclosure {
    margin-block-start: 4px;
    summary {
      display: flex;
      align-items: center;
      gap: 7px;
      min-height: 36px;
      width: fit-content;
      max-width: 100%;
      padding-block: 6px;
      color: var(--sd-modern-muted);
      font-size: 12px;
      cursor: pointer;
      list-style: none;
      &::-webkit-details-marker {
        display: none;
      }
    }
    &[open] .s--onboarding-migration__chevron {
      transform: rotate(180deg);
    }
  }
  &__prompt {
    max-block-size: 320px;
    margin: 10px 0 0;
    padding: 14px;
    overflow: auto;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    color: rgb(var(--v-theme-on-surface));
    background: var(--sd-modern-inset);
    border: 1px solid var(--sd-modern-border);
    border-radius: 8px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.65;
    user-select: text;
  }
  :is(button, a, summary, pre):focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  &__note {
    display: flex;
    align-items: start;
    gap: 8px;
    margin: 18px 0 0;
    font-size: 12px;
    color: var(--sd-modern-muted);
    .v-icon {
      margin-block-start: 2px;
    }
  }
}
@media (max-width: 600px) {
  .s--onboarding-migration__row {
    grid-template-columns: 32px minmax(0, 1fr);
    .sd-modern-button {
      grid-column: 2;
      justify-self: start;
    }
  }
}
@media (max-width: 600px), (pointer: coarse) {
  .s--onboarding-migration {
    .sd-modern-button {
      --v-btn-height: 44px;
      min-height: 44px;
    }
    &__disclosure summary {
      min-height: 44px;
    }
  }
}
</style>
