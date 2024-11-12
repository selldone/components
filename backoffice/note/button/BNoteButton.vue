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
  <span>
    <v-btn
      v-if="note && note.length"
      :color="activeColor"
      icon
      size="36"
      variant="text"
      @click.stop="$emit('click')"
      ><v-icon size="24">sticky_note_2</v-icon>

      <v-tooltip
        activator="parent"
        content-class="bg-black text-start"
        max-width="460"
        min-width="240"
      >
        <div class="d-flex align-center pt-2">
          <v-avatar :size="32" class="avatar-gradient -thin -staff me-2">
            <v-img :src="getUserAvatar(note[note.length - 1].user_id)" />
          </v-avatar>
          <div class="flex-grow-1">
            <b>{{ note[note.length - 1].user_name }}</b>
            <span class="d-block small"
              >{{ getFromNowString(note[note.length - 1].date) }}
              ●
              {{ getLocalDateString(note[note.length - 1].date) }}</span
            >
          </div>
        </div>
        <div class="typo-body my-2">
          {{ note[note.length - 1].body.limitWords(20) }}
        </div>
      </v-tooltip>
    </v-btn>

    <v-btn
      v-else
      :title="$t('notes.add_action')"
      icon
      size="small"
      variant="text"
      @click.stop="$emit('click')"
      ><v-icon size="24">edit_note</v-icon></v-btn
    >
  </span>
</template>

<script lang="ts">
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BNoteButton",
  mixins: [DateMixin],

  props: {
    note: {},
    activeColor: { default: "orange" },
  },
};
</script>

<style scoped></style>
