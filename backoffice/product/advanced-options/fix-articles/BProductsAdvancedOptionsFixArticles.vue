<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <div class="widget-box mb-5">
    <u-widget-header
      icon="description"
      title="Fix Products Descriptions"
    ></u-widget-header>

    <v-list-subheader>
      <div>
        <b
          >Are your product descriptions imported from third-party platforms
          like WooCommerce or via Excel files poorly structured?</b
        >
        Here's the solution.
      </div>
    </v-list-subheader>
    <v-list-subheader>
      With this function, you can automatically resolve issues within all
      product articles. This includes automatic arrangement, image correction,
      and structural fixes. Before utilizing this action, please manually apply
      this function by selecting it from the article editing menu [twice in a
      row]. If you encounter any problems, don't hesitate to contact us. Please
      note, the changes made through this function are irreversible.
    </v-list-subheader>

    <v-img
      :aspect-ratio="1200 / 561"
      :src="require('./assets/auto-fix-product-guide.png')"
      class="rounded-lg"
    ></v-img>

    <u-smart-verify
      v-model="verify_articles"
      class="my-3"
      true-description="I've manually reviewed my articles and everything appears to be in order."
      true-title="I verify this action."
    ></u-smart-verify>
    <div class="widget-buttons">
      <v-btn
        :disabled="!verify_articles"
        :loading="busy_articles"
        color="primary"
        size="x-large"
        @click="autoFixAllProductArticles"
      >
        <v-icon class="me-1">auto_fix_high</v-icon>
        Auto fix now all products
      </v-btn>
    </div>
  </div>
</template>

<script>
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";

export default {
  name: "BProductsAdvancedOptionsFixArticles",
  components: {
    USmartVerify,
  },
  props: {
    shop: {
      required: true,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },
  data: () => ({
    verify_articles: false,
    busy_articles: false,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {},

  created() {},

  mounted() {},

  beforeUnmount() {},
  methods: {
    autoFixAllProductArticles() {
      this.busy_articles = true;
      axios
        .post(
          window.ARTICLE_API.POST_SHOP_ALL_PRODUCTS_ARTICLE_BODY_AUTO_FIX(
            this.shop.id,
          ),
          {
            ids: "*",
          },
        )
        .then(({ data }) => {
          if (data.error) {
            // Error!
            this.showErrorAlert(null, data.error_msg);

            return;
          }

          this.showSuccessAlert(
            "Successfully Updated & Auto-Fixed",
            "All articles pertaining to products have been successfully updated and auto-fixed.",
          );
          this.$emit("close");
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_articles = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
