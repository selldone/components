// @ts-nocheck
/*
 * Copyright (c) 2023. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */
import $ from 'jquery';
window.$ = $;
window.jQuery = $;
/**
 * https://github.com/orthes/medium-editor-insert-plugin/blob/master/src/js/images.js
 *
 */
(function ($, window, document, undefined) {
  "use strict";

  const ComponentElementName = "images-compare";

  const RootClassName = ".images-compare";
  const ActiveClassNameSelector = ".medium-insert-images-compare-active";
  const ActiveClassName = "medium-insert-images-compare-active";

  /**
   * ――――――――――――――――――――――― Default values ―――――――――――――――――――――――
   */
  const pluginName = "mediumInsert",
    addonName = "ImagesCompareAddon", // first char is uppercase
    defaults = {
      label: '<span class="fas fa-images"></span> Comparison',

      captions: false, // (boolean) Enable captions

      actions: {
        remove: {
          label: '<span class="fas fa-times"></span>',
          clicked: function () {
            const $event = $.Event("delete");

            $event.which = 8; // Simulate delete button keydown!
            $(document).trigger($event);
          },
        },
      },
    };

  /**
   * ――――――――――――――――――――――― Add-On Object ―――――――――――――――――――――――
   *
   * Sets options, variables and calls init() function
   *
   * @constructor
   * @param {DOM} el - DOM element to init the plugin on
   * @param {object} options - Options to override defaults
   * @return {void}
   */

  function CustomAddon(el, options) {
    this.el = el;
    this.$el = $(el);
    this.templates = window.MediumInsert.Templates;
    this.core = this.$el.data("plugin_" + pluginName);

    this.options = $.extend(true, {}, defaults, options);

    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  }

  /**
   * Initialization
   *
   * @return {void}
   */

  CustomAddon.prototype.init = function () {
    this.events();
  };

  /**
   * ――――――――――――――――――――――― Event listeners ―――――――――――――――――――――――
   *
   * @return {void}
   */

  CustomAddon.prototype.events = function () {
    $(document)
      .on("delete", $.proxy(this, "deleteAction"))

      //.on('click', $.proxy(this, 'unselectImage'))
      .on("keydown", RootClassName, $.proxy(this, "keydownAction"))
      .on("keyup", RootClassName, $.proxy(this, "keydownAction"))
      .on("keypress", RootClassName, $.proxy(this, "keydownAction"))

      .on(
        "click",
        ".medium-insert-images-toolbar2 .medium-editor-action",
        $.proxy(this, "toolbar2Action"),
      )

      .on("click", $.proxy(this, "unselectAction"));
    this.$el.on("click", RootClassName, $.proxy(this, "selectAction"));

    // .on('paste', $.proxy(this, 'pastAction'))
  };

  CustomAddon.prototype.pastAction = function (e) {
    e.preventDefault();
  };

  /**
   * ――――――――――――――――――――――― Event ▶ Key down ―――――――――――――――――――――――
   * @param e
   */
  CustomAddon.prototype.keydownAction = function (e) {
    const $el = $(e.target);
    // e.preventDefault();
    ///  e.stopPropagation();
  };

  /**
   * ――――――――――――――――――――――― Event ▶ Click ▶ Unselect action ―――――――――――――――――――――――
   * @param e
   */
  CustomAddon.prototype.unselectAction = function (e) {
    const $el = $(e.target).closest(RootClassName),
      $image = this.$el.find(ActiveClassNameSelector);

    if ($el) {
      $image.not($el).removeClass(ActiveClassName);
      $(".medium-insert-images-toolbar2").remove();

      return;
    }
  };

  /**
   * ――――――――――――――――――――――― Event ▶ Click ▶ Select action ―――――――――――――――――――――――
   * @param e
   */
  CustomAddon.prototype.selectAction = function (e) {
    let that = this,
      $image;

    if (this.core.options.enabled) {
      $image = $(e.target).closest(RootClassName);

      this.$currentImage = $image;

      // Hide keyboard on mobile devices
      this.$el.blur();

      $image.addClass(ActiveClassName);
      //$image.closest('.medium-insert-images').addClass('medium-insert-active');

      setTimeout(function () {
        that.addToolbar();
        /*
                                if (that.options.captions) {
                                  that.core.addCaption($image.parent().closest('div'), that.options.captionPlaceholder);
                                }*/
      }, 50);
    }
  };

  /**
   * ――――――――――――――――――――――― Toolbar ▶ Add toolbar ―――――――――――――――――――――――
   * Add toolbar to editor
   *
   * @returns {void}
   */

  CustomAddon.prototype.addToolbar = function () {
    let $image = this.$el,
      mediumEditor = this.core.getEditor(),
      toolbarContainer = mediumEditor.options.elementsContainer || "body",
      $toolbar2;

    $(toolbarContainer).append(
      this.templates["src/js/templates/images-toolbar.hbs"]({
        styles: this.options.styles,
        actions: this.options.actions,
      }).trim(),
    );

    $toolbar2 = $(".medium-insert-images-toolbar2");

    this.repositionToolbars();

    $toolbar2.fadeIn();
  };

  CustomAddon.prototype.autoRepositionToolbars = function () {
    setTimeout(
      function () {
        this.repositionToolbars();
        this.repositionToolbars();
      }.bind(this),
      0,
    );
  };

  /**
   * ――――――――――――――――――――――― Toolbar ▶ Position ―――――――――――――――――――――――
   */
  CustomAddon.prototype.repositionToolbars = function () {
    let $toolbar2 = $(".medium-insert-images-toolbar2"),
      $image = this.$el.find(ActiveClassNameSelector),
      elementsContainer = this.core.getEditor().options.elementsContainer,
      elementsContainerAbsolute =
        ["absolute", "fixed"].indexOf(
          window
            .getComputedStyle(elementsContainer)
            .getPropertyValue("position"),
        ) > -1,
      elementsContainerBoundary = elementsContainerAbsolute
        ? elementsContainer.getBoundingClientRect()
        : null,
      containerWidth = $(window).width(),
      position = {};

    if ($toolbar2.length) {
      position.top = $image.offset().top + 2;
      position.left =
        $image.offset().left + $image.width() - $toolbar2.width() - 4; // 4px - distance from a border

      if (elementsContainerAbsolute) {
        position.top +=
          elementsContainer.scrollTop - elementsContainerBoundary.top;
        position.left -= elementsContainerBoundary.left;
        containerWidth = $(elementsContainer).width();
      }

      if (position.left + $toolbar2.width() > containerWidth) {
        position.left = containerWidth - $toolbar2.width();
      }

      $toolbar2.css(position);
    }
  };

  /**
   * ――――――――――――――――――――――― Toolbar ▶ Delete Action ―――――――――――――――――――――――
   * @param e
   */
  CustomAddon.prototype.deleteAction = function (e) {
    let images = [],
      $selectedImage = this.$el.find(ActiveClassNameSelector),
      $empty,
      selectedHtml,
      i;

    if (!$selectedImage || !$selectedImage.length) return;

    if (e.which === 8 || e.which === 46) {
      if ($selectedImage.length) {
        images.push($selectedImage);
      }

      if (images.length) {
        for (i = 0; i < images.length; i++) {
          images[i].closest("div").remove();
        }

        // Hide addons
        this.core.hideAddons();
        if (!selectedHtml && $empty) {
          e.preventDefault();
          this.core.moveCaret($empty);
        }

        $(".medium-insert-images-toolbar2").remove();
        this.core.triggerInput();
      }
    }
  };

  /**
   * ――――――――――――――――――――――― Toolbar ―――――――――――――――――――――――
   * @param e
   */
  CustomAddon.prototype.toolbar2Action = function (e) {
    let $button, callback;

    if (this.$currentImage === null) {
      return;
    }

    const current_items = this.$el.find(ActiveClassNameSelector);
    if (!current_items || !current_items.length) return;

    $button = $(e.target).is("button")
      ? $(e.target)
      : $(e.target).closest("button");
    callback = this.options.actions[$button.data("action")].clicked;

    if (callback) {
      callback(this.$el.find(".medium-insert-image-active"));
    }

    this.core.hideButtons();

    this.core.triggerInput();
  };

  /**
   * ――――――――――――――――――――――― Add Component ―――――――――――――――――――――――
   * Add custom content
   *
   * This function is called when user click on the addon's icon
   *
   * @return {void}
   */

  CustomAddon.prototype.add = function () {
    let $place = this.$el.find(".medium-insert-active");

    $place.replaceWith(
      `<${ComponentElementName} class="medium-insert-active"></${ComponentElementName}>`,
    );

    console.log("$place", $place);

    this.core.hideButtons();

    $place = this.$el.find(".medium-insert-active"); // Need re find element!

    if ($place.next().is("p")) {
      console.log("after", "is p");
      this.core.moveCaret($place.next());
    } else {
      console.log("after", "is not p");
      $place.after("<p><br></p>"); // add empty paragraph so we can move the caret to the next line.
      this.core.moveCaret($place.next());
    }

    this.core.getEditor().trigger("request-re-render", null, $place); // Trigger render components.

    // $place.click();
  };

  /**
   * ――――――――――――――――――――――― Initialize ―――――――――――――――――――――――
   * Addon initialization
   */

  $.fn[pluginName + addonName] = function (options) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName + addonName)) {
        $.data(
          this,
          "plugin_" + pluginName + addonName,
          new CustomAddon(this, options),
        );
      }
    });
  };

  /**
   * Get the Core object
   *
   * @return {object} Core object
   */
  CustomAddon.prototype.getCore = function () {
    return this.core;
  };
})(jQuery, window, document);
