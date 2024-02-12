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
    content-class="rounded-t-xl overflow-hidden"
    max-width="820"
    scrollable
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <v-card color="#f9f9f9" flat rounded="0">
      <v-card-title class="d-flex align-center">
        <v-avatar v-if="icon" class="me-2" rounded size="24">
          <img :src="icon" />
        </v-avatar>

        {{ title }}
      </v-card-title>
      <v-card-text>
        <slot name="pre-messages"></slot>
        <div v-if="notes" class="max-widget-width mb-5">
          <div
            v-for="(message, i) in notes"
            :key="i"
            :class="{ disabled: busy_delete_message === i }"
            class="my-2 c-bubble"
          >
            <div class="d-flex align-center">
              <v-avatar :size="32" class="avatar-gradient -thin -staff me-2">
                <v-img :src="getUserAvatar(message.user_id)" />
              </v-avatar>
              <div class="flex-grow-1">
                <b>{{ message.user_name }}</b>
                <small class="d-block"
                  >{{ getFromNowString(message.date) }} ●
                  {{ getLocalDateString(message.date) }}</small
                >
              </div>

              <v-btn
                :class="{ disabled: busy_delete_message !== null }"
                :loading="busy_delete_message === i"
                :title="$t('global.actions.delete')"
                color="red"
                icon
                variant="text"
                @click="deleteMessage(i)"
              >
                <v-icon>close</v-icon>
              </v-btn>
            </div>
            <div class="typo-body my-2">
              {{ message.body }}
            </div>
          </div>
        </div>

        <div class="c-bubble mb-5 mt-12 max-widget-width">
          <s-widget-header
            :title="$t('global.actions.add_new_message')"
            icon="chat_bubble"
          ></s-widget-header>
          <div class="d-flex align-center mt-3">
            <v-avatar :size="32" class="avatar-gradient -thin -user me-2">
              <v-img :src="getUserAvatar(USER_ID())" />
            </v-avatar>
            <div class="flex-grow-1">
              <b>{{ USER().name }}</b>
              <small class="d-block">{{ $t("global.commons.now") }}</small>
            </div>
          </div>

          <v-textarea
            v-model="body_input"
            :counter="1024"
            :rows="3"
            auto-grow
            label="Message"
            variant="underlined"
          ></v-textarea>

          <div class="widget-buttons">
            <v-btn
              :disabled="!body_input"
              :loading="busy_add"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="addNote"
            >
              <v-icon start>add</v-icon>
              {{ $t("global.actions.add") }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="$emit('update:modelValue', false)"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
export default {
  name: "TeamNoteDialog",

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
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.body_input = null;
            this.target.note = data.note;
            this.showSuccessAlert(
              null,
              this.$t("notes.notifications.success_add"),
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.target.note = data.note;
            this.showSuccessAlert(
              null,
              this.$t("notes.notifications.success_delete"),
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete_message = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.c-bubble {
  background-color: #fff;
  border-radius: 18px;
  text-align: start;
  padding: 8px 12px;
}
</style>
