<template>
  <span
    v-if="currency_obj"
    class="imc"
    :caption="currency_obj.code"
    :class="{
      '-gradient': gradient,
      '-small': small,
      '--s1': currency_obj.unicode.length > 1 || currency_obj.unicode === '﷼',
      'sub-caption b-12px': caption,
      '--flag': flag||flagOnly,
    }"
    :title="currency_obj.code"
    :style="
      gradient
        ? {
            backgroundImage: `linear-gradient(0deg, ${currency_obj.gradient[0]},  ${currency_obj.gradient[1]})`,
          }
        : undefined
    "
  >
    <flag
      v-if="(flag || flagOnly) && currency_obj.flag"
      :iso="currency_obj.flag"
      :squared="true"
      class="me-1 -flag"
    />

    {{ flagOnly?'':currency_obj.unicode }}
  </span>
</template>

<script>
export default {
  name: "CurrencyIcon",
  props: {
    currency: {
      required: true,
    },
    gradient: {
      default: false,
      type: Boolean,
    },
    small: {
      default: false,
      type: Boolean,
    },
    caption: {
      default: false,
      type: Boolean,
    },
    flag: {
      default: false,
      type: Boolean,
    },
    flagOnly: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    currency_obj() {
      if (this.currency instanceof Object) return this.currency;
      return this.GetCurrency(this.currency);
    },
  },
};
</script>

<style scoped lang="scss">
.imc {
  display: inline-flex;
  align-items: center;
  width: 34px;
  min-width: 34px;
  font-size: 23px;
  font-weight: 500;
  line-height: 40px;
  text-align: center;

  &.-small {
    font-size: 16px;
    font-weight: 700;
    line-height: normal;
  }
  &.--s1 {
    font-size: 16px;
    font-weight: 800;
    &.-small {
      font-size: 12px;
      font-weight: 800;
    }
  }

  &.-gradient {
    background-size: cover;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-fill-color: transparent;
  }

  &:after {
    font-weight: 500;
  }

  &.--flag {
    min-width: max-content;
  }

  .-flag {
    border-radius: 50%;
    overflow: hidden;
    border: solid 1.5px #fff;
    aspect-ratio: 1;
    width: 20px;
  }
}
</style>
