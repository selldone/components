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
  <section
    class="sd-modern-widget b-google-setting text-start"
    aria-labelledby="google-verification-title"
  >
    <header class="sd-modern-title b-google-setting__heading">
      <img
        :src="require('../../../assets/trademark/search-console.svg')"
        alt=""
        width="23"
        height="23"
      />
      <div>
        <h2 id="google-verification-title" class="sd-modern-title-text">
          {{ $t("channel_google.modern.verification") }}
        </h2>
        <p class="sd-modern-subtitle">
          {{ $t("channel_google.modern.verificationIntro") }}
          <v-tooltip
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-focus
            open-on-click
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="sd-modern-icon-button sd-modern-info-button"
                variant="text"
                icon
                :aria-label="$t('channel_google.modern.verificationHelpLabel')"
              >
                <v-icon aria-hidden="true">info_outline</v-icon>
              </v-btn>
            </template>
            {{ $t("channel_google.modern.verificationHelp") }}
          </v-tooltip>
        </p>
        <span
          class="sd-modern-status sd-modern-status--plain b-google-setting__status"
        >
          <v-icon v-if="savedVerificationContent" size="14" aria-hidden="true"
            >check</v-icon
          >
          <span
            v-else
            class="sd-modern-status__dot sd-modern-status__dot--warning"
            aria-hidden="true"
          />
          {{
            $t(
              savedVerificationContent
                ? "channel_google.modern.configured"
                : "channel_google.modern.missing",
            )
          }}
        </span>
      </div>
    </header>
    <form
      class="b-google-setting__form"
      @submit.prevent="setGoogleVerificationMetatag"
    >
      <v-text-field
        v-model="code"
        class="sd-modern-underlined-field b-google-setting__field"
        :label="$t('channel_google.modern.verificationLabel')"
        :placeholder="$t('channel_google.console.code.placeholder')"
        :readonly="lock || loading_set_metatag"
        :disabled="!canWrite || loading_set_metatag"
        aria-describedby="google-verification-hint"
        autocomplete="off"
        variant="underlined"
        persistent-placeholder
        hide-details
        @update:model-value="change = true"
      >
        <template #append-inner>
          <v-tooltip
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-focus
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="sd-modern-icon-button sd-modern-input-action"
                variant="text"
                icon
                :disabled="!canWrite || loading_set_metatag"
                :aria-pressed="lock"
                :aria-label="
                  $t(
                    lock
                      ? 'channel_google.modern.unlockVerification'
                      : 'channel_google.modern.lockVerification',
                  )
                "
                @click="lock = !lock"
              >
                <v-icon aria-hidden="true">{{
                  lock ? "lock" : "lock_open"
                }}</v-icon>
              </v-btn>
            </template>
            {{
              $t(
                lock
                  ? "channel_google.modern.unlockVerification"
                  : "channel_google.modern.lockVerification",
              )
            }}
          </v-tooltip>
        </template>
      </v-text-field>
      <p id="google-verification-hint" class="b-google-setting__hint">
        {{
          $t(
            canWrite
              ? "channel_google.modern.verificationHint"
              : "channel_google.modern.readonly",
          )
        }}
      </p>
      <div v-if="change" class="b-google-setting__actions">
        <span>{{ $t("channel_google.modern.unsaved") }}</span>
        <v-btn
          class="sd-modern-button sd-modern-button--primary"
          :loading="loading_set_metatag"
          :disabled="!canWrite || loading_set_metatag"
          color="primary"
          variant="flat"
          type="submit"
        >
          <v-icon start aria-hidden="true">save</v-icon
          >{{ $t("channel_google.modern.save") }}
        </v-btn>
      </div>
    </form>
  </section>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

export default {
  name: "BGoogleSearchConsole",
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    code: "",
    change: false,
    loading_set_metatag: false,

    lock: false,
  }),
  computed: {
    canWrite() {
      return this.writeShopAccess(ShopPermissionRegions.CHANNELS.code);
    },
    savedVerificationContent() {
      return (
        this.shop.plugins.find((item) => item.name === "VerificationTag")
          ?.setting?.content || null
      );
    },
  },

  created() {
    this.code = this.savedVerificationContent;
    this.lock = !!this.code;
  },

  methods: {
    setGoogleVerificationMetatag() {
      if (!this.canWrite || this.loading_set_metatag || !this.change) return;
      this.loading_set_metatag = true;

      return axios
        .put(
          window.API.POST_SHOP_PLUGIN_SET_CONFIG(
            this.shop.id,
            "VerificationTag",
          ),
          {
            setting: {
              content: this.code,
            },
            enable: !!this.code,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.shop.plugins, data.plugin);
            NotificationService.showSuccessAlert(
              null,
              this.$t("channel_google.modern.saved"),
            );
            this.change = false;
            this.lock = !!this.code;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.loading_set_metatag = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
