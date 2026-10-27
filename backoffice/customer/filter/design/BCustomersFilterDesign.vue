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
      :class="
        modern
          ? 'b-customers-filter-design-modern__list'
          : 'list-group list-group-flush'
      "
      style="list-style-type: none"
      tag="div"
      v-bind="dragOptions"
      @end="drag = false"
      @start="drag = true"
      @update:modelValue="(val) => $emit('update:modelValue', val)"
    >
      <template v-slot:item="{ element, index }">
        <li
          :class="
            modern ? 'b-customers-filter-design-modern__row' : 'list-group-item'
          "
          @click="!modern && editDialog(element)"
          :key="element.type"
        >
          <template v-if="modern">
            <span class="b-customers-filter-design-modern__number">{{
              index + 1
            }}</span>
            <v-icon
              class="b-customers-filter-design-modern__handle"
              size="18"
              aria-hidden="true"
              >drag_indicator</v-icon
            >
            <button
              type="button"
              class="b-customers-filter-design-modern__edit"
              @click="editDialog(element)"
            >
              <b-customers-filter-item
                :filter="element"
                :types="types"
                read-only
              />
            </button>
            <div class="b-customers-filter-design-modern__actions">
              <v-btn
                class="sd-modern-icon-button"
                icon
                variant="text"
                :disabled="index === 0"
                :aria-label="`${$t('global.actions.previous')}: ${getName(element)}`"
                @click.stop="moveItem(index, -1)"
                ><v-icon size="18">arrow_upward</v-icon></v-btn
              >
              <v-btn
                class="sd-modern-icon-button"
                icon
                variant="text"
                :disabled="index === modelValue.length - 1"
                :aria-label="`${$t('global.actions.next')}: ${getName(element)}`"
                @click.stop="moveItem(index, 1)"
                ><v-icon size="18">arrow_downward</v-icon></v-btn
              >
              <v-btn
                class="sd-modern-icon-button"
                icon
                variant="text"
                :aria-label="`${$t('global.actions.edit')}: ${getName(element)}`"
                @click.stop="editDialog(element)"
                ><v-icon size="18">edit</v-icon></v-btn
              >
              <v-btn
                v-if="!isPermanent(element)"
                class="sd-modern-icon-button"
                icon
                variant="text"
                :aria-label="`${$t('global.actions.delete')}: ${getName(element)}`"
                @click.stop="deleteItem(index)"
                ><v-icon size="18">close</v-icon></v-btn
              >
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
            max-width="360"
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
            dark
          >
          </b-customers-filter-item>

          <v-btn
            v-if="!modern && !isPermanent(element)"
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

    <v-menu v-if="modern && hasAdd" max-width="420" content-class="text-start">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          class="sd-modern-button sd-modern-button--primary"
          variant="flat"
          prepend-icon="add"
        >
          {{ $t("global.actions.add") }} {{ $t("global.commons.filter") }}
        </v-btn>
      </template>
      <v-list class="text-start" density="compact" lines="two">
        <v-list-item
          v-for="item in available_types"
          :key="item.type"
          :prepend-icon="item.icon"
          :subtitle="$t(item.description)"
          :title="$t(item.title)"
          @click="addDialog(item.type)"
        />
      </v-list>
    </v-menu>
    <v-list
      v-else-if="hasAdd"
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
    v-model="show_add"
    content-class="no-shadow-dialog"
    max-width="540"
    scrollable
  >
    <v-card
      v-if="add_type"
      class="rounded-28px text-start"
      :class="{
        'b-customers-filter-design-modern__dialog sd-modern-widget': modern,
      }"
      :light="!modern"
    >
      <v-card-title
        ><img
          class="me-2"
          height="24"
          src="../../../../assets/icons/funnel.svg"
        />
        {{ $t(add_type.title) }}
      </v-card-title>
      <v-card-text class="text-start">
        <p>{{ $t(add_type.description) }}</p>

        <div v-for="(input, key) in add_type.inputs" :key="key" class="p-2">
          <u-date-input
            v-if="input.type === 'date'"
            v-model="add_item[key]"
            :label="$t(input.title)"
            clearable
            placeholder="Select date"
            return-utc
            variant="underlined"
          />

          <u-smart-switch
            v-else-if="input.type === 'boolean'"
            v-model="add_item[key]"
            :false-description="
              input.false_description ? $t(input.false_description) : undefined
            "
            :false-title="input.false_title ? $t(input.false_title) : 'No'"
            :label="$t(input.title)"
            :true-description="
              input.true_description ? $t(input.true_description) : undefined
            "
            :true-title="input.true_title ? $t(input.true_title) : 'Yes'"
            inset
          ></u-smart-switch>

          <u-number-input
            v-else-if="input.type === 'number'"
            v-model="add_item[key]"
            :label="$t(input.title)"
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
            :label="$t(input.title)"
            :multiple="input.multiple"
            closable-chips
            variant="underlined"
          ></v-select>

          <s-country-select
            v-else-if="input.type === 'countries'"
            v-model="add_item[key]"
            chips
            item-value="alpha2"
            multiple
            variant="underlined"
          ></s-country-select>

          <template v-else-if="input.type === 'segments'">
            <v-combobox
              v-model="add_item[key]"
              v-model:search="segment_input"
              :items="segments"
              :label="$t(input.title)"
              :messages="$t(input.description)"
              chips
              closable-chips
              multiple
              variant="underlined"
            >
              <template v-slot:chip="{ item, props }">
                <v-chip v-bind="props">
                  <v-icon :color="item.raw.toColor(true)" start>circle</v-icon>
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
              false-description="Customers who are in all of these segments."
              false-icon="join_inner"
              false-title="AND"
              label="Logic"
              true-description="Customers who are in each of these segments. "
              true-icon="join_full"
              true-title="OR"
            >
            </u-smart-switch>
          </template>

          <v-combobox
            v-else-if="input.type === 'combobox'"
            v-model="add_item[key]"
            v-model:search="segment_input"
            :items="segments"
            :label="$t(input.title)"
            :messages="$t(input.description)"
            chips
            closable-chips
            multiple
            variant="underlined"
          >
          </v-combobox>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            :class="{ 'sd-modern-button': modern }"
            size="x-large"
            variant="text"
            @click="show_add = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :class="modern ? 'sd-modern-button' : 'min-width-200'"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="add"
          >
            <v-icon start>save</v-icon>

            {{ $t("global.actions.set") }}
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
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
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

  watch: {},

  created() {
    if (!this.modelValue) this.$emit("update:modelValue", []);
  },
  methods: {
    moveItem(index, delta) {
      const target = index + delta;
      if (target < 0 || target >= this.modelValue.length) return;
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
      this.modelValue.splice(index, 1);
      this.$emit("update:modelValue", this.modelValue);
    },
    add() {
      this.AddOrUpdateItemByID(this.modelValue, this.add_item, "type");
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
      this.add_type = this.types[type];
      this.add_item = {
        type: this.add_type.type,
      };
      this.show_add = true;
    },
    editDialog(item) {
      this.add_item = item;
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

  &__dialog {
    :deep(.v-card-title) {
      padding: 0;
      margin-block-end: 20px;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.4;
    }

    :deep(.v-card-text) {
      padding: 0;
      font-size: 13px;
      line-height: 1.7;
    }

    :deep(.v-card-actions) {
      padding: 0;
      margin-block-start: 20px;
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
  &__handle {
    color: var(--sd-modern-muted);
    cursor: grab;
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
  @media (max-width: 599px) {
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
