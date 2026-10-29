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
  <div class="master-article-container" :class="{ 's-article-workspace text-start': workspace, 's-article-workspace--metadata': workspace && ['seo', 'faq'].includes(workspaceSection), 's-article-workspace--details': workspace && workspace_details && workspaceSection === 'edit' }">
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Loading animation ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <u-loading-progress v-if="inLoading" />
    <u-loading-progress v-if="busy_fix" color="#673AB7" />

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
      v-if="!workspace && can_edit && can_create_new"
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
      <template v-if="workspace && article">
        <header v-if="workspaceSection !== 'comments'" class="s-article-workspace__header">
          <div>
            <h1>{{ $t('global.article.workspace.' + workspace_heading) }}</h1>
            <p>{{ $t('global.article.workspace.' + workspace_subtitle) }}</p>
          </div>
          <div class="s-article-workspace__actions">
            <v-btn v-if="['edit', 'seo', 'faq'].includes(workspaceSection)" class="sd-modern-button sd-modern-button--compact" variant="text" :disabled="workspace_busy" @click="$emit('workspace-preview')">
              <v-icon start size="16">visibility</v-icon>{{ $t('global.article.workspace.preview') }}
            </v-btn>
            <v-btn v-if="workspaceSection === 'article' && !isNew" class="sd-modern-button sd-modern-button--compact" variant="text" :to="workspace_storefront" target="_blank" rel="noopener noreferrer">
              {{ $t('global.article.workspace.preview') }}<v-icon end size="16">north_east</v-icon>
            </v-btn>
            <v-btn v-if="workspace_can_write && ['edit', 'seo', 'faq'].includes(workspaceSection)" class="sd-modern-button sd-modern-button--compact" color="primary" variant="flat" :loading="state === 'saving'" :disabled="workspace_busy || workspace_pending_changes" prepend-icon="save" @click="saveChange()">
              {{ $t(workspace_save_action) }}
            </v-btn>
            <v-btn v-else-if="workspace_can_write && workspaceSection === 'article'" class="sd-modern-button sd-modern-button--compact" color="primary" variant="flat" :disabled="workspace_busy" @click="$emit('workspace-edit')">{{ $t('global.actions.edit') }}</v-btn>
          </div>
        </header>

        <div v-if="workspaceSection === 'edit'" class="s-article-workspace__controls">
          <div class="s-article-workspace__command" role="group" :aria-label="$t('global.article.workspace.controls')">
            <v-menu
              v-for="control in workspace_controls"
              :key="control.key"
              :model-value="workspace_setting === control.key"
              :close-on-content-click="false"
              :persistent="control.key === 'language' && workspace_setting === control.key"
              location="bottom start"
              @update:model-value="(open) => open ? openWorkspaceSetting(control.key) : cancelWorkspaceSetting()"
              @after-enter="focusWorkspaceSetting"
            >
              <template #activator="{ props }">
                <v-btn v-bind="props" class="s-article-workspace__command-button" variant="text" :disabled="control.disabled" :aria-label="control.label">
                  <v-icon size="16" class="me-2">{{ control.icon }}</v-icon><span>{{ control.value }}</span><v-icon size="12" class="ms-1">arrow_drop_down</v-icon>
                  <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" :disabled="workspace_setting === control.key">{{ control.hint }}</v-tooltip>
                </v-btn>
              </template>
              <v-card ref="workspaceSettingCard" :data-setting="control.key" class="s-article-workspace__setting text-start" role="dialog" :aria-label="control.label" @keydown.esc.stop.prevent="cancelWorkspaceSetting()">
                <h2>{{ control.label }}</h2>
                <v-select
                  v-if="control.key !== 'language'"
                  v-model="workspace_setting_values[control.key]"
                  :items="control.key === 'status' ? workspace_statuses : workspace_visibilities"
                  :label="control.label"
                  item-title="title"
                  item-value="value"
                  :menu-props="{ contentClass: 'sd-modern-select-menu' }"
                  variant="underlined"
                  class="sd-modern-underlined-field"
                  :disabled="control.disabled"
                  hide-details
                >
                  <template #selection="{ item }"><v-icon class="me-2" size="16">{{ item.raw.icon }}</v-icon>{{ item.title }}</template>
                  <template #item="{ props, item }"><v-list-item v-bind="props" :prepend-icon="item.raw.icon" /></template>
                </v-select>
                <!-- Keep the popover mounted while the shared language dialog owns focus. -->
                <u-language-input v-else ref="workspaceLanguageInput" v-model="workspace_setting_values.language" :label="control.label" variant="underlined" class="sd-modern-underlined-field" max-width="none" :disabled="control.disabled" hide-details @keydown.enter.prevent="openWorkspaceLanguagePicker" @keydown.space.prevent="openWorkspaceLanguagePicker" />
                <div class="s-article-workspace__setting-actions">
                  <v-btn class="sd-modern-button sd-modern-button--compact" variant="text" @click="cancelWorkspaceSetting()">{{ $t('global.actions.cancel') }}</v-btn>
                  <v-btn class="sd-modern-button sd-modern-button--compact" variant="flat" color="primary" :disabled="control.disabled" @click="applyWorkspaceSetting()">{{ $t('global.actions.apply') }}</v-btn>
                </div>
              </v-card>
            </v-menu>
            <span class="s-article-workspace__command-separator" aria-hidden="true"></span>
            <v-btn class="sd-modern-icon-button s-article-workspace__command-button" icon variant="text" :aria-label="$t('global.article.workspace.import_word')" :disabled="!workspace_can_write || workspace_busy" @click="openWorkspaceWordImport()">
              <img class="s-article-workspace__word-icon" src="@selldone/core-js/enums/file/assets/extensions/docx.svg" alt="" />
              <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.article.workspace.import_word_hint') }}</v-tooltip>
            </v-btn>
            <v-btn class="sd-modern-icon-button s-article-workspace__command-button" icon variant="text" :aria-label="$t('global.article.workspace.auto_fix')" :disabled="!workspace_can_write || (!article.body && state !== 'changed') || workspace_busy" @click="autoFixArticle()">
              <v-icon size="16">auto_fix_high</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.article.workspace.auto_fix') }}</v-tooltip>
            </v-btn>
            <v-spacer />
            <v-btn class="sd-modern-icon-button s-article-workspace__command-button" icon variant="text" :aria-label="$t('global.article.workspace.details')" :aria-expanded="workspace_details" :disabled="workspace_busy" @click="workspace_details = !workspace_details">
              <v-icon size="16">tune</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.article.workspace.details_hint') }}</v-tooltip>
            </v-btn>
            <v-menu v-model="workspace_tools" eager>
              <template #activator="{ props }"><v-btn v-bind="props" class="sd-modern-icon-button s-article-workspace__command-button" icon variant="text" :aria-label="$t('global.article.workspace.tools')" :disabled="workspace_busy"><v-icon size="16">more_vert</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" :disabled="workspace_tools">{{ $t('global.article.workspace.tools') }}</v-tooltip></v-btn></template>
              <v-list class="s-article-workspace__menu text-start" density="compact">
                <v-list-item v-if="can_auto_translate" prepend-icon="g_translate" :title="$t('global.commons.translate')" :disabled="!workspace_can_write" @click="$emit('request-auto-translate', forceLanguage)" />
                <v-list-item prepend-icon="delete_outline" :title="$t('global.article.menu.delete')" :disabled="!workspace_can_write || isNew || workspace_busy" @click="openDeleteArticleAlert()" />
              </v-list>
            </v-menu>
          </div>
          <div class="s-article-workspace__people">
            <div class="s-article-workspace__author">
              <v-avatar size="26" class="avatar-gradient -thin"><img :src="author_avatar" alt="" /></v-avatar>
              <div class="s-article-workspace__author-copy"><span>{{ author_name || user?.name || $t('global.commons.author') }}</span><small>{{ $t('global.commons.author') }}</small></div>
              <slot name="workspace-author" :article="article" :disabled="!workspace_can_write || state === 'saving' || busy_fix || workspace_importing" :on-busy="(value) => workspace_author_busy = value" />
            </div>
            <div class="s-article-workspace__schedule-control">
              <span class="s-article-workspace__schedule-copy">{{ schedule_at ? getLocalTimeString(schedule_at) : $t('global.article.workspace.no_schedule') }}<template v-if="schedule_at"> · {{ workspace_timezone }}</template></span>
              <v-btn variant="outlined" class="sd-modern-button sd-modern-button--compact" :disabled="!workspace_can_write || workspace_busy" prepend-icon="schedule" @click="openWorkspaceSchedule()">{{ $t('global.article.workspace.schedule') }}</v-btn>
            </div>
          </div>
        </div>

        <section v-if="workspaceSection === 'analytics'" class="s-article-workspace__analytics sd-modern-widget">
          <dl class="s-article-workspace__metrics"><div v-for="metric in workspace_metrics" :key="metric.label"><dt>{{ $t('global.article.workspace.' + metric.label) }}</dt><dd>{{ metric.value ?? '—' }}</dd><span>{{ $t('global.article.workspace.all_time') }}</span></div></dl>
          <div class="s-article-workspace__search-title"><img src="../assets/trademark/google.svg" alt="" width="18" height="18" /><div><h2>{{ $t('global.article.search_console.title') }}</h2><p>{{ $t('global.article.search_console.subtitle') }}</p></div></div>
          <s-article-search-console v-if="article.id && !isNew" :article="article" :shop="$shop" workspace />
          <p v-else class="sd-modern-help">{{ $t('global.article.workspace.save_first') }}</p>
        </section>

        <!-- Keep staged SEO/FAQ dialogs mounted when moving between resource tabs. -->
        <section v-show="workspaceSection === 'seo'" class="s-article-workspace__seo">
          <div class="s-article-workspace__seo-grid">
            <s-article-seo-editor v-if="article" :article="article" :images="images_in_article" workspace :disabled="!workspace_can_write || workspace_busy" @change="onChangeNote" @open-menu="$refs.editorContainer?.findAllImages()" />
            <aside class="s-article-workspace__previews">
              <section>
                <h2>{{ $t('global.article.workspace.search_preview') }}</h2>
                <div class="s-article-workspace__search-preview">
                  <div class="s-article-workspace__preview-site">
                    <span class="s-article-workspace__site-mark" aria-hidden="true">{{ ($shop?.title || $shop?.name || 'S').slice(0, 1) }}</span>
                    <div><div class="s-article-workspace__site-title">{{ $shop?.title || $shop?.name }}</div><div class="s-article-workspace__preview-url" dir="ltr">{{ $shop?.name }} / blog / {{ article.parent_id || targetId }} / {{ article.slug }}</div></div>
                  </div>
                  <h3>{{ article.page_title || article.title || $t('global.article.workspace.new_title') }}</h3>
                  <p>{{ article.description }}</p>
                </div>
                <p class="s-article-workspace__preview-help">{{ $t('global.article.workspace.search_disclaimer') }}</p>
              </section>
              <section>
                <h2>{{ $t('global.article.workspace.sharing_preview') }}</h2>
                <div class="s-article-workspace__sharing-preview">
                  <div class="s-article-workspace__sharing-image">
                    <img v-if="article.image" :src="article.image" alt="" />
                    <span v-else><v-icon size="24" aria-hidden="true">image</v-icon>{{ $t('global.article.workspace.no_sharing_image') }}</span>
                  </div>
                  <div class="s-article-workspace__sharing-copy"><div class="s-article-workspace__preview-url">{{ $shop?.title || $shop?.name }}</div><h3>{{ article.page_title || article.title || $t('global.article.workspace.new_title') }}</h3><p>{{ article.description }}</p></div>
                </div>
              </section>
            </aside>
          </div>
          <div class="s-article-workspace__seo-extra">
            <s-article-structured-data v-model="article.structures" workspace :active="workspaceSection === 'seo'" :editMode="workspace_can_write && !workspace_busy" @update:model-value="onChangeNote" @pending-change="workspace_schema_pending = $event" />
          </div>
        </section>
        <s-article-workspace-faqs v-show="workspaceSection === 'faq'" v-model="article.faqs" :active="workspaceSection === 'faq'" :edit-mode="workspace_can_write" :disabled="workspace_busy" @update:model-value="onChangeNote" @pending-change="workspace_faq_pending = $event" />
      </template>
      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Top author info + Edit / Follow / Save ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <v-toolbar
        v-if="!workspace && USER() && can_edit && canEdit"
        extended
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

            <v-tooltip
              activator="parent"
              location="top"
              max-width="360"
              aria-label="switch to edit mode"
            >
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

          <u-language-input
            v-model="article.lang"
            :class="{ pen: !in_edit_mode }"
            :disabled="!can_change_article_language"
            class="mx-2 mt-2 overflow-hidden min-width-150"
            dense
            flat
            max-width="150px"
            prepend-inner-icon="translate"
            single-line
            :variant="can_change_article_language ? 'solo' : 'plain'"
            @change="onChangeNote()"
            hide-details
          >
            <v-tooltip
              v-if="can_change_article_language"
              activator="parent"
              location="top"
              max-width="360"
            >
              Change the language of this article.
            </v-tooltip>
          </u-language-input>

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
              src="@selldone/core-js/enums/file/assets/extensions/docx.svg"
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
            <u-button-ai-small
              v-if="
                articleType === ArticleTypes.Product.code &&
                in_edit_mode &&
                !IS_VENDOR_PANEL
              "
              :loading="auto_generate_busy"
              title="Write article - 😈 Beta version | ⚡ Due to high demand and limited resources, there may be errors. Please try again later after 60sec."
              @click="autoGenerate(true)"
            >
            </u-button-ai-small>
          </v-slide-y-transition>
        </v-toolbar-items>

        <v-spacer />

        <v-toolbar-items class="pt-1 pt-md-3">
          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Switch language ━━━━━━━━━━━━━━━━━━━━━━ -->

          <template
            v-if="canEdit && !in_edit_mode && languages && multiLanguage"
          >
            <u-language-input
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
            </u-language-input>
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

          <u-smart-menu
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
          </u-smart-menu>
        </template>
      </v-toolbar>

      <v-expand-transition>
        <div v-if="!workspace && in_edit_mode">
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
                    <u-time-progress-bar
                      v-if="article && schedule_at"
                      :end-time="schedule_at"
                      :start-time="article.created_at"
                      active-color="#FFA000"
                      bg-color="#fff"
                      class="max-w-250 mt-2"
                      small
                    ></u-time-progress-bar>
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
                  <u-date-input
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
                      :variant="
                        lang === article?.lang?.toLowerCase() ? 'flat' : 'plain'
                      "
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
                              $shop &&
                              lang.toLowerCase() ===
                                $shop.language.toLowerCase()
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
                  <s-article-tags-editor :article="article" :shop="$shop" />
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

      <hr v-if="!workspace && canEdit" />

      <!-- ――――――――――――――――――――― 🔍 Google search rank ――――――――――――――――――――― -->
      <v-expand-transition>
        <div
          v-show="!workspace && show_google_tank"
          class="shadow-paper rounded-14-12 max-width-container-1280px mx-auto"
        >
          <s-article-search-console
            v-if="article?.id && first_load_seo_audit"
            :key="'seo' + article?.id"
            :article="article"
            :shop="$shop"
          >
          </s-article-search-console>
        </div>
      </v-expand-transition>
      <!-- ―――――――――――――――――――――――――――――――――――――――――――――――― -->

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Article ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <div class="samin-article-widget" :class="{ 's-article-workspace__writing': workspace, 's-article-workspace__writing--details': workspace && workspaceSection === 'edit' && workspace_details }" :inert="workspace && workspace_busy" v-show="!workspace || ['edit', 'article'].includes(workspaceSection)">
        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Article > Content ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
        <!-- display: inline-block; Bug in flow image correction -->

        <s-article-editor
          v-if="article"
          :key="workspace ? article.id : undefined"
          ref="editorContainer"
          v-model:body="article.body"
          v-model:title="article.title"
          :edit="in_edit_mode && (!workspace || workspace_can_write)"
          :enable-title="showTitle"
          :has-table-of-content="hasTableOfContent"
          :hide-title="hideTitle"
          :only-view="workspace ? !workspace_can_write : !canEdit"
          :workspace="workspace"
          :upload-url="upload_url"
          :word-converter-url="word_converter_url"
          class="samin-article-content"
          :class="workspace ? 's-article-workspace__editor' : 'p-lg-5 p-md-4 p-3'"
          @change="onChangeNote"
          @update:images="onChangeImages"
          @workspace-busy="workspace_importing = $event"
        >
          <template v-if="workspace && workspaceSection === 'article'" #before-title>
            <div class="s-article-workspace__metadata" role="group" :aria-label="$t('global.article.workspace.details')">
              <dl class="s-article-workspace__metadata-fields">
                <div v-for="field in workspace_metadata" :key="field.key" :data-metadata="field.key">
                  <dt class="d-sr-only">{{ field.label }}</dt>
                  <dd class="sd-modern-status sd-modern-status--plain">
                    <span v-if="field.tone" class="sd-modern-status__dot" :class="'text-' + field.tone" aria-hidden="true"></span>
                    <v-icon :icon="field.icon" size="14" aria-hidden="true" />
                    <span>{{ field.value }}</span>
                  </dd>
                </div>
              </dl>
              <span v-if="isNew || workspace_dirty" class="s-article-workspace__metadata-note">{{ $t('global.article.workspace.unsaved') }}</span>
            </div>
          </template>
          <template v-slot:after-title>
            <!-- ――――――――――――――――――――― Author Info Small Top ――――――――――――――――――――― -->

            <p v-if="showAuthorInfo && (!workspace || workspaceSection === 'article')" class="text-start small m-0">
              <v-avatar
                class="avatar-gradient -thin hover-scale force-top"
                size="32"
              >
                <img :src="author_avatar" />
              </v-avatar>

              <span
                v-if="user?.id && user?.name"
                class="mx-2 text-link-normal fadeIn delay_100"
              >
                {{ $t("global.article.author_title") }}

                <router-link
                  :to="{
                    name: 'AuthorPage',
                    params: { author: Slugify.apply(user.name), author_id: user.id },
                  }"
                >
                  {{ author_name }}
                </router-link>
              </span>

              <slot name="author-actions" :article="article" :disabled="workspace && (!workspace_can_write || state === 'saving' || busy_fix || workspace_importing)" :on-busy="(value) => { if (workspace) workspace_author_busy = value; }"></slot>

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
              v-if="showAuthorInfo && reading_time && (!workspace || workspaceSection === 'article')"
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
              v-if="!workspace || workspaceSection === 'article'"
              v-model:faqs="article.faqs"
              :editMode="edit"
              @change="onChangeNote"
              color="var(--background)"
            ></s-article-faqs>

            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Structured Data ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
            <s-article-structured-data
              v-if="!workspace && in_edit_mode"
              v-model="article.structures"
              :editMode="edit"
            ></s-article-structured-data>
          </template>
        </s-article-editor>

        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Article > Tags ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
        <slot v-if="article" name="tags" v-bind:article="article"></slot>

        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Article > Like / Star ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

        <div v-if="showUserFeedbackButtons && !isNew && (!workspace || workspaceSection === 'article')" style="min-height: 64px;" class="text-end">



          <v-chip
            v-if="!isNew"
            :class="{
                'disabled-no-filter': catch_power || power_busy,
                bounceIn: catch_power
              }"

            :color="catch_power ? '#025185' : '#fff'"
            :title="
              catch_power
                ? $t('global.article.claps')
                : $t('global.article.claps_action')
            "
            class="ma-2"
            @click="getPower"
            prepend-icon="fa:fas fa-sign-language"
            :variant="!catch_power ? 'elevated' : 'flat'"

          >
              {{ numeralFormat(article.power, "0.[0] a") }}

           <v-expand-x-transition>
             <span v-if="power_busy ">
               <i  class="fas fa-circle-notch fa-spin ms-2"></i>
             </span>
           </v-expand-x-transition>

          </v-chip>

          <v-chip
            v-if="hasLike"
            class="ma-2"
            :class="{ bounceIn: isLiked }"
            :color="!USER() ? '#c2185b' : isLiked ? '#c2185b' : '#fff'"
            :variant="!isLiked ? 'elevated' : 'flat'"

            :prepend-icon="!USER() ? 'favorite' : isLiked ? 'favorite' : 'favorite_border'"

            @click="likeArticle"
          >
              {{ numeralFormat(article.like, "0.[0] a") }}
              {{ $t("global.article.likes") }}
          </v-chip>

          <v-chip
            v-if="hasFavorite"
            :class="{ bounceIn: isStared }"
            class="ma-2"
            @click="starArticle"

            :variant="!isStared ? 'elevated' : 'flat'"
            :color="isStared ? '#fbc02d' : '#fff'"
            :prepend-icon="isStared ? 'star' : 'star_border' "
          >
            {{$t('global.commons.favorite')}}
          </v-chip>
        </div>
        <aside v-if="workspace" v-show="workspace_details && workspaceSection === 'edit'" class="s-article-workspace__details" :inert="!workspace_can_write || workspace_busy">
          <h2>{{ $t('global.article.workspace.details') }}</h2>
          <slot name="extra-header-options" :categoryId="category" :setCategoryId="setWorkspaceCategory" :clusterId="cluster_id" :setClusterId="setWorkspaceCluster" :inEditMode="in_edit_mode" :state="state" :onChange="onChangeNote" :disabled="!workspace_can_write || workspace_busy" />
          <s-article-tags-editor v-if="article.id && is_shop_blog && workspace_can_write" :article="article" :shop="$shop" />
        </aside>
      </div>
      <div v-if="workspace && ['edit', 'seo', 'faq'].includes(workspaceSection)" class="s-article-workspace__save-state" :class="{ 's-article-workspace__save-state--wide': workspaceSection !== 'edit' }" role="status">{{ $t(workspace_has_changes ? 'global.article.workspace.unsaved' : 'global.article.workspace.saved') }}</div>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ author info + Edit / Follow / Save ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <v-sheet
        v-if="showAuthorInfo && article?.user_id > 0 && (!workspace || workspaceSection === 'article')"
        color="#eee"
        class="my-5 pa-2 overflow-hidden mx-auto"
        rounded="xl"
        max-width="1160"
      >
        <v-sheet color="#fff" rounded="xl" elevation="4">
          <s-article-author-box
            v-model:is-follow="isFollow"
            v-model:reported="reported"
            :article="article"
          >
          </s-article-author-box>
        </v-sheet>
      </v-sheet>

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

            <v-card-title class="tit text-wrap">
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

      <!-- Dashboard callers own moderation; the fallback keeps generic workspaces independent. -->
      <slot
        v-if="workspace && !isNew && showComments && article?.id"
        name="workspace-comments"
        :article="article"
        :active="workspaceSection === 'comments'"
        :disabled="state === 'saving' || busy_fix || workspace_importing || workspace_author_busy"
        :on-dirty="(value) => workspace_comments_dirty = value"
        :on-busy="(value) => workspace_comments_busy = value"
        :on-count="(value) => article.comments_count = value"
      >
      <s-article-workspace-comments
        v-show="workspaceSection === 'comments'"
        :key="`${shop_id}:${article.id}`"
        :active="workspaceSection === 'comments'"
        :article-id="article.id"
        :article-user-id="article.user_id"
        :shop-id="shop_id"
        :for-product="!!productId"
        :is-selldone="['blog', 'help'].includes(articleType)"
        :is-shop="!!$shop?.id"
        :disabled="state === 'saving' || busy_fix || workspace_importing || workspace_author_busy"
        @dirty="workspace_comments_dirty = $event"
        @busy="workspace_comments_busy = $event"
        @count="article.comments_count = $event"
      >
        <template #login><slot name="login"></slot></template>
      </s-article-workspace-comments>
      </slot>

      <v-container v-if="!workspace && !isNew && showComments && article">
        <s-article-comments
          v-if="!isNew"
          :article-id="article.id"
          :article-user-id="article.user_id"
          :for-product="!!productId"
          :is-selldone="['blog', 'help'].includes(articleType)"
          :is-shop="!!$shop?.id"
          class="pt-3"
        >
          <template v-slot:login>
            <slot name="login"></slot>
          </template>
        </s-article-comments>
      </v-container>
    </div>

    <v-dialog v-if="workspace" v-model="workspace_schedule" max-width="520" :persistent="state === 'saving'">
      <v-card class="s-article-workspace__schedule text-start" rounded="xl">
        <v-card-title>{{ $t('global.article.workspace.schedule') }}</v-card-title>
        <v-card-text><p>{{ $t('global.article.workspace.schedule_hint') }}</p><u-date-input ref="workspaceScheduleInput" v-model="workspace_schedule_value" :label="$t('global.article.schedule_input')" :min="new Date().toISOString()" variant="underlined" class="sd-modern-underlined-field" clearable return-utc :disabled="!workspace_can_write || workspace_busy" @keydown.enter.prevent="openWorkspaceSchedulePicker" @keydown.space.prevent="openWorkspaceSchedulePicker" /><p>{{ $t('global.article.workspace.schedule_timezone', { timezone: workspace_timezone }) }}</p><v-btn v-if="!isNew" variant="text" class="sd-modern-button sd-modern-button--compact" @click="workspace_schedule = false; showTimeline()">{{ $t('global.article.schedule_view_action') }}</v-btn></v-card-text>
        <v-card-actions><v-spacer /><v-btn variant="text" class="sd-modern-button sd-modern-button--compact" @click="workspace_schedule = false">{{ $t('global.actions.cancel') }}</v-btn><v-btn variant="flat" color="primary" class="sd-modern-button sd-modern-button--compact" :disabled="!workspace_can_write || workspace_busy" @click="applyWorkspaceSchedule()">{{ $t('global.actions.apply') }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

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
              :shop-id="$shop?.id"
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

<script lang="ts">
import SArticleComments from "./comment/SArticleComments.vue";
import SArticleWorkspaceComments from "./comment/SArticleWorkspaceComments.vue";

import SArticleSeoEditor from "./SArticleSeoEditor.vue";

import SArticleEditor from "./SArticleEditor.vue";
import { PermissionNames } from "@selldone/core-js/enums/admin/permission/PermissionNames";
import { PermissionLevels } from "@selldone/core-js/enums/admin/permission/PermissionLevels";
import UDateInput from "../ui/date/input/UDateInput.vue";
import SArticlesTimeline from "../article/timeline/SArticlesTimeline.vue";
import ULanguageInput from "../ui/language/input/ULanguageInput.vue";
import SArticleFaqs from "./faq/SArticleFaqs.vue";
import SArticleWorkspaceFaqs from "./faq/SArticleWorkspaceFaqs.vue";
import SArticleStructuredData from "./SArticleStructuredData.vue";
import SArticleTagsEditor from "./tags/SArticleTagsEditor.vue";
import USmartMenu from "../ui/smart/menu/USmartMenu.vue";
import UTimeProgressBar from "../ui/time/progress-bar/UTimeProgressBar.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import SArticleSearchConsole from "./seo/SArticleSearchConsole.vue";
import UButtonAiSmall from "../ui/button/ai/small/UButtonAiSmall.vue";
import { delay } from "lodash-es";
import SArticleAuthorBox from "../article/author/box/SArticleAuthorBox.vue";
import { Article } from "@selldone/core-js";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import {Slugify} from "@selldone/core-js/utils/slugify/slugify.ts";
import AuthMixin from "@selldone/components-vue/mixin/auth/AuthMixin.ts";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

export default {
  name: "ArticleViewer",
  mixins: [DateMixin,AuthMixin ],
  components: {
    SArticleAuthorBox,

    UButtonAiSmall,
    SArticleSearchConsole,
    UTimeProgressBar,
    USmartMenu,
    SArticleTagsEditor,
    SArticleStructuredData,
    SArticleFaqs,
    SArticleWorkspaceFaqs,
    ULanguageInput,
    SArticlesTimeline,
    UDateInput,
    SArticleSeoEditor,
    SArticleEditor,
    SArticleComments,
    SArticleWorkspaceComments,
  },
  inject: ["$shop"],
  emits: ["request-auto-translate", "update-article", "delete", "get-data", "workspace-preview", "workspace-edit", "workspace-dirty", "workspace-busy"],
  props: {
    workspace: { type: Boolean, default: false },
    workspaceSection: { type: String, default: "edit" },
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
      Slugify:Slugify,


      ArticleTypes: Article.Types,

      can_edit: false,

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
      workspace_tools: false,
      workspace_details: false,
      workspace_schedule: false,
      workspace_schedule_value: null,
      workspace_schedule_context: null,
      workspace_setting: null,
      workspace_setting_context: null,
      workspace_setting_values: { status: false, visibility: false, language: "en" },
      workspace_author_busy: false,
      workspace_comments_busy: false,
      workspace_comments_dirty: false,
      workspace_schema_pending: false,
      workspace_faq_pending: false,
      workspace_ready: false,
      workspace_importing: false,
      workspace_saved_schedule: null,
    };
  },

  computed: {
    workspace_can_write() {
      // 🔏 A resource view never grants Shop BLOG write access by itself.
      return this.canEdit && (!this.workspace || (this.USER() && typeof this.writeShopAccess === "function" && this.writeShopAccess(ShopPermissionRegions.BLOG.code)));
    },
    workspace_busy() { return this.workspace && (this.state === "saving" || this.busy_fix || this.workspace_importing || this.workspace_author_busy || this.workspace_comments_busy); },
    workspace_pending_changes() { return this.workspace_schema_pending || this.workspace_faq_pending; },
    workspace_has_changes() { return this.workspace_dirty || (this.workspace && (this.workspace_comments_dirty || this.workspace_pending_changes)); },
    workspace_dirty() {
      return this.workspace && this.workspace_ready && (this.workspace_busy || this.state === "changed" || this.published_state !== this.article.published || this.isPrivate !== this.article.private || this.schedule_at !== this.workspace_saved_schedule);
    },
    workspace_save_action() {
      if (["seo", "faq"].includes(this.workspaceSection)) return "global.article.workspace.save_changes";
      if (this.schedule_at) return "global.article.workspace.save_and_schedule";
      if (!this.published_state) return "global.article.workspace.save_draft";
      if (!this.isNew && this.article.published) return "global.article.workspace.save_changes";
      return "global.article.workspace.save_and_publish";
    },
    workspace_metadata() {
      const language = this.forceLanguage || this.article.lang;
      const fields = [
        { key: "status", label: this.$t("global.article.workspace.status"), value: this.$t(this.schedule_at ? "global.article.workspace.scheduled" : this.published_state ? "global.article.published" : "global.article.draft"), icon: this.schedule_at ? "watch_later" : this.published_state ? "fa:fas fa-rss" : "fa:fas fa-pencil-ruler", tone: this.published_state && !this.schedule_at ? "success" : "warning" },
        { key: "visibility", label: this.$t("global.article.workspace.visibility"), value: this.$t(this.isPrivate ? "global.article.private" : "global.article.public"), icon: this.isPrivate ? "fa:fas fa-user-lock" : "fa:fas fa-globe", tone: this.isPrivate ? "error" : "success" },
        { key: "language", label: this.$t("global.article.workspace.language"), value: language ? this.getLanguageName(language) || language : this.$t("global.commons.not_set"), icon: "translate" },
      ];
      if (this.schedule_at) fields.push({ key: "schedule", label: this.$t("global.article.workspace.schedule"), value: `${this.getLocalTimeString(this.schedule_at)} · ${this.workspace_timezone}`, icon: "schedule" });
      return fields;
    },
    workspace_statuses() { return [
      { title: this.$t("global.article.published"), value: true, icon: "fa:fas fa-rss" },
      { title: this.$t("global.article.draft"), value: false, icon: "fa:fas fa-pencil-ruler" },
    ]; },
    workspace_visibilities() { return [
      { title: this.$t("global.article.public"), value: false, icon: "fa:fas fa-globe" },
      { title: this.$t("global.article.private"), value: true, icon: "fa:fas fa-user-lock" },
    ]; },
    workspace_controls() {
      const disabled = !this.workspace_can_write || this.workspace_busy;
      return [
        { key: "status", label: this.$t("global.article.workspace.status"), hint: this.$t("global.article.workspace.status"), value: this.$t(this.published_state ? "global.article.published" : "global.article.draft"), icon: this.published_state ? "fa:fas fa-rss" : "fa:fas fa-pencil-ruler", disabled: disabled || !!this.schedule_at },
        { key: "visibility", label: this.$t("global.article.workspace.visibility"), hint: this.$t("global.article.workspace.visibility_hint"), value: this.$t(this.isPrivate ? "global.article.private" : "global.article.public"), icon: this.isPrivate ? "fa:fas fa-user-lock" : "fa:fas fa-globe", disabled },
        { key: "language", label: this.$t("global.article.workspace.language"), hint: this.$t("global.article.workspace.language_hint"), value: (this.forceLanguage || this.article.lang || "").toUpperCase(), icon: "translate", disabled: disabled || !this.can_change_article_language },
      ];
    },
    workspace_timezone() { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; },
    workspace_heading() { return ({ article: "article", edit: this.isNew ? "new_title" : "edit_title", seo: "seo_title", faq: "faq_title", analytics: "analytics", comments: "comments" })[this.workspaceSection] || "article"; },
    workspace_subtitle() { return ({ article: "article_subtitle", edit: this.isNew ? "new_subtitle" : "edit_subtitle", seo: "seo_subtitle", faq: "faq_subtitle", analytics: "analytics_subtitle", comments: "comments_subtitle" })[this.workspaceSection] || "article_subtitle"; },
    workspace_storefront() { return { name: window.$storefront?.routes.SHOP_BLOG_PAGE, params: { shop_name: this.$shop?.name, blog_id: this.article.parent_id || this.targetId } }; },
    workspace_metrics() { return [
      { label: "views", value: this.article.views ?? this.article.parent?.views },
      { label: "likes", value: this.article.like },
      { label: "claps", value: this.article.power },
      { label: "comments", value: this.article.comments_count ?? this.article.parent?.comments_count },
    ]; },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    is_shop_blog() {
      return this.articleType === Article.Types.Blog.code;
    },

    // ▃▃▃▃▃▃▃▃▃▃▃▃▃ Multi Language ▃▃▃▃▃▃▃▃▃▃▃▃▃

    languages() {
      // Available languages of shop!
      return this.$shop && ShopOptionsHelper.GetLanguages(this.$shop);
    },
    can_change_article_language() {
      return this.in_edit_mode && !this.forceLanguage;
    },

    can_auto_translate() {
      return (
        this.multiLanguage &&
        this.$shop &&
        this.forceLanguage &&
        this.forceLanguage.toLowerCase() !==
          this.$shop.language.toLowerCase() /*Not default language*/ &&
        !this.multiLanguageAvailable.includes(this.forceLanguage.toLowerCase())
      ); /*Not have article!*/
    },

    //----------------------------------------
    shop_id() {
      return this.$route.params.shop_id
        ? this.$route.params.shop_id
        : this.$shop?.id
          ? this.$shop.id
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
      if (this.articleType === Article.Types.Product.code) {
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
          PermissionNames.Content,
          PermissionLevels.DELETE_ACCESS,
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
    workspaceSection(section, previousSection) { this.syncWorkspaceSection(previousSection); },
    workspace_has_changes(value) { if (this.workspace) this.$emit("workspace-dirty", !!value); },
    workspace_busy(value) { if (this.workspace) { this.$emit("workspace-busy", !!value); if (value) { this.cancelWorkspaceSetting(); this.workspace_schedule = false; this.workspace_tools = false; } } },
    workspace_can_write(value) { if (this.workspace) { this.syncWorkspaceSection(); if (!value) { this.workspace_tools = false; this.workspace_schedule = false; } } },
    workspace_schedule(open) { if (!open) { this.workspace_schedule_value = null; this.workspace_schedule_context = null; } },
    targetId(to, from) {
      const force = !(this.multiLanguage && this.forceLanguage); // Prevent reload page in multi-language edit mode!
      this.updateArticlePage(force);
    },

    schedule_at(value) {
      this.state = "changed";
      if (this.workspace && value) this.published_state = false;
    },

    "article.structures": {
      handler: function (newValue) {
        if (!this.workspace) this.onChangeNote();
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
    this._workspaceGeneration = 0;
    this.$nextTick(() => {
      this.render_state = this.initialRenderState;

      if (!this.canEdit) this.render_state = "review"; // Make sure not show wrong mode for who has no edit access!
    });
  },

  mounted() {
    this.updateArticlePage();
  },
  beforeUnmount() { this._workspaceGeneration++; },

  methods: {
    syncWorkspaceSection(previousSection = this.workspaceSection) {
      if (!this.workspace) return;
      // Metadata and FAQ edits must not re-serialize an untouched article body.
      if (this.workspace_ready && previousSection === "edit" && this.$refs.editorContainer?.state === "changed") {
        this.article.title = this.$refs.editorContainer.purifyTitle();
        this.article.body = this.$refs.editorContainer.purifyBody();
      }
      this.workspace_tools = false;
      this.cancelWorkspaceSetting();
      this.workspace_schedule = false;
      this.render_state = ["edit", "seo", "faq"].includes(this.workspaceSection) && this.workspace_can_write ? "editing" : "review";
      if (this.workspaceSection === "seo") this.$nextTick(() => this.$refs.editorContainer?.findAllImages());
    },
    setWorkspaceCategory(value) { if (this.workspace_can_write && !this.workspace_busy) { this.category = value; this.onChangeNote(); } },
    setWorkspaceCluster(value) { if (this.workspace_can_write && !this.workspace_busy) { this.cluster_id = value; this.onChangeNote(); } },
    openWorkspaceSetting(key) {
      const control = this.workspace_controls.find((control) => control.key === key);
      if (!this.workspace || !control || control.disabled) return;
      this.workspace_tools = false;
      this.workspace_setting_values[key] = key === "status" ? this.published_state : key === "visibility" ? this.isPrivate : this.article.lang;
      this.workspace_setting_context = { generation: this._workspaceGeneration, article: this.article, shopId: this.shop_id };
      this.workspace_setting = key;
    },
    cancelWorkspaceSetting() { this.workspace_setting = null; this.workspace_setting_context = null; },
    focusWorkspaceSetting() {
      const cards = this.$refs.workspaceSettingCard || [];
      cards.find((card) => card.$el?.dataset.setting === this.workspace_setting)?.$el.querySelector("input")?.focus();
    },
    openWorkspaceLanguagePicker() {
      if (this.workspace_setting !== "language" || !this.workspace_can_write || this.workspace_busy || !this.can_change_article_language) return;
      this.$refs.workspaceLanguageInput?.[0]?.showDialog();
    },
    applyWorkspaceSetting() {
      const key = this.workspace_setting, context = this.workspace_setting_context;
      const control = this.workspace_controls.find((control) => control.key === key);
      if (!context || context.generation !== this._workspaceGeneration || context.article !== this.article || context.shopId !== this.shop_id || !control || control.disabled) { this.cancelWorkspaceSetting(); return; }
      const value = this.workspace_setting_values[key];
      if (key === "language") this.setWorkspaceLanguage(value);
      else if (typeof value === "boolean") {
        const field = key === "status" ? "published_state" : "isPrivate";
        if (this[field] !== value) { this[field] = value; this.onChangeNote(); }
      }
      this.cancelWorkspaceSetting();
    },
    openWorkspaceWordImport() { if (this.workspace_can_write && !this.workspace_busy) this.$refs.editorContainer?.showSelectWord(); },
    openWorkspaceSchedule() {
      if (!this.workspace || !this.workspace_can_write || this.workspace_busy) return;
      this.cancelWorkspaceSetting();
      this.workspace_schedule_value = this.schedule_at;
      this.workspace_schedule_context = { generation: this._workspaceGeneration, article: this.article, shopId: this.shop_id };
      this.workspace_schedule = true;
    },
    openWorkspaceSchedulePicker() {
      if (this.workspace_schedule && this.workspace_can_write && !this.workspace_busy) this.$refs.workspaceScheduleInput?.showDialog();
    },
    applyWorkspaceSchedule() {
      const context = this.workspace_schedule_context;
      if (!this.workspace_can_write || this.workspace_busy || !context || context.generation !== this._workspaceGeneration || context.article !== this.article || context.shopId !== this.shop_id) { this.workspace_schedule = false; return; }
      const pending = this.workspace_schedule_value, current = this.schedule_at;
      const sameTime = pending && current && Number.isFinite(Date.parse(current)) && Date.parse(pending) === Date.parse(current);
      if (pending !== current && !sameTime) { this.schedule_at = pending; this.onChangeNote(); }
      this.workspace_schedule = false;
    },
    setWorkspaceLanguage(value) {
      // The shared picker also emits its current language when mounted.
      if (!this.workspace_can_write || this.workspace_busy || !this.can_change_article_language || value === this.article.lang) return;
      this.article.lang = value;
      this.onChangeNote();
    },
    readyWorkspace() {
      if (!this.workspace) return;
      if (!Array.isArray(this.article.faqs)) this.article.faqs = [];
      if (!Array.isArray(this.article.structures)) this.article.structures = [];
      this.syncWorkspaceSection();
      const generation = this._workspaceGeneration;
      this.$nextTick(() => { if (generation !== this._workspaceGeneration) return; this.workspace_saved_schedule = this.schedule_at; this.state = "no-change"; this.workspace_ready = true; });
    },
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
      if (this.workspace && (!this.workspace_can_write || !this.workspace_ready)) return;
      if (this.in_edit_mode) this.state = "changed";
    },

    onChangeImages(images) {
      this.images_in_article = images;
    },

    saveChange(callback_success = null) {
      if (this.workspace && (!this.workspace_can_write || this.workspace_busy || this.workspace_pending_changes || !this.$refs.editorContainer)) return;
      const generation = this._workspaceGeneration, sourceArticle = this.article, shopId = this.shop_id;
      if (!this.article.description)
        this.article.description = this.$refs.editorContainer.gist();

      if (!this.article.image)
        this.article.image = this.$refs.editorContainer.firstImage();

      // ==================== Purify Body ==================

      const readEditor = !this.workspace || this.workspaceSection === "edit";
      let pure_title = readEditor ? this.$refs.editorContainer.purifyTitle() : this.article.title;
      if (!pure_title) {
        return NotificationService.showErrorAlert(null, this.workspace ? this.$t("global.article.workspace.missing_title") : "Title can not be empty!");
      }
      this.article.title = pure_title;

      let pure_body = readEditor ? this.$refs.editorContainer.purifyBody() : this.article.body;
      if (this.workspace && !pure_body?.trim()) return NotificationService.showErrorAlert(null, this.$t("global.article.workspace.missing_body"));

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
          if (this.workspace && (generation !== this._workspaceGeneration || sourceArticle !== this.article || shopId !== this.shop_id)) return;
          if (this.workspace && !this.workspace_can_write) { this.state = "changed"; return; }
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
            if (this.workspace) { this.workspace_saved_schedule = this.schedule_at; this.isNew = false; }

            NotificationService.showSuccessAlert(
              this.$t("global.article.notifications.update_success_title"),
              this.$t("global.article.notifications.update_success"),
            );
            if (callback_success) callback_success();

            this.$emit("update-article", this.article);

            // --------------------------------- After Action ---------------------------------
            if (this.isNew) {
              // Need navigate to new URL!
              if (this.articleType === Article.Types.SelldoneHelp.code) {
                this.$router.replace({ params: { help_id: data.help_id } });
              } else if (this.articleType === Article.Types.SelldoneBlog.code) {
                this.$router.replace({ params: { blog_id: data.blog_id } });
              }
            } else {
              if (this.articleType === Article.Types.SelldoneHelp.code) {
                this.menu = data.menu;
              }
            }
            // ---------------------------------------------------------------------------------
          } else {
            this.state = "changed";
            NotificationService.showErrorAlert(
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
          if (this.workspace && (generation !== this._workspaceGeneration || sourceArticle !== this.article || shopId !== this.shop_id)) return;
          this.state = "changed";
          NotificationService.showLaravelError(error);
        })
        .finally(() => {});
    },

    //――――――――――――――――――――――― Update page ―――――――――――――――――――――――

    /**
     * Called externally
     * @param force
     */
    updateArticlePage(force = false) {
      const generation = ++this._workspaceGeneration;
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
          ? window.XAPI.GET_SHOP_BLOG_DATA(this.$shop.name, this.targetId)
          : window.GAPI.GET_ARTICLE(this.articleType, this.targetId);

        axios
          .get(url, {
            params: {
              relatives: this.hasRelatedArticles,
            },
          })
          .then(({ data }) => {
            if (this.workspace && generation !== this._workspaceGeneration) return;
            if (data.error) {
              this.error_msg = data.error_msg;

              this.NOT_FOUND_ARTICLE = true;

              this.can_create_new = true;

              return;
            }

            this.onGetArticlePackData(data);
          })

          .catch((error) => {
            if (this.workspace && generation !== this._workspaceGeneration) return;
            this.NOT_FOUND_ARTICLE = true;

            this.can_create_new = true;
          })
          .finally(() => {
            if (this.workspace && generation !== this._workspaceGeneration) return;
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
      this.readyWorkspace();
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
      if (this.$shop) {
        this.article.lang = this.workspace ? this.$shop.language || this.getCurrentLanguage().code : this.$shop.langauge;
      }

      if (this.workspace) { this.article.published = false; this.published_state = false; this.article.private = false; this.inLoading = false; }

      this.refreshPlaceholders();
      this.readyWorkspace();
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
      if(!this.USER()){
        return this.NeedLogin();
      }

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
      if(!this.USER()){
        return this.NeedLogin();
      }

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
      if(!this.USER()){
        return this.NeedLogin();
      }

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
          NotificationService.showLaravelError(error);
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
      if (this.workspace && (!this.workspace_can_write || this.workspace_busy || this.isNew)) return;
      const generation = this._workspaceGeneration, sourceArticle = this.article;
      NotificationService.openDangerAlert(
        this.$t("global.article.alert.delete_article.title"),
        this.$t("global.article.alert.delete_article.message"),
        this.$t("global.article.alert.delete_article.action"),
        () => {
          if (this.workspace && (generation !== this._workspaceGeneration || sourceArticle !== this.article)) return;
          this.deleteArticle();
        },
      );
    },

    deleteArticle() {
      if (this.workspace && (!this.workspace_can_write || this.workspace_busy || this.isNew)) return;
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
            NotificationService.showErrorAlert(
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
          NotificationService.showLaravelError(e);
        });
    },
    //――――――――――――――――― Fix body structure ―――――――――――――――――

    autoFixArticle() {
      if (this.workspace && (!this.workspace_can_write || this.workspace_busy)) return;
      const generation = this._workspaceGeneration, sourceArticle = this.article;
      if (this.workspace && this.$refs.editorContainer) this.article.body = this.$refs.editorContainer.purifyBody();
      if (this.workspace && !this.article.body?.trim()) return;
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
          if (this.workspace && (generation !== this._workspaceGeneration || sourceArticle !== this.article || !this.workspace_can_write)) return;
          if (data.error) {
            // Error!
            NotificationService.showErrorAlert(null, data.error_msg);

            return;
          }
          this.article.body = data.body;
          this.onChangeNote();
        })
        .catch((e) => {
          if (this.workspace && (generation !== this._workspaceGeneration || sourceArticle !== this.article)) return;
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          if (this.workspace && (generation !== this._workspaceGeneration || sourceArticle !== this.article)) return;
          this.busy_fix = false;
        });
    },

    getArticlePageTo(target) {
      const target_id = target.id;
      if (this.articleType === Article.Types.SelldoneBlog.code) {
        return {
          name: "BlogSlug",
          params: { blog_id: target_id, slug: target.article.slug },
        };
      } else if (this.articleType === Article.Types.SelldoneHelp.code) {
        return { name: "OPageHelp", params: { help_id: target_id } };
      } else if (this.articleType === Article.Types.Product.code) {
      } else if (this.is_shop_blog) {
        return {
          name: window.$storefront.routes.SHOP_BLOG_PAGE,
          params: { blog_id: target_id },
        };
      } else if (this.articleType === Article.Types.Company.code) {
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
        return NotificationService.showErrorAlert(null, "Save article first.");
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
            delay(
              () => {
                this.autoGenerate(false);
              },
              data.retry_ms ? data.retry_ms : 2 * 60000,
            );
            return;
          }

          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.article.title = data.title;
            this.article.body = data.body;

            this.state = "changed";

            NotificationService.showSuccessAlert(
              "Write completed",
              "Article successfully auto created and loaded.",
            );
          }
        })
        .catch((error) => {
          if (retry) {
            // Retry after 2 minutes
            delay(() => {
              this.autoGenerate(false);
            }, 2 * 60000);
          } else {
            NotificationService.showLaravelError(error);
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
.s-article-workspace {
  width: 100%;
  max-width: 1040px;
  margin-inline: auto;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;

  > .article-container { max-width: none; margin: 0; padding: 0; background: transparent; font-size: inherit; line-height: inherit; }
  .samin-article-widget {
    width: 100%; max-width: 780px; margin: 0 auto; padding: 0;
    background: transparent;
  }
  .s-article-workspace__editor { min-width: 0; padding: 36px !important; border: 1px solid rgba(var(--v-theme-on-surface), 0.1); border-radius: 18px; background: rgb(var(--v-theme-surface)); }
  .s-article-workspace__writing--details { max-width: none; display: grid; grid-template-columns: minmax(0, 1fr) 224px; gap: 20px; align-items: start; }
  .s-article-workspace__header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
  .s-article-workspace__header h1 { margin: 0; font-family: inherit; font-size: 18px; font-weight: 500; line-height: 25px; }
  .s-article-workspace__header p { margin: 4px 0 0; font-size: 12px; line-height: 19px; color: rgba(var(--v-theme-on-surface), 0.66); }
  .s-article-workspace__actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
  .s-article-workspace__metadata { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-block-end: 20px; font-size: 11px; font-weight: 400; line-height: 18px; }
  .s-article-workspace__metadata-fields { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; min-width: 0; max-width: 100%; margin: 0; padding: 0; }
  .s-article-workspace__metadata-fields > div { min-width: 0; max-width: 100%; }
  .s-article-workspace__metadata-fields dd { margin: 0; font: inherit; gap: 5px; overflow-wrap: anywhere; }
  .s-article-workspace__metadata-fields .sd-modern-status__dot { flex-basis: 5px; width: 5px; height: 5px; }
  .s-article-workspace__metadata-note { color: var(--sd-modern-muted); }
  .s-article-workspace__controls { max-width: 780px; margin: 0 auto 18px; }
  &.s-article-workspace--details .s-article-workspace__controls { max-width: none; }
  .s-article-workspace__command {
    --article-command-background: light-dark(#25252b, #37353f);
    --article-command-foreground: light-dark(#f7f7f9, #f9f9fb);
    --article-command-border: light-dark(#4c4b55, #625f6d);
    --article-command-hover: light-dark(#3b3a43, #4b4856);
    display: flex; align-items: center; flex-wrap: wrap; gap: 4px; padding: 6px;
    color: var(--article-command-foreground); background: var(--article-command-background);
    border: 1px solid var(--article-command-border); border-radius: 12px;
  }
  .s-article-workspace__command-button {
    min-width: 0; height: 32px; min-height: 32px; padding: 5px 9px;
    color: inherit !important; background: transparent !important; border: 1px solid transparent;
    border-radius: 7px; font-family: inherit; font-size: 12px !important; font-weight: 400;
    line-height: 18px; letter-spacing: 0; text-transform: none;
    :deep(.v-btn__content) { font: inherit; letter-spacing: inherit; }
    &:hover, &[aria-expanded="true"] { background: var(--article-command-hover) !important; }
    &[aria-expanded="true"] { border-color: var(--article-command-border); }
    &.sd-modern-icon-button { --sd-modern-icon-button-size: 32px; padding: 0; border-color: var(--article-command-border) !important; }
  }
  .s-article-workspace__command-separator { height: 20px; width: 1px; margin-inline: 5px; background: var(--article-command-border); }
  .s-article-workspace__word-icon { width: 16px; height: 16px; }
  .s-article-workspace__people { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding-top: 11px; }
  .s-article-workspace__author { display: flex; align-items: center; gap: 8px; min-width: 0; max-width: 100%; }
  .s-article-workspace__author-copy { min-width: 0; overflow-wrap: anywhere; font-size: 12px; font-weight: 500; line-height: 18px; }
  .s-article-workspace__author-copy small { display: block; color: rgba(var(--v-theme-on-surface), 0.66); font-size: 11px; font-weight: 400; line-height: 15px; }
  .s-article-workspace__schedule-control { margin-inline-start: auto; display: flex; align-items: center; gap: 8px; min-width: 0; }
  .s-article-workspace__schedule-copy { color: rgba(var(--v-theme-on-surface), 0.66); font-size: 12px; line-height: 19px; overflow-wrap: anywhere; }
  .s-article-workspace__details { display: grid; gap: 18px; min-width: 0; padding: 20px; border: 1px solid rgba(var(--v-theme-on-surface), 0.1); border-radius: 14px; background: rgb(var(--v-theme-surface)); }
  .s-article-workspace__details h2 { margin: 0; font-size: 13px !important; font-weight: 500; line-height: 20px; }
  .s-article-workspace__save-state { max-width: 780px; margin: 10px auto 0; font-size: 11px; color: rgba(var(--v-theme-on-surface), 0.62); text-align: end; }
  .s-article-workspace__analytics { padding: 26px; }
  .s-article-workspace__metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; margin: 0 0 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1); }
  .s-article-workspace__metrics dt { font-size: 12px; color: rgba(var(--v-theme-on-surface), 0.66); }
  .s-article-workspace__metrics dd { margin: 5px 0; font-size: 25px; line-height: 34px; font-variant-numeric: tabular-nums; }
  .s-article-workspace__metrics span { font-size: 11px; color: rgba(var(--v-theme-on-surface), 0.62); }
  .s-article-workspace__search-title { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 20px; }
  .s-article-workspace__search-title > img { flex-shrink: 0; margin-block-start: 2px; }
  .s-article-workspace__search-title h2 { margin: 0; font-size: 14px !important; font-weight: 500; line-height: 22px; }
  .s-article-workspace__search-title p { margin: 3px 0 0; font-size: 12px; font-weight: 400; line-height: 19px; color: var(--sd-modern-muted); }
  &.s-article-workspace--metadata {
    .s-article-workspace__header { margin-bottom: 24px; }
    .s-article-workspace__header h1 { line-height: 26px; }
    .s-article-workspace__actions .sd-modern-button { --v-btn-height: 36px; min-height: 36px; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; line-height: 20px; }
  }
  .s-article-workspace__seo-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 26px; align-items: start; }
  .s-article-workspace__previews { display: grid; gap: 24px; min-width: 0; }
  .s-article-workspace__previews h2 { margin: 0 0 12px; font-family: inherit; font-size: 14px !important; font-weight: 500; line-height: 22px; }
  .s-article-workspace__search-preview { padding: 22px; border: 1px solid var(--sd-modern-border); border-radius: 14px; background: rgb(var(--v-theme-surface)); overflow-wrap: anywhere; }
  .s-article-workspace__preview-site { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; }
  .s-article-workspace__site-mark { width: 28px; height: 28px; display: grid; place-items: center; flex-shrink: 0; border: 1px solid var(--sd-modern-border); border-radius: 50%; background: var(--sd-modern-inset); font-size: 12px; font-weight: 500; }
  .s-article-workspace__site-title { font-size: 12px; line-height: 18px; }
  .s-article-workspace__preview-url { color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; overflow-wrap: anywhere; }
  .s-article-workspace__search-preview h3 { color: rgb(var(--v-theme-primary)); font-family: inherit; font-size: 19px !important; font-weight: 400; line-height: 26px; margin: 0 0 8px; }
  .s-article-workspace__search-preview p { margin: 0; font-size: 12px; line-height: 19px; }
  .s-article-workspace__preview-help { margin: 7px 0 0; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  .s-article-workspace__sharing-preview { border: 1px solid var(--sd-modern-border); border-radius: 14px; background: rgb(var(--v-theme-surface)); overflow: hidden; }
  .s-article-workspace__sharing-image { height: 100px; background: var(--sd-modern-inset); display: flex; align-items: center; justify-content: center; color: var(--sd-modern-muted); }
  .s-article-workspace__sharing-image img { width: 100%; height: 100%; object-fit: cover; margin: 0; border-radius: 0; }
  .s-article-workspace__sharing-image span { display: inline-flex; align-items: center; gap: 10px; font-size: 12px; }
  .s-article-workspace__sharing-copy { padding: 16px; overflow-wrap: anywhere; }
  .s-article-workspace__sharing-copy h3 { margin: 5px 0; font-family: inherit; font-size: 13px !important; font-weight: 500; line-height: 20px; }
  .s-article-workspace__sharing-copy p { margin: 0; font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); }
  .s-article-workspace__seo-extra { margin-top: 24px; }
  .s-article-workspace__save-state--wide { max-width: none; margin-top: 12px; text-align: start; line-height: 18px; }
}
.s-article-workspace__menu { font-family: inherit; min-width: 230px; }
.s-article-workspace__menu :deep(.v-list-item-title) { font-size: 13px; font-weight: 400; line-height: 20px; }
.s-article-workspace__setting { width: 290px; max-width: calc(100vw - 32px); padding: 18px; border: 1px solid rgba(var(--v-theme-on-surface), 0.1); border-radius: 12px; }
.s-article-workspace__setting h2 { margin: 0 0 14px; font-family: inherit; font-size: 14px !important; font-weight: 500; line-height: 22px; }
.s-article-workspace__setting-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.s-article-workspace__schedule { padding: 12px; }
.s-article-workspace__schedule :deep(.v-card-title) { font: inherit; font-size: 18px; font-weight: 500; }
.s-article-workspace__schedule p { font-size: 12px; color: rgba(var(--v-theme-on-surface), 0.66); }
@media (max-width: 760px) {
  .s-article-workspace {
    .s-article-workspace__header { flex-wrap: wrap; align-items: start; }
    .s-article-workspace__seo-grid { grid-template-columns: minmax(0, 1fr); }
    .s-article-workspace__previews { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .s-article-workspace__writing--details { grid-template-columns: minmax(0, 1fr); }
    .s-article-workspace__editor { padding: 24px 20px !important; }
  }
}
@media (max-width: 540px) {
  .s-article-workspace {
    .s-article-workspace__schedule-control { margin-inline-start: 0; flex-wrap: wrap; width: 100%; }
    .s-article-workspace__details { grid-template-columns: minmax(0, 1fr); }
    .s-article-workspace__metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .s-article-workspace__analytics { padding: 20px 16px; }
    .s-article-workspace__previews { grid-template-columns: minmax(0, 1fr); }
  }
}
@media (max-width: 680px), (pointer: coarse) {
  .s-article-workspace .s-article-workspace__command-button { min-height: 44px; height: 44px; &.sd-modern-icon-button { --sd-modern-icon-button-size: 44px; } }
  .s-article-workspace .s-article-workspace__command :deep(.v-spacer) { display: none; }
  .s-article-workspace.s-article-workspace--metadata .s-article-workspace__actions .sd-modern-button { --v-btn-height: 44px; min-height: 44px; }
}
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
