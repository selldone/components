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
  <div class="widget-box -large min-height-50vh" fluid @dragover="dragover">
    <u-widget-header :title="$t('importer.customer.title')" icon="upload">
      <template v-slot:actions></template>
    </u-widget-header>

    <v-list-subheader>
      {{ $t("importer.customer.subtitle") }}
    </v-list-subheader>

    <v-stepper
      v-model="step"
      :items="[
        { title: $t('importer.step_select_file') },
        { title: $t('importer.step_send_to_server') },
        { title: $t('importer.step_view_que') },
      ]"
      class="rounded-2rem mt-5"
      flat
      hide-actions
      item-title="title"
    >
      <v-stepper-window :model-value="step">
        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ STEP 1 : Review imported data ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

        <v-stepper-window-item :value="1">
          <u-widget-header
            add-caption="Sample Excel"
            add-icon="download"
            add-sub-caption="Download template file"
            href="/app/excel/customers-import.xlsx"
            icon="checklist"
            title="Important checklist"
          ></u-widget-header>
          <v-list-subheader
            >Make sure to follow the guideline.</v-list-subheader
          >
          <v-list density="compact">
            <v-list-item
              :prepend-icon="
                personal_information_verified
                  ? 'check_circle'
                  : 'radio_button_unchecked'
              "
            >
              <v-list-item-title>Complete your KYC.</v-list-item-title>
            </v-list-item>

            <v-list-item prepend-icon="check_circle">
              <v-list-item-title
                >You should provide a valid user name and at least a valid email
                or phone number.
              </v-list-item-title>
            </v-list-item>
            <v-list-item prepend-icon="check_circle">
              <v-list-item-title
                >The phone number must be in the global standard format. country
                code + phone number, ex:<b>45</b>71510000
              </v-list-item-title>
            </v-list-item>
            <v-list-item prepend-icon="check_circle">
              <v-list-item-title
                >Your customers will have access to see purchase history and
                obfuscate their information(Privacy is the top priority in
                Selldone)
              </v-list-item-title>
            </v-list-item>

            <v-list-item prepend-icon="mail">
              <v-list-item-title
                >We will send an email to inform the user about adding them to
                your store. They can reject it. The email contains your shop
                information and your name.
              </v-list-item-title>
            </v-list-item>
          </v-list>

          <b-spreadsheet-customers
            ref="spreadsheet"
            v-model:totalItems="total_items"
            class="mb-3"
            @update:valid="(val) => (is_valid = val)"
          ></b-spreadsheet-customers>

          <div class="widget-buttons mt-4">
            <v-btn
              :disabled="!is_valid || !personal_information_verified"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="step = 2"
            >
              {{ $t("global.actions.continue") }}
              <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
            </v-btn>
          </div>
        </v-stepper-window-item>

        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ STEP 2 : Send dataset to the server ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

        <v-stepper-window-item :value="2">
          <div class="pt-6" style="min-height: 200px">

            <b-shop-quota-importer
              :new-count="total_items"
              :quota-key="shopQuota.Customer"
              :shop="shop"
            ></b-shop-quota-importer>

            <div
              :class="{ 'op-0-0': !progress }"
              class="mb-6 mt-3 shadow-small rounded-xl pa-2 mx-5"
            >
              <v-progress-linear
                :model-value="progress"
                class="rounded-xl"
                color="green"
                height="14"
                rounded
                stream
                striped
              ></v-progress-linear>
            </div>

            <div class="widget-buttons mt-4">
              <v-btn size="x-large" variant="flat" @click="step = 1">
                <v-icon start>{{ $t("icons.chevron_back") }}</v-icon>
                {{ $t("global.actions.back") }}
              </v-btn>

              <v-btn
                :class="{ disabled: !valid_count }"
                :loading="busy_send"
                color="primary"
                size="x-large"
                @click="postToServer()"
              >
                <v-icon class="me-2 blink-me" size="small"
                  >fiber_manual_record
                </v-icon>
                {{ $t("importer.send_to_server_action") }}

                <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
              </v-btn>
            </div>
          </div>
        </v-stepper-window-item>

        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ STEP 3 : Send dataset to the server ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

        <v-stepper-window-item :value="3">
          <!-- Results -->
          <v-container class="text-center">
            <v-row>
              <v-col cols="12" sm="6">
                <p class="m-0 small">{{ $t("global.commons.success") }}</p>
                <h2 class="text-success" style="font-size: 34px !important">
                  {{ result_success }}
                </h2>
              </v-col>

              <v-col cols="12" sm="6">
                <p class="m-0 small">{{ $t("global.commons.fail") }}</p>
                <h2 class="text-danger" style="font-size: 34px !important">
                  {{ result_fails }}
                </h2>
              </v-col>
            </v-row>
          </v-container>

          <!-- Errors list -->
          <div class="border-between-vertical my-3">
            <div v-for="(error, i) in errors" :key="i" class="px-x py-1 small">
              <v-icon class="me-1" color="red" size="small">error</v-icon>
              {{ error }}
            </div>
          </div>

          <div class="widget-buttons mt-4">
            <v-btn exact size="x-large" variant="outlined" @click="$emit('close')"
              >Back to the customers list
              <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
            </v-btn>
          </div>
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ Show Drop Message ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <v-expand-transition>
      <div v-if="!is_valid">
        <div class="op-0-3 max-widget-width text-center">
          <div class="my-3">{{ $t("global.commons.or") }}</div>
          <div class="typo-body my-3">
            <div class="m-3">
              <div class="shadow-app p-3 rounded-blog inline-block">
                <v-icon size="64">topic</v-icon>
              </div>
            </div>

            {{ $t("admin_shop.products.drop_import_message") }}
          </div>
        </div>
      </div>
    </v-expand-transition>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ Drop Zone ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <div
      v-if="show_drop"
      class="drop-container"
      @dragleave="dragleave"
      @drop="drop"
    >
      <div class="center-absolute p-3 text-center">
        <div>
          <v-icon class="m-2" color="#fff" size="64">topic</v-icon>
        </div>
        {{ $t("admin_shop.products.drop_import_message") }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { FileFormatConverterOnline } from "@selldone/core-js/helper/converters/FileFormatConverterOnline";
import BSpreadsheetCustomers from "../../spreadsheet/customers/BSpreadsheetCustomers.vue";
import ShopLicenseView from "../../shop/license/view/ShopLicenseView.vue";
import { Eligible } from "@selldone/core-js/enums/shop/ShopLicense";
import { TemporaryDataHelper } from "../../../utils/temporary-data/TemporaryDataHelper";
import BShopQuotaImporter from "../../shop/quota/Importer/BShopQuotaImporter.vue";
import shopQuota from "@selldone/core-js/enums/shop/quota/ShopQuota";

export default {
  name: "BShopCustomerImporter",
  components: {
    BShopQuotaImporter,
    BSpreadsheetCustomers,

    ShopLicenseView,
  },

  props: {
    shop: {
      required: true,
    },
  },

  data: () => ({
    shopQuota: shopQuota,

    step: 1,
    is_valid: false,

    progress: 0,
    busy_send: false,

    total_items: 0,

    result_success: 0,
    result_fails: 0,
    errors: [],

    //------------------
    show_drop: false,
  }),
  computed: {
    max_items_limit() {
      return Eligible.getImportQueLimit(this.shop);
    },

    valid_count() {
      return this.total_items <= this.max_items_limit;
    },

    personal_information_verified() {
      return this.USER().personal_information_verified;
    },
  },

  methods: {
    postToServer() {
      this.busy_send = true;
      this.progress = 0;

      const chunk = 100; // Chunk by products!

      this.$refs.spreadsheet.generateCustomersJson(
        async (values, progress, is_end) => {
          console.log("%" + Math.round(progress), "values", values);
          if (values.length <= 1) {
            // Length 1: just header not dataset!
            if (is_end) {
              this.step = 3;
              this.busy_send = false;
            }
            return;
          }

          // Fix send header data only!
          if (!values || values.length < 2) {
            if (is_end) {
              this.step = 3;
              this.busy_send = false;
            }
            return;
          }

          await axios
            .post(window.API.POST_IMPORT_CUSTOMERS(this.shop.id), {
              dataset: values,
            })
            .then(({ data }) => {
              if (data.error) {
                this.showErrorAlert(null, data.error_msg);
              } else {
                this.result_success += data.success_count;
                this.result_fails += data.fail_count;
                this.errors.push(...data.errors);
              }
              // console.log("axios then", data);
            })
            .catch((error) => {
              this.showLaravelError(error);
            })

            .finally(() => {
              this.progress = progress;

              if (is_end) {
                this.step = 3;
                this.busy_send = false;
                this.$emit("success");
              }
            });
        },
        chunk,
        1000,
        () => {
          this.showErrorAlert(null, "Data set is invalid!");
          this.busy_send = false;
        },
      );
    },

    //-------------------------------------
    dragleave(event) {
      this.show_drop = false;
    },
    dragover(event) {
      event.preventDefault();

      // CSV File:
      if (
        Object.values(event.dataTransfer.items).some((i) => {
          return i.type.includes("application/vnd") || i.type.includes("csv"); // text/csv
        })
      ) {
        this.show_drop = true;
      }

      // Default file drop:
    },

    drop(event) {
      if (!this.show_drop) return;

      this.show_drop = false;
      event.preventDefault();

      const files = event.dataTransfer.files;

      // CSV files:

      if (files.length) {
        const file = files[0];

        // Upload to convert file format:
        if (
          file.name.toLowerCase().endsWith(".xls") ||
          file.name.toLowerCase().endsWith(".xlsx")
        ) {
          // Online convert excel to csv:
          FileFormatConverterOnline.ConvertToCsv(
            this,
            this.$route.params.shop_id,
            file,
            (data) => {
              this.loadCsvImport(data, true);
            },
          );

          return;
        }
        if (!file.name.toLowerCase().endsWith(".csv")) {
          this.showErrorAlert(null, "Acceptable file format is CSV!");
          return;
        }
        if (file.size > 20 * 1024 * 1024) {
          this.showErrorAlert(null, "Maximum file size limited to 20MB!");
          return;
        }

        this.loadCsvImport(file, false);
      }
    },

    loadCsvImport(file, converted_file = false) {
      // 🔹Save the temporary data:
      TemporaryDataHelper.Set(this, {
        file: file,
        converted_file: converted_file,
      });

      this.$router.replace({
        // params: { file: file, converted_file: converted_file },
        hash: "#intent-" + Math.round(Math.random() * 9999),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.head-step {
  box-shadow: none !important;
  border-bottom: solid medium #eaeaea;
}
</style>
