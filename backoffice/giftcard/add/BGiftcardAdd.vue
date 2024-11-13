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
  <v-card class="text-start">
    <v-card-title>
      <v-icon class="me-1" color="#111">add_box</v-icon>
      {{ $t("gift_card.gift_card_edit.title") }}
    </v-card-title>
    <v-card-text class="text-start typo-body">
      <div class="widget-box mb-5 mt-5">
        <u-widget-header
          icon="card_travel"
          title="Giftcard type"
        ></u-widget-header>
        <v-list-subheader
          >New gift cards will be generated based on the default configuration
          of the card type.
        </v-list-subheader>
        <u-text-value-box
          :label="$t('gift_card.gift_card_edit.validity')"
          :value="
            giftCardType.life + $t('gift_card.gift_card_edit.validity_unit')
          "
          class="my-4"
          icon="timelapse"
        >
        </u-text-value-box>

        <u-text-value-box
          :label="$t('gift_card.gift_card_edit.currency')"
          :value="getCurrencyName(giftCardType.currency)"
          class="my-4"
          icon="credit_card"
        >
        </u-text-value-box>

        <u-text-value-box
          :label="$t('gift_card.gift_card_edit.initial_balance')"
          :value="
            FormatNumberCurrency(giftCardType.amount, giftCardType.currency) +
            ' ' +
            GetUserSelectedCurrencyName(giftCardType.currency)
          "
          class="my-4"
          icon="price_check"
        >
        </u-text-value-box>
      </div>

      <div class="widget-box mb-5">
        <u-widget-header
          icon="add_card"
          title="Issue new cards"
        ></u-widget-header>
        <v-list-subheader
          >Please input the total quantity of new cards you wish to issue, along
          with their default status.
        </v-list-subheader>
        <u-number-input
          v-model="count"
          :label="$t('gift_card.gift_card_edit.count')"
          :max="100"
          :min="0"
          :prefix="$t('gift_card.gift_card_edit.count_unit')"
          class="mt-6 strong-field"
          show-buttons
        />

        <u-smart-toggle
          v-model="enable"
          :false-title="$t('global.inactive')"
          :true-description="
            $t('gift_card.gift_card_edit.enable_input_message')
          "
          :true-title="$t('global.active')"
          class="my-3"
        />
      </div>
    </v-card-text>
    <v-card-actions>
      <div class="widget-buttons">
        <v-btn
          v-if="hasCloseButton"
          size="x-large"
          variant="text"
          @click="$emit('close')"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.cancel") }}
        </v-btn>

        <v-btn
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="createGift"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.create") }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import UTextValueBox from "../../../ui/text/value-box/UTextValueBox.vue";
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BGiftcardAdd",
  mixins: [CurrencyMixin ],

  emits: ["close", "save"],
  components: { USmartToggle, UTextValueBox, UNumberInput },
  props: {
    giftCardType: {
      required: true,
      type: Object,
    },

    hasCloseButton: {
      required: false,
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    count: 1,
    enable: true,
    busy: false,
  }),

  computed: {
    currencyObject() {
      return this.GetCurrency(this.giftCardType.currency);
    },
    currencyName() {
      return this.currencyObject ? this.currencyObject.name : "";
    },
    currencyIcon() {
      return this.currencyObject ? this.currencyObject.icon : null;
    },
  },
  created() {},

  methods: {
    createGift() {
      this.busy = true;
      axios
        .post(
          window.API.POST_GIFT_CARD_TYPE_CARDS_ADD(
            this.$route.params.shop_id,
            this.giftCardType.id,
          ),
          {
            count: this.count,
            enable: this.enable,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              this.$t(
                "gift_card.gift_card_edit.notifications.create_success_title",
              ),
              this.$t("gift_card.gift_card_edit.notifications.create_success", {
                count: this.count,
              }) +
                (data.created_vitems_count
                  ? `<hr>Auto created virtual items: <b>${data.created_vitems_count}x</b>`
                  : ""),
            );

            this.$emit("save", data.count);
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
  },
};
</script>

<style lang="scss" scoped></style>
