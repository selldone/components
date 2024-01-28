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
      tag="div"
      group
      class="border-between-vertical rounded-card"
      :class="{
        'disabled pen': disabled,
        border: border,
        'white--text': dark,
        'shadow-colored -no-after position-relative s--shadow-no-padding':
          decorative,
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
          pen: !clearable && forceShowAll && localModelValue === val(task),
        }"
        :style="{ backgroundColor: backgroundColor }"
        @click="onClickItem(task)"
      >
        <div class="d-flex align-center mnh">
          <div
            class="me-2 -thin -gray flex-grow-0"
            :class="{ 'avatar-gradient': val(task) === localModelValue }"
          >
            <v-sheet
              v-if="val(task) === localModelValue"
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
            <div
              v-if="itemDescription"
              class="op-0-7 small"
            >
              {{
                isFunction(itemDescription)
                  ? itemDescription(task)
                  : $t(task[itemDescription]??'')
              }}
            </div>

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
          >
            <img
              :src="isFunction(itemImage) ? itemImage(task) : task[itemImage]"
          /></v-avatar>
        </div>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from "vue";

export default {
  name: "SSmartSelect",
  emits: ["change", "update:modelValue"],
  props: {
    modelValue: {},
    items: { type: Array },
    itemValue: {},
    itemText: {},
    itemDescription: {},
    itemIcon: {},
    itemImage: {},
    label: {},
    hint: {},
    forceShowAll: { default: false, type: Boolean },
    disabled: { default: false, type: Boolean },
    dark: { default: false, type: Boolean },
    color: { default: "primary" },
    grayUnselected: { default: false, type: Boolean },
    readonly: { default: false, type: Boolean },
    border: { default: false, type: Boolean },
    rounded: { default: false, type: Boolean },
    clearable: { default: false, type: Boolean },
    decorative: { default: false, type: Boolean },
    backgroundColor: {},
    loading: { default: false, type: Boolean },
  },
  setup(props, { emit }) {
    // Local reactive state that mirrors `modelValue`
    const localModelValue = ref(props.modelValue);

    // Watch for changes in `modelValue` prop and update local state
    watch(
      () => props.modelValue,
      (newValue) => {
        localModelValue.value = newValue;
      },
    );
    // Update `modelValue` when local state changes
    const updateModelValue = (newValue) => {
      localModelValue.value = newValue;
      emit("update:modelValue", newValue);
      nextTick(() => {
        emit("change", newValue);
      });
    };

    const items_show = computed(() => {
      if (props.forceShowAll) return props.items;
      if (isUnset(localModelValue)) return props.items;
      const out = props.items.filter(
        (item) => val(item) === localModelValue.value,
      );
      return out.length ? out : props.items;
    });

    const val = (task) => {
      return props.itemValue ? task[props.itemValue] : task;
    };

    const title = (task) => {

      return !props.itemText
        ? task
        : typeof props.itemText === "function"
          ? props.itemText(task)
          : $t(task[props.itemText]);
    };

    const isUnset = (value) => {
      return value === null || value === undefined;
    };

    const onClickItem = (task) => {
      const _new_value = props.forceShowAll
        ? props.clearable && localModelValue.value === val(task)
          ? null
          : val(task)
        : !isUnset(localModelValue.value)
          ? null
          : val(task);

      updateModelValue(_new_value);
    };

    return {
      localModelValue,
      items_show,
      val,
      title,
      isUnset,
      onClickItem,
    };
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
