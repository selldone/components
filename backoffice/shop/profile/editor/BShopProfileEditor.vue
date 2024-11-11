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
  <div>
    <u-loading-progress v-if="busy"></u-loading-progress>

    <div v-else>
      <div v-if="!readOnly" class="widget-buttons">
        <v-btn
          :class="{ disabled: state !== 'changed' }"
          :loading="busy_save"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="saveShopProfile"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save_changes") }}
        </v-btn>
      </div>
      <div class="master-article-container">
        <s-article-editor
          ref="editorContainer"
          :body="profile ? profile.body : ''"
          :enable-title="false"
          :upload-url="upload_url"
          class="article"
          :edit="!readOnly"
          @change="onChangeNote"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SArticleEditor from "../../../../article/SArticleEditor.vue";

export default {
  name: "BShopProfileEditor",
  components: { SArticleEditor },
  props: {
    shop: {
      required: false,
      type: Object,
    },
    type: {
      required: true,
      type: String,
    },
    readOnly: Boolean,
  },

  data: () => ({
    state: "editing",
    profile: null,
    busy: false,
    busy_save: false,
  }),
  computed: {
    upload_url() {
      return window.API.POST_UPDATE_SHOP_PROFILE_IMAGE(this.shop.id, this.type);
    },
  },

  created() {
    this.getFetchShopProfile();
  },

  methods: {
    onChangeNote() {
      this.state = "changed";
    },

    saveShopProfile() {
      const pure_body = this.$refs.editorContainer.purifyBody();

      this.busy_save = true;
      axios
        .post(window.API.POST_SAVE_SHOP_PROFILE(this.shop.id, this.type), {
          body: pure_body,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.state = "no-change";
            this.profile = data.profile;
            this.showSuccessAlert(
              this.$t("global.article.notifications.update_success_title"),
              this.$t("global.article.notifications.update_success"),
            );
          } else {
            this.state = "changed";
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          console.error(error);
          this.state = "changed";
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    getFetchShopProfile() {
      this.busy = true;

      axios
        .get(window.API.GET_SHOP_PROFILE(this.shop.id, this.type))
        .then(({ data }) => {
          if (!data.error) {
            this.profile = data.profile;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          console.error(error);
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
