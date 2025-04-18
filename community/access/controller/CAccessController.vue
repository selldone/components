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
    <u-widget-header
      :add-caption="shop ? $t('community.access.manage_admins') : undefined"
      :href="admins_url"
      :title="$t('community.access.admins')"
      icon="fa:fas fa-crown"
      target="_blank"
      :disabled-access="shop && !writeShopAccess(ShopPermissionRegions.COMMUNITY.code)"

    ></u-widget-header>
    <v-list-subheader>
      Administrators have unrestricted access to every component of the
      community. They are essentially part of your business staff.
    </v-list-subheader>
    <u-dense-circles-users
      v-if="community.admins_list"
      :ids="community.admins_list"
      class="fadeIn delay_100"
    ></u-dense-circles-users>

    <u-widget-header
      :add-caption="$t('community.access.manage_moderators')"
      :title="$t('community.access.moderators')"
      class="mt-4"
      icon="admin_panel_settings"
      @click:add="showModerators"
      :disabled-access="shop && !writeShopAccess(ShopPermissionRegions.COMMUNITY.code)"
    ></u-widget-header>
    <v-list-subheader
      >Moderators are granted limited access to oversee the community. They are
      not privy to your business's shop dashboard or any other related
      information.
    </v-list-subheader>

    <u-dense-circles-users
      v-if="community.moderators_list"
      :ids="community.moderators_list"
      class="fadeIn delay_400"
    ></u-dense-circles-users>

    <!-- -------------------- Dialog ----------------------- -->
    <v-dialog
      v-model="dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="position-relative text-start">
        <v-card-title>
          {{ $t("community.access.manage_moderators") }}
        </v-card-title>
        <v-card-text>
          <div class="widget-box mb-5">
            <u-widget-header
              icon="person_add_alt"
              title="Add new moderator"
            ></u-widget-header>
            <v-list-subheader
              >1. Make sure the user previously registered on Selldone.
            </v-list-subheader>
            <v-list-subheader
              >2. Enter the correct email address.
            </v-list-subheader>

            <c-user-input
              v-model="user_email"
              class="mt-5"
              with-profile
            ></c-user-input>

            <div class="widget-buttons">
              <v-btn
                :disabled="!user_email"
                :loading="busy_add"
                color="primary"
                size="x-large"
                @click="addModerator"
              >
                <v-icon start>add</v-icon>
                {{ $t("community.access.add_moderator") }}
              </v-btn>
            </div>
          </div>

          <div class="widget-box mb-5 min-height-20vh">
            <u-loading-progress v-if="busy_fetch"></u-loading-progress>
            <u-widget-header
              icon="supervisor_account"
              title="Moderators list"
            ></u-widget-header>

            <v-list
              class="border-between-vertical my-3 bg-transparent"
              density="compact"
            >
              <v-list-item v-for="item in moderators" :key="item.user_id">
                <template v-slot:prepend>
                  <v-avatar class="my-0 avatar-gradient -thin" size="48">
                    <v-img :src="getUserAvatar(item.user_id)"></v-img>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold"
                  >{{ item.name }}
                  <v-icon
                    v-if="item.verified"
                    class="ms-1"
                    color="blue"
                    size="small"
                    >verified
                  </v-icon>
                </v-list-item-title>
                <v-list-item-subtitle v-if="item.email" class="my-1"
                  >{{ item.email }}
                </v-list-item-subtitle>
                <v-list-item-subtitle class="my-1"
                  >{{ item.description }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-list-item-action end>
                    <v-btn
                      :loading="busy_remove === item.user_id"
                      icon
                      variant="text"
                      title="Remove moderator"
                      @click="removeModerator(item)"
                    >
                      <v-icon>close</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </template>
              </v-list-item>
            </v-list>

            <div
              v-if="(!moderators || !moderators.length) && !busy_fetch"
              class="py-5 text-h4 font-weight-thin text-center op-0-5"
            >
              {{ $t("global.commons.empty") }}
            </div>

            <div
              v-if="has_more"
              v-intersect.quiet="
                (isIntersecting) => {
                  if (isIntersecting) getMore();
                }
              "
              style="height: 120px"
            ></div>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog = false">
              <v-icon start>close</v-icon>

              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import UDenseCirclesUsers from "../../../ui/dense-circles/users/UDenseCirclesUsers.vue";
import CUserInput from "../../../community/user/input/CUserInput.vue";
import {ShopPermissionRegions} from "@selldone/core-js/enums/permission/ShopPermissions";


export default {
  name: "CAccessController",
  mixins: [],

  components: { CUserInput, UDenseCirclesUsers },
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
    ShopPermissionRegions() {
      return ShopPermissionRegions
    },
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
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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
              false,
            );
            this.user_email = null;
            Object.assign(this.community, data.community); // Update moderators_list

            NotificationService.showSuccessAlert(
              "Add moderator",
              "A new moderator has been added successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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
            moderator.user_id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.total--;
            this.DeleteItemByID(this.moderators, data.user_id, "user_id");
            Object.assign(this.community, data.community); // Update moderators_list

            NotificationService.showSuccessAlert(
              "Remove moderator",
              "The moderator has been removed successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_remove = null;
        });
    },
  },
};
</script>

<style scoped></style>
