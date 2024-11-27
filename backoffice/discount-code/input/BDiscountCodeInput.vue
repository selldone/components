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
    v-model:search="search"
    :customFilter="() => true"
    :items="discount_codes"
    :label="$t('global.commons.discount_code')"
    :loading="busy"
    :messages="
      modelValue && modelValue.description ? modelValue.description : ''
    "
    :model-value="modelValue"
    :variant="variant"
    clearable
    item-title="title"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    @click:clear="
      $emit('click:clear');
      getDiscounts();
    "
    :return-object="returnObject"
  >
    <template v-slot:selection="{ item }">
      <v-avatar class="text-white bg-red m-2 small" size="32">
        %{{ item.raw.percent }}
      </v-avatar>
      {{ item.raw.title }}

      <small class="mx-1">
        {{ $t("global.commons.limit") }}:
        {{ item.raw.limit }}
        {{ item.raw.currency }}
      </small>

      <small class="mx-1">
        {{ $t("global.commons.max") }}:
        {{ item.raw.max === -1 ? $t("global.commons.infinite") : item.raw.max }}
      </small>
    </template>
    <template v-slot:item="{ item, props }">
      <v-list-item :title="item.raw.title" class="text-start" v-bind="props">
        <template v-slot:prepend>
          <v-avatar class="text-white bg-red m-2 small" size="32">
            %{{ item.raw.percent }}
          </v-avatar>
        </template>

        <v-list-item-subtitle>
          {{ $t("global.commons.limit") }}:
          {{ item.raw.limit }}
          {{ item.raw.currency }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script lang="ts">
import { throttle } from "lodash-es";

export default {
  name: "BDiscountCodeInput",
  emits: ["update:modelValue"],
  components: {},
  inject: ["$shop"],
  props: {
    modelValue: {},
    activeOnly: {
      default: false,
      type: Boolean,
    },
    currency: {},
    variant: {
      default: "underlined",
    },
    returnObject:Boolean,

  },

  data() {
    return {
      // Discount:
      discount_codes: [],
      total: false,

      busy: false,
      search: null,
    };
  },

  watch: {
    search: throttle(function (newVal, oldVal) {
      this.getDiscounts();
    }, window.SERACH_THROTTLE),
  },

  created() {
    this.getDiscounts();
  },

  methods: {
    getDiscounts() {
      this.busy = true;
      axios
        .get(window.API.GET_DISCOUNT_CODES(this.$shop.id), {
          params: {
            // Must contain this id:
            contain:
              this.modelValue && this.isObject(this.modelValue)
                ? this.modelValue.id
                : this.modelValue,
            search: this.search,

            offset: 0,
            count: 20,

            active_only: this.activeOnly,
            compact: true,

            currency: this.currency,
          },
        })
        .then(({ data }) => {
          this.discount_codes = data.discount_codes;
          this.total = data.total;

          const val = this.discount_codes.find((discount) => {
            return (
              discount.id ===
              (this.modelValue && this.isObject(this.modelValue)
                ? this.modelValue.id
                : this.modelValue)
            );
          });

          this.$emit("update:modelValue", val);
          if (this.modelValue && !val) {
            // Value not found auto call click clear!
            this.$emit("click:clear");
          }
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
