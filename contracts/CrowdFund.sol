// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface ERC20 {
  function transfer(address, uint) external returns (bool);

  function transferFrom(address, address, uint) external returns (bool);
}

contract CrowdFund {
  struct Fundraiser {
    address beneficiary;
    uint target;
    uint deposited;
    uint duration;
    bool claimed;
  }

  ERC20 public token;
  Fundraiser[] fundraisers;
  mapping(uint => mapping(address => uint)) depositedAmount;

  constructor(address tokenAddress) {
    token = ERC20(tokenAddress);
  }

  function createFundraiser(uint _target, uint _duration) external returns (uint) {
    fundraisers.push(
      Fundraiser({
        beneficiary: msg.sender,
        target: _target,
        deposited: 0,
        duration: block.timestamp + _duration,
        claimed: false
      })
    );

    return fundraisers.length - 1;
  }

  function deposit(uint id, uint amount) external {
    require(block.timestamp < fundraisers[id].duration, "fundraising has ended");

    bool successful = token.transferFrom(msg.sender, address(this), amount);
    require(successful);

    fundraisers[id].deposited += amount;
    depositedAmount[id][msg.sender] += amount;
  }

  function withdrawAmount(uint id, uint amount) external {
    require(block.timestamp < fundraisers[id].duration, "fundraising has ended");
    require(amount <= depositedAmount[id][msg.sender], "insifficient balance");

    _withdraw(id, amount);
  }

  function withdraw(uint id) external {
    require(block.timestamp < fundraisers[id].duration, "fundraising has ended");

    uint amount = depositedAmount[id][msg.sender];
    require(amount > 0, "no Balance");

    _withdraw(id, amount);
  }

  function claim(uint id) external {
    require(msg.sender == fundraisers[id].beneficiary, " not the beneficiary");
    require(block.timestamp > fundraisers[id].duration, "fundraising hasn't ended");
    require(fundraisers[id].deposited >= fundraisers[id].target, "target not reached");
    require(!fundraisers[id].claimed, "already claimed");

    bool sent = token.transfer(msg.sender, fundraisers[id].deposited);
    require(sent);

    fundraisers[id].claimed = true;
  }

  function refund(uint id) external {
    require(block.timestamp > fundraisers[id].duration, "fundraising hasn't ended, use 'withdraw'");
    require(!fundraisers[id].claimed, "already claimed");
    require(fundraisers[id].deposited < fundraisers[id].target, "target was reached can't refund");
    uint amount = depositedAmount[id][msg.sender];
    require(amount > 0, "no Balance");

    _withdraw(id, amount);
  }

  function _withdraw(uint id, uint amount) internal {
    fundraisers[id].deposited -= amount;
    depositedAmount[id][msg.sender] -= amount;
    bool sent = token.transfer(msg.sender, amount);
    require(sent);
  }
}
