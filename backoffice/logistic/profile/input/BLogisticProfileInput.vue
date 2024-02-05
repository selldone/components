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
    @update:model-value="(val) => $emit('update:modelValue', val)"
    :items="profiles"
    :loading="busy || loading"
    :label="type.title"
    item-title="name"
    item-value="id"
    :return-object="false"
    clearable
    @click:clear="
      $nextTick(() => {
        $emit('click:clear');
      })
    "
    v-model:search="search"
    v-model:menu="menu"
    :customFilter="() => true"
    :variant="variant"
    messages=" "
  >
    <template v-slot:selection>
      {{ live_value?.name }}
    </template>
    <template v-slot:message>
      <div
        class="small"
        v-if="live_value?.info && Array.isArray(live_value.info.languages)"
      >
        <v-chip
          v-for="lng in live_value.info.languages"
          :key="lng"
          class="ma-1"
          size="x-small"
          label
          >{{ getLanguageName(lng) }}
        </v-chip>
      </div>
    </template>

    <template v-slot:item="{ item, props }">
      <v-list-item v-bind="props" class="text-start" :title="item.raw.name">
        <div
          class="my-1"
          v-if="item.raw.info && Array.isArray(item.raw.info.languages)"
        >
          <v-chip
            v-for="lng in item.raw.info.languages"
            :key="lng"
            class="ma-1"
            size="x-small"
            label
            >{{ getLanguageName(lng) }}
          </v-chip>
        </div>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import threads from "@core/utils/thread/threads";

export default {
  name: "BLogisticProfileInput",
  components: {},
  emits: ["update:modelValue", "click:clear"],
  props: {
    shop: {
      require: true,
      type: Object,
    },
    type: {
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
      profiles: [],
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

    live_value() {
      return (
        this.modelValue && this.profiles.find((i) => i.id === this.modelValue)
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
              ?.name) /*Prevent search when user first focus on input!*/
      )
        return;

      this.getProfiles();
    }),

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

      const params = {
        // Must contain this id:
        contain: this.modelValue,
        search: this.search,
        compact: true,
        type: this.type.value,
      };

      const handleSuccessResponse = ({ profiles, total }) => {
        this.profiles = profiles;
        this.total = total;
      };

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.logistic.profile
            .optimize(60)
            .cancellation(true)
            .list(this.$route.params.vendor_id, 0, 20, params)
        : window.$backoffice.logistic.profile
            .optimize(60)
            .cancellation(true)
            .list(this.shop.id, 0, 20, params)
      )

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
