<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <component
    :is="to ? 'router-link' : href ? 'a' : 'div'"
    v-bind="to ? { to: to } : { href: href }"
    class="s--category-card"
    @click="$emit('click')"
  >
    <div class="category-card-root">
      <div class="box">
        <div
          class="folder-card"
          :class="{ '-small-mode': smallMode, '-static': static }"
        >
          <div class="imgBx">
            <p class="category-title text-nowrap text-ellipsis">
              {{ category.title }}
            </p>
            <img
              :src="(getShopImagePath(category.icon))"
              alt=""
            />
          </div>
          <div class="details">
            <b>{{ category.title }}</b
            ><span>{{ category.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </component>
</template>

<script>
export default {
  name: "CategoryCard",
  components: {},
  props: {
    category: {
      required: true,
      type: Object,
    },
    to: {
      required: false,
      type: Object,
    },
    href: {},
    smallMode: {
      default: false,
      type: Boolean,
    },

    static: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      rating_test: 4.5,
    };
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {},
  methods: {
    //――――――――――――――――――――――― Icon Helper ―――――――――――――――――――――――

    hasIcon() {
      return this.product.icon != null;
    },
  },
};
</script>

<style lang="scss">

/**
Npt scoped: in landing builder show wrong style for insta-card (global style to override)
 */

.category-card-root {
  text-align: center;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  //min-height: 100vh;
  // background: #212121;
  //font-family: sans-serif;

  // Fix Flickering in Safari in Safari: (Apple bug)
  //-webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;

  .folder-card {
    position: relative;
    width: 100%;
    height: 350px;
    background: #fff;
    margin: 0 auto;
    border-radius: 14px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

    &.-small-mode {
      height: 180px;

      .details {
        h2 {
          font-size: 14px;
          span {
            font-size: 0.9rem;
          }
        }
      }
    }

    &:before,
    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 4px;
      background: #fff;
      transition: 0.5s;
      z-index: -1;
    }

    // --------------------- hover ---------------------
    &:not(.-static) {
      &:hover {
        &:before {
          transform: rotate(20deg);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
        }

        &:after {
          transform: rotate(10deg);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
        }
      }
    }

    &:hover {
      .imgBx {
        bottom: 120px;

        .category-title {
          transition-delay: 0s;

          opacity: 0;
        }
      }
    }
    // --------------------- end hover ---------------------

    .imgBx {
      position: absolute;
      top: 10px;
      left: 10px;
      bottom: 10px;
      right: 10px;
      background: #fff;
      transition: 0.5s;
      z-index: 1;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
      }
    }

    .details {
      display: flex;
      flex-direction: column;

      position: absolute;
      left: 10px;
      right: 10px;
      bottom: 10px;
      height: 100px;
      text-align: center;

      overflow: hidden;
      color: #353637;

      h2 {
        margin: 0;
        padding: 0;
        font-weight: 700;
        font-size: 20px;
        color: var(--theme-dark);
        text-transform: uppercase;

        span {
          font-weight: 400;
          font-size: 1rem;
          color: #777;
          display: block;
          margin-top: 5px;
        }
      }
    }
  } // end folder-card

  .box {
    z-index: 5;
    position: relative;

    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    grid-gap: 15px;
    margin: 0 auto;
    padding: 16px;
  }

  .category-title {
    position: absolute;
    top: 6px;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    border-radius: 0 0 18px 18px;
    padding: 4px 8px 8px 8px;
    margin: 0;
    transition: 0.3s;
    z-index: 1;
    width: 80%;
    overflow: hidden;
    color: #333;
    font-weight: 700;
    transition-delay: 0.35s;
  }
}
</style>
