/*
 * OpeningHoursBuilder
 */

let QUnit = require("qunitjs");
let OpeningHoursBuilder = require("../../../src/js/model/OpeningHoursBuilder");
let DateRange = require("../../../src/js/model/DateRange");
let WideInterval = require("../../../src/js/model/WideInterval");
let Interval = require("../../../src/js/model/Interval");

QUnit.module("Model > OpeningHoursBuilder");
QUnit.test("Build void", function(assert) {
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build([]), "");
});
QUnit.test("Build Mo 08:00-10:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 8*60, 10*60));
	
	assert.equal(builder.build(dateranges), "Mo 08:00-10:00");
});
QUnit.test("Build Mo,We 08:00-10:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 8*60, 10*60));
	dateranges[0].getTypical().addInterval(new Interval(2, 2, 8*60, 10*60));
	
	assert.equal(builder.build(dateranges), "Mo,We 08:00-10:00");
});
QUnit.test("Build Mo-We 08:00-10:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 8*60, 10*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 8*60, 10*60));
	dateranges[0].getTypical().addInterval(new Interval(2, 2, 8*60, 10*60));
	
	assert.equal(builder.build(dateranges), "Mo-We 08:00-10:00");
});
QUnit.test("Build Mo-We 08:00-10:00; Sa,Su 07:00-13:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 8*60, 10*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 8*60, 10*60));
	dateranges[0].getTypical().addInterval(new Interval(2, 2, 8*60, 10*60));
	dateranges[0].getTypical().addInterval(new Interval(5, 5, 7*60, 13*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 7*60, 13*60));
	
	assert.equal(builder.build(dateranges), "Mo-We 08:00-10:00; Sa,Su 07:00-13:00");
});
QUnit.test("Build Mo,Tu 23:00-03:00 continuous", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 1, 23*60, 3*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 2, 23*60, 3*60));
	
	assert.equal(builder.build(dateranges), "Mo,Tu 23:00-03:00");
});
QUnit.test("Build Mo,Tu 23:00-03:00 following", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 23*60, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 0, 3*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 23*60, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(2, 2, 0, 3*60));
	
	assert.equal(builder.build(dateranges), "Mo,Tu 23:00-03:00");
});
/*QUnit.test("Build Mo,Su 23:00-03:00 continuous", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 1, 23*60, 3*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 0, 23*60, 3*60));
	
	assert.equal(builder.build(dateranges), "Mo,Su 23:00-03:00");
});*/
QUnit.test("Build Mo,Su 23:00-03:00 following", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 23*60, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 0, 3*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 23*60, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 0, 3*60));
	
	assert.equal(builder.build(dateranges), "Mo,Su 23:00-03:00");
});
QUnit.test("Build Mo 08:00-10:00 merging", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 8*60, 9*60));
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 9*60, 10*60));
	
	assert.equal(builder.build(dateranges), "Mo 08:00-10:00");
});
QUnit.test("Build Mo 08:00-24:00; Tu 00:00-09:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 1, 8*60, 9*60));
	
	assert.equal(builder.build(dateranges), "Mo 08:00-24:00; Tu 00:00-09:00");
});
QUnit.test("Build 08:00-18:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(2, 2, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(3, 3, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(4, 4, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(5, 5, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 8*60, 18*60));
	
	assert.equal(builder.build(dateranges), "08:00-18:00");
});
QUnit.test("Build 24/7 continuous", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 6, 0, 24*60));
	
	assert.equal(builder.build(dateranges), "24/7");
});
QUnit.test("Build 24/7 following", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 0, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 0, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(2, 2, 0, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(3, 3, 0, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(4, 4, 0, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(5, 5, 0, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 0, 24*60));
	
	assert.equal(builder.build(dateranges), "24/7");
});
QUnit.test("Build 24/7; Jun 08:00-18:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()), new DateRange(new WideInterval().month(6)) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 6, 0, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(1, 1, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(2, 2, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(3, 3, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(4, 4, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(5, 5, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(6, 6, 8*60, 18*60));
	
	assert.equal(builder.build(dateranges), "24/7; Jun 08:00-18:00");
});
QUnit.test("Build 24/7; Jun 08:00-18:00; Jun We off", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()), new DateRange(new WideInterval().month(6)) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 6, 0, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(1, 1, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(3, 3, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(4, 4, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(5, 5, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(6, 6, 8*60, 18*60));
	
	assert.equal(builder.build(dateranges), "24/7; Jun 08:00-18:00; Jun We off");
});
QUnit.test("Build 08:00-18:00; We off", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(3, 3, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(4, 4, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(5, 5, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 8*60, 18*60));
	
	assert.equal(builder.build(dateranges), "08:00-18:00; We off");
});
QUnit.test("Build 24/7; Jun Mo-We 08:00-18:00; Jun Th-Su off", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()), new DateRange(new WideInterval().month(6)) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 6, 0, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(1, 1, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(2, 2, 8*60, 18*60));
	
	assert.equal(builder.build(dateranges), "24/7; Jun Mo-We 08:00-18:00; Jun Th-Su off");
});
QUnit.test("Build 24/7; Jun Mo-We 08:00-18:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()), new DateRange(new WideInterval().month(6)) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 6, 0, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(1, 1, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(2, 2, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(3, 6, 0, 24*60));
	
	assert.equal(builder.build(dateranges), "24/7; Jun Mo-We 08:00-18:00");
});
QUnit.test("Build 24/7; Jun-Aug Mo-We 08:00-18:00; Jun-Aug Th-Su off", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()), new DateRange(new WideInterval().month(6, 8)) ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 6, 0, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(1, 1, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(2, 2, 8*60, 18*60));
	
	assert.equal(builder.build(dateranges), "24/7; Jun-Aug Mo-We 08:00-18:00; Jun-Aug Th-Su off");
});
QUnit.test("Build 24/7; Jun Mo 08:00-18:00; Jun Tu-Su off; PH off", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always()),
		new DateRange(new WideInterval().month(6)),
		new DateRange(new WideInterval().holiday("PH"))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 6, 0, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	
	assert.equal(builder.build(dateranges), "24/7; Jun Mo 08:00-18:00; Jun Tu-Su off; PH off");
});
QUnit.test("Build 24/7; Jun Mo 08:00-18:00; Jun Tu-Su off; PH off; SH Tu 09:00-17:00; SH Mo,We-Su off", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always()),
		new DateRange(new WideInterval().month(6)),
		new DateRange(new WideInterval().holiday("PH")),
		new DateRange(new WideInterval().holiday("SH"))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 6, 0, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	dateranges[3].getTypical().addInterval(new Interval(1, 1, 9*60, 17*60));
	
	assert.equal(builder.build(dateranges), "24/7; Jun Mo 08:00-18:00; Jun Tu-Su off; PH off; SH We-Mo off; SH Tu 09:00-17:00");
});
QUnit.test("Build Mo 08:00-18:00 grouping", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always()),
		new DateRange(new WideInterval().month(6)),
		new DateRange(new WideInterval().holiday("SH"))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	dateranges[2].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	
	assert.equal(builder.build(dateranges), "Mo 08:00-18:00");
});
QUnit.test("Build 24/7; week 01-15 We 05:00-07:00; PH off", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always()),
		new DateRange(new WideInterval().week(1, 15)),
		new DateRange(new WideInterval().holiday("PH"))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 6, 0, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 1, 0, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(2, 2, 5*60, 7*60));
	dateranges[1].getTypical().addInterval(new Interval(3, 6, 0, 24*60));
	
	assert.equal(builder.build(dateranges), "24/7; week 01-15 We 05:00-07:00; PH off");
});
QUnit.test("Build 24/7; week 01-15 Fr-We 05:00-07:00; PH off", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always()),
		new DateRange(new WideInterval().week(1, 15)),
		new DateRange(new WideInterval().holiday("PH"))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 6, 0, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 5*60, 7*60));
	dateranges[1].getTypical().addInterval(new Interval(1, 1, 5*60, 7*60));
	dateranges[1].getTypical().addInterval(new Interval(2, 2, 5*60, 7*60));
	dateranges[1].getTypical().addInterval(new Interval(3, 3, 0, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(4, 4, 5*60, 7*60));
	dateranges[1].getTypical().addInterval(new Interval(5, 5, 5*60, 7*60));
	dateranges[1].getTypical().addInterval(new Interval(6, 6, 5*60, 7*60));
	
	assert.equal(builder.build(dateranges), "24/7; week 01-15 Fr-We 05:00-07:00; PH off");
});
QUnit.test("Build 05:00-07:00; Th,Fr 00:00-24:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always())
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 5*60, 7*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 5*60, 7*60));
	dateranges[0].getTypical().addInterval(new Interval(2, 2, 5*60, 7*60));
	dateranges[0].getTypical().addInterval(new Interval(3, 3, 0, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(4, 4, 0, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(5, 5, 5*60, 7*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 5*60, 7*60));
	
	assert.equal(builder.build(dateranges), "05:00-07:00; Th,Fr 00:00-24:00");
});
QUnit.test("Build Mo-Fr 01:00-02:00; We off; Jun We 02:00-03:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always()),
		new DateRange(new WideInterval().month(6))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 1*60, 2*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 1*60, 2*60));
	dateranges[0].getTypical().addInterval(new Interval(3, 3, 1*60, 2*60));
	dateranges[0].getTypical().addInterval(new Interval(4, 4, 1*60, 2*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 1*60, 2*60));
	dateranges[1].getTypical().addInterval(new Interval(1, 1, 1*60, 2*60));
	dateranges[1].getTypical().addInterval(new Interval(2, 2, 2*60, 3*60));
	dateranges[1].getTypical().addInterval(new Interval(3, 3, 1*60, 2*60));
	dateranges[1].getTypical().addInterval(new Interval(4, 4, 1*60, 2*60));
	
	assert.equal(builder.build(dateranges), "Mo-Fr 01:00-02:00; We off; Jun We 02:00-03:00");
});
QUnit.test("Build 01:00-02:00; Jun Th 02:00-03:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always()),
		new DateRange(new WideInterval().month(6))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 1*60, 2*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 1*60, 2*60));
	dateranges[0].getTypical().addInterval(new Interval(2, 2, 1*60, 2*60));
	dateranges[0].getTypical().addInterval(new Interval(3, 3, 1*60, 2*60));
	dateranges[0].getTypical().addInterval(new Interval(4, 4, 1*60, 2*60));
	dateranges[0].getTypical().addInterval(new Interval(5, 5, 1*60, 2*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 1*60, 2*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 1*60, 2*60));
	dateranges[1].getTypical().addInterval(new Interval(1, 1, 1*60, 2*60));
	dateranges[1].getTypical().addInterval(new Interval(2, 2, 1*60, 2*60));
	dateranges[1].getTypical().addInterval(new Interval(3, 3, 2*60, 3*60));
	dateranges[1].getTypical().addInterval(new Interval(4, 4, 1*60, 2*60));
	dateranges[1].getTypical().addInterval(new Interval(5, 5, 1*60, 2*60));
	dateranges[1].getTypical().addInterval(new Interval(6, 6, 1*60, 2*60));
	
	assert.equal(builder.build(dateranges), "01:00-02:00; Jun Th 02:00-03:00");
});
QUnit.test("Build 24/7; week 01 Su 01:00-08:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always()),
		new DateRange(new WideInterval().week(1))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 6, 0*60, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 5, 0*60, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(6, 6, 1*60, 8*60));
	
	assert.equal(builder.build(dateranges), "24/7; week 01 Su 01:00-08:00");
});
QUnit.test("Build 24/7; week 01 Su 01:00-08:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always()),
		new DateRange(new WideInterval().week(1))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 6, 0*60, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 5, 0*60, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(6, 6, 1*60, 8*60));
	
	assert.equal(builder.build(dateranges), "24/7; week 01 Su 01:00-08:00");
});
QUnit.test("Build Tu,Su 23:00-01:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always())
	];
	
	dateranges[0].getTypical().addInterval(new Interval(1, 2, 23*60, 1*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 23*60, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 0*60, 1*60));
	
	assert.equal(builder.build(dateranges), "Tu,Su 23:00-01:00");
});
QUnit.test("Build Tu,Su 23:00-01:00; week 01 Tu,We off", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always()),
		new DateRange(new WideInterval().week(1))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(1, 2, 23*60, 1*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 23*60, 24*60));
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 0*60, 1*60));
	dateranges[1].getTypical().addInterval(new Interval(6, 6, 23*60, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 0*60, 1*60));
	
	assert.equal(builder.build(dateranges), "Tu,Su 23:00-01:00; week 01 Tu,We off");
});
QUnit.test("Build 08:00-18:00; Aug off", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always()),
		new DateRange(new WideInterval().month(8))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(2, 2, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(3, 3, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(4, 4, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(5, 5, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 8*60, 18*60));
	
	assert.equal(builder.build(dateranges), "08:00-18:00; Aug off");
});
QUnit.test("Build Mo 10:00; PH 11:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always()),
		new DateRange(new WideInterval().holiday("PH"))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 10*60, 10*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 11*60, 11*60));
	
	assert.equal(builder.build(dateranges), "Mo 10:00; PH 11:00");
});
QUnit.test("Build Mo-Fr 00:00-24:00; Aug-Sep Sa 00:00-24:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().always()),
		new DateRange(new WideInterval().month(8,9))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 4, 0*60, 24*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 5, 0*60, 24*60));
	
	assert.equal(builder.build(dateranges), "Mo-Fr 00:00-24:00; Aug-Sep Sa 00:00-24:00");
});
QUnit.test("Build May-Jun,Sep 14:00-18:00 (month factoring)", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().month(5,6)),
		new DateRange(new WideInterval().month(9))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 14*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 14*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(2, 2, 14*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(3, 3, 14*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(4, 4, 14*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(5, 5, 14*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 14*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 14*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(1, 1, 14*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(2, 2, 14*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(3, 3, 14*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(4, 4, 14*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(5, 5, 14*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(6, 6, 14*60, 18*60));
	
	assert.equal(builder.build(dateranges), "May-Jun,Sep 14:00-18:00");
});
QUnit.test("Build Jan 01-May 01,May 15-Oct 12 Mo,Fr 08:00-18:00 (day factoring)", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().day(1,1,1,5)),
		new DateRange(new WideInterval().day(15,5,12,10))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(4, 4, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 8*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(4, 4, 8*60, 18*60));
	
	assert.equal(builder.build(dateranges), "Jan 01-May 01,May 15-Oct 12 Mo,Fr 08:00-18:00");
});
QUnit.test("Build Mo-We 03:00-05:00; Jan 01-10,Feb 01-10 Tu off (off day factoring)", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(),
		new DateRange(new WideInterval().day(1,1,10,1)),
		new DateRange(new WideInterval().day(1,2,10,2))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 3*60, 5*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 3*60, 5*60));
	dateranges[0].getTypical().addInterval(new Interval(2, 2, 3*60, 5*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 3*60, 5*60));
	dateranges[1].getTypical().addInterval(new Interval(2, 2, 3*60, 5*60));
	dateranges[2].getTypical().addInterval(new Interval(0, 0, 3*60, 5*60));
	dateranges[2].getTypical().addInterval(new Interval(2, 2, 3*60, 5*60));
	
	assert.equal(builder.build(dateranges), "Mo-We 03:00-05:00; Jan 01-10,Feb 01-10 Tu off");
});
QUnit.test("Build Tu,Su 10:00-12:00; Jun Tu,Su off; Jun We,Sa 10:00-12:00 (off day factoring)", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(),
		new DateRange(new WideInterval().month(6))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 10*60, 12*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 10*60, 12*60));
	dateranges[1].getTypical().addInterval(new Interval(2, 2, 10*60, 12*60));
	dateranges[1].getTypical().addInterval(new Interval(5, 5, 10*60, 12*60));
	
	assert.equal(builder.build(dateranges), "Tu,Su 10:00-12:00; Jun Tu,Su off; Jun We,Sa 10:00-12:00");
});
QUnit.test("Build week 01-09 Mo 03:00-06:00 (week factoring)", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().week(1,2)),
		new DateRange(new WideInterval().week(3,9))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 3*60, 6*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 3*60, 6*60));
	
	assert.equal(builder.build(dateranges), "week 01-09 Mo 03:00-06:00");
});
QUnit.test("Build week 01-03,10-15 Mo 03:00-06:00 (week factoring)", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().week(1,3)),
		new DateRange(new WideInterval().week(10,15))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 3*60, 6*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 3*60, 6*60));
	
	assert.equal(builder.build(dateranges), "week 01-09 Mo 03:00-06:00");
});
QUnit.test("Build May-Jun,Sep Mo,Tu 14:00-18:00 (month factoring)", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().month(5,6)),
		new DateRange(new WideInterval().month(9))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 14*60, 18*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 14*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 14*60, 18*60));
	dateranges[1].getTypical().addInterval(new Interval(1, 1, 14*60, 18*60));
	
	assert.equal(builder.build(dateranges), "May-Jun,Sep Mo,Tu 14:00-18:00");
});
QUnit.test("Build Mo-Fr 12:00-14:00; PH,Sa,Su 12:00-16:00 (PH as weekday)", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(),
		new DateRange(new WideInterval().holiday("PH"))
	];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 12*60, 14*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 12*60, 14*60));
	dateranges[0].getTypical().addInterval(new Interval(2, 2, 12*60, 14*60));
	dateranges[0].getTypical().addInterval(new Interval(3, 3, 12*60, 14*60));
	dateranges[0].getTypical().addInterval(new Interval(4, 4, 12*60, 14*60));
	dateranges[0].getTypical().addInterval(new Interval(5, 5, 12*60, 16*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 12*60, 16*60));
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 12*60, 16*60));
	
	
	assert.equal(builder.build(dateranges), "Mo-Fr 12:00-14:00; PH,Sa,Su 12:00-16:00");
});
QUnit.test("Build PH,Mo-Sa 12:00-14:00 (PH as weekday defined first)", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [
		new DateRange(new WideInterval().holiday("PH")),
		new DateRange()
	];
	
	dateranges[1].getTypical().addInterval(new Interval(0, 0, 12*60, 14*60));
	dateranges[1].getTypical().addInterval(new Interval(1, 1, 12*60, 14*60));
	dateranges[1].getTypical().addInterval(new Interval(2, 2, 12*60, 14*60));
	dateranges[1].getTypical().addInterval(new Interval(3, 3, 12*60, 14*60));
	dateranges[1].getTypical().addInterval(new Interval(4, 4, 12*60, 14*60));
	dateranges[1].getTypical().addInterval(new Interval(5, 5, 12*60, 14*60));
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 12*60, 14*60));
	
	
	assert.equal(builder.build(dateranges), "PH,Mo-Sa 12:00-14:00");
});
QUnit.test("Build Su-Tu 12:00-14:00 (continuous week-end)", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange() ];
	
	dateranges[0].getTypical().addInterval(new Interval(0, 0, 12*60, 14*60));
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 12*60, 14*60));
	dateranges[0].getTypical().addInterval(new Interval(6, 6, 12*60, 14*60));
	
	
	assert.equal(builder.build(dateranges), "Su-Tu 12:00-14:00");
});
QUnit.test("Build Tu 00:00-24:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange() ];
	
	dateranges[0].getTypical().addInterval(new Interval(1, 1, 0*60, 24*60));
	
	assert.equal(builder.build(dateranges), "Tu 00:00-24:00");
});
QUnit.test("Build Tu,Th,Fr 08:00-12:00", function(assert) {
	var builder = new OpeningHoursBuilder();
	var dateranges = [ new DateRange(new WideInterval().always()) ];

	dateranges[0].getTypical().addInterval(new Interval(1, 1, 8*60, 12*60));
	dateranges[0].getTypical().addInterval(new Interval(3, 3, 8*60, 12*60));
	dateranges[0].getTypical().addInterval(new Interval(4, 4, 8*60, 12*60));

	assert.equal(builder.build(dateranges), "Tu-Fr 08:00-12:00; We off");
});
