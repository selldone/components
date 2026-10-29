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
    v-if="modern && show_modern_schedule"
    class="s-order-auto-complete-modern text-start"
  >
    <v-icon size="20" aria-hidden="true">schedule</v-icon>
    <div class="s-order-auto-complete-modern__description">
      <span>{{ $t("process_center.modern.virtual_auto_complete") }}</span>
      <p>{{ $t("process_center.modern.virtual_auto_complete_message") }}</p>
    </div>
    <u-count-down
      :end="auto_complete_at"
      class="s-order-auto-complete-modern__countdown"
    />
  </div>
  <div v-else-if="!modern && auto_complete_at" class="py-3 text-start small">
    <v-icon class="me-1" size="small">hourglass_top</v-icon>
    {{ $t("global.commons.auto_complete") }}:<br />
    <u-count-down
      :end="auto_complete_at"
      class="ms-2 inline-block vertical-align-middle"
    ></u-count-down>
  </div>
</template>

<script lang="ts">
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import UCountDown from "../../../ui/count-down/UCountDown.vue";
import { Basket } from "@selldone/core-js";

export default {
  name: "SOrderDeliveryAutoComplete",
  components: { UCountDown },
  props: {
    modern: { type: Boolean, default: false },
    basket: {
      required: true,
    },
  },
  computed: {
    show_modern_schedule() {
      return (
        !!this.auto_complete_at &&
        this.basket.status === Basket.Status.Payed.code &&
        !this.basket.reject &&
        this.basket.delivery_state ===
          Basket.PhysicalOrderStates.PreparingOrder.code
      );
    },
    auto_complete_at() {
      return (
        this.basket.auto_complete_at &&
        DateConverter.convertToLocalTime(this.basket.auto_complete_at)
      );
    },
  },
};
</script>

<style scoped lang="scss">
.s-order-auto-complete-modern {
  display: flex;
  align-items: center;
  gap: 11px;
  padding-block: 18px;
  font-family: inherit;
  font-size: 12px;
  line-height: 18px;
  > .v-icon {
    color: var(--sd-modern-muted);
    flex: none;
  }
  &__description {
    flex: 1;
    min-width: 0;
  }
  &__description > p {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__countdown {
    flex: 0 1 auto;
    color: var(--sd-modern-muted);
  }
  &__countdown :deep(.digit) {
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }
  &__countdown :deep(.text) {
    font-family: inherit;
    font-size: 11px;
    font-weight: 400;
    line-height: 17px;
  }
  &__countdown :deep(li:after) {
    font-size: 16px;
    line-height: 20px;
  }
  @media (max-width: 600px) {
    flex-wrap: wrap;
    &__countdown {
      margin-inline-start: 31px;
    }
  }
}
</style>
