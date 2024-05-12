<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <div class="widget-box -large mb-5">
      <s-widget-header icon="html" title="Html form"></s-widget-header>
      <v-list-subheader></v-list-subheader>

      Send a <b>POST</b> request to the specified endpoint with a JSON payload
      containing a valid email address. The <code>email</code>,
      <code>phone</code>, and <code>data</code> fields are stored in a list. The
      <code>data</code> field can either be null or a JSON object with key-value
      pairs, used to store additional information such as address, user
      interest, or other custom inputs. Also you can set tags by sending
      <code>tags</code>, it should be an array of strings.

      <u-text-copy-box :value="post_endpoint" class="mt-3"></u-text-copy-box>

      <v-expansion-panels class="my-5">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div>
              <v-icon class="me-1">science</v-icon>
              Sample code
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <pre>

document.getElementById("form").addEventListener("submit", function(event) {
  event.preventDefault();

  var email = document.getElementById("email").value;

  fetch("{{ post_endpoint }}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: email })
  })
    .then(function(response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(function(data) {
      console.log("Success:", data);
      alert("Subscribed successfully");
    })
    .catch(function(error) {
      console.error("Error:", error);
      alert("Failed to subscribe");
    });
});

</pre
            >
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>
<script>
import UTextCopyBox from "../../ui/text/copy-box/UTextCopyBox.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";

export default {
  name: "BStreamEndpoint",
  components: {
    UTextCopyBox,
  },

  props: {
    shop: {
      require: true,
      type: Object,
    },
  },
  data() {
    return {
      page: 1,
      pageCount: 0,
      itemsPerPage: 10,
      totalItems: 0,

      search: "",
      sortDesc: true,
      sortBy: null,
      //-------------------
      busy_fetch: false,
      streams: [],
    };
  },
  computed: {
    web_agent() {
      return this.streams?.find((x) => x.agent === "web");
    },

    post_endpoint() {
      return (
        this.web_agent &&
        window.XAPI.POST_STREAM_USER_ADD(
          SetupService.GetApiSubdomain("xapi"),
          this.shop.id,
          this.web_agent.access_key,
        )
      );
    },
  },

  watch: {},

  mounted() {},
  created() {
    this.fetchStreams();
  },

  methods: {
    //――――――――――――――――――――――― Fetch Streams ―――――――――――――――――――――――

    fetchStreams() {
      this.busy_fetch = true;

      axios
        .get(window.API.GET_SHOP_STREAMS(this.shop.id), {
          params: {
            offset: 0,
            limit: 10,
            sortBy: null,
            sortDesc: null,

            search: null,
          },
        })
        .then(({ data }) => {
          this.streams = data.streams;
          this.totalItems = data.total;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },
  },
};
</script>
