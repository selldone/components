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
  <Widget
    class="text-start font-weight-normal"
    :title="title"
    :subTitle="subTitle"
    body-class="p-0 mt"
    custom-header
    :class="[small ? 'm-1' : '', dark ? 'widget-dark' : '']"
    :style="`background: ${color}`"
    :dark="dark"
  >
    <template v-slot:top-left>
      <component v-bind:is="iconTo ? 'router-link' : 'span'" :to="iconTo">
        <v-icon
          v-if="icon"
          :size="small ? '16px' : '24px'"
          class="mx-2"
          :color="dark ? '#fff' : iconColor"
          :class="{ '-hover': iconTo }"
        >
          {{ icon }}
        </v-icon>
      </component>

      <v-btn v-if="hasEditButton" icon @click="$emit('edit')">
        <v-icon small> fas fa-edit </v-icon>
      </v-btn>

      <v-avatar v-if="src" size="24" tile><v-img :src="src"></v-img></v-avatar>

      <slot name="top-left" />
    </template>

    <h4 v-if="!active">Waiting...</h4>

    <router-link v-if="badge" :to="toBadge">
      <v-badge v-if="small" pill class="float-right p-1 small" color="primary">
        {{ badge }}
      </v-badge>

      <v-badge v-else pill class="float-right p-2" color="primary">
        {{ badge }}
      </v-badge>
    </router-link>

    <h4
      v-if="titleBig"
      class="fw-semi-bold ml-lg mb-lg"
      :class="small ? 'small' : ''"
    >
      <span v-html="titleBig" />
      <small class="me-2">{{ titleBigSpan }}</small>
    </h4>
    <slot name="actions" />

    <slot />

    <v-flex d-flex wrap class="justify-content-between" />

    <div class="border-top mt-3" v-if="extended">
      <v-spacer></v-spacer>

      <slot name="footer" />
    </div>
  </Widget>
</template>

<script>
export default {
  name: "WidgetInfoBox",
  components: {},
  props: {
    title: {
      type: String,
    },
    subTitle: {
      type: String,
    },
    titleBig: {
      required: false,
      type: String,
    },
    titleBigSpan: {
      required: false,
      type: String,
    },
    active: {
      default: true,
      type: Boolean,
    },

    small: {
      required: false,
      default: false,
      type: Boolean,
    },
    extended: {
      required: false,
      default: false,
      type: Boolean,
    },

    badge: {
      required: false,
      type: String,
    },
    toBadge: {
      required: false,
      type: Object,
    },

    icon: {
      required: false,
      type: String,
    },
    iconColor: {
      required: false,
      type: String,
      default: "#333",
    },
    iconTo: {},
    iconCaption: {},

    dark: {
      required: false,
      default: false,
      type: Boolean,
    },
    color: {
      required: false,
      default: "#f0f0f0",
      type: String,
    },

    hasEditButton: {
      required: false,
      default: false,
      type: Boolean,
    },

    src: {},
  },

  data() {
    return {};
  },
  computed: {},
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
::v-deep h6 {
  font-size: 1.1rem;
}
.-hover {
  transition: color 0.3s ease-in-out;
  &:hover {
    color: #0f75ac !important;
  }
}
</style>
