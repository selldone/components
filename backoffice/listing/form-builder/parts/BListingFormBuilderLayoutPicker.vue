<template>
  <div class="sld-bfb-layout">
    <div class="d-flex align-center mb-2">
      <v-icon class="me-2">view_quilt</v-icon>
      <div class="font-weight-black">Layout</div>
    </div>

    <div class="sld-bfb-layout__grid">
      <button
        v-for="l in layouts"
        :key="l.value"
        type="button"
        class="sld-bfb-layout__card"
        :class="{ '-active': modelProxy === l.value }"
        @click="modelProxy = l.value"
      >
        <div class="sld-bfb-layout__thumb" :class="`-${l.value}`"></div>
        <div class="sld-bfb-layout__title">{{ l.title }}</div>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "BListingFormBuilderLayoutPicker",

  props: {
    modelValue: { type: String, default: "split_right" },
  },

  emits: ["update:modelValue"],

  computed: {
    modelProxy: {
      get(): string {
        return String((this as any).modelValue || "split_right");
      },
      set(v: string) {
        (this as any).$emit("update:modelValue", v);
      },
    },

    layouts(): any[] {
      return [
        { value: "split_right", title: "Split (image right)" },
        { value: "split_left", title: "Split (image left)" },
        { value: "stacked", title: "Stacked" },
        { value: "centered", title: "Centered" },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-layout {
  &__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 920px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__card {
    appearance: none;
    border: 1px solid rgba(20, 20, 20, 0.10);
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 10px;
    text-align: left;
    cursor: pointer;
    max-width: 150px;

    transition: border-color 0.12s ease, transform 0.12s ease;

    &:hover {
      border-color: rgba(20, 20, 20, 0.18);
      transform: translateY(-1px);
    }

    &.-active {
      border: 3px solid rgba(0, 0, 0, 0.70);
      background: rgba(0, 0, 0, 0.03);
    }
  }

  &__thumb {
    height: 54px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(20, 20, 20, 0.08);

    &.-split_right {
      background: linear-gradient(
          to right,
          rgba(0, 0, 0, 0.04) 0%,
          rgba(0, 0, 0, 0.04) 60%,
          rgba(0, 0, 0, 0.08) 60%,
          rgba(0, 0, 0, 0.08) 100%
      );
    }

    &.-split_left {
      background: linear-gradient(
          to right,
          rgba(0, 0, 0, 0.08) 0%,
          rgba(0, 0, 0, 0.08) 40%,
          rgba(0, 0, 0, 0.04) 40%,
          rgba(0, 0, 0, 0.04) 100%
      );
    }

    &.-stacked {
      background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.08) 0%,
          rgba(0, 0, 0, 0.08) 45%,
          rgba(0, 0, 0, 0.04) 45%,
          rgba(0, 0, 0, 0.04) 100%
      );
    }

    &.-centered {
      background:
        radial-gradient(circle at 50% 40%, rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.02) 62%);
    }
  }

  &__title {
    margin-top: 8px;
    font-weight: 800;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.78);
  }
}
</style>