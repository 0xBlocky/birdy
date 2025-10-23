export var MessageType;
(function (MessageType) {
    MessageType[MessageType["REQUEST"] = 0] = "REQUEST";
    MessageType[MessageType["RESPONSE"] = 1] = "RESPONSE";
    MessageType[MessageType["STREAM"] = 2] = "STREAM";
})(MessageType || (MessageType = {}));
export var StreamType;
(function (StreamType) {
    StreamType[StreamType["TRADING_OPPORTUNITIES"] = 1] = "TRADING_OPPORTUNITIES";
    StreamType[StreamType["PRICE_UPDATES"] = 2] = "PRICE_UPDATES";
    StreamType[StreamType["ORDER_STATUS"] = 3] = "ORDER_STATUS";
    StreamType[StreamType["BALANCE_UPDATES"] = 4] = "BALANCE_UPDATES";
})(StreamType || (StreamType = {}));
//# sourceMappingURL=trading.js.map