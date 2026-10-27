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
  <div
    class="b-webhook-item sd-modern-clickable-item text-start"
    @click="$emit('click', $event)"
  >
    <div class="b-webhook-item__endpoint">
      <v-icon class="b-webhook-item__icon" size="18" aria-hidden="true">
        {{ getIcon(webhook.type) }}
      </v-icon>
      <div class="b-webhook-item__copy">
        <button
          type="button"
          class="b-webhook-item__url"
          :aria-label="`${t('open_calls')}: ${webhook.url}`"
          dir="ltr"
        >
          {{ webhook.url }}
        </button>
        <p class="b-webhook-item__meta">
          {{ t(`events.${webhook.type}.title`) }} ·
          {{ t("created", { date: getFromNowString(webhook.created_at) }) }}
        </p>
      </div>
    </div>

    <div class="b-webhook-item__state">
      <span
        class="sd-modern-status sd-modern-status--plain b-webhook-item__status"
      >
        <v-icon
          v-if="webhook.fails > 0"
          color="error"
          size="13"
          aria-hidden="true"
        >
          {{ webhook.fails >= 100 ? "pause_circle_outline" : "error_outline" }}
        </v-icon>
        <span v-else class="b-webhook-item__dot" aria-hidden="true"></span>
        {{
          webhook.fails >= 100
            ? t("inactive")
            : webhook.fails > 0
              ? t("failures", { count: webhook.fails })
              : t("no_failures")
        }}
      </span>
      <p v-if="webhook.fails >= 100" class="b-webhook-item__state-note">
        {{ t("reset_required", { count: webhook.fails }) }}
      </p>
    </div>

    <div class="b-webhook-item__actions">
      <v-btn
        :aria-label="t('edit_action')"
        class="sd-modern-icon-button b-webhook-item__action"
        icon
        variant="text"
        v-tooltip="{
          text: t('edit_action'),
          location: 'top',
          contentClass: 'sd-modern-tooltip',
        }"
        @click.stop="$emit('click:edit', webhook)"
        ><v-icon size="16" aria-hidden="true">edit</v-icon></v-btn
      >
      <v-btn
        :loading="loadingDelete"
        :aria-label="t('delete_action')"
        class="sd-modern-icon-button b-webhook-item__action"
        icon
        variant="text"
        v-tooltip="{
          text: t('delete_action'),
          location: 'top',
          contentClass: 'sd-modern-tooltip',
        }"
        @click.stop="$emit('click:delete', webhook)"
        ><v-icon size="16" aria-hidden="true">delete_outline</v-icon></v-btn
      >
    </div>
  </div>
</template>

<script lang="ts">
import WebhookTypes from "@selldone/core-js/enums/webhook/WebhookTypes";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BWebhookItem",
  mixins: [DateMixin],
  emits: ["click", "click:edit", "click:delete"],
  props: {
    webhook: {
      required: true,
      type: Object,
    },

    loadingDelete: {
      default: false,
      type: Boolean,
    },
  },
  methods: {
    t(key, values?) {
      return this.$t(`admin_shop.automation.webhooks.${key}`, values || {});
    },
    getIcon(type) {
      return WebhookTypes[type]?.icon || "webhook";
    },
  },
};
</script>

<style lang="scss" scoped>
.b-webhook-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 146px 72px;
  gap: 12px;
  align-items: center;
  min-height: 74px;
  padding: 13px 8px;
  color: rgb(var(--v-theme-on-surface));
  border-block-end: 1px solid var(--sd-modern-border);

  &:last-child {
    border-block-end: 0;
  }

  &__endpoint {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
  }
  &__copy {
    min-width: 0;
  }
  &__icon {
    flex: 0 0 18px;
    color: var(--sd-modern-muted);
  }
  &__url {
    display: block;
    max-width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.6;
    letter-spacing: 0;
    text-align: start;
    overflow-wrap: anywhere;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
      border-radius: 3px;
    }
  }
  &__meta {
    margin: 2px 0 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.6;
  }
  &__status {
    gap: 6px;
    padding: 0;
    color: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.4;
  }
  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--sd-modern-muted);
  }
  &__state-note {
    margin: 4px 0 0;
    padding-inline-start: 19px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 1.5;
  }
  &__actions {
    display: flex;
    gap: 4px;
    justify-content: end;
  }
  &__action.sd-modern-icon-button {
    --sd-modern-icon-button-size: 34px;

    :deep(.v-btn__content > .v-icon) {
      font-size: 16px;
    }
  }
}

@media (max-width: 799px), (pointer: coarse) {
  .b-webhook-item {
    grid-template-columns: minmax(0, 1fr) 146px 92px;

    &__action.sd-modern-icon-button {
      --sd-modern-icon-button-size: 44px;
    }
    &__url {
      min-height: 44px;
    }
  }
}
@media (max-width: 700px) {
  .b-webhook-item {
    grid-template-columns: minmax(0, 1fr) 92px;
    gap: 5px 8px;

    &__actions {
      grid-column: 2;
      grid-row: 1 / span 2;
    }
    &__state {
      grid-column: 1;
      padding-inline-start: 29px;
    }
    &__state-note {
      margin-block-start: 2px;
    }
  }
}
</style>
