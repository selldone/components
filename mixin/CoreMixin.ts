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
import type {ICurrency} from "@selldone/core-js/enums/payment/Currency";
import {Currency} from "@selldone/core-js/enums/payment/Currency";
import {type ILanguage, Language,} from "@selldone/core-js/enums/language/Language";
import {ShopLicense} from "@selldone/core-js/enums/shop/ShopLicense";
import {FileExtensions} from "@selldone/core-js/enums/file/FileExtensions";
import {SocialNetwork} from "@selldone/core-js/enums/social/SocialNetwork";
import {ShopURLs} from "@selldone/core-js/helper/url/ShopURLs";
import {PriceHelper} from "@selldone/core-js/helper/price/PriceHelper";
import {GiftStatus} from "@selldone/core-js/enums/wallet/gift/GiftStatus";
import {GiftStProgramTypes} from "@selldone/core-js/enums/wallet/gift/GiftStProgramTypes";
import numeral from "numeral";
//―――――――――――――――――――――― Event Bus ――――――――――――――――――――
import {EventBus, EventName} from "@selldone/core-js/events/EventBus";

//―――――――――――――――――――――― Country ――――――――――――――――――――
import {getCountryName} from "@selldone/core-js/models/general/country/country-helper.ts";
import {Shop} from "@selldone/core-js/models/shop/shop.model";
import {XapiUser} from "@selldone/sdk-storefront";
import type {Guild} from "@selldone/core-js/models/guild/guild.model";
import type {Avocado} from "@selldone/core-js/models/shop/order/avocado/avocado.order";
import type {ICountryCode} from "@selldone/core-js/models/general/country/country.model.ts";
import type {User} from "@selldone/core-js/models/user/user.model";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper";
import {BackofficeLocalStorages} from "@selldone/core-js/helper/local-storage/BackofficeLocalStorages";
import {ExecuteCopyToClipboard} from "../directives/copy/CopyDirective";
import {Slugify} from "@selldone/core-js/utils/slugify/slugify";
import {ShopOptionsHelper} from "@selldone/core-js/helper/shop/ShopOptionsHelper.ts";
import {Basket, BasketItemReturn, Club, CurrencyHelper, Order} from "@selldone/core-js";
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

    //―――――――――――――――――――――― ⚠ Show Alerts ――――――――――――――――――――

    showErrorAlert(
      title: string | null,
      message: string | null = null,
      detail: string | null = null,
      duration: number = 6000,
    ) {
      if (!this.$t) {
        console.error("Error: Translation is not available!");
        return;
      }
      if (!title) title = this.$t("global.notification.error") as string;

      this.$notify({
        group: "regular-notifications",
        title: title,
        text: message + (detail ? `<br><hr>${detail}` : ""),
        duration: detail ? duration * 2 : duration,
        type: "error",
      });
    },

    showSuccessAlert(
      title: string | null,
      message: string | null,
      icon = "done",
      duration = 3000,
      img = null,
    ) {
      if (!this.$t) return;
      if (!title) title = this.$t("global.notification.confirm") as string;

      this.$notify({
        group: "regular-notifications",
        title: title,
        text: message
          ? message
          : (this.$t("global.notification.confirm_message") as string),
        duration: duration,
        type: "success",
        data: { img: img, icon: icon },
      });
    },

    showWarningAlert(title: string | null, message?: string, duration = 6000) {
      if (!this.$t) return;
      if (!title) title = this.$t("global.notification.warning") as string;

      this.$notify({
        group: "regular-notifications",
        title: title,
        text: message,
        duration: duration,
        type: "warn",
      });
    },

    showAwardAlert(title: string | null, message?: string) {
      if (!this.$t) return;
      if (!title) title = this.$t("global.notification.award") as string;

      this.$notify({
        group: "regular-notifications",
        title: title,
        text: message,
        duration: 7000,
        type: "award",
      });
    },
    showNotificationAlert(
      title: string | null,
      message?: string,
      icon?: string | null,
      color?: string | null,
      img = null,
      duration = 30000,
    ) {
      if (!this.$t) return;
      if (!title) title = this.$t("global.notification.caution") as string;

      this.$notify({
        group: "regular-notifications",
        title: title,
        text: message,
        duration: duration,
        data: { img: img, icon: icon },
      });
    },

    copyNotification(description: string) {
      this.showSuccessAlert("Copy", description, "file_copy");
    },

    openDangerAlert(
      title: string | null,
      message: string,
      accept: string,
      callback: () => void,
      color: string = "red",
    ) {
      EventBus.$emit("alert-dialog", {
        title,
        message,
        accept,
        reject: this.$t("global.actions.cancel"),
        callback,
        color: color,
      });
    },

    openConfirmationAlert(
      title: string,
      message: string,
      accept: string,
      callback: () => void,
    ) {
      EventBus.$emit("alert-dialog", {
        title,
        message,
        accept,
        reject: this.$t("global.actions.no"),
        callback,
        color: "success",
      });
    },

    showMessage(title: string, message: string, duration: number = 12000) {
      if (!title) title = this.$t("global.notification.message") as string;
      this.$notify({
        group: "regular-notifications",
        title: title,
        text: message,
        duration: duration,
        type: "message",
      });
    },
    //―――――――――――――――――――――― Common dialogs ――――――――――――――――――――
    openDeleteAlert(callback: () => void) {
      const title = this.$t("global.dialogs.delete.title");
      const message = this.$t("global.dialogs.delete.message");
      const accept = this.$t("global.dialogs.delete.action");

      EventBus.$emit("alert-dialog", {
        title,
        message,
        accept,
        reject: this.$t("global.actions.cancel"),
        callback,
        color: "red",
      });
    },

    //―――――――――――――――――――――― Format account number ――――――――――――――――――――
    // XXXX-XXXX-XXXX-XXXX
    formatCard(val: string | null) {
      if (!val) return val;
      return val.replace(/(\d{4})(\d{4})(\d{4})(\d+)/, "$1-$2-$3-$4");
    },

    //―――――――――――――――――――――― String Limit ――――――――――――――――――――
    LimitString(str: string | null, count = 100) {
      if (!str) return str;
      str = str.replace(/<[^>]*>?/gm, ""); // Remove all html tags!
      if (str.length > count) return str.substring(0, count) + "…";
      return str;
    },

    //――――――――――――――――――――――  Exchange Rates ――――――――――――――――――――

    getExchangeRate: function getExchangeRate(
      shop: Shop,
      from: keyof typeof Currency,
      to: keyof typeof Currency,
    ) {
      return PriceHelper.getExchangeRate(shop, from, to);
    },

    getExchangeRateValue(
      shop: Shop,
      from: keyof typeof Currency,
      to: keyof typeof Currency,
      default_rate?: number | null,
    ) {
      return PriceHelper.getExchangeRateValue(shop, from, to, default_rate);
    },

    // Used for convert product prices to (to_currency).
    getBuyRateValue(
      shop: Shop,
      from_currency: keyof typeof Currency,
      to_currency: keyof typeof Currency,
    ) {
      return PriceHelper.getBuyRateValue(shop, from_currency, to_currency);
    },

    //―――――――――――――――――――――― SHOP ――――――――――――――――――――
    getShopLicenseObject(license: keyof typeof ShopLicense) {
      return ShopLicense[license];
    },

    getShopLicenseName(license: keyof typeof ShopLicense) {
      const _license = ShopLicense[license];
      return _license ? this.$t(_license.name) : this.$t("global.error");
    },
    getShopLicenseIcon(license: keyof typeof ShopLicense) {
      const _license = ShopLicense[license];
      return _license ? _license.icon : null;
    },
    getShopStateName(state: string) {
      return state ? this.$t("global.active") : this.$t("global.inactive");
    },

    getProductTypeName(type: keyof typeof ProductType) {
      return ProductType[type] ? this.$t(ProductType[type].name) : "";
    },

    getProductTypeImage(
      type: keyof typeof ProductType | "POS" | "FUL" | "AVO" | "HYP",
    ) {
      if (type === "POS") return require("../assets/icons/pos-order-type.svg");
      else if (type === "FUL")
        return require("../assets/icons/dropshipping.svg");
      else if (type === "AVO") return require("../assets/icons/avocado.svg");
      else if (type === "HYP") return require("../assets/icons/hyper.svg");

      return ProductType[type] ? ProductType[type].image : "";
    },
    getBasketTypeImage(
      type: keyof typeof ProductType | "POS" | "FUL" | "AVO" | "HYP",
    ) {
      if (type === "POS")
        return require("@selldone/core-js/assets/order-types/basket-pos.svg");
      else if (type === "FUL")
        return require("@selldone/core-js/assets/order-types/basket-drop-shipping.svg");
      else if (type === "AVO")
        return require("@selldone/core-js/assets/order-types/basket-avocado.svg");
      else if (type === "HYP")
        return require("@selldone/core-js/assets/order-types/basket-hyper.svg");

      return ProductType[type] ? ProductType[type].basket : "";
    },
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

    /**
     * Convert string to proper hashtag
     * @param text
     * @returns {string}
     */
    slugify(text: string | null) {
      if (!text) return "";

      return Slugify.apply(text.toString()); // Trim - from end of text
    },

    //―――――――――――――――――――――― Gift ――――――――――――――――――――
    GetGiftStatus(status: keyof typeof GiftStatus) {
      if (!status) return null;
      return GiftStatus[status];
    },
    GetGiftProgramType(type: keyof typeof GiftStProgramTypes) {
      if (!type) return GiftStProgramTypes.Airdrop;
      return GiftStProgramTypes[type];
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

    //―――――――――――――――――――――― Device Image ――――――――――――――――――――

    getBrowserImage(code: string) {
      if (!code) return null;
      code = code.toLowerCase();
      if (code === "firefox") return require("../assets/trademark/firefox.svg");
      if (code === "chrome") return require("../assets/trademark/chrome.svg");
      if (code === "opera") return require("../assets/trademark/opera.svg");
      if (code === "internet-explorer")
        return require("../assets/trademark/internet-explorer.svg");
      if (code === "safari") return require("../assets/trademark/safari.svg");
      else return require("../assets/trademark/information.svg");
    },

    //―――――――――――――――――――――― Basket > Reject ――――――――――――――――――――

    getReturnRequestStateObject(state: keyof typeof BasketItemReturn.States) {
      const out = BasketItemReturn.States[state];
      return out ? out : {};
    },

    BlurApp(blur: boolean) {
      EventBus.$emit(EventName.BLUR_APP, blur);
    },

    //―――――――――――――――――――――― Fullscreen ――――――――――――――――――――

    // Fullscreen by animation
    showFullscreen(event: MouseEvent) {
      EventBus.$emit("show:fullscreen", event);
    },

    //―――――――――――――――――――――― Guild global ――――――――――――――――――――
    showGuildSharePost(activator: Element, guild: Guild) {
      EventBus.$emit("guild:share", { activator, guild });
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

    //―――――――――――――――――――――― Laravel validation error handler ――――――――――――――――――――

    showLaravelError(
      error: string | { error: true; error_msg: string; code?: number } | any,
    ) {
      if (!error) return;
      if (isString(error)) {
        this.showErrorAlert(
          this.$t("global.notification.error") as string,
          error,
        );
        return;
      }

      if (error?.error_msg /*Errors in the response with 2xx code*/) {
        this.showErrorAlert(
          this.$t("global.notification.error") as string,
          error.error_msg,
        );
        return;
      }

      if (!error.response) {
        console.error("1- error", error);
        if (error.message) {
          this.showErrorAlert(
            this.$t("global.notification.error") as string,
            `<div dir="ltr" class="text-left">${error.message}</div>`,
          );
        } else if (error.body) {
          this.showErrorAlert(
            this.$t("global.notification.error") as string,
            `<div dir="ltr" class="text-left">${error.body}</div>`,
          );
        }
        return;
      }

      // Handle CSRF token expire:
      if (error.response.status === 419) {
        this.showErrorAlert(
          this.$t("global.notification.error") +
            " " +
            error.response.status +
            " | CSRF token mismatch.",
          `<div class="text-start">${this.$t("global.errors.419")}</div>`,
          null,
          60000,
        );
        return;
      }

      const data = error.response.data;
      console.error(
        "2- data",
        error.response.status,
        data,
        "response",
        error.response,
      );

      if (data?.error_msg) {
        // Normal laravel app level errors
        this.showErrorAlert(
          this.$t("global.notification.error") + " " + data.code,
          `<div class="text-start">${data.error_msg}</div>`,
        );
      } else if (data?.errors) {
        let error_msg = "";

        for (const key in data.errors) {
          const val = data.errors[key]; //is array
          //  error_msg += `<b>${key}:</b>`;

          if (Array.isArray(val)) {
            val.forEach((er) => {
              error_msg += `<li><b style="text-transform: capitalize">${key}: </b> ${er}</li>`;
            });
          }
          error_msg = `<ul>${error_msg}</ul>`;
        }
        this.showErrorAlert(
          this.$t("global.notification.error") + " " + error.response.status,
          `<div class="text-start">${error_msg}</div>`,
        );
      } else if (data?.message) {
        this.showErrorAlert(
          this.$t("global.notification.error") + " " + error.response.status,
          `<div class="text-start">${data.message}</div>`,
        );
      } else {
        this.showErrorAlert(
          this.$t("global.notification.error") + " " + error.response.status,
          this.$t("global.notification.error_message") as string,
        );
      }
    },

    FormatNumberCurrency(
      _value: number,
      _currency: keyof typeof Currency | ICurrency | null = null,
    ) {
      const currency_obj =
        _currency && _currency instanceof Object
          ? _currency
          : _currency
            ? Currency[_currency]
            : CurrencyHelper.GetUserSelectedCurrency(this.$localstorage_base_path());

      if (!currency_obj) return `${_currency} Not exist 🚨!`;
      const value =
        _value * (currency_obj.alt_factor ? currency_obj.alt_factor : 1);

      return numeral(value).format(currency_obj.format);
    },

    //―――――――――――――――――――――― Enums ――――――――――――――――――――

    getCustomerClubLevel(level: keyof typeof Club.Levels) {
      return Club.Levels[level];
    },

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
    getPublicFilePath(file_name: string) {
      return window.CDN.GET_PUBLIC_FILE_PATH(file_name);
    },

    getShopJsonPath(file_name: string) {
      return window.CDN.GET_SHOP_JSON_PATH(file_name);
    },

    getCategoryIcon(
      category_id: string | number,
      size = BackofficeLocalStorages.IMAGE_SIZE_SMALL,
    ) {
      return window.CDN.GET_CATEGORY_ICON(category_id, size);
    },
    getProductImage(
      product_id: string | number,
      size = BackofficeLocalStorages.IMAGE_SIZE_SMALL,
    ) {
      return window.CDN.GET_PRODUCT_IMAGE(product_id, size);
    },
    getDeliveryServiceIcon(
      delivery_service_id: string | number,
      size = BackofficeLocalStorages.IMAGE_SIZE_SMALL,
    ) {
      return window.CDN.GET_DELIVERY_SERVICE_ICON(delivery_service_id, size);
    },
    getConnectIcon(connect_id: string | number) {
      return window.CDN.GET_CONNECT_ICON(connect_id);
    },

    getShopFileTempPath(file_name: string) {
      return window.CDN.GET_SHOP_TEMP_FILE_PATH(file_name);
    },

    getShop3DModelPath(
      shop_name: string,
      product_id: number,
      variant_id: number | null,
      folder_name: string,
      file_name: string,
    ) {
      return window.CDN.GET_SHOP_3D_MODEL_PATH(
        shop_name,
        product_id,
        variant_id,
        folder_name,
        file_name,
      );
    },

    getVideoUrl(file_name: string) {
      return window.CDN.GET_VIDEO_URL(file_name);
    },
    getVoiceUrl(file_name: string) {
      return window.CDN.GET_VIDEO_URL(file_name);
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

    //―――――――――――――――――――――― Download file text ――――――――――――――――――――

    downloadText(
      filename: string,
      text: string,
      data_uri = "data:text/plain;charset=utf-8,",
    ) {
      const element = document.createElement("a");
      element.setAttribute("href", data_uri + encodeURIComponent(text));
      element.setAttribute("download", filename);

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },

    getFileExtensionImage(filename: string) {
      const extension = filename.split(".").pop();
      const out = FileExtensions.find((item) =>
        item.ex.includes(extension as string),
      );
      return out
        ? out.src
        : require("@selldone/core-js/enums/file/assets/extensions/file.svg");
    },

    //―――――――――――――――――――――― Remove item from array by value ――――――――――――――――――――

    remove<T>(array: T[], valueToRemove: T) {
      const foundIndex = array.findIndex(
        (element) => element === valueToRemove,
      );
      // console.log('foundIndex',foundIndex,array,valueToRemove)
      if (foundIndex >= 0) array.splice(foundIndex, 1);
    },

    //―――――――――――――――――――――― 💡 Get Primary Shop Url ――――――――――――――――――――

    getShopMainUrl(shop: Shop) {
      return ShopURLs.MainShopUrl(shop);
    },
    //――――――――――――――――――――――――― Instagram ―――――――――――――――――――――――――

    getShopInstagramUrl(shop: Shop) {
      return this.getShopMainUrl(shop) + "/instagram";
    },

    //――――――――――――――――――――――――― Avocado ―――――――――――――――――――――――――

    getShopAvocadoUrl(shop: Shop) {
      return this.getShopMainUrl(shop) + "/avocado";
    },
    getAvocadoBuyerUrl(shop: Shop, avocado: Avocado) {
      return this.getShopMainUrl(shop) + "/avocado/" + avocado.hash;
    },
    //――――――――――――――――――――――――― Avocado ―――――――――――――――――――――――――

    getShopHyperUrl(shop: Shop) {
      return this.getShopMainUrl(shop) + "/hyper";
    },

    //――――――――――――――――――――――――― Products / Categories link ―――――――――――――――――――――――――
    getCategoryLink(shop: Shop, category_name: string) {
      return this.getShopMainUrl(shop) + "/" + category_name + "-category";
    },
    getProductLink(shop: Shop, product_id: number | string, slug = null) {
      return (
        this.getShopMainUrl(shop) +
        "/product/" +
        product_id +
        (slug ? `-${slug}` : "")
      );
    },
    getShopPageLink(
      shop: Shop,
      query: { [key: string]: string },
      path: string = "",
    ) {
      const queryString = Object.keys(query)
        .map(function (key) {
          return key + "=" + query[key];
        })
        .join("&");
      return this.getShopMainUrl(shop) + path + "?" + queryString;
    },
    getBlogLink(shop: Shop, blog_id: number | string) {
      return this.getShopMainUrl(shop) + "/blog/" + blog_id;
    },

    //―――――――――――――――――――――― 💡 Read txt file to json ――――――――――――――――――――

    loadFile(event: Blob) {
      return new Promise(function (resolve, reject) {
        if (!event) {
          reject(new Error("No date!"));
          return;
        }
        const fr = new FileReader();
        fr.onload = (e) => {
          const json = JSON.parse(e.target?.result as string);
          resolve(json);
        };
        fr.readAsText(event);
      });
    },

    //―――――――――――――――――――――― Convert Html to Text ――――――――――――――――――――

    extractContent(html: string) {
      return new DOMParser().parseFromString(html, "text/html").documentElement
        .textContent;
    },

    //―――――――――――――――――――――― Page Scroll Helper ――――――――――――――――――――
    GoToTopPage() {
      this.$nextTick(() => {
        this.$nextTick(() => {
          ScrollHelper.scrollToTop(0, "smooth");
        });
      });
    },

    //――――――――――――――――――――――――― Accounts ―――――――――――――――――――――――――

    isSelldoneAccount(account_number: string) {
      return (
        account_number.startsWith("20000000000") ||
        account_number.startsWith("10000000000")
      );
    },

    //―――――――――――――――――――――― Global appearance――――――――――――――――――――

    setHtmlFontSize(low_vision: boolean) {
      document.documentElement.style.setProperty(
        "font-size",
        low_vision
          ? "var(--base-font-low-vision)"
          : "var(--base-font-standard)",
        "important",
      );
    },

    //―――――――――――――――――――――― Download Blob File ――――――――――――――――――――
    DownloadBlobFile(data: any, headers: { [key: string]: string }) {
      // Get the content-disposition header
      const headerLine = headers["content-disposition"];
      if (!headerLine) {
        console.error("Content-Disposition header is missing.");
        return;
      }

      // Extract the filename from the content-disposition header
      const startFileNameIndex = headerLine.lastIndexOf("=") + 1;
      let filename = headerLine.substring(startFileNameIndex);

      // Remove any extra quotes or whitespace
      filename = filename.replace(/["']/g, "").trim();

      // Default filename if extraction fails
      if (!filename) filename = "data.xlsx";

      const downloadUrl = window.URL.createObjectURL(new Blob([data]));

      const link = document.createElement("a");

      link.href = downloadUrl;

      link.setAttribute("download", filename); //any other extension

      document.body.appendChild(link);

      link.click();

      link.remove();
    },

    isEqualJson(obj1: any, obj2: any) {
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    },

    //―――――――――――――――――――――― Social ――――――――――――――――――――

    getSocialIcon(social: string) {
      const found = Object.values(SocialNetwork).find(
        (it) => it.code.toLowerCase() === social.toLowerCase(),
      );
      return found ? found.image : null;
    },

    //――――――――――――――――――――――――― Home Image Helper ―――――――――――――――――――――――――
    GetDomainHomeIcon: function (home: string) {
      return home === "shop"
        ? require("../assets/icons/store.svg")
        : home === "avocado"
          ? require("../assets/icons/avocado.svg")
          : home === "blog"
            ? require("../assets/icons/blog.svg")
            : home === "hyper"
              ? require("../assets/icons/hyper.svg")
              : home === "community"
                ? require("../assets/icons/community.png")
                : home === "map"
                  ? require("../assets/icons/map-tag.svg")
                  : ("" + home).startsWith("/")
                    ? require("../assets/icons/static-pages.svg")
                    : home
                      ? require("../assets/icons/landing-page.svg")
                      : require("../assets/icons/store.svg");
    },
    GetDomainHomeName(home: string) {
      return home === "shop"
        ? this.$t("global.commons.shop")
        : home === "avocado"
          ? this.$t("global.commons.avocado")
          : home === "blog"
            ? this.$t("global.commons.blog")
            : home === "hyper"
              ? this.$t("global.commons.hyper")
              : home === "community"
                ? this.$t("global.commons.community")
                : home === "map"
                  ? this.$t("global.commons.map")
                  : ("" + home).startsWith("/")
                    ? this.$t("global.commons.static_page")
                    : home
                      ? this.$t("global.commons.landing_page")
                      : this.$t("global.commons.store");
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
