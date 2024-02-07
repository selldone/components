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
  <div class="s--form-builder-container">
    <v-row no-gutters align="center">
      <v-icon class="me-3 cursor-move drag--handle" title="Drag and move"
        >menu</v-icon
      >

      <v-icon>{{ type?.icon }}</v-icon>
      <b class="mx-2 small flex-grow-1">{{ getName(type?.title) }}</b>

      <s-circle-button
        icon="close"
        :title="$t('global.actions.delete')"
        color="#fff"
        @click="removeField()"
      />
    </v-row>

    <div
      v-show="!collapse"
      class="s--form-builder-item"
      :class="{
        '-locked':
          item.locked /*Locked item - ex. variants field for virtual products*/,
      }"
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
          variant="underlined"
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
          variant="underlined"
        />

        <div v-if="!edit_name">
          <div class="d-flex justify-space-between pb-6 px-2">
            <div>
              <small>{{ $t("global.form_builder.name_input") }}</small
              ><br />
              <b>{{ item.name ? item.name : "Auto generate.." }}</b>
            </div>

            <v-btn @click="edit_name = true" icon variant="text" size="small">
              <v-icon>{{ edit_name ? "lock_open" : "lock" }}</v-icon>
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
            multiple
            variant="underlined"
            closable-chips
          >
            <template v-slot:chip="{ props, item }">
              <v-chip v-bind="props">
                {{ item.raw }}
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
            variant="underlined"
            closable-chips
          >
            <template v-slot:chip="{ props, item }">
              <v-chip v-bind="props">
                {{ item.raw }}
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
          variant="text"
          color="primary"
          class="tnt mt-2"
          @click="show_hints = !show_hints"
          size="small"
        >
          <v-icon start>arrow_drop_down</v-icon>
          Edit hints
        </v-btn>

        <v-expand-transition>
          <div v-if="show_hints && item.type === 'switch'">
            <v-text-field
              v-model="item.hint_true"
              title="Hint True"
              placeholder="Some instruction to guide customer..."
              variant="underlined"
            ></v-text-field>
            <v-text-field
              v-model="item.hint_false"
              title="Hint False"
              placeholder="Some instruction to guide customer..."
              variant="underlined"
            ></v-text-field>
          </div>
          <div v-else-if="show_hints">
            <v-text-field
              v-model="item.hint"
              title="Hint"
              placeholder="Some instruction to guide customer..."
              variant="underlined"
            ></v-text-field>
          </div>
        </v-expand-transition>
      </template>
    </div>
  </div>
</template>

<script>
import SSmartSwitch from "@components/smart/SSmartSwitch.vue";

export default {
  name: "SFormBuilderRow",
  components: { SSmartSwitch },
  emits: ["remove"],
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
  },

  data: () => ({
    show_hints: false,
    edit_name: false,
  }),

  computed: {
    type() {
      const found = this.itemTypes.find(
        (type) => type.value === this.item.type,
      );
      return found ? found : this.itemTypes[0];
    },
  },
  created() {},
  methods: {
    removeField() {
      this.$emit("remove");
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
