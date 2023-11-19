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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="master-article-container">
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Loading animation ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <progress-loading v-if="inLoading" />
    <progress-loading v-if="busy_fix" color="#673AB7" />

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Not found article ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <div v-if="NOT_FOUND_ARTICLE">
      <div class="text-center font-weight-thin display-1 my-16">Not Found</div>

      <h2 class="text-secondary text-center">
        {{ error_msg }}
      </h2>
    </div>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Need login ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <div v-if="NEED_LOGIN">

      <div class="text-center font-weight-thin display-1 my-16">Private</div>


      <h2 class="text-secondary text-center">
        {{ $t("global.article.login_to_see_error") }}
      </h2>
    </div>

    <v-btn
      v-if="can_edit && can_create_new"
      rounded
      color="primary"
      dark
      @click="
        () => {
          can_create_new = false;
          prepareCreateNew();
        }
      "
    >
      {{ $t("global.article.create_new_action") }}
    </v-btn>

    <!-- ――――――――――――――――――――― Main content ▶ After loading ――――――――――――――――――――― -->

    <div v-show="showContent" class="article article-container">
      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Top author info + Edit / Follow / Save ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <v-toolbar
        v-if="USER() && can_edit && canEdit"
        flat
        color="transparent"
        class="overflow-x-auto"
        height="62"
        min-height="62"
      >
        <v-toolbar-items>
          <v-btn
            v-if="render_state === 'review'"
            @click="render_state = 'editing'"
            class="sub-caption b4px rounded"
            :caption="$t('global.article.menu.edit')"
            dark
            color="primary"
            depressed
            min-width="64"
          >
            <v-icon small>edit</v-icon>
          </v-btn>

          <v-btn
            v-if="is_editing"
            @click="render_state = 'review'"
            class="sub-caption b4px rounded"
            :caption="$t('global.article.menu.view_mode')"
            light
            color="#fff"
            depressed
            min-width="64"
          >
            <v-icon small>visibility</v-icon>
          </v-btn>

          <v-divider vertical class="my-0 mx-3"></v-divider>
        </v-toolbar-items>

        <v-toolbar-items>
          <!-------------------------- Toggles -------------------------->

          <v-btn
            v-if="published_state"
            icon
            key="pls"
            class="sub-caption b4px"
            :caption="$t('global.article.published')"
            @click="published_state = !published_state"
            :class="{ pen: !is_editing, disabled: !!schedule_at }"
          >
            <v-icon color="green" small> fas fa-rss </v-icon>
          </v-btn>
          <v-btn
            v-if="!published_state"
            icon
            key="dra"
            class="sub-caption b4px"
            :caption="$t('global.article.draft')"
            @click="published_state = !published_state"
            :class="{ pen: !is_editing, disabled: !!schedule_at }"
          >
            <v-icon color="#FFA000" small> fas fa-pencil-ruler </v-icon>
          </v-btn>

          <v-btn
            v-if="isPrivate"
            icon
            @click="isPrivate = !isPrivate"
            class="sub-caption b4px"
            key="pri"
            :caption="$t('global.article.private')"
            :class="{ pen: !is_editing }"
          >
            <v-icon small color="red"> fas fa-user-lock </v-icon>
          </v-btn>
          <v-btn
            v-if="!isPrivate"
            icon
            @click="isPrivate = !isPrivate"
            class="sub-caption b4px"
            key="pub"
            :caption="$t('global.article.public')"
            :class="{ pen: !is_editing }"
          >
            <v-icon small color="blue"> fas fa-globe </v-icon>
          </v-btn>

          <!-------------------------------------------------------------------------->

          <v-btn
            v-if="article.schedule_at"
            icon
            @click="showTimeline()"
            class="sub-caption b4px"
            :caption="$t('global.article.schedule_input')"
            :title="
              $t('global.article.publish_at') +
              ' : ' +
              getLocalTimeString(article.schedule_at)
            "
          >
            <v-icon small color="pink"> timeline </v-icon>
          </v-btn>

          <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Language ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

          <s-language-input
            v-model="article.lang"
            dense
            :title="$t('global.commons.language')"
            @change="onChangeNote()"
            class="mx-2 mt-4 overflow-hidden"
            menu
            max-width="130px"
            solo
            flat
            :disabled="!is_editing || !!forceLanguage"
            prepend-inner-icon="translate"
            :class="{ pen: !is_editing }"
          >
          </s-language-input>

          <v-divider vertical class="my-0 mx-2"></v-divider>

          <v-btn
            icon
            @click="$refs.editorContainer.showSelectWord()"
            title="Import word (.docx)"
            :class="{ pen: !is_editing }"
          >
            <img
              src="../../../core/enums/file/assets/extensions/docx.svg"
              width="24"
              height="24"
            />
          </v-btn>

          <v-btn
            v-if="article?.id && !IS_VENDOR_PANEL"
            icon
            @click="showGoogleSearch()"
            title="Show Google Search Rank."
          >
            <img
              src="../assets/tradmark/google.svg"
              width="24"
              height="24"
            />
          </v-btn>

          <v-slide-y-transition>
            <ai-button
              v-if="
                articleType === ArticleTypes.Product.code &&
                is_editing &&
                !IS_VENDOR_PANEL
              "
              title="Write article - 😈 Beta version | ⚡ Due to high demand and limited resources, there may be errors. Please try again later after 60sec."
              @click="autoGenerate(true)"
              :loading="auto_generate_busy"
            >
            </ai-button>
          </v-slide-y-transition>
        </v-toolbar-items>

        <v-spacer />

        <v-toolbar-items class="pt-1 pt-md-3">
          <template v-if="is_editing">
            <v-btn
              rounded
              class="mx-2"
              :color="
                published_state ? 'success' : schedule_at ? 'blue' : 'amber'
              "
              dark
              :loading="state === 'saving'"
              :text="state === 'no-change'"
              :class="{
                disabled:
                  state === 'saving' ||
                  (state === 'no-change' &&
                    published_state === article.published &&
                    isPrivate === article.private),
              }"
              @click="saveChange(null)"
              depressed
            >
              <v-icon class="me-2" small>
                {{
                  state === "changed"
                    ? "save"
                    : state === "saving"
                    ? "refresh"
                    : published_state
                    ? "local_cafe"
                    : "save"
                }}
              </v-icon>
              {{
                state === "saving"
                  ? $t("global.article.saving")
                  : published_state
                  ? $t("global.article.save_and_publish_action")
                  : $t("global.article.save_draft_action")
              }}
            </v-btn>

            <s-smart-menu
              :items="[
                ...(can_auto_translate
                  ? [
                      {
                        title: `Auto translate to ${forceLanguage.toUpperCase()}`,
                        icon: 'flash_on',
                        click: () =>
                          $emit('request-auto-translate', forceLanguage),
                      },
                    ]
                  : []),

                {
                  title: 'Auto fix article',
                  icon: 'auto_fix_high',
                  click: () => autoFixArticle(),
                  disabled: !article?.body,
                },

                {
                  title: $t('global.article.menu.delete'),
                  icon: 'delete',
                  click: () => openDeleteArticleAlert(),
                  disabled: !article || !article.id,
                },
              ]"
            >
            </s-smart-menu>
          </template>

          <template v-if="canEdit && !is_editing && languages && multiLanguage">
            <s-language-input
              :value="article.lang"
              @input="(lang) => loadArticleLanguage(lang)"
              flat
              solo
              prepend-inner-icon="post_add"
              :available-languages="languages"
              hide-details
              class="overflow-hidden"
              :suffix="` (${multiLanguageAvailable.length})`"
              :checked-languages="multiLanguageAvailable"
              :title="`Available languages: ${multiLanguageAvailable.join(
                ', '
              )} + Add more languages...`"
            >
            </s-language-input>
          </template>
        </v-toolbar-items>
      </v-toolbar>

      <v-expand-transition>
        <div v-if="is_editing">
          <v-container>
            <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Article Edit Top Menu ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

            <s-article-seo-editor
              v-if="article && canEdit"
              class="my-2"
              :article="article"
              @change="state = 'changed'"
              :data-images="images_in_article"
              @open-menu="$refs.editorContainer.findAllImages()"
              @save-change="saveChange"
            />

            <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Schedule At ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

            <v-expansion-panels
              class="my-2 s--shadow-no-padding rounded-28px overflow-hidden"
              flat
            >
              <v-expansion-panel>
                <v-expansion-panel-header
                  :color="schedule_at ? '#0288D1' : undefined"
                  :class="{ 'white--text': !!schedule_at }"
                  class="py-3"
                  style="min-height: 60px"
                  :title="$t('global.article.schedule_title')"
                >
                  <div
                    class="d-flex align-start align-sm-center flex-column flex-sm-row"
                  >
                    <div>
                      <div>
                        <v-icon
                          class="me-1"
                          :color="schedule_at ? '#fff' : undefined"
                          >{{
                            schedule_at ? "watch_later" : "schedule"
                          }}</v-icon
                        >
                        {{ $t("global.article.schedule_action") }}
                      </div>
                      <time-progress-bar
                        v-if="article && schedule_at"
                        :created-time="article.created_at"
                        :start-time="schedule_at"
                        small
                        class="max-w-250 mt-2"
                      ></time-progress-bar>
                    </div>

                    <v-spacer></v-spacer>
                    <div class="my-1">
                      {{ getFromNowString(schedule_at) }}
                      <span class="subtitle-2 d-block mt-1">{{
                        getLocalTimeString(schedule_at)
                      }}</span>
                    </div>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <date-time-picker-global
                    v-model="schedule_at"
                    return-utc
                    class="max-widget-width mx-auto mt-5"
                    :label="$t('global.article.schedule_input')"
                    clearable
                    :placeholder="
                      $t('global.article.schedule_input_placeholder')
                    "
                    :min="new Date().toISOString()"
                  />

                  <div class="widget-buttons">
                    <v-btn
                      @click.stop="showTimeline()"
                      text
                      color="primary"
                      class="tnt"
                      x-large
                    >
                      <v-icon class="me-2">timeline</v-icon>
                      {{ $t("global.article.schedule_view_action") }}
                    </v-btn>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Multi Language ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

            <v-expansion-panels
              v-if="multiLanguage"
              class="my-2 s--shadow-no-padding rounded-28px overflow-hidden"
              flat
            >
              <v-expansion-panel>
                <v-expansion-panel-header class="py-3" style="min-height: 60px">
                  <span>
                    <v-icon class="me-1">translate</v-icon>
                    Multi Languages
                  </span>

                  <v-spacer></v-spacer>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div class="max-widget-width">
                    <v-list class="border-between-vertical">
                      <v-list-item
                        v-for="lang in languages"
                        :key="lang"
                        class="row-hover"
                        @click="loadArticleLanguage(lang)"
                        :class="{
                          pen:
                            article &&
                            article.lang &&
                            article.lang.toLowerCase() === lang.toLowerCase(),
                        }"
                      >
                        <v-list-item-icon>
                          <flag
                            v-if="getLanguageObject(lang)"
                            :iso="getLanguageObject(lang).flag"
                            :squared="false"
                            class="mt-1"
                          />
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title class="d-flex align-center">
                            <b>
                              {{
                                getLanguageObject(lang)
                                  ? getLanguageObject(lang).title
                                  : lang
                              }}</b
                            >
                            <v-chip
                              v-if="
                                shop &&
                                lang.toLowerCase() ===
                                  shop.language.toLowerCase()
                              "
                              label
                              small
                              class="px-1 mx-1"
                              outlined
                              title="Default article (Shop main language)"
                              >{{ $t("global.commons.default") }}</v-chip
                            >
                            <v-spacer></v-spacer>
                          </v-list-item-title>
                        </v-list-item-content>

                        <v-list-item-action class="my-2">
                          <v-btn
                            v-if="
                              multiLanguageAvailable &&
                              !multiLanguageAvailable.includes(
                                lang.toLowerCase()
                              )
                            "
                            @click.stop="$emit('request-auto-translate', lang)"
                            fab
                            color="primary"
                            dark
                            small
                            class="rounded-14-12"
                            :title="$t('global.commons.translate')"
                          >
                            <v-icon>g_translate</v-icon>
                          </v-btn>

                          <v-icon
                            v-else-if="multiLanguageAvailable"
                            small
                            color="success"
                            class="mx-1"
                            title="Article exist"
                            >check_circle</v-icon
                          >
                        </v-list-item-action>

                        <v-list-item-icon>
                          <v-icon
                            :color="
                              article &&
                              article.lang &&
                              article.lang.toLowerCase() === lang.toLowerCase()
                                ? 'primary'
                                : '#333'
                            "
                            >{{
                              article &&
                              article.lang &&
                              article.lang.toLowerCase() === lang.toLowerCase()
                                ? "circle"
                                : "radio_button_unchecked"
                            }}</v-icon
                          >
                        </v-list-item-icon>
                      </v-list-item>
                    </v-list>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Tags (Only available for shop blogs!) ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

            <v-expansion-panels
              v-if="article?.id /*Should be saved!*/ && is_shop_blog"
              class="my-2 s--shadow-no-padding rounded-28px overflow-hidden"
              flat
            >
              <v-expansion-panel>
                <v-expansion-panel-header style="min-height: 60px">
                  <span class="flex-grow-0 me-2">
                    <v-icon class="me-1">bookmark</v-icon>
                    {{ $t("global.commons.tags") }}
                  </span>
                  <div class="flex-grow-1">
                    <v-chip x-small label v-for="tag in article.tags" :key="tag" class="ma-1">{{tag}}</v-chip>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <s-article-tags-editor :shop="shop" :article="article" />
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

            <v-row dense class="mb-2 z1">
              <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Selldone Help Category ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
              <v-select
                v-if="articleType === ArticleTypes.SaminHelp.code && categories"
                v-model="category"
                class="m-2 max-width-field-mini s--shadow-no-padding rounded-28px bg-white"
                :items="categories"
                :label="$t('global.article.category_input')"
                :messages="$t('global.article.category_input_message')"
                solo
                flat
                clearable
                :disabled="!!menu && !!menu.parent_id"
                @change="state = 'changed'"
              >
              </v-select>
              <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Selldone Category ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
              <v-select
                v-else-if="
                  articleType === ArticleTypes.SaminBlog.code && categories
                "
                v-model="category"
                class="m-2 max-width-field-mini s--shadow-no-padding rounded-28px pb-1 ps-1 bg-white"
                flat
                :items="categories"
                item-value="category"
                item-text="category"
                :label="$t('global.article.category_input')"
                :messages="$t('global.article.category_input_message')"
                solo
                clearable
                :disabled="(!!menu && !!menu.parent_id) || busy_categories"
                @change="state = 'changed'"
                :loading="busy_categories"
              >
                <template v-slot:item="{ item }">
                  <v-avatar rounded class="me-2" v-if="item.icon" size="28"
                    ><img :src="getShopImagePath(item.icon)"
                  /></v-avatar>
                  <span class="subtitle-2">{{ item.category }}</span>
                </template>
                <template v-slot:selection="{ item }">
                  <v-avatar rounded class="me-2" v-if="item.icon" size="28"
                    ><img :src="getShopImagePath(item.icon)"
                  /></v-avatar>
                  <span class="subtitle-2">{{ item.category }}</span>
                </template>
              </v-select>

              <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Shop Blog Category ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
              <v-select
                v-else-if="articleType === ArticleTypes.Blog.code && categories"
                v-model="category"
                item-value="id"
                item-text="category"
                class="m-2 max-width-field s--shadow-no-padding rounded-28px pb-1 ps-1 bg-white"
                flat
                rounded
                :items="categories"
                :label="$t('global.article.category_input')"
                :messages="$t('global.article.category_input_message')"
                solo
                clearable
                @change="state = 'changed'"
                :loading="busy_categories"
                :disabled="busy_categories"
                :prepend-inner-icon="category ? undefined : 'tab'"
              >
                <template v-slot:item="{ item }">
                  <v-avatar rounded class="me-2" v-if="item.icon" size="28"
                    ><img :src="getShopImagePath(item.icon)"
                  /></v-avatar>
                  <div class="flex-grow-1 text-start">
                    <div class="subtitle-2">{{ item.category }}</div>
                    <small>{{ item.description }}</small>
                  </div>
                </template>
                <template v-slot:selection="{ item }">
                  <v-avatar rounded class="me-2" v-if="item.icon" size="28"
                    ><img :src="getShopImagePath(item.icon)"
                  /></v-avatar>
                  <div class="flex-grow-1 text-start">
                    <div class="subtitle-2">{{ item.category }}</div>
                    <small>{{ item.description }}</small>
                  </div>
                </template>
              </v-select>

              <cluster-select
                v-if="ArticleTypes.Blog.code && $route.params.shop_id"
                v-model="cluster_id"
                :return-object="false"
                @change="state = 'changed'"
                flat
                rounded
                solo
                clearable
                no-home
                placeholder="Select a cluster... (optional)"
                label="Resource Cluster"
                icon="workspaces_outline"
                class="m-2 max-width-field s--shadow-no-padding rounded-28px pb-1 ps-1 bg-white"
              ></cluster-select>

              <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Selldone Help parent ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

              <v-autocomplete
                v-if="
                  articleType === ArticleTypes.SaminHelp.code &&
                  menu &&
                  parent_helps_canidates
                "
                v-model="menu.parent_id"
                class="m-2 max-width-field-mini s--shadow-no-padding rounded-28px pb-1 ps-1 bg-white"
                :items="parent_helps_canidates"
                :label="$t('global.article.parent_input')"
                :messages="$t('global.article.parent_input_message')"
                solo
                flat
                rounded
                item-text="title"
                item-value="blog_id"
                :return-object="false"
                clearable
                @change="state = 'changed'"
              />

              <s-number-input
                v-if="articleType === ArticleTypes.SaminHelp.code && menu"
                messages="Order"
                v-model="menu.order"
                solo
                flat
                rounded
                class="m-2 max-width-field-mini s--shadow-no-padding rounded-28px pb-1 ps-1 bg-white z1"
                @change="state = 'changed'"
                :hide-details="false"
              ></s-number-input>

              <div
                v-if="
                  articleType === ArticleTypes.SaminHelp.code &&
                  menu &&
                  is_editing
                "
                class="m-2 max-width-field-mini s--shadow-no-padding rounded-28px bg-white z1 py-1 px-4"
              >
                <v-btn
                  icon
                  color="amber"
                  @click="
                    () => {
                      menu.star = !menu.star;
                      state = 'changed';
                    }
                  "
                  large
                >
                  <v-icon>{{ menu.star ? "star" : "star_border" }}</v-icon>
                </v-btn>
                <div class="mt-1" style="font-size: 12px; color: #8a8a8a">
                  Pin on parent
                </div>
              </div>

              <v-spacer></v-spacer>
              <template
                v-if="
                  articleType === ArticleTypes.SaminBlog.code &&
                  HasPermission(
                    permissions.Content,
                    permissionLevels.FULL_ACCESS
                  )
                "
              >
                <v-btn
                  @click="change_author_dialog = true"
                  color="primary"
                  depressed
                  style="align-self: baseline"
                  dark
                  class="m-2 tnt"
                  rounded
                  large
                >
                  <v-avatar v-if="article" size="28" class="ms-n2"
                    ><img :src="getUserAvatar(article.user_id)"
                  /></v-avatar>
                  <span class="subtitle-2 mx-1">Change author</span>
                </v-btn>

                <v-dialog v-model="change_author_dialog" max-width="480">
                  <v-card>
                    <v-card-title>Change author</v-card-title>
                    <v-card-text>
                      <user-email-input
                        v-model="user_email"
                        :messages="user_email"
                        placeholder="content@selldone.com"
                        label="Select author"
                        no-icon
                      >
                      </user-email-input>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn text @click="change_author_dialog = false">{{
                        $t("global.actions.cancel")
                      }}</v-btn>
                      <v-spacer></v-spacer>
                      <v-btn
                        depressed
                        color="primary"
                        @click="changeAuthor()"
                        :loading="busy_change_author"
                        >{{ $t("global.actions.change") }}</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </template>
            </v-row>
          </v-container>
        </div>
      </v-expand-transition>

      <hr v-if="canEdit" />

      <!-- ――――――――――――――――――――― 🔍 Google search rank ――――――――――――――――――――― -->
      <v-expand-transition>
        <div
          v-show="show_google_tank"
          class="shadow-paper rounded-14-12 max-width-container-1280px mx-auto"
        >
          <s-article-search-console
            v-if="article?.id && first_load_seo_audit"
            :key="'seo' + article?.id"
            :shop="shop"
            :article="article"
          >
          </s-article-search-console>
        </div>
      </v-expand-transition>
      <!-- ―――――――――――――――――――――――――――――――――――――――――――――――― -->

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Article ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <div class="samin-article-widget">
        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Article > Content ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
        <!-- display: inline-block; Bug in flow image correction -->

        <s-article-editor
          v-if="article"
          ref="editorContainer"
          class="p-lg-5 p-md-4 p-3 samin-article-content"
          :only-view="!canEdit"
          :edit="is_editing"
          :title.sync="article.title"
          :body.sync="article.body"
          :upload-url="upload_url"
          :word-converter-url="word_converter_url"
          @change="onChangeNote"
          @images="onChangeImages"
          :has-table-of-content="hasTableOfContent"
          :enable-title="showTitle"
          :hide-title="hideTitle"
        >
          <template v-slot:after-title>
            <!-- ――――――――――――――――――――― Author Info Small Top ――――――――――――――――――――― -->

            <p v-if="showAuthorInfo" class="text-start small m-0">
              <v-avatar
                size="32"
                class="avatar-gradient -thin hover-scale force-top"
              >
                <img :src="author_avatar" />
              </v-avatar>

              <span v-if="user" class="mx-2 text-link-normal fadeIn delay_100">
                {{ $t("global.article.author_title") }}

                <router-link
                  :to="{
                    name: 'AuthorPage',
                    params: { author: slugify(user.name), author_id: user.id },
                  }"
                >
                  {{ author_name }}
                </router-link>
              </span>

              <span v-if="category_obj" class="mx-2 text-link-normal fadeIn">
                /
                <router-link
                  :to="{
                    name: 'Blogs',
                    query: {
                      category:
                        articleType === ArticleTypes.Blog.code
                          ? category_obj.id
                          : category_obj.category,
                    },
                  }"
                >
                  <v-avatar
                    v-if="category_obj.icon"
                    class="me-1"
                    size="28"
                    rounded
                    ><img :src="getShopImagePath(category_obj.icon)"
                  /></v-avatar>
                  {{ category_obj.category }}
                </router-link>
              </span>
            </p>

            <p
              v-if="showAuthorInfo && reading_time"
              class="text-start ms-10 mt-1 reading-time"
            >
              <v-icon small class="me-1">timelapse</v-icon>
              {{ $t("global.article.read_time") }}
              :
              <span> {{ reading_time }}</span>
              {{ $t("global.article.read_time_unit") }}
            </p>
          </template>

          <template v-slot:end="{ edit }">
            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Article FAQ ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

            <faq-section
              :editMode="edit"
              :faqs.sync="article.faqs"
              @change="onChangeNote"
            ></faq-section>

            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Structured Data ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
            <s-article-structured-data
              v-if="is_editing"
              :editMode="edit"
              v-model="article.structures"
            ></s-article-structured-data>
          </template>
        </s-article-editor>

        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Article > Tags ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
        <slot v-if="article" name="tags" v-bind:article="article"></slot>

        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Article > Like / Star ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

        <div v-if="showUserFeedbackButtons && !isNew" style="min-height: 64px">
          <v-badge
            class="m-2 float-right"
            overlap
            offset-x="16"
            :color="catch_power ? '#025185' : '#0288D1'"
            :title="
              catch_power
                ? $t('global.article.claps')
                : $t('global.article.claps_action')
            "
          >
            <template v-slot:badge>
              {{ article.power | numeralFormat("0.[0] a") }}</template
            >

            <v-btn
              v-if="!isNew"
              :class="{
                'disabled-no-filter': catch_power || power_busy || !USER(),
              }"
              :color="catch_power ? '#025185' : '#0288D1'"
              depressed
              dark
              rounded
              @click="getPower"
              :outlined="!catch_power"
              :loading="power_busy"
              fab
            >
              <v-icon class="mx-2" :class="{ bounceIn: catch_power }">
                fas fa-sign-language
              </v-icon>
            </v-btn>
          </v-badge>

          <div
            v-if="hasLike"
            class="float-left pointer-pointer d-flex flex-column"
            @click="likeArticle"
          >
            <v-icon
              :large="!!USER()"
              :color="!USER() ? '#c2185b' : isLiked ? '#c2185b' : 'gray'"
              :class="{ bounceIn: isLiked }"
            >
              {{
                !USER() ? "favorite" : isLiked ? "favorite" : "favorite_border"
              }}
            </v-icon>
            <small>
              {{ article.like | numeralFormat("0.[0] a") }}
              {{ $t("global.article.likes") }}
            </small>
          </div>

          <div
            v-if="hasFavorite && USER()"
            class="ml-4 float-left pointer-pointer"
            @click="starArticle"
            :class="{ bounceIn: isStared }"
          >
            <v-icon large :color="isStared ? '#fbc02d' : 'gray'">
              {{ isStared ? "star" : "star_border" }}
            </v-icon>
          </div>
        </div>
      </div>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Share Buttons ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <!--
      <div v-if="showShareButtons && !isNew" class="mt-5 mb-3 mx-2">
        <small class="text-muted d-block mb-3"
          ><span class="fas fa-share-alt" />
          {{ $t("global.article.share") }}
        </small>
        <social-share-buttons
          :url="decodeURIComponent(window.location.href)"
          :title="article.title"
          :description="article.description"
          :quote="article.description"
          :hashtags="`${tags}`"
          telegram-rhash="7d46cf37f04f81"
        />
      </div>-->

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ author info + Edit / Follow / Save ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <v-container
        v-if="showAuthorInfo && article.user_id > 0"
        class="widget my-5"
      >
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
                depressed
                rounded
                :color="isFollow ? 'success' : 'default'"
                :dark="isFollow"
                class="ms-2"
                small
                @click="followUser"
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

            <v-tooltip v-if="article.updated_at" bottom color="success">
              <template v-slot:activator="{ on }">
                <time class="small author-time" v-on="on">
                  {{ $t("global.article.updated_at") }}

                  {{ getLocalTimeString(article.updated_at) }}
                </time>
                <v-icon class="me-1" small> fas fa-feather </v-icon>
              </template>
              {{
                $t("global.article.wrote_at") +
                " " +
                getLocalTimeStringSmall(article.created_at)
              }}
            </v-tooltip>
            <p v-else class="small text-muted">
              {{ $t("global.article.now") }}
            </p>
          </v-col>

          <v-col cols="12" class="text-end">
            <!-- Report & Delete Article -->
            <v-btn
              v-if="(canDelete || canReport) && !reported"
              text
              rounded
              small
              class="m-1"
              :color="canDelete ? '#D32F2F' : '#444'"
              @click.stop="popupActiveReport = true"
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
              border="left"
              dense
              dark
              class="mt-5 text-start pp"
              @click="popupActiveReport = true"
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
            <v-subheader>
              {{ $t("global.article.author_socials") }}

              :
            </v-subheader>
            <v-btn
              v-if="socials.linkedin"
              depressed
              color="blue"
              class="m-2"
              dark
              dir="ltr"
              small
              icon
              :href="`https://www.linkedin.com/in/${socials.linkedin}`"
              target="_blank"
            >
              <v-icon small> fab fa-linkedin </v-icon>
            </v-btn>

            <v-btn
              v-if="socials.twitter"
              depressed
              color="cyan"
              class="m-2"
              dark
              dir="ltr"
              small
              icon
              :href="`https://twitter.com/${socials.twitter}`"
              target="_blank"
            >
              <v-icon small> fab fa-twitter </v-icon>
            </v-btn>

            <v-btn
              v-if="socials.medium"
              depressed
              color="black"
              class="m-2"
              dark
              dir="ltr"
              small
              icon
              :href="`https://medium.com/@${socials.medium}`"
              target="_blank"
            >
              <v-icon small> fab fa-medium </v-icon>
            </v-btn>

            <v-btn
              v-if="socials.selldone"
              depressed
              color="#70557e"
              class="m-2"
              dark
              dir="ltr"
              small
              icon
              :href="`${SetupService.MainServiceUrl()}/@${socials.selldone}`"
              target="_blank"
              :title="`@${socials.selldone}`"
            >
              <v-icon small> fas fa-store </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Relative Articles ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <v-row
        v-if="hasRelatedArticles"
        class="mx-0 my-12"
        justify="space-between"
        align="stretch"
      >
        <v-col v-for="it in relatives" :key="it.id" cols="12" sm="6" md="5">
          <v-card
            :to="getArticlePageTo(it)"
            max-width="400"
            class="s--shadow-no-padding hover-able text-start rounded-18px article-card"
          >
            <v-img
              v-if="it.article.image"
              :src="it.article.image"
              height="200px"
            ></v-img>

            <v-card-title class="tit">
              {{ it.article.title }}
            </v-card-title>

            <v-card-subtitle>
              {{ it.category }}
            </v-card-subtitle>

            <v-card-text class="desc">
              {{ it.article.description }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Comments ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <v-container v-if="!isNew && showComments && article">
        <s-article-comments
          :is-shop="!!shopId"
          :is-selldone="['blog', 'help'].includes(articleType)"
          v-if="!isNew"
          class="pt-3"
          :article-user-id="article.user_id"
          :article-id="article.id"
          :for-product="!!productId"
        />
      </v-container>
    </div>

    <!-- ██████████████████████ Dialog > Report Article ██████████████████████ -->

    <s-content-violation-report-dialog
      v-model="popupActiveReport"
      @report="reportArticle"
      @delete="reportDeleteArticle"
      :can-delete="canDelete"
      :loading="busy_report"
    ></s-content-violation-report-dialog>

    <!-- ██████████████████████ Dialog > Publish time line ██████████████████████ -->

    <v-dialog
      v-model="dialog_timeline"
      scrollable
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title class="dialog-title">
          <v-icon class="me-1">pending_actions</v-icon>
          {{ $t("global.article.schedule_dialog.title") }}
        </v-card-title>
        <v-card-text>
          <v-container>
            <s-articles-timeline
              :shop-id="shopId"
              :article-type="articleType"
              :current-article-id="article.id"
            ></s-articles-timeline>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn text x-large @click="dialog_timeline = false">
              <v-icon class="me-1">close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ―――――――――――――――――――――――――――――――――――――――――――――――― -->
  </div>
</template>

<script>
import SArticleComments from "./comment/SArticleComments.vue";

import SArticleSeoEditor from "./SArticleSeoEditor.vue";

import SArticleEditor from "./SArticleEditor.vue";

import { ArticleTypes } from "../../../core/enums/article/ArticleTypes";
import { PermissionNames } from "@app-selldone/enums/permission/PermissionNames";
import { PermissionLevels } from "@app-selldone/enums/permission/PermissionLevels";
import { HelpCategories } from "@app-selldone/enums/help/HelpCategories";
import DateTimePickerGlobal from "../ui/calendar/dateTimePickerGlobal.vue";
import SArticlesTimeline from "@components/article/timeline/SArticlesTimeline.vue";
import SNumberInput from "@components/ui/input/number/SNumberInput.vue";
import SLanguageInput from "@components/ui/input/language/SLanguageInput.vue";
import FaqSection from "./widgets/FaqSection.vue";
import SArticleStructuredData from "./SArticleStructuredData.vue";
import SArticleTagsEditor from "./SArticleTagsEditor.vue";
import SContentViolationReportDialog from "../ui/dialog/conent-violation-report/SContentViolationReportDialog.vue";
import UserEmailInput from "@app-backoffice/components/user/UserEmailInput.vue";
import SSmartMenu from "@components/smart/SSmartMenu.vue";
import TimeProgressBar from "../ui/calendar/TimeProgressBar.vue";
import { ShopOptionsHelper } from "../../../core/helper/shop/ShopOptionsHelper";
import SArticleSearchConsole from "./seo/SArticleSearchConsole.vue";
import AiButton from "@components/ui/button/ai/AiButton.vue";
import ClusterSelect from "@app-backoffice/components/cluster/ClusterSelect.vue";
import _ from "lodash-es";

export default {
  name: "SArticleView",
  components: {
    ClusterSelect,
    AiButton,
    SArticleSearchConsole,
    TimeProgressBar,
    SSmartMenu,
    UserEmailInput,
    SContentViolationReportDialog,
    SArticleTagsEditor,
    SArticleStructuredData,
    FaqSection,
    SLanguageInput,
    SNumberInput,
    SArticlesTimeline,
    DateTimePickerGlobal,
    SArticleSeoEditor,
    SArticleEditor,
    SArticleComments,
  },
  props: {
    shop: { required: false, type: Object },

    initialArticlePack: {
      required: false,
      type: Object,
    },

    targetId: {
      required: false,
    },

    articleType: {
      required: true,
      type: String,
    },

    // Product : owner of this article
    productId: {
      required: false,
      type: Number,
    },

    tags: {
      required: false,
      type: String,
      default: "",
    },

    needCreateNew: {
      required: false,
      type: Boolean,
      default: false,
    },

    showComments: {
      required: false,
      type: Boolean,
      default: false,
    },

    showAuthorInfo: {
      required: false,
      type: Boolean,
      default: true,
    },

    noReturnBackOnDelete: {
      type: Boolean,
      default: false,
    },

    showUserFeedbackButtons: {
      required: false,
      type: Boolean,
      default: false,
    },
    showShareButtons: {
      required: false,
      type: Boolean,
      default: true,
    },
    showTitle: {
      // No title mode!
      type: Boolean,
      default: true,
    },
    hideTitle: {
      // Has title but not show! important!
      type: Boolean,
      default: false,
    },
    initialRenderState: {
      required: false,
      type: String,
      default: "review",
    },

    shopId: {},

    autoPageTitle: {
      required: false,
      type: Boolean,
      default: false,
    },

    hasRelatedArticles: {
      required: false,
      type: Boolean,
      default: false,
    },

    hasFavorite: {
      required: false,
      type: Boolean,
      default: true,
    },

    hasLike: {
      required: false,
      type: Boolean,
      default: true,
    },

    hasTableOfContent: {
      type: Boolean,
      default: true,
    },

    // ―――― Multi Language ――――
    multiLanguage: {
      type: Boolean,
      default: false,
    },

    forceLanguage: {}, // When select a language from the list.
    multiLanguageAvailable: { type: Array }, // Available multi languages. Array of language codes to show green check.
  },

  data() {
    return {
      ArticleTypes: ArticleTypes,

      can_edit: false,

      permissions: PermissionNames,
      permissionLevels: PermissionLevels,

      article: {
        id: 0,
        title: "",
        description: "",
        body: "",
        user_id: 0,
        lang: "en",
      },

      state: "no-change", //changed    saving   no-change
      render_state: "review", // editing  review

      isNew: false,

      isLiked: false,
      isStared: false,

      isFollow: false,

      reported: false,

      // Power
      catch_power: false,
      power_busy: false,

      inLoading: false,
      defaultOptions: { path: "/animation/loader.json" },

      images_in_article: [],

      published_state: false,

      isPrivate: false,

      publications: [],

      selected_publication_id: null, // Selected publication to add!
      available_publications: [], // Available publication (active + has access)

      popupActiveReport: false,

      // ------ Errors -------
      NOT_FOUND_ARTICLE: false,

      NEED_LOGIN: false,

      articles: [],

      can_create_new: false,

      error_msg: null,

      menu: null,

      reading_time: 0,

      //---------- Shop Cluster ------------

      cluster_id: null,

      //---------- Samin Blog ------------
      busy_categories: false,
      categories: [],
      category: "",
      busy_change_author: false,

      //---------- Samin Help ------------

      parent_helps_canidates: [],

      // ----------------------------
      schedule_at: null,

      dialog_timeline: false,

      // ----------- Relatives ------------
      relatives: null,

      // ----------- Report ------------
      busy_report: false,

      // ----------- Change author dialog ------------
      change_author_dialog: false,
      user_email: null,

      // ----------- Google Rank ------------
      show_google_tank: false,
      first_load_seo_audit: false,

      // AI
      auto_generate_busy: false,

      //--------------
      busy_fix: false,
    };
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    is_shop_blog() {
      return this.articleType === ArticleTypes.Blog.code;
    },

    // ▃▃▃▃▃▃▃▃▃▃▃▃▃ Multi Language ▃▃▃▃▃▃▃▃▃▃▃▃▃

    languages() {
      // Available languages of shop!
      return this.shop && ShopOptionsHelper.GetLanguages(this.shop);
    },

    can_auto_translate() {
      return (
        this.multiLanguage &&
        this.shop &&
        this.forceLanguage &&
        this.forceLanguage.toLowerCase() !==
          this.shop.language.toLowerCase() /*Not default language*/ &&
        !this.multiLanguageAvailable.includes(this.forceLanguage.toLowerCase())
      ); /*Not have article!*/
    },

    //----------------------------------------
    shop_id() {
      return this.$route.params.shop_id
        ? this.$route.params.shop_id
        : this.shopId
        ? this.shopId
        : this.getShop()
        ? this.getShop().id
        : null;
    },
    /*  author_id() {
      return this.article.user_id;
    },*/
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

    author_avatar() {
      if (!this.article) return null;

      return this.getUserAvatar(this.article.user_id, "big");
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

    upload_url() {
      // Shop Products:
      if (this.articleType === ArticleTypes.Product.code) {
        return this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
          ? window.VAPI.UPLOAD_MY_VENDOR_ARTICLE_IMAGE(
              this.$route.params.vendor_id,
              this.articleType
            )
          : window.ARTICLE_API.UPLOAD_ARTICLE_IMAGE(
              this.articleType,
              this.shop_id
            );
      }
      // Shop Blogs:
      else if (this.is_shop_blog) {
        return window.ARTICLE_API.UPLOAD_ARTICLE_BLOG_IMAGE(this.shop_id);
      }

      return window.ARTICLE_API.UPLOAD_ARTICLE_IMAGE(this.articleType, null);
    },

    word_converter_url() {
      // Vendor panel:
      if (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/) {
        return window.VAPI.POST_MY_VENDOR_CONVERTER_WORD_HTML(
          this.$route.params.vendor_id
        );
      }

      // Shop blogs:
      if (this.shop_id) {
        return window.ARTICLE_API.POST_SHOP_CONVERTER_WORD_HTML(this.shop_id);
      }
      // Official selldone blogs:
      return window.API
        ? window.ADMIN_API.POST_OFFICIAL_CONVERTER_WORD_HTML()
        : undefined;
    },
    showContent() {
      return !this.inLoading && !this.NOT_FOUND_ARTICLE && !this.NEED_LOGIN;
    },

    canEdit() {
      return (
        this.article && this.can_edit //this.article.user_id === this.USER_ID() && this.owner
      );
    },
    canFollow() {
      return (
        this.USER() && this.article && this.article.user_id !== this.USER_ID()
      );
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
          this.permissionLevels.DELETE_ACCESS
        )
      );
    },

    canReport() {
      // Report.
      return (
        this.USER() && this.article && this.article.user_id !== this.USER_ID()
      );
    },
    is_editing() {
      return this.render_state === "editing";
    },

    category_obj() {
      return (
        this.categories &&
        this.category &&
        this.categories.find(
          (it) => it.category === this.category || it.id === this.category
        )
      );
    },
  },

  watch: {


    targetId(to, from) {
      const force = !(this.multiLanguage && this.forceLanguage); // Prevent reload page in multi-language edit mode!
      this.updateArticlePage(force);
      this.getCategories();
    },

    schedule_at() {
      this.state = "changed";
    },

    "article.structures": {
      handler: function (newValue) {
        this.onChangeNote();
      },
      deep: true,
    },

    canEdit() {
      this.getCategories();
    },

    // ―――― Multi Language ――――
    forceLanguage(val) {
      if (!val || !this.isNew /*Prevent update existing pack*/) return;
      // Update language when user click on language list before save the current article! jsut change language of article!
      this.article.lang = val;
    },
  },

  created() {
    this.$nextTick(() => {
      this.render_state = this.initialRenderState;

      if (!this.canEdit) this.render_state = "review"; // Make sure not show wrong mode for who has no edit access!
    });
  },

  mounted() {
    this.updateArticlePage();

    this.getCategories();
  },

  methods: {
    calculateReadTime() {
      let text = "";
      try {
        let text = $(this.article.body).text();
      } catch (e) {
        console.warn(
          "Invalid article body. Auto-fix applied by SD.",
          this.article.body
        );
        text = this.article.body;
        this.article.body = "<p>" + this.article.body + "</p>";
      }

      let time = Math.floor(text.length / 600);
      if (time < 0) time = 0;
      this.reading_time = time;
    },

    showTimeline() {
      this.dialog_timeline = true;
    },

    getCategories() {
      if (!this.canEdit) return;

      // Selldone Blog:
      if (this.articleType === ArticleTypes.SaminBlog.code) {
        this.busy_categories = true;

        axios
          .get(window.ADMIN_API.GET_SAMIN_BLOG_TAGS())
          .then(({ data }) => {
            if (!data.error) {
              this.categories = data.categories;
            } else {
              this.showErrorAlert(null, data.error_msg);
            }
          })
          .finally(() => {
            this.busy_categories = false;
          });
      }

      // Shop Blog:
      if (this.is_shop_blog) {
        this.busy_categories = true;

        axios
          .get(window.ARTICLE_API.GET_SHOP_BLOG_CATEGORIES(this.shop_id))
          .then(({ data }) => {
            if (!data.error) {
              this.categories = data.categories;
            } else {
              this.showErrorAlert(null, data.error_msg);
            }
          })
          .finally(() => {
            this.busy_categories = false;
          });
      }

      // Samin help:
      if (this.articleType === ArticleTypes.SaminHelp.code) {
        this.categories = Object.keys(HelpCategories);
      }
    },

    getHelpParentCandidatesList() {
      if (!this.can_edit || this.targetId === "new") return;

      axios
        .get(window.ADMIN_API.GET_SAMIN_HELP_PARENT_CANDIDATES(this.targetId))
        .then(({ data }) => {
          if (!data.error) {
            let out = [];
            data.helps.forEach((item) => {
              out.push({ title: item.title, blog_id: item.id });
            });
            this.parent_helps_canidates = out;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        });
    },

    //――――――――――――――――――――――― Change listeners ―――――――――――――――――――――――

    onChangeNote($event = null) {
      if (this.is_editing) this.state = "changed";
    },

    onChangeImages($event) {
      this.images_in_article = $event.images;
    },

    saveChange(callback_success = null) {
      if (!this.article.description)
        this.article.description = this.$refs.editorContainer.gist();

      if (!this.article.image)
        this.article.image = this.$refs.editorContainer.firstImage();

      // ==================== Purify Body ==================

      let pure_title = this.$refs.editorContainer.purifyTitle();
      if (!pure_title) {
        return this.showErrorAlert(null, "Title can not be empty!");
      }
      this.article.title = pure_title;

      let pure_body = this.$refs.editorContainer.purifyBody();

      // TODO: مهم اینو برداشتم!!!!!!!!!!!!! باید اضافه کنم اما پوست رندر رو روش بزنم حتما! برای نوشن دادن ویو کامپوننت ها!
      this.article.body = pure_body;

      this.state = "saving";

      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_ADD_EDIT_ARTICLE(
                this.$route.params.vendor_id,
                this.articleType
              )
            : window.ARTICLE_API.POST_ADD_EDIT_ARTICLE(this.articleType),
          {
            type: this.articleType,
            article_id: this.article.id,

            slug: this.article.slug,
            page_title: this.article.page_title,

            title: this.article.title,
            body: pure_body,
            image: this.article.image,
            description: this.article.description,
            published: this.published_state,
            private: this.isPrivate,

            lang: this.forceLanguage ? this.forceLanguage : this.article.lang,
            multi_language: this.forceLanguage && this.multiLanguage, // Tell this is a multi-language article to prevent ovveride (Server check language)

            product_id: this.productId,

            parent_id: this.menu ? this.menu.parent_id : null,

            shop_id: this.shop_id,

            // Selldone Blog:
            category: this.category,

            // Schedule at:
            schedule_at: this.convertLocalTimeStringToUTCString(
              this.schedule_at
            ),

            // Selldone Help:
            order: this.menu ? this.menu.order : 0,
            star: this.menu ? this.menu.star : false,

            // FAQ
            faqs: this.article.faqs,

            // Structure date:
            structures: this.article.structures,

            // Shop Cluster
            cluster_id: this.cluster_id,
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            this.state = "no-change";

            // Old methods:
            this.article.id = data.id;  // Old way
            if(data.article){ // New way
              Object.assign(this.article,data.article)
            }

            this.article.published = this.published_state;
            this.article.private = this.isPrivate;
            this.article.schedule_at = this.schedule_at;

            // Update smart by changed values: (New methods)
            if (data.changes) Object.assign(this.article, data.changes);

            this.showSuccessAlert(
              this.$t("global.article.notifications.update_success_title"),
              this.$t("global.article.notifications.update_success")
            );
            if (callback_success) callback_success();

            this.$emit("update-article", this.article);

            // --------------------------------- After Action ---------------------------------
            if (this.isNew) {
              // Need navigate to new URL!
              if (this.articleType === ArticleTypes.SaminHelp.code) {
                this.$router.replace({ params: { help_id: data.help_id } });
              } else if (this.articleType === ArticleTypes.SaminBlog.code) {
                this.$router.replace({ params: { blog_id: data.blog_id } });
              }
            } else {
              if (this.articleType === ArticleTypes.SaminHelp.code) {
                this.menu = data.menu;

                this.getHelpParentCandidatesList();
              }
            }
            // ---------------------------------------------------------------------------------
          } else {
            this.state = "changed";
            this.showErrorAlert(
              null,
              data.error_msg
                ? this.isString(data.error_msg)
                  ? data.error_msg
                  : JSON.stringify(data.error_msg)
                : this.$t("global.article.notifications.update_error")
            );
          }
        })
        .catch((error) => {
          this.state = "changed";
          this.showLaravelError(error);
        })
        .finally(() => {});
    },

    //――――――――――――――――――――――― Update page ―――――――――――――――――――――――

    updateArticlePage(force = false) {
      // 🞇 Reset to default
      this.resetToDefault();

      if (!force && this.initialArticlePack) {
        this.onGetArticlePackData(this.initialArticlePack);
        return;
      }

      this.inLoading = true;
      // Check if is new article.
      this.isNew = this.needCreateNew; // this.$route.path.endsWith("new");

      if (this.isNew && (!this.targetId || this.targetId === "new")) {
        this.prepareCreateNew();
      } else {
        if (!this.targetId) return;

        // 🞇 Get article from server.

        const url = this.is_shop_blog
          ? window.XAPI.GET_SHOP_BLOG_DATA(this.shop.name, this.targetId)
          : window.GAPI.GET_ARTICLE(this.articleType, this.targetId);

        axios
          .get(url, {
            params: {
              relatives: this.hasRelatedArticles,
            },
          })
          .then(({ data }) => {
            if (data.error) {
              this.error_msg = data.error_msg;

              this.NOT_FOUND_ARTICLE = true;

              this.can_create_new = true;

              return;
            }

            this.onGetArticlePackData(data);
          })

          .catch((error) => {

            this.NOT_FOUND_ARTICLE = true;

            this.can_create_new = true;
          })
          .finally(() => {
            this.inLoading = false;
          });
      }
    },

    onGetArticlePackData(data) {
      // 💡 Protocol relative!
      data.article.body = data.article.body.replace(/src="http:/g, 'src="');

      // Change in cdn images address -> V1: update in database!
      /* data.article.body = data.article.body.replace(
                         /@cdn-images-1/g,
                         'cdn-images-1'
                 );*/
      this.$emit("get-data", data);

      this.article = data.article;
      this.publications = data.publications;

      this.published_state = this.article.published;
      this.isPrivate = this.article.private;

      this.isLiked = data.liked;
      this.isStared = data.stared;
      this.isFollow = data.follow;
      this.inLoading = false;
      this.catch_power = data.catch_power;

      this.reported = data.reported;

      this.menu = data.menu;

      //Relative articles:
      this.relatives = data.relatives;

      // Can edit article?
      this.can_edit = data.can_edit;
      if (!this.can_edit)
        this.can_edit = this.USER() && this.USER().id === data.article.user_id; // Is user the article writer?

      // Schedule at:
      this.schedule_at = data.article.schedule_at
        ? this.convertUTCStringToLocalTimeString(data.article.schedule_at)
        : null;

      if (this.schedule_at) this.published_state = false;

      this.category = data.category;
      this.cluster_id = data.article?.parent?.cluster_id; // 🆑 Cluster

      if (this.$refs.editorContainer) this.$refs.editorContainer.setDirection();

      if (this.articleType === ArticleTypes.SaminHelp.code) {
        this.getHelpParentCandidatesList();
      }

      this.$emit("update-article", this.article);

      this.calculateReadTime();

      if (this.autoPageTitle && this.article.title) {
        document.title = this.article.page_title
          ? this.article.page_title
          : this.article.title;
      }

      /*
      this.$forceUpdate(); // Force refresh component!
      console.log("---Force refresh component!----");
*/
      this.refreshPlaceholders();
    },

    prepareCreateNew() {
      console.log("---prepareCreateNew----");
      // 🞇 Reset to default
      this.resetToDefault(); // 🞇 Reset to default

      // Check if is new article.
      this.isNew = true; // this.$route.path.endsWith("new");

      // New article
      if (!this.USER()) this.NEED_LOGIN = true;

      // 🞇 Reset to new article statement.

      this.render_state = "editing";
      this.isNew = true;
      this.article.user_id = this.USER_ID();
      this.article.user = this.USER();

      this.article.published = true;
      this.published_state = true;
      this.isPrivate = false;

      this.article.id = null;
      this.NOT_FOUND_ARTICLE = false;

      this.can_edit = true;

      this.article.lang = this.forceLanguage
        ? this.forceLanguage
        : this.getCurrentLanguage().code;

      // Set language in shop mode:
      if (this.shop) {
        this.article.lang = this.shop.langauge;
      }

      this.refreshPlaceholders();
    },

    refreshPlaceholders() {
      //console.log('refreshPlaceholders...')
      // Force show placeholders:
      $("#editable_title").focus();
      this.$nextTick(() => {
        $("#editable_title").blur();
        this.$nextTick(() => {
          $("#editable_body").click(); // Focus not trigger placeholder! After click outside of body placeholder will be shown.
          this.$nextTick(() => {
            $("#editable_body").blur();
          });
        });
      });
    },

    //――――――――――――――――――――――― Like ―――――――――――――――――――――――
    likeArticle() {
      if (!this.USER()) return;

      this.isLiked = !this.isLiked;
      this.isLiked ? this.article.like++ : this.article.like--;

      axios
        .post(window.ARTICLE_API.POST_LIKE_ARTICLE(this.article.id), {
          liked: this.isLiked,
        })
        .then(({ data }) => {
          if (data.error) {
            this.isLiked = !this.isLiked;
            this.isLiked ? this.article.like++ : this.article.like--;
          }
        })
        .catch(function (error) {
          console.log(error);
          this.isLiked = !this.isLiked;
          this.isLiked ? this.article.like++ : this.article.like--;
        });
    },

    //――――――――――――――――――――――― Star ―――――――――――――――――――――――
    starArticle() {
      if (!this.USER()) return;

      this.isStared = !this.isStared;

      axios
        .post(window.ARTICLE_API.POST_STAR_ARTICLE(this.article.id), {
          stared: this.isStared,
        })
        .then(({ data }) => {
          if (data.error) {
            this.isStared = !this.isStared;
          }
        })
        .catch(function (error) {
          console.log(error);
          this.isStared = !this.isStared;
        });
    },
    //――――――――――――――――――――――― Follow ―――――――――――――――――――――――
    followUser() {
      this.isFollow = !this.isFollow;

      let t = this;
      axios
        .post(window.ARTICLE_API.POST_FOLLOW_USER(this.article.user_id), {
          follow: this.isFollow,
        })
        .then(({ data }) => {
          if (data.error) {
            t.isFollow = !t.isFollow;
          }
        })
        .catch(function (error) {
          console.log(error);
          t.isFollow = !t.isFollow;
        });
    },

    //――――――――――――――――――――――― getPower ―――――――――――――――――――――――
    getPower() {
      this.power_busy = true;

      axios
        .post(window.ARTICLE_API.POST_CLAPS_OF_ARTICLE(this.article.id), {})
        .then(({ data }) => {
          if (!data.error) {
            this.catch_power = true;
            if (data.add) {
              this.article.power = data.power;
            }
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.power_busy = false;
        });
    },

    //――――――――――――――――――――――― Review ―――――――――――――――――――――――

    showReviewMode() {
      this.render_state = "review";

      this.article.title = this.$refs.editorContainer.purifyTitle();

      this.article.body = this.$refs.editorContainer.purifyBody();
    },

    toggleEditMode() {
      if (this.render_state === "review") this.render_state = "editing";
      else this.showReviewMode();
    },

    //――――――――――――――――――――――― Delete this article ―――――――――――――――――――――――
    openDeleteArticleAlert() {
      this.openDangerAlert(
        this.$t("global.article.alert.delete_article.title"),
        this.$t("global.article.alert.delete_article.message"),
        this.$t("global.article.alert.delete_article.action"),
        () => {
          this.deleteArticle();
        }
      );
    },

    deleteArticle() {
      axios
        .delete(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_MY_VENDOR_ARTICLE(
                this.$route.params.vendor_id,
                this.articleType,
                this.article.id
              )
            : window.ARTICLE_API.DELETE_ARTICLE(
                this.articleType,
                this.article.id
              )
        )
        .then(({ data }) => {
          if (data.error) {
            // Error!
            this.showErrorAlert(
              null,
              data.error_msg
                ? data.error_msg
                : this.$t("global.article.notifications.delete_error")
            );

            return;
          }
          this.$emit("delete");
          if (!this.noReturnBackOnDelete) this.$router.go(-1);
        })
        .catch((e) => {
          this.showLaravelError(e);
        });
    },
    //――――――――――――――――― Fix body structure ―――――――――――――――――

    autoFixArticle() {
      this.busy_fix = true;
      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_ARTICLE_BODY_AUTO_FIX()
            : window.ARTICLE_API.POST_ARTICLE_BODY_AUTO_FIX(),
          {
            body: this.article.body,
          }
        )
        .then(({ data }) => {
          if (data.error) {
            // Error!
            this.showErrorAlert(null, data.error_msg);

            return;
          }
          this.article.body = data.body;
          this.onChangeNote();
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_fix = false;
        });
    },

    //――――――――――――――――― Admin > Report & Delete this article ―――――――――――――――――

    reportDeleteArticle(report) {
      this.busy_report = true;
      axios
        .delete(
          window.ADMIN_API.DELETE_ARTICLE_BY_ADMIN(this.article.id, report)
        )
        .then(({ data }) => {
          if (data.error) {
            // Error!
            this.showErrorAlert(
              null,
              data.error_msg
                ? data.error_msg
                : this.$t("global.article.notifications.delete_error")
            );
            return;
          }

          this.popupActiveReport = false;
          this.showSuccessAlert(
            this.$t(
              "global.article.notifications.report_and_delete_success_title"
            ),
            this.$t(
              "global.article.notifications.report_and_delete_success_message"
            )
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
          this.popupActiveReport = false;
          this.showSuccessAlert(
            this.$t("global.article.notifications.report_success_title"),
            this.$t("global.article.notifications.report_success_message")
          );
          this.reported = true;
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_report = false;
        });
    },

    getArticlePageTo(target) {
      const target_id = target.id;
      if (this.articleType === ArticleTypes.SaminBlog.code) {
        return {
          name: "BlogSlug",
          params: { blog_id: target_id, slug: target.article.slug },
        };
      } else if (this.articleType === ArticleTypes.SaminHelp.code) {
        return { name: "Help", params: { help_id: target_id } };
      } else if (this.articleType === ArticleTypes.Product.code) {
      } else if (this.is_shop_blog) {
        return { name: "ShopBlogPage", params: { blog_id: target_id } };
      } else if (this.articleType === ArticleTypes.Company.code) {
      }
    },

    //――――――――――――――――― Admin > Make blog wrote by Selldone team ―――――――――――――――――
    changeAuthor() {
      this.busy_change_author = true;
      axios
        .put(
          window.ADMIN_API.PUT_SET_ARTICLE_AUTHOR(
            "blogs",
            this.article.parent_id
          ),
          {
            email: this.user_email,
          }
        )
        .then(({ data }) => {
          if (data.error) {
            // Error!
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.change_author_dialog = false;
            this.article.user = data.author;
            this.article.user_id = data.author.id;

            this.showSuccessAlert(
              null,
              `Change author to ${data.author.name}.`
            );
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_change_author = false;
        });
    },

    //――――――――――――――――― Load Other Language ―――――――――――――――――
    loadArticleLanguage(lang) {
      // console.log('loadArticleLanguage',lang)
      this.$emit("request-load-other-language", lang);
    },

    showGoogleSearch() {
      this.first_load_seo_audit = true;
      this.$nextTick(() => {
        this.show_google_tank = !this.show_google_tank;
      });
    },

    // ┣━━━━━━━━━━━━━━━━━━━━━━━━━━ AI / Auto generate article  ━━━━━━━━━━━━━━━━━━━━━━━━━━┫

    autoGenerate(retry = false) {
      console.log("🆎 AI / Auto generate article.");

      if (!this.article.id) {
        return this.showErrorAlert(null, "Save article first.");
      }

      let url = null;
      if (this.shop_id)
        url = window.API.POST_AI_ARTICLE_AUTO_GENERATE(
          this.shop_id,
          this.article.id
        );
      else {
        return;
      }

      this.auto_generate_busy = true;

      const title = this.$refs.editorContainer.purifyTitle();

      const body = this.$refs.editorContainer.purifyBody();

      axios
        .post(url, {
          title: title,
          body: body,
        })
        .then(({ data }) => {
          if (data.retry /*Retry after ms*/) {
            _.delay(
              () => {
                this.autoGenerate(false);
              },
              data.retry_ms ? data.retry_ms : 2 * 60000
            );
            return;
          }

          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.article.title = data.title;
            this.article.body = data.body;

            this.state = "changed";

            this.showSuccessAlert(
              "Write completed",
              "Article successfully auto created and loaded."
            );
          }
        })
        .catch((error) => {
          if (retry) {
            // Retry after 2 minutes
            _.delay(() => {
              this.autoGenerate(false);
            }, 2 * 60000);
          } else {
            this.showLaravelError(error);
          }
        })
        .finally(() => {
          this.auto_generate_busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.con-vs-radio {
  justify-content: left !important;
  font-size: 1.5em;
  padding-top: 0.3em;
  padding-bottom: 0.3em;
}

.article-list-item {
  padding: 6px;
  font-size: 0.8em;
}

.author-name-big {
  font-size: 82px !important;
  font-weight: 300;
  line-height: 1.3 !important;
  letter-spacing: -0.04em !important;
}

.samin-article-widget {
  padding: 15px 20px;

  @media only screen and (max-width: 900px) {
    padding: 10px 15px;
  }

  @media only screen and (max-width: 600px) {
    padding: 5px 5px;
  }
}

.author-box {
  .author-title {
    font-size: 0.9rem;
    font-weight: 700;
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

.reading-time {
  color: #aaa;
  font-size: 12px;
  line-height: 1em;
  font-weight: 400;
}

.article-card {
  min-height: 100%;
  .tit {
    font-size: 1.45rem;
    color: #4f4f4f;
    line-height: 2.3rem;
    font-weight: 800;
    min-height: 8rem;

    @media (max-width: 1320px) {
      font-size: 1.3rem;
    }
  }
  .desc {
    //margin-top: 1.5625rem;
    font-size: 0.9375rem;
    color: rgba(0, 0, 0, 0.6);
    line-height: 1.6;
  }
}
</style>

<style lang="scss"></style>
