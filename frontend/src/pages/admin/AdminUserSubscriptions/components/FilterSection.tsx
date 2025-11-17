import React from 'react';
import type { SubscriptionFilters } from '../types';

interface FilterSectionProps {
  filters: SubscriptionFilters;
  onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onApply: () => void;
  onClear: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onFilterChange,
  onApply,
  onClear
}) => {
  return (
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={onFilterChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Tier Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subscription Status
          </label>
          <select
            name="tier_id"
            value={filters.tier_id}
            onChange={onFilterChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tiers</option>
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
            <option value="past_due">Past Due</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Clear Filters
        </button>
        <button
          onClick={onApply}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterSection;
