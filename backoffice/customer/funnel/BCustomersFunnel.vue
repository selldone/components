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

<template>
  <div v-if="modern" class="b-customers-funnel-modern text-start">
    <b-customers-filter-design
      :model-value="modelValue"
      :permanent-filters="permanentFilters"
      :segments="shop_segments"
      :shop="shop"
      :types="filter_types"
      :read-only="readOnly"
      modern
      @update:model-value="(val) => { if (!readOnly) $emit('update:modelValue', val); }"
    />

    <section
      class="b-customers-funnel-modern__report"
      :aria-busy="busy_refresh"
    >
      <div class="sd-modern-header">
        <h2 class="sd-modern-eyebrow">{{ $t("global.commons.users") }}</h2>
        <div class="sd-modern-actions">
          <v-btn
            class="sd-modern-button"
            :color="changed ? 'primary' : undefined"
            :loading="busy_refresh"
            prepend-icon="refresh"
            variant="text"
            @click="refreshFunnel()"
            >{{ $t("global.actions.refresh") }}</v-btn
          >
          <v-btn
            class="sd-modern-button"
            :loading="busy_download"
            prepend-icon="download"
            variant="text"
            @click="downloadExcel()"
            >{{ $t("global.actions.download") }}</v-btn
          >
        </div>
      </div>
      <v-progress-linear v-if="busy_refresh" indeterminate class="mb-4" />
      <div v-else-if="funnel_error" class="sd-modern-notice" role="alert">
        <v-icon size="18" aria-hidden="true">info_outline</v-icon>
        <span>{{ $t("global.commons.error") }}</span>
        <v-btn
          class="sd-modern-button sd-modern-button--inline"
          variant="text"
          @click="refreshFunnel()"
          >{{ $t("global.actions.refresh") }}</v-btn
        >
      </div>
      <ol
        v-else-if="funnel_date?.length"
        class="b-customers-funnel-modern__steps"
      >
        <li
          v-for="(step, index) in funnel_date"
          :key="index"
          class="b-customers-funnel-modern__step"
        >
          <span class="b-customers-funnel-modern__label">{{ step.label }}</span>
          <div class="b-customers-funnel-modern__track" aria-hidden="true">
            <span
              :style="{
                width: `${(100 * step.count) / Math.max(funnel_date[0]?.count || 0, 1)}%`,
              }"
            />
          </div>
          <span class="b-customers-funnel-modern__count">{{
            $n(step.count)
          }}</span>
          <span class="b-customers-funnel-modern__drop">
            <template v-if="index && funnel_date[index - 1].count > step.count"
              >−{{ $n(funnel_date[index - 1].count - step.count) }}</template
            >
          </span>
        </li>
      </ol>
      <div v-else-if="funnel_date" class="sd-modern-empty-state" role="status">
        {{ $t("global.commons.no_data") }}
      </div>
    </section>
  </div>
  <v-row
    v-else
    class="overflow-auto scrollable-element-dark-gray"
    justify="center"
    no-gutters
  >
    <div :style="{ minHeight: h + 80 + 'px' }" class="flex-grow-1 py-3">
      <u-chart-funnel
        v-if="values"
        :animated="true"
        :class="{ dark: dark, dense: dense }"
        :colors="colors"
        :direction="vertical ? 'vertical' : 'horizontal'"
        :display-percentage="true"
        :gradient-direction="vertical ? 'vertical' : 'horizontal'"
        :height="h"
        :labels="labels"
        :sub-labels="subLabels"
        :values="values"
        :width="width - 200"
      ></u-chart-funnel>
    </div>

    <div
      class="overflow-y-auto px-2 h-100 scrollable-element-dark-gray flex-grow-1"
      style="min-width: 240px; width: 240px"
    >
      <v-btn
        :color="changed ? 'primary' : ''"
        :loading="busy_refresh"
        class="m-1"
        variant="flat"
        @click="refreshFunnel()"
      >
        <v-icon class="me-2">refresh</v-icon>
        {{ $t("global.actions.refresh") }}
      </v-btn>
      <v-btn
        :loading="busy_download"
        class="m-1"
        variant="flat"
        @click="downloadExcel()"
        ><img class="me-2" src="../../../assets/file/excel.svg" width="20" />
        {{ $t("global.actions.download") }}
      </v-btn>

      <b-customers-filter-design
        :model-value="modelValue"
        :permanentFilters="permanentFilters"
        :segments="shop_segments"
        :shop="shop"
        :types="filter_types"
        :read-only="readOnly"
        @update:model-value="(val) => { if (!readOnly) $emit('update:modelValue', val); }"
      ></b-customers-filter-design>
    </div>
  </v-row>
</template>

<script lang="ts">
import BCustomersFilterDesign from "../filter/design/BCustomersFilterDesign.vue";
import { debounce } from "lodash-es";
import UChartFunnel from "../../../ui/chart/funnel/UChartFunnel.vue";
import { Customer, FileHelper } from "@selldone/core-js";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BCustomersFunnel",
  mixins: [],
  emits: ["update:modelValue", "update:count"],
  components: {
    UChartFunnel,
    BCustomersFilterDesign,
  },

  props: {
    readOnly: { type: Boolean, default: false },
    modern: {
      type: Boolean,
      default: false,
    },
    modelValue: {},
    shop: {
      require: true,
    },

    permanentFilters: {
      type: Array,
    },

    dark: {
      type: Boolean,
      default: false,
    },

    vertical: {
      type: Boolean,
      default: false,
    },
    /* height: {
      default: 400,
    },*/
    width: {
      default: 800,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    colors: {
      default: () => {
        return [
          ["#FFB178", "#FF3C8E"], // color set for "Impressions" segment
        ];
      },
    },
  },

  data() {
    return {
      labels: ["NO DATA"],
      subLabels: null,
      values: null,

      intervalid1: null,

      //-------------
      busy_refresh: false,
      busy_download: false,
      funnel_date: null,
      funnel_error: false,

      //-------------

      filter_types: Customer.Filters,
      //------------

      changed: false,

      //------------
      busy_segments: false,
      shop_segments: [],
    };
  },
  computed: {
    h() {
      return 150 + this.modelValue.length * 72;
    },
    width_cal() {
      if (this.width === "auto") {
        const w = window.innerWidth;
        if (w > 1600) return 800;
        else if (w > 1000) return 420;
        else if (w > 700) return 320;

        return 200;
      }
      return this.vertical ? this.width : this.width - 240;
    },
  },

  watch: {
    modelValue: {
      handler(new_val, old_val) {
        this.changed = true;
      },
      deep: true,
    },

    changed: debounce(function (newVal, oldVal) {
      if (!newVal) return;
      this.refreshFunnel();
    }, 1000),
  },
  created() {
    this.subLabels = [this.$t("global.commons.users")];

    if (!this.readOnly && this.permanentFilters) {
      this.permanentFilters.reverse().forEach((item) => {
        this.DeleteItemByID(this.modelValue, item.key, "key");
        this.modelValue.unshift(item);
      });
    }
    if (!this.readOnly) this.$emit("update:modelValue", this.modelValue);
    this.refreshFunnel();

    this.fetchSegments();
  },
  methods: {
    fetchSegments() {
      this.busy_segments = true;
      axios
        .get(window.API.GET_SHOP_CUSTOMERS_SEGMENTS(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.shop_segments = data.segments;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_segments = false;
        });
    },

    //----------------------------------------------------------------------
    refreshFunnel() {
      if (this.busy_refresh) return;
      this.busy_refresh = true;
      this.funnel_error = false;

      axios
        .post(window.API.POST_FUNNEL_USERS_COUNT(this.shop.id), {
          filters: this.modelValue,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.changed = false;

            this.funnel_date = data.funnel_date;

            this.values = [];
            this.labels = [];

            this.funnel_date.forEach((item) => {
              this.values.push([item.count]);
              this.labels.push(item.label);
            });

            if (this.funnel_date.length)
              this.$emit(
                "update:count",
                this.funnel_date[this.funnel_date.length - 1].count,
              );

            /*  if(download_data){
                            const excel = new ExcelConverter(JSON.stringify(data.users),this.shop.name+" Customers",'Customers');
                            excel.downLoad();
              
                          }*/
          } else {
            this.funnel_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.funnel_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_download = false;
          this.busy_refresh = false;
        });
    },

    downloadExcel() {
      if (this.changed) this.refreshFunnel();

      this.busy_download = true;

      axios
        .request({
          url: window.API.POST_FUNNEL_USERS_DATA(this.shop.id),
          method: "POST",
          responseType: "blob",
          data: {
            filters: this.modelValue,
          },
        })
        .then(({ data, headers }) => {
          FileHelper.DownloadBlobFile(data, headers);
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_download = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-customers-funnel-modern {
  min-width: 0;

  &__report {
    margin-block-start: 28px;
    padding-block-start: 24px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  &__steps {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__step {
    display: grid;
    grid-template-columns: minmax(120px, 1fr) minmax(80px, 2fr) 64px 64px;
    gap: 16px;
    align-items: center;
    min-height: 44px;
    font-size: 13px;
    line-height: 1.6;
  }

  &__label {
    overflow-wrap: anywhere;
  }
  &__count,
  &__drop {
    text-align: end;
    font-variant-numeric: tabular-nums;
  }
  &__drop {
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__track {
    height: 7px;
    border-radius: 3px;
    background: rgba(var(--v-theme-on-surface), 0.06);
    overflow: hidden;

    > span {
      display: block;
      height: 100%;
      max-width: 100%;
      border-radius: inherit;
      background: rgb(var(--v-theme-primary));
    }
  }

  @media (max-width: 599px) {
    &__step {
      grid-template-columns: minmax(80px, 1fr) minmax(40px, 1fr) 48px;
      gap: 10px;
    }
    &__drop {
      grid-column: 3;
      margin-block-start: -14px;
      padding-block-end: 4px;
    }
  }
}
</style>
