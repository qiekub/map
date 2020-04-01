/*
 * DateRange
 */

let QUnit = require("qunitjs");
let DateRange = require("../../../src/js/model/DateRange");
let WideInterval = require("../../../src/js/model/WideInterval");
let Day = require("../../../src/js/model/Day");
let Week = require("../../../src/js/model/Week");
let Interval = require("../../../src/js/model/Interval");

QUnit.module("Model > DateRange");
QUnit.test("Constructor", function(assert) {
	assert.ok(new DateRange(new WideInterval().always()));
	assert.ok(new DateRange(new WideInterval().week(15,16)));
});
QUnit.test("Defines typical day/week", function(assert) {
	//Single day
	var dr1 = new DateRange(new WideInterval().day(28,11));
	assert.ok(dr1.definesTypicalDay());
	assert.notOk(dr1.definesTypicalWeek());
	
	//Several days
	var dr2 = new DateRange(new WideInterval().day(28,11,3,12));
	assert.notOk(dr2.definesTypicalDay());
	assert.ok(dr2.definesTypicalWeek());
	
	//Same day as start and end
	var dr3 = new DateRange(new WideInterval().day(28,11,28,11));
	assert.ok(dr3.definesTypicalDay());
	assert.notOk(dr3.definesTypicalWeek());
	
	//Single week
	var dr4 = new DateRange(new WideInterval().week(10));
	assert.notOk(dr4.definesTypicalDay());
	assert.ok(dr4.definesTypicalWeek());
	
	//Several weeks
	var dr5 = new DateRange(new WideInterval().week(10,15));
	assert.notOk(dr5.definesTypicalDay());
	assert.ok(dr5.definesTypicalWeek());
	
	//Same week as start and end
	var dr6 = new DateRange(new WideInterval().week(10,10));
	assert.notOk(dr6.definesTypicalDay());
	assert.ok(dr6.definesTypicalWeek());
	
	//Single month
	var dr7 = new DateRange(new WideInterval().month(11));
	assert.notOk(dr7.definesTypicalDay());
	assert.ok(dr7.definesTypicalWeek());
	
	//Several months
	var dr8 = new DateRange(new WideInterval().month(11,12));
	assert.notOk(dr8.definesTypicalDay());
	assert.ok(dr8.definesTypicalWeek());
	
	//Same month as start and end
	var dr9 = new DateRange(new WideInterval().month(11,11));
	assert.notOk(dr9.definesTypicalDay());
	assert.ok(dr9.definesTypicalWeek());
	
	//School holidays
	var dr10 = new DateRange(new WideInterval().holiday("SH"));
	assert.notOk(dr10.definesTypicalDay());
	assert.ok(dr10.definesTypicalWeek());
	
	//Public holidays
	var dr11 = new DateRange(new WideInterval().holiday("PH"));
	assert.ok(dr11.definesTypicalDay());
	assert.notOk(dr11.definesTypicalWeek());
	
	//Easter
	var dr12 = new DateRange(new WideInterval().holiday("easter"));
	assert.ok(dr12.definesTypicalDay());
	assert.notOk(dr12.definesTypicalWeek());
	
	//All year
	var dr13 = new DateRange(new WideInterval().always());
	assert.notOk(dr13.definesTypicalDay());
	assert.ok(dr13.definesTypicalWeek());
});
QUnit.test("Get typical day/week", function(assert) {
	//Typical day
	var dr1 = new DateRange(new WideInterval().day(28,11));
	var t1 = dr1.getTypical();
	assert.ok(t1 instanceof Day);
	
	//Typical week
	var dr2 = new DateRange(new WideInterval().holiday("SH"));
	var t2 = dr2.getTypical();
	assert.ok(t2 instanceof Week);
});
QUnit.test("Get interval", function(assert) {
	var wi1 = new WideInterval().day(28,11);
	var dr1 = new DateRange(wi1);
	assert.equal(dr1.getInterval(), wi1);
});
QUnit.test("Update range", function(assert) {
	var dr1 = new DateRange(new WideInterval().day(28,11));
	
	//Check before
	var st1 = dr1.getInterval().getStart();
	assert.equal(st1.day, 28);
	assert.equal(st1.month, 11);
	var end1 = dr1.getInterval().getEnd();
	assert.equal(end1, null);
	
	dr1.updateRange(new WideInterval().week(5,10));
	
	//Check after
	var resSt1 = dr1.getInterval().getStart();
	assert.equal(resSt1.week, 5);
	assert.equal(resSt1.day, undefined);
	assert.equal(resSt1.month, undefined);
	var resEnd1 = dr1.getInterval().getEnd();
	assert.equal(resEnd1.week, 10);
});
QUnit.test("Is general for", function(assert) {
	//Single day
	var dr1 = new DateRange(new WideInterval().day(28,11));
	assert.notOk(dr1.isGeneralFor(new DateRange(new WideInterval().day(28,11))));
	assert.notOk(dr1.isGeneralFor(new DateRange(new WideInterval().day(28,11,29,11))));
	assert.notOk(dr1.isGeneralFor(new DateRange(new WideInterval().day(27,11,29,11))));
	assert.notOk(dr1.isGeneralFor(new DateRange(new WideInterval().week(10))));
	assert.notOk(dr1.isGeneralFor(new DateRange(new WideInterval().month(11))));
	assert.notOk(dr1.isGeneralFor(new DateRange(new WideInterval().holiday("PH"))));
	assert.notOk(dr1.isGeneralFor(new DateRange(new WideInterval().always())));
	
	//Several days
	var dr2 = new DateRange(new WideInterval().day(28,11,3,12));
	assert.notOk(dr2.isGeneralFor(new DateRange(new WideInterval().day(28,11,3,12))));
	assert.ok(dr2.isGeneralFor(new DateRange(new WideInterval().day(29,11,3,12))));
	assert.ok(dr2.isGeneralFor(new DateRange(new WideInterval().day(29,11,2,12))));
	assert.ok(dr2.isGeneralFor(new DateRange(new WideInterval().day(29,11,30,11))));
	assert.notOk(dr2.isGeneralFor(new DateRange(new WideInterval().day(29,11))));
	assert.notOk(dr2.isGeneralFor(new DateRange(new WideInterval().day(10,11,27,11))));
	assert.notOk(dr2.isGeneralFor(new DateRange(new WideInterval().day(4,12,25,12))));
	assert.notOk(dr2.isGeneralFor(new DateRange(new WideInterval().day(4,11,25,12))));
	assert.notOk(dr2.isGeneralFor(new DateRange(new WideInterval().week(10))));
	assert.notOk(dr2.isGeneralFor(new DateRange(new WideInterval().month(11))));
	assert.notOk(dr2.isGeneralFor(new DateRange(new WideInterval().holiday("PH"))));
	assert.notOk(dr2.isGeneralFor(new DateRange(new WideInterval().always())));
	
	//Single week
	var dr4 = new DateRange(new WideInterval().week(10));
	assert.notOk(dr4.isGeneralFor(new DateRange(new WideInterval().week(10))));
	assert.notOk(dr4.isGeneralFor(new DateRange(new WideInterval().week(10,15))));
	assert.notOk(dr4.isGeneralFor(new DateRange(new WideInterval().day(4,10))));
	assert.notOk(dr4.isGeneralFor(new DateRange(new WideInterval().day(4,10,15,5))));
	assert.notOk(dr4.isGeneralFor(new DateRange(new WideInterval().month(11))));
	assert.notOk(dr4.isGeneralFor(new DateRange(new WideInterval().holiday("PH"))));
	assert.notOk(dr4.isGeneralFor(new DateRange(new WideInterval().always())));
	
	//Several weeks
	var dr5 = new DateRange(new WideInterval().week(5,15));
	assert.notOk(dr5.isGeneralFor(new DateRange(new WideInterval().week(5,15))));
	assert.ok(dr5.isGeneralFor(new DateRange(new WideInterval().week(5,14))));
	assert.ok(dr5.isGeneralFor(new DateRange(new WideInterval().week(6,15))));
	assert.ok(dr5.isGeneralFor(new DateRange(new WideInterval().week(6,14))));
	assert.ok(dr5.isGeneralFor(new DateRange(new WideInterval().week(6))));
	assert.ok(dr5.isGeneralFor(new DateRange(new WideInterval().week(6,6))));
	assert.notOk(dr5.isGeneralFor(new DateRange(new WideInterval().day(4,10))));
	assert.notOk(dr5.isGeneralFor(new DateRange(new WideInterval().day(4,10,15,5))));
	assert.notOk(dr5.isGeneralFor(new DateRange(new WideInterval().month(11))));
	assert.notOk(dr5.isGeneralFor(new DateRange(new WideInterval().holiday("PH"))));
	assert.notOk(dr5.isGeneralFor(new DateRange(new WideInterval().always())));
	
	//Single month
	var dr7 = new DateRange(new WideInterval().month(11));
	assert.notOk(dr7.isGeneralFor(new DateRange(new WideInterval().month(11))));
	assert.notOk(dr7.isGeneralFor(new DateRange(new WideInterval().month(11,11))));
	assert.notOk(dr7.isGeneralFor(new DateRange(new WideInterval().month(10,12))));
	assert.ok(dr7.isGeneralFor(new DateRange(new WideInterval().day(2,11,8,11))));
	assert.notOk(dr7.isGeneralFor(new DateRange(new WideInterval().day(1,11,30,11))));
	assert.notOk(dr7.isGeneralFor(new DateRange(new WideInterval().day(5,11,15,12))));
	assert.notOk(dr7.isGeneralFor(new DateRange(new WideInterval().day(5,11))));
	assert.notOk(dr7.isGeneralFor(new DateRange(new WideInterval().holiday("PH"))));
	assert.notOk(dr7.isGeneralFor(new DateRange(new WideInterval().always())));
	
	//Several months
	var dr8 = new DateRange(new WideInterval().month(11,12));
	assert.notOk(dr8.isGeneralFor(new DateRange(new WideInterval().month(11,12))));
	assert.ok(dr8.isGeneralFor(new DateRange(new WideInterval().month(11))));
	assert.ok(dr8.isGeneralFor(new DateRange(new WideInterval().month(11,11))));
	assert.ok(dr8.isGeneralFor(new DateRange(new WideInterval().day(2,11,30,12))));
	assert.notOk(dr8.isGeneralFor(new DateRange(new WideInterval().day(1,11,31,12))));
	assert.notOk(dr8.isGeneralFor(new DateRange(new WideInterval().day(5,11))));
	assert.ok(dr8.isGeneralFor(new DateRange(new WideInterval().day(1,11,30,12))));
	assert.ok(dr8.isGeneralFor(new DateRange(new WideInterval().day(2,11,31,12))));
	assert.notOk(dr8.isGeneralFor(new DateRange(new WideInterval().week(10,12))));
	assert.notOk(dr8.isGeneralFor(new DateRange(new WideInterval().month(10,12))));
	assert.notOk(dr8.isGeneralFor(new DateRange(new WideInterval().holiday("PH"))));
	assert.notOk(dr8.isGeneralFor(new DateRange(new WideInterval().always())));
	
	//School holidays
	var dr10 = new DateRange(new WideInterval().holiday("SH"));
	assert.notOk(dr10.isGeneralFor(new DateRange(new WideInterval().holiday("SH"))));
	assert.notOk(dr10.isGeneralFor(new DateRange(new WideInterval().week(10,12))));
	assert.notOk(dr10.isGeneralFor(new DateRange(new WideInterval().month(10,12))));
	assert.notOk(dr10.isGeneralFor(new DateRange(new WideInterval().day(1,11,30,12))));
	assert.notOk(dr10.isGeneralFor(new DateRange(new WideInterval().day(1,11))));
	assert.notOk(dr10.isGeneralFor(new DateRange(new WideInterval().holiday("PH"))));
	assert.notOk(dr10.isGeneralFor(new DateRange(new WideInterval().always())));
	
	//Public holidays
	var dr11 = new DateRange(new WideInterval().holiday("PH"));
	assert.notOk(dr11.isGeneralFor(new DateRange(new WideInterval().holiday("PH"))));
	assert.notOk(dr11.isGeneralFor(new DateRange(new WideInterval().week(10,12))));
	assert.notOk(dr11.isGeneralFor(new DateRange(new WideInterval().month(10,12))));
	assert.notOk(dr11.isGeneralFor(new DateRange(new WideInterval().day(1,11,30,12))));
	assert.notOk(dr11.isGeneralFor(new DateRange(new WideInterval().day(1,11))));
	assert.notOk(dr11.isGeneralFor(new DateRange(new WideInterval().holiday("PH"))));
	assert.notOk(dr11.isGeneralFor(new DateRange(new WideInterval().always())));
	
	//Easter
	var dr12 = new DateRange(new WideInterval().holiday("easter"));
	assert.notOk(dr12.isGeneralFor(new DateRange(new WideInterval().holiday("easter"))));
	assert.notOk(dr12.isGeneralFor(new DateRange(new WideInterval().week(10,12))));
	assert.notOk(dr12.isGeneralFor(new DateRange(new WideInterval().month(10,12))));
	assert.notOk(dr12.isGeneralFor(new DateRange(new WideInterval().day(1,11,30,12))));
	assert.notOk(dr12.isGeneralFor(new DateRange(new WideInterval().day(1,11))));
	assert.notOk(dr12.isGeneralFor(new DateRange(new WideInterval().holiday("PH"))));
	assert.notOk(dr12.isGeneralFor(new DateRange(new WideInterval().holiday("SH"))));
	assert.notOk(dr12.isGeneralFor(new DateRange(new WideInterval().always())));
	
	//All year
	var dr13 = new DateRange(new WideInterval().always());
	assert.notOk(dr13.isGeneralFor(new DateRange(new WideInterval().always())));
	assert.notOk(dr13.isGeneralFor(new DateRange(new WideInterval().holiday("easter"))));
	assert.ok(dr13.isGeneralFor(new DateRange(new WideInterval().week(10,12))));
	assert.ok(dr13.isGeneralFor(new DateRange(new WideInterval().month(10,12))));
	assert.ok(dr13.isGeneralFor(new DateRange(new WideInterval().day(1,11,30,12))));
	assert.notOk(dr13.isGeneralFor(new DateRange(new WideInterval().day(1,11))));
	assert.notOk(dr13.isGeneralFor(new DateRange(new WideInterval().holiday("PH"))));
	assert.ok(dr13.isGeneralFor(new DateRange(new WideInterval().holiday("SH"))));
});
QUnit.test("Has same typical", function(assert) {
	var dr1 = new DateRange(new WideInterval().always());
	var dr2 = new DateRange(new WideInterval().month(3));
	var dr3 = new DateRange(new WideInterval().month(5));
	
	dr1.getTypical().addInterval(new Interval(0, 1, 42, 60));
	dr2.getTypical().addInterval(new Interval(0, 1, 42, 60));
	dr3.getTypical().addInterval(new Interval(0, 2, 42, 60));
	
	assert.ok(dr1.hasSameTypical(dr2));
	assert.notOk(dr1.hasSameTypical(dr3));
});
