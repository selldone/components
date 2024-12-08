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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-bottom-sheet
    :model-value="modelValue"
    @update:model-value="(v) => $emit('update:modelValue', v)"
    width="840"
    max-width="98vw"
    scrollable
    content-class="rounded-t-xl"
  >
    <v-card rounded="t-xl" class="text-start">
      <v-card-title>
        <v-icon class="me-2">auto_awesome</v-icon>
        {{ $t("global.commons.automation") }}

        |
        <img
          v-if="type"
          :src="type.basket"
          width="24"
          height="24"
          class="mx-1"
        />
        {{ $t(type.name) }}
      </v-card-title>
      <v-card-text>
        <div class="widget-box mb-5">
          <u-widget-header title="Daily Email" icon="email"></u-widget-header>

          <v-list-subheader
            >Automatically send received order notifications to the designated
            email address. Only staff members can be added to receive order
            notifications. To manage staff permissions, go to the Access > Staff
            tab and assign custom permissions as needed.
          </v-list-subheader>

          <u-smart-toggle
            v-model="enable"
            true-title="Enabled"
            false-title="Disabled"
            false-gray
          ></u-smart-toggle>

          <s-user-input
            v-model="selected_user"
            :label="$t('global.commons.receiver')"
            :staff-of-shop-id="shop.id"
            persistent-placeholder
          >
          </s-user-input>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="$emit('update:modelValue', false)"
            prepend-icon="close"
          >
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            size="x-large"
            variant="elevated"
            color="primary"
            @click="saveChange()"
            prepend-icon="save"
            :loading="busy"
          >
            {{ $t("global.actions.save") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import SUserInput from "@selldone/components-vue/backoffice/user/input/SUserInput.vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";

export default {
  name: "BProcessCenterAutomation",
  components: { USmartToggle, SUserInput, UWidgetHeader },
  props: {
    modelValue: {},

    shop: {
      required: true,
    },
    type: {
      required: true,
      type: Object,
    },
  },

  data: function () {
    return {
      selected_user: null,
      enable: false,

      busy: false,
    };
  },
  computed: {
    preferences() {
      return this.shop.preferences;
    },
  },
  watch: {},
  created() {
    this.selected_user = this.preferences?.bulk_user?.email;
    this.enable = !!this.preferences?.bulk_enable;
  },

  methods: {
    saveChange() {
      this.busy = true;
      axios
        .put(window.API.SET_SHOP_PREFERENCES(this.shop.id), {
          key: "bulk",
          email: this.selected_user,
          enable: this.enable,
        })
        .then(({ data }) => {
          if (data.error) {
            return NotificationService.showErrorAlert(null, data.error_msg);
          }
          Object.assign(this.shop.preferences, data.preferences);

          NotificationService.showSuccessAlert(
            null,
            "Successfully saved changes.",
          );
          this.$emit("update:modelValue", false);
        })
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
