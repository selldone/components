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
        :disabled="readonly"
        :label="item.title"
        :persistent-placeholder="!!item.hint"
        :placeholder="item.hint"
        :style="{ 'animation-delay': `${index * 150}ms` }"
        append-inner-icon="fa:fas fa-copy"
        variant="outlined"
        @update:model-value="$emit('update:modelValue', message)"
        @click:append-inner="copyToClipboard(message[item.name])"
      />

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-select
        v-else-if="item.type === 'select'"
        v-model="message[item.name]"
        :chips="item.multiple"
        :disabled="readonly"
        :items="item.selects"
        :label="item.title"
        :multiple="item.multiple"
        :persistent-placeholder="!!item.hint"
        :placeholder="item.hint"
        :style="{ 'animation-delay': `${index * 150}ms` }"
        variant="outlined"
        @update:model-value="$emit('update:modelValue', message)"
      />

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ switch ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <u-smart-switch
        v-else-if="item.type === 'switch'"
        v-model="message[item.name]"
        :disabled="readonly"
        :false-description="item.hint_false"
        :false-title="$t('global.actions.no')"
        :label="item.title"
        :true-description="item.hint_true"
        :true-title="$t('global.actions.yes')"
        class="mx-3 mt-3 mb-5"
        false-icon="close"
        true-icon="check"
        @change="$forceUpdate()"
      >
      </u-smart-switch>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ File ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-file-input
        v-else-if="
          item.type === 'file' &&
          !readonly &&
          (item.multiple || !getFiles(item.name).length)
        "
        v-model="files[item.name]"
        :chips="item.multiple"
        :label="item.title"
        :multiple="item.multiple"
        :persistent-placeholder="!!item.hint"
        :placeholder="item.hint"
        :rules="[]"
        :style="{ 'animation-delay': `${index * 150}ms` }"
        append-inner-icon="attach_file"
        messages="Max file size: 20MB"
        prepend-icon=""
        show-size
        single-line
        variant="outlined"
        @update:model-value="$emit('update:modelValue', message)"
      />

      <v-fade-transition
        class="border-between-vertical"
        group
        hide-on-leave
        tag="div"
      >
        <div v-for="f in getFiles(item.name)" :key="f.id" class="p-2">
          <div class="d-flex align-center mnh">
            <img
              v-if="FileHelper.GetFileIcon(f.filename)"
              :src="FileHelper.GetFileIcon(f.filename)"
              class="me-2 -thin -gray flex-grow-0"
              height="24"
              width="24"
            />
            <v-icon v-else class="me-2 -thin -gray flex-grow-0" color="primary"
              >attach_file
            </v-icon>

            <div class="flex-grow-1">
              <b>
                {{ f.filename }}
              </b>
              <v-list-subheader class="p-0" style="height: auto">
                {{ numeralFormat(f.size, "0.[0] b") }}
                <span class="mx-1">/</span>
                <span :title="getLocalTimeString(f.created_at)">{{
                  getFromNowString(f.created_at)
                }}</span>
              </v-list-subheader>
            </div>

            <!-- Delete -->
            <v-btn
              v-if="!readonly"
              :loading="busy_delete === f.id"
              color="red"
              icon
              variant="text"
              @click="deleteFile(f)"
            >
              <v-icon>close</v-icon>
            </v-btn>

            <!-- Download -->
            <v-btn
              v-if="isAdmin"
              :loading="busy_download === f.id"
              color="primary"
              icon
              variant="text"
              @click="downloadFile(f)"
            >
              <v-icon>download</v-icon>
            </v-btn>
          </div>
        </div>
      </v-fade-transition>
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { FileHelper } from "@selldone/core-js/utils/file/FileHelper.ts";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import {
  FORM_BUILDER_TAGS,
  SmartConvertTextToHtml,
} from "@selldone/core-js/helper/html/HtmlHelper";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";


export default {
  name: "SBasketProductInputs",
  mixins: [DateMixin ],
  components: { USmartSwitch },

  emits: ["update:modelValue", "update:files", "onDeleteFile"],
  props: {
    modelValue: {},
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
    modelValue() {
      this.message = this.modelValue;
    },
  },

  created() {
    this.message = this.modelValue;

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
            file_item.id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("onDeleteFile", {
              item_id: file_item.item_id,
              file_id: file_item.id,
            });
            NotificationService.showSuccessAlert(null, "File removed successfully!");
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

    downloadFile(file_item) {
      this.busy_download = file_item.id;
      axios
        .get(
          window.API.GET_BASKET_ITEM_FILE_DOWNLOAD_LINK(
            this.getShop().id,
            file_item.basket_id,
            file_item.id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            window.open(data.url, "_blank").focus();

            NotificationService.showSuccessAlert(
              null,
              "The secure download link has been generated successfully!",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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
