/*
 * OhRule
 */

let QUnit = require("qunitjs");
let OhRule = require("../../../src/js/model/OhRule");
let OhDate = require("../../../src/js/model/OhDate");
let OhTime = require("../../../src/js/model/OhTime");

QUnit.module("Model > OhRule");
QUnit.test("Constructor", function(assert) {
	assert.ok(new OhRule());
});
QUnit.test("Get date", function(assert) {
	var or = new OhRule();
	assert.equal(or.getDate().length, 0);
	
	var od1 = new OhDate("Apr 21-Aug 22", "day", [0,1,2,4,5,6]);
	or.addDate(od1);
	assert.equal(or.getDate().length, 1);
	assert.equal(or.getDate()[0], od1);
});
QUnit.test("Get time", function(assert) {
	var or = new OhRule();
	assert.equal(or.getTime().length, 0);
	
	var ot1 = new OhTime(10, 60);
	or.addTime(ot1);
	assert.equal(or.getTime().length, 1);
	assert.equal(or.getTime()[0], ot1);
});
QUnit.test("Get simple", function(assert) {
	var or = new OhRule();
	
	var od1 = new OhDate("Apr 21-Aug 22", "day", [0,1,2,4,5,6]);
	or.addDate(od1);
	
	var ot1 = new OhTime(10, 60);
	or.addTime(ot1);
	
	assert.equal(or.get(), "Apr 21-Aug 22 Fr-We 00:10-01:00");
});
QUnit.test("Get several date/time", function(assert) {
	var or = new OhRule();
	
	var od1 = new OhDate("Mar", "month", [0,1,2,4,5,6]);
	var od2 = new OhDate("Jul-Oct", "month", [0,1,2,4,5,6]);
	or.addDate(od1);
	or.addDate(od2);
	
	var ot1 = new OhTime(0, 1*60);
	var ot2 = new OhTime(3*60, 4*60);
	or.addTime(ot1);
	or.addTime(ot2);
	
	assert.equal(or.get(), "Mar,Jul-Oct Fr-We 00:00-01:00,03:00-04:00");
});
QUnit.test("Get time null", function(assert) {
	var or = new OhRule();
	
	var od1 = new OhDate("Mar", "month", [0,1,2,4,5,6]);
	var od2 = new OhDate("Jul-Oct", "month", [0,1,2,4,5,6]);
	or.addDate(od1);
	or.addDate(od2);
	
	var ot1 = new OhTime();
	or.addTime(ot1);
	
	assert.equal(or.get(), "Mar,Jul-Oct Fr-We off");
});
QUnit.test("Get time completely null", function(assert) {
	var or = new OhRule();
	
	var od1 = new OhDate("Mar", "month", [0,1,2,4,5,6]);
	var od2 = new OhDate("Jul-Oct", "month", [0,1,2,4,5,6]);
	or.addDate(od1);
	or.addDate(od2);

	assert.equal(or.get(), "Mar,Jul-Oct Fr-We off");
});
QUnit.test("Get date always", function(assert) {
	var or = new OhRule();
	
	var od1 = new OhDate("", "always", [0,1,2,4,5,6]);
	or.addDate(od1);
	
	var ot1 = new OhTime(0, 1*60);
	var ot2 = new OhTime(3*60, 4*60);
	or.addTime(ot1);
	or.addTime(ot2);
	
	assert.equal(or.get(), "Fr-We 00:00-01:00,03:00-04:00");
});
QUnit.test("Same time equal 1", function(assert) {
	var or1 = new OhRule();
	var or2 = new OhRule();
	
	var ot1 = new OhTime(10*60, 12*60);
	var ot2 = new OhTime(14*60, 16*60);
	
	or1.addTime(ot1);
	or1.addTime(ot2);
	
	or2.addTime(ot1);
	or2.addTime(ot2);
	
	assert.ok(or1.sameTime(or2));
	assert.ok(or2.sameTime(or1));
});
QUnit.test("Same time equal 2", function(assert) {
	var or1 = new OhRule();
	var or2 = new OhRule();
	
	var od1 = new OhDate("", "always", [0,1,2,3,4,5,6]);
	var od2 = new OhDate("Jun", "month", [3,4,5,6]);
	
	or1.addDate(od1);
	or2.addDate(od2);
	
	var ot1 = new OhTime(0, 24*60);
	var ot2 = new OhTime(0, 24*60);
	
	or1.addTime(ot1);
	or1.addTime(ot2);
	
	or2.addTime(ot1);
	or2.addTime(ot2);
	
	assert.ok(or1.sameTime(or2));
	assert.ok(or2.sameTime(or1));
});
QUnit.test("Same time different", function(assert) {
	var or1 = new OhRule();
	var or2 = new OhRule();
	
	var ot1 = new OhTime(10*60, 12*60);
	var ot2 = new OhTime(14*60, 16*60);
	var ot3 = new OhTime(14*60, 17*60);
	
	or1.addTime(ot1);
	or1.addTime(ot2);
	
	or2.addTime(ot1);
	or2.addTime(ot3);
	
	assert.notOk(or1.sameTime(or2));
	assert.notOk(or2.sameTime(or1));
});
QUnit.test("Add date simple", function(assert) {
	var or = new OhRule();
	assert.equal(or.getDate().length, 0);
	
	var od1 = new OhDate("Mar", "month", [0,1,2,4,5,6]);
	var od2 = new OhDate("Jul-Oct", "month", [0,1,2,4,5,6]);
	or.addDate(od1);
	or.addDate(od2);
	assert.equal(or.getDate().length, 2);
	assert.equal(or.getDate()[0], od1);
	assert.equal(or.getDate()[1], od2);
});
QUnit.test("Add date null", function(assert) {
	var or = new OhRule();
	
	try {
		or.addDate();
		assert.ok(false);
	}
	catch(e) {
		assert.expect(0);
	}
});
QUnit.test("Add date not same wide type", function(assert) {
	var or = new OhRule();
	assert.equal(or.getDate().length, 0);
	
	var od1 = new OhDate("Mar", "month", [0,1,2,4,5,6]);
	var od2 = new OhDate("Apr 21", "day", [0,1,2,4,5,6]);
	or.addDate(od1);
	try {
		or.addDate(od2);
		assert.ok(false);
	}
	catch(e) {
		assert.equal(or.getDate().length, 1);
		assert.equal(or.getDate()[0], od1);
	}
});
QUnit.test("Add date not same weekdays", function(assert) {
	var or = new OhRule();
	assert.equal(or.getDate().length, 0);
	
	var od1 = new OhDate("Mar", "month", [0,1,2,4,5,6]);
	var od2 = new OhDate("Jul-Oct", "month", [0,1]);
	or.addDate(od1);
	assert.equal(or.getDate().length, 1);
	
	try {
		or.addDate(od2);
		assert.ok(false);
	}
	catch(e) {
		assert.equal(or.getDate().length, 1);
		assert.equal(or.getDate()[0], od1);
	}
});
QUnit.test("Add date full year", function(assert) {
	var or = new OhRule();
	assert.equal(or.getDate().length, 0);
	
	var od1 = new OhDate("", "always", [0,1,2,4,5,6]);
	var od2 = new OhDate("Jul-Oct", "month", [0,1,2,4,5,6]);
	or.addDate(od1);
	or.addDate(od2);
	assert.equal(or.getDate().length, 1);
});
QUnit.test("Add date full year not same weekdays", function(assert) {
	var or = new OhRule();
	assert.equal(or.getDate().length, 0);
	
	var od1 = new OhDate("", "always", [0,1,2,4,5,6]);
	var od2 = new OhDate("Jul-Oct", "month", [6]);
	or.addDate(od1);
	assert.equal(or.getDate().length, 1);
	
	try {
		or.addDate(od2);
		assert.ok(false);
	}
	catch(e) {
		assert.equal(or.getDate().length, 1);
		assert.equal(or.getDate()[0], od1);
	}
});
QUnit.test("Add time off simple", function(assert) {
	var or = new OhRule();
	assert.equal(or.getTime().length, 0);
	
	var ot1 = new OhTime();
	or.addTime(ot1);
	assert.equal(or.getTime().length, 1);
});
QUnit.test("Add time off several", function(assert) {
	var or = new OhRule();
	assert.equal(or.getDate().length, 0);
	
	var ot1 = new OhTime();
	var ot2 = new OhTime(0, 3*60);
	or.addTime(ot1);
	assert.equal(or.getTime().length, 1);
	try {
		or.addTime(ot2);
		assert.ok(false);
	}
	catch(e) {
		assert.equal(or.getTime().length, 1);
		assert.equal(or.getTime()[0], ot1);
	}
});
QUnit.test("Add time several", function(assert) {
	var or = new OhRule();
	assert.equal(or.getTime().length, 0);
	
	var ot1 = new OhTime(2*60, 3*60);
	var ot2 = new OhTime(5*60, 7*60);
	or.addTime(ot1);
	or.addTime(ot2);
	assert.equal(or.getTime().length, 2);
	assert.equal(or.getTime()[0], ot1);
	assert.equal(or.getTime()[1], ot2);
});
QUnit.test("Is off 1", function(assert) {
	var or = new OhRule();
	assert.equal(or.getTime().length, 0);
	
	assert.ok(or.isOff());
	
	var ot1 = new OhTime();
	or.addTime(ot1);
	assert.equal(or.getTime().length, 1);
	assert.equal(or.getTime()[0], ot1);

	assert.ok(or.isOff());
});
QUnit.test("Is off 2", function(assert) {
	var or = new OhRule();
	assert.equal(or.getTime().length, 0);
	
	assert.ok(or.isOff());
	
	var ot1 = new OhTime(5*60, 7*60);
	or.addTime(ot1);
	assert.equal(or.getTime().length, 1);
	assert.equal(or.getTime()[0], ot1);

	assert.notOk(or.isOff());
});
QUnit.test("Add weekday", function(assert) {
	var or = new OhRule();
	assert.equal(or.getDate().length, 0);
	
	var od1 = new OhDate("Mar", "month", [0,1]);
	var od2 = new OhDate("Jul-Oct", "month", [0,1]);
	or.addDate(od1);
	or.addDate(od2);
	assert.equal(or.getDate().length, 2);
	assert.equal(or.getDate()[0], od1);
	assert.equal(or.getDate()[1], od2);
	
	or.addWeekday(5);
	assert.equal(or.getDate().length, 2);
	assert.equal(or.getDate()[0].getWeekdays(), "Mo,Tu,Sa");
	assert.equal(or.getDate()[1].getWeekdays(), "Mo,Tu,Sa");
});
QUnit.test("Add overwritten weekday", function(assert) {
	var or = new OhRule();
	assert.equal(or.getDate().length, 0);
	
	var od1 = new OhDate("Mar", "month", [0,1]);
	var od2 = new OhDate("Jul-Oct", "month", [0,1]);
	or.addDate(od1);
	or.addDate(od2);
	assert.equal(or.getDate().length, 2);
	assert.equal(or.getDate()[0], od1);
	assert.equal(or.getDate()[1], od2);
	
	or.addOverwrittenWeekday(5);
	assert.equal(or.getDate().length, 2);
	assert.equal(or.getDate()[0].getWeekdays(), "Mo,Tu,Sa");
	assert.equal(or.getDate()[1].getWeekdays(), "Mo,Tu,Sa");
});
QUnit.test("Add PH weekday", function(assert) {
	var or = new OhRule();
	assert.equal(or.getDate().length, 0);
	
	var od1 = new OhDate("Mar", "month", [0,1]);
	var od2 = new OhDate("Jul-Oct", "month", [0,1]);
	or.addDate(od1);
	or.addDate(od2);
	assert.equal(or.getDate().length, 2);
	assert.equal(or.getDate()[0], od1);
	assert.equal(or.getDate()[1], od2);
	
	or.addPhWeekday();
	assert.equal(or.getDate().length, 2);
	assert.equal(or.getDate()[0].getWeekdays(), "PH,Mo,Tu");
	assert.equal(or.getDate()[1].getWeekdays(), "PH,Mo,Tu");
});
