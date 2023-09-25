<template>
  <v-container class="--add-extra-top-header">
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Breadcrumb ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <community-breadcrumb
      :shop="shop"
      class="mb-6 breadcrumb-max-w"
      :community="community"
      :show-report.sync="show_report"
      :show-edit.sync="show_edit"
      has-report
      has-edit
      has-bot
      :show-bot.sync="show_bot"
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
        :title="community.title"
        :subtitle="'@' + community.name"
        :desc="community.desc"
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

    <v-row justify="start" align="stretch">
      <v-col
        cols="12"
        sm="6"
        md="4"
        lg="3"
        v-for="(category, i) in categories"
        :key="category.id"
        class="fadeInUp"
        :style="{ 'animation-delay': 50 * (i % 12) + 'ms' }"
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
        cols="12"
        sm="6"
        md="4"
        lg="3"
        key="add"
        class="fadeInUp"
        :style="{ 'animation-delay': 50 * (6 % 12) + 'ms' }"
      >
        <div class="c-container -force-rounded pa-2 pa-sm-3">
          <v-card class="c-widget -hover" @click="showAddCategory()">
            <v-icon color="success" size="48" class="d-block text-center m-3"
              >add</v-icon
            >
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
      transition="dialog-bottom-transition"
      scrollable
    >
      <v-card class="text-start">
        <v-card-title><v-icon class="me-1">folder_open</v-icon> {{ $t("community.category.add_new") }}</v-card-title>
        <v-card-subtitle>{{
          $t("community.category.add_new_msg")
        }}</v-card-subtitle>
        <v-card-text>
          <community-category-edit
            v-if="dialog_add"
            :community="community"
            ref="editor"
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
            <v-btn text @click="dialog_add=false" x-large>
              <v-icon class="me-1">close</v-icon>
              {{ $t("global.actions.close") }}</v-btn
            >
            <v-btn
              depressed
              color="primary"
              x-large
              @click="
                $refs.editor.save((val) => {
                  busy_add = val;
                })
              "
              :loading="busy_add"
            >
              <v-icon class="me-1">add</v-icon
              >{{ $t("global.actions.add") }}</v-btn
            >
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

<style scoped lang="scss"></style>
