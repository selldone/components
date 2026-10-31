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
    :class="
      modern
        ? [
            'sd-modern-widget b-order-preparation-modern',
            { 'b-order-preparation-modern--compact': compactShipping },
            { 'b-order-preparation-modern--vendor': modernVendorPanel },
          ]
        : {
            '-activated': in_this_step,
            'widget shadow my-3 mx-1 mx-md-3': true,
          }
    "
    class="text-start"
  >
    <u-widget-header
      :icon="modernVendorPanel ? undefined : modern ? 'inventory_2' : 'precision_manufacturing'"
      :class="{
        'sd-modern-form-header b-order-preparation-modern__header': modern,
      }"
      :title="$t('process_center.preparing.title')"
    >
      <template v-if="modernVendorPanel" #icon><b-vendor-order-icon name="package" :size="20" class="b-order-preparation-modern__vendor-heading-icon" /></template>
      <template v-if="modernVendorPanel && show_inputs && !vendorPackageWarning" #actions>
        <button type="button" class="b-order-preparation-modern__vendor-toggle" :aria-expanded="vendorPackageExpanded" @click="vendor_package_expanded = !vendorPackageExpanded"><b-vendor-order-icon name="chevron-down" :size="16" :class="{ 'rotate-180': vendorPackageExpanded }" />{{ $t(vendorPackageExpanded ? 'vendor_fulfillment.hide_preparation' : 'vendor_fulfillment.show_preparation') }}</button>
      </template>
      <template
        v-if="
          modern && !modernVendorPanel &&
          basket.delivery_state === PhysicalOrderStates.CheckQueue.code
        "
        #append-actions
      >
        <span class="b-order-preparation-modern__stage">{{
          $t("process_center.modern.preparation_pending")
        }}</span>
      </template>
    </u-widget-header>

    <p
      v-if="modern"
      class="sd-modern-subtitle b-order-preparation-modern__subtitle"
    >
      <span>{{
        $t(
          isModernFulfillment
            ? "process_center.modern.fulfillment_preparation_subtitle"
            : compactShipping
            ? "process_center.modern.subscription_preparation_subtitle"
            : "process_center.modern.preparation_subtitle",
        )
      }}</span>
      <v-tooltip
        location="top"
        content-class="sd-modern-tooltip text-start"
        :open-on-click="true"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :icon="modernVendorPanel ? true : 'info_outline'"
            variant="text"
            class="sd-modern-icon-button sd-modern-info-button b-order-preparation-modern__help"
            :aria-label="$t('process_center.modern.preparation_help')"
          ><b-vendor-order-icon v-if="modernVendorPanel" name="info" :size="14" /></v-btn>
        </template>
        {{ $tm("process_center.preparing.checklist").join(" ") }}
      </v-tooltip>
    </p>
    <v-list-subheader v-else class="px-0">
      <span v-html="$t('process_center.preparing.message')"></span>
    </v-list-subheader>

    <div
      class="text-start"
      :class="{ 'b-order-preparation-modern__body': modern }"
    >
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Action ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-btn
        :class="{
          disabled: !isActive,
          'sd-modern-button b-order-preparation-modern__action': modern,
          'sd-modern-button--x-large':
            modern && in_this_step && !is_ready_action_disabled,
          'sd-modern-button--primary': modernVendorPanel && in_this_step && !is_ready_action_disabled,
        }"
        :disabled="is_ready_action_disabled"
        :color="
          modern
            ? in_this_step && !is_ready_action_disabled
              ? 'primary'
              : undefined
            : in_this_step
              ? 'primary'
              : '#000'
        "
        :loading="busy"
        :size="
          (
            modern
              ? in_this_step && !is_ready_action_disabled
              : in_this_step || changed
          )
            ? 'x-large'
            : undefined
        "
        :variant="
          modern
            ? in_this_step && !is_ready_action_disabled
              ? 'flat'
              : 'outlined'
            : !in_this_step && !changed
              ? 'outlined'
              : 'elevated'
        "
        class="tnt"
        rounded
        @click="preparingOrder"
      >
        <b-vendor-order-icon v-if="modernVendorPanel" :name="checked ? 'save' : 'package-check'" :size="in_this_step && !is_ready_action_disabled ? 20 : 16" class="me-2" />
        <v-icon v-else-if="modern" start>{{
          compactShipping && checked ? "save" : "inventory"
        }}</v-icon>
        <v-icon v-else-if="changed" start>assignment_turned_in</v-icon>

        <v-icon v-else-if="checked" start>check</v-icon>
        <v-icon v-else-if="in_this_step" :class="{ 'blink-me': !modern }" start
          >fiber_manual_record
        </v-icon>

        {{
          $t(
            modern
              ? (compactShipping || modernVendorPanel) && checked
                ? "process_center.basket_list.apply_change_action"
                : "process_center.modern.ready_action"
              : "process_center.preparing.action",
          )
        }}
      </v-btn>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Help ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <ul v-if="!modern" class="tips mt-4 text-muted">
        <li
          v-for="item in $tm('process_center.preparing.checklist')"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select Type ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-row
        v-if="show_inputs"
        v-show="!modernVendorPanel || vendorPackageExpanded"
        :class="{ 'b-order-preparation-modern__grid': modern }"
        no-gutters
      >
        <div
          :class="{ 'b-order-preparation-modern__column': modern }"
          :style="modern ? undefined : 'display: contents'"
        >
          <v-col
            v-if="has_shipping_services"
            :class="{ 'b-order-preparation-modern__method': modern }"
            style="padding: 0"
            cols="12"
          >
            <!-- Delivery Type -->

            <p class="mt-2 small text-muted">
              <b-vendor-order-icon v-if="modernVendorPanel" name="truck" :size="16" class="me-1" /><v-icon v-else size="small">{{
                modern ? "local_shipping" : "fa:fas fa-shipping-fast"
              }}</v-icon>
              {{ $t("process_center.preparing.delivery_type") }}
            </p>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Select Type ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
            <v-select
              v-if="modern && compactShipping"
              v-model="transportation"
              :items="transportation_items"
              :disabled="is_ready_action_disabled"
              :aria-label="$t('process_center.preparing.delivery_type')"
              :placeholder="
                $t('process_center.modern.subscription_shipping_placeholder')
              "
              :menu-props="{
                contentClass: 'sd-modern-select-menu text-start',
                maxHeight: 420,
              }"
              class="sd-modern-underlined-field b-order-preparation-modern__compact-method"
              item-title="title"
              item-value="value"
              variant="underlined"
              clearable
              hide-details
              single-line
            >
              <template #selection="{ item }">
                <img
                  :src="item.raw.image"
                  width="20"
                  height="20"
                  alt=""
                  class="me-2"
                />
                <span>{{ item.raw.title }}</span>
              </template>
              <template #item="{ item, props }">
                <v-list-item
                  v-bind="props"
                  class="text-start b-order-preparation-modern__method-option"
                >
                  <template #prepend>
                    <v-avatar size="24" rounded="0" class="me-2"
                      ><img :src="item.raw.image" width="24" height="24" alt=""
                    /></v-avatar>
                  </template>
                  <template #subtitle>
                    <span
                      class="b-order-preparation-modern__option-description"
                      >{{ item.raw.desc }}</span
                    >
                    <span
                      v-if="transportationLimits(item.raw).length"
                      class="b-order-preparation-modern__option-limits"
                      >{{ transportationLimits(item.raw).join(" · ") }}</span
                    >
                    <span class="b-order-preparation-modern__option-services">
                      <s-dense-images-circles
                        v-if="
                          Array.isArray(item.raw.info?.service_ids) &&
                          item.raw.info.service_ids.length
                        "
                        :images="
                          item.raw.info.service_ids.map((k) =>
                            DeliveryServiceHelper.GetDeliveryServiceIconById(k),
                          )
                        "
                        :limit="20"
                        :size="24"
                        color="#673AB7"
                      ></s-dense-images-circles>
                      <u-dense-circles-users
                        v-if="
                          Array.isArray(item.raw.info?.user_ids) &&
                          item.raw.info.user_ids.length
                        "
                        :ids="item.raw.info.user_ids"
                        :limit="20"
                        :size="24"
                        color="#FFA000"
                      ></u-dense-circles-users>
                    </span>
                  </template>
                </v-list-item>
              </template>
            </v-select>
            <u-smart-select
              v-else
              v-model="transportation"
              :items="transportation_items"
              :readonly="!isActive || ((modernVendorPanel || isModernFulfillment) && is_ready_action_disabled)"
              border
              :class="
                modern ? 'b-order-preparation-modern__method-select' : 'my-5'
              "
              item-description="desc"
              item-image="image"
              item-text="title"
              item-value="value"
              rounded
            >
              <template v-slot:append-title="{ item }">
                <span
                  :class="{
                    'b-order-preparation-modern__method-limits': modern,
                  }"
                >
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
                </span>
              </template>

              <template v-slot:description="{ item }">
                <div
                  :class="
                    modern
                      ? 'b-order-preparation-modern__method-services'
                      : 'd-flex align-center'
                  "
                >
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
                          DeliveryServiceHelper.GetDeliveryServiceIconById(k),
                        )
                      "
                      :limit="20"
                      :size="modern ? 24 : 32"
                      color="#673AB7"
                      circle-color="#fff"
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
                      :size="modern ? 24 : 32"
                      color="#FFA000"
                      circle-color="#fff"
                      title="Active couriers"
                    ></u-dense-circles-users>
                  </div>
                </div>
              </template>
            </u-smart-select>
          </v-col>
          <div
            v-if="
              modern && !isRolePanel && (!IS_VENDOR_PANEL || CAN_ADD_SHIPPING)
            "
            class="b-order-preparation-modern__package-picker"
          >
            <div
              v-if="compactShipping"
              class="b-order-preparation-modern__package-heading"
            >
              <h3 class="sd-modern-list-header">
                {{ $t("process_center.modern.subscription_package_title") }}
              </h3>
              <p>
                {{ $t("process_center.modern.subscription_package_subtitle") }}
              </p>
            </div>
            <b-box-input
              v-model="box_id"
              :modern="modern && (compactShipping || modernVendorPanel)"
              :disabled="compactShipping || modernVendorPanel || isModernFulfillment ? is_ready_action_disabled : undefined"
              :dimension-unit="size_unit"
              :weight-unit="mass_unit"
              :label="$t('process_center.modern.load_package_measurements')"
              class="sd-modern-underlined-field b-order-preparation-modern__box-input"
              @update:model-value="loadPackageMeasurements"
            ></b-box-input>
          </div>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Weight ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <v-col
            :class="
              modern
                ? 'b-order-preparation-modern__weight'
                : 'border-end-grater-md pa-2'
            "
            cols="12"
            md="4"
          >
            <p v-if="!modern" class="mt-2 small text-muted">
              <v-icon size="small"> fa:fas fa-weight-hanging</v-icon>
              {{ $t("process_center.preparing.packing_weight") }}
            </p>

            <u-number-input
              v-model="weight"
              :decimal="3"
              :label="
                $t(
                  modern
                    ? 'process_center.preparing.packing_weight'
                    : 'product_extra_physical.weight',
                )
              "
              :messages="
                modern
                  ? undefined
                  : `Total items weight: ${total_items_weight} ${mass_unit}`
              "
              :min="total_items_weight"
              :readonly="
                !isActive ||
                (modern && (compactShipping || modernVendorPanel || isModernFulfillment) && is_ready_action_disabled)
              "
              :suffix="mass_unit"
              :class="
                modern
                  ? 'sd-modern-underlined-field b-order-preparation-modern__input b-order-preparation-modern__weight-field'
                  : 'my-3 max-w-250 mx-auto'
              "
            />
            <p v-if="modern" class="b-order-preparation-modern__weight-help">
              {{
                $t("process_center.preparing.items_weight_calculation", {
                  weight: total_items_weight,
                  unit: mass_unit,
                })
              }}
              · {{ $t("process_center.modern.include_packaging_weight") }}
            </p>

            <div
              v-if="has_shipping_services"
              :class="modern ? 'b-order-preparation-modern__warnings' : 'mt-5'"
            >
              <v-alert
                :model-value="distance_warning"
                :class="
                  modern
                    ? 'sd-modern-notice b-order-preparation-modern__warning'
                    : 'small mb-2'
                "
                :color="modern ? undefined : '#F57C00'"
                density="compact"
                :variant="modern ? 'flat' : 'tonal'"
              >
                <b-vendor-order-icon v-if="modernVendorPanel" name="navigation" :size="17" class="me-2" /><v-icon v-else start>fa:fas fa-compass</v-icon>
                {{ $t("process_center.preparing.distance_warning") }}
                <v-chip
                  class="ma-1"
                  color="#E64A19"
                  label
                  size="x-small"
                  variant="flat"
                  >Max: {{ shop_transportation?.distance }} {{ distance_unit }}
                </v-chip>
              </v-alert>
              <v-alert
                :model-value="weight_warning"
                :class="
                  modern
                    ? 'sd-modern-notice b-order-preparation-modern__warning'
                    : 'small mb-2'
                "
                :color="modern ? undefined : '#F57C00'"
                density="compact"
                :variant="modern ? 'flat' : 'tonal'"
              >
                <b-vendor-order-icon v-if="modernVendorPanel" name="weight" :size="17" class="me-2" /><v-icon v-else start>fa:fas fa-weight-hanging</v-icon>
                {{ $t("process_center.preparing.weight_warning") }}
                <v-chip
                  class="ma-1"
                  color="#E64A19"
                  label
                  size="x-small"
                  variant="flat"
                  >Max: {{ shop_transportation?.max_weight }} {{ mass_unit }}
                </v-chip>
              </v-alert>
              <v-alert
                :model-value="volume_warning"
                :class="
                  modern
                    ? 'sd-modern-notice b-order-preparation-modern__warning'
                    : 'small mb-2'
                "
                :color="modern ? undefined : '#F57C00'"
                density="compact"
                :variant="modern ? 'flat' : 'tonal'"
              >
                <b-vendor-order-icon v-if="modernVendorPanel" name="ruler" :size="17" class="me-2" /><v-icon v-else start>fa:fas fa-ruler-combined</v-icon>

                {{ $t("process_center.preparing.volume_warning") }}
                <v-chip
                  class="ma-1"
                  color="#E64A19"
                  label
                  size="x-small"
                  variant="flat"
                  >Max w: {{ shop_transportation?.max_w }} {{ size_unit }}
                </v-chip>
                <v-chip
                  class="ma-1"
                  color="#E64A19"
                  label
                  size="x-small"
                  variant="flat"
                  >Max l: {{ shop_transportation?.max_l }} {{ size_unit }}
                </v-chip>
                <v-chip
                  class="ma-1"
                  color="#E64A19"
                  label
                  size="x-small"
                  variant="flat"
                  >Max h: {{ shop_transportation?.max_h }} {{ size_unit }}
                </v-chip>
              </v-alert>
            </div>
          </v-col>
        </div>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Size ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <div
          :class="{ 'b-order-preparation-modern__column': modern }"
          :style="modern ? undefined : 'display: contents'"
        >
          <v-col
            :class="
              modern
                ? 'b-order-preparation-modern__dimensions'
                : 'border-end-grater-md pa-2'
            "
            cols="12"
            md="4"
          >
            <p v-if="!modern" class="mt-2 small text-muted">
              <v-icon size="small"> fa:fas fa-box</v-icon>
              {{ $t("process_center.preparing.packing_size") }}
            </p>

            <u-number-input
              v-model="width"
              :label="$t('product_extra_physical.width')"
              :min="0"
              :readonly="
                !isActive ||
                (modern && (compactShipping || modernVendorPanel || isModernFulfillment) && is_ready_action_disabled)
              "
              :step="10"
              :suffix="size_unit"
              :class="
                modern
                  ? 'sd-modern-underlined-field b-order-preparation-modern__input b-order-preparation-modern__width-field'
                  : 'my-3 max-w-250 mx-auto'
              "
            />

            <u-number-input
              v-model="length"
              :label="$t('product_extra_physical.length')"
              :min="0"
              :readonly="
                !isActive ||
                (modern && (compactShipping || modernVendorPanel || isModernFulfillment) && is_ready_action_disabled)
              "
              :step="10"
              :suffix="size_unit"
              :class="
                modern
                  ? 'sd-modern-underlined-field b-order-preparation-modern__input b-order-preparation-modern__length-field'
                  : 'my-3 max-w-250 mx-auto'
              "
            />

            <u-number-input
              v-model="height"
              :label="$t('product_extra_physical.height')"
              :min="0"
              :readonly="
                !isActive ||
                (modern && (compactShipping || modernVendorPanel || isModernFulfillment) && is_ready_action_disabled)
              "
              :step="10"
              :suffix="size_unit"
              :class="
                modern
                  ? 'sd-modern-underlined-field b-order-preparation-modern__input b-order-preparation-modern__height-field'
                  : 'my-3 max-w-250 mx-auto'
              "
            />
          </v-col>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 3D Box ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <v-col
            :class="
              modern
                ? 'b-order-preparation-modern__box position-relative'
                : 'pa-2 position-relative'
            "
            cols="12"
            md="4"
          >
            <b-box-input
              v-if="
                !modern &&
                !isRolePanel &&
                (!IS_VENDOR_PANEL || CAN_ADD_SHIPPING)
              "
              v-model="box_id"
              @update:model-value="
                (v) => {
                  if (v) {
                    width = v.width;
                    length = v.length;
                    height = v.height;
                    weight = v.weight;
                  }
                }
              "
              :class="
                modern
                  ? 'sd-modern-underlined-field b-order-preparation-modern__box-input'
                  : 'my-3 mx-auto'
              "
            ></b-box-input>

            <u-cube
              v-if="has_box_size"
              :x="width"
              :y="length"
              :z="height"
              :size="modern ? 140 : 200"
              :class="{ 'b-order-preparation-modern__preview': modern }"
            />
            <p
              v-else
              :class="
                modern
                  ? 'b-order-preparation-modern__box-empty'
                  : 'position-absolute center-absolute text-muted m-0 text-uppercase'
              "
            >
              {{ $t("global.commons.no_data") }}!
            </p>
          </v-col>
        </div>
      </v-row>
      <div
        v-else
        :class="
          modern
            ? 'sd-modern-notice b-order-preparation-modern__unavailable'
            : 'pa-3 my-12 typo-body text-muted text-center'
        "
      >
        {{
          $t(
            modern
              ? "process_center.modern.preparation_unavailable"
              : "process_center.preparing.not_available_message",
          )
        }}
      </div>
      <p
        v-if="modern && compactShipping"
        class="b-order-preparation-modern__guidance"
      >
        {{ $t("process_center.modern.subscription_preparation_guidance") }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import UCube from "../../../../ui/cube/UCube.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { BasketHelper } from "@selldone/core-js/helper/shop/BasketHelper";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import UDenseCirclesUsers from "../../../../ui/dense-circles/users/UDenseCirclesUsers.vue";
import SDenseImagesCircles from "../../../../ui/image/SDenseImagesCircles.vue";
import { Basket, DeliveryServiceHelper } from "@selldone/core-js";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import BVendorOrderIcon from "../../../process-center/list/icon/BVendorOrderIcon.vue";
import { VendorMemberTypes } from "@selldone/core-js/models/shop/vendor/vendor_member.model.ts";
import BBoxInput from "@selldone/components-vue/backoffice/box/input/BBoxInput.vue";

export default {
  name: "BOrderDashboardPreparing",
  components: {
    BVendorOrderIcon,
    BBoxInput,
    UWidgetHeader,
    SDenseImagesCircles,
    UDenseCirclesUsers,
    USmartSelect,
    UCube,
    UNumberInput,
  },
  emits: ["confirm-preparing"],
  props: {
    modern: { type: Boolean, default: false },
    isFulfillment: { type: Boolean, default: false },
    compactShipping: { type: Boolean, default: false },
    shop: {
      require: true,
      type: Object,
    },
    vendor: {},
    basket: {
      require: true,
      type: Object,
    },
    isRolePanel: Boolean,
  },

  data: function () {
    return {
      PhysicalOrderStates: Basket.PhysicalOrderStates,
      busy: false,

      //------------------------
      transportation: null,

      weight: null,

      width: null,
      length: null,
      height: null,

      box_id: null,
      vendor_package_expanded: false,
    };
  },
  watch: {
    'basket.delivery_state'(state) {
      if (this.modernVendorPanel && [Basket.PhysicalOrderStates.OrderConfirm.code, Basket.PhysicalOrderStates.PreparingOrder.code].includes(state)) this.vendor_package_expanded = true;
    },
    /* transportation(transportation) {
      this.delivery_info.type =transportation;
    },*/

    delivery_info() {
      this.loadData();
    },
  },

  computed: {
    isModernFulfillment() {
      return this.modern && this.isFulfillment;
    },
    modernVendorPanel() {
      return this.modern && !!this.IS_VENDOR_PANEL;
    },
    vendorReadOnly() {
      // Vendor write permission is checked again while retaining readable package details.
      return this.modernVendorPanel && (!this.vendor || typeof this.writeVendorAccess !== 'function' || !this.writeVendorAccess(this.vendor, VendorMemberTypes.VendorMemberRegionCode.ORDERS));
    },
    vendorPackageWarning() {
      return this.has_shipping_services && (this.distance_warning || this.weight_warning || this.volume_warning);
    },
    vendorPackageExpanded() {
      return this.vendor_package_expanded || this.vendorPackageWarning;
    },
    DeliveryServiceHelper() {
      return DeliveryServiceHelper;
    },
    has_shipping_services() {
      return (
        !this.IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/ ||
        !!this.shop.marketplace?.shipping
      ); /*Marketplace enable shipping for vendors*/
    },

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
    /**
     * Only in marketplaces
     */
    marketplace() {
      return this.shop && this.shop.marketplace;
    },

    /**
     * For vendor panel!
     * @constructor
     */
    CAN_ADD_SHIPPING() {
      return this.marketplace?.shipping;
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
        Basket.PhysicalOrderStates.PreparingOrder.code,
        Basket.PhysicalOrderStates.SentOrder.code,
        Basket.PhysicalOrderStates.ToCustomer.code,
      ].includes(this.basket.delivery_state);
    },
    in_this_step() {
      return (
        this.basket.delivery_state ===
        Basket.PhysicalOrderStates.OrderConfirm.code
      );
    },

    has_box_size() {
      return this.width > 0 && this.length > 0 && this.height > 0;
    },
    isActive() {
      return (
        this.basket.delivery_state ===
          Basket.PhysicalOrderStates.OrderConfirm.code ||
        this.basket.delivery_state ===
          Basket.PhysicalOrderStates.PreparingOrder.code
      );
    },
    is_ready_action_disabled() {
      return (
        this.modern &&
        (this.vendorReadOnly || this.busy ||
          !this.isActive ||
          !!this.basket.reject ||
          !(this.isModernFulfillment ? [Basket.Status.Payed.code] : [Basket.Status.Payed.code, Basket.Status.COD.code]).includes(
            this.basket.status,
          ))
      );
    },

    delivery_info() {
      return this.basket.delivery_info ? this.basket.delivery_info : {};
    },

    is_cod() {
      return this.basket.status === Basket.Status.COD.code;
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
      return !!(
        this.shop_transportation &&
        this.shop_transportation.distance < this.distance
      );
    },
    volume_warning() {
      return !!(
        this.shop_transportation &&
        (this.shop_transportation.max_w < this.width ||
          this.shop_transportation.max_h < this.height ||
          this.shop_transportation.max_l < this.length)
      );
    },
    weight_warning() {
      return !!(
        this.shop_transportation &&
        this.shop_transportation.max_weight < this.weight
      );
    },

    transportations() {
      if (this.vendor) return this.vendor.transportations;
      return this.shop.transportations;
    },

    transportation_items() {
      let out = [];
      this.transportations?.forEach((t) => {
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
    transportationLimits(item) {
      const limits = item.transportation;
      return [
        limits?.distance
          ? `${this.$t("global.commons.distance")}: ${limits.distance} ${this.distance_unit}`
          : null,
        limits?.max_weight
          ? `${this.$t("global.commons.weight")}: ${limits.max_weight} ${this.mass_unit}`
          : null,
        limits?.max_w
          ? `${this.$t("global.commons.width")}: ${limits.max_w} ${this.size_unit}`
          : null,
        limits?.max_l
          ? `${this.$t("global.commons.length")}: ${limits.max_l} ${this.size_unit}`
          : null,
        limits?.max_h
          ? `${this.$t("global.commons.height")}: ${limits.max_h} ${this.size_unit}`
          : null,
      ].filter(Boolean);
    },
    loadPackageMeasurements(packageInfo) {
      // Clearing the preset keeps the measurements available for manual editing.
      if (!packageInfo) return;
      this.width = packageInfo.width;
      this.length = packageInfo.length;
      this.height = packageInfo.height;
      this.weight = packageInfo.weight;
    },
    findShopTransportation(type) {
      return this.transportations?.find((it) => it.type === type);
    },
    preparingOrder() {
      if (this.is_ready_action_disabled) return;
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
    },
    loadData() {
      if (!this.delivery_info.volume) this.delivery_info.volume = {};

      this.transportation = this.delivery_info.type;

      // Check if transportation is available:
      if (
        this.transportation &&
        !this.transportations?.some((t) => t.type === this.transportation)
      )
        this.transportation = null;

      this.weight = this.delivery_info.weight;

      this.width = this.delivery_info.volume.width;
      this.length = this.delivery_info.volume.length;
      this.height = this.delivery_info.volume.height;
    },
  },
  created() {
    this.vendor_package_expanded = this.modernVendorPanel && [Basket.PhysicalOrderStates.OrderConfirm.code, Basket.PhysicalOrderStates.PreparingOrder.code].includes(this.basket.delivery_state);
    this.loadData();
  },
};
</script>

<style lang="scss" scoped>
.b-order-preparation-modern {
  &.sd-modern-widget {
    padding: 20px;
    margin-block-end: 18px;
    border-radius: 16px;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.5;
  }

  &.disabled {
    opacity: 1 !important;
  }
  &__header {
    margin-block-end: 0;
  }
  &__header :deep(h2) {
    font-family: inherit;
    font-size: 18px;
    font-weight: 500;
    line-height: 24px;
  }
  &__stage {
    align-self: center;
    margin-inline-start: auto;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__subtitle {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 4px 0 20px;
    font-size: 12px;
    line-height: 18px;
  }
  &__help {
    pointer-events: auto;
  }
  &__body {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
    align-items: start;
  }
  &__grid {
    grid-column: 1 / -1;
    grid-row: 1;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)) 140px;
    align-items: start;
    gap: 10px 20px;
    margin: 0;
  }
  &__column,
  &__weight,
  &__dimensions,
  &__box {
    display: contents;
  }
  &__method {
    grid-column: 1 / -1;
    grid-row: 1;
    width: auto;
    max-width: none;
    padding: 0 0 6px;
  }
  &__method > p,
  &__caption {
    margin: 0 0 8px !important;
    font-size: 11px;
    line-height: 17px;
    font-weight: 400;
    color: var(--sd-modern-muted);
  }
  &__package-picker {
    grid-column: 1 / 5;
    grid-row: 2;
    min-width: 0;
  }
  &__box-input {
    max-width: 420px;
    min-width: 0;
  }
  &__weight-field {
    grid-column: 1;
    grid-row: 3;
  }
  &__width-field {
    grid-column: 2;
    grid-row: 3;
  }
  &__length-field {
    grid-column: 3;
    grid-row: 3;
  }
  &__height-field {
    grid-column: 4;
    grid-row: 3;
  }
  &__weight-help {
    grid-column: 1 / 5;
    grid-row: 4;
    margin: -8px 0 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__warnings {
    grid-column: 1 / -1;
    grid-row: 5;
  }
  &__warnings:empty {
    display: none;
  }
  &__preview,
  &__box-empty {
    grid-column: 5;
    grid-row: 2 / 5;
    align-self: center;
  }
  &__box-empty {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    text-align: center;
  }
  &__method-select {
    margin: 0;
  }
  &__compact-method {
    margin-block-end: 8px;
  }
  &__compact-method :deep(.v-field__input) {
    display: flex;
    align-items: center;
    font-family: inherit;
    font-size: 12px;
    line-height: 18px;
  }
  &__compact-method :deep(.v-select__selection) {
    max-width: 100%;
    white-space: normal;
  }
  &__method-option {
    padding-block: 10px;
  }
  &__method-option :deep(.v-list-item-subtitle) {
    display: block;
    -webkit-line-clamp: unset;
    white-space: normal;
    overflow: visible;
  }
  &__option-description,
  &__option-limits {
    display: block;
    overflow-wrap: anywhere;
    font-size: 12px;
    line-height: 18px;
  }
  &__option-limits {
    margin-block-start: 5px;
  }
  &__option-services {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-block-start: 6px;
  }
  &__option-services:empty {
    display: none;
  }
  &__package-heading {
    margin-block-end: 12px;
  }
  &__package-heading > h3 {
    margin: 0;
  }
  &__package-heading > p,
  &__guidance {
    margin: 5px 0 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &--compact &__body {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  &--compact &__action {
    grid-column: 2;
    grid-row: 2;
  }
  &--compact &__guidance {
    grid-column: 1;
    grid-row: 2;
    align-self: center;
  }
  &__method-select :deep(> .border-between-vertical) {
    border-color: var(--sd-modern-border) !important;
    border-radius: 10px !important;
  }
  &__method-select :deep(.row-hover) {
    padding: 10px 12px !important;
    color: inherit;
    background: transparent !important;
  }
  &__method-select :deep(.flex-grow-1 > b) {
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
  }
  &__method-select :deep(.small) {
    font-size: 11px;
    line-height: 17px;
  }
  &__method-limits {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    margin-block: 4px;
    color: var(--sd-modern-muted);
  }
  &__method-limits:empty {
    display: none;
  }
  &__method-limits :deep(.v-chip) {
    height: auto;
    margin: 0 !important;
    padding: 0;
    color: inherit;
    font-size: 11px;
    line-height: 17px;
  }
  &__method-services {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 16px;
    margin-block-start: 6px;
  }
  &__method-services > div {
    flex-grow: 0 !important;
  }
  &__input {
    margin: 0;
  }
  &__input :deep(.v-field__input),
  &__box-input :deep(.v-field__input) {
    font-family: inherit;
    font-size: 13px;
    font-weight: 400;
  }
  &__input :deep(.v-label),
  &__box-input :deep(.v-label) {
    font-family: inherit;
    font-size: 12px;
  }
  &__input :deep(.v-messages) {
    font-size: 11px;
    line-height: 17px;
  }
  &__warning {
    margin-block-end: 8px;
    padding: 10px 12px;
    color: rgb(var(--v-theme-on-surface));
    background: var(--sd-modern-inset);
    font-size: 11px;
    line-height: 17px;
  }
  &__warning :deep(.v-chip) {
    background: transparent !important;
    color: inherit !important;
  }
  &__warning :deep(.v-chip__underlay) {
    display: none;
  }
  &__action {
    grid-column: 1;
    grid-row: 2;
    justify-self: end;
    margin: 0;
  }
  // Vuetify's disabled flat overlay otherwise darkens the quiet neutral surface.
  &__action.v-btn--disabled :deep(.v-btn__overlay) {
    opacity: 0;
  }
  &__unavailable {
    grid-column: 1 / -1;
    grid-row: 1;
    margin: 0;
    padding: 12px;
    font-size: 12px;
    line-height: 18px;
  }
  @media (max-width: 700px) {
    &.sd-modern-widget {
      padding: 17px 13px;
    }
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    &__package-picker {
      grid-column: 1 / -1;
    }
    &__weight-field {
      grid-column: 1;
      grid-row: 3;
    }
    &__width-field {
      grid-column: 2;
      grid-row: 3;
    }
    &__length-field {
      grid-column: 1;
      grid-row: 4;
    }
    &__height-field {
      grid-column: 2;
      grid-row: 4;
    }
    &__weight-help {
      grid-column: 1 / -1;
      grid-row: 5;
    }
    &__warnings {
      grid-row: 6;
    }
    &__preview,
    &__box-empty {
      grid-column: 1 / -1;
      grid-row: 7;
      justify-self: center;
    }
    &__input :deep(.v-field__input),
    &__box-input :deep(.v-field__input) {
      font-size: 16px;
    }
    &__stage {
      margin-inline-start: 0;
    }
    &--compact &__body {
      grid-template-columns: minmax(0, 1fr);
    }
    &--compact &__guidance {
      grid-column: 1;
      grid-row: 2;
    }
    &--compact &__action {
      grid-column: 1;
      grid-row: 3;
      width: 100%;
    }
    &__compact-method :deep(.v-field__input) {
      font-size: 16px;
      min-height: 44px;
    }
  }
}
.b-order-preparation-modern--vendor {
  .b-order-preparation-modern__vendor-heading-icon { margin-inline-end: 10px; color: var(--sd-modern-muted); }
  .b-order-preparation-modern__vendor-toggle { display: inline-flex; align-items: center; gap: 7px; min-height: 32px; padding: 4px 0; color: var(--sd-modern-muted); font: inherit; font-size: 12px; line-height: 20px; text-align: start; }
  .b-order-preparation-modern__vendor-toggle:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 4px; border-radius: 4px; }
  .b-order-preparation-modern__action { justify-self: start; }
  .b-order-preparation-modern__preview { padding: 10px; background: var(--sd-modern-inset); border-radius: 12px; }
  .b-order-preparation-modern__warning { font-size: 13px; line-height: 21px; }
  @media (max-width: 700px) {
    &.sd-modern-widget { padding: 18px 16px; }
  }
  @media (max-width: 600px) {
    .b-order-preparation-modern__header { flex-wrap: wrap; }
    .b-order-preparation-modern__header :deep(> div:first-child) { flex-wrap: wrap; gap: 8px; width: 100%; min-width: 0; }
    .b-order-preparation-modern__vendor-toggle { flex: 1 0 100%; width: 100%; justify-content: flex-start; white-space: normal; }
  }
  @media (pointer: coarse) {
    .b-order-preparation-modern__vendor-toggle { min-height: 44px; }
  }
}
</style>
