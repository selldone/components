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
    v-model:search="search"
    :append-icon="appendIcon"
    :bg-color="backgroundColor"
    :chips="chips"
    :class="{ disabled: modelValue && busy && !cluster_obj }"
    :clearable="clearable"
    :customFilter="() => true"
    :disabled="disabled"
    :flat="flat"
    :hide-details="hideDetails"
    :items="clusters"
    :label="label ? label : $t('global.commons.cluster')"
    :messages="hideDetails ? undefined : ' '"
    :multiple="multiple"
    :no-data-text="placeholder"
    :outlined="outlined"
    :persistent-placeholder="persistentPlaceholder"
    :placeholder="placeholder ? placeholder : $t('global.placeholders.cluster')"
    :return-object="returnObject"
    :rounded="rounded"
    :variant="
      variant ? variant : solo ? 'solo' : filled ? 'filled' : 'underlined'
    "
    class="text-start"
    item-title="name"
    item-value="id"
    @update:model-value="$emit('change')"
  >
    <!-- ―――――――――――――――――― message ―――――――――――――――――― -->

    <template v-slot:message>
      <b-cluster-parent
        v-if="
          !multiple /*Show the cluster detail on the single mode!*/ &&
          cluster_obj
        "
        :cluster="cluster_obj"
        class="fadeIn single-line"
      >
      </b-cluster-parent>
      <div v-if="messages">{{ messages }}</div>
    </template>

    <!-- ―――――――――――――――――― items ―――――――――――――――――― -->
    <template v-slot:item="{ item, props }">
      <v-list-item
        :title="item.raw.name"
        class="text-start"
        lines="two"
        v-bind="props"
      >
        <template v-slot:prepend>
          <v-avatar :size="32">
            <img
              v-if="item.raw.icon"
              :src="getShopImagePath(item.raw.icon, 64)"
            />
            <v-icon v-else>folder</v-icon>
          </v-avatar>
        </template>

        <v-list-item-subtitle>
          <b-cluster-parent
            v-if="multiple /*Show the cluster detail on the multiple mode!*/"
            :cluster="item.raw"
            class="d-block"
            small
          >
          </b-cluster-parent>
          <div v-else>{{ item.raw.description?.limitWords(8) }}</div>
        </v-list-item-subtitle>
      </v-list-item>
    </template>

    <!-- ―――――――――――――――――― selection ―――――――――――――――――― -->

    <template v-slot:chip="{ item, selected, parent }">
      <v-chip
        v-if="multiple"
        :model-value="selected"
        closable
        @click:close="parent.selectItem(item.raw)"
      >
        <v-avatar start>
          <v-img
            v-if="item.raw.icon"
            :src="getShopImagePath(item.raw.icon, 64)"
          />
          <v-icon v-else>folder</v-icon>
        </v-avatar>

        {{ item.raw.name }}
      </v-chip>
      <span v-else class="single-line">{{ item.raw.name }}</span>
    </template>

    <!-- ―――――――――――――――――― prepend-inner ―――――――――――――――――― -->

    <template v-if="!multiple /*Only in the single mode*/" v-slot:prepend-inner>
      <circle-image
        v-if="cluster_obj?.icon"
        :size="32"
        :src="getShopImagePath(cluster_obj.icon, 64)"
        class="mb-1 me-1 hover-scale force-top"
      />
      <v-icon v-else-if="cluster_obj">folder</v-icon>

      <v-avatar v-else :size="32">
        <v-icon
          >{{ icon ? icon : noHome ? "workspaces_filled" : "home" }}
        </v-icon>
      </v-avatar>
    </template>

    <!-- ―――――――――――――――――― prepend-item ―――――――――――――――――― -->

    <template v-slot:append-item>
      <v-list-item
        v-if="showSettingsButton"
        :to="{ name: 'BPageShopClassificationClusters' }"
        class="text-start"
        prepend-icon="settings"
      >
        <v-list-item-title>Clusters Management</v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import BClusterParent from "../../cluster/parent/BClusterParent.vue";
import CircleImage from "../../../ui/image/CircleImage.vue";
import { throttle } from "lodash-es";

export default {
  name: "BClusterInput",
  components: { BClusterParent, CircleImage },
  emits: ["change", "update:modelValue"],
  props: {
    modelValue: {},
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
    variant: {},
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

    search: "",

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
    search: throttle(function (newVal, oldVal) {
      if (!newVal && !oldVal) return;
      this.fetchClusters();
    }, window.SERACH_THROTTLE),

    cluster(cluster) {
      this.$emit("update:modelValue", cluster);
    },
    modelValue(cluster) {
      this.cluster = cluster;
    },
  },
  created() {
    this.cluster = this.modelValue;

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
            contain: this.isObject(this.modelValue)
              ? this.modelValue.id
              : this.modelValue,
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
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
