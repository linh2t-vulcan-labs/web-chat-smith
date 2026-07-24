import { PaddleCheckoutContainer as SharedPaddleCheckoutContainer } from "../common/paddle-checkout-container";

interface PaddleCheckoutContainerProps {
  readonly embedInFlow?: boolean;
}

export function PaddleCheckoutContainer({
  embedInFlow,
}: PaddleCheckoutContainerProps = {}) {
  return (
    <SharedPaddleCheckoutContainer
      embedInFlow={embedInFlow}
      wrapperClassName=""
    />
  );
}
