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
  <v-bottom-sheet
    v-model="apply_gift_dialog"
    inset
    :max-width="720"
    content-class="rounded-t-xl"
  >
    <v-card v-if="selectedGift" :color="SaminColorDarkDeep" rounded="t-xl">
      <v-card-title class="dialog-title">
        <v-icon class="me-1">card_giftcard</v-icon>
        {{ $t("get_gift_dialog.title") }}
      </v-card-title>

      <v-card-text>
        <template v-if="selectedGift.program">
          <u-lottie
            v-if="
              selectedGift.program.promotion &&
              selectedGift.program.promotion.endsWith('.json')
            "
            :options="{ path: selectedGift.program.promotion, loop: true }"
            :speed="1"
            class="mx-auto"
            height="180px"
            width="180px"
          />
          <v-img
            v-else
            :src="
              selectedGift.program.promotion
                ? selectedGift.program.promotion
                : this.GetGiftProgramType(selectedGift.program.type).image
            "
            class="mx-auto mb-5"
            height="180"
            width="180"
          >
          </v-img>

          <h2 class="mb-2">{{ selectedGift.program.title }}</h2>

          <p class="typo-body">
            {{ selectedGift.program.description }}
          </p>
          <div class="widget-buttons">
            <v-btn
              v-if="selectedGift.program.link"
              :href="selectedGift.program.link"
              size="x-large"
              target="_blank"
            >
              {{ $t("get_gift_dialog.more") }}
              <v-icon class="ms-2" size="small">open_in_new</v-icon>
            </v-btn>
          </div>
        </template>
        <u-price
          :amount="selectedGift.amount"
          :currency="selectedGift.currency"
          :title="$t('get_gift_dialog.amount')"
          x-large
        ></u-price>

        <p class="typo-body my-3">
          {{ selectedGift.message }}
        </p>

        <b-account-input
          v-if="selectedGift.status === GiftStatus.Unpaid.code"
          v-model="account_to"
          :chip="false"
          :currency="selectedGift.currency"
          :label="$t('get_gift_dialog.account_to_input')"
          :messages="$t('get_gift_dialog.account_to_input_message')"
          class="max-width-field-large mx-auto my-2"
        ></b-account-input>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            v-if="selectedGift.status === GiftStatus.Unpaid.code"
            :class="{ disabled: !account_to }"
            :loading="busy"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="getGift()"
          >
            <v-icon start>redeem</v-icon>
            {{ $t("get_gift_dialog.get_action") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import BAccountInput from "../../../account/input/BAccountInput.vue";
import { GiftStatus } from "@selldone/core-js/enums/wallet/gift/GiftStatus";

export default {
  name: "BAccountGiftRedeem",
  components: { BAccountInput },
  emits: ["update:modelValue", "update"],
  props: {
    modelValue: {},
    selectedGift: {},
  },
  data: () => ({
    busy: false,

    //Apply gift:
    apply_gift_dialog: false,
    account_to: null,
    GiftStatus: GiftStatus,
  }),

  computed: {},

  watch: {
    modelValue(value) {
      this.apply_gift_dialog = value;
    },
    apply_gift_dialog(value) {
      this.$emit("update:modelValue", value);
    },
  },
  created() {
    this.apply_gift_dialog = this.modelValue;
  },
  methods: {
    getGift() {
      if (this.busy) return;

      let t = this;
      this.busy = true;
      axios
        .post(window.API.POST_APPLY_GIFT(), {
          account_number: this.account_to.account_number,
          gift_id: this.selectedGift.id,
        })
        .then(({ data }) => {
          if (!data.error) {
            t.showAwardAlert(
              this.$t("get_gift_dialog.notifications.received_success_title"),
              this.$t("get_gift_dialog.notifications.received_success_title", {
                amount: this.FormatNumberCurrency(
                  data.gift.amount,
                  data.gift.currency,
                ),
                currency: this.GetUserSelectedCurrencyName(data.gift.currency),
              }),
            );
            this.$emit("update", data.gift);

            t.apply_gift_dialog = false;
          } else {
            t.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          console.error(error);
          t.showLaravelError(error);
        })
        .finally(() => {
          t.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
