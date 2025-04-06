/*
 * Copyright (c) 2023. Selldone® Business OS™
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

/**
 * @link https://developers.google.com/tag-manager/enhanced-ecommerce
 * If user manually et window.DEBUG_MODE=true then it will log all events to console
 */

import type { ProductVariant } from "@selldone/core-js/models/shop/product/product_variant.model";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { Product } from "@selldone/core-js/models/shop/product/product.model";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import { Category } from "@selldone/core-js/models/shop/category/category.model";
import type { Basket } from "@selldone/core-js/models/shop/order/basket/basket.model";
import type { Shop } from "@selldone/core-js/models/shop/shop.model";
import { PriceHelper } from "@selldone/core-js/helper/price/PriceHelper";

// Extend Window interface to support Google Tag Manager and Facebook Pixel
declare global {
  interface Window {
    dataLayer: any;
    fbq?: Function;
  }
}

export class GtagEcommerce {
  /**
   * Helper method to send an event to Facebook Pixel if available.
   *
   * @param eventName - The name of the event (e.g., 'Purchase', 'AddToCart', 'ViewContent').
   * @param parameters - An object containing event parameters.
   * @param useCustom - If true, sends a custom event using 'trackCustom' instead of a standard 'track'.
   */
  private static sendFacebookEvent(
      eventName: string,
      parameters: Record<string, any>,
      useCustom: boolean = false
  ): void {
    if (typeof window.fbq === "function") {
      if(window.DEBUG_MODE)
      console.log("Send Facebook Pixel event:", eventName, parameters);
      if (useCustom) {
        window.fbq("trackCustom", eventName, parameters);
      } else {
        window.fbq("track", eventName, parameters);
      }
    }
  }

  /**
   * Measure product impressions by pushing the product list details to the dataLayer.
   * Additionally, sends a custom 'ProductImpressions' event to Facebook Pixel if available.
   *
   * @param shop - The shop object.
   * @param products - Array of products with an associated category.
   * @param currency - Currency key.
   * @param _list - Optional list name.
   * @param category - Fallback category if product category is missing.
   */
  static MeasuringProductImpressions(
      shop: Shop,
      products: (Product & { category: Category })[],
      currency: keyof typeof Currency,
      _list: string | null,
      category: Category | null
  ) {
    window.dataLayer = window.dataLayer || [];

    const products_list: {
      name: string;
      id: any;
      price: number;
      brand: any;
      category: string;
      variant: string;
      list: string;
      position: number;
    }[] = [];

    let index = 1;
    products
        ?.filter((x) => !!x?.id) // Remove null values!
        .forEach((product) => {
          const category_name = product.category
              ? product.category.title
              : category
                  ? category.title
                  : "Home";
          const list = _list ? _list : `${category_name} Gallery`;

          try {
            const price = PriceHelper.priceProductByCurrency(
                shop,
                product,
                null,
                currency
            );
            products_list.push({
              name: product.title, // Name or ID is required.
              id: product.id,
              price: price,
              brand: product.brand,
              category: category_name,
              variant: "",
              list: list,
              position: index++,
            });
          } catch (e) {
            console.error(e);
            return;
          }
        });

    // Push to dataLayer for Google Tag Manager
    window.dataLayer.push({
      ecommerce: {
        currencyCode: currency,
        impressions: products_list,
      },
    });
    if(window.DEBUG_MODE)
      console.log("GTAG | Added product impressions to dataLayer:", products_list);

    // Send custom Facebook Pixel event with list of product IDs and names
    this.sendFacebookEvent(
        "ProductImpressions",
        {
          content_ids: products_list.map((p) => p.id),
          content_names: products_list.map((p) => p.name),
          currency: currency,
        },
        true
    );
  }

  /**
   * Measure a product click by pushing event details to the dataLayer.
   * Also sends a 'ViewContent' event to Facebook Pixel for product click.
   *
   * @param shop - The shop object.
   * @param product - The clicked product with its category.
   * @param currency - Currency key.
   * @param position - Position of the product in the list.
   * @param category - Fallback category if product category is missing.
   */
  static MeasuringProductClicks(
      shop: Shop,
      product: Product & { category: Category },
      currency: keyof typeof Currency,
      position: number,
      category: Category | null
  ) {
    window.dataLayer = window.dataLayer || [];

    const category_name = product.category
        ? product.category.title
        : category
            ? category.title
            : "Home";

    try {
      const price = PriceHelper.priceProductByCurrency(
          shop,
          product,
          null,
          currency
      );

      // Push click event to dataLayer (Google Tag Manager)
      window.dataLayer.push({
        event: "productClick",
        currencyCode: currency,
        ecommerce: {
          click: {
            actionField: { list: "Search Results" },
            products: [
              {
                name: product.title,
                id: product.id,
                price: price,
                brand: product.brand,
                category: category_name,
                variant: "",
                position: position,
              },
            ],
          },
        },
      });

      if(window.DEBUG_MODE)
        console.log("GTAG | Added product click to dataLayer:", product);

      // Send Facebook Pixel 'ViewContent' event for product click
      this.sendFacebookEvent("ViewContent", {
        content_name: product.title,
        content_category: category_name,
        content_ids: [product.id],
        value: price,
        currency: currency,
      });
    } catch (e) {
      console.error(e);
      return;
    }
  }

  /**
   * Measure views of product details by pushing a 'detail' action to the dataLayer.
   * Also sends a 'ViewContent' event to Facebook Pixel.
   *
   * @param shop - The shop object.
   * @param product - The product being viewed with its category.
   * @param currency - Currency key.
   * @param _list - Optional list identifier ('product-page' or 'quick-view').
   */
  static MeasuringViewsOfProductDetails(
      shop: Shop,
      product: Product & { category: Category },
      currency: keyof typeof Currency,
      _list?: "product-page" | "quick-view" | null
  ) {
    window.dataLayer = window.dataLayer || [];
    const category_name = product.category ? product.category.title : "Home";
    const list = _list ? _list : `${category_name} Gallery`;

    const products_list: {
      name: string;
      id: any;
      price: number;
      brand: any;
      category: string;
      variant: string;
    }[] = [];

    try {
      const price = PriceHelper.priceProductByCurrency(
          shop,
          product,
          null,
          currency
      );

      products_list.push({
        name: product.title,
        id: product.id,
        price: price,
        brand: product.brand,
        category: category_name,
        variant: "",
      });

      // Push detail view event to dataLayer (Google Tag Manager)
      window.dataLayer.push({
        currencyCode: currency,
        ecommerce: {
          detail: {
            actionField: { list: list },
            products: products_list,
          },
        },
      });

      if(window.DEBUG_MODE)
        console.log("GTAG | Added product detail view to dataLayer:", product);

      // Send Facebook Pixel 'ViewContent' event for product details
      this.sendFacebookEvent("ViewContent", {
        content_name: product.title,
        content_category: category_name,
        content_ids: [product.id],
        value: price,
        currency: currency,
      });
    } catch (e) {
      console.error(e);
      return;
    }
  }

  /**
   * Measure adding a product to the shopping cart by pushing an 'add' event to the dataLayer.
   * Also sends an 'AddToCart' event to Facebook Pixel.
   *
   * @param shop - The shop object.
   * @param product - The product being added with its category.
   * @param variant - Optional product variant.
   * @param quantity - Number of units added.
   * @param currency - Currency key.
   */
  static AddingProductToShoppingCart(
      shop: Shop,
      product: Product & { category: Category },
      variant: ProductVariant | null,
      quantity: number,
      currency: keyof typeof Currency
  ) {
    window.dataLayer = window.dataLayer || [];
    const category_name = product.category ? product.category.title : "Home";

    try {
      const price = PriceHelper.priceProductByCurrency(
          shop,
          product,
          variant,
          currency
      );

      const products_list = [
        {
          name: product.title,
          id: product.id,
          price: price,
          brand: product.brand,
          category: category_name,
          variant: variant,
          quantity: quantity,
        },
      ];

      // Push add-to-cart event to dataLayer (Google Tag Manager)
      window.dataLayer.push({
        event: "addToCart",
        ecommerce: {
          currencyCode: currency,
          add: {
            products: products_list,
          },
        },
      });

      if(window.DEBUG_MODE)
        console.log("GTAG | Added product to cart in dataLayer:", product);

      // Send Facebook Pixel 'AddToCart' event
      this.sendFacebookEvent("AddToCart", {
        content_name: product.title,
        content_category: category_name,
        content_ids: [product.id],
        value: price,
        currency: currency,
        quantity: quantity,
        content_type: "product",
      });
    } catch (e) {
      console.error(e);
      return;
    }
  }

  /**
   * Measure the removal of a product from the shopping cart by pushing a removal event to the dataLayer.
   * Also sends a custom 'RemoveFromCart' event to Facebook Pixel.
   *
   * @param shop - The shop object.
   * @param product - The product being removed with its category.
   * @param variant - Optional product variant.
   * @param quantity - Number of units removed.
   * @param currency - Currency key.
   */
  static RemovingProductFromShoppingCart(
      shop: Shop,
      product: Product & { category: Category },
      variant: ProductVariant | null,
      quantity: number,
      currency: keyof typeof Currency
  ) {
    window.dataLayer = window.dataLayer || [];
    const category_name = product.category ? product.category.title : "Home";

    try {
      const price = PriceHelper.priceProductByCurrency(
          shop,
          product,
          variant,
          currency
      );

      const products_list = [
        {
          name: product.title,
          id: product.id,
          price: price,
          brand: product.brand,
          category: category_name,
          variant: variant,
          quantity: quantity,
        },
      ];

      // Push removal event to dataLayer (Google Tag Manager)
      window.dataLayer.push({
        event: "removeFromCart",
        ecommerce: {
          currencyCode: currency,
          add: {
            products: products_list,
          },
        },
      });
      if(window.DEBUG_MODE)
        console.log("GTAG | Removed product from cart in dataLayer:", product);

      // Send custom Facebook Pixel event 'RemoveFromCart'
      this.sendFacebookEvent(
          "RemoveFromCart",
          {
            content_name: product.title,
            content_category: category_name,
            content_ids: [product.id],
            value: price,
            currency: currency,
            quantity: quantity,
          },
          true
      );
    } catch (e) {
      console.error(e);
      return;
    }
  }

  /**
   * Measure checkout steps by pushing a checkout event to the dataLayer.
   * Depending on the checkout step, different Facebook Pixel events are sent:
   *  - Step 0: Custom 'ViewCart'
   *  - Step 1: Standard 'InitiateCheckout'
   *  - Step 2: Standard 'AddPaymentInfo'
   *
   * @param basket - The shopping basket object.
   * @param step - The current checkout step (0: view basket, 1: select location, 2: select payment).
   * @param option - Optional additional option detail.
   */
  static MeasuringCheckoutSteps(
      basket: Basket,
      step: number,
      option: string | null
  ) {
    if (!basket) return;
    window.dataLayer = window.dataLayer || [];
    const products_list: {
      name: any;
      id: any;
      price: any;
      currencyCode: any;
      brand: any;
      category: string;
      variant: any;
      quantity: any;
    }[] = [];

    try {
      if (
          basket.items &&
          [
            ProductType.PHYSICAL.code,
            ProductType.VIRTUAL.code,
            ProductType.SERVICE.code,
            ProductType.FILE.code,
            "POS",
          ].includes(basket.type)
      ) {
        basket.items
            ?.filter((item) => !!item?.product)
            .forEach((item) => {
              products_list.push({
                name: item.product?.title,
                id: item.product?.id,
                price: item.price,
                currencyCode: item.currency,
                brand: item.product?.brand,
                category: "",
                variant: item.variant,
                quantity: item.count,
              });
            });
      }
    } catch (e) {
      console.error(e);
    }

    // Push checkout step event to dataLayer (Google Tag Manager)
    window.dataLayer.push({
      event: "checkout",
      currencyCode: basket.currency,
      ecommerce: {
        checkout: {
          actionField: { step: step, option: option },
          products: products_list,
        },
      },
    });

    if(window.DEBUG_MODE)
      console.log("GTAG | Added checkout step to dataLayer:", step, option);

    // Determine and send corresponding Facebook Pixel event based on the step
    const contentIds = products_list.map((p) => p.id);
    const fbParams = {
      content_ids: contentIds,
      value: basket.price,
      currency: basket.currency,
    };

    if (step === 0) {
      // Custom event for viewing the cart/basket
      this.sendFacebookEvent("ViewCart", fbParams, true);
    } else if (step === 1) {
      // Standard event when checkout is initiated
      this.sendFacebookEvent("InitiateCheckout", fbParams);
    } else if (step === 2) {
      // Standard event when payment information is added
      this.sendFacebookEvent("AddPaymentInfo", fbParams);
    }
  }

  /**
   * Measure purchase completion by pushing a purchase event to the dataLayer.
   * Also sends a 'Purchase' event to Facebook Pixel.
   *
   * @param basket - The shopping basket object.
   */
  static MeasuringPurchasesBasket(basket: Basket) {
    const products_list: {
      name: any;
      id: any;
      price: any;
      currency: any;
      brand: any;
      category: string;
      variant: any;
      quantity: any;
      coupon: string;
    }[] = [];

    try {
      if (
          basket.items &&
          [
            ProductType.PHYSICAL.code,
            ProductType.VIRTUAL.code,
            ProductType.SERVICE.code,
            ProductType.FILE.code,
            "POS",
          ].includes(basket.type)
      ) {
        basket.items
            ?.filter((item) => !!item?.product)
            .forEach((item) => {
              products_list.push({
                name: item.product?.title,
                id: item.product?.id,
                price: item.price,
                currency: item.currency,
                brand: item.product?.brand,
                category: "",
                variant: item.variant,
                quantity: item.count,
                coupon: basket.discount_id ? `${basket.discount_id}` : "",
              });
            });
      }
    } catch (e) {
      console.error(e);
    }

    // Push purchase event to dataLayer (Google Tag Manager)
    window.dataLayer.push({
      currencyCode: basket.currency,
      ecommerce: {
        purchase: {
          actionField: {
            id: `${basket.type}-${basket.id}`,
            affiliation: "Online Store",
            revenue: basket.price,
            tax: "0",
            shipping: basket.delivery_price > 0 ? basket.delivery_price : 0,
            coupon: "",
          },
          products: products_list,
        },
      },
    });

    if(window.DEBUG_MODE)
      console.log("GTAG | Added purchase to dataLayer:", basket);

    // Send Facebook Pixel 'Purchase' event
    this.sendFacebookEvent("Purchase", {
      content_ids: products_list.map((p) => p.id),
      value: basket.price,
      currency: basket.currency,
      order_id: `${basket.type}-${basket.id}`,
    });
  }
}
