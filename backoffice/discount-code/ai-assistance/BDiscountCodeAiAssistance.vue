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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ███████████████████████ Discount Code > AI ███████████████████████ -->
  <b-ai-assistance
    :endpoint="window.API.POST_CREATE_DISCOUNT_CODE_AI(shop.id)"
    :model-value="modelValue"
    :shop="shop"
    error-message="I can not create discount code now."
    has-currency
    success-message="The discount code was created successfully."
    title="Talk to me, I am here to help you with creating discount codes."
    @response="({ discount_code }) => $emit('discount-code', discount_code)"
    @update:model-value="(value) => $emit('update:modelValue', value)"
  >
    <template v-slot:tips>
      <p class="op-0-5">
        <b>How it works:</b> Press the record button, then speak your request.
        for example, "Create a discount code with 20% discount and 100 USD
        limit. The code should be valid for 30 days. and just 100 times can be
        used."
      </p>
    </template>
  </b-ai-assistance>
</template>

<script lang="ts">
import { RouteMixin } from "../../../mixin/route/RouteMixin.ts";
import BAiAssistance from "../../ai/assistance/BAiAssistance.vue";

export default {
  name: "BDiscountCodeAiAssistance",
  mixins: [RouteMixin],
  emits: ["discount-code", "update:modelValue"],
  components: {
    BAiAssistance,
  },

  props: {
    modelValue: {},

    shop: {
      required: true,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {},

  watch: {},

  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped></style>
