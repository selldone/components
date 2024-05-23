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
  <div>
    <u-loading-progress
      v-if="busy_request || busy_fetch || busy_sort"
      :color="busy_request ? '#673AB7' : 'green'"
    ></u-loading-progress>

    <!-- ████████████████████ Upload ████████████████████ -->
    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.commons.upload')"
        icon="cloud_upload"
      ></s-widget-header>
      <v-list-subheader></v-list-subheader>

      <v-expansion-panels v-if="USER().permissions" class="mb-2">
        <v-expansion-panel
          class="bg-transparent border"
          elevation="0"
          rounded="xl"
        >
          <v-expansion-panel-title color="transparent">
            <span>
              <v-icon size="small">settings_suggest</v-icon>
              Advance options
            </span>
          </v-expansion-panel-title>
          <v-expansion-panel-text color="transparent">
            <u-smart-switch
              v-model="first_file"
              class="my-3"
              false-description="Put file blob at the end of the request."
              false-title="Force file last (default)"
              true-description="Put file blob at the first of the request."
              true-title="Force file first"
            ></u-smart-switch>

            <u-smart-switch
              v-model="by_axios"
              class="my-3"
              false-description="Send by XMLHttpRequest."
              false-title="Native"
              true-description="Send by Axios."
              true-title="Axios (default)"
            ></u-smart-switch>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <file-pond
        ref="pond"
        :allow-multiple="true"
        :label-idle="`<p class='text-dark m-0'><i class='fa:fas fa-plus text-success ms-2'></i>  ${$t(
          'global.commons.select_upload_file',
        )} </p>`"
        :maxFileSize="`${
          max_file_size_mb > free_capacity_mb
            ? free_capacity_mb
            : max_file_size_mb
        }MB`"
        :maxTotalFileSize="`${
          max_total_files_mb > free_capacity_mb
            ? free_capacity_mb
            : max_total_files_mb
        }MB`"
        :server="server_credential"
        check-validity="true"
        class="mx-auto pointer-pointer max-width-field-large dens-filepound -dashed -drop-area-200"
        credits="false"
        name="file"
        style="min-height: 84px"
        @processfile="handleProcessFile"
      />

      <v-expand-transition>
        <v-container v-if="show_detail">
          <v-row justify="space-around">
            <v-col cols="12" sm="6">
              <u-text-value-box
                :label="$t('global.commons.speed')"
                :value="in_uploading ? numeralFormat(upload_speed, '0 b') : '-'"
                class="max-w-300"
                icon="speed"
              ></u-text-value-box>
            </v-col>
            <v-col cols="12" sm="6">
              <u-text-value-box
                :label="$t('global.commons.time')"
                :value="
                  in_uploading
                    ? displayTime(remain_seconds)
                    : $t('global.commons.finished')
                "
                class="max-w-300"
                icon="hourglass_top"
              ></u-text-value-box>
            </v-col>

            <v-col cols="12" lg="6" md="8" sm="10">
              <u-sparkline
                :height="24"
                :value="speed_array"
                auto-line-width
                color="blue"
                fill
                smooth
              ></u-sparkline>
            </v-col>
          </v-row>
        </v-container>
      </v-expand-transition>
    </div>
    <!-- ████████████████████ Usage ████████████████████ -->

    <div v-if="!IS_VENDOR_PANEL" class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.commons.usage')"
        icon="data_usage"
      ></s-widget-header>
      <v-list-subheader></v-list-subheader>

      <v-row align="center" no-gutters>
        <v-col cols="12" sm="6">
          <u-chart-radial-bar
            :colors="[
              usage_percent > 80
                ? '#D32F2F'
                : usage_percent > 60
                  ? '#FFA000'
                  : '#3F51B5',
            ]"
            :labels="[$t('global.commons.capacity')]"
            :series="[usage_percent]"
            :to-colors="[
              usage_percent > 80
                ? '#FF5722'
                : usage_percent > 60
                  ? '#FFEB3B'
                  : '#1976D2',
            ]"
            height="168"
          >
          </u-chart-radial-bar>
        </v-col>
        <v-col class="text-subtitle-2 max-w-300" cols="12" sm="6">
          <u-text-value-box
            :label="$t('global.commons.capacity')"
            :value="numeralFormat(max_total_files_mb * 1000 * 1000, '0 b')"
            icon="storage"
          ></u-text-value-box>
          <u-text-value-box
            :label="$t('global.commons.usage')"
            :value="numeralFormat(shop.capacity * 1024, '0.[00] b')"
            icon="donut_small"
          ></u-text-value-box>
          <u-text-value-box
            :label="$t('global.commons.file_max_size')"
            :value="numeralFormat(max_file_size_mb * 1000 * 1000, '0 b')"
            icon="insert_page_break"
          ></u-text-value-box>
          <u-text-value-box icon="snippet_folder" label="Files count limit">
            <template v-slot:value>
              <b class="text-green">{{ files.length }}</b> / 20
            </template>
          </u-text-value-box>
        </v-col>
      </v-row>
    </div>
    <!-- ████████████████████ Files List ████████████████████ -->

    <div class="widget-box mb-5">
      <s-widget-header
        :add-caption="$t('global.actions.refresh')"
        :add-loading="busy_fetch"
        :title="$t('global.commons.files_list')"
        add-icon="refresh"
        add-text
        icon="folder"
        @click:add="fetchFiles()"
      ></s-widget-header>
      <v-list-subheader>
        <div>
          <v-icon class="me-1">open_with</v-icon>
          You can drag and sort files.
        </div>
      </v-list-subheader>

      <!-- File product type > sample/paid items -->
      <template v-if="!content">
        <v-list-subheader>
          <div>
            <v-chip class="me-1" color="#673AB7" label size="small">
              <v-icon size="small" start>diamond</v-icon>
              Paid
            </v-chip>
            Users can download it only after purchasing the product.
          </div>
        </v-list-subheader>
        <v-list-subheader>
          <div>
            <v-chip class="me-1" color="#009688" label size="small"
              >Sample
            </v-chip>
            Users can download it for free. Sample files must be under 50 MB.
          </div>
        </v-list-subheader>

        <v-list-subheader>
          <div>
            <span>{{
              has_gust_shop
                ? "● Registered and guest users can download files since guest purchases are enabled in the shop's settings > flow."
                : "● Only registered users can download sample files."
            }}</span>
            <v-btn
              v-if="!IS_VENDOR_PANEL"
              :to="{ name: 'BPageShopSettingFlow' }"
              class="mx-1 tnt"
              color="primary"
              size="small"
              variant="text"
            >
              <v-icon size="x-small" start>edit</v-icon>
              {{ $t("global.actions.change_setting") }}
            </v-btn>
          </div>
        </v-list-subheader>
      </template>
      <draggable
        v-model="files"
        :class="{ blurred: busy_fetch }"
        :component-data="{
          tag: 'ul',
          type: 'transition-group',
          name: !drag ? 'flip-list' : 'fade',
        }"
        class="mt-3 blur-animate border-between-vertical rounded-list-xl"
        style="list-style-type: none"
        tag="transition-group"
        v-bind="dragOptions"
        @end="drag = false"
        @start="drag = true"
        @update:modelValue="changeFilesOrder"
      >
        <!-- BUG IN Setting id as item-key -->

        <template v-slot:item="{ element }">
          <li :key="element.id" class="widget-hover bg-white">
            <v-list-item>
              <template v-slot:prepend>
                <v-avatar class="cursor-move" rounded="0">
                  <img :src="getFileExtensionImage(element.name)" />
                </v-avatar>
              </template>

              <v-list-item-title class="text-subtitle-2 d-flex align-center">
                <span
                  :class="{ disabled: busy_name === element.id }"
                  class="editable-blue py-2 inline-block flex-grow-1 single-line"
                  contenteditable="true"
                  dir="ltr"
                  @blur="
                    (e) => setFileName(element, e.target.innerText, e.target)
                  "
                  @keydown.enter="
                    (e) => {
                      setFileName(element, e.target.innerText, e.target);
                      e.preventDefault();
                    }
                  "
                >
                  {{ element.name }}
                </span>
                <!-- File product type > sample/paid items -->
                <v-btn
                  v-if="!content"
                  :class="{ pen: !element.sample && element.size > 50 * 1024 }"
                  :color="element.sample ? '#009688' : '#673AB7'"
                  :loading="busy_sample === element.id"
                  class="mx-2 tnt"
                  min-width="72"
                  size="small"
                  title="Toggle free/paid mode."
                  variant="flat"
                  @click="setSample(element, !element.sample)"
                >
                  <v-icon v-if="!element.sample" start
                    >{{ element.size > 50 * 1024 ? "lock" : "diamond" }}
                  </v-icon>
                  {{ element.sample ? "Sample" : "Paid" }}
                </v-btn>
              </v-list-item-title>
              <v-list-item-subtitle class="py-1 usn">
                {{ $t("global.commons.created_at") }}:
                <b :title="getLocalTimeString(element.created_at)">{{
                  getFromNowString(element.created_at)
                }}</b>
              </v-list-item-subtitle>
              <v-list-item-subtitle v-if="element.download_at" class="pb-1 usn">
                {{ $t("global.commons.download_at") }}:
                <b :title="getLocalTimeString(element.download_at)">{{
                  getFromNowString(element.download_at)
                }}</b>
              </v-list-item-subtitle>
              <v-list-item-subtitle class="usn">
                {{ $t("global.commons.downloads") }}:
                <b>{{ numeralFormat(element.downloads, "0,0") }}</b>
                <span
                  v-if="element.downloads === max_downloads"
                  class="text-black"
                  title="Most downloaded!"
                  >🔥</span
                >
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-list-item-action class="d-flex flex-column" end>
                  <div class="text-center small" style="min-width: 36px">
                    {{
                      uploading_array.includes(element.id)
                        ? $t("global.commons.uploading")
                        : $t("global.actions.delete")
                    }}
                  </div>

                  <u-progress-radial
                    v-if="uploading_array.includes(element.id)"
                    :completedSteps="uploading_progress[element.id]"
                    :diameter="40"
                    :stroke-width="6"
                    :totalSteps="100"
                  >
                    <v-icon size="small">file_upload</v-icon>
                  </u-progress-radial>
                  <v-btn
                    v-else
                    :loading="busy_delete === element"
                    color="red"
                    icon
                    title="Delete"
                    variant="text"
                    @click="deleteFile(element)"
                  >
                    <v-icon>close</v-icon>
                  </v-btn>
                </v-list-item-action>

                <v-list-item-action
                  class="d-flex flex-column"
                  end
                  style="flex-basis: 50px"
                >
                  <div
                    class="text-center small font-weight-black english-field"
                    dir="ltr"
                    style="min-width: 36px"
                  >
                    {{ numeralFormat(element.size * 1000, "0.[0] b") }}
                  </div>

                  <v-btn
                    :href="getFileUrl(element)"
                    :loading="element.uploading"
                    color="blue"
                    icon
                    target="_blank"
                    title="Download"
                    variant="text"
                  >
                    <v-icon>cloud_download</v-icon>
                  </v-btn>
                </v-list-item-action>
              </template>
            </v-list-item>
          </li>
        </template>
      </draggable>
      <p
        v-if="!files.length"
        class="text-h2 text-muted text-center m-3 text-uppercase"
      >
        {{ $t("product_file.no_file") }}
      </p>
    </div>
  </div>
</template>

<script>
import { Eligible } from "@selldone/core-js/enums/shop/ShopLicense";
import UChartRadialBar from "../../../../../ui/chart/radial/bar/UChartRadialBar.vue";
import UTextValueBox from "../../../../../ui/text/value-box/UTextValueBox.vue";
import UProgressRadial from "../../../../../ui/progress/radial/UProgressRadial.vue";
import draggable from "vuedraggable";

import USmartSwitch from "../../../../../ui/smart/switch/USmartSwitch.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import _ from "lodash-es";
import USparkline from "../../../../../ui/chart/sparkline/USparkline.vue";

export default {
  name: "BProductInventoryManagementFile",
  components: {
    USparkline,
    USmartSwitch,

    UProgressRadial,
    UTextValueBox,
    UChartRadialBar,
    draggable,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
    content: {
      // 🎗️ Subscription  > This file is for a content?
      required: false,
      type: Object,
    },
    forStudio: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      first_file: false,
      by_axios: true,

      busy: false,

      busy_delete: null,
      busy_request: false,
      busy_fetch: false,

      uploading_array: [],
      uploading_progress: {},

      upload_remains_bytes: [],
      upload_speed: 0,
      last_sum: 0,
      remain_seconds: 0,
      show_detail: false,

      speed_array: Array(30).fill(0),

      //--------------------------
      busy_name: null,
      busy_sample: null,
      //--------------------------

      server_credential: {
        timeout: 99999999,
        revert: null,

        process: async (
          fieldName,
          file,
          metadata,
          load,
          error,
          progress,
          abort,
          transfer,
          options,
        ) => {
          console.style("<b>I. Start uploading...</b> " + "file: " + file.name);
          const sell_res = await this.getUploadUrl(file.name, file.size).catch(
            (error) => {
              console.error("Error on creating signed url!", error);
            },
          );

          if (!sell_res || !sell_res.success) {
            console.error("error: Signed url not created!", sell_res);
            abort();
            return;
          }

          const {
            attributes,
            inputs,
            capacity,
            file_item,
            with_credentials,
            headers,
            direct_file,
          } = sell_res;

          // ――――――――――― Update shop info ―――――――――――
          this.shop.capacity = capacity;
          this.AddOrUpdateItemByID(this.files, file_item);

          console.style(
            `<b>II. Signed url generated </b><b="color: green;">successfully</b>. Now send file to the <b>${attributes.action}</b>...`,
          );

          // ――――――――――― Create form data to send ―――――――――――

          const formData = new FormData();

          if (this.first_file) {
            formData.append(fieldName, file, file.name);

            if (inputs && !Array.isArray(inputs)) {
              Object.keys(inputs).forEach((key) => {
                formData.append(key, inputs[key]);
              });
            }
          } else {
            if (inputs && !Array.isArray(inputs)) {
              Object.keys(inputs).forEach((key) => {
                formData.append(key, inputs[key]);
              });
            }
            formData.append(fieldName, file, file.name);
          }

          // timeout identifier, only used when timeout is defined
          let aborted = false;

          // ――――――――――― Option 1. Send by Axios ―――――――――――
          if (this.by_axios) {
            const instance = with_credentials
              ? axios
              : axios.create({
                  withCredentials: false,
                });

            const config = {
              onUploadProgress: (e) => {
                // no progress event when aborted ( onprogress is called once after abort() )
                if (aborted) {
                  return;
                }

                progress(e.lengthComputable, e.loaded, e.total);
                const pval = Math.floor((e.loaded / (e.total + 0.001)) * 100);
                console.log("progress", e.loaded, e.total, pval + "%");
                this.uploading_progress[file_item.id] = pval;
                this.upload_remains_bytes[file_item.id] = e.total - e.loaded;

                this.$forceUpdate(); // Update vue component!

                // Add to global upload keeper:
                this.$store.dispatch({
                  type: "addUploadingFile",
                  file_id: file_item.id,
                  name: file_item.name,
                  progress: pval,
                });
              },

              headers: headers,
            };

            // + Add id to uploading array! (prevent delete!)
            this.uploading_array.push(file_item.id);

            let promise = null;
            if (attributes.method === "PUT") {
              promise = instance.put(
                attributes.action,
                direct_file ? file : formData,
                config,
              );
            } else {
              promise = instance.post(
                attributes.action,
                direct_file ? file : formData,
                config,
              );
            }

            promise
              .then((res) => {
                if (res.status >= 200 && res.status < 300) {
                  // the load method accepts either a string (id) or an object
                  load(res);
                } else {
                  // Can call the error method if something is wrong, should exit after
                  error(res);
                }
              })
              .catch((e) => {
                console.error(e);
                error(e);
              })
              .finally(() => {
                this.remove(this.uploading_array, file_item.id);
                file_item.uploading = false; // End uploading!
                delete this.uploading_progress[file_item.id];
                delete this.upload_remains_bytes[file_item.id];

                // Remove from global upload keeper:
                this.$store.dispatch({
                  type: "removeUploadingFile",
                  file_id: file_item.id,
                });
              });

            let ajaxRequest = axios.CancelToken.source();

            return {
              abort: () => {
                console.log("Request cancel upload.");
                aborted = true;
                // This function is entered if the user has tapped the cancel button
                // cancel  previous ajax if exists
                ajaxRequest.cancel();

                // Let FilePond know the request has been Canceled
                abort();
              },
            };
          }

          // ――――――――――― Option 2. Send by XMLHttpRequest ―――――――――――

          // create request
          const xhr = new XMLHttpRequest();

          xhr.enctype = attributes.enctype;
          xhr.withCredentials = false;

          // progress of load
          // Tips important: Don't use request.upload.onprogress to keep request simple and prevent preflight CORS!
          xhr.upload.onprogress = (e) => {
            // no progress event when aborted ( onprogress is called once after abort() )
            if (aborted) {
              return;
            }

            progress(e.lengthComputable, e.loaded, e.total);
            const pval = Math.floor((e.loaded / (e.total + 0.001)) * 100);
            console.log("progress", e.loaded, e.total, pval + "%");
            this.uploading_progress[file_item.id] = pval;
            this.$forceUpdate(); // Update vue component!
          };

          // error during load
          xhr.onerror = (e) => {
            console.error(e);
            this.remove(this.uploading_array, file_item.id);
            file_item.uploading = false; // End uploading!
            error(xhr);
            this.uploading_progress[file_item.id] = null;
          };

          xhr.onload = () => {
            this.remove(this.uploading_array, file_item.id);
            file_item.uploading = false; // End uploading!
            this.uploading_progress[file_item.id] = null;

            if (xhr.status >= 200 && xhr.status < 300) {
              // the load method accepts either a string (id) or an object
              load(xhr);
            } else {
              // Can call the error method if something is wrong, should exit after
              error(xhr);
            }
          };

          // request aborted
          xhr.onabort = () => {
            aborted = true;
            xhr.abort();
            abort();
          };

          // open up open up!
          xhr.open(attributes.method, attributes.action, true);

          const token = document.head.querySelector('meta[name="csrf-token"]');
          xhr.setRequestHeader("X-CSRF-TOKEN", token.content);

          // Add id to uploading array! (prevent delete!)
          this.uploading_array.push(file_item.id);
          xhr.send(direct_file ? file : formData);

          // Should expose an abort method so the request can be Canceled
          return {
            abort: () => {
              console.log("Request cancel upload.");
              aborted = true;
              // This function is entered if the user has tapped the cancel button
              xhr.abort();

              // Let FilePond know the request has been Canceled
              abort();
            },
          };
        },

        // ――――――――――――――――――――――――――――――――――――――――
      },

      //--------------------------------
      dragOptions: {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      },
      drag: false,
      busy_sort: false,
    };
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    files() {
      if (this.content) {
        // 🎗️ Subscription content
        return this.content.files;
      } else {
        return this.product.files;
      }
    },
    max_downloads() {
      return this.files.map((i) => i.downloads).findMax();
    },
    free_capacity_mb() {
      return Math.round(
        this.max_total_files_mb - this.shop.capacity /*KB*/ / 1024,
      );
    },
    max_file_size_mb() {
      return Eligible.GetFileUploadLimitMB(this.shop);
    },
    max_total_files_mb() {
      return Eligible.GetMaxCapacityMB(this.shop);
    },
    usage_percent() {
      return (100 * this.shop.capacity) / (this.max_total_files_mb * 1000);
    },

    in_uploading() {
      return this.uploading_array.length > 0;
    },

    has_gust_shop() {
      return ShopOptionsHelper.HasGuestCheckout(this.shop); /*🥶 Guest*/
    },
  },

  watch: {
    in_uploading(uploading) {
      if (uploading) {
        this.show_detail = true;
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => {
          let sum = this.upload_remains_bytes.reduce((a, b) => a + b, 0);

          // Valid routine:
          if (this.last_sum > sum) {
            this.upload_speed = this.last_sum - sum;
            this.remain_seconds = sum / this.upload_speed; //seconds
            //console.log('SUM remains:',sum,'Speed:',this.upload_speed)
            this.speed_array.push(this.upload_speed / 1024);
            this.speed_array.shift();
          }

          this.last_sum = sum;
        }, 1000);
      } else {
        if (this.interval) clearInterval(this.interval);
      }
    },
  },
  created() {},
  beforeUnmount() {
    if (this.interval) clearInterval(this.interval);
  },

  mounted() {},
  methods: {
    displayTime(seconds) {
      const format = (val) => `0${Math.floor(val)}`.slice(-2);
      const hours = seconds / 3600;
      const minutes = (seconds % 3600) / 60;

      return [hours, minutes, seconds % 60].map(format).join(":");
    },

    getUploadUrl(filename, size) {
      return new Promise((resolve, reject) => {
        this.busy_request = true;

        axios
          .get(
            this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
              ? window.VAPI.GET_MY_VENDOR_PRODUCT_FILE_UPLOAD_URL(
                  this.product.vendor_id,
                  this.product.id,
                )
              : window.API.GET_PRODUCT_FILE_UPLOAD_URL(
                  this.product.shop_id,
                  this.product.id,
                ),
            {
              params: {
                content_id: this.content?.id, // 🎗️ Subscription  > This file is for a content?
                filename: filename,
                size: size,
              },
            },
          )
          .then(({ data }) => {
            if (!data.error) {
              resolve(data);
            } else {
              this.showErrorAlert(null, data.error_msg);
              reject(data.error_msg);
            }
          })
          .catch((error) => {
            this.showLaravelError(error);
            reject(error);
          })
          .finally(() => {
            this.busy_request = false;
          });
      });
    },

    handleProcessFile(error, file) {
      if (!error) {
        // let response = JSON.parse(file.serverId);

        //console.log("done > product_file", response.product_file);
        console.style(`<b>III. Upload done. ✔</b>`);

        this.fetchFiles();

        return true;
      }
    },

    deleteFile(file) {
      this.openDangerAlert(
        this.$t("product_file.delete_dialog.title"),
        this.$t("product_file.delete_dialog.message"),
        this.$t("product_file.delete_dialog.action"),
        () => {
          this.busy_delete = file;
          axios
            .delete(
              this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                ? window.VAPI.DELETE_MY_VENDOR_PRODUCT_FILE(
                    this.product.vendor_id,
                    this.product.id,
                    file.id,
                  )
                : window.API.DELETE_PRODUCT_FILE(
                    this.product.shop_id,
                    this.product.id,
                    file.id,
                  ),
            )
            .then(({ data }) => {
              if (!data.error) {
                this.showSuccessAlert(
                  null,
                  this.$t("product_file.notifications.delete_success"),
                );

                if (this.content) {
                  // 🎗️ Subscription content
                  this.DeleteItemByID(this.content.files, file.id);
                } else {
                  this.DeleteItemByID(this.product.files, file.id);
                }

                this.DeleteItemByID(this.files, file.id);

                if (data.capacity) this.shop.capacity = data.capacity;
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
    getFileUrl(file) {
      return this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.VAPI.DOWNLOAD_MY_VENDOR_PRODUCT_FILE(
            this.product.vendor_id,
            this.product.id,
            file.id,
          )
        : window.API.DOWNLOAD_PRODUCT_FILE(
            this.product.shop_id,
            this.product.id,
            file.id,
          );
    },

    fetchFiles: _.throttle(function () {
      this.busy_fetch = true;
      axios
        .get(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.GET_MY_VENDOR_PRODUCT_FILES(
                this.product.vendor_id,
                this.product.id,
              )
            : window.API.GET_PRODUCT_FILES(
                this.product.shop_id,
                this.product.id,
              ),
          {
            params: {
              content_id: this.content?.id, // 🎗️ Subscription  > This file is for a content?
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            if (this.content) {
              // 🎗️ Subscription content
              this.content.files = data.files;
            } else {
              this.product.files = data.files;
            }
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = null;
        });
    }, 3000),

    setFileName(file, name, target) {
      if (file.name === name) return;

      this.busy_name = file.id;
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_SET_PRODUCT_FILE_NAME(
                this.product.vendor_id,
                this.product.id,
                file.id,
              )
            : window.API.PUT_SET_PRODUCT_FILE_NAME(
                this.product.shop_id,
                this.product.id,
                file.id,
              ),
          {
            name: name,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.files, data.file);
            target.innerText = data.file.name; // Force update if file name corrected by server.
            this.showSuccessAlert(
              null,
              `File name has been updated successfully. New file name is ${file.name}`,
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_name = null;
        });
    },

    //-------------------------------------------------------------------------------------------------
    changeFilesOrder() {
      const sort = [];
      this.files.forEach((f) => sort.push(f.id));
      // console.log("changeFilesOrder", sort);
      this.busy_sort = true;
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_SET_PRODUCT_FILES_SORT(
                this.product.vendor_id,
                this.product.id,
              )
            : window.API.PUT_SET_PRODUCT_FILES_SORT(
                this.product.shop_id,
                this.product.id,
              ),
          {
            content_id: this.content?.id, // 🎗️ Subscription  > This file is for a content?
            sort: sort,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(null, `File sort saved successfully.`);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_sort = null;
        });
    },

    //-------------------------------------------------------------------------------------------------
    setSample(file, sample) {
      this.busy_sample = file.id;
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_SET_PRODUCT_FILE_SAMPLE(
                this.product.vendor_id,
                this.product.id,
                file.id,
              )
            : window.API.PUT_SET_PRODUCT_FILE_SAMPLE(
                this.product.shop_id,
                this.product.id,
                file.id,
              ),
          {
            sample: sample,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.files, data.file);

            this.showSuccessAlert(
              null,
              `File has been updated successfully. Now ${file.name} is <b>${
                data.file.sample ? "FREE" : "PAID"
              }</b>.`,
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_sample = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
