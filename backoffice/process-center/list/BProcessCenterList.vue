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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="widget-box -x-large mb-5 min-height-50vh">
    <v-row align="center" class="px-2 py-2" justify="start" no-gutters>
      <div class="flex-grow-1">
        <s-order-statuses-select
          v-model="status"
          :has-cod="has_cod"
          :has-open="!isDropShipping"
          class=""
          has-reserved
          @change="
            fetchOrders(1, sortBy?.[0]?.key, sortBy?.[0]?.order === 'desc')
          "
        ></s-order-statuses-select>
      </div>

      <!-- 🎗️ Subscription plan filter -->
      <div
        v-if="
          isSubscription &&
          !filterSubscriptionPriceId /*Not be just for a specific price*/
        "
        class="flex-grow-1"
      >
        <b-product-subscription-pricing-input
          v-if="
            !isVendorPanel /*TODO: Add support this for vendors in the future!*/
          "
          v-model="selected_subscription_price"
          :product="filterProductId ? { id: filterProductId } : null"
          :shop="shop"
          bg-color="transparent"
          class="min-width-200 max-width-field"
          clearable
          flat
          hide-details
          single-line
          variant="solo"
          @change="refreshOrders"
        >
        </b-product-subscription-pricing-input>
      </div>

      <v-text-field
        v-model="search"
        :placeholder="$t('global.commons.search')"
        bg-color="transparent"
        class="min-width-200 max-width-field"
        clearable
        flat
        hide-details
        prepend-inner-icon="search"
        single-line
        variant="solo"
      ></v-text-field>

      <slot name="top-menu"></slot>
    </v-row>

    <u-loading-progress v-if="busy_fetch"></u-loading-progress>
    <v-data-table-server
      v-model:page="page"
      v-model:sort-by="sortBy"
      :class="{ 'blurred disabled': busy_fetch && !HIGHLIGHT_ID }"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="orders"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :mobile="$vuetify.display.xs"
      :row-props="
        (_data) => {
          return {
            class:
              'row-hover anim-hover-targets ' +
              (HIGHLIGHT_ID === _data.item.id ? 'drop-down-delayed' : ''),
          };
        }
      "
      class="bg-transparent min-height-60vh blur-animate"
      density="compact"
      hide-default-footer
      item-key="id"
      @click:row="(_, r) => handleSelected(r.item)"
    >
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
      <template v-slot:no-data>
        <div v-if="!busy_fetch && !search" class="py-5 usn text-center fadeIn">
          <img
            :src="require('../../../assets/guides/orders-empty.png')"
            class="m-3 op-0-3"
            style="max-height: 400px; object-fit: contain"
            width="85%"
          />
          <h2 class="text-h4 font-weight-thin">
            Your orders will appear here...
          </h2>
        </div>
        <div v-else class="text-center px-3 py-5 text-muted">
          <v-icon class="me-1">sentiment_dissatisfied</v-icon>
          {{ $t("global.commons.no_data") }}
        </div>
      </template>
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <template v-slot:item.type="{ item }">
        <v-img
          v-if="isAffiliatePos"
          :aspect-ratio="1"
          :height="42"
          :src="basket_image"
          :width="42"
          class="my-2"
        />
        <router-link
          v-else
          :to="createRouteTo(item)"
          target="_blank"
          title="🧅 Open order in a new page."
        >
          <v-img
            :aspect-ratio="1"
            :height="42"
            :src="basket_image"
            :width="42"
            class="my-1"
            @click.stop
          />
        </router-link>

        <div
          v-if="item.channel"
          style="font-size: 8px; font-weight: 500; margin-bottom: 2px"
          class="d-flex align-center mx-n1"
        >
          <b-campaign-source-icon
            :value="item.channel"
            height="13"
            width="13"
            class="me-1"
          />
          <div class="single-line d-inline-block" style="max-width: 36px">
            {{ item.channel }}
          </div>
        </div>
      </template>

      <template v-slot:item.id="{ item }">
        <div class="py-1 py-sm-0">
          <div class="min-width-250 d-flex align-center">
            <!-- Avocado -->
            <div v-if="isAvocado" class="flex-grow-1">
              <div class="mt-1 d-flex align-center">
                <b class="flex-grow-1 flex-md-grow-0 text-start"
                  >AVO-{{ item.id }} <small>|</small> {{ item.title }}
                  <i
                    v-if="inQueProcess(item) && !item.reject"
                    class="fas fa-circle-notch fa-spin text-info mx-2"
                  ></i>
                </b>

                <products-dense-images-circles
                  :ids="getItemsImages(item)"
                  big-scale
                  border
                  class="py-1"
                  raw-images-path
                  style="vertical-align: super; display: inline"
                ></products-dense-images-circles>
              </div>
              <span
                class="text-subtitle-2 single-line max-w-200 overflow-hidden"
                >{{ item.message }}</span
              >
              <div
                class="d-flex justify-end position-relative max-w-100 py-1 hover-scale-y-3x"
              >
                <v-progress-linear
                  :color="
                    item.progress === 0
                      ? '#ddd'
                      : item.progress >= 100
                        ? 'green'
                        : 'blue'
                  "
                  :model-value="item.progress"
                  height="3"
                  rounded
                >
                </v-progress-linear>
                <v-tooltip activator="parent" location="top">
                  Fulfillment progress: {{ item.progress }}%
                </v-tooltip>
              </div>
            </div>
            <!-- Others (has items) -->
            <template v-else>
              <!-- Vendor order mode -->
              <b v-if="isVendorOrders">
                {{
                  `${getBasketOrderCode(item)} ❯ ${getVendorOrderCode(item)}`
                }}
              </b>
              <!-- Normal mode -->
              <b v-else class="flex-grow-1 flex-md-grow-0 text-start">
                {{ getBasketOrderCode(item) }}
              </b>
              <products-dense-images-circles
                :ids="getProductsIDs(item)"
                big-scale
                border
                class="py-1"
                style="vertical-align: super; display: inline"
              ></products-dense-images-circles>

              <v-chip
                v-if="
                  item.gateway_processing &&
                  item.gateway_processing.transaction_type === 'dir'
                "
                color="blue"
                size="small"
                variant="flat"
              >
                <v-icon class="blink-me" start>lens</v-icon>
                {{ $t("global.actions.check_now") }}
                <v-tooltip activator="parent"
                  >It's a direct money transfer and needs your attention.
                </v-tooltip>
              </v-chip>

              <i
                v-if="inQueProcess(item) && !item.reject"
                class="fas fa-circle-notch fa-spin text-info mx-2"
              >
                <v-tooltip activator="parent">
                  <div class="d-flex align-center">
                    <v-icon class="fa-spin text-info"
                      >fa:fas fa-circle-notch
                    </v-icon>
                    <div class="ms-3">
                      In processing que...
                      <small class="d-block">Need your action!</small>
                    </div>
                  </div>
                </v-tooltip>
              </i>
            </template>

            <v-spacer class="flex-grow-0 flex-md-grow-1"></v-spacer>

            <v-chip
              v-if="item.reject"
              class="font-weight-bold mx-1"
              color="red"
              size="x-small"
            >
              {{ $t("admin_shop.orders.physical.rejected") }}

              <v-icon end>fa:fas fa-exclamation</v-icon>
            </v-chip>

            <img
              v-if="item.link_id"
              :title="$t('global.commons.campaign')"
              class="mx-1"
              height="20"
              src="../../../assets/icons/campaign.svg"
              width="20"
            />
            <img
              v-if="item.affiliate_id"
              :title="$t('global.commons.affiliate')"
              class="mx-1"
              height="20"
              src="../../../assets/icons/affiliate.svg"
              width="20"
            />

            <img
              v-if="hasDropShipping(item)"
              :title="$t('global.commons.drop_shipping')"
              class="mx-1"
              height="20"
              src="../../../assets/icons/dropshipping.svg"
              width="20"
            />
          </div>

          <!-- ▀▀▀▀▀▀▀▀▀ 🥵 User / 🧜 Customer ▀▀▀▀▀▀▀▀▀ -->
          <div
            v-if="item.customer || item.buyer"
            class="d-flex align-center small mt-n1"
          >
            <component
              :is="item.customer_id && !isAffiliatePos ? 'router-link' : 'span'"
              :to="{
                name: 'BPageCustomerDashboard',
                params: { customer_id: item.customer_id },
              }"
              title="Go to customer page"
              @click.stop
            >
              <v-avatar
                v-if="item.buyer"
                :size="24"
                class="avatar-gradient -thin -no-gap -customer me-1 hover-scale"
                color="#fafafa"
              >
                <v-img :src="getUserAvatar(item.buyer.id)"></v-img>
              </v-avatar>
              <u-avatar-text
                v-else
                :name="item.customer.name"
                :size="24"
                class="avatar-gradient -thin -customer me-1 hover-scale"
                color="#fafafa"
              >
              </u-avatar-text>
            </component>
            <b>
              {{ item.customer ? item.customer.name : item.buyer.name }}
            </b>
            <span class="dashed-flex-space"></span>

            <template
              v-if="item.customer ? item.customer.phone : item.buyer.phone"
            >
              {{ item.customer ? item.customer.phone : item.buyer.phone }}
              <u-button-whatsapp
                :shop="shop"
                :user="item.customer ? item.customer : item.buyer"
                class="mx-1"
                small
              ></u-button-whatsapp>
            </template>

            <template
              v-if="item.customer ? item.customer.email : item.buyer.email"
            >
              <v-btn
                :title="
                  $t('global.commons.email') +
                  ' : ' +
                  (item.customer ? item.customer.email : item.buyer.email)
                "
                class="ms-1"
                color="#333"
                icon
                size="28"
                variant="text"
                @click.stop="
                  copyToClipboard(
                    item.customer ? item.customer.email : item.buyer.email,
                  )
                "
              >
                <v-icon size="18">email</v-icon>
              </v-btn>
            </template>
          </div>
          <!-- ▀▀▀▀▀▀▀▀▀ 🥶 Guest ▀▀▀▀▀▀▀▀▀ -->
          <div v-else class="d-flex align-center small mt-n1">
            <v-icon class="me-1" size="small">account_circle</v-icon>
            <b>{{ $t("global.commons.guest") }} </b>
          </div>
        </div>
      </template>

      <template v-slot:item.price="{ item }">
        <div class="py-1">
          <!-- Need pricing -->
          <span
            v-if="isService && item.status === 'Reserved'"
            class="text-muted"
            ><v-icon class="me-1 blink-me" color="blue" size="x-small"
              >lens</v-icon
            >
            {{ $t("global.commons.waiting_review") }}</span
          >

          <!-- Show normal pricing -->

          <p
            v-else
            class="m-0 font-weight-bold d-flex align-center min-width-250"
            title="Payment"
          >
            <return-request-button-badge
              v-if="item.basket_item_returns?.length"
              :basket-item-returns="item.basket_item_returns"
              @click:return="
                cacheRouteState(item.id);
                $router.push({
                  name: return_request_page_name,
                  params: {
                    basket_id: item.id,
                  },
                });
              "
            ></return-request-button-badge>

            <connect-order-chip
              v-for="connect_order in item.connect_orders"
              :key="connect_order.id"
              :connect-orders="connect_order"
              :small="$vuetify.display.xs"
              class="ma-1"
            ></connect-order-chip>

            <!-- 🎗️ Subscription payment active -->
            <v-chip
              v-if="item.meta?.subscription_period && item.status === 'Payed'"
              class="mx-1"
              label
              size="small"
              variant="text"
            >
              <v-icon start>credit_score</v-icon>

              <v-icon
                :color="getPeriodColor(item.meta.subscription_period)"
                class="me-1"
                size="12"
                >circle
              </v-icon>
              {{ getPeriodTitle(item.meta.subscription_period) }}

              <v-tooltip activator="parent">
                It's an active subscription.
              </v-tooltip>
            </v-chip>

            <!-- 🎗️ Created by a subscription basket -->
            <v-chip
              v-if="item.subscription_id"
              class="m-1"
              label
              title=""
              variant="text"
            >
              <v-avatar rounded start>
                <img :src="ProductType.SUBSCRIPTION.image" />
              </v-avatar>
              SN-{{ item.subscription_id }}

              <v-tooltip activator="parent" content-class="bg-black">
                <div>Auto created by subscription.</div>
                <div class="small">Physical products are in subscription.</div>
              </v-tooltip>
            </v-chip>

            <v-spacer></v-spacer>
            <!-- Show currency flag if two currency has same unicode -->
            <u-currency-icon
              v-if="CurrencyHelper.NeedToSHowCurrencyFlag(shop.currencies)"
              :currency="item.currency"
              flag-only
              small
            ></u-currency-icon>
            <u-price :amount="item.price" :currency="item.currency"></u-price>
          </p>

          <!-- User select an specific date to deliver -->
          <div
            v-if="waitingToDeliver(item)"
            :title="`Time remaining until the delivery due date. ● ${getLocalTimeString(
              item.delivery_info.date,
            )}`"
            class="text-start"
          >
            <template
              v-if="
                item.delivery_info.date.convertToLocalDate()?.isAfterToday()
              "
            >
              <div class="mt-1 me-auto max-w-120">
                <v-progress-linear
                  :model-value="remainsTimePercent(item)"
                  color="primary"
                  height="4"
                  rounded
                  striped
                ></v-progress-linear>
              </div>

              <small class="my-1"
                >● {{ getFromNowString(item.delivery_info.date) }}</small
              >
            </template>
            <template v-else>
              <div class="max-w-120 mt-1 me-auto">
                <v-progress-linear
                  :model-value="0"
                  color="red"
                  height="4"
                  rounded
                  striped
                ></v-progress-linear>
              </div>

              <small class="my-1 text-red"
                >● {{ getLocalDateString(item.delivery_info.date) }} (late
                😟)</small
              >
            </template>
          </div>

          <!-- 🎗️ Progress to the next auto payment in subscription -->
          <div
            v-if="isSubscribed(item) && nextPaymentDate(item)"
            class="text-center"
            title="The next payment"
          >
            <div class="max-w-120 mx-auto mt-1">
              <v-progress-linear
                :model-value="nextPaymentRemainPercent(item)"
                color="primary"
                height="4"
                rounded
                striped
              ></v-progress-linear>
            </div>
            <small class="my-1">{{
              nextPaymentDate(item)
                ? `~ ${getLocalDateString(
                    nextPaymentDate(item),
                  )} ● ${getFromNowString(nextPaymentDate(item))}.`
                : ""
            }}</small>
          </div>

          <v-row class="text-muted small mt-1" no-gutters>
            <div v-if="has_delivery">
              <v-icon size="x-small">local_shipping</v-icon>
              <span class="mx-1"
                >{{ $t("admin_shop.orders.physical.delivery") }}:</span
              >

              <span v-if="item.delivery_price < 0">{{
                $t("admin_shop.orders.physical.not_paid")
              }}</span>
              <span v-else-if="item.delivery_price === 0">{{
                $t("global.commons.free")
              }}</span>
              <u-price
                v-else
                :amount="item.delivery_price"
                :currency="item.currency"
              ></u-price>
            </div>
            <div v-else></div>

            <v-spacer></v-spacer>

            <div v-if="item.discount">
              <span class="me-1"
                >{{ $t("admin_shop.orders.physical.discount") }}:</span
              >

              <u-price
                :amount="item.discount"
                :currency="item.currency"
              ></u-price>
            </div>
            <div v-else></div>
          </v-row>
        </div>
      </template>

      <!-- Country -->
      <template v-slot:item.country="{ item }">
        <flag
          :iso="item.country"
          :squared="false"
          :title="getCountryName(item.country)"
        />
      </template>

      <!-- Status > Payment -->
      <template v-slot:item.status="{ item }">
        <s-order-status-view
          :gateway-processing="item.gateway_processing"
          :payment-require-capture="
            item.payment_id /*Has attached success payment*/ &&
            item.status ===
              BasketStatus.Reserved
                .code /*But basket not changed to paid status.*/
          "
          :status="item.status"
          class="mt-3 inline-block"
        ></s-order-status-view>
      </template>

      <!-- Status > Delivery -->
      <template v-if="has_delivery_col" v-slot:item.delivery_state="{ item }">
        <div
          v-if="$vuetify.display.xs && item.channel"
          style="font-size: 12px; font-weight: 500"
          class="d-flex align-center"
        >
          <v-icon class="me-1 rotate-90-e ms-3">alt_route</v-icon>
          <b-campaign-source-icon
            :value="item.channel"
            height="16"
            width="16"
            class="me-1"
          />
          <div>
            {{ item.channel }}
          </div>
        </div>
        <s-order-delivery-status-stepper
          :has-subscription="isSubscription"
          :isSubscribed="item.status === 'Payed'"
          :state="item.delivery_state"
          :states="deliveryStates"
          class="my-1"
          @mouseEnterToCustomer="(n) => setActivator(n, item)"
        />

        <div
          class="py-1 small min-width-200 d-flex align-center justify-center"
        >
          <span class="text-muted">
            {{ getDeliveryStateString(item.delivery_state) }}
          </span>
          <template v-if="item.receiver_info">
            <span class="dashed-flex-space"></span>
            <div class="ps-1">
              <flag
                :iso="item.receiver_info.country"
                :squared="false"
                class="me-1"
              ></flag>
              <span>{{ getShortAddress(item.receiver_info) }}</span>
            </div>
          </template>
        </div>
      </template>

      <template v-slot:item.reserved_at="{ item }">
        <div class="min-width-200 py-1">
          {{
            getFromNowString(
              item.reserved_at ? item.reserved_at : item.created_at,
            )
          }}

          <span class="float-end">
            <!-- ▂▂▂▂▂▂▂▂ Chat ▂▂▂▂▂▂▂ -->

            <v-btn
              v-if="item.chat && item.chat.length"
              class="mx-1"
              color="#111"
              icon
              variant="text"
              @click.stop="showChat(item)"
            >
              <v-badge
                :model-value="
                  !item.chat[item.chat.length - 1]
                    .officer /*Show dot if customer send last message!*/
                "
                color="red"
                dot
              >
                <v-icon>chat</v-icon>
              </v-badge>

              <v-tooltip
                activator="parent"
                content-class="bg-black"
                location="bottom"
                max-width="460"
              >
                <s-order-chat-message
                  :basket="item"
                  :message="item.chat[item.chat.length - 1]"
                  is-admin
                >
                </s-order-chat-message>
              </v-tooltip>
            </v-btn>

            <!-- ▂▂▂▂▂▂▂▂ Emoji ▂▂▂▂▂▂▂ -->

            <img
              v-if="getDiffLastUpdateEmoji(item)"
              :class="getDiffLastUpdateOver3Days(item) ? 'jump-target' : ''"
              :src="getDiffLastUpdateEmoji(item)"
              class="ms-1"
              height="20"
              width="20"
            />
            <span
              v-else
              class="d-inline-block"
              style="min-width: 24px; height: 1px"
            ></span>
          </span>

          <br />
          <small>
            {{
              getLocalTimeString(
                item.reserved_at ? item.reserved_at : item.created_at,
              )
            }}
          </small>
        </div>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>

    <slot></slot>

    <!-- ----------------------------------- Receiver Info Details Menu ----------------------------------- -->
    <v-menu
      v-if="hasReceiverInfo"
      :activator="activator"
      :open-delay="200"
      location="top"
      max-width="360"
      open-on-hover
    >
      <v-sheet class="p-3" color="#fefefe" rounded="xl">
        <s-order-receiver-info-card
          v-if="activator_item && activator_item.receiver_info"
          :receiver-info="activator_item.receiver_info"
          :userId="activator_item.user_id"
          class="text-start"
        >
        </s-order-receiver-info-card>
        <small v-else
          ><i class="fa:fas fa-map-location me-1"></i> Not set yet!</small
        >
      </v-sheet>
    </v-menu>

    <!-- ██████████████████████ Dialog > Chat ██████████████████████ -->
    <v-dialog
      v-model="dialog_chat"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card v-if="selected_basket" class="text-start">
        <v-card-title>
          <v-avatar class="m-2" size="24">
            <v-img :src="getShopImagePath(shop.icon, IMAGE_SIZE_SMALL)" />
          </v-avatar>

          {{ $t("global.commons.chat") }} >
          {{ getBasketOrderCode(selected_basket) }}
        </v-card-title>
        <v-card-text v-if="selected_basket">
          <b-order-chat-box
            :basket="selected_basket"
            :shop="shop"
          ></b-order-chat-box>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog_chat = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import SOrderDeliveryStatusStepper from "../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import SOrderStatusesSelect from "../../../storefront/order/status-select/SOrderStatusesSelect.vue";
import ReturnRequestButtonBadge from "../../../storefront/order/order-return/ReturnRequestButtonBadge.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import ProductsDenseImagesCircles from "../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import SOrderStatusView from "../../../storefront/order/order-status/SOrderStatusView.vue";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import UButtonWhatsapp from "../../../ui/button/whatsapp/UButtonWhatsapp.vue";
import SOrderReceiverInfoCard from "../../../storefront/order/receiver-info/card/SOrderReceiverInfoCard.vue";
import ConnectOrderChip from "../../connect/order/chip/ConnectOrderChip.vue";
import UAvatarText from "../../../ui/avatar/text/UAvatarText.vue";
import SOrderChatMessage from "../../../storefront/order/chat/message/SOrderChatMessage.vue";
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import BProductSubscriptionPricingInput from "../../product/subscription/pricing/input/BProductSubscriptionPricingInput.vue";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import { CurrencyHelper } from "@selldone/core-js/helper/currency/CurrencyHelper";
import { debounce, throttle } from "lodash-es";
import { OrderType } from "@selldone/core-js/enums/order/OrderType";
import { RouteMixin } from "../../../mixin/route/RouteMixin.ts";
import {Avocado, Basket, ShopURLs} from "@selldone/core-js";
import BCampaignSourceIcon from "@selldone/components-vue/backoffice/campaign/source/icon/BCampaignSourceIcon.vue";
import BOrderChatBox from "@selldone/components-vue/backoffice/order/chat/box/BOrderChatBox.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import OrderMixin from "@selldone/components-vue/mixin/order/OrderMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProcessCenterList",
  mixins: [RouteMixin, DateMixin, OrderMixin ],

  components: {
    BCampaignSourceIcon,
    UCurrencyIcon,
    BProductSubscriptionPricingInput,
    SOrderChatMessage,
    BOrderChatBox,
    UAvatarText,
    ConnectOrderChip,
    SOrderReceiverInfoCard,
    UButtonWhatsapp,
    SOrderStatusView,
    ProductsDenseImagesCircles,
    ReturnRequestButtonBadge,
    SOrderStatusesSelect,
    SOrderDeliveryStatusStepper,
  },
  props: {
    shop: {
      required: true,
    },
    filterProductId: {
      // 🦋 Only for a specific product:
      required: false,
    },

    filterCustomerId: {
      // Show just for this customer
      required: false,
    },
    filterSubscriptionPriceId: {
      // 🎗️ Only baskets contain this subscription price:
      required: false,
    },
    type: {
      required: false,
    },
    isPos: {
      default: false,
      type: Boolean,
    },

    isDropShipping: {
      default: false,
      type: Boolean,
    },
    resellerShopId: {
      // Only for this reseller shop ID.
    },

    isAvocado: {
      default: false,
      type: Boolean,
    },
    isHyper: {
      default: false,
      type: Boolean,
    },

    isAffiliatePos: {
      default: false,
      type: Boolean,
    },

    filterAffiliateId: {
      // Only for this affiliate! (Affiliate POS orders list)
    },

    // 🟣 Marketplace 🟣 Show fulfillment of marketplace: (Need type : physical, virtual, ...)
    isVendorOrders: {
      default: false,
      type: Boolean,
    },

    // Vendor order
    isVendorPanel: {
      /*🟢 Vendor Panel 🟢*/ default: false,
      type: Boolean,
    },
    /*   vendor: {
      required: false,
      type: Object,
    },*/
  },

  data: function () {
    return {
      ProductType: ProductType,

      BasketStatus: Basket.Status,

      activator: null,
      activator_item: null,

      status: [Basket.Status.Payed.code, Basket.Status.COD.code],

      busy_fetch: false,

      orders: [],

      // Pagination:
      page: 1,
      sortBy: [{ key: null, order: "desc" }],
      itemsPerPage: 10,
      totalItems: 0,

      search: null,
      selected_subscription_price: null,

      dialog_chat: false,
      selected_basket: null,
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    CurrencyHelper() {
      return CurrencyHelper;
    },
    IS_CONNECT_PANEL() {
      /*🦠 Connect Panel 🦠*/
      return (
        this.$route.params.shop_connect_id &&
        this.$route.matched.some((record) => record.meta.connect)
      );
    },

    hasReceiverInfo() {
      return (
        (this.type?.code &&
          [
            ProductType.PHYSICAL.code,
            ProductType.SERVICE.code,
            ProductType.SUBSCRIPTION.code,
          ].includes(this.type.code)) ||
        this.isAvocado
      );
    },

    isService() {
      return this.type?.code === ProductType.SERVICE.code;
    },
    isSubscription() {
      return this.type?.code === ProductType.SUBSCRIPTION.code;
    },

    headers() {
      if (this.isDropShipping) {
        return [
          ...(this.$vuetify.display.mdAndUp
            ? [
                {
                  align: "center",
                  sortable: false,
                  value: "type",
                  width: 50,
                },
              ]
            : []),
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
            title: this.$t("global.commons.country"),
            align: "center",
            value: "country",
            sortable: true,
          },

          {
            title: this.$t("admin_shop.orders.physical.table.order_date"),
            align: "start",
            sortable: true,
            value: "reserved_at",
          },
        ];
      } else if (this.isPos || this.isHyper) {
        return [
          ...(this.$vuetify.display.mdAndUp
            ? [
                {
                  align: "center",
                  sortable: false,
                  value: "type",
                  width: 50,
                },
              ]
            : []),
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
            title: this.$t("admin_shop.orders.physical.table.order_date"),
            align: "start",
            sortable: true,
            value: "reserved_at",
          },
        ];
      } else if (this.isAvocado) {
        return [
          ...(this.$vuetify.display.mdAndUp
            ? [
                {
                  align: "center",
                  sortable: false,
                  value: "type",
                  width: 50,
                },
              ]
            : []),
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
            title: this.$t("admin_shop.orders.physical.table.order_date"),
            align: "start",
            sortable: true,
            value: "reserved_at",
          },
        ];
      }

      return [
        ...(this.$vuetify.display.mdAndUp
          ? [
              {
                align: "center",
                sortable: false,
                value: "type",
                width: 50,
              },
            ]
          : []),
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
          title: this.$t("admin_shop.orders.physical.table.order_date"),
          align: "start",
          sortable: true,
          value: "reserved_at",
        },
      ];
    },

    return_request_page_name() {
      if (this.type?.code === ProductType.PHYSICAL.code)
        return "BPageOrderPhysicalReturn";
      else if (this.type?.code === ProductType.VIRTUAL.code)
        return "BPageOrderVirtualReturn";
      else if (this.type?.code === ProductType.FILE.code)
        return "ShopProcessCenterFileOrderPage_ReturnRequest";
      else if (this.type?.code === ProductType.SERVICE.code)
        return "ShopProcessCenterServiceOrderPage_ReturnRequest";
      else if (this.type?.code === ProductType.SUBSCRIPTION.code)
        return "ShopProcessCenterSubscriptionOrderPage_ReturnRequest";

      return null;
    },

    dashboard_page_name_vendor_panel() {
      if (this.type?.code === ProductType.PHYSICAL.code)
        return "VendorProcessCenterPhysicalOrderPage_Dashboard";
      else if (this.type?.code === ProductType.VIRTUAL.code)
        return "VendorProcessCenterVirtualOrderPage_Dashboard";
      else if (this.type?.code === ProductType.FILE.code)
        return "VendorProcessCenterFileOrderPage_Dashboard";
      else if (this.type?.code === ProductType.SERVICE.code)
        return "VendorProcessCenterServiceOrderPage_Dashboard";
      else if (this.type?.code === ProductType.SUBSCRIPTION.code)
        return "VendorProcessCenterSubscriptionOrderPage_Dashboard";
      return null;
    },

    dashboard_page_name() {
      if (this.type?.code === ProductType.PHYSICAL.code)
        return "BPageOrderPhysicalDashboard";
      else if (this.type?.code === ProductType.VIRTUAL.code)
        return "BPageOrderVirtualDashboard";
      else if (this.type?.code === ProductType.FILE.code)
        return "BPageOrderFileDashboard";
      else if (this.type?.code === ProductType.SERVICE.code)
        return "BPageOrderServiceDashboard";
      else if (this.type?.code === ProductType.SUBSCRIPTION.code)
        return "BPageOrderSubscriptionDashboard";
      else if (this.isPos) return "BPageOrderPosDashboard";
      else if (this.isDropShipping) return "BPageOrderFulfillmentDashboard";
      else if (this.isAvocado) return "BPageOrderAvocadoDashboard";
      else if (this.isHyper) return "BPageOrderHyperDashboard";

      return null;
    },

    deliveryStates() {
      if (this.isDropShipping) return Basket.PhysicalOrderStates;
      if (this.isAvocado) return Avocado.DeliveryStates;

      if (this.type?.code === ProductType.PHYSICAL.code)
        return Basket.PhysicalOrderStates;
      else if (this.type?.code === ProductType.VIRTUAL.code)
        return Basket.VirtualOrderStates;
      else if (this.type?.code === ProductType.FILE.code)
        return Basket.FileOrderStates;
      else if (this.type?.code === ProductType.SERVICE.code)
        return Basket.ServiceOrderStates;
      else if (this.type?.code === ProductType.SUBSCRIPTION.code)
        return Basket.SubscriptionOrderStates;

      return null;
    },
    has_cod() {
      return this.type?.code === ProductType.PHYSICAL.code;
    },

    has_delivery() {
      return (
        this.isPos ||
        this.type?.code === ProductType.PHYSICAL.code ||
        this.isDropShipping ||
        this.isAvocado
      );
    },

    has_delivery_col() {
      return !this.isPos && !this.isHyper;
    },
    has_return_col() {
      return !this.isPos && !this.isAvocado && !this.isHyper;
    },

    basket_image() {
      if (this.isPos)
        return require("@selldone/core-js/assets/order-types/basket-pos.svg");
      else if (this.isDropShipping)
        return require("@selldone/core-js/assets/order-types/basket-drop-shipping.svg");
      else if (this.isAvocado)
        return require("@selldone/core-js/assets/order-types/basket-avocado.svg");
      else if (this.isHyper)
        return require("@selldone/core-js/assets/order-types/basket-hyper.svg");

      return this.type.basket;
    },
  },
  watch: {
    sortBy() {
      this.fetchOrders(
        this.page,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    },
    page() {
      this.fetchOrders(
        this.page,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    },

    search: throttle(function (newVal, oldVal) {
      if (!newVal && !oldVal) return;
      this.fetchOrders(
        1,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    }, window.SERACH_THROTTLE),
  },
  created() {
    if (this.isService) {
      this.status = [Basket.Status.Payed.code, Basket.Status.Reserved.code]; // Show reserved basket to review by seller and set price. (Or auto pricing)
    } else if (this.isAvocado) {
      this.status = [Basket.Status.Reserved.code, Basket.Status.Payed.code]; // Show All
    } else if (this.isHyper) {
      this.status = [Basket.Status.Reserved.code, Basket.Status.Payed.code]; // Show All
    }
    this.fetchOrders(
      this.page,
      this.sortBy[0]?.key,
      this.sortBy[0]?.order === "desc",
    );
  },

  methods: {
    setActivator(node, item) {
      if (!this.hasReceiverInfo) return;
      //  console.log('setActivator',node)
      this.activator = node;
      this.activator_item = item;
    },
    getShortAddress(receiver_info) {
      if (receiver_info.state && receiver_info.city)
        return `${receiver_info.state} > ${receiver_info.city}`;
      else if (receiver_info.city) return receiver_info.city;
      else receiver_info.state;
    },
    handleSelected(selected) {
      // For affiliate POS orders redirect user to shop page:
      if (this.isAffiliatePos) {
        const url =
            ShopURLs.MainShopUrl(this.shop) + `/orders/physical/SM-${selected.id}`;
        window.open(url, "_blank").focus();
        return;
      }

      this.cacheRouteState(selected.id);

      this.$router.push(this.createRouteTo(selected));
    },
    createRouteTo(selected) {
      if (this.isAffiliatePos) {
        return null;
      }

      return {
        name: this.isVendorPanel /*🟢 Vendor Panel 🟢*/
          ? this.dashboard_page_name_vendor_panel
          : this.dashboard_page_name,
        params: {
          shop_id: this.shop.id,
          basket_id: !this.isVendorPanel /*🟢 Not Vendor Panel 🟢*/
            ? this.isVendorOrders
              ? selected.basket_id /*🟣 Marketplace -> Go to main basket page🟣*/
              : selected.id
            : undefined,
          vendor_order_id: this.isVendorPanel /*🟢 Vendor Panel 🟢*/
            ? selected.id
            : undefined,
        },
      };
    },

    refreshOrders() {
      this.page = 1;

      this.fetchOrders(
        1,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    },
    fetchOrders: debounce(function () {
      this.fetchOrdersNow(
        this.page,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    }, 50),

    fetchOrdersNow(page, sortBy, sortDesc = true) {
      this.page = page;

      this.busy_fetch = true;

      axios
        .get(
          // Affiliate POS:
          this.isAffiliatePos
            ? window.API.GET_AFFILIATE_POS_ORDERS(this.filterAffiliateId)
            : this.isVendorPanel /*🟢 Vendor Panel 🟢*/
              ? window.VAPI.GET_MY_VENDORS_ORDERS(
                  this.$route.params.vendor_id,
                  this.type.code,
                )
              : // 🟣 Marketplace vendor orders 🟣
                this.isVendorOrders
                ? window.API.GET_VENDORS_ORDERS(
                    this.shop.id,
                    this.type
                      .code /*Only basket orders supported by vendors like physical,virtual,...*/,
                  )
                : // Normal orders:
                  window.API.GET_ORDERS(
                    this.shop.id,
                    this.isDropShipping
                      ? OrderType.DROPSHIPPING
                      : this.isPos
                        ? OrderType.POS
                        : this.isAvocado
                          ? OrderType.AVOCADO
                          : this.isHyper
                            ? OrderType.HYPER
                            : this.type.code, // Physical, virtual, file, service, subscription
                  ),

          {
            params: {
              offset: (page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
              product_id: this.filterProductId,
              customer_id: this.filterCustomerId, // Show just for this customer
              subscription_price_id: this.isSubscription
                ? this.filterSubscriptionPriceId
                  ? this.filterSubscriptionPriceId
                  : this.selected_subscription_price?.id
                : null, // 🎗️ Only baskets contain this subscription price
              sortBy: sortBy,
              sortDesc: sortDesc,
              statuses: this.status,

              search: this.search,

              buyer: true,

              affiliate_id: this.filterAffiliateId,

              shop_connect_id: this.IS_CONNECT_PANEL
                ? this.$route.params.shop_connect_id
                : null, // 🦠 Only for a specific connect service
              connect_orders: true, // 🦠 With all connect orders

              reseller_shop_id: this.isDropShipping
                ? this.resellerShopId
                : null, // Only for this reseller shop ID.
            },
          },
        )
        .then(({ data }) => {
          if (data.error) return NotificationService.showErrorAlert(null, data.error_msg);

          this.totalItems = data.total;
          this.orders = data.orders;
        })
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    inQueProcess(item) {
      return (
        [
          this.isAvocado ? Basket.Status.Reserved.code : null, // Tips: in Avocado orders 'Reserved' are in processing mode (need seller actions...)
          //Basket.Status.Reserved.code,
          Basket.Status.Payed.code,
          Basket.Status.COD.code,
        ].includes(item.status) &&
        [
          Basket.PhysicalOrderStates.CheckQueue.code,
          Basket.PhysicalOrderStates.OrderConfirm.code,
          Basket.PhysicalOrderStates.PreparingOrder.code,
        ].includes(item.delivery_state)
      );
    },

    getProductsIDs(basket) {
      const out = [];

      if (this.isDropShipping) {
        basket.contents.forEach((item) => {
          // In the fulfillment items (product_id & variant_id & count) Save in contents column
          if (!out.includes("" + item.product_id))
            out.push("" + item.product_id);
        });
      } else {
        basket.items.forEach((item) => {
          if (!out.includes("" + item.product_id))
            out.push("" + item.product_id);
        });
      }

      return out;
    },

    getItemsImages(basket) {
      const out = [];
      basket.items.forEach((item) => {
        if (item.image) out.push(item.image);
      });
      return out;
    },

    getDiffLastUpdateEmoji(item) {
      if (item.reject) return require("../../../assets/emotions/010-dead.svg");

      if (
        item.status === Basket.Status.Open ||
        item.status === Basket.Status.Reserved ||
        item.status === Basket.Status.Canceled
      )
        return null;

      if (!this.inQueProcess(item)) return null;

      const diff = DateConverter.getFromNowNumber(item.updated_at, "d");

      if (diff > 10) return require("../../../assets/emotions/Angry.svg");
      else if (diff > 7)
        return require("../../../assets/emotions/002-angry face.svg");
      else if (diff > 5) return require("../../../assets/emotions/030-mad.svg");
      else if (diff > 3)
        return require("../../../assets/emotions/003-annoyed.svg");
      else if (diff > 2) return require("../../../assets/emotions/035-sad.svg");
      else if (diff > 1)
        return require("../../../assets/emotions/011-detective.svg");
      else return require("../../../assets/emotions/019-happy.svg");
    },
    getDiffLastUpdateOver3Days(item) {
      if (item.reject) return false;
      if (
        item.status === Basket.Status.Open ||
        item.status === Basket.Status.Reserved ||
        item.status === Basket.Status.Canceled
      )
        return false;
      if (!this.inQueProcess(item)) return false;

      const diff = DateConverter.getFromNowNumber(item.updated_at, "d");

      if (diff > 3) return true;
    },

    hasDropShipping(basket) {
      if (this.isDropShipping || this.isAvocado || this.isHyper) {
        // Drop shipping list has not reselling items!
        return false;
      } else {
        return basket.items.some((it) => it.fulfillment_id);
      }
    },

    showChat(basket) {
      this.dialog_chat = true;
      this.selected_basket = basket;
    },

    //----------------------------------------
    getPeriodTitle(period) {
      return this.$t(BillingPeriod[period]?.title);
    },
    getPeriodColor(period) {
      return BillingPeriod[period]?.color;
    },

    // ――――――――――― 🎗️ Subscription ―――――――――――
    isSubscribed(order) {
      return this.isSubscription && order.status === Basket.Status.Payed.code;
    },

    subscriptionPeriod(order) {
      return BillingPeriod[
        order.meta?.subscription_period
          ? order.meta.subscription_period
          : order.items[0]?.subscription_price?.period
      ];
    },

    nextPaymentDate(order) {
      const payment_date =
        this.isSubscribed(order) &&
        order.meta?.subscription_payment_at?.convertToLocalDate();
      if (!this.subscriptionPeriod(order) || !payment_date) return null;

      return payment_date.addHours(this.subscriptionPeriod(order).hours);
    },

    nextPaymentRemainPercent(order) {
      if (!this.nextPaymentDate(order)) return 0;
      if (this.nextPaymentDate(order).isBeforeToday()) return 100;
      const diff = this.nextPaymentDate(order).diffHours(new Date());
      const total_hours = this.subscriptionPeriod(order).hours;
      const out = (100 * (total_hours - diff)) / total_hours;
      return out > 100 ? 100 : out;
    },

    // ――――――――――― ETA (delivery in specific date) ―――――――――――

    waitingToDeliver(item) {
      const delivery_info = item.delivery_info;
      if (
        [Basket.Status.COD.code, Basket.Status.Payed.code].includes(
          item.status,
        ) && // Payed or COD
        ![
          Basket.PhysicalOrderStates.SentOrder.code,
          Basket.PhysicalOrderStates.ToCustomer.code,
        ].includes(item.delivery_state) && // Nor delivered yet!
        delivery_info &&
        delivery_info.date // Has date
      ) {
        return true;
      }
      return false;
    },

    remainsTimePercent(item) {
      try {
        const date = DateConverter.convertToLocalTime(item.delivery_info.date);
        if (date.isBeforeToday()) return 0;

        return (100 * Math.abs(date.diffHours(new Date()))) / (3 * 24);
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.data-table {
  cursor: pointer;
  font-size: 1.071rem;
  font-weight: 400;
  color: #555;
  height: 68px;
}
</style>
