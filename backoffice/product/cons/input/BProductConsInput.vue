<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <component
    :is="modern ? 'details' : 'div'"
    :class="modern ? 'b-product-edit-features__panel sd-modern-widget sd-modern-disclosure b-product-cons-input--modern text-start' : 'widget-box'"
  >
    <summary v-if="modern" class="sd-modern-disclosure__summary b-product-edit-features__summary">
      <b-product-edit-info-icon name="ThumbsDown" :size="18" />
      <span class="sd-modern-disclosure__copy b-product-edit-features__summary-copy">
        <span class="b-product-edit-features__summary-title">{{ $t('add_product.rating_pros_cons.cons_title') }}</span>
        <span class="b-product-edit-features__digest">{{ consDigest }}</span>
      </span>
      <span class="b-product-edit-features__count">{{ cons_list.length }} / 5</span>
      <b-product-edit-info-icon name="ChevronDown" :size="16" class="sd-modern-disclosure__chevron b-product-edit-features__chevron" />
    </summary>
    <div :class="{ 'b-product-edit-features__panel-content': modern }">
    <template v-if="!modern">
    <h2 class="d-flex align-center justify-space-between">
      <span>
        <v-icon class="me-1">sentiment_very_dissatisfied</v-icon
        >{{ $t("add_product.rating_pros_cons.cons_title") }}</span
      >

      <v-chip color="#D32F2F" size="small">
        <v-icon size="small" start>fa:fas fa-frown</v-icon>
        {{ cons_list.length }}
        {{ $t("add_product.rating_pros_cons.item_unit") }}
      </v-chip>
    </h2>
    <v-list-subheader
      >{{ $t("add_product.rating_pros_cons.cons_message") }}
    </v-list-subheader>
    </template>
    <p v-else class="b-product-edit-features__intro">{{ $t('add_product.features_modern.cons_intro') }}</p>

    <div v-if="modern" class="b-product-cons-input__rows">
      <div v-for="item in cons_list" :key="item.name" class="b-product-cons-input__row">
        <div class="b-product-cons-input__copy">
          <span class="b-product-cons-input__name">{{ item.name }}</span>
          <span class="b-product-cons-input__value">{{ item.value }}</span>
        </div>
        <div class="b-product-cons-input__row-actions">
          <v-btn class="sd-modern-icon-button" variant="text" icon :disabled="modernReadOnly || busy_delete_cons === item" :aria-label="$t('global.actions.edit') + ' · ' + item.name" @click="showEdit(item)">
            <b-product-edit-info-icon name="SquarePen" :size="16" />
            <v-tooltip activator="parent" :text="$t('global.actions.edit') + ' · ' + item.name" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true" :persistent="false" />
          </v-btn>
          <v-btn class="sd-modern-icon-button" variant="text" icon :disabled="modernReadOnly" :loading="busy_delete_cons === item" :aria-label="$t('global.actions.delete') + ' · ' + item.name" @click="deleteCons(item)">
            <b-product-edit-info-icon name="Trash2" :size="16" />
            <v-tooltip activator="parent" :text="$t('global.actions.delete') + ' · ' + item.name" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true" :persistent="false" />
          </v-btn>
        </div>
      </div>
    </div>

    <v-row v-else class="mt-2" no-gutters>
      <v-chip
        v-for="item in cons_list"
        :key="item.name"
        :disabled="busy_delete_cons === item"
        class="ps-10 ma-1"
        closable
        color="#fff"
        variant="flat"
        @click="showEdit(item)"
        @click:close="deleteCons(item)"
      >
        <template v-slot:prepend>
          <div
            class="icon-side rounded-circle"
            style="
              background-image: linear-gradient(
                -60deg,
                #ff5858 0%,
                #f09819 100%
              );
            "
          >
            <v-icon color="#fff">remove</v-icon>
          </div>
        </template>

        <span class="single-line d-inline-block">
          <b>{{ item.name }}</b> : {{ item.value }}
        </span>
      </v-chip>
    </v-row>


    <div :class="{ 'b-product-cons-input__fields': modern }">
    <v-text-field
      v-model="cons_name"
      :counter="32"
      :disabled="cons_list.length >= 5 || modernReadOnly"
      :label="$t(modern ? 'add_product.features_modern.feature_title' : 'add_product.rating_pros_cons.cons_input_title')"
      messages=" "
      :placeholder="modern ? undefined : 'Disadvantages name..'"
      :class="{ 'sd-modern-underlined-field': modern }"
      required
      variant="underlined"
    >
      <template v-slot:message>
        <u-smart-suggestion
          v-if="!modernReadOnly"
          :modern="modern"
          :preview-count="modern ? 2 : undefined"
          :samples="$tm('suggestions.product.cons_name')"
          class="mb-4"
          @select="
            (v) => {
              cons_name = v;
            }
          "
        ></u-smart-suggestion>
      </template>
    </v-text-field>
    <v-text-field
      v-model="cons_value"
      :counter="128"
      :disabled="cons_list.length >= 5 || modernReadOnly"
      :label="$t(modern ? 'add_product.features_modern.feature_detail' : 'add_product.rating_pros_cons.cons_input_value')"
      messages=" "
      :placeholder="modern ? undefined : 'Disadvantages value..'"
      :class="{ 'sd-modern-underlined-field': modern }"
      required
      variant="underlined"
    >
      <template v-slot:message>
        <u-smart-suggestion
          v-if="!modernReadOnly"
          :modern="modern"
          :preview-count="modern ? 2 : undefined"
          :samples="$tm('suggestions.product.cons_value')"
          class="mb-4"
          @select="
            (v) => {
              cons_value = v;
            }
          "
        ></u-smart-suggestion>
      </template>
    </v-text-field>
    </div>

    <div :class="modern ? 'b-product-cons-input__add-actions' : 'text-end'">
      <span v-if="modern" class="b-product-cons-input__help">{{ $t(cons_list.length >= 5 ? 'add_product.features_modern.full' : 'add_product.features_modern.pair_limit') }}</span>
      <v-btn
        :class="[{
          disabled: !modern && (
            !cons_name ||
            cons_name.length > 32 ||
            !cons_value ||
            cons_value.length > 128),
        }, modern ? 'sd-modern-button' : 'm-2 tnt']"
        :loading="busy_cons"
        :disabled="modern ? !canAddCons : undefined"
        :color="modern ? undefined : '#D32F2F'"
        :variant="modern ? 'outlined' : 'elevated'"
        @click="addCons"
      >
        <template v-if="modern" #prepend><b-product-edit-info-icon name="Plus" :size="16" /></template>
        <v-icon v-if="!modern" start>add</v-icon>
        {{ $t(modern ? 'add_product.features_modern.add_con' : 'global.actions.add') }}
      </v-btn>
    </div>

    <!-- ██████████████████████ Dialog ██████████████████████ -->

    <v-bottom-sheet v-model="edit_dialog" :max-width="modern ? 520 : 640" scrollable>
      <v-card :class="modern ? 'b-product-cons-input__dialog sd-modern-widget text-start' : 'rounded-t-xl'">
        <v-card-title :class="modern ? 'b-product-cons-input__dialog-title' : 'd-flex align-center'">
          <b-product-edit-info-icon v-if="modern" name="SquarePen" :size="18" />
          <v-icon v-else class="me-1" color="#111">edit_note</v-icon>
          <span v-if="modern">{{ $t('add_product.features_modern.edit_feature') }}</span>
          <template v-else>Edit | <b class="mx-1">{{ selected_item?.name }}</b></template></v-card-title
        >
        <v-card-text>
          <div class="max-widget-width">
            <v-text-field
              v-model="input_name"
              :label="modern ? $t('add_product.features_modern.feature_title') : 'Name'"
              :disabled="modernReadOnly"
              :class="{ 'sd-modern-underlined-field': modern }"
              variant="underlined"
            ></v-text-field>
            <v-text-field
              v-model="input_value"
              :label="modern ? $t('add_product.features_modern.feature_detail') : 'Value'"
              :disabled="modernReadOnly"
              :class="{ 'sd-modern-underlined-field': modern }"
              variant="underlined"
            ></v-text-field>
          </div>
        </v-card-text>

        <v-card-actions>
          <div :class="modern ? 'b-product-cons-input__dialog-actions' : 'widget-buttons pt-8'">
            <v-btn :class="{ 'sd-modern-button': modern }" :size="modern ? undefined : 'x-large'" :variant="modern ? 'outlined' : 'text'" @click="edit_dialog = false">
              <v-icon v-if="!modern" start>close</v-icon>
              {{ $t(modern ? 'global.actions.cancel' : 'global.actions.close') }}
            </v-btn>
            <v-btn
              :disabled="!input_name || !input_value || modernReadOnly"
              :loading="busy_update"
              color="primary"
              :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
              :size="modern ? undefined : 'x-large'"
              variant="elevated"
              @click="updateValue()"
            >
              <template v-if="modern" #prepend><b-product-edit-info-icon name="Save" :size="16" /></template>
              <v-icon v-if="!modern" start>save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
    </div>
  </component>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default defineComponent({
  name: "BProductConsInput",
  mixins: [],
  components: { USmartSuggestion, BProductEditInfoIcon },
  props: {
    modern: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    product: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    cons_list: [],

    cons_name: "",
    cons_value: "",
    busy_cons: false,
    busy_delete_cons: null,

    //-----------------------
    selected_item: null,
    input_name: null,
    input_value: null,
    edit_dialog: false,
    busy_update: false,
  }),

  computed: {
    modernReadOnly() {
      return this.modern && this.readOnly;
    },
    consDigest() {
      return this.cons_list.map((item) => item.name).join(' · ') || this.$t('add_product.features_modern.empty');
    },
    canAddCons() {
      return !this.modernReadOnly && !this.busy_cons && this.cons_list.length < 5 &&
        !!this.cons_name && this.cons_name.length <= 32 &&
        !!this.cons_value && this.cons_value.length <= 128;
    },
  },

  created() {
    this.createConsList();
  },

  methods: {
    showEdit(item) {
      if (this.modernReadOnly) return;
      const { name, value } = item;
      this.selected_item = item;
      this.input_name = name;
      this.input_value = value;
      this.edit_dialog = true;
    },

    createConsList() {
      let out = [];
      let list = this.product.cons;

      if (this.isObject(list)) {
        Object.keys(this.product.cons).forEach((key) => {
          let value = this.product.cons[key];
          out.push({ name: key, value: value });
        });
      }

      this.cons_list = out;
    },

    addCons() {
      if (this.modern && !this.canAddCons) return;
      this.busy_cons = true;

      axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POST_MY_VENDOR_ADD_CONS(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_ADD_CONS(this.product.shop_id, this.product.id),
          {
            name: this.cons_name,
            value: this.cons_value,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "add_product.rating_pros_cons.notifications.add_cons_success",
              ),
            );
            this.product.cons = data.cons;
            this.cons_name = "";
            this.cons_value = "";
            this.createConsList();
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_cons = false;
        });
    },

    deleteCons(item) {
      if (this.modernReadOnly) return;
      this.busy_delete_cons = item;

      axios
        .delete(
          this.IS_VENDOR_PANEL
            ? window.VAPI.DELETE_MY_VENDOR_CONS(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.DELETE_CONS(this.product.shop_id, this.product.id),
          {
            params: {
              name: item.name,
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "add_product.rating_pros_cons.notifications.delete_cons_success",
              ),
            );
            this.product.cons = data.cons;
            this.createConsList();

            this.$forceUpdate(); // Update vue component!
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete_cons = null;
        });
    },

    updateValue() {
      if (this.modern && (this.modernReadOnly || !this.input_name || !this.input_value)) return;
      this.busy_update = true;

      const url = this.IS_VENDOR_PANEL
        ? window.VAPI.PUT_MY_VENDOR_UPDATE_CONS(
            this.$route.params.vendor_id,
            this.product.id,
          )
        : window.API.PUT_UPDATE_CONS(this.product.shop_id, this.product.id);

      axios
        .put(url, {
          key: this.selected_item.name,
          name: this.input_name,
          value: this.input_value,
        })
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "Item has been updated successfully saved.",
            );

            if (data.pros) this.product.pros = data.pros;
            if (data.cons) this.product.cons = data.cons;

            this.createConsList();

            this.$forceUpdate(); // Update vue component!

            this.edit_dialog = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update = false;
        });
    },
  },
});
</script>

<style lang="scss" scoped>
.b-product-cons-input--modern {
  .b-product-cons-input__row { display: flex; align-items: flex-start; gap: 14px; min-width: 0; padding: 15px 10px; }
  .b-product-cons-input__row + .b-product-cons-input__row { border-block-start: 1px solid var(--sd-modern-border); }
  .b-product-cons-input__copy { display: grid; gap: 4px; flex: 1; min-width: 0; overflow-wrap: anywhere; unicode-bidi: plaintext; }
  .b-product-cons-input__name { font-size: 13px; font-weight: 500; line-height: 20px; }
  .b-product-cons-input__value { color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  .b-product-cons-input__row-actions { display: flex; align-items: center; flex-shrink: 0; gap: 8px; }
  .b-product-cons-input__fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr); align-items: start; gap: 18px; margin-block-start: 10px; }
  .b-product-cons-input__fields > .v-input { min-width: 0; }
  .b-product-cons-input__fields :deep(.v-input__details) { padding-inline: 0; }
  .b-product-cons-input__fields :deep(.u-smart-suggestion) { margin-block-end: 0 !important; }
  .b-product-cons-input__add-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-block-start: 17px; }
  .b-product-cons-input__add-actions > .v-btn { flex-shrink: 0; }
  .b-product-cons-input__help { color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  @media (max-width: 800px) {
    .b-product-cons-input__fields { grid-template-columns: minmax(0, 1fr); gap: 5px; }
  }
  @media (max-width: 660px) {
    .b-product-cons-input__row { gap: 10px; padding-block: 14px; }
    .b-product-cons-input__row-actions { gap: 6px; }
    .b-product-cons-input__add-actions { flex-wrap: wrap; align-items: flex-start; }
    .b-product-cons-input__help { flex-basis: 100%; }
    .b-product-cons-input__add-actions > .v-btn { margin-inline-start: auto; }
  }
}

.b-product-cons-input__dialog {
  box-sizing: border-box;
  padding: 23px;
  border-radius: 18px 18px 0 0;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 14px;
  line-height: 21px;

  :deep(.sd-modern-underlined-field .v-field),
  :deep(.sd-modern-underlined-field .v-field__input),
  :deep(.sd-modern-underlined-field .v-input__details) { box-sizing: border-box; }
  .b-product-cons-input__dialog-title { display: flex; align-items: center; gap: 10px; padding: 0; font: inherit; font-size: 18px; font-weight: 500; line-height: 26px; white-space: normal; }
  .v-card-text { padding: 14px 0 0; }
  .v-card-text .v-input + .v-input { margin-block-start: 14px; }
  .v-card-actions { padding: 0; }
  .b-product-cons-input__dialog-actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 9px; width: 100%; padding-block-start: 25px; }
}
</style>
