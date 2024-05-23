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
    :class="{ '-activated': in_this_step }"
    class="widget shadow my-3 mx-1 mx-md-3"
  >
    <div class="d-flex align-center">
      <h2>
        <v-icon class="me-1" color="#111">precision_manufacturing</v-icon>
        {{ $t("process_center.preparing.title") }}
      </h2>

      <v-spacer></v-spacer>
    </div>

    <v-list-subheader class="px-0">
      <span v-html="$t('process_center.preparing.message')"></span>
    </v-list-subheader>

    <div class="text-start">
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Action ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-btn
        :class="{ disabled: !isActive }"
        :color="in_this_step ? 'primary' : '#000'"
        :loading="busy"
        :size="in_this_step || changed ? 'x-large' : undefined"
        :variant="!in_this_step && !changed ? 'outlined' : 'elevated'"
        class="tnt"
        rounded
        @click="preparingOrder"
      >
        <v-icon v-if="changed" start>assignment_turned_in</v-icon>

        <v-icon v-else-if="checked" start>check</v-icon>
        <v-icon v-else-if="in_this_step" class="blink-me" start
          >fiber_manual_record
        </v-icon>

        {{ $t("process_center.preparing.action") }}
      </v-btn>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Help ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <ul class="tips mt-4 text-muted">
        <li
          v-for="item in $tm('process_center.preparing.checklist')"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select Type ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-row v-if="show_inputs" no-gutters>
        <v-col v-if="!IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/" cols="12">
          <!-- Delivery Type -->

          <p class="mt-2 small text-muted">
            <v-icon size="small"> fa:fas fa-shipping-fast</v-icon>
            {{ $t("process_center.preparing.delivery_type") }}
          </p>
          <!--
          <transportation-select
            v-model="transportation"
            :transport-types="transportations"
            :shop-transportations="shop.transportations"
            :readonly="!isActive"
          ></transportation-select>-->

          <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Select Type ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
          <u-smart-select
            v-model="transportation"
            :items="transportation_items"
            :readonly="!isActive"
            border
            class="my-5"
            item-description="desc"
            item-image="image"
            item-text="title"
            item-value="value"
            rounded
          >
            <template v-slot:append-title="{ item }">
              <v-chip
                v-if="item.transportation?.distance"
                class="ma-1"
                label
                size="x-small"
                variant="plain"
              >
                {{ $t("global.commons.distance") }}:
                {{ item.transportation.distance }} {{ distance_unit }}
              </v-chip>
              <v-chip
                v-if="item.transportation?.max_weight"
                class="ma-1"
                label
                size="x-small"
                variant="plain"
              >
                {{ $t("global.commons.weight") }}:
                {{ item.transportation.max_weight }} {{ mass_unit }}
              </v-chip>

              <v-chip
                v-if="item.transportation?.max_w"
                class="ma-1"
                label
                size="x-small"
                variant="plain"
              >
                {{ $t("global.commons.width") }}:
                {{ item.transportation.max_w }} {{ size_unit }}
              </v-chip>
              <v-chip
                v-if="item.transportation?.max_l"
                class="ma-1"
                label
                size="x-small"
                variant="plain"
              >
                {{ $t("global.commons.length") }}:
                {{ item.transportation.max_l }} {{ size_unit }}
              </v-chip>
              <v-chip
                v-if="item.transportation?.max_h"
                class="ma-1"
                label
                size="x-small"
                variant="plain"
              >
                {{ $t("global.commons.height") }}:
                {{ item.transportation.max_h }} {{ size_unit }}
              </v-chip>
            </template>

            <template v-slot:description="{ item }">
              <div class="d-flex align-center">
                <!-- Services -->

                <div
                  v-if="
                    item.info &&
                    item.info.service_ids &&
                    Array.isArray(item.info.service_ids)
                  "
                  class="flex-grow-1"
                >
                  <s-dense-images-circles
                    :images="
                      item.info.service_ids.map((k) =>
                        getDeliveryServiceIcon(k),
                      )
                    "
                    :limit="20"
                    color="#673AB7"
                    title="Active services"
                  ></s-dense-images-circles>
                </div>

                <!-- Couriers -->

                <div
                  v-if="
                    item.info &&
                    item.info.user_ids &&
                    Array.isArray(item.info.user_ids)
                  "
                  class="flex-grow-1"
                >
                  <u-dense-circles-users
                    :ids="item.info.user_ids"
                    :limit="20"
                    color="#FFA000"
                    title="Active couriers"
                  ></u-dense-circles-users>
                </div>
              </div>
            </template>
          </u-smart-select>
        </v-col>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Weight ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-col class="border-end-grater-md p-2" cols="12" md="4">
          <p class="mt-2 small text-muted">
            <v-icon size="small"> fa:fas fa-weight-hanging</v-icon>
            {{ $t("process_center.preparing.packing_weight") }}
          </p>

          <u-number-input
            v-model="weight"
            :decimal="3"
            :label="$t('product_extra_physical.weight')"
            :messages="
              $t('process_center.preparing.packing_weight', {
                weight: total_items_weight,
                unit: mass_unit,
              })
            "
            :min="total_items_weight"
            :readonly="!isActive"
            :suffix="mass_unit"
            class="my-3 max-w-250 mx-auto"
          />

          <div v-if="!IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/" class="mt-5">
            <v-alert
              :model-value="distance_warning"
              class="small mb-2"
              color="#F57C00"
              density="compact"
              variant="tonal"
            >
              <v-icon start>fa:fas fa-compass</v-icon>
              {{ $t("process_center.preparing.distance_warning") }}
              <v-chip
                class="ma-1"
                color="#E64A19"
                label
                size="x-small"
                variant="flat"
                >Max: {{ shop_transportation.distance }} {{ distance_unit }}
              </v-chip>
            </v-alert>
            <v-alert
              :model-value="weight_warning"
              class="small mb-2"
              color="#F57C00"
              density="compact"
              variant="tonal"
            >
              <v-icon start>fa:fas fa-weight-hanging</v-icon>
              {{ $t("process_center.preparing.weight_warning") }}
              <v-chip
                class="ma-1"
                color="#E64A19"
                label
                size="x-small"
                variant="flat"
                >Max: {{ shop_transportation.max_weight }} {{ mass_unit }}
              </v-chip>
            </v-alert>
            <v-alert
              :model-value="volume_warning"
              class="small mb-2"
              color="#F57C00"
              density="compact"
              variant="tonal"
            >
              <v-icon start>fa:fas fa-ruler-combined</v-icon>

              {{ $t("process_center.preparing.volume_warning") }}
              <v-chip
                class="ma-1"
                color="#E64A19"
                label
                size="x-small"
                variant="flat"
                >Max w: {{ shop_transportation.max_w }} {{ size_unit }}
              </v-chip>
              <v-chip
                class="ma-1"
                color="#E64A19"
                label
                size="x-small"
                variant="flat"
                >Max l: {{ shop_transportation.max_l }} {{ size_unit }}
              </v-chip>
              <v-chip
                class="ma-1"
                color="#E64A19"
                label
                size="x-small"
                variant="flat"
                >Max h: {{ shop_transportation.max_h }} {{ size_unit }}
              </v-chip>
            </v-alert>
          </div>
        </v-col>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Size ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-col class="border-end-grater-md p-2" cols="12" md="4">
          <p class="mt-2 small text-muted">
            <v-icon size="small"> fa:fas fa-box</v-icon>
            {{ $t("process_center.preparing.packing_size") }}
          </p>

          <u-number-input
            v-model="width"
            :label="$t('product_extra_physical.width')"
            :min="0"
            :readonly="!isActive"
            :step="10"
            :suffix="size_unit"
            class="my-3 max-w-250 mx-auto"
          />

          <u-number-input
            v-model="length"
            :label="$t('product_extra_physical.length')"
            :min="0"
            :readonly="!isActive"
            :step="10"
            :suffix="size_unit"
            class="my-3 max-w-250 mx-auto"
          />

          <u-number-input
            v-model="height"
            :label="$t('product_extra_physical.height')"
            :min="0"
            :readonly="!isActive"
            :step="10"
            :suffix="size_unit"
            class="my-3 max-w-250 mx-auto"
          />
        </v-col>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 3D Box ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-col
          class="p-2 position-relative d-flex justify-center align-items-center"
          cols="12"
          md="4"
        >
          <u-cube v-if="has_box_size" :x="width" :y="length" :z="height" />
          <p
            v-else
            class="position-absolute center-absolute text-muted m-0 text-uppercase"
          >
            {{ $t("global.commons.no_data") }}!
          </p>
        </v-col>
      </v-row>
      <div v-else class="pa-3 my-12 typo-body text-muted text-center">
        {{ $t("process_center.preparing.not_available_message") }}
      </div>
    </div>
  </div>
</template>

<script>
import { PhysicalOrderStates } from "@selldone/core-js/enums/basket/PhysicalOrderStates";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import UCube from "../../../../ui/cube/UCube.vue";
import { BasketStatus } from "@selldone/core-js/enums/basket/status/BasketStatus";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { BasketHelper } from "@selldone/core-js/helper/shop/BasketHelper";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import UDenseCirclesUsers from "../../../../ui/dense-circles/users/UDenseCirclesUsers.vue";
import SDenseImagesCircles from "../../../../ui/image/SDenseImagesCircles.vue";

export default {
  name: "BOrderDashboardPreparing",
  components: {
    SDenseImagesCircles,
    UDenseCirclesUsers,
    USmartSelect,
    UCube,
    UNumberInput,
  },
  emits: ["confirm-preparing"],
  props: {
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },
    isRolePanel: Boolean,
  },

  data: function () {
    return {
      PhysicalOrderStates: PhysicalOrderStates,
      busy: false,

      //------------------------
      transportation: null,

      weight: null,

      width: null,
      length: null,
      height: null,
    };
  },
  watch: {
    /* transportation(transportation) {
      this.delivery_info.type =transportation;
    },*/

    delivery_info() {
      this.loadData();
    },
  },

  computed: {
    has_delivery() {
      return ShopOptionsHelper.AskShippingAddress(
        this.shop,
        this.basket.type,
      ); /*Maybe disabled by seller for physical / service orders*/
    },
    show_inputs() {
      return (
        this.has_delivery ||
        (!!this.basket.receiver_info &&
          this.basket.receiver_info.address &&
          !!this.delivery_info)
      );
    },

    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.shop);
    },

    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.shop);
    },

    distance_unit() {
      return "km";
    },

    changed() {
      return (
        this.width !== this.delivery_info.volume.width ||
        this.length !== this.delivery_info.volume.length ||
        this.height !== this.delivery_info.volume.height ||
        this.weight !== this.delivery_info.weight ||
        this.transportation !== this.delivery_info.type
      );
    },

    checked() {
      return [
        PhysicalOrderStates.PreparingOrder.code,
        PhysicalOrderStates.SentOrder.code,
        PhysicalOrderStates.ToCustomer.code,
      ].includes(this.basket.delivery_state);
    },
    in_this_step() {
      return (
        this.basket.delivery_state === PhysicalOrderStates.OrderConfirm.code
      );
    },

    has_box_size() {
      return this.width > 0 && this.length > 0 && this.height > 0;
    },
    isActive() {
      return (
        this.basket.delivery_state === PhysicalOrderStates.OrderConfirm.code ||
        this.basket.delivery_state === PhysicalOrderStates.PreparingOrder.code
      );
    },

    delivery_info() {
      return this.basket.delivery_info ? this.basket.delivery_info : {};
    },

    is_cod() {
      return this.basket.status === BasketStatus.COD.code;
    },

    distance() {
      return this.delivery_info.distance;
    },
    /*
    weight() {
      return this.delivery_info.weight;
    },*/
    /*  volume() {
      return this.delivery_info.volume;
    },*/
    /* width() {
      return this.volume?this.volume.width:0;
    },


    length() {
      return this.volume?this.volume.length:0;
    },


    height() {
      return this.volume?this.volume.height:0;
    },*/

    shop_transportation() {
      if (!this.transportation) return null;
      return this.findShopTransportation(this.transportation);
    },
    distance_warning() {
      return (
        this.shop_transportation &&
        this.shop_transportation.distance < this.distance
      );
    },
    volume_warning() {
      return (
        this.shop_transportation &&
        (this.shop_transportation.max_w < this.width ||
          this.shop_transportation.max_h < this.height ||
          this.shop_transportation.max_l < this.length)
      );
    },
    weight_warning() {
      return (
        this.shop_transportation &&
        this.shop_transportation.max_weight < this.weight
      );
    },
    /*
    transportations() {
      if (!this.shop.transportations) return [];
      const out = [];
      // Show only eligible transportation types for this order:
      this.shop.transportations.forEach((transportation) => {
        if (transportation.enable && (!this.is_cod || transportation.cod))
          out.push(transportation.type);
      });
      return out;
    },*/
    transportation_items() {
      let out = [];
      this.shop.transportations.forEach((t) => {
        const obj = ShopTransportations[t.type];

        out.push({
          value: t.type,
          title: t.title ? t.title : this.$t(obj.name),
          desc: this.$t(obj.description),
          image: t.logo ? this.getShopImagePath(t.logo) : obj.icon,
          info: t.info,
          transportation: t,
        });
      });

      return out;
    },

    total_items_weight() {
      return BasketHelper.GetTotalBasketItemsWeight(this.basket);
    },
  },
  methods: {
    findShopTransportation(type) {
      return (
        this.shop.transportations &&
        this.shop.transportations.find((it) => it.type === type)
      );
    },
    preparingOrder() {
      this.busy = true;

      // Assign new values here:
      const delivery_info = Object.assign({}, this.delivery_info);
      delivery_info.weight = this.weight;

      delivery_info.volume = {
        width: this.width,
        length: this.length,
        height: this.height,
      };
      delivery_info.type = this.transportation;

      this.$emit("confirm-preparing", {
        delivery_info: delivery_info,
        callback: () => {
          this.busy = false;
        },
      });
      //this.updateState(this.PhysicalOrderStates.PreparingOrder.code, false);
    },
    loadData() {
      if (!this.delivery_info.volume) this.delivery_info.volume = {};

      this.transportation = this.delivery_info.type;

      this.weight = this.delivery_info.weight;

      this.width = this.delivery_info.volume.width;
      this.length = this.delivery_info.volume.length;
      this.height = this.delivery_info.volume.height;
    },
  },
  created() {
    this.loadData();
  },
};
</script>

<style scoped></style>
