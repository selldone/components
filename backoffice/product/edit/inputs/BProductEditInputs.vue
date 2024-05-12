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
  <div>
    <div class="widget-box mb-5 mt-5">
      <s-widget-header
        :title="$t('add_product.inputs_edit.title')"
        icon="feed"
      ></s-widget-header>
      <v-list-subheader
        >{{ $t("add_product.inputs_edit.sub_title") }}
      </v-list-subheader>

      <v-textarea
        v-model="product.message"
        :counter="256"
        :disabled="add_by_dropShipping"
        :label="$t('add_product.inputs_edit.message_input')"
        :messages="$t('add_product.inputs_edit.message_input_message')"
        auto-grow
        rows="3"
        variant="underlined"
      />
    </div>

    <s-form-builder
      v-if="product.inputs"
      v-model:structure="product.inputs"
      :class="{ disabled: add_by_dropShipping }"
      :title="$t('add_product.inputs_edit.inputs_form')"
      class="mb-5"
      has-file
      hint="You have the option to set up a personalized form to gather details from your customers when they're ready to place an order."
      icon="input"
    />

    <s-widget-buttons auto-fixed-position class="mt-8">
      <v-btn
        :loading="busy"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="$emit('next')"
      >
        {{ $t("global.actions.save_continue") }}

        <v-icon class="ms-2" size="small">
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </s-widget-buttons>
  </div>
</template>

<script>
import SFormBuilder from "../../../../ui/form/SFormBuilder.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "ProductEditInputs",
  components: {SWidgetButtons, SFormBuilder },
  props: {
    product: {
      required: true,
      type: Object,
    },
    busy: {},
  },

  data: () => ({}),
  computed: {
    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
  },

  created() {},

  methods: {},
};
</script>

<style scoped></style>
