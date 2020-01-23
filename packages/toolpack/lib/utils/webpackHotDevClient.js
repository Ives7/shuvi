"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hotDevClient_1 = __importDefault(require("./hotDevClient"));
exports.default = options => {
    const devClient = hotDevClient_1.default(options);
    devClient.subscribeToHmrEvent(obj => {
        // if (obj.action === "reloadPage") {
        //   return window.location.reload();
        // }
        // if (obj.action === "removedPage") {
        //   const [page] = obj.data;
        //   if (page === window.next.router.pathname) {
        //     return window.location.reload();
        //   }
        //   return;
        // }
        // if (obj.action === "addedPage") {
        //   const [page] = obj.data;
        //   if (
        //     page === window.next.router.pathname &&
        //     typeof window.next.router.components[page] === "undefined"
        //   ) {
        //     return window.location.reload();
        //   }
        //   return;
        // }
        // throw new Error("Unexpected action " + obj.action);
    });
    return devClient;
};
