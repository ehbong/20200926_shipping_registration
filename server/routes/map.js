/** @format */

var express = require("express");
const { get } = require("express/lib/response");
var router = express.Router();
var https = require("https");
const { clientId, clientSecret } = require("../../config/config");
const Client = require("node-rest-client").Client;
const client = new Client();
// 거리 및 경로 계산 direction 15 API 호출
router.post("/direction", function (req, res) {
  let params = req.body;
  let callUrl = `https://naveropenapi.apigw.ntruss.com/map-direction-15/v1/driving?start=${params["start[x]"]},${params["start[y]"]}&goal=${params["end[x]"]},${params["end[y]"]}&option=trafast`;
  console.log(callUrl);
  client.get(
    callUrl,
    {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": clientId,
        "X-NCP-APIGW-API-KEY": clientSecret,
      },
    },
    (data, response) => {
      res.status(200).json({ success: true, data });
    },
  );
});

module.exports = router;
