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
  <v-card flat>
    <v-card-title></v-card-title>
    <v-card-text>
      <div class="widget-box mb-5">
        <s-widget-header icon="price_change" title="Marketplace pricing model">
        </s-widget-header>

        <v-list-subheader
          >By assigning a pricing model to the vendor products, the price will
          be auto calculated by Vendor price * ( 1 + Commission%).
        </v-list-subheader>

        <v-text-field
          v-model="title"
          :label="$t('global.commons.title')"
          persistent-placeholder
          placeholder="Ex, Digital products class..."
          variant="underlined"
        >
          <template v-slot:append-inner>
            <b-translation-button-vendor-pricing
              v-if="pricing?.id"
              :label="$t('global.commons.title')"
              :pricing="pricing"
              :shop="shop"
              translation-key="title"
            ></b-translation-button-vendor-pricing>
          </template>
        </v-text-field>

        <u-number-input
          v-model="commission"
          :label="$t('global.commons.percent_commission')"
          :max="1000"
          :min="0"
          class="strong-field"
          suffix="%"
          variant="underlined"
        ></u-number-input>

        <v-textarea
          v-model="description"
          :label="$t('global.commons.description')"
          append-inner-icon="sticky_note_2"
          auto-grow
          persistent-placeholder
          placeholder="You can attach a note here..."
          rows="2"
          variant="underlined"
        >
          <template v-slot:append-inner>
            <b-translation-button-vendor-pricing
              v-if="pricing?.id"
              :label="$t('global.commons.description')"
              :pricing="pricing"
              :shop="shop"
              translation-key="description"
            ></b-translation-button-vendor-pricing>
          </template>
        </v-textarea>
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Delete  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div v-if="pricing" class="widget-box mb-5">
        <s-widget-header
          :title="$t('global.commons.critical_zone')"
          icon="warning_amber"
        >
        </s-widget-header>
        <v-list-subheader
          >Deleting a pricing model will impact all linked vendor-products.
          Before removing a pricing model, ensure you update all vendor products
          using this pricing and assign them a different pricing model.
        </v-list-subheader>

        <u-smart-verify
          v-model="accept_delete"
          color="red"
          true-description="I want to delete this pricing model."
          true-title="Verify remove pricing"
        ></u-smart-verify>

        <div class="widget-buttons">
          <v-btn
            :class="{ disabled: !accept_delete }"
            :loading="busy_delete"
            color="red"
            size="x-large"
            @click="remove"
          >
            <v-icon class="me-1">remove</v-icon>
            Remove pricing model
          </v-btn>
        </div>
      </div>
    </v-card-text>

    <v-card-actions>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="$emit('close')">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="pricing"
          :disabled="!title"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="flat"
          @click="editricing"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <v-btn
          v-else
          :disabled="!title"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="addPricing"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.add") }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import BTranslationButtonVendorPricing from "../../../translation/button/vendor-pricing/BTranslationButtonVendorPricing.vue";

export default {
  name: "BVendorPricingAdd",
  components: {
    BTranslationButtonVendorPricing,
    USmartVerify,
    UNumberInput,
  },
  props: {
    shop: {
      required: true,
    },

    pricing: {},
  },
  data: () => ({
    busy: false,
    busy_delete: false,

    title: null,
    description: null,
    commission: 0,

    accept_delete: false,
  }),
  computed: {},

  watch: {
    pricing() {
      this.assign();
    },
  },

  created() {
    this.assign();
  },

  methods: {
    //――――――――――――――――――――――― Edit Vendor ―――――――――――――――――――――――

    assign() {
      this.resetToDefault(); // 🞇 Reset to default

      if (this.pricing) {
        this.title = this.pricing.title;
        this.description = this.pricing.description;
        this.commission = this.pricing.commission;
        this.accept_delete = false;
      }
    },

    addPricing() {
      this.busy = true;

      axios
        .post(window.API.POST_SHOP_ADD_VENDOR_PRICINGS(this.shop.id), {
          title: this.title,
          description: this.description,
          commission: this.commission,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("add", data.pricing);
            this.$emit("close");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    editricing() {
      this.busy = true;

      axios
        .put(
          window.API.PUT_SHOP_EDIT_VENDOR_PRICINGS(
            this.shop.id,
            this.pricing.id,
          ),
          {
            title: this.title,
            description: this.description,
            commission: this.commission,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("update", data.pricing);
            this.$emit("close");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    remove() {
      this.busy_delete = true;

      axios
        .delete(
          window.API.DELETE_SHOP_EDIT_VENDOR_PRICINGS(
            this.shop.id,
            this.pricing.id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("remove", data.id);
            this.$emit("close");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy_delete = false;
        });
    },
  },
};
</script>

<style scoped></style>
