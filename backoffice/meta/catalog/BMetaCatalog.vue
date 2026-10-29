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
  <section
    class="sd-modern-widget b-meta-catalog text-start"
    aria-labelledby="meta-catalog-title"
  >
    <header class="sd-modern-title b-meta-catalog__heading">
      <img
        :src="require('../../../assets/trademark/meta.png')"
        alt=""
        width="23"
        height="23"
      />
      <div>
        <h2 id="meta-catalog-title" class="sd-modern-title-text">
          {{ $t("shop_meta.catalog.title") }}
        </h2>
        <p class="sd-modern-subtitle">{{ $t("shop_meta.catalog.subtitle") }}</p>
      </div>
    </header>

    <div
      class="b-meta-catalog__flow"
      role="img"
      :aria-label="$t('shop_meta.catalog.flow_label', { shop: shop.title })"
    >
      <div class="b-meta-catalog__node">
        <v-avatar v-if="shop.icon" class="hover-scale-small" size="24">
          <v-img :src="getShopImagePath(shop.icon, 96)" alt="" />
        </v-avatar>
        <v-icon v-else size="23" aria-hidden="true">storefront</v-icon>
        <div>
          <div class="b-meta-catalog__node-title">{{ shop.title }}</div>
          <div class="b-meta-catalog__node-subtitle">
            {{ $t("shop_meta.catalog.products") }}
          </div>
        </div>
      </div>
      <span class="b-meta-catalog__wire" aria-hidden="true"
        ><v-icon size="16">{{
          $vuetify.locale.isRtl ? "arrow_back" : "arrow_forward"
        }}</v-icon></span
      >
      <div class="b-meta-catalog__node">
        <span class="b-meta-catalog__brands">
          <img
            src="../../../assets/trademark/facebook.svg"
            alt=""
            width="20"
            height="20"
          />
          <img
            src="../../../assets/trademark/instagram.svg"
            alt=""
            width="20"
            height="20"
          />
        </span>
        <div>
          <div class="b-meta-catalog__node-title">
            {{ $t("shop_meta.catalog.meta_catalog") }}
          </div>
          <div class="b-meta-catalog__node-subtitle">Facebook · Instagram</div>
        </div>
      </div>
    </div>

    <div class="b-meta-catalog__feed-heading">
      <span class="sd-modern-list-header">{{
        $t("shop_meta.catalog.feed_url")
      }}</span>
      <v-btn
        class="sd-modern-button sd-modern-button--inline b-meta-catalog__guide"
        color="primary"
        href="https://www.facebook.com/business/help/125074381480892?id=725943027795860"
        target="_blank"
        rel="noopener noreferrer"
        variant="text"
      >
        {{ $t("shop_meta.catalog.guide") }}
        <v-icon end size="14" aria-hidden="true">north_east</v-icon>
      </v-btn>
    </div>

    <div
      v-if="total_products > count_in_page"
      class="sd-modern-notice b-meta-catalog__notice"
    >
      <v-icon size="16" color="warning" aria-hidden="true"
        >warning_amber</v-icon
      >
      <span>{{ $t("shop_meta.catalog.multiple_notice") }}</span>
    </div>
    <div
      v-for="(feed, index) in feedUrls"
      :key="feed"
      class="b-meta-catalog__feed"
    >
      <p v-if="feedUrls.length > 1" class="b-meta-catalog__page">
        {{ $t("shop_meta.catalog.page", { page: $n(index + 1) }) }}
      </p>
      <div class="b-meta-catalog__feed-row">
        <code class="b-meta-catalog__url" dir="ltr">{{ feed }}</code>
        <v-tooltip
          location="top"
          content-class="sd-modern-tooltip text-start"
          open-on-focus
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="sd-modern-icon-button"
              variant="text"
              icon
              :aria-label="$t('shop_meta.catalog.copy')"
              @click="copyToClipboard(feed)"
            >
              <v-icon aria-hidden="true">content_copy</v-icon>
            </v-btn>
          </template>
          {{ $t("shop_meta.catalog.copy") }}
        </v-tooltip>
      </div>
    </div>
    <p class="b-meta-catalog__hint">{{ $t("shop_meta.catalog.feed_hint") }}</p>

    <details class="b-meta-catalog__help">
      <summary>
        {{ $t("shop_meta.catalog.feed_language")
        }}<v-icon size="15" aria-hidden="true">expand_more</v-icon>
      </summary>
      <p>
        {{ $t("shop_meta.catalog.language_help") }}
        <code dir="ltr">?language=en</code>,
        <code dir="ltr">?language=fr</code>,
        <code dir="ltr">?language=de</code>.
        {{ $t("shop_meta.catalog.paged_language_help") }}
        <code dir="ltr">&amp;language=en</code>.
      </p>
    </details>
  </section>
</template>

<script lang="ts">
import { ShopURLs } from "@selldone/core-js/helper";

export default {
  name: "BMetaCatalog",
  inject: ["$timeSeriesShopData"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    count_in_page: 1000,
  }),
  computed: {
    facebook_catalog_feed() {
      return `${ShopURLs.MainShopUrl(this.shop)}/rss/facebook`;
    },

    feedUrls() {
      return this.total_products > this.count_in_page
        ? this.pages.map((page) => `${this.facebook_catalog_feed}?page=${page}`)
        : [this.facebook_catalog_feed];
    },

    pages() {
      return Array.from(
        { length: Math.ceil(this.total_products / this.count_in_page) },
        (_, i) => i + 1,
      );
    },

    lastDayData() {
      return this.$timeSeriesShopData.lastDayData();
    },

    total_products() {
      return (
        this.lastDayData.total_products_virtual +
        this.lastDayData.total_products_physical +
        this.lastDayData.total_products_file +
        this.lastDayData.total_products_service +
        this.lastDayData.total_products_subscription
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.b-meta-catalog {
  padding: 26px;
  font-family: inherit;
  font-size: 13px;
  line-height: 21px;

  &__heading {
    gap: 11px;
  }
  &__heading > img {
    flex: 0 0 23px;
    margin-block-start: 2px;
    object-fit: contain;
  }
  &__heading .sd-modern-title-text {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 500;
    line-height: 25px;
    letter-spacing: -0.15px;
  }
  &__heading .sd-modern-subtitle {
    margin: 0;
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
  }
  &__flow {
    display: flex;
    align-items: center;
    margin-block: 26px;
  }
  &__node {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    min-height: 62px;
    padding: 13px 15px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
  }
  &__node > .v-icon {
    color: var(--sd-modern-muted);
  }
  &__node-title {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  &__node-subtitle {
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 17px;
  }
  &__brands {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 7px;
  }
  &__brands img {
    object-fit: contain;
  }
  &__wire {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 24px;
    padding-inline: 8px;
    color: var(--sd-modern-muted);
  }
  &__wire::before {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--sd-modern-border);
  }
  &__feed-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 5px 16px;
    margin-block-end: 9px;
  }
  &__guide {
    font-size: 12px;
    line-height: 20px;
  }
  &__notice {
    align-items: flex-start;
    flex-wrap: nowrap;
    gap: 9px;
    margin-block-end: 15px;
    padding: 13px;
    font-size: 12px;
    line-height: 20px;
  }
  &__notice > .v-icon {
    margin-block-start: 2px;
  }
  &__feed + &__feed {
    margin-block-start: 9px;
  }
  &__page {
    margin: 0 0 8px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__feed-row {
    display: flex;
    align-items: center;
    gap: 13px;
    min-width: 0;
  }
  &__url {
    display: block;
    flex: 1;
    min-width: 0;
    padding: 14px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    background: var(--sd-modern-inset);
    color: rgb(var(--v-theme-on-surface));
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    text-align: start;
    overflow-wrap: anywhere;
  }
  &__hint {
    margin: 9px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__help {
    margin-block-start: 17px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }
  &__help summary {
    display: flex;
    align-items: center;
    gap: 7px;
    width: fit-content;
    min-height: 32px;
    list-style: none;
    color: rgb(var(--v-theme-on-surface));
    cursor: pointer;
  }
  &__help summary::-webkit-details-marker {
    display: none;
  }
  &__help[open] summary > .v-icon {
    transform: rotate(180deg);
  }
  &__help p {
    margin: 7px 0 0;
    max-width: 560px;
  }
  &__help code {
    color: rgb(var(--v-theme-on-surface));
    font-family: inherit;
    font-size: 12px;
    unicode-bidi: isolate;
    white-space: nowrap;
  }

  @media (max-width: 650px) {
    padding: 21px;
    &__node {
      padding: 11px;
      gap: 8px;
    }
    &__node-subtitle {
      display: none;
    }
    &__node-title {
      font-size: 12px;
    }
    &__brands {
      gap: 5px;
    }
    &__brands img {
      width: 17px;
      height: 17px;
    }
  }
  @media (max-width: 480px) {
    &__flow {
      flex-direction: column;
      align-items: stretch;
    }
    &__wire {
      flex: auto;
      min-height: 27px;
      padding-inline: 23px;
    }
    &__wire::before {
      flex: 0 0 1px;
      height: 24px;
    }
    &__wire > .v-icon {
      transform: rotate(90deg);
      margin-inline-start: -8px;
      margin-block-start: 16px;
    }
    &__wire > .v-icon:dir(rtl) {
      transform: rotate(-90deg);
    }
  }
  @media (max-width: 390px) {
    padding: 18px;
  }
  @media (max-width: 599px), (pointer: coarse) {
    &__guide,
    &__help summary {
      min-height: 44px;
    }
  }
}
</style>
