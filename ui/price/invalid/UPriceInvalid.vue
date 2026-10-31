<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <!-- ⛔ UPriceInvalid -->
  <v-tooltip
    v-if="!is_valid_amount"
    :activator="embedMode ? undefined : 'parent'"
    :content-class="embedMode ? 'text-start' : 'text-start bg-black'"
    :location="embedMode ? 'top' : 'bottom'"
    :open-on-click="embedMode"
    max-width="320"
  >

<template v-slot:activator="{ props }">
  <component
    :is="embedMode ? 'button' : 'b'"
    :type="embedMode ? 'button' : undefined"
    v-bind="embedMode ? props : {}"
    class="d-inline-flex align-center"
    :class="{ 'x-small': small, 'text-red': !embedMode, 'u-price-invalid--embed': embedMode }"
  >
    <u-currency-icon
      v-if="currency"
      :currency="currency"
      flag-only
      small
      style="width: auto"
    ></u-currency-icon>
    <u-currency-icon
      v-if="current_currency && current_currency !== currency"
      :currency="current_currency"
      flag-only
      small
      style="width: auto"
      class="ms-n3"
    ></u-currency-icon>

    {{ $t(embedMode ? 'product_embed.price_unavailable' : 'global.commons.invalid') }}
    <v-icon v-if="embedMode" size="15" class="ms-1" aria-hidden="true">info_outline</v-icon>
  </component>
</template>


    <template v-if="embedMode">
      <p class="mb-2">{{ $t('product_embed.price_unavailable_help') }}</p>
      <bdi>{{ currency }}<template v-if="current_currency && current_currency !== currency"> → {{ current_currency }}</template></bdi>
    </template>
    <template v-else>
    <b>Invalid amount!</b> <br />
    {{
      `⚡ To address the issue, navigate to Shop > Accounting > Exchange > Add Exchange Rate.`
    }}
    <hr />
    <div>
      From Currency: <b>{{ currency }}</b>
      <br>
      To Currency: <b>{{ current_currency }}</b>
    </div>
    </template>
  </v-tooltip>

</template>

<script lang="ts">
import { defineComponent } from "vue";
import UCurrencyIcon from "@selldone/components-vue/ui/currency/icon/UCurrencyIcon.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

export default defineComponent({
  name: "UPriceInvalid",
  mixins: [CurrencyMixin],
  components: { UCurrencyIcon },
  props: {
    currency: {
      required: true,
    },
    small: Boolean,
    embedMode: { type: Boolean, default: false },
  },
  computed: {
    current_currency() {
      return this.GetUserSelectedCurrency()?.code;
    },
  },
});
</script>

<style scoped lang="scss">
.u-price-invalid--embed {
  min-width: 0;
  max-width: 100%;
  min-height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  font: inherit;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  text-align: start;
  white-space: normal;
  &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; border-radius: 4px; }
}
@media (max-width: 600px), (pointer: coarse) {
  .u-price-invalid--embed { min-height: 44px; }
}
</style>
