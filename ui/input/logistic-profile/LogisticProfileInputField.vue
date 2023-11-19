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
    :items="profiles"
    :loading="busy || loading"
    :label="type.title"
    item-text="title"
    item-value="id"
    :return-object="false"
    clearable
    @change="(val) => $emit('change', val)"
    @click:clear="
      $nextTick(() => {
        $emit('click:clear');
      })
    "
    :search-input.sync="search"
    :filter="() => true"
  >
    <template v-slot:selection>
      <div v-if="live_value" class="py-2 text-start">
        <div>
          <b>{{ live_value.name }}</b>
        </div>
        <div
          class="my-1 small"
          v-if="live_value.info && Array.isArray(live_value.info.languages)"
        >
          <b v-for="lng in live_value.info.languages" :key="lng" class="pa-1">{{
            getLanguageName(lng)
          }}</b>
        </div>
      </div>
    </template>

    <template v-slot:item="{ item }">
      <div class="py-2 w-100 text-start">
        <div>
          <b>{{ item.name }}</b>
        </div>
        <div
          class="my-1 small"
          v-if="item.info && Array.isArray(item.info.languages)"
        >
          <b v-for="lng in item.info.languages" :key="lng" class="pa-1">{{
            getLanguageName(lng)
          }}</b>
        </div>
      </div>
    </template>
  </v-autocomplete>
</template>

<script>
import _ from "lodash-es";

export default {
  name: "LogisticProfileInputField",
  components: {},
  props: {
    shop: {
      require: true,
      type: Object,
    },
    type: {
      require: true,

      type: Object,
    },

    value: {}, // Just accept id!

    loading: {
      default: false,
      type: Boolean,
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

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    live_value() {
      return this.value && this.profiles.find((i) => i.id === this.value);
    },
  },

  watch: {
    search: _.throttle(function (newVal, oldVal) {
      this.getProfiles();
    }, window.SERACH_THROTTLE),

    type() {
      this.search = null;
      this.getProfiles();
    },
  },

  created() {
    this.getProfiles();
  },

  methods: {
    getProfiles() {
      this.busy = true;
      axios
        .get(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.GET_MY_VENDOR_LOGISTIC_PROFILES(
                this.$route.params.vendor_id
              )
            : window.API.GET_SHOP_LOGISTIC_PROFILES(this.shop.id),
          {
            params: {
              // Must contain this id:
              contain: this.value,
              search: this.search,
              offset: 0,
              count: 20,

              compact: true,

              type: this.type.value,
            },
          }
        )
        .then(({ data }) => {
          this.profiles = data.profiles;
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
