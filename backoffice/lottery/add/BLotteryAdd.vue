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
  <v-card
    :color="!hasClose ? 'transparent' : undefined"
    class="text-start b-lottery-add"
    :class="{ 'b-lottery-add--preview': appearancePreview }"
    flat
  >
    <v-card-title class="b-lottery-add__heading">
      <div class="b-lottery-add__title">
        <v-icon class="me-1">emoji_events</v-icon>
        {{
          lottery ? $t("lottery_edit.title_edit") : $t("lottery_edit.title_add")
        }}
      </div>
      <p class="b-lottery-add__intro">
        {{ $t("shop_lotteries.modern.editor_intro") }}
      </p>
    </v-card-title>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ General ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <v-card-text class="text-start position-relative">
      <v-form
        ref="form"
        lazy-validation
        class="b-lottery-add__form"
        :class="{ 'b-lottery-add__form--preview': appearancePreview }"
      >
        <div class="widget-box mb-5 sd-modern-incentive-group">
          <u-widget-header
            class="sd-modern-incentive-group__header"
            :title="$t('lottery_edit.design_prize')"
            icon="tune"
          ></u-widget-header>
          <v-list-subheader class="sd-modern-incentive-group__subtitle">{{
            $t("lottery_edit.design_prize_subtitle")
          }}</v-list-subheader>
          <div class="sd-modern-incentive-fields">
            <v-text-field
              class="sd-modern-incentive-field sd-modern-incentive-fields__full"
              v-model="title"
              :counter="64"
              :hint="$t('lottery_edit.title_input_hint')"
              :label="$t('lottery_edit.title_input')"
              :rules="[GlobalRules.required(), GlobalRules.counter(64)]"
              messages=" "
              variant="underlined"
            >
              <template v-slot:append-inner>
                <b-translation-button-lottery
                  v-if="lottery?.id"
                  :label="$t('lottery_edit.title_input')"
                  :lottery="lottery"
                  :shop="shop"
                  translation-key="title"
                ></b-translation-button-lottery>
              </template>

              <template v-slot:message>
                <u-smart-suggestion
                  v-if="!lottery?.id || !title"
                  :samples="$tm('suggestions.lottery.title')"
                  class="mb-4"
                  @select="(v) => (title = v)"
                ></u-smart-suggestion>
              </template>
            </v-text-field>
            <v-text-field
              class="sd-modern-incentive-field sd-modern-incentive-fields__full"
              v-model="description"
              :counter="256"
              :hint="$t('lottery_edit.description_input_hint')"
              :label="$t('lottery_edit.description_input')"
              :rules="[GlobalRules.required(), GlobalRules.counter(256)]"
              messages=" "
              variant="underlined"
            >
              <template v-slot:append-inner>
                <b-translation-button-lottery
                  v-if="lottery?.id"
                  :label="$t('lottery_edit.description_input')"
                  :lottery="lottery"
                  :shop="shop"
                  translation-key="description"
                ></b-translation-button-lottery>
              </template>

              <template v-slot:message>
                <u-smart-suggestion
                  v-if="!lottery?.id || !description"
                  :samples="$tm('suggestions.lottery.description')"
                  class="mb-4"
                  @select="(v) => (description = v)"
                ></u-smart-suggestion>
              </template>
            </v-text-field>
            <v-file-input
              class="sd-modern-incentive-field sd-modern-incentive-fields__full"
              v-model="selected_file"
              :label="$t('lottery_edit.image')"
              :loading="busy_upload"
              :messages="$t('lottery_edit.image_placeholder')"
              accept="image/*"
              color="primary"
              prepend-icon=""
              prepend-inner-icon="attach_file"
              variant="underlined"
            >
              <template v-slot:append-inner>
                <v-avatar v-if="image" class="hover-scale" size="28">
                  <img :src="getShopImagePath(image)" />
                </v-avatar>
              </template>
            </v-file-input>
            <u-color-selector
              class="sd-modern-incentive-fields__full"
              v-model="color"
              :title="$t('lottery_edit.hover_color')"
            ></u-color-selector>
          </div>
        </div>
        <b-lottery-prize-preview
          v-if="appearancePreview"
          class="b-lottery-add__preview"
          :title="title"
          :description="description"
          :image="image"
          :color="color"
          :selected-file="selected_file"
        ></b-lottery-prize-preview>
        <div class="widget-box mb-5 sd-modern-incentive-group">
          <u-widget-header
            class="sd-modern-incentive-group__header"
            :title="$t('lottery_edit.prize.title')"
            icon="emoji_events"
          ></u-widget-header>

          <v-list-subheader class="sd-modern-incentive-group__subtitle">
            {{ $t("lottery_edit.prize.subtitle") }}
          </v-list-subheader>

          <v-btn-toggle
            v-model="tab"
            class="rounded-toggles mx-auto mb-3 b-lottery-add__modes"
            mandatory
            rounded
            selected-class="blue-flat"
            style="min-height: 64px"
          >
            <v-btn value="amount">
              <v-icon class="me-1">paid</v-icon>
              {{ $t("global.commons.amount") }}
            </v-btn>
            <v-btn value="discount">
              <v-icon class="me-1">local_offer</v-icon>

              {{ $t("global.commons.discount") }}
            </v-btn>
            <v-btn value="product">
              <v-icon class="me-1">shopping_bag</v-icon>

              {{ $t("global.commons.product") }}
            </v-btn>
            <v-btn value="gift_card">
              <v-icon class="me-1">card_giftcard</v-icon>

              {{ $t("global.commons.gift_card") }}
            </v-btn>
          </v-btn-toggle>

          <v-expand-transition>
            <div class="b-lottery-add__reward" style="min-height: 200px">
              <div v-if="tab === 'amount'" class="sd-modern-incentive-fields">
                <u-currency-input
                  class="sd-modern-incentive-field"
                  v-model="currency"
                  :disabled="lottery !== null"
                  :messages="$t('lottery_edit.currency_message')"
                  :return-object="false"
                  variant="underlined"
                  :active-currencies="shop.currencies"
                >
                </u-currency-input>

                <u-price-input
                  class="sd-modern-incentive-field"
                  v-model="amount"
                  :currency="currency"
                  :hint="$t('lottery_edit.amount_hint')"
                  :label="$t('lottery_edit.amount')"
                  required
                  variant="underlined"
                />
              </div>

              <div v-if="tab === 'discount'" class="sd-modern-incentive-fields">
                <u-currency-input
                  class="sd-modern-incentive-field sd-modern-incentive-fields__full"
                  v-model="currency"
                  :disabled="lottery !== null"
                  :messages="$t('lottery_edit.currency_message')"
                  :return-object="false"
                  variant="underlined"
                  :active-currencies="shop.currencies"
                >
                </u-currency-input>

                <u-number-input
                  class="sd-modern-incentive-field"
                  v-model="discount"
                  :label="$t('lottery_edit.discount')"
                  :max="100"
                  :messages="$t('lottery_edit.discount_message')"
                  :min="1"
                  :rounded="false"
                  suffix="%"
                  variant="underlined"
                ></u-number-input>

                <u-price-input
                  class="sd-modern-incentive-field"
                  v-model="discount_limit"
                  :currency="currency"
                  :hint="$t('lottery_edit.discount_limit_hint')"
                  :label="$t('lottery_edit.discount_limit')"
                  :rounded="false"
                  required
                  variant="underlined"
                />
              </div>

              <div v-if="tab === 'product'" class="sd-modern-incentive-fields">
                <b-products-select-box
                  class="sd-modern-incentive-fields__full"
                  v-model="product_id"
                  v-model:variant-id="variant_id"
                  :label="$t('lottery_edit.product_input.label')"
                  :messages="$t('lottery_edit.product_input.message')"
                  :shop="shop"
                  border-less
                  single-product-select
                  single-product-variant-select
                ></b-products-select-box>
              </div>

              <div
                v-if="tab === 'gift_card'"
                class="py-5 b-lottery-add__gift-card sd-modern-incentive-fields"
              >
                <b-giftcard-type-input
                  class="sd-modern-incentive-field sd-modern-incentive-fields__full b-lottery-add__gift-type"
                  v-model="card_type_id"
                  :shop="shop"
                ></b-giftcard-type-input>
              </div>
            </div>
          </v-expand-transition>
        </div>
        <div class="widget-box mb-5 sd-modern-incentive-group">
          <u-widget-header
            class="sd-modern-incentive-group__header"
            :title="$t('lottery_edit.condition')"
            icon="border_outer"
          ></u-widget-header>
          <v-list-subheader class="sd-modern-incentive-group__subtitle">{{
            $t("lottery_edit.constraints.subtitle")
          }}</v-list-subheader>
          <div class="sd-modern-incentive-fields">
            <u-number-input
              class="sd-modern-incentive-field"
              v-model="chance"
              :label="$t('lottery_edit.chance')"
              :max="100"
              :messages="$t('lottery_edit.chance_message')"
              :min="0"
              :rounded="false"
              variant="underlined"
            ></u-number-input>
            <u-smart-switch
              v-model="free_for_first"
              :false-description="$t('lottery_edit.not_free_for_first_message')"
              :false-title="$t('global.commons.disable')"
              :label="$t('lottery_edit.free_for_first')"
              :true-description="$t('lottery_edit.free_for_first_message')"
              :true-title="$t('global.commons.enable')"
              class="sd-modern-incentive-fields__full my-7 b-lottery-add__switch"
            ></u-smart-switch>
            <b-club-select
              v-model="clubs"
              class="sd-modern-incentive-fields__full"
              multiple
              no-club
            ></b-club-select>
          </div>
        </div>
        <div class="widget-box mb-5 sd-modern-incentive-group">
          <u-widget-header
            class="sd-modern-incentive-group__header"
            :title="$t('lottery_edit.stock_title')"
            icon="inventory_2"
          ></u-widget-header>
          <v-list-subheader class="sd-modern-incentive-group__subtitle">{{
            $t("lottery_edit.stock_subtitle")
          }}</v-list-subheader>
          <div class="sd-modern-incentive-fields">
            <u-number-input
              class="sd-modern-incentive-field"
              v-model="quantity"
              :label="$t('lottery_edit.quantity')"
              :messages="$t('lottery_edit.quantity_message')"
              :min="1"
              variant="underlined"
            ></u-number-input>
            <u-smart-switch
              v-model="enable"
              :false-title="$t('global.commons.disable')"
              :hint="$t('lottery_edit.enable_message')"
              :true-title="$t('global.commons.enable')"
              class="sd-modern-incentive-fields__full mt-5 b-lottery-add__switch"
              false-gray
            ></u-smart-switch>
          </div>
        </div>
      </v-form>

      <BShopLicenseBlockOverlay
        v-if="licenseRestriction"
        fill-h
      ></BShopLicenseBlockOverlay>
    </v-card-text>
    <v-card-actions class="b-lottery-add__actions">
      <div class="widget-buttons">
        <v-btn
          v-if="hasClose"
          size="x-large"
          variant="text"
          @click="$emit('close')"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="lottery && !licenseRestriction"
          :loading="busy_set || busy_upload"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="editLottery()"
          v-ctrl.s="()=>{editLottery()}"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <v-btn
          v-else-if="!licenseRestriction"
          :loading="busy_set || busy_upload"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="createLottery"
          v-ctrl.s="()=>{createLottery()}"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.create") }}
        </v-btn>
      </div>
    </v-card-actions>

    <slot></slot>
  </v-card>
</template>

<script lang="ts">
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import UPriceInput from "../../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";
import UColorSelector from "../../../ui/color/selector/UColorSelector.vue";
import BProductsSelectBox from "../../../backoffice/product/select-box/BProductsSelectBox.vue";
import BGiftcardTypeInput from "../../giftcard/type/input/BGiftcardTypeInput.vue";
import BShopLicenseBlockOverlay from "../../shop/license/block/overlay/BShopLicenseBlockOverlay.vue";
import BClubSelect from "../../club/select/BClubSelect.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import BTranslationButtonLottery from "../../translation/button/lottery/BTranslationButtonLottery.vue";
import USmartSuggestion from "../../../ui/smart/suggestion/USmartSuggestion.vue";
import BLotteryPrizePreview from "./BLotteryPrizePreview.vue";
import { Club } from "@selldone/core-js";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BLotteryAdd",
  mixins: [],
  components: {
    BLotteryPrizePreview,
    USmartSuggestion,
    BTranslationButtonLottery,
    USmartSwitch,
    BClubSelect,
    BShopLicenseBlockOverlay,
    BGiftcardTypeInput,
    BProductsSelectBox,
    UColorSelector,
    UCurrencyInput,
    UPriceInput,
    UNumberInput,
  },
  props: {
    appearancePreview: {
      type: Boolean,
      default: false,
    },
    lottery: {
      required: false,
      type: Object,
    },
    hasClose: {
      default: false,
      type: Boolean,
    },
    shop: {
      required: true,
      type: Object,
    },
    licenseRestriction: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    tab: "amount",

    CustomerClubLevels: Club.Levels,

    enable: false,
    quantity: 10,
    title: null,
    description: null,
    color: null,

    chance: 5,
    free_for_first: null,

    clubs: [],

    amount: null,
    currency: null,
    discount: null,
    discount_limit: null,
    product_id: null,
    variant_id: null,
    card_type_id: null,

    selected_file: null,

    image: null,

    busy_set: false,
    busy_upload: false,
  }),

  computed: {},

  methods: {
    getFormData() {
      return {
        enable: this.enable,
        quantity: this.quantity,
        title: this.title,
        description: this.description,
        color: this.color,
        chance: this.chance,
        free_for_first: this.free_for_first,
        no_club: this.clubs.includes("no-club"),
        bronze_club: this.clubs.includes(Club.Levels.BRONZE.code),
        silver_club: this.clubs.includes(Club.Levels.SILVER.code),
        gold_club: this.clubs.includes(Club.Levels.GOLD.code),
        platinum_club: this.clubs.includes(Club.Levels.PLATINUM.code),
        diamond_club: this.clubs.includes(Club.Levels.DIAMOND.code),

        currency: this.currency,

        amount: this.tab === "amount" ? this.amount : 0,

        discount: this.tab === "discount" ? this.discount : 0,
        discount_limit: this.tab === "discount" ? this.discount_limit : 0,

        product_id: this.tab === "product" ? this.product_id : null,
        variant_id: this.tab === "product" ? this.variant_id : null,

        card_type_id: this.tab === "gift_card" ? this.card_type_id : null,
      };
    },
    createLottery() {
      this.$refs.form.validate();

      this.busy_set = true;

      axios
        .post(window.API.POST_CREATE_LOTTERY(this.shop.id), this.getFormData())
        .then(({ data }) => {
          if (!data.error) {
            this.uploadImage(data.lottery.id, (image) => {
              data.lottery.image = image;

              this.$emit("add", data.lottery);
              NotificationService.showSuccessAlert(
                null,
                this.$t("lottery_edit.notifications.add"),
              );
            });
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },

    editLottery() {
      this.$refs.form.validate();

      this.busy_set = true;

      axios
        .put(
          window.API.PUT_EDIT_LOTTERY(this.shop.id, this.lottery.id),
          this.getFormData(),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.uploadImage(data.lottery.id, (image) => {
              data.lottery.image = image;

              this.$emit("edit", data.lottery);
              NotificationService.showSuccessAlert(
                null,
                this.$t("lottery_edit.notifications.edit"),
              );
            });
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },

    uploadImage(lottery_id, callback) {
      if (!this.selected_file) {
        if (callback) callback(this.lottery ? this.lottery.image : null);
        return;
      }

      let formData = new FormData();
      formData.append("photo", this.selected_file);

      this.busy_upload = true;

      axios
        .post(
          window.API.POST_UPLOAD_LOTTERY_IMAGE(this.shop.id, lottery_id),
          formData,
        )
        .then(({ data }) => {
          if (!data.error) {
            if (callback) callback(data.files.path);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_upload = false;
        });
    },
  },

  created() {
    if (this.lottery) {
      this.enable = this.lottery.enable;
      this.quantity = this.lottery.quantity;
      this.title = this.lottery.title;
      this.description = this.lottery.description;
      this.color = this.lottery.color;
      this.image = this.lottery.image;

      this.chance = this.lottery.chance;
      this.free_for_first = this.lottery.free_for_first;

      if (this.lottery.no_club) {
        this.clubs.push("no-club");
      }
      if (this.lottery.bronze_club) {
        this.clubs.push(Club.Levels.BRONZE.code);
      }

      if (this.lottery.silver_club) {
        this.clubs.push(Club.Levels.SILVER.code);
      }

      if (this.lottery.gold_club) {
        this.clubs.push(Club.Levels.GOLD.code);
      }

      if (this.lottery.platinum_club) {
        this.clubs.push(Club.Levels.PLATINUM.code);
      }

      if (this.lottery.diamond_club) {
        this.clubs.push(Club.Levels.DIAMOND.code);
      }

      this.amount = this.lottery.amount;
      this.currency = this.lottery.currency;
      this.discount = this.lottery.discount;
      this.discount_limit = this.lottery.discount_limit;

      this.product_id = this.lottery.product_id;
      this.variant_id = this.lottery.variant_id;

      this.card_type_id = this.lottery.card_type_id;

      this.tab = this.lottery.card_type_id
        ? "gift_card"
        : this.lottery.product_id
          ? "product"
          : this.lottery.discount
            ? "discount"
            : "amount";
    } else {
      this.enable = true;
      this.quantity = 10;
      this.title = null;
      this.description = null;
      this.color = "#C2185B";
      this.image = null;

      this.chance = 5;
      this.free_for_first = false;

      this.clubs = [
        "no-club",
        "GOLD",
        "BRONZE",
        "PLATINUM",
        "DIAMOND",
        "SILVER",
      ];

      this.amount = 0;
      this.currency =
        this.shop.currencies && this.shop.currencies.length
          ? this.shop.currencies[0]
          : null;
      this.discount = 0;
      this.discount_limit = 0;
      this.product_id = null;
      this.variant_id = null;
      this.card_type_id = null;
    }
  },
};
</script>

<style lang="scss" scoped>
.b-lottery-add__intro {
  display: none;
}

.sd-modern-lottery-editor {
  padding: 28px 20px;

  &.b-lottery-add--preview {
    .b-lottery-add__heading,
    .b-lottery-add__actions {
      width: min(1040px, 100%);
    }

    .b-lottery-add__form--preview {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 300px;
      align-items: start;
      gap: 24px;
      width: min(1040px, 100%);
      margin-inline: auto;

      > .sd-modern-incentive-group {
        grid-column: 1;
        margin-block-end: 0 !important;
      }
    }

    .b-lottery-add__preview {
      position: sticky;
      top: 0;
      grid-column: 2;
      grid-row: 1 / span 4;
      align-self: start;
      padding-block-start: 28px;
    }

    .b-lottery-add__actions {
      margin-block-start: 24px;

      .widget-buttons {
        max-width: none;
      }
    }
  }

  .b-lottery-add__heading {
    width: min(760px, 100%);
    margin: 0 auto 24px;
    padding: 0;
    white-space: normal;
  }

  .b-lottery-add__title {
    display: flex;
    align-items: center;
    gap: 8px;

    > .v-icon {
      width: 18px;
      height: 18px;
      margin: 0 !important;
      color: var(--sd-modern-muted);
      font-size: 18px;
    }
  }

  .b-lottery-add__intro {
    display: block;
    margin: 6px 0 0;
    color: var(--sd-modern-muted);
    font-family: inherit;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.75;
  }

  .b-lottery-add__switch {
    margin-block: 0 !important;
  }

  .b-lottery-add__modes {
    height: auto;
    min-height: 0 !important;
    max-width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 8px;
    margin: 18px 0 24px !important;
    padding: 8px 0;
    overflow: visible;
    border-radius: 0;
    background: transparent;
    box-shadow: none;

    > .v-btn {
      min-width: 0;
      min-height: 40px;
      height: auto;
      padding: 8px 11px;
      border: 1px solid var(--sd-modern-border);
      border-radius: 10px !important;
      background: transparent;
      color: rgb(var(--v-theme-on-surface));
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      line-height: 18px;
      letter-spacing: 0;
      text-transform: none;

      :deep(.v-btn__content) {
        font: inherit;
        white-space: normal;
      }

      > :deep(.v-btn__content > .v-icon) {
        font-size: 16px;
        color: inherit !important;
      }
    }

    > .v-btn.blue-flat {
      background: rgb(var(--v-theme-surface)) !important;
      color: rgb(var(--v-theme-on-surface)) !important;
      box-shadow: var(
        --sd-modern-selected-shadow,
        0 3px 10px rgba(var(--v-theme-on-surface), 0.13)
      );

      :deep(.v-btn__overlay) {
        opacity: 0;
      }
    }
  }

  .b-lottery-add__reward {
    min-height: 0 !important;
  }

  .b-lottery-add__gift-card {
    padding-block: 0 !important;
  }

  .b-lottery-add__gift-type :deep(.v-select__selection > .small) {
    font-size: 14px;
    line-height: 24px;

    > b {
      font-weight: 400;
    }
  }

  .b-lottery-add__actions {
    width: min(760px, 100%);
    margin-inline: auto;

    .widget-buttons {
      width: 100%;
      flex-direction: row;
      gap: 12px;
      padding: 0;

      > .v-btn {
        margin: 0;
      }

      :deep(.v-icon) {
        font-size: 16px;
      }
    }
  }

  @media (max-width: 760px) {
    padding: 20px 12px;

    .sd-modern-incentive-fields {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 900px) {
    &.b-lottery-add--preview {
      .b-lottery-add__form--preview {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      .b-lottery-add__preview {
        position: static;
        padding-block-start: 0;
      }
    }
  }

  @media (max-width: 680px), (pointer: coarse) {
    .b-lottery-add__gift-type :deep(.v-select__selection > .small) {
      font-size: 16px;
    }

    .b-lottery-add__modes > .v-btn {
      min-height: 44px;
    }
  }

  @media (max-width: 420px) {
    .b-lottery-add__modes > .v-btn {
      flex: 1 1 calc(50% - 8px);
    }
  }
}
</style>
