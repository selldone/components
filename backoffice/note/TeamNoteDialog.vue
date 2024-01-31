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
    :value="value"
    @input="(v) => $emit('input', v)"
    max-width="820"
    scrollable
    content-class="rounded-t-xl overflow-hidden"
  >
    <v-card flat color="#f9f9f9" rounded="0">
      <v-card-title class="d-flex align-center">
        <v-avatar v-if="icon" size="24" class="me-2" rounded>
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
            class="my-2 c-bubble"
            :class="{ disabled: busy_delete_message === i }"
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
                color="red"
                :title="$t('global.actions.delete')"
                @click="deleteMessage(i)"
                icon variant="text"
                :loading="busy_delete_message === i"
                :class="{ disabled: busy_delete_message !== null }"
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
            :rows="3"
            auto-grow
            label="Message"
            v-model="body_input"
            :counter="1024" variant="underlined"
          ></v-textarea>

          <div class="widget-buttons">
            <v-btn
              color="primary"
              size="x-large"
              variant="flat"
              @click="addNote"
              :loading="busy_add"
              :class="{ disabled: !body_input }"
            >
              <v-icon class="me-1">add</v-icon>
              {{ $t("global.actions.add") }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn variant="text" size="x-large" @click="$emit('input', false)">
            <v-icon class="me-1">close</v-icon>
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

  props: {
    value: {},

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

<style scoped lang="scss">
.c-bubble {
  background-color: #fff;
  border-radius: 18px;
  text-align: start;
  padding: 8px 12px;
}
</style>
