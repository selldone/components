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
  <v-bottom-sheet
    :model-value="modelValue"
    width="98vw"
    max-width="540"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title>
        <v-icon class="me-1">redeem</v-icon>
        {{ $t("user_gift_cards.add_card_dialog.title") }}
      </v-card-title>

      <v-card-text class="text-start">
        <p>
          {{ $t("user_gift_cards.add_card_dialog.message") }}
        </p>

        <v-text-field
          v-model="card_number"
          v-mask="`####-####-####-####`"
          :color="SaminColorLight"
          :label="$t('user_gift_cards.add_card_dialog.card_number_input')"
          class="mt-3"
          messages="XXXX-XXXX-XXXX-XXXX"
          variant="outlined"
        />
        <v-text-field
          v-model="card_cvv"
          v-mask="`XXXX`"
          :color="SaminColorLight"
          class="mt-3"
          label="CVV"
          messages="XXXX"
          variant="outlined"
        />

        <p>
          <i class="fas fa-info-circle text-primary" />
          {{ $t("user_gift_cards.add_card_dialog.info") }}
        </p>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            :class="{ disabled: !canAddCard }"
            :loading="busy_add"
            color="success"
            size="x-large"
            variant="flat"
            @click="addCard"
          >
            <v-icon start>add</v-icon>
            {{ $t("user_gift_cards.add_card_dialog.add_action") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
export default {
  name: "SGiftcardAdd",
  emits: ["update:modelValue", "add"],
  props: {
    modelValue: {},
  },
  data: () => ({
    card_number: null,
    card_cvv: null,

    busy_add: false,
  }),

  computed: {
    canAddCard() {
      return (
        this.card_cvv &&
        this.card_number &&
        this.card_number.length === 19 &&
        this.card_cvv.length === 4
      );
    },
  },

  methods: {
    addCard() {
      this.busy_add = true;
      axios
        .post(window.XAPI.POST_ADD_GIFT_CARDS(this.shop_name), {
          card_number: this.card_number.replace(/-/g, ""),
          card_cvv: this.card_cvv,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.card_number = null;
            this.card_cvv = null;
            this.$emit("add", data.giftcard);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => [(this.busy_add = false)]);
    },
  },
};
</script>

<style scoped></style>
