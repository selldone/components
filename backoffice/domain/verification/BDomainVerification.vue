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
  <v-container>
    <v-select
      v-model="selected_domain"
      :items="domains"
      :placeholder="`${shop.name}.myselldone.com`"
      clearable
      hint="Leave empty for your.myselldone.com domain."
      item-title="domain"
      item-value="domain"
      label="Domain"
      persistent-hint
      persistent-placeholder
      variant="outlined"
    ></v-select>

    <v-file-input
      v-model="verification_file"
      hint="Max file size: 16KB"
      label="Verification file"
      placeholder="Get domain verification from Stripe"
      prepend-icon=""
      prepend-inner-icon="verified_user"
      variant="outlined"
      class="mt-3"
    >
      <template v-slot:append-inner>
        <v-btn
          :disabled="!verification_file"
          :loading="busy_upload"
          class="mt-n2"
          color="primary"
          @click="uploadVerificationFile()"
          >Upload
        </v-btn>
      </template>
    </v-file-input>
  </v-container>
</template>

<script lang="ts">

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BDomainVerification",
  mixins: [],
  components: {},
  props: {
    shop: {
      require: true,
      type: Object,
    },
    verificationMethod: {
      require: true,
      type: String,
    },
  },

  data: () => ({
    selected_domain: null,
    verification_file: null,
    busy_upload: false,
  }),

  computed: {
    domains() {
      return this.shop.domains;
    },
  },

  created() {},

  methods: {
    uploadVerificationFile() {
      if (this.busy_upload) return;
      this.busy_upload = true;

      let formData = new FormData();
      formData.append("file", this.verification_file);

      if (this.selected_domain) formData.append("domain", this.selected_domain);

      axios
        .post(
          window.API.POST_SHOP_DOMAIN_VERIFICATION(
            this.shop.id,
            this.verificationMethod,
          ),
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("verified");
            NotificationService.showSuccessAlert(
              "Success upload",
              "Your verification file has been uploaded successfully.",
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_upload = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
