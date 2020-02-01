"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_1 = __importDefault(require("webpack"));
// import BuildManifestPlugin from "../plugins/build-manifest-plugin";
const base_1 = require("./base");
function createBrowserWebpackChain(_a) {
    var baseOptions = __rest(_a, []);
    const chain = base_1.baseWebpackChain(baseOptions);
    chain.target("web");
    if (baseOptions.dev) {
        chain.plugin("private/hmr-plugin").use(webpack_1.default.HotModuleReplacementPlugin);
    }
    chain.plugin("private/build-manifest").tap(([options]) => [
        Object.assign(Object.assign({}, options), { modules: true })
    ]);
    return chain;
}
exports.createBrowserWebpackChain = createBrowserWebpackChain;
