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
  <v-autocomplete
    v-model="cluster"
    :items="clusters"
    item-text="title"
    item-value="id"
    :label="label"
    :rounded="rounded"
    :outlined="outlined"
    :messages="hideDetails ? null : ' '"
    :return-object="returnObject"
    :clearable="clearable"
    :filled="filled"
    :placeholder="placeholder"
    :no-data-text="placeholder"
    :persistent-placeholder="persistentPlaceholder"
    :search-input.sync="search"
    :filter="() => true"
    :class="{ disabled: value && busy && !cluster_obj }"
    @change="$emit('change')"
    :multiple="multiple"
    :chips="chips"
    :disabled="disabled"
    :solo="solo"
    :flat="flat"
    :append-icon="appendIcon"
    :background-color="backgroundColor"
    :hide-details="hideDetails"
  >
    <!-- ―――――――――――――――――― message ―――――――――――――――――― -->

    <template v-slot:message>
      <cluster-parents-view
        v-if="
          !multiple /*Show the cluster detail on the single mode!*/ &&
          cluster_obj
        "
        class="fadeIn single-line"
        :cluster="cluster_obj"
      >
      </cluster-parents-view>
      <div v-if="messages">{{ messages }}</div>
    </template>

    <!-- ―――――――――――――――――― items ―――――――――――――――――― -->
    <template v-slot:item="{ item }">
      <div class="d-flex align-center text-start">
        <v-avatar :size="32" class="me-2">
          <img v-if="item.icon" :src="getShopImagePath(item.icon, 64)" />
          <v-icon v-else>folder</v-icon>
        </v-avatar>

        <div class="flex-grow-1 overflow-hidden">
          <b>{{ item.name }}</b>
          <cluster-parents-view
            v-if="multiple /*Show the cluster detail on the multiple mode!*/"
            :cluster="item"
            small
            class="d-block"
          >
          </cluster-parents-view>
          <small v-else class="d-block single-line">{{
            item.description?.limitWords(8)
          }}</small>
        </div>
      </div>
    </template>

    <!-- ―――――――――――――――――― selection ―――――――――――――――――― -->

    <template v-slot:selection="{ item, selected, parent }">
      <v-chip
        v-if="multiple"
        :input-value="selected"
        close
        @click:close="parent.selectItem(item)"
      >
        <v-avatar left>
          <v-img v-if="item.icon" :src="getShopImagePath(item.icon, 64)" />
          <v-icon v-else>folder</v-icon>
        </v-avatar>

        {{ item.name }}
      </v-chip>
      <span v-else class="single-line">{{ item.name }}</span>
    </template>

    <!-- ―――――――――――――――――― prepend-inner ―――――――――――――――――― -->

    <template v-if="!multiple /*Only in the single mode*/" v-slot:prepend-inner>
      <circle-image
        v-if="cluster_obj?.icon"
        :src="getShopImagePath(cluster_obj.icon, 64)"
        :size="32"
        class="mb-1 me-1 hover-scale force-top"
      />
      <v-icon v-else-if="cluster_obj">folder</v-icon>

      <v-avatar v-else :size="32">
        <v-icon>{{
          icon ? icon : noHome ? "workspaces_filled" : "home"
        }}</v-icon>
      </v-avatar>
    </template>

    <!-- ―――――――――――――――――― prepend-item ―――――――――――――――――― -->

    <template v-slot:append-item>
      <v-list-item
        v-if="showSettingsButton"
        class="text-start"
        :to="{ name: 'ClustersManagement_List' }"
      >
        <v-list-item-icon><v-icon>settings</v-icon></v-list-item-icon>
        <v-list-item-title>Clusters Management</v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import ClusterParentsView from "@components/cluster/ClusterParentsView.vue";
import CircleImage from "@components/ui/image/CircleImage.vue";
import _ from "lodash-es";

export default {
  name: "ClusterSelect",
  components: { ClusterParentsView, CircleImage },
  props: {
    value: {},
    label: {},
    messages: {},
    color: {},

    dark: {
      default: false,
      type: Boolean,
    },
    rounded: {
      default: false,
      type: Boolean,
    },
    outlined: {
      default: false,
      type: Boolean,
    },

    disabled: {
      default: false,
      type: Boolean,
    },

    returnObject: {
      default: false,
      type: Boolean,
    },
    clearable: {
      default: false,
      type: Boolean,
    },
    filled: {
      default: false,
      type: Boolean,
    },
    placeholder: {},
    noHome: {
      default: false,
      type: Boolean,
    },
    persistentPlaceholder: {
      default: false,
      type: Boolean,
    },

    multiple: {
      default: false,
      type: Boolean,
    },
    chips: {
      default: false,
      type: Boolean,
    },
    solo: { type: Boolean },
    flat: { type: Boolean },
    appendIcon: {},
    backgroundColor: {},
    icon: {},
    hideDetails: { type: Boolean },
    showSettingsButton: { type: Boolean },
  },
  data: () => ({
    cluster: null,
    clusters: [],
    total: 0,
    busy: false,

    search: null,

    busy_create: false,
  }),

  computed: {
    cluster_obj() {
      if (!this.cluster) return null;
      return this.isObject(this.cluster)
        ? this.cluster
        : this.clusters.find((i) => i.id === this.cluster);
    },
  },
  watch: {
    search: _.throttle(function (newVal, oldVal) {
      this.fetchClusters();
    }, window.SERACH_THROTTLE),

    cluster(cluster) {
      this.$emit("input", cluster);
    },
    value(cluster) {
      this.cluster = cluster;
    },
  },
  created() {
    this.cluster = this.value;

    if (
      !this.search &&
      window.FETECHED_CLUSTERS &&
      window.FETECHED_CLUSTERS["shop-" + this.$route.params.shop_id]
    ) {
      // Try to load offline to prevent multiple queries in create step!
      this.clusters =
        window.FETECHED_CLUSTERS["shop-" + this.$route.params.shop_id].clusters;
      this.total =
        window.FETECHED_CLUSTERS["shop-" + this.$route.params.shop_id].total;
    } else {
      this.fetchClusters();
    }
  },

  methods: {
    fetchClusters() {
      this.busy = true;

      const search = this.search;
      axios
        .get(window.API.GET_SHOP_CLUSTERS(this.$route.params.shop_id), {
          params: {
            contain: this.isObject(this.value) ? this.value.id : this.value,
            search: search,

            parent: !this.hideDetails,

            offset: 0,
            limit: 10,
          },
        })
        .then(({ data }) => {
          this.clusters = data.clusters;
          this.total = data.total;

          if (!this.noHome)
            this.clusters.unshift({
              id: null,
              name: this.$t("global.commons.home"),
            });

          if (!search) {
            // Catch results only for empty search:
            window.FETECHED_CLUSTERS = {};
            window.FETECHED_CLUSTERS["shop-" + this.$route.params.shop_id] = {
              clusters: data.clusters,
              total: data.total,
            };
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
