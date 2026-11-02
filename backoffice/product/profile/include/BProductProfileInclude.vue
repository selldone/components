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
  <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Assign Package Profile ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

  <v-list-item
    :class="modern ? 'b-product-profile-include--modern sd-modern-clickable-item text-start' : 'row-hover'"
    :prepend-icon="modern ? undefined : 'bento'"
    @click="showIncludes()"
    slim
  >
    <template v-if="modern" #prepend>
      <b-product-edit-info-icon class="me-3" name="PackageOpen" />
    </template>
    <v-list-item-title>
      <b
        >{{ $t("global.commons.included_in_the_product") }}
        <span v-if="product.includes?.length">
          <v-icon class="mx-1" color="#111">{{
            $t("icons.chevron_next")
          }}</v-icon>
          {{ modern ? $t('add_product.edit_info.modern.digest_included', { count: product.includes.length }, product.includes.length) : `${product.includes.length} items` }}</span
        >
      </b>
    </v-list-item-title>

    <v-menu v-for="include in product.includes" :key="include.id" open-on-hover>
      <template v-slot:activator="{ props }">
        <v-avatar class="me-2" color="#fff" rounded size="24" v-bind="props">
          <img :src="getShopImagePath(include.image)" />
        </v-avatar>
      </template>
      <v-sheet class="pa-3 small" color="#fff" rounded="xl">
        <v-img
          :src="getShopImagePath(include.image)"
          class="mx-auto mb-3 rounded-lg"
          height="128"
          width="128"
        />
        <div>
          {{ include.title }}
        </div>
      </v-sheet>
    </v-menu>
    <v-list-item-subtitle v-if="!product.includes?.length">
      {{ $t(modern ? 'add_product.edit_info.modern.not_assigned' : "product_include_profile.subtitle") }}
    </v-list-item-subtitle>

    <template v-slot:append>
      <v-list-item-action end>
        <v-btn
          v-if="modern"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
          @click.stop="showIncludes()"
        >{{ $t('global.commons.manage') }}</v-btn>
        <v-btn
          v-else
          :color="product.includes?.length ? 'success' : 'primary'"
          icon
          variant="text"
        >
          <v-icon
            >{{ product.includes?.length ? "check_box" : "add_box" }}
          </v-icon>
        </v-btn>
      </v-list-item-action>
    </template>

    <!-- ██████████████████████ Dialog > Select Included in the product ██████████████████████ -->

    <v-dialog
      v-model="includes_dialog"
      :fullscreen="!modern"
      :max-width="modern ? 760 : undefined"
      :persistent="busy_save"
      :aria-label="modern ? t('title') : undefined"
      scrollable
      :transition="modern ? 'dialog-transition' : 'dialog-bottom-transition'"
      @keydown.esc.capture="dismissIncludeHelp"
    >
      <v-card v-if="modern" class="sd-modern-widget b-product-profile-include__dialog text-start" :aria-busy="busy_save">
        <header class="b-product-profile-include__header">
          <div class="b-product-profile-include__heading">
            <b-product-edit-info-icon name="PackageOpen" :size="22" />
            <div><h1>{{ t('title') }}</h1><p>{{ t('subtitle') }}</p></div>
          </div>
          <v-btn class="sd-modern-icon-button" icon variant="text" :disabled="busy_save" :aria-label="$t('global.actions.close')" @click="closeIncludes">
            <b-product-edit-info-icon name="X" :size="16" />
            <v-tooltip :model-value="include_help === 'close'" @update:model-value="setIncludeHelp('close', $event)" activator="parent" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">{{ $t('global.actions.close') }}</v-tooltip>
          </v-btn>
        </header>
        <v-card-text class="sd-modern-canvas b-product-profile-include__workspace">
          <section class="sd-modern-widget b-product-profile-include__widget">
            <div class="b-product-profile-include__section-header">
              <div class="b-product-profile-include__section-title">
                <b-product-edit-info-icon name="ListChecks" :size="17" />
                <h2>{{ t('included_title') }}</h2>
                <span class="b-product-profile-include__count" aria-live="polite">{{ $t('product_include_profile.refined.item_count', { count: includes.length }, includes.length) }}</span>
              </div>
              <v-btn v-if="!IS_VENDOR_PANEL" class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" :disabled="busy_save" :to="{ name: 'BPageShopLogisticIncludes', params: { shop_id: shop.id } }">
                <template #prepend><b-product-edit-info-icon name="List" :size="16" /></template>{{ $t('product_include_profile.dialog.action_manage') }}
              </v-btn>
            </div>
            <div v-if="includes.length" class="b-product-profile-include__grid">
              <article v-for="it in includes" :key="it.id" class="b-product-profile-include__item">
                <div class="b-product-profile-include__image">
                  <v-img v-if="it.image" :src="getShopImagePath(it.image)" :alt="it.title" height="100" contain>
                    <template #error><b-product-edit-info-icon name="Image" :size="36" /></template>
                  </v-img>
                  <b-product-edit-info-icon v-else name="Image" :size="36" />
                </div>
                <h3>{{ it.title }}</h3>
                <p class="b-product-profile-include__code">{{ $t('global.commons.code') }}: <span v-copy><bdi>{{ it.code }}</bdi></span></p>
                <v-btn class="sd-modern-icon-button b-product-profile-include__remove" icon variant="text" :disabled="busy_save" :aria-label="t('remove_item', { title: it.title })" @click="removeInclude(it)">
                  <b-product-edit-info-icon name="X" :size="16" />
                  <v-tooltip :model-value="include_help === `remove-${it.id}`" @update:model-value="setIncludeHelp(`remove-${it.id}`, $event)" activator="parent" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">{{ t('remove_help') }}</v-tooltip>
                </v-btn>
              </article>
            </div>
            <div v-else class="b-product-profile-include__empty" role="status">
              <b-product-edit-info-icon name="PackageOpen" :size="32" />
              <h3>{{ t('empty_title') }}</h3><p>{{ t('empty_help') }}</p>
            </div>
            <p v-if="includes.length" class="b-product-profile-include__note"><b-product-edit-info-icon name="Info" :size="16" /><span>{{ t('package_help') }}</span></p>
          </section>
          <section class="sd-modern-widget b-product-profile-include__widget">
            <div class="b-product-profile-include__section-title"><b-product-edit-info-icon name="Plus" :size="17" /><h2>{{ t('add_title') }}</h2></div>
            <div class="b-product-profile-include__add-row">
              <b-include-item-input
                v-if="includes_dialog"
                v-model="selected_include"
                :shop="shop"
                :label="t('choose_item')"
                :placeholder="t('select_item')"
                :disabled="busy_save"
                hide-details="auto"
                persistent-placeholder
                class="sd-modern-underlined-field b-product-profile-include__input"
              />
              <v-btn class="sd-modern-button" variant="outlined" :disabled="busy_save || !selected_include" @click="addSelectedInclude">
                <template #prepend><b-product-edit-info-icon name="Plus" :size="16" /></template>{{ t('add_item') }}
              </v-btn>
            </div>
            <div v-if="!IS_VENDOR_PANEL" class="b-product-profile-include__create-row">
              <div class="b-product-profile-include__create-help">
                <span>{{ t('new_item_hint') }}</span>
                <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="t('create_help')" :disabled="busy_save" @click="setIncludeHelp('create', true)">
                  <b-product-edit-info-icon name="Info" :size="15" />
                  <v-tooltip :model-value="include_help === 'create'" @update:model-value="setIncludeHelp('create', $event)" activator="parent" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">{{ t('create_help') }}</v-tooltip>
                </v-btn>
              </div>
              <v-btn class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" :disabled="busy_save" @click="dialog_add = true">
                <template #prepend><b-product-edit-info-icon name="Plus" :size="16" /></template>{{ t('create_item') }}
              </v-btn>
            </div>
            <p v-else class="b-product-profile-include__owner-help">{{ t('owner_help') }}</p>
          </section>
        </v-card-text>
        <footer class="b-product-profile-include__footer">
          <p>{{ t('save_scope') }}</p>
          <div class="b-product-profile-include__actions">
            <v-btn class="sd-modern-button" variant="outlined" :disabled="busy_save" @click="closeIncludes">{{ $t('global.actions.cancel') }}</v-btn>
            <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :loading="busy_save" :disabled="busy_save" @click="saveIncludes">
              <template #prepend><b-product-edit-info-icon name="Save" :size="16" /></template>{{ t('save') }}
            </v-btn>
          </div>
        </footer>
      </v-card>
      <v-card v-else>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1">bento</v-icon>
          {{ $t("product_include_profile.dialog.header") }}
        </v-card-title>
        <v-card-text>
          <div class="widget-box -large mb-5">
            <u-widget-header
              :add-caption="$t('product_include_profile.dialog.action_manage')"
              :disabled="IS_VENDOR_PANEL"
              :disabled-reason="
                $t('product_include_profile.dialog.action_disable_msg')
              "
              :title="$t('product_include_profile.dialog.title')"
              :to="{ name: 'BPageShopLogisticIncludes' }"
              add-icon="ballot"
              add-text
              icon="library_add_check"
            >
            </u-widget-header>

            <v-expand-transition>
              <div v-if="includes?.length">
                <v-list-subheader>
                  {{ $t("product_include_profile.dialog.subtitle") }}
                </v-list-subheader>
                <v-container>
                  <v-row>
                    <v-col
                      v-for="it in includes"
                      :key="it.id"
                      class="text-center small position-relative"
                      cols="12"
                      lg="3"
                      md="4"
                      sm="6"
                    >
                      <v-img
                        :src="getShopImagePath(it.image)"
                        aspect-ratio="1"
                        class="mx-auto my-3 rounded-lg"
                        max-width="90%"
                        width="128"
                      />
                      <div>
                        {{ it.title }}
                      </div>
                      <div class="small text-muted" title="Item Code">
                        code: <span v-copy>{{ it.code }}</span>
                      </div>
                      <v-btn
                        class="absolute-top-end"
                        icon
                        size="small"
                        variant="flat"
                        @click="DeleteItemByID(includes, it.id)"
                      >
                        <v-icon color="red">close</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </div>
            </v-expand-transition>

            <v-list-subheader>
              {{ $t("product_include_profile.dialog.select_items_tips") }}
            </v-list-subheader>

            <div class="max-widget-width">
              <v-locale-provider :rtl="false">
                <b-include-item-input
                  v-model="selected_include"
                  :shop="shop"
                  @update:model-value="
                    (val) => {
                      if (val) AddOrUpdateItemByID(includes, val);
                    }
                  "
                ></b-include-item-input>
              </v-locale-provider>
            </div>

            <template v-if="!IS_VENDOR_PANEL">
              <v-list-subheader>
                {{ $t("product_include_profile.dialog.create_item_tips") }}
              </v-list-subheader>

              <div class="widget-buttons">
                <v-btn
                  size="x-large"
                  variant="outlined"
                  @click="dialog_add = true"
                >
                  <v-icon class="me-1">add_box</v-icon>
                  {{
                    $t("product_include_profile.dialog.create_new_item_action")
                  }}
                </v-btn>
              </div>
            </template>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="includes_dialog = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              :loading="busy_save"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="saveIncludes()"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ██████████████████████ Dialog > Select Included in the product ██████████████████████ -->

    <v-dialog
      v-model="dialog_add"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <b-include-item-add
        :shop="shop"
        :vendor="vendor"
        :modern="modern"
        class="max-widget-width"
        dialog-mode
        @add="handleIncludeCreated"
        @close="dialog_add = false"
      >
      </b-include-item-add>
    </v-dialog>
  </v-list-item>
</template>

<script lang="ts">
import BIncludeItemInput from "../../../include-item/input/BIncludeItemInput.vue";
import BIncludeItemAdd from "../../../include-item/add/BIncludeItemAdd.vue";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductProfileInclude",
  mixins: [],
  components: {
    BProductEditInfoIcon,
    BIncludeItemAdd,
    BIncludeItemInput,
  },
  props: {
    modern: { type: Boolean, default: false },
    product: {
      required: true,
      type: Object,
    },
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },

  data: function () {
    return {
      includes: [],
      includes_dialog: false,

      selected_include: null,
      busy_save: false,

      dialog_add: false,
      include_help: null,
    };
  },
  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {
    includes_dialog(open) { if (!open) this.include_help = null; },
  },

  created() {},

  methods: {
    // ████████████████████ Included in the box ████████████████████

    setIncludeHelp(key, open) {
      if (open) this.include_help = key;
      else if (this.include_help === key) this.include_help = null;
    },

    dismissIncludeHelp(event) {
      if (!this.include_help) return;
      // Tooltips do not join Vuetify's overlay stack; Escape must dismiss help first.
      event.preventDefault();
      event.stopPropagation();
      this.include_help = null;
    },

    t(key, values = {}) {
      return this.$t(`product_include_profile.refined.${key}`, values);
    },

    showIncludes() {
      if (this.busy_save) return;
      this.includes = Object.assign([], this.product.includes); // Return object!
      if (!this.includes || !Array.isArray(this.includes)) this.includes = [];
      this.includes_dialog = true;
      this.selected_include = null;
      this.include_help = null;
    },

    closeIncludes() {
      if (this.busy_save) return;
      this.includes_dialog = false;
    },

    addSelectedInclude() {
      if (this.busy_save || !this.selected_include) return;
      this.AddOrUpdateItemByID(this.includes, this.selected_include);
      this.selected_include = null;
    },

    removeInclude(include) {
      if (this.busy_save) return;
      this.DeleteItemByID(this.includes, include.id);
      if (this.selected_include?.id === include.id) this.selected_include = null;
      if (this.include_help === `remove-${include.id}`) this.include_help = null;
    },

    handleIncludeCreated(include) {
      if (this.busy_save) return;
      this.AddOrUpdateItemByID(this.includes, include);
      this.dialog_add = false;
    },

    saveIncludes() {
      if (this.busy_save) return;
      this.busy_save = true;

      return axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POST_MY_VENDOR_PRODUCT_INCLUDE_SET(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_PRODUCT_INCLUDE_SET(
                this.shop.id,
                this.product.id,
              ),
          {
            ids: this.includes?.map((i) => i.id),
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          this.product.includes = data.includes;
          this.includes_dialog = false;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-profile-include__dialog.v-card {
  --sd-modern-icon-button-size: 34px;
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: 20px;
  font-family: inherit;
  font-size: var(--sd-modern-font-body);
  font-weight: 400;
  line-height: 1.55;

  .b-product-profile-include__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 24px; flex: 0 0 auto; }
  .b-product-profile-include__heading {
    display: flex; align-items: flex-start; gap: 14px; min-width: 0;
    > .b-product-edit-info-icon { flex-shrink: 0; margin-block-start: 3px; }
    h1 { margin: 0; font-family: inherit; font-size: 20px; font-weight: 500; line-height: 28px; letter-spacing: -.25px; }
    p { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  }
  .b-product-profile-include__workspace { display: flex; flex-direction: column; gap: 16px; padding: 20px; min-width: 0; }
  .b-product-profile-include__widget { min-width: 0; padding: 20px; border-radius: 14px; flex-shrink: 0; }
  .b-product-profile-include__section-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px; }
  .b-product-profile-include__section-title { display: flex; align-items: center; gap: 8px; min-width: 0; flex-wrap: wrap; > .b-product-edit-info-icon { flex-shrink: 0; color: var(--sd-modern-muted); } }
  h2 { margin: 0; font-family: inherit; font-size: 15px; font-weight: 500; line-height: 23px; letter-spacing: 0; }
  .b-product-profile-include__count { color: var(--sd-modern-muted); font-size: 13px; font-weight: 400; line-height: 20px; }
  .b-product-profile-include__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px 16px; margin-block-start: 18px; }
  .b-product-profile-include__item { min-width: 0; position: relative; }
  .b-product-profile-include__image {
    display: flex; align-items: center; justify-content: center; height: 100px; margin-block-end: 10px; border-radius: 10px;
    color: var(--sd-modern-muted); background: var(--sd-modern-canvas-color); overflow: hidden;
    :deep(.v-img__error) { display: flex; align-items: center; justify-content: center; }
  }
  h3 { margin: 0; font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; letter-spacing: 0; overflow-wrap: anywhere; }
  .b-product-profile-include__code { margin: 2px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; overflow-wrap: anywhere; }
  .b-product-profile-include__remove { --sd-modern-icon-button-size: 28px; position: absolute; inset-block-start: 6px; inset-inline-end: 6px; border-radius: 7px; }
  .b-product-profile-include__note { display: flex; align-items: flex-start; gap: 8px; margin: 20px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; > .b-product-edit-info-icon { flex-shrink: 0; margin-block-start: 2px; } }
  .b-product-profile-include__empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding-block: 30px; text-align: center; color: var(--sd-modern-muted); p { margin: 0; font-size: 13px; line-height: 20px; } }
  .b-product-profile-include__add-row { display: flex; align-items: flex-end; gap: 12px; margin-block-start: 16px; }
  .b-product-profile-include__input { flex: 1; min-width: 0; }
  .b-product-profile-include__create-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-block-start: 15px; }
  .b-product-profile-include__create-help { display: flex; align-items: center; gap: 5px; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  .b-product-profile-include__owner-help { margin: 15px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  .b-product-profile-include__footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 24px; flex: 0 0 auto; > p { max-width: 270px; margin: 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; } }
  .b-product-profile-include__actions { display: flex; gap: 8px; flex-shrink: 0; }
  .sd-modern-button { font-family: inherit; font-size: 13px; line-height: 20px; }

  @media (max-width: 520px) {
    border-radius: 15px;
    --sd-modern-icon-button-size: 44px;
    .b-product-profile-include__header { padding: 20px 16px; gap: 10px; }
    .b-product-profile-include__heading { gap: 10px; h1 { font-size: 18px; line-height: 26px; } }
    .b-product-profile-include__workspace { padding: 12px; gap: 12px; }
    .b-product-profile-include__widget { padding: 16px; }
    .b-product-profile-include__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px 12px; }
    .b-product-profile-include__image { height: 86px; :deep(.v-img) { height: 86px !important; } }
    .b-product-profile-include__remove { --sd-modern-icon-button-size: 44px; inset-block-start: 0; inset-inline-end: 0; }
    .b-product-profile-include__add-row { flex-direction: column; align-items: stretch; }
    .b-product-profile-include__input { flex: 0 0 auto; }
    .b-product-profile-include__create-row { align-items: flex-start; flex-direction: column; }
    .b-product-profile-include__footer { flex-direction: column; align-items: stretch; gap: 12px; padding: 16px; > p { max-width: none; } }
    .b-product-profile-include__actions { justify-content: flex-end; }
    .sd-modern-button { min-height: 44px; }
  }
  @media (pointer: coarse) { .sd-modern-icon-button { --sd-modern-icon-button-size: 44px; } .sd-modern-button { min-height: 44px; } }
}

.b-product-profile-include--modern {
  min-height: 62px;
  padding: 10px 12px;
  border-radius: 9px;
  :deep(.v-list-item-title), :deep(.v-list-item-title b) { font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; letter-spacing: 0; white-space: normal; }
  :deep(.v-list-item-title .v-icon) { font-size: 14px; color: var(--sd-modern-muted) !important; }
  :deep(.v-list-item-subtitle) { margin-top: 2px; color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; line-height: 19px; opacity: 1; white-space: normal; overflow-wrap: anywhere; }
  :deep(.v-list-item__append) { padding-inline-start: 12px; }
  .b-product-edit-info-icon { color: var(--sd-modern-muted); }
}

.label-s-number-input {
  color: #2f3133;
  font-weight: 400;
  vertical-align: baseline;
  text-align: start;
  margin: 0 16px;
}
</style>
