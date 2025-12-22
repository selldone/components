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
  <div>
    <!-- ――――――――――――――――――――――― Article ――――――――――――――――――――――― -->
    <div
      :id="MASTER_ID"
      :class="{ 'for-rtl': isRTL }"
      class="s--article-editor-container"
    >
      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ ✎ Edit mode ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <div
        v-if="!onlyView"
        v-show="edit"
        :class="{ 'position-relative': show_drop }"
        class="px-2"
        @dragover="dragover"
      >
        <div>
          <div
            v-if="enableTitle"
            :id="EDITABLE_TITLE_ID"
            ref="editable_title"
            :data-placeholder="$t('global.article.editor.title_placeholder')"
            class="h1 fw-semi-bold"
            style="user-select: text; min-height: 84px"
            @edit="processEditOperationTitle"
            v-text="title"
          />
        </div>

        <div>
          <div
            v-if="enableBody"
            :id="EDITABLE_BODY_ID"
            ref="editable_body"
            :data-placeholder="$t('global.article.editor.body_placeholder')"
            class="can-edit-medium-insert u-article-body-edit"
            style="user-select: text; min-height: 284px"
            @edit="processEditOperationBody"
            v-html="rendered_body"
          />
        </div>

        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ Drop Zone ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

        <div
          v-if="show_drop"
          class="drop-container"
          @dragleave="dragleave"
          @drop="drop"
        >
          <div class="center-absolute p-3">
            <div>
              <v-icon class="m-2" color="#fff" size="64"
                >fa:fas fa-file-word
              </v-icon>
            </div>
            <b>Drop Word file here!</b>
            <div>
              Supported formats:
              <v-chip class="m-1" color="amber" size="small">.docx</v-chip>
              ,
              <v-chip class="m-1" color="amber" size="small">.odt</v-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ 💡 Normal show ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <div v-show="!edit" class="review-style px-2">
        <div
          v-if="enableTitle"
          :id="REVIEW_TITLE_ID"
          ref="review_title"
          :class="{ 'd-none': hideTitle }"
          class="h1 fw-semi-bold"
          style="user-select: text"
          v-html="title"
        />

        <slot name="after-title"></slot>

        <!----------------------- Help Headlines ------------------------>
        <s-article-table-of-contents
          v-if="hasTableOfContent && show_table_of_content && $refs.review_body"
          :html="rendered_body_view"
          :target="$refs.review_body"
        ></s-article-table-of-contents>

        <div
          v-if="enableBody"
          :id="REVIEW_BODY_ID"
          ref="review_body"
          class="pt-3 corrected u-article-body-view"
          style="user-select: text"
          v-html="rendered_body_view /*Scripts not loaded by vue!*/"
        />
      </div>
    </div>

    <slot name="end" v-bind:edit="edit"></slot>

    <!-- ――――――――――――――――――――――― 💡 Mega Replacer ――――――――――――――――――――――― -->
    <a-addon-code-editor-dialog
      :master-id="MASTER_ID"
    ></a-addon-code-editor-dialog>
    <a-addon-catalog-dialog
      :master-id="MASTER_ID"
      :upload-url="uploadUrl"
    ></a-addon-catalog-dialog>
    <a-addon-comparison-dialog
      :master-id="MASTER_ID"
      :upload-url="uploadUrl"
    ></a-addon-comparison-dialog>
    <!-- <calculator-global-dialog></calculator-global-dialog>-->

    <!-- ――――――――――――――――――――――― 💡 Select word file (docx) ――――――――――――――――――――――― -->
    <input
      ref="file_input"
      accept=".docx"
      hidden="hidden"
      type="file"
      @change="onSelectWordFile"
    />
  </div>
</template>

<script lang="ts">
//---------------- Medium Editor --------------
import MediumEditor from "medium-editor";

import "@selldone/components-vue/article/add-on/code-editor/plugin/ArticleAddonCodeEditorPlugin";
import "@selldone/components-vue/article/add-on/comparison/plugin/ArticleAddonComparisonPlugin";
import "@selldone/components-vue/article/add-on/catalog/plugin/ArticleAddonCatalogPlugin";
import "@selldone/components-vue/article/add-on/canvas/plugin/ArticleAddonCanvasPlugin";

// @ts-ignore
import { MediumInsert } from "@selldone/components-vue/article/insert/SelldoneEditorInsert";
import AAddonCodeEditor from "./add-on/code-editor/AAddonCodeEditor.vue";

import { createApp, defineComponent, h } from "vue";
import AAddonComparison from "./add-on/comparison/AAddonComparison.vue";
import AAddonCatalog from "../article/add-on/catalog/AAddonCatalog.vue";
import AAddonCanvas from "./add-on/canvas/AAddonCanvas.vue";
import AAddonCodeEditorDialog from "./add-on/code-editor/dialog/AAddonCodeEditorDialog.vue";
import AAddonCatalogDialog from "../article/add-on/catalog/dialog/AAddonCatalogDialog.vue";
import AAddonComparisonDialog from "./add-on/comparison/dialog/AAddonComparisonDialog.vue";
import SArticleTableOfContents from "./widgets/SArticleTableOfContents.vue";
import { FileFormatConverterOnline } from "@selldone/components-vue/utils/converters/FileFormatConverterOnline.ts";
import { installGlobalComponents } from "../components-mandetory";
import { debounce } from "lodash-es";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import ImageMixin from "@selldone/components-vue/mixin/image/ImageMixin.ts";

window.MediumInsert = MediumInsert;

const OPTIONS_TITLE = {
  buttonLabels: "fontawesome",
  toolbar: {
    buttons: [],
  },
  placeholder: {
    text: "title",
  },
  disableReturn: true,
  spellcheck: false,
};

const OPTIONS_BODY = {
  imageDragging: false,

  spellcheck: false,
  buttonLabels: "fontawesome",
  delay: 0,
  toolbar: {
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",

      "anchor",
      //   "h2",
      //    "h3",

      {
        name: "h2",
        action: "append-h2",
        aria: "header 2",
        tagNames: ["h2"],
        contentDefault: "<b>H2</b>",
        classList: [],
        attrs: {},
        contentFA: '<i class="fas fa-heading"></i><sup> 2</sup>',
      },
      {
        name: "h3",
        action: "append-h3",
        aria: "header 3",
        tagNames: ["h3"],
        contentDefault: "<b>H3</b>",
        classList: [],
        attrs: {},
        contentFA: '<i class="fas fa-heading"></i><sup> 3</sup>',
      },

      "quote",
      "orderedlist",
      "unorderedlist",

      "justifyLeft",
      "justifyCenter",
      "justifyRight",
      "justifyFull",

      {
        name: "pre",
        contentDefault: "code snippet", // default text
        contentFA: '<i class="fas fa-code"></i>', // custom icon if you're using font-awesome icons
      },

      //'html',  // (parses selected html and converts into actual html elements)
      {
        name: "html",
        contentFA: '<i class="fas fa-magic"></i>', // custom icon if you're using font-awesome icons
      },

      {
        name: "h6",
        action: "append-h6",
        aria: "note",
        tagNames: ["h6"],
        contentDefault: "<h6>Note...</h6>",
        classList: ["note-list"],
        attrs: {},
        contentFA: '<i class="fas fa-sticky-note"></i>',
      },

      "removeFormat",
      //'highlighter'
      //       'table'
    ],
    diffLeft: 0,
    diffTop: -10,
  },

  paste: {
    /* This example includes the default options for paste,
                     if nothing is passed this is what it used */
    forcePlainText: false,
    cleanPastedHTML: true,

    cleanReplacements: [
      // [new RegExp(/<div>/gi), '<p>'],
      //  [new RegExp(/<\/div>/gi), '</p>'],

      [new RegExp(/<text>/gi), "<p>"],
      [new RegExp(/<\/text>/gi), "</p>"],

      [new RegExp(/<strong>/gi), "<b>"],
      [new RegExp(/<\/strong>/gi), "</b>"],
      [new RegExp(/<font>/gi), ""],
      [new RegExp(/<\/font>/gi), ""],
      [new RegExp(/<code>/gi), "<p>"],
      [new RegExp(/<\/code>/gi), "</p>"],

      [new RegExp(/<\/p>/gi), "<br></p>"], // Align not work if br not exist at the end of <p>
    ],
    cleanAttrs: ["class", "style", "dir", "color", "face", "size", "border"],
    cleanTags: [
      "meta",
      "label",
      "style",
      "script",
      "center",
      "basefont",
      "frame",
      "iframe",
      "frameset",
      "img",
      "span",
    ],
    unwrapTags: ["div", "font", "span", "strong"],
    /* cleanReplacements: [],
                   cleanAttrs: ['class', 'style', 'dir'],
                   cleanTags: ['meta'],
                   unwrapTags: []*/
  },

  extensions: {
    imageDragging: {},

    /*  "customHtml": new CustomHtml({
                                     buttonText: "---",
                                     customClass: '',
                                     htmlToInsert: "<hr>"
                                 }),*/

    // 'highlighter': new HighlighterButton()
  },
};

export default defineComponent({
  name: "SArticleEditor",
  mixins: [ImageMixin],
  emits: ["change", "update:title", "update:body", "update:images"],

  components: {
    SArticleTableOfContents,
    AAddonComparisonDialog,
    AAddonCatalogDialog,
    AAddonCodeEditorDialog,
  },

  props: {
    onlyView: {
      required: false,
      default: false,
      type: Boolean,
    },

    edit: {
      required: false,
      default: false,
      type: Boolean,
    },
    title: {
      required: false,
      default: "",
      type: String,
    },
    body: {
      required: false,
      default: "",
      type: String,
    },
    enableTitle: {
      // No title mode!
      required: false,
      default: true,
      type: Boolean,
    },
    hideTitle: {
      // Has title but not show! important!
      // type: Boolean,
      default: false,
    },
    enableBody: {
      required: false,
      default: true,
      type: Boolean,
    },

    uploadUrl: {
      required: false,
      default: "",
      type: String,
    },
    wordConverterUrl: {
      required: false,
      type: String,
    },

    noMediumInsert: {
      required: false,
      default: false,
      type: Boolean,
    },

    hasTableOfContent: {
      default: false,
      type: Boolean,
    },

    suffixId: { default: "" },
  },

  data() {
    return {
      isRTL: false,
      //------------
      editable_title: null,
      editor_body: null,

      //------------

      options_title: OPTIONS_TITLE,

      options_body: OPTIONS_BODY,

      state: "no-change", //changed    saving   no-change

      //----------------------------
      show_table_of_content: false,

      //----------------------------
      show_drop: false,
    };
  },

  watch: {
    onlyView() {
      this.$nextTick(() => {
        this.refresh();
      });
    },

    edit() {},

    rendered_body() {
      this.processAfterChangeBody();
    },
  },

  created() {},

  mounted() {
    this.$nextTick(() => {
      this.refresh();
    });
  },

  updated: function () {
    this.$nextTick(function () {
      this.show_table_of_content = true;
    });
  },

  beforeUnmount() {
    // Purge all excess elements:

    $(
      `#${this.MASTER_ID} ` + 'select[id^="medium-editor-anchor-preview-"]',
    ).remove();
    $(`#${this.MASTER_ID} ` + 'select[id^="medium-editor-toolbar-"]').remove();
    $(`#${this.MASTER_ID} ` + ".medium-editor-toolbar").remove();
    $(`#${this.MASTER_ID} ` + ".medium-editor-anchor-preview").remove();
  },

  computed: {
    //------------------ Multiple Article In One-Page Support (Landing builder) ------------------
    MASTER_ID() {
      return `MASTER-ARTICLE-${this.suffixId}`;
    },

    EDITABLE_TITLE_ID() {
      return "editable_title" + this.suffixId;
    },
    EDITABLE_BODY_ID() {
      return "editable_body" + this.suffixId;
    },

    REVIEW_TITLE_ID() {
      return "review_title" + this.suffixId;
    },
    REVIEW_BODY_ID() {
      return "review_body" + this.suffixId;
    },

    //--------------------------------------------------------------------------------------------

    rendered_body() {
      let div = $("<div>");
      div.html(this.body);

      this.reRenderAll();

      // Solve problem of bad html format saved in database or injection :
      //――――――――――――――――――――――― Remove all invalid direct child ――――――――――――――――――――――
      div.find("> span").each(function () {
        // Remove all direct span children !
        console.error("Invalid child type! (Removed)", $(this));
        $(this).replaceWith("");
      });

      //――――――――――――――――――――――― Unwrap span (Fix style font-size) ―――――――――――――――――――――
      div.find("p > span , blockquote > span").each(function () {
        // Remove all direct span children !
        if ($(this).length) console.log("Unwrap span", $(this)[0].innerText);
        $(this).replaceWith($(this)[0].innerText);
      });
      //――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

      return div.html();
    },
    rendered_body_view() {
      // Prevent image draggable in view mode!
      let div = $("<div>");
      div.html(this.rendered_body);

      div
        .find(".medium-insert-images")
        .addClass("medium-insert-images-safe")
        .removeClass("medium-insert-images");

      div.find("*").removeAttr("contentEditable");

      return div.html();
    },
  },

  methods: {
    //――――――――――――――――――――――― Drop file (word) ―――――――――――――――――――――
    dragover(event) {
      if (!this.wordConverterUrl) return;

      // Word File:
      if (
        Object.values(event.dataTransfer.items).some((i) =>
          i.type.includes("application/vnd"),
        )
      ) {
        this.show_drop = true;
        event.preventDefault();
      }
    },

    dragleave(event) {
      if (!this.wordConverterUrl) return;

      this.show_drop = false;
    },

    drop(event) {
      if (!this.wordConverterUrl) return;

      this.show_drop = false;

      event.preventDefault();

      // Send word file to server to convert to html:
      this.loadWordFile(event.dataTransfer.files);
    },

    showSelectWord() {
      const defaultFile = this.$refs.file_input;
      defaultFile.click();
    },
    onSelectWordFile() {
      const defaultFile = this.$refs.file_input;

      // Send word file to server to convert to html:
      this.loadWordFile(defaultFile.files);
    },
    loadWordFile(files) {
      if (!this.wordConverterUrl) return;

      // Word files:

      if (files.length) {
        const file = files[0];

        // 1. Check file format:
        if (
          !file.name.toLowerCase().endsWith(".docx") &&
          !file.name.toLowerCase().endsWith(".odt")
        ) {
          NotificationService.showErrorAlert(
            null,
            "Only docx and odt file format supported.!",
          );
          return;
        }

        // 2. Check file size:
        if (file.size > 8 * 1024 * 1024) {
          NotificationService.showErrorAlert(
            null,
            "Maximum file size limited to 8MB!",
          );
          return;
        }

        // 3. Online convert word to html:
        FileFormatConverterOnline.ConvertWordToHtml(
          this,
          this.wordConverterUrl,
          file,
          (data) => {
            // 4. Update title & body:
            this.$emit("update:body", "");
            this.$emit("update:title", "");

            this.$nextTick(() => {
              this.$emit("update:body", data.body);
              this.$emit("update:title", data.title);
              this.setDirection();
              this.onEdited();
              console.log("🍒 Load word completed ");
              NotificationService.showSuccessAlert(
                "Magical word converter",
                "Your file has been converted to article successfully, enjoy it!",
              );
            });
          },
        );
      }
    },
    //――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

    processAfterChangeBody() {
      setTimeout(() => {
        console.log("🍯 Re-render body | Assign fullscreen images");
        $(
          `#${this.MASTER_ID} ` +
            ".review-style .medium-insert-images-mediumImage>figure",
        ).click(
          this.showFullscreen,
          // Deprecated:
          /* function () {
                                $(this).toggleClass("fullscreen");
                              }*/
        );
      }, 1000);
    },

    reRenderAll() {
      console.log("🍯 Re-render all contents.");

      this.$nextTick(() => {
        //――――――――――――――――――――――― 💡 Mega Replacer ―――――――――――――――――――――――
        /**
         * Medium Insert Identifier: .code-editor
         * Replacer Type: code-editor
         * Abstracted Node name (save in database):   <code-editor>...</code-editor>
         */

        setTimeout(() => {
          let t = this;

          const i18n = this.geti18n();
          //――――――――――――――――――――――― 💡 Mega Replacer ▶ Code Editor ▶ Render Mode ―――――――――――――――――――――――

          // Get all elements with class 'code-editor'
          const codeEditorElements = document.querySelectorAll(
            `#${this.MASTER_ID} code-editor`,
          );

          // Iterate over each element
          codeEditorElements.forEach((element) => {
            const data = element.innerHTML;
            let data_json = {};
            if (data) {
              try {
                data_json = JSON.parse(decodeURIComponent(data));
              } catch (e) {
                console.error(e);
              }
            }

            const editable =
              element.closest(`#${this.EDITABLE_BODY_ID}`) !== null;

            // Create a new Vue app with the AAddonCodeEditor component
            const app = createApp({
              render: () =>
                h(AAddonCodeEditor, {
                  codes: data_json,
                  editable: editable,
                  masterId: t.MASTER_ID /*Point which dialog open!*/,
                }),
            });
            // Use Vuetify and i18n instances
            app.use(window.$global_vuetify);
            app.use(i18n);
            installGlobalComponents(app);

            // Create a temporary element to mount the app
            const tempElement = document.createElement("div");
            app.mount(tempElement);

            // Replace the original element with the new one
            element.parentNode.replaceChild(
              tempElement.firstElementChild,
              element,
            );
          });

          //――――――――――――――――――――――― 💡 Mega Replacer ▶ Images Compare ▶ Render Mode ―――――――――――――――――――――――

          // Get all elements with class 'images-compare'
          const imageCompareElements = document.querySelectorAll(
            `#${this.MASTER_ID} images-compare`,
          );

          // Iterate over each element
          imageCompareElements.forEach((element) => {
            const data = element.innerHTML;
            let data_json = {};
            if (data) {
              try {
                data_json = JSON.parse(decodeURIComponent(data));
              } catch (e) {
                console.error(e);
              }
            }

            const editable =
              element.closest(`#${this.EDITABLE_BODY_ID}`) !== null;

            // Create a new Vue app with the AAddonComparison component
            const app = createApp({
              render: () =>
                h(AAddonComparison, {
                  images: data_json,
                  editable: editable,
                  uploadUrl: this.uploadUrl,
                  masterId: this.MASTER_ID,
                }),
            });
            // Use Vuetify and i18n instances
            app.use(window.$global_vuetify);
            app.use(i18n);
            installGlobalComponents(app);

            // Create a temporary element to mount the app
            const tempElement = document.createElement("div");
            app.mount(tempElement);

            // Replace the original element with the new one
            element.parentNode.replaceChild(
              tempElement.firstElementChild,
              element,
            );
          });

          //――――――――――――――――――――――― 💡 Mega Replacer ▶ Flip Book ▶ Render Mode ―――――――――――――――――――――――

          // Get all elements with class 'flip-book'
          const flipBookElements = document.querySelectorAll(
            `#${this.MASTER_ID} flip-book`,
          );

          // Iterate over each element
          flipBookElements.forEach((element) => {
            const data = element.innerHTML;
            let data_json = {};
            if (data) {
              try {
                data_json = JSON.parse(decodeURIComponent(data));
              } catch (e) {
                console.error(e);
              }
            }

            const editable =
              element.closest(`#${this.EDITABLE_BODY_ID}`) !== null;

            // Create a new Vue app with the AAddonCatalog component
            const app = createApp({
              render: () =>
                h(AAddonCatalog, {
                  pack: data_json,
                  editable: editable,
                  uploadUrl: t.uploadUrl,
                  masterId: t.MASTER_ID /*Point which dialog open!*/,
                }),
            });
            // Use Vuetify and i18n instances
            app.use(window.$global_vuetify);
            app.use(i18n);
            installGlobalComponents(app);

            // Create a temporary element to mount the app
            const tempElement = document.createElement("div");
            app.mount(tempElement);

            // Replace the original element with the new one
            element.parentNode.replaceChild(
              tempElement.firstElementChild,
              element,
            );
          });

          //――――――――――――――――――――――― 💡 Mega Replacer ▶ Image Overlay Canvas ▶ Render Mode ―――――――――――――――――――――――

          // Get all elements with class 'image-overlay-canvas'
          const imageOverlayElements = document.querySelectorAll(
            `#${this.MASTER_ID} image-overlay-canvas`,
          );

          // Iterate over each element
          imageOverlayElements.forEach((element) => {
            const data = element.innerHTML;
            let data_json = {};
            if (data) {
              try {
                data_json = JSON.parse(decodeURIComponent(data));
              } catch (e) {
                console.error(e);
              }
            }

            const editable =
              element.closest(`#${this.EDITABLE_BODY_ID}`) !== null;

            // Create a new Vue app with the AAddonCanvas component
            const app = createApp({
              render: () =>
                h(AAddonCanvas, {
                  pack: data_json,
                  editable: editable,
                  uploadUrl: t.uploadUrl,
                  masterId: t.MASTER_ID /*Point which dialog open!*/,
                }),
            });
            // Use Vuetify and i18n instances
            app.use(window.$global_vuetify);
            app.use(i18n);
            installGlobalComponents(app);

            // Create a temporary element to mount the app
            const tempElement = document.createElement("div");
            app.mount(tempElement);

            // Replace the original element with the new one
            element.parentNode.replaceChild(
              tempElement.firstElementChild,
              element,
            );
          });

          //――――――――――――――――――――――― 💡 Mega Replacer ▶ Embed ▶ Render Mode ―――――――――――――――――――――――

          $(`#${this.MASTER_ID} ` + "embed") // Find code editors:
            .each(function () {
              const row_dara = $(this).html();
              const data = decodeURIComponent($(this).html());

              let div = $("<div>")
                .attr("data-embed-code", $("<div />").text(row_dara).html())
                .html(data);

              $(this).replaceWith(div);
            });

          //――――――――――――――――――――――― 💡 Re insert html to run embed scripts! ( important! ) ―――――――――――――――――――――――

          $(`#${this.MASTER_ID} ` + ".medium-insert-embed").each(
            function (index, element) {
              let html = $('<div class="medium-insert-embed">');
              html.html($(this).html());

              $(this).replaceWith(html);
            },
          );

          //――――――――――――――――――――――― 💡 Add controller to videos (Maybe added by embed) ―――――――――――――――――――――――
          $(`#${this.MASTER_ID} ` + ".medium-insert-embed").each(
            function (index, element) {
              $(element).find("video").attr("controls", true);
            },
          );
        }, 50); // important: Load with delay to work properly.
      });
    },

    //---------------------------------------------------------------------------------------------

    //---------------------------------------------------------------------------------------------

    processEditOperationTitle: function ({ event, element }) {
      if (!this.enableTitle) return;
      //   this.article.title = operation.api.origElements.innerText;
      this.onEdited();
      this.applyDirectionDebounce(
        element,
        null,
        document.getElementById(this.REVIEW_TITLE_ID),
      );
    },

    processEditOperationBody: function ({ event, element }) {
      //console.log('event',event,element)
      // this.article.body = operation.api.origElements.innerHTML;
      this.onEdited();
      this.applyDirectionDebounce(
        element,
        null,
        document.getElementById(this.REVIEW_BODY_ID),
      );

      // this.$emit('update:body',this.purifyBody())
    },

    // Define the debounced version of onEdited
    onEdited: debounce(function () {
      console.log("🍒 Article Editor | Edited (debounced)");

      if (this.edit) this.state = "changed";

      this.$emit("change", {
        title: this.title,
        body: this.body,
      });
    }, 1000), // Wait for 1000ms before the last call

    setDirection() {
      this.$nextTick(() => {
        // Code that will run only after the
        // entire view has been rendered

        if (this.enableTitle)
          this.applyDirection(
            document.getElementById(this.REVIEW_TITLE_ID),
            this.title,
          );
        this.applyDirection(
          document.getElementById(this.REVIEW_BODY_ID),
          this.body,
        );

        //console.log("===== END =====");

        if (this.onlyView) return;

        if (this.enableTitle)
          this.applyDirection(
            document.getElementById(this.EDITABLE_TITLE_ID),
            this.title,
          );
        this.applyDirection(
          document.getElementById(this.EDITABLE_BODY_ID),
          this.body,
        );
      });
    },

    //――――――――――――――――――――――― Update page ―――――――――――――――――――――――

    refresh() {
      console.log(
        "☀ Refresh editor   only view=" + this.onlyView,
        "no tools",
        this.noMediumInsert,
      );
      // 🞇 Reset to default
      this.resetToDefault();

      this.setDirection();

      if (this.onlyView) return;

      let current_instance = this; // Must save instance for calling function in jquery (belllow)

      //console.log('EDITABLE_BODY_ID -->',"#"+this.EDITABLE_BODY_ID,document.getElementById(this.EDITABLE_BODY_ID))
      this.editor_body = new MediumEditor(
        "#" + this.EDITABLE_BODY_ID,
        this.options_body,
      );
      this.editor_body.subscribe("editableInput", (event) =>
        this.processEditOperationBody({
          event,
          element: this.$refs.editable_body,
        }),
      );

      this.editable_title = new MediumEditor(
        "#" + this.EDITABLE_TITLE_ID,
        this.options_title,
      );
      this.editable_title.subscribe("editableInput", (event) =>
        this.processEditOperationTitle({
          event,
          element: this.$refs.editable_title,
        }),
      );

      //console.log('this.$refs.editable_title',this.$refs.editable_title)

      // console.log('this.editor_body 1',this.editor_body)

      //  this.editor_body = this.$refs.editable_body.api;
      // console.log('this.editor_body 2',this.editor_body)

      //  console.log(" this.editor_body ", this.editor_body);

      this.editor_body.subscribe("request-re-render", (event, editable) => {
        // Do some work
        console.log("Article Editor | request-re-render");
        this.reRenderAll();
      });

      let csrf_token = $('meta[name="csrf-token"]').attr("content");
      //   console.log("***********************************");

      if (!this.noMediumInsert)
        $("#" + this.EDITABLE_BODY_ID).mediumInsert({
          editor: this.editor_body,
          addons: {
            CodeEditorAddon: {},

            ImagesCompareAddon: {},
            FlipBookAddon: {},

            ImageOverlayCanvasAddon: {},

            //  CalculatorAddon: {},

            images: {
              label: '<span class="fas fa-camera"></span> Image', // (string) A label for an image addon
              uploadScript: null, // DEPRECATED: Use fileUploadOptions instead

              preview: true, // (boolean) Show an image before it is uploaded (only in browsers that support this feature)
              captions: true, // (boolean) Enable captions
              captionPlaceholder: this.$t(
                "global.article.editor.images_caption_placeholder",
              ), // (string) Caption placeholder
              autoGrid: 3, // (integer) Min number of images that automatically form a grid

              fileUploadOptions: {
                url: this.uploadUrl,
                acceptFileTypes:
                  /(\.|\/)(gif|jpe?g|png|svg\+xml|webp)$/i /*   /(\.|\/)(gif|jpe?g|png|svg+xml|webp)$/i     */,
                /*{
                    test:function(name){
                      console.log('name',name)
                      return true
                    }
                  }*/ maxFileSize: 2 * 1024 * 1024,
                headers: {
                  "X-CSRF-TOKEN": csrf_token,
                  Authorization:
                    window.axios.defaults.headers.common["Authorization"],
                },
              },

              styles: {
                // (object) Available image styles configuration
                wide: {
                  // (object) Image style configuration. Key is used as a class name added to an image, when the style is selected (.medium-insert-images-wide)
                  label: '<span class="fas fa-align-justify"></span>', // (string) A label for a style
                  added: function ($el) {}, // (function) Callback function called after the style was selected. A parameter $el is a current active paragraph (.medium-insert-active)
                  removed: function ($el) {}, // (function) Callback function called after a different style was selected and this one was removed. A parameter $el is a current active paragraph (.medium-insert-active)
                },
                left: {
                  label: '<span class="fas fa-align-left"></span>',
                },
                right: {
                  label: '<span class="fas fa-align-right"></span>',
                },
                grid: {
                  label: '<span class="fas fa-th"></span>',
                },

                mediumImage: {
                  label: '<span class="fa fa-image"></span>',
                  added: function ($el) {
                    // Initialize slideshow
                    /* $el.cycle({
                        slides: 'figure'
                      });*/
                  },
                  removed: function ($el) {
                    // Destroy slideshow
                    //   $el.cycle('destroy');
                  },
                },
              },
              actions: {
                // (object) Actions for an optional second toolbar
                remove: {
                  // (object) Remove action configuration
                  label: '<span class="fas fa-times"></span>', // (string) Label for an action
                  clicked: ($el) => {
                    // (function) Callback function called when an action is selected
                    let $event = $.Event("keydown");

                    $event.which = 8;
                    $(document).trigger($event);
                  },
                },
              },

              messages: {
                acceptFileTypesError: this.$t(
                  "global.article.editor.accept_file_types_error",
                ),
                maxFileSizeError: this.$t(
                  "global.article.editor.max_file_size_error",
                ),
              },

              uploadCompleted: ($el, data) => {
                // console.log("***** Image uploaded ****");
                NotificationService.showSuccessAlert(
                  null,
                  this.$t(
                    "global.article.editor.notifications.image_uploaded_success",
                  ),
                );
                current_instance.onEdited();
                current_instance.findAllImages();
              },
              uploadFailed: (uploadErrors, data) => {
                NotificationService.showErrorAlert(
                  null,
                  this.$t(
                    "global.article.editor.notifications.image_uploaded_failed",
                  ),
                );
              },

              deleteMethod: "POST",
              deleteScript: null,

              fileDeleteOptions: {},
            },
            embeds: {
              label:
                '<span class="fab fa-youtube"></span> Youtube / URL / HTML', // (string) A label for an embeds addon
              placeholder: this.$t("global.article.editor.embed_placeholder"), // (string) Placeholder displayed when entering URL to embed
              oembedProxy:
                //"iframe.ly/api/oembed?api_key=5d9cb4c1e4895409be3d1f&iframe=1",
                //  "/api/iframe/preview"
                window.ARTICLE_API.GET_LINK_PREVIEW(),
              captions: true, // (boolean) Enable captions
              captionPlaceholder: this.$t(
                "global.article.editor.embed_caption_placeholder",
              ), // (string) Caption placeholder

              storeMeta: false,
              parseOnPaste: true,

              styles: {
                // (object) Available embeds styles configuration
                wide: {
                  // (object) Embed style configuration. Key is used as a class name added to an embed, when the style is selected (.medium-insert-embeds-wide)
                  label: '<span class="fas fa-align-justify"></span>', // (string) A label for a style
                  added: ($el) => {}, // (function) Callback function called after the style was selected. A parameter $el is a current active paragraph (.medium-insert-active)
                  removed: ($el) => {}, // (function) Callback function called after a different style was selected and this one was removed. A parameter $el is a current active paragraph (.medium-insert-active)
                },
                left: {
                  label: '<span class="fas fa-align-left"></span>',
                },
                right: {
                  label: '<span class="fas fa-align-right"></span>',
                },
                grid: {
                  label: '<span class="fa fa-th"></span>',
                },
              },

              actions: {
                // (object) Actions for an optional second toolbar
                remove: {
                  // (object) Remove action configuration
                  label: '<span class="fas fa-times"></span>', // (string) Label for an action
                  clicked: ($el) => {
                    // (function) Callback function called when an action is selected
                    let $event = $.Event("keydown");

                    $event.which = 8;
                    $(document).trigger($event);
                  },
                },
              },
            },
          },
        });
    },

    findAllImages() {
      //  console.log("-----findAllImages-----");

      let images = $("#" + this.EDITABLE_BODY_ID)
        .find("img")
        .map(function (index, element) {
          return element.src;
        })
        .get();
      //console.log(images);

      this.$emit("update:images", images);
    },

    //――――――――――――――――――――――― Helper Methods ―――――――――――――――――――――――

    purifyTitle() {
      let div = document.createElement("div");

      div.innerHTML = $("#" + this.EDITABLE_TITLE_ID).text();

      let elements = div.getElementsByTagName("h1");
      while (elements[0]) elements[0].parentNode.removeChild(elements[0]);

      elements = div.getElementsByClassName("br");
      while (elements[0]) elements[0].parentNode.removeChild(elements[0]);

      return div.innerText;
    },

    purifyBody() {
      console.log("🧹 Purify body");

      let div = $("<div>");
      div.html($("#" + this.EDITABLE_BODY_ID).html());

      //――――――――――――――――――――――― 💡 Mega Replacer ▶ Code Editor ▶ Save Mode ―――――――――――――――――――――――
      /**
       * Medium Insert Identifier: .code-editor
       * Replacer Type: code-editor
       * Abstracted Node name (save in database):   <code-editor>...</code-editor>
       */

      let replacer = {};
      let embed_replacer = {};

      let replace_key = 0;
      div.find(".code-editor").each(function () {
        const parent = $(this);
        //  let text= $(this).find('.prism-editor__code').text();
        let data = $(this).attr("data");
        // console.log("data ---> ",data);

        replace_key++;
        replacer[`${replace_key}`] = data;
        const replacer_type = "code-editor";
        //  console.log("replacer_type", replacer_type);

        // console.log('text',text)
        parent.replaceWith(
          `<replace type="${replacer_type}">${replace_key}</replace>`,
        );
      });
      div.find(".images-compare").each(function () {
        //console.log('find image compare!',this)
        const parent = $(this);
        let data = $(this).attr("data");

        replace_key++;
        replacer[`${replace_key}`] = data;
        const replacer_type = "images-compare";
        // console.log("replacer_type", replacer_type);
        parent.replaceWith(
          `<replace type="${replacer_type}">${replace_key}</replace>`,
        );
      });

      div.find(".flip-book").each(function () {
        const parent = $(this);
        let data = $(this).attr("data");

        replace_key++;
        replacer[`${replace_key}`] = data;
        const replacer_type = "flip-book";
        // console.log("replacer_type", replacer_type);
        parent.replaceWith(
          `<replace type="${replacer_type}">${replace_key}</replace>`,
        );
      });
      div.find(".image-overlay-canvas").each(function () {
        const parent = $(this);
        let data = $(this).attr("data");

        replace_key++;
        replacer[`${replace_key}`] = data;
        const replacer_type = "image-overlay-canvas";
        //   console.log("replacer_type", replacer_type);
        parent.replaceWith(
          `<replace type="${replacer_type}">${replace_key}</replace>`,
        );
      });

      div.find("div[data-embed-code]").each(function () {
        const parent = $(this);
        let data = $(this).attr("data-embed-code");
        //console.log('data===>',data)
        replace_key++;
        embed_replacer[`${replace_key}`] = data;
        parent.replaceWith(`<replace-embed>${replace_key}</replace-embed>`);
      });

      div
        .find("*")
        .not(
          "a,i,ol,ul,li,img,br,p,div,b,u,h1,h2,h3,h4,h5,h6,font,figure,figcaption,pre,code,iframe,replace,replace-embed,iframe,strike,blockquote,script,span,table,tbody,thead,tr,td,th,br,style" +
            ",math,semantics,mrow,msub,mi,mo" /*Math Formula*/ +
            ",mfrac,msup,msubsup,mmultiscripts,mprescripts,msqrt,mroot,mstyle,mpadded,mphantom,menclose" /*Math Layout*/ +
            ",mo,mn,mtext,mspace,maligngroup,malignmark" /*Math Tokens*/ +
            ",mtable,mtr,mtd,mlabeledtr" /*Math Tables*/ +
            ",munder,mover,munderover" /*Math Under/Over Notation*/ +
            ",none,mprescripts" /*Other Math Elements*/ +
            ",mfenced,mrow,mstyle,ms,maction" /*More Grouping Elements*/ +
            ",annotation,annotation-xml" /*Annotations*/,
        ) // script: for embed link!
        .each(function () {
          if (!$(this).closest(".medium-insert-embed").length)
            $(this).replaceWith("");
        });
      div.find(".medium-insert-buttons-addons").each(function () {
        $(this).replaceWith("");
      });

      div.find(".medium-insert-buttons").each(function () {
        $(this).replaceWith("");
      });

      div.find("*").removeClass("medium-insert-embeds-selected");

      div.find("*").removeClass("medium-insert-active");

      div.find("*").removeClass("medium-insert-image-active");

      div.find("*").removeClass("fullscreen");

      div.find("*").filter('[class=""]').removeAttr("class");

      // Remove empty medium insert images!
      div
        .find(".medium-insert-images")
        .filter(function (index) {
          return $(this).children().length < 1;
        })
        .remove();

      // Not load image completed!
      div.find("img[src^='blob']").each(function () {
        let element = $(this);

        console.log(element);

        console.error("closest", element.closest("div"));
        element.closest("div").remove();
      });

      div.find("*").each(function () {
        let element = $(this);

        let attributes = $.map(this.attributes, function (item) {
          return item.name;
        });

        // now use jQuery to remove the attributes

        $.each(attributes, function (i, item) {
          if (
            [
              "href",
              "target",
              "dir",
              "src",
              "alt",
              "class",
              "style",
              "contenteditable",
              "rel",
              "allowfullscreen",
              "webkitallowfullscreen",
              "mozallowfullscreen",
              "scrolling",
              "allow",
              "type",
              "align",
              "data-embed-code",
              "charset",
              "data-tweet-id",
              "width",
              "height",
              "xmlns",
              "display",
            ].indexOf(item) === -1
          )
            if (!$(this).closest(".medium-insert-embed").length)
              element.removeAttr(item);
        });
      });

      //――――――――――――――――――――――― 💡 Mega Replacer ▶ Replace with final save code ―――――――――――――――――――――――

      div.find("replace").each(function () {
        const replace_key = $(this).text();
        const replacer_type = $(this).attr("type");
        // console.log("replacer_type ---> ",replacer_type);

        $(this).replaceWith(
          `<${replacer_type} style="visibility: hidden">${encodeURIComponent(
            replacer[replace_key],
          )}</${replacer_type}>`,
        );
      });

      div.find("replace-embed").each(function () {
        const replace_key = $(this).text();

        let data_embed_code = embed_replacer[replace_key];

        // Convert text to html: (Not work directly insert as html!)
        let data = $.parseHTML(data_embed_code);
        let html = $(data[0].data);

        let div = $("<div>")
          .attr("data-embed-code", data_embed_code)
          .html(html);

        $(this).replaceWith(div);
      });
      //――――――――――――――――――――――― Solve image re-editable problem ―――――――――――――――――――――――
      div.find("figure").each(function () {
        //console.log('***********',$(this).children().find('img').length)
        // Child must be img && not warp by embed elements
        if (
          $(this).children().find("img").length &&
          $(this).closest(".medium-insert-images,.medium-insert-embeds")
            .length === 0
        ) {
          // Safe wrap classes!

          const code = `<div class="medium-insert-images"><figure contenteditable="false">${$(
            this,
          ).html()}</figure></div>`;

          console.error("Solve image re-editable problem ---> error ", code);

          $(this).replaceWith(code);
        }
      });

      //――――――――――――――――――――――― Auto add alt text to images ―――――――――――――――――――――――
      div.find("img").each(function () {
        let caption = "";
        const figcaptions = $(this).parent().find("figcaption");
        if (figcaptions && figcaptions.length) {
          caption = figcaptions[0].innerText;
        }
        if (!caption) {
          const nexts = $(this).closest("div").next();
          //console.log("Next ---> ",nexts);
          if (nexts.length) {
            caption = nexts[0].innerText.limitWords(12);
          }
        }

        if (caption) $(this).attr("alt", caption);
        //console.log("caption ---> ", caption);
      });

      //――――――――――――――――――――――― Remove all invalid direct child ―――――――――――――――――――――――
      div.find("> span").each(function () {
        // Remove all direct span children !
        console.error("Invalid child type! (Removed)", $(this));
        $(this).replaceWith("");
      });

      //――――――――――――――――――――――― Unwrap span (Fix style font-size) ―――――――――――――――――――――――
      div.find("p > span , blockquote > span").each(function () {
        // Remove all direct span children !
        if ($(this).length) console.log("Unwrap span", $(this)[0].innerText);
        $(this).replaceWith($(this)[0].innerText);
      });

      //――――――――――――――――――――――― Final process ―――――――――――――――――――――――

      let out = div.html();
      // Remove comments:

      // eslint-disable-next-line no-useless-escape
      out = out.replace(/<\!--.*?-->/g, "");

      return out;
    },

    gist() {
      return $("#" + this.EDITABLE_BODY_ID)
        .find("p")
        .text()
        .trim()
        .substring(0, 256);
    },

    firstImage() {
      return $("#" + this.EDITABLE_BODY_ID)
        .find("img")
        .attr("src");
    },

    //―――――――――――――― Apply direction (English / Persian and...) ――――――――――――――
    applyDirectionDebounce: debounce(function (
      element,
      sample_text,
      link_element,
    ) {
      this.applyDirection(element, sample_text, link_element);
    }, 500),
    applyDirection(element, sample_text, link_element) {
      //console.log("applyDirection", element, sample_text, link_element);
      if (!element) return;
      //  if (element.innerText.length > 20 && !sample_text) return;   // Previously set direction!
      let doc = "";
      if (sample_text && !element) {
        try {
          /*doc = new DOMParser()
                              .parseFromString(sample_text, "text/xml")
                              .innerText.substring(0, 20);*/
          doc = sample_text.substring(0, 200);
        } catch (e) {
          doc = sample_text;
        }
      } else {
        doc = element.innerText.substring(0, 200);
      }
      //  console.log("element= "+element.innerText)

      //console.log("doc= "+doc)
      let isRTL = doc && this.isUnicode(doc);
      this.isRTL = isRTL;

      if (element.style.direction === (isRTL ? "rtl" : "ltr")) return;

      // console.log("sample_text= " + sample_text);
      //  console.log("link_element= " + link_element);

      //console.log("isRTL= " + isRTL);
      if (isRTL) {
        element.style.direction = "rtl";
        element.style.textAlign = "right";

        if (link_element) {
          link_element.style.direction = "rtl";
          link_element.style.textAlign = "right";
        }
      } else {
        element.style.direction = "ltr";
        element.style.textAlign = "left";

        if (link_element) {
          link_element.style.direction = "ltr";
          link_element.style.textAlign = "left";
        }
      }

      //console.log("---- END ----");
    },

    isUnicode(str) {
      return /[\u0590-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(
        str,
      );
    },
  },
});
</script>

<style lang="scss">
.review-style {
  .medium-insert-embeds-overlay {
    visibility: hidden;
    display: none;
  }
}

.medium-editor-placeholder-relative::after {
  left: unset !important;
}

.corrected figcaption {
  pointer-events: none !important;
}

.s--article-editor-container {
  width: 100%;

  p {
    unicode-bidi: embed !important;
  }

  /**
        blockquote
        */

  blockquote {
    display: flow-root;
    //  display: block;
    border-width: 2px 0;
    border-style: solid;
    border-color: #ddd;
    padding: 0.7em 0 0.5em;
    margin: 1.5em auto !important;
    position: relative;
    width: 85%;

    &:before {
      content: "\f10d";
      position: absolute;
      top: -5px;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--background);
      width: 3rem;
      height: 2rem;
      font-family: "Font Awesome 7 Free";
      font-weight: 900;
      font-size: 6em/1.08em;
      color: #666;
      text-align: center;
      font-size: x-large;
    }
  }

  /**
  Embed links
   */

  .medium-insert-embed {
    blockquote {
      font-size: 0.8rem;
      padding: 0;
      margin-bottom: 0 !important;
      border: none;

      &:before {
        content: none;
      }
    }

    a {
      border: none;

      &:hover {
        color: #3d80b4 !important;
      }
    }
  }

  // Table style
  table {
    background-color: #fafafa;
    border-spacing: 1px;
    border-collapse: collapse;
    // background: white;
    border-radius: 10px;
    overflow: hidden;
    width: 100%;
    margin: 0 auto;
    position: relative;
  }

  table * {
    position: relative;
  }

  table td,
  table th {
    padding-left: 8px;
  }

  table {
    margin: 12px 0;

    thead {
      tr {
        height: 60px;
        background: #3a3a3a;
        color: #fff;

        font-size: 0.9rem;

        td,
        th {
          text-align: start;
          padding: 8px;
        }
      }
    }
  }

  table tbody tr {
    height: 50px;
  }

  table tbody tr:last-child {
    border: 0;
  }

  .table th {
    // font-family: OpenSans-Regular;
    font-size: 18px;
    color: #fff;
    line-height: 1.2;
    font-weight: unset;
  }

  tbody tr:nth-child(even) {
    background-color: #f5f5f5;
  }

  tbody tr {
    //  font-family: OpenSans-Regular;
    font-size: 15px;
    color: #808080;
    line-height: 1.2;
    font-weight: unset;
  }

  tbody tr:hover {
    color: #555555;
    background-color: #f5f5f5;
    cursor: pointer;
  }
}

/**
      HR
      */
.s--article-editor-container hr {
  border: 0px;
  border-bottom: 2px dashed #b75ea8;
}

.s--article-editor-container {
  figure {
    img {
      max-width: 100%;
    }
  }

  // ================================================= Note =================================================

  h6 {
    // note
    padding: 0.5em 1em;
    font-size: 1.2rem;
    font-weight: normal;
    line-height: 2.2rem;
    border-left: solid cadetblue medium;
    background: #5f9ea01f;
    margin-bottom: 2rem;

    @media only screen and (max-width: 900px) {
      font-size: 1rem;
      margin-bottom: 1.5rem;
      line-height: 2rem;
    }

    @media only screen and (max-width: 600px) {
      font-size: 0.9rem;
      line-height: 1.8rem;
      margin-bottom: 1rem;
    }
  }

  // ================================================= Pre =================================================

  pre {
    padding: 0.5em 1em;
    font-size: 1rem;
    line-height: 1.4rem;
    border-left: solid #ffa000 medium;
    white-space: normal;
    // border-color: #ffe8cc;
    // border-radius: 16px;
    /*  background: -webkit-gradient(
        linear,
        left top,
        right top,
        from(#fce4ed),
        to(#ffe8cc)
      );*/

    // background: linear-gradient(to right, #fce4ed, #ffe8cc);

    a {
      border-bottom: 2.5px dotted #c2185b;
      color: #c2185b !important;

      &:hover {
        background: linear-gradient(to right, #7a0018, #e64a19);
      }
    }
  }
}

@media screen and (max-width: 600px) {
  .s--article-editor-container pre {
    font-size: 1em;
  }
}

.s--article-editor-container a {
  padding: 4px !important;
  margin: 0 2px;
  color: #19538d !important;
  font-size: 0.95em;

  &:visited {
    color: #19538d !important;
  }

  &:hover {
    text-decoration: none;
    color: #fff !important;
    border-bottom: unset;
    background: linear-gradient(to right, #0288d1, #3f51b5);
    border-radius: 3px;
  }
}

.s--article-editor-container {
  // OLD !DEPRECATED!
  .link-preview a {
    border-bottom: unset !important;

    &:hover {
      color: #3f51b5 !important;
    }
  }

  // Text link correction (for author link and ...
  .text-link-normal {
    a {
      background: unset;
      border-radius: unset;
      padding: unset;
      color: var(--theme-light) !important;
      font-size: 1em;
      font-weight: 500;

      &:hover {
        text-decoration: none !important;
        color: #0f75ac !important;
        border-radius: unset;
        background: unset;
      }
    }
  }
}

.s--article-editor-container ol {
  display: flow-root;
  margin: 1em 1em;
  line-height: 1em;
  font-size: 1.2rem;

  counter-reset: li;
  list-style: decimal;
  padding: 0;

  @media only screen and (max-width: 900px) {
    margin: 1.5em 0;
  }
}

.s--article-editor-container ol ol {
  margin: 0 0 0 2em;
}

.s--article-editor-container ol li {
  position: relative;
  display: block;
  padding: 0em 0.2em 0em 2em;
  margin: 0.5em 0;
  // background: #fafbfb;
  color: #444;
  text-decoration: none;
  -moz-border-radius: 0.3em;
  -webkit-border-radius: 0.3em;
  border-radius: 2em;

  line-height: 1.7em;

  p {
    margin: 0;
  }
}

.s--article-editor-container ol li:hover {
  text-decoration: none;
}

// =========== Un ordered list: ==============
.s--article-editor-container {
  --ol-li-dot-bg: linear-gradient(to right bottom, #333, #222);

  ol {
    li:before {
      content: counter(li);
      counter-increment: li;
      position: absolute;
      left: -1em;
      top: 50%;
      margin-top: -1em;

      background: var(--ol-li-dot-bg);

      font-size: 12px;
      height: 30px;
      width: 30px;
      border: 0.3em solid #fff;
      text-align: center;
      font-weight: bold;
      -moz-border-radius: 2em;
      -webkit-border-radius: 2em;
      border-radius: 2em;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  --ul-li-dot-bg: linear-gradient(to right bottom, #333, #222);

  ul {
    display: flow-root;
    margin: 1em 1em;
    line-height: 1em;
    font-size: 1.2rem;

    counter-reset: li;
    list-style: decimal;
    padding: 0;

    @media only screen and (max-width: 900px) {
      margin: 1.5em 0;
    }

    li {
      position: relative;
      display: block;
      padding: 0em 0.2em 0em 2em;
      margin: 0.5em 0;
      //   background: #fafbfb;
      color: #444;
      text-decoration: none;

      line-height: 1.7em;

      &:hover {
        text-decoration: none;
      }

      &:before {
        content: "•";
        counter-increment: li;
        position: absolute;
        left: -1em;
        top: 50%;
        margin-top: -1em;

        background: var(--ul-li-dot-bg);

        font-size: 12px;
        height: 30px;
        width: 30px;
        border: 0.3em solid #fff;
        text-align: center;
        font-weight: bold;
        border-radius: 2em;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      p {
        margin: 0;
      }

      &.filepond--item {
        &:before {
          content: unset;
        }
      }
    }
  }

  /**
-------------------- 🐜🐜🐜 Nested Lists 🐜🐜🐜 --------------------
*/
  ol,
  ul {
    ul {
      margin: 0;
      margin-inline-start: 1em;
      li {
        padding: 0;
        &:before {
          content: " ";
          height: 100%;
          width: 1px;
          border: none;
          border-inline-start: 0.2em solid #000;
          border-radius: 0;
          top: 0;
          bottom: 0;
          display: block;
          margin: 0;
        }
      }
    }
    ol {
      margin: 0;
      margin-inline-start: 1em;
      li {
        padding: 0;
        &:before {
          content: counter(li) " .";
          counter-increment: li;
          height: 100%;
          background: none;
          border: none;
          border-inline-start: 0.2em solid #000;
          border-radius: 0;
          top: 0;
          bottom: 0;
          display: inline-block;
          position: relative;
          margin: 0;
          color: currentColor;
        }
      }
    }
  }
  /**
--------------------------------------------------------
 */

  //--------------------------------------------------------------------------------
  // MEDIUM INSERT BUTTON
  //--------------------------------------------------------------------------------

  .medium-insert-buttons {
    width: 45px !important;

    .medium-insert-buttons-addons {
      //ul!

      margin: 1em !important;
      line-height: 1.2em !important;
      font-size: 1em !important;
      padding: 0 !important;

      li {
        position: relative;
        display: inline-block;
        padding: 0.2em !important;
        margin: 0;
        background: rgba(250, 251, 251, 0.1);
        color: #444;
        text-decoration: none;
        -moz-border-radius: 0.3em;
        -webkit-border-radius: 0.3em;
        border-radius: 2em;

        &:hover {
          text-decoration: none;

          background: linear-gradient(
            to right bottom,
            rgba(143, 211, 244, 0.3),
            rgba(86, 153, 213, 0.3)
          ) !important;
        }

        &:before {
          content: unset !important;
        }

        button {
          &.medium-insert-action {
            width: 220px;
            font-size: 14px;
            font-weight: 400;
            min-width: 32px;
            border: 1px solid #0061e0 !important;
            background: #0061e0;
            color: #fff !important;
            text-align: start;
            padding: 0 12px !important;
            white-space: nowrap;
            height: 42px;
            border-radius: 12px;

            span {
              margin: 0 4px;
            }
          }
        }
      }
    }
  }

  //--------------------------------------------------------------------------------
  // CLEAN UL OL STYLE
  //--------------------------------------------------------------------------------
  .component-editor-container {
    ul {
      display: block;
      margin: inherit;
      line-height: inherit;
      font-size: inherit;

      counter-reset: inherit;
      list-style: inherit;
      padding: inherit;
      margin-bottom: inherit;

      ul {
        margin: inherit;
      }

      li {
        position: inherit;
        display: inherit;
        padding: inherit;
        margin: inherit;
        background: inherit;
        color: inherit;

        &:before {
          content: none;
        }
      }
    }
  }

  .medium-editor-insert-plugin {
    .medium-insert-buttons {
      .medium-insert-buttons-addons {
        direction: ltr;
        z-index: 100;
        margin: 12px !important;
        top: 0px; //-6px;
        left: 0px; //150px;
      }

      .medium-insert-buttons-show {
        left: 16px;
        transition: all 0.4s;

        color: #fff !important;
        border: 2px solid #0061e0 !important;
        background-color: #0061e0 !important;

        width: 48px !important;
        height: 48px !important;
        border-radius: 24px !important;

        span {
          display: inline-flex;
          align-items: center;
        }

        &.medium-insert-buttons-rotate {
          //   transform: rotate(45deg) translateY(70px) translateX(-63px)  !important;
          color: #333 !important;
          border: 2px solid #333 !important;
          background-color: #fff !important;
        }

        &:hover {
          transform: scale(1.6, 1.6);

          &.medium-insert-buttons-rotate {
            transform: scale(1.6, 1.6) rotate(45deg);
          }
        }
      }
    }
  }

  .medium-editor-insert-plugin .medium-insert-buttons button {
    color: #456 !important;
    border: 1px solid #456 !important;
  }
}

/*================================================
Start Underline gradient
==================================================*/
.s--article-editor-container {
  u {
    background-image: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
    background-repeat: no-repeat;
    background-size: 100% 0.2em;
    background-position: 0 88%;
    transition: background-size 0.25s ease-in;
    text-decoration: none;

    &:hover {
      background-size: 100% 88%;
    }
  }
}

/*================================================
End Underline gradient
==================================================*/

//--------------------------------------------------------------------------------
// Embed frame correction:
//--------------------------------------------------------------------------------

.medium-insert-embed {
  iframe {
    width: 100%;
    //height: inherit; // Bad show iframe embed that has height!
  }
}

// Custom embed code:
p iframe {
  margin: auto;
  display: block;
}

//--------------------------------------------------------------------------------
// RTL SUPPORT
//--------------------------------------------------------------------------------

.for-rtl {
  &.s--article-editor-container {
    ol li {
      padding: 0em 2em 0em 0.2em;

      &:before {
        left: unset;
        right: -1em;
      }
    }

    ul li {
      padding: 0em 2em 0em 0.2em;

      &:before {
        left: unset;
        right: -1em;
      }
    }

    h6 {
      // note
      border-right: solid cadetblue medium;
      border-left: unset;
    }

    pre {
      border-right: solid #ffa000 medium;
      border-left: unset;
    }
  }
}

.medium-insert-embeds {
  @media only screen and (max-width: 600px) {
    min-width: 100% !important;
  }

  // By embed link:
  .medium-insert-embed {
    max-width: 1200px;

    .link-preview {
      // OLD! DEPRECATED AND REPLACE WITH .s--link-preview-...
      border-radius: 16px !important;

      .v-row,
      .row {
        .section-image {
          flex: unset !important;
          //  max-width: 220px !important;
          max-height: 220px;
          overflow: hidden;

          .section-text {
            font-size: 1rem;
          }
        }
      }
    }
  }

  &.medium-insert-embeds-left,
  &.medium-insert-embeds-right {
    // NEW
    .s--link-preview-card {
      .s--link-preview-row {
        flex-direction: column;
        .s--link-preview-main-image {
          display: block;
          padding: 0 !important;
          margin: 0 !important;
          .s--link-preview-image-container {
            min-height: 160px;
          }
        }
      }
    }
  }

  &.medium-insert-embeds-left {
    // OLD !DEPRECATED!
    .link-preview {
      .v-row,
      .row {
        display: block !important;

        /* .section-image {
          flex: unset !important;
          max-width: 200px !important;
        }*/

        .section-text {
          flex: unset !important;
          max-width: unset !important;
          padding-left: 12px !important;
          padding-right: 12px !important;
        }
      }
    }
  }

  &.medium-insert-embeds-right {
    // OLD !DEPRECATED!
    .link-preview {
      .v-row,
      .row {
        display: block !important;

        /*  .section-image {
          flex: unset !important;
          max-width: 200px !important;
        }*/

        .section-text {
          flex: unset !important;
          max-width: unset !important;
          padding-left: 12px !important;
          padding-right: 12px !important;
        }
      }
    }
  }
  // OLD !DEPRECATED!
  .link-preview {
    margin: 12px 0 24px 0 !important;
    position: relative;

    .v-row,
    .row {
      margin: 0 !important;
    }

    .preview-title {
      line-height: 1.7em;
      font-weight: bold;
    }

    .preview-description {
      font-size: 0.9em;
      line-height: 1.7em;
    }

    .main-image {
      border-radius: 12px;
      margin: 0;

      .v-image__image {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        background-size: cover;
      }
    }

    .preview-provider {
      font-size: 0.8rem;
      color: #777;
      margin: 4px;
      line-height: 1em;

      img {
        height: 16px !important;
        width: auto !important;
      }
    }
  }

  .link-preview-big {
    margin: 12px 0 24px 0 !important;
    position: relative;

    .v-row {
      margin: 0 !important;
    }

    .preview-title {
      line-height: 1.7em;
      font-weight: bold;
    }

    .preview-description {
      font-size: 0.9em;
      line-height: 1.7em;
    }

    .main-image {
      border-radius: 4px;
    }

    .preview-provider {
      font-size: 0.8rem;
      color: #777;
      margin: 4px;
      line-height: 1em;
    }
  }

  a {
    background: transparent !important;
    font-weight: 500;
    padding: 6px;
    color: #333 !important;
    font-size: 0.95em;

    &:hover {
      text-decoration: none;
      color: #000;
      font-weight: 600;

      &.preview-provider {
        background: linear-gradient(to right, #fafafa, #f4f4f4) !important;
      }
    }
  }

  .embed-video-view {
    overflow: hidden;
    position: relative;
    padding-top: 61%;

    iframe {
      //  height: 480px;
      // max-width: 772px;
      border: 0;
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
    }
  }

  .medium-insert-embed {
    twitter-widget {
      margin-right: auto !important;
      margin-left: auto !important;
    }

    blockquote {
      margin-right: auto !important;
      margin-left: auto !important;
    }
  }

  .embed-raw-html {
    text-align: start;
  }
}

// End: .medium-insert-embeds

.medium-insert-images-safe,
.medium-insert-images {
  margin-top: 2rem;
  margin-bottom: 2rem;

  &.medium-insert-images-mediumImage {
    max-width: 100%;
    width: max-content;
    // max-height: 400px;
    border-radius: 14px;
    //  border: rgb(204, 214, 221) solid 1px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    box-shadow: 0 0 50px 3px rgba(68, 68, 68, 0.22) !important;
    transition: all 0.4s;
    margin: 2rem auto 2rem auto;

    figure {
      max-width: 640px;
    }

    &:after {
      transform: scale(0);
      transition: all 0.4s;
      pointer-events: none;
      position: absolute;
      top: 12px;
      right: 12px;
      color: #fff;
      font-size: 16px;
      z-index: 2;
      font-family: "Font Awesome 7 Free";
      font-weight: 900;
      content: "\f065";
      padding: 6px;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      background-color: #3d80b4;
      line-height: 16px;
    }

    &:hover {
      box-shadow: 0px 3px 20px 2px rgba(68, 68, 68, 0.22) !important;

      &:after {
        transform: scale(1);
      }
    }
  }

  figcaption {
    a {
      &:visited {
        color: #333 !important;
      }

      color: #333 !important;
      border-bottom-color: #333;
      pointer-events: all !important;

      &:hover {
        color: #fff !important;
        background: linear-gradient(to right, #0288d1, #3f51b5);
      }
    }
  }
}

.auto-justify {
  @media only screen and (max-width: 900px) {
    p {
      text-align: justify;
    }
    ol {
      text-align: justify;
    }
    ul {
      text-align: justify;
    }

    blockquote {
      text-align: center;
    }
  }
}

// Add style hover editable for component show setting dialog:
.can-edit-medium-insert {
  .hover-open-edit-dialog {
    position: relative;

    &:hover {
      &:after {
        position: absolute;
        left: 3%;
        top: 3%;
        width: 94%;
        height: 94%;
        content: "Edit now";
        color: #57595c;
        font-size: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: linear-gradient(
          to top,
          rgba(207, 217, 223, 0.85) 0%,
          rgba(226, 235, 240, 0.89) 100%
        );
        //pointer-events: none;
        cursor: pointer;
        border-radius: 24px;
      }
    }
  }

  // Prevent click on embedded custom html in edit mode!
  .embed-raw-html {
    pointer-events: none;
    user-select: none;
  }
}

//------------------------ NEW STYLE ------------------------

.u-article-body-view,
.u-article-body-edit {
  p {
    margin-bottom: 2rem;
  }
}
</style>
