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
    v-model:menu="menu"
    v-model:search="search"
    :customFilter="() => true"
    :items="includes"
    :loading="busy || loading"
    :model-value="modelValue"
    :variant="variant"
    clearable
    item-title="title"
    item-value="id"
    label="Included Profile"
    placeholder="Select an item..."
    return-object
    @update:model-value="(val) => $emit('update:modelValue', val)"
    @click:clear="
      $nextTick(() => {
        $emit('click:clear');
      })
    "
  >
    <template v-slot:selection="{ item }">
      <div v-if="item.raw" class="py-2 text-start d-flex align-center">
        <v-avatar class="me-2" rounded size="24">
          <img :src="getShopImagePath(item.raw.image)" />
        </v-avatar>

        <b class="flex-grow-1">{{ item.raw.title }}</b>
      </div>
    </template>

    <template v-slot:item="{ item, props }">
      <v-list-item :title="item.raw.title" class="text-start" v-bind="props">
        <template v-slot:prepend>
          <v-avatar rounded="lg" size="24">
            <img :src="getShopImagePath(item.raw.image)" />
          </v-avatar>
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import threads from "@selldone/core-js/utils/thread/threads";

export default {
  name: "BIncludeItemInput",
  components: {},
  emits: ["update:modelValue", "click:clear"],
  props: {
    shop: {
      require: true,
      type: Object,
    },

    modelValue: {}, // Just accept id!

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
      includes: [],
      total: false,

      busy: false,

      search: "",
      menu: false,
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
  },

  watch: {
    search: threads.debounceSearch(function (val) {
      if (
        !this.menu || // Search only if menu is open!
        (val &&
          val ===
            this.selected_vendor
              ?.title) /*Prevent search when user first focus on input!*/
      )
        return;

      this.getIncludes();
    }),
  },

  created() {
    this.getIncludes();
  },

  methods: {
    getIncludes() {
      this.busy = true;
      axios
        .get(
          this.IS_VENDOR_PANEL
            ? window.VAPI.GET_MY_VENDOR_SHOP_INCLUDES(
                this.$route.params.vendor_id,
              )
            : window.API.GET_SHOP_INCLUDES(this.shop.id),
          {
            params: {
              search: this.search,
              offset: 0,
              count: 20,
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null, data.error_msg);
          }
          this.includes = data.includes;
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
