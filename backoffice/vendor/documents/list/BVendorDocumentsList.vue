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
  <div v-bind="$attrs">
    <div class="widget-box mb-5">
      <u-widget-header
        :add-caption="
          IS_VENDOR_PANEL
            ? $t('vendor_documents_list.action_upload_doc')
            : undefined
        "
        icon="post_add"
        :title="$t('vendor_documents_list.title')"
        @click:add="showUpload"
      ></u-widget-header>
      <v-list-subheader>
        {{
          IS_VENDOR_PANEL
            ? $t("vendor_documents_list.vendor_subtitle")
            : $t("vendor_documents_list.marketplace_subtitle")
        }}
      </v-list-subheader>
      <u-loading-progress v-if="busy"></u-loading-progress>

      <v-list
        class="border-between-vertical bg-transparent min-height-40vh"
        lines="two"
      >
        <!-- ----------------- Embed Docs ----------------- -->
        <v-list-item
          v-for="(doc, i) in documents_embed"
          :key="'e' + i"
          append-icon="edit"
          @click="showEmbedForm(doc)"
        >
          <template v-slot:prepend>
            <v-avatar tile>
              <v-icon>{{ getType(doc)?.icon }}</v-icon>
            </v-avatar>
          </template>

          <template v-slot:title>
            <b>{{ doc.title ? doc.title : $t(getType(doc)?.title) }}</b>
          </template>
          <v-list-item-subtitle
            v-html="doc.guide ? doc.guide : $t(getType(doc)?.description)"
          >
          </v-list-item-subtitle>
        </v-list-item>

        <!-- ----------------- Link Docs ----------------- -->
        <v-list-item
          v-for="(doc, i) in documents_link"
          :key="'l' + i"
          :href="doc.link"
          target="_blank"
          append-icon="open_in_new"
        >
          <template v-slot:prepend>
            <v-avatar tile>
              <v-icon>{{ getType(doc)?.icon }}</v-icon>
            </v-avatar>
          </template>

          <template v-slot:title>
            <b>{{ doc.title ? doc.title : $t(getType(doc)?.title) }}</b>
          </template>

          <v-list-item-subtitle
            v-html="doc.guide ? doc.guide : $t(getType(doc)?.description)"
          >
          </v-list-item-subtitle>
        </v-list-item>

        <!-- ----------------- Upload Docs ----------------- -->

        <v-list-item v-for="doc in uploaded_documents" :key="doc.id">
          <template v-slot:prepend>
            <v-avatar tile>
              <v-icon>{{ getType(doc)?.icon }}</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="d-flex align-center"
            ><b class="single-line d-block flex-grow-1 mb-1">
              <img
                :src="FileHelper.GetFileIcon(doc.name)"
                class="me-1"
                height="20"
                width="20"
              />

              {{ getTitleOfUploadedDoc(doc) }}</b
            >

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
              label
              size="x-small"
              variant="tonal"
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
  </div>

  <!-- ██████████████████████ Dialog > Upload Document ██████████████████████ -->

  <v-dialog
    v-model="dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1">pageview</v-icon>
        {{ $t("vendor_documents_list.upload_dialog.title") }}
      </v-card-title>
      <v-card-text>
        <div class="widget-box mb-5">
          <u-widget-header
            icon="assignment"
            :title="$t('vendor_documents_list.upload_dialog.type.title')"
          ></u-widget-header>
          <v-list-subheader>
            {{ $t("vendor_documents_list.upload_dialog.type.subtitle") }}
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
            class="my-5"
            color="primary"
            label="Document file"
            messages="Max image size: 8MB"
            placeholder="Select image or pdf..."
            prepend-icon=""
            prepend-inner-icon="attach_file"
            show-size
            variant="outlined"
          >
          </v-file-input>

          <v-textarea
            v-model="note"
            :counter="512"
            label="Note (optional)"
            persistent-placeholder
            placeholder="If necessary, provide a brief description for the attached file..."
            variant="outlined"
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

  <!-- ██████████████████████ Dialog > Embed Form ██████████████████████ -->

  <v-dialog
    v-model="dialog_embed"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card v-if="selected_embed" class="text-start" color="#eee">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1">view_cozy</v-icon>
        {{ selected_embed.title }}
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-sheet
            v-html="selected_embed.code"
            color="#fff"
            rounded="lg"
            class="overflow-hidden"
            v-dynamic-scripts="true"
            min-height="20vh"
          >
          </v-sheet>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog_embed = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import USmartMenu from "../../../../ui/smart/menu/USmartMenu.vue";
import VendorDocumentType from "@selldone/core-js/enums/vendor/VendorDocumentType";
import { SmartConvertTextToHtml } from "@selldone/core-js/helper/html/HtmlHelper";
import { FileHelper } from "@selldone/core-js/utils/file/FileHelper.ts";
import DynamicScriptDirective from "@selldone/components-vue/directives/script/DynamicScriptDirective.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BVendorDocumentsList",
  mixins: [],
  directives: {
    "dynamic-scripts": DynamicScriptDirective,
  },
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
      FileHelper: FileHelper,

      VendorDocumentType: VendorDocumentType,

      busy: false,
      uploaded_documents: [],
      totalItems: 0,

      //---------------------
      dialog: false,

      type: null,
      selected_file: null,
      busy_save: false,
      note: null,

      //---------------------
      busy_delete: null,

      selected_embed: null,
      dialog_embed: false,
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
    documents_embed() {
      return this.marketplace_documents.filter(
        (x) => VendorDocumentType.Embed.code === x.type,
      );
    },

    documents_link() {
      return this.marketplace_documents.filter(
        (x) => VendorDocumentType.Link.code === x.type,
      );
    },

    available_types() {
      if (!this.marketplace_documents) return [];
      return (
        this.marketplace_documents
          // Embed and Link document type has no upload! So, we exclude them and show them directly in the list
          .filter(
            (x) =>
              ![
                VendorDocumentType.Embed.code,
                VendorDocumentType.Link.code,
              ].includes(x.type),
          )
          .map((x) => {
            const obj = VendorDocumentType[x.type];
            return {
              ...obj,
              title: x.title || obj.title,
              guide: x.guide,
            };
          })
          .uniqueByKey("code")
      );
    },

    guide() {
      return this.available_types.find((i) => i.code === this.type)?.guide;
    },
  },

  created() {
    this.fetchDocuments();
  },

  methods: {
    /**
     * Create a title for uploaded document.
     * @param doc
     * @return {*}
     */
    getTitleOfUploadedDoc(doc) {
      const find = this.marketplace_documents.find((x) => x.type === doc.type);

      return (
        (find?.title ? find.title : $t(this.getType(doc)?.title)) +
        (doc.name ? ` | ${doc.name}` : "")
      );
    },
    showUpload() {
      this.type = null;
      this.selected_file = null;
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
            return NotificationService.showErrorAlert(null, data.error_msg);
          }

          this.uploaded_documents = data.documents;
          this.totalItems = data.total;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    saveDocument() {
      let formData = new FormData();
      formData.append("file", this.selected_file);

      formData.append("type", this.type);

      if (this.note) formData.append("note", this.note);

      this.busy_save = true;

      axios
        .post(window.VAPI.POST_MY_VENDOR_DOCUMENT_ADD(this.vendor.id), formData)
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.uploaded_documents, data.document);
            NotificationService.showSuccessAlert(
              null,
              "Document has been uploaded successfully.",
            );

            this.dialog = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    showDelete(document) {
      NotificationService.openDangerAlert(
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
                this.DeleteItemByID(this.uploaded_documents, document.id);
                NotificationService.showSuccessAlert(
                  null,
                  "Document has been deleted successfully.",
                );
              } else {
                NotificationService.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
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

    showEmbedForm(doc) {
      this.selected_embed = doc;
      this.dialog_embed = true;
    },
  },
};
</script>

<style lang="scss" scoped></style>
