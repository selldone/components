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
  <v-container class="--add-extra-top-header">
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Breadcrumb ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <community-breadcrumb
      v-model:show-bot="show_bot"
      v-model:show-edit="show_edit"
      v-model:show-report="show_report"
      :community="community"
      :shop="shop"
      class="mb-6 breadcrumb-max-w"
      has-bot
      has-edit
      has-report
    ></community-breadcrumb>
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Bot ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <v-expand-transition>
      <community-bots-edit v-if="show_bot" :community="community">
      </community-bots-edit>
    </v-expand-transition>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Title ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <v-expand-transition>
      <community-header
        v-if="!show_edit && !show_report"
        :desc="community.desc"
        :subtitle="'@' + community.name"
        :title="community.title"
      >
      </community-header>
    </v-expand-transition>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Report ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <v-expand-transition>
      <div v-if="access.admin" v-show="show_report">
        <community-statistic
          :community="community"
          :timeSeries="communityTimeSeries"
          style="margin-bottom: 5vh"
        ></community-statistic>
      </div>
    </v-expand-transition>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Edit ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <v-expand-transition>
      <div v-if="access.admin && show_edit" class="c-max-w">
        <community-edit
          :community="community"
          @update:community="
            (val) => {
              $emit('update:community', val);
              show_edit = false;
            }
          "
        ></community-edit>
      </div>
    </v-expand-transition>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Categories ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <v-row align="stretch" justify="start">
      <v-col
        v-for="(category, i) in categories"
        :key="category.id"
        :style="{ 'animation-delay': 50 * (i % 12) + 'ms' }"
        class="fadeInUp"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        <community-category-card
          :category="category"
          :showReport="show_report"
          class="min-h-100"
        ></community-category-card>
      </v-col>
      <!-- -------------------- Add Card ------------------------ -->

      <v-col
        v-if="access.admin"
        key="add"
        :style="{ 'animation-delay': 50 * (6 % 12) + 'ms' }"
        class="fadeInUp"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        <div class="c-container -force-rounded pa-2 pa-sm-3">
          <v-card class="c-widget -hover" @click="showAddCategory()">
            <v-icon class="d-block text-center m-3" color="success" size="48"
              >add
            </v-icon>
            <v-card-title>{{ $t("community.category.add_new") }}</v-card-title>
            <v-card-subtitle style="min-height: 60px">
              {{ $t("community.category.add_new_msg") }}
            </v-card-subtitle>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- -------------------- Add category dialog ------------------------ -->
    <v-dialog
      v-model="dialog_add"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="text-start">
        <v-card-title>
          <v-icon class="me-1">folder_open</v-icon>
          {{ $t("community.category.add_new") }}
        </v-card-title>
        <v-card-subtitle
          >{{ $t("community.category.add_new_msg") }}
        </v-card-subtitle>
        <v-card-text>
          <community-category-edit
            v-if="dialog_add"
            ref="editor"
            :community="community"
            @add="
              (cat) => {
                AddOrUpdateItemByID(categories, cat);
                dialog_add = false;
              }
            "
          ></community-category-edit>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog_add = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
            <v-btn
              :loading="busy_add"
              color="primary"
              size="x-large"
              variant="flat"
              @click="
                $refs.editor.save((val) => {
                  busy_add = val;
                })
              "
            >
              <v-icon class="me-1">add </v-icon>
              {{ $t("global.actions.add") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import CommunityBreadcrumb from "../widgets/header/CommunityBreadcrumb.vue";
import CommunityCategoryCard from "../widgets/category/CommunityCategoryCard.vue";
import CommunityStatistic from "../widgets/community/CommunityStatistic.vue";
import CommunityEdit from "../widgets/community/CommunityEdit.vue";
import CommunityCategoryEdit from "../widgets/category/CommunityCategoryEdit.vue";
import CommunityHeader from "../widgets/header/CommunityHeader.vue";
import CommunityBotsEdit from "../widgets/community/CommunityBotsEdit.vue";

export default {
  name: "CommunityHomePage",
  components: {
    CommunityBotsEdit,
    CommunityHeader,
    CommunityCategoryEdit,
    CommunityEdit,
    CommunityStatistic,
    CommunityCategoryCard,
    CommunityBreadcrumb,
  },
  props: {
    shop: {},
    community: { required: true, type: Object },
    communityTimeSeries: {},
    categories: { required: true, type: Array },
    data: {},

    moderator: {
      default: false,
    },
  },

  data() {
    return {
      show_report: false,
      show_edit: false,
      show_bot: false,

      //----------------------------------

      dialog_add: false,
      busy_add: false,
    };
  },

  computed: {
    access() {
      return this.community.access;
    },
  },
  watch: {},

  created() {},
  mounted() {},

  methods: {
    //――――――――――――――――――――――― New category ―――――――――――――――――――――――

    showAddCategory() {
      this.dialog_add = true;
    },
  },
};
</script>

<style lang="scss" scoped></style>
