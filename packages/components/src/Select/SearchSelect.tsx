import { useState } from 'react';
import {
  Combobox,
  Input,
  InputBase,
  useCombobox,
  type ComboboxProps,
} from '@mantine/core';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import clsx from 'clsx';

export interface SearchSelectOption {
  value: string;
  label: string;
}

export interface SearchSelectProps {
  /** The options to choose from. */
  data: SearchSelectOption[];
  /** The selected value (controlled). */
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  /** Placeholder for the in-dropdown search box. Default "Search". */
  searchPlaceholder?: string;
  /** Message when the search matches nothing. Default "Nothing found". */
  nothingFound?: string;
  disabled?: boolean;
  comboboxProps?: ComboboxProps;
  className?: string;
}

/**
 * SearchSelect is a single-choice select whose search lives INSIDE the open
 * dropdown (a magnifier search row above the options), not in the trigger. The
 * trigger shows the current selection; opening reveals the search and the
 * filtered, scrollable list, each option with the emerald check when selected.
 * Use it for long lists (countries, models) where typing to filter matters.
 */
export function SearchSelect({
  data,
  value,
  onChange,
  label,
  placeholder = 'Pick one',
  searchPlaceholder = 'Search',
  nothingFound = 'Nothing found',
  disabled,
  comboboxProps,
  className,
}: SearchSelectProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.focusSearchInput(),
  });
  const [search, setSearch] = useState('');

  const selected = data.find((d) => d.value === value);
  const filtered = data.filter((d) =>
    d.label.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Combobox
      store={combobox}
      withinPortal
      {...comboboxProps}
      onOptionSubmit={(val) => {
        onChange(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          label={label}
          disabled={disabled}
          className={clsx('upmo-searchselect', className)}
          classNames={{ input: 'upmo-input' }}
          rightSection={<IconChevronDown size={16} />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
        >
          {selected ? (
            selected.label
          ) : (
            <Input.Placeholder>{placeholder}</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder={searchPlaceholder}
          leftSection={<IconSearch size={16} />}
        />
        <Combobox.Options mah={280} style={{ overflowY: 'auto' }}>
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <Combobox.Option value={opt.value} key={opt.value} active={opt.value === value}>
                {opt.label}
              </Combobox.Option>
            ))
          ) : (
            <Combobox.Empty>{nothingFound}</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
