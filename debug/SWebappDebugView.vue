<template>
  <v-navigation-drawer
    v-model="dialog"
    fixed
    width="640"
    color="#fafaf6"
    class="s--webapp-debug-view"
    touchless
  >
    <div class="widget-buttons">
      <v-btn @click="dialog = false" text x-large
        ><v-icon class="me-2">close</v-icon> {{ $t("global.actions.close") }}
      </v-btn>
    </div>

    <v-list class="" three-line>
      <v-subheader>
        This is a debug window designed to log errors and key messages. It's
        intended solely for debugging purposes and is primarily useful for shop
        owners, developers, and technically savvy users.
      </v-subheader>
      <v-list-item
        v-for="(item, key) in errors.entries()"
        :key="key"
        class="--item"
      >
        <v-list-item-content>
          <v-list-item-title>
            <v-icon :color="item[1].type.color" class="me-1" small>{{
              item[1].type.icon
            }}</v-icon>
            {{ item[0] }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ item[1].message }}
          </v-list-item-subtitle>
          <v-list-item-subtitle v-if="item[1].request">
            <b> {{ item[1].request.status }}</b> ●
            {{ item[1].request.statusText }}
          </v-list-item-subtitle>

          <v-list-item-subtitle v-if="item[1].target">
            {{ item[1].target }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <p
      v-if="!errors.length()"
      class="display-1 font-weight-thin te text-center my-16"
    >
      {{ $t("global.commons.empty") }}
    </p>
  </v-navigation-drawer>
</template>

<script>
import { LRUCache } from "../../../core/helper/cache/LRUCache";
import { StorefrontDebugLogType } from "@components/debug/StorefrontDebugLogType";
import StorefrontDebugEvents from "@components/debug/StorefrontDebugEvents";

export default {
  name: "SWebappDebugView",
  components: {},
  props: {},
  data() {
    return {
      key_listener_keydown: null,
      dialog: false,

      globalErrorHandler: null,
      promiseRejectionHandler: null,

      errors: new LRUCache(100),

      warning_event_handler: null,
      info_event_handler: null,
    };
  },
  computed: {},
  mounted() {
    console.log("Debug view is enable. Press ⌘Ctrl + d");

    const t = this;

    // ----------------------------- Global error handler -----------------------------
    this.globalErrorHandler = function ({
      message,
      source = null,
      lineno = null,
      colno = null,
      error = null,
      target = null,
    }) {
      const _key = target ? `Element ${target}` : "Global";
      t.logError(
        target
          ? StorefrontDebugLogType.WEB_APP_ERROR
          : StorefrontDebugLogType.EXTERNAL_ERROR,
        _key,
        `Exception: ${message} at ${source}:${lineno}:${colno}`,
        target
      );
      return true; // true: prevents the default browser action
    };
    window.addEventListener("error", this.globalErrorHandler);

    // ----------------------------- Global warning handler -----------------------------
    this.warning_event_handler = ({ detail: { key, message } }) => {
      t.logError(StorefrontDebugLogType.WARNING, key, message, null);
    };
    window.addEventListener(
      StorefrontDebugEvents.WARNING_EVENT,
      this.warning_event_handler
    );
    // ----------------------------- Global info handler -----------------------------
    this.info_event_handler = ({ detail: { key, message } }) => {
      t.logError(StorefrontDebugLogType.INFO, key, message, null);
    };
    window.addEventListener(
      StorefrontDebugEvents.INFO_EVENT,
      this.info_event_handler
    );

    // ----------------------------- Promise rejection handler -----------------------------
    this.promiseRejectionHandler = function (event) {
      let errorMessage = event.reason;
      let requestURL = "Unknown URL"; // Default value

      // Check if the error is from Axios
      if (event.reason?.config && event.reason.config.url) {
        requestURL = event.reason.config.url;
        errorMessage = event.reason.message;
      }

      // Check if the error is from Fetch
      else if (event.reason instanceof Response) {
        requestURL = event.reason.url;
        errorMessage = `Fetch Error: ${event.reason.statusText}`;
      }
      const _error_type =
        requestURL?.includes("selldone.") ||
        requestURL?.includes("127.") /*Local*/
          ? StorefrontDebugLogType.API_ERROR
          : StorefrontDebugLogType.EXTERNAL_ERROR;

      t.logError(_error_type, requestURL, errorMessage);
    };
    window.addEventListener("unhandledrejection", this.promiseRejectionHandler);

    // ----------------------------- Axios error interceptor -----------------------------
    this.axiosInterceptor = axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const requestURL = error.config?.url || "Unknown URL";

        const _message = error.message;
        t.logError(
          StorefrontDebugLogType.API_ERROR,
          requestURL,
          _message,
          null,
          {
            status: error.response?.status,
            statusText: error.response?.statusText,
          }
        );
        return Promise.reject(error);
      }
    );

    //――――――――――――――――――――――  START Editor key listener ――――――――――――――――――――
    this.key_listener_keydown = (event) => {
      // Check for Ctrl (or Command on Apple) + D
      let isCtrlOrCommand = event.ctrlKey || event.metaKey;
      let isD = event.key === "d" || event.key === "D" || event.keyCode === 68;

      if (isCtrlOrCommand && isD) {
        // Ensure no input, textarea, or contenteditable element is focused
        let activeElement = document.activeElement;
        if (
          !activeElement ||
          (activeElement.tagName !== "INPUT" &&
            activeElement.tagName !== "TEXTAREA" &&
            activeElement.contentEditable !== "true")
        ) {
          this.dialog = !this.dialog;
          event.preventDefault();
          return false;
        }
      }
    };
    document.addEventListener("keydown", this.key_listener_keydown, true);
  },
  beforeDestroy() {
    // Remove global error handler
    window.removeEventListener("error", this.globalErrorHandler);
    window.removeEventListener(
      StorefrontDebugEvents.WARNING_EVENT,
      this.globalErrorHandler
    );
    window.removeEventListener(
      StorefrontDebugEvents.INFO_EVENT,
      this.globalErrorHandler
    );

    // Remove promise rejection handler
    window.removeEventListener(
      "unhandledrejection",
      this.promiseRejectionHandler
    );

    // Remove Axios interceptor
    axios.interceptors.response.eject(this.axiosInterceptor);
    //――――――――――――――――――――――  REMOVE key listener ――――――――――――――――――――

    document.removeEventListener("keydown", this.key_listener_keydown, true);
  },
  methods: {
    logError(
      error_type,
      key,
      message,
      target /*Element*/,
      request /*API Request error*/
    ) {
      // For demonstration purposes, we'll just log to the console
      // In a real-world scenario, you might want to send this information to a server
      console.log("[🔴 Error Logger]", key, message, target, request);
      this.errors.set(key, { type: error_type, message, target, request });
      this.$forceUpdate();
    },
  },
};
</script>

<style scoped lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--webapp-debug-view {
  text-align: start;
  z-index: 100;
  .--item {
    background: #fff;
    margin: 4px;
    border-radius: 12px;
  }
}
</style>
