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
  <v-row
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
        @update:model-value="(val) => $emit('update:modelValue', val)"
      ></b-customers-filter-design>
    </div>
  </v-row>
</template>

<script lang="ts">
import BCustomersFilterDesign from "../filter/design/BCustomersFilterDesign.vue";
import { debounce } from "lodash-es";
import UChartFunnel from "../../../ui/chart/funnel/UChartFunnel.vue";
import { Customer } from "@selldone/core-js";

export default {
  name: "BCustomersFunnel",
  emits: ["update:modelValue", "update:count"],
  components: {
    UChartFunnel,
    BCustomersFilterDesign,
  },

  props: {
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

    if (this.permanentFilters) {
      this.permanentFilters.reverse().forEach((item) => {
        this.DeleteItemByID(this.modelValue, item.key, "key");
        this.modelValue.unshift(item);
      });
    }
    this.$emit("update:modelValue", this.modelValue);
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
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_segments = false;
        });
    },

    //----------------------------------------------------------------------
    refreshFunnel() {
      if (this.busy_refresh) return;
      this.busy_refresh = true;

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
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
          console.log("headers", headers);

          this.DownloadBlobFile(data, headers);
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_download = false;
        });
    },
  },
};
</script>

<style scoped></style>
