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
  <div v-if="profile" class="widget-box">
    <h2>
      <v-icon class="me-1">account_circle</v-icon>
      {{ service.delivery_service?.name }} {{ $t("global.commons.profile") }}
    </h2>
    <u-loading-progress v-if="busy"></u-loading-progress>

    <div v-if="profile" class="text-center">
      <v-avatar
        v-if="profile.avatar"
        :size="60"
        class="mb-3"
        color="grey-lighten-4"
      >
        <v-img :src="profile.avatar"></v-img>
      </v-avatar>

      <p class="m-0">
        <b>{{ profile.name }}</b>
      </p>
      <p class="text-muted m-0 small">
        {{ profile.email }}
      </p>

      <u-text-value-dashed
        v-if="profile.credit !== null && profile.credit !== undefined"
        class="my-2"
      >
        <template v-slot:label>{{ $t("global.commons.credit") }}</template>
        <u-price
          :amount="profile.credit"
          :currency="profile.currency"
        ></u-price>
      </u-text-value-dashed>


      <u-text-value-dashed
          v-if="profile.uid"
          class="my-2"
      >
        <template v-slot:label>UID</template>
        <small>{{profile.uid}}</small>
      </u-text-value-dashed>
    </div>
  </div>
</template>

<script>
import UTextValueDashed from "../../ui/text/value-dashed/UTextValueDashed.vue";

export default {
  name: "DeliveryProfileWidget",
  components: { UTextValueDashed },

  props: {
    shop: { type: Object, required: true },
    service:{type: Object, required: true },
  },
  data: () => ({
    busy: false,

    profile: null,
  }),
  computed: {
    config() {
      return {
        headers: {
          Authorization: this.token,
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json; charset=utf-8",
        },
      };
    },
  },

  watch: {},
  created() {
    this.getCredit();
  },
  methods: {
    // ⬬⬬⬬⬬⬬⬬⬬⬬⬬ Get user profile ⬬⬬⬬⬬⬬⬬⬬⬬⬬
    getCredit() {
      this.busy = true;

      axios
        .get(
          window.API.GET_DELIVERY_SERVICE_PROFILE(
            this.shop.id,
            this.$route.params.transportation_id,
            this.$route.params.delivery_service_id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.profile = data.profile;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
