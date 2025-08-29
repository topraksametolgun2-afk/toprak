import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ProductPagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: ProductPaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between" data-testid="pagination">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          data-testid="button-previous-page"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Önceki
        </Button>
        
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            page === '...' ? (
              <span key={index} className="px-3 py-2 text-sm text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="w-10"
                data-testid={`button-page-${page}`}
              >
                {page}
              </Button>
            )
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          data-testid="button-next-page"
        >
          Sonraki
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground hidden sm:block" data-testid="pagination-info">
        Toplam {totalPages} sayfa
      </div>
    </div>
  );
}
