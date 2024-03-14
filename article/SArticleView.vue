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

    <s-progress-loading v-if="inLoading" />
    <s-progress-loading v-if="busy_fix" color="#673AB7" />

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Not found article ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <div v-if="NOT_FOUND_ARTICLE">
      <div class="text-center font-weight-thin text-h4 my-16">Not Found</div>

      <h2 class="text-secondary text-center">
        {{ error_msg }}
      </h2>
    </div>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Need login ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <div v-if="NEED_LOGIN">
      <div class="text-center font-weight-thin text-h4 my-16">Private</div>

      <h2 class="text-secondary text-center">
        {{ $t("global.article.login_to_see_error") }}
      </h2>
    </div>

    <v-btn
      v-if="can_edit && can_create_new"
      color="primary"
      rounded
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
        :extended="12"
        :height="62"
        class="overflow-x-auto"
        color="transparent"
        flat
      >
        <template v-slot:extension>
          <div style="height: 12px"></div>
        </template>

        <v-toolbar-items>
          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Change Mode ━━━━━━━━━━━━━━━━━━━━━━ -->

          <v-btn
            v-if="in_view_mode"
            class="ma-1"
            color="primary"
            min-width="64"
            rounded="lg"
            stacked
            variant="elevated"
            @click="render_state = 'editing'"
          >
            <v-icon size="24">edit</v-icon>
            <div class="x-small mt-1 tnt">{{ $t("global.actions.edit") }}</div>

            <v-tooltip activator="parent" location="top" max-width="360">
              <b>{{ $t("global.article.menu.edit") }}</b>
              <div>Click to edit article.</div>
            </v-tooltip>
          </v-btn>

          <v-btn
            v-if="in_edit_mode"
            class="ma-1"
            min-width="64"
            rounded="lg"
            stacked
            variant="flat"
            @click="render_state = 'review'"
          >
            <v-icon size="24">visibility</v-icon>
            <div class="x-small mt-1 tnt">{{ $t("global.actions.view") }}</div>

            <v-tooltip activator="parent" location="top" max-width="360">
              <b>{{ $t("global.article.menu.view_mode") }}</b>
              <div>Click to see article in the view mode.</div>
            </v-tooltip>
          </v-btn>

          <v-divider class="my-0 mx-3" vertical></v-divider>
        </v-toolbar-items>

        <v-toolbar-items>
          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Schedule At ━━━━━━━━━━━━━━━━━━━━━━ -->

          <v-btn
            v-if="article.schedule_at"
            :title="
              $t('global.article.publish_at') +
              ' : ' +
              getLocalTimeString(article.schedule_at)
            "
            icon
            stacked
            variant="text"
            @click="showTimeline()"
          >
            <v-icon size="24"> timeline</v-icon>
            <div class="x-small pt-1 tnt">
              <v-icon color="pink" size="6">circle</v-icon>
              {{ $t("global.commons.timeline") }}
            </div>

            <v-tooltip
              activator="parent"
              content-class="text-start"
              location="top"
              max-width="360"
            >
              {{ $t("global.article.schedule_input") }}
              <div v-if="article.schedule_at">
                {{ $t("global.article.publish_at") }}:
                <b>{{ getLocalTimeString(article.schedule_at) }}</b>
              </div>
            </v-tooltip>
          </v-btn>

          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Publish State ━━━━━━━━━━━━━━━━━━━━━━ -->

          <v-btn
            v-else-if="published_state"
            key="pls"
            :class="{ pen: !in_edit_mode, disabled: !!schedule_at }"
            icon
            stacked
            variant="text"
            @click="published_state = !published_state"
          >
            <v-icon class="ma-1" size="20"> fa:fas fa-rss</v-icon>
            <div class="x-small pt-1 tnt">
              <v-icon color="green" size="6">circle</v-icon>
              {{ $t("global.article.published") }}
            </div>

            <v-tooltip activator="parent" location="top" max-width="360">
              {{ $t("global.article.published") }} /
              {{ $t("global.article.draft") }}
            </v-tooltip>
          </v-btn>
          <v-btn
            v-else
            key="dra"
            :class="{ pen: !in_edit_mode, disabled: !!schedule_at }"
            icon
            stacked
            variant="text"
            @click="published_state = !published_state"
          >
            <v-icon class="ma-1" size="20"> fa:fas fa-pencil-ruler</v-icon>
            <div class="x-small pt-1 tnt">
              <v-icon color="#FFA000" size="6">circle</v-icon>
              {{ $t("global.article.draft") }}
            </div>

            <v-tooltip activator="parent" location="top" max-width="360">
              {{ $t("global.article.published") }} /
              {{ $t("global.article.draft") }}
            </v-tooltip>
          </v-btn>

          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Private / Public ━━━━━━━━━━━━━━━━━━━━━━ -->

          <v-btn
            v-if="isPrivate"
            key="pri"
            :class="{ pen: !in_edit_mode }"
            icon
            stacked
            variant="text"
            @click="isPrivate = !isPrivate"
          >
            <v-icon class="ma-1" size="20"> fa:fas fa-user-lock</v-icon>
            <div class="x-small pt-1 tnt">
              <v-icon color="red" size="6">circle</v-icon>
              {{ $t("global.article.private") }}
            </div>

            <v-tooltip activator="parent" location="top" max-width="360">
              {{ $t("global.article.private") }}
            </v-tooltip>
          </v-btn>
          <v-btn
            v-else
            key="pub"
            :class="{ pen: !in_edit_mode }"
            icon
            stacked
            variant="text"
            @click="isPrivate = !isPrivate"
          >
            <v-icon class="ma-1" size="20"> fa:fas fa-globe</v-icon>
            <div class="x-small pt-1 tnt">
              <v-icon color="green" size="6">circle</v-icon>
              {{ $t("global.article.public") }}
            </div>

            <v-tooltip activator="parent" location="top" max-width="360">
              {{ $t("global.article.public") }}
            </v-tooltip>
          </v-btn>

          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Language ━━━━━━━━━━━━━━━━━━━━━━ -->

          <s-language-input
            v-model="article.lang"
            :class="{ pen: !in_edit_mode }"
            :disabled="!in_edit_mode || !!forceLanguage"
            :title="$t('global.commons.language')"
            class="mx-2 mt-4 overflow-hidden min-width-150"
            dense
            flat
            max-width="150px"
            prepend-inner-icon="translate"
            single-line
            variant="solo-filled"
            @change="onChangeNote()"
          >
            <v-tooltip activator="parent" location="top" max-width="360">
              Change the language of this article.
            </v-tooltip>
          </s-language-input>

          <v-divider class="my-0 mx-2" vertical></v-divider>

          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Import Word ━━━━━━━━━━━━━━━━━━━━━━ -->

          <v-btn
            :class="{ pen: !in_edit_mode }"
            icon
            variant="text"
            @click="$refs.editorContainer.showSelectWord()"
          >
            <img
              height="24"
              src="@core/enums/file/assets/extensions/docx.svg"
              width="24"
            />

            <v-tooltip activator="parent" location="top" max-width="360">
              Import word (.docx)
            </v-tooltip>
          </v-btn>
          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Google ━━━━━━━━━━━━━━━━━━━━━━ -->

          <v-btn
            v-if="article?.id && !IS_VENDOR_PANEL"
            icon
            variant="text"
            @click="showGoogleSearch()"
          >
            <img height="24" src="../assets/trademark/google.svg" width="24" />

            <v-tooltip activator="parent" location="top" max-width="360">
              Show Google Search Rank.
            </v-tooltip>
          </v-btn>
          <!-- ━━━━━━━━━━━━━━━━━━━━━━ AI ━━━━━━━━━━━━━━━━━━━━━━ -->

          <v-slide-y-transition>
            <ai-button
              v-if="
                articleType === ArticleTypes.Product.code &&
                in_edit_mode &&
                !IS_VENDOR_PANEL
              "
              :loading="auto_generate_busy"
              title="Write article - 😈 Beta version | ⚡ Due to high demand and limited resources, there may be errors. Please try again later after 60sec."
              @click="autoGenerate(true)"
            >
            </ai-button>
          </v-slide-y-transition>
        </v-toolbar-items>

        <v-spacer />

        <v-toolbar-items class="pt-1 pt-md-3">
          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Switch language ━━━━━━━━━━━━━━━━━━━━━━ -->

          <template
            v-if="canEdit && !in_edit_mode && languages && multiLanguage"
          >
            <s-language-input
              :available-languages="languages"
              :checked-languages="multiLanguageAvailable"
              :suffix="` (${multiLanguageAvailable.length})`"
              :model-value="article.lang"
              class="min-width-150"
              hide-details
              prepend-inner-icon="post_add"
              single-line
              variant="plain"
              @update:model-value="(lang) => loadArticleLanguage(lang)"
            >
              <v-tooltip
                activator="parent"
                content-class="text-start"
                location="top"
                max-width="360"
              >
                <b>Multi Languages</b>
                <div>
                  Switch between articles. Available languages:
                  {{ multiLanguageAvailable.join(", ") }}
                  + Add more languages...
                </div>
              </v-tooltip>
            </s-language-input>
          </template>
        </v-toolbar-items>

        <!-- ━━━━━━━━━━━━━━━━━━━━━━ Save Button ━━━━━━━━━━━━━━━━━━━━━━ -->

        <template v-if="in_edit_mode">
          <v-btn
            :class="{
              disabled:
                state === 'saving' ||
                (state === 'no-change' &&
                  published_state === article.published &&
                  isPrivate === article.private),
            }"
            :color="
              published_state ? 'success' : schedule_at ? 'primary' : 'amber'
            "
            :loading="state === 'saving'"
            :variant="state === 'no-change' ? 'text' : 'elevated'"
            class="mx-2 tnt"
            rounded
            size="x-large"
            @click="saveChange(null)"
          >
            <v-icon class="me-2" start>
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
          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Menu ━━━━━━━━━━━━━━━━━━━━━━ -->

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
      </v-toolbar>

      <v-expand-transition>
        <div v-if="in_edit_mode">
          <v-container>
            <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Article Edit Top Menu ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

            <s-article-seo-editor
              v-if="article && canEdit"
              :article="article"
              :images="images_in_article"
              class="my-2"
              @change="state = 'changed'"
              @open-menu="$refs.editorContainer.findAllImages()"
            />

            <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Schedule At ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

            <v-expansion-panels
              class="my-2 s--shadow-no-padding rounded-28px overflow-hidden"
            >
              <v-expansion-panel elevation="0">
                <v-expansion-panel-title
                  :class="{ 'text-white': !!schedule_at }"
                  :color="schedule_at ? '#0288D1' : undefined"
                  :title="$t('global.article.schedule_title')"
                  class="py-3 d-flex align-start align-sm-center flex-column flex-sm-row"
                  style="min-height: 60px"
                >
                  <div>
                    <div>
                      <v-icon
                        :color="schedule_at ? '#fff' : undefined"
                        class="me-1"
                        >{{ schedule_at ? "watch_later" : "schedule" }}
                      </v-icon>
                      {{ $t("global.article.schedule_action") }}
                    </div>
                    <s-time-progress-bar
                      v-if="article && schedule_at"
                      :end-time="schedule_at"
                      :start-time="article.created_at"
                      active-color="#FFA000"
                      bg-color="#fff"
                      class="max-w-250 mt-2"
                      small
                    ></s-time-progress-bar>
                  </div>

                  <v-spacer></v-spacer>
                  <div class="my-1">
                    {{ getFromNowString(schedule_at) }}
                    <span class="text-subtitle-2 d-block mt-1">{{
                      getLocalTimeString(schedule_at)
                    }}</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <s-date-input
                    v-model="schedule_at"
                    :label="$t('global.article.schedule_input')"
                    :min="new Date().toISOString()"
                    :placeholder="
                      $t('global.article.schedule_input_placeholder')
                    "
                    class="max-widget-width mx-auto mt-5"
                    clearable
                    return-utc
                  />

                  <div class="widget-buttons">
                    <v-btn
                      class="tnt"
                      color="primary"
                      size="x-large"
                      variant="text"
                      @click.stop="showTimeline()"
                    >
                      <v-icon class="me-2">timeline</v-icon>
                      {{ $t("global.article.schedule_view_action") }}
                    </v-btn>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Multi Language ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

            <v-expansion-panels
              v-if="multiLanguage"
              class="my-2 s--shadow-no-padding rounded-28px overflow-hidden"
            >
              <v-expansion-panel elevation="0">
                <v-expansion-panel-title class="py-3" style="min-height: 60px">
                  <span>
                    <v-icon class="me-1">translate</v-icon>
                    Multi Languages
                  </span>

                  <v-spacer></v-spacer>

                  <v-row no-gutters class="flex-grow-0">
                    <v-chip
                      size="small"
                      class="ma-1"
                      v-for="lang in multiLanguageAvailable"
                      :key="lang"
                      :variant="lang===article?.lang?.toLowerCase()?'flat':'plain'"
                    >
                      {{ getLanguageObject(lang)?.title }}
                    </v-chip>
                  </v-row>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="max-widget-width">
                    <v-list class="border-between-vertical overflow-visible">
                      <v-list-item
                        v-for="lang in languages"
                        :key="lang"
                        :class="{
                          pen:
                            article &&
                            article.lang &&
                            article.lang.toLowerCase() === lang.toLowerCase(),
                        }"
                        class="row-hover"
                        @click="loadArticleLanguage(lang)"
                      >
                        <template v-slot:prepend>
                          <v-icon
                            :color="
                              article &&
                              article.lang &&
                              article.lang.toLowerCase() === lang.toLowerCase()
                                ? 'primary'
                                : '#333'
                            "
                            class="me-2"
                            >{{
                              article &&
                              article.lang &&
                              article.lang.toLowerCase() === lang.toLowerCase()
                                ? "circle"
                                : "radio_button_unchecked"
                            }}
                          </v-icon>

                          <flag
                            v-if="getLanguageObject(lang)"
                            :iso="getLanguageObject(lang).flag"
                            :squared="false"
                            class="me-2"
                          />
                        </template>

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
                              lang.toLowerCase() === shop.language.toLowerCase()
                            "
                            class="px-1 mx-2"
                            label
                            size="small"
                            title="Default article (Shop main language)"
                            variant="flat"
                            >{{ $t("global.commons.default") }}
                          </v-chip>
                          <v-spacer></v-spacer>
                        </v-list-item-title>

                        <template v-slot:append>
                          <v-list-item-action end>
                            <v-btn
                              v-if="
                                multiLanguageAvailable &&
                                !multiLanguageAvailable.includes(
                                  lang.toLowerCase(),
                                )
                              "
                              :title="$t('global.commons.translate')"
                              class="rounded-14-12 my-1"
                              color="primary"
                              icon
                              size="small"
                              variant="elevated"
                              @click.stop="
                                $emit('request-auto-translate', lang)
                              "
                            >
                              <v-icon>g_translate</v-icon>
                            </v-btn>

                            <v-icon
                              v-else-if="multiLanguageAvailable"
                              class="mx-1"
                              color="success"
                              size="small"
                              title="Article exist"
                              >check_circle
                            </v-icon>
                          </v-list-item-action>
                        </template>
                      </v-list-item>
                    </v-list>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Tags (Only available for shop blogs!) ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

            <v-expansion-panels
              v-if="article?.id /*Should be saved!*/ && is_shop_blog"
              class="my-2 s--shadow-no-padding rounded-28px overflow-hidden"
            >
              <v-expansion-panel elevation="0">
                <v-expansion-panel-title style="min-height: 60px">
                  <span class="flex-grow-0 me-2">
                    <v-icon class="me-1">bookmark</v-icon>
                    {{ $t("global.commons.tags") }}
                  </span>
                  <div class="flex-grow-1">
                    <v-chip
                      v-for="tag in article.tags"
                      :key="tag"
                      class="ma-1"
                      label
                      size="x-small"
                      >{{ tag }}
                    </v-chip>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <s-article-tags-editor :article="article" :shop="shop" />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Extra Edit Options ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
            <v-row class="mb-2 z1" dense>
              <slot
                name="extra-header-options"
                :categoryId="category"
                :setCategoryId="
                  (_category) => {
                    category = _category;
                    state = 'changed';
                  }
                "
                :setCategoryObject="
                  (_category) => {
                    category_obj = _category;
                    state = 'changed';
                  }
                "
                :clusterId="cluster_id"
                :setClusterId="
                  (_cluster_id) => {
                    cluster_id = _cluster_id;
                    state = 'changed';
                  }
                "
                :menu="menu"
                :inEditMode="in_edit_mode"
                :state="state"
                :onChange="
                  () => {
                    state = 'changed';
                  }
                "
              ></slot>
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
            :article="article"
            :shop="shop"
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
          v-model:body="article.body"
          v-model:title="article.title"
          :edit="in_edit_mode"
          :enable-title="showTitle"
          :has-table-of-content="hasTableOfContent"
          :hide-title="hideTitle"
          :only-view="!canEdit"
          :upload-url="upload_url"
          :word-converter-url="word_converter_url"
          class="p-lg-5 p-md-4 p-3 samin-article-content"
          @change="onChangeNote"
          @update:images="onChangeImages"
        >
          <template v-slot:after-title>
            <!-- ――――――――――――――――――――― Author Info Small Top ――――――――――――――――――――― -->

            <p v-if="showAuthorInfo" class="text-start small m-0">
              <v-avatar
                class="avatar-gradient -thin hover-scale force-top"
                size="32"
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
                    rounded
                    size="28"
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
              <v-icon class="me-1" size="small">timelapse</v-icon>
              {{ $t("global.article.read_time") }}
              :
              <span> {{ reading_time }}</span>
              {{ $t("global.article.read_time_unit") }}
            </p>
          </template>

          <template v-slot:end="{ edit }">
            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Article FAQ ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

            <s-article-faqs
              v-model:faqs="article.faqs"
              :editMode="edit"
              @change="onChangeNote"
              color="var(--background)"
            ></s-article-faqs>

            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Structured Data ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
            <s-article-structured-data
              v-if="in_edit_mode"
              v-model="article.structures"
              :editMode="edit"
            ></s-article-structured-data>
          </template>
        </s-article-editor>

        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Article > Tags ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
        <slot v-if="article" name="tags" v-bind:article="article"></slot>

        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Article > Like / Star ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

        <div v-if="showUserFeedbackButtons && !isNew" style="min-height: 64px">
          <v-badge
            :color="catch_power ? '#025185' : '#0288D1'"
            :title="
              catch_power
                ? $t('global.article.claps')
                : $t('global.article.claps_action')
            "
            class="m-2 float-right"
            offset-x="16"
          >
            <template v-slot:badge>
              {{ numeralFormat(article.power, "0.[0] a") }}
            </template>

            <v-btn
              v-if="!isNew"
              :class="{
                'disabled-no-filter': catch_power || power_busy || !USER(),
              }"
              :color="catch_power ? '#025185' : '#0288D1'"
              :loading="power_busy"
              :variant="!catch_power ? 'outlined' : 'flat'"
              icon
              @click="getPower"
            >
              <v-icon :class="{ bounceIn: catch_power }" class="mx-2">
                fa:fas fa-sign-language
              </v-icon>
            </v-btn>
          </v-badge>

          <div
            v-if="hasLike"
            class="float-left pointer-pointer d-flex flex-column"
            @click="likeArticle"
          >
            <v-icon
              :class="{ bounceIn: isLiked }"
              :color="!USER() ? '#c2185b' : isLiked ? '#c2185b' : 'gray'"
              :size="!!USER() ? 'large' : undefined"
            >
              {{
                !USER() ? "favorite" : isLiked ? "favorite" : "favorite_border"
              }}
            </v-icon>
            <small>
              {{ numeralFormat(article.like, "0.[0] a") }}
              {{ $t("global.article.likes") }}
            </small>
          </div>

          <div
            v-if="hasFavorite && USER()"
            :class="{ bounceIn: isStared }"
            class="ms-4 float-left pointer-pointer"
            @click="starArticle"
          >
            <v-icon :color="isStared ? '#fbc02d' : 'gray'" size="large">
              {{ isStared ? "star" : "star_border" }}
            </v-icon>
          </div>
        </div>
      </div>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ author info + Edit / Follow / Save ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <s-article-author-box
        v-if="showAuthorInfo && article?.user_id > 0"
        v-model:is-follow="isFollow"
        v-model:reported="reported"
        :article="article"
        class="widget my-5"
      >
      </s-article-author-box>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Relative Articles ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <v-row
        v-if="hasRelatedArticles"
        align="stretch"
        class="mx-0 my-12"
        justify="space-between"
      >
        <v-col v-for="it in relatives" :key="it.id" cols="12" md="5" sm="6">
          <v-card
            :to="getArticlePageTo(it)"
            class="s--shadow-no-padding hover-able text-start rounded-18px article-card"
            max-width="400"
          >
            <v-img
              v-if="it.article.image"
              :src="it.article.image"
              height="200px"
              cover
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
          v-if="!isNew"
          :article-id="article.id"
          :article-user-id="article.user_id"
          :for-product="!!productId"
          :is-selldone="['blog', 'help'].includes(articleType)"
          :is-shop="!!shopId"
          class="pt-3"
        >
          <template v-slot:login>
            <slot name="login"></slot>
          </template>
        </s-article-comments>
      </v-container>
    </div>

    <!-- ██████████████████████ Dialog > Publish time line ██████████████████████ -->

    <v-dialog
      v-model="dialog_timeline"
      fullscreen
      scrollable
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
              :article-type="articleType"
              :current-article-id="article.id"
              :shop-id="shopId"
            ></s-articles-timeline>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="dialog_timeline = false"
            >
              <v-icon start>close</v-icon>
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

import { ArticleTypes } from "@core/enums/article/ArticleTypes";
import { PermissionNames } from "@core/enums/admin/permission/PermissionNames";
import { PermissionLevels } from "@core/enums/admin/permission/PermissionLevels";
import SDateInput from "../ui/calendar/date-input/SDateInput.vue";
import SArticlesTimeline from "@components/article/timeline/SArticlesTimeline.vue";
import SLanguageInput from "@components/ui/input/language/SLanguageInput.vue";
import SArticleFaqs from "./faq/SArticleFaqs.vue";
import SArticleStructuredData from "./SArticleStructuredData.vue";
import SArticleTagsEditor from "./tags/SArticleTagsEditor.vue";
import SSmartMenu from "@components/ui/smart/SSmartMenu.vue";
import STimeProgressBar from "../ui/calendar/time-progress/STimeProgressBar.vue";
import { ShopOptionsHelper } from "@core/helper/shop/ShopOptionsHelper";
import SArticleSearchConsole from "./seo/SArticleSearchConsole.vue";
import AiButton from "@components/ui/button/ai/AiButton.vue";
import _ from "lodash-es";
import SArticleAuthorBox from "@components/article/author/box/SArticleAuthorBox.vue";

export default {
  name: "SArticleView",
  components: {
    SArticleAuthorBox,

    AiButton,
    SArticleSearchConsole,
    STimeProgressBar,
    SSmartMenu,
    SArticleTagsEditor,
    SArticleStructuredData,
    SArticleFaqs,
    SLanguageInput,
    SArticlesTimeline,
    SDateInput,
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
      categories: [],
      category: "",
      category_obj: null,

      // ----------------------------
      schedule_at: null,

      dialog_timeline: false,

      // ----------- Relatives ------------
      relatives: null,

      // ----------- Report ------------
      busy_report: false,

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

    author_avatar() {
      if (!this.article) return null;

      return this.getUserAvatar(this.article.user_id, "big");
    },

    upload_url() {
      // Shop Products:
      if (this.articleType === ArticleTypes.Product.code) {
        return this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
          ? window.VAPI.UPLOAD_MY_VENDOR_ARTICLE_IMAGE(
              this.$route.params.vendor_id,
              this.articleType,
            )
          : window.ARTICLE_API.UPLOAD_ARTICLE_IMAGE(
              this.articleType,
              this.shop_id,
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
          this.$route.params.vendor_id,
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
          this.permissionLevels.DELETE_ACCESS,
        )
      );
    },

    canReport() {
      // Report.
      return (
        this.USER() && this.article && this.article.user_id !== this.USER_ID()
      );
    },
    in_edit_mode() {
      return this.render_state === "editing";
    },
    in_view_mode() {
      return this.render_state === "review";
    },
  },

  watch: {
    targetId(to, from) {
      const force = !(this.multiLanguage && this.forceLanguage); // Prevent reload page in multi-language edit mode!
      this.updateArticlePage(force);
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
  },

  methods: {
    calculateReadTime() {
      let text = "";
      try {
        let text = $(this.article.body).text();
      } catch (e) {
        console.warn(
          "Invalid article body. Auto-fix applied by SD.",
          this.article.body,
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

    //――――――――――――――――――――――― Change listeners ―――――――――――――――――――――――

    onChangeNote($event = null) {
      if (this.in_edit_mode) this.state = "changed";
    },

    onChangeImages(images) {
      this.images_in_article = images;
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
                this.articleType,
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
              this.schedule_at,
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
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.state = "no-change";

            // Old methods:
            this.article.id = data.id; // Old way
            if (data.article) {
              // New way
              Object.assign(this.article, data.article);
            }

            this.article.published = this.published_state;
            this.article.private = this.isPrivate;
            this.article.schedule_at = this.schedule_at;

            // Update smart by changed values: (New methods)
            if (data.changes) Object.assign(this.article, data.changes);

            this.showSuccessAlert(
              this.$t("global.article.notifications.update_success_title"),
              this.$t("global.article.notifications.update_success"),
            );
            if (callback_success) callback_success();

            this.$emit("update-article", this.article);

            // --------------------------------- After Action ---------------------------------
            if (this.isNew) {
              // Need navigate to new URL!
              if (this.articleType === ArticleTypes.SelldoneHelp.code) {
                this.$router.replace({ params: { help_id: data.help_id } });
              } else if (this.articleType === ArticleTypes.SelldoneBlog.code) {
                this.$router.replace({ params: { blog_id: data.blog_id } });
              }
            } else {
              if (this.articleType === ArticleTypes.SelldoneHelp.code) {
                this.menu = data.menu;
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
                : this.$t("global.article.notifications.update_error"),
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

    /**
     * Called externally
     * @param force
     */
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
        .catch((error) => {
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
        .catch((error) => {
          console.log(error);
          this.isStared = !this.isStared;
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
        },
      );
    },

    deleteArticle() {
      axios
        .delete(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_MY_VENDOR_ARTICLE(
                this.$route.params.vendor_id,
                this.articleType,
                this.article.id,
              )
            : window.ARTICLE_API.DELETE_ARTICLE(
                this.articleType,
                this.article.id,
              ),
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
          },
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

    getArticlePageTo(target) {
      const target_id = target.id;
      if (this.articleType === ArticleTypes.SelldoneBlog.code) {
        return {
          name: "BlogSlug",
          params: { blog_id: target_id, slug: target.article.slug },
        };
      } else if (this.articleType === ArticleTypes.SelldoneHelp.code) {
        return { name: "OPageHelp", params: { help_id: target_id } };
      } else if (this.articleType === ArticleTypes.Product.code) {
      } else if (this.is_shop_blog) {
        return {
          name: window.$storefront.routes.SHOP_BLOG_PAGE,
          params: { blog_id: target_id },
        };
      } else if (this.articleType === ArticleTypes.Company.code) {
      }
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
          this.article.id,
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
              data.retry_ms ? data.retry_ms : 2 * 60000,
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
              "Article successfully auto created and loaded.",
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
