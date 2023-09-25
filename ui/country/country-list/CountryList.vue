<template>
  <v-autocomplete
    :label="label"
    :value="value"
    @input="(val) => $emit('input', val)"
    :items="countries"
    item-text="name"
    :item-value="itemValue"
    :messages="messages"
    :rounded="rounded"
    :outlined="outlined"
    :return-object="returnObject"
    :disabled="disabled || !countries || !countries.length"
    :dark="dark"
    :color="color"
    :flat="flat"
    :filled="filled"
    :prepend-inner-icon="prependInnerIcon"
    :append-icon="appendIcon"
    :multiple="multiple"
    :chips="chips"
    :dense="dense"
    :rules="required ? [GlobalRules.required()] : []"
    :readonly="readonly"
    :error-messages="errorMessages"
    :loading="loading"
    @change="(val) => $emit('change', val)"
    :solo="solo"
    :hide-details="hideDetails"
    :clearable="clearable"
    :placeholder="placeholder"
    :background-color="transparent ? 'transparent' : undefined"
    :autocomplete="autocomplete"
  >
    <template v-slot:item="{ item }">
      <flag :iso="item.alpha2" :squared="false" />
      <span class="px-3">{{ item.name }}</span>
    </template>

    <template v-slot:selection="{ item }">
      <component :is="chips ? 'v-chip' : 'span'" class="m-1">
        <flag :iso="item.alpha2" :squared="false" />
        <span v-if="!noCountryName" class="px-3 small">{{ item.name }}</span>
      </component>
    </template>
    <template v-slot:prepend-inner
      ><slot name="prepend-inner"></slot>
      <!-- Show value if countries not loaded yet! -->
      <span v-if="value && isString(value) && !countries.length" class="single-line ms-1 me-2">
        <flag :iso="value" :squared="false" class="me-2" /> {{ value }}
      </span>
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  name: "CountryList",

  props: {
    value: {},
    label: {},
    messages: {},
    errorMessages: {},
    color: {},
    placeholder: {},

    multiple: {
      default: false,
      type: Boolean,
    },
    required: {
      default: false,
      type: Boolean,
    },
    dark: {
      default: false,
      type: Boolean,
    },
    dense: {
      default: false,
      type: Boolean,
    },

    chips: {
      default: false,
      type: Boolean,
    },
    rounded: {
      default: false,
      type: Boolean,
    },
    filled: {
      default: false,
      type: Boolean,
    },
    outlined: {
      default: false,
      type: Boolean,
    },

    disabled: {
      default: false,
      type: Boolean,
    },
    loading: {
      default: false,
      type: Boolean,
    },

    returnObject: {
      default: false,
      type: Boolean,
    },

    flat: {
      default: false,
      type: Boolean,
    },

    itemValue: {
      default: "code",
      type: String,
    },
    prependInnerIcon: {},
    appendIcon: {},

    noCountryName: {
      default: false,
      type: Boolean,
    },
    readonly: {
      default: false,
      type: Boolean,
    },

    solo: {
      default: false,
      type: Boolean,
    },
    hideDetails: {
      default: false,
      type: Boolean,
    },
    filter: {
      type: Array,
    },
    clearable: {
      default: false,
      type: Boolean,
    },
    transparent: {
      default: false,
      type: Boolean,
    },
    autocomplete: {},
  },

  data: () => ({}),
  computed: {
    countries() {
      if (!this.$store.getters.getCountries) return null;

      if (this.filter) {
        return this.$store.getters.getCountries.filter((it) =>
          this.filter.includes(it.alpha2)
        );
      }
      return this.$store.getters.getCountries;
    },
  },
  watch: {},
  methods: {},
  created() {
    if (!this.countries || !this.countries.length) {
      this.fetchCountries();
    }
  },
};
</script>

<style scoped></style>
