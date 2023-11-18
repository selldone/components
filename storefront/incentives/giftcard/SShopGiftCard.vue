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
  <div>
    <div class="panel">
      <v-scale-transition hide-on-leave>
        <div
          v-if="front"
          class="card card--front widget-hover-dark"
          :style="`background-image:url(${(
            getShopImagePath(giftCard.gift_type.bg)
          )}); --background:${giftCard.gift_type.color}`"
        >
          <h2 class="card-title">
            {{ giftCard.gift_type.title }}

            <v-tooltip v-if="giftCard.title || giftCard.note" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="#fff" v-bind="attrs" v-on="on" icon
                  ><v-icon>info</v-icon></v-btn
                >
              </template>
              <div class="text-start">
                <p v-if="giftCard.title" class="m-1 font-weight-bold">
                  {{ giftCard.title }}
                </p>
                <p v-if="giftCard.note" class="m-1">
                  {{ giftCard.note }}
                </p>
              </div>
            </v-tooltip>
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


          <currency-icon  class="card__logo" :currency="giftCard.currency" flag></currency-icon>

          <circle-button
            class="card__flip"
            icon="card_membership"
            :tooltip="$t('global.gift_card.transfer')"
            color="#fff"
            @click="front = !front"
          />
        </div>
      </v-scale-transition>

      <v-scale-transition hide-on-leave>
        <div
          v-if="!front"
          class="card card--back text-center widget-hover-dark"
        >
          <div class="card__strip p-2 d-flex align-center justify-center" dir="ltr">
            <div><span class="small">CVV: </span><b>{{ giftCard.cvv }}</b></div>
          </div>

          <circle-button
            v-if="false"
            icon="send"
            :tooltip="$t('global.gift_card.send_to_friend')"
            color="#fff"
            disabled
          />

          <circle-button
            class="card__flip"
            icon="fas fa-credit-card"
            adjust-for-font-awesome
            :tooltip="$t('global.actions.close')"
            color="#fff"
            @click="front = !front"
          />
        </div>
      </v-scale-transition>
    </div>
  </div>
</template>

<script>

import CircleButton from "@components/ui/button/CircleButton.vue";
import CurrencyIcon from "@components/ui/currency/CurrencyIcon.vue";
export default {
  name: "SShopGiftCard",
  components: {CurrencyIcon, CircleButton },
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

<style scoped lang="scss">
.card {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  width: 100%;
  height: 270px;
  text-align: left;
  padding: 30px;
  margin-bottom: 50px;
  color: #fff;
  border: solid var(--background) 6px;
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
    transition: all 0.3;
    box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1) /*,0 4px 20px 4px rgba(202, 202, 202, 0.86) !important*/;
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
</style>
