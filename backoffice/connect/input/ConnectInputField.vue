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
    :disabled="disabled"
    :items="connects"
    :loading="busy"
    :messages="selected_connect && selected_connect.description"
    :model-value="modelValue"
    :return-object="false"
    clearable
    item-title="name"
    item-value="id"
    label="Platform"
    @update:model-value="
      (val) => {
        $emit('update:modelValue', val);
      }
    "
    @click:clear="
      $emit('click:clear');
      getConnects();
    "
    :variant="variant"
  >
    <template v-slot:selection="{}">
      <template v-if="selected_connect">
        <v-avatar
          v-if="selected_connect.icon"
          class="ma-1 me-2"
          rounded
          size="32"
        >
          <img :src="getShopImagePath(selected_connect.icon, 64)" />
        </v-avatar>
        <b
          >{{ selected_connect.name }}
          <span v-if="!selected_connect.enable" class="mx-1 small text-red">
            🔒 {{ $t("global.commons.private") }}</span
          >
        </b>
        <small class="mx-1"> 🞄 {{ selected_connect.mode }}</small>
      </template>
      <small v-else-if="modelValue">Loading...</small>
    </template>

    <template v-slot:item="{ item, props }">
      <v-list-item v-bind="props" class="text-start">
        <template v-slot:prepend>
          <v-avatar v-if="item.raw.icon" rounded size="40">
            <img :src="getShopImagePath(item.raw.icon, 64)" />
          </v-avatar>
        </template>

        <template v-slot:title>
          <div class="d-flex align-center">
            <b class="flex-grow-1"
              >{{ item.raw.name }}
              <span v-if="!item.raw.enable" class="mx-1 small text-red">
                🔒 {{ $t("global.commons.private") }}</span
              >
            </b>
            <small class="mx-1"> 🞄 {{ item.raw.mode }}</small>
          </div>
        </template>

        <template v-slot:subtitle>
          {{ item.raw.description.limitWords(8) }}
        </template>
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script>
import _ from "lodash-es";

export default {
  name: "ConnectInputField",
  emits: ["update:modelValue", "click:clear"],
  components: {},
  props: {
    shop: {
      require: true,
      type: Object,
    },

    modelValue: {
      type: Number,
    },

    defaultConnect: {}, // Default value object

    disabled: {
      default: false,
      type: Boolean,
    },
    disableFetch: {
      default: false,
      type: Boolean,
    },

    variant: {
      default: "underlined",
    },
  },

  data() {
    return {
      // Connect services:
      connects: [],
      total: false,

      busy: false,
      search: null,
    };
  },

  computed: {
    selected_connect() {
      let out = this.connects.find((vendor) => vendor.id === this.modelValue);
      if (!out && this.modelValue) return this.defaultConnect; // Return default value object
      return out;
    },
  },

  watch: {
    search: _.throttle(function (newVal, oldVal) {
      this.getConnects();
    }, window.SERACH_THROTTLE),

    selected_connect() {
      this.$emit("update:defaultConnect", this.selected_connect);
    },
  },

  created() {
    this.getConnects();
  },

  methods: {
    getConnects() {
      if (this.disableFetch) return;
      this.busy = true;
      axios
        .get(window.API.GET_CONNECT_SERVICES(this.shop.id), {
          params: {
            // Must contain this id:
            contain:
              this.modelValue && this.isObject(this.modelValue)
                ? this.modelValue.id
                : this.modelValue,
            search: this.search,

            offset: 0,
            count: this.disabled ? 0 : 20,

            compact: true,
          },
        })
        .then(({ data }) => {
          this.connects = data.connects;
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
