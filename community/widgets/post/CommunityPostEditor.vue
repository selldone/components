<template>
  <v-col
    v-if="!post_restricted"
    cols="12"
    class="c-container -force-rounded position-relative bg-white nopx"
    :class="{
      my10vh:
        body || video || voice || image || title || focus || tab !== 'text',
      'border-top-thick -red': private,
    }"
  >
    <!-- tips: overflow-visible: show discount ribbon of product -->
    <div
      class="bg-white z2 blur-animate nopx overflow-visible"
      :class="{
        'c-widget': body || title,
        'blured pointer-event-none': !can_post,
        'overflow-y-auto': scrollable,
      }"
    >
      <div style="overflow-x: auto; overflow-y: visible" class="pb-2">
        <rounded-tabs
          :tabs="tabs"
          v-model="tab"
          small
          class="m-2"
          scrollable
          :radius="'50px'"
        >
        </rounded-tabs>
      </div>

      <v-slide-y-transition leave-absolute>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Monetize ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div
          v-if="tab === 'monetize'"
          class="px-4 py-2 max-widget-width mx-auto disabled"
        >
          <v-subheader>
            <span>
              <v-icon class="me-1" color="red">warning_amber</v-icon> Available
              by your request. Please send it to support@selldone.com or Tweet
              it!
            </span>
          </v-subheader>
          <v-select
            v-model="subscription"
            :items="Object.values(TopicSubscriptionType)"
            :item-text="(v) => $t(v.name)"
            item-value="code"
            clearable
            title="Subscription type"
            :placeholder="$t('community.editor.no_subscription')"
          ></v-select>

          <template v-if="subscription">
            <currency-list
              v-model="currency"
              :activeCurrencies="currencies"
              icon-only
              class="delay_100"
              placeholder="Select a currency..."
              :title="$t('global.commons.price')"
            />

            <v-currency-field
              v-model="price"
              class="delay_200 strong-field"
              :title="$t('global.commons.currency')"
              :label="$t('community.commons.subscription_fee')"
              placeholder="0.00"
              :decimal="currency ? currency.floats : 0"
              :rules="[GlobalRules.required()]"
              :suffix="currency ? currency.code : undefined"
            >
            </v-currency-field>

            <v-select
              v-model="trial"
              :items="Object.values(TopicTrialType)"
              :item-text="(v) => $t(v.name)"
              item-value="code"
              clearable
              :title="$t('community.commons.trial_mode')"
              :placeholder="$t('community.commons.no_trial_mode')"
              class="fadeIn delay_300"
            ></v-select>
          </template>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Configuration ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div v-if="tab === 'config'" class="px-4 py-2">
          <s-smart-switch
            v-model="nofollow"
            label="Follow / Nofollow links"
            :true-title="$t('community.commons.nofollow')"
            :true-description="$t('community.editor.nofollow_msg')"
            false-title="Follow links"
            border
            class="my-3"
          ></s-smart-switch>
          <s-smart-switch
            v-model="cross"
            label="Crossable topic by other communities"
            :true-title="$t('community.commons.cross')"
            :true-description="$t('community.editor.cross_msg')"
            true-icon="shuffle"
            :false-title="$t('global.commons.disable')"
            false-gray
            border
            class="my-3"
          ></s-smart-switch>
          <s-smart-switch
            v-model="pin"
            label="Pin topic"
            :true-title="$t('community.commons.pin')"
            :true-description="$t('community.editor.pin_msg')"
            true-icon="push_pin"
            false-title="Normal topic"
            false-gray
            border
            class="my-3"
          ></s-smart-switch>
          <s-smart-switch
            v-model="private"
            color="red"
            label="Who can see this topic?"
            :true-title="$t('community.commons.private')"
            :true-description="$t('community.editor.private_on_msg')"
            true-icon="admin_panel_settings"
            :false-title="$t('community.commons.public')"
            :false-description="$t('community.editor.private_off_msg')"
            false-icon="public"
            border
            class="my-3"
          ></s-smart-switch>

          <s-smart-switch
            v-model="lock_post"
            label="Who can send new posts?"
            true-title="Lock posts"
            true-description="Only moderators can post."
            true-icon="lock"
            false-title="Anyone"
            false-description="Anyone can send a post here."
            border
            class="my-3"
          ></s-smart-switch>

          <s-smart-switch
            v-model="lock_comment"
            label="Who can send new comments?"
            true-title="Lock comments"
            true-description="No one can comment."
            true-icon="lock"
            false-title="Anyone"
            false-description="Anyone can send a comment here."
            border
            class="my-3"
          ></s-smart-switch>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ SEO ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div v-if="tab === 'seo'" class="px-4 py-2">
          <v-img
            width="128"
            height="128"
            class="rounded-18px mb-2 zoomIn"
            :src="cover ? cover : image"
          >
            <v-btn
              class="center-absolute"
              icon
              large
              tile
              @click="showSelectCover"
              ><v-icon>camera</v-icon></v-btn
            >
          </v-img>

          <input
            type="file"
            ref="cover_input"
            hidden="hidden"
            @change="onSelectCover"
            accept="image/*"
          />

          <small class="fadeIn delay_100">{{
            $t("community.editor.topic_title")
          }}</small>
          <v-textarea
            :placeholder="$t('community.editor.topic_placeholder')"
            class="font-weight-bold fadeIn delay_200"
            solo
            flat
            :value="title_page_auto ? title : title_page"
            @input="(val) => (title_page = val)"
            :append-icon="title_page_auto ? 'lock' : 'lock_open '"
            rows="1"
            auto-grow
            @click:append="
              title_page_auto = !title_page_auto;
              title_page = !title_page_auto ? title : title_page;
            "
            :readonly="title_page_auto"
            counter="128"
          ></v-textarea>

          <small class="fadeIn delay_300">{{
            $t("community.editor.topic_desc")
          }}</small>

          <v-textarea
            :placeholder="$t('community.editor.desc_placeholder')"
            :disabled="!can_edit_body"
            class="fadeIn delay_400"
            solo
            flat
            :value="desc_auto ? body_text : desc"
            @input="(val) => (desc = val)"
            :append-icon="desc_auto ? 'lock' : 'lock_open '"
            rows="1"
            auto-grow
            @click:append="
              desc_auto = !desc_auto;
              desc = !desc_auto ? body_text : desc;
            "
            :readonly="desc_auto"
            counter="256"
          ></v-textarea>
        </div>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Product post ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div v-else-if="tab === 'product'">
          <community-product-editor
            v-if="shop && !post"
            :shop="shop"
            :community="community"
            v-model="product_id"
            class="my-4"
          >
          </community-product-editor>
          <community-product-view
            v-else-if="shop"
            :shop="shop"
            :community="community"
            class="my-4"
          >
          </community-product-view>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Voice post ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <voice-recorder
          v-else-if="tab === 'voice'"
          v-model="voice"
          :voice-file.sync="voice_file"
          class="m-4"
        ></voice-recorder>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Text post ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅-->
        <div v-else-if="tab === 'text'">
          <v-textarea
            v-if="topicMode"
            v-model="title"
            @focus="focus = true"
            @blur="focus = false"
            rows="1"
            auto-grow
            class="font-weight-black mx-4"
            :placeholder="$t('community.editor.title_placeholder')"
            solo
            flat
            :error-messages="
              body && !title ? 'Enter a title to continue.' : undefined
            "
          ></v-textarea>

          <s-mentionable-input
            outlined
            v-model="body"
            :text.sync="body_text"
            ref="textarea"
            rows="4"
            auto-grow
            solo
            flat
            class="my-2 mx-3"
            :placeholder="$t('community.editor.body_placeholder')"
            :mentions.sync="mentions"
            @focus="focus = true"
            @blur="focus = false"
          >
          </s-mentionable-input>

          <users-dense-images-circles
            v-if="mentions && mentions.users"
            :ids="mentions.users"
            :size="32"
          ></users-dense-images-circles>

          <!-- Poll , tips: can not edit poll after create! -->

          <template v-if="topicMode">
            <community-poll
              v-model="poll"
              :editable="!topic || !topic.poll"
              :user-selected-id="topic && topic.action && topic.action.poll"
            ></community-poll>
            <v-btn
              v-if="topic && topic.poll"
              @click="poll = null"
              color="red"
              small
              class="m-2 zoomIn"
              text
              >{{ $t("community.editor.remove_poll") }}</v-btn
            >
          </template>

          <!-- image -->
          <v-expand-transition>
            <v-img
              v-if="image"
              ref="post_image"
              width="100%"
              height="auto"
              max-height="800"
              :src="image"
              :aspect-ratio="in_edit_mode ? aspect : undefined"
              class="position-relative"
              contain
              @load="setImageRation"
            >
              <v-btn
                v-if="!in_edit_mode"
                class="absolute-top-end"
                depressed
                tile
                @click="
                  image = null;
                  image_file = null;
                "
                ><v-icon>close</v-icon></v-btn
              >
            </v-img>
          </v-expand-transition>

          <input
            type="file"
            ref="image_input"
            hidden="hidden"
            @change="onSelectImage"
            accept="image/*"
          />

          <!-- Video -->
          <v-expand-transition>
            <div v-show="video" class="position-relative">
              <video
                width="100%"
                controls
                ref="video_view"
                style="max-height: 400px; background-color: #000"
              >
                <source :src="video" id="video_here"  :type="VideoHelper.GetMime(video)"/>
              </video>

              <div class="absolute-top-end">
                <v-btn
                  v-if="topicMode && !busy"
                  class="m-1"
                  depressed
                  tile
                  @click="screenshot(true)"
                  :title="$t('community.editor.take_screenshot')"
                >
                  <v-icon>camera</v-icon>
                </v-btn>

                <v-btn
                  v-if="!busy && !in_edit_mode"
                  class="m-1"
                  depressed
                  tile
                  @click="
                    video = null;
                    video_file = null;
                  "
                  ><v-icon>close</v-icon></v-btn
                >
              </div>
            </div>
          </v-expand-transition>

          <input
            type="file"
            ref="video_input"
            hidden="hidden"
            @change="onSelectVideo"
            accept="video/*"
          />

          <!-- Link -->
          <v-expand-transition>
            <div v-if="link_mode && !video && !image && !link_preview">
              <v-text-field
                :disabled="busy_link"
                :loading="busy_link"
                placeholder="https://..."
                :messages="$t('community.editor.take_link_msg')"
                class="mx-2 mb-2"
                v-model="link"
                clearable
                @keydown.enter="submitLink()"
                append-icon="check"
                @click:append="submitLink()"
                @blur="submitLink()"
                :readonly="in_edit_mode"
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
              depressed
              tile
              @click="
                link = null;
                link_preview = null;
              "
              ><v-icon>close</v-icon></v-btn
            >
          </div>

          <!-- Upload progress -->

          <div style="min-height: 12px">
            <v-progress-linear
              v-if="busy"
              :value="progress"
              color="blue"
              height="4px"
              class="fadeIn mt-1"
            ></v-progress-linear>
          </div>
        </div>


        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Attach Files ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div v-else-if="tab === 'attach'">
          <community-attach-editor
              v-if=" !post"
              :community="community"
              v-model="attach_files"
              class="my-4"

          >
          </community-attach-editor>

          <template v-else>
            <community-attach-view v-if="post?.attachments?.length"  :post="post" :files="post?.attachments" view-only >

            </community-attach-view>
            <v-subheader>
              <div>
                <v-icon class="me-1">warning_amber</v-icon> You can not edit attachments after sending them. If you remove post, attachments will be deleted.
              </div>
            </v-subheader>
          </template>

        </div>



      </v-slide-y-transition>

      <!-- Buttons to select image / video / link -->
      <div class="d-flex border-between fnt-as widget-bottom">
        <template v-if="tab === 'text'">
          <v-btn
            :disabled="!can_add_media"
            depressed
            text
            tile
            :large="$vuetify.breakpoint.smAndUp"
            class="w-25"
            @click="showSelectImage()"
          >
            <v-icon class="me-1">add_a_photo</v-icon>
            <span class="-ah">{{ $t("community.editor.add_image") }}</span>
          </v-btn>

          <v-btn
            :disabled="!can_add_media"
            depressed
            text
            tile
            :large="$vuetify.breakpoint.smAndUp"
            class="w-25"
            @click="showSelectVideo()"
          >
            <v-icon class="me-1">video_call</v-icon>
            <span class="-ah">{{ $t("community.editor.add_video") }}</span>
          </v-btn>

          <v-btn
            :disabled="!can_add_media"
            @click="link_mode = !link_mode"
            depressed
            text
            tile
            :large="$vuetify.breakpoint.smAndUp"
            class="w-25"
          >
            <v-icon class="me-1">add_link</v-icon>
            <span class="-ah">{{
              link_mode
                ? $t("community.editor.no_link")
                : $t("community.editor.add_link")
            }}</span>
          </v-btn>
        </template>
        <v-spacer v-else></v-spacer>

        <v-btn
          depressed
          :class="{ disabled: !can_send }"
          :text="!body"
          color="blue"
          dark
          tile
          :large="$vuetify.breakpoint.smAndUp"
          class="w-25"
          @click="sendPost()"
          :loading="busy"
        >
          <span class="-ah">{{ $t("community.editor.send_post") }}</span>
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
        @click="NeedLogin()"
        class="m-auto"
        color="blue"
        dark
        x-large
        depressed
        rounded
        ><span class="me-2 display-1">👋</span>
        <div class="text-start">
          {{ $t("global.actions.login_now") }}
          <small class="d-block white--text">{{
            $t("community.commons.login_msg")
          }}</small>
        </div></v-btn
      >

      <div v-else class="m-auto">
        <v-list-item v-for="(item, i) in checklist" :key="i" dense>
          <v-list-item-icon>
            <v-icon :color="item.check ? 'success' : '#333'" size="36">{{
              item.check ? "check_circle" : "check_circle_outline"
            }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </div>
    </div>

    <progress-loading v-if="busy_link" style="top: -8px"></progress-loading>

    <!-- ----------------------- Preview dialog ----------------------- -->
    <v-dialog v-if="false" v-model="preview" max-width="620" scrollable>
      <v-card v-if="preview" class="text-start">
        <v-card-title class="font-weight-black">{{ title }}</v-card-title>
        <v-card-text>
          <div
            v-html="purify(body)"
            class="html-style black--text"
            style="font-size: 16px; line-height: 1.6em"
          ></div>
        </v-card-text>
        <!-- image -->
        <v-img
          v-if="image"
          width="100%"
          height="auto"
          max-height="800"
          :src="image"
          class="position-relative"
          contain
        >
        </v-img>
        <!-- Video -->
        <video
          v-if="video"
          width="100%"
          controls
          ref="video_view_prev"
          style="max-height: 400px; background-color: #000"
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
          <v-btn text @click="preview = false" large>{{
            $t("global.actions.back")
          }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn depressed color="success" @click="sendPost()" :loading="busy"
            >{{ $t("global.actions.send") }}
            <v-icon class="ms-1" small>send</v-icon></v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-col>
</template>

<script>
import VoiceRecorder from "../voice/VoiceRecorder.vue";
import RoundedTabs from "@/Components/ui/tab/RoundedTabs.vue";
import GlobalRules from "../../../../../core/helper/rules/GlobalRules";
import SMentionableInput from "@/Components/ui/text/SMentionableInput.vue";
import { SmartConvertTextToHtmlHashtags } from "../../../../../core/helper/html/HtmlHelper";
import UsersDenseImagesCircles from "@/Applications/Backoffice/components/user/UsersDenseImagesCircles.vue";
import { Screenshot } from "../../../../../core/helper/canvas/Screenshot";
import { FileHelper } from "../../../../../core/helper/converters/FileHelper";
import VCurrencyField from "@/Components/ui/input/currency/VCurrencyField.vue";
import CurrencyList from "@/Components/ui/currency/CurrencyList.vue";
import { TopicSubscriptionType } from "../../../../../core/enums/community/TopicSubscriptionType";
import { TopicTrialType } from "../../../../../core/enums/community/TopicTrialType";
import { Currency } from "../../../../../core/enums/payment/Currency";
import CommunityPoll from "./CommunityPoll.vue";
import { CommunityStageLevel } from "../../../../../core/enums/community/CommunityStageLevel";
import CommunityProductEditor from "../product/CommunityProductEditor.vue";
import CommunityProductView from "../product/CommunityProductView.vue";
import ImageDimension from "../../../../../core/helper/image/ImageDimension";
import SSmartSwitch from "@/Components/smart/SSmartSwitch.vue";
import CommunityAttachEditor from "../attach/CommunityAttachEditor.vue";
import CommunityAttachView from "../attach/CommunityAttachView.vue";
import VideoHelper from "../../../../../core/helper/video/VideoHelper";
import _ from "lodash-es";

/**
 * Calculate aspect ratio of element.
 * @param el
 * @returns number
 */
function getAspect(el) {
  return ImageDimension.GetAspect(el);
}

export default {
  components: {
    CommunityAttachView,
    CommunityAttachEditor,
    SSmartSwitch,
    CommunityProductView,
    CommunityProductEditor,
    CommunityPoll,
    CurrencyList,
    VCurrencyField,
    UsersDenseImagesCircles,
    SMentionableInput,
    RoundedTabs,
    VoiceRecorder,
  },

  name: "CommunityPostEditor",

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

      TopicSubscriptionType: TopicSubscriptionType,
      TopicTrialType: TopicTrialType,

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


      attach_files:[],
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
        this.community.stage === CommunityStageLevel.PRIVATE.code
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
      if (this.access.attach ) {
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
    selectEmoji(emoji) {
      // console.log(emoji);
      this.body = $(this.$refs.textarea.$el)
        .find("textarea")[0]
        .insertAtCaret(emoji.data);
    },

    purify(message) {
      // Hashtag pages :
      return SmartConvertTextToHtmlHashtags(message, false, true, "/trends");
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
        this.showErrorAlert(null, "Max image size limit is 2Mb.");
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
        this.showErrorAlert(null, "Max image size limit is 2Mb.");
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
        this.showErrorAlert(null, "Max image size limit is 8Mb.");
        return;
      }

      if (file) {
        this.video = window.URL.createObjectURL(file);
        this.video_file = file;

        this.$nextTick(() => {
          this.$refs.video_view.load();
          _.delay(() => {
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
        this.showErrorAlert(null, "Enter valid url!");
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
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.link_preview = data;
            // console.log("link_preview", this.link_preview);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_link = false;
        });
    },

    //――――――――――――――――――――――― Post > Send ―――――――――――――――――――――――

    setImageRation() {
      if (this.in_edit_mode) return;
      this.$nextTick(() => {
        _.delay(() => {
          this.aspect = getAspect(this.$refs.post_image.$el);
        }, 350);
      });
    },

    setVideoRation() {
      if (this.in_edit_mode) return;
      this.$nextTick(() => {
        _.delay(() => {
          this.aspect = getAspect(this.$refs.video_view);
        }, 350);
      });
    },

    sendPost() {
      // Check link submitted:
      if (this.link && !this.link_preview) {
        this.submitLink();
        this.showWarningAlert(
          "Submit link",
          "The link preview must first be created correctly."
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
            .substring(0, 256)
        ); // Remove markdown chars!

        // Set topic image:
        if (this.cover_file)
          formData.append(
            "cover",
            this.cover_file,
            this.cover_file.name ? this.cover_file.name : "cover.jpg"
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
            this.showErrorAlert(null, "Select a currency!");
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
        formData.append("voice", this.voice_file, "voice.mp3");
      }

      // PRODUCT POST
      if (this.product_id) {
        formData.append("product_id", this.product_id);
      }


      // Attach files:
    if(this.attach_files?.length){
      this.attach_files.forEach(file=>{
        formData.append("attaches[]", file);

      })
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
              this.topic.id
            ),
            formData,
            config
          );
        } else {
          // NEW POST
          promise = axios.post(
            window.CAPI.POST_COMMUNITY_TOPIC_CREATE(this.community.id),
            formData,
            config
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
              this.post.id
            ),
            formData,
            config
          );
        } else {
          // NEW POST
          promise = axios.post(
            window.CAPI.POST_COMMUNITY_TOPIC_POST_CREATE(
              this.community.id,
              this.topic.id
            ),
            formData,
            config
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
                   this.resetToDefault();      // 🞇 Reset to default
              }
            } else {
              if (this.post) {
                this.$emit("update:post", data.post);
              } else {
                this.$emit("add:post", data.post);
                   this.resetToDefault();      // 🞇 Reset to default
              }
            }
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
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

::v-deep .embed-video-view {
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
