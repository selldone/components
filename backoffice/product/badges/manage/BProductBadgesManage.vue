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
  <div>
    <component
      :is="modern ? 'details' : 'div'"
      :class="modern ? 'b-product-badges-manage--modern b-product-edit-features__panel sd-modern-widget sd-modern-disclosure' : ['widget-box mb-5', { disabled: busy_fetch }]"
    >
      <summary v-if="modern" class="sd-modern-disclosure__summary b-product-edit-features__summary">
        <b-product-edit-info-icon name="BadgeCheck" />
        <span class="b-product-edit-features__summary-copy">
          <span class="b-product-edit-features__summary-title">{{ $t('add_product.features_modern.badges_title') }}</span>
          <span class="b-product-edit-features__digest">{{ badgeDigest }}</span>
        </span>
        <span v-if="custom" class="b-product-edit-features__count">{{ badges?.length || 0 }}</span>
        <b-product-edit-info-icon name="ChevronDown" class="b-product-edit-features__chevron" :size="16" />
      </summary>
      <div :class="{ 'b-product-edit-features__panel-content': modern, disabled: modern && busy_fetch }">
      <u-widget-header
        v-if="!modern"
        :disabled="IS_VENDOR_PANEL"
        :add-caption="$t('product_badges.create_new_badge_action')"
        :disabled-reason="$t('product_badges.only_marketplace_owner_msg')"
        icon="verified"
        :title="$t('product_badges.title')"
        @click:add="showAdd"
      ></u-widget-header>

      <template v-if="modern">
        <p class="b-product-edit-features__intro">{{ $t('add_product.features_modern.badges_intro') }}</p>
        <div class="b-product-badges-manage__catalog-action">
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
            :disabled="IS_VENDOR_PANEL"
            @click="showAdd"
          >
            <template #prepend><b-product-edit-info-icon name="Plus" :size="16" /></template>
            {{ $t('product_badges.create_new_badge_action') }}
          </v-btn>
          <p>{{ $t(IS_VENDOR_PANEL ? 'product_badges.only_marketplace_owner_msg' : 'add_product.features_modern.badge_catalog_help') }}</p>
        </div>
      </template>
      <v-list-subheader v-else>{{ $t("product_badges.subtitle") }}</v-list-subheader>

      <u-loading-progress v-if="busy_set || busy_fetch"></u-loading-progress>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Custom / Auto mode▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

      <u-smart-switch
        v-model="custom"
        class="mb-5"
        :class="{ 'sd-modern-smart-select sd-modern-smart-select--columns': modern }"
        :border="modern || undefined"
        :accessible="modern"
        :false-description="
          $t('product_badges.inputs.custom.false_description')
        "
        false-icon="brightness_auto"
        :false-title="$t('product_badges.inputs.custom.false_title')"
        :true-description="$t('product_badges.inputs.custom.true_description')"
        true-icon="verified"
        :true-title="$t('product_badges.inputs.custom.true_title')"
        @change="
          (val) => {
            badges = val ? [] : null;
            saveProductBadges();
          }
        "
      >
      </u-smart-switch>
      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Custom badges ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <v-expand-transition>
        <div v-if="custom">
          <template v-if="modern">
            <h3 class="b-product-badges-manage__list-title">{{ $t('add_product.features_modern.selected_badges') }}</h3>
            <draggable
              v-model="badges"
              :item-key="(id) => id"
              tag="ol"
              handle=".b-product-badges-manage__drag"
              class="b-product-badges-manage__list"
              @change="saveProductBadges"
            >
              <template #item="{ element: id, index }">
                <li class="b-product-badges-manage__row">
                  <span class="b-product-badges-manage__drag" :title="$t('add_product.features_modern.badge_reorder')">
                    <b-product-edit-info-icon name="GripVertical" :size="16" />
                  </span>
                  <v-img v-if="findImage(id)" :src="findImage(id)" class="b-product-badges-manage__image" width="32" height="32" />
                  <div class="b-product-badges-manage__identity">
                    <strong>{{ findTitle(id) || $t('add_product.features_modern.badge_unavailable', { id }) }}</strong>
                    <span v-if="badgeById(id)?.link">{{ badgeById(id).link }}</span>
                    <span v-if="badgeById(id)?.pattern">{{ $t('add_product.features_modern.badge_pattern', { pattern: badgeById(id).pattern }) }}</span>
                  </div>
                  <div class="b-product-badges-manage__row-actions">
                    <v-tooltip location="top" content-class="sd-modern-tooltip text-start">
                      <template #activator="{ props }">
                        <v-btn v-bind="props" class="sd-modern-icon-button" variant="text" icon :disabled="index === 0" :aria-label="$t('add_product.features_modern.badge_move_up')" @click="moveBadge(index, -1)">
                          <b-product-edit-info-icon name="ArrowUp" :size="16" />
                        </v-btn>
                      </template>
                      {{ $t('add_product.features_modern.badge_move_up') }}
                    </v-tooltip>
                    <v-tooltip location="top" content-class="sd-modern-tooltip text-start">
                      <template #activator="{ props }">
                        <v-btn v-bind="props" class="sd-modern-icon-button" variant="text" icon :disabled="index === badges.length - 1" :aria-label="$t('add_product.features_modern.badge_move_down')" @click="moveBadge(index, 1)">
                          <b-product-edit-info-icon name="ArrowDown" :size="16" />
                        </v-btn>
                      </template>
                      {{ $t('add_product.features_modern.badge_move_down') }}
                    </v-tooltip>
                    <v-tooltip location="top" content-class="sd-modern-tooltip text-start">
                      <template #activator="{ props }">
                        <v-btn v-bind="props" class="sd-modern-icon-button" variant="text" icon :aria-label="$t('global.actions.edit')" @click="showEdit(id)">
                          <b-product-edit-info-icon name="Pencil" :size="16" />
                        </v-btn>
                      </template>
                      {{ $t('global.actions.edit') }}
                    </v-tooltip>
                    <v-tooltip location="top" content-class="sd-modern-tooltip text-start">
                      <template #activator="{ props }">
                        <v-btn v-bind="props" class="sd-modern-icon-button" variant="text" icon :aria-label="$t('add_product.features_modern.badge_remove')" @click="remove(badges, id); saveProductBadges()">
                          <b-product-edit-info-icon name="Trash2" :size="16" />
                        </v-btn>
                      </template>
                      {{ $t('add_product.features_modern.badge_remove') }}
                    </v-tooltip>
                  </div>
                </li>
              </template>
            </draggable>
            <v-autocomplete
              v-model="new_badge"
              :items="all_badges_filter"
              class="sd-modern-underlined-field b-product-badges-manage__select"
              hide-details
              item-title="title"
              item-value="id"
              :label="$t('product_badges.select_a_badge')"
              return-object
              variant="underlined"
              @update:model-value="addBadge"
            >
              <template #prepend-inner><b-product-edit-info-icon name="Plus" :size="18" /></template>
              <template #item="{ item, props }">
                <v-list-item :title="item.raw.title" :subtitle="item.raw.link" v-bind="props" class="text-start">
                  <template #prepend>
                    <v-img :src="getShopImagePath(item.raw.image)" class="me-2 flex-grow-0" height="24" width="24" />
                  </template>
                  <template #append>
                    <v-icon v-if="item.raw.link" :title="item.raw.link" size="small">link</v-icon>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </template>
          <u-smart-draggable
            v-else
            v-model="badges"
            :item-image="findImage"
            :item-label="findTitle"
            :item-menu="[
              {
                title: $t('global.actions.edit'),
                click: (id) => showEdit(id),
                icon: 'edit',
              },
              {
                title: $t('global.actions.delete'),
                click: (id) => {
                  remove(badges, id);
                  saveProductBadges();
                },
                icon: 'close',
              },
            ]"
            border-between
            rounded
            @change="saveProductBadges"
          >
            <template v-slot:append-inner>
              <div
                key="_list"
                class="p-2 pp row-hover usn ignore bg-white rounded-xl my-2"
              >
                <v-autocomplete
                  v-model="new_badge"
                  :items="all_badges_filter"
                  flat
                  hide-details
                  item-title="title"
                  item-value="id"
                  :placeholder="$t('product_badges.select_a_badge')"
                  prepend-inner-icon="add"
                  return-object
                  variant="solo"
                  @update:model-value="addBadge"
                >
                  <template v-slot:item="{ item, props }">
                    <v-list-item
                      :title="item.raw.title"
                      :subtitle="item.raw.link"
                      v-bind="props"
                      class="text-start"
                    >
                      <template v-slot:prepend>
                        <v-img
                          :src="getShopImagePath(item.raw.image)"
                          class="me-2 flex-grow-0"
                          height="24"
                          width="24"
                        >
                        </v-img>
                      </template>
                      <template v-slot:append>
                        <v-icon
                          v-if="item.raw.link"
                          :title="item.raw.link"
                          size="small"
                          >link
                        </v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </div>
            </template>
          </u-smart-draggable>
        </div>
      </v-expand-transition>
      </div>
    </component>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Dialog > Add / Edit ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <v-dialog
      v-model="show_add"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card :class="modern ? 'b-product-badges-manage__dialog sd-modern-canvas text-start' : undefined">
        <v-card-title></v-card-title>

        <v-card-text>
          <div class="widget-box mb-5" :class="{ 'sd-modern-widget': modern }">
            <u-widget-header
              :title="$t('product_badges.add_custom_badge.title')"
            ></u-widget-header>

            <v-list-subheader>
              {{ $t("product_badges.add_custom_badge.subtitle") }}
            </v-list-subheader>

            <v-text-field
              v-model="title_input"
              :class="{ 'sd-modern-underlined-field': modern }"
              :label="$t('global.commons.title')"
              persistent-placeholder
              :placeholder="
                $t('product_badges.add_custom_badge.inputs.title.placeholder')
              "
              variant="underlined"
            ></v-text-field>

            <v-text-field
              v-model="link_input"
              :class="{ 'sd-modern-underlined-field': modern }"
              :label="$t('global.commons.link')"
              append-icon="link"
              persistent-placeholder
              placeholder="https://..."
              variant="underlined"
            ></v-text-field>

            <v-img v-if="modern && selected_badge?.image" :src="getShopImagePath(selected_badge.image)" class="b-product-badges-manage__current-image" width="64" height="64" />
            <v-file-input
              v-model="image_input"
              :class="{ 'sd-modern-underlined-field': modern }"
              accept="image/*"
              color="primary"
              :label="$t('product_badges.add_custom_badge.inputs.image.label')"
              :messages="
                $t('product_badges.add_custom_badge.inputs.image.message')
              "
              :placeholder="
                $t('product_badges.add_custom_badge.inputs.image.placeholder')
              "
              prepend-icon=""
              prepend-inner-icon="image"
              show-size
              variant="underlined"
            />

            <div class="text-end">
              <v-btn
                class="mb-2"
                :class="{ 'sd-modern-button sd-modern-button--inline': modern }"
                color="primary"
                variant="text"
                @click="show_advance = !show_advance"
              >
                {{
                  $t("product_badges.add_custom_badge.show_advanced_options")
                }}
              </v-btn>
            </div>
            <v-expand-transition>
              <div v-if="show_advance">
                <v-text-field
                  v-model="pattern_input"
                  class="mb-3"
                  :class="{ 'sd-modern-underlined-field': modern }"
                  :label="
                    $t('product_badges.add_custom_badge.inputs.pattern.label')
                  "
                  :messages="
                    $t('product_badges.add_custom_badge.inputs.pattern.message')
                  "
                  persistent-placeholder
                  :placeholder="
                    $t(
                      'product_badges.add_custom_badge.inputs.pattern.placeholder',
                    )
                  "
                  variant="underlined"
                ></v-text-field>
              </div>
            </v-expand-transition>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn :size="modern ? 'default' : 'x-large'" :class="{ 'sd-modern-button': modern }" variant="text" @click="show_add = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
            <v-btn
              v-if="selected_badge"
              :class="{
                disabled: !title_input && !image_input,
                'sd-modern-button sd-modern-button--primary': modern,
              }"
              :loading="busy_save"
              color="primary"
              :size="modern ? 'default' : 'x-large'"
              variant="elevated"
              @click="editBadge"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
            <v-btn
              v-else
              :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
              :disabled="!title_input && !image_input"
              :loading="busy_save"
              color="primary"
              :size="modern ? 'default' : 'x-large'"
              variant="elevated"
              @click="addNewBadge"
            >
              <v-icon start>add</v-icon>
              {{ $t("global.actions.add") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import USmartDraggable from "../../../../ui/smart/draggable/USmartDraggable.vue";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import { throttle } from "lodash-es";
import { defineAsyncComponent } from "vue";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductBadgesManage",
  mixins: [],
  components: { BProductEditInfoIcon, USmartSwitch, USmartDraggable, draggable: defineAsyncComponent(() => import('vuedraggable')) },
  props: {
    modern: { type: Boolean, default: false },
    product: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    custom: false,
    badges: null,
    busy_set: false,
    busy_fetch: false,

    show_add: false,
    new_badge: null,
    all_badges: [],

    title_input: null,
    link_input: null,
    image_input: null,
    pattern_input: null,
    busy_save: false,
    show_advance: false,

    selected_badge: null, // Edit badge mode
  }),

  computed: {
    badgeDigest() {
      if (!this.custom) return this.$t('add_product.features_modern.badges_auto_digest');
      if (!this.badges?.length) return this.$t('add_product.features_modern.badges_custom_empty');
      return this.badges.map((id) => this.findTitle(id) || this.$t('add_product.features_modern.badge_unavailable', { id })).join(', ');
    },
    all_badges_filter() {
      return this.all_badges.filter(
        (b) => !this.badges || !this.badges.includes(b.id),
      );
    },

    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {},

  methods: {
    badgeById(id) {
      return this.all_badges.find((badge) => badge.id === id);
    },
    moveBadge(index, direction) {
      const target = index + direction;
      if (target < 0 || target >= this.badges.length) return;
      const [badge] = this.badges.splice(index, 1);
      this.badges.splice(target, 0, badge);
      this.saveProductBadges();
    },
    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Fetch Badges ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

    fetchShopBadges() {
      this.busy_fetch = true;

      axios
        .get(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.GET_MY_VENDOR_CUSTOM_BADGE(
                this.$route.params.vendor_id,
              )
            : window.API.GET_CUSTOM_BADGE(this.product.shop_id),
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.all_badges = data.badges;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Add New badge ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    addNewBadge() {
      this.busy_save = true;

      let formData = new FormData();
      if (this.title_input) formData.append("title", this.title_input);
      if (this.link_input) formData.append("link", this.link_input);

      if (this.image_input) formData.append("image", this.image_input);
      if (this.pattern_input) formData.append("pattern", this.pattern_input);

      axios
        .post(
          window.API.POST_ADD_CUSTOM_BADGE(this.product.shop_id),

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

          this.show_add = false;
          this.title_input = null;
          this.link_input = null;
          this.image_input = null;
          this.pattern_input = null;

          this.AddOrUpdateItemByID(this.all_badges, data.badge);
          NotificationService.showSuccessAlert(
            null,
            this.$t(
              "product_badges.add_custom_badge.notifications.badge_added",
            ),
          );
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },
    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Edit badge ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    editBadge() {
      this.busy_save = true;

      let formData = new FormData();
      if (this.title_input) formData.append("title", this.title_input);
      if (this.link_input) formData.append("link", this.link_input);

      if (this.image_input) formData.append("image", this.image_input);
      if (this.pattern_input) formData.append("pattern", this.pattern_input);

      axios
        .post(
          window.API.POST_EDIT_CUSTOM_BADGE(
            this.product.shop_id,
            this.selected_badge.id,
          ),

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

          this.show_add = false;
          this.title_input = null;
          this.link_input = null;
          this.image_input = null;
          this.pattern_input = null;

          this.AddOrUpdateItemByID(this.all_badges, data.badge);

          NotificationService.showSuccessAlert(
            null,
            this.$t(
              "product_badges.add_custom_badge.notifications.badge_updated",
            ),
          );
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    showAdd() {
      this.selected_badge = null;
      this.title_input = null;
      this.link_input = null;
      this.image_input = null;
      this.pattern_input = null;
      this.show_add = true;
    },
    showEdit(id) {
      const item = this.all_badges.find((b) => b.id === id);
      if (!item) {
        return NotificationService.showErrorAlert(
          null,
          this.$t(
            "product_badges.add_custom_badge.notifications.item_not_found_error",
          ),
        );
      }
      this.selected_badge = item;

      this.title_input = item.title;
      this.link_input = item.link;
      this.image_input = null;
      this.pattern_input = item.pattern;
      this.show_add = true;
    },

    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Set Product Badges ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

    addBadge(new_badge) {
      if (!new_badge) return;
      this.badges.push(new_badge.id);

      this.new_badge = null; // Deselect!
      this.saveProductBadges();
    },

    saveProductBadges() {
      this.saveProductBadgesNow();
    },

    saveProductBadgesNow() {
      this.busy_set = true;

      axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POST_MY_VENDOR_SET_PRODUCT_BADGE(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_SET_PRODUCT_BADGE(
                this.product.shop_id,
                this.product.id,
              ),
          {
            badges: this.badges,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.product.badges = data.badges;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },

    findImage(id) {
      const f = this.all_badges.find((b) => b.id === id);
      return f && f.image ? this.getShopImagePath(f.image) : null;
    },
    findTitle(id) {
      const f = this.all_badges.find((b) => b.id === id);
      return f ? f.title : null;
    },
  },
  created() {
    this.saveProductBadges = throttle(this.saveProductBadges, 3000);
    this.badges = this.product.badges;
    if (this.badges && !Array.isArray(this.badges)) this.badges = []; // Fix not array bugs!

    if (this.badges) this.custom = true;

    this.fetchShopBadges();
  },
  beforeUnmount() {
    this.saveProductBadges.flush();
    this.saveProductBadges.cancel();
  },
};
</script>

<style lang="scss" scoped>
.b-product-badges-manage--modern {
  .b-product-badges-manage__catalog-action { margin-block: 16px 24px; }
  .b-product-badges-manage__catalog-action p { margin-top: 5px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-product-badges-manage__list-title { margin-block: 0 14px; font-size: 13px; font-weight: 500; line-height: 20px; }
  .b-product-badges-manage__list { padding: 0; margin: 0; list-style: none; }
  .b-product-badges-manage__row { display: flex; align-items: center; gap: 10px; padding: 12px; border-block-end: 1px solid var(--sd-modern-border); }
  .b-product-badges-manage__drag { display: inline-flex; color: var(--sd-modern-muted); cursor: grab; flex-shrink: 0; }
  .b-product-badges-manage__image { flex: 0 0 32px; }
  .b-product-badges-manage__identity { min-width: 0; flex: 1; overflow-wrap: anywhere; }
  .b-product-badges-manage__identity strong { display: block; font-size: 13px; font-weight: 500; line-height: 20px; }
  .b-product-badges-manage__identity span { display: block; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-product-badges-manage__row-actions { --sd-modern-icon-button-size: 32px; display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .sd-modern-smart-select :deep(.mnh > .flex-grow-1) { overflow-wrap: anywhere; }
  .b-product-badges-manage__select { margin-top: 18px; }
  @media (max-width: 660px) {
    :deep(.sd-modern-smart-select--columns > .rounded-card) { grid-template-columns: minmax(0, 1fr); }
  }
  @media (max-width: 600px) {
    .b-product-badges-manage__row { flex-wrap: wrap; }
    .b-product-badges-manage__row-actions { box-sizing: border-box; width: 100%; padding-inline-start: 26px; flex-wrap: wrap; }
  }
}
.b-product-badges-manage__dialog {
  > .v-card-text { padding-block: 24px; }
  .widget-box { box-sizing: border-box; width: 100%; max-width: 760px; margin-inline: auto; }
  :deep(.sd-modern-underlined-field .v-field__input) { box-sizing: border-box; }
  .b-product-badges-manage__current-image { margin-block: 16px 8px; }
  .widget-buttons { box-sizing: border-box; display: flex; gap: 8px; width: 100%; max-width: 760px; margin-inline: auto; justify-content: flex-end; flex-wrap: wrap; }
}
</style>
