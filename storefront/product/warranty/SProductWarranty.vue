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
  <div
    v-if="warranty_article || return_policy_article"
    class="s--shop-product-warranty"
  >
    <v-container v-if="has_big_header" class="my-16" fluid>
      <v-row align="center" justify="space-between">
        <v-col class="text-start" cols="12" md="6">
          <v-list-subheader>
            <span v-if="has_return_warranty" class="me-2">
              ●
              {{
                $t("product_info.return_in_days", {
                  days: product.return_warranty,
                })
              }}
            </span>
            <span v-if="product.warranty"> ● {{ product.warranty }} </span>
          </v-list-subheader>

          <h2 class="text-h3 line-height-normal font-weight-black">
            {{
              warranty_article?.title
                ? warranty_article.title
                : $t("global.commons.warranty")
            }}
          </h2>
        </v-col>

        <v-col v-if="product.warranty" cols="12" md="3" sm="6">
          <div class="-highlight">
            <span class="text-h3 font-weight-black">{{
              product.warranty
            }}</span>
          </div>
          <div>Product Warranty!</div>
        </v-col>

        <v-col v-if="has_return_warranty" cols="12" md="3" sm="6">
          <div class="-highlight">
            <span class="text-h1 font-weight-black">{{
              product.return_warranty
            }}</span>
            <b class="mx-a">/ {{ $t("global.commons.days") }}</b>
          </div>
          <div>Return Warranty!</div>
        </v-col>
      </v-row>
    </v-container>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ TAB > Warranty ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-container v-if="warranty_article" class="my-16 position-relative">
      <u-expand-view
        class="master-article-container"
        max-height="60vh"
        min-height="100px"
      >
        <s-article-editor
          :body="warranty_article.body"
          :edit="false"
          :only-view="true"
          :title="has_big_header ? null : warranty_article.title"
          class="article samin-article-content my-4 text-start"
          suffix-id="shipping"
        >
          <template v-slot:after-title></template>
        </s-article-editor>
      </u-expand-view>

      <!-- ▁▁▁▁▁▁▁ Go to admin panel button ▁▁▁▁▁▁▁ -->

      <div
        v-if="$vuetify.display.mdAndUp && admin_url_warranty"
        class="text-end"
      >
        <v-btn
          :href="admin_url_warranty"
          class="tnt fadeIn"

          target="_blank"
          title="Open product admin panel"
        >
          <img
            class="me-1"
            height="16"
            src="../../../assets/selldone-logo/logo-mini-white.svg"
            width="16"
          />

          Edit Warranty

          <v-icon class="mx-1" size="small">open_in_new</v-icon>
        </v-btn>
      </div>
    </v-container>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ TAB > Return Policy ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <v-container v-if="return_policy_article" class="my-16 position-relative">
      <u-expand-view
        class="master-article-container"
        max-height="60vh"
        min-height="100px"
      >
        <s-article-editor
          :body="return_policy_article.body"
          :edit="false"
          :only-view="true"
          :title="return_policy_article.title"
          class="article samin-article-content my-4 text-start"
          suffix-id="return"
        ></s-article-editor>
      </u-expand-view>

      <!-- ▁▁▁▁▁▁▁ Go to admin panel button ▁▁▁▁▁▁▁ -->

      <div
        v-if="$vuetify.display.mdAndUp && admin_url_return_policy"
        class="text-end"
      >
        <v-btn
          :href="admin_url_return_policy"
          class="tnt fadeIn"

          target="_blank"
          title="Open product admin panel"
        >
          <img
            class="me-1"
            height="16"
            src="../../../assets/selldone-logo/logo-mini-white.svg"
            width="16"
          />

          Edit Return Policy
          <v-icon class="mx-1" size="small">open_in_new</v-icon>
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script>
import SArticleEditor from "../../../article/SArticleEditor.vue";
import { LogisticProfileType } from "@selldone/core-js/enums/logistic/LogisticProfileType";
import { SetupService } from "@selldone/core-js/server/SetupService";
import UExpandView from "../../../ui/expand-view/UExpandView.vue";

export default {
  name: "SProductWarranty",
  props: {
    shop: {
      require: true,
    },
    product: {
      require: true,
    },
  },
  components: {
    UExpandView,
    SArticleEditor,
  },

  data: function () {
    return {};
  },

  computed: {
    has_big_header() {
      return this.product.warranty || this.has_return_warranty;
    },

    has_return_warranty() {
      return this.product.return_warranty > 0;
    },

    // ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Logistic Profile > Warranty ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

    warranty_profile() {
      return (
        this.product &&
        this.product.profiles &&
        this.product.profiles.find(
          (p) => p.type === LogisticProfileType.WARRANTY.value,
        )
      );
    },

    warranty_article() {
      return this.warranty_profile ? this.warranty_profile.article : null;
    },

    admin_url_warranty() {
      const can_edit = this.product?.article_pack?.can_edit;

      return (
        this.warranty_profile &&
        this.USER() &&
        (this.USER_ID() === this.shop.user_id || can_edit) &&
        SetupService.MainServiceUrl() +
          `/shuttle/shop/${this.shop.id}/logistic/profiles/${this.warranty_profile.id}/dashboard`
      );
    },

    // ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Logistic Profile > Return Policy ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

    return_policy_profile() {
      return (
        this.product &&
        this.product.profiles &&
        this.product.profiles.find(
          (p) => p.type === LogisticProfileType.RETURN_POLICY.value,
        )
      );
    },

    return_policy_article() {
      return this.return_policy_profile
        ? this.return_policy_profile.article
        : null;
    },

    admin_url_return_policy() {
      const can_edit = this.product?.article_pack?.can_edit;

      return (
        this.return_policy_profile &&
        this.USER() &&
        (this.USER_ID() === this.shop.user_id || can_edit) &&
        SetupService.MainServiceUrl() +
          `/shuttle/shop/${this.shop.id}/logistic/profiles/${this.return_policy_profile.id}/dashboard`
      );
    },
  },

  watch: {},
  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-product-warranty {
  .-highlight {
    min-height: 96px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
  }
}
</style>
