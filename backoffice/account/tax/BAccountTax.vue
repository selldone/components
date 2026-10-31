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
  <details
    v-if="modern"
    :open="!autoCollapse || !collapsed"
    class="b-account-tax b-account-tax--modern text-start"
    @toggle="collapsed = !$event.target.open"
  >
    <summary class="b-account-tax__summary">
      <v-icon size="18" aria-hidden="true">receipt_long</v-icon>
      <span class="b-account-tax__summary-copy">
        <span>{{ $t("account_page.deposit.modern.billing") }}</span>
        <span class="b-account-tax__caption">{{
          $t(
            `account_page.deposit.modern.${business ? "business" : "personal"}`,
          )
        }}</span>
      </span>
      <v-icon class="b-account-tax__chevron" size="18" aria-hidden="true"
        >expand_more</v-icon
      >
    </summary>

    <div class="b-account-tax__content">
      <u-smart-switch
        v-if="!readOnly"
        v-model="business"
        class="sd-modern-smart-select"
        border
        accessible
        :aria-label="$t('account_page.deposit.modern.billing')"
        :false-title="$t('account_page.deposit.modern.personal')"
        :true-title="$t('account_page.deposit.modern.business')"
        false-icon="person"
        true-icon="business"
      />

      <b-company-input
        v-if="business"
        v-model="company_id"
        :read-only="readOnly"
        :return-object="false"
        auto-select-first
        has-add
        class="b-account-tax__company"
      />
      <div v-else class="b-account-tax__person">
        <v-avatar size="32" class="me-2">
          <v-img :src="getUserAvatar(USER().id)" />
        </v-avatar>
        <div class="b-account-tax__identity">
          <span>{{ USER().name }}</span>
          <bdi class="b-account-tax__caption" dir="ltr">{{ USER().email }}</bdi>
        </div>
      </div>

      <div
        v-if="hasVatCalculation"
        class="b-account-tax__calculation"
        aria-live="polite"
      >
        <div
          v-if="calculation_state === 'loading'"
          class="sd-modern-notice sd-modern-notice--plain"
          role="status"
        >
          <v-progress-circular
            indeterminate
            :size="16"
            :width="2"
            class="sd-modern-notice__icon"
          />
          <span class="sd-modern-notice__content">{{
            $t("account_page.deposit.modern.vat_loading")
          }}</span>
        </div>
        <div
          v-else-if="calculation_state === 'error'"
          class="sd-modern-notice"
          role="alert"
        >
          <v-icon size="18" color="warning" aria-hidden="true"
            >error_outline</v-icon
          >
          <span class="sd-modern-notice__content">{{
            $t("account_page.deposit.modern.vat_error")
          }}</span>
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            @click="calculateVat()"
          >
            {{ $t("account_page.deposit.modern.retry") }}
          </v-btn>
        </div>
        <template v-else-if="calculation_state === 'ready'">
          <div class="b-account-tax__vat">
            <span>{{ $t("account_page.deposit.modern.vat") }}</span>
            <bdi dir="ltr">{{ calculated_vat_percent }}%</bdi>
          </div>
          <p class="b-account-tax__caption">
            {{
              $t(
                `account_page.deposit.modern.${calculated_vat_percent > 0 ? "vat_collected" : "vat_not_collected"}`,
              )
            }}
          </p>
        </template>
      </div>

      <slot v-if="business" name="append-inner"></slot>
      <v-btn
        v-else
        :to="{ name: 'BPageShuttleIdentity' }"
        class="sd-modern-button sd-modern-button--inline"
        color="primary"
        variant="text"
        prepend-icon="how_to_reg"
        >{{ $t("account_page.deposit.modern.personal_edit") }}</v-btn
      >
    </div>
  </details>
  <div v-else class="py-5">
    <v-expand-transition>
      <div v-if="!collapsed || !autoCollapse">
        <u-smart-switch
          v-model="business"
          :force-show-all="!readOnly"
          :readonly="readOnly"
          class="mt-3 mb-8"
          false-description="This wallet is designated for personal use. Billing will be based on your individual information."
          false-icon="person"
          false-title="Person"
          true-description="This wallet is designated for business use. Billing will be set based on your company's details."
          true-icon="business"
          true-title="Business"
        >
        </u-smart-switch>
      </div>
    </v-expand-transition>

    <v-expand-transition>
      <div v-if="business">
        <div class="d-flex align-center">
          <b-company-input
            v-model="company_id"
            :readOnly="readOnly"
            :return-object="false"
            :variant="readOnly ? 'underlined' : 'plain'"
            auto-select-first
            class="flex-grow-1"
            has-add
          ></b-company-input>
          <v-btn
            v-if="autoCollapse"
            class="border-start ms-2"
            height="52"
            rounded="0"
            title="View more details..."
            variant="text"
            width="52"
            @click="collapsed = !collapsed"
          >
            <v-icon :class="{ 'rotate-180': !collapsed }" size="32"
              >expand_more
            </v-icon>
          </v-btn>
        </div>
      </div>
    </v-expand-transition>

    <v-expand-transition>
      <div v-if="!business">
        <div class="d-flex align-center text-start">
          <v-avatar class="me-2 avatar-gradient -thin" size="38">
            <v-img :src="getUserAvatar(USER().id)"></v-img>
          </v-avatar>
          <div class="flex-grow-1">
            <b>{{ USER().name }}</b>
            <small class="d-block">{{ USER().email }}</small>
          </div>

          <v-btn
            v-if="autoCollapse"
            class="ms-2 border-start"
            height="52"
            rounded="0"
            title="View more details..."
            variant="text"
            width="52"
            @click="collapsed = !collapsed"
          >
            <v-icon :class="{ 'rotate-180': !collapsed }" size="32"
              >expand_more
            </v-icon>
          </v-btn>
        </div>

        <v-fade-transition hide-on-leave>
          <div v-if="!collapsed" class="text-end pt-2">
            <v-btn
              :to="{ name: 'BPageShuttleIdentity' }"
              class="tnt"
              color="primary"
              variant="text"
            >
              <v-icon class="me-1" size="small">how_to_reg</v-icon>
              Edit Personal Information
            </v-btn>
          </div>
        </v-fade-transition>
      </div>
    </v-expand-transition>

    <v-expand-transition>
      <div v-if="!collapsed || !autoCollapse">
        <div
          v-if="hasVatCalculation"
          :class="{ blurred: busy }"
          class="d-flex align-center text-start py-3 blur-animate"
        >
          <span class="text-h4 font-weight-thin me-4"
            >{{ calculated_vat_percent }}%</span
          >

          <div class="flex-grow-1">
            <b class="d-block"
              >VAT — {{ business ? "Business" : "Individual" }}</b
            >
            <small>{{
              calculated_vat_percent > 0
                ? "We compute and remit this VAT to the Danish Tax Authority."
                : "Under Denmark/EU tax regulations, we do not collect VAT from you."
            }}</small>
          </div>
        </div>
        <slot name="append-inner"></slot>
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import BCompanyInput from "../../company/input/BCompanyInput.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BAccountTax",
  mixins: [],
  components: { USmartSwitch, BCompanyInput },
  emits: [
    "update:modelValue",
    "update:business",
    "update:vatPercent",
    "update:calculationState",
  ],
  props: {
    modelValue: {},
    hasVatCalculation: { type: Boolean },
    readOnly: { type: Boolean },
    vatPercent: { default: 0 },
    autoCollapse: { type: Boolean },
    modern: Boolean,
  },

  data: () => ({
    company_id: null,

    business: false,

    collapsed: false,

    //----------------------
    calculated_vat_percent: null,
    busy: false,
    last_company_id: -1, // Force load first time and prevent duplicated calls!
    calculation_state: "idle",
    vat_request: 0,
  }),

  computed: {},

  watch: {
    calculation_state(value) {
      this.$emit("update:calculationState", value);
    },
    business(business) {
      this.$emit("update:business", business);

      if (business) this.$emit("update:modelValue", this.company_id);
      else this.$emit("update:modelValue", null);
    },

    company_id(company_id) {
      this.$emit("update:modelValue", company_id);
      this.calculateVat();
    },
    modelValue(value) {
      this.company_id = value;
    },
  },
  created() {
    this.company_id = this.modelValue;
    this.business = !!this.modelValue;

    this.collapsed = this.autoCollapse;

    this.calculateVat();
  },

  beforeUnmount() {
    this.vat_request++;
  },

  methods: {
    calculateVat() {
      if (
        !this.hasVatCalculation ||
        (this.last_company_id === this.company_id &&
          this.calculation_state !== "error")
      )
        return;

      const request = ++this.vat_request;
      this.last_company_id = this.company_id;
      this.busy = true;
      this.calculation_state = "loading";
      axios
        .post(window.API.POST_CALCULATE_SELLDONE_VAT(), {
          company_id: this.company_id,
        })
        .then(({ data }) => {
          if (request !== this.vat_request) return;
          if (
            !data.error &&
            typeof data.percent === "number" &&
            Number.isFinite(data.percent) &&
            data.percent >= 0
          ) {
            this.calculated_vat_percent = data.percent;
            this.$emit("update:vatPercent", data.percent);
            this.calculation_state = "ready";
          } else {
            this.calculation_state = "error";
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (request !== this.vat_request) return;
          this.calculation_state = "error";
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (request === this.vat_request) this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-account-tax--modern {
  margin-block: 20px;
  font-size: 13px;
  line-height: 20px;

  .b-account-tax__summary {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 64px;
    padding-block: 14px;
    list-style: none;
    cursor: pointer;

    &::-webkit-details-marker {
      display: none;
    }
  }

  .b-account-tax__summary-copy,
  .b-account-tax__identity {
    display: grid;
    min-width: 0;
  }
  .b-account-tax__summary:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
  .b-account-tax__summary-copy {
    flex: 1;
  }
  .b-account-tax__caption {
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  .b-account-tax__content {
    display: grid;
    gap: 14px;
    padding-block: 0 16px;
  }
  .b-account-tax__content > :deep(.v-btn) {
    justify-self: start;
  }
  .b-account-tax__person {
    display: flex;
    align-items: center;
    min-width: 0;
  }
  .b-account-tax__identity {
    overflow-wrap: anywhere;
  }
  .b-account-tax__vat {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-block-end: 4px;
  }
  .b-account-tax__calculation {
    min-width: 0;
  }
  .b-account-tax__calculation p {
    margin: 0;
  }
  .b-account-tax__chevron {
    color: var(--sd-modern-muted);
  }
  &[open] > summary .b-account-tax__chevron {
    transform: rotate(180deg);
  }

  .b-account-tax__company {
    min-width: 0;
    :deep(b) {
      font-size: 13px;
      line-height: 20px;
      font-weight: 500;
    }
    :deep(.small) {
      font-size: 13px;
      line-height: 20px;
      overflow-wrap: anywhere;
    }
  }
}
</style>
