// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    enum Status {
        PENDING,
        SELLER_ACCEPTED,
        SHIPPED,
        DELIVERED,
        COMPLETE,
        DISPUTE,
        RESOLVED
    }

    struct EscrowOrder {
        uint256 orderId;
        address buyer;
        address seller;
        uint256 amount;
        Status status;
        uint256 createdAt;
        uint256 timeoutAt;
        string productId;
        bool disputeOpened;
        address arbitrator;
        string disputeReason;
    }

    address public admin;
    uint256 public orderCounter;
    uint256 public constant TIMEOUT_DURATION = 7 days;

    mapping(uint256 => EscrowOrder) public orders;
    mapping(uint256 => bool) public orderExists;

    event EscrowCreated(
        uint256 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        string productId
    );

    event OrderAccepted(uint256 indexed orderId, address indexed seller);
    event OrderShipped(uint256 indexed orderId);
    event DeliveryConfirmed(uint256 indexed orderId);
    event FundsReleased(uint256 indexed orderId, address indexed recipient, uint256 amount);
    event DisputeOpened(uint256 indexed orderId, address indexed buyer, string reason);
    event DisputeResolved(
        uint256 indexed orderId,
        address indexed winner,
        uint256 amount,
        address indexed arbitrator
    );
    event OrderCompleted(uint256 indexed orderId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyBuyer(uint256 _orderId) {
        require(orders[_orderId].buyer == msg.sender, "Only buyer can perform this action");
        _;
    }

    modifier onlySeller(uint256 _orderId) {
        require(orders[_orderId].seller == msg.sender, "Only seller can perform this action");
        _;
    }

    modifier validOrder(uint256 _orderId) {
        require(orderExists[_orderId], "Order does not exist");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createEscrow(
        string memory _productId,
        address _seller
    ) external payable validAmount {
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Cannot create escrow for yourself");

        orderCounter++;
        uint256 orderId = orderCounter;

        orders[orderId] = EscrowOrder({
            orderId: orderId,
            buyer: msg.sender,
            seller: _seller,
            amount: msg.value,
            status: Status.PENDING,
            createdAt: block.timestamp,
            timeoutAt: block.timestamp + TIMEOUT_DURATION,
            productId: _productId,
            disputeOpened: false,
            arbitrator: address(0),
            disputeReason: ""
        });

        orderExists[orderId] = true;

        emit EscrowCreated(orderId, msg.sender, _seller, msg.value, _productId);
    }

    function acceptOrder(uint256 _orderId) external validOrder(_orderId) onlySeller(_orderId) {
        EscrowOrder storage order = orders[_orderId];
        require(order.status == Status.PENDING, "Order not in PENDING state");

        order.status = Status.SELLER_ACCEPTED;
        emit OrderAccepted(_orderId, msg.sender);
    }

    function markShipped(uint256 _orderId) external validOrder(_orderId) onlySeller(_orderId) {
        EscrowOrder storage order = orders[_orderId];
        require(
            order.status == Status.SELLER_ACCEPTED,
            "Order must be accepted by seller first"
        );

        order.status = Status.SHIPPED;
        emit OrderShipped(_orderId);
    }

    function confirmDelivery(uint256 _orderId) external validOrder(_orderId) onlyBuyer(_orderId) {
        EscrowOrder storage order = orders[_orderId];
        require(order.status == Status.SHIPPED, "Order must be shipped first");
        require(!order.disputeOpened, "Cannot confirm delivery during dispute");

        order.status = Status.DELIVERED;
        emit DeliveryConfirmed(_orderId);

        // Automatically release funds to seller
        _releaseFunds(_orderId, order.seller);
    }

    function releaseFunds(uint256 _orderId) external validOrder(_orderId) onlyBuyer(_orderId) {
        EscrowOrder storage order = orders[_orderId];
        require(
            order.status == Status.DELIVERED || order.status == Status.SHIPPED,
            "Order not in valid state for release"
        );
        require(!order.disputeOpened, "Cannot release funds during dispute");

        _releaseFunds(_orderId, order.seller);
    }

    function _releaseFunds(uint256 _orderId, address _recipient) internal {
        EscrowOrder storage order = orders[_orderId];
        require(address(this).balance >= order.amount, "Insufficient contract balance");

        order.status = Status.COMPLETE;
        (bool success, ) = _recipient.call{value: order.amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(_orderId, _recipient, order.amount);
        emit OrderCompleted(_orderId);
    }

    function openDispute(
        uint256 _orderId,
        string memory _reason
    ) external validOrder(_orderId) onlyBuyer(_orderId) {
        EscrowOrder storage order = orders[_orderId];
        require(
            order.status == Status.SHIPPED || order.status == Status.SELLER_ACCEPTED,
            "Cannot open dispute in current state"
        );
        require(!order.disputeOpened, "Dispute already opened");

        order.disputeOpened = true;
        order.status = Status.DISPUTE;
        order.disputeReason = _reason;

        emit DisputeOpened(_orderId, msg.sender, _reason);
    }

    function resolveDispute(
        uint256 _orderId,
        address _winner
    ) external validOrder(_orderId) onlyAdmin {
        EscrowOrder storage order = orders[_orderId];
        require(order.status == Status.DISPUTE, "Order not in dispute");
        require(
            _winner == order.buyer || _winner == order.seller,
            "Winner must be buyer or seller"
        );

        order.status = Status.RESOLVED;
        order.arbitrator = msg.sender;

        (bool success, ) = _winner.call{value: order.amount}("");
        require(success, "Transfer failed");

        emit DisputeResolved(_orderId, _winner, order.amount, msg.sender);
        emit OrderCompleted(_orderId);
    }

    function checkTimeout(uint256 _orderId) external validOrder(_orderId) {
        EscrowOrder storage order = orders[_orderId];
        require(block.timestamp >= order.timeoutAt, "Timeout not reached");
        require(
            order.status == Status.PENDING || order.status == Status.SELLER_ACCEPTED,
            "Order not eligible for timeout"
        );
        require(!order.disputeOpened, "Cannot timeout during dispute");

        // Refund buyer on timeout
        _releaseFunds(_orderId, order.buyer);
    }

    function getOrder(
        uint256 _orderId
    ) external view validOrder(_orderId) returns (EscrowOrder memory) {
        return orders[_orderId];
    }

    function getOrderStatus(uint256 _orderId) external view validOrder(_orderId) returns (Status) {
        return orders[_orderId].status;
    }

    modifier validAmount() {
        require(msg.value > 0, "Amount must be greater than 0");
        _;
    }

    receive() external payable {
        revert("Direct payments not allowed");
    }
}
