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
        icon="settings_ethernet"
        title="Service"
      ></s-widget-header>
      <v-list-subheader
        >Select target platform, dropshipping supplier, or marketplace to
        connect.
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
            class="my-3"
            false-description="Get all available products, categories, customers."
            false-icon="all_inclusive"
            false-title="Sync all"
            label="Sync mode"
            true-description="Get max 5 products, categories, and customers. You can turn it to full mode in the Connect > Setting at any time."
            true-icon="science"
            true-title="Limited (Recommended for beginners)"
            @change="$forceUpdate()"
          ></u-smart-switch>

          <u-smart-switch
            v-if="shopConnect"
            v-model="overwrite"
            class="my-3"
            false-description="Retain existing product and category details as they are."
            false-gray
            false-icon="edit_off"
            false-title="Do not change if exist"
            true-description="Update existing product, variant, and category information."
            true-icon="mode_edit"
            true-title="Overwrite"
          ></u-smart-switch>

          <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Cation : Migration ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
          <div v-if="mode === 'Migration'" class="py-2">
            <b>Tips: </b>If you want to test the functionality please select
            <b>Limited</b> option. By selecting 'Sync all', we get all data from
            your connected services and download related images, so it will
            reduce your free storage. Also, removing many products, categories,
            and customers would be hard!
          </div>

          <div class="widget-buttons">
            <v-btn
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
              Auto connect to
              <v-avatar
                :image="getShopImagePath(connect.icon)"
                size="22"
                class="mx-1 avatar-gradient -thin -connect"
              ></v-avatar>
              {{ connect.name }}
            </v-btn>
          </div>
        </div>
      </v-expand-transition>
    </div>

    <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Details (Shown only in edit) ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
    <template v-if="shopConnect">
      <div class="widget-box mb-5">
        <s-widget-header
          icon="shopping_bag"
          title="Ordering Status"
        ></s-widget-header>
        <v-list-subheader>
          Configure the connected service's order management settings for your
          store. This includes setting up order acceptance, enabling automatic
          order confirmation (if supported), and configuring shipping cost
          calculations.
        </v-list-subheader>
        <u-smart-switch
          v-model="enable"
          :false-title="$t('global.commons.disable')"
          :true-title="$t('global.commons.enable')"
          class="my-3"
          false-gray
          false-icon="stop"
          label="Connect status"
          true-description="Inventory and orders will be synced."
          true-icon="cloud_sync"
        ></u-smart-switch>

        <u-smart-switch
          v-if="connect.confirm"
          v-model="auto_confirm"
          :false-title="$t('global.commons.disable')"
          :true-title="$t('global.commons.enable')"
          class="my-3"
          false-description="You should confirm order manually."
          false-gray
          false-icon="close"
          label="Auto confirm orders"
          true-description="Orders with live payment will be automatically approved. Orders with debug payment will not approve automatically. "
          true-icon="flash_auto"
        ></u-smart-switch>

        <v-expand-transition>
          <div v-if="auto_confirm">
            <v-list-subheader>
              <div>
                <v-icon class="me-1" size="small">tips_and_updates</v-icon>
                Orders paid by gift card or COD or payment gateways in the debug
                mode are exceptions and will not be confirmed automatically.
              </div>
            </v-list-subheader>
          </div>
        </v-expand-transition>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Shipping  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <template v-if="connect.shipping">
          <v-list-subheader
            >This service offers shipping calculation, which can be enabled or
            disabled as per your preference. If enabled, cost calculation APIs
            with 3rd party services will be required, which may cause a delay of
            over 300ms for updating the price on the checkout page.
          </v-list-subheader>

          <u-smart-switch
            v-model="shipping"
            class="my-3"
            false-description="Use my shipping cost calculation, in Shop > Logistic > Transportation for all products, including imported ones."
            false-gray
            false-title="Disable"
            label="Shipping"
            true-description="Employ the shipping rate calculation API offered by this service."
            true-icon="local_shipping"
            true-title="Calculate shipping"
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
            Save changes
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
          class="my-3"
          color="red"
          true-title="I verify to remove this connection."
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
            Remove connect
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
import { ConnectMode } from "@selldone/core-js/enums/connect/ConnectMode";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";

export default {
  name: "AddShopConnect",
  emits: ["edit", "delete"],
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
      if (this.connect.mode === ConnectMode.Migration.code)
        return `I want to delete the ${this.connect.name} connection. All synced products will remain, and just its Connect badge in products management will be removed.`;
      else if (this.connect.mode === ConnectMode.Dropshipping.code)
        return `I want to delete ${this.connect.name} <-> product connection. All synced products will be removed (Move to trashed).`;

      return `I want to delete ${this.connect.name} service.`;
    },

    mode() {
      return this.connect.mode;
    },
    mode_desc() {
      return ConnectMode[this.mode] && this.$t(ConnectMode[this.mode].desc);
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
