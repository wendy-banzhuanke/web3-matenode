// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Pair {
    address public factory;
    address public token0;
    address public token1;

    constructor() payable {
        factory = msg.sender;
    }

    function initalize(address _token0, address _token1) external {
        require(msg.sender == factory,  'UniswapV2: FORBIDDEN');
        // require(msg.sender == factory, 'UniswapV2: FORBIDDEN'); // s
        token0 = _token0;
        token1 = _token1;
    }
}

contract PairFactory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    function createPair(address _token0, address _token1) external  returns(address pairAddr)  {
        Pair pair = new Pair();
        pair.initalize(_token0, _token1);
        pairAddr = address(pair);
        getPair[_token0][_token1] = pairAddr;
        getPair[_token1][_token0] = pairAddr;
    }

    function createPair2(address tokenA, address tokenB) external returns(address pairAddr) {
        require(tokenA != tokenB, 'IDENTICAL_ADDRESSES');

        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);

        bytes32 salt = keccak256(abi.encodePacked(token0, token1));

        Pair pair = new Pair{salt: salt}(); 

        pair.initalize(tokenA, tokenB);

        pairAddr = address(pair);

        allPairs.push(pairAddr);

        getPair[tokenA][tokenB] = pairAddr;
        getPair[tokenB][tokenA] = pairAddr;

    }

    // Calculate Pair contract address beforehand
    function calculateAddr(address tokenA, address tokenB) public view returns(address predictedAddress){
        require(tokenA != tokenB, 'IDENTICAL_ADDRESSES'); //Avoid conflicts when tokenA and tokenB are the same
        // Calculate salt with tokenA and tokenB addresses
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA); //Sort tokenA and tokenB by size
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        // Calculate contract address
        predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            keccak256(type(Pair).creationCode)
        )))));
    }

}