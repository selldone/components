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

import GlobalRules from "@selldone/core-js/helper/rules/GlobalRules";

export class EmailOptionsHelper {
  static GeneratePageOptions(structure: Object) {
    return [
      {
        type: "section",
        key: "section_page",
        title: "Page",
        icon: "file_open",
        description:
          "Here, you can customize the color, size, and other aspects of your email page.",
        children: [
          {
            type: "text",
            object: structure,
            key: "max_width",
            label: "Page Max Width",
            placeholder: "Default is 600px",
          },

          {
            type: "color",
            object: structure,
            key: "page_color",
            label: "Main Page Background",
            placeholder: "Default is #FAFAFA",
          },

          {
            type: "color",
            object: structure,
            key: "sections_color",
            label: "Sections Background Color",
            placeholder: "Default is #FFFFFF",
          },
        ],
      },

      {
        type: "section",
        key: "section1",
        title: "Colors",
        icon: "palette",
        description: "Define the primary colors for the email.",
        children: [
          {
            type: "color",
            object: structure,
            key: "color_1",
            label: "Primary Color",
          },
          {
            type: "color",
            object: structure,
            key: "color_2",
            label: "Secondary Color",
          },
        ],
      },

      {
        type: "section",
        key: "section2",
        title: "Font",
        icon: "font_download",
        description:
          "You can enter any font family name in Google fonts. Find more fonts here: https://fonts.google.com",

        children: [
          {
            type: "font",
            object: structure,
            key: "font_title",
            label: "Headers font",
          },
          {
            type: "font",
            object: structure,
            key: "font_text",
            label: "Text font",
            show_fonts: true /*Show loaded font list*/,
          },
        ],
      },
    ];
  }

  static GenerateHeaderOptions(structure: Object & { header: Object }) {
    return [
      {
        type: "section",
        key: "section1",
        title: "Background Image",
        icon: "wallpaper",
        children: [
          {
            type: "image",
            object: structure.header,
            key: "bg_image",
            label: "Background image",
          },
        ],
      },

      {
        type: "section",
        key: "section3",
        title: "Header Image",
        icon: "image",
        description:
          "Here, you can personalize the header image of your email, which will be displayed at the center of the email header.",

        children: [
          {
            type: "image",
            object: structure.header,
            key: "image",
            label: "Header image",
          },
          {
            type: "text",
            object: structure.header,
            key: "image_width",
            label: "Image width",
            placeholder: "100px or 50% & etc..",
          },
          {
            type: "text",
            object: structure.header,
            key: "image_max_width",
            label: "Image max width",
            placeholder: "200px & etc..",
          },
        ],
      },

      {
        type: "section",
        key: "section_content",
        title: "Content",
        icon: "code",
        description: "Modify the section's content. HTML code is permissible.",

        children: [
          {
            type: "align",
            object: structure.header,
            key: "align",
            label: "Text Alignment",
          },

          {
            type: "text",
            object: structure.header,
            key: "title",
            label: "Title",
          },
          {
            type: "text",
            object: structure.header,
            key: "sub_title",
            label: "Subtitle",
          },
        ],
      },
    ];
  }

  static GenerateProductOptions(section: Object) {
    return [
      {
        type: "section",
        key: "section1",
        title: "Background",
        icon: "wallpaper",
        description: "Modify the background for this section.",

        children: [
          {
            type: "color",
            object: section,
            key: "bg_color",
            label: "Background color",
          },
          {
            type: "image",
            object: section,
            key: "bg_image",
            label: "Section background Image",
          },

          {
            type: "boolean",
            object: section,
            key: "dark",
            true_icon: "dark_mode",
            false_icon: "light_mode",
            label: "Dark Mode",
            messages: "Change the text to white.",
          },
        ],
      },

      {
        type: "section",
        key: "section3",
        title: "Product",
        icon: "conveyor_belt",

        children: [
          {
            type: "product",
            object: section,
            key: "product",
            label: "Select product",
          },

          {
            type: "boolean",
            object: section,
            key: "reverse",
            label: "Reverse Mode",
            messages: "Rearrange the column order.",
          },
        ],
      },

      {
        type: "section",
        key: "section_content",
        title: "Content",
        icon: "code",
        description: "Modify the section's content. HTML code is permissible.",

        children: [
          {
            type: "align",
            object: section,
            key: "align",
            label: "Text Alignment",
          },

          {
            type: "text",
            object: section,
            key: "span",
            label: "Header",
          },
          {
            type: "text",
            object: section,
            key: "title",
            label: "Title",
          },
          {
            type: "text",
            object: section,
            key: "message",
            label: "Message",
          },
        ],
      },

      {
        type: "product",
        object: section,
        key: "product",
      },
    ];
  }

  static GenerateImageOptions(section: Object) {
    return [
      {
        type: "section",
        key: "section1",
        title: "Background",
        icon: "wallpaper",
        description: "Modify the background for this section.",

        children: [
          {
            type: "boolean",
            object: section,
            key: "dark",
            true_icon: "dark_mode",
            false_icon: "light_mode",
            label: "Dark Mode",
            messages: "Change the text to white.",
          },
          {
            type: "color",
            object: section,
            key: "bg_color",
            label: "Background color",
          },

          {
            type: "image",
            object: section,
            key: "bg_image",
            label: "Section background Image",
          },
        ],
      },

      {
        type: "section",
        key: "section2",
        title: "Image",
        icon: "image",
        description: "Set the primary image for this section.",

        children: [
          {
            type: "text",
            object: section,
            key: "url",
            label: "Url",
            placeholder: "https://yourstore.com/...",
          },

          {
            type: "text",
            object: section,
            key: "image_max_width",
            label: "Image max width",
            placeholder: "200px & etc..",
          },
          {
            type: "text",
            object: section,
            key: "image_max_height",
            label: "Image max height",
            placeholder: "200px & etc..",
          },
        ],
      },

      {
        type: "section",
        key: "section_content",
        title: "Content",
        icon: "code",
        description: "Modify the section's content. HTML code is permissible.",

        children: [
          {
            type: "align",
            object: section,
            key: "align",
            label: "Text Alignment",
          },

          {
            type: "text",
            object: section,
            key: "span",
            label: "Header",
          },

          {
            type: "text",
            object: section,
            key: "message",
            label: "Message",
          },
        ],
      },
    ];
  }

  static GenerateTwoColumnsOptions(
    section: Object & { s1: Object; s2: Object },
  ) {
    return [
      {
        type: "section",
        key: "section1",
        title: "Background",
        icon: "wallpaper",
        description: "Modify the background for this section.",

        children: [
          {
            type: "boolean",
            object: section,
            key: "dark",
            true_icon: "dark_mode",
            false_icon: "light_mode",
            label: "Dark Mode",
            messages: "Change the text to white.",
          },
          {
            type: "color",
            object: section,
            key: "bg_color",
            label: "Background color",
          },

          {
            type: "image",
            object: section,
            key: "bg_image",
            label: "Section background Image",
          },
        ],
      },

      {
        type: "section",
        key: "section_col1",
        title: "Content Column 1",
        icon: "code",
        description: "Modify the section's content. HTML code is permissible.",

        children: [
          {
            type: "align",
            object: section.s1,
            key: "align",
            label: "Text Alignment",
          },

          {
            type: "text",
            object: section.s1,
            key: "title",
            label: "Title",
          },

          {
            type: "text",
            object: section.s1,
            key: "html",
            label: "Message",
          },
        ],
      },

      {
        type: "section",
        key: "section_col2",
        title: "Content Column 2",
        icon: "code",
        description: "Modify the section's content. HTML code is permissible.",

        children: [
          {
            type: "align",
            object: section.s2,
            key: "align",
            label: "Text Alignment",
          },

          {
            type: "text",
            object: section.s2,
            key: "title",
            label: "Title",
          },

          {
            type: "text",
            object: section.s2,
            key: "html",
            label: "Html code",
          },
        ],
      },
    ];
  }

  static GenerateTextOptions(section: Object) {
    return [
      {
        type: "section",
        key: "section1",
        title: "Background",
        icon: "wallpaper",
        description: "Modify the background for this section.",

        children: [
          {
            type: "boolean",
            object: section,
            key: "dark",
            true_icon: "dark_mode",
            false_icon: "light_mode",
            label: "Dark Mode",
            messages: "Change the text to white.",
          },
          {
            type: "color",
            object: section,
            key: "bg_color",
            label: "Background color",
          },
          {
            type: "image",
            object: section,
            key: "bg_image",
            label: "Section background Image",
          },
        ],
      },

      {
        type: "section",
        key: "section_content",
        title: "Content",
        icon: "code",
        description: "Modify the section's content. HTML code is permissible.",

        children: [
          {
            type: "align",
            object: section,
            key: "align",
            label: "Text Alignment",
          },

          {
            type: "text",
            object: section,
            key: "span",
            label: "Header",
          },

          {
            type: "text",
            object: section,
            key: "title",
            label: "Title",
          },
          {
            type: "text",
            object: section,
            key: "text",
            label: "Message",
          },
        ],
      },
    ];
  }

  static GenerateActionButtonOptions(action: Object, deleteCallback: Function) {
    return [
      {
        type: "boolean",
        object: action,
        key: "tracking",
        label: "Enable tracking",
      },

      {
        type: "boolean",
        object: action,
        key: "dark",
        label: "Dark style",
      },
      {
        type: "boolean",
        object: action,
        key: "outline",
        label: "Outline style",
      },
      {
        type: "boolean",
        object: action,
        key: "rounded",
        label: "Rounded style",
      },
      {
        type: "boolean",
        object: action,
        key: "large",
        label: "Large",
      },

      {
        type: "boolean",
        object: action,
        key: "xlarge",
        label: "XLarge",
      },

      {
        type: "text",
        object: action,
        key: "href",
        label: "Url",
        placeholder: "https://yourstore.com/...",
        counter: 128,
        rules: [GlobalRules.counter(128), GlobalRules.required()],
        messages: "Set a url",
      },

      {
        type: "text",
        object: action,
        key: "text",
        label: "Button caption",
        placeholder: "Visit our...",
      },
      {
        type: "delete",
        callback: deleteCallback,
      },
    ];
  }
}
