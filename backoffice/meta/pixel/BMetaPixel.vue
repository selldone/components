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
  <section
    class="sd-modern-widget b-meta-pixel text-start"
    aria-labelledby="meta-pixel-title"
  >
    <header class="b-meta-pixel__header">
      <div class="sd-modern-title b-meta-pixel__heading">
        <img
          :src="require('../../../assets/trademark/facebook.svg')"
          alt=""
          width="23"
          height="23"
        />
        <div>
          <h2 id="meta-pixel-title" class="sd-modern-title-text">
            {{ $t("shop_meta.pixel.title") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("shop_meta.pixel.subtitle") }}
            <v-tooltip
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-focus
              open-on-click
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  class="sd-modern-icon-button sd-modern-info-button"
                  variant="text"
                  icon
                  :aria-label="$t('shop_meta.pixel.help_label')"
                >
                  <v-icon aria-hidden="true">info_outline</v-icon>
                </v-btn>
              </template>
              {{ $t("shop_meta.pixel.help") }}
            </v-tooltip>
          </p>
        </div>
      </div>
      <span
        class="sd-modern-status sd-modern-status--plain b-meta-pixel__status"
      >
        <v-icon v-if="savedPixelId" size="14" aria-hidden="true">check</v-icon>
        <span
          v-else
          class="sd-modern-status__dot sd-modern-status__dot--warning"
          aria-hidden="true"
        />
        {{
          $t(
            savedPixelId
              ? "shop_meta.pixel.configured"
              : "shop_meta.pixel.not_configured",
          )
        }}
      </span>
    </header>

    <form class="b-meta-pixel__form" @submit.prevent="setFacebookPixelID">
      <v-text-field
        v-model="tag_manager_id"
        class="sd-modern-underlined-field b-meta-pixel__field"
        :readonly="lock || busy_set"
        :label="$t('shop_meta.pixel.id')"
        :placeholder="$t('shop_meta.pixel.placeholder')"
        :disabled="!canWrite || busy_set"
        aria-describedby="meta-pixel-hint"
        autocomplete="off"
        inputmode="numeric"
        variant="underlined"
        persistent-placeholder
        hide-details
        @update:model-value="change = true"
      >
        <template #append-inner>
          <v-tooltip
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-focus
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="sd-modern-icon-button sd-modern-input-action"
                variant="text"
                icon
                :disabled="!canWrite || busy_set"
                :aria-pressed="lock"
                :aria-label="
                  $t(lock ? 'shop_meta.pixel.unlock' : 'shop_meta.pixel.lock')
                "
                @click="lock = !lock"
              >
                <v-icon aria-hidden="true">{{
                  lock ? "lock" : "lock_open"
                }}</v-icon>
              </v-btn>
            </template>
            {{ $t(lock ? "shop_meta.pixel.unlock" : "shop_meta.pixel.lock") }}
          </v-tooltip>
        </template>
      </v-text-field>
      <p id="meta-pixel-hint" class="b-meta-pixel__hint">
        {{
          $t(
            canWrite ? "shop_meta.pixel.hint" : "shop_meta.pixel.readonly_hint",
          )
        }}
      </p>

      <div v-if="change" class="b-meta-pixel__actions">
        <span>{{ $t("shop_meta.pixel.unsaved") }}</span>
        <v-btn
          class="sd-modern-button sd-modern-button--primary"
          :loading="busy_set"
          :disabled="!canWrite || busy_set"
          color="primary"
          variant="flat"
          type="submit"
        >
          <v-icon start aria-hidden="true">save</v-icon>
          {{ $t("global.actions.save_changes") }}
        </v-btn>
      </div>
    </form>
  </section>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

export default {
  name: "BMetaPixel",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    tag_manager_id: "",
    busy_set: false,
    change: false,
    lock: false,
  }),
  computed: {
    canWrite() {
      return this.writeShopAccess(ShopPermissionRegions.CHANNELS.code);
    },
    savedPixelId() {
      return (
        this.shop.plugins.find((item) => item.name === "FacebookPixel")?.setting
          ?.id || null
      );
    },
  },

  created() {
    this.tag_manager_id = this.savedPixelId;
    this.lock = !!this.tag_manager_id;
  },

  methods: {
    setFacebookPixelID() {
      if (!this.canWrite || this.busy_set || !this.change) return;
      this.busy_set = true;

      return axios
        .put(
          window.API.POST_SHOP_PLUGIN_SET_CONFIG(this.shop.id, "FacebookPixel"),
          {
            setting: {
              id: this.tag_manager_id,
            },
            enable: !!this.tag_manager_id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.shop.plugins, data.plugin);
            NotificationService.showSuccessAlert(
              null,
              this.$t("shop_meta.pixel.saved"),
            );
            this.change = false;
            this.lock = !!this.tag_manager_id;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-meta-pixel {
  padding: 26px;
  font-family: inherit;
  font-size: 13px;
  line-height: 21px;

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  &__heading {
    flex: 1;
    gap: 11px;
  }
  &__heading > img {
    flex: 0 0 23px;
    margin-block-start: 2px;
  }
  &__heading .sd-modern-title-text {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 500;
    line-height: 25px;
    letter-spacing: -0.15px;
  }
  &__heading .sd-modern-subtitle {
    margin: 0;
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
  }
  &__status {
    flex: 0 0 auto;
    margin-block-start: 3px;
    gap: 6px;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
  }
  &__form {
    margin-block-start: 25px;
  }
  &__field :deep(input) {
    direction: ltr;
    text-align: start;
    font-family: inherit;
    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
  }
  &__hint {
    margin: 9px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-block-start: 18px;
  }
  &__actions > span {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }

  @media (max-width: 650px) {
    padding: 21px;
    &__header {
      flex-wrap: wrap;
      gap: 8px;
    }
    &__heading {
      flex-basis: 100%;
    }
    &__status {
      margin-inline-start: 34px;
      margin-block-start: 0;
    }
  }
  @media (max-width: 390px) {
    padding: 18px;
  }
  @media (max-width: 599px), (pointer: coarse) {
    &__field :deep(input) {
      font-size: 16px;
    }
  }
}
</style>
