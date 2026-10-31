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
  <v-card class="b-cluster-add sd-modern-canvas text-start">
    <v-card-title class="b-cluster-add__header">
      <header class="sd-modern-form sd-modern-header">
        <div class="sd-modern-title">
          <v-icon class="b-cluster-add__purpose" size="24" aria-hidden="true"
            >workspaces_outline</v-icon
          >
          <div>
            <h1 class="sd-modern-title-text">
              {{
                $t(
                  cluster
                    ? "classification_clusters.editor.edit_title"
                    : "classification_clusters.editor.add_title",
                )
              }}
            </h1>
            <p class="sd-modern-subtitle">
              {{
                $t(
                  cluster
                    ? "classification_clusters.editor.edit_subtitle"
                    : "classification_clusters.editor.add_subtitle",
                )
              }}
            </p>
          </div>
        </div>
        <v-btn
          class="sd-modern-icon-button"
          icon
          variant="text"
          :aria-label="$t('global.actions.close')"
          @click="back"
        >
          <v-icon size="17" aria-hidden="true">close</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.actions.close") }}</v-tooltip
          >
        </v-btn>
      </header>
    </v-card-title>
    <v-card-text class="b-cluster-add__body">
      <nav
        v-if="cluster"
        class="sd-modern-form sd-modern-section-nav b-cluster-add__nav"
        :aria-label="$t('classification_clusters.editor.settings')"
      >
        <button
          type="button"
          class="sd-modern-section-nav__item"
          :aria-current="tab === 'details' ? 'location' : undefined"
          :disabled="busy || busy_delete"
          @click="tab = 'details'"
        >
          <v-icon size="16" aria-hidden="true">tune</v-icon
          >{{ $t("classification_clusters.editor.details") }}
        </button>
        <button
          type="button"
          class="sd-modern-section-nav__item"
          :aria-current="tab === 'delete' ? 'location' : undefined"
          :disabled="busy || busy_delete"
          @click="tab = 'delete'"
        >
          <v-icon size="16" aria-hidden="true">delete_outline</v-icon
          >{{ $t("classification_clusters.editor.delete") }}
        </button>
      </nav>
      <!-- ███████████████████████████ Setting ███████████████████████████ -->
      <v-form
        v-show="tab === 'details'"
        class="sd-modern-form"
        @submit.prevent="cluster ? editCluster() : addCluster()"
      >
        <section class="sd-modern-widget b-cluster-add__panel">
          <h2>{{ $t("classification_clusters.editor.details_heading") }}</h2>
          <p class="b-cluster-add__subtitle">
            {{ $t("classification_clusters.editor.details_help") }}
          </p>
          <fieldset
            :disabled="!can_write || busy || busy_delete"
            class="b-cluster-add__fields"
          >
            <div class="b-cluster-add__field">
              <div class="b-cluster-add__label-row">
                <label :for="nameId"
                  >{{ $t("classification_clusters.editor.name") }}
                  <span aria-hidden="true">*</span></label
                >
                <span :id="nameId + '-count'" class="b-cluster-add__counter"
                  >{{ $n(name_length) }} / {{ $n(128) }}</span
                >
              </div>
              <v-text-field
                :id="nameId"
                v-model="name"
                :aria-describedby="nameId + '-count'"
                :aria-label="$t('classification_clusters.editor.name')"
                :placeholder="
                  $t('classification_clusters.editor.name_placeholder')
                "
                class="b-cluster-add__input"
                variant="plain"
                single-line
                hide-details
                required
                :error="name_length > 128"
                :disabled="!can_write || busy || busy_delete"
              />
              <u-smart-suggestion
                v-if="!cluster?.id"
                :samples="$tm('suggestions.cluster.name')"
                :disabled="!can_write || busy || busy_delete"
                @select="
                  (value) => {
                    if (can_write && !busy && !busy_delete) name = value;
                  }
                "
              />
            </div>
            <div class="b-cluster-add__field">
              <div class="b-cluster-add__label-row">
                <label :for="descriptionId">{{
                  $t("classification_clusters.editor.description")
                }}</label>
                <span
                  :id="descriptionId + '-count'"
                  class="b-cluster-add__counter"
                  >{{ $n(description_length) }} / {{ $n(256) }}</span
                >
              </div>
              <v-textarea
                :id="descriptionId"
                v-model="description"
                :aria-describedby="descriptionId + '-count'"
                :aria-label="$t('classification_clusters.editor.description')"
                :placeholder="
                  $t('classification_clusters.editor.description_placeholder')
                "
                class="b-cluster-add__input"
                variant="plain"
                auto-grow
                rows="2"
                hide-details
                :error="description_length > 256"
                :disabled="!can_write || busy || busy_delete"
              />
            </div>
            <div class="sd-modern-form-grid b-cluster-add__appearance">
              <div
                class="b-cluster-add__field"
                role="group"
                :aria-label="$t('classification_clusters.editor.color')"
              >
                <div class="b-cluster-add__label-row">
                  <span>{{ $t("classification_clusters.editor.color") }}</span
                  ><span class="b-cluster-add__optional">{{
                    $t("classification_clusters.editor.optional")
                  }}</span>
                </div>
                <div class="b-cluster-add__color-row">
                  <bdi class="b-cluster-add__color-value">{{
                    color || $t("classification_clusters.editor.default_color")
                  }}</bdi>
                  <u-color-selector
                    v-if="can_write && !busy && !busy_delete"
                    v-model="color"
                    :dialog-title="$t('classification_clusters.editor.color')"
                    color="rgb(var(--v-theme-surface))"
                    :size="30"
                    nullable
                    class="b-cluster-add__color-selector"
                  />
                  <span
                    v-else
                    class="b-cluster-add__color-preview"
                    :style="{ background: color || 'var(--sd-modern-muted)' }"
                    aria-hidden="true"
                  ></span>
                </div>
              </div>
              <div class="b-cluster-add__field">
                <div class="b-cluster-add__label-row">
                  <label :for="parentId">{{
                    $t("classification_clusters.editor.parent")
                  }}</label
                  ><span class="b-cluster-add__optional">{{
                    $t("classification_clusters.editor.optional")
                  }}</span>
                </div>
                <!-- Parent folder: keep native search, clear, identity and hierarchy preview. -->
                <b-cluster-input
                  :id="parentId"
                  v-model="parent_id"
                  :return-object="false"
                  :aria-label="$t('classification_clusters.editor.parent')"
                  :placeholder="$t('classification_clusters.no_parent')"
                  label=" "
                  class="b-cluster-add__input b-cluster-add__parent"
                  clearable
                  single-line
                  variant="plain"
                  :disabled="!can_write || busy || busy_delete"
                />
              </div>
            </div>
            <section class="b-cluster-add__image">
              <div class="b-cluster-add__image-heading">
                <div>
                  <h3>{{ $t("classification_clusters.editor.image") }}</h3>
                  <p class="b-cluster-add__subtitle">
                    {{ $t("classification_clusters.editor.image_help") }}
                  </p>
                </div>
                <v-btn
                  class="sd-modern-info-button"
                  variant="text"
                  icon
                  :aria-label="$t('classification_clusters.editor.image')"
                >
                  <v-icon size="16" aria-hidden="true">info_outline</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    open-on-focus
                    open-on-click
                    content-class="sd-modern-tooltip text-start"
                    >{{
                      $t("classification_clusters.editor.image_info")
                    }}</v-tooltip
                  >
                </v-btn>
              </div>
              <!-- Image: edits use the existing immediate-upload flow, creation sends its file with metadata. -->
              <s-image-uploader
                v-if="cluster?.id"
                :image="getShopImagePath(icon)"
                :server="
                  window.API.POST_SHOP_CLUSTER_UPLOAD_ICON(shop.id, cluster.id)
                "
                :disabled="!can_write || busy || busy_delete"
                :label="$t('classification_clusters.editor.image')"
                :edit-label="$t('classification_clusters.editor.edit_image')"
                class="b-cluster-add__uploader"
                auto-compact
                modern
                max-file-size="2MB"
                @new-path="handleProcessFile"
              />
              <v-file-input
                v-else
                v-model="selected_file"
                accept="image/*"
                :aria-label="$t('classification_clusters.editor.image')"
                :placeholder="$t('classification_clusters.editor.choose_image')"
                :disabled="!can_write || busy || busy_delete"
                class="b-cluster-add__input"
                color="primary"
                prepend-icon="attach_file"
                variant="plain"
                single-line
                hide-details
              />
              <p class="b-cluster-add__image-note">
                {{
                  $t(
                    cluster?.id
                      ? "classification_clusters.editor.image_edit_note"
                      : "classification_clusters.editor.image_add_note",
                  )
                }}
              </p>
            </section>
          </fieldset>
          <div v-if="save_error" class="sd-modern-notice mt-4" role="alert">
            <v-icon size="18" aria-hidden="true">info_outline</v-icon
            ><span class="sd-modern-notice__content">{{
              $t("classification_clusters.editor.save_error")
            }}</span>
          </div>
        </section>
        <b-cluster-help class="b-cluster-add__help" />
      </v-form>
      <!-- ███████████████████████████ Critical ███████████████████████████ -->
      <details
        v-if="cluster"
        v-show="tab === 'delete'"
        :open="delete_expanded"
        class="sd-modern-form sd-modern-widget sd-modern-disclosure sd-modern-critical b-cluster-add__critical"
        @toggle="delete_expanded = $event.target.open"
      >
        <summary class="sd-modern-disclosure__summary">
          <v-icon size="21" color="warning" aria-hidden="true"
            >warning_amber</v-icon
          >
          <span class="sd-modern-disclosure__copy"
            ><h2>{{ $t("classification_clusters.editor.delete") }}</h2>
            <span class="b-cluster-add__subtitle">{{
              $t("classification_clusters.editor.delete_help")
            }}</span></span
          >
          <v-icon
            class="sd-modern-disclosure__chevron"
            size="18"
            aria-hidden="true"
            >expand_more</v-icon
          >
        </summary>
        <div class="sd-modern-disclosure__content">
          <u-smart-verify
            :model-value="accept_delete"
            :true-title="$t('classification_clusters.editor.delete_verify')"
            :disabled="!can_write || busy || busy_delete"
            :tabindex="can_write && !busy && !busy_delete ? 0 : -1"
            role="checkbox"
            :aria-checked="accept_delete"
            :aria-disabled="!can_write || busy || busy_delete"
            :aria-label="$t('classification_clusters.editor.delete_verify')"
            color="error"
            false-gray
            @update:model-value="setDeleteVerified"
            @keydown.space.prevent="setDeleteVerified(!accept_delete)"
            @keydown.enter.prevent="setDeleteVerified(!accept_delete)"
          />
          <v-btn
            class="sd-modern-button sd-modern-button--danger mt-4"
            color="error"
            variant="elevated"
            prepend-icon="delete"
            :disabled="!can_delete"
            :loading="busy_delete"
            @click="deleteClusterDialog"
            >{{ $t("classification_clusters.editor.delete") }}</v-btn
          >
        </div>
      </details>
      <div
        v-if="!can_write"
        class="sd-modern-form sd-modern-notice mt-4"
        role="status"
      >
        <v-icon size="18" aria-hidden="true">lock_outline</v-icon
        ><span class="sd-modern-notice__content">{{
          $t("classification_clusters.editor.read_only")
        }}</span>
      </div>
    </v-card-text>
    <v-card-actions class="b-cluster-add__footer">
      <div class="sd-modern-form b-cluster-add__actions">
        <v-btn class="sd-modern-button" variant="outlined" @click="back">{{
          $t("global.actions.close")
        }}</v-btn>
        <v-btn
          v-if="tab === 'details'"
          class="sd-modern-button sd-modern-button--primary"
          color="primary"
          variant="flat"
          :prepend-icon="cluster ? 'save' : 'add'"
          :disabled="!can_save"
          :loading="busy"
          @click="cluster ? editCluster() : addCluster()"
          >{{
            $t(
              cluster
                ? "classification_clusters.editor.save"
                : "classification_clusters.editor.create",
            )
          }}</v-btn
        >
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { useId } from "vue";
import USmartVerify from "../../../ui/smart/verify/USmartVerify.vue";
import BClusterInput from "../../cluster/input/BClusterInput.vue";
import SImageUploader from "../../../ui/uploader/SImageUploader.vue";
import USmartSuggestion from "../../../ui/smart/suggestion/USmartSuggestion.vue";
import UColorSelector from "../../../ui/color/selector/UColorSelector.vue";
import BClusterHelp from "./BClusterHelp.vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BClusterAdd",
  components: {
    UColorSelector,
    USmartSuggestion,
    SImageUploader,
    BClusterInput,
    USmartVerify,
    BClusterHelp,
  },
  props: { shop: { required: true, type: Object }, cluster: { type: Object } },
  setup() {
    return { nameId: useId(), descriptionId: useId(), parentId: useId() };
  },
  data: () => ({
    tab: "details",
    name: "",
    color: null,
    icon: null,
    description: "",
    parent_id: null,
    selected_file: null,
    busy: false,
    busy_delete: false,
    save_error: false,
    accept_delete: false,
    delete_expanded: false,
  }),
  computed: {
    name_length() {
      return Array.from(this.name || "").length;
    },
    description_length() {
      return Array.from(this.description || "").length;
    },
    can_write() {
      return this.writeShopAccess(ShopPermissionRegions.CATEGORIES.code);
    },
    can_save() {
      return (
        this.can_write &&
        this.tab === "details" &&
        !this.busy &&
        !this.busy_delete &&
        !!this.name?.trim() &&
        this.name_length <= 128 &&
        this.description_length <= 256
      );
    },
    can_delete() {
      return (
        !!this.cluster?.id &&
        this.can_write &&
        this.tab === "delete" &&
        this.delete_expanded &&
        this.accept_delete &&
        !this.busy &&
        !this.busy_delete
      );
    },
  },
  watch: {
    cluster() {
      this.assignData();
    },
    tab() {
      this.accept_delete = false;
      this.delete_expanded = false;
    },
    delete_expanded(value) {
      if (!value) this.accept_delete = false;
    },
    can_write(value) {
      if (!value) this.accept_delete = false;
    },
  },
  created() {
    this.assignData();
  },
  methods: {
    addCluster() {
      if (!this.can_save || this.cluster?.id) return;
      this.busy = true;
      this.save_error = false;
      const formData = new FormData();
      if (this.selected_file) formData.append("photo", this.selected_file);
      if (this.name) formData.append("name", this.name);
      if (this.description) formData.append("description", this.description);
      if (this.parent_id) formData.append("parent_id", this.parent_id);
      if (this.color) formData.append("color", this.color);
      return axios
        .post(window.API.POST_SHOP_CLUSTERS_ADD(this.shop.id), formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(({ data }) => {
          if (data.error) {
            this.save_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t("classification_clusters.editor.created"),
            );
            this.$emit("add", data.cluster);
            this.back();
          }
        })
        .catch((error) => {
          this.save_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    editCluster() {
      if (!this.can_save || !this.cluster?.id) return;
      this.busy = true;
      this.save_error = false;
      return axios
        .put(window.API.PUT_SHOP_CLUSTERS_EDIT(this.shop.id, this.cluster.id), {
          name: this.name,
          description: this.description,
          color: this.color,
          parent_id: this.parent_id,
        })
        .then(({ data }) => {
          if (data.error) {
            this.save_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t("classification_clusters.editor.updated"),
            );
            this.$emit("edit", data.cluster);
            this.back();
          }
        })
        .catch((error) => {
          this.save_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    setDeleteVerified(value) {
      this.accept_delete =
        !!value &&
        this.can_write &&
        this.tab === "delete" &&
        this.delete_expanded &&
        !this.busy &&
        !this.busy_delete;
    },
    deleteClusterDialog() {
      if (!this.can_delete) return;
      const cluster = this.cluster;
      const cluster_id = cluster.id;
      const shop_id = this.shop.id;
      NotificationService.openDangerAlert(
        this.$t("classification_clusters.editor.delete_question"),
        this.$t("classification_clusters.editor.delete_confirm", {
          name: cluster.name,
        }),
        this.$t("classification_clusters.editor.delete_now"),
        () => {
          // Recheck the current disclosure, verification, resource and access after the native confirmation.
          if (
            !this.can_delete ||
            this.shop.id !== shop_id ||
            this.cluster?.id !== cluster_id ||
            cluster.id !== cluster_id
          )
            return;
          this.deleteCluster(cluster);
        },
      );
    },
    deleteCluster(cluster) {
      if (!this.can_delete || cluster?.id !== this.cluster?.id) return;
      this.busy_delete = true;
      return axios
        .delete(window.API.DELETE_SHOP_CLUSTER(this.shop.id, cluster.id))
        .then(({ data }) => {
          if (data.error)
            NotificationService.showErrorAlert(null, data.error_msg);
          else {
            NotificationService.showSuccessAlert(
              null,
              this.$t("classification_clusters.editor.deleted"),
            );
            this.$emit("delete", cluster.id);
            this.back();
          }
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => {
          this.busy_delete = false;
        });
    },
    back() {
      this.$emit("back");
    },
    handleProcessFile(path) {
      this.icon = path;
      this.cluster.icon = path;
    },
    assignData() {
      this.resetToDefault(); // 🞇 Reset to default
      if (this.cluster) {
        this.name = this.cluster.name;
        this.description = this.cluster.description;
        this.color = this.cluster.color;
        this.parent_id = this.cluster.parent_id;
        this.icon = this.cluster.icon;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.b-cluster-add {
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  &__header {
    flex: 0 0 auto;
    padding: 28px 24px 20px;
    white-space: normal;
  }
  &__header .sd-modern-header {
    margin-block-end: 0;
    align-items: flex-start;
    flex-wrap: nowrap;
  }
  &__header .sd-modern-title-text {
    font-size: 24px;
    font-weight: 600;
    line-height: 32px;
    letter-spacing: -0.4px;
  }
  &__header .sd-modern-subtitle {
    max-width: 440px;
    margin-block-start: 5px;
    font-size: 13px;
    line-height: 21px;
  }
  &__purpose {
    flex: 0 0 28px;
    width: 28px;
    height: 28px;
    margin-block-start: 2px;
  }
  &__body {
    padding: 0 24px 28px;
  }
  &__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-block: 6px 16px;
  }
  &__nav .sd-modern-section-nav__item {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 13px;
    font-size: 13px;
    line-height: 20px;
  }
  &__panel {
    padding: 24px;
  }
  &__panel > h2,
  &__critical h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }
  &__subtitle {
    display: block;
    margin-block: 4px 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
  }
  &__fields {
    display: grid;
    gap: 24px;
    min-width: 0;
    margin: 24px 0 0;
    padding: 0;
    border: 0;
  }
  &__field {
    min-width: 0;
  }
  &__label-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  &__counter,
  &__optional {
    flex: 0 0 auto;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
    font-variant-numeric: tabular-nums;
  }
  &__input {
    min-width: 0;
    :deep(.v-field) {
      --v-field-padding-top: 0px;
      --v-field-padding-bottom: 0px;
      min-height: 42px;
      border-block-end: 1px solid var(--sd-modern-border);
    }
    :deep(.v-field__input) {
      min-height: 42px;
      padding: 9px 0;
      font-family: inherit;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
    }
    :deep(.v-field__prepend-inner),
    :deep(.v-field__append-inner),
    :deep(.v-field__clearable),
    :deep(.v-input__prepend) {
      align-self: center;
      align-items: center;
      padding-block: 0;
    }
    :deep(.v-field__prepend-inner > .v-avatar) {
      margin-block: 0 !important;
    }
    :deep(.v-input__details) {
      padding: 6px 0 0;
      font-size: 12px;
      line-height: 18px;
    }
    :deep(.v-field--focused) {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
      border-radius: 3px;
    }
  }
  &__appearance {
    align-items: start;
  }
  &__color-row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 42px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__color-value {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 14px;
    line-height: 22px;
  }
  &__color-selector {
    flex: 0 0 auto;
    padding-block: 0 !important;
  }
  &__color-preview {
    flex: 0 0 20px;
    width: 20px;
    height: 20px;
    border-radius: 5px;
  }
  &__image {
    margin-block-start: 4px;
  }
  &__image-heading {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-block-end: 14px;
  }
  &__image-heading h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }
  &__image-heading .b-cluster-add__subtitle {
    font-size: 12px;
    line-height: 19px;
  }
  &__image-note {
    margin-block: 12px 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }
  &__uploader :deep(.v-list-item) {
    padding-inline: 0;
  }
  &__uploader :deep(.v-list-item-title) {
    font-size: 13px;
    font-weight: 500;
    line-height: 21px;
  }
  &__uploader :deep(.v-list-item-subtitle) {
    font-size: 12px;
    line-height: 19px;
    overflow-wrap: anywhere;
  }
  &__help {
    margin-block-start: 24px;
  }
  &__critical .sd-modern-disclosure__summary,
  &__critical .sd-modern-disclosure__content {
    padding: 24px;
  }
  &__footer {
    flex: 0 0 auto;
    padding: 18px 24px;
    border-block-start: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }
  .sd-modern-button {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    border-radius: 11px;
  }
  @media (max-width: 680px), (pointer: coarse) {
    &__header {
      padding: 24px 16px 20px;
    }
    &__body {
      padding-inline: 16px;
    }
    &__panel {
      padding: 20px 16px;
    }
    &__input :deep(.v-field__input) {
      min-height: 44px;
      font-size: 16px;
    }
    &__color-row {
      min-height: 44px;
    }
    &__color-selector :deep(.v-btn) {
      width: 44px !important;
      height: 44px !important;
    }
    &__critical .sd-modern-disclosure__summary,
    &__critical .sd-modern-disclosure__content {
      padding: 20px 16px;
    }
    &__footer {
      padding: 16px;
    }
  }
}
</style>
