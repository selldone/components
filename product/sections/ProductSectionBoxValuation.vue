<template>
  <div
    v-if="structure && preferences_valuation && product.price_input === 'custom'"
    class="widget-box w-100 py-3 mt-5 pricing-form strong-field"
  >
    <!--
    <b>valuation:</b>
    <div>
      {{ product.valuation }}
    </div>

    <b> preferences:</b>
    <div>
      {{ preferences }}
    </div>

    <b> selected_values:</b>
    <div>
      {{ selected_values }}
    </div>
-->
    <progress-loading v-if="busy_save"></progress-loading>
    <div
      v-for="(item, index) in structure"
      :key="index"
      class="position-relative"
    >
      <!-- Normal -->
      <v-text-field
        v-if="!item.type"
        v-model="preferences_valuation[item.name]"
        :label="item.title"
        :placeholder="item.placeholder"
        :persistent-placeholder="!!item.placeholder"
        @input="$emit('update:preferences', preferences);$forceUpdate()"
        :readonly="readonly"
        @blur="debounceSavePreferences()"

        background-color="transparent"
        class="mx-4"
      >
      </v-text-field>

      <!-- Number -->
      <number-picker
        v-else-if="item.type === 'number'"
        v-model="preferences_valuation[item.name]"
        :label="item.title"
        @input="$emit('update:preferences', preferences)"
        :readonly="readonly"
        @blur="debounceSavePreferences()"

        background-color="transparent"
        :min="0"
        class="mx-4"
      >
      </number-picker>

      <!-- Select -->
      <v-select
        v-else-if="item.type === 'select'"
        v-model="preferences_valuation[item.name]"
        :items="filterSelects(item.selects, preferences_valuation[item.name])"
        menu-props="auto"
        :label="item.title"
        :placeholder="item.placeholder"
        :persistent-placeholder="!!item.placeholder"
        :readonly="readonly"
        :disabled="readonly"
        :multiple="item.multiple"
        :chips="item.multiple"
        clearable
        @click:clear="preferences_valuation[item.name] = null"
        @change="$emit('update:preferences', preferences);$forceUpdate();debounceSavePreferences()"

        background-color="transparent"
        class="mx-4"
      >
      </v-select>
      <!-- switch -->
      <s-smart-switch
        v-else-if="item.type === 'switch'"
        v-model="preferences_valuation[item.name]"
        :label="item.title"
        @input="$emit('update:preferences', preferences);$forceUpdate()"
        :true-title="
          item.true_title ? item.true_title : $t('global.actions.yes')
        "
        :true-description="item.true_desc"
        :false-title="
          item.false_title ? item.false_title : $t('global.actions.no')
        "
        :false-description="item.false_desc"
        true-icon="check"
        false-icon="close"
        solo
        :true-disabled="!checkAvailable(`${item.name}-TRUE`)"
        :false-disabled="!checkAvailable(`${item.name}-FALSE`)"
        @change="debounceSavePreferences"
        class="mx-4 mb-5"
        :readonly="readonly"

      >
      </s-smart-switch>

      <!-- File not implemented yet!-->
      <!--
      <template v-if="item.type === 'file'">
        <v-file-input
          v-if="!readonly && (item.multiple || !getFiles(item.name).length)"
          v-model="files[item.name]"
          :rules="[]"
          menu-props="auto"
          :label="item.title"
          @input="$emit('update:preferences', preferences)"
          :multiple="item.multiple"
          :chips="item.multiple"
          messages="Max file size: 20MB"
          show-size
          prepend-icon=""
          append-icon="attach_file"
          @blur="debounceSavePreferences"
          background-color="transparent"
          class="mx-4"
        />

        <v-fade-transition
          group
          hide-on-leave
          tag="div"
          class="border-between-vertical mx-4"
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
              <v-icon
                v-else
                color="primary"
                class="me-2 -thin -gray flex-grow-0"
                >attach_file</v-icon
              >

              <div class="flex-grow-1">
                <b>
                  {{ f.filename }}
                </b>
                <v-subheader style="height: auto" class="p-0">
                  {{ f.size | numeralFormat("0.[0] b") }}
                  <span class="mx-1">/</span>
                  <span :title="getLocalTimeString(f.created_at)">{{
                    getFromNowString(f.created_at)
                  }}</span>
                </v-subheader>
              </div>


              <v-btn
                v-if="!readonly"
                icon
                color="red"
                @click="deleteFile(f)"
                :loading="busy_delete === f.id"
              >
                <v-icon>close</v-icon>
              </v-btn>


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
      </template>
      -->
      <v-icon
        color="#1976D2"
        v-if="index_blink === index"
        class="blink-me-linear indic"
        x-small
        >circle</v-icon
      >
    </div>
  </div>

</template>

<script>
import { FileHelper } from "../../../../core/helper/converters/FileHelper";
import SSmartSwitch from "@/Components/smart/SSmartSwitch.vue";
import NumberPicker from "@/Components/ui/input/number/NumberPicker.vue";
import _ from "lodash-es";

export default {
  name: "ProductSectionBoxValuation",
  components: { NumberPicker, SSmartSwitch },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    product: {
      required: true,
      type: Object,
    },

    currentVariant: {},
    preferences: {},

    readonly: {
      type: Boolean,
      default: false,
    },

    correspondingBasketItem: {},

    files: {},
    uploadedFiles: {},
  },

  data: () => ({
    FileHelper: FileHelper,
    busy_delete: null,
    busy_download: null,

    preferences_valuation: {},

    busy_save: false,
  }),

  computed: {
    valuation() {
      return this.product.valuation;
    },

    structure() {
      return this.valuation && this.valuation.structure;
    },

    conditions() {
      return this.valuation && this.valuation.conditions;
    },

    unavailable() {
      return this.conditions && this.conditions.unavailable;
    },

    selected_values() {
      if (!this.preferences_valuation) return [];

      return Object.values(this.preferences_valuation);
    },

    basket() {
      return this.getBasket(this.product.type);
    },

    index_blink() {
      return this.structure.findIndex(
        (row) =>row.type!=='switch' && !this.preferences_valuation[row.name]
      );
    },


  },

  watch: {

    preferences: {
      handler() {
        this.assignPreferences();
      },
      deep: true,
    },


  },

  created() {
    this.assignPreferences();
  },

  methods: {
    assignPreferences() {



  this.preferences_valuation = this.preferences.valuation;




    },

    filterSelects(items, ignore_current_val) {
      if (!this.unavailable || !this.unavailable.length) return items;
      return items.filter(
        (item) => item === ignore_current_val || this.checkAvailable(item)
      );
    },
    checkAvailable(item) {
      if (!this.unavailable || !this.unavailable.length) return true;

      return !this.unavailable.some((unval) => {
        const arr = unval.split(":"); // Extract two side of keys.
        //  console.log('split',arr,'item',item,'selected_values',this.selected_values,  arr.includes(item),this.selected_values.includes(arr[0]) || this.selected_values.includes(arr[1]))
        // Item + previously selected items not be in constraints:
        return (
          //1. Item included in the split array
          arr.includes(item) &&
          //2. Selected items included in the split array
          (this.selected_values.includes(arr[0]) ||
            this.selected_values.includes(arr[1]))
        );
      });
    },

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
            this.shop.name,
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
            this.shop.id,
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

    debounceSavePreferences: _.debounce(
      function () {
        // console.log("Auto get rates...");
        this.saveBasketItemPreferences();
      },
      1000,
      { maxWait: 3000, trailing: true }
    ),

    saveBasketItemPreferences() {
      // Check item exist in the basket:
      if (!this.correspondingBasketItem || this.readonly) return;

      this.busy_save = true;

      axios
        .put(
          window.XAPI.PUT_BASKET_ITEM_PREFERENCES(
            this.shop.name,
            this.product.id
          ),
          {
            basket_id: this.basket.id,
            variant_id: this.currentVariant ? this.currentVariant.id : null,
            preferences: this.preferences,
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            let basket_item = this.basket.items.find(
              (item) => item.id === data.item.id
            );
            // basket_item.preferences = data.item.preferences;

            Object.assign(basket_item, data.item);

            this.showSuccessAlert(
              null,
              this.$t("global.basket_item_message.notifications.success")
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
          //     this.show = this.fill_percent < 95 || this.forceShow;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.pricing-form {

  .indic {
    position: absolute !important;
    top: 50%;
    right: unset;
    left: -4px;
    transform: translate(0, -50%);
  }
}
</style>
