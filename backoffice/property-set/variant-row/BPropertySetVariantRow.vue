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
  <div v-if="modelValue" class="position-relative">
    <v-chip
      v-if="modelValue.name || modelValue.icon"
      size="x-small"
      color="#aaa"
      class="position-absolute px-1 pen"
      style="right: 12px; top: -6px; z-index: 1"
      label
      variant="flat"
      density="compact"
      >{{ $t("global.commons.override") }}
    </v-chip>
    <v-list-item slim>
      <template v-slot:prepend>
        <div style="max-width: 24px; width: 24px">
          <v-icon v-if="modelValue.icon" color="#111"
            >{{ modelValue.icon }}
          </v-icon>
          <v-icon v-else color="#111">{{ product_variant_obj.icon }}</v-icon>
        </div>
      </template>
      <v-row align="center" no-gutters>
        <v-col>
          <v-text-field
            v-model="modelValue.name"
            :placeholder="$t(product_variant_obj.name)"
            :prefix="`${getName(product_variant_obj.code)}: `"
            flat
            hide-details
            persistent-placeholder
            variant="solo"
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            v-model="modelValue.icon"
            :placeholder="product_variant_obj.icon"
            flat
            hide-details
            persistent-placeholder
            :prefix="`${$t('global.commons.icon')}: `"
            variant="solo"
            density="compact"
          >
          </v-text-field>
        </v-col>
        <v-icon class="attr--handle" style="min-width: 48px; cursor: move"
          >drag_indicator
        </v-icon>
      </v-row>
    </v-list-item>
    <div class="px-2">
      <v-combobox
        v-model="modelValue.values"
        variant="solo"
        density="comfortable"
        :label="$t('global.commons.values')"
        :placeholder="$t('property_set_variant_row.inputs.values.placeholder') "
        multiple
        chips
        closable-chips
        clearable
        :messages="$t('property_set_variant_row.inputs.values.messages') "
      >
        <template v-slot:chip="{ props, index }">
          <v-chip v-bind="props" @click="openEditDialog(index)"> </v-chip>
        </template>
      </v-combobox>

      <!-- Edit Dialog -->
      <v-dialog v-model="editDialog" max-width="640">
        <v-card class="text-start">
          <v-card-title>Edit Value</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="editedValue"
              label="Edit text"
              placeholder="Enter new value"
              variant="outlined"
              autofocus
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="secondary" @click="cancelEdit" prepend-icon="close">{{
              $t("global.actions.cancel")
            }}</v-btn>
            <v-btn
              color="#000"
              @click="saveEdit"
              prepend-icon="check"
              variant="flat"
              >{{ $t("global.actions.set") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { ProductVariants } from "@selldone/core-js/enums/product/ProductVariants.ts";

export default {
  name: "BPropertySetVariantRow",
  mixins: [],

  components: {},
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      editDialog: false, // Controls the dialog visibility
      editedValue: "", // Holds the value being edited
      editingIndex: null, // Index of the value being edited
    };
  },

  computed: {
    product_variant_obj() {
      return ProductVariants[this.modelValue.code];
    },
  },

  watch: {},
  created() {},
  methods: {
    openEditDialog(index) {
      // Open the dialog with the selected value
      this.editingIndex = index;
      this.editedValue = this.modelValue.values[index];
      this.editDialog = true;
    },
    saveEdit() {
      // Save the edited value and close the dialog
      if (this.editingIndex !== null) {
        this.modelValue.values.splice(this.editingIndex, 1, this.editedValue);
      }
      this.editDialog = false;
      this.resetEdit();
    },
    cancelEdit() {
      // Close the dialog without saving changes
      this.editDialog = false;
      this.resetEdit();
    },

    resetEdit() {
      // Reset edit dialog fields
      this.editedValue = "";
      this.editingIndex = null;
    },
  },
};
</script>

<style lang="scss" scoped></style>
