export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  nextLabel?: React.ReactNode;
  previousLabel?: React.ReactNode;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
}
