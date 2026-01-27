"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface LoanSliderProps {
  label: string;
  helper: string;
  min: number;
  max: number;
  step: number;
  defaultValue?: number;
  format: "currency" | "percentage" | "months";
  value: number | null;
  displayPlaceholder?: number; // shown until user sets a value
  onChange: (value: number) => void;
  disabled?: boolean;
  customMin?: number; // Custom minimum for validation (e.g., outstanding balance can't be below original loan)
  customMax?: number; // Custom maximum for validation (e.g., outstanding balance can't exceed 20 crores)
  showWarning?: boolean; // Whether to show validation warnings
}

export default function LoanSlider({
  label,
  helper,
  min,
  max,
  step,
  defaultValue,
  format,
  value,
  displayPlaceholder,
  onChange,
  disabled = false,
  customMin,
  customMax,
  showWarning = false,
}: LoanSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSet = value !== null && value !== undefined;
  const fallbackValue = displayPlaceholder ?? defaultValue ?? min;
  const rawSliderValue = isSet ? value : fallbackValue;
  const sliderValue = Math.max(min, Math.min(max, rawSliderValue));

  // Validation thresholds
  const effectiveMin = customMin !== undefined ? customMin : min;
  const effectiveMax = customMax !== undefined ? customMax : max;

  const formatValue = (val: number): string => {
    if (format === "currency") {
      return `₹${val.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      })}`;
    } else if (format === "percentage") {
      return `${val.toFixed(1)}%`;
    } else if (format === "months") {
      const years = Math.floor(val / 12);
      if (years === 0) {
        return `${val} months`;
      } else if (val % 12 === 0) {
        return `${years} ${years === 1 ? "year" : "years"}`;
      } else {
        return `${years} ${years === 1 ? "year" : "years"}`;
      }
    }
    return val.toString();
  };

  // Parse input value based on format - only numbers
  const parseInputValue = (input: string): number => {
    if (format === "currency") {
      // Remove ₹, commas, spaces - only allow digits
      const cleaned = input.replace(/[₹,\s]/g, "").replace(/[^\d]/g, "");
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    } else if (format === "percentage") {
      // Remove % and parse - allow decimals
      const cleaned = input.replace(/[%\s]/g, "").replace(/[^\d.]/g, "");
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    } else if (format === "months") {
      // Extract number from input (could be "24 months" or "2 years")
      const match = input.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        // If input contains "year", convert to months
        if (input.toLowerCase().includes("year")) {
          return num * 12;
        }
        return num;
      }
      return 0;
    }
    // Only digits for other formats
    const cleaned = input.replace(/[^\d]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Get raw numeric value for input (without formatting)
  const getRawValue = (val: number): string => {
    if (format === "currency") {
      // Return number without currency symbol for easier editing
      return Math.round(val).toString();
    } else if (format === "percentage") {
      return val.toFixed(1);
    } else if (format === "months") {
      return val.toString();
    }
    return val.toString();
  };

  // Handle click on value display
  const handleValueClick = () => {
    if (!disabled) {
      setIsEditing(true);
      setInputValue(getRawValue(sliderValue));
    }
  };

  // Handle input change - only allow numbers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // For currency and months, only allow digits
    if (format === "currency" || format === "months") {
      newValue = newValue.replace(/[^\d]/g, "");
    } else if (format === "percentage") {
      // Allow digits and one decimal point
      newValue = newValue.replace(/[^\d.]/g, "");
      // Ensure only one decimal point
      const parts = newValue.split(".");
      if (parts.length > 2) {
        newValue = parts[0] + "." + parts.slice(1).join("");
      }
    }
    
    setInputValue(newValue);
    
    // Real-time validation warning
    if (showWarning && newValue) {
      const parsed = parseInputValue(newValue);
      if (parsed < effectiveMin) {
        setWarning("Too low");
      } else if (parsed > effectiveMax) {
        setWarning("Too high");
      } else {
        setWarning(null);
      }
    }
  };

  // Handle input blur (when user clicks away)
  const handleInputBlur = () => {
    const raw = inputValue.trim();

    // If user cleared input, don't change the current value
    if (!raw) {
      setIsEditing(false);
      setWarning(null);
      return;
    }

    // Detect truly invalid (no digits) vs legitimate 0
    const hasAnyDigits =
      format === "percentage"
        ? raw.replace(/[^\d.]/g, "") !== "" && raw.replace(/[^\d.]/g, "") !== "."
        : raw.replace(/[^\d]/g, "") !== "";
    if (!hasAnyDigits) {
      setIsEditing(false);
      setWarning(null);
      return;
    }

    const parsedValue = parseInputValue(raw);
    if (!Number.isFinite(parsedValue)) {
      setIsEditing(false);
      setWarning(null);
      return;
    }

    // Clamp to min/max, but DO NOT round to step (manual entry must be exact)
    let clampedValue = Math.max(effectiveMin, Math.min(effectiveMax, parsedValue));

    // Keep integer for currency / months
    if (format === "currency" || format === "months") {
      clampedValue = Math.trunc(clampedValue);
    }

    onChange(clampedValue);
    setIsEditing(false);
    setWarning(null);
  };

  // Handle Enter key
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(getRawValue(sliderValue));
      setWarning(null);
    }
  };

  // Check for validation warnings on value change
  useEffect(() => {
    // Don't show warnings until the user actually sets a value
    if (!showWarning || !isSet) {
      setWarning(null);
      return;
    }

    {
      // For outstanding balance: check if below original loan (customMin) or above 20 crores
      if (customMin !== undefined && sliderValue < customMin) {
        setWarning("Too low");
      } else if (customMax !== undefined && sliderValue > customMax) {
        setWarning("Too high");
      } else if (sliderValue < effectiveMin) {
        setWarning("Too low");
      } else if (sliderValue > effectiveMax) {
        setWarning("Too high");
      } else {
        setWarning(null);
      }
    }
  }, [isSet, sliderValue, effectiveMin, effectiveMax, customMin, customMax, showWarning]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const percentage = ((sliderValue - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Label */}
      <label className="text-sm font-semibold text-[#5B4B8A] mb-2 block">
        {label}
      </label>

      {/* Slider Container */}
      <div className="relative flex-1 flex flex-col justify-center">
        {/* Slider Track */}
        <div className="relative h-2 rounded-full bg-[#EBE8FC] mb-3">
          {/* Filled Portion */}
          <motion.div
            className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-[#B19CD7] to-[#9678CD]"
            style={{ width: `${percentage}%` }}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.1 }}
          />

          {/* Slider Input - Invisible but functional */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={sliderValue}
            onChange={(e) => onChange(Number(e.target.value))}
            onMouseDown={() => {
              setIsDragging(true);
              setShowTooltip(true);
            }}
            onMouseUp={() => {
              setIsDragging(false);
              setShowTooltip(false);
            }}
            onMouseMove={() => {
              if (isDragging) {
                setShowTooltip(true);
              }
            }}
            onMouseLeave={() => {
              setIsDragging(false);
              setShowTooltip(false);
            }}
            onTouchStart={() => {
              setIsDragging(true);
              setShowTooltip(true);
            }}
            onTouchEnd={() => {
              setIsDragging(false);
              setShowTooltip(false);
            }}
            disabled={disabled}
            className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed z-30"
            style={{
              WebkitAppearance: "none",
              appearance: "none",
              background: "transparent",
            }}
          />

          {/* Custom Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-md border-2 border-[#B19CD7] pointer-events-none z-20 flex items-center justify-center"
            style={{
              left: `calc(${percentage}% - 10px)`,
              boxShadow: isDragging
                ? "0 0 12px rgba(177, 156, 215, 0.5)"
                : "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
            animate={{
              scale: isDragging ? 1.1 : 1,
            }}
            transition={{ duration: 0.1 }}
          >
            {/* Thumb icon - varies by format */}
            <span className="text-[10px] font-extrabold text-[#7C5CBF] leading-none select-none">
              {format === "currency" ? "₹" : format === "percentage" ? "%" : "M"}
            </span>
            {/* Tooltip */}
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: -5 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#5B4B8A] text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-lg pointer-events-none"
              >
                {formatValue(sliderValue)}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#5B4B8A]"></div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Current Value Display - Centered */}
        <div className="flex flex-col items-center">
          <div className="flex justify-center items-center gap-2">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className={`text-base font-bold tabular-nums bg-white border-2 rounded px-2 py-1 text-center w-32 focus:outline-none focus:ring-2 ${
                  warning
                    ? "text-red-600 border-red-400 focus:ring-red-400/20"
                    : "text-[#5B4B8A] border-[#B19CD7] focus:ring-[#B19CD7]/20"
                }`}
                placeholder={getRawValue(sliderValue)}
              />
            ) : (
              <span
                onClick={handleValueClick}
                className={`text-base tabular-nums transition-colors px-2 py-1 rounded ${
                  isSet ? "cursor-pointer hover:bg-purple-50" : "cursor-default"
                } ${
                  warning
                    ? "text-red-600"
                    : isSet
                      ? "font-bold text-[#5B4B8A] hover:text-[#7C5CBF]"
                      : "font-semibold text-[#8E7BB8]"
                }`}
                title="Click to edit manually"
              >
                {formatValue(sliderValue)}
              </span>
            )}
          </div>
          {/* Warning Message */}
          {warning && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-red-600 font-medium mt-1"
            >
              {warning}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
