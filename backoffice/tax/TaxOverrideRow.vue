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
  <tr
    :title="edit_mode ? undefined : 'Click to edit!'"
    @click="edit_mode = true"
  >
    <td class="min-width-250">
      <div class="d-flex align-center">
        <s-state-flag
          v-if="vat.region"
          :country="vat.country"
          :region="vat.region"
          class="me-3"
        />

        <div class="flex-grow-1">
          <div class="font-weight-black">
            <span v-if="vat.region"> {{ vat.region }}</span>
            <span v-else
              >{{ getCountryName(vat.country) }}
              <v-icon
                v-if="defaultCountryRule"
                class="mx-1"
                color="#111"
                title="Default country rule"
                >outlined_flag</v-icon
              >
            </span>

            <img
              v-if="vat.eu"
              class="ms-2"
              height="20"
              src="../../assets/icons/europe.svg"
              width="20"
            />
          </div>

          <div class="text-muted">
            <tax-region-type-view :type="vat.type"></tax-region-type-view>
          </div>
        </div>

        <v-chip
          v-if="override_rule"
          class="ms-1"
          color="cyan"
          pill
          size="small"
        >
          ● Override
        </v-chip>
      </div>
    </td>

    <td class="min-width-150">
      <v-text-field
        v-if="edit_mode"
        v-model="label_value"
        density="compact"
        flat
        hide-details
        label="Label"
        variant="solo"
      ></v-text-field>
      <span v-else class="typo-body">
        {{ label_value }}
      </span>
    </td>

    <td class="text-center min-width-150">
      <s-number-input
        v-if="edit_mode"
        v-model="tax_value"
        :decimal="3"
        :max="100"
        :step="0.1"
        class="strong-field"
        dense
        filled
        flat
        hide-details
        solo
        suffix="%"
      ></s-number-input>
      <b v-else class="typo-body"> {{ tax_value }}% </b>
    </td>

    <td class="text-center min-width-150">
      <s-number-input
        v-if="edit_mode"
        v-model="cvat_value"
        :decimal="3"
        :max="100"
        :step="0.1"
        class="strong-field"
        dense
        filled
        flat
        hide-details
        solo
        suffix="%"
      ></s-number-input>
      <b v-else class="typo-body"> {{ cvat_value }}% </b>
    </td>
    <td class="text-center min-width-150">
      <s-number-input
        v-if="edit_mode"
        v-model="bvat_value"
        :decimal="3"
        :max="100"
        :step="0.1"
        class="strong-field"
        dense
        filled
        flat
        hide-details
        solo
        suffix="%"
      ></s-number-input>
      <b v-else class="typo-body"> {{ bvat_value }}% </b>
    </td>

    <td class="text-center min-width-150">
      <s-number-input
        v-if="edit_mode"
        v-model="shipping_value"
        :decimal="3"
        :max="100"
        :step="0.1"
        class="strong-field"
        dense
        filled
        flat
        hide-details
        solo
        suffix="%"
      ></s-number-input>
      <b v-else class="typo-body"> {{ shipping_value }}% </b>
    </td>

    <td class="text-center min-width-100">
      <v-btn
        v-if="edited"
        :loading="busy_set"
        class="ma-1"
        color="primary"
        title="Save my tax rule."
        variant="elevated"
        @click.stop="setOverrideTax()"
      >
        <v-icon class="me-1" size="small">save </v-icon>
        {{ $t("global.actions.save") }}
      </v-btn>
      <v-btn
        v-else-if="override_rule"
        :loading="busy_delete"
        class="ma-1"
        color="primary"
        title="Remove my custom rule (Override)."
        variant="elevated"
        @click.stop="deleteOverride()"
      >
        <v-icon class="me-1" size="small">refresh</v-icon>
        {{ $t("global.actions.reset_default") }}
      </v-btn>
    </td>
  </tr>
</template>

<script>
import SNumberInput from "@components/ui/input/number/SNumberInput.vue";
import TaxRegionTypeView from "@components/backoffice/tax/TaxRegionTypeView.vue";

export default {
  name: "TaxOverrideRow",
  components: {
    TaxRegionTypeView,
    SNumberInput,
  },
  props: {
    shop: { required: true, type: Object },
    vat: { required: true, type: Object }, //Fixed value (Constant define in SD admin panel).
    profile: {}, //Override rules for a profile.
    overrides: { required: true }, // User override rules.

    defaultCountryRule: {
      // Used in multi state countries to indicated default rule!
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    busy_set: false,
    busy_delete: false,

    label_value: null,
    tax_value: null,
    cvat_value: null,
    bvat_value: null,
    shipping_value: null,

    edit_mode: false,
  }),

  computed: {
    edited() {
      const vat_id = this.vat.id;

      let saved_override = this.overrides.find((it) => it.vat_id === vat_id);
      // if (!saved_override) saved_override = {};

      let out =
        (this.tax_value !== null &&
          this.tax_value !== this.vat.tax &&
          (!saved_override || this.tax_value !== saved_override.tax)) ||
        (this.cvat_value !== null &&
          this.cvat_value !== this.vat.cvat &&
          (!saved_override || this.cvat_value !== saved_override.cvat)) ||
        (this.bvat_value !== null &&
          this.bvat_value !== this.vat.bvat &&
          (!saved_override || this.bvat_value !== saved_override.bvat)) ||
        (this.label_value !== null &&
          this.label_value !== this.vat.label &&
          (!saved_override || this.label_value !== saved_override.label)) ||
        (this.shipping_value !== null &&
          this.shipping_value !== this.vat.shipping &&
          (!saved_override || this.shipping_value !== saved_override.shipping));

      return out;
    },

    override_rule() {
      return (
        this.overrides && this.overrides.find((it) => it.vat_id === this.vat.id)
      );
    },
  },

  created() {
    this.tax_value = this.vat.tax;
    this.cvat_value = this.vat.cvat;
    this.bvat_value = this.vat.bvat;
    this.label_value = this.vat.label;
    this.shipping_value = this.vat.shipping;

    // Overrides:
    const override = this.override_rule;
    if (override) {
      this.tax_value = override.tax;
      this.cvat_value = override.cvat;
      this.bvat_value = override.bvat;
      this.label_value = override.label;
      this.shipping_value = override.shipping;
    }
  },

  methods: {
    setOverrideTax() {
      this.busy_set = true;

      axios
        .post(
          window.API.POST_SET_OVERRIDE_SHOP_TAX(this.shop.id, this.vat.id),
          {
            profile_id: this.profile ? this.profile.id : null,
            tax: this.tax_value,
            cvat: this.cvat_value,
            bvat: this.bvat_value,
            label: this.label_value,
            shipping: this.shipping_value,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.overrides, data.override);
            this.$emit("set", data.override);
            this.showSuccessAlert(
              null,
              "The overriding rule has been updated successfully.",
            );

            this.edit_mode = false;
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

    deleteOverride() {
      // Reset to default:
      this.tax_value = this.vat.tax;
      this.cvat_value = this.vat.cvat;
      this.bvat_value = this.vat.bvat;
      this.label = this.vat.label_value;
      this.shipping_value = this.vat.shipping;

      this.busy_delete = true;

      axios
        .delete(window.API.DELETE_SHOP_TAX(this.shop.id, this.vat.id))
        .then(({ data }) => {
          if (!data.error) {
            this.DeleteItemByID(this.overrides, data.id);
            this.$emit("delete", data.id);
            this.showSuccessAlert(
              null,
              "The overriding rule has been removed successfully.",
            );
            this.edit_mode = false;
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

<style scoped></style>
