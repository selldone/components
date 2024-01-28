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
    <div
      style="
        border: 1px solid gray;
        border-radius: 1.5rem;
        width: 300px;
        height: 300px;
        position: relative;
        margin: 12px auto;
        overflow: hidden;
      "
    >
      <video
        v-if="!camera_not_exist"
        id="video"
        width="100%"
        height="100%"
      ></video>
      <div class="laser"></div>
    </div>

    <v-alert outlined v-if="error" type="error">{{ error }}</v-alert>

    <div class="text-success font-weight-black">{{ result }}</div>
  </div>
</template>

<script>
import {MultiFormatReader, BarcodeFormat, BrowserMultiFormatReader, DecodeHintType} from '@zxing/library';


export default {
  name: "BarcodeScanner",
  props: {
    qrCode: {
      type: Boolean,
      default: false,
    },
    otherCodes: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    error: null,
    camera_not_exist: false,
    result: null,

    videoInputDevices: [],

    codeReader: null,
  }),
  mounted() {
    const hints = new Map();

    const formats = [];
    if (this.qrCode) formats.push(BarcodeFormat.QR_CODE);
    if (this.otherCodes)
      formats.push(
        ...[
          BarcodeFormat.AZTEC,
          BarcodeFormat.CODABAR,
          BarcodeFormat.CODE_39,
          BarcodeFormat.CODE_93,
          BarcodeFormat.CODE_128,
          BarcodeFormat.PDF_417,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
        ]
      );

    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

    this.codeReader = new BrowserMultiFormatReader(hints);

    this.codeReader
      .listVideoInputDevices()
      .then((videoInputDevices) => {
        this.videoInputDevices = videoInputDevices;
        videoInputDevices.forEach((device) =>
          console.log(`${device.label}, ${device.deviceId}`)
        );
        if (videoInputDevices.length === 0) {
          this.error = "Camera not found!";
          this.camera_not_exist = true;
          return;
        }

        const firstDeviceId = videoInputDevices[0].deviceId;

        this.startScan();
      })
      .catch((err) => console.error(err));
  },
  beforeDestroy() {
    if (!this.codeReader) return;
    this.codeReader.stopAsyncDecode();
    this.codeReader.stopContinuousDecode();
    this.codeReader.stopStreams();
    this.codeReader.reset();
    this.codeReader=null;
  },

  methods: {
    startScan() {
      if (!this.codeReader) return;

      this.codeReader
        .decodeOnceFromVideoDevice(/*firstDeviceId*/ undefined, "video")
        .then((result) => {
          this.result = result.text;
          console.log(result.text);
          this.$emit("on-scan", result.text);
        })
        .catch((err) => {
          this.error = err;
          //console.error(err);
        });
    },
  },
};
</script>

<style scoped lang="scss">
  video{
    background-color: #000;
    object-fit: cover;
  }
.laser {
  width: 100%;
  margin-left: 0;
  background-color: tomato;
  height: 1px;
  position: absolute;
  top: 40%;
  z-index: 2;
  box-shadow: 0 0 4px red;
  animation: scanning 2s infinite;
}

@keyframes scanning {
  50% {
    transform: translateY(75px);
  }
}
</style>
