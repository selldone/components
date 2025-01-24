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
  <div class="widget-box">
    <u-widget-header
      :src="require('../../../assets/trademark/chatgpt.svg')"
      title="ChatGPT Plugin"
      add-caption="How to Setup"
      add-icon="help"
      add-text
      @click:add="dialog_help = true"
    >
    </u-widget-header>

    <v-list-subheader>
      Create a sales channel using the OpenAI ChatGPT plugin. It’s easy—simply
      download the well-crafted structured data below and add it to your ChatGPT
      plugin. We made it simple for you to get started with the ChatGPT plugin.
    </v-list-subheader>

    <v-list bg-color="transparent" class="border-between-vertical">

      <v-list-item append-icon="download" :href="download_url_products"  target="_blank">
        <template v-slot:prepend>
          <v-avatar
            :image="require('@selldone/components-vue/assets/file/excel.svg')"
            rounded
          >
          </v-avatar>
        </template>
        <v-list-item-title> Download Products Resource </v-list-item-title>
        <v-list-item-subtitle>
          This resource contains all the products in your store in a structured
          format that can be used with the ChatGPT plugin.
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item append-icon="download" :href="download_url_instructions" target="_blank">
        <template v-slot:prepend>
          <v-avatar
            :image="require('@selldone/components-vue/assets/file/text.svg')"
            rounded
          >
          </v-avatar>
        </template>
        <v-list-item-title> Download Instruction </v-list-item-title>
        <v-list-item-subtitle>
          This resource contains all the instructions on how to use the ChatGPT
          plugin with the structured data.
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>

    <!-- █████████████████████ Dialog > Help █████████████████████ -->
    <v-dialog
      v-model="dialog_help"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="text-start">
        <v-card-title>
          <v-avatar
            :image="
              require('@selldone/components-vue/assets/trademark/chatgpt.svg')
            "
            rounded
          >
          </v-avatar>
          ChatGPT Sales Agent Setup
        </v-card-title>
        <v-card-text>
          <v-container>
            <p>
              Use the ChatGPT plugin to set up a sales channel for your store.
              This powerful tool helps boost sales by offering a personalized
              shopping experience for your customers. Follow these simple steps
              to create your store's sales agent in just 10 minutes!
            </p>
            <h2>1. Create the GPT Plugin</h2>
            <p>
              Visit the ChatGPT website, click on your avatar in the top right
              corner, and select 'My GPTs'.
              <v-img
                :src="require('./assets/chatgpt-1.png')"
                max-width="840"
                class="mx-auto my-2"
              >
              </v-img>
            </p>

            <h2>2. Fill the Form</h2>
            <p>
              Fill the form with the following your store details:
              <v-img
                :src="require('./assets/chatgpt-form.png')"
                max-width="840"
                class="mx-auto my-2"
              >
              </v-img>
            </p>

            <h2>3. Download Files and Upload to ChatGPT</h2>
            <p>
              Download all the files available in Selldone > Channel > OpenAI
              and upload them to the knowledge base of your GPT plugin.
            </p>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog_help = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

export default {
  name: "BOpenaiChatgpt",
  components: {},
  inject: ["$shop"],
  props: {},
  data: () => ({
    ShopPermissionRegions: ShopPermissionRegions,
    dialog_help: false,
  }),
  computed: {
    download_url_products() {
      return window.API.GET_CHANNELS_OPENAI_DOWNLOAD_KNOWLEDGE_BASE(
        this.$shop.id,
        "products",
      );
    },
    download_url_instructions() {
      return window.API.GET_CHANNELS_OPENAI_DOWNLOAD_KNOWLEDGE_BASE(
        this.$shop.id,
        "instructions",
      );
    },
  },

  watch: {},

  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped></style>
