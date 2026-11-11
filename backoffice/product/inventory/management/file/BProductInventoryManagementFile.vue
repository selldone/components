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
  <div
    class="position-relative"
    :class="{ 'b-product-files text-start': modern }"
    :aria-busy="file_busy"
  >
    <u-loading-progress
      v-if="file_busy"
      :color="modern ? 'primary' : busy_request ? '#673AB7' : 'green'"
    ></u-loading-progress>

    <header v-if="modern" class="sd-modern-header b-product-files__header">
      <div class="sd-modern-title">
        <v-icon aria-hidden="true" size="26">file_copy</v-icon>
        <div>
          <h1 class="sd-modern-title-text">
            {{ $t("product_file.modern.title") }}
          </h1>
          <p class="sd-modern-subtitle">
            {{ $t("product_file.modern.subtitle") }}
          </p>
        </div>
      </div>
    </header>

    <div :class="{ 'b-product-files__tools': modern }">
      <!-- ████████████████████ Upload ████████████████████ -->
      <section
        :class="
          modern
            ? 'sd-modern-widget b-product-files__upload'
            : 'widget-box mb-5'
        "
      >
        <b-product-file-uploader
          v-if="modern"
          ref="modernUploader"
          :key="`${shop.id}:${product.id}:${content?.id ?? ''}`"
          :authorize="authorizeModernUpload"
          :confirm="confirmModernUpload"
          :recover="recoverModernUpload"
          :max-file-bytes="max_file_size_mb * 1024 * 1024"
          :available-bytes="
            Math.max(0, max_total_files_mb * 1024 * 1024 - shop.capacity * 1024)
          "
          :existing-files="files"
          :disabled="file_busy || !!busy_delete"
          @change="updateModernUploads"
          @remove-pending="removePendingUpload"
        />
        <u-widget-header
          v-else
          :title="$t('global.commons.upload')"
          icon="cloud_upload"
        ></u-widget-header>
        <v-list-subheader v-if="!modern"></v-list-subheader>

        <v-expansion-panels v-if="!modern && USER().permissions" class="mb-2">
          <v-expansion-panel
            class="bg-transparent border"
            elevation="0"
            rounded="xl"
          >
            <v-expansion-panel-title color="transparent">
              <span>
                <v-icon size="small" class="me-2" aria-hidden="true"
                  >tune</v-icon
                >
                {{ $t("product_file.modern.advanced_upload") }}
              </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text color="transparent">
              <u-smart-switch
                v-model="first_file"
                class="my-3"
                :false-description="$t('product_file.modern.file_last_hint')"
                :false-title="$t('product_file.modern.file_last')"
                :true-description="$t('product_file.modern.file_first_hint')"
                :true-title="$t('product_file.modern.file_first')"
              ></u-smart-switch>

              <u-smart-switch
                v-model="by_axios"
                class="my-3"
                :false-description="$t('product_file.modern.native_hint')"
                :false-title="$t('product_file.modern.native_title')"
                :true-description="$t('product_file.modern.axios_hint')"
                :true-title="$t('product_file.modern.axios_title')"
              ></u-smart-switch>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <file-pond
          v-if="!modern"
          ref="pond"
          :allow-multiple="true"
          :allow-image-preview="true"
          :label-idle="upload_label"
          :maxFileSize="`${
            max_file_size_mb > free_capacity_mb
              ? free_capacity_mb
              : max_file_size_mb
          }MB`"
          :maxTotalFileSize="`${
            max_total_files_mb > free_capacity_mb
              ? free_capacity_mb
              : max_total_files_mb
          }MB`"
          :server="server_credential"
          check-validity="true"
          class="mx-auto pointer-pointer max-width-field-large dens-filepound -dashed -drop-area-200"
          credits="false"
          name="file"
          style="min-height: 84px"
          @processfile="handleProcessFile"
        />

        <v-expand-transition>
          <v-container v-if="!modern && show_detail">
            <v-row justify="space-around">
              <v-col cols="12" sm="6">
                <u-text-value-box
                  :label="$t('global.commons.speed')"
                  :value="
                    in_uploading ? numeralFormat(upload_speed, '0 b') : '-'
                  "
                  class="max-w-300"
                  icon="speed"
                ></u-text-value-box>
              </v-col>
              <v-col cols="12" sm="6">
                <u-text-value-box
                  :label="$t('global.commons.time')"
                  :value="
                    in_uploading
                      ? displayTime(remain_seconds)
                      : $t('global.commons.finished')
                  "
                  class="max-w-300"
                  icon="hourglass_top"
                ></u-text-value-box>
              </v-col>

              <v-col cols="12" lg="6" md="8" sm="10">
                <u-sparkline
                  :height="24"
                  :value="speed_array"
                  auto-line-width
                  color="blue"
                  fill
                  smooth
                ></u-sparkline>
              </v-col>
            </v-row>
          </v-container>
        </v-expand-transition>
      </section>
      <!-- ████████████████████ Usage ████████████████████ -->

      <section
        v-if="!IS_VENDOR_PANEL"
        :class="
          modern
            ? 'sd-modern-widget b-product-files__storage'
            : 'widget-box mb-5'
        "
      >
        <template v-if="modern">
          <div class="b-product-files__section-title">
            <v-icon size="19" aria-hidden="true">storage</v-icon>
            <h2>{{ $t("product_file.modern.shop_storage") }}</h2>
            <v-tooltip
              :text="$t('product_file.modern.storage_help')"
              location="top"
              content-class="sd-modern-tooltip"
              :open-on-click="true"
            >
              <template #activator="{ props }"
                ><v-btn
                  v-bind="props"
                  class="sd-modern-icon-button sd-modern-info-button ms-auto"
                  icon
                  variant="text"
                  :aria-label="$t('product_file.modern.storage_help')"
                  ><v-icon size="16">info_outline</v-icon></v-btn
                ></template
              >
            </v-tooltip>
          </div>
          <div class="b-product-files__usage">
            <span dir="ltr">{{
              numeralFormat(shop.capacity * 1024, "0.[0] b")
            }}</span>
            <p>
              {{
                $t("product_file.modern.storage_of", {
                  capacity: numeralFormat(
                    max_total_files_mb * 1000 * 1000,
                    "0 b",
                  ),
                })
              }}
            </p>
          </div>
          <v-progress-linear
            :model-value="usage_percent"
            color="primary"
            height="4"
            rounded
            :aria-label="$t('product_file.modern.shop_storage')"
          />
          <div class="b-product-files__limits">
            <u-text-value-dashed
              ><template #label>{{
                $t("product_file.modern.max_file_size")
              }}</template
              ><span dir="ltr">{{
                numeralFormat(max_file_size_mb * 1024 * 1024, "0.[0] b")
              }}</span></u-text-value-dashed
            >
            <u-text-value-dashed
              ><template #label>{{
                $t("product_file.modern.product_file_count")
              }}</template
              ><span dir="ltr"
                >{{ files.length }} / 20</span
              ></u-text-value-dashed
            >
            <u-text-value-dashed
              ><template #label>{{
                $t("product_file.modern.max_sample_size")
              }}</template
              ><span dir="ltr">50 MB</span></u-text-value-dashed
            >
          </div>
          <b-product-file-storage-chart :files="files" />
        </template>
        <template v-else>
          <u-widget-header
            :title="$t('global.commons.usage')"
            icon="data_usage"
          ></u-widget-header>
          <v-list-subheader></v-list-subheader>

          <v-row align="center" no-gutters>
            <v-col cols="12" sm="6">
              <u-chart-radial-bar
                :colors="[
                  usage_percent > 80
                    ? '#D32F2F'
                    : usage_percent > 60
                      ? '#FFA000'
                      : '#3F51B5',
                ]"
                :labels="[$t('global.commons.capacity')]"
                :series="[usage_percent]"
                :to-colors="[
                  usage_percent > 80
                    ? '#FF5722'
                    : usage_percent > 60
                      ? '#FFEB3B'
                      : '#1976D2',
                ]"
                height="168"
              >
              </u-chart-radial-bar>
            </v-col>
            <v-col class="text-subtitle-2 max-w-300" cols="12" sm="6">
              <u-text-value-box
                :label="$t('global.commons.capacity')"
                :value="numeralFormat(max_total_files_mb * 1000 * 1000, '0 b')"
                icon="storage"
              ></u-text-value-box>
              <u-text-value-box
                :label="$t('global.commons.usage')"
                :value="numeralFormat(shop.capacity * 1024, '0.[00] b')"
                icon="donut_small"
              ></u-text-value-box>
              <u-text-value-box
                :label="$t('global.commons.file_max_size')"
                :value="numeralFormat(max_file_size_mb * 1000 * 1000, '0 b')"
                icon="insert_page_break"
              ></u-text-value-box>
              <u-text-value-box
                icon="snippet_folder"
                :label="$t('product_file.file_count_limit')"
              >
                <template v-slot:value>
                  <b class="text-green">{{ files.length }}</b> / 20
                </template>
              </u-text-value-box>
            </v-col>
          </v-row>
        </template>
      </section>
    </div>
    <!-- ████████████████████ Files List ████████████████████ -->

    <section
      :class="
        modern ? 'sd-modern-widget b-product-files__library' : 'widget-box mb-5'
      "
    >
      <div v-if="modern" class="b-product-files__list-title">
        <div class="b-product-files__section-title">
          <v-icon size="19" aria-hidden="true">folder_open</v-icon>
          <h2>{{ $t("global.commons.files_list") }}</h2>
          <span class="b-product-files__muted">{{ files.length }}</span>
        </div>
        <v-tooltip
          :text="$t('global.actions.refresh')"
          location="top"
          content-class="sd-modern-tooltip"
          ><template #activator="{ props }"
            ><v-btn
              v-bind="props"
              class="sd-modern-icon-button"
              icon
              variant="text"
              :disabled="file_busy"
              :aria-label="$t('global.actions.refresh')"
              @click="fetchFiles()"
              ><v-icon>refresh</v-icon></v-btn
            ></template
          ></v-tooltip
        >
      </div>
      <u-widget-header
        v-else
        :add-caption="$t('global.actions.refresh')"
        :add-loading="busy_fetch"
        :title="$t('global.commons.files_list')"
        add-icon="refresh"
        add-text
        icon="folder"
        @click:add="fetchFiles()"
      ></u-widget-header>
      <v-list-subheader v-if="!modern">
        <div>
          <v-icon class="me-1">open_with</v-icon>
          {{ $t("product_file.drag_sort_msg") }}
        </div>
      </v-list-subheader>

      <!-- File product type > sample/paid items -->
      <div v-if="modern && !content" class="b-product-files__access-guide">
        <div>
          <v-icon size="15" aria-hidden="true">lock_outline</v-icon>
          <p>
            <strong>{{ $t("product_file.modern.paid") }}</strong
            ><span>{{ $t("product_file.modern.paid_help") }}</span>
          </p>
        </div>
        <div>
          <v-icon size="15" aria-hidden="true">task</v-icon>
          <p>
            <strong>{{ $t("product_file.modern.free_sample") }}</strong
            ><span>{{
              $t("product_file.modern.sample_help", { size: "50 MB" })
            }}</span>
          </p>
        </div>
      </div>
      <template v-if="!modern && !content">
        <v-list-subheader>
          <div>
            <v-chip class="me-1" color="#673AB7" label size="small">
              <v-icon size="small" start>diamond</v-icon>
              {{ $t("global.commons.paid") }}
            </v-chip>
            {{ $t("product_file.paid_mode_msg") }}
          </div>
        </v-list-subheader>
        <v-list-subheader>
          <div>
            <v-chip class="me-1" color="#009688" label size="small">
              {{ $t("global.commons.sample") }}
            </v-chip>
            {{ $t("product_file.free_mode_msg") }}
          </div>
        </v-list-subheader>

        <v-list-subheader>
          <div>
            <span
              >●
              {{
                has_gust_shop
                  ? $t("product_file.has_gust_shopping_msg")
                  : $t("product_file.only_registered_shopping_msg")
              }}</span
            >
            <v-btn
              v-if="!IS_VENDOR_PANEL"
              :to="{ name: 'BPageShopSettingFlow' }"
              class="mx-1 tnt"
              color="primary"
              size="small"
              variant="text"
            >
              <v-icon size="x-small" start>edit</v-icon>
              {{ $t("global.actions.change_setting") }}
            </v-btn>
          </div>
        </v-list-subheader>
      </template>
      <div v-if="modern && fetch_error" class="sd-modern-notice" role="alert">
        <v-icon aria-hidden="true">error_outline</v-icon
        ><span class="sd-modern-notice__content">{{
          $t("product_file.modern.fetch_error")
        }}</span
        ><v-btn
          class="sd-modern-button sd-modern-button--small"
          variant="text"
          :disabled="file_busy"
          @click="fetchFiles()"
          >{{ $t("global.actions.refresh") }}</v-btn
        >
      </div>
      <div v-if="modern && files.length" class="b-product-files__sort-tools">
        <label class="b-product-files__mobile-sort">
          <span>{{ $t("product_file.modern.sort_by") }}</span>
          <select
            :value="file_sort_key"
            @change="setFileSort($event.target.value)"
          >
            <option value="">
              {{ $t("product_file.modern.manual_order") }}
            </option>
            <option
              v-for="column in file_sort_columns"
              :key="column.key"
              :value="column.key"
            >
              {{ column.title }}
            </option>
          </select>
        </label>
        <v-tooltip
          v-if="file_sort_key"
          :text="
            $t(
              file_sort_desc
                ? 'product_file.modern.ascending'
                : 'product_file.modern.descending',
            )
          "
          location="top"
          content-class="sd-modern-tooltip"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="sd-modern-icon-button b-product-files__sort-direction"
              icon
              variant="text"
              :aria-label="
                $t(
                  file_sort_desc
                    ? 'product_file.modern.ascending'
                    : 'product_file.modern.descending',
                )
              "
              @click="file_sort_desc = !file_sort_desc"
              ><v-icon aria-hidden="true">{{
                file_sort_desc ? "arrow_upward" : "arrow_downward"
              }}</v-icon></v-btn
            >
          </template>
        </v-tooltip>
        <v-btn
          v-if="file_sort_key"
          class="sd-modern-button sd-modern-button--inline b-product-files__sort-reset"
          variant="text"
          @click="setFileSort('')"
        >
          {{ $t("product_file.modern.manual_order") }}
        </v-btn>
      </div>
      <div
        :role="modern ? 'table' : undefined"
        :aria-label="modern ? $t('global.commons.files_list') : undefined"
      >
        <div
          v-if="modern && files.length"
          class="b-product-files__columns sd-modern-list-header"
          role="row"
        >
          <span
            role="columnheader"
            :aria-label="$t('product_file.modern.reorder')"
          ></span>
          <span
            v-for="column in file_sort_columns"
            :key="column.key"
            role="columnheader"
            :aria-sort="
              file_sort_key === column.key
                ? file_sort_desc
                  ? 'descending'
                  : 'ascending'
                : 'none'
            "
          >
            <button
              type="button"
              class="b-product-files__sort-heading"
              @click="setFileSort(column.key)"
            >
              {{ column.title
              }}<v-icon
                v-if="file_sort_key === column.key"
                size="13"
                aria-hidden="true"
                >{{
                  file_sort_desc ? "arrow_downward" : "arrow_upward"
                }}</v-icon
              >
            </button>
          </span>
          <span
            role="columnheader"
            :aria-label="$t('global.commons.actions')"
          ></span>
        </div>
        <!-- A native Refined root keeps Sortable's row references intact; TransitionGroup clones them. -->
        <draggable
          v-model="display_files"
          v-bind="dragOptions"
          item-key="id"
          :role="modern ? 'rowgroup' : undefined"
          :aria-busy="busy_fetch"
          :disabled="modern && (file_busy || !!file_sort_key)"
          :handle="modern ? '.b-product-files__drag' : undefined"
          :component-data="
            modern
              ? undefined
              : {
                  tag: 'ul',
                  type: 'transition-group',
                  name: !drag ? 'flip-list' : 'fade',
                }
          "
          :class="
            modern
              ? 'b-product-files__list'
              : 'mt-3 border-between-vertical rounded-list-xl'
          "
          style="list-style-type: none"
          :tag="modern ? 'ul' : 'transition-group'"
          @end="drag = false"
          @start="drag = true"
          @update:modelValue="changeFilesOrder"
        >
          <template v-slot:item="{ element }">
            <li
              :key="element.id"
              :role="modern ? 'row' : undefined"
              :class="
                modern
                  ? 'b-product-files__row-boundary'
                  : 'widget-hover bg-white'
              "
            >
              <div
                v-if="modern"
                class="b-product-files__row"
                role="presentation"
              >
                <div class="b-product-files__order" role="cell">
                  <v-menu>
                    <template #activator="{ props }"
                      ><v-tooltip
                        :text="$t('product_file.modern.reorder')"
                        location="top"
                        content-class="sd-modern-tooltip"
                        ><template #activator="{ props: tooltipProps }"
                          ><button
                            v-bind="{ ...props, ...tooltipProps }"
                            type="button"
                            class="b-product-files__drag"
                            :disabled="file_busy || !!file_sort_key"
                            :aria-label="$t('product_file.modern.reorder')"
                          >
                            <v-icon size="16" aria-hidden="true"
                              >drag_indicator</v-icon
                            >
                          </button></template
                        ></v-tooltip
                      ></template
                    >
                    <v-list density="compact" class="text-start"
                      ><v-list-item
                        :disabled="
                          file_busy || !!file_sort_key || files[0] === element
                        "
                        prepend-icon="arrow_upward"
                        :title="$t('product_file.modern.move_up')"
                        @click="moveFile(element, -1)" /><v-list-item
                        :disabled="
                          file_busy ||
                          !!file_sort_key ||
                          files[files.length - 1] === element
                        "
                        prepend-icon="arrow_downward"
                        :title="$t('product_file.modern.move_down')"
                        @click="moveFile(element, 1)"
                    /></v-list>
                  </v-menu>
                </div>
                <div class="b-product-files__identity" role="cell">
                  <img
                    :src="FileHelper.GetFileExtensionImage(element.name)"
                    alt=""
                    width="32"
                    height="38"
                  />
                  <div>
                    <v-tooltip
                      :text="element.name"
                      location="top"
                      content-class="sd-modern-tooltip"
                      ><template #activator="{ props }"
                        ><button
                          v-bind="props"
                          type="button"
                          class="b-product-files__name"
                          :disabled="
                            file_busy ||
                            busy_name === element.id ||
                            uploading_array.includes(element.id)
                          "
                          @click="renameFile(element)"
                        >
                          <bdi>{{ element.name }}</bdi>
                        </button></template
                      ></v-tooltip
                    >
                    <div class="b-product-files__dates">
                      <time
                        :datetime="element.created_at"
                        :title="getLocalTimeString(element.created_at)"
                        >{{ $t("global.commons.created_at") }}
                        {{ getFromNowString(element.created_at) }}</time
                      ><time
                        v-if="element.download_at"
                        :datetime="element.download_at"
                        :title="getLocalTimeString(element.download_at)"
                        >{{ $t("global.commons.download_at") }}
                        {{ getFromNowString(element.download_at) }}</time
                      ><span v-else-if="!element.downloads">{{
                        $t("product_file.modern.no_downloads")
                      }}</span>
                    </div>
                  </div>
                </div>
                <div class="b-product-files__access" role="cell">
                  <v-btn
                    v-if="!content"
                    variant="text"
                    class="b-product-files__access-button"
                    :loading="busy_sample === element.id"
                    :disabled="
                      file_busy || uploading_array.includes(element.id)
                    "
                    @click="editAccess(element)"
                    ><span
                      v-if="element.sample"
                      class="sd-modern-status__dot sd-modern-status__dot--success"
                    /><v-icon v-else size="14" aria-hidden="true"
                      >lock_outline</v-icon
                    ><span>{{
                      element.sample
                        ? $t("product_file.modern.free_sample")
                        : $t("product_file.modern.paid")
                    }}</span
                    ><v-icon size="14" aria-hidden="true"
                      >expand_more</v-icon
                    ></v-btn
                  >
                </div>
                <div class="b-product-files__downloads" role="cell">
                  <span
                    class="sd-modern-list-header b-product-files__mobile-label"
                    >{{ $t("global.commons.downloads") }}</span
                  ><span>{{ numeralFormat(element.downloads, "0,0") }}</span
                  ><v-tooltip
                    v-if="
                      element.downloads && element.downloads === max_downloads
                    "
                    :text="$t('product_file.modern.most_downloaded')"
                    location="top"
                    content-class="sd-modern-tooltip"
                    ><template #activator="{ props }"
                      ><v-icon
                        v-bind="props"
                        size="13"
                        :aria-label="$t('product_file.modern.most_downloaded')"
                        >local_fire_department</v-icon
                      ></template
                    ></v-tooltip
                  >
                </div>
                <div class="b-product-files__size" role="cell">
                  <span
                    class="sd-modern-list-header b-product-files__mobile-label"
                    >{{ $t("global.commons.size") }}</span
                  ><bdi>{{
                    numeralFormat(element.size * 1000, "0.[0] b")
                  }}</bdi>
                </div>
                <div class="b-product-files__actions" role="cell">
                  <v-tooltip
                    :text="$t('product_file.modern.rename')"
                    location="top"
                    content-class="sd-modern-tooltip"
                    ><template #activator="{ props }"
                      ><v-btn
                        v-bind="props"
                        class="sd-modern-icon-button"
                        variant="text"
                        icon
                        :loading="busy_name === element.id"
                        :disabled="
                          file_busy || uploading_array.includes(element.id)
                        "
                        :aria-label="$t('product_file.modern.rename')"
                        @click="renameFile(element)"
                        ><v-icon>edit</v-icon></v-btn
                      ></template
                    ></v-tooltip
                  >
                  <v-tooltip
                    :text="$t('global.actions.download')"
                    location="top"
                    content-class="sd-modern-tooltip"
                    ><template #activator="{ props }"
                      ><v-btn
                        v-bind="props"
                        :href="getFileUrl(element)"
                        :loading="element.uploading"
                        :disabled="
                          file_busy || uploading_array.includes(element.id)
                        "
                        class="sd-modern-icon-button"
                        icon
                        variant="text"
                        target="_blank"
                        rel="noopener noreferrer"
                        :aria-label="$t('global.actions.download')"
                        ><v-icon>download</v-icon></v-btn
                      ></template
                    ></v-tooltip
                  >
                  <u-progress-radial
                    v-if="uploading_array.includes(element.id)"
                    :completed-steps="uploading_progress[element.id]"
                    :diameter="32"
                    :stroke-width="3"
                    :total-steps="100"
                    :aria-label="$t('global.commons.uploading')"
                    ><v-icon size="16">file_upload</v-icon></u-progress-radial
                  >
                  <v-tooltip
                    v-else
                    :text="$t('global.actions.delete')"
                    location="top"
                    content-class="sd-modern-tooltip"
                    ><template #activator="{ props }"
                      ><v-btn
                        v-bind="props"
                        :loading="busy_delete === element"
                        :disabled="file_busy"
                        class="sd-modern-icon-button"
                        icon
                        variant="text"
                        :aria-label="$t('global.actions.delete')"
                        @click="deleteFile(element)"
                        ><v-icon>delete_outline</v-icon></v-btn
                      ></template
                    ></v-tooltip
                  >
                </div>
              </div>
              <v-list-item v-else>
                <template v-slot:prepend>
                  <v-avatar class="cursor-move" rounded="0">
                    <img
                      :src="FileHelper.GetFileExtensionImage(element.name)"
                    />
                  </v-avatar>
                </template>

                <v-list-item-title class="text-subtitle-2 d-flex align-center">
                  <span
                    :class="{ disabled: busy_name === element.id }"
                    class="editable-blue py-2 inline-block flex-grow-1 single-line"
                    contenteditable="true"
                    dir="ltr"
                    @blur="
                      (e) => setFileName(element, e.target.innerText, e.target)
                    "
                    @keydown.enter="
                      (e) => {
                        setFileName(element, e.target.innerText, e.target);
                        e.preventDefault();
                      }
                    "
                  >
                    {{ element.name }}
                  </span>
                  <!-- File product type > sample/paid items -->
                  <v-btn
                    v-if="!content"
                    :class="{
                      pen: !element.sample && element.size > 50 * 1024,
                    }"
                    :color="element.sample ? '#009688' : '#673AB7'"
                    :loading="busy_sample === element.id"
                    class="mx-2 tnt"
                    min-width="72"
                    size="small"
                    title="Toggle free/paid mode."
                    variant="flat"
                    @click="setSample(element, !element.sample)"
                  >
                    <v-icon v-if="!element.sample" start
                      >{{ element.size > 50 * 1024 ? "lock" : "diamond" }}
                    </v-icon>
                    {{
                      element.sample
                        ? $t("global.commons.sample")
                        : $t("global.commons.paid")
                    }}
                  </v-btn>
                </v-list-item-title>
                <v-list-item-subtitle class="py-1 usn">
                  {{ $t("global.commons.created_at") }}:
                  <b :title="getLocalTimeString(element.created_at)">{{
                    getFromNowString(element.created_at)
                  }}</b>
                </v-list-item-subtitle>
                <v-list-item-subtitle
                  v-if="element.download_at"
                  class="pb-1 usn"
                >
                  {{ $t("global.commons.download_at") }}:
                  <b :title="getLocalTimeString(element.download_at)">{{
                    getFromNowString(element.download_at)
                  }}</b>
                </v-list-item-subtitle>
                <v-list-item-subtitle class="usn">
                  {{ $t("global.commons.downloads") }}:
                  <b>{{ numeralFormat(element.downloads, "0,0") }}</b>
                  <span
                    v-if="element.downloads === max_downloads"
                    class="text-black"
                    title="Most downloaded!"
                    >🔥</span
                  >
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-list-item-action class="d-flex flex-column" end>
                    <div class="text-center small" style="min-width: 36px">
                      {{
                        uploading_array.includes(element.id)
                          ? $t("global.commons.uploading")
                          : $t("global.actions.delete")
                      }}
                    </div>

                    <u-progress-radial
                      v-if="uploading_array.includes(element.id)"
                      :completedSteps="uploading_progress[element.id]"
                      :diameter="40"
                      :stroke-width="6"
                      :totalSteps="100"
                    >
                      <v-icon size="small">file_upload</v-icon>
                    </u-progress-radial>
                    <v-btn
                      v-else
                      :loading="busy_delete === element"
                      color="red"
                      icon
                      title="Delete"
                      variant="text"
                      @click="deleteFile(element)"
                    >
                      <v-icon>close</v-icon>
                    </v-btn>
                  </v-list-item-action>

                  <v-list-item-action
                    class="d-flex flex-column"
                    end
                    style="flex-basis: 50px"
                  >
                    <div
                      class="text-center small font-weight-black english-field"
                      dir="ltr"
                      style="min-width: 36px"
                    >
                      {{ numeralFormat(element.size * 1000, "0.[0] b") }}
                    </div>

                    <v-btn
                      :href="getFileUrl(element)"
                      :loading="element.uploading"
                      color="blue"
                      icon
                      target="_blank"
                      title="Download"
                      variant="text"
                    >
                      <v-icon>cloud_download</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </template>
              </v-list-item>
            </li>
          </template>
        </draggable>
      </div>
      <b-list-empty-state
        v-if="modern && !files.length && !busy_fetch && !fetch_error"
        kind="content"
        :title="$t('product_file.modern.empty_title')"
        :description="$t('product_file.modern.empty_hint')"
      />
      <p
        v-if="!modern && !files.length"
        class="text-h2 text-muted text-center m-3 text-uppercase"
      >
        {{ $t("product_file.no_file") }}
      </p>
      <footer
        v-if="modern"
        class="sd-modern-table-footer b-product-files__footer"
      >
        <span
          ><v-icon size="14" aria-hidden="true">drag_indicator</v-icon
          >{{
            $t(
              file_sort_key
                ? "product_file.modern.sorted_order_hint"
                : "product_file.drag_sort_msg",
            )
          }}</span
        ><span dir="ltr">{{ files.length }} / 20</span>
      </footer>
      <div v-if="modern && !content" class="b-product-files__guest">
        <v-icon size="16" aria-hidden="true">group</v-icon>
        <p>
          {{
            has_gust_shop
              ? $t("product_file.modern.guest_enabled")
              : $t("product_file.modern.registered_only")
          }}
        </p>
        <v-btn
          v-if="!IS_VENDOR_PANEL"
          :to="{ name: 'BPageShopSettingFlow' }"
          class="sd-modern-button sd-modern-button--small sd-modern-button--inline"
          variant="text"
          color="primary"
          >{{ $t("product_file.modern.checkout_settings") }}</v-btn
        >
      </div>
    </section>

    <v-dialog
      v-if="modern"
      v-model="rename_dialog"
      max-width="440"
      :persistent="!!busy_name"
    >
      <v-card class="sd-modern-widget b-product-files-dialog text-start">
        <div class="b-product-files__list-title">
          <h2>{{ $t("product_file.modern.rename") }}</h2>
          <v-tooltip
            :text="$t('global.actions.close')"
            location="top"
            content-class="sd-modern-tooltip"
            ><template #activator="{ props }"
              ><v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                icon
                variant="text"
                :disabled="!!busy_name"
                :aria-label="$t('global.actions.close')"
                @click="rename_dialog = false"
                ><v-icon>close</v-icon></v-btn
              ></template
            ></v-tooltip
          >
        </div>
        <p class="sd-modern-subtitle">
          {{ $t("product_file.modern.rename_hint") }}
        </p>
        <v-locale-provider :rtl="false">
          <v-text-field
            v-model="rename_name"
            class="sd-modern-underlined-field mt-5"
            :label="$t('product_file.modern.file_name')"
            :disabled="!!busy_name"
            :error-messages="rename_error"
            variant="underlined"
            dir="ltr"
            autofocus
            @keydown.enter.prevent="saveFileName()"
            ><template #append-inner
              ><bdi class="b-product-files__extension">{{
                rename_extension
              }}</bdi></template
            ></v-text-field
          >
        </v-locale-provider>
        <div class="b-product-files__dialog-actions">
          <v-btn
            class="sd-modern-button"
            variant="text"
            :disabled="!!busy_name"
            @click="rename_dialog = false"
            >{{ $t("global.actions.cancel") }}</v-btn
          ><v-btn
            class="sd-modern-button sd-modern-button--primary"
            color="primary"
            variant="elevated"
            prepend-icon="save"
            :loading="!!busy_name"
            @click="saveFileName()"
            >{{ $t("global.actions.save") }}</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
    <v-dialog
      v-if="modern"
      v-model="access_dialog"
      max-width="440"
      :persistent="!!busy_sample"
    >
      <v-card class="sd-modern-widget b-product-files-dialog text-start">
        <div class="b-product-files__list-title">
          <h2>{{ $t("product_file.modern.access_title") }}</h2>
          <v-tooltip
            :text="$t('global.actions.close')"
            location="top"
            content-class="sd-modern-tooltip"
            ><template #activator="{ props }"
              ><v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                icon
                variant="text"
                :disabled="!!busy_sample"
                :aria-label="$t('global.actions.close')"
                @click="access_dialog = false"
                ><v-icon>close</v-icon></v-btn
              ></template
            ></v-tooltip
          >
        </div>
        <p class="sd-modern-subtitle b-product-files__dialog-filename">
          <bdi>{{ access_file?.name }}</bdi>
        </p>
        <u-smart-switch
          v-model="access_sample"
          accessible
          class="sd-modern-smart-select my-5"
          border
          :false-title="$t('product_file.modern.paid')"
          :false-description="$t('product_file.modern.paid_help')"
          :true-title="$t('product_file.modern.free_sample')"
          :true-description="
            $t('product_file.modern.sample_help', { size: '50 MB' })
          "
          :disabled="!!busy_sample"
        />
        <p
          v-if="access_sample && access_file?.size > 50 * 1024"
          class="sd-modern-notice"
          role="alert"
        >
          <v-icon color="warning" size="18" aria-hidden="true"
            >info_outline</v-icon
          ><span class="sd-modern-notice__content">{{
            $t("product_file.modern.sample_too_large", { size: "50 MB" })
          }}</span>
        </p>
        <div class="b-product-files__dialog-actions">
          <v-btn
            class="sd-modern-button"
            variant="text"
            :disabled="!!busy_sample"
            @click="access_dialog = false"
            >{{ $t("global.actions.cancel") }}</v-btn
          ><v-btn
            class="sd-modern-button sd-modern-button--primary"
            color="primary"
            variant="elevated"
            prepend-icon="save"
            :disabled="access_sample && access_file?.size > 50 * 1024"
            :loading="!!busy_sample"
            @click="saveAccess()"
            >{{ $t("global.actions.save") }}</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Eligible } from "@selldone/core-js/enums/shop/ShopLicense";
import UChartRadialBar from "../../../../../ui/chart/radial/bar/UChartRadialBar.vue";
import UTextValueBox from "../../../../../ui/text/value-box/UTextValueBox.vue";
import UProgressRadial from "../../../../../ui/progress/radial/UProgressRadial.vue";

import USmartSwitch from "../../../../../ui/smart/switch/USmartSwitch.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { throttle } from "lodash-es";
import USparkline from "../../../../../ui/chart/sparkline/USparkline.vue";
import FilePondLoader from "@selldone/components-vue/plugins/filepond/FilePondLoader.ts";
import { defineAsyncComponent } from "vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import { FileHelper } from "@selldone/core-js/utils";
import UTextValueDashed from "../../../../../ui/text/value-dashed/UTextValueDashed.vue";
import BListEmptyState from "../../../../empty-state/BListEmptyState.vue";
import BProductFileStorageChart from "./BProductFileStorageChart.vue";
import BProductFileUploader from "./BProductFileUploader.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductInventoryManagementFile",
  mixins: [DateMixin],
  components: {
    UTextValueDashed,
    BListEmptyState,
    BProductFileStorageChart,
    BProductFileUploader,
    FilePond: FilePondLoader.loadFilePondComponent(),

    USparkline,
    USmartSwitch,

    UProgressRadial,
    UTextValueBox,
    UChartRadialBar,
    draggable: defineAsyncComponent(() => import("vuedraggable")),
  },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
    content: {
      // 🎗️ Subscription  > This file is for a content?
      required: false,
      type: Object,
    },
    forStudio: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      first_file: false,
      by_axios: true,
      file_sort_key: "",
      file_sort_desc: false,

      busy: false,

      busy_delete: null,
      busy_request: false,
      upload_url_requests: 0,
      busy_fetch: false,
      file_fetch_sequence: 0,
      fetch_error: false,
      rename_dialog: false,
      rename_file: null,
      rename_name: "",
      rename_error: "",
      access_dialog: false,
      access_file: null,
      access_sample: false,

      uploading_array: [],
      uploading_progress: {},

      upload_remains_bytes: [],
      upload_speed: 0,
      last_sum: 0,
      remain_seconds: 0,
      show_detail: false,

      speed_array: Array(30).fill(0),

      //--------------------------
      busy_name: null,
      busy_sample: null,
      //--------------------------

      server_credential: {
        timeout: 99999999,
        revert: null,

        process: async (
          fieldName,
          file,
          metadata,
          load,
          error,
          progress,
          abort,
          transfer,
          options,
        ) => {
          console.style("<b>I. Start uploading...</b> " + "file: " + file.name);
          const sell_res = await this.getUploadUrl(file.name, file.size).catch(
            (error) => {
              console.error("Error on creating signed url!", error);
            },
          );

          if (!sell_res || !sell_res.success) {
            console.error("error: Signed url not created!", sell_res);
            abort();
            return;
          }

          const {
            attributes,
            inputs,
            capacity,
            file_item,
            with_credentials,
            headers,
            direct_file,
          } = sell_res;

          // ――――――――――― Update shop info ―――――――――――
          this.shop.capacity = capacity;
          this.AddOrUpdateItemByID(this.files, file_item);

          console.style(
            `<b>II. Signed url generated </b><b="color: green;">successfully</b>. Now send file to the <b>${attributes.action}</b>...`,
          );

          // ――――――――――― Create form data to send ―――――――――――

          const formData = new FormData();

          if (this.first_file) {
            formData.append(fieldName, file, file.name);

            if (inputs && !Array.isArray(inputs)) {
              Object.keys(inputs).forEach((key) => {
                formData.append(key, inputs[key]);
              });
            }
          } else {
            if (inputs && !Array.isArray(inputs)) {
              Object.keys(inputs).forEach((key) => {
                formData.append(key, inputs[key]);
              });
            }
            formData.append(fieldName, file, file.name);
          }

          // timeout identifier, only used when timeout is defined
          let aborted = false;

          // ――――――――――― Option 1. Send by Axios ―――――――――――
          if (this.by_axios) {
            const instance = with_credentials
              ? axios
              : axios.create({
                  withCredentials: false,
                });

            const config = {
              onUploadProgress: (e) => {
                // no progress event when aborted ( onprogress is called once after abort() )
                if (aborted) {
                  return;
                }

                progress(e.lengthComputable, e.loaded, e.total);
                const pval = Math.floor((e.loaded / (e.total + 0.001)) * 100);
                console.log("progress", e.loaded, e.total, pval + "%");
                this.uploading_progress[file_item.id] = pval;
                this.upload_remains_bytes[file_item.id] = e.total - e.loaded;

                this.$forceUpdate(); // Update vue component!

                // Add to global upload keeper:
                this.$store.dispatch({
                  type: "addUploadingFile",
                  file_id: file_item.id,
                  name: file_item.name,
                  progress: pval,
                });
              },

              headers: headers,
            };

            // + Add id to uploading array! (prevent delete!)
            this.uploading_array.push(file_item.id);

            let promise = null;
            if (attributes.method === "PUT") {
              promise = instance.put(
                attributes.action,
                direct_file ? file : formData,
                config,
              );
            } else {
              promise = instance.post(
                attributes.action,
                direct_file ? file : formData,
                config,
              );
            }

            promise
              .then((res) => {
                if (res.status >= 200 && res.status < 300) {
                  // the load method accepts either a string (id) or an object
                  load(res);
                } else {
                  // Can call the error method if something is wrong, should exit after
                  error(res);
                }
              })
              .catch((e) => {
                console.error(e);
                error(e);
              })
              .finally(() => {
                this.remove(this.uploading_array, file_item.id);
                file_item.uploading = false; // End uploading!
                delete this.uploading_progress[file_item.id];
                delete this.upload_remains_bytes[file_item.id];

                // Remove from global upload keeper:
                this.$store.dispatch({
                  type: "removeUploadingFile",
                  file_id: file_item.id,
                });
              });

            let ajaxRequest = axios.CancelToken.source();

            return {
              abort: () => {
                console.log("Request cancel upload.");
                aborted = true;
                // This function is entered if the user has tapped the cancel button
                // cancel  previous ajax if exists
                ajaxRequest.cancel();

                // Let FilePond know the request has been Canceled
                abort();
              },
            };
          }

          // ――――――――――― Option 2. Send by XMLHttpRequest ―――――――――――

          // create request
          const xhr = new XMLHttpRequest();

          xhr.enctype = attributes.enctype;
          xhr.withCredentials = false;

          // progress of load
          // Tips important: Don't use request.upload.onprogress to keep request simple and prevent preflight CORS!
          xhr.upload.onprogress = (e) => {
            // no progress event when aborted ( onprogress is called once after abort() )
            if (aborted) {
              return;
            }

            progress(e.lengthComputable, e.loaded, e.total);
            const pval = Math.floor((e.loaded / (e.total + 0.001)) * 100);
            console.log("progress", e.loaded, e.total, pval + "%");
            this.uploading_progress[file_item.id] = pval;
            this.$forceUpdate(); // Update vue component!
          };

          // error during load
          xhr.onerror = (e) => {
            console.error(e);
            this.remove(this.uploading_array, file_item.id);
            file_item.uploading = false; // End uploading!
            error(xhr);
            this.uploading_progress[file_item.id] = null;
          };

          xhr.onload = () => {
            this.remove(this.uploading_array, file_item.id);
            file_item.uploading = false; // End uploading!
            this.uploading_progress[file_item.id] = null;

            if (xhr.status >= 200 && xhr.status < 300) {
              // the load method accepts either a string (id) or an object
              load(xhr);
            } else {
              // Can call the error method if something is wrong, should exit after
              error(xhr);
            }
          };

          // request aborted
          xhr.onabort = () => {
            aborted = true;
            xhr.abort();
            abort();
          };

          // open up open up!
          xhr.open(attributes.method, attributes.action, true);

          const token = document.head.querySelector('meta[name="csrf-token"]');
          xhr.setRequestHeader("X-CSRF-TOKEN", token.content);

          // Add id to uploading array! (prevent delete!)
          this.uploading_array.push(file_item.id);
          xhr.send(direct_file ? file : formData);

          // Should expose an abort method so the request can be Canceled
          return {
            abort: () => {
              console.log("Request cancel upload.");
              aborted = true;
              // This function is entered if the user has tapped the cancel button
              xhr.abort();

              // Let FilePond know the request has been Canceled
              abort();
            },
          };
        },

        // ――――――――――――――――――――――――――――――――――――――――
      },

      //--------------------------------
      dragOptions: {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      },
      drag: false,
      busy_sort: false,
    };
  },

  computed: {
    FileHelper() {
      return FileHelper;
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    files: {
      get() {
        // 🎗️ Subscription content keeps its own file collection.
        return this.content ? this.content.files : this.product.files;
      },
      set(files) {
        if (this.content) this.content.files = files;
        else this.product.files = files;
      },
    },
    file_sort_columns() {
      return [
        { key: "name", title: this.$t("product_file.modern.file_name") },
        { key: "sample", title: this.$t("product_file.modern.access") },
        { key: "downloads", title: this.$t("global.commons.downloads") },
        { key: "size", title: this.$t("global.commons.size") },
      ];
    },
    display_files: {
      get() {
        if (!this.modern || !this.file_sort_key) return this.files;
        const key = this.file_sort_key;
        // View sorting never changes the saved manual order; equal values keep that order.
        return this.files.slice().sort((a, b) => {
          const order =
            key === "name"
              ? a.name.localeCompare(b.name, undefined, {
                  numeric: true,
                  sensitivity: "base",
                })
              : Number(a[key] || 0) - Number(b[key] || 0);
          return this.file_sort_desc ? -order : order;
        });
      },
      set(files) {
        if (!this.modern || !this.file_sort_key) this.files = files;
      },
    },
    file_busy() {
      return !!(this.busy_request || this.busy_fetch || this.busy_sort);
    },
    rename_extension() {
      const name = this.rename_file?.name || "";
      const dot = name.lastIndexOf(".");
      return dot > 0 ? name.slice(dot) : "";
    },
    upload_label() {
      return `<p class="text-dark m-0">${this.$t("global.commons.select_upload_file")}</p>`;
    },
    max_downloads() {
      return this.files.map((i) => i.downloads).findMax();
    },
    free_capacity_mb() {
      return Math.round(
        this.max_total_files_mb - this.shop.capacity /*KB*/ / 1024,
      );
    },
    max_file_size_mb() {
      return Eligible.GetFileUploadLimitMB(this.shop);
    },
    max_total_files_mb() {
      return Eligible.GetMaxCapacityMB(this.shop);
    },
    usage_percent() {
      return (100 * this.shop.capacity) / (this.max_total_files_mb * 1000);
    },

    in_uploading() {
      return this.uploading_array.length > 0;
    },

    has_gust_shop() {
      return ShopOptionsHelper.HasGuestCheckout(this.shop); /*🥶 Guest*/
    },
  },

  watch: {
    product() {
      this.setFileSort("");
      this.rename_dialog = false;
      this.access_dialog = false;
      this.fetch_error = false;
    },
    content() {
      this.setFileSort("");
      this.rename_dialog = false;
      this.access_dialog = false;
      this.fetch_error = false;
    },
    in_uploading(uploading) {
      if (this.modern) return;
      if (uploading) {
        this.show_detail = true;
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => {
          let sum = this.upload_remains_bytes.reduce((a, b) => a + b, 0);

          // Valid routine:
          if (this.last_sum > sum) {
            this.upload_speed = this.last_sum - sum;
            this.remain_seconds = sum / this.upload_speed; //seconds
            //console.log('SUM remains:',sum,'Speed:',this.upload_speed)
            this.speed_array.push(this.upload_speed / 1024);
            this.speed_array.shift();
          }

          this.last_sum = sum;
        }, 1000);
      } else {
        if (this.interval) clearInterval(this.interval);
      }
    },
  },
  created() {},
  beforeUnmount() {
    if (this.interval) clearInterval(this.interval);
    if (this.modern) this.updateModernUploads([]);
  },

  mounted() {},
  methods: {
    async authorizeModernUpload(file, signal) {
      const product = this.product;
      const content = this.content;
      const shop = this.shop;
      const descriptor = await this.getUploadUrl(file.name, file.size, {
        signal,
        quiet: true,
      });
      if (
        signal.aborted ||
        product !== this.product ||
        content !== this.content ||
        shop !== this.shop
      )
        throw new Error("Upload scope changed");
      if (!descriptor?.success || !descriptor.file_item)
        throw new Error("Upload authorization failed");
      // Concurrent reservations can finish out of order; an older response must not lower usage.
      shop.capacity = Math.max(shop.capacity, descriptor.capacity);
      this.AddOrUpdateItemByID(
        content ? content.files : product.files,
        descriptor.file_item,
      );
      return descriptor;
    },
    async confirmModernUpload(file, signal) {
      const files = await this.fetchFilesNow({ quiet: true, signal });
      return (
        !!files && files.some((item) => item.id === file.id && !item.uploading)
      );
    },
    async recoverModernUpload(file, fileId, signal) {
      const product = this.product;
      const content = this.content;
      const shop = this.shop;
      const files = await this.fetchFilesNow({ quiet: true, signal });
      if (
        !files ||
        signal.aborted ||
        product !== this.product ||
        content !== this.content ||
        shop !== this.shop
      )
        throw new Error("Upload recovery unavailable");
      const existing =
        files.find((item) => item.id === fileId) ||
        files.find((item) => item.name === file.name);
      if (!existing) return { kind: "available" };
      return {
        kind: existing.uploading ? "pending" : "complete",
        fileItem: existing,
      };
    },
    async removePendingUpload(record) {
      const product = this.product;
      const content = this.content;
      const shop = this.shop;
      const files = await this.fetchFilesNow({ quiet: true });
      if (
        !files ||
        product !== this.product ||
        content !== this.content ||
        shop !== this.shop
      )
        return;
      const file = files.find((item) => item.id === record.fileId);
      if (!file?.uploading) {
        this.$refs.modernUploader?.retryRecord(record.id);
        return;
      }
      // A new signing request needs the incomplete reservation removed through the native confirmation.
      this.deleteFile(file, () =>
        this.$refs.modernUploader?.retryRecord(record.id),
      );
    },
    updateModernUploads(records) {
      const active = records.filter(
        (record) =>
          record.fileId != null &&
          ["queued", "authorizing", "uploading", "confirming"].includes(
            record.status,
          ),
      );
      const ids = active.map((record) => record.fileId);
      this.uploading_array.forEach((id) => {
        if (!ids.includes(id))
          this.$store.dispatch({ type: "removeUploadingFile", file_id: id });
      });
      this.uploading_array = ids;
      this.uploading_progress = Object.fromEntries(
        active.map((record) => [record.fileId, record.progress ?? 0]),
      );
      active.forEach((record) =>
        this.$store.dispatch({
          type: "addUploadingFile",
          file_id: record.fileId,
          name: record.name,
          progress: record.progress ?? 0,
        }),
      );
    },
    setFileSort(key) {
      this.file_sort_desc =
        !!key && this.file_sort_key === key ? !this.file_sort_desc : false;
      this.file_sort_key = key;
    },
    renameFile(file) {
      if (
        this.file_busy ||
        this.busy_name ||
        this.uploading_array.includes(file.id)
      )
        return;
      this.rename_file = file;
      this.rename_name = this.rename_extension
        ? file.name.slice(0, -this.rename_extension.length)
        : file.name;
      this.rename_error = "";
      this.rename_dialog = true;
    },
    async saveFileName() {
      if (
        !this.rename_dialog ||
        !this.rename_file ||
        this.file_busy ||
        this.busy_name
      )
        return;
      const name = this.rename_name.trim();
      if (!name) {
        this.rename_error = this.$t("product_file.modern.invalid_name");
        return;
      }
      if (
        await this.setFileName(this.rename_file, name + this.rename_extension)
      )
        this.rename_dialog = false;
    },
    editAccess(file) {
      if (
        this.content ||
        this.file_busy ||
        this.busy_sample ||
        this.uploading_array.includes(file.id)
      )
        return;
      this.access_file = file;
      this.access_sample = !!file.sample;
      this.access_dialog = true;
    },
    async saveAccess() {
      if (
        !this.access_dialog ||
        !this.access_file ||
        this.content ||
        this.file_busy ||
        this.busy_sample
      )
        return;
      if (await this.setSample(this.access_file, this.access_sample))
        this.access_dialog = false;
    },
    moveFile(file, offset) {
      if (this.file_busy || (this.modern && this.file_sort_key)) return;
      const index = this.files.findIndex((item) => item.id === file.id);
      const next = index + offset;
      if (index < 0 || next < 0 || next >= this.files.length) return;
      const files = this.files.slice();
      files.splice(next, 0, files.splice(index, 1)[0]);
      this.files = files;
      return this.changeFilesOrder();
    },
    displayTime(seconds) {
      const format = (val) => `0${Math.floor(val)}`.slice(-2);
      const hours = seconds / 3600;
      const minutes = (seconds % 3600) / 60;

      return [hours, minutes, seconds % 60].map(format).join(":");
    },

    getUploadUrl(filename, size, { signal, quiet = false } = {}) {
      return new Promise((resolve, reject) => {
        this.upload_url_requests++;
        this.busy_request = true;

        axios
          .get(
            this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
              ? window.VAPI.GET_MY_VENDOR_PRODUCT_FILE_UPLOAD_URL(
                  this.product.vendor_id,
                  this.product.id,
                )
              : window.API.GET_PRODUCT_FILE_UPLOAD_URL(
                  this.product.shop_id,
                  this.product.id,
                ),
            {
              signal,
              // Only descriptor creation is timed out; large binary transfers keep their native lifetime.
              timeout: quiet ? 60000 : undefined,
              params: {
                content_id: this.content?.id, // 🎗️ Subscription  > This file is for a content?
                filename: filename,
                size: size,
              },
            },
          )
          .then(({ data }) => {
            if (!data.error) {
              resolve(data);
            } else {
              if (!quiet)
                NotificationService.showErrorAlert(null, data.error_msg);
              reject(
                quiet
                  ? new Error("Upload authorization failed")
                  : data.error_msg,
              );
            }
          })
          .catch((error) => {
            if (!quiet) NotificationService.showLaravelError(error);
            reject(error);
          })
          .finally(() => {
            this.upload_url_requests--;
            this.busy_request = this.upload_url_requests > 0;
          });
      });
    },

    handleProcessFile(error, file) {
      if (!error) {
        // let response = JSON.parse(file.serverId);

        //console.log("done > product_file", response.product_file);
        console.style(`<b>III. Upload done. ✔</b>`);

        this.fetchFiles();

        return true;
      }
    },

    deleteFile(file, onDeleted) {
      if (
        this.file_busy ||
        this.busy_delete ||
        this.uploading_array.includes(file.id)
      )
        return;
      const product = this.product;
      const content = this.content;
      const shop = this.shop;
      NotificationService.openDangerAlert(
        this.$t("product_file.delete_dialog.title"),
        this.$t("product_file.delete_dialog.message"),
        this.$t("product_file.delete_dialog.action"),
        async () => {
          if (
            product !== this.product ||
            content !== this.content ||
            shop !== this.shop ||
            this.busy_delete
          )
            return;
          if (typeof onDeleted === "function") {
            const files = await this.fetchFilesNow({ quiet: true });
            if (
              !files ||
              product !== this.product ||
              content !== this.content ||
              shop !== this.shop ||
              this.busy_delete
            )
              return;
            const pending = files.find((item) => item.id === file.id);
            // A transfer completed while the confirmation was open: confirm it instead of deleting it.
            if (!pending?.uploading) {
              onDeleted();
              return;
            }
          }
          if (
            this.file_busy ||
            this.busy_delete ||
            this.uploading_array.includes(file.id) ||
            !this.files.some((item) => item.id === file.id)
          )
            return;
          this.busy_delete = file;
          let deleted = false;
          axios
            .delete(
              this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                ? window.VAPI.DELETE_MY_VENDOR_PRODUCT_FILE(
                    this.product.vendor_id,
                    this.product.id,
                    file.id,
                  )
                : window.API.DELETE_PRODUCT_FILE(
                    this.product.shop_id,
                    this.product.id,
                    file.id,
                  ),
            )
            .then(({ data }) => {
              if (
                product !== this.product ||
                content !== this.content ||
                shop !== this.shop
              )
                return;
              if (!data.error && data.success !== false) {
                NotificationService.showSuccessAlert(
                  null,
                  this.$t("product_file.notifications.delete_success"),
                );

                if (this.content) {
                  // 🎗️ Subscription content
                  this.DeleteItemByID(this.content.files, file.id);
                } else {
                  this.DeleteItemByID(this.product.files, file.id);
                }

                this.DeleteItemByID(this.files, file.id);

                if (data.capacity != null) this.shop.capacity = data.capacity;
                deleted = true;
              } else {
                NotificationService.showErrorAlert(
                  null,
                  data.error_msg ||
                    this.$t("global.notification.error_message"),
                );
              }
            })
            .catch((error) => {
              if (
                product !== this.product ||
                content !== this.content ||
                shop !== this.shop
              )
                return;
              NotificationService.showLaravelError(error);
            })
            .finally(async () => {
              if (this.busy_delete !== file) return;
              this.busy_delete = null;
              if (!deleted || typeof onDeleted !== "function") return;
              // Retry observes the released lock after the uploader receives its enabled prop.
              await this.$nextTick();
              if (
                product !== this.product ||
                content !== this.content ||
                shop !== this.shop ||
                this.busy_delete
              )
                return;
              onDeleted();
            });
        },
      );
    },
    getFileUrl(file) {
      return this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.VAPI.DOWNLOAD_MY_VENDOR_PRODUCT_FILE(
            this.product.vendor_id,
            this.product.id,
            file.id,
          )
        : window.API.DOWNLOAD_PRODUCT_FILE(
            this.product.shop_id,
            this.product.id,
            file.id,
          );
    },

    fetchFiles: throttle(function () {
      return this.fetchFilesNow();
    }, 3000),
    fetchFilesNow({ quiet = false, signal } = {}) {
      const sequence = ++this.file_fetch_sequence;
      this.busy_fetch = true;
      this.fetch_error = false;
      const product = this.product;
      const content = this.content;
      return axios
        .get(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.GET_MY_VENDOR_PRODUCT_FILES(
                this.product.vendor_id,
                this.product.id,
              )
            : window.API.GET_PRODUCT_FILES(
                this.product.shop_id,
                this.product.id,
              ),
          {
            signal,
            params: {
              content_id: this.content?.id, // 🎗️ Subscription  > This file is for a content?
            },
          },
        )
        .then(({ data }) => {
          if (this.product !== product || this.content !== content) return;
          if (sequence !== this.file_fetch_sequence)
            return data.error ? undefined : data.files;
          if (!data.error) {
            if (this.content) {
              // 🎗️ Subscription content
              this.content.files = data.files;
            } else {
              this.product.files = data.files;
            }
            return data.files;
          } else {
            this.fetch_error = true;
            if (!quiet)
              NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (
            this.product !== product ||
            this.content !== content ||
            sequence !== this.file_fetch_sequence
          )
            return;
          this.fetch_error = true;
          if (!quiet) NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (sequence === this.file_fetch_sequence) this.busy_fetch = null;
        });
    },

    setFileName(file, name, target) {
      if (file.name === name) return Promise.resolve(true);
      if (this.busy_name || this.uploading_array.includes(file.id))
        return Promise.resolve(false);

      this.busy_name = file.id;
      return axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_SET_PRODUCT_FILE_NAME(
                this.product.vendor_id,
                this.product.id,
                file.id,
              )
            : window.API.PUT_SET_PRODUCT_FILE_NAME(
                this.product.shop_id,
                this.product.id,
                file.id,
              ),
          {
            name: name,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.files, data.file);
            if (target) target.innerText = data.file.name; // Force update if file name corrected by server.
            NotificationService.showSuccessAlert(
              null,
              this.$t("product_file.modern.rename_success"),
            );
            return true;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
            return false;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
          return false;
        })
        .finally(() => {
          this.busy_name = null;
        });
    },

    //-------------------------------------------------------------------------------------------------
    changeFilesOrder() {
      if (this.busy_sort || (this.modern && this.file_sort_key)) return;
      const sort = [];
      this.files.forEach((f) => sort.push(f.id));
      // console.log("changeFilesOrder", sort);
      this.busy_sort = true;
      return axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_SET_PRODUCT_FILES_SORT(
                this.product.vendor_id,
                this.product.id,
              )
            : window.API.PUT_SET_PRODUCT_FILES_SORT(
                this.product.shop_id,
                this.product.id,
              ),
          {
            content_id: this.content?.id, // 🎗️ Subscription  > This file is for a content?
            sort: sort,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t("product_file.modern.sort_success"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_sort = null;
        });
    },

    //-------------------------------------------------------------------------------------------------
    setSample(file, sample) {
      if (
        this.content ||
        this.busy_sample ||
        this.uploading_array.includes(file.id)
      )
        return Promise.resolve(false);
      if (sample && file.size > 50 * 1024) {
        NotificationService.showErrorAlert(
          null,
          this.$t("product_file.modern.sample_too_large", { size: "50 MB" }),
        );
        return Promise.resolve(false);
      }
      if (!!file.sample === !!sample) return Promise.resolve(true);
      this.busy_sample = file.id;
      return axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_SET_PRODUCT_FILE_SAMPLE(
                this.product.vendor_id,
                this.product.id,
                file.id,
              )
            : window.API.PUT_SET_PRODUCT_FILE_SAMPLE(
                this.product.shop_id,
                this.product.id,
                file.id,
              ),
          {
            sample: sample,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.files, data.file);

            NotificationService.showSuccessAlert(
              null,
              this.$t("product_file.modern.access_success"),
            );
            return true;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
            return false;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
          return false;
        })
        .finally(() => {
          this.busy_sample = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-files {
  min-width: 0;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 13px;
  line-height: 22px;

  &__header {
    margin-block-end: 28px;
  }
  &__header .sd-modern-title {
    gap: 14px;
    font-weight: 500;
  }
  &__header .sd-modern-title-text {
    font-size: 23px;
    font-weight: 500;
    line-height: 32px;
  }
  &__header .sd-modern-subtitle {
    margin-block-start: 5px;
    font-size: 13px;
    line-height: 22px;
  }
  &__tools {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
    gap: 20px;
    align-items: stretch;
    margin-block-end: 20px;
  }
  &__tools:has(> :only-child) {
    grid-template-columns: minmax(0, 1fr);
  }
  .sd-modern-widget {
    padding: 24px;
    border: 0;
    border-radius: 20px;
    box-shadow: none;
  }
  &__section-title {
    display: flex;
    align-items: center;
    min-height: 28px;
    gap: 9px;
    min-width: 0;
  }
  &__section-title h2,
  &__list-title h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;
  }
  &__section-title > .v-icon {
    color: var(--sd-modern-muted);
  }
  &__muted {
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  &__upload {
    display: flex;
    flex-direction: column;
  }
  &__upload > :deep(.b-product-file-uploader) {
    flex: 1;
  }
  &__storage {
    display: flex;
    flex-direction: column;
  }
  &__storage :deep(.b-product-file-storage) {
    margin-block-start: 12px;
  }
  &__usage {
    margin-block: 18px 14px;
  }
  &__usage > span {
    display: inline-block;
    font-size: 29px;
    line-height: 36px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  &__usage > p {
    margin: 5px 0 0;
    font-size: 12px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  &__limits {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-block-start: 15px;
    font-size: 12px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  &__limits :deep(.s--value-dashed) {
    gap: 7px;
  }
  &__limits span[dir] {
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: rgb(var(--v-theme-on-surface));
  }
  &__list-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }
  &__access-guide {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding-block: 12px;
  }
  &__access-guide > div {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  &__access-guide > div > .v-icon {
    margin-block-start: 3px;
    color: var(--sd-modern-muted);
  }
  &__access-guide p {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin: 0;
    font-size: 12px;
    line-height: 21px;
  }
  &__access-guide strong {
    font-weight: 500;
  }
  &__access-guide p > span {
    color: var(--sd-modern-muted);
  }
  &__columns,
  &__row {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) 126px 80px 70px 112px;
    gap: 12px;
    align-items: center;
  }
  &__columns {
    padding: 6px 12px;
    border-block: 1px solid var(--sd-modern-border);
  }
  &__sort-tools {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    margin-block-end: 0;
  }
  &__mobile-sort,
  &__sort-direction {
    display: none;
  }
  &__sort-heading {
    display: inline-flex;
    letter-spacing: inherit;
    text-transform: inherit;
    align-items: center;
    gap: 4px;
    min-height: 32px;
    border: 0;
    padding-inline: 4px;
    margin-inline: -4px;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  &__sort-heading:focus-visible,
  &__sort-reset:focus-visible,
  &__sort-direction:focus-visible,
  &__mobile-sort select:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  &__row-boundary {
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__row {
    min-height: 56px;
    padding: 6px 12px;
    border-radius: 12px;
  }
  &__row:hover {
    background: var(--sd-modern-inset);
  }
  &__drag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 32px;
    border: 0;
    background: transparent;
    color: var(--sd-modern-muted);
    cursor: grab;
  }
  &__drag:disabled {
    cursor: default;
  }
  &__identity {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
  }
  &__identity > img {
    flex: 0 0 32px;
    object-fit: contain;
  }
  &__identity > div {
    min-width: 0;
  }
  &__name {
    display: block;
    max-width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 22px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: start;
    cursor: pointer;
  }
  &__dates {
    display: flex;
    flex-wrap: nowrap;
    gap: 0 10px;
    margin-block-start: 0;
    font-size: 11px;
    line-height: 18px;
    color: var(--sd-modern-muted);
  }
  &__dates > * {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__access-button.v-btn {
    min-width: 0;
    min-height: 32px;
    height: auto;
    padding: 5px 0;
    border-radius: 8px;
    font: inherit;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: normal;
    text-transform: none;
  }
  &__access-button :deep(.v-btn__content) {
    gap: 7px;
  }
  &__downloads,
  &__size {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    line-height: 20px;
    font-variant-numeric: tabular-nums;
  }
  &__downloads > .v-icon {
    color: var(--sd-modern-muted);
  }
  &__mobile-label {
    display: none;
  }
  &__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
  }
  &__footer.sd-modern-table-footer {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px 0;
    margin: 0;
    border: 0;
    font-size: 11px;
    line-height: 19px;
    color: var(--sd-modern-muted);
  }
  &__footer > span:first-child {
    display: flex;
    gap: 7px;
    align-items: center;
  }
  &__guest {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-block-start: 16px;
    padding-block-start: 16px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__guest > .v-icon {
    flex-shrink: 0;
    margin-block-start: 3px;
    color: var(--sd-modern-muted);
  }
  &__guest > p {
    flex: 1;
    margin: 0;
    font-size: 12px;
    line-height: 22px;
    color: var(--sd-modern-muted);
  }
  &__guest .sd-modern-button {
    flex-shrink: 0;
  }
  &__drag:focus-visible,
  &__name:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }

  @media (max-width: 950px), (pointer: coarse) {
    &__dates {
      flex-wrap: wrap;
    }
    &__sort-tools {
      margin-block: 4px 12px;
    }
    &__mobile-sort {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-inline-end: auto;
      min-width: 0;
    }
    &__mobile-sort > span {
      color: var(--sd-modern-muted);
      font-size: 11px;
    }
    &__mobile-sort select {
      min-width: 0;
      max-width: 150px;
      min-height: 44px;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
    }
    &__sort-direction {
      display: inline-flex;
    }
    &__sort-reset {
      min-height: 44px;
    }
  }
  @media (max-width: 950px) {
    &__columns {
      display: none;
    }
    &__row {
      grid-template-columns: 18px minmax(0, 1fr) 112px;
      gap: 8px 12px;
    }
    &__order {
      grid-column: 1;
      grid-row: 1 / 4;
      align-self: start;
    }
    &__identity {
      grid-column: 2;
      grid-row: 1;
    }
    &__access {
      grid-column: 2;
      grid-row: 2;
    }
    &__downloads {
      grid-column: 2;
      grid-row: 3;
    }
    &__size {
      grid-column: 3;
      grid-row: 3;
    }
    &__actions {
      grid-column: 3;
      grid-row: 1 / 3;
    }
    &__mobile-label {
      display: inline;
    }
  }
  @media (max-width: 700px) {
    &__tools {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }
    .sd-modern-widget {
      padding: 20px;
    }
    &__header .sd-modern-title-text {
      font-size: 21px;
      line-height: 28px;
    }
    &__access-guide {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    &__identity {
      grid-column: 2 / 4;
    }
    &__access {
      grid-column: 2 / 4;
    }
    &__downloads {
      grid-column: 2;
    }
    &__size {
      grid-column: 2;
      grid-row: 4;
    }
    &__actions {
      grid-row: 3 / 5;
    }
    &__guest {
      flex-wrap: wrap;
    }
    &__guest > p {
      flex-basis: 80%;
    }
    &__guest .sd-modern-button {
      margin-inline-start: 21px;
    }
  }
  @media (max-width: 440px), (pointer: coarse) {
    &__columns {
      display: none;
    }
    &__mobile-label {
      display: inline;
    }
    &__row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 8px;
      padding-inline: 12px;
    }
    &__identity {
      flex: 1 1 calc(100% - 52px);
    }
    &__access,
    &__downloads,
    &__size,
    &__actions {
      flex: 0 0 auto;
      max-width: 100%;
    }
    &__access:empty {
      display: none;
    }
    &__actions {
      margin-inline-start: auto;
    }
    &__drag {
      width: 44px;
      height: 44px;
    }
    &__order {
      flex: 0 0 44px;
      align-self: flex-start;
    }
    &__access-button.v-btn,
    &__name {
      min-height: 44px;
    }
    &__actions .sd-modern-icon-button {
      width: 44px;
      height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :deep(.flip-list-move) {
      transition: none;
    }
  }
}
.b-product-files-dialog {
  padding: 24px !important;
  border-radius: 20px !important;
  h2 {
    margin: 0;
    font-size: 15px;
    line-height: 24px;
    font-weight: 500;
  }
  .b-product-files__dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-block-start: 24px;
    flex-wrap: wrap;
  }
  .b-product-files__dialog-filename {
    overflow-wrap: anywhere;
  }
  .b-product-files__extension {
    font-size: 14px;
    line-height: 24px;
    white-space: nowrap;
  }
}
</style>
