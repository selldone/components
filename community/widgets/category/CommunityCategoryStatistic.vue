<template>
  <div>
    <community-statistic-view
      :title="$t('community.category.statistics')"
      v-if="timeSeries && category"
      :community="community"
      :timeSeries="timeSeries"
      is-category
      :category="category"
      class="fadeIn"
    ></community-statistic-view>

    <community-statistic-view-skeleton v-else></community-statistic-view-skeleton>

    <div style="height: 5vh"></div>
  </div>
</template>

<script>
import CommunityStatisticView from "../statistics/CommunityStatisticView.vue";
import { TimeSeries } from "@core/timeserie/TimeSeries";
import CommunityStatisticViewSkeleton from "../statistics/CommunityStatisticViewSkeleton.vue";
export default {
  name: "CommunityCategoryStatistic",
  components: {CommunityStatisticViewSkeleton, CommunityStatisticView },
  props: {
    community: {
      required: true,
      type: Object,
    },
    categoryId: { required: true },
  },

  data() {
    return {
      category: null,
      data: null,
      busy: false,

      timeSeries: null,
      // ---------------------
      offset: 0,
      days: 7,
    };
  },

  created() {
    this.fetchCategoryInfo();
  },
  methods: {
    fetchCallback: function (offset, days) {
      if (this.offset === offset && this.days === days) return; // No change!

      this.offset = offset;
      this.days = days;

      this.fetchCategoryInfo();
    },

    //――――――――――――――――――――――― Category full info ―――――――――――――――――――――――

    fetchCategoryInfo() {
      this.busy = true;
      this.$emit("busy", true);

      axios
        .get(
          window.CAPI.GET_COMMUNITY_CATEGORY_DATA(
            this.community.id,
            this.categoryId
          ), {
                  params: {
                    offset: this.offset,
                    days: this.days,

                  }
                }
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }

          this.category = data.category;
          this.data = data.data;
          // Statistics:
          if (data.data)
            this.timeSeries = new TimeSeries(
              data.data,
              "Category Data",
              this.offset,
              this.days
            );

          // Register fetch callback (Use to refresh by change time span)
          this.timeSeries.fetch = this.fetchCallback;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
          this.$emit("busy", false);
        });
    },
  },
};
</script>

<style scoped></style>
