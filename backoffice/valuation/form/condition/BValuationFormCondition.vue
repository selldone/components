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
  <div
    class="b-valuation-form-condition"
    :class="{ 'b-valuation-form-condition--modern': modern }"
  >
    <template v-if="can_add_conditions">
      <v-row no-gutters>
        <v-col class="p-1" cols="12" sm="6">
          <v-select
            v-model="axios_x"
            :items="
              structure_valuation.filter(
                (i) => !axios_y || i.name !== axios_y.name,
              )
            "
            clearable
            item-title="title"
            item-value="name"
            :label="
              modern ? $t('valuation_add.modern.first_condition') : undefined
            "
            :messages="modern ? undefined : 'First condition'"
            return-object
            :variant="modern ? 'outlined' : 'solo'"
            :density="modern ? 'compact' : undefined"
          ></v-select>
        </v-col>
        <v-col class="p-1" cols="12" sm="6">
          <v-select
            v-model="axios_y"
            :items="
              structure_valuation.filter(
                (i) => !axios_x || i.name !== axios_x.name,
              )
            "
            clearable
            item-title="title"
            item-value="name"
            :label="
              modern ? $t('valuation_add.modern.second_condition') : undefined
            "
            :messages="modern ? undefined : 'Second condition'"
            return-object
            :variant="modern ? 'outlined' : 'solo'"
            :density="modern ? 'compact' : undefined"
          ></v-select>
        </v-col>
      </v-row>

      <div
        v-if="axios_x && axios_y"
        :class="{ rtl: $vuetify.locale.isRtl }"
        class="cond-table small"
      >
        <!-- ▂▂▂▂▂▂▂▂▂▂▂ Header ▂▂▂▂▂▂▂▂▂▂▂ -->
        <div>
          <div class="cts"></div>
          <div
            v-for="x in axios_x.type === 'select'
              ? axios_x.selects
              : [`True`, `False`]"
            :key="x"
            class="cts"
          >
            <b>{{ x }}</b>
          </div>
        </div>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂ Rows ▂▂▂▂▂▂▂▂▂▂▂ -->

        <div
          v-for="y in axios_y.type === 'select'
            ? axios_y.selects
            : [`${axios_y.name}-TRUE`, `${axios_y.name}-FALSE`]"
          :key="y"
        >
          <!-- ▂▂▂▂▂▂ Rows > First column ▂▂▂▂▂▂ -->

          <div class="cts">
            <b>{{ y }}</b>
          </div>

          <!-- ▂▂▂▂▂▂ Rows > Cells status ▂▂▂▂▂▂ -->

          <div
            v-for="x in axios_x.type === 'select'
              ? axios_x.selects
              : [`${axios_x.name}-TRUE`, `${axios_x.name}-FALSE`]"
            :key="'c' + x"
            class="cts"
          >
            <v-btn
              v-if="modern"
              class="sd-modern-icon-button"
              icon
              variant="text"
              :aria-pressed="isUnavailable(x, y)"
              :aria-label="
                $t(
                  isUnavailable(x, y)
                    ? 'valuation_add.modern.condition_allow'
                    : 'valuation_add.modern.condition_block',
                ) +
                ': ' +
                x +
                ' / ' +
                y
              "
              @click="toggleCombination(x, y)"
            >
              <v-icon
                :color="isUnavailable(x, y) ? 'error' : 'success'"
                size="20"
                >{{ isUnavailable(x, y) ? "close" : "check" }}</v-icon
              >
              <v-tooltip
                activator="parent"
                location="top"
                :open-on-focus="true"
                content-class="sd-modern-tooltip text-start"
                :persistent="false"
                >{{
                  $t(
                    isUnavailable(x, y)
                      ? "valuation_add.modern.condition_allow"
                      : "valuation_add.modern.condition_block",
                  )
                }}</v-tooltip
              >
            </v-btn>
            <u-check
              v-else
              :model-value="
                !(
                  modelValue.unavailable.includes(`${x}:${y}`) ||
                  modelValue.unavailable.includes(`${y}:${x}`)
                )
              "
              title="Change availability (in stock / out of stock)"
              @update:model-value="
                (val) =>
                  val
                    ? modelValue.unavailable
                        .remove(`${x}:${y}`)
                        .remove(`${y}:${x}`)
                    : modelValue.unavailable.add(`${x}:${y}`)
              "
            ></u-check>
          </div>
        </div>
      </div>
    </template>

    <div
      v-else
      :class="modern ? 'sd-modern-empty-state' : 'pa-12 text-center text-muted'"
    >
      <v-icon class="me-1">info_outline</v-icon>
      {{
        modern
          ? $t("valuation_add.modern.conditions_empty")
          : "It needs at least two selectable items."
      }}
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "BValuationFormCondition",
  components: {},
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
    modern: { type: Boolean, default: false },

    shop: {
      required: true,
      type: Object,
    },

    structure: {
      required: false,
      type: Array,
    },
  },

  data: () => ({
    axios_x: null,
    axios_y: null,

    collapse: false,
  }),

  computed: {
    structure_valuation() {
      return (
        this.structure &&
        this.structure.filter(
          (i) => ["select", "switch"].includes(i.type) && i.name,
        )
      );
    },

    can_add_conditions() {
      return this.structure_valuation && this.structure_valuation.length >= 2;
    },
  },

  watch: {
    can_add_conditions() {
      this.autoSelect();
    },
  },
  created() {
    this.check();
    this.autoSelect();
  },
  methods: {
    isUnavailable(x, y) {
      return (
        this.modelValue.unavailable.includes(`${x}:${y}`) ||
        this.modelValue.unavailable.includes(`${y}:${x}`)
      );
    },
    toggleCombination(x, y) {
      if (this.isUnavailable(x, y)) {
        this.modelValue.unavailable.remove(`${x}:${y}`).remove(`${y}:${x}`);
      } else {
        this.modelValue.unavailable.add(`${x}:${y}`);
      }
    },
    check() {
      let conditions = this.modelValue;

      if (!conditions || Array.isArray(conditions)) {
        conditions = { unavailable: [] };
      } else if (
        !conditions.unavailable ||
        !Array.isArray(conditions.unavailable)
      ) {
        conditions.unavailable = [];
      }

      this.$emit("update:modelValue", conditions);
    },

    autoSelect() {
      if (this.can_add_conditions && !this.axios_x && !this.axios_y) {
        this.axios_x = this.structure_valuation[0];
        this.axios_y = this.structure_valuation[1];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.cond-table {
  overflow-x: auto;
  text-align: center;

  & > div {
    display: flex;

    &:first-child {
      // First row (Header)
      .cts {
        border-top: 1px solid #dee2e6;

        &:first-child {
          // First top left cell
          border-top: none;
          border-left: none;
          background: unset;
        }
      }
    }
  }

  .cts {
    // All cells
    padding: 6px;
    width: 72px;
    min-width: 72px;
    border-right: 1px solid #dee2e6;
    border-bottom: 1px solid #dee2e6;
    background: #fff;

    &:first-child {
      // First column
      width: 120px;
      min-width: 120px;

      text-align: start;
      border-left: 1px solid #dee2e6;
    }
  }

  &.rtl {
    & > div {
      &:first-child {
        .cts {
          &:first-child {
            border-right: none;
            border-left: 1px solid #dee2e6;
          }
        }
      }
    }

    .cts {
      border-right: unset;
      border-left: 1px solid #dee2e6 !important;

      &:first-child {
        border-left: unset;
        border-right: 1px solid #dee2e6;
      }
    }
  }
}

.b-valuation-form-condition--modern {
  min-width: 0;

  .cond-table {
    max-width: 100%;
    padding-block-end: 4px;
  }

  .cond-table .cts {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
    border-color: var(
      --sd-modern-border,
      rgba(var(--v-theme-on-surface), 0.09)
    );
    overflow-wrap: anywhere;
  }

  .cond-table .cts:first-child {
    justify-content: flex-start;
  }

  .cond-table .cts > b {
    font-weight: 500;
  }
}
</style>
