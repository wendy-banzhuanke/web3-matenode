// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract SelectorDemo {
    event Log(bytes data, address _addr);
    event Transfer(address addr, uint256 num);

    function mint(address to) external  {
        emit Log(msg.data, to);
    }

    function mintSelector() external pure returns(bytes4 selector) {
        selector = bytes4(keccak256("transfer(address, uint256)"));
    }

    function callWithSignature() external returns(bool, bytes memory){
         (bool success, bytes memory data) = address(this).call(abi.encodeWithSelector(0x6a627842, "0x2c44b726ADF1963cA47Af88B284C06f30380fC78"));
         return(success, data);
     }

    function transfer(address recipient, uint amount) external returns (bool) {
        // balanceOf[msg.sender] -= amount;
        // balanceOf[recipient] += amount;
        emit Transfer(recipient, amount);
        return true;
    }
}