// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract BuyMeABurger {
  address public owner;

  struct Message {
    string name;
    string text;
    address sender;
  }

  Message[] messages;

  event MsgSent(
    string name,
    string text,
    uint tipValue,
    address sender
  );

  constructor(){
    owner = msg.sender;
  }

  modifier onlyOwner(){
    require(msg.sender == owner, "You aren't the owner");
    _;
  }

  function buyMeABurger(
    string memory _name,
    string memory _text
  ) public payable {
    require(msg.value > 0, "can not buy a hamberger with 0 eth");
    
    messages.push(Message({
      name: _name,
      text: _text,
      sender: payable(msg.sender)
    }));

    emit MsgSent(_name, _text, msg.value, msg.sender);
  }

  function getContractBalance() public view returns(uint) {
    return address(this).balance;
  }

  function withdraw() public payable onlyOwner {
    require(getContractBalance() > 0, "no funds to withdraw");
    (bool sent, ) = owner.call{value: getContractBalance()}("");
    require(sent, "Failed to send Ether");
  }

  function getSenders() public view returns(Message[] memory) {
    return messages;
  }

  function updateOwner() public onlyOwner {
    owner = msg.sender;
  }
}
