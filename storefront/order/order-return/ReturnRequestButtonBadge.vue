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
  <v-chip
    v-if="basketItemReturns?.length"
    @click.stop="$emit('click:return')"
    label
    variant="text"
    pill
    :role="modern ? 'button' : undefined"
    :class="
      modern ? 'return-request-badge--modern text-start' : 'border x-small'
    "
    title=""
  >
    <v-img
      :src="require('../../../assets/icons/return-box.svg')"
      :width="modern ? 16 : 24"
      :height="modern ? 16 : 24"
      :class="modern ? 'return-request-badge__icon' : 'ms-n1'"
    />

    <span v-if="modern" class="return-request-badge__label">
      {{ basketItemReturns.length }}×
      {{ $t("admin_shop.orders.modern.returns.label") }}
    </span>
    <template v-else
      ><b class="mx-1">{{ basketItemReturns.length }}x</b> Return</template
    >

    <v-icon
      :color="getDotColorOfReturnRequests(basketItemReturns)"
      :size="modern ? 6 : 12"
      class="ms-1"
    >
      circle
    </v-icon>

    <v-tooltip
      activator="parent"
      :content-class="
        modern
          ? 'sd-modern-tooltip text-start'
          : 'bg-black text-start rounded-xl pa-3'
      "
      :location="modern ? 'top start' : 'bottom'"
      :open-on-focus="modern || undefined"
      :interactive="modern"
      :width="modern ? 560 : undefined"
      :max-width="modern ? 'calc(100vw - 24px)' : undefined"
    >
      <p :class="modern ? 'sd-modern-tooltip__title' : 'font-weight-bold mb-2'">
        {{
          modern ? $t("admin_shop.orders.modern.returns.title") : "Return items"
        }}
      </p>

      <v-table
        class="bg-transparent"
        :class="
          modern ? 'sd-modern-table return-request-badge__table' : undefined
        "
        density="compact"
        :theme="modern ? undefined : 'dark'"
      >
        <template v-slot:default>
          <thead>
            <tr>
              <th :class="modern ? 'text-start' : 'text-left'">
                {{
                  modern
                    ? $t("admin_shop.orders.modern.returns.reason")
                    : "Reason"
                }}
              </th>
              <th :class="modern ? 'text-start' : 'text-left'">
                {{
                  modern
                    ? $t("admin_shop.orders.modern.returns.count")
                    : "Count"
                }}
              </th>
              <th :class="modern ? 'text-start' : 'text-left'">
                {{
                  modern
                    ? $t("admin_shop.orders.modern.returns.state")
                    : "State"
                }}
              </th>
              <th :class="modern ? 'text-start' : 'text-left'">
                {{
                  modern ? $t("admin_shop.orders.modern.returns.date") : "Date"
                }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="basket_item_return in basketItemReturns"
              :key="basket_item_return.item_id"
            >
              <td
                :data-label="
                  modern
                    ? $t('admin_shop.orders.modern.returns.reason')
                    : undefined
                "
              >
                {{ basket_item_return.reason }}
              </td>
              <td
                :data-label="
                  modern
                    ? $t('admin_shop.orders.modern.returns.count')
                    : undefined
                "
              >
                {{ basket_item_return.count }}
              </td>
              <td
                :data-label="
                  modern
                    ? $t('admin_shop.orders.modern.returns.state')
                    : undefined
                "
              >
                <v-icon
                  :color="
                    getReturnRequestStateObject(basket_item_return.state).color
                  "
                  size="small"
                  >{{
                    getReturnRequestStateObject(basket_item_return.state).icon
                  }}
                </v-icon>
                {{
                  $t(getReturnRequestStateObject(basket_item_return.state).name)
                }}
              </td>
              <td
                :data-label="
                  modern
                    ? $t('admin_shop.orders.modern.returns.date')
                    : undefined
                "
              >
                {{ getLocalTimeStringSmall(basket_item_return.created_at) }}
                <v-icon
                  v-if="
                    basket_item_return.created_at !==
                    basket_item_return.updated_at
                  "
                  >refresh
                </v-icon>
              </td>
            </tr>
          </tbody>
        </template>
      </v-table>
    </v-tooltip>
  </v-chip>
</template>

<script lang="ts">
import { BasketItemReturn } from "@selldone/core-js";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import OrderMixin from "@selldone/components-vue/mixin/order/OrderMixin.ts";

export default {
  name: "ReturnRequestButtonBadge",
  mixins: [DateMixin, OrderMixin],

  props: {
    modern: {
      type: Boolean,
      default: false,
    },
    basketItemReturns: {
      require: true,
    },
  },
  methods: {
    getDotColorOfReturnRequests(basket_item_returns) {
      if (
        basket_item_returns.some(
          (item) => item.state === BasketItemReturn.States.Pending.code,
        )
      )
        return "red";

      if (
        basket_item_returns.some(
          (item) => item.state === BasketItemReturn.States.Rejected.code,
        )
      )
        return "amber";

      return "green";
    },
  },
};
</script>

<style lang="scss" scoped>
.return-request-badge--modern {
  flex: 0 0 auto;
  height: 24px;
  padding-inline: 7px;
  border-radius: 6px;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  letter-spacing: 0;

  .return-request-badge__icon {
    flex: 0 0 16px;
    margin-inline-end: 4px;
  }

  .return-request-badge__label {
    white-space: nowrap;
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
}

.return-request-badge__table {
  :deep(.v-table__wrapper) {
    max-height: min(420px, calc(100dvh - 100px));
    overflow: auto;
  }

  :deep(table) {
    width: 100%;
    table-layout: fixed;
  }

  :deep(th),
  :deep(td) {
    padding-inline-end: 12px !important;
    overflow-wrap: anywhere;
  }

  :deep(th:first-child) {
    width: 30%;
  }

  :deep(th:nth-child(2)) {
    width: 12%;
  }

  :deep(td) {
    font-size: 12px;
    font-weight: 400;
  }

  :deep(td .v-icon) {
    font-size: 16px;
    vertical-align: text-bottom;
  }
}

@media (max-width: 600px) {
  .return-request-badge__table {
    :deep(thead) {
      display: none;
    }

    :deep(tbody > tr) {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px 12px;
      padding-block: 12px;
      border-block-end: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    }

    :deep(tbody > tr:last-child) {
      border-block-end: 0;
    }

    :deep(td) {
      min-width: 0;
      padding: 0 !important;
      border: 0 !important;
    }

    :deep(td:first-child) {
      grid-column: 1 / -1;
    }

    :deep(td[data-label]::before) {
      display: block;
      content: attr(data-label);
      margin-block-end: 3px;
    }
  }
}

@media (pointer: coarse) {
  .return-request-badge--modern {
    min-height: 44px;
  }
}
</style>
