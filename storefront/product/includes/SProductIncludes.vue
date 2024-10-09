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
  <v-container v-if="includes?.length" class="s--product-includes">
    <h2>{{ $t("global.commons.included_in_the_product") }}</h2>
    <v-list-subheader class="justify-center">
      {{ $t("global.commons.included_in_the_product_description") }}
    </v-list-subheader>
    <u-fade-scroll v-if="$vuetify.display.mdAndUp" show-arrow small-arrow>
      <div class="d-flex align-start justify-center">
        <v-col v-for="it in includes" :key="it.id" cols="3">
          <v-card
            variant="text"
            flat
            :href="it.path ? undefined : it.url"
            :target="it.url ? '_blank' : undefined"
            :to="
              it.path
                ? {
                    name: window.$storefront?.routes.INCLUDE_PAGE_RENDER,
                    params: { path: it.path, include_id: it.id },
                  }
                : undefined
            "
          >
            <img
              v-if="it.image"
              :src="getShopImagePath(it.image)"
              class="-image"
              loading="eager"
            />

            <div class="-title">
              {{ it.title }}
            </div>
          </v-card>
        </v-col>
      </div>
    </u-fade-scroll>
    <v-carousel
      v-else
      :continuous="true"
      :cycle="true"
      delimiter-icon="circle"
      height="300"
      hide-delimiter-background
      show-arrows="hover"
    >
      <v-carousel-item v-for="it in includes" :key="it.id">
        <v-card
          variant="text"
          flat
          :href="it.path ? undefined : it.url"
          :target="it.url ? '_blank' : undefined"
          :to="
            it.path
              ? {
                  name: window.$storefront?.routes.INCLUDE_PAGE_RENDER,
                  params: { path: it.path, include_id: it.id },
                }
              : undefined
          "
        >
          <img
            v-if="it.image"
            :src="getShopImagePath(it.image)"
            class="-image"
            loading="eager"
          />

          <div class="-title">
            {{ it.title }}
          </div>
        </v-card>
      </v-carousel-item>
    </v-carousel>
  </v-container>
</template>

<script lang="ts">
import UFadeScroll from "@selldone/components-vue/ui/fade-scroll/UFadeScroll.vue";

export default {
  name: "SProductIncludes",
  components: { UFadeScroll },

  inject: ["$product"],
  props: {},
  computed: {
    includes() {
      return this.$product.includes;
    },
  },
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--product-includes {
  text-align: center;

  h2 {
    text-transform: capitalize;
  }

  .-image {
    width: 128px;
    height: 128px;
    object-fit: contain;
    border-radius: 8px;
  }

  .-title {
    margin: 12px 4px;
    font-size: 1.1rem;
    font-weight: 800;
  }

  .v-carousel__controls {
    .v-btn {
      &.v-item--active {
        .v-icon {
          transform: scale(1);
          opacity: 1;
        }
      }

      .v-icon {
        color: #111 !important;
        opacity: 0.4;
        transform: scale(0.4);
        transition: all 0.3s ease-in-out;
      }
    }
  }
}
</style>
