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
  <div class="m-2">
    <v-btn
      v-if="!action && editMode"
      variant="flat"
      @click="
        $emit('update:action', {
          text: 'View more',
          dark: true,
          xlarge: true,
          rounded: true,
        })
      "
    >
      <v-icon>add</v-icon>
      Add action
    </v-btn>

    <v-btn
      v-if="action"
      :color="
        action.color
          ? action.color
          : structure.colored
            ? structure.colored
            : structure.color_2
      "
      :href="editMode ? undefined : action.href"
      :rounded="action.rounded"
      :size="action.large ? 'large' : action.xlarge ? 'x-large' : undefined"
      :variant="
        action.depressed ? 'flat' : action.outline ? 'outlined' : undefined
      "
      class="m-2"
      target="_blank"
      @click="
        editMode
          ? showEdit(
              EmailOptionsHelper.GenerateActionButtonOptions(action, () => {
                if (inArray) {
                  removeItemToList(inArray, action);
                } else {
                  $emit('update:action', null);
                }
                $emit('delete');
              }),
            )
          : undefined
      "
      >{{ action.text }}

      <b-email-marketing-track-spot
        v-if="trackingMode && action.tracking"
        class="zoomIn"
        label="click"
      ></b-email-marketing-track-spot>
    </v-btn>
  </div>
</template>

<script lang="ts">
import BEmailMarketingTrackSpot from "../../../email-marketing/track-spot/BEmailMarketingTrackSpot.vue";
import { EmailOptionsHelper } from "../section/options/EmailOptionsHelper.ts";

export default {
  name: "BEmailMarketingEditorButton",
  computed: {
    EmailOptionsHelper() {
      return EmailOptionsHelper;
    },
  },
  components: { BEmailMarketingTrackSpot },
  emits: ["update:action", "delete", "show-edit"],
  props: {
    structure: {
      require: true,
    },
    action: {},
    trackingMode: {},
    editMode: {},
    inArray: {},
  },
  methods: {
    showEdit(pack) {
      this.$emit("show-edit", pack);
    },
    removeItemToList(list, item) {
      const index = list.indexOf(item);
      if (index >= 0) {
        list.splice(index, 1);
      }
    },
  },
};
</script>

<style scoped></style>
