<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
    :items="map_tags"
    :loading="busy || loading"
    :model-value="modelValue"
    :return-object="returnObject"
    :variant="variant"
    clearable
    item-title="title"
    item-value="id"
    label="Location"
    messages=" "
    @update:model-value="(val) => $emit('update:modelValue', val)"
    @click:clear="
      $nextTick(() => {
        $emit('click:clear');
      })
    "
  >
    <template v-slot:selection>
      <template v-if="live_value">
        <b>
          <flag
            v-if="live_value.country"
            :iso="live_value.country"
            :squared="false"
            class="me-1"
          />
          {{ live_value.title }}</b
        >

        <small class="ms-2" title="Range">
          <v-icon v-if="!live_value.range" size="small">all_inclusive</v-icon>
          <span v-else>{{ live_value.range }} km</span>
        </small>
      </template>
    </template>

    <template v-slot:message>
      {{ live_value?.address }}
    </template>

    <template v-slot:item="{ item, props }">
      <v-list-item
        :subtitle="item.raw.address"
        class="text-start"
        v-bind="props"
      >
        <template v-slot:title>
          <v-list-item-title>
            <b>
              <flag
                v-if="item.raw.country"
                :iso="item.raw.country"
                :squared="false"
                class="me-1"
              />
              {{ item.raw.title }}</b
            >

            <small class="ms-2">
              <v-icon v-if="!item.raw.range" size="small">all_inclusive</v-icon>
              <span v-else>{{ item.raw.range }} km</span>
            </small>
          </v-list-item-title>
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import threads from "@selldone/core-js/utils/thread/threads";

export default {
  name: "BMapTagInput",
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
    returnObject: {
      default: false,
      type: Boolean,
    },

    variant: {
      default: "underlined",
    },
  },

  data() {
    return {
      map_tags: [],
      total: false,

      busy: false,

      search: "",
      menu: false,
    };
  },

  computed: {
    live_value() {
      if (this.returnObject) return this.modelValue;
      return (
        this.modelValue && this.map_tags.find((i) => i.id === this.modelValue)
      );
    },
  },

  watch: {
    search: threads.debounceSearch(function (val) {
      if (
        !this.menu || // Search only if menu is open!
        (val &&
          val ===
            this.live_value
              ?.title) /*Prevent search when user first focus on input!*/
      )
        return;

      this.getMapTags();
    }),
  },

  created() {
    this.getMapTags();
  },

  methods: {
    getMapTags() {
      this.busy = true;

      const handleSuccessResponse = ({ map_tags, total }) => {
        this.map_tags = map_tags;
        this.total = total;
      };

      window.$backoffice.map.tag
        .optimize(60)
        .cancellation(true)
        .list(this.shop.id, 0, 20, {
          // Must contain this id:
          contain: this.modelValue,
          search: this.search,

          compact: true,
        })
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

<style lang="scss" scoped></style>
