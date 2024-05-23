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

  <v-card class="text-start">
    <v-card-title class="d-flex align-center">
      <v-icon class="me-1">add_business</v-icon>
      {{
        adminMode
          ? "Review vendor's request"
          : modelValue?.id
            ? "Edit vendor request"
            : "Add new vendor"
      }}
      <v-spacer></v-spacer>
      <v-btn icon variant="text" @click="close()">
        <v-icon> close</v-icon>
      </v-btn>
    </v-card-title>
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <v-card-text :class="{ disabled: busy_fetch }">
      <v-stepper
        v-model="step"
        border
        class="max-width-container-1280px mx-auto mb-5"
        editable
        flat
        mandatory
        rounded="xl"
      >
        <v-stepper-header>
          <v-stepper-item
            :color="valid_company ? 'green' : '#000'"
            :complete="valid_company && step !== 1"
            :value="1"
            class="text-start"
          >
            Company
            <v-expand-transition>
              <small v-if="valid_company" class="d-block">{{
                company?.name
              }}</small>
              <small v-else class="d-block text-red">Complete form!</small>
            </v-expand-transition>
          </v-stepper-item>

          <div class="flex-grow-1 hr-dashed"></div>

          <v-stepper-item
            :color="valid_personal ? 'green' : '#000'"
            :complete="valid_personal && step !== 2"
            :value="2"
            class="text-start"
          >
            Person
            <v-expand-transition>
              <small v-if="valid_personal" class="d-block">{{
                personal?.name
              }}</small>
              <small v-else-if="step > 2" class="d-block text-red"
                >Complete form!</small
              >
            </v-expand-transition>
          </v-stepper-item>

          <div class="flex-grow-1 hr-dashed"></div>

          <v-stepper-item
            :color="valid_products ? 'green' : '#000'"
            :complete="valid_products && step !== 3"
            :value="3"
            class="text-start"
          >
            Merchandise
            <v-expand-transition>
              <small class="d-block">About Products</small>
            </v-expand-transition>
          </v-stepper-item>

          <div class="flex-grow-1 hr-dashed"></div>

          <v-stepper-item
            :color="valid_bank ? 'green' : '#000'"
            :complete="valid_bank && step !== 4"
            :value="4"
            class="text-start"
          >
            Payout
            <v-expand-transition>
              <small class="d-block">Bank Information</small>
            </v-expand-transition>
          </v-stepper-item>
          <div class="flex-grow-1 hr-dashed"></div>

          <v-stepper-item
            :color="valid_document ? 'green' : '#000'"
            :complete="valid_document && step !== 5"
            :value="5"
            class="text-start"
          >
            Documents
            <v-expand-transition>
              <small class="d-block">Upload Files</small>
            </v-expand-transition>
          </v-stepper-item>

          <template v-if="adminMode">
            <div class="flex-grow-1 hr-dashed"></div>

            <v-stepper-item
              :color="modelValue?.accepted_at ? 'green' : '#000'"
              :complete="!!modelValue?.accepted_at"
              :error="!!modelValue?.rejected_at"
              :value="100"
              class="text-start"
            >
              Marketplace
              <v-expand-transition>
                <small class="d-block">{{
                  modelValue?.rejected_at
                    ? "Rejected"
                    : modelValue?.accepted_at
                      ? "Accepted"
                      : "Accept/Reject Actions"
                }}</small>
              </v-expand-transition>
            </v-stepper-item>
          </template>
        </v-stepper-header>
      </v-stepper>

      <v-form ref="form" lazy-validation>
        <v-scroll-y-reverse-transition group hide-on-leave>
          <div v-if="step === 1">
            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃ Status ▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
            <div
              v-if="modelValue && modelValue.created_at"
              class="widget-box mb-5"
            >
              <s-widget-header
                icon="workspaces"
                title="Last status"
              ></s-widget-header>
              <v-list-subheader>
                Here, you can view the latest status of the vendor request.
              </v-list-subheader>
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
                  <v-chip class="float-end" color="green"
                    >{{ $t("global.status.accepted") }}
                  </v-chip>
                  <v-icon class="me-1" size="small"
                    >subdirectory_arrow_right
                  </v-icon>
                  {{ getFromNowString(modelValue.accepted_at) }}<br />
                  <small>
                    {{ getLocalTimeString(modelValue.accepted_at) }}
                  </small>
                </div>

                <div
                  v-else-if="modelValue.rejected_at"
                  class="min-width-200 my-1"
                >
                  <v-chip class="float-end" color="red"
                    >{{ $t("global.status.rejected") }}
                  </v-chip>
                  <v-icon class="me-1" size="small"
                    >subdirectory_arrow_right
                  </v-icon>
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

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃ Company information ▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <div class="widget-box mb-5">
              <s-widget-header
                icon="business"
                title="Company information"
              ></s-widget-header>
              <v-list-subheader>
                This is the information regarding the vendor's business.
              </v-list-subheader>
              <v-text-field
                v-model="company.name"
                :readonly="adminMode"
                :rules="[GlobalRules.required()]"
                label="Company name*"
                variant="underlined"
              ></v-text-field>
              <v-text-field
                v-model="company.address"
                :label="$t('global.commons.address') + '*'"
                :readonly="adminMode"
                :rules="[GlobalRules.required()]"
                variant="underlined"
              ></v-text-field>
              <v-text-field
                v-model="company.postal_code"
                :label="$t('global.map_view.postal_code')"
                :readonly="adminMode"
                variant="underlined"
              ></v-text-field>
              <v-text-field
                v-model="company.phone"
                :label="$t('global.map_view.phone_input') + '*'"
                :readonly="adminMode"
                :rules="[GlobalRules.required()]"
                placeholder="(+45) 2225 6000"
                variant="underlined"
              ></v-text-field>
              <v-text-field
                v-model="company.email"
                :label="$t('global.commons.email') + '*'"
                :readonly="adminMode"
                :rules="[GlobalRules.required(), GlobalRules.email()]"
                placeholder="john@sample.com"
                variant="underlined"
              ></v-text-field>
              <v-text-field
                v-model="company.web"
                :label="$t('global.commons.website')"
                :readonly="adminMode"
                placeholder="https://..."
                variant="underlined"
              ></v-text-field>
            </div>
          </div>

          <div v-if="step === 2">
            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃ Personal information ▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <div class="widget-box mb-5">
              <s-widget-header
                icon="person"
                title="Personal information"
              ></s-widget-header>
              <v-list-subheader>
                Personal information of the vendor account owner.
              </v-list-subheader>
              <v-text-field
                v-model="personal.name"
                :label="$t('global.commons.name') + '*'"
                :readonly="adminMode"
                :rules="[GlobalRules.required()]"
                variant="underlined"
              ></v-text-field>

              <s-country-select
                v-model="personal.country"
                :label="$t('global.commons.country')"
                :readonly="adminMode"
                variant="underlined"
              ></s-country-select>
            </div>
          </div>
          <div v-if="step === 3">
            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃ Products Category ▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <div class="widget-box mb-5">
              <s-widget-header
                icon="inventory"
                title="Your products"
              ></s-widget-header>
              <v-list-subheader
                >What are the products or items that your company offers for
                sale?
              </v-list-subheader>

              <v-textarea
                v-model="product.description"
                :readonly="adminMode"
                auto-grow
                placeholder="About your products... Keep it short."
                rows="3"
                variant="underlined"
              ></v-textarea>
            </div>
          </div>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Bank info  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div v-if="step === 4">
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
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank.account_name"
                :label="$t('global.commons.bank_account_name')"
                hint="This should match the name associated with the bank account."
                persistent-placeholder
                placeholder="Your name.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank.account_number"
                :label="$t('global.commons.bank_account_number')"
                hint="The vendor's unique account number."
                persistent-placeholder
                placeholder="Your bank account number.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank.routing_number"
                :label="$t('global.commons.bank_routing_number')"
                hint="This number varies by country. It's used to identify the specific bank branch the vendor uses."
                persistent-placeholder
                placeholder="Your bank routing number, sort code, or BSB number.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank.iban"
                hint="International Bank Account Number): If the vendor's bank is in Europe or certain other countries."
                label="IBAN"
                persistent-placeholder
                placeholder="Your IBAN number..  eg. DE89 3704 0044 0000 0000 00"
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank.swift"
                hint="International Bank Account Number): If the vendor's bank is in Europe or certain other countries."
                label="Swift Code/BIC"
                persistent-placeholder
                placeholder="Your Swift code/BIC.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank.branch_address"
                :label="$t('global.commons.bank_branch_address')"
                hint="The address of the bank branch where the vendor has their account."
                persistent-placeholder
                placeholder="Your bank address.."
                variant="underlined"
              ></v-text-field>
            </div>
          </div>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Documents  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div v-if="step === 5">
            <div class="widget-box mb-5">
              <s-widget-header icon="pageview" title="Upload Document">
              </s-widget-header>
              <v-list-subheader
                >Please upload the necessary business, IP, and address
                verification documents. We require this information to confirm
                your partnership and provide you with the necessary access.
              </v-list-subheader>

              <template v-for="(item, i) in marketplace_documents" :key="i">
                <s-widget-header
                  :icon="getType(item)?.icon"
                  :title="
                    $t(getType(item)?.title) +
                    (item.name ? ` | ${item.name}` : '')
                  "
                >
                </s-widget-header>

                <v-list-subheader v-if="item.guide">
                  <span v-html="smartConvert(item.guide)"></span>
                </v-list-subheader>

                <v-list-item
                  v-for="attachment in attachments?.filter(
                    (a) => a.type === item.type,
                  )"
                  :key="attachment.id"
                  :subtitle="attachment.name"
                  :title="`File | ${numeralFormat(attachment.size, '0.[0] ib')}`"
                  class="mb-5"
                >
                  <template v-slot:prepend>
                    <v-avatar
                      :image="FileHelper.GetFileIcon(attachment.name)"
                      rounded
                    >
                    </v-avatar>
                  </template>
                  <template v-slot:append>
                    <v-btn
                      v-if="adminMode && modelValue.id"
                      :href="getDownloadLink(attachment)"
                      class="me-2"
                      icon
                      target="_blank"
                      title="Download File"
                      variant="text"
                      @click.stop
                    >
                      <v-icon>download</v-icon>
                    </v-btn>

                    <v-btn
                      v-if="!adminMode"
                      :loading="busy_delete === attachment"
                      color="red"
                      icon
                      variant="text"
                      @click.stop="removeAttachment(attachment)"
                    >
                      <v-icon>close</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
                <v-file-input
                  v-if="!attachments?.some((a) => a.type === item.type)"
                  v-model="files[item.type]"
                  accept=".png,.jpg,.jpeg,.pdf"
                  chips
                  class="mb-5"
                  clearable
                  label="Select image or pdf..."
                  messages="Max image size: 8MB"
                  prepend-icon=""
                  prepend-inner-icon="attach_file"
                  show-size
                  variant="outlined"
                >
                </v-file-input>
              </template>
            </div>
          </div>
        </v-scroll-y-reverse-transition>
      </v-form>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Admin Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <div v-if="step === 100">
        <div v-if="adminMode" class="widget-box mb-5">
          <s-widget-header icon="rate_review" title="Actions"></s-widget-header>
          <v-list-subheader
            >As the marketplace admin, please review the vendor's request. Here,
            you can accept or reject the request. Accepting the request will
            create the vendor account in your marketplace.
          </v-list-subheader>
          <u-smart-verify
            v-model="accept"
            color="green"
            false-gray
            true-description="Approve the vendor's request to create their account in the marketplace."
            true-title="Accept Request"
            @update:model-value="reject = false"
          ></u-smart-verify>

          <u-smart-verify
            v-model="reject"
            color="red"
            false-gray
            true-description="Deny the vendor's request to create their account in the marketplace."
            true-title="Reject Request"
            @update:model-value="accept = false"
          ></u-smart-verify>
        </div>
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
          size="x-large"
          variant="elevated"
          @click="acceptRequest(false)"
        >
          <v-icon start>thumb_down_alt</v-icon>
          Reject vendor
        </v-btn>

        <v-btn
          v-if="accept"
          :loading="busy_accept === 'true'"
          color="success"
          size="x-large"
          variant="elevated"
          @click="acceptRequest(true)"
        >
          <v-icon start>thumb_up_alt</v-icon>
          Accept and create vendor
        </v-btn>
      </div>
    </v-card-actions>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Vendor Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <v-card-actions v-else>
      <div class="widget-buttons">
        <v-btn v-if="step === 1" size="x-large" variant="text" @click="close()">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>
        <v-btn v-else size="x-large" variant="text" @click="step--">
          <v-icon start>{{ $t("icons.chevron_back") }}</v-icon>

          {{ $t("global.actions.back") }}
        </v-btn>

        <v-btn
          v-if="modelValue"
          :loading="busy_save"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="saveChange"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <template v-else>
          <v-btn
            v-if="step === 5"
            :loading="busy_save || busy_upload"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="saveChange"
          >
            <v-icon start>add</v-icon>
            {{ $t("global.actions.add") }}
          </v-btn>

          <v-btn
            v-else
            :loading="busy_save || busy_upload"
            color="primary"
            size="x-large"
            variant="flat"
            @click="step++"
          >
            {{ $t("global.actions.next") }}
            <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
          </v-btn>
        </template>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import USmartVerify from "../../../ui/smart/verify/USmartVerify.vue";
import SCountrySelect from "@selldone/components-vue/ui/country/select/SCountrySelect.vue";
import { SmartConvertTextToHtml } from "@selldone/core-js/helper/html/HtmlHelper";
import VendorDocumentType from "@selldone/core-js/enums/vendor/VendorDocumentType";
import SWidgetHeader from "@selldone/components-vue/ui/widget/header/SWidgetHeader.vue";
import { FileHelper } from "@selldone/core-js/helper/converters/FileHelper";

export default {
  name: "BVendorOnboarding",
  components: {
    SWidgetHeader,
    SCountrySelect,
    USmartVerify,
  },
  emits: ["update:modelValue", "update"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    modelValue: {},
    adminMode: { type: Boolean, default: false },
  },
  data: () => ({
    FileHelper: FileHelper,

    step: 1,

    company: {},
    personal: {},
    product: {},
    bank: {},

    busy_save: false,
    busy_upload: false,
    busy_fetch: false,
    busy_delete: null,

    files: {},
    //-------------------
    accept: false,
    reject: false,
    busy_accept: null,
  }),

  computed: {
    valid_company() {
      return !!(
        this.company.address &&
        this.company.name &&
        this.company.phone &&
        this.company.email
      );
    },
    valid_personal() {
      return !!this.personal.name;
    },

    valid_products() {
      return !!this.product.description;
    },

    valid_bank() {
      return !!(
        this.bank.name &&
        this.bank.account_name &&
        this.bank.account_number
      );
    },

    valid_document() {
      return (
        this.attachments?.length || Object.values(this.files).some((f) => !!f)
      );
    },
    marketplace() {
      return this.shop.marketplace;
    },
    marketplace_documents() {
      return this.marketplace?.documents?.uniqueByKey("type"); // array of {type,guide}
    },
    attachments() {
      return this.modelValue?.attachments;
    },
  },

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
      this.files = {};
    },

    fetchRequest() {
      this.busy_fetch = true;

      axios
        .get(window.VAPI.GET_ADD_VENDOR_REQUEST(this.shop.id))
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

      this.busy_save = true;

      axios
        .post(window.VAPI.POST_SEND_ADD_VENDOR_REQUEST(), {
          shop_id: this.shop.id,
          company: this.company,
          personal: this.personal,
          product: this.product,
          bank: this.bank,
        })
        .then(({ data }) => {
          if (!data.error) {
            if (Object.values(this.files)?.some((f) => !!f)) {
              this.uploadFiles();
              this.showSuccessAlert(
                "Uploading files...",
                "Your vendor request is received!",
              );
            } else {
              this.showSuccessAlert(null, "Your vendor request is received!");
              this.$emit("update:modelValue", data.vendor_request);

              this.close();
            }
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },
    uploadFiles() {
      this.busy_upload = true;

      let formData = new FormData();

      formData.append("shop_id", this.shop.id);

      // Append files
      for (let key in this.files) {
        if (this.files[key] !== null) {
          formData.append(key, this.files[key]);
        }
      }

      axios
        .post(window.VAPI.POST_VENDOR_REQUEST_UPLOAD_FILES(), formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.modelValue.attachments.push(...data.attachments);
            this.files = {};

            this.$emit("update:modelValue", this.modelValue);
            this.showSuccessAlert(null, "Files uploaded successfully!");
            this.close();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_upload = false;
        });
    },

    close() {
      this.$emit("close");
    },

    removeAttachment(attachment) {
      this.openDangerAlert(
        "Delete Attachment",
        "Are you sure you want to delete this attachment?",
        "Yes, Delete Now",
        () => {
          this.busy_delete = attachment;

          axios
            .delete(
              window.VAPI.DELETE_VENDOR_REQUEST_ATTACHMENT(attachment.id),
              {
                params: { shop_id: this.shop.id },
              },
            )
            .then(({ data }) => {
              if (!data.error) {
                this.DeleteItemByID(this.attachments, data.id);

                this.showSuccessAlert(null, "Attachment removed successfully!");
              } else {
                this.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = null;
            });
        },
      );
    },

    getDownloadLink(attachment) {
      return window.API.GET_SHOP_VENDOR_REQUEST_ATTACHMENT_DOWNLOAD_LINK(
        this.shop.id,
        this.modelValue.id,
        attachment.id,
      );
    },

    //▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Admin Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    acceptRequest(accept) {
      this.busy_accept = "" + accept;

      axios
        .post(
          window.API.POST_SHOP_VENDOR_REQUESTS_ACCEPT(
            this.shop.id,
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

    smartConvert(guide) {
      return SmartConvertTextToHtml(guide, false);
    },
    getType(document) {
      return VendorDocumentType[document?.type];
    },
  },
};
</script>
