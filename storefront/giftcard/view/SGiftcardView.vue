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
  <div
    class="s--giftcard-view"
    :style="{ '--background': giftCard.gift_type.color }"
  >
    <v-scale-transition hide-on-leave>
      <div
        v-if="front"
        :style="`background-image:url(${getShopImagePath(
          giftCard.gift_type.bg,
        )});`"
        class="card card--front"
      >
        <h2 class="card-title">
          {{ giftCard.gift_type.title }}

          <v-btn color="#fff" icon v-bind="props" variant="text" size="small">
            <v-icon>info</v-icon>
            <v-tooltip
              activator="parent"
              v-if="giftCard.title || giftCard.note"
              location="bottom"
            >
              <div class="text-start">
                <p v-if="giftCard.title" class="m-1 font-weight-bold">
                  {{ giftCard.title }}
                </p>
                <p v-if="giftCard.note" class="m-1">
                  {{ giftCard.note }}
                </p>
              </div>
            </v-tooltip>
          </v-btn>
        </h2>

        <div class="card__number">
          {{ formatCard(giftCard.number) }}
        </div>

        <div v-if="!giftCard.enable" class="error-box">
          <p>
            <i class="fas fa-warning" />
            {{ $t("global.gift_card.inactive") }}
          </p>
        </div>

        <div class="card__expiry-date">
          <span>{{ $t("global.gift_card.expire") }}:</span>
          {{ getLocalTimeString(giftCard.expire_at, true) }}
        </div>
        <div class="card__owner">
          {{ FormatNumberCurrency(giftCard.balance, giftCard.currency) }}
          <span class="small">{{
            GetUserSelectedCurrencyName(giftCard.currency)
          }}</span>
        </div>

        <s-currency-icon
          :currency="giftCard.currency"
          class="card__logo"
          flag
        ></s-currency-icon>

        <s-circle-button
          :tooltip="$t('global.gift_card.transfer')"
          class="card__flip"
          color="#fff"
          icon="card_membership"
          @click="front = !front"
        />
      </div>
    </v-scale-transition>

    <v-scale-transition hide-on-leave>
      <div v-if="!front" class="card card--back text-center widget-hover-dark">
        <div
          class="card__strip p-2 d-flex align-center justify-center"
          dir="ltr"
        >
          <div>
            <span class="small">CVV: </span><b>{{ giftCard.cvv }}</b>
          </div>
        </div>

        <s-circle-button
          v-if="false"
          :tooltip="$t('global.gift_card.send_to_friend')"
          color="#fff"
          disabled
          icon="send"
        />

        <s-circle-button
          :tooltip="$t('global.actions.close')"
          adjust-for-font-awesome
          class="card__flip"
          color="#fff"
          icon="fa:fas fa-credit-card"
          @click="front = !front"
        />
      </div>
    </v-scale-transition>
  </div>
</template>

<script>
import SCurrencyIcon from "@components/ui/currency/icon/SCurrencyIcon.vue";

export default {
  name: "SGiftcardView",
  components: { SCurrencyIcon },
  props: {
    giftCard: {
      require: true,
      type: Object,
    },
  },

  data: () => ({
    front: true,
  }),
};
</script>

<style lang="scss" scoped>
.s--giftcard-view {
  transition: all 0.4s ease-in-out;
  &:hover {
    box-shadow: 0px 6px 30px 0px rgba(0, 0, 0, 0.4);
    transition: all 0.5s;
    z-index: 2;
  }

  background-color: var(--background);
  padding: 6px;
  border-radius: 22px;

  .card {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    transition: all 0.4s ease-in-out;
    width: 100%;
    height: 270px;
    text-align: left;
    padding: 30px;
    color: #fff;
    background-color: var(--background);
    border-radius: 20px;
    box-sizing: border-box;
    background-image: linear-gradient(
      -45deg,
      var(--theme-dark) 10%,
      var(--theme-deep-dark) 100%
    );

    background-size: cover;
    font-weight: 300;
    box-shadow: 1px 1px 6px 2px rgba(0, 0, 0, 0.6);

    &__number {
      font-size: 24px;
      padding: 90px 0 15px;
      text-align: center;

      text-shadow: 0px 2px 2px #4d4d4d;
    }

    &__expiry-date {
      font-size: 14px;
      padding-bottom: 20px;
      text-align: center;
    }

    &__owner {
      text-align: left;
    }

    &__logo {
      position: absolute;
      right: 20px;
      top: 20px;
    }

    &__strip {
      background: #000;
      height: 50px;
      margin-bottom: 30px;
    }

    &__signature {
      float: left;
      width: 65%;
      height: 40px;
      margin-left: 10px;
      background: #999;
    }

    &__ccv {
      float: left;
      margin-top: 5px;
      padding: 7px;
      background: #fff;
      color: #111;
      line-height: 1;
    }

    &--front {
      font-size: 16px;

      text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
      transition: all 0.3s;
      box-shadow:
        inset 0 -3em 3em rgba(0, 0, 0, 0.1),
        1px 1px 6px 2px rgba(0, 0, 0, 0.6);
    }

    &--back {
      padding-left: 0;
      padding-right: 0;
      text-align: left;
    }

    .card-title {
      position: absolute;
      left: 16px;
      max-width: calc(100% - 52px);
      font-size: 1.2rem;
      text-shadow: 0px 2px 2px #4d4d4d;
    }

    .card__flip {
      position: absolute;
      bottom: 28px;
      right: 8px;
    }

    .error-box {
      text-align: center;
      position: absolute;
      width: 80%;
      left: auto;
      right: auto;
      top: 30%;
      background-color: rgba(255, 0, 0, 0.54);
      color: white;
      font-size: 1rem;
      border-radius: 6px;

      p {
        margin: 0;
        text-align: center;
      }
    }
  }
}
</style>
