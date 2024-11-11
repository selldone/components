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
    :clearable="clearable"
    :items="pages"
    :label="$t('campaign.setting.general_setting.page_input')"
    :loading="busy"
    :messages="message"
    :model-value="modelValue"
    item-title="title"
    no-filter
    return-object
    variant="underlined"
    @update:model-value="
      (val) => {
        $emit('update:modelValue', val);
      }
    "
    @click:clear="$emit('click:clear')"
  >
    <template
      v-if="modelValue?.id && $route.params.shop_id"
      v-slot:append-inner
    >
      <v-btn
        :to="{
          name: 'BPageLandingEditor',
          params: { page_id: modelValue.id },
        }"
        class="tnt"
        size="small"
        target="_blank"
        title="Edit page"
        variant="elevated"
        @click.stop
      >
        <v-icon start>edit</v-icon>
        {{ $t("global.actions.edit") }}
      </v-btn>
    </template>

    <template v-slot:chip="{ item }">
      <div class="mb-n3">
        <v-avatar :color="item.raw.color" class="me-2" size="24">
          <v-img
            v-if="item.raw.image"
            :src="getShopImagePath(item.raw.image)"
          />
          <v-icon v-else size="small">architecture</v-icon>
        </v-avatar>
        {{ item.raw.title }}

        <v-icon
          v-if="item.raw.color"
          :color="item.raw.color"
          class="mx-1"
          size="x-small"
          >circle
        </v-icon>
        <v-chip
          v-if="item.raw.published === false"
          class="mx-2"
          color="red"
          size="small"
          >{{ $t("global.commons.draft") }}
        </v-chip>

        <v-avatar
          class="avatar-gradient -thin -staff d-inline-flex me-2"
          size="24"
        >
          <img :src="getUserAvatar(item.raw.user_id)" />
        </v-avatar>
      </div>
    </template>

    <template v-slot:item="{ props, item }">
      <v-list-item
        :prepend-avatar="
          item.raw.image ? getShopImagePath(item.raw.image) : null
        "
        :prepend-icon="item.raw.image ? null : 'architecture'"
        class="text-start"
        v-bind="props"
      >
        <template v-slot:title>
          <span class="me-2">
            {{ item.raw.title }}
          </span>
          <v-icon
            v-if="item.raw.color"
            :color="item.raw.color"
            class="me-2"
            size="14"
            >circle
          </v-icon>

          <v-chip
            v-if="item.raw.published === false"
            class="me-2"
            color="red"
            size="small"
            >{{ $t("global.commons.draft") }}
          </v-chip>
        </template>
        <template v-slot:subtitle>
          {{
            item.raw.note
              ? item.raw.note.limitWords(10)
              : item.raw.description?.limitWords(10)
          }}
        </template>

        <template v-slot:append>
          <v-avatar
            v-if="item.raw.user_id"
            class="avatar-gradient -thin -staff ms-2"
            size="24"
          >
            <img :src="getUserAvatar(item.raw.user_id)" />
          </v-avatar>
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import threads from "@selldone/core-js/utils/thread/threads";

export default {
  name: "BPageInput",
  components: {},
  emits: ["update:modelValue", "click:clear"],
  props: {
    shop: {
      require: true,
      type: Object,
    },
    clearable: Boolean,
    modelValue: {},

    publishedOnly: {
      default: false,
      type: Boolean,
    },
    disabled: Boolean,
    message:{},
  },

  data() {
    return {
      pages: [],
      total: false,

      busy: false,

      search: "",
      menu: false,
    };
  },
  watch: {
    search: threads.debounceSearch(function () {
      if (!this.menu) return; // Search only if menu is open!
      this.getPages();
    }),
  },

  created() {
    this.getPages();
  },

  methods: {
    getPages() {
      this.busy = true;

      const handleSuccessResponse = ({ pages, total }) => {
        this.pages = pages;
        this.total = total;

        const val = this.pages.find((page) => {
          return (
            page.id ===
            (this.modelValue && this.isObject(this.modelValue)
              ? this.modelValue.id
              : this.modelValue)
          );
        });

        if (this.modelValue && !val) {
          // Value not found auto call click clear!
          this.$emit("click:clear");
        }
        if (this.modelValue && val && this.isObject(this.modelValue)) {
          Object.assign(this.modelValue, val); // Update value! value can be abstracted {id}!
        }
      };

      window.$backoffice.page
        .optimize(60)
        .cancellation(true)
        .list(this.shop.id, 0, 20, {
          // Must contain this id:
          contain:
            this.modelValue && this.isObject(this.modelValue)
              ? this.modelValue.id
              : this.modelValue,
          search: this.search,

          published_only: this.publishedOnly,
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
