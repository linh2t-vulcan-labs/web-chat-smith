export function MyPlanSectionItemContainer(
  props: Readonly<React.PropsWithChildren>
) {
  const { children } = props;

  return (
    <div className="rounded-v1-xl border-v1-border-structural-default thickness-v1-1 p-v1-structural-content-relaxed gap-v1-structural-component-large bg-v1-surface-hierarchy-raised flex flex-col items-start border-solid">
      {children}
    </div>
  );
}
