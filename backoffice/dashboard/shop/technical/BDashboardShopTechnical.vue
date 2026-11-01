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
  <div
    v-if="shop"
    class="s--shop-dashboard-technical text-start"
    :class="{ 's--shop-dashboard-technical--modern': modern }"
  >
    <!-- █████████████████████████ Domains █████████████████████████ -->
    <b-domains-list
      v-if="modern"
      :key="shop.id"
      :shop="shop"
      class="s--shop-dashboard-technical__domains"
      show-header
      modern
      refined
    />
    <s-widget-box v-else :title="$t('admin_shop.dashboard.info.shop_domains')">
      <template v-slot:top-left>
        <img
          :src="require('../../../../assets/icons/domains.svg')"
          class="me-1"
          height="24"
          width="24"
        />
      </template>

      <b-domains-list :key="shop.id" :shop="shop"></b-domains-list>
    </s-widget-box>

    <!--
        <s-widget-box
          :sub-title="$t('admin_shop.dashboard.info.subtitle')"
          :title="$t('admin_shop.dashboard.info.title')"
    
          has-edit-button
          @edit="
            $router.push({
              name: 'BPageShopSettingInfo',
            })
          "
        >
          <hexagonal-view
            :items="server_items"
            :size="
              $vuetify.display.smAndDown
                ? zones > 2
                  ? 50
                  : 64
                : zones > 2
                  ? 80
                  : 100
            "
          ></hexagonal-view>
        </s-widget-box>-->
  </div>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import { ShopLicense } from "@selldone/core-js/enums/shop/ShopLicense";
import { ShopBadges } from "@selldone/core-js/enums/shop/ShopBadges";
import BDomainsList from "../../../domain/list/BDomainsList.vue";

export default {
  name: "BDashboardShopTechnical",
  components: {
    BDomainsList,
    SWidgetBox,
  },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
      type: [Object, null],
    },
    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    ShopLicense: ShopLicense,

    server_items: [],
  }),

  computed: {
    server_config() {
      return this.shop?.server_config;
    },
    zones() {
      if (!this.server_config.zones) return 0;
      return Object.keys(this.server_config.zones).length;
    },

    badges() {
      return this.shop.badges;
    },
  },

  watch: {},
  created() {
    this.refreshServerItems();
  },
  mounted() {},
  methods: {
    refreshServerItems() {
      if (!this.server_config) {
        this.server_items = [];
        return;
      }
      const row1 =
        // Row 1:
        [
          {
            title: "CSU",
            value: this.$t("global.commons.unlimited"),
            color: "#333",
            tooltip: "Cloud Storage",
          },
          {
            title: "CDB",
            value: this.$t("global.commons.unlimited"),
            color: "#333",
            tooltip: "Cloud Database",
          },
          {
            title: "SSL",
            value: this.server_config.ssl,
            color: "#333",
          },
        ];
      // Row 2:
      const row2 = [];

      if (this.server_config.zones)
        Object.keys(this.server_config.zones).forEach((zone) => {
          row2.push({
            title: "Zone",
            value: zone,
            country: this.server_config.zones[zone],
            color: "#fff",
            class: "bg-plum",
          });
        });

      row2.push({
        title: "Backup",
        value: this.$t("global.commons.auto"),
        color: "#333",
      });

      row2.push({
        title: "CPU",
        value: `${this.server_config.cpus}x Core`,
        color: "#333",
        data: {
          "Reserved CPUs": {
            value: `${this.server_config.cpus}x VCPU`,
            icon: "memory",
          },
          "Backup CPUs": {
            value: `${this.server_config.cpus_b}x VCPU`,
            icon: "developer_board",
          },
          "Cluster(s)": {
            value: this.server_config.clusters,
            icon: "all_inclusive",
          },
          "CPU platform ": {
            value: this.server_config.cpu_name,
            icon: "copyright",
          },
        },
        message:
          '<i class="fas fa-info-circle text-success me-1"></i>' +
          this.$t("admin_shop.dashboard.info.cpu_message"),
      });
      row2.push({
        title: "RAM",
        value: this.server_config.ram,
        color: "#333",
      });

      this.server_items = [row1, row2];
    },

    getBadgeObject(badge) {
      return ShopBadges[badge];
    },
  },
};
</script>

<style lang="scss" scoped>
.s--shop-dashboard-technical__domains {
  padding: 24px;
  border-radius: 15px;

  :deep(.b-domains-list__heading) { margin-block-end: 20px; }
  :deep(.sd-modern-title-text) {
    font-family: inherit;
    font-size: 17px;
    font-weight: 500;
    line-height: 25px;
    letter-spacing: 0;
  }
  :deep(.sd-modern-subtitle) {
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
  }
  :deep(.b-domains-list__add) {
    height: 36px;
    min-height: 36px;
    padding-inline: 12px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 21px;
  }
  @media (max-width: 699px) {
    padding: 18px;
    :deep(.b-domains-list__add) { min-height: 44px; }
  }
  @media (pointer: coarse) {
    :deep(.b-domains-list__add) { min-height: 44px; }
  }
}
</style>
