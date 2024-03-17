# UBarcode

Add barcodes to your Vue application super easily with UBarcode!

Supported barcode formats:
`CODE128`
`EAN`
`EAN-13`
`EAN-8`
`EAN-5`
`EAN-2`
`UPC (A)`
`CODE39`
`ITF-14`
`MSI`
`Pharmacode`
`Codabar`

It is a light wrapper for the [JsBarcode](https://github.com/lindell/JsBarcode) barcode library.



## Use

#### 1. Add VueBarcode as a component

````javascript
import UBarcode from 'u-barcode';

new Vue({
  components: {
    'u-barcode': UBarcode
  }
})
````

#### 2. Use it

````html
<u-barcode value="value-to-render" format="barcode-format" ...more options>
  Show this if the rendering fails.
</u-barcode>
````

## Example

Simple example with input binding. [Try it out with this JsFiddle!](http://jsfiddle.net/hfgan035/4/)

````html
<div id="app">
  <input v-model="barcodeValue" /><br>
  <u-barcode v-bind:value="barcodeValue">
    Show this if the rendering fails.
  </u-barcode>
</div>
````

````javascript
import UBarcode from 'u-barcode';

var app = new Vue({
  el: '#app',
  data: {
    barcodeValue: 'test',
  },
  components: {
    'barcode': UBarcode
  }
})
````

# Options

All options:

`format`
`width`
`height`
`text`
`font-options`
`font`
`text-align`
`text-position`
`text-margin`
`font-size`
`background`
`lineColor`
`margin`
`margin-top`
`margin-bottom`
`margin-left`
`margin-right`
`display-value`
`ean128`

For more information, see the [JsBarcode documentation](https://github.com/lindell/JsBarcode/wiki/Options).
