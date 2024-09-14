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
  <v-expand-transition>
    <div v-if="has_giftcards">
      <v-list
        max-height="160"
        class="text-start border-bottom-0"
        style="border: solid #aaa thin"
        rounded="t-lg b-0"
      >
        <v-list-item
          v-for="_giftcard in giftCards"
          :key="_giftcard.id"
          @click="modelValue?.toggle(_giftcard)"
        >
          <template v-slot:prepend>
            <v-scale-transition hide-on-leave>
              <v-icon v-if="modelValue?.includes(_giftcard)" color="primary"
                >circle
              </v-icon>
              <v-icon v-else>radio_button_unchecked</v-icon>
            </v-scale-transition>

            <b-giftcard-type-icon
              :image="getShopImagePath(_giftcard.gift_type.bg, 128)"
              :color="_giftcard.gift_type.color"
              height="32"
              class="mx-2"
            ></b-giftcard-type-icon>
          </template>
          <template v-slot:title>
            <b>{{ formatCard(_giftcard.number) }}</b>
          </template>
          <template v-slot:append>
            <u-price
              :amount="_giftcard.balance"
              :currency="_giftcard.gift_type.currency"
            ></u-price>
          </template>
        </v-list-item>
      </v-list>
    </div>
  </v-expand-transition>

  <v-select
    :items="giftCards"
    :label="$t('global.payment_form.gift_cards_input')"
    :model-value="modelValue"
    :multiple="multiple"
    :no-data-text="$t('global.payment_form.gift_cards_input_empty')"
    :return-object="returnObject"
    :rounded="has_giftcards ? 'b-lg t-0' : 'lg'"
    :variant="variant"
    :bg-color="bgColor"
    item-title="number"
    :single-line="singleLine"
    prepend-inner-icon="card_giftcard"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    style="--v-input-control-height: 65px"
    readonly
    @click="dialog = true"
  >
    <template v-slot:append-inner>
      <v-progress-circular v-if="loading" indeterminate></v-progress-circular>

      <v-btn icon variant="text" @click.prevent="dialog = true">
        <v-icon>add_box</v-icon>
        <v-tooltip
          activator="parent"
          content-class="bg-black"
          location="bottom"
        >
          {{ $t("global.actions.add_giftcard") }}
        </v-tooltip>
      </v-btn>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Add card  ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <s-giftcard-add
        v-model="dialog"
        @add="
          (gift_card) => {
            AddOrUpdateItemByID(giftCards, gift_card);
            if (modelValue) AddOrUpdateItemByID(modelValue, gift_card);
            dialog = false;
          }
        "
      ></s-giftcard-add>
    </template>
    <template v-slot:selection="{ item, index }">
      <v-chip
        v-if="index === 0"
        class="overflow-visible"
        color="#ffffff"
        theme="light"
        variant="flat"
      >
        <template v-slot:prepend>
          <v-avatar v-if="item.raw.gift_type.bg" class="me-2">
            <img
              :src="getShopImagePath(item.raw.gift_type.bg, IMAGE_SIZE_SMALL)"
              alt="trevor"
            />
          </v-avatar>
        </template>
        <span>{{ formatCard(item.raw.number) }}</span>
        <span class="ms-2 small">{{ item.raw.gift_type.title }}</span>
      </v-chip>
      <span v-if="index === 1" class="text-caption ms-2 mt-1"
        >(+{{ modelValue.length - 1 }}
        {{ $t("global.payment_form.more") }} )</span
      >
    </template>
    <template v-slot:item="{ item, props }">
      <v-list-item class="text-start" v-bind="props">
        <template v-slot:prepend>
          <img
            v-if="item.raw.gift_type.bg"
            :src="getShopImagePath(item.raw.gift_type.bg, IMAGE_SIZE_SMALL)"
            class="rounded me-2"
            height="24"
            width="36"
          />
        </template>

        <template v-slot:title>
          <b>{{ formatCard(item.raw.number) }}</b>
        </template>
        <template v-slot:append>
          <u-price
            :amount="item.raw.balance"
            :currency="item.raw.gift_type.currency"
          ></u-price>
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>

<script>
import SGiftcardAdd from "../../../storefront/giftcard/add/SGiftcardAdd.vue";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";
import BGiftcardTypeIcon from "@selldone/components-vue/backoffice/giftcard/type/icon/BGiftcardTypeIcon.vue";

export default {
  name: "SGiftcardInput",
  components: { BGiftcardTypeIcon, UPrice, SGiftcardAdd },
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
    giftCards: {},
    multiple: {
      default: false,
      type: Boolean,
    },
    returnObject: {
      default: false,
      type: Boolean,
    },

    bgColor: {},
    loading: {
      default: false,
      type: Boolean,
    },
    variant: {
      default: "underlined",
    },
    singleLine: Boolean,
  },
  data: () => ({
    dialog: false,
  }),

  computed: {
    has_giftcards() {
      return this.giftCards?.length;
    },
  },
};
</script>

<style scoped></style>
