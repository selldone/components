<!--
  - Copyright (c) 2026. Selldone® Business OS™
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
  <v-dialog
    :aria-labelledby="recoveryDialogTitleId"
    :model-value="modelValue"
    :persistent="recoveryBusy"
    max-width="540"
    width="96vw"
    @update:model-value="updateModelValue"
  >
    <template v-slot:activator="{ props: activatorProps }">
      <slot name="activator" :props="activatorProps" />
    </template>

    <v-card class="text-start" rounded="xl">
      <v-form @submit.prevent="confirmRecovery">
        <v-card-title class="d-flex align-center px-6 pt-6 pb-2">
          <v-avatar color="primary" rounded="lg" size="42">
            <v-icon color="white">restore</v-icon>
          </v-avatar>

          <span :id="recoveryDialogTitleId" class="font-weight-bold ms-3">
            {{ $t("shops_list.deleted.recovery_dialog.title") }}
          </span>

          <v-spacer />

          <v-btn
            :aria-label="$t('global.actions.close')"
            :disabled="recoveryBusy"
            :title="$t('global.actions.close')"
            icon="close"
            size="small"
            type="button"
            variant="text"
            @click="close"
          />
        </v-card-title>

        <v-card-text class="px-6 pt-4">
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{
              $t("shops_list.deleted.recovery_dialog.message", {
                shop: shop.title,
              })
            }}
          </p>

          <v-sheet
            border
            class="d-flex align-center pa-3 mb-5"
            color="grey-lighten-5"
            rounded="lg"
          >
            <v-avatar color="grey-lighten-3" rounded="lg" size="40">
              <v-img
                v-if="shop.icon"
                :alt="shop.title"
                :src="getShopImagePath(shop.icon, 128)"
                cover
              />
              <v-icon v-else color="primary">storefront</v-icon>
            </v-avatar>

            <div class="ms-3 overflow-hidden">
              <div class="font-weight-bold text-truncate">
                {{ shop.title }}
              </div>
              <div class="text-caption text-medium-emphasis" dir="ltr">
                @{{ handle }}
              </div>
            </div>
          </v-sheet>

          <v-alert class="mb-4" color="primary" icon="keyboard" variant="tonal">
            <div>
              {{ $t("shops_list.deleted.recovery_dialog.instruction") }}
            </div>
            <v-chip
              class="mt-2 font-weight-bold"
              color="primary"
              dir="ltr"
              label
              size="small"
              variant="flat"
            >
              {{ recoveryPhrase }}
            </v-chip>
          </v-alert>

          <v-text-field
            v-model="recoveryConfirmation"
            :disabled="recoveryBusy"
            :error="recoveryConfirmationTouched && !isRecoveryConfirmationValid"
            :hint="
              $t('shops_list.deleted.recovery_dialog.input_hint', {
                phrase: recoveryPhrase,
              })
            "
            :label="$t('shops_list.deleted.recovery_dialog.input_label')"
            autocomplete="off"
            autocapitalize="characters"
            autofocus
            clearable
            dir="ltr"
            persistent-hint
            spellcheck="false"
            variant="outlined"
            @blur="recoveryConfirmationTouched = true"
          />
        </v-card-text>

        <v-divider />

        <v-card-actions
          class="flex-column-reverse flex-sm-row ga-2 px-4 px-sm-6 py-4"
        >
          <v-spacer class="d-none d-sm-block" />

          <v-btn
            :block="$vuetify.display.xs"
            :disabled="recoveryBusy"
            class="text-none"
            type="button"
            variant="text"
            @click="close"
          >
            {{ $t("global.actions.cancel") }}
          </v-btn>

          <v-btn
            :block="$vuetify.display.xs"
            :disabled="recoveryBusy || !isRecoveryConfirmationValid || disabled"
            :loading="recoveryBusy"
            class="font-weight-bold px-5 text-none"
            color="primary"
            prepend-icon="restore"
            rounded="lg"
            type="submit"
            variant="flat"
          >
            {{ $t("shops_list.deleted.recover") }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
const RECOVERY_CONFIRMATION_PHRASE = "RECOVERY";

export default {
  name: "BShopRecoveryDialog",
  emits: ["update:modelValue", "recover"],
  props: {
    modelValue: {
      default: false,
      type: Boolean,
    },
    shop: {
      required: true,
      type: Object,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    loading: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    recoveryConfirmation: "",
    recoveryConfirmationTouched: false,
    recoverySubmitted: false,
  }),
  computed: {
    recoveryDialogTitleId() {
      return `shop-recovery-dialog-title-${this.shop.id}`;
    },
    handle() {
      return (
        this.shop.original_name ||
        String(this.shop.name || "").split("::deleted-")[0]
      );
    },
    recoveryPhrase() {
      return RECOVERY_CONFIRMATION_PHRASE;
    },
    isRecoveryConfirmationValid() {
      return (
        String(this.recoveryConfirmation || "")
          .trim()
          .toUpperCase() === RECOVERY_CONFIRMATION_PHRASE
      );
    },
    recoveryBusy() {
      return this.loading || this.recoverySubmitted;
    },
  },
  watch: {
    modelValue(isOpen) {
      if (isOpen) {
        this.resetConfirmation();
      } else if (!this.recoveryBusy) {
        this.resetConfirmation();
      }
    },
    loading(isLoading, wasLoading) {
      if (wasLoading && !isLoading) {
        this.recoverySubmitted = false;
      }
    },
  },
  methods: {
    resetConfirmation() {
      this.recoveryConfirmation = "";
      this.recoveryConfirmationTouched = false;
      this.recoverySubmitted = false;
    },
    updateModelValue(value) {
      if (!value && this.recoveryBusy) return;

      this.$emit("update:modelValue", value);
    },
    close() {
      if (this.recoveryBusy) return;

      this.$emit("update:modelValue", false);
    },
    confirmRecovery() {
      if (!this.isRecoveryConfirmationValid) {
        this.recoveryConfirmationTouched = true;
        return;
      }

      if (!this.shop.deleted_at || this.disabled || this.recoveryBusy) {
        return;
      }

      this.recoverySubmitted = true;
      this.$emit("recover", this.shop);
    },
  },
};
</script>
