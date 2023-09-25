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
    target,
    url,
    file_id,
    file,
    file_key = "photo",
    params = {},
    withCredentials = true,
    success = null,
    color = null
  ) {
    // console.log('Start uploading..',file)

    const config = {
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
