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
      :color="modern ? undefined : activeColor"
      :class="{ 'sd-modern-icon-button': modern }"
      icon
      size="36"
      variant="text"
      :aria-label="modern ? $t('notes.add_action') : undefined"
      @click.stop="$emit('click')"
      ><v-icon :size="modern ? 20 : 24">sticky_note_2</v-icon>

      <v-tooltip
        activator="parent"
        :content-class="modern ? 'sd-modern-tooltip text-start' : 'bg-black text-start'"
        :location="modern ? 'top' : undefined"
        max-width="460"
        min-width="240"
      >
        <p v-if="modern" class="ma-0">{{ $t('notes.add_action') }}</p>
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
      :title="modern ? undefined : $t('notes.add_action')"
      :class="{ 'sd-modern-icon-button': modern }"
      icon
      size="small"
      variant="text"
      :aria-label="modern ? $t('notes.add_action') : undefined"
      @click.stop="$emit('click')"
      ><v-icon :size="modern ? 20 : 24">edit_note</v-icon>
      <v-tooltip
        v-if="modern"
        activator="parent"
        content-class="sd-modern-tooltip text-start"
        location="top"
        max-width="320"
      >{{ $t('notes.add_action') }}</v-tooltip>
    </v-btn>
  </span>
</template>

<script lang="ts">
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BNoteButton",
  mixins: [DateMixin],
  emits: ["click"],

  props: {
    note: {},
    activeColor: { default: "orange" },
    modern: Boolean,
  },
};
</script>

<style scoped></style>
