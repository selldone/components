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
  <v-data-table
    :header-props="{ sortByText: $t('global.commons.sort_by') }"
    :headers="headers"
    :items="links"
    :items-per-page="100"
    :row-props="
      (_data) => {
        return { class: 'row-hover -no-pointer' };
      }
    "
    class="bg-transparent min-height-60vh"
    density="compact"
    hide-default-footer
  >
    <template v-slot:item.source="{ item }">
      <b-campaign-source-icon :value="item.source" class="me-1"></b-campaign-source-icon>
      {{item.source}}
    </template>

    <template v-slot:item.medium="{ item }">
      <b-campaign-medium-icon :value="item.medium" class="me-1"></b-campaign-medium-icon>
      {{item.medium}}
    </template>

    <template v-slot:item.name="{ item }">
      <span
        class="text-left text-capitalize min-width-200"
        v-html="getName(item)"
      ></span>
    </template>

    <template v-slot:item.url="{ item }">
      <div :title="getUrl(item)" class="d-flex align-center">
        <v-icon
          v-if="!campaign.enable"
          :title="$t('global.commons.disable')"
          class="mb-2 me-1"
          color="red"
          size="x-small"
          >circle
        </v-icon>
        <span
          class="small text-truncate m-0 animate-underline max-w-200"
          v-text="getUrl(item)"
          @click.stop="copyToClipboard(getUrl(item))"

        ></span>
      </div>
    </template>

    <template v-slot:item.performance="{ item }">
      <div class="min-width-200 max-w-400">
        <u-sparkline
          :height="24"
          :padding="0"
          :value="[
            item.sessions,
            item.products,
            item.add_carts,
            item.buys,
            item.orders,
          ]"
          class="mx-auto my-1"
          color="#0288D1"
          smooth
          style="width: 100%"
          type="area"
        ></u-sparkline>
        <div
          class="d-flex text-muted mx-3 align-items-center"
          dir="ltr"
          style="font-size: 9px"
        >
          <div class="flex-grow-1">
            {{ $t("global.commons.session") }} <br />
            <b>{{ numeralFormat(item.sessions, "0a") }}</b>
          </div>
          <i class="fas fa-long-arrow-alt-right"></i>
          <div class="flex-grow-1">
            {{ $t("global.commons.product") }} <br />
            <b>{{ numeralFormat(item.products, "0a") }}</b>
          </div>
          <i class="fas fa-long-arrow-alt-right"></i>

          <div class="flex-grow-1">
            {{ $t("global.commons.add") }} <br />
            <b>{{ numeralFormat(item.add_carts, "0a") }}</b>
          </div>
          <i class="fas fa-long-arrow-alt-right"></i>
          <div class="flex-grow-1">
            {{ $t("global.commons.checkout") }} <br />
            <b>{{ numeralFormat(item.buys, "0a") }}</b>
          </div>
          <i class="fas fa-long-arrow-alt-right"></i>
          <div class="flex-grow-1">
            {{ $t("global.commons.payment") }} <br />
            <b>{{ numeralFormat(item.orders, "0a") }}</b>
          </div>
        </div>
      </div>
    </template>

    <template v-slot:item.payment="{ item }">
      <div class="border-between">
        <u-price
          v-for="(pay, _currency) in item.payment"
          :key="_currency"
          :amount="pay"
          :currency="_currency"
          class="mx-1 pe-1"
        ></u-price>
      </div>
    </template>

    <template v-if="hasButtons" v-slot:item.copy="{ item }">
      <v-btn icon title="Copy generated URL" variant="text">
        <v-icon size="small" @click.stop="copy(item)">fa:fas fa-copy</v-icon>
      </v-btn>
    </template>

    <template v-if="hasButtons" v-slot:item.delete="{ item }">
      <v-btn
        :loading="item.busy"
        icon
        title="Remove campaign's link"
        variant="text"
        @click.stop="$emit('click:delete', item)"
      >
        <v-icon size="small">fa:fas fa-eraser</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import BCampaignSourceIcon from "../../../campaign/source/icon/BCampaignSourceIcon.vue";
import BCampaignMediumIcon from "../../../campaign/medium/icon/BCampaignMediumIcon.vue";
import { CampaignHelper } from "@selldone/core-js/helper/campaign/CampaignHelper";
import USparkline from "../../../../ui/chart/sparkline/USparkline.vue";

export default {
  name: "BCampaignLinkList",
  components: { USparkline, BCampaignMediumIcon, BCampaignSourceIcon },

  props: {
    shop: {
      require: true,
    },
    campaign: {
      require: true,
    },
    links: {},
    hasButtons: {
      default: false,
      type: Boolean,
    },
    baseUrl: {
      default: "",
    },
  },

  computed: {
    headers() {
      const out = [
        {
          title: this.$t("global.commons.source"),
          align: "start",
          sortable: true,
          value: "source",
        },
        {
          title: this.$t("global.commons.medium"),
          align: "start",
          sortable: true,
          value: "medium",
        },
       /* {
          title: this.$t("global.commons.name"),
          align: "center",
          sortable: false,
          value: "name",
        },*/
        {
          title: this.$t("global.commons.url"),
          align: "start",
          sortable: false,
          value: "url",
        },
        {
          title: this.$t("global.commons.revenue"),
          align: "center",
          sortable: true,
          value: "payment",
        },
        {
          title: this.$t("global.commons.performance"),
          align: "center",
          sortable: false,
          value: "performance",
        },
      ];

      if (this.hasButtons)
        out.push(
          {
            title: this.$t("global.actions.copy"),
            align: "center",
            sortable: false,
            value: "copy",
          },
          {
            title: this.$t("global.actions.delete"),
            align: "center",
            sortable: false,
            value: "delete",
          },
        );

      return out;
    },
  },
  methods: {
    copy(item) {
      this.copyToClipboard(this.getUrl(item));
    },
    getUrl(link) {
      let url = this.baseUrl;

      let out = `${url}?utm_source=${link.source}&utm_medium=${link.medium}&utm_campaign=${this.campaign.name}`;

      if (link.term) out += `&utm_term=${link.term}`;
      if (link.content) out += `&utm_content=${link.content}`;

      return out;
    },

    getName(link) {
      return `${link.source} <small>></small> ${link.medium}`;
    },

    calcTotalAmount(payment) {
      return CampaignHelper.GetTotalAmount(
        this.shop,
        this.GetUserSelectedCurrency().code,
        payment,
      );
    },
  },
};
</script>

<style scoped></style>
