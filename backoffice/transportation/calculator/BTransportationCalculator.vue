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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Calculator ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

  <div v-if="modern" class="b-transportation-calculator text-start">
    <div class="sd-modern-eyebrow">
      {{ $t("transportation_manage.settings.calculator_preview.eyebrow") }}
    </div>
    <h2>{{ $t("transportation_manage.settings.calculator_preview.title") }}</h2>
    <section class="b-transportation-calculator__inputs">
      <div class="b-transportation-calculator__input-heading">
        <v-icon size="18" aria-hidden="true">receipt_long</v-icon>
        <h3>
          {{ $t("transportation_manage.settings.calculator_preview.sample_inputs") }}
        </h3>
      </div>
      <p class="b-transportation-calculator__input-hint">
        {{ $t("transportation_manage.settings.calculator_preview.sample_inputs_hint") }}
      </p>
      <div class="b-transportation-calculator__fields">
        <u-number-input
          v-model="cal_dis"
          hide-details
          :label="$t('global.commons.distance')"
          :suffix="getDistanceDimension(shop)"
          variant="plain"
        />
        <u-number-input
          v-model="cal_w"
          hide-details
          :label="$t('global.commons.weight')"
          :suffix="getWeightDimension(shop)"
          variant="plain"
        />
        <u-price-input
          v-model="cal_p"
          hide-details
          :currency="currency"
          :decimal="6"
          :label="
            $t('transportation_manage.settings.calculator_preview.order_value')
          "
          variant="plain"
          class="b-transportation-calculator__wide"
        />
        <s-country-select
          :model-value="country"
          hide-details
          :filter="profile_countries"
          :return-object="false"
          item-value="alpha2"
          :label="$t('global.commons.country')"
          :placeholder="$t('transportation_manage.settings.worldwide_default')"
          variant="plain"
          persistent-placeholder
          class="b-transportation-calculator__wide"
          clearable
          @update:model-value="$emit('update:country', $event)"
        />
        <v-select
          :model-value="state"
          hide-details
          :items="countryStates"
          :disabled="!countryStates.length"
          item-title="name"
          item-value="code"
          :label="$t('global.commons.state')"
          :placeholder="$t('transportation_manage.settings.country_default')"
          variant="plain"
          persistent-placeholder
          class="b-transportation-calculator__wide"
          clearable
          @update:model-value="$emit('update:state', $event)"
        />
      </div>
    </section>
    <div class="b-transportation-calculator__summary">
      <b-transportation-flow-lines
        :edges="flowEdges"
        :active="transportation.sod === false"
      />
      <ol class="b-transportation-calculator__flow" aria-live="polite">
        <li class="b-transportation-calculator__step">
          <v-icon aria-hidden="true">route</v-icon>
          <div data-flow-node="region">
            <h3>
              {{
                $t(
                  "transportation_manage.settings.calculator_preview.resolution",
                )
              }}
            </h3>
            <p>{{ preview_scope_label }}</p>
            <p
              v-if="preview_region"
              class="b-transportation-calculator__region"
            >
              {{ preview_region }}
            </p>
          </div>
        </li>
        <li class="b-transportation-calculator__step">
          <v-icon aria-hidden="true">calculate</v-icon>
          <div data-flow-node="calculation">
            <h3>
              {{
                $t(
                  "transportation_manage.settings.calculator_preview.calculation",
                )
              }}
            </h3>
            <dl
              v-if="preview_available"
              class="b-transportation-calculator__breakdown"
            >
              <div v-for="part in preview_breakdown" :key="part.label">
                <dt>{{ part.label }}</dt>
                <dd><u-price :amount="part.amount" :currency="currency" /></dd>
              </div>
              <div class="b-transportation-calculator__subtotal">
                <dt>
                  {{
                    $t(
                      "transportation_manage.settings.calculator_preview.subtotal",
                    )
                  }}
                </dt>
                <dd>
                  <u-price :amount="preview_subtotal" :currency="currency" />
                </dd>
              </div>
            </dl>
            <p v-else>
              {{
                $t(
                  "transportation_manage.settings.calculator_preview.invalid_hint",
                )
              }}
            </p>
          </div>
        </li>
        <li class="b-transportation-calculator__step">
          <v-icon aria-hidden="true">redeem</v-icon>
          <div data-flow-node="threshold">
            <h3>
              {{
                $t(
                  "transportation_manage.settings.calculator_preview.threshold",
                )
              }}
            </h3>
            <template v-if="preview_available && transportation.free_shipping">
              <p>
                {{
                  $t(
                    preview_free_applies
                      ? "transportation_manage.settings.calculator_preview.threshold_applied"
                      : "transportation_manage.settings.calculator_preview.threshold_pending",
                  )
                }}
              </p>
              <p class="b-transportation-calculator__threshold">
                <u-price :amount="cal_p" :currency="currency" />
                <span aria-hidden="true"> / </span>
                <u-price
                  :amount="transportation.free_shipping_limit"
                  :currency="currency"
                />
              </p>
            </template>
            <p v-else-if="!transportation.free_shipping">
              {{
                $t(
                  "transportation_manage.settings.calculator_preview.threshold_off",
                )
              }}
            </p>
            <p v-else>
              {{
                $t(
                  "transportation_manage.settings.calculator_preview.unavailable",
                )
              }}
            </p>
          </div>
        </li>
      </ol>
      <div
        class="b-transportation-calculator__result"
        aria-live="polite"
      >
        <span class="b-transportation-calculator__estimate-anchor" data-flow-node="estimate" aria-hidden="true" />
        <span
          >{{
            $t("transportation_manage.settings.calculator_preview.estimate")
          }}
          · {{ currency }}</span
        >
        <u-price
          v-if="preview_available && calculated_cost !== 0"
          :amount="calculated_cost"
          :currency="currency"
        />
        <span v-else-if="preview_available">{{
          $t("global.commons.free")
        }}</span>
        <span v-else class="b-transportation-calculator__unavailable">{{
          $t("transportation_manage.settings.calculator_preview.unavailable")
        }}</span>
      </div>
    </div>
    <p class="b-transportation-calculator__caveat">
      {{ $t("transportation_manage.settings.calculator_preview.caveat") }}
    </p>
  </div>
  <div v-else class="shadow-paper cal-card mx-2 my-9">
    <v-icon size="large">calculate</v-icon>

    <v-divider class="mx-2" vertical></v-divider>
    <flag v-if="country" :iso="country" :squared="false" class="me-2"></flag>
    <template v-if="country && state">
      <small class="me-2">/</small>
      <s-state-flag
        :country="country"
        :region="state"
        class="me-1"
        height="14"
      ></s-state-flag>
      <b class="me-2">{{ state }}</b>
    </template>
    <v-spacer></v-spacer>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ const ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <u-price
      :amount="(selected_profile ? selected_profile : transportation).const"
      :class="{
        'op-0-5 scale-0-5':
          !(selected_profile ? selected_profile : transportation).const > 0,
      }"
      :currency="transportation.currency"
      :medium="(selected_profile ? selected_profile : transportation).const > 0"
      caption="Const"
      class="sub-caption b-12px min-width-50 text-center"
    ></u-price>
    <v-icon color="primary">fa:fas fa-plus</v-icon>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ distance_cof ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      :class="{
        'op-0-5 scale-0-5':
          !(selected_profile ? selected_profile : transportation).distance_cof >
          0,
      }"
      class="d-flex align-center"
    >
      <u-number-input
        v-model="cal_dis"
        :label="$t('global.commons.distance')"
        :suffix="getDistanceDimension(shop)"
        class="inline-block cal-in"
        dense
        flat
        hide-details
        prepend-inner-icon="place"
        solo
        title="Destination to warehouse distance."
      ></u-number-input>
      <v-icon color="primary">fa:fas fa-times</v-icon>
      <u-price
        :amount="
          (selected_profile ? selected_profile : transportation).distance_cof
        "
        :currency="transportation.currency"
        :medium="
          (selected_profile ? selected_profile : transportation).distance_cof >
          0
        "
        caption="Distance"
        class="sub-caption b-12px min-width-50 text-center"
      ></u-price>
    </div>

    <v-icon color="primary">fa:fas fa-plus</v-icon>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ weight_cof ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      :class="{
        'op-0-5 scale-0-5':
          !(selected_profile ? selected_profile : transportation).weight_cof >
          0,
      }"
      class="d-flex align-center"
    >
      <u-number-input
        v-model="cal_w"
        :label="$t('global.commons.weight')"
        :suffix="getWeightDimension(shop)"
        class="inline-block cal-in"
        dense
        flat
        hide-details
        prepend-inner-icon="scale"
        solo
        title="Package weight."
      ></u-number-input>
      <v-icon color="primary">fa:fas fa-times</v-icon>
      <u-price
        :amount="
          (selected_profile ? selected_profile : transportation).weight_cof
        "
        :currency="transportation.currency"
        :medium="
          (selected_profile ? selected_profile : transportation).weight_cof > 0
        "
        caption="Wight"
        class="sub-caption b-12px min-width-50 text-center"
      ></u-price>
    </div>

    <v-icon color="primary">fa:fas fa-plus</v-icon>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ distance_weight_cof ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <div
      :class="{
        'op-0-5 scale-0-5':
          !(selected_profile ? selected_profile : transportation)
            .distance_weight_cof > 0,
      }"
      class="d-flex align-center"
    >
      <span>{{ cal_dis }} {{ getDistanceDimension(shop) }}</span>
      <v-icon color="primary">fa:fas fa-times</v-icon>
      <span>{{ cal_w }} {{ getWeightDimension(shop) }}</span>
      <v-icon color="primary">fa:fas fa-times</v-icon>
      <u-price
        :amount="
          (selected_profile ? selected_profile : transportation)
            .distance_weight_cof
        "
        :currency="transportation.currency"
        :medium="
          (selected_profile ? selected_profile : transportation)
            .distance_weight_cof > 0
        "
        caption="D🞬W"
        class="sub-caption b-12px min-width-50 text-center"
      ></u-price>
    </div>

    <v-icon color="primary">fa:fas fa-plus</v-icon>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ price_cof ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      :class="{
        'op-0-5 scale-0-5':
          !(selected_profile ? selected_profile : transportation).price_cof > 0,
      }"
      class="d-flex align-center"
    >
      <u-price-input
        v-model="cal_p"
        :currency="currency"
        :decimal="6"
        :label="$t('global.commons.price')"
        class="inline-block cal-in"
        dense
        flat
        hide-details
        prepend-inner-icon="shopping_bag"
        solo
        title="Order price."
      ></u-price-input>
      <v-icon color="primary">fa:fas fa-times</v-icon>
      <u-price
        :amount="
          (selected_profile ? selected_profile : transportation).price_cof
        "
        :currency="transportation.currency"
        :medium="
          (selected_profile ? selected_profile : transportation).price_cof > 0
        "
        caption="Price"
        class="sub-caption b-12px min-width-50 text-center"
      ></u-price>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Result ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-icon color="primary">fa:fas fa-equals</v-icon>

    <v-chip
      v-if="calculated_cost"
      class="mx-1"
      color="#222"
      label
      size="large"
      variant="flat"
    >
      <u-price
        :amount="calculated_cost"
        :currency="transportation.currency"
        dark
        large
      ></u-price>
    </v-chip>

    <v-chip
      v-else
      class="mx-1 font-weight-black"
      color="success"
      label
      size="large"
    >
      {{ $t("global.commons.free") }}
    </v-chip>

    <v-spacer></v-spacer>
  </div>
</template>

<script lang="ts">
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";

import UPriceInput from "../../../ui/price/input/UPriceInput.vue";
import SStateFlag from "@selldone/components-vue/ui/country/state-flag/SStateFlag.vue";
import SCountrySelect from "@selldone/components-vue/ui/country/select/SCountrySelect.vue";
import BTransportationFlowLines from "../flow/BTransportationFlowLines.vue";

export default {
  name: "BTransportationCalculator",
  components: {
    BTransportationFlowLines,
    SStateFlag,
    UPriceInput,
    UNumberInput,
    SCountrySelect,
  },
  emits: ["update:country", "update:state"],
  props: {
    shop: {},
    transportation: { required: true, type: Object },
    country: {},
    state: {},
    modern: { type: Boolean, default: false },
  },

  data: () => ({
    flowEdges: [
      { from: "region", to: "calculation" },
      { from: "calculation", to: "threshold" },
      { from: "threshold", to: "estimate" },
    ],
    cal_dis: 0,
    cal_w: 0,
    cal_p: 0,
  }),
  computed: {
    countryStates() {
      return (
        this.$store.getters.getCountries?.find(
          (country) => country.alpha2 === this.country,
        )?.states || []
      );
    },
    currency() {
      return this.transportation.currency;
    },

    calculated_cost() {
      if (
        this.transportation.free_shipping &&
        this.cal_p >= this.transportation.free_shipping_limit
      ) {
        return 0;
      }

      const obj = this.selected_profile
        ? this.selected_profile
        : this.transportation;
      return (
        obj.const +
        (obj.distance_cof ? obj.distance_cof : 0) * this.cal_dis +
        (obj.weight_cof ? obj.weight_cof : 0) * this.cal_w +
        (obj.price_cof ? obj.price_cof : 0) * this.cal_p +
        (obj.distance_weight_cof ? obj.distance_weight_cof : 0) *
          this.cal_w *
          this.cal_p
      );
    },

    profiles() {
      return this.transportation?.profiles ? this.transportation.profiles : {};
    },
    profile_countries() {
      return Object.keys(this.profiles);
    },
    selected_profile() {
      const profile =
        this.country && this.profiles && this.profiles[this.country];
      if (profile && profile.states && this.state && profile.states[this.state])
        return profile.states[this.state];

      return profile;
    },
    preview_scope_label() {
      const profile = this.country && this.profiles[this.country];
      if (profile?.states?.[this.state])
        return this.$t(
          "transportation_manage.settings.calculator_preview.state_override",
        );
      return profile
        ? this.$t(
            "transportation_manage.settings.calculator_preview.country_profile",
          )
        : this.$t(
            "transportation_manage.settings.calculator_preview.worldwide",
          );
    },
    preview_region() {
      const profile = this.country && this.profiles[this.country];
      if (!profile) return "";
      const country = this.$store.getters.getCountries?.find(
        (item) => item.alpha2 === this.country,
      );
      const countryName = country?.name || this.country;
      if (!profile.states?.[this.state]) return countryName;
      const state = this.countryStates.find((item) => item.code === this.state);
      return `${countryName} · ${state?.name || this.state}`;
    },
    preview_breakdown() {
      const profile = this.selected_profile || this.transportation;
      return [
        {
          label: this.$t(
            "transportation_manage.settings.calculator_preview.fixed",
          ),
          amount: profile.const,
        },
        {
          label: this.$t("global.commons.distance"),
          amount: (profile.distance_cof || 0) * this.cal_dis,
        },
        {
          label: this.$t("global.commons.weight"),
          amount: (profile.weight_cof || 0) * this.cal_w,
        },
        {
          label: this.$t(
            "transportation_manage.settings.calculator_preview.order_value",
          ),
          amount: (profile.price_cof || 0) * this.cal_p,
        },
        {
          label: this.$t(
            "transportation_manage.settings.calculator_preview.combined",
          ),
          // Keep the existing calculator's weight × order-value term; this is an illustration, not a checkout quote.
          amount: (profile.distance_weight_cof || 0) * this.cal_w * this.cal_p,
        },
      ];
    },
    preview_subtotal() {
      return this.preview_breakdown.reduce((sum, part) => sum + part.amount, 0);
    },
    preview_available() {
      const profile = this.selected_profile || this.transportation;
      const samples = [this.cal_dis, this.cal_w, this.cal_p];
      const rates = [
        profile.const,
        profile.distance_cof ?? 0,
        profile.weight_cof ?? 0,
        profile.price_cof ?? 0,
        profile.distance_weight_cof ?? 0,
      ];
      return (
        typeof this.currency === "string" &&
        this.currency.length > 0 &&
        samples.every((value) => Number.isFinite(value) && value >= 0) &&
        rates.every(Number.isFinite) &&
        (!this.transportation.free_shipping ||
          (Number.isFinite(this.transportation.free_shipping_limit) &&
            this.transportation.free_shipping_limit >= 0)) &&
        Number.isFinite(this.preview_subtotal) &&
        Number.isFinite(this.calculated_cost)
      );
    },
    preview_free_applies() {
      return (
        this.transportation.free_shipping &&
        this.cal_p >= this.transportation.free_shipping_limit
      );
    },
  },

  watch: {},
  created() {
    if (!this.modern) return;
    this.cal_dis = 10;
    this.cal_w =
      { kg: 1, g: 1000, lb: 2, oz: 32 }[this.getWeightDimension(this.shop)] || 1;
    this.cal_p = 100;
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
.b-transportation-calculator {
  --calculator-flow-icon: 20px;
  --calculator-flow-gap: 10px;
  box-sizing: border-box;
  min-width: 0;
  padding: 20px;
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;

  h2 {
    margin-block: 8px 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
  }

  .b-transportation-calculator__inputs {
    position: relative;
    isolation: isolate;
    box-sizing: border-box;
    width: 100%;
    max-width: 360px;
    padding: 28px 22px;
    margin-block-start: 16px;
    filter: drop-shadow(0 2px 3px rgba(var(--v-theme-on-surface), 0.12));

    // Mask only the paper, so receipt teeth never clip input focus or controls.
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      background: color-mix(in srgb, rgb(var(--v-theme-surface)) 96%, rgb(var(--v-theme-on-surface)));
      mask:
        linear-gradient(#000 0 0) center / 100% calc(100% - 16px) no-repeat,
        conic-gradient(from 135deg at top, #000 90deg, transparent 0) top / 16px 8px repeat-x,
        conic-gradient(from -45deg at bottom, #000 90deg, transparent 0) bottom / 16px 8px repeat-x;
    }
  }

  .b-transportation-calculator__input-heading {
    display: flex;
    align-items: center;
    gap: 8px;

    > .v-icon { color: var(--sd-modern-muted); }
    h3 { margin: 0; font-size: 13px; font-weight: 500; line-height: 20px; }
  }

  .b-transportation-calculator__input-hint {
    margin-block: 6px 16px;
    padding-block-end: 16px;
    border-block-end: 1px dashed var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 1.6;
  }

  .b-transportation-calculator__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 8px 12px;

    > * {
      min-width: 0;
    }

    > :focus-within {
      outline: 2px solid rgba(var(--v-theme-primary), 0.65);
      outline-offset: 3px;
      border-radius: 6px;
    }

    :deep(.v-field--variant-plain .v-field__input) {
      font-family: inherit;
      font-size: 14px;
      font-weight: 400;
      line-height: 24px;
      font-variant-numeric: tabular-nums;
    }
  }

  .b-transportation-calculator__wide {
    grid-column: 1 / -1;
  }

  .b-transportation-calculator__summary {
    position: relative;
  }

  .b-transportation-calculator__flow {
    padding: 0;
    margin-block: 20px 0;
    list-style: none;
  }

  .b-transportation-calculator__step {
    position: relative;
    display: grid;
    grid-template-columns: var(--calculator-flow-icon) minmax(0, 1fr);
    align-items: start;
    gap: var(--calculator-flow-gap);
    padding-block-end: 20px;

    > div {
      position: relative;
      z-index: 1;
      min-width: 0;
      background: rgb(var(--v-theme-surface));
    }

    > .v-icon {
      z-index: 1;
      width: 20px;
      height: 20px;
      font-size: 16px;
      color: var(--sd-modern-muted);
      background: rgb(var(--v-theme-surface));
    }

    &:last-child {
      padding-block-end: 0;
    }

    h3 {
      margin: 0;
      font-size: 12px;
      font-weight: 500;
      line-height: 20px;
    }

    p {
      margin-block: 4px 0;
      font-size: 11px;
      line-height: 1.5;
      color: var(--sd-modern-muted);
    }
  }

  .b-transportation-calculator__breakdown {
    margin: 5px 0 0;
    font-size: 11px;
    line-height: 1.5;

    > div {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
      padding-block: 3px;
    }

    dt {
      color: var(--sd-modern-muted);
    }
    dd {
      margin: 0;
      text-align: end;
      font-variant-numeric: tabular-nums;
    }
  }

  .b-transportation-calculator__subtotal {
    margin-block-start: 4px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  .b-transportation-calculator__threshold {
    font-variant-numeric: tabular-nums;
  }

  .b-transportation-calculator__result {
    position: relative;
    display: grid;
    gap: 5px;
    padding: 13px;
    margin-block-start: 18px;
    background: var(--sd-modern-inset);
    border-radius: 10px;
    font-size: 11px;
    color: var(--sd-modern-muted);

    > :last-child {
      font-size: 19px;
      font-weight: 500;
      line-height: 1.4;
      color: rgb(var(--v-theme-on-surface));
      font-variant-numeric: tabular-nums;
    }

    > .b-transportation-calculator__unavailable {
      font-size: 12px;
    }
  }

  .b-transportation-calculator__estimate-anchor {
    position: absolute;
    inset-block: 0;
    inset-inline: calc(var(--calculator-flow-icon) + var(--calculator-flow-gap)) 0;
    pointer-events: none;
  }

  .b-transportation-calculator__caveat {
    margin-block: 9px 0;
    font-size: 11px;
    line-height: 1.6;
    color: var(--sd-modern-muted);
  }

  &.b-transportation-calculator--standalone {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 360px));
    align-items: start;
    justify-content: center;
    column-gap: 40px;
    padding: 22px 24px;

    > .sd-modern-eyebrow,
    > h2,
    > .b-transportation-calculator__caveat {
      grid-column: 1 / -1;
    }

    > h2 {
      font-size: 15px;
    }

    .b-transportation-calculator__summary {
      min-width: 0;
      width: 100%;
      max-width: 360px;
      margin-block-start: 16px;
    }

    .b-transportation-calculator__flow {
      margin-block-start: 0;
    }
    .b-transportation-calculator__caveat {
      margin-block-start: 20px;
    }
  }

  @media (max-width: 799px) {
    &.b-transportation-calculator--standalone {
      grid-template-columns: minmax(0, 360px);
      padding: 20px;

      .b-transportation-calculator__summary {
        margin-block-start: 24px;
      }
    }
  }

  @media (max-width: 599px) {
    .b-transportation-calculator__fields {
      grid-template-columns: minmax(0, 1fr);
      gap: 8px;
    }
    .b-transportation-calculator__inputs { padding: 24px 18px; }
  }
}

.cal-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;

  .cal-in {
    max-width: 140px;
    border: solid #aaa thin;
    margin: 0 6px;
  }

  i:not(.large) {
    margin: 0 6px;
    font-size: 100%;
  }
}
</style>
