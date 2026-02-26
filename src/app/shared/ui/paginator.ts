import { MatPaginatorIntl } from '@angular/material/paginator';

export function Paginator() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.getRangeLabel = (
    page: number,
    pageSize: number,
    length: number
  ) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const start = page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, length);

        return `${start}–${end} total ${length}`;

  };

  return paginatorIntl;
}
