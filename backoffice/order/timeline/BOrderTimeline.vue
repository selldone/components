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
  <div v-bind="$attrs">
    <u-loading-progress
      v-if="busy || busy_delete"
      :color="busy_delete ? 'red' : undefined"
    ></u-loading-progress>
    <div class="widget-buttons">
      <v-btn
        :disabled="show_add"
        color="primary"
        size="x-large"
        variant="text"
        @click="show_add = true"
      >
        <v-icon start>fa:fas fa-sticky-note</v-icon>
        <div>
          {{ $t("global.commons.add_note") }}
          <div class="small mt-1">
            {{ $t("order_timeline.add_note_subtitle") }}
          </div>
        </div>
      </v-btn>
    </div>

    <v-expand-transition>
      <div v-if="show_add" class="px-3 py-2">
        <u-text-mention-input
          v-model="message"
          v-model:mentions="mentions"
          :label="$t('order_timeline.message_input')"
          :shop-id="shop.id"
          auto-grow
          class="mb-2"
        ></u-text-mention-input>

        <v-expand-transition>
          <u-dense-circles-users
            v-if="mentions && mentions.users"
            :ids="mentions.users"
            :size="32"
          ></u-dense-circles-users>
        </v-expand-transition>

        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="show_add = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            :loading="saving"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="addNewNote()"
          >
            <v-icon class="me-1">add_box</v-icon>
            {{ $t("global.actions.add") }}
          </v-btn>
        </div>
      </div>
    </v-expand-transition>
    <v-fade-transition
      class="bg-transparent"
      group
      hide-on-leave
      tag="v-list"
      two-line
    >
      <template v-for="(item, i) in timelines" :key="item.id">
        <div
          :class="{
            'bg-light': item.pin,
            '': !item.pin,
            disabled: busy_delete === item.id,
          }"
        >
          <v-fade-transition hide-on-leave>
            <div
              v-if="getTimelineStatus(item.type).editable && item.editing"
              key="x1"
              class="px-3 py-2"
            >
              <u-text-mention-input
                v-model="item.data.message"
                :label="$t('order_timeline.message_input')"
                auto-grow
                class="mb-2"
                outlined
              ></u-text-mention-input>

              <v-row justify="end" no-gutters>
                <v-btn
                  :loading="busy_edit === item"
                  class="m-1"
                  color="primary"
                  size="small"
                  variant="flat"
                  @click="editNote(item)"
                >
                  <v-icon class="me-1" size="small">save</v-icon>
                  {{ $t("global.actions.save") }}
                </v-btn>
                <v-btn
                  class="m-1"
                  size="small"
                  variant="outlined"
                  @click="showEdit(item, false)"
                >
                  <v-icon class="me-1" size="small">close</v-icon>
                  {{ $t("global.actions.cancel") }}
                </v-btn>
              </v-row>
            </div>

            <v-list-item
              v-else
              key="x2"
              :class="{ 'row-hover': isEmail(item) }"
              :style="{
                'animation-delay': 100 + i * 50 + 'ms',
                cursor: isEmail(item) ? undefined : 'initial',
              }"
              class="fadeInUp -timeline-list-item"
              lines="two"
              @click.stop="isEmail(item) ? clickItem(item) : undefined"
            >
              <template v-slot:prepend>
                <v-avatar
                  :class="!item.pin && getTimelineStatus(item.type).iclass"
                  :color="
                    item.pin ? '#607D8B' : getTimelineStatus(item.type).color
                  "
                  :style="{ 'animation-delay': 350 + i * 50 + 'ms' }"
                  class="zoomIn p-1"
                  size="42"
                >
                  <v-avatar color="#fff" size="36">
                    <!-- 1. Custom image url -->
                    <v-img
                      v-if="item.data && item.data.image"
                      :src="item.data.image"
                      cover
                    />
                    <!-- 2. Icon -->
                    <v-icon v-else size="small">
                      {{
                        item.pin
                          ? "fa:fas fa-thumbtack"
                          : getTimelineStatus(item.type).icon
                      }}
                    </v-icon>
                  </v-avatar>
                </v-avatar>
              </template>

              <template v-slot:title>
                <v-list-item-title
                  class="text-wrap mb-2 html-style overflow-visible"
                  v-html="
                    item.type === 'note'
                      ? smartBeautify(compileMarkdown(item.data.message))
                      : smartBeautify(
                          $t(getTimelineStatus(item.type).text, item.data),
                        )
                  "
                ></v-list-item-title>
              </template>

              <!-- ---------------------- Payment object (in data) ----------------- -->

              <v-list-item-subtitle
                v-if="item.data.payment && isObject(item.data.payment)"
              >
                <u-price
                  :amount="item.data.payment.amount"
                  :currency="item.data.payment.currency"
                ></u-price>

                <v-icon class="mx-2">trending_flat</v-icon>
                <span class="text-subtitle-2">{{
                  item.data.payment.message
                }}</span>
              </v-list-item-subtitle>

              <v-list-item-subtitle
                class="text-muted"
                style="display: contents"
              >
                <div class="d-flex align-center py-1">
                  <v-chip
                    v-if="item.by"
                    class="overflow-visible me-2"
                    color="#fff"
                    size="small"
                    variant="flat"
                  >
                    <v-avatar class="hover-scale" start>
                      <v-img :src="getUserAvatar(item.by.id)" />
                    </v-avatar>
                    {{ item.by.name }}
                  </v-chip>

                  <span class="d-none d-sm-inline-block">{{
                    getLocalTimeString(item.created_at)
                  }}</span>
                  <span class="mx-2 font-weight-bold">{{
                    getFromNowString(item.created_at)
                  }}</span>
                </div>

                <span class="flex-grow-1">
                  <!-- ---------------------- Delivery person / service Icon ----------------- -->
                  <img
                    v-if="
                      item.data &&
                      (item.data.delivery_user_id || item.data.delivery_user_id)
                    "
                    class="mx-2"
                    height="16"
                    src="../../../assets/icons/wire.svg"
                    width="16"
                  />
                  <v-avatar
                    v-if="item.data && item.data.delivery_service_id"
                    class="mx-1 hover-scale"
                    size="18"
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
                    class="mx-1 hover-scale"
                    size="18"
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
                      <v-icon color="red" size="small">close</v-icon>
                      <small>{{ $t("global.commons.old") }}:</small>
                      <b>{{ generateFullAddress(item.data.old) }}</b>
                      <u-map-geo-button
                        v-if="item.data.old && item.data.old.location"
                        :icon="true"
                        :location="item.data.old.location"
                        class="ms-1"
                        small
                      ></u-map-geo-button>
                    </div>
                    <div class="mt-2">
                      <v-icon color="green" size="small">check</v-icon>
                      <small>{{ $t("global.commons.new") }}:</small>
                      <b>{{ generateFullAddress(item.data.new) }}</b>
                      <u-map-geo-button
                        v-if="item.data.new && item.data.new.location"
                        :icon="true"
                        :location="item.data.new.location"
                        class="ms-1"
                        small
                      ></u-map-geo-button>
                    </div>
                  </div>
                </span>
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-list-item-action style="min-width: 36px">
                  <u-smart-menu
                    v-if="getTimelineStatus(item.type).editable"
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
                    icon="more_horiz"
                  >
                  </u-smart-menu>

                  <v-btn
                    v-if="
                      isEmail(item) &&
                      (item.data.can_resend || item.data.resend)
                    "
                    :class="{ disabled: !!item.data.resend }"
                    :loading="busy_resend === item.id"
                    class="m-1"
                    color="primary"
                    size="small"
                    variant="flat"
                    @click.stop="resendEmail(item)"
                  >
                    <v-icon start>send</v-icon>
                    {{
                      item.data.resend
                        ? getLocalTimeStringSmall(item.data.resend)
                        : $t("global.actions.resend")
                    }}
                  </v-btn>

                  <!-- Connect -->
                  <v-img
                    v-if="item.data && item.data.connect_id"
                    :src="getConnectIcon(item.data.connect_id)"
                    class="m-1"
                    height="24"
                    width="24"
                  ></v-img>
                </v-list-item-action>
              </template>
            </v-list-item>
          </v-fade-transition>
        </div>
        <hr
          v-if="i < timelines.length - 1"
          :style="{
            'animation-delay': 500 + i * 50 + 'ms',
            cursor: isEmail(item) ? undefined : 'initial',
          }"
          class="ma-0 fadeIn"
        />
      </template>
    </v-fade-transition>
  </div>

  <!-- ----------------------- Email Preview Dialog ----------------------------- -->

  <v-dialog
    v-model="show_email"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start">
      <v-card-title>
        <v-icon class="me-2">fa:fas fa-envelope</v-icon>
        <span v-html="email_title"></span>
      </v-card-title>

      <u-loading-ellipsis v-if="busy_email" css-mode light></u-loading-ellipsis>
      <v-card-text>
        <div
          class="widget-box -large mb-5 min-height-60vh"
          v-html="email_html"
        ></div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="show_email = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            size="x-large"
            variant="text"
            @click="copyToClipboard(email_html)"
          >
            <v-icon start>fa:fab fa-html5</v-icon>
            {{ $t("order_timeline.copy_html") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import UTextMentionInput from "../../../ui/text/mention-input/UTextMentionInput.vue";
import UDenseCirclesUsers from "../../../ui/dense-circles/users/UDenseCirclesUsers.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations.ts";
import { Reactions } from "@selldone/core-js/enums/support/Reactions.ts";
import { Brands } from "@selldone/core-js/enums/social/Brands.ts";
import { CustomerClubLevels } from "@selldone/core-js/enums/customer/CustomerClubLevels.ts";
import UMapGeoButton from "../../../ui/map/geo-button/UMapGeoButton.vue";
import TimelineStatus from "@selldone/core-js/enums/timeline/TimelineStatus.ts";
import USmartMenu from "../../../ui/smart/menu/USmartMenu.vue";
import { TimelineEmailType } from "@selldone/core-js/enums/timeline/TimelineEmailType.ts";
import { CampaignLink } from "@selldone/core-js";

export default {
  name: "BOrderTimeline",
  components: {
    USmartMenu,
    UMapGeoButton,
    UDenseCirclesUsers,
    UTextMentionInput,
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
              this.order.id, // Vendor order ID
            )
          : this.isVirtual
            ? window.VAPI.GET_VENDOR_ORDER_TIMELINE(
                this.vendor.id,
                "virtual",
                this.order.id, // Vendor order ID
              )
            : this.isFile
              ? window.VAPI.GET_VENDOR_ORDER_TIMELINE(
                  this.vendor.id,
                  "file",
                  this.order.id, // Vendor order ID
                )
              : this.isService
                ? window.VAPI.GET_VENDOR_ORDER_TIMELINE(
                    this.vendor.id,
                    "service",
                    this.order.id, // Vendor order ID
                  )
                : null;
      }

      return this.isPhysical
        ? window.API.GET_ORDER_TIMELINE(this.shop.id, "physical", this.order.id)
        : this.isVirtual
          ? window.API.GET_ORDER_TIMELINE(
              this.shop.id,
              "virtual",
              this.order.id,
            )
          : this.isFile
            ? window.API.GET_ORDER_TIMELINE(this.shop.id, "file", this.order.id)
            : this.isService
              ? window.API.GET_ORDER_TIMELINE(
                  this.shop.id,
                  "service",
                  this.order.id,
                )
              : this.isPos
                ? window.API.GET_ORDER_TIMELINE(
                    this.shop.id,
                    "pos",
                    this.order.id,
                  )
                : this.isDropShopping
                  ? window.API.GET_ORDER_TIMELINE(
                      this.shop.id,
                      "dropshipping",
                      this.order.id,
                    )
                  : this.isAvocado
                    ? window.API.GET_ORDER_TIMELINE(
                        this.shop.id,
                        "avocado",
                        this.order.id,
                      )
                    : this.isHyper
                      ? window.API.GET_ORDER_TIMELINE(
                          this.shop.id,
                          "hyper",
                          this.order.id,
                        )
                      : null;
    },
  },

  watch: {},
  created() {
    this.fetchTimeline();
  },
  mounted() {},
  unmounted() {},
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
            item.type,
          ),
          {
            params: {
              timeline_id: item.id, // Needs for vendor order email preview. An order can multiple vendor orders.
            },
          },
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
                  this.$t("order_timeline.resend_dialog.success"),
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
        },
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
            this.$t("order_timeline.notifications.add_note_success"),
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
            this.$t("order_timeline.notifications.edit_note_success"),
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
            this.$t("order_timeline.notifications.delete_note_success"),
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
        },
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
        CampaignLink.Medium,
        CustomerClubLevels,
      ];

      repos.forEach((obj) => {
        const list = Array.isArray(obj) ? obj : Object.values(obj);
        list.forEach((it) => {
          const _image = it.image || it.src || it.icon;
          if (!_image) return;

          if (it.code) {
            out = out.replace(
              " " + it.code + " ",
              `<img width="16" height="16" src="${_image}" title="${this.$t(it.name || it.code)}">`,
            );
          } else if (it.name)
            out = out.replace(
              " " + it.name + " ",
              `<img width="16" height="16" src="${_image}" title="${this.$t(it.name)}">`,
            );
        });
      });

      // Replace connect OS:
      out = out.replace(
        " Connect OS",
        ` <b>Connect</b> <span class="text-gradient bg-desert-hump">OS</span>`,
      );

      return out;
    },
  },
};
</script>

<style lang="scss" scoped>
.-timeline-list-item {
  padding-top: 0;
  padding-bottom: 0;

  ::v-deep(.v-list-item__content) {
    padding-top: 8px;
    padding-bottom: 8px;
    overflow: visible;
  }
}
</style>
