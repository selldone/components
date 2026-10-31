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
    :class="{ 'b-shop-add--modern sd-modern-form text-start': modern, 'b-shop-add--guided': guided }"
  >


    <u-progress-stepper
      v-if="showStepper && !guided"
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
    <div ref="workspace" :class="{ 'b-shop-add__workspace': guided }">
    <nav
      v-if="guided"
      class="sd-modern-section-nav b-shop-add__steps"
      :aria-label="$t('add_shop.guided.dialog_title')"
    >
      <button
        v-for="tab in tabs.slice(0, shop ? 5 : 2)"
        :key="tab.value"
        type="button"
        class="sd-modern-section-nav__item b-shop-add__step"
        :aria-current="step === tab.value ? 'location' : undefined"
        :disabled="busy_add_shop || busy_edit_shop || (!shop && tab.value === 1 && (!title.trim() || !language))"
        @click="!shop && tab.value === 1 && step === 0 ? goNext() : goTo(tab.value)"
      >
        <span class="b-shop-add__step-number" aria-hidden="true">
          <v-icon v-if="!shop && tab.value < step" size="13" color="success">check</v-icon>
          <span v-else>{{ tab.value + 1 }}</span>
        </span>
        <span>{{ tab.value === 0 ? $t('add_shop.guided.business_step') : tab.title }}</span>
      </button>
    </nav>
    <v-tabs
      v-else-if="modern"
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

    <div :class="{ 'b-shop-add__content': guided }">
    <section v-if="guided && !shop && step < 2 && (creation_fee?.charged_from_wallet || creation_fee_error)" class="b-shop-add__fee" :aria-label="$t('add_shop.guided.fee_title')" aria-live="polite" :aria-busy="busy_creation_fee">
      <div class="b-shop-add__fee-heading">
        <div class="b-shop-add__fee-label">
          <span>{{ $t('add_shop.guided.fee_title') }}</span>
          <v-tooltip v-if="creation_fee_matches_wallet && !busy_creation_fee && !creation_fee_error" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
            <template #activator="{ props }">
              <v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" icon type="button" variant="text" :aria-label="$t('add_shop.guided.fee_help')">
                <v-icon aria-hidden="true">info_outline</v-icon>
              </v-btn>
            </template>
            <div class="b-shop-add__fee-help-amount"><u-price :amount="creation_fee.fee" :currency="creation_fee.currency" /></div>
            <span>{{ $t('add_shop.guided.fee_wallet_help', { currency: creation_fee.currency }) }}</span>
          </v-tooltip>
        </div>
        <span v-if="creation_fee_matches_wallet && !busy_creation_fee && !creation_fee_error" class="b-shop-add__fee-amount">
          <u-price :amount="creation_fee.fee" :currency="creation_fee.currency" />
        </span>
        <v-progress-circular v-else-if="busy_creation_fee" indeterminate size="16" width="2" color="primary" aria-hidden="true" />
      </div>
      <template v-if="creation_fee?.charged_from_wallet">
        <v-select
          :model-value="creation_account"
          :items="creation_wallets"
          :label="$t('add_shop.guided.wallet_label')"
          :placeholder="$t('add_shop.guided.wallet_choose')"
          :item-title="account => `${account.currency} · ${account.account_name || account.account_number}`"
          item-value="account_number"
          return-object
          variant="underlined"
          class="sd-modern-underlined-field b-shop-add__wallet-input"
          :loading="busy_creation_wallets"
          :disabled="busy_add_shop || busy_creation_wallets"
          :no-data-text="$t(creation_wallets_error ? 'add_shop.guided.wallet_error' : 'add_shop.guided.wallet_empty')"
          hide-details
          @update:model-value="onCreationWalletChange"
        >
          <template #selection="{ item }">
            <span class="b-shop-add__wallet-value">
              <u-currency-icon :currency="GetCurrency(item.raw.currency)" small />
              <span dir="ltr">{{ item.raw.currency }} · {{ item.raw.account_number }}</span>
              <span class="b-shop-add__wallet-name">{{ item.raw.account_name }}</span>
            </span>
          </template>
          <template #item="{ item, props }">
            <v-list-item v-bind="props" class="text-start">
              <template #prepend><u-currency-icon :currency="GetCurrency(item.raw.currency)" small class="me-3" /></template>
              <template #subtitle>
                <span dir="ltr">{{ item.raw.account_number }}</span>
                <span class="d-block">{{ $t('add_shop.guided.wallet_balance') }}: <u-price :amount="item.raw.balance - item.raw.locked" :currency="item.raw.currency" /></span>
              </template>
            </v-list-item>
          </template>
        </v-select>
        <p v-if="busy_creation_wallets" class="b-shop-add__fee-message" role="status">{{ $t('add_shop.guided.wallet_loading') }}</p>
        <div v-else-if="creation_wallets_error" class="b-shop-add__fee-message" role="alert">
          <span>{{ $t('add_shop.guided.wallet_error') }}</span>
          <v-btn class="sd-modern-button sd-modern-button--compact" color="primary" variant="text" @click="fetchCreationWallets">{{ $t('add_shop.guided.retry') }}</v-btn>
        </div>
        <p v-else-if="!creation_wallets.length" class="b-shop-add__fee-message">{{ $t('add_shop.guided.wallet_empty') }}</p>
        <p v-else-if="!creation_account" class="b-shop-add__fee-message">{{ $t('add_shop.guided.wallet_choose') }}</p>
      </template>
      <p v-if="busy_creation_fee" class="b-shop-add__fee-message">{{ $t('add_shop.guided.fee_loading') }}</p>
      <template v-else-if="creation_fee_error">
        <p class="b-shop-add__fee-message b-shop-add__fee-error" role="alert"><v-icon size="16" color="error" aria-hidden="true">error_outline</v-icon><span>{{ $t(creation_conversion_unavailable ? 'add_shop.guided.wallet_quote_error' : 'add_shop.guided.fee_error') }}</span></p>
        <v-btn class="sd-modern-button sd-modern-button--compact" color="primary" variant="text" @click="getCreationFee">
          <v-icon start aria-hidden="true">refresh</v-icon>{{ $t('add_shop.guided.retry') }}
        </v-btn>
      </template>
      <template v-else-if="creation_fee_matches_wallet">
        <p class="b-shop-add__fee-message">{{ $t('add_shop.guided.fee_wallet', { currency: creation_fee.currency }) }}</p>
        <p class="b-shop-add__fee-message">
          {{ $t('add_shop.guided.wallet_balance') }}: <u-price :amount="creation_fee.available_balance" :currency="creation_fee.currency" />
        </p>
        <p v-if="!creation_fee.can_pay" class="b-shop-add__fee-message b-shop-add__fee-error" role="alert"><v-icon size="16" color="warning" aria-hidden="true">account_balance_wallet</v-icon><span>{{ $t('add_shop.guided.wallet_insufficient') }}</span></p>
      </template>
      <p v-if="creation_quote_changed" class="b-shop-add__fee-message" role="alert">{{ $t('add_shop.guided.quote_changed') }}</p>
      <v-btn v-if="creation_fee?.charged_from_wallet" :to="{ name: 'BPageShuttleWalletAccounts' }" target="_blank" rel="noopener noreferrer" variant="text" color="primary" class="sd-modern-button sd-modern-button--inline b-shop-add__wallet-manage">
        {{ $t('add_shop.guided.wallet_manage') }}<v-icon end size="15" aria-hidden="true">north_east</v-icon>
      </v-btn>
    </section>
    <div
      v-if="step === 0"
      key="slide-0"
      :class="modern ? 'sd-modern-widget b-shop-add__panel' : 'widget-box mb-5'"
    >
      <div :class="{ 'sd-modern-title b-shop-add__heading': modern }">
        <span v-if="modern" class="sd-modern-icon sd-modern-icon--plain">
          <v-icon aria-hidden="true">{{ guided ? 'business_center' : 'store_mall_directory' }}</v-icon>
        </span>
        <div>
          <u-widget-header
            :class="{ 'sd-modern-form-header': modern }"
            :title="$t('admin_shop.edit.info.title_tab.title')"
            :icon="modern ? undefined : 'store_mall_directory'"
          />
          <v-list-subheader :class="{ 'b-shop-add__subtitle': modern }">
            <span>{{ $t(guided ? 'add_shop.guided.title_subtitle' : 'admin_shop.edit.info.title_tab.subtitle') }}</span>
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
        :label="`${$t(guided ? 'add_shop.guided.business_name_label' : 'add_shop.title_input')}*`"
        :hint="guided ? undefined : $t('admin_shop.edit.info.title_input_message')"
        :messages="guided ? $t('add_shop.guided.title_message') : undefined"
        :placeholder="guided ? $t('add_shop.guided.title_placeholder') : 'e.g. Serenity Spa & Wellness'"
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
        :label="guided ? $t('add_shop.guided.language_label') : undefined"
        :messages="$t(guided ? 'add_shop.guided.language_message' : 'add_shop.language_input_message')"
        max-width="unset"
        :persistent-placeholder="modern"
        :class="{ 'sd-modern-underlined-field': modern }"
        :disabled="readOnly"
      >
      </u-language-input>
      </div>

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
            <span>{{ $t(guided ? 'add_shop.guided.name_subtitle' : 'admin_shop.edit.info.name_tab.subtitle') }}</span>
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
          <v-icon>{{ guided ? 'content_copy' : 'fa:fas fa-copy' }}</v-icon>
          <v-tooltip v-if="modern" activator="parent" content-class="sd-modern-tooltip text-start" location="top">
            {{ $t('global.actions.copy') }}
          </v-tooltip>
        </v-btn>
      </div>
      <p v-if="guided" class="b-shop-add__domain-message">
        <v-icon size="15" aria-hidden="true">info_outline</v-icon>
        <span>{{ $t('add_shop.guided.domain_message') }}</span>
      </p>
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
    <p v-if="guided && (shop || step === 0)" class="b-shop-add__step-note">
      {{ $t('add_shop.guided.step_label', { step: step + 1, total: shop ? 5 : 2 }) }}
    </p>
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
        {{ $t(guided && step === 0 ? 'global.actions.cancel' : 'global.actions.back') }}
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
        <v-icon v-if="guided" start aria-hidden="true">save</v-icon>
        {{
          step === 4 ? $t("global.actions.finish") : $t("global.actions.save")
        }}

        <v-icon v-if="!guided && step !== 4" class="ms-2" size="small">
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
      <v-btn
        v-if="!shop && step > 0"
        :class="{ disabled: !name || !title || !language, 'sd-modern-button sd-modern-button--form b-shop-add__save': modern, 'm-2': !modern }"
        :loading="busy_add_shop"
        :disabled="guided && (!name || !title.trim() || !language || busy_add_shop || !can_create_with_fee)"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="addShop()"
      >
        <v-icon class="me-2" aria-hidden="true">{{ guided ? 'add' : 'check' }}</v-icon>
        {{ $t("add_shop.create_shop_action") }}
      </v-btn>
      <v-btn
        v-if="!shop && step === 0"
        :class="{ disabled: !title || !language, 'sd-modern-button sd-modern-button--form b-shop-add__save': modern, 'm-2': !modern }"
        :disabled="guided && (!title.trim() || !language)"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="goNext()"
      >
        <v-icon v-if="guided" start aria-hidden="true">{{ $t('icons.arrow_end') }}</v-icon>
        {{ $t(guided ? 'add_shop.guided.continue_action' : 'global.actions.next') }}

        <v-icon v-if="!guided" class="ms-2" size="small">
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </div>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Google search preview ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div :class="{ 'b-shop-add__preview-layout': guided }">
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
            <h2 class="sd-modern-title-text">{{ $t(guided ? 'add_shop.guided.search_title' : 'global.commons.seo_preview') }}</h2>
            <p v-if="!guided" class="b-shop-add__subtitle">{{ $t('admin_shop.edit.info.seo_preview_subtitle') }}</p>
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

      <div v-if="guided && !shop" class="b-shop-add__search-result">
        <div class="b-shop-add__search-identity">
          <span class="b-shop-add__search-initial" aria-hidden="true">{{ title.trim().charAt(0).toUpperCase() || 'S' }}</span>
          <div>
            <div>{{ title || $t('add_shop.guided.search_placeholder_title') }}</div>
            <div class="b-shop-add__search-url" dir="ltr">{{ main_service_url }}/@{{ name }}</div>
          </div>
        </div>
        <div class="b-shop-add__search-title">{{ title || $t('add_shop.guided.search_placeholder_title') }}</div>
        <p class="b-shop-add__search-description">{{ description || $t('add_shop.guided.search_placeholder_description') }}</p>
      </div>
      <div
        v-else-if="canShowGooglePreview"
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
      <p v-if="guided" class="b-shop-add__preview-message">{{ $t('add_shop.guided.search_message') }}</p>
    </div>
    </div>
    </div>
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
import UPrice from "../../../ui/price/UPrice.vue";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import CurrencyMixin from "../../../mixin/currency/CurrencyMixin.ts";
import { AccountStatus } from "@selldone/core-js/enums/wallet/AccountStatus";

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
  mixins: [UMixinConfetti, TemplateMixin, DateMixin, CurrencyMixin ],
  components: {
    UPrice,
    UCurrencyIcon,
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
    guided: Boolean,
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

    creation_fee: null,
    busy_creation_fee: false,
    creation_fee_error: false,
    creation_conversion_unavailable: false,
    creation_fee_request_id: 0,
    creation_account: null,
    creation_wallets: [],
    creation_wallets_loaded: false,
    creation_wallets_request_id: 0,
    busy_creation_wallets: false,
    creation_wallets_error: false,
    creation_quote_changed: false,

    //-------- Temporary access ----------
    force: false,
    temp_access: null,
    busy_temp_access: false,
  }),

  computed: {
    creation_fee_matches_wallet() {
      return !!this.creation_fee && (this.creation_fee.is_free || (
        !!this.creation_account &&
        this.creation_fee.account_number === this.creation_account.account_number &&
        this.creation_fee.currency === this.creation_account.currency
      ));
    },
    can_create_with_fee() {
      return !this.busy_creation_fee && !this.creation_fee_error && this.creation_fee_matches_wallet &&
        (this.creation_fee.is_free || this.creation_fee.can_pay === true);
    },
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
      if (this.guided) {
        // The creation sheet scrolls independently of the application page.
        this.$nextTick(() => this.$refs.workspace?.scrollIntoView({ block: 'start' }));
        return;
      }
      ScrollHelper.scrollToTop();
    },
  },
  created() {
    this.reassignShopInfo();
    if (this.guided && !this.shop) this.getCreationFee();
  },

  beforeUnmount() {
    this.creation_fee_request_id++;
    this.creation_wallets_request_id++;
  },

  methods: {
    async getCreationFee() {
      if (!this.guided || this.shop) return;
      const requestId = ++this.creation_fee_request_id;
      const account = this.creation_account;
      this.creation_fee_error = false;
      this.creation_conversion_unavailable = false;
      this.busy_creation_fee = true;

      try {
        const { data } = await axios.get(window.API.GET_SHOP_CREATION_FEE(), {
          params: account ? { account_number: account.account_number } : {},
        });
        if (requestId !== this.creation_fee_request_id || this.shop || !this.guided) return;
        if (
          data?.success !== true || data.error ||
          typeof data.fee !== 'number' || !Number.isFinite(data.fee) || data.fee < 0 ||
          typeof data.currency !== 'string' || !this.GetCurrency(data.currency) ||
          data.is_free !== (data.fee === 0) || data.charged_from_wallet !== (data.fee > 0) ||
          (!data.is_free && account && (
            data.account_number !== account.account_number || data.currency !== account.currency ||
            typeof data.available_balance !== 'number' || !Number.isFinite(data.available_balance) ||
            data.can_pay !== (data.available_balance >= data.fee)
          ))
        ) {
          this.creation_fee_error = true;
          this.creation_conversion_unavailable = data?.code === 'shop_creation_conversion_unavailable';
          return;
        }
        this.creation_fee = {
          fee: data.fee,
          currency: data.currency,
          is_free: data.is_free,
          charged_from_wallet: data.charged_from_wallet,
          reason: data.reason,
          account_number: data.account_number,
          available_balance: data.available_balance,
          can_pay: data.can_pay,
        };
        if (data.charged_from_wallet && !this.creation_wallets_loaded && !this.busy_creation_wallets) this.fetchCreationWallets();
      } catch {
        if (requestId === this.creation_fee_request_id && !this.shop && this.guided) this.creation_fee_error = true;
      } finally {
        if (requestId === this.creation_fee_request_id && !this.shop && this.guided) this.busy_creation_fee = false;
      }
    },

    async fetchCreationWallets() {
      if (!this.guided || this.shop || this.busy_creation_wallets) return;
      const requestId = ++this.creation_wallets_request_id;
      this.creation_wallets_error = false;
      this.busy_creation_wallets = true;
      try {
        const { data } = await axios.get(window.API.GET_ACTIVE_ACCOUNT_LIST('*'), { params: { offset: 0, limit: 100 } });
        if (this.shop || !this.guided || requestId !== this.creation_wallets_request_id) return;
        if (data?.error || !Array.isArray(data?.accounts)) throw new Error('Invalid wallet list');
        const accounts = data.accounts.filter(account => account.status === AccountStatus.Approved.code);
        if (accounts.some(account => typeof account.account_number !== 'string' || !account.account_number ||
          typeof account.currency !== 'string' || !this.GetCurrency(account.currency) ||
          !Number.isFinite(Number(account.balance)) || !Number.isFinite(Number(account.locked)))) throw new Error('Invalid wallet');
        this.creation_wallets = accounts;
        this.creation_wallets_loaded = true;
        if (!this.creation_account && accounts.length && this.creation_fee?.charged_from_wallet) {
          this.onCreationWalletChange(accounts.find(account => account.currency === 'USD') ||
            accounts.find(account => account.currency === 'EUR') || accounts[0]);
        }
      } catch {
        if (requestId === this.creation_wallets_request_id && !this.shop && this.guided) this.creation_wallets_error = true;
      } finally {
        if (requestId === this.creation_wallets_request_id && !this.shop && this.guided) this.busy_creation_wallets = false;
      }
    },

    onCreationWalletChange(account) {
      this.creation_account = account;
      this.creation_quote_changed = false;
      this.getCreationFee();
    },

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
      if (this.guided && !this.shop && step === 1) this.getCreationFee();
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
      if (this.guided && (!this.can_create_with_fee || this.busy_add_shop)) return;
      this.busy_add_shop = true;
      axios
        .post(window.API.POST_ADD_SHOP(), {
          title: this.title,
          language: this.language,
          description: this.description,
          name: this.name,
          active: this.active,
          info: this.info,
          ...(this.guided ? {
            expected_fee: this.creation_fee.fee,
            expected_currency: this.creation_fee.currency,
            ...(this.creation_fee.charged_from_wallet ? { account_number: this.creation_account.account_number } : {}),
          } : {}),
        })
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            if (this.guided && data.quote_changed) {
              this.creation_quote_changed = true;
              this.getCreationFee();
            }
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

  .b-shop-add__active {
    margin: 0;
    margin-block-start: 24px;

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

.b-shop-add--guided {
  width: 100%;
  max-width: none;
  margin: 0;

  .b-shop-add__workspace {
    display: grid;
    grid-template-columns: 145px minmax(0, 1fr);
    align-items: start;
    gap: 22px;
    padding: 22px 20px 26px;
  }

  .b-shop-add__steps {
    gap: 6px;
    padding: 0;
  }

  .b-shop-add__step {
    min-height: 44px;
    font-size: 13px;
    line-height: 20px;

    &:disabled { opacity: 0.6; }

    &[aria-current="location"] .b-shop-add__step-number {
      color: rgb(var(--v-theme-primary));
      border-color: rgb(var(--v-theme-primary));
    }
  }

  .b-shop-add__step-number {
    display: grid;
    place-items: center;
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 50%;
    font-size: 12px;
    font-weight: 400;
    line-height: 1;
  }

  .b-shop-add__content {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .b-shop-add__panel {
    min-height: 0;
    margin: 0;
    padding: 24px;
    border: 0;
    box-shadow: none;
  }

  .b-shop-add__heading {
    gap: 9px;
    margin-block-end: 25px;

    :deep(h2) {
      font-size: 17px;
      font-weight: 500;
      line-height: 24px;
      letter-spacing: -0.15px;
    }

    > .sd-modern-icon { color: var(--sd-modern-muted); }
  }

  .b-shop-add__subtitle { line-height: 20px; }

  .b-shop-add__identity-fields {
    grid-template-columns: 1fr;
    gap: 21px;
  }

  .b-shop-add__active {
    margin-block-start: 22px;

    :deep(.row-hover) {
      padding-inline: 0;
      background: transparent !important;
    }
  }

  .b-shop-add__preview-layout {
    order: 1;
    min-width: 0;
    margin-block-start: 26px;
    padding-inline: 5px;
  }

  .b-shop-add__seo { min-width: 0; margin: 0; }

  .b-shop-add__seo-heading {
    margin-block-end: 12px;

    .sd-modern-title { align-items: center; gap: 7px; }
    .sd-modern-title-text { font-size: 13px; font-weight: 500; line-height: 20px; }
    .sd-modern-icon { width: 15px; height: 20px; }
    .v-icon { font-size: 15px; }
  }

  .b-shop-add__search-result {
    padding: 17px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid var(--sd-modern-border);
    border-radius: 13px;
    overflow-wrap: anywhere;
  }

  .b-shop-add__search-identity {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-block-end: 12px;
    font-size: 12px;
    line-height: 18px;

    > div { min-width: 0; }
  }

  .b-shop-add__search-initial {
    display: grid;
    place-items: center;
    flex: 0 0 27px;
    height: 27px;
    background: var(--sd-modern-inset);
    border-radius: 8px;
    font-weight: 500;
  }

  .b-shop-add__search-url {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 16px;
    word-break: break-all;
  }

  .b-shop-add__search-title {
    margin-block-end: 5px;
    color: rgb(var(--v-theme-primary));
    font-size: 16px;
    font-weight: 400;
    line-height: 23px;
    letter-spacing: -0.15px;
  }

  .b-shop-add__search-description,
  .b-shop-add__preview-message,
  .b-shop-add__domain-message,
  .b-shop-add__step-note {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
  }

  .b-shop-add__preview-message { margin-block-start: 7px; }
  .b-shop-add__domain-message { display: flex; align-items: start; gap: 8px; margin-block-start: 18px; }

  .b-shop-add__fee { margin-block-end: 18px; padding-inline: 5px; }

  .b-shop-add__fee-label { display: flex; align-items: center; gap: 6px; }

  .b-shop-add__fee-help-amount { margin-block-end: 8px; font-size: 16px; }

  .b-shop-add__wallet-input {
    margin-block-start: 12px;
    // Rich wallet values need their full height below the floating label.
    :deep(.v-field--variant-underlined div.v-field__input) { height: auto; min-height: var(--sd-modern-field-height); }
    :deep(.v-select__selection) { width: 100%; max-width: 100%; height: auto; }
  }
  .b-shop-add__wallet-value { display: flex; align-items: center; gap: 4px 8px; flex-wrap: wrap; min-width: 0; }
  .b-shop-add__wallet-name { color: var(--sd-modern-muted); font-size: 12px; overflow-wrap: anywhere; }
  .b-shop-add__wallet-manage { margin-block-start: 8px; }

  .b-shop-add__fee-heading {
    display: flex;
    min-height: 36px;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }

  .b-shop-add__fee-amount {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    font-variant-numeric: tabular-nums;
  }

  .b-shop-add__fee-message {
    margin: 7px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }

  .b-shop-add__fee-error {
    display: flex;
    align-items: start;
    gap: 8px;
    color: rgb(var(--v-theme-on-surface));

    .v-icon { margin-block-start: 2px; }
  }

  .b-shop-add__form-actions {
    order: 2;
    margin-block: 24px 0;

    .widget-buttons { display: flex; flex-wrap: nowrap; justify-content: start; gap: 14px; }
    .b-shop-add__save { min-width: 0; margin-inline-start: auto; }
    .b-shop-add__step-note { margin-block-end: 10px; font-size: 12px; line-height: 18px; }
    :deep(.sd-modern-button) { min-height: 42px; padding-inline: 16px; font-size: 13px; line-height: 20px; border-radius: 11px; }
  }

  @media (max-width: 640px) {
    .b-shop-add__workspace { grid-template-columns: 1fr; padding: 18px; }
    .b-shop-add__steps { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .b-shop-add__panel { padding: 22px; }
  }

  @media (max-width: 640px), (pointer: coarse) {
    .b-shop-add__form-actions :deep(.sd-modern-button) { min-height: 44px; }
    .b-shop-add__fee-heading { min-height: 44px; }
  }

  @media (max-width: 390px) {
    .b-shop-add__workspace { padding: 16px 12px 20px; }
    .b-shop-add__panel { padding: 19px 17px; }
    .b-shop-add__form-actions .widget-buttons { flex-wrap: wrap; gap: 8px; }
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
