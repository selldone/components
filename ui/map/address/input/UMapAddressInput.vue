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
  <div class="position-relative">
    <v-textarea
      :hide-details="hideDetails"
      :label="`▼ ${title ? title : $t('global.commons.address')}`"
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
      @blur="$emit('update:isFocus', false)"
      @focus="$emit('update:isFocus', true)"
      @update:model-value="
        (val) => {
          search_address = val;
          $emit('update:modelValue', val);
          if (!val) auto_complete_address = true;
        }
      "
      @click:clear="auto_complete_address = true"
      @update:focused="setFocused"
      @keydown.enter.stop="auto_complete_address = false"
    >
      <template v-slot:prepend-inner>
        <v-icon :color="prependIconColor"> {{ prependIcon }}</v-icon>
      </template>
    </v-textarea>

    <v-expand-transition>
      <div
        v-if="
          attach &&
          focused &&
          auto_complete_address /*Disable after user click on an item*/ &&
          search_results &&
          search_results.length
        "
      >
        <v-list
          class="border-between-vertical -dashed text-start"
          density="compact"
          lines="two"
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
            <b class="me-2">
              <flag
                v-if="item.country"
                :iso="item.country"
                :squared="false"
                class="me-1"
              />

              {{ item.title }}</b
            >
            <v-chip
              v-if="item.state"
              label
              color="#000"
              variant="plain"
              size="x-small"
              class="mx-1"
              >{{ item.state }}
            </v-chip>
            <v-chip
              v-if="item.city"
              label
              color="#000"
              variant="plain"
              size="x-small"
              class="mx-1"
              >{{ item.city }}
            </v-chip>
            <p
              class="text-subtitle-2"
              style="line-height: 1.5em"
              v-text="item.address"
            />
          </v-list-item>
        </v-list>
      </div>
    </v-expand-transition>
    <v-menu
      v-if="!attach"
      activator="parent"
      :disabled="!auto_complete_address"
      :location="top ? 'top' : bottom ? 'bottom' : undefined"
      :model-value="
        auto_complete_address /*Disable after user click on an item*/ &&
        suggestion_menu &&
        search_results &&
        search_results.length
      "
      @update:model-value="(val) => (suggestion_menu = val)"
    >
      <v-list
        class="border-between-vertical -dashed"
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
          <b class="me-2 small">
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
  </div>
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
    attach: Boolean,
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

      focused: false,
    };
  },

  watch: {
    search_address: _.throttle(function (newVal, oldVal) {
      if (!this.focused) return;

      /*  this.search_results = [
          { title: "title 1", address: "address 1" },
          { title: "title 2", address: "address 2" },
        ];
        return;*/
      if (!newVal) this.auto_complete_address = true;

      if (!this.auto_complete_address) return;

      if (!newVal || newVal.length < 4) return;

      this.search_busy = true;
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
            this.suggestion_menu = !this.hide;
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
  methods: {
    setFocused(val) {
      if (val) {
        this.focused = true;
      } else _.delay(() => (this.focused = false), 100);
    },
  },
};
</script>

<style scoped></style>
