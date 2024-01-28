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
  <span>
    <v-tooltip
      v-if="note && note.length"
      color="#111"
      max-width="460"
      min-width="240"
    >
      <template v-slot:activator="{ props }">
        <v-btn

          v-bind="props"
          icon variant="text" size="36"
          :color="activeColor"
          @click.stop="$emit('click')"
          ><v-icon size="24">sticky_note_2</v-icon></v-btn
        >
      </template>
      <div class="pa-2 text-start rounded-lg">
        <div class="d-flex align-center">
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
      </div>
    </v-tooltip>

    <v-btn
      v-else
      icon variant="text" size="small"
      @click.stop="$emit('click')"
      :title="$t('notes.add_action')"
      ><v-icon size="24">edit_note</v-icon></v-btn
    >
  </span>
</template>

<script>
export default {
  name: "TeamNoteButton",
  props: {
    note: {},
    activeColor: {default:'orange'},
  },
};
</script>

<style scoped></style>
