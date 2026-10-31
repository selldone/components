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
    :width="590"
    :persistent="busy"
    content-class="rounded-t-xl rounded-b-0"
    max-width="98vw"
    scrollable
  >
    <v-card
      v-if="selectedGift"
      class="b-account-gift sd-modern-canvas text-start"
      rounded="t-xl"
    >
      <header class="b-account-gift__header">
        <v-icon size="24" aria-hidden="true">card_giftcard</v-icon>
        <div>
          <h2>{{ $t("shuttle_gifts.receive_title") }}</h2>
          <p>{{ $t("shuttle_gifts.receive_subtitle") }}</p>
        </div>
        <v-tooltip location="top" content-class="sd-modern-tooltip text-start">
          <template #activator="{ props }">
            <button
              v-bind="props"
              type="button"
              class="sd-modern-icon-button"
              :disabled="busy"
              :aria-label="$t('shuttle_gifts.close')"
              @click="apply_gift_dialog = false"
            >
              <v-icon size="18" aria-hidden="true">close</v-icon>
            </button>
          </template>
          {{ $t("shuttle_gifts.close") }}
        </v-tooltip>
      </header>
      <div class="b-account-gift__body">
        <section class="b-account-gift__details sd-modern-widget">
          <div v-if="selectedGift.program" class="b-account-gift__program">
            <u-lottie
              v-if="
                selectedGift.program.promotion &&
                selectedGift.program.promotion.endsWith('.json')
              "
              :options="{ path: selectedGift.program.promotion, loop: true }"
              :speed="1"
              class="b-account-gift__promotion"
              height="100px"
              width="100px"
            />
            <v-img
              v-else
              :src="
                selectedGift.program.promotion
                  ? selectedGift.program.promotion
                  : GetGiftProgramType(selectedGift.program.type).image
              "
              class="b-account-gift__promotion"
              :height="selectedGift.program.promotion ? 100 : 65"
              :width="selectedGift.program.promotion ? 100 : 65"
            >
            </v-img>

            <div>
              <h3>{{ selectedGift.program.title }}</h3>
              <p v-if="selectedGift.program.description">
                {{ selectedGift.program.description }}
              </p>
              <v-btn
                v-if="programUrl"
                :href="programUrl"
                class="sd-modern-button sd-modern-button--inline sd-modern-button--compact"
                color="primary"
                variant="text"
                target="_blank"
                rel="noopener noreferrer"
                append-icon="north_east"
              >
                {{ $t("shuttle_gifts.program_more") }}
              </v-btn>
            </div>
          </div>
          <u-price
            :amount="selectedGift.amount"
            :currency="selectedGift.currency"
            class="b-account-gift__amount"
          ></u-price>
          <p v-if="selectedGift.message" class="b-account-gift__message">
            {{ selectedGift.message }}
          </p>
          <dl class="b-account-gift__facts">
            <div>
              <dt>{{ $t("shuttle_gifts.status") }}</dt>
              <dd>
                <span class="sd-modern-status sd-modern-status--plain">
                  <span
                    class="sd-modern-status__dot"
                    :class="{
                      'sd-modern-status__dot--success':
                        selectedGift.status === 'Paid',
                      'sd-modern-status__dot--warning':
                        selectedGift.status === 'Unpaid',
                      'sd-modern-status__dot--error':
                        selectedGift.status === 'Rejected',
                    }"
                    aria-hidden="true"
                  />
                  {{
                    GiftStatus[selectedGift.status]
                      ? $t(GiftStatus[selectedGift.status].title)
                      : $t("shuttle_gifts.unknown_status")
                  }}
                </span>
              </dd>
            </div>
            <div v-if="selectedGift.created_at">
              <dt>{{ $t("shuttle_gifts.created_at") }}</dt>
              <dd>{{ getLocalTimeString(selectedGift.created_at) }}</dd>
            </div>
            <div v-if="selectedGift.pay_at">
              <dt>{{ $t("shuttle_gifts.received_at") }}</dt>
              <dd>{{ getLocalTimeString(selectedGift.pay_at) }}</dd>
            </div>
          </dl>
        </section>
        <p class="sd-modern-notice b-account-gift__notice" role="status">
          <v-icon size="17" aria-hidden="true">info_outline</v-icon>
          <span class="sd-modern-notice__content">{{ $t(statusNotice) }}</span>
        </p>
        <div
          v-if="selectedGift.status === GiftStatus.Unpaid.code"
          class="b-account-gift__fields sd-modern-widget"
        >
          <b-account-input
            v-model="account_to"
            :chip="false"
            :disabled="busy"
            :currency="selectedGift.currency"
            :label="$t('shuttle_gifts.destination_wallet')"
            :messages="$t('shuttle_gifts.receive_notice')"
            class="sd-modern-underlined-field"
            variant="underlined"
          ></b-account-input>
        </div>
        <footer class="b-account-gift__actions">
          <v-btn
            class="sd-modern-button"
            variant="text"
            :disabled="busy"
            @click="apply_gift_dialog = false"
            >{{ $t("shuttle_gifts.close") }}</v-btn
          >
          <v-btn
            v-if="selectedGift.status === GiftStatus.Unpaid.code"
            :disabled="!canReceive"
            :loading="busy"
            class="sd-modern-button sd-modern-button--primary"
            color="primary"
            variant="elevated"
            prepend-icon="redeem"
            @click="getGift()"
          >
            {{ $t("shuttle_gifts.receive_action") }}
          </v-btn>
        </footer>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import BAccountInput from "../../../account/input/BAccountInput.vue";
import { GiftStatus } from "@selldone/core-js/enums/wallet/gift/GiftStatus";
import ULottie from "@selldone/components-vue/ui/lottie/ULottie.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { GiftStProgramTypes } from "@selldone/core-js/enums/wallet/gift/GiftStProgramTypes.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BAccountGiftRedeem",
  mixins: [TemplateMixin, CurrencyMixin, DateMixin],

  components: { ULottie, BAccountInput },
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

  computed: {
    canReceive() {
      return (
        !this.busy &&
        this.apply_gift_dialog &&
        !!this.selectedGift?.id &&
        this.selectedGift.status === GiftStatus.Unpaid.code &&
        !!this.account_to?.account_number &&
        this.account_to.currency === this.selectedGift.currency
      );
    },
    statusNotice() {
      const notices = {
        Unpaid: "awaiting_notice",
        Paid: "paid_notice",
        Rejected: "rejected_notice",
        Canceled: "canceled_notice",
      };
      return `shuttle_gifts.${notices[this.selectedGift?.status] || "unknown_status"}`;
    },
    programUrl() {
      const value =
        this.selectedGift?.program?.url || this.selectedGift?.program?.link;
      // Program content is untrusted; retain only an actual website destination.
      if (typeof value !== "string") return null;
      try {
        const url = new URL(value, window.location.origin);
        return ["http:", "https:"].includes(url.protocol) ? url.href : null;
      } catch {
        return null;
      }
    },
  },

  watch: {
    modelValue(value) {
      this.apply_gift_dialog = value;
    },
    apply_gift_dialog(value) {
      if (!value) this.account_to = null;
      this.$emit("update:modelValue", value);
    },
    "selectedGift.id"() {
      this.account_to = null;
    },
  },
  created() {
    this.apply_gift_dialog = this.modelValue;
  },
  methods: {
    //―――――――――――――――――――――― Gift ――――――――――――――――――――

    GetGiftProgramType(type: keyof typeof GiftStProgramTypes) {
      return GiftStProgramTypes[type] || GiftStProgramTypes.Airdrop;
    },

    getGift() {
      if (!this.canReceive) return;

      let t = this;
      this.busy = true;
      return axios
        .post(window.API.POST_APPLY_GIFT(), {
          account_number: this.account_to.account_number,
          gift_id: this.selectedGift.id,
        })
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showAwardAlert(
              this.$t("get_gift_dialog.notifications.received_success_title"),
              this.$t("get_gift_dialog.notifications.received_success", {
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
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          t.busy = false;
        });
    },
  },
};
</script>

<style scoped lang="scss" src="../gift-form.scss"></style>
