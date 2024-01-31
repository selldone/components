# SBarcode

Add barcodes to your Vue application super easily with SBarcode! 

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

## Install
````
npm install s-barcode
````

## Use
#### 1. Add VueBarcode as a component

````javascript
import SBarcode from 's-barcode';

new Vue({
  components: {
    's-barcode': SBarcode
  }
})
````
#### 2. Use it

````html
<s-barcode value="value-to-render" format="barcode-format" ...more options>
  Show this if the rendering fails.
</s-barcode>
````

## Example
Simple example with input binding. [Try it out with this JsFiddle!](http://jsfiddle.net/hfgan035/4/)
````html
<div id="app">
  <input v-model="barcodeValue" /><br>
  <s-barcode v-bind:value="barcodeValue">
    Show this if the rendering fails.
  </s-barcode>
</div>
````

````javascript
import SBarcode from 's-barcode';

var app = new Vue({
  el: '#app',
  data: {
    barcodeValue: 'test',
  },
  components: {
    'barcode': SBarcode
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
