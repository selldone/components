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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="b-category-add-header text-start">
    <v-toolbar class="b-category-add-header__toolbar" color="surface" flat>
      <v-btn
        class="sd-modern-button sd-modern-button--inline"
        variant="text"
        @click="$emit('back')"
      >
        <v-icon start aria-hidden="true">{{ $t("icons.arrow_back") }}</v-icon>
        {{ $t("add_category.menu.back") }}
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        v-if="category"
        :href="`${ShopURLs.MainShopUrl(shop)}/${category.name}-category`"
        class="sd-modern-button sd-modern-button--inline b-category-add-header__public"
        target="_blank"
        rel="noopener noreferrer"
        variant="text"
      >
        <v-avatar
          v-if="category.icon"
          class="me-2 avatar-gradient -thin -category"
          size="28"
        >
          <v-img :src="getShopImagePath(category.icon, 64)"></v-img>
        </v-avatar>

        {{ $t("add_category.modern.open_category") }}
        <v-icon end aria-hidden="true">north_east</v-icon>
      </v-btn>
    </v-toolbar>

    <div class="b-category-add-header__canvas sd-modern-canvas">
      <div class="b-category-add-header__content">
        <header class="b-category-add-header__heading">
          <v-icon size="22" aria-hidden="true">tune</v-icon>
          <div>
            <h1>
              {{
                $t(
                  category
                    ? "add_category.title_edit"
                    : "add_category.title_update",
                )
              }}
            </h1>
            <p class="sd-modern-subtitle">
              {{ $t("add_category.modern.page_header_subtitle") }}
            </p>
          </div>
        </header>
        <nav
          v-if="category"
          class="sd-modern-section-nav b-category-add-header__nav"
          :aria-label="$t('add_category.title_edit')"
        >
          <v-btn
            class="sd-modern-section-nav__item"
            variant="text"
            :aria-current="tab === 'setting' ? 'location' : undefined"
            @click="$emit('update:tab', 'setting')"
          >
            <v-icon size="16" aria-hidden="true">settings</v-icon>
            {{ $t("add_category.menu.settings") }}
          </v-btn>

          <v-btn
            class="sd-modern-section-nav__item"
            variant="text"
            :aria-current="tab === 'filter' ? 'location' : undefined"
            @click="$emit('update:tab', 'filter')"
          >
            <v-icon size="16" aria-hidden="true">filter_alt</v-icon>
            {{ $t("add_category.menu.filter") }}
          </v-btn>

          <v-btn
            class="sd-modern-section-nav__item"
            variant="text"
            :aria-current="tab === 'template' ? 'location' : undefined"
            @click="$emit('update:tab', 'template')"
          >
            <v-icon size="16" aria-hidden="true">layers</v-icon>
            {{ $t("global.commons.template") }}
          </v-btn>

          <v-btn
            class="sd-modern-section-nav__item"
            variant="text"
            :aria-current="tab === 'engine' ? 'location' : undefined"
            @click="$emit('update:tab', 'engine')"
          >
            <v-icon size="16" aria-hidden="true">auto_mode</v-icon>
            {{ $t("global.commons.engine") }}
          </v-btn>

          <v-btn
            class="sd-modern-section-nav__item"
            variant="text"
            :aria-current="tab === 'critical' ? 'location' : undefined"
            @click="$emit('update:tab', 'critical')"
          >
            <v-icon size="16" aria-hidden="true">warning_amber</v-icon>
            {{ $t("global.commons.critical_zone") }}
          </v-btn>
        </nav>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ShopURLs } from "@selldone/core-js/helper";

export default {
  name: "BCategoryAddHeader",
  components: {},
  emits: ["back", "update:tab"],
  props: {
    shop: {
      required: true,
      type: Object,
    },

    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
    category: {
      required: false,
      type: Object,
    },

    tab: {
      default: "setting",
    },
  },

  data: () => ({}),
  computed: {
    ShopURLs() {
      return ShopURLs;
    },
  },
  watch: {},
  created() {},
  mounted() {},

  methods: {},
};
</script>

<style scoped lang="scss">
.b-category-add-header {
  flex: 0 0 auto;

  &__toolbar {
    padding-inline: 14px;
  }
  &__public {
    max-width: calc(100% - 100px);
  }
  &__canvas {
    display: flow-root;
    padding: 26px 30px 0;
  }
  &__content {
    width: 100%;
    max-width: 800px;
    margin-inline: auto;
  }
  &__heading {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 22px;
    > .v-icon {
      margin-top: 3px;
    }
    > div {
      min-width: 0;
    }
    h1 {
      margin: 0;
      font-size: 21px;
      font-weight: 600;
      line-height: 28px;
      letter-spacing: -0.25px;
    }
    .sd-modern-subtitle {
      margin-top: 4px;
      font-size: 13px;
      line-height: 21px;
    }
  }
  &__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 20px;
    .sd-modern-section-nav__item {
      padding: 10px 13px;
      min-height: 40px;
      font-size: 13px;
      font-weight: 400;
      line-height: 20px;
    }
    .sd-modern-section-nav__item[aria-current="location"] {
      font-weight: 500;
    }
  }

  @media (max-width: 660px) {
    &__toolbar {
      padding-inline: 2px;
    }
    &__public {
      font-size: 12px;
    }
    &__canvas {
      padding: 22px 16px 0;
    }
    &__heading {
      margin-bottom: 16px;
      h1 {
        font-size: 20px;
      }
    }
    &__nav {
      gap: 3px;
      margin-bottom: 17px;
      .sd-modern-section-nav__item {
        padding: 10px 9px;
        min-height: 44px;
        font-size: 12px;
      }
    }
  }
}
</style>
