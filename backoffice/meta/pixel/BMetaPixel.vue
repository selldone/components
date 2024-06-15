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
  <div class="widget-box">
    <s-widget-header
      :src="require('../../../assets/trademark/facebook.svg')"
      title="Facebook pixel"
    >
    </s-widget-header>

    <v-list-subheader
      >The Facebook pixel is a valuable analytical instrument that enables you
      to assess the impact of your advertisements by comprehending the
      activities users perform on your website.
    </v-list-subheader>

    <v-text-field
      v-model="tag_manager_id"
      :append-inner-icon="lock ? 'lock' : 'lock_open'"
      :readonly="lock"
      label="Facebook Pixel ID"
      placeholder="############"
      variant="underlined"
      @update:model-value="change = true"
      @click:append-inner="lock = !lock"
      :disabled="!writeShopAccess(ShopPermissionRegions.CHANNELS.code)"
    >
    </v-text-field>

    <v-expand-transition>
      <div v-if="change" class="widget-buttons">
        <v-btn
          :loading="busy_set"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="setFacebookPixelID()"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save_changes") }}
        </v-btn>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import {ShopPermissionRegions} from "@selldone/core-js/enums/permission/ShopPermissions";

export default {
  name: "BMetaPixel",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    tag_manager_id: "",
    busy_set: false,
    change: false,
    lock: false,
  }),
  computed: {
    ShopPermissionRegions() {
      return ShopPermissionRegions
    }
  },

  watch: {},

  created() {
    let facebookPixelPlugin = this.shop.plugins.find(
      (item) => item.name === "FacebookPixel",
    );

    this.tag_manager_id =
      facebookPixelPlugin && facebookPixelPlugin.setting
        ? facebookPixelPlugin.setting.id
        : null;

    this.lock = !!this.tag_manager_id;
  },

  methods: {
    setFacebookPixelID() {
      this.busy_set = true;

      axios
        .put(
          window.API.POST_SHOP_PLUGIN_SET_CONFIG(this.shop.id, "FacebookPixel"),
          {
            setting: {
              id: this.tag_manager_id,
            },
            enable: !!this.tag_manager_id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.shop.plugins, data.plugin);
            this.showSuccessAlert(null, "Set Facebook pixel ID.");
            this.change = false;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
