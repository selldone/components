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
  <!-- ████████████████████████ Structure ████████████████████████ -->
  <draggable
    :animation="200"
    :disabled="false"
    :model-value="modelValue"
    ghostClass="ghost"
    handle=".handle"
    style="list-style-type: none"
    tag="div"
    @end="drag = false"
    @start="drag = true"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <!-- It should be an html element not a component -->
    <template v-slot:item="{ element, index }">
      <b-valuation-form-structure-row
        :key="index"
        :collapse="drag || collapse"
        :element="element"
        :sample-product="sampleProduct"
        class="mt-5"
        @remove="removeField(index)"
      >
      </b-valuation-form-structure-row>
    </template>
  </draggable>
</template>

<script>
import draggable from "vuedraggable";
import BValuationFormStructureRow from "../../../valuation/form/structure/row/BValuationFormStructureRow.vue";

export default {
  name: "BValuationFormStructure",
  emits: ["update:modelValue"],
  components: {
    BValuationFormStructureRow,

    draggable,
  },
  props: {
    modelValue: {},

    sampleProduct: {
      // Sample product
      required: true,
      type: Object,
    },

    collapse: Boolean.prototype,
  },

  data: () => ({
    drag: false,
  }),

  computed: {},

  watch: {},
  created() {
    this.check();
  },
  methods: {
    /**
     * Make sure look up value is object not array!
     */
    check() {
      let structure = this.modelValue;

      if (!structure || !Array.isArray(structure)) {
        structure = [];
      }

      structure.forEach((row) => {
        if (!row.lookup || Array.isArray(row.lookup)) row.lookup = {};
      });
      this.$emit("update:modelValue", structure);
    },

    removeField(index) {
      this.modelValue.splice(index, 1);
      this.$emit("update:modelValue", this.modelValue.slice());
      this.$forceUpdate(); // Force refresh component!
    },
  },
};
</script>

<style lang="scss" scoped></style>
