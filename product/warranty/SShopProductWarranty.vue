<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div
    v-if="warranty_article || return_policy_article"
    class="s--shop-product-warranty"
  >
    <v-container v-if="has_big_header" fluid class="my-16">
      <v-row align="center" justify="space-between">
        <v-col cols="12" md="6" class="text-start">
          <v-subheader>
            <span v-if="has_return_warranty" class="me-2">
              ●
              {{
                $t("product_info.return_in_days", {
                  days: product.return_warranty,
                })
              }}
            </span>
            <span v-if="product.warranty"> ● {{ product.warranty }} </span>
          </v-subheader>

          <h2 class="display-2 line-height-normal font-weight-black">
            {{
              warranty_article?.title
                ? warranty_article.title
                : $t("global.commons.warranty")
            }}
          </h2>
        </v-col>

        <v-col v-if="product.warranty" cols="12" sm="6" md="3">
          <div class="-highlight">
            <span class="display-2 font-weight-black">{{
              product.warranty
            }}</span>
          </div>
          <div>Product Warranty!</div>
        </v-col>

        <v-col v-if="has_return_warranty" cols="12" sm="6" md="3">
          <div class="-highlight">
            <span class="display-4 font-weight-black">{{
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
      <expand-view
        class="master-article-container"
        max-height="60vh"
        min-height="100px"
      >
        <s-article-editor
          class="article samin-article-content my-4 text-start"
          :title="has_big_header ? null : warranty_article.title"
          :body="warranty_article.body"
          :only-view="true"
          :edit="false"
          suffix-id="shipping"
        >
          <template v-slot:after-title> </template>
        </s-article-editor>
      </expand-view>

      <!-- ▁▁▁▁▁▁▁ Go to admin panel button ▁▁▁▁▁▁▁ -->

      <div
        v-if="$vuetify.breakpoint.mdAndUp && admin_url_warranty"
        class="text-end"
      >
        <v-btn
          dark
          :href="admin_url_warranty"
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

          Edit Warranty

          <v-icon class="mx-1" small>open_in_new</v-icon>
        </v-btn>
      </div>
    </v-container>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ TAB > Return Policy ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <v-container v-if="return_policy_article" class="my-16 position-relative">
      <expand-view
        class="master-article-container"
        max-height="60vh"
        min-height="100px"
      >
        <s-article-editor
          class="article samin-article-content my-4 text-start"
          :title="return_policy_article.title"
          :body="return_policy_article.body"
          :only-view="true"
          :edit="false"
          suffix-id="return"
        ></s-article-editor>
      </expand-view>

      <!-- ▁▁▁▁▁▁▁ Go to admin panel button ▁▁▁▁▁▁▁ -->

      <div
        v-if="$vuetify.breakpoint.mdAndUp && admin_url_return_policy"
        class="text-end"
      >
        <v-btn
          dark
          :href="admin_url_return_policy"
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

          Edit Return Policy
          <v-icon class="mx-1" small>open_in_new</v-icon></v-btn
        >
      </div>
    </v-container>
  </div>
</template>

<script>
import SArticleEditor from "@components/article/SArticleEditor.vue";
import { LogisticProfileType } from "@core/enums/logistic/LogisticProfileType";
import SetupService from "@core/server/SetupService";
import ExpandView from "@components/ui/expand-view/ExpandView.vue";

export default {
  name: "SShopProductWarranty",
  props: {
    shop: {
      require: true,
    },
    product: {
      require: true,
    },
  },
  components: {
    ExpandView,
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
          (p) => p.type === LogisticProfileType.WARRANTY.value
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
          (p) => p.type === LogisticProfileType.RETURN_POLICY.value
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

<style scoped lang="scss">
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
