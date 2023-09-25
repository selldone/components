<template>
  <div :class="{ dark: dark, pen: readonly }" class="text-start">
    <h3 v-if="label" class="my-2">{{ label }}</h3>
    <v-subheader v-if="hint">{{ hint }}</v-subheader>

    <v-slide-y-transition
      tag="div"
      group
      class="border-between-vertical rounded-card"
      :class="{ 'disabled pen': disabled, border: border, 'white--text': dark }"
      hide-on-leave
    >
      <div
        v-for="(task, i) in items_show"
        :key="val(task) ? val(task) : i"
        class="p-2 pp row-hover usn"
        :class="{
          'bg-dark': dark,
          'bg-white': !dark,
          'disabled pen': task.disabled,
          pen: !clearable && forceShowAll && value === val(task),
        }"
        @click="
          $emit(
            'input',
            forceShowAll
              ? clearable && value === val(task)
                ? null
                : val(task)
              : !isUnset(value)
              ? null
              : val(task)
          );
          $emit(
            'change',
            forceShowAll
              ? clearable && value === val(task)
                ? null
                : val(task)
              : !isUnset(value)
              ? null
              : val(task)
          );
          signalUpdate();
        "
      >
        <div class="d-flex align-center mnh">
          <div
            class="me-2 -thin -gray flex-grow-0"
            :class="{ 'avatar-gradient': val(task) === value }"
          >
            <v-sheet
              v-if="val(task) === value"
              class="circle-check zoomIn"
              :color="color"
            ></v-sheet>
            <v-icon v-else :color="dark ? '#fff' : color"
              >radio_button_unchecked</v-icon
            >
          </div>
          <div class="flex-grow-1">
            <span v-if="task.color">
              <v-icon small>{{ ProductVariants.color.icon }}</v-icon>
              <small class="mx-1">{{ $t(ProductVariants.color.name) }}</small>
              <b>{{ GetNameOfColor(task.color) }}</b>
            </span>

            <span v-if="task.style">
              <v-icon small>{{ ProductVariants.style.icon }}</v-icon>
              <small class="mx-1">{{ $t(ProductVariants.style.name) }}</small>
              <b>{{ task.style }}</b>
            </span>

            <span v-if="task.volume">
              <v-icon small>{{ ProductVariants.volume.icon }}</v-icon>
              <small class="mx-1">{{ $t(ProductVariants.volume.name) }}</small>
              <b>{{ task.volume }}</b>
            </span>

            <span v-if="task.weight">
              <v-icon small>{{ ProductVariants.weight.icon }}</v-icon>
              <small class="mx-1">{{ $t(ProductVariants.weight.name) }}</small>
              <b>{{ task.weight }}</b>
            </span>

            <span v-if="task.pack">
              <v-icon small>{{ ProductVariants.pack.icon }}</v-icon>
              <small class="mx-1">{{ $t(ProductVariants.pack.name) }}</small>
              <b>{{ task.pack }}</b>
            </span>

            <span v-if="task.type">
              <v-icon small>{{ ProductVariants.type.icon }}</v-icon>
              <small class="mx-1">{{ $t(ProductVariants.type.name) }}</small>
              <b>{{ task.type }}</b>
            </span>

            <small
              v-if="
                !task.color &&
                !task.style &&
                !task.volume &&
                !task.weight &&
                !task.pack &&
                !task.type
              "
            >
              Please ensure the variant has at least one valid property such as
              color.
            </small>
          </div>

          <v-icon v-if="task.color" :color="task.color">circle</v-icon>
        </div>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>
import { ProductVariants } from "../../../core/enums/product/ProductVariants";

export default {
  name: "VSmartVariantSelect",
  props: {
    value: {},

    variants: {
      require: true,
    },

    label: {},
    hint: {},

    forceShowAll: {
      default: false,
      type: Boolean,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    dark: {
      default: false,
      type: Boolean,
    },
    color: { default: "primary" },

    readonly: {
      default: false,
      type: Boolean,
    },
    border: {
      default: false,
      type: Boolean,
    },
    rounded: {
      // Rounded avatar
      default: false,
      type: Boolean,
    },

    clearable: {
      default: false,
      type: Boolean,
    },
  },

  data: function () {
    return {
      ProductVariants: ProductVariants,
    };
  },

  computed: {
    items_show() {
      if (this.forceShowAll) return this.variants;
      if (this.isUnset(this.value)) return this.variants;
      const out = this.variants.filter((item) => this.val(item) === this.value);
      return out.length ? out : this.variants;
    },
  },
  watch: {},

  methods: {
    signalUpdate() {
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },

    val(task) {
      return task.id;
    },

    isUnset(value) {
      return value === null || value === undefined;
    },
  },
};
</script>

<style scoped lang="scss">
.mnh {
  min-height: 40px;
}
.circle-check {
  animation-duration: 250ms;
  width: 20px;
  height: 20px;
  margin: 2px;
  border-radius: 50%;
}
</style>
