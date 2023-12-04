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
  <div>
    <s-progress-loading
      v-if="busy || busy_delete"
      :color="busy_delete ? 'red' : undefined"
    ></s-progress-loading>
    <div class="widget-buttons">
      <v-btn
        @click="show_add = true"
        text
        large
        color="primary"
        :disabled="show_add"
      >
        <v-icon small class="me-2">fas fa-sticky-note</v-icon>
        {{ $t("global.commons.add_note") }}
      </v-btn>
    </div>

    <v-expand-transition>
      <div class="px-3 py-2" v-if="show_add">
        <s-mentionable-input
          :shop-id="shop.id"
          :label="$t('order_timeline.message_input')"
          v-model="message"
          auto-grow
          class="mb-2"
          :mentions.sync="mentions"
        ></s-mentionable-input>

        <v-expand-transition>
          <users-dense-images-circles
            v-if="mentions && mentions.users"
            :ids="mentions.users"
            :size="32"
          ></users-dense-images-circles>
        </v-expand-transition>

        <div class="widget-buttons">
          <v-btn @click="show_add = false" x-large text>
            <v-icon class="me-1">close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            x-large
            depressed
            color="primary"
            @click="addNewNote()"
            :loading="saving"
          >
            <v-icon class="me-1">add_box</v-icon> {{ $t("global.actions.add") }}
          </v-btn>
        </div>
      </div>
    </v-expand-transition>

    <v-fade-transition
      group
      tag="v-list"
      two-line
      hide-on-leave
      class="bg-transparent border-between-vertical fade-border-vertical"
    >
      <div
        v-for="(item, i) in timelines"
        :key="item.id"
        :class="{
          'bg-light': item.pin,
          '': !item.pin,
          disabled: busy_delete === item.id,
        }"
      >
        <v-fade-transition hide-on-leave>
          <div
            v-if="getTimelineStatus(item.type).editable && item.editing"
            class="px-3 py-2"
            key="x1"
          >
            <s-mentionable-input
              outlined
              auto-grow
              :label="$t('order_timeline.message_input')"
              v-model="item.data.message"
              class="mb-2"
            ></s-mentionable-input>

            <v-row no-gutters justify="end">
              <v-btn
                :loading="busy_edit === item"
                small
                depressed
                class="m-1"
                color="primary"
                @click="editNote(item)"
              >
                <v-icon class="me-1" small>save</v-icon>
                {{ $t("global.actions.save") }}
              </v-btn>
              <v-btn small outlined class="m-1" @click="showEdit(item, false)">
                <v-icon class="me-1" small>close</v-icon>
                {{ $t("global.actions.cancel") }}
              </v-btn>
            </v-row>
          </div>

          <v-list-item
            v-else
            key="x2"
            :class="{ 'row-hover': isEmail(item) }"
            @click.stop="isEmail(item) ? clickItem(item) : undefined"
            two-line
            class="fadeInUp"
            :style="{
              'animation-delay': 100 + i * 50 + 'ms',
              cursor: isEmail(item) ? undefined : 'initial',
            }"
          >
            <v-list-item-icon class="me-3">
              <v-avatar
                size="42"
                :color="
                  item.pin ? '#607D8B' : getTimelineStatus(item.type).color
                "
                :class="!item.pin && getTimelineStatus(item.type).iclass"
                class="zoomIn p-1"
                :style="{ 'animation-delay': 350 + i * 50 + 'ms' }"
              >
                <!-- 1. Custom image url -->
                <img
                  v-if="item.data && item.data.image"
                  :src="item.data.image"
                />
                <!-- 2. Icon -->
                <v-icon
                  v-else
                  class="h-100 bg-white"
                  small
                  v-text="
                    item.pin
                      ? 'fas fa-thumbtack'
                      : getTimelineStatus(item.type).icon
                  "
                ></v-icon>
              </v-avatar>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title
                class="text-wrap mb-2 html-style overflow-visible"
                v-html="
                  item.type === 'note'
                    ? smartBeautify(compileMarkdown(item.data.message))
                    : smartBeautify(
                        $t(getTimelineStatus(item.type).text, item.data)
                      )
                "
              ></v-list-item-title>

              <!-- ---------------------- Payment object (in data) ----------------- -->

              <v-list-item-subtitle
                v-if="item.data.payment && isObject(item.data.payment)"
              >
                <price-view
                  :amount="item.data.payment.amount"
                  :currency="item.data.payment.currency"
                ></price-view>

                <v-icon class="mx-2">trending_flat</v-icon>
                <span class="subtitle-2">{{ item.data.payment.message }}</span>
              </v-list-item-subtitle>

              <v-list-item-subtitle
                class="overflow-visible"
                style="display: contents"
              >
                <div class="d-flex align-center py-1">
                  <span class="d-none d-sm-inline-block">{{
                    getLocalTimeString(item.created_at)
                  }}</span>
                  <span class="mx-2 font-weight-bold">{{
                    getFromNowString(item.created_at)
                  }}</span>
                  <v-spacer></v-spacer>

                  <span v-if="item.by" class="">
                    <v-avatar size="18" class="mx-1 hover-scale">
                      <v-img :src="getUserAvatar(item.by.id)" />
                    </v-avatar>
                    {{ item.by.name }}
                  </span>
                </div>

                <span class="flex-grow-1">
                  <!-- ---------------------- Delivery person / service Icon ----------------- -->
                  <img
                    v-if="
                      item.data &&
                      (item.data.delivery_user_id || item.data.delivery_user_id)
                    "
                    src="../../assets/icons/wire.svg"
                    width="16"
                    height="16"
                    class="mx-2"
                  />
                  <v-avatar
                    v-if="item.data && item.data.delivery_service_id"
                    size="18"
                    class="mx-1 hover-scale"
                    tile
                  >
                    <v-img
                      :src="
                        getDeliveryServiceIcon(item.data.delivery_service_id)
                      "
                    />
                  </v-avatar>

                  <v-avatar
                    v-if="item.data && item.data.delivery_user_id"
                    size="18"
                    class="mx-1 hover-scale"
                  >
                    <v-img :src="getUserAvatar(item.data.delivery_user_id)" />
                  </v-avatar>
                  <!------------------------------------------------------------------------------->

                  <!-- ---------------------- Item ----------------- -->
                  <div
                    v-if="item.data && item.data.old && item.data.new"
                    class="mt-2 pt-2 border-top-dashed"
                  >
                    <div>
                      <v-icon small color="red">close</v-icon>
                      <small>{{ $t("global.commons.old") }}:</small>
                      <b>{{ generateFullAddress(item.data.old) }}</b>
                      <geo-navigation-button
                        v-if="item.data.old && item.data.old.location"
                        :location="item.data.old.location"
                        :icon="true"
                        class="ms-1"
                        small
                      ></geo-navigation-button>
                    </div>
                    <div class="mt-2">
                      <v-icon small color="green">check</v-icon>
                      <small>{{ $t("global.commons.new") }}:</small>
                      <b>{{ generateFullAddress(item.data.new) }}</b>
                      <geo-navigation-button
                        v-if="item.data.new && item.data.new.location"
                        :location="item.data.new.location"
                        :icon="true"
                        class="ms-1"
                        small
                      ></geo-navigation-button>
                    </div>
                  </div>
                </span>
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action style="min-width: 36px">
              <s-smart-menu
                v-if="getTimelineStatus(item.type).editable"
                icon="more_horiz"
                :items="[
                  {
                    icon: 'push_pin',
                    title: item.pin
                      ? $t('order_timeline.unpin_action')
                      : $t('order_timeline.pin_action'),
                    click: () => togglePinItem(item),
                  },
                  {
                    icon: 'edit_note',
                    title: $t('global.actions.edit'),
                    click: () => showEdit(item, true),
                  },

                  {
                    icon: 'delete_outline',
                    title: $t('global.actions.delete'),
                    click: () => showDeleteNoteDialog(item),
                  },
                ]"
              >
              </s-smart-menu>

              <v-btn
                v-if="
                  isEmail(item) && (item.data.can_resend || item.data.resend)
                "
                :class="{ disabled: !!item.data.resend }"
                depressed
                color="primary"
                dark
                @click.stop="resendEmail(item)"
                :loading="busy_resend === item.id"
                class="m-1"
                small
              >
                <v-icon class="me-1" small>send</v-icon>
                {{
                  item.data.resend
                    ? getLocalTimeStringSmall(item.data.resend)
                    : "Resend"
                }}</v-btn
              >

              <!-- Connect -->
              <v-img
                v-if="item.data && item.data.connect_id"
                :src="getConnectIcon(item.data.connect_id)"
                width="24"
                height="24"
                class="m-1"
              ></v-img>
            </v-list-item-action>
          </v-list-item>
        </v-fade-transition>
      </div>
    </v-fade-transition>

    <!-- ----------------------- Email Preview Dialog ----------------------------- -->

    <v-dialog
      v-model="show_email"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title>
          <v-icon class="me-2">fas fa-envelope</v-icon>
          <span v-html="email_title"></span>
        </v-card-title>

        <s-loading css-mode v-if="busy_email" light></s-loading>
        <v-card-text>
          <div
            v-html="email_html"
            class="widget-box -large mb-5 min-height-60vh"
          ></div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn text @click="show_email = false" x-large>
              <v-icon class="me-1">close</v-icon>
              {{ $t("global.actions.close") }}</v-btn
            >

            <v-btn text @click="copyToClipboard(email_html)" x-large>
              <v-icon class="me-1">fab fa-html5</v-icon>
              {{ $t("order_timeline.copy_html") }}</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import SMentionableInput from "@components/ui/text/SMentionableInput.vue";
import UsersDenseImagesCircles from "@components/user/UsersDenseImagesCircles.vue";
import { ShopTransportations } from "@core/enums/logistic/ShopTransportations";
import { Reactions } from "@core/enums/support/Reactions";
import { Brands } from "@core/enums/social/Brands";
import { CampaignMedium } from "@core/enums/campaign/CampaignMedium";
import { CustomerClubLevels } from "@core/enums/customer/CustomerClubLevels";
import GeoNavigationButton from "@components/map/GeoNavigationButton.vue";
import TimelineStatus from "@core/enums/timeline/TimelineStatus";
import SSmartMenu from "@components/smart/SSmartMenu.vue";
import {TimelineEmailType} from "@core/enums/timeline/TimelineEmailType";

export default {
  name: "SBackofficeOrderTimeline",
  components: {
    SSmartMenu,
    GeoNavigationButton,
    UsersDenseImagesCircles,
    SMentionableInput,
  },
  props: {
    shop: {
      require: true,
      type: Object,
    },
    order: {
      require: true,
      type: Object,
    },
    isPhysical: {
      require: false,
      type: Boolean,
      default: false,
    },
    isVirtual: {
      require: false,
      type: Boolean,
      default: false,
    },
    isFile: {
      require: false,
      type: Boolean,
      default: false,
    },
    isService: {
      require: false,
      type: Boolean,
      default: false,
    },
    isPos: {
      require: false,
      type: Boolean,
      default: false,
    },
    isDropShopping: {
      require: false,
      type: Boolean,
      default: false,
    },
    isAvocado: {
      type: Boolean,
      default: false,
    },
    isHyper: {
      type: Boolean,
      default: false,
    },

    vendor: {
      /*🟢 Vendor Panel 🟢*/ require: false,
      type: Object,
    },
  },
  data: function () {
    return {
      show_add: false,
      message: "",
      saving: false,
      busy_edit: null,

      timelines: [],

      mentions: {},

      busy_resend: null,
      // Email view:
      show_email: false,
      busy_email: true,
      email_html: null,
      email_title: null,

      busy: false,
      busy_delete: false,
    };
  },
  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    base_url() {
      if (this.IS_VENDOR_PANEL) {
        /*🟢 Vendor Panel 🟢*/
        return this.isPhysical
          ? window.VAPI.GET_VENDOR_ORDER_TIMELINE(
              this.vendor.id,
              "physical",
              this.order.id // Vendor order ID
            )
          : this.isVirtual
          ? window.VAPI.GET_VENDOR_ORDER_TIMELINE(
              this.vendor.id,
              "virtual",
              this.order.id // Vendor order ID
            )
          : this.isFile
          ? window.VAPI.GET_VENDOR_ORDER_TIMELINE(
              this.vendor.id,
              "file",
              this.order.id // Vendor order ID
            )
          : this.isService
          ? window.VAPI.GET_VENDOR_ORDER_TIMELINE(
              this.vendor.id,
              "service",
              this.order.id // Vendor order ID
            )
          : null;
      }

      return this.isPhysical
        ? window.API.GET_ORDER_TIMELINE(this.shop.id, "physical", this.order.id)
        : this.isVirtual
        ? window.API.GET_ORDER_TIMELINE(this.shop.id, "virtual", this.order.id)
        : this.isFile
        ? window.API.GET_ORDER_TIMELINE(this.shop.id, "file", this.order.id)
        : this.isService
        ? window.API.GET_ORDER_TIMELINE(this.shop.id, "service", this.order.id)
        : this.isPos
        ? window.API.GET_ORDER_TIMELINE(this.shop.id, "pos", this.order.id)
        : this.isDropShopping
        ? window.API.GET_ORDER_TIMELINE(
            this.shop.id,
            "dropshipping",
            this.order.id
          )
        : this.isAvocado
        ? window.API.GET_ORDER_TIMELINE(this.shop.id, "avocado", this.order.id)
        : this.isHyper
        ? window.API.GET_ORDER_TIMELINE(this.shop.id, "hyper", this.order.id)
        : null;
    },
  },

  watch: {},
  created() {
    this.fetchTimeline();
  },
  mounted() {},
  destroyed() {},
  methods: {
    //------------------------------------- Emails -------------------------------------

    isEmail(item) {
      return item.type.startsWith("email-"); // Can click emails to show preview
    },

    clickItem(item) {
      if (
        item.type === TimelineEmailType.EMAIL_BUY ||
        item.type === TimelineEmailType.EMAIL_PAYMENT ||
        item.type === TimelineEmailType.EMAIL_VENDOR
      ) {
        this.showEmailView(item);
      }
    },

    showEmailView(item) {
      if (this.IS_VENDOR_PANEL) {
        /*🟢 Vendor Panel 🟢*/
        this.showWarningAlert(null, "Not supported for vendor!");
        return;
      }

      this.show_email = true;
      this.busy_email = true;
      this.email_html = null;
      this.email_title = this.$t(`timeline.${item.type}`, item.data);

      axios
        .get(
          window.API.GET_ORDER_EMAIL_PREVIEW(
            this.shop.id,
            this.order.id,
            item.type
          ),
          {
            params: {
              timeline_id: item.id, // Needs for vendor order email preview. An order can multiple vendor orders.
            },
          }
        )
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null, data.error_msg);
          }

          this.email_html = data;
        })
        .catch((error) => {
          this.showLaravelError(error);
          this.show_email = false;
        })
        .finally(() => {
          this.busy_email = false;
        });
    },

    resendEmail(item) {
      if (this.IS_VENDOR_PANEL) {
        /*🟢 Vendor Panel 🟢*/
        this.showWarningAlert(null, "Not supported for vendor!");
        return;
      }
      this.openDangerAlert(
        this.$t("order_timeline.resend_dialog.title"),
        this.$t("order_timeline.resend_dialog.message"),
        this.$t("order_timeline.resend_dialog.action"),
        () => {
          this.busy_resend = item.id;

          axios
            .post(window.API.POST_ORDER_RESEND_EMAIL(this.shop.id, item.id))
            .then(({ data }) => {
              if (!data.error) {
                this.showSuccessAlert(
                  null,
                  this.$t("order_timeline.resend_dialog.success")
                );
                this.AddOrUpdateItemByID(this.timelines, data.timeline);
              } else {
                this.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
            })
            .finally(() => {
              this.busy_resend = null;
            });
        }
      );
    },

    //-----------------------------------------------------------------------------------------

    noMatchFound() {
      console.log("No matches found!");
    },
    append() {
      let kv = Math.random().toString(36).slice(2);
      this.options.values.push({
        key: kv,
        value: kv,
      });
    },

    showEdit(item, show) {
      item.editing = show;
      this.resortItems();
    },

    fetchTimeline() {
      this.busy = true;

      axios
        .get(this.base_url)
        .then(({ data }) => {
          this.timelines = data.timelines;
          this.resortItems();
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    addNewNote() {
      if (this.saving) return;
      this.saving = true;
      axios
        .post(this.base_url, {
          message: this.message,
          mentions: this.mentions,
        })
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null, data.error_msg);
          }

          this.AddOrUpdateItemByID(this.timelines, data.timeline, "id", false);
          this.resortItems();
          this.showSuccessAlert(
            null,
            this.$t("order_timeline.notifications.add_note_success")
          );
          this.message = "";
          this.show_add = false;
          this.mentions = {};
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.saving = false;
        });
    },
    editNote(timeline) {
      this.busy_edit = timeline;

      axios
        .put(`${this.base_url}/${timeline.id}`, {
          message: timeline.data.message,
          pin: timeline.pin,
        })
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null, data.error_msg);
          }

          this.AddOrUpdateItemByID(this.timelines, data.timeline);
          this.resortItems();
          this.showSuccessAlert(
            null,
            this.$t("order_timeline.notifications.edit_note_success")
          );
          timeline.editing = false;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_edit = null;
        });
    },
    deleteNote(timeline) {
      this.busy_delete = timeline.id;

      axios
        .delete(`${this.base_url}/${timeline.id}`)
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null, data.error_msg);
          }

          this.DeleteItemByID(this.timelines, data.id);
          this.resortItems();
          this.showSuccessAlert(
            null,
            this.$t("order_timeline.notifications.delete_note_success")
          );
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = null;
        });
    },

    showDeleteNoteDialog(timeline) {
      this.openDangerAlert(
        this.$t("order_timeline.delete_dialog.title"),
        this.$t("order_timeline.delete_dialog.message"),
        this.$t("order_timeline.delete_dialog.action"),
        () => {
          this.deleteNote(timeline);
        }
      );
    },

    getTimelineStatus(code) {
      return TimelineStatus[code] ? TimelineStatus[code] : {};
    },

    togglePinItem(item) {
      item.pin = !item.pin;
      this.editNote(item);
    },

    resortItems() {
      let pins = [];
      let unpins = [];

      this.timelines.forEach((item) => {
        if (item.pin) pins.push(item);
        else unpins.push(item);
      });

      this.timelines = pins.concat(unpins);
    },

    compileMarkdown(message) {
      // eslint-disable-next-line no-useless-escape
      let regexItalic = /\_\_(\S(.*?\S)?)\_\_/gm;
      let regexBold = /\*\*(\S(.*?\S)?)\*\*/gm;
      message = message.replace(regexBold, "<strong>$1</strong>");
      message = message.replace(regexItalic, "<i>$1</i>");

      return message;
    },

    smartBeautify(html) {
      let out = html;

      const repos = [
        ShopTransportations,
        Reactions,
        Brands,
        CampaignMedium,
        CustomerClubLevels,
      ];

      repos.forEach((obj) => {
        const list = Array.isArray(obj) ? obj : Object.values(obj);
        list.forEach((it) => {
          if (it.code)
            out = out.replace(
              " " + it.code + " ",
              `<img width="16" height="16" src="${it.icon}" title="${this.$t(
                it.name
              )}">`
            );
          else
            out = out.replace(
              " " + it.name + " ",
              `<img width="16" height="16" src="${it.icon}" title="${this.$t(
                it.name
              )}">`
            );
        });
      });

      // Replace connect OS:
      out = out.replace(
        " Connect OS",
        ` <b>Connect</b> <span class="text-gradient bg-desert-hump">OS</span>`
      );

      return out;
    },
  },
};
</script>

<style scoped lang="scss"></style>
