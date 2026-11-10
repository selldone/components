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
  <v-card
    class="font-weight-regular text-start b-product-variant-form"
    :class="{
      'sd-modern-canvas b-product-variant-editor': modern,
    }"
    :theme="modern ? (USER()?.preferences?.dark ? 'dark' : 'light') : undefined"
  >
    <header v-if="modern" class="b-product-variant-editor__header">
      <u-avatar-folder
        :src="getShopImagePath(productVariant?.image || product.icon, 128)"
        :size="40"
        :border-size="4"
        side-icon="view_in_ar"
      />
      <div class="b-product-variant-editor__heading">
        <h2>
          {{
            $t(
              productVariant
                ? "b_product_inventory.editor.edit_title"
                : "b_product_inventory.editor.add_title",
            )
          }}
        </h2>
        <p>
          <span>{{ product.title }}</span
          ><b v-if="productVariant" dir="ltr">SPV{{ code }}</b>
        </p>
      </div>
      <v-btn
        icon
        variant="text"
        class="sd-modern-icon-button"
        :aria-label="$t('global.actions.close')"
        :disabled="editorBusy"
        @click="closeEditor"
      >
        <v-icon>close</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          >{{ $t("global.actions.close") }}</v-tooltip
        >
      </v-btn>
    </header>
    <v-card-title v-else class="d-flex align-center">
      <u-avatar-folder
        v-if="productVariant?.image || product.icon"
        class="me-2"
        size="64"
        :src="
          getShopImagePath(
            productVariant?.image ? productVariant.image : product.icon,
            128,
          )
        "
        is-gray
        elevated
      >
      </u-avatar-folder>

      <div class="flex-grow-1">
        <div>
          <div>
            {{
              productVariant
                ? $t("product_admin.inventory.variants.edit_title")
                : $t("product_admin.inventory.variants.add_title")
            }}
          </div>

          <small class="d-block">
            {{ $t("product_admin.inventory.variant_add_edit.message") }}
            :
            <b>SPV{{ code ? code : "-" }}</b>
          </small>
        </div>
      </div>
    </v-card-title>

    <div :class="{ 'b-product-variant-editor__workspace': modern }">
      <aside v-if="modern" class="b-product-variant-editor__rail">
        <nav
          class="sd-modern-section-nav b-product-variant-editor__navigation"
          :aria-label="
            $t(
              productVariant
                ? 'b_product_inventory.editor.edit_title'
                : 'b_product_inventory.editor.add_title',
            )
          "
        >
          <v-btn
            v-for="section in editorSections"
            :key="section.value"
            variant="text"
            class="sd-modern-section-nav__item"
            :aria-current="
              editor_tab === section.value ? 'location' : undefined
            "
            :aria-label="
              section.value === 'pricing' && pricingOverridden
                ? $t(section.label) +
                  ' · ' +
                  $t('b_product_inventory.editor.pricing_override')
                : section.value === 'shipping' && shippingOverridden
                  ? $t(section.label) +
                    ' · ' +
                    $t('b_product_inventory.editor.shipping_override')
                  : undefined
            "
            aria-controls="b-product-variant-editor-panel"
            @click="editor_tab = section.value"
          >
            <v-icon aria-hidden="true">{{ section.icon }}</v-icon
            ><span class="b-product-variant-editor__nav-label">{{
              $t(section.label)
            }}</span>
            <span
              v-if="section.value === 'images' && sidebarPictures.length"
              class="b-product-variant-editor__pictures"
              :data-count="sidebarPictures.length"
              aria-hidden="true"
            >
              <img
                v-for="path in sidebarPictures"
                :key="path"
                :src="getShopImagePath(path, 64)"
                class="hover-scale"
                alt=""
                width="24"
                height="24"
                :draggable="false"
              />
            </span>
            <template
              v-if="
                (section.value === 'pricing' && pricingOverridden) ||
                (section.value === 'shipping' && shippingOverridden)
              "
            >
              <v-icon
                class="b-product-variant-editor__override"
                color="primary"
                size="16"
                aria-hidden="true"
                >edit_note</v-icon
              >
              <v-tooltip
                activator="parent"
                location="top"
                :open-on-focus="true"
                :open-on-click="true"
                content-class="sd-modern-tooltip text-start"
              >
                <div class="b-product-variant-editor__comparison-title">
                  {{
                    $t(
                      section.value === "pricing"
                        ? "b_product_inventory.editor.pricing_override"
                        : "b_product_inventory.editor.shipping_override",
                    )
                  }}
                </div>
                <table class="b-product-variant-editor__comparison">
                  <thead>
                    <tr>
                      <th></th>
                      <th>
                        {{
                          $t("b_product_inventory.editor.comparison_product")
                        }}
                      </th>
                      <th>
                        {{
                          $t("b_product_inventory.editor.comparison_variant")
                        }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in section.value === 'pricing'
                        ? pricingComparison
                        : shippingComparison"
                      :key="row.key"
                    >
                      <th scope="row">{{ $t(row.label) }}</th>
                      <td>
                        <u-price
                          v-if="row.type === 'money' && row.product !== null"
                          :amount="row.product"
                          :currency="product.currency"
                        /><span v-else>{{
                          comparisonValue(row, row.product)
                        }}</span>
                      </td>
                      <td>
                        <u-price
                          v-if="row.type === 'money' && row.variant !== null"
                          :amount="row.variant"
                          :currency="price_object.currency"
                        /><span v-else>{{
                          comparisonValue(row, row.variant)
                        }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </v-tooltip>
            </template>
          </v-btn>
        </nav>
        <u-smart-toggle
          v-model="enable"
          class="b-product-variant-editor__availability"
          :true-title="$t('global.commons.active')"
          :false-title="$t('global.commons.inactive')"
          :true-description="
            $t('b_product_inventory.editor.active_description')
          "
          :false-description="
            $t('b_product_inventory.editor.inactive_description')
          "
          :disabled="!!loading"
          color="success"
          accessible
          border
          false-gray
        />
      </aside>
      <v-card-text :class="{ 'b-product-variant-editor__body': modern }">
        <div
          :class="{ 'b-product-variant-editor__content': modern }"
          :id="modern ? 'b-product-variant-editor-panel' : undefined"
        >
          <header v-if="modern" class="b-product-variant-editor__page-heading">
            <h2>{{ $t(activeEditorSection.heading) }}</h2>
            <p>{{ $t(activeEditorSection.description) }}</p>
          </header>
          <div
            v-if="modern && !enable"
            class="sd-modern-notice b-product-variant-editor__inactive"
            role="status"
          >
            <v-icon size="18">pause_circle_outline</v-icon
            ><span class="sd-modern-notice__content">{{
              $t("b_product_inventory.editor.inactive_help")
            }}</span>
          </div>
          <!-- Keep native editors mounted so changing tabs retains unsaved values. -->
          <section
            v-show="!modern || editor_tab === 'details'"
            :class="{ 'b-product-variant-editor__details': modern }"
          >
            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅  Defining Product Variant ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
            <template
              v-for="group in modern
                ? ['options', 'identity']
                : ['identity', 'options']"
              :key="group"
            >
              <div
                v-if="group === 'identity'"
                :class="
                  modern
                    ? 'b-product-variant-editor__section b-product-variant-editor__identity'
                    : 'widget-box mb-5'
                "
              >
                <header
                  v-if="modern"
                  class="b-product-variant-editor__group-header"
                >
                  <div>
                    <v-icon size="18">tag</v-icon>
                    <h3>
                      {{ $t("b_product_inventory.editor.identifiers_title") }}
                    </h3>
                    <v-btn
                      icon
                      variant="text"
                      class="sd-modern-info-button"
                      :aria-label="
                        $t('b_product_inventory.editor.identifiers_help')
                      "
                      ><v-icon size="16">info_outline</v-icon
                      ><v-tooltip
                        activator="parent"
                        location="top"
                        open-on-click
                        content-class="sd-modern-tooltip text-start"
                        >{{
                          $t("b_product_inventory.editor.identifiers_help")
                        }}</v-tooltip
                      ></v-btn
                    ><span class="b-product-variant-editor__optional">{{
                      $t("b_product_inventory.editor.optional")
                    }}</span>
                  </div>
                </header>
                <u-widget-header
                  v-else
                  :class="{ 'sd-modern-form-header': modern }"
                  :title="
                    $t('product_admin.inventory.variant_add_edit.config.title')
                  "
                  icon="tune"
                >
                </u-widget-header>

                <v-list-subheader v-if="!modern">
                  {{
                    $t(
                      "product_admin.inventory.variant_add_edit.config.subtitle",
                    )
                  }}
                </v-list-subheader>

                <u-smart-toggle
                  v-if="!modern"
                  v-model="enable"
                  :false-title="$t('global.commons.inactive')"
                  :true-description="
                    $t('product_admin.inventory.variant_add_edit.active_input')
                  "
                  :true-title="$t('global.commons.active')"
                  color="success"
                  false-gray
                ></u-smart-toggle>

                <div
                  :class="{ 'b-product-variant-editor__identifiers': modern }"
                >
                  <v-text-field
                    v-model="sku"
                    :counter="modern ? undefined : 48"
                    :label="$t('product_admin.inventory.variant_add_edit.sku')"
                    class="input-variant"
                    :dir="modern ? 'ltr' : undefined"
                    :class="{ 'sd-modern-underlined-field': modern }"
                    :messages="
                      modern
                        ? undefined
                        : $t(
                            'product_admin.inventory.variant_add_edit.inputs.sku.message',
                          )
                    "
                    :required="!modern"
                    variant="underlined"
                  >
                    <template v-if="!modern" v-slot:append-inner>
                      <u-tooltip-tips
                        :message="
                          $t(
                            'product_admin.inventory.variant_add_edit.sku_tips',
                          )
                        "
                      ></u-tooltip-tips>
                    </template>
                  </v-text-field>

                  <v-text-field
                    v-model="mpn"
                    :counter="modern ? undefined : 48"
                    :disabled="!!product.connect_id"
                    :label="$t('product_admin.inventory.variant_add_edit.mpn')"
                    class="input-variant"
                    :dir="modern ? 'ltr' : undefined"
                    :class="{ 'sd-modern-underlined-field': modern }"
                    :messages="
                      modern
                        ? undefined
                        : $t(
                            'product_admin.inventory.variant_add_edit.inputs.mpn.message',
                          )
                    "
                    :required="!modern"
                    variant="underlined"
                  >
                    <template v-if="product.connect" v-slot:message>
                      <b-product-connect-locked
                        :connect="product.connect"
                        field="MPN"
                      ></b-product-connect-locked>
                    </template>

                    <template v-if="!modern" v-slot:append-inner>
                      <u-tooltip-tips
                        :message="
                          $t(
                            'product_admin.inventory.variant_add_edit.mpn_tips',
                          )
                        "
                      ></u-tooltip-tips>
                    </template>
                  </v-text-field>

                  <v-text-field
                    v-model="gtin"
                    :counter="modern ? undefined : 48"
                    class="input-variant"
                    :dir="modern ? 'ltr' : undefined"
                    :class="{ 'sd-modern-underlined-field': modern }"
                    :label="
                      modern
                        ? 'GTIN'
                        : $t(
                            'product_admin.inventory.variant_add_edit.inputs.gtin.label',
                          )
                    "
                    :messages="
                      modern
                        ? undefined
                        : $t(
                            'product_admin.inventory.variant_add_edit.inputs.gtin.message',
                          )
                    "
                    :required="!modern"
                    variant="underlined"
                  />
                </div>
              </div>

              <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅   Variant variables  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

              <fieldset
                v-if="group === 'options'"
                :disabled="modern && (!enable || !!loading)"
                :class="[
                  { disabled: !enable },
                  modern
                    ? 'b-product-variant-editor__section b-product-variant-editor__options'
                    : 'widget-box mb-5',
                ]"
              >
                <header
                  v-if="modern"
                  class="b-product-variant-editor__group-header"
                >
                  <div>
                    <v-icon size="18">view_in_ar</v-icon>
                    <h3>{{ $t("b_product_inventory.options_title") }}</h3>
                    <v-btn
                      icon
                      variant="text"
                      class="sd-modern-info-button"
                      :aria-label="
                        $t('b_product_inventory.editor.options_help')
                      "
                      ><v-icon size="16">info_outline</v-icon
                      ><v-tooltip
                        activator="parent"
                        location="top"
                        open-on-click
                        content-class="sd-modern-tooltip text-start"
                        >{{
                          $t("b_product_inventory.editor.options_help")
                        }}</v-tooltip
                      ></v-btn
                    >
                  </div>
                  <v-btn
                    variant="text"
                    color="primary"
                    class="sd-modern-button sd-modern-button--inline"
                    :disabled="!enable || !!loading"
                    @click="show_graphical_asset_dialog = true"
                    ><v-icon start size="16">collections</v-icon
                    >{{
                      $t("b_product_inventory.editor.graphic_assets")
                    }}</v-btn
                  >
                </header>
                <u-widget-header
                  v-else
                  :class="{ 'sd-modern-form-header': modern }"
                  :title="
                    $t(
                      'product_admin.inventory.variant_add_edit.variables.title',
                    )
                  "
                  :add-caption="
                    $t(
                      'product_admin.inventory.variant_add_edit.variables.graphical_asset_action',
                    )
                  "
                  add-icon="wallpaper"
                  :add-sub-caption="
                    $t(
                      'product_admin.inventory.variant_add_edit.variables.graphical_asset_action_caption',
                    )
                  "
                  add-text
                  icon="join_full"
                  @click:add="show_graphical_asset_dialog = true"
                >
                </u-widget-header>
                <div
                  :class="{ 'b-product-variant-editor__option-fields': modern }"
                >
                  <!-- ━━━━━━━━━━━━━━ Value > color ━━━━━━━━━━━━━━ -->

                  <template v-if="hasColor">
                    <v-list-subheader v-if="!modern">
                      <div
                        v-html="
                          $t(
                            'product_admin.inventory.variant_add_edit.variables.subtitle',
                          )
                        "
                      ></div>
                    </v-list-subheader>

                    <b-product-variant-value-input
                      variantCode="color"
                      v-model="color"
                      :modern="modern"
                      :disabled="
                        add_by_dropShipping ||
                        (modern && (!enable || !!loading))
                      "
                      class="input-variant"
                      :class="{ 'sd-modern-underlined-field': modern }"
                    ></b-product-variant-value-input>
                  </template>

                  <!-- ============= Variant Info Form ============= -->

                  <v-list-subheader
                    v-if="
                      !modern &&
                      (hasStyle || hasVolume || hasWeight || hasPack || hasType)
                    "
                  >
                    <div
                      v-html="
                        $t(
                          'product_admin.inventory.variant_add_edit.variables.graphical_asset_tips',
                        )
                      "
                    ></div>
                  </v-list-subheader>

                  <!-- ━━━━━━━━━━━━━━ Value > style ━━━━━━━━━━━━━━ -->

                  <b-product-variant-value-input
                    v-if="hasStyle"
                    variantCode="style"
                    v-model="style"
                    :modern="modern"
                    :disabled="
                      add_by_dropShipping || (modern && (!enable || !!loading))
                    "
                    class="input-variant"
                    :class="{ 'sd-modern-underlined-field': modern }"
                  ></b-product-variant-value-input>

                  <!-- ━━━━━━━━━━━━━━ Value > volume ━━━━━━━━━━━━━━ -->

                  <b-product-variant-value-input
                    v-if="hasVolume"
                    variantCode="volume"
                    v-model="volume"
                    :modern="modern"
                    :disabled="
                      add_by_dropShipping || (modern && (!enable || !!loading))
                    "
                    class="input-variant"
                    :class="{ 'sd-modern-underlined-field': modern }"
                  ></b-product-variant-value-input>

                  <!-- ━━━━━━━━━━━━━━ Value > weight ━━━━━━━━━━━━━━ -->

                  <b-product-variant-value-input
                    v-if="hasWeight"
                    variantCode="weight"
                    v-model="weight"
                    :modern="modern"
                    :disabled="
                      add_by_dropShipping || (modern && (!enable || !!loading))
                    "
                    class="input-variant"
                    :class="{ 'sd-modern-underlined-field': modern }"
                  ></b-product-variant-value-input>

                  <!-- ━━━━━━━━━━━━━━ Value > pack ━━━━━━━━━━━━━━ -->

                  <b-product-variant-value-input
                    v-if="hasPack"
                    variantCode="pack"
                    v-model="pack"
                    :modern="modern"
                    :disabled="
                      add_by_dropShipping || (modern && (!enable || !!loading))
                    "
                    class="input-variant"
                    :class="{ 'sd-modern-underlined-field': modern }"
                  ></b-product-variant-value-input>

                  <!-- ━━━━━━━━━━━━━━ Value > type ━━━━━━━━━━━━━━ -->

                  <b-product-variant-value-input
                    v-if="hasType"
                    variantCode="type"
                    v-model="type"
                    :modern="modern"
                    :disabled="
                      add_by_dropShipping || (modern && (!enable || !!loading))
                    "
                    class="input-variant"
                    :class="{ 'sd-modern-underlined-field': modern }"
                  ></b-product-variant-value-input>

                  <v-row
                    v-if="
                      smart_price_enable && (hasVolume || hasWeight || hasPack)
                    "
                    align="center"
                    class="small text-muted py-2"
                    :class="{ 'b-product-variant-editor__unit-price': modern }"
                    no-gutters
                  >
                    <span
                      v-if="modern"
                      class="b-product-variant-editor__unit-label"
                      >{{
                        $t("b_product_inventory.editor.unit_price_preview")
                      }}</span
                    >
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      :class="{ 'sd-modern-info-button': modern }"
                      :aria-label="
                        $t('b_product_inventory.editor.unit_price_help')
                      "
                    >
                      <v-icon>info</v-icon>

                      <v-tooltip
                        activator="parent"
                        :content-class="
                          modern
                            ? 'sd-modern-tooltip text-start'
                            : 'text-start bg-black'
                        "
                        :location="modern ? 'top' : 'bottom'"
                        :max-width="modern ? undefined : 360"
                        :open-on-click="modern"
                      >
                        <span
                          v-html="
                            $t(
                              'product_admin.inventory.variant_add_edit.smart_unit_price.tips',
                            )
                          "
                        >
                        </span>
                      </v-tooltip>
                    </v-btn>
                    <v-spacer v-if="!modern"></v-spacer>
                    <template v-if="!modern"
                      >{{
                        $t(
                          "product_admin.inventory.variant_add_edit.smart_unit_price.smart_unit_price",
                        )
                      }}
                      :</template
                    >
                    <span
                      class="min-width-100 ms-2 b-product-variant-editor__unit-value"
                    >
                      <template v-if="!modern">(</template
                      ><s-product-price
                        v-if="!modern || unitPriceAvailable"
                        :product="product"
                        :variant="{
                          pricing: pricing,
                          price: price_object.price,
                          commission: price_object.commission,
                          discount: price_object.discount,
                          currency: price_object.currency,
                          weight: weight,
                          volume: volume,
                          pack: pack,
                        }"
                      ></s-product-price
                      ><span v-if="modern && !unitPriceAvailable">—</span
                      ><template v-if="!modern">)</template></span
                    >
                  </v-row>
                </div>
              </fieldset>
            </template>
          </section>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Inventory ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <fieldset
            :disabled="modern && (!enable || !!loading)"
            v-if="isPhysical"
            v-show="!modern || editor_tab === 'stock'"
            :class="[
              { disabled: !enable },
              modern
                ? 'b-product-variant-editor__section b-product-variant-editor__stock'
                : 'widget-box mb-5',
            ]"
          >
            <header
              v-if="modern"
              class="b-product-variant-editor__group-header"
            >
              <div>
                <v-icon size="18">inventory_2</v-icon>
                <h3>{{ $t("b_product_inventory.editor.stock_title") }}</h3>
              </div>
            </header>
            <u-widget-header
              v-else
              :class="{ 'sd-modern-form-header': modern }"
              :title="
                $t('product_admin.inventory.variant_add_edit.quantity.title')
              "
              icon="inventory_2"
            >
            </u-widget-header>

            <v-list-subheader v-if="!modern"
              >{{
                $t("product_admin.inventory.variant_add_edit.quantity.subtitle")
              }}
            </v-list-subheader>

            <div :class="{ 'b-product-variant-editor__stock-fields': modern }">
              <div>
                <v-text-field
                  v-model="quantity"
                  :disabled="
                    add_by_dropShipping ||
                    is_marketplace ||
                    (modern && (!enable || !!loading))
                  "
                  :label="
                    $t(
                      modern
                        ? 'b_product_inventory.editor.stock_quantity'
                        : 'product_admin.inventory.variant_add_edit.inventory',
                    )
                  "
                  :suffix="
                    $t('product_admin.inventory.variant_add_edit.inventory_unit')
                  "
                  class="mt-5 mx-auto input-variant sm-suffix strong-field"
                  :class="{ 'sd-modern-underlined-field': modern }"
                  color="#0288D1"
                  variant="underlined"
                >
                </v-text-field>
                <p v-if="modern" class="b-product-variant-editor__hint">
                  {{ $t("b_product_inventory.editor.stock_help") }}
                </p>
              </div>
              <figure v-if="modern" class="b-product-variant-editor__stock-preview">
                <template v-if="stockPreview">
                  <figcaption>
                    <span>{{ $t('b_product_inventory.editor.stock_total') }}</span>
                    <span :aria-label="$t('b_product_inventory.editor.stock_totals_help', { before: formatStock(stockPreview.before), after: formatStock(stockPreview.after) })">
                      {{ formatStock(stockPreview.before) }}
                      <template v-if="stockPreview.change">
                        <v-icon size="14" aria-hidden="true">arrow_forward</v-icon>
                        <strong>{{ formatStock(stockPreview.after) }}</strong>
                      </template>
                    </span>
                  </figcaption>
                  <u-chart-donut-leader
                    :slices="stockSlices"
                    :unit="$t(stockPreview.change > 0 ? 'b_product_inventory.editor.stock_after_save' : 'b_product_inventory.editor.stock_current_total')"
                    :format="formatStock"
                    :labels="3"
                    :min-label-share="0"
                    :aria-label="$t('b_product_inventory.editor.stock_totals_help', { before: formatStock(stockPreview.before), after: formatStock(stockPreview.after) })"
                  />
                  <dl class="b-product-variant-editor__stock-breakdown">
                    <div v-for="slice in stockSlices" :key="slice.key">
                      <dt><i :style="{ background: slice.color }" aria-hidden="true"></i>{{ slice.label }}</dt>
                      <dd>{{ slice.key === 'change' ? (stockPreview.change > 0 ? '+' : '−') : '' }}{{ formatStock(slice.value) }}</dd>
                    </div>
                  </dl>
                </template>
                <p v-else class="b-product-variant-editor__hint">{{ $t('b_product_inventory.editor.stock_preview_unavailable') }}</p>
              </figure>
            </div>

            <!-- ▀▀▀▀▀▀▀▀▀ 🟣 Marketplace 🟣 ▀▀▀▀▀▀▀▀▀ -->
            <div v-if="is_marketplace" class="widget-box pa-3 my-5">
              <v-icon class="me-1">info_outline</v-icon>
              Change inventory in the
              <b>
                <router-link
                  :to="{
                    name: IS_VENDOR_PANEL
                      ? 'Vendor_ProductPage_Vendors'
                      : 'BPageProductVendors',
                    params: product ? { product_id: product.id } : undefined,
                  }"
                  >Vendors
                </router-link>
              </b>
              tab.
            </div>
            <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
          </fieldset>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Pricing ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <fieldset
            :disabled="modern && (!enable || !!loading)"
            v-show="!modern || editor_tab === 'pricing'"
            :class="[
              { disabled: !enable },
              modern
                ? 'b-product-variant-editor__section b-product-variant-editor__pricing'
                : 'widget-box mb-5',
            ]"
          >
            <u-widget-header
              v-if="!modern"
              :class="{ 'sd-modern-form-header': modern }"
              :title="
                $t('product_admin.inventory.variant_add_edit.price.title')
              "
              icon="sell"
            >
            </u-widget-header>

            <v-list-subheader v-if="!modern"
              >{{
                $t("product_admin.inventory.variant_add_edit.price.subtitle")
              }}
            </v-list-subheader>

            <div
              :class="{
                'sd-modern-widget b-product-variant-editor__pricing-scope':
                  modern,
              }"
            >
              <u-smart-toggle
                v-model="pricing"
                :disabled="modern && (!enable || !!loading)"
                :accessible="modern"
                :false-title="
                  $t(
                    modern
                      ? 'b_product_inventory.editor.product_pricing'
                      : 'global.commons.inactive',
                  )
                "
                :false-description="
                  modern
                    ? $t('b_product_inventory.editor.inherited_price')
                    : undefined
                "
                :true-description="
                  $t(
                    modern
                      ? 'b_product_inventory.editor.custom_pricing_help'
                      : 'product_admin.inventory.variant_add_edit.has_pricing_input',
                  )
                "
                :true-title="
                  $t(
                    modern
                      ? 'b_product_inventory.editor.custom_pricing'
                      : 'global.commons.active',
                  )
                "
                color="success"
                false-gray
              ></u-smart-toggle>
              <section
                v-if="modern"
                class="b-product-variant-editor__product-price-reference"
                :aria-label="
                  $t('b_product_inventory.editor.product_price_reference')
                "
              >
                <h3>
                  {{ $t("b_product_inventory.editor.product_price_reference") }}
                </h3>
                <dl>
                  <div>
                    <dt>
                      {{ $t("add_product.pricing.workspace.base_price") }}
                    </dt>
                    <dd>
                      <u-price
                        v-if="product.price != null && product.price !== ''"
                        :amount="product.price"
                        :currency="product.currency"
                      /><span v-else>{{ $t("global.commons.not_set") }}</span>
                    </dd>
                  </div>
                  <div v-if="product.commission">
                    <dt>{{ $t("add_product.pricing.commission_input") }}</dt>
                    <dd>
                      <u-price
                        :amount="product.commission"
                        :currency="product.currency"
                      />
                    </dd>
                  </div>
                  <div v-if="product.discount">
                    <dt>{{ $t("add_product.pricing.discount_input") }}</dt>
                    <dd>
                      <u-price
                        :amount="product.discount"
                        :currency="product.currency"
                      />
                    </dd>
                  </div>
                  <template
                    v-if="
                      product.discount && (product.dis_start || product.dis_end)
                    "
                  >
                    <div>
                      <dt>{{ $t("add_product.pricing.start_input") }}</dt>
                      <dd>
                        {{
                          comparisonValue({ type: "date" }, product.dis_start)
                        }}
                      </dd>
                    </div>
                    <div>
                      <dt>{{ $t("add_product.pricing.end_input") }}</dt>
                      <dd>
                        {{ comparisonValue({ type: "date" }, product.dis_end) }}
                      </dd>
                    </div>
                  </template>
                </dl>
                <p v-if="product.price_label">{{ product.price_label }}</p>
              </section>
            </div>

            <v-expand-transition>
              <b-product-edit-price
                v-if="pricing && shop && !forStudio"
                ref="priceEditor"
                :busy="modern ? loading : undefined"
                :active="!modern || enable"
                :external-action-buttons="modern"
                :custom-object="price_object"
                :is-marketplace="is_marketplace"
                :product="product"
                :shop="shop"
                :variant="productVariant"
                :vendor="vendor"
                :modern="modern"
                class="mt-3"
              />
            </v-expand-transition>
          </fieldset>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Packaging & Shipping ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <fieldset
            :disabled="modern && (!enable || !!loading)"
            v-if="isPhysical"
            v-show="!modern || editor_tab === 'shipping'"
            :class="[
              { disabled: !enable },
              modern ? 'b-product-variant-editor__section' : 'widget-box mb-5',
            ]"
          >
            <v-btn
              v-if="modern"
              variant="text"
              color="primary"
              class="sd-modern-button sd-modern-button--inline b-product-variant-editor__package-copy"
              :disabled="!enable || !!loading || !product.extra"
              @click="extra = Object.assign({}, product.extra)"
              ><v-icon start size="16">refresh</v-icon
              >{{
                $t(
                  "product_admin.inventory.variant_add_edit.package.same_as_product_action",
                )
              }}</v-btn
            ><u-widget-header
              v-if="!modern"
              :class="{ 'sd-modern-form-header': modern }"
              :title="
                $t('product_admin.inventory.variant_add_edit.package.title')
              "
              icon="square_foot"
              add-text
              :add-caption="
                $t(
                  'product_admin.inventory.variant_add_edit.package.same_as_product_action',
                )
              "
              add-icon="refresh"
              :disabled="!product.extra"
              @click:add="extra = Object.assign({}, product.extra)"
            >
            </u-widget-header>

            <v-list-subheader v-if="!modern"
              >{{
                $t("product_admin.inventory.variant_add_edit.package.subtitle")
              }}
            </v-list-subheader>

            <b-product-extra-input
              :modern="modern"
              :readonly="modern && (!enable || add_by_dropShipping)"
              :busy="modern ? loading : undefined"
              :class="{ disabled: add_by_dropShipping }"
              :default-lead-time="lead"
              :extra="extra"
              :shop="shop"
              @onLeadChange="
                (value) => {
                  lead = value;
                }
              "
            />
          </fieldset>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Variant Images ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <fieldset
            v-show="!modern || editor_tab === 'images'"
            class="b-product-variant-editor__media"
            :disabled="modern && (!enable || !!loading)"
            :class="{ disabled: modern && !enable }"
          >
            <div
              v-if="productVariant"
              :class="[
                { disabled: !enable },
                modern
                  ? 'b-product-variant-editor__section'
                  : 'widget-box -large mb-5',
              ]"
            >
              <u-widget-header
                v-if="!modern"
                :class="{ 'sd-modern-form-header': modern }"
                :title="
                  $t('product_admin.inventory.variant_add_edit.image.title')
                "
                icon="insert_photo"
              >
              </u-widget-header>

              <v-list-subheader v-if="!modern"
                >{{
                  $t("product_admin.inventory.variant_add_edit.image.subtitle")
                }}
              </v-list-subheader>

              <p v-if="modern" class="b-product-variant-editor__hint">
                {{ $t("b_product_inventory.editor.images_save_help") }}
              </p>
              <b-product-images-gallery
                ref="variantGallery"
                :product="product"
                :variant="productVariant"
                :modern="modern"
                :inert="modern && (!enable || !!loading)"
                class="mt-3"
                @activity="gallery_activity = $event"
              />
            </div>
            <div
              v-else
              :class="
                modern ? 'b-product-variant-editor__section' : 'widget-box mb-5'
              "
            >
              <u-widget-header
                v-if="!modern"
                :class="{ 'sd-modern-form-header': modern }"
                :title="$t('product_admin.inventory.variant_add_edit.images')"
                icon="insert_photo"
              >
              </u-widget-header>
              <v-list-subheader>
                {{
                  $t(
                    modern
                      ? "b_product_inventory.editor.add_image_help"
                      : "product_admin.inventory.variant_add_edit.images_message",
                  )
                }}
              </v-list-subheader>

              <v-file-input
                v-model="image_file"
                :disabled="modern && (!enable || !!loading)"
                :class="{ 'sd-modern-underlined-field': modern }"
                accept="image/*"
                :label="
                  modern
                    ? $t('b_product_inventory.editor.select_image')
                    : 'Select variant image...'
                "
                prepend-icon=""
                prepend-inner-icon="filter"
                show-size
                variant="underlined"
              ></v-file-input>
            </div>
          </fieldset>
        </div>
      </v-card-text>
    </div>
    <!-- ██████████████████████ Actions ██████████████████████ -->

    <v-card-actions :class="{ 'b-product-variant-editor__actions': modern }">
      <div class="widget-buttons">
        <v-btn
          :size="modern ? 'default' : 'x-large'"
          :class="{ 'sd-modern-button': modern }"
          variant="text"
          :disabled="editorBusy"
          @click="closeEditor"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          :loading="loading"
          color="primary"
          :size="modern ? 'default' : 'x-large'"
          :class="{ 'sd-modern-button': modern }"
          variant="elevated"
          :disabled="editorBusy"
          v-ctrl.s="addItem"
          @click="addItem()"
        >
          <v-icon class="me-1">{{ productVariant ? "save" : "add" }}</v-icon>
          {{
            productVariant
              ? $t("global.actions.save")
              : $t("global.actions.add")
          }}
        </v-btn>
      </div>
    </v-card-actions>

    <!-- ██████████████████████ Dialog > Graphical assets ██████████████████████ -->
    <v-dialog
      v-model="show_graphical_asset_dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card
        :theme="
          modern ? (USER()?.preferences?.dark ? 'dark' : 'light') : undefined
        "
      >
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1">snippet_folder</v-icon>

          {{ $t("variant_graphical_assets.title") }}
        </v-card-title>

        <v-card-text>
          <variant-graphical-assets-list
            :shop="shop"
            :vendor="vendor"
          ></variant-graphical-assets-list>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="show_graphical_asset_dialog = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import BProductEditPrice from "../../../product/edit/price/BProductEditPrice.vue";
import BProductExtraInput from "../../extra/input/BProductExtraInput.vue";
import BProductImagesGallery from "../../images/gallery/BProductImagesGallery.vue";
import UTooltipTips from "../../../../ui/tooltip/tips/UTooltipTips.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import SProductPrice from "../../../../storefront/product/price/SProductPrice.vue";
import BProductConnectLocked from "../../../product/connect/locked/BProductConnectLocked.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

import VariantGraphicalAssetsList from "../../../product/graphical-assets/VariantGraphicalAssetsList.vue";
import { ProductVariants } from "@selldone/core-js/enums/product/ProductVariants";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import { GetNameOfColor } from "@selldone/core-js/helper/color/ColorHelper.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import BProductVariantValueInput from "@selldone/components-vue/backoffice/product/variants/value-input/BProductVariantValueInput.vue";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";
import UChartDonutLeader from "@selldone/components-vue/ui/chart/donut-leader/UChartDonutLeader.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import DirectiveCtrlKeydown from "@selldone/components-vue/directives/keyboard/DirectiveCtrlKeydown.ts";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";

export default {
  name: "BProductVariantAdd",
  mixins: [DateMixin],
  directives: { ctrl: DirectiveCtrlKeydown },
  components: {
    UChartDonutLeader,
    UPrice,
    BProductVariantValueInput,
    UAvatarFolder,

    VariantGraphicalAssetsList,

    USmartToggle,
    BProductConnectLocked,
    SProductPrice,
    UTooltipTips,
    BProductImagesGallery,
    BProductExtraInput,
    BProductEditPrice,
  },
  emits: ["add", "update", "close"],
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
    },

    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },

    product: {
      required: true,
    },

    productVariant: {
      required: false,
    },

    hasColor: {
      required: false,
      type: Boolean,
      default: false,
    },
    hasStyle: {
      required: false,
      type: Boolean,
      default: false,
    },
    hasVolume: {
      required: false,
      type: Boolean,
      default: false,
    },
    hasWeight: {
      required: false,
      type: Boolean,
      default: false,
    },
    hasPack: {
      required: false,
      type: Boolean,
      default: false,
    },
    hasType: {
      required: false,
      type: Boolean,
      default: false,
    },

    forStudio: {
      default: false,
      type: Boolean,
    },

    loading: {},
  },

  data() {
    return {
      editor_tab: "details",
      GetNameOfColor: GetNameOfColor,
      ProductVariants: ProductVariants,

      sku: "",
      mpn: "",
      gtin: "",

      color: "",
      weight: "",
      volume: "",
      style: "",
      pack: "",
      quantity: 10,
      price: "",
      type: "",
      code: "",

      enable: true,

      pricing: false,

      price_object: {},

      lead: -1,

      extra: {},

      show_graphical_asset_dialog: false,

      // Add image on add new variant mode
      image_file: null,
      gallery_activity: { busy: false, dialog: false },
    };
  },

  computed: {
    stockPreview() {
      const variants = this.product.product_variants;
      if (!Array.isArray(variants) || this.productVariant?.deleted_at) return null;
      const draft = this.stockQuantity(this.quantity);
      const current = this.productVariant?.id != null ? this.stockQuantity(this.productVariant.quantity) : 0;
      if (draft === null || current === null) return null;
      let others = 0;
      for (const variant of variants) {
        if (variant.deleted_at || (this.productVariant?.id != null && String(variant.id) === String(this.productVariant.id))) continue;
        const quantity = this.stockQuantity(variant.quantity);
        if (quantity === null) return null;
        others += quantity;
      }
      const before = others + current;
      const after = others + draft;
      if (!Number.isSafeInteger(before) || !Number.isSafeInteger(after)) return null;
      return { current, others, before, after, retained: Math.min(current, draft), change: draft - current };
    },
    stockSlices() {
      const preview = this.stockPreview;
      if (!preview) return [];
      const slices = [
        { key: 'current', label: this.$t(preview.change < 0 ? 'b_product_inventory.editor.stock_retained' : 'b_product_inventory.editor.stock_this_variant'), value: preview.retained, color: 'rgb(var(--v-theme-primary))' },
        { key: 'others', label: this.$t('b_product_inventory.editor.stock_other_variants'), value: preview.others, color: 'rgba(var(--v-theme-on-surface), 0.22)' },
      ];
      if (preview.change) slices.push({ key: 'change', label: this.$t(preview.change > 0 ? 'b_product_inventory.editor.stock_added' : 'b_product_inventory.editor.stock_removed'), value: Math.abs(preview.change), color: preview.change > 0 ? 'rgb(var(--v-theme-success))' : 'rgb(var(--v-theme-error))' });
      return slices;
    },
    sidebarPictures() {
      if (!this.productVariant) return [];
      // A loaded gallery is authoritative, including an empty one after deletion.
      if (!Array.isArray(this.product.images))
        return this.productVariant.image ? [this.productVariant.image] : [];
      const images = this.product.images
        .filter(
          (image) =>
            image.variant_id != null &&
            String(image.variant_id) === String(this.productVariant.id),
        )
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
      return [
        ...new Set(images.map((image) => image.path).filter(Boolean)),
      ].slice(0, 3);
    },
    pricingOverridden() {
      return !!this.pricing;
    },
    pricingComparison() {
      if (!this.pricingOverridden) return [];
      const fields = [
        ["price", "price_input", "money"],
        ["discount", "discount_input", "money"],
        ["commission", "commission_input", "money"],
        ["currency", "currency_input", "text"],
        ["dis_start", "start_input", "date"],
        ["dis_end", "end_input", "date"],
        ["price_label", "price_label_input", "text"],
      ];
      return fields
        .map(([key, label, type]) => ({
          key,
          label: "add_product.pricing." + label,
          type,
          product:
            type === "money"
              ? this.product[key] == null || this.product[key] === ""
                ? null
                : this.comparisonNumber(this.product[key])
              : this.product[key],
          variant:
            type === "money"
              ? this.price_object[key] == null || this.price_object[key] === ""
                ? null
                : this.comparisonNumber(this.price_object[key])
              : this.price_object[key],
        }))
        .filter(
          (row) =>
            row.key === "price" ||
            (row.type === "date"
              ? this.comparisonTimestamp(row.product) !==
                this.comparisonTimestamp(row.variant)
              : row.type === "money"
                ? this.comparisonNumber(row.product) !==
                  this.comparisonNumber(row.variant)
                : (row.product ?? "") !== (row.variant ?? "")),
        );
    },
    shippingComparison() {
      if (!this.isPhysical) return [];
      const dimensions = ["weight", "width", "length", "height"].map((key) => ({
        key,
        label: "product_extra_physical." + key,
        type: "number",
        product: this.comparisonNumber(this.product.extra?.[key]),
        variant: this.comparisonNumber(this.extra?.[key]),
        unit:
          key === "weight"
            ? ShopOptionsHelper.GetMassUnit(this.shop)
            : ShopOptionsHelper.GetSizeUnit(this.shop),
      }));
      return [
        ...dimensions,
        {
          key: "lead",
          label: "product_extra_physical.lead_time",
          type: "lead",
          product: this.comparisonNumber(this.product.lead),
          variant: this.comparisonNumber(this.lead),
        },
      ].filter((row) => row.product !== row.variant);
    },
    shippingOverridden() {
      return this.isPhysical && this.shippingComparison.length > 0;
    },
    editorBusy() {
      return (
        this.modern &&
        (!!this.loading ||
          this.gallery_activity.busy ||
          this.gallery_activity.dialog)
      );
    },
    unitPriceAvailable() {
      return [
        [this.hasWeight, this.weight],
        [this.hasVolume, this.volume],
        [this.hasPack, this.pack],
      ]
        .filter(([enabled]) => enabled)
        .every(
          ([, value]) =>
            Number.isFinite(parseFloat(value)) && parseFloat(value) > 0,
        );
    },
    editorSections() {
      return [
        {
          value: "details",
          icon: "tune",
          label: "b_product_inventory.editor.details",
          heading: "b_product_inventory.editor.details_title",
          description: "b_product_inventory.editor.details_help",
        },
        ...(this.isPhysical
          ? [
              {
                value: "stock",
                icon: "inventory_2",
                label: "b_product_inventory.editor.stock_title",
                heading: "b_product_inventory.editor.stock_title",
                description: "b_product_inventory.editor.stock_description",
              },
            ]
          : []),
        {
          value: "pricing",
          icon: "sell",
          label: "b_product_inventory.editor.pricing",
          heading: "b_product_inventory.editor.pricing_title",
          description: "b_product_inventory.editor.pricing_help",
        },
        ...(this.isPhysical
          ? [
              {
                value: "shipping",
                icon: "local_shipping",
                label: "b_product_inventory.editor.shipping",
                heading: "b_product_inventory.editor.shipping_title",
                description: "b_product_inventory.editor.shipping_help",
              },
            ]
          : []),
        {
          value: "images",
          icon: "photo_library",
          label: "b_product_inventory.editor.images",
          heading: "b_product_inventory.editor.images_title",
          description: "b_product_inventory.editor.images_help",
        },
      ];
    },
    activeEditorSection() {
      return (
        this.editorSections.find(
          (section) => section.value === this.editor_tab,
        ) || this.editorSections[0]
      );
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },

    smart_price_enable() {
      return this.shop.theme && this.shop.theme.smart_price;
    },

    isPhysical() {
      return this.product.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.product.type === ProductType.VIRTUAL.code;
    },
  },

  watch: {
    editor_tab(tab) {
      if (this.modern && tab === "images") {
        // Muuri must measure after v-show reveals the retained uploader.
        this.$nextTick(() => this.$refs.variantGallery?.refreshLayout());
      }
    },
    productVariant() {
      this.assignFromProp();
    },

    pricing() {
      if (
        this.price_object &&
        this.product.currency !== this.price_object.currency
      ) {
        // Fix not matched currency product <-> variant:
        this.price_object.currency = this.product.currency;
        this.price_object.price = this.product.price;
        this.price_object.discount = this.product.discount;
        this.price_object.commission = this.product.commission;

        this.price_object.price_label = this.product.price_label;
      }
    },
  },
  created() {
    this.assignFromProp();
  },

  methods: {
    stockQuantity(value) {
      if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '') return null;
      const quantity = Number(value);
      return Number.isSafeInteger(quantity) && quantity >= 0 ? quantity : null;
    },
    formatStock(value) {
      return value.toLocaleString(this.$vuetify?.locale?.isRtl ? 'fa-IR' : 'en-US');
    },
    comparisonNumber(value) {
      const number = Number(value ?? 0);
      return Number.isFinite(number) ? number : String(value ?? "");
    },
    comparisonTimestamp(value) {
      if (value == null || value === "") return null;
      const timestamp = this.convertToLocalTime(value)?.getTime();
      return Number.isFinite(timestamp) ? timestamp : String(value);
    },
    comparisonValue(row, value) {
      if (row.type === "date") {
        const timestamp = this.comparisonTimestamp(value);
        return timestamp == null
          ? this.$t("global.commons.not_set")
          : typeof timestamp === "number"
            ? this.getLocalTimeStringSmall(new Date(timestamp).toISOString())
            : timestamp;
      }
      if (row.type === "lead") {
        if (value === -1)
          return this.$t("product_extra_physical.dynamic_lead_time");
        if (value === 0)
          return this.$t("add_product.shipping_modern.ready_digest");
        return this.$t("add_product.shipping_modern.hours_digest", {
          hours: value,
        });
      }
      if (row.type === "number")
        return `${typeof value === "number" ? value.toLocaleString(this.$vuetify.locale?.isRtl ? "fa-IR" : "en-US", { maximumFractionDigits: 3 }) : value} ${row.unit}`;
      return value == null || value === ""
        ? this.$t("global.commons.not_set")
        : value;
    },
    closeEditor() {
      if (!this.editorBusy) this.$emit("close");
    },
    addItem() {
      if (this.editorBusy) return;
      if (
        this.modern &&
        this.enable &&
        this.pricing &&
        this.$refs.priceEditor &&
        !this.$refs.priceEditor.prepareSave()
      )
        return;
      let item = {};
      if (this.productVariant) {
        item = this.productVariant;
      }

      if (this.hasColor) item.color = this.color;

      if (this.hasWeight) item.weight = this.weight;

      if (this.hasVolume) item.volume = this.volume;

      if (this.hasStyle) item.style = this.style;

      if (this.hasPack) item.pack = this.pack;

      if (this.hasType) item.type = this.type;

      item.sku = this.sku;
      item.mpn = this.mpn;
      item.gtin = this.gtin;

      item.enable = this.enable;

      item.pricing = this.pricing;

      item.price = parseFloat(this.price_object.price);
      item.currency = this.price_object.currency;
      item.commission = parseFloat(this.price_object.commission);
      item.discount = parseFloat(this.price_object.discount);

      item.dis_start = this.price_object.dis_start;
      item.dis_end = this.price_object.dis_end;

      item.price_label = this.price_object.price_label;

      item.quantity = parseInt(this.quantity, 10);

      item.lead = this.lead;
      item.extra = this.extra;

      item._ATTACHED_IMAGE_FILE = this.image_file; // Send to server after variant created!

      if (this.productVariant) {
        this.$emit("update", this.productVariant);
      } else {
        this.$emit("add", item);
      }
    },

    assignFromProp() {
      this.resetToDefault(); // 🞇 Reset to default

      this.price_object.price = this.product.price;
      this.price_object.currency = this.product.currency;
      this.price_object.commission = this.product.commission;
      this.price_object.discount = this.product.discount;

      this.price_object.dis_start = this.product.dis_start;
      this.price_object.dis_end = this.product.dis_end;

      this.price_object.price_label = this.product.price_label;

      if (this.productVariant) {
        this.sku = this.productVariant.sku;
        this.mpn = this.productVariant.mpn;
        this.gtin = this.productVariant.gtin;

        this.color = this.productVariant.color;
        this.weight = this.productVariant.weight;
        this.volume = this.productVariant.volume;
        this.style = this.productVariant.style;
        this.pack = this.productVariant.pack;
        this.type = this.productVariant.type;

        this.code = this.productVariant.id;

        this.quantity = this.productVariant.quantity;

        this.pricing = this.productVariant.pricing;

        this.price_object.price = this.productVariant.price;
        this.price_object.currency = this.productVariant.currency;
        this.price_object.commission = this.productVariant.commission;
        this.price_object.discount = this.productVariant.discount;

        this.price_object.dis_start = this.productVariant.dis_start;
        this.price_object.dis_end = this.productVariant.dis_end;

        this.price_object.price_label = this.productVariant.price_label;

        this.enable = this.productVariant.enable;

        this.lead = this.productVariant.lead;

        if (
          !this.productVariant.extra ||
          Array.isArray(this.productVariant.extra)
        )
          this.productVariant.extra = {};

        this.extra = this.productVariant.extra;
      } else {
        // set from main product info!

        this.price_object.sku = "";
        this.price_object.mpn = "";
        this.price_object.gtin = "";

        this.price_object.price = this.product.price;
        this.price_object.currency = this.product.currency;
        this.price_object.commission = this.product.commission;
        this.price_object.discount = this.product.discount;

        this.price_object.dis_start = this.product.dis_start;
        this.price_object.dis_end = this.product.dis_end;

        this.price_object.price_label = this.product.price_label;

        this.lead = this.product.lead;

        if (!this.product.extra || Array.isArray(this.product.extra))
          this.product.extra = {};
        // New-variant packaging is a draft, separate from the product comparison baseline.
        this.extra = Object.assign({}, this.product.extra);
      }
    },

    validateColor() {
      if (!this.color?.startsWith("#")) {
        this.color = "#FFFFFF";
        NotificationService.showErrorAlert(null, "Invalid color code!");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-variant-form :where(fieldset) {
  min-inline-size: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.b-product-variant-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 0;
  border-radius: 0;
  color: rgb(var(--v-theme-on-surface));
  font-size: 14px;
  line-height: 21px;

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    padding-block: 18px;
    padding-inline: max(28px, calc((100% - 1124px) / 2));
    border-block-end: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
  }
  &__heading {
    min-width: 0;
    flex: 1;
    h2 {
      margin: 0;
      font-size: 21px;
      line-height: 28px;
      font-weight: 500;
      letter-spacing: -0.3px;
    }
    p {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: 8px;
      margin: 3px 0 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 18px;
    }
    p > span {
      min-width: 0;
      flex: 0 1 auto;
      max-width: 420px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    b {
      white-space: nowrap;
      font-weight: 500;
    }
  }
  &__workspace {
    display: grid;
    grid-template-columns: 182px minmax(0, 1fr);
    gap: 28px;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    max-width: 1180px;
    padding: 28px;
    margin-inline: auto;
  }
  &__rail {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }
  &__availability {
    background: rgb(var(--v-theme-surface));
    border-radius: 18px;
  }
  &__navigation.sd-modern-section-nav {
    gap: 5px;
    padding: 0;
  }
  &__navigation.sd-modern-section-nav > .sd-modern-section-nav__item {
    min-height: 44px;
    padding: 11px 12px;
    font-size: 13px;
    line-height: 20px;
    font-weight: 500;
    .v-icon {
      font-size: 18px;
    }
  }
  &__navigation :deep(.v-btn__content) {
    width: 100%;
    gap: 8px;
  }
  &__nav-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__override {
    margin-inline-start: auto;
    flex-shrink: 0;
  }
  &__pictures {
    display: grid;
    grid-template-columns: 24px;
    grid-template-rows: 24px;
    align-items: center;
    flex: 0 0 auto;
    gap: 2px;
    margin-inline-start: auto;
  }
  &__pictures[data-count="2"],
  &__pictures[data-count="3"] {
    grid-template-columns: 24px 10px;
  }
  &__pictures[data-count="3"] {
    grid-template-rows: 11px 11px;
  }
  &__pictures > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 1px solid var(--sd-modern-border);
    border-radius: 3px;
    background: rgb(var(--v-theme-surface));
    transform-origin: right center;
  }
  &__pictures:dir(rtl) > img {
    transform-origin: left center;
  }
  &__pictures > img:first-child {
    grid-row: 1 / -1;
  }
  &__pictures[data-count="2"] > img:last-child {
    height: 11px;
  }
  &__comparison-title {
    margin-block-end: 6px;
    font-size: 13px;
    line-height: 20px;
    font-weight: 500;
  }
  &__comparison {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 12px;
    line-height: 18px;
  }
  &__comparison th,
  &__comparison td {
    padding: 4px;
    text-align: start;
    vertical-align: top;
    overflow-wrap: anywhere;
    font: inherit;
  }
  &__comparison th:first-child {
    width: 32%;
    padding-inline-start: 0;
  }
  &__comparison thead th {
    color: var(--sd-modern-muted);
    font-size: 11px;
  }
  &__comparison :deep(.u--price) {
    white-space: normal;
    font: inherit;
  }
  &__body.v-card-text {
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    padding: 0 2px 2px !important;
    overflow-y: auto;
  }
  &__content {
    width: 100%;
    min-width: 0;
  }
  &__page-heading {
    margin-block-end: 20px;
    h2 {
      margin: 0;
      font-size: 22px;
      line-height: 28px;
      font-weight: 500;
      letter-spacing: -0.3px;
    }
    p {
      margin: 5px 0 0;
      color: var(--sd-modern-muted);
      font-size: 13px;
      line-height: 20px;
    }
  }
  &__inactive {
    margin-block-end: 18px;
  }
  &__details,
  &__content
    > fieldset:not(.b-product-variant-editor__media):not(
      .b-product-variant-editor__pricing
    ),
  &__pricing-scope,
  &__media > .b-product-variant-editor__section {
    min-width: 0;
    padding: 24px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 15px;
    background: rgb(var(--v-theme-surface));
  }
  &__details {
    display: grid;
    gap: 28px;
  }
  &__section {
    min-width: 0;
  }
  &__section:disabled {
    opacity: 0.6;
  }
  &__group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-block-end: 17px;
    > div {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      min-width: 0;
    }
    h3 {
      margin: 0;
      font-size: 14px;
      line-height: 21px;
      font-weight: 500;
    }
    > div > .v-icon {
      color: var(--sd-modern-muted);
    }
    .sd-modern-button--inline {
      min-height: 32px;
      font-size: 12px;
    }
  }
  &__optional {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
  }
  &__option-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 22px;
    align-items: start;
  }
  &__identifiers {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 22px;
    align-items: start;
  }
  &__pricing-scope {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 24px;
    align-items: start;
    margin-block-end: 24px;
  }
  &__product-price-reference {
    min-width: 0;
    h3 {
      margin: 0 0 12px;
      font-size: 14px;
      line-height: 21px;
      font-weight: 500;
    }
    dl {
      margin: 0;
    }
    dl > div {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-block-start: 6px;
      font-size: 13px;
      line-height: 20px;
    }
    dt {
      color: var(--sd-modern-muted);
    }
    dd {
      margin: 0;
      text-align: end;
      overflow-wrap: anywhere;
    }
    p {
      margin: 10px 0 0;
      font-size: 13px;
      line-height: 20px;
      overflow-wrap: anywhere;
    }
  }
  &__stock-fields {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
    gap: 22px;
    align-items: center;
    > div > .b-product-variant-editor__hint { margin-block-start: 12px; }
  }
  &__stock-preview { width: 100%; max-width: 360px; min-width: 0; margin: 0 auto; }
  &__stock-preview figcaption { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 12px; font-size: 12px; line-height: 18px; }
  &__stock-preview figcaption > span:last-child { display: flex; align-items: center; gap: 6px; font-variant-numeric: tabular-nums; }
  &__stock-preview figcaption strong { font-weight: 500; }
  &__stock-preview:dir(rtl) figcaption .v-icon { transform: scaleX(-1); }
  &__stock-breakdown { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 16px; margin: 0; font-size: 12px; line-height: 18px; }
  &__stock-breakdown > div { min-width: 0; }
  &__stock-breakdown dt { display: flex; align-items: center; gap: 5px; color: var(--sd-modern-muted); }
  &__stock-breakdown i { width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; }
  &__stock-breakdown dd { margin: 0; padding-inline-start: 12px; font-variant-numeric: tabular-nums; }
  &__hint {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
  &__unit-price.v-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-content: start;
    align-items: center;
    gap: 3px 8px;
    margin: 0;
    padding: 0 !important;
    color: rgb(var(--v-theme-on-surface));
    font-size: 14px;
    line-height: 24px;
    > .v-btn {
      grid-column: 2;
      grid-row: 1;
    }
  }
  &__unit-label {
    font-size: 13px;
    line-height: 20px;
  }
  &__unit-value {
    grid-column: 1 / -1;
    margin: 0 !important;
    min-height: 44px;
    display: flex;
    align-items: center;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__unit-value :deep(.u-price) {
    font-size: 14px;
  }

  &__package-copy {
    margin-block-end: 16px;
  }
  &__media
    > .b-product-variant-editor__section
    > .b-product-variant-editor__hint {
    margin-block-end: 12px;
  }
  &__actions {
    flex-shrink: 0;
    padding-block: 14px max(14px, env(safe-area-inset-bottom));
    padding-inline: max(28px, calc((100% - 1124px) / 2));
    border-block-start: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
    .widget-buttons {
      display: flex;
      flex-direction: row !important;
      justify-content: flex-end;
      gap: 8px;
      width: 100%;
      max-width: none;
      margin: 0;
    }
    .widget-buttons > .v-btn {
      flex: 0 1 auto;
      min-width: 104px;
      margin: 0;
    }
  }
  .input-variant {
    max-width: none;
    width: 100%;
    margin: 0 !important;
  }
  :deep(.v-list-subheader) {
    min-height: 0;
    margin-block: 5px 12px;
    padding: 0;
    font-size: 13px;
    line-height: 20px;
    color: var(--sd-modern-muted);
    white-space: normal;
  }
  :deep(.v-list-subheader__text) {
    overflow: visible;
    white-space: normal;
    text-overflow: clip;
  }
  :deep(.s--smart-toggle .mnh) {
    min-height: 44px;
  }
  :deep(.s--smart-toggle b) {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  :deep(.s--smart-toggle .small) {
    font-size: 13px;
    line-height: 19px;
  }
  :deep(.b-product-edit-price--modern.sd-modern-form) {
    width: 100%;
    max-width: none;
  }
  :deep(.b-product-extra-input.sd-modern-form) {
    width: 100%;
    max-width: none;
  }
  :deep(.b-product-extra-input__package.sd-modern-widget) {
    padding: 0;
    border: 0;
    box-shadow: none;
  }
  :deep(.b-product-extra-input__heading) {
    margin-block-end: 18px;
  }
  :deep(.v-field__input) {
    font-size: 14px;
    line-height: 24px;
    font-weight: 400;
  }

  @media (max-width: 799px) {
    &__workspace {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto minmax(0, 1fr);
      gap: 20px;
      padding: 20px;
    }
    &__rail {
      gap: 12px;
    }
    &__navigation.sd-modern-section-nav {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    &__navigation.sd-modern-section-nav > .sd-modern-section-nav__item {
      justify-content: center;
      padding: 10px 6px;
    }
    &__navigation :deep(.v-btn__content) {
      justify-content: center;
    }
  }
  @media (max-width: 599px) {
    &__header {
      padding: 16px 14px;
      gap: 10px;
    }
    &__heading h2 {
      font-size: 18px;
      line-height: 26px;
    }
    &__heading p > span {
      max-width: 220px;
    }
    &__workspace {
      padding: 14px;
      gap: 18px;
    }
    &__page-heading {
      margin-block-end: 18px;
      h2 {
        font-size: 21px;
      }
    }
    &__navigation.sd-modern-section-nav > .sd-modern-section-nav__item {
      font-size: 12px;
      padding: 10px 4px;
    }
    &__navigation.sd-modern-section-nav {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    &__navigation .v-icon:not(.b-product-variant-editor__override) {
      display: none;
    }
    &__details,
    &__content
      > fieldset:not(.b-product-variant-editor__media):not(
        .b-product-variant-editor__pricing
      ),
    &__pricing-scope,
    &__media > .b-product-variant-editor__section {
      padding: 18px 16px;
    }
    &__option-fields,
    &__identifiers,
    &__pricing-scope {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
    }
    &__stock-fields {
      grid-template-columns: minmax(0, 1fr);
      gap: 18px;
    }
    &__group-header {
      flex-wrap: wrap;
      gap: 8px;
    }
    &__actions {
      padding: 12px 14px max(12px, env(safe-area-inset-bottom));
    }
    &__actions .widget-buttons > .v-btn {
      min-height: 44px;
      flex: 1;
    }
    :deep(.v-field__input) {
      font-size: 16px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    &__pictures > img {
      --duration: 0s;
    }
  }
}

h2 {
  text-align: start;
  font-size: 1.4rem;
  margin-bottom: 1.4rem;
}

.input-variant {
  max-width: 480px;
  margin: 8px auto !important;
}

.color-button-ball {
  :hover {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0, 1);
    transform: scale(1.15, 1.15);
  }
}

.action-title {
  font-weight: 400;
}

.circle-border {
  border-radius: 50%;
  border-width: 2px;
  border-style: solid;
  border-color: #aaa;
}
</style>
