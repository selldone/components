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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-text-field
    v-model="newValue"
    :append-inner-icon="icon"
    :bg-color="backgroundColor"
    :class="{
      'center-input': textCenter,
      'no-padding-nf': noPadding,
    }"
    class=""
    :density="dense ? 'compact' : undefined"
    :disabled="disabled"
    :flat="flat"
    :hide-details="hideDetails && !messages"
    :label="label /*+ focus + '  ' + newValue*/"
    :loading="loading"
    :messages="messages"
    :placeholder="placeholder"
    :prefix="prefix"
    :prepend-icon="prependIcon"
    :readonly="readonly || is_locked"
    :rounded="rounded"
    :single-line="singleLine"
    :suffix="suffix"
    :theme="dark?'dark':'light'"
    :variant="
      variant
        ? variant
        : solo
          ? 'solo'
          : filled
            ? 'filled'
            : outlined
              ? 'outlined'
              : 'underlined'
    "
    persistent-placeholder
    @click:clear="$emit('clear')"
    @blur="
      () => {
        focus = false;
        if (newValue === '') {
          clearable ? $emit('clear') : (newValue = min > 0 ? min : 0);
        }
        newValue = validateNumber(newValue);
        $nextTick(() => {
          $emit('blur',newValue);
          $emit('change',newValue); // Make sure update value!
        });
      }
    "
    @change="
      focus
        ? undefined /*Prevent update when box focused*/
        : $emit('change') /*Make sure update by mouse wheel*/
    "
    @focus="focus = true"
    @keypress="isNumber($event)"
    @wheel="handleMouseWheel"
    @keyup.enter="
      (e) => {
        if (!newValue) {
          $emit('clear');
        }
        e.target.blur();
      }
    "
  >
    <template v-slot:append-inner>
      <v-btn
        v-if="lock"
        :title="lock ? 'Click to edit value.' : 'Click to lock input'"
        class="me-2"
        icon
        size="24"
        variant="text"
        @click="is_locked = !is_locked"
      >
        <v-icon size="24">{{ is_locked ? "lock" : "lock_open" }}</v-icon>
      </v-btn>

      <v-btn
        v-if="hasAlternativeButton && !readonly"
        :class="dense ? '' : 'margin-n7px'"
        :color="newValue === alternativeButtonValue ? 'success' : 'default'"
        :disabled="is_locked"
        :rounded="rounded"
        :size="dense ? 'small' : undefined"
        class="me-2"
        variant="flat"
        @click.stop="newValue = alternativeButtonValue"
      >
        {{ alternativeButtonText }}
      </v-btn>
      <v-btn
        v-if="showButtons"
        :disabled="is_locked"
        icon
        size="28"
        variant="text"
        @click.stop="mpminus()"
      >
        <v-icon size="24"> fa:fas fa-minus</v-icon>
      </v-btn>
      <v-icon v-if="appendIcon">{{ appendIcon }}</v-icon>

      <slot name="append-inner"></slot>

      <v-btn
        v-if="clearable"

        icon
        size="24"
        variant="text"
        @click="
          newValue = 0;
          $emit('clear');
        "
      >
        <v-icon size="24">close</v-icon>
      </v-btn>
    </template>
    <template v-if="$slots.append" v-slot:append>
        <slot name="append"></slot>
    </template>

    <template v-slot:prepend-inner>
      <v-btn
        v-if="showButtons && !readonly"
        :disabled="is_locked"
        icon
        size="24"
        variant="text"
        @click.stop="mpplus()"
      >
        <v-icon size="24"> fa:fas fa-plus</v-icon>
      </v-btn>
      <v-icon v-if="prependInnerIcon">{{ prependInnerIcon }}</v-icon>

      <slot name="prepend-inner"></slot>
    </template>
  </v-text-field>
</template>

<script>
import { NumberHelper } from "@core/helper/number/NumberHelper";

export default {
  name: "UNumberInput",
  emits: ["update:modelValue", "change", "clear", "blur"],
  props: {
    modelValue: {
      default: 0,
    },
    min: {
      default: 0,
      type: Number,
    },
    max: {
      default: undefined,
      type: Number,
    },
    step: {
      default: 1,
      type: Number,
    },

    decimal: {
      type: Number,
      default: 0,
    },

    disabled: {
      default: false,
      type: Boolean,
    },

    prefix: {},
    label: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    suffix: {
      type: String,
      default: null,
    },
    prependIcon: {
      type: String,
      default: null,
    },

    textCenter: {
      type: Boolean,
      default: true,
    },
    noPadding: {
      type: Boolean,
      default: false,
    },
    hideDetails: {
      type: Boolean,
      default: false,
    },

    messages: {},

    filled: {
      type: Boolean,
      default: false,
    },

    singleLine: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    showButtons: {
      type: Boolean,
      default: false,
    },

    rounded: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },

    clearable: {
      type: Boolean,
      default: false,
    },
    hotUpdateMode: {
      // 1. Prevent emit change everytime value has been changed. 2. Make sure return 0 when value is null. (Use case: Buy button -> Update value on server automatically)
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    solo: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },

    alternativeButtonText: {},
    alternativeButtonValue: {},
    appendIcon: {},
    prependInnerIcon: {},

    backgroundColor: {},

    lock: {
      // Has lock mode and the default is locked.
      type: Boolean,
      default: false,
    },
    variant: {},
  },

  data() {
    return {
      newValue: 0,
      focus: false,

      is_locked: false,
    };
  },

  computed: {
    hasAlternativeButton() {
      return this.alternativeButtonText && this.alternativeButtonValue;
    },
  },
  watch: {
    modelValue: {
      handler: function (newVal, oldVal) {
        if (this.focus) return;
        //  console.log("handler",newVal)

        this.newValue = NumberHelper.toEnglishFloat(newVal, this.decimal);
      },
    },

    newValue(newVal) {
      let newValue = NumberHelper.toEnglishFloat(newVal, this.decimal);

      if (this.max !== undefined && newValue > this.max) newValue = this.max;
      if (this.min !== undefined && newValue < this.min) newValue = this.min;

      // console.log('newValue',newValue)
      this.$emit("update:modelValue", newValue);

      if (this.focus) return;

      this.newValue = newValue;

      this.$emit("change", newValue);
    },
  },
  created() {
    if (!this.modelValue) {
      this.$emit("update:modelValue", 0);
      this.newValue = 0;
    } else {
      this.newValue = this.modelValue;
    }

    this.is_locked = this.lock;
  },

  methods: {
    getNotificationClass(notification) {
      return `alert alert-${notification.type}`;
    },
    mpplus() {
      if (this.max === undefined || this.newValue < this.max) {
        this.newValue = NumberHelper.toEnglishFloat(
          NumberHelper.toEnglishFloat(this.newValue, this.decimal) + this.step,
          this.decimal,
        );
        this.$emit("update:modelValue", this.newValue);
        this.$emit("change", this.newValue);
      }
    },
    mpminus() {
      if (this.newValue > this.min) {
        this.newValue = NumberHelper.toEnglishFloat(
          NumberHelper.toEnglishFloat(this.newValue, this.decimal) - this.step,
          this.decimal,
        );
        this.$emit("update:modelValue", this.newValue);
        this.$emit("change", this.newValue);
      }
    },
    validateNumber(val) {
      if (this.clearable && !val) return val;
      if (!this.clearable && !val) return 0;

      return NumberHelper.toEnglishFloat(val, this.decimal);
    },

    handleMouseWheel(evt) {
      if (this.readonly || this.is_locked) return;
      const deltaY = evt.deltaY;
      if (deltaY < 0) this.mpplus();
      else if (deltaY > 0) this.mpminus();

      evt.preventDefault();
      this.$emit("blur");
    },

    isNumber(evt) {
      evt = evt ? evt : window.event;
      let charCode = evt.which ? evt.which : evt.keyCode;
      //console.log('charCode : '+charCode)
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) && // Numbers
        charCode !== 46 && // Dot (.)
        (this.min >= 0 || charCode !== 45) //  sign: -
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
  },
};
</script>
<style lang="scss">
.no-padding-nf {
  .v-input__slot {
    padding: 0 4px !important;
  }
}
</style>
