import ManageAccountRoute from "@/features/manage-account-modal/routes/manage-account-route";

type PageProps = Readonly<{
  params: Promise<{
    tab: string;
  }>;
}>;

export default async function ManageAccountModalPage(props: PageProps) {
  const params = await props.params;
  return <ManageAccountRoute tabSegment={params.tab} isPageRoute={false} />;
}
