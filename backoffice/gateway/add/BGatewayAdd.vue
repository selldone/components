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

<template>
  <div>
    <div
      :class="{ '-green': enable, '-red': !enable }"
      class="widget-box mb-5 border-top-medium"
    >
      <s-widget-header
        :title="$t('edit_gateway.gateway_status')"
        icon="settings"
      >
        <template v-slot:actions>
          <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ In App Help (Help Center) ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->
          <inline-help :code="'SHOP:GATEWAYS:' + gateway.code"></inline-help>
          <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->
        </template>
      </s-widget-header>
      <v-list-subheader></v-list-subheader>

      <u-currency-input
        v-model="gateway.currency"
        disabled
        label="Currency"
        messages="The currency that this payment gateway supports."
        variant="underlined"
      ></u-currency-input>

      <v-text-field
        v-model="gateway.code"
        append-inner-icon="fa:fas fa-copyright"
        disabled
        label="Gateway Code"
        variant="underlined"
      />
      <s-widget-header :title="$t('edit_gateway.status_title')" icon="flaky">
      </s-widget-header>

      <v-list-subheader>
        {{ $t("edit_gateway.status_message") }}
      </v-list-subheader>

      <u-smart-switch
        v-model="enable"
        :false-title="$t('global.inactive')"
        :true-title="$t('global.active')"
        class="my-3"
        false-gray
        false-icon="credit_card_off"
        true-description="Your customers can pay with this payment method."
        true-icon="check_circle"
      />

      <template v-if="gateway.manual">
        <s-widget-header
          :title="$t('edit_gateway.manual_title')"
          icon="done_all"
        >
        </s-widget-header>

        <v-list-subheader>
          {{ $t("edit_gateway.manual_message") }}
        </v-list-subheader>

        <u-pods-panel :disabled="!enable">
          <u-pod-node
            icon="shopping_bag"
            title="Payment"
            title-icon="person"
          ></u-pod-node>
          <u-pod-wire forward></u-pod-wire>

          <template v-if="manual">
            <u-pod-node
              :image="getUserAvatar(USER_ID())"
              title="You"
              title-icon="hourglass_empty"
            ></u-pod-node>
            <u-pod-wire forward></u-pod-wire>
          </template>

          <u-pod-node
            :icon="manual ? 'price_check' : 'bolt'"
            :title="manual ? 'Confirm payment' : 'Auto confirm'"
          ></u-pod-node>
        </u-pods-panel>

        <v-list-subheader>
          Hold payment only available for :

          <v-chip class="ma-1" color="#FFF" variant="flat" label size="small"
            ><img
              :src="ProductType.PHYSICAL.image"
              class="me-1 ms-n1"
              height="16"
              width="16"
            />{{ $t(ProductType.PHYSICAL.name) }}
          </v-chip>
          <v-chip class="ma-1" color="#FFF" variant="flat" label size="small"
            ><img
              :src="ProductType.SERVICE.image"
              class="me-1 ms-n1"
              height="16"
              width="16"
            />{{ $t(ProductType.SERVICE.name) }}
          </v-chip>
        </v-list-subheader>

        <u-smart-switch
          v-model="manual"
          :disabled="!enable"
          class="my-3"
          false-description="The payment status will be changed automatically from pending to confirmed in the payment provider system."
          false-icon="published_with_changes"
          false-title="Auto paymentconfirmation"
          true-description="Place a hold on a payment so you need to verify the payments for an order to change their status from pending to confirmed in the payment provider system."
          true-icon="hourglass_empty"
          true-title="Hold payments and Manual confirmation"
        />
      </template>
    </div>

    <div
      v-if="
        gateway.blockchain ||
        (gateway.public && gateway.public.length) ||
        (gateway.private && gateway.private.length)
      "
      class="widget-box mb-5"
    >
      <!-- █████████████████████ Blockchain mode █████████████████████ -->

      <template v-if="gateway.blockchain && shopGateway">
        <s-widget-header
          :title="$t('edit_gateway.wallet')"
          icon="account_balance_wallet"
        ></s-widget-header>

        <u-text-value-box
          class="max-width-field my-4"
          icon="person"
          label="User ID"
        >
          <template v-slot:value>
            <v-avatar :size="28" class="my-1">
              <v-img
                v-if="private_val && private_val.user_id"
                :src="getUserAvatar(private_val.user_id)"
              />
            </v-avatar>
          </template>
        </u-text-value-box>

        <u-text-value-box
          :value="private_val && private_val.wallet_id"
          class="max-width-field my-4"
          icon="account_balance_wallet"
          label="Wallet ID"
        >
        </u-text-value-box>

        <!-- -------------------------------- Dialog add wallet --------------------------- -->

        <b-gateway-blockchain
          v-model="private_val"
          :gateway="gateway"
          :shopGateway="shopGateway"
        ></b-gateway-blockchain>
      </template>

      <!-- █████████████████████ Normal mode █████████████████████ -->

      <template v-else-if="!gateway.blockchain">
        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Public Variables ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
        <div v-if="has_public" class="mb-5">
          <s-widget-header
            :title="$t('edit_gateway.public_keys')"
            icon="public"
          ></s-widget-header>

          <v-list-subheader>
            <!-- ▂▂▂▂▂▂▂▂▂▂ DIR Payment ▂▂▂▂▂▂▂▂▂▂ -->

            <div v-if="gateway.dir">
              You can customize the payment form by separating the label and
              value by two colons.<br />
              <i>custom field label</i
              ><b class="typo-body mx-1 font-weight-black text-black">::</b
              ><i>the field value</i>
            </div>
          </v-list-subheader>

          <v-form autocomplete="off">
            <div v-for="item in gateway.public" :key="item.name">
              <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Note ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
              <div
                v-if="item.type === 'note'"
                v-html="convertToHtml(item.title)"
              ></div>
              <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Inputs ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

              <v-text-field
                v-else
                v-model="public_val[item.name]"
                :label="item.title"
                :placeholder="item.hint"
                autocomplete="off"
                class="max-width-field-large mx-auto unicode-bidi-plaintext"
                color="blue"
                messages=" "
                variant="underlined"
              >
                <!-- ▂▂▂▂▂▂▂▂▂▂ DIR Payment ▂▂▂▂▂▂▂▂▂▂ -->
                <template v-if="gateway.dir" v-slot:message>
                  <!-- ▂▂▂▂▂▂▂▂▂▂ DIR Payment > QR Code ▂▂▂▂▂▂▂▂▂▂ -->

                  <div v-if="item.name === 'qr'">
                    <v-icon class="me-1" size="small">qr_code</v-icon>
                    The entered value will be shown as a QR code automatically.

                    <v-expand-transition>
                      <div v-if="public_val[item.name]">
                        <br />
                        <div v-if="public_val[item.name].includes('::')">
                          {{ extractLabel(public_val[item.name], item.title) }}:
                        </div>

                        <div class="text-center">
                          <u-qrcode
                            :options="{
                              width: 160,
                              color: { dark: '#333', light: '#FFFFFF00' },
                            }"
                            :value="extractValue(public_val[item.name])"
                          />
                        </div>
                      </div>
                    </v-expand-transition>
                  </div>
                  <!-- ▂▂▂▂▂▂▂▂▂▂ DIR Payment > Custom Label ▂▂▂▂▂▂▂▂▂▂ -->

                  <div
                    v-else-if="
                      public_val[item.name] &&
                      public_val[item.name].includes('::')
                    "
                  >
                    Label: <b>{{ extractLabel(public_val[item.name]) }}</b
                    ><br />
                    Value: <b>{{ extractValue(public_val[item.name]) }}</b
                    ><br />
                  </div>
                </template>
              </v-text-field>
            </div>
          </v-form>
        </div>

        <hr v-if="has_public && has_private" class="hr-dashed mb-5 op-0-3" />

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Private Variables ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
        <div v-if="has_private" class="mb-5">
          <s-widget-header
            :title="$t('edit_gateway.private_keys')"
            icon="admin_panel_settings"
          ></s-widget-header>

          <v-list-subheader></v-list-subheader>
          <v-form autocomplete="off">
            <v-text-field
              v-for="item in gateway.private"
              :key="item.name"
              v-model="private_val[item.name]"
              :append-inner-icon="
                visibility.includes(item.name) ? 'visibility_off' : 'visibility'
              "
              :label="item.title"
              :placeholder="item.hint"
              :type="visibility.includes(item.name) ? 'text' : 'password'"
              autocomplete="off"
              class="unicode-bidi-plaintext"
              color="green"
              variant="underlined"
              @click:append-inner="
                visibility.includes(item.name)
                  ? remove(visibility, item.name)
                  : visibility.push(item.name)
              "
            />
          </v-form>
        </div>
      </template>
    </div>

    <!-- █████████████████████ Limit █████████████████████ -->

    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('edit_gateway.limit.title')"
        icon="production_quantity_limits"
      ></s-widget-header>

      <v-list-subheader>{{
        $t("edit_gateway.limit.subtitle")
      }}</v-list-subheader>
      <u-price-input
        v-model="limit"
        :currency="gateway.currency"
        variant="underlined"
        :label="$t('edit_gateway.limit_input.title')"
        :messages="$t('edit_gateway.limit_input.msg')"
        prepend-inner-icon="shopping_bag"
      >
      </u-price-input>
    </div>

    <slot></slot>
    <!-- █████████████████████ Debug █████████████████████ -->

    <div
      v-if="gateway.debug"
      :class="{ '-amber': debug, '-green': !debug }"
      class="widget-box mb-5 border-top-medium"
    >
      <s-widget-header
        :title="$t('edit_gateway.developer_setting')"
        icon="code"
      ></s-widget-header>

      <v-list-subheader></v-list-subheader>
      <u-smart-switch
        v-model="debug"
        :color="debug ? 'amber' : 'success'"
        :false-description="$t('edit_gateway.live_mode_message')"
        :false-title="$t('global.commons.livemode')"
        :true-description="$t('edit_gateway.developer_message')"
        :true-title="$t('global.status.debug')"
        false-icon="monetization_on"
        inset
        true-icon="science"
      />
    </div>
  </div>
</template>

<script>
import BGatewayBlockchain from "../../gateway/blockchain/BGatewayBlockchain.vue";
import UTextValueBox from "../../../ui/text/value-box/UTextValueBox.vue";
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";
import InlineHelp from "../../help/InlineHelp.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import {
  FORM_BUILDER_TAGS,
  SmartConvertTextToHtml,
} from "@selldone/core-js/helper/html/HtmlHelper";
import { TrackSeller } from "@selldone/core-js/enums/gtag/TrackSeller";
import UPodsPanel from "../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../ui/pod/wire/UPodWire.vue";
import UPriceInput from "@selldone/components-vue/ui/price/input/UPriceInput.vue";

export default {
  name: "BGatewayAdd",
  components: {
    UPriceInput,
    UPodWire,
    UPodNode,
    UPodsPanel,
    USmartSwitch,
    InlineHelp,
    UCurrencyInput,
    UTextValueBox,
    BGatewayBlockchain,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    gateway: {
      required: true,
      type: Object,
    },

    shopGateway: {
      required: false,
      type: Object,
    },

    busySaving: {
      required: false,
      type: Boolean,
    },
    visiblePrivate: {
      required: false,
      type: Boolean,
    },
  },

  data: () => ({
    public_val: {},
    private_val: {},
    enable: true,
    manual: false,
    debug: false,
    busy_add: false,
    visibility: [],
    limit: 0,
  }),

  computed: {
    has_public() {
      return this.gateway.public && this.gateway.public.length;
    },
    has_private() {
      return this.gateway.private && this.gateway.private.length;
    },
  },

  watch: {
    shopGateway() {
      this.assignFromShopGateway();
    },
    busy_add(busy_add) {
      this.$emit("update:busySaving", busy_add);
    },
  },
  created() {
    this.assignFromShopGateway();

    if (this.visiblePrivate && this.gateway.private)
      this.gateway.private.forEach((it) => {
        this.visibility.push(it.name);
      });
  },

  methods: {
    convertToHtml(message) {
      let out = SmartConvertTextToHtml(
        message,
        false,
        false,
        FORM_BUILDER_TAGS,
      );

      out = out.replace("{shop_name}", this.shop.name);

      return out;
    },

    setGatewayToShop() {
      this.busy_add = true;

      axios
        .post(
          window.API.POST_SET_GATEWAY(
            this.$route.params.shop_id,
            this.gateway.code,
          ),
          {
            private: this.private_val,
            public: this.public_val,
            enable: this.enable,
            livemode: !this.debug,
            manual: this.manual,
            limit: this.limit,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              null,
              this.$t("edit_gateway.notifications.edit_success", {
                gateway_name: this.gateway.name,
              }),
            );

            this.$emit("add", data.shop_gateway);

            if (this.shopGateway) {
              this.shopGateway.public = data.shop_gateway.public;
              this.shopGateway.private = data.shop_gateway.private;
              this.shopGateway.enable = data.shop_gateway.enable;
              this.shopGateway.livemode = data.shop_gateway.livemode;
              this.shopGateway.manual = data.shop_gateway.manual;
              this.shopGateway.limit = data.shop_gateway.limit;
            }

            //┌─────────────── 🫐 Analytics 🫐 ───────────────┐
            TrackSeller.onAddGateway(this.gateway, data.shop_gateway);
            //└───────────────────────────────────────────────┘
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add = false;
        });
    },

    assignFromShopGateway() {
      if (!this.shopGateway) return;

      this.public_val = this.shopGateway.public;
      this.private_val = this.shopGateway.private;
      this.enable = this.shopGateway.enable;
      this.debug = !this.shopGateway.livemode;
      this.manual = this.shopGateway.manual;
      this.limit = this.shopGateway.limit;

      if (!this.public_val || Array.isArray(this.public_val))
        this.public_val = {};

      if (!this.private_val || Array.isArray(this.private_val))
        this.private_val = {};

      //  console.log('private_val',this.private_val)
    },

    /**
     * 🟡 Important: This function call externally!
     * Import from previous gateway.
     */
    importForm(pack) {
      // console.log('importForm',pack)
      this.gateway.public.forEach((item) => {
        //      console.log('item',item)
        this.public_val[item.name] = pack.public[item.name];
      });

      this.gateway.private.forEach((item) => {
        this.private_val[item.name] = pack.private[item.name];
      });

      // Force update:
      this.public_val = Object.assign({}, this.public_val);
      this.private_val = Object.assign({}, this.private_val);
    },

    extractLabel(val, def) {
      if (!val) return null;
      const arr = val.split("::");
      if (arr.length < 2) return def;
      return arr[0];
    },
    extractValue(val) {
      if (!val) return null;
      const arr = val.split("::");
      if (arr.length < 2) return val;
      arr.splice(0, 1);
      return arr.join("::");
    },
  },
};
</script>

<style lang="scss" scoped></style>
