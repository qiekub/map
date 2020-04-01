/*
 * OhTime
 */

let QUnit = require("qunitjs");
let OhTime = require("../../../src/js/model/OhTime");

QUnit.module("Model > OhTime");
QUnit.test("Constructor", function(assert) {
	var oh = new OhTime(0, 60);
	var oh2 = new OhTime(0);
	assert.expect(0);
});
QUnit.test("Get void", function(assert) {
	var oh = new OhTime();
	assert.equal(oh.get(), "off");
});
QUnit.test("Get without end", function(assert) {
	var oh = new OhTime(0);
	assert.equal(oh.get(), "00:00");
});
QUnit.test("Get start = end", function(assert) {
	var oh = new OhTime(10,10);
	assert.equal(oh.get(), "00:10");
});
QUnit.test("Get with end", function(assert) {
	var oh = new OhTime(0, 60);
	assert.equal(oh.get(), "00:00-01:00");
});
QUnit.test("Get start", function(assert) {
	var oh = new OhTime(10, 60);
	assert.equal(oh.getStart(), 10);
});
QUnit.test("Get end null", function(assert) {
	var oh = new OhTime(10);
	assert.equal(oh.getEnd(), null);
});
QUnit.test("Get end not null", function(assert) {
	var oh = new OhTime(10, 60);
	assert.equal(oh.getEnd(), 60);
});
QUnit.test("Equals same", function(assert) {
	var oh = new OhTime(10, 60);
	var oh2 = new OhTime(10, 60);
	assert.ok(oh.equals(oh2));
	assert.ok(oh2.equals(oh));
});
QUnit.test("Equals different", function(assert) {
	var oh = new OhTime(10, 60);
	var oh2 = new OhTime(42, 60);
	assert.notOk(oh.equals(oh2));
	assert.notOk(oh2.equals(oh));
});
