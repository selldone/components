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
  <article
    v-if="modernList"
    class="b-product-list text-start"
    :class="{
      'b-product-list--selected': selected || iSelected,
      'b-product-list--deleted': product.deleted_at,
      disabled: disabled,
    }"
    :product-id="product.id"
    :aria-busy="deleting || restoring"
    :aria-disabled="disabled"
    :inert="disabled || undefined"
  >
    <div
      class="b-product-list__row sd-modern-clickable-item"
      @click="onListSelect($event)"
    >
      <label
        v-if="multiSelectProducts || showSelect"
        class="b-product-list__select"
        @click.stop
      >
        <input
          type="checkbox"
          :checked="selected || iSelected"
          :disabled="disabled"
          :aria-label="
            $t('product_panel.workspace.list_view.select_product', {
              title: product.title,
            })
          "
          @change="$emit('onSelect', product)"
        />
      </label>
      <span v-else class="b-product-list__select" aria-hidden="true"></span>

      <div class="b-product-list__identity">
        <v-avatar
          v-if="compactMode || extended"
          size="40"
          rounded
          class="b-product-list__image hover-scale-small"
          :drop-image="!compactMode && extended ? 'true' : undefined"
          :role="disabled || compactMode ? undefined : 'button'"
          :tabindex="disabled || compactMode ? undefined : 0"
          :aria-label="compactMode ? undefined : $t('add_product.menu.images')"
          @click.stop="compactMode ? onListSelect($event) : !disabled && $emit('click:image', $event)"
          @keydown.enter.stop.prevent="
            !compactMode && !disabled && $emit('click:image', $event)
          "
          @keydown.space.stop.prevent="
            !compactMode && !disabled && $emit('click:image', $event)
          "
        >
          <v-img
            v-if="product.icon"
            :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
          >
            <template #placeholder
              ><v-progress-circular
                indeterminate
                size="18"
                class="center-absolute"
            /></template>
          </v-img>
          <v-icon v-else aria-hidden="true">inventory_2</v-icon>
          <v-progress-circular
            v-if="uploading"
            :model-value="uploading.progress"
            size="28"
            class="center-absolute"
            color="primary"
          />
          <v-tooltip
            v-if="!compactMode"
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("add_product.menu.images") }}</v-tooltip
          >
        </v-avatar>
        <div class="b-product-list__identity-copy">
          <button
            type="button"
            class="b-product-list__name"
            :disabled="disabled"
            @click.stop="onListSelect($event)"
          >
            {{ product.title }}
          </button>
          <span
            v-if="product.title_en"
            class="b-product-list__secondary"
            dir="auto"
            >{{ product.title_en }}</span
          >
          <div class="b-product-list__meta">
            <div class="b-product-list__meta-flags">
              <span
                v-if="status_obj"
                class="sd-modern-status sd-modern-status--plain b-product-list__status"
                :role="status_obj.code !== ProductStatus.Open.code ? 'button' : undefined"
                :tabindex="status_obj.code !== ProductStatus.Open.code ? 0 : undefined"
                @click="status_obj.code !== ProductStatus.Open.code && $event.stopPropagation()"
                @keydown.enter.stop.prevent="$event.currentTarget.click()"
                @keydown.space.stop.prevent="$event.currentTarget.click()"
              >
                <span
                  class="sd-modern-status__dot"
                  :class="{
                    'sd-modern-status__dot--success': status_obj.code === ProductStatus.Open.code,
                    'sd-modern-status__dot--error': status_obj.code === ProductStatus.Close.code || status_obj.code === ProductStatus.Rejected.code,
                    'sd-modern-status__dot--warning': status_obj.code === ProductStatus.Pending.code,
                  }"
                  aria-hidden="true"
                ></span
                >{{ $t(status_obj.name) }}
                <v-tooltip
                  v-if="status_obj.code !== ProductStatus.Open.code"
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  open-on-click
                >{{ $t(status_obj.description) }}</v-tooltip>
              </span>
              <span v-if="!compactMode" class="b-product-list__type"
                ><img :src="getProductTypeImage(product.type)" alt="" />{{
                  getProductTypeName(product.type)
                }}</span
              >
              <v-avatar v-if="product.connect_id" rounded size="18"
                ><img :src="getConnectIcon(product.connect_id)" alt="Connect"
              /></v-avatar>
              <span v-if="shortcut" class="b-product-list__marker" tabindex="0">
                <v-icon size="13" aria-hidden="true">snippet_folder</v-icon
                >{{ $t("product_panel.workspace.list_view.shortcut") }}
                <v-tooltip
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  >{{
                    $t("product_panel.workspace.list_view.shortcut_help")
                  }}</v-tooltip
                >
              </span>
              <span v-if="add_by_dropShipping" class="b-product-list__marker"
                ><img
                  src="../../../../../assets/icons/dropshipping-green.svg"
                  alt=""
                />{{ $t("global.commons.drop_shipping") }}</span
              >
              <span v-if="product.deleted_at" class="b-product-list__marker"
                >{{ $t("global.commons.deleted") }} ·
                {{ getFromNowString(product.deleted_at) }}</span
              >
            </div>
            <product-variants-view
              v-if="!compactMode && extended && product.variants?.length"
              :variants="filterVariant ? [filterVariant] : product.variants"
              :limit="3"
              class="b-product-list__variants"
              small
              single-line
              hide-icon
            />
          </div>
          <span v-if="disabled" class="b-product-list__secondary"
            ><v-icon size="14" aria-hidden="true">warning_amber</v-icon>
            {{ $t("global.commons.can_not_edit") }}</span
          >
        </div>
      </div>

      <div class="b-product-list__price">
        <span
          v-if="showPrice"
          class="b-product-list__mobile-label sd-modern-list-header"
          >{{ $t("global.commons.price") }}</span
        >
        <component
          :is="showEditButton ? 'button' : 'div'"
          v-if="showPrice"
          :type="showEditButton ? 'button' : undefined"
          class="b-product-list__price-value"
          :disabled="showEditButton && disabled"
          :aria-label="
            showEditButton
              ? `${$t('global.actions.edit')} · ${$t('global.commons.price')} · ${product.title}`
              : undefined
          "
          @click.stop="onListPriceClick"
        >
          <u-price-invalid
            v-if="isNaN(price_converted) || price_converted === null"
            :currency="product.currency"
            small
          />
          <u-price v-else :amount="price_converted" />
          <span v-if="discount_percent" class="b-product-list__discount"
            >{{ discount_percent }}%</span
          >
          <span
            v-if="!price_converted || price_converted <= 0"
            class="b-product-list__price-warning"
            tabindex="0"
          >
            <v-icon size="14" color="error" aria-hidden="true"
              >warning_amber</v-icon
            >
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              >{{
                $t(
                  product.price > 0
                    ? "product_panel.workspace.list_view.invalid_exchange_rate"
                    : "product_panel.workspace.list_view.invalid_price",
                )
              }}</v-tooltip
            >
          </span>
        </component>
        <span v-if="showPrice && product.unit" class="b-product-list__secondary"
          >/ {{ product.unit }}</span
        >
      </div>

      <div class="b-product-list__stock">
        <template v-if="!compactMode && extended && showStatistics">
          <span class="b-product-list__mobile-label sd-modern-list-header">{{
            $t("admin_shop.products.product_widget.in_stock")
          }}</span>
          <span v-if="isFile" :aria-label="$t('global.commons.infinite')"
            >∞</span
          >
          <span v-else-if="quantity">{{
            numeralFormat(quantity, "0,0a")
          }}</span>
          <span v-else class="b-product-list__secondary">{{
            $t("global.commons.out_of_stock")
          }}</span>
          <span
            v-if="quantity > 0 && quantity < 5"
            class="b-product-list__stock-warning"
            tabindex="0"
            :aria-label="$t('global.commons.low_inventory_warning')"
          >
            <v-icon size="14" color="warning" aria-hidden="true"
              >warning_amber</v-icon
            >
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              >{{ $t("global.commons.low_inventory_warning") }}</v-tooltip
            >
          </span>
        </template>
      </div>
      <div class="b-product-list__activity">
        <template v-if="!compactMode && extended && showStatistics">
          <span class="b-product-list__mobile-label sd-modern-list-header">{{
            $t("product_panel.workspace.list_view.activity")
          }}</span>
          <span
            >{{ $t("admin_shop.products.product_widget.total_sell") }}
            {{ numeralFormat(product.sells, "0,0a") }}</span
          >
          <span class="b-product-list__secondary"
            >{{ $t("admin_shop.products.product_widget.total_view") }}
            {{ numeralFormat(product.visits, "0,0a") }}</span
          >
        </template>
      </div>
      <div class="b-product-list__actions" @click.stop>
        <b-note-button
          v-if="showNotes || (product.note && product.note.length)"
          :note="product.note"
          modern
          @click="!disabled && $emit('onShowNote', product)"
        />
        <v-btn
          v-if="showEditButton"
          :disabled="disabled"
          :aria-label="$t('global.actions.edit')"
          :to="{
            name: IS_VENDOR_PANEL ? 'Vendor_AddProduct' : 'BPageProductEdit',
            params: { product_id: product.id },
            hash: '#general',
          }"
          class="sd-modern-icon-button b-product-list__edit"
          icon
          variant="text"
        >
          <v-icon aria-hidden="true">edit</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.actions.edit") }}</v-tooltip
          >
        </v-btn>
        <v-btn
          :aria-expanded="show_list_details"
          :aria-controls="`${$.uid}-product-details`"
          :aria-label="`${$t(show_list_details ? 'product_panel.workspace.list_view.hide_details' : 'product_panel.workspace.list_view.details')} · ${product.title}`"
          class="sd-modern-icon-button"
          icon
          variant="text"
          @click="show_list_details = !show_list_details"
        >
          <v-icon aria-hidden="true">{{
            show_list_details ? "expand_less" : "expand_more"
          }}</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            >{{
              $t(
                show_list_details
                  ? "product_panel.workspace.list_view.hide_details"
                  : "product_panel.workspace.list_view.details",
              )
            }}</v-tooltip
          >
        </v-btn>
        <v-btn
          :aria-label="
            $t('product_panel.workspace.list_view.more_product', {
              title: product.title,
            })
          "
          class="sd-modern-icon-button"
          icon
          variant="text"
          @click="$emit('contextmenu', $event)"
        >
          <v-icon aria-hidden="true">more_horiz</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.commons.actions") }}</v-tooltip
          >
        </v-btn>
      </div>
    </div>

    <div
      v-show="show_list_details"
      :id="`${$.uid}-product-details`"
      class="b-product-list__details"
      role="region"
      :aria-label="`${$t('global.commons.details')} · ${product.title}`"
      @click.stop
    >
      <div class="b-product-list__details-grid">
        <div
          v-if="showPrice && !compactMode && extended"
          class="b-product-list__detail"
        >
          <h3 class="b-product-list__detail-title">{{ $t(pricing.title) }}</h3>
          <dl class="b-product-list__pricing">
            <dt>{{ $t("global.commons.price") }}</dt>
            <dd>
              <u-price :amount="product.price" :currency="product.currency" />
            </dd>
            <dt>{{ $t("admin_shop.products.product_widget.value_added") }}</dt>
            <dd>
              <u-price
                :amount="product.commission"
                :currency="product.currency"
              />
            </dd>
            <dt>{{ $t("admin_shop.products.product_widget.discount") }}</dt>
            <dd>
              <u-price
                :amount="product.discount"
                :currency="product.currency"
              />
            </dd>
          </dl>
          <u-time-progress-bar
            modern
            :created-time="product.created_at"
            :end-time="product.dis_end"
            :start-time="product.dis_start"
          />
        </div>
        <div
          v-if="!compactMode && extended && (showStatistics || showRatting)"
          class="b-product-list__detail"
        >
          <h3 class="b-product-list__detail-title">
            {{ $t("product_panel.workspace.list_view.activity") }}
          </h3>
          <div v-if="showStatistics" class="b-product-list__detail-activity">
            <span
              >{{ $t("admin_shop.products.product_widget.in_stock") }}:
              {{
                isFile
                  ? $t("global.commons.infinite")
                  : quantity || $t("global.commons.out_of_stock")
              }}</span
            >
            <span
              >{{ $t("admin_shop.products.product_widget.total_sell") }}:
              {{ numeralFormat(product.sells, "0,0a") }}
              {{ $t("admin_shop.products.product_widget.product_unit") }}</span
            >
            <span
              >{{ $t("admin_shop.products.product_widget.total_view") }}:
              {{ numeralFormat(product.visits, "0,0a") }}
              {{ $t("admin_shop.products.product_widget.view_unit") }}</span
            >
          </div>
          <template v-if="showRatting && product.rate_count">
            <v-rating
              :model-value="product.rate"
              active-color="yellow-darken-3"
              color="grey-darken-1"
              density="compact"
              half-increments
              readonly
              size="small"
            />
            <span class="b-product-list__secondary"
              >{{ numeralFormat(product.rate_count, "0,0a") }}
              {{ $t("admin_shop.products.product_widget.review_unit") }}</span
            >
          </template>
          <span v-else-if="showRatting" class="b-product-list__secondary">{{
            $t("product_panel.workspace.list_view.no_reviews")
          }}</span>
        </div>
        <div
          v-if="vendor || (vendors && vendors.length)"
          class="b-product-list__detail"
        >
          <h3 class="b-product-list__detail-title">
            {{ $t("global.commons.vendor") }}
          </h3>
          <div v-if="vendor" class="b-product-list__vendor">
            <v-avatar
              :class="vendor.enable ? '-blue' : '-red'"
              class="avatar-gradient -thin hover-scale"
              size="30"
              ><img :src="getShopImagePath(vendor.icon, 64)" alt=""
            /></v-avatar>
            <span>{{ vendor.name }}</span>
          </div>
          <div v-else class="b-product-list__vendors">
            <span
              v-for="v in vendors"
              :key="v.id"
              class="b-product-list__vendor"
            >
              <v-avatar
                :class="v.enable ? '-blue' : '-red'"
                class="avatar-gradient -thin hover-scale"
                size="30"
                ><img
                  v-if="v.icon"
                  :src="getShopImagePath(v.icon, 64)"
                  alt=""
                /><v-icon v-else size="small">storefront</v-icon></v-avatar
              >
              <span>{{ v.name }}</span>
            </span>
          </div>
        </div>
        <div v-if="product.variants" class="b-product-list__detail">
          <h3 class="b-product-list__detail-title">
            {{ $t("global.commons.variants") }}
          </h3>
          <product-variants-view
            :variants="filterVariant ? [filterVariant] : product.variants"
            small
          />
        </div>
      </div>
      <div
        v-if="!compactMode && extended && showStatistics"
        class="b-product-list__detail-links"
      >
        <span v-if="!product.original" class="b-product-list__marker"
          ><v-icon size="14" color="error" aria-hidden="true"
            >warning_amber</v-icon
          >{{ $t("global.commons.fake") }}</span
        >
        <span
          v-if="
            conditionObject && product.condition !== ProductCondition.NEW.code
          "
          >{{ $t(conditionObject.title) }}</span
        >
        <router-link
          v-if="product.ar_src"
          :to="{
            name: IS_VENDOR_PANEL ? 'Vendor_Product3DPage' : 'BPageProduct3D',
            params: { product_id: product.id },
          }"
          ><img :src="require('../../../../../assets/icons/3d.svg')" alt="" />AR
          / 3D</router-link
        >
        <router-link
          v-if="product.video"
          :to="{
            name: IS_VENDOR_PANEL ? 'Vendor_AddProduct' : 'BPageProductEdit',
            params: { product_id: product.id },
            hash: '#images',
          }"
          ><v-icon size="16" aria-hidden="true">videocam</v-icon
          >{{ $t("global.commons.video") }}</router-link
        >
        <router-link
          v-if="
            product.reselling &&
            !IS_VENDOR_PANEL /*Con not be vendor [wholesaling selldone]!*/
          "
          :to="{
            name: 'BPageProductDropshipping',
            params: { product_id: product.id },
          }"
          ><img
            :src="require('../../../../../assets/icons/dropshipping-green.svg')"
            alt=""
          />{{ $t("global.commons.drop_shipping") }}</router-link
        >
      </div>
    </div>
    <v-progress-circular
      v-if="deleting || restoring"
      :color="deleting ? 'error' : 'success'"
      class="center-absolute"
      indeterminate
      ><v-icon>{{
        deleting ? "delete" : "settings_backup_restore"
      }}</v-icon></v-progress-circular
    >
  </article>
  <s-widget
    v-else
    :class="[
      small ? 'm-1' : '',
      hover ? 'widget-hover' : '',
      dashed ? '-dashed' : '',
      hover ? 'pointer-pointer' : '',
      product.deleted_at ? 'op-0-7 -deleted' : '',
      selected || iSelected ? 'border-selected ' : '',
      shortcut ? '-shortcut' : '',
      { disabled: disabled },
    ]"
    :dark="dark"
    :deleted_at="getFromNowString(product.deleted_at)"
    :h100="false"
    :product-id="product.id"
    :style="{ '--card-color': color }"
    :title="`<h5 class='align-items-center pb-1'  style='font-size: 1.16rem;min-height: 42px;padding-inline-end: 40px'>    <span class='circle ${state_class}' style='font-size: 6px;'></span>  ${product.title?.limitWords(
      12,
    )}  </h5>`"
    body-class="pa-0"
    class="b--product-window-product-large text-start overflow-hidden"
    custom-header
    style="border-radius: 8px"
    @click="$emit('select')"
  >
    <template v-slot:top-left>
      <v-btn
        v-if="showEditButton"
        :to="{
          name: IS_VENDOR_PANEL ? 'Vendor_AddProduct' : 'BPageProductEdit',
          params: { product_id: product.id },
          hash: '#general',
        }"
        class="z2 me-1"
        icon
        size="36"
        title="Edit product."
        variant="text"
        @click.stop
      >
        <v-icon size="20">fa:fas fa-pen-to-square</v-icon>
      </v-btn>

      <!-- Add Note Button -->
      <b-note-button
        v-if="showNotes || (product.note && product.note.length)"
        :activeColor="showNotes ? undefined : '#333'"
        :note="product.note"
        class="z2 me-1"
        @click="$emit('onShowNote', product)"
      ></b-note-button>

      <!-- Selectable -->
      <template v-if="showSelect">
        <v-icon :color="iSelected ? 'primary' : '#333'" class="mx-1" size="24"
          >{{ iSelected ? "circle" : "radio_button_unchecked" }}
        </v-icon>
      </template>

      <circle-image
        v-if="compactMode"
        :size="64"
        :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
      ></circle-image>
    </template>

    <!-- Selectable -->
    <template v-if="showSelect">
      <div
        class="pp usall"
        style="
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
        "
        @click.stop="$emit('onSelect', product)"
      ></div>
    </template>

    <div v-if="add_by_dropShipping" class="drop-shipping-mode">
      <img
        height="24"
        src="../../../../../assets/icons/dropshipping-w.svg"
        width="24"
      />
      <span>{{ $t("global.commons.drop_shipping") }}</span>
    </div>

    <div>
      <img
        v-if="!compactMode"
        :src="getProductTypeImage(product.type)"
        :title="`${$t(
          'admin_shop.products.product_widget.product_type',
        )}: ${getProductTypeName(product.type)}`"
        class="float-end"
        height="16px"
      />
      <v-chip
        v-if="status_obj && status_obj.code !== ProductStatus.Open.code"
        :color="status_obj.color"
        variant="elevated"
        :theme="
          status_obj.code !== ProductStatus.Pending.code ? 'dark' : 'light'
        "
        :title="$t(status_obj.description)"
        class="product-status mx-1 px-1 float-end"
        label
        size="x-small"
        >{{ $t(status_obj.name) }}
      </v-chip>

      <h6
        :class="small ? 'small' : ''"
        class="fw-semi-bold mb-1 small"
        style="min-height: 21px"
      >
        <v-chip
          v-if="shortcut"
          class="me-1"
          color="#009688"
          label
          size="x-small"
          title="Originally, this product belongs to a different category."
        >
          <v-icon size="9" start>snippet_folder</v-icon>
          Shortcut
        </v-chip>
        <v-avatar v-if="product.connect_id" class="me-1" rounded size="24"
          ><img :src="getConnectIcon(product.connect_id)"
        /></v-avatar>

        {{ product.title_en?.limitWords(24) }}
      </h6>
    </div>

    <!-- Vendor owner -->
    <div
      v-if="vendor"
      :title="$t('global.commons.vendor')"
      class="pa-1 text-start d-flex align-center small"
    >
      <v-avatar
        v-if="vendor"
        :class="vendor.enable ? '-blue' : '-red'"
        class="avatar-gradient -thin me-2 hover-scale"
        size="30"
        ><img :src="getShopImagePath(vendor.icon, 64)"
      /></v-avatar>

      <div class="flex-grow-1">
        <small class="d-block">{{ $t("global.commons.vendor") }}</small>
        <b>{{ vendor.name }}</b>
      </div>
    </div>

    <!-- Vendors -->
    <div v-if="vendors && vendors.length && !vendor" class="my-1">
      <v-avatar
        v-for="v in vendors"
        :key="v.id"
        :class="v.enable ? '-blue' : '-red'"
        :title="v.name"
        class="avatar-gradient -thin me-1 hover-scale"
        size="30"
        ><img v-if="v.icon" :src="getShopImagePath(v.icon, 64)" />
        <v-icon v-else size="small">storefront</v-icon>
      </v-avatar>
    </div>
    <div v-if="disabled" class="text-subtitle-2 text-center">
      <v-icon class="me-1">warning_amber</v-icon>
      {{ $t("global.commons.can_not_edit") }}
    </div>

    <product-variants-view
      v-if="product.variants"
      :variants="filterVariant ? [filterVariant] : product.variants"
      center
      class="flex-grow-0 mb-2"
      small
    />

    <p
      v-if="showPrice"
      :class="{ 'editable-click': showEditButton }"
      class="m-0 px-2"
      title="Edit price"
      @mouseleave="show_price_detail = false"
      @mouseover="show_price_detail = true"
      @click.stop="
        showEditButton
          ? $router.push({
              name: IS_VENDOR_PANEL ? 'Vendor_AddProduct' : 'BPageProductEdit',
              params: { product_id: product.id },
              hash: '#price',
            })
          : undefined
      "
    >
      <small class="text-muted mb-0 me"
        >{{ $t("global.commons.price") }}:
      </small>

      <!-- Price > ⛔ Invalid exchange rate -->
      <u-price-invalid
        v-if="isNaN(price_converted)  || price_converted===null"
        :currency="product.currency"
        small
      >
      </u-price-invalid>

      <u-price
        v-else
        :amount="price_converted"
        class="font-weight-medium hover-able mx-1"
        large
      ></u-price>

      <span v-if="discount_percent" class="discount-badge m-1"
        >{{ discount_percent }} %</span
      >

      <v-icon
        v-if="!price_converted || price_converted <= 0"
        :title="
          product.price > 0 ? 'Exchange rate not valid!' : 'Price not valid!'
        "
        class="ms-2 mb-2 blink-me"
        color="red"
        size="small"
        >fa:fas fa-exclamation-triangle
      </v-icon>

      <small v-if="product.unit" class="ms-2">/ {{ product.unit }}</small>
    </p>

    <v-spacer></v-spacer>
    <div v-if="!compactMode && extended" class="border-top text-start mt-2">
      <v-slide-y-reverse-transition hide-on-leave>
        <div
          v-if="showPrice && show_price_detail"
          key="1"
          class="d-flex align-center"
        >
          <div class="w-50 pt-2">
            <p class="text-subtitle-2 my-1">
              {{ $t(pricing.title) }}
            </p>
            <p class="mb-1">
              <small>
                <i class="fas fa-tag"></i>
                {{ $t("global.commons.price") }}:
              </small>

              <u-price
                :amount="product.price"
                :currency="product.currency"
                class="text-success"
              ></u-price>
            </p>

            <p class="mb-1">
              <small>
                <i class="fas fa-plus"></i>
                {{ $t("admin_shop.products.product_widget.value_added") }}:
              </small>

              <u-price
                :amount="product.commission"
                :currency="product.currency"
                class="text-success"
              ></u-price>
            </p>

            <p class="mb-1">
              <small>
                <i class="fas fa-minus"></i>
                {{ $t("admin_shop.products.product_widget.discount") }}:
              </small>

              <u-price
                :amount="product.discount"
                :currency="product.currency"
                class="text-success"
              ></u-price>
            </p>
          </div>
          <div class="w-50 pt-2">
            <u-time-progress-bar
              :created-time="product.created_at"
              :end-time="product.dis_end"
              :start-time="product.dis_start"
              class="mx-auto"
            />
          </div>
        </div>
        <div v-else key="2" class="d-flex align-center">
          <div
            v-if="!compactMode && !show_price_detail"
            class="w-50 border-end p-3 px-4 text-center"
          >
            <v-avatar
              :size="60"
              class="hover-scale-small force-top"
              color="grey-lighten-4"
              drop-image="true"
              @click="(e) => $emit('click:image', e)"
              ><!-- dro-image : active drop area for images fast upload -->
              <v-img
                v-if="product.icon"
                :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
                aspect-ratio="1"
                class="bg-grey-lighten-2"
              >
                <template v-slot:placeholder>
                  <v-progress-circular
                    class="center-absolute"
                    color="grey-lighten-5"
                    indeterminate
                  />
                </template>
                <v-progress-circular
                  v-if="uploading"
                  :model-value="uploading.progress"
                  class="center-absolute"
                  color="blue"
                ></v-progress-circular>
              </v-img>
            </v-avatar>

            <template v-if="showRatting && product.rate_count">
              <v-rating
                :model-value="product.rate"
                active-color="yellow-darken-3"
                color="grey-darken-1"
                density="compact"
                half-increments
                readonly
                size="small"
              />

              <div>
                <span class="small m-0">{{
                  numeralFormat(product.rate_count, "0,0a")
                }}</span>
                <span class="text-muted small me-1 ms-2 mt-0 mb-0">
                  {{ $t("admin_shop.products.product_widget.review_unit") }}
                </span>
              </div>
            </template>
            <small v-else-if="showRatting" class="d-block mt-2"
              >No Review</small
            >
          </div>
          <div
            v-if="showStatistics && !show_price_detail"
            class="w-50 p-3 px-4 text-start"
          >
            <p class="mb-1">
              <i
                :class="quantity ? 'text-success' : 'text-muted'"
                class="fas fa-boxes"
              />
              <small class="mx-1">
                {{ $t("admin_shop.products.product_widget.in_stock") }}:
              </small>
              <small v-if="isFile">
                {{ $t("global.commons.infinite") }}
              </small>
              <span v-else-if="quantity">
                {{ numeralFormat(quantity, "0,0a") }}
                <span class="small">{{
                  $t("admin_shop.products.product_widget.product_unit")
                }}</span>
              </span>
              <b v-else class="text-danger m-small">{{
                $t("global.commons.out_of_stock")
              }}</b>

              <v-icon
                v-if="quantity > 0 && quantity < 5"
                :title="$t('global.commons.low_inventory_warning')"
                class="ms-2"
                color="amber"
                size="small"
                >fa:fas fa-exclamation-circle
              </v-icon>
            </p>

            <p class="mb-1">
              <i class="fas fa-cash-register text-muted" />
              <small class="mx-1"
                >{{ $t("admin_shop.products.product_widget.total_sell") }}:
              </small>
              {{ numeralFormat(product.sells, "0,0a") }}
              <span class="small">{{
                $t("admin_shop.products.product_widget.product_unit")
              }}</span>
            </p>

            <p class="mb-1">
              <i class="fas fa-eye text-muted" />
              <small class="mx-1"
                >{{ $t("admin_shop.products.product_widget.total_view") }}:
              </small>
              {{ numeralFormat(product.visits, "0,0a") }}
              <span class="small">{{
                $t("admin_shop.products.product_widget.view_unit")
              }}</span>
            </p>

            <v-row no-gutters>
              <v-chip
                v-if="!product.original"
                class="m-1 text-uppercase px-2"
                color="red"
                pill
                size="x-small"
                variant="outlined"
                >{{ $t("global.commons.fake") }}
              </v-chip>
              <v-chip
                v-if="
                  conditionObject &&
                  product.condition != ProductCondition.NEW.code
                "
                class="m-1 text-uppercase px-2"
                pill
                size="x-small"
                variant="outlined"
                >{{ $t(conditionObject.title) }}
              </v-chip>

              <router-link
                v-if="product.ar_src"
                :to="{
                  name: IS_VENDOR_PANEL
                    ? 'Vendor_Product3DPage'
                    : 'BPageProduct3D',
                  params: { product_id: product.id },
                }"
                class="row-hover mx-auto"
                title="AR \ 3D"
                @click.stop
              >
                <v-img
                  :src="require('../../../../../assets/icons/3d.svg')"
                  class=""
                  height="24"
                  width="24"
                ></v-img>
              </router-link>

              <router-link
                v-if="product.video"
                :to="{
                  name: IS_VENDOR_PANEL
                    ? 'Vendor_AddProduct'
                    : 'BPageProductEdit',
                  params: { product_id: product.id },
                  hash: '#images',
                }"
                class="row-hover mx-auto"
                title="Video"
                @click.stop
              >
                <v-icon class="" color="#D93F21" size="24" width="24"
                  >fa:fab fa-youtube
                </v-icon>
              </router-link>

              <router-link
                v-if="
                  product.reselling &&
                  !IS_VENDOR_PANEL /*Con not be vendor [wholesaling selldone]!*/
                "
                :to="{
                  name: 'BPageProductDropshipping',
                  params: { product_id: product.id },
                }"
                class="row-hover mx-auto"
                title="Drop shipping"
                @click.stop
              >
                <img
                  :src="
                    require('../../../../../assets/icons/dropshipping-green.svg')
                  "
                  height="24"
                  width="24"
                />
              </router-link>
            </v-row>
          </div>
        </div>
      </v-slide-y-reverse-transition>
    </div>

    <v-progress-circular
      v-if="deleting || restoring"
      :color="deleting ? 'red' : 'green'"
      class="center-absolute"
      indeterminate
    >
      <v-icon v-if="deleting" color="red">delete</v-icon>
      <v-icon v-else-if="restoring" color="green"
        >settings_backup_restore
      </v-icon>
    </v-progress-circular>
  </s-widget>
</template>

<script lang="ts">
import CircleImage from "../../../../../ui/image/CircleImage.vue";
import UTimeProgressBar from "../../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import ProductVariantsView from "../../../../../storefront/product/variant/ProductVariantsView.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { ProductCondition } from "@selldone/core-js/enums/product/ProductCondition";
import { PricingTypes } from "@selldone/core-js/enums/product/PricingTypes";
import BNoteButton from "../../../../note/button/BNoteButton.vue";
import UPriceInvalid from "@selldone/components-vue/ui/price/invalid/UPriceInvalid.vue";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus.ts";

export default {
  name: "BProductWindowProductLarge",
  mixins: [ProductMixin, DateMixin],

  components: {
    UPriceInvalid,
    BNoteButton,
    ProductVariantsView,
    UTimeProgressBar,
    CircleImage,
  },
  emits: ["select", "click:image", "onShowNote", "onSelect", "contextmenu"],
  props: {
    modernList: { type: Boolean, default: false },
    multiSelectProducts: { type: Boolean, default: false },
    product: {
      required: true,
      type: Object,
    },
    shop: {
      required: true,
      type: Object,
    },

    small: {
      required: false,
      default: false,
      type: Boolean,
    },

    dark: {
      required: false,
      default: false,
      type: Boolean,
    },
    color: {
      required: false,
      default: "white",
      type: String,
    },

    extended: {
      required: false,
      default: true,
      type: Boolean,
    },

    showEditButton: {
      required: false,
      type: Boolean,
      default: false,
    },
    showRatting: {
      required: false,
      type: Boolean,
      default: false,
    },

    showStatistics: {
      required: false,
      type: Boolean,
      default: false,
    },
    showPrice: {
      required: false,
      type: Boolean,
      default: false,
    },

    compactMode: {
      required: false,
      type: Boolean,
      default: false,
    },

    hover: {
      type: Boolean,
      default: true,
    },
    filterVariant: {},

    dashed: {
      type: Boolean,
      default: true,
    },
    deleting: {
      type: Boolean,
      default: false,
    },
    restoring: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    shortcut: {
      type: Boolean,
      default: false,
    },
    showNotes: Boolean,
    showSelect: Boolean,
    iSelected: Boolean,
  },

  data() {
    return {
      ProductType: ProductType,
      ProductStatus: ProductStatus,

      show_price_detail: false,
      show_list_details: false,
      ProductCondition: ProductCondition,
    };
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    vendor() {
      // Vendor is owner!
      return this.product.vendor;
    },
    vendors() {
      // Vendors assigned to the product!
      return this.product.vendors;
    },

    isFile() {
      return this.product.type === ProductType.FILE.code;
    },
    quantity() {
      return this.isFile ? 999 : this.product.quantity;
    },
    price_converted() {
      if (!this.product) return 0;

      if (this.filterVariant)
        return this.CalcPriceProductCurrentCurrency(
          this.shop,
          this.filterVariant,
          null,
        );

      return this.CalcPriceProductCurrentCurrency(
        this.shop,
        this.product,
        null,
      );
    },
    discount_percent() {
      return this.discountProductPercent(this.shop, this.product, null);
    },

    state_class() {
      return this.product.status === "Close"
        ? "bg-danger"
        : this.quantity || this.product.type === ProductType.FILE.code
          ? "bg-success"
          : "bg-warning";
    },
    conditionObject() {
      return Object.values(ProductCondition).find(
        (item) => item.code === this.product.condition,
      );
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
    pricing() {
      return PricingTypes[this.product.pricing];
    },

    // -------- Uploading image: --------
    uploading() {
      const found = Object.values(this.$store.getters.getUploadingKeeper).find(
        (it) => it.target && it.target.product === this.product.id,
      );
      return found ? found : null;
    },
    // ----------------------------------

    disabled() {
      // On store panel always all products are enabled to click!
      if (!this.IS_VENDOR_PANEL) return false;

      // It's not a product of the vendor! It has multi vendors, so vendor can not edit it in their panel.
      return !this.vendor;
    },

    status_obj() {
      return ProductStatus[this.product.status];
    },
  },
  mounted() {},

  methods: {
    onListSelect(event: MouseEvent) {
      if (this.disabled) return;
      if (
        this.showSelect ||
        (this.multiSelectProducts && (event.ctrlKey || event.metaKey))
      ) {
        this.$emit("onSelect", this.product);
      } else {
        this.$emit("select");
      }
    },
    onListPriceClick() {
      if (!this.showEditButton || this.disabled) return;
      this.$router.push({
        name: this.IS_VENDOR_PANEL ? "Vendor_AddProduct" : "BPageProductEdit",
        params: { product_id: this.product.id },
        hash: "#price",
      });
    },
    getConnectIcon(connect_id: string | number) {
      return window.CDN.GET_CONNECT_ICON(connect_id);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-list {
  --product-list-line: var(
    --sd-modern-border,
    rgba(var(--v-theme-on-surface), 0.09)
  );
  --product-list-muted: var(
    --sd-modern-muted,
    rgba(var(--v-theme-on-surface), 0.66)
  );
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
  height: var(--b-products-list-item-height, auto) !important;
  margin: 0 !important;
  border-block-start: 1px solid var(--product-list-line);
  border-radius: 0 !important;
  color: rgb(var(--v-theme-on-surface));
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
  letter-spacing: normal;
  text-align: start;

  &--deleted {
    opacity: 0.65;
  }
  &__row {
    flex: 1 0 auto;
    display: grid;
    grid-template-columns: 24px minmax(140px, 1fr) 88px 72px 100px 146px;
    align-items: center;
    gap: 10px;
    min-height: var(--b-products-list-row-min-height, 72px);
    padding: 8px 12px;
    border-radius: 8px;
  }
  &--selected &__row {
    background: rgba(var(--v-theme-primary), 0.08);
    border-radius: 0;
  }
  &__select {
    display: grid;
    align-items: center;
    justify-items: center;
    width: 24px;
    min-height: 32px;
    input {
      width: 15px;
      height: 15px;
      margin: 0;
      accent-color: rgb(var(--v-theme-primary));
      cursor: pointer;
    }
    input:disabled {
      cursor: default;
    }
  }
  &__identity {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  &__image {
    flex: 0 0 40px;
    background: rgba(var(--v-theme-on-surface), 0.04);
    border-radius: 8px !important;
    cursor: pointer;
  }
  &__identity-copy {
    flex: 1 1 auto;
    min-width: 0;
    container: product-list-identity / inline-size;
  }
  &__name {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: start;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
    overflow-wrap: anywhere;
    cursor: pointer;
    &:disabled {
      color: var(--product-list-muted);
      cursor: default;
    }
  }
  &__secondary {
    display: block;
    color: var(--product-list-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  &__meta {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    color: var(--product-list-muted);
    font-size: 13px;
    line-height: 20px;
  }
  &__meta-flags {
    display: flex;
    flex: 0 0 auto;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 7px;
    max-width: 100%;
  }
  &__variants {
    display: none;
    flex: 1 1 0;
    flex-wrap: nowrap;
    min-width: 0;
    height: 20px;
    overflow: hidden;
    color: inherit;
    line-height: 20px;
    white-space: nowrap;
    :deep(.-var-row) {
      flex: 0 1 auto;
      flex-wrap: nowrap;
      min-width: 0;
      max-width: 100%;
      height: 20px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-size: inherit !important;
      line-height: 20px;
    }
    :deep(.-var-row:first-child) {
      padding-inline-start: 7px;
    }
    :deep(.card-badge-info) {
      min-width: 0;
      max-width: 100%;
      padding: 0 2px;
      overflow: hidden;
      font-weight: 400;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    :deep(.card-badge-color) {
      flex-shrink: 0;
    }
    :deep(.v-icon) {
      font-size: 15px;
    }
    :deep(.hover-scale:hover) {
      transform: none;
      background: transparent;
      font-size: inherit;
    }
  }
  &__variants.product-variant-view.-small {
    color: inherit;
    font-size: 13px !important;
  }
  &__status {
    gap: 5px;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }
  &__type,
  &__marker {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  &__type img,
  &__marker img {
    width: 13px;
    height: 13px;
    object-fit: contain;
  }
  &__price {
    min-width: 0;
    text-align: end;
  }
  &__price-value {
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: inherit;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
  }
  button.b-product-list__price-value {
    cursor: pointer;
  }
  &__price-value :deep(.u--price) {
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
  }
  &__discount {
    margin-inline-start: 4px;
    color: rgb(var(--v-theme-error));
    font-size: 12px;
    font-weight: 400;
  }
  &__price-warning,
  &__stock-warning {
    display: inline-flex;
    align-items: center;
    margin-inline-start: 4px;
    vertical-align: middle;
  }
  &__stock {
    font-size: 13px;
    line-height: 20px;
  }
  &__activity {
    font-size: 13px;
    line-height: 20px;
  }
  &__activity > span {
    display: block;
  }
  &__activity > .b-product-list__mobile-label {
    display: none;
  }
  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }
  &__actions :deep(.sd-modern-icon-button.v-btn) {
    --sd-modern-icon-button-size: 32px;
    flex: 0 0 32px;
    width: 32px !important;
    min-width: 32px !important;
    height: 32px !important;
    min-height: 32px !important;
    margin: 0;
    padding: 0;
    border-radius: 8px;
  }
  &__actions :deep(.v-icon) {
    font-size: 17px !important;
  }
  &__mobile-label {
    display: none;
  }
  &__details {
    flex: 0 0 auto;
    padding: 14px 16px 16px;
    border-radius: 8px;
    background: rgba(var(--v-theme-on-surface), 0.025);
    font-size: 13px;
    line-height: 21px;
  }
  &__details-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
  &__detail {
    min-width: 0;
  }
  &__detail-title {
    margin: 0 0 5px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  &__pricing {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px 10px;
    margin: 0 0 10px;
    dt {
      color: var(--product-list-muted);
    }
    dd {
      margin: 0;
      text-align: end;
    }
  }
  &__detail-activity {
    display: grid;
    gap: 4px;
    margin-block-end: 6px;
  }
  &__vendor,
  &__vendors {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  &__vendors {
    flex-wrap: wrap;
    gap: 8px 14px;
  }
  &__detail-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 14px;
    margin-block-start: 12px;
  }
  &__detail-links a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: rgb(var(--v-theme-primary));
    text-decoration: none;
    font-size: 13px;
    line-height: 22px;
  }
  &__detail-links img {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }
  button:focus-visible,
  &__image:focus-visible,
  input:focus-visible,
  &__detail-links a:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 4px;
  }
}

@container product-list-identity (min-width: 340px) {
  .b-product-list__variants {
    display: flex;
  }
}

@container b-products-catalog (max-width: 1060px) {
  .b-product-list__row {
    grid-template-columns: 24px minmax(130px, 1fr) 83px 70px 100px 108px;
    gap: 9px;
  }
  .b-product-list__actions .b-product-list__edit {
    display: none;
  }
}
@container b-products-catalog (max-width: 850px) {
  .b-product-list__row {
    grid-template-columns: 24px minmax(130px, 1fr) 83px 70px 108px;
  }
  .b-product-list__activity {
    display: none;
  }
}
@container b-products-catalog (max-width: 760px) {
  .b-product-list__variants {
    display: none;
  }
  .b-product-list__row {
    grid-template-columns: 24px minmax(130px, 1fr) 83px 70px 146px;
  }
  .b-product-list__actions .b-product-list__edit {
    display: inline-grid;
  }
}
@container b-products-catalog (max-width: 530px) {
  .b-product-list {
    &__row {
      grid-template-columns: 26px minmax(0, 1fr);
      gap: 10px 8px;
      padding: 10px 12px;
    }
    &__select {
      min-height: 44px;
      align-self: start;
    }
    &__identity {
      align-items: flex-start;
    }
    &__price,
    &__stock,
    &__activity,
    &__actions {
      grid-column: 2;
    }
    &__price,
    &__stock,
    &__activity {
      display: grid;
      grid-template-columns: 75px minmax(0, 1fr);
      gap: 8px;
      text-align: start;
    }
    &__price:empty,
    &__stock:empty,
    &__activity:empty {
      display: none;
    }
    &__price > .b-product-list__secondary,
    &__activity > .b-product-list__secondary {
      grid-column: 2;
    }
    &__mobile-label {
      display: block;
      line-height: 20px;
    }
    &__activity > .b-product-list__mobile-label {
      display: block;
    }
    &__actions {
      justify-content: flex-start;
    }
    &__actions :deep(.sd-modern-icon-button.v-btn) {
      --sd-modern-icon-button-size: 44px;
      flex-basis: 44px;
      width: 44px !important;
      min-width: 44px !important;
      height: 44px !important;
      min-height: 44px !important;
    }
    &__details {
      padding: 14px 12px;
    }
    &__details-grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 14px;
    }
    &__detail-links a {
      min-height: 44px;
    }
  }
}
@media (pointer: coarse) {
  .b-product-list__actions :deep(.sd-modern-icon-button.v-btn) {
    --sd-modern-icon-button-size: 44px;
    flex-basis: 44px;
    width: 44px !important;
    min-width: 44px !important;
    height: 44px !important;
    min-height: 44px !important;
  }
  .b-product-list__select {
    min-height: 44px;
  }
}

.b--product-window-product-large {
  background: var(--card-color);
}

.discount-badge {
  vertical-align: text-top;
  color: white;
  background-image: linear-gradient(to bottom right, #d32f2f, #c2185b);
  border-radius: 8px;
  padding: 2px 4px;
  font-size: 0.7em;
  unicode-bidi: embed;
}

.widget-hover {
  transition: box-shadow 0.65s !important;
  min-height: 100px;

  &:hover {
    box-shadow: 0px 10px 50px 0px rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.5s !important;

    .drop-shipping-mode {
      height: 32px;
      background-color: rgba(104, 159, 56, 0.89);

      img,
      span {
        transition-delay: 0.25s;
        opacity: 1;
      }
    }
  }
}

a {
  color: #444;

  &:hover {
    color: #444;
  }
}

.drop-shipping-mode {
  transition: all 0.35s;
  background-color: #689f38;
  position: absolute;
  height: 3px;
  top: 0;
  width: 100%;
  left: 0;
  pointer-events: none;

  color: #fff;

  img,
  span {
    transition: all 0.15s;
    opacity: 0;
    margin: 4px;
  }
}

.-deleted {
  border-color: red !important;

  &:after {
    position: absolute;
    bottom: 0;
    content: attr(deleted_at);
    background-color: red;
    padding: 4px 8px;
    width: 100%;
    left: 0;
    z-index: 1;
    color: #fff;
    text-align: center;
  }
}

.v-t {
  vertical-align: text-top;
}

.border-selected {
  border: solid #0061e0 4px !important;
}

.-dashed {
  border: #444 dashed 1.5px;
}

.-shortcut {
  border-color: #009688 !important;
}
</style>
