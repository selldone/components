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
  <v-combobox
    v-model="select"
    v-model:search="search"
    :customFilter="() => true"
    :density="dense ? 'compact' : undefined"
    :flat="flat"
    :hide-details="hideDetails"
    :items="items"
    :label="label"
    :loading="loading"
    :messages="messages ? messages : undefined"
    :multiple="multiple"
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
    class="v-input-auto-height"
    clearable
    hide-no-data
    item-title="name"
    item-value="email"
    no-filter
    return-object
    @click:clear="
      $emit('update:modelValue', null);
      $emit('update:user-id', null);
      $emit('update:user', null);
    "
    :persistent-placeholder="persistentPlaceholder"
  >
    <template v-slot:chip="{ item, props }">
      <v-chip
        v-if="multiple"
        :color="item.raw.add ? 'primary' : 'transparent'"
        :title="item.raw.email"
        v-bind="props"
        variant="flat"
      >
        <v-avatar start>
          <v-img
            v-if="!item.raw.add && item.raw.id"
            :src="getUserAvatar(item.raw.id)"
          ></v-img>
          <v-icon v-else>person_add</v-icon>
        </v-avatar>
        {{ item.raw.name }}

        <span v-if="item.raw.add"
          ><v-icon class="ms-3 me-1" size="small">email</v-icon>
          {{ item.raw.email }}</span
        >
      </v-chip>
      <div v-else class="d-flex align-center">
        <v-avatar class="me-2 avatar-gradient -thin -user" size="32">
          <v-img
            v-if="!item.raw.add && item.raw.id"
            :src="getUserAvatar(item.raw.id)"
          ></v-img>
          <v-img v-else color="#fff">
            <v-icon>person_add</v-icon>
          </v-img>
        </v-avatar>

        <div class="flex-grow-1">
          <div>
            {{ item.raw.add ? item.raw.email : item.raw.name }}

            <v-chip
              v-if="item.raw.add"
              class="ms-1"
              color="green"
              size="small"
              variant="tonal"
              >invite
            </v-chip>
          </div>

          <small v-if="item.raw.email && !item.raw.add" class="d-block">
            <v-icon class="me-1" size="small">email</v-icon>
            {{ item.raw.email }}</small
          >
        </div>
      </div>
    </template>

    <template v-slot:item="{ item, props }">
      <v-list-item class="text-start" v-bind="props">
        <template v-slot:prepend>
          <v-avatar>
            <v-icon v-if="item.raw.add" color="success">add</v-icon>
            <img v-else-if="item.raw.id" :src="getUserAvatar(item.raw.id)" />
            <v-icon v-else>account_circle</v-icon>
          </v-avatar>
        </template>
        <template v-slot:title>
          <v-list-item-title>
            {{ item.raw.name }}
            <v-icon
              v-if="item.raw.profile && item.raw.profile.verified"
              class="ms-1"
              color="blue"
              size="small"
              >verified
            </v-icon>
          </v-list-item-title>
        </template>
        <template v-slot:subtitle>
          <v-list-item-subtitle v-text="item.raw.email"></v-list-item-subtitle>
        </template>
        <template v-if="withProfile && item.raw.profile" v-slot:append>
          <div v-if="item.raw.profile.nominated_id">
            <v-avatar size="2em">
              <v-img
                :src="getUserAvatar(item.raw.profile.nominated_id)"
              ></v-img>
            </v-avatar>
            <small class="d-block mt-1">nominated</small>
          </div>
        </template>
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script lang="ts">
import threads from "@selldone/core-js/utils/thread/threads";

export default {
  name: "SUserInput",
  emits: ["update:modelValue", "update:user-id", "update:user"],
  props: {
    modelValue: {},

    multiple: Boolean,

    withProfile: {
      type: Boolean,
      default: false,
    },
    excludeMe: {
      type: Boolean,
      default: false,
    },
    selldoneStaffOnly: {
      type: Boolean,
      default: false,
    },

    noIcon: {
      type: Boolean,
      default: false,
    },

    // userId: {},
    label: {
      default: "User email address",
    },
    placeholder: {
      default: "john@testmail.com",
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

    canInvite: {
      type: Boolean,
      default: false,
    },

    customerForShopId: {},
    readonly: {
      type: Boolean,
      default: false,
    },
    messages: {},

    staffOfShopId: {},
    variant: {},
    persistentPlaceholder: Boolean,
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
    search: threads.debounceSearch(function (val) {
      val && val !== this.select && this.querySelections(val);
    }),

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
        this.$emit("update:modelValue", select.email);
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
        .get(window.API.GET_SUGGESTION_USERS(v), {
          params: {
            customers_shop: this.customerForShopId,
            profile: this.withProfile,
            exclude_me: this.excludeMe,
            shop_id: this.staffOfShopId,

            selldone_staff_only: this.selldoneStaffOnly ? true : undefined,
          },
        })
        .then(({ data }) => {
          this.items = data;
          if (
            this.canInvite &&
            !this.items.length &&
            this.search &&
            this.GlobalRules.ValidateEmail(this.search)
          )
            this.items.push({
              email: this.search,
              name: "New user",
              add: true,
            });
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped></style>
