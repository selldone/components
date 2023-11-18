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
  <v-container
    v-if="lotteries && lotteries.length"
    fluid
    class="s--shop-lottery-prizes"
  >
    <widget-header
      :title="$t('global.commons.Prizes')"
      icon="casino"
      icon-color="#333"
    >
    </widget-header>
    <v-subheader>
      {{ $t("lottery_prizes.message") }}
    </v-subheader>

    <p v-if="!forceShow" class="small font-weight-bold">
      <v-btn
        small
        @click="show_prizes = !show_prizes"
        depressed
        :outlined="show_prizes"
        color="green"
        dark
        ><i class="fas fa-ticket-alt me-2"></i>
        {{ show_prizes ? "Hide Prizes" : "Show Prizes" }}
      </v-btn>
    </p>

    <v-expand-transition leave-absolute hide-on-leave>
      <fade-scroll v-if="show_prizes" show-arrow small-arrow>
        <div class="d-flex align-stretch">
          <div v-for="prize in lotteries" :key="prize.id" class="prize-slide">
            <div
              :prize="prize"
              class="-prize"
              @click="
                selectable
                  ? selectLottery(
                      value?.id === prize.id || value === prize.id
                        ? null
                        : prize
                    )
                  : undefined
              "
              :class="{
                selected: returnObject
                  ? value?.id === prize.id
                  : value === prize.id,
              }"
              style="width: 220px"
            >
              <p class="font-weight-bold mx-2 my-1">{{ prize.title }}</p>
              <p class="mx-2 my-1 small" :title="prize.description">
                {{ prize.description?.limitWords(10) }}
              </p>

              <hr class="mb-0 mx-2" />
              <v-spacer></v-spacer>
              <!-- ===================== Gift card ==================== -->
              <!--
           <v-row v-if="prize.card_type_id" class="text-center   py-3" no-gutters >
             <div class="w-50">
               <small>{{ $t("global.commons.gift_card") }}:</small><br>
               <span > {{ prize.card_type.title }}%</span>
             </div>

             <div class="w-50">
               <small>{{ $t("global.commons.charge") }}:</small><br>
               <price-view v-if="prize" :amount="prize.card_type.amount" :currency="prize.card_type.currency" ></price-view>
               <p v-else>Problem in issuing gift card!</p>
             </div>
           </v-row>-->
              <!-- ===================== Product ==================== -->
              <div
                v-if="prize.product_id"
                class="text-center py-3 small flex-grow-0"
              >
                <v-avatar class="">
                  <img :src="getShopImagePath(prize.product.icon)" />
                </v-avatar>

                <p class="my-1 px-2">
                  {{ prize.product.title?.limitWords(8) }}
                </p>
              </div>
              <!-- ===================== Discount ==================== -->

              <v-row
                v-else-if="prize.discount"
                class="text-center py-3 flex-grow-0"
                no-gutters
              >
                <div class="w-50">
                  <small>{{ $t("global.commons.discount") }}</small
                  ><br />
                  <span> {{ prize.discount }}%</span>
                </div>

                <div class="w-50">
                  <small>{{ $t("global.commons.discount_limit") }}</small
                  ><br />
                  <price-view
                    :amount="prize.discount_limit"
                    :currency="prize.currency"
                  ></price-view>
                </div>
              </v-row>
              <!-- ===================== Amount ==================== -->

              <div
                v-else-if="prize.amount"
                class="text-center py-3 flex-grow-0"
              >
                <small>{{ $t("global.commons.prize_amount") }} </small><br />
                <price-view
                  :amount="prize.amount"
                  :currency="prize.currency"
                ></price-view>
              </div>
            </div>
          </div>
        </div>
      </fade-scroll>
    </v-expand-transition>
  </v-container>
</template>

<script>
import FadeScroll from "@components/ui/fade-scroll/FadeScroll.vue";
import _ from "lodash-es";
export default {
  name: "SShopLotteryPrizes",
  components: { FadeScroll },
  props: {
    productId: {},
    VariantId: {},
    forceShow: {
      type: Boolean,
      default: false,
    },
    selectable: {
      type: Boolean,
      default: false,
    },
    value: {},

    // -------- BASKET --------
    basket: {
      type: Object,
    },

    returnObject: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    show_prizes: true,
  }),

  watch: {},

  computed: {
    lotteries() {
      const lotteries = this.$store.getters.getLotteryPrizes;

      // For one product:
      if (this.productId) {
        return lotteries.filter((prize) => {
          const product_id = this.productId; // save as string!
          return (
            prize.product_id &&
            prize.product_id === product_id &&
            (this.VariantId === null || prize.variant_id === this.VariantId)
          );
        });
      }

      return lotteries;
    },
  },

  created() {},
  methods: {
    selectLottery(prize) {
      if (prize) {
        this.$emit("input", this.returnObject ? prize : prize.id);
      } else {
        this.$emit("input", null);
      }

      this.setLotteryForBasket(prize);
    },

    showAddMode() {
      this.code_input = null;
      this.add_mode = true;
    },

    setLotteryForBasket: _.throttle(function setLotteryForBasket(lottery) {
      this.busy_set = true;
      //console.log("setLotteryForBasket", lottery);
      this.$emit("loading", true);
      axios
        .put(window.XAPI.PUT_SET_BASKET_LOTTERY(this.shop_name), {
          type: this.basket.type,
          id: lottery ? lottery.id : null,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.setBasketBill(this.basket, data.bill);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
          this.$emit("loading", false);
        });
    }, 3000),
  },
};
</script>

<style scoped lang="scss">


/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-lottery-prizes {
  text-align: start;

  .prize-slide {
    width: 220px;
    min-width: max-content;
    padding: 12px;
    .-prize {
      min-height: 100%;
      user-select: none;
      cursor: pointer;
      transition: all 0.2s;
      border: rgb(51, 51, 51) dashed 1.5px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;

      &.selected {
        background-color: #0f75ac;
        color: #fff;
        border: none;
        box-shadow: inset 0 -1em 2em rgb(50, 161, 225) !important;

        small {
          color: #fff;
        }
        hr {
          border-color: rgba(255, 255, 255, 0.78);
        }
      }
    }
  }
}
</style>
