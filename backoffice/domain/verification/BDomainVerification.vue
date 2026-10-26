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
  <div class="b-domain-verification text-start">
    <fieldset class="b-domain-verification__domains">
      <legend class="sd-modern-eyebrow">
        {{ $t("b_domain_verification.domain") }}
      </legend>
      <v-radio-group
        v-model="selected_domain"
        hide-details
        :aria-label="$t('b_domain_verification.domain')"
        class="mt-2"
      >
        <v-radio
          v-for="item in domains"
          :key="item.domain"
          :label="item.domain"
          :value="item.domain"
        />
        <v-radio :label="`${shop.name}.myselldone.com`" :value="null" />
      </v-radio-group>
      <p class="sd-modern-subtitle mt-2">
        {{ $t("b_domain_verification.domain_message") }}
      </p>
    </fieldset>

    <v-file-input
      v-model="verification_file"
      :messages="$t('b_domain_verification.file_message')"
      :label="$t('b_domain_verification.file')"
      prepend-icon=""
      prepend-inner-icon="verified_user"
      variant="underlined"
      class="mt-5"
    />
    <div class="sd-modern-actions mt-3">
      <v-btn
        :disabled="!verification_file || busy_upload"
        :loading="busy_upload"
        class="sd-modern-button"
        color="primary"
        variant="flat"
        prepend-icon="upload_file"
        @click="uploadVerificationFile()"
        >{{ $t("b_domain_verification.upload") }}
      </v-btn>
    </div>
  </div>
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
      if (this.busy_upload || !this.verification_file) return;
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

<style lang="scss" scoped>
.b-domain-verification {
  min-width: 0;

  &__domains {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;

    :deep(.v-selection-control-group) {
      max-height: 200px;
      overflow-y: auto;
    }

    :deep(.v-label) {
      opacity: 1;
      font-size: 14px;
      overflow-wrap: anywhere;
    }
  }
}
</style>
