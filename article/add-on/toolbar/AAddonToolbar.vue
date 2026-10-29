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
  <div class="a-article-addon-tools" :class="{ '-pinned': pinned || menuOpen }" contenteditable="false" @keydown.esc="closeTools" @focusout="onFocusOut">
    <v-btn class="a-article-addon-tools__launcher" icon variant="text" :aria-label="$t('global.article.inline_tools.controls', { block: title })" :aria-expanded="pinned || menuOpen" @click="pinned = !pinned">
      <v-icon size="16">drag_indicator</v-icon>
      <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip" :disabled="pinned || menuOpen">{{ $t('global.article.inline_tools.controls', { block: title }) }}</v-tooltip>
    </v-btn>
    <div class="a-article-addon-tools__bar" role="toolbar" :aria-label="title">
      <v-icon class="a-article-addon-tools__grip" size="14" aria-hidden="true">drag_indicator</v-icon>
      <span class="a-article-addon-tools__title">{{ title }}</span>
      <span class="a-article-addon-tools__separator" aria-hidden="true"></span>
      <slot></slot>
      <v-btn v-if="editButton" class="a-article-addon-tools__button" icon variant="text" :aria-label="editTitle" @click="requestEdit">
        <v-icon size="16">{{ editIcon }}</v-icon>
        <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip">{{ editTitle }}</v-tooltip>
      </v-btn>
      <v-btn class="a-article-addon-tools__button" icon variant="text" :aria-label="$t('global.article.inline_tools.insert_before')" @click="addEnterBefore">
        <v-icon size="16">subdirectory_arrow_left</v-icon>
        <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip">{{ $t('global.article.inline_tools.insert_before') }}</v-tooltip>
      </v-btn>
      <v-btn class="a-article-addon-tools__button" icon variant="text" :aria-label="$t('global.article.inline_tools.insert_after')" @click="addEnterAfter">
        <v-icon size="16">subdirectory_arrow_right</v-icon>
        <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip">{{ $t('global.article.inline_tools.insert_after') }}</v-tooltip>
      </v-btn>
      <v-menu v-model="menuOpen" :close-on-content-click="true" location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" class="a-article-addon-tools__button" icon variant="text" :aria-label="$t('global.commons.more')">
            <v-icon size="16">more_vert</v-icon>
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip" :disabled="menuOpen">{{ $t('global.commons.more') }}</v-tooltip>
          </v-btn>
        </template>
        <v-list class="a-article-addon-tools__menu text-start" density="compact">
          <v-list-item prepend-icon="arrow_upward" :title="$t('global.article.inline_tools.move_up')" @click="moveBlock(-1)" />
          <v-list-item prepend-icon="arrow_downward" :title="$t('global.article.inline_tools.move_down')" @click="moveBlock(1)" />
          <v-list-item prepend-icon="delete_outline" :title="$t('global.article.inline_tools.remove_action')" @click="requestRemoval" />
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { articleAddonContext } from "./article-addon-context";

export default {
  name: "AAddonToolbar",
  emits: ["click:edit"],
  props: {
    element: {
      required: true,
    },
    title: {},
    editButton: {
      type: Boolean,
      default: true,
    },
    editIcon: {
      default: "edit",
    },
    editLabel: { type: String, default: "" },
  },
  data: () => ({ pinned: false, menuOpen: false }),
  computed: {
    editTitle() { return this.editLabel || this.$t("global.article.inline_tools.edit", { block: this.title }); },
  },
  methods: {
    editorContext() {
      return articleAddonContext(this.element);
    },
    closeTools() { this.menuOpen = false; this.pinned = false; },
    onFocusOut(event) { if (!this.menuOpen && !this.$el.contains(event.relatedTarget)) this.pinned = false; },
    requestEdit() { if (this.editorContext()) this.$emit("click:edit"); },
    addParagraph(before) {
      const context = this.editorContext();
      if (!context) return;
      const paragraph = document.createElement("p");
      paragraph.append(document.createElement("br"));
      context.element.insertAdjacentElement(before ? "beforebegin" : "afterend", paragraph);
      context.core.moveCaret($(paragraph));
      context.core.triggerInput();
    },
    addEnterAfter() {
      this.addParagraph(false);
    },
    addEnterBefore() {
      this.addParagraph(true);
    },
    moveBlock(direction) {
      const context = this.editorContext();
      if (!context) return;
      const sibling = direction < 0 ? context.element.previousElementSibling : context.element.nextElementSibling;
      if (!sibling) return;
      sibling.insertAdjacentElement(direction < 0 ? "beforebegin" : "afterend", context.element);
      context.core.triggerInput();
      this.pinned = true;
    },
    requestRemoval() {
      const context = this.editorContext();
      if (!context) return;
      NotificationService.openDangerAlert(
        this.$t("global.article.inline_tools.remove_title", { block: this.title }),
        this.$t("global.article.inline_tools.remove_message"),
        this.$t("global.article.inline_tools.remove_action"),
        () => {
          const current = this.editorContext();
          if (!current || current.element !== context.element || current.core !== context.core) return;
          const next = context.element.nextElementSibling || context.element.previousElementSibling;
          context.element.remove();
          context.core.hideAddons();
          if (next?.tagName === "P") context.core.moveCaret($(next));
          context.core.triggerInput();
        },
      );
    },
  },
};
</script>

<style lang="scss" src="./article-addon-tools.scss"></style>
