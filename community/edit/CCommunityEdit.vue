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
  <v-container :class="{ 'pointer-event-none': community && !access.admin }">
    <v-alert
      v-if="community && community.penalty"
      border="start"
      color="red"
      type="error"
    >
      {{ $t("community.commons.rules_violation") }}
    </v-alert>

    <!-- General -->
    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.commons.general_config')"
        icon="tune"
      ></s-widget-header>

      <v-list-subheader
        >Assign a name to your community and provide a brief description
        outlining its purpose and value.
      </v-list-subheader>
      <v-text-field
        v-model="name"
        :append-inner-icon="lock ? 'lock' : 'lock_open'"
        :counter="64"
        :error-messages="name_error"
        :label="$t('community.community.name')"
        :loading="busy_name"
        :messages="$t('community.community.name_msg')"
        :placeholder="$t('community.community.name_plc')"
        :readonly="lock"
        @click:append-inner="lock = !lock"
        @update:model-value="checkName"
        variant="underlined"
      >
        <template v-slot:append-inner>
          <v-icon v-if="valid_name === name" color="success">check</v-icon>
        </template>
      </v-text-field>

      <v-text-field
        v-model="title"
        :counter="128"
        :label="$t('community.community.title')"
        :messages="$t('community.community.title_msg')"
        :placeholder="$t('community.community.title_plc')"
        variant="underlined"
      ></v-text-field>

      <v-text-field
        v-model="desc"
        :counter="256"
        :label="$t('community.community.desc')"
        :messages="$t('community.community.desc_msg')"
        :placeholder="$t('community.community.desc_plc')"
        variant="underlined"
      ></v-text-field>
    </div>

    <!-- image -->
    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.commons.image')"
        icon="image"
      ></s-widget-header>

      <v-list-subheader>
        You can upload and modify the logo of your community here.
      </v-list-subheader>
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
    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.commons.seo')"
        icon="track_changes"
      ></s-widget-header>

      <v-list-subheader>
        This is the default SEO configuration for your community. Please note
        that SEO settings can also be adjusted at the topic and category level.
      </v-list-subheader>

      <u-smart-toggle
        v-model="nofollow"
        :true-description="$t('community.commons.nofollow_msg')"
        false-gray
        false-title="Follow links"
        true-title="No follow links"
      ></u-smart-toggle>
    </div>

    <!-- Cross Community -->
    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('community.commons.cross_community')"
        icon="leak_add"
      ></s-widget-header>

      <v-list-subheader
        >Can other communities embed your topics?
      </v-list-subheader>

      <u-smart-toggle
        v-model="cross"
        :true-description="$t('community.commons.crossable_msg')"
        :true-title="$t('community.commons.crossable')"
        false-gray
      ></u-smart-toggle>
    </div>

    <!-- Access -->
    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.commons.access')"
        icon="private_connectivity"
      ></s-widget-header>

      <v-list-subheader
        >Define the access level and status of your community here. The
        structure of the community follows this hierarchy: Your Community >
        Categories > Topics > Posts.
      </v-list-subheader>

      <u-smart-select
        v-model="stage"
        :items="Object.values(CommunityStageLevel)"
        class="mb-5"
        item-description="description"
        item-icon="icon"
        item-text="name"
        item-value="code"
        label="Who can create topics by default?"
      ></u-smart-select>

      <u-smart-toggle
        v-model="enable"
        :false-title="$t('global.commons.disable')"
        :true-description="$t('community.community.enable_msg')"
        :true-title="$t('global.commons.enable')"
        false-gray
        false-icon="public_off"
        label="Is your community available?"
        true-icon="public"
      ></u-smart-toggle>
    </div>

    <!-- Access -->
    <div class="widget-box mb-5">
      <s-widget-header
        icon="attach_file"
        title="File Attachment"
      ></s-widget-header>

      <v-list-subheader>
        You can add the attachment option in your community. Your customers can
        attach up to 3 files, each 8MB, in their posts.
      </v-list-subheader>

      <u-smart-select
        v-model="attachment"
        :items="Object.values(CommunityAttachmentAccess)"
        class="my-5"
        item-description="description"
        item-icon="icon"
        item-text="name"
        item-value="code"
        label="Who can attach files?"
      ></u-smart-select>

      <v-combobox
        v-model="mims"
        chips
        closable-chips
        label="Allowed file types"
        messages="Leave it empty means all file types are accepted."
        multiple
        placeholder="Enter value and press enter. ex: zip"
        variant="underlined"
      >
        <template v-slot:chip="{ item, props }">
          <v-chip v-bind="props">
            <img
              :src="getFileExtensionImage(item.raw)"
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
    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.commons.rules')"
        icon="settings_accessibility"
      ></s-widget-header>

      <v-list-subheader
        >Draft a concise set of guidelines for your community.
      </v-list-subheader>

      <v-textarea
        v-model="rule"
        :placeholder="$t('community.community.rule_plc')"
        :rows="4"
        class="m-0"
        variant="underlined"
      >
      </v-textarea>
    </div>

    <s-widget-buttons auto-fixed-position>
      <v-btn
        v-if="hasClose"
        size="x-large"
        variant="text"
        @click="$emit('close')"
      >
        <v-icon start>close</v-icon>
        {{ $t("global.actions.close") }}
      </v-btn>

      <v-btn
        v-if="!community || access.admin"
        :disabled="!name || !title || !desc"
        :loading="busy"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="saveCommunity"
        prepend-icon="save"
      >
        {{ $t("global.actions.save_changes") }}
      </v-btn>
    </s-widget-buttons>
  </v-container>
</template>

<script>
import CImageInput from "../../community/image/input/CImageInput.vue";
import { CommunityStageLevel } from "@selldone/core-js/enums/community/CommunityStageLevel";
import USmartToggle from "../../ui/smart/toggle/USmartToggle.vue";
import USmartSelect from "../../ui/smart/select/USmartSelect.vue";
import { CommunityAttachmentAccess } from "@selldone/core-js/enums/community/CommunityAttachmentAccess";
import _ from "lodash-es";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper";
import SWidgetButtons from "../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "CCommunityEdit",
  components: { SWidgetButtons, USmartSelect, USmartToggle, CImageInput },

  props: {
    shop: {}, // optional for shops.
    community: {}, // In the add if be null.
    hasClose: { default: false, type: Boolean },
  },

  data() {
    return {
      CommunityStageLevel: CommunityStageLevel,
      CommunityAttachmentAccess: CommunityAttachmentAccess,

      busy: false,

      //-------------------

      name: "",
      title: "",
      desc: "",

      rule: "",
      image_file: null,

      nofollow: true,
      cross: false,

      stage: CommunityStageLevel.VERIFIED.code,

      enable: true,

      attachment: CommunityAttachmentAccess.PRIVATE.code,
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
    access() {
      return this.community && this.community.access;
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
    checkName: _.throttle(function (name) {
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
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_name = false;
        });
    }, 3000),

    //――――――――――――――――――――――― New category ―――――――――――――――――――――――

    saveCommunity() {
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

            this.showSuccessAlert();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
