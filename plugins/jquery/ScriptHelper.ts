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
import $ from "jquery";

window.$ = $;
window.jQuery = $;

//█████████████████████████████████████████████████████████████
//――――――――――――――――― JQuery ――――――――――――――――
//█████████████████████████████████████████████████████████████

/**
 * Utility class for loading external scripts with caching support.
 */
export class ScriptHelper {
  /**
   * Loads an external script with caching enabled.
   * Allows for additional options to be passed to the jQuery `$.ajax` function,
   * while enforcing specific settings for data type and caching.
   *
   * @param url - The URL of the script to load.
   * @param options - Optional. Additional AJAX options, such as `success` and `error` callbacks.
   * @returns A `jqXHR` object for chaining callbacks.
   *
   * @example
   * ```typescript
   * ScriptHelper.CachedScript("https://example.com/script.js", {
   *   success: () => console.log("Script loaded successfully"),
   *   error: (jqXHR, textStatus, errorThrown) => console.error("Script load error", errorThrown)
   * });
   * ```
   */
  public static CachedScript(url: string, options?: any) {
    // Allow user to set any option except for dataType, cache, and url
    options = $.extend(options || {}, {
      dataType: "script",
      cache: true,
      url: url,
    });

    // Use $.ajax() since it is more flexible than $.getScript
    // Return the jqXHR object so we can chain callbacks
    return $.ajax(options);
  }
}
