<template>
  <component
    :is="'article-flowchart'"
    v-if="supported"
    data-version="1"
    :data-flow="jsonDefinition"
    class="a-article-flowchart"
    :class="{ 'a-article-addon--editable': editable }"
    contenteditable="false"
    spellcheck="false"
  >
    <a-addon-toolbar
      v-if="editable && flow"
      :element="element"
      :title="$t('global.article.flowchart.title')"
      :edit-label="$t('global.article.flowchart.edit')"
      edit-icon="account_tree"
      @click:edit="requestEdit"
    />
    <s-article-flow
      v-if="flow"
      :block="flow"
      :legend-labels="legendLabels"
      show-text-version
    />
    <p v-else class="a-article-flowchart__invalid" role="status">
      {{ $t("global.article.flowchart.invalid") }}
    </p>
  </component>
</template>

<script lang="ts">
import AAddonToolbar from "../toolbar/AAddonToolbar.vue";
import { articleAddonContext } from "../toolbar/article-addon-context";
import SArticleFlow from "./SArticleFlow.vue";
import {
  canUseArticleFlowchart,
  parseArticleFlowchart,
} from "./article-flowchart";

export default {
  name: "AAddonFlowchart",
  components: { AAddonToolbar, SArticleFlow },
  props: {
    definition: { type: [Object, String], default: null },
    editable: { type: Boolean, default: false },
    articleType: { type: String, default: "" },
  },
  emits: ["edit"],
  data: () => ({ element: null as HTMLElement | null }),
  computed: {
    supported() {
      return canUseArticleFlowchart(this.articleType);
    },
    flow() {
      return this.supported ? parseArticleFlowchart(this.definition) : null;
    },
    jsonDefinition() {
      return this.flow ? JSON.stringify(this.flow) : undefined;
    },
    legendLabels() {
      return {
        data: this.$t("global.article.flowchart.legend_in_flight"),
        error: this.$t("global.article.flowchart.legend_error"),
        warning: this.$t("global.article.flowchart.legend_warning"),
        success: this.$t("global.article.flowchart.legend_success"),
      };
    },
  },
  mounted() {
    this.element = this.$el;
  },
  methods: {
    requestEdit() {
      if (
        !this.editable ||
        !this.flow ||
        !this.supported ||
        !articleAddonContext(this.element)
      )
        return;
      this.$emit("edit", this.flow, this.element);
    },
  },
};
</script>

<style scoped lang="scss">
.a-article-flowchart {
  display: block;
  position: relative;
  min-width: 0;
  margin-block: 24px;

  &__invalid {
    padding: 16px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 12px;
    color: rgb(var(--v-theme-on-surface));
    font-size: 13px;
    line-height: 1.7;
  }
}
</style>
