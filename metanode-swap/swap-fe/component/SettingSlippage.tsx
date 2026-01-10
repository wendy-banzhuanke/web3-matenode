import React from "react";
import {
  Button,
  Typography,
  Icon,
  Popover,
  InputAdornment,
  OutlinedInput,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function SettingSlippage({
  slippage,
  setSlippage,
}: {
  slippage: number;
  setSlippage: (slippage: number) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const open = Boolean(anchorEl);
  const popoverId = open ? "simple-popover" : undefined;

  const handleOpenPopoverClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (!slippage) {
      setSlippage(5.5);
    }
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
        <div className="flex justify-between items-center p-2">
          <Button
            onClick={handleAutoSlippage}
            variant={slippage == 5.5 ? "contained" : "outlined"}
          >
            Auto
          </Button>
          <FormControl sx={{ m: 1, width: "15ch" }} variant="outlined">
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
              onBlur={() => {
                const formattedValue = parseFloat(slippage.toString());
                if (isNaN(formattedValue)) {
                    setSlippage(5.5); // 默认滑点
                    return;
                }

                const _slippageStr = slippage.toString()
                // "5." -> "5.00"
                if (_slippageStr && !_slippageStr.includes('.')) {
                    // setSlippage(`${slippage}.00`);
                    setSlippage(Number(formattedValue.toFixed(2)));
                }
              }}
            />
          </FormControl>
        </div>
      </Popover>
    </div>
  );
}
