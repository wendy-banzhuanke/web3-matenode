// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract OtherContract {
    uint256 private x;
    event Log(uint256 amount, uint256 gas);
    event Received(address sender, uint256 amount);

    // fallback() external payable returns(string memory){
    //     // revert(x> 0, "error hahahaha");
    //     // throw new error("ahahahahaha");
    //     return("hahahahaah");
    // }

    receive() external payable {
        // emit Received(msg.sender, msg.value);
    }

    fallback() external payable {
        emit Received(msg.sender, msg.value);
    }

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

    function CallSetX(address payable  _address, uint256 x) public payable  {
        // OtherContract(_address).setX(x);
        (bool success, bytes memory data) = _address.call{value: msg.value}(
            abi.encodeWithSignature("setX(uint256)", x)
        );

        emit Response(success, data);
    }

    function CallGetX(address _address) external returns(uint256 x) {
        // x = OtherContract(_address).getX();
        (bool success, bytes memory data) = _address.call(
            abi.encodeWithSignature("getX()")
        );

        emit Response(success, data);
        return abi.decode(data, (uint256));
    }

    // function CallGetX2(address _address) external view returns(uint256 x) {
    //     OtherContract oc = OtherContract(_address);
    //     x = oc.getX();
    // }

    // function setTransferETH(address otherContract, uint256 x) external payable {
    //     OtherContract(otherContract).setX{value: msg.value}(x);
    // }

    function callNonExist(address _addr) external{
        // call getX()
        (bool success, bytes memory data) = _addr.call(
            abi.encodeWithSignature("foo(uint256)")
        );

        emit Response(success, data); //emit event
    }

}