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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div
    :class="modern ? 'b-shop-subscriptions text-start' : 'widget-box -large'"
  >
    <section :class="{ 'sd-modern-widget': modern }">
      <header v-if="modern" class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon size="20">history</v-icon></span
          >
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("shop_license.workspace.history_title") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ $t("shop_license.workspace.history_help") }}
            </p>
          </div>
        </div>
        <v-btn
          class="sd-modern-button sd-modern-button--primary"
          color="primary"
          variant="flat"
          :disabled="disabled || busy_buy"
          prepend-icon="add"
          @click="openPurchase"
        >
          {{ $t("shop_license.add") }}
        </v-btn>
      </header>
      <u-widget-header
        v-else
        :add-caption="$t('shop_license.add')"
        :title="$t('shop_license.licenses_table.title')"
        icon="payments"
        @click:add="openPurchase"
      >
      </u-widget-header>

      <v-list-subheader v-if="!modern"
        >{{ $t("shop_license.licenses_table.subtitle") }}
      </v-list-subheader>

      <!-- ████████████████████ Shop Subscriptions ████████████████████ -->

      <v-data-table
        v-model:page="history_page"
        :header-props="{ sortByText: $t('global.commons.sort_by') }"
        :headers="headers"
        :items="subscriptions"
        :loading="busy_fetch"
        :class="
          modern
            ? 'sd-modern-data-table b-shop-subscriptions__table'
            : 'bg-transparent mb-6'
        "
        :density="modern ? 'compact' : undefined"
        :mobile="modern ? $vuetify.display.smAndDown : undefined"
        :items-per-page="modern ? 10 : undefined"
        item-key="id"
        :hide-default-footer="modern || subscriptions.length < 5"
      >
        <template v-if="modern" #header.renewal="{ column }">
          <span>{{ column.title }}</span>
          <v-tooltip
            content-class="sd-modern-tooltip text-start"
            location="top"
            open-on-focus
            open-on-click
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="sd-modern-info-button ms-1"
                variant="text"
                icon
                size="x-small"
                :aria-label="$t('shop_license.workspace.renewal_help')"
                ><v-icon size="15">info_outline</v-icon></v-btn
              >
            </template>
            {{ $t("shop_license.workspace.renewal_help") }}
          </v-tooltip>
        </template>
        <template v-slot:item.code="{ item }">
          <div
            :class="modern ? 'b-shop-subscriptions__plan' : 'min-width-150 p-2'"
          >
            <div :class="{ 'b-shop-subscriptions__identity': modern }">
              <img
                :src="getShopLicenseIcon(item.code)"
                :class="{ 'me-1': !modern }"
                :height="modern ? 17 : 24"
                :width="modern ? 17 : 24"
                alt=""
              />
              {{ modern ? getShopLicenseName(item.code) : item.code }}
            </div>

            <u-time-progress-bar
              :class="{ 'b-shop-subscriptions__progress': modern }"
              :created-time="item.created_at"
              :end-time="item.end_at"
              :start-time="item.start_at"
              :small="modern"
              :active-color="modern ? 'primary' : undefined"
              :waiting-color="modern ? 'primary' : undefined"
            ></u-time-progress-bar>
          </div>
        </template>

        <template v-slot:item.start_at="{ item }">
          <div v-if="modern" class="b-shop-subscriptions__date-range">
            <v-tooltip
              v-for="field in ['start_at', 'end_at']"
              :key="field"
              content-class="sd-modern-tooltip text-start"
              location="top"
              open-on-focus
              open-on-click
            >
              <template #activator="{ props }">
                <time
                  v-bind="props"
                  :class="{
                    'b-shop-subscriptions__date-end': field === 'end_at',
                  }"
                  :datetime="item[field]"
                  tabindex="0"
                  :aria-label="
                    $t(
                      field === 'start_at'
                        ? 'shop_license.start_date'
                        : 'shop_license.end_date',
                    ) +
                    ': ' +
                    getLocalTimeString(item[field])
                  "
                  >{{
                    field === "start_at"
                      ? getLocalDateString(item[field])
                      : $t("shop_license.workspace.history_period_to", {
                          date: getLocalDateString(item[field]),
                        })
                  }}</time
                >
              </template>
              {{
                $t(
                  field === "start_at"
                    ? "shop_license.start_date"
                    : "shop_license.end_date",
                )
              }}: {{ getLocalTimeString(item[field]) }} ·
              {{ getFromNowString(item[field]) }}
            </v-tooltip>
          </div>
          <template v-else>
            <div class="min-width-200">
              <v-icon class="me-1" size="small">play_arrow</v-icon>
              {{ getFromNowString(item.start_at) }}<br />
              <small>{{ getLocalTimeString(item.start_at) }}</small>
            </div>

            <div class="min-width-200">
              <v-icon class="me-1" size="small">stop</v-icon>

              {{ getFromNowString(item.end_at) }}<br />
              <small>{{ getLocalTimeString(item.end_at) }}</small>
            </div>
          </template>
        </template>

        <template v-slot:item.renewal="{ item }">
          <v-switch
            v-if="modern && last_subscription === item"
            :model-value="item.renewal"
            :label="
              $t(
                item.renewal
                  ? 'shop_license.workspace.renewal_on'
                  : 'shop_license.workspace.renewal_off',
              )
            "
            :aria-label="$t('shop_license.table.renewal')"
            role="switch"
            :aria-busy="busy_renewal === item"
            :loading="busy_renewal === item"
            :disabled="
              disabled || !!busy_renewal || busy_buy || busy_cancel !== null
            "
            class="b-shop-subscriptions__renewal"
            color="primary"
            density="compact"
            hide-details
            inset
            @update:model-value="toggleRenewal(item)"
            ><template #loader
              ><v-progress-circular
                indeterminate
                :size="10"
                :width="1"
                color="primary" /></template
          ></v-switch>
          <div v-else-if="last_subscription === item">
            <v-btn
              :color="item.renewal ? 'green' : undefined"
              :loading="busy_renewal === item"
              :variant="item.renewal ? 'flat' : 'outlined'"
              icon
              size="small"
              :disabled="disabled || !!busy_renewal"
              @click="toggleRenewal(item)"
            >
              <v-icon>refresh</v-icon>
            </v-btn>
            <br />
            {{ item.renewal ? $t("global.active") : $t("global.inactive") }}
          </div>
          <div v-else>
            <small>{{ $t("shop_license.only_last") }}</small>
          </div>
        </template>

        <template v-slot:item.account.account_number="{ item }">
          <div
            v-if="item.account"
            :class="
              modern ? 'b-shop-subscriptions__wallet' : 'min-width-150 p-2'
            "
          >
            {{ formatCard(item.account.account_number) }}
            <v-tooltip
              v-if="modern"
              content-class="sd-modern-tooltip text-start"
              location="top"
              open-on-focus
              open-on-click
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :to="{
                    name: 'BPageAccountTransactions',
                    params: { account_number: item.account.account_number },
                  }"
                  class="sd-modern-icon-button ms-2"
                  icon
                  variant="text"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="$t('shop_license.workspace.wallet_transactions')"
                  ><v-icon size="16">north_east</v-icon></v-btn
                >
              </template>
              {{ $t("shop_license.workspace.wallet_transactions") }}
            </v-tooltip>
            <v-btn
              v-else
              :to="{
                name: 'BPageAccountTransactions',
                params: { account_number: item.account.account_number },
              }"
              class="m-2"
              icon
              target="_blank"
              rel="noopener noreferrer"
              tile
              variant="text"
            >
              <v-icon>open_in_new</v-icon>
            </v-btn>
            <br />
            <small>{{ item.account.account_name }}</small>
          </div>
          <div v-else-if="item.voucher" :class="{ 'min-width-150': !modern }">
            <img
              :src="getVoucherImage(item.voucher.code)"
              :title="getVoucherTitle(item.voucher.code)"
              :height="modern ? 36 : 64"
              alt=""
            />
            <small v-if="modern" class="d-block">{{
              getVoucherTitle(item.voucher.code)
            }}</small>
            <small class="d-block">{{ item.voucher.comment }}</small>

            <small class="d-block mt-1">
              <v-icon size="small">add</v-icon>
              {{ $t("shop_license.use_date") }}:
            </small>
            <b class="small mb-1">{{
              getLocalTimeStringSmall(item.voucher.used_at)
            }}</b>
          </div>
        </template>

        <template v-slot:item.payment="{ item }">
          <u-price :amount="item.payment" :currency="item.currency"></u-price>
        </template>

        <template v-slot:item.cancel="{ item }">
          <v-tooltip
            v-if="modern"
            content-class="sd-modern-tooltip text-start"
            location="top"
            open-on-focus
            open-on-click
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                :loading="busy_cancel === item.id"
                :disabled="disabled || busy_cancel !== null || busy_buy"
                icon
                variant="text"
                :aria-label="$t('shop_license.cancel_dialog.action')"
                @click="cancelSubscription(item.id)"
                ><v-icon size="18">close</v-icon></v-btn
              >
            </template>
            {{ $t("shop_license.cancel_dialog.action") }}
          </v-tooltip>
          <v-btn
            v-else
            color="red"
            icon
            title="Cancel subscription"
            variant="text"
            :disabled="disabled || busy_cancel !== null"
            @click="cancelSubscription(item.id)"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </template>
        <template v-if="modern" #no-data>
          <div class="sd-modern-empty-state">
            <v-icon size="26">event_note</v-icon>
            <p>{{ $t("shop_license.workspace.no_subscriptions") }}</p>
          </div>
        </template>
        <template v-if="modern" #bottom>
          <div class="sd-modern-table-footer">
            <p class="sd-modern-page-summary">
              {{ $t("global.commons.total") }}: {{ subscriptions.length }}
            </p>
            <v-pagination
              v-model="history_page"
              class="sd-modern-pagination"
              :length="Math.max(1, Math.ceil(subscriptions.length / 10))"
              :disabled="busy_fetch || subscriptions.length <= 10"
              :total-visible="$vuetify.display.smAndDown ? 3 : 5"
            />
          </div>
        </template>
      </v-data-table>
    </section>

    <!-- --------------------------------- Vouchers ----------------------------------- -->
    <section v-if="modern" class="sd-modern-widget">
      <header class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon size="20">confirmation_number</v-icon></span
          >
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("shop_license.workspace.vouchers_title") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ $t("shop_license.workspace.vouchers_help") }}
            </p>
          </div>
        </div>
      </header>
      <div
        v-for="voucher in vouchers"
        :key="voucher.id"
        class="b-shop-subscriptions__voucher"
      >
        <img
          :src="getVoucherImage(voucher.code)"
          alt=""
          class="b-shop-subscriptions__voucher-art"
        />
        <div class="b-shop-subscriptions__voucher-copy">
          <strong
            ><img
              :src="getShopLicenseIcon(getVoucherSubscription(voucher.code))"
              width="20"
              height="20"
              alt=""
            />{{ getVoucherTitle(voucher.code) }}</strong
          >
          <p>
            {{
              $t("shop_license.workspace.voucher_count", {
                count: voucher.total + 1,
              })
            }}
          </p>
        </div>
        <v-btn
          class="sd-modern-button sd-modern-button--primary"
          color="primary"
          variant="flat"
          :disabled="disabled || busy_buy"
          @click="selectVoucher(voucher)"
          >{{ $t("shop_license.workspace.use_voucher")
          }}<v-icon end size="16" class="flip-rtl">arrow_forward</v-icon></v-btn
        >
      </div>
      <div v-if="!vouchers.length" class="sd-modern-empty-state">
        <v-icon size="26">confirmation_number</v-icon>
        <p>{{ $t("global.commons.empty") }}</p>
      </div>
    </section>
    <template v-else>
      <h3 class="text-start">
        <v-icon class="me-1" color="#111">pix</v-icon>
        {{ $t("shop_license.vouchers") }}
      </h3>
      <v-slide-group v-if="vouchers.length">
        <v-slide-group-item
          v-for="voucher in vouchers"
          :key="voucher.id"
          v-slot:default=""
          :value="voucher"
        >
          <div
            class="p-3 row-hover rounded-lg my-10 mx-3 text-start"
            @click="selectVoucher(voucher)"
          >
            <v-img
              :src="getVoucherImage(voucher.code)"
              height="96"
              width="200"
            ></v-img>

            <div class="text-center">
              <img
                :src="getVoucherObject(voucher.code).license.icon"
                class="me-2"
                height="24"
                width="24"
              />
              <v-icon
                v-for="i in getVoucherObject(voucher.code).months"
                :key="i"
                color="primary"
                size="x-small"
                >circle
              </v-icon>
            </div>

            <p class="m-1 text-uppercase text-muted small">
              {{ getVoucherTitle(voucher.code) }}
              <v-badge
                :content="voucher.total + 1"
                :model-value="voucher.total + 1 > 1"
                color="deep-purple-accent-4"
                inline
              >
              </v-badge>
            </p>
          </div>
        </v-slide-group-item>
      </v-slide-group>

      <div
        v-if="!vouchers.length"
        class="text-center text-muted text-h3 font-weight-thin py-5 px-2"
      >
        {{ $t("global.commons.empty") }}
      </div>
    </template>

    <!-- ████████████████████ Bottom Sheet > Add account to shop ████████████████████ -->

    <component
      :is="modern ? 'VDialog' : 'VBottomSheet'"
      v-model="sheet"
      :persistent="modern && busy_buy"
      :max-width="modern ? 940 : '98vw'"
      :width="modern ? 'calc(100vw - 32px)' : 860"
      :fullscreen="modern && $vuetify.display.smAndDown"
      :overlay-opacity="0.9"
      :content-class="modern ? 'b-shop-subscriptions__overlay' : 'rounded-t-xl'"
      scrollable
    >
      <v-card
        :class="
          modern
            ? 'b-shop-subscriptions__dialog sd-modern-widget text-start'
            : 'text-start rounded-t-xl'
        "
      >
        <v-card-title
          v-if="modern"
          class="sd-modern-header b-shop-subscriptions__dialog-heading"
        >
          <div>
            <h2 class="sd-modern-title-text">
              {{
                $t(
                  voucher_selected
                    ? "shop_license.workspace.checkout.voucher_review"
                    : "shop_license.workspace.checkout.title",
                )
              }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ $t("shop_license.workspace.checkout.help") }}
            </p>
          </div>
          <v-tooltip
            content-class="sd-modern-tooltip text-start"
            location="top"
            open-on-focus
            open-on-click
          >
            <template #activator="{ props }"
              ><v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                icon
                variant="text"
                :aria-label="$t('global.actions.close')"
                :disabled="busy_buy"
                @click="sheet = false"
                ><v-icon size="18">close</v-icon></v-btn
              ></template
            >
            {{ $t("global.actions.close") }}
          </v-tooltip>
        </v-card-title>
        <v-card-title v-else class="text-capitalize d-flex align-center">
          <v-avatar class="avatar-gradient -thin -shop me-2" size="36">
            <img :src="getShopImagePath(shop.icon, 96)" />
          </v-avatar>

          {{ $t("shop_license.buy") }}
          <v-spacer></v-spacer>
          <v-btn class="ms-2" icon variant="text" @click="sheet = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="modern" class="b-shop-subscriptions__dialog-body">
          <nav
            :aria-label="$t('shop_license.workspace.checkout.title')"
            class="b-shop-subscriptions__stepper"
          >
            <ol>
              <li v-for="step in checkoutSteps" :key="step.number">
                <button
                  type="button"
                  :class="{
                    'is-current': checkout_step === step.number,
                    'is-complete': checkout_step > step.number,
                  }"
                  :aria-current="
                    checkout_step === step.number ? 'step' : undefined
                  "
                  :disabled="
                    disabled || busy_buy || step.number > checkout_step
                  "
                  @click="goCheckoutStep(step.number)"
                >
                  <span class="b-shop-subscriptions__step-number"
                    ><v-icon
                      v-if="checkout_step > step.number"
                      size="15"
                      aria-hidden="true"
                      >check</v-icon
                    ><template v-else>{{ step.number }}</template></span
                  ><span>{{ $t(step.title) }}</span>
                </button>
              </li>
            </ol>
          </nav>
          <div
            class="b-shop-subscriptions__checkout-content"
            aria-live="polite"
          >
            <section
              v-if="checkout_step === 1"
              aria-labelledby="subscription-checkout-wallet"
            >
              <h3
                id="subscription-checkout-wallet"
                ref="checkoutHeading"
                tabindex="-1"
              >
                {{
                  $t(
                    voucher_selected
                      ? "shop_license.workspace.checkout.voucher_title"
                      : "shop_license.workspace.checkout.wallet_title",
                  )
                }}
              </h3>
              <p class="b-shop-subscriptions__step-help">
                {{
                  $t(
                    voucher_selected
                      ? "shop_license.workspace.checkout.voucher_help"
                      : "shop_license.workspace.checkout.wallet_help",
                  )
                }}
              </p>
              <template v-if="!voucher_selected">
                <b-account-input
                  v-model="account_selected"
                  :label="$t('shop_license.add_dialog.wallet.title')"
                  :disabled="disabled || busy_buy"
                  class="sd-modern-underlined-field b-shop-subscriptions__wallet-input"
                  hide-details
                />
                <v-btn
                  :to="{ name: 'BPageShuttleWalletAccounts' }"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="text"
                  color="primary"
                  class="sd-modern-button sd-modern-button--inline"
                  :disabled="disabled || busy_buy"
                  >{{ $t("shop_license.workspace.checkout.manage_wallets")
                  }}<v-icon end size="15">north_east</v-icon></v-btn
                >
                <dl
                  v-if="account_selected"
                  class="b-shop-subscriptions__checkout-records"
                >
                  <div>
                    <dt>
                      {{ $t("shop_license.workspace.checkout.wallet_balance") }}
                    </dt>
                    <dd>
                      <u-price
                        :amount="
                          account_selected.balance - account_selected.locked
                        "
                        :currency="account_selected.currency"
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>
                      {{
                        $t("shop_license.workspace.checkout.wallet_currency")
                      }}
                    </dt>
                    <dd>{{ account_selected.currency }}</dd>
                  </div>
                </dl>
                <div class="sd-modern-notice">
                  <v-icon size="18" aria-hidden="true">lock_outline</v-icon
                  ><span>{{
                    $t("shop_license.workspace.checkout.wallet_no_charge")
                  }}</span>
                </div>
              </template>
              <div v-else class="b-shop-subscriptions__voucher-preview">
                <v-img
                  :src="getVoucherImage(voucher_selected.code)"
                  width="150"
                  height="96"
                />
                <div>
                  <strong>{{ getVoucherTitle(voucher_selected.code) }}</strong>
                  <p>
                    {{
                      $t("shop_license.workspace.checkout.voucher_restrictions")
                    }}
                  </p>
                </div>
              </div>
            </section>
            <section
              v-else-if="checkout_step === 2"
              aria-labelledby="subscription-checkout-plan"
            >
              <h3
                id="subscription-checkout-plan"
                ref="checkoutHeading"
                tabindex="-1"
              >
                {{
                  $t(
                    voucher_selected
                      ? "shop_license.plan"
                      : "shop_license.workspace.checkout.plan_title",
                  )
                }}
              </h3>
              <p class="b-shop-subscriptions__step-help">
                {{
                  $t(
                    voucher_selected
                      ? "shop_license.workspace.checkout.voucher_restrictions"
                      : "shop_license.workspace.checkout.plan_help",
                  )
                }}
              </p>
              <div
                v-if="!voucher_selected"
                class="b-shop-subscriptions__plan-fields"
              >
                <v-select
                  v-model="subscription_code"
                  :label="$t('shop_license.plan')"
                  :items="plans"
                  :item-title="(item) => $t(item.name)"
                  item-value="code"
                  :disabled="disabled || busy_buy"
                  class="sd-modern-underlined-field"
                  variant="underlined"
                  hide-details
                >
                  <template #selection="{ item }"
                    ><span class="b-shop-subscriptions__identity"
                      ><img
                        :src="getShopLicenseIcon(item.raw.code)"
                        width="20"
                        height="20"
                        alt=""
                      />{{ $t(item.raw.name) }}</span
                    ></template
                  >
                  <template #item="{ item, props }"
                    ><v-list-item
                      v-bind="props"
                      :prepend-avatar="getShopLicenseIcon(item.raw.code)"
                      class="text-start"
                  /></template>
                </v-select>
                <v-select
                  v-model="type"
                  :label="$t('shop_license.workspace.checkout.duration_title')"
                  :items="[
                    { value: 'monthly', title: $t('shop_license.monthly') },
                    { value: 'yearly', title: $t('shop_license.yearly') },
                  ]"
                  :disabled="disabled || busy_buy || !subscription_code"
                  class="sd-modern-underlined-field"
                  variant="underlined"
                  hide-details
                />
              </div>
              <dl v-else class="b-shop-subscriptions__checkout-records">
                <div>
                  <dt>{{ $t("shop_license.plan") }}</dt>
                  <dd class="b-shop-subscriptions__identity">
                    <img
                      :src="getShopLicenseIcon(subscription_code)"
                      alt=""
                      width="24"
                      height="24"
                    />{{ getShopLicenseName(subscription_code) }}
                  </dd>
                </div>
                <div>
                  <dt>
                    {{ $t("shop_license.workspace.checkout.voucher_title") }}
                  </dt>
                  <dd>{{ getVoucherTitle(voucher_selected.code) }}</dd>
                </div>
              </dl>
              <p
                v-if="!voucher_selected && type === 'yearly'"
                class="b-shop-subscriptions__step-help b-shop-subscriptions__annual-help"
              >
                {{ $t("shop_license.workspace.checkout.annual_discount") }}
              </p>
              <div
                v-if="busy_price"
                class="b-shop-subscriptions__quote-state"
                role="status"
              >
                <v-progress-circular
                  indeterminate
                  size="18"
                  width="2"
                /><span>{{
                  $t("shop_license.workspace.checkout.quote_loading")
                }}</span>
              </div>
              <div
                v-else-if="checkout_price_error"
                class="sd-modern-notice"
                role="alert"
              >
                <v-icon size="18">error_outline</v-icon
                ><span>{{
                  $t("shop_license.workspace.checkout.quote_error")
                }}</span
                ><v-btn
                  variant="text"
                  color="primary"
                  class="sd-modern-button sd-modern-button--inline"
                  @click="refreshPrice"
                  >{{
                    $t("shop_license.workspace.checkout.quote_retry")
                  }}</v-btn
                >
              </div>
              <div
                v-else-if="hasCheckoutQuote"
                class="b-shop-subscriptions__quote-total"
              >
                <span>{{ $t("shop_license.price") }}</span
                ><strong
                  ><u-price :amount="price" :currency="currency"
                /></strong>
                <p>{{ $t("shop_license.workspace.checkout.quote_help") }}</p>
              </div>
              <div class="sd-modern-notice">
                <v-icon size="18" aria-hidden="true">event_available</v-icon
                ><span>{{
                  $t("shop_license.workspace.checkout.schedule_help")
                }}</span>
              </div>
            </section>
            <section v-else aria-labelledby="subscription-checkout-review">
              <h3
                id="subscription-checkout-review"
                ref="checkoutHeading"
                tabindex="-1"
              >
                {{
                  $t(
                    voucher_selected
                      ? "shop_license.workspace.checkout.voucher_review"
                      : "shop_license.workspace.checkout.review_title",
                  )
                }}
              </h3>
              <p class="b-shop-subscriptions__step-help">
                {{
                  $t(
                    voucher_selected
                      ? "shop_license.workspace.checkout.voucher_help"
                      : "shop_license.workspace.checkout.review_help",
                  )
                }}
              </p>
              <div
                v-if="!voucher_selected"
                class="b-shop-subscriptions__quote-total"
              >
                <span>{{ $t("shop_license.price") }}</span
                ><strong
                  ><u-price :amount="price" :currency="currency"
                /></strong>
                <p>{{ $t("shop_license.workspace.checkout.quote_help") }}</p>
              </div>
              <dl class="b-shop-subscriptions__checkout-records">
                <div>
                  <dt>{{ $t("shop_license.plan") }}</dt>
                  <dd class="b-shop-subscriptions__identity">
                    <img
                      :src="getShopLicenseIcon(subscription_code)"
                      alt=""
                      width="22"
                      height="22"
                    />{{ getShopLicenseName(subscription_code) }}
                  </dd>
                </div>
                <template v-if="!voucher_selected"
                  ><div>
                    <dt>
                      {{ $t("shop_license.workspace.checkout.step_wallet") }}
                    </dt>
                    <dd>
                      <bdi>{{ account_selected.account_number }}</bdi>
                    </dd>
                  </div>
                  <div>
                    <dt>
                      {{ $t("shop_license.workspace.checkout.wallet_balance") }}
                    </dt>
                    <dd>
                      <u-price
                        :amount="
                          account_selected.balance - account_selected.locked
                        "
                        :currency="account_selected.currency"
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>
                      {{
                        $t("shop_license.workspace.checkout.wallet_currency")
                      }}
                    </dt>
                    <dd>{{ account_selected.currency }}</dd>
                  </div>
                  <div>
                    <dt>{{ $t("shop_license.start_date") }}</dt>
                    <dd>{{ getLocalTimeString(start_at) }}</dd>
                  </div>
                  <div>
                    <dt>{{ $t("shop_license.end_date") }}</dt>
                    <dd>{{ getLocalTimeString(end_at) }}</dd>
                  </div></template
                >
                <div v-else>
                  <dt>
                    {{ $t("shop_license.workspace.checkout.voucher_title") }}
                  </dt>
                  <dd>{{ getVoucherTitle(voucher_selected.code) }}</dd>
                </div>
              </dl>
              <p class="b-shop-subscriptions__step-help">
                {{
                  $t(
                    voucher_selected
                      ? "shop_license.workspace.checkout.voucher_credit"
                      : "shop_license.workspace.checkout.balance_help",
                  )
                }}
              </p>
              <p
                v-if="!voucher_selected"
                class="b-shop-subscriptions__step-help"
              >
                {{ $t("shop_license.workspace.checkout.fee_help") }}
              </p>
              <div v-if="needCharge" class="sd-modern-notice" role="status">
                <v-icon size="18">account_balance_wallet</v-icon
                ><span>{{
                  $t("shop_license.workspace.checkout.shortfall_help", {
                    amount:
                      FormatNumberCurrency(calculated_need_charge, currency) +
                      " " +
                      GetUserSelectedCurrencyName(currency),
                  })
                }}</span>
              </div>
              <div
                v-if="!voucher_selected"
                class="b-shop-subscriptions__checkout-renewal"
              >
                <u-smart-toggle
                  v-model="renewal"
                  :disabled="disabled || busy_buy"
                  role="checkbox"
                  :aria-checked="renewal"
                  :aria-disabled="disabled || busy_buy"
                  :tabindex="!disabled && !busy_buy ? 0 : undefined"
                  @keydown="onRenewalKeydown"
                  :true-title="
                    $t('shop_license.add_dialog.auto_renewal.true_title')
                  "
                  :true-description="
                    $t('shop_license.workspace.checkout.auto_renew_help')
                  "
                  false-gray
                  true-icon="autorenew"
                />
              </div>
              <div class="b-shop-subscriptions__checkout-terms">
                <p class="b-shop-subscriptions__step-help">
                  {{ $t("shop_license.workspace.checkout.terms_help") }}
                </p>
                <u-smart-verify
                  v-model="agreement"
                  :disabled="disabled || busy_buy"
                  role="checkbox"
                  :aria-checked="agreement"
                  :aria-disabled="disabled || busy_buy"
                  :tabindex="!disabled && !busy_buy ? 0 : undefined"
                  @keydown="onAgreementKeydown"
                  :true-title="$t('shop_license.verify.true_title')"
                  :true-description="$t('shop_license.verify.true_description')"
                />
              </div>
            </section>
          </div>
        </v-card-text>
        <v-card-text v-else>
          <div class="max-widget-width mx-auto">
            <!-- Normal payment mode -->

            <div v-if="!voucher_selected" class="py-5">
              <div class="widget-box mb-5">
                <u-widget-header
                  icon="looks_one"
                  :title="$t('shop_license.add_dialog.wallet.title')"
                >
                  <template v-slot:append-title>
                    <v-icon
                      v-if="!account_selected"
                      class="mx-1 blink-me"
                      color="success"
                      size="small"
                      >circle
                    </v-icon>
                  </template>
                </u-widget-header>
                <v-list-subheader>
                  {{ $t("shop_license.add_dialog.wallet.subtitle") }}
                </v-list-subheader>

                <b-account-input
                  v-model="account_selected"
                  :disabled="disabled || busy_buy"
                ></b-account-input>
              </div>

              <div class="widget-box mb-5">
                <u-widget-header
                  :title="$t('shop_license.plan')"
                  class=""
                  icon="looks_two"
                >
                  <template v-slot:append-title>
                    <v-icon
                      v-if="account_selected && !subscription_code"
                      class="mx-1 blink-me"
                      color="success"
                      >circle
                    </v-icon>
                  </template>
                </u-widget-header>

                <v-list-subheader
                  >{{ $t("shop_license.plan_placeholder") }}
                </v-list-subheader>
                <u-smart-select
                  v-model="subscription_code"
                  :items="plans"
                  class="my-3"
                  item-image="icon"
                  item-text="name"
                  item-value="code"
                  :disabled="disabled || busy_buy"
                >
                </u-smart-select>
              </div>
              <div class="widget-box mb-5">
                <u-widget-header
                  :title="$t('shop_license.validity_duration')"
                  class=""
                  icon="looks_3"
                >
                  <template v-slot:append-title>
                    <v-icon
                      v-if="subscription_code && !type"
                      class="mx-1 blink-me"
                      color="success"
                      >circle
                    </v-icon>
                  </template>
                </u-widget-header>

                <v-list-subheader
                  >{{ $t("shop_license.validity_duration_hint") }}
                </v-list-subheader>
                <u-smart-select
                  v-model="type"
                  :disabled="disabled || busy_buy || !subscription_code"
                  :items="[
                    { value: 'monthly', title: $t('shop_license.monthly') },
                    {
                      value: 'yearly',
                      title: $t('shop_license.yearly') + ' + 30% off',
                      icon: 'star_purple500',
                    },
                  ]"
                  class="my-3"
                  item-icon="icon"
                  item-text="title"
                  item-value="value"
                >
                </u-smart-select>
              </div>
              <div class="widget-box mb-5">
                <u-widget-header
                  class=""
                  icon="settings_applications"
                  :title="$t('shop_license.add_dialog.options.title')"
                ></u-widget-header>

                <u-smart-toggle
                  v-model="renewal"
                  :disabled="disabled || busy_buy"
                  :true-title="
                    $t('shop_license.add_dialog.auto_renewal.true_title')
                  "
                  class="my-3"
                  false-gray
                  :true-description="
                    $t('shop_license.add_dialog.auto_renewal.true_description')
                  "
                  true-icon="autorenew"
                ></u-smart-toggle>
              </div>
            </div>

            <!-- Voucher mode -->
            <div v-else class="py-5 text-center mb-5">
              <v-img
                :src="getVoucherImage(voucher_selected.code)"
                height="168"
              ></v-img>
              <v-row align="center" class="my-2" justify="center" no-gutters>
                <v-icon
                  v-for="i in selected_voucher_obj.months"
                  :key="i"
                  color="primary"
                  size="small"
                  >circle
                </v-icon>
              </v-row>
              <p class="m-1 text-uppercase">
                <img
                  :src="selected_voucher_obj.license.icon"
                  class="me-1"
                  height="24"
                  width="24"
                />
                {{ getVoucherTitle(voucher_selected.code) }}
              </p>
            </div>

            <div
              :class="
                modern
                  ? 'b-shop-subscriptions__confirmation'
                  : 'widget-box mb-5'
              "
            >
              <u-widget-header
                icon="check_box"
                :title="$t('shop_license.add_dialog.verify.title')"
              ></u-widget-header>

              <v-expand-transition>
                <div v-if="canPay" class="border-top border-bottom">
                  <div class="py-2">
                    <u-text-value-dashed>
                      <template v-slot:label>
                        {{ $t("shop_license.start_date") }}
                      </template>
                      {{ getLocalTimeString(start_at) }}
                    </u-text-value-dashed>

                    <u-text-value-dashed>
                      <template v-slot:label>
                        {{ $t("shop_license.end_date") }}
                      </template>
                      {{ getLocalTimeString(end_at) }}
                    </u-text-value-dashed>

                    <u-text-value-dashed>
                      <template v-slot:label>
                        {{ $t("shop_license.price") }}
                      </template>
                      <u-price :amount="price" :currency="currency"></u-price>
                    </u-text-value-dashed>
                  </div>
                </div>
              </v-expand-transition>

              <u-smart-verify
                v-model="agreement"
                :disabled="disabled || busy_buy"
                :true-title="$t('shop_license.verify.true_title')"
                :true-description="$t('shop_license.verify.true_description')"
                class="my-3"
              ></u-smart-verify>
            </div>
          </div>
        </v-card-text>

        <u-loading-progress v-if="!modern && busy_price"></u-loading-progress>

        <v-card-actions
          v-if="modern"
          class="b-shop-subscriptions__dialog-actions"
        >
          <v-btn
            v-if="checkout_step > 1"
            variant="text"
            class="sd-modern-button b-shop-subscriptions__back"
            :disabled="busy_buy || disabled"
            @click="backCheckout"
            ><v-icon start size="18">arrow_back</v-icon
            >{{ $t("shop_license.workspace.checkout.back") }}</v-btn
          >
          <v-spacer />
          <v-btn
            v-if="checkout_step < 3"
            color="primary"
            variant="flat"
            class="sd-modern-button sd-modern-button--primary"
            :disabled="!canContinueCheckout"
            @click="continueCheckout"
            >{{ $t("shop_license.workspace.checkout.continue")
            }}<v-icon end size="18" class="flip-rtl"
              >arrow_forward</v-icon
            ></v-btn
          >
          <v-btn
            v-else-if="needCharge"
            :to="{
              name: 'BPageAccountDeposit',
              params: { account_number: account_selected.account_number },
              query: { charge: calculated_need_charge },
            }"
            color="primary"
            variant="flat"
            class="sd-modern-button sd-modern-button--primary"
            :disabled="disabled || busy_buy || busy_price"
            ><v-icon start size="18">account_balance_wallet</v-icon
            >{{ $t("shop_license.need_charge") }}</v-btn
          >
          <v-btn
            v-else
            color="primary"
            variant="flat"
            class="sd-modern-button sd-modern-button--primary"
            :disabled="!canSubmitCheckout"
            :loading="busy_buy"
            @click="buySubscription"
            ><v-icon start size="18">{{
              voucher_selected ? "confirmation_number" : "lock_outline"
            }}</v-icon
            >{{
              $t(
                voucher_selected
                  ? "shop_license.workspace.checkout.redeem"
                  : "shop_license.workspace.checkout.confirm_pay",
              )
            }}</v-btn
          >
        </v-card-actions>
        <v-card-actions v-else>
          <div class="widget-buttons">
            <v-btn
              v-if="needCharge"
              :to="{
                name: 'BPageAccountDeposit',
                params: { account_number: account_selected.account_number },
                query: { charge: calculated_need_charge },
              }"
              color="primary"
              size="x-large"
              :disabled="disabled || busy_price || busy_buy"
              variant="elevated"
            >
              <v-icon class="me-1">info</v-icon>
              {{ $t("shop_license.need_charge") }}

              <u-price
                v-if="currency && price"
                :amount="calculated_need_charge"
                :currency="account_selected.currency"
                class="mx-2"
              ></u-price>
            </v-btn>

            <v-btn
              v-else
              :class="{
                disabled: (!canPay && !voucher_selected) || !agreement,
                'sd-modern-button': modern,
              }"
              :loading="busy_buy"
              :disabled="
                disabled ||
                busy_buy ||
                busy_price ||
                (!canPay && !voucher_selected) ||
                !agreement
              "
              color="primary"
              size="x-large"
              variant="elevated"
              @click="buySubscription()"
            >
              <v-icon v-if="voucher_selected" class="me-1">check</v-icon>
              <img
                v-else-if="subscription_code"
                :src="getShopLicenseIcon(subscription_code)"
                class="me-1"
                height="24"
                width="24"
              />

              {{
                voucher_selected
                  ? $t("shop_license.use_voucher_now")
                  : $t("shop_license.buy_now")
              }}

              <b v-if="currency && price" class="mx-2">
                {{ FormatNumberCurrency(price, currency) }}
                {{ GetUserSelectedCurrencyName(currency) }}
              </b>
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </component>
  </div>
</template>

<script lang="ts">
import { VDialog, VBottomSheet } from "vuetify/components";
import BAccountInput from "../account/input/BAccountInput.vue";
import { ShopLicense } from "@selldone/core-js/enums/shop/ShopLicense";
import UTimeProgressBar from "../../ui/time/progress-bar/UTimeProgressBar.vue";
import { Vouchers } from "@selldone/core-js/enums/shop/Vouchers";
import UTextValueDashed from "../../ui/text/value-dashed/UTextValueDashed.vue";
import USmartSelect from "../../ui/smart/select/USmartSelect.vue";
import USmartToggle from "../../ui/smart/toggle/USmartToggle.vue";
import USmartVerify from "../../ui/smart/verify/USmartVerify.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import AccountMixin from "@selldone/components-vue/mixin/account/AccountMixin.ts";
import LicenseMixin from "@selldone/components-vue/mixin/license/LicenseMixin.ts";

export default {
  name: "ShopSubscriptionList",
  mixins: [DateMixin, CurrencyMixin, AccountMixin, LicenseMixin],
  emits: ["refresh"],

  components: {
    VDialog,
    VBottomSheet,
    USmartVerify,
    USmartToggle,
    USmartSelect,
    UTextValueDashed,
    UTimeProgressBar,
    BAccountInput,
  },

  props: {
    shop: {
      required: true,
      type: Object,
    },
    modern: Boolean,
    disabled: Boolean,
  },

  data: () => ({
    subscriptions: [],
    busy_fetch: false,
    history_page: 1,
    fetch_request: 0,
    price_request: 0,
    context_version: 0,
    disposed: false,

    sheet: false,
    busy_buy: false,
    checkout_step: 1,
    checkout_price_error: false,
    quote_selection: null,

    account_selected: null,
    type: null,
    renewal: false,
    subscription_code: null,
    voucher_selected: null,

    //-------------
    busy_price: false,
    price: 0,
    currency: 0,
    start_at: null,
    end_at: null,

    agreement: true,

    //-------------
    busy_renewal: null,
    busy_cancel: null,
  }),
  watch: {
    sheet(value) {
      if (!value && this.modern) {
        this.checkout_step = 1;
        this.agreement = false;
        this.quote_selection = null;
        this.price_request++;
        this.busy_price = false;
        this.checkout_price_error = false;
      }
    },
    "shop.id"() {
      this.context_version++;
      this.price_request++;
      this.sheet = false;
      this.account_selected = null;
      this.voucher_selected = null;
      this.subscription_code = null;
      this.type = null;
      this.subscriptions = [];
      this.history_page = 1;
      this.busy_buy = false;
      this.busy_cancel = null;
      this.busy_renewal = null;
      this.refreshPrice();
      this.fetchSubscriptions();
    },
    disabled(value) {
      if (value) {
        this.sheet = false;
        this.refreshPrice();
      }
    },
    account_selected() {
      this.refreshPrice();
    },
    subscription_code() {
      this.refreshPrice();
    },
    type() {
      this.refreshPrice();
    },
  },

  computed: {
    checkoutSteps() {
      return [
        {
          number: 1,
          title: this.voucher_selected
            ? "shop_license.workspace.checkout.step_voucher"
            : "shop_license.workspace.checkout.step_wallet",
        },
        {
          number: 2,
          title: this.voucher_selected
            ? "shop_license.plan"
            : "shop_license.workspace.checkout.step_plan",
        },
        {
          number: 3,
          title: this.voucher_selected
            ? "shop_license.workspace.checkout.step_redeem"
            : "shop_license.workspace.checkout.step_review",
        },
      ];
    },
    hasCheckoutQuote() {
      const selection = this.quote_selection;
      return !!(
        selection &&
        this.account_selected &&
        this.type &&
        !this.busy_price &&
        !this.checkout_price_error &&
        Number.isFinite(Number(this.price)) &&
        Number(this.price) > 0 &&
        this.currency &&
        this.start_at &&
        this.end_at &&
        Number.isFinite(new Date(this.start_at).getTime()) &&
        new Date(this.end_at).getTime() > new Date(this.start_at).getTime() &&
        selection.account_number === this.account_selected.account_number &&
        selection.currency === this.account_selected.currency &&
        this.currency === selection.currency &&
        selection.code === this.subscription_code &&
        selection.type === this.type
      );
    },
    canContinueCheckout() {
      if (
        this.disposed ||
        this.disabled ||
        this.busy_buy ||
        this.busy_cancel !== null
      )
        return false;
      if (this.checkout_step === 1)
        return this.voucher_selected
          ? !!this.selected_voucher_obj
          : !!(
              this.account_selected?.account_number &&
              this.account_selected?.currency
            );
      return (
        this.checkout_step === 2 &&
        (this.voucher_selected
          ? !!this.selected_voucher_obj
          : this.hasCheckoutQuote)
      );
    },
    canSubmitCheckout() {
      return !!(
        !this.disposed &&
        this.sheet &&
        this.checkout_step === 3 &&
        this.agreement &&
        !this.disabled &&
        !this.busy_buy &&
        !this.busy_price &&
        this.busy_cancel === null &&
        (this.voucher_selected
          ? this.selected_voucher_obj &&
            this.subscription_code === this.selected_voucher_obj.subscription
          : this.hasCheckoutQuote && !this.needCharge)
      );
    },
    vouchers() {
      return this.USER()?.vouchers || [];
    },
    last_subscription() {
      if (!this.subscriptions.length) return null;
      return this.subscriptions[this.subscriptions.length - 1];
    },

    needCharge() {
      return (
        this.canPay &&
        this.account_selected.balance - this.account_selected.locked <
          this.price
      );
    },

    calculated_need_charge() {
      return (
        this.price -
        (this.account_selected.balance - this.account_selected.locked)
      );
    },

    canPay() {
      return (
        this.account_selected &&
        this.subscription_code &&
        this.price &&
        this.currency
      );
    },
    plans() {
      return [ShopLicense.STARTUP, ShopLicense.COMPANY, ShopLicense.ENTERPRISE];
    },

    headers() {
      return [
        {
          title: this.$t("shop_license.table.plan"),
          align: this.modern ? "start" : "center",
          value: "code",
        },
        {
          title: this.$t("shop_license.table.start_date"),
          align: "start",
          value: "start_at",
        },

        {
          title: this.$t("shop_license.table.renewal"),
          align: this.modern ? "start" : "center",
          value: "renewal",
          sortable: false,
        },

        {
          title: this.$t("shop_license.table.linked_account"),
          align: this.modern ? "start" : "center",
          value: "account.account_number",
        },

        {
          title: this.$t("shop_license.table.payment"),
          align: this.modern ? "end" : "center",
          value: "payment",
        },

        {
          title: this.$t("shop_license.table.cancel"),
          align: "center",
          sortable: false,
          value: "cancel",
        },
      ];
    },
    selected_voucher_obj() {
      return this.voucher_selected && Vouchers[this.voucher_selected.code];
    },
  },
  created() {
    this.fetchSubscriptions();
  },
  beforeUnmount() {
    this.disposed = true;
    this.context_version++;
    this.fetch_request++;
    this.price_request++;
  },

  methods: {
    focusCheckoutHeading() {
      if (!this.modern || !this.sheet || this.disposed) return;
      this.$nextTick(() => {
        if (!this.disposed && this.sheet) this.$refs.checkoutHeading?.focus();
      });
    },
    goCheckoutStep(step) {
      if (
        this.disabled ||
        this.busy_buy ||
        !Number.isInteger(step) ||
        step < 1 ||
        step > this.checkout_step
      )
        return;
      this.checkout_step = step;
      this.agreement = false;
      this.focusCheckoutHeading();
    },
    continueCheckout() {
      if (!this.canContinueCheckout) return;
      this.checkout_step++;
      this.agreement = false;
      this.focusCheckoutHeading();
    },
    backCheckout() {
      this.goCheckoutStep(this.checkout_step - 1);
    },
    openPurchase() {
      if (this.disabled || this.busy_buy || this.busy_cancel !== null) return;
      this.voucher_selected = null;
      this.sheet = true;
      if (this.modern) {
        this.checkout_step = 1;
        this.agreement = false;
        this.account_selected = null;
        this.subscription_code = null;
        this.type = null;
        this.renewal = false;
        this.refreshPrice();
      }
    },
    selectVoucher(voucher) {
      if (this.disabled || this.busy_buy || this.busy_cancel !== null) return;
      this.voucher_selected = voucher;
      this.account_selected = null;
      this.subscription_code = this.getVoucherSubscription(voucher.code);
      this.sheet = true;
      if (this.modern) {
        this.checkout_step = 1;
        this.agreement = false;
        this.type = null;
        this.renewal = false;
      }
      this.refreshPrice();
    },

    getVoucherImage(code) {
      return Vouchers[code].image;
    },
    getVoucherTitle(code) {
      if (this.modern) {
        const voucher = Vouchers[code];
        return this.$t("shop_license.workspace.voucher_title", {
          months: voucher.months,
          license: this.getShopLicenseName(voucher.subscription),
        });
      }
      return Vouchers[code].title;
    },
    getVoucherObject(code) {
      return Vouchers[code];
    },
    getVoucherSubscription(code) {
      return Vouchers[code].subscription;
    },
    toggleRenewal(subscription) {
      if (
        this.disabled ||
        this.busy_renewal ||
        this.busy_buy ||
        this.busy_cancel !== null ||
        subscription !== this.last_subscription
      )
        return;
      const shopId = this.shop.id;
      const version = this.context_version;
      this.busy_renewal = subscription;
      return axios
        .put(window.API.PUT_SHOP_SUBSCRIPTION(shopId, subscription.id), {
          renewal: !subscription.renewal,
        })
        .then(({ data }) => {
          if (
            this.disposed ||
            shopId !== this.shop.id ||
            version !== this.context_version
          )
            return;
          if (!data.error) {
            subscription.renewal = data.renewal;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (
            this.disposed ||
            shopId !== this.shop.id ||
            version !== this.context_version
          )
            return;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (!this.disposed && version === this.context_version)
            this.busy_renewal = null;
        });
    },

    refreshPrice() {
      const request = ++this.price_request;
      const shopId = this.shop.id;
      this.price = null;
      this.currency = null;
      this.start_at = null;
      this.end_at = null;
      this.busy_price = false;
      this.quote_selection = null;
      this.checkout_price_error = false;
      if (this.modern) {
        this.checkout_step = Math.min(this.checkout_step, 2);
        this.agreement = false;
      }
      if (
        this.disabled ||
        this.voucher_selected ||
        !this.subscription_code ||
        !this.type ||
        !this.account_selected
      )
        return;
      this.busy_price = true;
      const selection = {
        account_number: this.account_selected.account_number,
        currency: this.account_selected.currency,
        type: this.type,
        code: this.subscription_code,
      };
      return axios
        .get(window.API.GET_SHOP_SUBSCRIPTION_PRICE(shopId), {
          params: {
            currency: this.account_selected.currency,
            type: this.type,
            code: this.subscription_code,
          },
        })
        .then(({ data }) => {
          if (
            this.disposed ||
            request !== this.price_request ||
            shopId !== this.shop.id
          )
            return;
          if (!data.error) {
            this.price = data.price;
            this.currency = data.currency;
            this.start_at = data.start_at;
            this.end_at = data.end_at;
            this.quote_selection = selection;
            if (
              this.modern &&
              (!Number.isFinite(Number(data.price)) ||
                Number(data.price) <= 0 ||
                data.currency !== selection.currency ||
                !data.start_at ||
                !data.end_at ||
                !Number.isFinite(new Date(data.start_at).getTime()) ||
                new Date(data.end_at).getTime() <=
                  new Date(data.start_at).getTime())
            )
              this.checkout_price_error = true;
          } else {
            this.checkout_price_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (
            this.disposed ||
            request !== this.price_request ||
            shopId !== this.shop.id
          )
            return;
          this.checkout_price_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (!this.disposed && request === this.price_request)
            this.busy_price = false;
        });
    },

    fetchSubscriptions() {
      const request = ++this.fetch_request;
      const shopId = this.shop.id;
      this.busy_fetch = true;
      return axios
        .get(window.API.GET_SHOP_SUBSCRIPTIONS(shopId))
        .then(({ data }) => {
          if (
            this.disposed ||
            request !== this.fetch_request ||
            shopId !== this.shop.id
          )
            return;
          if (!data.error) {
            this.subscriptions = data.subscriptions;
            this.history_page = Math.min(
              this.history_page,
              Math.max(1, Math.ceil(this.subscriptions.length / 10)),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (
            this.disposed ||
            request !== this.fetch_request ||
            shopId !== this.shop.id
          )
            return;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (!this.disposed && request === this.fetch_request)
            this.busy_fetch = false;
        });
    },

    buySubscription() {
      if (
        this.disabled ||
        this.busy_buy ||
        this.busy_cancel !== null ||
        this.busy_price ||
        !this.agreement ||
        (this.modern && !this.canSubmitCheckout) ||
        (!this.voucher_selected && (!this.canPay || this.needCharge))
      )
        return;
      const shopId = this.shop.id;
      const version = this.context_version;
      this.busy_buy = true;
      return axios
        .post(window.API.POST_ADD_SHOP_SUBSCRIPTION(shopId), {
          type: this.type,
          renewal: this.renewal,
          code: this.subscription_code,
          account_number: this.account_selected
            ? this.account_selected.account_number
            : null,
          voucher_code: this.voucher_selected
            ? this.voucher_selected.code
            : null, //Only send voucher type! not id!
        })
        .then(({ data }) => {
          if (
            this.disposed ||
            shopId !== this.shop.id ||
            version !== this.context_version
          )
            return;
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t("shop_license.notifications.subscribe_success"),
            );
            this.AddOrUpdateItemByID(this.subscriptions, data.subscription);
            this.account_selected = null;
            ((this.voucher_selected = null), (this.sheet = false));

            if (data.vouchers) {
              this.USER().vouchers = data.vouchers;
            }

            // Update shop license:
            this.shop.license = data.shop_license;
            this.$emit("refresh");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (
            this.disposed ||
            shopId !== this.shop.id ||
            version !== this.context_version
          )
            return;
          if (this.modern) {
            // A lost response may follow a committed purchase; show history before a manual retry.
            this.sheet = false;
            this.agreement = false;
            this.quote_selection = null;
            this.fetchSubscriptions();
            NotificationService.showErrorAlert(
              null,
              this.$t("shop_license.workspace.checkout.purchase_uncertain"),
            );
          } else NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (!this.disposed && version === this.context_version)
            this.busy_buy = false;
        });
    },

    cancelSubscription(subscription_id) {
      if (this.disabled || this.busy_cancel !== null || this.busy_buy) return;
      const shopId = this.shop.id;
      const version = this.context_version;
      NotificationService.openDangerAlert(
        this.$t("shop_license.cancel_dialog.title"),
        this.$t("shop_license.cancel_dialog.message"),
        this.$t("shop_license.cancel_dialog.action"),
        () => {
          if (
            this.disposed ||
            this.disabled ||
            shopId !== this.shop.id ||
            version !== this.context_version ||
            this.busy_buy ||
            this.busy_cancel !== null
          )
            return;
          this.busy_cancel = subscription_id;
          return axios
            .delete(
              window.API.DELETE_SHOP_SUBSCRIPTION(shopId, subscription_id),
            )
            .then(({ data }) => {
              if (
                this.disposed ||
                shopId !== this.shop.id ||
                version !== this.context_version
              )
                return;
              if (!data.error) {
                NotificationService.showSuccessAlert(
                  null,
                  this.$t("shop_license.notifications.cancel_success"),
                );
                this.DeleteItemByID(this.subscriptions, data.id);
                this.history_page = Math.min(
                  this.history_page,
                  Math.max(1, Math.ceil(this.subscriptions.length / 10)),
                );

                if (data.vouchers) {
                  this.USER().vouchers = data.vouchers;
                }

                // Update shop license:
                this.shop.license = data.shop_license;
                this.$emit("refresh");
              } else {
                NotificationService.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              if (
                this.disposed ||
                shopId !== this.shop.id ||
                version !== this.context_version
              )
                return;
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              if (!this.disposed && version === this.context_version)
                this.busy_cancel = null;
            });
        },
      );
    },
    onRenewalKeydown(event) {
      if (!this.modern || ![" ", "Enter"].includes(event.key)) return;
      event.preventDefault();
      if (!this.disabled && !this.busy_buy) this.renewal = !this.renewal;
    },
    onAgreementKeydown(event) {
      if (!this.modern || ![" ", "Enter"].includes(event.key)) return;
      event.preventDefault();
      if (!this.disabled && !this.busy_buy) this.agreement = !this.agreement;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-shop-subscriptions {
  display: grid;
  gap: 20px;
  min-width: 0;

  .sd-modern-header {
    gap: 18px;
    margin-block-end: 24px;
  }
  .sd-modern-title {
    flex: 1;
    gap: 9px;
  }
  .sd-modern-title-text {
    letter-spacing: -0.25px;
  }
  .sd-modern-subtitle {
    margin-block-start: 7px;
    font-size: 12px;
    line-height: 1.6;
  }

  &__identity {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  &__identity > img {
    flex: 0 0 auto;
    object-fit: contain;
  }
  &__plan {
    min-width: 100px;
    max-width: 150px;
    font-weight: 500;
  }
  &__progress {
    max-inline-size: 128px;
    margin-block-start: 9px;
  }
  &__progress :deep(.v-progress-linear) {
    height: 3px !important;
    margin-block: 0 !important;
    opacity: 0.65;
  }
  &__progress :deep(.v-progress-linear__determinate) {
    background-image: none;
  }
  &__date-range {
    display: grid;
    gap: 5px;
    min-width: 0;
  }
  &__date-range > time {
    width: fit-content;
    max-inline-size: 100%;
    overflow-wrap: anywhere;
  }
  &__date-range > time:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 3px;
  }
  &__date-end {
    color: var(--sd-modern-muted);
    font-size: 10px;
  }
  &__wallet {
    overflow-wrap: anywhere;
  }

  &__table {
    --sd-modern-table-font-size: 12px;
    font-variant-numeric: tabular-nums;
    :deep(.v-data-table__td) {
      font-size: 12px;
      line-height: 1.5;
    }
    :deep(small),
    :deep(.small) {
      color: var(--sd-modern-muted);
      font-size: 10px;
      font-weight: 400;
    }
  }
  &__renewal {
    --renewal-offset: -6px;
    min-width: 70px;
  }
  &__renewal.v-locale--is-rtl {
    --renewal-offset: 6px;
  }
  &__renewal :deep(.v-selection-control) {
    min-height: 32px;
    --v-selection-control-size: 32px;
  }
  &__renewal :deep(.v-selection-control__wrapper) {
    width: 30px;
    height: 32px;
  }
  &__renewal :deep(.v-switch__track) {
    min-width: 30px;
    height: 18px;
    padding: 0;
    opacity: 1;
  }
  &__renewal
    :deep(
      .v-selection-control:not(.v-selection-control--dirty) .v-switch__track
    ) {
    background-color: rgba(var(--v-theme-on-surface), 0.16);
  }
  &__renewal :deep(.v-switch__thumb) {
    width: 12px;
    height: 12px;
    transform: none;
    background-color: rgb(var(--v-theme-surface));
  }
  &__renewal
    :deep(.v-selection-control__wrapper > .v-selection-control__input) {
    transform: translateX(var(--renewal-offset));
  }
  &__renewal
    :deep(
      .v-selection-control--dirty
        .v-selection-control__wrapper
        > .v-selection-control__input
    ) {
    transform: translateX(calc(-1 * var(--renewal-offset)));
  }
  &__renewal :deep(.v-label) {
    padding-inline-start: 7px;
    font-size: 11px;
    font-weight: 400;
  }
  &__renewal :deep(.v-selection-control--focus-visible .v-switch__track) {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  &__voucher {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    min-width: 0;
  }
  &__voucher + &__voucher {
    margin-block-start: 18px;
    padding-block-start: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__voucher-art {
    width: 116px;
    height: 72px;
    object-fit: contain;
    flex: 0 0 auto;
  }
  &__voucher-copy {
    flex: 1;
    min-width: 120px;
  }
  &__voucher-copy strong {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 500;
  }
  &__voucher-copy p {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
  }
}

// Checkout is a centered, scrollable dialog; the page and legacy sheet keep their own geometry.
.b-shop-subscriptions__dialog.sd-modern-widget {
  --sd-modern-icon-button-size: 32px;
  padding: 0;
  max-height: calc(100dvh - 48px);
  border-radius: 22px;
  font-family: inherit;
  overflow: hidden;

  .b-shop-subscriptions__dialog-heading {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin: 0;
    padding: 28px 32px 20px;
    white-space: normal;
    flex: 0 0 auto;
  }
  .b-shop-subscriptions__dialog-heading > div {
    min-width: 0;
  }
  .b-shop-subscriptions__dialog-heading > .v-btn {
    flex-shrink: 0;
  }
  .sd-modern-title-text {
    font-size: 22px;
    line-height: 29px;
    font-weight: 600;
    letter-spacing: -0.4px;
  }
  .sd-modern-subtitle {
    margin: 6px 0 0;
    max-width: 660px;
    font-size: 12px;
    line-height: 20px;
    white-space: normal;
  }
  .b-shop-subscriptions__dialog-body {
    padding: 0 32px;
    min-height: 0;
    font-size: 13px;
  }
  .b-shop-subscriptions__stepper {
    padding-block: 4px 15px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  .b-shop-subscriptions__stepper ol {
    display: flex;
    gap: 24px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .b-shop-subscriptions__stepper li {
    flex: 1;
    min-width: 0;
  }
  .b-shop-subscriptions__stepper button {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 44px;
    padding: 6px 0;
    color: var(--sd-modern-muted);
    font: inherit;
    font-size: 12px;
    font-weight: 500;
    text-align: start;
  }
  .b-shop-subscriptions__stepper button:disabled {
    opacity: 0.65;
  }
  .b-shop-subscriptions__stepper button.is-current {
    color: rgb(var(--v-theme-primary));
  }
  .b-shop-subscriptions__stepper button.is-complete {
    color: rgb(var(--v-theme-on-surface));
  }
  .b-shop-subscriptions__step-number {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    flex: 0 0 26px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 50%;
    font-size: 12px;
    font-weight: 500;
  }
  .b-shop-subscriptions__stepper
    .is-current
    .b-shop-subscriptions__step-number {
    color: rgb(var(--v-theme-on-primary));
    background: rgb(var(--v-theme-primary));
    border-color: transparent;
  }
  .b-shop-subscriptions__stepper
    .is-complete
    .b-shop-subscriptions__step-number {
    color: rgb(var(--v-theme-primary));
  }
  .b-shop-subscriptions__checkout-content {
    min-height: 310px;
    padding-block: 28px 24px;
  }
  .b-shop-subscriptions__checkout-content h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
    letter-spacing: -0.25px;
  }
  .b-shop-subscriptions__step-help {
    max-width: 700px;
    margin: 8px 0 22px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }
  .b-shop-subscriptions__wallet-input {
    margin-block: 26px;
  }
  .b-shop-subscriptions__plan-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: end;
    gap: 28px;
    margin-block: 26px;
  }
  .sd-modern-underlined-field {
    min-width: 0;
  }
  :deep(.v-field__input) {
    overflow-wrap: anywhere;
  }
  :deep([role="checkbox"]:focus-visible) {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 9px;
  }
  .b-shop-subscriptions__checkout-records {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px 32px;
    margin: 24px 0;
  }
  .b-shop-subscriptions__checkout-records > div {
    min-width: 0;
  }
  .b-shop-subscriptions__checkout-records dt {
    margin-block-end: 5px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  .b-shop-subscriptions__checkout-records dd {
    margin: 0;
    font-size: 13px;
    line-height: 21px;
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  .b-shop-subscriptions__checkout-records .b-shop-subscriptions__identity {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .b-shop-subscriptions__quote-state {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-block: 24px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  .b-shop-subscriptions__quote-total {
    padding-block: 18px;
    margin-block: 20px;
    border-block: 1px solid var(--sd-modern-border);
  }
  .b-shop-subscriptions__quote-total > span {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  .b-shop-subscriptions__quote-total > strong {
    display: block;
    margin-block: 5px;
    font-size: 28px;
    line-height: 38px;
    font-weight: 600;
  }
  .b-shop-subscriptions__quote-total > p {
    max-width: 650px;
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 19px;
  }
  .b-shop-subscriptions__annual-help {
    margin-block-start: -12px;
  }
  .b-shop-subscriptions__checkout-renewal {
    margin-block: 18px;
  }
  .b-shop-subscriptions__checkout-terms {
    margin-block-start: 20px;
    padding-block-start: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .b-shop-subscriptions__checkout-terms .b-shop-subscriptions__step-help {
    margin: 0 0 10px;
  }
  .b-shop-subscriptions__voucher-preview {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-block: 30px;
  }
  .b-shop-subscriptions__voucher-preview > .v-img {
    flex: 0 0 150px;
  }
  .b-shop-subscriptions__voucher-preview strong {
    font-size: 14px;
    font-weight: 500;
  }
  .b-shop-subscriptions__voucher-preview p {
    margin: 8px 0 0;
    font-size: 12px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  .sd-modern-notice {
    align-items: flex-start;
    margin-block: 18px 0;
    font-size: 12px;
    line-height: 20px;
  }
  .b-shop-subscriptions__dialog-actions {
    display: flex;
    gap: 12px;
    flex: 0 0 auto;
    margin: 0;
    padding: 18px 32px;
    border-block-start: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
  }
  .b-shop-subscriptions__dialog-actions .sd-modern-button {
    margin: 0;
  }
  &:dir(rtl) .b-shop-subscriptions__back .v-icon {
    transform: scaleX(-1);
  }
}

@media (max-width: 959px) {
  .b-shop-subscriptions__dialog.sd-modern-widget {
    height: 100dvh;
    max-height: 100dvh;
    border: 0;
    border-radius: 0;
    .b-shop-subscriptions__dialog-heading {
      padding: 24px 24px 18px;
    }
    .b-shop-subscriptions__dialog-body {
      padding-inline: 24px;
    }
    .b-shop-subscriptions__dialog-actions {
      padding-inline: 24px;
    }
  }
}
@media (max-width: 600px) {
  .b-shop-subscriptions__dialog.sd-modern-widget {
    .b-shop-subscriptions__dialog-heading {
      padding: 20px;
      gap: 16px;
    }
    .sd-modern-title-text {
      font-size: 20px;
      line-height: 27px;
    }
    .b-shop-subscriptions__dialog-body {
      padding-inline: 20px;
    }
    .b-shop-subscriptions__stepper ol {
      gap: 10px;
    }
    .b-shop-subscriptions__stepper button {
      gap: 6px;
      align-items: flex-start;
      font-size: 11px;
    }
    .b-shop-subscriptions__step-number {
      width: 22px;
      height: 22px;
      flex-basis: 22px;
    }
    .b-shop-subscriptions__checkout-content {
      padding-block: 24px 18px;
      min-height: 280px;
    }
    .b-shop-subscriptions__plan-fields,
    .b-shop-subscriptions__checkout-records {
      grid-template-columns: 1fr;
      gap: 22px;
    }
    .b-shop-subscriptions__voucher-preview {
      align-items: flex-start;
      flex-direction: column;
      gap: 16px;
    }
    .b-shop-subscriptions__voucher-preview > .v-img {
      flex-basis: auto;
    }
    .b-shop-subscriptions__dialog-actions {
      padding: 16px 20px;
    }
    .b-shop-subscriptions__dialog-actions .v-spacer {
      display: none;
    }
    .b-shop-subscriptions__dialog-actions .v-btn {
      min-width: 0;
      min-height: 44px;
      white-space: normal;
    }
    .b-shop-subscriptions__dialog-actions .v-btn:last-child {
      flex: 1;
    }
  }
}

@media (max-width: 799px), (pointer: coarse) {
  .b-shop-subscriptions,
  .b-shop-subscriptions__dialog {
    --sd-modern-icon-button-size: 44px;
  }
  .b-shop-subscriptions__renewal :deep(.v-selection-control) {
    min-height: 44px;
    --v-selection-control-size: 44px;
  }
  .b-shop-subscriptions__renewal :deep(.v-selection-control__wrapper) {
    height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .b-shop-subscriptions__renewal :deep(.v-switch__track),
  .b-shop-subscriptions__renewal :deep(.v-selection-control__input),
  .b-shop-subscriptions__renewal :deep(.v-switch__thumb) {
    transition: none;
  }
}

@media (max-width: 600px) {
  .b-shop-subscriptions__voucher > .sd-modern-button {
    width: 100%;
  }
}
</style>
