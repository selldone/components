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
  <v-menu max-width="640" min-width="400" offset-y rounded="lg">
    <template v-slot:activator="{ props }">
      <v-btn
        :title="`${keywords}\n\nClick to view details...`"
        icon
        v-bind="props"
        @click.stop
      >
        <img height="16" src="../../assets/trademark/google.svg" width="16" />
      </v-btn>
    </template>
    <v-sheet class="pa-2 small text-start" color="#fafafa">
      <img
        class="me-1"
        height="16"
        src="../../assets/trademark/google.svg"
        width="16"
      />
      <b>Google Search Console</b>

      <div v-if="queries" class="my-2">
        <v-table class="rounded-lg" dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-center">#</th>
                <th>Keyword</th>
                <th>
                  <v-icon class="me-1" size="small">visibility</v-icon>
                  Impressions
                </th>
                <th>
                  <v-icon class="me-1" size="small">ads_click</v-icon>
                  Clicks
                </th>
                <th>
                  <v-icon class="me-1" size="small">bolt</v-icon>
                  CTR
                </th>
                <th>
                  <v-icon class="me-1" size="small">radar</v-icon>
                  Position
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in queries" :key="index">
                <td class="text-muted text-center">{{ index + 1 }}</td>
                <td>{{ decodeURIComponent(item.keys) }}</td>
                <td>{{ numeralFormat(item.impressions, "0.[0]a") }}</td>
                <td>{{ numeralFormat(item.clicks, "0.[0]a") }}</td>
                <td>
                  <div>
                    {{ numeralFormat(item.ctr, "%0.[00]") }}
                    <span class="mx-1">
                      <u-progress-score
                        :size="16"
                        :value="$SEO.CTRScore(item.ctr)"
                        :width="2"
                      ></u-progress-score
                    ></span>
                  </div>
                </td>
                <td>{{ numeralFormat(item.position, "0.[0]") }}</td>
              </tr>
            </tbody>
          </template>
        </v-table>
      </div>

      <div v-if="countries" class="my-2">
        <v-table class="rounded-lg" dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-center">#</th>
                <th>Country</th>
                <th>
                  <v-icon class="me-1" size="small">visibility</v-icon>
                  Impressions
                </th>
                <th>
                  <v-icon class="me-1" size="small">ads_click</v-icon>
                  Clicks
                </th>
                <th>
                  <v-icon class="me-1" size="small">bolt</v-icon>
                  CTR
                </th>
                <th>
                  <v-icon class="me-1" size="small">radar</v-icon>
                  Position
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in countries" :key="index">
                <td class="text-muted text-center">{{ index + 1 }}</td>
                <td>
                  <flag
                    :iso="item.keys.toUpperCase()"
                    :squared="false"
                    class="me-2"
                  />
                  <small>{{ getCountryName(item.keys) }}</small>
                </td>
                <td>{{ numeralFormat(item.impressions, "0.[0]a") }}</td>
                <td>{{ numeralFormat(item.clicks, "0.[0]a") }}</td>
                <td>
                  <div>
                    {{ numeralFormat(item.ctr, "%0.[00]") }}
                    <span class="mx-1">
                      <u-progress-score
                        :size="16"
                        :value="$SEO.CTRScore(item.ctr)"
                        :width="2"
                      ></u-progress-score
                    ></span>
                  </div>
                </td>
                <td>{{ numeralFormat(item.position, "0.[0]") }}</td>
              </tr>
            </tbody>
          </template>
        </v-table>
      </div>
    </v-sheet>
  </v-menu>
</template>

<script>
import UProgressScore from "../../ui/progress/score/UProgressScore.vue";
import numeral from "numeral";

export default {
  name: "SSearchConsoleAuditMenu",
  components: { UProgressScore },
  props: {
    audit: { required: true, type: Object },
  },
  data() {
    return {};
  },

  computed: {
    queries() {
      return this.audit.queries;
    },
    countries() {
      return this.audit.countries;
    },
    keywords() {
      let out = [];
      this.queries?.forEach((it) => {
        out.push(
          `${decodeURIComponent(it.keys)} 🠞 ${numeral(it.position).format(
            "0.[0]",
          )}`,
        );
      });
      return out.join("\n");
    },
  },
  created() {},
  methods: {},
};
</script>

<style scoped></style>
