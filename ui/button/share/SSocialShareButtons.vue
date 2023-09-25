<template>
  <v-flex align-center justify-center row style="display: inline-block">
    <a
      v-if="telegramRhash && false"
      class="ml-2"
      @click="
        $clipboard(`https://t.me/iv?url=${url}x&rhash=${telegramRhash}`);
        showSuccessAlert('Copied', 'Past into your Telegram and share.');
      "
      ><i class="fab fa-telegram text-danger" title="Copy instance view link"
    /></a>

    <social-sharing
      ref="networking"
      :url="url"
      :title="title"
      :description="description"
      :quote="quote"
      :hashtags="hashtags ? hashtags.replace(/-/g, '_') : ''"
      :media="media"
      :twitter-user="SetupService.GetTwitterAccount()"
      inline-template
    >
      <div v-if="false">
        <network network="email" class="mouse-pointer-hand m-1">
          <i class="fab fa-envelope" title="Email" />
        </network>
        <network network="facebook" class="mouse-pointer-hand m-1">
          <i class="fab fa-facebook" title="Facebook" />
        </network>
        <network network="googleplus" class="mouse-pointer-hand m-1">
          <i class="fab fa-google-plus" title="Google" />
        </network>
        <network network="linkedin" class="mouse-pointer-hand m-1">
          <i class="fab fa-linkedin" title="Linkedin" />
        </network>
        <network network="odnoklassniki" class="mouse-pointer-hand m-1">
          <i class="fab fa-odnoklassniki" title="Odnoklassniki" />
        </network>
        <network network="pinterest" class="mouse-pointer-hand m-1">
          <i class="fab fa-pinterest" title="Pinterest" />
        </network>
        <network network="reddit" class="mouse-pointer-hand m-1">
          <i class="fab fa-reddit" title="Reddit" />
        </network>
        <network network="skype" class="mouse-pointer-hand m-1">
          <i class="fab fa-skype" title="Skype" />
        </network>
        <network network="sms" class="mouse-pointer-hand m-1">
          <i class="fab fa-commenting-o" title="SMS" />
        </network>
        <network network="telegram" class="mouse-pointer-hand m-1">
          <i class="fab fa-telegram" title="Telegram" />
        </network>
        <network network="twitter" class="mouse-pointer-hand m-1">
          <i class="fab fa-twitter" title="Twitter" />
        </network>
        <network network="vk" class="mouse-pointer-hand m-1">
          <i class="fab fa-vk" title="VKontakte" />
        </network>
        <network network="weibo" class="mouse-pointer-hand m-1">
          <i class="fab fa-weibo" title="Weibo" />
        </network>
        <network network="whatsapp" class="mouse-pointer-hand m-1">
          <i class="fab fa-whatsapp" title="Whatsapp" />
        </network>
      </div>
    </social-sharing>

    <div class="social-btns" :class="{ '-small': small, '-large': forceLarge }">
      <a
        class="btn facebook"
        @click="
          $refs.networking.share('facebook');
          $emit('share', 'facebook');
        "
        ><i class="fab fa-facebook"
      /></a>

      <a
        class="btn twitter"
        @click="
          $refs.networking.share('twitter');
          $emit('share', 'twitter');
        "
        ><i class="fab fa-twitter"
      /></a>
      <a
        class="btn linkedin"
        @click="
          $refs.networking.share('linkedin');
          $emit('share', 'linkedin');
        "
        ><i class="fab fa-linkedin"
      /></a>
      <a
        class="btn line"
        @click="
          $refs.networking.share('line');
          $emit('share', 'line');
        "
        ><i class="fab fa-line"
      /></a>

      <a
        class="btn pinterest"
        @click="
          $refs.networking.share('pinterest');
          $emit('share', 'pinterest');
        "
        ><i class="fab fa-pinterest"
      /></a>
      <a
        class="btn reddit"
        @click="
          $refs.networking.share('reddit');
          $emit('share', 'reddit');
        "
        ><i class="fab fa-reddit"
      /></a>

      <a
        class="btn telegram"
        @click="
          $refs.networking.share('telegram');
          $emit('share', 'telegram');
        "
        ><i class="fab fa-telegram"
      /></a>
      <a
        class="btn whatsapp"
        @click="
          $refs.networking.share('whatsapp');
          $emit('share', 'whatsapp');
        "
        ><i class="fab fa-whatsapp"
      /></a>
      <a
        class="btn skype"
        @click="
          $refs.networking.share('skype');
          $emit('share', 'skype');
        "
        ><i class="fab fa-skype"
      /></a>
      <a
        class="btn sms"
        @click="
          $refs.networking.share('sms');
          $emit('share', 'sms');
        "
        ><i class="fas fa-sms"
      /></a>
      <a
        class="btn email"
        @click="
          $refs.networking.share('email');
          $emit('share', 'email');
        "
        ><i class="fas fa-envelope"
      /></a>

      <a
        v-if="embedCode"
        class="btn embed"
        @click="
          copyToClipboard(embedCode);
          $emit('embed');
        "
        ><i class="fas fa-code"
      /></a>

      <a
        v-if="url"
        class="btn copy"
        @click="
          copyToClipboard(url);
          $emit('share', 'copy');
        "
        ><i class="fas fa-copy"
      /></a>
    </div>
  </v-flex>
</template>

<script>
export default {
  name: "SSocialShareButtons",

  props: {
    url: {
      required: true,
      type: String,
    },
    title: {
      required: true,
      type: String,
    },
    description: {
      required: false,
    },
    quote: {
      required: false,
    },
    hashtags: {
      required: false,
      type: String,
    },
    media: {},

    telegramRhash: {
      required: false,
      type: String,
    },
    embedCode: {
      required: false,
      type: String,
    },
    small: {
      type: Boolean,
      default: false,
    },
    forceLarge: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {};
  },
  computed: {},
  methods: {},
};
</script>

<style lang="stylus" scoped>

  btn-size = 70px




  sites = {
  'facebook': #3B5998
  'twitter': #3CF
  'google': #DC4A38
  'linkedin': #0080d1
  'dribbble': #F26798
  'skype': #00AFF0
  'email': #FFA000
  'pinterest':#D32F2F
  'reddit': #E64A19
  'sms':#455A64
  'telegram':#0288D1
  'whatsapp':#689F38
  'tumblr':#35465c
  'line':#5cd037
  'embed':#70557e
  'copy':#333

}

  $animate {
    transition: all .35s
    transition-timing-function: cubic-bezier(
            0.310,
            -0.105,
            0.430,
            1.590
    )
  }

  $btn__inactive
    &:before
      top: 90%
      left: -110%
    .fab
      transform: scale(.8)
    .fas
      transform: scale(.8)
    for name, color in sites    // variants
      &.{name}
        &:before
          background-color: color
        .fab
          color: color
        .fas
          color: color





  $btn__active
    &:before
      top: -10%
      left: -10%
    .fab
      color: #fff
      transform: scale(1)
    .fas
      color: #fff
      transform: scale(1)



  .social-btns {
   // height: btn-size
    margin: auto
    font-size: 0
    text-align: center
    position: relative
    top: 0
    bottom: 0
    left: 0
    right: 0

    &.-small{
      .btn {
        width: 42px
        height: 42px
        line-height: 42px
        margin: 6px !important

        .fab, .fas {
          font-size: 18px
        }
      }
    }

    &:not(.-large){
      .btn {
        @media only screen and (max-width: 600px) {
          width: 42px
          height: 42px
          line-height: 42px
          margin:6px !important

          .fab,.fas {
            font-size: 18px
          }
        }
      }
    }

    .btn {
      @extends $btn__inactive
      @extends $animate
      margin:4px 10px !important
      display: inline-block
      background-color: #fff
      width: btn-size
      height: btn-size
      line-height: btn-size



      text-align: center
      position: relative
      overflow: hidden
      border-radius: 28%
      box-shadow: 0 5px 15px -5px rgba(0, 0, 0, 0.1)!important
      //overflow bug fix
      opacity: .99

      &:before {
        @extends $animate
        content: ''
        width: 120%
        height: 120%
        position: absolute
        transform: rotate(45deg)
      }


      .fab,.fas {
        @extends $animate
        font-size: 38px
        vertical-align middle
      }






      &:focus,
      &:hover {
        @extends $btn__active
      }
    }


  }
</style>
