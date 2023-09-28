import axios, { AxiosRequestConfig } from "axios";
import type { IFileUploadResponse } from "../../../../core/types/upload/file-upload-response-type.type";

export class UploadHelper {
  /**
   *
   * @param vue
   * @param target              Use to show upload indicator on product, category,... cards!      Ex: {product:product_id}  {category:category_id}
   * @param url
   * @param file_id
   * @param file
   * @param file_key
   * @param params
   * @param withCredentials
   * @param success
   * @param color               Progress color
   * @constructor
   */
  static UploadFile(
    vue,
    target: Element,
    url: string,
    file_id: number,
    file: File,
    file_key = "photo",
    params: Record<string, any> = {},
    withCredentials = true,
    success:
      | ((data: { success: boolean; files: IFileUploadResponse }) => void)
      | null = null,
    color: string | null = null
  ) {
    // console.log('Start uploading..',file)

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

    const formData = new FormData();

    if (params)
      Object.keys(params).forEach((key) => {
        formData.append(key, params[key]);
      });

    formData.append(file_key, file, file.name);

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
        // Remove from global upload keeper:
        vue.$store.dispatch({
          type: "removeUploadingFile",
          file_id: file.name,
        });
      });
  }
}
