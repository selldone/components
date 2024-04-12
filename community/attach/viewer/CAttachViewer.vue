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
  <v-list class="bg-transparent border-between-vertical text-start">
    <v-list-item v-for="file in files" :key="file.key">
      <template v-slot:prepend>
        <v-avatar tile>
          <img :src="getFileExtensionImage(file.name)" />
        </v-avatar>
      </template>

      <template v-slot:title>
        <v-list-item-title>
          <b>{{ file.name }}</b>
        </v-list-item-title>
      </template>

      <template v-slot:subtitle>
        <v-list-item-subtitle>
          {{ numeralFormat(file.size, "0.[0] b") }}
        </v-list-item-subtitle>
      </template>

      <template v-slot:append>
        <v-list-item-action>
          <v-btn
            :loading="busy_ids.includes(file.id)"
            class="tnt"
            color="#1976D2"
            variant="text"
            @click="downloadAttachment(file)"
          >
            <v-icon class="me-1">download</v-icon>
            {{ $t("global.actions.download") }}
          </v-btn>
        </v-list-item-action>
      </template>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  name: "CAttachViewer",
  components: {},
  props: {
    post: {
      require: true,
      type: Object,
    },

    files: {
      type: Array,
    },
    viewOnly: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    busy_ids: [],
  }),

  watch: {},

  computed: {},

  created() {},

  methods: {
    downloadAttachment(file) {
      if (!this.USER()) {
        return this.NeedLogin();
      }

      this.busy_ids.push(file.id);

      this.busy_nominate = true;
      axios
        .post(
          window.CAPI.POST_GENERATE_DOWNLOAD_ATTACHMENT_URL(
            this.post.community_id,
            this.post.id,
            file.id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              "Download start...",
              "The secure download link has been generated successfully!",
            );
            try {
              window.open(data.url, "_blank").focus();
            } catch (e) {
              this.showWarningAlert(
                "Popup blocked!",
                "Please permit the browser to open the popup to start the download.",
              );
            }
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_ids.remove(file.id);
        });
    },
  },
};
</script>

<style scoped></style>
