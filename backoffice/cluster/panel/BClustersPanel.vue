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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="b--cluster-panel">
    <v-btn
      :color="ThemeColorDark"
      class="b--cluster-panel-button tnt"
      @click="dialog = true"
      :stacked="$vuetify.display.xs"
      elevation="3"
    >
      <v-icon class="me-sm-1 me-0 mb-sm-0 mb-1" size="small">workspaces</v-icon>

      {{ $t("global.commons.resources") }}
    </v-btn>
    <!-- ███████████████████████ Dialog ███████████████████████ -->

    <v-dialog
      v-model="dialog"
      fullscreen
      scrollable
      transition="dialog-top-transition"
    >
      <v-card rounded="0">
        <v-card-title>
          <v-row align="center" no-gutters>
            <v-icon class="me-2" color="#111">workspaces</v-icon>
            Resource Clusters®
            <small class="mx-2"
              >Press
              <v-avatar color="#eee" rounded size="36"><b>F3</b></v-avatar>
            </small>

            <v-spacer></v-spacer>

            <v-btn
              class="ms-2"
              icon
              title="Toggle group mode."
              variant="text"
              @click="grouped = !grouped"
            >
              <v-icon>{{ grouped ? "view_agenda" : "view_module" }}</v-icon>
            </v-btn>

            <v-btn
              :loading="busy_fetch"
              class="ms-2"
              icon
              title="Refresh data!"
              variant="text"
              @click="refresh"
            >
              <v-icon>refresh</v-icon>
            </v-btn>

            <v-btn
              :to="{ name: 'BPageShopClassificationClusters' }"
              class="ms-2 tnt"
              exact
              variant="text"
              @click="dialog = false"
            >
              <v-icon class="me-1">settings</v-icon>
              Clusters Management
            </v-btn>
          </v-row>
        </v-card-title>
        <v-card-text>
          <u-loading-progress v-if="busy_fetch"></u-loading-progress>

          <v-container>
            <!-- Breadcrumb -->

            <v-row>
              <v-btn
                :disabled="!current_cluster"
                class="tnt"
                color="#000"
                size="small"
                variant="text"
                @click="selectCluster(null)"
              >
                <v-icon class="me-1" size="small">home</v-icon>
                Home
              </v-btn>

              <!-- Parent of Parent of Current Cluster -->
              <template v-if="current_cluster?.parent?.parent_id">
                <v-icon class="mx-1" color="#000"
                  >{{ $t("icons.chevron_next") }}
                </v-icon>
                <v-btn
                  class="tnt"
                  color="#000"
                  size="small"
                  variant="text"
                  @click="
                    selectCluster({ id: current_cluster.parent.parent_id })
                  "
                >
                  ...
                </v-btn>
              </template>

              <!-- Parent of Current Cluster -->

              <template v-if="current_cluster?.parent">
                <v-icon class="mx-1" color="#000"
                  >{{ $t("icons.chevron_next") }}
                </v-icon>
                <v-btn
                  class="tnt"
                  color="#000"
                  size="small"
                  variant="text"
                  @click="selectCluster(current_cluster.parent)"
                >
                  <v-avatar class="me-1" size="20">
                    <img
                      v-if="current_cluster.parent.icon"
                      :src="getShopImagePath(current_cluster.parent.icon, 64)"
                    />
                    <v-icon v-else color="#000" size="small">workspaces</v-icon>
                  </v-avatar>
                  {{ current_cluster.parent.name?.limitWords(3) }}
                </v-btn>
              </template>

              <!-- Current Cluster -->

              <template v-if="current_cluster">
                <v-icon class="mx-1" color="#000"
                  >{{ $t("icons.chevron_next") }}
                </v-icon>
                <v-btn class="pen" color="#000" size="small" variant="text">
                  <v-avatar class="me-1" size="20">
                    <img
                      v-if="current_cluster.icon"
                      :src="getShopImagePath(current_cluster.icon, 64)"
                    />
                    <v-icon v-else color="#000" size="small">workspaces</v-icon>
                  </v-avatar>
                  {{ current_cluster.name?.limitWords(3) }}
                </v-btn>
              </template>
            </v-row>
            <v-row no-gutters>
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                :placeholder="$t('global.commons.search')"
                class="max-width-field"
                clearable
                hide-details
                prepend-inner-icon="search"
                single-line
                variant="plain"
              ></v-text-field>
            </v-row>

            <v-row no-gutters>
              <!-- Back buttons -->
              <b-cluster-folder
                v-if="current_cluster?.parent"
                :key="'back'"
                :cluster="current_cluster.parent"
                is-back
                @click="selectCluster(current_cluster.parent)"
              >
              </b-cluster-folder>
              <b-cluster-folder
                v-else-if="current_cluster"
                :key="'home'"
                :cluster="{ id: null, name: 'Home' }"
                is-back
                @click="selectCluster(null)"
              >
              </b-cluster-folder>

              <!-- Sub Clusters -->

              <b-cluster-folder
                v-for="sub_cluster in sub_clusters"
                :key="'cluster-' + sub_cluster.id"
                :cluster="sub_cluster"
                @click="selectCluster(sub_cluster)"
              >
              </b-cluster-folder>

              <!-- Placeholder -->

              <v-col
                v-if="!current_cluster && !sub_clusters?.length"
                cols="12"
                class="min-height-50vh d-flex align-center flex-column justify-center"
                style="text-wrap: balance"
              >
                <h1 class="mb-3 font-weight-light">Empty Cluster Panel</h1>
                <p>
                  You can create new clusters in the Clusters Management page
                  and assign them to your assets, such as discount codes,
                  offers, landing pages, campaigns, and more. This makes it
                  easier to access each of them quickly through the panel.
                </p>
              </v-col>
            </v-row>

            <!-- Resources (Flat) -->
            <template v-if="!grouped && current_cluster">
              <v-row>
                <b-cluster-resource
                  v-for="{ _key, _type, _item } in flattenedResources"
                  :key="_key + '-' + _item.id"
                  :resource="_item"
                  :resource-type="_type"
                  is-page
                  @close="dialog = false"
                >
                </b-cluster-resource>
              </v-row>
            </template>

            <!-- Resources (Grouped) -->

            <template v-if="grouped && current_cluster">
              <div
                v-for="_type in ClusterResourceType"
                :key="_type.resource_key"
              >
                <template v-if="current_cluster[_type.resource_key]?.length">
                  <u-widget-header
                    :title="$t(_type.group_title)"
                    class="mt-3"
                  ></u-widget-header>
                  <v-row class="my-3">
                    <b-cluster-resource
                      v-for="_item in current_cluster[_type.resource_key]"
                      :key="_type.resource_key + '-' + _item.id"
                      :resource="_item"
                      :resource-type="_type"
                      is-page
                      @close="dialog = false"
                    >
                    </b-cluster-resource>
                  </v-row>
                </template>
              </div>
            </template>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog = false">
              <v-icon start>close</v-icon>

              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import BClusterFolder from "../../cluster/folder/BClusterFolder.vue";
import BClusterResource from "../../cluster/resource/BClusterResource.vue";
import { throttle } from "lodash-es";
import { Cluster } from "@selldone/core-js";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BClustersPanel",
  mixins: [TemplateMixin],

  components: { BClusterResource, BClusterFolder },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    ClusterResourceType: Cluster.ResourceTypes,

    dialog: false,

    current_cluster: null,
    sub_clusters: [], // Sub clusters

    busy_fetch: false,
    search: "",

    KEEP_RESOURCES: {},

    grouped: false,
  }),
  computed: {
    flattenedResources() {
      if (!this.current_cluster) return [];
      const result = [];
      Object.values(Cluster.ResourceTypes).forEach((_type) => {
        const items = this.current_cluster[_type.resource_key];
        if (items)
          for (let _item of items) {
            result.push({
              _key: _type.resource_key,
              _type: _type,
              _item: _item,
            });
          }
      });
      return result;
    },
  },

  watch: {
    search: throttle(function (newVal, oldVal) {
      this.fetchResources();
    }, window.SERACH_THROTTLE),

    shop() {
      this.KEEP_RESOURCES = {}; // Reset!
      this.sub_clusters = [];
      this.current_cluster = null;
      this.refresh();
    },
    grouped(grouped) {
      localStorage.setItem("cluster-panel:grouped", grouped ? "true" : "false");
    },
  },
  created() {
    this.grouped = localStorage.getItem("cluster-panel:grouped") === "true";
    this.fetchResources();
  },
  beforeUnmount() {
    EventBus.$off("show:ClustersPanel");
  },

  mounted() {
    EventBus.$on(
      "show:ClustersPanel",

      ({ cluster, toggle_view = false }) => {
        if (toggle_view) {
          this.dialog = !this.dialog;
          return;
        }

        if (this.current_cluster?.id !== cluster?.id) this.fetchResources(); // Fetch only if current cluster change!

        this.current_cluster = cluster;
        this.dialog = true;
      },
    );
  },

  methods: {
    refresh() {
      // Force refresh data.
      this.KEEP_RESOURCES = {};
      this.fetchResources();
    },
    fetchResources() {
      const search = this.search;
      const key = "CLUSTER-" + this.shop.id + "-" + this.current_cluster?.id;
      // Try load offline:
      if (!search && this.KEEP_RESOURCES[key]) {
        this.current_cluster = this.KEEP_RESOURCES[key].cluster;
        this.sub_clusters = this.KEEP_RESOURCES[key].sub_clusters;
        return;
      }

      this.busy_fetch = true;
      this.sub_clusters = [];
      axios
        .get(
          window.API.GET_SHOP_CLUSTERS_RESOURCES(
            this.shop.id,
            this.current_cluster?.id,
          ),
          {
            params: {
              search: search,
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            return NotificationService.showErrorAlert(null, data.error_msg);
          }
          this.current_cluster = data.cluster;
          this.sub_clusters = data.sub_clusters;

          if (!search)
            // Cache only for empty search:
            this.KEEP_RESOURCES[key] = {
              cluster: data.cluster,
              sub_clusters: data.sub_clusters,
            };
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    selectCluster(cluster) {
      this.current_cluster = cluster;
      this.fetchResources();
    },
  },
};
</script>

<style lang="scss" scoped>
.b--cluster-panel {
  .b--cluster-panel-button {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 0;

    border-radius: 0 0 12px 12px;

    @media only screen and (max-width: 480px) {
      font-size: 10px;
      padding: 4px;
      height: 56px;
      top: 4px;
      border-radius: 12px;
    }
  }
}
</style>
