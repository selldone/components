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
  <div class="s--shop-hyper-items-list">
    <v-fade-transition
      class="border-between-vertical"
      group
      hide-on-leave
      tag="div"
    >
      <div
        v-for="item in items"
        :key="item.id"
        class="d-flex text-subtitle-2 py-1 align-items-center item-avo px-1"
      >
        <v-img
          :src="getProductImage(item.product_id)"
          class="rounded-18px me-2 ms-1 flex-grow-0"
          height="56"
          width="56"
        >
        </v-img>
        <div class="flex-grow-1 w-50">
          <b class="d-block">{{ item.product.title }}</b>
          <span class="small d-block">{{ item.product.title_en }}</span>
          <variant-item-view-micro
            :product-variant="item.variant"
          ></variant-item-view-micro>
        </div>
        <div class="flex-grow-1 text-center">
          <b>{{ item.count }}</b
          ><br />
          <small>{{ $t("global.commons.count_unit") }}</small>
        </div>
        <div class="font-weight-black flex-grow-1 text-center">
          <price-view
            :amount="item.price"
            :currency="item.currency"
            not-show-zero
          ></price-view>
        </div>
        <v-btn
          v-if="!viewOnly && (isOpen || isReserved)"
          :loading="busy_delete === item.id"
          color="red"
          icon
          title="Delete"
          @click="deleteItem(item)"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </v-fade-transition>
  </div>
</template>

<script>
import { BasketStatus } from "@core/enums/basket/BasketStatus";
import VariantItemViewMicro from "@components/product/variant/VariantItemViewMicro.vue";

export default {
  name: "SShopHyperItemsList",
  components: { VariantItemViewMicro },
  props: {
    hyper: { required: true },

    items: {},
    viewOnly: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    BasketStatus: BasketStatus,
    busy_delete: null,
  }),

  computed: {
    isOpen() {
      return this.hyper.status === BasketStatus.Open.code;
    },
    isReserved() {
      return this.hyper.status === BasketStatus.Reserved.code;
    },
  },

  methods: {
    deleteItem(item) {
      this.openDangerAlert(
        this.$t("hyper.delete_item_dialog.title"),
        this.$t("hyper.delete_item_dialog.message"),
        this.$t("hyper.delete_item_dialog.action"),
        () => {
          this.busy_delete = item.id;

          axios
            .delete(window.XAPI.DELETE_OPEN_HYPER_ITEM(this.shop_name, item.id))
            .then(({ data }) => {
              if (!data.error) {
                this.DeleteItemByID(this.items, item.id);

                this.$emit("update:hyper", data.hyper);

                this.showSuccessAlert(
                  null,
                  this.$t("hyper.notifications.delete_success"),
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
.s--shop-hyper-items-list {
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-hyper-items-list {
  .item-avo {
    position: relative;

    &:hover {
      .pending-over,
      .reject-over {
        opacity: 0;
      }
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
