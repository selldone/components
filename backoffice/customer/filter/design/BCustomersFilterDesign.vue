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

<template>
  <div
    v-bind="$attrs"
    :class="{ 'b-customers-filter-design-modern text-start': modern }"
  >
    <draggable
      :model-value="modelValue"
      item-key="type"
      :class="
        modern
          ? 'b-customers-filter-design-modern__list'
          : 'list-group list-group-flush'
      "
      style="list-style-type: none"
      tag="div"
      v-bind="dragOptions"
      :move="
        (event) =>
          canMoveItem(
            event.draggedContext.index,
            event.draggedContext.futureIndex,
          )
      "
      @end="drag = false"
      @start="drag = true"
      @update:modelValue="
        (val) => {
          if (!readOnly) $emit('update:modelValue', val);
        }
      "
    >
      <template v-slot:item="{ element, index }">
        <li
          :class="[
            modern
              ? 'b-customers-filter-design-modern__row'
              : 'list-group-item',
            {
              'b-customers-filter-design-modern__row--fixed':
                modern && isPermanent(element),
            },
          ]"
          @click="!modern && editDialog(element)"
          :key="element.type"
        >
          <template v-if="modern">
            <span class="b-customers-filter-design-modern__number">{{
              index + 1
            }}</span>
            <v-icon
              v-if="!readOnly && !isPermanent(element)"
              class="b-customers-filter-design-modern__handle"
              size="18"
              aria-hidden="true"
              >drag_indicator</v-icon
            >
            <v-icon
              v-else-if="!readOnly && isPermanent(element)"
              class="b-customers-filter-design-modern__handle--fixed"
              size="18"
              aria-hidden="true"
              >drag_indicator</v-icon
            >
            <div
              v-if="
                readOnly || isPermanent(element) || element.type === 'LEVEL'
              "
              class="b-customers-filter-design-modern__edit b-customers-filter-design-modern__readonly"
            >
              <b-customers-filter-item
                :filter="element"
                :types="types"
                :modern="modern"
                read-only
              />
            </div>
            <button
              v-else
              type="button"
              class="b-customers-filter-design-modern__edit"
              @click="editDialog(element)"
            >
              <b-customers-filter-item
                :filter="element"
                :types="types"
                :modern="modern"
                read-only
              />
            </button>
            <div
              v-if="!readOnly && !isPermanent(element)"
              class="b-customers-filter-design-modern__actions"
            >
              <v-btn
                class="sd-modern-icon-button"
                icon
                variant="text"
                :disabled="!canMoveItem(index, index - 1)"
                :aria-label="`${$t('global.actions.previous')}: ${getName(element)}`"
                @click.stop="moveItem(index, -1)"
                ><v-icon size="18">arrow_upward</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  :open-on-focus="true"
                  :persistent="false"
                  content-class="sd-modern-tooltip text-start"
                  :text="`${$t('global.actions.previous')}: ${getName(element)}`"
              /></v-btn>
              <v-btn
                class="sd-modern-icon-button"
                icon
                variant="text"
                :disabled="!canMoveItem(index, index + 1)"
                :aria-label="`${$t('global.actions.next')}: ${getName(element)}`"
                @click.stop="moveItem(index, 1)"
                ><v-icon size="18">arrow_downward</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  :open-on-focus="true"
                  :persistent="false"
                  content-class="sd-modern-tooltip text-start"
                  :text="`${$t('global.actions.next')}: ${getName(element)}`"
              /></v-btn>
              <v-btn
                class="sd-modern-icon-button"
                icon
                variant="text"
                :aria-label="`${$t('global.actions.edit')}: ${getName(element)}`"
                @click.stop="editDialog(element)"
                ><v-icon size="18">edit</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  :open-on-focus="true"
                  :persistent="false"
                  content-class="sd-modern-tooltip text-start"
                  :text="`${$t('global.actions.edit')}: ${getName(element)}`"
              /></v-btn>
              <v-btn
                v-if="!isPermanent(element)"
                class="sd-modern-icon-button"
                icon
                variant="text"
                :aria-label="`${$t('global.actions.delete')}: ${getName(element)}`"
                @click.stop="deleteItem(index)"
                ><v-icon size="18">close</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  :open-on-focus="true"
                  :persistent="false"
                  content-class="sd-modern-tooltip text-start"
                  :text="`${$t('global.actions.delete')}: ${getName(element)}`"
              /></v-btn>
            </div>
          </template>
          <v-tooltip
            :location="modern ? 'top' : 'bottom'"
            :content-class="
              modern
                ? 'sd-modern-tooltip text-start'
                : 'bg-black text-start pa-2'
            "
            :open-on-focus="true"
            :open-on-click="modern"
            :persistent="false"
            :max-width="modern ? undefined : 360"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="modern"
                class="sd-modern-icon-button sd-modern-info-button"
                icon
                variant="text"
                :aria-label="getName(element)"
                v-bind="props"
                @click.stop
                ><v-icon size="16">info_outline</v-icon></v-btn
              >
              <v-icon
                v-else
                class="float-end ms-1 mt-1"
                color="amber"
                size="small"
                v-bind="props"
                >info
              </v-icon>
            </template>
            <p class="mb-1 font-weight-bold text-uppercase small">
              {{ getName(element) }}
            </p>
            <p class="small" v-html="getDescription(element.type)"></p>
          </v-tooltip>

          <b-customers-filter-item
            v-if="!modern"
            :filter="element"
            :types="types"
            :read-only="readOnly"
            dark
          >
          </b-customers-filter-item>

          <v-btn
            v-if="!modern && !readOnly && !isPermanent(element)"
            class="delete-button"
            icon
            size="small"
            title="Delete item"
            variant="text"
            @click="deleteItem(index)"
            @click.stop
          >
            <v-icon color="red" class="hover-scale-small"> close</v-icon>
          </v-btn>
        </li>
      </template>
    </draggable>

    <v-menu
      v-if="modern && hasAdd && !readOnly"
      :max-width="420"
      :max-height="520"
      content-class="sd-modern-menu sd-modern-select-menu text-start"
      :offset="8"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          class="sd-modern-button sd-modern-button--primary"
          variant="flat"
          prepend-icon="add"
          :disabled="!available_types.length"
        >
          {{ $t("global.actions.add") }} {{ $t("global.commons.filter") }}
        </v-btn>
      </template>
      <v-list
        class="b-customers-filter-design-modern__menu-list sd-modern-menu__list text-start"
        density="compact"
        lines="two"
      >
        <v-list-subheader
          class="b-customers-filter-design-modern__menu-heading"
        >
          {{ $t("user_funnel.workspace.menu_help") }}
        </v-list-subheader>
        <v-list-item
          v-for="item in available_types"
          :key="item.type"
          class="b-customers-filter-design-modern__menu-item sd-modern-clickable-item"
          :prepend-icon="item.icon"
          :subtitle="$t(item.description)"
          :title="$t(item.title)"
          @click="addDialog(item.type)"
        />
      </v-list>
    </v-menu>
    <v-list
      v-else-if="hasAdd && !readOnly"
      class="py-0 text-start border-between-vertical border"
      density="compact"
      rounded
      slim
      lines="two"
    >
      <v-list-item
        v-for="item in available_types"
        :key="item.type"
        :prepend-icon="item.icon"
        :subtitle="$t(item.description)"
        :title="$t(item.title)"
        variant="text"
        class="row-hover"
        @click="addDialog(item.type)"
      >
      </v-list-item>
    </v-list>
  </div>

  <!-- ==================== ADD DIALOG ===================== -->
  <v-dialog
    v-if="!readOnly"
    v-model="show_add"
    :content-class="modern ? 'text-start' : 'no-shadow-dialog'"
    :max-width="modern ? 600 : 540"
    :aria-label="add_type ? $t(add_type.title) : undefined"
    scrollable
  >
    <v-card
      v-if="add_type"
      class="text-start"
      :class="
        modern
          ? 'b-customers-filter-design-modern__dialog sd-modern-widget'
          : 'rounded-28px'
      "
      :light="!modern"
    >
      <v-card-title
        v-if="modern"
        class="b-customers-filter-design-modern__dialog-header sd-modern-header"
      >
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon :icon="add_type.icon" aria-hidden="true"
          /></span>
          <div>
            <p class="sd-modern-eyebrow">
              {{ $t(isEditing ? "global.actions.edit" : "global.actions.add") }}
              {{ $t("global.commons.filter") }}
            </p>
            <h2 class="sd-modern-title-text">{{ $t(add_type.title) }}</h2>
          </div>
        </div>
        <v-btn
          class="sd-modern-icon-button"
          icon
          variant="text"
          :aria-label="$t('global.actions.close')"
          @click="show_add = false"
        >
          <v-icon size="18">close</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            :persistent="false"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.actions.close") }}</v-tooltip
          >
        </v-btn>
      </v-card-title>
      <v-card-title v-else
        ><img
          class="me-2"
          height="24"
          src="../../../../assets/icons/funnel.svg"
        />
        {{ $t(add_type.title) }}
      </v-card-title>
      <v-card-text class="text-start">
        <p
          :class="{
            'sd-modern-subtitle b-customers-filter-design-modern__dialog-subtitle':
              modern,
          }"
        >
          {{ $t(add_type.description) }}
        </p>

        <div
          :class="{
            'b-customers-filter-design-modern__fields sd-modern-underlined-field':
              modern,
          }"
        >
          <div
            v-for="(input, key) in add_type.inputs"
            :key="key"
            :class="
              modern
                ? {
                    'b-customers-filter-design-modern__field': true,
                    'b-customers-filter-design-modern__field--full':
                      input.type !== 'date',
                  }
                : 'p-2'
            "
          >
            <u-date-input
              v-if="input.type === 'date'"
              v-model="add_item[key]"
              :label="getInputLabel(input, key)"
              clearable
              :placeholder="
                modern ? $t('user_funnel.workspace.select_date') : 'Select date'
              "
              return-utc
              variant="underlined"
            />

            <u-smart-switch
              v-else-if="input.type === 'boolean'"
              v-model="add_item[key]"
              :false-description="
                input.false_description
                  ? $t(input.false_description)
                  : undefined
              "
              :false-title="
                input.false_title
                  ? $t(input.false_title)
                  : modern
                    ? $t('global.actions.no')
                    : 'No'
              "
              :label="getInputLabel(input, key)"
              :aria-label="modern ? getInputLabel(input, key) : undefined"
              :true-description="
                input.true_description ? $t(input.true_description) : undefined
              "
              :true-title="
                input.true_title
                  ? $t(input.true_title)
                  : modern
                    ? $t('global.actions.yes')
                    : 'Yes'
              "
              inset
              :accessible="modern"
              :class="{ 'sd-modern-smart-select': modern }"
              :border="modern ? true : undefined"
            ></u-smart-switch>

            <u-number-input
              v-else-if="input.type === 'number'"
              v-model="add_item[key]"
              :label="getInputLabel(input, key)"
              variant="underlined"
            ></u-number-input>

            <v-select
              v-else-if="input.type === 'enum'"
              v-model="add_item[key]"
              :chips="input.chips"
              :item-title="
                (it) => $t(input.item_text ? it[input.item_text] : it.name)
              "
              :item-value="input.item_value ? input.item_value : 'code'"
              :items="input.items"
              :label="getInputLabel(input, key)"
              :multiple="input.multiple"
              :menu-props="
                modern
                  ? { contentClass: 'sd-modern-select-menu text-start' }
                  : undefined
              "
              closable-chips
              variant="underlined"
            ></v-select>

            <s-country-select
              v-else-if="input.type === 'countries'"
              v-model="add_item[key]"
              chips
              item-value="alpha2"
              :label="modern ? getInputLabel(input, key) : undefined"
              multiple
              variant="underlined"
            ></s-country-select>

            <template v-else-if="input.type === 'segments'">
              <v-combobox
                v-model="add_item[key]"
                v-model:search="segment_input"
                :items="segments"
                :label="getInputLabel(input, key)"
                :messages="
                  input.description ? $t(input.description) : undefined
                "
                chips
                closable-chips
                multiple
                variant="underlined"
              >
                <template v-slot:chip="{ item, props }">
                  <v-chip v-bind="props">
                    <v-icon :color="item.raw.toColor(true)" start
                      >circle</v-icon
                    >
                    {{ item.raw }}
                  </v-chip>
                </template>

                <template v-slot:item="{ item, props }">
                  <v-list-item :title="item.raw" v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.toColor(true)"
                        class="me-1"
                        size="small"
                        >circle
                      </v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-combobox>

              <u-smart-switch
                v-model="add_item['or']"
                :false-description="
                  modern
                    ? $t('user_funnel.workspace.all_segments_help')
                    : 'Customers who are in all of these segments.'
                "
                false-icon="join_inner"
                :false-title="
                  modern ? $t('user_funnel.workspace.all_segments') : 'AND'
                "
                :label="modern ? $t('user_funnel.workspace.logic') : 'Logic'"
                :aria-label="
                  modern ? $t('user_funnel.workspace.logic') : undefined
                "
                :true-description="
                  modern
                    ? $t('user_funnel.workspace.any_segment_help')
                    : 'Customers who are in each of these segments. '
                "
                true-icon="join_full"
                :accessible="modern"
                :true-title="
                  modern ? $t('user_funnel.workspace.any_segment') : 'OR'
                "
                :class="{ 'sd-modern-smart-select': modern }"
                :border="modern ? true : undefined"
              >
              </u-smart-switch>
            </template>

            <v-combobox
              v-else-if="input.type === 'combobox'"
              v-model="add_item[key]"
              v-model:search="segment_input"
              :items="segments"
              :label="getInputLabel(input, key)"
              :messages="input.description ? $t(input.description) : undefined"
              chips
              closable-chips
              multiple
              variant="underlined"
            >
            </v-combobox>
          </div>
        </div>
        <p
          v-if="modern && !Object.keys(add_type.inputs || {}).length"
          class="sd-modern-notice"
        >
          {{ $t("user_funnel.workspace.no_options") }}
        </p>
        <p v-if="modern" class="b-customers-filter-design-modern__draft-help">
          {{ $t("user_funnel.workspace.draft_help") }}
        </p>
      </v-card-text>
      <v-card-actions>
        <div
          :class="
            modern
              ? 'b-customers-filter-design-modern__dialog-actions sd-modern-actions'
              : 'widget-buttons'
          "
        >
          <v-btn
            :class="{ 'sd-modern-button': modern }"
            :size="modern ? undefined : 'x-large'"
            variant="text"
            @click="show_add = false"
          >
            <v-icon start>close</v-icon>
            {{ $t(modern ? "global.actions.cancel" : "global.actions.close") }}
          </v-btn>

          <v-btn
            :class="
              modern
                ? 'sd-modern-button sd-modern-button--primary'
                : 'min-width-200'
            "
            color="primary"
            :size="modern ? undefined : 'x-large'"
            :variant="modern ? 'flat' : 'elevated'"
            @click="add"
          >
            <v-icon start>save</v-icon>

            {{ $t(modern ? "global.actions.apply" : "global.actions.set") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import UDateInput from "../../../../ui/date/input/UDateInput.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import SCountrySelect from "../../../../ui/country/select/SCountrySelect.vue";
import BCustomersFilterItem from "../../../customer/filter/item/BCustomersFilterItem.vue";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import { defineAsyncComponent } from "vue";

export default {
  name: "BCustomersFilterDesign",
  components: {
    USmartSwitch,
    BCustomersFilterItem,
    SCountrySelect,
    UNumberInput,
    UDateInput,
    draggable: defineAsyncComponent(() => import("vuedraggable")),
  },
  emits: ["update:modelValue"],
  props: {
    readOnly: { type: Boolean, default: false },
    modern: {
      type: Boolean,
      default: false,
    },
    types: {
      require: true,
      type: Object,
    },
    modelValue: {},
    hasAdd: {
      default: true,
      type: Boolean,
    },
    permanentFilters: {
      type: Array,
    },

    segments: {},
  },

  data: () => ({
    drag: false,
    index: 0,
    // list: [],

    //-------------
    show_add: false,
    add_type: null,
    add_item: null,

    segment_input: null,
  }),

  computed: {
    isEditing() {
      return (
        this.add_type &&
        this.modelValue?.some((item) => item.type === this.add_type.type)
      );
    },
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: this.readOnly,
        ghostClass: this.modern
          ? "b-customers-filter-design-modern__ghost"
          : "ghost",
        ...(this.modern
          ? { handle: ".b-customers-filter-design-modern__handle" }
          : {}),
      };
    },

    available_types() {
      return Object.values(this.types).filter(
        (type) => !this.modelValue.some((item) => item.type === type.type),
      );
    },
  },

  watch: {
    readOnly(value) {
      if (!value) return;
      this.show_add = false;
      this.add_type = null;
      this.add_item = null;
      this.drag = false;
    },
  },

  created() {
    if (!this.modelValue && !this.readOnly) this.$emit("update:modelValue", []);
  },
  methods: {
    getInputLabel(input, key) {
      if (
        this.modern &&
        [
          "start",
          "end",
          "levels",
          "subscribed",
          "sex",
          "countries",
          "limit",
          "segments",
        ].includes(key)
      ) {
        return this.$t(`user_funnel.workspace.fields.${key}`);
      }
      return this.$t(input.title);
    },
    canMoveItem(index, target) {
      if (this.readOnly) return false;
      if (!this.modern) return true;
      if (
        index < 0 ||
        target < 0 ||
        index >= this.modelValue.length ||
        target >= this.modelValue.length
      )
        return false;
      return !this.modelValue
        .slice(Math.min(index, target), Math.max(index, target) + 1)
        .some((item) => this.isPermanent(item));
    },
    moveItem(index, delta) {
      if (this.readOnly) return;
      const target = index + delta;
      if (target < 0 || target >= this.modelValue.length) return;
      if (this.modern && !this.canMoveItem(index, target)) return;
      const items = [...this.modelValue];
      const [item] = items.splice(index, 1);
      items.splice(target, 0, item);
      this.$emit("update:modelValue", items);
    },
    isPermanent(filter) {
      return (
        this.permanentFilters &&
        this.permanentFilters.some((item) => item.type === filter.type)
      );
    },

    deleteItem(index) {
      if (
        this.readOnly ||
        (this.modern &&
          (!this.modelValue[index] || this.isPermanent(this.modelValue[index])))
      )
        return;
      this.modelValue.splice(index, 1);
      this.$emit("update:modelValue", this.modelValue);
    },
    add() {
      if (this.readOnly) return;
      if (this.modern) {
        const items = [...this.modelValue];
        this.AddOrUpdateItemByID(items, this.add_item, "type");
        this.$emit("update:modelValue", items);
      } else {
        this.AddOrUpdateItemByID(this.modelValue, this.add_item, "type");
      }
      this.show_add = false;
      this.add_type = null;
      this.add_item = null;
    },

    getDescription(type) {
      if (!this.types[type]) return null;
      return this.$t(this.types[type].description);
    },
    getName(item) {
      if (!this.types[item.type]) return null;
      return this.$t(this.types[item.type].title);
    },

    getIcon(item) {
      if (!this.types[item.type]) return null;
      return this.types[item.type].icon;
    },
    addDialog(type) {
      if (this.readOnly) return;
      this.add_type = this.types[type];
      this.add_item = {
        type: this.add_type.type,
      };
      this.show_add = true;
    },
    editDialog(item) {
      if (this.readOnly || (this.modern && (!item || this.isPermanent(item))))
        return;
      // Modern dialog edits stay isolated until Apply, including array selections.
      this.add_item = this.modern ? JSON.parse(JSON.stringify(item)) : item;
      this.add_type = this.types[item.type];
      this.show_add = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-customers-filter-design-modern {
  &__ghost {
    opacity: 0.5;
    background: rgba(var(--v-theme-on-surface), 0.04);
  }

  &__dialog.sd-modern-widget.v-card {
    border-radius: 18px;

    > .v-card-title {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: nowrap;
      gap: 16px;
      padding: 0;
      margin-block-end: 20px;
      font-size: 18px;
      white-space: normal;
    }

    > .v-card-text {
      padding: 0;
      font-size: var(--sd-modern-font-body, 14px);
      line-height: 1.6;
    }

    > .v-card-actions {
      padding: 0;
      margin-block-start: 24px;
      padding-block-start: 20px;
      border-block-start: 1px solid var(--sd-modern-border);
    }
  }
  &__dialog-header.sd-modern-header {
    align-items: flex-start;
    flex-wrap: nowrap;

    .sd-modern-title-text {
      font-size: 18px;
      font-weight: 500;
      line-height: 27px;
    }
    .sd-modern-eyebrow {
      font-size: 11px;
      line-height: 18px;
      margin-block-end: 3px;
    }
  }
  &__dialog-subtitle.sd-modern-subtitle {
    margin: 0 0 24px;
    font-size: 14px;
    line-height: 22px;
  }
  &__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 24px;
  }
  &__field {
    min-width: 0;
  }
  &__field--full {
    grid-column: 1 / -1;
  }
  &__field > .sd-modern-smart-select {
    margin-block-start: 20px;
  }
  &__draft-help {
    margin: 24px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
  }
  &__dialog-actions.sd-modern-actions {
    justify-content: flex-end;
    width: 100%;

    > .v-btn {
      margin-inline-start: 0;
    }
  }
  &__menu-list.sd-modern-menu__list.v-list {
    max-width: calc(100vw - 32px);
    max-height: min(520px, calc(100dvh - 48px));
    overflow-y: auto;
    padding: 8px;
    border: 1px solid
      var(--sd-modern-border, rgba(var(--v-theme-on-surface), 0.09));
    border-radius: 16px;
  }
  &__menu-heading {
    min-height: 0;
    padding: 10px 12px;
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.65));
    font-size: 13px;
    line-height: 20px;
    white-space: normal;
  }
  &__menu-item.v-list-item {
    min-height: 64px;
    padding: 12px;
    border-radius: 10px;

    :deep(.v-list-item-title) {
      font-size: 14px;
      font-weight: 400;
      line-height: 21px;
      white-space: normal;
    }
    :deep(.v-list-item-subtitle) {
      display: block;
      margin-block-start: 3px;
      color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.65));
      opacity: 1;
      font-size: 13px;
      line-height: 20px;
      white-space: normal;
    }
    :deep(.v-list-item__prepend > .v-icon) {
      font-size: 20px;
      opacity: 1;
    }
    :deep(.v-list-item__spacer) {
      width: 12px;
    }
  }

  &__list {
    margin: 0 0 22px;
    padding: 0;
  }
  &__row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    padding-block: 20px;
    list-style: none;
    border-block-end: 1px solid var(--sd-modern-border);
    color: rgb(var(--v-theme-on-surface));
    font-size: 13px;
    line-height: 1.6;
  }
  &__number {
    color: var(--sd-modern-muted);
    font-size: 11px;
    min-width: 14px;
  }
  &__handle,
  &__handle--fixed {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 28px;
    width: 28px;
    height: 32px;
    min-width: 28px;
    min-height: 32px;
    color: var(--sd-modern-muted);
  }
  &__handle {
    cursor: grab;
    touch-action: none;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  }
  &__handle--fixed {
    opacity: 0.4;
    cursor: default;
  }
  &__row--fixed &__readonly {
    color: var(--sd-modern-muted);
  }
  &__edit {
    flex: 1;
    min-width: 140px;
    padding: 8px 0;
    border: 0;
    color: inherit;
    background: transparent;
    font: inherit;
    text-align: start;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 4px;
      border-radius: 4px;
    }
  }
  &__actions {
    display: flex;
    flex-wrap: wrap;
    max-width: 100%;
    gap: 5px;
  }
  &__readonly {
    cursor: default;
  }
  @media (max-width: 599px), (pointer: coarse) {
    &__handle,
    &__handle--fixed {
      flex-basis: 44px;
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
    }
  }
  @media (max-width: 599px) {
    &__dialog.sd-modern-widget {
      padding: 20px;
    }
    &__fields {
      grid-template-columns: minmax(0, 1fr);
    }
    &__fields :deep(.v-field.v-field--variant-underlined .v-field__input) {
      font-size: 16px;
    }
    &__dialog-actions > .v-btn {
      min-height: 44px;
    }
    &__row {
      gap: 8px;
    }
    &__actions {
      margin-inline-start: 34px;
    }
    &__edit {
      min-width: calc(100% - 80px);
    }
  }
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
  color: #333;
}

.list-group {
  min-height: 32px;
  padding: 18px 8px;
}

.list-group-item {
  text-align: center;
  cursor: move;
  padding: 4px;
  position: relative;
  list-style: none;
  background-color: rgba(0, 0, 0, 0.95);
  color: white;
  user-select: none;
  margin-bottom: 2px;

  i {
    color: white !important;
  }

  span {
    user-select: none;
  }

  .delete-button {
    position: absolute;
    left: 4px;
    top: 50%;
    transform: translate(0, -50%);
    margin: 0;
    margin-right: 4px;
  }

  /* &:after {
    float: end;
    font-family: "Font Awesome 7 Free";
    font-weight: 900;
    content: " \f0dd";
  }*/
}

.v-locale--is-rtl {
  .list-group-item {
    .delete-button {
      left: unset;
      right: 4px;
    }
  }
}
</style>
