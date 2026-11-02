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
  <div :class="{ 'b-product-edit-outputs--modern': modern && isService }">
    <!-- ███████████████████ Virtual ███████████████████ -->

    <template v-if="isVirtual">
      <s-form-builder
        v-model:structure="product.outputs"
        :class="{ disabled: add_by_dropShipping }"
        :hint="$t('product_outputs.virtual.sub_title')"
        :title="$t('product_outputs.outputs_form')"
        icon="output"
      />
    </template>
    <!-- ███████████████████ Service ███████████████████ -->

    <template v-if="isService">
      <div v-if="!modern" class="widget-box mb-5">
        <u-widget-header
          :title="$t('product_outputs.service.title')"
          icon="info"
        ></u-widget-header>

        <v-list-subheader
          >{{ $t("product_outputs.service.sub_title") }}
        </v-list-subheader>
      </div>
      <b-product-service-manage ref="serviceEditor" :product="product" :modern="modern" :disabled="!!busy" :metadata-available="metadataAvailable" @navigate="$emit('navigate', $event)" />
      <footer v-if="modern" class="b-product-edit-outputs__footer">
        <p role="status" aria-live="polite">{{ $t(hasUnsavedChanges ? 'add_product.edit_info.modern.unsaved' : 'add_product.edit_info.modern.all_saved') }}</p>
        <div><v-btn class="sd-modern-button" variant="outlined" :disabled="!!busy || !!product.parent_id || !hasUnsavedChanges" @click="discardChanges">{{ $t('add_product.edit_info.modern.discard') }}</v-btn><v-btn v-if="!externalActionButtons" class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :loading="!!busy" :disabled="saveBlocked" aria-keyshortcuts="Control+s" @click="submit" v-ctrl.s="submit"><template #prepend><v-icon size="16">save</v-icon></template>{{ $t(product.id ? 'add_product.edit_info.modern.save_changes' : 'global.actions.save_continue') }}</v-btn></div>
      </footer>
    </template>

    <s-widget-buttons v-if="!externalActionButtons && !(modern && isService)" auto-fixed-position class="my-5">
      <v-btn
        :loading="busy"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="$emit('next')"
      >
        {{ $t("global.actions.save_continue") }}

        <v-icon class="ms-2" size="small">
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </s-widget-buttons>
  </div>
</template>

<script lang="ts">
import SFormBuilder from "../../../../ui/form/SFormBuilder.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BProductServiceManage from "../../service/manage/BProductServiceManage.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";
import { shallowRef } from 'vue';

export default {
  name: "BProductEditOutputs",
  components: { SWidgetButtons, BProductServiceManage, SFormBuilder },
  emits: ['next', 'navigate'],
  setup() { return { serviceEditor: shallowRef(null) }; },
  props: {
    modern: { type: Boolean, default: false },
    metadataAvailable: { type: Boolean, default: false },
    externalActionButtons: {
      type: Boolean,
      default: false,
    },
    product: {
      required: true,
      type: Object,
    },
    busy: {},
  },

  data: () => ({
    // outputs:[],
  }),
  computed: {
    hasUnsavedChanges() { return this.serviceEditor?.hasUnsavedChanges || false; },
    saveBlocked() { return !!this.busy; },
    isPhysical() {
      return this.product && this.product.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.product && this.product.type === ProductType.VIRTUAL.code;
    },

    isService() {
      return this.product && this.product.type === ProductType.SERVICE.code;
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
    /*
    has_virtual_variants(){
      return this.isVirtual && this.outputs && this.outputs.some(o=>o.name==='variants')
    },*/
  },

  created() {
    //  this.outputs=this.product.outputs
  },

  methods: {
    prepareSave() { return this.isService ? this.serviceEditor?.prepareSave() ?? false : true; },
    markSaved() { this.serviceEditor?.markSaved(); },
    discardChanges() { this.serviceEditor?.discardChanges(); },
    submit() { if (!this.saveBlocked && this.prepareSave()) this.$emit('next'); },
    /*  addVirtualVariants(){
      if(!this.product.outputs || !Array.isArray(this.product.outputs))this.product.outputs=[];

      this.product.outputs.unshift({
        name:'variants',
        title:'Variant Type',
        type:'select',
        selects:[],
        multiple:false,
        locked:true
      })
    }*/
  },
};
</script>

<style lang="scss" scoped>
.b-product-edit-outputs--modern {
  container: product-service / inline-size;
  .b-product-edit-outputs__footer { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-block-start: 22px; }
  .b-product-edit-outputs__footer > p { margin: 0; color: var(--sd-modern-muted); font-size: 12px; }
  .b-product-edit-outputs__footer > div { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; }
  @media (max-width: 600px) { .b-product-edit-outputs__footer { flex-wrap: wrap; } .b-product-edit-outputs__footer > div { inline-size: 100%; } }
}
</style>
