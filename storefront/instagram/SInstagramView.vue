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
  <div v-resize="onResize" class="instagram">
    <v-container v-if="editable">
      <header class="header">
        <v-row>
          <v-col class="text-center avatar-con" cols="2" md="4">
            <v-avatar
              :size="$vuetify.display.smAndDown ? 77 : 168"
              class="story-border"
            >
              <img :src="profile_image" />
            </v-avatar>
          </v-col>

          <v-col cols="10" md="8">
            <div class="account-info">
              <h2 class="user-id">
                {{ instagram.userName }}
                <v-icon
                  v-if="instagram.verified"
                  class="ms-2"
                  color="blue"
                  size="18"
                  >verified
                </v-icon>
              </h2>
              <div v-if="false" class="-buttons">
                <v-btn
                  :to="
                    editable
                      ? undefined
                      : { name: window.$storefront.routes.BASKET_PAGE }
                  "
                  color="primary"
                  size="small"
                  ><b>Checkout</b></v-btn
                >
                <v-btn
                  :to="
                    editable
                      ? undefined
                      : { name: window.$storefront.routes.BASKET_PAGE }
                  "
                  class="ms-2"
                  color="primary"
                  size="small"
                >
                  <v-icon>shopping_cart</v-icon>
                </v-btn>
              </div>
            </div>
            <div class="account-counts">
              <ul class="list">
                <li class="list_item">
                  <span>{{
                    numeralFormat(instagram.mediaCount, "0.[0]a")
                  }}</span
                  >posts
                </li>
                <li class="list_item">
                  <span>{{ numeralFormat(instagram.followers, "0.[0]a") }}</span
                  >followers
                </li>
                <li class="list_item">
                  <span>{{ numeralFormat(instagram.following, "0.[0]a") }}</span
                  >following
                </li>
              </ul>
            </div>

            <div class="user-info">
              <h1 class="user-name">{{ instagram.fullName }}</h1>
              <div v-html="SmartConvertTextToHtml(instagram.biography)"></div>
              <a href="#" target="_blank">{{ instagram.externalUrl }}</a>
            </div>
          </v-col>
        </v-row>
      </header>
    </v-container>
    <!-- Place holder -->
    <v-container v-if="busy_fetch && !medias.length">
      <v-row :dense="$vuetify.display.smAndDown">
        <v-col key="h" class="d-flex py-12 px-10 border-bottom" cols="12">
          <div v-for="i in 4" :key="i" class="m-3">
            <v-avatar class="mb-2" color="#eee" size="72"></v-avatar>
            <div style="width: 90%; height: 20px; background-color: #eee"></div>
          </div>
        </v-col>
        <v-col v-for="i in 12" :key="i" cols="4">
          <v-responsive :aspect-ratio="1" style="background-color: #eee">
          </v-responsive>
        </v-col>
      </v-row>
    </v-container>

    <instagram-view-highlights
      v-if="highlights.length"
      :editable="editable"
      :highlights="highlights"
      :instagram="instagram"
      class="container"
    ></instagram-view-highlights>

    <div class="container">
      <!--  <template v-if="editable">
  <v-btn
        :color="show_heat ? 'blue' : undefined"
        icon
        title="Show heatmap"
        variant="text"
        @click="toggleHeat"
      >
        <v-icon>bar_chart</v-icon>
      </v-btn>

      <v-expand-transition>
        <div v-if="show_heat">
          <v-btn-toggle
            v-model="heatmap_filter"
            :style="{ direction: $vuetify.locale.isRtl ? 'rtl' : 'ltr' }"
            class="fadeIn widget-toggle"
            mandatory
            multiple
            rounded
            selected-class="black-flat"
            @update:model-value="initHeatmap"
          >
            <v-btn stacked title="Likes" value="likes">
              <v-icon
                :color="heatmap_filter.includes('likes') ? 'red' : undefined"
                >favorite
              </v-icon>
              likes
            </v-btn>
            <v-btn stacked title="Comments" value="comments">
              <v-icon
                :color="
                  heatmap_filter.includes('comments') ? 'blue' : undefined
                "
                >chat_bubble
              </v-icon>
              comments
            </v-btn>
            <v-btn stacked title="Video views" value="videoViewCount">
              <v-icon
                :color="
                  heatmap_filter.includes('videoViewCount')
                    ? 'green'
                    : undefined
                "
                >play_arrow
              </v-icon>
              plays
            </v-btn>
          </v-btn-toggle>
        </div>
      </v-expand-transition>
    </template>
-->
      <instagram-view-medias
        :editable="editable"
        :instagram="instagram"
        :medias="medias"
      >
      </instagram-view-medias>
    </div>

    <v-btn
      v-if="has_more"
      :loading="busy_fetch"
      class="my-5 mx-2"
      color="blue"
      variant="text"
      @click="
        page++;
        fetchInsta();
      "
      >Load more if exist...
    </v-btn>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { SmartConvertTextToHtml } from "@selldone/core-js/helper/html/HtmlHelper";

import InstagramViewMedias from "../../storefront/instagram/InstagramViewMedias.vue";
import InstagramViewHighlights from "../../storefront/instagram/InstagramViewHighlights.vue";

export default {
  name: "SInstagramView",
  mixins: [],
  components: {
    InstagramViewHighlights,
    InstagramViewMedias,
  },
  inject: ["$shop"],
  props: {
    instagram: {
      required: true,
      type: Object,
    },
    editable: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    SmartConvertTextToHtml: SmartConvertTextToHtml,
    busy_fetch: false,

    // ------------------
    page: 1,
    itemsPerPage: 12 * 3,
    has_more: false,
    // ------------------
    medias: [],
    highlights: [],

    // ------------------
    last_heatmap_el: null,
    heatmap: null,
    heatmap_filter: ["likes", "comments"],
    show_heat: false,
  }),

  computed: {
    profile_image() {
      return this.getShopImagePath(this.instagram.picture);
    },
  },

  watch: {},

  created() {
    this.fetchInsta();
  },

  methods: {
    /* toggleHeat() {
       this.show_heat = !this.show_heat;
 
       if (this.show_heat) {
         this.initHeatmap();
       } else {
         this.destroyHeatmap();
       }
     },
 
     onResize() {
       if (!this.show_heat) return;
 
       delay(() => {
         this.initHeatmap();
       }, 500);
     },*/
    //------------------------------------- Visualize Heatmap For Admin ------------------------------------------------
    /*
        initHeatmap() {
          if (!this.show_heat) return;
    
          let data = [];
          let max = 0;
          let min = 10000;
    
          const container_rect =
            this.$refs.medias_container.$el.getBoundingClientRect();
    
          let i = 0;
          this.medias.forEach((media) => {
            let x = (((i % 3) + 0.5) * container_rect.width) / 3;
            let y = ((Math.floor(i / 3) + 0.5) * container_rect.width) / 3;
    
            let val = 0;
            if (this.heatmap_filter.includes("likes")) val += media.likes;
            if (this.heatmap_filter.includes("comments")) val += media.comments;
            if (this.heatmap_filter.includes("videoViewCount"))
              val += media.videoViewCount;
    
            // val=200;
            data.push({
              x: Math.round(x),
              y: Math.round(y),
              value: val,
            });
    
            max = Math.max(max, val);
            min = Math.min(max, val);
            i++;
          });
    
          // Destroy if element change!
          if (
            this.heatmap &&
            this.last_heatmap_el !== this.$refs.medias_container.$el
          ) {
            this.destroyHeatmap();
          }
    
          // console.log('this.$refs.page_render.$el',this.$refs.page_render.$refs)
          if (!this.heatmap) {
            this.heatmap = h337.create({
              container: this.$refs.medias_container.$el,
              maxOpacity: 0.6,
              radius: (0.9 * container_rect.width) / 3,
              blur: 0.7,
              backgroundColor: "rgba(0, 0, 0, 0)",
              gradient: {
                // enter n keys between 0 and 1 here
                // for gradient color customization
                ".5": "#03A9F4",
                ".6": "#FFC107",
                ".8": "#D32F2F",
                ".95": "#C2185B",
              },
            });
          }
    
          this.heatmap.setData({
            min: min,
            max: max,
            data: data, // [{ x: 10, y: 15, value: 5},{ x: 200, y: 105, value: 5}]
          });
          // console.log("data",data, min, max);
          // console.log("data", data, max, this.$refs.medias_container.$el, this.heatmap);
        },
        
        destroyHeatmap() {
          //find corresponding canvas element
          const canvas = this.heatmap._renderer.canvas;
          //remove the canvas from DOM
          $(canvas).remove();
    
          this.heatmap = null;
        },*/
    //-------------------------------------------------------------------------------------

    /**
     * External call function.
     */
    resetData() {
      this.page = 1;
      this.medias = [];
      this.highlights = [];

      this.fetchInsta();
    },

    fetchInsta() {
      if (!this.instagram) return;
      this.busy_fetch = true;

      axios
        .get(
          this.editable
            ? window.API.GET_INSTAGRAM_DATA(this.$shop.id)
            : window.XAPI.GET_INSTAGRAM_DATA(this.$shop.name),
          {
            params: {
              offset: (this.page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$shop.instagram = data.instagram;
            this.medias.push(...data.medias);
            this.highlights.push(...data.highlights);

            // Maybe has more data:
            this.has_more = data.medias.length >= this.itemsPerPage;

            /*  delay(() => {
                  this.initHeatmap();
                }, 500);*/
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.instagram {
  direction: ltr;
  color: #262626;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    Segoe UI,
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
  line-height: 18px;
  font-size: 14px;
  text-align: left;
}

.account-info {
  display: flex;
  padding-left: 28px;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  margin-bottom: 0;

  .user-id {
    margin-bottom: 20px;
  }

  .-buttons {
    display: flex;
    align-items: center;
    padding-left: 0;
  }

  @media (min-width: 768px) {
    margin-bottom: 20px;

    .user-id {
      margin: 0;
    }
    .-buttons {
      padding-left: 20px;
    }
  }
}

.user-id {
  font-size: 28px;
  color: #262626;
  font-weight: 300;
  display: block;
  white-space: nowrap;
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: normal;
}

.account-counts {
  padding: 15px 0 0 20px;
  display: none;
}

.header {
  .list {
    margin-bottom: 20px;
  }

  .list_item {
    font-size: 16px;
    margin-right: 40px;
    color: #262626;
    display: inline-block;

    span {
      color: #262626;
      font-weight: 600;
      margin-right: 4px;
    }
  }
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-info {
  // Mobile
  font-size: 14px;
  line-height: 20px;
  word-wrap: break-word;
  color: #262626;
  margin-left: auto;
  padding-left: 20px;

  .user-name {
    font: inherit;
    display: inline;
    font-weight: 600;
  }

  width: 100vw;
  left: -20vw;
  position: relative;
  padding-top: 12px;

  @media (min-width: 768px) {
    // Desktop
    font-size: 16px;
    line-height: 24px;
    width: auto;
    left: unset;
    position: relative;
    padding-top: 0px;
  }
}

h1 {
  font-size: 2em;
  margin: 0.67em 0;
}

.header .list {
  margin-bottom: 20px;
}

.header .list_item {
  font-size: 16px;
  margin-right: 40px;
  color: #262626;
}

.header .list_item span {
  color: #262626;
  font-weight: 600;
  margin-right: 4px;
}

.avatar-con {
}

@media (min-width: 768px) {
  .account-info {
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    padding-left: 30px;
  }

  .account-counts {
    display: block;
  }
}
</style>
