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

import {ProductType} from "@selldone/core-js/enums/product/ProductType";
import {type ILanguage, Language,} from "@selldone/core-js/enums/language/Language";
//―――――――――――――――――――――― Event Bus ――――――――――――――――――――
import {EventBus, EventName} from "@selldone/core-js/events/EventBus";

//―――――――――――――――――――――― Country ――――――――――――――――――――
import {getCountryName} from "@selldone/core-js/models/general/country/country-helper.ts";
import type {Shop} from "@selldone/core-js/models/shop/shop.model";
import {XapiUser} from "@selldone/sdk-storefront";
import type {ICountryCode} from "@selldone/core-js/models/general/country/country.model.ts";
import type {User} from "@selldone/core-js/models/user/user.model";
import {BackofficeLocalStorages} from "@selldone/core-js/helper/local-storage/BackofficeLocalStorages";
import {ExecuteCopyToClipboard} from "../directives/copy/CopyDirective";
import {ShopOptionsHelper} from "@selldone/core-js/helper/shop/ShopOptionsHelper.ts";
import {Basket, Order} from "@selldone/core-js";
import {isString} from "lodash-es";

const CoreMixin = {
  methods: {
    USER(): Partial<User> | XapiUser.IMeServerResponse | null {
      return this.$store.getters.getUser;
    },

    USER_ID(): number | null {
      if (!this.$store.getters.getUser) return null;
      return this.$store.getters.getUser.id;
    },

    /**
     * 🞇 Reset to default
     *
     * Resets the component's data to its initial default state.
     *
     * This method leverages Vue's original data function reference
     * (this.$options.data) to fetch the initial data state, and then
     * uses Object.assign to reset the current data (this.$data)
     * to that initial state.
     *
     * @returns {void}
     */
    resetToDefault(): void {
      Object.assign(
        this.$data,
        (this.$options?.data as () => Array<any>)?.call(this),
      );
    },

    //―――――――――――――――――――――― SHOP ――――――――――――――――――――

    //―――――――――――――――――――――― Replace updated item in array ――――――――――――――――――――

    FindItemByID: function UpdateItemByID(
      items: [],
      item_id: number | string,
      id: string = "id",
    ) {
      if (!items) return null;
      return items.find((element) => element[id] === Number(item_id));
    },
    FindItemByKeyValue: function <T extends object, K extends keyof T>(
      items: T[],
      item_value: T[K],
      item_key: K,
    ): T | undefined {
      return items.find((element) => element[item_key] === item_value);
    },

    UpdateItemByID: function <T extends { id: number }>(items: T[], item: T) {
      const foundIndex = items.findIndex((element) => element.id === item.id);
      if (foundIndex >= 0) items.splice(foundIndex, 1, item);
    },

    DeleteItemByID: function <T extends Record<string, any>>(
      items: T[],
      item_id: number | string,
      id_key: keyof T = "id" as keyof T,
    ): void {
      const foundIndex = items.findIndex(
        (element) => element[id_key] === item_id,
      );
      if (foundIndex >= 0) items.splice(foundIndex, 1);
    },

    AddOrUpdateItemByID: function <T extends Record<string, any>>(
      items: T[],
      item: T,
      id_key = "id",
      add_to_end = true,
    ) {
      if (!item || !items) return null;
      const foundIndex = items.findIndex(
        (element) => element[id_key] === item[id_key],
      );
      if (foundIndex >= 0) {
        items.splice(foundIndex, 1, item);
        return false; //Updated!
      } else {
        if (add_to_end) items.push(item);
        else items.unshift(item);
      }
      return true; // Added!
    },

    GetIndex: function <T extends Record<string, any>>(
      items: T[],
      item_id: number | string,
      id_key: string = "id",
    ) {
      return items.findIndex((element) => element[id_key] === item_id);
    },

    /**
     * Merge objects (keep all properties)
     * @param _old
     * @param _new
     * @returns {any}
     * @constructor
     */
    MergeObjects(_old: object, _new: object) {
      return Object.assign({}, _old ? _old : {}, _new);
    },

    //―――――――――――――――――――――― Country ――――――――――――――――――――

    getCountryName(code: ICountryCode) {
      if (!code) return null;
      if (code.toLowerCase() === "eu") return this.$t("global.commons.europe");

      const key = `countries.${code}`;
      const translated = this.$t(key);
      //console.log("🌍", code, translated, key)
      return key === translated ? getCountryName(code) : translated;
    },

    BlurApp(blur: boolean) {
      EventBus.$emit(EventName.BLUR_APP, blur);
    },

    //―――――――――――――――――――――― Logistic > Basket Helpers ――――――――――――――――――――
    getBasketOrderCode(order: Order.IOrder) {
      if (order.label) {
        return order.label; //🍁 Custom order label
      }

      if (order.type === "AVO") {
        return `AVO-${order.id}`;
      } else if (order.type === "FUL") {
        return `DS-${order.id}`;
      } else if (order.type === "POS") {
        return `POS-${order.id}`;
      } else if (order.type === "HYP") {
        return `HYP-${order.id}`;
      } else if (order.type === "BILL") {
        return `BILL-${order.id}`;
      }

      const productType = ProductType[order.type];
      if (!productType) return order.id;

      if (order.vendor_id) {
        return productType.basket_code + "-" + order.basket_id;
      }

      return productType.basket_code + "-" + order.id;
    },

    getVendorOrderCode(order: Order.IOrder) {
      return `VND-${order.id}`;
    },

    getBasketOrderImage(basket: Basket) {
      const productType = ProductType[basket.type];
      if (!productType) return null;
      return productType.image;
    },

    //―――――――――――――――――――――― Notification ――――――――――――――――――――
    HasNotificationSupported() {
      try {
        return Notification !== undefined;
      } catch (e) {
        console.log(e);
      }
      return false;
    },
    HasNotificationPermission() {
      return Notification && Notification.permission === "granted";
    },

    //―――――――――――――――――――――― Copy Clipboard (Bug fixed in dialog) ――――――――――――――――――――

    copyToClipboard(
      str: string,
      title: string | null = null,
      message: string | null = null,
    ) {
      ExecuteCopyToClipboard(this, str, title, message);
    },

    //―――――――――――――――――――――― Type Check ――――――――――――――――――――

    isString(value: any): value is string {
      if (!value) return true;
      return typeof value === "string" || value instanceof String;
    },
    isObject(obj: any): obj is object {
      return obj && typeof obj === "object" && true && !Array.isArray(obj);
    },
    isBoolean(obj: any): obj is boolean {
      return typeof obj === "boolean";
    },
    isFunction(obj: any): obj is Function {
      return typeof obj === "function";
    },

    //―――――――――――――――――――――― Language & Local ――――――――――――――――――――
    getLanguageObject<T extends string | null>(
      lang: T,
    ): T extends string ? ILanguage : null {
      if (!lang) return null as any;
      if (Language[lang]) return Language[lang] as any;

      const result = Object.values(Language).find(
        (l) => l.code.toLowerCase() === lang!.toLowerCase(),
      );

      return (result || null) as any;
    },

    getLanguageName(lang: string) {
      const obj = this.getLanguageObject(lang);
      return obj ? obj.title : lang;
    },
    /**
     *
     * @returns {Language.en|{calendar, code, dir, title, local}|*}
     */
    getCurrentLanguage() {
      if (!this.$i18n) return Language.en;
      const out = Language[this.$i18n.locale];
      if (!out) return Language.en;
      return out;
    },

    setCurrentLanguage(local: string, save_on_local = true) {
      console.log("🌐 SwitchLanguage | MAIN CORE | package: ", local);

      if (!local || !Language[local]) local = "en";
      // Temporary set window global language object: (Used by language selector set its default)
      window.$language = Language[local];

      console.log(
        "========== start setCurrentLanguage CORE !!! ============",
        local,
        window.$language,
      );
    },
    /**
     * Updates the class attribute of the <body> element to reflect the current locale.
     * It adds a class based on the current locale and removes any previous locale-specific classes.
     * This helps in applying locale-specific CSS styles across the application.
     *
     * The method constructs a class name prefixed with `lang-` and the current locale (e.g., `lang-en`).
     * It then filters out any existing classes that start with `lang-` from the <body> element to avoid duplicate or conflicting locale classes.
     * After filtering, it adds the new locale class to the <body> element.
     *
     * Usage:
     * - This method should be called on component mount and whenever the locale changes.
     */
    setBodyLanguageClass() {
      const currentLocale = `lang-${this.$i18n.locale}`;
      const bodyClasses = document.body.className
        .split(" ")
        .filter((c) => !c.startsWith("lang-"));
      bodyClasses.push(currentLocale);
      document.body.className = bodyClasses.join(" ");
    },

    //―――――――――――――――――――――― Global Dimensions ――――――――――――――――――――
    getBoxSizeDimension(shop: Shop) {
      return ShopOptionsHelper.GetSizeUnit(shop);
    },
    getDistanceDimension(shop: Shop) {
      return ShopOptionsHelper.GetDistanceUnit(shop);
    },
    getWeightDimension(shop: Shop) {
      return ShopOptionsHelper.GetMassUnit(shop);
    },

    //―――――――――――――――――――――― String ――――――――――――――――――――

    getName(val: any) {
      if (!val) return "";
      if (!isString(val)) val = "" + val;

      const str = val
        .replace(/([A-Z])/g, " $1")
        .replace(/-/g, " ")
        .replace(/_/g, " ")
        .trim(); // Add space before capital chars!

      // Capitalize the first letter of each word in a string:
      const arr = str.split(" ");
      for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
      }
      return arr.join(" ");
    },

    //―――――――――――――――――――――― Images ――――――――――――――――――――

    getShopIcon(
      shop_id: number | string,
      size = BackofficeLocalStorages.IMAGE_SIZE_SMALL,
    ) {
      return window.CDN.GET_SHOP_ICON(shop_id, size);
    },
    getShopImagePath(file_name: string, size = null, random_fill = false) {
      return window.CDN.GET_SHOP_IMAGE_PATH(file_name, size, random_fill);
    },

    getProductImage(
      product_id: string | number,
      size = BackofficeLocalStorages.IMAGE_SIZE_SMALL,
    ) {
      return window.CDN.GET_PRODUCT_IMAGE(product_id, size);
    },

    //―――――――――――――――――――――― User ――――――――――――――――――――

    getUserAvatar(user_id: number, size: "small" | "big" | null = "small") {
      return window.CDN.GET_USER_AVATAR(user_id, size);
    },

    //―――――――――――――――――――――― Cookie ――――――――――――――――――――
    getId(id_with_slug: string | number): number | null {
      // If id_with_slug is neither a string nor a number (or if it's a falsy value other than 0), return null
      if (!id_with_slug && id_with_slug !== 0) return null;

      // If id_with_slug is already a number, return it
      if (typeof id_with_slug === "number") return id_with_slug;

      const p = new RegExp("(\\d+)");
      const m = p.exec(id_with_slug);

      if (m != null) {
        return Number(m[1]);
      } else {
        // If there's no number in the string, return null (or depending on your logic you might want to throw an error)
        return null;
      }
    },

    //―――――――――――――――――――――― Remove item from array by value ――――――――――――――――――――

    remove<T>(array: T[], valueToRemove: T) {
      const foundIndex = array.findIndex(
        (element) => element === valueToRemove,
      );
      // console.log('foundIndex',foundIndex,array,valueToRemove)
      if (foundIndex >= 0) array.splice(foundIndex, 1);
    },
  },
};

export default CoreMixin;

//█████████████████████████████████████████████████████████████
//―――――――――――――― Global Types ―――――――――――――――
//█████████████████████████████████████████████████████████████

declare module "vue/types/vue" {
  interface Vue {
    EventBus: typeof EventBus;
  }
}
