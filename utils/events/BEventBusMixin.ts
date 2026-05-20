/*
 * Copyright (c) 2026. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */

// @ts-nocheck
import {EventBus} from "@selldone/components-vue/utils/events/EventBus.ts";

/**
 *
 * @mixin BEventBusMixin
 */
export const BEventBusMixin = {
  methods: {
    //―――――――――――――――――――――― Event Bus ――――――――――――――――――――

    ShowReceiptPaymentDialog(receipt_number) {
      EventBus.$emit("receipt-payment-dialog", receipt_number);
    },
    /*
                                                            ShowLogisticQue(show) {
                                                              EventBus.$emit("show-logistic-que", show);
                                                            },*/

    onAddLogisticSendingOrderQue(basket) {
      EventBus.$emit("transportation.add-new-sending", { basket });
    },
    onDeleteLogisticSendingOrderQue(basket) {
      EventBus.$emit("transportation.delete-sending", { basket });
    },

    setLogisticSendingOrderQueFilter({ type, delivery_service_id }) {
      EventBus.$emit("transportation.set-filter", {
        type,
        delivery_service_id,
      });
    },
    setShopDataTimeSpan({ to, from }) {
      EventBus.$emit("set-main-time-span", { to, from });
    },

    // ――――― Menu builder ―――――
    showShopLinkBuilderDialog(callback, list) {
      EventBus.$emit("show:ShopLinkBuilderDialog", { callback, list });
    },

    // ――――― Instagram ―――――

    showGlobalInstagramProductsSelectDialog(instagram_media, onChange) {
      EventBus.$emit("show:GlobalInstagramProductsSelectDialog", {
        instagram_media,
        onChange,
      });
    },
    // ――――― Show My Shops List ―――――
    ShowMyShopsList() {
      EventBus.$emit("show-shops");
    },

    // ――――― 🆙 🡺 Refresh Shop Data ―――――
    RefreshShopData(callback = null, force = true) {
      EventBus.$emit("refresh-shop-data", { callback, force });
    },

    // ――――― Show need to subscribe as premium user ―――――
    showNeedSubscribePremium() {
      EventBus.$emit("need-premium-subscription", {});
    },

    //―――――――――――――――――― Shop Temporary Access for Agency (Partner panel) ――――――――――――――――

    /**
     * Redirect after shop access token granted!
     * @param shop
     * @param target_url
     */
    requestAgencyShopTemporaryAccess(shop, target_url) {
      EventBus.$emit("shop-agency-temporary-access", {
        shop: shop,
        url: target_url,
      });
    },
  },
};
