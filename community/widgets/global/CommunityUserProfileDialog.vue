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
  <v-dialog
    v-model="dialog"
    max-width="480"
    :fullscreen="$vuetify.breakpoint.mdAndDown"
  >
    <v-card
      v-if="!full_profile && profile"
      class="text-center bg-white position-relative py-4"
    >
      <div class="text-center">
        <v-avatar size="64" color="#fafafa" class="hover-scale force-top">
          <img :src="getUserAvatar(profile.user_id)" />
        </v-avatar>
        <p class="font-weight-black mt-1 single-line mb-1">
          {{ profile.name }}
          <v-icon v-if="profile.verified" small color="blue" class="ms-1">verified</v-icon>
        </p>
      </div>

      <div class="mx-4 my-2 text-start">
        {{ profile.description }}
      </div>

      <progress-loading v-if="busy"></progress-loading>
    </v-card>

    <v-card v-if="full_profile && !busy" class="text-center bg-white">
      <v-card-title>
        <v-btn text @click="dialog = false">
          <v-icon class="me-1" small>{{ $t("icons.arrow_back") }}</v-icon>
          {{ $t("global.actions.back") }}</v-btn
        >

        <v-spacer></v-spacer>

        <v-btn icon title="Full profile">
          <v-icon small>open_in_new</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="d-flex justify-center mt-2">
          <div class="w-50">
            <v-avatar size="64" color="#fafafa" class="hover-scale force-top">
              <img :src="getUserAvatar(profile.user_id)" />
            </v-avatar>
            <p class="font-weight-black mt-1 single-line mb-1">
              {{ profile.name }}
              <v-icon v-if="profile.verified" small color="blue" class="ms-1">verified</v-icon>
            </p>
            <small class="d-block mt-3">follow you</small>
          </div>

          <div>
            <v-icon>cloud_queue</v-icon><br />
            <flag
              v-if="service_country"
              :iso="service_country"
              :squared="false"
            ></flag>
            <v-icon v-else color="blue">public</v-icon>
          </div>

          <div v-if="USER_ID() && USER_ID() !== profile.user_id" class="w-50">
            <v-avatar size="64" color="#fafafa">
              <img :src="getUserAvatar(USER_ID())" />
            </v-avatar>
            <p class="font-weight-black mt-1 single-line mb-1">You</p>
            <v-btn
              class="text-lowercase"
              small
              depressed
              color="blue"
              dark
              rounded
              >following

              <v-avatar size="20" color="#fafafa" class="ms-2 me-n2">
                <img :src="getUserAvatar(USER_ID())" />
              </v-avatar>
            </v-btn>
          </div>
        </div>
      </v-card-text>

      <v-card-actions  class="justify-center">
        <v-btn text class="flex-grow-1 text-lowercase"
          ><b class="me-1">{{full_profile.followers_count}}</b> followers</v-btn
        >

        <v-btn text class="flex-grow-1 text-lowercase"
          ><b class="me-1">{{full_profile.following_count}}</b> following</v-btn
        >
      </v-card-actions>

      <v-card-text>
        <div class="mx-4 my-2 text-start">
          {{ profile.description }}
        </div>

        <div v-if="mutual_ids" class="d-flex align-center text-start mt-5">
          <users-dense-images-circles
            class="overflow-visible"
            :ids="mutual_ids"
            :size="32"
          ></users-dense-images-circles>

          <p class="m-0 flex-grow-1">
            Mutual followers
            <b class="text-capitalize"
              >{{mutual_names}}
            </b>
            <template v-if="mutual_ids.length>=4">
              and <b>...</b>
            </template>

          </p>
        </div>

        <div  class="d-flex align-center mt-5">
          <v-avatar v-if="nominator" size="32" color="#fafafa">
            <img :src="getUserAvatar(nominator.id)" />
          </v-avatar>
          <div class="mx-2 text-start">
            <p class="m-0">{{getLocalTimeString(profile.created_at,true)}}</p>
            <template v-if="nominator">
              Nominated by <b class="text-capitalize">{{nominator.name}}</b>
            </template>
          </div>
        </div>
      </v-card-text>

      <v-card-actions v-if="false" class="justify-center">
        <v-btn text class="flex-grow-1 text-capitalize">Posts</v-btn>

        <v-divider vertical class="mx-1"></v-divider>

        <v-btn text class="flex-grow-1 text-capitalize">Communities</v-btn>

        <v-divider vertical class="mx-1"></v-divider>

        <v-btn text class="flex-grow-1 text-capitalize" color="success"
          >Grant <v-icon class="ms-1">attach_money</v-icon></v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import SetupService from "@core/server/SetupService";
import UsersDenseImagesCircles from "@app-backoffice/components/user/UsersDenseImagesCircles.vue";

export default {
  name: "CommunityUserProfileDialog",
  components: { UsersDenseImagesCircles },
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
    };
  },

  computed: {
    service_country() {
      return SetupService.LocalServiceCountry();
    },
    mutuals(){
      return this.full_profile && this.full_profile.mutuals && this.full_profile.mutuals
    },
    mutual_ids(){
      return this.mutuals &&  this.mutuals.map(i=>i.user_id)
    },
    mutual_names(){
      return this.mutuals &&  this.mutuals.map(i=>i.name).join(', ')
    },
    nominator(){
      return this.full_profile && this.full_profile.nominator
    }
  },

  methods: {
    getFullUserProfile() {
      // Prevent re-fetch:
      if (
        this.full_profile &&
        this.full_profile.user_id === this.profile.user_id
      )
      {
        this.profile=this.full_profile;
        return;
      }

      this.full_profile=null;
      this.busy = true;

      axios
        .get(window.CAPI.GET_COMMUNITY_PROFILE_FULL(this.profile.user_id))
        .then(({ data }) => {
          if (!data.error) {
            this.full_profile = data.profile;
            this.profile=data.profile;
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
  beforeDestroy() {
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
