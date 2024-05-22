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
  <div>
    <div class="widget-box mb-5">
      <s-widget-header
        :add-caption="IS_VENDOR_PANEL ? 'Upload Doc' : undefined"
        icon="post_add"
        title="Documents"
        @click:add="showUpload"
      ></s-widget-header>
      <v-list-subheader>
        {{
          IS_VENDOR_PANEL
            ? "Please upload the necessary business, IP, and address verification documents. We require this information to confirm your partnership and provide you with the necessary access."
            : "Vendors can submit documents such as business, intellectual property, and address verification to facilitate their KYC process, allowing you to grant them the appropriate access."
        }}
      </v-list-subheader>
      <u-loading-progress v-if="busy"></u-loading-progress>

      <v-list
        class="border-between-vertical bg-transparent min-height-40vh"
        lines="two"
      >
        <v-list-item v-for="doc in documents" :key="doc.id">
          <template v-slot:prepend>
            <v-avatar tile>
              <v-icon>{{ getType(doc)?.icon }}</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="d-flex align-center"
            ><b class="single-line d-block flex-grow-1 mb-1">

            <img :src="FileHelper.GetFileIcon(doc.name)" width="20" height="20" class="me-1">

            {{
              $t(getType(doc)?.title) + (doc.name ? ` | ${doc.name}` : "")
            }}</b>

            <v-chip
              v-if="doc.verify_at"
              class="ma-1 min-width-max-content"
              color="success"
              label
              size="x-small"
              variant="tonal"
              >Verified
            </v-chip>
            <v-chip
              v-if="doc.reject_at"
              class="ma-1 min-width-max-content"
              color="red"
              variant="tonal"
              label
              size="x-small"
              >Rejected
            </v-chip>
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ doc.note ? doc.note : $t(getType(doc)?.description) }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-list-item-action>
              <u-smart-menu
                :items="[
                  {
                    title: 'Download attachment',
                    icon: 'download',
                    href: getPrivateDownload(doc),
                    target: '_blank',
                  },

                  {
                    title: 'Delete document',
                    icon: 'delete',
                    click: () => {
                      showDelete(doc);
                    },
                  },
                ]"
                :loading="busy_delete === doc.id"
              >
              </u-smart-menu>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
    </div>

    <!-- ██████████████████████ Dialog ██████████████████████ -->

    <v-dialog
      v-model="dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="text-start">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1">pageview</v-icon>
          Upload Document
        </v-card-title>
        <v-card-text>
          <div class="widget-box mb-5">
            <s-widget-header
              icon="assignment"
              title="Document Type"
            ></s-widget-header>
            <v-list-subheader>
              Please upload only the necessary documents. Avoid sharing any
              documents that contain sensitive information. We request documents
              that are publicly available.
            </v-list-subheader>
            <u-smart-select
              v-model="type"
              :items="available_types"
              class="my-3"
              item-description="description"
              item-icon="icon"
              item-text="title"
              item-value="code"
            >
            </u-smart-select>

            <div v-if="guide" class="py-3 typo-body">
              <v-icon class="me-1">info_outline</v-icon>
              <span v-html="smartConvert(guide)"></span>
            </div>

            <v-file-input
              v-model="selected_file"
              accept=".png,.jpg,.jpeg,.pdf"
              class="mb-5"
              color="primary"
              label="Document file"
              messages="Max image size: 8MB"
              placeholder="Select image or pdf..."
              prepend-icon=""
              prepend-inner-icon="attach_file"
              show-size
              variant="underlined"
            >
            </v-file-input>

            <v-textarea
              v-model="note"
              :counter="512"
              label="Note (optional)"
              persistent-placeholder
              placeholder="If necessary, provide a brief description for the attached file..."
              variant="underlined"
            ></v-textarea>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              :loading="busy_save"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="saveDocument"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import USmartMenu from "../../../../ui/smart/menu/USmartMenu.vue";
import VendorDocumentType from "@selldone/core-js/enums/vendor/VendorDocumentType";
import { SmartConvertTextToHtml } from "@selldone/core-js/helper/html/HtmlHelper";
import {FileHelper} from "@selldone/core-js/helper/converters/FileHelper";

export default {
  name: "BVendorDocumentsList",
  components: {
    USmartMenu,
    USmartSelect,
  },
  props: {
    shop: {
      require: true,
      type: Object,
    },
    vendor: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {
      FileHelper:FileHelper,

      VendorDocumentType: VendorDocumentType,

      busy: false,
      documents: [],
      totalItems: 0,

      //---------------------
      dialog: false,

      type: null,
      selected_file: [],
      busy_save: false,
      note: null,

      //---------------------
      busy_delete: null,
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

    marketplace_documents() {
      return this.shop.marketplace?.documents; // array of {type,guide}
    },
    available_types() {
      if (!this.marketplace_documents) return [];
      return this.marketplace_documents
        .map((x) => {
          const obj = VendorDocumentType[x.type];
          return Object.assign({ guide: x.guide }, obj);
        })
        .uniqueByKey("code");
    },

    guide() {
      return this.available_types.find((i) => i.code === this.type)?.guide;
    },
  },

  created() {
    this.fetchDocuments();
  },

  methods: {
    showUpload() {
      this.type = null;
      this.selected_file = [];
      this.note = null;
      this.dialog = true;
    },

    getType(document) {
      return VendorDocumentType[document?.type];
    },
    getPrivateDownload(document) {
      return this.window.VAPI.GET_MY_VENDOR_DOCUMENTS_DOWNLOAD_URL(
        this.vendor.id,
        document.id,
      );
    },

    fetchDocuments() {
      this.busy = true;

      axios
        .get(
          window.VAPI.GET_MY_VENDOR_UPLOADED_DOCUMENTS_LIST(this.vendor.id),
          {
            params: {
              offset: 0,
              limit: 20,
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null, data.error_msg);
          }

          this.documents = data.documents;
          this.totalItems = data.total;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    saveDocument() {
      let formData = new FormData();
      formData.append(
        "file",
        this.selected_file?.length ? this.selected_file[0] : null,
      );

      formData.append("type", this.type);

      if (this.note) formData.append("note", this.note);

      this.busy_save = true;

      axios
        .post(window.VAPI.POST_MY_VENDOR_DOCUMENT_ADD(this.vendor.id), formData)
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.documents, data.document);
            this.showSuccessAlert(
              null,
              "Document has been uploaded successfully.",
            );

            this.dialog = false;
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

    showDelete(document) {
      this.openDangerAlert(
        "Delete document",
        "Are you sure to delete this document?",
        "Yes, Delete now",
        () => {
          this.busy_delete = document.id;

          axios
            .delete(
              window.VAPI.DELETE_MY_VENDOR_DOCUMENT(
                this.vendor.id,
                document.id,
              ),
            )
            .then(({ data }) => {
              if (!data.error) {
                this.DeleteItemByID(this.documents, document.id);
                this.showSuccessAlert(
                  null,
                  "Document has been deleted successfully.",
                );
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
    smartConvert(guide) {
      return SmartConvertTextToHtml(guide, false);
    },
  },
};
</script>

<style lang="scss" scoped></style>
