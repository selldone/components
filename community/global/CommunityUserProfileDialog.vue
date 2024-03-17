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
  <v-bottom-sheet
    v-model="dialog"
    :fullscreen="$vuetify.display.mdAndDown"
    content-class="rounded-t-xl"
    max-width="640"
    width="98vw"
  >
    <v-card
      v-if="profile"
      class="py-4 position-relative"
      min-height="40vh"
      rounded="t-xl"
    >
      <v-card-title>
        <v-btn variant="text" @click="dialog = false">
          <v-icon class="me-1" size="small">close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-spacer></v-spacer>
        <div>
          <flag
            v-if="service_country"
            :iso="service_country"
            :squared="false"
          ></flag>
          <v-icon v-else color="#111" title="Global community account."
            >public
          </v-icon>
        </div>
        <!--
        <v-btn icon title="Full profile">
          <v-icon small>open_in_new</v-icon>
        </v-btn>-->
      </v-card-title>

      <v-card-text class="text-center">
        <div class="max-widget-width mx-auto">
          <u-loading-progress v-if="busy"></u-loading-progress>

          <v-avatar class="hover-scale force-top" color="#fafafa" size="64">
            <img :src="getUserAvatar(profile.user_id)" />
          </v-avatar>
          <p class="font-weight-black mt-1 single-line mb-1">
            {{ profile.name }}
            <v-icon
              v-if="profile.verified"
              class="ms-1"
              color="blue"
              size="small"
              >verified
            </v-icon>
          </p>

          <v-row
            v-if="full_profile"
            align="center"
            class="justify-center"
            no-gutters
          >
            <s-value-box
              :value="full_profile.followers_count"
              class="flex-grow-1 ma-1"
              height="44px"
              label="Followers"
            ></s-value-box>

            <s-value-box
              :value="full_profile.following_count"
              class="flex-grow-1 ma-1"
              height="44px"
              label="Following"
            ></s-value-box>

            <div
              v-if="USER_ID() && USER_ID() !== profile.user_id"
              class="widget-buttons flex-grow-1"
            >
              <v-btn
                :color="profile.follow ? 'blue' : '#111'"
                :loading="busy_follow"
                :variant="!profile.follow ? 'outlined':'flat'"
                size="large"
                @click="follow(!profile.follow)"
              >
                {{
                  profile.follow
                    ? $t("community.commons.following_action")
                    : $t("community.commons.follow_action")
                }}

                <v-avatar
                  class="ms-2 avatar-gradient -blue -thin"
                  color="#fafafa"
                  size="28"
                >
                  <img :src="getUserAvatar(USER_ID())" />
                </v-avatar>
              </v-btn>
            </div>
          </v-row>

          <div v-if="profile.description" class="mx-4 my-2 text-start">
            {{ profile.description }}
          </div>

          <div
            v-if="mutual_ids?.length"
            class="d-flex align-center text-start mt-5"
          >
            <u-dense-circles-users
              :ids="mutual_ids"
              :size="32"
              class="overflow-visible"
            ></u-dense-circles-users>

            <p class="m-0 flex-grow-1">
              Mutual followers
              <b class="text-capitalize">{{ mutual_names }} </b>
              <template v-if="mutual_ids.length >= 4">
                and <b>...</b>
              </template>
            </p>
          </div>

          <div class="d-flex align-center mt-5">
            <v-avatar v-if="nominator" color="#fafafa" size="32">
              <img :src="getUserAvatar(nominator.id)" />
            </v-avatar>
            <div class="mx-2 text-start">
              <p class="m-0">
                ● Joined {{ getFromNowString(profile.created_at) }}
              </p>
              <template v-if="nominator">
                Nominated by
                <b class="text-capitalize">{{ nominator.name }}</b>
              </template>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { SetupService } from "@core/server/SetupService";
import UDenseCirclesUsers from "@components/ui/dense-circles/users/UDenseCirclesUsers.vue";
import SValueBox from "@components/ui/text/SValueBox.vue";

export default {
  name: "CommunityUserProfileDialog",
  components: { SValueBox, UDenseCirclesUsers },
  props: {
    community: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dialog: false,
      profile: null,

      full_profile: null,
      busy: false,

      busy_follow: false,
    };
  },

  computed: {
    service_country() {
      return SetupService.LocalServiceCountry();
    },
    mutuals() {
      return (
        this.full_profile &&
        this.full_profile.mutuals &&
        this.full_profile.mutuals
      );
    },
    mutual_ids() {
      return this.mutuals && this.mutuals.map((i) => i.user_id);
    },
    mutual_names() {
      return this.mutuals && this.mutuals.map((i) => i.name).join(", ");
    },
    nominator() {
      return this.full_profile && this.full_profile.nominator;
    },
  },

  methods: {
    getFullUserProfile() {
      // Prevent re-fetch:
      if (
        this.full_profile &&
        this.full_profile.user_id === this.profile.user_id
      ) {
        this.profile = this.full_profile;
        return;
      }

      this.full_profile = null;
      this.busy = true;

      axios
        .get(window.CAPI.GET_COMMUNITY_PROFILE_FULL(this.profile.user_id))
        .then(({ data }) => {
          if (!data.error) {
            this.full_profile = data.profile;
            this.profile = data.profile;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    //――――――――――――――――――――――― Follow ―――――――――――――――――――――――
    follow(follow) {
      this.busy_follow = true;

      axios
        .post(window.CAPI.POST_FOLLOW(this.community.id), {
          user_id: this.profile.user_id,
          follow: follow,
        })
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null, data.error_msg);
          }
          this.profile.follow = data.follow; // Indicate followed now!
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_follow = false;
        });
    },
  },

  mounted() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    // Listen for show loading data from server
    this.EventBus.$on("community:show-profile", ({ profile }) => {
      this.profile = profile;
      this.getFullUserProfile();
      this.dialog = true;
    });
  },
  beforeUnmount() {
    this.EventBus.$off("community:show-profile");
  },
};
</script>

<style lang="scss">
.fullscreen-able-icon {
  cursor: zoom-in;

  &:hover {
    &:after {
      pointer-events: none;
      position: absolute;
      top: 12px;
      right: 12px;
      color: #fff;
      font-size: 20px;
      z-index: 2;
      font-family: "Font Awesome 5 Free";
      font-weight: 900;
      content: "\f065";
    }
  }
}
</style>
