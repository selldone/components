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
  <div class="widget-box mb-5 min-height-40vh overflow-hidden">
    <s-widget-header
      :disabled="
        sms.verification ||
        !shop.sms_service ||
        shop.sms_service.driver === 'default' ||
        !shop.sms_service.enable
      "
      :disabled-reason="
        !shop.sms_service
          ? 'Set your provider first!'
          : !shop.sms_service?.enable
            ? 'Provider is disable!'
            : sms.verification
              ? 'OTP - None customizable!'
              : 'Select another provider.'
      "
      :title="$t('shop_sms.sub_title')"
      add-caption="Add new"
      icon="sms"
      @click:add="showDialog()"
    ></s-widget-header>

    <v-list-subheader>
      <div
        v-if="
          shop.sms_service &&
          shop.sms_service.driver !== 'default' &&
          shop.sms_service.enable
        "
      >
        <v-icon class="me-1" color="success">check_circle_outline</v-icon>
        You can create custom SMS messages.
      </div>
      <div v-else-if="shop.sms_service && !shop.sms_service.enable">
        <v-icon class="me-1" color="orange">warning_amber</v-icon>
        The SMS provider is <b>not enabled</b>!
      </div>
      <div v-else>
        <v-icon class="me-1" color="orange">warning_amber</v-icon>
        Customized SMS messages only work if you set a <b>custom provider</b>.
      </div>
    </v-list-subheader>

    <u-loading-progress v-if="busy"></u-loading-progress>

    <!-- ███████████████████████ List of SMS Templates ███████████████████████ -->

    <template v-if="!sms.verification">
      <v-row no-gutters>
        <u-smart-toggle
          v-model="active"
          true-title="Active only"
          false-gray
        ></u-smart-toggle>
        <v-spacer></v-spacer>

        <v-text-field
          v-model="search"
          :label="$t('global.commons.search')"
          class="max-width-field"
          clearable
          hide-details
          prepend-inner-icon="search"
          single-line
          variant="plain"
        ></v-text-field>
      </v-row>

      <v-data-table-server
        v-model:options="options"
        v-model:page="page"
        :header-props="{ sortByText: $t('global.commons.sort_by') }"
        :headers="headers"
        :items="templates"
        :items-length="totalItems"
        :items-per-page="itemsPerPage"
        :row-props="
          (_data) => {
            return { class: 'row-hover' };
          }
        "
        :sort-by="[{ key: null, order: 'desc' }]"
        class="bg-transparent min-height-10vh"
        density="compact"
        hide-default-footer
        item-key="id"
        @click:row="(_, r) => showDialog(r.item)"
      >
        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ code ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:item.code="{ item }">
          <b class="small">{{ item.code }}</b>
          <v-tooltip
            v-if="item.error"
            color="#111"
            location="bottom"
            max-width="420"
          >
            <template v-slot:activator="{ props }">
              <v-btn class="ms-2" color="red" icon size="small" v-bind="props">
                <v-icon size="small">error</v-icon>
              </v-btn>
            </template>
            <span>{{ item.error }}</span>
          </v-tooltip>
          <v-icon
            v-if="item.mode === 'text' && !sms_provider.support_text"
            class="ms-1"
            color="amber"
            size="small"
            title="Your provider does not support plain text messages."
            >warning
          </v-icon>
          <v-icon
            v-else-if="
              item.mode === 'template' && !sms_provider.support_template
            "
            class="ms-1"
            color="amber"
            size="small"
            title="Your provider does not support structural messages."
            >warning
          </v-icon>
        </template>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ language ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:item.language="{ item }">
          <b
            v-if="item.language"
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
          <u-check :model-value="item.enable"></u-check>
        </template>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ text ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:item.text="{ item }">
          <div v-if="item.mode === 'text'" class="py-1 small">
            <v-icon class="me-1 float-start" color="#111">subject</v-icon>
            {{ item.text?.limitWords(12) }}
          </div>
          <div v-else-if="item.mode === 'template'" class="py-1">
            <v-icon class="me-1 float-start" color="#111">data_object</v-icon>
            <code>Structured Data</code>
          </div>
          <div class="py-1 small">
            <v-avatar
              class="me-2 avatar-gradient -thin -officer hover-scale"
              size="24"
              title="Last editor"
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
            :items="[
              {
                title: $t('global.commons.edit'),
                click: () => showDialog(item),
                icon: 'edit',
              },

              {
                title: `Reset errors (${item.errors})`,
                click: () => resetErrors(item),
                icon: 'rotate_right',
              },

              {
                title:
                  `Send test message` +
                  (USER().phone ? '' : ' - ⚠ set your phone number'),
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
          <v-pagination v-model="page" :length="pageCount" rounded />
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
      :shadow="false"
      class="max-width-field mx-auto mt-5 mb-n4"
      style="height: 250px; overflow: hidden"
    >
      <span class="sms-time">Today 1:12 PM</span>
      <div v-if="sms" class="sms-box" v-html="sms.sample"></div>
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
        has-close
        @add="
          (val) => {
            AddOrUpdateItemByID(templates, val, 'id', false);
            totalItems++;
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
    <v-bottom-sheet v-model="show_data" max-width="520" width="90%">
      <v-card v-if="test_response" class="text-start">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1">science</v-icon>
          Test response
        </v-card-title>

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

        <v-card-text>
          <vue-json-pretty :data="test_response" class="my-3"></vue-json-pretty>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="show_data = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import USmartToggle from "../../../../../ui/smart/toggle/USmartToggle.vue";
import BShopSmsTemplateEditor from "../../../../shop/sms/template/editor/BShopSmsTemplateEditor.vue";
import USmartMenu from "../../../../../ui/smart/menu/USmartMenu.vue";
import UPodsPanel from "../../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../../../ui/pod/wire/UPodWire.vue";
import { SmsProviders } from "@selldone/core-js/enums/sms/SmsProviders";
import _ from "lodash-es";
import FrameView from "../../../../../ui/mockup/frame/FrameView.vue";

export default {
  name: "BShopSmsTemplateList",
  components: {
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
    headers: [
      {
        text: "Code",
        align: "start",
        value: "code",
        sortable: true,
      },

      {
        text: "Lang",
        align: "center",
        value: "language",
        sortable: true,
      },
      {
        text: "Message",
        align: "start",
        value: "text",
        sortable: true,
      },
      {
        text: "Active",
        align: "start",
        value: "enable",
        sortable: true,
      },
      {
        text: "",
        align: "center",
        value: "action",
        sortable: false,
      },
    ],

    busy: false,

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},

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

    search: _.throttle(function (newVal, oldVal) {
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

  methods: {
    fetchItems(page, sortBy, sortDesc = true) {
      if (this.sms.verification) return; // No template for OTP messages!

      this.busy = true;

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
          this.templates = data.templates;
          this.totalItems = data.total;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
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
      this.openDangerAlert(
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
              } else {
                this.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
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
            this.showSuccessAlert(null, "SMS template errors reset!");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
            this.showSuccessAlert(
              null,
              `Test message has been sent to your phone number <b>${
                this.USER().phone
              }</b>.`,
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
          this.show_data = true;
          this.test_response = data;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_test = false;
        });
    },
  },
  created() {},
};
</script>

<style scoped></style>
