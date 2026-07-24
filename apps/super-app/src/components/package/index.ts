import { PackageGroup } from "./package-group";
import { PackageItem } from "./package-item";

export type {
  IPackageGroupProps,
  IPackageItemProps,
  TPackageBadgeLayout,
} from "./types";

const Package = {
  Group: PackageGroup,
  Item: PackageItem,
};

export default Package;
