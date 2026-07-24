import { useState } from "react";

interface UseModalShowReturnType {
  show: boolean;
  setShow: (value: boolean) => void;
  onHide: () => void;
}

export const useModalShow = (): UseModalShowReturnType => {
  const [show, setShow] = useState(false);

  const handleOnHide = () => {
    setShow(false);
  };

  return {
    onHide: handleOnHide,
    setShow,
    show,
  };
};
