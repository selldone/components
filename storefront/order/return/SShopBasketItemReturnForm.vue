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
  <v-card class="s--shop-basket-item-return-form" rounded="0">
    <v-card-title>
      {{ $t("return_request.title") }}
      <v-spacer></v-spacer>
      <v-btn icon @click="$emit('onClose')">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <div class="item-return">
        <v-img
          :src="getProductImage(basketItem.product_id)"
          aspect-ratio="1"
          class="image"
          height="42px"
          width="42px"
        />
        <div>
          <p class="m-0 font-weight-medium">
            {{ basketItem.product.title }}
          </p>
          <small class="m-0">
            {{ basketItem.product.title_en }}
          </small>

          <variant-item-view-micro
            v-if="basketItem.variant"
            :product-variant="basketItem.variant"
          />
        </div>
        <div>
          <p class="m-0 font-weight-bold">
            P{{ basketItem.product_id }}
            <span v-if="basketItem.variant_id">
              / SVP{{ basketItem.variant_id }}</span
            >
          </p>
        </div>
      </div>

      <v-container fluid>
        <v-row align="center" justify="center"  >
          <v-col v-if="step === 1" md6 xs12>
            <p class="action-title text-start m-2">
              <u-number-input
                v-model="count"
                :label="$t('return_request.count_input')"
                :max="basketItem.count"
                :messages="$t('return_request.count_input_message')"
                :min="1"
                class="max-width-field mx-auto"
                filled
                rounded
              />
            </p>

            <v-select
              v-model="reason"
              :item-title="
                (item) => {
                  return $t(item.title);
                }
              "
              :items="items"
              :label="$t('return_request.reason_input')"
              :messages="$t('return_request.reason_input_message')"
              class="max-width-field mx-auto"
              item-value="value"
              rounded
              variant="filled"
            />

            <v-textarea
              v-model="note"
              :hint="$t('return_request.note_input_hint')"
              :label="$t('return_request.note_input')"
              :messages="$t('return_request.note_input_message')"
              :rows="2"
              name="input-7-1"
              rounded
              variant="filled"
            />
          </v-col>

          <v-col v-if="step === 2" class="p-2" cols="12">
            <p class="text-start">
              {{ $t("return_request.media_message") }}
            </p>
          </v-col>

          <v-col v-if="step === 2" class="p-2 text-center" md="3" cols="12">
            <div style="min-height: 48px">
              <v-img
                v-if="imagePath"
                :height="48"
                :src="imagePath"
                :width="48"
                class="ma-auto"
                contain
              />
            </div>

            <file-pond
              ref="pond_profile"
              :label-idle="`<i class='fa:fas fa-image'></i>  Image`"
              :max-files="1"
              :server="serverOptionsImage"
              accepted-file-types="image/jpeg, image/png"
              allow-multiple="false"
              check-validity="true"
              class="mt-2"
              credits="false"
              maxFileSize="1MB"
              name="photo"
              @processfile="handleProcessFileImage"
            />
          </v-col>

          <v-col v-if="step === 2" class="p-2 text-center" md="3" cols="12">
            <div style="min-height: 48px">
              <v-img
                v-if="videoPath"
                :height="48"
                :src="require('@components/assets/icons/film.svg')"
                :width="48"
                class="ma-auto"
              />
            </div>

            <file-pond
              ref="pond_profile"
              :label-idle="`<i class='fa:fas fa-video'></i> ${$t('return_request.video')}`"
              :max-files="1"
              :server="serverOptionsVideo"
              accepted-file-types="mp4,avi,mov,mpg"
              allow-multiple="false"
              check-validity="true"
              class="mt-2"
              credits="false"
              maxFileSize="10MB"
              name="photo"
              @processfile="handleProcessFileVideo"
            />
          </v-col>

          <v-col v-if="step === 2" class="p-2 text-center" md="3" cols="12">
            <div style="min-height: 48px">
              <v-img
                v-if="voicePath"
                :height="48"
                :src="require('@components/assets/icons/voice.svg')"
                :width="48"
                class="ma-auto"
              />
            </div>
            <file-pond
              ref="pond_profile"
              :label-idle="`<i class='fa:fas fa-microphone'></i>  ${$t(
                'return_request.voice',
              )}`"
              :max-files="1"
              :server="serverOptionsVoice"
              accepted-file-types="mp3,wav"
              allow-multiple="false"
              check-validity="true"
              class="mt-2"
              credits="false"
              maxFileSize="5MB"
              name="photo"
              @processfile="handleProcessFileVoice"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions class="pb-2">
      <v-spacer></v-spacer>
      <v-btn v-if="step === 2" class="m-1" variant="flat" @click="step = 1">
        {{ $t("global.actions.back") }}
      </v-btn>

      <v-btn class="m-1" variant="flat" @click="$emit('onClose')">
        {{ $t("global.actions.close") }}
      </v-btn>

      <v-btn
        v-if="step === 1"
        class="m-1"
        color="#C2185B"
        dark
        variant="flat"
        @click="addReturnItemRequest()"
      >
        {{ $t("return_request.add_action") }}
      </v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script>
import VariantItemViewMicro from "@components/storefront/product/variant/VariantItemViewMicro.vue";
import UNumberInput from "@components/ui/number/input/UNumberInput.vue";
import { ReturnOrderReason } from "@core/enums/basket/ReturnOrderReason";

export default {
  name: "SShopBasketItemReturnForm",
  components: {
    UNumberInput,
    VariantItemViewMicro,
  },

  props: {
    basketItem: {},
  },

  data: function () {
    return {
      step: 1,

      profile_pic: null,

      note: "",
      count: 1,

      busy: false,

      reason: null,

      items: ReturnOrderReason.physical,
    };
  },
  computed: {
    imagePath() {
      if (
        this.basketItem &&
        this.basketItem.return_request &&
        this.basketItem.return_request.image
      )
        return this.getShopFileTempPath(this.basketItem.return_request.image);
      return null;
    },

    videoPath() {
      if (
        this.basketItem &&
        this.basketItem.return_request &&
        this.basketItem.return_request.video
      )
        return this.getShopFileTempPath(this.basketItem.return_request.video);
      return null;
    },
    voicePath() {
      if (
        this.basketItem &&
        this.basketItem.return_request &&
        this.basketItem.return_request.voice
      )
        return this.getShopFileTempPath(this.basketItem.return_request.voice);
      return null;
    },

    serverOptionsImage() {
      return {
        url: window.XAPI.POST_UPLOAD_RETURN_REQUEST_FILE(
          this.shop_name,
          this.$route.params.basket_id,
          this.basketItem.id,
          "image",
        ),
        process: {
          url: "",
          headers: {
            Authorization: "Bearer " + window.$cookies.get("access_token"),
          },
        },

        revert: {
          url: "",
          headers: {
            Authorization: "Bearer " + window.$cookies.get("access_token"),
          },
        },
      };
    },
    serverOptionsVideo() {
      return {
        url: window.XAPI.POST_UPLOAD_RETURN_REQUEST_FILE(
          this.shop_name,
          this.$route.params.basket_id,
          this.basketItem.id,
          "video",
        ),
        process: {
          url: "",
          headers: {
            Authorization: "Bearer " + window.$cookies.get("access_token"),
          },
        },

        revert: {
          url: "",
          headers: {
            Authorization: "Bearer " + window.$cookies.get("access_token"),
          },
        },
      };
    },

    serverOptionsVoice() {
      return {
        url: window.XAPI.POST_UPLOAD_RETURN_REQUEST_FILE(
          this.shop_name,
          this.$route.params.basket_id,
          this.basketItem.id,
          "voice",
        ),
        process: {
          url: "",
          headers: {
            Authorization: "Bearer " + window.$cookies.get("access_token"),
          },
        },

        revert: {
          url: "",
          headers: {
            Authorization: "Bearer " + window.$cookies.get("access_token"),
          },
        },
      };
    },
  },

  watch: {
    basketItem(val) {
      this.load_default();
    },
  },
  created() {
    this.load_default();
  },

  methods: {
    load_default() {
      this.step = 1;

      if (!this.basketItem || !this.basketItem.return_request) {
        this.note = "";
        this.count = 1;
        this.reason = null;
        return;
      }
      this.note = this.basketItem.return_request.note;
      this.count = this.basketItem.return_request.count;
      this.reason = this.basketItem.return_request.reason;
    },

    addReturnItemRequest() {
      const shop_name = this.shop_name;
      const basket_id = this.$route.params.basket_id;

      const item_id = this.basketItem.id;
      let t = this;
      this.busy = true;
      axios
        .post(
          window.XAPI.POST_BASKET_ITEM_RETURN_REQUEST(
            shop_name,
            basket_id,
            item_id,
          ),
          {
            reason: this.reason,
            count: this.count,
            note: this.note,
            /*image: this.image,
                                video: this.video,
                                voice: this.voice*/
          },
        )
        .then(({ data }) => {
          console.log(data);
          if (!data.error) {
            t.showSuccessAlert(
              null,
              this.$t("return_request.notifications.add_success"),
            );
            t.basketItem.return_request = data.return_request;
            t.step = 2;
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

    /* onNewImageUpload(path) {
      this.image = path;
    },*/

    handleProcessFileImage: function (error, file) {
      if (!error) {
        let response = JSON.parse(file.serverId);
        this.image = response.files.path;
        return true;
      }
    },

    handleProcessFileVideo: function (error, file) {
      if (!error) {
        let response = JSON.parse(file.serverId);
        this.video = response.files.path;
        return true;
      }
    },
    handleProcessFileVoice: function (error, file) {
      if (!error) {
        let response = JSON.parse(file.serverId);
        this.voice = response.files.path;
        return true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-basket-item-return-form {
  .item-return {
    min-height: 52px;
    text-align: right;
    border-bottom-width: 1px;
    border-bottom-color: #aaa;
    border-bottom-style: dashed;

    display: grid;
    grid-template-columns: 60px auto;
    grid-gap: 10px;

    padding: 10px;

    .image {
      grid-row: 1 / span 2;
    }
  }
}
</style>
