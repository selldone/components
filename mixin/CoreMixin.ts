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

import Vue from "vue";
import type { VueConstructor } from "vue";
import SetupService from "@core/server/SetupService";
import { ProductType } from "@core/enums/product/ProductType";
import { PhysicalOrderStates } from "@core/enums/basket/PhysicalOrderStates";
import { DateConverter } from "@core/helper/date/DateConverter";
import { Currency } from "@core/enums/payment/Currency";
import type { ICurrency } from "@core/enums/payment/Currency";
import {
  type ILanguage,
  Language,
} from "@core/enums/language/Language";
import { ShopLicense } from "@core/enums/shop/ShopLicense";
import { Scopes } from "@core/enums/permission/Scopes";

import { ReturnItemStates } from "@core/enums/basket/ReturnItemStates";
import { FileExtensions } from "@core/enums/file/FileExtensions";
import GlobalRules from "@core/helper/rules/GlobalRules";
import { SocialNetwork } from "@core/enums/social/SocialNetwork";
import ShopURLs from "@core/helper/url/ShopURLs";
import { ColorHelper } from "@core/helper/color/ColorHelper";
import EventBusTriggers from "@core/enums/event-bus/EventBusTriggers";

import { CustomerClubLevels } from "@core/enums/customer/CustomerClubLevels";
import { CurrencyHelper } from "@core/helper/currency/CurrencyHelper";
import { PriceHelper } from "@core/helper/price/PriceHelper";
import { LogesticHelper } from "@core/helper/logistic/LogesticHelper";
import { GiftStatus } from "@core/enums/wallet/gift/GiftStatus";
import { GiftStProgramTypes } from "@core/enums/wallet/gift/GiftStProgramTypes";
import { MapHelper } from "@core/helper/map/MapHelper";
import numeral from "numeral";
import _ from "lodash-es";
//―――――――――――――――――――――― Event Bus ――――――――――――――――――――
import { EventBus, EventName } from "@core/events/EventBus";

//―――――――――――――――――――――― Country ――――――――――――――――――――

import { getCountryName } from "@core/enums/country/country-list";
import type { Note } from "@core/models/shop/note/note.model";
import { Shop } from "@core/models/shop/shop.model";
import type { ProductVariant } from "@core/models/shop/product/product_variant.model";
import { Product } from "@core/models/shop/product/product.model";
import { XapiShop } from "@sdk-storefront/shop/XapiShop";
import type { Basket } from "@core/models/shop/order/basket/basket.model";
import type { IAddress } from "@core/models/traits/address.model";
import type { CommunityTopic } from "@core/models/community/community.topic.model";
import type { CommunityPost } from "@core/models/community/community.post.model";
import type { CommunityComment } from "@core/models/community/community.comment.model";
import type { Guild } from "@core/models/guild/guild.model";
import type { IOrder } from "@core/models/traits/order.model";
import type { Avocado } from "@core/models/shop/order/avocado/avocado.order";
import type { IReturn } from "@core/types/route/return.type";
import type { ICountryCode } from "@core/enums/country/CountriesListEnum";
import type { BasketItem } from "@core/models/shop/order/basket/basket_item.model";
import type { gapi } from "@core/gapi/requests/gapi.countries.get";
import type { User } from "@core/models/user/user.model";
import { XapiUser } from "@sdk-storefront/user/XapiUser";

//――― User Device Preferences ―――
let IMAGE_SIZE_SMALL = localStorage.getItem("boost-mode") ? 64 : 128; // Can be 64 (low speed networks) or 128

function isString(value: any): value is string {
  if (!value) return true;
  return typeof value === "string" || value instanceof String;
}

const CoreMixin: VueConstructor<Vue> = Vue.extend({
  data() {
    return {
      // Customizable theme:
      SaminColorLight: window.CUSTOME_TEMPLATE
        ? window.CUSTOME_TEMPLATE.color_light
        : SetupService.SaminColorLight(), //"#70557e"
      SaminColorDark: window.CUSTOME_TEMPLATE
        ? window.CUSTOME_TEMPLATE.color_dark
        : SetupService.SaminColorDark(), //"#3a2c41"
      SaminColorDarkDeep: window.CUSTOME_TEMPLATE
        ? window.CUSTOME_TEMPLATE.color_deep
        : SetupService.SaminColorDarkDeep(), //"#261b2d"
      SaminInfoColor: window.CUSTOME_TEMPLATE
        ? window.CUSTOME_TEMPLATE.color_info
        : SetupService.SaminInfoColor(), //   "#9964e3"

      EventBus: EventBus,

      ProductType: ProductType,

      PhysicalOrderStates: PhysicalOrderStates,

      Scopes: Scopes,

      //  CONFIGS:
      /** @deprecated This data property is deprecated. */
      SUB_TOOLBAR_CONFIG: {
        flat: true,
        color: "transparent",
        class: "overflow-x-auto overflow-y-hidden thin-scroll",
        "min-height": "84px",
      },

      //――― Images ―――
      IMAGE_SIZE_SMALL: IMAGE_SIZE_SMALL,
      IMAGE_SIZE_BLOG: 256,

      //――― Validation Rules ―――
      GlobalRules: GlobalRules,

      SetupService: SetupService,
    };
  },
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },
    is_standalone() {
      // Detects if device is in standalone mode
      const isInWebAppiOS = window.navigator.standalone === true;

      let isInWebAppChrome = false;
      try {
        isInWebAppChrome = window.matchMedia(
          "(display-mode: standalone)"
        ).matches;
      } catch (e) {}

      return isInWebAppiOS || isInWebAppChrome;
    },
  },

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
        (this.$options?.data as () => Array<any>)?.call(this)
      );
    },

    //―――――――――――――――――――――― Get Countries List ――――――――――――――――――――
    fetchCountries(
      callback?: (countries: gapi.countries.get.ICountry[]) => void
    ) {
      const fun = _.debounce((callback = null) => {
        const countries = this.$store.getters.getCountries;
        if (countries && countries.length) {
          if (callback) callback(countries);
        }
        console.log("⏺ Fetch countries...");

        window.$selldone.gapi.fetchCountries().then((countries) => {
          this.$store.commit("setCountries", countries);
          if (callback) callback(countries);
        });
      }, 1000);

      fun(callback);
    },

    //―――――――――――――――――――――― 🌍 Time ▶ Get local time ――――――――――――――――――――

    /**
     *
     * @param datetimeStr
     * @returns {Date}
     */
    convertToLocalTime: function convertToLocalTime(datetimeStr: string) {
      return DateConverter.convertToLocalTime(datetimeStr);
    },

    /*  convertLocalTimeToUTC: function convertLocalTimeToUTC(datetimeStr) {
          return DateConverter.convertLocalTimeToUTC(datetimeStr);
        },*/

    getLocalTimeStringSmall: function getLocalTimeStringSmall(
      datetimeStr: string | number
    ) {
      if (!datetimeStr) return "";
      try {
        const options = {
          calendar: window.$language?.calendar.calendar,
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          year: "numeric",
          hour12: true,
        } as Intl.DateTimeFormatOptions;
        return Intl.DateTimeFormat(
          window.$language?.full_local,
          options
        ).format(new Date(datetimeStr));
      } catch (e) {
        console.error(e);
      }
    },
    getLocalDateString: function getLocalDateString(
      datetimeStr: string | null
    ) {
      if (!datetimeStr) return "";
      try {
        const options = {
          calendar: window.$language?.calendar.calendar,
          day: "numeric",
          month: "long",
          year: "numeric",
        } as Intl.DateTimeFormatOptions;
        return Intl.DateTimeFormat(
          window.$language?.full_local,
          options
        ).format(new Date(datetimeStr));
      } catch (e) {
        console.error(datetimeStr, e);
      }
    },
    getLocalTimeOnlyString: function getLocalDateString(
      datetimeStr: string | null
    ) {
      if (!datetimeStr) return "";
      try {
        const options = {
          calendar: window.$language?.calendar.calendar,
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        } as Intl.DateTimeFormatOptions;
        return Intl.DateTimeFormat(
          window.$language?.full_local,
          options
        ).format(new Date(datetimeStr));
      } catch (e) {
        console.error(datetimeStr, e);
      }
    },

    getLocalTimeString: function getLocalTimeString(
      datetimeStr: string,
      isShort = false,
      isMicro = false,
      noTime = false
    ) {
      return DateConverter.GetLocalTimeString(
        datetimeStr,
        0,
        isShort,
        isMicro,
        noTime
      );
    },

    getLocalTimeStringAddedSeconds: function getLocalTimeStringAddedSeconds(
      datetimeStr: string,
      added_seconds: number,
      isShort = false,
      isMicro = false,
      noTime = false
    ) {
      return DateConverter.GetLocalTimeString(
        datetimeStr,
        added_seconds,
        isShort,
        isMicro,
        noTime
      );
    },

    getFromNowString: function getFromNowString(
      datetimeStr: string,
      local = null,
      abstract = false
    ) {
      return DateConverter.getFromNowString(datetimeStr, local, abstract);
    },

    getFromOtherTimeString: function getFromOtherTimeString(
      datetimeStr: string,
      datetime_end: string
    ) {
      return DateConverter.getFromOtherTimeString(datetimeStr, datetime_end);
    },

    getDurationOtherTimeString: function getDurationOtherTimeString(
      datetimeStr: string,
      datetime_end: string
    ) {
      return DateConverter.getDurationOtherTimeString(
        datetimeStr,
        datetime_end
      );
    },

    isToday: function isToday(created_at: string) {
      return DateConverter.isToday(created_at);
    },
    inDayRange: function inDayRange(
      created_at: string,
      days: number,
      offset = 0
    ) {
      return DateConverter.inDayRange(created_at, days, offset);
    },

    /**
     *
     * @param datetimeStr
     * @returns {string|null}
     */
    convertLocalTimeStringToUTCString:
      function convertLocalTimeStringToUTCString(datetimeStr: string) {
        if (!datetimeStr) return null;

        const date = new Date(datetimeStr);
        if (!date) return null;

        //console.log('------->',date.toISOString(),date.toUTCString())
        return date.toISOString();
      },

    /**
     *
     * @param datetimeStr
     * @returns {string|null}
     */
    convertUTCStringToLocalTimeString:
      function convertUTCStringToLocalTimeString(datetimeStr: string) {
        if (!datetimeStr) return null;

        const date = DateConverter.convertToLocalTime(datetimeStr);
        if (!date) return null;
        //  console.log('---->',date.toLocaleString(),moment(date).format("YYYY-MM-DD HH:mm:ss"))
        return date.toLocaleString();

        // return moment(date).format("YYYY-MM-DD HH:mm:ss");
      },

    //―――――――――――――――――――――― 🌍 Number ――――――――――――――――――――

    /* ConvertNumberToPlainText(number) {
          return Num2persian(number);
        },*/
    ConvertNumberToPersian: function ConvertNumberToPersian(
      digit: string | number
    ) {
      digit = "" + digit;
      return digit.replace(/\d+/g, function (digit) {
        let ret = "";
        for (let i = 0, len = digit.length; i < len; i++) {
          ret += String.fromCharCode(digit.charCodeAt(i) + 1728);
        }

        return ret;
      });
    },

    //―――――――――――――――――――――― 🌍 Time ▶ Get Currency ――――――――――――――――――――

    getCurrencyName: function getCurrencyName(
      currency_code: keyof typeof Currency
    ) {
      if (!currency_code) return "";

      return this.$t(Currency[currency_code].name);
    },

    //―――――――――――――――――――――― 🌍 Status ――――――――――――――――――――

    getStatusString(status: string) {
      if (!status) return "";
      if (status === "Unpaid") return this.$t("global.status.unpaid");
      else if (status === "Paid" || status === "Payed")
        return this.$t("global.status.paid");
      else if (status === "Canceled") return this.$t("global.status.canceled");
      else if (status === "Completed")
        return this.$t("global.status.completed");
      else if (status === "Reserved") return this.$t("global.status.reserved");
      else if (status === "COD") return this.$t("global.status.COD");
      else if (status === "Sold") return this.$t("global.status.sold");
      else if (status === "Open") return this.$t("global.status.open");
      else if (status === "Cancel") return this.$t("global.status.cancel");
      else if (status.toLowerCase() === "accept")
        return this.$t("global.status.accept");
      else if (status.toLowerCase() === "reject")
        return this.$t("global.status.reject");
      else if (status.toLowerCase() === "pending")
        return this.$t("global.status.pending");
    },

    getStatusColor(status: string) {
      if (!status) return "#444";
      if (status === "Unpaid") return "#FFA000";
      else if (status === "Paid" || status === "Payed") return "green";
      else if (status === "Canceled") return "#D32F2F";
      else if (status === "Completed") return "#00796B";
      else if (status === "Reserved") return "#FFA000";
      else if (status === "COD") return "#1976D2";
      else if (status === "Sold") return "#00796B";
      else if (status === "Open") return "#1976D2";
      else if (status === "Cancel") return "#D32F2F";
    },
    getStatusIcon(status: string) {
      if (!status) return "";
      if (status === "Unpaid") return "fas fa-question ";
      else if (status === "Paid" || status === "Payed") return "fas fa-check ";
      else if (status === "Canceled") return "fas fa-times ";
      else if (status === "Completed") return "fas fa-check-double ";
      else if (status === "Reserved") return "fas fa-hourglass-start ";
      else if (status === "COD") return "fas fa-hand-holding-usd";
    },

    getDeliveryStateString(state: keyof typeof PhysicalOrderStates | null) {
      if (!state) return "";
      return this.$t(PhysicalOrderStates[state].name);
    },

    getDeliveryStateIcon(state: string | null) {
      if (!state) return "";
      return this.PhysicalOrderStates[state].icon;
    },

    //―――――――――――――――――――――― ⚠ Show Alerts ――――――――――――――――――――

    showErrorAlert(
      title: string | null,
      message: string | null = null,
      detail: string | null = null,
      duration: number = 6000
    ) {
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
      img = null
    ) {
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
      duration = 30000
    ) {
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
      callback: () => void
    ) {
      this.EventBus.$emit("alert-dialog", {
        title,
        message,
        accept,
        reject: this.$t("global.actions.cancel"),
        callback,
        color: "red",
      });
    },

    openConfirmationAlert(
      title: string,
      message: string,
      accept: string,
      callback: () => void
    ) {
      this.EventBus.$emit("alert-dialog", {
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

      this.EventBus.$emit("alert-dialog", {
        title,
        message,
        accept,
        reject: this.$t("global.actions.cancel"),
        callback,
        color: "red",
      });
    },

    //―――――――――――――――――――――― Global Shop Note Dialog ――――――――――――――――――――

    showGlobalShopNoteDialog(
      notes: Note.INote[],
      element_id: string,
      page_id: string | number,
      popup_id: string | number
    ) {
      this.EventBus.$emit("show:GlobalShopNoteDialog", {
        notes,
        element_id,
        page_id,
        popup_id,
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
      to: keyof typeof Currency
    ) {
      return PriceHelper.getExchangeRate(shop, from, to);
    },

    getExchangeRateValue(
      shop: Shop,
      from: keyof typeof Currency,
      to: keyof typeof Currency,
      default_rate?: number | null
    ) {
      return PriceHelper.getExchangeRateValue(shop, from, to, default_rate);
    },

    // Used for convert product prices to (to_currency).
    getBuyRateValue(
      shop: Shop,
      from_currency: keyof typeof Currency,
      to_currency: keyof typeof Currency
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

    getProductTypeImage(type: string) {
      if (type === "POS")
        return require("@components/assets/icons/pos-order-type.svg");
      else if (type === "FUL")
        return require("@components/assets/icons/dropshipping.svg");
      else if (type === "AVO")
        return require("@components/assets/icons/avocado.svg");
      else if (type === "HYP")
        return require("@components/assets/icons/hyper.svg");

      return ProductType[type] ? ProductType[type].image : "";
    },
    getBasketTypeImage(type: string) {
      if (type === "POS")
        return require("@core/enums/product/assets/product-types/basket-pos.svg");
      else if (type === "FUL")
        return require("@core/enums/product/assets/product-types/basket-drop-shipping.svg");
      else if (type === "AVO")
        return require("@core/enums/product/assets/product-types/basket-avocado.svg");
      else if (type === "HYP")
        return require("@core/enums/product/assets/product-types/basket-hyper.svg");

      return ProductType[type] ? ProductType[type].basket : "";
    },
    //―――――――――――――――――――――― Replace updated item in array ――――――――――――――――――――

    FindItemByID: function UpdateItemByID(
      items: [],
      item_id: number | string,
      id: string = "id"
    ) {
      if (!items) return null;
      return items.find((element) => element[id] === Number(item_id));
    },
    FindItemByKeyValue: function <T extends object, K extends keyof T>(
      items: T[],
      item_value: T[K],
      item_key: K
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
      id_key: keyof T = "id" as keyof T
    ): void {
      const foundIndex = items.findIndex(
        (element) => element[id_key] === item_id
      );
      if (foundIndex >= 0) items.splice(foundIndex, 1);
    },

    AddOrUpdateItemByID: function <T extends Record<string, any>>(
      items: T[],
      item: T,
      id_key = "id",
      add_to_end = true
    ) {
      if (!item || !items) return null;
      const foundIndex = items.findIndex(
        (element) => element[id_key] === item[id_key]
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
      id_key: string = "id"
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
    slugify: function slugify(text: string | null) {
      if (!text) return "";

      return (
        text
          .toString()
          .toLowerCase()
          .replace(/\s+/g, "-") // Replace spaces with -
          //   .replace(/[^\w\-]+/gu, "") // Remove all non-word chars
          .replace(/[^\u0100-\uFFFF\w\-]/g, "-") // Remove all non-word chars ( fix for UTF-8 chars )
          .replace(/\-\-+/g, "-") // Replace multiple - with single -
          .replace(/^-+/, "") // Trim - from start of text
          .replace(/-+$/, "")
      ); // Trim - from end of text
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
      return getCountryName(code);
    },

    //―――――――――――――――――――――― Device Image ――――――――――――――――――――

    getBrowserImage(code: string) {
      if (!code) return null;
      code = code.toLowerCase();
      if (code === "firefox")
        return require("@components/assets/tradmark/firefox.svg");
      if (code === "chrome")
        return require("@components/assets/tradmark/chrome.svg");
      if (code === "opera")
        return require("@components/assets/tradmark/opera.svg");
      if (code === "internet-explorer")
        return require("@components/assets/tradmark/internet-explorer.svg");
      if (code === "safari")
        return require("@components/assets/tradmark/safari.svg");
      else return require("@components/assets/tradmark/information.svg");
    },

    //―――――――――――――――――――――― Basket > Reject ――――――――――――――――――――

    getReturnRequestStateObject(state: keyof typeof ReturnItemStates) {
      const out = ReturnItemStates[state];
      return out ? out : {};
    },

    //―――――――――――――――――――――― Currency ――――――――――――――――――――

    GetCurrency(currency: keyof typeof Currency) {
      if (!currency) return null;
      return Currency[currency];
    },

    /**
     *
     * @param currency String
     * @constructor
     */
    SetUserSelectedCurrency(currency: ICurrency | keyof typeof Currency) {
      if (!isString(currency)) currency = (currency as ICurrency).code;

      return CurrencyHelper.SetUserSelectedCurrency(this, currency); // getShop() : Only in shop view.
    },

    /**
     *
     * @returns {ICurrency}
     * @constructor
     */
    GetUserSelectedCurrency(): ICurrency {
      return CurrencyHelper.GetUserSelectedCurrency(this);
    },

    /**
     *
     * @returns {number}
     * @constructor
     */
    GetUserSelectedCurrencyFactor(
      opt_currency: ICurrency | keyof typeof Currency | null = null
    ): number {
      if (!isString(opt_currency))
        opt_currency = (opt_currency as ICurrency).code;

      return CurrencyHelper.GetUserSelectedCurrencyFactor(this, opt_currency);
    },
    /**
     *
     * @returns {String}
     * @constructor
     */
    GetUserSelectedCurrencyName(
      opt_currency: ICurrency | keyof typeof Currency | null = null,
      unicode = false
    ): String {
      if (!isString(opt_currency))
        opt_currency = (opt_currency as ICurrency).code;

      return this.$t(
        CurrencyHelper.GetUserSelectedCurrencyName(this, opt_currency, unicode)
      ) as string;
    },
    /**
     * @return {number}
     */
    GetUserSelectedCurrencyFloats(
      opt_currency: ICurrency | keyof typeof Currency | null = null
    ) {
      if (!isString(opt_currency))
        opt_currency = (opt_currency as ICurrency).code;

      return CurrencyHelper.GetUserSelectedCurrencyFloats(this, opt_currency);
    },

    /**
     *
     * @returns {number}
     * @constructor
     */
    GetUserSelectedCurrencyRoundFactor(
      opt_currency: ICurrency | keyof typeof Currency | null = null
    ) {
      if (!isString(opt_currency))
        opt_currency = (opt_currency as ICurrency).code;

      return CurrencyHelper.GetUserSelectedCurrencyRoundFactor(
        this,
        opt_currency
      );
    },

    /**
     *
     * @returns {string}
     * @constructor
     */
    GetUserSelectedCurrencyFormat(
      opt_currency: ICurrency | null | string = null
    ) {
      if (opt_currency && !isString(opt_currency))
        opt_currency = (opt_currency as ICurrency).code;

      return CurrencyHelper.GetUserSelectedCurrencyFormat(this, opt_currency);
    },

    truncate(num: number, places: number) {
      return Math.trunc(num * Math.pow(10, places)) / Math.pow(10, places);
    },

    getFormatPriceCurrency(price: number, currency: keyof typeof Currency) {
      return new Intl.NumberFormat(window.$language?.full_local, {
        style: "currency",
        currency: currency,
      }).format(price);
    },

    /**
     *
     * @param amount
     * @param currency
     * @param local
     * @returns {string}   $xx.xx
     * @constructor
     */
    ConvertPriceToString(
      amount: number,
      currency: keyof typeof Currency,
      local: string = "en-US"
    ) {
      return CurrencyHelper.ConvertToString(amount, currency, local);
    },
    //―――――――――――――――――――――― Price ――――――――――――――――――――

    FixPrecision(val: number, floats: number) {
      return parseFloat(val.toFixed(floats));
    },

    getAmountAfterPoint(amount: number) {
      return amount
        .toString()
        .replace(/^[^.]+/, "")
        .substring(0, 6);
    },

    getBasketItemPrice(shop: Shop, item: BasketItem) {
      // Final price saved in basket item (no need to apply discount and commission!)
      const to_currency = this.GetUserSelectedCurrency().code;
      return PriceHelper.getBasketItemPrice(shop, item, to_currency);
    },

    getBasketItemSumPriceDiscount(shop: Shop, item: BasketItem) {
      const to_currency = this.GetUserSelectedCurrency().code;
      return PriceHelper.getBasketItemSumPriceDiscount(shop, item, to_currency);
    },

    /**
     * Get product price (final price)
     * @param shop
     * @param product         Original product : in normal mode | Vendor product : in marketplace mode
     * @param variant
     * @param preferences     Preferences by user (Used in valuation - custom pricing input)
     * @param valuation       Valuation (Pricing forms), Get independently because in marketplace mode we receive vendor product instead of original product.
     * @returns {number}
     */
    CalcPriceProductCurrentCurrency(
      shop: Shop,
      product: Product,
      variant: ProductVariant | null = null,
      preferences = null,
      valuation = null,
      subscription_price = null, // 🎗️ Subscription
      current_extra_pricing = null // 🌸 Add extra pricing 🌸
    ) {
      //console.log('CalcPriceProductCurrentCurrency',product,variant)
      const to_currency = this.GetUserSelectedCurrency().code;
      return this.priceProductByCurrency(
        shop,
        product,
        variant,
        to_currency,
        preferences,
        valuation,
        subscription_price,
        current_extra_pricing
      );
    },
    priceProductByCurrency(
      shop: Shop,
      product: Product,
      variant: ProductVariant | null = null,
      to_currency: keyof typeof Currency,
      preferences = null,
      valuation = null,
      subscription_price = null, // 🎗️ Subscription
      current_extra_pricing = null // 🌸 Add extra pricing 🌸
    ) {
      try {
        return PriceHelper.priceProductByCurrency(
          shop,
          product,
          variant,
          to_currency,
          preferences,
          valuation,
          subscription_price,
          current_extra_pricing
        );
      } catch (e) {
        console.error(
          e,
          "⚡ To address the issue, navigate to Shop > Accounting > Exchange > Add Exchange Rate."
        );
        return "🚨";
      }
    },

    /**
     * Calculate discount (final & check date of discount)
     * @param shop
     * @param product
     * @param variant
     * @returns {*}
     */
    getProductDiscountAmount(shop: Shop, product: Product, variant = null) {
      const to_currency = this.GetUserSelectedCurrency().code;
      return this.getProductDiscountAmountByCurrency(
        shop,
        product,
        variant,
        to_currency
      );
    },
    getProductDiscountAmountByCurrency(
      shop: Shop,
      product: Product,
      variant: ProductVariant | null = null,
      to_currency: keyof typeof Currency
    ) {
      try {
        return PriceHelper.getProductDiscountAmountByCurrency(
          shop,
          product,
          variant,
          to_currency
        );
      } catch (e) {
        console.error(e);
        return "🚨";
      }
    },

    discountProductPercent(
      shop: Shop,
      product: Product,
      variant: ProductVariant | null = null,
      to_currency?: keyof typeof Currency | null
    ) {
      if (!to_currency) to_currency = product.currency; // It's percent!

      return PriceHelper.discountProductPercent(
        shop,
        product,
        variant,
        to_currency!
      );
    },

    leadProduct(product: Product, variant: ProductVariant | null = null) {
      if (!product) return 0;

      if (variant && variant.lead > 0) {
        return variant.lead;
      }
      return product.lead;
    },

    HasDiscountCountDownMode(
      product: Product,
      variant: ProductVariant | null = null
    ) {
      return PriceHelper.HasDiscountCountDownMode(product, variant);
    },

    GetEndOfDiscountDate(
      product: Product,
      variant: ProductVariant | null = null
    ) {
      return PriceHelper.GetEndOfDiscountDate(product, variant);
    },

    //―――――――――――――――――――――― Event Bus ――――――――――――――――――――

    /**
     * Map: Only in Samin!
     */
    showMap(
      center: XapiShop.ILocation,
      mode: string,
      location: Basket.IReceiverInfo,
      selectCallback: () => void,
      viewOnly: boolean = false
    ) {
      this.EventBus.$emit(EventName.SHOW_MAP, {
        center,
        mode,
        location,
        selectCallback,
        viewOnly,
      });
    },
    closeMap() {
      this.EventBus.$emit(EventName.HIDE_MAP);
    },

    generateFullAddress(info_object: IAddress) {
      return MapHelper.GenerateFullAddressFromMapInfo(info_object);
    },

    NeedLogin() {
      this.EventBus.$emit("need-login", true);
    },

    //―――――――――――――――――――――― Fullscreen ――――――――――――――――――――

    // Fullscreen by animation
    showFullscreen(event: MouseEvent) {
      this.EventBus.$emit("show:fullscreen", event);
    },

    //―――――――――――――――――――――― Community global ――――――――――――――――――――
    showCommunityUserProfile(profile: UserProfile) {
      this.EventBus.$emit("community:show-profile", { profile });
    },
    showCommunitySharePost(
      activator: Element,
      shop: Shop,
      topic: CommunityTopic,
      post: CommunityPost
    ) {
      this.EventBus.$emit("community:share:post", {
        activator,
        shop,
        topic,
        post,
      });
    },

    showCommunityPostReactions(post: CommunityPost, reaction: string) {
      this.EventBus.$emit("community:show-post-reactions", { post, reaction });
    },

    showCommunityPostInsights(post: CommunityPost) {
      this.EventBus.$emit("community:show-post-insights", { post });
    },

    showCommunityPostActionsMenu(
      activator: Element,
      topic: CommunityTopic,
      post: CommunityPost,
      delete_callback: () => void
    ) {
      this.EventBus.$emit("community:post-actions-menu", {
        activator,
        topic,
        post,
        delete_callback,
      });
    },

    showCommunityPostReportsMenu(post: CommunityPost) {
      this.EventBus.$emit("community:show-post-reports", { post });
    },

    showCommunityCommentActionsMenu(
      activator: Element,
      shop: Shop,
      post: CommunityPost,
      comment: CommunityComment,
      delete_callback: () => void
    ) {
      this.EventBus.$emit("community:comment-actions-menu", {
        activator,
        shop,
        post,
        comment,
        delete_callback,
      });
    },

    showCommunityCommentReportsMenu(comment: CommunityComment) {
      this.EventBus.$emit("community:show-comment-reports", { comment });
    },
    //―――――――――――――――――――――― Community global >Analytics ――――――――――――――――――――

    onCommunityPostImpression(topic: CommunityTopic, post: CommunityPost) {
      this.EventBus.$emit("community:analytics:post:impression", {
        topic,
        post,
      });
    },
    onCommunityPostShare(topic: CommunityTopic, post: CommunityPost) {
      this.EventBus.$emit("community:analytics:post:share", { topic, post });
    },
    onCommunityPostEmbed(topic: CommunityTopic, post: CommunityPost) {
      this.EventBus.$emit("community:analytics:post:embed", { topic, post });
    },
    onCommunityPostView(topic: CommunityTopic, post: CommunityPost) {
      this.EventBus.$emit("community:analytics:post:view", { topic, post });
    },

    //―――――――――――――――――――――― Guild global ――――――――――――――――――――
    showGuildSharePost(activator: Element, guild: Guild) {
      this.EventBus.$emit("guild:share", { activator, guild });
    },

    //―――――――――――――――――――――― Page builder global ――――――――――――――――――――
    /**
     * Close all except indicated code! (Almost we call it when a new tool open, and we want to close all other menus)
     * @constructor
     */
    CloseAllPageBuilderNavigationDrawerTools() {
      this.EventBus.$emit(EventBusTriggers.PAGE_BUILDER_CLOSE_TOOLS);
    },
    onPageBuilderStyleOpen(type: StylerType, show: boolean) {
      this.EventBus.$emit(EventBusTriggers.PAGE_BUILDER_STYLER_OPEN, {
        type,
        show,
      });
    },

    //―――――――――――――――――――――― Logistic > Basket Helpers ――――――――――――――――――――
    getBasketOrderCode(basket: IOrder) {
      if (basket.type === "AVO") {
        return `AVO-${basket.id}`;
      } else if (basket.type === "FUL") {
        return `DS-${basket.id}`;
      } else if (basket.type === "POS") {
        return `POS-${basket.id}`;
      } else if (basket.type === "HYP") {
        return `HYP-${basket.id}`;
      } else if (basket.type === "BILL") {
        return `BILL-${basket.id}`;
      }

      const productType = ProductType[basket.type];
      if (!productType) return basket.id;
      return productType.basket_code + "-" + basket.id;
    },
    getBasketOrderImage(basket: Basket) {
      const productType = ProductType[basket.type];
      if (!productType) return null;
      return productType.image;
    },

    calculateWeightBasket(basket: Basket) {
      return LogesticHelper.calculateWeightBasket(basket);
    },

    calculateVolumeBasket(basket: Basket) {
      return LogesticHelper.calculateVolumeBasket(basket);
    },

    calculateDistanceBasket(
      origin: XapiShop.ILocation,
      target: XapiShop.ILocation
    ) {
      return LogesticHelper.calculateDistanceBasket(origin, target);
    },
    GPSCalculateDistance(
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ) {
      return LogesticHelper.GPSCalculateDistance(lat1, lon1, lat2, lon2);
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
    /* EnablePushNotification() {
          PushNotification.AskForPermission();
        },*/

    //―――――――――――――――――――――― Copy Clipboard (Bug fixed in dialog) ――――――――――――――――――――

    copyToClipboard(
      str: string,
      title: string | null = null,
      message: string = "Copied successfully."
    ) {
      //console.log('copyToClipboard',str)
      const el = document.createElement("textarea");
      el.addEventListener("focusin", (e) => e.stopPropagation());
      el.value = str;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      this.showSuccessAlert(title, message);
    },

    //―――――――――――――――――――――― Laravel validation error handler ――――――――――――――――――――

    showLaravelError(
      error: string | { error: true; error_msg: string; code?: number } | any
    ) {
      if (!error) return;
      if (this.isString(error)) {
        this.showErrorAlert(
          this.$t("global.notification.error") as string,
          error
        );
        return;
      }

      if (error?.error_msg /*Errors in the response with 2xx code*/) {
        this.showErrorAlert(
          this.$t("global.notification.error") as string,
          error.error_msg
        );
        return;
      }

      if (!error.response) {
        console.error("1- error", error);
        if (error.message) {
          this.showErrorAlert(
            this.$t("global.notification.error") as string,
            `<div dir="ltr" class="text-left">${error.message}</div>`
          );
        } else if (error.body) {
          this.showErrorAlert(
            this.$t("global.notification.error") as string,
            `<div dir="ltr" class="text-left">${error.body}</div>`
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
          60000
        );
        return;
      }

      const data = error.response.data;
      console.error(
        "2- data",
        error.response.status,
        data,
        "response",
        error.response
      );

      if (data?.error_msg) {
        // Normal laravel app level errors
        this.showErrorAlert(
          this.$t("global.notification.error") + " " + data.code,
          `<div class="text-start">${data.error_msg}</div>`
        );
      } else if (data?.errors) {
        let error_msg = "";

        for (const key in data.errors) {
          const val = data.errors[key]; //is array
          //  error_msg += `<b>${key}:</b>`;

          if (Array.isArray(val)) {
            val.forEach((er) => {
              error_msg += `<li>${er}</li>`;
            });
          }
        }
        this.showErrorAlert(
          this.$t("global.notification.error") + " " + error.response.status,
          `<div class="text-start">${error_msg}</div>`
        );
      } else if (data?.message) {
        this.showErrorAlert(
          this.$t("global.notification.error") + " " + error.response.status,
          `<div class="text-start">${data.message}</div>`
        );
      } else {
        this.showErrorAlert(
          this.$t("global.notification.error") + " " + error.response.status,
          this.$t("global.notification.error_message") as string
        );
      }
    },

    FormatNumberCurrency(
      _value: number,
      _currency: keyof typeof Currency | ICurrency | null = null
    ) {
      const currency_obj =
        _currency && _currency instanceof Object
          ? _currency
          : _currency
          ? Currency[_currency]
          : this.GetUserSelectedCurrency();

      if (!currency_obj) return `${_currency} Not exist 🚨!`;
      const value =
        _value * (currency_obj.alt_factor ? currency_obj.alt_factor : 1);

      return numeral(value).format(currency_obj.format);
    },

    //―――――――――――――――――――――― Enums ――――――――――――――――――――

    getCustomerClubLevel(level: keyof typeof CustomerClubLevels) {
      return CustomerClubLevels[level];
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
      lang: T
    ): T extends string ? ILanguage : null {
      if (!lang) return null as any;
      if (Language[lang]) return Language[lang] as any;

      const result = Object.values(Language).find(
        (l) => l.code.toLowerCase() === lang!.toLowerCase()
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
        window.$language
      );
    },

    //―――――――――――――――――――――― Global Dimensions ――――――――――――――――――――
    getBoxSizeDimension() {
      return this.$t("global.dimensions.cm");
    },
    getDistanceDimension() {
      return this.$t("global.dimensions.km");
    },
    getWeightDimension() {
      return this.$t("global.dimensions.kg");
    },

    //―――――――――――――――――――――― Color ――――――――――――――――――――
    GetNameOfColor(color: string | null) {
      if (!color || !this.isString(color)) return null;

      const colors = ColorHelper.ExtractColors(color);
      return colors
        ?.map((color) =>
          ColorHelper.getNameOfColor(this.$t("global.colors") as {}, color)
        )
        .join(" / ");

      //return ColorHelper.getNameOfColor(this.$t("global.colors"), color);
    },
    getName(val: any) {
      if (!val) return "";
      if (!this.isString(val)) val = "" + val;

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
    setBoostMode(boost_mode: boolean) {
      if (boost_mode) localStorage.setItem("boost-mode", "true");
      else localStorage.removeItem("boost-mode");
      IMAGE_SIZE_SMALL = boost_mode ? 64 : 128;
    },

    getShopIcon(shop_id: number | string, size = IMAGE_SIZE_SMALL) {
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

    getCategoryIcon(category_id: string | number, size = IMAGE_SIZE_SMALL) {
      return window.CDN.GET_CATEGORY_ICON(category_id, size);
    },
    getProductImage(product_id: string | number, size = IMAGE_SIZE_SMALL) {
      return window.CDN.GET_PRODUCT_IMAGE(product_id, size);
    },
    getDeliveryServiceIcon(
      delivery_service_id: string | number,
      size = IMAGE_SIZE_SMALL
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
      file_name: string
    ) {
      return window.CDN.GET_SHOP_3D_MODEL_PATH(
        shop_name,
        product_id,
        variant_id,
        folder_name,
        file_name
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

    setCookieAccept(active: boolean) {
      // @ts-ignore
      if (this.preview) return; // Maybe exists in the component (preview in seller dashboard)

      // GDPR: Save in local storage if user not login!
      if (!active) localStorage.setItem(`GDPR-Cookie`, "false");
      else localStorage.setItem(`GDPR-Cookie`, "true");
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
      data_uri = "data:text/plain;charset=utf-8,"
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
        item.ex.includes(extension as string)
      );
      return out
        ? out.src
        : require("@core/enums/file/assets/extensions/file.svg");
    },

    //―――――――――――――――――――――― Remove item from array by value ――――――――――――――――――――

    remove<T>(array: T[], valueToRemove: T) {
      const foundIndex = array.findIndex(
        (element) => element === valueToRemove
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
      path: string = ""
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
        this.$vuetify.goTo(0, {
          duration: 800,
          offset: 0,
          easing: "easeInOutQuad",
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
        low_vision ? "16px" : "",
        "important"
      );
    },

    //―――――――――――――――――――――― Download Blob File ――――――――――――――――――――
    DownloadBlobFile(data: any, headers: { [key: string]: string }) {
      // Get file name:
      const headerLine = headers["content-disposition"];
      const startFileNameIndex = headerLine.lastIndexOf("=") + 1;
      let filename = headerLine.substring(startFileNameIndex);
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
        (it) => it.code.toLowerCase() === social.toLowerCase()
      );
      return found ? found.image : null;
    },

    // ――――― Article Editor Container ―――――

    ShowCodeEditorGlobalDialog(
      code: string,
      language: keyof typeof Language,
      callback: () => void,
      deleteCallback: () => void,
      masterId = null /*Point which dialog open!*/
    ) {
      this.EventBus.$emit(EventName.ARTICLE_CODE_EDITOR_SHOW, {
        code,
        language,
        callback,
        deleteCallback,
        masterId,
      });
    },

    ShowFlipBookGlobalDialog(
      pack: any,
      callback: () => void,
      deleteCallback: () => void,
      tab = null,
      masterId = null /*Point which dialog open!*/
    ) {
      this.EventBus.$emit(EventName.ARTICLE_FLIP_BOOK_SHOW, {
        pack,
        callback,
        deleteCallback,
        tab,
        masterId,
      });
    },
    ShowImagesCompareGlobalDialog(
      pack: any,
      callback: () => void,
      deleteCallback: () => void,
      tab = null,
      masterId = null /*Point which dialog open!*/
    ) {
      this.EventBus.$emit(EventName.ARTICLE_COMPARE_IMAGES_SHOW, {
        pack,
        callback,
        deleteCallback,
        tab,
        masterId,
      });
    },

    //――――――――――――――――――――――――― Home Image Helper ―――――――――――――――――――――――――
    GetDomainHomeIcon: function (home: string) {
      return home === "shop"
        ? require("@components/assets/icons/store.svg")
        : home === "avocado"
        ? require("@components/assets/icons/avocado.svg")
        : home === "blog"
        ? require("@components/assets/icons/blog.svg")
        : home === "hyper"
        ? require("@components/assets/icons/hyper.svg")
        : home === "community"
        ? require("@components/assets/icons/community.png")
        : home === "map"
        ? require("@components/assets/icons/map-tag.svg")
        : ("" + home).startsWith("/")
        ? require("@components/assets/icons/static-pages.svg")
        : home
        ? require("@components/assets/icons/landing-page.svg")
        : require("@components/assets/icons/store.svg");
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

    //―――――――――――――――――――――― Route ――――――――――――――――――――

    /**
     * Build return route to highlight last selected item on return to orders list , etc.
     *
     * @param default_route_name
     * @param  RETURN                  {name,params,KEEP (item id to highlight),...other statuses}
     * @returns {{name: *, params: any}}
     */
    buildReturnRoute(default_route_name: string, RETURN: IReturn | null) {
      RETURN = RETURN ? Object.assign({}, RETURN) : null; // Make a clone!
      // Important: STATE on params may exist! So override it after get RETURN.params!
      const params =
        RETURN && RETURN.params ? Object.assign({}, RETURN.params) : {};
      if (RETURN) {
        RETURN.params = undefined; // Prevent cyclic object value!
        params.STATE = RETURN;
      }

      //  console.log('buildReturnRoute',params,RETURN)
      return {
        name: RETURN && RETURN.return ? RETURN.return : default_route_name,
        params: params,
      };
    },
  },
});

export default CoreMixin;

//█████████████████████████████████████████████████████████████
//―――――――――――――― Global Types ―――――――――――――――
//█████████████████████████████████████████████████████████████

declare module "vue/types/vue" {
  interface Vue {
    EventBus: typeof EventBus;
  }
}
