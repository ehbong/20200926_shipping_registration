/** @format */

const express = require("express");
const router = express.Router();
const multiparty = require("multiparty");
const xlsx = require("xlsx");

//=================================
//            excel
//=================================

router.post("", (req, res) => {
  const resData = {};

  const form = new multiparty.Form({
    autoFiles: true,
  });

  form.on("file", (name, file) => {
    // 파일 불러오기
    const workbook = xlsx.readFile(file.path);
    // 시트 이름을 키 배열로 추출
    const sheetnames = Object.keys(workbook.Sheets);

    let i = sheetnames.length;
    // 반복문을 통해서 각 시트의 데이터를 json데이터로 resData에 담음
    while (i--) {
      const sheetname = sheetnames[i];
      resData[sheetname] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
    }
  });

  form.on("close", () => {
    //res.send(resData);
    res.status(200).json({ success: true, resData });
  });

  form.parse(req);
});

module.exports = router;
