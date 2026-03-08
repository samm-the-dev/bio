import { useEffect } from 'react';

const BASE_TITLE = 'Sam Marsh';

export function useDocumentTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} - ${BASE_TITLE}` : BASE_TITLE;
  }, [page]);
}
