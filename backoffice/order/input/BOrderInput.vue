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
  <div v-if="isModernVirtual" class="b-order-input b-order-input--modern b-order-input--virtual text-start">
    <div class="sd-modern-content b-order-input__content">
      <div class="sd-modern-eyebrow b-order-input__breadcrumb">
        <span>{{ $t('global.product_types.virtual') }}</span><span aria-hidden="true">/</span><bdi>{{ getBasketOrderCode(basket) }}</bdi>
      </div>
      <header class="sd-modern-header b-order-input__header">
        <div>
          <h1 class="sd-modern-title-text"><v-icon size="20" aria-hidden="true">description</v-icon>{{ $t('process_center.forms.title') }}</h1>
          <p class="sd-modern-subtitle">{{ $t('process_center.forms.subtitle') }}</p>
        </div>
        <span class="sd-modern-status sd-modern-status--plain">
          <span class="sd-modern-status__dot no-inv" :style="{ backgroundColor: getStatusColor(basket.status) }" />{{ getStatusString(basket.status) }}
        </span>
      </header>

      <section v-if="!items.length" class="sd-modern-widget b-order-input__empty" role="status">
        <v-icon size="28" aria-hidden="true">assignment</v-icon>
        <h2>{{ $t('order_input.empty_title') }}</h2><p>{{ $t('order_input.empty_message') }}</p>
      </section>
      <section v-for="item in items" :key="item.id" class="sd-modern-widget b-order-input__product" :aria-label="item.product.title">
        <header class="b-order-input__product-header">
          <div class="b-order-input__image">
            <img v-if="item.product.icon" :src="getShopImagePath(item.product.icon, 128)" :alt="item.product.title" width="48" height="48" class="hover-scale-small" />
            <v-icon v-else size="22" aria-hidden="true">inventory_2</v-icon>
          </div>
          <div class="b-order-input__identity">
            <h2>{{ item.product.title }}</h2>
            <p v-if="item.product.title_en && item.product.title_en !== item.product.title">{{ item.product.title_en }}</p>
            <variant-item-view-micro v-if="item.variant" :product-variant="item.variant" class="b-order-input__variant" />
            <div class="b-order-input__metadata">
              <span v-if="item.product.sku">SKU <button v-copy type="button" class="b-order-input__copy" :aria-label="$t('global.actions.copy') + ': ' + item.product.sku"><bdi>{{ item.product.sku }}</bdi></button></span>
              <span v-if="item.product.mpn">MPN <button v-copy type="button" class="b-order-input__copy" :aria-label="$t('global.actions.copy') + ': ' + item.product.mpn"><bdi>{{ item.product.mpn }}</bdi></button></span>
              <span>{{ $t('order_input.quantity') }} <bdi>{{ item.count }}</bdi></span>
            </div>
          </div>
          <v-btn :to="{ name: 'BPageProductDashboard', params: { product_id: item.product.id } }" target="_blank" rel="noopener noreferrer" class="sd-modern-button sd-modern-button--inline b-order-input__product-admin" color="primary" variant="text">
            {{ $t('commons.product_admin') }}<v-icon size="16" class="ms-2" aria-hidden="true">north_east</v-icon>
            <v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('process_center.forms.product_admin_help') }}</v-tooltip>
          </v-btn>
        </header>

        <section class="b-order-input__section b-order-input__customer">
          <header class="b-order-input__section-header">
            <div>
              <h3><v-icon size="18" aria-hidden="true">assignment_ind</v-icon>{{ $t('process_center.forms.customer_title') }}
                <v-btn icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('process_center.forms.customer_title')">
                  <v-icon size="16" aria-hidden="true">info_outline</v-icon>
                  <v-tooltip activator="parent" location="top" :open-on-focus="true" :open-on-click="true" content-class="sd-modern-tooltip text-start">{{ $t('process_center.forms.customer_help') }}</v-tooltip>
                </v-btn>
              </h3>
              <p class="sd-modern-subtitle">{{ $t('process_center.forms.customer_subtitle') }}</p>
            </div>
            <span class="b-order-input__readonly"><v-icon size="14" aria-hidden="true">lock_outline</v-icon>{{ $t('order_input.read_only') }}</span>
          </header>
          <basket-item-user-message-form v-if="item.product.inputs?.length || item.product.message" :basket="basket" :product="item.product" :variant-id="item.variant_id" is-admin color="transparent" modern force-show readonly />
          <div v-else class="sd-modern-notice b-order-input__no-answers" role="status"><v-icon size="17" aria-hidden="true">assignment</v-icon>{{ $t('process_center.forms.customer_empty') }}</div>
          <div v-for="field in unavailableFileFields(item)" :key="field.name" class="sd-modern-notice b-order-input__attachment" role="status">
            <v-icon size="18" aria-hidden="true">attach_file</v-icon><div class="sd-modern-notice__content"><div>{{ field.title || field.name }}</div><p>{{ $t('order_input.files_unavailable') }}</p></div>
          </div>
        </section>

        <section class="b-order-input__section b-order-input__outputs">
          <header class="b-order-input__section-header">
            <div>
              <h3><v-icon size="18" aria-hidden="true">output</v-icon>{{ $t('process_center.forms.output_title') }}
                <v-btn icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('process_center.forms.output_title')">
                  <v-icon size="16" aria-hidden="true">info_outline</v-icon>
                  <v-tooltip activator="parent" location="top" :open-on-focus="true" :open-on-click="true" content-class="sd-modern-tooltip text-start">
                    <div>{{ $t('process_center.forms.output_help') }}</div>
                    <template v-if="item.virtual_items?.some(record => record.status === 'Payed')">
                      <p v-for="tip in $tm('virtual_process_center.outputs_widget.tips')" :key="tip" class="mt-2 mb-0">{{ tip }}</p>
                    </template>
                  </v-tooltip>
                </v-btn>
              </h3>
              <p class="sd-modern-subtitle">{{ $t('process_center.forms.output_subtitle') }}</p>
            </div>
            <v-btn :to="{ name: 'BPageProductEdit', params: { product_id: item.product.id }, hash: '#outputs' }" target="_blank" rel="noopener noreferrer" class="sd-modern-button sd-modern-button--inline" variant="text" color="primary">
              {{ $t('add_virtual_item.edit_outputs') }}<v-icon size="16" class="ms-2" aria-hidden="true">north_east</v-icon>
              <v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('process_center.forms.output_settings_help') }}</v-tooltip>
            </v-btn>
          </header>
          <slot v-if="item.virtual_items?.length" :item="item" name="append-item"></slot>
          <p v-else class="sd-modern-subtitle" role="status">{{ $t('process_center.forms.output_empty') }}</p>
          <div class="sd-modern-notice b-order-input__output-help"><v-icon size="17" aria-hidden="true">info_outline</v-icon>{{ $t('process_center.forms.save_help') }}</div>
        </section>
      </section>
    </div>
  </div>
  <div v-else-if="modern" class="b-order-input b-order-input--modern text-start">
    <div class="sd-modern-content b-order-input__content">
      <div class="sd-modern-eyebrow b-order-input__breadcrumb">
        <span>{{ $t(isFulfillment ? "global.commons.fulfillments" : "order_input.order_label") }}</span>
        <span aria-hidden="true">/</span>
        <bdi>{{ basket ? getBasketOrderCode(basket) : "—" }}</bdi>
      </div>
      <header class="sd-modern-header b-order-input__header">
        <div>
          <h1 class="sd-modern-title-text">{{ $t("order_input.title") }}</h1>
          <p class="sd-modern-subtitle">{{ $t("order_input.subtitle") }}</p>
        </div>
        <span class="b-order-input__readonly">
          <v-icon size="16" aria-hidden="true">lock_outline</v-icon>
          {{ $t("order_input.read_only") }}
        </span>
      </header>

      <section v-if="!items.length" class="sd-modern-widget b-order-input__empty" role="status">
        <v-icon size="28" aria-hidden="true">assignment</v-icon>
        <h2>{{ $t("order_input.empty_title") }}</h2>
        <p>{{ $t("order_input.empty_message") }}</p>
      </section>

      <section v-for="item in items" :key="item.id" class="sd-modern-widget b-order-input__product" :aria-label="item.product.title">
        <header class="b-order-input__product-header">
          <div class="b-order-input__image">
            <img v-if="item.product.icon" :src="getShopImagePath(item.product.icon, 128)" alt="" width="44" height="44" class="hover-scale-small" />
            <v-icon v-else size="22" aria-hidden="true">inventory_2</v-icon>
          </div>
          <div class="b-order-input__identity">
            <h2>{{ item.product.title }}</h2>
            <p v-if="item.product.title_en && item.product.title_en !== item.product.title">{{ item.product.title_en }}</p>
            <variant-item-view-micro v-if="item.variant" :product-variant="item.variant" class="b-order-input__variant" />
          </div>
          <div class="b-order-input__quantity">
            <span>{{ $t("order_input.quantity") }}</span>
            <strong>{{ item.count }}</strong>
          </div>
        </header>

        <div class="b-order-input__body">
          <p class="b-order-input__guidance">{{ $t("order_input.guidance") }}</p>
          <basket-item-user-message-form
            :basket="basket"
            :product="item.product"
            :variant-id="item.variant_id"
            :is-admin="!isFulfillment"
            color="transparent"
            modern
            force-show
            readonly
          />

          <div v-for="field in unavailableFileFields(item)" :key="field.name" class="sd-modern-notice b-order-input__attachment" role="status">
            <v-icon size="18" aria-hidden="true">attach_file</v-icon>
            <div class="sd-modern-notice__content">
              <div>{{ field.title || field.name }}</div>
              <p>{{ $t("order_input.files_unavailable") }}</p>
            </div>
          </div>
          <slot :item="item" name="append-item"></slot>
        </div>

        <details class="b-order-input__details">
          <summary>
            <span>{{ $t("order_input.product_details") }}</span>
            <v-icon size="18" aria-hidden="true">expand_more</v-icon>
          </summary>
          <div class="b-order-input__details-body">
            <dl>
              <div><dt>{{ $t("order_input.product") }}</dt><dd>{{ item.product.title }}</dd></div>
              <div><dt>{{ $t("order_input.quantity") }}</dt><dd>{{ item.count }}</dd></div>
              <div v-if="item.product.sku"><dt>SKU</dt><dd><button v-copy type="button" class="b-order-input__copy" :aria-label="$t('global.actions.copy') + ': ' + item.product.sku"><bdi>{{ item.product.sku }}</bdi></button></dd></div>
              <div v-if="item.product.mpn"><dt>MPN</dt><dd><button v-copy type="button" class="b-order-input__copy" :aria-label="$t('global.actions.copy') + ': ' + item.product.mpn"><bdi>{{ item.product.mpn }}</bdi></button></dd></div>
            </dl>
            <v-btn
              v-if="productAdminId(item)"
              :to="{ name: 'BPageProductDashboard', params: { product_id: productAdminId(item) } }"
              class="sd-modern-button sd-modern-button--compact sd-modern-button--inline"
              variant="text"
              color="primary"
            >
              {{ $t("commons.product_admin") }}
              <v-icon size="16" class="ms-2" aria-hidden="true">chevron_right</v-icon>
            </v-btn>
          </div>
        </details>
      </section>
    </div>
  </div>
  <div v-else class="py-10">
    <div v-if="!items.length" class="widget-box -large" role="status">
      <u-widget-header
        icon="description"
        :title="$t('order_input.empty_title')"
      />
      <p class="text-muted mb-0">{{ $t("order_input.empty_message") }}</p>
    </div>
    <div v-for="item in items" :key="item.id" class="widget-box -large mb-5">
      <u-widget-header
        :add-caption="$t('commons.product_admin')"
        :title="item.product.title"
        :to="{
          name: 'BPageProductDashboard',
          params: { product_id: item.product.id },
        }"
        add-icon="open_in_new"
        add-text
        icon="folder_shared"
      ></u-widget-header>

      <v-list-subheader>
        {{ $t("order_input.message") }}
      </v-list-subheader>
      <!-- Product Info -->
      <v-list-item>
        <template v-slot:prepend>
          <v-avatar :size="48" rounded>
            <img
              v-if="item.product.icon"
              :src="getShopImagePath(item.product.icon, 128)"
            />
            <v-icon v-else>widgets</v-icon>
          </v-avatar>
        </template>
        <div class="small">
          <div class="ma-1">
            {{ item.product.title_en }}
            <variant-item-view-micro
              v-if="item.variant"
              :product-variant="item.variant"
              class="mx-2 inline-block p-0"
            />
          </div>
          <v-row align="center" justify="start" no-gutters>
            <u-text-value-box
              v-if="item.product.sku"
              class="ma-1 min-width-150"
              label="SKU"
              vb50
            >
              {{ item.product.sku }}
            </u-text-value-box>

            <u-text-value-box
              v-if="item.product.mpn"
              class="ma-1 min-width-150"
              label="MPN"
              vb50
            >
              {{ item.product.mpn }}
            </u-text-value-box>

            <u-text-value-box class="ma-1 min-width-150" label="Count" vb50>
              <b>{{ item.count }}</b>
            </u-text-value-box>
          </v-row>
        </div>
      </v-list-item>

      <basket-item-user-message-form
        :basket="basket"
        :product="item.product"
        :variant-id="item.variant_id"
        class="mt-3"
        color="transparent"
        force-show
        is-admin
        readonly
      ></basket-item-user-message-form>

      <div
        v-for="field in unavailableFileFields(item)"
        :key="field.name"
        class="mt-3 text-start"
        role="status"
      >
        <div>{{ field.title || field.name }}</div>
        <p class="text-muted mb-0">{{ $t("order_input.files_unavailable") }}</p>
      </div>

      <slot :item="item" name="append-item"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import BasketItemUserMessageForm from "../../../storefront/order/product-input/BasketItemUserMessageForm.vue";
import UTextValueBox from "../../../ui/text/value-box/UTextValueBox.vue";
import VariantItemViewMicro from "../../../storefront/product/variant/VariantItemViewMicro.vue";
import OrderMixin from "@selldone/components-vue/mixin/order/OrderMixin.ts";

export default {
  name: "BOrderInput",
  mixins: [OrderMixin],
  components: {
    VariantItemViewMicro,
    UTextValueBox,
    BasketItemUserMessageForm,
  },
  props: {
    virtualOutputs: { type: Boolean, default: false },
    modern: {
      type: Boolean,
      default: false,
    },
    isFulfillment: {
      type: Boolean,
      default: false,
    },
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },
  },
  data: function () {
    return {};
  },
  computed: {
    isModernVirtual() {
      return this.modern && this.virtualOutputs && this.basket?.type === "VIRTUAL" && !this.isFulfillment && !this.IS_VENDOR_PANEL;
    },
    items() {
      return (this.basket?.items || []).filter(
        (item) =>
          item.product &&
          (item.product.inputs?.length || item.product.outputs?.length || (this.isModernVirtual && item.virtual_items?.length)),
      );
    },
  },

  watch: {},
  created() {},
  methods: {
    productAdminId(item) {
      // Supplier navigation must not use the reseller product ID.
      return this.isFulfillment ? item.product.parent?.id : item.product.id;
    },
    unavailableFileFields(item) {
      // Missing projection does not mean the customer submitted no files.
      if (Array.isArray(item.files)) return [];
      return (item.product.inputs || []).filter((field) => field.type === "file");
    },
  },
};
</script>

<style lang="scss" scoped>
.b-order-input--modern {
  padding: 28px 24px 44px;
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;

  .b-order-input__content { width: 100%; max-width: 920px; }
  .b-order-input__breadcrumb { display: flex; gap: 8px; align-items: center; margin-block-end: 7px; font-size: 11px; font-weight: 400; line-height: 17px; letter-spacing: .07em; }
  .b-order-input__header { align-items: flex-start; gap: 20px; margin-block-end: 22px; }
  .sd-modern-title-text { margin: 0 0 6px; font-size: 20px; font-weight: 500; line-height: 26px; letter-spacing: normal; }
  .sd-modern-subtitle { margin: 0; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
  .b-order-input__readonly { display: inline-flex; align-items: center; gap: 7px; padding-block-start: 4px; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; white-space: nowrap; }
  .b-order-input__product { padding: 0; border-radius: 16px; margin-block-end: 18px; }
  .b-order-input__product-header { display: flex; align-items: center; gap: 14px; padding: 22px 24px; }
  .b-order-input__image { display: grid; place-items: center; flex: 0 0 44px; width: 44px; height: 44px; border-radius: 10px; background: var(--sd-modern-inset); color: var(--sd-modern-muted); }
  .b-order-input__image img { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; }
  .b-order-input__identity { flex: 1; min-width: 0; }
  .b-order-input__identity h2 { margin: 0 0 3px; font-size: 17px; font-weight: 500; line-height: 24px; text-transform: none; overflow-wrap: anywhere; }
  .b-order-input__identity p { margin: 0; font-size: 12px; line-height: 18px; color: var(--sd-modern-muted); overflow-wrap: anywhere; }
  .b-order-input__variant { margin-block-start: 6px; }
  .b-order-input__quantity { display: flex; flex: 0 0 auto; flex-direction: column; align-items: flex-end; font-size: 12px; line-height: 18px; color: var(--sd-modern-muted); }
  .b-order-input__quantity strong { font-size: 17px; font-weight: 500; line-height: 24px; color: rgb(var(--v-theme-on-surface)); }
  .b-order-input__body { padding: 0 24px 24px; }
  .b-order-input__guidance { max-width: 660px; margin: 0 0 22px; font-size: 13px; line-height: 1.6; color: var(--sd-modern-muted); }
  .b-order-input__attachment { display: flex; flex-wrap: nowrap; align-items: flex-start; gap: 10px; margin-block-start: 26px; padding: 13px 14px; border-radius: 10px; font-size: 13px; line-height: 20px; }
  .b-order-input__attachment > .v-icon { flex: 0 0 auto; margin-block-start: 2px; color: var(--sd-modern-muted); }
  .b-order-input__attachment p { margin: 0; }
  .b-order-input__details { border-block-start: 1px solid var(--sd-modern-border); }
  .b-order-input__details summary { box-sizing: border-box; display: flex; align-items: center; justify-content: flex-end; gap: 7px; min-height: 56px; padding: 12px 24px; list-style: none; cursor: pointer; color: rgb(var(--v-theme-primary)); font-size: 12px; line-height: 18px; }
  .b-order-input__details summary::-webkit-details-marker { display: none; }
  .b-order-input__details[open] summary > .v-icon { transform: rotate(180deg); }
  .b-order-input__details summary:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: -4px; border-radius: 8px; }
  .b-order-input__details-body { margin: 0 24px 20px; padding: 14px 16px; background: var(--sd-modern-inset); border-radius: 10px; }
  .b-order-input__details-body dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 0; }
  .b-order-input__details-body dt { margin-block-end: 3px; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  .b-order-input__details-body dd { margin: 0; font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
  .b-order-input__copy { min-width: 0; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: start; overflow-wrap: anywhere; cursor: pointer; }
  .b-order-input__copy:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; border-radius: 3px; }
  .b-order-input__details-body .v-btn { margin-block-start: 12px; }
  .b-order-input__empty { padding: 52px 24px; text-align: center; border-radius: 16px; }
  .b-order-input__empty > .v-icon { margin-block-end: 12px; color: var(--sd-modern-muted); }
  .b-order-input__empty h2 { margin: 0 0 8px; font-size: 17px; font-weight: 500; line-height: 24px; }
  .b-order-input__empty p { max-width: 380px; margin: 0 auto; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }

  @media (max-width: 600px) {
    padding: 22px 14px 30px;
    .b-order-input__header { flex-direction: column; gap: 9px; }
    .b-order-input__product-header { align-items: flex-start; gap: 10px; padding: 20px 18px; }
    .b-order-input__image { flex-basis: 36px; width: 36px; height: 36px; }
    .b-order-input__image img { width: 36px; height: 36px; }
    .b-order-input__body { padding: 0 18px 20px; }
    .b-order-input__details summary { padding-inline: 18px; }
    .b-order-input__details-body { margin-inline: 18px; }
    .b-order-input__copy { min-height: 44px; }
  }
}
.b-order-input--virtual {
  padding: 28px 24px 38px;
  font-size: 13px;
  line-height: 20px;

  .b-order-input__content { max-width: 1040px; }
  .b-order-input__breadcrumb { margin-block-end: 5px; font-size: 10px; line-height: 15px; letter-spacing: .65px; }
  .b-order-input__header { align-items: center; }
  .sd-modern-title-text { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 20px; line-height: 26px; }
  .sd-modern-title-text > .v-icon { color: var(--sd-modern-muted); }
  .sd-modern-subtitle { margin-block-start: 5px; font-size: 12px; line-height: 18px; }
  .b-order-input__header > .sd-modern-status { flex: none; font-size: 12px; line-height: 18px; }
  .b-order-input__product-header { align-items: center; flex-wrap: wrap; gap: 13px; padding: 20px; border-block-end: 1px solid var(--sd-modern-border); }
  .b-order-input__image { flex-basis: 48px; width: 48px; height: 48px; border-radius: 9px; }
  .b-order-input__image img { width: 48px; height: 48px; border-radius: 9px; object-fit: contain; }
  .b-order-input__identity h2 { margin: 0; font-size: 15px; font-weight: 500; line-height: 22px; }
  .b-order-input__identity p { margin-block-start: 2px; font-size: 12px; line-height: 18px; }
  .b-order-input__metadata { display: flex; flex-wrap: wrap; gap: 5px 16px; margin-block-start: 8px; font-size: 11px; line-height: 17px; color: var(--sd-modern-muted); }
  .b-order-input__metadata > span { display: inline-flex; align-items: baseline; gap: 5px; min-width: 0; }
  .b-order-input__metadata bdi { color: rgb(var(--v-theme-on-surface)); }
  .b-order-input__copy { padding: 2px; border-radius: 3px; }
  .b-order-input__section { padding: 22px 20px; }
  .b-order-input__section + .b-order-input__section { border-block-start: 1px solid var(--sd-modern-border); }
  .b-order-input__section-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-block-end: 16px; }
  .b-order-input__section-header > div { flex: 1; min-width: 180px; }
  .b-order-input__section-header > .v-btn { flex: none; }
  .b-order-input__section-header h3 { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin: 0; font-family: inherit; font-size: 14px; font-weight: 500; line-height: 21px; }
  .b-order-input__section-header h3 > .v-icon { color: var(--sd-modern-muted); }
  .b-order-input__section-header .sd-modern-info-button { margin-block: -8px; }
  .b-order-input__readonly { padding-block-start: 0; font-size: 11px; line-height: 17px; }
  .b-order-input__no-answers { display: flex; align-items: center; gap: 9px; padding: 13px 14px; border-radius: 9px; font-size: 12px; line-height: 18px; }
  .b-order-input__output-help { display: flex; align-items: flex-start; gap: 8px; margin-block-start: 20px; padding: 13px 14px; border-radius: 9px; font-size: 12px; line-height: 18px; }
  .b-order-input__output-help > .v-icon { flex: none; margin-block-start: 1px; color: var(--sd-modern-muted); }

  @media (max-width: 640px) {
    padding: 22px 14px 28px;
    .b-order-input__header { flex-direction: row; align-items: flex-start; gap: 12px; }
    .b-order-input__header > div { flex: 1; min-width: 0; }
    .b-order-input__product-header { align-items: flex-start; padding: 16px; }
    .b-order-input__identity { flex-basis: calc(100% - 61px); }
    .b-order-input__product-admin { margin-inline-start: 61px; }
    .b-order-input__section { padding: 18px 16px; }
    .b-order-input__section-header > div { min-width: 0; flex-basis: 100%; }
    .b-order-input__copy { min-height: 44px; }
  }
}
</style>
