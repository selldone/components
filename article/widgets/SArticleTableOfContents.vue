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

<template>
  <div>
    <v-expand-transition>
      <div v-if="has_list" v-intersect="onIntersect" class="s--table-content">
        <h2>{{ $t("global.commons.table_of_contents") }}</h2>
        <ul>
          <li
            v-for="item in items"
            :key="item.id"
            :class="{ '-small': item.tag === 'h3' }"
            @click="goTo(item)"
          >
            {{ item.title }}
          </li>
        </ul>
      </div>
    </v-expand-transition>

    <v-expand-transition>
      <div
        v-if="has_list && !isIntersecting && isElementInView"
        class="s--stick-table-content"
      >
        <div class="--content">
          <span
            v-for="item in items"
            :key="item.id"
            :class="{ '-small': item.tag === 'h3' }"
            class="--item"
            @click="goTo(item)"
          >
            <v-icon
              v-if="item.tag === 'h2'"
              class="me-1"
              color="#111"
              size="x-small"
              >circle</v-icon
            >
            {{ item.title }}
          </span>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import _ from "lodash-es";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper";

export default {
  name: "SArticleTableOfContents",
  props: {
    target: { require: true },
    html: {},
  },
  data: () => ({
    items: [],
    isIntersecting: true,
    isElementInView: false, // Variable to track whether the target element is in view
  }),

  computed: {
    has_list() {
      return this.items?.length >= 3;
    },
  },

  watch: {
    html: _.throttle(function (newVal, oldVal) {
      this.gen();
    }, 1000),
  },

  mounted() {
    /* setTimeout(() => {
      this.gen();
    }, 3000);*/

    // Create an Intersection Observer to watch the target element
    this.observer = new IntersectionObserver((entries) => {
      // If the target element is intersecting the viewport, set isElementInView to true
      if (entries[0].isIntersecting) {
        this.isElementInView = true;
        this.gen();
      } else {
        this.isElementInView = false;
      }
    });

    // Start observing the target element
    this.observer.observe(this.target);
  },
  beforeUnmount() {
    // Disconnect the observer when the component is destroyed
    if (this.observer) {
      this.observer.disconnect();
    }
  },

  methods: {
    gen() {
      this.items = [];
      this.findElements("h2");
      this.findElements("h3");

      this.items.sort(function (a, b) {
        return a.offset - b.offset;
      });

      console.log("📒 Generate table of contents...");
    },
    findElements(tag) {
      /*
      var $div = $(this.target);
      $div.filter("h2,h3").each(function(){
        console.log("===el====",this)
        this.items.push({ id: name, title: this.innerText,tag:this.localName });
      });
*/

      // Get the h3 tags - ToC entries
      const headers = this.target.getElementsByTagName(tag);

      //console.log("this.target"+tag, this.target, "headers", headers);
      // For each h3
      for (let i = 0; i < headers.length; i++) {
        //console.log("headers[i]--->", headers[i]);

        const text = headers[i].innerText;
        if (!text || text.length < 5) continue;

        // Create an id
        const name = "h_" + tag + i;
        headers[i].id = name;
        // console.log("headers[i]", headers[i]);

        this.items.push({
          id: name,
          title: text,
          tag: tag,
          offset: headers[i].offsetTop,
        });
      }
    },

    onIntersect(isIntersecting, entries, observer) {
      // More information about these options
      // is located here: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
      this.isIntersecting = isIntersecting;
    },

    goTo(item) {
      const currentScrollY =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop;
      const diff = Math.abs(item.offset - currentScrollY);

      ScrollHelper.scrollToElement(
        `#${item.id}`,
        120 /*to safe full view on top fix header!*/,
        "smooth",
      );

      /*
      this.$vuetify.goTo(`#${item.id}`, {
        duration: diff,
        offset: 120 ,
      });*/
    },
  },
};
</script>

<style lang="scss" scoped>
.s--table-content {
  text-align: start;

  h2 {
    font-size: 80%;
  }

  ul {
    margin-top: 12px;
    margin-bottom: 16px;

    li {
      font-size: 90%;
      cursor: pointer;
      transition: all 0.3s;

      font-weight: 600;
      color: #104d79;

      &.-small {
        font-weight: 500;

        font-size: 80%;
        color: #155d92;
      }

      &:hover {
        font-weight: 700;
        color: #0f75ac !important;

        &:before {
          z-index: 1;
          background: linear-gradient(to right bottom, #6cb9cd, #1c6eaa);
          opacity: 1;
        }
      }

      &:before {
        transition: all 0.35s;
        content: " ";
        counter-increment: li;
        display: inline-block;
        left: 0;
        top: 2px;
        margin-top: 0.1em;
       opacity: 0;

        background: linear-gradient(to right bottom, #5ea5b7, #104d79);

        height: 18px;
        width: 18px;
        line-height: 1.6em;
        border: 2px solid #fff;
        text-align: center;
        font-weight: bold;
        border-radius: 2em;
        color: #fff;
      }
    }
  }
}

.s--stick-table-content {
  position: fixed;
  z-index: 1;
  top: 120px;
  left: calc((max(50vw, 760px) - 408px) - 320px);
  width: 240px;
  background: #fff;

  //box-shadow: 0px 10px 50px 5px rgba(113, 112, 112, 0.24);
  border: solid thin #ddd;
  border-radius: 12px;
  text-align: start;

  @media all and (max-width: 1400px) {
    display: none;
  }

  .--content {
    padding: 12px;
    max-height: calc(100vh - 180px);
    overflow-y: auto;
  }

  .--item {
    display: block;
    padding: 4px 0;
    color: #111;
    cursor: pointer;
    font-size: 14px;

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 100%;

    &:hover {
      font-weight: 700;
      color: #0f75ac;
    }

    &.-small {
      font-size: 12px;
      padding: 4px;
    }
  }
}
</style>
