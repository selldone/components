/*
 * Copyright (c) 2024. Selldone® Business OS™
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

import {notify} from "@kyvg/vue3-notification";
import {EventBus} from "@selldone/core-js/events/EventBus.ts";
import {isString} from "lodash-es";

// Event listener to detect when the user is refreshing or navigating away from the page.
// This sets a flag in localStorage to indicate that a page refresh is in progress.
window.addEventListener('beforeunload', () => {
  localStorage.setItem('isRefreshing', 'true');
});

// Event listener to detect when the page has fully loaded.
// This clears the refresh flag from localStorage to allow normal operations.
window.addEventListener('load', () => {
  localStorage.removeItem('isRefreshing');
});


class NotificationService {
  /**
   * Shows an error alert with specified details.
   * @param title - The title of the alert. Defaults to a generic error message if not provided.
   * @param message - The main message of the alert.
   * @param detail - Additional detail message. Adds extra duration if present.
   * @param duration - Duration in milliseconds before the alert disappears. Doubled if detail is provided.
   */
  static showErrorAlert(
    title: string | null,
    message: string | null = null,
    detail: string | null = null,
    duration: number = 6000,
  ) {
    if (!window.$t) {
      console.error("Error: Translation is not available!");
      return;
    }
    if (!title) title = window.$t("global.notification.error") as string;

    notify({
      group: "regular-notifications",
      title: title,
      text: message + (detail ? `<br><hr>${detail}` : ""),
      duration: detail ? duration * 2 : duration,
      type: "error",
    });
  }

  static showSuccessAlert(
    title: string | null,
    message: string | null,
    icon = "done",
    duration = 3000,
    img = null,
  ) {
    if (!window.$t) return;
    if (!title) title = window.$t("global.notification.confirm") as string;

    notify({
      group: "regular-notifications",
      title: title,
      text: message
        ? message
        : (window.$t("global.notification.confirm_message") as string),
      duration: duration,
      type: "success",
      data: { img: img, icon: icon },
    });
  }

  static showWarningAlert(
    title: string | null,
    message?: string,
    duration = 6000,
  ) {
    if (!window.$t) return;
    if (!title) title = window.$t("global.notification.warning") as string;

    notify({
      group: "regular-notifications",
      title: title,
      text: message,
      duration: duration,
      type: "warn",
    });
  }

  static showAwardAlert(title: string | null, message?: string) {
    if (!window.$t) return;
    if (!title) title = window.$t("global.notification.award") as string;

    notify({
      group: "regular-notifications",
      title: title,
      text: message,
      duration: 7000,
      type: "award",
    });
  }

  static showNotificationAlert(
    title: string | null,
    message?: string,
    icon?: string | null,
    color?: string | null,
    img = null,
    duration = 30000,
  ) {
    if (!window.$t) return;
    if (!title) title = window.$t("global.notification.caution") as string;

    notify({
      group: "regular-notifications",
      title: title,
      text: message,
      duration: duration,
      data: { img: img, icon: icon },
    });
  }

  static openDangerAlert(
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
      reject: window.$t("global.actions.cancel"),
      callback,
      color: color,
    });
  }

  static openConfirmationAlert(
    title: string,
    message: string,
    accept: string,
    callback: () => void,
  ) {
    EventBus.$emit("alert-dialog", {
      title,
      message,
      accept,
      reject: window.$t("global.actions.no"),
      callback,
      color: "success",
    });
  }

  static showMessage(title: string, message: string, duration: number = 12000) {
    if (!title) title = window.$t("global.notification.message") as string;
    notify({
      group: "regular-notifications",
      title: title,
      text: message,
      duration: duration,
      type: "message",
    });
  }








  //―――――――――――――――――――――― Laravel validation error handler ――――――――――――――――――――

 static showLaravelError(
      error: string | { error: true; error_msg: string; code?: number } | any,
  ) {

   const isRefreshing = localStorage.getItem('isRefreshing');
   // Skip showing the error if the page is refreshing
   if (isRefreshing === 'true') {
     console.warn('Page is refreshing, skipping error display.');
     return;
   }

    if (!error) return;
    if (isString(error)) {
      NotificationService.showErrorAlert(
          window.$t("global.notification.error") as string,
          error,
      );
      return;
    }

    if (error?.error_msg /*Errors in the response with 2xx code*/) {
      NotificationService.showErrorAlert(
          window.$t("global.notification.error") as string,
          error.error_msg,
      );
      return;
    }

    if (!error.response) {
      console.error("1- error", error);
      if (error.message) {
        NotificationService.showErrorAlert(
            window.$t("global.notification.error") as string,
            `<div dir="ltr" class="text-left">${error.message}</div>`,
        );
      } else if (error.body) {
        NotificationService.showErrorAlert(
            window.$t("global.notification.error") as string,
            `<div dir="ltr" class="text-left">${error.body}</div>`,
        );
      }
      return;
    }

    // Handle CSRF token expire:
    if (error.response.status === 419) {
      NotificationService.showErrorAlert(
          window.$t("global.notification.error") +
          " " +
          error.response.status +
          " | CSRF token mismatch.",
          `<div class="text-start">${window.$t("global.errors.419")}</div>`,
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
      NotificationService.showErrorAlert(
          window.$t("global.notification.error") + " " + data.code,
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
      NotificationService.showErrorAlert(
          window.$t("global.notification.error") + " " + error.response.status,
          `<div class="text-start">${error_msg}</div>`,
      );
    } else if (data?.message) {
      NotificationService.showErrorAlert(
          window.$t("global.notification.error") + " " + error.response.status,
          `<div class="text-start">${data.message}</div>`,
      );
    } else {

      // 403 Error:
        if (error.response.status === 403) {
            NotificationService.showErrorAlert(
                window.$t("global.notification.error") + " " + error.response.status+" | Forbidden",
                window.$t("global.errors.403"),
            );
            return;
        }
        // 404 Error:
        if (error.response.status === 404) {
            NotificationService.showErrorAlert(
                window.$t("global.notification.error") + " " + error.response.status+" | Not Found",
                window.$t("global.errors.404"),
            );
            return;
        }



      NotificationService.showErrorAlert(
          window.$t("global.notification.error") + " " + error.response.status,
          window.$t("global.notification.error_message") as string,
      );
    }
  }

  //―――――――――――――――――――――― Common dialogs ――――――――――――――――――――
  static openDeleteAlert(callback: () => void) {
    const title = window.$t("global.dialogs.delete.title");
    const message = window.$t("global.dialogs.delete.message");
    const accept = window.$t("global.dialogs.delete.action");

    EventBus.$emit("alert-dialog", {
      title,
      message,
      accept,
      reject: window.$t("global.actions.cancel"),
      callback,
      color: "red",
    });
  }



}

export default NotificationService;
