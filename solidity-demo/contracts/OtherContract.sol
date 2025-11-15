// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract OtherContract {
    uint256 private x;
    event Log(uint256 amount, uint256 gas);

    // fallback() external payable{}

    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }

    function setX(uint256 _x) external payable {
        x=_x;
        if(msg.value > 0) {
            emit Log(msg.value, gasleft());
        }

    }

    function getX() external view returns(uint256 _x) {
        _x = x;
    }
}

contract CallContract {

    event Response(bool success, bytes data);

    function CallSetX(address _address, uint256 x) external {
        OtherContract(_address).setX(x);
    }

    function CallGetX(OtherContract _address) external view returns(uint256 x) {
        x = OtherContract(_address).getX();
    }

    function CallGetX2(address _address) external view returns(uint256 x) {
        OtherContract oc = OtherContract(_address);
        x = oc.getX();
    }

    function setTransferETH(address otherContract, uint256 x) external payable {
        OtherContract(otherContract).setX{value: msg.value}(x);
    }
}