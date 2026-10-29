<template>
  <span
    v-if="article?.id && writeShopAccess(ShopPermissionRegions.BLOG.code)"
    class="b-blog-author-edit text-start"
    :class="$slots.activator ? 'd-block' : 'd-inline-flex align-center'"
    @click.stop
  >
    <v-dialog
      v-model="open"
      :aria-label="$t('admin_shop.blogs.author.title')"
      :persistent="busy"
      max-width="520"
    >
      <template v-slot:activator="{ props }">
        <slot name="activator" :props="props">
        <v-btn
          v-bind="props"
          :disabled="disabled || busy"
          :aria-label="$t('admin_shop.blogs.author.change_action')"
          icon
          :size="modern ? undefined : $vuetify.display.smAndDown ? 40 : 32"
          :class="{
            'sd-modern-icon-button b-blog-author-edit__modern-action': modern,
          }"
          variant="text"
        >
          <v-icon :size="modern ? 15 : 16">edit</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            :disabled="open"
            :content-class="modern ? 'sd-modern-tooltip text-start' : undefined"
            :open-on-focus="true"
          >
            {{ $t("admin_shop.blogs.author.change_action") }}
          </v-tooltip>
        </v-btn>
        </slot>
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
            :disabled="busy || disabled"
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
  emits: ["busy"],
  components: { SUserInput },
  props: {
    shop: { type: Object, required: true },
    article: { type: Object, required: true },
    modern: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
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
        !this.disabled &&
        !!this.selected_user?.id &&
        this.selected_user.id !== this.article.user_id
      );
    },
  },
  watch: {
    busy(value) { this.$emit("busy", value); if (!value && this.disabled) this.open = false; },
    disabled(value) { if (value && !this.busy) this.open = false; },
    open() {
      this.selected_user = null;
    },
  },
  methods: {
    searchEligibleStaffs(search) {
      if (this.disabled || !this.writeShopAccess(ShopPermissionRegions.BLOG.code)) return Promise.resolve([]);
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
      const sourceArticle = this.article, articleId = this.article.id, shopId = this.shop.id;
      axios
        .put(
          window.API.PUT_SHOP_ARTICLE_AUTHOR(this.shop.id, this.article.id),
          {
            user_id: this.selected_user.id,
          },
        )
        .then(({ data }) => {
          if (sourceArticle !== this.article || articleId !== this.article.id || shopId !== this.shop.id || !this.writeShopAccess(ShopPermissionRegions.BLOG.code)) return;
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

<style lang="scss" scoped>
.b-blog-author-edit .b-blog-author-edit__modern-action {
  --sd-modern-icon-button-size: 32px;
  border-radius: 8px;
}

@media (max-width: 760px), (pointer: coarse) {
  .b-blog-author-edit .b-blog-author-edit__modern-action {
    --sd-modern-icon-button-size: 44px;
  }
}
</style>
