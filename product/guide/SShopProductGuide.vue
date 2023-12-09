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
  <div v-if="guide_article" class="s--shop-product-guide">
    <v-container class="my-16 position-relative">
      <s-expand-view
        class="master-article-container"
        max-height="60vh"
        min-height="100px"
      >
        <s-article-editor
          class="article samin-article-content my-4 text-start"
          :title="guide_article.title"
          :body="guide_article.body"
          :only-view="true"
          :edit="false"
          suffix-id="guide"
        >
        </s-article-editor>
      </s-expand-view>

      <!-- ▁▁▁▁▁▁▁ Go to admin panel button ▁▁▁▁▁▁▁ -->
      <div
        v-if="$vuetify.breakpoint.mdAndUp && admin_url_guide"
        class="text-end"
      >
        <v-btn
          dark
          :href="admin_url_guide"
          target="_blank"
          class="tnt fadeIn"
          title="Open product admin panel"
        >
          <img
            src="../../assets/selldone-logo/logo-mini-white.svg"
            width="16"
            height="16"
            class="me-1"
          />

          Edit Guide <v-icon class="mx-1" small>open_in_new</v-icon></v-btn
        >
      </div>
    </v-container>
  </div>
</template>

<script>
import SArticleEditor from "@components/article/SArticleEditor.vue";
import { LogisticProfileType } from "@core/enums/logistic/LogisticProfileType";
import { SetupService } from "@core/server/SetupService";

import SExpandView from "@components/ui/expand-view/SExpandView.vue";

export default {
  name: "SShopProductGuide",
  props: {
    shop: {
      require: true,
    },
    product: {
      require: true,
    },
  },
  components: {
    SExpandView,
    SArticleEditor,
  },

  data: function () {
    return {};
  },

  computed: {
    // ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Logistic Profile > Guide ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

    guide_profile() {
      return (
        this.product &&
        this.product.profiles &&
        this.product.profiles.find(
          (p) => p.type === LogisticProfileType.GUIDE.value
        )
      );
    },
    guide_article() {
      return this.guide_profile ? this.guide_profile.article : null;
    },

    admin_url_guide() {
      const can_edit = this.product?.article_pack?.can_edit;

      return (
        this.guide_profile &&
        this.USER() &&
        (this.USER_ID() === this.shop.user_id || can_edit) &&
        SetupService.MainServiceUrl() +
          `/shuttle/shop/${this.shop.id}/logistic/profiles/${this.guide_profile.id}/dashboard`
      );
    },
  },

  watch: {},
  created() {},

  methods: {},
};
</script>

<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-product-guide {

}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-product-guide {

}
</style>
