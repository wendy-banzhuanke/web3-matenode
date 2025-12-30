// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./libraries/SqrtPriceMath.sol";
import "./libraries/TickMath.sol";
import "./libraries/LiquidityMath.sol";
import "./libraries/LowGasSafeMath.sol";
import "./libraries/SafeCast.sol";
import "./libraries/TransferHelper.sol";
import "./libraries/SwapMath.sol";
import "./libraries/FixedPoint128.sol";

import "./interfaces/IPool.sol";
import "./interfaces/IFactory.sol";

contract Pool is IPool { 
  using SafeCast for uint256;
  using LowGasSafeMath for int256;
  using LowGasSafeMath for uint256;

  address public immutable override factory;
  address public immutable override token0;
  address public immutable override token1;
  uint24 public immutable override fee;
  int24 public immutable override tickLower;
  int24 public immutable override tickUpper;

  uint160 public override sqrtPriceX96;
  int24 public override tick;
  uint128 public override liquidity;

  uint256 public override feeGrowthGlobal0X128;
  uint256 public override feeGrowthGlobal1X128;

  struct Position {
    uint128 liquidity;
    uint128 tokensOwed0;
    uint128 tokensOwed1;
    uint256 feeGrowthInside0LastX128;
    uint256 feeGrowthInside1LastX128;
  }

  mapping(address => Position) public positions;

  struct ModifyPositionParams {
    address owner;
    int128 liquidityDelta;
  }

  struct SwapState {
    int256 amountSpecifiedRemaining;
    int256 amountCalculated;
    uint160 sqrtPriceX96;
    uint256 feeGrowthGlobalX128;
    uint256 amountIn;
    uint256 amountOut;
    uint256 feeAmount;
  }

  function getPosition(address owner) external view override returns (
    uint128 _liquidity,
    uint256 feeGrowthInside0LastX128,
    uint256 feeGrowthInside1LastX128,
    uint128 tokensOwed0,
    uint128 tokensOwed1
  ) {
    return (
      positions[owner].liquidity,
      positions[owner].feeGrowthInside0LastX128,
      positions[owner].feeGrowthInside1LastX128,
      positions[owner].tokensOwed0,
      positions[owner].tokensOwed1
    );
  }

  function initialize(uint160 sqrtPriceX96_) external override {
    require(sqrtPriceX96 == 0, "INITIALIZE");
    
    tick = TickMath.getTickAtSqrtPrice(sqrtPriceX96_);

    require(tick >= tickLower && tick < tickUpper, "sqrtPriceX96 should be within the range of [tickLower, tickUpper");

    sqrtPriceX96 = sqrtPriceX96_;
  }

  function _modifyPosition(ModifyPositionParams memory params) private returns(int256 amount0, int256 amount1) {
    amount0 = SqrtPriceMath.getAmount0Delta(sqrtPriceX96, TickMath.getSqrtPriceAtTick(tickUpper), params.liquidityDelta);

    amount1 = SqrtPriceMath.getAmount1Delta(sqrtPriceX96, TickMath.getSqrtPriceAtTick(tickLower), params.liquidityDelta);

    Position storage position = positions[params.owner];

    uint128 tokensOwed0 = uint128(
      FullMath.mulDiv(
        feeGrowthGlobal0X128 - position.feeGrowthInside0LastX128,
        position.liquidity,
        FixedPoint128.Q128
      )
    );

    uint128 tokensOwed1 = uint128(
      FullMath.mulDiv(
        feeGrowthGlobal1X128 - position.feeGrowthInside1LastX128,
        position.liquidity,
        FixedPoint128.Q128
      )
    );

    position.feeGrowthInside0LastX128 = feeGrowthGlobal0X128;
    position.feeGrowthInside1LastX128 = feeGrowthGlobal1X128;

    if (tokensOwed0 > 0 || tokensOwed1 > 0) {
      position.tokensOwed0 += tokensOwed0;
      position.tokensOwed1 += tokensOwed1;
    }

    liquidity = LiquidityMath.addDelta(liquidity, params.liquidityDelta);
    position.liquidity = LiquidityMath.addDelta(
      position.liquidity,
      params.liquidityDelta
    );
  }

  function balance0() private view returns (uint256) {
    (bool success, bytes memory data) = token0.staticcall(abi.encodeWithSelector(IERC20.balanceOf.selector, address(this)));

    require(success && data.length >= 32);
    return abi.decode(data, (uint256));
  }

  function balance1() private view returns (uint256) {
    (bool success, bytes memory data) = token1.staticcall(abi.encodeWithSelector(IERC20.balanceOf.selector, address(this)));

    require(success && data.length >= 32);
    return abi.decode(data, (uint256));
  }

  function mint(address recipient, uint128 amount, bytes calldata data) external override returns (uint256 amount0, uint256 amount1) { 
    require(amount > 0, "Mint amount must be greater than 0");

    (int256 amount0Int, int256 amount1Int) = _modifyPosition(
      ModifyPositionParams({
        owner: recipient,
        liquidityDelta: int128(amount)
      })
    );

    amount0 = uint256(amount0Int);
    amount1 = uint256(amount1Int);

    uint256 balance0Before;
    uint256 balance1Before;

    if(amount0 > 0) balance0Before = balance0();
    if(amount1 > 0) balance1Before = balance1();

    // 回调 mintCallback
    IMintCallback(msg.sender).mintCallback(amount0, amount1, data);

    if(amount0 > 0) require(balance0Before.add(amount0) <= balance0(), "Mint amount0 overflow");
    if(amount1 > 0) require(balance1Before.add(amount1) <= balance1(), "Mint amount1 overflow");

    emit Mint(msg.sender, recipient, amount, amount0, amount1);
  }

  function collect(address recipient, uint128 amount0Requested, uint128 amount1Requested) external override returns (uint128 amount0, uint128 amount1) { 
    Position storage position = positions[msg.sender];

    amount0 = amount0Requested > position.tokensOwed0 ? position.tokensOwed0 : amount0Requested;
    amount1 = amount1Requested > position.tokensOwed1 ? position.tokensOwed1 : amount1Requested;

    if(amount0 > 0) {
      position.tokensOwed0 -= amount0;
      TransferHelper.safeTransfer(token0, recipient, amount0);
    }

    if(amount1 > 0) {
      position.tokensOwed1 -= amount1;
      TransferHelper.safeTransfer(token1, recipient, amount1);
    }

    emit Collect(msg.sender, recipient, amount0, amount1);
  }

  function burn(uint128 amount) external override returns (uint256 amount0, uint256 amount1) { 
    require(amount > 0, "Burn amount must be greater than 0");
    require(amount <= positions[msg.sender].liquidity, "Burn amount exceeds liquidity");

    (int256 amount0Int, int256 amount1Int) = _modifyPosition(
      ModifyPositionParams({
        owner: msg.sender,
        liquidityDelta: -int128(liquidity)
      })
    );

    amount0 = uint256(-amount0Int);
    amount1 = uint256(-amount1Int);

    if(amount0 > 0 || amount1 > 0) {
      (positions[msg.sender].tokensOwed0, positions[msg.sender].tokensOwed1) = (
        positions[msg.sender].tokensOwed0 + uint128(amount0),
        positions[msg.sender].tokensOwed1 + uint128(amount1)
      );
    }

    emit Burn(msg.sender, amount, amount0, amount1);
  }

  function swap(
    address recipient,
    bool zeroForOne,
    int256 amountSpecified,
    uint160 sqrtPriceLimitX96,
    bytes calldata data
  ) external override returns (int256 amount0, int256 amount1) {
    require(amountSpecified != 0, "AS");

    // zeroForOne: 如果从 token0 交换 token1 则为 true，从 token1 交换 token0 则为 false
    // 判断当前价格是否满足交易的条件
    require(
        zeroForOne
            ? sqrtPriceLimitX96 < sqrtPriceX96 &&
                sqrtPriceLimitX96 > TickMath.MIN_SQRT_PRICE
            : sqrtPriceLimitX96 > sqrtPriceX96 &&
                sqrtPriceLimitX96 < TickMath.MAX_SQRT_PRICE,
        "SPL"
    );

    // amountSpecified 大于 0 代表用户指定了 token0 的数量，小于 0 代表用户指定了 token1 的数量
    bool exactInput = amountSpecified > 0;

    SwapState memory state = SwapState({
        amountSpecifiedRemaining: amountSpecified,
        amountCalculated: 0,
        sqrtPriceX96: sqrtPriceX96,
        feeGrowthGlobalX128: zeroForOne
            ? feeGrowthGlobal0X128
            : feeGrowthGlobal1X128,
        amountIn: 0,
        amountOut: 0,
        feeAmount: 0
    });

    // 计算交易的上下限，基于 tick 计算价格
    uint160 sqrtPriceX96Lower = TickMath.getSqrtPriceAtTick(tickLower);
    uint160 sqrtPriceX96Upper = TickMath.getSqrtPriceAtTick(tickUpper);
    // 计算用户交易价格的限制，如果是 zeroForOne 是 true，说明用户会换入 token0，会压低 token0 的价格（也就是池子的价格），所以要限制最低价格不能超过 sqrtPriceX96Lower
    uint160 sqrtPriceX96PoolLimit = zeroForOne
        ? sqrtPriceX96Lower
        : sqrtPriceX96Upper;

    // 计算交易的具体数值
    (
        state.sqrtPriceX96,
        state.amountIn,
        state.amountOut,
        state.feeAmount
    ) = SwapMath.computeSwapStep(
        sqrtPriceX96,
        (
            zeroForOne
                ? sqrtPriceX96PoolLimit < sqrtPriceLimitX96
                : sqrtPriceX96PoolLimit > sqrtPriceLimitX96
        )
            ? sqrtPriceLimitX96
            : sqrtPriceX96PoolLimit,
        liquidity,
        amountSpecified,
        fee
    );

    // 更新新的价格
    sqrtPriceX96 = state.sqrtPriceX96;
    tick = TickMath.getTickAtSqrtPrice(state.sqrtPriceX96);

    // 计算手续费
    state.feeGrowthGlobalX128 += FullMath.mulDiv(
        state.feeAmount,
        FixedPoint128.Q128,
        liquidity
    );

    // 更新手续费相关信息
    if (zeroForOne) {
        feeGrowthGlobal0X128 = state.feeGrowthGlobalX128;
    } else {
        feeGrowthGlobal1X128 = state.feeGrowthGlobalX128;
    }

    // 计算交易后用户手里的 token0 和 token1 的数量
    if (exactInput) {
        state.amountSpecifiedRemaining -= (state.amountIn + state.feeAmount)
            .toInt256();
        state.amountCalculated = state.amountCalculated.sub(
            state.amountOut.toInt256()
        );
    } else {
        state.amountSpecifiedRemaining += state.amountOut.toInt256();
        state.amountCalculated = state.amountCalculated.add(
            (state.amountIn + state.feeAmount).toInt256()
        );
    }

    (amount0, amount1) = zeroForOne == exactInput
        ? (
            amountSpecified - state.amountSpecifiedRemaining,
            state.amountCalculated
        )
        : (
            state.amountCalculated,
            amountSpecified - state.amountSpecifiedRemaining
        );

    if (zeroForOne) {
        // callback 中需要给 Pool 转入 token
        uint256 balance0Before = balance0();
        ISwapCallback(msg.sender).swapCallback(amount0, amount1, data);
        require(balance0Before.add(uint256(amount0)) <= balance0(), "IIA");

        // 转 Token 给用户
        if (amount1 < 0)
            TransferHelper.safeTransfer(
                token1,
                recipient,
                uint256(-amount1)
            );
    } else {
        // callback 中需要给 Pool 转入 token
        uint256 balance1Before = balance1();
        ISwapCallback(msg.sender).swapCallback(amount0, amount1, data);
        require(balance1Before.add(uint256(amount1)) <= balance1(), "IIA");

        // 转 Token 给用户
        if (amount0 < 0)
            TransferHelper.safeTransfer(
                token0,
                recipient,
                uint256(-amount0)
            );
    }

    emit Swap(msg.sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick);
  }
}