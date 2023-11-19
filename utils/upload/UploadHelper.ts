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

import axios, { AxiosRequestConfig } from "axios";
import type { IFileUploadResponse } from "@core/types/upload/file-upload-response-type.type";

export class UploadHelper {
  /**
   * Uploads a file to a specified URL.
   *
   * @param vue                The Vue instance, used for accessing the store and displaying alerts.
   * @param target             An HTML element representing the upload target. This is used to show upload indicators on entities like product, category, etc. cards.
   *                           Example: {product:product_id}  {category:category_id}
   * @param url                The endpoint URL where the file should be uploaded.
   * @param file_id            A unique identifier for the file being uploaded.
   * @param file               The actual File object to be uploaded.
   * @param file_key           The form data key for the file upload. Defaults to "photo".
   * @param params             Additional parameters to be sent along with the file in the form data.
   * @param withCredentials    Indicates whether the request should be made with credentials (like cookies or HTTP authentication). Defaults to true.
   * @param success            A callback function to be executed upon successful upload. It receives an object with a `success` boolean and an `files` array containing the uploaded file's details.
   * @param color              The color to be used for the upload progress indicator. If not provided, a default color will be used.
   */
  static UploadFile(
    vue: any,
    target: Element,
    url: string,
    file_id: number,
    file: File,
    file_key: string = "photo",
    params: Record<string, any> = {},
    withCredentials = true,
    success:
      | ((data: { success: boolean; files: IFileUploadResponse }) => void)
      | null = null,
    color: string | null = null
  ) {
    const config: AxiosRequestConfig = {
      withCredentials: withCredentials,
      onUploadProgress: (e) => {
        const pval = Math.floor((e.loaded / (e.total + 0.001)) * 100);
        //console.log("progress", e.loaded, e.total, pval + "%");

        // + Add to global upload keeper:
        vue.$store.dispatch({
          type: "addUploadingFile",
          file_id: file_id,
          name: file.name,
          progress: pval,
          color: color,
          target: target,
        });
      },
    };

    // Constructing the form data for the upload
    const formData = new FormData();

    if (params)
      Object.keys(params).forEach((key) => {
        formData.append(key, params[key]);
      });

    formData.append(file_key, file, file.name);

    // Making the actual upload request
    axios
      .post(url, formData, config)
      .then(({ data }) => {
        if (!data.error) {
          if (success) success(data);
        } else {
          vue.showErrorAlert(null, data.error_msg);
        }
      })
      .catch((e) => {
        vue.showLaravelError(e);
      })
      .finally(() => {
        // Remove the completed upload details from the global upload keeper in the store
        vue.$store.dispatch({
          type: "removeUploadingFile",
          file_id: file.name,
        });
      });
  }
}
