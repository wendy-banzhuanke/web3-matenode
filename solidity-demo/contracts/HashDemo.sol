// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract HashDemo {
    bytes32 public _msg = keccak256(abi.encodePacked("0xAA"));

    function hash(string memory _str, uint _num, address _addr) external pure returns(bytes32) {
        return keccak256(abi.encodePacked(_str, _num, _addr));
    }

    function weak (string memory str1) public view returns(bool) {
        return keccak256(abi.encodePacked(str1)) == _msg;
    }

    function strong(string memory str1, string memory str2) public pure returns(bool) {
        return (keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2)));
    }
}