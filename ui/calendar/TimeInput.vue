<template>
  <div class="d-flex align-center">
    <number-picker
      v-model="h"
      solo
      hide-details
      flat
      placeholder="00"
      :min="0"
      :max="23"
      dense
      background-color="transparent"
      class="intim"
      :title="$t('global.commons.hour')"
    >
    </number-picker>
    :
    <number-picker
      v-model="m"
      solo
      hide-details
      flat
      placeholder="00"
      :min="0"
      :max="59"
      dense
      background-color="transparent"
      class="intim"
      :title="$t('global.commons.minute')"
    >
    </number-picker>

    <v-slide-y-transition hide-on-leave>
      <img
        v-if="obj"
        :src="obj.icon"
        :key="obj.value"
        width="20"
        height="20"
        class="mx-1"
      />
    </v-slide-y-transition>
  </div>
</template>

<script>
import NumberPicker from "@/Components/ui/input/number/NumberPicker.vue";
import { TimeSpans } from "../../../../core/enums/logistic/TimeSpans";
export default {
  name: "TimeInput",
  components: { NumberPicker },
  props: {
    value: {},
  },

  data: () => ({
    h: 0,
    m: 0,
  }),

  computed: {
    out() {
      return this.h + ":" + this.m;
    },

    obj() {
      if (this.h < 8) return TimeSpans.Instant;
      else if (this.h < 14) return TimeSpans.Morning;
      else if (this.h < 20) return TimeSpans.Evening;
      return TimeSpans.Night;
    },
  },
  watch: {
    value() {
      this.assignValue();
    },
    out() {
      this.updateValue();
    },
  },

  created() {
    this.assignValue();
  },
  methods: {
    assignValue() {
      if (this.value === this.out) return;
      if (!this.value || !this.isString(this.value)) {
        this.h = 0;
        this.m = 0;
        return;
      }
      const arr = this.value.split(":");
      if (arr.length !== 2) {
        this.h = 0;
        this.m = 0;
        return;
      }
      this.h = parseInt(arr[0]);
      this.m = parseInt(arr[1]);
    },
    updateValue() {
      this.$emit("input", this.out);
      this.$emit("change", this.out);
    },
  },
};
</script>

<style lang="scss" scoped>
.intim {
  width: 52px !important;
  max-width: 52px !important;
}
</style>
