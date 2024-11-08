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
  <v-autocomplete
    v-model:search="search"
    :items="profiles"
    :label="label"
    :loading="busy"
    :model-value="modelValue"
    :placeholder="placeholder"
    :variant="variant ? variant : 'underlined'"
    class="text-start"
    clearable
    item-title="title"
    item-value="id"
    no-data-text="No locations found!"
    no-filter
    return-object
    @update:model-value="(val) => $emit('update:modelValue', val)"
    @click:clear="$emit('click:clear')"
  >
    <template v-slot:selection="{ item }">
      <v-avatar v-if="item.raw.icon" class="m-2 flex-grow-0" size="32">
        <img :src="getShopImagePath(item.raw.icon)" />
      </v-avatar>
      <div>
        <b class="me-2">{{ item.raw.title }}</b>

        <flag
          v-for="(val, country) in item.raw.locations"
          :key="country"
          :iso="country"
          :squared="false"
          class="ma-1"
        />
      </div>
    </template>

    <template v-slot:item="{ item, props }">
      <v-list-item
        :prepend-avatar="
          item.raw.icon ? getShopImagePath(item.raw.icon) : undefined
        "
        :title="item.raw.title"
        class="text-start"
        v-bind="props"
      >
        <div>
          <flag
            v-for="(val, country) in item.raw.locations"
            :key="country"
            :iso="country"
            :squared="false"
            class="ma-1"
          />
        </div>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import { debounce } from "lodash-es";

export default {
  name: "BProductLocationRestrictionsInput",
  components: {},
  emits: ["update:modelValue", "click:clear"],
  props: {
    shop: {
      require: true,
      type: Object,
    },

    modelValue: {},
    label: {},
    placeholder: {},

    variant: {
      default: "underlined",
    },
  },

  data() {
    return {
      profiles: [],
      total: false,

      busy: false,

      search: null,
    };
  },
  watch: {
    search: debounce(function (newVal, oldVal) {
      if (!newVal && !oldVal) return;
      this.getProfiles();
    }, window.SERACH_THROTTLE),
  },

  created() {
    this.getProfiles();
  },

  methods: {
    getProfiles() {
      this.busy = true;

      axios
        .get(window.API.GET_PRODUCT_LOCATIONS_SAVES(this.shop.id), {
          params: {
            // Must contain this id:
            contain:
              this.modelValue && this.isObject(this.modelValue)
                ? this.modelValue.id
                : this.modelValue,
            search: this.search,
            offset: 0,
            count: 20,
          },
        })
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null, data.error_msg);
          }
          this.profiles = data.profiles;
          this.total = data.total;

          const val = this.profiles.find((page) => {
            return (
              page.id ===
              (this.modelValue && this.isObject(this.modelValue)
                ? this.modelValue.id
                : this.modelValue)
            );
          });

          if (this.modelValue && !val) {
            // Value not found auto call click clear!
            this.$emit("click:clear");
          }
          if (this.modelValue && val && this.isObject(this.modelValue)) {
            Object.assign(this.modelValue, val); // Update value! value can be abstracted {id}!
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
