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
    :value="value"
    @input="(val) => $emit('input', correctValue(val))"
    :items="items"
    :placeholder="$t('global.commons.count')"
    :label="$t('global.commons.count')"
    :filled="filled"
    :solo="solo"
    :flat="flat"
    :loading="loading"
    :color="color"
    :hide-details="value <= max"
    :error-messages="value > max ? $t('global.commons.not_in_stock') : null"
    @change="
      (val) => {
        $emit('change', correctValue(val));
        $refs.self.blur();
      }
    "
    @keydown.enter="
      () => {
        $refs.self.blur();
      }
    "
    @focus="focus = true"
    @blur="focus = false"
    :search-input.sync="search"
    :filter="() => true"
    class="s--shop-basket-item-count-select"
    :dark="dark"
    :background-color="backgroundColor"
    @click="focus = true"
    ref="self"
    :disabled="disabled || loadingDelete"
    :dense="dense"
  >
    <template v-slot:item="{ item }">
      <span v-if="item">
        <span class="float-left mx-1">{{
          unit ? unit : $t("global.commons.count_unit")
        }}</span>
        {{ item }}
      </span>
      <span v-else>
        {{ $t("global.actions.delete") }}
      </span>
    </template>

    <template v-slot:selection="{ item }">
      <span v-if="item && !focus" :class="{ 'center-view': noUnit }">
        {{ item }}
        <small v-if="!noUnit" class="mx-1">{{
          unit ? unit : $t("global.commons.count_unit")
        }}</small>
      </span>
    </template>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Remove Button ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <template v-slot:prepend-inner v-if="hasDelete">
      <div class="delete-button-con" :style="{ '--delete-width':dense?'32px': '48px'}" :class="{ 'me-2': solo,'-rtl': $vuetify.rtl}">
        <v-btn
          title="Remove item from the cart."
          :loading="loadingDelete"
          @click.stop="$emit('click:delete')"
          class="delete-button border-end"
          depressed
          :color="backgroundColor"
          tile
        >
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </template>
  </v-combobox>
</template>

<script>
import NumberHelper from "@core/helper/number/NumberHelper";

export default {
  name: "SShopBasketItemCountSelect",
  props: {
    value: {},

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

    color:{},
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
    flat: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
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
  --delete-width:48px;
  --border-radius:12px;

}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-basket-item-count-select {
  overflow: hidden;
  border-radius: var(--border-radius) !important;
  font-weight: 700 !important;

  .center-view {
    text-align: center;
    width: 100%;
  }

  .delete-button-con{
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

    &.-rtl{
      .delete-button {
        left: unset;
        right: 0;
      }
    }
  }

}
</style>