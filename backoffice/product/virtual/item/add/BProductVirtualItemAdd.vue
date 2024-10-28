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
  <v-card class="text-start">
    <v-card-title class="d-flex align-center">
      {{
        virtualItem
          ? $t("add_virtual_item.title_edit")
          : $t("add_virtual_item.title_add")
      }}
      <variant-item-view-micro
        v-if="selected_variant"
        :product-variant="selected_variant"
        class="mx-2"
      ></variant-item-view-micro>
      <v-spacer></v-spacer>
      <v-btn
        v-if="!virtualItem"
        class="ms-1"
        icon
        variant="text"
        @click="$emit('update:expand', !expand)"
      >
        <v-icon>{{ expand ? "close_fullscreen" : "open_in_full" }}</v-icon>
      </v-btn>

      <v-btn class="ms-1" icon variant="text" @click="$emit('close')">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-subtitle>
      {{ $t("add_virtual_item.sub_title") }}
    </v-card-subtitle>

    <v-card-text>
      <div
        v-if="!virtualItem"
        :class="{ '-x-large': expand }"
        class="widget-box mb-5"
      >
        <u-widget-header
          :add-caption="$t('add_virtual_item.edit_outputs')"
          :to="{
            name: 'BPageProductEdit',
            params: { product_id: product.id },
            hash: '#outputs',
          }"
          add-icon="edit"
          add-text
          icon="support"
          title="Guid"
        ></u-widget-header>

        {{ $t("add_virtual_item.message") }}

        <div v-if="!virtualItem" class="py-2 text-end">
          <v-btn class="tnt" color="primary" @click="bulk = !bulk">
            <img
              v-if="!bulk"
              class="me-1"
              height="20"
              src="../../../../../assets/file/excel.svg"
              width="20"
            />
            <v-icon v-else class="me-1" size="20">keyboard</v-icon>
            {{ bulk ? "Switch to manual mode" : "Switch to bulk mode" }}
          </v-btn>

          <v-alert v-if="!outputs?.length" class="mt-3 text-start">
            <v-icon class="me-1">info</v-icon>
            You did not define the data structure in the output form.
          </v-alert>

          <v-expand-transition>
            <div v-if="bulk">
              <div class="my-5 text-start">
                <b>Csv file template:</b>
                <v-table class="rounded-lg overflow-hidden mt-2" dense>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th
                          v-for="(out, i) in outputs"
                          :key="i"
                          :title="out.title"
                        >
                          <b v-copy>{{ out.name }}</b>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="x in 3" :key="'x' + x">
                        <td
                          v-for="(out, i) in outputs"
                          :key="i"
                          class="text-muted"
                        >
                          <i>your value</i>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-table>
              </div>
            </div>
          </v-expand-transition>
        </div>
      </div>

      <div :class="{ '-x-large': expand }" class="widget-box mb-5">
        <u-widget-header
          :icon="bulk ? 'summarize' : 'feed'"
          :title="!bulk ? 'Manual mode' : 'Bulk mode'"
        ></u-widget-header>

        <v-list-subheader>
          <div>
            <div>
              You can fill in values in the Output form on the order page. So,
              we strongly recommend filling in these values after you make sure
              payment is completed and is not a fraud.
            </div>
            <div class="text-green font-weight-bold mt-2">
              <v-icon class="me-1" color="green" size="small"
                >enhanced_encryption
              </v-icon>
              These values will be shown to the customer after payment is
              completed.
            </div>
          </div>
        </v-list-subheader>
        <v-progress-linear
          v-if="busy_send"
          :model-value="progress"
          class="absolute-top-center"
          color="green"
          height="4"
          rounded
          stream
          striped
          style="width: 80%"
        ></v-progress-linear>

        <b-product-variant-input
          v-if="product.product_variants?.length"
          v-model="selected_variant"
          :label="$t('global.commons.variant')"
          :product-variants="product.product_variants"
          class="max-widget-width mx-auto"
          return-object
          variant="solo"
        ></b-product-variant-input>

        <v-scroll-y-reverse-transition hide-on-leave>
          <!-- ███████████████████ Add bulk ███████████████████ -->

          <div
            v-if="bulk && !virtualItem"
            key="1"
            :class="{ disabled: busy_send }"
          >
            <b-spreadsheet-virtual-items
              v-if="!show_report"
              ref="spreadsheet"
              :product="product"
              class="mb-3"
              @update:valid="(val) => (is_valid = val)"
            ></b-spreadsheet-virtual-items>

            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ STEP 3 : Send dataset to the server ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

            <div v-if="show_report">
              <!-- Results -->
              <v-container class="text-center">
                <v-row>
                  <v-col cols="12" sm="4">
                    <p class="m-0 small">
                      <v-icon class="me-1" size="small">add</v-icon>
                      {{ $t("global.actions.add") }}
                    </p>
                    <h2 class="text-success text-h3">{{ result_add }}</h2>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <p class="m-0 small">
                      <v-icon class="me-1" size="small"
                        >published_with_changes
                      </v-icon>
                      {{ $t("global.actions.update") }}
                    </p>
                    <h2 class="text-blue text-h3">{{ result_update }}</h2>
                  </v-col>

                  <v-col cols="12" sm="4">
                    <p class="m-0 small">
                      <v-icon class="me-1" size="small">error</v-icon>
                      {{ $t("global.commons.fail") }}
                    </p>
                    <h2 class="text-danger text-h3">{{ result_fails }}</h2>
                  </v-col>
                </v-row>
              </v-container>

              <!-- Errors list -->
              <div class="border-between-vertical my-3">
                <div
                  v-for="(error, i) in errors"
                  :key="i"
                  class="px-x py-1 small"
                >
                  <v-icon class="me-1" color="red" size="small">error</v-icon>
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <!-- ███████████████████ Add manually ███████████████████ -->

          <div v-else key="2" class="max-width-field-large mx-auto mt-5">
            <div v-for="item in product.outputs" :key="item.name">
              <!-- Normal -->
              <v-text-field
                v-if="!item.type"
                v-model="new_virtual_product_data[item.name]"
                :counter="256"
                :label="item.title"
                variant="underlined"
              />

              <!-- Select -->
              <v-select
                v-if="item.type === 'select'"
                v-model="new_virtual_product_data[item.name]"
                :items="item.selects"
                :label="item.title"
                variant="underlined"
              />
            </div>
          </div>
        </v-scroll-y-reverse-transition>
      </div>
    </v-card-text>

    <v-card-actions>
      <div v-if="!virtualItem && bulk" class="widget-buttons">
        <v-btn
          v-if="!show_report"
          :disabled="!is_valid"
          :loading="busy_send"
          color="primary"
          size="x-large"
          variant="flat"
          @click="addBulk"
        >
          {{ $t("global.actions.continue") }}
          <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
        </v-btn>
        <v-btn
          v-else
          color="primary"
          size="x-large"
          variant="flat"
          @click="endBulk"
        >
          {{ $t("global.actions.close") }}
          <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
        </v-btn>
      </div>

      <div v-else class="widget-buttons">
        <v-btn
          v-if="virtualItem"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="editVirtualProduct()"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <v-btn
          v-else
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="addVirtualItem()"
        >
          <v-icon start>add</v-icon>

          {{ $t("global.actions.add") }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import BSpreadsheetVirtualItems from "../../../../spreadsheet/virtual-items/BSpreadsheetVirtualItems.vue";

import BProductVariantInput from "../../../../product/variants/input/BProductVariantInput.vue";
import VariantItemViewMicro from "../../../../../storefront/product/variant/VariantItemViewMicro.vue";

export default {
  name: "BProductVirtualItemAdd",
  components: {
    VariantItemViewMicro,
    BProductVariantInput,

    BSpreadsheetVirtualItems,
  },
  props: {
    product: {
      required: true,
      type: Object,
    },
    virtualItem: {
      // Edit mode!
      required: false,
      type: Object,
    },

    expand: { type: Boolean },
  },

  data: () => ({
    message: null,

    new_virtual_product_data: {},

    busy: false,
    bulk: false,

    //-----------------
    is_valid: false,

    progress: 0,
    busy_send: false,

    result_success: 0,
    result_fails: 0,
    result_add: 0,
    result_update: 0,

    errors: [],

    show_report: false,

    //-----------------
    selected_variant: null,
  }),

  computed: {
    outputs() {
      return this.product.outputs;
    },
  },

  watch: {
    virtualItem() {
      this.reAssignData();
    },
  },
  created() {
    this.reAssignData();
  },

  methods: {
    reAssignData() {
      if (this.virtualItem) {
        this.new_virtual_product_data = this.virtualItem.data;
        this.selected_variant = this.product.product_variants?.find(
          (v) => v.id === this.virtualItem.variant_id,
        );
      }

      if (
        !this.new_virtual_product_data ||
        Array.isArray(this.new_virtual_product_data)
      ) {
        this.new_virtual_product_data = {};
      }
    },

    addVirtualItem() {
      this.busy = true;
      axios
        .post(
          window.API.POST_ADD_VIRTUAL_ITEM(
            this.product.shop_id,
            this.product.id,
          ),
          {
            variant_id: this.selected_variant ? this.selected_variant.id : null,
            data: this.new_virtual_product_data,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t("add_virtual_item.notifications.add_success"),
            );
            this.$emit("add", data.virtual_item);
            Object.assign(this.product, data.product); // ⚡ Update product.

            Object.assign(this.$data, this.$options.data()); // Reset values.
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    editVirtualProduct() {
      this.busy = true;

      axios
        .put(
          window.API.EDIT_VIRTUAL_ITEM(
            this.product.shop_id,
            this.product.id,
            this.virtualItem.id,
          ),
          {
            variant_id: this.selected_variant ? this.selected_variant.id : null,
            data: this.new_virtual_product_data,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t("add_virtual_item.notifications.edit_success"),
            );
            this.$emit("edit", data.virtual_item);
            this.$emit("close"); // CLose after edit completed!
            const selected_variant = this.selected_variant; // Keep last selected variant
            this.resetToDefault(); // 🞇 Reset to default
            this.selected_variant = selected_variant;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    addBulk() {
      this.busy_send = true;
      this.progress = 0;

      const chunk = 20;

      this.$refs.spreadsheet.generateItemsJson(
        async (values, progress, is_end) => {
          console.log("%" + Math.round(progress), "values", values);
          if (values.length <= 1) {
            // Length 1: just header & no dataset!
            if (is_end) {
              this.show_report = true;
              this.busy_send = false;
              this.$emit("refresh"); // Force refresh list!
            }
            return;
          }

          await axios
            .post(
              window.API.POST_VIRTUAL_ITEM_BULK(
                this.product.shop_id,
                this.product.id,
              ),
              {
                dataset: values,
              },
            )
            .then(({ data }) => {
              if (data.error) {
                this.showErrorAlert(null, data.error_msg);
              } else {
                this.result_success += data.success_count;
                this.result_fails += data.fail_count;

                this.result_add += data.add;
                this.result_update += data.update;

                this.errors.push(...data.errors);

                Object.assign(this.product, data.product); // ⚡ Update product.
              }
              console.log("axios then", data);
            })
            .catch((error) => {
              this.showLaravelError(error);
            })

            .finally(() => {
              this.progress = progress;

              if (is_end) {
                this.show_report = true;
                this.busy_send = false;
                this.$emit("refresh"); // Force refresh list!
              }
            });
        },
        chunk,
        1000,
        () => {
          this.showErrorAlert(null, "Data set is invalid!");
          this.busy_send = false;
        },
      );
    },

    endBulk() {
      this.$emit("close"); // Close after edit completed!
      this.resetToDefault(); // 🞇 Reset to default
    },
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-size: 1.6rem;
}

.input-list {
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
}
</style>
