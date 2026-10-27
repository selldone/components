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

  <v-card :class="{ 'b-property-set-add--modern sd-modern-canvas text-start': modern }">
    <v-card-title class="d-flex align-center" :class="{ 'b-property-set-add__title': modern }">
      <v-icon class="me-2">hive</v-icon>

      {{ propertySet ? $t('property_set_add.edit_title') : $t('property_set_add.add_title') }}
    </v-card-title>
    <v-card-text :class="{ 'b-property-set-add__body': modern }">
      <div :class="modern ? 'sd-modern-widget sd-modern-form mb-5' : 'widget-box mb-5'">
        <u-widget-header
          icon="tune"
          :class="{ 'sd-modern-form-header': modern }"
          :title="$t('global.commons.general_config')"
        ></u-widget-header>
        <v-list-subheader :class="{ 'b-property-set-add__description': modern }">
          {{$t('property_set_add.config.subtitle')}}

        </v-list-subheader>

        <v-text-field
          v-model="title"
          :label="$t('global.commons.title')"
          variant="underlined"
          :placeholder="$t('property_set_add.inputs.title.placeholder') "
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
          :placeholder="$t('property_set_add.inputs.description.placeholder') "
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

      <div :class="modern ? 'sd-modern-widget sd-modern-form mb-5' : 'widget-box mb-5'">
        <u-widget-header
          icon="fa:fas fa-cubes-stacked"
          :class="{ 'sd-modern-form-header': modern }"
          :title="$t('property_set_add.variants.title') "
        ></u-widget-header>
        <v-list-subheader :class="{ 'b-property-set-add__description': modern }">
          {{$t('property_set_add.variants.subtitle')}}
        </v-list-subheader>

        <u-smart-switch
          v-model="custom_variants"
          :true-title="$t('property_set_add.inputs.custom_variants.true_title')"
          :false-title="$t('property_set_add.inputs.custom_variants.false_title')"
          :true-description="$t('property_set_add.inputs.custom_variants.true_description')"
          :false-description="$t('property_set_add.inputs.custom_variants.false_description')"
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

              <div class="mt-1">Fontawesome (V6) sample:</div>
              <div class="my-1">
                <v-icon class="me-2" size="small">fa:fas fa-toolbox</v-icon>
                <code>fa:fas fa-toolbox</code>
              </div>
            </div>
          </div>
        </v-expand-transition>
      </div>
    </v-card-text>
    <v-card-actions :class="{ 'sd-modern-form-actions': modern }">
      <div class="widget-buttons">
        <v-btn
          :class="{ 'sd-modern-button': modern }"
          size="x-large"
          variant="text"
          @click="close"
          prepend-icon="close"
        >
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="propertySet?.id"
          :class="{ 'sd-modern-button': modern }"
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
          :class="{ 'sd-modern-button': modern }"
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
    modern: Boolean,
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

<style lang="scss" scoped>
.b-property-set-add--modern {
  .b-property-set-add__title { padding: 24px 28px; font-size: 21px; font-weight: 600; line-height: 1.35; white-space: normal; }
  .b-property-set-add__body { padding: 0 28px 20px; }
  :deep(.b-property-set-add__description) { min-height: 0; padding: 0; margin-block-end: 20px; font-size: 13px; line-height: 1.6; overflow: visible; }
  :deep(.b-property-set-add__description > .v-list-subheader__text) { white-space: normal; overflow: visible; text-overflow: clip; }
}
@media (max-width: 599px) {
  .b-property-set-add--modern {
    .b-property-set-add__title { padding: 20px 16px; font-size: 19px; }
    .b-property-set-add__body { padding-inline: 12px; }
  }
}
</style>
