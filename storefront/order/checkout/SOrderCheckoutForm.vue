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
  <div v-if="form?.length && local_value ">
    <div class="spacer-line my-3" :caption="$t('global.commons.more_info_needed')" />


    <div v-for="(item, index) in form" :key="item.name">
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Note ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <div v-if="item.type === 'note'" v-html="convertToHtml(item.title)" class="mb-3"></div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Normal ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-text-field
        v-else-if="!item.type || item.type === 'text'"
        v-model="local_value[item.name]"
        :disabled="readonly"
        :label="item.title"
        :persistent-placeholder="!!item.hint"
        :placeholder="item.hint"
        :style="{ 'animation-delay': `${index * 150}ms` }"
        variant="outlined"
        @update:model-value="$emit('update:modelValue', local_value)"
        @blur="$emit('changed')"
      >
        <template v-slot:append-inner>
          <flag v-if="is_override" :iso="country" :squared="false" class="me-2" />

          <v-chip v-if="item.required" label size="x-small" color="#000" variant="flat">{{$t('global.commons.required')}}</v-chip>
        </template>

      </v-text-field>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-select
        v-else-if="item.type === 'select'"
        v-model="local_value[item.name]"
        :chips="item.multiple"
        :disabled="readonly"
        :items="item.selects"
        :label="item.title"
        :multiple="item.multiple"
        :persistent-placeholder="!!item.hint"
        :placeholder="item.hint"
        :style="{ 'animation-delay': `${index * 150}ms` }"
        variant="outlined"
        @update:model-value="$emit('update:modelValue', local_value)"
        @blur="$emit('changed')"
      />

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ switch ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <u-smart-switch
        v-else-if="item.type === 'switch'"
        v-model="local_value[item.name]"
        :disabled="readonly"
        :false-description="item.hint_false"
        :false-title="$t('global.actions.no')"
        :label="item.title"
        :true-description="item.hint_true"
        :true-title="$t('global.actions.yes')"
        class="mx-3 mt-3 mb-5"
        false-icon="close"
        true-icon="check"
        @change="$forceUpdate();$emit('changed')"
      >
      </u-smart-switch>
    </div>
  </div>
</template>

<script lang="ts">
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import {
  FORM_BUILDER_TAGS,
  SmartConvertTextToHtml,
} from "@selldone/core-js/helper/html/HtmlHelper";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import { ShopOptionsHelper } from "@selldone/core-js/helper";
import { isObject } from "lodash-es";

export default {
  name: "SOrderCheckoutForm",
  mixins: [DateMixin],
  components: { USmartSwitch },
  inject: ["$shop"],
  emits: ["update:modelValue", "changed"],
  props: {
    /**
     * Receiver country (override the checkout form for the country)
     */
    country:{
      default: null,
      type: String,
    },


    modelValue: {},

    readonly: {
      default: false,
      type: Boolean,
    },
    isAdmin: {
      default: false,
      type: Boolean,
    },

  },
  data: () => ({
    local_value: {},

    busy_delete: null,
    busy_download: null,
  }),

  computed: {
    checkout() {
      return ShopOptionsHelper.GetCheckout(this.$shop);
    },

    /**
     * Select the custom checkout form
     */
    form() {
      if(this.country && this.checkout[`form_${this.country}`]){
        return this.checkout[`form_${this.country}`];
      }
      return this.checkout?.form;
    },
    is_override(){
      return (this.country && this.checkout[`form_${this.country}`])
    }
  },

  watch: {

  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.local_value = this.modelValue;
      if (!isObject(this.local_value)) {
        this.local_value = {};
      }
      // Set default values:
      try {
        this.form?.forEach((input) => {
          if (input.default && this.local_value[input.name] === undefined) {
            this.local_value[input.name] = input.default;
          }
        });
      } catch (e) {
        console.error(e);
      }
    },

    convertToHtml(message) {
      return SmartConvertTextToHtml(message, false, false, FORM_BUILDER_TAGS);
    },
  },
};
</script>

<style scoped></style>
