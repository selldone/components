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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ██████████████████████ Vendor request form ██████████████████████ -->

  <v-card>
    <v-card-title>
      <v-icon class="me-1">add_business</v-icon>
      Add new vendor
    </v-card-title>
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <v-card-text :class="{ disabled: busy_fetch }">
      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃ Status ▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
      <div v-if="modelValue && modelValue.created_at" class="widget-box mb-5">
        <s-widget-header
          icon="workspaces"
          title="Last status"
        ></s-widget-header>
        <v-list-subheader></v-list-subheader>
        <div class="py-1">
          <div class="min-width-200 my-1">
            <small class="float-end">{{
              $t("global.commons.created_at")
            }}</small>
            {{ getFromNowString(modelValue.created_at) }}<br />
            <small>
              {{ getLocalTimeString(modelValue.created_at) }}
            </small>
          </div>

          <div v-if="modelValue.accepted_at" class="min-width-200 my-1">
            <small class="float-end text-green">{{
              $t("global.status.accepted")
            }}</small>
            <v-icon class="me-1" size="small">subdirectory_arrow_right</v-icon>
            {{ getFromNowString(modelValue.accepted_at) }}<br />
            <small>
              {{ getLocalTimeString(modelValue.accepted_at) }}
            </small>
          </div>

          <div v-else-if="modelValue.rejected_at" class="min-width-200 my-1">
            <small class="float-end text-red">{{
              $t("global.status.rejected")
            }}</small>
            <v-icon class="me-1" size="small">subdirectory_arrow_right</v-icon>
            {{ getFromNowString(modelValue.rejected_at) }}<br />
            <small>
              {{ getLocalTimeString(modelValue.rejected_at) }}
            </small>
          </div>

          <div v-else class="min-width-200 my-1">
            <v-icon class="me-1">hourglass_top</v-icon>
            {{ $t("global.commons.pending") }}...
          </div>
        </div>
      </div>

      <v-form ref="form" lazy-validation>
        <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃ Company information ▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

        <div class="widget-box mb-5">
          <s-widget-header
            icon="business"
            title="Company information"
          ></s-widget-header>
          <v-list-subheader></v-list-subheader>
          <v-text-field
            v-model="company.name"
            :readonly="adminMode"
            :rules="[GlobalRules.required()]"
            label="Company name"
          ></v-text-field>
          <v-text-field
            v-model="company.address"
            :label="$t('global.commons.address')"
            :readonly="adminMode"
            :rules="[GlobalRules.required()]"
          ></v-text-field>
          <v-text-field
            v-model="company.postal_code"
            :label="$t('global.map_view.postal_code')"
            :readonly="adminMode"
          ></v-text-field>
          <v-text-field
            v-model="company.phone"
            :label="$t('global.map_view.phone_input')"
            :readonly="adminMode"
            :rules="[GlobalRules.required()]"
            placeholder="(+45) 2225 6000"
          ></v-text-field>
          <v-text-field
            v-model="company.email"
            :label="$t('global.commons.email')"
            :readonly="adminMode"
            :rules="[GlobalRules.required(), GlobalRules.email()]"
            placeholder="john@sample.com"
          ></v-text-field>
          <v-text-field
            v-model="company.web"
            :label="$t('global.commons.website')"
            :readonly="adminMode"
            :rules="[GlobalRules.url()]"
            placeholder="https://..."
          ></v-text-field>
        </div>
        <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃ Personal information ▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

        <div class="widget-box mb-5">
          <s-widget-header
            icon="person"
            title="Personal information"
          ></s-widget-header>
          <v-list-subheader></v-list-subheader>
          <v-text-field
            v-model="personal.name"
            :label="$t('global.commons.name')"
            :readonly="adminMode"
            :rules="[GlobalRules.required()]"
          ></v-text-field>
        </div>
        <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃ Products Category ▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

        <div class="widget-box mb-5">
          <s-widget-header
            icon="inventory"
            title="Your products"
          ></s-widget-header>
          <v-list-subheader
            >What are the products or items that your company offers for sale?
          </v-list-subheader>

          <v-textarea
            v-model="product.description"
            :readonly="adminMode"
            auto-grow
            placeholder="About your products... Keep it short."
            rows="3"
          ></v-textarea>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Bank info  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <div class="widget-box mb-5">
          <s-widget-header icon="paid" title="Payout Information">
          </s-widget-header>
          <v-list-subheader
            >Input your bank details here for payouts.
          </v-list-subheader>

          <v-text-field
            v-model="bank.name"
            :label="$t('global.commons.bank_name')"
            append-inner-icon="account_balance"
            auto-grow
            hint="The name of the bank where the vendor has their account."
            persistent-placeholder
            placeholder="Your bank name.."
          ></v-text-field>

          <v-text-field
            v-model="bank.account_name"
            :label="$t('global.commons.bank_account_name')"
            hint="This should match the name associated with the bank account."
            persistent-placeholder
            placeholder="Your name.."
          ></v-text-field>

          <v-text-field
            v-model="bank.account_number"
            :label="$t('global.commons.bank_account_number')"
            hint="The vendor's unique account number."
            persistent-placeholder
            placeholder="Your bank account number.."
          ></v-text-field>

          <v-text-field
            v-model="bank.routing_number"
            :label="$t('global.commons.bank_routing_number')"
            hint="This number varies by country. It's used to identify the specific bank branch the vendor uses."
            persistent-placeholder
            placeholder="Your bank routing number, sort code, or BSB number.."
          ></v-text-field>

          <v-text-field
            v-model="bank.iban"
            hint="International Bank Account Number): If the vendor's bank is in Europe or certain other countries."
            label="IBAN"
            persistent-placeholder
            placeholder="Your IBAN number..  eg. DE89 3704 0044 0000 0000 00"
          ></v-text-field>

          <v-text-field
            v-model="bank.swift"
            hint="International Bank Account Number): If the vendor's bank is in Europe or certain other countries."
            label="Swift Code/BIC"
            persistent-placeholder
            placeholder="Your Swift code/BIC.."
          ></v-text-field>

          <v-text-field
            v-model="bank.branch_address"
            :label="$t('global.commons.bank_branch_address')"
            hint="The address of the bank branch where the vendor has their account."
            persistent-placeholder
            placeholder="Your bank address.."
          ></v-text-field>
        </div>
      </v-form>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Admin Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div v-if="adminMode" class="widget-box mb-5">
        <s-widget-header icon="rate_review" title="Actions"></s-widget-header>
        <v-list-subheader></v-list-subheader>
        <u-smart-verify
          v-model="accept"
          color="green"
          false-gray
          label="Accept vendor request."
        ></u-smart-verify>
        <u-smart-verify
          v-model="reject"
          color="red"
          false-gray
          label="Reject vendor request."
        ></u-smart-verify>
      </div>
    </v-card-text>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Admin Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-card-actions v-if="adminMode">
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="close()">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="reject"
          :loading="busy_accept === 'false'"
          color="red"
          dark
          size="x-large"
          @click="acceptRequest(false)"
        >
          <v-icon class="me-1">thumb_down_alt</v-icon>
          Reject vendor
        </v-btn>

        <v-btn
          v-if="accept"
          :loading="busy_accept === 'true'"
          color="success"
          dark
          size="x-large"
          @click="acceptRequest(true)"
        >
          <v-icon class="me-1">thumb_up_alt</v-icon>
          Accept and create vendor
        </v-btn>
      </div>
    </v-card-actions>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Vendor Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <v-card-actions v-else>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="close()">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          :loading="busy"
          color="primary"
          size="x-large"
          @click="saveChange"
        >
          <v-icon class="me-1">{{ modelValue ? "save" : "add" }}</v-icon>
          {{
            modelValue ? $t("global.actions.save") : $t("global.actions.add")
          }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import USmartVerify from "../../../ui/smart/verify/USmartVerify.vue";

export default {
  name: "BVendorOnboarding",
  components: {
    USmartVerify,
  },
  emits: ["update:modelValue", "update"],
  props: {
    shop: {
      // Only in the admin mode!
    },
    modelValue: {},
    adminMode: { type: Boolean, default: false },
  },
  data: () => ({
    company: {},
    personal: {},
    product: {},
    bank: {},

    busy: false,
    busy_fetch: false,

    //-------------------
    accept: false,
    reject: false,
    busy_accept: null,
  }),

  computed: {},

  watch: {
    modelValue() {
      this.assign();
    },
  },

  created() {
    this.assign();

    if (!this.adminMode) {
      // Only fetch last vendor request for vendors! Not admin!
      this.fetchRequest();
    }
  },

  methods: {
    assign() {
      if (this.modelValue) {
        this.company = Object.assign({}, this.modelValue.company);
        this.personal = Object.assign({}, this.modelValue.personal);
        this.product = Object.assign({}, this.modelValue.product);
        this.bank = Object.assign({}, this.modelValue.bank);
      }
      this.reject = false;
      this.accept = false;
    },

    fetchRequest() {
      this.busy_fetch = true;

      axios
        .get(window.VAPI.GER_ADD_VENDOR_REQUEST(this.getShop().id))
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("update:modelValue", data.vendor_request);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    saveChange() {
      const valid = this.$refs.form.validate();
      if (!valid) return;

      this.busy = true;

      axios
        .post(window.VAPI.POST_SEND_ADD_VENDOR_REQUEST(), {
          shop_id: this.getShop().id,
          company: this.company,
          personal: this.personal,
          product: this.product,
          bank: this.bank,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("update:modelValue", data.vendor_request);
            this.close();
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

    close() {
      this.$emit("close");
    },

    //▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Admin Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    acceptRequest(accept) {
      this.busy_accept = "" + accept;

      axios
        .post(
          window.API.POST_SHOP_VENDOR_REQUESTS_ACCEPT(
            this.modelValue.shop_id,
            this.modelValue.id,
          ),
          {
            accept: accept,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            Object.assign(this.modelValue, data.vendor_request);
            this.$emit("update", data.vendor_request);
            this.close();

            // Update teh notification count:
            if (this.shop?.vendors?.waiting_count) {
              this.shop.vendors.waiting_count--;
            }
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_accept = null;
        });
    },
  },
};
</script>
