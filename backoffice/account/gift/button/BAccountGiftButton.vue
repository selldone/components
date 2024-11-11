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
  <div>
    <v-badge v-if="gift" :offset-y="18" color="blue">
      <template v-slot:badge
        ><span>{{ count }}</span></template
      >
      <v-btn
        :loading="busy"
        icon
        variant="text"
        @click.stop="apply_gift_dialog = true"
      >
        <u-lottie
          :options="{ path: '/animation/happy_birthday.json', loop: true }"
          :speed="1"
          height="48px"
          width="48px"
        />
      </v-btn>
    </v-badge>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ Bottom Sheet > Apply (Get) gift ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <b-account-gift-redeem
      v-model="apply_gift_dialog"
      :selected-gift="gift"
      @update="fetchPendingGift()"
    />
  </div>
</template>

<script lang="ts">
import BAccountGiftRedeem from "../../../account/gift/redeem/BAccountGiftRedeem.vue";
import ULottie from "@selldone/components-vue/ui/lottie/ULottie.vue";

export default {
  name: "BAccountGiftButton",
  components: { ULottie, BAccountGiftRedeem },
  data: () => ({
    busy: false,
    //------- Gift -------

    apply_gift_dialog: false,
    gift: null,
    count: 0,
  }),
  methods: {
    fetchPendingGift() {
      this.apply_gift_dialog = false;
      this.busy = true;

      axios
        .get(window.API.GET_GIFTS_PENDING_LIST())
        .then(({ data }) => {
          this.gift = data.gift;
          this.count = data.count;
        })
        .finally(() => (this.busy = false));
    },
  },
  created() {
    this.fetchPendingGift();
  },
};
</script>

<style scoped></style>
