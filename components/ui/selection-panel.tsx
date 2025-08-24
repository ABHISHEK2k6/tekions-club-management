'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  X,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  color?: string;
}

interface SortOption {
  id: string;
  label: string;
  value: string;
}

interface SelectionPanelProps {
  title?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  // Filter options
  filterOptions?: FilterOption[];
  selectedFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  
  // Sort options
  sortOptions?: SortOption[];
  selectedSort?: string;
  onSortChange?: (sort: string) => void;
  sortDirection?: 'asc' | 'desc';
  onSortDirectionChange?: (direction: 'asc' | 'desc') => void;
  
  // View options
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  
  // Results info
  totalResults?: number;
  showingResults?: number;
  
  className?: string;
}

export default function SelectionPanel({
  title = "Browse Items",
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filterOptions = [],
  selectedFilters = [],
  onFilterChange,
  sortOptions = [],
  selectedSort = "",
  onSortChange,
  sortDirection = 'asc',
  onSortDirectionChange,
  viewMode = 'grid',
  onViewModeChange,
  totalResults,
  showingResults,
  className = ""
}: SelectionPanelProps) {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value);
    onSearchChange?.(value);
  };

  const clearSearch = () => {
    setLocalSearchValue("");
    onSearchChange?.("");
  };

  const toggleFilter = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(f => f !== filterId)
      : [...selectedFilters, filterId];
    onFilterChange?.(newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange?.([]);
  };

  return (
    <div className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border rounded-lg p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {(totalResults !== undefined || showingResults !== undefined) && (
            <p className="text-sm text-muted-foreground">
              {showingResults !== undefined && totalResults !== undefined 
                ? `Showing ${showingResults} of ${totalResults} results`
                : totalResults !== undefined 
                ? `${totalResults} results`
                : `${showingResults} items`
              }
            </p>
          )}
        </div>
        
        {/* View Mode Toggle */}
        {onViewModeChange && (
          <div className="flex items-center space-x-1 bg-muted rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={localSearchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {localSearchValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filters */}
        {filterOptions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-1">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {selectedFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedFilters.length}
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center justify-between">
                Filter by
                {selectedFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.id}
                  checked={selectedFilters.includes(option.id)}
                  onCheckedChange={() => toggleFilter(option.id)}
                  className="flex items-center space-x-2"
                >
                  {option.color && (
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                  <span>{option.label}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Sort */}
        {sortOptions.length > 0 && (
          <div className="flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-1">
                  <span>Sort</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => onSortChange?.(option.value)}
                    className={selectedSort === option.value ? 'bg-muted' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {onSortDirectionChange && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="h-9 w-9 p-0"
              >
                {sortDirection === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedFilters.map((filterId) => {
            const filter = filterOptions.find(f => f.id === filterId);
            if (!filter) return null;
            
            return (
              <Badge
                key={filterId}
                variant="secondary"
                className="flex items-center space-x-1 cursor-pointer hover:bg-muted-foreground/20"
                onClick={() => toggleFilter(filterId)}
              >
                {filter.color && (
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: filter.color }}
                  />
                )}
                <span>{filter.label}</span>
                <X className="h-3 w-3 hover:text-destructive" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
