<template>
  <v-col
    cols="12"
    class="c-container -force-rounded position-relative border-top-thick -amber"
  >
    <div class="bg-white z2 c-widget p-3">
      <h2 class="text-uppercase">Subscribe to continue</h2>
      <p>
        Do you want to access the contents of this topic? So buy this membership
        right now.
      </p>

      <div class="d-flex border-between text-center my-2">
        <div class="w-50 p-1">
          <span class="d-block">Duration</span>
          <span class="d-block display-1"
            ><span class="small">{{ $t(subscription.name) }}</span></span
          >
        </div>
        <div class="w-50 p-1">
          <span class="d-block">Price</span>
          <price-view
            x-large
            :amount="topic.price"
            :currency="topic.currency"
          ></price-view>
        </div>
        <div v-if="trial" class="w-50 p-1">
          <span class="d-block">Trial</span>

          <span class="d-block display-1"
            >{{ trial.days }} <span class="small">days</span></span
          >
        </div>
      </div>
      <!-- Subscriber statistics -->
      <div v-if="access.admin" class="d-flex text-center my-2">
        <div class="w-50">
          <span class="d-block">Subscribers</span>
          <span class="d-block display-1"
          >{{ topic.total_subscribers }} </span
          >
        </div>
        <div class="w-50">
          <span class="d-block">Total sells</span>
          <span class="d-block display-1"
          >{{ topic.total_sells }} </span
          >
        </div>
      </div>

      <div class="d-flex justify-end">
        <v-btn
          x-large
          depressed
          color="success"
          @click="subscribe()"
          class="m-2"
          >Subscribe now just for
          <price-view
            class="ms-2"
            :amount="topic.price"
            :currency="topic.currency"
          ></price-view
        ></v-btn>
      </div>
    </div>
  </v-col>
</template>

<script>
import { TopicTrialType } from "../../../../../core/enums/community/TopicTrialType";
import { TopicSubscriptionType } from "../../../../../core/enums/community/TopicSubscriptionType";

export default {
  name: "CommunityTopicSubscribe",
  components: {},
  props: {
    community: {
      required: true,
      type: Object,
    },
    topic: {
      required: true,
      type: Object,
    },

  },

  data() {
    return {};
  },

  computed: {
    access(){
      return this.community.access
    },

    trial() {
      if (!this.topic.trial) return null;
      return TopicTrialType[this.topic.trial];
    },
    subscription() {
      return TopicSubscriptionType[this.topic.subscription];
    },
  },

  methods: {
    //――――――――――――――――――――――― Subscribe ―――――――――――――――――――――――
    subscribe() {
      if (!this.USER()) {
        this.NeedLogin();
        return;
      }
    },
  },
};
</script>

<style scoped lang="scss"></style>
