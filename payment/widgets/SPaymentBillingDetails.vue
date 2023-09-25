<template>
  <div>
    <p v-if="billingDetail.name" class="mb-1">
      <small>{{ $t("global.address_info.name") }}: </small
      >{{ billingDetail.name }}
    </p>
    <p v-if="billingDetail.phone" class="mb-1">
      <small>{{ $t("global.address_info.tel") }}: </small
      >{{ billingDetail.phone }}
    </p>
    <p v-if="billingDetail.email" class="mb-1">
      <small>{{ $t("global.address_info.email") }}: </small
      >{{ billingDetail.email }}
    </p>
    <p v-if="billingDetail.country" class="mb-1">
      <small>{{ $t("global.address_info.country") }}: </small>
      <flag :iso="billingDetail.country" :squared="false" />
      {{ getCountryName(billingDetail.country) }}
    </p>
    <p v-if="billingDetail.state" class="mb-1">
      <small>{{ $t("global.address_info.state") }}: </small
      >{{ billingDetail.state }}
      <span class="mx-2"
        ><small>{{ $t("global.address_info.city") }}: </small
        >{{ billingDetail.city }}</span
      >
    </p>
    <p v-if="billingDetail.address" class="mb-1">
      <small>{{ $t("global.address_info.address") }}: </small
      >{{ billingDetail.address }}
    </p>
    <p v-if="billingDetail.no" class="mb-1">
      <small>{{ $t("global.address_info.building_number") }}: </small
      >{{ billingDetail.no }}
      <span class="mx-2"
        ><small>{{ $t("global.address_info.building_unit") }}: </small
        >{{ billingDetail.unit }}</span
      >
    </p>
    <p v-if="billingDetail.postal" class="mb-1">
      <small>{{ $t("global.address_info.postcode") }}: </small
      >{{ billingDetail.postal }}
    </p>

    <p v-if="billingDetail.ip" class="mb-1">
      <small>IP: </small>{{ billingDetail.ip }}
    </p>

    <!-- Payment receipt in direct payment mode -->
    <v-img
      v-if="payment_receipt"
      :src="getShopImagePath(payment_receipt)"
      class="pointer-zoom-in rounded-2rem my-1 mx-auto"
      @click="showFullscreen"
      width="120"
    ></v-img>
  </div>
</template>

<script>
export default {
  name: "SPaymentBillingDetails",
  props: {
    billingDetail: {
      require: true,
      type: Object,
    },
  },
  computed: {
    payment_receipt() {
      return this.billingDetail.receipt;
    },
  },
};
</script>

<style scoped></style>
