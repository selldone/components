<template>
  <!-- ▀▀▀▀▀▀▀▀▀ 🥵 User / 🧜 Customer ▀▀▀▀▀▀▀▀▀ -->
  <div
    v-if="item.customer || item.buyer"
    class="b-process-center-customer d-flex align-center small mt-n1 text-start"
  >
    <span class="b-process-center-customer__identity d-flex align-center">
      <component
        :is="item.customer_id && !isAffiliatePos ? 'router-link' : 'span'"
        :to="{
          name: 'BPageCustomerDashboard',
          params: { customer_id: item.customer_id },
        }"
        title="Go to customer page"
        :aria-label="item.customer ? item.customer.name : item.buyer.name"
        @click.stop
      >
        <v-avatar
          v-if="item.buyer"
          :size="24"
          class="avatar-gradient -thin -no-gap -customer me-1 hover-scale"
          color="#fafafa"
        >
          <v-img :src="getUserAvatar(item.buyer.id)"></v-img>
        </v-avatar>
        <u-avatar-text
          v-else
          :name="item.customer.name"
          :size="24"
          class="avatar-gradient -thin -customer me-1 hover-scale"
          color="#fafafa"
        ></u-avatar-text>
      </component>
      <b class="b-process-center-customer__name">
        {{ item.customer ? item.customer.name : item.buyer.name }}
      </b>
    </span>
    <span class="dashed-flex-space"></span>

    <span class="b-process-center-customer__contact d-flex align-center">
      <template v-if="item.customer ? item.customer.phone : item.buyer.phone">
        <span class="b-process-center-customer__phone">
          {{ item.customer ? item.customer.phone : item.buyer.phone }}
        </span>
        <u-button-whatsapp
          :shop="shop"
          :user="item.customer ? item.customer : item.buyer"
          class="mx-1"
          small
        ></u-button-whatsapp>
      </template>

      <v-btn
        v-if="item.customer ? item.customer.email : item.buyer.email"
        :title="
          $t('global.commons.email') +
          ' : ' +
          (item.customer ? item.customer.email : item.buyer.email)
        "
        :aria-label="
          $t('global.actions.copy') +
          ' ' +
          $t('global.commons.email') +
          ' : ' +
          (item.customer ? item.customer.email : item.buyer.email)
        "
        class="b-process-center-customer__email ms-1"
        color="#333"
        icon
        size="28"
        variant="text"
        @click.stop="
          copyToClipboard(item.customer ? item.customer.email : item.buyer.email)
        "
      >
        <v-icon size="18">email</v-icon>
      </v-btn>
    </span>
  </div>
  <!-- ▀▀▀▀▀▀▀▀▀ 🥶 Guest ▀▀▀▀▀▀▀▀▀ -->
  <div
    v-else
    class="b-process-center-customer d-flex align-center small mt-n1 text-start"
  >
    <v-icon class="me-1" size="small">account_circle</v-icon>
    <b class="b-process-center-customer__name">{{ $t("global.commons.guest") }} </b>
  </div>
</template>

<script lang="ts">
import UButtonWhatsapp from "../../../ui/button/whatsapp/UButtonWhatsapp.vue";
import UAvatarText from "../../../ui/avatar/text/UAvatarText.vue";

export default {
  name: "BProcessCenterCustomer",
  components: { UButtonWhatsapp, UAvatarText },
  props: {
    item: { type: Object, required: true },
    shop: { type: Object, required: true },
    isAffiliatePos: { type: Boolean, default: false },
  },
};
</script>
