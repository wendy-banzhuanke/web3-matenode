// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract OwnerSolidity {
    address public owner;
    constructor() {
        owner = msg.sender;
    }

    modifier onlyOnwer {
        require(msg.sender != owner);
        _;
    }

    function changeOwner(address newOwner) external onlyOnwer {
        owner = newOwner;
    }
}