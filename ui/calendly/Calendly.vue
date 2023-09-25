<template>
  <div>
    <div
      ref="calendly"
      :style="{ minWidth: '320px', height: height }"
      class="calendly-inline-widget"
      data-auto-load="false"
    />

    <progress-loading v-if="busy"></progress-loading>
  </div>
</template>

<script>
export default {
  name: "Calendly",
  props: {
    dataUrl: {
      required: true,
    },
    height: {
      default: "640px",
    },
  },
  data: () => ({
    script: null,

    busy: false,
  }),

  computed: {
    user() {
      return this.USER();
    },
  },
  mounted() {
    this.loadPaypalJs();
  },
  beforeDestroy() {
    $("html")
      .find("script")
      .filter(function () {
        return (
          $(this).attr("src") ===
          "https://assets.calendly.com/assets/external/widget.js"
        );
      })
      .remove();
  },
  methods: {
    loadPaypalJs() {
      let t = this;
      this.busy = true;

      try {
        let test = Calendly; // Check if previously loaded:
        this.busy = false;
        console.style(`✔ ❰ Calendly ❱  Script exist`);
        this.init();
      } catch (e) {
        // Load dynamically:
        $.cachedScript("https://assets.calendly.com/assets/external/widget.js")
          .done(function (script, textStatus) {
            console.style(
              `🔔 ❰ Calendly ❱  Load script file start... ▶ status: ${textStatus}`
            );
            t.busy = false;

            console.style(`🔔 ❰ Calendly ❱  Load script file end`);
            t.init();
          })
          .fail(function (jqxhr, settings, exception) {
            console.errorStyle(
              `⚠ ❰ Calendly ❱  Failed to load script file: `,
              exception
            );
            t.showErrorAlert(null, "Can not load script!");
          });
      }
    },

    init() {
      Calendly.initInlineWidget({
        url: this.dataUrl,
        parentElement: this.$refs.calendly,
        prefill: this.user
          ? {
              name: this.user.name,
              email: this.user.email,
            }
          : {},
        utm: {},
      });
    },
  },
};
</script>

<style scoped></style>
