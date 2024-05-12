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
  <v-autocomplete
    v-model="select"
    v-model:search="search"
    :customFilter="() => true"
    :density="dense ? 'compact' : undefined"
    :flat="flat"
    :hide-details="hideDetails"
    :items="items"
    :label="label"
    :loading="loading"
    :messages="
      messages
        ? messages
        : select
          ? `${select.email ? select.email : 'no-mail'} , ${
              select.phone ? select.phone : 'no-phone'
            }`
          : undefined
    "
    :placeholder="placeholder"
    :prepend-inner-icon="!noIcon && !select ? 'account_circle' : undefined"
    :readonly="readonly"
    :rounded="rounded"
    :rules="rules"
    :variant="
      variant
        ? variant
        : soloInverted
          ? 'solo-inverted'
          : outlined
            ? 'outlined'
            : filled
              ? 'filled'
              : 'underlined'
    "
    clearable
    hide-no-data
    item-title="name"
    item-value="id"
    no-filter
    return-object
    @click:clear="
      $emit('update:user-id', null);
      $emit('update:user', null);
    "
  >
    <template v-slot:selection="{ item }">
      <v-avatar class="me-2" :size="24">
        <v-img
          v-if="!item.raw.add && item.raw.user_id"
          :src="getUserAvatar(item.raw.user_id)"
        ></v-img>
        <v-icon v-else-if="item.raw.add">person_add</v-icon>
        <v-icon v-else>account_circle</v-icon>
      </v-avatar>
      <b>{{ item.raw.name }}</b>

      <span v-if="item.raw.add"
        ><v-icon class="ms-3 me-1" size="small">email</v-icon>
        {{ item.raw.email }}</span
      >
    </template>

    <template v-slot:item="{ item, props }">
      <v-list-item class="text-start" v-bind="props">
        <template v-slot:prepend>
          <v-avatar
            :class="{
              '-user': item.raw.user_id,
              '-customer': !item.raw.user_id,
            }"
            class="avatar-gradient -thin"
          >
            <v-icon v-if="item.raw.add" color="success">add</v-icon>
            <img
              v-else-if="item.raw.user_id"
              :src="getUserAvatar(item.raw.user_id)"
            />
            <v-icon v-else>account_circle</v-icon>
          </v-avatar>
        </template>

        <template v-slot:title>
          <v-list-item-title class="d-flex align-center">
            <span class="flex-grow-1"
              ><b>{{ item.raw.name }}</b>
              <v-icon
                v-if="item.raw.profile && item.raw.profile.verified"
                class="ms-1"
                color="blue"
                size="small"
                >verified</v-icon
              ></span
            >
            <small v-if="!item.raw.user_id" class="ms-1"
              >🞄 Not registered</small
            >
          </v-list-item-title>
        </template>
        <template v-slot:subtitle>
          <v-list-item-subtitle>
            <span v-if="item.raw.email" class="me-2">
              <v-icon class="me-1" size="small">email</v-icon>
              {{ item.raw.email }}
            </span>

            <span v-if="item.raw.phone">
              <v-icon class="me-1" size="small">phone</v-icon>
              {{ item.raw.phone }}</span
            >
          </v-list-item-subtitle>
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  name: "BCustomerInput",

  props: {
    shop: {
      type: Object,
      required: true,
    },

    modelValue: {},

    noIcon: {
      type: Boolean,
      default: false,
    },

    // userId: {},
    label: {
      default: "Customer",
    },
    placeholder: {
      default: "email, phone, name, ID",
    },

    rounded: {
      type: Boolean,
      default: false,
    },
    filled: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    soloInverted: {
      type: Boolean,
      default: false,
    },

    hideDetails: {
      type: Boolean,
      default: false,
    },
    rules: {},

    readonly: {
      type: Boolean,
      default: false,
    },
    messages: {},
    variant: {},
  },

  data() {
    return {
      loading: false,
      items: [],
      search: null,
      select: null,
    };
  },
  computed: {
    items_input() {
      const out = [...this.items];
      if (
        this.search &&
        this.GlobalRules.ValidateEmail(this.search) &&
        !this.items.some((i) => i.email === this.search)
      ) {
        out.push({ email: this.search, name: this.search });
      }

      return out;
    },

    invite_mode() {
      return (
        !this.search && this.items.some((item) => item.email === this.search)
      );
    },
  },
  watch: {
    search(val) {
      val && val !== this.select && this.querySelections(val);
    },

    select(select) {
      if (!select) {
        this.$emit("update:modelValue", null);
        this.$emit("update:user-id", null);
        this.$emit("update:user", null);
        return;
      }

      console.log("select", select);

      if (this.isString(select)) {
        // Raw email input!
        const obj = { email: select, name: select };
        this.items.push(obj);
        this.select = obj;
      } else {
        this.$emit("update:modelValue", select.id);
        this.$emit("update:user-id", select.id);
        this.$emit("update:user", select);
      }
    },
    modelValue(value) {
      if (!value) this.select = this.modelValue;
    },
  },
  created() {
    this.select = this.modelValue;
  },
  methods: {
    querySelections(v) {
      if (!window.API) return; // Only in shop community add moderators!
      this.loading = true;

      axios
        .get(window.API.GET_SUGGESTION_CUSTOMERS(this.shop.id, v))
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }
          this.items = data;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped></style>
