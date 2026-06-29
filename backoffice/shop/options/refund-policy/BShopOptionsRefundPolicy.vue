<template>
  <div class="widget-box mb-5">
    <u-widget-header icon="assignment_return" title="Refund policy" />

    <v-list-subheader>
      Configure the customer withdrawal window and the policy text shown in the
      storefront order page.
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

        <hr>
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

      <hr>


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
        Automatic withdrawal is shown only when the order is paid, still inside
        this window, and the payment gateway supports automatic refund.
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

    <v-dialog v-model="policyDialog" max-width="680">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2" icon="edit_note" />
          Refund policy details
        </v-card-title>

        <v-card-text>
          <div class="d-flex justify-end mb-3">
            <v-btn
              color="#111"
              prepend-icon="auto_fix_high"
              size="small"
              variant="tonal"
              @click="loadDefaultPolicy"
            >
              Load default policy
            </v-btn>
          </div>

          <v-textarea
            v-model="draftText"
            auto-grow
            clearable
            counter="20000"
            hide-details="auto"
            label="Policy text shown to customers"
            placeholder="Explain refund eligibility, withdrawal handling, exceptions, and return instructions."
            rows="9"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="policyDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="confirmPolicyText">
            Confirm details
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
      return !!(this as any).writeShopAccess?.(ShopPermissionRegions.SETTINGS.code);
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
      const value = {
        enable: !!this.enable,
        days: this.normalizedDays(),
        text: this.text?.trim() || null,
      };

      this.busy = true;
      axios
        .post(window.API.POST_SET_SHOP_OPTIONS_REFUND_POLICY((this.shop as any).id), {
          value,
        })
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
