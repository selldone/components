<template>
  <v-menu
    max-height="40vh"
    offset-y
    :top="top"
    :bottom="bottom"
    rounded="xl"
    :value="
      auto_complete_address /*Disable after user click on an item*/ &&
      suggestion_menu &&
      search_results &&
      search_results.length
    "
    @input="(val) => (suggestion_menu = val)"
    :disabled="!auto_complete_address"
  >
    <template v-slot:activator="{ on }">
      <v-textarea
        v-on="on"
        :value="value"
        :label="`▼ ${title}`"
        :placeholder="$t('global.map_view.enter_your_address')"
        color="green"
        @input="
          (val) => {
            search_address = val;
            $emit('input', val);
          }
        "
        :loading="search_busy"
        :readonly="viewOnly"
        persistent-placeholder
        :rows="rows"
        auto-grow
        @focus="$emit('update:isFocus', true)"
        @blur="$emit('update:isFocus', false)"
        clearable
        @click:clear="auto_complete_address = true"
        :rounded="rounded"
        :solo="solo"
        :hide-details="hideDetails"
      >
        <template v-slot:prepend-inner>
          <v-icon :color="prependIconColor"> {{ prependIcon }} </v-icon>
        </template>
      </v-textarea>
    </template>

    <v-list two-line style="line-height: 1.5em" dense>
      <v-list-item
        v-for="(item, index) in search_results"
        :key="index"
        @click="
          auto_complete_address = !autoDisableAutoComplete /*Now user can edit address manually!*/;
          $emit('select:address', item);
        "
        class="text-start"
      >
        <v-list-item-content>
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
            style="line-height: 1.5em"
            class="text-start m-0"
            v-text="item.address"
          />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import _ from "lodash-es";

export default {
  name: "AddressInputAuto",

  props: {
    value: {},

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

    prependIcon: { default: "local_shipping" },
    prependIconColor: { default: "#00796B" },

    autoDisableAutoComplete: {  // Used to permit user edit address manually
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
            local: this.getCurrentLanguage().local, // For Auto select service!
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
