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
    :value="value"
    @input="(val) => $emit('input', val)"
    :items="pages"
    :loading="busy"
    :label="$t('campaign.setting.general_setting.page_input')"
    item-text="title"
    :messages="value ? `https://.../pages/${value.name}` : ''"
    clearable
    @change="$emit('change')"
    @click:clear="$emit('click:clear')"
    :search-input.sync="search"
    no-filter
    return-object
  >
    <template v-slot:append v-if="value?.id && $route.params.shop_id">
      <v-btn
        icon
        :to="{ name: 'ShopPageBuilderPage', params: { page_id: value.id } }"
        title="Edit page"
        target="_blank"
      >
        <v-icon>edit</v-icon>
      </v-btn>
    </template>

    <template v-slot:selection="{ item, attrs, parent, index }">
      <span
        :key="item.id"
        v-bind="attrs"
        @click.stop="parent.selectedIndex = index"
        @click:close="parent.selectItem(item)"
      >
        <v-avatar :color="item.color" size="32" class="m-2">
          <img v-if="item.image" :src="getShopImagePath(item.image)" />
          <v-icon v-else small dark>architecture</v-icon>
        </v-avatar>
        {{ item.title }}

        <v-icon v-if="item.color" x-small :color="item.color" class="mx-1"
          >circle</v-icon
        >

        <small class="ms-3 me-1"> {{ $t("global.commons.designer") }}: </small>
        <v-avatar
          size="24"
          class="avatar-gradient -thin -staff d-inline-flex me-2"
        >
          <img :src="getUserAvatar(item.user_id)" />
        </v-avatar>

        <small class="red--text mx-2" v-if="item.published === false">{{
          $t("global.commons.draft")
        }}</small>
      </span>
    </template>

    <template v-slot:item="{ item }">
      <v-row no-gutters :key="item.id" align="center">
        <v-avatar :color="item.color" size="32" class="m-2">
          <img v-if="item.image" :src="getShopImagePath(item.image)" />
          <v-icon v-else small dark>architecture</v-icon>
        </v-avatar>
        {{ item.title }}
        <v-icon v-if="item.color" x-small :color="item.color" class="mx-1"
          >circle</v-icon
        >

        <v-spacer></v-spacer>

        <v-avatar size="24" class="avatar-gradient -thin -staff ms-2">
          <img :src="getUserAvatar(item.user_id)" />
        </v-avatar>
        <small class="red--text mx-1" v-if="item.published === false">{{
          $t("global.commons.draft")
        }}</small>
      </v-row>
    </template>
  </v-autocomplete>
</template>

<script>
import _ from "lodash-es";

export default {
  name: "PageInputField",
  components: {},
  props: {
    shop: {
      require: true,
      type: Object,
    },

    value: {},

    publishedOnly: {
      default: false,
      type: Boolean,
    },
  },

  data() {
    return {
      pages: [],
      total: false,

      busy: false,

      search: null,
    };
  },
  watch: {
    search: _.debounce(function (newVal, oldVal) {
      this.getPages();
    }, window.SERACH_THROTTLE),
  },

  created() {
    this.getPages();
  },

  methods: {
    getPages() {
      this.busy = true;

      axios
        .get(window.API.GET_SHOP_PAGES(this.shop.id), {
          params: {
            // Must contain this id:
            contain:
              this.value && this.isObject(this.value)
                ? this.value.id
                : this.value,
            search: this.search,
            offset: 0,
            count: 20,

            published_only: this.publishedOnly,
            compact: true,
          },
        })
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null, data.error_msg);
          }

          this.pages = data.pages;
          this.total = data.total;

          const val = this.pages.find((page) => {
            return (
              page.id ===
              (this.value && this.isObject(this.value)
                ? this.value.id
                : this.value)
            );
          });

          if (this.value && !val) {
            // Value not found auto call click clear!
            this.$emit("click:clear");
          }
          if (this.value && val && this.isObject(this.value)) {
            Object.assign(this.value, val); // Update value! value can be abstracted {id}!
          }
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped lang="scss"></style>
