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
    class="b-role-orders-list s-table-loading text-start"
    :class="modern ? 'b-role-orders-list--modern' : 'widget-box -large'"
    :aria-busy="busy_fetch"
  >
    <div v-if="modern" class="b-role-orders-list__toolbar">
      <v-btn-toggle
        v-model="status"
        class="b-role-orders-list__statuses"
        :aria-label="$t('admin_shop.orders.physical.table.payment_status')"
        mandatory
        multiple
        @update:model-value="changePaymentStatus"
      >
        <v-btn
          v-for="payment in paymentStatuses"
          :key="payment.code"
          :value="payment.code"
          variant="text"
        >
          <v-icon size="13" aria-hidden="true">{{
            status.includes(payment.code) ? "check" : payment.icon
          }}</v-icon>
          {{ $t(payment.title) }}
        </v-btn>
      </v-btn-toggle>
      <span class="b-role-orders-list__count" aria-live="polite">{{
        busy_fetch || load_error
          ? "—"
          : $t("role_workspace.queue_count", { count: totalItems })
      }}</span>
    </div>
    <s-order-statuses-select
      v-else
      v-model="status"
      class="mt-4 mb-2 px-2"
      has-cod
      has-reserved
      @change="changePaymentStatus"
    ></s-order-statuses-select>

    <u-loading-progress v-if="busy_fetch"></u-loading-progress>
    <v-data-table-server
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="tableHeaders"
      :items="orders"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :mobile="$vuetify.display.xs"
      :row-props="rowProps"
      :loading="busy_fetch"
      class="bg-transparent"
      :class="{
        'sd-modern-data-table sd-modern-data-table--compact b-role-orders-list__table':
          modern,
      }"
      density="compact"
      hide-default-footer
      item-key="id"
      style="width: 100%"
      @update:options="updateOptions"
      @click:row="(_, r) => selectOrder(r.item)"
    >
      <template v-if="!orders.length" v-slot:loading>
        <u-loading-ellipsis css-mode light></u-loading-ellipsis>
      </template>

      <template v-slot:no-data>
        <div
          v-if="load_error"
          class="sd-modern-empty-state b-role-orders-list__empty"
          role="alert"
        >
          <v-icon size="23" color="warning" aria-hidden="true"
            >error_outline</v-icon
          >
          <p>{{ $t("role_workspace.load_error") }}</p>
          <v-btn
            class="sd-modern-button sd-modern-button--compact"
            variant="text"
            prepend-icon="refresh"
            @click="
              fetchOrders(page, sortBy?.[0]?.key, sortBy?.[0]?.order === 'desc')
            "
            >{{ $t("role_workspace.retry") }}</v-btn
          >
        </div>
        <div
          v-else-if="modern && !busy_fetch"
          class="sd-modern-empty-state b-role-orders-list__empty"
        >
          <v-icon size="25" aria-hidden="true">inbox</v-icon>
          <p>{{ $t("role_workspace.empty_title") }}</p>
          <small>{{ $t("role_workspace.empty_subtitle") }}</small>
        </div>
        <div v-else-if="!busy_fetch" class="py-5 text-center">
          {{ $t("global.commons.no_data") }}
        </div>
      </template>

      <template v-slot:item.type="{}">
        <v-img :aspect-ratio="1" :height="32" :src="type.basket" :width="32" />
      </template>

      <template v-slot:item.id="{ item }">
        <div :class="{ 'b-role-orders-list__identity': modern }">
          <v-img
            v-if="modern"
            :src="type.basket"
            width="18"
            height="22"
            class="b-role-orders-list__basket"
          />
          <p
            class="m-0"
            :class="modern ? 'b-role-orders-list__code' : 'font-weight-bold'"
          >
            <button v-if="modern" type="button" @click.stop="selectOrder(item)">
              {{ type.basket_code }}-{{ item.id }}
            </button>
            <template v-else>{{ type.basket_code }}-{{ item.id }}</template>

            <i
              v-if="
                inQueProcess(item.delivery_state) && !item.reject && !item.done
              "
              :class="
                modern
                  ? 'b-role-orders-list__pending'
                  : 'fas fa-circle-notch fa-spin text-info'
              "
            ></i>
            <v-icon v-if="item.done" color="success">check</v-icon>
          </p>
        </div>

        <span
          v-if="item.reject"
          :class="
            modern
              ? 'b-role-orders-list__rejected'
              : 'text-danger font-weight-bold'
          "
        >
          {{ $t("admin_shop.orders.physical.rejected") }}

          <v-icon v-if="modern" size="12" color="error">error_outline</v-icon
          ><i v-else class="fas fa-exclamation"></i
        ></span>
        <return-request-button-badge
          v-if="modern && item.basket_item_returns?.length"
          :basket-item-returns="item.basket_item_returns"
          modern
          class="b-role-orders-list__returns"
          @click:return="selectOrder(item)"
        />
      </template>

      <template v-slot:item.price="{ item }">
        <u-price
          :amount="item.price"
          :currency="item.currency"
          :class="{ 'b-role-orders-list__amount': modern }"
        >
        </u-price>

        <small v-if="item.discount" class="d-block">
          {{ $t("admin_shop.orders.physical.discount") }}:

          <u-price :amount="item.discount" :currency="item.currency"></u-price>
        </small>

        <small class="d-block">
          {{ $t("admin_shop.orders.physical.delivery") }}
          :

          <span v-if="item.delivery_price < 0">{{
            $t("role_workspace.shipping_unpaid")
          }}</span>
          <u-price
            v-else
            :amount="item.delivery_price"
            :currency="item.currency"
          >
          </u-price>
        </small>
      </template>

      <template v-slot:item.status="{ item }">
        <span
          v-if="modern"
          class="sd-modern-status sd-modern-status--plain b-role-orders-list__payment"
          ><span
            class="sd-modern-status__dot"
            :style="{ backgroundColor: getStatusColor(item.status) }"
            aria-hidden="true"
          />{{ getStatusString(item.status) }}</span
        >
        <s-order-status-view v-else :status="item.status"></s-order-status-view>
      </template>

      <template v-slot:item.delivery_state="{ item }">
        <div v-if="modern" class="b-role-orders-list__delivery">
          <span class="sd-modern-status sd-modern-status--plain"
            ><span
              class="sd-modern-status__dot"
              :class="item.done ? 'bg-success' : 'bg-warning'"
              aria-hidden="true"
            />{{ getDeliveryStateString(item.delivery_state) }}</span
          >
          <div class="b-role-orders-list__progress" aria-hidden="true">
            <span
              v-for="(step, index) in deliverySteps"
              :key="step.code"
              :class="{
                'is-current': step.code === item.delivery_state,
                'is-past':
                  index <
                  deliverySteps.findIndex(
                    (state) => state.code === item.delivery_state,
                  ),
              }"
            />
          </div>
        </div>
        <div v-else class="min-width-150 pt-2">
          <s-order-delivery-status-stepper
            :dark="dark"
            :state="item.delivery_state"
            :states="deliveryStates"
          />

          <p class="small m-0 text-muted">
            {{ getDeliveryStateString(item.delivery_state) }}
          </p>
        </div>
      </template>

      <template v-slot:item.basket_item_returns="{ item }">
        <return-request-button-badge
          v-if="item.basket_item_returns?.length"
          :basket-item-returns="item.basket_item_returns"
        ></return-request-button-badge>
      </template>

      <template v-slot:item.reserved_at="{ item }">
        <div :class="modern ? 'b-role-orders-list__date' : 'min-width-200'">
          {{ getFromNowString(item.reserved_at) }}<br />
          <small>
            {{ getLocalTimeString(item.reserved_at) }}
          </small>
        </div>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-tooltip
          location="top"
          :open-on-focus="true"
          :persistent="false"
          content-class="sd-modern-tooltip text-start"
          :max-width="'min(320px, calc(100vw - 32px))'"
        >
          <template #activator="{ props }"
            ><v-btn
              v-bind="props"
              icon
              variant="text"
              class="sd-modern-icon-button"
              :aria-label="`${$t('role_workspace.open_task')} ${type.basket_code}-${item.id}`"
              @click.stop="selectOrder(item)"
              ><v-icon size="16" aria-hidden="true">{{
                $t("icons.arrow_next")
              }}</v-icon></v-btn
            ></template
          >
          {{ $t("role_workspace.open_task") }}
        </v-tooltip>
      </template>

      <template v-slot:bottom>
        <footer
          :class="{
            'sd-modern-table-footer b-role-orders-list__footer': modern,
          }"
        >
          <span
            v-if="modern && !busy_fetch && !load_error"
            class="sd-modern-page-summary"
            >{{
              $t("role_workspace.page_range", {
                start: totalItems ? (page - 1) * itemsPerPage + 1 : 0,
                end: Math.min(page * itemsPerPage, totalItems),
                total: totalItems,
              })
            }}</span
          >
          <v-pagination
            v-if="!load_error"
            v-model="page"
            :length="pageCount"
            :total-visible="modern ? 4 : undefined"
            :disabled="busy_fetch"
            :class="{ 'sd-modern-pagination': modern }"
            rounded
          />
        </footer>
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import SOrderStatusesSelect from "../../../../../storefront/order/status-select/SOrderStatusesSelect.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import SOrderDeliveryStatusStepper from "../../../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import ReturnRequestButtonBadge from "../../../../../storefront/order/order-return/ReturnRequestButtonBadge.vue";
import SOrderStatusView from "../../../../../storefront/order/order-status/SOrderStatusView.vue";
import { Basket } from "@selldone/core-js";
import ULoadingEllipsis from "@selldone/components-vue/ui/loading/ellipsis/ULoadingEllipsis.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import OrderMixin from "@selldone/components-vue/mixin/order/OrderMixin.ts";

export default {
  name: "BRolePanelOrdersList",
  mixins: [DateMixin, OrderMixin],
  components: {
    ULoadingEllipsis,
    SOrderStatusView,
    ReturnRequestButtonBadge,
    SOrderStatusesSelect,
    SOrderDeliveryStatusStepper,
  },
  emits: ["total-tasks", "select", "loaded", "scope-change"],
  props: {
    role: {
      required: true,
    },
    shop: {
      required: true,
    },

    type: {
      required: true,
      type: Object,
    },

    dark: {
      default: false,
      type: Boolean,
    },
    modern: { type: Boolean, default: false },
    selectedId: { type: [Number, String], default: null },
  },

  data: function () {
    return {
      busy_fetch: false,
      load_error: false,
      requestId: 0,
      lastScope: null,
      loadedRoleScope: null,

      status: [Basket.Status.Payed.code, Basket.Status.COD.code],

      orders: [],

      // Pagination:
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      sortBy: [{ key: null, order: "desc" }],

      headers: [
        {
          align: "center",
          sortable: false,
          value: "type",
        },
        {
          title: this.$t("admin_shop.orders.physical.table.order_number"),
          align: "start",
          sortable: true,
          value: "id",
        },
        {
          title: this.$t("admin_shop.orders.physical.table.price"),
          align: "center",
          value: "price",
          sortable: true,
        },

        {
          title: this.$t("admin_shop.orders.physical.table.payment_status"),
          align: "center",
          value: "status",
          sortable: true,
        },

        {
          title: this.$t("admin_shop.orders.physical.table.status"),
          align: "center",
          value: "delivery_state",
          sortable: true,
        },

        {
          title: "",
          align: "center",
          value: "basket_item_returns",
          sortable: false,
        },

        {
          title: this.$t("admin_shop.orders.physical.table.order_date"),
          align: "start",
          sortable: true,
          value: "reserved_at",
        },
      ],
    };
  },
  computed: {
    roleScope() {
      return JSON.stringify([
        this.role.id,
        this.role.level,
        this.shop.id,
        this.type.code,
      ]);
    },
    paymentStatuses() {
      return [
        Basket.Status.Reserved,
        Basket.Status.Payed,
        Basket.Status.COD,
        Basket.Status.Canceled,
      ];
    },
    tableHeaders() {
      if (!this.modern) return this.headers;
      return [
        ...this.headers
          .filter(
            (header) => !["type", "basket_item_returns"].includes(header.value),
          )
          .map((header) => ({ ...header, align: "start" })),
        { title: "", value: "actions", sortable: false, width: 46 },
      ];
    },
    deliverySteps() {
      return Object.values(this.deliveryStates || {});
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    deliveryStates() {
      if (this.type.code === ProductType.PHYSICAL.code)
        return Basket.PhysicalOrderStates;
      else if (this.type.code === ProductType.VIRTUAL.code)
        return Basket.VirtualOrderStates;
      else if (this.type.code === ProductType.FILE.code)
        return Basket.FileOrderStates;
      else if (this.type.code === ProductType.SERVICE.code) return {};

      return null;
    },
  },
  watch: {
    roleScope() {
      this.fetchOrders(
        1,
        this.sortBy?.[0]?.key,
        this.sortBy?.[0]?.order === "desc",
      );
    },
  },
  beforeUnmount() {
    this.requestId++;
  },

  methods: {
    updateOptions({ page, sortBy }) {
      this.fetchOrders(
        page,
        sortBy?.[0]?.key,
        sortBy?.[0]?.order === "desc",
        false,
      );
    },
    changePaymentStatus() {
      this.fetchOrders(
        1,
        this.sortBy?.[0]?.key,
        this.sortBy?.[0]?.order === "desc",
      );
    },
    rowProps({ item }) {
      return {
        class: this.modern
          ? `sd-modern-clickable-item row-hover ${item.id === this.selectedId ? "b-role-orders-list__selected" : ""}`
          : "row-hover",
        "aria-selected": this.modern ? item.id === this.selectedId : undefined,
      };
    },
    selectOrder(item) {
      if (
        !this.busy_fetch &&
        !this.load_error &&
        this.loadedRoleScope === this.roleScope &&
        this.orders.some((order) => order.id === item.id)
      )
        this.$emit("select", item);
    },
    fetchOrders(page = 1, sortBy, sortDesc = true, force = true) {
      const scope = JSON.stringify([
        this.roleScope,
        page,
        sortBy,
        sortDesc,
        this.status,
      ]);
      if (!force && scope === this.lastScope) return;
      this.lastScope = scope;
      const requestId = ++this.requestId;
      const roleScope = this.roleScope;
      this.page = page;
      this.$emit("scope-change");
      if (this.loadedRoleScope !== roleScope) {
        this.orders = [];
        this.loadedRoleScope = null;
      }
      // Keep the last page count while loading; a transient zero makes Vuetify reset to page 1.
      this.load_error = false;
      this.busy_fetch = true;

      return axios
        .get(window.API.GET_MY_ROLE_TASKS(this.role.id), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,
            statuses: [...this.status],
          },
        })
        .then(({ data }) => {
          // A prior role, filter or page response must never repopulate this queue.
          if (requestId !== this.requestId || roleScope !== this.roleScope)
            return;
          if (data.error || !Array.isArray(data.orders))
            throw new Error("Invalid role task response");
          this.totalItems = data.total;
          this.orders = data.orders;
          this.loadedRoleScope = roleScope;
          this.$emit("total-tasks", data.total);
          this.$emit("loaded", {
            orders: data.orders,
            total: data.total,
            page,
          });
        })
        .catch(() => {
          if (requestId === this.requestId && roleScope === this.roleScope)
            this.load_error = true;
        })
        .finally(() => {
          if (requestId === this.requestId && roleScope === this.roleScope)
            this.busy_fetch = false;
        });
    },

    inQueProcess(delivery_state) {
      return [
        Basket.PhysicalOrderStates.CheckQueue.code,
        Basket.PhysicalOrderStates.OrderConfirm.code,
        Basket.PhysicalOrderStates.PreparingOrder.code,
      ].includes(delivery_state);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-role-orders-list--modern {
  min-width: 0;
  --sd-modern-icon-button-size: 32px;
  font-family: inherit;
  color: rgb(var(--v-theme-on-surface));

  .b-role-orders-list__toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 17px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  .b-role-orders-list__count {
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  .b-role-orders-list__statuses {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    height: auto;
    max-width: 100%;
    padding: 4px;
    border-radius: 12px;
    background: var(--sd-modern-inset);
    overflow: visible;
    :deep(.v-btn) {
      min-width: 0;
      min-height: 32px;
      height: auto;
      padding: 6px 9px;
      border: 1px solid transparent;
      border-radius: 9px !important;
      font-family: inherit;
      font-size: 11px;
      font-weight: 400;
      line-height: 18px;
      letter-spacing: 0;
      text-indent: 0;
      text-transform: none;
      color: var(--sd-modern-muted);
    }
    :deep(.v-btn--active) {
      color: rgb(var(--v-theme-on-surface));
      background: rgb(var(--v-theme-surface));
      border-color: var(--sd-modern-border);
      box-shadow: 0 2px 5px rgba(var(--v-theme-on-surface), 0.06);
    }
    :deep(.v-btn__overlay) {
      opacity: 0;
    }
    :deep(.v-btn__content) {
      gap: 5px;
      white-space: normal;
      font: inherit;
    }
  }
  .b-role-orders-list__table {
    padding-inline: 10px;
    :deep(table) {
      table-layout: fixed;
    }
    :deep(.v-table__wrapper > table > thead > tr > th) {
      height: 45px;
      padding: 14px 12px !important;
      white-space: normal;
    }
    :deep(.v-table__wrapper > table > tbody > tr > td) {
      height: 77px;
      padding: 10px 12px;
      font-family: inherit;
      font-size: 11px;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }
    :deep(.v-data-table-header__content) {
      flex-wrap: wrap;
    }
    :deep(.v-data-table-header__sort-icon) {
      font-size: 11px;
    }
    :deep(.b-role-orders-list__selected > td) {
      background: var(--sd-modern-inset);
    }
    :deep(.b-role-orders-list__selected > td:first-child) {
      border-inline-start: 2px solid rgb(var(--v-theme-primary));
    }
  }
  .b-role-orders-list__identity {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .b-role-orders-list__basket {
    flex: 0 0 18px;
  }
  .b-role-orders-list__code {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    button {
      color: inherit;
      font: inherit;
      text-align: start;
      white-space: nowrap;
    }
    button:hover {
      color: rgb(var(--v-theme-primary));
    }
    button:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }
    :deep(.v-icon) {
      font-size: 13px;
    }
  }
  .b-role-orders-list__pending {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgb(var(--v-theme-info));
    flex-shrink: 0;
  }
  .b-role-orders-list__rejected {
    display: flex;
    gap: 3px;
    align-items: center;
    font-size: 10px;
    color: var(--sd-modern-muted);
  }
  .b-role-orders-list__returns {
    margin-block-start: 5px;
    max-width: 100%;
  }
  .b-role-orders-list__amount {
    font-size: 13px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  small.d-block {
    color: var(--sd-modern-muted);
    font-size: 10px;
    line-height: 1.35;
    margin-block-start: 2px;
  }
  .b-role-orders-list__payment,
  .b-role-orders-list__delivery .sd-modern-status {
    font-size: 11px;
    font-weight: 400;
    line-height: 16px;
  }
  .b-role-orders-list__progress {
    display: flex;
    gap: 4px;
    margin-block-start: 7px;
    > span {
      width: 12px;
      height: 3px;
      border-radius: 2px;
      background: var(--sd-modern-border);
    }
    > .is-past {
      background: var(--sd-modern-muted);
    }
    > .is-current {
      background: rgb(var(--v-theme-primary));
    }
  }
  .b-role-orders-list__date {
    font-size: 11px;
    line-height: 16px;
    small {
      display: inline-block;
      margin-block-start: 3px;
      font-size: 10px;
      color: var(--sd-modern-muted);
    }
  }
  .b-role-orders-list__footer {
    padding: 16px 7px;
    font-size: 11px;
    gap: 8px;
  }
  .b-role-orders-list__empty {
    padding: 48px 12px;
    min-height: 280px;
    p {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
    }
    small {
      max-width: 300px;
      color: var(--sd-modern-muted);
      font-size: 11px;
    }
  }

  @media (max-width: 599px) {
    --sd-modern-icon-button-size: 44px;
    .b-role-orders-list__toolbar {
      padding: 13px;
    }
    .b-role-orders-list__statuses {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      :deep(.v-btn) {
        min-height: 44px;
        flex: 1 1 auto;
      }
    }
    .b-role-orders-list__table {
      padding-inline: 0;
      :deep(table),
      :deep(thead),
      :deep(tbody),
      :deep(thead > tr) {
        display: block;
        width: 100%;
      }
      :deep(thead > tr > th) {
        display: block;
        width: 100% !important;
        height: auto !important;
      }
      :deep(.v-data-table__tr--mobile) {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 16px 12px;
        padding: 16px 13px;
        border-block-end: 1px solid var(--sd-modern-border);
      }
      :deep(.v-data-table__tr--mobile.b-role-orders-list__selected) {
        background: var(--sd-modern-inset);
      }
      :deep(.v-data-table__tr--mobile.b-role-orders-list__selected > td) {
        background: transparent;
      }
      :deep(
        .v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td
      ) {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
        width: auto !important;
        height: auto;
        min-height: 0;
        padding: 0;
        border: 0;
        box-shadow: none;
      }
      :deep(.v-data-table__td-value) {
        min-width: 0;
        text-align: start !important;
      }
      :deep(.v-data-table__tr--mobile > td:last-child .v-data-table__td-value) {
        align-self: flex-end;
      }
    }
    .b-role-orders-list__code button {
      min-height: 44px;
    }
    .b-role-orders-list__footer {
      padding-inline: 13px;
    }
  }
  @media (pointer: coarse) {
    --sd-modern-icon-button-size: 44px;
    .b-role-orders-list__statuses :deep(.v-btn),
    .b-role-orders-list__code button {
      min-height: 44px;
    }
  }
}
</style>
