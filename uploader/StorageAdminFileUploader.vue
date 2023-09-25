<template>
  <div class="uploader-container-file mx-auto p-2">

    <file-pond
      ref="pond"
      class="mx-auto pointer-pointer"
      name="file"
      style="min-height: 84px"
      :label-idle="`<p class='text-dark'>${label}</p>`"
      :allow-multiple="true"
      :server="server_credential"
      :files="file"
      :data-max-file-size="maxFileSize"
      :maxFileSize="maxFileSize"
      :max-files="20"
      :check-validity="true"
      @processfile="handleProcessFile"
      @error="handleFilePondError"
      credits="false"
    />

    <p class="small file-size-limit mx-2">
      {{ $t("global.image_uploader.max_size", { size: maxFileSize }) }}
    </p>
  </div>
</template>

<script>
export default {
  name: "StorageAdminFileUploader",
  props: {
    label: {
      required: false,
      type: String
    },
    server: {
      required: false,
      type: String
    },

    maxFileSize: {
      required: false,
      type: String,
      default: "2MB"
    },

  },

  data: () => ({
    file: null
  }),
  computed:{
    server_credential(){

      const token = document.head.querySelector('meta[name="csrf-token"]');

      return {
        url: this.server,
        process: {
          method: 'POST',
          withCredentials: true,

          headers: {
            'X-CSRF-TOKEN': token?token.content:''
          },

        },



      }
    }
  },

  created() {},

  methods: {
    handleFilePondError(error){
      this.showErrorAlert(null,error.body)
    //  console.error('handleFilePondError',error)
    },
    handleProcessFile: function(error, file) {
      if (!error) {
      //  let response = JSON.parse(file.serverId);
      //  console.log("done", response);
        this.$emit("completed", true);
      /*  this.$emit("new-path", response.files.path);
        this.$emit("update:ar", response.ar);
*/


        return true;
      }else{

      }
    }
  }
};
</script>

<style lang="scss">
.uploader-container-file{
  .filepond--drop-label {
    p{
      margin: 0 !important;
      font-weight: 700;

      color: #777 !important;
    }
  }

}

</style>
