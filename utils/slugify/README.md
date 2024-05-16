
# slugify


```js
var slugify = require('slugify')

slugify('some string') // some-string

// if you prefer something other than '-' as separator
slugify('some string', '_')  // some_string
```


## Options

```js
slugify('some string', {
  replacement: '-',  // replace spaces with replacement character, defaults to `-`
  remove: undefined, // remove characters that match regex, defaults to `undefined`
  lower: false,      // convert to lower case, defaults to `false`
  strict: false,     // strip special characters except replacement, defaults to `false`
  locale: 'vi',      // language code of the locale to use
  trim: true         // trim leading and trailing replacement chars, defaults to `true`
})
```

## Remove

For example, to remove `*+~.()'"!:@` from the result slug, you can use `slugify('..', {remove: /[*+~.()'"!:@]/g})`.

* If the value of `remove` is a regular expression, it should be a
  [character class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Character_Classes)
  and only a character class. It should also use the
  [global flag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/global).
  (For example: `/[*+~.()'"!:@]/g`.) Otherwise, the `remove` option might not
  work as expected.
* If the value of `remove` is a string, it should be a single character.
  Otherwise, the `remove` option might not work as expected.

## Locales

The main `charmap.json` file contains all known characters and their transliteration. All new characters should be added there first. In case you stumble upon a character already set in `charmap.json`, but not transliterated correctly according to your language, then you have to add those characters in `locales.json` to override the already existing transliteration in `charmap.json`, but for your locale only.

You can get the correct language code of your language from [here](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

## Extend

Out of the box `slugify` comes with support for a handful of Unicode symbols. For example the `☢` (radioactive) symbol is not defined in the [`charMap`][charmap] and therefore it will be stripped by default:

```js
slugify('unicode ♥ is ☢') // unicode-love-is
```

However you can extend the supported symbols, or override the existing ones with your own:

```js
slugify.extend({'☢': 'radioactive'})
slugify('unicode ♥ is ☢') // unicode-love-is-radioactive
```

Keep in mind that the `extend` method extends/overrides the default `charMap` for the entire process. In case you need a fresh instance of the slugify's `charMap` object you have to clean up the module cache first:

```js
delete require.cache[require.resolve('slugify')]
var slugify = require('slugify')
```

