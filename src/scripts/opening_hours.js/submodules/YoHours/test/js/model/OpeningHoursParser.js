/*
 * OpeningHoursParser
 */

let QUnit = require("qunitjs");
let OpeningHoursParser = require("../../../src/js/model/OpeningHoursParser");
let OpeningHoursBuilder = require("../../../src/js/model/OpeningHoursBuilder");

QUnit.module("Model > OpeningHoursParser");
QUnit.test("Parse Mo 08:00-10:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("Mo 08:00-10:00")), "Mo 08:00-10:00");
});
QUnit.test("Parse Mo,We 08:00-10:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("Mo,We 08:00-10:00")), "Mo,We 08:00-10:00");
});
QUnit.test("Parse Mo-We 08:00-10:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("Mo-We 08:00-10:00")), "Mo-We 08:00-10:00");
});
QUnit.test("Parse Mo-We 08:00-10:00; Sa,Su 07:00-13:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("Mo-We 08:00-10:00; Sa,Su 07:00-13:00")), "Mo-We 08:00-10:00; Sa,Su 07:00-13:00");
});
QUnit.test("Parse Mo,Tu 23:00-03:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	
	var result = parser.parse("Mo,Tu 23:00-03:00");
	assert.equal(result.length, 1);
	assert.equal(result[0].getInterval().getStart(), null);
	assert.equal(result[0].getTypical().getIntervals().length, 2);
	
	assert.equal(result[0].getTypical().getIntervals()[0].getStartDay(), 0);
	assert.equal(result[0].getTypical().getIntervals()[0].getEndDay(), 1);
	assert.equal(result[0].getTypical().getIntervals()[0].getFrom(), 23*60);
	assert.equal(result[0].getTypical().getIntervals()[0].getTo(), 3*60);
	assert.equal(result[0].getTypical().getIntervals()[1].getStartDay(), 1);
	assert.equal(result[0].getTypical().getIntervals()[1].getEndDay(), 2);
	assert.equal(result[0].getTypical().getIntervals()[1].getFrom(), 23*60);
	assert.equal(result[0].getTypical().getIntervals()[1].getTo(), 3*60);
	
	assert.equal(builder.build(result), "Mo,Tu 23:00-03:00");
});
QUnit.test("Parse Mo 08:00-10:00 merging", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("Mo 08:00-09:00,09:00-10:00")), "Mo 08:00-10:00");
});
QUnit.test("Parse Mo 08:00-24:00; Tu 00:00-09:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("Mo 08:00-24:00; Tu 00:00-09:00")), "Mo 08:00-24:00; Tu 00:00-09:00");
});
QUnit.test("Parse 08:00-18:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("08:00-18:00")), "08:00-18:00");
});
QUnit.test("Parse 24/7 continuous", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("24/7")), "24/7");
});
QUnit.test("Parse 24/7 following", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("Mo-Su 00:00-24:00")), "24/7");
});
QUnit.test("Parse 24/7; Jun: 08:00-18:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("24/7; Jun: 08:00-18:00")), "24/7; Jun 08:00-18:00");
});
QUnit.test("Parse 24/7; Jun: 08:00-18:00; Jun: We off", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("24/7; Jun: 08:00-18:00; Jun: We off")), "24/7; Jun 08:00-18:00; Jun We off");
});
QUnit.test("Parse 24/7; Jun: Mo-We 08:00-18:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("24/7; Jun: Mo-We 08:00-18:00")), "24/7; Jun Mo-We 08:00-18:00");
});
QUnit.test("Parse 24/7; Jun-Aug: Mo-We 08:00-18:00; Jun-Aug: Th-Su off", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("24/7; Jun-Aug: Mo-We 08:00-18:00; Jun-Aug: Th-Su off")), "24/7; Jun-Aug Mo-We 08:00-18:00; Jun-Aug Th-Su off");
});
QUnit.test("Parse 24/7; Jun: Mo 08:00-18:00; Jun: Tu-Su off; PH off", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("24/7; Jun: Mo 08:00-18:00; Jun: Tu-Su off; PH off")), "24/7; Jun Mo 08:00-18:00; Jun Tu-Su off; PH off");
});
QUnit.test("Parse 24/7; Jun: Mo 08:00-18:00; PH off; SH Tu 09:00-17:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	
	var result = parser.parse("24/7; Jun: Mo 08:00-18:00; PH off; SH Tu 09:00-17:00");
	assert.equal(result.length, 4);
	
	var dr1 = result[0];
	assert.equal(dr1.getInterval().getTimeSelector(), "");
	
	var dr2 = result[1];
	assert.equal(dr2.getInterval().getTimeSelector(), "Jun");
	
	var dr3 = result[2];
	assert.equal(dr3.getInterval().getTimeSelector(), "PH");
	
	var dr4 = result[3];
	assert.equal(dr4.getInterval().getTimeSelector(), "SH");
	assert.equal(dr4.getTypical().getIntervals().length, 8);
	
	assert.equal(dr4.getTypical().getIntervals()[0].getStartDay(), 0);
	assert.equal(dr4.getTypical().getIntervals()[0].getEndDay(), 0);
	assert.equal(dr4.getTypical().getIntervals()[0].getFrom(), 0*60);
	assert.equal(dr4.getTypical().getIntervals()[0].getTo(), 24*60);
	
	assert.equal(dr4.getTypical().getIntervals()[1], undefined);
	
	assert.equal(dr4.getTypical().getIntervals()[2].getStartDay(), 2);
	assert.equal(dr4.getTypical().getIntervals()[2].getEndDay(), 2);
	assert.equal(dr4.getTypical().getIntervals()[2].getFrom(), 0*60);
	assert.equal(dr4.getTypical().getIntervals()[2].getTo(), 24*60);
	
	assert.equal(dr4.getTypical().getIntervals()[3].getStartDay(), 3);
	assert.equal(dr4.getTypical().getIntervals()[3].getEndDay(), 3);
	assert.equal(dr4.getTypical().getIntervals()[3].getFrom(), 0*60);
	assert.equal(dr4.getTypical().getIntervals()[3].getTo(), 24*60);
	
	assert.equal(dr4.getTypical().getIntervals()[4].getStartDay(), 4);
	assert.equal(dr4.getTypical().getIntervals()[4].getEndDay(), 4);
	assert.equal(dr4.getTypical().getIntervals()[4].getFrom(), 0*60);
	assert.equal(dr4.getTypical().getIntervals()[4].getTo(), 24*60);
	
	assert.equal(dr4.getTypical().getIntervals()[5].getStartDay(), 5);
	assert.equal(dr4.getTypical().getIntervals()[5].getEndDay(), 5);
	assert.equal(dr4.getTypical().getIntervals()[5].getFrom(), 0*60);
	assert.equal(dr4.getTypical().getIntervals()[5].getTo(), 24*60);
	
	assert.equal(dr4.getTypical().getIntervals()[6].getStartDay(), 6);
	assert.equal(dr4.getTypical().getIntervals()[6].getEndDay(), 6);
	assert.equal(dr4.getTypical().getIntervals()[6].getFrom(), 0*60);
	assert.equal(dr4.getTypical().getIntervals()[6].getTo(), 24*60);
	
	assert.equal(dr4.getTypical().getIntervals()[7].getStartDay(), 1);
	assert.equal(dr4.getTypical().getIntervals()[7].getEndDay(), 1);
	assert.equal(dr4.getTypical().getIntervals()[7].getFrom(), 9*60);
	assert.equal(dr4.getTypical().getIntervals()[7].getTo(), 17*60);
	
	assert.equal(builder.build(result), "24/7; Jun Mo 08:00-18:00; PH off; SH Tu 09:00-17:00");
});
QUnit.test("Parse Mo 08:00-18:00 grouping", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("Mo 08:00-18:00; Jun: Mo 08:00-18:00; SH Mo 08:00-18:00")), "Mo 08:00-18:00");
});
QUnit.test("Parse week 01-15: We 05:00-07:00; PH off", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("week 01-15: We 05:00-07:00; PH off")), "week 01-15 We 05:00-07:00; PH off");
});
QUnit.test("Parse Mo 08:00-18:00; ; Tu 09:00-18:00 (empty rule)", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("Mo 08:00-18:00; ; Tu 09:00-18:00")), "Mo 08:00-18:00; Tu 09:00-18:00");
});
QUnit.test("Parse 01:00-02:00; Jun: Th 02:00-03:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("01:00-02:00; Jun: Th 02:00-03:00")), "01:00-02:00; Jun Th 02:00-03:00");
});
QUnit.test("Parse Tu 00:00-24:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	
	var result = parser.parse("Tu 00:00-24:00");
	assert.equal(result.length, 1);
	
	var dr1 = result[0];
	assert.equal(dr1.getInterval().getTimeSelector(), "");
	assert.equal(dr1.getTypical().getIntervals().length, 1);
	
	assert.equal(dr1.getTypical().getIntervals()[0].getStartDay(), 1);
	assert.equal(dr1.getTypical().getIntervals()[0].getEndDay(), 1);
	assert.equal(dr1.getTypical().getIntervals()[0].getFrom(), 0*60);
	assert.equal(dr1.getTypical().getIntervals()[0].getTo(), 24*60);
	
	assert.equal(builder.build(result), "Tu 00:00-24:00");
});
QUnit.test("Parse 24/7; week 01: Su 01:00-08:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("24/7; week 01: Su 01:00-08:00")), "24/7; week 01 Su 01:00-08:00");
});
QUnit.test("Parse Mo 10:00; PH 11:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("Mo 10:00; PH 11:00")), "Mo 10:00; PH 11:00");
});
QUnit.test("Parse unsupported 24/7; week 01: Su 01:00-08:00 || \"on appointment\"", function(assert) {
	var parser = new OpeningHoursParser();
	try {
		assert.notOk(parser.parse("24/7; week 01: Su 01:00-08:00 || \"on appointment\"") instanceof Array);
	}
	catch(e) {
		assert.ok(true);
	}
});
QUnit.test("Parse SH 08:00-18:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	
	var result = parser.parse("SH 08:00-18:00");
	assert.equal(result.length, 1);
	
	var dr1 = result[0];
	assert.equal(dr1.getInterval().getTimeSelector(), "SH");
	assert.equal(dr1.getTypical().getIntervals().length, 7);
	
	assert.equal(dr1.getTypical().getIntervals()[0].getStartDay(), 0);
	assert.equal(dr1.getTypical().getIntervals()[0].getEndDay(), 0);
	assert.equal(dr1.getTypical().getIntervals()[0].getFrom(), 8*60);
	assert.equal(dr1.getTypical().getIntervals()[0].getTo(), 18*60);
	assert.equal(dr1.getTypical().getIntervals()[1].getStartDay(), 1);
	assert.equal(dr1.getTypical().getIntervals()[1].getEndDay(), 1);
	assert.equal(dr1.getTypical().getIntervals()[1].getFrom(), 8*60);
	assert.equal(dr1.getTypical().getIntervals()[1].getTo(), 18*60);
	assert.equal(dr1.getTypical().getIntervals()[2].getStartDay(), 2);
	assert.equal(dr1.getTypical().getIntervals()[2].getEndDay(), 2);
	assert.equal(dr1.getTypical().getIntervals()[2].getFrom(), 8*60);
	assert.equal(dr1.getTypical().getIntervals()[2].getTo(), 18*60);
	assert.equal(dr1.getTypical().getIntervals()[3].getStartDay(), 3);
	assert.equal(dr1.getTypical().getIntervals()[3].getEndDay(), 3);
	assert.equal(dr1.getTypical().getIntervals()[3].getFrom(), 8*60);
	assert.equal(dr1.getTypical().getIntervals()[3].getTo(), 18*60);
	assert.equal(dr1.getTypical().getIntervals()[4].getStartDay(), 4);
	assert.equal(dr1.getTypical().getIntervals()[4].getEndDay(), 4);
	assert.equal(dr1.getTypical().getIntervals()[4].getFrom(), 8*60);
	assert.equal(dr1.getTypical().getIntervals()[4].getTo(), 18*60);
	assert.equal(dr1.getTypical().getIntervals()[5].getStartDay(), 5);
	assert.equal(dr1.getTypical().getIntervals()[5].getEndDay(), 5);
	assert.equal(dr1.getTypical().getIntervals()[5].getFrom(), 8*60);
	assert.equal(dr1.getTypical().getIntervals()[5].getTo(), 18*60);
	assert.equal(dr1.getTypical().getIntervals()[6].getStartDay(), 6);
	assert.equal(dr1.getTypical().getIntervals()[6].getEndDay(), 6);
	assert.equal(dr1.getTypical().getIntervals()[6].getFrom(), 8*60);
	assert.equal(dr1.getTypical().getIntervals()[6].getTo(), 18*60);
	
	assert.equal(builder.build(result), "SH 08:00-18:00");
});
QUnit.test("Parse Mo-Fr 12:00-14:00; Sa,Su,PH 12:00-16:00 (PH as weekday)", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("Mo-Fr 12:00-14:00; Sa,Su,PH 12:00-16:00")), "Mo-Fr 12:00-14:00; PH,Sa,Su 12:00-16:00");
});
QUnit.test("Parse Su-Tu 12:00-14:00 (continous week-end)", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	assert.equal(builder.build(parser.parse("Su-Tu 12:00-14:00")), "Su-Tu 12:00-14:00");
});
QUnit.test("Parse Mo-Sa,PH 12:00-16:00", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	
	var result = parser.parse("Mo-Sa,PH 12:00-16:00");
	assert.equal(result.length, 2);
	
	var dr1 = result[1];
	assert.equal(dr1.getInterval().getTimeSelector(), "");
	assert.equal(dr1.getTypical().getIntervals().length, 6);
	
	assert.equal(dr1.getTypical().getIntervals()[0].getStartDay(), 0);
	assert.equal(dr1.getTypical().getIntervals()[0].getEndDay(), 0);
	assert.equal(dr1.getTypical().getIntervals()[0].getFrom(), 12*60);
	assert.equal(dr1.getTypical().getIntervals()[0].getTo(), 16*60);
	
	var dr2 = result[0];
	assert.equal(dr2.getInterval().getTimeSelector(), "PH");
	assert.equal(dr2.getTypical().getIntervals().length, 1);
	
	assert.equal(dr2.getTypical().getIntervals()[0].getStartDay(), 0);
	assert.equal(dr2.getTypical().getIntervals()[0].getEndDay(), 0);
	assert.equal(dr2.getTypical().getIntervals()[0].getFrom(), 12*60);
	assert.equal(dr2.getTypical().getIntervals()[0].getTo(), 16*60);
	
	assert.equal(builder.build(result), "PH,Mo-Sa 12:00-16:00");
});
QUnit.test("Parse Mo 04:00-08:00; PH off", function(assert) {
	var parser = new OpeningHoursParser();
	var builder = new OpeningHoursBuilder();
	
	var result = parser.parse("Mo 04:00-08:00; PH off");
	assert.equal(builder.build(result), "Mo 04:00-08:00; PH off");
});
