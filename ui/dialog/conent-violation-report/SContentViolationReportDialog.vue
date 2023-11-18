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
  <v-bottom-sheet
    :value="value"
    @input="
      (val) => {
        $emit('input', val);
        if (!val) report = null;
      }
    "
    width="98vw"
    :max-width="840"
    scrollable
    content-class="rounded-t-xl"
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title>
        <v-icon class="me-2" color="#111">report</v-icon>
        {{
          canDelete
            ? $t("global.article.report_dialog.report_and_delete_title")
            : $t("global.article.report_dialog.report_title")
        }}
        <v-spacer></v-spacer>
        <v-btn large icon @click="$emit('input', false)">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle>
        {{ $t("global.article.report_dialog.message") }}
      </v-card-subtitle>
      <v-card-text class="thin-scroll">
        <v-radio-group v-model="report" active-class="shadow-paper-small" class="max-widget-width">
          <v-radio
            v-for="(item, key, i) in ArticleReport"
            :key="item.value"
            :label="$t(item.title)"
            :value="item.value"
            color="red"
            class="my-1 border p-3 rounded-18px flipInX"
            :style="{ 'animation-delay': i * 50 + 'ms' }"
          />
        </v-radio-group>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn text @click="s$emit('value', false)" x-large>
            <v-icon class="me-1">close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            v-if="canDelete"
            depressed
            x-large
            dark
            color="red"
            :disabled="!report"
            @click="$emit('delete', report)"
            :loading="loading"
          >
            <v-icon class="me-1">delete</v-icon>
            {{ $t("global.article.report_dialog.accept_and_delete_action") }}
          </v-btn>
          <v-btn
            v-else
            depressed
            dark
            x-large
            color="red"
            :disabled="!report"
            @click="sendReport"
            :loading="loading"
          >
            <v-icon class="me-1">check</v-icon>
            {{ $t("global.actions.accept") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { ArticleReport } from "@core/enums/article/ArticleReport";

export default {
  name: "SContentViolationReportDialog",
  props: {
    value: {},
    canDelete: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      ArticleReport: ArticleReport,

      report: null,
    };
  },
  methods: {
    sendReport() {
      if (!this.USER()) {
        return this.NeedLogin();
      }
      this.$emit("report", this.report);
    },
  },
};
</script>

<style scoped></style>
