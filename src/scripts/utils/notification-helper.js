import { convertBase64ToUint8Array } from "./index";
import CONFIG from "../config";
import { subscribeNotification, unsubscribeNotification } from "../data/api";
import Swal from "sweetalert2";

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationPermissionGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API unsupported");
    return false;
  }

  if (isNotificationPermissionGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === "denied") {
    await Swal.fire({
      icon: "error",
      title: "Izin notifikasi ditolak.",
      confirmButtonText: "Ok"
    });
    return false;
  }

  if (status === "default") {
    await Swal.fire({
      icon: "error",
      title: "Izin notifikasi ditutup atau diabaikan.",
      confirmButtonText: "Ok"
    });
    return false;
  }

  return true;
}

export async function subscribePushNotification() {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error("Gagal mendapatkan subscription saat ini:", error);
    return null;
  }
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await subscribePushNotification());
}

export function generateSubscriptionOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY)
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) return;

  if (await isCurrentPushSubscriptionAvailable()) {
    await Swal.fire({
      icon: "info",
      title: "Sudah berlangganan push notification.",
      confirmButtonText: "Ok"
    });
    return;
  }

  console.log("Mulai berlangganan push notification...");

  const failureSubscribeMessage =
    "Langganan push notification gagal diaktifkan.";
  const successSubscribeMessage =
    "Langganan push notification berhasil diaktifkan.";

  let pushSubscription;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.error("Service Worker belum terdaftar.");
      return;
    }
    pushSubscription = await registration.pushManager.subscribe(
      generateSubscriptionOptions()
    );

    const { endpoint, keys } = pushSubscription.toJSON();
    console.log({ endpoint, keys });

    const response = await subscribeNotification({ endpoint, keys });

    if (response.error) {
      console.error("subscribe response error:", response);
      await Swal.fire({
        icon: "error",
        title: failureSubscribeMessage,
        confirmButtonText: "Ok"
      });
      await pushSubscription.unsubscribe();
      return;
    }

    console.log("subscribe response:", response);
    await Swal.fire({
      icon: "success",
      title: successSubscribeMessage,
      confirmButtonText: "Ok"
    });
  } catch (error) {
    console.error("subscribe error:", error);
    await Swal.fire({
      icon: "error",
      title: failureSubscribeMessage,
      confirmButtonText: "Ok"
    });
    if (pushSubscription) await pushSubscription.unsubscribe();
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage =
    "Langganan push notification gagal dinonaktifkan.";
  const successUnsubscribeMessage =
    "Langganan push notification berhasil dinonaktifkan.";

  try {
    const pushSubscription = await subscribePushNotification();

    if (!pushSubscription) {
      await Swal.fire({
        icon: "info",
        title: "Belum berlangganan push notification.",
        confirmButtonText: "Ok"
      });
      return;
    }

    const { endpoint } = pushSubscription.toJSON();
    const response = await unsubscribeNotification({ endpoint });

    if (response.error) {
      console.error("unsubscribe response error:", response);
      await Swal.fire({
        icon: "error",
        title: failureUnsubscribeMessage,
        confirmButtonText: "Ok"
      });
      return;
    }

    const unsubscribed = await pushSubscription.unsubscribe();

    if (!unsubscribed) {
      await Swal.fire({
        icon: "error",
        title: failureUnsubscribeMessage,
        confirmButtonText: "Ok"
      });
      await subscribeNotification({
        endpoint,
        keys: pushSubscription.toJSON().keys
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: successUnsubscribeMessage,
      confirmButtonText: "Ok"
    });
  } catch (error) {
    console.error("unsubscribe error:", error);
    await Swal.fire({
      icon: "error",
      title: failureUnsubscribeMessage,
      confirmButtonText: "Ok"
    });
  }
}
