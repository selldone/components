<template>
  <div class="b-transportation-settings-preview text-start">
    <b-transportation-flow-lines :edges="flowEdges" :active="flowEdges.length > 0" />
    <template v-if="section === 'general'">
      <div class="sd-modern-eyebrow">{{ text('draft_checkout') }}</div>
      <h3>{{ text('shipping_method') }}</h3>
      <div class="b-transportation-settings-preview__checkout">
        <img
          v-if="methodImage"
          :src="methodImage"
          alt=""
          width="36"
          height="36"
          class="b-transportation-settings-preview__logo"
        />
        <v-icon v-else size="24" aria-hidden="true">local_shipping</v-icon>
        <div class="b-transportation-settings-preview__identity">
          <strong>{{ transportation.title || methodTitle }}</strong>
          <small>{{ text(transportation.enable ? 'shown_conditionally' : 'unavailable') }}</small>
        </div>
      </div>
      <div class="sd-modern-status sd-modern-status--plain b-transportation-settings-preview__status">
        <span
          class="sd-modern-status__dot"
          :class="{ 'bg-success': transportation.enable }"
          aria-hidden="true"
        />
        {{ text(transportation.enable ? 'enabled' : 'disabled') }}
      </div>
      <dl class="b-transportation-settings-preview__facts">
        <div>
          <dt>{{ text('reference_currency') }}</dt>
          <dd><bdi>{{ transportation.currency || text('currency_unset') }}</bdi></dd>
        </div>
        <div>
          <dt>{{ text('delivery_selection') }}</dt>
          <dd>{{ etaTitle }}</dd>
        </div>
      </dl>
      <p>{{ text('availability_note') }}</p>
    </template>

    <template v-else-if="section === 'limits'">
      <div class="sd-modern-eyebrow">{{ text('package_preview') }}</div>
      <h3>{{ text('configured_dimensions') }}</h3>
      <div class="b-transportation-settings-preview__cube">
        <u-cube
          v-if="hasDimensions"
          :size="160"
          :x="transportation.max_w"
          :y="transportation.max_l"
          :z="transportation.max_h"
          no-animation
          aria-hidden="true"
        />
        <p v-else>{{ text('dimensions_unavailable') }}</p>
      </div>
      <dl class="b-transportation-settings-preview__dimensions">
        <div v-for="dimension in dimensions" :key="dimension.key">
          <dt>{{ text(dimension.key) }}</dt>
          <dd><bdi>{{ dimension.value }} {{ sizeUnit }}</bdi></dd>
        </div>
      </dl>
      <div class="b-transportation-settings-preview__samples">
        <u-number-input
          v-model="sampleDistance"
          :dark="$vuetify.theme.current.dark"
          :label="text('sample_distance')"
          :suffix="distanceUnit"
          :min="0"
          :max="1000000"
          variant="underlined"
          class="sd-modern-underlined-field"
          hide-details
        />
        <u-number-input
          v-model="sampleWeight"
          :dark="$vuetify.theme.current.dark"
          :label="text('sample_weight')"
          :suffix="massUnit"
          :min="0"
          :max="1000000"
          variant="underlined"
          class="sd-modern-underlined-field"
          hide-details
        />
      </div>
      <div class="b-transportation-settings-preview__result" role="status" aria-live="polite">
        <v-icon :color="sampleFits === null ? undefined : sampleFits ? 'success' : 'warning'" size="15" aria-hidden="true">
          {{ sampleFits === null ? 'info_outline' : sampleFits ? 'check' : 'priority_high' }}
        </v-icon>
        <span>{{ text(sampleFits === null ? 'enter_sample' : sampleFits ? 'within_limits' : 'exceeds_limits') }}</span>
      </div>
      <p>{{ text('limits_note') }}</p>
    </template>

    <template v-else-if="section === 'availability'">
      <div class="sd-modern-eyebrow">{{ text(dateMode ? 'preparation_example' : 'selection_preview') }}</div>
      <h3>{{ text(dateMode ? 'earliest_selection' : noSelection ? 'no_date_input' : 'customer_selection') }}</h3>
      <ol v-if="dateMode" class="b-transportation-settings-preview__flow">
        <li v-for="(node, index) in preparationFlow" :key="node.icon">
          <span class="b-transportation-settings-preview__node-icon" :data-flow-node="`availability_${index}`">
            <v-icon size="18" aria-hidden="true">{{ node.icon }}</v-icon>
          </span>
          <div>
            <strong>{{ node.title }}</strong>
            <small>{{ node.description }}</small>
          </div>
        </li>
      </ol>
      <template v-else-if="noSelection">
        <div class="b-transportation-settings-preview__notice">
          <v-icon size="18" aria-hidden="true">event_busy</v-icon>
          <span>{{ text('no_date_note') }}</span>
        </div>
      </template>
      <template v-else>
        <div v-if="usesDays" class="b-transportation-settings-preview__days">
          <span v-for="day in selectedDays" :key="day.value">{{ $t(day.name) }}</span>
          <small v-if="!selectedDays.length">{{ text('no_days') }}</small>
        </div>
        <div v-if="usesTimeSpans" class="b-transportation-settings-preview__time-spans">
          <div v-for="span in selectedTimeSpans" :key="span.value">
            <img :src="span.icon" alt="" width="20" height="20" />
            <span>{{ $t(span.name) }}</span>
            <bdi>{{ String(span.min).padStart(2, '0') }}:00–{{ String(span.max).padStart(2, '0') }}:00</bdi>
          </div>
          <small v-if="!selectedTimeSpans.length">{{ text('no_time_spans') }}</small>
        </div>
      </template>
      <p v-if="dateMode">{{ text('preparation_note') }}</p>
      <dl class="b-transportation-settings-preview__facts">
        <div>
          <dt>{{ text('delivery_selection') }}</dt>
          <dd>{{ etaTitle }}</dd>
        </div>
        <div>
          <dt>{{ text('holidays') }}</dt>
          <dd>{{ text(transportation.holidays ? 'allowed' : 'excluded') }}</dd>
        </div>
      </dl>
    </template>

    <template v-else-if="section === 'payment'">
      <div class="sd-modern-eyebrow">{{ text('payment_flow') }}</div>
      <h3>{{ text('order_payment') }}</h3>
      <div class="b-transportation-settings-preview__diagram">
        <div class="b-transportation-settings-preview__diagram-node" data-flow-node="payment_checkout">
          <v-icon size="20" aria-hidden="true">shopping_bag</v-icon>
          <div>
            <strong>{{ text('checkout') }}</strong>
            <small>{{ text('checkout_payment_hint') }}</small>
          </div>
        </div>
        <ul class="b-transportation-settings-preview__diagram-branches">
          <li>
            <div class="b-transportation-settings-preview__diagram-node" data-flow-node="payment_online">
              <v-icon size="20" aria-hidden="true">credit_card</v-icon>
              <div>
                <strong>{{ text('online_payment') }}</strong>
                <small>{{ text('online_payment_hint') }}</small>
              </div>
            </div>
          </li>
          <li>
            <div class="b-transportation-settings-preview__diagram-node" data-flow-node="payment_cod">
              <v-icon size="20" aria-hidden="true">local_atm</v-icon>
              <div>
                <strong>{{ text('cod_payment') }}</strong>
                <span class="sd-modern-status sd-modern-status--plain b-transportation-settings-preview__diagram-status">
                  <span class="sd-modern-status__dot" :class="{ 'bg-success': codMode === 'enabled' }" aria-hidden="true" />
                  {{ text(codMode === 'enabled' ? 'cod_enabled' : codMode === 'disabled' ? 'cod_disabled' : 'cod_pending') }}
                </span>
                <small>{{ text(codMode === 'enabled' ? 'cod_conditions' : codMode === 'disabled' ? 'cod_off_hint' : 'cod_pending_hint', { currency: transportation.currency || text('currency_unset') }) }}</small>
              </div>
            </div>
            <ol v-if="codMode === 'enabled'" class="b-transportation-settings-preview__diagram-path">
              <li>
                <div class="b-transportation-settings-preview__diagram-node" data-flow-node="payment_collection">
                  <v-icon size="20" aria-hidden="true">payments</v-icon>
                  <div>
                    <strong>{{ text('collect_order_payment') }}</strong>
                    <small>{{ text('collect_order_hint') }}</small>
                  </div>
                </div>
              </li>
            </ol>
          </li>
        </ul>
      </div>
      <p>{{ text('order_payment_only') }}</p>
      <p v-if="codMode === 'enabled'">{{ text('cod_note', { currency: transportation.currency || text('currency_unset') }) }}</p>
    </template>

    <template v-else-if="section === 'rates'">
      <div class="sd-modern-eyebrow">{{ text('shipping_fee_flow') }}</div>
      <h3>{{ text(shippingFeeMode === 'destination' ? 'fee_at_destination' : shippingFeeMode === 'checkout' ? 'fee_at_checkout' : 'fee_pending') }}</h3>
      <div v-if="shippingFeeMode === 'pending'" class="b-transportation-settings-preview__notice" role="status">
        <v-icon size="18" aria-hidden="true">alt_route</v-icon>
        <span>{{ text('fee_pending_hint') }}</span>
      </div>
      <div v-else class="b-transportation-settings-preview__diagram">
        <div class="b-transportation-settings-preview__diagram-node" data-flow-node="fee_checkout">
          <v-icon size="20" aria-hidden="true">shopping_bag</v-icon>
          <div>
            <strong>{{ text('checkout') }}</strong>
            <small>{{ text('shipping_fee') }}</small>
          </div>
        </div>
        <ol class="b-transportation-settings-preview__diagram-path">
          <li v-for="node in shippingFeeSteps" :key="node.id">
            <div class="b-transportation-settings-preview__diagram-node" :data-flow-node="node.id === 'checkout' ? 'checkout_total' : node.id">
              <v-icon size="20" aria-hidden="true">{{ node.icon }}</v-icon>
              <div>
                <strong>{{ text(node.titleKey) }}</strong>
                <small v-if="node.descriptionKey">{{ text(node.descriptionKey) }}</small>
                <small v-if="node.id === 'free_shipping' && transportation.free_shipping">
                  {{ text('free_threshold') }}
                  <u-price v-if="hasFreeThreshold" :amount="transportation.free_shipping_limit" :currency="transportation.currency" />
                  <span v-else>{{ text('currency_unset') }}</span>
                </small>
              </div>
            </div>
            <ul v-if="node.id === 'free_shipping' && transportation.free_shipping" class="b-transportation-settings-preview__diagram-branches">
              <li>
                <div class="b-transportation-settings-preview__diagram-node" data-flow-node="threshold_met">
                  <v-icon size="20" aria-hidden="true">redeem</v-icon>
                  <div><strong>{{ text('threshold_met') }}</strong><small>{{ text('free_order_shipping') }}</small></div>
                </div>
              </li>
              <li>
                <div class="b-transportation-settings-preview__diagram-node" data-flow-node="threshold_not_met">
                  <v-icon size="20" aria-hidden="true">calculate</v-icon>
                  <div><strong>{{ text('threshold_not_met') }}</strong><small>{{ text('calculated_order_shipping') }}</small></div>
                </div>
              </li>
            </ul>
          </li>
        </ol>
      </div>
      <p>{{ text('sod_independent') }}</p>
    </template>
  </div>
</template>

<script lang="ts">
import UCube from "../../../ui/cube/UCube.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import UPrice from "../../../ui/price/UPrice.vue";
import BTransportationFlowLines from "../flow/BTransportationFlowLines.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";
import { TimeSpans } from "@selldone/core-js/enums/logistic/TimeSpans";
import { ETA } from "@selldone/core-js/enums/logistic/ETA";

export default {
  name: "BTransportationSettingsPreview",
  components: { UCube, UNumberInput, UPrice, BTransportationFlowLines },
  props: {
    section: { type: String, default: "general" },
    transportation: { type: Object, required: true },
    shop: { type: Object, required: true },
    eta: { type: String, default: null },
  },
  data() {
    return { sampleDistance: 20, sampleWeight: 2 };
  },
  computed: {
    flowEdges() {
      if (this.section === "availability" && this.dateMode) {
        return this.preparationFlow.slice(1).map((_, index) => ({
          from: `availability_${index}`, to: `availability_${index + 1}`,
        }));
      }
      const branchSocket = this.$vuetify?.locale?.isRtl ? "right" : "left";
      if (this.section === "payment") {
        const online = { from: "payment_checkout", to: "payment_online", startSocket: branchSocket, endSocket: branchSocket };
        return this.codMode === "enabled" ? [
          online,
          { from: "payment_checkout", to: "payment_cod", startSocket: branchSocket, endSocket: branchSocket },
          { from: "payment_cod", to: "payment_collection" },
        ] : [online];
      }
      if (this.section !== "rates" || this.shippingFeeMode === "pending") return [];
      const ids = ["fee_checkout", ...this.shippingFeeSteps.map(node => node.id === "checkout" ? "checkout_total" : node.id)];
      const edges = ids.slice(1).map((to, index) => ({ from: ids[index], to }));
      if (this.shippingFeeMode !== "checkout" || !this.transportation.free_shipping) return edges;
      const joinSocket = branchSocket === "left" ? "right" : "left";
      // Free and calculated charges are alternatives that rejoin the checkout total.
      return [
        ...edges.filter(edge => edge.from !== "free_shipping"),
        { from: "free_shipping", to: "threshold_met", startSocket: branchSocket, endSocket: branchSocket },
        { from: "free_shipping", to: "threshold_not_met", startSocket: branchSocket, endSocket: branchSocket },
        { from: "threshold_met", to: "checkout_total", startSocket: joinSocket, endSocket: joinSocket },
        { from: "threshold_not_met", to: "checkout_total", startSocket: joinSocket, endSocket: joinSocket },
      ];
    },
    codMode() {
      return this.transportation.cod === true ? "enabled" : this.transportation.cod === false ? "disabled" : "pending";
    },
    shippingFeeMode() {
      return this.transportation.sod === true ? "destination" : this.transportation.sod === false ? "checkout" : "pending";
    },
    hasFreeThreshold() {
      return Number.isFinite(this.transportation.free_shipping_limit) && this.transportation.free_shipping_limit >= 0 && !!this.transportation.currency;
    },
    shippingFeeSteps() {
      if (this.shippingFeeMode === "pending") return [];
      if (this.shippingFeeMode === "destination") return [
        { id: "bypassed", icon: "route", titleKey: "rates_bypassed", descriptionKey: "rates_bypassed_hint" },
        { id: "destination", icon: "local_shipping", titleKey: "carrier_collects", descriptionKey: "carrier_collects_hint" },
      ];
      return [
        { id: "rate_profile", icon: "public", titleKey: "destination_profile", descriptionKey: "destination_profile_hint" },
        { id: "calculate", icon: "calculate", titleKey: "calculate_shipping", descriptionKey: "calculate_shipping_hint" },
        { id: "free_shipping", icon: "redeem", titleKey: this.transportation.free_shipping ? "free_shipping_enabled" : "free_shipping_disabled", descriptionKey: this.transportation.free_shipping ? null : "free_disabled_hint" },
        { id: "checkout", icon: "shopping_cart_checkout", titleKey: "add_shipping_checkout", descriptionKey: "add_shipping_checkout_hint" },
      ];
    },
    transportationType() {
      return ShopTransportations[this.transportation.type];
    },
    methodImage() {
      return this.transportation.logo
        ? this.getShopImagePath(this.transportation.logo)
        : this.transportationType?.icon;
    },
    methodTitle() {
      return this.transportationType ? this.$t(this.transportationType.name) : this.text("shipping_method");
    },
    etaTitle() {
      const key = Object.keys(ETA).find((key) => ETA[key].code === this.eta);
      return key ? this.$t(`transportation_manage.eta_modes.${key.toLowerCase()}`) : this.text("currency_unset");
    },
    sizeUnit() {
      return ShopOptionsHelper.GetSizeUnit(this.shop);
    },
    massUnit() {
      return ShopOptionsHelper.GetMassUnit(this.shop);
    },
    distanceUnit() {
      return ShopOptionsHelper.GetDistanceUnit(this.shop);
    },
    dimensions() {
      return [
        { key: "width", value: this.transportation.max_w },
        { key: "length", value: this.transportation.max_l },
        { key: "height", value: this.transportation.max_h },
      ];
    },
    hasDimensions() {
      return this.dimensions.every(({ value }) => Number.isFinite(value) && value > 0);
    },
    sampleFits() {
      const values = [this.sampleDistance, this.sampleWeight, this.transportation.distance, this.transportation.max_weight];
      if (!values.every((value) => Number.isFinite(value) && value >= 0)) return null;
      // This illustration compares two configured limits; checkout applies additional rules.
      return this.sampleDistance <= this.transportation.distance && this.sampleWeight <= this.transportation.max_weight;
    },
    dateMode() {
      return [ETA.date.code, ETA.date_time.code].includes(this.eta);
    },
    noSelection() {
      return this.eta === ETA.None.code;
    },
    usesDays() {
      return [ETA.weekday.code, ETA.weekday_timeframe.code].includes(this.eta);
    },
    usesTimeSpans() {
      return [ETA.timeframe.code, ETA.weekday_timeframe.code].includes(this.eta);
    },
    selectedDays() {
      return Object.values(WeekDays).filter((day) => this.transportation.days?.includes(day.value));
    },
    selectedTimeSpans() {
      return Object.values(TimeSpans).filter((span) => this.transportation.time_spans?.includes(span.value));
    },
    preparationFlow() {
      const processingHours = Number.isFinite(this.transportation.etd) && this.transportation.etd >= 0
        ? this.transportation.etd : 0;
      // Product leads are explicitly illustrative, not values fetched from an order.
      const first = 48, second = 12, longestLead = Math.max(first, second);
      return [
        { icon: "shopping_bag", title: this.text("order_placed"), description: this.text("starting_point") },
        { icon: "schedule", title: this.text("processing_hours", { hours: processingHours }), description: this.text("method_preparation") },
        { icon: "inventory_2", title: this.text("product_lead_hours", { hours: longestLead }), description: this.text("longest_lead", { first, second }) },
        { icon: "event", title: this.text("total_hours", { hours: processingHours + longestLead }), description: this.text(this.eta === ETA.date_time.code ? "before_date_time" : "before_date") },
      ];
    },
  },
  methods: {
    text(key, values = {}) {
      return this.$t(`transportation_manage.settings.preview.${key}`, values);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-transportation-settings-preview {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 20px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: rgb(var(--v-theme-on-surface));
  overflow-wrap: anywhere;

  h3 {
    margin: 4px 0 16px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
  }

  strong { font-weight: 500; }
  small, p, dt {
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.5;
  }
  small { display: block; }
  p { margin: 16px 0 0; }

  &__checkout {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 11px;
    background: rgb(var(--v-theme-surface));
  }
  &__logo { flex: 0 0 36px; object-fit: contain; border-radius: 8px; }
  &__identity { min-width: 0; }
  &__status { margin-block-start: 16px; }
  &__facts {
    margin: 12px 0 0;
    > div {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
      padding-block: 9px;
      border-block-end: 1px solid var(--sd-modern-border);
    }
    dt { flex: 1; min-width: 0; }
    dd { flex: 1; min-width: 0; margin: 0; text-align: end; }
  }
  &__cube { min-height: 160px; display: grid; place-items: center; }
  &__dimensions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin: 0;
    text-align: center;
    dd { margin: 4px 0 0; }
  }
  &__samples {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-block-start: 16px;
    > * { min-width: 0; }
  }
  &__result, &__notice {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr);
    align-items: start;
    gap: 10px;
    margin-block-start: 16px;
    > .v-icon { justify-self: center; }
  }
  &__days { display: flex; flex-wrap: wrap; gap: 7px; }
  &__days > span { padding: 5px 8px; border: 1px solid var(--sd-modern-border); border-radius: 7px; font-size: 11px; }
  &__time-spans {
    display: grid;
    gap: 10px;
    margin-block-start: 16px;
    > div { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; }
    bdi { margin-inline-start: auto; font-size: 11px; color: var(--sd-modern-muted); }
  }
  &__flow {
    position: relative;
    padding: 0;
    margin: 0;
    list-style: none;
    li { position: relative; display: grid; grid-template-columns: 32px minmax(0, 1fr); align-items: start; gap: 10px; padding-block: 8px; }
    li > div { min-width: 0; }
  }
  &__node-icon {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    flex: 0 0 32px;
    width: 32px;
    height: 32px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 9px;
    background: rgb(var(--v-theme-surface));
  }
  &__diagram { min-width: 0; }
  &__diagram-node {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr);
    align-items: start;
    gap: 10px;
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));
    > div { min-width: 0; }
    > .v-icon { color: var(--sd-modern-muted); }
    small { margin-block-start: 4px; }
  }
  &__diagram-status {
    margin-block-start: 7px;
    font-size: 11px;
    font-weight: 400;
  }
  &__diagram-path,
  &__diagram-branches {
    min-width: 0;
    padding: 0;
    margin: 0;
    list-style: none;
    > li { position: relative; min-width: 0; }
  }
  &__diagram-path > li { padding-block-start: 24px; }
  &__diagram-branches {
    padding-inline-start: 28px;
    > li { padding-block-start: 28px; }
  }

  @media (max-width: 360px) {
    &__samples { grid-template-columns: minmax(0, 1fr); }
  }

  @media (max-width: 600px), (pointer: coarse) {
    &__samples :deep(input) { min-height: 44px; font-size: 16px; }
  }
}
</style>
