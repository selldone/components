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
  <v-card class="s--shop-basket-item-return-form" rounded="t-xl">
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">keyboard_return</v-icon>
      {{ $t("return_request.title") }}
      <v-spacer></v-spacer>
      <v-btn icon @click="$emit('onClose')" variant="text">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <div class="widget-box mb-5">
        <v-list-item>
          <template v-slot:prepend>
            <u-avatar-folder
              :src="getProductImage(basketItem.product_id)"
              aspect-ratio="1"
              class="image"
            />
          </template>

          <template v-slot:title>
            {{ basketItem.product.title }}
          </template>

          <template v-slot:subtitle>
            {{ basketItem.product.title_en }}
          </template>

          <div class="d-flex align-center">
            <variant-item-view-micro
              v-if="basketItem.variant"
              :product-variant="basketItem.variant"
            />

            <v-spacer></v-spacer>

            P{{ basketItem.product_id }}
            <span v-if="basketItem.variant_id">
              / SVP{{ basketItem.variant_id }}</span
            >
          </div>
        </v-list-item>

        <hr class="my-5" />

        <v-col v-if="step === 1" md6 xs12>
          <p class="action-title text-start m-2">
            <u-number-input
              v-model="count"
              :label="$t('return_request.count_input')"
              :max="basketItem.count"
              :messages="$t('return_request.count_input_message')"
              :min="1"
              variant="underlined"
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
            item-value="value"
            variant="underlined"
          />

          <v-textarea
            v-model="note"
            :hint="$t('return_request.note_input_hint')"
            :label="$t('return_request.note_input')"
            :messages="$t('return_request.note_input_message')"
            :rows="2"
            rounded
            variant="underlined"
          />
        </v-col>

        <v-col v-if="step === 2" class="p-2" cols="12">
          <p class="text-start">
            {{ $t("return_request.media_message") }}
          </p>
        </v-col>

        <template v-if="step === 2">
          <v-img
            v-if="imagePath"
            :height="48"
            :src="imagePath"
            :width="48"
            class="ma-auto"
          />

          <file-pond
            ref="pond_profile"
            :label-idle="`<i class='fas fa-image'></i>  Image`"
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
        </template>

        <template v-if="step === 2">
          <v-img
            v-if="videoPath"
            :height="48"
            :src="require('../../../assets/icons/film.svg')"
            :width="48"
            class="ma-auto"
          />

          <file-pond
            ref="pond_profile"
            :label-idle="`<i class='fas fa-video'></i> ${$t('return_request.video')}`"
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
        </template>

        <template v-if="step === 2">
          <v-img
            v-if="voicePath"
            :height="48"
            :src="require('../../../assets/icons/voice.svg')"
            :width="48"
            class="ma-auto"
          />
          <file-pond
            ref="pond_profile"
            :label-idle="`<i class='fas fa-microphone'></i>  ${$t(
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
        </template>
      </div>
    </v-card-text>
    <v-card-actions class="pb-2">
      <div class="widget-buttons">
        <v-btn
          v-if="step === 2"
          class="m-1"
          variant="text"
          @click="step = 1"
          size="x-large"
        >
          <v-icon start>{{ $t("icons.chevron_back") }}</v-icon>
          {{ $t("global.actions.back") }}
        </v-btn>

        <v-btn
          class="m-1"
          variant="text"
          @click="$emit('onClose')"
          size="x-large"
          :prepend-icon="step === 1 ? 'close' : 'done'"
        >
          {{
            step === 1 ? $t("global.actions.close") : $t("global.actions.done")
          }}
        </v-btn>

        <v-btn
          v-if="step === 1"
          class="m-1"
          color="#C2185B"
          variant="elevated"
          @click="addReturnItemRequest()"
          size="x-large"
          prepend-icon="add_box"
        >
          {{ $t("return_request.add_action") }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import VariantItemViewMicro from "../../../storefront/product/variant/VariantItemViewMicro.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import { BasketItemReturn } from "@selldone/core-js";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import FilePondLoader from "@selldone/components-vue/plugins/filepond/FilePondLoader.ts";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";


export default {
  name: "SShopBasketItemReturnForm",
  mixins: [],
  components: {
    FilePond: FilePondLoader.loadFilePondComponent(),

    UAvatarFolder,
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

      items: BasketItemReturn.Reason.physical,
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
    getShopFileTempPath(file_name: string) {
      return window.CDN.GET_SHOP_TEMP_FILE_PATH(file_name);
    },

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
            NotificationService.showSuccessAlert(
              null,
              this.$t("return_request.notifications.add_success"),
            );
            t.basketItem.return_request = data.return_request;
            t.step = 2;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          console.error(error);
          NotificationService.showLaravelError(error);
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
  text-align: start;
}
</style>
