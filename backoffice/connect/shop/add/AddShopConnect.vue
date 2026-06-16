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
  <div>
    <!-- ▂▂▂▂▂▂▂▂▂▂▂▂ Details / Settings (Shown only in edit) ▂▂▂▂▂▂▂▂▂▂▂▂ -->
    <template v-if="shopConnect">
      <div class="widget-box mb-5">
        <u-widget-header
          :title="$t('shop_connect.edit.order.title')"
          icon="shopping_bag"
        ></u-widget-header>
        <v-list-subheader>
          {{ $t("shop_connect.edit.order.subtitle") }}
        </v-list-subheader>
        <u-smart-switch
          v-model="enable"
          :false-title="$t('global.commons.disable')"
          :label="$t('shop_connect.edit.enable.label')"
          :true-description="$t('shop_connect.edit.enable.true_desc')"
          :true-title="$t('global.commons.enable')"
          class="my-3"
          false-gray
          false-icon="stop"
          true-icon="cloud_sync"
          border
        ></u-smart-switch>

        <u-smart-switch
          v-model="overwrite"
          :false-description="$t('shop_connect.edit.overwrite.false_desc')"
          :false-title="$t('shop_connect.edit.overwrite.false_title')"
          :true-description="$t('shop_connect.edit.overwrite.true_desc')"
          :true-title="$t('shop_connect.edit.overwrite.true_title')"
          class="my-3"
          false-gray
          false-icon="edit_off"
          true-icon="mode_edit"
          border
        ></u-smart-switch>

        <u-smart-switch
          v-if="connect.confirm"
          v-model="auto_confirm"
          :false-description="$t('shop_connect.edit.confirm.false_desc')"
          :false-title="$t('global.commons.disable')"
          :label="$t('shop_connect.edit.confirm.label')"
          :true-description="$t('shop_connect.edit.confirm.true_desc')"
          :true-title="$t('global.commons.enable')"
          class="my-3"
          false-gray
          false-icon="close"
          true-icon="flash_auto"
          border
        ></u-smart-switch>

        <v-expand-transition>
          <div v-if="auto_confirm">
            <v-list-subheader>
              <div>
                <v-icon class="me-1" size="small">tips_and_updates</v-icon>
                {{ $t("shop_connect.edit.confirm.tips") }}
              </div>
            </v-list-subheader>
          </div>
        </v-expand-transition>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Shipping  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <template v-if="connect.shipping">
          <v-list-subheader>
            {{ $t("shop_connect.edit.shipping.tips") }}
          </v-list-subheader>

          <u-smart-switch
            v-model="shipping"
            :false-description="$t('shop_connect.edit.shipping.false_desc')"
            :false-title="$t('shop_connect.edit.shipping.false_title')"
            :label="$t('shop_connect.edit.shipping.label')"
            :true-description="$t('shop_connect.edit.shipping.true_desc')"
            :true-title="$t('shop_connect.edit.shipping.true_title')"
            class="my-3"
            false-gray
            true-icon="local_shipping"
            border
          ></u-smart-switch>
        </template>
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Save Action  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <s-widget-buttons>
        <v-btn
          :loading="busy_set"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="updateConnect"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save_changes") }}
        </v-btn>
      </s-widget-buttons>
    </template>

    <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Select Service ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

    <div class="widget-box mb-5">
      <u-widget-header
        :title="$t('shop_connect.edit.service.title')"
        icon="settings_ethernet"
      ></u-widget-header>
      <v-list-subheader>
        {{ $t("shop_connect.edit.service.subtitle") }}
      </v-list-subheader>

      <connect-input-field
        v-model="connect_id"
        v-model:default-connect="connect"
        :disable-fetch="!!shopConnect"
        :disabled="!!shopConnect"
        :shop="shop"
      ></connect-input-field>

      <!-- Connect Chips -->
      <div v-if="connect" class="mb-2">
        <v-chip
          v-if="connect.read_categories"
          prepend-icon="folder"
          label
          size="x-small"
          color="amber"
          variant="flat"
          class="me-1"
        >
          {{ $t("global.commons.categories") }}
        </v-chip>
        <v-chip
          v-if="connect.read_products"
          prepend-icon="shelves"
          label
          size="x-small"
          color="#1976D2"
          variant="flat"
          class="me-1"
        >
          {{ $t("global.commons.products") }}
        </v-chip>
        <v-chip
          v-if="connect.read_customers"
          prepend-icon="people"
          label
          size="x-small"
          color="#673AB7"
          variant="flat"
          class="me-1"
        >
          {{ $t("global.commons.customers") }}
        </v-chip>
        <v-chip
          v-if="connect.read_orders"
          prepend-icon="shopping_bag"
          label
          size="x-small"
          color="#009688"
          variant="flat"
          class="me-1"
        >
          {{ $t("global.commons.orders") }}
        </v-chip>
      </div>

      <!-- Help -->
      <v-expand-transition>
        <div v-if="!connect">
          <v-list-subheader
            >These tutorials showcase some of the capabilities of Connect OS.
          </v-list-subheader>
          <s-widget-help code="Connect.Printful" inline></s-widget-help>
          <s-widget-help code="Connect.XCart" inline></s-widget-help>
        </div>
      </v-expand-transition>

      <v-expand-transition>
        <div v-if="connect">
          <v-expand-transition>
            <div v-if="connect.form && connect.form.length">
              <div v-for="item in connect.form" :key="item.name">
                <v-text-field
                  v-if="!item.type"
                  v-model="params[item.name]"
                  :hint="item.hint"
                  :label="item.title"
                  variant="underlined"
                />
              </div>
            </div>
          </v-expand-transition>

          <u-smart-switch
            v-model="params.test"
            :disabled="!connect.enable"
            :false-description="$t('shop_connect.edit.test.false_desc')"
            :false-title="$t('shop_connect.edit.test.false_title')"
            :true-description="$t('shop_connect.edit.test.true_desc')"
            :true-title="$t('shop_connect.edit.test.true_title')"
            class="my-3"
            false-icon="all_inclusive"
            label="Sync mode"
            border
            true-icon="science"
            @change="$forceUpdate()"
          ></u-smart-switch>

          <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Cation : Migration ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
          <div
            v-if="mode === 'Migration'"
            class="py-2"
            v-html="$t('shop_connect.edit.migration_tips')"
          ></div>

          <u-smart-switch
            v-if="mode === 'Migration'"
            v-model="params.keep_image_urls"
            border
            class="my-5"
            color="primary"
            false-description="Selldone downloads the images, stores them on Selldone storage, and serves them from Selldone CDN."
            false-icon="cloud_upload"
            false-title="Import images to Selldone CDN"
            hint="Choose how Selldone should process product image URLs in this import file."
            label="Image URL handling"
            true-description="Selldone stores the exact external image URLs in products and galleries without downloading them."
            true-icon="link"
            true-title="Keep original image URLs"
          ></u-smart-switch>

          <u-smart-switch
            v-if="connect.read_products"
            v-model="params.import_out_of_stock_products"
            border
            class="my-5"
            color="primary"
            false-description="Products with zero inventory will be skipped. Existing synced products with zero inventory will be removed when overwrite is enabled."
            false-icon="inventory_2"
            false-title="Skip out-of-stock products"
            hint="Choose whether zero-inventory products should be imported into this shop."
            label="Out-of-stock products"
            true-description="Products with zero inventory will be imported and kept in your shop as unavailable."
            true-icon="production_quantity_limits"
            true-title="Import out-of-stock products"
          ></u-smart-switch>

          <v-expand-transition>
            <div v-if="!params.test">
              <u-fade-scroll>
                <div class="my-1 d-flex" dense>
                  <v-col v-if="connect?.read_categories" cols="12" sm="6">
                    <b-shop-quota-card
                      :quota-key="shopQuota.Category"
                      elevation="0"
                    ></b-shop-quota-card>
                  </v-col>

                  <v-col v-if="connect?.read_products" cols="12" sm="6">
                    <b-shop-quota-card
                      :quota-key="shopQuota.Product"
                      elevation="0"
                    ></b-shop-quota-card>
                  </v-col>

                  <v-col v-if="connect?.read_customers" cols="12" sm="6">
                    <b-shop-quota-card
                      :quota-key="shopQuota.Customer"
                      elevation="0"
                    ></b-shop-quota-card>
                  </v-col>
                </div>
              </u-fade-scroll>
            </div>
          </v-expand-transition>

          <v-expand-transition>
            <v-alert
              v-if="hasConnectSetupChanges"
              border="start"
              class="my-4 text-start"
              icon="sync_problem"
              color="#00796B"
              variant="tonal"
            >
              <div class="font-weight-bold mb-1">Reconnect required</div>
              <div>
                Connect setup settings have changed. Click Auto connect again to
                apply them; Save changes only stores shop connection options.
              </div>
            </v-alert>
          </v-expand-transition>

          <div v-if="connect" class="widget-buttons">
            <v-btn
              v-if="connect.direct_setup"
              :disabled="
                connect.form &&
                connect.form.length &&
                connect.form.some(
                  (i) => ['endpoint'].includes(i.name) && !params[i.name],
                )
              "
              :loading="loading"
              :variant="connectActionVariant"
              color="primary"
              size="x-large"
              @click="setupDirect()"
            >
              <v-icon start>add</v-icon>
              {{ connectActionLabel }}

              <v-avatar
                :image="getShopImagePath(connect.icon)"
                class="mx-1 avatar-gradient -thin -connect"
                size="22"
              ></v-avatar>
              {{ connect.name }}
            </v-btn>

            <v-btn
              v-else
              :disabled="
                connect.form &&
                connect.form.length &&
                connect.form.some(
                  (i) => ['endpoint'].includes(i.name) && !params[i.name],
                )
              "
              :href="connect_link"
              :loading="loading"
              :variant="connectActionVariant"
              color="primary"
              size="x-large"
              @click="loading = true"
            >
              <v-icon start>add</v-icon>
              {{ connectActionLabel }}

              <v-avatar
                :image="getShopImagePath(connect.icon)"
                class="mx-1 avatar-gradient -thin -connect"
                size="22"
              ></v-avatar>
              {{ connect.name }}

              <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
            </v-btn>
          </div>
        </div>
      </v-expand-transition>
    </div>

    <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Details (Shown only in edit) ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
    <template v-if="shopConnect">
      <div class="widget-box mb-5 mt-10">
        <u-widget-header
          :title="$t('global.commons.critical_zone')"
          icon="warning_amber"
        >
        </u-widget-header>

        <u-smart-verify
          v-model="accept_delete"
          :true-description="delete_label"
          :true-title="$t('shop_connect.edit.remove.verify')"
          class="my-3"
          color="red"
        ></u-smart-verify>

        <div class="widget-buttons">
          <v-btn
            :class="{ disabled: !accept_delete }"
            :loading="busy_delete"
            color="red"
            size="x-large"
            @click="remove"
          >
            <v-icon class="me-1">remove</v-icon>

            {{ $t("shop_connect.edit.remove.action") }}
          </v-btn>
        </div>
      </div>
    </template>

    <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Details (Shown only in add) ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

    <div v-if="connect && !shopConnect" class="widget-box mb-5">
      <u-widget-header
        :title="`Functionality / ${mode}`"
        icon="settings_suggest"
      ></u-widget-header>

      <v-list-subheader>
        {{ mode_desc }}
      </v-list-subheader>

      <template v-if="connect.read_categories || connect.write_categories">
        <div class="font-weight-bold mt-5 mb-2">
          <v-icon class="me-1" size="small">folder</v-icon>
          {{ $t("global.commons.categories") }}
        </div>
        <connect-os-pods
          :connect="connect"
          :read="connect.read_categories"
          :shop="shop"
          :write="connect.write_categories"
        ></connect-os-pods>
      </template>

      <template v-if="connect.read_products || connect.write_products">
        <div class="font-weight-bold mt-5 mb-2">
          <v-icon class="me-1" size="small">inventory</v-icon>
          {{ $t("global.commons.products") }}
        </div>
        <connect-os-pods
          :connect="connect"
          :read="connect.read_products"
          :shop="shop"
          :write="connect.write_products"
        ></connect-os-pods>
      </template>

      <template v-if="connect.read_orders || connect.write_orders">
        <div class="font-weight-bold mt-5 mb-2">
          <v-icon class="me-1" size="small">shopping_bag</v-icon>
          {{ $t("global.commons.orders") }}
        </div>
        <connect-os-pods
          :connect="connect"
          :read="connect.read_orders"
          :shop="shop"
          :write="connect.write_orders"
        ></connect-os-pods>
      </template>

      <template v-if="connect.read_customers || connect.write_customers">
        <div class="font-weight-bold mt-5 mb-2">
          <v-icon class="me-1" size="small">group</v-icon>
          {{ $t("global.commons.customers") }}
        </div>
        <connect-os-pods
          :connect="connect"
          :read="connect.read_customers"
          :shop="shop"
          :write="connect.write_customers"
        ></connect-os-pods>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import ConnectInputField from "../../../connect/input/ConnectInputField.vue";
import ConnectOsPods from "../../../connect/pods/ConnectOsPods.vue";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import { ToQueryString } from "@selldone/core-js/helper/string/StringHelper";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import { Connect } from "@selldone/core-js";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";
import shopQuota from "@selldone/core-js/enums/shop/quota/ShopQuota.ts";
import BShopQuotaCard from "@selldone/components-vue/backoffice/shop/quota/card/BShopQuotaCard.vue";
import UFadeScroll from "@selldone/components-vue/ui/fade-scroll/UFadeScroll.vue";
import SWidgetHelp from "@selldone/components-vue/ui/widget/help/SWidgetHelp.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "AddShopConnect",
  mixins: [],
  emits: ["edit", "delete", "add"],
  components: {
    SWidgetHelp,
    UFadeScroll,
    BShopQuotaCard,
    SWidgetButtons,
    USmartVerify,
    USmartSwitch,
    ConnectOsPods,
    ConnectInputField,
  },

  props: {
    shop: {
      required: true,
      type: Object,
    },
    shopConnect: {
      required: false,
      type: Object,
    },
    initialSelectedConnectId: {
      // Default Selected ID (In route query)
      type: Number,
    },
    initialEndpoint: {
      // Default Entered Endpoint (In route query)
    },
  },
  data: () => ({
    shopQuota: shopQuota,

    connect: null,
    connect_id: null,
    enable: false,
    auto_confirm: false,
    shipping: false,
    overwrite: false,

    loading: false,

    params: {
      test: true,
      keep_image_urls: false,
      import_out_of_stock_products: false,
    },
    saved_request_params: null,

    //--------------------
    busy_set: false,

    accept_delete: false,
    busy_delete: false,
  }),
  computed: {
    request_params() {
      const params = Object.assign({}, this.params);
      if (this.connect?.mode !== Connect.Modes.Migration.code) {
        delete params.keep_image_urls;
      }
      if (!this.connect?.read_products) {
        delete params.import_out_of_stock_products;
      }
      return params;
    },

    connect_link() {
      const query = /*  this.connect.form !test param!&&*/ this.request_params
        ? ToQueryString(this.request_params)
        : "";

      return (
        this.connect &&
        `/connect/${this.connect.code}/login/${this.shop.id}?${query}`
      );
    },

    hasConnectSetupChanges() {
      if (!this.shopConnect || !this.saved_request_params) return false;

      return (
        JSON.stringify(
          this.normalizedConnectRequestParams(this.request_params),
        ) !== JSON.stringify(this.saved_request_params)
      );
    },

    connectActionVariant() {
      return !this.shopConnect || this.hasConnectSetupChanges
        ? "elevated"
        : "text";
    },

    connectActionLabel() {
      return this.hasConnectSetupChanges
        ? "Reconnect & apply settings"
        : this.$t("shop_connect.edit.add_action");
    },

    delete_label() {
      if (this.connect.mode === Connect.Modes.Migration.code)
        return `I want to delete the ${this.connect.name} connection. All synced products will remain, and just its Connect badge in products management will be removed.`;
      else if (this.connect.mode === Connect.Modes.Dropshipping.code)
        return `I want to delete ${this.connect.name} <-> product connection. All synced products will be removed (Move to trashed).`;

      return `I want to delete ${this.connect.name} service.`;
    },

    mode() {
      return this.connect.mode;
    },
    mode_desc() {
      return Connect.Modes[this.mode] && this.$t(Connect.Modes[this.mode].desc);
    },
  },
  watch: {
    connect(connect) {
      if (connect && !connect.enable) {
        this.params.test = true; // Force test mode in private providers!
      }
      this.params = Object.assign({}, this.params); // Fix bug in the connect_link update!
    },
  },

  created() {
    if (this.shopConnect) {
      this.connect = this.shopConnect.connect;
      this.connect_id = this.shopConnect.connect_id;
      this.enable = this.shopConnect.enable;
      this.auto_confirm = this.shopConnect.auto_confirm;
      this.shipping = this.shopConnect.shipping;
      this.overwrite = this.shopConnect.overwrite;

      // Autofill endpoint value: (Used in connect to some services like WooCommerce)
      if (this.shopConnect.endpoint)
        this.params.endpoint = this.shopConnect.endpoint;
      // Autofill test value:
      this.params.test =
        this.shopConnect.test || (this.connect && !this.connect.enable);
      this.params.keep_image_urls =
        this.shopConnect.settings?.keep_image_urls === true;
      this.params.import_out_of_stock_products =
        this.shopConnect.settings?.import_out_of_stock_products === true;
    } else if (this.initialSelectedConnectId) {
      this.connect_id = this.initialSelectedConnectId;
      this.params.endpoint = this.initialEndpoint ? this.initialEndpoint : "";
    }

    this.rememberSavedConnectRequestParams();
  },

  methods: {
    normalizedConnectRequestParams(params) {
      return Object.keys(params || {})
        .sort()
        .reduce((normalized, key) => {
          if (params[key] !== undefined) normalized[key] = params[key];
          return normalized;
        }, {});
    },

    rememberSavedConnectRequestParams() {
      this.saved_request_params = this.normalizedConnectRequestParams(
        this.request_params,
      );
    },

    setupDirect() {
      this.loading = true;

      axios
        .post(
          window.API.POST_SHOP_CONNECT_SETUP_DIRECT(
            this.shop.id,
            this.connect.code,
          ),
          this.request_params,
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("add", data.shop_connect);
            this.rememberSavedConnectRequestParams();

            NotificationService.showSuccessAlert(
              null,
              "Connect has been added successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateConnect() {
      this.busy_set = true;

      axios
        .put(
          window.API.PUT_UPDATE_SHOP_CONNECT(this.shop.id, this.shopConnect.id),
          {
            code: this.connect.code,

            enable: this.enable,
            auto_confirm: this.auto_confirm,
            shipping: this.shipping,
            overwrite: this.overwrite,

            endpoint: this.params.endpoint,
            test: this.params.test,
            keep_image_urls: this.request_params.keep_image_urls,
            import_out_of_stock_products:
              this.request_params.import_out_of_stock_products,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("edit", data.shop_connect);
            NotificationService.showSuccessAlert(
              null,
              "Connect has been updated successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },

    remove() {
      this.busy_delete = true;

      axios
        .delete(
          window.API.DELETE_SHOP_CONNECT(this.shop.id, this.shopConnect.id),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("delete", data.id);

            this.$router.push({ name: "BPageShopChannelConnect" });

            NotificationService.showSuccessAlert(
              null,
              "Connect has been deleted successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
