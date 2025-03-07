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

// @ts-nocheck
import { UploadHelper } from "@selldone/components-vue/utils/upload/UploadHelper.ts";

export class FileFormatConverterOnline {
  static VendorConvertToCsv(vue, vendor_id, file, success) {
    const url = window.VAPI.POST_MY_VENDOR_CONVERTER_EXCEL_CSV(vendor_id);

    UploadHelper.UploadFile(
      vue,
      null,
      url,
      file.name,
      file,
      "file",
      null,
      true,
      (data) => {
        //console.log("success", data);

        if (success) {
          success(data);
        }
      },
      "amber"
    );
  }

  static ConvertToCsv(vue, shop_id, file, success) {
    const url = window.API.POST_CONVERTER_EXCEL_CSV(shop_id);

    UploadHelper.UploadFile(
      vue,
      null,
      url,
      file.name,
      file,
      "file",
      null,
      true,
      (data) => {
        //console.log("success", data);

        if (success) {
          success(data);
        }
      },
      "amber"
    );
  }

  static ConvertWordToHtml(vue, url, file, success) {
    UploadHelper.UploadFile(
      vue,
      null,
      url,
      file.name,
      file,
      "file",
      null,
      true,
      (data) => {
        //console.log("success", data);

        if (success) {
          success(data);
        }
      },
      "amber"
    );
  }
}
