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
  <v-dialog
    v-model="map_dialog"
    :scrim="false"
    content-class="bg-map"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <u-map-view
      v-if="map_load"
      v-model="map_location"
      v-model:center="center"
      :address-type="$t('global.map.address')"
      :can-select-address="!view_only"
      :color="SaminColorDark"
      :confirm-text="$t('global.map.confirm')"
      :has-address-book="!view_only"
      :receptor-type="$t('global.map.receptor')"
      :startup-mode="startup_mode_map_dialog"
      :title="$t('global.map.title')"
      :viewOnly="view_only"
      :zoom="17"
      has-bottom-bar
      has-top-bar
      show-search-box
      style="width: 100%; height: 100%"
      @clickSetLocation="onClickSetLocation"
      @close="map_dialog = false"
    />
  </v-dialog>
</template>

<script>
import { EventName } from "@selldone/core-js/events/EventBus";

export default {
  name: "UMapDialog",
  components: {},
  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Props
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  props: {},
  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Data
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  data: () => ({
    map_dialog: false,
    map_load: false,
    center: { lat: 35.715298, lng: 51.404343 },
    startup_mode_map_dialog: "default",
    map_location: {},
    onClickSetLocation: null,
    view_only: false,
  }),

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Compute Section
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  computed: {},
  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Watch Section
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  watch: {},
  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Component Lifecycle
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  created() {
    this.EventBus.$on(
      EventName.SHOW_MAP,
      ({ center, mode, location, selectCallback, viewOnly }) => {
        this.map_load = true;
        this.center = center;
        this.startup_mode_map_dialog = mode;
        this.map_location = location;
        this.onClickSetLocation = selectCallback;
        this.map_dialog = true;
        this.view_only = viewOnly;
      },
    );
    this.EventBus.$on(EventName.HIDE_MAP, () => {
      this.map_dialog = false;
      setTimeout(() => {
        this.map_load = false;
      }, 150);
    });
  },
  mounted() {},
  beforeUnmount() {
    this.EventBus.$off(EventName.SHOW_MAP);
    this.EventBus.$off(EventName.HIDE_MAP);
  },

  methods: {},
};
</script>

<style lang="scss"></style>
