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
  <v-card class="text-start" flat>
    <v-card-title class="d-flex align-center">
      <v-avatar class="me-2" rounded>
        <v-img
          v-if="product.icon"
          :src="getShopImagePath(product.icon, 64)"
        ></v-img>
        <v-icon v-else>inventory</v-icon>
      </v-avatar>

      <div class="text-start">
        {{ product.title }}
        <small class="d-block">{{ product.title_en }}</small>
      </div>
    </v-card-title>

    <v-card-text>
      <u-tabs-floating
        v-model="tab"
        :items="[
          { title: 'Vendor', icon: 'storefront' },
          { title: 'Pricing', icon: 'price_change' },
          { title: 'Inventory', icon: 'inventory' },
          ...(vendorProduct
            ? [{ title: 'Critical zone', icon: 'lock_outline' }]
            : []),
        ]"
      ></u-tabs-floating>
      <v-window v-model="tab" direction="vertical" mandatory>
        <v-window-item :value="0">
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Vendor ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div class="widget-box mb-5">
            <u-widget-header
              :add-caption="!IS_VENDOR_PANEL ? 'Add new vendor' : undefined"
              :to="{ name: 'BPageMarketplaceVendors' }"
              add-text
              icon="admin_panel_settings"
              title="Vendor"
            >
            </u-widget-header>
            <v-list-subheader>
              Each product item is linked to a specific vendor. Every vendor
              must have a vendor-product record, which stores pricing and
              inventory information.
            </v-list-subheader>
            <b-vendor-input
              v-model="vendor_id"
              :default-vendor="
                IS_VENDOR_PANEL
                  ? vendor
                  : vendorProduct
                    ? vendorProduct.vendor
                    : null
              "
              :disabled="IS_VENDOR_PANEL || is_edit_mode"
              :shop="shop"
              prepend-inner-icon="business"
              @click:clear="vendor_id = null"
              clearable
            ></b-vendor-input>
          </div>

          <div class="widget-box mb-5">
            <u-widget-header icon="tune" title="Configuration">
            </u-widget-header>
            <v-list-subheader
              >Set the status of the vendor-product.
            </v-list-subheader>
            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Variant ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <template v-if="product_variants && product_variants.length">
              <u-smart-variant
                v-model="variant_id"
                :disabled="
                  IS_VENDOR_PANEL ||
                  (is_edit_mode &&
                    !!vendorProduct?.variant_id) /*Variant not selected!*/
                "
                :shop="shop"
                :variants="product_variants"
                class="my-3"
              ></u-smart-variant>
              <v-expand-transition>
                <div v-if="!variant_id">
                  <div class="py-3">
                    <v-icon class="me-1">report_problem</v-icon>
                    <b>Please select a variant!</b> Please make sure to select a
                    variant! For multi-variant products, you need to assign a
                    vendor-product to each variant individually.
                  </div>
                </div>
              </v-expand-transition>
            </template>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Enable ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <u-smart-switch
              v-model="enable"
              :false-title="$t('global.commons.disable')"
              :force-show-all="false"
              :true-title="$t('global.commons.enable')"
              class="my-3"
              false-description="Hide this vendor from customers for this product."
              false-gray
              false-icon="close"
              true-description="This vendor is available for customers to choose when purchasing this product."
              true-icon="check"
            ></u-smart-switch>
          </div>
        </v-window-item>

        <v-window-item :value="1">
          <!-- ██████████████████ Marketplace Pricing ██████████████████ -->

          <div class="widget-box mb-5">
            <u-widget-header
              :add-caption="!IS_VENDOR_PANEL ? 'Add new pricing' : undefined"
              :to="{ name: 'BPageMarketplacePricings' }"
              add-text
              icon="price_change"
              title="Marketplace pricing"
            >
            </u-widget-header>
            <v-list-subheader>
              {{
                isSubscription
                  ? "The subscription pricing is determined in the Product > Inventory > Subscription Price tab. You can set these pricing options here just to keep accounting, but the marketplace pricing does not affect the price of the listing and the final cost of the subscription."
                  : "It's the price of the product sales in your marketplace."
              }}
            </v-list-subheader>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Currency ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <u-currency-input
              v-model="currency"
              :activeCurrencies="[product.currency]"
              :disabled="product.currency !== currency || IS_VENDOR_PANEL"
              :label="$t('add_product.pricing.currency_input')"
              :messages="$t('add_product.pricing.currency_input_messages')"
              :return-object="false"
              class="sm-suffix price-input"
            />

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ price (Calculated / Manual price) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
            <v-pricing-input
              v-model="pricing_id"
              v-model:default-pricing="pricing"
              :disabled="IS_VENDOR_PANEL"
              :shop="shop"
              class="border-start-thick-green ps-2 ms-n1 mb-0"
              style="border-width: 2px !important"
              messages="Auto calculated price based on the pricing model."
            ></v-pricing-input>

            <v-icon color="green" size="26" class="ms-n4 me-1 rotate-90-s"
              >private_connectivity
            </v-icon>
            <small>{{ $t("global.commons.or") }}</small>

            <u-price-input
              v-model="price"
              :currency="currency"
              :disabled="!!pricing_id || IS_VENDOR_PANEL"
              class="sm-suffix price-input strong-field border-start-thick-green ps-2 ms-n1 mt-0"
              style="border-width: 2px !important"
              label="Marketplace price"
              required
              messages="Manually set selling price."
            />
          </div>

          <!-- ██████████████████ Vendor Pricing ██████████████████ -->

          <div class="widget-box mb-5">
            <u-widget-header icon="price_change" title="Vendor pricing">
            </u-widget-header>
            <v-list-subheader>
              It is the amount you will pay the vendor for each item sold.
              Vendor pricing is used to simplify auditing and keeping financial
              records.
            </v-list-subheader>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Raw price (Vendor price) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <template v-if="pricing">
              <u-price-input
                v-model="raw_price_final_input"
                :currency="currency"
                :label="'Customer price'"
                hint="Vendor price + Marketplace fee"
                class="sm-suffix price-input strong-field border-start-thick-green ps-2 ms-n1 mb-0"
                style="border-width: 2px !important"
                required
                @update:model-value="onChangeVendorTargetPrice"
              >
                <template v-slot:append-inner>
                  <v-avatar class="avatar-gradient -thin -shop mb-1" size="24">
                    <v-img :src="getShopImagePath(shop.icon, 96)" />
                  </v-avatar>
                </template>
              </u-price-input>

              <v-icon color="green" size="26" class="ms-n4 me-1 rotate-90-s"
                >private_connectivity
              </v-icon>
              <small>{{ $t("global.commons.or") }}</small>
            </template>

            <u-price-input
              v-model="raw_price"
              :currency="currency"
              :label="'Vendor price'"
              :class="{ 'border-start-thick-green ps-2 ms-n1 mt-0': pricing }"
              class="sm-suffix price-input strong-field"
              style="border-width: 2px !important"
              required
              @update:model-value="onChangeVendorPrice"
            >
              <template v-slot:append-inner>
                <v-avatar class="avatar-gradient -thin -vendor mb-1" size="24">
                  <v-img :src="getShopImagePath(vendor_icon, 128)" />
                </v-avatar>
              </template>
            </u-price-input>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Commission  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <v-slide-y-transition leave-absolute>
              <div
                v-if="!show_commission && !commission"
                class="price-input my-0 text-end"
              >
                <v-btn
                  class="tnt"
                  size="small"
                  variant="text"
                  @click="show_commission = true"
                >
                  <v-icon class="me-1" size="small">add</v-icon>
                  Add extra commission for marketplace
                </v-btn>
              </div>
            </v-slide-y-transition>
            <v-slide-y-reverse-transition hide-on-leave>
              <div v-if="show_commission || commission">
                <u-price-input
                  v-model="commission"
                  :currency="currency"
                  :label="$t('add_product.pricing.commission_input')"
                  class="sm-suffix price-input strong-field px-2"
                  clearable
                  hide-details
                  required
                  @click:clear="
                    commission = 0;
                    show_commission = false;
                  "
                />

                <div class="small price-input text-justify">
                  <v-icon class="me-1" color="amber" size="small">info</v-icon>
                  This commission will be added to final price for customer.
                  Market place fee will be <b>Commission</b> + ( <b>Price</b> -
                  <b>Vendor price</b>)
                </div>
              </div>
            </v-slide-y-reverse-transition>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Discount  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <u-price-input
              v-model="discount"
              :currency="currency"
              :label="$t('add_product.pricing.discount_input')"
              :messages="`${$t(
                'add_product.pricing.discount_input_message',
              )}: ${discount_percent}%  [This discount will be deducted from vendor's price]`"
              class="sm-suffix price-input strong-field"
            />

            <div class="text-center line-height-normal d-flex align-center">
              <div
                class="flex-grow-1 mx-3"
                style="border-bottom: dashed thin #fff"
              ></div>

              <div
                class="flex-grow-1 mx-3"
                style="border-bottom: dashed thin #fff"
              ></div>
            </div>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Show Price Calculation  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div class="text-center my-3">
              <u-text-value-dashed class="my-1">
                <template v-slot:label>
                  <v-avatar
                    class="avatar-gradient -thin -vendor me-1"
                    size="24"
                  >
                    <v-img :src="getShopImagePath(vendor_icon, 128)" />
                  </v-avatar>

                  Vendor payment
                </template>
                <u-price
                  :amount="vendorPaymentCalc"
                  :class="{ 'text-danger': vendorPaymentCalc <= 0 }"
                  :currency="currency"
                  large
                >
                </u-price>
              </u-text-value-dashed>

              <u-text-value-dashed class="my-1">
                <template v-slot:label>
                  <v-avatar class="me-1 avatar-gradient -thin -shop" size="24">
                    <v-img :src="getShopImagePath(shop.icon, 96)" />
                  </v-avatar>
                  Marketplace fee
                </template>
                <u-price
                  :amount="marketplaceFeeCalc"
                  :class="{ 'text-danger': marketplaceFeeCalc <= 0 }"
                  :currency="currency"
                  large
                >
                </u-price>
              </u-text-value-dashed>

              <u-text-value-dashed class="my-1">
                <template v-slot:label>
                  <v-icon class="me-1">sell</v-icon>
                  Customer price
                </template>
                <u-price
                  :amount="calculatePrice"
                  :class="{ 'text-danger': calculatePrice <= 0 }"
                  :currency="currency"
                  large
                >
                </u-price>
              </u-text-value-dashed>
            </div>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Discount Period ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <v-expansion-panels
              :model-value="has_discount_period ? 0 : null"
              :style="
                has_discount_period ? 'border-top: solid medium #f23' : ''
              "
              style="border-radius: 18px; overflow: hidden"
              @update:model-value="(val) => (has_discount_period = val === 0)"
            >
              <v-expansion-panel
                :style="{ 'background-color': '#eee' }"
                elevation="0"
              >
                <v-expansion-panel-title color="transparent">
                  <v-icon class="flex-grow-0 me-1"
                    >{{
                      has_discount_period ? "check_circle" : "panorama_fish_eye"
                    }}
                  </v-icon>
                  <span class="flex-grow-1">{{
                    $t("add_product.pricing.has_discount_period_input")
                  }}</span>

                  <v-chip
                    v-if="is_finished_discount"
                    color="#000"
                    size="small"
                    variant="flat"
                  >
                    {{ $t("global.commons.finished") }}
                  </v-chip>
                </v-expansion-panel-title>
                <v-expansion-panel-text color="transparent">
                  <p class="text-start">
                    <v-icon>arrow_drop_down</v-icon>
                    {{ $t("add_product.pricing.discount_timespan") }}
                  </p>

                  <u-date-input
                    v-model="dis_start"
                    :label="$t('add_product.pricing.start_input')"
                    :max="dis_end"
                    :placeholder="
                      $t('add_product.pricing.start_input_placeholder')
                    "
                    class="mt-2"
                    clearable
                    color="#C2185B"
                    prepend-inner-icon="play_arrow"
                    return-utc
                  />
                  <u-date-input
                    v-model="dis_end"
                    :disabled="!dis_start"
                    :label="$t('add_product.pricing.end_input')"
                    :min="dis_start"
                    :placeholder="
                      $t('add_product.pricing.end_input_placeholder')
                    "
                    class="mt-2"
                    clearable
                    color="#C2185B"
                    prepend-inner-icon="stop"
                    return-utc
                  />

                  <u-time-progress-bar
                    :end-time="dis_end"
                    :start-time="dis_start"
                    class="my-2"
                  />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Extra pricings ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
            <!-- ▀▀▀▀▀▀▀▀▀ 🌸 Add extra pricing 🌸 ▀▀▀▀▀▀▀▀▀ -->
            <template v-if="(isPhysical || isVirtual) && vendorProduct">
              <div
                :class="{ disabled: show_add_extra_price }"
                class="widget-buttons"
              >
                <v-btn
                  color="primary"
                  size="x-large"
                  variant="text"
                  @click="showAddExtraPrice"
                >
                  <div>
                    <b class="d-block">
                      <v-icon start>add</v-icon>
                      {{ $t("add_product.pricing.extra_pricings.title") }}</b
                    >
                    <div class="x-small">
                      {{ $t("add_product.pricing.extra_pricings.subtitle") }}
                    </div>
                  </div>
                </v-btn>
              </div>
              <!-- ▀▀▀▀▀▀▀▀▀ 🌸 Add extra pricing 🌸 ▀▀▀▀▀▀▀▀▀ -->
              <extra-pricing-levels
                v-if="extra_pricings?.length"
                :extra-pricings="extra_pricings"
                :original-pricing="vendorProduct"
                :product="product"
                class="max-w-250 mx-auto"
              ></extra-pricing-levels>
              <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

              <v-table
                v-if="extra_pricings?.length"
                class="max-widget-width mx-auto bg-transparent"
              >
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>Min Qty</th>
                      <th>
                        {{ $t("global.commons.price") }}
                      </th>
                      <th>
                        {{ $t("global.commons.discount") }}
                      </th>
                      <th></th>
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
                      message="Original Pricing"
                    >
                      <template v-slot:action>
                        <div class="text-center text-muted">
                          Original Pricing
                        </div>
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
                    ></b-product-extra-pricing-row>
                  </tbody>
                </template>
              </v-table>

              <!-- Extra pricing add/edit dialog -->

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
              ></b-product-extra-pricing-add>
            </template>
          </div>
        </v-window-item>

        <v-window-item :value="2">
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Quantity  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div v-if="!isFile" class="widget-box mb-5">
            <u-widget-header
              icon="inventory"
              title="Vendor Inventory"
            ></u-widget-header>
            <v-list-subheader
              >Assign product inventory. Each vendor maintains their own stock.
            </v-list-subheader>

            <u-number-input
              v-model="quantity"
              :label="$t('global.commons.quantity')"
              :min="0"
              :step="1"
              class="my-3 strong-field"
            />
          </div>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Lead time  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div class="widget-box mb-5">
            <u-widget-header
              :title="$t('product_extra_physical.lead_time_title')"
              icon="pending_actions"
            ></u-widget-header>
            <v-list-subheader>
              Define the product preparation lead time. It helps determine
              fulfillment duration and delivery time.
            </v-list-subheader>
            <u-number-input
              v-model="lead"
              :label="$t('product_extra_physical.lead_time')"
              :messages="
                lead === -1
                  ? 'Dynamic lead time'
                  : lead === 0
                    ? 'Instant delivery'
                    : ''
              "
              :min="-1"
              :step="1"
              :suffix="$t('product_extra_physical.lead_time_dimension')"
              class="my-3 sm-suffix"
            />

            <v-btn-toggle
              v-model="lead"
              class="widget-toggle my-3"
              density="compact"
              rounded
              selected-class="blue-flat "
            >
              <v-btn
                v-for="it in leads"
                :key="it.value"
                :value="it.value"
                variant="flat"
              >
                {{ $t(it.title) }}
              </v-btn>
            </v-btn-toggle>
          </div>
        </v-window-item>

        <v-window-item :value="3">
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Delete  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div v-if="vendorProduct" class="widget-box mb-5">
            <u-widget-header
              :title="$t('global.commons.critical_zone')"
              icon="block"
            >
            </u-widget-header>

            <div v-if="!product.vendor_id">
              <u-smart-verify
                v-model="accept_delete"
                class="my-3"
                color="red"
                true-description="I wish to remove the association between this vendor and product."
                true-title="Remove Vendor ⬌ Product"
              ></u-smart-verify>

              <div class="widget-buttons">
                <v-btn
                  :class="{ disabled: !accept_delete }"
                  :loading="busy_delete"
                  color="red"
                  size="x-large"
                  @click="remove"
                >
                  <v-icon class="me-1">remove</v-icon>
                  Remove vendor for the product
                </v-btn>
              </div>
            </div>

            <div v-else class="py-3">
              Deleting the vendor ⬌ product relationship is not possible here as
              the product was created by the vendor and the vendor is considered
              its owner. If this is a variant, you can clear this by removing
              the variant in the inventory tab.
            </div>
          </div>
        </v-window-item>
      </v-window>
    </v-card-text>

    <v-card-actions>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="$emit('close')">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="vendorProduct"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="updateVendor"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <v-btn
          v-else
          :disabled="
            !!(!vendor_id || (product_variants?.length && !variant_id))
          "
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="addVendorProduct"
        >
          <div class="d-flex flex-column">
            <div>
              <v-icon start>add</v-icon>
              {{ $t("global.actions.add") }}
            </div>

            <div v-if="!vendor_id" class="small">
              <v-icon class="me-1 blink-me" size="small">report_problem</v-icon>
              <b>Please select a vendor!</b>
            </div>
            <div
              v-else-if="product_variants?.length && !variant_id"
              class="small"
            >
              <v-icon class="me-1 blink-me" size="small">report_problem</v-icon>
              <b>Please select a variant!</b>
            </div>
          </div>
        </v-btn>
      </div>
    </v-card-actions>
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
import UTabsFloating from "../../../../ui/tab/floating/UTabsFloating.vue";
import BProductExtraPricingRow from "../../../product/extra-pricings/row/BProductExtraPricingRow.vue";
import { standardDesignColor } from "@selldone/core-js/helper/color/ColorGenerator";
import { PriceHelper } from "@selldone/core-js/helper/price/PriceHelper.ts";
import VPricingInput from "../../../../storefront/pricing/VPricingInput.vue";
import { DateConverter } from "@selldone/core-js";

export default {
  name: "BProductVendorAdd",
  components: {
    BProductExtraPricingRow,
    UTabsFloating,
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
  }),
  computed: {
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
      return this.discountProductPercent(
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
    onChangeVendorTargetPrice(val) {
      if (this.pricing) {
        this.raw_price = PriceHelper.FixPrecision(
          val / (1 + this.pricing.commission / 100),
          this.GetCurrency(this.currency)?.floats,
        );
      } else {
        this.raw_price = val;
      }
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
    },

    addVendorProduct() {
      if (this.IS_VENDOR_PANEL) {
        this.showWarningAlert(null, "Not supported!");
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
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    remove() {
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
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
  },
};
</script>

<style scoped></style>
