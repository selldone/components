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
  <div v-if="modern" class="c-category-edit c-category-edit--modern">
    <!-- Category details -->
    <section :aria-labelledby="`${formId}-details`">
      <div class="c-category-edit__details">
        <div class="c-category-edit__fields">
          <h3 :id="`${formId}-details`">
            {{ $t("community_categories.editor.details") }}
          </h3>
          <div class="c-category-edit__guidance">
            <p>{{ $t("community_categories.editor.details_description") }}</p>
            <v-tooltip
              v-model="details_help"
              location="top"
              content-class="sd-modern-tooltip text-start"
              :open-on-click="false"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  class="sd-modern-icon-button sd-modern-info-button"
                  variant="text"
                  icon
                  :aria-label="$t('community_categories.editor.details_help')"
                  @click.stop="details_help = true"
                >
                  <v-icon size="16">info_outline</v-icon>
                </v-btn>
              </template>
              {{ $t("community_categories.editor.details_help") }}
            </v-tooltip>
          </div>

          <div class="c-category-edit__label">
            <label :for="`${formId}-title`"
              >{{ $t("community_categories.editor.title") }}
              <span aria-hidden="true">*</span></label
            >
            <span aria-hidden="true">{{ title.length }}/128</span>
          </div>
          <v-text-field
            :id="`${formId}-title`"
            ref="title_input"
            v-model="title"
            class="sd-modern-underlined-field c-category-edit__field"
            variant="underlined"
            :placeholder="$t('community_categories.editor.title_placeholder')"
            maxlength="128"
            required
            :error-messages="
              validation_requested && !title
                ? $t('community_categories.editor.required_title')
                : []
            "
            :readonly="busy"
          />

          <div class="c-category-edit__label">
            <label :for="`${formId}-desc`"
              >{{ $t("community_categories.editor.description") }}
              <span aria-hidden="true">*</span></label
            >
            <span aria-hidden="true">{{ desc.length }}/256</span>
          </div>
          <v-textarea
            :id="`${formId}-desc`"
            ref="desc_input"
            v-model="desc"
            class="sd-modern-underlined-field c-category-edit__field c-category-edit__description"
            variant="underlined"
            rows="2"
            no-resize
            maxlength="256"
            required
            :placeholder="
              $t('community_categories.editor.description_placeholder')
            "
            :error-messages="
              validation_requested && !desc
                ? $t('community_categories.editor.required_description')
                : []
            "
            :readonly="busy"
          />
        </div>

        <!-- Keep the existing picker, File preview and size validation. -->
        <div class="c-category-edit__image-group">
          <div class="c-category-edit__image-heading">
            <span>{{ $t("global.commons.image") }}</span>
            <span>{{ $t("community_categories.editor.optional") }}</span>
          </div>
          <c-image-input
            ref="image_input"
            v-model="image_file"
            :src="image && getShopImagePath(image)"
            :inert="busy"
            class="c-category-edit__image"
          />
          <div class="c-category-edit__image-copy">
            <p
              v-if="image_file || image"
              class="c-category-edit__filename"
              :title="image_file?.name"
            >
              {{
                image_file?.name ||
                $t("community_categories.editor.current_image")
              }}
            </p>
            <p v-else>{{ $t("community_categories.editor.image_hint") }}</p>
            <p>{{ $t("community_categories.editor.image_help") }}</p>
            <v-btn
              v-if="image_file || image"
              class="sd-modern-button sd-modern-button--small c-category-edit__change-image"
              variant="text"
              :disabled="busy"
              @click="$refs.image_input.showSelectImage()"
            >
              {{ $t("community_categories.editor.change_image") }}
            </v-btn>
          </div>
        </div>
      </div>
    </section>

    <!-- SEO, cross-community and access settings -->
    <section
      class="c-category-edit__settings"
      :aria-labelledby="`${formId}-settings`"
    >
      <h3 :id="`${formId}-settings`">
        {{ $t("community_categories.editor.settings") }}
      </h3>
      <p>{{ $t("community_categories.editor.settings_description") }}</p>
      <u-smart-toggle
        v-for="setting in ['nofollow', 'cross', 'restrict']"
        :key="setting"
        v-model="$data[setting]"
        class="c-category-edit__toggle"
        false-gray
        :readonly="busy"
        :true-title="$t(`community_categories.editor.${setting}_title`)"
        :false-title="$t(`community_categories.editor.${setting}_title`)"
        :true-description="$t(`community_categories.editor.${setting}_on`)"
        :false-description="$t(`community_categories.editor.${setting}_off`)"
        role="switch"
        :aria-checked="!!$data[setting]"
        :aria-disabled="busy"
        tabindex="0"
        :aria-label="$t(`community_categories.editor.${setting}_title`)"
        :aria-description="
          $t(
            `community_categories.editor.${setting}_${$data[setting] ? 'on' : 'off'}`,
          )
        "
        @keydown.space.prevent="!busy && ($data[setting] = !$data[setting])"
        @keydown.enter.prevent="!busy && ($data[setting] = !$data[setting])"
      >
        <template #title>
          <span class="c-category-edit__state" aria-hidden="true">{{
            $t(
              `community_categories.editor.state_${$data[setting] ? "on" : "off"}`,
            )
          }}</span>
        </template>
      </u-smart-toggle>
    </section>
  </div>
  <!-- Public community callers retain their existing form. -->
  <div v-else>
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
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import CImageInput from "../../../community/image/input/CImageInput.vue";
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper.ts";
import { useId } from "vue";

export default {
  name: "CCategoryEdit",
  mixins: [],
  components: { USmartToggle, CImageInput },
  setup() {
    return { formId: useId() };
  },

  props: {
    community: {
      required: true,
      type: Object,
    },
    category: {},
    modern: { type: Boolean, default: false },
  },

  data() {
    return {
      busy: false,
      validation_requested: false,
      details_help: false,

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
    closeDetailsHelp(event) {
      if (!this.details_help) return;
      event.stopPropagation();
      this.details_help = false;
    },

    //――――――――――――――――――――――― New category ―――――――――――――――――――――――

    save(callback_busy) {
      if (this.modern) {
        if (this.busy) return;
        this.validation_requested = true;
        if (!this.title || !this.desc) {
          this.$nextTick(() =>
            this.$refs[!this.title ? "title_input" : "desc_input"]?.focus(),
          );
          return;
        }
      }
      if (!this.title) {
        return NotificationService.showErrorAlert(
          null,
          "Enter title for the category!",
        );
      }
      if (!this.desc) {
        return NotificationService.showErrorAlert(
          null,
          "Enter description for the category!",
        );
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

<style lang="scss" scoped>
.c-category-edit--modern {
  h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }

  p {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
  }

  .c-category-edit__guidance {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-block: 4px 20px;
  }

  .c-category-edit__details {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 140px;
    align-items: start;
    gap: 26px;
  }

  .c-category-edit__label,
  .c-category-edit__image-heading {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;

    > span:last-child {
      color: var(--sd-modern-muted);
      font-size: 11px;
      font-weight: 400;
    }
  }

  .c-category-edit__field {
    --sd-modern-field-height: 38px;

    :deep(.v-field__input) {
      min-height: 38px;
      height: auto;
      padding: 9px 0;
      font-size: 13px;
      line-height: 20px;
    }

    :deep(.v-input__details) {
      min-height: 26px;
    }

    :deep(.v-field__input::placeholder) {
      color: var(--sd-modern-muted);
      opacity: 1;
    }
  }

  .c-category-edit__description :deep(.v-field__input) {
    min-height: 76px;
    // The default textarea fade assumes larger top padding and masks the first line.
    mask-image: none;
  }

  .c-category-edit__image {
    :deep(> .dashed),
    :deep(.v-img) {
      width: 128px !important;
      height: 128px !important;
      max-width: 100%;
    }

    :deep(> .dashed) {
      border-color: var(--sd-modern-border);
      border-radius: 12px;
    }

    :deep(.v-img) {
      box-shadow: var(--sd-modern-selected-shadow);
    }
  }

  .c-category-edit__image-heading {
    font-size: 13px;
    line-height: 20px;
    margin-block-end: 10px;
  }

  .c-category-edit__image-copy {
    text-align: center;

    p {
      font-size: 11px;
      line-height: 16px;
    }
  }

  .c-category-edit__filename {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .c-category-edit__change-image {
    margin-block-start: 4px;
    padding-inline: 8px;
  }

  .c-category-edit__settings {
    margin-block-start: 4px;
    padding-block-start: 20px;
    border-block-start: 1px solid var(--sd-modern-border);

    > p {
      margin-block: 4px 6px;
    }
  }

  .c-category-edit__toggle {
    border-block-end: 1px solid var(--sd-modern-border);
    border-radius: 4px;

    &:last-child {
      border-block-end: 0;
    }

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }

    :deep(> .rounded-card) {
      position: relative;
      padding: 14px 0 !important;
      border-radius: 0;
    }

    :deep(.flex-grow-1) {
      min-width: 0;
      padding-inline-end: 32px;
    }

    :deep(b) {
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
    }

    :deep(.small) {
      color: var(--sd-modern-muted);
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      opacity: 1 !important;
    }
  }

  .c-category-edit__state {
    position: absolute;
    inset-inline-end: 0;
    inset-block-start: 16px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
  }
}

@media (max-width: 600px) {
  .c-category-edit--modern {
    .c-category-edit__details {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }

    .c-category-edit__image-group {
      display: grid;
      grid-template-columns: 104px minmax(0, 1fr);
      align-items: center;
      gap: 6px 16px;
      margin-block-end: 24px;
    }

    .c-category-edit__image-heading {
      grid-column: 2;
      grid-row: 1;
      align-self: end;
      margin: 0;
    }

    .c-category-edit__image {
      grid-column: 1;
      grid-row: 1 / 3;
      :deep(> .dashed),
      :deep(.v-img) {
        width: 104px !important;
        height: 104px !important;
      }
    }

    .c-category-edit__image-copy {
      grid-column: 2;
      grid-row: 2;
      align-self: start;
      text-align: start;
    }
  }
}

@media (max-width: 360px) {
  .c-category-edit--modern {
    .c-category-edit__image-group {
      grid-template-columns: 88px minmax(0, 1fr);
      column-gap: 13px;
    }

    .c-category-edit__image {
      :deep(> .dashed),
      :deep(.v-img) {
        width: 88px !important;
        height: 88px !important;
      }
    }
  }
}

@media (max-width: 600px), (pointer: coarse) {
  .c-category-edit--modern .c-category-edit__field :deep(.v-field__input) {
    font-size: 16px;
    min-height: 44px;
  }

  .c-category-edit--modern
    .c-category-edit__image
    :deep(.absolute-top-end.v-btn) {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
