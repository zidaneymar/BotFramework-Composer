"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('azure login plugin');
const credsMap = {};
// set authentication
const setAuthentication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    console.log(req.params);
    console.log(req.headers);
    res.status(200);
});
const verification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { accessToken, user } = req.body;
    if (!accessToken) {
        console.log('need authentication');
        // const reuslt = await interactiveLogin();
        // console.log(reuslt);
        res.redirect('https://microsoft.com/devicelogin');
        // res.status(400).json({
        //   statusCode: '400',
        //   message: 'need authentication',
        // });
    }
    else {
        // authentication
        console.log(accessToken);
        next();
    }
});
exports.default = (composer) => __awaiter(void 0, void 0, void 0, function* () {
    composer.addWebRoute('post', '/api/publish/subscriptions', verification);
    composer.addWebRoute('get', '/api/oauth2/callback', setAuthentication);
    composer.addWebRoute('post', '/api/oauth2/callback', setAuthentication);
});
//# sourceMappingURL=index.js.map