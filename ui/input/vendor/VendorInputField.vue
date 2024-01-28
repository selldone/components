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
    :model-value="modelValue"
    @update:model-value="
      (val) => {
        $emit('update:modelValue', val);
        $nextTick(() => {
       $emit('change',val)
      });
      }
    "
    :items="vendors"
    :loading="busy"
    :label="label"
    item-value="id"
    item-title="name"
    :return-object="false"
    clearable
    @click:clear="
      $emit('click:clear');
      getVendors();
    "
    v-model:search="search"
    :customFilter="() => true"
    messages=" "
    :disabled="disabled || IS_VENDOR_PANEL"
    :placeholder="placeholder"
    :flat="flat"
    :density="dense?'compact':undefined"
    :bg-color="backgroundColor"
    :hide-details="hideDetails"
    :prepend-inner-icon="prependInnerIcon"
    :rounded="rounded"
    @focus="onFocus"
    :variant="solo?'solo':'underlined'"
  >
    <template v-slot:selection="{}">
      <template v-if="selected_vendor">
        <v-avatar
          v-if="selected_vendor.icon"
          :size="dense ? 24 : 32"
          rounded
          class="ma-1 me-2"
        >
          <img :src="getShopImagePath(selected_vendor.icon, 64)" />
        </v-avatar>
        <b>{{ selected_vendor.name }}</b>
      </template>
      <small v-else-if="modelValue">Loading...</small>
    </template>

    <template v-slot:message>
      <div v-if="selected_vendor && selected_vendor.user" class="pen">
        <v-avatar size="24" start class="avatar-gradient -thin -user me-1">
          <img :src="getUserAvatar(selected_vendor.user_id)" />
        </v-avatar>
        {{ selected_vendor.user.name }}
      </div>
    </template>

    <template v-slot:item="{ item }">
      <v-row no-gutters align="center">
        <v-avatar v-if="item.icon" size="32" rounded class="ma-1 me-2">
          <img :src="getShopImagePath(item.icon, 64)" />
        </v-avatar>
        <b>{{ item.name }}</b>
        <v-spacer></v-spacer>
        <v-chip v-if="item.user" class="mx-1 pen" color="#fafafa">
          <v-avatar size="24" start class="avatar-gradient -thin -user">
            <img :src="getUserAvatar(item.user_id)" />
          </v-avatar>
          <span class="small">{{ item.user.name }}</span>
        </v-chip>
      </v-row>
    </template>
  </v-combobox>
</template>

<script>
import _ from "lodash-es";

export default {
  name: "VendorInputField",
  components: {},
  emits: ["update:modelValue", "change", "click:clear"],
  props: {
    shop: {
      require: true,
      type: Object,
    },

    modelValue: {},
    activeOnly: { default: false, type: Boolean },

    defaultVendor: {}, // Default value object

    disabled: {
      default: false,
      type: Boolean,
    },

    label: {},
    placeholder: { default: "Select a vendor..." },
    solo: { default: false, type: Boolean },
    flat: { default: false, type: Boolean },
    rounded: { default: false, type: Boolean },
    dense: { default: false, type: Boolean },
    hideDetails: { default: false, type: Boolean },
    backgroundColor: {},
    prependInnerIcon: {},
  },

  data() {
    return {
      // Vendors:
      vendors: [],
      total: false,

      busy: false,
      search: null,

      focused: false, // Prevent load in the first initialize!
    };
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    selected_vendor() {
      let out = this.vendors.find((vendor) => vendor.id === this.modelValue);
      if (!out && this.modelValue) return this.defaultVendor; // Return default value object
      return out;
    },
  },

  watch: {
    search: _.throttle(function (newVal, oldVal) {
      if(!newVal && !oldVal) return;
      this.getVendors();
    }, window.SERACH_THROTTLE),
  },

  created() {
    if (this.modelValue) {
      this.getVendors();
    }
  },

  methods: {
    onFocus() {
      if (!this.focused) {
        // Initial fetch!
        this.getVendors();
      }
      this.focused = true;
    },

    getVendors() {
      // Just marketplace has access to list of vendors!
      if (this.IS_VENDOR_PANEL) return;

      this.busy = true;
      axios
        .get(window.API.GET_SHOP_VENDORS(this.shop.id), {
          params: {
            // Must contain this id:
            contain:
              this.modelValue && this.isObject(this.modelValue)
                ? this.modelValue.id
                : this.modelValue,
            search: this.search,

            offset: 0,
            count: this.disabled ? 0 : 20,

            active_only: this.activeOnly,
            compact: true,
          },
        })
        .then(({ data }) => {
          this.vendors = data.vendors;
          this.total = data.total;
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped lang="scss"></style>
