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
  <div class="min-width-150">
    <!-- ████████████████ List ████████████████ -->

    <v-slide-y-transition
      class="bg-transparent border-between-vertical"
      group
      tag="v-list"
    >
      <v-list-item v-for="file in files" :key="file.key">
        <template v-slot:prepend>
          <v-avatar tile>
            <img :src="getFileExtensionImage(file.name)" />
          </v-avatar>
        </template>

        <v-list-item-title>
          <b>{{ file.name }}</b>
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ numeralFormat(file.size, "0.[0] b") }}
        </v-list-item-subtitle>

        <template v-slot:append>
          <v-list-item-action>
            <v-btn color="red" icon @click="remove(files, file)" variant="text">
              <v-icon>close</v-icon>
            </v-btn>
          </v-list-item-action>
        </template>
      </v-list-item>
    </v-slide-y-transition>
    <!-- ████████████████ Add ████████████████ -->

    <v-expand-transition>
      <div v-if="files?.length < 3">
        <v-file-input
          v-model="selected_file"
          :key="`i-${files?.length}`"
          append-inner-icon="add_box"
          class="mt-3 mx-3"
          clearable
          multiple
          label="Select files... max 3 files limited to 8MB each file."
          variant="solo"
          single-line
          @update:model-value="selectFile"
          messages=" "
        >
          <template v-slot:message>
            <div>
              Acceptable files:
              <span v-if="mims">
                <span v-for="m in mims" :key="m" class="mx-1"
                  ><img
                    :src="getFileExtensionImage(m)"
                    class="hover-scale"
                    height="16"
                    width="16"
                  />
                  {{ m }}</span
                >
              </span>
              <span v-else>*.*</span>
            </div>
          </template>
        </v-file-input>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import numeral from "numeral";

export default {
  name: "CAttachEditor",
  components: {},
  emits: ["update:modelValue"],
  props: {
    community: {
      require: true,
      type: Object,
    },

    modelValue: {},
  },

  data: () => ({
    selected_file: [],
    files: [],
  }),

  watch: {
    files(val) {
      this.$emit("update:modelValue", val);
    },
  },

  computed: {
    mims() {
      return this.community.mims;
    },
  },

  created() {
    if (this.modelValue) {
      this.files = this.modelValue;
    } else {
      this.files = [];
    }
  },

  methods: {
    selectFile(files) {
      if (!files) return;
      // console.log("select files", files);

      if (!Array.isArray(files)) files = [files];

      files.forEach((file) => {
        if (this.files.length >= 3) return;
        // Check size:
        if (file.size > 8 * 1024 * 1024) {
          return this.showErrorAlert(
            file.name + " size is " + numeral(file.size).format("0.[0] b"),
            "The file size is limited to 8MB.",
          );
        }

        // Check does not exist:
        file.key = file.name + file.size;
        if (this.files.some((f) => f.key === file.key)) {
          return this.showErrorAlert(
            "Duplicated file | " + file.name,
            "This file exists in your attachment list.",
          );
        }

        this.files.push(file);
      });

      this.selected_file = []; //Reset input.
    },
  },
};
</script>

<style scoped></style>
