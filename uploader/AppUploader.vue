<template>
  <div class="uploader-container mx-auto p-2">
    <p class="m-0 font-weight-bold">
      {{ label }}
    </p>
    <file-pond
      ref="pond"
      class="mx-auto pointer-pointer"
      name="app"
      style="min-height: 84px"
      :label-idle="`<p class='text-dark'>Select file</p>`"
      allow-multiple="false"
      :server="server"
      :files="file"
      :maxFileSize="maxFileSize"
      :max-files="1"
      :check-validity="true"
      @processfile="handleProcessFile"
      credits="false"
    />
  </div>
</template>

<script>
export default {
  name: "AppUploader",
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
    }
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
        }
      }
    }
  },

  created() {},

  methods: {
    handleProcessFile: function(error, file) {
      if (!error) {
        let response = JSON.parse(file.serverId);
        console.log("done", response.files.path);
        this.$emit("new-path", response.files.path);
        this.$emit("created", response.files.app_file);

        return true;
      }
    }
  }
};
</script>

<style lang="scss">

</style>
