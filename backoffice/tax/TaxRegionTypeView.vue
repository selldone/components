<template>
  <span>
    <v-icon :color="type_obj?.color" class="me-1" size="12">circle</v-icon>
    {{ $t(type_obj?.title) }}
  </span>
</template>

<script>
import { TaxRegionTypes } from "../../../../core/enums/tax/TaxRegionTypes";

export default {
  name: "TaxRegionTypeView",
  props: {
    type: { required: true },
  },
  computed: {
    type_obj() {
      return TaxRegionTypes[this.type];
    },
  },
};
</script>

<style scoped></style>
