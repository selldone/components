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
  <div v-if="variant_assets?.length">
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
  methods: {
    showDialog() {
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

<style lang="scss" scoped></style>
