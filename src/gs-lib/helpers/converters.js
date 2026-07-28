import GSPageBanner from "../components/gs-page-banner";
import GSItemInfo from "../components/gs-item-info";

export function bannerNotificationConverter(notifications, actions) {
  if (notifications) {
    const bannerNotifications = notifications.map((notification) => ({
      header: <GSItemInfo {...notification.info}></GSItemInfo>,
      pageActions: notification.actions,
      state: notification.state,
    }));
    return <GSPageBanner notifications={bannerNotifications} navigationActions={actions}></GSPageBanner>;
  }
}

export const converters = {bannerNotificationConverter}