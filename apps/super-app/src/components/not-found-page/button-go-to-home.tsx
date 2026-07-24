"use client";

import Link from "next/link";

import { Button } from "@/components/button";
import useLocalStorage from "@/hooks/use-local-storage";
import { USER_ID_KEY } from "@/utils/commons/keys";
import { CONVERSATION_URL, HOME_URL } from "@/utils/constants/url";

interface TButtonGoToHomeProps {
  label: string;
}

export default function ButtonGoToHome(props: TButtonGoToHomeProps) {
  const [userId] = useLocalStorage(USER_ID_KEY);
  const { label } = props;

  return (
    <Button color="tertiary">
      <Link href={userId ? CONVERSATION_URL : HOME_URL}>{label}</Link>
    </Button>
  );
}
