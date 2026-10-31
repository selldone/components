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
    v-if="modern"
    class="b-product-graphical-assets-selector sd-modern-input-action-host"
  >
    <v-btn
      icon
      variant="text"
      class="sd-modern-icon-button sd-modern-input-action"
      :loading="busy_fetch"
      :disabled="disabled || !variant_assets?.length"
      :aria-label="$t('b_product_inventory.editor.choose_image_value')"
      @click="showDialog"
    >
      <v-icon>image</v-icon>
      <v-tooltip
        activator="parent"
        location="top"
        content-class="sd-modern-tooltip text-start"
        >{{ $t("b_product_inventory.editor.choose_image_value") }}</v-tooltip
      >
    </v-btn>

    <v-dialog
      v-if="dialog_pre"
      v-model="dialog"
      :fullscreen="$vuetify.display.xs"
      max-width="680"
      scrollable
    >
      <v-card
        class="sd-modern-widget b-product-graphical-assets-selector__dialog text-start"
        :theme="USER()?.preferences?.dark ? 'dark' : 'light'"
      >
        <header class="b-product-graphical-assets-selector__header">
          <div>
            <h2>{{ $t("variant_graphical_assets.title") }}</h2>
            <p>{{ $t("b_product_inventory.editor.image_value_help") }}</p>
          </div>
          <v-btn
            icon
            variant="text"
            class="sd-modern-icon-button"
            :aria-label="$t('global.actions.close')"
            @click="closeDialog"
          >
            <v-icon>close</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              >{{ $t("global.actions.close") }}</v-tooltip
            >
          </v-btn>
        </header>
        <v-card-text class="b-product-graphical-assets-selector__body">
          <div class="b-product-graphical-assets-selector__grid">
            <button
              v-for="asset in variant_assets"
              :key="asset.id"
              type="button"
              class="b-product-graphical-assets-selector__asset"
              :disabled="disabled"
              @click="selectAsset(asset)"
            >
              <img
                :src="getShopImagePath(asset.path)"
                :alt="getName(asset.name) || asset.name"
                class="no-inv"
              />
              <span>{{ getName(asset.name) || asset.name }}</span>
            </button>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
  <div v-else-if="variant_assets?.length">
    <v-slide-group show-arrows>
      <v-slide-group-item key="o">
        <v-btn
          size="small"
          title="View list of suggestions."
          variant="text"
          @click="showDialog"
        >
          <v-icon>pin_invoke</v-icon>
        </v-btn>
      </v-slide-group-item>
      <v-slide-group-item v-for="n in variant_assets" :key="n.id">
        <v-btn
          class="tnt"
          size="small"
          variant="plain"
          @click="$emit('select', `{${n.name}}`)"
        >
          <img
            :src="getShopImagePath(n.path)"
            class="me-1 rounded ms-n1"
            height="16"
            width="16"
          />
          {{ getName(n.name)?.limitWords(4) }}
        </v-btn>
      </v-slide-group-item>
    </v-slide-group>

    <!-- ██████████████████████ Dialog ██████████████████████ -->

    <v-dialog
      v-if="dialog_pre"
      v-model="dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-text class="py-16">
          <v-list
            class="max-widget-width mx-auto text-start border-between-vertical"
            lines="two"
          >
            <v-list-item
              v-for="n in variant_assets"
              :key="n.id"
              class="row-hover"
              @click="
                $emit('select', `{${n.name}}`);
                closeDialog();
              "
            >
              <template v-slot:prepend>
                <v-avatar rounded>
                  <img :src="getShopImagePath(n.path)" />
                </v-avatar>
              </template>
              <v-list-item-title class="typo-body text-wrap">
                {{ getName(n.name) }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="closeDialog">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductGraphicalAssetsSelector",
  mixins: [],
  components: {},
  inject: ["$shop"],
  emits: ["select"],
  props: {
    modern: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  data: () => ({
    dialog_pre: false,
    dialog: false,

    busy_fetch: false,
  }),

  computed: {
    stored() {
      const out = this.$store.getters.getShopVariantAssets;
      if (out?.shop_id === this.$shop.id) return out;
      return null;
    },
    variant_assets() {
      return this.stored?.variant_assets;
    },
    totalItems() {
      return this.stored?.totalItems;
    },
  },
  created() {
    this.fetchVariantAssets();
  },
  watch: {
    disabled(value) {
      if (value) this.closeDialog();
    },
  },
  methods: {
    showDialog() {
      if (this.disabled || !this.variant_assets?.length) return;
      this.dialog_pre = true;
      this.$nextTick(() => {
        this.dialog = true;
      });
    },
    closeDialog() {
      this.dialog = false;
      this.$nextTick(() => {
        this.dialog_pre = false;
      });
    },
    selectAsset(asset) {
      if (this.disabled) return;
      this.$emit("select", `{${asset.name}}`);
      this.closeDialog();
    },

    fetchVariantAssets() {
      if (this.stored) return;

      this.$store.commit("setShopVariantAssets", { shop_id: this.$shop.id });

      this.busy_fetch = true;

      axios
        .get(window.API.GET_SHOP_VARIANT_ASSETS(this.$shop.id), {
          params: {
            offset: 0,
            limit: 100,
            compact: true,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            // Keep data saved:
            this.$store.commit("setShopVariantAssets", {
              shop_id: this.$shop.id,
              variant_assets: data.variant_assets,
              totalItems: data.totalItems,
            });
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-graphical-assets-selector {
  &__dialog.v-card {
    padding: 0;
    border-radius: 16px;
    color: rgb(var(--v-theme-on-surface));
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 24px 12px;
    flex-shrink: 0;

    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
    }

    p {
      margin: 5px 0 0;
      font-size: 13px;
      line-height: 20px;
      color: var(--sd-modern-muted);
    }
  }

  &__body {
    min-width: 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 16px;
  }

  &__asset {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    color: inherit;
    background: rgb(var(--v-theme-surface));
    font: inherit;
    font-size: 13px;
    line-height: 20px;
    text-align: start;

    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 6px;
    }

    span {
      overflow-wrap: anywhere;
    }

    &:hover:not(:disabled) {
      background: var(--sd-modern-inset);
    }

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }
  }
}

@media (max-width: 600px) {
  .b-product-graphical-assets-selector__dialog.v-card {
    border-radius: 0;
  }

  .b-product-graphical-assets-selector__header {
    padding: 16px;
  }
}
</style>
