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
  <div class="widget-box ">
    <s-widget-header
      :src="require('../../../assets/trademark/search-console.svg')"
      title="Search Console"
    >
    </s-widget-header>
    <v-list-subheader>
      <div>
        Add a meta tag to your homepage for Google Search Console verification.
        ex.
        <i>
          name="google-site-verification"
          content="<b>vi9MmjEeHnwy88zpRD13kAgnlydDb</b>"
        </i>
      </div>
    </v-list-subheader>

    <v-text-field
      v-model="code"
      class="max-width-field-large mx-auto"
      label="Verification meta tag"
      placeholder="From google, e.g. viQg9mjdBj..."
      variant="underlined"
      @update:model-value="change = true"
      :append-inner-icon="lock ? 'lock' : 'lock_open'"
      @click:append-inner="lock = !lock"
      :readonly="lock"
    >
    </v-text-field>

    <v-expand-transition>
      <div v-if="change" class="widget-buttons">
        <v-btn
          :loading="loading_set_metatag"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="setGoogleVerificationMetatag()"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save_changes") }}
        </v-btn>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  name: "BGoogleSearchConsole",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    code: "",
    change: false,
    loading_set_metatag: false,

    lock: false,
  }),
  computed: {},

  watch: {},

  created() {
    let verificationTag = this.shop.plugins.find(
      (item) => item.name === "VerificationTag",
    );
    this.code =
      verificationTag && verificationTag.setting
        ? verificationTag.setting.content
        : null;

    this.lock = !!this.code;
  },

  methods: {
    setGoogleVerificationMetatag() {
      this.loading_set_metatag = true;

      axios
        .put(
          window.API.POST_SHOP_PLUGIN_SET_CONFIG(
            this.shop.id,
            "VerificationTag",
          ),
          {
            setting: {
              content: this.code,
            },
            enable: !!this.code,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.shop.plugins, data.plugin);
            this.showSuccessAlert(
              null,
              "Set meta tag to your site's home page.",
            );
            this.change=false;

          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.loading_set_metatag = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
