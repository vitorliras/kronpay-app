import { MatPaginatorIntl } from '@angular/material/paginator';

export function Paginator() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.getRangeLabel = (
    page: number,
    pageSize: number,
    length: number
  ) => {
    if (length === 0 || pageSize === 0) {
      return `Página 0 de 0`;
    }

    const totalPages = Math.ceil(length / pageSize);
    const currentPage = page + 1;

    return ` ${currentPage} | ${totalPages}`;
  };

  return paginatorIntl;
}
