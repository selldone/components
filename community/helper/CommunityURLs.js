import SetupService from "../../../../core/server/SetupService";
import ShopURLs from "../../../../core/helper/url/ShopURLs";

export default class CommunityURLs {
  static CommunityUrl(shop) {
    const base = shop
      ? ShopURLs.MainShopUrl(shop)
      : SetupService.MainServiceUrl();
    return `${base}/community`;
  }

  static CommentUrl(shop, comment) {
    const base = shop
      ? ShopURLs.MainShopUrl(shop)
      : SetupService.MainServiceUrl();
    return `${base}/COMMENTS/${comment.id}`;
  }

  static TopicShortUrl(community_id, topic_id) {
    const base = SetupService.MainServiceUrl();
    return `${base}/CROSS/${community_id}/${topic_id}`; // Short url mode
  }

  static PostUrl(shop, post) {
    const base = shop
      ? ShopURLs.MainShopUrl(shop)
      : SetupService.MainServiceUrl();
    return `${base}/POSTS/${post.id}`;
  }

  static PostEmbedUrl(shop, post) {
    const base = shop
      ? SetupService.SelldoneIframe()
      : SetupService.MainServiceUrl(); // Embed only on main service url!
    return `${base}/POSTS/${post.id}/embed`;
  }

  static CommunityInviteLink(shop) {
    const base = shop
      ? ShopURLs.MainShopUrl(shop)
      : SetupService.MainServiceUrl();
    return `${base}/community`;
  }
}
