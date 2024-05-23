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
  <div class="sitemap" dir="ltr">
    <h1>
      <span v-copy>{{ baseUrl }}/sitemap</span>
    </h1>
    <h2>Sitemap &mdash; {{ shop.title }}</h2>

    <nav class="sitemap-nav">
      <ul>
        <li id="home">
          <a :href="baseUrl" target="_blank">
            <i class="fas fa-home"></i> Home page
            <small>Shopping main page</small>
          </a>
          <ul>
            <li>
              <a class="multi" tooltip="/?dir=:name or id"
                ><i class="fas fa-search"></i> categories
                <small>Open product category</small></a
              >
              <ul>
                <li v-for="category in categories" :key="category.id">
                  <a :tooltip="`/?dir=${category.name}`" target="_blank">{{
                    category.title
                  }}</a>
                  <ul>
                    <li v-if="category.products">
                      <a
                        class="multi"
                        target="_blank"
                        tooltip="/product/:product id"
                      >
                        <img src="../../assets/icons/box-3d.svg" width="24" />
                        {{ category.products }}</a
                      >
                    </li>
                    <li v-if="category.categories">
                      <a
                        class="multi"
                        target="_blank"
                        tooltip="/?dir=:name or id"
                      >
                        <img src="../../assets/icons/boxes.svg" width="24" />

                        {{ category.categories }}</a
                      >
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li>
              <a class="multi" target="_blank" tooltip="/product/:id">
                <i class="fas fa-building"></i> Product View</a
              >
            </li>
            <li>
              <a target="_blank" tooltip="/blog"
                ><i class="fas fa-rss"></i> Blogs
                <small>Show blogs list.</small></a
              >
              <ul>
                <li>
                  <a class="multi" target="_blank" tooltip="/blog/:blog id">
                    <img src="../../assets/icons/article.svg" width="24" />
                    Article</a
                  >
                </li>
              </ul>
            </li>
            <li>
              <a class="multi" target="_blank" tooltip="/pages/:page name"
                ><i class="fas fa-rss"></i> Pages
                <small>Landing and custom pages.</small></a
              >
              <ul>
                <li v-for="page in pages" :key="page.id">
                  <a :tooltip="`/pages/${page.name}`" target="_blank">
                    <img src="../../assets/icons/compass.svg" width="24" />
                    {{ page.title }} <small>{{ page.name }}</small></a
                  >
                </li>
              </ul>
            </li>
            <li>
              <a target="_blank" tooltip="/about-us"
                ><i class="fas fa-info-circle"></i> About</a
              >
            </li>
            <li>
              <a target="_blank" tooltip="/contact-us"
                ><i class="fas fa-phone"></i> Contact</a
              >
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <nav class="bottom-nav">
      <ul>
        <li>
          <a target="_blank" tooltip="/login"
            ><img src="../../assets/icons/login.svg" width="24" /> Sign In</a
          >
        </li>
        <li>
          <a target="_blank" tooltip="/sitemap"
            ><img src="../../assets/icons/sitemap.svg" width="24" /> Site Map</a
          >
        </li>
        <li>
          <a target="_blank" tooltip="/faq"
            ><img src="../../assets/icons/faq.svg" width="24" /> FAQs</a
          >
        </li>
        <li>
          <a target="_blank" tooltip="/terms"
            ><img src="../../assets/icons/terms.svg" width="24" /> Terms &amp;
            Conditions</a
          >
        </li>
        <li>
          <a target="_blank" tooltip="/privacy"
            ><img src="../../assets/icons/shield.svg" width="24" /> Privacy
            Policy</a
          >
        </li>

        <li>
          <a target="_blank" tooltip="/user"
            ><img src="../../assets/icons/lock.svg" width="24" /> User
            sections</a
          >
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: "ShopSiteMap",
  props: {
    shop: {
      required: true,
      type: Object,
    },
    baseUrl: {},
  },

  data: () => ({
    categories: [],
    pages: [],
  }),

  methods: {
    fetchData() {
      axios
        .get(window.API.GET_MY_SHOP_CATEGORIES(this.shop.id), {
          params: {
            children: true,
            parent: true,
          },
        })
        .then(({ data }) => {
          this.categories = data.categories;
        });

      axios.get(window.API.GET_SHOP_PAGES(this.shop.id)).then(({ data }) => {
        this.pages = data.pages;
      });
    },
  },
  created() {
    this.fetchData();
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-weight: bold;
  font-size: 20px;
  margin: 0 0 5px 0;
}

h2 {
  font-family: "Lucida Grande", Verdana, sans-serif;
  font-size: 10px;
  color: #777;
  margin: 0 0 40px 0;
}

a {
  text-decoration: none;
}

ol,
ul {
  list-style: none;
}

/* ------------------------------------------------------------
    Sitemap Styles
  ------------------------------------------------------------ */

.sitemap {
  display: inline-block;
  min-width: 100%;
  padding: 40px;
}

li a,
li a.multi:after {
  position: relative;
  display: block;
  margin: 0;
  padding: 15px;
  font-size: 14px;
  font-weight: bold;
  line-height: 16px;
  white-space: normal;
  color: #333;
  background-color: white;
  border: 1px solid #f5f5f5;
  border-top: 4px solid #95a5a6;
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  z-index: 1;
}

li a {
  -webkit-box-shadow: 1px 1px 2px rgba(106, 113, 127, 0.2);
  -moz-box-shadow: 1px 1px 2px rgba(106, 113, 127, 0.2);
  box-shadow: 1px 1px 2px rgba(106, 113, 127, 0.2);
}

li a.multi:after {
  content: " ";
  position: absolute;
  left: 6px;
  top: 6px;
  width: 100%;
  height: 100%;
  border-width: 2px;
  border-color: #eee;
  border-top-width: 0 !important;
  border-left-width: 0 !important;
  background-color: transparent;
  -moz-border-radius: 6px;
  -webkit-border-radius: 6px;
  -moz-border-bottom-right-radius: 8px;
  -webkit-border-bottom-right-radius: 8px;
  z-index: -1;
}

li a:before {
  content: " " attr(href) attr(tooltip) " ";
  display: block;
  text-transform: uppercase;
  font-size: 8px;
  font-weight: bold;
  word-wrap: break-word;
  color: #95a5a6;
}

li a small {
  display: block;
  font-weight: normal;
  font-size: 12px;
  margin-top: 10px;
}

.sitemap .fa {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 16px;
  vertical-align: middle;
}

/* --- Root --- */
ul,
li {
  position: relative;
  display: inline-block;
}

.sitemap-nav ul li:before,
.sitemap-nav ul li:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  border-color: #ddd;
  border-width: 1px;
  z-index: 0;
}

.sitemap-nav ul li a {
  border-top-color: var(--theme-light);
  width: auto;
}

.sitemap-nav ul li a:before,
.sitemap-nav ul li .fa {
  color: var(--theme-light);
}

/* --- Level 1 --- */
.sitemap-nav ul ul {
  white-space: nowrap;
}

.sitemap-nav ul ul li {
  position: relative;
  vertical-align: top;
  padding-top: 20px;
  margin-right: 20px;
  white-space: normal;
  width: 100%;
}

.sitemap-nav ul ul li:last-child {
  padding-right: 0;
}

.sitemap-nav ul ul li:before {
  border-top-style: solid;
  width: 30px;
  top: 50px;
  margin: 0 0 0 -30px;
}

.sitemap-nav ul ul li:first-child:before {
  border-top-style: none;
  border-left-style: solid;
  width: 0;
  height: 30px;
  top: 0;
  left: 45px;
  margin: 0 0 0 -30px;
}

.sitemap-nav ul ul li a {
  border-top-color: #3498db;
  width: auto;
}

.sitemap-nav ul ul li a:before,
.sitemap-nav ul ul li .fa {
  color: #3498db;
}

/* --- Level 2 --- */
.sitemap-nav ul ul ul {
  display: block;
  white-space: normal;
}

.sitemap-nav ul ul ul li {
  display: block;
  position: relative;
  width: 100%;
  padding-left: 30px;
  margin-right: 0;
}

.sitemap-nav ul ul ul li:before,
.sitemap-nav ul ul ul li:first-child:before {
  border-top-style: none;
  border-left-style: solid;
  height: 100%;
  top: 0;
  left: 45px;
}

.sitemap-nav ul ul ul li:last-child:before {
  height: 50px;
}

.sitemap-nav ul ul ul li:after {
  border-top-style: solid;
  top: 50px;
  left: 15px;
  width: 15px;
}

.sitemap-nav ul ul ul li a {
  border-top-color: #00796b;
  width: auto;
}

.sitemap-nav ul ul ul li a:before,
.sitemap-nav ul ul ul li .fa {
  color: #00796b;
}

/* --- Level 3 --- */
.sitemap-nav ul ul ul ul li a {
  border-top-color: #ffa000;
}

.sitemap-nav ul ul ul ul li a:before,
.sitemap-nav ul ul ul ul li .fa {
  color: #ffa000;
}

/* --- Level 4 --- */
.sitemap-nav ul ul ul ul ul li a {
  border-top-color: #9b59b6;
}

.sitemap-nav ul ul ul ul ul li a:before,
.sitemap-nav ul ul ul ul ul li .fa {
  color: #9b59b6;
}

/* --- bottom-nav --- */
.bottom-nav {
  display: block;
  margin-top: 20px;
  padding-top: 20px;
  border-top: dotted 2px #eee;
}

.bottom-nav ul {
  white-space: nowrap;
}

.bottom-nav ul li {
  display: inline-block;
  white-space: normal;
  padding: 0 20px 0 0;
}

.bottom-nav ul li:before,
.bottom-nav ul li:after {
  display: none;
}

.bottom-nav ul li:last-child {
  padding: 0;
}

/* --- Widths --- */
.sitemap-nav > ul > li > a,
.sitemap-nav > ul > li > ul > li,
.bottom-nav li a {
  width: 220px;
}
</style>
