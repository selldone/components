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
    :loading="loading"
    :items="items"
    no-filter
    :search-input.sync="search"
    :filter="() => true"
    :flat="flat"
    hide-no-data
    return-object
    item-text="name"
    item-value="email"
    :label="label"
    :solo-inverted="soloInverted"
    :rounded="rounded"
    :filled="filled"
    :outlined="outlined"
    :dense="dense"
    clearable
    :placeholder="placeholder"
    @click:clear="
      $emit('update:user-id', null);
      $emit('update:user', null);
    "
    :hide-details="hideDetails"
    :rules="rules"
    :prepend-inner-icon="!noIcon && !select ? 'account_circle' : undefined"
    :readonly="readonly"
    :messages="messages"
  >
    <template v-slot:selection="data">
      <v-chip
        v-bind="data.attrs"
        :input-value="data.selected"
        :color="data.item.add ? 'primary' : 'transparent'"
        @click="data.select"
        :title="data.item.email"
      >
        <v-avatar left>
          <v-img
            v-if="!data.item.add && data.item.id"
            :src="getUserAvatar(data.item.id)"
          ></v-img>
          <v-icon v-else>person_add</v-icon>
        </v-avatar>
        {{ data.item.name }}

        <span v-if="data.item.add"
          ><v-icon small class="ms-3 me-1">email</v-icon>
          {{ data.item.email }}</span
        >
      </v-chip>
    </template>

    <template v-slot:item="{ item }">
      <v-list-item-avatar>
        <v-icon v-if="item.add" color="success">add</v-icon>
        <img v-else-if="item.id" :src="getUserAvatar(item.id)" />
        <v-icon v-else>account_circle</v-icon>
      </v-list-item-avatar>
      <v-list-item-content class="text-start">
        <v-list-item-title>
          {{ item.name }}
          <v-icon
            v-if="item.profile && item.profile.verified"
            class="ms-1"
            small
            color="blue"
            >verified</v-icon
          ></v-list-item-title
        >
        <v-list-item-subtitle v-text="item.email"></v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-icon v-if="withProfile && item.profile">
        <div v-if="item.profile.nominated_id">
          <v-avatar size="2em">
            <v-img :src="getUserAvatar(item.profile.nominated_id)"></v-img>
          </v-avatar>
          <small class="d-block mt-1">nominated</small>
        </div>
      </v-list-item-icon>
    </template>
  </v-combobox>
</template>

<script>
export default {
  name: "UserEmailInput",
  props: {
    value: {},

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
      default:'john@testmail.com'
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
        this.$emit("input", null);
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
        this.$emit("input", select.email);
        this.$emit("update:user-id", select.id);
        this.$emit("update:user", select);
      }
    },
    value(value) {
      if (!value) this.select = this.value;
    },
  },
  created() {
    this.select = this.value;
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
