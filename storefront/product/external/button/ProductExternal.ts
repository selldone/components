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

/**
 * Interface representing the structure of service data.
 * Each service includes its name, image, action text, color, and a domain pattern
 * for identifying the service based on a URL's domain.
 */
interface ServiceData {
  name: string;
  image: string;
  actionText: string;
  color: string;
  domainPattern: RegExp;
}

/**
 * The ProductExternal class provides a method to identify a service based on a given URL.
 * It checks the URL's domain against known patterns for supported services (Amazon, Airbnb)
 * and returns relevant data including the service name, image, action text, and color.
 */
export class ProductExternal {
  /**
   * Array of supported services, each containing its name, image, action text, color,
   * and a regular expression pattern to match the service's domain in a URL.
   */

  private static readonly SERVICES: ServiceData[] = [
    {
      name: "global.ProductExternal.Amazon.name",
      image: require("@selldone/components-vue/assets/trademark/amazon-w.svg"),
      actionText: "global.ProductExternal.Amazon.actionText",
      color: "#000",
      domainPattern:
        /^(.*\.)?(amazon\.[a-z\.]{2,6}|amzn\.to|amzn\.[a-z\.]{2,6})$/i,
    },
    {
      name: "global.ProductExternal.Airbnb.name",
      image: require("@selldone/components-vue/assets/trademark/airbnb-w.svg"),
      actionText:  "global.ProductExternal.Airbnb.actionText",
      color: "#FF5A5F",
      domainPattern: /^(.*\.)?airbnb\.[a-z\.]{2,6}$/i,
    },
  ];

  /**
   * Identifies the service corresponding to a given URL.
   *
   * @param {string} url - The URL to be checked.
   * @returns {ServiceData | null} The service data if the URL matches a known service, or null if no match is found.
   *
   * @example
   * const serviceData = ProductExternal.getServiceData('https://www.amazon.com/product');
   * if (serviceData) {
   *     console.log(`Service: ${serviceData.name}`);
   *     console.log(`Image URL: ${serviceData.image}`);
   *     console.log(`Action Text: ${serviceData.actionText}`);
   *     console.log(`Color: ${serviceData.color}`);
   * } else {
   *     console.log("No matching service found.");
   * }
   */
  public static getServiceData(url: string|null): ServiceData | null {
    if (!url) return null;
    try {
      const host = new URL(url).hostname;

      for (const service of this.SERVICES) {
        if (service.domainPattern.test(host)) {
          return service;
        }
      }
    } catch (e) {

    }

    return null; // No matching service found
  }
}
