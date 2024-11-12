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

import {DateConverter} from "@selldone/core-js/helper/date/DateConverter"; //―――――――――――――――――――――― Event Bus ――――――――――――――――――――
//―――――――――――――――――――――― Event Bus ――――――――――――――――――――

//―――――――――――――――――――――― Country ――――――――――――――――――――

const DateMixin = {
  methods: {
    //―――――――――――――――――――――― 🌍 Time ▶ Get local time ――――――――――――――――――――

    /**
     * Converts a datetime string to a local Date object.
     * @param {string} datetimeStr - The datetime string to convert.
     * @returns {Date} The local Date object.
     */
    convertToLocalTime: function convertToLocalTime(datetimeStr: string) {
      return DateConverter.convertToLocalTime(datetimeStr);
    },

    /**
     * Returns a localized, formatted date-time string in a small format.
     * @param {string | number} datetimeStr - The datetime string or timestamp to format.
     * @returns {string} The formatted date-time string.
     */
    getLocalTimeStringSmall: function getLocalTimeStringSmall(
      datetimeStr: string | number,
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
          window.$language?.full_locale,
          options,
        ).format(new Date(datetimeStr));
      } catch (e) {
        console.error(e);
      }
    },

    /**
     * Returns a localized, formatted date string.
     * @param {string | null} datetimeStr - The datetime string to format.
     * @returns {string} The formatted date string.
     */
    getLocalDateString: function getLocalDateString(
      datetimeStr: string | null,
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
          window.$language?.full_locale,
          options,
        ).format(new Date(datetimeStr));
      } catch (e) {
        console.error(datetimeStr, e);
      }
    },

    /**
     * Returns a localized, formatted time string (hours and minutes only).
     * @param {string | null} datetimeStr - The datetime string to format.
     * @returns {string} The formatted time string.
     */
    getLocalTimeOnlyString: function getLocalTimeOnlyString(
      datetimeStr: string | null,
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
          window.$language?.full_locale,
          options,
        ).format(new Date(datetimeStr));
      } catch (e) {
        console.error(datetimeStr, e);
      }
    },

    /**
     * Returns a localized, formatted date-time string with options.
     * @param {string} datetimeStr - The datetime string to format.
     * @param {boolean} [isShort=false] - Whether to use a short format.
     * @param {boolean} [isMicro=false] - Whether to use a micro format.
     * @param {boolean} [noTime=false] - Whether to exclude the time.
     * @returns {string} The formatted date-time string.
     */
    getLocalTimeString: function getLocalTimeString(
      datetimeStr: string,
      isShort = false,
      isMicro = false,
      noTime = false,
    ) {
      return DateConverter.GetLocalTimeString(
        datetimeStr,
        0,
        isShort,
        isMicro,
        noTime,
      );
    },

    /**
     * Returns a localized, formatted date-time string with added seconds.
     * @param {string} datetimeStr - The datetime string to format.
     * @param {number} added_seconds - The number of seconds to add to the datetime.
     * @param {boolean} [isShort=false] - Whether to use a short format.
     * @param {boolean} [isMicro=false] - Whether to use a micro format.
     * @param {boolean} [noTime=false] - Whether to exclude the time.
     * @returns {string} The formatted date-time string.
     */
    getLocalTimeStringAddedSeconds: function getLocalTimeStringAddedSeconds(
      datetimeStr: string,
      added_seconds: number,
      isShort = false,
      isMicro = false,
      noTime = false,
    ) {
      return DateConverter.GetLocalTimeString(
        datetimeStr,
        added_seconds,
        isShort,
        isMicro,
        noTime,
      );
    },
    /**
     * Returns a string representing the time elapsed since the given datetime.
     * @param {string} datetimeStr - The datetime string to compare.
     * @param {string | null} [local=null] - The locale to use.
     * @param {boolean} [abstract=false] - Whether to use an abstract format.
     * @returns {string} The time elapsed since the given datetime.
     */
    getFromNowString: function getFromNowString(
      datetimeStr: string,
      local = null,
      abstract = false,
    ) {
      return DateConverter.getFromNowString(datetimeStr, local, abstract);
    },

    /**
     * Returns a string representing the time difference between two datetimes.
     * @param {string} datetimeStr - The start datetime string.
     * @param {string} datetime_end - The end datetime string.
     * @returns {string} The time difference between the two datetimes.
     */
    getFromOtherTimeString: function getFromOtherTimeString(
      datetimeStr: string,
      datetime_end: string,
    ) {
      return DateConverter.getFromOtherTimeString(datetimeStr, datetime_end);
    },
    /**
     * Returns the duration between two datetimes as a formatted string.
     * @param {string} datetimeStr - The start datetime string.
     * @param {string} datetime_end - The end datetime string.
     * @returns {string} The duration between the two datetimes.
     */
    getDurationOtherTimeString: function getDurationOtherTimeString(
      datetimeStr: string,
      datetime_end: string,
    ) {
      return DateConverter.getDurationOtherTimeString(
        datetimeStr,
        datetime_end,
      );
    },
    /**
     * Checks if the given datetime is today.
     * @param {string} created_at - The datetime string to check.
     * @returns {boolean} True if the datetime is today, false otherwise.
     */
    isToday: function isToday(created_at: string) {
      return DateConverter.isToday(created_at);
    },

    /**
     * Checks if the given datetime is within a certain range of days.
     * @param {string} created_at - The datetime string to check.
     * @param {number} days - The number of days for the range.
     * @param {number} [offset=0] - The offset in days.
     * @returns {boolean} True if the datetime is within the range, false otherwise.
     */
    inDayRange: function inDayRange(
      created_at: string,
      days: number,
      offset = 0,
    ) {
      return DateConverter.inDayRange(created_at, days, offset);
    },

    /**
     * Converts a local datetime string to a UTC datetime string.
     * @param {string} datetimeStr - The local datetime string to convert.
     * @returns {string | null} The UTC datetime string, or null if invalid input.
     */
    convertLocalTimeStringToUTCString:
      function convertLocalTimeStringToUTCString(datetimeStr: string) {
        if (!datetimeStr) return null;

        const date = new Date(datetimeStr);
        if (!date) return null;

        return date.toISOString();
      },

    /**
     * Converts a UTC datetime string to a local datetime string.
     * @param {string} datetimeStr - The UTC datetime string to convert.
     * @returns {string | null} The local datetime string, or null if invalid input.
     */
    convertUTCStringToLocalTimeString:
      function convertUTCStringToLocalTimeString(datetimeStr: string) {
        if (!datetimeStr) return null;

        const date = DateConverter.convertToLocalTime(datetimeStr);
        if (!date) return null;
        return date.toLocaleString();
      },
  },
};

export default DateMixin;
