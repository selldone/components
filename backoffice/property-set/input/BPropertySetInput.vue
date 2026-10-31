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
  <component
    :is="modern ? 'VAutocomplete' : 'VCombobox'"
    v-model:search="search"
    :customFilter="() => true"
    :items="property_sets"
    :label="modern ? undefined : $t('global.commons.property_set')"
    :aria-label="modern ? $t('global.commons.property_set') : undefined"
    :loading="busy"
    :messages="modern ? undefined : description || undefined"
    :model-value="modelValue"
    :variant="variant"
    :disabled="disabled"
    :class="{ 'b-property-set-input--modern sd-modern-underlined-field': modern }"
    :placeholder="modern && !modelValue ? $t('product_property_set.modern.default_set') : undefined"
    :persistent-placeholder="modern"
    :menu-props="modern ? { contentClass: 'sd-modern-menu text-start' } : undefined"
    clearable
    item-title="title"
    item-value="id"
    @update:model-value="selectPropertySet"
    @click:clear="
      $emit('click:clear');
      getPropertySets();
    "
    :return-object="returnObject"
  >
    <template v-slot:selection="{ item }">
      <span :class="{ 'b-property-set-input__selection': modern }">{{ item.raw.title }}<v-tooltip v-if="modern" activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>{{ item.raw.title }}</v-tooltip></span>
      <img v-for="(it, index) in (modern ? item.raw.products?.slice(0, 3) : item.raw.products)?.map((x) => getShopImagePath(x.icon, 64))" :key="index" :src="it" :alt="item.raw.products?.[index]?.title || item.raw.title" width="20" height="20" class="ms-1 border rounded-sm">

    </template>
    <template v-slot:item="{ item, props }">
      <v-list-item
        :subtitle="item.raw.description"
        :class="modern ? 'b-property-set-input__option sd-modern-clickable-item text-start' : 'text-start'"
        v-bind="props"
      >
        <template v-slot:title>
          <span :class="{ 'b-property-set-input__title': modern }">{{item.raw.title}}</span>
          <img v-for="(it, index) in (modern ? item.raw.products?.slice(0, 3) : item.raw.products)?.map((x) => getShopImagePath(x.icon, 64))" :key="index" :src="it" :alt="item.raw.products?.[index]?.title || item.raw.title" width="20" height="20" class="ms-1 border rounded-sm">

        </template>
        <div v-if="modern && item.raw.variants?.length" class="b-property-set-input__axes">
          <span v-for="it in item.raw.variants" :key="it.code"><v-icon aria-hidden="true" size="16">{{ GetVariantIconByCode(it.code, { property_set: item.raw }) }}</v-icon>{{ $t(GetVariantNameByCode(it.code, { property_set: item.raw })) }}</span>
        </div>
        <template v-else-if="item.raw.variants">
          <v-chip
            v-for="it in item.raw.variants"
            :key="it.code"
            size="x-small"
            :prepend-icon="
              GetVariantIconByCode(it.code, { property_set: item })
            "
            style="margin: 1px"
            color="#fff"
            variant="flat"
          >
            {{ $t(GetVariantNameByCode(it.code, { property_set: item })) }}
          </v-chip>
        </template>
        <small v-else>{{ $t("global.commons.empty") }}</small>
      </v-list-item>
    </template>
  </component>
</template>

<script lang="ts">
import { throttle } from "lodash-es";
import { VAutocomplete, VCombobox } from "vuetify/components";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import {
  GetVariantIconByCode,
  GetVariantNameByCode,
} from "@selldone/core-js/enums/product/ProductVariants.ts";

export default {
  name: "BPropertySetInput",
  emits: ["update:modelValue", "click:clear"],
  components: { VAutocomplete, VCombobox },
  inject: ["$shop"],
  props: {
    modelValue: {},
    modern: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },

    variant: {
      default: "underlined",
    },
    returnObject: Boolean,
  },

  data() {
    return {
      GetVariantNameByCode: GetVariantNameByCode,
      GetVariantIconByCode: GetVariantIconByCode,

      property_sets: [],
      total: false,

      busy: false,
      search: null,
      request_id: 0,
      disposed: false,
    };
  },

  computed: {
    description(val) {
      if (!this.modelValue) return undefined;

      if (this.modelValue?.description) return this.modelValue.description;

      const obj = this.property_sets.find((it) => it.id === this.modelValue);

      return obj?.description;
    },
  },

  watch: {
    search: throttle(function (newVal, oldVal) {
      this.getPropertySets();
    }, window.SERACH_THROTTLE),
  },

  created() {
    this.getPropertySets();
  },
  beforeUnmount() {
    this.disposed = true;
  },

  methods: {
    selectPropertySet(value) {
      if (this.disabled) return;
      if (this.modern && value != null && (this.returnObject ? typeof value !== 'object' || value.id == null : !this.property_sets.some((item) => item.id === value))) return;
      this.$emit('update:modelValue', value);
    },
    getPropertySets() {
      if (this.modern && this.disposed) return;
      const request_id = ++this.request_id;
      this.busy = true;
      return axios
        .get(window.API.GET_PROPERTY_SETS(this.$shop.id), {
          params: {
            // Must contain this id:
            contain:
              this.modelValue && this.isObject(this.modelValue)
                ? this.modelValue.id
                : this.modelValue,
            search: this.search,

            offset: 0,
            count: 20,

            with_samples:3
          },
        })
        .then(({ data }) => {
          if (this.modern && (this.disposed || request_id !== this.request_id)) return;
          this.property_sets = data.property_sets;
          this.total = data.total;

          // Searching refreshes choices, not the explicitly selected modern draft.
          if (this.modern) return;

          const val = this.property_sets.find((it) => {
            return (
              it.id ===
              (this.modelValue && this.isObject(this.modelValue)
                ? this.modelValue.id
                : this.modelValue)
            );
          });

          if (this.returnObject) {
            this.$emit("update:modelValue", val);
          } else {
            this.$emit("update:modelValue", val?.id);
          }
        })
        .catch((error) => {
          if (!this.modern) throw error;
          if (!this.disposed && request_id === this.request_id) NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (this.modern && (this.disposed || request_id !== this.request_id)) return;
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-property-set-input--modern {
  min-width: 0;
  :deep(.v-autocomplete__selection) { min-width: 0; max-width: 100%; }
  .b-property-set-input__selection { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; line-height: 22px; }
}
.b-property-set-input__option {
  min-width: 0;
  padding: 12px;
  :deep(.v-list-item-title) { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; font-size: 13px; line-height: 21px; font-weight: 500; }
  :deep(.v-list-item-subtitle) { font-size: 13px; line-height: 21px; opacity: 1; color: var(--sd-modern-muted); white-space: normal; overflow-wrap: anywhere; }
  .b-property-set-input__title { min-width: 0; overflow-wrap: anywhere; }
}
.b-property-set-input__axes { display: flex; flex-wrap: wrap; gap: 5px 12px; margin-block-start: 7px; font-size: 12px; line-height: 20px; color: var(--sd-modern-muted); }
.b-property-set-input__axes > span { display: inline-flex; align-items: center; gap: 5px; min-width: 0; overflow-wrap: anywhere; }
@media (max-width: 520px), (pointer: coarse) {
  .b-property-set-input--modern .b-property-set-input__selection { font-size: 16px; line-height: 24px; }
  .b-property-set-input__option { min-height: 44px; }
}
</style>
