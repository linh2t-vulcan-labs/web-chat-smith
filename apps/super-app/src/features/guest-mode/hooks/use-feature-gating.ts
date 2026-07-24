import type { ProductModel } from "@/core/models/product";
import type { TGuestSignInState } from "@/libs/tracking-event";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useAuthState } from "@/store/auth/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { localStorageImpl } from "@/utils/commons/helpers";
import { LOCAL_STORAGE_KEY } from "@/utils/commons/keys";
import { CONVERSATION_URL } from "@/utils/constants/url";

import { useGuestStore } from "../stores/guest-mode/hooks";

export const useFeatureGating = () => {
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const setIsOpenLoginModal = useAuthState(
    (state) => state.setIsOpenLoginModal
  );
  const { sendTrackingEvent } = useSendTrackingEvent();

  const guestStore = useGuestStore();

  const showLoginModal = (
    source: TGuestSignInState,
    _callbackUrl = CONVERSATION_URL
  ) => {
    if (!guestStore) {
      return;
    }

    setIsOpenLoginModal(true, source);
  };

  const openSubscriptionModal = () => {
    if (!guestStore) {
      return;
    }

    const { anonId } = guestStore.getState();

    setIsOpenSubscriptionModal(true);
    sendTrackingEvent({
      name: EventKeys.GuestDSOpen,
      payload: {
        guest_id: anonId || "",
      },
    });
  };

  const handleLoginToPayment = (product?: ProductModel) => {
    if (!guestStore) {
      return;
    }

    if (product) {
      localStorageImpl.save(LOCAL_STORAGE_KEY.GUEST_MODE_PRODUCT, product);

      sendTrackingEvent({
        name: EventKeys.GuestDSPackageSelected,
        payload: {
          ecommerce: {
            currency: product.defaultPrice.currencyIsoFormat,
            items: [
              {
                item_id: product.durationUnitLabel,
                item_name: product.description,
                price: product.defaultPrice.price,
                quantity: 1,
              },
            ],
            value: product.defaultPrice.price,
          },
          guest_id: guestStore.getState().anonId || "",
        },
      });
    }

    setIsOpenLoginModal(true, "ds");
  };

  return {
    handleLoginToPayment,
    openSubscriptionModal,
    showLoginModal,
  };
};
