// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

interface IERC20 {
    event Transfer(address from, address to, uint256 amount);
    event Approval(address owner, address spender, uint256 value);

    function totalSupply() external returns(uint256);
    function balanceOf(address account) external returns(uint256);
    function transfer(address to, uint256 amount) external returns(bool);
    function allowance(address owner, address spender) external returns(uint256);
    function approve(address spender, uint256 amount) external returns(bool);
    function transferFrom(address from, address to, uint256 amount) external returns(bool);
}