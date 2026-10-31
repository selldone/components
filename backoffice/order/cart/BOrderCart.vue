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
  <v-data-table
    v-model="selected"
    v-model:page="page"
    :header-props="{ sortByText: $t('global.commons.sort_by') }"
    :headers="modern ? modern_headers : headers"
    :items="items"
    :items-per-page="itemsPerPage"
    :row-props="rowProps"
    :cell-props="modern && (isRolePanel || modernVendorPanel) ? roleCellProps : undefined"
    :show-select="!isModernHyper && (checkable || isModernFulfillment)"
    :class="
      modern
        ? [
            'b-order-cart-table-modern sd-modern-data-table sd-modern-data-table--compact text-start',
            { 'b-order-cart-table-modern--role': isRolePanel, 'b-order-cart-table-modern--vendor': modernVendorPanel },
          ]
        : 'rounded-xl overflow-hidden'
    "
    :mobile-breakpoint="modern ? 1000 : undefined"
    :hide-default-header="isModernFulfillment && $vuetify.display.xs"
    :mobile="modern && isRolePanel ? true : undefined"
    density="compact"
    hide-default-footer
    item-key="id"
    item-selectable
    return-object
    v-bind="$attrs"
  >
    <template v-if="isModernFulfillment" #header.data-table-select="{ allSelected, someSelected, selectAll }">
      <v-checkbox-btn :model-value="allSelected" :indeterminate="someSelected && !allSelected" :disabled="fulfillmentSelectionDisabled" :aria-label="$t(allSelected ? 'global.actions.deselect_all' : 'global.actions.select_all')" color="primary" @update:model-value="!fulfillmentSelectionDisabled && selectAll($event)" />
    </template>
    <template v-slot:item.data-table-select="{ item }">
      <v-checkbox-btn
        v-if="isModernFulfillment"
        :model-value="selected.some((entry) => entry.id === item.id)"
        :disabled="fulfillmentSelectionDisabled"
        :aria-label="$t(selected.some((entry) => entry.id === item.id) ? 'process_center.modern.deselect_item' : 'process_center.modern.select_item') + ': ' + getProduct(item)?.title"
        color="primary"
        @update:model-value="!fulfillmentSelectionDisabled && selected.toggle(item, 'id')"
      />
      <v-btn
        v-else
        :key="item.id"
        :color="selected.some((i) => i.id === item.id) ? modernVendorPanel ? 'primary' : 'success' : modernVendorPanel ? undefined : '#999'"
        icon
        size="small"
        variant="text"
        :aria-label="
          modern
            ? $t(
                selected.some((i) => i.id === item.id)
                  ? 'process_center.modern.deselect_item'
                  : 'process_center.modern.select_item',
              )
            : undefined
        "
        :aria-pressed="
          modern ? selected.some((i) => i.id === item.id) : undefined
        "
        :disabled="modernVendorPanel && (!checkable || readonly || busy_set_count_adjustment)"
        @click="(!modernVendorPanel || (checkable && !readonly && !busy_set_count_adjustment)) && selected.toggle(item, 'id')"
      >
        <v-tooltip
          v-if="modern"
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
        >
          {{
            $t(
              selected.some((i) => i.id === item.id)
                ? "process_center.modern.deselect_item"
                : "process_center.modern.select_item",
            )
          }}
        </v-tooltip>
        <v-scale-transition leave-absolute>
          <b-vendor-order-icon v-if="modernVendorPanel" :name="selected.some((i) => i.id === item.id) ? 'circle-check' : 'circle'" :size="20" />
          <v-icon v-else-if="selected.some((i) => i.id === item.id)" size="24">
            check_circle
          </v-icon>
          <v-icon v-else size="24"> radio_button_unchecked</v-icon>
        </v-scale-transition>
      </v-btn>
    </template>
    <template #item.fulfillment_availability="{ item }">
      <span class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot" :class="!selected.some((entry) => entry.id === item.id) ? 'sd-modern-status__dot--error' : !item.check && basket.delivery_state === PhysicalOrderStates.CheckQueue.code ? 'sd-modern-status__dot--warning' : 'sd-modern-status__dot--success'" />{{ $t(!selected.some((entry) => entry.id === item.id) ? 'process_center.modern.fulfillment_excluded' : !item.check && basket.delivery_state === PhysicalOrderStates.CheckQueue.code ? 'process_center.modern.fulfillment_awaiting_review' : 'process_center.modern.fulfillment_available') }}</span>
    </template>

    <template v-slot:item.row="{ index }">
      {{ index + 1 }}
    </template>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ product_id ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <template v-slot:item.product_id="{ item }">
      <router-link
        :to="
          isRolePanel
            ? {}
            : {
                name: IS_VENDOR_PANEL
                  ? 'Vendor_ProductDashboard'
                  : 'BPageProductDashboard',
                params: {
                  product_id: getProduct(item)?.id,
                },
              }
        "
        class="d-block"
        style="display: contents"
        title="Go to product's admin page."
      >
        <v-img
          v-if="getProduct(item)?.icon"
          :src="getShopImagePath(getProduct(item).icon, IMAGE_SIZE_SMALL)"
          aspect-ratio="1"
          class="item-image rounded pointer-pointer border hover-scale-small force-top mx-auto mt-1"
          color="#fff"
          max-height="84px"
          max-width="84px"
          min-height="42px"
          min-width="42px"
        >
        </v-img>
        <v-icon v-else class="ma-2" size="36">shelves</v-icon>
      </router-link>
      <div v-if="type === ProductType.PHYSICAL.code" class="py-1">
        <v-chip
          class="px-1 me-1"
          label
          size="x-small"
          title="Item weight"
          variant="outlined"
        >
          <v-icon class="me-1" size="x-small">scale</v-icon>
          {{ getWeight(item) }} {{ mass_unit }}
        </v-chip>
        <v-chip
          class="px-1"
          label
          size="x-small"
          title="Item size"
          variant="outlined"
        >
          <v-icon class="me-1" size="x-small">crop_free</v-icon>
          {{ getSize(item).join("x") }} {{ size_unit }}
        </v-chip>
      </div>
      <div v-if="type === ProductType.SERVICE.code" class="py-1">
        <v-chip
          v-if="getProduct(item)?.outputs?.type"
          class="px-1 me-1"
          label
          size="x-small"
          title="Service type"
          variant="outlined"
        >
          <v-icon class="me-1" size="x-small">home_repair_service</v-icon>
          {{ getProduct(item)?.outputs?.type }}
        </v-chip>
      </div>
    </template>
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ product.title ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <template v-slot:item.product.title="{ item }">
      <div :class="{ 'b-order-cart-table-modern__product': modern }">
        <button
          v-if="isModernHyper"
          type="button"
          class="b-order-cart-table-modern__image-link b-order-cart-table-modern__image-button"
          :aria-label="$t('process_center.modern.hyper_product_image') + ': ' + getProduct(item)?.title"
          @click.stop="image_item = item; image_dialog = true"
        >
          <v-img
            :src="getProduct(item)?.icon ? getShopImagePath(getProduct(item).icon, IMAGE_SIZE_SMALL) : getProductImage(item.product_id)"
            :alt="getProduct(item)?.title"
            aspect-ratio="1"
            class="item-image rounded border"
            color="#fff"
            width="42"
            height="42"
          />
          <v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('process_center.modern.hyper_product_image') }}</v-tooltip>
        </button>
        <router-link
          v-else-if="modern"
          :to="
            isRolePanel
              ? {}
              : {
                  name: IS_VENDOR_PANEL
                    ? 'Vendor_ProductDashboard'
                    : 'BPageProductDashboard',
                  params: { product_id: getProduct(item)?.id },
                }
          "
          class="b-order-cart-table-modern__image-link"
          :aria-label="getProduct(item)?.title"
        >
          <v-img
            v-if="getProduct(item)?.icon"
            :src="getShopImagePath(getProduct(item).icon, IMAGE_SIZE_SMALL)"
            :alt="getProduct(item)?.title"
            aspect-ratio="1"
            class="item-image rounded border"
            color="#fff"
            width="42"
            height="42"
          />
          <b-vendor-order-icon v-else-if="modernVendorPanel" name="package" :size="36" />
          <v-icon v-else size="36">shelves</v-icon>
        </router-link>
        <div :class="{ 'b-order-cart-table-modern__product-body': modern }">
          <p class="m-0 font-weight-bold min-width-150 text-start">
            <v-avatar
              v-if="getProduct(item).connect_id"
              class="me-1"
              rounded
              size="26"
              ><img
                :src="getConnectIcon(getProduct(item).connect_id)"
                title="Connect OS"
            /></v-avatar>
            <router-link
              v-if="isModernHyper"
              :to="{ name: 'BPageProductDashboard', params: { product_id: getProduct(item)?.id } }"
              class="b-order-cart-table-modern__product-link"
            >
              {{ getProduct(item).title }}
              <v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('process_center.modern.hyper_product_admin') }}</v-tooltip>
            </router-link>
            <template v-else>{{ modern ? getProduct(item).title : getProduct(item).title?.limitWords(12) }}</template>

            <v-chip v-if="isFulfillment && !modern" size="x-small">
              <v-avatar
                :image="
                  getShopImagePath(getProduct(item).icon, IMAGE_SIZE_SMALL)
                "
                start
              ></v-avatar>
              Reseller
              <v-tooltip
                activator="parent"
                :content-class="
                  modern
                    ? 'sd-modern-tooltip text-start'
                    : 'text-start bg-black py-2 rounded-xl'
                "
                :location="modern ? 'top' : undefined"
                :max-width="modern ? undefined : 360"
              >
                <v-avatar
                  :image="getShopIcon(getProduct(item).shop_id)"
                  class="me-2 avatar-gradient -thin -shop"
                  size="24"
                >
                </v-avatar>

                <b>Reseller Product</b>

                <v-row class="mt-2" no-gutters>
                  <v-avatar
                    :image="
                      getShopImagePath(getProduct(item).icon, IMAGE_SIZE_SMALL)
                    "
                    class="me-2"
                    rounded="lg"
                    size="64"
                  ></v-avatar>
                  <div>
                    <div>
                      {{ getProduct(item)?.title?.limitWords(12) }}
                    </div>
                    <div class="small">
                      {{ getProduct(item)?.title_en?.limitWords(24) }}
                    </div>

                    <variant-item-view-micro
                      v-if="item.variant"
                      :product-variant="item.variant"
                    />
                  </div>
                </v-row>
              </v-tooltip>
            </v-chip>
          </p>
          <small class="d-block text-start">
            {{
              modern
                ? getProduct(item).title_en
                : getProduct(item).title_en?.limitWords(24)
            }}</small
          >
          <div v-if="modern" class="b-order-cart-table-modern__metadata">
            <span class="b-order-cart-table-modern__identifiers">
              <button v-if="isModernFulfillment" v-copy type="button" class="b-order-cart-table-modern__inline-copy" @click.stop>P-{{ getProduct(item).id }}</button>
              <span v-else>P-{{ getProduct(item).id }}</span>
              <span v-if="getVariant(item)">SVP-{{ getVariant(item).id }}</span>
              <span
                v-if="
                  (getVariant(item) && getVariant(item).sku) ||
                  getProduct(item).sku
                "
              >
                {{ $t("global.commons.sku") }}:
                {{
                  getVariant(item) && getVariant(item).sku
                    ? getVariant(item).sku
                    : getProduct(item).sku
                }}
              </span>
              <span
                v-if="
                  (getVariant(item) && getVariant(item).mpn) ||
                  getProduct(item).mpn
                "
              >
                {{ $t("global.commons.mpn") }}:
                {{
                  getVariant(item) && getVariant(item).mpn
                    ? getVariant(item).mpn
                    : getProduct(item).mpn
                }}
              </span>
            </span>
            <span v-if="isModernFulfillment" class="b-order-cart-table-modern__fulfillment-warranty">
              <span v-if="getProduct(item).original"><v-icon size="13" aria-hidden="true">verified</v-icon>{{ $t('global.commons.original') }}</span>
              <span v-if="getProduct(item).warranty"><v-icon size="13" aria-hidden="true">workspace_premium</v-icon>{{ getProduct(item).warranty }}</span>
              <span v-if="getProduct(item).return_warranty"><v-icon size="13" aria-hidden="true">assignment_return</v-icon>{{ $t('global.return_warranty_days', { days: getProduct(item).return_warranty }) }}</span>
              <span v-else><v-icon size="13" aria-hidden="true">disabled_by_default</v-icon>{{ $t('global.no_return_warranty') }}</span>
            </span>
            <span
              v-if="type === ProductType.PHYSICAL.code"
              class="b-order-cart-table-modern__physical"
            >
              <span :title="$t('global.commons.weight')">
                <b-vendor-order-icon v-if="modernVendorPanel" name="weight" :size="14" class="me-1" /><v-icon v-else size="14" class="me-1">scale</v-icon>{{ getWeight(item) }} {{ mass_unit }}
              </span>
              <span :title="$t('global.commons.size')">
                <b-vendor-order-icon v-if="modernVendorPanel" name="ruler" :size="14" class="me-1" /><v-icon v-else size="14" class="me-1">crop_free</v-icon>{{ getSize(item).join(" × ") }} {{ size_unit }}
              </span>
            </span>
            <span
              v-if="
                type === ProductType.SERVICE.code &&
                getProduct(item)?.outputs?.type
              "
            >
              <v-icon size="14" class="me-1">home_repair_service</v-icon
              >{{ getProduct(item).outputs.type }}
            </span>
            <v-btn
              v-if="
                type === ProductType.VIRTUAL.code &&
                !isRolePanel &&
                !IS_VENDOR_PANEL
              "
              :to="{ name: 'BPageOrderVirtualInput', params: $route.params }"
              class="sd-modern-button sd-modern-button--compact sd-modern-button--inline"
              color="primary"
              variant="text"
              @click.stop
            >
              <v-icon size="16" start aria-hidden="true">input</v-icon>
              {{ $t("process_center.modern.virtual_open_form") }}
            </v-btn>
          </div>
          <details v-if="isModernHyper" class="b-order-cart-table-modern__item-details">
            <summary class="no-inv">
              <v-icon size="14" aria-hidden="true">info_outline</v-icon>
              {{ $t('process_center.modern.hyper_item_details') }}
              <v-icon class="b-order-cart-table-modern__disclosure-icon" size="14" aria-hidden="true">expand_more</v-icon>
            </summary>
            <dl>
              <div><dt>{{ $t('global.basket_list.table.count') }}</dt><dd>{{ numeralFormat(item.count, getProduct(item)?.unit_float ? '0,0.[000]' : '0,0') }} {{ getProduct(item)?.unit }}</dd></div>
              <div v-if="item.price !== undefined"><dt>{{ $t('process_center.modern.hyper_item_unit_price') }}</dt><dd><u-price :amount="item.price" :currency="item.currency" /></dd></div>
              <div v-if="item.price !== undefined"><dt>{{ $t('process_center.modern.hyper_item_total') }}</dt><dd><u-price :amount="item.count * item.price - (item.offer_amount || 0)" :currency="item.currency" /></dd></div>
              <div v-if="item.tax"><dt>{{ $t('global.commons.tax') }}</dt><dd><u-price :amount="item.tax.amount" :currency="item.currency" /></dd></div>
            </dl>
          </details>
          <variant-item-view-micro
            v-if="!modern && getVariant(item)"
            :product-variant="getVariant(item)"
          />
        </div>
        <v-btn
          v-if="modern && isRolePanel"
          icon
          variant="text"
          class="sd-modern-icon-button b-order-cart-table-modern__details-toggle"
          :aria-expanded="role_details.includes(item.id)"
          :aria-label="
            $t(
              role_details.includes(item.id)
                ? 'role_workspace.hide_item_details'
                : 'role_workspace.show_item_details',
            )
          "
          @click.stop="toggleRoleDetails(item)"
        >
          <v-icon size="16" aria-hidden="true">{{
            role_details.includes(item.id) ? "expand_less" : "expand_more"
          }}</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
          >
            {{
              $t(
                role_details.includes(item.id)
                  ? "role_workspace.hide_item_details"
                  : "role_workspace.show_item_details",
              )
            }}
          </v-tooltip>
        </v-btn>
      </div>
    </template>
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ variant ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <template v-slot:item.variant="{ item }">
      <variant-item-view-micro
        v-if="modern && getVariant(item)"
        :product-variant="getVariant(item)"
        class="b-order-cart-table-modern__variant"
      />
      <div v-if="!modern" class="small text-start">
        <!-- ▃▃▃▃▃▃▃▃▃ ID ▃▃▃▃▃▃▃▃▃ -->

        <p
          class="my-1 font-weight-bold text-center rounded text-white"
          style="background: #222"
        >
          P-{{ getProduct(item).id }}
          <span v-if="getVariant(item)"> / SVP-{{ getVariant(item).id }}</span>
        </p>
        <!-- ▃▃▃▃▃▃▃▃▃ SKU ▃▃▃▃▃▃▃▃▃ -->

        <p
          v-if="
            (getVariant(item) && getVariant(item).sku) || getProduct(item).sku
          "
          class="my-1"
        >
          <small class="me-1">SKU: </small>
          {{
            getVariant(item) && getVariant(item).sku
              ? getVariant(item).sku
              : getProduct(item).sku
          }}
        </p>
        <!-- ▃▃▃▃▃▃▃▃▃ MPN ▃▃▃▃▃▃▃▃▃ -->

        <p
          v-if="
            (getVariant(item) && getVariant(item).mpn) || getProduct(item).mpn
          "
          class="my-1"
        >
          <small class="me-1">MPN: </small>
          {{
            getVariant(item) && getVariant(item).mpn
              ? getVariant(item).mpn
              : getProduct(item).mpn
          }}
        </p>
      </div>
      <!-- ▃▃▃▃▃▃▃▃▃ Price input mode for physical products ▃▃▃▃▃▃▃▃▃ -->
      <div
        v-if="
          item.preferences && item.preferences.dim_1 && item.preferences.dim_2
        "
        class="mt-2 d-flex align-stretch align-center"
      >
        <div
          :title="$t('global.commons.width')"
          class="pa-1 m-1 rounded border flex-grow-1"
        >
          {{ item.preferences.dim_1 }}
        </div>
        <v-icon size="x-small" class="my-auto">close</v-icon>
        <div
          :title="$t('global.commons.length')"
          class="pa-1 m-1 rounded border flex-grow-1"
        >
          {{ item.preferences.dim_2 }}
        </div>
        <template
          v-if="
            item.preferences.dim_3 && getProduct(item)?.price_input === 'volume'
          "
        >
          <v-icon size="x-small" class="my-auto">close</v-icon>
          <div
            :title="$t('global.commons.height')"
            class="pa-1 m-1 rounded border flex-grow-1"
          >
            {{ item.preferences.dim_3 }}
          </div>
        </template>
      </div>
      <!-- ▃▃▃▃▃▃▃▃▃ 🎗️ Subscription ▃▃▃▃▃▃▃▃▃ -->
      <div
        v-if="item.subscription_price"
        :title="modern ? undefined : item.subscription_price?.description"
        :class="
          modern
            ? 'b-order-cart-table-modern__plan text-start'
            : 'my-1 small text-start'
        "
      >
        <b :class="modern ? 'b-order-cart-table-modern__plan-title' : 'd-block'"
          ><img
            class="me-1"
            height="16"
            src="@selldone/core-js/assets/product-types/subscription.svg"
            width="16"
          />
          {{ item.subscription_price.title }}
          <v-tooltip
            v-if="modern && item.subscription_price.description"
            location="top"
            content-class="sd-modern-tooltip text-start"
            :open-on-focus="true"
            :open-on-click="true"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="info_outline"
                variant="text"
                class="sd-modern-icon-button sd-modern-info-button"
                :aria-label="$t('process_center.modern.subscription_plan_help')"
              ></v-btn>
            </template>
            {{ item.subscription_price.description }}
          </v-tooltip>
        </b>
        <u-price
          :amount="item.subscription_price.price"
          :currency="item.subscription_price.currency"
        ></u-price>
        /
        {{ $t(BillingPeriod[item.subscription_price.period]?.title) }}
      </div>
    </template>
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ product.original ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <template v-slot:item.product.original="{ item }">
      <div
        v-if="getProduct(item).original"
        :title="$t('global.original_warranty')"
        class="my-1 min-width-150"
      >
        <v-icon class="me-1" :class="{ 'no-inv': modern }" color="blue" size="small">verified</v-icon>
        <span class="small">{{ $t("global.commons.original") }}</span>
      </div>

      <div
        v-if="getProduct(item).warranty"
        :title="getProduct(item).warranty"
        class="my-1"
      >
        <v-icon class="me-1" :class="{ 'no-inv': modern }" color="amber" size="small"
          >workspace_premium
        </v-icon>

        <span class="small">
          {{
            modern
              ? getProduct(item).warranty
              : getProduct(item).warranty?.limitWords(2)
          }}</span
        >
      </div>

      <div
        v-if="getProduct(item).return_warranty"
        :title="
          $t('global.return_warranty_days', {
            days: getProduct(item).return_warranty,
          })
        "
        class="text-green my-1"
        :class="{ 'no-inv': modern }"
      >
        <v-icon class="me-1" color="green" size="small"
          >assignment_return
        </v-icon>
        <span class="small">
          {{ getProduct(item).return_warranty }}🞫
          {{ $t("global.commons.days") }}
        </span>
      </div>

      <div v-else class="my-1">
        <v-icon class="me-1" size="small">disabled_by_default</v-icon>

        <span class="small"> {{ $t("global.no_return_warranty") }}</span>
      </div>
    </template>
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ count ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <template v-slot:item.count="{ item }">
      <div
        class="min-width-150 mb-1"
        @click="
          can_set_count_adjustment ? showCountAdjustmentDialog(item) : undefined
        "
        :class="{ 'hover-editable': can_set_count_adjustment }"
        :role="modern && can_set_count_adjustment ? 'button' : undefined"
        :tabindex="modern && can_set_count_adjustment ? 0 : undefined"
        :aria-disabled="
          modern && can_set_count_adjustment
            ? busy_set_count_adjustment
            : undefined
        "
        :aria-label="
          modern && can_set_count_adjustment
            ? $t('process_center.modern.quantity_adjust')
            : undefined
        "
        @keydown.enter.prevent="
          modern && can_set_count_adjustment && showCountAdjustmentDialog(item)
        "
        @keydown.space.prevent="
          modern && can_set_count_adjustment && showCountAdjustmentDialog(item)
        "
      >
        <v-tooltip
          v-if="modern && can_set_count_adjustment"
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
        >
          {{ $t("process_center.modern.quantity_adjust") }}
        </v-tooltip>
        <u-text-decimal
          class="text-h4 font-weight-black"
          :value="
            item.count + (!isModernFulfillment && !isModernHyper && item.count_adjustment ? item.count_adjustment : 0)
          "
          :decimals="item.product?.unit_float ? 3 : 0"
          compact
        ></u-text-decimal>
        {{ getProduct(item)?.unit ? getProduct(item).unit : isModernFulfillment ? '' : "🞪" }}
        <b-vendor-order-icon v-if="modernVendorPanel && can_set_count_adjustment" name="pencil" :size="14" class="ms-1" />
        <v-icon v-else-if="modern && can_set_count_adjustment" class="ms-1" size="14"
          >edit</v-icon
        >
        <i
          v-else-if="can_set_count_adjustment"
          class="edit-icon fas fa-edit me-n3"
        ></i>
      </div>
      <v-chip
        v-if="item.count_adjustment && !isModernFulfillment && !isModernHyper"
        size="x-small"
        color="#333"
        variant="flat"
        class="ma-1"
      >
        {{ $t("global.commons.adjusted") }}: {{ item.count_adjustment }}

        <v-tooltip
          activator="parent"
          :location="modern ? 'top' : 'bottom'"
          :content-class="
            modern ? 'sd-modern-tooltip text-start' : 'bg-black text-start'
          "
        >
          {{ $t("global.commons.original_amount") }}:
          <b
            >{{ item.count }}
            {{ getProduct(item)?.unit ? getProduct(item).unit : "🞪" }}</b
          ><br />
          {{ $t("global.commons.adjustment_amount") }}:
          <b
            >{{ item.count_adjustment }}
            {{ getProduct(item)?.unit ? getProduct(item).unit : "🞪" }}</b
          >

          <div class="border-top border-white mt-1 pt-1">
            {{ $t("global.commons.final_amount") }}:
            <b
              >{{ item.count + item.count_adjustment }}
              {{ getProduct(item)?.unit ? getProduct(item).unit : "🞪" }}</b
            >
          </div>
        </v-tooltip>
      </v-chip>
      <v-chip
        v-if="
          !isModernFulfillment && !isModernHyper && !item.check &&
          basket.delivery_state === PhysicalOrderStates.CheckQueue.code
        "
        color="amber"
        pill
        size="x-small"
        variant="flat"
        class="ma-1"
      >
        <v-icon start>hourglass_empty</v-icon>
        {{ $t("global.commons.waiting") }}
      </v-chip>

      <v-chip
        v-else-if="!isModernFulfillment && !isModernHyper && (readonly || item.check)"
        color="green"
        pill
        size="x-small"
        variant="flat"
        class="ma-1"
      >
        <v-icon start>check_circle</v-icon>
        {{ $t("global.commons.available") }}
      </v-chip>
      <v-chip
        v-else-if="!isModernFulfillment && !isModernHyper"
        color="red"
        pill
        size="x-small"
        variant="flat"
        class="ma-1"
      >
        <v-icon start>cancel</v-icon>
        {{ $t("global.commons.not_available") }}
      </v-chip>

      <v-btn
        v-if="!isModernHyper && item.return_request"
        :color="getReturnRequestStateObject(item.return_request.state).color"
        class="ma-1"
        rounded
        size="small"
        variant="flat"
      >
        <v-icon
          :color="getReturnRequestStateObject(item.return_request.state).color"
          class="circle-bg"
          size="12px"
          start
        >
          {{ getReturnRequestStateObject(item.return_request.state).icon }}
        </v-icon>
        {{
          $t("global.basket_list.return_count", {
            count: item.return_request.count,
          })
        }}
      </v-btn>
    </template>
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ price ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <template v-slot:item.price="{ item }">
      <div
        :class="modern ? 'b-order-cart-table-modern__price' : 'min-width-150'"
      >
        <template v-if="IS_VENDOR_PANEL">
          <!-- --- Vendor Price --- -->
          <u-price
            v-if="item.vendor_price !== undefined"
            :amount="item.vendor_price"
            :currency="item.currency"
            class="text-h4"
          ></u-price>
        </template>

        <template v-else>
          <!-- --- Main Price --- -->
          <u-price
            v-if="item.price !== undefined"
            :amount="
              item.count * item.price -
              (item.offer_amount ? item.offer_amount : 0)
            "
            :currency="item.currency"
            class="text-h4"
          ></u-price>

          <!-- --- Vendor Price --- -->

          <div v-if="item.vendor_price">
            <small>{{ $t("global.commons.vendor") }}:</small>
            <u-price
              :amount="item.vendor_price"
              :currency="item.currency"
              class="ms-1"
            ></u-price>
            <u-tooltip-tips
              >The cost of the item should be paid to the vendor.
            </u-tooltip-tips>
          </div>

          <div v-if="item.offer_amount">
            <v-chip class="ms-2" color="blue" size="small" title="Offer">
              <v-icon size="small" start>confirmation_number</v-icon>
              <u-price
                :amount="item.offer_amount"
                :currency="item.currency"
              ></u-price>
            </v-chip>
          </div>

          <!-- --- Tax --- -->

          <div v-if="item.tax" class="small border-between-vertical">
            <u-text-value-dashed title="Calculated tax by a dedicated rule.">
              <template v-slot:label>{{ $t("global.commons.tax") }}</template>
              <v-chip
                v-if="item.tax.included"
                class="mx-1"
                color="#CDDC39"
                label
                size="x-small"
                title="Included in product price"
                >included
              </v-chip>
              <u-price
                :amount="item.tax.amount"
                :currency="item.currency"
              ></u-price>
            </u-text-value-dashed>

            <u-text-value-dashed v-if="item.tax.shipping">
              <template v-slot:label>Shipping Tax</template>
              <u-price
                :amount="item.tax.shipping"
                :currency="item.currency"
              ></u-price>
            </u-text-value-dashed>
          </div>
        </template>

        <component
          :is="modern ? 'details' : 'div'"
          v-if="
            item.preferences &&
            item.preferences.valuation &&
            getProduct(item).price_input === 'custom'
          "
          :class="
            modern ? 'b-order-cart-table-modern__valuation' : 'small border-top'
          "
        >
          <summary v-if="modern">
            <v-icon size="16">tune</v-icon>
            {{ $t("process_center.modern.basket_valuation_details") }}
            <v-icon class="b-order-cart-table-modern__disclosure-icon" size="14"
              >expand_more</v-icon
            >
          </summary>
          <u-text-value-dashed
            v-for="(valuation_item, j) in getProduct(item).valuation.structure"
            :key="j"
            :title="valuation_item.placeholder"
          >
            <template v-slot:label>{{ valuation_item.title }}</template>
            <u-check
              v-if="isBoolean(item.preferences.valuation[valuation_item.name])"
              :value="item.preferences.valuation[valuation_item.name]"
            ></u-check>
            <span v-else>{{
              item.preferences.valuation[valuation_item.name]
            }}</span>
          </u-text-value-dashed>

          <v-btn
            class="tnt ma-1"
            color="primary"
            size="small"
            title="Custom valuation inputs."
            variant="text"
            @click="showCustomizeDetail(item)"
          >
            <img
              class="me-1"
              height="16"
              src="../../../assets/icons/valuation.svg"
              width="16"
            />
            {{
              modern
                ? $t("process_center.modern.basket_valuation_preferences")
                : "Valuation Preferences"
            }}
          </v-btn>
        </component>
      </div>
    </template>
    <template v-slot:bottom>
      <div :class="{ 'sd-modern-table-footer': modern }">
        <span v-if="modern">{{
          $t("process_center.modern.page_summary", {
            page,
            pages: pageCount || 1,
          })
        }}</span>
        <v-pagination
          v-if="pageCount > 1"
          v-model="page"
          :length="pageCount"
          :class="modern ? 'sd-modern-pagination' : 'my-5'"
          rounded
        />
      </div>
    </template>
  </v-data-table>

  <!-- ██████████████████████ Dialog > Valuation Details ██████████████████████ -->

  <v-dialog
    v-model="customize_detail_dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card
      class="text-start"
      :class="{ 'b-order-cart-dialog-modern': modern }"
    >
      <v-card-title>
        <img
          class="me-2"
          height="24"
          src="../../../assets/icons/valuation.svg"
          width="24"
        />
        Custom Valuation Pricing
      </v-card-title>
      <v-card-text v-if="selected_item">
        <s-product-section-valuation
          :current-variant="selected_item.variant"
          :preferences="selected_item.preferences"
          :product="getProduct(selected_item)"
          readonly
        ></s-product-section-valuation>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            :class="{ 'sd-modern-button sd-modern-button--compact': modern }"
            :size="modern ? undefined : 'x-large'"
            variant="text"
            @click="customize_detail_dialog = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-if="isModernHyper" v-model="image_dialog" max-width="640" :aria-label="$t('process_center.modern.hyper_product_image')">
    <v-card class="b-order-cart-dialog-modern text-start">
      <v-card-title class="d-flex align-center">
        <span class="flex-grow-1">{{ $t('global.basket_list.table.image') }}</span>
        <v-btn icon variant="text" class="sd-modern-icon-button" :aria-label="$t('global.actions.close')" @click="image_dialog = false">
          <v-icon size="18" aria-hidden="true">close</v-icon>
          <v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
        </v-btn>
      </v-card-title>
      <v-card-text v-if="image_item">
        <v-img :src="getProduct(image_item)?.icon ? getShopImagePath(getProduct(image_item).icon) : getProductImage(image_item.product_id, 640)" :alt="getProduct(image_item)?.title" max-height="480" contain />
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- ██████████████████████ Dialog > Count Adjustment ██████████████████████ -->

  <v-bottom-sheet
    v-if="!isRolePanel"
    v-model="count_adjustment_dialog"
    max-width="98vw"
    width="640"
    scrollable
    content-class="rounded-t-xl"
  >
    <v-card
      class="text-start"
      :class="{ 'b-order-cart-dialog-modern': modern, 'b-order-cart-dialog-modern--vendor': modernVendorPanel }"
      rounded="t-xl"
    >
      <v-card-title>
        <b-vendor-order-icon v-if="modernVendorPanel" name="pencil" :size="20" class="me-2" /><v-icon v-else class="me-2">content_cut</v-icon>
        {{ modernVendorPanel ? $t('vendor_fulfillment.quantity_title') : 'Count Adjustment' }}
      </v-card-title>
      <v-card-text
        v-if="selected_item"
        :class="{ disabled: IS_MARKETPLACE && !IS_VENDOR_PANEL }"
        class="position-relative"
      >
        <div v-if="modernVendorPanel" class="b-order-cart-dialog-modern__vendor-product"><v-img v-if="getProduct(selected_item)?.icon" :src="getShopImagePath(getProduct(selected_item).icon)" width="42" height="42" /><span>{{ getProduct(selected_item)?.title }}</span></div>
        <div v-if="IS_MARKETPLACE && !IS_VENDOR_PANEL" class="py-3 typo-body">
          <v-icon>warning_amber</v-icon>
          <b class="mx-1">{{ $t("global.commons.marketplace") }} | </b>
          In vendor panel vendor and you can adjust this option.
        </div>

        <p v-if="modernVendorPanel">{{ $t('vendor_fulfillment.quantity_help') }}</p>
        <p v-else>
          If you can only fulfill a portion of the order for this item, you can
          specify the adjustment amount here. If the product supports floating
          units, you can enter a decimal value. The adjustment can be either
          positive or negative.
        </p>
        <u-number-input
          v-model="count_adjustment_input"
          :variant="modernVendorPanel ? 'underlined' : 'outlined'"
          :decimal="selected_item_unit_float ? 3 : 0"
          :label="modernVendorPanel ? $t('vendor_fulfillment.adjustment') : 'Count Adjustment'"
          rounded="lg"
          class="strong-field mt-5"
          :class="{ 'sd-modern-underlined-field': modernVendorPanel }"
          :disabled="(IS_MARKETPLACE && !IS_VENDOR_PANEL) || (modernVendorPanel && (!can_set_count_adjustment || busy_set_count_adjustment))"
          :show-buttons="!(IS_MARKETPLACE && !IS_VENDOR_PANEL)"
          :min="-selected_item.count"
        ></u-number-input>

        <div v-if="modernVendorPanel" class="b-order-cart-dialog-modern__vendor-quantities">
          <div><span>{{ $t('vendor_fulfillment.original_quantity') }}</span><b><u-text-decimal :value="selected_item.count" :decimals="selected_item_unit_float ? 3 : 0" /><small>{{ getProduct(selected_item)?.unit }}</small></b></div>
          <div><span>{{ $t('vendor_fulfillment.adjustment') }}</span><b><span v-if="count_adjustment_input > 0">+</span><u-text-decimal :value="count_adjustment_input" :decimals="selected_item_unit_float ? 3 : 0" /><small>{{ getProduct(selected_item)?.unit }}</small></b></div>
          <div><span>{{ $t('vendor_fulfillment.final_quantity') }}</span><b><u-text-decimal :value="selected_item.count + count_adjustment_input" :decimals="selected_item_unit_float ? 3 : 0" /><small>{{ getProduct(selected_item)?.unit }}</small></b></div>
        </div>
        <div v-else class=" ">
          <div class="text-center">
            <small>Final Count</small>
            <div
              class="text-h3 font-weight-black"
              :class="{
                'text-green': count_adjustment_input > 0,
                'text-red': count_adjustment_input < 0,
              }"
            >
              <u-text-decimal
                :value="selected_item.count + count_adjustment_input"
                :decimals="selected_item_unit_float ? 3 : 0"
              ></u-text-decimal>

              <small style="font-size: 12px">{{
                getProduct(selected_item)?.unit
              }}</small>
            </div>
          </div>

          <div
            class="d-flex align-center justify-center text-center px-3 py-3 flex-grow-1"
          >
            <div>
              <v-avatar size="92" variant="elevated" class="elevation-5">
                <v-avatar
                  :image="getShopImagePath(getProduct(selected_item)?.icon)"
                  size="84"
                  class="elevation-1"
                />
              </v-avatar>
              <br />
              <small>
                {{ selected_item.count }}
                <small>{{ getProduct(selected_item)?.unit }}</small>
              </small>
            </div>

            <v-scale-transition hide-on-leave>
              <div v-if="count_adjustment_input < 0" class="ms-2">
                <div class="d-inline-block">
                  <v-icon color="red">remove</v-icon>
                  <v-avatar
                    :image="getShopImagePath(getProduct(selected_item)?.icon)"
                    :size="(84 * -count_adjustment_input) / selected_item.count"
                    style="border: solid red 3px"
                    class="elevation-3 t-all-400"
                  />
                  <br />
                  <small>
                    {{ count_adjustment_input }}
                    <small>{{ getProduct(selected_item)?.unit }}</small>
                  </small>
                </div>
              </div>

              <div v-else-if="count_adjustment_input > 0" class="ms-2">
                <div class="d-inline-block">
                  <v-icon color="green">add</v-icon>

                  <v-avatar
                    :image="
                      getShopImagePath(getProduct(selected_item)?.icon, 256)
                    "
                    :size="
                      Math.min(
                        (84 * count_adjustment_input) / selected_item.count,
                        2.5 * 84,
                      )
                    "
                    style="border: solid green 3px"
                    class="elevation-3 t-all-400"
                  />
                  <br />
                  <small>
                    {{ count_adjustment_input }}
                    <small>{{ getProduct(selected_item)?.unit }}</small>
                  </small>
                </div>
              </div>
            </v-scale-transition>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            :class="{ 'sd-modern-button sd-modern-button--compact': modern }"
            :size="modern ? undefined : 'x-large'"
            variant="text"
            @click="count_adjustment_dialog = false"
            :prepend-icon="modernVendorPanel ? undefined : 'close'"
          >
            <b-vendor-order-icon v-if="modernVendorPanel" name="x" :size="17" class="me-2" />
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            v-if="!(IS_MARKETPLACE && !IS_VENDOR_PANEL)"
            :class="{ 'sd-modern-button sd-modern-button--compact': modern }"
            :size="modern ? undefined : 'x-large'"
            color="primary"
            :prepend-icon="modernVendorPanel ? undefined : 'check'"
            variant="elevated"
            @click="setCountAdjustment"
            :loading="busy_set_count_adjustment"
            :disabled="
              modern && (!can_set_count_adjustment || busy_set_count_adjustment)
            "
          >
            <b-vendor-order-icon v-if="modernVendorPanel" name="save" :size="17" class="me-2" />
            {{ $t("global.actions.save") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import VariantItemViewMicro from "../../../storefront/product/variant/VariantItemViewMicro.vue";
import BVendorOrderIcon from "../../process-center/list/icon/BVendorOrderIcon.vue";
import { BasketHelper } from "@selldone/core-js/helper/shop/BasketHelper";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import UTextValueDashed from "../../../ui/text/value-dashed/UTextValueDashed.vue";
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import { OrderTypeCode } from "@selldone/core-js/enums/order/OrderTypeCode";
import SProductSectionValuation from "../../../storefront/product/section/valuation/SProductSectionValuation.vue";
import { Basket, BasketItemReturn } from "@selldone/core-js";
import UTooltipTips from "@selldone/components-vue/ui/tooltip/tips/UTooltipTips.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType.ts";
import OrderMixin from "@selldone/components-vue/mixin/order/OrderMixin.ts";
import UNumberInput from "@selldone/components-vue/ui/number/input/UNumberInput.vue";
import SImageUploader from "@selldone/components-vue/ui/uploader/SImageUploader.vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel.ts";
import UTextDecimal from "@selldone/components-vue/ui/text/decimal/UTextDecimal.vue";

export default {
  name: "BOrderCart",
  mixins: [OrderMixin],
  emits: ["fetch-order"],
  components: {
    BVendorOrderIcon,
    UTextDecimal,
    SImageUploader,
    UNumberInput,
    UTooltipTips,
    UTextValueDashed,
    SProductSectionValuation,
    VariantItemViewMicro,
  },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
    basket: {
      required: true,
      type: Object,
    },
    type: {},
    items: {
      required: true,
      type: Array,
    },

    checkable: {
      required: false,
      type: Boolean,
      default: false,
    },

    selectAll: {
      required: false,
      type: Boolean,
      default: false,
    },
    readonly: {
      // For POS orders > Don't need to check items in the basket!
      default: false,
      type: Boolean,
    },
    isRolePanel: Boolean,
  },

  data: function () {
    return {
      PhysicalOrderStates: Basket.PhysicalOrderStates,

      ProductType: ProductType,

      BillingPeriod: BillingPeriod,
      selected: [],
      role_details: [],
      image_item: null,
      image_dialog: false,

      page: 1,
      itemsPerPage: 10,

      headers: [
        {
          title: "#",
          align: "center",
          sortable: false,
          value: "row",
        },
        {
          title: this.$t("global.basket_list.table.image"),
          align: "center",
          sortable: false,
          value: "product_id",
        },

        {
          title: this.$t("global.basket_list.table.product_name"),
          align: "start",
          sortable: true,
          value: "product.title",
        },

        {
          title: this.$t("global.basket_list.table.variant"),
          align: "center",
          sortable: true,
          value: "variant",
        },

        {
          title: this.$t("global.basket_list.table.warranty"),
          align: "start",
          sortable: true,
          value: "product.original",
        },

        {
          title: this.$t("global.basket_list.table.count"),
          align: "center",
          sortable: true,
          value: "count",
        },

        {
          title: this.$t("global.basket_list.table.price"),
          align: "center",
          sortable: true,
          value: "price",
        },
      ],

      //-----------------------------------
      selected_item: null,
      customize_detail_dialog: false,

      //-----------------------------------
      count_adjustment_dialog: false,
      count_adjustment_input: 0,

      busy_set_count_adjustment: false,
    };
  },

  computed: {
    isModernFulfillment() {
      return this.modern && this.isFulfillment;
    },
    isModernHyper() {
      // Hyper items do not persist availability checks or fulfillment states.
      return this.modern && this.basket.type === "HYP" && !this.isFulfillment && !this.isRolePanel && !this.IS_VENDOR_PANEL;
    },
    fulfillmentSelectionDisabled() {
      return !this.checkable || this.readonly || !!this.basket.reject || this.basket.status !== Basket.Status.Payed.code ||
        [Basket.PhysicalOrderStates.SentOrder.code, Basket.PhysicalOrderStates.ToCustomer.code].includes(this.basket.delivery_state);
    },
    modernVendorPanel() {
      return this.modern && !!this.IS_VENDOR_PANEL;
    },
    modern_headers() {
      if (this.isModernFulfillment) return [
        { title: this.$t('global.basket_list.table.product_name'), key: 'product.title', value: 'product.title', align: 'start', sortable: false },
        ...(this.items.some((item) => this.getVariant(item)) ? [{ title: this.$t('global.basket_list.table.variant'), key: 'variant', value: 'variant', align: 'start', sortable: false }] : []),
        { title: this.$t('global.basket_list.table.count'), key: 'count', value: 'count', align: 'start', sortable: false, width: 85 },
        { title: this.$t('process_center.modern.fulfillment_availability'), key: 'fulfillment_availability', value: 'fulfillment_availability', align: 'start', sortable: false, width: 140 },
      ];
      const hasVariant = this.items.some((item) => this.getVariant(item));
      const hasSubscriptionPlan =
        this.type === ProductType.SUBSCRIPTION.code &&
        this.items.some((item) => item.subscription_price);
      const widths = {
        row: 32,
        "product.title": "34%",
        variant: "16%",
        "product.original": "17%",
        count: 92,
        price: 170,
      };
      const vendorTitles = this.modernVendorPanel ? {
        "product.title": "product_name",
        variant: "variant",
        "product.original": "warranty",
        count: "count",
        price: "price",
      } : {};
      return this.headers
        .filter(
          (header) =>
            header.value !== "product_id" &&
            (header.value !== "variant" || hasVariant || hasSubscriptionPlan),
        )
        .map((header) => ({
          ...header,
          title:
            header.value === "variant" && hasSubscriptionPlan
              ? this.$t("process_center.modern.subscription_plan_column")
              : vendorTitles[header.value]
                ? this.$t("global.basket_list.table." + vendorTitles[header.value])
                : header.title,
          width: widths[header.value],
          align: ["product.title", "variant", "product.original"].includes(
            header.value,
          )
            ? "start"
            : header.value === "price"
              ? "end"
              : header.align,
        }));
    },

    IS_MARKETPLACE() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    pageCount() {
      return Math.ceil(this.items.length / this.itemsPerPage);
    },

    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.shop);
    },

    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.shop);
    },

    isFulfillment() {
      return this.type === OrderTypeCode.Fulfillment;
    },

    selected_item_unit_float() {
      return (
        this.selected_item && this.getProduct(this.selected_item)?.unit_float
      );
    },

    can_set_count_adjustment() {
      return (
        // Role checking can select items; quantity changes require shop access.
        !this.isRolePanel && !this.isFulfillment &&
        /* Qualified basket type:*/ this.basket.type ===
          ProductType.PHYSICAL.code &&
        /*Qualified delivery states:*/
        [
          Basket.PhysicalOrderStates.CheckQueue.code,
          Basket.PhysicalOrderStates.OrderConfirm.code,
          Basket.PhysicalOrderStates.PreparingOrder.code,
        ].includes(this.basket.delivery_state) &&
        (!this.modern ||
          (!this.readonly &&
            !this.basket.reject &&
            [Basket.Status.Payed.code, Basket.Status.COD.code].includes(
              this.basket.status,
            )))
      );
    },
  },

  watch: {
    items() {
      this.selected = this.items.filter((item) => item.check);
    },
  },

  mounted() {
    if (this.selectAll) this.selected = Object.assign([], this.items);
    else {
      this.selected = this.items.filter((item) => item.check);
    }
  },

  created() {},

  methods: {
    rowProps({ item }) {
      return {
        class: [
          "row-hover -no-pointer",
          {
            "b-order-cart-role-row": this.modern && this.isRolePanel,
            "is-expanded":
              this.modern &&
              this.isRolePanel &&
              this.role_details.includes(item.id),
          },
        ],
      };
    },
    roleCellProps({ column }) {
      return {
        class: `b-order-cart-role__cell--${column.key.replace(".", "-")}`,
      };
    },
    toggleRoleDetails(item) {
      this.role_details = this.role_details.includes(item.id)
        ? this.role_details.filter((id) => id !== item.id)
        : [...this.role_details, item.id];
    },
    getConnectIcon(connect_id: string | number) {
      return window.CDN.GET_CONNECT_ICON(connect_id);
    },
    getProduct(item) {
      return this.isFulfillment ? item.product?.parent : item.product;
    },
    getVariant(item) {
      return this.isFulfillment ? item.variant?.parent : item.variant;
    },

    getReturnRequestStateObject(state) {
      let out = BasketItemReturn.States[state];
      return out ? out : {};
    },

    /**
     * IMPORTANT! External call
     * @return {*[]}
     */
    getCheckedItems() {
      return this.selected;
    },

    getWeight(item) {
      return BasketHelper.GetBasketItemWeight(item, false);
    },
    getSize(item) {
      return BasketHelper.GetBasketItemSize(item, false);
    },

    showCustomizeDetail(item) {
      this.selected_item = item;
      this.customize_detail_dialog = true;
    },
    showCountAdjustmentDialog(item) {
      if (this.isRolePanel) return;
      if (
        this.modern &&
        (!this.can_set_count_adjustment || this.busy_set_count_adjustment)
      )
        return;
      this.selected_item = item;
      this.count_adjustment_dialog = true;
      this.count_adjustment_input = item.count_adjustment;
    },

    setCountAdjustment() {
      if (this.isRolePanel) return;
      if (
        this.modern &&
        (!this.can_set_count_adjustment || this.busy_set_count_adjustment)
      )
        return;
      this.busy_set_count_adjustment = true;

      const item = this.selected_item;
      axios
        .put(
          this.IS_VENDOR_PANEL
            ? window.VAPI.PUT_MY_VENDOR_ORDER_ITEM_SET_COUNT_ADJUSTMENT(
                this.$route.params.vendor_id,
                this.$route.params.vendor_order_id,
                this.selected_item.id,
              )
            : window.API.PUT_SHOP_ORDER_ITEM_SET_COUNT_ADJUSTMENT(
                this.shop.id,
                this.basket.id,
                this.selected_item.id,
              ),
          {
            count_adjustment: this.count_adjustment_input,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            return NotificationService.showErrorAlert(null, data.error_msg);
          }

          Object.assign(item, data.item);
          // this.AddOrUpdateItemByID(this.basket.items, data.item);

          NotificationService.showSuccessAlert(
            null,
            this.modernVendorPanel ? this.$t('vendor_fulfillment.quantity_saved') : "Count adjustment has been successfully set.",
          );
          this.count_adjustment_dialog = false;
          this.$emit("fetch-order"); //refresh order
        })
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy_set_count_adjustment = false;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.b-order-cart-table-modern {
  --sd-modern-table-font-size: 12px;
  --sd-modern-table-compact-font-size: 12px;
  font-family: inherit;
  border-radius: 0;

  :deep(.v-table__wrapper) {
    overflow: visible;
  }
  :deep(.v-table__wrapper > table) {
    table-layout: auto;
  }
  :deep(.v-data-table__td-value) {
    min-width: 0;
  }
  .min-width-150 {
    min-width: 0 !important;
  }
  .text-h4 {
    font-family: inherit !important;
    font-size: 13px !important;
    font-weight: 400 !important;
    line-height: 20px !important;
  }
  .font-weight-bold {
    font-weight: 500 !important;
  }
  .item-image {
    width: 42px !important;
    height: 42px !important;
    min-width: 42px !important;
    min-height: 42px !important;
    margin-inline: 0 !important;
  }
  &__product {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    min-width: 0;
    text-align: start;
  }
  &__image-link {
    flex: 0 0 42px;
    border-radius: 5px;
  }
  &__image-link:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  &__image-button {
    min-width: 44px;
    min-height: 44px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }
  &__product-link {
    color: inherit;
    text-decoration: none;
  }
  &__product-link:hover,
  &__product-link:focus-visible {
    color: rgb(var(--v-theme-primary));
    text-decoration: underline;
  }
  &__product-body {
    min-width: 0;
    flex: 1;
    overflow-wrap: anywhere;
  }
  &__product-body > p {
    font-size: 12px;
    line-height: 18px;
    word-break: normal;
  }
  &__product-body > small {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__metadata {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__item-details {
    margin-block-start: 3px;
    font-size: 11px;
    line-height: 17px;
  }
  &__item-details > summary {
    display: flex;
    align-items: center;
    gap: 4px;
    width: fit-content;
    min-height: 32px;
    color: rgb(var(--v-theme-primary));
    cursor: pointer;
    list-style: none;
  }
  &__item-details > summary::-webkit-details-marker {
    display: none;
  }
  &__item-details > summary:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
    border-radius: 4px;
  }
  &__item-details[open] &__disclosure-icon {
    transform: rotate(180deg);
  }
  &__item-details > dl {
    display: grid;
    gap: 6px;
    margin-block: 5px;
    padding-block-start: 8px;
    border-top: 1px solid var(--sd-modern-border);
  }
  &__item-details dt {
    color: var(--sd-modern-muted);
  }
  &__item-details dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
  }
  &__identifiers,
  &__physical {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 10px;
  }
  &__physical > span {
    display: inline-flex;
    align-items: center;
  }
  &__variant {
    flex-wrap: wrap;
    gap: 3px;
    padding: 0;
    font-size: 12px;
    line-height: 18px;
  }
  &__variant :deep(.card-badge-info) {
    padding: 0;
    font-size: 11px;
    font-weight: 400;
  }
  &__plan {
    margin-block: 2px;
    font-size: 12px;
    line-height: 18px;
  }
  &__plan-title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    margin-block-end: 4px;
    font-size: 12px;
    line-height: 18px;
    font-weight: 500;
  }
  &__plan-title > img {
    flex: none;
    margin-inline-end: 0 !important;
  }
  &__plan .u--price {
    font-size: 12px;
  }
  &__price {
    min-width: 0;
    text-align: end;
  }
  &__price > .text-h4 {
    display: inline-block;
    white-space: nowrap;
  }
  &__price :deep(.s--value-dashed) {
    flex-wrap: wrap;
    gap: 2px 5px;
    padding-block: 3px;
    text-align: start;
  }
  &__valuation {
    margin-block-start: 5px;
    text-align: start;
    font-size: 11px;
    line-height: 17px;
    overflow-wrap: anywhere;
  }
  &__valuation > summary {
    display: flex;
    align-items: center;
    gap: 4px;
    width: fit-content;
    min-height: 32px;
    padding-block: 3px;
    color: rgb(var(--v-theme-primary));
    cursor: pointer;
    list-style: none;
  }
  &__valuation > summary::-webkit-details-marker {
    display: none;
  }
  &__valuation > summary:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
    border-radius: 4px;
  }
  &__valuation[open] &__disclosure-icon {
    transform: rotate(180deg);
  }
  &__valuation > .v-btn {
    min-width: 0;
    max-width: 100%;
    margin-inline: 0 !important;
    padding-inline: 0;
    font-size: 11px;
  }
  &__valuation > .v-btn :deep(.v-btn__content) {
    white-space: normal;
    text-align: start;
  }
  .small {
    font-size: 11px;
    line-height: 17px;
  }
  .hover-editable {
    border-radius: 4px;
  }
  .hover-editable:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  :deep(.v-chip) {
    height: auto;
    min-height: 18px;
    padding: 1px 4px;
    background: transparent !important;
    color: inherit;
    font-size: 10px;
    line-height: 16px;
  }
  :deep(.v-chip__underlay) {
    display: none;
  }
  .sd-modern-table-footer {
    font-size: 11px;
  }

  @media (min-width: 1000px) {
    :deep(.v-table__wrapper > table > tbody > tr > td) {
      padding-inline: 8px !important;
    }
  }
  @media (max-width: 999px) {
    &__price {
      text-align: start;
    }
    &__product {
      width: 100%;
    }
  }
  @media (max-width: 680px), (pointer: coarse) {
    &__valuation > summary {
      min-height: 44px;
    }
    .hover-editable {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
    }
  }
}

// Focus rows keep the native cells and selection; only supporting fields are disclosed.
.b-order-cart-table-modern--role.sd-modern-data-table.v-data-table {
  :deep(.v-table__wrapper > table > tbody > .b-order-cart-role-row) {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) minmax(70px, auto);
    align-items: start;
    gap: 6px 10px;
    padding-block: 12px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  :deep(.v-table__wrapper > table > tbody > .b-order-cart-role-row > td) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 3px;
    width: auto !important;
    min-width: 0;
    min-height: 0;
    height: auto;
    padding: 0 !important;
    border: 0 !important;
  }
  :deep(.b-order-cart-role-row .v-data-table__td-value) {
    min-width: 0;
    text-align: start;
  }
  :deep(.b-order-cart-role-row > .b-order-cart-role__cell--data-table-select) {
    grid-column: 1;
    grid-row: 1 / 3;
    align-items: center;
  }
  :deep(.b-order-cart-role-row .v-data-table__td--select-row .v-btn) {
    width: 44px;
    height: 44px;
    min-width: 44px;
  }
  :deep(.b-order-cart-role-row > .b-order-cart-role__cell--product-title) {
    grid-column: 2 / -1;
    grid-row: 1;
  }
  :deep(
    .b-order-cart-role-row
      > .b-order-cart-role__cell--product-title
      > .v-data-table__td-title
  ) {
    display: none;
  }
  :deep(.b-order-cart-role-row .b-order-cart-table-modern__product) {
    gap: 8px;
  }
  :deep(.b-order-cart-role-row .b-order-cart-table-modern__product-body > p) {
    min-width: 0 !important;
  }
  :deep(.b-order-cart-role-row .b-order-cart-table-modern__details-toggle) {
    flex-shrink: 0;
  }
  :deep(.b-order-cart-role-row > .b-order-cart-role__cell--count) {
    grid-column: 2;
    grid-row: 2;
  }
  :deep(
    .b-order-cart-role-row
      > .b-order-cart-role__cell--count
      .v-data-table__td-value
  ) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }
  :deep(.b-order-cart-role-row > .b-order-cart-role__cell--count .mb-1) {
    margin-block-end: 0 !important;
  }
  :deep(.b-order-cart-role-row > .b-order-cart-role__cell--count .v-chip) {
    margin: 0 !important;
  }
  :deep(.b-order-cart-role-row > .b-order-cart-role__cell--price) {
    grid-column: 3;
    grid-row: 2;
  }
  :deep(
    .b-order-cart-role-row
      > .b-order-cart-role__cell--price
      .v-data-table__td-value
  ) {
    text-align: end;
  }
  :deep(
    .b-order-cart-role-row
      > .b-order-cart-role__cell--price
      .b-order-cart-table-modern__price
  ) {
    text-align: end;
  }

  :deep(
    .b-order-cart-role-row:not(.is-expanded) > .b-order-cart-role__cell--row
  ),
  :deep(
    .b-order-cart-role-row:not(.is-expanded) > .b-order-cart-role__cell--variant
  ),
  :deep(
    .b-order-cart-role-row:not(.is-expanded)
      > .b-order-cart-role__cell--product-original
  ),
  :deep(
    .b-order-cart-role-row:not(.is-expanded)
      .b-order-cart-table-modern__product-body
      > small
  ),
  :deep(
    .b-order-cart-role-row:not(.is-expanded)
      .b-order-cart-table-modern__metadata
  ),
  :deep(
    .b-order-cart-role-row:not(.is-expanded)
      .b-order-cart-table-modern__price
      > :not(.text-h4)
  ) {
    display: none !important;
  }
  :deep(
    .b-order-cart-role-row:not(.is-expanded)
      .b-order-cart-table-modern__product-body
      > p
  ) {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  :deep(
    .b-order-cart-role-row.is-expanded .b-order-cart-table-modern__product
  ) {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) auto;
  }
  :deep(
    .b-order-cart-role-row.is-expanded .b-order-cart-table-modern__image-link
  ) {
    grid-column: 1;
    grid-row: 1;
  }
  :deep(
    .b-order-cart-role-row.is-expanded .b-order-cart-table-modern__product-body
  ) {
    display: contents;
  }
  :deep(
    .b-order-cart-role-row.is-expanded
      .b-order-cart-table-modern__product-body
      > p
  ) {
    grid-column: 2;
    grid-row: 1;
  }
  :deep(
    .b-order-cart-role-row.is-expanded
      .b-order-cart-table-modern__product-body
      > small
  ) {
    grid-column: 1 / -1;
    grid-row: 2;
  }
  :deep(
    .b-order-cart-role-row.is-expanded .b-order-cart-table-modern__metadata
  ) {
    grid-column: 1 / -1;
    grid-row: 3;
  }
  :deep(
    .b-order-cart-role-row.is-expanded
      .b-order-cart-table-modern__details-toggle
  ) {
    grid-column: 3;
    grid-row: 1;
  }
  :deep(.b-order-cart-role-row.is-expanded > .b-order-cart-role__cell--row) {
    grid-column: 1;
    grid-row: 2;
    align-items: center;
    flex-direction: row;
    justify-content: center;
    gap: 2px;
  }
  :deep(.b-order-cart-role-row.is-expanded > .b-order-cart-role__cell--price) {
    grid-column: 2 / -1;
    grid-row: 3;
  }
  :deep(
    .b-order-cart-role-row.is-expanded
      > .b-order-cart-role__cell--price
      .v-data-table__td-value
  ),
  :deep(
    .b-order-cart-role-row.is-expanded
      > .b-order-cart-role__cell--price
      .b-order-cart-table-modern__price
  ) {
    text-align: start;
  }
  :deep(
    .b-order-cart-role-row.is-expanded > .b-order-cart-role__cell--variant
  ) {
    grid-column: 2 / -1;
    grid-row: 4;
  }
  :deep(
    .b-order-cart-role-row.is-expanded
      > .b-order-cart-role__cell--product-original
  ) {
    grid-column: 2 / -1;
    grid-row: 5;
  }
  :deep(
    .b-order-cart-role-row.is-expanded
      > .b-order-cart-role__cell--product-original
      .v-data-table__td-value
  ) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
  }
  :deep(.b-order-cart-role-row.is-expanded) {
    row-gap: 14px;
  }
}

.b-order-cart-table-modern--vendor {
  .smart-invert & :deep(.b-order-cart-role__cell--data-table-select .v-btn.text-primary) { filter: invert(1); }
  --sd-modern-table-font-size: 13px;
  --sd-modern-table-compact-font-size: 13px;
  .b-order-cart-table-modern__product-body > p { font-size: 13px; line-height: 20px; }
  .b-order-cart-table-modern__image-link, .item-image { border-radius: 10px; }
  @media (max-width: 600px) {
    :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding-block: 14px; border-block-end: 1px solid var(--sd-modern-border); }
    :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td) { display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 5px; width: auto !important; min-width: 0; height: auto; padding: 0 !important; border: 0; }
    :deep(.v-data-table__tr--mobile .v-data-table__td-title), :deep(.v-data-table__tr--mobile .v-data-table__td-value) { flex: 0 1 auto; width: 100% !important; min-width: 0; text-align: start; }
    :deep(.v-data-table__tr--mobile > .b-order-cart-role__cell--product-title) { grid-column: 1 / -1; }
    .b-order-cart-table-modern__product { display: grid; grid-template-columns: 42px minmax(0, 1fr); align-items: start; gap: 7px 10px; }
    .b-order-cart-table-modern__image-link { grid-column: 1; grid-row: 1; }
    .b-order-cart-table-modern__product-body { display: contents; }
    .b-order-cart-table-modern__product-body > p { grid-column: 2; grid-row: 1; min-width: 0 !important; }
    .b-order-cart-table-modern__product-body > small, .b-order-cart-table-modern__metadata { grid-column: 1 / -1; }
  }
}
.b-order-cart-dialog-modern {
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  :deep(.v-card-title) {
    font-family: inherit;
    font-size: 18px;
    font-weight: 500;
    line-height: 24px;
  }
  :deep(.v-card-text) {
    font-size: 13px;
    line-height: 20px;
  }
  :deep(.widget-buttons) {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 12px 12px;
  }
}
.b-order-cart-dialog-modern--vendor {
  font-size: var(--sd-modern-font-body, 14px);
  line-height: 22px;
  :deep(.v-card-text) { font-size: inherit; line-height: inherit; }
  :deep(.v-card-title) { display: flex; align-items: center; white-space: normal; }
  .b-order-cart-dialog-modern__vendor-product { display: flex; align-items: center; gap: 12px; margin-block-end: 16px; font-size: 14px; font-weight: 500; line-height: 22px; }
  .b-order-cart-dialog-modern__vendor-product > .v-img { flex: 0 0 42px; border: 1px solid var(--sd-modern-border); border-radius: 10px; }
  .b-order-cart-dialog-modern__vendor-quantities { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-block-start: 24px; }
  .b-order-cart-dialog-modern__vendor-quantities > div { min-width: 0; }
  .b-order-cart-dialog-modern__vendor-quantities > div > span { display: block; margin-block-end: 7px; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  .b-order-cart-dialog-modern__vendor-quantities b { font-size: 22px; font-weight: 500; line-height: 30px; }
  .b-order-cart-dialog-modern__vendor-quantities small { margin-inline-start: 5px; font-size: 13px; font-weight: 400; line-height: 20px; }
  @media (max-width: 420px) {
    .b-order-cart-dialog-modern__vendor-quantities { gap: 10px; }
    .b-order-cart-dialog-modern__vendor-quantities b { font-size: 18px; line-height: 26px; }
  }
}

.data-table {
  cursor: pointer;
  font-size: 1.071rem;
  font-weight: 400;
  color: #555;
  height: 68px;
}

.circle-bg {
  border-radius: 50%;
  background-color: white;
  padding: 4px;
  width: 18px;
  height: 18px;
}
</style>
