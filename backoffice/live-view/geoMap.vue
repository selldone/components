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
  <div class="root-container">
    <div v-if="!play" class="cover" @click="start()">
      <v-icon class="center-absolute play-btn" color="#fff" size="84"
        >fa:fas fa-play
      </v-icon>
    </div>
    <div v-else>
      <v-container class="top-container-view" fluid>
        <v-row row wrap>
          <v-col cols="4">
            <u-sparkline
              :height="120"
              :value="count_list"
              class="mx-auto chart-line"
              color="#333"
              line-width="2"
              smooth
              stroke-linecap="round"
            />

            <p class="small">
              {{ $t("geo_map.views") }}
            </p>

            <p class="value-count">
              {{ totalVisitors }}
              <small> {{ $t("geo_map.views_unit") }}</small>
            </p>

            <p class="value-count">
              <small> {{ $t("geo_map.product_views") }}</small>
              <u-sparkline
                :height="38"
                :value="product_views_list"
                auto-line-width
                class="mx-auto chart-line-mini"
                color="#333"
                fill
                smooth
                stroke-linecap="round"
              />
            </p>
          </v-col>

          <v-col cols="4">
            <u-sparkline
              :height="120"
              :value="buys_list"
              class="mx-auto chart-line"
              color="#333"
              line-width="2"
              smooth
              stroke-linecap="round"
            />

            <p class="small">
              {{ $t("geo_map.buys") }}
            </p>

            <p class="value-count">
              {{ totalPurchases }}
              <small>{{ $t("geo_map.buys_unit") }}</small>
            </p>
          </v-col>

          <v-col cols="4">
            <u-sparkline
              :height="120"
              :value="add_baskets_list"
              class="mx-auto chart-line"
              color="#333"
              line-width="2"
              smooth
              stroke-linecap="round"
            />

            <p class="small">
              {{ $t("geo_map.baskets") }}
            </p>

            <p class="value-count">
              <v-icon class="hide-on-small-600" color="#333" size="small">
                add
              </v-icon>
              {{ totalAddToBasket }}
              <small> {{ $t("geo_map.added_items") }}</small>

              <u-sparkline
                :height="38"
                :value="add_baskets_list"
                auto-line-width
                class="mx-auto chart-line-mini"
                color="#333"
                fill
                smooth
                stroke-linecap="round"
              />
            </p>

            <p class="value-count">
              <v-icon class="hide-on-small-600" color="#333" size="small">
                remove
              </v-icon>

              {{ totalRemoveFromBasket }}
              <small>{{ $t("geo_map.removed_items") }}</small>

              <u-sparkline
                :height="38"
                :value="remove_baskets_list"
                auto-line-width
                class="mx-auto chart-line-mini"
                color="#333"
                fill
                smooth
                stroke-linecap="round"
              />
            </p>
          </v-col>
        </v-row>
      </v-container>

      <div style="height: 640px">
        <div id="map"></div>
      </div>

      <v-btn
        :class="{ disabled: busy }"
        :loading="busy"
        class="refresh-button"
        icon
        size="small"
        variant="flat"
        @click="fetchData()"
      >
        <v-icon>refresh</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
//―――――――――――――――――――――― Mapbox ――――――――――――――――――――
import Mapbox from "../../ui/map/providers/mapbox/MapBox";
import USparkline from "../../ui/chart/sparkline/USparkline.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "GeoMap",
  mixins: [],
  components: { USparkline },
  data() {
    return {
      play: false,

      list: [], //API Output Data

      count_list: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      product_views_list: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      add_baskets_list: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      remove_baskets_list: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      products_views_list: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      buys_list: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

      busy: false,

      polling: null,

      map: null,

      current_markers: [],

      source_features: [],
    };
  }, //end of Mounted

  computed: {
    source() {
      return {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: this.source_features,
        },
      };
    },

    visitor_markers() {
      let out = [];
      this.list.forEach((item) => {
        out.push({
          id: item.lat + "-" + item.lon,
          coordinates: [item.lon, item.lat],
          item: item,
        });
      });
      return out;
    },

    totalVisitors() {
      let sum = 0;
      this.list.forEach((item) => {
        sum += item.count;
      });
      return sum;
    },

    totalPurchases() {
      let sum = 0;
      this.list.forEach((item) => {
        sum += item.buys;
      });
      return sum;
    },

    totalAddToBasket() {
      let sum = 0;
      this.list.forEach((item) => {
        sum += item.add_baskets;
      });
      return sum;
    },

    totalRemoveFromBasket() {
      let sum = 0;
      this.list.forEach((item) => {
        sum += item.remove_baskets;
      });
      return sum;
    },

    totalProductsView() {
      let sum = 0;
      this.list.forEach((item) => {
        sum += item.products_views;
      });
      return sum;
    },
  }, //end of Data

  created() {
    // We need to set mapbox-gl library here in order to use it in template
    //  this.mapbox = Mapbox;
    // Add RTL support:
    //   this.mapbox.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js');
  },

  beforeUnmount() {
    clearInterval(this.polling);
  },
  mounted() {},
  //end of Computed

  methods: {
    start() {
      this.play = true;
      // Fetch new data every 60 secondes:
      this.polling = setInterval(() => {
        this.fetchData();
      }, 60000);

      this.$nextTick(() => {
        this.initMap();
      });
    },
    initMap() {
      this.map = new Mapbox.Map({
        container: "map",
        style: "mapbox://styles/pajuhaan/ck1hxl67c0bf21cpeenahwg2t", //mapbox://styles/mapbox/streets-v11
        center: [-122.431297, 37.773972],
        zoom: 11,
      });

      // Add geolocate control to the map.
      this.map.addControl(
        new Mapbox.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: false,
        }),
      );

      // Add zoom and rotation controls to the map.
      this.map.addControl(new Mapbox.NavigationControl());

      this.map.on("load", () => {
        this.map.addSource("trace", this.source);

        this.map.addLayer(
          {
            id: "trace",
            type: "heatmap",
            source: "trace",

            paint: {
              // Increase the heatmap weight based on frequency and property magnitude
              "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "mag"],
                0,
                0,
                6,
                1,
              ],
              // Increase the heatmap color weight weight by zoom level
              // heatmap-intensity is a multiplier on top of heatmap-weight
              "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                1,
                9,
                3,
              ],
              // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
              // Begin color ramp at 0-stop with a 0-transparancy color
              // to create a blur-like effect.
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(33,102,172,0)",
                0.2,
                "rgb(103,169,207)",
                0.4,
                "rgb(209,229,240)",
                0.6,
                "rgb(253,219,199)",
                0.8,
                "rgb(239,138,98)",
                1,
                "rgb(178,24,43)",
              ],
              // Adjust the heatmap radius by zoom level
              "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                2,
                9,
                20,
              ],
              // Transition from heatmap to circle layer by zoom level
              "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                1,
                9,
                0,
              ],
            },
          },
          "waterway-label",
        );

        this.map.addLayer(
          {
            id: "earthquakes-point",
            type: "circle",
            source: "trace",
            minzoom: 7,
            paint: {
              // Size circle radius by earthquake magnitude and zoom level
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                ["interpolate", ["linear"], ["get", "mag"], 1, 1, 6, 4],
                16,
                ["interpolate", ["linear"], ["get", "mag"], 1, 5, 6, 50],
              ],
              // Color circle by earthquake magnitude
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "mag"],
                1,
                "rgba(33,102,172,0)",
                2,
                "rgb(103,169,207)",
                3,
                "rgb(209,229,240)",
                4,
                "rgb(253,219,199)",
                5,
                "rgb(239,138,98)",
                6,
                "rgb(178,24,43)",
              ],
              "circle-stroke-color": "white",
              "circle-stroke-width": 1,
              // Transition from heatmap to circle layer by zoom level
              "circle-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                0,
                8,
                1,
              ],
            },
          },
          "waterway-label",
        );

        this.fetchData();
      });
    },

    fetchData() {
      this.busy = true;
      axios
        //  .get(`/api-test/real-time`)     // "/api-test/real-time"
        .get(window.API.GET_SHOP_REALTIME_DATA(this.$route.params.shop_id)) // "/api-test/real-time"
        .then(({ data }) => {
          if (!data.error) {
            this.list = data.list;

            this.updateCharts();
            this.fitMap();
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    fitMap() {
      if (!this.map) return;

      this.source_features = [];

      this.current_markers.forEach((marker) => {
        marker.remove();
      });

      this.list.forEach((item) => {
        // create the popup
        const popup = new Mapbox.Popup({ offset: 25 }).setHTML(`
                            <ul class="list-group p-0" style="min-width: 200px">
      <li class="list-group-item d-flex"><div class="v-col-8 p-0 text-start"> <i class="fas fa-shopping-bag mx-1"></i>Buy</div><div class="v-col-4 p-0">${item.buys}</div></li>
      <li class="list-group-item d-flex"><div class="v-col-8 p-0 text-start"> <i class="fas fa-eye mx-1"></i>View</div><div class="v-col-4 p-0">${item.count}</div></li>
      <li class="list-group-item d-flex"><div class="v-col-8 p-0 text-start"> <i class="fas fa-box mx-1"></i>Click product</div><div class="v-col-4 p-0">${item.products_views}</div></li>
      <li class="list-group-item d-flex"><div class="v-col-8 p-0 text-start"> <i class="fas fa-plus-square mx-1"></i>Add cart</div><div class="v-col-4 p-0">${item.add_baskets}</div></li>
      <li class="list-group-item d-flex"><div class="v-col-8 p-0 text-start"> <i class="fas fa-minus-square mx-1"></i>Remove cart</div><div class="v-col-4 p-0">${item.remove_baskets}</div></li>
    </ul>
                        `);
        const el = document.createElement("img");
        el.className = "marker";

        el.src =
          item.buys > 0
            ? require("../../assets/icons/buy-marker.svg")
            : require("../../assets/icons/user-marker.svg");
        el.style.width = "20px";
        el.style.height = "20px";

        const marker = new Mapbox.Marker(el)
          .setOffset([0, -10])
          .setLngLat([item.lon, item.lat])
          .setPopup(popup) // sets a popup on this marker
          .addTo(this.map);

        this.current_markers.push(marker);

        this.source_features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [item.lon, item.lat],
          },
          properties: {
            mag: item.count,
          },
        });
      });

      this.map.getSource("trace").setData(this.source.data);

      let min_lat = 90;
      let min_lon = 90;

      let max_lat = -90;
      let max_lon = -90;

      this.list.forEach((item) => {
        min_lat = Math.min(min_lat, item.lat);
        min_lon = Math.min(min_lon, item.lon);
        max_lat = Math.max(max_lat, item.lat);
        max_lon = Math.max(max_lon, item.lon);
      });

      this.map.fitBounds(
        [
          [min_lon, min_lat],
          [max_lon, max_lat],
        ],
        {
          padding: { top: 25, bottom: 25, left: 25, right: 25 },
          maxZoom: 16,
        },
      );
    },

    updateCharts() {
      this.count_list.push(this.totalVisitors);
      if (this.count_list.length > 20) this.count_list.shift();

      this.product_views_list.push(this.totalProductsView);
      if (this.product_views_list.length > 20) this.product_views_list.shift();

      this.add_baskets_list.push(this.totalAddToBasket);
      if (this.add_baskets_list.length > 20) this.add_baskets_list.shift();

      this.remove_baskets_list.push(this.totalRemoveFromBasket);
      if (this.remove_baskets_list.length > 20)
        this.remove_baskets_list.shift();

      this.products_views_list.push(this.totalProductsView);
      if (this.products_views_list.length > 20)
        this.products_views_list.shift();

      this.buys_list.push(this.totalPurchases);
      if (this.buys_list.length > 20) this.buys_list.shift();
    },
  }, //end of Methods
};
</script>

<style lang="scss" scoped>
.cover {
  position: absolute;
  cursor: pointer;
  width: 100%;
  height: 100%;
  background-color: #fafafa;

  .play-btn {
    filter: drop-shadow(2px 5px 30px rgba(0, 0, 0, 0.2));

    transition: all 0.4s;
  }

  &:hover {
    .play-btn {
      color: #00a89a !important;
    }
  }
}

.root-container {
  position: relative;
  background-color: #d4dadc;

  min-height: 640px;
  // background-color: #011018;
  //      background-color: #222;

  //  background-color: #352a3d;

  .refresh-button {
    position: absolute;
    right: 12px;
    bottom: 20px;
    z-index: 1000;
  }
}

.value-count {
  font-size: 1.4rem;
}

.top-container-view {
  border-radius: 18px;
  top: 8px;
  left: 18px;
  user-select: none;
  position: absolute;
  width: calc(100% - 36px);

  background-color: rgba(255, 255, 255, 0.66);

  //   background-color: rgba(1, 16, 24, 0.75);

  //    background-color: rgba(34, 34, 34, 0.75);
  //  background-color: rgba(53, 42, 61, 0.86);

  color: #333;
  // background-color: #3f55b9;
  text-align: center;
  z-index: 1000;

  transform: scale(0.65);
  transition: all 0.35s ease-in-out;

  &:hover {
    transform: scale(1);
  }

  p {
    margin: 0;
  }

  small {
    font-size: 0.8rem;
    color: #666 !important;
  }
}

.chart-line {
  max-width: 240px;
}

.chart-line-mini {
  display: inline-block;
  max-width: 90px;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

/*
      .map {

          width: 100%;
          height: 650px;
          max-height: 65vh;

      }
  */
</style>
