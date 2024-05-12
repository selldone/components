<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <div class="widget-box ">
    <s-widget-header
      :src="require('../../../assets/trademark/google-tag-manager.svg')"
      title="Tag Manager"
    >
    </s-widget-header>

    <v-list-subheader>
      Google Analytics enables measurement of ad ROI while tracking Flash,
      video, and social media sites and apps. Manage website tags effortlessly
      with Google Tag Manager's free, simple, and reliable solutions—no code
      editing required.
    </v-list-subheader>

    <v-text-field
      v-model="tag_id"
      class="max-width-field-large mx-auto"
      label="Google Tag Manger ID"
      placeholder="GTM-######## or G-######## or AW-########"
      variant="underlined"
      @update:model-value="change = true"
      :append-inner-icon="lock ? 'lock' : 'lock_open'"
      @click:append-inner="lock = !lock"
      :readonly="lock"
    >
    </v-text-field>

    <v-expand-transition>
      <div v-if="change" class="widget-buttons">
        <v-btn
          :loading="loading_set_id"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="setGoogleTagManagerID()"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save_changes") }}
        </v-btn>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>

export default {
  name: "BGoogleTagManager",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    tag_id: "",
    change: false,
    lock: false,

    loading_set_id: false,
  }),
  computed: {},

  watch: {},

  created() {
    // console.log("this.shop.plugins", this.shop.plugins);
    let tagManagePlugin = this.shop.plugins.find(
      (item) => item.name === "TagManager",
    );


    this.tag_id =
      tagManagePlugin && tagManagePlugin.setting
        ? tagManagePlugin.setting.id
        : null;

    this.lock = !!this.tag_id;
  },

  methods: {
    setGoogleTagManagerID() {
      this.loading_set_id = true;

      axios
        .put(
          window.API.POST_SHOP_PLUGIN_SET_CONFIG(this.shop.id, "TagManager"),
          {
            setting: {
              id: this.tag_id,
            },
            enable: !!this.tag_id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.shop.plugins, data.plugin);
            this.showSuccessAlert(null, "Set tag manager ID.");
            this.change=false;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.loading_set_id = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
