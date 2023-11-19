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
  <v-list-item>
    <v-list-item-avatar
      class="avatar-gradient -thin"
      :class="{
        '-user': note.user_id !== USER_ID(),
        '-current': note.user_id === USER_ID(),
      }"
    >
      <v-img :src="getUserAvatar(note.user_id)" />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title
        class="text-wrap html-style"
        v-html="smartBeautify(compileMarkdown(note.data?.message))"
      >
      </v-list-item-title>
      <v-list-item-subtitle
        v-if="note.created_at === note.updated_at"
        title="Write date"
        class="text-end"
      >
        {{ getFromNowString(note.created_at) }} ●
        {{ getLocalDateString(note.created_at) }}
      </v-list-item-subtitle>
      <v-list-item-subtitle v-else title="Last update date" class="text-end">
        {{ getFromNowString(note.updated_at) }} ●
        {{ getLocalDateString(note.updated_at) }}
        <v-icon
          small
          class="mx-1"
          :title="`Created at ${getLocalDateString(note.updated_at)}`"
          >edit</v-icon
        >
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-btn
        icon
        color="red"
        title="Remove note."
        @click="removeNote(note)"
        :loading="delete_busy === note"
      >
        <v-icon>close</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import { ShopTransportations } from "@core/enums/logistic/ShopTransportations";
import { Reactions } from "@core/enums/support/Reactions";
import { Brands } from "@core/enums/social/Brands";
import { CampaignMedium } from "@core/enums/campaign/CampaignMedium";
import { CustomerClubLevels } from "@core/enums/customer/CustomerClubLevels";
import {CompileMarkdown} from "@core/helper/html/HtmlHelper";

export default {
  name: "NoteView",
  components: {},

  props: {
    shop: {
      required: true,
    },
    inShopAdmin: {
      type: Boolean,
    },

    note: {
      required: true,
    },
  },
  data: () => ({
    delete_busy: null,
  }),

  computed: {},

  watch: {},
  created() {},
  mounted() {},
  beforeDestroy() {},

  methods: {
    compileMarkdown(message) {
      return CompileMarkdown(message);
    },

    smartBeautify(html) {
      let out = html;

      const repos = [
        ShopTransportations,
        Reactions,
        Brands,
        CampaignMedium,
        CustomerClubLevels,
      ];

      repos.forEach((obj) => {
        const list = Array.isArray(obj) ? obj : Object.values(obj);
        list.forEach((it) => {
          if (it.code)
            out = out.replace(
              " " + it.code + " ",
              `<img width="16" height="16" src="${it.icon}" title="${this.$t(
                it.name
              )}">`
            );
          else
            out = out.replace(
              " " + it.name + " ",
              `<img width="16" height="16" src="${it.icon}" title="${this.$t(
                it.name
              )}">`
            );
        });
      });

      // Replace connect OS:
      out = out.replace(
        " Connect OS",
        ` <b>Connect</b> <span class="text-gradient bg-desert-hump">OS</span>`
      );

      return out;
    },

    removeNote(note) {
      this.delete_busy = note;

      const base_url = this.inShopAdmin
        ? window.API.DELETE_SHOP_NOTE(this.shop.id, note.id)
        : undefined;

      axios
        .delete(base_url)
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null, data.error_msg);
          }

          this.$emit('delete')
          this.showSuccessAlert(
            null,
            "This message has been successfully removed!"
          );
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.delete_busy = null;
        });
    },
  },
};
</script>

<style scoped lang="scss"></style>
