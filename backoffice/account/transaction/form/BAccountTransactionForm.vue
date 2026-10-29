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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <section
    v-if="modern && account_from"
    class="sd-modern-widget b-account-transfer-form text-start"
    :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'"
    :aria-label="$t('transaction_form.modern.details')"
    :aria-busy="busy_createTransaction || busy_confirmTransaction"
  >
    <aside class="b-account-transfer-form__context">
      <h2>{{ $t("transaction_form.modern.source") }}</h2>
      <div class="b-account-transfer-form__account">
        <u-currency-icon
          :currency="currency"
          :flag-only="!!(currency?.flag || currency?.icon)"
          small
          class="b-account-transfer-form__currency"
        />
        <div class="b-account-transfer-form__identity">
          <div class="b-account-transfer-form__name">
            <bdi>{{ account_from.account_name }}</bdi>
          </div>
          <button
            v-copy="formatCard(account_from.account_number)"
            type="button"
            class="b-account-transfer-form__copy"
            :aria-label="$t('transaction_form.modern.copy')"
          >
            <bdi dir="ltr">{{ formatCard(account_from.account_number) }}</bdi>
            <v-icon size="12" aria-hidden="true">content_copy</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-focus
              >{{ $t("transaction_form.modern.copy") }}</v-tooltip
            >
          </button>
          <span class="b-account-transfer-form__code">{{
            account_from.currency
          }}</span>
        </div>
      </div>
      <div class="b-account-transfer-form__available">
        <span class="b-account-transfer-form__caption">{{
          $t("transaction_form.modern.available")
        }}</span>
        <u-price
          :amount="available_balance"
          :currency="currency?.code"
          class="b-account-transfer-form__value"
        />
      </div>
      <dl class="b-account-transfer-form__facts">
        <div>
          <dt>{{ $t("transaction_form.modern.balance") }}</dt>
          <dd>
            <u-price
              :amount="account_from.balance"
              :currency="currency?.code"
            />
          </dd>
        </div>
        <div>
          <dt>{{ $t("transaction_form.modern.locked") }}</dt>
          <dd>
            <u-price :amount="account_from.locked" :currency="currency?.code" />
          </dd>
        </div>
      </dl>
      <div class="b-account-transfer-form__route">
        <div class="b-account-transfer-form__node">
          <span
            ><img
              :src="
                $vuetify.theme.current.dark
                  ? require('../../../../assets/selldone-logo/selldone-w.svg')
                  : require('../../../../assets/selldone-logo/selldone.svg')
              "
              width="20"
              height="20"
              alt="Selldone"
          /></span>
          {{ $t("transaction_form.modern.this_wallet") }}
        </div>
        <div class="b-account-transfer-form__wire">
          <span>{{ currency?.code }}</span>
          <div>
            <i /><v-icon size="16" aria-hidden="true">{{
              $t("icons.arrow_next")
            }}</v-icon>
          </div>
        </div>
        <div class="b-account-transfer-form__node">
          <span
            ><img
              :src="
                $vuetify.theme.current.dark
                  ? require('../../../../assets/selldone-logo/selldone-w.svg')
                  : require('../../../../assets/selldone-logo/selldone.svg')
              "
              width="20"
              height="20"
              alt="Selldone"
          /></span>
          {{ $t("transaction_form.modern.other_wallet") }}
        </div>
      </div>
      <dl class="b-account-transfer-form__facts b-account-transfer-form__draft">
        <div>
          <dt>{{ $t("transaction_form.modern.draft_amount") }}</dt>
          <dd><u-price :amount="amount || 0" :currency="currency?.code" /></dd>
        </div>
        <div>
          <dt>{{ $t("transaction_form.modern.fee") }}</dt>
          <dd>{{ $t("transaction_form.modern.fee_later") }}</dd>
        </div>
      </dl>
      <p class="b-account-transfer-form__fee-note">
        {{ $t("transaction_form.modern.fee_note") }}
      </p>
    </aside>

    <div class="b-account-transfer-form__fields">
      <h2>{{ $t("transaction_form.modern.details") }}</h2>
      <div class="b-account-transfer-form__field">
        <label
          :for="`account-transfer-to-${account_from.account_number}`"
          class="b-account-transfer-form__label"
          >{{ $t("transaction_form.modern.destination")
          }}<span aria-hidden="true">*</span></label
        >
        <v-text-field
          :id="`account-transfer-to-${account_from.account_number}`"
          v-model="account_to"
          v-mask="'####-####-####-####'"
          :disabled="
            !!receipt || busy_createTransaction || busy_confirmTransaction
          "
          :error="account_to_error"
          :aria-invalid="account_to_error"
          :aria-describedby="`account-transfer-to-status-${account_from.account_number}`"
          class="sd-modern-underlined-field b-account-transfer-form__input"
          variant="underlined"
          hide-details
          required
          inputmode="numeric"
          autocomplete="off"
          dir="ltr"
          placeholder="0000-0000-0000-0000"
          ><template #append-inner
            ><v-icon v-if="receipt" size="16" aria-hidden="true"
              >lock</v-icon
            ></template
          ></v-text-field
        >
        <v-tooltip
          :id="`account-transfer-to-help-${account_from.account_number}`"
          :activator="`#account-transfer-to-${account_from.account_number}`"
          :activator-props="{
            'aria-describedby': `account-transfer-to-status-${account_from.account_number} account-transfer-to-help-${account_from.account_number}`,
          }"
          location="top"
          content-class="sd-modern-tooltip text-start"
          open-on-focus
          open-on-click
          >{{ $t("transaction_form.modern.destination_help") }}</v-tooltip
        >
        <div
          :id="`account-transfer-to-status-${account_from.account_number}`"
          class="b-account-transfer-form__status"
          :role="account_to_error ? 'alert' : 'status'"
          aria-live="polite"
        >
          <v-progress-circular
            v-if="account_to_loading"
            indeterminate
            width="2"
            size="14"
            color="primary"
          />
          <v-icon
            v-else-if="account_to_error"
            size="14"
            color="error"
            class="no-inv"
            aria-hidden="true"
            >error_outline</v-icon
          >
          <span
            v-else-if="account_to_success"
            class="sd-modern-status__dot sd-modern-status__dot--success no-inv"
            aria-hidden="true"
          />
          <span
            >{{
              account_to_message || $t("transaction_form.enter_account_number")
            }}<template v-if="account_to_success && account_to_user_name">
              · <bdi>{{ account_to_user_name }}</bdi> ·
              {{ account_to_currency }}</template
            ></span
          >
          <v-avatar v-if="account_to_success && account_to_user_id" size="22"
            ><v-img
              :src="getUserAvatar(account_to_user_id)"
              :alt="account_to_user_name"
          /></v-avatar>
        </div>
      </div>

      <div class="b-account-transfer-form__field">
        <label
          :for="`account-transfer-amount-${account_from.account_number}`"
          class="b-account-transfer-form__label"
          >{{ $t("transaction_form.modern.amount")
          }}<span aria-hidden="true">*</span></label
        >
        <u-price-input
          :id="`account-transfer-amount-${account_from.account_number}`"
          v-model="amount"
          :currency="currency?.code"
          :dark="$vuetify.theme.current.dark"
          :suffix="native_currency_label"
          :disabled="
            !!receipt || busy_createTransaction || busy_confirmTransaction
          "
          :aria-invalid="!!amount_error"
          :aria-describedby="`account-transfer-amount-status-${account_from.account_number}`"
          :error="!!amount_error"
          class="sd-modern-underlined-field b-account-transfer-form__input b-account-transfer-form__amount"
          variant="underlined"
          hide-details
          required
          inputmode="decimal"
          autocomplete="off"
          dir="ltr"
        />
        <div
          v-if="display_equivalent"
          class="b-account-transfer-form__equivalent"
        >
          <span>{{ $t("transaction_form.modern.equivalent") }}</span
          ><u-price :amount="amount || 0" :currency="currency?.code" />
        </div>
        <p
          :id="`account-transfer-amount-status-${account_from.account_number}`"
          class="b-account-transfer-form__status"
          :role="amount_error ? 'alert' : 'status'"
          aria-live="polite"
        >
          <v-icon
            v-if="amount_error"
            size="14"
            color="error"
            class="no-inv"
            aria-hidden="true"
            >error_outline</v-icon
          >
          <span>{{
            amount_error ||
            $t("transaction_form.modern.native_help", {
              currency: native_currency_label,
            })
          }}</span>
        </p>
      </div>

      <!-- ====== Optional receipt ===== -->
      <details
        class="b-account-transfer-form__disclosure"
        :open="receipt_open"
        @toggle="receipt_open = $event.target.open"
      >
        <summary>
          <v-icon size="16" aria-hidden="true">receipt_long</v-icon
          >{{ $t("transaction_form.modern.receipt")
          }}<small>{{ $t("global.commons.optional") }}</small
          ><v-icon
            size="16"
            class="b-account-transfer-form__chevron"
            aria-hidden="true"
            >expand_more</v-icon
          >
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-focus
            open-on-click
            >{{ $t("transaction_form.modern.receipt_help") }}</v-tooltip
          >
        </summary>
        <label
          :for="`account-transfer-receipt-${account_from.account_number}`"
          class="b-account-transfer-form__label"
          >{{ $t("transaction_form.receipt_input") }}</label
        >
        <v-text-field
          :id="`account-transfer-receipt-${account_from.account_number}`"
          v-model="receipt_number"
          :disabled="
            !!receiptNumber || busy_createTransaction || busy_confirmTransaction
          "
          :error="receipt_error"
          :aria-invalid="receipt_error"
          :aria-describedby="`account-transfer-receipt-status-${account_from.account_number}`"
          class="sd-modern-underlined-field b-account-transfer-form__input"
          variant="underlined"
          hide-details
          inputmode="numeric"
          autocomplete="off"
          maxlength="12"
          dir="ltr"
          placeholder="000000000000"
        />
        <div
          :id="`account-transfer-receipt-status-${account_from.account_number}`"
          class="b-account-transfer-form__status"
          :role="
            receipt_error || (receipt && receipt.status !== 'Unpaid')
              ? 'alert'
              : 'status'
          "
          aria-live="polite"
        >
          <v-progress-circular
            v-if="receipt_loading"
            indeterminate
            width="2"
            size="14"
            color="primary"
          />
          <v-icon
            v-else-if="
              receipt_error || (receipt && receipt.status !== 'Unpaid')
            "
            size="14"
            color="error"
            class="no-inv"
            aria-hidden="true"
            >error_outline</v-icon
          >
          <span
            v-else-if="receipt_success"
            class="sd-modern-status__dot sd-modern-status__dot--success no-inv"
            aria-hidden="true"
          />
          <span>{{
            receipt?.status === "Paid"
              ? $t("transaction_form.paid_status")
              : receipt?.status === "Canceled"
                ? $t("transaction_form.paid_canceled")
                : receipt_message || $t("transaction_form.modern.receipt_hint")
          }}</span>
        </div>
        <div v-if="receipt" class="b-account-transfer-form__receipt">
          <p>{{ receipt.description }}</p>
          <dl class="b-account-transfer-form__facts">
            <div>
              <dt>{{ $t("transaction_form.created_at") }}</dt>
              <dd>{{ getLocalTimeString(receipt.created_at) }}</dd>
            </div>
            <div>
              <dt>{{ $t("transaction_form.duration") }}</dt>
              <dd>
                {{
                  receipt.duration
                    ? getLocalTimeStringAddedSeconds(
                        receipt.created_at,
                        receipt.duration,
                      )
                    : $t("transaction_form.unlimited")
                }}
              </dd>
            </div>
          </dl>
          <p class="b-account-transfer-form__status">
            <v-icon size="14" aria-hidden="true">lock</v-icon
            ><span>{{ $t("transaction_form.modern.receipt_locked") }}</span>
          </p>
          <v-btn
            v-if="!receiptNumber"
            :disabled="busy_createTransaction || busy_confirmTransaction"
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            color="primary"
            prepend-icon="close"
            @click="removeReceipt"
            >{{ $t("transaction_form.modern.remove_receipt") }}</v-btn
          >
        </div>
      </details>

      <!-- ====== Description ===== -->
      <details
        class="b-account-transfer-form__disclosure"
        :open="note_open"
        @toggle="note_open = $event.target.open"
      >
        <summary>
          <v-icon size="16" aria-hidden="true">edit_note</v-icon
          >{{ $t("transaction_form.modern.note")
          }}<small>{{ $t("global.commons.optional") }}</small
          ><v-icon
            size="16"
            class="b-account-transfer-form__chevron"
            aria-hidden="true"
            >expand_more</v-icon
          >
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-focus
            open-on-click
            >{{ $t("transaction_form.modern.note_help") }}</v-tooltip
          >
        </summary>
        <v-textarea
          v-model="description"
          :label="$t('transaction_form.note')"
          :disabled="busy_createTransaction || busy_confirmTransaction"
          :rows="3"
          auto-grow
          class="sd-modern-underlined-field b-account-transfer-form__note"
          variant="underlined"
          hide-details
        />
      </details>

      <!-- ====== Action ===== -->
      <div class="b-account-transfer-form__actions">
        <v-btn
          :disabled="!canConfirmTransaction"
          :loading="busy_createTransaction"
          class="sd-modern-button sd-modern-button--primary"
          variant="flat"
          color="primary"
          :append-icon="$t('icons.arrow_next')"
          @click="createTransaction"
          >{{ $t("transaction_form.modern.review") }}</v-btn
        >
        <p class="b-account-transfer-form__warning">
          <v-icon size="14" aria-hidden="true">info_outline</v-icon
          ><span>{{ $t("transaction_form.modern.warning") }}</span>
        </p>
      </div>
    </div>
  </section>

  <v-container v-else class="text-start" v-bind="$attrs">
    <u-pods-panel color="#fff">
      <u-pod-node is-selldone-icon title="This Wallet"></u-pod-node>
      <u-pod-wire forward></u-pod-wire>

      <u-pod-node is-selldone-icon title="Other Wallet"></u-pod-node>
    </u-pods-panel>

    <h4>{{ $t("transaction_form.title") }}:</h4>
    <p v-if="accountFrom" class="text-h4">
      {{ formatCard(account_from.account_number) }}
    </p>

    <b-account-input
      v-else
      v-model="account_from"
      :currency="currency?.code"
      :label="`${$t('transaction_form.from_input')}*`"
      :messages="$t('transaction_form.from_input_message')"
      class="m-2"
      return-object
      variant="underlined"
    />
    <!-- Account detail -->
    <v-expand-transition>
      <div v-if="account_from">
        <div class="text-center d-flex border-between my-3">
          <div class="p-1 flex-grow-1">
            <small class="d-block mb-1">{{
              $t("transaction_form.account_name")
            }}</small>
            {{ account_from.account_name }}
          </div>

          <div class="p-1 flex-grow-1">
            <small class="d-block mb-1">{{
              $t("transaction_form.currency")
            }}</small>
            {{ getCurrencyName(account_from.currency) }}
          </div>

          <div class="p-1 flex-grow-1">
            <small class="d-block mb-1">{{
              $t("transaction_form.free_balance")
            }}</small>

            <u-price
              :amount="account_from.balance - account_from.locked"
              :currency="currency?.code"
            >
            </u-price>
          </div>
        </div>
      </div>
    </v-expand-transition>

    <h4 class="mt-5">{{ $t("transaction_form.to") }}:</h4>

    <v-text-field
      v-model="account_to"
      v-mask="`####-####-####-####`"
      color="primary"
      :disabled="!!receipt"
      :error="account_to_error"
      :label="`${$t('transaction_form.to_input')}*`"
      :messages="account_to_message"
      persistent-placeholder
      placeholder="####-####-####-####"
      variant="underlined"
    >
      <template v-slot:append-inner>
        <div class="d-flex align-center single-line">
          <v-slide-y-transition group leave-absolute>
            <div v-if="account_to_user_id" class="mx-1 small">
              <v-avatar
                class="avatar-gradient -thin -user mx-1"
                size="26"
                style="vertical-align: middle"
              >
                <v-img :src="getUserAvatar(account_to_user_id)" />
              </v-avatar>
              <span>
                {{ account_to_user_name }}
              </span>
            </div>

            <v-icon
              v-if="account_to_success"
              class="ms-1"
              color="green"
              size="20"
              >check_circle
            </v-icon>

            <v-progress-circular
              v-if="account_to_loading"
              class="ms-1"
              color="info"
              indeterminate
              size="24"
            />
          </v-slide-y-transition>
        </div>
      </template>
    </v-text-field>

    <u-price-input
      v-model="amount"
      :currency="account_to_currency"
      :disabled="!!receipt"
      :label="`${$t('transaction_form.amount')}*`"
      :outlined="false"
      class="mt-3"
      required
      variant="underlined"
    >
    </u-price-input>

    <h4 class="mt-5">
      {{ $t("transaction_form.receipt_title") }}:
      <small>{{ $t("global.commons.optional") }}</small>
    </h4>

    <v-text-field
      v-model="receipt_number"
      :counter="12"
      :disabled="!!receiptNumber"
      :error="receipt_error"
      :label="$t('transaction_form.receipt_input')"
      :messages="receipt_message"
      persistent-placeholder
      placeholder="############"
      variant="underlined"
    >
      <template v-slot:prepend-inner>
        <div class="d-flex align-center single-line">
          <v-fade-transition group leave-absolute>
            <v-icon v-if="receipt_success" class="me-1" color="green" size="20"
              >check_circle
            </v-icon>
            <v-progress-circular
              v-if="receipt_loading"
              color="info"
              indeterminate
              size="24"
            />
          </v-fade-transition>
          <v-icon v-if="receipt && receipt.status !== 'Unpaid'" color="red">
            fa:fas fa-exclamation-circle
          </v-icon>
        </div>
      </template>
    </v-text-field>
    <div v-if="receipt" class="text-start mt-3">
      <p v-if="receipt.status !== 'Unpaid'" class="text-danger">
        <i class="fas fa-exclamation-circle" />

        <span v-if="receipt.status === 'Paid'">
          {{ $t("transaction_form.paid_status") }}
        </span>
        <span v-else-if="receipt.status === 'Canceled'" class="text-danger">
          {{ $t("transaction_form.paid_canceled") }}
        </span>
      </p>

      <p>
        <small>{{ $t("transaction_form.description") }} : </small>
        {{ receipt.description }}
      </p>
      <p>
        <small>{{ $t("transaction_form.created_at") }} : </small>
        {{ getLocalTimeString(receipt.created_at) }}
      </p>

      <p>
        <small>{{ $t("transaction_form.duration") }} : </small>
        <span v-if="receipt.duration">{{
          getLocalTimeStringAddedSeconds(receipt.created_at, receipt.duration)
        }}</span>
        <span v-else> {{ $t("transaction_form.unlimited") }} </span>
      </p>
    </div>

    <!-- ====== Description ===== -->
    <div class="my-5">
      <v-fade-transition hide-on-leave>
        <v-btn
          v-if="!showDescriptionField"
          color="primary"
          size="small"
          variant="text"
          @click.stop="showDescriptionField = true"
        >
          <v-icon class="me-1" size="small"> edit</v-icon>
          {{ $t("transaction_form.add_note_action") }}
        </v-btn>
      </v-fade-transition>

      <v-slide-x-reverse-transition hide-on-leave>
        <div
          v-if="!showDescriptionField && description"
          class="small text-start m-0"
        >
          <small class="d-block mt-3"
            >{{ $t("transaction_form.note") }} :
          </small>
          <span v-html="description" />
        </div>
      </v-slide-x-reverse-transition>
      <v-expand-transition hide-on-leave>
        <div v-if="showDescriptionField">
          <v-textarea
            v-model="description"
            :label="$t('transaction_form.note')"
            :rows="3"
            auto-grow
            variant="underlined"
            @focusout="showDescriptionField = false"
          />
        </div>
      </v-expand-transition>
    </div>

    <!-- ====== Action ===== -->

    <s-widget-buttons auto-fixed-position>
      <v-btn
        :class="{ disabled: !canConfirmTransaction }"
        :disabled="!canConfirmTransaction"
        :loading="busy_createTransaction"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="createTransaction"
      >
        {{ $t("transaction_form.transfer_action") }}

        <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
      </v-btn>
    </s-widget-buttons>
  </v-container>

  <!-- ========================== Transaction Confirm Dialog ========================== -->
  <v-dialog
    v-if="modern"
    v-model="TransactionConfirmDialog"
    :persistent="busy_confirmTransaction"
    width="590"
    max-width="calc(100% - 24px)"
  >
    <v-card
      v-if="new_transaction_response"
      class="sd-modern-widget b-account-transfer-form b-account-transfer-form__dialog text-start"
      :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'"
    >
      <header class="b-account-transfer-form__dialog-header">
        <h2>{{ $t("transaction_form.modern.review_title") }}</h2>
        <v-btn
          :disabled="busy_confirmTransaction"
          :aria-label="$t('transaction_form.modern.close')"
          class="sd-modern-icon-button"
          variant="text"
          icon
          @click="TransactionConfirmDialog = false"
          ><v-icon size="16">close</v-icon
          ><v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-focus
            >{{ $t("transaction_form.modern.close") }}</v-tooltip
          ></v-btn
        >
      </header>
      <p class="b-account-transfer-form__dialog-subtitle">
        {{ $t("transaction_form.modern.review_subtitle") }}
      </p>
      <div class="b-account-transfer-form__parties">
        <div>
          <span class="b-account-transfer-form__caption">{{
            $t("transaction_form.confirmation.from")
          }}</span>
          <div class="b-account-transfer-form__name">
            <bdi>{{ new_transaction_response.account_from_name }}</bdi>
          </div>
          <button
            v-copy="formatCard(new_transaction_response.from)"
            type="button"
            class="b-account-transfer-form__copy"
            :aria-label="$t('transaction_form.modern.copy')"
          >
            <bdi dir="ltr">{{ formatCard(new_transaction_response.from) }}</bdi
            ><v-icon size="12" aria-hidden="true">content_copy</v-icon
            ><v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-focus
              >{{ $t("transaction_form.modern.copy") }}</v-tooltip
            >
          </button>
        </div>
        <v-icon size="20" aria-hidden="true">{{
          $t("icons.arrow_next")
        }}</v-icon>
        <div>
          <span class="b-account-transfer-form__caption">{{
            $t("transaction_form.confirmation.to")
          }}</span>
          <div class="b-account-transfer-form__recipient">
            <v-avatar v-if="new_transaction_response.to_user_id" size="24"
              ><v-img
                :src="getUserAvatar(new_transaction_response.to_user_id)"
                :alt="new_transaction_response.to_user_name" /></v-avatar
            ><bdi>{{ new_transaction_response.to_user_name }}</bdi>
          </div>
          <button
            v-copy="formatCard(new_transaction_response.to)"
            type="button"
            class="b-account-transfer-form__copy"
            :aria-label="$t('transaction_form.modern.copy')"
          >
            <bdi dir="ltr">{{ formatCard(new_transaction_response.to) }}</bdi
            ><v-icon size="12" aria-hidden="true">content_copy</v-icon
            ><v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-focus
              >{{ $t("transaction_form.modern.copy") }}</v-tooltip
            >
          </button>
        </div>
      </div>
      <dl class="b-account-transfer-form__facts b-account-transfer-form__quote">
        <div>
          <dt>{{ $t("transaction_form.modern.draft_amount") }}</dt>
          <dd>
            <u-price
              :amount="new_transaction_response.amount"
              :currency="new_transaction_response.currency"
            />
          </dd>
        </div>
        <div>
          <dt>{{ $t("transaction_form.modern.fee") }}</dt>
          <dd>
            <u-price
              :amount="new_transaction_response.fee"
              :currency="new_transaction_response.currency"
            />
          </dd>
        </div>
      </dl>
      <div class="b-account-transfer-form__total">
        <span>{{ $t("transaction_form.modern.total") }}</span
        ><u-price
          :amount="quote_total"
          :currency="new_transaction_response.currency"
          class="b-account-transfer-form__value"
        />
      </div>
      <p v-if="display_equivalent" class="b-account-transfer-form__native">
        {{ $t("transaction_form.modern.entered_amount") }}:
        <bdi dir="ltr">{{
          numeralFormat(new_transaction_response.amount, "0,0.[00000000]")
        }}</bdi>
        {{ native_currency_label }}
      </p>
      <div
        v-if="new_transaction_response.receipt"
        class="b-account-transfer-form__extra"
      >
        <span class="b-account-transfer-form__caption">{{
          $t("transaction_form.confirmation.receipt")
        }}</span
        ><bdi dir="ltr">{{ new_transaction_response.receipt }}</bdi>
        <p>{{ receipt?.description }}</p>
      </div>
      <div
        v-if="new_transaction_response.description"
        class="b-account-transfer-form__extra"
      >
        <span class="b-account-transfer-form__caption">{{
          $t("transaction_form.note")
        }}</span
        >{{ new_transaction_response.description }}
      </div>
      <p
        v-if="quote_insufficient"
        class="b-account-transfer-form__warning"
        role="alert"
      >
        <v-icon size="16" color="error" class="no-inv" aria-hidden="true"
          >error_outline</v-icon
        ><span>{{ $t("transaction_form.modern.quote_insufficient") }}</span>
      </p>
      <p class="b-account-transfer-form__warning">
        <v-icon size="14" aria-hidden="true">info_outline</v-icon
        ><span>{{ $t("transaction_form.modern.warning") }}</span>
      </p>
      <div class="b-account-transfer-form__dialog-actions">
        <v-btn
          :disabled="busy_confirmTransaction"
          class="sd-modern-button"
          variant="outlined"
          @click="TransactionConfirmDialog = false"
          >{{ $t("transaction_form.modern.edit") }}</v-btn
        >
        <v-btn
          :disabled="quote_insufficient"
          :loading="busy_confirmTransaction"
          class="sd-modern-button sd-modern-button--primary"
          variant="flat"
          color="primary"
          prepend-icon="swap_vert"
          @click="confirmTransaction"
          >{{ $t("transaction_form.modern.confirm") }}</v-btn
        >
      </div>
    </v-card>
  </v-dialog>

  <v-bottom-sheet
    v-else
    v-model="TransactionConfirmDialog"
    :width="640"
    max-width="98vw"
    content-class="rounded-t-xl overflow-hidden"
    opacity="0.9"
    scrollable
  >
    <v-card v-if="new_transaction_response" class="text-start" color="#fafafa">
      <v-card-title class="mb-2">
        <v-icon class="me-1" color="green">lock</v-icon>
        {{ $t("transaction_form.confirmation.title") }}
      </v-card-title>
      <v-card-subtitle class="text-wrap">
        <b>{{ $t("transaction_form.confirmation.subtitle") }}</b> |

        {{ $t("transaction_form.confirmation.message") }}
      </v-card-subtitle>
      <v-card-text class="position-relative">
        <img
          class="absolute-top-center mt-8 op-0-1"
          height="auto"
          src="./assets/transaction-flow.svg"
          style="max-width: 80%"
          width="320"
        />

        <div
          class="border -28px p-2 mt-2 mb-4 d-flex align-center text-start shadow-paper-small bg-white max-w-400 mx-auto z1"
          style="border-radius: 44px"
        >
          <v-avatar class="avatar-gradient -customer -thin me-2" size="64">
            <v-img :src="getUserAvatar(USER_ID())" />
          </v-avatar>

          <div class="d-flex flex-column flex-grow-1">
            <small>{{ $t("transaction_form.confirmation.from") }}</small>
            <b class="typo-body">{{
              formatCard(new_transaction_response.from)
            }}</b>
            <small>{{ new_transaction_response.account_from_name }}</small>
          </div>
        </div>

        <!--  Amount -->

        <div
          v-if="new_transaction_response.fee"
          class="mb-4 d-flex text-center"
        >
          <div class="p-1 flex-grow-1">
            <small class="d-block">{{
              $t("transaction_form.confirmation.amount")
            }}</small>

            <u-price
              :amount="new_transaction_response.amount"
              :currency="new_transaction_response.currency"
              >}
            </u-price>
          </div>

          <div class="p-1 flex-grow-1">
            <small class="d-block">{{
              $t("transaction_form.confirmation.fee")
            }}</small>

            <u-price
              :amount="new_transaction_response.fee"
              :currency="new_transaction_response.currency"
              >}
            </u-price>
          </div>
        </div>

        <div class="d-flex mb-4 align-center justify-center text-center z1">
          <!--  Total amount (amount + fee) -->
          <div class="mx-2">
            <u-price
              :amount="
                new_transaction_response.amount + new_transaction_response.fee
              "
              :currency="new_transaction_response.currency"
              class="text-h3 text-black"
              >}
            </u-price>
            <small class="d-block">{{
              $t("transaction_form.confirmation.total_pay")
            }}</small>
          </div>
        </div>

        <div
          class="border p-2 mb-4 d-flex align-center text-start shadow-paper-small bg-white max-w-400 mx-auto z1"
          style="border-radius: 44px"
        >
          <v-avatar
            v-if="new_transaction_response.to_user_id"
            class="avatar-gradient -thin me-2"
            size="64"
          >
            <v-img :src="getUserAvatar(new_transaction_response.to_user_id)" />
          </v-avatar>
          <div class="d-flex flex-column flex-grow-1">
            <small>{{ $t("transaction_form.confirmation.to") }}</small>

            <b class="typo-body">{{
              formatCard(new_transaction_response.to)
            }}</b>

            <div class="font-weight-bold">
              {{ new_transaction_response.to_user_name }}
            </div>
          </div>
        </div>

        <div v-if="receipt" class="z1">
          <small class="d-block">
            {{ $t("transaction_form.confirmation.receipt") }}</small
          >

          <div class="font-weight-black">
            {{ new_transaction_response.receipt }}
          </div>

          <div class="text-success small">{{ receipt.description }}</div>
        </div>

        <div v-if="new_transaction_response.description">
          <small class="d-block">
            {{ $t("transaction_form.confirmation.description") }}</small
          >

          <b>{{ new_transaction_response.description }}</b>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            :loading="busy_confirmTransaction"
            color="#0062cc"
            size="x-large"
            variant="elevated"
            @click="confirmTransaction"
          >
            <v-icon start>check_circle</v-icon>
            {{ $t("transaction_form.confirmation.accept_action") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UPrice from "../../../../ui/price/UPrice.vue";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import BAccountInput from "../../../account/input/BAccountInput.vue";
import UPodWire from "../../../../ui/pod/wire/UPodWire.vue";
import UPodsPanel from "../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../ui/pod/node/UPodNode.vue";
import { debounce } from "lodash-es";
import { NumberHelper } from "@selldone/core-js/helper/number/NumberHelper";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import AccountMixin from "@selldone/components-vue/mixin/account/AccountMixin.ts";

function accountNumber(value) {
  return NumberHelper.toEnglishDigits(String(value ?? "")).replace(/\D/g, "");
}

export default {
  name: "BAccountTransactionForm",
  mixins: [DateMixin, CurrencyMixin, AccountMixin],
  components: {
    SWidgetButtons,
    UPodNode,
    UPodsPanel,
    UPodWire,
    BAccountInput,
    UPriceInput,
    UPrice,
    UCurrencyIcon,
  },
  props: {
    accountFrom: { required: false, type: Object },
    receiptNumber: { required: false, type: String },
    modern: { type: Boolean, default: false },
  },
  data() {
    return {
      description: "",
      account_from: this.accountFrom || null,
      amount: 0,
      account_to: "",
      receipt_number: this.receiptNumber || "",
      account_to_success: false,
      account_to_error: false,
      account_to_loading: false,
      account_to_message: "",
      account_to_currency: null,
      account_to_user_id: null,
      account_to_user_name: null,
      checked_destination: "",
      checked_source: "",
      receipt_success: false,
      receipt_error: false,
      receipt_loading: false,
      receipt_message: "",
      receipt: null,
      receipt_draft: null,
      receipt_open: false,
      note_open: false,
      showDescriptionField: false,
      new_transaction_response: null,
      reviewed_payload: null,
      reviewed_key: "",
      TransactionConfirmDialog: false,
      busy_createTransaction: false,
      busy_confirmTransaction: false,
      destination_request: 0,
      receipt_request: 0,
      quote_request: 0,
      form_active: true,
      destination_lookup: null,
      receipt_lookup: null,
    };
  },
  computed: {
    currency() {
      const code =
        this.account_from?.currency ||
        this.accountFrom?.currency ||
        this.receipt?.currency ||
        this.account_to_currency;
      return code ? this.GetCurrency(code) : null;
    },
    source_key() {
      return `${accountNumber(this.account_from?.account_number)}:${this.account_from?.currency || ""}`;
    },
    draft_key() {
      return JSON.stringify([
        this.source_key,
        accountNumber(this.account_to),
        Number(this.amount),
        accountNumber(this.receipt_number),
        this.description,
      ]);
    },
    available_balance() {
      return (
        Number(this.account_from?.balance || 0) -
        Number(this.account_from?.locked || 0)
      );
    },
    amount_error() {
      if (this.amount === 0 || this.amount === "" || this.amount == null)
        return "";
      const amount = Number(this.amount);
      if (!Number.isFinite(amount) || amount <= 0)
        return this.$t("transaction_form.modern.positive");
      const precision = this.currency?.floats ?? 6;
      if (Number(amount.toFixed(precision)) !== amount)
        return this.$t("transaction_form.modern.amount_precision", {
          precision,
        });
      if (this.account_from && amount > this.available_balance)
        return this.$t("transaction_form.modern.insufficient");
      return "";
    },
    native_currency_label() {
      if (!this.currency) return "";
      const name =
        this.currency.code === "IRR"
          ? this.$t("transaction_form.modern.rial")
          : this.$t(this.currency.name);
      return `${this.currency.code} · ${name}`;
    },
    display_equivalent() {
      if (!this.currency) return false;
      const display = this.GetUserSelectedCurrencyName(
        this.currency.code,
        true,
      );
      return ![this.$t(this.currency.name), this.currency.unicode].includes(
        display,
      );
    },
    quote_total() {
      return (
        Number(this.new_transaction_response?.amount || 0) +
        Number(this.new_transaction_response?.fee || 0)
      );
    },
    quote_insufficient() {
      return (
        !!this.new_transaction_response &&
        (!Number.isFinite(this.quote_total) ||
          this.quote_total > this.available_balance)
      );
    },
    canConfirmTransaction() {
      const destination = accountNumber(this.account_to);
      const amount = Number(this.amount);
      const receiptMatches =
        !this.receipt_number ||
        (this.receipt_success &&
          !this.receipt_loading &&
          !this.receipt_error &&
          this.receipt?.status === "Unpaid" &&
          this.receipt.currency === this.account_from?.currency &&
          Number(this.receipt.amount) === amount &&
          accountNumber(this.receipt.account?.account_number) === destination);
      return !!(
        this.account_from &&
        destination.length === 16 &&
        destination !== accountNumber(this.account_from.account_number) &&
        this.account_to_success &&
        !this.account_to_loading &&
        !this.account_to_error &&
        this.checked_destination === destination &&
        this.checked_source === this.source_key &&
        this.account_to_currency === this.account_from.currency &&
        Number.isFinite(amount) &&
        amount > 0 &&
        !this.amount_error &&
        receiptMatches &&
        !this.busy_createTransaction &&
        !this.busy_confirmTransaction
      );
    },
  },
  watch: {
    accountFrom(value, previous) {
      this.account_from = value || null;
      if (
        accountNumber(value?.account_number) !==
          accountNumber(previous?.account_number) ||
        value?.currency !== previous?.currency
      ) {
        this.receipt_draft = null;
        this.account_to = "";
        this.amount = 0;
        this.description = "";
        this.receipt_number = this.receiptNumber || "";
        this.receipt_open = !!this.receiptNumber;
        this.note_open = false;
        this.invalidateQuote();
      }
    },
    receiptNumber(value) {
      this.receipt_number = value || "";
      this.receipt_open = !!value;
    },
    source_key: {
      flush: "sync",
      handler() {
        this.invalidateQuote();
        this.invalidateDestination();
        if (accountNumber(this.account_to).length === 16)
          this.destination_lookup?.();
        this.receipt_request++;
        this.receipt_lookup?.cancel();
        this.receipt_success = false;
        if (accountNumber(this.receipt_number).length === 12)
          this.receipt_lookup?.();
      },
    },
    account_to: {
      flush: "sync",
      handler() {
        this.invalidateQuote();
        this.invalidateDestination();
        if (accountNumber(this.account_to).length === 16)
          this.destination_lookup?.();
      },
    },
    receipt_number: {
      flush: "sync",
      handler() {
        this.invalidateQuote();
        this.receipt_request++;
        this.receipt_lookup?.cancel();
        this.receipt = null;
        this.receipt_success = false;
        this.receipt_error = false;
        this.receipt_loading = false;
        this.receipt_message = "";
        this.restoreManualDraft();
        if (accountNumber(this.receipt_number).length === 12)
          this.receipt_lookup?.();
      },
    },
    draft_key: {
      flush: "sync",
      handler() {
        if (this.new_transaction_response) this.invalidateQuote();
      },
    },
    TransactionConfirmDialog(value) {
      this.BlurApp(value);
      if (!value && !this.busy_confirmTransaction) this.invalidateQuote();
    },
  },
  created() {
    this.destination_lookup = debounce(this.checkToAccountInfo, 350);
    this.receipt_lookup = debounce(this.checkReceiptInfo, 350);
    this.receipt_open = !!this.receiptNumber;
    if (this.receiptNumber) this.checkReceiptInfo();
  },
  beforeUnmount() {
    this.form_active = false;
    this.destination_request++;
    this.receipt_request++;
    this.quote_request++;
    this.destination_lookup?.cancel();
    this.receipt_lookup?.cancel();
    this.BlurApp(false);
  },
  methods: {
    invalidateQuote() {
      this.quote_request++;
      this.new_transaction_response = null;
      this.reviewed_payload = null;
      this.reviewed_key = "";
      this.TransactionConfirmDialog = false;
    },
    invalidateDestination() {
      this.destination_request++;
      this.destination_lookup?.cancel();
      this.account_to_success = false;
      this.account_to_error = false;
      this.account_to_loading = false;
      this.account_to_message = "";
      this.account_to_user_id = null;
      this.account_to_user_name = null;
      this.account_to_currency = null;
      this.checked_destination = "";
      this.checked_source = "";
    },
    restoreManualDraft() {
      if (!this.receipt_draft) return;
      const draft = this.receipt_draft;
      this.receipt_draft = null;
      this.account_to = draft.to;
      this.amount = draft.amount;
    },
    removeReceipt() {
      if (
        this.receiptNumber ||
        this.busy_createTransaction ||
        this.busy_confirmTransaction
      )
        return;
      this.receipt_number = "";
      this.restoreManualDraft();
    },
    checkToAccountInfo() {
      this.invalidateDestination();
      const destination = accountNumber(this.account_to);
      const source = this.source_key;
      const request = this.destination_request;
      if (destination.length !== 16) return;
      if (destination === accountNumber(this.account_from?.account_number)) {
        this.account_to_error = true;
        this.account_to_message = this.$t(
          "transaction_form.modern.same_account",
        );
        return;
      }
      this.account_to_loading = true;
      return axios
        .get(window.API.GET_CHECK_ACCOUNT_NUMBER(destination))
        .then(({ data }) => {
          if (
            !this.form_active ||
            request !== this.destination_request ||
            destination !== accountNumber(this.account_to) ||
            source !== this.source_key
          )
            return;
          if (data.error) {
            this.account_to_error = true;
            this.account_to_message = this.$t(
              "transaction_form.account_number_not_valid",
            );
            return;
          }
          if (
            this.account_from &&
            data.currency !== this.account_from.currency
          ) {
            this.account_to_error = true;
            this.account_to_message = this.$t(
              "transaction_form.currency_not_match",
            );
            return;
          }
          this.account_to_success = true;
          this.account_to_message = this.$t(
            "transaction_form.account_number_is_valid",
          );
          this.account_to_user_id = data.user_id;
          this.account_to_user_name = data.user_name;
          this.account_to_currency = data.currency;
          this.checked_destination = destination;
          this.checked_source = source;
        })
        .catch((error) => {
          if (
            this.form_active &&
            request === this.destination_request &&
            destination === accountNumber(this.account_to) &&
            source === this.source_key
          ) {
            this.account_to_error = true;
            this.account_to_message = this.$t(
              "transaction_form.account_number_not_valid",
            );
            NotificationService.showLaravelError(error);
          }
        })
        .finally(() => {
          if (this.form_active && request === this.destination_request)
            this.account_to_loading = false;
        });
    },
    checkReceiptInfo() {
      const receipt_number = accountNumber(this.receipt_number);
      const source = this.source_key;
      const request = ++this.receipt_request;
      this.receipt_lookup?.cancel();
      this.receipt_success = false;
      this.receipt_error = false;
      this.receipt_loading = false;
      this.receipt_message = "";
      if (receipt_number.length !== 12) return;
      this.receipt_loading = true;
      return axios
        .get(window.API.GET_CHECK_RECEIPT_NUMBER(receipt_number))
        .then(({ data }) => {
          if (
            !this.form_active ||
            request !== this.receipt_request ||
            receipt_number !== accountNumber(this.receipt_number) ||
            source !== this.source_key
          )
            return;
          if (data.error) {
            this.receipt_error = true;
            this.receipt_message = this.$t(
              "transaction_form.receipt_not_valid",
            );
            return;
          }
          if (
            this.account_from &&
            data.receipt.currency !== this.account_from.currency
          ) {
            this.receipt_error = true;
            this.receipt_message = this.$t(
              "transaction_form.currency_not_match",
            );
            return;
          }
          if (!this.receipt_draft)
            this.receipt_draft = { to: this.account_to, amount: this.amount };
          this.receipt = data.receipt;
          this.receipt_success = true;
          this.receipt_message = this.$t("transaction_form.receipt_is_valid");
          this.amount = data.receipt.amount;
          this.account_to = this.formatCard(
            String(data.receipt.account.account_number),
          );
          this.checkToAccountInfo();
        })
        .catch((error) => {
          if (
            this.form_active &&
            request === this.receipt_request &&
            receipt_number === accountNumber(this.receipt_number) &&
            source === this.source_key
          ) {
            this.receipt_error = true;
            this.receipt_message = this.$t(
              "transaction_form.receipt_not_valid",
            );
            NotificationService.showLaravelError(error);
          }
        })
        .finally(() => {
          if (this.form_active && request === this.receipt_request)
            this.receipt_loading = false;
        });
    },
    createTransaction() {
      if (!this.canConfirmTransaction) return;
      this.busy_createTransaction = true;
      this.invalidateQuote();
      const request = this.quote_request;
      const key = this.draft_key;
      const payload = {
        from: accountNumber(this.account_from.account_number),
        to: accountNumber(this.account_to),
        amount: this.amount,
        receipt_number: accountNumber(this.receipt_number),
        description: this.description,
      };
      return axios
        .post(window.API.POST_CREATE_NEW_TRANSACTION(), payload)
        .then(({ data }) => {
          if (
            !this.form_active ||
            request !== this.quote_request ||
            key !== this.draft_key
          )
            return;
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.new_transaction_response = data;
          this.reviewed_key = key;
          // Confirmation sends the displayed quote, never an edited draft.
          this.reviewed_payload = {
            from: data.from,
            to: data.to,
            amount: data.amount,
            receipt_number: data.receipt || "",
            description: data.description || "",
            data: data.data,
          };
          this.TransactionConfirmDialog = true;
        })
        .catch((error) => {
          if (
            this.form_active &&
            request === this.quote_request &&
            key === this.draft_key
          )
            NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (this.form_active) this.busy_createTransaction = false;
        });
    },
    confirmTransaction() {
      if (
        this.busy_confirmTransaction ||
        !this.TransactionConfirmDialog ||
        !this.new_transaction_response ||
        !this.reviewed_payload ||
        this.reviewed_key !== this.draft_key ||
        this.quote_insufficient
      )
        return;
      const payload = { ...this.reviewed_payload };
      this.busy_confirmTransaction = true;
      return axios
        .post(window.API.POST_CONFIRM_TRANSACTION(), payload)
        .then(({ data }) => {
          if (!this.form_active) return;
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.invalidateQuote();
          NotificationService.showSuccessAlert(
            null,
            this.$t("transaction_form.notifications.confirm_success"),
          );
          this.$router.push({
            name: "BPageAccountTransactions",
            params: { account_number: payload.from },
            query: { transaction_number: data.transaction.number },
          });
          this.$emit("completed");
        })
        .catch((error) => {
          if (this.form_active) NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (this.form_active) this.busy_confirmTransaction = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.large-text {
  font-size: 1.4rem;
}

.b-account-transfer-form {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.9fr);
  padding: 28px;
  border-radius: 17px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;

  h2 {
    margin: 0 0 20px;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
    letter-spacing: 0;
  }
  p {
    margin: 0;
  }
  &__fields {
    order: 1;
    min-width: 0;
    padding-inline-end: 28px;
  }
  &__context {
    order: 2;
    min-width: 0;
    padding-inline-start: 26px;
    border-inline-start: 1px solid var(--sd-modern-border);
  }
  &__account {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  &__currency {
    flex: 0 0 34px;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--sd-modern-inset);
  }
  &__identity {
    min-width: 0;
  }
  &__name {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  &__code {
    display: block;
    font-size: 11px;
    line-height: 17px;
    color: var(--sd-modern-muted);
  }
  &__copy {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    max-width: 100%;
    min-height: 32px;
    padding: 0;
    background: transparent;
    border: 0;
    color: var(--sd-modern-muted);
    font: inherit;
    font-size: 11px;
    line-height: 17px;
    text-align: start;
    font-variant-numeric: tabular-nums;
  }
  &__copy bdi {
    overflow-wrap: anywhere;
  }
  &__copy .v-icon {
    flex: 0 0 12px;
  }
  &__available {
    margin-block: 24px 17px;
  }
  &__caption {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__value {
    display: block;
    margin-block-start: 5px;
    font-size: 24px;
    font-weight: 500;
    line-height: 31px;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
  &__value :deep(.cur-name) {
    display: inline-block;
    font-size: 11px !important;
    font-weight: 400;
    line-height: 17px;
    color: var(--sd-modern-muted);
    white-space: nowrap;
  }
  &__facts {
    display: grid;
    gap: 9px;
    margin: 0;
  }
  &__facts > div {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    min-width: 0;
    font-size: 11px;
    line-height: 18px;
  }
  &__facts dt {
    color: var(--sd-modern-muted);
  }
  &__facts dd {
    margin: 0;
    text-align: end;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
  &__facts :deep(.u--price) {
    font-weight: 400;
  }
  &__facts :deep(.cur-name) {
    margin-inline: 3px !important;
    font-size: 11px !important;
    white-space: nowrap;
  }
  &__route {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-block: 26px;
    padding-block: 20px;
    border-block: 1px solid var(--sd-modern-border);
  }
  &__node {
    flex: 0 0 58px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    line-height: 17px;
    text-align: center;
  }
  &__node > span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));
  }
  // The monochrome brand follows its surface in both native dark and Smart invert.
  &__node > span > img {
    filter: none;
  }
  &__wire {
    flex: 1;
    min-width: 35px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__wire > div {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 3px;
  }
  &__wire > div > i:not(.v-icon) {
    flex: 1;
    height: 1px;
    background: var(--sd-modern-border);
  }
  &__draft {
    gap: 12px;
  }
  &__fee-note {
    margin-block-start: 10px !important;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__field {
    margin-block-end: 22px;
  }
  &__label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-block-end: 5px;
    font-size: 12px;
    line-height: 19px;
  }
  &__label > span {
    color: var(--sd-modern-muted);
  }
  // External labels keep the native editable baseline at the approved 42px height.
  &__input {
    --sd-modern-field-height: 42px;
    :deep(.v-field.v-field--variant-underlined) {
      min-height: 42px;
    }
    :deep(.v-field__field) {
      min-width: 0;
    }
    :deep(.v-field.v-field--variant-underlined input.v-field__input) {
      min-width: 0;
      height: 42px;
      min-height: 42px;
      padding: 7px 0;
      font-family: inherit;
      font-size: 15px;
      font-weight: 400;
      line-height: 22px;
      font-variant-numeric: tabular-nums;
    }
    :deep(.v-field.v-field--variant-underlined .v-field__append-inner),
    :deep(.v-field.v-field--variant-underlined .v-field__prepend-inner) {
      padding-block: 7px;
    }
    :deep(.v-field__outline::before) {
      opacity: 1;
      border-color: var(--sd-modern-border);
    }
    :deep(.v-field__outline::after) {
      border-width: 1px;
    }
    :deep(.v-text-field__suffix) {
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 19px;
      padding-inline-start: 8px;
    }
    :deep(.v-field--error .v-field__outline::before) {
      border-color: rgb(var(--v-theme-error));
    }
  }
  &__amount {
    --sd-modern-field-height: 50px;
    :deep(.v-field.v-field--variant-underlined),
    :deep(.v-field.v-field--variant-underlined input.v-field__input) {
      height: 50px;
      min-height: 50px;
    }
    :deep(.v-field.v-field--variant-underlined input.v-field__input) {
      font-size: 26px;
      font-weight: 400;
      line-height: 34px;
    }
  }
  &__equivalent {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px;
    margin-block-start: 7px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__equivalent :deep(.u--price) {
    font-weight: 400;
  }
  &__equivalent :deep(.cur-name) {
    margin-inline: 3px !important;
    font-size: 11px !important;
    white-space: nowrap;
  }
  &__status {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    min-height: 20px;
    margin-block: 7px 0 !important;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__status > .v-icon,
  &__status > .v-progress-circular {
    flex-shrink: 0;
    margin-block-start: 2px;
  }
  &__status > .sd-modern-status__dot {
    width: 5px;
    height: 5px;
    flex: 0 0 5px;
    margin-block-start: 6px;
  }
  &__disclosure {
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__disclosure summary {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    padding-block: 10px;
    list-style: none;
    font-size: 12px;
    line-height: 19px;
  }
  &__disclosure summary::-webkit-details-marker {
    display: none;
  }
  &__disclosure small {
    color: var(--sd-modern-muted);
    font-size: 11px;
  }
  &__disclosure summary > .v-icon {
    flex-shrink: 0;
  }
  &__chevron {
    margin-inline-start: auto;
  }
  &__disclosure[open] &__chevron {
    transform: rotate(180deg);
  }
  &__note {
    margin-block-end: 18px;
  }
  &__receipt {
    margin-block: 12px 16px;
    padding: 13px;
    background: var(--sd-modern-inset);
    border-radius: 10px;
  }
  &__receipt > p {
    margin-block-end: 9px;
    font-size: 12px;
    line-height: 19px;
    overflow-wrap: anywhere;
  }
  &__receipt .sd-modern-button {
    margin-block-start: 7px;
    font-size: 11px;
    line-height: 17px;
  }
  &__actions {
    margin-block-start: 24px;
    padding-block-start: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__actions > .v-btn {
    width: 100%;
  }
  .sd-modern-button {
    min-height: 42px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  &__warning {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    margin-block-start: 12px !important;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__warning > .v-icon {
    flex-shrink: 0;
    margin-block-start: 2px;
  }
  &__dialog {
    display: block;
    padding: 25px;
    border-radius: 18px !important;
  }
  &__dialog-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-block-end: 7px;
  }
  &__dialog-header h2 {
    margin: 0;
    font-size: 19px;
    font-weight: 500;
    line-height: 26px;
  }
  &__dialog-header > .v-btn {
    margin-inline-start: auto;
    --sd-modern-icon-button-size: 32px;
  }
  &__dialog-subtitle {
    margin-block-end: 21px !important;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__parties {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 24px minmax(0, 1fr);
    align-items: center;
    gap: 14px;
    padding-block: 17px;
    border-block: 1px solid var(--sd-modern-border);
  }
  &__parties > div {
    min-width: 0;
  }
  &__parties > .v-icon {
    color: var(--sd-modern-muted);
  }
  &__parties .b-account-transfer-form__name {
    margin-block-start: 6px;
    font-size: 12px;
    line-height: 19px;
  }
  &__recipient {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-block-start: 6px;
    font-size: 12px;
    line-height: 19px;
    overflow-wrap: anywhere;
  }
  &__quote {
    gap: 12px;
    margin-block: 22px;
  }
  &__quote > div {
    font-size: 13px;
    line-height: 20px;
  }
  &__total {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    padding-block: 17px;
    border-block: 1px solid var(--sd-modern-border);
  }
  &__total .b-account-transfer-form__value {
    margin: 0;
    font-size: 26px;
    line-height: 34px;
  }
  &__native {
    margin-block-start: 7px !important;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
    text-align: end;
  }
  &__extra {
    margin-block-start: 17px;
    font-size: 12px;
    line-height: 20px;
    overflow-wrap: anywhere;
    white-space: pre-line;
  }
  &__dialog-actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    margin-block-start: 23px;
  }
  @media (max-width: 800px) {
    grid-template-columns: minmax(0, 1fr);
    padding: 23px;
    &__context {
      order: 0;
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: 12px 22px;
      padding: 0 0 21px;
      border: 0;
      border-block-end: 1px solid var(--sd-modern-border);
    }
    &__context h2 {
      grid-column: 1 / -1;
      margin: 0;
    }
    &__available {
      margin: 0;
    }
    &__context > .b-account-transfer-form__facts {
      grid-column: 1 / -1;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    &__route,
    &__draft,
    &__fee-note {
      display: none;
    }
    &__fields {
      padding: 23px 0 0;
    }
    &__dialog {
      display: block;
      padding: 25px;
    }
  }
  @media (max-width: 500px) {
    padding: 20px 16px;
    &__context {
      grid-template-columns: minmax(0, 1fr);
      gap: 15px;
    }
    &__context > .b-account-transfer-form__facts {
      grid-template-columns: minmax(0, 1fr);
      gap: 8px;
    }
    &__value {
      font-size: 22px;
      line-height: 29px;
    }
    &__field {
      margin-block-end: 20px;
    }
    &__dialog {
      padding: 20px;
    }
    &__parties {
      grid-template-columns: minmax(0, 1fr);
      gap: 10px;
    }
    &__parties > .v-icon {
      transform: rotate(90deg);
      margin-inline: auto;
    }
    &__parties:dir(rtl) > .v-icon {
      transform: rotate(-90deg);
    }
    &__copy,
    .sd-modern-button {
      min-height: 44px;
    }
    &__dialog-header > .v-btn {
      --sd-modern-icon-button-size: 44px;
    }
    &__input :deep(.v-field.v-field--variant-underlined input.v-field__input),
    &__note :deep(textarea) {
      font-size: 16px;
    }
    &__amount :deep(.v-field.v-field--variant-underlined input.v-field__input) {
      font-size: 26px;
    }
  }
  @media (pointer: coarse) {
    &__copy,
    .sd-modern-button {
      min-height: 44px;
    }
    &__dialog-header > .v-btn {
      --sd-modern-icon-button-size: 44px;
    }
    &__input :deep(.v-field.v-field--variant-underlined input.v-field__input),
    &__note :deep(textarea) {
      font-size: 16px;
    }
    &__amount :deep(.v-field.v-field--variant-underlined input.v-field__input) {
      font-size: 26px;
    }
  }
}
</style>
