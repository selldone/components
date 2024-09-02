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
    :customFilter="() => true"
    :items="valuations"
    :loading="busy || loading"
    :model-value="modelValue"
    :variant="variant"
    clearable
    item-title="title"
    :label="$t('valuation_input.label')"
    messages=" "
    return-object
    @update:model-value="(val) => $emit('update:modelValue', val)"
    @click:clear="
      $nextTick(() => {
        $emit('click:clear');
      })
    "
  >
    <template v-slot:selection="{ item }">
      <b>{{ modelValue ? modelValue.title : item.raw.title }}</b>
    </template>

    <template v-if="live_value && live_value.user" v-slot:message>
      <div class="my-1 d-flex align-center">
        <div class="small" title="Last editor">
          <v-avatar
            class="force-top avatar-gradient -thin me-1"
            color="#fff"
            size="24"
          >
            <v-img :src="getUserAvatar(live_value.user.id)"></v-img>
          </v-avatar>
          {{ live_value.user.name }}
        </div>
        <v-spacer></v-spacer>
        <small class="mx-1"> {{ $t("global.commons.products") }}: </small>
        {{ live_value.products_count }}
      </div>
    </template>

    <template v-slot:item="{ item, props }">
      <v-list-item class="text-start" v-bind="props">
        <template v-slot:title>
          <b>{{ item.raw.title }}</b>
          <div v-if="item.raw.user" class="my-1 small">
            <v-avatar
              class="hover-scale force-top avatar-gradient -thin me-1"
              color="#fff"
              size="24"
            >
              <v-img :src="getUserAvatar(item.raw.user.id)"></v-img>
            </v-avatar>
            {{ item.raw.user.name }}
          </div>
        </template>

        <template v-slot:append>
          <small class="mx-1"> {{ $t("global.commons.products") }}: </small>
          {{ item.raw.products_count }}
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import _ from "lodash-es";

export default {
  name: "BValuationInput",
  components: {},
  emits: ["update:modelValue", "click:clear"],
  props: {
    shop: {
      require: true,
      type: Object,
    },

    modelValue: {},

    loading: {
      default: false,
      type: Boolean,
    },
    variant: {
      default: "underlined",
    },
  },

  data() {
    return {
      valuations: [],
      total: false,

      busy: false,

      search: null,
    };
  },

  computed: {
    live_value() {
      const out =
        this.modelValue &&
        this.valuations.find((i) => i.id === this.modelValue.id);
      return out ? out : this.modelValue;
    },
  },

  watch: {
    search: _.throttle(function (newVal, oldVal) {
      this.getValuations();
    }, window.SERACH_THROTTLE),
  },

  created() {
    this.getValuations();
  },

  methods: {
    getValuations() {
      this.busy = true;
      axios
        .get(window.API.GET_SHOP_VALUATIONS(this.shop.id), {
          params: {
            // Must contain this id:
            contain:
              this.modelValue && this.isObject(this.modelValue)
                ? this.modelValue.id
                : this.modelValue,
            search: this.search,
            offset: 0,
            count: 20,

            compact: true,
          },
        })
        .then(({ data }) => {
          this.valuations = data.valuations;
          this.total = data.total;
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
