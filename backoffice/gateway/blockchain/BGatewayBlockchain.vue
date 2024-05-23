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
  <div class="text-center" dir="ltr">
    <div class="widget-buttons">
      <v-btn
        color="success"
        size="x-large"
        variant="elevated"
        @click="showAddWallet()"
      >
        <v-icon start>add</v-icon>
        Set new wallet
      </v-btn>
    </div>

    <v-dialog v-model="show_create_wallet" max-width="860" scrollable>
      <v-card class="text-start">
        <v-card-title>Link wallet</v-card-title>
        <v-card-text>
          <v-expand-transition>
            <div v-if="!gen_phrases">
              <h3>Option 1:</h3>
              <p>
                Enter your recovery phrases. We just use this phrases to
                generate root key for derivation address generation and will not
                save on server.
              </p>
              <v-text-field v-model="phrases" variant="outlined">
              </v-text-field>
            </div>
          </v-expand-transition>

          <v-expand-transition>
            <div v-if="!phrases">
              <h3>Option 2:</h3>
              <p>
                Create a new wallet. You should save recovery phrases and add it
                to your wallet! We did not save any recovery phrases and private
                key on the server.
              </p>

              <v-btn
                :loading="busy_gen"
                :variant="!!gen_phrases ? 'text' : 'flat'"
                color="blue"
                size="large"
                @click="generatePhrasesSet()"
                >{{
                  gen_phrases ? "Regenerate new phrases" : "Create a new wallet"
                }}
              </v-btn>

              <div v-if="gen_phrases && step === 1">
                <h4 class="text-h4 my-3 border rounded p-3">
                  {{ gen_phrases.join(" ") }}
                </h4>

                <p class="my-2">Do you write these phrases in a safe place?</p>
                <v-btn color="success" @click="step = 2">Next</v-btn>
              </div>

              <div v-else-if="gen_phrases">
                <h4
                  class="text-h4 my-3 border rounded p-3"
                  style="min-height: 64px"
                >
                  {{ verify_phrases.join(" ") }}
                </h4>

                <v-chip-group v-model="verify_phrases" column multiple>
                  <v-chip
                    v-for="item in gen_phrases_random"
                    :key="item"
                    :value="item"
                    filter
                    variant="outlined"
                  >
                    {{ item }}
                  </v-chip>
                </v-chip-group>
              </div>
            </div>
          </v-expand-transition>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              :class="{ disabled: !can_create_wallet }"
              :loading="busy_create"
              color="success"
              prepend-icon="add"
              size="x-large"
              variant="elevated"
              @click="createNewBlockchainWallet()"
              >Create a new wallet
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "BGatewayBlockchain",
  props: {
    gateway: {
      require: true,
    },
    shopGateway: {},
  },

  data: function () {
    return {
      busy: false,

      show_create_wallet: false,
      phrases: null,

      busy_gen: false,
      gen_phrases: null,
      gen_phrases_random: null,
      verify_phrases: [],
      step: 1,

      //-----------------------
      busy_create: false,
    };
  },

  computed: {
    can_create_wallet() {
      return (
        (!this.gen_phrases && this.phrases && this.phrases.length > 10) ||
        (this.gen_phrases &&
          this.verify_phrases &&
          this.gen_phrases &&
          this.gen_phrases.join(" ") === this.verify_phrases.join(" "))
      );
    },
  },

  methods: {
    showAddWallet() {
      this.step = 1;
      this.gen_phrases = null;
      this.verify_phrases = [];
      this.phrases = null;
      this.show_create_wallet = true;
    },

    generatePhrasesSet() {
      this.busy_gen = true;
      this.step = 1;

      axios
        .post(
          this.shopGateway
            ? window.API.POST_GATEWAY_SHOP_GENERATE_BLOCKCHAIN_RECOVERY_PHRASES(
                this.shopGateway.shop_id,
                this.gateway.code,
              )
            : window.ADMIN_API.POST_GATEWAY_SELLDONE_GENERATE_BLOCKCHAIN_RECOVERY_PHRASES(
                this.gateway.id,
              ),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.verify_phrases = Object.assign([], data.recovery);

            this.gen_phrases = data.recovery;
            this.gen_phrases_random = Object.assign([], data.recovery).sort(
              () => (Math.random() > 0.5 ? 1 : -1),
            );

            this.showSuccessAlert();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_gen = false;
        });
    },

    createNewBlockchainWallet() {
      this.busy_create = true;

      axios
        .post(
          this.shopGateway
            ? window.API.POST_GATEWAY_SHOP_ADD_BLOCKCHAIN_WALLET(
                this.shopGateway.shop_id,
                this.gateway.code,
              )
            : window.ADMIN_API.POST_GATEWAY_SELLDONE_ADD_BLOCKCHAIN_WALLET(
                this.gateway.id,
              ),
          {
            recovery: this.gen_phrases
              ? this.verify_phrases.join(" ")
              : this.phrases,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("input", data.wallet);
            this.show_create_wallet = false;

            this.showSuccessAlert();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_create = false;
        });
    },
  },
};
</script>

<style scoped></style>
