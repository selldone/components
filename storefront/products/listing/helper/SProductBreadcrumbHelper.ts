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

import {Category} from "@selldone/core-js";
import type {Product} from "@selldone/core-js";

export class SProductBreadcrumbHelper {


  /**
   * Customer shop page.
   *
   * @param root_name
   * @param parent_folders
   * @param shop_name
   * @param product
   * @param root_icon
   * @returns {[]}
   * @constructor
   */
  static GenerateCategoryHierarchyGeneral(
    root_name: string,
    parent_folders: Category & {
      parent: Category & { parent: Category & { parent: Category } };
    },
    shop_name: string,
    product: Product | null = null,
    root_icon: string = "home",
  ) {
    const out = [];

    out.push({
      id: -1,

      text: root_name,
      icon: root_icon,
      disabled: false,
      to: {
        name: window.$storefront.routes.SHOP_PAGE,
        params: { shop_name: shop_name },
      },
      href: "#",
    });

    if (parent_folders) {
      if (parent_folders.parent) {
        if (parent_folders.parent.parent) {
          if (parent_folders.parent.parent.parent) {
            const category = parent_folders.parent.parent.parent;
            out.push({
              id: category.id,
              text: category.title,
              image: category.icon,
              disabled: false,
              to: {
                name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
                params: { shop_name: shop_name, category_name: category.name },
              },
            });
          } // End Parent > Parent > Parent
          const category = parent_folders.parent.parent;

          out.push({
            id: category.id,
            text: category.title,
            image: category.icon,
            disabled: false,
            to: {
              name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
              params: { shop_name: shop_name, category_name: category.name },
            },
          });
        } // End Parent > Parent
        const category = parent_folders.parent;

        out.push({
          id: category.id,
          text: category.title,
          image: category.icon,
          disabled: false,
          to: {
            name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
            params: { shop_name: shop_name, category_name: category.name },
          },
        });
      } // End Parent
      const category = parent_folders;

      if (category.title)
        // Solve initial wrong show
        out.push({
          id: category.id,
          text: category.title,
          image: category.icon,
          disabled: false,
          to: {
            name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
            params: { shop_name: shop_name, category_name: category.name },
          },
        });
    }

    if (product)
      out.push({
        id: -2,
        text: product.title,
        image: product.icon,
        disabled: true,
        href: "",
      });

    return out;
  }


}
