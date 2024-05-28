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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="position-relative">
    <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ In App Help (Help Center) ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->
    <inline-help
      :code="HelpCenterCode.SHOP_EDIT_INFO"
      class="absolute-top-center"
    ></inline-help>
    <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->

    <u-progress-stepper
      v-if="showStepper"
      :gradient="`linear-gradient(to ${
        $vuetify.locale.isRtl ? 'right' : 'left'
      }, #00796B 0%, #00796B 10%,  #009688 50%,#AFB42B 75%,#CDDC39 90%,#CDDC39 100%)`"
      :icon="calculateProgressIcon(step)"
      :model-value="calculateProgressPercent"
      :next="step < 4"
      :previous="step > 0"
      :tween-duration="1000"
      color="#CDDC39"
      color-value="#00796B"
      title=""
      @next="goNext"
      @previous="goPrevious"
    />
    <transition name="fadeUp">
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Tabs ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <u-tabs-rounded
        v-model="step"
        :disabled="!shop"
        :src="icon_pic ? getShopImagePath(icon_pic) : null"
        :tabs="tabs"
        class="mt-4 mb-5 mx-auto"
        icon="storefront"
        scrollable
        small
      ></u-tabs-rounded>
    </transition>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Title & State ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div v-if="step === 0" key="slide-0" class="widget-box mb-5">
      <s-widget-header
        :title="$t('admin_shop.edit.info.title_tab.title')"
        icon="store_mall_directory"
      >
      </s-widget-header>
      <v-list-subheader>
        {{ $t("admin_shop.edit.info.title_tab.subtitle") }}
      </v-list-subheader>
      <v-text-field
        v-model="title"
        :color="SaminColorLight"
        :counter="30"
        :label="`${$t('add_shop.title_input')}*`"
        hint="Enter your business name."
        placeholder="e.g. Serenity Spa & Wellness"
        required
        variant="underlined"
      >
        <template v-slot:append-inner>
          <b-translation-button-shop
            v-if="shop?.id"
            :label="$t('add_shop.title_input')"
            :shop="shop"
            class="me-2"
            translation-key="title"
          ></b-translation-button-shop>

          <u-tooltip-tips :message="$t('add_shop.title_input_tips')" />
        </template>
      </v-text-field>

      <u-language-input
        v-model="language"
        :messages="$t('add_shop.language_input_message')"
        max-width="unset"
      >
      </u-language-input>

      <u-smart-switch
        v-model="active"
        :false-title="$t('global.commons.inactive')"
        :force-show-all="false"
        :true-description="$t('add_shop.active_message')"
        :true-title="$t('global.commons.active')"
        class="my-5"
        color="green"
        false-gray
        false-icon="public_off"
        true-icon="public"
      />
      <v-expand-transition>
        <div v-if="!active && shop">
          <div class="my-5">
            <div class="widget-buttons">
              <v-btn
                :loading="busy_temp_access"
                size="x-large"
                variant="elevated"
                @click="getTempAccess"
              >
                <v-icon start>lock_reset</v-icon>
                Create temporary access link

                <v-avatar class="ms-2 avatar-gradient -thin" size="24">
                  <img :src="getUserAvatar(USER_ID())" />
                </v-avatar>
              </v-btn>
            </div>

            <u-smart-toggle
              v-model="force"
              class="my-5"
              true-icon="autorenew"
              true-title="Force create new"
            ></u-smart-toggle>

            <v-expand-transition>
              <u-text-copy-box
                v-if="temp_access"
                :message="`Valid until ${getLocalTimeString(
                  temp_access.expire_at,
                )}`"
                :value="
                  getShopMainUrl(shop) + '/?temp_access_key=' + temp_access.code
                "
                icon="link"
                small-width-mode
              >
              </u-text-copy-box>
            </v-expand-transition>
          </div>
        </div>
      </v-expand-transition>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Name ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div v-if="step === 1" key="slide-1" class="widget-box mb-5">
      <h2>
        <v-icon class="me-1">alternate_email</v-icon>
        {{ $t("admin_shop.edit.info.name_tab.title") }}
      </h2>
      <v-list-subheader>
        {{ $t("admin_shop.edit.info.name_tab.subtitle") }}
      </v-list-subheader>

      <v-text-field
        v-model="name"
        :counter="128"
        :error="!shop_name_available_success && name.length > 3"
        :error-messages="shop_name_available_error_msg"
        :label="`${$t('add_shop.name_input')}*`"
        :messages="
          shop_name_available_message
            ? shop_name_available_message
            : $t('add_shop.name_input_message')
        "
        :readonly="lock_name"
        class="mt-2 max-width-field-large mx-auto fadeIn english-field"
        dir="ltr"
        persistent-placeholder
        placeholder="Write a name... e.g. my-shop"
        required
        variant="underlined"
      >
        <template v-slot:append-inner>
          <v-progress-circular
            v-if="checking_shop_name"
            class="mx-1"
            color="green"
            indeterminate
            size="24"
          />
          <v-icon
            v-else-if="shop_name_available_success && name.length > 3"
            class="mx-1"
            color="green"
            size="20"
          >
            check_circle
          </v-icon>

          <u-tooltip-tips
            :icon="lock_name ? 'lock_outline' : 'lock_open'"
            class="mx-1"
            message="If you modify this name, it's necessary to click on 'auto fix' or reconnect to your payment services to update the webhook urls."
            @click="lock_name = !lock_name"
          />

          <u-tooltip-tips
            :message="$t('add_shop.name_input_tips')"
            class="mx-1"
          />
        </template>
        <template v-slot:prepend-inner>
          <v-chip
            color="#000"
            prepend-icon="shield"
            size="small"
            variant="flat"
          >
            Shop UID
          </v-chip>
        </template>
      </v-text-field>

      <div class="text-left mt-5 text-body-2 font-weight-black">
        <v-icon class="me-1" size="small">link</v-icon>
        {{ main_service_url }}/<span>@{{ name }}</span>

        <v-btn
          v-copy="`${main_service_url}/@${name}`"
          class="ms-2"
          icon
          size="small"
          type="button"
          variant="plain"
        >
          <v-icon> fa:fas fa-copy</v-icon>
        </v-btn>
      </div>
    </div>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Description ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div v-if="step === 2" key="slide-2" class="widget-box mb-5">
      <s-widget-header
        :title="$t('admin_shop.edit.info.description_tab.title')"
        icon="subject"
      ></s-widget-header>

      <v-list-subheader>
        {{ $t("admin_shop.edit.info.description_tab.subtitle") }}
      </v-list-subheader>

      <v-textarea
        v-model="description"
        :color="SaminColorLight"
        :counter="600"
        :label="$t('add_shop.description_input')"
        :messages="$t('add_shop.description_input_message')"
        auto-grow
        rows="3"
        style="max-width: 1250px"
        variant="underlined"
      >
        <template v-slot:append-inner>
          <b-translation-button-shop
            v-if="shop?.id"
            :label="$t('add_shop.description_input')"
            :shop="shop"
            translation-key="description"
          ></b-translation-button-shop>

          <u-tooltip-tips :message="$t('add_shop.description_input_tips')" />
        </template>
      </v-textarea>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Info ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div v-if="step === 3" key="slide-3" class="widget-box mb-5">
      <s-widget-header
        :title="$t('admin_shop.edit.info.contact_tab.title')"
        icon="assistant_direction"
      ></s-widget-header>

      <v-list-subheader>
        {{ $t("admin_shop.edit.info.contact_tab.subtitle") }}
      </v-list-subheader>

      <div
        class="position-relative map-circle -hover ma-auto pointer-pointer zoomIn mb-2 mt-4"
        @click="map_dialog = true"
      >
        <img
          :src="
            info.location
              ? `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${info.location.lng},${info.location.lat},13.96,0,0/200x200?access_token=pk.eyJ1IjoicGFqdWhhYW4iLCJhIjoiY2sxaHNtbnU3MDFjcjNta2V0OTZ0d2ExYiJ9.YKRh0EP7NnhbmuSil7AvSw`
              : require('../../../assets/icons/map-shop.svg')
          "
          class="map-image"
        />
        <u-map-view-pin
          v-if="info.location"
          :pin-image="require('../../../assets/icons/store.svg')"
          class="map-pointer"
        ></u-map-view-pin>
      </div>

      <div class="text-center">
        <v-btn
          class="m-2 fadeIn"
          color="red"
          size="small"
          variant="text"
          @click="info.location = {}"
        >
          <v-icon size="small">close</v-icon>
          {{ $t("global.actions.clear") }}
        </v-btn>
      </div>

      <s-country-select
        :hint="$t('add_shop.country_input_message')"
        :label="$t('add_shop.country_input')"
        :model-value="selected_country_obj"
        item-value="name"
        return-object
        @update:model-value="
          (val) => {
            selected_country_obj = val;
            info.country = val.name;
            info.country_code = val.alpha2;
          }
        "
      />

      <v-text-field
        v-model="info.region"
        :color="SaminColorLight"
        :hint="$t('add_shop.region_input_message')"
        :label="$t('add_shop.region_input')"
        append-inner-icon="place"
        variant="underlined"
      />

      <v-text-field
        v-model="info.locality"
        :color="SaminColorLight"
        :hint="$t('add_shop.locality_input_message')"
        :label="$t('add_shop.locality_input')"
        append-inner-icon="near_me"
        variant="underlined"
      />

      <v-textarea
        v-model="info.address"
        :color="SaminColorLight"
        :counter="600"
        :hint="$t('add_shop.address_input_message')"
        :label="$t('add_shop.address_input')"
        :rows="2"
        append-inner-icon="fa:fas fa-map-marked-alt"
        auto-grow
        variant="underlined"
      />

      <v-text-field
        v-model="info.postal_code"
        :color="SaminColorLight"
        :hint="$t('add_shop.postal_code_input_message')"
        :label="$t('add_shop.postal_code_input')"
        append-inner-icon="local_convenience_store"
        variant="underlined"
      />

      <v-text-field
        v-model="info.phone"
        :color="SaminColorLight"
        :hint="$t('add_shop.phone_input_message')"
        :label="$t('add_shop.phone_input')"
        append-inner-icon="fa:fas fa-phone"
        placeholder="+###-###-######## or use any preferred format..."
        variant="underlined"
      >
        <template v-slot:append-inner>
          <u-tooltip-tips :message="$t('add_shop.phone_input_tips')" />
        </template>
      </v-text-field>

      <v-text-field
        v-model="info.email"
        :color="SaminColorLight"
        :hint="$t('add_shop.email_input_message')"
        :label="$t('add_shop.email_input')"
        append-inner-icon="fa:fas fa-envelope"
        variant="underlined"
      />
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Logo ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <template v-if="shop && shop.id && step === 4">
      <div key="slide-4" class="widget-box mb-5">
        <s-widget-header
          :title="$t('admin_shop.edit.info.image_tab.title')"
          icon="grain"
        ></s-widget-header>
        <v-list-subheader>
          {{ $t("admin_shop.edit.info.image_tab.subtitle") }}
        </v-list-subheader>

        <s-image-uploader
          :image="getShopImagePath(icon_pic)"
          :server="window.API.UPLOAD_SHOP_IMAGE(shop.id)"
          auto-compact
          class="mt-5 mx-auto fadeIn"
          label="Your Business Logo"
          max-file-size="512KB"
          @new-path="handleProcessIcon"
        >
        </s-image-uploader>
      </div>

      <div key="slide-5" class="widget-box mb-5">
        <s-widget-header icon="photo" title="Favicons"></s-widget-header>
        <v-list-subheader>
          Favicons are small, iconic images that represent a website in browser
          tabs, bookmarks, and mobile app interfaces.
        </v-list-subheader>

        <s-image-uploader
          :image="getShopImagePath(fav_pic)"
          :server="window.API.UPLOAD_SHOP_FAV_ICON(shop.id)"
          auto-compact
          class="mt-5 mx-auto fadeIn"
          label="Website Favorite Icon"
          max-file-size="512KB"
          @new-path="handleProcessFav"
        >
        </s-image-uploader>
      </div>
    </template>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Buttons ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div class="widget-buttons">
      <v-btn
        v-if="step !== 0 || hasFirstBack"
        class="m-2"
        color="default"
        size="x-large"
        variant="text"
        @click="back()"
      >
        <v-icon class="me-2">{{ $t("icons.chevron_back") }}</v-icon>
        {{ $t("global.actions.back") }}
      </v-btn>

      <v-btn
        v-if="shop"
        :class="{ disabled: !name || !title || !language }"
        :loading="busy_edit_shop"
        class="m-2"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="editShop()"
      >
        {{
          step === 4 ? $t("global.actions.finish") : $t("global.actions.save")
        }}

        <v-icon v-if="step !== 4" class="ms-2" size="small">
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
      <v-btn
        v-if="!shop && step > 0"
        :class="{ disabled: !name || !title || !language }"
        :loading="busy_add_shop"
        class="m-2"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="addShop()"
      >
        <v-icon class="me-2"> check</v-icon>
        {{ $t("add_shop.create_shop_action") }}
      </v-btn>
      <v-btn
        v-if="!shop && step === 0"
        :class="{ disabled: !title || !language }"
        class="m-2"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="goNext()"
      >
        {{ $t("global.actions.next") }}

        <v-icon class="ms-2" size="small">
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Google search preview ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div class="widget-box my-16 text-start" style="--background: #fff">
      <s-widget-header
        :add-caption="shop?.id ? $t('global.actions.update') : undefined"
        :add-loading="busy_render_google"
        add-icon="refresh"
        add-text
        icon="fa:fa-brands fa-google"
        title="SEO Preview"
        @click:add="getRenderedOnGoogle"
      ></s-widget-header>

      <div
        v-if="canShowGooglePreview"
        :class="{ blurred: busy_render_google }"
        class="my-5 seo-preview"
        v-html="rendered_on_google"
      ></div>

      <b-google-preview
        v-else
        :description="description"
        :title="title"
        :url="`${main_service_url}/@${name}`"
        class="mx-auto my-5"
      />
    </div>
  </div>

  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Dialog > Select Address ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

  <v-dialog
    v-model="map_dialog"
    :scrim="false"
    content-class="bg-map"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <u-map-view
      v-if="map_dialog"
      ref="map_view_dialog"
      v-model="map_location"
      v-model:center="center"
      :address-type="$t('add_shop.map.address')"
      :color="SaminColorDark"
      :confirm-text="$t('add_shop.map.confirm')"
      :receptor-type="$t('add_shop.map.receptor')"
      :startup-mode="startup_mode_map_dialog"
      :title="$t('add_shop.map.title')"
      :zoom="17"
      can-select-address
      has-address-book
      has-bottom-bar
      has-top-bar
      show-search-box
      style="width: 100%; height: 100%"
      @clickSetLocation="onClickSetLocation"
      @close="map_dialog = false"
    />
  </v-dialog>
</template>

<script>
import UProgressStepper from "../../../ui/progress/stepper/UProgressStepper.vue";

import _ from "lodash-es";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import UTooltipTips from "../../../ui/tooltip/tips/UTooltipTips.vue";
import BGooglePreview from "../../google/preview/BGooglePreview.vue";
import SImageUploader from "../../../ui/uploader/SImageUploader.vue";
import ULanguageInput from "../../../ui/language/input/ULanguageInput.vue";
import UTabsRounded from "../../../ui/tab/rounded/UTabsRounded.vue";
import SCountrySelect from "../../../ui/country/select/SCountrySelect.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";
import UMapViewPin from "../../../ui/map/view/market/UMapViewPin.vue";
import InlineHelp from "../../help/InlineHelp.vue";
import UTextCopyBox from "../../../ui/text/copy-box/UTextCopyBox.vue";

import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import { TrackSeller } from "@selldone/core-js/enums/gtag/TrackSeller";
import BTranslationButtonShop from "../../translation/button/shop/BTranslationButtonShop.vue";
import SWidgetHeader from "../../../ui/widget/header/SWidgetHeader.vue";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper";

export default {
  name: "BShopAdd",
  components: {
    SWidgetHeader,
    BTranslationButtonShop,
    USmartSwitch,
    USmartToggle,

    UTextCopyBox,
    InlineHelp,
    UMapViewPin,
    SCountrySelect,
    UTabsRounded,
    ULanguageInput,
    SImageUploader,
    BGooglePreview,
    UTooltipTips,
    UProgressStepper,
  },
  props: {
    shop: {
      required: false,
      type: Object,
    },
    hasFirstBack: {
      type: Boolean,
      default: false,
    },
    showStepper: Boolean,
  },

  data: () => ({
    busy: false,

    title: "",
    language: "",
    description: "",
    name: "",
    lock_name: true,
    active: true,
    icon_pic: "",
    fav_pic: "",

    selected_country_obj: null,
    info: {},

    step: 0,

    swiperOption: {
      autoHeight: true, //enable auto height
      allowTouchMove: false,
    },

    //----------
    shop_name_available_success: false,
    shop_name_available_message: "",
    shop_name_available_error_msg: null,
    checking_shop_name: false,

    // ---------- Address map ----------
    map_model: null,
    map_dialog: false,
    center: { lat: 37.3875, lng: -122.0575 },
    startup_mode_map_dialog: "default", // detail

    map_location: {},

    //-------- Google Preview ----------
    busy_render_google: false,
    rendered_on_google: "",

    busy_add_shop: false,
    busy_edit_shop: false,

    //-------- Temporary access ----------
    force: false,
    temp_access: null,
    busy_temp_access: false,
  }),

  computed: {
    has_deal() {
      return this.USER().has_deal;
    },

    main_service_url() {
      return SetupService.MainServiceUrl();
    },

    canShowGooglePreview() {
      return this.shop && this.shop.id;
    },

    calculateProgressPercent() {
      let out = 0;
      if (this.step >= 0 && this.title) out += 20;
      if (this.step >= 1 && this.name) out += 20;
      if (this.step >= 2 && this.description) out += 15;
      if (this.step >= 3 && this.info.address) out += 15;
      if (this.step >= 3 && this.info.phone) out += 10;
      if (this.step >= 4 && this.shop.icon) out += 20;

      return out;
    },

    tabs() {
      return [
        {
          title: this.$t("add_shop.menu.shop_title"),
          value: 0,
          color: "#00796B",
          icon: this.calculateProgressIcon(0),
        },
        {
          title: this.$t("add_shop.menu.shop_name"),
          value: 1,
          color: "#00796B",
          icon: this.calculateProgressIcon(1),
        },
        {
          title: this.$t("add_shop.menu.description"),
          value: 2,
          color: "#00796B",
          icon: this.calculateProgressIcon(2),
        },
        {
          title: this.$t("add_shop.menu.contact"),
          value: 3,
          color: "#00796B",
          icon: this.calculateProgressIcon(3),
        },
        {
          title: this.$t("add_shop.menu.image"),
          value: 4,
          color: "#00796B",
          icon: this.calculateProgressIcon(4),
        },
      ];
    },
  },

  watch: {
    shop() {
      this.reassignShopInfo();
    },

    name: _.throttle(function (newVal, oldVal) {
      this.checkShopNameAvailable();
    }, 1000),

    step(){
      ScrollHelper.scrollToTop()
    }
  },
  created() {
    this.reassignShopInfo();
  },

  methods: {
    onClickSetLocation(info) {
      console.log(info);
      this.center = Object.assign({}, info.location);
      this.info.location = Object.assign({}, info.location);
      this.map_dialog = false;

      if (!this.info.address)
        this.info.address = MapHelper.GenerateFullAddressFromMapInfo(info);
    },

    checkValidUrl(key, host) {
      if (!this.info[key]) return false;

      try {
        return Boolean(!new URL(this.info[key]).host.endsWith(host));
      } catch (e) {
        return true;
      }
    },

    checkShopNameAvailable() {
      if (!this.name || this.name.length < 4) {
        this.shop_name_available_success = false;
        this.shop_name_available_message = "";
        this.lock_name = false; // Force unlock name!
        return;
      }
      let t = this;
      this.checking_shop_name = true;
      axios
        .get(window.API.GET_CHECK_SHOP_NAME(), {
          params: {
            name: this.name,
            shop_id: this.shop ? this.shop.id : null,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.shop_name_available_success = true;
            this.shop_name_available_message = this.$t(
              "add_shop.notifications.name_available",
              { name: data.name },
            );
            this.shop_name_available_error_msg = null;
          } else {
            this.shop_name_available_success = false;
            this.lock_name = false; // Force unlock name!

            this.shop_name_available_error_msg = data.error_msg;
            this.shop_name_available_message = null;
          }
        })
        .catch((error) => {
          t.showLaravelError(error);
          t.busy = false;
        })
        .finally(() => {
          this.checking_shop_name = false;
        });
    },

    calculateProgressIcon(step) {
      return step === 0
        ? "fa:fas fa-store"
        : step === 1
          ? "fa:fas fa-tag"
          : step === 2
            ? "fa:fas fa-file-signature"
            : step === 3
              ? "fa:fas fa-location-arrow"
              : step === 4
                ? "fa:fas fa-image"
                : "home";
    },

    goPrevious() {
      this.goTo(this.step > 0 ? this.step - 1 : 0);
    },
    goNext() {
      if (!this.shop && this.step >= 1) return;

      if (!this.shop && this.step === 0 && this.title && !this.name) {
        /* function hasNonEnglishChars(str) {
           const nonEnglishPattern = /[^a-zA-Z0-9\s.,-_!()&'"]/;
           return nonEnglishPattern.test(str);
         }*/

        // Auto set shop name:
        this.name = this.slugify(this.title);

        /* if (!hasNonEnglishChars(this.title)) {
           this.name = this.slugify(this.title);
         }*/
      }

      if (this.step === 1 && !this.shop) {
        // Save shop in this step in not exist (add)!
        this.addShop();
      }

      if (this.shop && this.step < 3) {
        //Update google preview
        this.getRenderedOnGoogle();
      }

      if (this.step === 4) {
        // Last step! finish.
        this.$router.push({
          name: "BPageShopDashboard",
          params: { shop_id: this.shop.id },
        });
      } else {
        this.goTo(this.step + 1);
      }
    },

    goTo(step) {
      this.step = step;
    },

    handleProcessIcon(path) {
      this.icon_pic = path;
      if (this.shop) this.shop.icon = path;
    },

    handleProcessFav(path) {
      this.fav_pic = path;
      if (this.shop) this.shop.fav = path;
    },

    getRenderedOnGoogle() {
      if (!this.shop || !this.shop.id) return;

      let t = this;
      this.busy_render_google = true;
      axios
        .get(window.API.GET_SEO_PREVIEW_SHOP(this.shop.id))
        .then(({ data }) => {
          if (data.error) {
            t.showErrorAlert(null, data.error_msg);
          } else {
            this.rendered_on_google = data.html;
          }
        })
        .catch((error) => {
          t.showLaravelError(error);
        })
        .finally(() => {
          this.busy_render_google = false;
        });
    },

    addShop() {
      this.busy_add_shop = true;
      axios
        .post(window.API.POST_ADD_SHOP(), {
          title: this.title,
          language: this.language,
          description: this.description,
          name: this.name,
          active: this.active,
          info: this.info,
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t("add_shop.notifications.add_success", {
                name: this.title,
              }),
            );
            this.$emit("update:shop", data.shop);
            this.$emit("add", data.shop);

            this.goTo(2);
            // 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊
            this.ShowConfetti(3000, "love");

            // Object.assign(this.$data, this.$options.data());
            // t.back();

            //┌─────────────── 🫐 Analytics 🫐 ───────────────┐
            TrackSeller.onAddShop(data.shop);
            //└───────────────────────────────────────────────┘
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add_shop = false;
        });
    },
    editShop() {
      this.busy_edit_shop = true;

      axios
        .put(window.API.PUT_EDIT_SHOP(this.shop.id), {
          title: this.title,
          language: this.language,
          description: this.description,
          name: this.name,
          active: this.active,
          info: this.info,
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t("add_shop.notifications.edit_success"),
            );

            this.shop.title = data.shop.title;
            this.shop.language = data.shop.language;

            this.shop.description = data.shop.description;
            this.shop.name = data.shop.name;
            this.shop.active = data.shop.active;
            this.shop.info = data.shop.info;

            this.$emit("edit", data.shop);
            this.goNext();
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_edit_shop = false;
        });
    },

    reassignShopInfo() {
      if (this.shop) {
        this.name = this.shop.name;
        this.language = this.shop.language ? this.shop.language : "en";
        this.description = this.shop.description;

        this.title = this.shop.title;

        this.description = this.shop.description;

        this.icon = this.shop.icon;

        this.active = this.shop.active;

        this.info =
          this.shop.info && !Array.isArray(this.shop.info)
            ? this.shop.info
            : {};

        this.selected_country_obj = {alpha2:this.info.country_code};

        if (this.info.location) {
          this.center.lat = this.info.location.lat;
          this.center.lng = this.info.location.lng;
        } else {
          this.info.location = { lat: 0, lng: 0 };
        }

        this.icon_pic = this.shop.icon;
        this.fav_pic = this.shop.fav ? this.shop.fav : this.shop.icon; // Load default!

        this.getRenderedOnGoogle();
      } else {
        Object.assign(this.$data, this.$options.data());
        this.language = this.getCurrentLanguage()
          ? this.getCurrentLanguage().locale // Set user selected language as shop language!
          : "en";
      }
    },
    back() {
      if (this.step === 0) {
        this.$emit("back");
      } else {
        this.goPrevious();
      }
    },

    // --------------------------------- Temporary access link for inactive shop -------------------------------------
    getTempAccess() {
      this.busy_temp_access = true;
      this.temp_access = null;
      axios
        .post(window.API.POST_SHOP_CREATE_TEMPORARY_ACCESS(this.shop.id), {
          force: this.force,
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(null, "Access key generated successfully.");

            this.temp_access = data.temp_access;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_temp_access = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.seo-preview {
  //animation: blur 1s ease;
  transition: all 1s;

  &.blurred {
    filter: blur(6px);
  }
}
</style>
