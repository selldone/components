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
  <div v-bind="$attrs">
    <draggable
      :model-value="modelValue"
      class="list-group list-group-flush"
      style="list-style-type: none"
      tag="div"
      v-bind="dragOptions"
      @end="drag = false"
      @start="drag = true"
      @update:modelValue="(val) => $emit('update:modelValue', val)"
    >
      <template v-slot:item="{ element, index }">
        <li
          class="list-group-item"
          @click="editDialog(element)"
          :key="element.type"
        >
          <v-tooltip
            location="bottom"
            content-class="bg-black text-start pa-2 "
          >
            <template v-slot:activator="{ props }">
              <v-icon
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
            :filter="element"
            :types="types"
            dark
          >
          </b-customers-filter-item>

          <v-btn
            v-if="!isPermanent(element)"
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

    <v-list
      v-if="hasAdd"
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
    <v-card v-if="add_type" class="rounded-28px text-start" light>
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
          <v-btn size="x-large" variant="text" @click="show_add = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            class="min-width-200"
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
        ghostClass: "ghost",
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
