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
  <v-card flat :class="{ 'b-vendor-payout-add--modern sd-modern-widget text-start': modern, 'b-vendor-payout-add--detail': modern && payment, 'b-vendor-payout-add--create': modern && !payment }">
    <v-card-title :class="{ 'b-vendor-payout-add__header': modern }">
      <template v-if="modern">
        <span v-if="!payment" class="b-vendor-payout-add__header-icon"><v-icon aria-hidden="true">payments</v-icon></span>
        <div class="b-vendor-payout-add__header-copy">
          <h2>{{ $t(payment ? 'marketplace_payouts.modern.detailTitle' : 'marketplace_wallets.payout.title') }}</h2>
          <p v-if="!payment">{{ $t('marketplace_wallets.payout.subtitle') }}</p>
        </div>
        <v-btn icon variant="text" class="sd-modern-icon-button" :aria-label="$t('global.actions.close')" :disabled="busy || busy_delete" @click="close">
          <v-icon aria-hidden="true">close</v-icon>
          <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
        </v-btn>
      </template>
    </v-card-title>
    <v-card-text :class="{ 'b-vendor-payout-add__body': modern, 'sd-modern-canvas': modern && !payment }">
      <template v-if="modern && payment">
        <div class="b-vendor-payout-add__identity">
          <b-vendor-box v-if="payment.vendor" :vendor="payment.vendor" modern />
          <span v-else>{{ $t('global.commons.vendor') }} #{{ payment.vendor_id }}</span>
          <span v-if="payment.option">{{ payment.option === 'bank' ? $t('vendor_payout_add.bank_transfer.title') : getName(payment.option) }}</span>
        </div>
        <dl class="b-vendor-payout-add__details">
          <div><dt class="b-vendor-payout-add__detail-label">{{ $t('marketplace_payouts.modern.originalAmount') }}</dt><dd><u-price :amount="payment.amount" :currency="payment.currency" /><bdi class="ms-2 b-vendor-payout-add__detail-label">{{ payment.currency }}</bdi></dd></div>
          <div><dt class="b-vendor-payout-add__detail-label">{{ $t('marketplace_payouts.modern.totalReversed') }}</dt><dd><u-price :amount="-Number(payment.reversal || 0)" :currency="payment.currency" /></dd></div>
          <div><dt class="b-vendor-payout-add__detail-label">{{ $t('marketplace_payouts.modern.remaining') }}</dt><dd><u-price :amount="remainingAmount" :currency="payment.currency" /></dd></div>
          <div><dt class="b-vendor-payout-add__detail-label">{{ $t('marketplace_payouts.modern.officer') }}</dt><dd class="b-vendor-payout-add__officer"><v-avatar v-if="payment.staff_id" size="28" class="avatar-gradient -thin -user"><v-img :src="getUserAvatar(payment.staff_id)" /></v-avatar><span>{{ payment.staff_id ? payment.staff?.name || $t('marketplace_payouts.modern.userId', { id: payment.staff_id }) : $t('global.commons.system') }}</span></dd></div>
          <div><dt class="b-vendor-payout-add__detail-label">{{ $t('marketplace_payouts.modern.verified') }}</dt><dd><template v-if="payment.verified_at">{{ getFromNowString(payment.verified_at) }}<small>{{ getLocalTimeString(payment.verified_at) }}</small></template><span v-else>{{ $t('marketplace_payouts.modern.unverified') }}</span></dd></div>
          <div><dt class="b-vendor-payout-add__detail-label">{{ $t('marketplace_payouts.modern.created') }}</dt><dd>{{ getFromNowString(payment.created_at) }}<small>{{ getLocalTimeString(payment.created_at) }}</small></dd></div>
          <div v-if="payment.deleted_at"><dt class="b-vendor-payout-add__detail-label">{{ $t('marketplace_payouts.modern.deleted') }}</dt><dd>{{ getFromNowString(payment.deleted_at) }}<small>{{ getLocalTimeString(payment.deleted_at) }}</small></dd></div>
        </dl>
        <div class="b-vendor-payout-add__detail-note"><h3 class="b-vendor-payout-add__detail-label">{{ $t('marketplace_payouts.modern.note') }}</h3><p dir="auto">{{ payment.note || '—' }}</p></div>
        <section class="b-vendor-payout-add__history">
          <h3>{{ $t('marketplace_payouts.modern.reversalHistory') }}</h3>
          <div v-for="(entry, index) in payment.reversal_detail || []" :key="index" class="b-vendor-payout-add__history-entry">
            <u-price :amount="-entry.amount" :currency="entry.currency || payment.currency" />
            <div><p>{{ entry.reason || $t('global.actions.reverse_fund') }}</p><span v-if="entry.user_id" class="b-vendor-payout-add__officer"><v-avatar size="24" class="avatar-gradient -thin -user"><v-img :src="getUserAvatar(entry.user_id)" /></v-avatar><small>{{ $t('marketplace_payouts.modern.userId', { id: entry.user_id }) }}</small></span><small v-if="entry.date">{{ getFromNowString(entry.date) }} · {{ getLocalTimeString(entry.date) }}</small></div>
          </div>
          <p v-if="!payment.reversal_detail?.length" class="b-vendor-payout-add__help">{{ $t('marketplace_payouts.modern.noReversals') }}</p>
        </section>
        <details v-if="Object.keys(payment.meta || {}).length" class="b-vendor-payout-add__metadata">
          <summary>{{ $t('global.commons.meta') }}</summary>
          <dl><div v-for="(value, key) in payment.meta" :key="key"><dt class="b-vendor-payout-add__detail-label">{{ getName(key) }}</dt><dd><span v-copy @click.stop>{{ value }}</span></dd></div></dl>
        </details>
        <p v-if="payment.deleted_at" class="sd-modern-notice">{{ $t('marketplace_payouts.modern.deletedHelp') }}</p>
        <details v-else class="sd-modern-critical b-vendor-payout-add__critical" :open="critical_open" @toggle="onCriticalToggle">
          <summary><v-icon size="17" aria-hidden="true">warning_amber</v-icon>{{ $t('marketplace_payouts.modern.refundRemove') }}</summary>
          <p>{{ $t('marketplace_payouts.modern.refundScope') }}</p>
          <u-smart-toggle v-model="accept_delete" color="error" :disabled="busy || busy_delete" :true-title="$t('marketplace_payouts.modern.refundIntent')" />
          <div class="b-vendor-payout-add__actions"><v-btn class="sd-modern-button sd-modern-button--danger" color="error" variant="elevated" :disabled="!critical_open || !accept_delete || busy || busy_delete" :loading="busy_delete" @click="remove"><v-icon start aria-hidden="true">delete</v-icon>{{ $t('global.actions.refund') }}</v-btn></div>
        </details>
      </template>
      <template v-else-if="modern">
        <div class="b-vendor-payout-add__workspace">
          <div class="b-vendor-payout-add__form">
            <section class="sd-modern-widget b-vendor-payout-add__card" :aria-busy="busy_fetch">
              <h3><v-icon size="17" aria-hidden="true">person_outline</v-icon>{{ $t('marketplace_wallets.payout.recipient_title') }}</h3>
              <p class="b-vendor-payout-add__caption">{{ $t('marketplace_wallets.payout.vendor_help') }}</p>
              <b-vendor-input
                v-model="vendor_id"
                :shop="shop"
                :disabled="busy || busy_delete"
                class="sd-modern-underlined-field"
                variant="underlined"
                :label="$t('global.commons.vendor')"
                :placeholder="$t('vendor_payout_add.inputs.vendor.placeholder')"
                clearable
                @click:clear="vendor_id = null"
              />
              <u-loading-progress v-if="busy_fetch" />
              <div v-if="options_error" class="sd-modern-notice b-vendor-payout-add__options-error" role="alert">
                <v-icon size="18" aria-hidden="true">error_outline</v-icon>
                <span class="sd-modern-notice__content">{{ $t('marketplace_wallets.payout.options_error') }}</span>
                <v-btn class="sd-modern-button sd-modern-button--compact" variant="text" :loading="busy_fetch" :disabled="busy || busy_delete" @click="fetchAvailablePaymentMethods">
                  <v-icon start aria-hidden="true">refresh</v-icon>{{ $t('marketplace_wallets.payout.retry') }}
                </v-btn>
              </div>
              <u-smart-select
                v-if="vendor_id"
                v-model="selected_option"
                :items="options"
                :item-text="modernOptionTitle"
                :item-description="modernOptionDescription"
                :aria-label="$t('marketplace_wallets.payout.method_label')"
                item-value="code"
                item-icon="icon"
                item-image="image"
                class="sd-modern-smart-select b-vendor-payout-add__methods"
                :loading="busy_fetch"
                :disabled="busy || busy_delete"
                border
                accessible
                force-show-all
                clearable
              >
                <template #append-title="{ item }">
                  <span v-if="item.code !== 'bank'" class="sd-modern-status sd-modern-status--plain ms-2">
                    <span class="sd-modern-status__dot" :class="item.livemode ? 'sd-modern-status__dot--success' : 'sd-modern-status__dot--warning'"></span>
                    {{ $t(item.livemode ? 'global.commons.live' : 'global.commons.debug') }}
                  </span>
                </template>
              </u-smart-select>
              <v-checkbox
                v-if="vendor_id"
                v-model="with_balance"
                :disabled="busy || busy_delete || busy_fetch"
                :label="$t('marketplace_wallets.payout.with_balance')"
                class="b-vendor-payout-add__balance-toggle"
                color="primary"
                density="compact"
                hide-details
              >
                <template #append>
                  <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="$t('marketplace_wallets.payout.balance_help')">
                    <v-icon aria-hidden="true">info_outline</v-icon>
                    <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ $t('marketplace_wallets.payout.balance_help') }}</v-tooltip>
                  </v-btn>
                </template>
              </v-checkbox>
              <template v-if="selected_option === 'bank' && selected_vendor">
                <div class="sd-modern-notice b-vendor-payout-add__method-notice">
                  <v-icon size="18" aria-hidden="true">info_outline</v-icon>
                  <span class="sd-modern-notice__content">{{ $t('marketplace_wallets.payout.bank_help') }}</span>
                </div>
                <details class="b-vendor-payout-add__connection">
                  <summary><v-icon size="17" aria-hidden="true">account_balance</v-icon>{{ $t('marketplace_wallets.payout.bank_details_title') }}<v-icon size="16" aria-hidden="true">expand_more</v-icon></summary>
                  <p class="b-vendor-payout-add__caption">{{ $t('marketplace_wallets.payout.bank_reference_help') }}</p>
                  <p v-if="!selected_vendor.bank" class="b-vendor-payout-add__caption">{{ $t('marketplace_wallets.payout.bank_reference_unavailable') }}</p>
                  <u-pods-panel class="b-vendor-payout-add__native-flow" dense small>
                    <u-pod-node icon="business" :title="$t('global.commons.you')" />
                    <u-pod-wire forward />
                    <u-pod-node icon="account_balance" :title="$t('vendor_payout_add.vendor_bank')" />
                  </u-pods-panel>
                  <b-vendor-payout-bank-info :vendor="selected_vendor" class="b-vendor-payout-add__bank-info" />
                </details>
              </template>
              <section v-else-if="selected_option_obj && selected_vendor" class="b-vendor-payout-add__provider">
                <u-widget-header class="sd-modern-form-header" :src="getShopImagePath(selected_option_obj.image)" :title="selected_option_obj.title" />
                <p v-if="selected_option_obj.description" class="b-vendor-payout-add__caption">{{ selected_option_obj.description }}</p>
                <p class="b-vendor-payout-add__caption">{{ $t('marketplace_wallets.payout.provider_help', { provider: selected_option_obj.title }) }}</p>
                <u-pods-panel class="b-vendor-payout-add__native-flow" dense small>
                  <u-pod-node icon="business" :title="$t('global.commons.you')" />
                  <u-pod-wire forward />
                  <u-pod-node :icon="selected_option_obj.icon" :image="selected_option_obj.image" :title="`${$t('global.commons.vendor')} ${selected_option_obj.title}`" />
                </u-pods-panel>
                <div v-if="!selected_option_obj.livemode" class="sd-modern-notice b-vendor-payout-add__method-notice">
                  <v-icon size="18" color="warning" aria-hidden="true">warning_amber</v-icon>
                  <span class="sd-modern-notice__content">{{ $t('marketplace_wallets.payout.debug_help') }}</span>
                </div>
                <template v-if="with_balance">
                <div v-for="balance in selected_option_obj.balances || []" :key="balance.currency" class="b-vendor-payout-add__service-balance">
                  <h4><u-currency-icon :currency="balance.currency" flag-only /><bdi>{{ balance.currency }}</bdi><span>{{ $t('marketplace_wallets.payout.provider_balance_title', { provider: selected_option_obj.title }) }}</span></h4>
                  <dl>
                    <div><dt>{{ $t('marketplace_wallets.payout.available') }}</dt><dd><u-price :amount="balance.amount" :currency="balance.currency" /></dd></div>
                    <div><dt>{{ $t('marketplace_wallets.payout.pending') }}</dt><dd><u-price :amount="balance.pending_amount" :currency="balance.currency" /></dd></div>
                    <div><dt>{{ $t('marketplace_wallets.payout.reserved') }}</dt><dd><u-price :amount="balance.reserved_amount" :currency="balance.currency" /></dd></div>
                  </dl>
                </div>
                <p v-if="selected_option_obj.balances?.length" class="b-vendor-payout-add__caption">{{ $t('marketplace_wallets.payout.provider_balance_help') }}</p>
                <p v-else class="b-vendor-payout-add__caption">{{ $t('marketplace_wallets.payout.provider_balances_unavailable') }}</p>
                </template>
                <details v-if="Object.keys(selected_vendor.meta || {}).length" class="b-vendor-payout-add__connection">
                  <summary><v-icon size="17" aria-hidden="true">link</v-icon>{{ $t('global.commons.meta') }}<v-icon size="16" aria-hidden="true">expand_more</v-icon></summary>
                  <dl class="b-vendor-payout-add__connection-data"><div v-for="(value, key) in selected_vendor.meta" :key="key"><dt>{{ getName(key) }}</dt><dd><span v-copy @click.stop>{{ value }}</span></dd></div></dl>
                </details>
              </section>
            </section>
            <section class="sd-modern-widget b-vendor-payout-add__card">
              <h3><v-icon size="17" aria-hidden="true">receipt_long</v-icon>{{ $t('marketplace_wallets.payout.payment_title') }}</h3>
              <p class="b-vendor-payout-add__caption">{{ $t('marketplace_wallets.payout.amount_help') }}</p>
              <div class="b-vendor-payout-add__amount-grid">
                <u-currency-input v-model="currency" :active-currencies="shop.currencies" :return-object="false" :disabled="busy || busy_delete" :label="$t('global.commons.currency')" variant="underlined" class="sd-modern-underlined-field" />
                <u-price-input v-model="amount" :currency="currency" :disabled="busy || busy_delete" :label="$t(selected_option === 'bank' ? 'marketplace_wallets.payout.amount_bank_label' : selected_option_obj ? 'marketplace_wallets.payout.amount_transfer_label' : 'global.commons.amount')" variant="underlined" class="sd-modern-underlined-field" />
              </div>
              <p class="b-vendor-payout-add__caption">{{ $t('marketplace_wallets.payout.currency_help') }}</p>
              <v-textarea v-model="note" :disabled="busy || busy_delete" :label="`${$t('global.commons.note')} · ${$t('global.commons.optional')}`" :placeholder="$t('marketplace_wallets.payout.note_placeholder')" :messages="$t('marketplace_wallets.payout.note_help')" class="sd-modern-underlined-field b-vendor-payout-add__note-input" append-inner-icon="sticky_note_2" auto-grow persistent-placeholder rows="2" variant="underlined" />
              <u-smart-suggestion :samples="$tm('suggestions.vendor_payment.note')" @select="(value) => (note = value)" />
            </section>
          </div>
          <aside class="b-vendor-payout-add__summary" :aria-label="$t('marketplace_wallets.payout.summary_title')" aria-live="polite">
            <section class="sd-modern-widget b-vendor-payout-add__card">
              <h3><v-icon size="17" aria-hidden="true">fact_check</v-icon>{{ $t('marketplace_wallets.payout.summary_title') }}</h3>
              <p class="b-vendor-payout-add__summary-label">{{ $t('marketplace_wallets.payout.summary_amount') }}</p>
              <div class="b-vendor-payout-add__summary-amount"><u-price :amount="displayAmount" :currency="currency" /></div>
              <dl class="b-vendor-payout-add__summary-data">
                <div><dt>{{ $t('global.commons.vendor') }}</dt><dd>{{ selected_vendor?.name || '—' }}</dd></div>
                <div><dt>{{ $t('global.commons.currency') }}</dt><dd><bdi>{{ currency || '—' }}</bdi></dd></div>
                <div><dt>{{ $t('marketplace_wallets.payout.method_label') }}</dt><dd>{{ selected_option_obj ? selected_option === 'bank' ? $t('marketplace_wallets.payout.bank_choice_title') : selected_option_obj.title : $t('marketplace_wallets.payout.method_not_selected') }}</dd></div>
              </dl>
              <div class="b-vendor-payout-add__impact">
                <h4>{{ $t('marketplace_wallets.payout.impact_title') }}</h4>
                <p>{{ modernImpact }}</p>
                <div v-if="selected_option_obj && displayAmount > 0" class="b-vendor-payout-add__wallet-entry"><span>{{ $t('marketplace_wallets.payout.wallet_entry') }}</span><u-price :amount="-displayAmount" :currency="currency" /></div>
              </div>
            </section>
            <p class="b-vendor-payout-add__ledger-help">{{ $t('marketplace_wallets.payout.ledger_help') }}</p>
          </aside>
        </div>
      </template>
      <template v-else>
      <!-- ███████████████████████ Select vendor ███████████████████████ -->

      <div :class="modern ? 'b-vendor-payout-add__group' : 'widget-box mb-5'">
        <u-widget-header
          :class="{ 'sd-modern-form-header': modern }"
          icon="store"
          :title="$t('vendor_payout_add.vendor.title')"
        ></u-widget-header>

        <v-list-subheader>
          {{ $t(modern ? 'marketplace_wallets.payout.vendor_help' : 'vendor_payout_add.vendor.subtitle') }}
        </v-list-subheader>

        <!-- Visual fund flow -->
        <div v-if="!modern" class="text-center d-flex align-center justify-center" dir="ltr">
          <div class="min-width-100">
            <v-icon>wallet</v-icon>
            <small class="d-block">{{
              $t("vendor_payout_add.vendor_wallet")
            }}</small>
          </div>
          <v-icon class="mb-4">trending_flat</v-icon>
          <div class="min-width-100">
            <v-icon>account_balance</v-icon>
            <small class="d-block"
              >{{ $t("vendor_payout_add.vendor_bank_account") }}
            </small>
          </div>
        </div>

        <b-vendor-input
          v-model="vendor_id"
          :disabled="!!payment"
          :shop="shop"
          :class="{ 'sd-modern-underlined-field': modern }"
          :variant="modern ? 'underlined' : undefined"
          :label="modern ? $t('global.commons.vendor') : undefined"
          clearable
          :placeholder="$t('vendor_payout_add.inputs.vendor.placeholder')"
          @click:clear="vendor_id = null"
        ></b-vendor-input>

        <u-loading-progress v-if="busy_fetch"></u-loading-progress>
        <p v-if="modern && !payment && vendor_id" class="b-vendor-payout-add__help">{{ $t('marketplace_wallets.payout.method_help') }}</p>

        <u-smart-select
          v-if="!payment"
          v-model="selected_option"
          :items="options"
          class="my-3"
          :class="{ 'sd-modern-smart-select': modern }"
          :border="modern"
          :accessible="modern"
          :loading="modern && busy_fetch"
          :disabled="modern && (busy || busy_delete)"
          item-description="description"
          item-icon="icon"
          item-image="image"
          item-text="title"
          item-value="code"
        >
          <template v-slot:append-title="{ item }">
            <span v-if="modern && !item.livemode" class="sd-modern-status sd-modern-status--plain ms-2">
              <span class="sd-modern-status__dot sd-modern-status__dot--warning"></span>{{ $t('global.commons.debug') }}
            </span>
            <v-chip
              v-else-if="!item.livemode"
              class="mx-1 pa-1"
              color="amber"
              label
              size="x-small"
              variant="flat"
              >{{ $t("global.commons.debug") }}
            </v-chip>
          </template>
          <template v-slot:description="{ item }">
            <div v-if="item.balances?.length">
              <v-chip
                v-for="b in item.balances"
                :key="b.currency"
                class="me-2"
                :color="modern ? undefined : '#111'"
                size="small"
                :variant="modern ? 'text' : 'flat'"
              >
                <u-currency-icon
                  :currency="b.currency"
                  class="ms-n3"
                  flag-only
                  small
                ></u-currency-icon>
                <u-price :amount="b.amount" :currency="b.currency"></u-price>

                <v-tooltip
                  activator="parent"
                  :content-class="modern ? 'sd-modern-tooltip text-start' : 'bg-black text-start'"
                  :location="modern ? 'top' : 'bottom'"
                  :max-width="modern ? undefined : 320"
                  :open-on-focus="modern"
                  :open-on-click="modern"
                >
                  <div class="d-flex align-center">
                    <v-img
                      :height="24"
                      :src="getShopImagePath(item.image)"
                      :width="24"
                      class="me-2"
                    ></v-img>
                    {{ modern ? $t('marketplace_wallets.payout.provider_balance_help') : 'Available fund in your connected account.' }}
                  </div>

                  <u-price
                    :amount="b.amount"
                    :currency="b.currency"
                    medium
                  ></u-price>

                  <u-currency-icon
                    :currency="b.currency"
                    class="ms-2 float-end"
                    flag
                  ></u-currency-icon>
                </v-tooltip>
              </v-chip>
            </div>
          </template>
        </u-smart-select>
        <v-btn
          v-if="!payment /*Not edit mode!*/"
          class="tnt"
          :class="{ 'sd-modern-button sd-modern-button--inline': modern }"
          :aria-pressed="modern ? with_balance : undefined"
          variant="text"
          @click="with_balance = !with_balance"
        >
          <v-icon
            :color="modern ? undefined : with_balance ? 'green' : null"
            class="me-1"
            size="x-small"
            >circle
          </v-icon>
          {{
            with_balance
              ? $t(modern ? 'marketplace_wallets.payout.with_balance' : 'vendor_payout_add.with_balance')
              : $t(modern ? 'marketplace_wallets.payout.without_balance' : 'vendor_payout_add.without_balance')
          }}

          <v-tooltip
            activator="parent"
            :location="modern ? 'top' : 'bottom'"
            :content-class="modern ? 'sd-modern-tooltip text-start' : 'bg-black text-start'"
            :max-width="modern ? undefined : 320"
            :open-on-focus="modern"
            :open-on-click="modern"
          >
            {{ $t(modern ? 'marketplace_wallets.payout.balance_help' : 'vendor_payout_add.with_balance_tooltip') }}
          </v-tooltip>
        </v-btn>
      </div>
      <!-- ███████████████████████ Transfer Mode > Bank ███████████████████████ -->

      <div v-if="selected_option === 'bank'" :class="modern ? 'b-vendor-payout-add__group' : 'widget-box mb-5'">
        <u-widget-header
          :class="{ 'sd-modern-form-header': modern }"
          icon="account_balance"
          :title="$t('vendor_payout_add.bank_transfer.title')"
        >
        </u-widget-header>

        <v-list-subheader>
          {{ $t(modern ? 'marketplace_wallets.payout.bank_help' : 'vendor_payout_add.bank_transfer.subtitle') }}
        </v-list-subheader>

        <u-pods-panel>
          <u-pod-node
            icon="business"
            :title="$t('global.commons.you')"
          ></u-pod-node>
          <u-pod-wire forward></u-pod-wire>
          <u-pod-node
            icon="account_balance"
            :title="$t('vendor_payout_add.vendor_bank')"
          ></u-pod-node>
        </u-pods-panel>

        <b-vendor-payout-bank-info
          v-if="selected_vendor"
          :vendor="selected_vendor"
          class="mt-2"
        ></b-vendor-payout-bank-info>
      </div>
      <!-- ███████████████████████ Transfer Mode > External services ███████████████████████ -->

      <div
        v-else-if="selected_option_obj && selected_vendor"
        :class="modern ? 'b-vendor-payout-add__group' : 'widget-box mb-5'"
      >
        <u-widget-header
          :class="{ 'sd-modern-form-header': modern }"
          :src="getShopImagePath(selected_option_obj.image)"
          :title="selected_option_obj.title"
        >
        </u-widget-header>

        <v-list-subheader
          >{{ selected_option_obj.description }}
        </v-list-subheader>

        <u-pods-panel>
          <u-pod-node
            icon="business"
            :title="$t('global.commons.you')"
          ></u-pod-node>
          <u-pod-wire forward></u-pod-wire>
          <u-pod-node
            :icon="selected_option_obj.icon"
            :image="selected_option_obj.image"
            :title="`${$t('global.commons.vendor')} ${selected_option_obj.title}`"
          >
          </u-pod-node>
        </u-pods-panel>

        <v-list-subheader v-if="!selected_option_obj.livemode" :class="{ 'sd-modern-notice': modern }">
          <v-icon class="me-1" color="orange">warning</v-icon>
          {{ $t(modern ? 'marketplace_wallets.payout.debug_help' : 'vendor_payout_add.gateway_in_debug_mode_warning') }}
        </v-list-subheader>

        <u-text-value-box
          v-for="b in selected_option_obj.balances"
          :key="b.currency"
          :label="b.currency"
          :title="modern ? $t('marketplace_wallets.payout.provider_balance_title', { provider: selected_option_obj.title }) : `My balance in the ${selected_option_obj.title}.`"
          :class="{ 'b-vendor-payout-add__balances': modern }"
          vb50
        >
          <div class="d-flex align-center justify-content-around">
            <small>{{ modern ? $t('marketplace_wallets.payout.available') : 'Avail.' }} </small>
            <u-price
              :amount="b.amount"
              :currency="b.currency"
              class="me-2"
            ></u-price>
            <v-spacer></v-spacer>
            <small>{{ modern ? $t('marketplace_wallets.payout.pending') : 'Pend.' }} </small>
            <u-price
              :amount="b.pending_amount"
              :currency="b.currency"
              class="me-2"
            ></u-price>
            <v-spacer></v-spacer>
            <small>{{ modern ? $t('marketplace_wallets.payout.reserved') : 'Res.' }} </small>
            <u-price
              :amount="b.reserved_amount"
              :currency="b.currency"
            ></u-price>
          </div>
        </u-text-value-box>

        <u-text-value-box
          v-for="(it, k) in selected_vendor.meta"
          :key="k"
          :label="getName(k)"
          vb50
          >{{ it }}
        </u-text-value-box>
      </div>
      <!-- ███████████████████████ Payment ███████████████████████ -->

      <div :class="[modern ? 'b-vendor-payout-add__group' : 'widget-box mb-5', { disabled: !selected_option }]">
        <u-widget-header
          :class="{ 'sd-modern-form-header': modern }"
          icon="paid"
          :title="$t('vendor_payout_add.payment.title')"
        ></u-widget-header>

        <v-list-subheader>
          {{ $t(modern ? 'marketplace_wallets.payout.amount_help' : 'vendor_payout_add.payment.subtitle') }}
        </v-list-subheader>

        <div :class="{ 'b-vendor-payout-add__amount-grid': modern }">
        <u-currency-input
          v-model="currency"
          :active-currencies="shop.currencies"
          :disabled="!!payment"
          :label="$t('global.commons.currency')"
          :return-object="false"
          variant="underlined"
          :class="{ 'sd-modern-underlined-field': modern }"
        ></u-currency-input>
        <u-price-input
          v-model="amount"
          :currency="currency"
          :disabled="!!payment"
          :label="$t('global.commons.amount')"
          class="strong-field"
          :class="{ 'sd-modern-underlined-field': modern }"
          variant="underlined"
        ></u-price-input>
        </div>

        <v-textarea
          v-model="note"
          :disabled="!!payment"
          :label="$t('global.commons.note')"
          append-inner-icon="sticky_note_2"
          auto-grow
          :hide-details="!modern"
          persistent-placeholder
          :placeholder="$t(modern ? 'marketplace_wallets.payout.note_placeholder' : 'vendor_payout_add.inputs.note.placeholder')"
          :messages="modern ? $t('marketplace_wallets.payout.note_help') : undefined"
          :class="{ 'sd-modern-underlined-field': modern }"
          rows="2"
          variant="underlined"
        >
        </v-textarea>
        <u-smart-suggestion
          v-if="!payment /*Only in add mode!*/"
          :samples="$tm('suggestions.vendor_payment.note')"
          @select="(v) => (note = v)"
        >
        </u-smart-suggestion>
      </div>

      <div v-if="payment?.reversal_detail?.length" :class="modern ? 'b-vendor-payout-add__group' : 'widget-box mb-5'">
        <u-widget-header
          :class="{ 'sd-modern-form-header': modern }"
          icon="history"
          :title="$t('vendor_payout_add.history.title')"
        ></u-widget-header>
        <v-list-subheader>
          {{ $t("vendor_payout_add.history.subtitle") }}
        </v-list-subheader>
        <b-vendor-payout-history :payment="payment"></b-vendor-payout-history>
      </div>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Delete ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div v-if="payment" :class="modern ? 'b-vendor-payout-add__group sd-modern-critical' : 'widget-box mb-5'">
        <u-widget-header
          :class="{ 'sd-modern-form-header': modern }"
          icon="block"
          :title="$t('vendor_payout_add.refund.title')"
        ></u-widget-header>
        <v-list-subheader>
          {{ $t(modern ? 'marketplace_wallets.payout.refund_help' : 'vendor_payout_add.refund.subtitle') }}
        </v-list-subheader>

        <u-smart-toggle
          v-model="accept_delete"
          class="my-3"
          :color="modern ? 'error' : 'red'"
          :true-description="
            $t('vendor_payout_add.inputs.accept_refund.true_description')
          "
          :true-title="$t('vendor_payout_add.inputs.accept_refund.true_title')"
        ></u-smart-toggle>

        <div :class="modern ? 'b-vendor-payout-add__actions' : 'widget-buttons'">
          <v-btn
            :class="{ disabled: !accept_delete, 'sd-modern-button sd-modern-button--danger': modern }"
            :disabled="modern ? !accept_delete || busy_delete || busy : undefined"
            :loading="busy_delete"
            :color="modern ? 'error' : 'red'"
            :size="modern ? undefined : 'x-large'"
            :variant="modern ? 'elevated' : undefined"
            @click="remove"
          >
            <v-icon class="me-1">remove</v-icon>

            {{ $t("global.actions.refund") }}
          </v-btn>
        </div>
      </div>
      </template>
    </v-card-text>

    <v-card-actions :class="{ 'b-vendor-payout-add__footer': modern }">
      <span v-if="modern && !payment" class="b-vendor-payout-add__footer-hint"><v-icon size="17" aria-hidden="true">info_outline</v-icon><span>{{ modernFooterHint }}</span></span>
      <div :class="modern ? 'b-vendor-payout-add__actions' : 'widget-buttons'">
        <v-btn :size="modern ? undefined : 'x-large'" :class="{ 'sd-modern-button': modern }" variant="text" :disabled="modern ? busy || busy_delete : undefined" @click="close">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="!payment"
          :class="{ disabled: !vendor_id || !currency || !amount, 'sd-modern-button sd-modern-button--primary': modern }"
          :disabled="modern ? !canSubmitModern : undefined"
          :loading="busy"
          color="primary"
          :size="modern ? undefined : 'x-large'"
          variant="elevated"
          @click="addPayment"
        >
          <template v-if="modern && !selected_option_obj">
            <v-icon start aria-hidden="true">payments</v-icon>{{ $t('marketplace_wallets.payout.choose_method') }}
          </template>
          <template v-else-if="selected_option === 'bank'">
            <v-icon start>{{ modern ? 'save' : 'add' }}</v-icon>
            {{ $t(modern ? 'marketplace_wallets.payout.record_action' : 'global.actions.add') }}
          </template>
          <template v-else>
            <v-icon start>{{ modern ? 'swap_horiz' : 'add' }}</v-icon>
            {{ $t(modern ? 'marketplace_wallets.payout.transfer_action' : 'global.actions.transfer_fund', { provider: selected_option_obj?.title || '' }) }}
          </template>
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { escape } from "lodash-es";

import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import BVendorInput from "../../../vendor/input/BVendorInput.vue";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import BVendorPayoutBankInfo from "../../../vendor/payout/bank-info/BVendorPayoutBankInfo.vue";
import UPodsPanel from "../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../../ui/pod/wire/UPodWire.vue";
import UTextValueBox from "../../../../ui/text/value-box/UTextValueBox.vue";
import BVendorPayoutHistory from "../../../vendor/payout/history/BVendorPayoutHistory.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import BVendorBox from "../../../vendor/box/BVendorBox.vue";
import DateMixin from "../../../../mixin/date/DateMixin.ts";


export default {
  name: "BVendorPayoutAdd",
  mixins: [DateMixin],
  components: {
    BVendorBox,
    UCurrencyIcon,
    USmartSuggestion,
    USmartToggle,
    BVendorPayoutHistory,
    UTextValueBox,
    UPodWire,
    UPodNode,
    UPodsPanel,
    BVendorPayoutBankInfo,
    USmartSelect,
    BVendorInput,
    UCurrencyInput,
    UPriceInput,
  },
  props: {
    modern: {
      type: Boolean,
      default: false,
    },
    shop: {
      required: true,
    },

    payment: {},

    initialAmount: {},
    initialCurrency: {},
    initialVendor: {},
  },
  data: () => ({
    busy: false,
    busy_delete: false,
    deleteRequest: null,

    vendor_id: null,
    currency: null,
    amount: 0,

    note: null,

    accept_delete: false,
    critical_open: false,

    options: [],
    selected_vendor: null,
    busy_fetch: false,
    options_error: false,
    optionsRequestId: 0,
    selected_option: null,

    with_balance: !window.vendor_payment_options_fast_mode,
  }),
  computed: {
    displayAmount() {
      return Number.isFinite(Number(this.amount)) ? Number(this.amount) : 0;
    },
    modernImpact() {
      return this.$t(
        !this.selected_option_obj ? 'marketplace_wallets.payout.choose_method_help' : this.selected_option === 'bank' ? 'marketplace_wallets.payout.bank_impact' : 'marketplace_wallets.payout.provider_impact',
        { provider: this.selected_option_obj?.title || '' },
      );
    },
    modernFooterHint() {
      return this.$t(
        !this.selected_option_obj ? 'marketplace_wallets.payout.footer_choose' : this.selected_option === 'bank' ? 'marketplace_wallets.payout.footer_bank' : 'marketplace_wallets.payout.footer_provider',
        { provider: this.selected_option_obj?.title || '' },
      );
    },
    remainingAmount() {
      return Math.max(0, Number(this.payment?.amount || 0) - Number(this.payment?.reversal || 0));
    },
    canSubmitModern() {
      return !!(
        !this.payment && !this.busy && !this.busy_delete && !this.busy_fetch &&
        this.vendor_id && this.selected_vendor?.id == this.vendor_id &&
        this.currency && this.selected_option_obj &&
        Number.isFinite(Number(this.amount)) && Number(this.amount) > 0
      );
    },
    selected_option_obj() {
      return this.options?.find((x) => x.code === this.selected_option);
    },
  },

  watch: {
    payment() {
      this.assign();
    },
    'shop.id'() {
      if (!this.modern) return;
      this.deleteRequest = null;
      this.busy_delete = false;
      this.accept_delete = false;
      this.critical_open = false;
    },
    vendor_id() {
      if (this.payment) return; // In view mode

      this.fetchAvailablePaymentMethods();
    },
    with_balance(val) {
      window.vendor_payment_options_fast_mode = val;
      if (val) this.fetchAvailablePaymentMethods();
    },
  },

  created() {
    this.assign();
  },

  beforeUnmount() {
    this.optionsRequestId++;
    this.deleteRequest = null;
  },

  methods: {
    modernOptionTitle(option) {
      // USmartSelect renders its title as HTML; payment labels are plain text.
      return escape(this.$t(option.code === 'bank' ? 'marketplace_wallets.payout.bank_choice_title' : 'marketplace_wallets.payout.provider_choice_title', { provider: option.title }));
    },
    modernOptionDescription(option) {
      return this.$t(option.code === 'bank' ? 'marketplace_wallets.payout.bank_choice_description' : 'marketplace_wallets.payout.provider_choice_description', { provider: option.title });
    },
    close() {
      if (this.modern) {
        this.accept_delete = false;
        this.critical_open = false;
      }
      this.$emit('close');
    },
    onCriticalToggle(event) {
      this.critical_open = event.target.open;
      if (!this.critical_open) this.accept_delete = false;
    },
    fetchAvailablePaymentMethods() {
      if (this.modern && this.payment) return;
      const requestId = ++this.optionsRequestId;
      this.options = [];
      this.selected_option = null;
      this.selected_vendor = null;
      this.options_error = false;
      if (!this.vendor_id) {
        if (this.modern) this.busy_fetch = false;
        return;
      }

      this.busy_fetch = true;

      axios
        .get(
          window.API.GET_SHOP_VENDOR_PAYMENT_OPTIONS(
            this.shop.id,
            this.vendor_id,
          ),
          {
            params: {
              with_balance: this.with_balance,
            },
          },
        )
        .then(({ data }) => {
          if (this.modern && requestId !== this.optionsRequestId) return;
          if (!data.error) {
            this.selected_vendor = data.vendor;
            this.options = data.options;
          } else {
            if (this.modern) this.options_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (this.modern && requestId !== this.optionsRequestId) return;
          if (this.modern) this.options_error = true;
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (this.modern && requestId !== this.optionsRequestId) return;
          this.busy_fetch = false;
        });
    },
    //――――――――――――――――――――――― Edit Vendor ―――――――――――――――――――――――

    assign() {
      const requestId = this.optionsRequestId;
      this.resetToDefault(); // 🞇 Reset to default
      if (this.modern) this.optionsRequestId = requestId + 1;
      this.currency = this.shop.currencies[0];

      // Apply initialized amount and currency:
      this.currency = this.initialCurrency
        ? this.initialCurrency
        : this.currency;
      this.amount = this.initialAmount ? this.initialAmount : this.amount;

      if (this.initialVendor) {
        this.vendor_id = this.initialVendor.id;
        this.selected_vendor = this.initialVendor;
      }

      if (this.payment) {
        this.vendor_id = this.payment.vendor_id;
        this.currency = this.payment.currency;
        this.amount = this.payment.amount;
        this.note = this.payment.note;

        this.selected_option = this.payment.option;

        this.accept_delete = false;
      }
    },

    addPayment() {
      if (this.modern && !this.canSubmitModern) return;
      this.busy = true;

      axios
        .post(window.API.POST_SHOP_VENDOR_PAYMENT_ADD(this.shop.id), {
          vendor_id: this.vendor_id,
          currency: this.currency,
          amount: this.amount,
          note: this.note,
          option: this.selected_option,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("add", data.payment);
            this.$emit("update:account", data.account);
            this.$emit("close");

            NotificationService.showSuccessAlert(
              this.$t("vendor_payout_add.notifications.payout_success.title"),
              this.$t("vendor_payout_add.notifications.payout_success.message"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    remove() {
      if (this.modern && (!this.payment?.id || this.payment.deleted_at || !this.critical_open || !this.accept_delete || this.busy || this.busy_delete)) return;
      const modern = this.modern;
      const payment = this.payment;
      const paymentId = payment.id;
      const shopId = this.shop.id;
      const request = Symbol();
      if (modern) this.deleteRequest = request;
      // A completed request must only affect the dialog that submitted it.
      const isCurrent = () => !modern || (this.modern && this.deleteRequest === request && this.payment === payment && this.payment.id === paymentId && this.shop.id === shopId);
      this.busy_delete = true;

      return axios
        .delete(
          window.API.DELETE_SHOP_VENDOR_PAYMENT(shopId, paymentId),
        )
        .then(({ data }) => {
          if (!isCurrent()) return;
          if (!data.error) {
            this.$emit("remove", data.id);
            if (!isCurrent()) return;
            this.close();
            NotificationService.showSuccessAlert(
              this.$t(
                "vendor_payout_add.notifications.reverse_fund_success.title",
              ),
              this.$t(
                "vendor_payout_add.notifications.reverse_fund_success.message",
              ),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (!isCurrent()) return;
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (!isCurrent()) return;
          this.busy_delete = false;
          if (modern) this.deleteRequest = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-vendor-payout-add--modern {
  --sd-modern-icon-button-size: 33px;
  padding: 24px;
  border: 0;
  border-radius: 18px !important;
  font-family: inherit;
  font-size: 13px;
  line-height: 21px;

  &.b-vendor-payout-add--detail { line-height: 20px; > .b-vendor-payout-add__body { line-height: 20px; } }

  > .b-vendor-payout-add__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-shrink: 0;
    gap: 15px;
    padding: 0;
    margin-block-end: 20px;
    white-space: normal;

    h2 { margin: 0; font-size: 21px; font-weight: 500; line-height: 29px; }
    p { margin: 4px 0 0; font-size: 13px; font-weight: 400; line-height: 21px; color: var(--sd-modern-muted); }
  }

  > .b-vendor-payout-add__body { padding: 0 !important; font-size: 13px; line-height: 21px; }
  .b-vendor-payout-add__group { margin-block-end: 24px; }
  .b-vendor-payout-add__group:last-child { margin-block-end: 0; }
  .b-vendor-payout-add__help { margin-block: 12px; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  :deep(.v-list-subheader) { min-height: 0; padding: 4px 0 14px; font-size: 13px; line-height: 21px; color: var(--sd-modern-muted); white-space: normal; }
  :deep(.v-list-subheader__text) { max-width: 100%; overflow: visible; text-overflow: clip; white-space: normal; overflow-wrap: anywhere; }
  .b-vendor-payout-add__group :deep(.sd-modern-form-header h2) { font-size: 15px; font-weight: 500; line-height: 21px; }
  .b-vendor-payout-add__group :deep(.sd-modern-form-header .--icon) { font-size: 18px !important; }
  :deep(.s--widget-header) { margin-block-end: 0; }
  :deep(.widget-body) { margin: 0; }
  .b-vendor-payout-add__amount-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; }
  .b-vendor-payout-add__balances :deep(small) { font-size: 13px; line-height: 20px; }
  .b-vendor-payout-add__balances :deep(.d-flex) { flex-wrap: wrap; gap: 6px; }
  .b-vendor-payout-add__identity { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-block-end: 22px; min-width: 0; }
  .b-vendor-payout-add__identity > span:last-child { color: var(--sd-modern-muted); font-size: 12px; overflow-wrap: anywhere; }
  .b-vendor-payout-add__details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px 24px; margin: 0 0 24px; }
  .b-vendor-payout-add__detail-label { margin: 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; font-weight: 400; }
  .b-vendor-payout-add__details dd { margin: 6px 0 0; font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
  .b-vendor-payout-add__details small { display: block; margin-block-start: 3px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-vendor-payout-add__officer { display: flex; align-items: center; gap: 8px; }
  .b-vendor-payout-add__detail-note { margin-block-end: 24px; }
  .b-vendor-payout-add__detail-note h3 { margin: 0; }
  .b-vendor-payout-add__detail-note p, .b-vendor-payout-add__history-entry p { margin: 6px 0 0; white-space: pre-line; overflow-wrap: anywhere; font-size: 13px; line-height: 20px; }
  .b-vendor-payout-add__history h3 { margin: 0 0 12px; font-size: 15px; font-weight: 500; line-height: 22px; }
  .b-vendor-payout-add__history-entry { display: grid; grid-template-columns: minmax(90px, .7fr) minmax(0, 1.3fr); align-items: start; gap: 16px; padding-block: 12px; border-block-end: 1px solid var(--sd-modern-border); }
  .b-vendor-payout-add__history-entry > div > p { margin: 0; }
  .b-vendor-payout-add__history-entry small { display: block; margin-block-start: 4px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; overflow-wrap: anywhere; }
  .b-vendor-payout-add__metadata, .b-vendor-payout-add__critical { margin-block-start: 24px; }
  .b-vendor-payout-add__metadata summary, .b-vendor-payout-add__critical summary { min-height: 44px; padding-block: 12px; cursor: pointer; }
  .b-vendor-payout-add__critical summary > .v-icon { margin-inline-end: 7px; }
  .b-vendor-payout-add__critical > p { margin: 4px 0 16px; font-size: 13px; line-height: 20px; }
  .b-vendor-payout-add__critical .b-vendor-payout-add__actions { margin-block-start: 18px; }
  .b-vendor-payout-add__metadata dl { display: grid; gap: 14px; margin: 8px 0 0; }
  .b-vendor-payout-add__metadata dd { margin: 5px 0 0; overflow-wrap: anywhere; }
  summary:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  > .b-vendor-payout-add__footer { flex-shrink: 0; padding: 20px 0 0; }
  .b-vendor-payout-add__actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 10px; width: 100%; }
}

@media (max-width: 600px) {
  .b-vendor-payout-add--modern {
    padding: 19px 15px;
    > .b-vendor-payout-add__header h2 { font-size: 19px; line-height: 27px; }
    .b-vendor-payout-add__amount-grid { grid-template-columns: minmax(0, 1fr); gap: 0; }
    .b-vendor-payout-add__identity { align-items: flex-start; flex-wrap: wrap; }
    .b-vendor-payout-add__details { grid-template-columns: minmax(0, 1fr); gap: 16px; }
    .b-vendor-payout-add__history-entry { grid-template-columns: minmax(0, 1fr); gap: 8px; }
  }
}

// Refined creation keeps the native fields and request flow inside one scroll surface.
.b-vendor-payout-add--create {
  --sd-modern-icon-button-size: 34px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 0;
  border-radius: 0 !important;
  font-size: 14px;
  line-height: 22px;

  > .b-vendor-payout-add__header { align-items: center; gap: 14px; min-height: 96px; padding: 22px 24px; margin: 0; border-block-end: 1px solid var(--sd-modern-border); }
  .b-vendor-payout-add__header-icon { display: grid; place-items: center; flex: 0 0 38px; width: 38px; height: 38px; border-radius: 10px; background: var(--sd-modern-inset); > .v-icon { font-size: 20px; } }
  .b-vendor-payout-add__header-copy { flex: 1; min-width: 0;
    h2 { font-family: inherit; font-size: 20px; font-weight: 500; line-height: 28px; letter-spacing: 0; }
    p { max-width: 720px; margin: 3px 0 0; font-size: 13px; line-height: 20px; }
  }
  > .b-vendor-payout-add__body { flex: 1 1 auto; min-height: 0; padding: 0 !important; overflow-y: auto; font-size: 14px; line-height: 22px; }
  .b-vendor-payout-add__workspace { display: grid; grid-template-columns: minmax(0, 1fr) 280px; align-items: start; gap: 24px; width: 100%; max-width: 1088px; min-width: 0; margin-inline: auto; padding: 28px 24px 32px; }
  .b-vendor-payout-add__form { display: grid; gap: 18px; min-width: 0; }
  .b-vendor-payout-add__card { min-width: 0; padding: 22px; border: 0; border-radius: 16px; box-shadow: none;
    > h3 { display: flex; align-items: center; gap: 8px; margin: 0; font-family: inherit; font-size: 14px; font-weight: 500; line-height: 22px; letter-spacing: 0; }
    > h3 + .b-vendor-payout-add__caption { margin: 5px 0 18px; }
    :deep(.v-field__input) { font-family: inherit; font-size: 14px; line-height: 22px; }
    :deep(.v-field-label), :deep(.v-messages) { font-family: inherit; font-size: 13px; line-height: 20px; }
  }
  .b-vendor-payout-add__caption { margin: 5px 0 0; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
  .b-vendor-payout-add__methods { margin-block-start: 18px;
    :deep(.small) { font-size: 13px; line-height: 20px; }
    :deep(.sd-modern-status) { font-size: 12px; line-height: 20px; }
  }
  .b-vendor-payout-add__balance-toggle { margin-block-start: 9px;
    :deep(.v-label) { font-family: inherit; font-size: 13px; line-height: 20px; opacity: 1; }
    :deep(.v-input__append) { align-items: center; padding: 0; }
  }
  .b-vendor-payout-add__options-error { margin-block-start: 16px; }
  .b-vendor-payout-add__method-notice { margin-block-start: 14px; font-size: 13px; line-height: 20px; }
  .b-vendor-payout-add__connection { min-width: 0; margin-block-start: 15px;
    > summary { display: flex; align-items: center; gap: 8px; min-height: 44px; padding-block: 8px; font-size: 13px; line-height: 20px; list-style: none; cursor: pointer;
      &::-webkit-details-marker { display: none; }
      > .v-icon:last-child { margin-inline-start: auto; }
    }
    &[open] > summary > .v-icon:last-child { transform: rotate(180deg); }
  }
  .b-vendor-payout-add__native-flow { min-width: 0; margin: 14px 0 !important; padding: 12px 0 !important;
    :deep(.pod) { flex: 1 1 0; width: auto; height: auto; min-width: 0; min-height: 70px; aspect-ratio: auto !important; padding: 12px 8px; border-width: 1px; background: rgb(var(--v-theme-surface)); box-shadow: none !important; }
    :deep(.pod > small) { max-width: 100%; overflow: visible; white-space: normal; text-overflow: clip; font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
    :deep(.min-width-50) { flex: 0 0 40px !important; min-width: 40px !important; }
  }
  .b-vendor-payout-add__bank-info { font-size: 13px; line-height: 20px; }
  .b-vendor-payout-add__provider { min-width: 0; margin-block-start: 16px;
    :deep(.sd-modern-form-header h2) { font-size: 14px; font-weight: 500; line-height: 22px; }
  }
  .b-vendor-payout-add__service-balance { margin-block-start: 16px;
    > h4 { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin: 0; font-size: 13px; font-weight: 500; line-height: 20px; :deep(img) { width: 18px; } > span:last-child { color: var(--sd-modern-muted); font-weight: 400; } }
    > dl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin: 12px 0 0; > div { min-width: 0; } }
    dt { margin-block-end: 4px; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
    dd { margin: 0; font-size: 14px; line-height: 22px; }
  }
  .b-vendor-payout-add__connection-data { display: grid; gap: 12px; margin: 9px 0 0; font-size: 13px; line-height: 20px;
    > div { display: grid; grid-template-columns: minmax(95px, 35%) minmax(0, 1fr); gap: 14px; }
    dt { color: var(--sd-modern-muted); }
    dd { min-width: 0; margin: 0; overflow-wrap: anywhere; }
  }
  .b-vendor-payout-add__amount-grid { gap: 18px; margin-block: 18px; }
  .b-vendor-payout-add__note-input { margin-block-start: 18px; }
  .b-vendor-payout-add__summary { min-width: 0; }
  .b-vendor-payout-add__summary-label { margin: 18px 0 5px; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  .b-vendor-payout-add__summary-amount { margin-block-end: 18px; overflow-wrap: anywhere;
    :deep(.u--price) { font-size: 26px; font-weight: 500; line-height: 34px; }
  }
  .b-vendor-payout-add__summary-data { display: grid; gap: 15px; margin: 0; font-size: 13px; line-height: 20px;
    > div { display: flex; justify-content: space-between; gap: 14px; }
    dt { color: var(--sd-modern-muted); }
    dd { min-width: 0; max-width: 60%; margin: 0; text-align: end; overflow-wrap: anywhere; }
  }
  .b-vendor-payout-add__impact { margin-block-start: 20px; padding-block-start: 18px; border-block-start: 1px solid var(--sd-modern-border);
    > h4 { margin: 0 0 6px; font-size: 13px; font-weight: 500; line-height: 20px; }
    > p { margin: 0; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
  }
  .b-vendor-payout-add__wallet-entry { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-block-start: 14px; font-size: 13px; line-height: 20px; :deep(.u--price) { font-size: 13px; font-weight: 400; line-height: 20px; } }
  .b-vendor-payout-add__ledger-help { margin: 0; padding: 14px 4px; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
  > .b-vendor-payout-add__footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex: 0 0 auto; min-height: 84px; padding: 16px 24px; border-block-start: 1px solid var(--sd-modern-border); }
  .b-vendor-payout-add__footer-hint { display: flex; align-items: flex-start; gap: 8px; min-width: 0; max-width: 600px; margin-inline-end: auto; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); > .v-icon { margin-block-start: 2px; } }
  .b-vendor-payout-add__actions { flex: 0 0 auto; width: auto; gap: 10px; }
}

@media (max-width: 900px) {
  .b-vendor-payout-add--create {
    .b-vendor-payout-add__workspace { grid-template-columns: minmax(0, 1fr) 250px; gap: 18px; padding-inline: 20px; }
    .b-vendor-payout-add__card { padding: 20px; }
  }
}
@media (max-width: 760px) {
  .b-vendor-payout-add--create {
    .b-vendor-payout-add__workspace { grid-template-columns: minmax(0, 1fr); }
    > .b-vendor-payout-add__footer { flex-wrap: wrap; gap: 14px; }
    .b-vendor-payout-add__footer-hint { flex: 1 1 100%; max-width: none; }
    .b-vendor-payout-add__actions { margin-inline-start: auto; }
  }
}
@media (max-width: 520px) {
  .b-vendor-payout-add--create {
    > .b-vendor-payout-add__header { display: grid; grid-template-columns: 34px minmax(0, 1fr) 44px; align-items: start; gap: 10px; min-height: 90px; padding: 18px 16px; }
    .b-vendor-payout-add__header-icon { grid-column: 1; grid-row: 1; width: 34px; height: 34px; }
    .b-vendor-payout-add__header-copy { display: contents;
      h2 { grid-column: 2; grid-row: 1; align-self: center; font-size: 19px; line-height: 27px; }
      p { grid-column: 1 / -1; grid-row: 2; max-width: none; margin: 0; }
    }
    .b-vendor-payout-add__header > .v-btn { grid-column: 3; grid-row: 1; }
    .b-vendor-payout-add__workspace { padding: 22px 12px 28px; }
    .b-vendor-payout-add__card { padding: 18px; :deep(.v-field__input), :deep(input), :deep(textarea) { font-size: 16px; } }
    .b-vendor-payout-add__amount-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
    .b-vendor-payout-add__service-balance > dl { grid-template-columns: minmax(0, 1fr); gap: 12px; > div { display: flex; justify-content: space-between; gap: 10px; } dt { margin: 0; } }
    .b-vendor-payout-add__connection-data > div { grid-template-columns: minmax(0, 1fr); gap: 3px; }
    > .b-vendor-payout-add__footer { padding: 15px 16px; }
    .b-vendor-payout-add__actions { flex: 1 1 100%; width: 100%; margin: 0; gap: 8px; > .sd-modern-button--primary { flex: 1; min-width: 0; white-space: normal; } }
  }
}
</style>
