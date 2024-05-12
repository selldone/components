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
  <div v-bind="$attrs">
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Marketplace Settings ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div v-if="is_marketplace" class="widget-box mb-5 mt-5">
      <s-widget-header
        :title="$t('global.commons.vendor')"
        icon="storefront"
      ></s-widget-header>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Vendor panel > Fixed mode ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

      <template v-if="vendor">
        <v-list-subheader>
          <div
            v-html="
              $t('add_product.edit_info.marketplace.vendor_panel_message', {
                vendor_name: vendor.name,
              })
            "
          ></div>
        </v-list-subheader>

        <v-list-item>
          <template v-slot:prepend>
            <v-avatar rounded>
              <img :src="getShopImagePath(vendor.icon, 64)" />
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-bold"
            >{{ vendor.name }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ vendor.description }}</v-list-item-subtitle>
        </v-list-item>
      </template>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Marketplace panel > Subscription products ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

      <template v-else-if="isSubscription">
        <v-list-subheader>
          <div>
            <img
              :src="ProductType.SUBSCRIPTION.image"
              class="me-1"
              height="20"
              width="20"
            />
            {{ $t("add_product.edit_info.marketplace.subscription_message") }}
          </div>
        </v-list-subheader>

        <b-vendor-input
          v-if="!in_edit_mode /*Only in creation mode!*/"
          v-model="product.vendor_id"
          :shop="shop"
          flat
          label="Vendor*"
          solo
          @change="$forceUpdate()"
        ></b-vendor-input>
        <v-list-item
          v-else-if="product.vendor"
          :append-avatar="getShopImagePath(product.vendor.icon, 64)"
          :subtitle="product.vendor.description"
          :title="product.vendor.name"
        >
        </v-list-item>
        <div v-else-if="product?.id" class="text-red pa-2">
          <b>Vendor has been deleted!</b>
        </div>
      </template>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Marketplace panel > Normal products ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <template v-else>
        <v-list-subheader>
          {{ $t("add_product.edit_info.marketplace.default_message") }}
        </v-list-subheader>

        <u-smart-switch
          v-model="single_vendor"
          :disabled="in_edit_mode /*Only in creation mode!*/"
          :false-description="
            $t('add_product.edit_info.marketplace.multi_vendors_desc')
          "
          :false-title="
            $t('add_product.edit_info.marketplace.multi_vendors_title')
          "
          :true-description="
            $t('add_product.edit_info.marketplace.single_vendor_desc')
          "
          :true-title="
            $t('add_product.edit_info.marketplace.single_vendor_title')
          "
          class="my-3"
          @change="product.vendor_id = null"
        ></u-smart-switch>

        <v-expand-transition>
          <div v-if="single_vendor">
            <b-vendor-input
              v-if="!in_edit_mode /*Only in creation mode!*/"
              v-model="product.vendor_id"
              :shop="shop"
              class="mt-5"
              flat
              label="Vendor"
              solo
              @change="$forceUpdate()"
            ></b-vendor-input>

            <!-- In edit mode we never reach this section! Because vendor will be null!-->
            <v-list-item
              v-else-if="product.vendor"
              :prepend-avatar="getShopImagePath(product.vendor.icon, 64)"
              :subtitle="product.vendor.description"
              :title="product.vendor.name"
            >
            </v-list-item>
            <div v-else-if="product?.id" class="text-red pa-2">
              <b>Vendor has been deleted!</b>
            </div>
          </div>
        </v-expand-transition>
      </template>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ General ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div class="widget-box mb-5 mt-5">
      <s-widget-header :title="$t('global.commons.general')" icon="tune">
        <template v-if="type_object" v-slot:actions>
          <div
            class="d-flex flex-column x-small text-muted align-center text-uppercase"
          >
            <img :src="type_object.image" class="mb-1" height="18" width="18" />
            {{ $t(type_object.name) }}
          </div>
        </template>
      </s-widget-header>
      <v-list-subheader
        >Configure the category and title to be displayed in your listing.
      </v-list-subheader>

      <b-category-input
        v-model="category_id"
        :height="48"
        :label="$t('add_product.edit_info.category_input')"
        :return-object="false"
        clearable
        messages="Empty: In the store's root"
        no-selected-icon="home"
        placeholder="Select a category..."
      >
        <template v-if="product?.id" v-slot:append-inner>
          <products-dense-images-circles
            v-if="product.shortcuts?.length"
            :ids="product.shortcuts.map((i) => 'c-' + i)"
            :size="32"
            class="pa-0 mx-1"
          ></products-dense-images-circles>
          <v-btn
            class="hover-scale-small"
            color="primary"
            icon
            size="32"
            title="Add to more categories..."
            variant="elevated"
            @click.stop="showShortcuts()"
          >
            <v-icon size="18">create_new_folder</v-icon>
          </v-btn>
        </template>
      </b-category-input>
      <v-text-field
        v-model="product.title"
        :counter="120"
        :label="$t('add_product.edit_info.product_name')"
        :rules="[GlobalRules.required(), GlobalRules.counter(120)]"
        placeholder="Your Product name here.."
        required
        variant="underlined"
      >
        <template v-slot:append-inner>
          <b-translation-button-product
            v-if="product?.id"
            :label="$t('add_product.edit_info.product_name')"
            :product="product"
            :shop="shop"
            translation-key="title"
          ></b-translation-button-product>
        </template>
      </v-text-field>

      <v-text-field
        v-model="product.title_en"
        :counter="120"
        :label="$t('add_product.edit_info.product_code')"
        :rules="[GlobalRules.counter(120)]"
        placeholder="Sub title about product or service.. (Optional)"
        required
        variant="underlined"
      >
        <template v-slot:append-inner>
          <b-translation-button-product
            v-if="product?.id"
            :label="$t('add_product.edit_info.product_code')"
            :product="product"
            :shop="shop"
            translation-key="title_en"
          ></b-translation-button-product>
        </template>
      </v-text-field>
    </div>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Pricing / Units ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div v-level.min="AppLevel.NOVICE" class="widget-box mb-5">
      <s-widget-header
        :title="$t('add_product.edit_info.unit_section')"
        icon="price_change"
      ></s-widget-header>
      <v-list-subheader
        >You can personalize the display of pricing and call-to-action elements
        on the product page.
      </v-list-subheader>

      <v-combobox
        v-model="product.unit"
        :counter="16"
        :hint="$t('add_product.edit_info.unit_message')"
        :items="unit_items"
        :label="$t('add_product.edit_info.unit')"
        :placeholder="
          $t('global.commons.default') +
          ' : ' +
          $t('buy_button.count_unit') +
          ` (${$t('global.commons.optional')})`
        "
        :rules="[GlobalRules.counter(16)]"
        persistent-hint
        persistent-placeholder
        variant="underlined"
      >
        <template v-slot:append-inner>
          <b-translation-button-product
            v-if="product?.id"
            :label="$t('add_product.edit_info.unit_message')"
            :product="product"
            :shop="shop"
            translation-key="unit"
          ></b-translation-button-product>
        </template>
      </v-combobox>

      <u-smart-select
        v-if="isPhysical || isService || isVirtual"
        v-model="product.price_input"
        :items="price_input_modes"
        class="my-5"
        item-description="desc"
        item-icon="icon"
        item-text="title"
        item-value="code"
        @change="$forceUpdate()"
      >
      </u-smart-select>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Custom Price Input ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
      <v-expand-transition>
        <div v-if="product.price_input === 'custom'" id="custom_valuation">
          <s-widget-header
            icon="calculate"
            title="Custom pricing form"
          ></s-widget-header>
          <v-list-subheader
            >You can create or assign a valuation (a pricing input form) to the
            product, and your customers can select between variants or customize
            your merchandise by an intuitive input form.
          </v-list-subheader>

          <b-valuation-input
            v-model="valuation"
            :loading="busy_valuation"
            :shop="shop"
            @update:model-value="
              (val) => {
                setProductValuation(val ? val.id : null);
              }
            "
          ></b-valuation-input>

          <div v-if="!in_edit_mode" class="py-3 text-red font-weight-bold">
            <v-icon class="me-1" color="red">warning_amber</v-icon>
            Please save the product first, and then you can assign a valuation
            model.
          </div>
          <div
            v-else-if="!product.valuation_id"
            class="py-3 text-red font-weight-bold"
          >
            <v-icon class="me-1" color="red">warning_amber</v-icon>
            Please assign a valuation model to this product.
          </div>

          <div class="widget-buttons">
            <v-btn
              v-if="product.valuation"
              color="primary"
              size="x-large"
              variant="text"
              @click="showValuationForm"
            >
              <v-icon class="me-1">edit_note</v-icon>
              Edit pricing form
            </v-btn>
            <v-btn
              v-else
              color="primary"
              size="x-large"
              variant="text"
              @click="showValuationForm"
            >
              <v-icon class="me-1">playlist_add</v-icon>
              Create new pricing form
            </v-btn>
          </div>

          <v-dialog
            v-model="show_valuation"
            fullscreen
            scrollable
            transition="dialog-bottom-transition"
          >
            <b-valuation-add
              v-if="pre_show_valuation"
              :product="product"
              :shop="shop"
              :valuation="product.valuation"
              has-file
              @add="
                (val) => {
                  setProductValuation(val ? val.id : null);
                  show_valuation = false;
                }
              "
              @close="closeValuation"
              @edit="
                (val) => {
                  product.valuation = val;
                  Object.assign(valuation, val);
                }
              "
            ></b-valuation-add>
          </v-dialog>
        </div>
      </v-expand-transition>

      <!--
      <v-switch
        disabled
        v-model="product.unit_float"
        inset
        :label="$t('add_product.edit_info.unit_float')"
        :hint="$t('add_product.edit_info.unit_float_hint')"
        color="blue"
        persistent-hint
      ></v-switch>
      <v-expand-transition>
        <div v-if="product.unit_float">
          <v-alert
            text
            color="blue"
            class="text-start body-1"
            rounded="lg"
            type="info"
            >{{ $t("add_product.edit_info.unit_float_message") }}</v-alert
          >
        </div>
      </v-expand-transition>
      -->

      <v-combobox
        v-model="product.action"
        :counter="120"
        :items="actions"
        :label="
          product.action
            ? 'Custom buy button'
            : `Default: ${default_buy_button}`
        "
        messages="You can change icon by following this pattern : {icon name} caption..."
        placeholder="Enter call to action..."
        variant="underlined"
        @blur="live_action = product.action"
      >
        <template v-slot:append-inner>
          <v-btn
            v-if="custom_action"
            class="text-capitalize"
            color="#000"
            size="small"
            title="Preview"
            variant="flat"
          >
            <v-icon v-if="custom_action.icon" class="me-1" size="small"
              >{{ custom_action.icon }}
            </v-icon>
            {{ custom_action.text }}
          </v-btn>

          <b-translation-button-product
            v-if="product?.id"
            :product="product"
            :shop="shop"
            label="Custom buy button caption"
            translation-key="action"
          ></b-translation-button-product>
        </template>
      </v-combobox>
    </div>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ SKU / MPN ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div v-level.min="AppLevel.NOVICE" class="widget-box mb-5">
      <s-widget-header
        :title="$t('add_product.edit_info.warehouse_section')"
        icon="warehouse"
      ></s-widget-header>
      <v-list-subheader
        >This information is utilized by the warehouse management system and
        serves to globally identify the product.
      </v-list-subheader>

      <v-text-field
        v-model="product.sku"
        v-level.min="AppLevel.NOVICE"
        :counter="48"
        :hint="$t('add_product.edit_info.sku_message')"
        :label="$t('add_product.edit_info.sku')"
        :messages="product.connect ? ' ' : undefined"
        :rules="[GlobalRules.counter(48)]"
        placeholder="XYZ-ABC-001"
        required
        variant="underlined"
      >
        <template v-if="product.connect" v-slot:message>
          <b-product-connect-locked
            :connect="product.connect"
            field="SKU"
          ></b-product-connect-locked>
        </template>
      </v-text-field>

      <v-text-field
        v-model="product.mpn"
        v-level.min="AppLevel.NOVICE"
        :counter="48"
        :disabled="
          !!product.connect_id /*Keep important product ID in the payment services like Stripe!*/
        "
        :hint="$t('add_product.edit_info.mpn_message')"
        :label="$t('add_product.edit_info.mpn')"
        :messages="product.connect ? ' ' : undefined"
        :rules="[GlobalRules.counter(48)]"
        placeholder="XYZ00001"
        required
        variant="underlined"
      >
        <template v-if="product.connect" v-slot:message>
          <b-product-connect-locked
            v-if="product.connect"
            :connect="product.connect"
            field="MPN"
          ></b-product-connect-locked>
        </template>

        <template v-slot:append-inner>
          <v-icon v-if="product.connect">hub</v-icon>
        </template>
      </v-text-field>

      <v-text-field
        v-model="product.gtin"
        v-level.min="AppLevel.NOVICE"
        :counter="48"
        :rules="[GlobalRules.counter(48)]"
        hint="Supported values are UPC (North America, 12 digits), EAN (Europe, 13 digits), JAN (Japan, 8 or 13 digits), ISBN (books, 13 digits)."
        label="Product's Global Trade Item Number"
        placeholder="Global trade number here.. (Optional)"
        required
        variant="underlined"
      />

      <v-text-field
        v-model="product.hsn"
        v-level.min="AppLevel.NOVICE"
        :counter="16"
        :rules="[GlobalRules.counter(16)]"
        hint="HSN, or Harmonized System of Nomenclature, is an internationally standardized classification system for categorizing goods and products."
        label="HSN"
        placeholder="6~16 digits HSN code.. (Optional)"
        required
        type="number"
        variant="underlined"
      />

      <b-product-google-category-input
        v-model="product.gpc"
        v-level.min="AppLevel.NOVICE"
        :product="product"
        :shop="shop"
      >
      </b-product-google-category-input>
      <v-alert
        v-if="google_category"
        :color="google_category.error ? 'red' : 'green'"
        border="start"
        class="small text-start"
        density="compact"
        text
      >
        <span v-if="google_category.error">
          {{ google_category.error_msg }}</span
        >
        <span v-else>
          <b class="me-2">{{ google_category.id }}</b>
          {{ google_category.category }}</span
        >
      </v-alert>

      <u-smart-switch
        v-model="product.original"
        :disabled="add_by_dropShipping"
        :false-title="$t('global.commons.fake')"
        :force-show-all="false"
        :hint="$t('add_product.edit_info.is_original_message')"
        :label="$t('add_product.edit_info.is_original')"
        :true-title="$t('global.commons.original')"
        false-gray
        false-icon="sentiment_very_dissatisfied"
        true-icon="verified"
      ></u-smart-switch>
    </div>

    <div v-level.min="AppLevel.NOVICE" class="widget-box mb-5">
      <s-widget-header
        :title="$t('add_product.edit_info.conditions_section')"
        icon="bookmark"
      ></s-widget-header>
      <v-list-subheader
        >Inform your customers about the condition and brand of the product
        you're offering.
      </v-list-subheader>

      <v-text-field
        v-model="product.blog"
        v-level.min="AppLevel.BEGINNER"
        :label="$t('add_product.edit_info.external_link')"
        class="english-field m-2"
        placeholder="https://domain.com/.."
        required
        variant="underlined"
      />

      <v-text-field
        v-model="product.brand"
        :disabled="add_by_dropShipping"
        :label="$t('add_product.edit_info.brand')"
        prepend-inner-icon="book"
        placeholder="Brand Ex. Apple.. (Optional)"
        required
        variant="underlined"
      >
        <template v-slot:append-inner>
          <b-translation-button-product
            v-if="product?.id"
            :label="$t('add_product.edit_info.brand')"
            :product="product"
            :shop="shop"
            translation-key="brand"
          ></b-translation-button-product>
        </template>
      </v-text-field>

      <!--
      <v-select
        v-if="isPhysical"
        :disabled="add_by_dropShipping"
        :items="conditions"
        v-model="product.condition"
        :return-object="false"
        :item-text="(val) => $t(val.title)"
        item-value="code"
        :label="$t('add_product.edit_info.condition')"
        required
        :hint="$t('add_product.edit_info.condition_message')"
        placeholder="Select a condition.."
        :rules="[GlobalRules.required()]"
      />-->
      <u-smart-select
        v-if="isPhysical"
        v-model="product.condition"
        :disabled="add_by_dropShipping"
        :hint="$t('add_product.edit_info.condition_message')"
        :items="conditions"
        :label="$t('add_product.edit_info.condition')"
        item-text="title"
        item-value="code"
      >
      </u-smart-select>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Warranty ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('add_product.edit_info.warranty_section')"
        icon="workspace_premium"
      ></s-widget-header>
      <v-list-subheader
        >Set the warranty and product status, as this information regarding
        warranty will be displayed to the customer and helps establish the time
        frame within which products can be returned after purchase.
      </v-list-subheader>

      <v-text-field
        v-model="product.warranty"
        :disabled="add_by_dropShipping"
        :label="$t('add_product.edit_info.warranty')"
        messages=" "
        placeholder="Golden 24 months warranty.. (Optional)"
        required
        variant="underlined"
        prepend-inner-icon="safety_check"
      >


        <template v-slot:message>
          <u-smart-suggestion
            :samples="$tm('suggestions.product.warranty')"
            class="mb-4"
            @select="
              (v) => {
                product.warranty = v;
                $forceUpdate();
              }
            "
          ></u-smart-suggestion>
        </template>

        <template v-slot:append-inner>
          <b-translation-button-product
            v-if="product?.id"
            :label="$t('add_product.edit_info.warranty')"
            :product="product"
            :shop="shop"
            translation-key="warranty"
          ></b-translation-button-product>
        </template>
      </v-text-field>

      <!-- Time -->

      <u-number-input
        v-model="product.return_warranty"
        :disabled="add_by_dropShipping"
        :hideDetails="false"
        :label="$t('add_product.edit_info.return_warranty')"
        :outlined="false"
      >
        <template v-slot:append-inner>
          <img
            class="ms-2"
            src="../../../../assets/product-badges/return_order-color.svg"
            width="32px"
          />
        </template>
      </u-number-input>

      <!-- Lead Time  Show lead-time for virtual (for physical show in extra edit form) -->

      <template v-if="isVirtual">
        <u-number-input
          v-model="product.lead"
          :disabled="add_by_dropShipping"
          :label="$t('product_extra_physical.lead_time')"
          :messages="$t('product_extra_physical.lead_time_title')"
          :min="-1"
          :step="1"
          :suffix="$t('product_extra_physical.lead_time_dimension')"
          append-icon="fa:fas fa-clock"
        />
      </template>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Status ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('add_product.edit_info.status')"
        icon="nat"
      ></s-widget-header>
      <v-list-subheader
        >The product's status determines its availability online and in-store.
        To make a product draft, just switch its status to 'Inactive'..
      </v-list-subheader>

      <u-smart-select
        v-model="product.status"
        :color="ProductStatus[product.status]?.color"
        :disabled="
          add_by_dropShipping ||
          (IS_VENDOR_PANEL && marketplace_has_verification_step)
        "
        :items="status_list"
        force-show-all
        gray-unselected
        item-description="description"
        item-icon="icon"
        item-text="title"
        item-value="code"
      >
      </u-smart-select>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Logistic Profiles ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div class="widget-box mb-5">
      <s-widget-header icon="assignment" title="Profiles"></s-widget-header>
      <v-list-subheader
        >You can define warranty, return policy, shipping, and guide and assign
        them to this product. It will be shown as new tabs on the product page.
      </v-list-subheader>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Assign Profiles ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <b-product-profile-logistic
        :product="product"
        :shop="shop"
        :vendor="vendor"
      >
      </b-product-profile-logistic>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Assign Tax Profile ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

      <b-product-profile-tax :product="product" :shop="shop" :vendor="vendor">
      </b-product-profile-tax>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Assign Map Profile ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <b-product-profile-map
        :product="product"
        :shop="shop"
        :vendor="vendor"
      ></b-product-profile-map>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Assign Package Profile ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

      <b-product-profile-include
        :product="product"
        :shop="shop"
        :vendor="vendor"
      >
      </b-product-profile-include>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Actions ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <s-widget-buttons auto-fixed-position class="my-5">
      <v-btn
        :loading="busy"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="$emit('next')"
      >
        {{ $t("global.actions.save_continue") }}

        <v-icon end>
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </s-widget-buttons>
  </div>

  <!-- ██████████████████████ Dialog > Add to more categories ██████████████████████ -->

  <v-dialog
    v-model="shortcut_dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">folder</v-icon>
        Assign Product to Additional Categories
      </v-card-title>

      <v-card-text v-if="shortcuts">
        <div class="widget-box mb-5">
          <s-widget-header
            icon="snippet_folder"
            title="Shortcuts"
          ></s-widget-header>
          <v-list-subheader>
            This feature allows you to list the product in multiple categories
            while retaining its placement in the primary category set under
            Product > Edit > Category. Essentially, it functions similarly to
            creating 'shortcuts' in operating systems, enabling the product to
            appear in additional specified categories.
          </v-list-subheader>

          <div class="border-between-vertical">
            <b-category-input
              v-for="index in 5"
              :key="index"
              v-model="shortcuts[index - 1]"
              :height="48"
              :label="$t('add_product.edit_info.category_input')"
              :return-object="false"
              class="pb-3"
              clearable
              default-icon="folder_open"
              no-home
              placeholder="Select a category..."
              single-line
              variant="plain"
            >
            </b-category-input>
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="shortcut_dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :loading="busy_set_shortcuts"
            color="primary"
            size="x-large"
            variant="flat"
            @click="setShortcuts()"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import BCategoryInput from "../../../category/input/BCategoryInput.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { ProductCondition } from "@selldone/core-js/enums/product/ProductCondition";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import BProductConnectLocked from "../../../product/connect/locked/BProductConnectLocked.vue";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import BValuationAdd from "../../../valuation/add/BValuationAdd.vue";
import BValuationInput from "../../../valuation/input/BValuationInput.vue";
import BVendorInput from "../../../vendor/input/BVendorInput.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import BProductGoogleCategoryInput from "../../../product/google/category/input/BProductGoogleCategoryInput.vue";
import { BuyButtonHelper } from "@selldone/core-js/helper/shop/BuyButtonHelper";
import BProductProfileInclude from "../../../product/profile/include/BProductProfileInclude.vue";
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";
import BTranslationButtonProduct from "../../../translation/button/product/BTranslationButtonProduct.vue";
import ProductsDenseImagesCircles from "../../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper";
import { AppLevel } from "@selldone/core-js/enums/application/AppLevel";
import BProductProfileMap from "../../../product/profile/map/BProductProfileMap.vue";
import BProductProfileTax from "../../../product/profile/tax/BProductProfileTax.vue";
import BProductProfileLogistic from "../../../product/profile/logistic/BProductProfileLogistic.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BProductEditInfo",
  components: {
    SWidgetButtons,
    BProductProfileLogistic,
    BProductProfileTax,
    BProductProfileMap,
    ProductsDenseImagesCircles,
    BTranslationButtonProduct,
    USmartSuggestion,
    BProductProfileInclude,
    BProductGoogleCategoryInput,
    BVendorInput,

    BValuationInput,
    BValuationAdd,
    USmartSwitch,
    BProductConnectLocked,
    USmartSelect,
    BCategoryInput,
    UNumberInput,
  },
  emits: ["next"],
  props: {
    product: {
      required: true,
      type: Object,
    },
    shop: {
      required: true,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },

    busy: {},
  },

  data: function () {
    return {
      category_id: null,

      conditions: Object.values(ProductCondition),

      google_category: null,

      //-----------------------------

      show_valuation: false,
      pre_show_valuation: false,
      busy_valuation: false,
      valuation: null,

      //-----------------------------
      single_vendor: false,

      live_action: null,

      //-----------------------------
      shortcut_dialog: false,
      busy_set_shortcuts: false,
      shortcuts: [],
    };
  },
  computed: {
    AppLevel() {
      return AppLevel;
    },
    ProductStatus() {
      return ProductStatus;
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    in_edit_mode() {
      return !!this.product?.id;
    },
    price_input_modes() {
      return [
        {
          code: "default",
          title:
            this.$t("price_input_type.title") +
            " : " +
            this.$t("price_input_type.default.title"),
          desc: this.$t("price_input_type.default.desc"),
          icon: "pin",
        },
        ...(this.isPhysical
          ? [
              {
                code: "area",
                title:
                  this.$t("price_input_type.title") +
                  " : " +
                  this.$t("price_input_type.area.title"),
                desc: this.$t("price_input_type.area.desc"),
                icon: "aspect_ratio",
              },
              {
                code: "volume",
                title:
                  this.$t("price_input_type.title") +
                  " : " +
                  this.$t("price_input_type.volume.title"),
                desc: this.$t("price_input_type.volume.desc"),
                icon: "view_in_ar",
              },
            ]
          : []),

        {
          code: "custom",
          title:
            this.$t("price_input_type.title") +
            " : " +
            this.$t("price_input_type.custom.title"),
          desc: this.$t("price_input_type.custom.desc"),
          icon: "calculate",
        },
      ];
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },

    product_image() {
      return this.getShopImagePath(this.product.icon);
    },
    type_object() {
      return ProductType[this.product.type];
    },

    isPhysical() {
      return this.product.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.product.type === ProductType.VIRTUAL.code;
    },
    isService() {
      return this.product.type === ProductType.SERVICE.code;
    },
    isSubscription() {
      return this.product.type === ProductType.SUBSCRIPTION.code;
    },
    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    unit_items() {
      return this.$tm("global.units");
    },

    status_list() {
      return [
        ProductStatus.Open,
        ProductStatus.Close,
        ...(this.marketplace_has_verification_step
          ? [ProductStatus.Pending, ProductStatus.Rejected]
          : []),
      ];
    },

    //-------------------------- 🎗️ Subscription --------------------------

    //-------------------------- Custom call to action --------------------------

    actions() {
      return [
        this.$t("buy_button.add_to_basket"),
        this.$t("buy_button.book_now"),
        this.$t("buy_button.reserve_now"),
        this.$t("buy_button.buy_now"),

        "{local_mall}" + this.$t("buy_button.add_to_basket"),
        "{fa:fas fa-handshake}" + this.$t("buy_button.reserve_now"),
      ];
    },
    default_buy_button() {
      return this.type === ProductType.FILE.code
        ? this.$t("global.actions.download_now")
        : this.$t("buy_button.add_to_basket");
    },
    custom_action() {
      return BuyButtonHelper.ExtractIconCaption(this.live_action);
    },

    //-------------------------- Marketplace --------------------------
    marketplace_has_verification_step() {
      return this.shop.marketplace?.need_verify;
    },
  },

  watch: {
    /*   lead(value) {
              this.product.lead = value;
            },*/

    category_id(value) {
      this.product.category_id = value;
    },
  },

  created() {
    // Set category id from current route state if be new product!
    this.category_id = this.product.id
      ? this.product.category_id
      : this.$route.query.dir;

    if (!this.product.price_input) this.product.price_input = "default";

    this.valuation = this.product.valuation;

    this.single_vendor = !!this.product.vendor_id;

    this.live_action = this.product.action;

    if (
      !this.in_edit_mode /*New product*/ &&
      this.IS_VENDOR_PANEL &&
      this.marketplace_has_verification_step
    ) {
      // Force select pending for new product added by vendor.
      this.product.status = ProductStatus.Pending.code;
    }
  },

  methods: {
    // ████████████████████ Set Valuation ████████████████████

    setProductValuation(valuation_id) {
      this.busy_valuation = true;
      axios
        .post(
          window.API.POST_SET_PRODUCT_VALUATION(this.shop.id, this.product.id),
          {
            valuation_id: valuation_id,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            // Set
            if (data.valuation) {
              this.product.valuation_id = data.valuation.id;
              this.product.valuation = data.valuation;
            } else {
              // Clear
              this.product.valuation_id = null;
              this.product.valuation = null;
            }

            this.showSuccessAlert(
              "Valuation",
              "Custom valuation form added to the product.",
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_valuation = false;
        });
    },

    closeValuation() {
      this.show_valuation = false;
      ScrollHelper.scrollToElement("#custom_valuation", 1000, "smooth");
    },

    showValuationForm() {
      this.pre_show_valuation = false;
      this.$nextTick(() => {
        this.pre_show_valuation = true;
        this.show_valuation = true;
      });
    },

    // ████████████████████ Shortcuts (more categories) ████████████████████

    showShortcuts() {
      this.shortcuts = this.product.shortcuts;
      if (!this.shortcuts || !Array.isArray(this.shortcuts))
        this.shortcuts = [];

      this.shortcut_dialog = true;
    },
    setShortcuts() {
      this.busy_set_shortcuts = true;
      axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POST_MY_VENDOR_PRODUCT_SET_SHORTCUT_CATEGORIES(
                this.vendor.id,
                this.product.id,
              )
            : window.API.POST_PRODUCT_SET_SHORTCUT_CATEGORIES(
                this.shop.id,
                this.product.id,
              ),
          {
            shortcuts: this.shortcuts,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.product.shortcuts = data.shortcuts;
            this.shortcut_dialog = false;
            this.showSuccessAlert(
              "Shortcuts Updated",
              "The product has been successfully linked as a shortcut to the selected categories.",
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set_shortcuts = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.label-s-number-input {
  color: #2f3133;
  font-weight: 400;
  vertical-align: baseline;
  text-align: start;
  margin: 0 16px;
}
</style>
