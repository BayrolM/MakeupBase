import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div 
      style={{
        marginTop: '10px',
        backgroundColor: '#ffffff',
        border: '1px solid #fbcfe8',
        borderRadius: '10px',
        padding: '12px',
        boxShadow: '0 1px 4px rgba(123, 19, 71, 0.01)',
        fontFamily: "'DM Sans', sans-serif"
      }}
      className="flex flex-col lg:flex-row items-center justify-between gap-4 w-full text-center lg:text-left"
    >
      {/* Left side: Records Info */}
      <div style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>
        Mostrando <span style={{ color: '#111827', fontWeight: 600 }}>{startItem}</span>–<span style={{ color: '#111827', fontWeight: 600 }}>{endItem}</span> de <span style={{ color: '#111827', fontWeight: 600 }}>{totalItems}</span> registros
      </div>

      {/* Center: Navigation Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '1px solid #fbcfe8',
            color: '#7b1347',
            backgroundColor: '#ffffff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.4 : 1,
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          className="hover:bg-pink-50"
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    color: '#9ca3af',
                    fontWeight: 500,
                    fontSize: '13px'
                  }}
                >
                  ...
                </span>
              );
            }

            const isActive = currentPage === page;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '28px',
                  height: '28px',
                  padding: '0 8px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  border: isActive ? 'none' : '1px solid transparent',
                  backgroundColor: isActive ? '#7b1347' : 'transparent',
                  color: isActive ? '#ffffff' : '#4b5563',
                  boxShadow: isActive ? '0 2px 6px rgba(123, 19, 71, 0.2)' : 'none',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                className={isActive ? "" : "hover:bg-pink-50 hover:text-[#7b1347]"}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '1px solid #fbcfe8',
            color: '#7b1347',
            backgroundColor: '#ffffff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.4 : 1,
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          className="hover:bg-pink-50"
          title="Siguiente página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right side: Limit Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>
        <span>Filas por página:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #fbcfe8',
            color: '#374151',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '4px 20px 4px 8px',
            outline: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%237b1347\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 6px center',
            backgroundSize: '12px'
          }}
          className="hover:border-[#7b1347] focus:border-[#7b1347]"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}


