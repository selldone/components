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
  <div class="b-gateway-add sd-modern-form text-start">
    <section class="sd-modern-widget mb-5">
      <u-widget-header
        :title="$t('edit_gateway.status_title')"
        icon="tune"
        class="sd-modern-form-header"
      ></u-widget-header>

      <dl class="sd-modern-form-meta">
        <div>
          <dt class="sd-modern-eyebrow">{{ $t("global.commons.currency") }}</dt>
          <dd>
            <u-currency-icon :currency="gateway.currency" flag-only small />{{
              gateway.currency
            }}
          </dd>
        </div>
        <div>
          <dt class="sd-modern-eyebrow">
            {{ $t("edit_gateway.gateway_code") }}
          </dt>
          <dd>
            <code>{{ gateway.code }}</code>
          </dd>
        </div>
      </dl>

      <p class="sd-modern-subtitle mb-4">
        {{ $t("edit_gateway.status_message") }}
      </p>

      <u-smart-switch
        v-model="enable"
        :false-title="$t('global.inactive')"
        :true-title="$t('global.active')"
        class="my-3"
        false-gray
        false-icon="credit_card_off"
        :true-description="$t('edit_gateway.status_true_description')"
        true-icon="check_circle"
      />

      <section v-if="gateway.manual" class="sd-modern-form-group">
        <u-widget-header
          :title="$t('edit_gateway.manual_title')"
          icon="done_all"
          class="sd-modern-form-header"
        >
        </u-widget-header>

        <p class="sd-modern-subtitle">
          {{ $t("edit_gateway.manual_message") }}
        </p>

        <u-pods-panel :disabled="!enable" dense class="b-gateway-add__flow">
          <u-pod-node
            icon="shopping_bag"
            icon-color="rgb(var(--v-theme-on-surface))"
            :title="$t('edit_gateway.modern.flow_payment')"
            title-icon="person"
          ></u-pod-node>
          <u-pod-wire forward></u-pod-wire>

          <template v-if="manual">
            <u-pod-node
              :image="getUserAvatar(USER_ID())"
              :title="$t('edit_gateway.modern.flow_you')"
              title-icon="hourglass_empty"
            ></u-pod-node>
            <u-pod-wire forward></u-pod-wire>
          </template>

          <u-pod-node
            :icon="manual ? 'price_check' : 'bolt'"
            icon-color="rgb(var(--v-theme-on-surface))"
            :title="
              $t(
                manual
                  ? 'edit_gateway.modern.flow_confirm'
                  : 'edit_gateway.modern.flow_auto',
              )
            "
          ></u-pod-node>
        </u-pods-panel>

        <div class="sd-modern-subtitle b-gateway-add__hold-types">
          {{ $t("edit_gateway.hold_only_for") }}:

          <v-chip class="ma-1" variant="tonal" label size="small"
            ><img
              :src="ProductType.PHYSICAL.image"
              class="me-1 ms-n1"
              height="16"
              width="16"
            />{{ $t(ProductType.PHYSICAL.name) }}
          </v-chip>
          <v-chip class="ma-1" variant="tonal" label size="small"
            ><img
              :src="ProductType.SERVICE.image"
              class="me-1 ms-n1"
              height="16"
              width="16"
            />{{ $t(ProductType.SERVICE.name) }}
          </v-chip>
        </div>

        <u-smart-switch
          v-model="manual"
          :disabled="!enable"
          class="my-3"
          :false-description="$t('edit_gateway.manual_input.false_description')"
          false-icon="published_with_changes"
          :false-title="$t('edit_gateway.manual_input.false_title')"
          :true-description="$t('edit_gateway.manual_input.true_description')"
          true-icon="hourglass_empty"
          :true-title="$t('edit_gateway.manual_input.true_title')"
        />
      </section>
    </section>

    <!-- █████████████████████ Environment █████████████████████ -->

    <section v-if="gateway.debug" class="sd-modern-widget mb-5">
      <u-widget-header
        :title="$t('edit_gateway.modern.environment_title')"
        icon="science"
        class="sd-modern-form-header"
      ></u-widget-header>
      <p class="sd-modern-subtitle mb-4">
        {{ $t("edit_gateway.debug.subtitle") }}
      </p>
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
    </section>

    <section
      v-if="
        gateway.blockchain ||
        (gateway.public && gateway.public.length) ||
        (gateway.private && gateway.private.length)
      "
      class="sd-modern-widget b-gateway-add__credentials mb-5"
    >
      <u-widget-header
        :title="$t('b_gateway_overview.modern.keys_title')"
        icon="key"
        class="sd-modern-form-header"
      />
      <p class="sd-modern-subtitle mb-6">
        {{ $t("edit_gateway.modern.credentials_description") }}
      </p>
      <!-- █████████████████████ Blockchain mode █████████████████████ -->

      <!--<template v-if="gateway.blockchain && shopGateway">
        <u-widget-header
          :title="$t('edit_gateway.wallet')"
          icon="account_balance_wallet"
        ></u-widget-header>

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

      -------------------------------- Dialog add wallet --------------------------

        <b-gateway-blockchain
          v-model="private_val"
          :gateway="gateway"
          :shopGateway="shopGateway"
        ></b-gateway-blockchain>
      </template>-->

      <!-- █████████████████████ Normal mode █████████████████████ -->

      <!--  <template v-else-if="!gateway.blockchain">-->
      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Public Variables ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
      <div v-if="has_public" class="mb-5">
        <h3 class="sd-modern-eyebrow d-flex align-center ga-2">
          <v-icon size="16" aria-hidden="true">public</v-icon
          >{{ $t("edit_gateway.public_keys") }}
        </h3>

        <div v-if="gateway.dir" class="sd-modern-subtitle mb-4">
          <!-- ▂▂▂▂▂▂▂▂▂▂ DIR Payment ▂▂▂▂▂▂▂▂▂▂ -->

          <div>
            You can customize the payment form by separating the label and value
            by two colons.<br />
            <i>custom field label</i
            ><b class="typo-body mx-1 font-weight-black text-black">::</b
            ><i>the field value</i>
          </div>
        </div>

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
              :messages="item.hint || ' '"
              hide-details="auto"
              autocomplete="off"
              class="b-gateway-add__field unicode-bidi-plaintext"
              color="blue"
              variant="underlined"
            >
              <!-- ▂▂▂▂▂▂▂▂▂▂ DIR Payment ▂▂▂▂▂▂▂▂▂▂ -->
              <template v-if="gateway.dir" v-slot:message="{ message }">
                <div>{{ message }}</div>
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

      <hr v-if="has_public && has_private" class="b-gateway-add__divider" />

      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Private Variables ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
      <div v-if="has_private" class="mb-5">
        <h3 class="sd-modern-eyebrow d-flex align-center ga-2">
          <v-icon size="16" aria-hidden="true">lock_outline</v-icon
          >{{ $t("edit_gateway.private_keys") }}
        </h3>

        <v-form autocomplete="off">
          <v-text-field
            v-for="item in gateway.private"
            :key="item.name"
            v-model="private_val[item.name]"
            :append-inner-icon="
              visibility.includes(item.name) ? 'visibility_off' : 'visibility'
            "
            :label="item.title"
            :messages="item.hint || []"
            hide-details="auto"
            :type="visibility.includes(item.name) ? 'text' : 'password'"
            autocomplete="off"
            class="b-gateway-add__field unicode-bidi-plaintext"
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
      <!-- </template>-->
    </section>

    <!-- █████████████████████ Limit █████████████████████ -->

    <section class="sd-modern-widget mb-5">
      <u-widget-header
        :title="$t('edit_gateway.limit.title')"
        icon="production_quantity_limits"
        class="sd-modern-form-header"
      ></u-widget-header>

      <p class="sd-modern-subtitle mb-4">
        {{ $t("edit_gateway.limit.subtitle") }}
      </p>
      <u-price-input
        v-model="limit"
        :currency="gateway.currency"
        variant="underlined"
        :label="$t('edit_gateway.limit_input.title')"
        :messages="$t('edit_gateway.limit_input.msg')"
        prepend-inner-icon="shopping_bag"
      >
      </u-price-input>
    </section>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import BGatewayBlockchain from "../../gateway/blockchain/BGatewayBlockchain.vue";
import UTextValueBox from "../../../ui/text/value-box/UTextValueBox.vue";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
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
import { ProductType } from "@selldone/core-js/enums/product/ProductType.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BGatewayAdd",
  mixins: [],
  components: {
    UPriceInput,
    UPodWire,
    UPodNode,
    UPodsPanel,
    USmartSwitch,
    UCurrencyIcon,
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
    ProductType: ProductType,

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
            NotificationService.showSuccessAlert(
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
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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

<style lang="scss" scoped>
.b-gateway-add {
  &__field {
    margin-block-start: 16px;
  }

  &__divider {
    margin-block: 28px;
    border: 0;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  &__flow {
    min-width: 0;
    margin-inline: 0 !important;
    padding: 28px 8px !important;
    overflow-x: auto;

    :deep(.pod) {
      flex-shrink: 0;
      background: rgb(var(--v-theme-surface));
      --pod-shadow: 0 4px 16px rgba(var(--v-theme-on-surface), 0.08);
    }

    :deep(.pod small) {
      white-space: normal;
      max-width: 100%;
      flex-shrink: 0;
      overflow: visible;
      text-overflow: clip;
      font-size: 11px;
      line-height: 1.2;
    }

    :deep(.pod-icon),
    :deep(.pod-img) {
      flex-shrink: 0;
    }
  }

  &__hold-types {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    margin-block-end: 16px;
  }

  @media (max-width: 599px) {
    &__flow {
      padding-inline: 4px !important;

      :deep(.pod) {
        --pod-size: 68px;
        --pod-icon-size: 20px;
        padding: 4px;
      }

      :deep(.min-width-50) {
        min-width: 16px !important;
      }
    }
  }
}
</style>
