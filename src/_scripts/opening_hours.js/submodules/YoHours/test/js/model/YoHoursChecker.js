/*
 * YoHoursChecker
 */

let QUnit = require("qunitjs");
let YoHoursChecker = require("../../../src/js/model/YoHoursChecker");

QUnit.module("Model > YoHoursChecker");
QUnit.test("Check valid", function(assert) {
	var checker = new YoHoursChecker();
	assert.ok(checker.canRead("24/7; week 01: Su 01:00-08:00"));
});
QUnit.test("Check invalid", function(assert) {
	var checker = new YoHoursChecker();
	assert.notOk(checker.canRead("24/7; week 01: Su 01:00-08:00 || \"on appointment\""));
	assert.notOk(checker.canRead("not valid oh string"));
	assert.notOk(checker.canRead("nothing"));
	assert.notOk(checker.canRead("24/24, 7/7"));
});
