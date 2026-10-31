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

<template>
  <div
    :class="
      modern ? 'b-product-edit-extra--modern sd-modern-form text-start' : 'mt-5'
    "
  >
    <template v-if="modern">
      <div
        v-if="add_by_dropShipping"
        class="sd-modern-notice b-product-edit-extra__inherited"
      >
        <b-product-edit-info-icon name="Link" :size="16" class="sd-modern-notice__icon" />
        <div>
          <strong>{{
            $t("add_product.shipping_modern.inherited_title")
          }}</strong>
          <p>{{ $t("add_product.shipping_modern.inherited_help") }}</p>
        </div>
      </div>
      <b-product-extra-input
        ref="shippingInput"
        v-model:bulk="bulk"
        :default-lead-time="lead"
        :extra="extra"
        :shop="shop"
        :busy="workspaceBusy"
        :invalid-measurements="invalidMeasurements"
        :invalid-lead="invalidLead"
        :readonly="add_by_dropShipping"
        modern
        has-bulk-action
        @onLeadChange="
          (value) => {
            if (!workspaceBusy && !add_by_dropShipping) lead = value;
          }
        "
        @dialog-change="serviceDialogOpen = $event"
      >
        <template #order-limits>
          <details
            ref="limitsPanel"
            class="sd-modern-widget sd-modern-disclosure b-product-edit-extra__limits"
          >
            <summary class="sd-modern-disclosure__summary">
              <b-product-edit-info-icon name="ShoppingBasket" /><span
                class="b-product-edit-extra__summary"
                ><span>{{
                  $t("add_product.shipping_modern.limits_title")
                }}</span
                ><small>{{ limitsDigest }}</small></span
              ><b-product-edit-info-icon name="ChevronDown" :size="16" />
            </summary>
            <div class="b-product-edit-extra__body">
              <div class="b-product-edit-extra__subtitle">
                <p>{{ $t("add_product.shipping_modern.limits_intro") }}</p>
                <v-btn
                  class="sd-modern-icon-button sd-modern-info-button"
                  icon
                  variant="text"
                  :aria-label="$t('add_product.shipping_modern.limits_about')"
                  ><b-product-edit-info-icon name="Info" :size="16" /><v-tooltip
                    activator="parent"
                    location="top"
                    open-on-click
                    content-class="sd-modern-tooltip text-start"
                    >{{
                      $t("add_product.shipping_modern.limits_help")
                    }}</v-tooltip
                  ></v-btn
                >
              </div>
              <div class="b-product-edit-extra__fields">
                <u-number-input
                  v-model="limit_min"
                  :min="0"
                  :decimal="0"
                  :step="1"
                  :disabled="workspaceBusy || add_by_dropShipping"
                  :text-center="false"
                  :label="$t('add_product.shipping_modern.minimum')"
                  :messages="$t('add_product.shipping_modern.no_limit_help')"
                  class="sd-modern-underlined-field"
                  variant="underlined"
                  clearable
                  @clear="limit_min = 0"
                />
                <u-number-input
                  v-model="limit_max"
                  :min="0"
                  :decimal="0"
                  :step="1"
                  :disabled="workspaceBusy || add_by_dropShipping"
                  :text-center="false"
                  :label="$t('add_product.shipping_modern.maximum')"
                  :messages="$t('add_product.shipping_modern.no_limit_help')"
                  class="sd-modern-underlined-field"
                  variant="underlined"
                  clearable
                  @clear="limit_max = 0"
                />
              </div>
              <p
                v-if="invalidLimits && !add_by_dropShipping"
                class="sd-modern-notice b-product-edit-extra__message"
                role="alert"
              >
                <b-product-edit-info-icon name="CircleAlert" :size="16" class="sd-modern-notice__icon" /><span class="sd-modern-notice__content">{{
                  $t("add_product.shipping_modern.invalid_limits")
                }}</span>
              </p>
              <p
                v-if="stockBelowMinimum"
                class="sd-modern-notice b-product-edit-extra__message"
                role="status"
              >
                <b-product-edit-info-icon name="TriangleAlert" :size="16" class="sd-modern-notice__icon" /><span class="sd-modern-notice__content">{{
                  $t("add_product.shipping_modern.stock_message", {
                    stock: formatQuantity(product.quantity),
                    min: formatQuantity(limit_min),
                  })
                }}</span>
              </p>
            </div>
          </details>
        </template>
      </b-product-extra-input>
      <footer class="b-product-edit-extra__footer">
        <div>
          <p role="status" aria-live="polite">
            <b-product-edit-info-icon
              :name="hasUnsavedChanges ? 'Circle' : 'CircleCheck'"
              :size="15"
            />{{
              $t(
                add_by_dropShipping
                  ? "add_product.shipping_modern.inherited_state"
                  : hasUnsavedChanges
                    ? "add_product.shipping_modern.unsaved"
                    : "add_product.shipping_modern.saved",
              )
            }}
          </p>
          <small>{{
            $t(
              add_by_dropShipping
                ? "add_product.shipping_modern.inherited_scope"
                : "add_product.shipping_modern.save_scope",
            )
          }}</small>
        </div>
        <div class="b-product-edit-extra__actions">
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            :disabled="
              workspaceBusy ||
              serviceDialogOpen ||
              add_by_dropShipping ||
              !hasUnsavedChanges
            "
            @click="discardChanges"
            >{{ $t("add_product.shipping_modern.discard") }}</v-btn
          ><v-btn
            v-if="!externalActionButtons && active"
            class="sd-modern-button sd-modern-button--primary"
            color="primary"
            variant="elevated"
            :loading="busy"
            :disabled="saveBlocked"
            aria-keyshortcuts="Control+s"
            @click="setExtraInfo"
            v-ctrl.s="setExtraInfo"
            ><template #prepend
              ><b-product-edit-info-icon
                :name="add_by_dropShipping ? 'Check' : 'Save'"
                :size="16" /></template
            >{{
              $t(
                add_by_dropShipping
                  ? "global.actions.continue"
                  : "global.actions.save_continue",
              )
            }}<template #append
              ><b-product-edit-info-icon
                name="ArrowRight"
                :size="16"
                class="b-product-edit-extra__direction" /></template
          ></v-btn>
        </div>
      </footer>
    </template>
    <template v-else>
      <template v-if="product.type === ProductType.PHYSICAL.code">
        <div class="widget-box mb-5">
          <u-widget-header
            :add-caption="!IS_VENDOR_PANEL ? 'Edit units' : undefined"
            :title="$t('add_product.extra_edit.physical.title')"
            :to="{ name: 'BPageShopLogisticWarehouse' }"
            add-icon="straighten"
            add-text
            icon="local_shipping"
          ></u-widget-header>

          <v-list-subheader>
            {{ $t("add_product.extra_edit.physical.sub_title") }}
          </v-list-subheader>
        </div>
        <div class="widget-box mb-5">
          <b-product-extra-input
            v-model:bulk="bulk"
            :class="{ disabled: add_by_dropShipping }"
            :default-lead-time="lead"
            :extra="extra"
            :shop="shop"
            class="mb-5"
            has-bulk-action
            @onLeadChange="
              (value) => {
                lead = value;
              }
            "
          />
        </div>
        <div class="widget-box mb-5">
          <u-widget-header
            :title="
              $t('add_product.extra_edit.order_limit.title') +
              (limit_min ? ` | Min: ${limit_min}` : '') +
              (limit_max ? ` | Max: ${limit_max}` : '')
            "
            icon="running_with_errors"
          ></u-widget-header>
          <v-list-subheader>
            {{ $t("add_product.extra_edit.order_limit.subtitle") }}
          </v-list-subheader>

          <v-slide-y-reverse-transition leave-absolute>
            <div v-if="!limit_min" class="widget-buttons mt-1">
              <v-btn
                size="x-large"
                variant="flat"
                @click="limit_min = Math.ceil(Math.max(100, limit_max) / 10)"
              >
                <div class="d-flex flex-column align-center">
                  <b>{{ $t("add_product.extra_edit.order_limit.no_limit") }}</b>
                  <small class="mt-1">{{
                    $t(
                      "add_product.extra_edit.order_limit.minimum_purchase_quantity",
                    )
                  }}</small>
                </div>
              </v-btn>
            </div>

            <u-number-input
              v-else
              v-model="limit_min"
              class="mx-auto mt-5"
              clearable
              flat
              hide-details
              label="Minimum purchase quantity"
              rounded="lg"
              variant="solo"
            ></u-number-input>
          </v-slide-y-reverse-transition>
          <v-slide-y-reverse-transition leave-absolute>
            <div v-if="!limit_max" class="widget-buttons mt-1">
              <v-btn
                size="x-large"
                variant="flat"
                @click="limit_max = Math.max(10, limit_min) * 10"
              >
                <div class="d-flex flex-column align-center">
                  <b>{{ $t("add_product.extra_edit.order_limit.no_limit") }}</b>
                  <small class="mt-1">{{
                    $t(
                      "add_product.extra_edit.order_limit.maximum_purchase_quantity",
                    )
                  }}</small>
                </div>
              </v-btn>
            </div>
            <u-number-input
              v-else
              v-model="limit_max"
              class="mx-auto mt-5"
              clearable
              flat
              hide-details
              label="Maximum purchase quantity"
              rounded="lg"
              variant="solo"
            ></u-number-input>
          </v-slide-y-reverse-transition>

          <v-expand-transition>
            <div v-if="limit_min > product.quantity">
              <v-alert class="small" color="red" text type="error"
                >Your inventory (<b>{{ product.quantity }}</b
                >) is currently lower than the minimum order limit, so your
                product is unavailable for purchase.
              </v-alert>
            </div>
          </v-expand-transition>
        </div>
      </template>

      <s-widget-buttons
        v-if="!externalActionButtons"
        auto-fixed-position
        class="my-5"
      >
        <v-btn
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="setExtraInfo()"
          v-ctrl.s="
            () => {
              setExtraInfo();
            }
          "
        >
          {{ $t("global.actions.save_continue") }}

          <v-icon class="ms-2" size="small">
            {{ $t("icons.arrow_end") }}
          </v-icon>
        </v-btn>
      </s-widget-buttons>
    </template>
  </div>
</template>

<script lang="ts">
import BProductExtraInput from "../../extra/input/BProductExtraInput.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType.ts";
import BProductEditInfoIcon from "../info/BProductEditInfoIcon.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductEditExtra",
  mixins: [],
  components: {
    SWidgetButtons,
    UNumberInput,
    BProductExtraInput,
    BProductEditInfoIcon,
  },
  props: {
    modern: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    parentBusy: { type: Boolean, default: false },
    externalActionButtons: {
      type: Boolean,
      default: false,
    },
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    ProductType: ProductType,

    busy: false,
    bulk: false,

    limit_min: 0,
    limit_max: 0,

    extra: {},
    lead: null,
    savedSnapshot: "",
    serviceDialogOpen: false,
    disposed: false,
  }),

  computed: {
    workspaceBusy() {
      return this.busy || this.parentBusy;
    },
    hasUnsavedChanges() {
      return (
        this.modern &&
        !this.add_by_dropShipping &&
        (this.savedSnapshot !== this.captureSnapshot() || this.bulk)
      );
    },
    canonicalSnapshot() {
      return this.shippingSnapshot(
        this.product.extra,
        this.product.lead,
        this.product.limit_min,
        this.product.limit_max,
      );
    },
    invalidMeasurements() {
      return ["weight", "width", "length", "height"].some((key) => {
        const value = Number(this.extra[key] ?? 0);
        return (
          !Number.isFinite(value) ||
          value < 0 ||
          Math.abs(value * 1000 - Math.round(value * 1000)) > 1e-7 ||
          (key === "weight" && value > 10000)
        );
      });
    },
    invalidLead() {
      return (
        !Number.isInteger(Number(this.lead)) ||
        Number(this.lead) < -1 ||
        Number(this.lead) > 2147483647
      );
    },
    invalidLimits() {
      const min = Number(this.limit_min ?? 0),
        max = Number(this.limit_max ?? 0);
      return (
        !Number.isInteger(min) ||
        !Number.isInteger(max) ||
        min < 0 ||
        max < 0 ||
        (max > 0 && max < min)
      );
    },
    stockBelowMinimum() {
      return Number(this.limit_min) > Number(this.product.quantity);
    },
    limitsDigest() {
      if (this.add_by_dropShipping)
        return this.$t("add_product.shipping_modern.inherited_digest");
      if (this.invalidLimits)
        return this.$t("add_product.shipping_modern.invalid_limits");
      const min = Number(this.limit_min || 0),
        max = Number(this.limit_max || 0);
      const digest = this.$t(
        "add_product.shipping_modern." +
          (min && max
            ? "both_limits"
            : min
              ? "minimum_digest"
              : max
                ? "maximum_digest"
                : "no_limits"),
        { min: this.formatQuantity(min), max: this.formatQuantity(max) },
      );
      return (
        digest +
        (this.stockBelowMinimum
          ? " · " + this.$t("add_product.shipping_modern.stock_below")
          : "")
      );
    },
    saveBlocked() {
      return (
        this.modern &&
        (!this.active ||
          this.workspaceBusy ||
          this.serviceDialogOpen ||
          (!this.add_by_dropShipping &&
            (this.invalidMeasurements ||
              this.invalidLead ||
              this.invalidLimits)))
      );
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
  },

  watch: {
    active(value) {
      if (this.modern && !value) this.$refs.shippingInput?.closeDialogs?.();
    },
    product() {
      if (!this.modern) this.assign();
    },
    "product.id"() {
      if (this.modern) {
        this.$refs.shippingInput?.closeDialogs?.();
        this.assign();
      }
    },
    canonicalSnapshot(value) {
      if (!this.modern || this.busy) return;
      if (!this.hasUnsavedChanges) this.assign();
      else this.savedSnapshot = value;
    },
  },

  created() {
    this.assign();
  },
  beforeUnmount() {
    this.disposed = true;
  },

  methods: {
    assign() {
      this.extra = {};
      if (this.isObject(this.product.extra))
        this.extra = Object.assign({}, this.product.extra);

      this.lead = this.product.lead;

      this.limit_min = this.product.limit_min;
      this.limit_max = this.product.limit_max;
      if (this.modern) {
        for (const key of ["weight", "width", "length", "height"])
          this.extra[key] = this.extra[key] ?? 0;
        this.lead = this.lead ?? 0;
        this.limit_min = this.limit_min ?? 0;
        this.limit_max = this.limit_max ?? 0;
        this.bulk = false;
        this.markSaved();
      }
    },
    shippingSnapshot(extra, lead, min, max) {
      return JSON.stringify({
        extra: Object.fromEntries(
          ["weight", "width", "length", "height"].map((key) => [
            key,
            Number(extra?.[key] ?? 0),
          ]),
        ),
        lead: Number(lead ?? 0),
        limit_min: Number(min ?? 0),
        limit_max: Number(max ?? 0),
      });
    },
    captureSnapshot() {
      return this.shippingSnapshot(
        this.extra,
        this.lead,
        this.limit_min,
        this.limit_max,
      );
    },
    markSaved() {
      this.savedSnapshot = this.captureSnapshot();
    },
    discardChanges() {
      if (
        !this.modern ||
        this.workspaceBusy ||
        this.serviceDialogOpen ||
        this.add_by_dropShipping ||
        !this.savedSnapshot
      )
        return;
      const saved = JSON.parse(this.savedSnapshot);
      this.extra = { ...(this.product.extra || {}), ...saved.extra };
      this.lead = saved.lead;
      this.limit_min = saved.limit_min;
      this.limit_max = saved.limit_max;
      this.bulk = false;
    },
    formatQuantity(value) {
      return Number(value || 0).toLocaleString(
        this.$vuetify?.locale?.isRtl ? "fa-IR" : "en-US",
        { maximumFractionDigits: 3 },
      );
    },
    prepareSave() {
      if (!this.modern) return true;
      if (
        !this.add_by_dropShipping &&
        this.invalidLimits &&
        this.$refs.limitsPanel
      )
        this.$refs.limitsPanel.open = true;
      if (!this.add_by_dropShipping && this.invalidLead)
        this.$refs.shippingInput?.revealPreparation?.();
      return (
        !this.saveBlocked && this.$refs.shippingInput?.prepareSave?.() !== false
      );
    },

    setExtraInfo() {
      if (!this.prepareSave()) return;
      if (this.add_by_dropShipping) {
        this.$emit("next");
        return;
      }

      this.busy = true;
      const submittedProduct = this.product;
      const submittedId = this.product.id;

      return axios
        .put(
          this.IS_VENDOR_PANEL
            ? window.VAPI.PUT_MY_VENDOR_PRODUCT_EXTRA(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.PUT_PRODUCT_EXTRA(
                this.product.shop_id,
                this.product.id,
              ),
          {
            extra: {
              weight: this.extra.weight,
              width: this.extra.width,
              length: this.extra.length,
              height: this.extra.height,
            },
            lead: this.lead,

            limit_min: this.limit_min,
            limit_max: this.limit_max,

            bulk: this.bulk, // true: Set same for all variants
          },
        )
        .then(({ data }) => {
          if (
            this.modern &&
            (this.disposed ||
              this.product !== submittedProduct ||
              this.product.id !== submittedId)
          )
            return;
          if (!data.error) {
            NotificationService.showSuccessAlert(
              this.$t("add_product.extra_edit.notifications.save_title"),
              this.$t("add_product.extra_edit.notifications.save_msg"),
            );

            this.product.extra = data.extra;
            this.product.lead = data.lead;

            this.product.limit_min = data.limit_min;
            this.product.limit_max = data.limit_max;

            if (data.bulk && this.product.product_variants) {
              // Variants have been updated because of bulk action
              this.product.product_variants.forEach((variant) => {
                Object.assign(variant, {
                  extra: data.extra,
                  lead: data.lead,
                });
              });
            }

            if (this.modern) this.assign();

            this.$emit("next");
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
  },
};
</script>

<style lang="scss" scoped>
.b-product-edit-extra--modern {
  max-width: 760px;
  width: 100%;
  margin-inline: auto;
  color: inherit;
  font-size: 13px;
  line-height: 20px;
  .b-product-edit-extra__inherited {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-block-end: 16px;
    > svg {
      flex-shrink: 0;
      margin-block-start: 2px;
      color: var(--sd-modern-muted);
    }
    strong {
      font-size: 13px;
      font-weight: 500;
    }
    p {
      margin: 4px 0 0;
      font-size: 12px;
      line-height: 19px;
      color: var(--sd-modern-muted);
    }
  }
  .b-product-edit-extra__limits {
    padding: 0;
    border-radius: 16px;
    margin-block-end: 16px;
  }
  summary {
    box-sizing: border-box;
    list-style: none;
    min-height: 84px;
    padding: 19px 23px;
    gap: 12px;
    > svg {
      flex-shrink: 0;
      color: var(--sd-modern-muted);
    }
  }
  summary::-webkit-details-marker {
    display: none;
  }
  .b-product-edit-extra__summary {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    > span {
      font-size: 14px;
      font-weight: 500;
      line-height: 21px;
    }
    > small {
      font-size: 12px;
      line-height: 18px;
      color: var(--sd-modern-muted);
      overflow-wrap: anywhere;
    }
  }
  details[open] > summary {
    min-height: 69px;
    padding-block-end: 12px;
    .b-product-edit-extra__summary > span {
      font-size: 16px;
      line-height: 24px;
    }
    small {
      display: none;
    }
    > svg:last-child {
      transform: rotate(180deg);
    }
  }
  .b-product-edit-extra__body {
    box-sizing: border-box;
    padding: 0 23px 23px;
  }
  .b-product-edit-extra__subtitle {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-block-end: 20px;
    p {
      flex: 1;
      min-width: 0;
      margin: 0;
      font-size: 12px;
      line-height: 19px;
      color: var(--sd-modern-muted);
    }
  }
  .b-product-edit-extra__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 23px;
  }
  .b-product-edit-extra__message {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 17px 0 0;
    font-size: 12px;
    line-height: 19px;
    > svg {
      flex-shrink: 0;
      margin-block-start: 2px;
      color: rgb(var(--v-theme-warning));
    }
  }
  .b-product-edit-extra__footer {
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
  .b-product-edit-extra__actions {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-shrink: 0;
  }
  :deep(.sd-modern-button) {
    font-size: 13px;
    line-height: 20px;
  }
  :deep(
    .sd-modern-underlined-field
      .v-field.v-field--variant-underlined
      .v-field__input
  ) {
    font-family: inherit;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
  }
  :deep(.sd-modern-underlined-field .v-messages),
  :deep(.sd-modern-underlined-field .v-messages__message) {
    font-size: 12px;
    line-height: 19px;
  }
  &:dir(rtl) .b-product-edit-extra__direction {
    transform: scaleX(-1);
  }
  @media (max-width: 880px) and (min-width: 721px) {
    .b-product-edit-extra__footer {
      flex-wrap: wrap;
    }
    .b-product-edit-extra__actions {
      margin-inline-start: auto;
    }
  }
  @media (max-width: 720px) {
    summary {
      padding-inline: 19px;
    }
    .b-product-edit-extra__body {
      padding-inline: 19px;
    }
  }
  @media (max-width: 600px) {
    .b-product-edit-extra__fields {
      grid-template-columns: minmax(0, 1fr);
      gap: 24px;
    }
    .b-product-edit-extra__footer {
      flex-wrap: wrap;
      > div:first-child {
        flex-basis: 100%;
      }
    }
    .b-product-edit-extra__actions {
      flex: 1 1 100%;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    :deep(
      .sd-modern-underlined-field
        .v-field.v-field--variant-underlined
        .v-field__input
    ) {
      font-size: 16px;
    }
  }
  @media (max-width: 360px) {
    summary {
      padding-inline: 15px;
      gap: 9px;
    }
    .b-product-edit-extra__body {
      padding-inline: 15px;
    }
    .b-product-edit-extra__actions > .sd-modern-button--primary {
      width: 100%;
    }
  }
}
</style>
