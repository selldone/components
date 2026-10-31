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
  <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Assign Package Profile ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

  <v-list-item
    v-if="isPhysical || isVirtual"
    v-bind="$attrs"
    :class="modern ? 'b-product-profile-property-set--modern sd-modern-clickable-item text-start' : 'row-hover'"
    :prepend-icon="modern ? undefined : 'hive'"
    @click="showEdit()"
    slim
  >
    <template v-if="modern" #prepend>
      <b-product-edit-info-icon class="me-3" name="Layers" />
    </template>
    <v-list-item-title>
      <b>{{ $t("product_property_set.profile.title") }} </b>
    </v-list-item-title>

    <v-list-item-subtitle>
      <span v-if="modern" class="b-product-profile-property-set__name">
        {{ product.property_set?.name || product.property_set?.title || (product.property_set_id ? $t('add_product.edit_info.modern.assigned_profile', { id: product.property_set_id }) : $t('add_product.edit_info.modern.not_assigned')) }}
      </span>
      <template v-if="property_set">
        <template v-if="property_set.variants">
          <v-chip
            v-for="it in property_set.variants"
            :key="it.code"
            size="x-small"
            :prepend-icon="GetVariantIconByCode(it.code, product)"
            style="margin: 1px"
            color="#fff"
            variant="flat"
          >
            {{ $t(GetVariantNameByCode(it.code, { property_set })) }}
          </v-chip>
        </template>
        <small v-else>{{ $t("global.commons.empty") }}</small>
      </template>
      <template v-else-if="!modern">
        {{ $t("product_property_set.profile.subtitle") }}
      </template>
    </v-list-item-subtitle>

    <template v-slot:append>
      <v-list-item-action end>
        <v-btn
          v-if="modern"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
          @click.stop="showEdit()"
        >{{ $t(product.property_set_id ? 'global.actions.change' : 'add_product.edit_info.modern.assign') }}</v-btn>
        <v-btn
          v-else
          :color="property_set ? 'success' : 'primary'"
          icon
          variant="text"
        >
          <v-icon>{{ property_set ? "check_box" : "add_box" }}</v-icon>
        </v-btn>
      </v-list-item-action>
    </template>
  </v-list-item>

  <!-- ██████████████████████ Dialog > Select Property Set for the Product ██████████████████████ -->

  <v-dialog
    v-model="assign_dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1">hive</v-icon>
        {{ $t("product_property_set.select_property_set") }}
      </v-card-title>
      <v-card-text>
        <div class="widget-box -large mb-5">
          <u-widget-header
            icon="hive"
            :title="$t('global.commons.property_set')"
            :to="
              IS_VENDOR_PANEL
                ? undefined
                : { name: 'BPageShopLogisticPropertySets' }
            "
            :add-caption="$t('product_property_set.add_property_set')"
            :disabled="IS_VENDOR_PANEL"
            :disabled-reason="$t('product_badges.only_marketplace_owner_msg')"
            add-text
            target="_blank"
          ></u-widget-header>
          <v-list-subheader>
            {{ $t("product_property_set.subtitle") }}
          </v-list-subheader>

          <b-product-property-set-preview
            class="mb-5"
            :property-set="property_set"
          ></b-product-property-set-preview>

          <v-locale-provider :rtl="false /*Fix bug not show dropdown menu*/">
            <b-property-set-input
              v-model="property_set"
              return-object
            ></b-property-set-input>
          </v-locale-provider>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="assign_dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            color="primary"
            size="x-large"
            variant="elevated"
            @click="confirm"
            prepend-icon="check"
          >
            {{ $t("global.actions.set") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  GetVariantIconByCode,
  GetVariantNameByCode,
} from "@selldone/core-js/enums/product/ProductVariants.ts";
import BPropertySetInput from "@selldone/components-vue/backoffice/property-set/input/BPropertySetInput.vue";
import BProductPropertySetPreview from "@selldone/components-vue/backoffice/property-set/preview/BProductPropertySetPreview.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType.ts";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

export default {
  name: "BProductProfilePropertySet",
  mixins: [],
  components: {
    BProductEditInfoIcon,
    BProductPropertySetPreview,
    BPropertySetInput,
  },
  props: {
    modern: { type: Boolean, default: false },
    product: {
      required: true,
      type: Object,
    },
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },

  data: function () {
    return {
      GetVariantNameByCode: GetVariantNameByCode,
      GetVariantIconByCode: GetVariantIconByCode,

      assign_dialog: false,

      dialog_add: false,

      property_set: null,
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

    isPhysical() {
      return this.product?.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.product?.type === ProductType.VIRTUAL.code;
    },
  },

  watch: {
    product() {
      this.property_set = this.product.property_set;
    },
    "product.property_set"(value) {
      if (this.modern && !this.assign_dialog) this.property_set = value;
    },
  },

  created() {
    this.property_set = this.product.property_set;
  },

  methods: {
    showEdit() {
      this.property_set = this.product.property_set;
      this.assign_dialog = true;
    },

    confirm() {
      this.product.property_set_id = this.property_set?.id;
      this.product.property_set = this.property_set;
      this.assign_dialog = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-profile-property-set--modern {
  min-height: 62px;
  padding: 10px 12px;
  border-radius: 9px;
  :deep(.v-list-item-title), :deep(.v-list-item-title b) { font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; letter-spacing: 0; white-space: normal; }
  :deep(.v-list-item-subtitle) { margin-top: 2px; color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; line-height: 19px; opacity: 1; white-space: normal; overflow-wrap: anywhere; }
  :deep(.v-list-item__append) { padding-inline-start: 12px; }
  .b-product-profile-property-set__name { display: block; margin-bottom: 2px; }
  .b-product-edit-info-icon { color: var(--sd-modern-muted); }
}
</style>
