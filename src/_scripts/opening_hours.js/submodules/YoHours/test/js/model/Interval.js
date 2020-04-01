let QUnit = require("qunitjs");
let Interval = require("../../../src/js/model/Interval");

QUnit.module("Model > Interval");

QUnit.test("Constructor", function(assert) {
	assert.ok(new Interval(0,0,0,60));
});
QUnit.test("Basic", function(assert) {
	var interval = new Interval(0,1,2,3);
	assert.equal(interval.getStartDay(), 0);
	assert.equal(interval.getEndDay(), 1);
	assert.equal(interval.getFrom(), 2);
	assert.equal(interval.getTo(), 3);
});
QUnit.test("End as monday midnight", function(assert) {
	var interval = new Interval(5,0,60,0);
	assert.equal(interval.getStartDay(), 5);
	assert.equal(interval.getEndDay(), 6);
	assert.equal(interval.getFrom(), 60);
	assert.equal(interval.getTo(), 24*60);
});
