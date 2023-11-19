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
  <div class="pt-5 pb-3 text-start">
    <widget-header
      :title="$t('community.access.admins')"
      icon="fas fa-crown"
      :add-caption="shop ? $t('community.access.manage_admins') : undefined"
      :href="admins_url"
      target="_blank"
    ></widget-header>
<v-subheader>
  Administrators have unrestricted access to every component of the community. They are essentially part of your business staff.
</v-subheader>
    <users-dense-images-circles
      class="fadeIn delay_100"
      v-if="community.admins_list"
      :ids="community.admins_list"
    ></users-dense-images-circles>

    <widget-header
      :title="$t('community.access.moderators')"
      icon="admin_panel_settings"
      :add-caption="$t('community.access.manage_moderators')"
      @click:add="showModerators"
      class="mt-4"
    ></widget-header>
    <v-subheader>Moderators are granted limited access to oversee the community. They are not privy to your business's shop dashboard or any other related information.</v-subheader>

    <users-dense-images-circles
      class="fadeIn delay_400"
      v-if="community.moderators_list"
      :ids="community.moderators_list"
    ></users-dense-images-circles>

    <!-- -------------------- Dialog ----------------------- -->
    <v-dialog
      v-model="dialog"
      scrollable
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card class="position-relative text-start">

        <v-card-title>
          {{ $t("community.access.manage_moderators") }}
        </v-card-title>
        <v-card-text>
          <div class="widget-box mb-5">
            <widget-header
              title="Add new moderator"
              icon="person_add_alt"
            ></widget-header>
            <v-subheader
              >1. Make sure the user previously registered on
              Selldone.</v-subheader
            >
            <v-subheader>2. Enter the correct email address.</v-subheader>

            <user-email-input
              with-profile
              v-model="user_email"
              class="mt-5"
            ></user-email-input>

            <div class="widget-buttons">
              <v-btn
                color="primary"
                x-large
                :loading="busy_add"
                :disabled="!user_email"
                @click="addModerator"
              >
                <v-icon class="me-1">add</v-icon>
                {{ $t("community.access.add_moderator") }}
              </v-btn>
            </div>
          </div>

          <div class="widget-box mb-5 min-height-20vh">
            <progress-loading v-if="busy_fetch"></progress-loading>
            <widget-header
              title="Moderators list"
              icon="supervisor_account"
            ></widget-header>

            <v-list class="border-between-vertical my-3 bg-transparent" dense>
              <v-list-item v-for="item in moderators" :key="item.user_id">
                <v-list-item-avatar
                  size="48"
                  class="my-0 avatar-gradient -thin"
                >
                  <v-img :src="getUserAvatar(item.user_id)"> </v-img>
                </v-list-item-avatar>
                <v-list-item-content class="p-0">
                  <v-list-item-title class="font-weight-bold"
                    >{{ item.name }}
                    <v-icon v-if="item.verified" small color="blue" class="ms-1"
                      >verified</v-icon
                    ></v-list-item-title
                  >
                  <v-list-item-subtitle v-if="item.email" class="my-1">{{
                    item.email
                  }}</v-list-item-subtitle>
                  <v-list-item-subtitle class="my-1">{{
                    item.description
                  }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn
                    icon
                    @click="removeModerator(item)"
                    :loading="busy_remove === item.user_id"
                    title="Remove moderator"
                    ><v-icon>close</v-icon></v-btn
                  >
                </v-list-item-action>
              </v-list-item>
            </v-list>

            <div v-if="(!moderators || !moderators.length ) && !busy_fetch" class="py-5 display-1 font-weight-thin text-center op-0-5">
              {{$t('global.commons.empty')}}
            </div>

            <div
              v-if="has_more"
              style="height: 120px"
              v-intersect.quiet="
                (entries) => {
                  if (entries[0].isIntersecting) getMore();
                }
              "
            ></div>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn text @click="dialog = false" x-large>
              <v-icon class="me-1">close</v-icon>

              {{ $t("global.actions.close") }}</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import UsersDenseImagesCircles from "@components/user/UsersDenseImagesCircles.vue";
import UserEmailInput from "@components/ui/input/email/UserEmailInput.vue";
export default {
  name: "CommunityAccessController",
  components: {  UserEmailInput, UsersDenseImagesCircles },
  props: {
    shop: {},

    community: {
      required: true,
      type: Object,
    },
  },

  data() {
    return {
      dialog: false,
      moderators: [],
      total: 0,
      busy_fetch: false,

      // -----------------
      page: 1,
      itemsPerPage: 10,
      //------------------
      user_email: null,
      busy_add: false,

      // -----------------
      busy_remove: null,
    };
  },
  computed: {
    admins_url() {
      if (!this.shop) return null;
      return URLS.AdminShopURL(this.shop.id) + "/setting/staff";
    },

    has_more() {
      return this.total < this.moderators.length;
    },
  },
  created() {},

  methods: {
    showModerators() {
      if (!this.total) this.getModerators(); // Try to fetch moderators
      this.dialog = true;
    },
    //――――――――――――――――――――――――― Get List ―――――――――――――――――――――――――

    getMore() {
      if (this.has_more) {
        this.page++;
        this.getModerators();
      }
    },

    getModerators() {
      this.busy_fetch = true;

      axios
        .get(window.CAPI.GET_COMMUNITY_MODERATORS(this.community.id), {
          params: {
            offset: (this.page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.total = data.total;

            data.moderators.forEach((r) => {
              this.AddOrUpdateItemByID(this.moderators, r, "user_id");
            });
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    //――――――――――――――――――――――――― Add ―――――――――――――――――――――――――

    addModerator() {
      this.busy_add = true;

      axios
        .post(window.CAPI.POST_COMMUNITY_MODERATORS_ADD(this.community.id), {
          email: this.user_email,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.total++;
            this.AddOrUpdateItemByID(
              this.moderators,
              data.moderator,
              "user_id",
              false
            );
            this.user_email = null;
            Object.assign(this.community, data.community); // Update moderators_list

            this.showSuccessAlert(
              "Add moderator",
              "A new moderator has been added successfully."
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add = false;
        });
    },

    //――――――――――――――――――――――――― Remove ―――――――――――――――――――――――――
    removeModerator(moderator) {
      this.busy_remove = moderator.user_id;

      axios
        .delete(
          window.CAPI.DELETE_COMMUNITY_MODERATOR(
            this.community.id,
            moderator.user_id
          )
        )
        .then(({ data }) => {
          if (!data.error) {
            this.total--;
            this.DeleteItemByID(this.moderators, data.user_id, "user_id");
            Object.assign(this.community, data.community); // Update moderators_list

            this.showSuccessAlert(
              "Remove moderator",
              "The moderator has been removed successfully."
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_remove = null;
        });
    },
  },
};
</script>

<style scoped></style>
