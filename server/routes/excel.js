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

// 파일 다운로드
router.post("/saveExcel", (req, res) => {
  var param = req.body;
  // console.log(param);
  var paramObj = JSON.parse(param.data);
  console.log(paramObj);
  var XLSX = require("XLSX");

  function datenum(v, date1904) {
    if (date1904) v += 1462;
    var epoch = Date.parse(v);
    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
  }

  function sheet_from_array_of_arrays(data, opts) {
    var ws = {};
    var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
    for (var R = 0; R != data.length; ++R) {
      for (var C = 0; C != data[R].length; ++C) {
        if (range.s.r > R) range.s.r = R;
        if (range.s.c > C) range.s.c = C;
        if (range.e.r < R) range.e.r = R;
        if (range.e.c < C) range.e.c = C;
        var cell = { v: data[R][C] };
        if (cell.v == null) continue;
        var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

        if (typeof cell.v === "number") cell.t = "n";
        else if (typeof cell.v === "boolean") cell.t = "b";
        else if (cell.v instanceof Date) {
          cell.t = "n";
          cell.z = XLSX.SSF._table[14];
          cell.v = datenum(cell.v);
        } else cell.t = "s";

        ws[cell_ref] = cell;
      }
    }
    if (range.s.c < 10000000) ws["!ref"] = XLSX.utils.encode_range(range);
    return ws;
  }

  /* original data */
  var data = [["지번주소", "도로명주소", "거리(km)", "시간(분)"]];
  var ws_name = "address";

  paramObj.map(function (obj) {
    var array = new Array();
    array.push(obj.address.jibunAddress ? obj.address.jibunAddress : "");
    array.push(obj.address.roadAddress ? obj.address.roadAddress : "");
    array.push(obj.distance ? obj.distance : "");
    array.push(obj.duration ? obj.duration : "");
    data.push(array);
  });

  function Workbook() {
    if (!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
  }

  var wb = new Workbook(),
    ws = sheet_from_array_of_arrays(data);

  /* add worksheet to workbook */
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;
  console.log(__dirname + "/../views/");
  var fileName = new Date().getTime() + "_test_address.xlsx";
  /* write file */
  XLSX.writeFile(wb, __dirname + "/../views/" + fileName);
  res.status(200).json({ success: true, fileName: fileName });
});

module.exports = router;
