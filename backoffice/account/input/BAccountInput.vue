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
  <v-select
    v-model="account_selected"
    :clearable="clearable"
    :items="accounts"
    :label="label"
    :loading="busy"
    :messages="messages"
    :return-object="true"
    :rounded="rounded"
    :variant="
      variant
        ? variant
        : filled
          ? 'filled'
          : outlined
            ? 'outlined'
            : 'underlined'
    "
    class="v-input-auto-height b-account-input"
    item-title="account_number"
    item-value="account_number"
    :placeholder="$t('global.placeholders.select_wallet')"
    prepend-inner-icon="wallet"
  >
    <template v-slot:item="{ item, props }">
      <v-list-item
        class="text-start b-account-input__option"
        density="compact"
        v-bind="props"
      >
        <template v-slot:prepend>
          <div class="text-center me-1">
            <u-currency-icon
              :currency="GetCurrency(item.raw.currency)"
            ></u-currency-icon>
            <b class="mt-1 d-block small">{{ item.raw.currency }}</b>
          </div>
        </template>

        <template v-slot:title>
          <div class="b-account-input__option-body">
            <div class="b-account-input__option-identity">
              <bdi dir="ltr" class="b-account-input__option-number">{{
                formatCard(item.raw.account_number)
              }}</bdi>

              <div class="b-account-input__option-name">
                <flag
                  v-if="GetCurrency(item.raw.currency)"
                  :iso="GetCurrency(item.raw.currency).flag"
                  :squared="false"
                  class="me-1"
                />

                <bdi>{{ item.raw.account_name }}</bdi>
              </div>
            </div>

            <div class="b-account-input__option-balance">
              <small>{{ $t("account_list.free_balance") }}</small>
              <u-price
                :amount="item.raw.balance - item.raw.locked"
                :currency="item.raw.currency"
              ></u-price>
            </div>
          </div>
        </template>

        <template v-slot:append>
          <v-icon
            v-if="item.raw.id === account_selected?.id"
            color="green"
            size="20"
            aria-hidden="true"
          >
            check
          </v-icon>
        </template>
      </v-list-item>
    </template>

    <template v-slot:selection="{ item }">
      <v-chip v-if="chip" color="#fafafa">
        <b class="text-subtitle-2">{{ formatCard(item.raw.account_number) }}</b>

        <u-currency-icon
          :currency="GetCurrency(item.raw.currency)"
          class="mx-1"
          gradient
        ></u-currency-icon>
        <b class="mx-1">{{ item.raw.currency }}</b>

        <span class="mx-2 flex-grow-1">
          <small class="d-block">{{ $t("account_list.free_balance") }} </small>
          <u-price
            :amount="item.raw.balance - item.raw.locked"
            :currency="item.raw.currency"
          ></u-price>
        </span>

        <span class="mx-2 flex-grow-1">
          <small class="d-block">
            <flag
              v-if="GetCurrency(item.raw.currency)"
              :iso="GetCurrency(item.raw.currency).flag"
              :squared="false"
              class="me-1"
            />{{ $t("account_list.account_name") }}</small
          >
          <span class="text-subtitle-2">{{ item.raw.account_name }}</span>
        </span>
      </v-chip>
      <span
        v-else
        class="small d-flex align-center flex-grow-1 w-100 text-start flex-wrap"
      >
        <b class="text-subtitle-2">{{ formatCard(item.raw.account_number) }}</b>

        <u-currency-icon
          :currency="GetCurrency(item.raw.currency)"
          class="mx-1"
          gradient
        ></u-currency-icon>
        <b class="mx-1">{{ item.raw.currency }}</b>

        <v-spacer></v-spacer>
        <span class="mx-2 flex-grow-1">
          <small class="d-block">{{ $t("account_list.free_balance") }} </small>
          <u-price
            :amount="item.raw.balance - item.raw.locked"
            :currency="item.raw.currency"
          ></u-price>
        </span>

        <span class="mx-2 flex-grow-1">
          <small class="d-block"> {{ $t("account_list.account_name") }}</small>
          <span class="text-subtitle-2">
            <flag
              v-if="GetCurrency(item.raw.currency)"
              :iso="GetCurrency(item.raw.currency).flag"
              :squared="false"
              class="me-1"
            />
            {{ item.raw.account_name }}</span
          >
        </span>
      </span>
    </template>

    <template v-slot:append-item>
      <slot name="append-item"></slot>
    </template>
    <template v-if="hasAdd" v-slot:prepend-item>
      <v-list-item
        :to="{ name: 'BPageShuttleWalletAccounts' }"
        class="text-start"
        append-icon="open_in_new"
        target="_blank"
        title="Add new wallet"
        prepend-icon="add_box"
        subtitle="Go to my wallets to add a new account"
      >
      </v-list-item>
    </template>
  </v-select>
</template>

<script lang="ts">
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import AccountMixin from "@selldone/components-vue/mixin/account/AccountMixin.ts";

export default {
  name: "BAccountInput",
  mixins: [CurrencyMixin, AccountMixin],
  components: { UCurrencyIcon },
  emits: ["update:modelValue", "update:busy"],
  props: {
    modelValue: {},
    outlined: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    filled: {
      type: Boolean,
      default: false,
    },
    variant: {},
    currency: {},

    chip: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },

    label: {},
    messages: {},
    hasAdd: Boolean,
  },

  data: () => ({
    busy: false,

    account_selected: null,

    accounts: [],
  }),

  watch: {
    account_selected(account) {
      this.$emit("update:modelValue", account);
    },
    modelValue(account) {
      this.account_selected = account;
    },
    busy(val) {
      this.$emit("update:busy", val);
    },
    currency() {
      this.fetchAccountsList();
    },
  },

  created() {
    this.fetchAccountsList();
    this.account_selected = this.modelValue;
  },

  methods: {
    fetchAccountsList() {
      this.busy = true;

      axios
        .get(
          window.API.GET_ACTIVE_ACCOUNT_LIST(
            this.currency ? this.currency : "*",
          ),
          {
            params: {
              offset: 0,
              limit: 100,
            },
          },
        )
        .then(({ data }) => {
          this.accounts = data.accounts;
        })
        .finally(() => (this.busy = false));
    },
  },
};
</script>

<style scoped lang="scss">
.b-account-input__option {
  padding: 8px 12px;
  border-radius: 10px;

  :deep(.v-list-item-title) {
    overflow: visible;
    white-space: normal;
  }

  :deep(.v-list-item__spacer) {
    width: 8px;
  }
}

.b-account-input__option-body {
  display: grid;
  // Stack by the space inside the popup, including the selected check column.
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 172px), 1fr));
  gap: 6px 12px;
  min-width: 0;
  font-size: 13px;
  line-height: 20px;
}

.b-account-input__option-identity {
  min-width: 0;
  overflow-wrap: anywhere;
}

.b-account-input__option-number {
  display: block;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.b-account-input__option-name {
  margin-block-start: 2px;
  font-size: 12px;
  line-height: 18px;
}

.b-account-input__option-balance {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px 8px;
  min-width: 0;
  overflow-wrap: anywhere;

  small {
    font-size: 11px;
    line-height: 17px;
  }
}

/* Rich wallet values need their full content height, including wrapped details. */
.b-account-input.sd-modern-underlined-field {
  :deep(.v-field--variant-underlined div.v-field__input) {
    height: auto;
    min-height: var(--sd-modern-field-height);
  }

  :deep(.v-select__selection) {
    width: 100%;
    max-width: 100%;
    height: auto;
  }
}
</style>
