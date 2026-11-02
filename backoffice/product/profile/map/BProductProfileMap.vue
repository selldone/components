<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <v-list-item
    :class="modern ? 'b-product-profile-map--modern sd-modern-clickable-item text-start' : 'row-hover'"
    :prepend-icon="modern ? undefined : 'map'"
    v-bind="$attrs"
    @click="showSetMapTag()"
    slim
  >
    <template v-if="modern" #prepend>
      <b-product-edit-info-icon class="me-3" name="MapPin" />
    </template>
    <v-list-item-title class="d-flex align-center">
      <b>{{ $t("product_location_profile.title") }}</b>

      <template v-if="product.map && product.map_id">
        <span>
          <v-icon class="mx-1" color="#111">{{
            $t("icons.chevron_next")
          }}</v-icon>

          <b>
            <flag
              v-if="product.map.country"
              :iso="product.map.country"
              :squared="false"
              class="me-1"
            />
            {{ product.map.title }}</b
          >
        </span>

        <v-spacer></v-spacer>
        <v-avatar
          v-if="product.map.user_id"
          :title="`Last editor / ${getFromNowString(product.map.updated_at)}`"
          class="mx-1 avatar-gradient -thin -staff"
          size="24"
        >
          <img :src="getUserAvatar(product.map.user_id)" />
        </v-avatar>
        <small class="ms-2" title="Range">
          <v-icon v-if="!product.map.range" size="small">all_inclusive</v-icon>
          <span v-else>{{ product.map.range }} km</span>
        </small>
      </template>
    </v-list-item-title>

    <v-list-item-subtitle>
      {{
        product.map
          ? product.map.address
          : $t(modern ? 'add_product.edit_info.modern.not_assigned' : "product_location_profile.empty_subtitle")
      }}
    </v-list-item-subtitle>

    <template v-slot:append>
      <v-list-item-action end>
        <v-btn
          v-if="modern"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
          @click.stop="showSetMapTag()"
        >{{ $t(product.map_id ? 'global.actions.change' : 'add_product.edit_info.modern.assign') }}</v-btn>
        <v-btn
          v-else
          :color="product.map_id ? 'success' : 'primary'"
          icon
          variant="text"
        >
          <v-icon>{{ product.map_id ? "check_box" : "add_box" }}</v-icon>
        </v-btn>
      </v-list-item-action>
    </template>
  </v-list-item>

  <!-- ██████████████████████ Dialog > Select Map Tag ██████████████████████ -->

  <v-dialog
    v-model="map_dialog"
    :fullscreen="!modern || $vuetify.display.xs"
    :max-width="modern ? 820 : undefined"
    scrollable
    :transition="modern ? 'dialog-transition' : 'dialog-bottom-transition'"
  >
    <v-card class="text-start" :class="{ 'sd-modern-widget b-product-profile-map__dialog': modern }">
      <template v-if="modern">
        <header class="b-product-profile-map__header">
          <v-icon class="b-product-profile-map__heading-icon" aria-hidden="true">map</v-icon>
          <div class="b-product-profile-map__heading">
            <h1>{{ $t('product_location_profile.dialog.header') }}</h1>
            <p>{{ t('subtitle') }}</p>
          </div>
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="map_dialog = false">
            <v-icon aria-hidden="true">close</v-icon>
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">{{ $t('global.actions.close') }}</v-tooltip>
          </v-btn>
        </header>
        <v-card-text class="b-product-profile-map__workspace sd-modern-canvas">
          <section class="sd-modern-widget b-product-profile-map__selection">
            <div class="b-product-profile-map__selection-heading">
              <div><h2>{{ t('selection_title') }}</h2><p>{{ t('selection_help') }}</p></div>
              <v-btn class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" :to="{ name: 'BPageShopChannelMap' }" prepend-icon="add">{{ t('add') }}</v-btn>
            </div>
            <v-locale-provider :rtl="false">
              <!-- Keep the native selector's overlay workaround and the field's actual direction. -->
              <b-map-tag-input
                v-if="map_dialog"
                :key="shop.id"
                v-model="map_input"
                :shop="shop"
                :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'"
                return-object
                class="b-product-profile-map__input sd-modern-underlined-field"
              />
            </v-locale-provider>
          </section>
          <section v-if="map_input" class="sd-modern-widget b-product-profile-map__preview">
            <div class="b-product-profile-map__preview-heading">
              <h2>{{ t('preview') }}</h2>
              <span class="b-product-profile-map__range"><v-icon size="16" aria-hidden="true">{{ map_input.range ? 'radar' : 'all_inclusive' }}</v-icon><span>{{ map_input.range ? t('range', { range: map_input.range }) : t('unlimited') }}</span></span>
            </div>
            <div class="b-product-profile-map__details" :class="{ 'b-product-profile-map__details--no-map': !map_url }">
              <figure v-if="map_url" class="b-product-profile-map__map">
                <v-img :src="map_url" aspect-ratio="1" class="map-view-box rounded-lg" :alt="t('map_alt', { title: map_input.title })">
                  <u-map-view-pin class="map-pointer" />
                </v-img>
              </figure>
              <div class="b-product-profile-map__information">
                <h3><flag v-if="map_input.country" :iso="map_input.country" :squared="false" />{{ map_input.title }}</h3>
                <dl>
                  <div v-if="full_address"><dt><v-icon size="14" aria-hidden="true">place</v-icon>{{ $t('global.commons.address') }}</dt><dd>{{ full_address }}</dd></div>
                  <div v-if="map_input.message"><dt><v-icon size="14" aria-hidden="true">chat_bubble_outline</v-icon>{{ $t('global.commons.message') }}</dt><dd>{{ map_input.message }}</dd></div>
                </dl>
                <details v-if="map_input.created_at || map_input.updated_at" class="b-product-profile-map__history">
                  <summary><v-icon size="16" aria-hidden="true">history</v-icon><span>{{ t('history') }}</span><v-icon class="b-product-profile-map__history-chevron" size="16" aria-hidden="true">expand_more</v-icon></summary>
                  <dl>
                    <div v-if="map_input.created_at"><dt>{{ $t('global.commons.created_at') }}</dt><dd>{{ getLocalTimeString(map_input.created_at) }}</dd></div>
                    <div v-if="map_input.updated_at"><dt>{{ t('updated') }}</dt><dd>{{ getLocalTimeString(map_input.updated_at) }}</dd></div>
                  </dl>
                </details>
              </div>
            </div>
          </section>
          <section v-else class="sd-modern-widget b-product-profile-map__empty">
            <v-icon size="30" aria-hidden="true">wrong_location</v-icon>
            <h2>{{ t('empty_title') }}</h2><p>{{ t('empty_help') }}</p>
          </section>
          <div class="sd-modern-notice b-product-profile-map__notice">
            <v-icon aria-hidden="true">info_outline</v-icon><p class="sd-modern-notice__content">{{ t('guidance') }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="b-product-profile-map__footer">
          <p><v-icon size="14" aria-hidden="true">save</v-icon><span>{{ t('save_help') }}</span></p>
          <div class="b-product-profile-map__footer-actions">
            <v-btn class="sd-modern-button" variant="text" @click="map_dialog = false">{{ $t('global.actions.cancel') }}</v-btn>
            <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" prepend-icon="check" @click="selectMap(map_input)">{{ t('confirm') }}</v-btn>
          </div>
        </v-card-actions>
      </template>
      <template v-else>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1">map</v-icon>

        {{ $t("product_location_profile.dialog.header") }}
      </v-card-title>
      <v-card-text>
        <div class="widget-box -large mb-5">
          <u-widget-header
            :add-caption="
              $t('product_location_profile.dialog.action_new_location')
            "
            :title="$t('product_location_profile.dialog.title')"
            :to="{ name: 'BPageShopChannelMap' }"
            add-text
            icon="place"
          >
          </u-widget-header>
          <v-list-subheader>
            {{ $t("product_location_profile.dialog.subtitle") }}
          </v-list-subheader>

          <v-locale-provider :rtl="false">
            <b-map-tag-input
              v-model="map_input"
              :shop="shop"
              return-object
            ></b-map-tag-input>
          </v-locale-provider>

          <v-expand-transition>
            <div v-if="map_input">
              <v-row align="center">
                <v-col cols="12" sm="6">
                  <v-img
                    v-if="map_url"
                    :src="map_url"
                    aspect-ratio="1"
                    class="map-view-box -jumping rounded-18px mx-auto my-5"
                    height="auto"
                    max-width="300"
                    min-height="200"
                    width="100%"
                  >
                    <u-map-view-pin class="map-pointer"></u-map-view-pin>
                  </v-img>
                </v-col>

                <v-col v-if="map_input" cols="12" sm="6">
                  <div v-if="full_address" class="mb-3 typo-body">
                    <v-icon class="me-1">assistant_direction</v-icon>
                    {{ $t("global.commons.address") }}
                    :
                    <flag
                      v-if="map_input.country"
                      :iso="map_input.country"
                      :squared="false"
                      class="mx-1"
                    />
                    {{ full_address }}
                  </div>

                  <div v-if="map_input.message" class="mb-3">
                    <v-icon class="me-1">chat_bubble</v-icon>
                    {{ $t("global.commons.message") }}:
                    {{ map_input.message }}
                  </div>

                  <div
                    :title="getFromNowString(map_input.created_at)"
                    class="my-1"
                  >
                    <v-icon class="me-1">calendar_today</v-icon>
                    {{ $t("global.commons.created_at") }}:
                    {{ getLocalTimeString(map_input.created_at) }}
                  </div>
                  <div
                    :title="getFromNowString(map_input.updated_at)"
                    class="my-1"
                  >
                    <v-icon class="me-1">edit_calendar</v-icon>
                    Last update:
                    {{ getLocalTimeString(map_input.updated_at) }}
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>

          <div class="my-3">
            <v-icon class="me-1">notification_important</v-icon>
            <span v-html="$t('product_location_profile.dialog.tips')"></span>
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="map_dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            color="primary"
            size="x-large"
            variant="elevated"
            @click="selectMap(map_input)"
          >
            <v-icon start>check</v-icon>
            {{ $t("global.actions.confirm") }}
          </v-btn>
        </div>
      </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UMapViewPin from "../../../../ui/map/view/market/UMapViewPin.vue";
import BMapTagInput from "../../../map/tag/input/BMapTagInput.vue";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

export default defineComponent({
  name: "BProductProfileMap",
  mixins: [DateMixin],
  components: { BProductEditInfoIcon, BMapTagInput, UMapViewPin },

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
      map_dialog: false,
      map_input: null,
    };
  },

  computed: {
    map_url() {
      return (
        this.map_input &&
        this.map_input.location &&
        this.map_input.location.lng &&
        MapHelper.GetMapImage(
          this.map_input.location.lng,
          this.map_input.location.lat,
          15,
        )
      );
    },
    full_address() {
      return (
        this.map_input &&
        MapHelper.GenerateFullAddressFromMapInfo(this.map_input)
      );
    },
  },

  methods: {
    t(key, values = {}) {
      return this.$t(`product_location_profile.refined.${key}`, values);
    },
    // ████████████████████ Set Map ████████████████████

    showSetMapTag() {
      this.map_input = this.product.map; // Return object!
      this.map_dialog = true;
    },
    selectMap(map_input) {
      this.product.map_id = map_input ? map_input.id : null;
      this.product.map = map_input; // Assign nested object
      this.map_dialog = false;
    },
  },
});
</script>

<style lang="scss" scoped>
.b-product-profile-map__dialog {
  padding: 0;
  border-radius: 20px;
  overflow: hidden;
  max-height: calc(100dvh - 48px);

  h1, h2, h3, p, figure, dl, dd { margin: 0; font-family: inherit; }
  h2 { font-size: 14px; font-weight: 500; line-height: 22px; }
  p { font-size: 13px; line-height: 21px; color: var(--sd-modern-muted); }
  .sd-modern-button { font-size: 13px; line-height: 20px; }
  .b-product-profile-map__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 24px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--sd-modern-border);
  }
  .b-product-profile-map__heading-icon { flex-shrink: 0; margin-block-start: 3px; font-size: 22px; color: var(--sd-modern-muted); }
  .b-product-profile-map__heading { flex: 1; min-width: 0; }
  h1 { font-size: 20px; font-weight: 500; line-height: 28px; letter-spacing: 0; }
  .b-product-profile-map__heading p { margin-block-start: 4px; }
  .b-product-profile-map__workspace { display: flex; flex-direction: column; gap: 16px; padding: 20px; min-width: 0; }
  .b-product-profile-map__selection, .b-product-profile-map__preview, .b-product-profile-map__empty { flex-shrink: 0; padding: 20px; border-radius: 14px; }
  .b-product-profile-map__selection-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .b-product-profile-map__selection-heading p { margin-block-start: 4px; }
  .b-product-profile-map__input { margin-block-start: 20px; }
  .b-product-profile-map__input :deep(.v-field__input), .b-product-profile-map__input :deep(.v-autocomplete__selection) { font-size: 14px; line-height: 22px; font-weight: 400; }
  .b-product-profile-map__preview-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-block-end: 16px; }
  .b-product-profile-map__range { display: inline-flex; align-items: center; gap: 6px; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  .b-product-profile-map__details { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 24px; align-items: start; }
  .b-product-profile-map__details--no-map { grid-template-columns: minmax(0, 1fr); }
  .b-product-profile-map__map, .b-product-profile-map__information { min-width: 0; }
  .b-product-profile-map__information h3 { display: flex; align-items: center; gap: 8px; margin-block-end: 16px; font-size: 16px; font-weight: 500; line-height: 24px; overflow-wrap: anywhere; }
  dl { display: grid; gap: 16px; }
  dt { display: flex; align-items: center; gap: 6px; margin-block-end: 4px; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  dd { font-size: 13px; line-height: 21px; overflow-wrap: anywhere; unicode-bidi: plaintext; }
  .b-product-profile-map__history { margin-block-start: 20px; }
  .b-product-profile-map__history summary { display: flex; align-items: center; gap: 6px; min-height: 32px; list-style: none; cursor: pointer; color: var(--sd-modern-muted); font-size: 12px; line-height: 20px; }
  .b-product-profile-map__history summary::-webkit-details-marker { display: none; }
  .b-product-profile-map__history summary:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; border-radius: 4px; }
  .b-product-profile-map__history-chevron { margin-inline-start: auto; }
  .b-product-profile-map__history[open] .b-product-profile-map__history-chevron { transform: rotate(180deg); }
  .b-product-profile-map__history dl { padding-block-start: 10px; gap: 10px; }
  .b-product-profile-map__empty { display: flex; align-items: center; flex-direction: column; gap: 8px; padding-block: 38px; text-align: center; }
  .b-product-profile-map__empty > .v-icon { margin-block-end: 4px; color: var(--sd-modern-muted); }
  .b-product-profile-map__notice { padding: 0 4px; background: transparent; }
  .b-product-profile-map__footer { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; gap: 16px; padding: 16px 24px; border-top: 1px solid var(--sd-modern-border); }
  .b-product-profile-map__footer > p { display: flex; align-items: flex-start; gap: 7px; font-size: 12px; line-height: 18px; }
  .b-product-profile-map__footer > p .v-icon { flex-shrink: 0; margin-block-start: 2px; }
  .b-product-profile-map__footer-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  @media (max-width: 600px) {
    max-height: 100dvh;
    border-radius: 0;
    .b-product-profile-map__header { padding: 20px 16px; }
    .b-product-profile-map__workspace { padding: 16px; }
    .b-product-profile-map__selection, .b-product-profile-map__preview, .b-product-profile-map__empty { padding: 16px; }
    .b-product-profile-map__selection-heading { flex-wrap: wrap; gap: 6px; }
    .b-product-profile-map__input { margin-block-start: 16px; }
    .b-product-profile-map__input :deep(.v-field__input), .b-product-profile-map__input :deep(.v-autocomplete__selection) { font-size: 16px; }
    .b-product-profile-map__details { grid-template-columns: minmax(0, 1fr); gap: 20px; }
    .b-product-profile-map__map { width: 100%; max-width: 300px; margin-inline: auto; }
    .b-product-profile-map__footer { flex-direction: column; align-items: stretch; gap: 12px; padding: 16px; }
    .b-product-profile-map__footer-actions { justify-content: flex-end; flex-wrap: wrap; }
    .b-product-profile-map__history summary { min-height: 44px; }
  }
}

.b-product-profile-map--modern {
  min-height: 62px;
  padding: 10px 12px;
  border-radius: 9px;
  :deep(.v-list-item-title), :deep(.v-list-item-title b) { font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; letter-spacing: 0; white-space: normal; flex-wrap: wrap; }
  :deep(.v-list-item-title .v-icon) { font-size: 14px; color: var(--sd-modern-muted) !important; }
  :deep(.v-list-item-subtitle) { margin-top: 2px; color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; line-height: 19px; opacity: 1; white-space: normal; overflow-wrap: anywhere; }
  :deep(.v-list-item__append) { padding-inline-start: 12px; }
  .b-product-edit-info-icon { color: var(--sd-modern-muted); }
}
</style>
