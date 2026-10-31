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
    class="b-blog-categories-list s-table-loading text-start"
    :class="{ 'b-blog-categories-list--modern': modern }"
    :aria-busy="busy_fetch"
  >
    <!-- ████████████████████████ List ████████████████████████ -->
    <u-loading-progress v-if="busy_fetch" />
    <div class="b-blog-categories-list__tools">
      <v-text-field
        v-model="search"
        :placeholder="$t('blog_category.modern.search')"
        :aria-label="$t('blog_category.modern.search')"
        class="b-blog-categories-list__search"
        clearable
        hide-details
        prepend-inner-icon="search"
        single-line
        variant="plain"
      />
    </div>
    <div
      v-if="modern && $vuetify.display.width <= 760"
      class="b-blog-categories-list__mobile-sort"
    >
      <span>{{ $t("global.commons.sort_by") }}</span>
      <v-select
        :model-value="sortBy[0]?.key || 'category'"
        :items="sortOptions"
        :aria-label="$t('global.commons.sort_by')"
        variant="plain"
        hide-details
        single-line
        :menu-props="{ contentClass: 'sd-modern-select-menu text-start' }"
        @update:model-value="setSort($event)"
      />
      <v-btn
        class="sd-modern-icon-button b-blog-categories-list__icon-button"
        icon
        variant="text"
        :aria-label="$t('global.commons.sort_by')"
        @click="setSort(sortBy[0]?.key || 'category')"
        ><v-icon
          :icon="sortBy[0]?.order === 'asc' ? 'arrow_upward' : 'arrow_downward'"
          size="15"
          aria-hidden="true"
        /><v-tooltip
          activator="parent"
          content-class="sd-modern-tooltip text-start"
          location="top"
          :open-on-focus="true"
          >{{ $t("global.commons.sort_by") }}</v-tooltip
        ></v-btn
      >
    </div>
    <div
      v-if="fetch_error"
      class="sd-modern-notice b-blog-categories-list__error"
      role="alert"
    >
      <v-icon icon="error_outline" size="18" aria-hidden="true" /><span>{{
        $t("blog_category.modern.load_error")
      }}</span
      ><v-btn
        class="sd-modern-button sd-modern-button--inline"
        variant="text"
        @click="refreshCategories(true)"
        >{{ $t("global.actions.refresh") }}</v-btn
      >
    </div>
    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      class="b-blog-categories-list__table"
      :class="{ 'sd-modern-data-table': modern, disabled: busy_fetch }"
      :headers="headers"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :items="fetch_error ? [] : categories"
      :items-length="totalItems"
      :loading="busy_fetch"
      :must-sort="modern"
      :mobile="modern ? $vuetify.display.width <= 760 : $vuetify.display.xs"
      :hide-default-header="modern && $vuetify.display.width <= 760"
      :row-props="() => ({ class: canWrite ? 'row-hover' : '' })"
      density="compact"
      item-value="id"
      hide-default-footer
      @click:row="(_, row) => showAddBlogCategoryDialog(row.item)"
    >
      <template #no-data
        ><div
          v-if="!busy_fetch && !fetch_error"
          class="sd-modern-empty-state b-blog-categories-list__empty"
        >
          <v-icon
            :icon="search ? 'search_off' : 'folder_open'"
            size="25"
            aria-hidden="true"
          />
          <h2>
            {{
              $t(
                search
                  ? "blog_category.modern.no_results"
                  : "blog_category.modern.empty_title",
              )
            }}
          </h2>
          <p>
            {{
              $t(
                search
                  ? "blog_category.modern.no_results_description"
                  : "blog_category.modern.empty_description",
              )
            }}
          </p>
          <v-btn
            v-if="search"
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            @click="search = ''"
            >{{ $t("blog_category.modern.clear_search") }}</v-btn
          >
        </div></template
      >
      <template #item.icon="{ item }"
        ><u-avatar-folder
          :src="item.icon ? getShopImagePath(item.icon) : undefined"
          class="my-1"
          is-amber
          side-icon="devices_fold"
          elevated
      /></template>
      <template #item.category="{ item }">
        <div class="b-blog-categories-list__identity">
          <span
            v-if="modern"
            class="b-blog-categories-list__cover"
            aria-hidden="true"
            ><v-img
              v-if="item.icon"
              class="hover-scale force-top"
              :src="getShopImagePath(item.icon, 128)"
              width="100%"
              height="100%"
              cover
              alt="" /><v-icon v-else icon="folder_open" size="20"
          /></span>
          <div class="b-blog-categories-list__copy">
            <button
              type="button"
              class="b-blog-categories-list__name"
              :data-category-edit="item.id"
              :disabled="!canWrite"
              @click.stop="showAddBlogCategoryDialog(item)"
            >
              {{ item.category }}</button
            ><span class="b-blog-categories-list__description">{{
              item.description
            }}</span>
          </div>
        </div>
      </template>
      <template #item.star="{ item }"
        ><span
          v-if="item.star"
          class="sd-modern-status sd-modern-status--plain b-blog-categories-list__featured"
          ><v-icon icon="star_border" size="12" aria-hidden="true" />{{
            $t("blog_category.modern.featured")
          }}</span
        ><span
          v-else
          class="b-blog-categories-list__zero"
          :aria-label="$t('blog_category.modern.not_featured')"
          >—</span
        ></template
      >
      <template #item.visits="{ item }"
        ><span :class="{ 'b-blog-categories-list__zero': !item.visits }">{{
          $n(item.visits || 0)
        }}</span></template
      >
      <template #item.articles="{ item }"
        ><span :class="{ 'b-blog-categories-list__zero': !item.articles }">{{
          $n(item.articles || 0)
        }}</span></template
      >
      <template #item.delete="{ item }"
        ><div v-if="canWrite" class="b-blog-categories-list__actions">
          <v-tooltip
            :text="$t('blog_category.modern.edit_action')"
            content-class="sd-modern-tooltip text-start"
            location="top"
            :open-on-focus="true"
            ><template #activator="{ props }"
              ><v-btn
                v-bind="props"
                icon
                variant="text"
                class="sd-modern-icon-button b-blog-categories-list__icon-button"
                :aria-label="$t('blog_category.modern.edit_action')"
                @click.stop="showAddBlogCategoryDialog(item)"
                ><v-icon
                  icon="edit"
                  size="15"
                  aria-hidden="true" /></v-btn></template
          ></v-tooltip>
          <v-tooltip
            :text="$t('blog_category.modern.delete_action')"
            content-class="sd-modern-tooltip text-start"
            location="top"
            :open-on-focus="true"
            ><template #activator="{ props }"
              ><v-btn
                v-bind="props"
                :loading="busy_del === item.id"
                :disabled="busy_del !== null && busy_del !== item.id"
                icon
                variant="text"
                class="sd-modern-icon-button b-blog-categories-list__icon-button b-blog-categories-list__remove"
                :aria-label="$t('blog_category.modern.delete_action')"
                @click.stop="deleteCategory(item)"
                ><v-icon
                  icon="delete_outline"
                  size="15"
                  aria-hidden="true" /></v-btn></template
          ></v-tooltip></div
      ></template>
      <template #bottom
        ><div
          v-if="!fetch_error && (!busy_fetch || totalItems > 0)"
          class="sd-modern-table-footer b-blog-categories-list__footer"
        >
          <p aria-live="polite">
            {{
              $t("blog_category.modern.page_range", {
                start: totalItems ? (page - 1) * itemsPerPage + 1 : 0,
                end: Math.min(page * itemsPerPage, totalItems),
                total: totalItems,
              })
            }}
          </p>
          <v-pagination
            v-if="pageCount > 1"
            v-model="page"
            :length="pageCount"
            :total-visible="$vuetify.display.width < 400 ? 2 : 5"
            :class="{ 'sd-modern-pagination': modern }"
          /></div
      ></template>
    </v-data-table-server>

    <!-- ████████████████████████ Add / edit Dialog ████████████████████████ -->
    <v-dialog
      v-model="dialog_add"
      :persistent="busy_set || busy_upload"
      :fullscreen="!modern"
      :max-width="modern ? 680 : undefined"
      :class="{ 'b-blog-category-dialog': modern }"
      scrollable
      @update:model-value="!$event && closeEditor()"
      @after-leave="restoreFocus"
    >
      <v-card
        v-if="dialog_pre"
        class="b-blog-category-editor b-blog-category-editor--form text-start"
        :class="{ 'b-blog-category-editor--modern sd-modern-widget': modern }"
      >
        <header class="b-blog-category-editor__header">
          <v-icon icon="create_new_folder" size="22" aria-hidden="true" />
          <div>
            <h2>
              {{
                $t(
                  selected
                    ? "blog_category.modern.edit_title"
                    : "blog_category.modern.add_title",
                )
              }}
            </h2>
            <p>{{ $t("blog_category.modern.editor_subtitle") }}</p>
          </div>
          <v-tooltip
            :text="
              $t(
                busy_upload && saved_category
                  ? 'blog_category.modern.cancel_upload'
                  : 'global.actions.close',
              )
            "
            content-class="sd-modern-tooltip text-start"
            location="top"
            :open-on-focus="true"
            ><template #activator="{ props }"
              ><v-btn
                v-bind="props"
                :disabled="(busy_set || busy_upload) && !saved_category"
                class="sd-modern-icon-button b-blog-category-editor__icon-button"
                icon
                variant="text"
                :aria-label="
                  $t(
                    busy_upload && saved_category
                      ? 'blog_category.modern.cancel_upload'
                      : 'global.actions.close',
                  )
                "
                @click="closeEditor"
                ><v-icon
                  icon="close"
                  size="15"
                  aria-hidden="true" /></v-btn></template
          ></v-tooltip>
        </header>
        <v-card-text class="b-blog-category-editor__body">
          <v-form ref="editorForm" @submit.prevent="addCategory">
            <div class="b-blog-category-editor__details">
              <section class="b-blog-category-editor__fields">
                <template v-if="modern">
                  <div class="b-blog-category-editor__section-heading">
                    <h3>{{ $t("blog_category.modern.details_title") }}</h3>
                    <v-tooltip
                      v-model="details_help"
                      location="top"
                      content-class="sd-modern-tooltip text-start"
                      :open-on-click="true"
                    >
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          class="sd-modern-icon-button sd-modern-info-button b-blog-category-editor__info"
                          icon
                          variant="text"
                          :aria-label="$t('blog_category.modern.details_help')"
                        >
                          <v-icon
                            icon="info_outline"
                            size="14"
                            aria-hidden="true"
                          />
                        </v-btn>
                      </template>
                      {{ $t("blog_category.modern.details_help") }}
                    </v-tooltip>
                  </div>
                  <p class="b-blog-category-editor__section-description">
                    {{ $t("blog_category.modern.details_hint") }}
                  </p>
                </template>
                <div class="b-blog-category-editor__field">
                  <label
                    for="blog-category-name"
                    class="b-blog-category-editor__label"
                    >{{ $t("blog_category.modern.name") }}
                    <span aria-hidden="true">*</span></label
                  >
                  <div
                    class="b-blog-category-editor__name-row"
                    :class="{
                      'b-blog-category-editor__name-row--locked':
                        selected && !force_edit,
                    }"
                  >
                    <v-text-field
                      id="blog-category-name"
                      ref="categoryName"
                      v-model="category"
                      :class="{ 'sd-modern-underlined-field': modern }"
                      :autofocus="!selected"
                      :readonly="!!selected && !force_edit"
                      :disabled="!canWrite || busy_set || !!saved_category"
                      :rules="[GlobalRules.required()]"
                      :placeholder="$t('blog_category.modern.name_placeholder')"
                      :aria-label="$t('blog_category.modern.name')"
                      required
                      variant="underlined"
                      :hide-details="modern ? 'auto' : false"
                      :messages="
                        selected && !force_edit
                          ? $t('blog_category.modern.locked_hint')
                          : modern
                            ? []
                            : ' '
                      "
                    >
                      <template
                        v-if="!selected && !modern"
                        #message="{ message }"
                      >
                        <span v-if="message?.trim()">{{ message }}</span>
                        <u-smart-suggestion
                          v-if="
                            canWrite &&
                            !busy_set &&
                            !saved_category &&
                            (modern || !message?.trim())
                          "
                          :modern="modern"
                          :more-label="
                            $t('blog_category.modern.more_suggestions')
                          "
                          :samples="$tm('suggestions.blog_category.category')"
                          @select="category = $event"
                      /></template>
                    </v-text-field>
                    <v-tooltip
                      v-if="selected"
                      :text="
                        $t(
                          force_edit
                            ? 'blog_category.modern.lock'
                            : 'blog_category.modern.unlock',
                        )
                      "
                      content-class="sd-modern-tooltip text-start"
                      location="top"
                      :open-on-focus="true"
                      ><template #activator="{ props }"
                        ><v-btn
                          v-bind="props"
                          :disabled="!canWrite || busy_set"
                          class="sd-modern-icon-button b-blog-category-editor__icon-button"
                          icon
                          variant="text"
                          :aria-label="
                            $t(
                              force_edit
                                ? 'blog_category.modern.lock'
                                : 'blog_category.modern.unlock',
                            )
                          "
                          @click="toggleNameLock"
                          ><v-icon
                            :icon="force_edit ? 'lock_open' : 'lock_outline'"
                            size="15"
                            aria-hidden="true" /></v-btn></template
                    ></v-tooltip>
                  </div>
                  <u-smart-suggestion
                    v-if="
                      modern &&
                      !selected &&
                      canWrite &&
                      !busy_set &&
                      !saved_category
                    "
                    modern
                    :more-label="$t('blog_category.modern.more_suggestions')"
                    :samples="$tm('suggestions.blog_category.category')"
                    @select="category = $event"
                  />
                </div>
                <div
                  v-if="selected && force_edit"
                  class="sd-modern-notice b-blog-category-editor__rename"
                  role="status"
                >
                  <v-icon
                    icon="warning_amber"
                    size="16"
                    class="text-warning"
                    aria-hidden="true"
                  />
                  <div>
                    <strong>{{
                      $t("blog_category.modern.rename_title")
                    }}</strong>
                    <p>{{ $t("blog_category.modern.rename_hint") }}</p>
                  </div>
                </div>
                <div class="b-blog-category-editor__field">
                  <label
                    for="blog-category-description"
                    class="b-blog-category-editor__label"
                    >{{ $t("blog_category.modern.description") }}
                    <span aria-hidden="true">*</span></label
                  >
                  <v-textarea
                    id="blog-category-description"
                    v-model="description"
                    :class="{ 'sd-modern-underlined-field': modern }"
                    :disabled="!canWrite || busy_set || !!saved_category"
                    :rules="[GlobalRules.required()]"
                    :placeholder="
                      $t('blog_category.modern.description_placeholder')
                    "
                    :aria-label="$t('blog_category.modern.description')"
                    required
                    variant="underlined"
                    rows="2"
                    auto-grow
                    :hide-details="modern ? 'auto' : false"
                    :messages="modern ? [] : ' '"
                  >
                    <template
                      v-if="!selected && !modern"
                      #message="{ message }"
                    >
                      <span v-if="message?.trim()">{{ message }}</span>
                      <u-smart-suggestion
                        v-if="
                          canWrite &&
                          !busy_set &&
                          !saved_category &&
                          (modern || !message?.trim())
                        "
                        :modern="modern"
                        :preview-count="2"
                        :more-label="
                          $t('blog_category.modern.more_suggestions')
                        "
                        :samples="$tm('suggestions.blog_category.description')"
                        @select="description = $event"
                    /></template>
                  </v-textarea>
                  <u-smart-suggestion
                    v-if="
                      modern &&
                      !selected &&
                      canWrite &&
                      !busy_set &&
                      !saved_category
                    "
                    modern
                    :preview-count="2"
                    :more-label="$t('blog_category.modern.more_suggestions')"
                    :samples="$tm('suggestions.blog_category.description')"
                    @select="description = $event"
                  />
                </div>
              </section>
              <section class="b-blog-category-editor__cover">
                <p v-if="!modern" class="b-blog-category-editor__cover-intro">
                  <span>{{ $t("blog_category.modern.optional") }}</span>
                  {{
                    $t(
                      selected
                        ? "blog_category.modern.cover_hint"
                        : "blog_category.modern.create_cover_hint",
                    )
                  }}
                </p>
                <s-image-uploader
                  :key="editor_version"
                  ref="coverUploader"
                  :image="
                    selected?.icon ? getShopImagePath(selected.icon) : null
                  "
                  :server="coverServer"
                  :disabled="!canWrite || busy_set"
                  :thumbnail="modern"
                  :choose-label="$t('blog_category.modern.choose_image')"
                  :edit-label="$t('blog_category.modern.edit_image')"
                  :remove-label="$t('blog_category.modern.remove_image')"
                  :hint="
                    modern ? $t('blog_category.modern.image_hint') : undefined
                  "
                  :auto-compact="!!selected"
                  :defer-upload="!selected"
                  dense
                  min-height="140px"
                  :label="
                    $t(
                      modern
                        ? 'blog_category.modern.image_title'
                        : 'blog_category.modern.cover',
                    )
                  "
                  max-file-size="2MB"
                  class="b-blog-category-editor__uploader"
                  v-on="coverHandlers"
                >
                  <template v-if="modern" #thumbnail-heading>
                    <div class="b-blog-category-editor__image-heading">
                      <h3>{{ $t("blog_category.modern.image_title") }}</h3>
                      <span>{{ $t("blog_category.modern.optional") }}</span>
                    </div>
                  </template>
                  <template v-if="modern" #compact-action="{ edit }">
                    <v-btn
                      class="sd-modern-icon-button b-blog-category-editor__icon-button"
                      icon
                      variant="text"
                      :aria-label="$t('blog_category.modern.edit_image')"
                      @click="edit"
                    >
                      <v-icon icon="edit" size="16" aria-hidden="true" />
                      <v-tooltip
                        activator="parent"
                        location="top"
                        :open-on-focus="true"
                        content-class="sd-modern-tooltip text-start"
                        >{{ $t("blog_category.modern.edit_image") }}</v-tooltip
                      >
                    </v-btn>
                  </template>
                </s-image-uploader>
              </section>
            </div>
            <section class="b-blog-category-editor__visibility">
              <template v-if="modern">
                <h3>{{ $t("blog_category.modern.visibility_title") }}</h3>
                <p class="b-blog-category-editor__section-description">
                  {{ $t("blog_category.modern.visibility_hint") }}
                </p>
              </template>
              <div class="b-blog-category-editor__featured-row">
                <u-smart-toggle
                  v-model="star"
                  :disabled="!canWrite || busy_set || !!saved_category"
                  :readonly="!canWrite || busy_set || !!saved_category"
                  :true-title="$t('blog_category.modern.featured_title')"
                  :false-title="$t('blog_category.modern.featured_title')"
                  :true-description="$t('blog_category.modern.featured_hint')"
                  :false-description="
                    $t(
                      modern
                        ? 'blog_category.modern.featured_off_hint'
                        : 'blog_category.modern.featured_hint',
                    )
                  "
                  class="b-blog-category-editor__featured"
                  :role="modern ? 'switch' : 'checkbox'"
                  :aria-label="$t('blog_category.modern.featured_title')"
                  :aria-checked="!!star"
                  :aria-disabled="!canWrite || busy_set || !!saved_category"
                  :tabindex="canWrite && !busy_set && !saved_category ? 0 : -1"
                  color="primary"
                  :false-icon="modern ? undefined : 'star_border'"
                  :true-icon="modern ? undefined : 'auto_awesome'"
                  @keydown.space.prevent="toggleFeatured"
                  @keydown.enter.prevent="toggleFeatured"
                />
                <span
                  v-if="modern"
                  class="b-blog-category-editor__state"
                  aria-hidden="true"
                  >{{
                    $t(
                      star
                        ? "blog_category.modern.featured_on"
                        : "blog_category.modern.featured_off",
                    )
                  }}</span
                >
              </div>
            </section>
          </v-form>
          <div
            v-if="saved_category && !busy_upload"
            class="sd-modern-notice b-blog-category-editor__saved"
            role="status"
          >
            <v-icon icon="info_outline" size="17" aria-hidden="true" />
            <p>{{ $t("blog_category.modern.saved_cover_hint") }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="b-blog-category-editor__actions"
          ><v-btn
            :disabled="(busy_set || busy_upload) && !saved_category"
            class="sd-modern-button b-blog-category-editor__button"
            :variant="modern ? 'text' : 'outlined'"
            @click="closeEditor"
            >{{
              $t(
                busy_upload && saved_category
                  ? "blog_category.modern.cancel_upload"
                  : modern
                    ? "global.actions.cancel"
                    : "global.actions.close",
              )
            }}</v-btn
          ><v-btn
            :disabled="!canSave"
            :loading="busy_set"
            class="sd-modern-button b-blog-category-editor__button"
            color="primary"
            variant="flat"
            @click="addCategory"
            ><v-icon
              v-if="modern && !selected && !saved_category"
              icon="add"
              size="15"
              aria-hidden="true"
            />{{
              $t(
                saved_category
                  ? image_state === "empty"
                    ? "blog_category.modern.finish"
                    : "blog_category.modern.retry_image"
                  : selected
                    ? "blog_category.modern.save"
                    : "blog_category.modern.add_action",
              )
            }}</v-btn
          ></v-card-actions
        >
      </v-card>
    </v-dialog>

    <!-- ████████████████████████ Delete confirmation ████████████████████████ -->
    <v-dialog
      v-model="dialog_delete"
      :persistent="busy_del !== null"
      max-width="440"
      class="b-blog-category-dialog"
      @after-leave="restoreFocus"
    >
      <v-card
        class="b-blog-category-editor b-blog-category-editor--modern sd-modern-widget text-start"
      >
        <header class="b-blog-category-editor__header">
          <v-icon
            icon="delete_outline"
            size="20"
            class="text-error"
            aria-hidden="true"
          />
          <div>
            <h2>{{ $t("blog_category.modern.delete_title") }}</h2>
          </div>
          <v-btn
            :disabled="busy_del !== null"
            class="sd-modern-icon-button b-blog-category-editor__icon-button"
            icon
            variant="text"
            :aria-label="$t('global.actions.close')"
            @click="dialog_delete = false"
            ><v-icon icon="close" size="15" aria-hidden="true" /><v-tooltip
              activator="parent"
              content-class="sd-modern-tooltip text-start"
              location="top"
              :open-on-focus="true"
              >{{ $t("global.actions.close") }}</v-tooltip
            ></v-btn
          >
        </header>
        <v-card-text class="b-blog-category-editor__body"
          ><p>
            {{
              $t("blog_category.modern.delete_message", {
                category: delete_target?.category || "",
              })
            }}
          </p></v-card-text
        >
        <v-card-actions class="b-blog-category-editor__actions"
          ><v-btn
            :disabled="busy_del !== null"
            class="sd-modern-button b-blog-category-editor__button"
            variant="outlined"
            @click="dialog_delete = false"
            >{{ $t("global.actions.cancel") }}</v-btn
          ><v-btn
            :loading="busy_del !== null"
            :disabled="!canWrite"
            class="sd-modern-button b-blog-category-editor__button"
            variant="outlined"
            @click="removeCategory()"
            ><v-icon
              icon="delete_outline"
              class="text-error"
              size="15"
              aria-hidden="true"
            />{{ $t("blog_category.modern.delete_action") }}</v-btn
          ></v-card-actions
        >
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import threads from "@selldone/core-js/utils/thread/threads";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";
import SImageUploader from "../../../../ui/uploader/SImageUploader.vue";
import UAvatarFolder from "../../../../ui/avatar/folder/UAvatarFolder.vue";

export default {
  name: "BBlogCategoriesList",
  components: { UAvatarFolder, SImageUploader, USmartSuggestion, USmartToggle },
  props: {
    shop: { required: true },
    modern: { type: Boolean, default: false },
  },
  data: () => ({
    dialog_add: false,
    dialog_pre: false,
    details_help: false,
    dialog_delete: false,
    busy_set: false,
    busy_upload: false,
    busy_del: null,
    categories: [],
    busy_fetch: false,
    fetch_error: false,
    request_id: 0,
    editor_version: 0,
    scope_version: 0,
    force_edit: false,
    selected: null,
    saved_category: null,
    pending_image_id: null,
    image_state: "empty",
    delete_target: null,
    category: "",
    description: "",
    star: false,
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},
    sortBy: [],
    search: "",
    focus_return: null,
    focus_category_id: null,
  }),
  computed: {
    canWrite() {
      return this.writeShopAccess(ShopPermissionRegions.BLOG.code);
    },
    canSave() {
      return (
        this.canWrite &&
        !this.busy_set &&
        !this.busy_upload &&
        (this.image_state === "empty" || this.image_state === "ready") &&
        !!this.category?.trim() &&
        !!this.description?.trim()
      );
    },
    coverServer() {
      const category = this.selected || this.saved_category;
      return category
        ? window.API.POST_UPLOAD_SHOP_BLOG_CATEGORY_ICON(
            this.shop.id,
            category.id,
          )
        : undefined;
    },
    coverHandlers() {
      const shopId = this.shop.id,
        version = this.editor_version;
      const current = () =>
        this.dialog_add &&
        shopId === this.shop.id &&
        version === this.editor_version;
      return {
        onAddFileStart: (file) => {
          if (!current() || this.selected) return;
          this.pending_image_id = file.id;
          this.image_state = "loading";
        },
        onAddFile: ({ error, file }) => {
          if (!current() || this.selected || file.id !== this.pending_image_id)
            return;
          this.image_state = error ? "invalid" : "ready";
        },
        onRemoveFile: ({ error, file }) => {
          if (
            error ||
            !current() ||
            this.selected ||
            file.id !== this.pending_image_id
          )
            return;
          this.pending_image_id = null;
          this.image_state = "empty";
        },
        "new-path": (path) => {
          if (current()) this.updateCover(path);
        },
        onProcessFileStart: () => {
          if (current() && this.selected) this.busy_upload = true;
        },
        onProcessFileAbort: () => {
          if (current() && this.selected) this.busy_upload = false;
        },
        onError: () => {
          if (current() && this.selected) this.busy_upload = false;
        },
        response: () => {
          if (current() && this.selected) this.busy_upload = false;
        },
      };
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    sortOptions() {
      return [
        { title: this.$t("global.commons.category"), value: "category" },
        { title: this.$t("blog_category.modern.featured"), value: "star" },
        { title: this.$t("global.commons.visits"), value: "visits" },
        { title: this.$t("global.commons.articles"), value: "articles" },
      ];
    },
    headers() {
      return [
        ...(!this.modern
          ? [{ title: "", key: "icon", width: 100, sortable: false }]
          : []),
        {
          title: this.$t("global.commons.category"),
          key: "category",
          align: "start",
          sortable: true,
          width: this.modern ? "52%" : undefined,
        },
        {
          title: this.$t("blog_category.modern.featured"),
          key: "star",
          align: "start",
          sortable: true,
          width: this.modern ? "14%" : undefined,
        },
        {
          title: this.$t("global.commons.visits"),
          key: "visits",
          align: "end",
          sortable: true,
          width: this.modern ? "10%" : undefined,
        },
        {
          title: this.$t("global.commons.articles"),
          key: "articles",
          align: "end",
          sortable: true,
          width: this.modern ? "10%" : undefined,
        },
        {
          title: "",
          key: "delete",
          align: "end",
          sortable: false,
          width: this.modern ? "14%" : undefined,
        },
      ];
    },
  },
  watch: {
    options: {
      handler() {
        this.refreshCategories();
      },
      deep: true,
    },
    search: threads.debounceSearch(function () {
      this.page = 1;
      this.refreshCategories();
    }),
    "shop.id"() {
      this.request_id++;
      this.editor_version++;
      this.scope_version++;
      this.dialog_add = false;
      this.dialog_delete = false;
      this.selected = null;
      this.saved_category = null;
      this.pending_image_id = null;
      this.image_state = "empty";
      this.delete_target = null;
      this.categories = [];
      this.totalItems = 0;
      this.busy_set = false;
      this.busy_upload = false;
      this.busy_del = null;
      this.page = 1;
      this.refreshCategories();
    },
  },
  created() {
    if (this.modern) this.sortBy = [{ key: "category", order: "asc" }];
  },
  beforeUnmount() {
    this.request_id++;
    this.editor_version++;
    this.scope_version++;
  },
  methods: {
    /**
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * 🛑 DO NOT CHANGE IT!
     * This function is called externally.
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * @param selected
     */
    showAddBlogCategoryDialog(selected = null) {
      if (!this.canWrite || this.busy_set || this.busy_upload) return;
      const version = ++this.editor_version;
      const shopId = this.shop.id;
      this.focus_return = document.activeElement;
      this.focus_category_id = selected?.id || null;
      this.selected = selected;
      this.details_help = false;
      this.saved_category = null;
      this.pending_image_id = null;
      this.image_state = "empty";
      this.force_edit = false;
      this.category = selected ? selected.category : "";
      this.description = selected ? selected.description : "";
      this.star = selected ? selected.star : true;
      this.dialog_pre = false;
      this.$nextTick(() => {
        if (version !== this.editor_version || shopId !== this.shop.id) return;
        this.dialog_pre = true;
        this.$nextTick(() => {
          if (version !== this.editor_version || shopId !== this.shop.id)
            return;
          this.dialog_add = true;
        });
      });
    },
    closeEditor() {
      if ((this.busy_set || this.busy_upload) && !this.saved_category) return;
      const saved = !!this.saved_category;
      this.editor_version++;
      // Removing/unmounting the local queue also cancels a transform that has not started its request.
      if (saved) this.$refs.coverUploader?.discardPendingFile();
      this.dialog_add = false;
      this.dialog_pre = false;
      this.busy_set = false;
      this.busy_upload = false;
      if (saved) this.refreshCategories(true);
    },
    restoreFocus() {
      this.$nextTick(() => {
        const target =
          (this.focus_return?.isConnected
            ? this.focus_return
            : this.$el.querySelector(
                '[data-category-edit="' + this.focus_category_id + '"]',
              )) ||
          this.$el.querySelector(".b-blog-categories-list__search input");
        target?.focus();
      });
    },
    toggleNameLock() {
      if (!this.canWrite || this.busy_set) return;
      this.force_edit = !this.force_edit;
      if (!this.force_edit && this.selected)
        this.category = this.selected.category;
    },
    toggleFeatured() {
      if (this.canWrite && !this.busy_set && !this.saved_category)
        this.star = !this.star;
    },
    setSort(key) {
      this.page = 1;
      this.sortBy = [
        {
          key,
          order:
            this.sortBy[0]?.key === key
              ? this.sortBy[0]?.order === "asc"
                ? "desc"
                : "asc"
              : key === "category"
                ? "asc"
                : "desc",
        },
      ];
    },
    refreshCategories(force = false) {
      const sort = this.sortBy[0];
      return this.fetchCategories(this.page, sort?.key, sort?.order, force);
    },
    fetchCategories(
      page,
      sortBy,
      sortDesc: boolean | string = true,
      force = false,
    ) {
      const request = ++this.request_id;
      this.busy_fetch = true;
      this.fetch_error = false;
      const api = window.$backoffice.blog.categories
        .optimize(60)
        .cancellation(true);
      if (force) api.force();
      return api
        .list(this.shop.id, (page - 1) * this.itemsPerPage, this.itemsPerPage, {
          search: this.search,
          sortBy,
          sortDesc: sortDesc === true || sortDesc === "desc",
        })
        .then(({ total, categories }) => {
          if (request !== this.request_id) return;
          this.categories = categories;
          this.totalItems = total;
        })
        .catch((error) => {
          if (request !== this.request_id) return;
          this.fetch_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (request === this.request_id) this.busy_fetch = false;
        });
    },
    async addCategory() {
      if (!this.canSave || !this.dialog_add) return;
      const shopId = this.shop.id,
        selected = this.selected;
      const version = this.editor_version;
      const { valid } = this.saved_category
        ? { valid: true }
        : await this.$refs.editorForm.validate();
      if (
        !valid ||
        !this.canSave ||
        !this.dialog_add ||
        shopId !== this.shop.id ||
        selected !== this.selected ||
        version !== this.editor_version
      )
        return;
      this.busy_set = true;
      try {
        if (!this.saved_category) {
          const pack = {
            category:
              selected && !this.force_edit ? selected.category : this.category,
            description: this.description,
            star: this.star,
          };
          // Locked edits use the existing name-based upsert; only an unlocked rename uses PUT.
          const result = await (selected && this.force_edit
            ? window.$backoffice.blog.categories.edit(shopId, selected.id, pack)
            : window.$backoffice.blog.categories.add(shopId, pack));
          if (shopId !== this.shop.id || version !== this.editor_version)
            return;
          if (!selected) this.saved_category = result.category;
        }
        if (!selected && this.image_state === "ready") {
          this.busy_upload = true;
          // Keep this pond instance while the returned category ID supplies its existing upload URL.
          await this.$nextTick();
          if (
            !this.canWrite ||
            !this.dialog_add ||
            shopId !== this.shop.id ||
            version !== this.editor_version
          )
            return;
          const image = await this.$refs.coverUploader.processPendingFile();
          if (shopId !== this.shop.id || version !== this.editor_version)
            return;
          this.saved_category.icon = image.path;
        }
        this.dialog_add = false;
        this.dialog_pre = false;
        NotificationService.showSuccessAlert(
          null,
          this.$t(
            selected
              ? "blog_category.modern.updated"
              : "blog_category.modern.added",
          ),
        );
        // POST may upsert an existing name; never increment totals or delete it on an image failure.
        await this.refreshCategories(true);
      } catch (error) {
        if (shopId === this.shop.id && version === this.editor_version) {
          if (this.saved_category) this.refreshCategories(true);
          else NotificationService.showLaravelError(error);
        }
      } finally {
        if (shopId === this.shop.id && version === this.editor_version) {
          this.busy_set = false;
          this.busy_upload = false;
        }
      }
    },
    updateCover(path) {
      this.busy_upload = false;
      if (!this.selected || !this.canWrite) return;
      this.selected.icon = path;
      const row = this.categories.find(
        (category) => category.id === this.selected.id,
      );
      if (row) row.icon = path;
    },
    deleteCategory(category) {
      if (!this.canWrite || this.busy_del !== null) return;
      this.focus_return = document.activeElement;
      this.focus_category_id = category.id;
      this.delete_target = category;
      this.dialog_delete = true;
    },
    removeCategory() {
      const category = this.delete_target;
      if (
        !category ||
        !this.dialog_delete ||
        !this.canWrite ||
        this.busy_del !== null
      )
        return;
      const shopId = this.shop.id;
      const scope = this.scope_version;
      this.busy_del = category.id;
      return window.$backoffice.blog.categories
        .remove(shopId, category.id)
        .then(async () => {
          if (shopId !== this.shop.id || scope !== this.scope_version) return;
          this.dialog_delete = false;
          NotificationService.showSuccessAlert(
            null,
            this.$t("blog_category.modern.deleted"),
          );
          if (
            this.page > 1 &&
            (this.page - 1) * this.itemsPerPage >= this.totalItems - 1
          )
            this.page--;
          await this.refreshCategories(true);
        })
        .catch((error) => {
          if (shopId === this.shop.id && scope === this.scope_version)
            NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (shopId === this.shop.id && scope === this.scope_version)
            this.busy_del = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-blog-categories-list--modern {
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  .b-blog-categories-list__tools {
    display: flex;
    align-items: center;
    min-height: 40px;
    margin-block-end: 13px;
  }
  .b-blog-categories-list__search {
    flex: 0 1 240px;
    margin-inline-start: auto;
    max-width: 240px;
  }
  .b-blog-categories-list__search :deep(.v-field) {
    --v-field-padding-start: 0px;
    --v-field-padding-end: 0px;
    font-size: 13px;
    line-height: 20px;
  }
  .b-blog-categories-list__search :deep(.v-field__input) {
    min-height: 40px;
    padding-block: 8px;
    font-size: 13px;
    line-height: 20px;
  }
  .b-blog-categories-list__search :deep(.v-field__prepend-inner) {
    align-self: center;
    padding-block-start: 0;
  }
  .b-blog-categories-list__search :deep(.v-icon) {
    font-size: 17px;
  }
  .b-blog-categories-list__table.v-data-table {
    --v-table-header-height: 40px;
    --v-table-row-height: 72px;
    min-height: 0;
    margin: 0;
    font-size: 13px;
    background: transparent;
  }
  .b-blog-categories-list__table :deep(.v-table__wrapper) {
    overflow: visible;
  }
  .b-blog-categories-list__table :deep(.v-table__wrapper > table) {
    table-layout: fixed;
    > thead > tr > th,
    > tbody > tr > td {
      padding: 12px 7px !important;
    }
    > tbody > tr > td {
      font-family: inherit;
      font-size: 13px;
      font-weight: 400;
      line-height: 1.5;
    }
    > thead > tr > th {
      height: 40px !important;
      padding-block: 10px !important;
    }
    > tbody > tr > td:nth-child(3),
    > tbody > tr > td:nth-child(4) {
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }
    > thead > tr > th:first-child,
    > tbody > tr > td:first-child {
      padding-inline-start: 12px !important;
    }
    > thead > tr > th:last-child,
    > tbody > tr > td:last-child {
      padding-inline-end: 12px !important;
    }
    > tbody > tr:hover {
      background: var(--sd-modern-inset);
    }
  }
  :deep(.v-data-table-header__sort-icon) {
    font-size: 12px !important;
  }
  .b-blog-categories-list__identity {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .b-blog-categories-list__cover {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 48px;
    flex: 0 0 44px;
    padding: 2px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 9px;
    background: var(--sd-modern-inset);
    color: var(--sd-modern-muted);
    &::before {
      content: "";
      position: absolute;
      inset-inline-start: 5px;
      inset-block-start: -4px;
      width: 17px;
      height: 5px;
      border: 1px solid var(--sd-modern-border);
      border-block-end: 0;
      border-radius: 4px 4px 0 0;
      background: rgb(var(--v-theme-surface));
    }
    > .v-img {
      border-radius: 6px;
    }
  }
  .b-blog-categories-list__copy {
    min-width: 0;
  }
  .b-blog-categories-list__identity:focus-within .hover-scale {
    position: relative;
    transform: scale(var(--scale));
    z-index: 20;
  }
  .b-blog-categories-list__name {
    padding: 0;
    border: 0;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 18px;
    text-align: start;
    overflow-wrap: anywhere;
  }
  .b-blog-categories-list__name:not(:disabled):hover {
    color: rgb(var(--v-theme-primary));
  }
  .b-blog-categories-list__name:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 3px;
  }
  .b-blog-categories-list__description {
    display: block;
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    overflow-wrap: anywhere;
  }
  .b-blog-categories-list__featured {
    min-height: 0;
    gap: 5px;
    padding: 0;
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
    white-space: nowrap;
  }
  .b-blog-categories-list__zero {
    color: var(--sd-modern-muted);
  }
  .b-blog-categories-list__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
  }
  .b-blog-categories-list__icon-button {
    --sd-modern-icon-button-size: 32px;
    border-radius: 8px;
  }
  .b-blog-categories-list__footer {
    padding-block: 17px;
    font-size: 11px;
    line-height: 17px;
    color: var(--sd-modern-muted);
  }
  .b-blog-categories-list__footer p {
    font-size: 11px;
    line-height: 17px;
  }
  .b-blog-categories-list__empty {
    gap: 0;
    padding: 54px 20px;
  }
  .b-blog-categories-list__empty h2 {
    font-size: 16px;
    font-weight: 500;
    line-height: 23px;
    margin: 12px 0 5px;
  }
  .b-blog-categories-list__empty p {
    margin: 0 0 14px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
  .b-blog-categories-list__error {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-block-end: 14px;
  }
  .b-blog-categories-list__mobile-sort {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-block-end: 12px;
  }
  .b-blog-categories-list__mobile-sort > span {
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  .b-blog-categories-list__mobile-sort :deep(.v-field__input) {
    font-size: 13px;
    line-height: 20px;
  }
}

.b-blog-category-dialog :deep(.v-overlay__content) {
  inset-block-start: 110px;
  margin-block: 0 24px;
  width: calc(100% - 32px);
  max-height: calc(100% - 134px);
}
.b-blog-category-editor.b-blog-category-editor--modern {
  padding: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  border-radius: 20px;
  .b-blog-category-editor__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 24px 26px 22px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  .b-blog-category-editor__header > div {
    flex: 1;
    min-width: 0;
  }
  .b-blog-category-editor__header h2 {
    margin: 0 0 4px;
    font-family: inherit;
    font-size: 18px;
    font-weight: 600;
    line-height: 25px;
    letter-spacing: 0;
  }
  .b-blog-category-editor__header p {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }
  .b-blog-category-editor__icon-button {
    --sd-modern-icon-button-size: 32px;
    border-radius: 9px;
  }
  .b-blog-category-editor__body {
    padding: 24px 26px 12px;
    font-size: 13px;
    line-height: 21px;
  }
  .b-blog-category-editor__body > p {
    margin: 0;
  }
  .b-blog-category-editor__details {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 140px;
    gap: 26px;
    align-items: start;
  }
  .b-blog-category-editor__fields {
    min-width: 0;
  }
  h3 {
    margin: 0;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 19.5px;
  }
  .b-blog-category-editor__section-heading {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-block-end: 6px;
  }
  .b-blog-category-editor__info.v-btn {
    --sd-modern-icon-button-size: 24px;
    color: var(--sd-modern-muted);
  }
  .b-blog-category-editor__info.v-btn :deep(.v-icon) {
    font-size: 14px;
  }
  .b-blog-category-editor__section-description {
    margin: 0 0 18px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
  }
  .b-blog-category-editor__field {
    margin-block-end: 18px;
  }
  .b-blog-category-editor__field .sd-modern-underlined-field {
    --sd-modern-field-height: 39px;
  }
  .b-blog-category-editor__label {
    display: block;
    margin-block-end: 4px;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
  }
  .b-blog-category-editor__name-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  .b-blog-category-editor__name-row > .v-input {
    min-width: 0;
  }
  .b-blog-category-editor__name-row--locked :deep(input) {
    color: var(--sd-modern-muted);
  }
  .b-blog-category-editor__field :deep(.v-field__input) {
    min-height: 39px;
    padding: 9px 0;
    font-family: inherit;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0;
  }
  .b-blog-category-editor__field :deep(.v-field) {
    --v-field-padding-start: 0px;
    --v-field-padding-end: 0px;
    font-size: 13px;
    line-height: 20px;
  }
  .b-blog-category-editor__field :deep(.v-textarea .v-field__input) {
    min-height: max(76px, var(--v-input-control-height));
    // External labels need no label mask; it fades text with this compact padding.
    mask-image: none;
    -webkit-mask-image: none;
  }
  .b-blog-category-editor__field :deep(.v-input__details) {
    min-height: 0;
    padding: 0;
    font-size: 11px;
    line-height: 17px;
  }
  .b-blog-category-editor__field :deep(.v-messages) {
    min-height: 0;
    font-size: 11px;
    line-height: 17px;
  }
  .b-blog-category-editor__field :deep(.v-messages__message) {
    font-size: 11px;
    line-height: 17px;
  }
  .b-blog-category-editor__field :deep(.v-input--error .v-messages) {
    color: rgb(var(--v-theme-on-surface));
  }
  .b-blog-category-editor__field :deep(.v-input--error .v-input__details) {
    padding-block-start: 5px;
  }
  .b-blog-category-editor__field :deep(.u-smart-suggestion) {
    margin: 2px 0 0;
    font-size: 11px;
  }
  .b-blog-category-editor__rename {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-block-end: 22px;
    padding: 12px 14px;
    font-size: 12px;
    line-height: 19px;
  }
  .b-blog-category-editor__rename strong {
    font-weight: 500;
  }
  .b-blog-category-editor__rename p {
    margin: 0;
  }
  .b-blog-category-editor__featured {
    flex: 1;
    min-width: 0;
    padding: 0;
  }
  .b-blog-category-editor__featured :deep(.pa-2) {
    padding: 0 !important;
  }
  .b-blog-category-editor__featured:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 12px;
  }
  .b-blog-category-editor__featured :deep(b) {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  .b-blog-category-editor__featured :deep(.small) {
    margin-block-start: 3px;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
  }
  .b-blog-category-editor__cover {
    min-width: 0;
  }
  .b-blog-category-editor__image-heading {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 7px;
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 16.5px;
  }
  .b-blog-category-editor__image-heading h3 {
    color: rgb(var(--v-theme-on-surface));
  }
  .b-blog-category-editor__state {
    padding-inline-start: 3px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 20px;
  }
  .b-blog-category-editor__visibility {
    margin-block-start: 4px;
    padding-block-start: 20px;
  }
  .b-blog-category-editor__visibility h3 {
    margin-block-end: 6px;
  }
  .b-blog-category-editor__visibility
    .b-blog-category-editor__section-description {
    margin-block-end: 8px;
  }
  .b-blog-category-editor__featured-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding-block: 14px;
  }
  .b-blog-category-editor__saved {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-block-start: 18px;
    padding: 12px;
    font-size: 12px;
    line-height: 19px;
    > p {
      margin: 0;
    }
  }
  .b-blog-category-editor__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 18px 26px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .b-blog-category-editor__actions > .v-btn {
    margin: 0;
  }
  .b-blog-category-editor__button.v-btn {
    --v-btn-height: 38px;
    min-height: 38px;
    height: auto;
    padding: 8px 15px;
    border-radius: 9px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: 0;
  }
  .b-blog-category-editor__button :deep(.v-btn__content) {
    gap: 7px;
    font: inherit;
    letter-spacing: inherit;
  }
}

@media (max-width: 760px) {
  .b-blog-categories-list--modern {
    .b-blog-categories-list__icon-button {
      --sd-modern-icon-button-size: 44px;
    }
    .b-blog-categories-list__table :deep(.v-table__wrapper > table) {
      &,
      > tbody {
        display: block;
        width: 100%;
      }
      > tbody > .v-data-table__tr--mobile {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        align-items: center;
        gap: 10px 14px;
        padding: 17px 12px;
        border-block-start: 1px solid var(--sd-modern-border);
        > td {
          display: flex;
          align-items: center;
          gap: 5px;
          min-width: 0;
          min-height: 0;
          height: auto !important;
          padding: 0 !important;
          border: 0;
        }
        > td:first-child,
        > td:last-child {
          grid-column: 1 / -1;
          display: block;
          padding: 0 !important;
        }
        > td:first-child > .v-data-table__td-title,
        > td:nth-child(2) > .v-data-table__td-title,
        > td:last-child > .v-data-table__td-title {
          display: none;
        }
      }
    }
    :deep(.v-data-table__tr--mobile .v-data-table__td-value) {
      text-align: start;
    }
    .b-blog-categories-list__name {
      font-size: 14px;
      line-height: 20px;
    }
    .b-blog-categories-list__footer {
      gap: 10px;
    }
  }
  .b-blog-category-dialog :deep(.v-overlay__content) {
    inset-block-start: 95px;
    max-height: calc(100% - 119px);
  }
}
@media (max-width: 600px) {
  .b-blog-category-editor.b-blog-category-editor--modern {
    .b-blog-category-editor__details {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
    .b-blog-category-editor__header {
      padding: 22px 20px 20px;
    }
    &.b-blog-category-editor--form .b-blog-category-editor__header > .v-icon {
      display: none;
    }
    .b-blog-category-editor__body {
      padding: 22px 20px 10px;
    }
    .b-blog-category-editor__actions {
      padding: 16px 20px;
      flex-wrap: wrap;
    }
    .b-blog-category-editor__icon-button {
      --sd-modern-icon-button-size: 44px;
    }
    .b-blog-category-editor__info.v-btn {
      --sd-modern-icon-button-size: 44px;
    }
    .b-blog-category-editor__field :deep(.v-field__input) {
      font-size: 16px;
    }
    .b-blog-category-editor__button.v-btn {
      min-height: 44px;
    }
    .b-blog-category-editor__cover {
      margin-block-end: 22px;
    }
  }
}
@media (max-width: 480px) {
  .b-blog-categories-list--modern {
    .b-blog-categories-list__search {
      flex: 1;
      max-width: none;
    }
    .b-blog-categories-list__search :deep(.v-field__input),
    .b-blog-categories-list__mobile-sort :deep(.v-field__input) {
      font-size: 16px;
      min-height: 44px;
    }
  }
}
@media (max-width: 360px) {
  .b-blog-category-editor.b-blog-category-editor--modern {
    .b-blog-category-editor__header,
    .b-blog-category-editor__body,
    .b-blog-category-editor__actions {
      padding-inline: 16px;
    }
  }
}
@media (pointer: coarse) {
  .b-blog-categories-list--modern .b-blog-categories-list__icon-button,
  .b-blog-category-editor.b-blog-category-editor--modern
    .b-blog-category-editor__icon-button {
    --sd-modern-icon-button-size: 44px;
  }
  .b-blog-category-editor.b-blog-category-editor--modern
    .b-blog-category-editor__button.v-btn {
    min-height: 44px;
  }
  .b-blog-categories-list--modern
    .b-blog-categories-list__search
    :deep(.v-field__input),
  .b-blog-category-editor.b-blog-category-editor--modern
    .b-blog-category-editor__field
    :deep(.v-field__input) {
    font-size: 16px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .b-blog-categories-list--modern .hover-scale {
    --duration: 0s;
    transition: none !important;
  }
}
</style>
