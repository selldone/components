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
  <component
    :is="to ? 'router-link' : 'div'"
    :class="{ 'img-grayscale': inactive }"
    :title="tooltip"
    :to="to"
    class="position-relative d-flex flex-column align-center justify-center t-all-400 hover-up"
    @click="select"
  >
    <div class="position-relative">
      <v-icon :size="small ? 64 : 100" class="no-inv" color="#eee"
        >insert_drive_file
      </v-icon>

      <u-chart-bar
        v-if="chart"
        :colors="chart.color"
        :dataset="chart.data"
        :height="24"
        :show-title="false"
        class="top-l"
        dense
        narrow
      >
      </u-chart-bar>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Category Image ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div
        :style="{ marginTop: iconOnly ? '3px' : '4px' }"
        class="center-absolute z1"
      >
        <img
          v-if="image && image_tile"
          :height="small ? 18 : 24"
          :src="image"
          :width="small ? 18 : 24"
        />
        <circle-image
          v-else-if="image"
          :size="small ? 24 : 36"
          :src="image"
          class="pos-img hover-scale force-top"
        ></circle-image>
        <v-icon v-else :color="color ? color : '#333'" :size="small ? 20 : 32"
          >{{ icon }}
        </v-icon>
      </div>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Color ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <v-icon v-if="color" :color="color" class="top-l" size="x-small"
      >circle
    </v-icon>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Title ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <small v-if="!iconOnly" :title="title" class="single-line cr-title">{{
      title?.limitWords(3)
    }}</small>

    <span class="bottom-r">
      <v-chip class="px-1" color="transparent" label size="x-small">
        <v-icon size="x-small" start>{{ icon }}</v-icon>

        {{ type }}</v-chip
      >
    </span>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Time Span ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <u-time-progress-bar
      v-if="start_at || end_at"
      :created-time="resource.created_at"
      :end-time="end_at"
      :start-time="start_at"
      class="cr-timespan"
      small
    ></u-time-progress-bar>
  </component>
</template>

<script lang="ts">
import CircleImage from "../../../ui/image/CircleImage.vue";
import UTimeProgressBar from "../../../ui/time/progress-bar/UTimeProgressBar.vue";
import UChartBar from "../../../ui/chart/bar/UChartBar.vue";

export default {
  name: "BClusterResource",
  components: { UChartBar, UTimeProgressBar, CircleImage },
  props: {
    resource: {
      required: true,
      type: Object,
    },
    iconOnly: {
      type: Boolean,
    },
    small: {
      type: Boolean,
    },
    resourceType: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {};
  },

  computed: {
    title() {
      return this.safeGetValue("title");
    },
    tooltip() {
      return this.safeGetValue("tooltip");
    },
    color() {
      return this.safeGetValue("color");
    },
    image() {
      return this.safeGetValue("image");
    },
    image_tile() {
      return this.safeGetValue("image_tile");
    },
    type() {
      return this.safeGetValue("type");
    },
    icon() {
      return this.safeGetValue("icon");
    },
    to() {
      return this.safeGetValue("to");
    },

    start_at() {
      return this.safeGetValue("start_at");
    },
    end_at() {
      return this.safeGetValue("end_at");
    },
    inactive() {
      return this.safeGetValue("inactive");
    },

    chart() {
      return this.safeGetValue("chart");
    },
  },
  methods: {
    safeGetValue(key) {
      if (!this.resourceType[key]) return null;
      return this.isString(this.resourceType[key])
        ? this.resourceType[key]
        : this.isFunction(this.resourceType[key])
          ? this.resourceType[key](this.resource, this)
          : this.resourceType[key]; // Boolean, number,...
    },

    select() {
      if (this.to) {
        this.$nextTick(() => {
          this.$emit("close");
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.pos-img {
  border: solid 2px #fff;
}

.top-l {
  position: absolute;
  top: 16px;
  left: 20px;
}

.top-r {
  position: absolute;
  top: 25px;
  right: 12px;
}

.bottom-l {
  position: absolute;
  top: 72px;
  left: 12px;
}

.cr-title {
  display: block;
  max-width: 100px;
}

.bottom-r {
  position: absolute;
  top: 72px;
  right: 20px;

  .v-icon {
    margin: 0 1px;
    vertical-align: baseline;
  }
}

.cr-timespan {
  position: absolute;
  z-index: 1;
  width: 55%;
  top: 65px;
}
</style>
