import { SVGIcon } from "@/components/svg-icon";
import { useGlobalState } from "@/store/global/hooks";

import { PaddleCheckoutContainer as SharedPaddleCheckoutContainer } from "../common/paddle-checkout-container";

interface PaddleCheckoutContainerProps {
  readonly embedInFlow?: boolean;
}

export function PaddleCheckoutContainer(props: PaddleCheckoutContainerProps) {
  const { embedInFlow } = props;
  const resetCheckoutFlow = useGlobalState((state) => state.resetCheckoutFlow);

  const handleBack = () => {
    resetCheckoutFlow();
  };

  return (
    <SharedPaddleCheckoutContainer
      embedInFlow={embedInFlow}
      contentWrapperClassName="p-small-0.25"
      renderHeader={() => (
        <div className="gap-medium-3 ps-small-0.25 pt-small-0.5 hidden items-center md:flex">
          <button
            type="button"
            onClick={handleBack}
            className="gap-small-2 text-text-general-tertiary hover:text-text-general-secondary flex cursor-pointer items-center transition-colors"
          >
            <SVGIcon
              src="/icons/outlined/arrow-left.svg"
              width={20}
              height={20}
            />
            <span className="text-body-2 font-medium">Back to Plans</span>
          </button>
        </div>
      )}
    />
  );
}
