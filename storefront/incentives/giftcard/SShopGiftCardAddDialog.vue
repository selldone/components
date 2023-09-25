<template>
  <v-dialog :value="value" @input="(val) => $emit('input', val)" width="500">
    <v-card>
      <v-card-title>
        {{ $t("user_gift_cards.add_card_dialog.title") }}
      </v-card-title>

      <v-card-text class="text-start">
        <p >
          {{ $t("user_gift_cards.add_card_dialog.message") }}
        </p>

        <v-text-field
          v-model="card_number"
          class="mt-3"
          :label="$t('user_gift_cards.add_card_dialog.card_number_input')"
          outline
          messages="XXXX-XXXX-XXXX-XXXX"
          v-mask="`####-####-####-####`"
          :color="SaminColorLight"
        />
        <v-text-field
          v-model="card_cvv"
          class="mt-3"
          label="CVV"
          outline
          :color="SaminColorLight"
          messages="XXXX"
          v-mask="`XXXX`"
        />

        <p >
          <i class="fas fa-info-circle text-primary" />
          {{ $t("user_gift_cards.add_card_dialog.info") }}
        </p>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            depressed
            color="success"
            dark
            x-large
            @click="addCard"
            :loading="busy_add"
            :class="{ disabled: !canAddCard }"
          >
            <v-icon class="me-1">add</v-icon>
            {{ $t("user_gift_cards.add_card_dialog.add_action") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "SShopGiftCardAddDialog",
  props: {
    value: {},
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
