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
    <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Select Service ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('shop_connect.edit.service.title')"
        icon="settings_ethernet"
      ></s-widget-header>
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
            true-icon="science"
            @change="$forceUpdate()"
          ></u-smart-switch>

          <u-smart-switch
            v-if="shopConnect"
            v-model="overwrite"
            :false-description="$t('shop_connect.edit.overwrite.false_desc')"
            :false-title="$t('shop_connect.edit.overwrite.false_title')"
            :true-description="$t('shop_connect.edit.overwrite.true_desc')"
            :true-title="$t('shop_connect.edit.overwrite.true_title')"
            class="my-3"
            false-gray
            false-icon="edit_off"
            true-icon="mode_edit"
          ></u-smart-switch>

          <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Cation : Migration ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
          <div
            v-if="mode === 'Migration'"
            class="py-2"
            v-html="$t('shop_connect.edit.migration_tips')"
          ></div>

          <div class="widget-buttons">

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
                :variant="!!shopConnect ? 'text' : 'elevated'"
                color="primary"
                size="x-large"
                @click="setupDirect()"
            >
              <v-icon start>add</v-icon>
              {{ $t("shop_connect.edit.add_action") }}

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
              :variant="!!shopConnect ? 'text' : 'elevated'"
              color="primary"
              size="x-large"
              @click="loading = true"

            >
              <v-icon start>add</v-icon>
              {{ $t("shop_connect.edit.add_action") }}

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
      <div class="widget-box mb-5">
        <s-widget-header
          :title="$t('shop_connect.edit.order.title')"
          icon="shopping_bag"
        ></s-widget-header>
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
          ></u-smart-switch>
        </template>

        <div class="widget-buttons">
          <v-btn
            :loading="busy_set"
            color="primary"
            size="x-large"
            variant="flat"
            @click="updateConnect"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save_changes") }}
          </v-btn>
        </div>
      </div>

      <div class="widget-box mb-5 mt-10">
        <s-widget-header
          :title="$t('global.commons.critical_zone')"
          icon="warning_amber"
        >
        </s-widget-header>

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
      <s-widget-header
        :title="`Functionality / ${mode}`"
        icon="settings_suggest"
      ></s-widget-header>

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

<script>
import ConnectInputField from "../../../connect/input/ConnectInputField.vue";
import ConnectOsPods from "../../../connect/pods/ConnectOsPods.vue";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import { ToQueryString } from "@selldone/core-js/helper/string/StringHelper";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import { Connect } from "@selldone/core-js";

export default {
  name: "AddShopConnect",
  emits: ["edit", "delete", "add"],
  components: {
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
    connect: null,
    connect_id: null,
    enable: false,
    auto_confirm: false,
    shipping: false,
    overwrite: false,

    loading: false,

    params: { test: true },

    //--------------------
    busy_set: false,

    accept_delete: false,
    busy_delete: false,
  }),
  computed: {
    connect_link() {
      const query = /*  this.connect.form !test param!&&*/ this.params
        ? ToQueryString(this.params)
        : "";

      return (
        this.connect &&
        `/connect/${this.connect.code}/login/${this.shop.id}?${query}`
      );
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
    } else if (this.initialSelectedConnectId) {
      this.connect_id = this.initialSelectedConnectId;
      this.params.endpoint = this.initialEndpoint ? this.initialEndpoint : "";
    }
  },

  methods: {
    setupDirect(){
      this.loading = true;

      axios
          .post(
              window.API.POST_SHOP_CONNECT_SETUP_DIRECT(this.shop.id, this.connect.code),
              this.params
          )
          .then(({ data }) => {
            if (!data.error) {

              this.$emit("add", data.shop_connect);


              this.showSuccessAlert(
                  null,
                  "Connect has been added successfully.",
              );
            } else {
              this.showErrorAlert(null, data.error_msg);
            }
          })
          .catch((error) => {
            this.showLaravelError(error);
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
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("edit", data.shop_connect);
            this.showSuccessAlert(
              null,
              "Connect has been updated successfully.",
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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

            this.showSuccessAlert(
              null,
              "Connect has been deleted successfully.",
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
