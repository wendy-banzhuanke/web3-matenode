// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract EventSolidity1 {
    event Transfer(address indexed from, address indexed to, uint256 value);

    mapping(address => uint256) _balances;

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) external {

        _balances[from] = 1; // give some initial tokens to transfer address

        _balances[from] -=  amount; // "from" address minus the number of transfer
        _balances[to] += amount; // "to" address adds the number of transfer

        // emit event
        emit Transfer(from, to, amount);
    }
}