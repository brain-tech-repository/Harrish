"use client";
import React, { useEffect, useRef, useState } from "react";

export type Option = {
  value: string;
  label: string;
  [key: string]: any;
};

type Props = {
  placeholder?: string;
  /** Called when user types. Should return a Promise resolving to an array of Option */
  onSearch: (query: string) => Promise<Option[]>;
  /** Called when the user clicks or selects an option */
  onSelect: (option: Option) => void;
  minSearchLength?: number;
  debounceMs?: number;
  className?: string;
  initialValue?: string;
  renderOption?: (opt: Option) => React.ReactNode;
  noOptionsMessage?: string;
};

export default function AutoSuggestion({
  placeholder = "Search...",
  onSearch,
  onSelect,
  minSearchLength = 1,
  debounceMs = 300,
  className = "w-full",
  initialValue = "",
  renderOption,
  noOptionsMessage = "No options",
}: Props) {
  const [query, setQuery] = useState(initialValue);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if ((query ?? "").length < minSearchLength) {
      setOptions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      (async () => {
        try {
          const res = await onSearch(query);
          setOptions(Array.isArray(res) ? res : []);
          setOpen(true);
          setHighlight(-1);
        } catch (err) {
          setOptions([]);
          setOpen(true);
          setHighlight(-1);
          // swallow error (caller can surface)
        } finally {
          setLoading(false);
        }
      })();
    }, debounceMs);
  }, [query, debounceMs, minSearchLength, onSearch]);

  // click outside to close
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && e.target instanceof Node && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown") {
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && highlight < options.length) {
        const opt = options[highlight];
        selectOption(opt);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selectOption = (opt: Option) => {
    setQuery(opt.label);
    setOpen(false);
    setOptions([]);
    setHighlight(-1);
    try {
      onSelect(opt);
    } catch (err) {
      // ignore
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        className="w-full border h-[44px] rounded-md px-3 text-sm outline-none"
        placeholder={placeholder}
        value={query}
        onChange={e => { setQuery(e.target.value); }}
        onFocus={() => { if (options.length > 0) setOpen(true); }}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-haspopup="listbox"
      />

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">{noOptionsMessage}</div>
          ) : (
            options.map((opt, idx) => (
              <div
                key={`${opt.value}-${idx}`}
                role="option"
                aria-selected={highlight === idx}
                onMouseDown={e => { e.preventDefault(); /* prevent blur before click */ selectOption(opt); }}
                onMouseEnter={() => setHighlight(idx)}
                className={`px-3 py-2 cursor-pointer ${highlight === idx ? "bg-gray-100" : "hover:bg-gray-50"}`}
              >
                {renderOption ? renderOption(opt) : <div className="text-sm text-gray-800">{opt.label}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
