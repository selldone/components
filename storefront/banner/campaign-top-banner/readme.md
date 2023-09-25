# <s-top-banner> | Campaign Top Banner

## Overview

The `STopBanner` component is designed to display banners created within campaigns. These campaigns can be crafted and
managed via the shop dashboard under the path: `Shop dashboard > Marketing > Campaign tab`.

## 🪄 Dashboard Magic Link

https://selldone.com/magic-links/shop:campaigns


## Structure
This represents the sample structure of the banner data within the `campaign.banner` object: .

```json
{
  "banner": {
    "message": "This message will be prominently displayed as a banner at the top of the shop page.",
    "dark": false,
    "icon_bg": "#FFEB3BFF",
    "icon": "home",
    "anim_height": "48px",
    "anim_width": "126px",
    "anim": "https://assets7.lottiefiles.com/packages/lf20_R7qGYA.json",
    "page_name": "main",
    "bg_image": null,
    "repeat": false,
    "bg": "#fefefeff"
  }
}
```