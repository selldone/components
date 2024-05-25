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
  <div>
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

<script>
import { AvocadoItem, Basket } from "@selldone/core-js";

export default {
  name: "SShopAvocadoCustomerOrderItems",
  props: {
    avocado: { required: true },

    items: {},
    viewOnly: {
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
      this.openDangerAlert(
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

                this.showSuccessAlert(
                  null,
                  this.$t("avocado.notifications.delete_success"),
                );
              } else {
                this.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
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
