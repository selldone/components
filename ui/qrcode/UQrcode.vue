<template>
  <!-- The template dynamically creates an element based on the 'tag' prop -->
  <!-- This will be a 'canvas', 'img', or 'svg' element, depending on the 'tag' prop value -->
  <component :is="tag" ref="qrcodeElement"></component>
</template>

<script>
import { toCanvas, toDataURL, toString } from "qrcode";

export default {
  name: "UQrcode",

  props: {
    // The value of the QR code.
    value: {
      type: String,
      default: undefined,
    },
    // The options for the QR code generator.
    // See: https://github.com/soldair/node-qrcode#qr-code-options
    options: {
      type: Object,
      default: () => ({}),
    },
    // The tag name of the component's root element.
    tag: {
      type: String,
      default: "canvas",
    },
  },

  emits: ["ready"],

  watch: {
    // Watching all props for changes to regenerate the QR code
    $props: {
      deep: true,
      immediate: true,
      handler() {
        this.generate();
      },
    },
  },

  mounted() {
    this.generate();
  },

  methods: {
    // Generates the QR code
    generate() {
      const options = this.options || {};
      const value = String(this.value);

      const done = () => {
        this.$emit("ready", this.$refs.qrcodeElement);
      };

      const el = this.$refs.qrcodeElement;

      switch (this.tag) {
        case "canvas":
          toCanvas(el, value, options, (error) => {
            if (error) {
              throw error;
            }
            done();
          });
          break;

        case "img":
          toDataURL(value, options, (error, url) => {
            if (error) {
              throw error;
            }
            el.src = url;
            el.onload = done;
          });
          break;

        case "svg":
          toString(value, options, (error, string) => {
            if (error) {
              throw error;
            }

            const div = document.createElement("div");
            div.innerHTML = string;
            const svg = div.querySelector("svg");

            if (svg) {
              const { attributes, childNodes } = svg;
              Object.keys(attributes).forEach((key) => {
                const attribute = attributes[key];
                el.setAttribute(attribute.name, attribute.value);
              });
              Object.keys(childNodes).forEach((key) => {
                const childNode = childNodes[key];
                el.appendChild(childNode.cloneNode(true));
              });
              done();
            }
          });
          break;
      }
    },
  },
};
</script>

<style scoped>
/* Add styles specific to your component here */
</style>
