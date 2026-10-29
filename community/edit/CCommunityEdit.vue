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
  <v-container
    class="text-start"
    :class="{
      'pointer-event-none': community && !access?.admin,
      'c-community-editor sd-modern-form sd-modern-widget': modern,
    }"
    :inert="modern && !can_edit"
  >
    <div
      v-if="modern && community?.penalty"
      class="sd-modern-notice"
      role="alert"
    >
      <v-icon icon="error_outline" color="error" size="18" aria-hidden="true" />
      <p>{{ $t("community.commons.rules_violation") }}</p>
    </div>
    <v-alert
      v-if="!modern && community && community.penalty"
      border="start"
      color="red"
      type="error"
    >
      {{ $t("community.commons.rules_violation") }}
    </v-alert>

    <!-- General -->
    <div :class="modern ? 'c-community-editor__group' : 'widget-box mb-5'">
      <u-widget-header
        :title="
          $t(
            modern
              ? 'community.community.modern.identity'
              : 'global.commons.general_config',
          )
        "
        :class="{ 'sd-modern-form-header': modern }"
        icon="tune"
      ></u-widget-header>

      <v-list-subheader v-if="!modern"
        >Assign a name to your community and provide a brief description
        outlining its purpose and value.
      </v-list-subheader>
      <p v-else class="c-community-editor__help">
        {{ $t("community.community.modern.identity_help") }}
      </p>
      <div :class="{ 'sd-modern-form-grid': modern }">
        <v-text-field
          v-model="name"
          :append-inner-icon="modern ? undefined : lock ? 'lock' : 'lock_open'"
          :class="{ 'sd-modern-underlined-field': modern }"
          :counter="64"
          :error-messages="name_error"
          :label="$t('community.community.name')"
          :loading="busy_name"
          :messages="$t('community.community.name_msg')"
          :placeholder="$t('community.community.name_plc')"
          :readonly="lock"
          :maxlength="modern ? 64 : undefined"
          @click:append-inner="!modern && (lock = !lock)"
          @update:model-value="checkName"
          variant="underlined"
        >
          <template v-slot:append-inner>
            <v-icon v-if="valid_name === name" color="success">check</v-icon>
            <v-btn
              v-if="modern"
              class="sd-modern-input-action"
              icon
              variant="text"
              :aria-label="
                $t(
                  lock
                    ? 'community.community.modern.unlock_name'
                    : 'community.community.modern.lock_name',
                )
              "
              @click.stop="lock = !lock"
            >
              <v-icon :icon="lock ? 'lock' : 'lock_open'" size="16" />
              <v-tooltip
                activator="parent"
                location="top"
                open-on-focus
                content-class="sd-modern-tooltip text-start"
                >{{
                  $t(
                    lock
                      ? "community.community.modern.unlock_name"
                      : "community.community.modern.lock_name",
                  )
                }}</v-tooltip
              >
            </v-btn>
          </template>
        </v-text-field>

        <v-text-field
          v-model="title"
          :class="{ 'sd-modern-underlined-field': modern }"
          :counter="128"
          :maxlength="modern ? 128 : undefined"
          :label="$t('community.community.title')"
          :messages="$t('community.community.title_msg')"
          :placeholder="$t('community.community.title_plc')"
          variant="underlined"
        ></v-text-field>
      </div>

      <v-text-field
        v-model="desc"
        :class="{ 'sd-modern-underlined-field': modern }"
        :counter="256"
        :maxlength="modern ? 256 : undefined"
        :label="$t('community.community.desc')"
        :messages="$t('community.community.desc_msg')"
        :placeholder="$t('community.community.desc_plc')"
        variant="underlined"
      ></v-text-field>
    </div>

    <!-- image -->
    <div
      :class="
        modern
          ? 'sd-modern-form-group c-community-editor__group'
          : 'widget-box mb-5'
      "
    >
      <u-widget-header
        :title="$t('global.commons.image')"
        :class="{ 'sd-modern-form-header': modern }"
        icon="image"
      ></u-widget-header>

      <v-list-subheader v-if="!modern">
        You can upload and modify the logo of your community here.
      </v-list-subheader>
      <p v-else class="c-community-editor__help">
        {{ $t("community.community.modern.logo_help") }}
      </p>
      <div class="text-center">
        <c-image-input
          v-model="image_file"
          :src="
            community && community.image
              ? getShopImagePath(community.image)
              : undefined
          "
          class="d-inline-block"
        ></c-image-input>
      </div>
    </div>

    <!-- SEO -->
    <div
      :class="
        modern
          ? 'sd-modern-form-group c-community-editor__group'
          : 'widget-box mb-5'
      "
    >
      <u-widget-header
        :title="$t('global.commons.seo')"
        :class="{ 'sd-modern-form-header': modern }"
        icon="track_changes"
      ></u-widget-header>

      <v-list-subheader v-if="!modern">
        This is the default SEO configuration for your community. Please note
        that SEO settings can also be adjusted at the topic and category level.
      </v-list-subheader>
      <p v-else class="c-community-editor__help">
        {{ $t("community.community.modern.seo_help") }}
      </p>

      <u-smart-toggle
        v-model="nofollow"
        :readonly="modern && busy"
        :role="modern ? 'switch' : undefined"
        :tabindex="modern ? 0 : undefined"
        :aria-checked="modern ? nofollow : undefined"
        :aria-label="
          modern ? $t('community.community.modern.nofollow_links') : undefined
        "
        @keydown.space.prevent="modern && !busy && (nofollow = !nofollow)"
        @keydown.enter.prevent="modern && !busy && (nofollow = !nofollow)"
        :true-description="$t('community.commons.nofollow_msg')"
        false-gray
        :false-title="
          modern
            ? $t('community.community.modern.follow_links')
            : 'Follow links'
        "
        :true-title="
          modern
            ? $t('community.community.modern.nofollow_links')
            : 'No follow links'
        "
      ></u-smart-toggle>
    </div>

    <!-- Cross Community -->
    <div
      :class="
        modern
          ? 'sd-modern-form-group c-community-editor__group'
          : 'widget-box mb-5'
      "
    >
      <u-widget-header
        :title="$t('community.commons.cross_community')"
        :class="{ 'sd-modern-form-header': modern }"
        icon="leak_add"
      ></u-widget-header>

      <v-list-subheader v-if="!modern"
        >Can other communities embed your topics?
      </v-list-subheader>
      <p v-else class="c-community-editor__help">
        {{ $t("community.community.modern.cross_help") }}
      </p>

      <u-smart-toggle
        v-model="cross"
        :readonly="modern && busy"
        :role="modern ? 'switch' : undefined"
        :tabindex="modern ? 0 : undefined"
        :aria-checked="modern ? cross : undefined"
        :aria-label="
          modern ? $t('community.commons.cross_community') : undefined
        "
        @keydown.space.prevent="modern && !busy && (cross = !cross)"
        @keydown.enter.prevent="modern && !busy && (cross = !cross)"
        :true-description="$t('community.commons.crossable_msg')"
        :true-title="$t('community.commons.crossable')"
        false-gray
      ></u-smart-toggle>
    </div>

    <!-- Access -->
    <div
      :class="
        modern
          ? 'sd-modern-form-group c-community-editor__group'
          : 'widget-box mb-5'
      "
    >
      <u-widget-header
        :title="
          $t(
            modern
              ? 'community.community.modern.topic_creation'
              : 'global.commons.access',
          )
        "
        :class="{ 'sd-modern-form-header': modern }"
        icon="private_connectivity"
      ></u-widget-header>

      <v-list-subheader v-if="!modern"
        >Define the access level and status of your community here. The
        structure of the community follows this hierarchy: Your Community >
        Categories > Topics > Posts.
      </v-list-subheader>
      <p v-else class="c-community-editor__help">
        {{ $t("community.community.modern.topic_help") }}
      </p>

      <u-smart-select
        v-model="stage"
        :readonly="modern && busy"
        :items="stage_items"
        :accessible="modern"
        class="mb-5"
        item-description="description"
        item-icon="icon"
        item-text="name"
        item-value="code"
        :label="
          modern
            ? $t('community.community.modern.topic_audience')
            : 'Who can create topics by default?'
        "
      ></u-smart-select>

      <u-smart-toggle
        v-model="enable"
        :readonly="modern && busy"
        :role="modern ? 'switch' : undefined"
        :tabindex="modern ? 0 : undefined"
        :aria-checked="modern ? enable : undefined"
        :aria-label="
          modern ? $t('community.community.modern.availability') : undefined
        "
        @keydown.space.prevent="modern && !busy && (enable = !enable)"
        @keydown.enter.prevent="modern && !busy && (enable = !enable)"
        :false-title="$t('global.commons.disable')"
        :true-description="$t('community.community.enable_msg')"
        :true-title="$t('global.commons.enable')"
        false-gray
        false-icon="public_off"
        :label="
          modern
            ? $t('community.community.modern.availability')
            : 'Is your community available?'
        "
        true-icon="public"
      ></u-smart-toggle>
    </div>

    <!-- Access -->
    <div
      :class="
        modern
          ? 'sd-modern-form-group c-community-editor__group'
          : 'widget-box mb-5'
      "
    >
      <u-widget-header
        icon="attach_file"
        :title="
          modern
            ? $t('community.community.modern.attachments')
            : 'File Attachment'
        "
        :class="{ 'sd-modern-form-header': modern }"
      ></u-widget-header>

      <v-list-subheader v-if="!modern">
        You can add the attachment option in your community. Your customers can
        attach up to 3 files, each 8MB, in their posts.
      </v-list-subheader>
      <p v-else class="c-community-editor__help">
        {{ $t("community.community.modern.attachments_help") }}
      </p>

      <u-smart-select
        v-model="attachment"
        :readonly="modern && busy"
        :items="attachment_items"
        :accessible="modern"
        class="my-5"
        item-description="description"
        item-icon="icon"
        item-text="name"
        item-value="code"
        :label="
          modern
            ? $t('community.community.modern.attachment_audience')
            : 'Who can attach files?'
        "
      ></u-smart-select>

      <v-combobox
        v-model="mims"
        :class="{ 'sd-modern-underlined-field': modern }"
        chips
        closable-chips
        :label="
          modern
            ? $t('community.community.modern.allowed_types')
            : 'Allowed file types'
        "
        :messages="
          modern
            ? $t('community.community.modern.allowed_types_help')
            : 'Leave it empty means all file types are accepted.'
        "
        multiple
        :placeholder="
          modern
            ? $t('community.community.modern.allowed_types_placeholder')
            : 'Enter value and press enter. ex: zip'
        "
        variant="underlined"
      >
        <template v-slot:chip="{ item, props }">
          <v-chip v-bind="props">
            <img
              :src="FileHelper.GetFileExtensionImage(item.raw)"
              class="me-1"
              height="16"
              width="16"
            />
            {{ item.raw }}
          </v-chip>
        </template>
      </v-combobox>
    </div>

    <!-- Rule -->
    <div
      :class="
        modern
          ? 'sd-modern-form-group c-community-editor__group'
          : 'widget-box mb-5'
      "
    >
      <u-widget-header
        :title="$t('global.commons.rules')"
        :class="{ 'sd-modern-form-header': modern }"
        icon="settings_accessibility"
      ></u-widget-header>

      <v-list-subheader v-if="!modern"
        >Draft a concise set of guidelines for your community.
      </v-list-subheader>
      <p v-else class="c-community-editor__help">
        {{ $t("community.community.modern.rules_help") }}
      </p>

      <v-textarea
        v-model="rule"
        :placeholder="$t('community.community.rule_plc')"
        :rows="4"
        class="m-0"
        :class="{ 'sd-modern-underlined-field': modern }"
        variant="underlined"
      >
      </v-textarea>
    </div>

    <s-widget-buttons
      auto-fixed-position
      :class="{ 'sd-modern-form-actions c-community-editor__actions': modern }"
    >
      <v-btn
        v-if="hasClose"
        :size="modern ? undefined : 'x-large'"
        :class="{ 'sd-modern-button': modern }"
        variant="text"
        @click="$emit('close')"
      >
        <v-icon start>close</v-icon>
        {{ $t("global.actions.close") }}
      </v-btn>

      <v-btn
        v-if="can_edit"
        :disabled="!name || !title || !desc"
        :loading="busy"
        color="primary"
        :size="modern ? undefined : 'x-large'"
        :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
        variant="elevated"
        @click="saveCommunity"
        :prepend-icon="modern && !community ? 'add' : 'save'"
      >
        {{
          $t(
            modern && !community
              ? "community.community.modern.create_action"
              : "global.actions.save_changes",
          )
        }}
      </v-btn>
    </s-widget-buttons>
  </v-container>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import CImageInput from "../../community/image/input/CImageInput.vue";
import USmartToggle from "../../ui/smart/toggle/USmartToggle.vue";
import USmartSelect from "../../ui/smart/select/USmartSelect.vue";
import { throttle } from "lodash-es";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper";
import SWidgetButtons from "../../ui/widget/buttons/SWidgetButtons.vue";
import { Community, FileHelper } from "@selldone/core-js";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

export default {
  name: "CCommunityEdit",
  mixins: [],
  components: { SWidgetButtons, USmartSelect, USmartToggle, CImageInput },

  props: {
    modern: { type: Boolean, default: false },
    shop: {}, // optional for shops.
    community: {}, // In the add if be null.
    hasClose: { default: false, type: Boolean },
  },

  data() {
    return {
      CommunityStageLevel: Community.StageLevels,
      CommunityAttachmentAccess: Community.AttachmentAccesses,

      busy: false,

      //-------------------

      name: "",
      title: "",
      desc: "",

      rule: "",
      image_file: null,

      nofollow: true,
      cross: false,

      stage: Community.StageLevels.VERIFIED.code,

      enable: true,

      attachment: Community.AttachmentAccesses.PRIVATE.code,
      mims: [],

      //-------------------
      lock: true,

      //-------------------
      busy_name: false,
      valid_name: null,
      name_error: null,
    };
  },

  computed: {
    FileHelper() {
      return FileHelper;
    },
    access() {
      return this.community && this.community.access;
    },
    can_edit() {
      return (
        (!this.community || !!this.access?.admin) &&
        (!this.modern ||
          !this.shop ||
          this.writeShopAccess(ShopPermissionRegions.COMMUNITY.code))
      );
    },
    stage_items() {
      return Object.values(this.CommunityStageLevel).map((item) =>
        this.modern
          ? {
              ...item,
              name: `community.community.modern.audience_${item.code.toLowerCase()}`,
              description: `community.community.modern.topic_${item.code.toLowerCase()}`,
            }
          : item,
      );
    },
    attachment_items() {
      return Object.values(this.CommunityAttachmentAccess).map((item) =>
        this.modern
          ? {
              ...item,
              name: `community.community.modern.audience_${item.code.toLowerCase()}`,
              description: `community.community.modern.attachment_${item.code.toLowerCase()}`,
            }
          : item,
      );
    },
  },

  watch: {},

  created() {
    if (this.community) {
      this.name = this.community.name;
      this.title = this.community.title;
      this.desc = this.community.desc;
      this.rule = this.community.rule;

      this.nofollow = this.community.nofollow;
      this.cross = this.community.cross;

      this.stage = this.community.stage;
      this.enable = this.community.enable;

      this.attachment = this.community.attachment;
      this.mims = this.community.mims;
      if (!this.mims || !Array.isArray(this.mims)) this.mims = [];
    } else {
      this.lock = false;
    }
  },
  mounted() {},

  methods: {
    //――――――――――――――――――――――― Check community name available ―――――――――――――――――――――――
    checkName: throttle(function (name) {
      if (!name) return;
      this.busy_name = true;
      axios
        .get(window.CAPI.GET_CHECK_COMMUNITY_NAME_AVAILABLE(), {
          params: {
            name: name,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.valid_name = data.name;
          }
          this.name_error = data.error_msg;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_name = false;
        });
    }, 3000),

    //――――――――――――――――――――――― New category ―――――――――――――――――――――――

    saveCommunity() {
      if (this.busy || !this.can_edit) return;
      this.busy = true;

      const formData = new FormData();

      formData.append("name", this.name);
      formData.append("title", this.title);
      formData.append("desc", this.desc);
      formData.append("rule", this.rule);
      formData.append("nofollow", this.nofollow);
      formData.append("cross", this.cross);

      formData.append("stage", this.stage);
      formData.append("enable", this.enable);

      formData.append("attachment", this.attachment);
      this.mims.forEach((m) => {
        formData.append("mims[]", m);
      });

      if (this.image_file)
        formData.append("image", this.image_file, this.image_file.name);

      axios
        .post(
          this.community
            ? window.CAPI.POST_COMMUNITY_EDIT(this.community.id)
            : window.CAPI.POST_COMMUNITY_CREATE(this.shop.id),
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            if (this.community) {
              // Edit mode
              Object.assign(this.community, data.community);
              this.$emit("update:community", this.community);

              ScrollHelper.scrollToTop(0, "smooth");
            } else {
              // Add mode
              this.$emit("add:community", data.community);
            }

            NotificationService.showSuccessAlert();
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.c-community-editor {
  font-size: 13px;
  line-height: 20px;
  &__group {
    min-width: 0;
  }
  &__help {
    margin-block: 0 18px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
  }
  &__actions {
    margin-block-start: 24px;
    padding-block-start: 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  :deep(.sd-modern-form-header h2) {
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
    letter-spacing: -0.15px;
  }
  :deep(.sd-modern-form-header .--icon) {
    font-size: 19px !important;
  }
}
</style>
