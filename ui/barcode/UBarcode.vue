<template>
  <div>
    <component
      :is="elementTag"
      ref="barcode"
      :style="{ display: valid ? undefined : 'none' }"
      class="vue-barcode-element"
    >
    </component>
    <div v-if="!valid">
      <slot></slot>
    </div>
  </div>
  <div class="small text-red text-center pa-2">{{ error }}</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import JsBarcode from "jsbarcode";

export default defineComponent({
  name: "UBarcode",
  props: {
    value: [String, Number] as PropType<string | number>,
    format: String,
    width: [String, Number] as PropType<string | number>,
    height: [String, Number] as PropType<string | number>,
    displayValue: {
      type: [String, Boolean] as PropType<string | boolean>,
      default: true,
    },
    text: [String, Number] as PropType<string | number>,
    fontOptions: String,
    font: String,
    textAlign: String,
    textPosition: String,
    textMargin: [String, Number] as PropType<string | number>,
    fontSize: [String, Number] as PropType<string | number>,
    background: String,
    lineColor: String,
    margin: [String, Number] as PropType<string | number>,
    marginTop: [String, Number] as PropType<string | number>,
    marginBottom: [String, Number] as PropType<string | number>,
    marginLeft: [String, Number] as PropType<string | number>,
    marginRight: [String, Number] as PropType<string | number>,
    flat: Boolean,
    ean128: [String, Boolean] as PropType<string | boolean>,
    elementTag: {
      type: String,
      default: "canvas",
      validator: (value: string) => ["canvas", "svg", "img"].includes(value),
    },
  },
  data() {
    return {
      valid: true,
      error: null,
    };
  },
  watch: {
    $props: {
      handler: "render",
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.render();
  },
  methods: {
    render() {
      this.error = null;
      if (!this.$refs.barcode) return;
      const settings = {
        format: this.format,
        width: this.width,
        height: this.height,
        displayValue: this.displayValue,
        text: this.text,
        fontOptions: this.fontOptions,
        font: this.font,
        textAlign: this.textAlign,
        textPosition: this.textPosition,
        textMargin: this.textMargin,
        fontSize: this.fontSize,
        background: this.background,
        lineColor: this.lineColor,
        margin: this.margin,
        marginTop: this.marginTop,
        marginBottom: this.marginBottom,
        marginLeft: this.marginLeft,
        marginRight: this.marginRight,
        flat: this.flat,
        ean128: this.ean128,
        valid: (valid: boolean) => {
          this.valid = valid;
        },
        elementTag: this.elementTag,
      };

      this.removeUndefinedProps(settings);

      try {
        JsBarcode(this.$refs.barcode, String(this.value), settings);
      } catch (e) {
        console.error(e);
        this.error = `Can not render barcode format ${this.format}.`;
      }
    },
    removeUndefinedProps(obj: Record<string, any>) {
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop) && obj[prop] === undefined) {
          delete obj[prop];
        }
      }
    },
  },
});
</script>
