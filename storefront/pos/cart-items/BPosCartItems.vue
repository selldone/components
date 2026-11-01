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
  <div
    v-if="modern"
    :aria-busy="!!busyAdd || !!busyDelete"
    class="b-pos-cart-items text-start"
    role="list"
  >
    <v-fade-transition group>
      <div
        v-for="item in items"
        :key="item.id"
        :class="{ 'b-pos-cart-items__row--readonly': viewOnly }"
        class="b-pos-cart-items__row"
        role="listitem"
      >
        <component
          :is="!viewOnly && !isAffiliatePos ? 'router-link' : 'div'"
          :to="{
            name: 'BPageProductDashboard',
            params: { product_id: item.product.id },
          }"
          class="b-pos-cart-items__image"
        >
          <img
            :alt="item.product.title"
            :src="
              item.product.icon
                ? getShopImagePath(item.variant?.image || item.product.icon, 64)
                : getProductImage(item.product_id)
            "
            height="42"
            width="42"
          />
        </component>

        <div class="b-pos-cart-items__identity">
          <component
            :is="!viewOnly && !isAffiliatePos ? 'router-link' : 'div'"
            :to="{
              name: 'BPageProductDashboard',
              params: { product_id: item.product.id },
            }"
            :tabindex="viewOnly || isAffiliatePos ? 0 : undefined"
            class="b-pos-cart-items__title"
            dir="auto"
          >
            {{ item.product.title }}
            <v-tooltip
              :text="item.product.title"
              activator="parent"
              content-class="sd-modern-tooltip text-start"
              location="top"
              :open-on-focus="true"
            />
          </component>
          <div
            v-if="
              !item.product.original ||
              (conditionObject(item.product.condition) &&
                item.product.condition !== ProductCondition.NEW.code)
            "
            class="b-pos-cart-items__conditions"
          >
            <span v-if="!item.product.original">
              <v-icon size="12">warning_amber</v-icon>
              {{ $t("global.commons.fake") }}
            </span>
            <span
              v-if="
                conditionObject(item.product.condition) &&
                item.product.condition !== ProductCondition.NEW.code
              "
            >
              {{ $t(conditionObject(item.product.condition).title) }}
            </span>
          </div>
          <variant-item-view-micro
            v-if="item.variant"
            :product-variant="item.variant"
            class="b-pos-cart-items__variant"
          />
        </div>

        <v-btn
          v-if="!viewOnly"
          :aria-label="$t('global.actions.delete') + ': ' + item.product.title"
          :disabled="isItemBusy(item)"
          :loading="busyDelete === item.id"
          class="sd-modern-icon-button b-pos-cart-items__remove"
          icon
          variant="text"
          @click.stop="$emit('delete', item.id)"
        >
          <slot name="remove-icon"><v-icon size="16">close</v-icon></slot>
          <v-tooltip
            :text="$t('global.actions.delete')"
            activator="parent"
            content-class="sd-modern-tooltip text-start"
            location="top"
            :open-on-focus="true"
          />
        </v-btn>

        <div class="b-pos-cart-items__amount-row">
          <span v-if="viewOnly" class="b-pos-cart-items__readonly-count">
            {{ $t("global.commons.count") }}: {{ item.count }}
          </span>
          <div v-else class="b-pos-cart-items__quantity">
            <button
              :aria-label="
                $t('cash_register.modern.decrease_quantity') +
                ': ' +
                item.product.title
              "
              :disabled="isItemBusy(item) || item.count <= 0"
              type="button"
              @click="stepCount(item, -1)"
            >
              <slot name="decrease-icon"
                ><v-icon size="16">remove</v-icon></slot
              >
              <v-tooltip
                :text="$t('cash_register.modern.decrease_quantity')"
                activator="parent"
                content-class="sd-modern-tooltip text-start"
                location="top"
                :open-on-focus="true"
              />
            </button>
            <input
              :aria-label="
                $t('global.commons.count') + ': ' + item.product.title
              "
              :disabled="isItemBusy(item)"
              :max="availableQuantity(item)"
              :value="item.count"
              inputmode="numeric"
              min="0"
              step="1"
              type="number"
              @change="changeCount(item, $event)"
              @keydown.enter="$event.target.blur()"
            />
            <button
              :aria-label="
                $t('cash_register.modern.increase_quantity') +
                ': ' +
                item.product.title
              "
              :disabled="
                isItemBusy(item) || item.count >= availableQuantity(item)
              "
              type="button"
              @click="stepCount(item, 1)"
            >
              <v-progress-circular
                v-if="busyAdd === item.product_id + '-' + item.variant_id"
                :size="14"
                :width="2"
                aria-hidden="true"
                indeterminate
              />
              <slot v-else name="increase-icon"
                ><v-icon size="16">add</v-icon></slot
              >
              <v-tooltip
                :text="$t('cash_register.modern.increase_quantity')"
                activator="parent"
                content-class="sd-modern-tooltip text-start"
                location="top"
                :open-on-focus="true"
              />
            </button>
          </div>

          <div class="b-pos-cart-items__amount">
            <u-price
              v-if="item.dis"
              :amount="item.dis * item.count"
              :currency="basket.currency"
              class="b-pos-cart-items__old-amount"
              line-through
            />
            <u-price
              :amount="item.price * item.count"
              :currency="basket.currency"
            />
          </div>
        </div>
        <p
          v-if="item.count > availableQuantity(item)"
          class="b-pos-cart-items__stock"
          role="status"
        >
          <v-icon size="14">warning_amber</v-icon>
          {{ $t("global.commons.not_in_stock") }}
        </p>
      </div>
    </v-fade-transition>
  </div>
  <v-fade-transition v-else group>
    <v-list-item
      v-for="(item, index) in items"
      :key="index"
      class="text-start row-hover border-bottom flex-wrap"
      density="compact"
      lines="two"
      style="cursor: default"
    >
      <template v-slot:prepend>
        <v-avatar color="#eee" rounded="lg" variant="outlined">
          <v-img
            :src="
              item.product.icon
                ? getShopImagePath(
                    item.variant?.image
                      ? item.variant?.image
                      : item.product.icon,
                    64,
                  )
                : getProductImage(item.product_id)
            "
            @click="goToProduct(item.product_id)"
          />
        </v-avatar>
      </template>

      <v-row align="center" no-gutters>
        <v-col :class="{ constrained: !viewOnly }" cols="12" md="6" sm="6">
          <v-list-item-title class="ptitle">
            <component
              :is="!viewOnly ? 'router-link' : 'div'"
              :to="
                isAffiliatePos
                  ? {}
                  : {
                      name: 'BPageProductDashboard',
                      params: { product_id: item.product.id },
                    }
              "
              class="text-dark"
            >
              <b>{{ item.product.title?.limitWords(7) }}</b>

              <v-chip
                v-if="!item.product.original"
                class="m-1 text-uppercase px-2"
                color="red"
                density="comfortable"
                label
                size="x-small"
                variant="tonal"
                >{{ $t("global.commons.fake") }}
              </v-chip>
              <v-chip
                v-if="
                  conditionObject(item.product.condition) &&
                  item.product.condition !== ProductCondition.NEW.code
                "
                class="m-1 text-uppercase px-2"
                pill
                size="x-small"
                variant="outlined"
                >{{ $t(conditionObject.title) }}
              </v-chip>
            </component>
          </v-list-item-title>

          <v-list-item-subtitle class="small">
            {{ item.product.title_en }}
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            <variant-item-view-micro
              v-if="item.variant"
              :product-variant="item.variant"
            />
          </v-list-item-subtitle>
        </v-col>

        <v-col
          class="text-center px-2 v-col-2 v-col-sm-4"
          cols="6"
          md="3"
          sm="4"
        >
          <b v-if="viewOnly">{{ item.count }}</b>

          <s-shop-basket-item-count-select
            v-else
            v-model="item.count"
            :loading="busyAdd === item.product_id + '-' + item.variant_id"
            :max="availableQuantity(item)"
            :min="0"
            background-color="#111"
            dark
            filled
            no-unit
            rounded="lg"
            @change="(count) => spinnerSelectAction(item, count)"
          ></s-shop-basket-item-count-select>
        </v-col>

        <v-col class="text-left px-3" cols="6" md="3" sm="2">
          <div v-if="item.dis" class="text-muted">
            <u-price :amount="item.dis * item.count" line-through></u-price>
          </div>
          <div class="price">
            <u-price :amount="item.price * item.count"></u-price>
          </div>
        </v-col>
      </v-row>

      <template v-slot:append>
        <v-list-item-action v-if="!viewOnly" class="text-center m-0">
          <v-btn
            :loading="busyDelete === item.id"
            :title="$t('global.actions.delete')"
            icon
            variant="text"
            @click.stop="$emit('delete', item.id)"
          >
            <v-icon> close</v-icon>
          </v-btn>
        </v-list-item-action>
      </template>
    </v-list-item>
  </v-fade-transition>
</template>

<script lang="ts">
import VariantItemViewMicro from "../../../storefront/product/variant/VariantItemViewMicro.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { ProductCondition } from "@selldone/core-js/enums/product/ProductCondition";
import SShopBasketItemCountSelect from "../../order/basket/SShopBasketItemCountSelect.vue";

export default {
  name: "BPosCartItems",
  components: { SShopBasketItemCountSelect, VariantItemViewMicro },
  props: {
    basket: {
      required: true,
      type: Object,
    },
    busyDelete: {},
    busyAdd: {},
    viewOnly: {
      type: Boolean,
      default: false,
    },
    isAffiliatePos: Boolean,
    modern: {
      type: Boolean,
      default: false,
    },
  },

  data: function () {
    return {
      ProductCondition: ProductCondition,
    };
  },
  computed: {
    items() {
      return this.basket.items;
    },
  },
  methods: {
    conditionObject(condition) {
      return Object.values(ProductCondition).find(
        (item) => item.code === condition,
      );
    },

    availableQuantity(basket_item) {
      // File:
      if (basket_item.product.type === ProductType.FILE.code) return 1;

      let N = basket_item.product.quantity;

      let found_variant_original = basket_item.variant;
      if (found_variant_original) {
        N = found_variant_original.quantity;
      }

      return N;
    },

    isItemBusy(item) {
      return (
        this.busyAdd === item.product_id + "-" + item.variant_id ||
        this.busyDelete === item.id
      );
    },

    requestCount(item, count) {
      if (
        this.isItemBusy(item) ||
        !Number.isInteger(count) ||
        count < 0 ||
        count > this.availableQuantity(item) ||
        count === item.count
      )
        return;

      this.spinnerSelectAction(item, count);
    },

    stepCount(item, step) {
      this.requestCount(
        item,
        Math.min(this.availableQuantity(item), Math.max(0, item.count + step)),
      );
    },

    changeCount(item, event) {
      this.requestCount(item, event.target.valueAsNumber);
      // Keep the server's quantity until its existing add/delete response arrives.
      event.target.value = String(item.count);
    },

    // ========== Actions ===========

    spinnerSelectAction(item, count) {
      //console.log("count : " + count);

      if (count) {
        this.$emit("add", {
          product_id: item.product_id,
          variant_id: item.variant_id,
          count,
        });
      } else {
        this.$emit("delete", item.id);
      }
    },
    orderCounts(product_item) {
      let N = Math.min(this.availableQuantity(product_item), 20);

      let foo = [];
      for (let i = 0; i <= N; i++) {
        foo.push(i);
      }
      return foo;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-pos-cart-items {
  min-width: 0;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;

  &__row {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) 32px;
    column-gap: 9px;
    row-gap: 5px;
    padding-block: 8px;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.09);

    &--readonly {
      grid-template-columns: 42px minmax(0, 1fr);
    }
  }

  &__image {
    grid-column: 1;
    grid-row: 1 / span 2;
    align-self: start;
    display: block;
    overflow: hidden;
    border-radius: 7px;
    background: rgba(var(--v-theme-on-surface), 0.025);

    img {
      display: block;
      width: 42px;
      height: 42px;
      object-fit: contain;
    }
  }

  &__identity {
    grid-column: 2;
    min-width: 0;
  }

  &__title {
    display: block;
    color: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-decoration: none;
  }

  &__conditions {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
    margin-top: 4px;
    font-size: 11px;
    line-height: 16px;

    span {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    .v-icon {
      color: rgb(var(--v-theme-warning));
    }
  }

  &__variant {
    flex-wrap: wrap;
    gap: 3px;
    padding: 1px 0 0;
    color: rgba(var(--v-theme-on-surface), 0.66);
    font-size: 11px;
    font-weight: 400;
    line-height: 16px;
  }

  &__remove {
    grid-column: 3;
    align-self: start;
    --sd-modern-icon-button-size: 32px;
  }

  &__amount-row {
    grid-column: 2 / -1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
  }

  &__quantity {
    display: flex;
    align-items: stretch;
    max-width: 100%;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 7px;
    overflow: hidden;

    button {
      display: grid;
      place-items: center;
      width: 31px;
      min-width: 31px;
      height: 30px;
      padding: 0;
      color: inherit;
      background: transparent;
      border: 0;
      cursor: pointer;

      &:hover:not(:disabled) {
        background: rgba(var(--v-theme-on-surface), 0.04);
      }
    }

    input {
      width: 48px;
      min-width: 0;
      height: 30px;
      padding: 0 3px;
      border: 0;
      border-inline: 1px solid rgba(var(--v-theme-on-surface), 0.09);
      border-radius: 0;
      background: transparent;
      color: inherit;
      font-family: inherit;
      font-size: 12px;
      font-weight: 400;
      font-variant-numeric: tabular-nums;
      text-align: center;
    }

    button:focus-visible,
    input:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: -2px;
    }

    button:disabled,
    input:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }

  &__readonly-count,
  &__amount {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    font-variant-numeric: tabular-nums;
  }

  &__amount {
    margin-inline-start: auto;
    text-align: end;

    > :deep(.u--price) {
      font-size: 13px;
      font-weight: 500;
    }

    > :deep(.u--price.b-pos-cart-items__old-amount) {
      font-size: 11px;
      font-weight: 400;
    }
  }

  &__old-amount {
    display: block;
    color: rgba(var(--v-theme-on-surface), 0.66);
    font-size: 11px;
    font-weight: 400;
  }

  &__stock {
    grid-column: 2 / -1;
    display: flex;
    align-items: flex-start;
    gap: 5px;
    margin: 0;
    font-size: 12px;
    line-height: 18px;

    .v-icon {
      color: rgb(var(--v-theme-warning));
      margin-top: 2px;
    }
  }

  @media (max-width: 600px), (pointer: coarse) {
    &__row {
      grid-template-columns: 36px minmax(0, 1fr) 44px;
      column-gap: 8px;

      &--readonly {
        grid-template-columns: 36px minmax(0, 1fr);
      }
    }

    &__image img {
      width: 36px;
      height: 36px;
    }

    &__remove {
      --sd-modern-icon-button-size: 44px;
    }

    &__quantity {
      button {
        width: 44px;
        min-width: 44px;
        height: 44px;
      }

      input {
        height: 44px;
        font-size: 16px;
      }
    }
  }
}

.price {
  font-weight: 600;
  font-size: 1.1rem;
}

.ptitle {
  font-size: 0.8rem;
  font-weight: 500;
  text-overflow: ellipsis;
  line-height: normal;
  white-space: normal;

  @media only screen and (max-width: 1280px) {
    font-size: 0.76rem;
  }

  @media only screen and (max-width: 960px) {
    font-size: 0.86rem;
  }
}

@media only screen and (max-width: 1530px) and (min-width: 1263px) {
  .constrained {
    max-width: 130px;
  }
}
</style>
