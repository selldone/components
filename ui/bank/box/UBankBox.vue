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
  <v-container class="text-start">
    <div v-if="bank.name" class="bank-row">
      <small>Bank Name</small>
      <b>{{ bank.name }}</b>
    </div>

    <div v-if="bank.holder_name" class="bank-row">
      <small>Account Holder Name</small>
      <b
        ><span v-copy>{{ bank.holder_name }}</span></b
      >
    </div>

    <div v-if="bank.account_number" class="bank-row">
      <small>Account Number</small>
      <b
        ><span v-copy>{{ bank.account_number }}</span></b
      >
    </div>

    <div v-if="bank.routing_number" class="bank-row">
      <small>Routing Number (USA) or Sort Code (UK)</small>
      <b
        ><span v-copy>{{ bank.routing_number }}</span></b
      >
    </div>

    <div v-if="bank.swift" class="bank-row">
      <small>SWIFT/BIC Code</small>
      <b
        ><span v-copy>{{ bank.swift }}</span></b
      >
    </div>

    <div v-if="bank.iban" class="bank-row">
      <small>IBAN (International Bank Account Number)</small>
      <b
        ><span v-copy>{{ bank.iban }}</span></b
      >
    </div>

    <div v-if="bank.contact" class="bank-row">
      <small>Contact Information</small>
      <b>{{ bank.contact }}</b>
    </div>

    <div v-if="bank.note" class="bank-row">
      <small>Note</small>
      <b>{{ bank.note }}</b>
    </div>
  </v-container>
</template>

<script lang="ts">
export default {
  name: "UBankBox",
  components: {},

  props: {
    bank: {
      required: false,
      type: Object,
    },
  },

  data: () => ({}),
  computed: {},

  watch: {},

  methods: {},
};
</script>

<style lang="scss" scoped>
.bank-row {
  small,
  b {
    display: block;
  }
}
</style>
