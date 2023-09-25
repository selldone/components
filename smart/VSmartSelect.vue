<template>
  <div :class="{ dark: dark, pen: readonly }" class="text-start">
    <h3 v-if="label" class="my-2">{{ label }}</h3>
    <v-subheader v-if="hint">{{ hint }}</v-subheader>

    <v-slide-y-transition
      tag="div"
      group
      class="border-between-vertical rounded-card"
      :class="{
        'disabled pen': disabled,
        border: border,
        'white--text': dark,
        'shadow-colored -no-after position-relative s--shadow-no-padding': decorative,
        pen: loading,
      }"
      hide-on-leave
    >
      <div
        v-for="(task, i) in items_show"
        :key="val(task) && isString(val(task)) ? val(task) : i"
        class="p-2 pp row-hover usn"
        :class="{
          'bg-dark': dark && !backgroundColor,
          'bg-white': !dark && !backgroundColor,
          'disabled pen': task.disabled,
          pen: !clearable && forceShowAll && value === val(task),
        }"
        :style="{ backgroundColor: backgroundColor }"
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
          $nextTick(() => {
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
          });
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
            >
              <!-- Loading -->
              <v-progress-circular
                v-if="loading"
                :color="'#fff'"
                class="center-absolute"
                indeterminate
                :size="14"
                :width="3"
              ></v-progress-circular>
            </v-sheet>
            <v-icon
              v-else
              :color="dark ? '#fff' : grayUnselected ? '#333' : color"
              >radio_button_unchecked</v-icon
            >
          </div>
          <div class="flex-grow-1">
            <slot name="prepend-title" :item="task"> </slot>
            <b v-html="title(task)"> </b>
            <slot name="append-title" :item="task"> </slot>
            <v-subheader
              v-if="itemDescription"
              style="height: auto"
              class="p-0"
            >
              {{
                isFunction(itemDescription)
                  ? itemDescription(task)
                  : $t(task[itemDescription])
              }}
            </v-subheader>

            <slot name="description" :item="task"> </slot>
          </div>

          <v-icon
            v-if="
              itemIcon &&
              (isFunction(itemIcon) ? itemIcon(task) : task[itemIcon])
            "
            :dark="dark"
            >{{
              isFunction(itemIcon) ? itemIcon(task) : task[itemIcon]
            }}</v-icon
          >
          <v-avatar
            v-if="isFunction(itemImage) ? itemImage(task) : task[itemImage]"
            size="24"
            :rounded="rounded"
            ><img
              :src="isFunction(itemImage) ? itemImage(task) : task[itemImage]"
          /></v-avatar>
        </div>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>
export default {
  name: "VSmartSelect",
  props: {
    value: {},
    items: { type: Array },
    itemValue: {
      required: false,
    },
    itemText: {
      // can be string or function
      required: false,
    },
    itemDescription: {}, // can be string or function
    itemIcon: {},
    itemImage: {},
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
    grayUnselected: {
      default: false,
      type: Boolean,
    },
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
    decorative: {
      default: false,
      type: Boolean,
    },

    backgroundColor: {},
    loading: {
      default: false,
      type: Boolean,
    },
  },

  data: function () {
    return {};
  },

  computed: {
    items_show() {
      if (this.forceShowAll) return this.items;
      if (this.isUnset(this.value)) return this.items;
      const out = this.items.filter((item) => this.val(item) === this.value);
      return out.length ? out : this.items;
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
      return this.itemValue ? task[this.itemValue] : task;
    },
    title(task) {
      return !this.itemText
        ? task
        : typeof this.itemText === "function"
        ? this.itemText(task)
        : this.$t(task[this.itemText]);
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
