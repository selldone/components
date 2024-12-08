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
  <v-bottom-sheet
    :model-value="modelValue"
    @update:model-value="(v) => $emit('update:modelValue', v)"
    width="840"
    max-width="98vw"
    scrollable
    content-class="rounded-t-xl"
  >
    <v-card rounded="t-xl" class="text-start">
      <v-card-title>
        <v-icon class="me-2">auto_fix_normal</v-icon>
        {{ $t("orders_bulk_export.title") }}
        | <img v-if="type" :src="type.basket" width="24" height="24" class="mx-1">
        {{ $t(type.name )}}
      </v-card-title>
      <v-card-text>
        <div class="widget-box mb-5">
          <u-widget-header
            :title="$t('orders_bulk_export.timespan.title')"
            icon="date_range"
          >
          </u-widget-header>

          <v-list-subheader
            >{{ $t("orders_bulk_export.subtitle") }}
          </v-list-subheader>

          <v-list-subheader>
            {{ $t("orders_bulk_export.timespan.subtitle") }}
          </v-list-subheader>

          <u-date-input
            v-model="start"
            :label="$t('global.commons.start_date')"
            :placeholder="$t('global.placeholders.select_date')"
            clearable
            date-only
            return-utc
          />

          <u-date-input
            v-model="end"
            :disabled="!start"
            :label="$t('global.commons.end_date')"
            :min="start"
            :placeholder="$t('global.commons.now')"
            clearable
            date-only
            return-utc
          />
        </div>

        <div class="widget-box mb-5">
          <u-widget-header
            :title="$t('orders_bulk_export.tasks.title')"
            icon="splitscreen"
          >
          </u-widget-header>

          <v-list-subheader>
            {{ $t("orders_bulk_export.tasks.subtitle") }}
          </v-list-subheader>

          <s-export-format-select
            :csv="csv"
            :excel="excel"
            :pdf="pdf"
            :type="$t('orders_bulk_export.tasks.export_title')"
            dense
          >
          </s-export-format-select>
        </div>

        <div class="widget-box mb-5">
          <u-widget-header
            :title="$t('orders_bulk_export.labels.title')"
            icon="bookmark_border"
          >
          </u-widget-header>

          <v-list-subheader>
            {{ $t("orders_bulk_export.labels.subtitle") }}
          </v-list-subheader>

          <!-- Orders delivery state -->

          <v-btn-toggle
            v-model="delivery_states"
            class="widget-toggle flex-grow-0"
            density="compact"
            mandatory
            multiple
            rounded
            selected-class="blue-flat"
          >
            <v-btn
              v-for="state in all_delivery_states"
              :key="state.code"
              :value="state.code"
              min-height="42"
            >
              <div class="d-flex flex-column align-center small">
                <v-icon class="mb-1" size="small"> {{ $t(state.icon) }}</v-icon>
                {{ $t(state.name) }}
              </div>
            </v-btn>
          </v-btn-toggle>
          <!-- Page size -->

          <v-btn-toggle
            v-model="page"
            class="widget-toggle flex-grow-0"
            density="compact"
            mandatory
            rounded
            selected-class="blue-flat "
            title="Page size"
          >
            <v-btn
              v-for="it in ['A4', 'A5']"
              :key="it"
              :value="it"
              class="w-50"
              min-height="42"
            >
              <v-icon :size="it === 'A5' ? 12 : 16" class="me-1"
                >fa:fas fa-file
              </v-icon>
              {{ it }}
            </v-btn>
          </v-btn-toggle>
          <!-- Detail of basket items -->
          <v-btn-toggle
            v-model="detail"
            class="widget-toggle flex-grow-0"
            density="compact"
            mandatory
            rounded
            selected-class="blue-flat "
          >
            <v-btn :value="false" class="w-50" min-height="42">
              <v-icon class="me-1" size="small">fa:fas fa-pager</v-icon>
              Label only
            </v-btn>
            <v-btn :value="true" class="w-50" min-height="42">
              <v-icon class="me-1" size="small">fa:fas fa-pager</v-icon>
              Label
              <span class="mx-1">+</span>
              <v-icon class="me-1" size="small"
                >fa:fas fa-rectangle-list
              </v-icon>
              Items
            </v-btn>
          </v-btn-toggle>

          <s-export-format-select
            :pdf="pdf_labels"
            :type="$t('orders_bulk_export.labels.export_title')"
            dense
          >
          </s-export-format-select>
        </div>
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
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import { Basket } from "@selldone/core-js";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import UDateInput from "@selldone/components-vue/ui/date/input/UDateInput.vue";
import SExportFormatSelect from "@selldone/components-vue/ui/file/export-format-select/SExportFormatSelect.vue";

export default {
  name: "BProcessCenterBulkExport",
  components: { UWidgetHeader, UDateInput, SExportFormatSelect },
  props: {
    modelValue: {},

    shop: {
      required: true,
    },
    type: {
      required: true,
      type: Object,
    },
  },

  data: function () {
    return {
      start: new Date().addDays(-7),
      end: new Date(),

      delivery_states: [
        Basket.PhysicalOrderStates.CheckQueue.code,
        Basket.PhysicalOrderStates.OrderConfirm.code,
        Basket.PhysicalOrderStates.PreparingOrder.code,
        Basket.PhysicalOrderStates.SentOrder.code,
      ],

      page: "A5",
      detail: true,
    };
  },
  computed: {
    all_delivery_states() {
      if (this.type.code === ProductType.PHYSICAL.code)
        return Basket.PhysicalOrderStates;
      else if (this.type.code === ProductType.VIRTUAL.code)
        return Basket.VirtualOrderStates;
      else if (this.type.code === ProductType.FILE.code)
        return Basket.FileOrderStates;
      else if (this.type.code === ProductType.SERVICE.code)
        return Basket.ServiceOrderStates;

      return [];
    },

    excel() {
      return this.getTasksUrl("excel");
    },
    csv() {
      return this.getTasksUrl("csv");
    },
    pdf() {
      return this.getTasksUrl("pdf");
    },

    pdf_labels() {
      const arr = [];
      this.delivery_states.forEach((v) => {
        arr.push("delivery_states[]=" + v);
      });
      return (
        window.API.GET_EXPORT_BASKET_LABELS(
          this.shop.id,
          this.type.code.toLowerCase(),
        ) +
        "?" +
        `page=${this.page}&detail=${this.detail}&` +
        `start=${DateConverter.dateToString(this.start)}` +
        (this.end ? `&end=${DateConverter.dateToString(this.end)}` : "") +
        (`&` + arr.join("&"))
      );
    },
  },
  watch: {},
  created() {},

  methods: {
    getTasksUrl(render) {
      return (
        window.API.GET_EXPORT_BASKET_TASKS(
          this.shop.id,
          this.type.code.toLowerCase(),
          render,
        ) +
        `?start=${DateConverter.dateToString(this.start)}` +
        (this.end ? `&end=${DateConverter.dateToString(this.end)}` : "")
      );
    },
  },
};
</script>

<style lang="scss" scoped></style>
