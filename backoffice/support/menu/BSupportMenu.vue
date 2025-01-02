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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!------------------------------- Support ------------------------------->

  <v-list-item
      v-if="shop"
    :title="$t('global.commons.support')"
    prepend-icon="fa:fas fa-headset"
    append-icon="expand_more"
    class="pp"
  >
    <v-list-item-subtitle class="small op-0-5">
      Hire experts to help you with your business.
    </v-list-item-subtitle>

    <v-menu

      :persistent="false"
      close-on-content-click
      min-width="240"
      activator="parent"
      max-width="428"
      location="bottom center"
    >
      <v-sheet class="text-start" rounded="b-xl">
        <v-list max-width="480">
          <v-list-item
            v-for="(support, index) in supports"
            :key="index"
            lines="two"
            @click="showSupport(support)"
          >
            <template v-slot:prepend>
              <v-badge
                :model-value="
                  !support.closed && getLastMessage(support).officer
                "
                color="red"
                dot
                floating
                offset-x="18"
                offset-y="10"
              >
                <v-avatar
                  :class="
                    getLastMessage(support).officer ? '-officer' : '-gray'
                  "
                  class="me-2 flex-grow-0 avatar-gradient -thin"
                  size="42"
                >
                  <img :src="getUserAvatar(getLastMessage(support).user_id)" />
                </v-avatar>
              </v-badge>
            </template>

            <v-list-item-title class="title-msg"
              >{{ getLastMessage(support).message }}
            </v-list-item-title>
            <v-list-item-subtitle class="d-flex">
              <div class="flex-grow-1 p-1">
                <v-icon size="x-small">person</v-icon>
                {{ getLastMessage(support).user }}
              </div>

              <div class="flex-grow-1 p-1">
                <v-icon size="x-small">timelapse</v-icon>
                {{ getFromNowString(support.updated_at) }}
              </div>

              <div class="w-25 p-1 text-center">
                <v-chip
                  v-if="support.category"
                  :color="SupportCategory[support.category].color"
                  size="x-small"
                  >{{ $t(SupportCategory[support.category].name) }}
                </v-chip>
              </div>
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-list-item-action end>
                <v-icon
                  v-if="support.closed"
                  :title="'Closed at ' + getLocalTimeString(support.closed_at)"
                  >done_all
                </v-icon>
                <v-icon
                  v-else-if="!getLastMessage(support).officer"
                  class="blink-me"
                  color="blue"
                  size="small"
                  title="Waiting.."
                  >fiber_manual_record
                </v-icon>

                <v-icon
                  v-if="!support.closed && getLastMessage(support).officer"
                  color="green"
                  title="Answered"
                  >add_comment
                </v-icon>
              </v-list-item-action>
            </template>
          </v-list-item>
        </v-list>

        <div class="widget-buttons">
          <v-btn
            color="primary"
            size="x-large"
            variant="text"
            @click="showSupport(null)"
          >
            <v-icon start>add</v-icon>
            {{ $t("support.request") }}
          </v-btn>
        </div>

        <div class="widget-buttons">
          <v-btn
            :to="{ name: 'CommunityHomePage' }"
            color="primary"
            exact
            size="x-large"
          >
            <v-icon color="amber" start>star_rate</v-icon>

            {{ $t("global.commons.community_ask") }}
            <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
          </v-btn>
        </div>
      </v-sheet>
    </v-menu>

    <!--- ======= Support Dialog ======= --->

    <v-dialog
      v-model="show_support"
      :fullscreen="$vuetify.display.mdAndDown"
      :max-width="860"
      content-class="no-shadow-dialog"
      scrollable
    >
      <v-card
        :style="$vuetify.display.mdAndDown ? '' : 'border-radius: 40px;'"
        class="dialog-shadow"
        color="#fafafa"
        min-height="80vh"
      >
        <v-card-title class="text-uppercase d-flex align-center">
          <v-icon class="me-2">fa:fas fa-headset</v-icon>
          {{ $t("support.title") }}
          <v-spacer></v-spacer>

          <v-btn class="m-1" icon variant="text" @click="show_support = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <!--- --------------- New mode --------------- --->

        <v-card-text v-if="!selected_support" class="text-start">
          <p v-html="$t('support.message')"></p>

          <v-scroll-y-transition group>
            <div v-for="faq in faqs" :key="faq.id" class="faq-item">
              <p class="font-weight-bold">{{ faq.question }}</p>
              <p>{{ faq.answer }}</p>
              <v-btn
                v-if="faq.link"
                :href="faq.link"
                class="m-1"
                color="blue"
                size="small"
                target="_blank"
                variant="flat"
              >
                {{ $t("global.faq.read_more") }}
              </v-btn>
            </div>
          </v-scroll-y-transition>

          <!--- --------------- Select category --------------- --->

          <u-smart-select
            v-model="support_category"
            :items="Object.values(SupportCategory)"
            :label="$t('support.category')"
            item-description="description"
            item-text="name"
            item-value="code"
          >
          </u-smart-select>

          <!--- --------------- Advisory > Options --------------- --->

          <v-expand-transition>
            <u-smart-select
              v-if="SupportCategory.Advisor.code === support_category"
              v-model="advisory_select"
              :items="advisory_choices"
              item-description="description"
              item-text="title"
              item-value="value"
              label="Have Twitter?"
            >
            </u-smart-select>
          </v-expand-transition>

          <!--- --------------- Advisory > Options > Twitter/Community --------------- --->

          <v-fade-transition>
            <div
              v-if="
                SupportCategory.Advisor.code === support_category &&
                advisory_select
              "
              class="widget-buttons py-5"
            >
              <v-btn
                v-if="advisory_select === 'twitter'"
                color="primary"
                href="https://twitter.com/intent/tweet?text=@SelldoneInc"
                size="x-large"
                target="_blank"
              >
                <img
                  class="me-1"
                  height="24"
                  src="../../../assets/trademark/twitter.svg"
                  width="24"
                />
                Tweet @SelldoneInc
              </v-btn>

              <v-btn
                v-else
                :to="{ name: 'CommunityHomePage' }"
                color="primary"
                size="x-large"
                target="_blank"
              >
                <img
                  class="me-1"
                  height="24"
                  src="../../../assets/icons/community.png"
                  width="24"
                />
                Ask on community
              </v-btn>
            </div>
          </v-fade-transition>
        </v-card-text>
        <!--- --------------- Chat mode --------------- --->
        <v-card-text v-else class="text-start position-relative thin-scroll">
          <v-slide-y-transition group leave-absolute>
            <div
              v-for="(item, index) in selected_support.messages"
              :key="index"
              class="my-2"
            >
              <div class="d-flex">
                <v-avatar
                  :class="{ 'avatar-officer': item.officer }"
                  class="flex-grow-0 me-2"
                >
                  <img :src="getUserAvatar(item.user_id)" />
                </v-avatar>
                <div class="flex-grow-1 pt-3">
                  <b>{{ item.user }}</b>

                  <div
                    :class="{ '-officer': item.officer }"
                    class="message-box"
                  >
                    <p>{{ item.message }}</p>

                    <v-btn
                      v-if="item.link"
                      :href="item.link"
                      class="my-2"
                      color="success"
                      rounded
                      size="small"
                      target="_blank"
                      variant="flat"
                    >
                      <v-icon class="me-1" size="small">link</v-icon>
                      {{ $t("global.actions.click_here") }}
                    </v-btn>
                    <small v-if="item.date" class="text-end d-block">
                      <v-icon size="small">done</v-icon>
                      {{ getLocalTimeStringSmall(item.date) }}</small
                    >
                  </div>
                </div>
              </div>

              <!--- --------------- AI Response --------------- --->
              <div
                v-if="
                  index === 0 &&
                  (selected_support.blog_id || selected_support.help_id)
                "
              >
                <div class="d-flex align-items-center">
                  <v-avatar class="flex-grow-0 me-2 avatar-ai">
                    <img
                      class="p-2"
                      src="../../../assets/icons/magical-hat.svg"
                    />
                  </v-avatar>

                  <b class="flex-grow-1">AI</b>
                </div>

                <div>
                  <v-slide-x-reverse-transition
                    class="m-0 align-stretch justify-center"
                    group
                    tag="v-row"
                  >
                    <v-col key="blog" sm="6">
                      <selldone-blog-card
                        v-if="selected_support.blog_id"
                        :blog-id="selected_support.blog_id"
                        auto-fetch
                        class="m-2"
                        max-width="320"
                        small
                        target="_blank"
                      >
                      </selldone-blog-card>
                    </v-col>
                    <v-col key="help" sm="6">
                      <selldone-help-card
                        v-if="selected_support.help_id"
                        :help-id="selected_support.help_id"
                        auto-fetch
                        class="m-2"
                        max-width="320"
                        small
                        target="_blank"
                      >
                      </selldone-help-card>
                    </v-col>
                  </v-slide-x-reverse-transition>
                </div>
              </div>
            </div>
          </v-slide-y-transition>

          <v-btn
            v-if="!selected_support.closed"
            :loading="busy_close_ticket"
            class="my-1"
            color="primary"
            variant="text"
            @click="closeTicket()"
          >
            <v-icon class="me-2" size="small">check</v-icon>
            {{ $t("support.close_ticket_by_user") }}
          </v-btn>
          <p v-else class="font-weight-bold">
            {{
              $t("support.close_at", {
                date: getLocalTimeStringSmall(selected_support.closed_at),
              })
            }}
          </p>

          <u-rating-emoji
            v-model="selected_support.rate"
            :loading="busy_rate"
            class="rating-box"
            @update:model-value="(val) => sendRate(val)"
          ></u-rating-emoji>
        </v-card-text>
        <!--- --------------- Actions --------------- --->

        <v-card-actions
          v-if="
            selected_support ||
            [
              SupportCategory.Financial.code,
              SupportCategory.Technical.code,
            ].includes(support_category)
          "
          class="d-block"
        >
          <v-textarea
            v-if="!selected_support || !selected_support.closed"
            v-model="support_message"
            :reverse="$vuetify.locale.isRtl"
            :rows="1"
            :rules="[GlobalRules.counter(1024)]"
            auto-grow
            class="mx-2"
            clearable
            placeholder="Type your message..."
            rounded
            variant="solo-filled"
          >
            <template v-slot:append-inner>
              <v-btn
                :class="{
                  disabled:
                    !support_message ||
                    (!selected_support && !support_category),
                }"
                :loading="busy_support"
                class="mx-1 tnt"
                color="primary"
                rounded
                variant="flat"
                @click="selected_support ? sendResponse() : sendSupport()"
                >{{ $t("global.actions.send") }}
                <v-icon class="ms-2">send</v-icon>
              </v-btn>
            </template>
          </v-textarea>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-list-item>
</template>

<script lang="ts">
import { SupportCategory } from "@selldone/core-js/enums/support/SupportCategory";
import URatingEmoji from "../../../ui/rating/emoji/URatingEmoji.vue";
import USmartSelect from "../../../ui/smart/select/USmartSelect.vue";
import { throttle } from "lodash-es";
import SelldoneHelpCard from "../help-card/SelldoneHelpCard.vue";
import SelldoneBlogCard from "../blog-card/SelldoneBlogCard.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

//―――――――――――――――――――――― Scrollbar Styler ――――――――――――――――――――

export default {
  name: "BSupportMenu",
  mixins: [DateMixin],

  components: {
    USmartSelect,
    SelldoneHelpCard,
    SelldoneBlogCard,
    URatingEmoji,
  },
  data: () => ({
    show_support: false,
    selected_support: null,

    busy_rate: false,

    support_category: null,
    support_message: null,
    busy_support: false,

    busy_close_ticket: false,

    SupportCategory: SupportCategory,

    //--------------
    busy_fetch: false,
    faqs: [],

    //--------------
    advisory_select: null,
    advisory_choices: [
      {
        value: "twitter",
        title: "Yes, I have twitter account.",
        description:
          "Tweet your idea, problem, and requests so that the members of the selldone teams can see your statement at any time and in any place, and also other folks can comment on your proposal and rate it.",
      },
      {
        value: "community",
        title: "No, I'm so old to have Twitter.",
        description:
          "Send your request to the community and hope someone answers it.",
      },
    ],
  }),
  computed: {
    shop() {
      return this.$route.params.shop_id
        ? this.$store.getters.getCurrentAdminShop
        : null;
    },

    supports() {
      if (!this.shop) return [];
      return this.shop.supports;
    },
  },
  watch: {
    support_message: throttle(function (newVal, oldVal) {
      if (this.selected_support) return; // Only in new ticket!
      this.fetchFAQData(newVal);
    }, 1000),
  },

  created() {},
  methods: {
    fetchFAQData(search) {
      if (!search || search.length < 5) {
        // this.faqs=[];
        return;
      }
      this.busy_fetch = true;
      this.faqs = [];
      axios
        .get(window.GAPI.GET_FAQS(), {
          params: {
            offset: 0,
            limit: 6,
            search: search,
          },
        })
        .then(({ data }) => {
          this.faqs = data.faqs;
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    sendSupport() {
      this.busy_support = true;
      axios
        .post(window.API.POST_SUPPORT(this.$route.params.shop_id), {
          category: this.support_category,
          url: window.location.href,
          message: this.support_message,
        })
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              "Support",
              "We received your request successfully.",
            );
            this.AddOrUpdateItemByID(
              this.shop.supports,
              data.support,
              "id",
              false,
            );
            this.show_support = false;
            this.support_message = null;

            if (data.support.blog_id || data.support.help_id) {
              // Keep showing if return suggested blog or help!
              this.showSupport(data.support);
            }
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => NotificationService.showLaravelError(e))
        .finally(() => {
          this.busy_support = false;
        });
    },
    sendResponse() {
      this.busy_support = true;
      axios
        .put(
          window.API.PUT_SUPPORT_RESPONSE(
            this.$route.params.shop_id,
            this.selected_support.id,
          ),
          {
            message: this.support_message,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              "Send message",
              "Your message sent successfully.",
            );
            this.AddOrUpdateItemByID(this.shop.supports, data.support);
            this.selected_support = data.support;
            this.support_message = null;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => NotificationService.showLaravelError(e))
        .finally(() => {
          this.busy_support = false;
        });
    },
    closeTicket() {
      NotificationService.openConfirmationAlert(
        "Close ticket",
        "Are you sure to close this support ticket?",
        "Yes, Close Now",
        () => {
          this.busy_close_ticket = true;
          axios
            .put(
              window.API.PUT_SUPPORT_CLOSE(
                this.$route.params.shop_id,
                this.selected_support.id,
              ),
            )
            .then(({ data }) => {
              if (!data.error) {
                NotificationService.showSuccessAlert(
                  null,
                  "Your support ticket has been closed.",
                );
                this.AddOrUpdateItemByID(this.shop.supports, data.support);
                this.show_support = false;
                this.support_message = null;
              } else {
                NotificationService.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((e) => NotificationService.showLaravelError(e))
            .finally(() => {
              this.busy_close_ticket = false;
            });
        },
      );
    },

    sendRate(rate) {
      this.busy_rate = true;
      axios
        .put(
          window.API.PUT_SUPPORT_RATE(
            this.$route.params.shop_id,
            this.selected_support.id,
          ),
          {
            rate: rate,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "Thanks, Your rate has been saved.",
            );
            this.AddOrUpdateItemByID(this.shop.supports, data.support);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => NotificationService.showLaravelError(e))
        .finally(() => {
          this.busy_rate = false;
        });
    },

    getLastMessage(support) {
      return support.messages[support.messages.length - 1];
    },

    showSupport(support) {
      this.faqs = [];
      this.support_message = null;
      this.support_category = null;

      this.show_support = true;
      this.selected_support = support;
    },
  },
};
</script>
<style lang="scss" scoped>
.faq-item {
  padding: 8px 12px;
  border-bottom: dashed #aaa thin;
  margin: 8px 0;
  font-size: 1.1rem;
  line-height: normal;
  color: #222;

  p {
    margin: 0;
  }
}

.avatar-officer {
  border: solid #1976d2 3px;
}

.avatar-ai {
  border: solid #cf92ff 3px;
}

.message-box {
  margin: 8px 0;
  max-width: 480px;
  border-radius: 18px;
  padding: 16px 24px 4px 24px;
  background-color: #fff;
  color: #000;
  font-size: 1.1rem;
  line-height: 1.7rem;
  font-weight: 400;
  white-space: pre-line;

  p {
    margin: 0;
  }

  &.-officer {
    background-color: #3d4e81;
    //   background-image: linear-gradient(-225deg, #3D4E81 0%, #5753C9 48%, #6E7FF3 100%);
    color: #fff;

    small {
      color: #fff !important;
    }

    .v-icon {
      color: #fff !important;
    }
  }
}

.rating-box {
  @media only screen and (max-width: 860px) {
    position: relative !important;
  }
}

.title-msg {
  overflow: hidden !important;
  font-size: 0.9em;
  font-weight: 500;
}
</style>
