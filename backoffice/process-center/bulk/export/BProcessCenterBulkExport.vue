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
    <v-card rounded="t-xl" class="b-process-center-bulk-export text-start">
      <v-card-title class="b-process-center-bulk-export__header">
        <v-icon class="me-2" size="20" aria-hidden="true">file_download</v-icon>
        {{ $t("orders_bulk_export.title") }}
        |
        <img
          v-if="type"
          :src="type.basket"
          width="24"
          height="24"
          class="mx-1"
          alt=""
        />
        {{ $t(type.name) }}
      </v-card-title>
      <v-card-text class="b-process-center-bulk-export__body">
        <div class="sd-modern-widget b-process-center-bulk-export__section">
          <u-widget-header
            class="sd-modern-form-header b-process-center-bulk-export__section-header"
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

          <div class="b-process-center-bulk-export__dates">
            <u-date-input
              v-model="start"
              class="sd-modern-underlined-field"
              variant="underlined"
              :label="$t('global.commons.start_date')"
              :placeholder="$t('global.placeholders.select_date')"
              clearable
              date-only
              return-utc
            />

            <u-date-input
              v-model="end"
              class="sd-modern-underlined-field"
              variant="underlined"
              :disabled="!start"
              :label="$t('global.commons.end_date')"
              :min="start"
              :placeholder="$t('global.commons.now')"
              clearable
              date-only
              return-utc
            />
          </div>
        </div>

        <div class="sd-modern-widget b-process-center-bulk-export__section">
          <u-widget-header
            class="sd-modern-form-header b-process-center-bulk-export__section-header"
            :title="$t('orders_bulk_export.tasks.title')"
            icon="splitscreen"
          >
          </u-widget-header>

          <v-list-subheader>
            {{ $t("orders_bulk_export.tasks.subtitle") }}
          </v-list-subheader>

          <s-export-format-select
            modern
            :csv="csv"
            :excel="excel"
            :pdf="pdf"
            :type="$t('orders_bulk_export.tasks.export_title')"
            dense
          >
          </s-export-format-select>
        </div>

        <div class="sd-modern-widget b-process-center-bulk-export__section">
          <u-widget-header
            class="sd-modern-form-header b-process-center-bulk-export__section-header"
            :title="$t('orders_bulk_export.labels.title')"
            icon="bookmark_border"
          >
          </u-widget-header>

          <v-list-subheader>
            {{ $t("orders_bulk_export.labels.subtitle") }}
          </v-list-subheader>

          <!-- Orders delivery state -->

          <div class="b-process-center-bulk-export__options">
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
                  <v-icon class="mb-1" size="small">
                    {{ $t(state.icon) }}</v-icon
                  >
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
              :title="$t('exporter.sections.page_size')"
              :aria-label="$t('exporter.sections.page_size')"
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
                {{ $t("exporter.sections.label_only") }}
              </v-btn>
              <v-btn :value="true" class="w-50" min-height="42">
                <v-icon class="me-1" size="small">fa:fas fa-pager</v-icon>
                <v-icon class="me-1" size="small"
                  >fa:fas fa-rectangle-list
                </v-icon>
                {{ $t("exporter.sections.label_with_items") }}
              </v-btn>
            </v-btn-toggle>
          </div>

          <s-export-format-select
            modern
            :pdf="pdf_labels"
            :type="$t('orders_bulk_export.labels.export_title')"
            dense
          >
          </s-export-format-select>
        </div>
      </v-card-text>
      <v-card-actions class="b-process-center-bulk-export__actions">
        <div class="widget-buttons">
          <v-btn
            class="sd-modern-button"
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

<style lang="scss" scoped>
.b-process-center-bulk-export {
  letter-spacing: 0;

  &__header {
    padding: 20px 24px;
    border-block-end: 1px solid var(--sd-modern-border);
    font-size: 18px;
    font-weight: 500;
    line-height: 1.5;
    white-space: normal;
  }
  &__body {
    display: grid;
    gap: 20px;
    padding: 24px !important;
    background: var(--sd-modern-canvas-color);
  }
  &__section {
    padding: 24px;
    border-radius: 20px;

    .s--export-format-select--modern {
      margin-inline: -24px;
      margin-block-end: -24px;
    }

    > .v-list-subheader {
      min-height: 0;
      padding: 0;
      margin-block-end: 12px;
      color: var(--sd-modern-muted);
      font-size: 13px;
      line-height: 1.6;
    }
  }
  &__section-header :deep(h2) {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__dates {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    margin-block-start: 20px;
  }
  &__options {
    display: grid;
    gap: 12px;
    margin-block: 20px;
    min-width: 0;

    .v-btn-toggle {
      height: auto;
      max-width: 100%;
      overflow-x: auto;
    }
    .v-btn {
      font-family: inherit;
      font-size: 13px;
      font-weight: 400;
    }
  }
  &__actions {
    justify-content: flex-end;
    padding: 16px 24px;
    border-block-start: 1px solid var(--sd-modern-border);

    .widget-buttons {
      margin: 0;
    }
    .sd-modern-button {
      min-height: 36px;
      height: auto;
      font-size: 13px;
      font-weight: 400;
    }
  }
  @media (max-width: 600px) {
    &__body {
      padding: 16px !important;
    }
    &__section {
      padding: 20px;

      .s--export-format-select--modern {
        margin-inline: -20px;
        margin-block-end: -20px;
      }
    }
    &__dates {
      grid-template-columns: minmax(0, 1fr);
    }
    &__options .v-btn,
    &__actions .sd-modern-button {
      min-height: 44px;
    }
  }
  @media (pointer: coarse) {
    &__options .v-btn,
    &__actions .sd-modern-button {
      min-height: 44px;
    }
  }
}
</style>
