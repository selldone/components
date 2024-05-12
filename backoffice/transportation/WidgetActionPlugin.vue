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
  <div style="height: 100%" >
    <s-widget
      :class="[small ? 'm-1' : '', dark ? 'widget-dark' : '']"
      :style="`background: ${color}`"
      :title="`<h5 class='align-items-center pb-1'>    <span class='circle ${class_state} mr-sm' style='font-size: 6px;'></span>  ${title_big}<span class='fw-normal ml-xs small'> ${title}</span>  </h5>`"
      body-class="p-0 mt"
      class="text-right widget-hover-dark pointer-pointer"
      custom-header
      style="border-radius: 8px; min-height: 160px; height: inherit"
    >
      <h4 v-if="!active">Waiting...</h4>

      <div class="text-center" style="position: absolute; top: 12px; left: 8px">
        <v-img
          :height="small ? 16 : 24"
          :src="icon"
          class="mx-2 pointer-pointer"
          contain
          width="48px"
          @mouseleave="show_description = false"
          @mouseover="show_description = true"
        />
        <p
          :class="plugin.enable ? 'text-success' : 'text-danger'"
          class="small pt-2 m-0"
        >
          {{
            plugin.enable
              ? $t("global.commons.active")
              : $t("global.commons.inactive")
          }}
        </p>
      </div>

      <div v-if="!show_description" class="mb-2">
        <v-btn
          v-if="false"
          :dark="dark"
          icon
          @click="$emit('selectDelete', plugin)"
          @click.stop
        >
          <v-icon color="#D32F2F"> delete</v-icon>
        </v-btn>

        <v-btn :dark="dark" icon @click="goToEditPlugin(plugin)" @click.stop>
          <v-icon :color="dark ? '#fff' : '#444'"> edit</v-icon>
        </v-btn>

        <v-btn
          v-if="url"
          :dark="dark"
          :href="url"
          icon
          rel="nofollow"
          target="_blank"
          @click.stop
        >
          <v-icon :color="dark ? '#fff' : '#444'"> link</v-icon>
        </v-btn>
      </div>

      <div
        v-if="extended && !show_description"
        class="border-top pt-2 text-truncate small"
      >
        <!-- Public Keys -->

        <div v-for="item in pluginInfo.public" :key="item.name">
          <p>
            <i
              v-if="plugin.public[item.name]"
              class="fas fa-check text-primary"
            />
            <i v-else class="fas fa-times text-danger" />

            {{ item.title }}
          </p>
        </div>

        <!-- Private Keys -->
        <div v-for="item in pluginInfo.private" :key="item.name">
          <p>
            <i
              v-if="plugin.private[item.name]"
              class="fas fa-check text-success"
            />
            <i v-else class="fas fa-times text-danger" />

            {{ item.title }}
          </p>
        </div>
      </div>
      <v-slide-y-reverse-transition hide-on-leave>
        <p v-if="show_description">
          {{ description }}
        </p>
      </v-slide-y-reverse-transition>

      <!-- Extra info -->

      <div>
        <slot name="extra-info" />
      </div>
    </s-widget>
  </div>
</template>

<script>
export default {
  name: "WidgetActionPlugin",
  components: {},
  props: {
    plugin: {
      required: true,
      type: Object,
    },

    dark: {
      required: false,
      default: false,
      type: Boolean,
    },
    color: {
      required: false,
      default: "white",
      type: String,
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
    iconColor: {
      required: false,
      type: String,
      default: "#333",
    },
    active: {
      required: false,
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      show_description: false,
    };
  },
  computed: {
    /*  pluginInfo() {
      return ShopPlugins[this.plugin.name];
    },
    icon() {
      return this.pluginInfo.icon;
    },
    url() {
      return this.pluginInfo.url;
    },

    title() {
      return this.pluginInfo.category.name;
    },

    title_big() {
      return this.pluginInfo.name;
    },
*/
    title_big_span() {
      return this.plugin.enable ? "فعال" : "غیر فعال";
    },

    /*description() {
      return this.pluginInfo.description;
    },*/

    class_state() {
      return this.plugin.enable ? "bg-success" : "bg-danger"; //bg-warning
    },
  },
  created() {
    if (!this.plugin.public) this.plugin.public = {};

    if (!this.plugin.private) this.plugin.private = {};

    if (!this.plugin.info) this.plugin.info = {};
  },
  mounted() {},
  methods: {
    goToEditPlugin(plugin) {
      this.$router.push({
        name: "BPageShopDashboard",
        params: { shop_id: this.$route.params.shop_id },
        hash: "#plugins",
        query: { plugin_id: plugin.id },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.plugin-name {
  font-weight: 600;
  font-size: 1.2em;
}
</style>
