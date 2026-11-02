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
    class="b-shop-sms-template-list s-table-loading text-start"
    :class="modern ? 'sd-modern-widget b-shop-sms-template-list--modern' : 'widget-box mb-5 min-height-40vh overflow-hidden'"
  >
    <header v-if="modern" class="sd-modern-header b-shop-sms-template-list__header">
      <div class="sd-modern-title">
        <v-icon class="sd-modern-icon sd-modern-icon--plain" aria-hidden="true">description</v-icon>
        <div>
          <p class="sd-modern-eyebrow">{{ $t('shop_sms.modern.custom_templates') }}</p>
          <h2 class="sd-modern-title-text">{{ sms.title }}</h2>
          <code v-copy dir="ltr" class="b-shop-sms-template-list__context-code">{{ sms.code }}</code>
        </div>
      </div>
      <v-btn
        :disabled="sms.verification || !shop.sms_service || shop.sms_service.driver === 'default' || !shop.sms_service.enable"
        class="sd-modern-button sd-modern-button--primary"
        color="primary"
        variant="elevated"
        @click="showDialog()"
      >
        <v-icon start aria-hidden="true">add</v-icon>
        {{ $t('shop_sms.modern.add_template') }}
      </v-btn>
    </header>
    <u-widget-header
      v-else
      :disabled="
        sms.verification ||
        !shop.sms_service ||
        shop.sms_service.driver === 'default' ||
        !shop.sms_service.enable
      "
      :disabled-reason="
        !shop.sms_service
          ? $t('shop_sms.template.disable_reason.set_provider')
          : !shop.sms_service?.enable
            ? $t('shop_sms.template.disable_reason.provider_is_disabled')
            : sms.verification
              ? $t('shop_sms.template.disable_reason.otp')
              : $t('shop_sms.template.disable_reason.select_another_provider')
      "
      :title="$t('shop_sms.template.title')"
      :add-caption="$t('shop_sms.template.add_new')"
      icon="sms"
      @click:add="showDialog()"
    ></u-widget-header>

    <v-list-subheader :class="{ 'b-shop-sms-template-list__notice': modern }">
      <div
        v-if="
          shop.sms_service &&
          shop.sms_service.driver !== 'default' &&
          shop.sms_service.enable
        "
        :class="{ 'sd-modern-status sd-modern-status--plain': modern }"
      >
        <span v-if="modern" class="sd-modern-status__dot sd-modern-status__dot--success" aria-hidden="true"></span>
        <v-icon v-else class="me-1" color="success">check_circle_outline</v-icon>
        <span :class="{ 'sd-modern-notice__content': modern }">{{ $t(modern ? 'shop_sms.modern.custom_available' : 'shop_sms.template.valid_message') }}</span>
      </div>
      <div v-else-if="shop.sms_service && !shop.sms_service.enable" :class="{ 'sd-modern-notice sd-modern-notice--plain': modern }">
        <v-icon class="me-1" :color="modern ? 'warning' : 'orange'" :size="modern ? 16 : undefined">warning_amber</v-icon>
        <span :class="{ 'sd-modern-notice__content': modern }">{{ $t("shop_sms.template.provider_not_enable_message") }}</span>
      </div>
      <div v-else :class="{ 'sd-modern-notice sd-modern-notice--plain': modern }">
        <v-icon class="me-1" :color="modern ? 'warning' : 'orange'" :size="modern ? 16 : undefined">warning_amber</v-icon>
        <span :class="{ 'sd-modern-notice__content': modern }">{{ $t("shop_sms.template.need_custom_provider_message") }}</span>
      </div>
    </v-list-subheader>

    <b-list-loading-state v-if="busy && templates?.length" kind="campaign" compact class="sd-modern-list-refresh" />

    <!-- ███████████████████████ List of SMS Templates ███████████████████████ -->

    <template v-if="!sms.verification">
      <v-row no-gutters :class="{ 'sd-modern-list-toolbar b-shop-sms-template-list__toolbar': modern }">
        <u-smart-toggle
          v-model="active"
          false-gray
          :accessible="modern"
          :class="{ 'b-shop-sms-template-list__enabled-filter': modern }"
          :true-title="$t('shop_sms.template.enable_only_filter')"
        ></u-smart-toggle>
        <v-spacer></v-spacer>

        <v-text-field
          v-model="search"
          :placeholder="$t('global.commons.search')"
          :class="modern ? 'b-shop-sms-template-list__search' : 'max-width-field'"
          clearable
          hide-details
          prepend-inner-icon="search"
          single-line
          variant="plain"
        ></v-text-field>
      </v-row>

      <v-data-table-server
        :aria-busy="busy"
        :loading="busy"
        v-model:options="options"
        v-model:page="page"
        v-model:sort-by="sortBy"
        :header-props="{ sortByText: $t('global.commons.sort_by') }"
        :headers="headers"
        :items="templates"
        :items-length="totalItems"
        :items-per-page="itemsPerPage"
        :mobile="templateTableMobile"
        :row-props="
          (_data) => {
            return { class: modern ? 'sd-modern-clickable-item' : 'row-hover' };
          }
        "
        class="bg-transparent min-height-10vh"
        :class="{ 'sd-modern-data-table': modern }"
        density="compact"
        hide-default-footer
        item-key="id"
        @click:row="(_, r) => showDialog(r.item)"
      >
        <template v-if="!templates?.length" #loading>
          <b-list-loading-state kind="campaign" />
        </template>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ code ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template #no-data><b-list-empty-state v-if="emptyStateLoaded && !busy" kind="campaign"
          :class="{ 'b-shop-sms-template-list__empty': modern }"
          :title="(totalItems) > 0 ? $t('dashboard_empty_state.empty_page.title') : ($t(search || active ? 'dashboard_empty_state.no_results.title' : modern ? 'shop_sms.modern.no_templates' : 'shop_sms.template.title'))"
          :description="(totalItems) > 0 ? $t('dashboard_empty_state.empty_page.description') : ($t(search || active ? 'dashboard_empty_state.no_results.description' : modern ? 'shop_sms.modern.no_templates_help' : 'dashboard_empty_state.context.sms_templates.description'))" /></template>

        <template v-slot:item.code="{ item }">
          <v-btn
            v-if="item.error"
            class="ma-1 float-end"
            :class="{ 'sd-modern-icon-button': modern }"
            :aria-label="modern ? $t('global.commons.error') : undefined"
            :color="modern ? undefined : 'red'"
            icon
            :size="modern ? undefined : 24"
            variant="text"
            @click="modern && $event.stopPropagation()"
          >
            <v-icon>error</v-icon>

            <v-tooltip
              activator="parent"
              :content-class="modern ? 'sd-modern-tooltip text-start' : 'bg-black text-start'"
              :location="modern ? 'top' : 'bottom'"
              :max-width="modern ? undefined : 360"
              :open-on-click="modern"
            >
              {{ item.error }}
            </v-tooltip>
          </v-btn>

          <span v-if="item.mode === 'text' && !sms_provider?.support_text"
                :tabindex="modern ? 0 : undefined" :aria-label="modern ? $t('shop_sms.template.text_template_not_supported_msg') : undefined"
                @click="modern && $event.stopPropagation()">
            <v-icon class="ma-1 float-end" :color="modern ? 'warning' : 'amber'" size="small"
              >warning
            </v-icon>
            <v-tooltip
              activator="parent"
              :content-class="modern ? 'sd-modern-tooltip text-start' : 'bg-black text-start'"
              :location="modern ? 'top' : 'bottom'"
              :max-width="modern ? undefined : 360"
              :open-on-click="modern"
            >
              {{ $t("shop_sms.template.text_template_not_supported_msg") }}
            </v-tooltip>
          </span>
          <span
            v-else-if="
              item.mode === 'template' && !sms_provider?.support_template
            "
            :tabindex="modern ? 0 : undefined" :aria-label="modern ? $t('shop_sms.template.structure_template_not_supported_msg') : undefined"
            @click="modern && $event.stopPropagation()"
          >
            <v-icon class="ma-1 float-end" :color="modern ? 'warning' : 'amber'" size="small"
              >warning
            </v-icon>

            <v-tooltip
              activator="parent"
              :content-class="modern ? 'sd-modern-tooltip text-start' : 'bg-black text-start'"
              :location="modern ? 'top' : 'bottom'"
              :max-width="modern ? undefined : 360"
              :open-on-click="modern"
            >
              {{ $t("shop_sms.template.structure_template_not_supported_msg") }}
            </v-tooltip>
          </span>

          <template v-if="modern">
            <button type="button" class="sd-modern-button sd-modern-button--inline b-shop-sms-template-list__identity-open" @click.stop="showDialog(item)">
              <v-icon aria-hidden="true">{{ item.mode === 'text' ? 'subject' : 'data_object' }}</v-icon>
              {{ $t(item.mode === 'text' ? 'sms_template_mode.text.title' : 'sms_template_mode.template.title') }}
            </button>
            <code v-copy class="b-shop-sms-template-list__code" dir="ltr" @click.stop>{{ item.code }}</code>
          </template>
          <b v-else class="small">{{ item.code }}</b>
        </template>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ language ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:item.language="{ item }">
          <span v-if="modern" class="b-shop-sms-template-list__language">
            {{ item.language ? getLanguageName(item.language) : $t('global.commons.default') }}
          </span>
          <b
            v-else-if="item.language"
            :caption="getLanguageName(item.language)"
            class="text-uppercase sub-caption b-12px -no-wrap"
            >{{ item.language }}</b
          >
          <v-icon v-else :title="$t('global.commons.default')" color="#111"
            >all_inclusive
          </v-icon>
        </template>
        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ enable ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:item.enable="{ item }">
          <span v-if="modern" class="sd-modern-status sd-modern-status--plain">
            <span class="sd-modern-status__dot" :class="item.enable ? 'sd-modern-status__dot--success' : 'sd-modern-status__dot--error'"></span>
            {{ $t(item.enable ? 'shop_sms.modern.enabled' : 'shop_sms.modern.disabled') }}
          </span>
          <u-check v-else :model-value="item.enable" read-only></u-check>
        </template>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ text ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:item.text="{ item }">
          <v-tooltip v-if="modern && item.mode === 'text'" location="top" content-class="sd-modern-tooltip text-start"
                     :disabled="!item.text || item.text === item.text.limitWords(12)">
            <template #activator="{ props }">
              <button v-bind="props" type="button" class="sd-modern-button sd-modern-button--inline b-shop-sms-template-list__excerpt" @click.stop="showDialog(item)">
                {{ item.text?.limitWords(12) }}
              </button>
            </template>
            {{ item.text }}
          </v-tooltip>
          <div v-else-if="item.mode === 'text'" class="py-1 small">
            <v-icon class="me-1 float-start" color="#111">subject</v-icon>
            {{ item.text?.limitWords(12) }}
          </div>
          <div v-else-if="item.mode === 'template'" class="py-1">
            <v-icon class="me-1 float-start" :color="modern ? undefined : '#111'" aria-hidden="true">data_object</v-icon>
            <code>{{ $t("shop_sms.template.structured_data") }}</code>
          </div>
          <div class="py-1 small" :class="{ 'b-shop-sms-template-list__edited': modern }">
            <v-avatar
              class="me-2 avatar-gradient -thin -officer hover-scale"
              size="24"
              :title="modern ? $t('shop_sms.modern.last_editor') : 'Last editor'"
            >
              <img :src="getUserAvatar(item.user_id)" />
            </v-avatar>

            {{ getFromNowString(item.updated_at) }}
            <small>
              ●
              {{ getLocalTimeStringSmall(item.updated_at) }}
            </small>
          </div>
        </template>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ action ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:item.action="{ item }">
          <u-smart-menu
            :modern="modern"
            :title="modern ? $t('global.commons.actions') : undefined"
            :items="[
              {
                title: $t('global.commons.edit'),
                click: () => showDialog(item),
                icon: 'edit',
              },

              {
                title: `${$t('shop_sms.template.menu.reset_error')} (${item.errors})`,
                click: () => resetErrors(item),
                icon: 'rotate_right',
              },

              {
                title: $t('shop_sms.template.menu.send_test'),
                subtitle:
                  modern && !USER().phone ? $t('shop_sms.modern.test_phone_required') : `${$t('global.commons.phone')}: ${USER().phone}` ||
                  '⚠ Set your phone number first!',
                click: () => sendTest(item),
                icon: 'send',
                disabled: !USER().phone,
              },

              {
                title: $t('global.actions.delete'),
                click: () => showDelete(item),
                icon: 'close',
              },
            ]"
            :loading="
              busy_delete === item || busy_reset === item || busy_test === item
            "
          ></u-smart-menu>
        </template>

        <template v-slot:bottom>
          <footer v-if="modern" class="sd-modern-table-footer">
            <p class="sd-modern-page-summary">{{ $t('shop_sms.modern.templates_count', { count: totalItems }) }}</p>
            <v-pagination v-model="page" :length="pageCount" class="sd-modern-pagination" rounded />
          </footer>
          <v-pagination v-else v-model="page" :length="pageCount" rounded />
        </template>
      </v-data-table-server>
    </template>

    <!-- ███████████████████████ No-list OTP mode ███████████████████████ -->

    <div
      v-else
      class="p-6 text-center text-muted min-height-10vh d-flex flex-column justify-center"
    >
      <div class="text-h3 font-weight-thin">OTP</div>
      <div>One-time password</div>
    </div>

    <!-- ███████████████████████ Preview ███████████████████████ -->

    <frame-view
      v-if="!hidePreview"
      :shadow="false"
      class="max-width-field mx-auto mt-5 mb-n4"
      style="height: 250px; overflow: hidden"
    >
      <v-img
        :src="
          require('@selldone/components-vue/assets/background/bg-gradient-iphone.jpg')
        "
        cover
        style="position: absolute; left: 10%; right: 10%; top: 5%; bottom: 0"
      ></v-img>

      <div
        v-if="sms"
        style="
          background-color: #ffffff88;
          backdrop-filter: blur(12px);
          border-radius: 12px;

          font-size: 12px;
          text-align: start;
          margin: 8px;
          font-weight: 500;
          overflow: hidden;
          z-index: 1;
        "

      >
        <div
          style="padding: 6px; background: #eeeeee44; font-size: 10px"
          class="d-flex align-center"
        >
          <span
            style="padding: 2px 4px; background: #0a9928"
            class="me-2 rounded-sm"
          >
            <v-icon color="#fff" size="12">chat_bubble</v-icon>
          </span>

          MESSAGES
          <v-spacer></v-spacer>
          <span class="small">now</span>
        </div>
        <b class="px-2 pt-1 d-block">{{ shop.title }}</b>
        <div style="padding: 8px;font-size: 10px" v-html="sms.sample"></div>
      </div>
    </frame-view>

    <!-- ███████████████████████ Dialog > Add / Edit ███████████████████████ -->
    <v-dialog
      v-model="dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <b-shop-sms-template-editor
        v-if="dialog_pre"
        :shop="shop"
        :sms="sms"
        :template="selected_template"
        :modern="modern"
        has-close
        @add="
          (val) => {
            AddOrUpdateItemByID(templates, val, 'id', false);
            totalItems++;
            $emit('templates-changed');
          }
        "
        @close="dialog = false"
        @edit="
          (val) => {
            AddOrUpdateItemByID(templates, val);
          }
        "
      ></b-shop-sms-template-editor>
    </v-dialog>

    <!-- ███████████████████████ Dialog > Test Response ███████████████████████ -->
    <v-dialog
      v-model="show_data"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card v-if="test_response" class="text-start" :class="{ 'sd-modern-canvas b-shop-sms-template-list__response': modern }">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1">science</v-icon>
          {{ modern ? $t('shop_sms.modern.test_response') : 'Test response' }}
        </v-card-title>

        <v-card-text>
          <v-container>
            <div class="max-widget-width mx-auto" :class="{ 'sd-modern-widget': modern }">
              <u-pods-panel>
                <u-pod-node
                  :color="
                    test_response.error && !test_response.external_error
                      ? 'red'
                      : undefined
                  "
                  :image="getShopImagePath(shop.icon, 96)"
                  :title="shop.title"
                ></u-pod-node>
                <u-pod-wire forward></u-pod-wire>
                <u-pod-node
                  :color="test_response.external_error ? 'red' : undefined"
                  :image="sms_provider.icon"
                  :title="sms_provider.title"
                ></u-pod-node>
              </u-pods-panel>
            </div>
            <div :class="{ 'sd-modern-widget': modern }">
              <u-widget-header :class="{ 'sd-modern-form-header': modern }" :title="modern ? $t('shop_sms.modern.provider_response') : 'Response'"></u-widget-header>
              <vue-json-pretty :data="test_response.response" class="my-3"></vue-json-pretty>
            </div>
            <hr v-if="!modern" class="my-5" />
            <div :class="{ 'sd-modern-widget': modern }">
              <u-widget-header :class="{ 'sd-modern-form-header': modern }" :title="modern ? $t('shop_sms.modern.request_parameters') : 'Config & Parameters'"></u-widget-header>
              <vue-json-pretty :data="test_response.request" class="my-3"></vue-json-pretty>
            </div>
          </v-container>
        </v-card-text>
        <v-card-actions :class="{ 'sd-modern-form-actions': modern }">
          <div class="widget-buttons">
            <v-btn :class="{ 'sd-modern-button': modern }" :size="modern ? 'default' : 'x-large'" variant="text" @click="show_data = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import BListEmptyState from "@selldone/components-vue/backoffice/empty-state/BListEmptyState.vue";
import BListLoadingState from "@selldone/components-vue/backoffice/loading-state/BListLoadingState.vue";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import USmartToggle from "../../../../../ui/smart/toggle/USmartToggle.vue";
import BShopSmsTemplateEditor from "../../../../shop/sms/template/editor/BShopSmsTemplateEditor.vue";
import USmartMenu from "../../../../../ui/smart/menu/USmartMenu.vue";
import UPodsPanel from "../../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../../../ui/pod/wire/UPodWire.vue";
import { SmsProviders } from "@selldone/core-js/enums/sms/SmsProviders";
import { throttle } from "lodash-es";
import FrameView from "../../../../../ui/mockup/frame/FrameView.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BShopSmsTemplateList",
  emits: ['templates-changed'],
  mixins: [DateMixin],

  components: {
    BListLoadingState,
    BListEmptyState,
    UWidgetHeader,
    UPodWire,
    UPodNode,
    UPodsPanel,
    USmartMenu,
    FrameView,
    BShopSmsTemplateEditor,
    USmartToggle,
    VueJsonPretty,
  },
  props: {
    modern: Boolean,
    hidePreview: Boolean,
    shop: {
      required: true,
    },
    sms: {
      required: true,
    },
  },

  data: () => ({
    selected_template: null,

    //------------------------------------------
    templates: [],
    tableWidth: null,

    busy: false,
    emptyStateLoaded: false,
    emptyStateRequest: 0,

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},
    sortBy: [{ key: null, order: "desc" }],

    search: null,
    active: false,

    //-----------------------
    dialog: false,
    dialog_pre: false,

    busy_delete: null,

    busy_reset: null,

    //-----------------------
    busy_test: null,

    test_response: null,
    show_data: false,
  }),

  computed: {
    templateTableMobile() {
      return this.modern ? (this.tableWidth ?? this.$vuetify.display.width) < 660 : this.$vuetify.display.xs;
    },
    headers() {
      return [
        {
          title: this.$t(this.modern ? 'shop_sms.modern.template' : 'global.commons.code'),
          align: "start",
          value: "code",
          sortable: true,
          width: this.modern ? '25%' : undefined,
        },

        {
          title: this.$t("global.commons.language"),
          align: this.modern ? 'start' : 'center',
          value: "language",
          sortable: true,
          width: this.modern ? '14%' : undefined,
        },
        {
          title: this.$t("global.commons.message"),
          align: "start",
          value: "text",
          sortable: true,
          width: this.modern ? '36%' : undefined,
        },
        {
          title: this.$t(this.modern ? 'shop_sms.modern.status' : 'global.commons.enable'),
          align: "start",
          value: "enable",
          sortable: true,
          width: this.modern ? '17%' : undefined,
        },
        {
          title: "",
          align: "center",
          value: "action",
          sortable: false,
          width: this.modern ? '8%' : undefined,
        },
      ];
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    sms_service() {
      return this.shop.sms_service;
    },
    sms_provider() {
      return (
        this.sms_service &&
        SmsProviders.find((i) => i.driver === this.sms_service.driver)
      );
    },
  },

  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchItems(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },

    search: throttle(function (newVal, oldVal) {
      // console.log("search", newVal);
      const { sortBy, page, itemsPerPage } = this.options;
      this.page = 1;
      this.fetchItems(1, sortBy[0]?.key, sortBy[0]?.order === "desc");
    }, window.SERACH_THROTTLE),

    active() {
      const { sortBy, page, itemsPerPage } = this.options;
      this.page = 1;
      this.fetchItems(1, sortBy[0]?.key, sortBy[0]?.order === "desc");
    },
    "sms.code"() {
      const { sortBy, page, itemsPerPage } = this.options;
      this.page = 1;
      this.fetchItems(1, sortBy[0]?.key, sortBy[0]?.order === "desc");
    },
  },
  mounted() {
    if (!this.modern) return;
    this.tableResizeObserver = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) this.tableWidth = entry.contentRect.width;
    });
    this.tableResizeObserver.observe(this.$el);
  },
  beforeUnmount() {
    this.tableResizeObserver?.disconnect();
  },

  methods: {
    fetchItems(page, sortBy, sortDesc = true) {
      const emptyRequest = ++this.emptyStateRequest;
      if (this.sms.verification) return; // No template for OTP messages!

      this.busy = true;
      this.emptyStateLoaded = false;

      axios
        .get(window.API.GET_SHOP_SMS_TEMPLATES(this.shop.id), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,

            search: this.search,

            active: this.active,

            code: this.sms?.code,
          },
        })
        .then(({ data }) => {
          if (emptyRequest !== this.emptyStateRequest) return;
          this.templates = data.templates;
          this.emptyStateLoaded = Array.isArray(data.templates);
          this.totalItems = data.total;
        })
        .catch((error) => {
          if (emptyRequest !== this.emptyStateRequest) return;
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (emptyRequest !== this.emptyStateRequest) return;
          this.busy = false;
        });
    },

    showDialog(template) {
      this.selected_template = template;
      this.dialog_pre = false;
      this.$nextTick(() => {
        this.dialog_pre = true;
        this.dialog = true;
      });
    },

    showDelete(template) {
      NotificationService.openDangerAlert(
        "Delete message template",
        "Are you sure to delete this template?",
        "Yes, Delete now",
        () => {
          this.busy_delete = template;
          axios
            .delete(
              window.API.DELETE_SHOP_SMS_TEMPLATE(this.shop.id, template.id),
            )
            .then(({ data }) => {
              if (!data.error) {
                this.DeleteItemByID(this.templates, data.id);
                this.$emit('templates-changed');
              } else {
                NotificationService.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = null;
            });
        },
      );
    },

    resetErrors(template) {
      this.busy_reset = template;
      axios
        .post(
          window.API.POST_SHOP_SMS_TEMPLATE_RESET_ERRORS(
            this.shop.id,
            template.id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.templates, data.template);
            NotificationService.showSuccessAlert(
              null,
              "SMS template errors reset!",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_reset = false;
        });
    },

    sendTest(template) {
      this.busy_test = template;
      axios
        .post(
          window.API.POST_SHOP_SMS_TEMPLATE_SEND_TEST(
            this.shop.id,
            template.id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              `Test message has been sent to your phone number <b>${
                this.USER().phone
              }</b>.`,
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
          this.show_data = !!data;
          this.test_response = data;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_test = false;
        });
    },
  },
  created() {},
};
</script>

<style lang="scss" scoped>
.b-shop-sms-template-list--modern.sd-modern-widget {
  container-type: inline-size;
  padding: 20px;
  border: 0;
  border-radius: 20px;

  .b-shop-sms-template-list__header {
    margin-block-end: 14px;

    .sd-modern-title-text { font-size: 14px; font-weight: 500; line-height: 22px; overflow-wrap: anywhere; }
    .sd-modern-subtitle { font-size: 13px; line-height: 20px; }
    .sd-modern-icon { font-size: 18px; }
  }
  .b-shop-sms-template-list__context-code { display: inline-block; max-width: 100%; margin-block-start: 4px; color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; line-height: 18px; overflow-wrap: anywhere; }

  .b-shop-sms-template-list__notice {
    min-height: 0;
    padding: 0;
    margin-block-end: 18px;
    color: rgb(var(--v-theme-on-surface));
    font-size: 13px;
    line-height: 21px;
    white-space: normal;
  }

  .b-shop-sms-template-list__toolbar {
    margin: 0;
    flex-wrap: wrap;
  }

  .b-shop-sms-template-list__enabled-filter :deep(.mnh) { min-height: 28px; }
  .b-shop-sms-template-list__enabled-filter :deep(b) { font-size: 13px; font-weight: 400; line-height: 20px; }
  .b-shop-sms-template-list__notice :deep(.v-list-subheader__text) { width: 100%; overflow: visible; white-space: normal; }
  .b-shop-sms-template-list__identity-open,
  .b-shop-sms-template-list__excerpt {
    display: flex;
    align-items: center;
    max-width: 100%;
    border: 0;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    font-family: inherit;
    font-size: 13px;
    line-height: 21px;
    text-align: start;
    overflow-wrap: anywhere;
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
  }
  .b-shop-sms-template-list__identity-open { font-weight: 500; }
  .b-shop-sms-template-list__identity-open > .v-icon { font-size: 18px; color: var(--sd-modern-muted); }
  .b-shop-sms-template-list__code { display: block; font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); overflow-wrap: anywhere; }
  .b-shop-sms-template-list__language { font-size: 13px; line-height: 21px; }
  .b-shop-sms-template-list__edited { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  .b-shop-sms-template-list__edited small { font: inherit; }
  .b-shop-sms-template-list__empty { padding-block: 26px; }
  .b-shop-sms-template-list__empty :deep(.b-list-empty-state__art) { width: 120px; margin-block-end: 12px; }
  .b-shop-sms-template-list__empty :deep(.b-list-empty-state__title) { font-size: 16px; line-height: 24px; }
  .b-shop-sms-template-list__empty :deep(.b-list-empty-state__description) { font-size: 13px; line-height: 21px; }

  .b-shop-sms-template-list__search {
    flex: 0 1 240px;
    min-width: 150px;
    max-width: 100%;
  }

  :deep(.sd-modern-data-table > .v-table__wrapper) { overflow: visible; }
  :deep(.sd-modern-data-table td) { overflow-wrap: anywhere; }

  @media (max-width: 600px) {
    padding: 18px 16px;
    .b-shop-sms-template-list__search { flex-basis: 100%; }
  }
  @container (max-width: 660px) {
    .b-shop-sms-template-list__search { flex-basis: 100%; }
  }
  @media (max-width: 600px), (pointer: coarse) {
    .b-shop-sms-template-list__identity-open,
    .b-shop-sms-template-list__excerpt { min-height: 44px; }
  }
}

.b-shop-sms-template-list__response {
  > .v-card-title { font-size: 18px; font-weight: 500; line-height: 26px; }
  > .v-card-text > .v-container {
    display: grid;
    gap: 16px;
    width: min(1040px, 100%);
  }
  .sd-modern-widget { padding: 20px; border: 0; border-radius: 20px; }
}
</style>
