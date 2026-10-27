import { useState, useRef, useEffect, isValidElement } from 'react';
import { ChevronDown, Search, type LucideIcon } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: LucideIcon | React.ReactNode;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: LucideIcon | React.ReactNode;
  maxHeight?: number; // max height of options list, default 210px (~6 items)
  showSearch?: boolean; // default true when options.length > 5
  style?: React.CSSProperties;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  icon,
  maxHeight = 210,
  showSearch,
  style,
  className = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const shouldShowSearch = showSearch !== undefined ? showSearch : options.length > 5;

  // Filter options based on search query
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Helper to render icon safely whether it's a JSX element or a Component
  const renderIcon = (iconItem?: LucideIcon | React.ReactNode) => {
    if (!iconItem) return null;
    if (isValidElement(iconItem)) {
      return <span className="select-trigger-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>{iconItem}</span>;
    }
    if (typeof iconItem === 'function' || typeof iconItem === 'object') {
      const Component = iconItem as LucideIcon;
      return <Component size={14} className="select-trigger-icon" />;
    }
    return null;
  };

  return (
    <div
      ref={containerRef}
      className={`searchable-select-wrap ${className}`}
      style={{ position: 'relative', display: 'inline-block', ...style }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        className={`searchable-select-trigger ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          {renderIcon(icon)}
          <span className="select-trigger-label">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={14} className={`select-chevron ${isOpen ? 'is-open' : ''}`} />
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="searchable-select-dropdown">
          {/* Optional Search Input */}
          {shouldShowSearch && (
            <div className="searchable-select-search">
              <Search size={14} className="select-search-icon" />
              <input
                type="text"
                placeholder="Gõ để tìm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Scrollable Options List (Max ~6 items height) */}
          <div
            className="searchable-select-options"
            style={{ maxHeight: `${maxHeight}px`, overflowY: 'auto' }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    className={`searchable-select-option ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelect(opt.value)}
                  >
                    {renderIcon(opt.icon)}
                    <span>{opt.label}</span>
                  </div>
                );
              })
            ) : (
              <div className="searchable-select-no-results">Không có kết quả</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
