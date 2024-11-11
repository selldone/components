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
  <div class="py-5">
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

export default {
  name: "BAccountTax",
  components: { USmartSwitch, BCompanyInput },
  emits: ["update:modelValue", "update:business", "update:vatPercent"],
  props: {
    modelValue: {},
    hasVatCalculation: { type: Boolean },
    readOnly: { type: Boolean },
    vatPercent: { default: 0 },
    autoCollapse: { type: Boolean },
  },

  data: () => ({
    company_id: null,

    business: false,

    collapsed: false,

    //----------------------
    calculated_vat_percent: null,
    busy: false,
    last_company_id: -1, // Force load first time and prevent duplicated calls!
  }),

  computed: {},

  watch: {
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

  methods: {
    calculateVat() {
      if (!this.hasVatCalculation || this.last_company_id === this.company_id)
        return;

      this.last_company_id = this.company_id;
      this.busy = true;
      axios
        .post(window.API.POST_CALCULATE_SELLDONE_VAT(), {
          company_id: this.company_id,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.calculated_vat_percent = data.percent;
            this.$emit("update:vatPercent", data.percent);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
