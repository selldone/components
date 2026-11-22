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
  <div class="sd-modern-content b-shop-profile-editor text-start">
    <header class="sd-modern-header b-shop-profile-editor__header">
      <div class="sd-modern-title b-shop-profile-editor__heading">
        <span class="sd-modern-icon b-shop-profile-editor__icon">
          <v-icon :icon="icon" size="21" aria-hidden="true" />
        </span>
        <div>
          <h1 class="sd-modern-title-text">{{ title }}</h1>
          <p class="sd-modern-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <v-btn
        :href="storefrontUrl"
        target="_blank"
        rel="noopener noreferrer"
        variant="text"
        class="sd-modern-button sd-modern-button--inline b-shop-profile-editor__view"
      >
        <span>
          {{ $t("shop_profile_editor.view_storefront") }}
          <v-icon size="16" aria-hidden="true">north_east</v-icon>
        </span>
      </v-btn>
    </header>

    <section class="sd-modern-widget b-shop-profile-editor__panel" aria-labelledby="shop-profile-page-content">
      <header class="b-shop-profile-editor__command">
        <h2 id="shop-profile-page-content">{{ $t("shop_profile_editor.content") }}</h2>
        <div class="b-shop-profile-editor__actions">
          <span v-if="!busy && !loadFailed" class="b-shop-profile-editor__state" role="status" :data-dirty="hasChanges && !readOnly">
            <span class="sd-modern-status__dot" aria-hidden="true"></span>
            {{ $t(statusKey) }}
          </span>
          <v-btn
            v-if="!readOnly"
            :disabled="!canSave"
            :loading="busy_save"
            color="primary"
            :variant="canSave ? 'flat' : 'outlined'"
            class="sd-modern-button sd-modern-button--primary b-shop-profile-editor__save"
            @click="saveShopProfile"
          >
            <v-icon start size="16" aria-hidden="true">save</v-icon>
            {{ $t("global.actions.save_changes") }}
          </v-btn>
        </div>
      </header>

      <div class="b-shop-profile-editor__surface" :aria-busy="busy">
        <u-loading-progress v-if="busy" />
        <div v-else-if="loadFailed" class="sd-modern-notice b-shop-profile-editor__load-error">
          <p role="alert">{{ $t("shop_profile_editor.load_failed") }}</p>
          <v-btn class="sd-modern-button" variant="outlined" @click="getFetchShopProfile">
            {{ $t("shop_profile_editor.retry") }}
          </v-btn>
        </div>
        <div v-else class="master-article-container b-shop-profile-editor__article">
          <s-article-editor
            ref="editorContainer"
            :body="profile?.body ?? ''"
            :enable-title="false"
            :upload-url="upload_url"
            class="article"
            :edit="!readOnly"
            immediate-change
            @change="onChangeNote"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import SArticleEditor from "../../../../article/SArticleEditor.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BShopProfileEditor",

  components: { SArticleEditor },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    type: {
      required: true,
      type: String,
    },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    icon: { type: String, required: true },
    storefrontUrl: { type: String, required: true },
    readOnly: Boolean,
  },

  data: () => ({
    profile: null,
    busy: false,
    busy_save: false,
    loadFailed: false,
    draftRevision: 0,
    savedRevision: 0,
    closed: false,
  }),
  computed: {
    upload_url() {
      return window.API.POST_UPDATE_SHOP_PROFILE_IMAGE(this.shop.id, this.type);
    },
    hasChanges() {
      return this.draftRevision !== this.savedRevision;
    },
    canSave() {
      return !this.readOnly && !this.busy && !this.loadFailed && !this.busy_save && this.hasChanges;
    },
    statusKey() {
      if (this.readOnly) return "shop_profile_editor.read_only";
      if (this.busy_save) return "shop_profile_editor.saving";
      return this.hasChanges ? "shop_profile_editor.unsaved" : "shop_profile_editor.saved";
    },
  },

  created() {
    this.getFetchShopProfile();
  },
  beforeUnmount() {
    this.closed = true;
  },

  methods: {
    onChangeNote() {
      if (!this.readOnly) this.draftRevision++;
    },

    async saveShopProfile() {
      if (!this.canSave || !this.$refs.editorContainer) return;

      const revision = this.draftRevision;
      this.busy_save = true;
      try {
        const body = this.$refs.editorContainer.purifyBody();
        const { data } = await axios.post(
          window.API.POST_SAVE_SHOP_PROFILE(this.shop.id, this.type),
          { body },
        );
        if (this.closed) return;
        if (data.error) {
          NotificationService.showErrorAlert(null, data.error_msg);
          return;
        }
        this.savedRevision = revision;
        // Updating the article body prop would replace edits made while saving.
        if (this.draftRevision === revision) this.profile = data.profile;
        NotificationService.showSuccessAlert(
          this.$t("global.article.notifications.update_success_title"),
          this.$t("global.article.notifications.update_success"),
        );
      } catch (error) {
        if (!this.closed) NotificationService.showLaravelError(error);
      } finally {
        if (!this.closed) this.busy_save = false;
      }
    },

    async getFetchShopProfile() {
      if (this.busy) return;
      this.busy = true;
      this.loadFailed = false;
      try {
        const { data } = await axios.get(window.API.GET_SHOP_PROFILE(this.shop.id, this.type));
        if (this.closed) return;
        if (data.error) {
          this.loadFailed = true;
          NotificationService.showErrorAlert(null, data.error_msg);
          return;
        }
        this.profile = data.profile;
      } catch (error) {
        if (this.closed) return;
        this.loadFailed = true;
        NotificationService.showLaravelError(error);
      } finally {
        if (!this.closed) this.busy = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.b-shop-profile-editor {
  width: min(100%, 954px);
  padding: 30px clamp(14px, 3.5vw, 36px) 36px;
  font-family: inherit;

  &__header.sd-modern-header { gap: 14px 20px; margin-block-end: 22px; }
  &__heading.sd-modern-title { align-items: center; gap: 13px; }
  &__heading h1 { font-size: 26px; font-weight: 650; line-height: 1.16; letter-spacing: -.65px; }
  &__heading p { margin-block-start: 5px; font-size: 13px; line-height: 1.5; }
  &__icon.sd-modern-icon {
    flex-basis: 44px;
    width: 44px;
    height: 44px;
    color: var(--sd-modern-muted);
    background: rgb(var(--v-theme-surface));
    border: 1px solid var(--sd-modern-border);
    border-radius: 13px;
  }
  &__view.sd-modern-button {
    min-height: 40px;
    font-size: 13px;
    span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-block-end: 1px solid currentColor;
    }
  }
  &__panel.sd-modern-widget { padding: 0; border-radius: 17px; }
  &__command {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 7px 12px;
    min-height: 66px;
    padding: 10px clamp(13px, 2.4vw, 24px);
    border-block-end: 1px solid var(--sd-modern-border);

    h2 { margin: 0; font-size: 15px; font-weight: 650; line-height: 1.5; }
  }
  &__actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 14px; }
  &__state {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
    &[data-dirty="true"] .sd-modern-status__dot { background: rgb(var(--v-theme-primary)); }
  }
  &__save.sd-modern-button { min-height: 42px; margin: 0; padding: 7px 14px; font-size: 13px; font-weight: 600; }
  &__surface { min-height: 345px; padding: 33px clamp(14px, 5vw, 46px) 34px; }
  &__article {
    max-width: 61ch;
    min-width: 0;
    margin-inline: auto;
    font-size: 15px;

    .article { font-size: inherit; line-height: 1.75; }
    :deep(.s-article-editor__body) { overflow-wrap: anywhere; }
    :deep(.s-article-editor__edit),
    :deep(.review-style) { padding-inline: 0 !important; }
  }
  &__load-error { margin-inline: auto; max-width: 61ch; }
  @media (max-width: 560px) {
    padding-block: 20px 23px;
    &__header.sd-modern-header { gap: 6px 12px; margin-block-end: 13px; }
    &__heading h1 { font-size: 23px; }
    &__surface { min-height: 280px; padding-block-start: 25px; }
    &__article { font-size: 16px; }
    &__article .article { line-height: 1.65; }
  }
  @media (max-width: 450px) {
    &__actions { width: 100%; justify-content: space-between; }
    &__save.sd-modern-button { margin-inline-start: auto; }
  }
  @media (max-width: 600px), (pointer: coarse) {
    &__view.sd-modern-button, &__save.sd-modern-button { min-height: 44px; }
  }
}
</style>
