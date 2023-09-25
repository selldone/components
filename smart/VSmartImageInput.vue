<template>
  <div class="text-start" :class="{ disabled: disabled }">
    <v-expand-transition>
      <v-list-item v-if="value" :dark="dark" key="1">
        <v-list-item-avatar rounded>
          <v-img :src="getShopImagePath(value)"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ label }}</v-list-item-title>
          <v-list-item-subtitle>{{ hint }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn @click="$emit('input', null) /*Clear image*/" icon color="red"
            ><v-icon>close</v-icon></v-btn
          >
        </v-list-item-action>
      </v-list-item>
      <v-file-input
        v-else
        key="2"
        :value="file"
        @change="(val) => $emit('update:file', val)"
        color="primary"
        :label="label"
        :placeholder="hint"
        prepend-inner-icon="image"
        prepend-icon=""
        accept="image/*"
        show-size
        :messages="message"
        :dark="dark"
      />
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  name: "VSmartImageInput",
  components: {},
  props: {
    file: {},
    value: {}, // Save value on database (path of image)

    label: {},
    hint: {},

    disabled: {
      default: false,
      type: Boolean,
    },

    dark: {
      default: false,
      type: Boolean,
    },
    message:{default:'Max image size: 2MB'}
  },
  computed: {},

  methods: {},
};
</script>

<style scoped lang="scss"></style>
