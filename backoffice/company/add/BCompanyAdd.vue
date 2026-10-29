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
  <v-card
    class="b-company-add text-start"
    :class="{ 'b-company-add--modern sd-modern-canvas': modern }"
  >
    <v-card-title v-if="!company && !modern">
      <v-icon class="me-2">domain_add</v-icon>
      New Business Profile
    </v-card-title>
    <header v-if="modern" class="b-company-add__header">
      <div class="sd-modern-title">
        <v-icon class="b-company-add__purpose" aria-hidden="true"
          >business</v-icon
        >
        <div>
          <h1 class="sd-modern-title-text">
            {{ $t("add_company.modern.title") }}
          </h1>
          <p class="sd-modern-subtitle">
            {{ $t("add_company.modern.subtitle") }}
          </p>
        </div>
      </div>
      <v-tooltip
        v-if="hasBack"
        location="top"
        content-class="sd-modern-tooltip text-start"
        open-on-focus
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="sd-modern-icon-button"
            icon="close"
            variant="text"
            :disabled="busy"
            :aria-label="$t('add_company.modern.close')"
            @click="back"
          />
        </template>
        {{ $t("add_company.modern.close") }}
      </v-tooltip>
    </header>
    <v-card-text :class="{ 'b-company-add__body': modern }">
      <v-form
        :id="formId"
        :class="{ 'sd-modern-form b-company-add__form': modern }"
        @submit.prevent="submitCompany"
      >
        <section
          :class="
            modern
              ? 'sd-modern-widget b-company-add__widget'
              : 'widget-box mb-5'
          "
        >
          <u-widget-header
            v-if="!modern"
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
          <v-list-subheader v-if="!modern"
            >Please enter the valid information of your registered company. Do
            not enter personal information here.
          </v-list-subheader>

          <header v-else class="b-company-add__widget-header">
            <v-icon size="18" aria-hidden="true">business</v-icon>
            <div>
              <h2>{{ $t("add_company.modern.business_title") }}</h2>
              <p>{{ $t("add_company.modern.business_help") }}</p>
            </div>
          </header>

          <u-smart-verify
            v-if="!modern"
            v-model="verify_check"
            class="my-3"
            true-description="I confirm that the information provided is accurate."
            true-title="Verify Information"
          ></u-smart-verify>

          <div :class="{ 'sd-modern-form-grid b-company-add__fields': modern }">
            <v-text-field
              :class="{ 'sd-modern-underlined-field': modern }"
              v-model="name"
              :label="
                $t(
                  modern
                    ? 'add_company.modern.name_label'
                    : 'add_company.name_input',
                ) + ' *'
              "
              :messages="
                company
                  ? modern
                    ? $t('add_company.modern.review_warning')
                    : 'If you change it, your company needs to SD review and verify your business again.'
                  : undefined
              "
              :readonly="lock || (modern && busy)"
              :rules="[GlobalRules.required()]"
              :append-inner-icon="modern ? undefined : 'fa:fas fa-briefcase'"
              :placeholder="modern ? 'Acme Studio Inc.' : undefined"
              :persistent-placeholder="modern"
              variant="underlined"
            />

            <v-text-field
              class="b-company-add__ltr"
              :class="{ 'sd-modern-underlined-field': modern }"
              v-model="website"
              :label="$t('add_company.website_input') + (modern ? ' *' : '')"
              :readonly="lock || (modern && busy)"
              :rules="[GlobalRules.required()]"
              :append-inner-icon="modern ? undefined : 'fa:fas fa-link'"
              :placeholder="modern ? 'https://example.com' : undefined"
              :persistent-placeholder="modern"
              variant="underlined"
            />

            <v-text-field
              v-if="modern"
              v-model="address"
              class="sd-modern-underlined-field b-company-add__wide"
              :label="$t('add_company.modern.address_label') + ' *'"
              :messages="
                company ? $t('add_company.modern.review_warning') : undefined
              "
              :readonly="lock || busy"
              :rules="[GlobalRules.required()]"
              variant="underlined"
              persistent-placeholder
            />
            <h3
              v-if="modern"
              class="b-company-add__contact b-company-add__wide"
            >
              {{ $t("add_company.modern.contact_title") }}
            </h3>

            <v-text-field
              class="b-company-add__ltr b-company-add__wide"
              :class="{ 'sd-modern-underlined-field': modern }"
              v-model="email"
              :label="
                $t(
                  modern
                    ? 'add_company.modern.email_label'
                    : 'add_company.email_input',
                ) + ' *'
              "
              :readonly="lock || (modern && busy)"
              :rules="[GlobalRules.required()]"
              :append-inner-icon="modern ? undefined : 'fa:fas fa-envelope'"
              :placeholder="modern ? 'hello@example.com' : undefined"
              :persistent-placeholder="modern"
              variant="underlined"
            />

            <v-text-field
              v-if="!modern"
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
              class="b-company-add__ltr"
              :class="{ 'sd-modern-underlined-field': modern }"
              v-model="phone"
              :label="$t('add_company.tel_input') + ' *'"
              :readonly="lock || (modern && busy)"
              :rules="[GlobalRules.required()]"
              :append-inner-icon="modern ? undefined : 'fa:fas fa-phone'"
              :placeholder="modern ? '+1 202 555 0142' : undefined"
              :persistent-placeholder="modern"
              variant="underlined"
            />

            <v-text-field
              class="b-company-add__ltr"
              :class="{ 'sd-modern-underlined-field': modern }"
              v-model="mobile"
              :label="$t('add_company.mobile_input') + (modern ? ' *' : '')"
              :readonly="lock || (modern && busy)"
              :rules="[GlobalRules.required()]"
              :append-inner-icon="modern ? undefined : 'fa:fas fa-mobile'"
              :placeholder="modern ? '+1 202 555 0143' : undefined"
              :persistent-placeholder="modern"
              variant="underlined"
            />
          </div>

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
        </section>

        <section
          :class="
            modern
              ? 'sd-modern-widget b-company-add__widget'
              : 'widget-box mb-5'
          "
        >
          <u-widget-header
            v-if="!modern"
            icon="receipt_long"
            title="Billing"
          ></u-widget-header>
          <v-list-subheader v-if="!modern">
            <div>
              Enter valid information here. After setting your Tax/VAT ID, you
              must
              <b>upload the document</b> to validate your Tax/VAT ID. To upload
              documents go to <b>Company > Documents</b> tab.
            </div>
          </v-list-subheader>
          <header v-else class="b-company-add__widget-header">
            <v-icon size="18" aria-hidden="true">receipt_long</v-icon>
            <div>
              <h2>{{ $t("add_company.modern.billing_title") }}</h2>
              <div class="b-company-add__subtitle-help">
                <p>{{ $t("add_company.modern.billing_help") }}</p>
                <v-tooltip
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  open-on-focus
                  open-on-click
                >
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      type="button"
                      class="sd-modern-icon-button sd-modern-info-button"
                      icon="info_outline"
                      variant="text"
                      :aria-label="$t('add_company.modern.tax_help_label')"
                    />
                  </template>
                  {{ $t("add_company.modern.tax_help") }}
                </v-tooltip>
              </div>
            </div>
          </header>

          <div :class="{ 'sd-modern-form-grid b-company-add__fields': modern }">
            <s-country-select
              :class="{ 'sd-modern-underlined-field': modern }"
              v-model="country"
              :label="$t('global.commons.country') + (modern ? ' *' : '')"
              :aria-label="$t('global.commons.country')"
              :readonly="lock || (modern && busy)"
              :required="modern"
              :persistent-placeholder="modern"
              item-value="alpha2"
              variant="underlined"
            ></s-country-select>

            <v-text-field
              class="b-company-add__ltr"
              :class="{ 'sd-modern-underlined-field': modern }"
              v-model="tax"
              :disabled="lock || !country"
              :label="
                (modern ? $t('add_company.modern.tax_label') : 'Tax/VAT ID') +
                ' *'
              "
              :messages="
                company
                  ? modern
                    ? $t('add_company.modern.review_warning')
                    : 'If you change it, your company needs to SD review and verify your business again.'
                  : undefined
              "
              :placeholder="`${country ? country : 'XX'}12300000`"
              :rules="[GlobalRules.required()]"
              :readonly="modern && busy"
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
                <flag
                  v-if="country"
                  :iso="country"
                  :squared="false"
                  class="ms-1"
                />
              </template>
            </v-text-field>
          </div>
          <p v-if="modern" class="b-company-add__documents">
            <v-icon size="15" aria-hidden="true">file_copy</v-icon>
            <span>{{ $t("add_company.modern.documents_help") }}</span>
          </p>
        </section>
        <u-smart-verify
          v-if="modern"
          v-model="verify_check"
          class="b-company-add__verification"
          :true-title="$t('add_company.modern.verify_title')"
          :true-description="$t('add_company.modern.verify_description')"
          :disabled="busy || lock"
          role="checkbox"
          :aria-checked="verify_check"
          :aria-disabled="busy || lock"
          :aria-label="$t('add_company.modern.verify_title')"
          :tabindex="busy || lock ? -1 : 0"
          @keydown.space.prevent="
            !busy && !lock && (verify_check = !verify_check)
          "
          @keydown.enter.prevent="
            !busy && !lock && (verify_check = !verify_check)
          "
        />
        <div
          v-if="modern && (formError || requestError)"
          class="sd-modern-notice b-company-add__error"
          role="alert"
        >
          <v-icon size="16" color="error" aria-hidden="true"
            >error_outline</v-icon
          >
          <span class="sd-modern-notice__content">{{
            $t(
              requestError
                ? "add_company.modern.load_error"
                : "add_company.modern.required_help",
            )
          }}</span>
          <v-btn
            v-if="requestError"
            type="submit"
            class="sd-modern-button"
            variant="text"
            :disabled="busy || lock || !verify_check"
            >{{ $t("add_company.modern.retry") }}</v-btn
          >
        </div>
      </v-form>
    </v-card-text>
    <v-card-actions
      :class="{ 'sd-modern-form-actions b-company-add__footer': modern }"
    >
      <div class="widget-buttons" :class="{ 'b-company-add__actions': modern }">
        <v-btn
          v-if="hasBack"
          :size="modern ? undefined : 'x-large'"
          :class="{ 'sd-modern-button': modern }"
          :disabled="modern && busy"
          :variant="modern ? 'outlined' : 'text'"
          @click="back"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.cancel") }}
        </v-btn>

        <v-btn
          :class="
            modern
              ? 'sd-modern-button sd-modern-button--primary'
              : { disabled: lock || !verify_check }
          "
          :disabled="modern && (lock || !verify_check || busy)"
          :type="modern ? 'submit' : 'button'"
          :form="modern ? formId : undefined"
          :loading="busy"
          color="primary"
          :size="modern ? undefined : 'x-large'"
          variant="elevated"
          @click="!modern && (company ? editCompany() : addCompany())"
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

<script lang="ts">
import { useId } from "vue";
import SImageUploader from "../../../ui/uploader/SImageUploader.vue";

import SCountrySelect from "../../../ui/country/select/SCountrySelect.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";
import USmartVerify from "../../../ui/smart/verify/USmartVerify.vue";
import { Country } from "@selldone/core-js/models/general/country/country.model";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BCompanyAdd",
  setup: () => ({ formId: `company-form-${useId()}` }),
  mixins: [],
  components: {
    USmartVerify,
    SCountrySelect,

    SImageUploader,
  },
  props: {
    modern: { type: Boolean, default: false },
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
    formError: false,
    requestError: false,

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
    async submitCompany(validationEvent) {
      if (!this.modern || this.busy || this.lock || !this.verify_check) return;
      // VForm supplies its validation promise with the native submit event.
      const { valid } = await validationEvent;
      if (!this.modern || this.busy || this.lock || !this.verify_check) return;
      this.formError = !valid;
      this.requestError = false;
      if (!valid) {
        this.$nextTick(() =>
          this.$el?.querySelector(".v-input--error input")?.focus(),
        );
        return;
      }
      return this.company ? this.editCompany() : this.addCompany();
    },
    addCompany() {
      if (this.modern && (this.busy || this.lock || !this.verify_check)) return;
      this.busy = true;
      this.requestError = false;

      return axios
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
            this.requestError = this.modern;
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t("add_company.notifications.add_success", {
                name: this.name,
              }),
            );
            this.$emit("add", data.company);
          }
        })
        .catch((error) => {
          this.requestError = this.modern;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    editCompany() {
      if (this.modern && (this.busy || this.lock || !this.verify_check)) return;
      this.busy = true;
      this.requestError = false;

      return axios
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
            this.requestError = this.modern;
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t("add_company.notifications.edit_success"),
            );

            Object.assign(this.company, data.company);

            this.$emit("edit", data.company);
          }
        })
        .catch((error) => {
          this.requestError = this.modern;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    back() {
      if (this.modern && this.busy) return;
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

<style lang="scss" scoped>
.b-company-add--modern.v-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  font-family: inherit;
  color: rgb(var(--v-theme-on-surface));
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;

  .b-company-add__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-shrink: 0;
    width: 100%;
    max-width: 760px;
    margin-inline: auto;
    padding: 29px 28px 25px;
  }
  .sd-modern-title-text {
    font-size: 23px;
    font-weight: 500;
    line-height: 31px;
    letter-spacing: -0.65px;
  }
  .sd-modern-subtitle {
    max-width: 440px;
    margin-block: 6px 0;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
  }
  .b-company-add__purpose {
    flex: 0 0 21px;
    font-size: 21px;
    margin-block-start: 5px;
  }
  .b-company-add__body.v-card-text {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 0;
  }
  .b-company-add__form {
    width: 100%;
    max-width: 760px;
    margin-inline: auto;
    padding: 0 28px 24px;
  }
  .b-company-add__widget.sd-modern-widget {
    padding: 23px 24px;
    border-radius: 17px;
    font-size: 12px;
    line-height: 20px;
  }
  .b-company-add__widget + .b-company-add__widget {
    margin-block-start: 18px;
  }
  .b-company-add__widget-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-block-end: 22px;
  }
  .b-company-add__widget-header > .v-icon {
    margin-block-start: 1px;
    color: var(--sd-modern-muted);
  }
  .b-company-add__widget-header > div {
    min-width: 0;
  }
  .b-company-add__widget-header h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
  }
  .b-company-add__widget-header p {
    margin-block: 5px 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
  }
  .b-company-add__subtitle-help {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .b-company-add__subtitle-help .sd-modern-info-button {
    flex-shrink: 0;
  }
  .b-company-add__fields {
    column-gap: 22px;
    row-gap: 15px;
  }
  .b-company-add__fields > * {
    min-width: 0;
  }
  .b-company-add__wide {
    grid-column: 1 / -1;
  }
  .b-company-add__contact {
    margin: 9px 0 3px;
    padding-block-start: 17px;
    border-block-start: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-size: 10px;
    font-weight: 400;
    line-height: 15px;
    letter-spacing: 0.65px;
    text-transform: uppercase;
  }
  .sd-modern-underlined-field :deep(.v-field-label) {
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }
  .sd-modern-underlined-field :deep(.v-field-label--floating) {
    font-size: 11px;
    font-weight: 400;
    line-height: 17px;
  }
  .sd-modern-underlined-field :deep(.v-field__input) {
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
  }
  .sd-modern-underlined-field :deep(.v-input__details),
  .sd-modern-underlined-field :deep(.v-messages),
  .sd-modern-underlined-field :deep(.v-messages__message) {
    font-size: 11px;
    font-weight: 400;
    line-height: 16px;
  }
  .b-company-add__ltr :deep(input) {
    direction: ltr;
    text-align: start;
  }
  .b-company-add__documents {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin: 5px 0 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 19px;
  }
  .b-company-add__documents > .v-icon {
    flex-shrink: 0;
    margin-block-start: 2px;
  }
  .b-company-add__verification {
    padding-block-start: 21px;
  }
  .b-company-add__verification :deep(.p-2) {
    padding: 0 !important;
  }
  .b-company-add__verification :deep(.mnh) {
    min-height: 48px;
  }
  .b-company-add__verification :deep(b) {
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
  }
  .b-company-add__verification :deep(.small) {
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
  }
  .b-company-add__verification:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 4px;
    border-radius: 8px;
  }
  .b-company-add__error {
    margin-block-start: 18px;
    padding: 12px 14px;
    font-size: 12px;
    line-height: 20px;
  }
  .b-company-add__footer {
    flex: 0 0 auto;
    padding: 0;
    border-block-start: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
  }
  .b-company-add__actions.widget-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    gap: 16px;
    width: 100%;
    max-width: 760px;
    min-width: 0;
    margin-inline: auto;
    padding: 16px 28px;
  }
  .b-company-add__actions > .sd-modern-button {
    flex: 0 0 auto;
    min-width: 0;
    min-height: 42px;
    padding: 0 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  .b-company-add__actions :deep(.v-icon) {
    font-size: 17px;
  }
  .b-company-add__actions > .sd-modern-button--primary {
    margin-inline-start: auto;
  }

  @media (max-width: 680px) {
    .b-company-add__header {
      padding: 23px 18px 22px;
      gap: 12px;
    }
    .sd-modern-title {
      gap: 10px;
    }
    .sd-modern-title-text {
      font-size: 21px;
      line-height: 29px;
    }
    .b-company-add__form {
      padding: 0 14px 20px;
    }
    .b-company-add__widget.sd-modern-widget {
      padding: 21px 18px;
      border-radius: 14px;
    }
    .b-company-add__fields {
      grid-template-columns: minmax(0, 1fr);
      row-gap: 12px;
    }
    .sd-modern-underlined-field :deep(.v-field__input) {
      font-size: 16px;
      line-height: 23px;
    }
    .b-company-add__actions.widget-buttons {
      padding: 14px;
      gap: 12px;
    }
    .b-company-add__actions > .sd-modern-button {
      flex: 1;
      min-height: 44px;
      padding-inline: 10px;
    }
    .b-company-add__actions > .sd-modern-button--primary {
      flex: 1.45;
    }
  }
  @media (pointer: coarse) {
    .b-company-add__actions > .sd-modern-button {
      min-height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .b-company-add__verification :deep(.interactive-zoom-in) {
      animation: none;
    }
  }
}
</style>
