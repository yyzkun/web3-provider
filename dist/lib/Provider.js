"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
var web3_1 = __importDefault(require("web3"));
var Wallet_1 = require("./Wallet");
var Chain_1 = require("./Chain");
var Config_1 = require("./Config");
var Callback_1 = require("./Callback");
var Provider = /** @class */ (function () {
    function Provider(rpc, privatekey) {
        this.config = Config_1.config;
        this.callbacks = new Callback_1.CallbackControll();
        this.nonceWait = false;
        this.promiseWait = [];
        var originProvider;
        if (/^http/.test(rpc)) {
            originProvider = new web3_1.default.providers.HttpProvider(rpc);
        }
        else if (/^ws/.test(rpc)) {
            originProvider = new web3_1.default.providers.WebsocketProvider(rpc);
        }
        else {
            throw new Error('rpc invalid');
        }
        this.originSendFunc = originProvider.send.bind(originProvider);
        this.web3 = new web3_1.default(originProvider);
        this.wallet = new Wallet_1.Wallet(privatekey, this);
        this.chain = new Chain_1.Chain(this);
    }
    Provider.prototype.send = function (data, callback) {
        this.callbacks.pushCallback(data.id.toString(), callback);
        switch (data.method) {
            case 'net_version':
            case 'eth_chainId':
                this.chainId(data);
                break;
            case 'eth_accounts':
                this.response(data.id, this.wrapResponse(data, this.wallet.address));
                break;
            case 'eth_sendTransaction':
                this.sendTransaction(data);
                break;
            default:
                this.sendRequest(data);
                break;
        }
    };
    Provider.prototype.chainId = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = this.response;
                        _b = [data.id];
                        _c = this.wrapResponse;
                        _d = [data];
                        return [4 /*yield*/, this.chain.getChainId()];
                    case 1:
                        _a.apply(this, _b.concat([_c.apply(this, _d.concat([_e.sent()]))]));
                        return [2 /*return*/];
                }
            });
        });
    };
    Provider.prototype.sendTransaction = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var promise, tx, nonce, txSigned, error_1, cb;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.nonceWait) return [3 /*break*/, 2];
                        promise = new Promise(function (resolve, reject) {
                            _this.promiseWait.push(resolve);
                        });
                        return [4 /*yield*/, promise];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.nonceWait = true;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        tx = data.params[0];
                        return [4 /*yield*/, this.wallet.getNonce()];
                    case 4:
                        nonce = _a.sent();
                        tx.nonce = '0x' + parseInt(nonce + '').toString(16);
                        return [4 /*yield*/, this.wallet.signedTx(tx)];
                    case 5:
                        txSigned = _a.sent();
                        this.sendRequest({
                            id: data.id,
                            jsonrpc: '2.0',
                            method: 'eth_sendRawTransaction',
                            params: [txSigned]
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        this.response(data.id, null, error_1);
                        return [3 /*break*/, 7];
                    case 7:
                        cb = this.promiseWait.shift();
                        if (cb) {
                            cb();
                        }
                        else {
                            this.nonceWait = false;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Provider.prototype.sendRequest = function (data) {
        var _this = this;
        this.originSendFunc(data, function (err, res) {
            _this.response(data.id, res, err);
        });
    };
    Provider.prototype.wrapResponse = function (data, result) {
        return {
            jsonrpc: '2.0',
            id: data.id,
            result: result
        };
    };
    Provider.prototype.response = function (id, responseData, error) {
        this.callbacks.emit(id.toString(), responseData, error);
    };
    return Provider;
}());
exports.Provider = Provider;