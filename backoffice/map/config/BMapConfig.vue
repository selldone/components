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
  <!-- ██████████████████ Config ██████████████████ -->
  <section class="sd-modern-widget b-map-config text-start" v-bind="$attrs">
    <header class="b-map-config__heading">
      <div>
        <h2>{{ $t("map_channel.settings_title") }}</h2>
        <p class="sd-modern-subtitle">
          {{ $t("map_channel.settings_subtitle") }}
        </p>
      </div>
      <span class="sd-modern-status sd-modern-status--plain" role="status">
        <span
          class="sd-modern-status__dot"
          :class="
            persistedEnable
              ? 'sd-modern-status__dot--success'
              : 'sd-modern-status__dot--error'
          "
        ></span>
        {{
          $t(persistedEnable ? "map_channel.enabled" : "map_channel.disabled")
        }}
      </span>
    </header>

    <div class="b-map-config__grid">
      <div v-if="map_providers.length === 1" class="b-map-config__provider">
        <img :src="provider.icon" width="36" height="36" alt="" />
        <div>
          <strong>{{ provider.title }}</strong
          ><small>{{ $t("map_channel.provider") }}</small>
        </div>
        <v-tooltip
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-click="true"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="sd-modern-icon-button sd-modern-info-button"
              variant="text"
              icon="info_outline"
              :aria-label="$t('map_channel.provider_help_label')"
            />
          </template>
          {{ $t("map_channel.provider_help") }}
        </v-tooltip>
      </div>
      <v-select
        v-else
        v-model="driver"
        :items="map_providers"
        item-title="title"
        item-value="code"
        :label="$t('map_channel.provider')"
        variant="underlined"
        class="sd-modern-underlined-field"
        hide-details
        :disabled="busy_set || !canWrite"
      >
        <template #selection="{ item }"
          ><img
            :src="item.raw.icon"
            width="24"
            height="24"
            alt=""
            class="me-2"
          />{{ item.raw.title }}</template
        >
        <template #item="{ item, props }"
          ><v-list-item v-bind="props"
            ><template #prepend
              ><img
                :src="item.raw.icon"
                width="24"
                height="24"
                alt=""
                class="me-2" /></template></v-list-item
        ></template>
      </v-select>

      <u-smart-switch
        v-model="enable"
        class="sd-modern-smart-select sd-modern-smart-select--columns b-map-config__choices"
        accessible
        border
        :loading="busy_set"
        :disabled="busy_set || !canWrite"
        :true-title="$t('map_channel.enable_title')"
        :true-description="$t('map_channel.enable_description')"
        true-icon="mode_of_travel"
        :false-title="$t('map_channel.disable_title')"
        :false-description="$t('map_channel.disable_description')"
        false-icon="disabled_visible"
        @change="setEnable"
      />
    </div>
    <div class="b-map-config__advanced">
      <b-map-driver-options :key="shop.id" :driver="driver" />
      <span class="b-map-config__auto-save">{{
        $t("map_channel.auto_save")
      }}</span>
    </div>
  </section>

  <!-- ███████████████████████ Dialog > Show Links ███████████████████████ -->

  <v-bottom-sheet
    v-model="show_map_urls"
    width="520"
    max-width="calc(100vw - 24px)"
    :aria-label="$t('map_channel.open_maps_title')"
  >
    <v-card
      class="sd-modern-widget b-map-config__sheet text-start"
      :theme="USER()?.preferences?.dark ? 'dark' : 'light'"
    >
      <header class="b-map-config__sheet-heading">
        <v-avatar
          :image="getShopImagePath(shop.icon, 128)"
          size="36"
          class="avatar-gradient -shop -thin"
        />
        <div>
          <h2>{{ $t("map_channel.open_maps_title") }}</h2>
          <p>{{ shop.title }}</p>
        </div>
        <v-tooltip location="top" content-class="sd-modern-tooltip text-start">
          <template #activator="{ props }"
            ><v-btn
              v-bind="props"
              class="sd-modern-icon-button"
              icon="close"
              variant="text"
              :aria-label="$t('global.actions.close')"
              @click="show_map_urls = false"
          /></template>
          {{ $t("global.actions.close") }}
        </v-tooltip>
      </header>
      <p class="sd-modern-subtitle">
        {{ $t("map_channel.open_maps_subtitle") }}
      </p>
      <v-list class="b-map-config__links" bg-color="transparent">
        <v-list-item
          v-for="link in mapLinks"
          :key="link.path"
          :href="ShopURLs.MainShopUrl(shop) + link.path"
          target="_blank"
          rel="noopener noreferrer"
          :prepend-icon="link.icon"
          append-icon="north_east"
          class="sd-modern-clickable-item b-map-config__map-link"
        >
          <v-list-item-title>{{ $t(link.title) }}</v-list-item-title>
          <v-list-item-subtitle dir="ltr">{{
            ShopURLs.MainShopUrl(shop) + link.path
          }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import BMapDriverOptions from "../../map/driver/options/BMapDriverOptions.vue";
import { Map, ShopURLs } from "@selldone/core-js";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BMapConfig",
  inheritAttrs: false,
  components: {
    BMapDriverOptions,

    USmartSwitch,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    map_providers: Object.values(Map.Providers),

    driver: Map.Providers.Mapbox.code,
    enable: false,
    busy_set: false,
    requestRevision: 0,
    show_map_urls: false,
    mapLinks: [
      { path: "/map", title: "map_channel.products_map", icon: "shopping_bag" },
      {
        path: "/map-vendors",
        title: "map_channel.vendors_map",
        icon: "storefront",
      },
    ],
  }),
  computed: {
    ShopURLs() {
      return ShopURLs;
    },
    ShopPermissionRegions() {
      return ShopPermissionRegions;
    },
    provider() {
      return (
        this.map_providers.find((provider) => provider.code === this.driver) ||
        this.map_providers[0]
      );
    },
    canWrite() {
      return this.writeShopAccess(ShopPermissionRegions.CHANNELS.code);
    },
    persistedEnable() {
      return !!ShopOptionsHelper.IsEnableShopMap(this.shop);
    },
  },
  watch: {
    shop: {
      immediate: true,
      handler() {
        this.syncShop();
      },
    },
    "shop.id"() {
      this.syncShop();
    },
    "shop.options": {
      deep: true,
      handler() {
        if (!this.busy_set) this.syncOptions();
      },
    },
  },
  beforeUnmount() {
    this.requestRevision++;
  },

  methods: {
    syncShop() {
      this.requestRevision++;
      this.busy_set = false;
      this.show_map_urls = false;
      this.syncOptions();
    },
    syncOptions() {
      this.enable = !!ShopOptionsHelper.IsEnableShopMap(this.shop);
      const configured = ShopOptionsHelper.GetShopMap(this.shop)?.driver;
      this.driver = this.map_providers.some(
        (provider) => provider.code === configured,
      )
        ? configured
        : Map.Providers.Mapbox.code;
      if (!this.enable) this.show_map_urls = false;
    },
    openMaps() {
      if (ShopOptionsHelper.IsEnableShopMap(this.shop))
        this.show_map_urls = true;
    },
    async setEnable() {
      if (this.busy_set) return;
      // Recheck current write access at the request boundary, not only on the control.
      if (!this.writeShopAccess(ShopPermissionRegions.CHANNELS.code))
        return this.syncOptions();
      const shop = this.shop;
      const shopId = shop.id;
      const revision = ++this.requestRevision;
      this.busy_set = true;
      try {
        const { data } = await axios.post(
          window.API.POST_SET_SHOP_OPTIONS_SHOP_MAP(shop.id),
          {
            enable: this.enable,
            driver: this.driver,
          },
        );
        if (
          revision !== this.requestRevision ||
          this.shop !== shop ||
          shop.id !== shopId
        )
          return;
        if (data?.error || !Array.isArray(data?.options)) {
          this.syncOptions();
          NotificationService.showErrorAlert(
            null,
            data?.error_msg || this.$t("map_channel.update_failed"),
          );
          return;
        }
        shop.options = data.options;
        this.syncOptions();
        NotificationService.showSuccessAlert(
          null,
          this.$t("map_channel.updated"),
        );
      } catch (error) {
        if (
          revision !== this.requestRevision ||
          this.shop !== shop ||
          shop.id !== shopId
        )
          return;
        this.syncOptions();
        NotificationService.showLaravelError(error);
      } finally {
        if (
          revision === this.requestRevision &&
          this.shop === shop &&
          shop.id === shopId
        ) {
          this.busy_set = false;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.b-map-config.sd-modern-widget {
  padding: 24px;
  border-radius: 16px;
}
.b-map-config {
  &__heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
  }
  &__heading h2 {
    margin: 0;
    font: inherit;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }
  &__heading p {
    margin-top: 4px;
    font-size: 13px;
    line-height: 21px;
  }
  &__heading .sd-modern-status {
    padding-top: 2px;
    font-size: 12px;
    line-height: 20px;
    flex-shrink: 0;
  }
  &__grid {
    display: grid;
    grid-template-columns: 190px minmax(0, 1fr);
    align-items: center;
    gap: 25px;
  }
  // Override the legacy p-2 utility without changing the native choice geometry globally.
  &__choices.sd-modern-smart-select :deep(.rounded-card > .pp) {
    min-height: 76px;
    padding: 13px 14px !important;
  }
  &__provider {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  &__provider > img {
    flex: 0 0 36px;
    object-fit: contain;
  }
  &__provider > div {
    display: grid;
    gap: 1px;
  }
  &__provider strong {
    font-size: 14px;
    line-height: 21px;
    font-weight: 500;
  }
  &__provider small {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__provider .sd-modern-info-button {
    margin-inline-start: auto;
  }
  &__advanced {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-top: 20px;
  }
  &__advanced > :first-child {
    flex: 1;
    min-width: 0;
  }
  &__auto-save {
    padding-top: 8px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__advanced:has(details[open]) > .b-map-config__auto-save {
    display: none;
  }
}
.b-map-config__sheet.sd-modern-widget {
  padding: 24px;
  border-radius: 18px 18px 0 0;
}
.b-map-config__sheet {
  &-heading {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  &-heading > div {
    flex: 1;
    min-width: 0;
  }
  &-heading h2 {
    margin: 0;
    font-size: 18px;
    line-height: 26px;
    font-weight: 500;
  }
  &-heading p {
    margin: 3px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
}
.b-map-config__links {
  display: grid;
  gap: 12px;
  margin-top: 20px;
  padding: 0;
}
.b-map-config__map-link {
  border: 1px solid var(--sd-modern-border);
  border-radius: 10px;
  padding: 14px 16px;
  min-height: 76px;
}
.b-map-config__map-link :deep(.v-list-item-title) {
  font-size: 14px;
  line-height: 22px;
  font-weight: 500;
}
.b-map-config__map-link :deep(.v-list-item-subtitle) {
  font-size: 13px;
  line-height: 21px;
  overflow-wrap: anywhere;
  white-space: normal;
}
.b-map-config__map-link :deep(.v-list-item__prepend > .v-icon) {
  margin-inline-end: 13px;
  opacity: 1;
}
.b-map-config__map-link :deep(.v-list-item__append > .v-icon) {
  font-size: 18px;
  opacity: 1;
}
@media (max-width: 760px) {
  .b-map-config__grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
  }
  .b-map-config__provider .sd-modern-info-button {
    margin-inline-start: 5px;
  }
}
@media (max-width: 570px) {
  .b-map-config.sd-modern-widget {
    padding: 20px 16px;
    border-radius: 14px;
  }
  .b-map-config__heading {
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }
  .b-map-config__advanced {
    flex-direction: column;
    gap: 4px;
  }
  .b-map-config__auto-save {
    padding-top: 0;
  }
  .b-map-config__sheet.sd-modern-widget {
    padding: 20px;
  }
}
@media (min-width: 601px) {
  .b-map-config__choices.sd-modern-smart-select--columns.s--smart-select
    :deep(> .rounded-card) {
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  }
}
@media (max-width: 600px) {
  .b-map-config__choices.sd-modern-smart-select--columns.s--smart-select
    :deep(> .rounded-card) {
    grid-template-columns: minmax(0, 1fr);
  }
  .b-map-config__choices.sd-modern-smart-select :deep(.rounded-card > .pp) {
    min-height: 68px;
  }
}
</style>
