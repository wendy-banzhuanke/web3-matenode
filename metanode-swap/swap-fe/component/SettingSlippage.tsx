import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Icon,
  Popover,
  InputAdornment,
  OutlinedInput,
  FormHelperText,
  FormControl,
  InputLabel
} from "@mui/material";

export default function SettingSlippage({slippage, setSlippage}: {slippage: number, setSlippage: (slippage: number) => void}) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
//   const [slippage, setSlippage] = useState(5.5);

  const open = Boolean(anchorEl);
  const popoverId = open ? "simple-popover" : undefined;

  const handleOpenPopoverClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAutoSlippage = () => {
    setSlippage(5.5);
  };

    const handleSlippageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSlippage(Number(event.target.value));
    };

  return (
    <div className="relative">
      <Icon
        aria-describedby={popoverId}
        className="text-green-700 text-2xl"
        onClick={handleOpenPopoverClick}
      >
        settings
      </Icon>
      <Popover
        id={popoverId}
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Typography sx={{ p: 2 }} className="flex justify-between items-center">
          <Button onClick={handleAutoSlippage} variant={slippage == 5.5 ? "contained" : "outlined"}>Auto</Button>
          <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">
              Slippage
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type="number"
              endAdornment={<InputAdornment position="end">%</InputAdornment>}
              label="Slippage"
              value={slippage}
              onChange={handleSlippageChange}
            />
          </FormControl>
        </Typography>
      </Popover>
    </div>
  );
}
