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
  <div>
    <!-- General -->
    <div class="widget-box mb-5">
      <u-widget-header
        :title="$t('global.commons.general_config')"
        icon="tune"
      ></u-widget-header>

      <v-list-subheader>
        Set a title and provide a concise description for the category.
      </v-list-subheader>

      <v-text-field
        v-model="title"
        :counter="128"
        :label="$t('community.category.title')"
        :messages="$t('community.category.title_msg')"
        :placeholder="$t('community.category.title_plc')"
        variant="underlined"
      ></v-text-field>
      <v-text-field
        v-model="desc"
        :counter="256"
        :label="$t('community.category.desc')"
        :messages="$t('community.category.desc_msg')"
        :placeholder="$t('community.category.desc_plc')"
        variant="underlined"
      ></v-text-field>
    </div>

    <!-- image -->
    <div class="widget-box mb-5">
      <u-widget-header
        :title="$t('global.commons.image')"
        icon="image"
      ></u-widget-header>
      <v-list-subheader
        >You have the option to assign an image to the category.
      </v-list-subheader>
      <c-image-input
        v-model="image_file"
        :src="image && getShopImagePath(image)"
        class="mb-4"
      ></c-image-input>
    </div>

    <div class="widget-box mb-5">
      <u-widget-header
        :title="$t('global.commons.seo')"
        icon="track_changes"
      ></u-widget-header>

      <v-list-subheader
        >Here, you can adjust the SEO configurations specifically at the
        category level.
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
      <u-widget-header
        :title="$t('community.commons.cross_community')"
        icon="leak_add"
      ></u-widget-header>

      <v-list-subheader
        >Categories can be cross-linked and integrated into other communities.
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
      <u-widget-header
        :title="$t('global.commons.access')"
        icon="private_connectivity"
      ></u-widget-header>

      <v-list-subheader
        >Determine whether customers are permitted to create new topics in this
        category.
      </v-list-subheader>
      <u-smart-toggle
        v-model="restrict"
        :true-description="$t('community.category.restrict_msg')"
        :true-title="$t('community.category.restrict')"
        color="red"
        false-gray
      ></u-smart-toggle>
    </div>
  </div>
</template>

<script lang="ts">
import CImageInput from "../../../community/image/input/CImageInput.vue";
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper.ts";


export default {
  name: "CCategoryEdit",
  mixins: [],
  components: { USmartToggle, CImageInput },

  props: {
    community: {
      required: true,
      type: Object,
    },
    category: {},
  },

  data() {
    return {
      busy: false,

      title: "",
      desc: "",
      image: null,
      image_file: null,
      nofollow: false,
      cross: false,
      restrict: false,
    };
  },

  computed: {},

  created() {
    if (this.category) {
      this.title = this.category.title;
      this.desc = this.category.desc;
      this.image = this.category.image;
      this.nofollow = this.category.nofollow;
      this.cross = this.category.cross;
      this.restrict = this.category.restrict;
    } else {
      // Inherit configs:
      this.nofollow = this.community.nofollow;
      this.cross = this.community.cross;
    }
  },
  mounted() {},

  methods: {
    //――――――――――――――――――――――― New category ―――――――――――――――――――――――

    save(callback_busy) {
      if (!this.title) {
        return NotificationService.showErrorAlert(null, "Enter title for the category!");
      }
      if (!this.desc) {
        return NotificationService.showErrorAlert(null, "Enter description for the category!");
      }

      this.busy = true;
      if (callback_busy) callback_busy(true);

      const formData = new FormData();

      formData.append("title", this.title);
      formData.append("desc", this.desc);
      formData.append("nofollow", this.nofollow);
      formData.append("cross", this.cross);
      formData.append("restrict", this.restrict);

      if (this.image_file)
        formData.append("image", this.image_file, this.image_file.name);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      let promise = null;
      if (this.category) {
        promise = axios.post(
          window.CAPI.POST_COMMUNITY_EDIT_CATEGORY(
            this.community.id,
            this.category.id,
          ),
          formData,
          config,
        );
      } else {
        promise = axios.post(
          window.CAPI.POST_COMMUNITY_NEW_CATEGORY(this.community.id),
          formData,
          config,
        );
      }

      promise
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.category
                ? "The category has been updated successfully."
                : "New category has been created successfully.",
            );

            if (this.category) {
              this.$emit("update:category", data.category);

              ScrollHelper.scrollToTop(0, "smooth");
            } else {
              this.$emit("add", data.category);
              this.resetToDefault(); // 🞇 Reset to default
            }
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
          if (callback_busy) callback_busy(false);
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
