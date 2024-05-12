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
  <s-widget-box
    :title="$t('direct_feedback.title')"
    :sub-title="$t('direct_feedback.message')"
  >
    <template v-slot:top-left>
      <img :src="require('./assets/feedback.svg')" height="24" width="24" />
    </template>
    <template v-slot:actions>
      <v-expand-transition>
        <div v-if="hide">
          <v-btn
            append-icon="expand_more"
            variant="text"
            class="tnt ma-1"
            @click="hide = false"
          >
            <v-avatar :size="24" class="avatar-gradient -thin -user me-1">
              <v-img :src="getUserAvatar(USER_ID())" />
            </v-avatar>
            {{$t('direct_feedback.expand_action')}}

            <v-icon
              :size="16"
              v-if="feedback?.message"
              color="green"
              class="mx-1"
              >check_circle</v-icon
            >
          </v-btn>
        </div>
        <div v-else>
          <!-- ━━━━━━━━━━━━━━━━━━━━ BDashboardShopFeedback > Form ━━━━━━━━━━━━━━━━━━━━ -->

          <v-btn-toggle
            v-model="to"
            class="my-3 overflow-visible"
            rounded="lg"
            selected-class="blue-flat elevation-10"
          >
            <v-btn variant="outlined" value="CEO" class="tnt">
              <v-avatar :size="24" class="me-1" variant="outlined">
                <v-img :src="require('./assets/mehrdad.jpg')" />
              </v-avatar>

              {{$t('direct_feedback.to.ceo')}}
            </v-btn>
            <v-btn variant="outlined" value="TEAM" class="tnt">
              <v-avatar :size="24" class="me-1" variant="outlined">
                <v-img :src="require('./assets/team.jpg')" />
              </v-avatar>


              {{$t('direct_feedback.to.team')}}
            </v-btn>
          </v-btn-toggle>

          <v-textarea
            v-model="message"
            :label="$t('direct_feedback.input_label')"
            variant="solo"
            flat
            persistent-placeholder
            :rows="3"
            auto-grow
            :placeholder="to==='CEO'?$t('direct_feedback.placeholder.ceo'):$t('direct_feedback.placeholder.team')"
            hide-details
          >
            <template v-slot:append-inner>
              <div class="d-flex flex-column">
                <v-btn
                  append-icon="expand_less"
                  variant="text"
                  class="tnt ma-1"
                  @click="hide = true"
                >
                  {{ $t("global.commons.hide") }}
                </v-btn>
                <v-btn
                  v-if="feedback"
                  color="primary"
                  append-icon="save"
                  variant="elevated"
                  class="tnt ma-1"
                  :loading="busy"
                  @click="send"
                >
                  {{ $t("global.actions.save") }}
                </v-btn>
                <v-btn
                  v-else
                  color="primary"
                  append-icon="send"
                  variant="elevated"
                  class="tnt ma-1"
                  :loading="busy"
                  @click="send"
                >
                  {{ $t("global.actions.send") }}
                </v-btn>
              </div>
            </template>
          </v-textarea>
        </div>
      </v-expand-transition>
    </template>
  </s-widget-box>
</template>

<script>
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";

export default {
  name: "BDashboardShopFeedback",
  components: {
    SWidgetBox,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    message: null,
    to: "CEO",
    busy: false,
    hide: true,
  }),
  computed: {
    feedback() {
      return this.shop.feedback;
    },
  },

  watch: {},
  created() {
    if (this.feedback) {
      this.message = this.feedback.message;
      this.to = this.feedback.to;
    }
  },
  methods: {
    send() {
      this.busy = true;

      axios
        .post(window.API.POST_SEND_DIRECT_FEEDBACK(this.shop.id), {
          message: this.message,
          to: this.to,
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.shop.feedback = data.feedback;
            this.hide = true;

            this.showSuccessAlert(
              null,
              "We received your message and will get back to you soon.",
            );
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
