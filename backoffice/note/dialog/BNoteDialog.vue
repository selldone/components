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
  <!-- █████████████████████ Dialog > Note Messages █████████████████████ -->

  <v-bottom-sheet
    :model-value="modelValue"
    :aria-labelledby="`${$.uid}-note-title`"
    :aria-describedby="title ? `${$.uid}-note-resource` : undefined"
    max-width="600"
    width="calc(100% - 32px)"
    scrollable
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <v-card class="b-note-dialog sd-modern-widget text-start">
      <v-card-title class="b-note-dialog__heading">
        <v-avatar class="b-note-dialog__identity" rounded size="38">
          <v-img v-if="icon" :src="icon" />
          <v-icon v-else aria-hidden="true">sticky_note_2</v-icon>
        </v-avatar>
        <div class="b-note-dialog__heading-copy">
          <h2 :id="`${$.uid}-note-title`" class="b-note-dialog__title">
            {{ $t("notes.title") }}
            <span class="b-note-dialog__count">{{ notes?.length || 0 }}</span>
          </h2>
          <p
            v-if="title"
            :id="`${$.uid}-note-resource`"
            class="b-note-dialog__resource"
          >
            <bdi>{{ title }}</bdi>
          </p>
        </div>
        <v-btn
          class="b-note-dialog__icon-button b-note-dialog__close sd-modern-icon-button"
          :aria-label="$t('global.actions.close')"
          icon
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon aria-hidden="true">close</v-icon>
          <v-tooltip
            class="b-note-dialog__tooltip"
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
          >
            {{ $t("global.actions.close") }}
          </v-tooltip>
        </v-btn>
      </v-card-title>
      <v-card-text class="b-note-dialog__content">
        <div v-if="$slots['pre-messages']" class="b-note-dialog__preface">
          <slot name="pre-messages"></slot>
        </div>
        <ol
          v-if="notes?.length"
          class="b-note-dialog__history"
          :aria-label="$t('notes.title')"
        >
          <li
            v-for="(message, i) in notes"
            :key="i"
            :aria-busy="busy_delete_message === i"
            class="b-note-dialog__note"
          >
            <div class="b-note-dialog__note-heading">
              <v-avatar
                :size="32"
                class="b-note-dialog__avatar avatar-gradient -thin -staff"
              >
                <v-img :src="getUserAvatar(message.user_id)" />
              </v-avatar>
              <div class="b-note-dialog__author-copy">
                <span class="b-note-dialog__author">{{
                  message.user_name
                }}</span>
                <span class="b-note-dialog__date">
                  {{ getFromNowString(message.date) }} ·
                  {{ getLocalTimeString(message.date) }}
                </span>
              </div>
              <v-btn
                class="b-note-dialog__icon-button b-note-dialog__delete sd-modern-icon-button"
                :disabled="busy_delete_message !== null"
                :loading="busy_delete_message === i"
                :aria-label="`${$t('notes.delete_action')} · ${message.user_name}`"
                icon
                variant="text"
                @click="deleteMessage(i)"
              >
                <v-icon aria-hidden="true">delete_outline</v-icon>
                <v-tooltip
                  class="b-note-dialog__tooltip"
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                >
                  {{ $t("notes.delete_action") }}
                </v-tooltip>
              </v-btn>
            </div>
            <p class="b-note-dialog__body" dir="auto">{{ message.body }}</p>
          </li>
        </ol>
        <div v-else class="b-note-dialog__empty">
          <v-icon aria-hidden="true">chat_bubble_outline</v-icon>
          <div>
            <p class="b-note-dialog__empty-title">
              {{ $t("notes.empty_title") }}
            </p>
            <p class="b-note-dialog__empty-help">
              {{ $t("notes.empty_message") }}
            </p>
          </div>
        </div>
        <div class="b-note-dialog__composer">
          <h3 class="b-note-dialog__composer-title">
            {{ $t("notes.add_title") }}
          </h3>
          <div class="b-note-dialog__self">
            <v-avatar
              :size="28"
              class="b-note-dialog__avatar avatar-gradient -thin -user"
            >
              <v-img :src="getUserAvatar(USER_ID())" />
            </v-avatar>
            <div class="b-note-dialog__self-copy">
              <span class="b-note-dialog__self-name">{{ USER().name }}</span>
              <span class="b-note-dialog__now">{{
                $t("global.commons.now")
              }}</span>
            </div>
          </div>
          <label :for="`${$.uid}-note-body`" class="b-note-dialog__label">{{
            $t("notes.body")
          }}</label>
          <v-textarea
            :id="`${$.uid}-note-body`"
            v-model="body_input"
            class="b-note-dialog__input"
            :counter="1024"
            :rows="3"
            :aria-label="$t('notes.body')"
            :placeholder="$t('notes.placeholder')"
            auto-grow
            persistent-counter
            density="compact"
            variant="outlined"
          ></v-textarea>
        </div>
        <span class="b-note-dialog__announcement" role="status">
          {{
            busy_add
              ? $t("notes.adding")
              : busy_delete_message !== null
                ? $t("notes.deleting")
                : ""
          }}
        </span>
      </v-card-text>
      <v-card-actions class="b-note-dialog__actions">
        <v-btn
          class="b-note-dialog__button sd-modern-button"
          variant="outlined"
          @click="$emit('update:modelValue', false)"
        >
          {{ $t("global.actions.close") }}
        </v-btn>
        <v-btn
          class="b-note-dialog__button sd-modern-button sd-modern-button--primary"
          :disabled="!body_input"
          :loading="busy_add"
          color="primary"
          variant="flat"
          @click="addNote"
        >
          <v-icon start aria-hidden="true">add</v-icon>
          {{ $t("notes.add_action") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BNoteDialog",
  mixins: [DateMixin],

  components: {},
  emits: ["update:modelValue"],
  props: {
    modelValue: {},

    addUrl: { type: Function },
    deleteUrl: { type: Function },

    icon: {},
    title: {},
    target: {},
  },

  data: () => ({
    busy_add: false,
    body_input: null,
    busy_delete_message: null,
  }),

  computed: {
    notes() {
      return this.target && this.target.note;
    },
  },

  watch: {},

  created() {},

  methods: {
    addNote() {
      this.busy_add = true;

      axios
        .post(this.addUrl(), {
          body: this.body_input,
        })
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.body_input = null;
            this.target.note = data.note;
            NotificationService.showSuccessAlert(
              null,
              this.$t("notes.notifications.success_add"),
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add = null;
        });
    },

    deleteMessage(index) {
      this.busy_delete_message = index;
      axios
        .delete(this.deleteUrl(index))
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.target.note = data.note;
            NotificationService.showSuccessAlert(
              null,
              this.$t("notes.notifications.success_delete"),
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete_message = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-note-dialog {
  --b-note-border: var(
    --sd-modern-border,
    rgba(var(--v-theme-on-surface), 0.09)
  );
  --b-note-muted: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
  min-height: 0;
  padding: 0 !important;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border: 1px solid var(--b-note-border);
  border-radius: 16px 16px 0 0 !important;
  box-shadow: 0 10px 34px rgba(var(--v-theme-on-surface), 0.1) !important;
  text-align: start;
  font-size: var(--sd-modern-font-body, 14px);
  line-height: 21px;
  letter-spacing: normal;
  overflow: hidden !important;

  .b-note-dialog__heading {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 12px;
    padding: 18px 22px;
    white-space: normal;
    letter-spacing: normal;
  }
  .b-note-dialog__identity {
    flex-shrink: 0;
    border-radius: 9px !important;
    background: rgba(var(--v-theme-on-surface), 0.04);
  }
  .b-note-dialog__identity > .v-icon {
    font-size: 21px !important;
    color: var(--b-note-muted);
  }
  .b-note-dialog__heading-copy,
  .b-note-dialog__author-copy {
    flex: 1;
    min-width: 0;
  }
  .b-note-dialog__title {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    line-height: 25px;
    letter-spacing: -0.2px;
  }
  .b-note-dialog__count {
    color: var(--b-note-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: normal;
  }
  .b-note-dialog__resource {
    margin: 2px 0 0;
    color: var(--b-note-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  .b-note-dialog__content {
    min-height: 0;
    padding: 0 22px !important;
    font-size: 14px;
    line-height: 21px;
    letter-spacing: normal;
  }
  .b-note-dialog__preface {
    padding: 14px;
    margin-block-end: 16px;
    border-radius: 10px;
    background: rgba(var(--v-theme-on-surface), 0.04);
    overflow-wrap: anywhere;
  }
  .b-note-dialog__preface :deep(.typo-body) {
    margin: 0 0 9px;
    font-size: 14px;
    line-height: 21px;
  }
  .b-note-dialog__preface :deep(.text-green) {
    color: inherit !important;
    font-size: 13px;
    line-height: 20px;
  }
  .b-note-dialog__preface :deep(b) {
    font-weight: 500;
  }
  .b-note-dialog__history {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .b-note-dialog__note {
    padding-block: 14px;
    border-block-start: 1px solid var(--b-note-border);
  }
  .b-note-dialog__note-heading {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .b-note-dialog__avatar {
    flex-shrink: 0;
  }
  .b-note-dialog__author {
    display: block;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  .b-note-dialog__date {
    display: block;
    color: var(--b-note-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  .b-note-dialog__body {
    margin: 9px 0 0;
    padding-inline-start: 42px;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .b-note-dialog__note[aria-busy="true"] .b-note-dialog__body {
    opacity: 0.55;
  }
  .b-note-dialog__empty {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding-block: 17px 20px;
    border-block-start: 1px solid var(--b-note-border);
  }
  .b-note-dialog__empty > .v-icon {
    margin-block-start: 2px;
    color: var(--b-note-muted);
    font-size: 20px !important;
  }
  .b-note-dialog__empty-title {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
  }
  .b-note-dialog__empty-help {
    margin: 3px 0 0;
    color: var(--b-note-muted);
    font-size: 13px;
    line-height: 20px;
  }
  .b-note-dialog__composer {
    padding-block-start: 16px;
    border-block-start: 1px solid var(--b-note-border);
  }
  .b-note-dialog__composer-title {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
  }
  .b-note-dialog__self {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-block-end: 12px;
  }
  .b-note-dialog__self-copy {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 3px 8px;
    min-width: 0;
  }
  .b-note-dialog__self-name {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  .b-note-dialog__now {
    color: var(--b-note-muted);
    font-size: 13px;
    line-height: 20px;
  }
  .b-note-dialog__label {
    display: block;
    margin-block-end: 6px;
    font-size: 13px;
    line-height: 20px;
  }
  .b-note-dialog__input :deep(.v-field) {
    border-radius: 9px;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
  }
  .b-note-dialog__input :deep(.v-field__input) {
    min-height: 92px;
    padding: 10px 12px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: normal;
    mask-image: none;
  }
  .b-note-dialog__input :deep(.v-field__input::placeholder) {
    color: var(--b-note-muted);
    opacity: 1;
  }
  .b-note-dialog__input :deep(.v-field__outline) {
    color: var(--b-note-border);
    --v-field-border-opacity: 1;
  }
  .b-note-dialog__input :deep(.v-field--focused .v-field__outline) {
    color: rgb(var(--v-theme-primary));
  }
  .b-note-dialog__input :deep(.v-input__details) {
    min-height: 24px;
    padding: 3px 0 0;
    color: var(--b-note-muted);
    font-size: 13px;
    line-height: 20px;
  }
  .b-note-dialog__input :deep(.v-counter) {
    font-size: 13px;
    line-height: 20px;
    opacity: 1;
    direction: ltr;
    unicode-bidi: isolate;
  }
  .b-note-dialog__actions {
    flex-shrink: 0;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 9px;
    min-height: 0;
    padding: 12px 22px 18px;
  }
  .b-note-dialog__button.v-btn {
    min-height: 42px;
    height: auto;
    min-width: 0;
    margin: 0;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    text-transform: none;
    letter-spacing: 0 !important;
    text-indent: 0;
  }
  .b-note-dialog__button :deep(.v-btn__content) {
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    letter-spacing: inherit;
  }
  .b-note-dialog__button :deep(.v-icon) {
    font-size: 18px !important;
  }
  .b-note-dialog__button.v-btn--variant-outlined {
    border-color: var(--b-note-border);
  }
  .b-note-dialog__icon-button.v-btn {
    --sd-modern-icon-button-size: 32px;
    flex: 0 0 32px;
    width: 32px !important;
    min-width: 32px !important;
    height: 32px !important;
    min-height: 32px !important;
    padding: 0;
    border: 1px solid var(--b-note-border);
    border-radius: 8px;
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
  }
  .b-note-dialog__close.v-btn {
    --sd-modern-icon-button-size: 34px;
    flex-basis: 34px;
    width: 34px !important;
    min-width: 34px !important;
    height: 34px !important;
    min-height: 34px !important;
  }
  .b-note-dialog__icon-button :deep(.v-icon) {
    font-size: 18px !important;
  }
  .b-note-dialog__delete:not(.v-btn--disabled):hover {
    color: rgb(var(--v-theme-error));
  }
  .b-note-dialog__announcement {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (max-width: 460px), (pointer: coarse) {
    .b-note-dialog__icon-button.v-btn {
      --sd-modern-icon-button-size: 44px;
      flex-basis: 44px;
      width: 44px !important;
      min-width: 44px !important;
      height: 44px !important;
      min-height: 44px !important;
    }
    .b-note-dialog__button.v-btn {
      min-height: 44px;
    }
    .b-note-dialog__input :deep(.v-field__input) {
      font-size: 16px;
    }
  }
  @media (max-width: 460px) {
    .b-note-dialog__heading {
      padding: 16px;
      gap: 10px;
    }
    .b-note-dialog__content {
      padding-inline: 16px !important;
    }
    .b-note-dialog__actions {
      padding: 10px 16px 16px;
    }
    .b-note-dialog__body {
      padding-inline-start: 0;
    }
  }
}

// Admin does not load Backoffice's modern stylesheet; retain the same tooltip fallback.
.b-note-dialog__tooltip :deep(.v-overlay__content) {
  box-sizing: border-box;
  width: max-content !important;
  min-width: 0 !important;
  max-width: var(
    --sd-modern-tooltip-max-width,
    min(320px, calc(100vw - 32px))
  ) !important;
  padding: 14px 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 12px;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 6px 24px rgba(var(--v-theme-on-surface), 0.12);
  font-size: 13px;
  line-height: 1.7;
  white-space: normal !important;
  overflow-wrap: anywhere;
  text-align: start;
}
</style>
