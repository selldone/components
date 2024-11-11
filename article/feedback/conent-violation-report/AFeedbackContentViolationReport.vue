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
    :max-width="840"
    :model-value="modelValue"
    content-class="rounded-t-xl"
    scrollable
    width="98vw"
    @update:model-value="
      (val) => {
        $emit('update:modelValue', val);
        if (!val) report = null;
      }
    "
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
        <v-btn icon size="large" @click="$emit('update:modelValue', false)">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle>
        {{ $t("global.article.report_dialog.message") }}
      </v-card-subtitle>
      <v-card-text class="thin-scroll">
        <v-radio-group v-model="report" class="max-widget-width">
          <v-radio
            v-for="(item, key, i) in ArticleReport"
            :key="item.value"
            :label="$t(item.title)"
            :style="{
              'animation-delay': i * 50 + 'ms',
              'shadow-paper-small': report === item.value,
            }"
            :value="item.value"
            class="my-1 border p-3 rounded-18px flipInX"
            color="red"
          />
        </v-radio-group>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="$emit('update:modelValue', false)"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            v-if="canDelete"
            :disabled="!report"
            :loading="loading"
            color="red"
            size="x-large"
            variant="flat"
            @click="$emit('delete', report)"
          >
            <v-icon class="me-1">delete</v-icon>
            {{ $t("global.article.report_dialog.accept_and_delete_action") }}
          </v-btn>
          <v-btn
            v-else
            :disabled="!report"
            :loading="loading"
            color="red"
            size="x-large"
            variant="flat"
            @click="sendReport"
          >
            <v-icon class="me-1">check</v-icon>
            {{ $t("global.actions.accept") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { ArticleReport } from "@selldone/core-js";

export default {
  name: "AFeedbackContentViolationReport",
  emits: ["update:modelValue", "report", "delete"],
  props: {
    modelValue: {},
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
      ArticleReport: ArticleReport.Categories,

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
