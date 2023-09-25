<template>
  <div v-if="notes?.length" class="d--notes-digest-view">
    <v-list class="border-between-vertical" two-line>
      <note-view
        v-for="note in notes.sortByKey('id', false).limit(limit)"
        :key="note.id"
        :shop="shop"
        in-shop-admin
        :note="note"
        class="fadeIn pp"
        :class="{ 'hover-scale-small force-top bg-white border-0': hoverAble }"
        @click.native="show(note)"
        @delete="DeleteItemByID(notes, note.id)"
      >
      </note-view>
    </v-list>
    <div v-if="limit && notes.length>limit" class="blue--text pa-2 pp" @click="show(notes[0])">
      {{$t("global.commons.more")}}...
    </div>
  </div>
</template>

<script>

import NoteView from "./NoteView.vue";

export default {
  name: "NotesDigestView",
  components: { NoteView },

  props: {
    shop: {
      required: true,
    },
    notes: {
      required: false,
      type: Array,
    },
    hoverAble: {
      type: Boolean,
    },
    limit: {},

    page:{
      // Assigned target.
    },
    popup:{
      // Assigned target.
    },

  },
  data: () => ({}),

  computed: {},

  watch: {},
  created() {},
  mounted() {},
  beforeDestroy() {},

  methods: {
    show(note){
      this.showGlobalShopNoteDialog(this.notes,note.element_id,this.page?.id,this.popup?.id)
    }
  },
};
</script>

<style scoped lang="scss">
.d--notes-digest-view {
  text-align: start;
  font-family: var(--font);
}
</style>
