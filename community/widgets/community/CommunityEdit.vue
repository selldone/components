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
  <v-container :class="{ 'pointer-event-none': community && !access.admin }">
    <v-alert
      v-if="community && community.penalty"
      color="red"
      type="error"
      border="left"
    >
      {{ $t("community.commons.rules_violation") }}
    </v-alert>

    <!-- General -->
    <div class="widget-box mb-5">
      <widget-header
        :title="$t('global.commons.general_config')"
        icon="tune"
      ></widget-header>

      <v-subheader>Assign a name to your community and provide a brief description outlining its purpose and value. </v-subheader>
      <v-text-field
        v-model="name"
        :label="$t('community.community.name')"
        :placeholder="$t('community.community.name_plc')"
        :messages="$t('community.community.name_msg')"
        :counter="64"
        :append-icon="lock ? 'lock' : 'lock_open'"
        @click:append="lock = !lock"
        :readonly="lock"
        :loading="busy_name"
        @input="checkName"
        :error-messages="name_error"
      >
        <template slot="append">
          <v-icon color="success" v-if="valid_name === name">check</v-icon>
        </template>
      </v-text-field>

      <v-text-field
        v-model="title"
        :label="$t('community.community.title')"
        :placeholder="$t('community.community.title_plc')"
        :messages="$t('community.community.title_msg')"
        :counter="128"
      ></v-text-field>

      <v-text-field
        v-model="desc"
        :label="$t('community.community.desc')"
        :placeholder="$t('community.community.desc_plc')"
        :messages="$t('community.community.desc_msg')"
        :counter="256"
      ></v-text-field>
    </div>

    <!-- image -->
    <div class="widget-box mb-5">
      <widget-header
        :title="$t('global.commons.image')"
        icon="image"
      ></widget-header>

      <v-subheader> You can upload and modify the logo of your community here.</v-subheader>
      <div class="text-center">
        <image-input
          class="d-inline-block"
          v-model="image_file"
          :src="
            community && community.image
              ? getShopImagePath(community.image)
              : undefined
          "
        ></image-input>
      </div>
    </div>

    <!-- SEO -->
    <div class="widget-box mb-5">
      <widget-header
        :title="$t('global.commons.seo')"
        icon="track_changes"
      ></widget-header>

      <v-subheader> This is the default SEO configuration for your community. Please note that SEO settings can also be adjusted at the topic and category level.</v-subheader>

      <s-smart-toggle
        v-model="nofollow"
        true-title="No follow links"
        false-title="Follow links"
        :true-description="$t('community.commons.nofollow_msg')"
        false-gray
      ></s-smart-toggle>
    </div>

    <!-- Cross Community -->
    <div class="widget-box mb-5">
      <widget-header
        :title="$t('community.commons.cross_community')"
        icon="leak_add"
      ></widget-header>

      <v-subheader>Can other communities embed your topics? </v-subheader>

      <s-smart-toggle
        v-model="cross"
        :true-title="$t('community.commons.crossable')"
        :true-description="$t('community.commons.crossable_msg')"
        false-gray
      ></s-smart-toggle>
    </div>

    <!-- Access -->
    <div class="widget-box mb-5">
      <widget-header
        :title="$t('global.commons.access')"
        icon="private_connectivity"
      ></widget-header>

      <v-subheader>Define the access level and status of your community here. The structure of the community follows this hierarchy: Your Community > Categories > Topics > Posts. </v-subheader>

      <s-smart-select
        v-model="stage"
        :items="Object.values(CommunityStageLevel)"
        item-text="name"
        item-value="code"
        item-icon="icon"
        item-description="description"
        class="mb-5"
        label="Who can create topics by default?"
      ></s-smart-select>

      <s-smart-toggle
        v-model="enable"
        :true-title="$t('global.commons.enable')"
        :false-title="$t('global.commons.disable')"
        :true-description="$t('community.community.enable_msg')"
        false-gray
        label="Is your community available?"
        true-icon="public"
        false-icon="public_off"
      ></s-smart-toggle>
    </div>

    <!-- Access -->
    <div class="widget-box mb-5">
      <widget-header title="File Attachment" icon="attach_file"
        ></widget-header
      >

      <v-subheader> You can add the attachment option in your community. Your customers can
        attach up to 3 files, each 8MB, in their posts.</v-subheader>

      <s-smart-select
        v-model="attachment"
        :items="Object.values(CommunityAttachmentAccess)"
        item-text="name"
        item-value="code"
        item-icon="icon"
        item-description="description"
        class="my-5"
        label="Who can attach files?"
      ></s-smart-select>

      <v-combobox
        multiple
        v-model="mims"
        chips
        deletable-chips
        label="Allowed file types"
        messages="Leave it empty means all file types are accepted."
        placeholder="Enter value and press enter. ex: zip"
      >
        <template v-slot:selection="data">
          <v-chip
            :key="JSON.stringify(data.item)"
            v-bind="data.attrs"
            :input-value="data.selected"
            :disabled="data.disabled"
            @click:close="data.parent.selectItem(data.item)"
            close
          >
            <img
              :src="getFileExtensionImage(data.item)"
              width="16"
              height="16"
              class="me-1"
            />
            {{ data.item }}
          </v-chip>
        </template>
      </v-combobox>
    </div>

    <!-- Rule -->
    <div class="widget-box mb-5">


      <widget-header :title="$t('global.commons.rules')" icon="settings_accessibility"
      ></widget-header
      >

      <v-subheader>Draft a concise set of guidelines for your community. </v-subheader>

      <v-textarea
        v-model="rule"
        :rows="4"
        class="m-0"
        :placeholder="$t('community.community.rule_plc')"
      >
      </v-textarea>
    </div>

    <div class="widget-buttons">
      <v-btn v-if="hasClose" x-large text @click="$emit('close')">
        <v-icon class="me-1">close</v-icon>
        {{ $t("global.actions.close") }}
      </v-btn>

      <v-btn
        v-if="!community || access.admin"
        depressed
        x-large
        color="primary"
        @click="saveCommunity"
        :loading="busy"
        :disabled="!name || !title || !desc"
      >
        <v-icon class="me-1">save</v-icon>
        {{ $t("global.actions.save_changes") }}
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import ImageInput from "../image/ImageInput.vue";
import { CommunityStageLevel } from "@core/enums/community/CommunityStageLevel";
import SSmartToggle from "@components/smart/SSmartToggle.vue";
import SSmartSelect from "@components/smart/SSmartSelect.vue";
import { CommunityAttachmentAccess } from "@core/enums/community/CommunityAttachmentAccess";
import _ from "lodash-es";
export default {
  name: "CommunityEdit",
  components: {  SSmartSelect, SSmartToggle, ImageInput },

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
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            if (this.community) {
              // Edit mode
              Object.assign(this.community, data.community);
              this.$emit("update:community", this.community);

              this.$vuetify.goTo(0, {
                duration: 800,
                offset: 0,
                easing: "easeInOutQuad",
              });
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

<style scoped lang="scss"></style>
