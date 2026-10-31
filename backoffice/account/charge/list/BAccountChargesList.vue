<!--
  - Copyright (c) 2023. Selldone® Business OS™
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - All rights reserved.
  -->
<template>
  <div class="b-account-charges-list text-start" :aria-busy="busy_fetch">
    <div class="sd-modern-list-toolbar b-account-charges-list__toolbar">
      <div class="b-account-charges-list__gateway"><slot name="gateway" /></div>
      <div class="b-account-charges-list__utilities">
        <span
          v-if="!busy_fetch && !fetch_error"
          class="b-account-charges-list__count"
          role="status"
          >{{
            $t("account_page.history.modern.count", { count: totalItems })
          }}</span
        >
        <u-smart-menu
          modern
          icon="sort"
          :title="$t('account_page.history.modern.sort')"
          :items="sort_items"
        />
        <slot name="actions" />
      </div>
    </div>
    <div
      v-if="fetch_error"
      class="sd-modern-notice b-account-charges-list__error"
      role="alert"
    >
      <v-icon size="20" aria-hidden="true">cloud_off</v-icon>
      <div>
        <h2>{{ $t("account_page.history.modern.load_error_title") }}</h2>
        <p>{{ $t("account_page.history.modern.load_error_message") }}</p>
      </div>
      <v-btn
        class="sd-modern-button sd-modern-button--inline"
        variant="text"
        @click="fetchOrders()"
        >{{ $t("account_page.history.modern.retry") }}</v-btn
      >
    </div>
    <v-data-table-server
      v-model:page="page"
      :headers="headers"
      :items="transactions"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :loading="busy_fetch"
      :mobile="false"
      item-value="id"
      hide-default-footer
      class="sd-modern-data-table b-account-charges-list__table"
    >
      <template #item="{ item }">
        <tr
          class="sd-modern-clickable-item b-account-charges-list__row"
          :aria-disabled="busy_fetch || fetch_error"
          @click="showDetail(item, $event)"
        >
          <td class="b-account-charges-list__reference-cell">
            <span
              class="sd-modern-list-header b-account-charges-list__mobile-label"
              >{{ $t("account_page.history.modern.charge") }}</span
            >
            <button
              type="button"
              class="b-account-charges-list__reference"
              :disabled="busy_fetch || fetch_error"
              :aria-label="
                $t('account_page.history.modern.details') +
                ' ' +
                chargeReference(item)
              "
              @click.stop="showDetail(item, $event)"
            >
              <bdi dir="ltr">{{ chargeReference(item) || "—" }}</bdi>
            </button>
            <span
              v-if="item.target?.auto_charge"
              class="b-account-charges-list__secondary"
              >{{ $t("account_page.history.modern.auto_charge")
              }}<v-tooltip
                activator="parent"
                location="top"
                content-class="sd-modern-tooltip text-start"
                >{{ $t("account_page.history.modern.auto_help") }}</v-tooltip
              ></span
            >
          </td>
          <td class="b-account-charges-list__amount-cell">
            <span
              class="sd-modern-list-header b-account-charges-list__mobile-label"
              >{{ $t("account_page.history.modern.payment_amount") }}</span
            >
            <u-price
              :amount="item.amount"
              :currency="item.currency"
              class="b-account-charges-list__amount"
            />
            <span class="b-account-charges-list__currency"
              ><u-currency-icon
                :currency="item.currency"
                :flag-only="
                  !!(
                    GetCurrency(item.currency)?.flag ||
                    GetCurrency(item.currency)?.icon
                  )
                "
                small
              /><span>{{ item.currency }}</span></span
            >
          </td>
          <td class="b-account-charges-list__status-cell">
            <span
              class="sd-modern-list-header b-account-charges-list__mobile-label"
              >{{ $t("account_page.history.modern.payment_status") }}</span
            >
            <div class="b-account-charges-list__status">
              <span class="sd-modern-status sd-modern-status--plain"
                ><i
                  class="sd-modern-status__dot"
                  :class="
                    statusTone(item.status)
                      ? 'sd-modern-status__dot--' + statusTone(item.status)
                      : ''
                  "
                  aria-hidden="true"
                />{{ statusLabel(item.status) }}</span
              >
              <span
                class="sd-modern-status sd-modern-status--plain b-account-charges-list__mode"
                ><i
                  class="sd-modern-status__dot"
                  :class="
                    item.livemode
                      ? 'sd-modern-status__dot--success'
                      : 'sd-modern-status__dot--warning'
                  "
                  aria-hidden="true"
                />{{
                  $t(
                    item.livemode
                      ? "shop_gateway.transactions.live_mode"
                      : "shop_gateway.transactions.test_mode",
                  )
                }}</span
              >
            </div>
          </td>
          <td class="b-account-charges-list__payment-cell">
            <span
              class="sd-modern-list-header b-account-charges-list__mobile-label"
              >{{ $t("account_page.history.modern.payment_details") }}</span
            >
            <u-payment-card
              :card="paymentCard(item)"
              :currency="item.currency"
              :method="item.method"
              :horizontal="!item.card?.blockchain"
              :small="!item.card?.blockchain"
              :class="{
                'b-account-charges-list__card-identity': !item.card?.blockchain,
              }"
              show-country
            />
            <button
              v-if="item.risk > 0"
              type="button"
              class="b-account-charges-list__risk"
              :aria-label="$t('account_page.history.modern.risk_score')"
            >
              {{ $t("account_page.history.modern.risk_score") }}
              <bdi dir="ltr">{{ item.risk }}/100</bdi
              ><v-icon size="12" aria-hidden="true">info_outline</v-icon
              ><v-tooltip
                activator="parent"
                location="top"
                content-class="sd-modern-tooltip text-start"
                open-on-focus
                open-on-click
                >{{ $t("account_page.history.modern.risk_help") }}</v-tooltip
              >
            </button>
          </td>
          <td class="b-account-charges-list__dates-cell">
            <span
              class="sd-modern-list-header b-account-charges-list__mobile-label"
              >{{ $t("account_page.history.modern.dates") }}</span
            >
            <time
              :datetime="item.issued_at"
              class="b-account-charges-list__date"
              >{{ dateText(item.issued_at) }}</time
            >
            <span class="b-account-charges-list__secondary">
              <template v-if="item.payment_at"
                >{{ $t("account_page.history.modern.paid") }}:
                <time :datetime="item.payment_at">{{
                  dateText(item.payment_at)
                }}</time></template
              >
              <span v-else>{{
                $t("account_page.history.modern.not_paid")
              }}</span>
            </span>
          </td>
          <td class="b-account-charges-list__actions-cell">
            <span
              class="sd-modern-list-header b-account-charges-list__mobile-label"
              >{{ $t("account_page.history.modern.receipt") }}</span
            >
            <div class="b-account-charges-list__actions">
              <v-btn
                v-if="item.target?.completed"
                :loading="busy_download === item.target.id"
                :disabled="
                  busy_fetch || fetch_error ||
                  (busy_download != null && busy_download !== item.target.id)
                "
                class="sd-modern-button sd-modern-button--compact b-account-charges-list__receipt"
                variant="outlined"
                prepend-icon="download"
                @click.stop="downloadSingleReceipt(item.target)"
                >{{ $t("account_page.history.modern.receipt") }}</v-btn
              >
              <v-btn
                v-if="item.status !== 'Succeeded' && item.unique_id"
                :loading="busy_check === item.unique_id"
                :disabled="busy_fetch || fetch_error || (!!busy_check && busy_check !== item.unique_id)"
                class="sd-modern-icon-button b-account-charges-list__check"
                variant="text"
                icon
                :aria-label="$t('account_page.history.modern.check_status')"
                @click.stop="
                  checkPaymentStatus(gateway.code, item, gateway.name)
                "
                ><v-icon size="16" aria-hidden="true">refresh</v-icon
                ><v-tooltip
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  open-on-focus
                  >{{ $t("account_page.history.modern.check_help") }}</v-tooltip
                ></v-btn
              >
              <span
                v-if="
                  !item.target?.completed &&
                  (item.status === 'Succeeded' || !item.unique_id)
                "
                class="b-account-charges-list__secondary"
                :aria-label="
                  $t('account_page.history.modern.receipt_unavailable')
                "
                >—</span
              >
            </div>
          </td>
        </tr>
      </template>
      <template #no-data
        ><div v-if="!busy_fetch && !fetch_error" class="sd-modern-empty-state">
          <v-icon size="28" aria-hidden="true">receipt_long</v-icon>
          <h2>{{ $t("account_page.history.modern.empty_title") }}</h2>
          <p>{{ $t("account_page.history.modern.empty_message") }}</p>
        </div></template
      >
      <template #bottom>
        <footer
          v-if="totalItems && !fetch_error"
          class="sd-modern-table-footer b-account-charges-list__footer"
        >
          <span role="status">{{
            $t("account_page.history.modern.page_summary", {
              start: (page - 1) * itemsPerPage + 1,
              end: Math.min(page * itemsPerPage, totalItems),
              total: totalItems,
            })
          }}</span>
          <v-pagination
            v-model="page"
            :length="pageCount"
            :total-visible="$vuetify.display.width <= 580 ? 1 : 3"
            class="sd-modern-pagination"
            density="compact"
          />
        </footer>
      </template>
    </v-data-table-server>
    <v-dialog
      v-model="show_detail"
      :activator="detail_activator"
      :open-on-click="false"
      :content-props="{ style: { marginInline: '8px' } }"
      width="calc(100% - 16px)"
      max-width="566"
      scrollable
    >
      <v-card
        v-if="selected_transaction"
        class="sd-modern-widget b-account-charge-detail text-start"
        :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'"
        aria-labelledby="account-charge-detail-title"
      >
        <v-card-title class="b-account-charge-detail__header">
          <h2 id="account-charge-detail-title">
            {{ $t("account_page.history.modern.details_title") }}
          </h2>
          <button
            type="button"
            class="sd-modern-info-button"
            :aria-label="$t('account_page.history.modern.records_help')"
          >
            <v-icon size="14" aria-hidden="true">info_outline</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-focus
              open-on-click
            >
              {{ $t("account_page.history.modern.records_help") }}
            </v-tooltip>
          </button>
          <v-btn
            class="sd-modern-icon-button"
            variant="text"
            icon
            :aria-label="$t('account_page.history.modern.close')"
            @click="show_detail = false"
          >
            <v-icon size="16" aria-hidden="true">close</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-focus
              >{{ $t("account_page.history.modern.close") }}</v-tooltip
            >
          </v-btn>
        </v-card-title>
        <v-card-text class="b-account-charge-detail__body">
          <div class="b-account-charge-detail__summary">
            <div>
              <div class="b-account-charge-detail__label">
                {{ $t("account_page.history.modern.payment_amount") }}
              </div>
              <u-price
                :amount="selected_transaction.amount"
                :currency="selected_transaction.currency"
                class="b-account-charge-detail__amount"
              />
              <div class="b-account-charge-detail__status">
                <span class="sd-modern-status sd-modern-status--plain">
                  <i
                    class="sd-modern-status__dot"
                    :class="
                      statusTone(selected_transaction.status)
                        ? 'sd-modern-status__dot--' +
                          statusTone(selected_transaction.status)
                        : ''
                    "
                    aria-hidden="true"
                  />{{ statusLabel(selected_transaction.status) }}
                </span>
                <span class="sd-modern-status sd-modern-status--plain">
                  <i
                    class="sd-modern-status__dot"
                    :class="
                      selected_transaction.livemode
                        ? 'sd-modern-status__dot--success'
                        : 'sd-modern-status__dot--warning'
                    "
                    aria-hidden="true"
                  />{{
                    $t(
                      selected_transaction.livemode
                        ? "shop_gateway.transactions.live_mode"
                        : "shop_gateway.transactions.test_mode",
                    )
                  }}
                </span>
              </div>
            </div>
            <div class="b-account-charge-detail__identity">
              <div class="b-account-charge-detail__currency">
                <u-currency-icon
                  :currency="selected_transaction.currency"
                  class="b-account-charge-detail__currency-icon"
                  :flag-only="
                    !!(
                      GetCurrency(selected_transaction.currency)?.flag ||
                      GetCurrency(selected_transaction.currency)?.icon
                    )
                  "
                  small
                />
                <bdi dir="ltr">{{ selected_transaction.currency }}</bdi>
              </div>
              <button
                v-if="detail_display_unit"
                type="button"
                class="b-account-charge-detail__display-help"
                :aria-label="
                  $t('account_page.history.modern.display_unit_help', {
                    currency: selected_transaction.currency,
                    unit: detail_display_unit,
                  })
                "
              >
                {{
                  $t("account_page.history.modern.displayed_in", {
                    unit: detail_display_unit,
                  })
                }}
                <v-icon size="13" aria-hidden="true">info_outline</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  open-on-focus
                  open-on-click
                  >{{
                    $t("account_page.history.modern.display_unit_help", {
                      currency: selected_transaction.currency,
                      unit: detail_display_unit,
                    })
                  }}</v-tooltip
                >
              </button>
            </div>
          </div>
          <section class="b-account-charge-detail__wallet">
            <div class="b-account-charge-detail__wallet-heading">
              <h3>{{ $t("account_page.history.modern.wallet_charge") }}</h3>
              <span class="sd-modern-status sd-modern-status--plain">
                <i
                  class="sd-modern-status__dot"
                  :class="{
                    'sd-modern-status__dot--success':
                      selected_transaction.target?.completed,
                  }"
                  aria-hidden="true"
                />
                {{
                  $t(
                    selected_transaction.target?.completed
                      ? "account_page.history.modern.completed"
                      : "account_page.history.modern.not_completed",
                  )
                }}
              </span>
            </div>
            <div class="b-account-charge-detail__wallet-value">
              <div class="b-account-charge-detail__wallet-money">
                <div
                  v-if="selected_transaction.target?.currency"
                  class="b-account-charge-detail__currency"
                >
                  <u-currency-icon
                    :currency="selected_transaction.target.currency"
                    class="b-account-charge-detail__currency-icon"
                    :flag-only="
                      !!(
                        GetCurrency(selected_transaction.target.currency)
                          ?.flag ||
                        GetCurrency(selected_transaction.target.currency)?.icon
                      )
                    "
                    small
                  />
                  <bdi dir="ltr">{{
                    selected_transaction.target.currency
                  }}</bdi>
                </div>
                <u-price
                  v-if="selected_transaction.target"
                  :amount="selected_transaction.target.amount"
                  :currency="selected_transaction.target.currency"
                  class="b-account-charge-detail__wallet-amount"
                />
                <span v-else>—</span>
              </div>
              <button
                v-if="chargeReference(selected_transaction)"
                v-copy="chargeReference(selected_transaction)"
                type="button"
                class="b-account-charge-detail__copy"
                :aria-label="
                  $t('account_page.history.modern.copy_charge_reference')
                "
              >
                <bdi dir="ltr">{{ chargeReference(selected_transaction) }}</bdi
                ><v-icon size="13" aria-hidden="true">content_copy</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  open-on-focus
                  >{{
                    $t("account_page.history.modern.copy_charge_reference")
                  }}</v-tooltip
                >
              </button>
              <span v-else>—</span>
            </div>
            <p
              v-if="selected_transaction.target?.auto_charge"
              class="b-account-charge-detail__auto"
            >
              <v-icon size="14" aria-hidden="true">repeat</v-icon
              ><span>{{ $t("account_page.history.modern.auto_help") }}</span>
            </p>
          </section>
          <h3 class="b-account-charge-detail__section-title">
            {{ $t("account_page.history.modern.payment_details") }}
          </h3>
          <dl class="b-account-charge-detail__facts">
            <div>
              <dt>{{ $t("account_page.history.modern.payment_reference") }}</dt>
              <dd>
                <button
                  v-if="selected_transaction.unique_id"
                  v-copy="String(selected_transaction.unique_id)"
                  type="button"
                  class="b-account-charge-detail__copy"
                  :aria-label="
                    $t('account_page.history.modern.copy_payment_reference')
                  "
                >
                  <bdi dir="ltr">{{ selected_transaction.unique_id }}</bdi
                  ><v-icon size="13" aria-hidden="true">content_copy</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                    open-on-focus
                    >{{
                      $t("account_page.history.modern.copy_payment_reference")
                    }}</v-tooltip
                  ></button
                ><span v-else>—</span>
              </dd>
            </div>
            <div>
              <dt>{{ $t("account_page.history.modern.gateway") }}</dt>
              <dd>{{ gateway.name }}</dd>
            </div>
            <div>
              <dt>{{ $t("account_page.history.modern.payment_method") }}</dt>
              <dd>
                <u-payment-card
                  :card="paymentCard(selected_transaction)"
                  :currency="selected_transaction.currency"
                  :method="selected_transaction.method"
                  class="b-account-charge-detail__payment-card"
                  show-country
                />
              </dd>
            </div>
            <div>
              <dt>
                <span class="b-account-charge-detail__risk-label">
                  {{ $t("account_page.history.modern.risk_score") }}
                  <button
                    type="button"
                    class="sd-modern-info-button"
                    :aria-label="$t('account_page.history.modern.risk_help')"
                  >
                    <v-icon size="14" aria-hidden="true">info_outline</v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                      content-class="sd-modern-tooltip text-start"
                      open-on-focus
                      open-on-click
                      >{{
                        $t("account_page.history.modern.risk_help")
                      }}</v-tooltip
                    >
                  </button>
                </span>
              </dt>
              <dd>
                <bdi v-if="selected_transaction.risk > 0" dir="ltr"
                  >{{ selected_transaction.risk }}/100</bdi
                ><span v-else>—</span>
              </dd>
            </div>
            <div>
              <dt>{{ $t("account_page.history.modern.issued") }}</dt>
              <dd>
                <time :datetime="selected_transaction.issued_at">{{
                  dateText(selected_transaction.issued_at, true)
                }}</time>
              </dd>
            </div>
            <div>
              <dt>{{ $t("account_page.history.modern.paid") }}</dt>
              <dd>
                <time
                  v-if="selected_transaction.payment_at"
                  :datetime="selected_transaction.payment_at"
                  >{{ dateText(selected_transaction.payment_at, true) }}</time
                ><span v-else>{{
                  $t("account_page.history.modern.not_paid")
                }}</span>
              </dd>
            </div>
          </dl>
          <p class="b-account-charge-detail__notice">
            <v-icon size="14" aria-hidden="true">info_outline</v-icon
            ><span>{{ $t("account_page.history.modern.amount_help") }}</span>
          </p>
        </v-card-text>
        <v-card-actions class="b-account-charge-detail__actions">
          <span
            v-if="
              !selected_transaction.target?.completed &&
              (selected_transaction.status === 'Succeeded' ||
                !selected_transaction.unique_id)
            "
            class="b-account-charge-detail__unavailable"
            >{{ $t("account_page.history.modern.receipt_unavailable") }}</span
          >
          <v-btn
            v-if="
              selected_transaction.status !== 'Succeeded' &&
              selected_transaction.unique_id
            "
            :loading="busy_check === selected_transaction.unique_id"
            :disabled="
              !!busy_check && busy_check !== selected_transaction.unique_id
            "
            class="sd-modern-button"
            variant="outlined"
            prepend-icon="refresh"
            @click="
              checkPaymentStatus(
                gateway.code,
                selected_transaction,
                gateway.name,
              )
            "
          >
            {{ $t("account_page.history.modern.check_status") }}
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-focus
              >{{ $t("account_page.history.modern.check_help") }}</v-tooltip
            >
          </v-btn>
          <v-btn
            v-if="selected_transaction.target?.completed"
            :loading="busy_download === selected_transaction.target.id"
            :disabled="
              busy_download != null &&
              busy_download !== selected_transaction.target.id
            "
            class="sd-modern-button sd-modern-button--primary"
            variant="flat"
            color="primary"
            prepend-icon="download"
            @click="downloadSingleReceipt(selected_transaction.target)"
          >
            {{ $t("account_page.history.modern.download_pdf") }}
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-focus
              >{{ $t("account_page.history.modern.pdf_help") }}</v-tooltip
            >
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import UPaymentCard from "../../../../ui/payment/card/UPaymentCard.vue";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import USmartMenu from "../../../../ui/smart/menu/USmartMenu.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { TransactionStatus } from "@selldone/core-js/enums/payment/TransactionStatus";
import { FileHelper } from "@selldone/core-js";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

function escaped(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
}

export default {
  name: "BAccountChargesList",
  mixins: [DateMixin, CurrencyMixin],
  components: { UCurrencyIcon, UPaymentCard, USmartMenu },
  emits: ["request:refresh"],
  props: {
    account: { required: true, type: Object },
    gateway: { required: true, type: Object },
  },
  data: () => ({
    busy_fetch: false,
    fetch_error: false,
    transactions: [],
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    sort_key: "issued_at",
    sort_desc: true,
    busy_check: null,
    busy_download: null,
    selected_transaction: null,
    show_detail: false,
    detail_activator: null,
    active: true,
    list_request: 0,
    check_request: 0,
    download_request: 0,
  }),
  computed: {
    detail_display_unit() {
      const code = this.selected_transaction?.currency;
      const currency = code ? this.GetCurrency(code) : null;
      return currency?.alt_name ? this.$t(currency.alt_name) : null;
    },
    context_key() {
      return this.account.account_number + ":" + this.gateway.code;
    },
    request_key() {
      return JSON.stringify([
        this.context_key,
        this.page,
        this.sort_key,
        this.sort_desc,
      ]);
    },
    request_options() {
      return {
        account_number: this.account.account_number,
        gateway_code: this.gateway.code,
        page: this.page,
        sortBy: this.sort_key,
        sortDesc: this.sort_desc,
      };
    },
    pageCount() {
      return Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    },
    headers() {
      return [
        {
          title: this.$t("account_page.history.modern.charge"),
          key: "target_id",
          width: "16%",
          sortable: false,
        },
        {
          title: this.$t("account_page.history.modern.payment_amount"),
          key: "amount",
          width: "15%",
          sortable: false,
        },
        {
          title: this.$t("account_page.history.modern.payment_status"),
          key: "status",
          width: "15%",
          sortable: false,
        },
        {
          title: this.$t("account_page.history.modern.payment_details"),
          key: "card",
          width: "18%",
          sortable: false,
        },
        {
          title: this.$t("account_page.history.modern.dates"),
          key: "issued_at",
          width: "23%",
          sortable: false,
        },
        {
          title: this.$t("account_page.history.modern.receipt"),
          key: "action",
          width: "13%",
          align: "end",
          sortable: false,
        },
      ];
    },
    sort_items() {
      const labels = {
        amount: "account_page.history.modern.payment_amount",
        currency: "shop_gateway.transactions.table.currency",
        livemode: "account_page.history.modern.payment_mode",
        status: "account_page.history.modern.payment_status",
        target_id: "account_page.history.modern.charge",
        risk: "account_page.history.modern.risk_score",
        card: "account_page.history.modern.payment_details",
        issued_at: "account_page.history.modern.issued",
        payment_at: "account_page.history.modern.paid",
      };
      return [
        ...Object.entries(labels).map(([key, label]) => ({
          title: this.$t(label),
          icon:
            this.sort_key === key
              ? "radio_button_checked"
              : "radio_button_unchecked",
          click: () => this.setSort(key),
        })),
        {
          title: this.$t(
            this.sort_desc
              ? "account_page.history.modern.descending"
              : "account_page.history.modern.ascending",
          ),
          icon: this.sort_desc ? "arrow_downward" : "arrow_upward",
          click: this.reverseSort,
        },
      ];
    },
  },
  watch: {
    context_key: {
      flush: "sync",
      handler() {
        this.list_request++;
        this.check_request++;
        this.download_request++;
        this.page = 1;
        this.totalItems = 0;
        this.transactions = [];
        this.selected_transaction = null;
        this.show_detail = false;
        this.detail_activator = null;
        this.busy_check = null;
        this.busy_download = null;
        this.fetch_error = false;
      },
    },
    request_options: {
      immediate: true,
      handler() {
        this.fetchOrders();
      },
    },
  },
  beforeUnmount() {
    this.active = false;
    this.list_request++;
    this.check_request++;
    this.download_request++;
  },
  methods: {
    setSort(key) {
      if (
        ![
          "amount",
          "currency",
          "livemode",
          "status",
          "target_id",
          "risk",
          "card",
          "issued_at",
          "payment_at",
        ].includes(key)
      )
        return;
      this.sort_key = key;
      this.page = 1;
    },
    reverseSort() {
      this.sort_desc = !this.sort_desc;
      this.page = 1;
    },
    statusLabel(status) {
      return Object.hasOwn(TransactionStatus, status)
        ? this.$t(TransactionStatus[status].name)
        : status || "—";
    },
    statusTone(status) {
      return status === "Succeeded"
        ? "success"
        : status === "Canceled"
          ? "error"
          : ["RequireAction", "Processing", "RequireCapture"].includes(status)
            ? "warning"
            : "";
    },
    chargeReference(item) {
      const id = item.target?.id ?? item.target_id;
      return id == null ? "" : "CHARGE-" + id;
    },
    paymentCard(item) {
      const card = item.card;
      if (!card || card.blockchain || !card.card_no) return card;
      const number = String(card.card_no);
      if (!/^[\d -]{8,}$/.test(number)) return card;
      return {
        ...card,
        card_no: "•••• " + number.replace(/\D/g, "").slice(-4),
      };
    },
    dateText(value, full = false) {
      if (!value || !Number.isFinite(new Date(value).getTime())) return "—";
      if (full) return this.getLocalTimeString(value);
      return new Intl.DateTimeFormat(window.$language?.full_locale, {
        calendar: window.$language?.calendar?.calendar,
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(value));
    },
    showDetail(item, event?) {
      if (this.busy_fetch || this.fetch_error || !this.transactions.includes(item)) return;
      const trigger = event?.currentTarget;
      // Native blockchain copy targets in UPaymentCard use .hover-b, not buttons.
      if (
        trigger?.tagName === "TR" &&
        event.target?.closest?.("button, .hover-b")
      )
        return;
      this.detail_activator =
        trigger?.tagName === "TR"
          ? trigger.querySelector(".b-account-charges-list__reference")
          : trigger || null;
      this.selected_transaction = item;
      this.show_detail = true;
    },
    fetchOrders(
      page = this.page,
      sortBy = this.sort_key,
      sortDesc = this.sort_desc,
    ) {
      const request = ++this.list_request;
      const key = this.request_key;
      const context = this.context_key;
      this.check_request++;
      this.download_request++;
      this.busy_check = null;
      this.busy_download = null;
      this.selected_transaction = null;
      this.show_detail = false;
      this.detail_activator = null;
      this.busy_fetch = true;
      this.fetch_error = false;
      return axios
        .get(
          window.API.GET_ACCOUNT_CHARGES_HISTORY(
            this.account.account_number,
            this.gateway.code,
          ),
          {
            params: {
              offset: (page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
              sortBy,
              sortDesc,
            },
          },
        )
        .then(({ data }) => {
          if (
            !this.active ||
            request !== this.list_request ||
            key !== this.request_key ||
            context !== this.context_key
          )
            return;
          if (data.error) {
            this.fetch_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.transactions = data.transactions;
          this.totalItems = data.total;
          this.page = Math.min(this.page, this.pageCount);
        })
        .catch((error) => {
          if (
            this.active &&
            request === this.list_request &&
            key === this.request_key &&
            context === this.context_key
          ) {
            this.fetch_error = true;
            NotificationService.showLaravelError(error);
          }
        })
        .finally(() => {
          if (
            this.active &&
            request === this.list_request &&
            key === this.request_key &&
            context === this.context_key
          )
            this.busy_fetch = false;
        });
    },
    checkPaymentStatus(gateway_code, item, gateway_name) {
      if (
        !this.active ||
        this.busy_fetch ||
        this.fetch_error ||
        this.busy_check ||
        gateway_code !== this.gateway.code ||
        !this.transactions.includes(item) ||
        item.status === "Succeeded" ||
        !item.unique_id
      )
        return;
      const request = ++this.check_request;
      const key = this.request_key;
      this.busy_check = item.unique_id;
      return axios
        .get(
          window.API.GET_CHECK_CHARGE_PAYMENT_GATEWAY(
            this.account.account_number,
            gateway_code,
            item.unique_id,
          ),
        )
        .then(({ data }) => {
          if (
            !this.active ||
            request !== this.check_request ||
            key !== this.request_key ||
            !this.transactions.includes(item)
          )
            return;
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          if (data.success) {
            item.status = data.transaction_status || data.status || item.status;
            if (data.payment_at) item.payment_at = data.payment_at;
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_center.payment_widget.notifications.pay_confirm_message",
                {
                  payment_at: escaped(this.dateText(data.payment_at, true)),
                  gateway_name: escaped(gateway_name),
                },
              ),
            );
            this.fetchOrders();
            this.$emit("request:refresh");
          } else {
            NotificationService.showWarningAlert(
              this.$t(
                "process_center.payment_widget.notifications.pay_fail_title",
              ),
              this.$t(
                "process_center.payment_widget.notifications.pay_fail_message",
              ) +
                "<br>" +
                this.$t("global.commons.last_status") +
                ": " +
                escaped(this.statusLabel(data.status || item.status)) +
                "<hr>" +
                escaped(data.message),
            );
          }
        })
        .catch((error) => {
          if (
            this.active &&
            request === this.check_request &&
            key === this.request_key
          )
            NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (this.active && request === this.check_request)
            this.busy_check = null;
        });
    },
    downloadSingleReceipt(charge) {
      if (
        !this.active ||
        this.busy_fetch ||
        this.fetch_error ||
        this.busy_download != null ||
        !charge?.completed ||
        !this.transactions.some(
          (item) => item.target?.id === charge.id && item.target.completed,
        )
      )
        return;
      const request = ++this.download_request;
      const key = this.request_key;
      this.busy_download = charge.id;
      return axios
        .request({
          url: window.API.GET_ACCOUNT_DOWNLOAD_SINGLE_CHARGE_RECEIPT(
            this.account.account_number,
            charge.id,
          ),
          method: "GET",
          responseType: "blob",
        })
        .then(({ data, headers }) => {
          if (
            this.active &&
            request === this.download_request &&
            key === this.request_key
          )
            FileHelper.DownloadBlobFile(data, headers);
        })
        .catch((error) => {
          if (
            this.active &&
            request === this.download_request &&
            key === this.request_key
          )
            NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (this.active && request === this.download_request)
            this.busy_download = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-account-charges-list {
  --sd-modern-icon-button-size: 32px;
  &__toolbar {
    padding-block-end: 17px;
  }
  &__gateway {
    min-width: 0;
  }
  &__utilities {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-inline-start: auto;
  }
  &__count {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__utilities :deep(.sd-modern-icon-button .v-icon) {
    font-size: 16px !important;
  }
  &__error {
    margin-block: 18px;
    h2 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 21px;
    }
    p {
      margin: 4px 0 0;
      font-size: 13px;
      line-height: 21px;
    }
    > .v-btn {
      margin-inline-start: auto;
    }
  }
  &__table {
    --v-table-row-height: auto;
    :deep(> .v-table__wrapper) {
      overflow: visible;
    }
    :deep(> .v-table__wrapper > table) {
      table-layout: fixed;
    }
    :deep(.v-data-table__th) {
      height: auto;
      padding: 16px 8px 10px !important;
    }
  }
  &__table :deep(.b-account-charges-list__row > td) {
    height: auto;
    padding: 13px 8px !important;
    vertical-align: middle;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    background: rgb(var(--v-theme-surface));
  }
  &__reference {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    min-height: 32px;
    padding: 0;
    color: inherit;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    text-align: start;
    overflow-wrap: anywhere;
    &:hover {
      color: rgb(var(--v-theme-primary));
    }
  }
  &__secondary {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
    overflow-wrap: anywhere;
  }
  &__amount {
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
    :deep(.small) {
      font-size: inherit !important;
      font-weight: inherit;
    }
    :deep(.cur-name) {
      margin-inline: 3px !important;
      color: var(--sd-modern-muted);
      font-size: 10px !important;
      font-weight: 400;
    }
  }
  &__currency {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
    .imc {
      width: auto;
      min-width: 17px;
    }
    :deep(.-flag),
    :deep(img) {
      width: 17px;
      height: 12px;
      margin: 0 !important;
      border: 0;
      border-radius: 2px;
      aspect-ratio: auto;
    }
  }
  &__status {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    .sd-modern-status {
      font-size: 11px;
      font-weight: 400;
      line-height: 18px;
    }
  }
  &__mode {
    color: var(--sd-modern-muted);
  }
  &__actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
  &__payment-cell {
    min-width: 0;
    :deep(.v-chip) {
      max-width: 100%;
      background: transparent !important;
      color: inherit;
    }
    :deep(.u--price) {
      font-size: 11px;
      font-weight: 400;
    }
  }
  &__card-identity {
    gap: 6px;
    min-width: 0;
    font-size: 12px;
    line-height: 18px;
    :deep(.v-chip) {
      flex: 0 0 auto;
      height: 20px;
    }
    :deep(> .flex-grow-1) {
      min-width: 0;
    }
    :deep(> .flex-grow-1 > div) {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 5px;
      font-size: 12px;
      line-height: 18px;
      text-align: start;
    }
    :deep(> .flex-grow-1 .mx-1) {
      margin-inline: 0 !important;
    }
  }
  &__risk {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    min-height: 20px;
    margin-block-start: 3px;
    padding: 0;
    color: var(--sd-modern-muted);
    font-family: inherit;
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
    text-align: start;
  }
  &__date {
    display: block;
    font-size: 11px;
    line-height: 18px;
    font-variant-numeric: tabular-nums;
  }
  &__actions-cell {
    text-align: end;
  }
  &__receipt {
    min-height: 32px;
    padding-inline: 7px;
    font-size: 11px;
    font-weight: 500;
    line-height: 18px;
    :deep(.v-icon) {
      font-size: 13px;
    }
  }
  &__mobile-label {
    display: none;
  }
  &__footer {
    margin-block-start: 12px;
    padding-block: 15px 4px;
  }
  :is(&__reference, &__risk):focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 3px;
  }
  @media (max-width: 840px) {
    &__table :deep(> .v-table__wrapper > table),
    &__table :deep(tbody) {
      display: block;
    }
    &__table :deep(thead),
    &__table :deep(colgroup) {
      display: none;
    }
    &__table :deep(.b-account-charges-list__row) {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 12px 18px;
      padding: 17px 8px;
      border-block-end: 1px solid var(--sd-modern-border);
    }
    &__table :deep(.b-account-charges-list__row > td) {
      display: block;
      min-width: 0;
      padding: 0 !important;
      border: 0 !important;
      background: transparent;
    }
    &__amount-cell {
      grid-column: 2;
      grid-row: 1;
      text-align: end;
    }
    &__amount-cell &__currency {
      justify-content: flex-end;
    }
    &__status-cell {
      grid-column: 1;
      grid-row: 2;
    }
    &__actions-cell {
      grid-column: 2;
      grid-row: 2;
      align-self: start;
    }
    &__payment-cell {
      grid-column: 1;
      grid-row: 3;
    }
    &__dates-cell {
      grid-column: 2;
      grid-row: 3;
    }
    &__mobile-label {
      display: block;
      margin-block-end: 3px;
    }
  }
  @media (max-width: 500px) {
    &__count {
      display: none;
    }
    &__utilities {
      gap: 6px;
    }
    &__table :deep(.b-account-charges-list__row) {
      gap: 14px 12px;
      padding-inline: 6px;
    }
    &__payment-cell {
      grid-column: 1 / -1;
    }
    &__dates-cell {
      grid-column: 1 / -1;
      grid-row: 4;
    }
  }
  @media (max-width: 799px), (pointer: coarse) {
    .sd-modern-icon-button {
      --sd-modern-icon-button-size: 44px;
    }
    &__reference,
    &__risk,
    &__receipt {
      min-height: 44px;
    }
  }
}
.b-account-charge-detail {
  --sd-modern-icon-button-size: 32px;
  container-type: inline-size;
  &.sd-modern-widget {
    padding: 0;
    border: 1px solid var(--sd-modern-border);
    border-radius: 24px !important;
  }
  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 22px 24px 18px !important;
    border-block-end: 1px solid var(--sd-modern-border);
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      line-height: 28px;
      letter-spacing: -0.25px;
      white-space: normal;
    }
    > .v-btn {
      flex-shrink: 0;
      margin-inline-start: auto;
    }
  }
  &__body {
    padding: 26px 24px 24px !important;
    font-size: var(--sd-modern-font-body);
    line-height: 22px !important;
    letter-spacing: normal !important;
  }
  &__summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-block-end: 23px;
    > div {
      min-inline-size: 0;
    }
  }
  &__label {
    color: var(--sd-modern-muted);
    font-size: var(--sd-modern-font-small);
    line-height: 20px;
  }
  & &__amount.u--price,
  & &__wallet-amount.u--price {
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
    :deep(.small) {
      font-size: inherit !important;
      font-weight: 500;
    }
    :deep(.cur-name) {
      display: inline-block;
      margin-inline: 8px 0 !important;
      font-size: var(--sd-modern-font-small) !important;
      font-weight: 400;
      line-height: 20px;
      letter-spacing: normal;
      white-space: nowrap;
    }
  }
  & &__amount.u--price {
    display: block;
    margin-block-start: 5px;
    font-size: 32px;
    line-height: 40px;
    letter-spacing: -0.7px;
  }
  & &__wallet-amount.u--price {
    font-size: 20px;
    line-height: 28px;
    letter-spacing: -0.2px;
  }
  &__status {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    margin-block-start: 12px;
  }
  .sd-modern-status {
    font-size: var(--sd-modern-font-small);
    font-weight: 400;
    line-height: 20px;
  }
  &__identity {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }
  &__currency {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: var(--sd-modern-font-small);
    line-height: 20px;
  }
  &__currency-icon {
    inline-size: 20px;
    min-inline-size: 20px !important;
    block-size: 20px;
    line-height: 20px;
    :deep(.-flag),
    :deep(img) {
      margin-inline: 0 !important;
    }
  }
  &__display-help {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-block-size: 28px;
    margin-inline: -4px;
    padding: 2px 4px;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
    text-align: start;
    .v-icon {
      flex-shrink: 0;
    }
  }
  &__wallet {
    padding: 16px;
    margin-block-end: 26px;
    border-radius: 14px;
    background: var(--sd-modern-inset);
  }
  &__wallet-heading,
  &__wallet-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }
  &__wallet-value {
    margin-block-start: 8px;
  }
  &__wallet-money {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
    min-inline-size: 0;
  }
  h3 {
    margin: 0;
    font-size: var(--sd-modern-font-body);
    font-weight: 500;
    line-height: 22px;
  }
  &__auto {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    margin: 12px 0 0;
    color: var(--sd-modern-muted);
    font-size: var(--sd-modern-font-small);
    line-height: 20px;
    .v-icon {
      flex: 0 0 14px;
      margin-block-start: 3px;
    }
  }
  &__section-title {
    margin-block-end: 16px !important;
  }
  &__facts {
    display: grid;
    gap: 16px;
    margin: 0;
    > div {
      display: grid;
      grid-template-columns: 130px minmax(0, 1fr);
      align-items: start;
      gap: 14px;
    }
    dt {
      padding-block-start: 3px;
      color: var(--sd-modern-muted);
      font-size: var(--sd-modern-font-small);
      font-weight: 400;
      line-height: 20px;
    }
    dd {
      min-inline-size: 0;
      margin: 0;
      font-size: var(--sd-modern-font-body);
      line-height: 22px;
      overflow-wrap: anywhere;
    }
  }
  &__risk-label {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }
  & &__payment-card {
    text-align: start !important;
    :deep(.v-chip) {
      height: auto;
      padding: 0;
      border: 0;
      background: transparent !important;
      color: inherit !important;
    }
    :deep(.v-chip__content) {
      font-size: var(--sd-modern-font-body);
      font-weight: 400;
      line-height: 22px;
    }
    :deep(> .flex-grow-1) {
      margin: 6px 0 0 !important;
    }
    :deep(.limited-text-150px) {
      max-inline-size: 100% !important;
      max-width: 100% !important;
      white-space: normal !important;
      overflow: visible !important;
      text-overflow: clip !important;
      overflow-wrap: anywhere;
    }
    :deep(small) {
      font-size: var(--sd-modern-font-body);
      line-height: 22px;
    }
    :deep(.u--price) {
      font-size: var(--sd-modern-font-body);
      font-weight: 400;
    }
    :deep(.u--price .small) {
      font-size: inherit !important;
      font-weight: 400;
    }
  }
  &__copy {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-block-size: 28px;
    max-inline-size: 100%;
    margin-inline: -4px;
    padding: 2px 4px;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: var(--sd-modern-font-body);
    font-weight: 400;
    line-height: 22px;
    text-align: start;
    bdi {
      min-inline-size: 0;
      overflow-wrap: anywhere;
      font-variant-numeric: tabular-nums;
    }
    .v-icon {
      flex: 0 0 13px;
      color: var(--sd-modern-muted);
    }
  }
  &__copy:hover,
  &__display-help:hover {
    background: var(--sd-modern-inset);
  }
  &__copy:focus-visible,
  &__display-help:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  &__notice {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 24px 0 0;
    padding-block-start: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-size: var(--sd-modern-font-small);
    line-height: 20px;
    .v-icon {
      flex: 0 0 14px;
      margin-block-start: 3px;
    }
  }
  &__actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    padding: 18px 24px 20px !important;
    border-block-start: 1px solid var(--sd-modern-border);
    .sd-modern-button {
      --v-btn-height: 36px;
      min-height: 36px;
      max-inline-size: 100%;
      padding: 8px 14px;
      font-size: 13px;
      line-height: 20px;
    }
    :deep(.v-btn__content) {
      white-space: normal;
    }
  }
  &__unavailable {
    color: var(--sd-modern-muted);
    font-size: var(--sd-modern-font-small);
    line-height: 20px;
  }
  @container (max-width: 440px) {
    &__summary {
      align-items: flex-start;
      flex-direction: column;
      gap: 12px;
    }
    &__identity {
      align-items: center;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 9px;
    }
    &__facts > div {
      grid-template-columns: minmax(0, 1fr);
      gap: 4px;
    }
    &__actions .sd-modern-button {
      flex: 1 1 auto;
    }
  }
  @media (max-width: 480px) {
    --sd-modern-icon-button-size: 44px;
    &__header,
    &__body,
    &__actions {
      padding-inline: 20px !important;
    }
    &__copy,
    &__display-help,
    &__actions .sd-modern-button {
      min-block-size: 44px;
    }
  }
  @media (pointer: coarse) {
    --sd-modern-icon-button-size: 44px;
    &__copy,
    &__display-help,
    &__actions .sd-modern-button {
      min-block-size: 44px;
    }
  }
}
</style>
