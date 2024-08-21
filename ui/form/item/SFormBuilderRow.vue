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
    <v-row align="center" class="py-1" no-gutters>
      <v-icon class="me-3 cursor-move drag--handle" title="Drag and move"
        >unfold_more
      </v-icon>

      <v-icon>{{ type?.icon }}</v-icon>

      <b class="mx-1 small">{{ item.title }}</b>
      <span class="mx-1 small">/ {{ getName(type?.title) }}</span>

      <v-spacer></v-spacer>

      <u-button-circle
        :title="$t('global.actions.delete')"
        color="#fff"
        icon="close"
        @click="removeField()"
      />
    </v-row>

    <v-expand-transition>
      <div v-if="!collapse">
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
                item.name = item.name ? item.name : slugify(item.title);
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

<script>
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";

export default {
  name: "SFormBuilderRow",
  components: { USmartSwitch },
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
</style>
