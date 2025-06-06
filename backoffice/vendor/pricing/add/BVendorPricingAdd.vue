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
        <u-widget-header
          icon="price_change"
          :title="$t('vendor_pricing_add.title')"
        >
        </u-widget-header>

        <v-list-subheader>
          {{ $t("vendor_pricing_add.subtitle") }}
        </v-list-subheader>

        <v-text-field
          v-model="title"
          :label="$t('global.commons.title')"
          persistent-placeholder
          :placeholder="$t('vendor_pricing_add.inputs.title.placeholder')"
          variant="underlined"
          messages=" "
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
          <template v-slot:message>
            <u-smart-suggestion
              :samples="$tm('suggestions.vendor_pricing.title')"
              @select="(v) => (title = v)"
            ></u-smart-suggestion>
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
          :placeholder="$t('vendor_pricing_add.inputs.description.placeholder')"
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
        <u-widget-header
          :title="$t('global.commons.critical_zone')"
          icon="warning_amber"
        >
        </u-widget-header>
        <v-list-subheader>
          {{ $t("vendor_pricing_add.delete.subtitle") }}
        </v-list-subheader>

        <u-smart-verify
          v-model="accept_delete"
          color="red"
          :true-description="
            $t('vendor_pricing_add.inputs.accept_delete.true_description')
          "
          :true-title="$t('vendor_pricing_add.inputs.accept_delete.true_title')"
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
            {{ $t("vendor_pricing_add.delete.remove_pricing_action") }}
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
          variant="elevated"
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

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import BTranslationButtonVendorPricing from "../../../translation/button/vendor-pricing/BTranslationButtonVendorPricing.vue";
import USmartSuggestion from "@selldone/components-vue/ui/smart/suggestion/USmartSuggestion.vue";


export default {
  name: "BVendorPricingAdd",
  mixins: [],
  components: {
    USmartSuggestion,
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
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy_delete = false;
        });
    },
  },
};
</script>

<style scoped></style>
