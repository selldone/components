<template>
  <main class="b-shop-sitemap sd-modern-canvas text-start">
    <div class="b-shop-sitemap__content">
      <header class="sd-modern-header b-shop-sitemap__header">
        <div class="sd-modern-title">
          <v-icon class="sd-modern-icon--plain" size="25" aria-hidden="true"
            >account_tree</v-icon
          >
          <div>
            <h1 class="sd-modern-title-text">
              {{ $t("sitemap_modern.title") }}
            </h1>
            <p class="sd-modern-subtitle">
              {{ $t("sitemap_modern.description") }}
            </p>
          </div>
        </div>
      </header>

      <section class="sd-modern-widget b-shop-sitemap__root">
        <div class="b-shop-sitemap__identity">
          <v-avatar size="46" rounded="lg" class="hover-scale-small">
            <v-img
              v-if="shop.icon || shop.logo"
              :src="getShopImagePath(shop.icon || shop.logo, 96)"
              :alt="plainTitle(shop.title)"
            />
            <v-icon v-else size="25" aria-hidden="true">storefront</v-icon>
          </v-avatar>
          <div class="b-shop-sitemap__identity-copy">
            <p class="sd-modern-eyebrow">{{ $t("sitemap_modern.root") }}</p>
            <h2>{{ plainTitle(shop.title) || shop.name }}</h2>
            <bdi v-if="rootUrl" dir="ltr" class="b-shop-sitemap__address">{{
              rootUrl
            }}</bdi>
            <p v-else class="sd-modern-muted">
              {{ $t("sitemap_modern.rootUnavailable") }}
            </p>
          </div>
          <v-btn
            v-if="rootUrl"
            :href="rootUrl"
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            class="sd-modern-button sd-modern-button--inline"
          >
            {{ $t("sitemap_modern.openStorefront")
            }}<v-icon size="16" end aria-hidden="true">north_east</v-icon>
          </v-btn>
        </div>
        <div v-if="sitemapUrl" class="b-shop-sitemap__xml">
          <div>
            <p class="sd-modern-eyebrow">{{ $t("sitemap_modern.sitemap") }}</p>
            <a
              :href="sitemapUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="b-shop-sitemap__xml-link"
              ><bdi dir="ltr">{{ sitemapUrl }}</bdi
              ><v-icon size="16" aria-hidden="true">north_east</v-icon></a
            >
          </div>
          <v-btn
            icon
            variant="text"
            class="sd-modern-icon-button"
            :aria-label="$t('sitemap_modern.copyUrl')"
            @click="copyToClipboard(sitemapUrl)"
          >
            <v-icon size="16" aria-hidden="true">content_copy</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              open-on-focus
              content-class="sd-modern-tooltip text-start"
              >{{ $t("sitemap_modern.copyUrl") }}</v-tooltip
            >
          </v-btn>
        </div>
      </section>

      <div class="b-shop-sitemap__collections">
        <section
          v-for="kind in ['categories', 'pages']"
          :key="kind"
          class="sd-modern-widget b-shop-sitemap__collection"
          :aria-busy="lists[kind].loading"
        >
          <header class="b-shop-sitemap__section-heading">
            <v-icon size="21" aria-hidden="true">{{
              kind === "categories" ? "category" : "layers"
            }}</v-icon>
            <div>
              <h2>{{ $t("sitemap_modern." + kind) }}</h2>
              <p class="sd-modern-subtitle">
                {{ $t("sitemap_modern." + kind + "Description") }}
              </p>
            </div>
            <span
              v-if="lists[kind].total !== null"
              class="sd-modern-status sd-modern-status--plain"
              >{{ lists[kind].total }}</span
            >
          </header>
          <p class="b-shop-sitemap__pattern" dir="ltr">
            {{ kind === "categories" ? "/?dir=:name" : "/pages/:name" }}
          </p>

          <ul v-if="lists[kind].items.length" class="b-shop-sitemap__resources">
            <li
              v-for="item in lists[kind].items"
              :key="item.id"
              class="b-shop-sitemap__resource-wrapper"
            >
              <component
                :is="resourceHref(kind, item) ? 'a' : 'div'"
                :href="resourceHref(kind, item) || undefined"
                :target="resourceHref(kind, item) ? '_blank' : undefined"
                :rel="
                  resourceHref(kind, item) ? 'noopener noreferrer' : undefined
                "
                class="b-shop-sitemap__resource"
                :class="{
                  'sd-modern-clickable-item': resourceHref(kind, item),
                }"
              >
                <u-avatar-folder
                  :src="kind === 'categories' ? item.icon : item.image"
                  :size="35"
                  :border-size="2"
                  :placeholder-icon="kind === 'categories' ? 'category' : 'web'"
                  is-gray
                  hide-side-icon
                  class="hover-scale-small b-shop-sitemap__thumbnail"
                />
                <div class="b-shop-sitemap__resource-copy">
                  <span class="b-shop-sitemap__resource-title"
                    ><bdi>{{
                      plainTitle(item.title) || item.name || item.id
                    }}</bdi></span
                  >
                  <bdi dir="ltr" class="b-shop-sitemap__route">{{
                    resourcePath(kind, item)
                  }}</bdi>
                  <span
                    v-if="kind === 'categories'"
                    class="b-shop-sitemap__counts"
                  >
                    <span
                      >{{ item.products || 0 }}
                      {{ $t("sitemap_modern.products") }}</span
                    >
                    <span
                      >{{ item.categories || 0 }}
                      {{ $t("sitemap_modern.subcategories") }}</span
                    >
                  </span>
                  <span
                    v-if="kind === 'categories' && item.parent"
                    class="b-shop-sitemap__parent"
                    ><bdi>{{ plainTitle(item.parent.title) }}</bdi></span
                  >
                </div>
                <span
                  v-if="kind === 'pages'"
                  class="sd-modern-status sd-modern-status--plain b-shop-sitemap__publication"
                  ><span
                    class="sd-modern-status__dot"
                    :class="
                      item.published
                        ? 'sd-modern-status__dot--success'
                        : 'sd-modern-status__dot--warning'
                    "
                    aria-hidden="true"
                  ></span
                  >{{
                    $t(
                      item.published
                        ? "sitemap_modern.pagePublished"
                        : "sitemap_modern.pageDraft",
                    )
                  }}</span
                >
                <v-icon
                  v-if="resourceHref(kind, item)"
                  size="16"
                  class="b-shop-sitemap__external"
                  aria-hidden="true"
                  >north_east</v-icon
                >
              </component>
            </li>
          </ul>
          <div
            v-if="lists[kind].error"
            class="sd-modern-notice b-shop-sitemap__state"
            role="alert"
          >
            <v-icon size="19" aria-hidden="true">error_outline</v-icon>
            <div class="sd-modern-notice__content">
              <p>{{ $t("sitemap_modern.loadError") }}</p>
              <v-btn
                variant="text"
                class="sd-modern-button sd-modern-button--inline"
                :disabled="lists[kind].loading"
                @click="loadList(kind)"
                >{{ $t("sitemap_modern.retry") }}</v-btn
              >
            </div>
          </div>
          <div
            v-else-if="lists[kind].loading && !lists[kind].items.length"
            class="b-shop-sitemap__state"
            role="status"
          >
            <v-progress-circular
              indeterminate
              :size="20"
              :width="2"
              aria-hidden="true"
            /><span>{{ $t("sitemap_modern.loading") }}</span>
          </div>
          <p
            v-else-if="!lists[kind].loading && !lists[kind].items.length"
            class="b-shop-sitemap__state sd-modern-muted"
          >
            {{
              $t(
                kind === "categories"
                  ? "sitemap_modern.emptyCategories"
                  : "sitemap_modern.emptyPages",
              )
            }}
          </p>
          <footer
            v-if="lists[kind].items.length"
            class="sd-modern-table-footer b-shop-sitemap__footer"
          >
            <span>{{
              $t("sitemap_modern.showing", {
                count: lists[kind].items.length,
                total: lists[kind].total ?? lists[kind].items.length,
              })
            }}</span>
            <span
              v-if="lists[kind].total > lists[kind].items.length"
              class="sd-modern-muted"
              >{{
                $t("sitemap_modern.moreItems", {
                  count: lists[kind].total - lists[kind].items.length,
                })
              }}</span
            >
          </footer>
        </section>
      </div>

      <div class="b-shop-sitemap__route-heading">
        <h2>{{ $t("sitemap_modern.routePattern") }}</h2>
        <p class="sd-modern-subtitle">
          {{ $t("sitemap_modern.routePatternHelp") }}
        </p>
      </div>
      <div class="b-shop-sitemap__route-groups">
        <section
          v-for="group in routeGroups"
          :key="group.key"
          class="sd-modern-widget b-shop-sitemap__routes"
        >
          <header class="b-shop-sitemap__section-heading">
            <v-icon size="21" aria-hidden="true">{{ group.icon }}</v-icon>
            <div>
              <h2>{{ $t("sitemap_modern." + group.key) }}</h2>
              <p v-if="group.description" class="sd-modern-subtitle">
                {{ $t("sitemap_modern." + group.description) }}
              </p>
            </div>
          </header>
          <ul class="b-shop-sitemap__route-list">
            <li
              v-for="route in group.routes"
              :key="route.path"
              class="b-shop-sitemap__resource-wrapper"
            >
              <component
                :is="!route.pattern && rootUrl ? 'a' : 'div'"
                :href="!route.pattern ? routeUrl(route.path) : undefined"
                :target="!route.pattern && rootUrl ? '_blank' : undefined"
                :rel="
                  !route.pattern && rootUrl ? 'noopener noreferrer' : undefined
                "
                class="b-shop-sitemap__route-row"
                :class="{
                  'sd-modern-clickable-item': !route.pattern && rootUrl,
                }"
              >
                <v-icon size="18" aria-hidden="true">{{ route.icon }}</v-icon>
                <div>
                  <span>{{ $t("sitemap_modern." + route.label) }}</span
                  ><bdi dir="ltr" class="b-shop-sitemap__route">{{
                    route.path
                  }}</bdi>
                </div>
                <v-icon
                  v-if="!route.pattern && rootUrl"
                  size="16"
                  aria-hidden="true"
                  >north_east</v-icon
                >
              </component>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { StripTags } from "@selldone/core-js/helper/html/HtmlHelper";
import UAvatarFolder from "../../ui/avatar/folder/UAvatarFolder.vue";

const emptyList = () => ({
  items: [],
  total: null,
  loading: false,
  error: false,
});

export default {
  name: "ShopSiteMapModern",
  components: { UAvatarFolder },
  props: { shop: { required: true, type: Object }, baseUrl: {} },
  data: () => ({
    lists: { categories: emptyList(), pages: emptyList() },
    disposed: false,
  }),
  computed: {
    rootUrl() {
      try {
        const url = new URL(this.baseUrl);
        if (
          !["http:", "https:"].includes(url.protocol) ||
          url.username ||
          url.password
        )
          return "";
        url.search = "";
        url.hash = "";
        return url.href.replace(/\/$/, "");
      } catch {
        return "";
      }
    },
    sitemapUrl() {
      return this.routeUrl("/sitemap");
    },
    routeGroups() {
      return [
        {
          key: "storefront",
          icon: "storefront",
          routes: [
            { label: "root", path: "/", icon: "home" },
            {
              label: "products",
              path: "/product/:id",
              icon: "inventory_2",
              pattern: true,
            },
            { label: "about", path: "/about-us", icon: "info_outline" },
            { label: "contact", path: "/contact-us", icon: "contact_support" },
          ],
        },
        {
          key: "blog",
          icon: "feed",
          description: "blogDescription",
          routes: [
            { label: "blog", path: "/blog", icon: "view_list" },
            {
              label: "article",
              path: "/blog/:id",
              icon: "article",
              pattern: true,
            },
            {
              label: "article",
              path: "/blog/:slug-:id",
              icon: "article",
              pattern: true,
            },
          ],
        },
        {
          key: "utility",
          icon: "widgets",
          description: "utilityDescription",
          routes: [
            { label: "signIn", path: "/login", icon: "login" },
            { label: "sitemap", path: "/sitemap", icon: "account_tree" },
            { label: "faq", path: "/faq", icon: "quiz" },
            { label: "terms", path: "/terms", icon: "description" },
            { label: "privacy", path: "/privacy", icon: "policy" },
            { label: "account", path: "/user", icon: "person_outline" },
          ],
        },
        {
          key: "channels",
          icon: "mediation",
          description: "channelsDescription",
          routes: [
            { label: "avocado", path: "/avocado", icon: "request_quote" },
            { label: "hyper", path: "/hyper", icon: "bolt" },
            { label: "community", path: "/community", icon: "forum" },
            { label: "listing", path: "/listing", icon: "view_quilt" },
          ],
        },
      ];
    },
  },
  watch: {
    "shop.id"() {
      this.fetchData();
    },
  },
  created() {
    this.fetchData();
  },
  beforeUnmount() {
    this.disposed = true;
  },
  methods: {
    plainTitle(value) {
      return StripTags(value) || "";
    },
    routeUrl(path) {
      return this.rootUrl ? this.rootUrl + path : "";
    },
    resourcePath(kind, item) {
      return kind === "categories"
        ? "/?dir=" + encodeURIComponent(item.name || item.id)
        : "/pages/" + encodeURIComponent(item.name || "");
    },
    resourceHref(kind, item) {
      if (kind === "pages" && (!item.published || !item.name)) return "";
      return this.routeUrl(this.resourcePath(kind, item));
    },
    fetchData() {
      this.lists = { categories: emptyList(), pages: emptyList() };
      if (!this.shop?.id || this.disposed) return;
      this.loadList("categories");
      this.loadList("pages");
    },
    async loadList(kind) {
      const list = this.lists[kind],
        shopId = this.shop?.id;
      if (!list || list.loading || !shopId || this.disposed) return;
      list.loading = true;
      list.error = false;
      const current = () =>
        !this.disposed && this.shop?.id === shopId && this.lists[kind] === list;
      try {
        const { data } = await axios.get(
          kind === "categories"
            ? window.API.GET_MY_SHOP_CATEGORIES(shopId)
            : window.API.GET_SHOP_PAGES(shopId),
          {
            params: {
              offset: 0,
              limit: 5,
              ...(kind === "categories"
                ? { children: true, parent: true }
                : {}),
            },
          },
        );
        if (!current()) return;
        if (data.error || data.success === false || !Array.isArray(data[kind]))
          throw new Error("Sitemap list unavailable");
        const items = data[kind].slice(0, 5).map((item) =>
          kind === "categories"
            ? {
                id: item.id,
                name: item.name,
                title: item.title,
                icon: item.icon,
                products: item.products,
                categories: item.categories,
                parent: item.parent ? { title: item.parent.title } : null,
              }
            : {
                id: item.id,
                name: item.name,
                title: item.title,
                image: item.image,
                published: item.published,
              },
        );
        list.items = items;
        list.total =
          Number.isFinite(data.total) && data.total >= list.items.length
            ? data.total
            : list.items.length;
      } catch {
        if (current()) list.error = true;
      } finally {
        if (current()) list.loading = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.b-shop-sitemap {
  min-height: 100%;
  padding: 30px 28px 40px;
  font-size: var(--sd-modern-font-body, 14px);
  line-height: 1.6;
  &__content {
    width: 100%;
    max-width: 1040px;
    margin-inline: auto;
  }
  &__header {
    margin-bottom: 23px;
  }
  &__header h1 {
    font-size: 22px;
    font-weight: 500;
    line-height: 35px;
  }
  h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;
  }
  p {
    margin: 0;
  }
  .sd-modern-widget {
    padding: 23px;
    border-radius: 17px;
    min-width: 0;
  }
  .sd-modern-subtitle {
    margin-top: 4px;
    font-size: var(--sd-modern-font-small, 13px);
    line-height: 21px;
  }
  &__identity {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  &__identity-copy {
    flex: 1;
    min-width: 0;
  }
  &__address {
    display: block;
    overflow-wrap: anywhere;
    font-size: 14px;
  }
  &__root {
    margin-bottom: 20px;
  }
  &__xml {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid var(--sd-modern-border);
  }
  &__xml > div {
    min-width: 0;
  }
  &__xml-link {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    max-width: 100%;
    font-size: 13px;
    color: inherit;
    text-decoration: none;
  }
  &__xml-link bdi {
    overflow-wrap: anywhere;
    min-width: 0;
  }
  &__collections {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    align-items: stretch;
  }
  &__collection {
    display: flex;
    flex-direction: column;
  }
  &__section-heading {
    display: flex;
    align-items: flex-start;
    gap: 11px;
  }
  &__section-heading > .v-icon {
    margin-top: 2px;
    color: var(--sd-modern-muted);
    flex-shrink: 0;
  }
  &__section-heading > div {
    min-width: 0;
    flex: 1;
  }
  &__pattern {
    margin-top: 16px !important;
    font-size: 13px;
    color: var(--sd-modern-muted);
  }
  &__resources,
  &__route-list {
    list-style: none;
    padding: 0;
    margin: 12px 0 0;
  }
  &__resources {
    margin-bottom: 14px;
  }
  &__resource-wrapper + &__resource-wrapper {
    border-top: 1px solid var(--sd-modern-border);
  }
  &__resource {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 76px;
    padding: 12px;
    color: inherit;
    text-decoration: none;
    border-radius: 10px;
  }
  &__resource-copy {
    min-width: 0;
    flex: 1;
  }
  &__resource-title {
    display: block;
    font-size: 14px;
    overflow-wrap: anywhere;
  }
  &__route {
    display: block;
    margin-top: 2px;
    font-size: 13px;
    color: var(--sd-modern-muted);
    overflow-wrap: anywhere;
  }
  &__counts {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    font-size: 13px;
    color: var(--sd-modern-muted);
  }
  &__parent {
    display: block;
    font-size: 13px;
    color: var(--sd-modern-muted);
  }
  &__publication {
    font-size: 13px;
    flex-shrink: 0;
  }
  &__external {
    flex-shrink: 0;
  }
  &__state {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-top: 18px;
    padding: 14px 0;
    font-size: 13px;
  }
  &__state .sd-modern-button {
    margin-top: 6px;
  }
  &__footer {
    margin-top: auto;
    padding-top: 12px;
    min-height: 48px;
    font-size: 13px;
  }
  &__route-heading {
    margin: 30px 0 17px;
  }
  &__route-groups {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    align-items: stretch;
  }
  &__route-row {
    display: flex;
    gap: 12px;
    align-items: center;
    min-height: 58px;
    padding: 10px 12px;
    color: inherit;
    text-decoration: none;
    border-radius: 10px;
  }
  &__route-row > div {
    flex: 1;
    min-width: 0;
    font-size: 14px;
  }
  &__route-row > .v-icon {
    flex-shrink: 0;
  }
  @media (max-width: 700px) {
    padding: 24px 16px 30px;
    &__collections,
    &__route-groups {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
    }
    .sd-modern-widget {
      padding: 18px;
    }
    &__identity {
      flex-wrap: wrap;
      gap: 12px;
    }
    &__identity > .sd-modern-button {
      margin-inline-start: 58px;
    }
    &__resource {
      flex-wrap: wrap;
      gap: 9px;
      padding: 12px;
    }
    &__resource-copy {
      flex-basis: calc(100% - 80px);
    }
    &__publication {
      margin-inline-start: 44px;
    }
    &__resource .b-shop-sitemap__external {
      margin-inline-start: auto;
    }
  }
}
</style>
