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
  <v-combobox
    ref="self"
    v-model:search="search"
    :bg-color="backgroundColor"
    :color="color"
    :customFilter="() => true"
    :theme="dark ? 'dark' : 'light'"
    :density="dense ? 'compact' : undefined"
    :disabled="disabled || loadingDelete"
    :error-messages="
      modelValue > max ? $t('global.commons.not_in_stock') : undefined
    "
    :variant="
      variant ? variant : filled ? 'filled' : solo ? 'solo' : 'underlined'
    "
    :flat="flat"
    :hide-details="modelValue <= max"
    :items="items"
    :label="$t('global.commons.count')"
    :loading="loading"
    :model-value="modelValue"
    :placeholder="$t('global.commons.count')"
    class="s--shop-basket-item-count-select"
    @blur="focus = false"
    @update:modelValue="
      (val) => {
        $emit('change', correctValue(val));
        $refs.self.blur();
      }
    "
    @focus="focus = true"
    @update:model-value="(val) => $emit('update:modelValue', correctValue(val))"
    @keydown.enter="
      () => {
        $refs.self.blur();
      }
    "
    :rounded="rounded"
    :readonly="loadingDelete"
  >
    <template v-slot:item="{ item, props }">
      <v-list-item v-if="item.raw" v-bind="props">
        <template v-slot:title>
          {{ item.raw }}

          <small class="ms-1">{{
            unit ? unit : $t("global.commons.count_unit")
          }}</small>
        </template>
      </v-list-item>
      <v-list-item v-else v-bind="props" :title="$t('global.actions.delete')">
      </v-list-item>
    </template>

    <template v-slot:selection="{ item }">
      <span v-if="item.raw && !focus" :class="{ 'center-view': noUnit }">
        {{ item.raw }}
        <small v-if="!noUnit" class="mx-1">{{
          unit ? unit : $t("global.commons.count_unit")
        }}</small>
      </span>
    </template>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Remove Button ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <template v-if="hasDelete" v-slot:prepend>
      <div
        :class="{ 'me-2': solo, '-rtl': $vuetify.rtl }"
        :style="{ '--delete-width': dense ? '32px' : '48px' }"
        class="delete-button-con"
      >
        <v-btn
          :color="backgroundColor"
          :loading="loadingDelete"
          class="delete-button border-end"
          title="Remove item from the cart."
          variant="flat"
          @click.stop="$emit('click:delete')"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </template>
  </v-combobox>
</template>

<script>
import { NumberHelper } from "@core/helper/number/NumberHelper";

export default {
  name: "SShopBasketItemCountSelect",
  emits: ["change", "update:modelValue", "click:delete"],
  props: {
    modelValue: {},

    min: {
      default: 0,
    },
    max: {},
    loading: {},
    noUnit: {
      type: Boolean,
      default: false,
    },
    unit: {},
    disabled: {
      type: Boolean,
      default: false,
    },
    hasDelete: {
      type: Boolean,
      default: false,
    },
    loadingDelete: { type: Boolean },

    color: {},
    backgroundColor: {},
    dark: {
      type: Boolean,
      default: false,
    },
    filled: {
      type: Boolean,
      default: false,
    },
    solo: {
      type: Boolean,
      default: false,
    },
    variant: {},
    flat: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    rounded: {},
  },
  data: () => {
    return {
      focus: false,
      search: null,
    };
  },

  computed: {
    items() {
      let N = Math.min(this.max, 20);

      let multi = 1;
      if (this.min >= 10) multi = 10;
      if (this.min >= 100) multi = 100;
      if (this.min >= 1000) multi = 1000;

      let foo = [];
      for (let i = 0; i <= N; i++) {
        foo.push(i * multi + this.min);
      }
      return foo;
    },
  },

  methods: {
    correctValue(val) {
      let out = NumberHelper.toEnglishFloat(val, 0);
      if (out > this.max) out = this.max;
      if (out < this.min) out = this.min;
      return out;
    },
  },
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-basket-item-count-select {
  --delete-width: 48px;
  //  --border-radius: 12px;
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-basket-item-count-select {
  overflow: hidden;
  position: relative;
  font-weight: 700 !important;

  .center-view {
    text-align: center;
    width: 100%;
  }

  .delete-button-con {
    width: var(--delete-width);

    .delete-button {
      position: absolute;
      top: 0;
      bottom: 0;
      margin: 0;
      left: 0;
      min-width: var(--delete-width) !important;
      width: var(--delete-width);
      height: 100% !important;
    }

    &.-rtl {
      .delete-button {
        left: unset;
        right: 0;
      }
    }
  }

  &.v-input.v-input--horizontal .v-input__prepend {
    margin: 0;
    margin-inline-end: 0;
  }
}
</style>
