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

<template>
  <v-card
    class="b-product-vendor-editor text-start"
    flat
    @keydown.esc.stop="requestClose"
  >
    <v-card-title class="b-product-vendor-editor__top">
      <v-avatar class="b-product-vendor-editor__avatar" size="38" rounded="lg">
        <v-img
          v-if="product.icon"
          :src="getShopImagePath(product.icon, 64)"
        ></v-img>
        <v-icon v-else>inventory</v-icon>
      </v-avatar>

      <div class="b-product-vendor-editor__identity">
        <h1>{{ product.title }}</h1>
        <p v-if="product.title_en">{{ product.title_en }}</p>
        <p>
          {{ $t("vendor_product_editor.offer")
          }}<template v-if="selectedVendor?.name">
            · {{ selectedVendor.name }}</template
          >
        </p>
      </div>
      <div class="b-product-vendor-editor__top-actions">
        <span
          class="sd-modern-status sd-modern-status--plain b-product-vendor-editor__status"
          ><i
            class="sd-modern-status__dot"
            :class="
              enable
                ? 'sd-modern-status__dot--success'
                : 'sd-modern-status__dot--error'
            "
            aria-hidden="true"
          />{{
            $t(
              enable
                ? "vendor_product_editor.available"
                : "vendor_product_editor.unavailable",
            )
          }}</span
        >
        <v-btn
          class="sd-modern-icon-button"
          icon
          variant="text"
          :disabled="busy || busy_delete"
          :aria-label="$t('global.actions.close')"
          @click="requestClose"
          ><v-icon aria-hidden="true">close</v-icon
          ><v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-focus
            >{{ $t("global.actions.close") }}</v-tooltip
          ></v-btn
        >
      </div>
    </v-card-title>

    <v-card-text class="sd-modern-canvas b-product-vendor-editor__body">
      <div class="b-product-vendor-editor__workspace">
        <nav
          class="sd-modern-section-nav b-product-vendor-editor__nav"
          :aria-label="$t('vendor_product_editor.offer')"
        >
          <button
            v-for="section in sections"
            :key="section.value"
            type="button"
            class="sd-modern-section-nav__item"
            :aria-current="tab === section.value ? 'location' : undefined"
            @click="selectSection(section.value)"
          >
            <v-icon size="18" aria-hidden="true">{{ section.icon }}</v-icon
            ><span>{{ $t(section.label) }}</span>
          </button>
        </nav>
        <div class="b-product-vendor-editor__content">
          <header class="b-product-vendor-editor__heading">
            <h2 class="sd-modern-title-text">
              {{
                $t(
                  sections.find((section) => section.value === tab)?.label ||
                    "vendor_product_editor.tabs.vendor",
                )
              }}
            </h2>
            <p class="sd-modern-subtitle">
              {{
                $t(
                  "vendor_product_editor.subtitles." +
                    ["vendor", "pricing", "inventory", "critical"][tab],
                )
              }}
            </p>
          </header>
          <v-window v-model="tab" mandatory>
            <v-window-item
              :value="0"
              eager
              :transition="false"
              :reverse-transition="false"
            >
              <!-- ███████████████████ Vendor and variant identity ███████████████████ -->
              <section class="sd-modern-widget b-product-vendor-editor__widget">
                <div class="b-product-vendor-editor__widget-heading">
                  <h3>
                    <v-icon size="18" aria-hidden="true">storefront</v-icon
                    >{{ $t("vendor_product_editor.assigned") }}
                  </h3>
                  <v-btn
                    v-if="!IS_VENDOR_PANEL"
                    :to="{ name: 'BPageMarketplaceVendors' }"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="sd-modern-button sd-modern-button--inline"
                    color="primary"
                    variant="text"
                    append-icon="north_east"
                    >{{ $t("vendor_product_editor.vendors") }}</v-btn
                  >
                </div>
                <div
                  v-if="is_edit_mode || IS_VENDOR_PANEL"
                  class="b-product-vendor-editor__locked"
                >
                  <v-avatar size="32" rounded="lg"
                    ><v-img
                      v-if="selectedVendor?.icon"
                      :src="getShopImagePath(selectedVendor.icon, 128)"
                      :alt="selectedVendor.name"
                    /><v-icon v-else size="20" aria-hidden="true"
                      >storefront</v-icon
                    ></v-avatar
                  >
                  <div class="b-product-vendor-editor__vendor-identity">
                    <strong>{{
                      selectedVendor?.name || $t("global.commons.vendor")
                    }}</strong>
                  </div>
                  <v-btn
                    class="sd-modern-info-button"
                    icon
                    variant="text"
                    :aria-label="$t('vendor_product_editor.locked')"
                    ><v-icon aria-hidden="true">lock_outline</v-icon
                    ><v-tooltip
                      activator="parent"
                      location="top"
                      content-class="sd-modern-tooltip text-start"
                      open-on-focus
                      open-on-click
                      >{{ $t("vendor_product_editor.locked") }}</v-tooltip
                    ></v-btn
                  >
                </div>
                <b-vendor-input
                  v-else
                  v-model="vendor_id"
                  @update:model-value="getVendorProductVariants"
                  :default-vendor="selectedVendor"
                  :disabled="IS_VENDOR_PANEL || is_edit_mode"
                  :shop="shop"
                  :label="$t('vendor_product_editor.chooseVendor')"
                  prepend-inner-icon="storefront"
                  class="sd-modern-underlined-field"
                  @click:clear="vendor_id = null"
                  clearable
                />
              </section>
              <section
                v-if="product_variants?.length"
                class="sd-modern-widget b-product-vendor-editor__widget"
              >
                <div class="b-product-vendor-editor__widget-heading">
                  <h3>
                    <v-icon size="18" aria-hidden="true">category</v-icon
                    >{{ $t("vendor_product_editor.variant") }}
                  </h3>
                </div>
                <u-loading-progress v-if="busy_vpv" />
                <u-smart-variant
                  v-model="variant_id"
                  :disabled="
                    IS_VENDOR_PANEL ||
                    (is_edit_mode && !!vendorProduct?.variant_id)
                  "
                  :shop="shop"
                  :variants="product_variants"
                  :disableItem="(item) => added_variants_ids?.includes(item.id)"
                >
                  <template #item-append="{ item }"
                    ><span
                      v-if="added_variants_ids?.includes(item.id)"
                      class="b-product-vendor-editor__hint"
                      >{{ $t("vendor_product_editor.alreadyAssigned") }}</span
                    ></template
                  >
                </u-smart-variant>
                <p
                  v-if="is_edit_mode && vendorProduct?.variant_id"
                  class="b-product-vendor-editor__hint"
                >
                  {{ $t("vendor_product_editor.variantHelp") }}
                </p>
                <div
                  v-if="!variant_id"
                  class="sd-modern-notice b-product-vendor-editor__notice"
                >
                  <v-icon size="18" aria-hidden="true">info_outline</v-icon
                  ><span class="sd-modern-notice__content">{{
                    $t("vendor_product_editor.variantRequiredHelp")
                  }}</span>
                </div>
              </section>
              <section class="sd-modern-widget b-product-vendor-editor__widget">
                <div class="b-product-vendor-editor__widget-heading">
                  <h3>
                    <v-icon size="18" aria-hidden="true">tune</v-icon
                    >{{ $t("vendor_product_editor.availability") }}
                  </h3>
                  <v-btn
                    class="sd-modern-info-button"
                    icon
                    variant="text"
                    :aria-label="$t('vendor_product_editor.availabilityHelp')"
                    ><v-icon aria-hidden="true">info_outline</v-icon
                    ><v-tooltip
                      activator="parent"
                      location="top"
                      content-class="sd-modern-tooltip text-start"
                      open-on-focus
                      open-on-click
                      >{{
                        $t("vendor_product_editor.availabilityHelp")
                      }}</v-tooltip
                    ></v-btn
                  >
                </div>
                <u-smart-switch
                  v-model="enable"
                  class="sd-modern-smart-select"
                  border
                  :false-title="$t('vendor_product_editor.unavailable')"
                  :true-title="$t('vendor_product_editor.available')"
                  :force-show-all="false"
                  :false-description="$t('vendor_product_editor.disabledHelp')"
                  :true-description="$t('vendor_product_editor.enabledHelp')"
                  false-gray
                  false-icon="close"
                  true-icon="check"
                />
              </section>
            </v-window-item>

            <v-window-item
              :value="1"
              eager
              :transition="false"
              :reverse-transition="false"
            >
              <!-- ██████████████████ Marketplace Pricing ██████████████████ -->
              <div
                v-if="isSubscription"
                class="sd-modern-notice b-product-vendor-editor__notice"
                role="status"
              >
                <v-icon size="18" aria-hidden="true">info_outline</v-icon>
                <span class="sd-modern-notice__content">{{
                  $t("vendor_product_editor.subscription")
                }}</span>
              </div>

              <section class="sd-modern-widget b-product-vendor-editor__widget">
                <u-widget-header
                  class="sd-modern-form-header"
                  icon="price_change"
                  :title="$t('vendor_product_editor.marketPricing')"
                >
                  <template #append-title>
                    <v-btn
                      class="sd-modern-info-button"
                      icon
                      variant="text"
                      :aria-label="$t('vendor_product_editor.marketHelp')"
                    >
                      <v-icon aria-hidden="true">info_outline</v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        content-class="sd-modern-tooltip text-start"
                        open-on-focus
                        open-on-click
                        >{{ $t("vendor_product_editor.marketHelp") }}</v-tooltip
                      >
                    </v-btn>
                  </template>
                  <template #actions>
                    <v-btn
                      v-if="!IS_VENDOR_PANEL"
                      :to="{ name: 'BPageMarketplacePricings' }"
                      class="sd-modern-button sd-modern-button--inline"
                      color="primary"
                      variant="text"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ $t("vendor_product_editor.models") }}
                      <v-icon end aria-hidden="true">north_east</v-icon>
                    </v-btn>
                  </template>
                </u-widget-header>

                <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Currency ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
                <u-currency-input
                  v-model="currency"
                  :activeCurrencies="[product.currency]"
                  :disabled="product.currency !== currency || IS_VENDOR_PANEL"
                  :label="$t('vendor_product_editor.currency')"
                  :messages="$t('add_product.pricing.currency_input_messages')"
                  :return-object="false"
                  class="sd-modern-underlined-field b-product-vendor-editor__currency"
                />

                <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Calculated / manual price ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
                <div class="b-product-vendor-editor__fields">
                  <v-pricing-input
                    v-model="pricing_id"
                    v-model:default-pricing="pricing"
                    :disabled="IS_VENDOR_PANEL"
                    :shop="shop"
                    class="sd-modern-underlined-field"
                    :label="$t('vendor_product_editor.model')"
                    :placeholder="$t('vendor_product_editor.manual')"
                  />
                  <u-price-input
                    v-model="price"
                    :currency="currency"
                    :disabled="!!pricing_id || IS_VENDOR_PANEL"
                    class="sd-modern-underlined-field"
                    :label="$t('vendor_product_editor.base')"
                    required
                  />
                </div>
                <p class="b-product-vendor-editor__hint">
                  {{ $t("vendor_product_editor.modelHelp") }}
                </p>
              </section>

              <!-- ██████████████████ Vendor Pricing ██████████████████ -->
              <section class="sd-modern-widget b-product-vendor-editor__widget">
                <u-widget-header
                  class="sd-modern-form-header"
                  icon="account_balance_wallet"
                  :title="$t('vendor_product_editor.vendorPricing')"
                >
                  <template #append-title>
                    <v-btn
                      class="sd-modern-info-button"
                      icon
                      variant="text"
                      :aria-label="
                        $t('vendor_product_editor.vendorHelpPricing', {
                          currency,
                        })
                      "
                    >
                      <v-icon aria-hidden="true">info_outline</v-icon>
                      <v-tooltip
                        activator="parent"
                        location="top"
                        content-class="sd-modern-tooltip text-start"
                        open-on-focus
                        open-on-click
                        >{{
                          $t("vendor_product_editor.vendorHelpPricing", {
                            currency,
                          })
                        }}</v-tooltip
                      >
                    </v-btn>
                  </template>
                </u-widget-header>

                <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Vendor price / target price ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
                <div class="b-product-vendor-editor__fields">
                  <u-price-input
                    v-if="pricing"
                    v-model="raw_price_final_input"
                    :currency="currency"
                    :label="$t('vendor_product_editor.target')"
                    :messages="$t('vendor_product_editor.targetHelp')"
                    class="sd-modern-underlined-field b-product-vendor-editor__field--full"
                    required
                    @update:model-value="onChangeVendorTargetPrice"
                  >
                    <template #append-inner>
                      <v-avatar
                        class="b-product-vendor-editor__price-identity"
                        size="24"
                      >
                        <v-img :src="getShopImagePath(shop.icon, 96)" />
                      </v-avatar>
                    </template>
                  </u-price-input>

                  <u-price-input
                    v-model="raw_price"
                    :currency="currency"
                    :label="$t('vendor_product_editor.raw')"
                    class="sd-modern-underlined-field"
                    required
                    @update:model-value="onChangeVendorPrice"
                  >
                    <template #append-inner>
                      <v-avatar
                        class="b-product-vendor-editor__price-identity"
                        size="24"
                      >
                        <v-img :src="getShopImagePath(vendor_icon, 128)" />
                      </v-avatar>
                    </template>
                  </u-price-input>

                  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Discount amount ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
                  <u-price-input
                    v-model="discount"
                    :currency="currency"
                    :label="$t('vendor_product_editor.discount')"
                    :messages="
                      $t('vendor_product_editor.percentEquivalent', {
                        percent: discount_percent,
                      })
                    "
                    class="sd-modern-underlined-field"
                  />
                </div>
                <p class="b-product-vendor-editor__hint">
                  {{ $t("vendor_product_editor.discountHelp") }}
                </p>

                <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Extra fixed commission ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
                <div class="b-product-vendor-editor__commission">
                  <v-btn
                    v-if="!show_commission && !commission"
                    class="sd-modern-button sd-modern-button--inline"
                    color="primary"
                    variant="text"
                    @click="show_commission = true"
                  >
                    <v-icon start aria-hidden="true">add</v-icon>
                    {{ $t("vendor_product_editor.extra") }}
                  </v-btn>
                  <template v-else>
                    <u-price-input
                      v-model="commission"
                      :currency="currency"
                      :label="$t('vendor_product_editor.commission')"
                      :messages="$t('vendor_product_editor.commissionHelp')"
                      class="sd-modern-underlined-field"
                      clearable
                      required
                      @click:clear="
                        commission = 0;
                        show_commission = false;
                      "
                    />
                  </template>
                </div>

                <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Show Price Calculation ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
                <div
                  class="b-product-vendor-editor__preview"
                  :aria-label="$t('vendor_product_editor.preview')"
                  aria-live="polite"
                >
                  <div class="b-product-vendor-editor__preview-item">
                    <u-text-value-dashed>
                      <template #label
                        ><span class="b-product-vendor-editor__preview-label">
                          <v-avatar
                            class="me-1 b-product-vendor-editor__price-identity"
                            size="24"
                          >
                            <v-img :src="getShopImagePath(vendor_icon, 128)" />
                          </v-avatar>
                          {{ $t("vendor_product_editor.vendorPayment") }}
                        </span></template
                      >
                      <u-price
                        :amount="vendorPaymentCalc"
                        :currency="currency"
                        large
                      />
                    </u-text-value-dashed>
                    <p class="b-product-vendor-editor__hint">
                      {{ $t("vendor_product_editor.configured") }}
                    </p>
                  </div>
                  <div class="b-product-vendor-editor__preview-item">
                    <u-text-value-dashed>
                      <template #label
                        ><span class="b-product-vendor-editor__preview-label">
                          <v-avatar
                            class="me-1 b-product-vendor-editor__price-identity"
                            size="24"
                          >
                            <v-img :src="getShopImagePath(shop.icon, 96)" />
                          </v-avatar>
                          {{ $t("vendor_product_editor.fee") }}
                        </span></template
                      >
                      <u-price
                        :amount="marketplaceFeeCalc"
                        :currency="currency"
                        large
                      />
                    </u-text-value-dashed>
                    <p class="b-product-vendor-editor__hint">
                      {{ $t("vendor_product_editor.feeScope") }}
                    </p>
                  </div>
                  <div class="b-product-vendor-editor__preview-item">
                    <u-text-value-dashed>
                      <template #label
                        ><span class="b-product-vendor-editor__preview-label">
                          <v-icon size="20" class="me-1" aria-hidden="true"
                            >sell</v-icon
                          >
                          {{ $t("vendor_product_editor.customer") }}
                        </span></template
                      >
                      <u-price
                        :amount="calculatePrice"
                        :currency="currency"
                        large
                      />
                    </u-text-value-dashed>
                    <p class="b-product-vendor-editor__hint">
                      {{ $t("vendor_product_editor.customerScope") }}
                    </p>
                  </div>
                </div>
                <div class="b-product-vendor-editor__preview-help">
                  <v-btn
                    class="sd-modern-info-button"
                    icon
                    variant="text"
                    :aria-label="$t('vendor_product_editor.previewHelp')"
                  >
                    <v-icon aria-hidden="true">info_outline</v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                      content-class="sd-modern-tooltip text-start"
                      open-on-focus
                      open-on-click
                      >{{ $t("vendor_product_editor.previewHelp") }}</v-tooltip
                    >
                  </v-btn>
                </div>
                <div
                  v-if="
                    vendorPaymentCalc < 0 ||
                    marketplaceFeeCalc < 0 ||
                    calculatePrice < 0
                  "
                  class="sd-modern-notice b-product-vendor-editor__notice"
                  role="status"
                >
                  <v-icon size="18" aria-hidden="true">warning_amber</v-icon>
                  <span class="sd-modern-notice__content">{{
                    $t("vendor_product_editor.reviewPreview")
                  }}</span>
                </div>
              </section>

              <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Discount Period ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
              <v-expansion-panels
                :model-value="has_discount_period ? 0 : null"
                class="sd-modern-widget b-product-vendor-editor__widget b-product-vendor-editor__period"
                @update:model-value="(val) => (has_discount_period = val === 0)"
              >
                <v-expansion-panel elevation="0">
                  <v-expansion-panel-title>
                    <v-icon size="20" class="me-2" aria-hidden="true"
                      >date_range</v-icon
                    >
                    <span>{{ $t("vendor_product_editor.period") }}</span>
                    <span
                      class="sd-modern-status sd-modern-status--plain b-product-vendor-editor__period-status"
                    >
                      <i
                        v-if="discountPeriodStatus !== 'discountPeriodUnset'"
                        class="sd-modern-status__dot"
                        :class="{
                          'sd-modern-status__dot--warning':
                            discountPeriodStatus === 'discountPeriodUpcoming',
                          'sd-modern-status__dot--success':
                            discountPeriodStatus === 'discountPeriodActive',
                          'sd-modern-status__dot--error':
                            discountPeriodStatus === 'discountPeriodExpired',
                        }"
                        aria-hidden="true"
                      />
                      {{ $t("vendor_product_editor." + discountPeriodStatus) }}
                    </span>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <p class="b-product-vendor-editor__hint">
                      {{ $t("vendor_product_editor.periodToggle") }}
                    </p>
                    <div class="b-product-vendor-editor__fields">
                      <u-date-input
                        v-model="dis_start"
                        :label="$t('vendor_product_editor.start')"
                        :max="dis_end"
                        :placeholder="
                          $t('add_product.pricing.start_input_placeholder')
                        "
                        class="sd-modern-underlined-field"
                        clearable
                        prepend-inner-icon="play_arrow"
                        return-utc
                      />
                      <u-date-input
                        v-model="dis_end"
                        :disabled="!dis_start"
                        :label="$t('vendor_product_editor.end')"
                        :min="dis_start"
                        :placeholder="
                          $t('add_product.pricing.end_input_placeholder')
                        "
                        class="sd-modern-underlined-field"
                        clearable
                        prepend-inner-icon="stop"
                        return-utc
                      />
                    </div>
                    <u-time-progress-bar
                      :end-time="dis_end"
                      :start-time="dis_start"
                      class="b-product-vendor-editor__period-progress"
                      modern
                    />
                    <p class="b-product-vendor-editor__hint">
                      {{ $t("vendor_product_editor.dateHelp") }}
                      {{ $t("vendor_product_editor.clearDates") }}
                    </p>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Independent quantity pricings ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
              <template v-if="(isPhysical || isVirtual) && vendorProduct">
                <v-expansion-panels
                  class="sd-modern-widget b-product-vendor-editor__widget b-product-vendor-editor__tiers"
                >
                  <v-expansion-panel elevation="0">
                    <v-expansion-panel-title>
                      <v-icon size="20" class="me-2" aria-hidden="true"
                        >layers</v-icon
                      >
                      <span>{{ $t("vendor_product_editor.tiers") }}</span>
                      <span class="b-product-vendor-editor__tier-count">{{
                        extra_pricings?.length || 0
                      }}</span>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <p class="b-product-vendor-editor__hint">
                        {{ $t("vendor_product_editor.tiersHelp") }}
                        {{ $t("vendor_product_editor.tierRule") }}
                      </p>
                      <div
                        class="sd-modern-notice b-product-vendor-editor__notice"
                        role="status"
                      >
                        <v-icon size="18" aria-hidden="true"
                          >info_outline</v-icon
                        >
                        <span class="sd-modern-notice__content">{{
                          $t("vendor_product_editor.tiersPersist")
                        }}</span>
                      </div>

                      <extra-pricing-levels
                        v-if="extra_pricings?.length"
                        :extra-pricings="extra_pricings"
                        :original-pricing="vendorProduct"
                        :product="product"
                        class="b-product-vendor-editor__tier-levels"
                      />

                      <v-table
                        v-if="extra_pricings?.length"
                        class="sd-modern-table b-product-vendor-editor__tiers-table"
                      >
                        <thead>
                          <tr>
                            <th>{{ $t("vendor_product_editor.minQty") }}</th>
                            <th>{{ $t("global.commons.price") }}</th>
                            <th>{{ $t("global.commons.discount") }}</th>
                            <th>{{ $t("global.commons.actions") }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <b-product-extra-pricing-row
                            key="base"
                            :all-extra-pricings="extra_pricings"
                            color="#aaa"
                            :extra-pricing="vendorProduct"
                            :product="product"
                            :shop="shop"
                            :vendor="vendor"
                            :vendor-product="vendorProduct"
                            light
                            readonly
                            :message="$t('vendor_product_editor.original')"
                          >
                            <template #action>
                              <span class="b-product-vendor-editor__hint">{{
                                $t("vendor_product_editor.original")
                              }}</span>
                            </template>
                          </b-product-extra-pricing-row>
                          <b-product-extra-pricing-row
                            v-for="(extra_price, i) in extra_pricings"
                            :key="extra_price.id"
                            :all-extra-pricings="extra_pricings"
                            :color="getColor(i)"
                            :extra-pricing="extra_price"
                            :product="product"
                            :shop="shop"
                            :vendor="vendor"
                            :vendor-product="vendorProduct"
                            light
                            @onDelete="
                              (id) => {
                                DeleteItemByID(product.extra_pricings, id);
                                forceupdate();
                              }
                            "
                            @select="showEditExtraPricing(extra_price)"
                          />
                        </tbody>
                      </v-table>
                      <p v-else class="b-product-vendor-editor__hint">
                        {{ $t("vendor_product_editor.noTiers") }}
                      </p>

                      <v-btn
                        class="sd-modern-button sd-modern-button--inline b-product-vendor-editor__add-tier"
                        color="primary"
                        variant="text"
                        :disabled="
                          show_add_extra_price || extra_pricings?.length >= 10
                        "
                        @click="showAddExtraPrice"
                      >
                        <v-icon start aria-hidden="true">add</v-icon>
                        {{ $t("vendor_product_editor.addTier") }}
                      </v-btn>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>

                <!-- Quantity-tier changes persist independently of the ordinary offer draft. -->
                <b-product-extra-pricing-add
                  v-if="selected_extra_price"
                  v-model="show_add_extra_price"
                  :all-extra-pricings="extra_pricings"
                  :extra-pricing="selected_extra_price"
                  :product="product"
                  :shop="shop"
                  :variant="variant_id ? { id: variant_id } : null"
                  :vendor="vendor"
                  :vendor-product="vendorProduct"
                  light
                  @onAdd="
                    (val) => {
                      AddOrUpdateItemByID(product.extra_pricings, val);
                      forceupdate();
                    }
                  "
                  @onEdit="
                    (val) => AddOrUpdateItemByID(product.extra_pricings, val)
                  "
                />
              </template>
            </v-window-item>

            <v-window-item
              :value="2"
              eager
              :transition="false"
              :reverse-transition="false"
            >
              <!-- ███████████████████ Stock and preparation ███████████████████ -->
              <section
                v-if="!isFile"
                class="sd-modern-widget b-product-vendor-editor__widget"
              >
                <div class="b-product-vendor-editor__widget-heading">
                  <div>
                    <h3>
                      <v-icon size="18" aria-hidden="true">inventory_2</v-icon
                      >{{ $t("vendor_product_editor.stockTitle") }}
                    </h3>
                    <p>{{ $t("vendor_product_editor.stockHelp") }}</p>
                  </div>
                </div>
                <u-number-input
                  v-model="quantity"
                  :label="$t('global.commons.quantity')"
                  :min="0"
                  :step="1"
                  class="sd-modern-underlined-field"
                />
              </section>
              <div
                v-else
                class="sd-modern-notice b-product-vendor-editor__notice"
              >
                <v-icon size="18" aria-hidden="true">description</v-icon
                ><span class="sd-modern-notice__content">{{
                  $t("vendor_product_editor.fileNotice")
                }}</span>
              </div>
              <section class="sd-modern-widget b-product-vendor-editor__widget">
                <div class="b-product-vendor-editor__widget-heading">
                  <div>
                    <h3>
                      <v-icon size="18" aria-hidden="true">schedule</v-icon
                      >{{ $t("vendor_product_editor.leadTitle") }}
                    </h3>
                    <p>{{ $t("vendor_product_editor.leadHelp") }}</p>
                  </div>
                </div>
                <u-number-input
                  v-model="lead"
                  :label="$t('vendor_product_editor.lead')"
                  :messages="
                    lead === -1
                      ? $t('vendor_product_editor.dynamic')
                      : lead === 0
                        ? $t('vendor_product_editor.instant')
                        : ''
                  "
                  :min="-1"
                  :step="1"
                  :suffix="$t('product_extra_physical.lead_time_dimension')"
                  class="sd-modern-underlined-field"
                />
                <v-btn-toggle
                  v-model="lead"
                  class="b-product-vendor-editor__presets"
                  density="compact"
                  role="group"
                  :aria-label="$t('vendor_product_editor.lead')"
                  ><v-btn
                    v-for="(item, index) in leads"
                    :key="item.value"
                    :value="item.value"
                    :aria-pressed="lead === item.value"
                    variant="text"
                    >{{ $t("vendor_product_editor.presets." + index) }}</v-btn
                  ></v-btn-toggle
                >
              </section>
            </v-window-item>

            <v-window-item
              :value="3"
              eager
              :transition="false"
              :reverse-transition="false"
            >
              <!-- ███████████████████ Verified association removal ███████████████████ -->
              <section
                v-if="vendorProduct"
                class="sd-modern-widget sd-modern-critical b-product-vendor-editor__widget"
              >
                <div class="b-product-vendor-editor__widget-heading">
                  <div>
                    <h3>
                      <v-icon size="18" aria-hidden="true">gpp_maybe</v-icon
                      >{{ $t("vendor_product_editor.criticalTitle") }}
                    </h3>
                    <p>{{ $t("vendor_product_editor.criticalHelp") }}</p>
                  </div>
                </div>
                <template v-if="product.vendor_id"
                  ><div
                    class="sd-modern-notice b-product-vendor-editor__notice"
                  >
                    <v-icon size="18" aria-hidden="true">lock_outline</v-icon
                    ><span class="sd-modern-notice__content">{{
                      $t("vendor_product_editor.ownerBlock")
                    }}</span>
                  </div>
                  <p class="b-product-vendor-editor__hint">
                    {{ $t("vendor_product_editor.ownerHelp") }}
                  </p>
                  <v-btn
                    class="sd-modern-button sd-modern-button--inline"
                    color="primary"
                    variant="text"
                    prepend-icon="arrow_back"
                    @click="selectSection(0)"
                    >{{ $t("vendor_product_editor.back") }}</v-btn
                  ></template
                >
                <template v-else
                  ><button
                    type="button"
                    class="b-product-vendor-editor__disclosure"
                    :aria-expanded="critical_open"
                    @click="critical_open = !critical_open"
                  >
                    <span>{{ $t("vendor_product_editor.reviewRemoval") }}</span
                    ><v-icon size="18" aria-hidden="true">{{
                      critical_open ? "expand_less" : "expand_more"
                    }}</v-icon>
                  </button>
                  <div
                    v-show="critical_open"
                    class="b-product-vendor-editor__critical-body"
                  >
                    <u-smart-verify
                      v-model="accept_delete"
                      color="error"
                      role="checkbox"
                      tabindex="0"
                      :aria-checked="accept_delete"
                      :aria-label="$t('vendor_product_editor.criticalTitle')"
                      @keydown.space.prevent="accept_delete = !accept_delete"
                      @keydown.enter.prevent="accept_delete = !accept_delete"
                      :true-description="$t('vendor_product_editor.verify')"
                      :true-title="$t('vendor_product_editor.criticalTitle')"
                    />
                    <div class="b-product-vendor-editor__remove">
                      <v-btn
                        class="sd-modern-button sd-modern-button--danger"
                        color="error"
                        variant="elevated"
                        prepend-icon="delete"
                        :disabled="!canRemove"
                        :loading="busy_delete"
                        @click="requestRemove"
                        >{{ $t("vendor_product_editor.remove") }}</v-btn
                      >
                    </div>
                  </div></template
                >
              </section>
            </v-window-item>
          </v-window>
        </div>
      </div>
    </v-card-text>

    <v-card-actions class="b-product-vendor-editor__footer">
      <span class="b-product-vendor-editor__feedback">{{
        isDirty ? $t("vendor_product_editor.unsaved") : ""
      }}</span>
      <v-btn
        class="sd-modern-button"
        variant="outlined"
        prepend-icon="close"
        :disabled="busy || busy_delete"
        @click="requestClose"
        >{{ $t("global.actions.close") }}</v-btn
      >
      <v-btn
        v-if="tab !== 3 && vendorProduct"
        class="sd-modern-button sd-modern-button--primary"
        :loading="busy"
        color="primary"
        variant="flat"
        prepend-icon="save"
        @click="updateVendor"
        >{{ $t("vendor_product_editor.save") }}</v-btn
      >
      <v-btn
        v-else-if="tab !== 3"
        class="sd-modern-button sd-modern-button--primary"
        :disabled="!!(!vendor_id || (product_variants?.length && !variant_id))"
        :loading="busy"
        color="primary"
        variant="flat"
        prepend-icon="add"
        @click="addVendorProduct"
        >{{ $t("global.actions.add") }}</v-btn
      >
    </v-card-actions>
    <v-dialog v-model="show_discard_confirmation" max-width="510"
      ><v-card
        class="sd-modern-widget b-product-vendor-editor__confirmation text-start"
        ><h2>{{ $t("vendor_product_editor.discardTitle") }}</h2>
        <p>{{ $t("vendor_product_editor.discardMessage") }}</p>
        <div class="b-product-vendor-editor__confirmation-actions">
          <v-btn
            class="sd-modern-button"
            variant="outlined"
            @click="show_discard_confirmation = false"
            >{{ $t("vendor_product_editor.keep") }}</v-btn
          ><v-btn
            class="sd-modern-button sd-modern-button--primary"
            color="primary"
            variant="flat"
            @click="discardChanges"
            >{{ $t("vendor_product_editor.discard") }}</v-btn
          >
        </div></v-card
      ></v-dialog
    >
    <v-dialog v-model="show_remove_confirmation" max-width="510"
      ><v-card
        class="sd-modern-widget b-product-vendor-editor__confirmation sd-modern-critical text-start"
        ><h2>{{ $t("vendor_product_editor.confirmRemoveTitle") }}</h2>
        <p>{{ $t("vendor_product_editor.confirmRemoveMessage") }}</p>
        <div class="b-product-vendor-editor__confirmation-actions">
          <v-btn
            class="sd-modern-button"
            variant="outlined"
            @click="show_remove_confirmation = false"
            >{{ $t("global.actions.cancel") }}</v-btn
          ><v-btn
            class="sd-modern-button sd-modern-button--danger"
            color="error"
            variant="elevated"
            prepend-icon="delete"
            :disabled="!canRemove"
            :loading="busy_delete"
            @click="remove"
            >{{ $t("vendor_product_editor.remove") }}</v-btn
          >
        </div></v-card
      ></v-dialog
    >
  </v-card>
</template>

<script lang="ts">
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import BVendorInput from "../../../vendor/input/BVendorInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UDateInput from "../../../../ui/date/input/UDateInput.vue";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import USmartVariant from "../../../../ui/smart/variant/USmartVariant.vue";
import ExtraPricingLevels from "../../../extra-pricing/ExtraPricingLevels.vue";
import BProductExtraPricingAdd from "../../../product/extra-pricings/add/BProductExtraPricingAdd.vue";
import BProductExtraPricingRow from "../../../product/extra-pricings/row/BProductExtraPricingRow.vue";
import { standardDesignColor } from "@selldone/core-js/helper/color/ColorGenerator";
import { PriceHelper } from "@selldone/core-js/helper/price/PriceHelper.ts";
import VPricingInput from "../../../../storefront/pricing/VPricingInput.vue";
import { DateConverter } from "@selldone/core-js";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import ULoadingProgress from "@selldone/components-vue/ui/loading/progress/ULoadingProgress.vue";

export default {
  name: "BProductVendorAdd",
  mixins: [ProductMixin, CurrencyMixin],
  inject: ["$product"],
  components: {
    ULoadingProgress,
    BProductExtraPricingRow,
    BProductExtraPricingAdd,
    ExtraPricingLevels,
    USmartVariant,
    USmartVerify,
    VPricingInput,
    UNumberInput,
    UTextValueDashed,
    UTimeProgressBar,
    UDateInput,
    UPriceInput,
    UCurrencyInput,
    BVendorInput,
    USmartSwitch,
  },
  props: {
    shop: {
      required: true,
    },
    vendor: {
      /*Used only in vendor panel!*/
    },
    product: {
      required: true,
    },

    vendorProduct: {
      // Edit mode
      required: false,
      type: Object,
    },
  },
  data: () => ({
    tab: 0,
    critical_open: false,
    show_remove_confirmation: false,
    show_discard_confirmation: false,
    initial_draft: null,

    busy: false,
    busy_delete: false,

    vendor_id: null,
    variant_id: null,

    pricing_id: null,
    enable: true,
    raw_price: 0,
    raw_price_final_input: 0,

    price: 0,

    currency: "USD",
    commission: 0,

    discount: 0,
    dis_start: null,
    dis_end: null,
    quantity: 10,
    lead: -1,

    has_discount_period: false,

    show_commission: false,

    leads: [
      { value: -1, title: "Unknown" },
      { value: 0, title: "Instant" },
      { value: 8, title: "8 hours" },
      { value: 24, title: "1 day" },
      { value: 3 * 24, title: "3 day" },
      { value: 7 * 24, title: "1 week" },
    ],

    pricing: null, // Current selected pricing!

    //--------------------------------------------
    accept_delete: false,

    //🌸 extra pricing 🌸
    show_add_extra_price: false,
    selected_extra_price: null,

    random: 0, //Fix update issue!

    //--------------------------------------------
    //Show only available variants for vendor.
    busy_vpv: false,
    added_variants_ids: [],
  }),
  computed: {
    selectedVendor() {
      return this.IS_VENDOR_PANEL ? this.vendor : this.vendorProduct?.vendor;
    },
    sections() {
      return [
        {
          value: 0,
          label: "vendor_product_editor.tabs.vendor",
          icon: "storefront",
        },
        {
          value: 1,
          label: "vendor_product_editor.tabs.pricing",
          icon: "price_change",
        },
        {
          value: 2,
          label: "vendor_product_editor.tabs.inventory",
          icon: "inventory_2",
        },
        ...(this.vendorProduct
          ? [
              {
                value: 3,
                label: "vendor_product_editor.tabs.critical",
                icon: "gpp_maybe",
              },
            ]
          : []),
      ];
    },
    draftSnapshot() {
      const timestamp = (value) =>
        value ? DateConverter.convertToLocalTime(value)?.getTime() : null;
      return JSON.stringify([
        this.vendor_id,
        this.variant_id,
        this.pricing_id,
        this.enable,
        this.raw_price,
        this.price,
        this.currency,
        this.commission,
        this.discount,
        timestamp(this.dis_start),
        timestamp(this.dis_end),
        this.quantity,
        this.lead,
      ]);
    },
    isDirty() {
      return (
        this.initial_draft !== null && this.initial_draft !== this.draftSnapshot
      );
    },
    canRemove() {
      return !!(
        this.vendorProduct &&
        !this.product.vendor_id &&
        this.tab === 3 &&
        this.critical_open &&
        this.accept_delete &&
        !this.busy &&
        !this.busy_delete
      );
    },
    discountPeriodStatus() {
      if (!this.dis_start && !this.dis_end) return "discountPeriodUnset";
      const now = Date.now();
      const start =
        this.dis_start &&
        DateConverter.convertToLocalTime(this.dis_start)?.getTime();
      const end =
        this.dis_end &&
        DateConverter.convertToLocalTime(this.dis_end)?.getTime();
      if (Number.isFinite(end) && now > end) return "discountPeriodExpired";
      if (Number.isFinite(start) && now <= start)
        return "discountPeriodUpcoming";
      return "discountPeriodActive";
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    is_finished_discount() {
      return (
        (this.dis_start || this.dis_end) &&
        !DateConverter.inBetweenDates(
          new Date(),
          DateConverter.convertToLocalTime(this.dis_start),
          DateConverter.convertToLocalTime(this.dis_end),
        )
      );
    },

    vendor_icon() {
      return this.vendor?.icon
        ? this.vendor.icon
        : this.vendorProduct?.vendor?.icon;
    },

    is_edit_mode() {
      return !!this.vendorProduct;
    },

    isFile() {
      return this.product && this.product.type === ProductType.FILE.code;
    },
    isPhysical() {
      return this.product && this.product.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.product && this.product.type === ProductType.VIRTUAL.code;
    },
    isSubscription() {
      return (
        this.product && this.product.type === ProductType.SUBSCRIPTION.code
      );
    },

    product_variants() {
      return this.product.product_variants;
    },
    discount_percent() {
      const percent = this.discountProductPercent(
        this.shop,
        {
          price: this.price,
          currency: this.currency,
          commission: this.commission,
          discount: this.discount,
        },
        null,
        this.currency,
      );
      return Number.isFinite(percent) ? percent : 0;
    },

    calculatePrice() {
      return this.priceProductByCurrency(
        this.shop,
        {
          price: this.price,
          currency: this.currency,
          commission: this.commission,
          discount: this.discount,
          dis_start: this.dis_start,
          dis_end: this.dis_end,
        },
        null,
        this.currency,
      );
    },

    vendorPaymentCalc() {
      return this.priceProductByCurrency(
        this.shop,
        {
          price: this.raw_price,
          currency: this.currency,
          commission: 0,
          discount: this.discount,
        },
        null,
        this.currency,
      );
    },
    marketplaceFeeCalc() {
      return this.commission + this.price - this.raw_price;
    },

    // 🌸 extra pricing 🌸
    extra_pricings() {
      const random = this.random; //Fix update issue!
      return this.product?.extra_pricings?.filter(
        (x) => x.vendor_product_id === this.vendorProduct.id,
      );
    },
  },

  watch: {
    tab() {
      this.resetRemoval();
    },
    critical_open(value) {
      if (!value) {
        this.accept_delete = false;
        this.show_remove_confirmation = false;
      }
    },
    show_remove_confirmation(value) {
      if (!value) this.accept_delete = false;
    },
    "product.vendor_id"() {
      this.resetRemoval();
    },
    IS_VENDOR_PANEL() {
      this.resetRemoval();
    },
    vendorProduct() {
      this.assign();
    },

    has_discount_period(value) {
      if (!value) {
        this.dis_start = null;
        this.dis_end = null;
      }
    },

    pricing() {
      if (this.pricing)
        this.price = PriceHelper.FixPrecision(
          this.raw_price * (1 + this.pricing.commission / 100),
          this.GetCurrency(this.currency)?.floats,
        );
    },

    price() {
      this.raw_price_final_input = this.price;
    },
  },

  created() {
    this.assign();
  },

  methods: {
    selectSection(value) {
      if (this.sections.some((section) => section.value === value))
        this.tab = value;
    },
    resetRemoval() {
      this.accept_delete = false;
      this.critical_open = false;
      this.show_remove_confirmation = false;
    },
    requestClose() {
      if (this.busy || this.busy_delete) return;
      this.resetRemoval();
      if (this.isDirty) this.show_discard_confirmation = true;
      else this.$emit("close");
    },
    discardChanges() {
      this.show_discard_confirmation = false;
      this.assign();
      this.$emit("close");
    },
    requestRemove() {
      if (this.canRemove) this.show_remove_confirmation = true;
    },
    onChangeVendorTargetPrice(val) {
      if (this.pricing) {
        this.raw_price = PriceHelper.FixPrecision(
          val / (1 + this.pricing.commission / 100),
          this.GetCurrency(this.currency)?.floats,
        );
        this.onChangeVendorPrice();
      } else {
        this.raw_price = val;
        this.price = val;
      }
      this.raw_price_final_input = this.price;
    },

    onChangeVendorPrice() {
      if (this.pricing)
        this.price = PriceHelper.FixPrecision(
          this.raw_price * (1 + this.pricing.commission / 100),
          this.GetCurrency(this.currency)?.floats,
        );
    },
    //――――――――――――――――――――――― Edit Vendor ―――――――――――――――――――――――

    assign() {
      this.resetRemoval();
      this.show_discard_confirmation = false;
      this.initial_draft = null;
      if (this.vendorProduct) {
        this.vendor_id = this.vendorProduct.vendor_id;
        this.variant_id = this.vendorProduct.variant_id;

        this.pricing_id = this.vendorProduct.pricing_id;
        this.enable = this.vendorProduct.enable;
        this.raw_price = this.vendorProduct.raw_price;
        this.price = this.vendorProduct.price;
        this.currency = this.vendorProduct.currency;
        this.commission = this.vendorProduct.commission;
        this.discount = this.vendorProduct.discount;
        this.dis_start = this.vendorProduct.dis_start;
        this.dis_end = this.vendorProduct.dis_end;
        this.quantity = this.vendorProduct.quantity;
        this.lead = this.vendorProduct.lead;

        this.pricing = this.vendorProduct.pricing;
        this.accept_delete = false;

        this.has_discount_period =
          !!this.vendorProduct.dis_start || !!this.vendorProduct.dis_end;
      } else {
        this.resetToDefault(); // 🞇 Reset to default

        if (this.vendor?.pricing_id) this.pricing_id = this.vendor?.pricing_id; // Only in the vendor panel we have vendor. Set default pricing of vendor! (Set by marketplace owner)

        this.variant_id = null;

        this.currency = this.product.currency;

        this.price = this.product.price;
        this.raw_price = this.product.price;
        this.commission = this.product.commission;
        this.discount = this.product.discount;
        this.dis_start = this.product.dis_start;
        this.dis_end = this.product.dis_end;
        this.lead = this.product.lead;
      }
      // Native price/date controls finish normalizing their values before the baseline.
      this.$nextTick(() => {
        this.initial_draft = this.draftSnapshot;
      });
    },

    addVendorProduct() {
      if (this.IS_VENDOR_PANEL) {
        NotificationService.showWarningAlert(null, "Not supported!");
        return;
      }
      this.busy = true;

      axios
        .post(
          window.API.POST_ADD_PRODUCT_VENDOR(this.shop.id, this.product.id),
          {
            vendor_id: this.vendor_id,
            variant_id: this.variant_id,

            pricing_id: this.pricing_id,
            enable: this.enable,

            raw_price: this.raw_price,
            price: this.price,
            currency: this.currency,
            commission: this.commission,

            discount: this.discount,
            dis_start: this.dis_start,
            dis_end: this.dis_end,
            quantity: this.quantity,
            lead: this.lead,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            // 🥎 Update product: (NEW)
            if (data.vendor_product.product) {
              Object.assign(this.product, data.vendor_product.product);
            }
            // 🥎 Update variant:
            if (data.vendor_product.variant) {
              this.AddOrUpdateItemByID(
                this.product.product_variants,
                data.vendor_product.variant,
              );
            }

            this.$emit("add", data.vendor_product);
            this.$emit("add-vendor", data.vendor);

            this.$emit("close");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    updateVendor() {
      this.busy = true;

      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_INVENTORY_UPDATE_PRODUCT(
                this.$route.params.vendor_id,
                this.vendorProduct.id,
              )
            : window.API.PUT_EDIT_PRODUCT_VENDOR(
                this.shop.id,
                this.product.id,
                this.vendorProduct.id,
              ),
          {
            vendor_id: this.vendor_id, // Can not change!
            variant_id: this.variant_id, // Can not change!

            pricing_id: this.pricing_id,
            enable: this.enable,

            raw_price: this.raw_price,
            price: this.price,
            currency: this.currency,
            commission: this.commission,

            discount: this.discount,
            dis_start: this.dis_start,
            dis_end: this.dis_end,
            quantity: this.quantity,
            lead: this.lead,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            // 🥎 Update product: (NEW)
            if (data.vendor_product.product) {
              Object.assign(this.product, data.vendor_product.product);
            }
            // 🥎 Update variant:
            if (data.vendor_product.variant) {
              this.AddOrUpdateItemByID(
                this.product.product_variants,
                data.vendor_product.variant,
              );
            }

            this.$emit("update", data.vendor_product);
            this.$emit("close");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    remove() {
      // Recheck the current resource and verified intent at the destructive boundary.
      if (!this.show_remove_confirmation || !this.canRemove) return;
      this.show_remove_confirmation = false;
      this.busy_delete = true;

      axios
        .delete(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_MY_VENDOR__INVENTORY_PRODUCT(
                this.$route.params.vendor_id,
                this.vendorProduct.id,
              )
            : window.API.DELETE_PRODUCT_VENDOR(
                this.shop.id,
                this.product.id,
                this.vendorProduct.id,
              ),
        )
        .then(({ data }) => {
          if (!data.error) {
            // 🥎 Update product:
            if (data.product) {
              Object.assign(this.product, data.product);
            }
            // 🥎 Update variant:
            if (data.variant) {
              this.AddOrUpdateItemByID(
                this.product.product_variants,
                data.variant,
              );
            }

            this.$emit("remove", data.id);
            this.$emit("close");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy_delete = false;
        });
    },

    //━━━━━━━━━━━━━━━━━━━━━ 🌸 extra pricing 🌸 ━━━━━━━━━━━━━━━━━━━━━
    showAddExtraPrice() {
      const max_minimum_quantity = this.extra_pricings?.maxByKey("min");
      this.selected_extra_price = {
        min: (max_minimum_quantity?.min ? max_minimum_quantity.min : 1) * 10,

        raw_price: this.vendorProduct.raw_price,
        price: this.vendorProduct.price,
        commission: this.vendorProduct.commission,
        discount: this.vendorProduct.discount,
        dis_start: this.vendorProduct.dis_start,
        dis_end: this.vendorProduct.dis_end,
      };
      this.show_add_extra_price = true;
    },

    showEditExtraPricing(extra_price) {
      this.selected_extra_price = extra_price;
      this.show_add_extra_price = true;
    },

    forceupdate() {
      this.random = Math.random();
    },
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getColor(i) {
      return standardDesignColor[i % standardDesignColor.length];
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getVendorProductVariants() {
      this.added_variants_ids = [];

      if (!this.vendor_id || this.is_edit_mode) return;

      this.busy_vpv = true;

      const params = {
        sortBy: "id",
        vendor_id: this.vendor_id,
      };

      const handleSuccessResponse = ({ vendor_products }) => {
        this.added_variants_ids = vendor_products.map((v) => v.variant_id);

        if (
          this.variant_id &&
          this.added_variants_ids.includes(this.variant_id)
        )
          this.variant_id = null;
      };

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.product.vendor
            // .optimize(60)
            .list(
              this.$route.params.vendor_id,
              this.$product.id,
              0,
              100,
              params,
            )
        : window.$backoffice.product.vendor
            // .optimize(60)
            .list(this.shop.id, this.$product.id, 0, 100, params)
      )

        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_vpv = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-vendor-editor {
  // The native header/footer sit outside the modern canvas, as in other editor shells.
  --sd-modern-border: rgba(var(--v-theme-on-surface), 0.09);
  --sd-modern-muted: rgba(var(--v-theme-on-surface), 0.66);
  --sd-modern-inset: rgba(var(--v-theme-on-surface), 0.025);
  --sd-modern-icon-button-size: 33px;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  &__top {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 22px 24px;
    min-height: 96px;
    flex-shrink: 0;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__avatar {
    flex-shrink: 0;
    background: var(--sd-modern-inset);
  }
  &__identity {
    flex: 1;
    min-width: 0;
  }
  &__top-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  &__identity h1 {
    margin: 0;
    font-family: inherit;
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  &__identity p {
    margin: 2px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
    white-space: normal;
  }
  &__status.sd-modern-status {
    font-size: 13px;
    white-space: nowrap;
  }
  &.v-card > &__body.v-card-text {
    flex: 1 1 auto;
    min-height: 0;
    padding: 0;
    overflow-y: auto;
  }
  &__workspace {
    display: grid;
    grid-template-columns: 170px minmax(0, 1fr);
    gap: 30px;
    width: 100%;
    max-width: 1280px;
    margin-inline: auto;
    padding: 28px 24px 32px;
  }
  &__nav.sd-modern-section-nav {
    align-self: start;
    display: flex;
    flex-direction: column;
    gap: 6px;
    position: sticky;
    top: 28px;
  }
  &__nav .sd-modern-section-nav__item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 43px;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    border-radius: 9px;
  }
  &__nav .sd-modern-section-nav__item:last-child:not(:first-child) {
    margin-block-start: 10px;
  }
  &__content {
    width: 100%;
    max-width: 760px;
    min-width: 0;
    margin-inline: auto;
  }
  &__heading {
    margin-block-end: 19px;
  }
  &__heading .sd-modern-title-text {
    font-size: 19px;
    line-height: 27px;
    font-weight: 500;
    letter-spacing: 0;
  }
  &__heading .sd-modern-subtitle {
    margin: 6px 0 0;
    font-size: 13px;
    line-height: 20px;
  }
  &__widget.sd-modern-widget {
    padding: 22px;
    margin-block-end: 18px;
    border: 0;
    border-radius: 16px;
    box-shadow: none;
  }
  &__widget-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-block-end: 19px;
  }
  &__widget-heading h3 {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }
  &__widget-heading h3 > .v-icon {
    color: var(--sd-modern-muted);
  }
  &__widget-heading p {
    margin: 5px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
  &__widget-heading > .sd-modern-button--inline {
    flex-shrink: 0;
  }
  &__locked {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  &__locked strong {
    display: block;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  &__vendor-identity {
    flex: 1;
    min-width: 0;
  }
  &__locked .sd-modern-info-button {
    margin-inline-start: auto;
  }
  &__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px 18px;
  }
  &__fields > * {
    min-width: 0;
  }
  &__field--full {
    grid-column: 1 / -1;
  }
  &__widget :deep(.v-field__input) {
    font-family: inherit;
    font-size: 14px;
    line-height: 22px;
  }
  &__widget :deep(.v-label) {
    font-family: inherit;
  }
  &__widget :deep(.s--smart-verify:focus-visible) {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 4px;
  }
  &__widget :deep(.v-input__details),
  &__hint {
    font-size: 13px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  &__hint {
    margin: 9px 0 0;
  }
  &__widget .sd-modern-form-header {
    margin-block-end: 19px;
  }
  &__widget .sd-modern-form-header :deep(h2) {
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }
  &__widget .sd-modern-form-header :deep(.--icon) {
    font-size: 18px;
    color: var(--sd-modern-muted);
  }
  &__widget .sd-modern-form-header :deep(.v-list-subheader) {
    min-height: 0;
    margin-block-start: 5px;
    padding: 0;
    font-size: 13px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  &__currency {
    margin-block-end: 20px;
  }
  &__commission {
    margin-block-start: 18px;
    text-align: end;
  }
  &__commission .sd-modern-underlined-field {
    text-align: start;
  }
  &__price-identity {
    flex-shrink: 0;
  }
  &__preview {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    padding-block-start: 23px;
    margin-block-start: 24px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__preview-item {
    min-width: 0;
  }
  &__preview-item :deep(.s--value-dashed) {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
    padding: 0;
  }
  &__preview-label {
    display: flex;
    align-items: center;
    min-height: 24px;
    gap: 4px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
  &__preview-item :deep(.dashed-flex-space) {
    display: none;
  }
  &__preview-item :deep(.u--price.large) {
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  &__preview-item :deep(.u--price .small) {
    font-size: inherit !important;
    font-weight: inherit;
  }
  &__preview-item .b-product-vendor-editor__hint {
    font-size: 13px;
    line-height: 20px;
    margin-block-start: 3px;
  }
  &__preview-help {
    display: flex;
    justify-content: flex-end;
    margin-block-start: 8px;
  }
  &__notice.sd-modern-notice {
    margin-block: 16px;
    font-size: 13px;
    line-height: 20px;
  }
  &__period.sd-modern-widget {
    padding: 0;
    overflow: visible;
  }
  &__period :deep(.v-expansion-panel) {
    border-radius: 16px;
    background: rgb(var(--v-theme-surface));
  }
  &__period :deep(.v-expansion-panel-title) {
    padding: 22px;
    font-size: 14px;
    line-height: 20px;
  }
  &__period :deep(.v-expansion-panel-text__wrapper) {
    padding: 0 22px 22px;
  }
  &__period-status {
    margin-inline: auto 12px;
    font-size: 13px;
  }
  &__period-progress {
    margin-block: 18px 7px;
  }
  &__tier-count {
    color: var(--sd-modern-muted);
    font-size: 13px;
  }
  &__tier-levels {
    margin: 20px auto;
    max-width: 280px;
  }
  &__tiers-table {
    --sd-modern-table-font-size: 13px;
    margin-block: 18px;
  }
  &__tiers-table :deep(.v-table__wrapper) {
    overflow: auto;
  }
  &__tiers-table :deep(td) {
    overflow-wrap: anywhere;
  }
  &__tiers-table :deep(.u--price .small) {
    font-size: inherit !important;
  }
  &__add-tier {
    margin-block-start: 20px;
  }
  &__presets {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 6px;
    height: auto;
    min-height: 0;
    width: 100%;
    margin-block-start: 18px;
    padding: 6px;
    overflow: visible;
    border-radius: 14px;
    background: rgba(var(--v-theme-on-surface), 0.04);
  }
  &__presets :deep(> .v-btn) {
    min-height: 44px;
    min-width: 0;
    height: auto;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: 8px !important;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    font-family: inherit;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0;
    text-transform: none;
  }
  &__presets :deep(> .v-btn--active) {
    background: rgb(var(--v-theme-surface));
    border-color: var(--sd-modern-border);
    box-shadow: 0 2px 5px rgba(var(--v-theme-on-surface), 0.08);
  }
  &__presets :deep(> .v-btn--active > .v-btn__overlay) {
    opacity: 0 !important;
  }
  &__presets :deep(> .v-btn:focus-visible) {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
  &__disclosure {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0;
    color: inherit;
    background: transparent;
    border: 0;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  &__disclosure:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 5px;
  }
  &__critical-body {
    margin-block-start: 23px;
  }
  &__remove {
    display: flex;
    justify-content: flex-end;
    margin-block-start: 24px;
  }
  &__footer.v-card-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 12px;
    flex-shrink: 0;
    min-height: 80px;
    padding: 16px 24px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__footer.v-card-actions > .v-btn ~ .v-btn {
    margin-inline-start: 0;
  }
  &__feedback {
    margin-inline-end: auto;
    font-size: 13px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  &__feedback:empty {
    display: none;
  }
  &__confirmation.sd-modern-widget {
    padding: 22px;
    font-family: inherit;
  }
  &__confirmation h2 {
    margin: 0;
    font-size: 20px;
    line-height: 28px;
    font-weight: 500;
  }
  &__confirmation p {
    margin: 7px 0 22px;
    font-size: 13px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  &__confirmation-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
  }
  .sd-modern-button {
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
}
@media (max-width: 760px) {
  .b-product-vendor-editor {
    &__top {
      padding: 18px 16px;
    }
    &__top-actions {
      gap: 8px;
    }
    &__workspace {
      display: block;
      padding: 22px 16px 28px;
    }
    &__nav.sd-modern-section-nav {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
      margin-block-end: 24px;
      position: static;
    }
    &__nav .sd-modern-section-nav__item {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      gap: 9px;
      padding: 10px 12px;
      min-height: 44px;
      font-size: 13px;
      line-height: 20px;
      text-align: start;
    }
    &__nav .sd-modern-section-nav__item:last-child:not(:first-child) {
      margin: 0;
    }
    &__widget.sd-modern-widget {
      padding: 22px;
    }
    &__widget-heading {
      flex-wrap: wrap;
      gap: 12px;
    }
    &__widget-heading > .sd-modern-button--inline {
      margin-inline-start: 27px;
    }
    &__preview {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    &__preview-item :deep(.s--value-dashed) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    &__period.sd-modern-widget {
      padding: 0;
    }
    &__period :deep(.v-expansion-panel-title) {
      padding: 22px;
    }
    &__period :deep(.v-expansion-panel-text__wrapper) {
      padding: 0 22px 22px;
    }
    &__footer.v-card-actions {
      padding: 16px;
    }
    &__widget :deep(input) {
      font-size: 16px;
    }
    &__confirmation.sd-modern-widget {
      padding: 22px 19px;
    }
  }
}
@media (max-width: 600px) {
  .b-product-vendor-editor {
    &__fields {
      grid-template-columns: minmax(0, 1fr);
    }
    &__widget.sd-modern-widget {
      padding: 20px 16px;
    }
    &__period.sd-modern-widget {
      padding: 0;
    }
    &__feedback {
      flex: 1 1 100%;
    }
  }
}
@media (max-width: 600px) {
  .b-product-vendor-editor__presets {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 360px) {
  .b-product-vendor-editor__presets {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
