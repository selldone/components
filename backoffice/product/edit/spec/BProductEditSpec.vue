<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <div v-bind="$attrs" :class="{ 'b-product-edit-spec--modern text-start': modern, 'b-product-edit-spec--expanded': modern && expanded }">
    <!-- ████████████████████ Spec Fields ████████████████████ -->

    <template v-if="modern">
      <section class="b-product-edit-spec__header sd-modern-widget">
        <div class="b-product-edit-spec__heading">
          <b-product-edit-info-icon name="ListTree" />
          <h2>{{ $t('add_product.spec_modern.title') }}</h2>
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t(expanded ? 'add_product.spec_modern.restore' : 'add_product.spec_modern.expand')" :aria-pressed="expanded" @click="expanded = !expanded">
            <b-product-edit-info-icon :name="expanded ? 'Minimize2' : 'Maximize2'" :size="16" />
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t(expanded ? 'add_product.spec_modern.restore' : 'add_product.spec_modern.expand') }}</v-tooltip>
          </v-btn>
        </div>
        <div class="b-product-edit-spec__intro">
          <p>{{ $t('add_product.spec_modern.subtitle') }}</p>
          <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="$t('add_product.spec_modern.about')">
            <b-product-edit-info-icon name="Info" :size="16" />
            <v-tooltip activator="parent" location="top" :open-on-click="true" content-class="sd-modern-tooltip text-start">{{ $t('add_product.spec_modern.help') }}</v-tooltip>
          </v-btn>
        </div>
        <div v-if="!add_by_dropShipping" class="b-product-edit-spec__toolbar">
          <u-smart-toggle v-model="autoSave" class="b-product-edit-spec__autosave" accessible false-gray color="primary" :disabled="busy" :true-title="$t('add_product.spec_modern.auto_save')" :false-title="$t('add_product.spec_modern.auto_save')" :true-description="$t('add_product.spec_modern.auto_help')" :false-description="$t('add_product.spec_modern.manual_help')" />
          <v-btn class="sd-modern-button sd-modern-button--inline" variant="text" color="primary" :disabled="busy || !spec.length" @click="$refs.specTable.showOrderDialog()">
            <template #prepend><b-product-edit-info-icon name="ArrowDownUp" :size="16" /></template>
            {{ $t('add_product.spec_modern.arrange') }}
          </v-btn>
        </div>
        <p v-else class="b-product-edit-spec__readonly" role="note"><b-product-edit-info-icon name="Info" :size="16" />{{ $t('add_product.spec_modern.read_only') }}</p>
      </section>

      <u-product-spec-table ref="specTable" :spec="spec" modern :editable="!add_by_dropShipping" :read-only="add_by_dropShipping" :auto-save="autoSave" @save="saveSpec(false)" @update="list => spec = list" @click-delete="deleteItemSpec" />

      <template v-if="!add_by_dropShipping">
        <div class="b-product-edit-spec__add-actions">
          <v-btn class="sd-modern-button" variant="outlined" :disabled="busy" @click="dialog_add_spec = true">
            <template #prepend><b-product-edit-info-icon name="Plus" :size="16" /></template>
            {{ $t('add_product.spec_modern.add_spec') }}
          </v-btn>
          <v-btn class="sd-modern-button sd-modern-button--inline" variant="text" color="primary" :disabled="busy" @click="dialog_add_group = true">
            <template #prepend><b-product-edit-info-icon name="FolderPlus" :size="16" /></template>
            {{ $t('add_product.spec_modern.add_group') }}
          </v-btn>
        </div>

        <details class="b-product-edit-spec__tools sd-modern-widget sd-modern-disclosure">
          <summary class="sd-modern-disclosure__summary">
            <b-product-edit-info-icon name="WandSparkles" />
            <span class="b-product-edit-spec__summary-copy"><span class="b-product-edit-spec__summary-title">{{ $t('add_product.spec_modern.tools') }}</span><span class="b-product-edit-spec__digest">{{ $t('add_product.spec_modern.tools_digest') }}</span></span>
            <b-product-edit-info-icon name="ChevronDown" :size="16" class="b-product-edit-spec__chevron" />
          </summary>
          <div class="b-product-edit-spec__tools-body">
            <div class="b-product-edit-spec__tool">
              <b-product-edit-info-icon name="Copy" />
              <div><h3>{{ $t('add_product.spec_modern.import_title') }}</h3><p>{{ $t('add_product.spec_modern.import_intro') }}</p></div>
              <v-btn class="sd-modern-button" variant="outlined" :disabled="busy" @click="openImport">{{ $t('global.commons.import') }}</v-btn>
            </div>
            <div class="b-product-edit-spec__tool">
              <b-product-edit-info-icon name="Sparkles" />
              <div><h3>{{ $t('add_product.spec_modern.ai_title') }}</h3><p>{{ $t('add_product.spec_modern.ai_intro') }}</p></div>
              <v-btn class="sd-modern-button" variant="outlined" :disabled="busy" @click="openAI">{{ $t('add_product.spec_modern.generate') }}</v-btn>
            </div>
          </div>
        </details>
      </template>

      <footer v-if="!externalActionButtons" class="b-product-edit-spec__footer">
        <p role="status" aria-live="polite"><b-product-edit-info-icon :name="specHasChanges ? 'Circle' : 'CircleCheck'" :size="16" /><span>{{ $t(specHasChanges ? 'add_product.spec_modern.dirty' : 'add_product.spec_modern.clean') }}</span></p>
        <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :loading="busy" :disabled="busy || specDialogOpen" @click="saveSpec(true)" v-ctrl.s="() => saveSpec(true)" aria-keyshortcuts="Control+s">
          <template v-if="!add_by_dropShipping" #prepend><b-product-edit-info-icon name="Save" :size="16" /></template>
          {{ $t(add_by_dropShipping ? 'global.actions.next' : 'global.actions.save_continue') }}
          <template #append><b-product-edit-info-icon name="ArrowRight" :size="16" /></template>
        </v-btn>
      </footer>
    </template>

    <div v-else :class="{ '-large': expanded }" class="widget-box mb-5 mt-5">
      <u-widget-header
        :title="$t('add_product.edit_spec.title')"
        icon="summarize"
      >
      </u-widget-header>
      <v-list-subheader>
        {{ $t("add_product.edit_spec.subtitle") }}
      </v-list-subheader>
      <u-product-spec-table
        :class="{ disabled: add_by_dropShipping }"
        :spec="spec"
        class="max-width-container-1280px my-8"
        editable
        v-model:autoSave="autoSave"
        @save="
          () => {
            saveSpec(false);
          }
        "
        @update="
          (list) => {
            spec = list;
          }
        "
        @click-delete="deleteItemSpec"
      />

      <v-btn
        class="absolute-top-end"
        icon
        variant="text"
        @click="expanded = !expanded"
      >
        <v-icon :class="{ 'rotate-180': expanded }" size="small">
          {{ expanded ? "close_fullscreen" : "open_in_full" }}
        </v-icon>
      </v-btn>

      <template v-if="!add_by_dropShipping">
        <u-widget-header
          :title="$t('add_product.edit_spec.manual.title')"
          icon="format_list_bulleted_add"
        ></u-widget-header>
        <v-list-subheader>
          {{ $t("add_product.edit_spec.manual.subtitle") }}
        </v-list-subheader>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Add Group ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-bottom-sheet
          v-model="dialog_add_group"
          content-class="rounded-t-xl"
          max-width="98vw"
          width="640"
        >
          <template v-slot:activator="{ props }">
            <v-sheet class="widget-buttons pa-1 rounded-18px" color="#fff">
              <v-btn
                color="#fafafa"
                size="x-large"
                v-bind="props"
                variant="elevated"
                elevation="3"
              >
                <v-icon start>create_new_folder</v-icon>

                <div>
                  <div>
                    {{ $t("add_product.edit_spec.manual.add_group_action") }}
                  </div>
                  <div
                    class="d-flex align-center justify-content-around mt-1 min-width-150"
                  >
                    <div
                      class="bg-amber rounded-lg mt-1"
                      style="height: 4px; width: 90%"
                    ></div>
                  </div>
                </div>
              </v-btn>
            </v-sheet>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card
              :title="$t('add_product.edit_spec.group_input_header')"
              class="text-start"
              prepend-icon="create_new_folder"
              rounded="t-xl"
            >
              <v-card-text>
                <v-text-field
                  v-model="group_title"
                  :label="$t('add_product.edit_spec.group_input')"
                  :placeholder="$t('add_product.edit_spec.group_input_message')"
                  color="#ffa000"
                  variant="underlined"
                  @keypress.enter.stop="addGroup"
                />
                <u-smart-suggestion
                  :samples="$tm('suggestions.spec.group')"
                  @select="(v) => (group_title = v)"
                ></u-smart-suggestion>
              </v-card-text>

              <v-card-actions>
                <div class="widget-buttons">
                  <v-btn size="x-large" @click="isActive.value = false">
                    <v-icon start>close</v-icon>
                    {{ $t("global.actions.close") }}
                  </v-btn>
                  <v-btn
                    :class="{ disabled: !group_title }"
                    color="primary"
                    size="x-large"
                    variant="elevated"
                    @click="addGroup"
                  >
                    <v-icon start>add</v-icon>
                    {{ $t("add_product.edit_spec.group_add_action") }}
                  </v-btn>
                </div>
              </v-card-actions>
            </v-card>
          </template>
        </v-bottom-sheet>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Add Item ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-bottom-sheet
          v-model="dialog_add_spec"
          content-class="rounded-t-xl"
          max-width="98vw"
          width="640"
        >
          <template v-slot:activator="{ props }">
            <v-sheet class="widget-buttons pa-1 rounded-18px mt-2" color="#fff">
              <v-btn
                color="#fafafa"
                size="x-large"
                v-bind="props"
                variant="elevated"
                elevation="3"
              >
                <v-icon start>post_add</v-icon>
                <div>
                  <div>
                    {{ $t("add_product.edit_spec.manual.add_item_action") }}
                  </div>
                  <div
                    class="d-flex align-center justify-content-around mt-1 min-width-150"
                  >
                    <div
                      class="bg-blue rounded-lg mt-1"
                      style="height: 4px; width: 30%"
                    ></div>
                    <div
                      class="bg-blue rounded-lg mt-1"
                      style="height: 4px; width: 60%"
                    ></div>
                  </div>
                </div>
              </v-btn>
            </v-sheet>
          </template>
          <template v-slot:default="{ isActive }">
            <v-card
              :title="$t('add_product.edit_spec.item_title_header')"
              class="text-start"
              prepend-icon="post_add"
              rounded="t-xl"
            >
              <v-card-text>
                <v-text-field
                  v-model="item_title"
                  :label="$t('add_product.edit_spec.item_title_input')"
                  :placeholder="
                    $t('add_product.edit_spec.item_title_input_message')
                  "
                  color="#673ab7"
                  variant="underlined"
                />

                <v-text-field
                  v-model="item_value"
                  :label="$t('add_product.edit_spec.item_value_input')"
                  :placeholder="
                    $t('add_product.edit_spec.item_value_input_message')
                  "
                  color="#673ab7"
                  variant="underlined"
                  @keypress.enter.stop="addSpec"
                />
              </v-card-text>
              <v-card-actions>
                <div class="widget-buttons">
                  <v-btn size="x-large" @click="isActive.value = false">
                    <v-icon start>close</v-icon>
                    {{ $t("global.actions.close") }}
                  </v-btn>

                  <v-btn
                    :class="{ disabled: !item_title || !item_value }"
                    color="primary"
                    size="x-large"
                    variant="elevated"
                    @click="addSpec"
                  >
                    <v-icon start>add</v-icon>
                    {{ $t("add_product.edit_spec.add_item_action") }}
                  </v-btn>
                </div>
              </v-card-actions>
            </v-card>
          </template>
        </v-bottom-sheet>

        <!-- ████████████████████ Import ████████████████████ -->

        <div class="dashed-hr my-2 mx-n5"></div>
        <u-widget-header
          :title="$t('global.commons.import')"
          icon="save_alt"
        ></u-widget-header>
        <v-list-subheader>
          {{ $t("add_product.edit_spec.import.subtitle") }}
        </v-list-subheader>

        <v-sheet class="widget-buttons pa-1 rounded-18px" color="#fff">
          <v-btn
            color="#fafafa"
            size="x-large"
            variant="elevated"
            elevation="3"
            @click="dialog_import = true"
          >
            <v-icon start> download</v-icon>

            <div>
              {{ $t("add_product.edit_spec.import.action_title") }}

              <div class="small mt-1">
                {{ $t("add_product.edit_spec.import.action_subtitle") }}
              </div>
            </div>
          </v-btn>
        </v-sheet>

        <!-- ████████████████████ AI ████████████████████ -->

        <div class="dashed-hr my-2 mx-n5"></div>

        <u-widget-header
          :title="$t('add_product.edit_spec.ai.title')"
          icon="auto_fix_high"
        ></u-widget-header>

        <v-list-subheader>
          {{ $t("add_product.edit_spec.ai.subtitle") }}
        </v-list-subheader>

        <u-button-ai-large
          :sub-title="$t('add_product.edit_spec.ai.action_subtitle')"
          :title="$t('add_product.edit_spec.ai.action_title')"
          @select="
            dialog_ai = true;
            prompt = null;
          "
        >
        </u-button-ai-large>
      </template>
    </div>

    <!-- ████████████████████ Actions ████████████████████ -->

    <s-widget-buttons v-if="!modern && !externalActionButtons" auto-fixed-position>
      <v-btn
        :loading="busy"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="saveSpec(true)"
        v-ctrl.s="()=>{saveSpec(true)}"
      >
        {{
          add_by_dropShipping
            ? $t("global.actions.next")
            : $t("global.actions.save_continue")
        }}

        <v-icon end>
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </s-widget-buttons>
  </div>

  <v-dialog v-if="modern" v-model="dialog_add_group" max-width="610" scrollable :aria-label="$t('add_product.spec_modern.add_group')">
    <v-card class="b-product-edit-spec__dialog sd-modern-widget sd-modern-underlined-field text-start">
      <v-card-title class="b-product-edit-spec__dialog-heading"><h2>{{ $t('add_product.spec_modern.add_group') }}</h2><v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="dialog_add_group = false"><b-product-edit-info-icon name="X" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip></v-btn></v-card-title>
      <v-card-text>
        <p class="b-product-edit-spec__dialog-intro">{{ $t('add_product.spec_modern.group_help') }}</p>
        <v-text-field v-model="group_title" :disabled="busy || add_by_dropShipping" :label="$t('add_product.edit_spec.group_input')" :placeholder="$t('add_product.edit_spec.group_input_message')" variant="underlined" @keydown.enter.stop.prevent="addGroup" />
        <u-smart-suggestion :samples="$tm('suggestions.spec.group')" @select="v => group_title = v" />
      </v-card-text>
      <v-card-actions><v-spacer /><v-btn class="sd-modern-button" variant="outlined" @click="dialog_add_group = false">{{ $t('global.actions.cancel') }}</v-btn><v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :disabled="!group_title || busy || add_by_dropShipping" @click="addGroup"><template #prepend><b-product-edit-info-icon name="Plus" :size="16" /></template>{{ $t('add_product.spec_modern.add_group') }}</v-btn></v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-if="modern" v-model="dialog_add_spec" max-width="610" scrollable :aria-label="$t('add_product.spec_modern.add_spec')">
    <v-card class="b-product-edit-spec__dialog sd-modern-widget sd-modern-underlined-field text-start">
      <v-card-title class="b-product-edit-spec__dialog-heading"><h2>{{ $t('add_product.spec_modern.add_spec') }}</h2><v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="dialog_add_spec = false"><b-product-edit-info-icon name="X" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip></v-btn></v-card-title>
      <v-card-text>
        <p class="b-product-edit-spec__dialog-intro">{{ $t('add_product.spec_modern.add_help') }}</p>
        <v-text-field v-model="item_title" :disabled="busy || add_by_dropShipping" :label="$t('add_product.edit_spec.item_title_input')" :placeholder="$t('add_product.edit_spec.item_title_input_message')" variant="underlined" />
        <v-text-field v-model="item_value" :disabled="busy || add_by_dropShipping" :label="$t('add_product.edit_spec.item_value_input')" :placeholder="$t('add_product.edit_spec.item_value_input_message')" variant="underlined" @keydown.enter.stop.prevent="addSpec" />
      </v-card-text>
      <v-card-actions><v-spacer /><v-btn class="sd-modern-button" variant="outlined" @click="dialog_add_spec = false">{{ $t('global.actions.cancel') }}</v-btn><v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :disabled="!item_title || !item_value || busy || add_by_dropShipping" @click="addSpec"><template #prepend><b-product-edit-info-icon name="Plus" :size="16" /></template>{{ $t('add_product.spec_modern.add_spec') }}</v-btn></v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ████████████████████ Dialog > Import Spec ████████████████████ -->

  <v-dialog v-if="modern" v-model="dialog_import" max-width="1100" scrollable :aria-label="$t('add_product.spec_import.title')">
    <v-card class="b-product-edit-spec__import-dialog b-product-edit-spec__overlay sd-modern-widget text-start" :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'">
      <header class="b-product-edit-spec__import-header">
        <b-product-edit-info-icon name="Copy" />
        <div><h2>{{ $t('add_product.spec_import.title') }}</h2><p>{{ $t('add_product.spec_import.subtitle') }}</p></div>
        <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="closeImport">
          <b-product-edit-info-icon name="X" :size="16" />
          <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
        </v-btn>
      </header>
      <nav class="b-product-edit-spec__import-steps" :aria-label="$t('add_product.spec_import.steps')">
        <span :aria-current="import_step === 'browse' ? 'step' : undefined"><b>1</b>{{ $t('add_product.spec_import.choose') }}</span>
        <b-product-edit-info-icon name="ChevronRight" :size="13" class="b-product-edit-spec__direction" />
        <span :aria-current="import_step === 'review' ? 'step' : undefined"><b>2</b>{{ $t('add_product.spec_import.review') }}</span>
      </nav>
      <v-card-text ref="importBody" class="b-product-edit-spec__import-body sd-modern-canvas">
        <!-- Keep the picker mounted so Back retains its directory, filters and both pages. -->
        <div v-show="import_step === 'browse'" class="b-product-edit-spec__import-browse">
          <b-products-window
            v-if="dialog_import"
            ref="importPicker"
            :hash="$route.hash"
            :shop="shop"
            :vendor="product.vendor"
            :selected-list="product_selected ? [product_selected.id] : []"
            modern compact-mode dialog-mode select-mode set="spec"
            @select="selectProduct"
          />
        </div>
        <section v-if="product_selected" v-show="import_step === 'review'" class="b-product-edit-spec__import-review">
          <v-btn ref="importBack" class="sd-modern-button sd-modern-button--inline b-product-edit-spec__import-back" variant="text" @click="backToImportProducts">
            <template #prepend><b-product-edit-info-icon name="ArrowLeft" :size="16" class="b-product-edit-spec__direction" /></template>
            {{ $t('add_product.spec_import.back') }}
          </v-btn>
          <div class="b-product-edit-spec__import-source">
            <v-avatar rounded size="50" class="hover-scale-small">
              <v-img :src="product_selected.icon ? getShopImagePath(product_selected.icon, IMAGE_SIZE_SMALL) : ProductType[product_selected.type]?.image" :alt="product_selected.title" />
            </v-avatar>
            <div>
              <p class="sd-modern-list-header">{{ $t('add_product.spec_import.source') }}</p>
              <h3>{{ product_selected.title }}</h3>
              <div class="b-product-edit-spec__import-source-meta">
                <bdi>P{{ product_selected.id }}</bdi><span aria-hidden="true">·</span>
                <span>{{ $t(ProductType[product_selected.type]?.name) }}</span>
                <template v-if="importSourceStatus"><span aria-hidden="true">·</span><span class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot" :class="{
                  'sd-modern-status__dot--success': importSourceStatus.code === ProductStatus.Open.code,
                  'sd-modern-status__dot--error': importSourceStatus.code === ProductStatus.Close.code || importSourceStatus.code === ProductStatus.Rejected.code,
                  'sd-modern-status__dot--warning': importSourceStatus.code === ProductStatus.Pending.code,
                }" />{{ $t(importSourceStatus.name) }}</span></template>
              </div>
            </div>
          </div>
          <div v-if="busy_find" class="b-product-edit-spec__import-state sd-modern-empty-state" role="status" aria-live="polite">
            <v-progress-circular indeterminate size="24" width="2" />
            <h3>{{ $t('add_product.spec_import.loading') }}</h3><p>{{ $t('add_product.spec_import.loading_help') }}</p>
          </div>
          <div v-else-if="import_error" class="b-product-edit-spec__import-state sd-modern-empty-state" role="alert">
            <b-product-edit-info-icon name="CircleAlert" :size="25" />
            <h3>{{ $t('add_product.spec_import.error_title') }}</h3><p>{{ $t('add_product.spec_import.error_help') }}</p>
            <v-btn class="sd-modern-button" variant="outlined" @click="getSpecProduct(`P${product_selected.id}`)"><template #prepend><b-product-edit-info-icon name="RotateCcw" :size="16" /></template>{{ $t('add_product.spec_import.retry') }}</v-btn>
          </div>
          <template v-else-if="Array.isArray(spec_selected)">
            <template v-if="spec_selected.length">
              <div class="b-product-edit-spec__import-preview-heading"><h3>{{ $t('add_product.spec_import.preview') }}</h3><span>{{ $t('add_product.spec_import.summary', { groups: importSummary.groups, count: importSummary.properties }) }}</span></div>
              <section v-for="(group, index) in importGroups" :key="index" class="b-product-edit-spec__import-group sd-modern-widget">
                <h3><b-product-edit-info-icon name="FolderTree" :size="16" />{{ group.title }}</h3>
                <dl><div v-for="(item, itemIndex) in group.items" :key="itemIndex" class="b-product-edit-spec__import-pair"><dt>{{ item[0] }}</dt><dd><span v-for="(value, valueIndex) in item.slice(1)" :key="valueIndex">{{ value }}</span></dd></div></dl>
              </section>
            </template>
            <div v-else class="b-product-edit-spec__import-state sd-modern-empty-state"><b-product-edit-info-icon name="FileX2" :size="25" /><h3>{{ $t('add_product.spec_import.source_empty_title') }}</h3><p>{{ $t('add_product.spec_import.source_empty_help') }}</p></div>
            <div class="b-product-edit-spec__import-notice" role="note"><b-product-edit-info-icon name="ReplaceAll" :size="17" /><div><strong>{{ $t(spec_selected.length ? 'add_product.spec_import.replace_title' : 'add_product.spec_import.clear_title') }}</strong><p>{{ $t(spec_selected.length ? 'add_product.spec_import.replace_help' : 'add_product.spec_import.clear_help') }}</p></div></div>
          </template>
        </section>
      </v-card-text>
      <v-card-actions class="b-product-edit-spec__import-footer">
        <p><b-product-edit-info-icon name="Info" :size="14" /><span>{{ $t(import_step === 'browse' ? 'add_product.spec_import.browse_note' : 'add_product.spec_import.review_note') }}</span></p>
        <div class="b-product-edit-spec__dialog-actions">
          <v-btn class="sd-modern-button" variant="outlined" @click="closeImport">{{ $t('global.actions.cancel') }}</v-btn>
          <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :disabled="!importReady" @click="replaceImportedSpec"><template #prepend><b-product-edit-info-icon name="Copy" :size="16" /></template>{{ $t('add_product.spec_modern.replace') }}</v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-else
    v-model="dialog_import"
    :fullscreen="!modern"
    :max-width="modern ? 1100 : undefined"
    scrollable
    transition="dialog-bottom-transition"
    :aria-label="modern ? $t('add_product.edit_spec.dialog.title') : undefined"
  >
    <v-card :class="{ 'b-product-edit-spec__import-dialog b-product-edit-spec__overlay sd-modern-widget sd-modern-underlined-field text-start': modern }">
      <v-card-title class="d-flex align-center">
        <b-product-edit-info-icon v-if="modern" name="Copy" class="me-2" />
        <v-icon v-else class="me-1" color="#333">save_alt</v-icon>
        {{ $t("add_product.edit_spec.dialog.title") }}

        <v-spacer></v-spacer>
        <v-btn icon variant="text" :class="{ 'sd-modern-icon-button': modern }" :aria-label="$t('global.actions.close')" @click="dialog_import = false">
          <b-product-edit-info-icon v-if="modern" name="X" :size="16" />
          <v-icon v-else>close</v-icon>
          <v-tooltip v-if="modern" activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <u-loading-progress v-if="busy || busy_find"></u-loading-progress>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Dialog Wizard > Select product ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-container class="mx-auto min-height-50vh" style="max-width: 1720px">
          <b-products-window
            v-if="dialog_import"
            :hash="$route.hash"
            :shop="shop"
            :vendor="product.vendor"
            :modern="modern"
            compact-mode
            dialog-mode
            set="spec"
            @select="selectProduct"
          />
        </v-container>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Dialog Wizard > Selected product info  (spec) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-expand-transition>
          <div v-if="spec_selected">
            <div :class="modern ? 'b-product-edit-spec__preview' : 'widget-box -large mb-5'">
              <template v-if="modern"><h2>{{ $t('add_product.edit_spec.dialog.spec_view_title') }}</h2><p class="b-product-edit-spec__dialog-intro">{{ $t('add_product.spec_modern.replace_help') }}</p><p v-if="!spec_selected.length" class="b-product-edit-spec__dialog-intro" role="note">{{ $t('add_product.spec_modern.source_empty') }}</p></template>
              <u-widget-header
                v-else
                :title="$t('add_product.edit_spec.dialog.spec_view_title')"
                icon="info_outline"
              >
              </u-widget-header>
              <v-list-subheader v-if="!modern">
                {{ $t("add_product.edit_spec.dialog.spec_view_subtitle") }}
              </v-list-subheader>

              <u-product-spec-table
                :spec="spec_selected"
                :modern="modern"
                read-only
                class="min-height-10vh"
              ></u-product-spec-table>
            </div>
          </div>
        </v-expand-transition>
      </v-card-text>

      <v-card-actions>
        <div :class="modern ? 'b-product-edit-spec__dialog-actions' : 'widget-buttons'">
          <v-btn :size="modern ? undefined : 'x-large'" :class="{ 'sd-modern-button': modern }" :variant="modern ? 'outlined' : 'text'" @click="dialog_import = false">
            <v-icon v-if="!modern" start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            :class="{ disabled: !spec_selected, 'sd-modern-button sd-modern-button--primary': modern }"
            :disabled="modern && (!spec_selected || busy_find || add_by_dropShipping)"
            :loading="modern && busy_find"
            color="primary"
            variant="elevated"
            :size="modern ? undefined : 'x-large'"
            @click="
              () => {
                safeSetSpec(spec_selected);
                dialog_import = false;
              }
            "
            :prepend-icon="modern ? undefined : 'copy_all'"
          >
            <template v-if="modern" #prepend><b-product-edit-info-icon name="Copy" :size="16" /></template>
            {{ $t(modern ? 'add_product.spec_modern.replace' : 'add_product.edit_spec.dialog.set_spec_action') }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ████████████████████ Dialog > AI ████████████████████ -->

  <v-dialog
    v-model="dialog_ai"
    :fullscreen="!modern"
    :max-width="modern ? 760 : undefined"
    scrollable
    transition="dialog-bottom-transition"
    :aria-label="modern ? $t('add_product.edit_spec.dialog_ai.title') : undefined"
  >
    <v-card :class="{ 'b-product-edit-spec__ai-dialog b-product-edit-spec__overlay sd-modern-widget sd-modern-underlined-field text-start': modern }">
      <v-card-title class="d-flex align-center">
        <b-product-edit-info-icon v-if="modern" name="Sparkles" class="me-2" />
        <v-icon v-else class="me-1" color="#333">auto_fix_high</v-icon>
        {{ $t("add_product.edit_spec.dialog_ai.title") }}
        <template v-if="modern"><v-spacer /><v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="dialog_ai = false"><b-product-edit-info-icon name="X" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip></v-btn></template>
      </v-card-title>

      <v-card-text>
        <u-loading-progress v-if="busy || busy_find"></u-loading-progress>

        <div :class="modern ? 'b-product-edit-spec__ai-prompt sd-modern-widget' : 'widget-box -large mb-5'">
          <div v-if="modern" class="b-product-edit-spec__ai-heading"><h2>{{ $t('add_product.edit_spec.dialog_ai.prompt.title') }}</h2><v-locale-provider :rtl="false"><b-ai-model-input v-model="ai_model" background-color="transparent" flat hide-details single-line variant="plain" /></v-locale-provider></div>
          <u-widget-header
            v-else
            icon="mode_comment"
            :title="$t('add_product.edit_spec.dialog_ai.prompt.title')"
          >
            <template v-slot:actions>
              <v-locale-provider :rtl="false">
                <b-ai-model-input
                  v-model="ai_model"
                  background-color="transparent"
                  class="max-w-300"
                  flat
                  hide-details
                  label="label"
                  single-line
                  variant="plain"
                >
                </b-ai-model-input>
              </v-locale-provider>
            </template>
          </u-widget-header>

          <p v-if="modern" class="b-product-edit-spec__dialog-intro">{{ $t('add_product.spec_modern.ai_help') }}</p>
          <p v-if="modern" class="b-product-edit-spec__dialog-intro">{{ $t('add_product.spec_modern.auto_context') }}</p>
          <v-list-subheader v-else>
            {{ $t("add_product.edit_spec.dialog_ai.prompt.subtitle") }}
          </v-list-subheader>

          <v-textarea
            v-model="prompt"
            :disabled="modern && (busy_ai || add_by_dropShipping)"
            :counter="1024"
            class="my-5"
            :label="$t('add_product.edit_spec.dialog_ai.inputs.prompt.label')"
            persistent-placeholder
            :placeholder="
              modern ? $t('add_product.edit_spec.dialog_ai.inputs.prompt.placeholder') : $t('add_product.edit_spec.dialog_ai.inputs.prompt.placeholder')+`

✅ We auto use product information to generate spec: ${article_body}`
            "
            variant="underlined"

          ></v-textarea>

          <p v-if="modern" class="b-product-edit-spec__quota" role="note"><b-product-edit-info-icon name="Info" :size="16" />{{ $t('add_product.spec_modern.quota') }}</p>
          <v-btn v-if="modern" class="sd-modern-button" variant="outlined" :loading="busy_ai" :disabled="busy_ai || add_by_dropShipping" @click="autoGenerateAI"><template #prepend><b-product-edit-info-icon name="Sparkles" :size="16" /></template>{{ $t('add_product.edit_spec.dialog_ai.actions.run.title') }}</v-btn>
          <u-button-ai-large
            v-else
            :loading="busy_ai"
            :sub-title="
              $t('add_product.edit_spec.dialog_ai.actions.run.subtitle')
            "
            :title="$t('add_product.edit_spec.dialog_ai.actions.run.title')"
            @select="autoGenerateAI"
          >
          </u-button-ai-large>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Dialog Wizard > Selected product info  (spec) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-expand-transition>
          <div v-if="spec_generated">
            <div :class="modern ? 'b-product-edit-spec__preview' : 'widget-box -large mb-5'">
              <template v-if="modern"><h2>{{ $t('add_product.edit_spec.dialog_ai.generated_spec.title') }}</h2><p class="b-product-edit-spec__dialog-intro">{{ $t('add_product.spec_modern.replace_help') }}</p></template>
              <u-widget-header
                v-else
                icon="info_outline"
                :title="
                  $t('add_product.edit_spec.dialog_ai.generated_spec.title')
                "
              >
              </u-widget-header>
              <v-list-subheader v-if="!modern">
                {{
                  $t("add_product.edit_spec.dialog_ai.generated_spec.subtitle")
                }}
              </v-list-subheader>

              <u-product-spec-table
                :spec="spec_generated"
                :modern="modern"
                read-only
                class="min-height-10vh"
              ></u-product-spec-table>
            </div>
          </div>
        </v-expand-transition>
      </v-card-text>

      <v-card-actions>
        <div :class="modern ? 'b-product-edit-spec__dialog-actions' : 'widget-buttons'">
          <v-btn :size="modern ? undefined : 'x-large'" :class="{ 'sd-modern-button': modern }" variant="outlined" @click="dialog_ai = false">
            <v-icon v-if="!modern" start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            :class="{ disabled: !spec_generated, 'sd-modern-button sd-modern-button--primary': modern }"
            :disabled="modern && (!spec_generated || busy_ai || add_by_dropShipping)"
            color="primary"
            :size="modern ? undefined : 'x-large'"
            variant="elevated"
            @click="
              () => {
                if (modern && (busy_ai || add_by_dropShipping)) return;
                safeSetSpec(spec_generated);
                dialog_ai = false;
              }
            "
            v-ctrl.s=" () => {
                if (dialog_ai && spec_generated && (!modern || (!busy_ai && !add_by_dropShipping))) {
                  safeSetSpec(spec_generated);
                  dialog_ai = false;
                }
              }"
          >
            <b-product-edit-info-icon v-if="modern" name="Copy" :size="16" class="me-2" />
            <v-icon v-else class="me-1">copy_all</v-icon>
            {{
              $t(modern ? 'add_product.spec_modern.replace' : 'add_product.edit_spec.dialog_ai.actions.add_generated_spec')
            }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import UProductSpecTable from "../../../../ui/product/spec/table/UProductSpecTable.vue";
import BProductsWindow from "../../../product/window/BProductsWindow.vue";
import { SpecHelper } from "@selldone/core-js/helper/product/SpecHelper";
import BAiModelInput from "../../../../backoffice/ai/model/input/BAiModelInput.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";
import UButtonAiLarge from "../../../../ui/button/ai/large/UButtonAiLarge.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";
import {StripTags} from "@selldone/core-js/helper/index";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import BProductEditInfoIcon from "../info/BProductEditInfoIcon.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default {
  name: "BProductEditSpec",
  mixins:[],
  components: {
    USmartToggle,
    BProductEditInfoIcon,
    SWidgetButtons,
    UButtonAiLarge,
    USmartSuggestion,
    BAiModelInput,
    BProductsWindow,
    UProductSpecTable,
  },
  props: {
    modern: {
      type: Boolean,
      default: false,
    },
    externalActionButtons: {
      type: Boolean,
      default: false,
    },
    product: {
      required: true,
      type: Object,
    },
    shop: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    ProductStatus,
    ProductType,
    dialog_select_rating: false,
    dialog_add_group: false,
    dialog_add_spec: false,

    busy: false,

    spec: [],
    // spec_order:[],

    item_title: "",
    item_value: "",

    group_title: "",
    //------------
    dialog_import: false,
    import_step: "browse",
    import_error: false,
    import_browse_scroll: 0,

    product_selected: null,
    spec_selected: null,

    search_product_code: null,

    busy_find: false,
    spec_request_id: 0,

    expanded: false,
    //---------------
    dialog_ai: false,
    ai_model: "chatgpt",
    prompt: null,
    busy_ai: false,
    spec_generated: null,

    autoSave: false,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },

    specHasChanges() {
      if (this.add_by_dropShipping) return false;
      const draft = SpecHelper.CONVERT_SPEC_ARRAY_TO_JSON(this.spec);
      // Compare the saved editor representation; the server can trim names without trimming order keys.
      const saved = SpecHelper.CONVERT_SPEC_ARRAY_TO_JSON(
        SpecHelper.CONVERT_SPEC_JSON_TO_ARRAY(this.product.spec, this.product.spec_order),
      );
      return JSON.stringify(draft) !== JSON.stringify(saved);
    },

    specDialogOpen() {
      return this.dialog_ai || this.dialog_import || this.dialog_add_group || this.dialog_add_spec || !!this.$refs.specTable?.dialog_sort;
    },

    importReady() {
      return this.dialog_import && this.import_step === "review" && !!this.product_selected && Array.isArray(this.spec_selected) && !this.busy_find && !this.busy && !this.import_error && !this.add_by_dropShipping;
    },

    importSourceStatus() {
      return ProductStatus[this.product_selected?.status];
    },

    importSummary() {
      return {
        groups: (this.spec_selected || []).filter(item => item?.group).length,
        properties: (this.spec_selected || []).filter(Array.isArray).length,
      };
    },

    importGroups() {
      const groups = [];
      let group = null;
      for (const item of this.spec_selected || []) {
        if (item?.group) {
          group = { title: item.group, items: [] };
          groups.push(group);
        } else if (Array.isArray(item)) {
          if (!group) {
            group = { title: this.$t("add_product.spec_modern.ungrouped"), items: [] };
            groups.push(group);
          }
          group.items.push(item);
        }
      }
      return groups;
    },

    article_body(){
      const article= this.product.articles?.length?this.product.articles[0]:null;
      if(!article?.body)return 'No Article'
      return StripTags(article.body).substring(0,500);
    }
  },

  watch: {
    dialog_import(open) {
      if (!this.modern || open) return;
      this.spec_request_id++;
      this.busy_find = false;
      this.import_error = false;
      this.import_step = "browse";
      this.product_selected = null;
      this.spec_selected = null;
    },
    spec(spec) {
      if (!this.spec) this.spec = [];
    },
  },

  created() {
    if (!this.product.spec) this.product.spec = {};

    this.spec = SpecHelper.CONVERT_SPEC_JSON_TO_ARRAY(
      this.product.spec,
      this.product.spec_order,
    );
  },
  beforeUnmount() {
    this.spec_request_id++;
  },
  methods: {
    openImport() {
      if (this.add_by_dropShipping || (this.modern && this.busy)) return;
      this.spec_request_id++;
      this.product_selected = null;
      this.spec_selected = null;
      this.busy_find = false;
      this.import_error = false;
      this.import_step = "browse";
      this.import_browse_scroll = 0;
      this.dialog_import = true;
    },
    closeImport() {
      this.dialog_import = false;
    },
    backToImportProducts() {
      this.spec_request_id++;
      this.busy_find = false;
      this.import_error = false;
      this.import_step = "browse";
      this.$nextTick(() => {
        const body = this.$refs.importBody?.$el;
        if (body) body.scrollTop = this.import_browse_scroll;
        this.$refs.importPicker?.focusSelectedProduct(this.product_selected?.id);
      });
    },
    replaceImportedSpec() {
      if (!this.importReady) return;
      this.safeSetSpec(this.spec_selected);
      this.closeImport();
    },
    openAI() {
      if (this.add_by_dropShipping) return;
      this.prompt = null;
      this.spec_generated = null;
      this.dialog_ai = true;
    },
    addGroup() {
      if (this.add_by_dropShipping || (this.modern && this.busy)) return;
      if (!this.group_title) {
        NotificationService.showWarningAlert(
          null,
          this.$t(
            "add_product.edit_spec.notifications.enter_group_title_error",
          ),
        );
        return;
      }

      if (!this.spec) this.spec = [];

      this.spec.push({ group: this.group_title });

      if (this.autoSave) {
        this.saveSpec(false);
      }

      this.group_title = "";
      if (this.modern) this.dialog_add_group = false;
    },
    addSpec() {
      if (this.add_by_dropShipping || (this.modern && this.busy)) return;
      if (!this.item_title || !this.item_value) {
        NotificationService.showWarningAlert(
          null,
          this.$t(
            "add_product.edit_spec.notifications.enter_item_title_and_value_error",
          ),
        );
        return;
      }

      if (!this.spec) this.spec = [];

      this.spec.push([this.item_title, this.item_value]);

      if (this.autoSave) {
        this.saveSpec(false);
      }

      this.item_title = "";
      this.item_value = "";
      if (this.modern) this.dialog_add_spec = false;
    },

    deleteItemSpec(element) {
      if (this.add_by_dropShipping) return;
      this.spec.remove(element);
    },

    saveSpec(go_next = false) {
      // Dialog shortcuts apply their own draft; never save the form underneath them.
      if (this.busy || (go_next && (this.specDialogOpen || this.$refs.specTable?.dialog_sort))) return;
      if (this.add_by_dropShipping) {
        if (!go_next) return;
        this.$emit("next");
        return;
      }

      //console.log("spec", this.spec);

      const { spec_json, spec_order } = SpecHelper.CONVERT_SPEC_ARRAY_TO_JSON(
        this.spec,
      );

      if (this.modern ? !this.specHasChanges : (
        JSON.stringify(spec_json) === JSON.stringify(this.product.spec) &&
        JSON.stringify(spec_order) === JSON.stringify(this.product.spec_order)
      )) {
        console.log("No spec change.");
        if (go_next) this.$emit("next");
        return;
      }

      this.busy = true;
      const submitted_spec = JSON.stringify({ spec_json, spec_order });

      axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POST_MY_VENDOR_SAVE_SPEC(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_SAVE_SPEC(this.product.shop_id, this.product.id),
          {
            spec: spec_json,
            spec_order: spec_order,
          },
        )
        .then((response) => {
          if (!response.data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t("add_product.edit_spec.notifications.spec_saved_success"),
            );
            // Preserve edits made while saving; only rebase the exact submitted draft.
            if (this.modern && JSON.stringify(SpecHelper.CONVERT_SPEC_ARRAY_TO_JSON(this.spec)) === submitted_spec) {
              this.spec = SpecHelper.CONVERT_SPEC_JSON_TO_ARRAY(response.data.spec, response.data.spec_order);
            }
            this.product.spec = response.data.spec;
            this.product.spec_order = response.data.spec_order;

            this.$emit("update-spec", {
              spec: response.data.spec,
              spec_order: response.data.spec_order,
            }); // Update main product!

            if (go_next) this.$emit("next");
          } else {
            NotificationService.showErrorAlert(null, response.data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    safeSetSpec(new_spec) {
      if (this.add_by_dropShipping || !Array.isArray(new_spec)) return;
      this.spec = new_spec.filter((item) => {
        return item && (Array.isArray(item) ? item.length >= 2 : item.group);
      });
    },

    selectProduct(product_selected) {
      if (this.modern && (!this.dialog_import || this.add_by_dropShipping)) return;
      if (this.modern) this.import_browse_scroll = this.$refs.importBody?.$el?.scrollTop || 0;
      this.product_selected = product_selected;
      if (this.modern) this.import_step = "review";
      this.getSpecProduct(`P${product_selected.id}`);
      if (this.modern) this.$nextTick(() => {
        if (!this.dialog_import || this.import_step !== "review") return;
        const body = this.$refs.importBody?.$el;
        if (body) body.scrollTop = 0;
        this.$refs.importBack?.$el?.focus({ preventScroll: true });
      });
    },

    getSpecProduct(product_code) {
      if (!product_code || this.add_by_dropShipping) return;
      if (this.modern && (!this.dialog_import || this.import_step !== "review")) return;

      const request_id = ++this.spec_request_id;
      if (this.modern) {
        this.spec_selected = null;
        this.import_error = false;
      }
      this.busy_find = true;
      axios
        .get(
          this.IS_VENDOR_PANEL
            ? window.VAPI.GET_MY_VENDOR_SPEC_OF_PRODUCT(
                this.$route.params.vendor_id,
                product_code,
              )
            : window.API.GET_SPEC_OF_PRODUCT(this.shop.id, product_code),
        )
        .then(({ data }) => {
          if (this.modern && (request_id !== this.spec_request_id || !this.dialog_import || this.import_step !== "review" || this.add_by_dropShipping)) return;
          if (data.error) {
            if (this.modern) this.import_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            if (data.spec)
              this.spec_selected = SpecHelper.CONVERT_SPEC_JSON_TO_ARRAY(
                data.spec,
                data.spec_order,
              ).filter(Boolean);
            else this.spec_selected = [];
          }
        })
        .catch((error) => {
          if (this.modern && (request_id !== this.spec_request_id || !this.dialog_import || this.import_step !== "review" || this.add_by_dropShipping)) return;
          if (this.modern) this.import_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (!this.modern || (request_id === this.spec_request_id && this.dialog_import && this.import_step === "review" && !this.add_by_dropShipping)) this.busy_find = false;
        });
    },

    autoGenerateAI() {
      if (this.add_by_dropShipping || (this.modern && this.busy_ai)) return;
      if (this.modern) this.spec_generated = null;
      this.busy_ai = true;
      axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POST_MY_VENDOR_AI_PRODUCT_AUTO_CREATE_SPEC(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_AI_PRODUCT_AUTO_CREATE_SPEC(
                this.shop.id,
                this.product.id,
              ),
          {
            prompt: this.prompt,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            if (data.spec)
              this.spec_generated = SpecHelper.CONVERT_SPEC_JSON_TO_ARRAY(
                data.spec,
                data.spec_order,
              ).filter(Boolean);
            else this.spec_generated = [];
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_ai = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-size: 1.6rem;
}

.b-product-edit-spec--modern {
  width: 100%;
  max-width: 760px;
  margin-inline: auto;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 14px;
  line-height: 21px;

  &.b-product-edit-spec--expanded { max-width: 1280px; }

  .b-product-edit-spec__header,
  .b-product-edit-spec__tools {
    box-sizing: border-box;
    margin: 0 0 14px;
    padding: 0;
    border: 1px solid var(--sd-modern-border);
    border-radius: 16px;
    background: rgb(var(--v-theme-surface));
    box-shadow: none;
  }

  .b-product-edit-spec__header { padding: 23px; }
  .b-product-edit-spec__heading { display: flex; align-items: center; gap: 10px; }
  .b-product-edit-spec__heading > svg { color: var(--sd-modern-muted); }
  .b-product-edit-spec__heading > .v-btn { margin-inline-start: auto; }
  h2 { margin: 0; font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: -0.15px; }
  .b-product-edit-spec__intro { display: flex; align-items: flex-start; gap: 12px; margin-block-start: 9px; }
  .b-product-edit-spec__intro p { flex: 1; margin: 0; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  .b-product-edit-spec__toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-block-start: 23px; }
  .b-product-edit-spec__autosave { flex: 1 1 260px; min-width: 0; max-width: 480px; font-size: 13px; line-height: 20px; }
  .b-product-edit-spec__autosave :deep(b) { font-size: 13px; font-weight: 500; line-height: 20px; }
  .b-product-edit-spec__autosave :deep(.small) { margin-block-start: 1px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; opacity: 1 !important; }
  .b-product-edit-spec__readonly { display: flex; align-items: flex-start; gap: 9px; margin: 18px 0 0; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  .b-product-edit-spec__readonly > svg { flex: 0 0 auto; margin-block-start: 2px; }
  .b-product-edit-spec__add-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-block: 17px 25px; }

  .b-product-edit-spec__tools > summary { display: flex; align-items: center; gap: 12px; min-height: 84px; box-sizing: border-box; padding: 20px 23px; border-radius: 16px; list-style: none; }
  .b-product-edit-spec__tools > summary::-webkit-details-marker { display: none; }
  .b-product-edit-spec__tools > summary > svg { color: var(--sd-modern-muted); flex: 0 0 auto; }
  .b-product-edit-spec__summary-copy { flex: 1; min-width: 0; }
  .b-product-edit-spec__summary-title { display: block; font-size: 14px; font-weight: 500; line-height: 21px; }
  .b-product-edit-spec__digest { display: block; margin-block-start: 3px; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
  .b-product-edit-spec__tools[open] > summary { min-height: 69px; padding-block-end: 12px; }
  .b-product-edit-spec__tools[open] .b-product-edit-spec__summary-title { font-size: 16px; line-height: 24px; letter-spacing: -0.15px; }
  .b-product-edit-spec__tools[open] .b-product-edit-spec__digest { display: none; }
  .b-product-edit-spec__tools[open] .b-product-edit-spec__chevron { transform: rotate(180deg); }
  .b-product-edit-spec__tools-body { padding: 0 23px 12px; }
  .b-product-edit-spec__tool { display: flex; align-items: center; gap: 13px; padding-block: 16px; }
  .b-product-edit-spec__tool > svg { color: var(--sd-modern-muted); flex: 0 0 auto; }
  .b-product-edit-spec__tool > div { flex: 1; min-width: 0; }
  .b-product-edit-spec__tool h3 { margin: 0; font-size: 13px; font-weight: 500; line-height: 20px; }
  .b-product-edit-spec__tool p { margin: 3px 0 0; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  .b-product-edit-spec__footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-block-start: 25px; }
  .b-product-edit-spec__footer p { display: flex; align-items: center; gap: 7px; margin: 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }

  :deep(.sd-modern-button) { font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; }
  :deep(.sd-modern-button.v-btn--variant-outlined) { border-color: var(--sd-modern-border); }
  :deep(.sd-modern-icon-button:not(.sd-modern-info-button)) { width: 32px; height: 32px; min-height: 32px; padding: 0; }
  :deep(.sd-modern-info-button) { width: 28px; height: 28px; min-height: 28px; flex-shrink: 0; }
}

.b-product-edit-spec__dialog,
.b-product-edit-spec__overlay {
  padding: 0;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  font-family: inherit;
  font-size: 14px;
  line-height: 21px;

  h2 { margin: 0; font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: -0.15px; overflow-wrap: anywhere; }
  > .v-card-title { display: flex; align-items: flex-start; gap: 12px; padding: 23px 23px 17px; white-space: normal; font-size: 18px; font-weight: 500; line-height: 26px; }
  > .v-card-title h2 { flex: 1; min-width: 0; font-size: 18px; font-weight: 500; line-height: 26px; }
  > .v-card-text { padding: 0 23px 23px; }
  > .v-card-actions { gap: 9px; padding: 0 23px 23px; }
  .b-product-edit-spec__dialog-intro { margin: 0 0 14px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-product-edit-spec__dialog-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 9px; width: 100%; }
  .b-product-edit-spec__preview { max-width: 1040px; min-width: 0; margin: 24px auto 0; }
  .b-product-edit-spec__preview > h2 { margin-block-end: 8px; }
  :deep(.v-field__input) { box-sizing: border-box; font-family: inherit; font-size: 14px; line-height: 24px; }
  :deep(.v-field-label--floating) { font-size: 12px; font-weight: 400; line-height: 19px; }
  :deep(.v-input__details) { padding-inline: 0; font-size: 12px; line-height: 19px; }
  :deep(.sd-modern-button) { font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; }
  :deep(.sd-modern-button.v-btn--variant-outlined) { border-color: var(--sd-modern-border); }
  :deep(.sd-modern-icon-button) { width: 32px; height: 32px; min-height: 32px; padding: 0; }
}

.b-product-edit-spec__dialog,
.b-product-edit-spec__overlay { border-radius: 18px !important; }
.b-product-edit-spec__ai-dialog {
  .b-product-edit-spec__ai-prompt { box-sizing: border-box; max-width: 760px; margin: 0 auto; padding: 0; border: 0; border-radius: 0; box-shadow: none; }
  .b-product-edit-spec__ai-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; margin-block-end: 9px; }
  .b-product-edit-spec__ai-heading > h2 { flex: 1; min-width: 180px; }
  .b-product-edit-spec__ai-heading > .v-input { flex: 0 1 200px; min-width: 0; }
  .b-product-edit-spec__quota { display: flex; align-items: flex-start; gap: 9px; margin: 15px 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-product-edit-spec__quota > svg { flex: 0 0 auto; margin-block-start: 2px; }
  .b-product-edit-spec__preview { max-width: 760px; }
}

.b-product-edit-spec__import-dialog.sd-modern-widget {
  --sd-modern-icon-button-size: 32px;
  padding: 0;
  border: 1px solid var(--sd-modern-border);

  .b-product-edit-spec__import-header { display: flex; align-items: flex-start; gap: 12px; flex-shrink: 0; padding: 23px 23px 18px; }
  .b-product-edit-spec__import-header > svg { flex: 0 0 auto; margin-block-start: 4px; color: var(--sd-modern-muted); }
  .b-product-edit-spec__import-header > div { flex: 1; min-width: 0; }
  .b-product-edit-spec__import-header h2 { margin: 0; font-size: 18px; font-weight: 500; line-height: 26px; letter-spacing: -0.2px; }
  .b-product-edit-spec__import-header p { margin: 4px 0 0; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  .b-product-edit-spec__import-steps { display: flex; align-items: center; flex-wrap: wrap; gap: 15px; flex-shrink: 0; padding: 0 23px 20px; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; }
  .b-product-edit-spec__import-steps > span { display: inline-flex; align-items: center; gap: 7px; }
  .b-product-edit-spec__import-steps b { display: grid; place-items: center; width: 21px; height: 21px; border: 1px solid var(--sd-modern-border); border-radius: 50%; background: rgb(var(--v-theme-surface)); font-size: 10px; font-weight: 400; }
  .b-product-edit-spec__import-steps [aria-current] { color: rgb(var(--v-theme-on-surface)); }
  .b-product-edit-spec__import-steps [aria-current] b { color: rgb(var(--v-theme-primary)); border-color: rgb(var(--v-theme-primary)); }
  > .b-product-edit-spec__import-body { padding: 18px 23px 22px; border-block: 1px solid var(--sd-modern-border); min-height: 0; }
  .b-product-edit-spec__import-browse, .b-product-edit-spec__import-review { min-width: 0; }
  .b-product-edit-spec__import-back { margin-block-end: 16px; padding-inline: 0; min-height: 32px; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  .b-product-edit-spec__import-source { display: flex; align-items: center; gap: 13px; margin-block-end: 20px; min-width: 0; }
  .b-product-edit-spec__import-source > .v-avatar { flex-shrink: 0; background: rgb(var(--v-theme-surface)); }
  .b-product-edit-spec__import-source > div { min-width: 0; }
  .b-product-edit-spec__import-source p { margin: 0 0 3px; }
  .b-product-edit-spec__import-source h3 { margin: 0; font-size: 16px; font-weight: 500; line-height: 24px; overflow-wrap: anywhere; }
  .b-product-edit-spec__import-source-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-block-start: 4px; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; }
  .b-product-edit-spec__import-source-meta .sd-modern-status { margin: 0; padding: 0; font-size: inherit; line-height: inherit; }
  .b-product-edit-spec__import-preview-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-block-end: 12px; }
  .b-product-edit-spec__import-preview-heading h3 { margin: 0; font-size: 13px; font-weight: 500; line-height: 21px; }
  .b-product-edit-spec__import-preview-heading > span { color: var(--sd-modern-muted); font-size: 11px; line-height: 19px; text-align: end; }
  .b-product-edit-spec__import-group { margin-block-end: 10px; padding: 16px; border: 1px solid var(--sd-modern-border); border-radius: 12px; background: rgb(var(--v-theme-surface)); box-shadow: none; }
  .b-product-edit-spec__import-group h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; font-size: 14px; font-weight: 500; line-height: 22px; overflow-wrap: anywhere; }
  .b-product-edit-spec__import-group h3 > svg { flex-shrink: 0; color: var(--sd-modern-muted); }
  .b-product-edit-spec__import-group dl { margin: 0; }
  .b-product-edit-spec__import-pair { display: grid; grid-template-columns: minmax(90px, 1fr) minmax(0, 1.5fr); gap: 18px; padding-block: 11px; border-block-start: 1px solid var(--sd-modern-border); font-size: 12px; line-height: 20px; }
  .b-product-edit-spec__import-pair:first-child { border-block-start: 0; }
  .b-product-edit-spec__import-pair dt { font-weight: 500; overflow-wrap: anywhere; }
  .b-product-edit-spec__import-pair dd { display: flex; flex-wrap: wrap; gap: 3px 9px; margin: 0; min-width: 0; overflow-wrap: anywhere; }
  .b-product-edit-spec__import-pair dd > span:not(:last-child)::after { content: '·'; margin-inline-start: 9px; color: var(--sd-modern-muted); }
  .b-product-edit-spec__import-state { padding: 44px 16px; border: 0; background: transparent; }
  .b-product-edit-spec__import-state > svg, .b-product-edit-spec__import-state > .v-progress-circular { margin-block-end: 12px; color: var(--sd-modern-muted); }
  .b-product-edit-spec__import-state h3 { margin: 0; font-size: 14px; font-weight: 500; line-height: 22px; }
  .b-product-edit-spec__import-state p { max-width: 340px; margin: 6px auto 12px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-product-edit-spec__import-notice { display: flex; align-items: flex-start; gap: 10px; margin-block-start: 8px; padding-block-start: 15px; font-size: 12px; line-height: 20px; }
  .b-product-edit-spec__import-notice > svg { flex-shrink: 0; margin-block-start: 2px; color: var(--sd-modern-muted); }
  .b-product-edit-spec__import-notice strong { display: block; font-weight: 500; }
  .b-product-edit-spec__import-notice p { margin: 3px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  > .b-product-edit-spec__import-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 18px; flex-shrink: 0; padding: 18px 23px; }
  .b-product-edit-spec__import-footer > p { display: flex; align-items: flex-start; gap: 7px; flex: 1 1 180px; margin: 0; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  .b-product-edit-spec__import-footer > p > svg { flex-shrink: 0; margin-block-start: 2px; }
  .b-product-edit-spec__import-footer .b-product-edit-spec__dialog-actions { width: auto; margin-inline-start: auto; }
  .b-product-edit-spec__import-footer .sd-modern-button { min-height: 38px; height: auto; padding: 9px 13px; font-size: 12px; line-height: 18px; }
  &[dir=rtl] .b-product-edit-spec__direction { transform: scaleX(-1); }
}

@media (max-width: 660px) {
  .b-product-edit-spec--modern {
    .b-product-edit-spec__header { padding: 18px; }
    .b-product-edit-spec__tools > summary { padding-inline: 18px; gap: 10px; }
    .b-product-edit-spec__tools-body { padding-inline: 18px; }
    .b-product-edit-spec__tool { flex-wrap: wrap; align-items: flex-start; }
    .b-product-edit-spec__tool > div { flex-basis: calc(100% - 34px); }
    .b-product-edit-spec__tool > .v-btn { margin-inline-start: 31px; }
  }
  .b-product-edit-spec__dialog,
  .b-product-edit-spec__overlay {
    > .v-card-title { padding: 20px 18px 17px; }
    > .v-card-text { padding-inline: 18px; }
    > .v-card-actions { padding-inline: 18px; flex-wrap: wrap; }
  }
  .b-product-edit-spec__ai-dialog .b-product-edit-spec__ai-prompt { padding: 0; }
  .b-product-edit-spec__import-dialog.sd-modern-widget {
    .b-product-edit-spec__import-header { padding: 18px 16px 16px; gap: 9px; }
    .b-product-edit-spec__import-header > svg { display: none; }
    .b-product-edit-spec__import-header h2 { font-size: 17px; line-height: 25px; }
    .b-product-edit-spec__import-steps { gap: 9px; padding: 0 16px 17px; }
    > .b-product-edit-spec__import-body { padding: 16px; }
    > .b-product-edit-spec__import-footer { padding: 16px; gap: 14px; }
    .b-product-edit-spec__import-footer > p { flex-basis: 100%; }
    .b-product-edit-spec__import-footer .b-product-edit-spec__dialog-actions { width: 100%; }
    .b-product-edit-spec__import-group { padding: 14px; }
    .b-product-edit-spec__import-pair { grid-template-columns: 1fr; gap: 3px; }
    .b-product-edit-spec__import-preview-heading > span { max-width: 130px; }
    .b-product-edit-spec__import-back { min-height: 44px; }
  }
}

@media (max-width: 680px), (pointer: coarse) {
  .b-product-edit-spec__import-dialog.sd-modern-widget { --sd-modern-icon-button-size: 44px; }
  .b-product-edit-spec--modern,
  .b-product-edit-spec__dialog,
  .b-product-edit-spec__overlay {
    :deep(.sd-modern-icon-button), :deep(.sd-modern-info-button) { width: 44px; height: 44px; min-height: 44px; }
    :deep(.sd-modern-button) { min-height: 44px; }
    :deep(.v-field__input) { font-size: 16px; }
  }
  .b-product-edit-spec--modern .b-product-edit-spec__autosave { min-height: 44px; }
}
</style>
