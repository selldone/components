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
    :items="map_tags"
    :loading="busy || loading"
    label="Location"
    item-text="title"
    item-value="id"
    :return-object="returnObject"
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
          <b>   <flag v-if="live_value.country" :iso="live_value.country" :squared="false" class="me-1" /> {{ live_value.title }}</b>

          <small class="ms-2" title="Range">
            <v-icon v-if="!live_value.range" small>all_inclusive</v-icon>
          <span v-else>{{ live_value.range }} km</span>
          </small>

        </div>
        <div
          class="my-1 small"
        >
          {{live_value.address}}
        </div>
      </div>
    </template>

    <template v-slot:item="{ item }">
      <div class="py-2 w-100 text-start">
        <div>
          <b>  <flag v-if="item.country" :iso="item.country" :squared="false" class="me-1" /> {{ item.title }}</b>

          <small class="ms-2">
            <v-icon v-if="!item.range" small>all_inclusive</v-icon>
            <span v-else>{{ item.range }} km</span>
          </small>

        </div>
        <div class="my-1 small">
         {{item.address}}
        </div>
      </div>
    </template>
  </v-autocomplete>
</template>

<script>
import _ from "lodash-es";

export default {
  name: "MapTagInputField",
  components: {},
  props: {
    shop: {
      require: true,
      type: Object,
    },


    value: {}, // Just accept id!

    loading: {
      default: false,
      type: Boolean,
    },
    returnObject: {
      default: false,
      type: Boolean,
    },
  },

  data() {
    return {
      map_tags: [],
      total: false,

      busy: false,

      search: null,
    };
  },

  computed: {
    live_value() {
      if(this.returnObject)return this.value;
      return this.value && this.map_tags.find((i) => i.id === this.value);
    },
  },

  watch: {
    search: _.throttle(function (newVal, oldVal) {
      this.getMapTags();
    }, window.SERACH_THROTTLE),


  },

  created() {
    this.getMapTags();
  },

  methods: {
    getMapTags() {
      this.busy = true;
      axios
        .get(window.API.GET_SHOP_MAP_TAGS(this.shop.id), {
          params: {
            // Must contain this id:
            contain: this.value,
            search: this.search,
            offset: 0,
            count: 20,

            compact: true,

          },
        })
        .then(({ data }) => {
          this.map_tags = data.map_tags;
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
