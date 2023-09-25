<template>
  <div class="c-container -force-rounded pa-2 pa-sm-3 d-flex flex-column">
    <v-card
      class="c-widget -hover flex-grow-1"
      :to="{
        name: 'CommunityCategoryPage',
        params: {
          category_id: category.id,
          category_slug: slugify(category.title),
        },
      }"
    >
      <!-- Image -->
      <community-image
        :src="getShopImagePath(category.image)"
        :aspect-ratio="1"
        width="100%"
      >
        <v-fade-transition>
          <v-row v-if="showReport && timeSeries" class="sta">
            <!-- Value charts -->

            <v-col cols="6" v-for="item in keys" :key="item.key">
              <span class="subtitle-2"> {{ item.title }}</span>
              <small class="d-block">in last 7 days</small>

              <h3>{{ timeSeries.totalOf(item.key) }}</h3>
              <trend-sparkline
                :value="timeSeries.arrayOfForceInterpolateZero(item.key)"
                fill
                height="32"
              ></trend-sparkline>
            </v-col>

            <!-- background chart -->
            <v-sparkline
              :smooth="20"
              color="#29323977"
              :line-width="2"
              :value="timeSeries.arrayOfForceInterpolateZero('impressions')"
              auto-draw
              :height="150"
              :padding="0"
              stroke-linecap="round"
              fill
              style="
                position: absolute;
                left: 0;
                bottom: 0;
                z-index: -1;
                width: 100%;
              "
              class="fadeIn delay_500"
            >
            </v-sparkline>
          </v-row>
        </v-fade-transition>
      </community-image>

      <div v-if="todayData && todayData.topics" class="absolute-bottom-end subtitle-2 text-success" title="New topics today">
        <v-icon color="#0ba360" x-small>lens</v-icon> {{todayData.topics}}
      </div>

      <div v-if="todayData && todayData.comments" class="absolute-bottom-center subtitle-2 blue--text" title="New comments today">
        <v-icon color="blue" x-small>comment</v-icon> {{todayData.comments}}
      </div>

      <div v-if="todayData && todayData.posts" class="absolute-bottom-start subtitle-2 red--text" title="New posts today">
        <v-icon color="red" x-small>person</v-icon> {{todayData.posts}}
      </div>

      <v-card-title>{{ category.title }}</v-card-title>
      <v-card-subtitle style="min-height: 60px"
        >{{ category.desc }}
      </v-card-subtitle>

    </v-card>


  </div>
</template>

<script>
import CommunityImage from "../image/CommunityImage.vue";
import TrendSparkline from "../statistics/TrendSparkline.vue";
import { TimeSeries } from "../../../../../core/timeserie/TimeSeries";
export default {
  name: "CommunityCategoryCard",
  components: { TrendSparkline, CommunityImage },
  props: {
    category: {
      required: true,
      type: Object,
    },
    showReport: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      timeSeries: null,

      keys: [
        { key: "topics", title: this.$t("community.commons.topics") },
        { key: "posts", title: this.$t("community.commons.posts") },
        { key: "comments", title: this.$t("community.commons.comments") },
        { key: "reactions", title: this.$t("community.commons.reactions") },
      ],
    };
  },

  computed:{
    todayData() {
      return this.timeSeries && this.timeSeries.todayData();
    },
  },

  created() {
    if (this.category.data)
      this.timeSeries = new TimeSeries(this.category.data, null, 0, 7);
  },
};
</script>

<style scoped lang="scss">
.sta {
  width: 100%;
  background: #ffffffd9;
  height: 100%;
  margin: 0;
  small {
    font-weight: 400;
  }
}

</style>
