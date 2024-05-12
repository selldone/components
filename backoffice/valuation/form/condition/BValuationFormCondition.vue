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
          messages="First condition"
          return-object
          variant="solo"
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
          messages="Second condition"
          return-object
          variant="solo"
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
          <u-check
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

  <div v-else class="pa-12 text-center text-muted">
    <v-icon class="me-1">info_outline</v-icon>
    It needs at least two selectable items.
  </div>
</template>

<script>
export default {
  name: "BValuationFormCondition",
  components: {},
  emits: ["update:modelValue"],
  props: {
    modelValue: {},

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
</style>
