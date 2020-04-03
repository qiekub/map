/*
 * Day
 */

let QUnit = require("qunitjs");
let Day = require("../../../src/js/model/Day");
let Interval = require("../../../src/js/model/Interval");

QUnit.module("Model > Day");
QUnit.test("Constructor", function(assert) {
	assert.ok(new Day());
});
QUnit.test("Minutes array", function(assert) {
	var day = new Day();
	day.addInterval(new Interval(0, 0, 60, 120));
	
	var minutes = day.getAsMinutesArray();
	assert.equal(minutes.length, 24*60+1);
	for(var m=0; m <= 24*60; m++) {
		if(m >= 60 && m <= 120) {
			assert.ok(minutes[m]);
		}
		else {
			assert.notOk(minutes[m]);
		}
	}
});
QUnit.test("Raw intervals", function(assert) {
	var day = new Day();
	
	var it1 = new Interval(0, 0, 60, 120);
	var it2 = new Interval(0, 0, 360, 420);
	var it3 = new Interval(0, 0, 660, 720);
	
	var itId1 = day.addInterval(it1);
	var itId2 = day.addInterval(it2);
	var itId3 = day.addInterval(it3);
	
	//Check without deleting
	var intervals = day.getIntervals(false);
	assert.equal(intervals[itId1], it1);
	assert.equal(intervals[itId2], it2);
	assert.equal(intervals[itId3], it3);
	
	//Check with deleting
	day.removeInterval(itId2);
	var intervals2 = day.getIntervals(false);
	assert.equal(intervals[itId1], it1);
	assert.equal(intervals[itId2], undefined);
	assert.equal(intervals[itId3], it3);
});
QUnit.test("Cleaned intervals", function(assert) {
	var day = new Day();
	
	var it1 = new Interval(0, 0, 60, 120);
	var it2 = new Interval(0, 0, 120, 300);
	var it3 = new Interval(0, 0, 660, 720);
	
	var itId1 = day.addInterval(it1);
	var itId2 = day.addInterval(it2);
	var itId3 = day.addInterval(it3);
	
	//Check without deleting
	var intervals = day.getIntervals(true);
	assert.equal(intervals.length, 2);
	var resIt1 = intervals[0];
	assert.equal(resIt1.getStartDay(), 0);
	assert.equal(resIt1.getEndDay(), 0);
	assert.equal(resIt1.getFrom(), 60);
	assert.equal(resIt1.getTo(), 300);
	
	var resIt2 = intervals[1];
	assert.equal(resIt2.getStartDay(), 0);
	assert.equal(resIt2.getEndDay(), 0);
	assert.equal(resIt2.getFrom(), 660);
	assert.equal(resIt2.getTo(), 720);
	
	//Check with deleting
	day.removeInterval(itId2);
	var intervals2 = day.getIntervals(true);
	assert.equal(intervals2.length, 2);
	var res2It1 = intervals2[0];
	assert.equal(res2It1.getStartDay(), 0);
	assert.equal(res2It1.getEndDay(), 0);
	assert.equal(res2It1.getFrom(), 60);
	assert.equal(res2It1.getTo(), 120);
	
	var res2It2 = intervals2[1];
	assert.equal(res2It2.getStartDay(), 0);
	assert.equal(res2It2.getEndDay(), 0);
	assert.equal(res2It2.getFrom(), 660);
	assert.equal(res2It2.getTo(), 720);
});
QUnit.test("Edit intervals", function(assert) {
	var day = new Day();
	
	var it1 = new Interval(0, 0, 60, 120);
	var it2 = new Interval(0, 0, 360, 420);
	var it3 = new Interval(0, 0, 660, 720);
	var it4 = new Interval(0, 0, 664, 724);
	
	var itId1 = day.addInterval(it1);
	var itId2 = day.addInterval(it2);
	var itId3 = day.addInterval(it3);
	
	//Edit
	day.editInterval(itId2, it4);
	
	//Check
	var intervals = day.getIntervals(false);
	assert.equal(intervals[itId1], it1);
	assert.equal(intervals[itId2], it4);
	assert.equal(intervals[itId3], it3);
});
QUnit.test("Copy intervals", function(assert) {
	var day1 = new Day();
	
	var it1 = new Interval(0, 0, 60, 120);
	var it2 = new Interval(0, 0, 360, 420);
	
	var itId1 = day1.addInterval(it1);
	var itId2 = day1.addInterval(it2);
	
	var day2 = new Day();
	day2.copyIntervals(day1.getIntervals(false));
	
	//Check
	var intervals = day2.getIntervals(false);
	var resIt1 = intervals[0];
	assert.equal(resIt1.getStartDay(), 0);
	assert.equal(resIt1.getEndDay(), 0);
	assert.equal(resIt1.getFrom(), 60);
	assert.equal(resIt1.getTo(), 120);
	
	var resIt2 = intervals[1];
	assert.equal(resIt2.getStartDay(), 0);
	assert.equal(resIt2.getEndDay(), 0);
	assert.equal(resIt2.getFrom(), 360);
	assert.equal(resIt2.getTo(), 420);
	
});
QUnit.test("Clear intervals", function(assert) {
	var day = new Day();
	
	var it1 = new Interval(0, 0, 60, 120);
	var it2 = new Interval(0, 0, 360, 420);
	var it3 = new Interval(0, 0, 660, 720);
	
	var itId1 = day.addInterval(it1);
	var itId2 = day.addInterval(it2);
	var itId3 = day.addInterval(it3);
	
	//Check before
	var intervals = day.getIntervals(false);
	assert.equal(intervals.length, 3);
	
	day.clearIntervals();
	
	//Check after
	var intervals2 = day.getIntervals(false);
	assert.equal(intervals2.length, 0);
});
QUnit.test("Same as", function(assert) {
	var day1 = new Day();
	var day2 = new Day();
	
	var it1 = new Interval(0, 0, 60, 120);
	var it2 = new Interval(0, 0, 360, 420);
	var it3 = new Interval(0, 0, 660, 720);
	
	day1.addInterval(it1);
	day1.addInterval(it2);
	day1.addInterval(it3);
	
	day2.addInterval(it1);
	day2.addInterval(it2);
	day2.addInterval(it3);
	
	//Same
	assert.ok(day1.sameAs(day2));
	
	day2.removeInterval(1);
	
	//Not same
	assert.notOk(day1.sameAs(day2));
});
