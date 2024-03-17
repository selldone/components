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

import { initializeApp } from "firebase/app";

import {
  getMessaging,
  onMessage,
  getToken,
  isSupported,
} from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";
import {EventBus, EventName} from "@core/events/EventBus";

const firebaseConfig = {
  apiKey: "{!! enter here e.g. AIzaSyBlMGghN...!!}",
  projectId: "{!! enter here e.g. selld...!!}",
  appId: "{!!enter here e.g 1:772774756...!!}",
  measurementId: "{!!enter here e.g. G30400567!!}", // Replace by shop tag manager ID!
};

const firebaseApp = initializeApp(firebaseConfig);

// Analytics:
const analytics = getAnalytics();

export class StorePushNotification {
  messaging = null;

  constructor() {

    // Messaging:
    isSupported().then(() => {
      this.initializeMessaging();
    });
  }

  initializeMessaging() {
    if (!navigator.serviceWorker) {
      // Private window mode or ...
      console.error("Messaging service is disable! Private window mode or ...");
      return;
    }

    // Retrieve Firebase Messaging object:
    const messaging = getMessaging();

    console.log("⏺ Register message listener..");

    onMessage(messaging, (payload) => {
      //console.log("Message received - Foreground. ", payload);
      EventBus.$emit(
        EventName.FIREBASE_RECEIVE_MESSAGE,
        payload,
      );
    });

    // Get Token:
    StorePushNotification.GetToken();
  }

  static AskForPermission() {
    try {
      if (!isSupported()) return;
      Notification?.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");

          StorePushNotification.GetToken();
        } else {
          console.log("Unable to get permission to notify.");
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  static GetToken() {
    // Retrieve Firebase Messaging object:
    const messaging = getMessaging();

    console.log("⚙ Service worker Get token (static).");

    // Get registration token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.

    getToken(messaging, {
      vapidKey: "{!!enter here e.g BOAPKP--XYZ...!!}",
    })
      .then((currentToken) => {
        if (currentToken) {
          // Send the token to your server and update the UI if necessary
          EventBus.$emit(
            EventName.FIREBASE_GET_TOKEN,
            currentToken,
          );
        } else {
          // Show permission request UI
          console.log(
            "No Instance ID token available. Request permission to generate one.",
          );
        }
      })
      .catch((err) => {
        console.log("An error occurred while retrieving token. ", err);
        // ...
      });
  }
}
