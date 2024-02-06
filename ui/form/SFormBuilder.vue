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
  <div class="s--form-builder widget-box">
    <s-widget-header :title="title" :icon="icon"></s-widget-header>
    <v-list-subheader>{{ hint }}</v-list-subheader>

    <v-scale-transition group tag="div">
      <div
        v-for="(item, index) in structure"
        :key="index"
        class="s--form-builder-item pt-6"
        :class="{
          '-locked':
            item.locked /*Locked item - ex. variants field for virtual products*/,
        }"
      >
        <b class="absolute-top-start mx-2 small"
          >● {{ getName(item.type ? item.type : "Text") }}</b
        >
        <!-- General Attributes -->
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Note ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <template v-if="item.type === 'note'">
          <v-textarea
            v-model="item.title"
            :label="$t('global.commons.note')"
            placeholder="Writer your message here..."
            messages="Allowed tags: <h1>...<h5>, <br>, <b>, <i>, <a>,<ol>,<ul>, <li>, <hr>, <img>"
            color="primary"
          />
          <s-circle-button
            icon="close"
            :title="$t('global.actions.delete')"
            color="#D32F2F"
            class="absolute-top-end"
            @click="removeField(index)"
          />
        </template>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Inputs ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <template v-else>
          <v-text-field
            v-model="item.title"
            :label="$t('global.form_builder.title_input')"
            hint="Public label. Ex: Name, Prefer state, Description, ..."
            color="primary"
            @blur="
              item.name = item.name ? item.name : slugify(item.title);
              $forceUpdate();
            "
          />

          <div v-if="edit_name !== index">
            <div class="d-flex justify-space-between pb-6 px-2">
              <div>
                <small>{{ $t("global.form_builder.name_input") }}</small
                ><br />
                <b>{{ item.name ? item.name : "Auto generate.." }}</b>
              </div>

              <v-btn @click="edit_name = index" icon>
                <v-icon small>edit</v-icon>
              </v-btn>
            </div>
          </div>
          <div v-else>
            <v-text-field
              v-model="item.name"
              :label="$t('global.form_builder.name_input')"
              hint="Ex: name, state, desc, ... Only lowercase Latin characters and numbers are permitted, and no whitespace is allowed."
              color="primary"
              :disabled="item.locked"
              :append-inner-icon="item.locked ? 'lock' : undefined"
            />
          </div>

          <s-circle-button
            icon="close"
            :title="$t('global.actions.delete')"
            color="#D32F2F"
            class="absolute-top-end"
            @click="removeField(index)"
          />

          <!-- select -->
          <template v-if="item.type === 'select'">
            <v-combobox
              v-model="item.selects"
              :items="[]"
              :label="$t('global.form_builder.value_input')"
              :messages="$t('global.form_builder.value_input_message')"
              chips
              clearable
              multiple
            >
              <template v-slot:selection="data">
                <v-chip
                  :input-value="data.selected"
                  close
                  color="#222"
                  dark
                  small
                  @click:close="removeChip(item.selects, data.item)"
                >
                  {{ data.item }}
                </v-chip>
              </template>
            </v-combobox>

            <s-smart-switch
              v-model="item.multiple"
              true-title="Multiple items"
              false-title="Single item"
              true-description="User can select more than one item."
              false-description="User can select just one item."
              @change="$forceUpdate()"
              class="mt-3"
            >
            </s-smart-switch>
          </template>

          <!-- switch -->

          <s-smart-switch
            v-if="item.type === 'switch'"
            v-model="item.default"
            :true-title="$t('global.form_builder.default') + ': True'"
            :false-title="$t('global.form_builder.default') + ': False'"
            :true-description="item.hint_true"
            :false-description="item.hint_false"
            true-icon="check"
            false-icon="close"
            @change="$forceUpdate()"
            class="mt-3"
          >
          </s-smart-switch>

          <!-- Upload file -->
          <template v-if="item.type === 'file'">
            <v-combobox
              v-model="item.types"
              :items="['jpeg', 'png', 'zip', 'pdf']"
              :label="$t('global.form_builder.file_type_input')"
              :messages="$t('global.form_builder.file_type_message')"
              placeholder="*.*"
              chips
              clearable
              multiple
              persistent-placeholder
            >
              <template v-slot:selection="data">
                <v-chip
                  :input-value="data.selected"
                  close
                  color="#222"
                  dark
                  small
                  @click:close="removeChip(item.types, data.item)"
                >
                  {{ data.item }}
                </v-chip>
              </template>
            </v-combobox>

            <s-smart-switch
              v-model="item.multiple"
              true-title="Multiple files"
              false-title="Single file"
              true-description="User can upload more than one file."
              false-description="User can upload just one file."
              @change="$forceUpdate()"
            >
            </s-smart-switch>
          </template>

          <!-- -------------- Hints -------------- -->
          <v-btn
            text
            color="primary"
            class="tnt mt-2"
            @click="show_hints.toggle(index)"
            small
            ><v-icon>arrow_drop_down</v-icon> Edit hints</v-btn
          >

          <v-expand-transition>
            <div v-if="show_hints.includes(index) && item.type === 'switch'">
              <v-text-field
                v-model="item.hint_true"
                title="Hint True"
                placeholder="Some instruction to guide customer..."
              ></v-text-field>
              <v-text-field
                v-model="item.hint_false"
                title="Hint False"
                placeholder="Some instruction to guide customer..."
              ></v-text-field>
            </div>
            <div v-else-if="show_hints.includes(index)">
              <v-text-field
                v-model="item.hint"
                title="Hint"
                placeholder="Some instruction to guide customer..."
              ></v-text-field>
            </div>
          </v-expand-transition>
        </template>
      </div>
    </v-scale-transition>
    <div class="text-end m-3">
      <v-menu offset-y :min-width="120">
        <template v-slot:activator="{ on }">
          <v-btn depressed dark color="primary" v-on="on">
            <v-icon small class="me-1">add</v-icon>
            {{ $t("global.form_builder.add_item_action") }}
          </v-btn>
        </template>
        <v-list class="text-start">
          <v-list-item
            v-for="(item_type, index) in item_types"
            :key="index"
            @click="addField(item_type.value)"
          >
            <v-list-item-icon
              ><v-icon small>{{ item_type.icon }}</v-icon></v-list-item-icon
            >
            <v-list-item-title>{{ item_type.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <slot></slot>
  </div>
</template>

<script>
import SSmartSwitch from "@components/smart/SSmartSwitch.vue";
export default {
  name: "SFormBuilder",
  components: { SSmartSwitch },
  props: {
    structure: {
      required: false,
      type: Array,
    },
    title: {
      required: false,
      type: String,
    },
    hasFile: {
      default: false,
      type: Boolean,
    },
    icon: {},
    hint: {},
  },

  data: () => ({
    show_hints: [],
    edit_name: null,
  }),

  computed: {
    item_types() {
      return [
        {
          title: this.$t("global.form_builder.types.simple"),
          value: null,
          icon: "fa:fas fa-paragraph",
        },
        {
          title: this.$t("global.form_builder.types.selective"),
          value: "select",
          icon: "fa:fas fa-list-ul",
        },
        {
          title: this.$t("global.form_builder.types.switch"),
          value: "switch",
          icon: "fa:fas fa-toggle-on",
        },
        ...(this.hasFile
          ? [
              {
                title: this.$t("global.form_builder.types.file"),
                value: "file",
                icon: "fa:fas fa-file",
              },
            ]
          : []),

        {
          title: this.$t("global.commons.note"),
          value: "note",
          icon: "fa:fas fa-sticky-note",
        },
      ];
    },
  },
  created() {
    if (!this.structure || !Array.isArray(this.structure))
      this.$emit("update:structure", []);
  },
  methods: {
    addField(type) {
      //console.log('addField',type)
      this.structure.push({ name: "", title: "", type: type });
      this.$emit("update:structure", this.structure.slice());
      this.$forceUpdate(); // Force refresh component!
    },

    removeField(index) {
      this.structure.splice(index, 1);
      this.$emit("update:structure", this.structure.slice());
      this.$forceUpdate(); // Force refresh component!
    },

    removeChip(chips, item) {
      chips.splice(chips.indexOf(item), 1);
      chips = [...chips];
    },
  },
};
</script>

<style scoped lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--form-builder {
  .s--form-builder-item {
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    margin: 8px;
    margin-bottom: 24px;
    position: relative;
    transition: all 0.4s ease-in-out;

    .v-input {
      margin: 0.5em;
    }
    &:hover {
      box-shadow: 0 2px 43px -4px rgba(0, 0, 0, 0.19);
    }

    &.-locked {
      border: solid #0061e0 3px;
    }
  }
}
</style>
