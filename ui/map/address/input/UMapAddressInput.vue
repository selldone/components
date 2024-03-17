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
  <v-menu
    :bottom="bottom"
    :disabled="!auto_complete_address"
    :model-value="
      auto_complete_address /*Disable after user click on an item*/ &&
      suggestion_menu &&
      search_results &&
      search_results.length
    "
    :top="top"
    max-height="40vh"
    variant="underlined"
    @update:model-value="(val) => (suggestion_menu = val)"
  >
    <template v-slot:activator="{ props }">
      <v-textarea
        :hide-details="hideDetails"
        :label="`▼ ${title}`"
        :loading="search_busy"
        :model-value="modelValue"
        :placeholder="$t('global.map_view.enter_your_address')"
        :readonly="viewOnly"
        :rounded="rounded"
        :rows="rows"
        :variant="variant ? variant : solo ? 'solo' : 'underlined'"
        auto-grow
        clearable
        color="green"
        persistent-placeholder
        v-bind="props"
        @blur="$emit('update:isFocus', false)"
        @focus="$emit('update:isFocus', true)"
        @update:model-value="
          (val) => {
            search_address = val;
            $emit('update:modelValue', val);
          }
        "
        @click:clear="auto_complete_address = true"
      >
        <template v-slot:prepend-inner>
          <v-icon :color="prependIconColor"> {{ prependIcon }}</v-icon>
        </template>
      </v-textarea>
    </template>

    <v-list
      density="compact"
      lines="two"
      rounded="xl"
      style="line-height: 1.5em"
    >
      <v-list-item
        v-for="(item, index) in search_results"
        :key="index"
        class="text-start"
        @click="
          auto_complete_address =
            !autoDisableAutoComplete /*Now user can edit address manually!*/;
          $emit('select:address', item);
        "
      >
        <b class="me-2 small font-weight-bold text-muted">
          <flag
            v-if="item.country"
            :iso="item.country"
            :squared="false"
            class="me-1"
          />

          {{ item.title }}</b
        >
        <p
          class="text-start m-0"
          style="line-height: 1.5em"
          v-text="item.address"
        />
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import _ from "lodash-es";

export default {
  name: "UMapAddressInput",
  emits: ["update:modelValue", "select:address", "update:isFocus"],
  props: {
    modelValue: {},

    viewOnly: {
      type: Boolean,
      default: false,
    },

    title: {
      type: String,
      default: "Address",
    },

    isFocus: {},

    center: {}, // Map center location to better suggestion!

    top: {
      type: Boolean,
      default: false,
    },
    bottom: {
      type: Boolean,
      default: false,
    },

    clearable: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    solo: {
      type: Boolean,
      default: false,
    },
    hideDetails: {
      type: Boolean,
      default: false,
    },
    rows: { default: 2 },
    variant: {},

    prependIcon: { default: "local_shipping" },
    prependIconColor: { default: "#00796B" },

    autoDisableAutoComplete: {
      // Used to permit user edit address manually
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      // Search live address
      suggestion_menu: false,
      search_address_value: null,
      search_address: "",
      search_results: [],
      search_busy: false,
      auto_complete_address: true, // Enable auto complete, false: user can edit address manuaaly without opening menu!
    };
  },

  watch: {
    search_address: _.throttle(function (newVal, oldVal) {
      if (!newVal) this.auto_complete_address = true;

      if (!this.auto_complete_address) return;
      // watch it

      if (!newVal || newVal.length < 4) return;

      //  if(this.search_busy)return;
      this.search_busy = true;
      // watch it

      //let t = this;

      axios
        .get(window.ADDRESS_API.GET_AUTOCOMPLETE(), {
          params: {
            text: newVal,
            lat: this.center ? this.center.lat : null,
            lon: this.center ? this.center.lng : null,
            local: this.getCurrentLanguage().locale, // For Auto select service!
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.search_results = data.list;
            this.suggestion_menu = this.hide ? false : true;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.search_busy = false;
        });
    }, 800),
  },
};
</script>

<style scoped></style>
