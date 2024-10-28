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
  <v-card class="text-start">
    <v-card-title v-if="!company">
      <v-icon class="me-2">domain_add</v-icon>
      New Business Profile
    </v-card-title>
    <v-card-text>
      <div class="widget-box mb-5">
        <u-widget-header
          :add-caption="
            company
              ? lock
                ? $t('global.actions.lock')
                : $t('global.actions.unlock')
              : undefined
          "
          :add-icon="lock ? 'lock' : 'lock_open'"
          :title="
            company ? $t('global.actions.edit') : $t('global.actions.add')
          "
          add-text
          icon="business"
          @click:add="lock = !lock"
        ></u-widget-header>
        <v-list-subheader
          >Please enter the valid information of your registered company. Do not
          enter personal information here.
        </v-list-subheader>

        <u-smart-verify
          v-model="verify_check"
          class="my-3"
          true-description="I confirm that the information provided is accurate."
          true-title="Verify Information"
        ></u-smart-verify>

        <v-text-field
          v-model="name"
          :label="$t('add_company.name_input') + ' *'"
          :messages="
            company
              ? 'If you change it, your company needs to SD review and verify your business again.'
              : undefined
          "
          :readonly="lock"
          :rules="[GlobalRules.required()]"
          append-inner-icon="fa:fas fa-briefcase"
          variant="underlined"
        />

        <v-text-field
          v-model="website"
          :label="$t('add_company.website_input')"
          :readonly="lock"
          :rules="[GlobalRules.required()]"
          append-inner-icon="fa:fas fa-link"
          variant="underlined"
        />

        <v-text-field
          v-model="email"
          :label="$t('add_company.email_input') + ' *'"
          :readonly="lock"
          :rules="[GlobalRules.required()]"
          append-inner-icon="fa:fas fa-envelope"
          variant="underlined"
        />

        <v-text-field
          v-model="address"
          :label="$t('add_company.address_input') + ' *'"
          :messages="
            company
              ? 'If you change it, your company needs to SD review and verify your business again.'
              : undefined
          "
          :readonly="lock"
          :rules="[GlobalRules.required()]"
          append-inner-icon="fa:fas fa-map-marker-alt"
          variant="underlined"
        />

        <v-text-field
          v-model="phone"
          :label="$t('add_company.tel_input') + ' *'"
          :readonly="lock"
          :rules="[GlobalRules.required()]"
          append-inner-icon="fa:fas fa-phone"
          variant="underlined"
        />

        <v-text-field
          v-model="mobile"
          :label="$t('add_company.mobile_input')"
          :readonly="lock"
          :rules="[GlobalRules.required()]"
          append-inner-icon="fa:fas fa-mobile"
          variant="underlined"
        />

        <div v-if="company">
          <s-image-uploader
            :image="getShopImagePath(company.logo)"
            :server="window.API.POST_UPLOAD_COMPANY_IMAGE(company.id, 'logo')"
            auto-compact
            label="Company logo"
            max-file-size="512KB"
            @new-path="(path) => (company.logo = path)"
          />
        </div>
      </div>

      <div class="widget-box mb-5">
        <u-widget-header icon="receipt_long" title="Billing"></u-widget-header>
        <v-list-subheader>
          <div>
            Enter valid information here. After setting your Tax/VAT ID, you
            must
            <b>upload the document</b> to validate your Tax/VAT ID. To upload
            documents go to <b>Company > Documents</b> tab.
          </div>
        </v-list-subheader>

        <s-country-select
          v-model="country"
          :label="$t('global.commons.country')"
          :readonly="lock"
          item-value="alpha2"
          variant="underlined"
        ></s-country-select>

        <v-text-field
          v-model="tax"
          :disabled="lock || !country"
          :label="'Tax/VAT ID' + ' *'"
          :messages="
            company
              ? 'If you change it, your company needs to SD review and verify your business again.'
              : undefined
          "
          :placeholder="`${country ? country : 'XX'}12300000`"
          :rules="[GlobalRules.required()]"
          persistent-placeholder
          variant="underlined"
        >
          <template v-slot:append-inner>
            <img
              v-if="isEuropean"
              class="mx-1"
              height="20"
              src="../../../assets/icons/europe.svg"
              width="20"
            />
            <flag v-if="country" :iso="country" :squared="false" class="ms-1" />
          </template>
        </v-text-field>
      </div>
    </v-card-text>
    <v-card-actions>
      <div class="widget-buttons">
        <v-btn v-if="hasBack" size="x-large" variant="text" @click="back">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.cancel") }}
        </v-btn>

        <v-btn
          :class="{ disabled: lock || !verify_check }"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="company ? editCompany() : addCompany()"
        >
          <v-icon start>{{ company ? "save" : "add" }}</v-icon>
          {{
            company
              ? $t("add_company.edit_action")
              : $t("add_company.create_action")
          }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import SImageUploader from "../../../ui/uploader/SImageUploader.vue";

import SCountrySelect from "../../../ui/country/select/SCountrySelect.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";
import USmartVerify from "../../../ui/smart/verify/USmartVerify.vue";
import { Country } from "@selldone/core-js/models/general/country/country.model";

export default {
  name: "BCompanyAdd",
  components: {
    USmartVerify,
    SCountrySelect,

    SImageUploader,
  },
  props: {
    company: {
      required: false,
      type: Object,
    },
    hasBack: {
      required: false,
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    busy: false,

    verify_check: true,

    name: "",
    website: "",
    email: "",
    address: "",
    phone: "",
    mobile: "",

    logo: [],
    lock: false,

    tax: null,
    country: SetupService.DefaultCountry(),
  }),

  computed: {
    isEuropean() {
      return (
        this.country && Country.EuropeCountriesAlpha2.includes(this.country)
      );
    },
  },

  watch: {
    company() {
      this.assignFromCompany();
    },
  },
  created() {
    this.assignFromCompany();
  },

  methods: {
    addCompany() {
      this.busy = true;

      axios
        .post(window.API.POST_ADD_COMPANY(), {
          name: this.name,
          website: this.website,
          email: this.email,
          address: this.address,
          phone: this.phone,
          mobile: this.mobile,
          tax: this.tax,
          country: this.country,
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t("add_company.notifications.add_success", {
                name: this.name,
              }),
            );
            this.$emit("add", data.company);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    editCompany() {
      this.busy = true;

      axios
        .put(window.API.PUT_EDIT_COMPANY(this.company.id), {
          name: this.name,
          website: this.website,
          email: this.email,
          address: this.address,
          phone: this.phone,
          mobile: this.mobile,
          tax: this.tax,
          country: this.country,
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t("add_company.notifications.edit_success"),
            );

            Object.assign(this.company, data.company);

            this.$emit("edit", data.company);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    back() {
      this.$emit("back");
    },

    assignFromCompany() {
      this.lock = false;

      if (!this.company) return;
      this.name = this.company.name;
      this.website = this.company.website;
      this.email = this.company.email;
      this.address = this.company.address;
      this.phone = this.company.phone;
      this.mobile = this.company.mobile;
      this.tax = this.company.tax;
      this.country = this.company.country;

      this.lock = true;
      this.verify_check = true;
    },
  },
};
</script>

<style lang="scss" scoped></style>
