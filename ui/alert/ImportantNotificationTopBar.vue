<template>
  <v-sheet
    v-if="message && show"
    :color="color"
    dark
    min-height="48"
    class="z1 pa-2 d-flex align-center justify-center"
  >
    <v-spacer></v-spacer>
    <div class="flex-grow-1 py-2 py-sm-0">
      <div v-html="message" class="typo-body mb-5 mb-sm-0"></div>

      <div
        class="small d-flex align-center justify-center mt-1 flex-column flex-sm-row"
      >
        <template v-if="end_date">
          <span
            >Ends in
            <v-icon>{{
              $vuetify.breakpoint.smAndUp ? "arrow_right" : "arrow_drop_down"
            }}</v-icon></span
          >
          <count-down :end="end_date" class="mx-2"></count-down>
        </template>

        <v-btn
          v-if="action_text"
          :href="action_url"
          class="ms-0 ms-sm-5 my-3 my-sm-0"
          outlined
          target="_blank"
        >
          <span v-html="action_text"></span>
          <v-icon class="ms-1">navigate_next</v-icon>
          <v-icon></v-icon>
        </v-btn>
      </div>
    </div>
    <v-spacer></v-spacer>
    <div>
      <time-lapse
        v-if="autoClose"
        @end="show = false"
        :duration-ms="120 * 1000"
        color="amber"
        width="3"
        size="20"
        class="mx-5"
      >
        <v-icon small @click="show = false">close</v-icon>
      </time-lapse>
    </div>
  </v-sheet>
</template>

<script>
import TimeLapse from "@/Components/ui/time-lapse/timeLapse.vue";
import CountDown from "@/Components/ui/count-down/CountDown.vue";
export default {
  name: "ImportantNotificationTopBar",
  components: { CountDown, TimeLapse },
  props: {
    notification: {},
    autoClose: { type: Boolean, default: false },
  },
  data: () => ({
    show: false,
  }),
  computed: {
    user() {
      return this.USER();
    },

    message() {
      return this.notification && this.notification.message;
    },
    color() {
      return this.notification && this.notification.color;
    },
    end_date() {
      return (
        this.notification &&
        this.notification.end_at &&
        this.convertToLocalTime(this.notification.end_at)
      );
    },
    action_text() {
      return this.notification && this.notification.action_text;
    },
    action_url() {
      return this.notification && this.notification.action_url;
    },
  },

  watch: {},
  created() {
    if (this.message) this.show = true;
  },

  methods: {},
};
</script>

<style scoped lang="scss"></style>
