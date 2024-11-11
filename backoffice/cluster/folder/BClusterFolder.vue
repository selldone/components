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
  <div
    class="position-relative d-flex flex-column align-center justify-center hover-up"
  >
    <div class="position-relative">
      <v-icon
        :color="isBack ? '#000' : cluster.color ? cluster.color : '#333'"
        :size="small ? 64 : 100"
        class="no-inv"
        >folder
      </v-icon>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Category Image ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div
        :style="{ marginTop: iconOnly ? '3px' : '4px' }"
        class="center-absolute z1"
      >
        <circle-image
          v-if="cluster.icon"
          :size="small ? 24 : 36"
          :src="getShopImagePath(cluster.icon, 128)"
          class="pos-img hover-scale force-top"
        ></circle-image>
        <v-icon v-else :size="small ? 24 : 36" color="#eee"
          >{{ isBack ? $t("icons.arrow_back") : "workspaces_filled" }}
        </v-icon>
      </div>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Title ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <small v-if="!iconOnly" class="d-block single-line">
      <v-icon v-if="isBack" class="me-1" size="small"
        >{{ $t("icons.chevron_back") }}
      </v-icon>

      {{ cluster.name?.limitWords(3) }}</small
    >
  </div>
</template>

<script lang="ts">
import CircleImage from "../../../ui/image/CircleImage.vue";

export default {
  name: "BClusterFolder",
  components: { CircleImage },
  props: {
    cluster: {
      required: true,
      type: Object,
    },
    iconOnly: {
      type: Boolean,
    },
    small: {
      type: Boolean,
    },
    isBack: {
      type: Boolean,
    },
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.pos-img {
  border: solid 2px #fff;
}

.bottom-r {
  position: absolute;
  top: 64px;
  right: 12px;

  .v-icon {
    margin: 0 1px;
    vertical-align: baseline;
  }
}

.top-l {
  position: absolute;
  top: 16px;
  left: 12px;
}

.top-r {
  position: absolute;
  top: 25px;
  right: 12px;
}

.bottom-l {
  position: absolute;
  top: 62px;
  left: 12px;
}
</style>
