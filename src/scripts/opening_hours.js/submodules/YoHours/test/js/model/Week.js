/*
 * Week
 */

let QUnit = require("qunitjs");
let Week = require("../../../src/js/model/Week");
let Interval = require("../../../src/js/model/Interval");

QUnit.module("Model > Week");
QUnit.test("Constructor", function(assert) {
	assert.ok(new Week());
});
QUnit.test("Minutes array", function(assert) {
	var week = new Week();
	week.addInterval(new Interval(0, 0, 60, 120));
	week.addInterval(new Interval(1, 2, 60, 120));
	
	var minutes = week.getAsMinutesArray();
	assert.equal(minutes.length, 7);
	for(var d=0; d < 7; d++) {
		assert.equal(minutes[d].length, 24*60+1);
		for(var m=0; m <= 24*60; m++) {
			if(d == 0) {
				if(m >= 60 && m <= 120) {
					assert.ok(minutes[d][m]);
				}
				else {
					assert.notOk(minutes[d][m]);
				}
			}
			else if(d==1) {
				if(m >= 60) {
					assert.ok(minutes[d][m]);
				}
				else {
					assert.notOk(minutes[d][m]);
				}
			}
			else if(d==2) {
				if(m <= 120) {
					assert.ok(minutes[d][m]);
				}
				else {
					assert.notOk(minutes[d][m]);
				}
			}
			else {
				assert.notOk(minutes[d][m]);
			}
		}
	}
});
QUnit.test("Raw intervals", function(assert) {
	var week = new Week();
	
	var it1 = new Interval(0, 0, 60, 120);
	var it2 = new Interval(1, 2, 360, 420);
	var it3 = new Interval(5, 6, 660, 720);
	
	var itId1 = week.addInterval(it1);
	var itId2 = week.addInterval(it2);
	var itId3 = week.addInterval(it3);
	
	//Check without deleting
	var intervals = week.getIntervals(false);
	assert.equal(intervals[itId1], it1);
	assert.equal(intervals[itId2], it2);
	assert.equal(intervals[itId3], it3);
	
	//Check with deleting
	week.removeInterval(itId2);
	var intervals2 = week.getIntervals(false);
	assert.equal(intervals[itId1], it1);
	assert.equal(intervals[itId2], undefined);
	assert.equal(intervals[itId3], it3);
});
QUnit.test("Cleaned intervals simple", function(assert) {
	var week = new Week();
	
	var it1 = new Interval(0, 1, 60, 120);
	var it2 = new Interval(1, 2, 120, 300);
	var it3 = new Interval(0, 0, 660, 720);
	var it4 = new Interval(5, 5, 740, 830);
	
	var itId1 = week.addInterval(it1);
	var itId2 = week.addInterval(it2);
	var itId3 = week.addInterval(it3);
	var itId4 = week.addInterval(it4);
	
	//Check without deleting
	var intervals = week.getIntervals(true);
	assert.equal(intervals.length, 2);
	var resIt1 = intervals[0];
	assert.equal(resIt1.getStartDay(), 0);
	assert.equal(resIt1.getEndDay(), 2);
	assert.equal(resIt1.getFrom(), 60);
	assert.equal(resIt1.getTo(), 300);
	
	var resIt2 = intervals[1];
	assert.equal(resIt2.getStartDay(), 5);
	assert.equal(resIt2.getEndDay(), 5);
	assert.equal(resIt2.getFrom(), 740);
	assert.equal(resIt2.getTo(), 830);
	
	//Check with deleting
	week.removeInterval(itId2);
	var intervals2 = week.getIntervals(true);
	assert.equal(intervals2.length, 2);
	var res2It1 = intervals2[0];
	assert.equal(res2It1.getStartDay(), 0);
	assert.equal(res2It1.getEndDay(), 1);
	assert.equal(res2It1.getFrom(), 60);
	assert.equal(res2It1.getTo(), 120);
	
	var res2It2 = intervals2[1];
	assert.equal(res2It2.getStartDay(), 5);
	assert.equal(res2It2.getEndDay(), 5);
	assert.equal(res2It2.getFrom(), 740);
	assert.equal(res2It2.getTo(), 830);
});
QUnit.test("Cleaned intervals midnight", function(assert) {
	var week = new Week();
	
	var it1 = new Interval(0, 0, 60, 24*60);
	var it2 = new Interval(1, 1, 0, 300);
	var it3 = new Interval(2, 3, 300, 0);
	var it4 = new Interval(3, 3, 0, 450);
	
	var itId1 = week.addInterval(it1);
	var itId2 = week.addInterval(it2);
	var itId3 = week.addInterval(it3);
	var itId4 = week.addInterval(it4);
	
	//Check without deleting
	var intervals = week.getIntervals(true);
	assert.equal(intervals.length, 2);
	var resIt1 = intervals[0];
	assert.equal(resIt1.getStartDay(), 0);
	assert.equal(resIt1.getEndDay(), 1);
	assert.equal(resIt1.getFrom(), 60);
	assert.equal(resIt1.getTo(), 300);
	
	var resIt2 = intervals[1];
	assert.equal(resIt2.getStartDay(), 2);
	assert.equal(resIt2.getEndDay(), 3);
	assert.equal(resIt2.getFrom(), 300);
	assert.equal(resIt2.getTo(), 450);
});
QUnit.test("Edit intervals", function(assert) {
	var week = new Week();
	
	var it1 = new Interval(0, 0, 60, 120);
	var it2 = new Interval(1, 1, 360, 420);
	var it3 = new Interval(2, 2, 660, 720);
	var it4 = new Interval(3, 3, 664, 724);
	
	var itId1 = week.addInterval(it1);
	var itId2 = week.addInterval(it2);
	var itId3 = week.addInterval(it3);
	
	//Edit
	week.editInterval(itId2, it4);
	
	//Check
	var intervals = week.getIntervals(false);
	assert.equal(intervals[itId1], it1);
	assert.equal(intervals[itId2], it4);
	assert.equal(intervals[itId3], it3);
});
QUnit.test("Copy intervals", function(assert) {
	var week1 = new Week();
	
	var it1 = new Interval(0, 1, 60, 120);
	var it2 = new Interval(3, 4, 360, 420);
	
	var itId1 = week1.addInterval(it1);
	var itId2 = week1.addInterval(it2);
	
	var week2 = new Week();
	week2.copyIntervals(week1.getIntervals(false));
	
	//Check
	var intervals = week2.getIntervals(false);
	var resIt1 = intervals[0];
	assert.equal(resIt1.getStartDay(), 0);
	assert.equal(resIt1.getEndDay(), 1);
	assert.equal(resIt1.getFrom(), 60);
	assert.equal(resIt1.getTo(), 120);
	
	var resIt2 = intervals[1];
	assert.equal(resIt2.getStartDay(), 3);
	assert.equal(resIt2.getEndDay(), 4);
	assert.equal(resIt2.getFrom(), 360);
	assert.equal(resIt2.getTo(), 420);
});
QUnit.test("Remove intervals during day", function(assert) {
	var week = new Week();
	
	var it1 = new Interval(0, 0, 60, 120);
	var it2 = new Interval(2, 4, 360, 420);
	
	var itId1 = week.addInterval(it1);
	var itId2 = week.addInterval(it2);
	
	//Check before
	var intervals = week.getIntervals(false);
	assert.equal(intervals.length, 2);
	
	week.removeIntervalsDuringDay(3);
	
	//Check after
	var intervals2 = week.getIntervals(false);
	assert.equal(intervals2.length, 4);
	assert.equal(intervals2[itId1], it1);
	
	var resIt2p1 = intervals2[2];
	assert.equal(resIt2p1.getStartDay(), 2);
	assert.equal(resIt2p1.getEndDay(), 2);
	assert.equal(resIt2p1.getFrom(), 360);
	assert.equal(resIt2p1.getTo(), 24*60);
	
	var resIt2p2 = intervals2[3];
	assert.equal(resIt2p2.getStartDay(), 4);
	assert.equal(resIt2p2.getEndDay(), 4);
	assert.equal(resIt2p2.getFrom(), 0);
	assert.equal(resIt2p2.getTo(), 420);
});
QUnit.test("Remove intervals during day 2", function(assert) {
	var week = new Week();
	
	var it1 = new Interval(0, 0, 8*60, 18*60);
	var it2 = new Interval(1, 1, 8*60, 18*60);
	var it3 = new Interval(2, 2, 8*60, 18*60);
	var it4 = new Interval(3, 3, 8*60, 18*60);
	var it5 = new Interval(4, 4, 8*60, 18*60);
	var it6 = new Interval(5, 5, 8*60, 18*60);
	var it7 = new Interval(6, 6, 8*60, 18*60);
	
	var itId1 = week.addInterval(it1);
	var itId2 = week.addInterval(it2);
	var itId3 = week.addInterval(it3);
	var itId4 = week.addInterval(it4);
	var itId5 = week.addInterval(it5);
	var itId6 = week.addInterval(it6);
	var itId7 = week.addInterval(it7);
	
	//Check before
	var intervals = week.getIntervals(false);
	assert.equal(intervals.length, 7);
	
	week.removeIntervalsDuringDay(1);
	
	//Check after
	var intervals2 = week.getIntervals(false);
	assert.equal(intervals2.length, 7);
	assert.equal(intervals2[itId1], it1);
	assert.equal(intervals2[itId2], undefined);
	assert.equal(intervals2[itId3], it3);
	assert.equal(intervals2[itId4], it4);
	assert.equal(intervals2[itId5], it5);
	assert.equal(intervals2[itId6], it6);
	assert.equal(intervals2[itId7], it7);
});
QUnit.test("Remove intervals during day 3 (over night)", function(assert) {
	var week = new Week();
	
	var it1 = new Interval(0, 1, 23*60, 3*60);
	var it2 = new Interval(1, 2, 23*60, 3*60);
	var it3 = new Interval(2, 3, 23*60, 3*60);
	
	var itId1 = week.addInterval(it1);
	var itId2 = week.addInterval(it2);
	var itId3 = week.addInterval(it3);

	//Check before
	var intervals = week.getIntervals(false);
	assert.equal(intervals.length, 3);
	
	week.removeIntervalsDuringDay(1);
	
	//Check after
	var intervals2 = week.getIntervals(false);
	assert.equal(intervals2.length, 3);
	assert.equal(intervals2[itId1], it1);
	assert.equal(intervals2[itId2], undefined);
	assert.equal(intervals2[itId3], it3);
});
QUnit.test("Same as", function(assert) {
	var week1 = new Week();
	var week2 = new Week();
	
	var it1 = new Interval(0, 1, 60, 120);
	var it2 = new Interval(3, 3, 360, 420);
	var it3 = new Interval(4, 6, 660, 720);
	
	week1.addInterval(it1);
	week1.addInterval(it2);
	week1.addInterval(it3);
	
	week2.addInterval(it1);
	week2.addInterval(it2);
	week2.addInterval(it3);
	
	//Same
	assert.ok(week1.sameAs(week2));
	
	week2.removeInterval(1);
	
	//Not same
	assert.notOk(week1.sameAs(week2));
});
QUnit.test("Get intervals diff simple", function(assert) {
	var week1 = new Week();
	var week2 = new Week();
	
	var it1 = new Interval(0,6,0,24*60);
	week1.addInterval(it1);
	
	var it2 = new Interval(0,3,0,24*60);
	var it3 = new Interval(5,6,0,24*60);
	var it4 = new Interval(4,4,8*60,18*60);
	week2.addInterval(it2);
	week2.addInterval(it3);
	week2.addInterval(it4);
	
	var result = week2.getIntervalsDiff(week1);
	assert.equal(result.open.length, 1);
	assert.equal(result.closed.length, 0);
	
	var resIt1 = result.open[0];
	assert.equal(resIt1.getStartDay(), 4);
	assert.equal(resIt1.getEndDay(), 4);
	assert.equal(resIt1.getFrom(), 8*60);
	assert.equal(resIt1.getTo(), 18*60);
});
QUnit.test("Get intervals diff day off", function(assert) {
	var week1 = new Week();
	var week2 = new Week();
	
	var it1 = new Interval(0,6,0,24*60);
	week1.addInterval(it1);
	
	var it2 = new Interval(0,3,0,24*60);
	var it3 = new Interval(5,6,0,24*60);
	week2.addInterval(it2);
	week2.addInterval(it3);
	
	var result = week2.getIntervalsDiff(week1);
	assert.equal(result.open.length, 0);
	assert.equal(result.closed.length, 1);
	
	var resIt1 = result.closed[0];
	assert.equal(resIt1.getStartDay(), 4);
	assert.equal(resIt1.getEndDay(), 4);
	assert.equal(resIt1.getFrom(), 0);
	assert.equal(resIt1.getTo(), 24*60);
});
QUnit.test("Get intervals diff quasi closed", function(assert) {
	var week1 = new Week();
	var week2 = new Week();
	
	var it1 = new Interval(0,6,0,24*60);
	week1.addInterval(it1);
	
	var it2 = new Interval(3,3,18*60,23*60);
	week2.addInterval(it2);
	
	var result = week2.getIntervalsDiff(week1);
	assert.equal(result.open.length, 1);
	assert.equal(result.closed.length, 2);
	
	var resIt1 = result.open[0];
	assert.equal(resIt1.getStartDay(), 3);
	assert.equal(resIt1.getEndDay(), 3);
	assert.equal(resIt1.getFrom(), 18*60);
	assert.equal(resIt1.getTo(), 23*60);
	
	var resIt2 = result.closed[0];
	assert.equal(resIt2.getStartDay(), 0);
	assert.equal(resIt2.getEndDay(), 2);
	assert.equal(resIt2.getFrom(), 0);
	assert.equal(resIt2.getTo(), 24*60);
	
	var resIt3 = result.closed[1];
	assert.equal(resIt3.getStartDay(), 4);
	assert.equal(resIt3.getEndDay(), 6);
	assert.equal(resIt3.getFrom(), 0);
	assert.equal(resIt3.getTo(), 24*60);
});
QUnit.test("Get intervals diff many changes", function(assert) {
	var week1 = new Week();
	var week2 = new Week();
	
	var it1 = new Interval(0,0,10*60,12*60);
	var it2 = new Interval(0,0,13*60,16*60);
	var it3 = new Interval(1,1,10*60,12*60);
	var it4 = new Interval(1,1,13*60,16*60);
	var it5 = new Interval(2,2,10*60,12*60);
	var it6 = new Interval(2,2,13*60,16*60);
	var it7 = new Interval(3,3,10*60,12*60);
	var it8 = new Interval(3,3,13*60,16*60);
	var it9 = new Interval(4,4,8*60,12*60);
	var it10 = new Interval(4,4,13*60,18*60);
	week1.addInterval(it1);
	week1.addInterval(it2);
	week1.addInterval(it3);
	week1.addInterval(it4);
	week1.addInterval(it5);
	week1.addInterval(it6);
	week1.addInterval(it7);
	week1.addInterval(it8);
	week1.addInterval(it9);
	week1.addInterval(it10);
	
	var it11 = new Interval(0,0,10*60,16*60);
	var it12 = new Interval(1,1,10*60,12*60);
	var it13 = new Interval(1,1,13*60,16*60);
	var it14 = new Interval(3,3,8*60,10*60);
	var it15 = new Interval(3,3,12*60,13*60);
	var it16 = new Interval(4,4,10*60,16*60);
	var it18 = new Interval(5,5,10*60,12*60);
	var it19 = new Interval(5,5,13*60,16*60);
	week2.addInterval(it11);
	week2.addInterval(it12);
	week2.addInterval(it13);
	week2.addInterval(it14);
	week2.addInterval(it15);
	week2.addInterval(it16);
	week2.addInterval(it18);
	week2.addInterval(it19);
	
	var result = week2.getIntervalsDiff(week1);
	assert.equal(result.open.length, 6);
	assert.equal(result.closed.length, 1);
	
	var resIt1 = result.open[0];
	assert.equal(resIt1.getStartDay(), 0);
	assert.equal(resIt1.getEndDay(), 0);
	assert.equal(resIt1.getFrom(), 10*60);
	assert.equal(resIt1.getTo(), 16*60);
	
	var resIt2 = result.closed[0];
	assert.equal(resIt2.getStartDay(), 2);
	assert.equal(resIt2.getEndDay(), 2);
	assert.equal(resIt2.getFrom(), 0);
	assert.equal(resIt2.getTo(), 24*60);
	
	var resIt3 = result.open[1];
	assert.equal(resIt3.getStartDay(), 3);
	assert.equal(resIt3.getEndDay(), 3);
	assert.equal(resIt3.getFrom(), 8*60);
	assert.equal(resIt3.getTo(), 10*60);
	
	var resIt4 = result.open[2];
	assert.equal(resIt4.getStartDay(), 3);
	assert.equal(resIt4.getEndDay(), 3);
	assert.equal(resIt4.getFrom(), 12*60);
	assert.equal(resIt4.getTo(), 13*60);
	
	var resIt5 = result.open[3];
	assert.equal(resIt5.getStartDay(), 4);
	assert.equal(resIt5.getEndDay(), 4);
	assert.equal(resIt5.getFrom(), 10*60);
	assert.equal(resIt5.getTo(), 16*60);
	
	var resIt6 = result.open[4];
	assert.equal(resIt6.getStartDay(), 5);
	assert.equal(resIt6.getEndDay(), 5);
	assert.equal(resIt6.getFrom(), 10*60);
	assert.equal(resIt6.getTo(), 12*60);
	
	var resIt7 = result.open[5];
	assert.equal(resIt7.getStartDay(), 5);
	assert.equal(resIt7.getEndDay(), 5);
	assert.equal(resIt7.getFrom(), 13*60);
	assert.equal(resIt7.getTo(), 16*60);
});
QUnit.test("Get intervals diff 24/24", function(assert) {
	var week1 = new Week();
	var week2 = new Week();
	
	var it1 = new Interval(0,4,0,24*60);
	week1.addInterval(it1);
	
	var it2 = new Interval(0,5,0,24*60);
	week2.addInterval(it2);
	
	var result = week2.getIntervalsDiff(week1);
	assert.equal(result.open.length, 1);
	assert.equal(result.closed.length, 0);
	
	var resIt1 = result.open[0];
	assert.equal(resIt1.getStartDay(), 5);
	assert.equal(resIt1.getEndDay(), 5);
	assert.equal(resIt1.getFrom(), 0);
	assert.equal(resIt1.getTo(), 24*60);
});
