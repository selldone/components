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
  <div class="s--storefront-avocado-customer-order-form">
    <!-- ................ Show Avocado Details ................ -->
    <div class="text-start">
      <h1>{{ shop_avocado.title }}</h1>
      <p class="text-subtitle-2 my-1">{{ shop_avocado.message }}</p>

      <small :title="getLocalTimeString(avocado.updated_at)">
        {{ $t("avocado.last_update") }}:
        {{ getFromNowString(avocado.updated_at) }}</small
      >
      <hr />

      <p class="text-subtitle-2 my-1">
        {{ $t("avocado.step1") }}
      </p>

      <div class="border p-2 rounded-28px mt-2 bg-light">
        <v-text-field
          v-model="title"
          :label="$t('global.commons.title')"
          :placeholder="$t('avocado.title_plc')"
          class="mt-5"
        >
        </v-text-field>

        <v-textarea
          v-model="message"
          :label="$t('global.commons.description')"
          :placeholder="$t('avocado.description_plc')"
          auto-grow
          rows="2"
        >
        </v-textarea>

        <v-text-field
          v-model="link"
          :label="$t('global.commons.link')"
          :placeholder="$t('avocado.link_plc')"
          append-inner-icon="link"
        >
        </v-text-field>

        <v-file-input
          v-model="selected_file"
          :label="$t('avocado.image')"
          :messages="$t('avocado.image_msg')"
          accept="image/*"
          append-inner-icon="image"
          prepend-icon=""
        />

        <u-number-input
          v-model="count"
          :label="$t('global.commons.count')"
          :min="1"
          class="mt-5"
          show-buttons
        >
        </u-number-input>

        <div class="widget-buttons">
          <v-btn
            :class="{ disabled: !title && !message && !link }"
            :loading="busy_save_items"
            class="-add-btn"
            color="success"
            dark
            rounded
            size="x-large"
            @click="addItem()"
          >
            <v-icon class="me-1" size="small">add</v-icon>
            {{ $t("avocado.add_item") }}
          </v-btn>
        </div>
      </div>

      <p class="mb-0 mt-4 text-subtitle-2">{{ $t("avocado.items_list") }}:</p>
      <s-shop-avocado-customer-order-items
        :avocado="avocado"
        :items="items"
        class="my-5"
      >
      </s-shop-avocado-customer-order-items>

      <div v-if="need_address" class="mb-12">
        <div v-if="!address_entered" class="widget-buttons">
          <v-btn
            class="-delivery-btn"
            color="#03A9F4"
            dark
            rounded
            size="x-large"
            @click="showMapSelect"
          >
            <v-icon class="me-1 blink-me" size="small">lens</v-icon>
            {{ $t("global.commons.select_address") }}
          </v-btn>
        </div>

        <div v-else>
          <s-shop-customer-receiver-info-widget
            :receiver-info="avocado.receiver_info"
            @show:detail="
              () => {
                startup_mode_map_dialog = 'detail';
                showMapSelect();
              }
            "
            @show:map="
              startup_mode_map_dialog = 'default';
              showMapSelect();
            "
          ></s-shop-customer-receiver-info-widget>
        </div>
      </div>

      <div v-if="!need_address || address_entered">
        <u-currency-input
          v-if="shop.currencies.length > 1"
          v-model="avocado.currency"
          :label="$t('global.commons.currency')"
          :messages="$t('avocado.currency_msg')"
          :return-object="false"
          :shop="shop"
          class="my-5"
          dense
        >
        </u-currency-input>

        <p class="text-subtitle-2 mb-3">
          {{ $t("avocado.step2") }}
        </p>

        <div class="widget-buttons">
          <v-btn
            :class="{ disabled: !can_submit }"
            :loading="busy_submit"
            class="-delivery-btn"
            color="#03A9F4"
            rounded
            size="x-large"
            @click="reserveAvocado"
          >
            <v-icon v-if="can_submit" class="me-1 blink-me" size="small"
              >lens
            </v-icon>
            {{ $t("avocado.order_action") }}
          </v-btn>
        </div>
      </div>
      <div v-else>
        <v-icon class="me-1">tips_and_updates</v-icon>
        {{ $t("avocado.select_address_message") }}
      </div>
    </div>

    <v-progress-linear
      v-if="busy_save"
      class="loader-to-bar"
      color="success"
      indeterminate
    ></v-progress-linear>
  </div>
</template>

<script>
import SShopAvocadoCustomerOrderItems from "./SShopAvocadoCustomerOrderItems.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import SShopCustomerReceiverInfoWidget from "../delivery/SShopCustomerReceiverInfoWidget.vue";
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";

export default {
  name: "SStorefrontAvocadoCustomerOrderForm",
  components: {
    UCurrencyInput,
    SShopCustomerReceiverInfoWidget,
    UNumberInput,
    SShopAvocadoCustomerOrderItems,
  },
  props: {
    shop: { required: true },
    avocado: { required: true },
  },

  data: () => ({
    //-----------------------
    startup_mode_map_dialog: "default",
    center: { lat: 35.715298, lng: 51.404343 },
    map_location: {},

    //-----------------------
    busy_save_items: false,
    title: null,
    message: null,
    link: null,
    count: 1,
    selected_file: [],

    //-----------------------
    busy_submit: false,

    //-----------------------
    busy_save: false,

    random: 0,
  }),
  computed: {
    shop_avocado() {
      return this.shop.avocado ? this.shop.avocado : {};
    },

    items() {
      return this.avocado.items;
    },

    address_entered() {
      const random = this.random; // Force update!
      return this.avocado.receiver_info && this.avocado.receiver_info.address;
    },
    need_address() {
      return this.shop_avocado.delivery || this.avocado.delivery;
    },

    user() {
      return this.$store.getters.getUser;
    },
    can_submit() {
      return (
        !this.busy_save &&
        this.items &&
        this.items.length &&
        (this.address_entered || !this.need_address)
      );
    },
  },

  methods: {
    showMapSelect() {
      if (this.avocado.receiver_info && this.avocado.receiver_info.location) {
        this.center = {
          lat: this.avocado.receiver_info.location.lat,
          lng: this.avocado.receiver_info.location.lng,
        };
      }
      if (this.avocado.receiver_info) {
        this.map_location = Object.assign({}, this.avocado.receiver_info);
      }

      this.showMap(
        this.center,
        this.startup_mode_map_dialog,
        this.map_location,
        this.onClickSetLocation,
        false,
      );
    },

    onClickSetLocation(info) {
      //  console.log("info", info);

      if (!info.phone && this.user) info.phone = this.user.phone; // Auto fill phone!

      // this.avocado.receiver_info = info;

      this.closeMap();
      this.saveInfo(info);

      this.$forceUpdate();
    },
    saveInfo(info) {
      this.busy_save = true;

      window.$storefront.avocado
        .updateReceiverInfo(this.avocado.hash, info)
        .then(({ avocado }) => {
          this.avocado.receiver_info = avocado.receiver_info;
          this.random = Math.random();

          this.$forceUpdate();
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    addItem() {
      this.busy_save_items = true;

      window.$storefront.avocado
        .addItem(
          this.avocado.hash,
          this.title,
          this.message,
          this.link,
          this.selected_file?.length ? this.selected_file[0] : null,
          this.count,
        )

        .then(({ item }) => {
          this.AddOrUpdateItemByID(this.avocado.items, item);

          this.title = null;
          this.message = null;
          this.link = null;
          this.selected_file = [];
          this.count = 1;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save_items = false;
        });
    },

    reserveAvocado() {
      this.busy_submit = true;

      window.$storefront.avocado
        .submitOrder(this.avocado.hash, this.avocado.currency)
        .then(({ avocado }) => {
          this.$emit("add", avocado);

          this.showSuccessAlert(
            null,
            this.$t("avocado.notifications.order_success"),
          );
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_submit = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--storefront-avocado-customer-order-form {
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--storefront-avocado-customer-order-form {
}
</style>
