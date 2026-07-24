import { Divider } from "@/components/divider";
import { PromoteSignin } from "@/features/guest-mode/components/promote-signin";

import type { TSignInRequireProps } from "./types";

function SignInRequire({ title, onSignIn }: TSignInRequireProps) {
  return (
    <div className="flex flex-col space-y-small-1">
      <h3 className="text-footnoteM-bold text-text-general-primary">{title}</h3>
      <Divider direction="horizontal" className="bg-border-general-primary" />
      <PromoteSignin onSignIn={onSignIn} />
    </div>
  );
}

export default SignInRequire;
