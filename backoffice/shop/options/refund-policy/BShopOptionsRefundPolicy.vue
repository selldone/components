<template>
  <div :class="modern ? 'flow-refund-policy' : 'widget-box mb-5'">
    <template v-if="modern">
      <div class="sd-modern-widget flow-refund-policy__widget">
        <div class="sd-modern-title flow-refund-policy__heading">
          <v-icon
            icon="undo"
            size="18"
            class="flow-refund-policy__heading-icon"
          />
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("shop_configuration.flow_modern.refund.title") }}
            </h2>
            <div class="flow-refund-policy__subtitle">
              <span>{{
                $t("shop_configuration.flow_modern.refund.subtitle")
              }}</span
              ><v-tooltip
                :text="$t('shop_configuration.flow_modern.refund.help')"
                content-class="sd-modern-tooltip text-start"
                location="top"
                open-on-click
                ><template #activator="{ props }"
                  ><v-btn
                    v-bind="props"
                    class="sd-modern-icon-button sd-modern-info-button"
                    :aria-label="
                      $t('shop_configuration.flow_modern.refund.help_label')
                    "
                    icon="info_outline"
                    variant="text" /></template
              ></v-tooltip>
            </div>
          </div>
        </div>
        <div class="flow-refund-policy__split">
          <div>
            <p class="flow-refund-policy__label">
              {{ $t("shop_configuration.flow_modern.refund.availability") }}
            </p>
            <u-smart-switch
              v-model="enable"
              :accessible="modern"
              class="flow-refund-policy__switch"
              :disabled="!canWrite || busy"
              :false-description="
                $t('shop_configuration.flow_modern.refund.disabled_hint')
              "
              :false-title="
                $t('shop_configuration.flow_modern.refund.disabled')
              "
              :true-description="
                $t('shop_configuration.flow_modern.refund.enabled_hint')
              "
              :true-title="$t('shop_configuration.flow_modern.refund.enabled')"
              @change="markChanged"
              @update:model-value="markChanged"
              false-gray
            />
          </div>
          <div class="flow-refund-policy__period">
            <v-text-field
              v-model.number="days"
              class="sd-modern-underlined-field"
              :label="$t('shop_configuration.flow_modern.refund.period')"
              :disabled="!enable || !canWrite || busy"
              :messages="$t('shop_configuration.flow_modern.refund.days_hint')"
              max="365"
              min="1"
              type="number"
              variant="underlined"
              @update:model-value="markChanged"
            />
          </div>
        </div>
        <div class="flow-refund-policy__details">
          <div class="flow-refund-policy__details-heading">
            <h3>{{ $t("shop_configuration.flow_modern.refund.details") }}</h3>
            <v-btn
              class="sd-modern-button"
              :disabled="!canWrite || busy"
              prepend-icon="edit_note"
              variant="text"
              @click="openPolicyDialog"
              >{{
                $t(
                  text
                    ? "shop_configuration.flow_modern.refund.edit_details"
                    : "shop_configuration.flow_modern.refund.add_details",
                )
              }}</v-btn
            >
          </div>
          <p class="flow-refund-policy__summary">
            {{
              policyPreview ||
              $t("shop_configuration.flow_modern.refund.no_details")
            }}
          </p>
        </div>
        <div class="sd-modern-notice flow-refund-policy__notice">
          <v-icon icon="info_outline" size="17" /><span>{{
            $t("shop_configuration.flow_modern.refund.eligibility")
          }}</span>
        </div>
      </div>
      <div class="flow-refund-policy__actions">
        <v-btn
          class="sd-modern-button"
          :disabled="!changed || !canWrite"
          :loading="busy"
          color="primary"
          append-icon="arrow_forward"
          @click="savePolicy"
          >{{ $t("shop_configuration.flow_modern.refund.save") }}</v-btn
        >
      </div>
    </template>
    <template v-else>
      <u-widget-header icon="assignment_return" title="Refund policy" />

      <v-list-subheader>
        Configure the customer withdrawal window and the policy text shown in
        the storefront order page.
      </v-list-subheader>

      <div class="d-flex flex-column ga-4 mt-3">
        <div>
          <u-smart-switch
            v-model="enable"
            :disabled="!canWrite"
            false-description="Customers will not see the withdrawal action."
            false-title="Withdrawal disabled"
            true-description="Eligible paid orders can be withdrawn by customers."
            true-title="Withdrawal enabled"
            @change="markChanged"
            @update:model-value="markChanged"
            false-gray
          />
        </div>

        <hr />
        <u-widget-header icon="event_repeat" title="Withdrawal period" />
        <v-list-subheader>
          Default legal withdrawal period is 14 days.
        </v-list-subheader>

        <v-text-field
          v-model.number="days"
          :disabled="!enable || !canWrite"
          hide-details="auto"
          max="365"
          min="1"
          suffix="days"
          type="number"
          variant="outlined"
          @update:model-value="markChanged"
        />

        <hr />

        <u-widget-header icon="article" title="Policy details" />
        <v-list-subheader>
          Shown to customers in the order withdrawal section.
        </v-list-subheader>

        <div class="policy-preview mt-3">
          <template v-if="policyPreview">
            {{ policyPreview }}
          </template>
          <span v-else class="text-disabled">
            No policy details have been added yet.
          </span>

          <v-btn
            class="ms-3"
            :disabled="!canWrite"
            color="#111"
            prepend-icon="edit_note"
            variant="flat"
            size="small"
            @click="openPolicyDialog"
          >
            {{ text ? "Edit details" : "Add details" }}
          </v-btn>
        </div>
      </div>

      <div class="d-flex align-start mt-4 text-medium-emphasis text-subtitle-2">
        <v-icon class="me-2 mt-1" color="#111" icon="info" size="18" />
        <span>
          Automatic withdrawal is shown only when the order is paid, still
          inside this window, and the payment gateway supports automatic refund.
        </span>
      </div>

      <div class="widget-buttons mt-5">
        <v-btn
          :disabled="!changed || !canWrite"
          :loading="busy"
          block
          color="primary"
          prepend-icon="save"
          size="x-large"
          @click="savePolicy"
        >
          Save refund policy
        </v-btn>
      </div>
    </template>
    <v-dialog v-model="policyDialog" :max-width="modern ? 700 : 680">
      <v-card
        :class="{ 'sd-modern-widget flow-refund-policy__dialog': modern }"
      >
        <v-card-title class="d-flex align-center">
          <v-icon v-if="!modern" class="me-2" icon="edit_note" />
          {{
            modern
              ? $t("shop_configuration.flow_modern.refund.details")
              : "Refund policy details"
          }}
          <v-spacer v-if="modern" /><v-tooltip
            v-if="modern"
            :text="$t('global.actions.close')"
            content-class="sd-modern-tooltip text-start"
            location="top"
            ><template #activator="{ props }"
              ><v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                :aria-label="$t('global.actions.close')"
                icon="close"
                variant="text"
                @click="policyDialog = false" /></template
          ></v-tooltip>
        </v-card-title>
        <p v-if="modern" class="flow-refund-policy__dialog-subtitle">
          {{ $t("shop_configuration.flow_modern.refund.dialog_subtitle") }}
        </p>

        <v-card-text>
          <div
            class="d-flex mb-3"
            :class="modern ? 'justify-start' : 'justify-end'"
          >
            <v-btn
              :color="modern ? undefined : '#111'"
              prepend-icon="auto_fix_high"
              size="small"
              :variant="modern ? 'text' : 'tonal'"
              :class="{ 'sd-modern-button': modern }"
              @click="loadDefaultPolicy"
            >
              {{
                modern
                  ? $t("shop_configuration.flow_modern.refund.load_default")
                  : "Load default policy"
              }}
            </v-btn>
          </div>

          <v-textarea
            v-model="draftText"
            auto-grow
            clearable
            counter="20000"
            hide-details="auto"
            :label="
              modern
                ? $t('shop_configuration.flow_modern.refund.policy_text')
                : 'Policy text shown to customers'
            "
            :placeholder="
              modern
                ? $t('shop_configuration.flow_modern.refund.text_placeholder')
                : 'Explain refund eligibility, withdrawal handling, exceptions, and return instructions.'
            "
            rows="9"
            :variant="modern ? 'underlined' : 'outlined'"
            :class="{ 'sd-modern-underlined-field': modern }"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            :class="{ 'sd-modern-button': modern }"
            variant="text"
            @click="policyDialog = false"
            >{{ modern ? $t("global.actions.cancel") : "Cancel" }}</v-btn
          >
          <v-btn
            :class="{ 'sd-modern-button': modern }"
            :variant="modern ? 'flat' : undefined"
            color="primary"
            @click="confirmPolicyText"
          >
            {{
              modern
                ? $t("shop_configuration.flow_modern.refund.confirm_details")
                : "Confirm details"
            }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import USmartSwitch from "@selldone/components-vue/ui/smart/switch/USmartSwitch.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

export default defineComponent({
  name: "BShopOptionsRefundPolicy",

  components: { UWidgetHeader, USmartSwitch },

  props: {
    modern: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
  },

  data() {
    return {
      ShopPermissionRegions,
      defaultPolicyText:
        "You may withdraw this order within the stated withdrawal period. If eligible, the paid amount will be refunded to the original payment method. Returned items must be unused, complete, and in their original condition unless local consumer law provides otherwise.",
      busy: false,
      changed: false,
      enable: false,
      days: 14,
      text: "" as string | null,
      draftText: "",
      policyDialog: false,
    };
  },

  computed: {
    canWrite(): boolean {
      return (
        !this.readOnly &&
        !!(this as any).writeShopAccess?.(ShopPermissionRegions.SETTINGS.code)
      );
    },

    policyPreview(): string | null {
      const value = this.text?.trim();
      if (!value) return null;

      const preview = value.replace(/\s+/g, " ").slice(0, 180);
      return value.length > 180 ? `${preview}...` : preview;
    },
  },

  watch: {
    shop: {
      deep: true,
      immediate: true,
      handler() {
        this.syncFromShop();
      },
    },
  },

  methods: {
    syncFromShop() {
      const policy = ShopOptionsHelper.GetRefundPolicy(this.shop as any);
      this.enable = !!policy.enable;
      this.days = Number(policy.days || 14);
      this.text = policy.text || "";
      this.draftText = this.text || "";
      this.changed = false;
    },

    markChanged() {
      this.changed = true;
    },

    normalizedDays(): number {
      return Math.max(1, Math.min(365, Number(this.days || 14)));
    },

    openPolicyDialog() {
      this.draftText = this.text || "";
      this.policyDialog = true;
    },

    confirmPolicyText() {
      this.text = this.draftText?.trim() || "";
      this.policyDialog = false;
      this.markChanged();
    },

    loadDefaultPolicy() {
      this.draftText = this.defaultPolicyText;
    },

    savePolicy() {
      if (!this.canWrite || this.busy) return;
      const value = {
        enable: !!this.enable,
        days: this.normalizedDays(),
        text: this.text?.trim() || null,
      };

      this.busy = true;
      axios
        .post(
          window.API.POST_SET_SHOP_OPTIONS_REFUND_POLICY((this.shop as any).id),
          {
            value,
          },
        )
        .then(() => {
          const shop = this.shop as any;
          if (!Array.isArray(shop.options)) shop.options = [];

          const option = shop.options.find(
            (item: Record<string, unknown>) => item.code === "refund_policy",
          );

          if (option) {
            option.value = value;
          } else {
            shop.options.push({
              code: "refund_policy",
              value,
            });
          }

          this.syncFromShop();
          NotificationService.showSuccessAlert(
            null,
            "Refund policy has been updated.",
          );
        })
        .catch((error: unknown) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
});
</script>
<style lang="scss" scoped>
.flow-refund-policy {
  .flow-refund-policy__heading {
    margin-block-end: 25px;
  }
  .flow-refund-policy__heading-icon {
    flex: 0 0 18px;
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
  }
  .flow-refund-policy__subtitle {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.55;
  }
  .flow-refund-policy__split {
    display: grid;
    grid-template-columns: minmax(260px, 0.85fr) minmax(0, 1.15fr);
    gap: 28px;
  }
  .flow-refund-policy__label {
    margin: 0 0 12px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
  }
  .flow-refund-policy__period {
    padding-inline-start: 28px;
    border-inline-start: 1px solid var(--sd-modern-border);
  }
  .flow-refund-policy__period > .v-input {
    max-width: 280px;
    margin-block-start: 20px;
  }
  .flow-refund-policy__switch :deep(.row-hover) {
    min-height: 76px;
    padding: 15px 14px !important;
    background: var(--sd-modern-inset) !important;
  }
  .flow-refund-policy__switch :deep(b) {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
  }
  .flow-refund-policy__switch :deep(.small) {
    font-size: 12px;
    line-height: 1.5;
  }
  .flow-refund-policy__switch :deep(.circle-check) {
    width: 20px;
    height: 20px;
  }
  .flow-refund-policy__details {
    margin-block-start: 25px;
    padding-block-start: 25px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .flow-refund-policy__details-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-block-end: 10px;
  }
  .flow-refund-policy__details-heading h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
  }
  .flow-refund-policy__summary {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 1.75;
    overflow-wrap: anywhere;
  }
  .flow-refund-policy__notice {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-block-start: 25px;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 12px;
    line-height: 1.65;
  }
  .flow-refund-policy__actions {
    display: flex;
    justify-content: flex-end;
    margin-block-start: 18px;
  }
}
.flow-refund-policy .sd-modern-button,
.flow-refund-policy__dialog .sd-modern-button {
  min-height: 40px;
  height: 40px;
  padding: 0 18px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}
.flow-refund-policy__dialog {
  border-radius: 18px !important;
  > .v-card-title {
    padding: 0;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: -0.15px;
    white-space: normal;
  }
  > .v-card-text {
    padding: 0 !important;
  }
  > .v-card-actions {
    padding: 18px 0 0;
    gap: 10px;
  }
  .flow-refund-policy__dialog-subtitle {
    margin: 5px 0 22px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 1.6;
  }
}
@media (max-width: 800px) {
  .flow-refund-policy {
    .flow-refund-policy__split {
      grid-template-columns: minmax(0, 1fr);
      gap: 24px;
    }
    .flow-refund-policy__period {
      padding-inline-start: 0;
      padding-block-start: 24px;
      border-inline-start: 0;
      border-block-start: 1px solid var(--sd-modern-border);
    }
  }
}
@media (max-width: 600px), (pointer: coarse) {
  .flow-refund-policy .sd-modern-button,
  .flow-refund-policy__dialog .sd-modern-button {
    min-height: 44px;
    height: 44px;
  }
}
@media (max-width: 600px) {
  .flow-refund-policy .flow-refund-policy__period > .v-input { max-width: none; }
  .flow-refund-policy__dialog { padding: 22px 18px; border-radius: 18px; }
}
</style>
