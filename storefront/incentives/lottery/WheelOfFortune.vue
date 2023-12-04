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


    <v-btn
      @click="dialog = true"
      v-if="available_lotories"
      :loading="busy_fetch"
      icon
      :caption="$t('global.commons.lottery')"
      class="sub-caption -hover -white"
    >
      <s-lottie
        :options="{ path: '/animation/happy_birthday.json', loop: true }"
        height="44px"
        width="44px"
        :speed="1"
      />
    </v-btn>

    <v-dialog
      max-width="860"
      v-model="dialog"
      content-class="dialog-rounded-card"
      scrollable
    >
      <v-card>
        <v-card-title>
          {{ $t("global.wheel_fortune.title") }}

          <v-spacer></v-spacer>
          <v-btn
            @click="dialog = false"
            icon
            class="sub-caption -hover"
            :caption="$t('global.actions.close')"
            ><v-icon>close</v-icon></v-btn
          >
        </v-card-title>

        <v-card-text>
          <p class="text-start">
            <v-icon class="me-1">casino</v-icon>
            {{ $t("global.wheel_fortune.message", { chips: chips }) }}
          </p>

          <div class="position-relative">
            <img
              v-if="!(game_has_result && !play)"
              src="../../../login/assets/arrow.svg"
              class="arrow"
              width="64"
              height="64"
            />
            <ul
              v-if="game_has_result && !play"
              class="menu"
              :class="
                win
                  ? win.discount
                    ? '-discount'
                    : win.product_id
                    ? '-product'
                    : win.card_type_id
                    ? '-gift-card'
                    : '-amount'
                  : '-lose'
              "
            >
              <!-------------------- Play game result ------------------------->
              <div v-if="win" class="center-absolute" style="width: 70%">
                <s-lottie
                  :options="{
                    path: '/animation/gift-box-white.json',
                    loop: true,
                  }"
                  height="120px"
                  width="120px"
                  :speed="2"
                  style="margin-top: -140px"
                  class="zoomIn"
                />

                <h3 class="text-white zoomIn">
                  {{ $t("global.wheel_fortune.win_message") }}
                </h3>

                <s-lottery-prize-for-winner
                  :lottery="win"
                ></s-lottery-prize-for-winner>
              </div>
              <div v-else class="center-absolute" style="width: 70%">
                <h3 class="text-white zoomIn user-select-none">
                  {{ $t("global.wheel_fortune.lost_message") }}
                </h3>
                <v-btn
                  color="success"
                  v-if="has_over_10chip"
                  class="m-2 zoomIn"
                  @click="reset()"
                  >{{ $t("global.wheel_fortune.try_again") }}</v-btn
                >
              </div>
            </ul>
            <ul v-else class="menu" :class="{ disabled: !available_lotories }">
              <!--------------------------------------------->

              <li
                v-for="(lottery, index) in lotteries"
                :key="index"
                class="slice pointer-pointer"
                :style="`--deg:${
                  (index * 360) / count + p_deg + arrow_offset
                }deg; --color:${
                  lottery.color ? lottery.color : '#FFA000'
                } ; --step-deg:${360 / count}deg `"
                @click="selected_lottery = lottery"
              >
                <v-img
                  :src="getShopImagePath(lottery.image)"
                  class="image"
                ></v-img>
                <span class="icon"></span>
              </li>

              <!--------------------- Empty ----------------->
              <li
                v-if="has_empty"
                class="slice pointer-pointer"
                :style="`--deg:${
                  ((count - 1) * 360) / count + p_deg + arrow_offset
                }deg; --color:#FFA000 ; --step-deg:${360 / count}deg `"
                @click="selected_lottery = null"
              >
                <v-img
                  :src="
                    require('../../../login/assets/pattern-empty-fortune.jpg')
                  "
                  class="image"
                ></v-img>
                <span class="icon"></span>
              </li>

              <!--------------------------------------------->

              <div
                v-for="(lottery, index) in lotteries"
                :key="'l-' + index"
                class="slice-label"
                :style="`--deg:${
                  (index * 360) / count + p_deg + arrow_offset - 180 / count
                }deg`"
              >
                {{ lottery.title }}
              </div>

              <div
                v-if="has_empty"
                class="slice-label"
                :style="`--deg:${
                  ((count - 1) * 360) / count +
                  p_deg +
                  arrow_offset -
                  180 / count
                }deg`"
              >
                {{ $t("global.commons.empty") }}
              </div>

              <!--------------------------------------------->

              <div
                v-for="(lottery, index) in lotteries"
                :key="'b-' + index"
                class="slice-border"
                :style="`--deg:${
                  (index * 360) / count + p_deg + arrow_offset
                }deg`"
              ></div>

              <div
                v-if="has_empty"
                class="slice-border"
                :style="`--deg:${
                  ((count - 1) * 360) / count + p_deg + arrow_offset
                }deg`"
              ></div>

              <!--------------------------------------------->

              <div
                class="center"
                @click="playNow()"
                :class="{
                  'pointer-event-none': busy_play || busy_fetch || play,
                }"
              >
                <v-icon class="spin">refresh</v-icon
                ><span class="-on-hover">{{ $t("global.actions.play") }}</span>
              </div>
            </ul>

            <svg height="0" width="0">
              <defs>
                <clipPath clipPathUnits="objectBoundingBox" id="sector">
                  <path
                    fill="none"
                    stroke="#111"
                    stroke-width="1"
                    class="sector"
                    :d="path"
                  ></path>
                </clipPath>
              </defs>
            </svg>
          </div>

          <!-------------------- Prize select detail ------------------------->

          <v-expand-transition>
            <div v-if="selected_lottery" class="text-start">
              <v-avatar class="float-start me-2">
                <img :src="getShopImagePath(selected_lottery.image)" />
              </v-avatar>
              <p class="font-weight-bold m-0">{{ selected_lottery.title }}</p>
              <p>{{ selected_lottery.description }}</p>
            </div>
          </v-expand-transition>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import SLotteryPrizeForWinner from "./SLotteryPrizeForWinner.vue";
import { SoundHelper } from "@core/helper/sound/SoundHelper";

export default {
  name: "WheelOfFortune",
  components: { SLotteryPrizeForWinner },
  data: () => ({
    dialog: false,

    selected_lottery: null,

    //--------------
    lotteries: [],
    busy_fetch: false,

    play: false,
    duration: 50,

    p_deg: 0,
    target_index: -1,

    //-------------
    intervalId: null,
    requestId: null,

    //-------------
    busy_play: false,
    game_has_result: false,
    win: null, // Wined lottery
  }),

  computed: {
    chips() {
      return this.USER().chips;
    },
    count() {
      return this.lotteries
        ? this.lotteries.length + (this.has_empty ? 1 : 0)
        : 0;
    },
    has_empty() {
      return this.total_chance < 100 && this.total_chance > 0;
    },

    slice_deg() {
      return (2 * Math.PI) / this.count;
    },
    path() {
      return `M0.5,0.5 l0.5,0 A0.5,0.5 0 0,0 ${
        0.5 + Math.cos(this.slice_deg) * 0.5
      },${0.5 - Math.sin(this.slice_deg) * 0.5} z`;
    },

    total_chance() {
      let out = 0;
      this.lotteries.forEach((it) => {
        out += it.chance;
      });
      return out;
    },

    has_over_10chip() {
      return this.chips >= 10;
    },

    available_lotories() {
      return this.lotteries && this.lotteries.length;
    },

    arrow_offset() {
      return 360 / this.count - 90;
    },
  },

  watch: {
    play(play) {
      this.selected_lottery = null;

      if (!play) {
        this.dialog = true; //Open dialog if closed after game stop.
      }
    },
    count(count) {
      if (count >= 2) this.dialog = true; // Auto show lottery dialog game!
    },
  },

  created() {
    this.fetchLottery();
  },
  methods: {
    reset() {
      this.resetToDefault(); // 🞇 Reset to default
      this.fetchLottery();
    },

    fetchLottery() {
      this.busy_fetch = true;
      axios
        .get(window.XAPI.GET_FETCH_LOTTERIES(this.shop_name))
        .then(({ data }) => {
          if (!data.error) {
            this.lotteries = data.lotteries;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          // this.showLaravelError(error); Prevent show error on restricted shops!
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    playNow() {
      if (this.busy_play) return;

      this.play = !this.play;
      if (!this.play) return;

      this.game_has_result = false;

      this.target_index = -1;

      let start = performance.now();
      this.duration = 50;

      if (this.requestId) cancelAnimationFrame(this.requestId);

      const that = this;
      const step = 360 / that.count;

      let sound_interval = 0;

      this.requestId = requestAnimationFrame(function animate(time) {
        // timeFraction goes from 0 to 1
        //  let timeFraction = (time - start) / that.duration;
        // if (timeFraction > 1) timeFraction = 1;

        // calculate the current animation state
        that.p_deg += 1000 / that.duration;
        sound_interval += 1000 / that.duration;

        if (that.p_deg >= 360) {
          that.p_deg = 0;
          start = performance.now();
        }

        /* if (timeFraction >= 1) {
                        requestAnimationFrame(animate);
                        start = performance.now();
                    }*/

        if (that.play) {
          requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(that.requestId);
          that.requestId = null;
        }

        // Find target item:
        if (that.target_index >= 0) {
          // Finish:
          if (that.duration > 700) {
            if (
              that.p_deg >
                360 - (that.target_index + 1) * step + that.offset_stop &&
              that.p_deg < 360 - that.target_index * step
            ) {
              cancelAnimationFrame(that.requestId);
              that.requestId = null;
              that.play = false;

              if (that.win) SoundHelper.playWin();
            }
          }
        }
        if (sound_interval > step) {
          SoundHelper.playTick();
          sound_interval = 0;
        }
      });

      this.postPlayGame();
    },

    setTarget(target_index) {
      this.target_index = target_index;

      const step = 360 / this.count;
      this.offset_stop = step * Math.random() * 0.8;

      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      this.intervalId = setInterval(() => {
        this.duration += 50;

        if (this.duration > 1000) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      }, 500);
    },

    postPlayGame() {
      this.busy_play = true;
      const ids = [];
      this.lotteries.forEach((it) => {
        ids.push(it.id);
      });
      axios
        .post(window.XAPI.POST_FETCH_LOTTERIES(this.shop_name), {
          ids: ids,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.USER().chips = data.chips;
            this.game_has_result = true;

            this.win = data.win;
            if (!data.win) {
              // Lose! empty item!
              this.setTarget(this.count - 1);
              return;
            }

            const target_index = this.lotteries.findIndex(
              (it) => it.id === data.win.id
            );
            console.log("target_index", target_index);
            if (target_index >= 0) {
              this.setTarget(target_index);
              // Refresh lottery prizes:
              this.fetchLotteryPrizes();
            } else {
              // Empty item:
              this.setTarget(this.count - 1);
            }
          } else {
            this.showErrorAlert(null, data.error_msg);
            this.play = false;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
          this.play = false;
        })
        .finally(() => {
          this.busy_play = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.menu {
  padding: 0;
  list-style: none;
  position: relative;
  margin: 30px auto;
  width: 90vw;
  height: 0;
  height: 90vw;

  border: solid #f9f9f9 12px;
  border-radius: 50%;
  box-shadow: 0px 10px 50px 5px rgba(113, 112, 112, 0.24) !important;

  transition: all 0.35s ease-in-out;
  overflow: hidden;
  &:hover {
    border: solid #f9f9f9 40px;
  }

  &.-discount {
    background-image: linear-gradient(120deg, #cc208e 0%, #6713d2 100%);
  }
  &.-product {
    background-image: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
  }
  &.-gift-card {
    background-image: linear-gradient(
      -225deg,
      #22e1ff 0%,
      #1d8fe1 48%,
      #625eb1 100%
    );
  }
  &.-amount {
    background-image: linear-gradient(120deg, #50cc7f 0%, #f5d100 100%);
  }
  &.-lose {
    background-image: linear-gradient(120deg, #f093fb 0%, #f5576c 100%);
  }

  .widget {
  }
}

@media all and (max-width: 320px) {
  .menu {
    width: 230px;
    height: 230px;
    padding: 0;
  }
}
@media all and (min-width: 700px) {
  .menu {
    width: 500px;
    height: 500px;
    padding: 0;
  }
}
.menu li {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  clip-path: url(#sector);
  /* try this one in Chrome/Opera/Safari */
  /* clip-path: polygon(50% 50%, 100% 50%, 75% 6.6%); */

  .image {
    display: block;
    width: 100%;
    height: 100%;
    transition: all 0.65s ease-in-out;
  }

  &:hover {
    background-color: var(--color);
  }
}

.icon {
  position: absolute;
  /* exact values here depend on what you are placing inside the items (icon, image, text, etc.) */
  right: 25%;
  top: 25%;
  /* make sure it it rotated enough; angle of rotation = angle of the sector itself */
  transform: rotate(var(--step-deg)) translate(-50%, -50%);

  /* style further as needed */
  color: #fff;
  font-size: 25px;
  user-select: none;
}

.slice {
  transform: rotate(var(--deg));
  &:hover {
    .image {
      transition: all 0.35s ease-in-out;
      transform: scale(1.15);
      opacity: 0.2;
    }
  }
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border-radius: 50%;
  width: 68px;
  height: 68px;
  box-shadow: 0 5px 50px 4px rgb(221, 221, 221) !important;
  display: flex;
  justify-content: center;

  cursor: pointer;
  transition: all 0.4s ease-in-out;

  &:hover {
    width: 128px;
    height: 128px;
    // box-shadow: inset 0 -0.5em 0.5em rgba(0, 0, 0, 0.18), 0 5px 50px 4px rgb(221, 221, 221) !important;

    .spin {
      animation: spin 2s linear infinite;
    }
    .-on-hover {
      opacity: 1;
      transition-delay: 0.3s;
    }
  }

  .-on-hover {
    opacity: 0;
    position: absolute;
    top: calc(50% + 30px);
    left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.25s;
    transition-delay: 0s;
  }
}

.slice-border {
  transform: rotate(var(--deg));
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60%;
  height: 5px;
  transform-origin: 0 center;
  background-color: #fff;
  box-shadow: 0px 5px 15px 2px rgba(21, 21, 21, 0.42) !important;
}

.slice-label {
  pointer-events: none;
  transform: rotate(var(--deg));
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60%;
  height: 5px;
  transform-origin: 0 center;
  user-select: none;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.arrow {
  position: absolute;
  z-index: 2;
  filter: drop-shadow(3px 3px 7px rgba(119, 119, 119, 0.38));

  transform: translate(-50%, -20%) rotate(90deg);
  left: 50%;
  top: 0;
}
</style>
