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
  <div
    :class="{ disabled: busy }"
    class="position-relative min-height-10vh my-5"
  >
    <u-loading-progress v-if="busy" color="blue"></u-loading-progress>

    <!-- Set up a container element for the button -->
    <div id="paypal-button-container"></div>

    <div v-if="busy_verify" class="v-msg text-h4">
      <u-loading-progress></u-loading-progress>
      Verifying Payment...
    </div>
  </div>
</template>

<script lang="ts">
import { ScriptHelper } from "@selldone/components-vue/plugins/jquery/ScriptHelper";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "UPaymentPaypalStandard",

  props: {
    shopName: {},
    pack: {
      require: true,
      type: Object,
    },

    currency: {
      require: true,
      type: String,
    },
    amount: {
      require: true,
      type: Number,
    },

    orderUrl: {
      require: true,
      type: String,
    },

    billingName: {},
    billingEmail: {},
    billingPhone: {},
    billingAddress: {},
  },
  data: () => ({
    paypal_js_loaded: false,
    busy: false,
    busy_verify: false,
  }),

  mounted() {
    this.loadPaypalJs();
  },

  methods: {
    /**
     * ――――――――――――――――――――― Paypal > Load JS ――――――――――――――――――――
     */
    loadPaypalJs() {
      let t = this;
      this.busy = true;

      try {
        let test = paypal; // Check if previously loaded:
        this.paypal_js_loaded = true;
        this.busy = false;
        console.style(`✔ ❰ PayPal ❱  Script exist.`);

        this.initilize();
      } catch (e) {
        // Load dynamically:
        ScriptHelper.CachedScript(this.pack.script)
          .done(function (script, textStatus) {
            console.style(
              `🔔 ❰ PayPal ❱  Load script file start... ▶ status: ${textStatus}`,
            );
            t.paypal_js_loaded = true;
            t.busy = false;
            console.style(`🔔 ❰ PayPal ❱  Load script file end`);

            t.$nextTick(() => {
              t.initilize();
            });
          })
          .fail(function (jqxhr, settings, exception) {
            t.busy = false;
            console.errorStyle(
              `⚠ ❰ PayPal ❱  Failed to load script file: `,
              exception,
            );
            NotificationService.showErrorAlert(null, "Can not load script!");
          });
      }
    },

    initilize() {
      const t = this;
      paypal
        .Buttons({
          // Sets up the transaction when a payment button is clicked
          createOrder: function (data, actions) {
            return t.pack.order_id;
          },
          // Finalize the transaction after payer approval
          onApprove: function (data, actions) {
            console.log("onApprove", data);

            t.busy_verify = true;
            return axios
              .post(
                window.XAPI.POST_PAYMENTS_PAYPAL_STANDARD_VERIFY(t.shopName),
                {
                  unique_id: data.orderID,
                },
              )
              .then(({ data }) => {
                if (data.error) return NotificationService.showErrorAlert(null, data.error_msg);

                NotificationService.showSuccessAlert(
                  "Payment completed",
                  "We received your payment successfully.",
                );
                // Successful capture! For dev/demo purposes:
                console.log("Capture result", data);

                actions.redirect(data.order_url);

                // actions.redirect('thank_you.html')

                // When ready to go live, remove the alert and show a success message within this page. For example:
                // var element = document.getElementById('paypal-button-container');
                // element.innerHTML = '<h3>Thank you for your payment!</h3>';
                // Or go to another URL:  actions.redirect('thank_you.html');
              })

              .catch((error) => {
                NotificationService.showLaravelError(error);
              })
              .finally(() => {
                // t.busy_verify = false;  Not needed! page will be redirected!
              });
          },
        })
        .render("#paypal-button-container");
    },
  },
};
</script>

<style lang="scss" scoped>
.v-msg {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  z-index: 999;
}
</style>
