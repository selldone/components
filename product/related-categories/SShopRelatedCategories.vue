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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div v-if="categories?.length > 0" class="s--shop-related-categories">
    <v-container>
      <h2 class="font-weight-black display-3 text-start">
        {{ $t("product.related_categories_title") }}
      </h2>
    </v-container>

    <v-container class="my-5 py-5" style="max-width: 1720px">
      <fade-scroll center>
        <div class="-categories-container">
          <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ Categories List ━━━━━━━━━━━━━━━━━━━━━━━━ -->

          <div class="-category-card" v-for="item in categories" :key="item.id">
            <router-link
              :to="{
                name: 'ShopCategoryPage',
                params: { category_name: item.name },
              }"
            >
              <v-img
                aspect-ratio="1"
                width="100%"
                :src="getShopImagePath(item.icon)"
                :alt="item.title"
                class="-card-img"
              >
                <div class="-card-content">
                  <div class="-card-title">
                    {{ item.title }}
                  </div>
                  <div class="-card-desc">
                    {{ item.description }}
                  </div>
                </div>
              </v-img>
            </router-link>
          </div>
        </div>
      </fade-scroll>
    </v-container>
  </div>
</template>

<script>
import FadeScroll from "@components/ui/fade-scroll/FadeScroll.vue";

export default {
  name: "SShopRelatedCategories",
  props: {
    shop: {
      require: true,
    },
    product: {
      require: true,
    },
    categories: { require: true, type: Array },
  },
  components: {
    FadeScroll,
  },

  data: function () {
    return {};
  },

  computed: {},

  watch: {},
  created() {},

  methods: {},
};
</script>

<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-related-categories {
  --card-background: #fff;

  --card-width:380px;
  --padding-x:10vw; // 10vw: Add overscroll on sides

  min-height: 30vh;
  margin: 15vh 0 15vh  0;


  // Define breakpoint values
  $breakpoint-mobile: 480px;
  $breakpoint-tablet: 768px;
  $breakpoint-desktop: 1024px;

  // Mobile styles
  @media screen and  (max-width: $breakpoint-tablet) {
    .-categories-container {
      --padding-x:0;
      --card-width:75vw;
    }

  }

  // Tablet styles
  @media screen and  (min-width: $breakpoint-tablet) and (max-width: $breakpoint-desktop - 1px) {
    .-categories-container {
      --padding-x:12px;
      --card-width: min(35vw, 380px);
    }
  }

  // Desktop styles
  @media screen and  (min-width: $breakpoint-desktop) {
    .-categories-container {
      --card-width: min(25vw, 380px);
    }
  }


  .-categories-container {
    display: flex;
    flex-wrap: nowrap;
    //justify-content: center; Cause scroll problem! we set items center in scroll view!
    padding: 36px var(--padding-x); // 10vw: Add overscroll on sides

    min-width: max-content;


    .-category-card {
      text-align: start;
      background: #333;
      border-radius: 6px;
      margin: 8px 12px;
      overflow: hidden;
      min-width: var(--card-width);
      max-width: var(--card-width);

      .-card-img {
        display: flex;
        align-items: center;
      //  justify-content: center;
        padding: 32px;

        &:after {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          pointer-events: none;
          opacity: 0;
          transition: all 0.4s;
        }
      }

      .-card-content {
        color: #fff;
        margin: auto 0 0 0;
        text-align: center;
        font-size: 17px;
        position: relative;
        z-index: 1;
      }
      .-card-title {
        font-weight: 800;
        margin-bottom: 16px;
        font-size: 2rem;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        text-transform: capitalize;
      }
      .-card-desc {
        opacity: 0;
        max-height: 0;
        transition: all 0.5s ease-in-out;
      }

      transition: all 0.3s;
      &:hover {
        .-card-img {
          transform: scale(1.1);
          &:after {
            opacity: 1;
          }
        }
        .-card-desc {
          opacity: 1;
          max-height: 380px;
        }
      }
    }
  }
}
</style>
