import { useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Token } from "@/types/index"; // 定义你的Token类型

export default function TokenSelect({
  label,
  value,
  onChange,
  tokens,
}: {
  label: string;
  value: string;
  onChange: (event: SelectChangeEvent) => void;
  tokens: Token[];
}) {
  return (
    <FormControl sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id={`token-select-label-${label}`}>{label}</InputLabel>
      <Select
        labelId={`token-select-label-${label}`}
        id={`token-select-${label}`}
        value={value}
        label={label}
        onChange={onChange}
      >
        {tokens.map((token) => (
          <MenuItem key={token.address} value={token.address}>
            {token.symbol}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
