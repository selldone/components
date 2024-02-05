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
    :model-value="modelValue"
    @update:model-value="
      (val) => {
        $emit('update:modelValue', val);
        $nextTick(() => {
          $emit('change', val);
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
    v-model:menu="menu"
    :customFilter="() => true"
    messages=" "
    :disabled="disabled || IS_VENDOR_PANEL"
    :placeholder="placeholder"
    :flat="flat"
    :density="dense ? 'compact' : undefined"
    :bg-color="backgroundColor"
    :hide-details="hideDetails"
    :prepend-inner-icon="prependInnerIcon"
    :rounded="rounded"
    @focus="onFocus"
    :variant="variant ? variant : solo ? 'solo' : 'underlined'"
    :single-line="singleLine"
  >
    <template v-slot:selection="{}">
      <template v-if="selected_vendor">
        <v-avatar
          v-if="selected_vendor.icon"
          :size="dense ? 20 : 24"
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

    <template v-slot:item="{ item, props }">
      <v-list-item v-bind="props">
        <template v-slot:prepend>
          <v-avatar size="32" rounded>
            <img
              v-if="item.raw.icon"
              :src="getShopImagePath(item.raw.icon, 64)"
            />
            <v-icon v-else>storefront</v-icon>
          </v-avatar>
        </template>

        <template v-slot:title>
          <v-row no-gutters align="center">
            <b>{{ item.raw.name }}</b>
            <v-spacer></v-spacer>
            <v-chip v-if="item.raw.user" class="mx-1 pen" size="small">
              <v-avatar start class="avatar-gradient -thin -user">
                <img :src="getUserAvatar(item.raw.user_id)" />
              </v-avatar>
              <span class="small">{{ item.raw.user.name }}</span>
            </v-chip>
          </v-row>
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import threads from "@core/utils/thread/threads";

export default {
  name: "BVendorInput",
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
    variant: {},
    singleLine: Boolean,
  },

  data() {
    return {
      // Vendors:
      vendors: [],
      total: false,

      busy: false,
      search: "",
      menu: false,

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
    search: threads.debounceSearch(function (val) {
      if (
        !this.menu || // Search only if menu is open!
        (val &&
          val ===
            this.selected_vendor
              ?.name) /*Prevent search when user first focus on input!*/
      )
        return;

      this.getVendors();
    }),
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

      const params = {
        // Must contain this id:
        contain:
          this.modelValue && this.isObject(this.modelValue)
            ? this.modelValue.id
            : this.modelValue,
        search: this.search,

        active_only: this.activeOnly,
        compact: true,
      };

      const handleSuccessResponse = ({ vendors, total }) => {
        this.vendors = vendors;
        this.total = total;
      };

      window.$backoffice.vendor
        .optimize(60)
        .cancellation()
        .list(this.shop.id, 0, this.disabled ? 0 : 20, params)
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped lang="scss"></style>
