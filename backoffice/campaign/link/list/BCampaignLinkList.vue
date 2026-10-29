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
    v-model:sort-by="sort_by"
    :header-props="{ sortByText: $t('global.commons.sort_by') }"
    :headers="headers"
    :items="links"
    :items-per-page="100"
    :row-props="
      (_data) => {
        return { class: modern ? '' : 'row-hover -no-pointer' };
      }
    "
    class="bg-transparent"
    :class="
      modern
        ? 'sd-modern-data-table b-campaign-link-list--modern'
        : 'min-height-60vh'
    "
    :mobile-breakpoint="modern ? 850 : undefined"
    density="compact"
    hide-default-footer
  >
    <template
      v-if="modern && !isMobile"
      v-slot:header.source="{ column, toggleSort, getSortIcon }"
    >
      <div class="b-campaign-link-list__source-header">
        <button
          type="button"
          :aria-pressed="sort_by.some((sort) => sort.key === 'source')"
          @keydown.stop
          @click.stop="toggleSort(column)"
        >
          {{ $t("global.commons.source")
          }}<v-icon size="12">{{ getSortIcon(column) }}</v-icon>
        </button>
        <span>/</span>
        <button
          type="button"
          :aria-pressed="sort_by.some((sort) => sort.key === 'medium')"
          @keydown.stop
          @click.stop="toggleSort({ ...column, key: 'medium' })"
        >
          {{ $t("global.commons.medium")
          }}<v-icon size="12">{{
            getSortIcon({ ...column, key: "medium" })
          }}</v-icon>
        </button>
      </div>
    </template>
    <template v-slot:item.source="{ item }">
      <template v-if="modern">
        <div class="b-campaign-link-list__source">
          <b-campaign-source-icon :value="item.source" :size="17" />{{
            item.source
          }}
        </div>
        <div v-if="!isMobile" class="b-campaign-link-list__medium">
          <b-campaign-medium-icon :value="item.medium" :size="13" />{{
            item.medium
          }}
        </div>
      </template>
      <template v-else
        ><b-campaign-source-icon :value="item.source" class="me-1" />{{
          item.source
        }}</template
      >
    </template>

    <template v-slot:item.medium="{ item }">
      <b-campaign-medium-icon
        :value="item.medium"
        class="me-1"
      ></b-campaign-medium-icon>
      {{ item.medium }}
    </template>

    <template v-slot:item.name="{ item }">
      <span
        class="text-left text-capitalize min-width-200"
        v-html="getName(item)"
      ></span>
    </template>

    <template v-slot:item.url="{ item }">
      <div v-if="modern" class="b-campaign-link-list__url">
        <button
          type="button"
          class="b-campaign-link-list__destination"
          :aria-label="t('copy')"
          @click.stop="copy(item)"
        >
          {{ urlDestination(item) }}
        </button>
        <div class="b-campaign-link-list__tags" dir="ltr">
          utm_source={{ item.source }} · utm_medium={{ item.medium
          }}<template v-if="item.term"> · utm_term={{ item.term }}</template
          ><template v-if="item.content">
            · utm_content={{ item.content }}</template
          >
        </div>
      </div>
      <div v-else :title="getUrl(item)" class="d-flex align-center">
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
      <div v-if="modern" class="b-campaign-link-list__funnel" dir="ltr">
        <div v-for="step in funnelSteps(item)" :key="step.key">
          <span class="sd-modern-list-header">{{ $t(step.label) }}</span>
          <span class="b-campaign-link-list__count">{{
            numeralFormat(step.value, "0,0")
          }}</span>
          <span
            class="b-campaign-link-list__track"
            :aria-label="`${$t(step.label)}: ${step.value}`"
            ><span :style="{ width: `${step.percent}%` }"
          /></span>
        </div>
      </div>
      <div v-else class="min-width-200 max-w-400">
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
      <div v-if="modern" class="b-campaign-link-list__payments">
        <div
          v-for="payment in paymentRows(item.payment).slice(0, 2)"
          :key="payment.code"
          class="b-campaign-link-list__price"
        >
          <u-currency-icon
            v-if="GetCurrency(payment.code)"
            :currency="payment.code"
            flag-only
            small
            class="b-campaign-link-list__currency-icon"
            :aria-label="payment.code"
            role="img"
          />
          <span v-else class="b-campaign-link-list__muted">{{
            payment.code
          }}</span>
          <u-price
            v-if="payment.amount !== null && GetCurrency(payment.code)"
            :amount="payment.amount"
            :currency="payment.code"
          />
          <span v-else>{{
            payment.amount === null ? "—" : $n(payment.amount)
          }}</span>
        </div>
        <v-menu
          v-if="Object.keys(item.payment || {}).length > 2"
          open-on-hover
          open-on-focus
          open-on-click
          :open-delay="120"
          :close-delay="150"
          :close-on-content-click="false"
          location="top"
          max-width="min(320px, calc(100vw - 24px))"
          max-height="min(400px, calc(100vh - 64px))"
          :content-props="{
            role: 'dialog',
            'aria-label': t('currency_amounts'),
          }"
        >
          <template #activator="{ props }"
            ><button
              v-bind="props"
              type="button"
              class="b-campaign-link-list__more-currencies"
              aria-haspopup="dialog"
              :aria-label="
                t('show_currencies', {
                  count: Object.keys(item.payment).length,
                })
              "
              @click.stop
            >
              {{
                t("more_currencies", {
                  count: Object.keys(item.payment).length - 2,
                })
              }}<v-icon size="13">expand_more</v-icon>
            </button></template
          >
          <v-card
            class="sd-modern-widget b-campaign-link-payment-details text-start"
          >
            <h3>{{ t("currency_amounts") }}</h3>
            <div
              v-for="payment in paymentRows(item.payment)"
              :key="payment.code"
              class="b-campaign-link-payment-details__row"
            >
              <u-currency-icon
                v-if="GetCurrency(payment.code)"
                :currency="payment.code"
                flag-only
                small
                class="b-campaign-link-list__currency-icon"
                aria-hidden="true"
              />
              <span v-else aria-hidden="true"></span>
              <span>{{ payment.code }}</span>
              <u-price
                v-if="payment.amount !== null && GetCurrency(payment.code)"
                :amount="payment.amount"
                :currency="payment.code"
              />
              <span v-else>{{
                payment.amount === null ? "—" : $n(payment.amount)
              }}</span>
            </div>
            <p>
              {{
                t("currency_order", {
                  currency: GetUserSelectedCurrency()?.code || "USD",
                })
              }}
            </p>
          </v-card>
        </v-menu>
        <span
          v-if="!Object.keys(item.payment || {}).length"
          class="b-campaign-link-list__muted"
          >{{ t("no_purchases") }}</span
        >
      </div>
      <div v-else class="border-between">
        <u-price
          v-for="(pay, _currency) in item.payment"
          :key="_currency"
          :amount="pay"
          :currency="_currency"
          class="mx-1 pe-1"
        ></u-price>
      </div>
    </template>

    <template v-if="modern && hasButtons" v-slot:item.actions="{ item }">
      <div class="b-campaign-link-list__actions">
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button"
          :aria-label="t('copy')"
          @click.stop="copy(item)"
          ><v-icon size="16">content_copy</v-icon
          ><v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{ t("copy") }}</v-tooltip
          ></v-btn
        >
        <v-btn
          :loading="item.busy"
          icon
          variant="text"
          class="sd-modern-icon-button"
          :aria-label="t('remove')"
          @click.stop="$emit('click:delete', item)"
          ><v-icon size="16">delete_outline</v-icon
          ><v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{ t("remove") }}</v-tooltip
          ></v-btn
        >
      </div>
    </template>
    <template v-if="modern" v-slot:no-data
      ><div class="sd-modern-empty-state">{{ t("empty") }}</div></template
    >
    <template v-if="modern" v-slot:bottom>
      <footer class="sd-modern-table-footer b-campaign-link-list__footer">
        <span>{{ t("tracked_count", { count: links?.length || 0 }) }}</span
        ><span>{{ t("totals_note") }}</span>
      </footer>
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
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import UCurrencyIcon from "@selldone/components-vue/ui/currency/icon/UCurrencyIcon.vue";
import { PriceHelper } from "@selldone/core-js/helper/price/PriceHelper";

export default {
  name: "BCampaignLinkList",
  mixins: [CurrencyMixin],
  components: {
    USparkline,
    BCampaignMediumIcon,
    BCampaignSourceIcon,
    UCurrencyIcon,
  },

  props: {
    modern: { type: Boolean, default: false },
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

  data() {
    return { sort_by: [] };
  },

  computed: {
    isMobile() {
      return this.$vuetify.display.width < 850;
    },
    headers() {
      if (this.modern) {
        const headers = [
          {
            title: `${this.$t("global.commons.source")} / ${this.$t("global.commons.medium")}`,
            key: "source",
            value: "source",
            align: "start",
            width: "16%",
            sortable: true,
          },
          {
            title: this.t("generated_link"),
            key: "url",
            value: "url",
            align: "start",
            width: "20%",
            sortable: false,
          },
          {
            title: this.$t("global.commons.revenue"),
            key: "payment",
            value: "payment",
            align: "end",
            width: "17%",
            sortable: true,
            sort: (a, b) => this.calcTotalAmount(a) - this.calcTotalAmount(b),
          },
          {
            title: this.t("funnel"),
            key: "performance",
            value: "performance",
            align: "start",
            width: "37%",
            sortable: false,
          },
        ];
        if (this.isMobile) {
          headers[0].title = this.$t("global.commons.source");
          headers.splice(1, 0, {
            title: this.$t("global.commons.medium"),
            key: "medium",
            value: "medium",
            align: "start",
            width: undefined,
            sortable: true,
          });
        }
        if (this.hasButtons)
          headers.push({
            title: this.$t("global.commons.actions"),
            key: "actions",
            value: "actions",
            align: "end",
            width: "10%",
            sortable: false,
          });
        return headers;
      }
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
    paymentRows(payment) {
      const target = this.GetUserSelectedCurrency()?.code || "USD";
      return Object.entries(payment || {})
        .map(([code, raw], index) => {
          const numeric =
            typeof raw === "number" ||
            (typeof raw === "string" && raw.trim() !== "")
              ? Number(raw)
              : NaN;
          const amount = Number.isFinite(numeric) ? numeric : null;
          const rawRate =
            amount === null || amount === 0
              ? null
              : PriceHelper.getBuyRateValue(this.shop, code, target);
          const rate =
            typeof rawRate === "number" ||
            (typeof rawRate === "string" && rawRate.trim() !== "")
              ? Number(rawRate)
              : NaN;
          // Rank stored native units; UPrice alone applies display units such as Toman.
          const converted =
            amount === 0
              ? 0
              : amount !== null && Number.isFinite(rate) && rate > 0
                ? amount * rate
                : NaN;
          return {
            code,
            amount,
            index,
            value: Number.isFinite(converted) ? converted : null,
          };
        })
        .sort((a, b) =>
          a.value === null
            ? b.value === null
              ? a.index - b.index
              : 1
            : b.value === null
              ? -1
              : b.value - a.value || a.index - b.index,
        );
    },
    t(key, values = {}) {
      return this.$t(`campaign.links.refined.${key}`, values);
    },
    urlDestination(item) {
      const url = this.getUrl(item);
      try {
        const parsed = new URL(url);
        return parsed.host + parsed.pathname;
      } catch {
        return url;
      }
    },
    funnelSteps(item) {
      return [
        ["sessions", "campaign.links.refined.sessions"],
        ["products", "campaign.links.refined.views"],
        ["add_carts", "campaign.links.refined.cart"],
        ["buys", "campaign.links.refined.checkout"],
        ["orders", "campaign.links.refined.payment"],
      ].map(([key, label]) => ({
        key,
        label,
        value: item[key] || 0,
        percent:
          item.sessions > 0
            ? Math.max(0, Math.min(100, (item[key] / item.sessions) * 100))
            : 0,
      }));
    },
    copy(item) {
      this.copyToClipboard(this.getUrl(item));
    },
    getUrl(link) {
      if (this.modern) {
        try {
          const url = new URL(this.baseUrl);
          url.searchParams.set("utm_source", link.source);
          url.searchParams.set("utm_medium", link.medium);
          url.searchParams.set("utm_campaign", this.campaign.name);
          if (link.term) url.searchParams.set("utm_term", link.term);
          if (link.content) url.searchParams.set("utm_content", link.content);
          return url.toString();
        } catch {
          /* An unavailable shop domain retains the legacy relative URL. */
        }
      }
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

<style scoped lang="scss">
.b-campaign-link-list--modern {
  --sd-modern-table-font-size: 13px;
  --sd-modern-icon-button-size: 32px;
  min-width: 0;
  font-weight: 400;

  :deep(> .v-table__wrapper > table) {
    table-layout: fixed;
  }
  :deep(> .v-table__wrapper > table > tbody > tr > td) {
    padding: 14px 8px !important;
  }
  :deep(> .v-table__wrapper > table > thead > tr > th) {
    padding-inline: 8px !important;
  }
  :deep(> .v-table__wrapper > table > :is(thead, tbody) > tr > :first-child) {
    padding-inline-start: 0 !important;
  }
  :deep(> .v-table__wrapper > table > :is(thead, tbody) > tr > :last-child) {
    padding-inline-end: 0 !important;
  }
  :deep(.v-data-table-header__content) {
    white-space: normal;
  }
  :deep(.sd-modern-icon-button) {
    border-radius: 8px;
  }
  :deep(.sd-modern-icon-button .v-icon) {
    font-size: 16px !important;
    width: 16px;
    height: 16px;
  }

  .b-campaign-link-list__source-header {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  .b-campaign-link-list__source-header button {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    color: inherit;
    font: inherit;
    text-transform: inherit;
    letter-spacing: inherit;
  }
  .b-campaign-link-list__source,
  .b-campaign-link-list__medium {
    display: flex;
    align-items: center;
    gap: 7px;
    overflow-wrap: anywhere;
  }
  .b-campaign-link-list__source {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.6;
  }
  .b-campaign-link-list__medium {
    font-size: 11px;
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
  }
  .b-campaign-link-list__url {
    min-width: 0;
    text-align: start;
  }
  .b-campaign-link-list__destination {
    display: block;
    text-align: start;
    overflow-wrap: anywhere;
    max-width: 100%;
    font-size: 12px;
    line-height: 1.6;
    color: rgb(var(--v-theme-on-surface));
  }
  .b-campaign-link-list__tags {
    font-size: 10px;
    line-height: 1.6;
    color: var(--sd-modern-muted);
    overflow-wrap: anywhere;
    margin-block-start: 5px;
    text-align: start;
  }
  .b-campaign-link-list__payments {
    display: grid;
    gap: 3px;
    justify-content: end;
  }
  .b-campaign-link-list__price {
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr);
    align-items: center;
    gap: 6px;
    font-size: 11px;
    white-space: nowrap;
  }
  .b-campaign-link-list__more-currencies {
    display: inline-flex;
    align-items: center;
    justify-self: end;
    gap: 3px;
    min-height: 24px;
    font: inherit;
    font-size: 11px;
    color: rgb(var(--v-theme-primary));
  }
  .b-campaign-link-list__price :deep(.u--price) {
    min-width: 0;
    max-width: 100%;
    white-space: normal;
    overflow-wrap: anywhere;
    font-size: 11px;
    font-weight: 400;
    line-height: 1.8;
  }
  .b-campaign-link-list__price :deep(.u--price .small) {
    font-size: inherit !important;
    font-weight: inherit;
  }
  .b-campaign-link-list__muted {
    color: var(--sd-modern-muted);
    font-size: 11px;
  }
  .b-campaign-link-list__funnel {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    grid-template-rows: auto auto 4px;
    column-gap: 5px;
    min-width: 0;
  }
  .b-campaign-link-list__funnel > div {
    display: grid;
    grid-row: span 3;
    grid-template-rows: subgrid;
    min-width: 0;
    text-align: end;
  }
  .b-campaign-link-list__funnel .sd-modern-list-header {
    display: block;
    align-self: end;
    overflow-wrap: anywhere;
  }
  .b-campaign-link-list__count {
    display: block;
    font-size: 11px;
    font-weight: 400;
    margin-block: 5px 8px;
    overflow-wrap: anywhere;
  }
  .b-campaign-link-list__track {
    display: block;
    height: 4px;
    border-radius: 2px;
    overflow: hidden;
    background: rgba(var(--v-theme-on-surface), 0.08);
  }
  .b-campaign-link-list__track > span {
    display: block;
    height: 100%;
    background: rgb(var(--v-theme-primary));
    border-radius: inherit;
  }
  .b-campaign-link-list__actions {
    display: flex;
    gap: 6px;
    justify-content: end;
  }
  .b-campaign-link-list__footer {
    font-size: 11px;
    font-weight: 400;
    line-height: 1.7;
    padding-block-start: 18px;
  }

  @media (max-width: 850px) {
    --sd-modern-icon-button-size: 44px;
    :deep(
      > .v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td
    ) {
      grid-template-columns: minmax(0, 1fr);
      gap: 6px;
      padding: 8px 0 !important;
    }
    :deep(.v-data-table__td-value) {
      width: 100%;
      text-align: start;
    }
    .b-campaign-link-list__destination {
      font-size: 13px;
    }
    .b-campaign-link-list__payments {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: start;
    }
    .b-campaign-link-list__more-currencies {
      min-height: 44px;
    }
    .b-campaign-link-list__count {
      font-size: 12px;
    }
    .b-campaign-link-list__actions {
      justify-content: start;
    }
  }
}
.b-campaign-link-list__currency-icon {
  width: 20px;
  min-width: 20px;
}
.b-campaign-link-list__currency-icon :deep(.-flag),
.b-campaign-link-list__currency-icon :deep(img) {
  margin-inline-end: 0 !important;
}
.b-campaign-link-payment-details.v-card {
  width: 288px;
  max-width: 100%;
  padding: 16px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1.6;
  h3 {
    margin: 0 0 12px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.6;
  }
  .b-campaign-link-payment-details__row {
    display: grid;
    grid-template-columns: 20px 40px minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    padding-block: 5px;
    font-variant-numeric: tabular-nums;
  }
  .b-campaign-link-payment-details__row > :last-child {
    text-align: end;
  }
  :deep(.u--price) {
    font-size: 12px;
    font-weight: 400;
  }
  :deep(.u--price .small) {
    font-size: inherit !important;
  }
  p {
    margin: 12px 0 0;
    padding-block-start: 10px;
    border-block-start: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-size: 11px;
  }
}
</style>
