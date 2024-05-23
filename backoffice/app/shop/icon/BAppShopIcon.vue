<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <div class="position-relative shake-container">
    <v-btn
      v-if="!shopApp.app.enable"
      class="absolute-top-end z1 shake-target"
      color="red"
      icon
      size="x-small"
      variant="flat"
      @click="deleteApp(shopApp.app.code)"
    >
      <v-icon size="small">delete</v-icon>
    </v-btn>

    <v-img
      :class="{ disabled: !shopApp.app.enable }"
      :height="image_size"
      :src="getShopImagePath(shopApp.app.icon, 128)"
      :width="image_size"
      class="card-white hover-able pointer-pointer"
      @click="
        $router.push({
          name: 'BPageApplication',
          params: { app_code: shopApp.app.code },
        })
      "
    />
    <p
      :class="small ? 'limited-text-64px' : 'limited-text-100px'"
      class="m-1 small text-center"
    >
      <i
        v-if="shopApp.app.enable && !small"
        :class="shopApp.enable ? 'text-success' : 'text-danger'"
        class="fas fa-circle"
      />
      {{ shopApp.app.name }}
      <small v-if="!shopApp.app.enable">({{ $t("apps_list.inactive") }})</small>
    </p>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "BAppShopIcon",
  props: {
    shop: {
      required: true,
    },
    shopApp: {
      required: true,
    },
    small: Boolean,
  },

  data: () => ({
    busy_delete: false,
  }),

  computed: {
    image_size() {
      return this.small ? 64 : 96;
    },
  },

  methods: {
    deleteApp(app_code) {
      this.openDangerAlert(
        "Delete app",
        "Do you want to remove this app from your store?",
        "Delete",
        () => {
          this.busy_delete = true;
          axios
            .delete(window.API.DELETE_APP(this.shop.id, app_code))
            .then(({ data }) => {
              if (!data.error) {
                this.showSuccessAlert(null, `Application deleted.`);
                this.$emit("delete", data.id);
              } else {
                this.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = false;
            });
        },
      );
    },
  },
});
</script>

<style lang="scss" scoped></style>
