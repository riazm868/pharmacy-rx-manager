import React, { useState, useEffect, useRef } from 'react';
import { useCombobox } from 'downshift';

type AutocompleteWithAddProps<T> = {
  items: T[];
  itemToString: (item: T | null) => string;
  onInputValueChange: (inputValue: string) => void;
  onSelectedItemChange: (selectedItem: T | null) => void;
  onAddNew: () => void;
  label: string;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  selectedItem?: T | null;
};

export default function AutocompleteWithAdd<T>({
  items,
  itemToString,
  onInputValueChange,
  onSelectedItemChange,
  onAddNew,
  label,
  placeholder = 'Search...',
  isLoading = false,
  disabled = false,
  className = '',
  selectedItem = null,
}: AutocompleteWithAddProps<T>) {
  const [inputItems, setInputItems] = useState(items);
  const [showAddNew, setShowAddNew] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setInputItems(items);
    setShowAddNew(items.length === 0);
  }, [items]);

  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: inputItems,
    itemToString,
    initialSelectedItem: selectedItem,
    selectedItem: selectedItem,
    onInputValueChange: ({ inputValue }) => {
      onInputValueChange(inputValue || '');
      setShowAddNew(true);
    },
    onSelectedItemChange: ({ selectedItem }) => {
      onSelectedItemChange(selectedItem || null);
    },
  });

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          {...getInputProps()}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          type="button"
          {...getToggleButtonProps()}
          aria-label="toggle menu"
          className="absolute inset-y-0 right-0 flex items-center pr-2"
          disabled={disabled}
        >
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <ul
        {...getMenuProps({ ref: listRef })}
        className={`absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm ${
          !isOpen && 'hidden'
        }`}
      >
        {isOpen && (
          <>
            {isLoading ? (
              <li className="py-2 px-3 text-gray-500">Loading...</li>
            ) : (
              <>
                {inputItems.map((item, index) => (
                  <li
                    key={`${index}-${itemToString(item)}`}
                    {...getItemProps({ item, index })}
                    className={`cursor-default select-none relative py-2 pl-3 pr-9 ${
                      highlightedIndex === index
                        ? 'text-white bg-indigo-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {itemToString(item)}
                  </li>
                ))}
                {showAddNew && (
                  <li
                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                      highlightedIndex === inputItems.length
                        ? 'text-white bg-indigo-600'
                        : 'text-indigo-600 font-medium'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAddNew();
                    }}
                  >
                    <div className="flex items-center">
                      <svg
                        className="mr-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add New
                    </div>
                  </li>
                )}
              </>
            )}
          </>
        )}
      </ul>
    </div>
  );
}
