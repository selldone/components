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
    <u-chart-sankey
      :config="chartConfig"
      :data="chartData"
      :style="`height:${height}px`"
      class="chart dir-ltr"
    />

    <v-btn-toggle
      v-model="mode"
      class="widget-toggle my-5"
      mandatory
      rounded
      selected-class="black-flat"
      @update:model-value="refreshChart()"
    >
      <v-btn value="visits" variant="text">
        <v-icon class="me-1">visibility</v-icon>
        {{ $t("admin_shop.categories.graph.visits_count") }}
      </v-btn>
      <v-btn value="count" variant="text">
        <v-icon class="me-1">format_list_bulleted</v-icon>
        {{ $t("admin_shop.categories.graph.items_count") }}
      </v-btn>
      <v-btn value="mono" variant="text">
        <v-icon class="me-1">linear_scale</v-icon>
        {{ $t("admin_shop.categories.graph.normal") }}
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script lang="ts">
import UChartSankey from "../../../ui/chart/sankey/UChartSankey.vue";

export default {
  name: "CategoriesGraph",
  components: { UChartSankey },

  props: {
    categories: {
      require: true,
      type: Array,
    },
    height: {
      require: false,
      default: 500,
    },
  },
  data() {
    return {
      mode: "mono",

      chartData: {
        nodes: [
          /*   {name: 'Node A'},
                           {name: 'Node B'},
                           {name: 'Node C'},
                           {name: 'Node D'},
                           {name: 'Node E'},
                         {name: 'Node 1'},
                         {name: 'Node 2'},
                         {name: 'Node 3'},
                         {name: 'Node 4'},*/
        ],
        links: [
          /* {source: 'Node A', target: 'Node E', value: 2},
                         {source: 'Node A', target: 'Node C', value: 2},
                         {source: 'Node B', target: 'Node C', value: 2},
                         {source: 'Node B', target: 'Node D', value: 2},
                         {source: 'Node C', target: 'Node D', value: 2},
                         {source: 'Node C', target: 'Node E', value: 2},
                         {source: 'Node D', target: 'Node E', value: 4},

                       {source: 'Node C', target: 'Node 1', value: 2},

                       {source: 'Node 1', target: 'Node 2', value: 1},
                       {source: 'Node 2', target: 'Node 3', value: 2},*/
          //  {source: 'Node 3', target: 'Node 4', value: 5},
        ],
      },

      chartConfig(config) {
        config.sankey().sankey().nodePadding(16);

        config.sankey().nodeDraggableY(true);
        // .nodeDraggableX(true)
      },
    };
  },
  computed: {
    /*  chartData(){
                return {

                  nodes: [
                    {name: 'Node A'},
                    {name: 'Node B'},
                    {name: 'Node C'},
                    {name: 'Node D'},
                    {name: 'Node E'},
                    {name: 'Node 1'},
                    {name: 'Node 2'},
                    {name: 'Node 3'},
                    {name: 'Node 4'},

                  ],
                  links: [
                    {source: 'Node A', target: 'Node E', value: 2},
                    {source: 'Node A', target: 'Node C', value: 2},
                    {source: 'Node B', target: 'Node C', value: 2},
                    {source: 'Node B', target: 'Node D', value: 2},
                    {source: 'Node C', target: 'Node D', value: 2},
                    {source: 'Node C', target: 'Node E', value: 2},
                    {source: 'Node D', target: 'Node E', value: 4},

                    {source: 'Node C', target: 'Node 1', value: 2},

                    {source: 'Node 1', target: 'Node 2', value: 1},
                    {source: 'Node 2', target: 'Node 3', value: 2},
                    //  {source: 'Node 3', target: 'Node 4', value: 5},


                  ],

                }



              },*/
  },

  watch: {
    categories() {
      this.refreshChart();
    },
  },

  mounted() {
    this.refreshChart();
  },
  methods: {
    refreshChart() {
      this.chartData.nodes = [];
      this.chartData.links = [];

      this.chartData.nodes.push({
        name: this.$t("admin_shop.categories.graph.home"),
      });

      this.categories.forEach((item) => {
        this.chartData.nodes.push({
          name: item.title,
          tooltip: item.description,
        });

        //+++++
        // this.chartData.nodes.push({name:'___'+ item.title});

        let val = 0;
        if (this.mode === "visits") {
          val = item.visits;
        } else if (this.mode === "mono") {
          val = 1;
        } else {
          val = item.products + item.categories;
        }

        if (item.parent) {
          // let parent_cat = this.categories.find(cat => cat.id === item.parent.id);
          // const val = parent_cat ? (parent_cat.products + parent_cat.categories) :1;
          this.chartData.links.push({
            source: item.parent.title,
            target: item.title,
            value: val,
          });
        } else {
          this.chartData.links.push({
            source: this.$t("admin_shop.categories.graph.home"),
            target: item.title,
            value: val,
          });
        }

        //+++++
        //if(item.products)
        //this.chartData.links.push({source: item.title, target: '___'+ item.title, value:10});
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.chart {
  width: 100%;
  height: 500px;
}
</style>
