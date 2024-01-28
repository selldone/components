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
    :category-id="category.id"
    @click="
      $emit('select');
      clicked = true;
    "
    class="position-relative d-flex flex-column align-center justify-center hover-up"
    :class="{ disabled: clicked }"
  >
    <div class="position-relative">
      <v-icon size="100" color="amber" class="no-inv">folder</v-icon>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Connect service icon (top - Right) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div v-if="category.connect_id" class="top-r">
        <v-avatar size="16" rounded
          ><img :src="getConnectIcon(category.connect_id)"
        /></v-avatar>
      </div>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Category Image ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div class="center-absolute z1">
        <circle-image
          :size="36"
          :src="getShopImagePath(category.icon, IMAGE_SIZE_SMALL)"
          class="pos-img hover-scale force-top"
          drop-image="true"
        ></circle-image>
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Vendor Folder ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <div
        v-if="category.vendor_id"
        class="top-l"
        :title="
          'Created by ' +
          (category.vendor ? category.vendor.name : $t('global.commons.vendor'))
        "
      >
        <circle-image
          v-if="category.vendor && category.vendor.icon"
          :size="16"
          :src="getShopImagePath(category.vendor.icon, 64)"
        ></circle-image>
        <v-icon v-else size="small">r_mobiledata</v-icon>
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Products Count ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div
        class="bottom-r small text-white"
        :title="$t('admin_shop.products.folder_widget.products')"
      >
        <v-icon size="x-small" dark>fa:fas fa-box</v-icon>
        {{ numeralFormat(category.products, "0,0a") }}
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Custom Page ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <div
        v-if="category.page_id"
        class="bottom-l"
        :title="`Has custom page | ${category.page_id}.`"
      >
        <v-icon size="small" dark>layers</v-icon>
      </div>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Title ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <small class="d-block single-line">{{
      category.title.limitWords(3)
    }}</small>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Visits Count ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      class="small text-muted"
      :title="$t('admin_shop.products.folder_widget.views')"
    >
      <v-icon class="me-1" size="x-small">fa:fas fa-eye</v-icon>
      {{ numeralFormat(category.visits, "0,0a") }}
    </div>
  </div>
</template>

<script>
import CircleImage from "@components/ui/image/CircleImage.vue";
export default {
  name: "FolderCardMini",
  components: { CircleImage },
  props: {
    category: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      clicked: false,
    };
  },
};
</script>

<style scoped lang="scss">
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
