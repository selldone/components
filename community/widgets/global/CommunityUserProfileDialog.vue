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
    max-width="640"
    width="98vw"
    content-class="rounded-t-xl"
    :fullscreen="$vuetify.breakpoint.mdAndDown"
  >
    <v-card
      v-if="profile"
      class="py-4 position-relative"
      rounded="t-xl"
      min-height="40vh"
    >
      <v-card-title>
        <v-btn text @click="dialog = false">
          <v-icon class="me-1" small>close</v-icon>
          {{ $t("global.actions.close") }}</v-btn
        >

        <v-spacer></v-spacer>
        <div>
          <flag
              v-if="service_country"
              :iso="service_country"
              :squared="false"
          ></flag>
          <v-icon v-else color="#111" title="Global community account.">public</v-icon>
        </div>
        <!--
        <v-btn icon title="Full profile">
          <v-icon small>open_in_new</v-icon>
        </v-btn>-->
      </v-card-title>

      <v-card-text class="text-center">
        <div class="max-widget-width mx-auto">
          <s-progress-loading v-if="busy"></s-progress-loading>

          <v-avatar size="64" color="#fafafa" class="hover-scale force-top">
            <img :src="getUserAvatar(profile.user_id)" />
          </v-avatar>
          <p class="font-weight-black mt-1 single-line mb-1">
            {{ profile.name }}
            <v-icon v-if="profile.verified" small color="blue" class="ms-1"
              >verified</v-icon
            >
          </p>



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

          <v-row v-if="full_profile" no-gutters class="justify-center">
            <s-value-box
              label="Followers"
              :value="full_profile.followers_count"
            ></s-value-box>

            <s-value-box
              label="Following"
              :value="full_profile.following_count"
            ></s-value-box>
          </v-row>

          <div v-if="profile.description" class="mx-4 my-2 text-start">
            {{ profile.description }}
          </div>

          <div v-if="mutual_ids" class="d-flex align-center text-start mt-5">
            <s-dense-images-circles-users
              class="overflow-visible"
              :ids="mutual_ids"
              :size="32"
            ></s-dense-images-circles-users>

            <p class="m-0 flex-grow-1">
              Mutual followers
              <b class="text-capitalize">{{ mutual_names }} </b>
              <template v-if="mutual_ids.length >= 4">
                and <b>...</b>
              </template>
            </p>
          </div>

          <div class="d-flex align-center mt-5">
            <v-avatar v-if="nominator" size="32" color="#fafafa">
              <img :src="getUserAvatar(nominator.id)" />
            </v-avatar>
            <div class="mx-2 text-start">
              <p class="m-0">
                ● Joined {{ getFromNowString(profile.created_at) }}
              </p>
              <template v-if="nominator">
                ● Nominated by
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
import SDenseImagesCirclesUsers from "@components/user/dense-circles/SDenseImagesCirclesUsers.vue";
import SValueBox from "@components/ui/text/SValueBox.vue";

export default {
  name: "CommunityUserProfileDialog",
  components: { SValueBox, SDenseImagesCirclesUsers },
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
