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
  <div v-bind="$attrs">
    <div
      v-if="readOnly"
      class="d-flex flex-grow-1 align-center py-1 text-start"
      style="min-height: 60px"
    >
      <template v-if="selected">
        <v-avatar class="me-2" rounded size="42">
          <img v-if="selected.logo" :src="getShopImagePath(selected.logo)" />
          <v-icon v-else>business</v-icon>
        </v-avatar>
        <div class="flex-grow-1 py-1">
          <b
            >{{ selected.name }}
            <v-icon
              v-if="selected.register"
              class="mx-1"
              color="primary"
              size="small"
              >verified
            </v-icon>
          </b>
          <div class="small">
            <flag
              v-if="selected.country"
              :iso="selected.country"
              :squared="false"
              class="me-1"
            />
            <img
              v-if="isEuropean(selected.country)"
              class="mx-1"
              height="16"
              src="../../../assets/icons/europe.svg"
              width="16"
            />
            {{ selected.tax }} | {{ selected.address }}
          </div>
        </div>
      </template>
      <p v-else>Not Selected!</p>
    </div>
    <v-autocomplete
      v-else
      v-model:search="search"
      :customFilter="() => true"
      :disabled="disabled"
      :items="companies"
      :loading="busy"
      :messages="selected ? selected.address : ''"
      :model-value="modelValue"
      @update:model-value="(val) => $emit('update:modelValue', val)"
      :return-object="returnObject"
      :clearable="clearable"
      item-title="name"
      item-value="id"
      label="Company / Business Profile"
      @click:clear="$emit('click:clear')"
      :variant="variant"
      class="v-input-auto-height"
    >
      <template v-slot:append-item>
        <v-list-item @click="dialog = true">
          <v-icon class="me-2" color="#111">domain_add</v-icon>
          Add New Business Profile
        </v-list-item>
      </template>
      <template v-slot:selection="{}">
        <div
          class="d-flex flex-grow-1 align-center py-1 text-start"
          style="min-height: 60px"
        >
          <template v-if="selected">
            <v-avatar class="me-2" rounded size="42">
              <img
                v-if="selected.logo"
                :src="getShopImagePath(selected.logo)"
              />
              <v-icon v-else>business</v-icon>
            </v-avatar>
            <div class="flex-grow-1 py-1">
              <b
                >{{ selected.name }}
                <v-icon
                  v-if="selected.register"
                  class="mx-1"
                  color="primary"
                  size="small"
                  >verified
                </v-icon>
              </b>
              <div class="small">
                <flag
                  v-if="selected.country"
                  :iso="selected.country"
                  :squared="false"
                  class="me-1"
                />
                <img
                  v-if="isEuropean(selected.country)"
                  class="mx-1"
                  height="16"
                  src="../../../assets/icons/europe.svg"
                  width="16"
                />
                {{ selected.tax }} | {{ selected.address }}
              </div>
            </div>
          </template>
        </div>
      </template>

      <template v-slot:item="{ item, props }">
        <v-list-item v-bind="props" class="text-start">
          <template v-slot:prepend>
            <v-avatar rounded size="32">
              <img
                v-if="item.raw.logo"
                :src="getShopImagePath(item.raw.logo)"
              />
              <v-icon v-else>business</v-icon>
            </v-avatar>
          </template>

          <template v-slot:title>
            <b
              >{{ item.raw.name }}
              <v-icon
                v-if="item.raw.register"
                class="mx-1"
                color="primary"
                size="small"
                >verified
              </v-icon>
            </b>
          </template>

          <v-list-item-subtitle class="mt-1">
            <flag
              v-if="item.raw.country"
              :iso="item.raw.country"
              :squared="false"
              class="me-1"
            />
            <img
              v-if="isEuropean(item.raw.country)"
              class="mx-1"
              height="16"
              src="../../../assets/icons/europe.svg"
              width="16"
            />
            {{ item.raw.tax }} | {{ item.raw.address }}
          </v-list-item-subtitle>
        </v-list-item>
      </template>
    </v-autocomplete>
    <!-- ███████████████████████ Add dialog ███████████████████████ -->
  </div>

  <v-dialog
    v-if="hasAdd"
    v-model="dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <b-company-add has-back @add="onAddCompany" @back="dialog = false" />
  </v-dialog>
</template>

<script>
import EuropeCountriesAlpha2 from "@selldone/core-js/enums/country/EuropeCountriesAlpha2";
import BCompanyAdd from "../../company/add/BCompanyAdd.vue";
import threads from "@selldone/core-js/utils/thread/threads";

export default {
  name: "BCompanyInput",
  components: { BCompanyAdd },
  emits: ["update:modelValue", "click:clear"],
  props: {
    modelValue: {},

    registeredOnly: {
      default: false,
      type: Boolean,
    },
    returnObject: { type: Boolean },
    autoSelectFirst: { type: Boolean },
    hasAdd: { type: Boolean },
    readOnly: { type: Boolean },
    variant: {
      default: "underlined",
    },
    clearable: Boolean,
    disabled: Boolean,
  },

  data() {
    return {
      companies: [],
      total: false,

      busy: false,

      search: "",

      //-------------------
      dialog: false,
    };
  },

  computed: {
    selected() {
      return (
        this.modelValue &&
        (this.isObject(this.modelValue)
          ? this.modelValue
          : this.companies.find((i) => i.id === this.modelValue))
      );
    },
  },
  watch: {
    search: threads.debounceSearch(function (search) {
      if (search && search === this.selected?.name) return;
      this.fetchCompanies();
    }),
  },

  created() {
    this.fetchCompanies();
  },

  methods: {
    fetchCompanies() {
      this.busy = true;
      axios
        .get(window.API.GET_MY_COMPANIES(), {
          params: {
            // Must contain this id:
            contain:
              this.modelValue && this.isObject(this.modelValue)
                ? this.modelValue.id
                : this.modelValue,
            search: this.search,
            offset: 0,
            count: 20,

            registered_only: this.registeredOnly,
            compact: true,
          },
        })
        .then(({ data }) => {
          this.companies = data.companies;
          this.total = data.total;

          // Auto select first item if the value is null!
          if (
            this.autoSelectFirst &&
            this.companies.length &&
            !this.modelValue
          ) {
            this.$emit(
              "update:modelValue",
              this.returnObject ? this.companies[0] : this.companies[0].id,
            );
          }
        })
        .finally(() => {
          this.busy = false;
        });
    },

    isEuropean(country) {
      return country && EuropeCountriesAlpha2.includes(country);
    },

    onAddCompany(_company) {
      this.AddOrUpdateItemByID(this.companies, _company);
      this.$emit(
        "update:modelValue",
        this.returnObject ? _company : _company.id,
      );
      this.dialog = false;
    },
  },
};
</script>

<style lang="scss" scoped></style>
