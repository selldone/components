<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
    :class="{
      'border-warning': isRequireAction,
      'border-danger': isCanceled,
      'border-info': isProcessing,
      'border-success': isSucceeded && !isTestPayment,
      'border-lime': isCOD,
      'border-purple': isSucceeded && isTestPayment,
      '-activated': in_this_step,
    }"
    class="widget shadow my-3 mx-1 mx-md-3 overflow-hidden pb-0"
    style="border-top: 2px solid #dee2e6"
    v-bind="$attrs"
  >
    <!-- █████████████████████ Header █████████████████████ -->

    <div class="d-flex align-center">
      <h2>
        <v-icon class="me-1" color="#111">payment</v-icon>
        {{ $t("process_center.payment_widget.title") }}
      </h2>
      <v-spacer></v-spacer>
      <span>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Main payment check button ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-btn
          v-if="gateway && payment.unique_id"
          :loading="busy_check"
          class="mx-2"
          color="green"
          size="small"
          variant="outlined"
          @click="
            checkPaymentStatus(gateway.code, payment.unique_id, gateway.name)
          "
        >
          <v-icon start>refresh</v-icon>
          {{ $t("global.actions.check") }}
          <img :src="getShopImagePath(gateway.icon)" class="ms-2" height="20" />
        </v-btn>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Pending payment check button ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-btn
          v-for="(item, index) in transactions_pending"
          :key="index"
          :disabled="!item.unique_id"
          :loading="busy_check"
          class="mx-2"
          color="#333"
          size="small"
          variant="outlined"
          @click="
            checkPaymentStatus(item.gateway_code, item.unique_id, item.name)
          "
        >
          <v-icon start>refresh</v-icon>
          {{ $t("global.actions.check") }}
          <img :src="getShopImagePath(item.logo)" class="mx-1" height="20" />
        </v-btn>

        <u-currency-icon
          :currency="order.currency"
          flag
          small
        ></u-currency-icon>
      </span>
    </div>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Live/Debug mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-list-subheader class="px-0">
      <span v-if="payment" class="mx-2">
        <v-icon
          :color="payment.livemode ? 'green' : 'amber'"
          class="me-1"
          size="x-small"
          >fa:fas fa-circle</v-icon
        >
        {{
          payment.livemode
            ? $t("shop_gateway.transactions.live_mode")
            : $t("shop_gateway.transactions.test_mode")
        }}
      </span>
    </v-list-subheader>

    <!-- █████████████████████ Payment Digest Status █████████████████████ -->
    <div class="text-start mt-2">
      <p>
        <span :class="{ 'text-muted': !isPayed }" class="h3">
          <u-price :amount="order.price" :currency="order.currency"></u-price>
        </span>
        <v-chip
          v-if="isRequireAction"
          class="mx-2"
          color="warning"
          size="small"
          variant="flat"
        >
          <v-icon start> warning</v-icon>
          {{ $t("process_center.payment_widget.waiting_for_pay") }}
        </v-chip>

        <v-chip
          v-if="isProcessing"
          class="mx-2"
          color="blue"
          size="small"
          variant="flat"
        >
          <v-icon start> loop</v-icon>
          {{ $t("process_center.payment_widget.processing_payment") }}
        </v-chip>
        <v-chip
          v-if="is_require_capture"
          class="mx-2"
          color="#673AB7"
          size="small"
          title="You hold fund but to get money you need to capture it manually."
          variant="flat"
        >
          <v-icon start> hourglass_empty</v-icon>
          {{ $t("process_center.payment_widget.require_capture") }}
        </v-chip>

        <v-chip
          v-if="isCanceled"
          class="mx-2"
          color="red"
          size="small"
          variant="flat"
        >
          <v-icon start> close</v-icon>
          {{ $t("process_center.payment_widget.processing_cancel") }}
        </v-chip>

        <v-chip
          v-if="isSucceeded"
          :color="isTestPayment ? '#9C27B0' : 'success'"
          class="mx-2"
          size="small"
          variant="flat"
        >
          <v-icon start> check</v-icon>
          {{ $t("process_center.payment_widget.paid") }}

          ●
          <b v-if="isTestPayment" class="mx-1">
            {{ $t("shop_gateway.transactions.test_mode") }}</b
          >
        </v-chip>

        <v-chip
          v-if="order.subscription_id"
          class="mx-2"
          color="#C2185B"
          size="small"
          variant="flat"
        >
          <v-icon start> shopping_bag</v-icon>

          By Subscription ● <b class="mx-1">SN-{{ order.subscription_id }}</b>
        </v-chip>
      </p>

      <!-- █████████████████████ User & Customer █████████████████████ -->

      <v-row>
        <v-col v-if="buyer || !customer /*Guest*/" cols="12" sm="6">
          <!-- ⬬⬬⬬⬬⬬⬬⬬ Buyer > 🥵 User ⬬⬬⬬⬬⬬⬬⬬ -->

          <div v-if="buyer" class="py-2 d-flex align-items-center">
            <small
              class="font-weight-bold me-3 ms-1 flex-grow-0"
              title="This is the user's profile on Selldone. It remains consistent across all stores on Selldone."
              >{{ $t("global.commons.buyer") }} :</small
            >
            <component
              :is="order.customer_id ? 'router-link' : 'span'"
              :to="
                isRolePanel || IS_VENDOR_PANEL
                  ? {}
                  : {
                      name: 'BPageCustomerDashboard',
                      params: { customer_id: order.customer_id },
                    }
              "
              class="flex-grow-0"
              @click.stop
            >
              <v-avatar class="m-1 hover-scale force-top" size="42">
                <img :src="getUserAvatar(buyer.id)" />
              </v-avatar>
            </component>

            <span class="ps-2">
              <p class="m-0 font-weight-bold">
                <span class="highlight-yellow">{{ buyer.name }}</span>
              </p>
              <p v-if="buyer.email" class="m-0 text-subtitle-2">
                <v-icon class="me-1" size="small">email</v-icon>
                <span v-copy class="p-0">{{ buyer.email }}</span>
              </p>
              <p v-if="buyer.phone" class="m-0 text-subtitle-2">
                <v-icon class="me-1" size="small">phone</v-icon>
                <span v-copy class="p-0">{{ buyer.phone }}</span>
              </p>
            </span>
          </div>
          <!-- ⬬⬬⬬⬬⬬⬬⬬ Buyer > 🥶 Guest ⬬⬬⬬⬬⬬⬬⬬ -->

          <div v-else-if="!customer" class="py-2 d-flex align-items-center">
            <small class="font-weight-bold me-3 ms-1 flex-grow-0"
              >{{ $t("global.commons.buyer") }} :</small
            >

            <v-avatar class="m-1 hover-scale force-top flex-grow-0" size="42">
              <img :src="require('../../../../assets/icons/user.svg')" />
            </v-avatar>

            <span class="ps-2">
              <p class="m-0 font-weight-bold">
                <span class="highlight-yellow">{{
                  $t("global.commons.guest")
                }}</span>
              </p>
            </span>
          </div>
        </v-col>

        <v-col v-if="customer" cols="12" sm="6">
          <!-- ⬬⬬⬬⬬⬬⬬⬬ Buyer > 🧜 Customer ⬬⬬⬬⬬⬬⬬⬬ -->

          <div class="py-2 d-flex align-items-center">
            <small
              class="font-weight-bold me-3 ms-1 flex-grow-0"
              title="This is the user's profile in your shop, and you can edit it."
              >{{ $t("global.commons.customer") }} :</small
            >
            <v-btn
              :to="
                isRolePanel || IS_VENDOR_PANEL
                  ? {}
                  : {
                      name: 'BPageCustomerDashboard',
                      params: { customer_id: order.customer_id },
                    }
              "
              icon
              size="large"
              title="Go to customer page"
              variant="text"
              @click.stop
            >
              <v-avatar size="42">
                <v-icon size="large">person_outline</v-icon>
              </v-avatar>
            </v-btn>

            <span class="ps-2">
              <p
                v-if="customer.name && (!buyer || customer.name !== buyer.name)"
                class="m-0 font-weight-bold"
              >
                <span class="highlight-yellow">{{ customer.name }}</span>
              </p>
              <v-row v-if="customer.segments" no-gutters>
                <v-chip
                  v-for="segment in customer.segments"
                  :key="segment"
                  :color="segment.toColor(true)"
                  class="ma-1 px-1"
                  label
                  size="x-small"
                  variant="flat"
                  >{{ segment }}</v-chip
                >
              </v-row>

              <p v-if="customer.email" class="m-0 text-subtitle-2">
                <v-icon class="me-1" size="small">email</v-icon>
                <span v-copy class="p-0">{{ customer.email }}</span>
              </p>
              <p v-if="customer.phone" class="m-0 text-subtitle-2">
                <v-icon class="me-1" size="small">phone</v-icon>
                <span v-copy class="p-0">{{ customer.phone }}</span>
              </p>
            </span>
          </div>
        </v-col>
      </v-row>

      <!-- █████████████████████ Campaign █████████████████████ -->

      <div v-if="campaign_link" class="py-2">
        <img
          height="20"
          src="../../../../assets/icons/campaign.svg"
          width="20"
        />
        <small class="font-weight-bold me-3 ms-1"
          >{{ $t("global.commons.campaign") }} :</small
        >

        <router-link
          v-if="campaign_link.campaign"
          :to="
            isRolePanel || IS_VENDOR_PANEL
              ? {}
              : {
                  name: 'BPageCampaignDashboard',
                  params: { campaign_id: campaign_link.campaign_id },
                }
          "
          class="me-3 text-uppercase link-dash"
          >{{ campaign_link.campaign.name }}
        </router-link>
        <b-campaign-source-icon
          v-if="campaign_link && campaign_link.source"
          :title="campaign_link.source"
          :value="campaign_link.source"
          size="20"
        ></b-campaign-source-icon>
        <v-icon v-if="campaign_link && campaign_link.medium" class="mx-1"
          >{{ $t("icons.long_end") }}
        </v-icon>
        <b-campaign-medium-icon
          v-if="campaign_link && campaign_link.medium"
          :title="campaign_link.medium"
          :value="campaign_link.medium"
          size="20"
        ></b-campaign-medium-icon>
      </div>

      <div v-if="campaign" class="py-2">
        <img
          height="20"
          src="../../../../assets/icons/campaign.svg"
          width="20"
        />
        <small class="font-weight-bold me-3 ms-1"
          >{{ $t("global.commons.campaign") }} :</small
        >

        <router-link
          :to="
            isRolePanel || IS_VENDOR_PANEL
              ? {}
              : {
                  name: 'BPageCampaignDashboard',
                  params: { campaign_id: campaign.id },
                }
          "
          class="me-3 text-uppercase link-dash"
          >{{ campaign.name }}
        </router-link>
      </div>

      <!-- █████████████████████ Acquisition channel █████████████████████ -->

      <div v-if="channel" class="py-2">
        <v-icon size="20" class="op-0-5">alt_route</v-icon>
        <small class="font-weight-bold me-3 ms-1"
          >{{ $t("global.commons.acquisition_channel") }} :</small
        >

        <b-campaign-source-icon
          :value="channel"
          class="me-1"
          height="15"
          width="15"
        />
        <span class="text-subtitle-2 text-capitalize">{{ channel }}</span>
      </div>

      <!-- █████████████████████ Affiliate █████████████████████ -->

      <div v-if="affiliate" class="py-2">
        <img
          height="20"
          src="../../../../assets/icons/affiliate.svg"
          width="20"
        />
        <small class="font-weight-bold me-3 ms-1"
          >{{ $t("global.commons.affiliate") }} :</small
        >
        <v-avatar v-if="affiliate.user_id" class="hover-scale me-2" size="20">
          <v-img :src="getUserAvatar(affiliate.user_id)"></v-img>
        </v-avatar>
        <router-link
          :to="
            isRolePanel || IS_VENDOR_PANEL
              ? {}
              : {
                  name: 'BPageAffiliateDashboard',
                  params: { affiliate_id: affiliate.id },
                }
          "
          class="me-3 text-uppercase link-dash"
          >{{ affiliate.name }}
        </router-link>
      </div>

      <!-- █████████████████████ Tips █████████████████████ -->

      <ul class="tips mt-4">
        <li
          v-for="item in $tm('process_center.payment_widget.checklist')"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>

      <!-- █████████████████████ COD Action █████████████████████ -->

      <div v-if="isCOD && !payment" class="p-2">
        <v-btn
          :class="{
            disabled:
              !isPOS &&
              order.delivery_state !==
                PhysicalOrderStates.ToCustomer
                  .code /*For online order payment can be accepted after delivery*/,
          }"
          class="my-5 text-capitalize"
          color="success"
          rounded
          size="x-large"
          @click="
            accept_action = false;
            dialog_customer_pay_money_cod = true;
          "
        >
          <v-icon
            v-if="order.delivery_state === PhysicalOrderStates.ToCustomer.code"
            class="me-2 blink-me"
            size="small"
            >fiber_manual_record
          </v-icon>

          {{ $t("process_center.payment_widget.action_cod_pay") }}

          <u-currency-icon
            :currency="order.currency"
            flag
            class="ms-2"
          ></u-currency-icon>
        </v-btn>

        <p class="mt-1">
          <i class="fas fa-info-circle me-1"></i>
          {{ $t("process_center.payment_widget.cod_pay_info") }}
        </p>
      </div>

      <!-- █████████████████████ Payment summery █████████████████████ -->

      <v-row class="text-subtitle-2" no-gutters>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Summery > Date ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <v-col
          v-if="payment"
          :md="billing_details ? 2 : 4"
          class="border-end-grater-md p-2"
          cols="6"
        >
          <small class="font-weight-bold"
            >{{ $t("process_center.payment_widget.created_date") }}
          </small>
          <p :title="getFromNowString(payment.issued_at)" class="mb-1">
            {{ getLocalTimeString(payment.issued_at) }} ●
            {{ getFromNowString(payment.issued_at) }}
          </p>

          <small class="font-weight-bold"
            >{{ $t("process_center.payment_widget.pay_date") }}
          </small>
          <p :title="getFromNowString(payment.payment_at)" class="mb-1">
            {{ getLocalTimeString(payment.payment_at) }} ●
            {{ getFromNowString(payment.payment_at) }}
          </p>
        </v-col>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Summery > Gateway ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-col v-if="gateway" class="border-end-grater-md p-2" cols="6" md="2">
          <small class="font-weight-bold"
            >{{ $t("process_center.payment_widget.payment_gateway") }}
          </small>

          <img
            :src="getShopImagePath(gateway.logo)"
            class="mx-auto d-block"
            height="24"
          />

          <p class="text-center my-1">
            {{ gateway.name }}
          </p>
          <div class="text-center">
            <v-chip class="mx-1" color="#fafafa" size="small" variant="flat">
              <v-icon
                :color="gateway.enable ? 'green' : 'red'"
                :title="
                  gateway.enable
                    ? 'Gateways service is active!'
                    : 'Gateways service is inactive!'
                "
                size="12"
                start
              >
                fa:fas fa-dot-circle
              </v-icon>
              {{
                gateway.cod
                  ? $t("global.commons.cod")
                  : gateway.cash
                    ? $t("global.commons.cash")
                    : gateway.dir
                      ? $t("global.commons.dir_payment")
                      : $t("global.commons.online")
              }}
            </v-chip>
          </div>
        </v-col>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Summery > Card + Payment method ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-col
          v-if="payment && payment.card"
          class="border-end-grater-md p-2"
          cols="6"
          md="2"
        >
          <small class="font-weight-bold"
            >{{ $t("process_center.payment_widget.payment_method") }}
          </small>

          <u-payment-card
            :card="payment.card"
            :currency="payment.currency"
            :method="payment.method"
          ></u-payment-card>

          <!-- ━━━━━━━━━━ 🎗️ Subscription Status ━━━━━━━━━━ -->
          <div
            v-if="isSubscribed"
            :title="
              next_payment_date
                ? `The next payment ~ ${getLocalDateString(
                    next_payment_date,
                  )} ● ${getFromNowString(next_payment_date)}.`
                : undefined
            "
            class="text-center"
          >
            <v-chip class="mt-1" color="primary" size="small">
              <v-icon size="small" start>credit_score</v-icon>
              Subscribed
            </v-chip>
            <template v-if="next_payment_date">
              <v-progress-linear
                :model-value="next_payment_remain_percent"
                class="mt-3"
                color="primary"
                height="4"
                rounded
                striped
              ></v-progress-linear>
              <small class="my-1">● the next payment</small></template
            >
          </div>

          <div v-if="isUnsubscribed" class="text-center">
            <v-chip class="mt-1" color="#ddd" size="small" variant="flat">
              <v-icon size="small" start>credit_card_off</v-icon>
              Unsubscribed
            </v-chip>
          </div>

          <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
        </v-col>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Summery > Risk ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-col v-if="payment" class="border-end-grater-md p-2" cols="6" md="2">
          <small class="font-weight-bold"
            >{{ $t("process_center.payment_widget.risk") }}
          </small>
          <br />

          <div class="text-center">
            <u-payment-risk-indicator
              :risk="payment.risk"
            ></u-payment-risk-indicator>
          </div>
        </v-col>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Summery > Billing ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-col
          v-if="billing_details"
          class="border-end-grater-md p-2"
          cols="6"
          md="2"
        >
          <small class="font-weight-bold"
            >{{ $t("process_center.payment_widget.billing_details") }}
          </small>
          <u-payment-billing-details
            :billing-detail="billing_details"
          ></u-payment-billing-details>
        </v-col>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Summery > Country + Map ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-col v-if="card" class="pa-2 text-center" cols="6" md="2">
          <u-map-countries-single
            :country="card.country"
          ></u-map-countries-single>
        </v-col>
      </v-row>
    </div>

    <!-- █████████████████████ Payment detail table █████████████████████ -->

    <div
      v-if="order"
      :class="{
        'mx-n6': $vuetify.display.smAndDown,
        'rounded-xl mb-4 border': !$vuetify.display.smAndDown,
      }"
      class="mt-5 overflow-hidden"
    >
      <b-order-payment-table
        :cod-enable="codEnable"
        :is-role-panel="isRolePanel"
        :order="order"
        :shop="shop"
        style="border-radius: unset"
        @fetch-order="$emit('fetch-order')"
      >
      </b-order-payment-table>
      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Footer ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <v-row align="center" class="border-top bg-light" no-gutters>
        <v-col class="p-2" cols="12" sm="3">
          <p class="font-weight-bold text-muted small my-1">
            {{
              $t("process_center.payment_widget.total_order_price_before_tax")
            }}
          </p>
          <u-price :amount="order.price" :currency="order.currency"></u-price>
        </v-col>

        <v-col v-if="tax" class="p-2" cols="12" sm="3">
          <p class="font-weight-bold text-muted small my-1">
            {{ $t("global.commons.tax") }}
          </p>

          <u-price :amount="tax" :currency="order.currency"></u-price>
        </v-col>

        <v-col cols="12" sm="6">
          <u-chart-sankey
            :config="
              (config) => {
                config.sankey().sankey().nodePadding(7);
                config.sankey().nodeDraggableY(true);
              }
            "
            :data="payment_sankey_data"
            style="height: 100px; font-size: 11px"
          >
          </u-chart-sankey>
        </v-col>
      </v-row>
    </div>
  </div>

  <!-- █████████████████████████ Dialog > Confirm COD Payment █████████████████████████ -->

  <v-bottom-sheet
    v-model="dialog_customer_pay_money_cod"
    max-width="98vw"
    width="680"
    content-class="rounded-t-xl"
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">paid</v-icon>
        {{ $t("process_center.payment_widget.pay_cod_dialog.title") }}
        <v-spacer></v-spacer>
        <u-currency-icon :currency="order.currency" flag></u-currency-icon>
      </v-card-title>

      <v-card-text class="text-start">
        <div class="mb-5">
          {{ $t("process_center.payment_widget.pay_cod_dialog.message") }}
        </div>

        <div v-if="!codGateways?.length">
          <div class="text-red py-2 text-h5">
            <v-icon>report_gmailerrorred</v-icon>
            We can not find any COD gateway to pay. Please add a COD gateway to
            your shop.

            <v-btn
              class="tnt ms-1"
              size="small"
              :to="{ name: 'BPageShopFinanceGateways' }"
              append-icon="launch"
              target="_blank"
              >Add Gateway
            </v-btn>
          </div>
          {{ $t("global.commons.currency") }}:
          <u-currency-icon :currency="order.currency" flag></u-currency-icon>
        </div>
        <u-smart-verify v-else v-model="accept_action"></u-smart-verify>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="dialog_customer_pay_money_cod = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>

          <v-btn
            v-for="item in codGateways"
            :key="item.code"
            :class="{ disabled: !accept_action }"
            :loading="busy_pay"
            color="success"
            height="64"
            rounded
            size="x-large"
            variant="elevated"
            @click="confirmCODPaymentCompleted(item.gateway.code)"
          >
            <img
              :src="getShopImagePath(item.gateway.icon)"
              :width="24"
              class="mx-2"
            />

            <p class="my-0 mx-2">
              {{ item.gateway.name }}
              <br />
              <span class="small mx-2">
                {{
                  $t(
                    "process_center.payment_widget.pay_cod_dialog.confirm_action",
                  )
                }}</span
              >
            </p>
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import UPaymentRiskIndicator from "../../../../ui/payment/risk/indicator/UPaymentRiskIndicator.vue";
import UPaymentCard from "../../../../ui/payment/card/UPaymentCard.vue";
import UPaymentBillingDetails from "../../../../ui/payment/billing-details/UPaymentBillingDetails.vue";
import UMapCountriesSingle from "../../../../ui/map/countries/single/UMapCountriesSingle.vue";
import ProductsDenseImagesCircles from "../../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import VariantItemViewMicro from "../../../../storefront/product/variant/VariantItemViewMicro.vue";
import BCampaignSourceIcon from "../../../campaign/source/icon/BCampaignSourceIcon.vue";
import BCampaignMediumIcon from "../../../campaign/medium/icon/BCampaignMediumIcon.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import BOrderPaymentRowPending from "../../../order/payment/row/pending/BOrderPaymentRowPending.vue";
import BOrderPaymentRowGiftcard from "../../../order/payment/row/giftcard/BOrderPaymentRowGiftcard.vue";
import BOrderPaymentRowPayment from "../../../order/payment/row/payment/BOrderPaymentRowPayment.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import BOrderPaymentRowTax from "../../../order/payment/row/tax/BOrderPaymentRowTax.vue";
import BAccountCard from "../../../account/card/BAccountCard.vue";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import UTextValueBox from "../../../../ui/text/value-box/UTextValueBox.vue";
import { TransactionStatus } from "@selldone/core-js/enums/payment/TransactionStatus";
import BOrderPaymentTable from "../../../order/payment/table/BOrderPaymentTable.vue";
import UChartSankey from "../../../../ui/chart/sankey/UChartSankey.vue";
import { Basket, Bill } from "@selldone/core-js";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import ClubMixin from "@selldone/components-vue/mixin/club/ClubMixin.ts";

export default {
  name: "BOrderDashboardPayment",
  mixins: [DateMixin,ClubMixin ],

  components: {
    UChartSankey,
    BOrderPaymentTable,
    UTextValueBox,
    UCurrencyIcon,
    BAccountCard,
    BOrderPaymentRowTax,
    USmartVerify,
    USmartToggle,
    BOrderPaymentRowPayment,
    BOrderPaymentRowGiftcard,
    BOrderPaymentRowPending,
    UPriceInput,
    BCampaignMediumIcon,
    BCampaignSourceIcon,
    VariantItemViewMicro,
    ProductsDenseImagesCircles,
    UMapCountriesSingle,
    UPaymentBillingDetails,
    UPaymentCard,
    UPaymentRiskIndicator,
  },
  emits: ["fetch-order"],
  props: {
    shop: {
      require: true,
      type: Object,
    },
    order: {
      require: true,
      type: Object,
    },

    codEnable: {
      require: false,
      type: Boolean,
      default: false,
    },
    isRolePanel: Boolean,
  },

  data: function () {
    return {
      PhysicalOrderStates: Basket.PhysicalOrderStates,

      TransactionStatus: TransactionStatus,

      ProductType: ProductType,

      BillStatus: Bill.Status,

      dialog_customer_pay_money_cod: false,
      accept_action: false,

      PhysicalOrderStates: Basket.PhysicalOrderStates,

      busy_check: false,

      busy_affiliate: false,

      busy_pay: false,

      expanded_bill: null,

      //---------------------------------------------
      busy_update_bill_status: null,

      //---------------------------------------------
      show_tax_detail: false,
    };
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    isPhysical() {
      return this.order.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.order.type === ProductType.VIRTUAL.code;
    },
    isFile() {
      return this.order.type === ProductType.FILE.code;
    },

    isService() {
      return this.order.type === ProductType.SERVICE.code;
    },
    isSubscription() {
      return this.order.type === ProductType.SUBSCRIPTION.code;
    },
    isAvocado() {
      return this.order.type === "AVO";
    },
    isPOS() {
      return this.order.type === "POS";
    },
    in_this_step() {
      const reserved = this.order.status === Basket.Status.Reserved.code;

      // console.log('===========',this.order.delivery_state ,reserved)
      if (this.isPhysical) {
        return (
          this.order.delivery_state ===
            Basket.PhysicalOrderStates.CheckQueue.code && reserved
        );
      } else if (this.isVirtual) {
        return (
          this.order.delivery_state ===
            Basket.VirtualOrderStates.CheckQueue.code && reserved
        );
      } else if (this.isFile) {
        return (
          this.order.delivery_state ===
            Basket.FileOrderStates.PreparingOrder.code && reserved
        );
      } else if (this.isService) {
        return (
          this.order.delivery_state ===
            Basket.ServiceOrderStates.CheckQueue.code &&
          reserved &&
          !this.in_service_billing_state
        );
      }

      // TODO: add POS! add Fulfilment!

      return false;
    },
    /**
     * Service pre checkout step:
     * All items must have service_item (set by seller in the service billing state)
     * @returns {boolean|*}
     */
    in_service_billing_state() {
      return this.isService && this.order.items.some((it) => !it.service_item);
    },
    can_add_pending_transaction() {
      return this.isService; // Always can edit bills (Not paid bills)
    },

    campaign_link() {
      // Basket
      return this.order.campaign_link;
    },

    campaign() {
      // POS Basket
      return this.order.campaign;
    },
    channel() {
      // POS Basket
      return this.order.channel;
    },

    buyer() {
      return this.order.buyer;
    },
    customer() {
      return this.order.customer;
    },

    isPayed() {
      return this.order.status === "Payed";
    },

    isRequireAction() {
      return (
        !this.isPayed &&
        this.transactions_pending.some(
          (item) => item.status === "RequireAction",
        )
      );
    },
    isProcessing() {
      return (
        !this.isPayed &&
        this.transactions_pending.some((item) => item.status === "Processing")
      );
    },
    isCanceled() {
      return (
        !this.isPayed &&
        this.transactions_pending.some((item) => item.status === "Canceled")
      );
    },
    isSucceeded() {
      return this.isPayed;
    },

    isTestPayment() {
      return this.payment && !this.payment.livemode;
    },

    card() {
      if (!this.payment) return null;
      return this.payment.card;
    },
    payment() {
      return this.order.payment;
    },

    gateway() {
      if (!this.payment) return null;
      return this.payment.gateway;
    },

    transactions_pending() {
      return this.order.transactions_pending;
    },

    billing_details() {
      if (!this.payment) return null;
      return this.payment.billing_details;
    },

    isCOD() {
      return this.codEnable && this.order.status === Basket.Status.COD.code;
    },

    codGateways() {
      if (!this.order) return null;
      return this.shop.shop_gateways.filter(
        (item) =>
          item.gateway.cod && item.gateway.currency === this.order.currency,
      );
    },

    gift_cards() {
      return this.order.gift_cards;
    },

    discount_order() {
      return this.order.discount_order;
    },

    coupon_order() {
      return this.order.coupon_order;
    },

    club_order() {
      return this.order.club_order;
    },

    lottery_order() {
      return this.order.lottery_order;
    },

    club() {
      if (!this.club_order) return null;
      return this.getCustomerClubLevel(this.club_order.club.level);
    },

    total_payed() {
      let out = 0;

      // 🟡 💶 Payment of bills:
      if (this.bills?.length) {
        this.bills.forEach((bill) => {
          if (bill.payment) out += bill.payment.amount;
        });
      }
      // 🟠 💴 Normal payment:
      else {
        if (this.payment) out += this.payment.amount;
      }

      if (this.gift_cards)
        this.gift_cards.forEach((item) => {
          out += item.amount;
        });

      return out;
    },

    payment_sankey_data() {
      const total_incentives =
        Math.abs(this.items_discount) +
        Math.abs(this.discount_code_amount) +
        Math.abs(this.coupon_amount) +
        Math.abs(this.club_amount) +
        Math.abs(this.lottery_amount) +
        Math.abs(this.total_cross_sells_discount);

      let payment_to_you =
        this.total_payed -
        (this.tax > 0 ? this.tax : 0) -
        (this.tax_shipping > 0 ? this.tax_shipping : 0);
      if (payment_to_you < 0) payment_to_you = 0;

      let items_total_price =
        this.order.price +
        this.order.discount -
        (this.order.delivery_price > 0 ? this.order.delivery_price : 0);
      if (items_total_price < 0) items_total_price = 0;

      const _ORDER = this.$t("global.commons.order");
      const _ITEMS = this.$t("global.commons.items");
      const _TAX = this.$t("global.commons.tax");
      const _SHIPPING_TAX = this.$t("global.commons.shipping_tax");
      const _PAYMENT = this.$t("global.commons.payment");
      const _DELIVERY = this.$t("global.commons.delivery");
      const _INCENTIVES = this.$t("global.commons.incentives");
      const _ITEMS_DISCOUNT = this.$t("global.commons.discount");
      const _DISCOUNT_CODE = this.$t("global.commons.discount_code");
      const _COUPON = this.$t("global.commons.coupon");
      const _CLUB = this.$t("global.commons.club");
      const _LOTTERY = this.$t("global.commons.lottery");
      const _CROSS_SELL = this.$t("global.commons.cross_sell");
      const _YOU = this.$t("global.commons.you");

      if (!this.total_payed) {
        // No payment yet!
        const out = {
          nodes: [
            {
              name: _ORDER,
              color: "#999",
            },
            {
              name: _ITEMS,
              color: "#999",
            },
          ],
          links: [
            {
              source: _ITEMS,
              target: _ORDER,
              value: items_total_price + 0.001,
            },
          ],
        };
        if (this.tax) {
          out.nodes.push({ name: _TAX, color: "#999" });
          out.links.push({
            source: _TAX,
            target: _ORDER,
            value: Math.abs(this.tax),
          });
        }

        if (this.tax_shipping) {
          out.nodes.push({ name: _SHIPPING_TAX, color: "#999" });
          out.links.push({
            source: _SHIPPING_TAX,
            target: _ORDER,
            value: Math.abs(this.tax_shipping),
          });
        }

        if (this.order.delivery_price > 0) {
          out.nodes.push({ name: _DELIVERY, color: "#999" });
          out.links.push({
            source: _DELIVERY,
            target: _ORDER,
            value: Math.abs(this.order.delivery_price),
          });
        }

        if (total_incentives) {
          out.nodes.push({ name: _INCENTIVES, color: "#401594" });
          out.links.push({
            source: _INCENTIVES,
            target: _ORDER,
            value: total_incentives,
          });

          if (this.items_discount) {
            out.nodes.push({ name: _ITEMS_DISCOUNT, color: "#13a4be" });
            out.links.push({
              source: _ITEMS_DISCOUNT,
              target: _INCENTIVES,
              value: Math.abs(this.items_discount),
            });
          }

          if (this.discount_code_amount) {
            out.nodes.push({ name: _DISCOUNT_CODE, color: "#9b0909" });
            out.links.push({
              source: _DISCOUNT_CODE,
              target: _INCENTIVES,
              value: Math.abs(this.discount_code_amount),
            });
          }

          if (this.coupon_amount) {
            out.nodes.push({ name: _COUPON, color: "#C2185B" });
            out.links.push({
              source: _COUPON,
              target: _INCENTIVES,
              value: Math.abs(this.coupon_amount),
            });
          }

          if (this.club_amount) {
            out.nodes.push({ name: _CLUB, color: "#341cd2" });
            out.links.push({
              source: _CLUB,
              target: _INCENTIVES,
              value: Math.abs(this.club_amount),
            });
          }
          if (this.lottery_amount) {
            out.nodes.push({ name: _LOTTERY, color: "#651683" });

            out.links.push({
              source: _LOTTERY,
              target: _INCENTIVES,
              value: Math.abs(this.lottery_amount),
            });
          }

          if (this.total_cross_sells_discount) {
            out.nodes.push({ name: _CROSS_SELL, color: "#cc4f0d" });
            out.links.push({
              source: _CROSS_SELL,
              target: _INCENTIVES,
              value: Math.abs(this.total_cross_sells_discount),
            });
          }
        }

        return out;
      }
      // Has payment:

      const out = {
        nodes: [
          {
            name: _ORDER,
            color: "#689F38",
          },
          { name: _PAYMENT, color: "#689F38" },

          { name: _YOU, color: "#689F38" },
        ],
        links: [
          { source: _ORDER, target: _PAYMENT, value: this.total_payed },
          {
            source: _PAYMENT,
            target: _YOU,
            value: payment_to_you,
          },
        ],
      };

      if (this.total_payed) {
        if (this.tax) {
          out.nodes.push({ name: _TAX, color: "#000000" });
          out.links.push({
            source: _PAYMENT,
            target: _TAX,
            value: Math.abs(this.tax),
          });
        }
        if (this.tax_shipping) {
          out.nodes.push({ name: _SHIPPING_TAX, color: "#000000" });
          out.links.push({
            source: _PAYMENT,
            target: _SHIPPING_TAX,
            value: Math.abs(this.tax_shipping),
          });
        }

        if (this.order.delivery_price > 0) {
          out.nodes.push({ name: _DELIVERY, color: "#000000" });
          out.links.push({
            source: _PAYMENT,
            target: _DELIVERY,
            value: Math.abs(this.order.delivery_price),
          });
        }
      }

      if (total_incentives) {
        out.nodes.push({ name: _INCENTIVES, color: "#401594" });
        out.links.push({
          source: _ORDER,
          target: _INCENTIVES,
          value: total_incentives,
        });

        if (this.items_discount) {
          out.nodes.push({ name: _ITEMS_DISCOUNT, color: "#13a4be" });
          out.links.push({
            source: _INCENTIVES,
            target: _ITEMS_DISCOUNT,
            value: Math.abs(this.items_discount),
          });
        }

        if (this.discount_code_amount) {
          out.nodes.push({ name: _DISCOUNT_CODE, color: "#9b0909" });
          out.links.push({
            source: _INCENTIVES,
            target: _DISCOUNT_CODE,
            value: Math.abs(this.discount_code_amount),
          });
        }

        if (this.coupon_amount) {
          out.nodes.push({ name: _COUPON, color: "#C2185B" });
          out.links.push({
            source: _INCENTIVES,
            target: _COUPON,
            value: Math.abs(this.coupon_amount),
          });
        }

        if (this.club_amount) {
          out.nodes.push({ name: _CLUB, color: "#341cd2" });
          out.links.push({
            source: _INCENTIVES,
            target: _CLUB,
            value: Math.abs(this.club_amount),
          });
        }
        if (this.lottery_amount) {
          out.nodes.push({ name: _LOTTERY, color: "#651683" });

          out.links.push({
            source: _INCENTIVES,
            target: _LOTTERY,
            value: Math.abs(this.lottery_amount),
          });
        }

        if (this.total_cross_sells_discount) {
          out.nodes.push({ name: _CROSS_SELL, color: "#cc4f0d" });
          out.links.push({
            source: _INCENTIVES,
            target: _CROSS_SELL,
            value: Math.abs(this.total_cross_sells_discount),
          });
        }
      }

      return out;
    },

    delivery_info() {
      return this.order.delivery_info;
    },

    offer_orders() {
      return this.order.offer_orders;
    },

    total_offers() {
      if (!this.offer_orders) return 0;
      let sum = 0;
      this.offer_orders.forEach((item) => (sum += item.amount_discount));
      return sum;
    },

    affiliate() {
      if (!this.affiliate_order) return null;
      return this.affiliate_order.affiliate;
    },
    affiliate_order() {
      return this.order.affiliate_order;
    },

    discount_code_amount() {
      return this.order.discount_order
        ? this.order.discount_order.amount_discount
        : 0;
    },

    coupon_amount() {
      return this.order.coupon_order
        ? this.order.coupon_order.amount_discount
        : 0;
    },

    club_amount() {
      return this.order.club_order ? this.order.club_order.amount_discount : 0;
    },

    lottery_amount() {
      return this.order.lottery_order
        ? this.order.lottery_order.amount_discount
        : 0;
    },

    items_discount() {
      return (
        (this.order.discount ? this.order.discount : 0) -
        (this.total_offers +
          this.discount_code_amount +
          this.coupon_amount +
          this.club_amount +
          this.lottery_amount +
          this.total_cross_sells_discount)
      );
    },

    total_price() {
      return this.order.price;
    },

    tax() {
      return this.order.tax;
    },
    tax_shipping() {
      return this.order.tax_shipping ? this.order.tax_shipping : 0;
    },

    final_price() {
      return (
        this.total_price +
        (this.order.tax_included ? 0 : this.tax) +
        this.tax_shipping
      );
    },

    currency() {
      return Currency[this.order.currency];
    },

    bills() {
      return this.order.bills?.sortByKey("id", true);
    },

    items() {
      return this.order.items;
    },

    // ――――――――――― 🎗️ Subscription ―――――――――――
    meta() {
      return this.order.meta;
    },
    isSubscribed() {
      return (
        this.isSubscription && this.order.status === Basket.Status.Payed.code
      );
    },
    isUnsubscribed() {
      return (
        this.isSubscription && this.order.status === Basket.Status.Canceled.code
      );
    },
    subscription_period() {
      return BillingPeriod[
        this.meta?.subscription_period
          ? this.meta.subscription_period
          : this.items[0]?.subscription_price?.period
      ];
    },
    next_payment_date() {
      const payment_date =
        this.isSubscribed &&
        this.order.payment?.payment_at?.convertToLocalDate();
      if (!this.subscription_period || !payment_date) return null;

      return payment_date.addHours(this.subscription_period.hours);
    },
    next_payment_remain_percent() {
      if (!this.next_payment_date) return 0;
      if (this.next_payment_date.isBeforeToday()) return 100;
      const diff = this.next_payment_date.diffHours(new Date());
      const total_hours = this.subscription_period.hours;
      const out = (100 * (total_hours - diff)) / total_hours;
      return out > 100 ? 100 : out;
    },

    bills_count() {
      return this.order.bills_count;
    },

    //------------------- Tax -------------------
    has_tax_detail() {
      return this.items.some((i) => i.tax?.amount);
    },

    total_cross_sells_discount() {
      return this.order.items.reduce((accumulator, item) => {
        return accumulator + (item.cross_dis ? item.cross_dis : 0);
      }, 0);
    },

    //------------------- Linked account -------------------
    linked_account() {
      return (
        this.order.currency &&
        this.shop.accounts?.find((x) => x.currency === this.order.currency)
      );
    },

    is_require_capture() {
      return this.payment?.status === TransactionStatus.RequireCapture.code;
    },
  },
  methods: {
    //――――――――――――――――――――――― Check payment status ―――――――――――――――――――――――

    checkPaymentStatus(gateway_code, unique_id, gateway_name) {
      this.busy_check = true;

      axios
        .get(
          window.API.GET_CHECK_PAYMENT_GATEWAY(
            this.shop.id,
            gateway_code,
            unique_id,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            if (data.success) {
              // If changed status request refresh order:
              if (
                (!this.payment && data.success) ||
                (this.payment &&
                  this.payment.status !== data.transaction_status)
              )
                this.$emit("fetch-order");

              NotificationService.showSuccessAlert(
                null,
                this.$t(
                  "process_center.payment_widget.notifications.pay_confirm_message",
                  {
                    payment_at: this.getLocalTimeString(data.payment_at),
                    gateway_name: gateway_name,
                  },
                ) +
                  `<br>Last status: ${data.status}` +
                  (data.message ? `<hr>${data.message}` : ""), // Add extra message!
              );
            } else {
              NotificationService.showWarningAlert(
                this.$t(
                  "process_center.payment_widget.notifications.pay_fail_title",
                ),
                this.$t(
                  "process_center.payment_widget.notifications.pay_fail_message",
                ) +
                  `<br>Last status: ${data.status}` +
                  (data.message ? `<hr>${data.message}` : ""), // Add extra message!
              );
            }
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_check = false;
        });
    },
    //――――――――――――――――――――――― COD > Confirm payment ―――――――――――――――――――――――

    confirmCODPaymentCompleted(gateway_code) {
      this.busy_pay = true;

      axios
        .post(
          this.isPOS
            ? window.API.POST_CONFIRM_COD_PAYMENT_MANUALLY_FOR_POS_BASKET(
                this.$route.params.shop_id,
                this.$route.params.basket_id,
                gateway_code,
              )
            : window.API.POST_CONFIRM_COD_PAYMENT_MANUALLY_FOR_ONLINE_BASKET(
                this.$route.params.shop_id,
                this.$route.params.basket_id,
                gateway_code,
              ),
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t("process_center.notifications.pay_cod_success"),
            );
            this.$emit("fetch-order");
            this.order.status = data.status;
            this.dialog_customer_pay_money_cod = false;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_pay = false;
        });
    },
  },
};
</script>

<style scoped></style>
