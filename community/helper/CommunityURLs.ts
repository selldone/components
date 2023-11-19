/*
 * Copyright (c) 2023. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */

import SetupService from "@core/server/SetupService";
import ShopURLs from "@core/helper/url/ShopURLs";
import type { Shop } from "@core/models/shop/shop.model";
import type { CommunityPost } from "@core/models/community/community.post.model";
import type { CommunityComment } from "@core/models/community/community.comment.model";

export default class CommunityURLs {
  static CommunityUrl(shop: Shop) {
    const base = shop
      ? ShopURLs.MainShopUrl(shop)
      : SetupService.MainServiceUrl();
    return `${base}/community`;
  }

  static CommentUrl(shop: Shop, comment: CommunityComment) {
    const base = shop
      ? ShopURLs.MainShopUrl(shop)
      : SetupService.MainServiceUrl();
    return `${base}/COMMENTS/${comment.id}`;
  }

  static TopicShortUrl(community_id: number, topic_id: number) {
    const base = SetupService.MainServiceUrl();
    return `${base}/CROSS/${community_id}/${topic_id}`; // Short url mode
  }

  static PostUrl(shop: Shop, post: CommunityPost) {
    const base = shop
      ? ShopURLs.MainShopUrl(shop)
      : SetupService.MainServiceUrl();
    return `${base}/POSTS/${post.id}`;
  }

  static PostEmbedUrl(shop: Shop, post: CommunityPost) {
    const base = shop
      ? SetupService.SelldoneIframe()
      : SetupService.MainServiceUrl(); // Embed only on main service url!
    return `${base}/POSTS/${post.id}/embed`;
  }

  static CommunityInviteLink(shop: Shop) {
    const base = shop
      ? ShopURLs.MainShopUrl(shop)
      : SetupService.MainServiceUrl();
    return `${base}/community`;
  }
}
