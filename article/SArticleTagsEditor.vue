<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <v-subheader>
      Allocate tags to blog articles or products to easily locate or filter them
      in various areas, such as the page builder, to showcase specific articles.
    </v-subheader>
    <v-combobox
      :value="tags"
      @input="(val) => (tags = val.length > 5 ? val.slice(0, 5) : val)"
      :items="shop_tags"
      :placeholder="$t('global.article_tags.tags_input')"
      :messages="$t('global.article_tags.tags_input_message')"
      chips
      clearable
      multiple
      :loading="busy_fetch"
      :disabled="busy_fetch"
      :counter="5"
      :rules="[GlobalRules.counter(5)]"
      @change="setTags"
    >
      <template v-slot:selection="data">
        <v-chip
          :input-value="data.selected"
          close
          color="primary"
          dark
          @click:close="removeChip(tags, data.item)"
          @click.stop
        >
          <v-btn icon small @click.prevent="showEditTag(data.item)"
            ><v-icon small>edit</v-icon></v-btn
          >
          <span class="me-2">{{ data.item }}</span>
        </v-chip>
      </template>
    </v-combobox>

    <v-bottom-sheet
      v-model="show_edit_tag"
      width="840"
      max-width="98vw"
      :open-delay="250"
      content-class="rounded-t-xl"
    >
      <v-card rounded="t-xl">
        <v-card-title
          ><v-icon class="me-1" color="#111">edit</v-icon> Edit tag
          {{ editing_tag }}
        </v-card-title>

        <v-card-text class="text-start">
          <div class="widget-box my-5">
            <widget-header :title="`Old Tag: ${editing_tag_new}`" icon="label"></widget-header>
            <v-subheader>
              Please proceed to modify this tag name. Be aware: The rest of the
              article tags will be automatically updated!
            </v-subheader>

            <v-text-field v-model="editing_tag_new" label="New tag name">
            </v-text-field>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn text @click="show_edit_tag = false" x-large>
              <v-icon class="me-1">close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              :loading="loading_edit_tag"
              color="primary"
              x-large
              @click="editTag(editing_tag, editing_tag_new)"
            >
              <v-icon class="me-1">save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
import _ from "lodash-es";

export default {
  name: "SArticleTagsEditor",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },

    article: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    tags: [],
    old_tags: [],
    shop_tags: [],

    show_edit_tag: false,
    editing_tag: null,
    editing_tag_new: null,
    loading_edit_tag: false,

    busy_save: false,
    busy_fetch: false,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {
    "article.tags"(tags) {
      this.tags = tags;
    },
  },

  created() {
    this.tags = this.article.tags ? this.article.tags : [];
    this.fetchShopTags();
  },

  methods: {
    fetchShopTags() {
      this.busy_fetch = true;

      (this.IS_VENDOR_PANEL
        ? window.$vendor.article.tags.getTags(
            this.$route.params.vendor_id
          ) /*🟢 Vendor Panel 🟢*/
        : window.$backoffice
        ? window.$backoffice.article.tags.getTags(
            this.shop.id
          ) /*In the back office*/
        : window.$storefront.article.tags.getTags(this.shop.id)
      ) /*In the storefront*/
        .then(({ tags }) => {
          this.shop_tags = tags;
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    showEditTag(old_tag) {
      this.editing_tag = old_tag;
      this.editing_tag_new = old_tag;
      this.show_edit_tag = true;
    },
    editTag(old_tag, new_tag) {
      this.loading_edit_tag = true;

      (window.$backoffice
        ? window.$backoffice.article.tags.updateTag(
            this.shop.id,
            old_tag,
            new_tag
          ) /*In the back office*/
        : window.$storefront.article.tags.updateTag(
            this.shop.id,
            old_tag,
            new_tag
          )
      ) /*In the storefront*/

        .then(({}) => {
          this.showSuccessAlert(null, `${old_tag} => ${new_tag}`);
          this.show_edit_tag = false;

          // Replace new tag in tags list:
          const index_tag = this.tags.indexOf(old_tag);
          if (index_tag !== -1) {
            this.tags.splice(index_tag, 1, new_tag);
          }

          const index_shop_tag = this.shop_tags.indexOf(old_tag);
          if (index_shop_tag !== -1) {
            this.shop_tags.splice(index_shop_tag, 1, new_tag);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.loading_edit_tag = false;
        });
    },

    setTags: _.throttle(function () {
      this.setTagsNow();
    }, 5000),

    setTagsNow() {
      // Check tags changed:
      if (JSON.stringify(this.old_tags) === JSON.stringify(this.tags)) return;
      this.old_tags = this.tags;

      this.busy_save = true;
      (this.IS_VENDOR_PANEL
        ? window.$vendor.article.tags.setArticleTags(
            this.$route.params.vendor_id,
            this.article.id,
            this.tags
          ) /*🟢 Vendor Panel 🟢*/
        : window.$backoffice
        ? window.$backoffice.article.tags.setArticleTags(
            this.shop.id,
            this.article.id,
            this.tags
          ) /*In Backoffice*/
        : window.$storefront.article.tags.setArticleTags(
            this.shop.id,
            this.article.id,
            this.tags
          )
      ) /*In Storefront*/

        .then(({ tags }) => {
          this.showSuccessAlert(
            null,
            this.$t("global.article_tags.notification.add_success") +
              ": <br>" +
              tags.join(", ")
          );
          this.article.tags = tags;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    removeChip(chips, item) {
      chips.splice(chips.indexOf(item), 1);
      chips = [...chips];

      this.setTags();
    },
  },
};
</script>

<style scoped></style>
