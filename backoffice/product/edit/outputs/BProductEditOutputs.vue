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
      <div class="widget-box mb-5">
        <u-widget-header
          :title="$t('product_outputs.service.title')"
          icon="info"
        ></u-widget-header>

        <v-list-subheader
          >{{ $t("product_outputs.service.sub_title") }}
        </v-list-subheader>
      </div>
      <b-product-service-manage :product="product"></b-product-service-manage>
    </template>

    <s-widget-buttons auto-fixed-position class="my-5">
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

<script>
import SFormBuilder from "../../../../ui/form/SFormBuilder.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BProductServiceManage from "../../service/manage/BProductServiceManage.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BProductEditOutputs",
  components: { SWidgetButtons, BProductServiceManage, SFormBuilder },
  props: {
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

<style scoped></style>
