<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <v-bottom-navigation
    v-if="shop"
    :class="{
      '-hide': (!showNavbar && !search_mode) || force_hide_navigation,
      '-top': search_mode,
    }"
    :color="ThemeColorDark"
    :height="76"
    :model-value="tab"
    background-color="#fafafa"
    class="s--storefront-bottom-navigation shadow-small"
    grow
    style="z-index: 9999999; box-shadow: none"
  >
    <template v-if="!search_mode">
      <!-- ------------------ Home ------------------ -->

      <v-btn
        :to="
          last_home_route
            ? last_home_route
            : in_product || in_category
              ? {
                  name: 'ShopPage',
                }
              : {
                  name: channel_entry
                    ? in_channel_entry_page
                      ? 'ShopPage'
                      : channel_entry_page_name
                    : getCustomHomePage()
                      ? !in_custom_home_page
                        ? getCustomHomePage()
                        : 'ShopPage'
                      : 'ShopPage',
                }
        "
        class="zoomIn"
        exact
        min-width="60"
        value="home"
        @click="
          last_home_route = null;
          last_product = null;
          last_cat = null;
        "
        aria-label="Home"
      >
        <v-avatar v-if="last_product" color="#eee" size="24">
          <img :src="getProductImage(last_product, 64)" alt="Product" />
        </v-avatar>
        <v-icon v-else-if="last_cat" size="24"> folder</v-icon>
        <v-icon v-else-if="last_home_route" size="24">store</v-icon>

        <v-icon v-else-if="channel_entry" size="24"
          >{{ in_channel_entry_page ? "apps" : channel_entry_page_icon }}
        </v-icon>

        <v-icon v-else size="24"
          >{{
            in_custom_home_page || in_product || in_category ? "apps" : "home"
          }}
        </v-icon>
      </v-btn>

      <!-- ------------------ Search ------------------ -->

      <v-btn
        key="ser"
        class="zoomIn delay_100"
        min-width="60"
        value="search"
        @click="search_mode = true"
        aria-label="Search"
      >
        <v-icon size="24">search</v-icon>
      </v-btn>

      <!-- ------------------ Basket ------------------ -->

      <v-btn
        :to="{
          name: window.$storefront.routes.BASKET_PAGE,
          params: { type: current_product_type_in_basket },
        }"
        class="zoomIn delay_200"
        min-width="60"
        value="basket"
        aria-label="Basket"
      >
        <v-badge
          :content="numeralFormat(total_items_in_carts, '0a')"
          :model-value="total_items_in_carts > 0"
          color="teal"
          floating
        >
          <img
            v-if="total_items_in_carts > 0"
            height="24"
            src="../../../assets/icons/pos-basket.png"
            width="24"
            alt="Basket"
          />
          <v-icon v-else>local_mall</v-icon>
        </v-badge>
      </v-btn>

      <!-- ------------------ Notification ------------------ -->

      <v-btn
        :to="
          USER()
            ? {
                name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL,
              }
            : undefined
        "
        class="zoomIn delay_300"
        floating
        min-width="60"
        value="notification"
        @click="USER() ? null : NeedLogin()"
        aria-label="Notifications"
      >
        <v-badge
          :content="numeralFormat(sum_orders_badges, '0a')"
          :model-value="sum_orders_badges > 0"
          color="red"
          floating
        >
          <v-icon size="24">notifications</v-icon>
        </v-badge>
      </v-btn>

      <!-- ------------------ Profile ------------------ -->

      <v-btn
        class="zoomIn delay_400"
        min-width="60"
        v-bind="
          USER()
            ? { to: { name: window.$storefront.routes.USER_PROFILE_PAGE } }
            : undefined
        "
        value="profile"
        @click="USER() ? null : NeedLogin()"
        aria-label="Profile"
      >
        <v-badge
          v-if="USER_ID()"
          :model-value="!!getClub()"
          color="transparent"
          floating
        >
          <v-avatar color="#eee" size="24">
            <v-img :src="getUserAvatar(USER_ID())" alt="User"></v-img>
          </v-avatar>

          <template v-slot:badge>
            <img
              v-if="getClub()"
              :src="getCustomerClubLevel(getClub().level).icon"
              height="18"
              style="min-width: 18px; min-height: 18px"
              width="18"
              :alt="getClub().level"
            />
          </template>
        </v-badge>

        <v-icon v-else size="24">account_circle</v-icon>
      </v-btn>
    </template>

    <!-- ------------------ Search Box ------------------ -->

    <template v-if="search_mode">
      <v-btn
        class="zoomIn delay_300 flex-grow-0"
        icon
        min-width="60"
        variant="text"
        width="70"
        @click="$refs.search.showQRScanner()"
        aria-label="Scan QR"
      >
        <v-icon size="24">qr_code_scanner</v-icon>
      </v-btn>

      <s-storefront-search-box
        ref="search"
        :title="$t('layout_shop.search_title', { shop_name: shop.title })"
        background-color="transparent"
        block
        class="full-width align-center d-flex flex-grow-1 fadeIn"
        color="transparent"
        expand-input
        flat
        no-qr
        variant="solo"
        @onClear="onClear"
        @onSearch="onSearch"
      />

      <v-btn
        key="ser"
        class="zoomIn flex-grow-0"
        icon
        min-width="60"
        variant="text"
        width="70"
        @click="search_mode = false"
        aria-label="Close"
      >
        <v-icon size="24">close</v-icon>
      </v-btn>
    </template>
  </v-bottom-navigation>
</template>

<script lang="ts">
import SStorefrontSearchBox from "../../../storefront/search/SStorefrontSearchBox.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import AuthMixin from "@selldone/components-vue/mixin/auth/AuthMixin.ts";
import ClubMixin from "@selldone/components-vue/mixin/club/ClubMixin.ts";
import { debounce } from "lodash-es";

export default {
  name: "SFooterNavigation",
  mixins: [TemplateMixin, AuthMixin, ClubMixin],

  components: { SStorefrontSearchBox },

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Data
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  data: () => ({
    last_home_route: null,
    last_cat: null,
    last_product: null,

    showNavbar: true,
    lastScrollPosition: 0,
    sum: 0,

    search_mode: false,
  }),

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Compute Section
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  computed: {
    /*
     * Force hide navigation when map dialog opened.
     */
    force_hide_navigation() {
      return this.$store.getters.getForceHideNavigation;
    },

    shop() {
      return this.getShop();
    },

    tab() {
      if (this.$route.name === window.$storefront.routes.SHOP_PAGE)
        return "home";
      else if (
        this.$route.name === window.$storefront.routes.USER_FAVORITES_PAGE
      )
        return "favorite";
      else if (this.$route.name === window.$storefront.routes.BASKET_PAGE)
        return "basket";
      else if (this.$route.name === window.$storefront.routes.USER_PROFILE_PAGE)
        return "profile";
      else if (
        this.$route.name === window.$storefront.routes.HISTORY_ORDERS_PHYSICAL
      )
        return "notification";

      return "home";
    },

    in_custom_home_page() {
      return this.$route.name === "CustomHomePage";
    },
    in_product() {
      return this.$route.name === window.$storefront.routes.PRODUCT_PAGE;
    },
    in_category() {
      return this.$route.name === window.$storefront.routes.SHOP_CATEGORY_PAGE;
    },

    total_items_in_carts() {
      return this.getTotalItemInBaskets();
    },
    sum_orders_badges() {
      let out = 0;
      if (!this.getOrdersState()) return out;

      this.getOrdersState().forEach((item) => {
        out += item.count;
      });

      return out;
    },

    // Handle channels:
    channel_entry() {
      return this.$store.getters.getChannelEntry;
    },
    in_channel_entry_page() {
      return (
        this.channel_entry &&
        this.$route.matched.some(
          (record) => record.meta.channel === this.channel_entry,
        )
      );
    },
    channel_entry_page_name() {
      if (this.channel_entry === "instagram") return "InstagramPage";
      return null;
    },
    channel_entry_page_icon() {
      if (this.channel_entry === "instagram") return "fa:fab fa-instagram";
      return null;
    },
  },

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Watch Section
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  watch: {
    $route(new_route, old_route) {
      const home_names = [
        window.$storefront.routes.SHOP_PAGE,
        window.$storefront.routes.SHOP_CATEGORY_PAGE,
        window.$storefront.routes.PRODUCT_PAGE,
      ];

      if (
        home_names.includes(old_route.name) &&
        !home_names.includes(new_route.name)
      ) {
        this.last_home_route = old_route; // Save to retrieve in back!

        this.last_cat = old_route.params.category_name;
        this.last_product = old_route.params.product_id;

        //console.log("Last category", this.last_cat);
      }

      // When user enter a product from a category:
      if (
        old_route.name === window.$storefront.routes.SHOP_CATEGORY_PAGE &&
        new_route.name === window.$storefront.routes.PRODUCT_PAGE &&
        old_route.params.category_name
      ) {
        this.last_home_route = old_route; // Save to retrieve in back!
        this.last_cat = old_route.params.category_name;
      }

      if (!new_route.query.search) {
        // Hide search bar on change route.
        this.search_mode = false;
      }
    },

    force_hide_navigation(hide) {
      if (hide) this.search_mode = false; // Hide on force hide navigation.
    },
  },

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Component Lifecycle
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */

  mounted() {
    this.$store.commit("setBottomNavShow", true);

    window.addEventListener("scroll", this.debouncedOnScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.debouncedOnScroll);
  },
  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Component Methods
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  methods: {
    debouncedOnScroll: debounce(function () {
      this.onScroll();
    }, 50), // Adjust the debounce delay (in milliseconds) as needed

    onScroll() {
      // Get the current scroll position
      const currentScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;

      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Check if we're within 64px of the end of the page
      if (scrollHeight - (currentScrollPosition + clientHeight) <= 64) {
        this.showNavbar = true; // Show the navbar when near the bottom
        this.$store.commit("setBottomNavShow", this.showNavbar);
        return;
      }

      // Continue with your existing logic
      if (currentScrollPosition < 0) {
        return;
      }

      const diff = currentScrollPosition - this.lastScrollPosition;

      this.sum += diff;

      if (Math.abs(this.sum) < 200) return;

      this.showNavbar = this.sum < 0;
      this.sum = 0;

      this.lastScrollPosition = currentScrollPosition;

      this.$store.commit("setBottomNavShow", this.showNavbar);
    },

    // --------------- Search ------------
    onSearch(event) {
      this.$router.push({
        name: window.$storefront.routes.SHOP_PAGE,
        params: { shop_name: this.shop.shop_name },
        query: { search: event.search, search_type: event.search_type },
      });
    },

    onClear() {
      if (this.$route.name === window.$storefront.routes.SHOP_PAGE)
        //Only in shop page clear => show all products!
        this.$router.push({
          name: window.$storefront.routes.SHOP_PAGE,
          params: { shop_name: this.shop.shop_name },
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--storefront-bottom-navigation {
  bottom: 8px !important;
  left: 8px !important;
  right: 8px !important;
  width: auto !important;
  border-radius: 20px !important;
  border: 1px solid #dee2e6 !important;
  transition: all 0.35s linear;
  overflow: hidden;

  &.-hide {
    transform: translateY(100px) !important;
  }

  &.-top {
    width: 98% !important;
    left: 1% !important;
    border-radius: 12px !important;
    top: 1% !important;
    bottom: unset !important;
  }
}
</style>
