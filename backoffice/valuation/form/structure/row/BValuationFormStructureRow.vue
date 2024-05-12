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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="b--valuation-form-structure-row">
    <v-row align="center" no-gutters class="py-1">
      <v-icon class="handle cursor-move" title="Drag and move">
        unfold_more
      </v-icon>

      <v-icon class="mx-1">{{ getType(element.type).icon }}</v-icon>

      <b class="mx-1 small">{{ element.title }}</b>
      <span class="mx-1 small">/ {{ $t(getType(element.type).title) }}</span>

      <v-spacer></v-spacer>

      <v-btn
          :title="$t('global.actions.delete')"
        size="small"
        variant="text"
        color="#fff"
        @click="local_collapse = !local_collapse"
        class="mx-2"
        icon
        :class="{ 'rotate-180': !local_collapse }"
      >
        <v-icon size="20">arrow_drop_down</v-icon>
      </v-btn>

      <u-button-circle
        :title="$t('global.actions.delete')"
        icon="close"
        @click="$emit('remove')"
      />
    </v-row>
    <v-expand-transition>
      <div v-if="!local_collapse">
        <div class="b--valuation-item">
          <!-- ████████████████████████ General Attributes ████████████████████████ -->

          <v-text-field
            v-model="element.title"
            persistent-placeholder
            :label="$t('global.form_builder.title_input')"
            :rules="[GlobalRules.required()]"
            color="primary"
            messages=" "
            placeholder="Public label. Ex: Name, Prefer state, Description, ..."
            @blur="
              element.name = element.name
                ? element.name
                : slugify(element.title.substring(0, 32))
            "
            variant="underlined"
          >
            <template v-slot:message>
              <u-smart-suggestion
                :samples="$tm('suggestions.valuation.structure.title')"
                @select="
                  (v) => {
                    element.title = v;
                    element.name = slugify(element.title.substring(0, 32));
                  }
                "
              >
              </u-smart-suggestion>
            </template>
          </v-text-field>
          <v-text-field
            v-if="
              !element.type || ['select', 'text', 'file'].includes(element.type)
            "
            v-model="element.placeholder"
            :label="$t('global.form_builder.placeholder_input')"
            color="primary"
            placeholder="Ex: Select an item..."
            variant="underlined"
          >
          </v-text-field>

          <v-text-field
            v-model="element.name"
            :label="$t('global.form_builder.name_input')"
            :rules="[GlobalRules.counter(32), GlobalRules.required()]"
            color="primary"
            counter="32"
            placeholder="Ex: name, state, desc, ..."
            hint="Unique name for the system."
            variant="underlined"
            :append-inner-icon="lock_name ? 'lock_open' : 'lock'"
            @click:append-inner="lock_name = !lock_name"
            :disabled="lock_name"
            persistent-placeholder
          />

          <template v-if="element.type === 'switch'">
            <hr />
            <v-text-field
              v-model="element.true_title"
              color="primary"
              label="True value title"
              variant="underlined"
              persistent-placeholder
              placeholder="Ex: Active, On, Yes, ..."
              append-inner-icon="check_circle_outline"
            />
            <v-text-field
              v-model="element.true_desc"
              color="primary"
              label="True value description"
              variant="underlined"
              persistent-placeholder
              placeholder="Ex: I want to..."
              append-inner-icon="check_circle_outline"
            />

            <v-text-field
              v-model="element.false_title"
              color="primary"
              label="False value title"
              variant="underlined"
              persistent-placeholder
              placeholder="Ex: Inactive, Off, No, ..."
              append-inner-icon="highlight_off"
            />
            <v-text-field
              v-model="element.false_desc"
              color="primary"
              label="False value description"
              variant="underlined"
              persistent-placeholder
              placeholder="Ex: I don't want to..."
              append-inner-icon="highlight_off"
            />
            <hr />
          </template>

          <!-- ████████████████████████ select ████████████████████████ -->
          <template v-if="element.type === 'select'">
            <v-combobox
              v-model="element.selects"
              :items="[]"
              :label="$t('global.form_builder.value_input')"
              :messages="$t('global.form_builder.value_input_message')"
              :rules="[GlobalRules.required()]"
              chips
              closable-chips
              clearable
              multiple
              @update:model-value="$forceUpdate()"
              variant="underlined"
            >
              <template v-slot:chip="{ item, props }">
                <v-chip v-bind="props">
                  {{ item.raw }}
                </v-chip>
              </template>
            </v-combobox>
          </template>

          <!-- ████████████████████████ switch ████████████████████████ -->

          <u-smart-switch
            v-if="element.type === 'switch'"
            v-model="element.default"
            :label="$t('global.form_builder.default')"
            false-icon="close"
            false-title="False"
            true-icon="check"
            true-title="True"
            border
          >
          </u-smart-switch>

          <!-- ████████████████████████ Number ████████████████████████ -->

          <u-smart-switch
            v-if="element.type === 'number'"
            v-model="element.decimal"
            false-description="Ex. 10, 15, 18, ..."
            false-title="Integer"
            true-description="Ex. 12.5, 18.30, ... (Two floating digits are permitted!)"
            true-title="Decimal"
            border
          >
          </u-smart-switch>

          <!-- ████████████████████████ Pricing ████████████████████████ -->
          <u-smart-switch
            v-if="['select', 'switch', 'number'].includes(element.type)"
            v-model="element.pricing"
            :false-title="$t('global.actions.no')"
            :force-show-all="false"
            :true-title="$t('global.actions.yes')"
            class="my-3"
            false-description="It has no effect on the price."
            false-gray
            label="Valuation"
            true-description="It affects the price calculation."
            true-icon="functions"
            border
          ></u-smart-switch>

          <!-- ▅▅▅▅▅▅▅▅▅ Pricing > Enable ▅▅▅▅▅▅▅▅▅ -->
          <v-expand-transition>
            <div v-if="element.pricing">
              <!-- ▅▅▅▅▅▅▅▅▅ Pricing > select / switch ▅▅▅▅▅▅▅▅▅ -->

              <template
                v-if="element.type === 'select' || element.type === 'switch'"
              >
                <u-smart-switch
                  v-model="element.sum"
                  class="my-3"
                  false-description="Primary product cost multiplied by a constant. For example, to increase the price by 15%, it should be 1.15"
                  false-icon="close"
                  false-title="Multiplication"
                  label="Pricing formula"
                  true-description="Add a constant value to the primary product pricing."
                  true-icon="add"
                  true-title="Sum"
                  @change="(sum) => setAction(element, sum)"
                  border
                >
                </u-smart-switch>

                <v-table>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th>Option</th>
                        <th class="text-center">Value</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="select in element.type === 'select'
                          ? element.selects
                          : ['true', 'false']"
                        :key="select"
                      >
                        <td>{{ select }}</td>
                        <td>
                          <!-- Sum mode -->
                          <u-price-input
                            v-if="element.sum"
                            v-model="element.lookup[select]"
                            :currency="sampleProduct.currency"
                            allow-negative
                            class="strong-field center-input"
                            dense
                            flat
                            hide-details
                            solo
                            @update:model-value="$forceUpdate()"
                          ></u-price-input>
                          <!-- Multiply mode -->
                          <u-number-input
                            v-else
                            v-model="element.lookup[select]"
                            :decimal="2"
                            :min="0"
                            :step="0.1"
                            class="strong-field center-input"
                            dense
                            flat
                            hide-details
                            solo
                            @update:model-value="$forceUpdate()"
                          ></u-number-input>
                        </td>
                        <td>
                          <!-- Sum mode -->
                          <u-price
                            v-if="element.sum"
                            :amount="
                              sampleProduct.price +
                              (element.lookup[select]
                                ? element.lookup[select]
                                : 0)
                            "
                            :currency="sampleProduct.currency"
                          ></u-price>
                          <!-- Multiply mode -->
                          <u-price
                            v-else
                            :amount="
                              sampleProduct.price * element.lookup[select]
                            "
                            :currency="sampleProduct.currency"
                          ></u-price>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-table>
              </template>

              <!-- ▅▅▅▅▅▅▅▅▅ Pricing > Number ▅▅▅▅▅▅▅▅▅ -->

              <template v-if="element.type === 'number'">
                <!-- Multiply factor -->
                <u-number-input
                  v-model="element.factor"
                  :decimal="5"
                  :min="0"
                  :step="0.1"
                  class="strong-field center-input"
                  hide-details
                  label="Input factor"
                  messages="Add user input value * Input factor to the price."
                  @update:model-value="$forceUpdate()"
                  variant="underlined"
                ></u-number-input>

                <div>
                  <v-list-subheader>Some calculated example</v-list-subheader>
                  <v-list-subheader class="pa-1">
                    If user enter <b>1</b>:
                    <u-price
                      :amount="
                        sampleProduct.price +
                        (element.factor ? element.factor : 0) * 1
                      "
                      :currency="sampleProduct.currency"
                      class="mx-2"
                    ></u-price>
                  </v-list-subheader>
                  <v-list-subheader class="pa-1">
                    If user enter <b>10</b>:
                    <u-price
                      :amount="
                        sampleProduct.price +
                        (element.factor ? element.factor : 0) * 10
                      "
                      :currency="sampleProduct.currency"
                      class="mx-2"
                    ></u-price>
                  </v-list-subheader>
                </div>
              </template>
            </div>
          </v-expand-transition>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import USmartSwitch from "../../../../../ui/smart/switch/USmartSwitch.vue";
import UNumberInput from "../../../../../ui/number/input/UNumberInput.vue";
import UPriceInput from "../../../../../ui/price/input/UPriceInput.vue";
import USmartSuggestion from "../../../../../ui/smart/suggestion/USmartSuggestion.vue";
import { ValuationStructureItemType } from "../../../ValuationStructureItemType.ts";

export default {
  name: "BValuationFormStructureRow",
  components: {
    USmartSuggestion,
    UPriceInput,
    UNumberInput,
    USmartSwitch,
  },
  emits: ["remove"],
  props: {
    element: {
      required: true,
      type: Object,
    },

    collapse: Boolean.prototype,

    sampleProduct: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    types: ValuationStructureItemType,
    lock_name: true,
    local_collapse: false,
  }),

  computed: {},

  watch: {
    collapse() {
      this.local_collapse = this.collapse;
    },
  },
  created() {
    this.local_collapse = this.collapse;
  },
  methods: {
    getType(type) {
      let out = this.types.find((i) => i.value === type);
      return out ? out : this.types[0];
    },

    setAction(item, sum) {
      if (item.type === "select") {
        if (!item.selects) item.selects = [];

        if (!item.lookup || Array.isArray(item.lookup)) item.lookup = {};

        item.selects.forEach((select) => {
          item.lookup[select] = sum ? 0 : 1;
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.b--valuation-form-structure-row {
  position: relative;
  transition: all 0.4s ease-in-out;

  position: relative;
  background: #0061e0;
  padding: 6px;
  border-radius: 14px;
  color: #fff;

  .b--valuation-item {
    color: #000;
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    position: relative;
  }
}
</style>
