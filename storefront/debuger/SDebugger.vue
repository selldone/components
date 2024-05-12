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

<template>
  <div v-if="load">
    <v-navigation-drawer
      v-model="dialog"
      class="s--webapp-debug-view"
      color="#fafaf6"
      temporary
      touchless
      width="640"
    >
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="dialog = false">
          <v-icon class="me-2">close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>
        <v-btn
          max-width="100px"
          size="x-large"
          title="Advanced settings"
          variant="text"
          @click="show_settings = !show_settings"
        >
          <v-icon>{{ show_settings ? "settings_suggest" : "settings" }}</v-icon>
        </v-btn>
      </div>

      <v-expand-transition>
        <div v-if="pack_dev_server">
          <div class="py-2 px-5">
            <small class="me-1">Dev Server: </small>
            <v-icon class="blink-me me-2" color="green" size="small"
              >circle
            </v-icon>
            <span class="me-2"
              >Path: <b>{{ pack_dev_server.path }} </b></span
            >
            <span
              >Version: <b>{{ pack_dev_server.version }}</b></span
            >
          </div>
        </div>
      </v-expand-transition>
      <v-expand-transition>
        <div v-if="show_settings">
          <div class="mt-3 mb-5" style="height: unset">
            To execute your development storefront web application in a live
            storefront environment in real-time, initiate the process by running
            yarn serv. Afterward, enter the development URL in the provided
            field and click 'Save' to proceed.
          </div>

          <v-text-field
            v-model="dev_url"
            append-inner-icon="cloud_sync"
            clearable
            label="Local dev server"
            persistent-placeholder
            placeholder="https://localhost:8080"
            @blur="
              fixDevUrl();
              getValidateDevPack(dev_url);
            "
            variant="outlined"
          ></v-text-field>

          <div class="widget-buttons">
            <v-btn
              :class="{ disable: count_down_refresh }"
              :loading="busy_dev_server"
              color="primary"
              size="x-large"
              @click="setLocalDevServer(dev_url)"
            >
              <template v-if="count_down_refresh">
                Auto refresh after 5 seconds...
              </template>
              <template v-else>
                <v-icon start>save</v-icon>
                {{ $t("global.actions.save") }}
              </template>
            </v-btn>
          </div>

          <v-expand-transition>
            <div v-if="error_dev_serve" class="text-red px-5">
              {{ error_dev_serve }}
            </div>
          </v-expand-transition>

          <div class="my-5" style="border-top: 1px dashed #999"></div>
        </div>
      </v-expand-transition>

      <div v-if="layout_package" class="px-3">
        <u-text-value-box
          :value="layout_package"
          icon="widgets"
          label="Package"
        ></u-text-value-box>
        <u-text-value-box
          :value="layout_version"
          icon="manage_history"
          label="Version"
        ></u-text-value-box>
        <u-text-value-box
          :value="layout_operator"
          icon="earbuds"
          label="Operator"
        ></u-text-value-box>
      </div>

      <v-list class="" lines="three">
        <div>
          This is a debug window designed to log errors and key messages. It's
          intended solely for debugging purposes and is primarily useful for
          shop owners, developers, and technically savvy users.
        </div>
        <v-list-item
          v-for="(item, key) in errors.entries()"
          :key="key"
          class="--item"
        >
          <v-list-item-title>
            <v-icon :color="item[1].type.color" class="me-1" size="small"
              >{{ item[1].type.icon }}
            </v-icon>
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
        </v-list-item>
      </v-list>
      <p
        v-if="!errors.length()"
        class="text-h4 font-weight-thin te text-center my-16"
      >
        {{ $t("global.commons.empty") }}
      </p>
    </v-navigation-drawer>

    <div
      v-if="show_dev_badge && in_layout_dev_mode"
      class="s--webapp-debug-view-dev-badge"
      @click.stop="show_dev_badge = false"
    >
      <div>
        <v-icon>developer_mode</v-icon>
        <div>Dev</div>
      </div>
    </div>
    <div
      v-else-if="show_dev_badge && in_layout_test_mode"
      class="s--webapp-debug-view-dev-badge -blue"
      @click.stop="show_dev_badge = false"
    >
      <div>
        <v-icon>developer_mode</v-icon>
        <div>Test</div>
      </div>
    </div>
  </div>
</template>

<script>
import { LRUCache } from "@selldone/core-js/helper/cache/LRUCache";
import { StorefrontDebugLogType } from "@selldone/core-js/enums/debug/StorefrontDebugLogType.ts";
import { StorefrontDebugEvents } from "@selldone/core-js/enums/debug/StorefrontDebugEvents.ts";
import { SetupService } from "@selldone/core-js/server/SetupService";
import _ from "lodash-es";
import UTextValueBox from "../../ui/text/value-box/UTextValueBox.vue";

export default {
  name: "SDebugger",
  components: { UTextValueBox },
  props: {},
  data() {
    return {
      key_listener_keydown: null,
      dialog: false,
      load: false,

      globalErrorHandler: null,
      promiseRejectionHandler: null,

      errors: new LRUCache(100),

      warning_event_handler: null,
      info_event_handler: null,

      show_settings: false,

      dev_url: null,
      error_dev_serve: null,
      busy_dev_server: false,
      pack_dev_server: null,
      count_down_refresh: false,

      show_dev_badge: true,
    };
  },
  computed: {
    layout_image() {
      return SetupService.GetLayoutImage();
    },

    layout_version() {
      return SetupService.GetLayoutVersion();
    },
    layout_package() {
      return SetupService.GetLayoutPackage();
    },
    layout_operator() {
      return SetupService.GetLayoutOperator(); // official | test | dev
    },
    in_layout_dev_mode() {
      return this.layout_operator === "dev";
    },
    in_layout_test_mode() {
      return this.layout_operator === "test";
    },
  },
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
        target,
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
      this.warning_event_handler,
    );
    // ----------------------------- Global info handler -----------------------------
    this.info_event_handler = ({ detail: { key, message } }) => {
      t.logError(StorefrontDebugLogType.INFO, key, message, null);
    };
    window.addEventListener(
      StorefrontDebugEvents.INFO_EVENT,
      this.info_event_handler,
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
          },
        );
        return Promise.reject(error);
      },
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
          this.load = true;
          this.$nextTick(() => {
            this.dialog = !this.dialog;
          });

          event.preventDefault();
          return false;
        }
      }
    };
    document.addEventListener("keydown", this.key_listener_keydown, true);

    this.dev_url = SetupService.GetMetaValue("dev-url");
    if (this.dev_url) {
      // Try check local dev server:
      this.getValidateDevPack(this.dev_url);
    }
  },
  beforeUnmount() {
    // Remove global error handler
    window.removeEventListener("error", this.globalErrorHandler);
    window.removeEventListener(
      StorefrontDebugEvents.WARNING_EVENT,
      this.globalErrorHandler,
    );
    window.removeEventListener(
      StorefrontDebugEvents.INFO_EVENT,
      this.globalErrorHandler,
    );

    // Remove promise rejection handler
    window.removeEventListener(
      "unhandledrejection",
      this.promiseRejectionHandler,
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
      request /*API Request error*/,
    ) {
      // For demonstration purposes, we'll just log to the console
      // In a real-world scenario, you might want to send this information to a server
      console.log("[🔴 Error Logger]", key, message, target, request);
      this.errors.set(key, { type: error_type, message, target, request });
      this.$forceUpdate();
    },

    async getValidateDevPack(url) {
      this.error_dev_serve = null;
      this.pack_dev_server = null;

      if (!url) return;

      try {
        // Fetch the HTML content from the URL
        const response = await fetch(url);
        const html = await response.text();

        // Parse the HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Find all script tags
        const scripts = Array.from(doc.querySelectorAll("script"));

        // Filter the script with the specific src attribute
        const target_script_shop_js = scripts.find((script) =>
          script.src.includes("shop.js"),
        );
        // Find script when it's Vite dev mode
        const target_script_vite_js = scripts.find((script) =>
            script.src.includes("@vite/client"),
        );

        if (target_script_shop_js) {
          // Extract the 'XXX' part from the src attribute
          const src = target_script_shop_js.src;
          const regex = /https?:\/\/[^\/]+\/(layouts)\/(v\d+\/app)\/shop\.js/;
          const matches = src.match(regex);

          console.log("matches", src, matches);

          if (matches && matches.length >= 3) {
            const path = matches[1]; // 'xxxx/yyyy' or 'layers'
            const version = matches[2]; // 'v1'

            console.log("Path:", path, "Version:", version);
            return (this.pack_dev_server = { path, version });
          } else {
            console.log("No matches found");
            return null;
          }
        }else if(target_script_vite_js){
          console.log("We detect Vite dev mode!");


          // Find all script tags of type module within the body
          const scripts = Array.from(doc.body.querySelectorAll('script[type="module"]'));


          // We want the src attribute of the first script tag of type module
          const src_module = scripts.length > 0 ? scripts[0].getAttribute('src') : null;

          if(!src_module){
            const err="Module not found in the url! It should be like <script type=\"module\" src=\"storefront.ts\"..."
            console.log(err);
            this.error_dev_serve = err;
            return null;
          }

          console.log("We find module:",src_module);

          return (this.pack_dev_server = { path:src_module, version:"vite" });

        }else{
          console.log("Script shop.js or Vite client not found!");
          this.error_dev_serve = "Script shop.js or Vite client not found!";
        }



        return null;
      } catch (error) {
        console.error("Error:", error);
        this.error_dev_serve = error;
        return null;
      }
    },

    fixDevUrl() {
      if (this.dev_url && !this.dev_url.startsWith("http")) {
        this.dev_url = "https://" + this.dev_url;
      }
    },

    async setLocalDevServer(dev_url) {
      this.fixDevUrl();

      console.log("Dev host", dev_url);
      const currentUrl = new URL(window.location.href);

      let _pack = null;
      if (dev_url) {
        this.busy_dev_server = true;
        _pack = await this.getValidateDevPack(dev_url);
        this.busy_dev_server = false;
        if (!_pack) return;
      }

      this.busy_dev_server = true;
      axios
        .post("/register-dev-server", {
          url: dev_url,
          path: _pack?.path,
          version: _pack?.version,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(null, "Dev server config successfully!");

            this.count_down_refresh = true;

            _.delay(() => {
              // Navigate to the new URL
              window.location.href = currentUrl.href;
            }, 5000);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.error_dev_serve = error;
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_dev_server = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--webapp-debug-view {
  text-align: start;
  z-index: 100;

  padding: 8px 12px;

  .--item {
    background: #fff;
    margin: 4px;
    border-radius: 12px;
  }
}

.s--webapp-debug-view-dev-badge {
  position: fixed;
  bottom: 25vh;
  right: 0;
  min-width: 46px;
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #009688;
  border-radius: 10px 0 0 12px;
  color: #fff;
  padding: 4px;
  font-size: 12px;
  user-select: none;
  cursor: pointer;

  &.-blue {
    background-color: #0288d1;
  }
}
</style>
