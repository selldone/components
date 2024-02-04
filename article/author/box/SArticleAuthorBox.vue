<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <v-container v-bind="$attrs">
    <v-row v-if="article.user_id > 0" align="center" no-gutters>
      <v-avatar size="160px" class="m-2 hide-on-small-900 avatar-gradient">
        <v-img :src="author_avatar" />
      </v-avatar>

      <v-col class="text-start author-box px-2">
        <p class="author-title">
          {{ $t("global.article.about_author") }}
        </p>
        <h3 class="author-name mt-5">
          <router-link
            :to="{
              name: 'AuthorPage',
              params: { author: slugify(user.name), author_id: user.id },
            }"
          >
            {{ author_name }}
          </router-link>

          <v-btn
            v-if="canFollow"
            variant="flat"
            rounded
            :color="isFollow ? 'success' : 'default'"
            class="ms-2"
            size="small"
            @click="followUser"
            :loading="busy_follow"
          >
            <span v-if="isFollow" class="fas fa-check-circle me-2" />
            {{
              isFollow
                ? $t("global.article.followed")
                : $t("global.article.follow_action")
            }}
          </v-btn>
        </h3>

        <p class="author-description my-1">
          {{ author_description }}
        </p>

        <span>
          <template v-if="article.updated_at">
            <time class="small author-time">
              <v-icon class="me-1" size="16"> fa:fas fa-feather</v-icon>

              {{ $t("global.article.updated_at") }}

              {{ getLocalTimeString(article.updated_at) }}
            </time>
          </template>
          <span v-else class="small text-muted">
            {{ $t("global.article.now") }}
          </span>

          <v-tooltip location="bottom" activator="parent">
            {{
              $t("global.article.wrote_at") +
              " " +
              getLocalTimeStringSmall(article.created_at)
            }}
          </v-tooltip>
        </span>
      </v-col>

      <v-col cols="12" class="text-end">
        <!-- Report & Delete Article -->
        <v-btn
          v-if="(canDelete || canReport) && !reported"
          variant="text"
          rounded
          size="small"
          class="m-1"
          :color="canDelete ? '#D32F2F' : '#444'"
          @click.stop="dialog_report = true"
        >
          <v-icon class="mx-1">
            {{ canDelete ? "block" : "flag" }}
          </v-icon>
          {{
            canDelete
              ? $t("global.article.report_and_delete_action")
              : $t("global.article.report_action")
          }}
        </v-btn>

        <v-alert
          v-if="reported"
          :value="reported"
          color="error"
          icon="new_releases"
          border="start"
          density="compact"
          class="mt-5 text-start pp"
          @click="dialog_report = true"
        >
          {{ $t("global.article.you_reported_this_article") }}
        </v-alert>
      </v-col>

      <v-col
        v-if="
          socials &&
          (socials.linkedin ||
            socials.selldone ||
            socials.twitter ||
            socials.medium)
        "
        cols="12"
      >
        <v-btn
          v-if="socials.linkedin"
          variant="text"
          color="#000"
          class="m-2"
          dir="ltr"
          size="small"
          icon
          :href="`https://www.linkedin.com/in/${socials.linkedin}`"
          target="_blank"
        >
          <v-icon size="20"> fa:fab fa-linkedin</v-icon>
        </v-btn>

        <v-btn
          v-if="socials.twitter"
          variant="text"
          color="#000"
          class="m-2"
          dir="ltr"
          size="small"
          icon
          :href="`https://twitter.com/${socials.twitter}`"
          target="_blank"
        >
          <v-icon size="20"> fa:fab fa-twitter</v-icon>
        </v-btn>

        <v-btn
          v-if="socials.medium"
          variant="text"
          color="#000"
          class="m-2"
          dir="ltr"
          size="small"
          icon
          :href="`https://medium.com/@${socials.medium}`"
          target="_blank"
        >
          <v-icon size="20"> fa:fab fa-medium</v-icon>
        </v-btn>

        <v-btn
          v-if="socials.selldone"
          variant="text"
          color="#000"
          class="m-2"
          dir="ltr"
          size="small"
          icon
          :href="`${SetupService.MainServiceUrl()}/@${socials.selldone}`"
          target="_blank"
          :title="`@${socials.selldone}`"
        >
          <v-icon size="20"> fa:fas fa-store</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>

  <!-- ██████████████████████ Dialog > Report Article ██████████████████████ -->

  <s-content-violation-report-dialog
    v-model="dialog_report"
    @report="reportArticle"
    @delete="reportDeleteArticle"
    :can-delete="canDelete"
    :loading="busy_report"
  ></s-content-violation-report-dialog>
</template>

<script>
import { defineComponent } from "vue";
import SContentViolationReportDialog from "@components/ui/dialog/conent-violation-report/SContentViolationReportDialog.vue";

export default defineComponent({
  name: "SArticleAuthorBox",
  components: { SContentViolationReportDialog },
  props: {
    article: {
      required: true,
      type: Object,
    },
    isFollow: Boolean,
    reported: Boolean,
  },

  data() {
    return {
      dialog_report: false,

      busy_follow: false,

      // ----------- Report ------------
      busy_report: false,
    };
  },
  computed: {
    author_avatar() {
      return this.getUserAvatar(this.article.user_id, "big");
    },
    user() {
      return this.article.user;
    },
    author_name() {
      if (!this.article || !this.article.user) return null;
      if (!this.article.user.profile) return this.article.user.name;
      return this.article.user.profile.name;
    },

    author_description() {
      if (!this.article || !this.article.user || !this.article.user.profile)
        return null;
      return this.article.user.profile.description;
    },

    socials() {
      if (
        !this.article ||
        !this.article.user ||
        !this.article.user.profile ||
        !this.article.user.profile.socials ||
        !Object.keys(this.article.user.profile.socials).length
      )
        return null;
      return this.article.user.profile.socials;
    },

    canDelete() {
      // Supervisor delete access!
      return (
        this.USER() &&
        this.article &&
        this.article.user_id !== this.USER_ID() &&
        this.HasPermission /*Available only in official selldone*/ &&
        this.HasPermission(
          this.permissions.Content,
          this.permissionLevels.DELETE_ACCESS,
        )
      );
    },

    canFollow() {
      return (
        this.USER() && this.article && this.article.user_id !== this.USER_ID()
      );
    },

    canReport() {
      // Report.
      return (
        this.USER() && this.article && this.article.user_id !== this.USER_ID()
      );
    },
  },

  methods: {
    //――――――――――――――――――――――― Follow ―――――――――――――――――――――――
    followUser() {
      this.isFollow = !this.isFollow;

      this.busy_follow = true;
      axios
        .post(window.ARTICLE_API.POST_FOLLOW_USER(this.article.user_id), {
          follow: this.isFollow,
        })
        .then(({ data }) => {
          if (data.error) {
            this.isFollow = !this.isFollow;
            this.$emit("update:isFollow", this.isFollow);
          }
        })
        .catch((error) => {
          console.log(error);
          this.isFollow = !this.isFollow;
        })
        .finally(() => {
          this.busy_follow = false;
        });
    },

    //――――――――――――――――― Admin > Report & Delete this article ―――――――――――――――――

    reportDeleteArticle(report) {
      this.busy_report = true;
      axios
        .delete(
          window.ADMIN_API.DELETE_ARTICLE_BY_ADMIN(this.article.id, report),
        )
        .then(({ data }) => {
          if (data.error) {
            // Error!
            this.showErrorAlert(
              null,
              data.error_msg
                ? data.error_msg
                : this.$t("global.article.notifications.delete_error"),
            );
            return;
          }

          this.dialog_report = false;
          this.showSuccessAlert(
            this.$t(
              "global.article.notifications.report_and_delete_success_title",
            ),
            this.$t(
              "global.article.notifications.report_and_delete_success_message",
            ),
          );
          this.$router.go(-1);
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_report = false;
        });
    },

    reportArticle(report) {
      this.busy_report = true;
      axios
        .post(window.ARTICLE_API.POST_REPORT_ARTICLE(this.article.id, report))
        .then(({ data }) => {
          if (data.error) {
            // Error!
            this.showErrorAlert(null, data.error_msg);
            return;
          }
          this.dialog_report = false;
          this.showSuccessAlert(
            this.$t("global.article.notifications.report_success_title"),
            this.$t("global.article.notifications.report_success_message"),
          );
          this.reported = true;
          this.$emit("update:reported", this.reported);
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_report = false;
        });
    },
  },
});
</script>

<style scoped lang="scss">
.author-box {
  .author-title {
    font-size: 0.9rem;
    font-weight: 400;
    opacity: 0.7;
  }

  .author-name {
    font-size: 1.32rem;
  }

  .author-description {
    font-size: 1rem;
  }

  .author-time {
    font-size: 0.9rem;
    color: #aaa;
  }
}
</style>