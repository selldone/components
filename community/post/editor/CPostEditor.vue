<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
    v-if="!post_restricted"
    :class="{
      my10vh:
        body || video || voice || image || title || focus || tab !== 'text',
      'border-top-thick -red': private,
    }"
    class="c-container -force-rounded position-relative bg-white nopx pa-3 t-all-400"
    cols="12"
  >
    <!-- tips: overflow-visible: show discount ribbon of product -->
    <div
      :class="{
        'c-widget': body || title,
        'blurred pointer-event-none': !can_post,
        'overflow-y-auto': scrollable,
      }"
      class="bg-white z2 blur-animate nopx overflow-visible t-all-400"
    >
      <div class="pb-2" style="overflow-x: auto; overflow-y: visible">
        <u-tabs-rounded
          v-model="tab"
          :radius="'50px'"
          :tabs="tabs"
          class="m-2"
          scrollable
          small
        >
        </u-tabs-rounded>
      </div>

      <v-slide-y-transition leave-absolute hide-on-leave>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Monetize ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div
          v-if="tab === 'monetize'"
          class="px-4 py-2 max-widget-width mx-auto disabled"
        >
          <v-list-subheader class="mb-2">
            <span>
              <v-icon class="me-1" color="red">warning_amber</v-icon> Available
              by your request. Please send it to support@selldone.com or Tweet
              it!
            </span>
          </v-list-subheader>
          <v-select
            v-model="subscription"
            :item-title="(v) => $t(v.name)"
            :items="Object.values(TopicSubscriptionType)"
            :placeholder="$t('community.editor.no_subscription')"
            clearable
            item-value="code"
            title="Subscription type"
            variant="solo"
          ></v-select>

          <template v-if="subscription">
            <u-currency-input
              v-model="currency"
              :activeCurrencies="currencies"
              :title="$t('global.commons.price')"
              class="delay_100"
              icon-only
              placeholder="Select a currency..."
            />

            <u-price-input
              v-model="price"
              :decimal="currency ? currency.floats : 0"
              :label="$t('community.commons.subscription_fee')"
              :rules="[GlobalRules.required()]"
              :suffix="currency ? currency.code : undefined"
              :title="$t('global.commons.currency')"
              class="delay_200 strong-field"
              placeholder="0.00"
            >
            </u-price-input>

            <v-select
              v-model="trial"
              :item-title="(v) => $t(v.name)"
              :items="Object.values(TopicTrialType)"
              :placeholder="$t('community.commons.no_trial_mode')"
              :title="$t('community.commons.trial_mode')"
              class="fadeIn delay_300"
              clearable
              item-value="code"
            ></v-select>
          </template>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Configuration ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div v-if="tab === 'config'" class="px-4 py-2">
          <u-smart-switch
            v-model="nofollow"
            :true-description="$t('community.editor.nofollow_msg')"
            :true-title="$t('community.commons.nofollow')"
            border
            class="my-3"
            false-title="Follow links"
            label="Follow / Nofollow links"
          ></u-smart-switch>
          <u-smart-switch
            v-model="cross"
            :false-title="$t('global.commons.disable')"
            :true-description="$t('community.editor.cross_msg')"
            :true-title="$t('community.commons.cross')"
            border
            class="my-3"
            false-gray
            label="Crossable topic by other communities"
            true-icon="shuffle"
          ></u-smart-switch>
          <u-smart-switch
            v-model="pin"
            :true-description="$t('community.editor.pin_msg')"
            :true-title="$t('community.commons.pin')"
            border
            class="my-3"
            false-gray
            false-title="Normal topic"
            label="Pin topic"
            true-icon="push_pin"
          ></u-smart-switch>
          <u-smart-switch
            v-model="private"
            :false-description="$t('community.editor.private_off_msg')"
            :false-title="$t('community.commons.public')"
            :true-description="$t('community.editor.private_on_msg')"
            :true-title="$t('community.commons.private')"
            border
            class="my-3"
            color="red"
            false-icon="public"
            label="Who can see this topic?"
            true-icon="admin_panel_settings"
          ></u-smart-switch>

          <u-smart-switch
            v-model="lock_post"
            border
            class="my-3"
            false-description="Anyone can send a post here."
            false-title="Anyone"
            label="Who can send new posts?"
            true-description="Only moderators can post."
            true-icon="lock"
            true-title="Lock posts"
          ></u-smart-switch>

          <u-smart-switch
            v-model="lock_comment"
            border
            class="my-3"
            false-description="Anyone can send a comment here."
            false-title="Anyone"
            label="Who can send new comments?"
            true-description="No one can comment."
            true-icon="lock"
            true-title="Lock comments"
          ></u-smart-switch>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ SEO ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div v-if="tab === 'seo'" class="px-4 py-2">
          <v-img
            :src="cover ? cover : image"
            class="rounded-18px mb-2 zoomIn border"
            height="128"
            width="128"
          >
            <v-btn
              class="center-absolute"
              icon
              variant="text"
              size="large"
              @click="showSelectCover"
            >
              <v-icon>camera</v-icon>
            </v-btn>
          </v-img>

          <input
            ref="cover_input"
            accept="image/*"
            hidden="hidden"
            type="file"
            @change="onSelectCover"
          />

          <small class="fadeIn delay_100">{{
            $t("community.editor.topic_title")
          }}</small>
          <v-textarea
            :append-inner-icon="title_page_auto ? 'lock' : 'lock_open '"
            :model-value="title_page_auto ? title : title_page"
            :placeholder="$t('community.editor.topic_placeholder')"
            :readonly="title_page_auto"
            auto-grow
            class="font-weight-bold fadeIn delay_200"
            counter="128"
            variant="underlined"
            rows="1"
            @update:model-value="(val) => (title_page = val)"
            @click:append-inner="
              title_page_auto = !title_page_auto;
              title_page = !title_page_auto ? title : title_page;
            "
          ></v-textarea>

          <small class="fadeIn delay_300">{{
            $t("community.editor.topic_desc")
          }}</small>

          <v-textarea
            :append-inner-icon="desc_auto ? 'lock' : 'lock_open '"
            :disabled="!can_edit_body"
            :model-value="desc_auto ? body_text : desc"
            :placeholder="$t('community.editor.desc_placeholder')"
            :readonly="desc_auto"
            auto-grow
            class="fadeIn delay_400"
            counter="256"
            rows="3"
            variant="underlined"
            @update:model-value="(val) => (desc = val)"
            @click:append-inner="
              desc_auto = !desc_auto;
              desc = !desc_auto ? body_text : desc;
            "
          ></v-textarea>
        </div>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Product post ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div v-else-if="tab === 'product'">
          <c-product-editor
            v-if="shop && !post"
            v-model="product_id"
            :community="community"
            :shop="shop"
            class="my-4"
          >
          </c-product-editor>
          <c-product-view
            v-else-if="shop"
            :community="community"
            :shop="shop"
            class="my-4"
          >
          </c-product-view>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Voice post ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <u-voice-box
          v-else-if="tab === 'voice'"
          v-model="voice"
          v-model:voice-file="voice_file"
          class="m-4"
        ></u-voice-box>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Text post ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅-->
        <div v-else-if="tab === 'text'">
          <v-textarea
            v-if="topicMode"
            v-model="title"
            :error-messages="
              body && !title ? 'Enter a title to continue.' : undefined
            "
            :placeholder="$t('community.editor.title_placeholder')"
            auto-grow
            class="font-weight-black mx-4"
            flat
            rows="1"
            variant="solo"
            @blur="focus = false"
            @focus="focus = true"
          ></v-textarea>

          <u-text-mention-input
            ref="textarea"
            v-model="body"
            v-model:mentions="mentions"
            v-model:text="body_text"
            :placeholder="$t('community.editor.body_placeholder')"
            messages="Markdown: **bold** , @user , __italic__ , ## header2 , ### header 3 , ..."
            auto-grow
            class="my-2 mx-3"
            flat
            outlined
            rows="4"
            solo
            @blur="focus = false"
            @focus="focus = true"
          >
          </u-text-mention-input>

          <u-dense-circles-users
            v-if="mentions && mentions.users"
            :ids="mentions.users"
            :size="32"
          ></u-dense-circles-users>

          <!-- Poll , tips: can not edit poll after create! -->

          <template v-if="topicMode">
            <c-post-poll
              v-model="poll"
              :editable="!topic || !topic.poll"
              :user-selected-id="topic && topic.action && topic.action.poll"
            ></c-post-poll>
            <v-btn
              v-if="topic && topic.poll"
              class="m-2 zoomIn"
              color="red"
              size="small"
              variant="text"
              @click="poll = null"
              >{{ $t("community.editor.remove_poll") }}
            </v-btn>
          </template>

          <!-- image -->
          <v-expand-transition>
            <v-img
              v-if="image"
              ref="post_image"
              :aspect-ratio="in_edit_mode ? aspect : undefined"
              :src="image"
              class="position-relative"
              height="auto"
              max-height="800"
              width="100%"
              @load="setImageRation"
            >
              <v-btn
                v-if="!in_edit_mode"
                class="absolute-top-end"
                variant="flat"
                @click="
                  image = null;
                  image_file = null;
                "
              >
                <v-icon>close</v-icon>
              </v-btn>
            </v-img>
          </v-expand-transition>

          <input
            ref="image_input"
            accept="image/*"
            hidden="hidden"
            type="file"
            @change="onSelectImage"
          />

          <!-- Video -->
          <v-expand-transition>
            <div v-show="video" class="position-relative">
              <video
                ref="video_view"
                controls
                style="max-height: 400px; background-color: #000"
                width="100%"
              >
                <source
                  id="video_here"
                  :src="video"
                  :type="VideoHelper.GetMime(video)"
                />
              </video>

              <div class="absolute-top-end">
                <v-btn
                  v-if="topicMode && !busy"
                  :title="$t('community.editor.take_screenshot')"
                  class="m-1"
                  variant="flat"
                  @click="screenshot(true)"
                >
                  <v-icon>camera</v-icon>
                </v-btn>

                <v-btn
                  v-if="!busy && !in_edit_mode"
                  class="m-1"
                  variant="flat"
                  @click="
                    video = null;
                    video_file = null;
                  "
                >
                  <v-icon>close</v-icon>
                </v-btn>
              </div>
            </div>
          </v-expand-transition>

          <input
            ref="video_input"
            accept="video/*"
            hidden="hidden"
            type="file"
            @change="onSelectVideo"
          />

          <!-- Link -->
          <v-expand-transition>
            <div v-if="link_mode && !video && !image && !link_preview">
              <v-text-field
                v-model="link"
                :disabled="busy_link"
                :loading="busy_link"
                :messages="$t('community.editor.take_link_msg')"
                :readonly="in_edit_mode"
                append-inner-icon="check"
                class="mx-2 mb-2"
                clearable
                placeholder="https://..."
                @blur="submitLink()"
                @keydown.enter="submitLink()"
                @click:append-inner="submitLink()"
                variant="outlined"
              >
              </v-text-field>
            </div>
          </v-expand-transition>
          <div v-if="link_preview" class="position-relative mx-4 my-2">
            <h3>{{ link_preview.title }}</h3>
            <p v-if="link_preview.type !== 'link'">
              {{ link_preview.description }}
            </p>

            <div class="mt-2 limit-w" v-html="link_preview.html"></div>

            <v-btn
              v-if="!busy && !in_edit_mode"
              class="absolute-top-end"
              variant="flat"
              @click="
                link = null;
                link_preview = null;
              "
            >
              <v-icon>close</v-icon>
            </v-btn>
          </div>

          <!-- Upload progress -->

          <div style="min-height: 12px">
            <v-progress-linear
              v-if="busy"
              :model-value="progress"
              class="fadeIn mt-1"
              color="blue"
              height="4px"
            ></v-progress-linear>
          </div>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Attach Files ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div v-else-if="tab === 'attach'">
          <c-attach-editor
            v-if="!post"
            v-model="attach_files"
            :community="community"
            class="my-4"
          >
          </c-attach-editor>

          <template v-else>
            <c-attach-viewer
              v-if="post?.attachments?.length"
              :files="post?.attachments"
              :post="post"
              view-only
            >
            </c-attach-viewer>
            <div class="text-start small pa-3">
              <v-icon class="me-1">warning_amber</v-icon>
              You can not edit attachments after sending them. If you remove
              post, attachments will be deleted.
            </div>
          </template>
        </div>
      </v-slide-y-transition>

      <!-- Buttons to select image / video / link -->
      <div class="d-flex border-between widget-bottom">
        <template v-if="tab === 'text'">
          <v-btn
            :disabled="!can_add_media"
            size="large"
            class="w-25"
            variant="text"
            @click="showSelectImage()"
          >
            <v-icon class="me-1">add_a_photo</v-icon>
            <span class="d-none d-sm-inline-block">{{
              $t("community.editor.add_image")
            }}</span>
          </v-btn>

          <v-btn
            :disabled="!can_add_media"
            size="large"
            class="w-25"
            variant="text"
            @click="showSelectVideo()"
          >
            <v-icon class="me-1">video_call</v-icon>
            <span class="d-none d-sm-inline-block">{{
              $t("community.editor.add_video")
            }}</span>
          </v-btn>

          <v-btn
            :disabled="!can_add_media"
            size="large"
            class="w-25"
            variant="text"
            @click="link_mode = !link_mode"
          >
            <v-icon class="me-1">add_link</v-icon>
            <span class="d-none d-sm-inline-block">{{
              link_mode
                ? $t("community.editor.no_link")
                : $t("community.editor.add_link")
            }}</span>
          </v-btn>
        </template>
        <v-spacer v-else></v-spacer>

        <v-btn
          :class="{ disabled: !can_send }"
          :loading="busy"
          size="large"
          :variant="!body ? 'text' : 'flat'"
          class="w-25"
          color="blue"
          @click="sendPost()"
        >
          <span class="d-none d-sm-inline-block">{{
            $t("community.editor.send_post")
          }}</span>
          <v-icon class="ms-1 flip-rtl">send</v-icon>
        </v-btn>
      </div>
    </div>

    <div v-if="!can_post" class="c-overlay c-widget d-flex flex-column">
      <p class="font-weight-black mx-4 my-2">
        {{ $t("community.editor.eligible_title") }}
      </p>

      <v-btn
        v-if="!USER()"
        class="ma-auto"
        color="blue"
        rounded
        size="x-large"
        variant="flat"
        @click="NeedLogin()"
        ><span class="me-2 text-h4">👋</span>
        <div class="text-start">
          {{ $t("global.actions.login_now") }}
          <small class="d-block text-white">{{
            $t("community.commons.login_msg")
          }}</small>
        </div>
      </v-btn>

      <div v-else class="ma-auto">
        <v-list-item v-for="(item, i) in checklist" :key="i" density="compact">
          <template v-slot:prepend>
            <v-icon :color="item.check ? 'success' : '#333'" size="36"
              >{{ item.check ? "check_circle" : "check_circle_outline" }}
            </v-icon>
          </template>
          <v-list-item-title>
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </div>
    </div>

    <u-loading-progress v-if="busy_link" style="top: -8px"></u-loading-progress>

    <!-- ----------------------- Preview dialog ----------------------- -->
    <v-dialog v-if="false" v-model="preview" max-width="620" scrollable>
      <v-card v-if="preview" class="text-start">
        <v-card-title class="font-weight-black">{{ title }}</v-card-title>
        <v-card-text>
          <div
            class="html-style text-black"
            style="font-size: 16px; line-height: 1.6em"
            v-html="purify(body)"
          ></div>
        </v-card-text>
        <!-- image -->
        <v-img
          v-if="image"
          :src="image"
          class="position-relative"
          height="auto"
          max-height="800"
          width="100%"
        >
        </v-img>
        <!-- Video -->
        <video
          v-if="video"
          ref="video_view_prev"
          controls
          style="max-height: 400px; background-color: #000"
          width="100%"
        >
          <source :src="video" :type="VideoHelper.GetMime(video)" />
        </video>

        <!-- Link -->
        <div v-if="link_preview" class="position-relative mx-4 my-2">
          <h3>{{ link_preview.title }}</h3>
          <p v-if="link_preview.type !== 'link'">
            {{ link_preview.description }}
          </p>
          <div class="mt-2" v-html="link_preview.html"></div>
        </div>

        <v-card-actions>
          <v-btn size="large" variant="text" @click="preview = false"
            >{{ $t("global.actions.back") }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            :loading="busy"
            color="success"
            variant="flat"
            @click="sendPost()"
            >{{ $t("global.actions.send") }}
            <v-icon class="ms-1" size="small">send</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import UVoiceBox from "../../../community/voice/box/UVoiceBox.vue";
import UTabsRounded from "../../../ui/tab/rounded/UTabsRounded.vue";
import GlobalRules from "@selldone/core-js/helper/rules/GlobalRules.ts";
import UTextMentionInput from "../../../ui/text/mention-input/UTextMentionInput.vue";
import { SmartConvertTextToHtmlHashtags } from "@selldone/core-js/helper/html/HtmlHelper.ts";
import UDenseCirclesUsers from "../../../ui/dense-circles/users/UDenseCirclesUsers.vue";
import { Screenshot } from "@selldone/core-js/helper/canvas/Screenshot.ts";
import { FileHelper } from "@selldone/core-js/utils/file/FileHelper.ts";
import UPriceInput from "../../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency.ts";
import CPostPoll from "../poll/CPostPoll.vue";
import CProductEditor from "../../../community/product/editor/CProductEditor.vue";
import CProductView from "../../../community/product/view/CProductView.vue";
import { ImageDimension } from "@selldone/core-js/helper/image/ImageDimension.ts";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import CAttachEditor from "../../../community/attach/editor/CAttachEditor.vue";
import CAttachViewer from "../../../community/attach/viewer/CAttachViewer.vue";
import { VideoHelper } from "@selldone/core-js/helper/video/VideoHelper.ts";
import { delay } from "lodash-es";
import { Community, CommunityTopic } from "@selldone/core-js";
import AuthMixin from "@selldone/components-vue/mixin/auth/AuthMixin.ts";


/**
 * Calculate aspect ratio of element.
 * @param el
 * @returns number
 */
function getAspect(el) {
  return ImageDimension.GetAspect(el);
}

export default {
  name: "CPostEditor",

  mixins: [AuthMixin ],

  components: {
    CAttachViewer,
    CAttachEditor,
    USmartSwitch,
    CProductView,
    CProductEditor,
    CPostPoll,
    UCurrencyInput,
    UPriceInput,
    UDenseCirclesUsers,
    UTextMentionInput,
    UTabsRounded,
    UVoiceBox,
  },

  props: {
    community: {
      required: true,
      type: Object,
    },
    category: {
      required: false,
      type: Object,
    },

    topic: {},

    post: {},

    canVoice: {
      type: Boolean,
      default: false,
    },
    canProduct: {
      type: Boolean,
      default: false,
    },

    topicMode: {
      type: Boolean,
      default: false,
    },

    scrollable: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      VideoHelper: VideoHelper,

      title: null,
      body: null,
      body_text: null,
      desc: null,

      cover: null,
      cover_file: null,

      mentions: {},

      image: null,
      image_file: null,

      video: null,
      video_file: null,

      aspect: 1,

      link: null,
      link_preview: null,

      // Topic mode only:
      title_page: null,
      title_page_auto: true,

      desc_auto: true,

      // Configuration:
      nofollow: false,
      cross: false,
      private: false,
      pin: false,
      lock_post: false,
      lock_comment: false,

      // Monetization:
      subscription: null,
      trial: null,
      price: 0,
      currency: null,

      TopicSubscriptionType: CommunityTopic.SubscriptionTypes,
      TopicTrialType: CommunityTopic.TrialTypes,

      poll: null,

      // -------------------

      link_mode: false,

      tab: "text",
      focus: false,

      // -------------------
      busy_link: false,

      // -------------------
      preview: false,

      // -------------------
      voice: null,
      voice_file: null,

      product_id: null,

      attach_files: [],
      //--------------------
      busy: false,
      progress: 0, // Upload progress
    };
  },

  computed: {
    post_restricted() {
      // If true user can not send post!
      return (
        this.USER() &&
        !this.access.post &&
        this.community.stage === Community.StageLevels.PRIVATE.code
      );
    },

    access() {
      return this.community.access;
    },
    shop() {
      // When community is for shop!
      return this.getShop();
    },
    currencies() {
      return this.shop ? this.shop.currencies : Object.keys(Currency); // All currencies for Selldone community
    },

    tabs() {
      const out = [
        {
          title: this.$t("community.commons.text"),
          value: "text",
          color: "#03A9F4",
          icon: "subject",
        },
      ];

      if (this.canVoice) {
        out.push({
          title: this.$t("community.commons.voice"),
          value: "voice",
          color: "#03A9F4",
          icon: "mic",
          check: !!this.voice,
        });
      }

      if (this.canProduct && this.shop) {
        out.push({
          title: this.$t("community.commons.product"),
          value: "product",
          color: "#03A9F4",
          icon: "shopping_bag",
          check: !!this.product_id,
        });
      }
      if (this.access.attach) {
        out.push({
          title: this.$t("community.commons.attach_file"),
          value: "attach",
          color: "#03A9F4",
          icon: "attach_file",
          check: this.attach_files?.length,
        });
      }

      if (this.topicMode) {
        out.push({
          title: this.$t("community.commons.seo"),
          value: "seo",
          color: "#90f403",
          icon: "auto_awesome",
        });

        // Only admins can config configuration and monetization of topic:
        if (this.access.admin || this.access.moderator) {
          out.push({
            title: this.$t("community.commons.configuration"),
            value: "config",
            color: "#f46303",
            icon: "tune",
          });
        }
        // Only admins can config configuration and monetization of topic:
        if (this.access.admin) {
          out.push({
            title: this.$t("community.commons.monetize"),
            value: "monetize",
            color: "#5f03f4",
            icon: "monetization_on",
            check: !!this.subscription,
          });
        }
      }

      return out;
    },

    can_post() {
      return this.access.post;
    },
    can_add_media() {
      return !this.video && !this.image && !this.link && !this.in_edit_mode;
    },

    profile() {
      return this.USER().profile;
    },

    checklist() {
      const out = [];

      out.push({
        title: this.$t("community.tips.verify_email"),
        check: this.USER().email_verified,
      });
      out.push({
        title: this.$t("community.tips.verify_phone"),
        check: this.USER().phone_verified,
      });
      out.push({
        title: this.$t("community.tips.need_nominate"),
        check: this.profile.verified || this.profile.nominated_id,
      });

      return out;
    },

    can_send() {
      return (!this.topicMode || this.title) && this.body;
    },

    in_edit_mode() {
      return (this.topicMode && this.topic) || (!this.topicMode && this.post);
    },
    can_edit_body() {
      return (
        !this.in_edit_mode ||
        (this.post && this.post.user_id === this.USER_ID())
      ); // only author can edit them post
    },
  },

  created() {
    if (this.topic && this.topicMode) {
      // Inherit configs:
      this.nofollow = this.topic.nofollow;
      this.cross = this.topic.cross;

      this.title = this.topic.title;
      this.title_page = this.topic.title_page;
      this.body_text = this.topic.desc;
      this.desc = this.topic.desc;

      this.nofollow = this.topic.nofollow;
      this.cross = this.topic.cross;
      this.private = this.topic.private;
      this.pin = this.topic.pin;

      this.lock_post = this.topic.lock_post;
      this.lock_comment = this.topic.lock_comment;

      this.subscription = this.topic.subscription;
      this.trial = this.topic.trial;
      this.price = this.topic.price;

      // Set initial currency for monetization
      if (this.currencies && this.currencies.length)
        this.currency = Currency[this.currencies[0]];

      if (this.topic.currency) this.currency = Currency[this.topic.currency];

      this.cover = this.topic.image
        ? this.getShopImagePath(this.topic.image)
        : null; // Show valid image in edit mode

      this.poll = this.topic.poll ? Object.assign([], this.topic.poll) : null;
    } else if (this.topicMode) {
      // initial state of creating new topic:
      this.nofollow = this.category.nofollow;
      this.cross = this.category.cross;
      //console.log('******************',this.category)
    }

    if (this.post) {
      this.body = this.post.body;
      this.mentions = this.post.mentions;
      this.video = this.getVideoUrl(this.post.video);
      this.link = this.post.link;

      this.voice = this.post.voice;
      this.product_id = this.post.product_id;

      this.aspect = this.post.aspect;

      this.image = this.post.image
        ? this.getShopImagePath(this.post.image)
        : null; // Show valid image in edit mode

      /*   this.tab = this.video
        ? "text"
        : this.voice
        ? "voice"
        : this.product_id
        ? "product"
        : "text";*/
    } else if (!this.topicMode) {
      // initial state of creating new post:
      this.nofollow = this.topic.nofollow;
      this.cross = this.topic.cross;
    }

    // Load preview:
    if (this.link) this.submitLink();
  },

  methods: {
    getVideoUrl(file_name: string) {
      return window.CDN.GET_VIDEO_URL(file_name);
    },

    purify(message) {
      // Hashtag pages :
      return SmartConvertTextToHtmlHashtags(message, false, true, "/community"/*Search in community!*/);
    },

    //――――――――――――――――――――――― Post > Cover ―――――――――――――――――――――――

    showSelectCover() {
      const defaultFile = this.$refs.cover_input;
      defaultFile.click();
    },

    onSelectCover() {
      const defaultFile = this.$refs.cover_input;

      // Image Preview
      const file = defaultFile.files[0];

      if (file.size > 2 * 1024 * 1024) {
        NotificationService.showErrorAlert(null, "Max image size limit is 2Mb.");
        return;
      }

      if (file) {
        //Read File
        const fileReader = new FileReader();

        const t = this;
        fileReader.addEventListener("load", function () {
          // convert image to base64 encoded string
          t.cover = this.result;
          t.cover_file = file;
        });
        fileReader.readAsDataURL(file);
      }
    },

    //――――――――――――――――――――――― Post > Image ―――――――――――――――――――――――

    showSelectImage() {
      const defaultFile = this.$refs.image_input;
      defaultFile.click();
    },

    onSelectImage() {
      const defaultFile = this.$refs.image_input;

      // Image Preview
      const file = defaultFile.files[0]; //files[0] - For getting first file
      //   console.log(files);

      if (file.size > 2 * 1024 * 1024) {
        NotificationService.showErrorAlert(null, "Max image size limit is 2Mb.");
        return;
      }

      if (file) {
        //Read File
        const fileReader = new FileReader();

        const t = this;
        fileReader.addEventListener("load", function () {
          // convert image to base64 encoded string
          t.image = this.result;
          t.image_file = file;
        });
        fileReader.readAsDataURL(file);
      }
    },

    //――――――――――――――――――――――― Post > Video ―――――――――――――――――――――――

    showSelectVideo() {
      const defaultFile = this.$refs.video_input;
      defaultFile.click();
    },

    onSelectVideo() {
      const defaultFile = this.$refs.video_input;

      // Video Preview
      const file = defaultFile.files[0]; //files[0] - For getting first file

      if (file.size > 8 * 1024 * 1024) {
        NotificationService.showErrorAlert(null, "Max image size limit is 8Mb.");
        return;
      }

      if (file) {
        this.video = window.URL.createObjectURL(file);
        this.video_file = file;

        this.$nextTick(() => {
          this.$refs.video_view.load();
          delay(() => {
            this.screenshot();

            this.setVideoRation();
          }, 1000);
        });
      }
    },

    screenshot(flash = false) {
      // console.log("---screenshot---");
      this.cover = Screenshot.FromVideo(this.$refs.video_view, null, flash);
      this.cover_file = FileHelper.DataURItoBlob(this.cover);
    },

    //――――――――――――――――――――――― Post > Link ―――――――――――――――――――――――

    submitLink() {
      if (!this.link || !GlobalRules.ValidURL(this.link)) {
        NotificationService.showErrorAlert(null, "Enter valid url!");
        return;
      }
      this.busy_link = true;

      axios
        .get(window.ARTICLE_API.GET_LINK_PREVIEW(), {
          params: {
            url: this.link,
          },
        })
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.link_preview = data;
            // console.log("link_preview", this.link_preview);
          }
        })
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy_link = false;
        });
    },

    //――――――――――――――――――――――― Post > Send ―――――――――――――――――――――――

    setImageRation() {
      if (this.in_edit_mode) return;
      this.$nextTick(() => {
        delay(() => {
          this.aspect = getAspect(this.$refs.post_image.$el);
        }, 350);
      });
    },

    setVideoRation() {
      if (this.in_edit_mode) return;
      this.$nextTick(() => {
        delay(() => {
          this.aspect = getAspect(this.$refs.video_view);
        }, 350);
      });
    },

    sendPost() {
      // Check link submitted:
      if (this.link && !this.link_preview) {
        this.submitLink();
        NotificationService.showWarningAlert(
          "Submit link",
          "The link preview must first be created correctly.",
        );
        return;
      }

      this.busy = true;

      const formData = new FormData();

      // ――――――――― TOPIC ―――――――――
      if (this.topicMode) {
        formData.append("category_id", this.category.id);
        formData.append("title", this.title);

        // Set topic title:
        if (this.title_page_auto || !this.title_page) {
          this.title_page = this.title;
        }
        formData.append("title_page", this.title_page);

        // Set topic desc:
        if (this.desc_auto || !this.desc) {
          // Auto generate description from body.
          this.desc = this.body_text;
        }

        formData.append(
          "desc",
          this.desc
            .replace(/__+/g, " ")
            .replace(/\*\*+/g, " ")
            .substring(0, 256),
        ); // Remove markdown chars!

        // Set topic image:
        if (this.cover_file)
          formData.append(
            "cover",
            this.cover_file,
            this.cover_file.name ? this.cover_file.name : "cover.jpg",
          );

        // ⛔ Admin configuration:
        formData.append("nofollow", this.nofollow);
        formData.append("cross", this.cross);
        formData.append("private", this.private);
        formData.append("pin", this.pin);

        formData.append("lock_post", this.lock_post);
        formData.append("lock_comment", this.lock_comment);

        // Payment:
        if (this.subscription) {
          if (!this.currency) {
            NotificationService.showErrorAlert(null, "Select a currency!");
            return;
          }
          formData.append("subscription", this.subscription);
          formData.append("price", this.price);
          formData.append("currency", this.currency.code);
          if (this.trial) formData.append("trial", this.trial);
        }

        // Poll:
        if (this.poll) {
          formData.append("poll", JSON.stringify(this.poll));
        }
      }

      // ――――――――― POST ―――――――――

      formData.append("body", this.body);

      if (this.link) {
        formData.append("link", this.link);
        if (this.link_preview)
          formData.append("link_preview", JSON.stringify(this.link_preview));
      }

      if (this.mentions)
        formData.append("mentions", JSON.stringify(this.mentions));

      // Calculate aspect ratio of media:

      if (this.image_file) {
        formData.append("aspect", this.aspect);
      } else if (this.video_file) {
        formData.append("aspect", this.aspect);
      }

      // IMAGE POST
      if (this.image_file)
        formData.append("image", this.image_file, this.image_file.name);

      // VIDEO POST
      if (this.video_file)
        formData.append("video", this.video_file, this.video_file.name);

      // VOICE POST
      if (this.voice_file) {
        let blob = new Blob([this.voice_file], { type: "audio/mpeg" });
        formData.append("voice", blob, "voice.mp3");
      }

      // PRODUCT POST
      if (this.product_id) {
        formData.append("product_id", this.product_id);
      }

      // Attach files:
      if (this.attach_files?.length) {
        this.attach_files.forEach((file) => {
          formData.append("attaches[]", file);
        });
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (e) => {
          const pval = Math.floor((e.loaded / (e.total + 0.001)) * 100);
          //console.log("progress", e.loaded, e.total, pval + "%");
          this.progress = pval;
        },
      };

      let promise = null;

      // * Topic editor mode:
      if (this.topicMode) {
        if (this.topic) {
          // EDIT TOPIC
          promise = axios.post(
            window.CAPI.POST_COMMUNITY_TOPIC_EDIT(
              this.topic.community_id,
              this.topic.id,
            ),
            formData,
            config,
          );
        } else {
          // NEW POST
          promise = axios.post(
            window.CAPI.POST_COMMUNITY_TOPIC_CREATE(this.community.id),
            formData,
            config,
          );
        }
      }

      // * Post editor mode:
      else {
        // EDIT TOPIC
        if (this.post) {
          promise = axios.post(
            window.CAPI.POST_COMMUNITY_TOPIC_POST_EDIT(
              this.post.community_id,
              this.post.topic_id,
              this.post.id,
            ),
            formData,
            config,
          );
        } else {
          // NEW POST
          promise = axios.post(
            window.CAPI.POST_COMMUNITY_TOPIC_POST_CREATE(
              this.community.id,
              this.topic.id,
            ),
            formData,
            config,
          );
        }
      }

      promise
        .then(({ data }) => {
          if (!data.error) {
            if (this.topicMode) {
              if (this.topic) {
                this.$emit("update:topic", data.topic);
              } else {
                this.$emit("add:topic", data.topic);
                this.resetToDefault(); // 🞇 Reset to default
              }
            } else {
              if (this.post) {
                this.$emit("update:post", data.post);
              } else {
                this.$emit("add:post", data.post);
                this.resetToDefault(); // 🞇 Reset to default
              }
            }
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

<style lang="scss" scoped>
.my10vh {
  margin-top: 100px;
  margin-bottom: 10vh;
}

.c-overlay {
  position: absolute;
  left: 16px;
  top: 16px;
  right: 16px;
  bottom: 16px;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 3;
}

::v-deep(.embed-video-view) {
  iframe {
    width: 100%;
    min-height: 420px;
  }
}


/*.brt12px {
  @media only screen and (max-width: 600px) {
    border-radius: 12px 12px 0 0;
    margin: 0 !important;
  }
}*/
</style>
