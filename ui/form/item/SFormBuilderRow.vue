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
    class="s--form-builder-container"
    :class="{ 's-form-builder-row--modern': modern, 's-form-builder-row--focused': focused, 's-form-builder-row--compact': compactMode, 'is-selected': focused && selected }"
  >
    <fieldset
      v-if="modern"
      :disabled="readOnly"
      class="s-form-builder-row__fieldset"
    >
      <legend v-if="compactMode" class="s-form-builder-row__header s-form-builder-row__compact-header">
        <button type="button" class="drag--handle sd-modern-icon-button s-form-builder-row__grip" :disabled="readOnly" :aria-label="$t('add_product.inputs_modern.arrange') + ' · ' + compactTitle" @pointerdown="suppressArrangeClick = false" @click="arrangeFields"><b-product-edit-info-icon name="GripVertical" :size="16" /><v-tooltip activator="parent" :text="$t('add_product.inputs_modern.arrange')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" /></button>
        <button ref="compactSummary" type="button" class="s-form-builder-row__summary" :aria-expanded="isExpanded" @focus="measureSummary" @mouseenter="measureSummary" @click="$emit('select')"><b-product-edit-info-icon :name="compactIcon" :size="18" /><span><strong ref="compactHeading">{{ compactTitle }}</strong><small ref="compactDigestText">{{ compactDigest }}</small></span><b-product-edit-info-icon name="ChevronDown" :size="14" class="s-form-builder-row__chevron" /><v-tooltip activator="parent" :disabled="!summaryClipped" :text="compactSummaryTooltip" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" /></button>
        <v-btn class="sd-modern-icon-button" icon variant="text" :disabled="readOnly" :aria-label="$t('add_product.inputs_modern.remove_field') + ' · ' + compactTitle" @click="removeField"><b-product-edit-info-icon name="Trash2" :size="16" /><v-tooltip activator="parent" :text="$t('add_product.inputs_modern.remove_field')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" /></v-btn>
      </legend>
      <component v-else :is="focused ? 'legend' : 'div'" class="s-form-builder-row__header">
        <v-icon class="drag--handle cursor-move" size="16" aria-hidden="true"
          >drag_indicator</v-icon
        >
        <button
          class="s-form-builder-row__summary"
          type="button"
          :aria-expanded="isExpanded"
          @click="focused ? $emit('select') : expanded = !expanded"
        >
          <v-icon :icon="type?.icon" :size="focused ? 30 : 16" aria-hidden="true" />
          <span
            ><strong :class="{ 's-form-builder-row__note-summary': item.type === 'note' }">{{
              summaryTitle || $t("shop_configuration.flow_modern.form.untitled")
            }}</strong
            ><small
              >{{ getName(type?.title)
              }}<template v-if="item.type !== 'note' && item.required">
                · {{ $t("global.commons.required") }}</template
              ><template v-else-if="focused && item.type !== 'note'"> · {{ $t('global.commons.optional') }}</template
              ></small
            ></span
          >
          <v-icon v-if="focused" class="s-form-builder-row__chevron" :icon="isExpanded ? 'expand_less' : 'expand_more'" size="14" aria-hidden="true" />
        </button>
        <div class="s-form-builder-row__actions">
          <v-tooltip
            v-for="direction in [-1, 1]"
            v-if="!focused"
            :key="direction"
            :text="
              $t(
                direction < 0
                  ? 'shop_configuration.flow_modern.form.move_up'
                  : 'shop_configuration.flow_modern.form.move_down',
              )
            "
            content-class="sd-modern-tooltip text-start"
            location="top"
          >
            <template #activator="{ props }"
              ><v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                :aria-label="
                  $t(
                    direction < 0
                      ? 'shop_configuration.flow_modern.form.move_up'
                      : 'shop_configuration.flow_modern.form.move_down',
                  )
                "
                :disabled="readOnly || (direction < 0 ? first : last)"
                :icon="direction < 0 ? 'arrow_upward' : 'arrow_downward'"
                variant="text"
                @click="$emit('move', direction)"
            /></template>
          </v-tooltip>
          <v-tooltip
            :text="$t('global.actions.delete')"
            content-class="sd-modern-tooltip text-start"
            location="top"
            ><template #activator="{ props }"
              ><v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                :aria-label="$t('global.actions.delete')"
                :disabled="readOnly"
                :icon="focused ? 'delete_outline' : 'close'"
                variant="text"
                @click="removeField" /></template
          ></v-tooltip>
        </div>
      </component>
      <div v-if="isExpanded" class="s-form-builder-row__fields">
        <template v-if="item.type === 'note'">
        <v-textarea
          v-model="item.title"
          ref="titleInput"
          :disabled="readOnly"
          class="sd-modern-underlined-field"
          :label="$t(compactMode ? 'add_product.inputs_modern.note_content' : 'global.commons.note')"
          :messages="$t(compactMode ? 'add_product.inputs_modern.note_hint' : 'shop_configuration.flow_modern.form.allowed_tags')"
          :placeholder="
            $t('shop_configuration.flow_modern.form.note_placeholder')
          "
          rows="4"
          variant="underlined"
        />
        <div v-if="focused" class="s-form-builder-row__note-toolbar">
          <v-tooltip v-for="format in noteFormats" :key="format.tag" :text="$t('shop_configuration.flow_modern.form.focused.' + format.label)" content-class="sd-modern-tooltip text-start" location="top">
            <template #activator="{ props }"><v-btn v-bind="props" class="sd-modern-icon-button" :aria-label="$t('shop_configuration.flow_modern.form.focused.' + format.label)" :icon="format.icon" :disabled="readOnly" variant="text" @click="formatNote(format.tag)" /></template>
          </v-tooltip>
        </div>
        </template>
        <template v-else>
          <div class="s-form-builder-row__grid s-form-builder-row__main-grid">
            <v-text-field
              v-model="item.title"
              ref="titleInput"
              :disabled="readOnly"
              class="sd-modern-underlined-field s-form-builder-row__title-input"
              :label="$t(compactMode ? 'add_product.inputs_modern.field_label' : focused ? 'shop_configuration.flow_modern.form.focused.field_label' : 'shop_configuration.flow_modern.form.public_label')"
              :messages="
                focused ? undefined : $t('shop_configuration.flow_modern.form.public_label_hint')
              "
              :hide-details="focused"
              :placeholder="
                $t(compactMode ? 'add_product.inputs_modern.label_placeholder' : 'shop_configuration.flow_modern.form.label_placeholder')
              "
              persistent-placeholder
              variant="underlined"
              @blur="
                item.name = item.name ? item.name : Slugify.apply(item.title);
                $forceUpdate();
              "
            />
            <component :is="focused ? 'details' : 'div'" class="s-form-builder-row__identifier">
            <summary v-if="focused">{{ $t(compactMode ? 'add_product.inputs_modern.identifier' : 'shop_configuration.flow_modern.form.focused.identifier') }}<template v-if="compactMode && item.name"> · <bdi>{{ item.name }}</bdi></template></summary>
            <v-text-field
              v-model="item.name"
              class="sd-modern-underlined-field"
              :label="$t(compactMode ? 'add_product.inputs_modern.identifier' : focused ? 'shop_configuration.flow_modern.form.focused.identifier' : 'shop_configuration.flow_modern.form.field_name')"
              :messages="
                $t(compactMode ? 'add_product.inputs_modern.identifier_help' : focused ? 'shop_configuration.flow_modern.form.focused.identifier_hint' : 'shop_configuration.flow_modern.form.field_name_hint')
              "
              :placeholder="$t(compactMode ? 'add_product.inputs_modern.auto_identifier' : 'shop_configuration.flow_modern.form.auto_name')"
              :readonly="!edit_name"
              :disabled="item.locked || readOnly"
              persistent-placeholder
              variant="underlined"
            >
              <template #append-inner
                ><v-tooltip
                  :text="
                    $t(
                      compactMode ? item.locked ? 'add_product.inputs_modern.identifier_locked' : edit_name ? 'add_product.inputs_modern.lock_identifier' : 'add_product.inputs_modern.unlock_identifier' : edit_name
                        ? 'shop_configuration.flow_modern.form.lock_name'
                        : 'shop_configuration.flow_modern.form.unlock_name',
                    )
                  "
                  content-class="sd-modern-tooltip text-start"
                  location="top"
                  ><template #activator="{ props }"
                    ><v-btn
                      v-bind="props"
                      class="sd-modern-input-action"
                      :aria-label="
                        $t(
                          compactMode ? item.locked ? 'add_product.inputs_modern.identifier_locked' : edit_name ? 'add_product.inputs_modern.lock_identifier' : 'add_product.inputs_modern.unlock_identifier' : edit_name
                            ? 'shop_configuration.flow_modern.form.lock_name'
                            : 'shop_configuration.flow_modern.form.unlock_name',
                        )
                      "
                      :icon="compactMode ? undefined : edit_name ? 'lock_open' : 'lock_outline'"
                      variant="text"
                      :disabled="item.locked || readOnly"
                      @click="edit_name = !edit_name"><b-product-edit-info-icon v-if="compactMode" :name="edit_name ? 'LockOpen' : 'LockKeyhole'" :size="16" /></v-btn></template></v-tooltip
              ></template>
            </v-text-field>
            </component>
          </div>
          <template v-if="item.type === 'select'">
            <v-combobox
              v-model="item.selects"
              ref="choicesInput"
              :disabled="readOnly"
              class="sd-modern-underlined-field s-form-builder-row__choices-input"
              :items="[]"
              :hide-no-data="compactMode"
              :label="$t(compactMode ? 'add_product.inputs_modern.choices' : 'global.form_builder.value_input')"
              :messages="$t(compactMode ? 'add_product.inputs_modern.choice_help' : 'global.form_builder.value_input_message')"
              chips
              clearable
              closable-chips
              multiple
              variant="underlined"
              ><template #append-inner><v-btn v-if="compactMode" class="sd-modern-input-action" icon variant="text" :disabled="readOnly" :aria-label="$t('add_product.inputs_modern.add_choice')" @mousedown.prevent @click.stop="addToken('selects')"><b-product-edit-info-icon name="Plus" :size="16" /><v-tooltip activator="parent" :text="$t('add_product.inputs_modern.add_choice')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" /></v-btn></template><template #chip="{ props, item }"
                ><v-chip v-bind="props">{{ item.raw }}</v-chip></template
              ></v-combobox
            >
            <u-smart-switch
              :model-value="!item.multiple"
              class="s-form-builder-row__switch"
              :class="{ 'sd-modern-smart-select sd-modern-smart-select--columns': compactMode }"
              :border="compactMode"
              :aria-label="compactMode ? $t('add_product.inputs_modern.choices') : undefined"
              :accessible="modern"
              :disabled="readOnly"
              :true-title="
                $t(compactMode ? 'add_product.inputs_modern.single_choice' : 'shop_configuration.flow_modern.form.single_item')
              "
              :true-description="
                $t(compactMode ? 'add_product.inputs_modern.single_choice_help' : 'shop_configuration.flow_modern.form.single_hint')
              "
              :false-title="
                $t(compactMode ? 'add_product.inputs_modern.multiple_choices' : 'shop_configuration.flow_modern.form.multiple_items')
              "
              :false-description="
                $t(compactMode ? 'add_product.inputs_modern.multiple_choices_help' : 'shop_configuration.flow_modern.form.multiple_hint')
              "
              @update:model-value="item.multiple = !$event"
              @change="$forceUpdate()"
            />
          </template>
          <p v-if="compactMode && item.type === 'switch'" class="s-form-builder-row__mode-title">{{ $t('add_product.inputs_modern.default_answer') }}</p>
          <u-smart-switch
            v-if="item.type === 'switch'"
            :model-value="!item.default"
            class="s-form-builder-row__switch"
            :class="{ 'sd-modern-smart-select sd-modern-smart-select--columns': compactMode }"
            :border="compactMode"
            :aria-label="compactMode ? $t('add_product.inputs_modern.default_answer') : undefined"
            :accessible="modern"
            :disabled="readOnly"
            :true-title="
              $t(compactMode ? 'add_product.inputs_modern.no' : 'shop_configuration.flow_modern.form.default_false')
            "
            :true-description="item.hint_false"
            :false-title="
              $t(compactMode ? 'add_product.inputs_modern.yes' : 'shop_configuration.flow_modern.form.default_true')
            "
            :false-description="item.hint_true"
            true-icon="close"
            false-icon="check"
            @update:model-value="item.default = !$event"
            @change="$forceUpdate()"
          />
          <template v-if="item.type === 'file'">
            <v-combobox
              v-model="item.types"
              ref="fileTypesInput"
              :disabled="readOnly"
              class="sd-modern-underlined-field"
              :items="['jpeg', 'png', 'zip', 'pdf']"
              :label="$t(compactMode ? 'add_product.inputs_modern.file_types' : 'global.form_builder.file_type_input')"
              :messages="$t(compactMode ? 'add_product.inputs_modern.file_types_help' : 'global.form_builder.file_type_message')"
              chips
              clearable
              closable-chips
              multiple
              variant="underlined"
            ><template #append-inner><v-btn v-if="compactMode" class="sd-modern-input-action" icon variant="text" :disabled="readOnly" :aria-label="$t('add_product.inputs_modern.add_extension')" @mousedown.prevent @click.stop="addToken('types')"><b-product-edit-info-icon name="Plus" :size="16" /><v-tooltip activator="parent" :text="$t('add_product.inputs_modern.add_extension')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" /></v-btn></template></v-combobox>
            <u-smart-switch
              v-model="item.multiple"
              class="s-form-builder-row__switch"
              :class="{ 'sd-modern-smart-select sd-modern-smart-select--columns': compactMode }"
              :border="compactMode"
              :aria-label="compactMode ? $t('add_product.inputs_modern.file_types') : undefined"
              :accessible="modern"
              :disabled="readOnly"
              :false-title="compactMode ? $t('add_product.inputs_modern.single_file') : 'Single file'"
              :true-title="compactMode ? $t('add_product.inputs_modern.multiple_files') : 'Multiple files'"
              @change="$forceUpdate()"
            />
          </template>
          <v-checkbox
            v-if="hasRequired"
            v-model="item.required"
            :disabled="readOnly"
            class="s-form-builder-row__required"
            :label="
              $t(
                item.required
                  ? 'global.commons.required'
                  : 'global.commons.optional',
              )
            "
            color="primary"
            hide-details
            density="compact"
          />
          <v-btn
            v-if="!focused"
            :disabled="readOnly"
            class="sd-modern-button sd-modern-button--small s-form-builder-row__hints"
            variant="text"
            prepend-icon="expand_more"
            :aria-expanded="show_hints"
            @click="show_hints = !show_hints"
            >{{ $t("shop_configuration.flow_modern.form.edit_hints") }}</v-btn
          >
          <div
            v-if="(focused || show_hints) && item.type === 'switch'"
            class="s-form-builder-row__grid s-form-builder-row__switch-hints"
          >
            <v-text-field
              v-model="item.hint_true"
              :disabled="readOnly"
              class="sd-modern-underlined-field"
              :label="$t(compactMode ? 'add_product.inputs_modern.hint_yes' : 'shop_configuration.flow_modern.form.hint_true')"
              :placeholder="
                $t(compactMode ? 'add_product.inputs_modern.hint_placeholder' : 'shop_configuration.flow_modern.form.hint_placeholder')
              "
              persistent-placeholder
              variant="underlined"
            />
            <v-text-field
              v-model="item.hint_false"
              :disabled="readOnly"
              class="sd-modern-underlined-field"
              :label="$t(compactMode ? 'add_product.inputs_modern.hint_no' : 'shop_configuration.flow_modern.form.hint_false')"
              :placeholder="
                $t(compactMode ? 'add_product.inputs_modern.hint_placeholder' : 'shop_configuration.flow_modern.form.hint_placeholder')
              "
              persistent-placeholder
              variant="underlined"
            />
          </div>
          <v-text-field
            v-else-if="focused || show_hints"
            v-model="item.hint"
            :disabled="readOnly"
            class="sd-modern-underlined-field s-form-builder-row__hint-input"
            :label="$t(compactMode ? 'add_product.inputs_modern.help_text' : focused ? 'shop_configuration.flow_modern.form.focused.help_text' : 'shop_configuration.flow_modern.form.customer_hint')"
            :hide-details="focused"
            :placeholder="
              $t(compactMode ? 'add_product.inputs_modern.hint_placeholder' : 'shop_configuration.flow_modern.form.hint_placeholder')
            "
            persistent-placeholder
            variant="underlined"
          />
        </template>
        <div v-if="focused && !compactMode" class="s-form-builder-row__editor-footer">
          <span>{{ position }} / {{ total }}</span>
          <div class="s-form-builder-row__actions">
            <v-tooltip v-for="direction in [-1, 1]" :key="direction" :text="$t(direction < 0 ? 'shop_configuration.flow_modern.form.move_up' : 'shop_configuration.flow_modern.form.move_down')" content-class="sd-modern-tooltip text-start" location="top">
              <template #activator="{ props }"><v-btn v-bind="props" class="sd-modern-icon-button" :aria-label="$t(direction < 0 ? 'shop_configuration.flow_modern.form.move_up' : 'shop_configuration.flow_modern.form.move_down')" :disabled="readOnly || (direction < 0 ? first : last)" :icon="direction < 0 ? 'arrow_upward' : 'arrow_downward'" variant="text" @click="$emit('move', direction)" /></template>
            </v-tooltip>
          </div>
        </div>
      </div>
    </fieldset>
    <v-row v-if="!modern" align="center" class="py-1 flex-nowrap" no-gutters>
      <v-icon class="me-3 cursor-move drag--handle" title="Drag and move"
        >unfold_more
      </v-icon>

      <v-icon>{{ type?.icon }}</v-icon>

      <b class="mx-1 small">{{ item.title?.limitWords(8) }}</b>
      <span class="mx-1 small text-nowrap">/ {{ getName(type?.title) }}</span>

      <v-spacer></v-spacer>

      <u-button-circle
        :title="$t('global.actions.delete')"
        color="#fff"
        icon="close"
        @click="removeField()"
      />
    </v-row>

    <v-expand-transition v-if="!modern">
      <div v-if="!collapse" class="elevation-3">
        <div
          :class="{
            '-locked':
              item.locked /*Locked item - ex. variants field for virtual products*/,
          }"
          class="s--form-builder-item"
        >
          <!-- General Attributes -->
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Note ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <template v-if="item.type === 'note'">
            <v-textarea
              v-model="item.title"
              :label="$t('global.commons.note')"
              color="primary"
              messages="Allowed tags: <h1>...<h5>, <br>, <b>, <i>, <a>,<ol>,<ul>, <li>, <hr>, <img>"
              placeholder="Writer your message here..."
              variant="underlined"
            />
          </template>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Inputs ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <template v-else>
            <v-text-field
              v-model="item.title"
              :label="$t('global.form_builder.title_input')"
              color="primary"
              hint="Public label. Ex: Name, Prefer state, Description, ..."
              persistent-placeholder
              placeholder="Enter a title for input..."
              variant="underlined"
              @blur="
                item.name = item.name ? item.name : Slugify.apply(item.title);
                $forceUpdate();
              "
            />

            <div v-if="!edit_name">
              <div class="d-flex justify-space-between pb-6 px-2">
                <div>
                  <small>{{ $t("global.form_builder.name_input") }}</small
                  ><br />
                  <b>{{ item.name ? item.name : "Auto generate.." }}</b>
                </div>

                <v-btn
                  icon
                  size="small"
                  variant="text"
                  @click="edit_name = true"
                >
                  <v-icon>{{ edit_name ? "lock_open" : "lock" }}</v-icon>
                </v-btn>
              </div>
            </div>
            <div v-else>
              <v-text-field
                v-model="item.name"
                :append-inner-icon="item.locked ? 'lock' : undefined"
                :disabled="item.locked"
                :label="$t('global.form_builder.name_input')"
                color="primary"
                hint="Ex: name, state, desc, ... Only lowercase Latin characters and numbers are permitted, and no whitespace is allowed."
                variant="underlined"
              />
            </div>

            <!-- select -->
            <template v-if="item.type === 'select'">
              <v-combobox
                v-model="item.selects"
                :items="[]"
                :label="$t('global.form_builder.value_input')"
                :messages="$t('global.form_builder.value_input_message')"
                chips
                clearable
                closable-chips
                multiple
                variant="underlined"
              >
                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props">
                    {{ item.raw }}
                  </v-chip>
                </template>
              </v-combobox>

              <u-smart-switch
                v-model="item.multiple"
                border
                class="mt-3"
                false-description="User can select just one item."
                false-title="Single item"
                true-description="User can select more than one item."
                true-title="Multiple items"
                @change="$forceUpdate()"
              >
              </u-smart-switch>
            </template>

            <!-- switch -->

            <u-smart-switch
              v-if="item.type === 'switch'"
              v-model="item.default"
              :false-description="item.hint_false"
              :false-title="$t('global.form_builder.default') + ': False'"
              :true-description="item.hint_true"
              :true-title="$t('global.form_builder.default') + ': True'"
              border
              class="mt-3"
              false-icon="close"
              true-icon="check"
              @change="$forceUpdate()"
            >
            </u-smart-switch>

            <!-- Upload file -->
            <template v-if="item.type === 'file'">
              <v-combobox
                v-model="item.types"
                :items="['jpeg', 'png', 'zip', 'pdf']"
                :label="$t('global.form_builder.file_type_input')"
                :messages="$t('global.form_builder.file_type_message')"
                chips
                clearable
                closable-chips
                multiple
                persistent-placeholder
                placeholder="*.*"
                variant="underlined"
                class="mb-3"
              >
                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props">
                    {{ item.raw }}
                  </v-chip>
                </template>
              </v-combobox>

              <u-smart-switch
                v-model="item.multiple"
                border
                false-description="User can upload just one file."
                false-title="Single file"
                true-description="User can upload more than one file."
                true-title="Multiple files"
                @change="$forceUpdate()"
              >
              </u-smart-switch>
            </template>

            <!-- -------------- Hints -------------- -->
            <v-btn
              class="tnt mt-2"
              color="primary"
              size="small"
              variant="text"
              @click="show_hints = !show_hints"
            >
              <v-icon start>arrow_drop_down</v-icon>
              Edit hints
            </v-btn>

            <v-btn
              v-if="hasRequired"
              @click.stop="item.required = !item.required"
              :variant="item.required ? 'flat' : 'tonal'"
              class="tnt mt-2"
              color="#000"
              size="small"
            >
              {{
                item.required
                  ? $t("global.commons.required")
                  : $t("global.commons.optional")
              }}
            </v-btn>

            <v-expand-transition>
              <div v-if="show_hints && item.type === 'switch'">
                <v-text-field
                  v-model="item.hint_true"
                  label="Hint True"
                  persistent-placeholder
                  placeholder="Some instruction to guide customer..."
                  variant="underlined"
                ></v-text-field>
                <v-text-field
                  v-model="item.hint_false"
                  label="Hint False"
                  persistent-placeholder
                  placeholder="Some instruction to guide customer..."
                  variant="underlined"
                ></v-text-field>
              </div>
              <div v-else-if="show_hints">
                <v-text-field
                  v-model="item.hint"
                  label="Hint"
                  persistent-placeholder
                  placeholder="Some instruction to guide customer..."
                  variant="underlined"
                ></v-text-field>
              </div>
            </v-expand-transition>
          </template>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import { Slugify } from "@selldone/core-js/utils/slugify/slugify.ts";
import BProductEditInfoIcon from "../../../backoffice/product/edit/info/BProductEditInfoIcon.vue";

export function plainFormNote(value) {
  const text = String(value || '');
  if (typeof document === 'undefined') return text.replace(/<(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]*>/g, ' ').replace(/&(nbsp|amp|lt|gt|quot|apos);/g, (_, name) => ({nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"})[name]).replace(/\s+/g, ' ').trim();
  const template = document.createElement('template');
  template.innerHTML = text;
  template.content.querySelectorAll('script,style,iframe,object,embed').forEach(element => element.remove());
  template.content.querySelectorAll('br').forEach(element => element.replaceWith(document.createTextNode(' ')));
  template.content.querySelectorAll('p,li,div,h1,h2,h3,h4,h5,pre,blockquote').forEach(element => element.append(document.createTextNode(' ')));
  return template.content.textContent.replace(/\s+/g, ' ').trim();
}

export default {
  name: "SFormBuilderRow",
  components: { BProductEditInfoIcon, USmartSwitch },
  emits: ["remove", "change", "move", "select", "arrange"],
  props: {
    item: {
      required: true,
      type: Object,
    },

    itemTypes: {
      required: true,
      type: Array,
    },
    collapse: Boolean,
    hasRequired: Boolean,
    modern: { type: Boolean, default: false },
    focused: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    position: Number,
    total: Number,
    readOnly: { type: Boolean, default: false },
    compact: { type: Boolean, default: false },
    first: Boolean,
    last: Boolean,
  },

  data: () => ({
    Slugify: Slugify,

    show_hints: false,
    edit_name: false,
    expanded: true,
    suppressArrangeClick: false,
    summaryClipped: false,
    titleClipped: false,
    summaryObserver: null,
    noteFormats: [
      { tag: 'b', icon: 'format_bold', label: 'format_bold' },
      { tag: 'i', icon: 'format_italic', label: 'format_italic' },
      { tag: 'h3', icon: 'title', label: 'format_heading' },
      { tag: 'list', icon: 'format_list_bulleted', label: 'format_list' },
      { tag: 'link', icon: 'link', label: 'format_link' },
    ],
  }),

  computed: {
    compactMode() { return this.modern && this.focused && this.compact; },
    compactIcon() { return ({ select: 'ListChecks', switch: 'ToggleLeft', file: 'Paperclip', note: 'StickyNote' })[this.item.type] || 'Text'; },
    compactTitle() {
      if (!this.compactMode) return '';
      if (this.item.type !== 'note') return this.item.title?.trim() || this.$t('add_product.inputs_modern.untitled');
      const first = this.plainNote(String(this.item.title || '').split(/<br\b[^>]*>|<\/p>|<\/li>/i)[0]);
      return first ? first.length > 72 ? first.slice(0, 72) + '…' : first : this.$t('add_product.inputs_modern.untitled_note');
    },
    compactDigest() {
      if (!this.compactMode) return '';
      const t = key => this.$t('add_product.inputs_modern.' + key);
      if (this.item.type === 'select') return `${t('select')} · ${this.$t('add_product.inputs_modern.choices_count', { count: this.item.selects?.length || 0 })} · ${t(this.item.multiple ? 'multiple_choices' : 'single_choice')}`;
      if (this.item.type === 'switch') return `${t('switch')} · ${t(this.item.default ? 'default_yes' : 'default_no')}`;
      if (this.item.type === 'file') return `${t(this.item.multiple ? 'multiple_files' : 'single_file')} · ${this.item.types?.join(', ') || t('no_file_types')}`;
      if (this.item.type === 'note') { const full = this.plainNote(this.item.title), body = full.startsWith(this.compactTitle) ? full.slice(this.compactTitle.length).trim() : full; return `${t('note')} · ${body || full || t('no_note')}`; }
      return `${t('text')} · ${this.item.hint?.trim() || t('no_hint')}`;
    },
    compactSummaryTooltip() { return this.titleClipped ? (this.item.type === 'note' ? this.plainNote(this.item.title) : this.item.title) + '\n' + this.compactDigest : this.compactDigest; },
    summaryTitle() {
      if (this.item.type !== 'note') return this.item.title;
      const text = String(this.item.title || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return text.length > 160 ? text.slice(0, 157) + '…' : text;
    },
    isExpanded() {
      return !this.collapse && (this.focused ? this.selected : this.expanded);
    },
    type() {
      const found = this.itemTypes.find(
        (type) => type.value === this.item.type,
      );
      return found ? found : this.itemTypes[0];
    },
  },
  watch: {
    compactTitle() { if (this.compactMode) this.$nextTick(this.measureSummary); },
    compactDigest() { if (this.compactMode) this.$nextTick(this.measureSummary); },
    collapse(value) { if (this.compactMode && value) this.suppressArrangeClick = true; },
    item: {
      handler() {
        this.$emit("change", this.item);
      },
      deep: true,
    },
  },
  created() {},
  mounted() {
    if (!this.compactMode) return;
    this.$nextTick(() => {
      this.measureSummary();
      if (typeof ResizeObserver !== 'undefined' && this.$refs.compactSummary) {
        this.summaryObserver = new ResizeObserver(() => this.measureSummary());
        this.summaryObserver.observe(this.$refs.compactSummary);
      }
    });
  },
  beforeUnmount() { this.summaryObserver?.disconnect(); },
  methods: {
    addToken(key) {
      if (this.readOnly || !this.compactMode || !['selects', 'types'].includes(key)) return;
      const control = key === 'selects' ? this.$refs.choicesInput : this.$refs.fileTypesInput;
      const input = control?.$el?.querySelector('input');
      if (!input || !control.search?.trim()) return;
      // Use the combobox's own Enter path, including duplicate handling and search cleanup.
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    },
    measureSummary() {
      const title = this.$refs.compactHeading, digest = this.$refs.compactDigestText;
      if (!title || !digest) return;
      this.titleClipped = title.scrollWidth > title.clientWidth + 1 || title.scrollHeight > title.clientHeight + 1 || (this.item.type === 'note' && this.plainNote(String(this.item.title || '').split(/<br\b[^>]*>|<\/p>|<\/li>/i)[0]).length > 72);
      this.summaryClipped = this.titleClipped || digest.scrollWidth > digest.clientWidth + 1 || digest.scrollHeight > digest.clientHeight + 1;
    },
    plainNote: plainFormNote,
    arrangeFields(event) {
      if (this.readOnly || !this.compactMode) return;
      if (this.suppressArrangeClick && event.detail !== 0) { this.suppressArrangeClick = false; return; }
      this.suppressArrangeClick = false;
      this.$emit('arrange', event.currentTarget);
    },
    formatNote(tag) {
      if (this.readOnly || this.item.type !== 'note') return;
      const input = this.$refs.titleInput?.$el?.querySelector('textarea');
      const wrappers = { b: ['<b>', '</b>'], i: ['<i>', '</i>'], h3: ['<h3>', '</h3>'], list: ['<ul><li>', '</li></ul>'], link: ['<a href="#">', '</a>'] };
      const pair = wrappers[tag];
      if (!input || !pair) return;
      const text = String(this.item.title || ''), start = input.selectionStart, end = input.selectionEnd;
      this.item.title = text.slice(0, start) + pair[0] + text.slice(start, end) + pair[1] + text.slice(end);
      this.$nextTick(() => { input.focus(); input.setSelectionRange(start + pair[0].length, end + pair[0].length); });
    },
    removeField() {
      if (this.readOnly) return;
      this.$emit("remove");
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--form-builder-container {
  position: relative;
  background: #0061e0;
  padding: 6px;
  border-radius: 14px;
  color: #fff;

  .s--form-builder-item {
    color: #000;
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    position: relative;
    transition: all 0.4s ease-in-out;

    &.-locked {
      border: solid #0061e0 3px;
    }
  }
}

.s-form-builder-row--modern {
  padding: 0;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border: 1px solid var(--sd-modern-border);
  border-radius: 12px;
  .s-form-builder-row__fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }
  .s-form-builder-row__header {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) auto;
    align-items: center;
    gap: 9px;
    padding: 12px;
  }
  .s-form-builder-row__summary {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
    color: inherit;
    text-align: start;
  }
  .s-form-builder-row__summary > .v-icon {
    flex: 0 0 16px;
    margin-block-start: 2px;
    color: var(--sd-modern-muted);
  }
  .s-form-builder-row__summary strong {
    display: block;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .s-form-builder-row__summary small {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.5;
  }
  .s-form-builder-row__summary .s-form-builder-row__note-summary {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  .s-form-builder-row__actions {
    display: flex;
    gap: 5px;
  }
  .s-form-builder-row__actions .sd-modern-icon-button {
    --sd-modern-icon-button-size: 32px;
  }
  .s-form-builder-row__actions :deep(.v-icon) {
    font-size: 16px !important;
  }
  .s-form-builder-row__fields {
    padding: 8px 18px 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .s-form-builder-row__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
  .s-form-builder-row__required {
    margin-block: 10px;
  }
  .s-form-builder-row__required :deep(.v-label) {
    font-size: 13px;
    opacity: 1;
  }
  .s-form-builder-row__hints {
    margin-block: 4px 8px;
    margin-inline-start: -8px;
  }
  .s-form-builder-row__switch {
    margin-block: 14px;
  }
  .s-form-builder-row__switch :deep(.row-hover) {
    padding: 12px !important;
    min-height: 64px;
    background: var(--sd-modern-inset) !important;
  }
  .s-form-builder-row__switch :deep(b) {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
  }
  .s-form-builder-row__switch :deep(.small) {
    font-size: 12px;
    line-height: 1.5;
  }
  .s-form-builder-row__switch :deep(.circle-check) {
    width: 20px;
    height: 20px;
  }
}
.s-form-builder-row--modern.s-form-builder-row--focused {
  overflow: hidden;
  &.is-selected { border-color: rgb(var(--v-theme-primary)); }
  .s-form-builder-row__header { grid-template-columns: 20px minmax(0, 1fr) auto; gap: 8px; width: 100%; margin: 0; min-height: 66px; padding: 12px 10px; }
  .s-form-builder-row__summary { align-items: center; gap: 10px; width: 100%; padding: 0; border: 0; background: transparent; font-family: inherit; }
  .s-form-builder-row__summary > span { flex: 1; min-width: 0; }
  .s-form-builder-row__summary > .v-icon:first-child { display: flex; align-items: center; justify-content: center; flex: 0 0 30px; width: 30px; height: 30px; padding: 7px; margin: 0; border-radius: 8px; background: var(--sd-modern-inset); font-size: 16px !important; }
  .s-form-builder-row__summary small { margin-block-start: 3px; }
  .s-form-builder-row__summary > .s-form-builder-row__chevron { flex: 0 0 14px; margin: 0; }
  .s-form-builder-row__fields { display: flex; flex-direction: column; gap: 12px; padding-block: 4px 18px; padding-inline: 48px 24px; background: var(--sd-modern-inset); }
  .s-form-builder-row__main-grid { display: contents; }
  .s-form-builder-row__identifier { order: 6; min-width: 0; margin-block-start: 4px; padding-block-start: 12px; border-block-start: 1px solid var(--sd-modern-border); }
  .s-form-builder-row__identifier summary { color: var(--sd-modern-muted); font-size: 11px; line-height: 1.5; list-style-position: inside; }
  .s-form-builder-row__identifier .v-input { margin-block-start: 10px; }
  .s-form-builder-row__title-input { order: 0; }
  .s-form-builder-row__hint-input { order: 1; }
  .s-form-builder-row__choices-input, .s-form-builder-row__switch { order: 2; }
  .s-form-builder-row__switch-hints { order: 3; gap: 14px 16px; }
  .s-form-builder-row__required { order: 4; margin: 0; }
  .s-form-builder-row__required :deep(.v-label) { font-size: 12px; font-weight: 400; }
  .s-form-builder-row__note-toolbar { display: flex; flex-wrap: wrap; gap: 6px; }
  .s-form-builder-row__note-toolbar .sd-modern-icon-button { --sd-modern-icon-button-size: 32px; }
  .s-form-builder-row__editor-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; order: 7; margin-block-start: 6px; color: var(--sd-modern-muted); font-size: 11px; }
  .sd-modern-underlined-field { --sd-modern-field-height: 56px; }
  .sd-modern-underlined-field :deep(.v-field__input) { font-size: 13px; font-weight: 400; line-height: 1.5; }
  .sd-modern-underlined-field :deep(input.v-field__input) { padding-block: 24px 8px; }
  .sd-modern-underlined-field :deep(.v-field-label--floating) { font-size: 11px; line-height: 16px; }
  .s-form-builder-row__switch { margin-block: 0; }
  .s-form-builder-row__switch :deep(b) { font-size: 12px; font-weight: 400; }
  .s-form-builder-row__switch :deep(.small) { font-size: 11px; }
}
@media (max-width: 600px), (pointer: coarse) {
  .s-form-builder-row--modern.s-form-builder-row--focused .s-form-builder-row__summary { min-height: 44px; }
  .s-form-builder-row--modern.s-form-builder-row--focused .s-form-builder-row__note-toolbar .sd-modern-icon-button { --sd-modern-icon-button-size: 44px; }
  .s-form-builder-row--modern.s-form-builder-row--focused .sd-modern-underlined-field :deep(.v-field__input) { font-size: 16px; }
}
@media (max-width: 480px) {
  .s-form-builder-row--modern.s-form-builder-row--focused {
    .s-form-builder-row__header { grid-template-columns: 18px minmax(0, 1fr) auto; gap: 4px; padding: 10px 7px; }
    .s-form-builder-row__header > .s-form-builder-row__actions { grid-column: auto; }
    .s-form-builder-row__summary > .v-icon:first-child { display: none; }
    .s-form-builder-row__fields { padding-inline: 14px; }
    .s-form-builder-row__grid { grid-template-columns: minmax(0, 1fr); }
  }
}
@media (max-width: 600px) {
  .s-form-builder-row--modern {
    .s-form-builder-row__header {
      grid-template-columns: 24px minmax(0, 1fr);
    }
    .s-form-builder-row__actions {
      grid-column: 2;
      justify-content: flex-end;
    }
    .s-form-builder-row__fields {
      padding-inline: 12px;
    }
    .s-form-builder-row__grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
    .s-form-builder-row__actions .sd-modern-icon-button {
      --sd-modern-icon-button-size: 44px;
    }
  }
}
@media (pointer: coarse) {
  .s-form-builder-row--modern
    .s-form-builder-row__actions
    .sd-modern-icon-button {
    --sd-modern-icon-button-size: 44px;
  }
}
.s-form-builder-row--modern.s-form-builder-row--focused.s-form-builder-row--compact {
  padding-block: 3px;
  border: 0;
  border-block-end: 1px solid var(--sd-modern-border);
  border-radius: 0;
  background: transparent;
  overflow: visible;
  &:last-child { border-block-end: 0; }
  .s-form-builder-row__compact-header { box-sizing: border-box; display: flex; align-items: center; gap: 7px; min-height: 79px; width: 100%; margin: 0; padding: 10px 9px; border-radius: 10px; }
  &.is-selected .s-form-builder-row__compact-header { min-height: 69px; }
  .s-form-builder-row__compact-header:hover { background: var(--sd-modern-inset); }
  .s-form-builder-row__grip { flex-shrink: 0; border: 0; background: transparent; color: var(--sd-modern-muted); cursor: grab; touch-action: none; }
  .s-form-builder-row__grip:active { cursor: grabbing; }
  .s-form-builder-row__compact-header > .sd-modern-icon-button { flex-shrink: 0; }
  .s-form-builder-row__summary { flex: 1; width: auto; min-width: 0; min-height: 44px; padding: 5px 3px; gap: 10px; }
  .s-form-builder-row__summary:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; border-radius: 8px; }
  .s-form-builder-row__summary > svg:first-child { flex: 0 0 18px; color: var(--sd-modern-muted); }
  .s-form-builder-row__summary strong { font-size: 13px; font-weight: 500; line-height: 20px; }
  &.is-selected .s-form-builder-row__summary strong { font-size: 14px; line-height: 21px; }
  .s-form-builder-row__summary small { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin-block-start: 3px; font-size: 12px; line-height: 18px; }
  .s-form-builder-row__chevron { flex: 0 0 14px; color: var(--sd-modern-muted); }
  &.is-selected .s-form-builder-row__chevron { transform: rotate(180deg); }
  .s-form-builder-row__fields { gap: 19px; padding-block: 0 21px; padding-inline: 53px 12px; border: 0; background: transparent; }
  .s-form-builder-row__hint-input { order: 4; }
  .s-form-builder-row__choices-input { order: 1; }
  .s-form-builder-row__mode-title { order: 1; margin: 0; font-size: 12px; font-weight: 500; line-height: 19px; }
  .s-form-builder-row__switch-hints { gap: 18px; }
  .s-form-builder-row__identifier { margin-block-start: 0; padding-block-start: 0; border: 0; }
  .s-form-builder-row__identifier summary { overflow-wrap: anywhere; font-size: 12px; line-height: 20px; }
  .s-form-builder-row__note-toolbar { gap: 6px; }
  .sd-modern-underlined-field { --sd-modern-field-height: 60px; min-width: 0; }
  .sd-modern-underlined-field :deep(.v-field__input) { box-sizing: border-box; font-size: 14px; line-height: 21px; }
  .sd-modern-underlined-field :deep(.v-field-label--floating) { font-size: 12px; line-height: 18px; }
  .s-form-builder-row__switch { margin: 0; }
  .s-form-builder-row__switch :deep(.row-hover) { box-sizing: border-box; min-height: 61px; padding: 13px !important; background: rgb(var(--v-theme-surface)) !important; }
  .s-form-builder-row__switch :deep(b) { font-size: 13px; font-weight: 500; line-height: 20px; }
  .s-form-builder-row__switch :deep(.small) { font-size: 11px; line-height: 18px; }
  @media (max-width: 600px), (pointer: coarse) { .s-form-builder-row__compact-header > .sd-modern-icon-button { --sd-modern-icon-button-size: 44px; } .sd-modern-underlined-field :deep(.v-field__input) { font-size: 16px; } }
  @media (max-width: 520px) {
    .s-form-builder-row__compact-header { gap: 2px; padding-inline: 3px; }
    .s-form-builder-row__summary { gap: 8px; }
    .s-form-builder-row__summary > svg:first-child { display: none; }
    .s-form-builder-row__summary small { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .s-form-builder-row__fields { padding-inline: 9px; }
    .s-form-builder-row__grid { gap: 18px; }
  }
  @media (max-width: 360px) { .s-form-builder-row__summary { padding-inline: 0; } }
}
</style>
