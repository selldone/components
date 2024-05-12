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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-card class="text-start" flat>
    <!--  <v-card-title>
      <span class="dialog-title">{{ cardTitle }} </span>
    </v-card-title>-->
    <v-card-text class="text-start position-relative pt-6">
      <v-form ref="form" lazy-validation>
        <!-- ---------------------- General ---------------------- -->

        <div class="widget-box mb-5">
          <s-widget-header :title="$t('global.commons.finance')" icon="tune">
          </s-widget-header>

          <v-list-subheader
            >Here, configure the gift card's initial balance and validation
            period.
          </v-list-subheader>

          <u-currency-input
            v-model="currency"
            :disabled="editGiftCardType !== null"
            :label="$t('gift_card_type_edit.currency_input')"
            :messages="$t('gift_card_type_edit.currency_input_message')"
            :return-object="false"
            variant="underlined"
          />

          <u-price-input
            v-model="amount"
            :decimal="currencyObject.floats"
            :disabled="editGiftCardType !== null"
            :hint="$t('gift_card_type_edit.charge_input_hint')"
            :label="`${$t(
              'gift_card_type_edit.charge_input',
            )} ${getCurrencyName(currency)}`"
            :suffix="getCurrencyName(currency)"
            class="strong-field"
            required
            variant="underlined"
          />

          <u-number-input
            v-model="life"
            :disabled="editGiftCardType !== null"
            :label="`${$t('gift_card_type_edit.lifetime_input')}*`"
            :max="1000"
            :messages="$t('gift_card_type_edit.lifetime_input_message')"
            :min="1"
            variant="underlined"
          />
        </div>

        <!-- ---------------------- Design ---------------------- -->

        <div
          :class="{ disabled: !amount || !currency }"
          class="widget-box mb-5"
        >
          <s-widget-header
            :title="$t('global.commons.design_config')"
            icon="architecture"
          >
          </s-widget-header>

          <v-list-subheader
            >Define a title and color for your cart, which will be displayed
            publicly.
          </v-list-subheader>

          <v-text-field
            v-model="title"
            :label="`${$t('gift_card_type_edit.title_input')}*`"
            :rules="[GlobalRules.required()]"
            messages=" "
            variant="underlined"
          >
            <template v-slot:append-inner>
              <b-translation-button-giftcard
                v-if="editGiftCardType?.id"
                :gift-card-type="editGiftCardType"
                :label="$t('gift_card_type_edit.title_input')"
                :shop="shop"
                translation-key="title"
              ></b-translation-button-giftcard>
            </template>

            <template v-slot:message>
              <u-smart-suggestion
                v-if="!editGiftCardType?.id || !title"
                :samples="$tm('suggestions.gift_card_type.title')"
                class="mb-4"
                @select="(v) => (title = v)"
              ></u-smart-suggestion>
            </template>
          </v-text-field>

          <v-text-field
            v-model="color"
            :counter="7"
            :label="`${$t('gift_card_type_edit.color_input')}*`"
            :rules="[GlobalRules.required()]"
            variant="underlined"
          >
            <template v-slot:append-inner>
              <u-color-selector
                v-model="color"
                class="margin-n7px"
              ></u-color-selector>
            </template>
          </v-text-field>

          <s-image-uploader
            v-if="editGiftCardType"
            :image="getShopImagePath(editGiftCardType.bg)"
            :label="$t('gift_card_type_edit.card_image_input')"
            :server="
              window.API.POST_UPDATE_GIFT_CARD_TYPE_BG(
                editGiftCardType.shop_id,
                editGiftCardType.id,
              )
            "
            auto-compact
            max-file-size="2MB"
            name="photo"
            @new-path="onNewCardImagePath"
          />

          <s-giftcard-view
            :gift-card="{
              gift_type: editGiftCardType
                ? editGiftCardType
                : { title, color, amount, currency, life },
              balance: amount,
              currency: currency,
              number: 'XXXX-XXXX-XXXX-XXXX',
              enable: true,
              cvv: 'XXX',
            }"
            class="my-3"
          />
        </div>

        <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ 🆑 Cluster ━━━━━━━━━━━━━━━━━━━━━━━━ -->
        <div class="widget-box mb-5">
          <s-widget-header
            :to="{ name: 'BPageShopClassificationClusters' }"
            add-caption="Management"
            add-icon="settings"
            add-text
            icon="workspaces"
            title="Cluster"
          ></s-widget-header>

          <v-list-subheader>
            By associating this gift card type with a cluster, you can easily
            manage it alongside other resources in a single location.
          </v-list-subheader>
          <b-cluster-input
            v-model="cluster_id"
            :return-object="false"
            clearable
            icon="workspaces_filled"
            no-home
          ></b-cluster-input>
        </div>
        <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
      </v-form>

      <BShopLicenseBlockOverlay v-if="licenseRestriction" fill-h></BShopLicenseBlockOverlay>
    </v-card-text>
    <v-card-actions>
      <s-widget-buttons :auto-fixed-position="!hasCloseButton">
        <v-btn
          v-if="hasCloseButton"
          class="mx-1"
          size="x-large"
          variant="text"
          @click="$emit('close')"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="editGiftCardType && !licenseRestriction"
          :loading="busy_edit"
          class="mx-1"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="editGiftType(editGiftCardType)"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <v-btn
          v-else-if="!licenseRestriction"
          :loading="busy_add"
          class="mx-1"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="createGiftType"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.create") }}
        </v-btn>
      </s-widget-buttons>
    </v-card-actions>
  </v-card>
</template>

<script>
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import SImageUploader from "../../../../ui/uploader/SImageUploader.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";
import UColorSelector from "../../../../ui/color/selector/UColorSelector.vue";
import BShopLicenseBlockOverlay from "../../../shop/license/block/overlay/BShopLicenseBlockOverlay.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";
import SGiftcardView from "../../../../storefront/giftcard/view/SGiftcardView.vue";
import BClusterInput from "../../../cluster/input/BClusterInput.vue";
import BTranslationButtonGiftcard from "../../../translation/button/giftcard/BTranslationButtonGiftcard.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BGiftcardTypeAdd",

  components: {
    SWidgetButtons,
    BTranslationButtonGiftcard,
    BClusterInput,
    SGiftcardView,
    USmartSuggestion,
    BShopLicenseBlockOverlay,
    UColorSelector,
    SImageUploader,
    UCurrencyInput,
    UNumberInput,
    UPriceInput,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    editGiftCardType: {
      required: false,
    },
    hasCloseButton: {
      type: Boolean,
      default: false,
    },
    cardTitle: {},

    licenseRestriction: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    amount: 0,
    currency: SetupService.DefaultCurrency(),

    title: "",

    bg: "",
    icon: "",
    color: "#000",

    life: 48,

    cluster_id: null,

    busy_add: false,
    busy_edit: false,
  }),

  computed: {
    currencyObject() {
      return this.GetCurrency(this.currency);
    },
    currencyName() {
      return this.currencyObject ? this.currencyObject.name : "";
    },
    currencyIcon() {
      return this.currencyObject ? this.currencyObject.icon : null;
    },
  },
  created() {
    if (this.editGiftCardType) {
      this.color = this.editGiftCardType.color;
      this.bg = this.editGiftCardType.bg;
      this.icon = this.editGiftCardType.icon;
      this.amount = this.editGiftCardType.amount;
      this.currency = this.editGiftCardType.currency;
      this.title = this.editGiftCardType.title;
      this.life = this.editGiftCardType.life;

      this.cluster_id = this.editGiftCardType.cluster_id;
    }
  },

  methods: {
    onNewCardImagePath: function (path) {
      this.editGiftCardType.bg = path;
    },

    createGiftType() {
      if (!this.title && this.amount) {
        this.title = `Giftcards ${this.amount}${this.currency}`;
      }

      this.$refs.form.validate();

      this.busy_add = true;
      axios
        .post(
          window.API.POST_CREATE_GIFT_CARD_TYPE(this.$route.params.shop_id),
          {
            color: this.color,
            bg: this.bg,
            icon: this.icon,
            amount: this.amount,
            currency: this.currency,
            title: this.title,
            life: this.life,
            cluster_id: this.cluster_id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              null,
              this.$t("gift_card_type_edit.notifications.create_success"),
            );

            this.$emit("save", data.gift_card_type);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add = false;
        });
    },

    editGiftType(gift_card_type) {
      this.$refs.form.validate();

      this.busy_edit = true;

      axios
        .put(
          window.API.PUT_EDIT_GIFT_CARD_TYPE(
            this.$route.params.shop_id,
            gift_card_type.id,
          ),
          {
            color: this.color,
            bg: this.bg,
            icon: this.icon,
            amount: this.amount,
            currency: this.currency,
            title: this.title,
            life: this.life,
            cluster_id: this.cluster_id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              null,
              this.$t("gift_card_type_edit.notifications.update_success"),
            );

            this.$emit("save", data.gift_card_type);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_edit = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
