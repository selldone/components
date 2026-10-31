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
  <div
    :class="{
      'b-product-edit-price--modern sd-modern-form text-start': modern,
      'b-product-edit-price--workspace': workspaceMode,
      'b-product-edit-price--variant-form': variantFormMode,
    }"
  >
    <template v-if="workspaceMode">
      <section
        v-if="isMarketplace || isSubscription"
        class="sd-modern-widget b-product-edit-price__workspace-notice"
      >
        <b-product-edit-info-icon name="Info" />
        <div>
          <h2>
            {{
              $t(
                isSubscription
                  ? "add_product.pricing.modern.subscription_title"
                  : "add_product.pricing.vendor.title",
              )
            }}
          </h2>
          <p>
            {{
              $t(
                isSubscription
                  ? "add_product.pricing.modern.subscription_help"
                  : "add_product.pricing.vendor.subtitle",
              )
            }}
          </p>
          <v-btn
            v-if="isSubscription || !IS_VENDOR_PANEL"
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            color="primary"
            :to="{
              name: isSubscription
                ? 'BPageProductInventory'
                : 'BPageProductVendors',
              params: { product_id: product.id },
            }"
            >{{
              $t(
                isSubscription
                  ? "add_product.pricing.modern.manage_plans"
                  : "add_product.pricing.vendor.manage_vendors",
              )
            }}</v-btn
          >
          <p
            v-if="isMarketplace && product.vendor_id"
            v-html="
              $t(
                variant
                  ? 'add_product.pricing.vendor.vendor_variant_pricing_link'
                  : 'add_product.pricing.vendor.vendor_product_pricing_link',
              )
            "
          />
        </div>
      </section>
      <section class="sd-modern-widget b-product-edit-price__workspace-card">
        <header v-if="!variantFormMode" class="b-product-edit-price__workspace-heading">
          <b-product-edit-info-icon name="Coins" />
          <div>
            <h2>{{ $t("add_product.pricing.workspace.selling_title") }}</h2>
            <p>{{ $t("add_product.pricing.workspace.selling_intro") }}</p>
          </div>
          <v-btn
            class="sd-modern-icon-button sd-modern-info-button"
            icon
            variant="text"
            :aria-label="$t('add_product.pricing.workspace.selling_about')"
            ><b-product-edit-info-icon name="Info" :size="16" /><v-tooltip
              activator="parent"
              location="top"
              :open-on-click="true"
              content-class="sd-modern-tooltip text-start"
              >{{ $t("add_product.pricing.workspace.selling_help") }}</v-tooltip
            ></v-btn
          >
        </header>
        <div v-if="isService" class="b-product-edit-price__workspace-service">
          <h3>{{ $t("add_product.pricing.workspace.pricing_method") }}</h3>
          <v-radio-group
            v-model="pricing"
            :disabled="workspaceBusy"
            :inline="$vuetify.display.smAndUp"
            :aria-label="$t('add_product.pricing.workspace.pricing_method')"
            @update:model-value="setValue('pricing', pricing)"
            ><v-radio
              v-for="mode in available_pricing"
              :key="mode.code"
              :label="$t(mode.title)"
              :value="mode.code"
          /></v-radio-group>
          <div class="b-product-edit-price__workspace-method">
            <v-img :src="PricingTypes[pricing]?.image" max-width="200" />
            <p>{{ $t(PricingTypes[pricing]?.message) }}</p>
          </div>
        </div>
        <div class="b-product-edit-price__workspace-layout">
          <div class="b-product-edit-price__workspace-fields">
            <div class="b-product-edit-price__workspace-grid">
              <u-currency-input
                v-if="!variantFormMode"
                v-model="currency"
                :active-currencies="shop.currencies"
                :disabled="workspaceBusy"
                :label="$t('add_product.pricing.currency_input')"
                :messages="$t('add_product.pricing.workspace.currency_help')"
                class="sd-modern-underlined-field"
                return-object
                @update:model-value="setValue('currency', currency.code)"
              />
              <u-price-input
                v-model="price"
                :currency="currencyObject"
                :disabled="workspaceBusy"
                :label="$t('add_product.pricing.workspace.base_price')"
                :messages="$t('add_product.pricing.workspace.base_help')"
                class="sd-modern-underlined-field"
                required
                @update:model-value="setValue('price', price)"
              />
            </div>
            <p class="b-product-edit-price__workspace-note">
              <template v-if="variantFormMode">
                <u-currency-icon :currency="product.currency" small flag />
                <bdi>{{ product.currency }}</bdi>
                <span>{{ $t("add_product.pricing.modern.currency_help") }}</span>
              </template>
              <template v-else>
                <b-product-edit-info-icon name="CircleDollarSign" :size="15" />{{
                  $t("add_product.pricing.workspace.amounts_help")
                }}
              </template>
            </p>
          </div>
          <aside
            class="b-product-edit-price__workspace-receipt"
            :aria-label="
              $t('add_product.pricing.workspace.calculation_preview')
            "
          >
            <p class="b-product-edit-price__workspace-receipt-label">
              {{
                $t(
                  pricing === PricingTypes.FIX.code || variant
                    ? "add_product.pricing.workspace.after_discount"
                    : "add_product.pricing.workspace.starting_after_discount",
                )
              }}
            </p>
            <u-price
              :amount="calculatePrice"
              :currency="currency"
              class="b-product-edit-price__workspace-total"
            />
            <p
              v-if="price_label"
              class="b-product-edit-price__workspace-price-label"
            >
              {{ price_label }}
            </p>
            <dl class="b-product-edit-price__workspace-lines">
              <div>
                <dt>{{ $t("add_product.pricing.workspace.base_price") }}</dt>
                <dd><u-price :amount="price" :currency="currency" /></dd>
              </div>
              <div v-if="commission">
                <dt>{{ $t("add_product.pricing.commission_input") }}</dt>
                <dd>+ <u-price :amount="commission" :currency="currency" /></dd>
              </div>
              <div v-if="discount">
                <dt>{{ $t("add_product.pricing.discount_input") }}</dt>
                <dd>− <u-price :amount="discount" :currency="currency" /></dd>
              </div>
            </dl>
            <p
              v-if="discount && has_discount_period"
              class="b-product-edit-price__workspace-period-state"
            >
              <span
                class="sd-modern-status__dot"
                :class="
                  discountPeriodStatus === 'active'
                    ? 'sd-modern-status__dot--success'
                    : 'sd-modern-status__dot--warning'
                "
              />{{
                $t(
                  "add_product.pricing.workspace.period_" +
                    discountPeriodStatus,
                )
              }}
            </p>
            <p
              v-if="discount && has_discount_period"
              class="b-product-edit-price__workspace-receipt-help"
            >
              {{ $t("add_product.pricing.workspace.schedule_preview") }}
            </p>
          </aside>
        </div>
        <p
          v-if="calculatePrice < 0"
          class="sd-modern-notice b-product-edit-price__workspace-error"
          role="alert"
        >
          <b-product-edit-info-icon name="CircleAlert" :size="16" class="sd-modern-notice__icon" /><span class="sd-modern-notice__content">{{
            $t("add_product.pricing.workspace.negative_total")
          }}</span>
        </p>
      </section>

      <details
        class="sd-modern-widget sd-modern-disclosure b-product-edit-price__workspace-disclosure"
      >
        <summary class="sd-modern-disclosure__summary">
          <b-product-edit-info-icon name="BadgePercent" /><span
            class="b-product-edit-price__workspace-summary"
            ><span>{{
              $t("add_product.pricing.workspace.discount_title")
            }}</span
            ><small>{{ discountDigest }}</small></span
          ><b-product-edit-info-icon name="ChevronDown" :size="16" />
        </summary>
        <div class="b-product-edit-price__workspace-disclosure-body">
          <div class="b-product-edit-price__workspace-subtitle">
            <p>{{ $t("add_product.pricing.workspace.discount_intro") }}</p>
            <v-btn
              class="sd-modern-icon-button sd-modern-info-button"
              icon
              variant="text"
              :aria-label="$t('add_product.pricing.workspace.discount_about')"
              ><b-product-edit-info-icon name="Info" :size="16" /><v-tooltip
                activator="parent"
                location="top"
                :open-on-click="true"
                content-class="sd-modern-tooltip text-start"
                >{{
                  $t("add_product.pricing.workspace.discount_help")
                }}</v-tooltip
              ></v-btn
            >
          </div>
          <div class="b-product-edit-price__workspace-discount">
            <u-price-input
              v-model="discount"
              :currency="currencyObject"
              :disabled="workspaceBusy"
              :label="$t('add_product.pricing.workspace.discount_amount')"
              class="sd-modern-underlined-field"
              @update:model-value="setValue('discount', discount)"
            />
            <p>
              <strong>{{ discount_percent }}%</strong
              ><span>{{
                $t("add_product.pricing.workspace.equivalent_discount")
              }}</span>
            </p>
          </div>
          <div v-if="discount" class="b-product-edit-price__workspace-schedule">
            <u-smart-toggle
              v-model="has_discount_period"
              :disabled="workspaceBusy"
              accessible
              false-gray
              :true-title="$t('add_product.pricing.workspace.limit_period')"
              :false-title="$t('add_product.pricing.workspace.limit_period')"
              :true-description="
                $t('add_product.pricing.workspace.period_help')
              "
              :false-description="
                $t('add_product.pricing.workspace.period_help')
              "
            />
            <div v-if="has_discount_period">
              <div
                class="b-product-edit-price__workspace-grid b-product-edit-price__workspace-dates"
              >
                <u-date-input
                  ref="workspaceStartDate"
                  v-model="dis_start"
                  :disabled="workspaceBusy"
                  :label="$t('add_product.pricing.start_input')"
                  :max="dis_end"
                  class="sd-modern-underlined-field"
                  clearable
                  return-utc
                  @update:model-value="setValue('dis_start', dis_start)"
                /><u-date-input
                  ref="workspaceEndDate"
                  v-model="dis_end"
                  :disabled="workspaceBusy || !dis_start"
                  :label="$t('add_product.pricing.end_input')"
                  :min="dis_start"
                  class="sd-modern-underlined-field"
                  clearable
                  return-utc
                  @update:model-value="setValue('dis_end', dis_end)"
                />
              </div>
              <u-time-progress-bar
                :created-time="created_at"
                :end-time="dis_end"
                :start-time="dis_start"
              />
              <p class="b-product-edit-price__workspace-date-help">
                {{ $t("add_product.pricing.workspace.local_dates") }}
              </p>
              <p
                v-if="invalidWorkspaceDates"
                class="sd-modern-notice b-product-edit-price__workspace-error"
                role="alert"
              >
                {{ $t("add_product.pricing.workspace.invalid_dates") }}
              </p>
            </div>
          </div>
          <p v-else class="b-product-edit-price__workspace-note">
            {{ $t("add_product.pricing.workspace.add_discount_schedule") }}
          </p>
        </div>
      </details>

      <details
        class="sd-modern-widget sd-modern-disclosure b-product-edit-price__workspace-disclosure"
      >
        <summary class="sd-modern-disclosure__summary">
          <b-product-edit-info-icon name="Settings2" /><span
            class="b-product-edit-price__workspace-summary"
            ><span>{{ $t("add_product.pricing.workspace.details_title") }}</span
            ><small>{{ additionalDigest }}</small></span
          ><b-product-edit-info-icon name="ChevronDown" :size="16" />
        </summary>
        <div class="b-product-edit-price__workspace-disclosure-body">
          <div class="b-product-edit-price__workspace-subtitle">
            <p>{{ $t("add_product.pricing.workspace.details_intro") }}</p>
            <v-btn
              class="sd-modern-icon-button sd-modern-info-button"
              icon
              variant="text"
              :aria-label="$t('add_product.pricing.workspace.details_about')"
              ><b-product-edit-info-icon name="Info" :size="16" /><v-tooltip
                activator="parent"
                location="top"
                :open-on-click="true"
                content-class="sd-modern-tooltip text-start"
                >{{
                  $t("add_product.pricing.workspace.details_help")
                }}</v-tooltip
              ></v-btn
            >
          </div>
          <div class="b-product-edit-price__workspace-grid">
            <u-price-input
              v-model="commission"
              :currency="currencyObject"
              :disabled="workspaceBusy"
              :label="$t('add_product.pricing.commission_input')"
              :messages="$t('add_product.pricing.workspace.commission_help')"
              class="sd-modern-underlined-field"
              clearable
              @update:model-value="setValue('commission', commission)"
              @click:clear="
                commission = 0;
                setValue('commission', 0);
              "
            /><v-text-field
              v-model="price_label"
              :disabled="workspaceBusy"
              :label="$t('add_product.pricing.price_label_input')"
              :messages="$t('add_product.pricing.workspace.label_help')"
              class="sd-modern-underlined-field"
              clearable
              counter="32"
              maxlength="32"
              placeholder="($1.5/Fl Oz)"
              variant="underlined"
              @update:model-value="setValue('price_label', price_label)"
              @click:clear="
                price_label = null;
                setValue('price_label', null);
              "
            />
          </div>
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            color="primary"
            :to="{ name: 'BPageShopFinanceTax' }"
            ><template #prepend
              ><b-product-edit-info-icon name="Gavel" :size="16" /></template
            >{{ $t("shop_tax.tax_setting") }}</v-btn
          >
        </div>
      </details>

      <details
        v-if="(isPhysical || isVirtual) && !isMarketplace"
        class="sd-modern-widget sd-modern-disclosure b-product-edit-price__workspace-disclosure"
      >
        <summary class="sd-modern-disclosure__summary">
          <b-product-edit-info-icon name="Layers" /><span
            class="b-product-edit-price__workspace-summary"
            ><span>{{
              $t("add_product.pricing.workspace.quantity_title")
            }}</span
            ><small>{{ quantityDigest }}</small></span
          ><span class="b-product-edit-price__workspace-count">{{
            $t("add_product.pricing.workspace.tier_count", {
              count: extra_pricings_to_show?.length || 0,
            })
          }}</span
          ><b-product-edit-info-icon name="ChevronDown" :size="16" />
        </summary>
        <div class="b-product-edit-price__workspace-disclosure-body">
          <p v-if="variantFormMode && !variant?.id" class="b-product-edit-price__workspace-note">
            {{ $t("b_product_inventory.editor.create_before_tiers") }}
          </p>
          <template v-else>
          <div class="b-product-edit-price__workspace-subtitle">
            <p>{{ $t("add_product.pricing.workspace.quantity_intro") }}</p>
            <v-btn
              class="sd-modern-icon-button sd-modern-info-button"
              icon
              variant="text"
              :aria-label="$t('add_product.pricing.workspace.quantity_about')"
              ><b-product-edit-info-icon name="Info" :size="16" /><v-tooltip
                activator="parent"
                location="top"
                :open-on-click="true"
                content-class="sd-modern-tooltip text-start"
                >{{
                  $t("add_product.pricing.workspace.quantity_help")
                }}</v-tooltip
              ></v-btn
            >
          </div>
          <div class="b-product-edit-price__workspace-tier-toolbar">
            <p>
              {{
                $t(
                  extra_pricings_to_show?.length >= 10
                    ? "add_product.pricing.workspace.tier_limit"
                    : "add_product.pricing.workspace.tier_scope",
                )
              }}
            </p>
            <v-btn
              class="sd-modern-button"
              variant="outlined"
              :disabled="
                workspaceBusy || (extra_pricings_to_show?.length || 0) >= 10
              "
              @click="showAddExtraPrice"
              ><template #prepend
                ><b-product-edit-info-icon name="Plus" :size="16" /></template
              >{{ $t("add_product.pricing.workspace.add_tier") }}</v-btn
            >
          </div>
          <p
            v-if="currency?.code !== savedPriceCurrency"
            class="sd-modern-notice b-product-edit-price__workspace-error"
          >
            {{
              $t("add_product.pricing.workspace.currency_draft", {
                currency: savedPriceCurrency,
              })
            }}
          </p>
          <template v-if="extra_pricings_to_show?.length"
            ><extra-pricing-levels
              :extra-pricings="extra_pricings_to_show"
              :product="workspaceTierProduct"
              modern
              workspace /><v-table
              class="sd-modern-table b-product-edit-price__workspace-tiers"
              density="compact"
              ><thead>
                <tr>
                  <th>
                    {{ $t("add_product.pricing.workspace.minimum_quantity") }}
                  </th>
                  <th>
                    {{ $t("add_product.pricing.workspace.after_discount") }}
                  </th>
                  <th>{{ $t("add_product.pricing.discount_input") }}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <b-product-extra-pricing-row
                  v-for="extra in extra_pricings_to_show"
                  :key="extra.id"
                  :extra-pricing="extra"
                  :all-extra-pricings="extra_pricings_to_show"
                  :product="workspaceTierProduct"
                  :shop="shop"
                  :disabled="workspaceBusy"
                  modern
                  workspace
                  light
                  @activity="tierActivity = $event"
                  @select="showEditExtraPricing(extra)"
                  @onDelete="
                    (id) => {
                      DeleteItemByID(product.extra_pricings, id);
                      forceupdate();
                    }
                  "
                /></tbody></v-table
          ></template>
          <div v-else class="b-product-edit-price__workspace-empty">
            <b-product-edit-info-icon name="Layers" :size="25" />
            <h3>{{ $t("add_product.pricing.workspace.empty_tiers") }}</h3>
            <p>{{ $t("add_product.pricing.workspace.empty_tiers_help") }}</p>
          </div>
          </template>
        </div>
      </details>
      <b-product-extra-pricing-add
        v-if="selected_extra_price && (!variantFormMode || variant?.id)"
        ref="tierEditor"
        v-model="show_add_extra_price"
        :all-extra-pricings="extra_pricings_to_show"
        :extra-pricing="selected_extra_price"
        :product="workspaceTierProduct"
        :shop="shop"
        :variant="variant"
        :vendor="vendor"
        :vendor-product="vendorProduct"
        :disabled="workspaceBusy"
        modern
        workspace
        @activity="tierActivity = $event"
        @onAdd="
          (value) => {
            AddOrUpdateItemByID(product.extra_pricings, value);
            forceupdate();
          }
        "
        @onEdit="
          (value) => {
            AddOrUpdateItemByID(product.extra_pricings, value);
            forceupdate();
          }
        "
      />
      <footer v-if="!variantFormMode" class="b-product-edit-price__workspace-footer">
        <div>
          <p role="status" aria-live="polite">
            <b-product-edit-info-icon
              :name="hasUnsavedChanges ? 'Circle' : 'CircleCheck'"
              :size="15"
            />{{
              $t(
                hasUnsavedChanges
                  ? "add_product.pricing.workspace.unsaved"
                  : "add_product.pricing.workspace.saved",
              )
            }}
          </p>
          <small>{{ $t("add_product.pricing.workspace.save_scope") }}</small>
        </div>
        <div class="b-product-edit-price__workspace-actions">
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            :disabled="
              workspaceBusy || show_add_extra_price || !hasUnsavedChanges
            "
            @click="discardChanges"
            >{{ $t("add_product.pricing.workspace.discard") }}</v-btn
          ><v-btn
            v-if="hasButtonNext && !externalActionButtons"
            class="sd-modern-button sd-modern-button--primary"
            variant="elevated"
            color="primary"
            :loading="!!busy"
            :disabled="saveBlocked"
            aria-keyshortcuts="Control+s"
            @click="submit"
            v-ctrl.s="submit"
            ><template #prepend
              ><b-product-edit-info-icon name="Save" :size="16" /></template
            >{{ $t("global.actions.save_continue")
            }}<template #append
              ><b-product-edit-info-icon
                name="ArrowRight"
                :size="16"
                class="b-product-edit-price__workspace-direction" /></template
          ></v-btn>
        </div>
      </footer>
    </template>
    <template v-else>
      <!-- ▀▀▀▀▀▀▀▀▀ 🟣 Marketplace 🟣 ▀▀▀▀▀▀▀▀▀ -->
      <div
        v-if="isMarketplace"
        class="my-5"
        :class="modern ? 'sd-modern-widget' : 'widget-box'"
      >
        <u-widget-header
          :class="{ 'sd-modern-form-header': modern }"
          :add-caption="
            !IS_VENDOR_PANEL
              ? $t('add_product.pricing.vendor.manage_vendors')
              : undefined
          "
          :src="require('../../../../assets/icons/marketplace.svg')"
          :to="
            product
              ? {
                  name: 'BPageProductVendors',
                  params: { product_id: product.id },
                }
              : undefined
          "
          add-icon="price_change"
          add-text
          class="mb-2"
          :title="$t('add_product.pricing.vendor.title')"
        ></u-widget-header>

        <v-list-subheader>
          <div>
            <v-icon class="me-1">info_outline</v-icon>
            {{ $t("add_product.pricing.vendor.subtitle") }}
          </div>
        </v-list-subheader>

        <v-list-subheader
          v-if="!vendorProduct && !variant && product?.vendor_id"
        >
          <div>
            <v-icon class="me-1">info_outline</v-icon>
            <span
              v-html="
                $t('add_product.pricing.vendor.vendor_product_pricing_link')
              "
            >
            </span>
          </div>
        </v-list-subheader>

        <v-list-subheader
          v-if="!vendorProduct && variant && product?.vendor_id"
        >
          <div>
            <v-icon class="me-1">info_outline</v-icon>

            <span
              v-html="
                $t('add_product.pricing.vendor.vendor_variant_pricing_link')
              "
            >
            </span>
          </div>
        </v-list-subheader>
      </div>
      <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <!-- ▀▀▀▀▀▀▀▀▀ 🎗️ Subscription ▀▀▀▀▀▀▀▀▀ -->
      <div
        v-if="isSubscription"
        class="my-5"
        :class="modern ? 'sd-modern-widget' : 'widget-box'"
      >
        <u-widget-header
          :class="{ 'sd-modern-form-header': modern }"
          :src="
            require('@selldone/core-js/assets/product-types/subscription.svg')
          "
          :to="
            product
              ? {
                  name: 'BPageProductInventory',
                  params: { product_id: product.id },
                }
              : undefined
          "
          :add-caption="
            modern
              ? $t('add_product.pricing.modern.manage_plans')
              : 'Manage Plans'
          "
          add-icon="price_change"
          add-text
          class="mb-2"
          :title="
            modern
              ? $t('add_product.pricing.modern.subscription_title')
              : 'Subscription pricing'
          "
        ></u-widget-header>

        <v-list-subheader>
          <div>
            <v-icon class="me-1">info_outline</v-icon>
            <template v-if="modern">{{
              $t("add_product.pricing.modern.subscription_help")
            }}</template>
            <template v-else
              >This price will be shown only in the products listing. You can
              set the actual price of the product and subscription plans in the
              Product > Inventory tab.</template
            >
          </div>
        </v-list-subheader>
      </div>
      <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <section
        v-if="modern && instanceMode && customObject.variant_id"
        class="b-product-edit-price__scope"
      >
        <h2>
          {{ $t("add_product.pricing.modern.scope") }}
          <v-tooltip
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-click
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                variant="text"
                class="sd-modern-icon-button sd-modern-info-button"
                :aria-label="$t('add_product.pricing.modern.scope_help_label')"
              >
                <v-icon size="15">info_outline</v-icon>
              </v-btn>
            </template>
            {{ $t("add_product.pricing.modern.scope_help") }}
          </v-tooltip>
        </h2>
        <div
          class="c-container -force-rounded flex-row b-product-edit-price__scope-options"
        >
          <div
            role="button"
            tabindex="0"
            class="selection-box"
            :class="{ selected: variant_pricing }"
            :aria-pressed="!!variant_pricing"
            @click="variant_pricing = true"
            @keydown.enter.prevent="variant_pricing = true"
            @keydown.space.prevent="variant_pricing = true"
          >
            <v-icon size="16">tune</v-icon>
            {{ $t("add_product.pricing.modern.this_variant") }}
          </div>
          <div
            role="button"
            tabindex="0"
            class="selection-box"
            :class="{ selected: !variant_pricing }"
            :aria-pressed="!variant_pricing"
            @click="variant_pricing = false"
            @keydown.enter.prevent="variant_pricing = false"
            @keydown.space.prevent="variant_pricing = false"
          >
            <v-icon size="16">link</v-icon>
            {{ $t("add_product.pricing.modern.shared_price") }}
          </div>
        </div>
        <p class="b-product-edit-price__scope-help">
          {{
            $t(
              variant_pricing
                ? "add_product.pricing.modern.independent_help"
                : "add_product.pricing.modern.shared_help",
            )
          }}
        </p>
      </section>

      <v-sheet
        :class="{
          '-transparent': transparent && !modern,
          'widget-hover-dark': !transparent && !modern,
          'widget-box': !modern,
          'sd-modern-widget': modern,
          light: light,
        }"
        :theme="modern ? undefined : light ? 'light' : 'dark'"
        class="price-input-form mx-auto"
      >
        <u-widget-header
          :class="{ 'sd-modern-form-header': modern }"
          :title="
            $t(
              modern
                ? 'add_product.pricing.modern.details'
                : 'add_product.pricing.edit_price',
            )
          "
          icon="price_change"
        >
        </u-widget-header>
        <v-list-subheader :dark="!light">
          {{
            modern ? $t("add_product.pricing.modern.details_help") : subtitle
          }}
        </v-list-subheader>

        <!-- Pricing available only for services -->
        <v-col v-if="isService" cols="12">
          <v-radio-group
            v-model="pricing"
            :inline="$vuetify.display.smAndUp"
            class="justify-space-around"
            @update:model-value="setValue('pricing', pricing)"
          >
            <v-radio
              v-for="type in available_pricing"
              :key="type.code"
              :label="$t(type.title)"
              :value="type.code"
            ></v-radio>
          </v-radio-group>

          <v-row align="center" class="m-0" style="min-height: 100px">
            <v-col cols="12" sm="6">
              <v-img
                :class="{ 'invert-image': light }"
                :src="PricingTypes[pricing].image"
                class="mx-auto"
                max-width="280"
              ></v-img>
            </v-col>
            <v-col class="text-start text-subtitle-2" cols="12" sm="6">
              <v-icon size="small">info</v-icon>
              {{ $t(PricingTypes[pricing].message) }}
            </v-col>
          </v-row>
          <hr />
        </v-col>

        <div class="b-product-edit-price__body">
          <aside
            v-if="modern"
            class="b-product-edit-price__receipt"
            aria-live="polite"
          >
            <h3>
              {{
                $t(
                  pricing === PricingTypes.FIX.code || variant
                    ? "add_product.pricing.modern.after_discount"
                    : "add_product.pricing.modern.starting_after_discount",
                )
              }}
            </h3>
            <u-price
              :amount="calculatePrice"
              :currency="currency"
              :class="{ 'text-danger': calculatePrice <= 0 }"
              class="b-product-edit-price__receipt-total"
            />
            <span
              v-if="price_label"
              class="b-product-edit-price__receipt-label"
              >{{ price_label }}</span
            >
            <div class="b-product-edit-price__receipt-lines">
              <u-text-value-dashed>
                <template #label>{{
                  $t("add_product.pricing.price_input")
                }}</template>
                <u-price :amount="price" :currency="currency" />
              </u-text-value-dashed>
              <u-text-value-dashed v-if="commission">
                <template #label>{{
                  $t("add_product.pricing.commission_input")
                }}</template>
                <span
                  >+ <u-price :amount="commission" :currency="currency"
                /></span>
              </u-text-value-dashed>
              <u-text-value-dashed>
                <template #label>{{
                  $t("add_product.pricing.discount_input")
                }}</template>
                <span
                  >− <u-price :amount="discount" :currency="currency"
                /></span>
              </u-text-value-dashed>
            </div>
            <p
              v-if="calculatePrice < 0"
              class="b-product-edit-price__receipt-note"
              role="status"
            >
              <v-icon color="warning" size="16">warning_amber</v-icon>
              <span>{{ $t("add_product.pricing.modern.negative_total") }}</span>
            </p>
            <p
              v-if="has_discount_period && discount"
              class="b-product-edit-price__receipt-note"
            >
              <v-icon size="16">schedule</v-icon>
              <span>{{
                $t("add_product.pricing.modern.scheduled_preview")
              }}</span>
            </p>
          </aside>
          <div class="b-product-edit-price__fields">
            <div
              class="b-product-edit-price__base-fields"
              :class="{ 'sd-modern-form-grid': modern }"
            >
              <u-currency-input
                v-model="currency"
                :active-currencies="shop.currencies"
                :dark="!light"
                :label="$t('add_product.pricing.currency_input')"
                :messages="
                  $t(
                    modern
                      ? 'add_product.pricing.modern.currency_help'
                      : 'add_product.pricing.currency_input_messages',
                  )
                "
                class="sm-suffix price-input"
                :class="{ 'sd-modern-underlined-field': modern }"
                return-object
                @update:model-value="setValue('currency', currency.code)"
              />

              <u-price-input
                v-model="price"
                :currency="currencyObject"
                :dark="!light"
                :label="$t('add_product.pricing.price_input')"
                class="sm-suffix price-input strong-field"
                :class="{ 'sd-modern-underlined-field': modern }"
                required
                @update:model-value="setValue('price', price)"
              />
            </div>
            <div v-if="modern" class="b-product-edit-price__group-heading">
              <h3>{{ $t("add_product.pricing.modern.adjustments") }}</h3>
              <p>{{ $t("add_product.pricing.modern.adjustments_help") }}</p>
            </div>
            <v-slide-y-transition leave-absolute>
              <div
                v-if="!show_commission && !commission"
                class="price-input my-0 text-end"
              >
                <v-btn
                  class="tnt"
                  :class="{
                    'sd-modern-button sd-modern-button--inline': modern,
                  }"
                  size="small"
                  variant="text"
                  @click="show_commission = true"
                >
                  <v-icon start>add</v-icon>
                  {{
                    $t(
                      modern
                        ? "add_product.pricing.modern.add_commission"
                        : "add_product.pricing.add_commission_action",
                    )
                  }}
                </v-btn>
              </div>
            </v-slide-y-transition>
            <v-slide-y-reverse-transition hide-on-leave>
              <div v-if="show_commission || commission">
                <u-price-input
                  v-model="commission"
                  :currency="currencyObject"
                  :dark="!light"
                  :label="$t('add_product.pricing.commission_input')"
                  class="sm-suffix price-input strong-field"
                  :class="{ 'sd-modern-underlined-field': modern }"
                  clearable
                  hide-details
                  required
                  @update:model-value="setValue('commission', commission)"
                  @click:clear="
                    commission = 0;
                    setValue('commission', 0);
                    show_commission = false;
                  "
                />

                <div class="small price-input text-justify">
                  <template v-if="!modern">
                    <v-icon class="me-1" color="amber" size="small"
                      >info</v-icon
                    >
                    {{ $t("add_product.pricing.commission_message") }}
                  </template>
                  <div class="text-end">
                    <v-btn
                      :color="light ? 'primary' : 'amber'"
                      :to="{ name: 'BPageShopFinanceTax' }"
                      class="mt-1"
                      :class="{
                        'sd-modern-button sd-modern-button--inline': modern,
                      }"
                      size="small"
                      variant="text"
                    >
                      <v-icon start>gavel</v-icon>
                      {{ $t("shop_tax.tax_setting") }}
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-slide-y-reverse-transition>

            <u-price-input
              v-model="discount"
              :currency="currencyObject"
              :dark="!light"
              :label="$t('add_product.pricing.discount_input')"
              :messages="`${$t(
                'add_product.pricing.discount_input_message',
              )}: ${discount_percent}%`"
              class="sm-suffix price-input strong-field"
              :class="{ 'sd-modern-underlined-field': modern }"
              @update:model-value="setValue('discount', discount)"
            />

            <div
              v-if="!modern"
              class="text-center line-height-normal d-flex align-center"
            >
              <div
                class="flex-grow-1 mx-3"
                style="border-bottom: dashed thin #fff"
              ></div>
              <span class="d-block">
                {{
                  pricing === PricingTypes.FIX.code ||
                  variant /*Pricing type is just for products*/
                    ? $t("global.commons.final_price")
                    : $t("global.commons.starting_price")
                }}
              </span>
              <div
                class="flex-grow-1 mx-3"
                style="border-bottom: dashed thin #fff"
              ></div>
            </div>

            <div
              :class="
                modern ? 'b-product-edit-price__label' : 'text-center my-3'
              "
            >
              <template v-if="!modern">
                <u-price
                  :amount="calculatePrice"
                  :class="{ 'text-danger': calculatePrice <= 0 }"
                  :currency="currency"
                  x-large
                >
                </u-price>
                <span v-if="price_label" class="ms-2">{{ price_label }}</span>
              </template>

              <v-slide-y-transition leave-absolute>
                <div
                  v-if="!show_price_label && !price_label"
                  class="price-input my-0 text-end"
                >
                  <v-btn
                    class="tnt"
                    :class="{
                      'sd-modern-button sd-modern-button--inline': modern,
                    }"
                    size="small"
                    variant="text"
                    @click="show_price_label = true"
                  >
                    <v-icon start>add</v-icon>
                    {{ $t("add_product.pricing.add_price_label_action") }}
                  </v-btn>
                </div>
              </v-slide-y-transition>

              <v-slide-y-reverse-transition hide-on-leave>
                <div v-if="show_price_label || price_label">
                  <v-text-field
                    v-model="price_label"
                    :label="$t('add_product.pricing.price_label_input')"
                    :messages="
                      $t(
                        modern
                          ? 'add_product.pricing.modern.price_label_hint'
                          : 'add_product.pricing.price_label_message',
                      )
                    "
                    class="price-input"
                    :class="{ 'sd-modern-underlined-field': modern }"
                    clearable
                    counter="32"
                    maxlength="32"
                    placeholder="($1.5/Fl Oz)"
                    variant="underlined"
                    @update:model-value="setValue('price_label', price_label)"
                    @click:clear="
                      price_label = null;
                      setValue('price_label', null);
                      show_price_label = false;
                    "
                  />
                </div>
              </v-slide-y-reverse-transition>
            </div>

            <v-expand-transition>
              <div v-if="discount">
                <v-expansion-panels
                  :dark="!light"
                  :model-value="has_discount_period ? 0 : null"
                  class="mt-5"
                  style="border-radius: 18px; overflow: hidden"
                  @update:model-value="
                    (val) => (has_discount_period = val === 0)
                  "
                >
                  <v-expansion-panel
                    :style="{
                      'background-color': modern
                        ? 'var(--sd-modern-inset)'
                        : light
                          ? '#eee'
                          : '#1e1e1ea8',
                    }"
                    elevation="0"
                  >
                    <v-expansion-panel-title color="transparent">
                      <v-icon class="flex-grow-0 me-2"
                        >{{
                          has_discount_period
                            ? "check_circle"
                            : "panorama_fish_eye"
                        }}
                      </v-icon>
                      <span class="flex-grow-1">{{
                        $t("add_product.pricing.has_discount_period_input")
                      }}</span>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text color="transparent">
                      <p class="text-start">
                        <v-icon>arrow_drop_down</v-icon>
                        {{ $t("add_product.pricing.discount_timespan") }}
                      </p>

                      <div
                        class="b-product-edit-price__date-fields"
                        :class="{ 'sd-modern-form-grid': modern }"
                      >
                        <u-date-input
                          v-model="dis_start"
                          :label="$t('add_product.pricing.start_input')"
                          :max="dis_end"
                          :placeholder="
                            $t('add_product.pricing.start_input_placeholder')
                          "
                          class="mt-2"
                          :class="{ 'sd-modern-underlined-field': modern }"
                          clearable
                          :color="modern ? 'primary' : '#C2185B'"
                          prepend-inner-icon="play_arrow"
                          return-utc
                          @update:model-value="setValue('dis_start', dis_start)"
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
                          :class="{ 'sd-modern-underlined-field': modern }"
                          clearable
                          :color="modern ? 'primary' : '#C2185B'"
                          prepend-inner-icon="stop"
                          return-utc
                          @update:model-value="setValue('dis_end', dis_end)"
                        />
                      </div>
                      <u-time-progress-bar
                        :class="{ 'text-white': !light }"
                        :created-time="created_at"
                        :end-time="dis_end"
                        :start-time="dis_start"
                        class="my-2"
                      />
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </v-expand-transition>
          </div>
        </div>
      </v-sheet>

      <!-- ▀▀▀▀▀▀▀▀▀ 🌸 Add/Edit extra pricing 🌸 ▀▀▀▀▀▀▀▀▀ -->
      <section
        v-if="(isPhysical || isVirtual) && !isMarketplace"
        :class="{ 'sd-modern-widget b-product-edit-price__quantity': modern }"
      >
        <div v-if="modern" class="b-product-edit-price__quantity-heading">
          <div>
            <h2>
              <v-icon size="20">layers</v-icon
              >{{ $t("add_product.pricing.modern.quantity_pricing") }}
            </h2>
            <p>{{ $t("add_product.pricing.modern.quantity_help") }}</p>
          </div>
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            color="primary"
            @click="showAddExtraPrice"
          >
            <v-icon start>add</v-icon
            >{{ $t("add_product.pricing.modern.add_tier") }}
          </v-btn>
        </div>
        <div v-else class="widget-buttons">
          <v-btn
            :class="{
              'sd-modern-button b-product-edit-price__extra-action': modern,
            }"
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
        <p
          v-if="modern && !extra_pricings_to_show?.length"
          class="b-product-edit-price__quantity-empty"
        >
          {{ $t("add_product.pricing.modern.no_quantity_prices") }}
        </p>
        <!-- ▀▀▀▀▀▀▀▀▀ 🌸 Add extra pricing 🌸 ▀▀▀▀▀▀▀▀▀ -->
        <extra-pricing-levels
          v-if="extra_pricings_to_show?.length"
          :extra-pricings="extra_pricings_to_show"
          :modern="modern"
          :product="product ? product : customObject"
          class="max-w-250 mx-auto"
        ></extra-pricing-levels>
        <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

        <v-table
          v-if="extra_pricings_to_show?.length"
          class="max-widget-width mx-auto bg-transparent"
          :class="{ 'sd-modern-table b-product-edit-price__tiers': modern }"
          density="compact"
        >
          <template v-slot:default>
            <thead>
              <tr>
                <th>
                  {{
                    modern
                      ? $t("add_product.pricing.modern.minimum_quantity")
                      : "Min Qty"
                  }}
                </th>
                <th>
                  {{ $t("global.commons.price") }}
                  <small class="d-block">{{
                    modern
                      ? $t("add_product.pricing.modern.after_discount")
                      : "After discount"
                  }}</small>
                </th>
                <th>
                  {{ $t("global.commons.discount") }}
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <b-product-extra-pricing-row
                v-for="(extra_price, i) in extra_pricings_to_show"
                :key="extra_price.id"
                :all-extra-pricings="extra_pricings_to_show"
                :color="getColor(i)"
                :extra-pricing="extra_price"
                :modern="modern"
                :product="product"
                :shop="shop"
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
          :all-extra-pricings="extra_pricings_to_show"
          :extra-pricing="selected_extra_price"
          :modern="modern"
          :product="product"
          :shop="shop"
          :transparent="transparent"
          :variant="variant"
          :vendor="vendor"
          :vendor-product="vendorProduct"
          light
          @onAdd="
            (val) => {
              AddOrUpdateItemByID(product.extra_pricings, val);
              forceupdate();
            }
          "
          @onEdit="(val) => AddOrUpdateItemByID(product.extra_pricings, val)"
        ></b-product-extra-pricing-add>
      </section>

      <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <s-widget-buttons
        v-if="hasButtonNext && !externalActionButtons"
        auto-fixed-position
        class="mb-5 mt-12"
        :class="{ 'sd-modern-form-actions': modern }"
      >
        <v-btn
          :class="{
            disabled: calculatePrice < 0,
            'sd-modern-button sd-modern-button--primary': modern,
          }"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="$emit('next')"
          v-ctrl.s="
            () => {
              $emit('next');
            }
          "
        >
          {{ $t("global.actions.save_continue") }}

          <v-icon end>
            {{ $t("icons.arrow_end") }}
          </v-icon>
        </v-btn>
      </s-widget-buttons>

      <!-- ----------------- Instance Mode ----------------- -->

      <template v-if="instanceMode">
        <div
          v-if="!modern && customObject.variant_id"
          class="my-5"
          :class="modern ? 'sd-modern-widget' : 'widget-box'"
        >
          <v-list-subheader class="text-start"
            >{{ $t("add_product.pricing.variant_pricing_message") }}
          </v-list-subheader>

          <div class="c-container -force-rounded flex-row">
            <div
              :class="{ selected: variant_pricing }"
              class="selection-box"
              role="button"
              tabindex="0"
              :aria-pressed="!!variant_pricing"
              @click="variant_pricing = true"
              @keydown.enter.prevent="variant_pricing = true"
              @keydown.space.prevent="variant_pricing = true"
            >
              {{ $t("add_product.pricing.independent_price") }}
            </div>

            <div
              :class="{ selected: !variant_pricing }"
              class="selection-box"
              role="button"
              tabindex="0"
              :aria-pressed="!variant_pricing"
              @click="variant_pricing = false"
              @keydown.enter.prevent="variant_pricing = false"
              @keydown.space.prevent="variant_pricing = false"
            >
              {{ $t("add_product.pricing.same_price") }}
            </div>
          </div>
        </div>

        <s-widget-buttons
          v-if="!externalActionButtons"
          :class="{ 'sd-modern-form-actions': modern }"
        >
          <v-btn
            :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
            :loading="busy_update"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="setProductPrice()"
            v-ctrl.s="
              () => {
                setProductPrice();
              }
            "
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </s-widget-buttons>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import UDateInput from "../../../../ui/date/input/UDateInput.vue";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import { PricingTypes } from "@selldone/core-js/enums/product/PricingTypes";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BProductExtraPricingAdd from "../../../product/extra-pricings/add/BProductExtraPricingAdd.vue";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import ExtraPricingLevels from "../../../extra-pricing/ExtraPricingLevels.vue";
import BProductExtraPricingRow from "../../../product/extra-pricings/row/BProductExtraPricingRow.vue";
import { standardDesignColor } from "@selldone/core-js/helper/color/ColorGenerator";
import { PriceHelper } from "@selldone/core-js/helper/price/PriceHelper";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import BProductEditInfoIcon from "../info/BProductEditInfoIcon.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";

export default {
  name: "BProductEditPrice",
  mixins: [CurrencyMixin],
  components: {
    UCurrencyIcon,
    BProductEditInfoIcon,
    USmartToggle,
    UTextValueDashed,
    SWidgetButtons,
    BProductExtraPricingRow,
    ExtraPricingLevels,
    BProductExtraPricingAdd,
    UTimeProgressBar,
    UDateInput,
    UCurrencyInput,
    UPriceInput,
  },
  emits: ["update:instance", "next"],
  props: {
    modern: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    shop: {
      required: true,
      type: Object,
    },

    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },

    vendorProduct: {
      /*🟢 Add extra pricing to product<->vendor in the Product > Vendors tab🟢*/ required: false,
    },

    product: {
      required: false,
      type: Object,
    },

    variant: {
      // Used just in extra pricing! maybe we used it in other places
      required: false,
      type: Object,
    },

    customObject: {
      required: false,
      type: Object,
    },
    hasButtonNext: {
      required: false,
      type: Boolean,
      default: false,
    },
    transparent: {
      type: Boolean,
      default: false,
    },
    light: {
      type: Boolean,
      default: false,
    },

    externalActionButtons: {
      type: Boolean,
      default: false,
    },

    busy: {},

    //-----------Instance Product Price Update---------- (+++)
    instanceMode: {
      type: Boolean,
      default: false,
    },
    instanceOriginalProduct: {},
    instanceObject: {},
    instanceProductId: {},
    instanceVariantId: {}, // Inventory management mode
    instanceVariantPricing: {}, // Set for variant pricing (Independent from product)

    //---------------------------------------------------

    // ▀▀▀▀▀▀▀▀▀ 🟣 Marketplace 🟣 ▀▀▀▀▀▀▀▀▀
    isMarketplace: {
      // Marketplace pricing in vendor tab!
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    savedSnapshot: "",
    tierActivity: false,
    PricingTypes: PricingTypes,
    pricing: PricingTypes.FIX.code,

    price: 0,
    currency: null,
    commission: 0,
    discount: 0,

    dis_start: "",
    dis_end: "",
    created_at: "",

    price_label: null,

    has_discount_period: false,

    show_commission: false,
    show_price_label: false,

    //-----------Instance Product Price Update---------- (+++)
    variant_pricing: false,
    busy_update: false,
    //---------------------------------------------------

    type: ProductType.PHYSICAL.code,

    //---------------------------------------------------
    show_add_extra_price: false,
    selected_extra_price: null,

    random: 0, //Fix update issue!
  }),

  computed: {
    workspaceMode() {
      return this.modern && !this.instanceMode;
    },
    variantFormMode() {
      return this.workspaceMode && !!this.customObject;
    },
    workspaceBusy() {
      return !!this.busy || this.tierActivity || !!this.$refs.tierEditor?.busy;
    },
    hasUnsavedChanges() {
      return (
        this.workspaceMode && this.savedSnapshot !== this.captureSnapshot()
      );
    },
    invalidWorkspaceDates() {
      return (
        this.has_discount_period &&
        !!this.dis_start &&
        !!this.dis_end &&
        new Date(this.dis_end) < new Date(this.dis_start)
      );
    },
    saveBlocked() {
      return (
        this.workspaceMode &&
        (!this.active ||
          this.workspaceBusy ||
          this.show_add_extra_price ||
          this.calculatePrice < 0 ||
          this.invalidWorkspaceDates)
      );
    },
    savedPriceCurrency() {
      return this.savedSnapshot
        ? JSON.parse(this.savedSnapshot).currency
        : this.CURRENT_ITEM.currency;
    },
    workspaceTierProduct() {
      return { ...this.product, currency: this.savedPriceCurrency };
    },
    discountPeriodStatus() {
      if (this.dis_end && new Date(this.dis_end).getTime() < Date.now())
        return "ended";
      if (this.dis_start && new Date(this.dis_start).getTime() > Date.now())
        return "scheduled";
      return this.dis_start || this.dis_end ? "active" : "unset";
    },
    discountDigest() {
      if (!this.discount)
        return this.$t("add_product.pricing.workspace.no_discount");
      return `${this.formatWorkspaceAmount(this.discount)} · ${this.discount_percent}% · ${this.$t(this.has_discount_period ? "add_product.pricing.workspace.period_" + this.discountPeriodStatus : "add_product.pricing.workspace.no_date_limit")}`;
    },
    additionalDigest() {
      return `${this.commission ? this.$t("add_product.pricing.commission_input") + " " + this.formatWorkspaceAmount(this.commission) : this.$t("add_product.pricing.workspace.no_commission")} · ${this.price_label || this.$t("add_product.pricing.workspace.no_label")}`;
    },
    quantityDigest() {
      const tiers = this.extra_pricings_to_show || [];
      if (!tiers.length)
        return this.$t("add_product.pricing.workspace.no_tiers");
      const lowest = Math.min(
        ...tiers.map(
          (item) =>
            Number(item.price || 0) +
            Number(item.commission || 0) -
            Number(item.discount || 0),
        ),
      );
      return this.$t("add_product.pricing.workspace.tier_digest", {
        count: Math.min(...tiers.map((item) => item.min)),
        amount: this.formatWorkspaceAmount(lowest, this.savedPriceCurrency),
      });
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    CURRENT_ITEM() {
      return this.customObject ? this.customObject : this.product;
    },

    isVirtual() {
      return this.type === ProductType.VIRTUAL.code;
    },
    isPhysical() {
      return this.type === ProductType.PHYSICAL.code;
    },

    isFile() {
      return this.type === ProductType.FILE.code;
    },
    isService() {
      return this.type === ProductType.SERVICE.code;
    },
    isSubscription() {
      return (
        this.product && this.product.type === ProductType.SUBSCRIPTION.code
      );
    },

    available_pricing() {
      if (this.isService)
        return [
          PricingTypes.FIX,
          PricingTypes.AGREEMENT,
          PricingTypes.ESTIMATION,
        ];

      return [PricingTypes.FIX];
    },

    currencyObject() {
      return this.currency;
    },

    calculatePrice() {
      try {
        return PriceHelper.priceProductByCurrency(
          this.shop,
          {
            price: this.price,
            currency: this.currency?.code,
            commission: this.commission,
            discount: this.discount,
          },
          null,
          this.currency?.code,
        );
      } catch (e) {
        console.error("Price", e);
        return "🚨";
      }
    },
    discount_percent() {
      try {
        return PriceHelper.discountProductPercent(
          this.shop,
          {
            price: this.price,
            currency: this.currency?.code,
            commission: this.commission,
            discount: this.discount,
          },
          null,
        );
      } catch (e) {
        console.error("Discount", e);
        return "🚨";
      }
    },

    currencies() {
      let out = [];
      for (let key in Currency) {
        let item = Currency[key];
        if (item.enable) out.push(item);
      }
      return out;
    },

    // 🌸 Extra pricing 🌸
    extra_pricings() {
      const random = this.random; //Fix update issue!
      return (
        this.product ? this.product : this.customObject
      ).extra_pricings?.sortByKey("min", true);
    },
    extra_pricings_to_show() {
      // A new variant has no tier scope until the parent has created it.
      if (this.variantFormMode && !this.variant?.id) return [];
      const variant_id = this.instanceVariantId
        ? this.instanceVariantId /*Inventory management mode*/
        : this.variant?.id; // For a variant
      const vendor_id = this.vendor?.id; // In vendor panel
      return this.extra_pricings
        ?.filter((x) =>
          variant_id ? x.variant_id === variant_id : !x.variant_id,
        ) // Just for current variant! null: added for variant
        .filter((x) => (vendor_id ? x.vendor_id === vendor_id : !x.vendor_id)); // Just for current vendor - null: added by marketplace owner in the product pricing page
    },

    subtitle() {
      return this.isMarketplace
        ? this.$t("add_product.pricing.subtitle.marketplace")
        : this.isSubscription
          ? this.$t("add_product.pricing.subtitle.subscription")
          : this.isService
            ? this.$t("add_product.pricing.subtitle.service")
            : this.isFile
              ? this.$t("add_product.pricing.subtitle.file")
              : this.$t("add_product.pricing.subtitle.default");
    },
  },

  watch: {
    active(value) {
      if (this.workspaceMode && !value && !this.workspaceBusy)
        this.show_add_extra_price = false;
    },
    "product.id"() {
      if (this.workspaceMode) {
        this.show_add_extra_price = false;
        this.selected_extra_price = null;
        this.markSaved();
      }
    },
    variant_pricing(val) {
      if (!val) this.setSameAsProduct();
    },

    has_discount_period(value) {
      if (this.workspaceMode && this.workspaceBusy) return;
      if (!value) {
        this.dis_start = null;
        this.dis_end = null;

        this.setValue("dis_start", null);
        this.setValue("dis_end", null);
      }
    },
  },
  created() {
    this.type = this.customObject?.type
      ? this.customObject.type
      : this.product.type;

    this.pricing = this.customObject
      ? this.customObject.pricing
      : this.product.pricing;

    this.price = this.customObject
      ? this.customObject.price
      : this.product.price;
    this.currency = this.GetCurrency(this.CURRENT_ITEM.currency);
    if (!this.currency) this.currency = this.GetUserSelectedCurrency(); // Only for BUG situation!

    this.commission = this.customObject
      ? this.customObject.commission
      : this.product.commission;
    this.discount = this.customObject
      ? this.customObject.discount
      : this.product.discount;

    // Convert UTC to local time for picker!
    this.dis_start = this.customObject
      ? this.customObject.dis_start
      : this.product.dis_start;
    this.dis_end = this.customObject
      ? this.customObject.dis_end
      : this.product.dis_end;

    this.created_at = this.customObject
      ? this.customObject.created_at
      : this.product.created_at;

    this.has_discount_period = this.dis_start != null || this.dis_end != null;

    this.price_label = this.customObject
      ? this.customObject.price_label
      : this.product.price_label;

    //-----------Instance Product Price Update---------- (+++)
    if (this.instanceMode) {
      this.variant_pricing = this.instanceVariantPricing;
    }
    if (this.workspaceMode) this.markSaved();
  },

  methods: {
    captureSnapshot() {
      return JSON.stringify({
        pricing: this.pricing,
        price: this.price,
        currency: this.currency?.code,
        commission: this.commission,
        discount: this.discount,
        dis_start: this.dis_start,
        dis_end: this.dis_end,
        price_label: this.price_label,
      });
    },
    applyWorkspaceTuple(item) {
      this.pricing = item.pricing || PricingTypes.FIX.code;
      this.price = item.price;
      this.currency =
        this.GetCurrency(item.currency) || this.GetUserSelectedCurrency();
      this.commission = item.commission;
      this.discount = item.discount;
      this.dis_start = item.dis_start;
      this.dis_end = item.dis_end;
      this.price_label = item.price_label;
      this.has_discount_period = item.dis_start != null || item.dis_end != null;
    },
    markSaved() {
      if (!this.workspaceMode) return;
      this.applyWorkspaceTuple(this.CURRENT_ITEM);
      this.savedSnapshot = this.captureSnapshot();
    },
    discardChanges() {
      if (
        !this.workspaceMode ||
        this.workspaceBusy ||
        this.show_add_extra_price ||
        !this.savedSnapshot
      )
        return;
      const saved = JSON.parse(this.savedSnapshot);
      Object.assign(this.CURRENT_ITEM, saved);
      this.applyWorkspaceTuple(saved);
    },
    prepareSave() {
      return (
        !this.saveBlocked &&
        !this.$refs.workspaceStartDate?.dialog &&
        !this.$refs.workspaceEndDate?.dialog
      );
    },
    submit() {
      if (this.prepareSave()) this.$emit("next");
    },
    formatWorkspaceAmount(value, code = this.currency?.code) {
      const currency = Currency[code];
      return `${Number(value || 0).toLocaleString(this.$vuetify?.locale?.isRtl ? "fa-IR" : "en-US", { minimumFractionDigits: currency?.floats || 0, maximumFractionDigits: currency?.floats || 0 })} ${code || ""}`;
    },
    setValue(key, value) {
      if (this.variantFormMode && key === "currency" && value !== this.product.currency) {
        this.currency = this.GetCurrency(this.product.currency);
        return;
      }
      if (this.workspaceMode && this.workspaceBusy) {
        this.applyWorkspaceTuple(this.CURRENT_ITEM);
        return;
      }
      //   console.log('setValue',key,value)
      if (this.customObject) this.customObject[key] = value;
      else this.product[key] = value;
    },

    setSameAsProduct() {
      if (!this.instanceMode) return;

      this.price = this.instanceOriginalProduct.price;
      this.currency = Currency[this.instanceOriginalProduct.currency];
      this.commission = this.instanceOriginalProduct.commission;
      this.discount = this.instanceOriginalProduct.discount;
      this.dis_start = this.instanceOriginalProduct.dis_start;
      this.dis_end = this.instanceOriginalProduct.dis_end;
      this.has_discount_period = !!(this.dis_start || this.dis_end);
      this.price_label = this.instanceOriginalProduct.price_label;

      // console.log('setSameAsProduct',this.instanceOriginalProduct)
    },

    /**
     * Important: Do not change the method name! It's used externally.
     */
    setProductPrice() {
      if (!this.instanceMode) return;

      this.busy_update = true;

      let pricing = null;
      if (this.instanceVariantId) {
        pricing = this.variant_pricing; // Set for variant pricing (Independent from product)
      } else {
        pricing = this.pricing;
      }

      const params = {
        price: this.price,
        currency: this.currency.code,
        commission: this.commission,
        discount: this.discount,
        dis_start: this.dis_start,
        dis_end: this.dis_end,
        price_label: this.price_label,

        pricing: pricing,
      };

      return axios
        .put(
          window.API.PUT_EDIT_PRODUCT_PRICE(
            this.shop.id,
            this.instanceProductId,
            this.instanceVariantId,
          ),
          params,
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("update:instance", params);
            NotificationService.showSuccessAlert(
              null,
              "The product price updated.",
            );

            //----------------------------------------------

            // Update instance object:
            this.instanceObject.pricing = params.pricing;
            this.instanceObject.price = params.price;
            this.instanceObject.currency = params.currency;
            this.instanceObject.commission = params.commission;
            this.instanceObject.discount = params.discount;
            this.instanceObject.dis_start = params.dis_start;
            this.instanceObject.dis_end = params.dis_end;
            this.instanceObject.price_label = params.price_label;

            // Update for product:
            if (this.instanceObject.product) {
              Object.assign(this.instanceOriginalProduct, data.product);
            }

            // Update for variant:
            if (this.instanceObject.product.variant) {
              Object.assign(this.instanceObject.variant, data.variant);
            }

            //----------------------------------------------
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update = false;
        });
    },

    //━━━━━━━━━━━━━━━━━━━━━ 🌸 extra pricing 🌸 ━━━━━━━━━━━━━━━━━━━━━
    showAddExtraPrice() {
      if (this.variantFormMode && !this.variant?.id) return;
      if (
        this.workspaceMode &&
        (this.workspaceBusy || (this.extra_pricings_to_show?.length || 0) >= 10)
      )
        return;
      const max_minimum_quantity = this.extra_pricings_to_show?.maxByKey("min");
      this.selected_extra_price = {
        min: (max_minimum_quantity?.min ? max_minimum_quantity.min : 1) * 10,

        price: this.CURRENT_ITEM.price,
        commission: this.CURRENT_ITEM.commission,
        discount: this.CURRENT_ITEM.discount,
        dis_start: this.CURRENT_ITEM.dis_start,
        dis_end: this.CURRENT_ITEM.dis_end,
      };
      this.show_add_extra_price = true;
    },
    showEditExtraPricing(extra_price) {
      if (this.variantFormMode && !this.variant?.id) return;
      if (this.workspaceMode && this.workspaceBusy) return;
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

<style lang="scss" scoped>
.b-product-edit-price--modern :deep(.v-list-subheader__text) {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

.price-input-form {
  color: white;
  font-weight: 400;
  background-image: linear-gradient(-60deg, #00796b 0%, #009688 100%);

  border-style: solid;
  padding: 8px;
  border-radius: 24px;
  border-width: 0px;
  border-color: #5271c4;

  &.-transparent {
    background: transparent;
  }

  &.light {
    color: #222;
  }
}

.discount-date-picker {
  transition: 0.3s all ease-out;
  background-color: white;
  border-radius: 24px;
  margin-top: 12px;
  padding: 8px;
}

.price-input {
  max-width: 420px;
  margin: 12px auto;
}

.b-product-edit-price--modern {
  width: 100%;
  max-width: 760px;
  margin-inline: auto;
  color: rgb(var(--v-theme-on-surface));
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;

  .sd-modern-widget {
    width: 100%;
    max-width: 100%;
    padding: 20px;
    border-radius: 18px;
  }

  .price-input-form {
    color: inherit;
    background-color: rgb(var(--v-theme-surface)) !important;
    background-image: none;
  }

  .price-input {
    max-width: 100%;
    margin: 0;
  }

  h2,
  h3 {
    font-weight: 500;
  }
  h2 {
    font-size: 16px;
    line-height: 24px;
  }
  h3 {
    font-size: 13px;
    line-height: 20px;
  }
  p {
    margin: 0;
  }

  :deep(.sd-modern-form-header h2) {
    font-size: 16px !important;
    font-weight: 500;
    line-height: 24px;
  }
  :deep(.sd-modern-form-header .--icon) {
    font-size: 20px !important;
  }
  :deep(.v-list-subheader) {
    min-height: 0;
    height: auto;
    padding: 0;
    margin-block-end: 16px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  :deep(.sd-modern-underlined-field .v-field__input),
  :deep(.sd-modern-underlined-field .v-field__input > input),
  :deep(.sd-modern-underlined-field .v-select__selection-text) {
    font-family: inherit;
    font-size: 16px !important;
    font-weight: 400 !important;
    line-height: 24px;
  }
  :deep(.sd-modern-underlined-field .v-field-label) {
    font-size: 13px !important;
    font-weight: 400 !important;
    line-height: 20px;
  }
  :deep(.sd-modern-underlined-field .v-messages__message) {
    line-height: 19px;
  }

  .b-product-edit-price__scope {
    margin-block-end: 20px;
  }
  .b-product-edit-price__scope > h2 {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    line-height: 20px;
  }
  .b-product-edit-price__scope p,
  .b-product-edit-price__group-heading p,
  .b-product-edit-price__quantity p {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  .b-product-edit-price__scope-options {
    width: fit-content;
    max-width: 100%;
    gap: 4px;
    padding: 5px;
    margin: 8px 0;
    overflow: visible;
  }
  .b-product-edit-price__scope-options .selection-box {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 36px;
    padding: 8px 16px;
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    color: inherit;
    background: transparent;
    border-radius: 24px !important;
    box-shadow: none;
  }
  .b-product-edit-price__scope-options .selection-box.selected {
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.14);
  }
  .selection-box:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }

  .b-product-edit-price__body {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(165px, 0.9fr);
    gap: 24px;
    align-items: start;
  }
  .b-product-edit-price__receipt {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
  }
  .b-product-edit-price__fields {
    grid-column: 1;
    grid-row: 1;
    min-width: 0;
  }
  .b-product-edit-price__base-fields,
  .b-product-edit-price__date-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
  .b-product-edit-price__receipt h3 {
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
  }
  .b-product-edit-price__receipt-total {
    display: block;
    margin-block: 6px 12px;
    font-size: 28px;
    font-weight: 500;
    line-height: 36px;
  }
  .b-product-edit-price__receipt-label {
    display: block;
    overflow-wrap: anywhere;
  }
  .b-product-edit-price__receipt-lines {
    font-size: 12px;
    line-height: 19px;
  }
  .b-product-edit-price__receipt-note {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-block-start: 12px;
    font-size: 12px;
    line-height: 19px;
  }
  .b-product-edit-price__receipt-note .v-icon {
    margin-block-start: 2px;
  }
  .b-product-edit-price__group-heading {
    margin-block: 20px 8px;
  }
  .b-product-edit-price__fields > .price-input {
    margin-block-start: 12px;
  }
  .b-product-edit-price__fields .small {
    font-size: 12px;
    line-height: 19px;
  }
  .b-product-edit-price__label {
    margin-block-start: 12px;
  }
  :deep(.v-expansion-panel-title) {
    min-height: 44px;
    padding: 12px;
    font-size: 13px;
    line-height: 20px;
  }
  :deep(.v-expansion-panel-text__wrapper) {
    padding: 0 12px 12px;
  }
  .b-product-edit-price__date-fields {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }
  .b-product-edit-price__quantity {
    margin-block-start: 20px;
  }
  .b-product-edit-price__quantity-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  .b-product-edit-price__quantity-heading h2 {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .b-product-edit-price__quantity-heading p {
    margin-block-start: 4px;
  }
  .b-product-edit-price__quantity-heading .v-btn {
    flex-shrink: 0;
  }
  .b-product-edit-price__quantity-empty {
    padding-block: 24px 8px;
  }
  .b-product-edit-price__tiers {
    width: 100%;
    max-width: 100%;
    margin-block-start: 16px;
  }

  @media (max-width: 600px) {
    .sd-modern-widget {
      padding: 18px;
    }
    .b-product-edit-price__body {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
    }
    .b-product-edit-price__receipt,
    .b-product-edit-price__fields {
      grid-column: 1;
      grid-row: auto;
    }
    .b-product-edit-price__base-fields {
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
    }
    .b-product-edit-price__tiers :deep(thead) {
      display: none;
    }
    .b-product-edit-price__tiers :deep(table),
    .b-product-edit-price__tiers :deep(tbody) {
      display: block;
      width: 100%;
    }
    .b-product-edit-price__quantity-heading {
      flex-wrap: wrap;
      gap: 8px;
    }
    .b-product-edit-price__quantity-heading .v-btn {
      margin-inline-start: auto;
    }
  }
  @media (max-width: 799px), (pointer: coarse) {
    .b-product-edit-price__scope-options .selection-box {
      min-height: 44px;
    }
  }
}
.b-product-edit-price--modern.b-product-edit-price--workspace {
  max-width: 760px;
  width: 100%;
  margin-inline: auto;
  font-size: 13px;
  line-height: 20px;
  .sd-modern-widget {
    padding: 23px;
    border-radius: 16px;
    margin-block: 0 16px;
  }
  .b-product-edit-price__workspace-heading {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-block-end: 24px;
  }
  .b-product-edit-price__workspace-heading > svg {
    color: var(--sd-modern-muted);
    margin-block-start: 3px;
  }
  .b-product-edit-price__workspace-heading > div {
    flex: 1;
    min-width: 0;
  }
  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }
  .b-product-edit-price__workspace-heading p,
  .b-product-edit-price__workspace-subtitle p {
    margin: 5px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  .b-product-edit-price__workspace-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 207px;
    gap: 27px;
  }
  .b-product-edit-price__workspace-fields {
    min-width: 0;
  }
  .b-product-edit-price__workspace-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px;
  }
  .b-product-edit-price__workspace-grid > * {
    min-width: 0;
  }
  .b-product-edit-price__workspace-note {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    margin: 22px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
    svg {
      margin-block-start: 2px;
    }
  }
  .b-product-edit-price__workspace-receipt {
    min-width: 0;
    border-inline-start: 1px solid var(--sd-modern-border);
    padding-inline-start: 23px;
  }
  .b-product-edit-price__workspace-receipt-label {
    margin: 0;
    font-size: 12px;
    line-height: 19px;
    color: var(--sd-modern-muted);
  }
  .b-product-edit-price__workspace-total {
    display: block;
    margin-block: 6px 0;
    font-size: 29px;
    font-weight: 500;
    line-height: 38px;
    letter-spacing: -0.8px;
    overflow-wrap: anywhere;
  }
  .b-product-edit-price__workspace-total :deep(.small) {
    font-size: inherit !important;
    line-height: inherit;
  }
  .b-product-edit-price__workspace-price-label {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 19px;
    overflow-wrap: anywhere;
  }
  .b-product-edit-price__workspace-lines {
    display: grid;
    gap: 8px;
    margin: 19px 0 0;
    div {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: baseline;
      gap: 3px 12px;
      font-size: 12px;
      line-height: 19px;
    }
    dt {
      color: var(--sd-modern-muted);
    }
    dd {
      margin: 0;
      min-width: 0;
      font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
    }
  }
  .b-product-edit-price__workspace-period-state {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 19px 0 0;
    font-size: 11px;
    line-height: 18px;
  }
  .b-product-edit-price__workspace-receipt-help {
    margin: 5px 0 0;
    font-size: 11px;
    line-height: 18px;
    color: var(--sd-modern-muted);
  }
  .b-product-edit-price__workspace-disclosure {
    padding: 0;
  }
  .sd-modern-disclosure__summary {
    box-sizing: border-box;
    min-height: 84px;
    padding: 19px 23px;
    gap: 12px;
  }
  .sd-modern-disclosure__summary > svg {
    flex-shrink: 0;
    color: var(--sd-modern-muted);
  }
  .b-product-edit-price__workspace-summary {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    gap: 4px;
  }
  .b-product-edit-price__workspace-summary > span {
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
  }
  .b-product-edit-price__workspace-summary > small {
    font-size: 12px;
    line-height: 18px;
    color: var(--sd-modern-muted);
    overflow-wrap: anywhere;
  }
  details[open] > summary {
    min-height: 69px;
    padding-block-end: 12px;
    .b-product-edit-price__workspace-summary > span {
      font-size: 16px;
      line-height: 24px;
    }
    .b-product-edit-price__workspace-summary > small {
      display: none;
    }
    > svg:last-child {
      transform: rotate(180deg);
    }
  }
  .b-product-edit-price__workspace-disclosure-body {
    box-sizing: border-box;
    padding: 0 23px 23px;
  }
  .b-product-edit-price__workspace-subtitle {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-block-end: 20px;
    p {
      flex: 1;
      min-width: 0;
      margin: 0;
    }
  }
  .b-product-edit-price__workspace-discount {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(120px, 0.7fr);
    align-items: center;
    gap: 25px;
    > p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding-block-start: 10px;
    }
    strong {
      font-size: 17px;
      font-weight: 500;
      line-height: 24px;
    }
    span {
      font-size: 11px;
      line-height: 18px;
      color: var(--sd-modern-muted);
    }
  }
  .b-product-edit-price__workspace-schedule {
    margin-block-start: 23px;
  }
  .b-product-edit-price__workspace-dates {
    margin-block: 18px 16px;
    gap: 18px;
  }
  .b-product-edit-price__workspace-date-help {
    margin: 8px 0 0;
    font-size: 12px;
    line-height: 19px;
    color: var(--sd-modern-muted);
  }
  .b-product-edit-price__workspace-error {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-block: 17px 0;
    font-size: 13px;
    line-height: 21px;
    > svg {
      flex-shrink: 0;
      margin-block-start: 2px;
    }
  }
  .b-product-edit-price__workspace-tier-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    margin-block-end: 20px;
    p {
      margin: 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 19px;
    }
    .v-btn {
      flex-shrink: 0;
    }
  }
  .b-product-edit-price__workspace-count {
    font-size: 11px;
    line-height: 18px;
    white-space: nowrap;
    color: var(--sd-modern-muted);
  }
  .b-product-edit-price__workspace-tiers {
    margin-block-start: 20px;
    background: transparent;
    :deep(table) {
      table-layout: fixed;
      width: 100%;
    }
    :deep(th:last-child) {
      width: 92px;
    }
  }
  .b-product-edit-price__workspace-empty {
    text-align: center;
    padding: 25px 8px;
    > svg {
      color: var(--sd-modern-muted);
      margin-block-end: 10px;
    }
    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 21px;
    }
    p {
      margin: 6px 0 0;
      font-size: 12px;
      line-height: 19px;
      color: var(--sd-modern-muted);
    }
  }
  .b-product-edit-price__workspace-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding-block: 4px 9px;
    > div:first-child {
      min-width: 0;
    }
    p {
      display: flex;
      align-items: center;
      gap: 7px;
      margin: 0;
      font-size: 12px;
      line-height: 19px;
    }
    small {
      display: block;
      margin-block-start: 3px;
      font-size: 11px;
      line-height: 18px;
      color: var(--sd-modern-muted);
    }
  }
  .b-product-edit-price__workspace-actions {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-shrink: 0;
    > .v-btn {
      white-space: nowrap;
    }
  }
  .b-product-edit-price__workspace-notice {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    > svg {
      color: var(--sd-modern-muted);
      flex-shrink: 0;
      margin-block-start: 3px;
    }
    > div {
      flex: 1;
      min-width: 0;
    }
    h2 {
      font-size: 14px;
      line-height: 21px;
    }
    p {
      margin: 5px 0 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 19px;
    }
  }
  .b-product-edit-price__workspace-service {
    margin-block-end: 26px;
    h3 {
      margin: 0 0 10px;
      font-size: 12px;
      font-weight: 500;
      line-height: 19px;
    }
    :deep(.v-label) {
      font-size: 13px;
      line-height: 20px;
    }
  }
  .b-product-edit-price__workspace-method {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
    align-items: center;
    gap: 20px;
    margin-block-start: 17px;
    p {
      margin: 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 19px;
    }
  }
  :deep(.sd-modern-button .v-btn__content) {
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  :deep(
    .sd-modern-underlined-field
      .v-field.v-field--variant-underlined
      .v-field__input
  ),
  :deep(.sd-modern-underlined-field .v-field__input > input),
  :deep(.sd-modern-underlined-field .v-select__selection-text) {
    font-family: inherit;
    font-size: 14px !important;
    line-height: 22px;
  }
  :deep(.sd-modern-underlined-field .v-messages),
  :deep(.sd-modern-underlined-field .v-messages__message) {
    font-size: 12px;
    line-height: 19px;
  }
  &:dir(rtl) .b-product-edit-price__workspace-direction {
    transform: scaleX(-1);
  }
  @media (max-width: 880px) and (min-width: 721px) {
    .b-product-edit-price__workspace-layout {
      grid-template-columns: minmax(0, 1fr) 180px;
      gap: 20px;
    }
    .b-product-edit-price__workspace-fields
      .b-product-edit-price__workspace-grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 19px;
    }
    .b-product-edit-price__workspace-footer {
      flex-wrap: wrap;
    }
    .b-product-edit-price__workspace-actions {
      margin-inline-start: auto;
    }
  }
  @media (max-width: 720px) {
    .sd-modern-widget {
      padding-inline: 19px;
    }
    .b-product-edit-price__workspace-disclosure {
      padding: 0;
    }
    .sd-modern-disclosure__summary {
      padding-inline: 19px;
    }
    .b-product-edit-price__workspace-disclosure-body {
      padding-inline: 19px;
    }
  }
  @media (max-width: 600px) {
    .b-product-edit-price__workspace-card {
      padding-block: 23px;
    }
    .b-product-edit-price__workspace-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 24px;
    }
    .b-product-edit-price__workspace-grid,
    .b-product-edit-price__workspace-discount,
    .b-product-edit-price__workspace-method {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
    }
    .b-product-edit-price__workspace-receipt {
      border-inline-start: 0;
      border-block-start: 1px solid var(--sd-modern-border);
      padding-inline-start: 0;
      padding-block-start: 20px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(90px, 0.7fr);
      gap: 0 20px;
    }
    .b-product-edit-price__workspace-receipt-label,
    .b-product-edit-price__workspace-total,
    .b-product-edit-price__workspace-price-label {
      grid-column: 1;
    }
    .b-product-edit-price__workspace-lines {
      grid-column: 2;
      grid-row: 1 / 4;
      align-content: start;
      margin: 0;
      gap: 9px;
    }
    .b-product-edit-price__workspace-period-state,
    .b-product-edit-price__workspace-receipt-help {
      grid-column: 1 / -1;
    }
    .b-product-edit-price__workspace-discount > p {
      padding: 0;
    }
    .b-product-edit-price__workspace-tier-toolbar {
      flex-wrap: wrap;
      align-items: flex-start;
      .v-btn {
        margin-inline-start: auto;
      }
    }
    .b-product-edit-price__workspace-tiers :deep(thead) {
      display: none;
    }
    .b-product-edit-price__workspace-tiers :deep(table),
    .b-product-edit-price__workspace-tiers :deep(tbody) {
      display: block;
      width: 100%;
    }
    .b-product-edit-price__workspace-footer {
      flex-wrap: wrap;
      > div:first-child {
        flex-basis: 100%;
      }
    }
    .b-product-edit-price__workspace-actions {
      flex: 1 1 100%;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    :deep(
      .sd-modern-underlined-field
        .v-field.v-field--variant-underlined
        .v-field__input
    ),
    :deep(.sd-modern-underlined-field .v-field__input > input),
    :deep(.sd-modern-underlined-field .v-select__selection-text) {
      font-size: 16px !important;
    }
  }
  @media (max-width: 360px) {
    .sd-modern-widget {
      padding-inline: 15px;
    }
    .b-product-edit-price__workspace-disclosure {
      padding: 0;
    }
    .sd-modern-disclosure__summary {
      padding-inline: 15px;
      gap: 9px;
    }
    .b-product-edit-price__workspace-disclosure-body {
      padding-inline: 15px;
    }
    .b-product-edit-price__workspace-receipt {
      grid-template-columns: minmax(0, 1fr);
    }
    .b-product-edit-price__workspace-lines {
      grid-column: 1;
      grid-row: auto;
      margin-block-start: 16px;
    }
    .b-product-edit-price__workspace-actions > .sd-modern-button--primary {
      width: 100%;
    }
  }
}
.b-product-edit-price--modern.b-product-edit-price--workspace.b-product-edit-price--variant-form {
  max-width: none;

  .b-product-edit-price__workspace-card {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    margin-block-end: 28px;
  }
  .b-product-edit-price__workspace-fields > .b-product-edit-price__workspace-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .b-product-edit-price__workspace-layout {
    grid-template-columns: minmax(0, 1fr) 240px;
    gap: 24px;
  }
  .b-product-edit-price__workspace-receipt {
    border: 0;
    border-radius: 10px;
    padding: 20px;
    background: var(--sd-modern-inset);
  }
  .b-product-edit-price__workspace-note {
    margin-block-start: 18px;
    flex-wrap: wrap;
    font-size: 13px;
    line-height: 20px;
  }
  .b-product-edit-price__workspace-heading p,
  .b-product-edit-price__workspace-subtitle p,
  .b-product-edit-price__workspace-receipt-help,
  .b-product-edit-price__workspace-period-state,
  .b-product-edit-price__workspace-tier-toolbar p,
  .b-product-edit-price__workspace-date-help,
  .b-product-edit-price__workspace-empty p {
    font-size: 13px;
    line-height: 20px;
  }
  .b-product-edit-price__workspace-disclosure {
    margin-block-end: 10px;
    padding: 0;
    border-radius: 12px;
  }
  .sd-modern-disclosure__summary {
    min-height: 68px;
    padding: 14px 18px;
  }
  .b-product-edit-price__workspace-summary > span {
    font-size: 13px;
    line-height: 20px;
  }
  .b-product-edit-price__workspace-summary > small {
    font-size: 13px;
    line-height: 20px;
  }
  .b-product-edit-price__workspace-disclosure-body {
    padding: 0 18px 18px;
  }
  @media (max-width: 720px) {
    .b-product-edit-price__workspace-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 22px;
    }
    .b-product-edit-price__workspace-receipt {
      display: block;
    }
    .b-product-edit-price__workspace-lines {
      margin-block-start: 16px;
    }
  }
}
</style>
