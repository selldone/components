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
  <!-- ███████████████████████ Dialog > Add / Edit ███████████████████████ -->
  <v-dialog
    v-model="dialog"
    :aria-label="$t(draft.id ? 'map_channel.edit_location' : 'map_channel.add_location')"
    :fullscreen="$vuetify.display.xs"
    width="760"
    :max-width="$vuetify.display.xs ? '100%' : 'calc(100vw - 32px)'"
    scrollable
    :persistent="busy_save || busy_delete"
    :transition="false"
  >
    <v-card
      class="sd-modern-widget b-map-tag-add text-start"
      :theme="USER()?.preferences?.dark ? 'dark' : 'light'"
    >
      <header class="b-map-tag-add__header">
        <div>
          <span class="sd-modern-eyebrow">{{
            $t("map_channel.location")
          }}</span>
          <h2>
            {{
              $t(
                draft.id
                  ? "map_channel.edit_location"
                  : "map_channel.add_location",
              )
            }}
          </h2>
        </div>
        <v-tooltip location="top" content-class="sd-modern-tooltip text-start"
          ><template #activator="{ props }"
            ><v-btn
              v-bind="props"
              class="sd-modern-icon-button"
              variant="text"
              icon="close"
              :aria-label="$t('global.actions.close')"
              :disabled="busy_save || busy_delete"
              @click="dialog = false" /></template
          >{{ $t("global.actions.close") }}</v-tooltip
        >
      </header>
      <v-card-text class="b-map-tag-add__body">
        <p class="sd-modern-subtitle">
          {{ $t("map_channel.editor_subtitle") }}
        </p>
        <v-form
          ref="form"
          class="b-map-tag-add__form sd-modern-underlined-field"
          @submit.prevent="saveTag"
        >
          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Tagging ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
          <v-text-field
            v-model="draft.title"
            :rules="[GlobalRules.required()]"
            :label="$t('map_channel.title_label')"
            :messages="$t('map_channel.title_help')"
            variant="underlined"
            :disabled="!can_write || busy_save || busy_delete"
            required
          />
          <u-smart-suggestion
            :samples="$tm('suggestions.map_tag.title')"
            class="b-map-tag-add__suggestions"
            @select="selectTitle"
          />
          <v-combobox
            v-model="draft.tags"
            chips
            closable-chips
            :label="$t('map_channel.tags')"
            :messages="$t('map_channel.tags_help')"
            multiple
            variant="underlined"
            :disabled="!can_write || busy_save || busy_delete"
          />
          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Location ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
          <section class="b-map-tag-add__location">
            <div class="b-map-tag-add__section-heading">
              <h3>{{ $t("map_channel.location") }}</h3>
              <v-btn
                class="sd-modern-button sd-modern-button--text"
                variant="text"
                color="primary"
                prepend-icon="location_searching"
                :disabled="!can_write || busy_save || busy_delete"
                @click="showSelectLocation"
                >{{
                  $t(
                    draft.location
                      ? "map_channel.change_location"
                      : "map_channel.choose_location",
                  )
                }}</v-btn
              >
            </div>
            <p class="sd-modern-subtitle">
              {{ $t("map_channel.location_help") }}
            </p>
            <button
              type="button"
              class="b-map-tag-add__map"
              :disabled="!can_write || busy_save || busy_delete"
              :aria-label="
                $t(
                  draft.location
                    ? 'map_channel.change_location'
                    : 'map_channel.choose_location',
                )
              "
              @click="showSelectLocation"
            >
              <v-img
                :src="
                  map_url || require('../../../../assets/guides/map-street.png')
                "
                :class="{ 'img-grayscale': !map_url }"
                height="190"
                cover
                ><u-map-view-pin v-if="draft.location" class="map-pointer"
              /></v-img>
            </button>
            <div v-if="draft.location" class="b-map-tag-add__location-copy">
              <strong>{{
                [draft.city, draft.state, draft.country]
                  .filter(Boolean)
                  .join(" · ") || $t("map_channel.selected_location")
              }}</strong
              ><span v-if="draft.address">{{ draft.address }}</span
              ><span class="b-map-tag-add__coordinates" dir="ltr"
                >{{ draft.location.lat }}, {{ draft.location.lng }}</span
              >
            </div>
          </section>
          <details
            v-if="draft.id"
            class="b-map-tag-add__products"
            :open="show_products"
            @toggle="show_products = $event.target.open"
          >
            <summary>
              <v-icon size="18" aria-hidden="true">inventory_2</v-icon
              ><span>{{ $t("map_channel.assigned_products") }}</span
              ><small>{{ draft.products_count || 0 }}</small
              ><v-icon
                size="18"
                class="b-map-tag-add__chevron"
                aria-hidden="true"
                >expand_more</v-icon
              >
            </summary>
            <div class="b-map-tag-add__products-body">
              <p class="sd-modern-subtitle">
                {{ $t("map_channel.products_assignment_help") }}
              </p>
              <b-map-tag-products
                v-if="show_products"
                :map-tag="draft"
                :shop="shop"
              />
            </div>
          </details>
          <div
            v-if="draft.id && is_marketplace"
            class="sd-modern-notice b-map-tag-add__vendor-help"
          >
            <v-icon size="18" aria-hidden="true">storefront</v-icon>
            <div class="sd-modern-notice__content">
              <strong>{{
                $t("map_channel.assigned_vendors", {
                  count: draft.vendors_count || 0,
                })
              }}</strong>
              <p>{{ $t("map_channel.vendors_assignment_help") }}</p>
            </div>
          </div>
          <footer class="b-map-tag-add__actions">
            <span>{{ $t("map_channel.location_save_scope") }}</span>
            <div>
              <v-btn
                class="sd-modern-button"
                variant="text"
                :disabled="busy_save || busy_delete"
                @click="dialog = false"
                >{{ $t("global.actions.cancel") }}</v-btn
              ><v-btn
                class="sd-modern-button sd-modern-button--primary"
                color="primary"
                variant="elevated"
                :prepend-icon="draft.id ? 'save' : 'add'"
                :disabled="!can_write || !valid_draft || busy_delete"
                :loading="busy_save"
                type="submit"
                >{{
                  $t(
                    draft.id
                      ? "map_channel.save_location"
                      : "map_channel.add_location",
                  )
                }}</v-btn
              >
            </div>
          </footer>
        </v-form>
        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Critical Zone ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
        <details
          v-if="draft.id && can_write"
          class="sd-modern-widget sd-modern-disclosure sd-modern-critical b-map-tag-add__danger"
          :open="delete_open"
          @toggle="onDeleteToggle"
        >
          <summary class="sd-modern-disclosure__summary">
            <v-icon color="error" size="18" aria-hidden="true"
              >warning_amber</v-icon
            ><span class="sd-modern-disclosure__copy">{{
              $t("map_channel.remove_location")
            }}</span
            ><v-icon
              class="sd-modern-disclosure__chevron"
              size="18"
              aria-hidden="true"
              >expand_more</v-icon
            >
          </summary>
          <div class="sd-modern-disclosure__content">
            <p>{{ $t("map_channel.remove_location_help") }}</p>
            <u-smart-verify
              v-model="accept_delete"
              class="my-4"
              role="checkbox"
              :tabindex="busy_save || busy_delete ? -1 : 0"
              :aria-checked="accept_delete"
              :aria-disabled="busy_save || busy_delete"
              :aria-label="$t('map_channel.verify_removal')"
              @keydown.space.prevent="toggleVerification"
              @keydown.enter.prevent="toggleVerification"
              :disabled="busy_save || busy_delete"
              :true-title="$t('map_channel.verify_removal')"
              :true-description="
                $t('map_channel.verify_removal_help', {
                  count: draft.products_count || 0,
                })
              "
            /><v-btn
              class="sd-modern-button sd-modern-button--danger"
              color="error"
              variant="elevated"
              prepend-icon="delete"
              :disabled="!accept_delete || busy_save"
              :loading="busy_delete"
              @click="confirmRemove"
              >{{ $t("map_channel.remove_location") }}</v-btn
            >
          </div>
        </details>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import UMapViewPin from "../../../../ui/map/view/market/UMapViewPin.vue";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import BMapTagProducts from "../../../map/tag/products/BMapTagProducts.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";
import MapMixin from "@selldone/components-vue/mixin/map/MapMixin.ts";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
export default {
  name: "BMapTagAdd",
  mixins: [MapMixin],
  components: { USmartSuggestion, BMapTagProducts, USmartVerify, UMapViewPin },
  emits: ["update:modelValue", "add", "edit", "delete"],
  props: {
    shop: { required: true, type: Object },
    modelValue: {},
    currentItem: {},
  },
  data: () => ({
    dialog: false,
    draft: {},
    busy_save: false,
    accept_delete: false,
    busy_delete: false,
    delete_open: false,
    show_products: false,
    edit_revision: 0,
  }),
  computed: {
    can_write() {
      return this.writeShopAccess(ShopPermissionRegions.CHANNELS.code);
    },
    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },
    valid_draft() {
      return (
        !!this.draft.location &&
        typeof this.draft.title === "string" &&
        !!this.draft.title.trim()
      );
    },
    map_url() {
      const location = this.draft.location;
      return location &&
        location.lng !== null &&
        location.lng !== undefined &&
        location.lat !== null &&
        location.lat !== undefined
        ? MapHelper.GetMapImage(location.lng, location.lat, 15)
        : null;
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(value) {
        this.dialog = !!value;
      },
    },
    dialog(value) {
      if (value) this.loadDraft();
      else {
        this.edit_revision++;
        this.resetVerification();
        this.closeMap();
      }
      this.$emit("update:modelValue", value);
    },
    currentItem() {
      if (this.dialog) this.loadDraft();
    },
    "shop.id"() {
      this.dialog = false;
      this.edit_revision++;
      this.resetVerification();
    },
    can_write(value) {
      if (!value) {
        this.resetVerification();
        this.closeMap();
      }
    },
  },
  created() {
    if (this.dialog) this.loadDraft();
  },
  beforeUnmount() {
    this.edit_revision++;
    this.closeMap();
  },
  methods: {
    loadDraft() {
      // Keep Cancel local while preserving the map picker's complete receiver/address payload.
      this.draft = JSON.parse(JSON.stringify(this.currentItem || {}));
      this.edit_revision++;
      this.show_products = false;
      this.busy_save = false;
      this.busy_delete = false;
      this.resetVerification();
    },
    resetVerification() {
      this.accept_delete = false;
      this.delete_open = false;
    },
    toggleVerification() {
      if (
        this.dialog &&
        this.can_write &&
        this.delete_open &&
        !this.busy_save &&
        !this.busy_delete
      )
        this.accept_delete = !this.accept_delete;
    },
    onDeleteToggle(event) {
      this.delete_open = event.target.open;
      if (!this.delete_open) this.accept_delete = false;
    },
    selectTitle(value) {
      if (this.can_write && !this.busy_save && !this.busy_delete)
        this.draft.title = value;
    },
    requestIsCurrent(revision, shopId, itemId) {
      return (
        this.dialog &&
        this.edit_revision === revision &&
        String(this.shop.id) === String(shopId) &&
        String(this.draft.id || "") === String(itemId || "")
      );
    },
    async saveTag() {
      if (
        !this.dialog ||
        !this.can_write ||
        !this.valid_draft ||
        this.busy_save ||
        this.busy_delete
      )
        return;
      const revision = this.edit_revision,
        shopId = this.shop.id,
        itemId = this.draft.id,
        payload = JSON.parse(JSON.stringify(this.draft));
      this.busy_save = true;
      try {
        const { data } = itemId
          ? await axios.put(
              window.API.PUT_EDIT_SHOP_MAP_TAG(shopId, itemId),
              payload,
            )
          : await axios.post(
              window.API.POST_CREATE_SHOP_MAP_TAG(shopId),
              payload,
            );
        if (!this.requestIsCurrent(revision, shopId, itemId)) return;
        if (data.error) {
          NotificationService.showErrorAlert(null, data.error_msg);
          return;
        }
        if (!data.map_tag?.id) throw new Error("Invalid map location response");
        this.$emit(itemId ? "edit" : "add", data.map_tag);
        NotificationService.showSuccessAlert(
          null,
          this.$t(
            itemId
              ? "map_channel.location_updated"
              : "map_channel.location_created",
          ),
        );
        this.dialog = false;
      } catch (error) {
        if (this.requestIsCurrent(revision, shopId, itemId))
          NotificationService.showLaravelError(error);
      } finally {
        if (this.edit_revision === revision) this.busy_save = false;
      }
    },
    showSelectLocation() {
      if (!this.dialog || !this.can_write || this.busy_save || this.busy_delete)
        return;
      const revision = this.edit_revision,
        shopId = this.shop.id,
        itemId = this.draft.id;
      this.showMap(
        this.draft.location || { lat: 0, lng: 0 },
        null,
        this.draft,
        (info) => {
          if (
            !this.requestIsCurrent(revision, shopId, itemId) ||
            !this.can_write
          )
            return;
          Object.assign(this.draft, info);
          this.closeMap();
        },
        false,
      );
    },
    confirmRemove() {
      if (
        !this.dialog ||
        !this.can_write ||
        !this.draft.id ||
        !this.delete_open ||
        !this.accept_delete ||
        this.busy_save ||
        this.busy_delete
      )
        return;
      const revision = this.edit_revision,
        shopId = this.shop.id,
        itemId = this.draft.id;
      NotificationService.openDangerAlert(
        this.$t("map_channel.remove_location"),
        this.$t("map_channel.confirm_remove_location"),
        this.$t("map_channel.remove_location"),
        () => {
          if (this.requestIsCurrent(revision, shopId, itemId))
            return this.removeLocation();
        },
      );
    },
    // -------------------------- Remove Location --------------------------
    async removeLocation() {
      if (
        !this.dialog ||
        !this.can_write ||
        !this.draft.id ||
        !this.delete_open ||
        !this.accept_delete ||
        this.busy_save ||
        this.busy_delete
      )
        return;
      const revision = this.edit_revision,
        shopId = this.shop.id,
        itemId = this.draft.id;
      this.busy_delete = true;
      try {
        const { data } = await axios.delete(
          window.API.DELETE_SHOP_MAP_TAG(shopId, itemId),
        );
        if (!this.requestIsCurrent(revision, shopId, itemId)) return;
        if (data.error) {
          NotificationService.showErrorAlert(null, data.error_msg);
          return;
        }
        if (String(data.id) !== String(itemId))
          throw new Error("Invalid removed-location response");
        this.$emit("delete", data.id);
        NotificationService.showSuccessAlert(
          null,
          this.$t("map_channel.location_removed"),
        );
        this.dialog = false;
      } catch (error) {
        if (this.requestIsCurrent(revision, shopId, itemId))
          NotificationService.showLaravelError(error);
      } finally {
        if (this.edit_revision === revision) this.busy_delete = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.b-map-tag-add.sd-modern-widget {
  padding: 0;
  border-radius: 16px;
  font-size: 14px;
  line-height: 22px;
}
.b-map-tag-add {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
    padding: 22px 24px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__header h2 {
    margin: 3px 0 0;
    font-size: 18px;
    line-height: 26px;
    font-weight: 500;
  }
  &__body {
    padding: 24px;
  }
  &__form {
    margin-top: 22px;
  }
  &__suggestions {
    margin: 3px 0 20px;
  }
  &__location {
    margin-block: 24px;
  }
  &__section-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  &__section-heading h3 {
    font-size: 14px;
    line-height: 22px;
    font-weight: 500;
  }
  &__map {
    display: block;
    width: 100%;
    margin-top: 14px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    overflow: hidden;
    background: var(--sd-modern-inset);
    position: relative;
  }
  &__map:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  &__map:disabled {
    cursor: default;
  }
  &__location-copy {
    display: grid;
    gap: 4px;
    margin-top: 12px;
    font-size: 13px;
    line-height: 21px;
    overflow-wrap: anywhere;
  }
  &__location-copy strong {
    font-weight: 500;
  }
  &__location-copy > span {
    color: var(--sd-modern-muted);
  }
  &__coordinates {
    justify-self: start;
    font-variant-numeric: tabular-nums;
  }
  &__products {
    padding-block: 16px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__products summary {
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 36px;
    list-style: none;
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;
  }
  &__products summary::-webkit-details-marker {
    display: none;
  }
  &__products summary small {
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
  }
  &__chevron {
    margin-inline-start: auto;
  }
  &__products[open] &__chevron {
    transform: rotate(180deg);
  }
  &__products-body {
    padding-top: 12px;
  }
  &__vendor-help {
    margin-block: 14px 0;
  }
  &__vendor-help strong {
    font-weight: 500;
  }
  &__vendor-help p {
    margin-top: 4px;
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 24px;
    padding-top: 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__actions > span {
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
  }
  &__actions > div {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-inline-start: auto;
  }
  &__danger {
    margin-top: 24px;
    box-shadow: none;
  }
  &__danger .sd-modern-disclosure__summary,
  &__danger .sd-modern-disclosure__content {
    padding: 16px;
  }
}
@media (max-width: 600px) {
  .b-map-tag-add.sd-modern-widget {
    border-radius: 0;
  }
  .b-map-tag-add__header,
  .b-map-tag-add__body {
    padding: 20px 16px;
  }
  .b-map-tag-add__map :deep(.v-img) {
    height: 170px !important;
  }
}
</style>
