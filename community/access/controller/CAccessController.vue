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
  <div
    class="text-start"
    :class="
      modern ? 'c-access-controller--modern sd-modern-widget' : 'pt-5 pb-3'
    "
  >
    <template v-if="modern">
      <header class="sd-modern-header c-access-controller__header">
        <div class="sd-modern-title">
          <v-icon
            icon="admin_panel_settings"
            size="19"
            class="sd-modern-muted"
            aria-hidden="true"
          />
          <h2 class="sd-modern-title-text">
            {{ $t("global.commons.access") }}
          </h2>
        </div>
      </header>
      <section class="c-access-controller__role">
        <div class="c-access-controller__role-heading">
          <div class="c-access-controller__role-label">
            <h3>{{ $t("community.access.admins") }}</h3>
            <v-tooltip
              location="top"
              open-on-focus
              open-on-click
              content-class="sd-modern-tooltip text-start"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="text"
                  class="sd-modern-icon-button sd-modern-info-button"
                  :aria-label="$t('community.access.modern.admin_help_title')"
                >
                  <v-icon icon="info_outline" aria-hidden="true" />
                </v-btn>
              </template>
              <strong class="sd-modern-tooltip__title">
                {{ $t("community.access.admins") }}
              </strong>
              <p class="sd-modern-tooltip__body">
                {{ $t("community.access.modern.admin_help") }}
              </p>
            </v-tooltip>
          </div>
          <v-btn
            v-if="shop"
            :to="{
              name: 'BPageShopPermissionStaff',
              params: { shop_id: shop.id },
            }"
            :disabled="!can_manage"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            variant="text"
            class="sd-modern-button sd-modern-button--compact"
            append-icon="north_east"
            >{{ $t("community.access.manage_admins") }}</v-btn
          >
        </div>
        <p class="c-access-controller__description">
          {{ $t("community.access.modern.admin_description") }}
        </p>
        <div class="c-access-controller__people">
          <u-dense-circles-users
            v-if="community.admins_list"
            :ids="community.admins_list"
            :size="26"
            :limit="4"
            color="transparent"
          />
          <span
            >{{
              Array.isArray(community.admins_list)
                ? numeralFormat(community.admins_list.length, "0,0")
                : "—"
            }}
            {{ $t("community.access.admins") }}</span
          >
        </div>
      </section>
      <section class="c-access-controller__role">
        <div class="c-access-controller__role-heading">
          <div class="c-access-controller__role-label">
            <h3>{{ $t("community.access.moderators") }}</h3>
            <v-tooltip
              location="top"
              open-on-focus
              open-on-click
              content-class="sd-modern-tooltip text-start"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="text"
                  class="sd-modern-icon-button sd-modern-info-button"
                  :aria-label="$t('community.access.modern.moderator_help_title')"
                >
                  <v-icon icon="info_outline" aria-hidden="true" />
                </v-btn>
              </template>
              <strong class="sd-modern-tooltip__title">
                {{ $t("community.access.moderators") }}
              </strong>
              <p class="sd-modern-tooltip__body">
                {{ $t("community.access.modern.moderator_help") }}
              </p>
            </v-tooltip>
          </div>
          <v-btn
            :disabled="!can_manage"
            color="primary"
            variant="text"
            class="sd-modern-button sd-modern-button--compact"
            @click="showModerators"
            >{{ $t("community.access.manage_moderators") }}</v-btn
          >
        </div>
        <p class="c-access-controller__description">
          {{ $t("community.access.modern.moderator_description") }}
        </p>
        <div class="c-access-controller__people">
          <u-dense-circles-users
            v-if="community.moderators_list"
            :ids="community.moderators_list"
            :size="26"
            :limit="4"
            color="transparent"
          />
          <span
            >{{
              Array.isArray(community.moderators_list)
                ? numeralFormat(community.moderators_list.length, "0,0")
                : "—"
            }}
            {{ $t("community.access.moderators") }}</span
          >
        </div>
      </section>
    </template>
    <template v-else>
      <u-widget-header
        :add-caption="shop ? $t('community.access.manage_admins') : undefined"
        :href="admins_url"
        :title="$t('community.access.admins')"
        icon="fa:fas fa-crown"
        target="_blank"
        :disabled-access="
          shop && !writeShopAccess(ShopPermissionRegions.COMMUNITY.code)
        "
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
        :disabled-access="
          shop && !writeShopAccess(ShopPermissionRegions.COMMUNITY.code)
        "
      ></u-widget-header>
      <v-list-subheader
        >Moderators are granted limited access to oversee the community. They
        are not privy to your business's shop dashboard or any other related
        information.
      </v-list-subheader>

      <u-dense-circles-users
        v-if="community.moderators_list"
        :ids="community.moderators_list"
        class="fadeIn delay_400"
      ></u-dense-circles-users>
    </template>

    <!-- -------------------- Dialog ----------------------- -->
    <v-dialog
      v-model="dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card
        class="position-relative text-start"
        :class="{ 'c-access-controller-dialog sd-modern-canvas': modern }"
      >
        <v-card-title :class="{ 'c-access-controller-dialog__header': modern }">
          {{ $t("community.access.manage_moderators") }}
          <v-btn
            v-if="modern"
            icon
            variant="text"
            class="sd-modern-icon-button"
            :aria-label="$t('global.actions.close')"
            @click="dialog = false"
          >
            <v-icon icon="close" size="18" />
            <v-tooltip
              activator="parent"
              location="top"
              open-on-focus
              content-class="sd-modern-tooltip text-start"
              >{{ $t("global.actions.close") }}</v-tooltip
            >
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div
            :class="
              modern
                ? 'sd-modern-widget c-access-controller-dialog__section'
                : 'widget-box mb-5'
            "
          >
            <u-widget-header
              icon="person_add_alt"
              :title="
                modern
                  ? $t('community.access.modern.add_title')
                  : 'Add new moderator'
              "
              :class="{ 'sd-modern-form-header': modern }"
            ></u-widget-header>
            <v-list-subheader v-if="!modern"
              >1. Make sure the user previously registered on Selldone.
            </v-list-subheader>
            <v-list-subheader v-if="!modern"
              >2. Enter the correct email address.
            </v-list-subheader>
            <p v-else class="sd-modern-subtitle">
              {{ $t("community.access.modern.add_help") }}
            </p>

            <c-user-input
              v-model="user_email"
              class="mt-5"
              :class="{ 'sd-modern-underlined-field': modern }"
              :label="modern ? $t('community.access.modern.email') : undefined"
              :readonly="modern && (!can_manage || busy_add)"
              with-profile
            ></c-user-input>

            <div
              class="widget-buttons"
              :class="{ 'c-access-controller-dialog__actions': modern }"
            >
              <v-btn
                :disabled="!user_email || (modern && !can_manage)"
                :loading="busy_add"
                color="primary"
                :size="modern ? undefined : 'x-large'"
                :class="{
                  'sd-modern-button sd-modern-button--primary': modern,
                }"
                @click="addModerator"
              >
                <v-icon start>add</v-icon>
                {{ $t("community.access.add_moderator") }}
              </v-btn>
            </div>
          </div>

          <div
            :class="
              modern
                ? 'sd-modern-widget c-access-controller-dialog__section'
                : 'widget-box mb-5 min-height-20vh'
            "
          >
            <u-loading-progress v-if="busy_fetch"></u-loading-progress>
            <u-widget-header
              icon="supervisor_account"
              :title="
                modern
                  ? $t('community.access.modern.list_title')
                  : 'Moderators list'
              "
              :class="{ 'sd-modern-form-header': modern }"
            ></u-widget-header>

            <v-list
              class="border-between-vertical my-3 bg-transparent"
              density="compact"
            >
              <v-list-item v-for="item in moderators" :key="item.user_id">
                <template v-slot:prepend>
                  <v-avatar
                    class="my-0 avatar-gradient -thin"
                    :size="modern ? 36 : 48"
                  >
                    <v-img :src="getUserAvatar(item.user_id)"></v-img>
                  </v-avatar>
                </template>

                <v-list-item-title :class="{ 'font-weight-bold': !modern }"
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
                      :disabled="modern && !can_manage"
                      icon
                      variant="text"
                      :class="{ 'sd-modern-icon-button': modern }"
                      :aria-label="$t('community.access.modern.remove')"
                      @click="removeModerator(item)"
                    >
                      <v-icon>{{ modern ? "person_remove" : "close" }}</v-icon>
                      <v-tooltip
                        v-if="modern"
                        activator="parent"
                        location="top"
                        open-on-focus
                        content-class="sd-modern-tooltip text-start"
                        >{{ $t("community.access.modern.remove") }}</v-tooltip
                      >
                    </v-btn>
                  </v-list-item-action>
                </template>
              </v-list-item>
            </v-list>

            <div
              v-if="(!moderators || !moderators.length) && !busy_fetch"
              :class="
                modern
                  ? 'sd-modern-empty-state'
                  : 'py-5 text-h4 font-weight-thin text-center op-0-5'
              "
            >
              {{ $t("global.commons.empty") }}
            </div>

            <v-btn
              v-if="modern && has_more"
              :loading="busy_fetch"
              variant="text"
              class="sd-modern-button"
              @click="getMore"
              >{{ $t("community.access.modern.load_more") }}</v-btn
            >
            <div
              v-if="!modern && has_more"
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
          <div
            class="widget-buttons"
            :class="{ 'c-access-controller-dialog__actions': modern }"
          >
            <v-btn
              :size="modern ? undefined : 'x-large'"
              :class="{ 'sd-modern-button': modern }"
              variant="text"
              @click="dialog = false"
            >
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
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

export default {
  name: "CAccessController",
  mixins: [],

  components: { CUserInput, UDenseCirclesUsers },
  props: {
    modern: { type: Boolean, default: false },
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
      return ShopPermissionRegions;
    },
    admins_url() {
      if (!this.shop) return null;
      return URLS.AdminShopURL(this.shop.id) + "/setting/staff";
    },

    has_more() {
      return this.total > this.moderators.length;
    },
    can_manage() {
      return (
        (!this.shop ||
          this.writeShopAccess(ShopPermissionRegions.COMMUNITY.code)) &&
        !!this.community.access?.admin
      );
    },
  },
  created() {},

  methods: {
    showModerators() {
      if (this.modern && !this.can_manage) return;
      if (!this.total) this.getModerators(); // Try to fetch moderators
      this.dialog = true;
    },
    //――――――――――――――――――――――――― Get List ―――――――――――――――――――――――――

    getMore() {
      if (this.has_more && !this.busy_fetch) {
        this.page++;
        this.getModerators();
      }
    },

    getModerators() {
      if (this.busy_fetch) return;
      const requested_page = this.page;
      this.busy_fetch = true;

      return axios
        .get(window.CAPI.GET_COMMUNITY_MODERATORS(this.community.id), {
          params: {
            offset: (requested_page - 1) * this.itemsPerPage,
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
            this.page = Math.max(1, requested_page - 1);
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.page = Math.max(1, requested_page - 1);
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    //――――――――――――――――――――――――― Add ―――――――――――――――――――――――――

    addModerator() {
      if (this.busy_add || (this.modern && !this.can_manage)) return;
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
              this.$t("community.access.add_moderator"),
              this.$t("community.access.modern.added"),
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
      if (this.busy_remove || (this.modern && !this.can_manage)) return;
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
              this.$t("community.access.modern.remove"),
              this.$t("community.access.modern.removed"),
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

<style lang="scss" scoped>
.c-access-controller--modern {
  min-width: 0;
  padding: 24px;
  border-radius: 15px;
  font-size: 13px;
  line-height: 20px;
  .sd-modern-title-text {
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
    letter-spacing: -0.15px;
  }
  .sd-modern-title {
    gap: 9px;
  }
  .c-access-controller__header {
    margin-block-end: 18px;
  }
  .c-access-controller__role {
    padding-block: 17px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .c-access-controller__role:first-of-type {
    padding-block-start: 0;
    border-block-start: 0;
  }
  .c-access-controller__role:last-of-type {
    padding-block-end: 0;
  }
  .c-access-controller__role-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }
  .c-access-controller__role-label {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 19px;
  }
  .c-access-controller__description {
    margin-block: 5px 8px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  .c-access-controller__people {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  @media (max-width: 600px) {
    padding: 19px;
  }
}
.c-access-controller-dialog {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 28px;
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
    white-space: normal;
  }
  &__section {
    width: min(760px, 100%);
    margin: 0 auto 20px;
  }
  &__actions {
    justify-content: flex-end;
    margin-block: 20px 0;
  }
  :deep(.sd-modern-form-header h2) {
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
  }
  :deep(.v-list-item-title) {
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }
  :deep(.v-list-item-subtitle) {
    font-size: 11px;
    line-height: 17px;
    overflow-wrap: anywhere;
    white-space: normal;
  }
}
</style>
