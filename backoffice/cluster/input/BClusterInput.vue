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
    ref="select"
    v-model="cluster"
    v-model:search="search"
    :append-icon="appendIcon"
    :bg-color="backgroundColor"
    :chips="chips"
    :class="{
      disabled: modelValue && busy && !cluster_obj,
      'b-cluster-input--toolbar': toolbarFilter,
      'b-cluster-input--searching': toolbarFilter && search,
    }"
    :clearable="clearable"
    :customFilter="() => true"
    :disabled="disabled"
    :flat="flat"
    :hide-details="hideDetails"
    :items="clusters"
    :label="label ? label : $t('global.commons.cluster')"
    :list-props="showSettingsButton ? { class: 'pt-0' } : undefined"
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
    <template v-slot:item="{ internalItem: item, props }">
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

    <template v-slot:chip="{ internalItem: item, selected, parent }">
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
      <span
        v-else
        :class="toolbarFilter ? 'v-autocomplete__selection-text' : 'single-line'"
      >
        {{ item.raw.name }}
      </span>
    </template>

    <!-- ―――――――――――――――――― prepend-inner ―――――――――――――――――― -->

    <template v-if="!multiple /*Only in the single mode*/" v-slot:prepend-inner>
      <circle-image
        v-if="cluster_obj?.icon"
        :size="toolbarFilter ? 24 : 32"
        :src="getShopImagePath(cluster_obj.icon, 64)"
        :class="{ 'mb-1 me-1 hover-scale force-top': !toolbarFilter }"
      />
      <v-icon v-else-if="cluster_obj && !toolbarFilter">folder</v-icon>

      <v-avatar v-else :size="toolbarFilter ? 24 : 32">
        <v-icon>
          {{ cluster_obj ? "folder" : icon || (noHome ? "workspaces_filled" : "home") }}
        </v-icon>
      </v-avatar>
    </template>

    <!-- ―――――――――――――――――― Management ―――――――――――――――――― -->

    <template v-if="showSettingsButton" #menu-header>
      <v-list-item
        :to="{ name: 'BPageShopClassificationClusters' }"
        :title="$t('global.commons.manage_clusters')"
        :active="false"
        class="b-cluster-input__manage text-start"
        @click="closeMenu"
      >
        <template #prepend>
          <v-icon>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="12" cy="4.75" r="2.25" />
              <circle cx="6" cy="11.5" r="2.25" />
              <circle cx="18" cy="11.5" r="2.25" />
              <path d="M3.75 19.5h8.5m4.5 0h3.5" />
              <circle cx="14.5" cy="19.5" r="2.25" />
            </svg>
          </v-icon>
        </template>
      </v-list-item>
      <v-divider class="b-cluster-input__menu-divider" />
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

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
    rounded: {},
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
    toolbarFilter: { type: Boolean },
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
    closeMenu() {
      if (this.$refs.select) this.$refs.select.menu = false;
    },

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

<style scoped lang="scss">
.b-cluster-input--toolbar.v-autocomplete {
  --b-cluster-filter-height: 38px;
  --b-cluster-filter-font-size: 13px;
  flex: 0 1 var(--b-cluster-filter-width, 300px);
  min-width: 0;
  max-width: 100%;

  :deep(.v-field.v-field--variant-plain) {
    --v-input-control-height: var(--b-cluster-filter-height);
    --v-field-padding-top: 0px;
    --v-field-padding-bottom: 0px;
    --v-field-input-padding-top: 0px;
    --v-field-input-padding-bottom: 0px;
    height: var(--b-cluster-filter-height);
    min-height: var(--b-cluster-filter-height);
  }

  :deep(.v-field__input),
  :deep(.v-field-label) {
    font-family: inherit;
    font-size: var(--b-cluster-filter-font-size);
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0;
  }

  :deep(.v-field__input) {
    min-height: var(--b-cluster-filter-height);
    flex-wrap: nowrap;
  }

  :deep(.v-field-label:not(.v-field-label--floating)) {
    top: 50%;
    transform: translateY(-50%);
  }

  :deep(.v-field__prepend-inner),
  :deep(.v-field__append-inner),
  :deep(.v-field__clearable) {
    min-height: var(--b-cluster-filter-height);
    align-items: center;
    padding-block: 0;
  }

  :deep(.v-field__prepend-inner .v-icon) {
    font-size: 18px;
  }

  :deep(.v-field__input > input),
  :deep(.v-autocomplete__selection) {
    min-inline-size: 0;
  }

  :deep(.v-field--focused .v-field__input > input) {
    min-inline-size: min(64px, 30%);
  }

  // Vuetify keeps custom selections beside the editable search text.
  &.b-cluster-input--searching :deep(.v-autocomplete__selection) {
    display: none;
  }

  :deep(.v-field:focus-within) {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 6px;
  }

  @media (max-width: 760px), (pointer: coarse) {
    --b-cluster-filter-height: 44px;
    --b-cluster-filter-font-size: 16px;
  }
}

.b-cluster-input__manage.v-list-item {
  min-height: 44px;
  padding: 8px 16px;
  color: rgb(var(--v-theme-on-surface));
  background: rgba(var(--v-theme-on-surface), .035);

  :deep(.v-list-item-title) {
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: -2px;
  }
}

.b-cluster-input__menu-divider.v-divider {
  margin-block: 0;
  border-color: rgba(var(--v-theme-on-surface), .12);
  opacity: 1;
}
</style>
