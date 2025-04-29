/*
 * Copyright (c) 2025. Selldone® Business OS™
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

import { markRaw, VNode } from "vue";
import { CONSOLE } from "@selldone/core-js/helper";
import { defineComponent } from "vue/dist/vue.esm-bundler.js";

export class VueComponentBuilder {
  context: VNode = null;

  create(code: string | null, context: VNode) {
    this.context = context;

    try {
      return markRaw(this.generateComponent(code));
    } catch (e) {
      return markRaw(
        defineComponent({
          template: `<div class="py-16">
<b style="color: red;font-size: 2rem">🚫 Can not render! </b><br> ${e.toString()}
</div>`,
        }),
      );

      //console.error("Error in generating component", e);
    }
  }

  generateComponent(html) {
    CONSOLE.log("🔥 Generating Vue Component");

    const {
      html: cleanHTML,
      scriptContent,
      styleContent,
    } = this.parseHTML(html);

    // Assuming scriptContent is something like "{ data: () => ({ foo: 'bar' }), methods: { someMethod() {} } }"

    // Remove the script tags and any non-JavaScript content
    let scriptText = scriptContent
      .replace(/<script lang="ts">|<\/script>/g, "")
      .trim();

    function checkForAnyImports(code) {
      const importRegex = /import\s+.*\s+from\s+['"].*['"];?/;

      if (importRegex.test(code)) {
        throw new Error(
          "Restricted import found in the code. You can not use 'import' in the custom code.",
        );
      }
    }

    //  checkForAnyImports(scriptText);

    // Evaluate the script to extract the configuration
    let config = {};

    if (scriptText) {
      try {
        const evalScript = new Function(scriptText + "; return config;");
        config = evalScript();
      } catch (e) {
        // console.error("Error in evaluating script", e);
      }
    }

    const context = this.context;

    try {
      return defineComponent({
        template: cleanHTML,
        //components: {}, // Register local custom components
        ...config,
        mounted() {
          // console.log("On mounded custom component!", styleContent);
          if (styleContent) {
            const styleElement = document.createElement("style");
            styleElement.textContent = styleContent;
            //console.log("On mounded custom component!",  this.$el);
            context.$el.appendChild(styleElement);
          }
        },
      });
    } catch (error) {
      console.error("Error generating component:", error);
    }
  }

  parseHTML(html) {
    // Convert `export default` to `const config = ...`
    if (html.includes("export default")) {
      html = html.replace(/export\s+default\s*{?/, "const config = {");
    }
    //console.log("html --> ", html);

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const scripts = doc.querySelectorAll("script");

    // Extract scripts:
    let scriptContent = "";

    //  console.log("scripts --> ", scripts);

    scripts.forEach((script) => {
      scriptContent += script.textContent;
      script.parentNode.removeChild(script);
    });

    // Extract style:
    let styleContent = "";
    const styles = doc.querySelectorAll("style");
    styles.forEach((style) => {
      styleContent += style.textContent;
      style.parentNode.removeChild(style);
    });
    // console.log("styles --> ", styleContent);

    // Try to find HTML:
    const template = doc.querySelector("div > template");
    CONSOLE.log("templates --> ", template);

    let templateContent = template ? template.innerHTML : doc.body.innerHTML;

    return {
      html: templateContent,
      scriptContent,
      styleContent,
    };
  }
}
