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

//█████████████████████████████████████████████████████████████
//―――――――――――――――― Directives ―――――――――――――――
//█████████████████████████████████████████████████████████████
import CopyDirective from "./directives/CopyDirective";

import TrackDirective from "@components/directives/TrackDirective";

import DynamicScriptDirective from "./directives/DynamicScriptDirective";
import DragScrollDirective from "./directives/dragscroll/DragScrollDirective";
import { App } from "vue";

export function installGlobalDirectives(app: App) {
  app.directive("copy", CopyDirective);
  app.directive("track", TrackDirective);
  app.directive("dynamic-scripts", DynamicScriptDirective);
  app.directive("dragscroll", DragScrollDirective);
}
