/*
 * Copyright (c) 2024. Selldone® Business OS™
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

import {EventBus, EventName} from "@selldone/core-js/events/EventBus";
import {Language} from "@selldone/core-js/enums/language/Language";

export const ArticleMixin = {
  props: {},
  data() {
    return {
      EventBus: EventBus,
    };
  },
  methods: {
    /**
     * Show images compare dialog
     * @param pack
     * @param callback
     * @param deleteCallback
     * @param tab
     * @param masterId
     * @constructor
     */
    ShowImagesCompareGlobalDialog(
      pack: any,
      callback: () => void,
      deleteCallback: () => void,
      tab = null,
      masterId = null /*Point which dialog open!*/,
    ) {
      EventBus.$emit(EventName.ARTICLE_COMPARE_IMAGES_SHOW, {
        pack,
        callback,
        deleteCallback,
        tab,
        masterId,
      });
    },

    /**
     * Show flip book dialog
     * @param pack
     * @param callback
     * @param deleteCallback
     * @param tab
     * @param masterId
     * @constructor
     */
    ShowFlipBookGlobalDialog(
      pack: any,
      callback: () => void,
      deleteCallback: () => void,
      tab = null,
      masterId = null /*Point which dialog open!*/,
    ) {
      EventBus.$emit(EventName.ARTICLE_FLIP_BOOK_SHOW, {
        pack,
        callback,
        deleteCallback,
        tab,
        masterId,
      });
    },

    /**
     * Show code editor dialog
     * @param code
     * @param language
     * @param callback
     * @param deleteCallback
     * @param masterId
     * @constructor
     */

    ShowCodeEditorGlobalDialog(
      code: string,
      language: keyof typeof Language,
      callback: () => void,
      deleteCallback: () => void,
      masterId = null /*Point which dialog open!*/,
    ) {
      EventBus.$emit(EventName.ARTICLE_CODE_EDITOR_SHOW, {
        code,
        language,
        callback,
        deleteCallback,
        masterId,
      });
    },
  },
};
