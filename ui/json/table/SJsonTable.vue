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
  <div>
    <div v-if="!value || isString(value)">{{ value }}</div>

    <v-table
      v-else-if="isObject(value) || Array.isArray(value)"
      :class="{ dense: dense }"
      :dark="dark"
      :density="dense?'compact':undefined"
      class="mx-2 bg-transparent thin-scroll"
    >
      <template v-slot:default>
        <thead class="text-start">
          <tr>
            <th>Record</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody class="text-start">
          <tr
            v-for="(val, key) in value"
            :key="key"
            :class="highlights && highlights[key]"
            class=""
          >
            <!-- Json -->

            <td v-if="!nested && jsonEnable && (isObject(val) || Array.isArray(val))" colspan="2">
              <h4 class="my-2">{{ key }}</h4>
              <vue-json-pretty :data="val" class="limited-height">
              </vue-json-pretty>
            </td>

            <!-- Chart -->

            <!-- Nested table -->

            <td
              v-else-if="nested && val && (Array.isArray(val) || isObject(val))"
              colspan="2"
            >
              <h3 class="mt-3 mb-2 text-blue">{{ key }}</h3>

              <!-- Chart -->

              <v-sparkline
                v-if="
                  charts &&
                  charts[key] &&
                  charts[key] === 'spark' &&
                  Array.isArray(val) &&
                  val.length
                "
                :gradient="
                  val[val.length - 1] >= val[0]
                    ? ['#2f976e', '#1ca2d7']
                    : ['#847', '#F48']
                "
                :height="30"
                :line-width="0.6"
                :smooth="3"
                :value="val"
                auto-draw
                padding="3"
                stroke-linecap="round"
              >
              </v-sparkline>

              <!-- Table -->
              <SJsonTable
                v-else
                :dense="dense"
                :htmlEnable="htmlEnable"
                :json-enable="jsonEnable"
                :value="val"
              ></SJsonTable>
            </td>

            <!-- Print values -->
            <template v-else>
              <td>
                {{ getName(key) }}<br />
                <small v-if="!dense">{{ key }}</small>
              </td>
              <td>
                <p v-if="val && Array.isArray(val)">{{ val.join(", ") }}</p>
                <div
                  v-else-if="
                    val &&
                    typeof val === 'object' &&
                    Object.keys(val).length > 0
                  "
                >
                  <p v-for="(d_v, d_K) in val" :key="'d-' + d_K">
                    <b>{{ d_K }}: </b>{{ d_v }}
                  </p>
                </div>
                <u-check
                  v-else-if="typeof val === 'boolean'"
                  :model-value="val"
                  read-only
                ></u-check>
                <span
                  v-else-if="val && (typeof val == 'number' || val.isNumber())"
                  >{{ numeralFormat(val, "0,0.[000]") }}</span
                >
                <span v-else-if="htmlEnable" v-html="val"></span>
                <span v-else>{{ val }}</span>
              </td>
            </template>
          </tr>
        </tbody>
      </template>
    </v-table>
  </div>
</template>

<script lang="ts">
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

export default {
  name: "SJsonTable",
  components: { VueJsonPretty },
  props: {
    value: {},

    dense: {
      default: false,
      type: Boolean,
    },
    dark: {
      default: false,
      type: Boolean,
    },
    htmlEnable: {
      default: false,
      type: Boolean,
    },
    nested: {
      default: false,
      type: Boolean,
    },
    highlights: {},
    charts: {},

    jsonEnable: {
      default: false,
      type: Boolean,
    },
  },
};
</script>

<style lang="scss" scoped>
.dense {
  p {
    margin: 0;
  }
}
</style>
