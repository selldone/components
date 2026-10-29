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
      'border-warning': !modern && isRequireAction,
      'border-danger': !modern && isCanceled,
      'border-info': !modern && isProcessing,
      'border-success': !modern && isSucceeded && !isTestPayment,
      'border-lime': !modern && isCOD,
      'border-purple': !modern && isSucceeded && isTestPayment,
      '-activated': !modern && in_this_step,
      'sd-modern-widget b-order-payment--modern text-start': modern,
      'b-order-payment--workspace': modern && viewMode === 'workspace',
      'widget shadow my-3 mx-1 mx-md-3 overflow-hidden pb-0': !modern,
    }"
    class="b-order-payment"
    :style="modern ? undefined : { borderTop: '2px solid #dee2e6' }"
    v-bind="$attrs"
  >
    <!-- █████████████████████ Header █████████████████████ -->

    <u-widget-header
      :title="modern ? undefined : $t('process_center.payment_widget.title')"
      icon="payment"
      :class="{ 'b-order-payment__header': modern }"
    >
      <template v-if="modern" v-slot:title>
        <span class="b-order-payment__title-stack">
          <span class="sd-modern-title-text">{{ $t('process_center.payment_widget.title') }}</span>
          <span class="sd-modern-subtitle">{{ $t('process_center.modern.payment_subtitle') }}</span>
        </span>
      </template>
      <template v-slot:actions>
        <v-sheet
          :color="modern ? undefined : '#fff'"
          rounded="xl"
          :class="modern ? 'b-order-payment__header-actions' : 'pa-1 d-flex align-center justify-space-between'"
        >
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Main payment check button ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <v-btn
            v-if="!isRolePanel && gateway && payment.unique_id"
            :loading="busy_check"
            :class="modern ? 'sd-modern-button sd-modern-button--compact b-order-payment__check' : 'me-2 tnt'"
            :color="modern ? undefined : '#333'"
            size="small"
            rounded="xl"
            variant="elevated"
            @click="
              checkPaymentStatus(gateway.code, payment.unique_id, gateway.name)
            "
          >
            <v-icon start>refresh</v-icon>
            {{ $t("global.actions.check") }}
            <img
              :src="getShopImagePath(gateway.icon)"
              class="ms-2"
              height="20"
            />
            <v-tooltip v-if="modern" activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">
              {{ $t('process_center.modern.payment_check_help', { gateway: gateway.name }) }}
            </v-tooltip>
          </v-btn>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Pending payment check button ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <v-btn
            v-for="(item, index) in transactions_pending"
            v-if="!isRolePanel"
            :key="index"
            :disabled="!item.unique_id"
            :loading="busy_check"
            :class="modern ? 'sd-modern-button sd-modern-button--compact b-order-payment__check' : 'me-2 tnt'"
            rounded="xl"
            :color="modern ? undefined : '#333'"
            size="small"
            variant="elevated"
            @click="
              checkPaymentStatus(item.gateway_code, item.unique_id, item.name)
            "
          >
            <v-icon start>refresh</v-icon>
            {{ $t("global.actions.check") }}
            <img :src="getShopImagePath(item.logo)" class="mx-1" height="20" />
            <v-tooltip v-if="modern" activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">
              {{ $t('process_center.modern.payment_check_help', { gateway: item.name }) }}
            </v-tooltip>
          </v-btn>

          <span :class="{ 'b-order-payment__currency': modern }">
            <u-currency-icon :currency="order.currency" flag small />
            <bdi v-if="modern">{{ order.currency }}</bdi>
          </span>
        </v-sheet>
      </template>
    </u-widget-header>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Live/Debug mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-list-subheader v-if="!modern" class="px-0">
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
    <div class="text-start mt-2" :class="{ 'b-order-payment__context': modern }">
      <div v-if="modern" class="b-order-payment__summary">
        <div>
          <span class="sd-modern-eyebrow">{{ $t('process_center.payment_widget.total_order_price_before_tax') }}</span>
          <u-price class="b-order-payment__amount" :amount="order.price" :currency="order.currency" />
        </div>
        <div class="b-order-payment__statuses" role="status">
          <span v-if="isRequireAction" class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot bg-warning" />{{ $t('process_center.payment_widget.waiting_for_pay') }}</span>
          <span v-if="isProcessing" class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot bg-info" />{{ $t('process_center.payment_widget.processing_payment') }}</span>
          <span v-if="is_require_capture" class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot bg-warning" />{{ $t('process_center.payment_widget.require_capture') }}</span>
          <span v-if="isCanceled" class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot bg-error" />{{ $t('process_center.payment_widget.processing_cancel') }}</span>
          <span v-if="isSucceeded" class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot bg-success" />{{ $t('process_center.payment_widget.paid') }}</span>
          <span v-if="isCOD" class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot bg-warning" />{{ $t('global.commons.cod') }}</span>
          <span v-if="payment" class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot" :class="payment.livemode ? 'bg-success' : 'bg-warning'" />{{ payment.livemode ? $t('shop_gateway.transactions.live_mode') : $t('shop_gateway.transactions.test_mode') }}</span>
          <span v-if="order.subscription_id" class="sd-modern-status sd-modern-status--plain"><v-icon size="16">shopping_bag</v-icon>SN-{{ order.subscription_id }}</span>
        </div>
      </div>
      <p v-else>
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

      <v-row :class="{ 'b-order-payment__identities': modern }">
        <v-col v-if="buyer || !customer /*Guest*/" cols="12" sm="6">
          <!-- ⬬⬬⬬⬬⬬⬬⬬ Buyer > 🥵 User ⬬⬬⬬⬬⬬⬬⬬ -->

          <div v-if="buyer" class="py-2 d-flex align-items-center" :class="{ 'b-order-payment__identity': modern }">
            <small
              class="me-3 ms-1 flex-grow-1 flex-sm-grow-0 op-0-5"
              title="This is the user's profile on Selldone. It remains consistent across all stores on Selldone."
              >{{ $t("global.commons.buyer") }}
            </small>
            <component
              :is="order.customer_id && !modern ? 'router-link' : 'span'"
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
              <v-avatar class="m-1 hover-scale force-top" :class="{ 'b-order-payment__avatar': modern }" size="42">
                <v-img v-if="modern && buyer.id" :src="getUserAvatar(buyer.id)" :alt="buyer.name">
                  <template #error><v-icon size="22" aria-hidden="true">person_outline</v-icon></template>
                </v-img>
                <v-icon v-else-if="modern" size="22" aria-hidden="true">person_outline</v-icon>
                <img v-else :src="getUserAvatar(buyer.id)" />
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
            <v-btn
              v-if="modern && order.customer_id && !isRolePanel && !IS_VENDOR_PANEL"
              :to="{ name: 'BPageCustomerDashboard', params: { customer_id: order.customer_id } }"
              target="_blank"
              rel="noopener noreferrer"
              icon
              variant="text"
              class="sd-modern-icon-button b-order-payment__profile"
              :aria-label="$t('process_center.modern.open_buyer_profile')"
              @click.stop
            >
              <v-icon size="16" aria-hidden="true">north_east</v-icon>
              <v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('process_center.modern.open_buyer_profile') }}</v-tooltip>
            </v-btn>
          </div>
          <!-- ⬬⬬⬬⬬⬬⬬⬬ Buyer > 🥶 Guest ⬬⬬⬬⬬⬬⬬⬬ -->

          <div v-else-if="!customer" class="py-2 d-flex align-items-center" :class="{ 'b-order-payment__identity': modern }">
            <small class="me-3 ms-1 flex-grow-1 flex-sm-grow-0 op-0-5"
              >{{ $t("global.commons.buyer") }}
            </small>

            <v-avatar class="m-1 hover-scale force-top flex-grow-0" :class="{ 'b-order-payment__avatar': modern }" size="42">
              <img :src="require('../../../../assets/icons/user.svg')" />
            </v-avatar>

            <div class="ps-2">
              <p class="m-0 font-weight-bold">
                <span class="highlight-yellow">{{
                  $t("global.commons.guest")
                }}</span>
              </p>
              <p v-if="order.guest_email" class="m-0 text-subtitle-2">
                <v-icon class="me-1" size="small">email</v-icon>
                <span v-copy class="p-0">{{ order.guest_email }}</span>
              </p>
            </div>
          </div>
        </v-col>

        <v-col v-if="customer" cols="12" sm="6">
          <!-- ⬬⬬⬬⬬⬬⬬⬬ Buyer > 🧜 Customer ⬬⬬⬬⬬⬬⬬⬬ -->

          <div class="py-2 d-flex align-items-center" :class="{ 'b-order-payment__identity': modern }">
            <small
              class="me-3 ms-1 flex-grow-1 flex-sm-grow-0 op-0-5"
              title="This is the user's profile in your shop, and you can edit it."
              >{{ $t("global.commons.customer") }}</small
            >
            <v-avatar v-if="modern" size="34" class="b-order-payment__avatar flex-grow-0">
              <v-img v-if="customer.user_id" :src="getUserAvatar(customer.user_id)" :alt="customer.name">
                <template #error><v-icon size="22" aria-hidden="true">person_outline</v-icon></template>
              </v-img>
              <v-icon v-else size="22" aria-hidden="true">person_outline</v-icon>
            </v-avatar>
            <v-btn
              v-else
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
                v-if="customer.name && (modern || !buyer || customer.name !== buyer.name)"
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
            <v-btn
              v-if="modern && order.customer_id && !isRolePanel && !IS_VENDOR_PANEL"
              :to="{ name: 'BPageCustomerDashboard', params: { customer_id: order.customer_id } }"
              target="_blank"
              rel="noopener noreferrer"
              icon
              variant="text"
              class="sd-modern-icon-button b-order-payment__profile"
              :aria-label="$t('process_center.modern.open_customer_profile')"
              @click.stop
            >
              <v-icon size="16" aria-hidden="true">north_east</v-icon>
              <v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('process_center.modern.open_customer_profile') }}</v-tooltip>
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <!-- █████████████████████ Custom Checkout Input Form █████████████████████ -->
      <div v-if="checkout_form?.length" class="max-w-550">
        <u-text-value-box
          v-for="_item in checkout_form?.filter(
            (x) => x.type !== 'note' /*No need to show notes!*/,
          )"
          vb75
          :label="_item.title ? _item.title : _item.name"
          :value="order_form ? order_form[_item.name] : null"
        >
          <template v-if="!_item.type || _item.type === 'text'">
            <v-icon
              v-if="order_form && order_form[_item.name]"
              class="ms-1"
              size="small"
              color="green"
              >check_circle
            </v-icon>
            <template v-else>
              <v-icon class="me-1" size="small" color="red">cancel</v-icon>
              <small class="op-0-7">{{ $t("global.commons.empty") }}</small>
            </template>
          </template>
        </u-text-value-box>
      </div>

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

      <ul v-if="!modern" class="tips mt-4">
        <li
          v-for="item in $tm('process_center.payment_widget.checklist')"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>

      <!-- █████████████████████ COD Action █████████████████████ -->

      <div v-if="!isRolePanel && isCOD && !payment" class="p-2">
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

      <v-row class="text-subtitle-2" :class="{ 'b-order-payment__facts': modern }" no-gutters>
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
            <span v-if="modern" class="sd-modern-status sd-modern-status--plain b-order-payment__gateway-status" tabindex="0">
              <span class="sd-modern-status__dot" :class="gateway.enable ? 'bg-success' : 'bg-error'" aria-hidden="true" />
              {{ gateway.cod ? $t('global.commons.cod') : gateway.cash ? $t('global.commons.cash') : gateway.dir ? $t('global.commons.dir_payment') : $t('global.commons.online') }}
              <v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t(gateway.enable ? 'process_center.modern.gateway_enabled' : 'process_center.modern.gateway_disabled') }}</v-tooltip>
            </span>
            <v-chip v-else class="mx-1" color="#fafafa" size="small" variant="flat">
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
          <div v-if="modern && gateway.code" class="b-order-payment__gateway-code">
            <span class="sd-modern-eyebrow">{{ $t('process_center.modern.gateway_code') }}</span>
            <bdi>{{ gateway.code }}</bdi>
          </div>
        </v-col>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Summery > Card + Payment method ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-col
          v-if="payment && (payment.card || modern)"
          class="border-end-grater-md p-2"
          cols="6"
          md="2"
        >
          <template v-if="payment.card">
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
          </template>
          <div v-if="modern" class="b-order-payment__risk">
            <u-payment-risk-indicator v-if="payment.risk !== null && payment.risk !== undefined" :risk="payment.risk" small />
            <span v-else aria-hidden="true">—</span>
            <div>
              <span class="sd-modern-eyebrow b-order-payment__risk-label">
                {{ $t('process_center.payment_widget.risk') }}
                <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="$t('process_center.payment_widget.risk')">
                  <v-icon size="14" aria-hidden="true">info_outline</v-icon>
                  <v-tooltip activator="parent" location="top" :open-on-focus="true" :open-on-click="true" content-class="sd-modern-tooltip text-start">{{ $t('process_center.modern.payment_risk_help') }}</v-tooltip>
                </v-btn>
              </span>
              <p>{{ $t(payment.risk !== null && payment.risk !== undefined ? 'process_center.modern.risk_review' : 'process_center.modern.risk_not_recorded') }}</p>
            </div>
          </div>
        </v-col>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Summery > Risk ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-col v-if="payment && !modern" class="border-end-grater-md p-2" cols="6" md="2">
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
          class="border-end-grater-md p-2 b-order-payment__billing-fact"
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

        <v-col v-if="card" class="pa-2 text-center b-order-payment__country-fact" cols="6" md="2">
          <u-map-countries-single
            :country="card.country"
          ></u-map-countries-single>
        </v-col>
      </v-row>
      <div v-if="modern" class="sd-modern-notice b-order-payment__review">
        <v-icon size="17" aria-hidden="true">checklist</v-icon>
        <p>{{ $t(isVirtual ? 'process_center.modern.virtual_payment_review' : 'process_center.modern.payment_review') }}</p>
      </div>
    </div>

    <!-- █████████████████████ Payment detail table █████████████████████ -->

    <div
      v-if="order"
      :class="{
        'mx-n6': !modern && $vuetify.display.smAndDown,
        'rounded-xl mb-4 border': !modern && !$vuetify.display.smAndDown,
        'b-order-payment__ledger': modern,
        'mt-5 overflow-hidden': !modern,
      }"
    >
      <b-order-payment-table
        :cod-enable="codEnable"
        :is-role-panel="isRolePanel"
        :order="order"
        :shop="shop"
        :modern="modern"
        :class="{ 'b-order-payment-table--workspace': modern && viewMode === 'workspace' }"
        style="border-radius: unset"
        @fetch-order="$emit('fetch-order')"
      >
      </b-order-payment-table>
      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Footer ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <v-row align="center" :class="modern ? 'b-order-payment__footer' : 'border-top bg-light'" no-gutters>
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

        <v-col cols="12" sm="6" :class="{ 'b-order-payment__flow': modern }">
          <div v-if="modern" class="b-order-payment__flow-heading">
            <h3>{{ $t('process_center.modern.payment_flow') }}</h3>
            <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="$t('process_center.modern.payment_flow')">
              <v-icon size="14" aria-hidden="true">info_outline</v-icon>
              <v-tooltip activator="parent" location="top" :open-on-focus="true" :open-on-click="true" content-class="sd-modern-tooltip text-start">{{ $t('process_center.modern.payment_flow_help') }}</v-tooltip>
            </v-btn>
            <span class="b-order-payment__currency"><u-currency-icon :currency="order.currency" flag small /><bdi>{{ order.currency }}</bdi></span>
          </div>
          <u-chart-sankey
            :config="configurePaymentSankey"
            :generator="modern ? modern_sankey_generator : undefined"
            :data="payment_sankey_chart_data"
            :class="{ 'b-order-payment__sankey': modern }"
            :style="modern ? undefined : { height: '100px', fontSize: '11px' }"
          >
          </u-chart-sankey>
          <details v-if="modern" class="b-order-payment__flow-values">
            <summary>{{ $t('process_center.modern.payment_flow_values') }} · <bdi>{{ order.currency }}</bdi></summary>
            <table class="sd-modern-table">
              <thead><tr><th scope="col">{{ $t('global.commons.title') }}</th><th scope="col">{{ $t('global.commons.amount') }}</th></tr></thead>
              <tbody>
                <template v-for="node in payment_sankey_chart_data.nodes" :key="node.name">
                  <tr v-if="node.amount != null"><th scope="row">{{ node.name }}</th><td><bdi>{{ formatSankeyAmount(node.amount) }}</bdi></td></tr>
                </template>
              </tbody>
            </table>
          </details>
          <p v-if="modern" class="sd-modern-subtitle b-order-payment__flow-help">{{ $t('process_center.modern.payment_flow_drag') }}</p>
        </v-col>
      </v-row>
    </div>
  </div>

  <!-- █████████████████████████ Dialog > Confirm COD Payment █████████████████████████ -->

  <v-bottom-sheet
    v-if="!isRolePanel"
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
import chartSankey from "../../../../ui/chart/sankey/core/sankey.js";
import { CurrencyHelper } from "@selldone/core-js/helper/currency/CurrencyHelper";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { Basket, Bill, ShopOptionsHelper } from "@selldone/core-js";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import ClubMixin from "@selldone/components-vue/mixin/club/ClubMixin.ts";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";

export default {
  name: "BOrderDashboardPayment",
  mixins: [DateMixin, ClubMixin, CurrencyMixin],
  inject: { $shop: { default: null } },

  components: {
    UWidgetHeader,
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
    modern: { type: Boolean, default: false },
    viewMode: {
      type: String,
      default: 'refined',
      validator: (value: string) => ['refined', 'workspace'].includes(value),
    },
  },

  data: function () {
    return {
      PhysicalOrderStates: Basket.PhysicalOrderStates,

      TransactionStatus: TransactionStatus,

      ProductType: ProductType,

      BillStatus: Bill.Status,

      dialog_customer_pay_money_cod: false,
      accept_action: false,

      busy_check: false,

      busy_affiliate: false,

      busy_pay: false,

      expanded_bill: null,

      //---------------------------------------------
      busy_update_bill_status: null,

      //---------------------------------------------
      show_tax_detail: false,
      // Keep this order's presentation settings out of other shared chart instances.
      modern_sankey_generator: chartSankey(),
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

    //------------------------------------------------------------------------
    checkout() {
      return ShopOptionsHelper.GetCheckout(this.shop || this.$shop);
    },

    /**
     * Select the custom checkout form
     */
    checkout_form() {
      const country = this.order.receiver_info?.country
        ? this.order.receiver_info.country
        : this.order.billing?.country;
      if (country && this.checkout[`form_${country}`]) {
        return this.checkout[`form_${country}`];
      }
      return this.checkout?.form;
    },
    order_form() {
      return this.order?.form;
    },
    //------------------------------------------------------------------------

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

    payment_sankey_chart_data() {
      const data = this.payment_sankey_data;
      if (!this.modern) return data;

      const label = (key) => this.$t(`global.commons.${key}`);
      const colors = {
        [label("order")]: "#85828b",
        [label("items")]: "#85828b",
        [label("payment")]: "#6b62bb",
        [label("you")]: "#268754",
        [label("tax")]: "#ba8b3f",
        [label("shipping_tax")]: "#ba8b3f",
        [label("incentives")]: "#7953b5",
        [label("discount")]: "#13a4be",
        [label("coupon")]: "#c2185b",
        [label("club")]: "#651fff",
      };
      // Display recorded amounts, not D3's max(inflow,outflow) or layout epsilon.
      const amounts = {
        [label("items")]: Math.max(
          0,
          this.order.price + this.order.discount -
          (this.order.delivery_price > 0 ? this.order.delivery_price : 0),
        ),
        [label("payment")]: this.total_payed,
        [label("you")]: data.links.find((link) => link.target === label("you"))?.value,
        [label("tax")]: Math.abs(this.tax),
        [label("shipping_tax")]: Math.abs(this.tax_shipping),
        [label("delivery")]: Math.abs(this.order.delivery_price),
        [label("discount")]: Math.abs(this.items_discount),
        [label("discount_code")]: Math.abs(this.discount_code_amount),
        [label("coupon")]: Math.abs(this.coupon_amount),
        [label("club")]: Math.abs(this.club_amount),
        [label("lottery")]: Math.abs(this.lottery_amount),
        [label("cross_sell")]: Math.abs(this.total_cross_sells_discount),
        [label("incentives")]:
          Math.abs(this.items_discount) + Math.abs(this.discount_code_amount) +
          Math.abs(this.coupon_amount) + Math.abs(this.club_amount) +
          Math.abs(this.lottery_amount) + Math.abs(this.total_cross_sells_discount),
      };
      const nodes = data.nodes.map((node) => ({
        ...node,
        color: colors[node.name] || node.color,
        amount: amounts[node.name],
      }));
      const links = data.links.map((link) => {
        const color = nodes.find((node) => node.name === link.target)?.color;
        return { ...link, sourceColor: color, targetColor: color };
      });
      return { ...data, padding: 0, nodes, links };
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
    configurePaymentSankey(config) {
      const sankey = config.sankey();
      sankey.sankey().nodePadding(this.modern ? 32 : 7);
      sankey.nodeDraggableY(true);
      if (!this.modern) return;
      sankey.sankey().nodeWidth(7).nodeSort(null);
      sankey.nodeValueLabel((node) =>
        node.amount == null ? null : this.formatSankeyAmount(node.amount),
      );
    },

    formatSankeyAmount(amount) {
      const value = this.FormatNumberCurrency(amount, this.order.currency);
      const sign = this.GetUserSelectedCurrencyName(this.order.currency, true);
      const atEnd = this.shop?.theme?.reverse_currency ||
        CurrencyHelper.GetUserSelectedCurrencySignAtEnd(this.GetUserSelectedCurrency(), this.order.currency);
      return atEnd ? `${value} ${sign}` : `${sign}${value}`;
    },

    //――――――――――――――――――――――― Check payment status ―――――――――――――――――――――――

    checkPaymentStatus(gateway_code, unique_id, gateway_name) {
      // Payment reconciliation and collection use shop APIs, outside role actions.
      if (this.isRolePanel) return;
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
                    payment_at: `<b>${this.getLocalTimeString(data.payment_at)}</b>`,
                    gateway_name: `<b>${gateway_name}</b>`,
                  },
                ) +
                  `<br>Last status: <b>${data.status}</b>` +
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
      if (this.isRolePanel) return;
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

<style lang="scss" scoped>
.b-order-payment--modern {
  margin: 0 0 18px;
  padding: 20px 20px 0;
  border-radius: 16px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  overflow: visible;

  .b-order-payment__header {
    margin-block-end: 17px;
    align-items: center !important;

    :deep(h2) { align-items: flex-start !important; min-width: 0; font-family: inherit; font-size: 18px !important; font-weight: 500 !important; line-height: 24px !important; }
    :deep(.--icon) { margin-block-start: 2px; font-size: 20px !important; color: var(--sd-modern-muted); }
  }

  .b-order-payment__title-stack { display: flex; flex-direction: column; gap: 4px; }
  .b-order-payment__title-stack .sd-modern-title-text { font-size: 18px; font-weight: 500; line-height: 24px; letter-spacing: 0; }
  .b-order-payment__title-stack .sd-modern-subtitle { margin: 0; font-size: 12px; font-weight: 400; line-height: 18px; }
  .b-order-payment__header-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; background: transparent; }
  .b-order-payment__currency { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 400; color: var(--sd-modern-muted); }
  .b-order-payment__check { flex: 0 0 auto; min-width: 104px; height: 32px; min-height: 32px; padding: 4px 8px 4px 10px; border-radius: 999px; background: rgb(var(--v-theme-on-surface)); color: rgb(var(--v-theme-surface)); box-shadow: none; white-space: nowrap; }
  .b-order-payment__check :deep(.v-btn__content) { gap: 5px; font-size: 12px; line-height: 18px; white-space: nowrap; }
  .b-order-payment__check :deep(.v-icon) { font-size: 14px; margin: 0; }
  .b-order-payment__context { margin: 0 !important; }
  .b-order-payment__summary { display: flex; align-items: center; flex-wrap: wrap; gap: 18px; padding-block: 2px 19px; }
  .b-order-payment__summary .sd-modern-eyebrow { font-size: 10px; font-weight: 400; line-height: 15px; letter-spacing: .65px; }
  .b-order-payment__amount { display: block; margin-block-start: 3px; font-size: 24px; line-height: 31px; font-weight: 500; letter-spacing: -.5px; }
  .b-order-payment__amount :deep(.small) { font-size: 14px !important; font-weight: 500; }
  .b-order-payment__statuses { display: flex; flex-direction: column; gap: 4px; }
  .b-order-payment__statuses .sd-modern-status { font-size: 12px; line-height: 18px; }
  .b-order-payment__identities { margin: 0; padding-block: 13px; border-block: 1px solid var(--sd-modern-border); }
  .b-order-payment__identities > div { padding: 0; min-width: 0; }
  .b-order-payment__identity { display: grid !important; grid-template-columns: 34px minmax(0, 1fr) auto; column-gap: 10px; align-items: center; padding-inline-end: 16px; }
  .b-order-payment__identity > small { grid-column: 2; grid-row: 1; margin: 0 !important; opacity: 1; }
  .b-order-payment__identity > .flex-grow-0 { grid-column: 1; grid-row: 1 / 3; margin: 0 !important; }
  .b-order-payment__identity > .ps-2 { grid-column: 2; grid-row: 2; min-width: 0; padding: 0 !important; overflow-wrap: anywhere; }
  .b-order-payment__identity > .b-order-payment__profile { grid-column: 3; grid-row: 1 / 3; }
  .b-order-payment__avatar { margin: 0 !important; background: rgba(var(--v-theme-on-surface), .04); }
  .b-order-payment__avatar :deep(.v-img__error) { display: flex; align-items: center; justify-content: center; }
  .b-order-payment__identities :deep(.v-avatar) { width: 34px !important; height: 34px !important; min-width: 34px; }
  .b-order-payment__identities :deep(.highlight-yellow) { background: transparent; color: inherit; }
  .b-order-payment__identities :deep(.font-weight-bold) { font-size: 12px; line-height: 18px; font-weight: 500 !important; }
  .b-order-payment__identities :deep(.text-subtitle-2) { font-family: inherit !important; font-size: 11px !important; line-height: 17px; font-weight: 400; }
  .b-order-payment__identities :deep(small) { font-size: 10px; line-height: 15px; font-weight: 400; letter-spacing: .65px; text-transform: uppercase; color: var(--sd-modern-muted); }
  .b-order-payment__review { margin-block: 16px; padding: 11px 12px; gap: 9px; align-items: flex-start; font-size: 11px; line-height: 17px; }
  .b-order-payment__review p { margin: 0; }
  .b-order-payment__facts { display: flex; flex-wrap: wrap; padding-block: 17px; row-gap: 18px; }
  .b-order-payment__facts > div { flex: 1 1 135px; min-width: 0; max-width: none; padding: 0 12px !important; font-size: 12px; line-height: 18px; }
  .b-order-payment__facts > div:first-child { padding-inline-start: 0 !important; }
  .b-order-payment__facts > div + div { border-inline-start: 1px solid var(--sd-modern-border); }
  .b-order-payment__facts > div > small { display: block; margin-block-end: 7px; font-size: 10px; line-height: 15px; font-weight: 400 !important; letter-spacing: .65px; text-transform: uppercase; color: var(--sd-modern-muted); }
  .b-order-payment__facts > div > small .sd-modern-info-button { margin-block: -8px; }
  .b-order-payment__facts > div > p { margin-block: 0 7px !important; font-size: 11px; line-height: 17px; text-wrap: balance; }
  .b-order-payment__facts > div > img { margin-inline: 0 !important; }
  .b-order-payment__facts :deep(.v-chip) { height: auto; background: transparent !important; padding: 0; font-size: 11px; line-height: 17px; }
  .b-order-payment__facts :deep(.v-chip__underlay) { display: none; }
  .b-order-payment__facts :deep(.text-center) { text-align: start !important; }
  .b-order-payment__facts :deep(.b-order-payment__facts > div > br) { display: none; }
  .b-order-payment__gateway-status { gap: 6px; font-size: 11px; line-height: 17px; }
  .b-order-payment__gateway-status .sd-modern-status__dot { flex-shrink: 0; margin: 0; }
  .b-order-payment__gateway-code { display: flex; flex-direction: column; gap: 3px; margin-block-start: 12px; overflow-wrap: anywhere; font-size: 11px; }
  .b-order-payment__gateway-code .sd-modern-eyebrow,
  .b-order-payment__risk-label { font-size: 10px; font-weight: 400; line-height: 15px; letter-spacing: .65px; }
  .b-order-payment__risk { display: flex; align-items: center; gap: 8px; margin-block-start: 14px; }
  .b-order-payment__risk > :deep(.v-avatar) { flex: none; }
  .b-order-payment__risk > div { min-width: 0; }
  .b-order-payment__risk-label { display: inline-flex; align-items: center; gap: 4px; margin: 0; }
  .b-order-payment__risk-label .sd-modern-info-button { margin-block: -8px; }
  .b-order-payment__risk p { margin: 2px 0 0; font-size: 11px; font-weight: 400; line-height: 17px; color: var(--sd-modern-muted); }
  .b-order-payment__ledger { margin-block-start: 2px; }
  .b-order-payment__footer { margin: 0; border-block-start: 1px solid var(--sd-modern-border); display: flex; flex-wrap: wrap; }
  .b-order-payment__footer > div:not(.b-order-payment__flow) { flex: 0 1 25%; padding: 17px 9px !important; font-size: 13px; font-weight: 400; }
  .b-order-payment__footer > div > .font-weight-bold { margin-block: 0 5px !important; font-size: 10px; line-height: 15px; font-weight: 400 !important; text-transform: uppercase; letter-spacing: .65px; color: var(--sd-modern-muted) !important; }
  .b-order-payment__footer :deep(.u--price) { font-size: 13px; font-weight: 400; }
  .b-order-payment__footer :deep(.u--price .small) { font-size: inherit !important; font-weight: 400; }
  .b-order-payment__flow { flex: 0 0 100%; max-width: 100%; padding: 17px 0 16px; border-block-start: 1px solid var(--sd-modern-border); container-type: inline-size; }
  .b-order-payment__flow-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin-block-end: 12px; }
  .b-order-payment__flow-heading h3 { margin: 0; font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; }
  .b-order-payment__flow-heading > .b-order-payment__currency { margin-inline-start: auto; }
  .b-order-payment__flow-help { margin-block: 8px 0; font-size: 11px; font-weight: 400; line-height: 17px; }
  .b-order-payment__sankey { height: 250px; padding: 15px 10px 29px; font-family: inherit; font-size: 11px; }
  .b-order-payment__sankey :deep(svg.d2b-chart) { overflow: visible; }
  .b-order-payment__sankey :deep(text) { fill: rgb(var(--v-theme-on-surface)); font-family: inherit; font-size: 11px; font-weight: 400; }
  .b-order-payment__sankey :deep(.d2b-sankey-node-value) { opacity: .7; direction: ltr; unicode-bidi: isolate; }
  .b-order-payment__sankey :deep(.d2b-sankey-nodes rect) { stroke: none; opacity: 1; }
  .b-order-payment__sankey :deep(.d2b-sankey-link path),
  .b-order-payment__sankey :deep(.d2b-sankey-link rect) { opacity: .24; transition: opacity .15s; }
  .b-order-payment__sankey :deep(.d2b-sankey-link:hover path),
  .b-order-payment__sankey :deep(.d2b-sankey-link:hover rect) { opacity: .55; }
  .b-order-payment__flow-values { display: none; font-size: 11px; line-height: 17px; }
  .b-order-payment__flow-values summary { display: list-item; min-height: 44px; padding-block: 12px; color: rgb(var(--v-theme-primary)); cursor: pointer; }
  .b-order-payment__flow-values table { width: 100%; border-collapse: collapse; }
  .b-order-payment__flow-values th, .b-order-payment__flow-values td { padding: 7px 3px; border-block-end: 1px solid var(--sd-modern-border); text-align: start; font-weight: 400; }
  .b-order-payment__flow-values th:last-child, .b-order-payment__flow-values td:last-child { text-align: end; }

  @container (max-width: 295px) {
    .b-order-payment__sankey :deep(.d2b-sankey-node-value) { display: none; }
    .b-order-payment__flow-values { display: block; }
  }

  @media (prefers-reduced-motion: reduce) {
    .b-order-payment__sankey :deep(.d2b-sankey-link path),
    .b-order-payment__sankey :deep(.d2b-sankey-link rect) { transition: none; }
  }
  @media (max-width: 580px) { .b-order-payment__sankey { height: 285px; padding-inline: 8px; } }

  @media (min-width: 681px) and (max-width: 1100px) {
    .b-order-payment__facts > div { flex-basis: 30%; }
    .b-order-payment__facts > div:nth-child(3n + 1) { padding-inline-start: 0 !important; border-inline-start: 0; }
  }
  @media (max-width: 680px) {
    padding: 17px 13px 0;
    border-radius: 13px;
    .b-order-payment__header { flex-direction: column !important; align-items: stretch !important; }
    .b-order-payment__header :deep(> div:first-child) { flex-wrap: wrap; width: 100%; }
    .b-order-payment__header :deep(h2) { flex-basis: 100%; }
    .b-order-payment__header :deep(> div:first-child > .v-spacer) { display: none; }
    .b-order-payment__header-actions { flex-basis: 100%; width: 100%; justify-content: space-between; padding-block-start: 12px; }
    .b-order-payment__check { height: 44px; min-height: 44px; }
    .b-order-payment__identities { row-gap: 12px; }
    .b-order-payment__facts > div { flex-basis: 40%; padding-inline: 0 12px !important; border: 0 !important; }
    .b-order-payment__footer > div:not(.b-order-payment__flow) { flex-basis: 50%; }
  }
  @media (pointer: coarse) { .b-order-payment__check { height: 44px; min-height: 44px; } }

  @media (min-width: 801px) {
    &.b-order-payment--workspace {
      display: grid;
      grid-template-columns: minmax(0, 1.9fr) minmax(230px, 1fr);
      column-gap: 20px;

      .b-order-payment__header { grid-column: 1 / -1; min-width: 0; }
      .b-order-payment__context { grid-column: 2; grid-row: 2; min-width: 0; padding-inline-start: 18px; border-inline-start: 1px solid var(--sd-modern-border); }
      // Keep the original table, footer and chart mounted while changing their placement.
      .b-order-payment__ledger { display: contents; }
      .b-order-payment__ledger > :deep(.b-order-payment-table--modern) { grid-column: 1; grid-row: 2; min-width: 0; align-self: start; }
      .b-order-payment__footer { grid-column: 1 / -1; grid-row: 3; margin-block-start: 16px; }
      .b-order-payment__identities { gap: 15px; }
      .b-order-payment__identities > div { flex-basis: 100%; max-width: 100%; }
      .b-order-payment__identity { padding-inline-end: 0; }
      .b-order-payment__facts { row-gap: 16px; }
      .b-order-payment__facts > div { flex-basis: 40%; padding: 0 !important; padding-inline-end: 10px !important; border: 0 !important; }
      .b-order-payment__facts > .b-order-payment__billing-fact,
      .b-order-payment__facts > .b-order-payment__country-fact { flex-basis: 100%; }
      .b-order-payment__country-fact > :deep(.text-center) { display: flex; align-items: center; gap: 8px; overflow-wrap: anywhere; }
      .b-order-payment__country-fact :deep(.vue-world-map) { flex: 0 0 76px; width: 76px; height: 64px !important; margin: 0 !important; }
      .b-order-payment__review { flex-wrap: nowrap; }
      .b-order-payment__review > .v-icon { flex: none; }
      .b-order-payment__review p { flex: 1; min-width: 0; }
    }
  }
}
</style>
