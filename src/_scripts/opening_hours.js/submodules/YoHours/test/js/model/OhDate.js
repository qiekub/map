/*
 * OhDate
 */

let QUnit = require("qunitjs");
let OhDate = require("../../../src/js/model/OhDate");

QUnit.module("Model > OhDate");
QUnit.test("Constructor missing parameter", function(assert) {
	try {
		var od = new OhDate();
		assert.ok(false);
	}
	catch(e) {
		assert.ok(true);
	}
});
QUnit.test("Constructor valid parameter", function(assert) {
	assert.ok(new OhDate("Apr 21-Aug 22", "day", [0,1,3,5,6]));
});
QUnit.test("Get wide type", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [0,1,3,5,6]);
	assert.equal(od.getWideType(), "day");
});
QUnit.test("Get wide value", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [0,1,3,5,6]);
	assert.equal(od.getWideValue(), "Apr 21-Aug 22");
});
QUnit.test("Get wd sorted", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [0,1,3,5,6]);
	assert.equal(od.getWd()[0], 0);
	assert.equal(od.getWd()[1], 1);
	assert.equal(od.getWd()[2], 3);
	assert.equal(od.getWd()[3], 5);
	assert.equal(od.getWd()[4], 6);
});
QUnit.test("Get wd unsorted", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [5,3,0,6,1]);
	assert.equal(od.getWd()[0], 0);
	assert.equal(od.getWd()[1], 1);
	assert.equal(od.getWd()[2], 3);
	assert.equal(od.getWd()[3], 5);
	assert.equal(od.getWd()[4], 6);
});
QUnit.test("Same wd sorted", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [0,1,3,5,6]);
	assert.ok(od.sameWd([0,1,3,5,6]));
	assert.notOk(od.sameWd([0,2,5]));
});
QUnit.test("Same wd unsorted", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [5,3,0,6,1]);
	assert.ok(od.sameWd([0,1,3,5,6]));
	assert.notOk(od.sameWd([0,2,5]));
});
QUnit.test("Get weekdays 1", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [0,1,3,5]);
	assert.equal(od.getWeekdays(), "Mo,Tu,Th,Sa");
});
QUnit.test("Get weekdays 2", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [0,1,4,3,2,5]);
	assert.equal(od.getWeekdays(), "Mo-Sa");
});
QUnit.test("Get weekdays 3", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [0,6]);
	assert.equal(od.getWeekdays(), "Mo,Su");
});
QUnit.test("Get weekdays 4-1", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [6,0,1]);
	assert.equal(od.getWeekdays(), "Su-Tu");
});
QUnit.test("Get weekdays 4-2", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [5,6,0,1,3]);
	assert.equal(od.getWeekdays(), "Sa-Tu,Th");
});
QUnit.test("Get weekdays 4-3", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [0,3,6]);
	assert.equal(od.getWeekdays(), "Mo,Th,Su");
});
QUnit.test("Get weekdays 4-3", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [0,1,2,3,4,5,6]);
	assert.equal(od.getWeekdays(), "");
});
QUnit.test("Get weekdays 4-3", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [-2,0,1,5,6]);
	assert.equal(od.getWeekdays(), "PH,Sa-Tu");
});
QUnit.test("Get weekdays 5", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [0,1,2,4,5,6]);
	assert.equal(od.getWeekdays(), "Fr-We");
});
QUnit.test("Get weekdays 6", function(assert) {
	var od = new OhDate("Apr 21-Aug 22", "day", [0,1,2,3,4,5,6]);
	assert.equal(od.getWeekdays(), "");
});
QUnit.test("Same kind as valid", function(assert) {
	var od1 = new OhDate("Apr 21-Aug 22", "day", [0,1,2,4,5,6]);
	var od2 = new OhDate("Mar 01-Apr 02", "day", [0,1,2,4,5,6]);
	assert.ok(od1.sameKindAs(od2));
	assert.ok(od2.sameKindAs(od1));
});
QUnit.test("Same kind as invalid", function(assert) {
	var od1 = new OhDate("Apr 21-Aug 22", "day", [0,1,2,4,5,6]);
	var od2 = new OhDate("SH", "holiday", [0,1,2,4,5,6]);
	var od3 = new OhDate("Mar 01-Mar 15", "day", [4,5,6]);
	assert.notOk(od1.sameKindAs(od2));
	assert.notOk(od2.sameKindAs(od1));
	assert.notOk(od1.sameKindAs(od3));
	assert.notOk(od3.sameKindAs(od1));
});
QUnit.test("Equals same", function(assert) {
	var od1 = new OhDate("Apr 21-Aug 22", "day", [0,1,2,4,5,6]);
	var od2 = new OhDate("Apr 21-Aug 22", "day", [0,1,2,4,5,6]);
	assert.ok(od1.equals(od1));
	assert.ok(od1.equals(od2));
	assert.ok(od2.equals(od1));
	assert.ok(od2.equals(od2));
});
QUnit.test("Equals different", function(assert) {
	var od1 = new OhDate("Apr 21-Aug 22", "day", [0,1,2,4,5,6]);
	var od2 = new OhDate("", "always", [0,1,4,5,6]);
	assert.ok(od1.equals(od1));
	assert.notOk(od1.equals(od2));
	assert.notOk(od2.equals(od1));
	assert.ok(od2.equals(od2));
});
QUnit.test("Add weekday new", function(assert) {
	var od1 = new OhDate("Apr 21-Aug 22", "day", [0]);
	assert.equal(od1.getWd().length, 1);
	
	od1.addWeekday(5);
	assert.equal(od1.getWd().length, 2);
	assert.equal(od1.getWd()[0], 0);
	assert.equal(od1.getWd()[1], 5);
});
QUnit.test("Add weekday existing", function(assert) {
	var od1 = new OhDate("Apr 21-Aug 22", "day", [0, 3]);
	assert.equal(od1.getWd().length, 2);
	
	od1.addWeekday(3);
	assert.equal(od1.getWd().length, 2);
	assert.equal(od1.getWd()[0], 0);
	assert.equal(od1.getWd()[1], 3);
});
QUnit.test("Add overwritten weekday new", function(assert) {
	var od1 = new OhDate("Apr 21-Aug 22", "day", [0]);
	assert.equal(od1.getWeekdays(), "Mo");
	od1.addOverwrittenWeekday(2);
	assert.equal(od1.getWeekdays(), "Mo,We");
});
QUnit.test("Add overwritten weekday existing wd", function(assert) {
	var od1 = new OhDate("Apr 21-Aug 22", "day", [0,2]);
	assert.equal(od1.getWeekdays(), "Mo,We");
	od1.addOverwrittenWeekday(2);
	assert.equal(od1.getWeekdays(), "Mo,We");
});
QUnit.test("Add overwritten weekday existing over wd", function(assert) {
	var od1 = new OhDate("Apr 21-Aug 22", "day", [0,2]);
	assert.equal(od1.getWeekdays(), "Mo,We");
	od1.addOverwrittenWeekday(4);
	assert.equal(od1.getWeekdays(), "Mo,We,Fr");
	od1.addOverwrittenWeekday(4);
	assert.equal(od1.getWeekdays(), "Mo,We,Fr");
});
QUnit.test("Add PH weekday new", function(assert) {
	var od1 = new OhDate("Apr 21-Aug 22", "day", [0]);
	assert.equal(od1.getWeekdays(), "Mo");
	od1.addPhWeekday();
	assert.equal(od1.getWeekdays(), "PH,Mo");
});
QUnit.test("Add PH weekday existing wd", function(assert) {
	var od1 = new OhDate("Apr 21-Aug 22", "day", [0,2]);
	od1.addPhWeekday();
	assert.equal(od1.getWeekdays(), "PH,Mo,We");
	od1.addPhWeekday();
	assert.equal(od1.getWeekdays(), "PH,Mo,We");
});
