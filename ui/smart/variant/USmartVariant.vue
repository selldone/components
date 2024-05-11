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

<template>
  <div :class="{ dark: dark, pen: readonly }" class="text-start">
    <h3 v-if="label" class="my-2">{{ label }}</h3>
    <v-list-subheader v-if="hint">{{ hint }}</v-list-subheader>

    <v-slide-y-transition
      :class="{ pen: disabled, border: border, 'text-white': dark }"
      class="border-between-vertical rounded-card"
      group
      hide-on-leave
      tag="div"
    >
      <div
        v-for="(task, i) in items_show"
        :key="val(task) ? val(task) : i"
        :class="{
          'bg-dark': dark,
          'bg-white': !dark,
          'disabled pen': task.disabled,
          pen: !clearable && forceShowAll && modelValue === val(task),
        }"
        class="p-2 pp row-hover usn"
        @click="
          $emit(
            'update:modelValue',
            forceShowAll
              ? clearable && modelValue === val(task)
                ? null
                : val(task)
              : !isUnset(modelValue)
                ? null
                : val(task),
          );
          $emit(
            'change',
            forceShowAll
              ? clearable && modelValue === val(task)
                ? null
                : val(task)
              : !isUnset(modelValue)
                ? null
                : val(task),
          );
          signalUpdate();
        "
      >
        <div class="d-flex align-center mnh">
          <div
            :class="{ 'avatar-gradient': val(task) === modelValue }"
            class="me-2 -thin -gray flex-grow-0"
          >
            <v-sheet
              v-if="val(task) === modelValue"
              :color="color"
              class="circle-check zoomIn"
            ></v-sheet>
            <v-icon v-else :color="dark ? '#fff' : color"
              >radio_button_unchecked
            </v-icon>
          </div>
          <div class="flex-grow-1">
            <span v-if="task.color" class="me-1">
              <v-icon size="small">{{ ProductVariants.color.icon }}</v-icon>
              <small class="mx-1">{{ $t(ProductVariants.color.name) }}</small>
              <b>{{ GetNameOfColor(task.color) }}</b>
            </span>

            <span v-if="task.style" class="me-1">
              <v-icon size="small">{{ ProductVariants.style.icon }}</v-icon>
              <small class="mx-1">{{ $t(ProductVariants.style.name) }}</small>

              <u-variant-asset-image
                :shop-id="shop.id"
                :size="24"
                :value="task.style"
              ></u-variant-asset-image>

              <b>
                {{ task.style.removeVariantAsset() }}
              </b>
            </span>

            <span v-if="task.volume" class="me-1">
              <v-icon size="small">{{ ProductVariants.volume.icon }}</v-icon>
              <small class="mx-1">{{ $t(ProductVariants.volume.name) }}</small>

              <u-variant-asset-image
                :shop-id="shop.id"
                :size="24"
                :value="task.volume"
              ></u-variant-asset-image>

              <b>
                {{ task.volume.removeVariantAsset() }}
              </b>
            </span>

            <span v-if="task.weight" class="me-1">
              <v-icon size="small">{{ ProductVariants.weight.icon }}</v-icon>
              <small class="mx-1">{{ $t(ProductVariants.weight.name) }}</small>

              <u-variant-asset-image
                :shop-id="shop.id"
                :size="24"
                :value="task.weight"
              ></u-variant-asset-image>

              <b>
                {{ task.weight.removeVariantAsset() }}
              </b>
            </span>

            <span v-if="task.pack" class="me-1">
              <v-icon size="small">{{ ProductVariants.pack.icon }}</v-icon>
              <small class="mx-1">{{ $t(ProductVariants.pack.name) }}</small>

              <u-variant-asset-image
                :shop-id="shop.id"
                :size="24"
                :value="task.pack"
              ></u-variant-asset-image>

              <b>
                {{ task.pack.removeVariantAsset() }}
              </b>
            </span>

            <span v-if="task.type" class="me-1">
              <v-icon size="small">{{ ProductVariants.type.icon }}</v-icon>
              <small class="mx-1">{{ $t(ProductVariants.type.name) }}</small>

              <u-variant-asset-image
                :shop-id="shop.id"
                :size="24"
                :value="task.type"
              ></u-variant-asset-image>

              <b>
                {{ task.type.removeVariantAsset() }}
              </b>
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
          <v-icon v-if="disabled" class="ma-1" size="x-small">lock</v-icon>

          <u-color-circle
            v-if="task.color"
            :color="task.color"
            :size="24"
            class="circle-border m-1"
          >
          </u-color-circle>
        </div>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>
import { ProductVariants } from "@selldone/core-js/enums/product/ProductVariants";
import UVariantAssetImage from "@components/ui/variant/asset/image/UVariantAssetImage.vue";
import UColorCircle from "@components/ui/color/circle/UColorCircle.vue";

export default {
  name: "USmartVariant",
  components: { UColorCircle, UVariantAssetImage },
  emits: ["update:modelValue", "change"],
  props: {
    shop: {
      require: true,
      type: Object,
    },
    modelValue: {},

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
      if (this.isUnset(this.modelValue)) return this.variants;
      const out = this.variants.filter(
        (item) => this.val(item) === this.modelValue,
      );
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

<style lang="scss" scoped>
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
