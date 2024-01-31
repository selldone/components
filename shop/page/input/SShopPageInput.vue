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
      }
    "
    :items="pages"
    :loading="busy"
    :label="$t('campaign.setting.general_setting.page_input')"
    item-title="title"
    :messages="modelValue ? `https://.../pages/${modelValue.name}` : ''"
    @click:clear="$emit('click:clear')"
    v-model:search="search"
    v-model:menu="menu"
    no-filter
    return-object
    variant="underlined"
    :clearable="clearable"
  >
    <template
      v-slot:append-inner
      v-if="modelValue?.id && $route.params.shop_id"
    >
      <v-btn
        icon
        variant="text"
        size="var(--append-inner-button-size)"
        :to="{
          name: 'ShopPageBuilderPage',
          params: { page_id: modelValue.id },
        }"
        title="Edit page"
        target="_blank"
      >
        <v-icon>edit</v-icon>
      </v-btn>
    </template>

    <template v-slot:chip="{ item }">
      <div class="mb-n3">
        <v-avatar :color="item.raw.color" size="32" class="me-2">
          <img v-if="item.raw.image" :src="getShopImagePath(item.raw.image)" />
          <v-icon v-else size="small" dark>architecture</v-icon>
        </v-avatar>
        {{ item.raw.title }}

        <v-icon
          v-if="item.raw.color"
          size="x-small"
          :color="item.raw.color"
          class="mx-1"
          >circle
        </v-icon>
        <v-chip
          size="small"
          color="red"
          class="mx-2"
          v-if="item.raw.published === false"
          >{{ $t("global.commons.draft") }}
        </v-chip>

        <v-avatar
          size="24"
          class="avatar-gradient -thin -staff d-inline-flex me-2"
        >
          <img :src="getUserAvatar(item.raw.user_id)" />
        </v-avatar>
      </div>
    </template>

    <template v-slot:item="{ props, item }">
      <v-list-item
        v-bind="props"
        :prepend-avatar="
          item.raw.image ? getShopImagePath(item.raw.image) : null
        "
        :prepend-icon="item.raw.image ? null : 'architecture'"
        :title="item.raw.title"
        class="text-start"
      >
        <template v-slot:subtitle>
          <v-icon
            v-if="item.raw.color"
            size="16"
            :color="item.raw.color"
            class="me-2"
            >circle
          </v-icon>
          <v-chip
            size="small"
            color="red"
            class="me-2"
            v-if="item.raw.published === false"
            >{{ $t("global.commons.draft") }}
          </v-chip>
          {{ item.raw.note?.limitWords(10) }}
        </template>

        <template v-slot:append>
          <v-avatar
            v-if="item.raw.user_id"
            size="24"
            class="avatar-gradient -thin -staff ms-2"
          >
            <img :src="getUserAvatar(item.raw.user_id)" />
          </v-avatar>
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import threads from "@core/utils/thread/threads";

export default {
  name: "SShopPageInput",
  components: {},
  emits: ["update:modelValue", "click:clear"],
  props: {
    shop: {
      require: true,
      type: Object,
    },

    modelValue: {},

    publishedOnly: {
      default: false,
      type: Boolean,
    },
    clearable: Boolean,
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
      if (!this.menu ) return; // Search only if menu is open!
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

<style scoped lang="scss"></style>
