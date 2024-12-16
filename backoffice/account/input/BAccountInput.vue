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
    class="v-input-auto-height"
    item-title="account_number"
    :placeholder="$t('global.placeholders.select_wallet')"
    prepend-inner-icon="wallet"
  >
    <template v-slot:item="{ item, props }">
      <v-list-item class="text-start" density="compact" v-bind="props">
        <template v-slot:prepend>
          <div class="text-center me-1">
            <u-currency-icon
              :currency="GetCurrency(item.raw.currency)"
            ></u-currency-icon>
            <b class="mt-1 d-block small">{{ item.raw.currency }}</b>
          </div>
        </template>

        <template v-slot:title>
          <v-row no-gutters>
            <v-col class="text-subtitle-2 px-2" cols="6">
              {{ formatCard(item.raw.account_number) }}

              <div class="mt-1">
                <flag
                  v-if="GetCurrency(item.raw.currency)"
                  :iso="GetCurrency(item.raw.currency).flag"
                  :squared="false"
                  class="me-1"
                />

                {{ item.raw.account_name }}
              </div>
            </v-col>

            <v-col class="px-1" cols="6">
              <small class="d-block">{{
                $t("account_list.free_balance")
              }}</small>
              <u-price
                :amount="item.raw.balance - item.raw.locked"
                :currency="item.raw.currency"
              ></u-price>
            </v-col>
          </v-row>
        </template>

        <template v-slot:append>
          <v-icon v-if="item.raw.id === account_selected?.id" color="green">
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
  mixins: [CurrencyMixin,AccountMixin],
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

<style scoped></style>
