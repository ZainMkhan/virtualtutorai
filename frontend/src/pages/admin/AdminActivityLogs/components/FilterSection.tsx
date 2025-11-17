import React from 'react';
import type { ActivityLogsFilterParams } from '../types';
import { ACTION_TYPES, RESOURCE_TYPES } from '../types';

interface FilterSectionProps {
  filters: ActivityLogsFilterParams;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}) => {
  return (
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Action Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action
          </label>
          <select
            name="action"
            value={filters.action || ''}
            onChange={onFilterChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            {ACTION_TYPES.map(action => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resource Type
          </label>
          <select
            name="resource_type"
            value={filters.resource_type || ''}
            onChange={onFilterChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Resources</option>
            {RESOURCE_TYPES.map(type => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* User ID Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User ID
          </label>
          <input
            type="text"
            name="user_id"
            value={filters.user_id || ''}
            onChange={onFilterChange}
            placeholder="Enter user ID"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Start Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={filters.start_date || ''}
            onChange={onFilterChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={filters.end_date || ''}
            onChange={onFilterChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Clear Filters
        </button>
        <button
          onClick={onApplyFilters}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterSection;
