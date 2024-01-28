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
  <div>
    <div v-for="(item, index) in product.inputs" :key="item.name">
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Note ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <div v-if="item.type === 'note'" v-html="convertToHtml(item.title)"></div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Normal ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-text-field
        v-else-if="!item.type || item.type === 'text'"
        v-model="message[item.name]"
        :label="item.title"
        @input="$emit('input', message)"
        :style="{ 'animation-delay': `${index * 150}ms` }"
        :readonly="readonly"
        append-inner-icon="fa:fas fa-copy"
        @click:append-inner="copyToClipboard(message[item.name])"
        outlined
        :placeholder="item.hint"
        :persistent-placeholder="!!item.hint"
      />

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-select
        v-else-if="item.type === 'select'"
        v-model="message[item.name]"
        :items="item.selects"
        menu-props="auto"
        :label="item.title"
        @input="$emit('input', message)"
        :style="{ 'animation-delay': `${index * 150}ms` }"
        :readonly="readonly"
        :disabled="readonly"
        :multiple="item.multiple"
        :chips="item.multiple"
        outlined
        :placeholder="item.hint"
        :persistent-placeholder="!!item.hint"
      />

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ switch ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <s-smart-switch
        v-else-if="item.type === 'switch'"
        v-model="message[item.name]"
        :label="item.title"
        class="mx-3 mt-3 mb-5"
        :true-title="$t('global.actions.yes')"
        :false-title="$t('global.actions.no')"
        :true-description="item.hint_true"
        :false-description="item.hint_false"
        true-icon="check"
        false-icon="close"
        :readonly="readonly"
        @change="$forceUpdate()"
      >
      </s-smart-switch>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ File ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-file-input
        v-else-if="
          item.type === 'file' &&
          !readonly &&
          (item.multiple || !getFiles(item.name).length)
        "
        v-model="files[item.name]"
        :rules="[]"
        menu-props="auto"
        :label="item.title"
        @input="$emit('input', message)"
        single-line
        :style="{ 'animation-delay': `${index * 150}ms` }"
        :multiple="item.multiple"
        :chips="item.multiple"
        messages="Max file size: 20MB"
        show-size
        prepend-icon=""
        append-icon="attach_file"
        outlined
        :placeholder="item.hint"
        :persistent-placeholder="!!item.hint"
      />

      <v-fade-transition
        group
        hide-on-leave
        tag="div"
        class="border-between-vertical"
      >
        <div v-for="f in getFiles(item.name)" :key="f.id" class="p-2">
          <div class="d-flex align-center mnh">
            <img
              v-if="FileHelper.GetFileIcon(f.filename)"
              :src="FileHelper.GetFileIcon(f.filename)"
              height="24"
              width="24"
              class="me-2 -thin -gray flex-grow-0"
            />
            <v-icon v-else color="primary" class="me-2 -thin -gray flex-grow-0"
              >attach_file</v-icon
            >

            <div class="flex-grow-1">
              <b>
                {{ f.filename }}
              </b>
              <v-list-subheader style="height: auto" class="p-0">
                {{  numeralFormat(f.size ,"0.[0] b") }}
                <span class="mx-1">/</span>
                <span :title="getLocalTimeString(f.created_at)">{{
                  getFromNowString(f.created_at)
                }}</span>
              </v-list-subheader>
            </div>

            <!-- Delete -->
            <v-btn
              v-if="!readonly"
              icon
              color="red"
              @click="deleteFile(f)"
              :loading="busy_delete === f.id"
            >
              <v-icon>close</v-icon>
            </v-btn>

            <!-- Download -->
            <v-btn
              v-if="isAdmin"
              icon
              color="primary"
              @click="downloadFile(f)"
              :loading="busy_download === f.id"
            >
              <v-icon>download</v-icon>
            </v-btn>
          </div>
        </div>
      </v-fade-transition>
    </div>
  </div>
</template>

<script>
import { FileHelper } from "@core/helper/converters/FileHelper";
import SSmartSwitch from "@components/smart/SSmartSwitch.vue";
import {
  FORM_BUILDER_TAGS,
  SmartConvertTextToHtml,
} from "@core/helper/html/HtmlHelper";

export default {
  name: "SBasketProductInputs",
  components: { SSmartSwitch },
  props: {
    value: {},
    product: {
      require: true,
      type: Object,
    },
    readonly: {
      default: false,
      type: Boolean,
    },
    isAdmin: {
      default: false,
      type: Boolean,
    },
    files: {},
    uploadedFiles: {},
  },
  data: () => ({
    FileHelper: FileHelper,
    message: {},

    busy_delete: null,
    busy_download: null,
  }),

  watch: {
    value() {
      this.message = this.value;
    },
  },

  created() {
    this.message = this.value;

    let files = {};

    // Set default values:
    try {
      this.product.inputs.forEach((input) => {
        if (input.default && this.message[input.name] === undefined) {
          this.message[input.name] = input.default;
        }
        // Initial files:
        if (input.type === "file") {
          files[input.name] = null;
        }
      });
    } catch (e) {
      console.error(e);
    }

    this.$emit("update:files", files);
  },

  methods: {
    getFiles(key) {
      if (!this.uploadedFiles) return [];
      return (
        this.uploadedFiles && this.uploadedFiles.filter((f) => f.key === key)
      );
    },
    deleteFile(file_item) {
      this.busy_delete = file_item.id;
      axios
        .delete(
          window.XAPI.DELETE_BASKET_ITEM_FILE(
            this.getShop().name,
            file_item.basket_id,
            file_item.id
          )
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("onDeleteFile", {
              item_id: file_item.item_id,
              file_id: file_item.id,
            });
            this.showSuccessAlert(null, "File removed successfully!");
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

    downloadFile(file_item) {
      this.busy_download = file_item.id;
      axios
        .get(
          window.API.GET_BASKET_ITEM_FILE_DOWNLOAD_LINK(
            this.getShop().id,
            file_item.basket_id,
            file_item.id
          )
        )
        .then(({ data }) => {
          if (!data.error) {
            window.open(data.url, "_blank").focus();

            this.showSuccessAlert(
              null,
              "The secure download link has been generated successfully!"
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_download = null;
        });
    },

    convertToHtml(message) {
      return SmartConvertTextToHtml(message, false, false, FORM_BUILDER_TAGS);
    },
  },
};
</script>

<style scoped></style>
