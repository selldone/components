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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ███████████████████████ Add\Edit Property Set ███████████████████████ -->

  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">hive</v-icon>

      {{ propertySet ? "Edit Property Set" : "Add Property Set" }}
    </v-card-title>
    <v-card-text>
      <div class="widget-box mb-5">
        <u-widget-header
          icon="tune"
          :title="$t('global.commons.general_config')"
        ></u-widget-header>
        <v-list-subheader>
          Set title and description for your property set. It will be visible to
          staff only.
        </v-list-subheader>

        <v-text-field
          v-model="title"
          :label="$t('global.commons.title')"
          variant="underlined"
          placeholder="Enter a title for property set..."
          persistent-placeholder
          messages=" "
        >
          <template v-slot:message>
            <u-smart-suggestion
              :samples="$tm('suggestions.property_set.title')"
              @select="(v) => (title = v)"
            ></u-smart-suggestion>
          </template>
        </v-text-field>

        <v-text-field
          v-model="description"
          :label="$t('global.commons.description')"
          variant="underlined"
          placeholder="Enter a short description... (optional)"
          persistent-placeholder
          messages=" "
        >
          <template v-slot:message>
            <u-smart-suggestion
              :samples="$tm('suggestions.property_set.description')"
              @select="(v) => (description = v)"
            ></u-smart-suggestion>
          </template>
        </v-text-field>
      </div>

      <div class="widget-box mb-5">
        <u-widget-header
          icon="fa:fas fa-cubes-stacked"
          title="Variants"
        ></u-widget-header>
        <v-list-subheader>
          You can customize the variant name, icon, and order here. If you have
          a variety of products with unique variants that don’t fit default 6
          variants, you can set custom variants for each product here.
        </v-list-subheader>

        <u-smart-switch
          v-model="custom_variants"
          true-title="Custom Variants"
          false-title="Default Variants"
          true-description="Customize your product variants."
          false-description="Use default global variants."
          false-gray
          class="mb-5"
        >
        </u-smart-switch>

        <v-expand-transition>
          <div v-if="custom_variants">
            <v-list
              class="rounded-18px "
              density="compact"
            >
              <draggable
                v-model="variants"
                itemKey="code"
                ghostClass="ghost"
                handle=".attr--handle"
                style="list-style-type: none"
                class="border-between-vertical"
                tag="div"
                animation="200"
              >
                <template v-slot:item="{ element }">
                  <b-property-set-variant-row
                    :key="element.code"
                    :model-value="element"
                    class="pb-2"
                  >
                  </b-property-set-variant-row>
                </template>
              </draggable>
            </v-list>

            <div class="text-start pa-3 small">
              <div>
                Google font sample:

                <v-btn
                  class="tnt"
                  color="#000"
                  href="https://fonts.google.com/icons?selected=Material+Icons"
                  target="_blank"
                  variant="text"
                  append-icon="open_in_new"
                  size="x-small"
                  >Icons list
                </v-btn>
              </div>
              <div class="my-1">
                <v-icon class="me-2" size="small">tapas</v-icon>
                <code>tapas</code>
              </div>

              <div class="mt-1">Fontawesome (V5) sample:</div>
              <div class="my-1">
                <v-icon class="me-2" size="small">fa:fas fa-toolbox</v-icon>
                <code>fa:fas fa-toolbox</code>
              </div>
            </div>
          </div>
        </v-expand-transition>
      </div>
    </v-card-text>
    <v-card-actions>
      <div class="widget-buttons">
        <v-btn
          size="x-large"
          variant="text"
          @click="close"
          prepend-icon="close"
        >
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="propertySet?.id"
          :loading="busy"
          color="primary"
          size="x-large"
          @click="editPropertySet()"
          variant="elevated"
          prepend-icon="save"
        >
          {{ $t("global.actions.save_changes") }}
        </v-btn>
        <v-btn
          v-else
          :loading="busy"
          color="primary"
          size="x-large"
          @click="addPropertySet()"
          variant="elevated"
          prepend-icon="save"
        >
          {{ $t("global.actions.add") }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { ProductVariants } from "@selldone/core-js/enums/product/ProductVariants.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import BPropertySetVariantRow from "@selldone/components-vue/backoffice/property-set/variant-row/BPropertySetVariantRow.vue";
import USmartSwitch from "@selldone/components-vue/ui/smart/switch/USmartSwitch.vue";
import { defineAsyncComponent } from "vue";
import USmartSuggestion from "@selldone/components-vue/ui/smart/suggestion/USmartSuggestion.vue";

export default {
  name: "BPropertySetAdd",
  mixins: [],

  inject: ["$shop"],
  components: {
    USmartSuggestion,
    USmartSwitch,
    BPropertySetVariantRow,
    draggable: defineAsyncComponent(() => import("vuedraggable")),
  },
  emits: ["add", "edit", "close"],
  props: {
    propertySet: {
      type: Object,
    },
  },
  data() {
    return {
      ProductVariants: ProductVariants,

      title: null,
      description: null,
      variants: [],
      custom_variants: false,

      busy: false,
    };
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {
    propertySet() {
      this.init();
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {

      this.title = this.propertySet?.title;
      this.description = this.propertySet?.description;

      this.custom_variants = !!this.propertySet?.variants;

      this.variants = this.propertySet?.variants;
      if (!Array.isArray(this.variants)) this.variants = [];
      else {
        // Deep clone
        this.variants = JSON.parse(JSON.stringify(this.variants));
      }

      Object.values(ProductVariants).forEach((variant) => {
        if (!this.variants.find((v) => v.code === variant.code)) {
          this.variants.push({
            code: variant.code,
            name: null,
            icon: null,
          });
        }
      });
    },
    addPropertySet() {
      this.busy = true;
      axios
        .post(window.API.POST_ADD_PROPERTY_SET(this.$shop.id), {
          title: this.title,
          description: this.description,
          variants: this.custom_variants ? this.variants : null,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("add", data.property_set);

            this.close();

            NotificationService.showSuccessAlert(
              null,
              "Property set has been added successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    editPropertySet() {
      this.busy = true;
      axios
        .put(
          window.API.PUT_EDIT_PROPERTY_SET(this.$shop.id, this.propertySet.id),
          {
            title: this.title,
            description: this.description,
            variants: this.custom_variants ? this.variants : null,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("edit", data.property_set);

            this.close();

            NotificationService.showSuccessAlert(
              null,
              "Property set has been updated successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    close() {
      this.$emit("close", true);
    },
  },
};
</script>

<style lang="scss" scoped></style>
