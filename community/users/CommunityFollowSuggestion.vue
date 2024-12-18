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
  <v-col
    v-if="has_suggestion"
    class="c-container -force-rounded position-relative border-top-thick -blue"
    cols="12"
  >
    <div class="bg-white z2 c-widget py-3">
      <h4 class="mx-3">{{ $t("community.commons.suggestion_list") }}</h4>

      <v-slide-group class="center-items" show-arrows>
        <v-slide-group-item
          v-for="profile in profiles"
          :key="profile.user_id"
          v-slot="{}"
        >
          <v-card
            :height="$vuetify.display.xs ? 160 : 200"
            :width="$vuetify.display.xs ? 100 : 150"
            class="ma-2 ma-sm-3 ma-md-4 user-select-none"
            rounded="xl"
            variant="flat"
            color="#fafafa"
          >
            <v-card-text
              class="d-flex align-center justify-center flex-column h-100"
            >
              <v-avatar :size="$vuetify.display.xs ? 64 : 86" class="avatar-gradient -blue">
                <img :src="getUserAvatar(profile.user_id)" />
              </v-avatar>

              <div class="text-subtitle-2 mt-2 mt-sm-4 single-line text-black">
                <b>{{ profile.name }}</b>
                <small v-if="profile.mutual" class="ms-1">2th</small>
              </div>
              <v-spacer></v-spacer>
              <div class="widget-buttons w-100">
                <v-btn
                  :loading="busy_follow === profile.user_id"
                  :size="$vuetify.display.xs ? 'small' : undefined"
                  :variant="!profile.follow ? 'outlined' : 'elevated'"
                  color="#000"
                  width="100%"
                  @click="follow(profile, !profile.follow)"
                >
                  <v-icon v-if="profile.follow" class="me-1">check</v-icon>
                  {{
                    profile.follow
                      ? $t("community.commons.following_action")
                      : $t("community.commons.follow_action")
                  }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </div>
  </v-col>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";



export default {
  name: "CommunityFollowSuggestion",
  mixins: [],

  components: {},
  props: {
    community: {
      required: true,
      type: Object,
    },
  },

  data() {
    return {
      busy: false,
      profiles: null,

      busy_follow: null,
    };
  },

  computed: {
    has_suggestion() {
      return this.profiles && this.profiles.length;
    },
  },

  created() {
    this.getSuggestions();
  },

  methods: {
    getSuggestions() {
      this.busy = true;

      axios
        .get(window.CAPI.GET_FOLLOWERS_REQUEST(this.community.id), {
          params: {
            // Extra info to create suggestions:
            category_id: this.$route.params.category_id,
            topic_id: this.$route.params.topic_id,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.profiles = data.profiles;
          }
        })
        .catch((error) => {})
        .finally(() => {
          this.busy = false;
        });
    },

    //――――――――――――――――――――――― Follow ―――――――――――――――――――――――
    follow(profile, follow) {
      this.busy_follow = profile.user_id;

      axios
        .post(window.CAPI.POST_FOLLOW(this.community.id), {
          user_id: profile.user_id,
          follow: follow,
        })
        .then(({ data }) => {
          if (data.error) {
            return NotificationService.showErrorAlert(null, data.error_msg);
          }

          profile.follow = data.follow; // Indicate followed now!
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_follow = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
