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
  <div v-if="modern && viewOnly" class="s--avocado-order-items-modern">
    <div class="s--avocado-order-items-modern__toolbar">
      <span class="sd-modern-list-header">{{ $t("process_center.modern.avocado_requested_items", { count: items.length }) }}</span>
      <v-btn :aria-pressed="!show_all" size="small" variant="text" @click="show_all = !show_all">
        <v-icon start size="16">filter_alt</v-icon>{{ show_all ? $t("avocado.show_accepted") : $t("avocado.show_all") }}
      </v-btn>
    </div>
    <table class="sd-modern-table" :aria-label="$t('process_center.modern.avocado_request_title')">
      <thead><tr>
        <th>{{ $t("process_center.modern.avocado_item") }}</th>
        <th>{{ $t("global.commons.status") }}</th>
        <th class="text-end">{{ $t("global.commons.count") }}</th>
        <th class="text-end">{{ $t("process_center.modern.avocado_unit_price") }}</th>
        <th class="text-end">{{ $t("process_center.modern.avocado_line_total") }}</th>
      </tr></thead>
      <tbody>
        <tr v-for="item in filtered_items" :key="item.id">
          <td :data-label="$t('process_center.modern.avocado_item')">
            <div class="s--avocado-order-items-modern__product">
              <v-img
                :src="item.image ? getShopImagePath(item.image) : require('../../../assets/icons/product-outline.svg')"
                :alt="item.title"
                :tabindex="item.image ? 0 : undefined"
                :role="item.image ? 'button' : undefined"
                :aria-label="item.image ? $t('process_center.modern.avocado_item_image') : undefined"
                :class="{ 'pointer-zoom-in': item.image }"
                width="44" height="44"
                class="s--avocado-order-items-modern__image"
                @click="item.image && showFullscreen($event)"
                @keydown.enter.prevent="item.image && showFullscreen($event)"
                @keydown.space.prevent="item.image && showFullscreen($event)"
              />
              <div>
                <strong>{{ item.title }}</strong>
                <p v-if="item.message">{{ item.message }}</p>
                <v-btn v-if="item.link" :href="item.link" target="_blank" rel="noopener noreferrer" color="primary" variant="text" size="small">
                  <v-icon start size="16">link</v-icon>{{ $t("process_center.modern.avocado_item_link") }}<v-icon end size="14">north_east</v-icon>
                </v-btn>
              </div>
            </div>
          </td>
          <td :data-label="$t('global.commons.status')">
            <span class="s--avocado-order-items-modern__status">
              <i aria-hidden="true" :class="{ '-accepted': item.status === AvocadoItemStatus.ACCEPTED.code, '-pending': item.status === AvocadoItemStatus.PENDING.code, '-rejected': item.status === AvocadoItemStatus.REJECTED.code }" />
              {{ AvocadoItemStatus[item.status] ? $t(AvocadoItemStatus[item.status].name) : '—' }}
            </span>
          </td>
          <td class="text-end" :data-label="$t('global.commons.count')"><bdi>{{ item.count }}</bdi></td>
          <td class="text-end" :data-label="$t('process_center.modern.avocado_unit_price')"><u-price :amount="item.price" :currency="item.currency" /></td>
          <td class="text-end" :data-label="$t('process_center.modern.avocado_line_total')"><u-price :amount="item.price * item.count" :currency="item.currency" /></td>
        </tr>
        <tr v-if="!filtered_items.length"><td colspan="5" class="sd-modern-empty-state">{{ $t("process_center.modern.avocado_items_empty") }}</td></tr>
      </tbody>
    </table>
  </div>
  <div v-else>
    <v-fade-transition
      class="border-between-vertical"
      group
      hide-on-leave
      tag="div"
    >
      <div
        v-for="item in filtered_items"
        :key="item.id"
        :class="{
          'img-grayscale op-0-5':
            !isReserved &&
            !isOpen &&
            item.status !== AvocadoItemStatus.ACCEPTED.code,
        }"
        class="d-flex text-subtitle-2 py-1 align-items-center s--shop-avocado-customer-order-items px-1"
      >
        <v-img
          :class="{ 'pointer-event-none': !item.image }"
          :src="
            item.image
              ? getShopImagePath(item.image)
              : require('../../../assets/icons/product-outline.svg')
          "
          class="rounded-18px me-2 ms-1 flex-grow-0 pointer-zoom-in border"
          height="56"
          width="56"
          @click="showFullscreen"
        >
        </v-img>
        <div class="flex-grow-1 w-50">
          <b class="d-block">{{ item.title }}</b>
          <div class="small d-block">
            {{ item.message }}
            <v-btn
              v-if="item.link"
              :href="item.link"
              class="float-end"
              color="blue"
              size="small"
              target="_blank"
              variant="text"
            >
              <v-icon start>link</v-icon>
              {{ $t("global.commons.link") }}
            </v-btn>
          </div>
        </div>
        <div class="flex-grow-1 text-center">
          <b>{{ item.count }}</b
          ><br />
          <small>{{ $t("global.commons.count_unit") }}</small>
        </div>
        <div class="font-weight-black flex-grow-1 text-center">
          <u-price
            :amount="item.price"
            :currency="item.currency"
            not-show-zero
          ></u-price>
        </div>
        <v-btn
          v-if="!viewOnly && (isOpen || isReserved)"
          :loading="busy_delete === item.id"
          color="red"
          icon
          title="Delete"
          variant="text"
          @click="deleteItem(item)"
        >
          <v-icon>close</v-icon>
        </v-btn>

        <!-- status -->
        <div
          v-if="isReserved && item.status === AvocadoItemStatus.PENDING.code"
          class="pending-over"
        >
          <i class="fas fa-spinner fa-pulse m-1"></i>
          {{ $t(AvocadoItemStatus.PENDING.name) }}
        </div>

        <div
          v-else-if="
            isReserved && item.status === AvocadoItemStatus.REJECTED.code
          "
          class="reject-over"
        >
          {{ $t(AvocadoItemStatus.REJECTED.name) }}
        </div>
      </div>
    </v-fade-transition>

    <div class="text-end">
      <v-btn
        v-if="viewOnly"
        class="my-2 tnt"
        color="#000"
        size="small"
        variant="text"
        @click="show_all = !show_all"
      >
        <v-icon start>visibility</v-icon>
        {{ show_all ? $t("avocado.show_accepted") : $t("avocado.show_all") }}
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { AvocadoItem, Basket } from "@selldone/core-js";
import ImageMixin from "@selldone/components-vue/mixin/image/ImageMixin.ts";

export default {
  name: "SShopAvocadoCustomerOrderItems",
  mixins: [ImageMixin],

  props: {
    avocado: { required: true },

    items: {},
    viewOnly: {
      type: Boolean,
      default: false,
    },
    modern: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    BasketStatus: Basket.Status,
    AvocadoItemStatus: AvocadoItem.Status,
    busy_delete: null,

    show_all: true,
  }),

  computed: {
    isOpen() {
      return this.avocado.status === Basket.Status.Open.code;
    },
    isReserved() {
      return this.avocado.status === Basket.Status.Reserved.code;
    },

    filtered_items() {
      if (!this.viewOnly || this.show_all) return this.items;
      return this.items.filter(
        (it) => it.status === AvocadoItem.Status.ACCEPTED.code,
      );
    },
  },

  methods: {
    deleteItem(item) {
      NotificationService.openDangerAlert(
        this.$t("avocado.delete_item_dialog.title"),
        this.$t("avocado.delete_item_dialog.message"),
        this.$t("avocado.delete_item_dialog.action"),
        () => {
          this.busy_delete = item.id;

          axios
            .delete(
              window.XAPI.DELETE_OPEN_AVOCADO_ITEM(
                this.shop_name,
                this.avocado.hash,
                item.id,
              ),
            )
            .then(({ data }) => {
              if (!data.error) {
                this.DeleteItemByID(this.items, item.id);
                Object.assign(this.avocado, data.avocado);

                NotificationService.showSuccessAlert(
                  null,
                  this.$t("avocado.notifications.delete_success"),
                );
              } else {
                NotificationService.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = null;
            });
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.s--avocado-order-items-modern {
  font-size: 12px;
  line-height: 18px;
  &__toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 12px 8px !important; text-align: start; vertical-align: middle; border-bottom: 1px solid var(--sd-modern-border); }
  td { font-size: 12px; line-height: 18px; }
  th:first-child, td:first-child { padding-inline-start: 0 !important; }
  th:last-child, td:last-child { padding-inline-end: 0 !important; }
  tbody tr:last-child td { border-bottom: 0; }
  &__product { display: flex; align-items: center; gap: 12px; min-width: 170px; }
  &__product > div:last-child { min-width: 0; }
  &__product strong { display: block; font-weight: 500; overflow-wrap: anywhere; }
  &__product p { color: var(--sd-modern-muted); margin: 2px 0 0; overflow-wrap: anywhere; white-space: pre-line; }
  &__product .v-btn { margin-inline-start: -8px; }
  &__image { flex: 0 0 44px; border-radius: 8px; border: 1px solid var(--sd-modern-border); }
  &__image:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  &__status { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
  &__status i { width: 6px; height: 6px; border-radius: 50%; background: #999; }
  &__status .-accepted { background: rgb(var(--v-theme-success)); }
  &__status .-pending { background: rgb(var(--v-theme-warning)); }
  &__status .-rejected { background: rgb(var(--v-theme-error)); }
  @media (max-width: 700px) {
    thead { display: none; }
    tbody, tr, td { display: block; }
    tbody tr { padding: 12px 0; border-bottom: 1px solid var(--sd-modern-border); }
    tbody tr:last-child { border-bottom: 0; }
    td { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0 !important; border: 0 !important; text-align: end; }
    td[data-label]::before { content: attr(data-label); flex-shrink: 0; text-align: start; }
    td:first-child { display: block; text-align: start; }
    td:first-child::before { display: none; }
    &__product { min-width: 0; }
    &__toolbar { align-items: flex-start; flex-direction: column; gap: 4px; }
    &__toolbar .v-btn { margin-inline-start: -8px; }
  }
}
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-avocado-customer-order-items {
  position: relative;

  &:hover {
    .pending-over,
    .reject-over {
      opacity: 0;
    }
  }

  .pending-over,
  .reject-over {
    position: absolute;
    left: 2px;
    top: 2px;
    width: calc(100% - 4px);
    height: calc(100% - 4px);

    z-index: 1;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    border-radius: 18px;
    transition: all 0.3s;
    pointer-events: none;
  }

  .pending-over {
    background: rgba(11, 119, 191, 0.8);
  }

  .reject-over {
    background: rgba(230, 74, 25, 0.8);
  }
}
</style>
