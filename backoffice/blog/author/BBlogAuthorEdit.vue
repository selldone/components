<template>
  <span
    v-if="article?.id && writeShopAccess(ShopPermissionRegions.BLOG.code)"
    class="b-blog-author-edit d-inline-flex align-center text-start"
    @click.stop
  >
    <v-dialog
      v-model="open"
      :aria-label="$t('admin_shop.blogs.author.title')"
      :persistent="busy"
      max-width="520"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          :aria-label="$t('admin_shop.blogs.author.change_action')"
          icon
          :size="$vuetify.display.smAndDown ? 40 : 32"
          variant="text"
        >
          <v-icon size="16">edit</v-icon>
          <v-tooltip activator="parent" location="top" :disabled="open">
            {{ $t("admin_shop.blogs.author.change_action") }}
          </v-tooltip>
        </v-btn>
      </template>
      <v-card class="b-blog-author-edit text-start" rounded="xl">
        <v-card-title class="pa-5 pb-2 text-h6">
          {{ $t("admin_shop.blogs.author.title") }}
        </v-card-title>
        <v-card-text class="px-5 pt-0 pb-4">
          <div class="text-body-2 font-weight-medium mb-4 text-break">
            {{ article.title }}
          </div>
          <p class="text-body-2 mb-5">
            {{ $t("admin_shop.blogs.author.hint") }}
          </p>
          <s-user-input
            v-if="open"
            :label="$t('admin_shop.blogs.author.search_label')"
            :placeholder="$t('admin_shop.blogs.author.search_placeholder')"
            :suggestion-source="searchEligibleStaffs"
            :menu="true"
            :disabled="busy"
            :can-invite="false"
            variant="underlined"
            persistent-placeholder
            autofocus
            @update:user="selected_user = $event"
          />
        </v-card-text>
        <v-card-actions class="px-5 pb-5 flex-wrap ga-2">
          <v-spacer />
          <v-btn :disabled="busy" variant="text" @click="open = false">
            {{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            :disabled="!can_assign"
            :loading="busy"
            color="primary"
            variant="flat"
            @click="assignAuthor"
          >
            {{ $t("admin_shop.blogs.author.assign_action") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script lang="ts">
import SUserInput from "../../user/input/SUserInput.vue";
import NotificationService from "../../../plugins/notification/NotificationService.ts";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import { CleanCache } from "@selldone/core-js/server";

export default {
  name: "BBlogAuthorEdit",
  components: { SUserInput },
  props: {
    shop: { type: Object, required: true },
    article: { type: Object, required: true },
  },
  data: () => ({
    ShopPermissionRegions,
    open: false,
    busy: false,
    selected_user: null,
  }),
  computed: {
    can_assign() {
      return (
        !this.busy &&
        !!this.selected_user?.id &&
        this.selected_user.id !== this.article.user_id
      );
    },
  },
  watch: {
    open() {
      this.selected_user = null;
    },
  },
  methods: {
    searchEligibleStaffs(search) {
      return axios
        .get(window.API.GET_SHOP_ELIGIBLE_STAFFS(this.shop.id), {
          params: { search, limit: 30 },
        })
        .then(({ data }) => {
          if (data.error) throw { response: { data } };
          return data.users;
        });
    },
    assignAuthor() {
      if (
        !this.can_assign ||
        !this.writeShopAccess(ShopPermissionRegions.BLOG.code)
      )
        return;

      this.busy = true;
      axios
        .put(window.API.PUT_SHOP_ARTICLE_AUTHOR(this.shop.id, this.article.id), {
          user_id: this.selected_user.id,
        })
        .then(({ data }) => {
          if (data.error)
            return NotificationService.showErrorAlert(null, data.error_msg);

          // Keep unsaved article content intact when changing its author.
          this.article.user_id = data.article.user_id;
          this.article.user = data.article.user;
          this.article.updated_at = data.article.updated_at;
          CleanCache();
          this.open = false;
          NotificationService.showSuccessAlert(
            null,
            this.$t("admin_shop.blogs.author.success"),
          );
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>
