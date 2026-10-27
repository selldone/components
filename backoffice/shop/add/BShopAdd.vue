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
  <div
    class="b-shop-add position-relative"
    :class="{ 'b-shop-add--modern sd-modern-form text-start': modern }"
  >


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
    <v-tabs
      v-if="modern"
      v-model="step"
      :aria-label="$t('admin_shop.edit.menu.info')"
      class="b-shop-add__tabs"
      height="42"
      hide-slider
    >
      <v-avatar v-if="icon_pic" class="b-shop-add__tab-avatar" size="28">
        <img :src="getShopImagePath(icon_pic)" alt="" />
      </v-avatar>
      <v-tab
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :disabled="!shop"
      >
        <v-icon :icon="tab.icon" aria-hidden="true" />
        <span class="b-shop-add__tab-label">{{ tab.title }}</span>
      </v-tab>
    </v-tabs>
    <transition v-else name="fadeUp">
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Tabs ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <u-tabs-rounded
        v-model="step"
        :disabled="!shop"
        :src="icon_pic ? getShopImagePath(icon_pic) : null"
        :tabs="tabs"
        class="mt-4 mb-5 mx-1"
        icon="storefront"
        scrollable
        small
      ></u-tabs-rounded>
    </transition>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Title & State ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      v-if="step === 0"
      key="slide-0"
      :class="modern ? 'sd-modern-widget b-shop-add__panel' : 'widget-box mb-5'"
    >
      <div :class="{ 'sd-modern-title b-shop-add__heading': modern }">
        <span v-if="modern" class="sd-modern-icon sd-modern-icon--plain">
          <v-icon aria-hidden="true">store_mall_directory</v-icon>
        </span>
        <div>
          <u-widget-header
            :class="{ 'sd-modern-form-header': modern }"
            :title="$t('admin_shop.edit.info.title_tab.title')"
            :icon="modern ? undefined : 'store_mall_directory'"
          />
          <v-list-subheader :class="{ 'b-shop-add__subtitle': modern }">
            <span>{{ $t("admin_shop.edit.info.title_tab.subtitle") }}</span>
            <u-tooltip-tips
              v-if="modern"
              class="sd-modern-icon-button sd-modern-info-button"
              icon="info_outline"
              :aria-label="`${$t('add_shop.title_input')} — ${$t('global.commons.help')}`"
              :message="$t('add_shop.title_input_tips')"
            />
          </v-list-subheader>
        </div>
      </div>
      <div class="b-shop-add__identity-fields" :class="{ 'sd-modern-form-grid': modern }">
      <v-text-field
        v-model="title"
        :counter="30"
        :label="`${$t('add_shop.title_input')}*`"
        :hint="$t('admin_shop.edit.info.title_input_message')"
        placeholder="e.g. Serenity Spa & Wellness"
        required
        variant="underlined"
        :persistent-placeholder="modern"
        :class="{ 'sd-modern-underlined-field': modern }"
        :disabled="readOnly"
      >
        <template v-slot:append-inner>
          <b-translation-button-shop
            v-if="shop?.id"
            :label="$t('add_shop.title_input')"
            :shop="shop"
            :class="modern ? undefined : 'me-2'"
            translation-key="title"
          ></b-translation-button-shop>

          <u-tooltip-tips v-if="!modern" :message="$t('add_shop.title_input_tips')" />
        </template>
      </v-text-field>

      <u-language-input
        v-model="language"
        :messages="$t('add_shop.language_input_message')"
        max-width="unset"
        :persistent-placeholder="modern"
        :class="{ 'sd-modern-underlined-field': modern }"
        :disabled="readOnly"
      >
      </u-language-input>
      </div>

      <div v-if="modern" class="b-shop-add__divider" />

      <u-smart-switch
        v-model="active"
        :false-title="$t('global.commons.inactive')"
        :force-show-all="false"
        :true-description="$t('add_shop.active_message')"
        :true-title="$t('global.commons.active')"
        :class="modern ? 'b-shop-add__active' : 'my-5'"
        color="green"
        false-gray
        false-icon="public_off"
        true-icon="public"
        :disabled="readOnly"
      />
      <v-expand-transition>
        <div v-if="!active && shop">
          <div :class="modern ? 'b-shop-add__temporary-access' : 'my-5'">
            <header v-if="modern" class="b-shop-add__temporary-heading">
              <h3>{{ $t('admin_shop.edit.info.temporary_access.title') }}</h3>
              <p>{{ $t('admin_shop.edit.info.temporary_access.description') }}</p>
            </header>

            <u-smart-toggle
              v-model="force"
              :class="modern ? 'b-shop-add__temporary-force' : 'my-5'"
              true-icon="autorenew"
              :true-title="$t('admin_shop.edit.info.temporary_access.force_title')"
              :true-description="modern ? $t('admin_shop.edit.info.temporary_access.force_description') : undefined"
              :disabled="readOnly || busy_temp_access"
            />

            <div :class="modern ? 'b-shop-add__temporary-action' : 'widget-buttons'">
              <v-btn
                :loading="busy_temp_access"
                :disabled="readOnly"
                size="x-large"
                :variant="modern ? 'tonal' : 'elevated'"
                :class="{ 'sd-modern-button sd-modern-button--form': modern }"
                @click="getTempAccess"
              >
                <v-icon start>{{ modern ? 'link' : 'lock_reset' }}</v-icon>
                {{ $t('admin_shop.edit.info.temporary_access.create_action') }}

                <v-avatar v-if="!modern" class="ms-2 avatar-gradient -thin" size="24">
                  <img :src="getUserAvatar(USER_ID())" />
                </v-avatar>
              </v-btn>
            </div>

            <v-expand-transition>
              <u-text-copy-box
                v-if="temp_access"
                :message="$t('admin_shop.edit.info.temporary_access.expires', { date: getLocalTimeString(temp_access.expire_at) })"
                :value="
                  ShopURLs.MainShopUrl(shop) + '/?temp_access_key=' + temp_access.code
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

    <div
      v-if="step === 1"
      key="slide-1"
      :class="modern ? 'sd-modern-widget b-shop-add__panel' : 'widget-box mb-5'"
    >
      <div :class="{ 'sd-modern-title b-shop-add__heading': modern }">
        <span v-if="modern" class="sd-modern-icon sd-modern-icon--plain">
          <v-icon aria-hidden="true">alternate_email</v-icon>
        </span>
        <div>
          <u-widget-header
            v-if="modern"
            :class="{ 'sd-modern-form-header': modern }"
            :title="$t('admin_shop.edit.info.name_tab.title')"
            :icon="modern ? undefined : 'alternate_email'"
          />
          <h2 v-else>
            <v-icon class="me-1">alternate_email</v-icon>
            {{ $t("admin_shop.edit.info.name_tab.title") }}
          </h2>
          <v-list-subheader :class="{ 'b-shop-add__subtitle': modern }">
            <span>{{ $t("admin_shop.edit.info.name_tab.subtitle") }}</span>
            <u-tooltip-tips
              v-if="modern"
              class="sd-modern-icon-button sd-modern-info-button"
              icon="info_outline"
              :aria-label="`${$t('add_shop.name_input')} — ${$t('global.commons.help')}`"
              :message="$t('add_shop.name_input_tips')"
            />
          </v-list-subheader>
        </div>
      </div>

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
        :class="modern ? 'sd-modern-underlined-field english-field' : 'mt-2 max-width-field-large mx-auto fadeIn english-field'"
        dir="ltr"
        persistent-placeholder
        placeholder="my-store"
        required
        variant="underlined"
        :disabled="readOnly"
      >
        <template v-slot:append-inner>
          <v-progress-circular
            v-if="!modern && checking_shop_name"
            class="mx-1"
            color="green"
            indeterminate
            size="24"
          />
          <v-icon
            v-else-if="!modern && shop_name_available_success && name.length > 3"
            class="mx-1"
            color="green"
            size="20"
          >
            check_circle
          </v-icon>

          <u-tooltip-tips
            :icon="lock_name ? 'lock_outline' : 'lock_open'"
            :aria-label="lock_name ? $t('global.actions.unlock') : $t('global.actions.lock')"
            :class="modern ? undefined : 'mx-1'"
            :message="$t('admin_shop.edit.info.name_locked_help')"
            @click="lock_name = !lock_name"
          />

          <u-tooltip-tips
            v-if="!modern"
            :message="$t('add_shop.name_input_tips')"
            :class="modern ? undefined : 'mx-1'"
          />
        </template>
        <template v-slot:prepend-inner>
          <span v-if="modern" class="sd-modern-field-status" aria-hidden="true">
            <v-progress-circular v-if="checking_shop_name" indeterminate size="16" width="2" color="primary" />
            <v-icon v-else-if="shop_name_available_success && name.length > 3" color="success" size="16">check_circle</v-icon>
            <v-icon v-else-if="shop_name_available_error_msg && name.length > 3" color="error" size="16">cancel</v-icon>
          </span>
          <v-chip
            v-else
            color="#000"
            prepend-icon="shield"
            size="small"
            variant="flat"
          >
            Shop UID
          </v-chip>
        </template>
      </v-text-field>

      <div :class="modern ? 'b-shop-add__store-url' : 'text-left mt-5 text-body-2 font-weight-black'" dir="ltr">
        <v-icon class="me-1" size="small">link</v-icon>
        {{ main_service_url }}/<span>@{{ name }}</span>

        <v-btn
          v-copy="`${main_service_url}/@${name}`"
          :aria-label="$t('global.actions.copy')"
          :class="modern ? 'sd-modern-icon-button' : 'ms-2'"
          icon
          size="small"
          type="button"
          variant="plain"
        >
          <v-icon> fa:fas fa-copy</v-icon>
          <v-tooltip v-if="modern" activator="parent" content-class="sd-modern-tooltip text-start" location="top">
            {{ $t('global.actions.copy') }}
          </v-tooltip>
        </v-btn>
      </div>
    </div>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Description ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      v-if="step === 2"
      key="slide-2"
      :class="modern ? 'sd-modern-widget b-shop-add__panel' : 'widget-box mb-5'"
    >
      <div :class="{ 'sd-modern-title b-shop-add__heading': modern }">
        <span v-if="modern" class="sd-modern-icon sd-modern-icon--plain">
          <v-icon aria-hidden="true">subject</v-icon>
        </span>
        <div>
          <u-widget-header
            :class="{ 'sd-modern-form-header': modern }"
            :title="$t('admin_shop.edit.info.description_tab.title')"
            :icon="modern ? undefined : 'subject'"
          />
          <v-list-subheader :class="{ 'b-shop-add__subtitle': modern }">
            <span>{{ $t("admin_shop.edit.info.description_tab.subtitle") }}</span>
            <u-tooltip-tips
              v-if="modern"
              class="sd-modern-icon-button sd-modern-info-button"
              icon="info_outline"
              :aria-label="`${$t('add_shop.description_input')} — ${$t('global.commons.help')}`"
              :message="$t('add_shop.description_input_tips')"
            />
          </v-list-subheader>
        </div>
      </div>

      <v-textarea
        v-model="description"
        :counter="600"
        :label="$t('add_shop.description_input')"
        :messages="$t('add_shop.description_input_message')"
        auto-grow
        style="max-width: 1250px"
        variant="underlined"
        :persistent-placeholder="modern"
        :class="{ 'sd-modern-underlined-field': modern }"
        :disabled="readOnly"
      >
        <template v-slot:append-inner>
          <b-translation-button-shop
            v-if="shop?.id"
            :label="$t('add_shop.description_input')"
            :shop="shop"
            translation-key="description"
          ></b-translation-button-shop>

          <u-tooltip-tips v-if="!modern" :message="$t('add_shop.description_input_tips')" />
        </template>
      </v-textarea>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Info ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      v-if="step === 3"
      key="slide-3"
      :class="modern ? 'sd-modern-widget b-shop-add__panel' : 'widget-box mb-5'"
    >
      <div :class="{ 'sd-modern-title b-shop-add__heading': modern }">
        <span v-if="modern" class="sd-modern-icon sd-modern-icon--plain">
          <v-icon aria-hidden="true">assistant_direction</v-icon>
        </span>
        <div>
          <u-widget-header
            :class="{ 'sd-modern-form-header': modern }"
            :title="$t('admin_shop.edit.info.contact_tab.title')"
            :icon="modern ? undefined : 'assistant_direction'"
          />
          <v-list-subheader :class="{ 'b-shop-add__subtitle': modern }">
            <span>{{ $t("admin_shop.edit.info.contact_tab.subtitle") }}</span>
            <u-tooltip-tips
              v-if="modern"
              class="sd-modern-icon-button sd-modern-info-button"
              icon="info_outline"
              :aria-label="`${$t('add_shop.phone_input')} — ${$t('global.commons.help')}`"
              :message="`${$t('add_shop.phone_input')}: ${$t('add_shop.phone_input_tips')}`"
            />
          </v-list-subheader>
        </div>
      </div>

      <div
        class="position-relative map-circle -hover ma-auto pointer-pointer zoomIn mb-2 mt-4"
        @click="map_dialog = true"
        :class="{ pen: readOnly }"
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

      <div v-if="!readOnly" class="text-center">
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

      <div class="b-shop-add__contact-fields" :class="{ 'sd-modern-form-grid': modern }">
      <s-country-select
        :hint="$t('add_shop.country_input_message')"
        :label="$t('add_shop.country_input')"
        :model-value="selected_country_obj"
        item-value="name"
        return-object
        :persistent-placeholder="modern"
        :class="{ 'sd-modern-underlined-field': modern }"
        @update:model-value="
          (val) => {
            selected_country_obj = val;
            info.country = val.name;
            info.country_code = val.alpha2;
          }
        "
        :disabled="readOnly"
      />

      <v-text-field
        v-model="info.region"
        :hint="$t('add_shop.region_input_message')"
        :label="$t('add_shop.region_input')"
        append-inner-icon="place"
        variant="underlined"
        :persistent-placeholder="modern"
        :class="{ 'sd-modern-underlined-field': modern }"
        :disabled="readOnly"
      />

      <v-text-field
        v-model="info.locality"
        :hint="$t('add_shop.locality_input_message')"
        :label="$t('add_shop.locality_input')"
        append-inner-icon="near_me"
        variant="underlined"
        :persistent-placeholder="modern"
        :class="{ 'sd-modern-underlined-field': modern }"
        :disabled="readOnly"
      />

      <v-textarea
        v-model="info.address"
        :counter="600"
        :hint="$t('add_shop.address_input_message')"
        :label="$t('add_shop.address_input')"
        :rows="2"
        append-inner-icon="fa:fas fa-map-marked-alt"
        auto-grow
        variant="underlined"
        :persistent-placeholder="modern"
        :class="{ 'sd-modern-underlined-field b-shop-add__full': modern }"
        :disabled="readOnly"
      />

      <v-text-field
        v-model="info.postal_code"
        :hint="$t('add_shop.postal_code_input_message')"
        :label="$t('add_shop.postal_code_input')"
        append-inner-icon="local_convenience_store"
        variant="underlined"
        :persistent-placeholder="modern"
        :class="{ 'sd-modern-underlined-field': modern }"
        :disabled="readOnly"
      />

      <v-text-field
        v-model="info.phone"
        :hint="$t('add_shop.phone_input_message')"
        :label="$t('add_shop.phone_input')"
        append-inner-icon="fa:fas fa-phone"
        placeholder="+###-###-######## or use any preferred format..."
        variant="underlined"
        :persistent-placeholder="modern"
        :class="{ 'sd-modern-underlined-field': modern }"
        :disabled="readOnly"
      >
        <template v-slot:append-inner>
          <u-tooltip-tips v-if="!modern" :message="$t('add_shop.phone_input_tips')" />
        </template>
      </v-text-field>

      <v-text-field
        v-model="info.email"
        :hint="$t('add_shop.email_input_message')"
        :label="$t('add_shop.email_input')"
        append-inner-icon="fa:fas fa-envelope"
        variant="underlined"
        :persistent-placeholder="modern"
        :class="{ 'sd-modern-underlined-field': modern }"
        :disabled="readOnly"
      />
      </div>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Logo ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      v-if="shop && shop.id && step === 4"
      :class="{ 'sd-modern-form-grid b-shop-add__images': modern }"
    >
      <div key="slide-4" :class="modern ? 'sd-modern-widget' : 'widget-box mb-5'">
        <div :class="{ 'sd-modern-title b-shop-add__heading': modern }">
          <span v-if="modern" class="sd-modern-icon sd-modern-icon--plain">
            <v-icon aria-hidden="true">grain</v-icon>
          </span>
          <div>
            <u-widget-header
              :class="{ 'sd-modern-form-header': modern }"
              :title="$t('admin_shop.edit.info.image_tab.title')"
              :icon="modern ? undefined : 'grain'"
            />
            <v-list-subheader :class="{ 'b-shop-add__subtitle': modern }">
              {{ $t("admin_shop.edit.info.image_tab.subtitle") }}
            </v-list-subheader>
          </div>
        </div>

        <s-image-uploader
          :image="getShopImagePath(icon_pic)"
          :server="window.API.UPLOAD_SHOP_IMAGE(shop.id)"
          auto-compact
          class="mt-5 mx-auto fadeIn"
          :label="$t('admin_shop.edit.info.image_tab.title')"
          max-file-size="512KB"
          @new-path="handleProcessIcon"
          :disabled="readOnly"
        >
        </s-image-uploader>
      </div>

      <div key="slide-5" :class="modern ? 'sd-modern-widget' : 'widget-box mb-5'">
        <div :class="{ 'sd-modern-title b-shop-add__heading': modern }">
          <span v-if="modern" class="sd-modern-icon sd-modern-icon--plain">
            <v-icon aria-hidden="true">photo</v-icon>
          </span>
          <div>
            <u-widget-header
              :class="{ 'sd-modern-form-header': modern }"
              :icon="modern ? undefined : 'photo'"
              :title="$t('admin_shop.edit.info.favicon.title')"
            />
            <v-list-subheader :class="{ 'b-shop-add__subtitle': modern }">
              {{ $t('admin_shop.edit.info.favicon.subtitle') }}
            </v-list-subheader>
          </div>
        </div>

        <s-image-uploader
          :image="getShopImagePath(fav_pic)"
          :server="window.API.UPLOAD_SHOP_FAV_ICON(shop.id)"
          auto-compact
          class="mt-5 mx-auto fadeIn"
          :label="$t('admin_shop.edit.info.favicon.title')"
          max-file-size="512KB"
          @new-path="handleProcessFav"
          :disabled="readOnly"
        >
        </s-image-uploader>
      </div>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Buttons ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div v-if="!readOnly" :class="{ 'sd-modern-form-actions b-shop-add__form-actions': modern }">
    <div class="widget-buttons">
      <v-btn
        v-if="step !== 0 || hasFirstBack"
        :class="modern ? 'sd-modern-button sd-modern-button--form' : 'm-2'"
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
        :class="{ disabled: !name || !title || !language, 'sd-modern-button sd-modern-button--form b-shop-add__save': modern, 'm-2': !modern }"
        :loading="busy_edit_shop"
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
        :class="{ disabled: !name || !title || !language, 'sd-modern-button sd-modern-button--form b-shop-add__save': modern, 'm-2': !modern }"
        :loading="busy_add_shop"
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
        :class="{ disabled: !title || !language, 'sd-modern-button sd-modern-button--form b-shop-add__save': modern, 'm-2': !modern }"
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
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Google search preview ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      :class="modern ? 'b-shop-add__seo text-start' : 'widget-box my-16 text-start'"
      :style="modern ? undefined : '--background: #fff'"
    >
      <div v-if="modern" class="sd-modern-header b-shop-add__seo-heading">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain">
            <v-icon aria-hidden="true">search</v-icon>
          </span>
          <div>
            <h2 class="sd-modern-title-text">{{ $t('global.commons.seo_preview') }}</h2>
            <p class="b-shop-add__subtitle">{{ $t('admin_shop.edit.info.seo_preview_subtitle') }}</p>
          </div>
        </div>
        <v-btn
          v-if="shop?.id"
          :loading="busy_render_google"
          class="sd-modern-button sd-modern-button--compact"
          color="primary"
          variant="text"
          @click="getRenderedOnGoogle"
        >
          <v-icon start aria-hidden="true">refresh</v-icon>
          {{ $t('global.actions.update') }}
        </v-btn>
      </div>
      <u-widget-header
        v-else
        :add-caption="shop?.id ? $t('global.actions.update') : undefined"
        :add-loading="busy_render_google"
        add-icon="refresh"
        add-text
        icon="fa:fa-brands fa-google"
        :title="$t('global.commons.seo_preview')"
        @click:add="getRenderedOnGoogle"
      ></u-widget-header>

      <div
        v-if="canShowGooglePreview"
        :class="{ blurred: busy_render_google, 'my-5': !modern }"
        class="seo-preview"
        v-html="rendered_on_google"
      ></div>

      <b-google-preview
        v-else
        :description="description"
        :title="title"
        :url="`${main_service_url}/@${name}`"
        :class="modern ? undefined : 'mx-auto my-5'"
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
      :color="ThemeColorDark"
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

<script lang="ts">
import UProgressStepper from "../../../ui/progress/stepper/UProgressStepper.vue";

import { throttle } from "lodash-es";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import UTooltipTips from "../../../ui/tooltip/tips/UTooltipTips.vue";
import BGooglePreview from "../../google/preview/BGooglePreview.vue";
import SImageUploader from "../../../ui/uploader/SImageUploader.vue";
import ULanguageInput from "../../../ui/language/input/ULanguageInput.vue";
import UTabsRounded from "../../../ui/tab/rounded/UTabsRounded.vue";
import SCountrySelect from "../../../ui/country/select/SCountrySelect.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";
import UMapViewPin from "../../../ui/map/view/market/UMapViewPin.vue";
import UTextCopyBox from "../../../ui/text/copy-box/UTextCopyBox.vue";

import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import { TrackSeller } from "@selldone/core-js/enums/gtag/TrackSeller";
import BTranslationButtonShop from "../../translation/button/shop/BTranslationButtonShop.vue";
import UWidgetHeader from "../../../ui/widget/header/UWidgetHeader.vue";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper";
import UMapView from "@selldone/components-vue/ui/map/view/UMapView.vue";
import { UMixinConfetti } from "@selldone/components-vue/mixin/confetti/UMixinConfetti.ts";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import {ShopURLs} from "@selldone/core-js/helper";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import {Slugify} from "@selldone/core-js/utils/slugify/slugify.ts";

export default {
  name: "BShopAdd",
  mixins: [UMixinConfetti, TemplateMixin, DateMixin ],
  components: {
    UMapView,
    UWidgetHeader,
    BTranslationButtonShop,
    USmartSwitch,
    USmartToggle,

    UTextCopyBox,
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

    readOnly: Boolean,
    modern: Boolean,
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
    center: { lat: 0, lng: 0 },
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
    ShopURLs() {
      return ShopURLs
    },
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

    name: throttle(function (newVal, oldVal) {
      this.checkShopNameAvailable();
    }, 1000),

    step() {
      ScrollHelper.scrollToTop();
    },
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
          NotificationService.showLaravelError(error);
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


        // Auto set shop name:
        this.name = Slugify.apply(this.title);


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
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.rendered_on_google = data.html;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
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
          NotificationService.showLaravelError(error);
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
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
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
          NotificationService.showLaravelError(error);
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

        this.selected_country_obj = { alpha2: this.info.country_code };

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
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(null, "Access key generated successfully.");

            this.temp_access = data.temp_access;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_temp_access = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
// Grouping must retain the legacy direct-child input spacing outside modern views.
.b-shop-add:not(.b-shop-add--modern) {
  .b-shop-add__identity-fields > :deep(.v-input),
  .b-shop-add__contact-fields > :deep(.v-input) {
    margin: 0.5rem;
  }
}

.b-shop-add--modern {
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;

  .b-shop-add__tabs {
    height: auto;
    max-width: 100%;
    margin-block-end: 20px;
    padding: 0 5px;
    background: rgba(var(--v-theme-on-surface), 0.065);
    border-radius: 13px;

    :deep(.v-slide-group__content) {
      gap: 5px;
      padding-block: 14px;
    }

    :deep(.v-tab) {
      flex: 1 1 auto;
      min-width: 0;
      height: 42px;
      padding: 10px 7px;
      border-radius: 9px;
      color: var(--sd-modern-muted);
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      line-height: 1.4;
      letter-spacing: 0;
      text-transform: none;
      opacity: 1;
    }

    :deep(.v-tab--selected) {
      color: rgb(var(--v-theme-on-surface));
      background: rgb(var(--v-theme-surface));
      box-shadow: var(--sd-modern-selected-shadow);
      --v-activated-opacity: 0;
    }

    :deep(.v-btn__content) {
      gap: 7px;
      font: inherit;
      letter-spacing: 0;
      min-width: 0;
    }

    :deep(.v-icon) {
      font-size: 16px;
    }
  }

  .b-shop-add__tab-avatar {
    align-self: center;
    flex-shrink: 0;
    margin-inline: 4px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .b-shop-add__tab-label {
    min-width: 0;
    white-space: nowrap;
  }

  .b-shop-add__panel {
    min-height: 300px;
  }

  .b-shop-add__heading {
    gap: 10px;
    margin-block-end: 24px;

    > .sd-modern-icon {
      margin-block-start: 2px;
    }

    :deep(.sd-modern-form-header.s--widget-header) {
      margin-block: 0 5px;
    }
  }

  .b-shop-add__subtitle {
    min-height: 0;
    padding: 0;
    color: var(--sd-modern-muted);
    font-family: inherit;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.6;
    letter-spacing: 0;

    :deep(.v-list-subheader__text) {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow: visible;
      white-space: normal;
      text-overflow: clip;
    }
  }

  .b-shop-add__identity-fields {
    grid-template-columns: 1.3fr 1fr;
  }

  .b-shop-add__divider {
    margin-block: 24px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  .b-shop-add__active {
    margin: 0;

    :deep(.row-hover) {
      color: rgb(var(--v-theme-on-surface));
      background: var(--sd-modern-inset) !important;
    }

    :deep(.flex-grow-1 > b) {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
    }

    :deep(.flex-grow-1 > .small) {
      font-size: 12px;
      font-weight: 400;
      line-height: 1.5;
    }
  }

  .b-shop-add__temporary-access {
    margin-block-start: 24px;
    padding-block-start: 24px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  .b-shop-add__temporary-heading {
    h3 {
      margin: 0 0 6px;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
    }

    p {
      margin: 0;
      color: var(--sd-modern-muted);
      font-size: 13px;
      line-height: 1.6;
    }
  }

  .b-shop-add__temporary-force {
    margin-block: 16px;

    :deep(.flex-grow-1 > b) {
      font-size: 13px;
      font-weight: 500;
    }

    :deep(.small) {
      font-size: 12px;
      line-height: 1.6;
    }
  }

  .b-shop-add__temporary-action {
    display: flex;
    justify-content: flex-start;
    margin-block-end: 16px;
  }

  .b-shop-add__full {
    grid-column: 1 / -1;
    grid-row: 3;
  }

  .b-shop-add__images {
    align-items: stretch;
    row-gap: 0;

    > .sd-modern-widget {
      display: grid;
      grid-template-rows: subgrid;
      grid-row: span 2;
    }

    .b-shop-add__heading {
      margin-block-end: 24px;
    }
  }

  .b-shop-add__store-url {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-block-start: 20px;
    padding: 12px 16px;
    background: var(--sd-modern-inset);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 400;
    overflow-wrap: anywhere;

    .sd-modern-icon-button {
      margin-inline-start: auto;
    }
  }

  .b-shop-add__form-actions {
    margin-block: 16px 28px;

    .widget-buttons {
      justify-content: flex-end;
      flex-direction: row;
      gap: 12px;
      width: 100%;
      max-width: none;
      margin: 0;
      padding: 0;
    }

    :deep(.sd-modern-button) {
      flex-grow: 0;
    }

    :deep(.v-icon) {
      font-size: 17px;
    }

    .b-shop-add__save {
      min-width: 132px;
    }
  }

  .b-shop-add__seo-heading {
    margin-block-end: 16px;
  }

  .b-shop-add__seo {
    margin-block-start: 28px;

    :deep(.g-small-title) {
      display: none;
    }

    :deep(.g_snippet) {
      max-width: none;
      margin: 0;
      padding: 20px;
      color: rgb(var(--v-theme-on-surface));
      background: rgb(var(--v-theme-surface));
      border: 1px solid var(--sd-modern-border);
      border-radius: 12px;
      font-family: inherit !important;
    }

    :deep(.g_title) {
      color: rgb(var(--v-theme-primary));
      font-size: 18px;
      font-weight: 400;
      line-height: 1.4;
    }

    :deep(.g_url),
    :deep(.g_description) {
      color: var(--sd-modern-muted);
      font-family: inherit;
      font-size: 13px;
      font-weight: 400;
      line-height: 1.65;
    }
  }

  @media (max-width: 680px) {
    .b-shop-add__tab-label {
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .b-shop-add__tabs {
      :deep(.v-slide-group__content) {
        flex: 1 1 auto;
        flex-wrap: wrap;
        min-width: 0;
        width: 100%;
        max-width: 100%;
      }

      :deep(.v-tab) {
        flex: 1 1 90px;
        height: auto;
        padding: 5px 3px;
        white-space: normal;
      }

      :deep(.v-btn__content) {
        gap: 4px;
      }
    }

    .b-shop-add__identity-fields,
    .b-shop-add__contact-fields,
    .b-shop-add__images {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .b-shop-add__images > .sd-modern-widget {
      grid-template-rows: auto auto;
      grid-row: auto;
      row-gap: 0;
    }

    .b-shop-add__panel,
    .b-shop-add__images > .sd-modern-widget {
      padding: 22px 20px;
      border-radius: 18px;
    }

    .b-shop-add__panel {
      min-height: 340px;
    }

    .b-shop-add__full {
      grid-column: auto;
      grid-row: auto;
    }

    .b-shop-add__seo :deep(.g_snippet) {
      padding: 16px;
    }
  }

  @media (max-width: 680px), (pointer: coarse) {
    .b-shop-add__tabs :deep(.v-tab) {
      --v-btn-height: 44px;
      min-height: 44px;
    }
  }
}

.seo-preview {
  //animation: blur 1s ease;
  transition: all 1s;

  &.blurred {
    filter: blur(6px);
  }
}
</style>
