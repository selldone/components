<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <div class="widget-box">
    <h2 class="d-flex align-center justify-space-between">
      <span>
        <v-icon class="me-1">sentiment_satisfied_alt</v-icon>
        {{ $t("add_product.rating_pros_cons.pros_title") }}</span
      >

      <v-chip color="#4CAF50" size="small">
        <v-icon size="small" start>fa:fas fa-smile</v-icon>
        {{ pros_list.length }}
        {{ $t("add_product.rating_pros_cons.item_unit") }}
      </v-chip>
    </h2>
    <v-list-subheader
      >{{ $t("add_product.rating_pros_cons.pros_message") }}
    </v-list-subheader>

    <v-row class="mt-2" no-gutters>
      <v-chip
        v-for="item in pros_list"
        :key="item.name"
        :disabled="busy_delete_pros === item"
        class="ps-10 ma-1"
        closable
        color="#fff"
        variant="flat"
        @click="showEdit(item)"
        @click:close="deletePros(item)"
      >
        <template v-slot:prepend>
          <div
            class="icon-side rounded-circle"
            style="
              background-image: linear-gradient(
                -60deg,
                #37ecba 0%,
                #72afd3 100%
              );
            "
          >
            <v-icon color="#fff">add</v-icon>
          </div>
        </template>

        <span class="single-line d-inline-block">
          <b>{{ item.name }}</b> : {{ item.value }}
        </span>
      </v-chip>
    </v-row>

    <hr />
    <v-list-subheader
      >{{ $t("add_product.rating_pros_cons.pros_group_messages") }}
    </v-list-subheader>

    <v-text-field
      v-model="pros_name"
      :counter="32"
      :disabled="pros_list.length >= 5"
      :label="$t('add_product.rating_pros_cons.pros_input_title')"
      messages="= "
      placeholder="Advantage name.."
      required
      variant="underlined"
    >
      <template v-slot:message>
        <u-smart-suggestion
          :samples="$tm('suggestions.product.pros_name')"
          class="mb-4"
          @select="
            (v) => {
              pros_name = v;
            }
          "
        ></u-smart-suggestion>
      </template>
    </v-text-field>
    <v-text-field
      v-model="pros_value"
      :counter="128"
      :disabled="pros_list.length >= 5"
      :label="$t('add_product.rating_pros_cons.pros_input_value')"
      messages=" "
      placeholder="Advantage value.."
      required
      variant="underlined"
    >
      <template v-slot:message>
        <u-smart-suggestion
          :samples="$tm('suggestions.product.pros_value')"
          class="mb-4"
          @select="
            (v) => {
              pros_value = v;
            }
          "
        ></u-smart-suggestion>
      </template>
    </v-text-field>

    <div class="text-end">
      <v-btn
        :class="{
          disabled:
            !pros_name ||
            pros_name.length > 32 ||
            !pros_value ||
            pros_value.length > 128,
        }"
        :loading="busy_pros"
        class="m-2 tnt"
        color="#4CAF50"
        variant="elevated"
        @click="addPros"
      >
        <v-icon start>add</v-icon>
        {{ $t("global.actions.add") }}
      </v-btn>
    </div>

    <!-- ██████████████████████ Dialog ██████████████████████ -->

    <v-bottom-sheet v-model="edit_dialog" max-width="640" scrollable>
      <v-card class="rounded-t-xl">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1" color="#111">edit_note</v-icon>
          Edit |
          <b class="mx-1">{{ selected_item?.name }}</b></v-card-title
        >
        <v-card-text>
          <div class="max-widget-width">
            <v-text-field
              v-model="input_name"
              label="Name"
              variant="underlined"
            ></v-text-field>
            <v-text-field
              v-model="input_value"
              label="Value"
              variant="underlined"
            ></v-text-field>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons pt-8">
            <v-btn size="x-large" variant="text" @click="edit_dialog = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
            <v-btn
              :disabled="!input_name || !input_value"
              :loading="busy_update"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="updateValue()"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default defineComponent({
  name: "BProductProsInput",
  mixins: [],
  components: { USmartSuggestion },
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    pros_list: [],

    busy_delete_pros: null,
    busy_pros: false,
    pros_name: "",
    pros_value: "",

    //-----------------------
    selected_item: null,
    input_name: null,
    input_value: null,
    edit_dialog: false,
    busy_update: false,
  }),

  computed: {},

  created() {
    this.createProsList();
  },

  methods: {
    showEdit(item) {
      const { name, value } = item;
      this.selected_item = item;
      this.input_name = name;
      this.input_value = value;
      this.edit_dialog = true;
    },

    createProsList() {
      let out = [];
      let list = this.product.pros;

      if (this.isObject(list)) {
        Object.keys(this.product.pros).forEach((key) => {
          let value = this.product.pros[key];
          out.push({ name: key, value: value });
        });
      }

      this.pros_list = out;
    },

    addPros() {
      this.busy_pros = true;

      axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POST_MY_VENDOR_ADD_PROS(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_ADD_PROS(this.product.shop_id, this.product.id),
          {
            name: this.pros_name,
            value: this.pros_value,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "add_product.rating_pros_cons.notifications.add_pros_success",
              ),
            );
            this.product.pros = data.pros;
            this.pros_name = "";
            this.pros_value = "";
            this.createProsList();
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_pros = false;
        });
    },

    deletePros(item) {
      this.busy_delete_pros = item;

      axios
        .delete(
          this.IS_VENDOR_PANEL
            ? window.VAPI.DELETE_MY_VENDOR_PROS(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.DELETE_PROS(this.product.shop_id, this.product.id),
          {
            params: {
              name: item.name,
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "add_product.rating_pros_cons.notifications.add_pros_success",
              ),
            );
            this.product.pros = data.pros;
            this.createProsList();

            this.$forceUpdate(); // Notice we have to use a $ here
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete_pros = null;
        });
    },

    updateValue() {
      this.busy_update = true;

      const url = this.IS_VENDOR_PANEL
        ? window.VAPI.PUT_MY_VENDOR_UPDATE_PROS(
            this.$route.params.vendor_id,
            this.product.id,
          )
        : window.API.PUT_UPDATE_PROS(this.product.shop_id, this.product.id);

      axios
        .put(url, {
          key: this.selected_item.name,
          name: this.input_name,
          value: this.input_value,
        })
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "Item has been updated successfully saved.",
            );

            if (data.pros) this.product.pros = data.pros;
            if (data.cons) this.product.cons = data.cons;

            this.createProsList();

            this.$forceUpdate(); // Update vue component!

            this.edit_dialog = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update = false;
        });
    },
  },
});
</script>

<style lang="scss" scoped></style>
