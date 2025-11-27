// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // IERC20: ERC20 标准接口，用于与代币交互。
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // SafeERC20: 提供安全的 ERC20 转账（防止未检查返回值的攻击）。
import "@openzeppelin/contracts/utils/Address.sol"; // Address: 地址工具库（如检查是否为合约）。
import "@openzeppelin/contracts/utils/math/Math.sol"; // Math: 安全数学运算（防溢出）。
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";  // Upgradeable 模式: 合约支持通过 UUPS 代理模式升级
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol"; // AccessControl: 基于角色的权限管理（如 ADMIN_ROLE）。
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol"; // Pausable: 允许管理员暂停关键功能（如提现）。

/*
 *   Initializable: 支持代理模式下初始化逻辑。
 *   UUPSUpgradeable: 用户可升级的代理模式（需手动管理升级逻辑）。
 *   Pausable: 可暂停合约（避免紧急情况下的资金风险）。
 *   AccessControl: 权限控制（如管理员、升级权限）。
 */ 
abstract contract StakeToken is Initializable, UUPSUpgradeable, PausableUpgradeable, AccessControlUpgradeable {

    /*
     * 为 ERC20 接口添加安全操作（如防重入的 safeTransfer），替换原生 transfer。
     * IERC20(token).safeTransfer(user, amount); // 自动检查返回值
     * 若不使用 SafeERC20，需手动检查返回值：
     * bool success = IERC20(token).transfer(user, amount);
     * require(success, "Transfer failed");
     */
    using SafeERC20 for IERC20; 
    /*
     * 为地址类型添加工具函数，如检查是否为合约地址（isContract）或安全发送 ETH（sendValue）。
     * if (userAddress.isContract()) {// 与合约交互的逻辑}
     */
    using Address for address;
    /*
     * 为无符号整数添加安全的数学运算（如防溢出的 tryAdd、tryMul）。
     * (bool success, uint256 result) = a.tryAdd(b);
     * require(success, "Addition overflow");
     */
    using Math for uint256;

    // ************************************** INVARIANT **************************************
    
    /*
     * 作用：通过 keccak256 哈希生成唯一的角色标识符，确保权限全局唯一。
     * ADMIN_ROLE：管理常规敏感操作（如修改质押参数、暂停合约）。
     * UPGRADE_ROLE：专门控制合约升级权限（需与 UUPSUpgradeable 配合）。
     * public constant：公开常量，节省 Gas（编译时替换值，不占用存储）。
     */
    bytes32 public constant ADMIN_ROLE = keccak256("admin_role");
    bytes32 public constant UPGRADE_ROLE = keccak256("upgrade_role");
    /*
     * 作用：ETH 质押池的固定 ID（pool[0]），其他池从 ID 1 开始。
     * 特殊处理 ETH：ETH 不是 ERC20，其地址为 address(0)，需单独逻辑（如 depositETH 函数）。
     * 硬编码常量：避免魔法数字（Magic Number），提升代码可读性。
     */
    uint256 public constant ETH_PID = 0;

    // ************************************** DATA STRUCTURE **********************************


    struct Pool {
        address stTokenAddress; // 质押代币地址（ETH池为0x0）
        uint256 poolWeight; // 权重（决定奖励分配比例）
        uint256 lastRewardBlock; // 最后一次发放奖励的区块
        uint256 accRewardParkPreST; // 每质押代币累计的奖励（精度1e18），类似于 AMM 中的“累积奖励”，通过 (奖励 * 1e18) / 质押总量 计算。
        uint256 stTokenAmount; // 池中质押代币总量
        uint256 minDepositAmount; // 最小质押量 
        uint256 unstakeLockedBlocks; // 解质押锁定区块个数
    }

    struct UnstakeRequest {
        uint256 amount; // 用户取消质押的代币数量，要取出多少个 token
        uint256 unlockBlocks; // 解质押的区块高度
    }

    struct User {
        uint256 stAmount; // 用户质押量
        uint256 finishedRewardPark; // 已领取的奖励
        uint256 pendingRewardPark; // 待领取的奖励
        UnstakeRequest[] requests; // 解质押请求队列
    }

    /**
        奖励公式：
        pendingReward=(stAmount*accRewardParkPreST)/1e18-finishedRewardPark+pendingRewardPark
    */

    // ************************************** STATE VARIABLES ********************************

    uint256 public startBlock; // 质押开始区块
    uint256 public endBlock; // 质押结束区块
    uint256 public ParkPerBlock; // 每个区块的奖励数量
    bool public withdrawPaused; // 提现是否暂停
    bool public claimPaused; // 领取奖励是否暂停
    IERC20 public Park; // Park 代币合约
    uint256 public totalPoolWeight; // 所有资金池的权重总和，用来分配奖励的
    Pool[] public pool; // 资金池列表
    mapping(uint256 => mapping(address => User)) public user; // 资金池 id => 用户地址 => 用户信息  // pool id => user address => user info

    // ************************************** EVENT **************************************
    event SetPark(IERC20 indexed Park);
    event PauseWithdraw();
    event UnpauseWithdraw();
    event PauseClaim();
    event UnpauseClaim();
    event SetStartBlock(uint256 indexed startBlock);
    event SetEndBlock(uint256 indexed endBlock);
    event SetParkPerBlock(uint256 indexed ParkPerBlock);
    event AddPool(
        address indexed stTokenAddress,
        uint256 indexed poolWeight,
        uint256 indexed lastRewardBlock,
        uint256 minDepositAmount,
        uint256 unstakeLockedBlocks
    );
    event UpdatePoolInfo(
        uint256 indexed poolId,
        uint256 indexed minDepositAmount,
        uint256 indexed unstakeLockedBlocks
    );
    event SetPoolWeight(
        uint256 indexed poolId,
        uint256 indexed poolWeight,
        uint256 totalPoolWeight
    );
    event UpdatePool(
        uint256 indexed poolId,
        uint256 indexed lastRewardBlock,
        uint256 totalPark
    );
    event Deposit(address indexed user, uint256 indexed poolId, uint256 amount);
    event RequestUnstake(
        address indexed user,
        uint256 indexed poolId,
        uint256 amount
    );
    event Withdraw(
        address indexed user,
        uint256 indexed poolId,
        uint256 amount,
        uint256 indexed blockNumber
    );
    event Claim(
        address indexed user,
        uint256 indexed poolId,
        uint256 ParkReward
    );

    // ************************************** MODIFIER **************************************

    modifier checkPid(uint256 _pid) {
        require(_pid < pool.length, "invalid pid");
        _;
    }

    modifier whenNotClaimPaused() {
        require(!claimPaused, "claim is paused");
        _;
    }

    modifier whenNotWithdrawPaused() {
        require(!withdrawPaused, "withdraw is paused");
        _;
    }

    function initialize(
        IERC20 _Park,            // Park 代币合约地址
        uint256 _startBlock,     // 开始发放奖励的区块号
        uint256 _endBlock,       // 停止发放奖励的区块号
        uint256 _ParkPerBlock   // 每个区块发放的代币数量
    ) public initializer {
        // 参数校验：开始区块 ≤ 结束区块，且每区块奖励 > 0
        require(
            _startBlock <= _endBlock && _ParkPerBlock > 0,
            "invalid parameters"
        );

        // 初始化访问控制和 UUPS 升级逻辑
        __AccessControl_init();
        __UUPSUpgradeable_init();

        // 授予合约部署者三个关键角色：
        // 1. 默认管理员（DEFAULT_ADMIN_ROLE）
        // 2. 合约升级权限（UPGRADE_ROLE）
        // 3. 普通管理员（ADMIN_ROLE）
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADE_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        // 设置 Park 代币地址
        setPark(_Park);

        // 存储奖励发放参数
        startBlock = _startBlock;
        endBlock = _endBlock;
        ParkPerBlock = _ParkPerBlock;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADE_ROLE) {}

    // ************************************** ADMIN FUNCTION **************************************
    /**
     * @notice Set Park token address. Can only be called by admin
     * 作用：允许管理员 (ADMIN_ROLE) 修改合约中用于奖励或质押的 ERC20 代币地址（Park）。
     */
    function setPark(IERC20 _Park) public onlyRole(ADMIN_ROLE) {
        Park = _Park;          // 更新 Park 代币地址
        emit SetPark(Park);    // 触发事件日志
    }

    /**
     * @notice Pause withdraw. Can only be called by admin.
     * 作用：允许管理员 (ADMIN_ROLE) 暂停提现功能。禁止用户调用 withdraw() 函数。
     * 如果已暂停 (withdrawPaused = true)，再次调用会回滚。
     */
    function pauseWithdraw() public onlyRole(ADMIN_ROLE) {
        require(!withdrawPaused, "withdraw has been already paused");
        withdrawPaused = true;
        emit PauseWithdraw();
    }

    /**
     * @notice Unpause withdraw. Can only be called by admin.
     * 作用：允许管理员 (ADMIN_ROLE) 恢复提现功能。允许用户调用 withdraw() 函数。
     * 如果未暂停 (withdrawPaused = false)，再次调用会回滚。
     */
    function unpauseWithdraw() public onlyRole(ADMIN_ROLE) {
        require(withdrawPaused, "withdraw has been already unpaused");
        withdrawPaused = false;
        emit UnpauseWithdraw();
    }

    /**
     * @notice Pause claim. Can only be called by admin.
     * 作用：允许管理员 (ADMIN_ROLE) 暂停领取奖励功能。禁止用户调用 claim() 函数。
     */
    function pauseClaim() public onlyRole(ADMIN_ROLE) {
        require(!claimPaused, "claim has been already paused");
        claimPaused = true;
        emit PauseClaim();
    }

    /**
     * @notice Unpause claim. Can only be called by admin.
     * 作用：允许管理员 (ADMIN_ROLE) 恢复领取奖励功能。允许用户调用 claim() 函数。
     */
    function unpauseClaim() public onlyRole(ADMIN_ROLE) {
        require(claimPaused, "claim has been already unpaused");
        claimPaused = false;
        emit UnpauseClaim();
    }

    /**
     * @notice Update staking start block. Can only be called by admin.
     * 作用：允许管理员 (ADMIN_ROLE) 更新合约的开始发放奖励的区块号。
     */
    function setStartBlock(uint256 _startBlock) public onlyRole(ADMIN_ROLE) {
        require(_startBlock <= endBlock, "start block must be smaller than end block");
        startBlock = _startBlock;
        emit SetStartBlock(_startBlock);
    }

    /**
     * @notice Update staking end block. Can only be called by admin.
     * 作用：允许管理员 (ADMIN_ROLE) 更新质押结束的区块高度。
     */
    function setEndBlock(uint256 _endBlock) public onlyRole(ADMIN_ROLE) {
        require(startBlock <= _endBlock, "start block must be smaller than end block");
        endBlock = _endBlock;
        emit SetEndBlock(_endBlock);
    }

    /**
     * @notice Update the Park reward amount per block. Can only be called by admin.
     * 作用：允许管理员 (ADMIN_ROLE) 更新每个区块的 Park 代币奖励数量。
     */
    function setParkPerBlock(uint256 _ParkPerBlock) public onlyRole(ADMIN_ROLE) {
        require(_ParkPerBlock > 0, "invalid parameter");
        ParkPerBlock = _ParkPerBlock;
        emit SetParkPerBlock(_ParkPerBlock);
    }

    /**
     * @notice Add a new staking to pool. Can only be called by admin
     * DO NOT add the same staking token more than once. Park rewards will be messed up if you do
     * 作用：允许管理员 (ADMIN_ROLE) 创建一个新的质押池，支持不同代币（包括 ETH）的质押，并设置初始参数。
     * @param _stTokenAddress: 质押代币地址（address(0) 表示 ETH）
     * @param _poolWeight: 池的权重（影响奖励分配比例）
     * @param _minDepositAmount: 最小质押数量
     * @param _unstakeLockedBlocks: 解押锁定区块数（用户需等待的区块数）
     * @param _withUpdate: 是否在添加前更新所有质押池的奖励累积数据
     */
    function addPool(
        address _stTokenAddress,
        uint256 _poolWeight,
        uint256 _minDepositAmount,
        uint256 _unstakeLockedBlocks,
        bool _withUpdate
    ) public onlyRole(ADMIN_ROLE) {
        // Default the first pool to be ETH pool, so the first pool must be added with stTokenAddress = address(0x0)
        if (pool.length > 0) {
            require(_stTokenAddress != address(0x0), "invalid staking token address");
        } else {
            require(_stTokenAddress == address(0x0), "invalid staking token address");
        }
        // allow the min deposit amount equal to 0
        //require(_minDepositAmount > 0, "invalid min deposit amount");
        require(_unstakeLockedBlocks > 0, "invalid withdraw locked blocks");
        require(block.number < endBlock, "Already ended");

        if (_withUpdate) {
            massUpdatePools();
        }

        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalPoolWeight = totalPoolWeight + _poolWeight;

        pool.push(
            Pool({
                stTokenAddress: _stTokenAddress,
                poolWeight: _poolWeight,
                lastRewardBlock: lastRewardBlock,
                accRewardParkPreST: 0,
                stTokenAmount: 0,
                minDepositAmount: _minDepositAmount,
                unstakeLockedBlocks: _unstakeLockedBlocks
            })
        );

        emit AddPool(_stTokenAddress, _poolWeight, lastRewardBlock, _minDepositAmount, _unstakeLockedBlocks);
    }

    /**
     * @notice Update the given pool's info (minDepositAmount and unstakeLockedBlocks). Can only be called by admin.
     * 作用：允许管理员 (ADMIN_ROLE) 修改指定池的 最低质押金额 和 解押锁定时间。
     * @param _pid: 池的 ID
     * @param _minDepositAmount: 最小质押数量
     * @param _unstakeLockedBlocks: 解押锁定区块数（用户需等待的区块数）
     */
    function updatePool(uint256 _pid, uint256 _minDepositAmount, uint256 _unstakeLockedBlocks) public onlyRole(ADMIN_ROLE) checkPid(_pid) {
        pool[_pid].minDepositAmount = _minDepositAmount;
        pool[_pid].unstakeLockedBlocks = _unstakeLockedBlocks;

        emit UpdatePoolInfo(_pid, _minDepositAmount, _unstakeLockedBlocks);
    }

    /**
     * @notice Update the given pool's weight. Can only be called by admin.
     * 作用：允许管理员 (ADMIN_ROLE) 动态改变池的奖励权重（如提升某代币的激励比例）。
     * @param _pid: 池的 ID
     * @param _poolWeight: 池的权重（影响奖励分配比例）
     * @param _withUpdate: 是否在修改前更新所有质押池的奖励累积数据
     */
    function setPoolWeight(uint256 _pid, uint256 _poolWeight, bool _withUpdate) public onlyRole(ADMIN_ROLE) checkPid(_pid) {
        require(_poolWeight > 0, "invalid pool weight");

        if (_withUpdate) {
            massUpdatePools();
        }

        totalPoolWeight = totalPoolWeight - pool[_pid].poolWeight + _poolWeight;
        pool[_pid].poolWeight = _poolWeight;

        emit SetPoolWeight(_pid, _poolWeight, totalPoolWeight);
    }



    // ************************************** QUERY FUNCTION **************************************

    /**
     * @notice Get the length/amount of pool
     * 作用：返回当前合约中已创建的质押池总数（pool 数组的长度）。无需权限控制，公开可查询。
     * @return poolLength 池数量
     */
    function poolLength() external view returns (uint256) {
        return pool.length;
    }

    /**
     * @notice Return reward multiplier over given _from to _to block. [_from, _to)
     * 作用：返回指定区间内（[_from, _to)）的奖励乘数。]; 计算在区块范围 [_from, _to) 内的 总奖励乘数 = (_to - _from) * ParkPerBlock。
     * @param _from    From block number (included)
     * @param _to      To block number (exluded)
     * getMultiplier(pool_.lastRewardBlock, block.number).tryMul(pool_.poolWeight);
     */
    function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256 multiplier) {
        require(_from <= _to, "invalid block");
        if (_from < startBlock) {
            _from = startBlock;
        }
        if (_to > endBlock) {
            _to = endBlock;
        }
        require(_from <= _to, "end block must be greater than start block");
        bool success;
        (success, multiplier) = (_to - _from).tryMul(ParkPerBlock);
        require(success, "multiplier overflow");
    }

    /**
     * @notice Get pending Park amount of user in pool
     * 作用：获取用户在 _pid 池中当前区块的待领取奖励（快捷入口）
     */
    function pendingPark(uint256 _pid, address _user) external view checkPid(_pid) returns (uint256) {
        return pendingParkByBlockNumber(_pid, _user, block.number);
    }

    /**
     * @notice Get pending Park amount of user by block number in pool
     * 作用：获取用户在特定区块高度 _blockNumber 时的待领取奖励（支持历史区块查询）
     */
    function pendingParkByBlockNumber(uint256 _pid, address _user, uint256 _blockNumber) public view checkPid(_pid) returns (uint256) {
        Pool storage pool_ = pool[_pid];
        User storage user_ = user[_pid][_user];
        uint256 accRewardParkPreST = pool_.accRewardParkPreST;
        uint256 stSupply = pool_.stTokenAmount;

        if (_blockNumber > pool_.lastRewardBlock && stSupply != 0) {
            uint256 multiplier = getMultiplier(pool_.lastRewardBlock, _blockNumber);
            uint256 ParkForPool = (multiplier * pool_.poolWeight) / totalPoolWeight;
            accRewardParkPreST = accRewardParkPreST + (ParkForPool * (1 ether)) / stSupply;
        }

        return (user_.stAmount * accRewardParkPreST) / (1 ether) - user_.finishedRewardPark + user_.pendingRewardPark;
    }

    /**
     * @notice Get the staking amount of user
     * 作用：返回指定用户 (_user) 在指定质押池 (_pid) 中的 当前质押代币数量 (stAmount)。
     */
    function stakingBalance(uint256 _pid, address _user) external view checkPid(_pid) returns (uint256) {
        return user[_pid][_user].stAmount;
    }

    /**
     * @notice Get the withdraw amount info, including the locked unstake amount and the unlocked unstake amount
     * 作用：返回用户 (_user) 在指定质押池 (_pid) 中的 解押请求总量 和 已解锁可提取量
     * @return requestAmount 用户发起的全部解押请求总和（包含未解锁部分）。
     * @return pendingWithdrawAmount 当前已满足解锁条件的解押金额。
     */
    function withdrawAmount(uint256 _pid, address _user) public view checkPid(_pid) returns (uint256 requestAmount, uint256 pendingWithdrawAmount)
    {
        User storage user_ = user[_pid][_user];

        for (uint256 i = 0; i < user_.requests.length; i++) {
            if (user_.requests[i].unlockBlocks <= block.number) {
                pendingWithdrawAmount = pendingWithdrawAmount + user_.requests[i].amount;
            }
            requestAmount = requestAmount + user_.requests[i].amount;
        }
    }
    
    // ************************************** PUBLIC FUNCTION **************************************


    /**
     * @notice Update reward variables of the given pool to be up-to-date.
     * 作用：更新指定质押池 (_pid) 的奖励累计参数，确保后续用户操作基于最新状态计算。
     */
    function updatePool(uint256 _pid) public checkPid(_pid) {
        Pool storage pool_ = pool[_pid];

        if (block.number <= pool_.lastRewardBlock) {
            return;
        }

        (bool success1, uint256 totalPark) = getMultiplier(
            pool_.lastRewardBlock,
            block.number
        ).tryMul(pool_.poolWeight);
        require(success1, "overflow");

        (success1, totalPark) = totalPark.tryDiv(totalPoolWeight);
        require(success1, "overflow");

        uint256 stSupply = pool_.stTokenAmount;
        if (stSupply > 0) {
            (bool success2, uint256 totalPark_) = totalPark.tryMul(
                1 ether
            );
            require(success2, "overflow");

            (success2, totalPark_) = totalPark_.tryDiv(stSupply);
            require(success2, "overflow");

            (bool success3, uint256 accRewardParkPreST) = pool_
                .accRewardParkPreST
                .tryAdd(totalPark_);
            require(success3, "overflow");
            pool_.accRewardParkPreST = accRewardParkPreST;
        }

        pool_.lastRewardBlock = block.number;

        emit UpdatePool(_pid, pool_.lastRewardBlock, totalPark);
    }

    /**
     * @notice Update reward variables for all pools. Be careful of gas spending!
     * 作用：批量更新所有质押池的奖励状态（accRewardParkPreST 和 lastRewardBlock）。
     */
    function massUpdatePools() public {
        uint256 length = pool.length;
        for (uint256 pid = 0; pid < length; pid++) {
            updatePool(pid);
        }
    }

    /**
     * @notice Deposit staking ETH for Park rewards
     * 作用：质押 ETH 到专用池（ETH_PID）
     * 原生 ETH， 通过 msg.value 接收资金
     */
    function depositETH() public payable whenNotPaused {
        Pool storage pool_ = pool[ETH_PID];
        require(pool_.stTokenAddress == address(0x0), "invalid staking token address");

        uint256 _amount = msg.value;
        require(_amount >= pool_.minDepositAmount, "deposit amount is too small");

        _deposit(ETH_PID, _amount);
    }

    /**
     * @notice Deposit staking token for Park rewards
     * Before depositing, user needs approve this contract to be able to spend or transfer their staking tokens
     * 作用：质押 ERC20 代币到指定池（_pid）
     * ERC20 代币， 需预先授权 transferFrom
     *
     * @param _pid       Id of the pool to be deposited to
     * @param _amount    Amount of staking tokens to be deposited
     */
    function deposit(uint256 _pid, uint256 _amount) public whenNotPaused checkPid(_pid) {
        require(_pid != 0, "deposit not support ETH staking");
        Pool storage pool_ = pool[_pid];
        require(_amount > pool_.minDepositAmount, "deposit amount is too small");

        if (_amount > 0) {
            IERC20(pool_.stTokenAddress).safeTransferFrom(msg.sender,address(this), _amount);
        }

        _deposit(_pid, _amount);
    }

    /**
     * @notice Unstake staking tokens
     * 作用：允许用户从指定质押池 (_pid) 中解押部分或全部质押资产（含待领取奖励）。
     *
     * @param _pid       Id of the pool to be withdrawn from
     * @param _amount    amount of staking tokens to be withdrawn
     */
    function unstake(uint256 _pid, uint256 _amount) public whenNotPaused checkPid(_pid) whenNotWithdrawPaused {
        Pool storage pool_ = pool[_pid];
        User storage user_ = user[_pid][msg.sender];

        require(user_.stAmount >= _amount, "Not enough staking token balance");

        updatePool(_pid);

        uint256 pendingRewardPark_ = (user_.stAmount * pool_.accRewardParkPreST) / (1 ether) - user_.finishedRewardPark;
        if (pendingRewardPark_ > 0) {
            user_.pendingRewardPark = user_.pendingRewardPark + pendingRewardPark_;
        }

        if (_amount > 0) {
            user_.stAmount = user_.stAmount - _amount;
            user_.requests.push(
                UnstakeRequest({
                    amount: _amount,
                    unlockBlocks: block.number + pool_.unstakeLockedBlocks
                })
            );
        }

        pool_.stTokenAmount = pool_.stTokenAmount - _amount;
        user_.finishedRewardPark = (user_.stAmount * pool_.accRewardParkPreST) / (1 ether);

        emit RequestUnstake(msg.sender, _pid, _amount);
    }

    /**
     * @notice Withdraw the unlock unstake amount
     * 作用：处理用户已过解锁期的提现请求（，完成资金实际转账。
     *
     * @param _pid       Id of the pool to be withdrawn from
     */
    function withdraw(uint256 _pid) public whenNotPaused checkPid(_pid) whenNotWithdrawPaused {
        Pool storage pool_ = pool[_pid];
        User storage user_ = user[_pid][msg.sender];

        uint256 pendingWithdraw_;
        uint256 popNum_;
        for (uint256 i = 0; i < user_.requests.length; i++) {
            if (user_.requests[i].unlockBlocks > block.number) {
                break;
            }
            pendingWithdraw_ = pendingWithdraw_ + user_.requests[i].amount;
            popNum_++;
        }

        for (uint256 i = 0; i < user_.requests.length - popNum_; i++) {
            user_.requests[i] = user_.requests[i + popNum_];
        }

        for (uint256 i = 0; i < popNum_; i++) {
            user_.requests.pop();
        }

        if (pendingWithdraw_ > 0) {
            if (pool_.stTokenAddress == address(0x0)) {
                _safeETHTransfer(msg.sender, pendingWithdraw_);
            } else {
                IERC20(pool_.stTokenAddress).safeTransfer(
                    msg.sender,
                    pendingWithdraw_
                );
            }
        }

        emit Withdraw(msg.sender, _pid, pendingWithdraw_, block.number);
    }

    /**
     * @notice Claim Park tokens reward
     * 作用：允许用户从指定质押池 (_pid) 提取累积的 Park 代币奖励。
     * 总待领取 = 实时质押奖励(stAmount × accRate) + 历史未领取奖励(pendingRewardPark)
     *
     * @param _pid       Id of the pool to be claimed from
     */
    function claim(uint256 _pid) public whenNotPaused checkPid(_pid) whenNotClaimPaused {
        Pool storage pool_ = pool[_pid];
        User storage user_ = user[_pid][msg.sender];

        updatePool(_pid);

        uint256 pendingRewardPark_ = (user_.stAmount * pool_.accRewardParkPreST) / (1 ether) - user_.finishedRewardPark + user_.pendingRewardPark;

        if (pendingRewardPark_ > 0) {
            user_.pendingRewardPark = 0;
            _safeParkTransfer(msg.sender, pendingRewardPark_);
        }

        user_.finishedRewardPark = (user_.stAmount * pool_.accRewardParkPreST) / (1 ether);

        emit Claim(msg.sender, _pid, pendingRewardPark_);
    }


    // ************************************** INTERNAL FUNCTION **************************************

    /**
     * @notice Deposit staking token for Park rewards
     *
     * @param _pid       Id of the pool to be deposited to
     * @param _amount    Amount of staking tokens to be deposited
     */
    function _deposit(uint256 _pid, uint256 _amount) internal {
        Pool storage pool_ = pool[_pid];
        User storage user_ = user[_pid][msg.sender];

        updatePool(_pid);

        if (user_.stAmount > 0) {
            // uint256 accST = user_.stAmount.mulDiv(pool_.accRewardParkPreST, 1 ether);
            (bool success1, uint256 accST) = user_.stAmount.tryMul(pool_.accRewardParkPreST);
            require(success1, "user stAmount mul accRewardParkPreST overflow");

            (success1, accST) = accST.tryDiv(1 ether);
            require(success1, "accST div 1 ether overflow");

            (bool success2, uint256 pendingRewardPark_) = accST.trySub(user_.finishedRewardPark);
            require(success2, "accST sub finishedRewardPark overflow");

            if (pendingRewardPark_ > 0) {
                (bool success3, uint256 _pendingRewardPark) = user_.pendingRewardPark.tryAdd(pendingRewardPark_);
                require(success3, "user pendingRewardPark overflow");
                user_.pendingRewardPark = _pendingRewardPark;
            }
        }

        if (_amount > 0) {
            (bool success4, uint256 stAmount) = user_.stAmount.tryAdd(_amount);
            require(success4, "user stAmount overflow");
            user_.stAmount = stAmount;
        }

        (bool success5, uint256 stTokenAmount) = pool_.stTokenAmount.tryAdd(_amount);
        require(success5, "pool stTokenAmount overflow");
        pool_.stTokenAmount = stTokenAmount;

        // user_.finishedRewardPark = user_.stAmount.mulDiv(pool_.accRewardParkPreST, 1 ether);
        (bool success6, uint256 finishedRewardPark) = user_.stAmount.tryMul(pool_.accRewardParkPreST);
        require(success6, "user stAmount mul accRewardParkPreST overflow");

        (success6, finishedRewardPark) = finishedRewardPark.tryDiv(1 ether);
        require(success6, "finishedRewardPark div 1 ether overflow");

        // 作用：建立新的奖励计算基准点，确保下次操作只计算增量收益
        user_.finishedRewardPark = finishedRewardPark;

        emit Deposit(msg.sender, _pid, _amount);
    }

    /**
     * @notice Safe Park transfer function, just in case if rounding error causes pool to not have enough Parks
     * 作用：安全Park转账函数，以防有四舍五入错误导致池子没有足够的Park,防止因 奖励计算舍入误差 或 合约代币储备不足 导致转账失败
     *
     * @param _to        Address to get transferred Parks
     * @param _amount    Amount of Park to be transferred
     */
    function _safeParkTransfer(address _to, uint256 _amount) internal {
        uint256 ParkBal = Park.balanceOf(address(this));

        if (_amount > ParkBal) {
            Park.transfer(_to, ParkBal);
        } else {
            Park.transfer(_to, _amount);
        }
    }

    /**
    * @notice Safe ETH transfer function
    * 作用：安全ETH转账函数
    * 选择call()原因：相比 transfer() 和 send()：
    * ✅ 无 2300 Gas 限制（兼容智能合约收款）
    * ✅ 可获取调用返回值（支持复杂合约交互）
    * ⚠️ 需手动处理回滚（通过后续 require）
    *
    * @param _to        Address to get transferred ETH
    * @param _amount    Amount of ETH to be transferred
    */
    function _safeETHTransfer(address _to, uint256 _amount) internal {
        (bool success, bytes memory data) = address(_to).call{value: _amount}("");

        require(success, "ETH transfer call failed");
        if (data.length > 0) {
            require(abi.decode(data, (bool)), "ETH transfer operation did not succeed");
        }
    }
}