import React, { useState, useEffect, useCallback } from "react";
import { TextField } from "@shopify/polaris";
import { debounce } from "lodash";

interface CommissionInputProps {
  initialCommissionPercent: number;
  productId: string;
  onCommissionChange: (value: string, productId: string) => void;
}

const CommissionInput: React.FC<CommissionInputProps> = ({
  initialCommissionPercent,
  productId,
  onCommissionChange,
}) => {
  // Initialize state with the initialCommissionPercent prop
  const [commissionPercent, setCommissionPercent] = useState(
    initialCommissionPercent.toString()
  );

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((value: string, id: string) => {
      onCommissionChange(value, id);
    }, 2500),
    [onCommissionChange]
  );

  useEffect(() => {
    // Directly update the state to reflect new prop value
    setCommissionPercent(initialCommissionPercent.toString());
  }, [initialCommissionPercent]);

  const handleChange = (newValue: string) => {
    setCommissionPercent(newValue);
    // Only call the debounced update function on user input
    debouncedUpdate(newValue, productId);
  };

  return (
    <TextField
      label=""
      value={commissionPercent}
      onChange={(newValue) => handleChange(newValue)}
      type="number"
      min={0}
      max={100}
      suffix="%"
      autoComplete="off"
    />
  );
};

export default CommissionInput;
