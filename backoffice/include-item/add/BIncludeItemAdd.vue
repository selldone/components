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
  <v-card class="text-start">
    <v-card-title>
      <v-icon class="me-2">bento</v-icon>
      {{
        include?.id
          ? $t("include_item_add.dialog_title_edit")
          : $t("include_item_add.dialog_title_add")
      }}
    </v-card-title>
    <v-card-text>
      <div class="widget-box mb-5">
        <u-widget-header
          icon="tune"
          :title="$t('include_item_add.title')"
        ></u-widget-header>
        <v-list-subheader>
          {{ $t("include_item_add.subtitle") }}
        </v-list-subheader>

        <div v-if="include?.image" class="my-3 text-center">
          <v-avatar rounded size="124">
            <img :src="getShopImagePath(include.image)" />
          </v-avatar>
        </div>
        <v-text-field
          v-model="include_title"
          counter="256"
          :label="$t('global.commons.title') + '*'"
          :placeholder="$t('include_item_add.inputs.title.placeholder')"
          variant="underlined"
          persistent-placeholder
          @blur="
            include_code = include_code
              ? include_code
              : include_title?.toLowerCase()
          "
        >
          <template v-slot:append-inner>
            <b-translation-button-include
              v-if="include?.id"
              :include="include"
              :shop="shop"
              :label="$t('global.commons.title')"
              translation-key="title"
            ></b-translation-button-include>
          </template>
        </v-text-field>

        <v-text-field
          v-model="include_code"
          :rules="[GlobalRules.counter(32), GlobalRules.required()]"
          counter="32"
          :hint="$t('include_item_add.inputs.code.hint')"
          label="Code*"
          :placeholder="$t('include_item_add.inputs.code.placeholder')"
          persistent-placeholder
          variant="underlined"
        ></v-text-field>

        <v-text-field
          v-model="include_description"
          counter="256"
          :hint="$t('include_item_add.inputs.description.hint')"
          persistent-placeholder
          :label="$t('global.commons.description')"
          :placeholder="$t('include_item_add.inputs.description.placeholder')"
          variant="underlined"
        >
          <template v-slot:append-inner>
            <b-translation-button-include
              v-if="include?.id"
              :include="include"
              :shop="shop"
              :label="$t('global.commons.description')"
              translation-key="description"
            ></b-translation-button-include>
          </template>
        </v-text-field>

        <v-file-input
          v-model="include_image"
          accept="image/*"
          :label="$t('global.commons.image') + '*'"
          :messages="$t('include_item_add.inputs.image.message')"
          prepend-icon=""
          prepend-inner-icon="image"
          show-size
          variant="underlined"
        >
          <template v-slot:append-inner>
            <v-icon v-if="include" color="green">check_circle</v-icon>
          </template>
        </v-file-input>

        <u-smart-select
          v-model="mode"
          :items="[
            { value: null, title: $t('include_item_add.mode.no_link.title') },
            {
              value: 'external',
              title: $t('include_item_add.mode.external_link.title'),
              description: $t(
                'include_item_add.mode.external_link.description',
              ),
            },
            {
              value: 'internal',
              title: $t('include_item_add.mode.internal_link.title'),
              description: $t(
                'include_item_add.mode.internal_link.description',
              ),
            },
          ]"
          class="my-5"
          item-description="description"
          item-text="title"
          item-value="value"
        >
        </u-smart-select>
      </div>

      <v-expand-transition>
        <div v-if="mode === 'external'">
          <div class="widget-box mb-5">
            <u-widget-header
              :title="$t('include_item_add.mode.external_link.title')"
              icon="link"
            >
            </u-widget-header>
            <v-list-subheader>
              {{ $t("include_item_add.mode.external_link.tips") }}
            </v-list-subheader>
            <v-locale-provider :rtl="false">
              <v-text-field
                v-model="url"
                :counter="256"
                :label="$t('global.commons.link')"
                persistent-placeholder
                placeholder="https://your url here..."
                variant="underlined"
              ></v-text-field>
            </v-locale-provider>
          </div>
        </div>
        <div v-else-if="mode === 'internal'">
          <div class="widget-box mb-5">
            <u-widget-header
              :title="$t('include_item_add.mode.internal_link.title')"
              icon="architecture"
            >
            </u-widget-header>
            <v-list-subheader>
              {{ $t("include_item_add.mode.internal_link.tips") }}
            </v-list-subheader>
            <v-locale-provider :rtl="false">
              <v-text-field
                v-model="path"
                :counter="64"
                :prefix="ShopURLs.MainShopUrl(shop) + '/in/'"
                :suffix="`-${include ? include.id : 'ID'}`"
                :label="$t('include_item_add.inputs.path.label')"
                messages="ex. light-cable"
                variant="underlined"
                persistent-placeholder
              >
                <template v-slot:append-inner>
                  <v-btn
                    v-if="internal_page_link"
                    :href="internal_page_link"
                    icon
                    size="small"
                    target="_blank"
                    title="Open page"
                    variant="text"
                  >
                    <v-icon>open_in_new</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-locale-provider>

            <b-page-input v-model="page" :shop="shop"></b-page-input>

            <hr class="mt-10" />
            <l-augment-form
              v-model="augment"
              :loading="busy_load"
              class="my-10"
            ></l-augment-form>
          </div>
        </div>
      </v-expand-transition>
    </v-card-text>
    <v-card-actions>
      <s-widget-buttons :auto-fixed-position="!dialogMode">
        <v-btn size="x-large" variant="text" @click="$emit('close')">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <!-- Edit mode -->
        <v-btn
          v-if="include?.id"
          :disabled="!include_title"
          :loading="busy_edit"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="editInclude"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <!-- Add mode -->
        <v-btn
          v-else
          :disabled="!include_title || !include_image"
          :loading="busy_add"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="addInclude"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.add") }}
        </v-btn>
      </s-widget-buttons>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import USmartSelect from "../../../ui/smart/select/USmartSelect.vue";
import BPageInput from "../../page/input/BPageInput.vue";
import LAugmentForm from "@selldone/page-builder/components/augment/form/LAugmentForm.vue";
import BTranslationButtonInclude from "../../translation/button/include/BTranslationButtonInclude.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import { ShopURLs } from "@selldone/core-js/helper";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { Slugify } from "@selldone/core-js/utils/slugify/slugify.ts";

export default {
  name: "BIncludeItemAdd",
  mixins: [],
  emits: ["add", "edit", "close"],
  components: {
    UWidgetHeader,
    SWidgetButtons,
    BTranslationButtonInclude,
    LAugmentForm,
    BPageInput,
    USmartSelect,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },

    include: {
      // Edit mode
    },
    dialogMode: Boolean,
  },

  data: function () {
    return {
      ShopURLs: ShopURLs,
      includes: [],
      includes_dialog: false,

      busy_save: false,

      //----------------------
      include_title: null,
      include_code: null,
      include_image: null,
      include_description: null,
      busy_add: false,

      url: null,

      path: null,
      page: null,
      augment: [], // [{key,value}]

      //--------------------
      busy_edit: false,

      mode: null,

      busy_load: null,
    };
  },
  computed: {
    internal_page_link() {
      if (!this.include?.id) return null;
      return (
        ShopURLs.MainShopUrl(this.shop) +
        "/in/" +
        this.path +
        "-" +
        this.include.id
      );
    },
  },

  watch: {
    include() {
      this.init();
    },
    mode(mode) {
      if (mode === "internal") {
        if (!this.path) this.path = Slugify.apply(this.include_title); // Auto set a path!
        if (!this.augment || !Array.isArray(this.augment)) this.augment = [];
      }
    },
    page(page) {
      this.loadArgumentStructure(page);
    },
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.resetToDefault(); // 🞇 Reset to default

      if (this.include) {
        this.include_title = this.include.title;
        this.include_description = this.include.description;

        this.include_code = this.include.code;
        this.image = this.include.image;

        this.url = this.include.url;

        this.path = this.include.path;
        this.page = this.include.page;
        this.augment = this.include.augment;
        if (!this.augment || !Array.isArray(this.augment)) this.augment = [];

        if (this.url) this.mode = "external";
        else if (this.path) this.mode = "internal";
      }
    },

    addInclude() {
      this.busy_add = true;

      let formData = new FormData();
      if (this.include_image) formData.append("photo", this.include_image);
      if (this.include_title) formData.append("title", this.include_title);
      if (this.include_description)
        formData.append("description", this.include_description);
      if (this.include_code) formData.append("code", this.include_code);

      if (this.mode === "external") {
        if (this.url) formData.append("url", this.url);
      }

      if (this.mode === "internal") {
        if (this.path) formData.append("path", this.path);
        if (this.page) formData.append("page_id", this.page.id);
        if (this.augment)
          formData.append("augment", JSON.stringify(this.augment));
      }

      axios
        .post(
          window.API.POST_SHOP_INCLUDE_ADD(this.shop.id),

          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          NotificationService.showSuccessAlert(
            null,
            this.$t("include_item_add.notifications.add.message"),
          );
          this.$emit("add", data.include);
          this.include_title = null;
          this.include_description = null;
          this.include_code = null;
          this.include_image = null;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add = false;
        });
    },

    editInclude() {
      if (!this.include_code)
        this.include_code = Slugify.apply(this.include_title);

      this.busy_edit = true;
      let formData = new FormData();
      if (this.include_image) formData.append("photo", this.include_image);
      if (this.include_title) formData.append("title", this.include_title);
      if (this.include_description)
        formData.append("description", this.include_description);
      if (this.include_code) formData.append("code", this.include_code);

      if (this.mode === "external") {
        if (this.url) formData.append("url", this.url);
      }

      if (this.mode === "internal") {
        if (this.path) formData.append("path", this.path);
        if (this.page) formData.append("page_id", this.page.id);
        if (this.augment)
          formData.append("augment", JSON.stringify(this.augment));
      }

      axios
        .post(
          window.API.POST_SHOP_INCLUDE_EDIT(this.shop.id, this.include.id),

          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          NotificationService.showSuccessAlert(
            null,
            this.$t("include_item_add.notifications.edit.message"),
          );

          this.$emit("edit", data.include);
          this.include_title = null;
          this.include_description = null;
          this.include_code = null;
          this.include_image = null;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_edit = false;
        });
    },

    loadArgumentStructure(page) {
      if (!page?.id) return;

      this.busy_load = true;

      window.$backoffice.page
        .getPageAugment(this.shop.id, page.id, this.augment)
        .then(({ augment }) => {
          this.augment = augment;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_load = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.label-s-number-input {
  color: #2f3133;
  font-weight: 400;
  vertical-align: baseline;
  text-align: start;
  margin: 0 16px;
}
</style>
