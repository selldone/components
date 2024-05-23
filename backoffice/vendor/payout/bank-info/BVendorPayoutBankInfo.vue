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
  <div>
    <u-text-value-box :label="$t('global.commons.name')" vb50
      >{{ vendor.name }}
    </u-text-value-box>
    <u-text-value-box
      v-if="vendor.description"
      :label="$t('global.commons.description')"
      vb50
      >{{ vendor.description }}
    </u-text-value-box>
    <u-text-value-box v-if="vendor.web" :label="$t('global.commons.url')" vb50
      >{{ vendor.web }}
    </u-text-value-box>
    <u-text-value-box v-if="vendor.tel" :label="$t('global.commons.tel')" vb50
      >{{ vendor.tel }}
    </u-text-value-box>
    <u-text-value-box v-if="vendor.bank" :label="$t('global.commons.bank')" vb50
      >{{ vendor.bank }}
    </u-text-value-box>
    <u-text-value-box
      v-if="vendor.payment_at"
      :label="$t('global.commons.payment')"
      vb50
      >{{ getLocalDateString(vendor.payment_at) }}
    </u-text-value-box>
    <u-text-value-box
      v-if="vendor.country"
      :label="$t('global.commons.country')"
      vb50
    >
      <flag :iso="vendor.country" :squared="false" class="me-1" />
      {{ getCountryName(vendor.country) }}
    </u-text-value-box>
    <u-text-value-box
      v-if="vendor.state"
      :label="$t('global.commons.state')"
      vb50
      >{{ vendor.state }}
    </u-text-value-box>
    <u-text-value-box v-if="vendor.note" :label="$t('global.commons.note')" vb50
      >{{ vendor.note }}
    </u-text-value-box>
    <u-text-value-box :label="$t('global.commons.business')" vb50>
      <u-check :model-value="vendor.business" class="me-1"></u-check>
      {{ vendor.business_name }}
    </u-text-value-box>
    <u-text-value-box
      v-if="vendor.tax_id"
      :label="$t('global.commons.tax_id')"
      vb50
      >{{ vendor.tax_id }}
    </u-text-value-box>
  </div>
</template>

<script>
import UTextValueBox from "../../../../ui/text/value-box/UTextValueBox.vue";

export default {
  name: "BVendorPayoutBankInfo",
  components: { UTextValueBox },
  props: {
    vendor: {
      required: true,
    },
  },
};
</script>

<style scoped></style>
