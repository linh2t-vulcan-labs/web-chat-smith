import { useEffect, useState } from "react";

const useNetwork = () => {
  const [isOnline, setIsOnline] = useState(
    typeof window === "undefined" ? true : window.navigator.onLine
  );

  useEffect(() => {
    const updateNetwork = () => {
      setIsOnline(window.navigator.onLine);
    };

    window.addEventListener("offline", updateNetwork);
    window.addEventListener("online", updateNetwork);

    return () => {
      window.removeEventListener("offline", updateNetwork);
      window.removeEventListener("online", updateNetwork);
    };
  }, []);

  return isOnline;
};

export default useNetwork;
