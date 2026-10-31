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
  <div v-if="modern" class="b-product-info-refined text-start">
    <section class="sd-modern-widget b-product-info-refined__widget">
      <header class="sd-modern-header b-product-info-refined__header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"><v-icon>inventory_2</v-icon></span>
          <div>
            <h2 class="sd-modern-title-text">{{ $t('b_product_dashboard.identity.info_title') }}</h2>
            <p class="sd-modern-subtitle">{{ $t('b_product_dashboard.identity.info_subtitle') }}</p>
          </div>
        </div>
        <div class="sd-modern-actions b-product-info-refined__utilities">
          <v-btn icon variant="text" class="sd-modern-icon-button" :aria-label="$t('b_product_dashboard.identity.embed')" @click="showEmbedCode">
            <v-icon>code</v-icon>
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('b_product_dashboard.identity.embed') }}</v-tooltip>
          </v-btn>
          <v-btn icon variant="text" class="sd-modern-icon-button" :aria-label="$t('b_product_dashboard.identity.public_qr')" @click="showBarcode(true, true)">
            <v-icon>qr_code_2</v-icon>
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('b_product_dashboard.identity.public_qr') }}</v-tooltip>
          </v-btn>
        </div>
      </header>

      <div class="b-product-info-refined__links">
        <b-product-breadcrumbs :image-size="22" :product="product" :shop="shop" prepend-icon="folder" class="b-product-info-refined__breadcrumb" />
        <v-btn variant="text" color="primary" class="sd-modern-button sd-modern-button--small" prepend-icon="content_copy" @click.stop="copyToClipboard(product_link)">{{ $t('b_product_dashboard.identity.copy_link') }}</v-btn>
        <v-btn v-if="product_external_service" :href="product.external" target="_blank" rel="noopener noreferrer" variant="text" color="primary" class="sd-modern-button sd-modern-button--small">
          <img class="me-2" :src="product_external_service.image" height="14" :alt="$t(product_external_service.name)" />
          {{ $t(product_external_service.actionText) }}<v-icon end size="16">north_east</v-icon>
        </v-btn>
      </div>

      <div class="b-product-info-refined__metadata">
        <span class="b-product-info-refined__identity"><img :src="getProductTypeImage(product.type)" height="24" :alt="getProductTypeName(product.type)" />{{ getProductTypeName(product.type) }}</span>
        <span class="b-product-info-refined__identity">
          <u-avatar-folder :size="24" :border-size="2" :src="product.category ? getShopImagePath(product.category.icon, 64) : undefined" hide-side-icon placeholder-icon="home" />
          {{ $t('product_admin.dashboard.info.category') }}: {{ product.category ? product.category.title : $t('global.commons.home') }}
        </span>
        <span v-if="product.inputs?.length" class="b-product-info-refined__identity"><v-icon size="16">input</v-icon>{{ $t('product_admin.dashboard.info.inputs') }}</span>
        <span v-if="product.outputs?.length" class="b-product-info-refined__identity"><v-icon size="16">output</v-icon>{{ $t('product_admin.dashboard.info.outputs') }}</span>
        <span v-if="product.inputs?.length || product.outputs?.length" class="sd-modern-muted">{{ $t('product_admin.dashboard.info.user_data_form') }}</span>
      </div>

      <div v-if="product.includes?.length" class="b-product-info-refined__included">
        <span>{{ $t('global.commons.included_in_the_product') }}</span>
        <v-avatar v-for="include in product.includes" :key="include.id" class="hover-scale" color="transparent" rounded size="32">
          <img :src="getShopImagePath(include.image)" :alt="include.title" />
          <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ include.title }}</v-tooltip>
        </v-avatar>
      </div>

      <div v-if="product.reselling" class="sd-modern-notice b-product-info-refined__reselling">
        <span class="b-product-info-refined__identity"><img src="../../../../assets/icons/dropshipping.svg" height="24" width="24" alt="" />{{ $t('global.commons.drop_shipping') }}</span>
        <span v-if="product.shipping" class="b-product-info-refined__identity">
          {{ $t('global.commons.shipping_area') }}
          <flag v-for="country in Object.keys(product.shipping).limit(10)" :key="country" :iso="country" :squared="false" :title="getCountryName(country)" />
          <span v-if="Object.keys(product.shipping).length > 10">+{{ Object.keys(product.shipping).length - 10 }}</span>
        </span>
        <span>{{ $t('b_product_dashboard.identity.reselling_shops') }}: {{ product.reselling_shops }}</span>
        <span>{{ $t('b_product_dashboard.identity.reselling_count') }}: {{ product.reselling_count }}</span>
      </div>

      <section class="b-product-info-refined__group">
        <div class="b-product-info-refined__group-head">
          <h3>{{ $t('product_admin.dashboard.info.staff_messages') }}</h3>
          <v-btn variant="text" color="primary" class="sd-modern-button sd-modern-button--small" prepend-icon="post_add" @click="dialog_note = true">{{ $t('product_admin.dashboard.info.add_note') }}</v-btn>
        </div>
        <button v-if="note?.length" type="button" class="b-product-info-refined__note" @click="dialog_note = true">
          <v-avatar size="32"><v-img :src="getUserAvatar(note[note.length - 1].user_id)" /></v-avatar>
          <span>
            <span class="b-product-info-refined__note-meta"><strong>{{ note[note.length - 1].user_name }}</strong><time>{{ getFromNowString(note[note.length - 1].date) }} · {{ getLocalDateString(note[note.length - 1].date) }}</time></span>
            <span class="b-product-info-refined__note-body">{{ note[note.length - 1].body }}</span>
            <span class="text-primary">{{ $t('b_product_dashboard.identity.note_history') }}</span>
          </span>
        </button>
      </section>

      <section class="b-product-info-refined__group">
        <div class="b-product-info-refined__group-head">
          <h3>{{ $t('product_admin.dashboard.info.product_tags') }}</h3>
          <v-btn variant="text" color="primary" class="sd-modern-button sd-modern-button--small" prepend-icon="label" @click="dialog_tags = true">{{ $t('product_admin.dashboard.info.edit_tags') }}</v-btn>
        </div>
        <div class="b-product-info-refined__tags">
          <span v-if="product.map" class="sd-modern-tag">
            <flag v-if="product.map.country" :iso="product.map.country" :squared="false" class="me-1" />{{ product.map.title }}
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start"><strong>{{ $t('b_product_dashboard.identity.map_tag') }}</strong><div>{{ MapHelper.GenerateFullAddressFromMapInfo(product.map) }}</div></v-tooltip>
          </span>
          <span v-for="tag in product.tags" :key="tag" class="sd-modern-tag">{{ tag }}</span>
        </div>
      </section>
    </section>

    <slot name="before-variants" />

    <section class="sd-modern-widget b-product-info-refined__widget">
      <header class="sd-modern-header b-product-info-refined__header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"><v-icon>{{ product.product_variants?.length ? 'view_in_ar' : 'sell' }}</v-icon></span>
          <div>
            <h2 class="sd-modern-title-text">{{ $t(product.product_variants?.length ? 'b_product_dashboard.identity.variants_title' : 'b_product_dashboard.identity.pricing_title') }}</h2>
            <p class="sd-modern-subtitle">{{ product.product_variants?.length ? $t('b_product_dashboard.identity.variants_subtitle', { count: product.product_variants.length }) : $t('b_product_dashboard.identity.pricing_subtitle') }}</p>
          </div>
        </div>
        <v-btn :to="{ name: IS_VENDOR_PANEL ? 'Vendor_ProductInventoryPage' : 'BPageProductInventory' }" variant="text" color="primary" class="sd-modern-button sd-modern-button--small" append-icon="arrow_forward">{{ $t('b_product_dashboard.identity.manage_inventory') }}</v-btn>
      </header>
      <template v-if="product.product_variants?.length">
        <s-country-select v-if="add_by_dropShipping" v-model="selected_shipping_country" :filter="shipping_countries" class="max-width-field mb-3" dense hide-details item-value="alpha2" solo />
        <b-product-variants-table modern :missed-variants="missed_variants" :product="product" :profit="add_by_dropShipping" :profit-function="profitCalculate" :shipping-cost="add_by_dropShipping && parent?.shipping ? parent.shipping[selected_shipping_country] : 0" :shop="shop" @select="(variant) => $router.push({ name: IS_VENDOR_PANEL ? 'Vendor_ProductInventoryPage' : 'BPageProductInventory', query: { variant_id: variant.id } })" />
      </template>
      <v-table v-else class="sd-modern-table b-product-info-refined__pricing" density="compact">
        <thead><tr><th>{{ $t('global.commons.Price') }}</th><th>{{ $t('global.commons.commission') }}</th><th>{{ $t('global.commons.Discount') }}</th><th>{{ $t('global.commons.customer_price') }}</th><th>{{ $t('global.commons.In_Stock') }}</th><th>SKU / MPN</th><th>{{ $t('global.commons.actions') }}</th></tr></thead>
        <tbody><tr>
          <td :data-label="$t('global.commons.Price')"><u-price :amount="product.price" :currency="product.currency" /></td>
          <td :data-label="$t('global.commons.commission')"><u-price :amount="product.commission" :currency="product.currency" /></td>
          <td :data-label="$t('global.commons.Discount')"><u-price :amount="product.discount" :currency="product.currency" /><u-chip-discount :percent="(100 * product.discount) / (product.price + product.commission)" class="ms-2" size="small" :start="product.dis_start" :end="product.dis_end" /><u-time-progress-bar :created-time="product.created_at" :end-time="product.dis_end" :start-time="product.dis_start" small /></td>
          <td :data-label="$t('global.commons.customer_price')"><u-price :amount="priceProductByCurrency(shop, product, null, product.currency)" :currency="product.currency" /></td>
          <td :data-label="$t('global.commons.In_Stock')"><span v-if="isPhysical || isVirtual || isService">{{ numeralFormat(product.quantity, '0.[0] a') }}</span><s-files-group v-else-if="isFile" :files="product.files" /><span v-else>—</span></td>
          <td data-label="SKU / MPN"><div v-if="product.sku">SKU: <span v-copy @click.stop>{{ product.sku }}</span></div><div v-if="product.mpn">MPN: <span v-copy @click.stop>{{ product.mpn }}</span></div></td>
          <td :data-label="$t('global.commons.actions')"><div class="b-product-info-refined__utilities">
            <v-btn :disabled="!product.sku" icon variant="text" class="sd-modern-icon-button" :aria-label="$t('b_product_dashboard.identity.sku_barcode')" @click.stop="showBarcode(false, false)"><v-icon>fa:fas fa-barcode</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('b_product_dashboard.identity.sku_barcode') }}</v-tooltip></v-btn>
            <v-btn :disabled="!product.sku" icon variant="text" class="sd-modern-icon-button" :aria-label="$t('b_product_dashboard.identity.sku_qr')" @click.stop="showBarcode(true, false)"><v-icon>fa:fas fa-qrcode</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('b_product_dashboard.identity.sku_qr') }}</v-tooltip></v-btn>
          </div></td>
        </tr></tbody>
      </v-table>
    </section>
  </div>
  <s-widget-box
    v-else
    :title="`<h5 class='align-items-center pb-1' title='${
      product.title
    }'>    <span class='circle ${
      product.status === ProductStatus.Open.code
        ? 'bg-success'
        : product.status === ProductStatus.Close.code
          ? 'bg-primary'
          : product.status === ProductStatus.Pending.code
            ? 'bg-warning'
            : 'bg-danger'
    } mr-sm' style='font-size: 6px;'></span> ${product.title?.limitWords(
      8,
    )}  </h5>`"
    titlePadding="150px"
  >
    <template v-slot:top-left>
      <!-- ⬬⬬⬬⬬ Embed ⬬⬬⬬⬬ -->
      <span
        caption="Embed"
        class="sub-caption inline-block -hover me-0 me-sm-3"
        title="Embed iframe code"
      >
        <v-btn icon variant="text" @click="showEmbedCode">
          <v-icon color="#111">code</v-icon>
        </v-btn>
      </span>

      <!-- ⬬⬬⬬⬬ QR CODE ⬬⬬⬬⬬ -->
      <span
        caption="Barcode"
        class="sub-caption inline-block -hover me-0"
        title="Product public link ⮕ QR Code"
      >
        <v-btn icon variant="text" @click="showBarcode(true, true)">
          <v-icon color="#111">fa:fas fa-qrcode</v-icon>
        </v-btn>
      </span>
    </template>

    <template v-slot:actions>
      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Breadcrumbs ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

      <b-product-breadcrumbs
        v-if="product?.category_id || $vuetify.display.smAndUp"
        :image-size="22"
        :product="product"
        :shop="shop"
        class="my-5 my-sm-0"
        prepend-icon="folder"
      ></b-product-breadcrumbs>

      <v-row dense class="overflow-auto hide-scroll flex-nowrap single-line">
        <v-col class="d-flex align-center">
          <v-btn
            :href="product_link"
            :title="$t('product_admin.dashboard.info.link')"
            class="me-2"
            icon
            target="_blank"
            variant="text"
          >
            <v-icon>link</v-icon>
          </v-btn>

          <b class="me-2 d-none d-sm-inline">{{ $t(shop.title) }} |</b>

          <v-btn
            @click.stop="copyToClipboard(product_link)"
            color="#000"
            class="tnt"
            size="small"
            rounded="lg"
            variant="flat"
            append-icon="content_copy"
          >
            <v-avatar class="me-2" size="14">
              <img :src="getShopImagePath(shop.icon, 96)" />
            </v-avatar>

            {{ $t("product_admin.dashboard.info.link") }}
          </v-btn>
        </v-col>
        <v-col v-if="product_external_service" class="d-flex align-center">
          <v-btn
            :href="product.external"
            class="me-2"
            icon
            target="_blank"
            variant="text"
          >
            <v-icon>link</v-icon>
          </v-btn>

          <b class="me-2 d-none d-sm-inline"
            >{{ $t(product_external_service.name) }} |</b
          >
          <v-btn
            :color="product_external_service.color"
            class="tnt"
            size="small"
            rounded="lg"
            :href="product.external"
            target="_blank"
            variant="flat"
            append-icon="open_in_new"
          >
            <img
              class="me-2"
              :src="product_external_service.image"
              height="14"
              width="auto"
            />

            {{ $t(product_external_service.actionText) }}
          </v-btn>
        </v-col>
      </v-row>
      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Messages ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

      <div class="dashed-hr my-2 mx-n5"></div>

      <v-row align="center" class="small text-muted py-2" no-gutters>
        <i class="fas fa-angle-down me-2"></i>
        {{ $t("product_admin.dashboard.info.staff_messages") }}

        <v-spacer></v-spacer>
        <v-btn
          class="tnt"
          color="primary"
          size="small"
          @click="dialog_note = true"
        >
          <v-icon class="me-1" start>post_add</v-icon>
          {{ $t("product_admin.dashboard.info.add_note") }}
        </v-btn>
      </v-row>

      <div
        v-if="note && note.length"
        class="text-start pp"
        @click="dialog_note = true"
      >
        <div class="d-flex align-center">
          <v-avatar :size="32" class="avatar-gradient -thin -staff me-2">
            <v-img :src="getUserAvatar(note[note.length - 1].user_id)" />
          </v-avatar>
          <div class="flex-grow-1" title="Sender">
            <b>{{ note[note.length - 1].user_name }}</b>
            <span class="d-block small" title="Message send time"
              >{{ getFromNowString(note[note.length - 1].date) }}
              ●
              {{ getLocalDateString(note[note.length - 1].date) }}</span
            >
          </div>
        </div>
        <div class="typo-body my-2">
          {{ note[note.length - 1].body }}
        </div>
      </div>

      <div class="dashed-hr my-2 mx-n5"></div>

      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Tags ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
      <v-row align="center" class="small text-muted py-2" no-gutters>
        <i class="fas fa-angle-down me-2"></i>
        {{ $t("product_admin.dashboard.info.product_tags") }}

        <v-spacer></v-spacer>
        <v-btn
          class="tnt"
          color="primary"
          size="small"
          @click="dialog_tags = true"
        >
          <v-icon class="me-1" start>label</v-icon>

          {{ $t("product_admin.dashboard.info.edit_tags") }}
        </v-btn>
      </v-row>

      <div class="text-start">
        <v-chip
          v-if="product.map"
          class="ma-1"
          color="#fafafa"
          variant="flat"
          key="-map"
        >
          <flag
            v-if="product.map.country"
            :iso="product.map.country"
            :squared="false"
            class="me-2"
          />
          {{ product.map.title }}

          <v-tooltip
            activator="parent"
            max-width="320"
            content-class="bg-black text-start"
          >
            <b>Map Tag</b>
            <div>
              {{ MapHelper.GenerateFullAddressFromMapInfo(product.map) }}
            </div>
          </v-tooltip>
        </v-chip>

        <v-chip
          v-for="item in product.tags"
          :key="item"
          :title="`Tag: ${item}`"
          class="ma-1"
          color="#fafafa"
          variant="flat"
        >
          <v-avatar
            :color="item ? item.toColor(true) : '#333'"
            class="text-white"
            start
            >{{ item?.slice(0, 1).toUpperCase() }}
          </v-avatar>
          {{ item }}
        </v-chip>
      </div>

      <div class="dashed-hr my-2 mx-n5"></div>

      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ reselling ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
      <v-row
        v-if="product.reselling"
        class="shadow-paper rounded-18px border-between -hide-sm mb-3 mt-5 text-center mx-2 bg-white"
        no-gutters
      >
        <div class="p-2 m-2 pe-4">
          <p class="my-2 small">{{ $t("global.commons.drop_shipping") }}</p>

          <img
            height="32"
            src="../../../../assets/icons/dropshipping.svg"
            width="32"
          />
        </div>

        <div v-if="product.shipping" class="p-2 m-2 flex-grow-1">
          <p class="my-2 small">{{ $t("global.commons.shipping_area") }}</p>
          <flag
            v-for="country in Object.keys(product.shipping)?.limit(10)"
            :key="country"
            :iso="country"
            :squared="false"
            :title="getCountryName(country)"
            class="me-2"
          />
          <span
            v-if="Object.values(product.shipping).length > 10"
            class="mx-1 text-subtitle-2"
          >
            {{ Object.values(product.shipping).length - 1 }}
            {{ $t("global.commons.more") }}
            <v-icon class="mx-1">more_horiz</v-icon>
          </span>
        </div>

        <div class="p-2 m-2 flex-grow-1">
          <p class="my-2 small">
            <v-icon class="me-1">storefront</v-icon>
            Reselling shops
          </p>
          <b>{{ product.reselling_shops }}</b>
        </div>

        <div class="p-2 m-2 flex-grow-1">
          <p class="my-2 small">
            <v-icon class="me-1">conveyor_belt</v-icon>
            Reselling count
          </p>
          <b>{{ product.reselling_count }}</b>
        </div>
      </v-row>
    </template>

    <v-row no-gutters>
      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Start variants list ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

      <v-col
        v-if="product.product_variants && product.product_variants.length"
        class="pb-3"
        cols="12"
      >
        <v-row align="center" class="small text-muted py-2" no-gutters>
          <i class="fas fa-angle-down me-2"></i>
          {{ $t("global.commons.Variants") }}
        </v-row>

        <s-country-select
          v-if="add_by_dropShipping"
          v-model="selected_shipping_country"
          :filter="shipping_countries"
          class="max-width-field m-2"
          dense
          hide-details
          item-value="alpha2"
          solo
        ></s-country-select>

        <b-product-variants-table
          :missed-variants="missed_variants"
          :product="product"
          :profit="add_by_dropShipping"
          :profit-function="profitCalculate"
          :shipping-cost="
            add_by_dropShipping && parent && parent.shipping
              ? parent.shipping[selected_shipping_country]
              : 0
          "
          :shop="shop"
          @select="
            (product_variant) => {
              $router.push({
                name: 'BPageProductInventory',
                query: { variant_id: product_variant.id },
              });
            }
          "
        >
        </b-product-variants-table>
      </v-col>
      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ End variants list ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

      <!-- ------------------- Start No variants list ------------------- -->

      <v-col v-else class="pb-3 mb-3" cols="12">
        <v-row
          v-if="isPhysical || isVirtual"
          align="center"
          class="small text-muted py-2"
          no-gutters
        >
          <i class="fas fa-angle-down me-2"></i>
          {{ $t("global.commons.No_variants") }}
        </v-row>
        <v-table class="rounded-lg overflow-hidden" density="compact">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-center">{{ $t("global.commons.Price") }}</th>
                <th class="text-center">{{ $t("global.commons.VAT") }}</th>
                <th class="text-center">
                  {{ $t("global.commons.Discount") }}
                </th>
                <th class="text-center">
                  {{ $t("global.commons.In_Stock") }}
                </th>
                <th class="text-left">SKU / MPN</th>
                <th></th>
              </tr>
            </thead>
            <tbody class="text-center">
              <tr>
                <td>
                  <u-price
                    :amount="product.price"
                    :currency="product.currency"
                  ></u-price>
                </td>
                <td>
                  <u-price
                    :amount="product.commission"
                    :currency="product.currency"
                  ></u-price>
                </td>

                <td>
                  <u-price
                    :amount="product.discount"
                    :currency="product.currency"
                  ></u-price>

                  <u-chip-discount
                    :percent="
                      (100 * product.discount) /
                      (product.price + product.commission)
                    "
                    class="ms-2"
                    size="small"
                    :start="product.dis_start"
                    :end="product.dis_end"
                  ></u-chip-discount>

                  <u-time-progress-bar
                    :created-time="product.created_at"
                    :end-time="product.dis_end"
                    :start-time="product.dis_start"
                    class="max-width-field mx-auto"
                    small
                  />
                </td>

                <td v-if="isPhysical || isVirtual || isService" dir="ltr">
                  {{ numeralFormat(product.quantity, "0.[0] a") }}
                </td>
                <td v-else-if="isFile" class="pt-2" dir="ltr">
                  <s-files-group :files="product.files"></s-files-group>
                </td>

                <td class="text-left">
                  <span v-if="product.sku"
                    ><small>SKU:</small> {{ product.sku }}<br
                  /></span>
                  <span v-if="product.mpn"
                    ><small>MPN:</small> {{ product.mpn }}</span
                  >
                </td>

                <td class="text-center">
                  <v-btn
                    :disabled="!product.sku"
                    :title="product.sku"
                    class="mx-1"
                    icon
                    variant="text"
                    @click.stop="showBarcode(false, false)"
                  >
                    <v-icon>fa:fas fa-barcode</v-icon>
                  </v-btn>
                  <v-btn
                    :disabled="!product.sku"
                    :title="product.sku"
                    class="mx-1"
                    icon
                    variant="text"
                    @click.stop="showBarcode(true, false)"
                  >
                    <v-icon>fa:fas fa-qrcode</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>
      </v-col>

      <!-- ------------------- End No variants list ------------------- -->

      <v-col class="border-end-grater-xs pa-1 text-center" cols="12" sm="4">
        <div class="d-flex align-center text-start justify-sm-center justify-start">
          <img
            :src="getProductTypeImage(product.type)"
            class="me-2 flex-grow-0"
            height="38"
          />
          <div class="flex-grow-0">
            <b>{{ getProductTypeName(product.type) }}</b>
            <small class="d-block"
              >{{ $t("product_admin.dashboard.info.type") }}
            </small>
          </div>
        </div>
      </v-col>

      <v-col class="border-end-grater-xs pa-1 text-center" cols="12" sm="4">
        <div class="d-flex align-center text-start justify-sm-center justify-start">
          <u-avatar-folder
            :size="38"
            :border-size="4"
            class="me-2 flex-grow-0"
            is-amber
            :src="
              product.category
                ? getShopImagePath(product.category.icon, 64)
                : undefined
            "
            hide-side-icon
            elevated
            placeholder-icon="home"
          >
          </u-avatar-folder>
          <div class="flex-grow-0">
            <b>
              {{
                product.category
                  ? product.category.title
                  : $t("global.commons.home")
              }}</b
            >
            <small class="d-block">{{
              $t("product_admin.dashboard.info.category")
            }}</small>
          </div>
        </div>
      </v-col>

      <v-col class="pa-1 text-center" cols="12" sm="4">
        <template v-if="product.inputs?.length || product.outputs?.length">
          <p v-if="product.inputs?.length">
            {{ $t("product_admin.dashboard.info.inputs") }}

            <i class="far fa-check-circle text-success" />
          </p>
          <p v-if="product.outputs?.length">
            {{ $t("product_admin.dashboard.info.outputs") }}

            <i class="far fa-check-circle text-success" />
          </p>

          <p class="text-muted mb-0 mt-2">
            <small>
              {{ $t("product_admin.dashboard.info.user_data_form") }}
            </small>
          </p>
        </template>
        <div v-if="product.includes?.length" class="text-start text-sm-center">
          <b class="d-block small">
            {{ $t("global.commons.included_in_the_product") }}
          </b>

          <v-avatar
            v-for="include in product.includes"
            :key="include.id"
            :title="include.title"
            class="ma-1 hover-scale"
            color="transparent"
            rounded
            size="36"
          >
            <img :src="getShopImagePath(include.image)" />
          </v-avatar>
        </div>
      </v-col>
    </v-row>

  </s-widget-box>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Dialog > QR Code ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <b-product-barcode
      v-model="show_barcode"
      :barcode2d="barcode2d"
      :link-mode="link_mode"
      :product="product"
      :shop="shop"
      :variant="null"
    >
    </b-product-barcode>

    <!-- █████████████████████ Dialog > Note Messages █████████████████████ -->

    <b-note-dialog
      v-model="dialog_note"
      :add-url="
        () =>
          IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_PRODUCT_ADD_NOTE(
                $route.params.vendor_id,
                product.id,
              )
            : window.API.POST_PRODUCT_ADD_NOTE(shop.id, product.id)
      "
      :delete-url="
        (index) =>
          IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_MY_VENDOR_PRODUCT_NOTE(
                $route.params.vendor_id,
                product.id,
                index,
              )
            : window.API.DELETE_PRODUCT_NOTE(shop.id, product.id, index)
      "
      :icon="getShopImagePath(product.icon, 128)"
      :target="product"
      :title="product.title"
    ></b-note-dialog>

    <!-- █████████████████████ Dialog > Edit Tags █████████████████████ -->
    <v-bottom-sheet
      v-model="dialog_tags"
      content-class="rounded-t-xl overflow-hidden"
      max-width="820"
      scrollable
    >
      <v-card flat rounded="0" class="text-start">
        <v-card-title class="d-flex align-center">
          <v-avatar v-if="product.icon" class="me-2" rounded size="24">
            <img :src="getShopImagePath(product.icon, 128)" />
          </v-avatar>

          <span>{{ $t('product_admin.dashboard.info.edit_tags') }} | {{ product.title }}</span>
        </v-card-title>
        <v-card-text>
          <div class="widget-box my-5">
            <b-product-tags-input :product="product"></b-product-tags-input>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog_tags = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- ██████████████████████ Dialog iframe ██████████████████████ -->

    <v-dialog
      v-model="show_iframe_code"
      :fullscreen="$vuetify.display.smAndDown"
      max-width="1000"
      scrollable
      :aria-label="$t('b_product_dashboard.embed.title')"
      transition="dialog-bottom-transition"
    >
      <v-card class="sd-modern-widget b-product-embed-dialog text-start" :class="{ 'b-product-embed-dialog--fullscreen': $vuetify.display.smAndDown }" :theme="USER()?.preferences?.dark ? 'dark' : 'light'">
        <header class="b-product-embed-dialog__header">
          <div class="b-product-embed-dialog__identity">
            <v-avatar rounded="lg" size="34">
              <v-img v-if="product.icon" :src="getShopImagePath(product.icon, 128)" :alt="product.title" />
              <img v-else :src="getProductTypeImage(product.type)" alt="" />
            </v-avatar>
            <div><h2>{{ $t('b_product_dashboard.embed.title') }}</h2><p class="sd-modern-muted">{{ $t('b_product_dashboard.embed.subtitle') }}</p></div>
          </div>
          <v-btn icon variant="text" class="sd-modern-icon-button" :aria-label="$t('global.actions.close')" @click="show_iframe_code = false"><v-icon>close</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip></v-btn>
        </header>
        <v-card-text class="b-product-embed-dialog__body">
          <div class="b-product-embed-dialog__toolbar">
            <span class="b-product-embed-dialog__preview-label"><v-icon size="16">web_asset</v-icon>{{ $t('b_product_dashboard.embed.preview') }}</span>
            <div class="b-product-embed-dialog__sizes" role="group" :aria-label="$t('b_product_dashboard.embed.preview_width')">
              <v-btn variant="text" :aria-pressed="embed_preview === 'desktop'" prepend-icon="desktop_windows" @click="embed_preview = 'desktop'">{{ $t('b_product_dashboard.embed.desktop') }}</v-btn>
              <v-btn variant="text" :aria-pressed="embed_preview === 'mobile'" prepend-icon="smartphone" @click="embed_preview = 'mobile'">{{ $t('b_product_dashboard.embed.mobile') }}</v-btn>
            </div>
          </div>
          <div class="b-product-embed-dialog__preview-well">
            <div class="b-product-embed-dialog__preview" :class="{ 'b-product-embed-dialog__preview--mobile': embed_preview === 'mobile' }">
              <iframe :src="iframe_preview_src" :title="product.title" width="100%" height="640" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          </div>
          <details open class="b-product-embed-dialog__code">
            <summary><span><v-icon size="16">code</v-icon>{{ $t('b_product_dashboard.embed.code') }}</span><v-icon size="16">expand_more</v-icon></summary>
            <p class="sd-modern-muted">{{ $t('b_product_dashboard.embed.help') }}</p>
            <pre dir="ltr"><code>{{ iframe_code }}</code></pre>
          </details>
        </v-card-text>
        <v-card-actions class="b-product-embed-dialog__actions">
          <v-btn variant="text" class="sd-modern-button sd-modern-button--form" @click="show_iframe_code = false">{{ $t('global.actions.close') }}</v-btn>
          <v-btn color="primary" variant="elevated" class="sd-modern-button sd-modern-button--form sd-modern-button--primary" prepend-icon="content_copy" @click="copyToClipboard(iframe_code)">{{ $t('b_product_dashboard.embed.copy') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BProductVariantsTable from "../../variants/table/BProductVariantsTable.vue";
import SCountrySelect from "../../../../ui/country/select/SCountrySelect.vue";
import BNoteDialog from "../../../note/dialog/BNoteDialog.vue";
import BProductTagsInput from "../../../product/tags/input/BProductTagsInput.vue";
import SFilesGroup from "../../../../ui/file/group/SFilesGroup.vue";

import BProductBreadcrumbs from "../../../product/breadcrumbs/BProductBreadcrumbs.vue";
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus";
import { ProductEmbedHelper } from "@selldone/core-js/helper/embed/ProductEmbedHelper";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import { MapHelper, ShopURLs } from "@selldone/core-js";
import { ProductExternal } from "@selldone/components-vue/storefront/product/external/button/ProductExternal.ts";
import UChipDiscount from "@selldone/components-vue/ui/chip/discount/UChipDiscount.vue";
import { defineAsyncComponent } from "vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";

export default {
  name: "BProductInfoAbstractView",
  mixins: [DateMixin, ProductMixin],

  components: {
    UChipDiscount,
    UAvatarFolder,
    BProductBreadcrumbs,
    SFilesGroup,
    BProductTagsInput,
    BNoteDialog,
    BProductBarcode: defineAsyncComponent(
      () =>
        import(
          "@selldone/components-vue/backoffice/product/barcode/BProductBarcode.vue"
        ),
    ),

    SCountrySelect,
    BProductVariantsTable,
    UTimeProgressBar,
    SWidgetBox,
  },
  props: {
    modern: Boolean,
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
    productData: {
      required: true,
      type: Array,
    },
  },

  data: () => ({
    ProductType: ProductType,

    MapHelper: MapHelper,
    ProductStatus: ProductStatus,
    selected_shipping_country: null,

    show_barcode: false,
    barcode2d: false,
    link_mode: false,

    //---------------------------
    dialog_note: false,

    dialog_tags: false,

    //---------------------------
    embed_preview: "desktop",
    show_iframe_code: false,
  }),
  computed: {
    iframe_code() {
      return ProductEmbedHelper.ProductIframe(this.shop, this.product);
    },
    iframe_preview_src() {
      const url = new URL(ProductEmbedHelper.ProductIframeUrl(this.shop, this.product));
      const locale = typeof this.$i18n.locale === "string" ? this.$i18n.locale : this.$i18n.locale?.value;
      if (locale) url.searchParams.set("lang", locale);
      url.searchParams.set("theme", this.USER()?.preferences?.dark ? "dark" : "light");
      return url.href;
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
    parent() {
      return this.product.parent;
    },

    product_link() {
      let domain = ShopURLs.MainShopUrl(this.shop);
      return `${domain}/product/${this.product.id}`;
    },

    isVirtual() {
      return this.product && this.product.type === ProductType.VIRTUAL.code;
    },
    isPhysical() {
      return this.product && this.product.type === ProductType.PHYSICAL.code;
    },

    isFile() {
      return this.product && this.product.type === ProductType.FILE.code;
    },
    isService() {
      return this.product && this.product.type === ProductType.SERVICE.code;
    },

    shipping_countries() {
      if (!this.parent || !this.parent.shipping) return [];
      return Object.keys(this.parent.shipping);
    },
    missed_variants() {
      if (!this.add_by_dropShipping) return null;
      return this.parent.product_variants.filter(
        (variant) =>
          !this.product.product_variants.some(
            (it) => it.parent_id === variant.id,
          ),
      );
    },

    note() {
      return this.product.note;
    },

    //-------------------------- External (Amazon, Airbnb) --------------------------

    product_external_service() {
      return ProductExternal.getServiceData(this.product.external);
    },
  },

  created() {
    this.selected_shipping_country = this.shipping_countries.length
      ? this.shipping_countries[0]
      : null;
  },
  methods: {
    showBarcode(barcode2d, link_mode) {
      this.barcode2d = barcode2d;
      this.show_barcode = true;
      this.link_mode = link_mode;
    },

    profitCalculate(product, variant) {
      const parent_variant = this.parent.product_variants.find(
        (it) => it.id === variant.parent_id,
      );
      if (!parent_variant) return null;

      const current_product_cost = this.priceProductByCurrency(
        this.shop,
        this.product,
        variant,
        this.product.currency,
      );
      const main_product_cost =
        this.priceProductByCurrency(
          this.parent.shop,
          this.parent,
          parent_variant,
          this.parent.currency,
        ) - this.parent.commission; // Commission is for middle seller!

      return current_product_cost - main_product_cost;
    },

    showEmbedCode() {
      this.embed_preview = "desktop";
      this.show_iframe_code = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-embed-dialog.v-card {
  padding: 0;
  border-radius: 16px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;

  &.b-product-embed-dialog--fullscreen { border-radius: 0; }
  .b-product-embed-dialog__header { display: flex; flex: 0 0 auto; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 22px 24px 20px; }
  .b-product-embed-dialog__identity { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
  .b-product-embed-dialog__identity > .v-avatar { flex-shrink: 0; margin-block-start: 1px; }
  .b-product-embed-dialog__identity > div { min-width: 0; }
  h2 { margin: 0; font-size: 18px; font-weight: 500; line-height: 27px; overflow-wrap: anywhere; }
  .b-product-embed-dialog__header p { margin: 3px 0 0; font-size: 13px; line-height: 20px; }
  .b-product-embed-dialog__body { padding: 0 24px 20px; min-height: 0; }
  .b-product-embed-dialog__toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-block-end: 12px; }
  .b-product-embed-dialog__preview-label { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; }
  .b-product-embed-dialog__preview-label > .v-icon { color: var(--sd-modern-muted); }
  .b-product-embed-dialog__sizes { display: inline-flex; align-items: center; gap: 3px; padding: 3px; border-radius: 8px; background: var(--sd-modern-inset); }
  .b-product-embed-dialog__sizes > .v-btn {
    min-height: 30px;
    height: auto;
    padding: 4px 9px;
    border-radius: 6px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0;
    text-transform: none;
    color: var(--sd-modern-muted);
  }
  .b-product-embed-dialog__sizes > .v-btn[aria-pressed="true"] { background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface)); box-shadow: 0 1px 4px rgba(var(--v-theme-on-surface), .08); }
  .b-product-embed-dialog__sizes :deep(.v-btn__content) { font: inherit; letter-spacing: inherit; }
  .b-product-embed-dialog__sizes :deep(.v-icon) { font-size: 15px; width: 15px; height: 15px; }
  .b-product-embed-dialog__preview-well { padding: 14px; background: var(--sd-modern-inset); border: 1px solid var(--sd-modern-border); border-radius: 12px; }
  .b-product-embed-dialog__preview { width: 100%; max-width: 100%; margin-inline: auto; overflow: hidden; border-radius: 8px; background: rgb(var(--v-theme-surface)); }
  .b-product-embed-dialog__preview--mobile { max-width: 360px; }
  .b-product-embed-dialog__preview > iframe { display: block; width: 100%; max-width: 100%; height: 640px; border: 0; }
  .b-product-embed-dialog__code { margin-block-start: 20px; }
  .b-product-embed-dialog__code > summary { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 36px; list-style: none; font-size: 13px; font-weight: 500; cursor: pointer; }
  .b-product-embed-dialog__code > summary::-webkit-details-marker { display: none; }
  .b-product-embed-dialog__code > summary > span { display: inline-flex; align-items: center; gap: 8px; }
  .b-product-embed-dialog__code[open] > summary > .v-icon { transform: rotate(180deg); }
  .b-product-embed-dialog__code p { max-width: 72ch; margin: 6px 0 10px; font-size: 13px; line-height: 20px; }
  .b-product-embed-dialog__code pre { margin: 0; padding: 12px 14px; border: 1px solid var(--sd-modern-border); border-radius: 8px; background: var(--sd-modern-inset); color: inherit; text-align: start; white-space: pre-wrap; overflow-wrap: anywhere; font-family: "SFMono-Regular", Consolas, monospace; font-size: 12px; line-height: 19px; }
  .b-product-embed-dialog__code code { background: transparent; padding: 0; color: inherit; font: inherit; font-family: "SFMono-Regular", Consolas, monospace !important; }
  .b-product-embed-dialog__actions { display: flex; flex: 0 0 auto; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; padding: 14px 24px 18px; border-block-start: 1px solid var(--sd-modern-border); }
}

@media (max-width: 420px) {
  .b-product-embed-dialog.v-card {
    .b-product-embed-dialog__header { padding: 16px 14px; gap: 8px; }
    .b-product-embed-dialog__identity { gap: 9px; }
    .b-product-embed-dialog__body { padding: 0 12px 16px; }
    .b-product-embed-dialog__preview-well { padding: 6px; }
    .b-product-embed-dialog__actions { padding: 12px 14px 14px; }
  }
}

@media (max-width: 600px), (pointer: coarse) {
  .b-product-embed-dialog.v-card {
    .b-product-embed-dialog__sizes > .v-btn, .b-product-embed-dialog__code > summary { min-height: 44px; }
  }
}

.b-product-info-refined {
  display: grid;
  gap: 20px;
  min-width: 0;

  &__widget.sd-modern-widget {
    padding: 22px;
    border-radius: 15px;
    font-size: 14px;
    line-height: 1.6;
  }

  &__header {
    align-items: flex-start;
    margin-block-end: 18px;
    gap: 12px;
  }

  .sd-modern-title {
    gap: 10px;
    flex: 1 1 220px;
  }

  .sd-modern-title-text {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }

  .sd-modern-subtitle {
    margin-block-start: 3px;
    font-size: 12px;
    line-height: 19px;
  }

  .sd-modern-icon--plain {
    width: 18px;
    height: 22px;
    flex-basis: 18px;
    :deep(.v-icon) { font-size: 16px; }
  }

  &__utilities {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 8px;
    flex-shrink: 0;
  }

  &__links, &__metadata, &__included, &__reselling, &__tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 16px;
    min-width: 0;
    font-size: 12px;
    line-height: 19px;
  }

  &__metadata, &__included { margin-block-start: 14px; }
  :deep(.b-product-info-refined__breadcrumb.s--breadcrumb-image) {
    flex: 0 1 auto;
    width: auto;
    max-width: 100%;
    min-width: 0;
  }
  :deep(.b-product-info-refined__breadcrumb > .v-breadcrumbs) {
    padding: 0;
    margin: 0;
    min-height: 36px;
    flex-wrap: wrap;
    font-size: 12px;
    line-height: 19px;
    white-space: normal;
  }
  :deep(.b-product-info-refined__breadcrumb .v-breadcrumbs-item) { padding: 0; }
  :deep(.b-product-info-refined__breadcrumb .v-breadcrumbs-divider) { padding-inline: 8px; }
  :deep(.b-product-info-refined__breadcrumb > div > .v-btn) {
    width: auto !important;
    min-width: 0;
    min-height: 44px;
    height: auto;
    justify-content: flex-start;
    padding: 7px 0;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    line-height: 19px;
    letter-spacing: 0;
    text-transform: none;
  }
  :deep(.b-product-info-refined__breadcrumb .v-btn__content) { font: inherit; letter-spacing: inherit; }
  :deep(.b-product-info-refined__breadcrumb .v-icon) { font-size: 16px; width: 16px; height: 16px; }
  &__identity { display: inline-flex; align-items: center; gap: 7px; }
  &__identity img { flex-shrink: 0; }
  &__reselling { margin-block-start: 18px; }
  &__group { margin-block-start: 22px; }
  &__group:first-of-type { padding-block-start: 18px; border-top: 1px solid var(--sd-modern-border); }
  &__group-head { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; margin-block-end: 12px; }
  &__group-head h3 { margin: 0; font-size: 14px; line-height: 22px; font-weight: 500; }
  &__note {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: start;
    font: inherit;
    font-size: 12px;
    line-height: 19px;
    width: 100%;
    cursor: pointer;
  }
  &__note > span { min-width: 0; }
  &__note-meta { display: flex; flex-wrap: wrap; gap: 4px 10px; color: var(--sd-modern-muted); }
  &__note-meta strong { color: rgb(var(--v-theme-on-surface)); font-weight: 500; }
  &__note-body { display: block; margin-block: 4px; overflow-wrap: anywhere; }
  &__tags { gap: 6px; }
  &__tags .sd-modern-tag { max-width: 100%; overflow-wrap: anywhere; }
  &__pricing { font-size: 12px; }
  &__pricing :deep(td) { overflow-wrap: anywhere; }
}

@media (max-width: 850px) {
  .b-product-info-refined__pricing {
    :deep(thead) { display: none; }
    :deep(tbody), :deep(tr) { display: block; }
    :deep(tr) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    :deep(td) { display: block; padding: 0; min-height: 0; border: 0; }
    :deep(td[data-label]::before) { content: attr(data-label); display: block; margin-block-end: 5px; }
  }
}

@media (max-width: 560px) {
  .b-product-info-refined {
    &__widget.sd-modern-widget { padding: 16px 12px; border-radius: 12px; }
    .sd-modern-title { flex-basis: 144px; }
    &__metadata { align-items: flex-start; }
  }
}
</style>
