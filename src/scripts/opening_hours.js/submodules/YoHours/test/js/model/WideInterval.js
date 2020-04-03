/*
 * WideInterval
 */

let QUnit = require("qunitjs");
let WideInterval = require("../../../src/js/model/WideInterval");

QUnit.module("Model > WideInterval");
QUnit.test("Constructor day", function(assert) {
	var wi1 = new WideInterval().day(1,1,2,2);
	assert.ok(true);
	
	var wi2 = new WideInterval().day(1,1);
	assert.ok(true);
	
	try {
		var wi3 = new WideInterval().day();
		assert.ok(false);
	}
	catch(e) {
		assert.ok(true);
	}
});
QUnit.test("Constructor week", function(assert) {
	var wi1 = new WideInterval().week(1,5);
	assert.ok(true);
	
	var wi2 = new WideInterval().week(1);
	assert.ok(true);
	
	try {
		var wi3 = new WideInterval().week();
		assert.ok(false);
	}
	catch(e) {
		assert.ok(true);
	}
});
QUnit.test("Constructor month", function(assert) {
	var wi1 = new WideInterval().month(1,5);
	assert.ok(true);
	
	var wi2 = new WideInterval().month(1);
	assert.ok(true);
	
	try {
		var wi3 = new WideInterval().month();
		assert.ok(false);
	}
	catch(e) {
		assert.ok(true);
	}
});
QUnit.test("Constructor holiday", function(assert) {
	var wi1 = new WideInterval().holiday("PH");
	assert.ok(true);
	
	var wi2 = new WideInterval().holiday("SH");
	assert.ok(true);
	
	var wi3 = new WideInterval().holiday("easter");
	assert.ok(true);
	
	try {
		var wi4 = new WideInterval().holiday();
		assert.ok(false);
	}
	catch(e) {
		assert.ok(true);
	}
	
	try {
		var wi5 = new WideInterval().holiday("Invalid holiday");
		assert.ok(false);
	}
	catch(e) {
		assert.ok(true);
	}
});
QUnit.test("Constructor always", function(assert) {
	var wi1 = new WideInterval().always();
	assert.ok(true);
});
QUnit.test("Get type always", function(assert) {
	var wi1 = new WideInterval().always();
	assert.equal(wi1.getType(), "always");
});
QUnit.test("Get type day", function(assert) {
	var wi1 = new WideInterval().day(1,1);
	assert.equal(wi1.getType(), "day");
});
QUnit.test("Get type week", function(assert) {
	var wi1 = new WideInterval().week(5);
	assert.equal(wi1.getType(), "week");
});
QUnit.test("Get type month", function(assert) {
	var wi1 = new WideInterval().month(12);
	assert.equal(wi1.getType(), "month");
});
QUnit.test("Get type holiday", function(assert) {
	var wi1 = new WideInterval().holiday("SH");
	assert.equal(wi1.getType(), "holiday");
});
QUnit.test("Equals identical", function(assert) {
	var wi1 = new WideInterval().holiday("SH");
	assert.ok(wi1.equals(wi1));
});
QUnit.test("Equals same holiday", function(assert) {
	var wi1 = new WideInterval().holiday("SH");
	var wi2 = new WideInterval().holiday("SH");
	assert.ok(wi1.equals(wi2));
	assert.ok(wi2.equals(wi1));
});
QUnit.test("Equals same day", function(assert) {
	var wi1 = new WideInterval().day(1,2,3,4);
	var wi2 = new WideInterval().day(1,2,3,4);
	assert.ok(wi1.equals(wi2));
	assert.ok(wi2.equals(wi1));
});
QUnit.test("Equals same week", function(assert) {
	var wi1 = new WideInterval().week(1,2);
	var wi2 = new WideInterval().week(1,2);
	assert.ok(wi1.equals(wi2));
	assert.ok(wi2.equals(wi1));
});
QUnit.test("Equals same month", function(assert) {
	var wi1 = new WideInterval().month(1,2);
	var wi2 = new WideInterval().month(1,2);
	assert.ok(wi1.equals(wi2));
	assert.ok(wi2.equals(wi1));
});
QUnit.test("Equals same always", function(assert) {
	var wi1 = new WideInterval().always();
	var wi2 = new WideInterval().always();
	assert.ok(wi1.equals(wi2));
	assert.ok(wi2.equals(wi1));
});
QUnit.test("Equals different 1", function(assert) {
	var wi1 = new WideInterval().always();
	var wi2 = new WideInterval().day(1,2,3,4);
	assert.notOk(wi1.equals(wi2));
	assert.notOk(wi2.equals(wi1));
});
QUnit.test("Equals different 2", function(assert) {
	var wi1 = new WideInterval().week(1,2);
	var wi2 = new WideInterval().month(1,2);
	assert.notOk(wi1.equals(wi2));
	assert.notOk(wi2.equals(wi1));
});
QUnit.test("Equals different 3", function(assert) {
	var wi1 = new WideInterval().holiday("PH");
	var wi2 = new WideInterval().month(1,2);
	assert.notOk(wi1.equals(wi2));
	assert.notOk(wi2.equals(wi1));
});
QUnit.test("Equals same interval not same type", function(assert) {
	//Single day
	var wi1 = new WideInterval().day(28,11);
	assert.ok(wi1.equals(new WideInterval().day(28,11)));
	assert.notOk(wi1.equals(new WideInterval().day(28,11,3,12)));
	assert.notOk(wi1.equals(new WideInterval().week(1,15)));
	
	//Several days
	var wi2 = new WideInterval().day(28,11,3,12);
	assert.ok(wi2.equals(new WideInterval().day(28,11,3,12)));
	assert.notOk(wi2.equals(new WideInterval().day(28,11)));
	assert.notOk(wi2.equals(new WideInterval().week(1,15)));
	
	//Several days
	var wi3 = new WideInterval().day(1,11,31,12);
	assert.ok(wi3.equals(new WideInterval().day(1,11,31,12)));
	assert.ok(wi3.equals(new WideInterval().month(11,12)));
	assert.notOk(wi3.equals(new WideInterval().day(28,11)));
	assert.notOk(wi3.equals(new WideInterval().week(1,15)));
	
	//Single week
	var wi4 = new WideInterval().week(10);
	assert.ok(wi4.equals(new WideInterval().week(10,10)));
	assert.ok(wi4.equals(new WideInterval().week(10)));
	assert.notOk(wi4.equals(new WideInterval().day(28,11)));
	assert.notOk(wi4.equals(new WideInterval().week(1,15)));
	
	//Several weeks
	var wi5 = new WideInterval().week(10,15);
	assert.ok(wi5.equals(new WideInterval().week(10,15)));
	assert.notOk(wi5.equals(new WideInterval().day(28,11)));
	assert.notOk(wi5.equals(new WideInterval().week(10)));
	
	//Single month
	var wi7 = new WideInterval().month(11);
	assert.ok(wi7.equals(new WideInterval().month(11,11)));
	assert.ok(wi7.equals(new WideInterval().month(11)));
	assert.ok(wi7.equals(new WideInterval().day(1,11,30,11)));
	assert.notOk(wi7.equals(new WideInterval().day(28,11)));
	assert.notOk(wi7.equals(new WideInterval().week(1,15)));
	
	//Several months
	var wi8 = new WideInterval().month(11,12);
	assert.ok(wi8.equals(new WideInterval().month(11,12)));
	assert.ok(wi8.equals(new WideInterval().day(1,11,31,12)));
	assert.notOk(wi8.equals(new WideInterval().day(28,11)));
	assert.notOk(wi8.equals(new WideInterval().week(1,15)));
	assert.notOk(wi8.equals(new WideInterval().month(11)));
	assert.notOk(wi8.equals(new WideInterval().day(2,11,31,12)));
	assert.notOk(wi8.equals(new WideInterval().day(1,11,30,12)));
	
	//School holidays
	var wi10 = new WideInterval().holiday("SH");
	assert.ok(wi10.equals(new WideInterval().holiday("SH")));
	assert.notOk(wi10.equals(new WideInterval().holiday("PH")));
	assert.notOk(wi10.equals(new WideInterval().week(1,15)));
	assert.notOk(wi10.equals(new WideInterval().month(11)));
	
	//Public holidays
	var wi11 = new WideInterval().holiday("PH");
	assert.ok(wi11.equals(new WideInterval().holiday("PH")));
	assert.notOk(wi11.equals(new WideInterval().holiday("easter")));
	assert.notOk(wi11.equals(new WideInterval().week(1,15)));
	assert.notOk(wi11.equals(new WideInterval().month(11)));

	//All year
	var wi13 = new WideInterval().always();
	assert.ok(wi13.equals(new WideInterval().always()));
	assert.notOk(wi13.equals(new WideInterval().holiday("easter")));
	assert.notOk(wi13.equals(new WideInterval().week(1,15)));
	assert.notOk(wi13.equals(new WideInterval().month(11)));
});
QUnit.test("Get time for humans", function(assert) {
	//Single day
	var wi1 = new WideInterval().day(28, 11);
	assert.equal(wi1.getTimeForHumans(), "day November 28");
	
	//Several days
	var wi2 = new WideInterval().day(28, 11, 3, 12);
	assert.equal(wi2.getTimeForHumans(), "every week from November 28 to December 3");
	
	//Several days in a month
	var wi2 = new WideInterval().day(3, 11, 15, 11);
	assert.equal(wi2.getTimeForHumans(), "every week from November 3 to 15");
	
	//Single week
	var wi4 = new WideInterval().week(10);
	assert.equal(wi4.getTimeForHumans(), "week 10");
	
	//Several weeks
	var wi5 = new WideInterval().week(10,15);
	assert.equal(wi5.getTimeForHumans(), "every week from week 10 to 15");
	
	//Single month
	var wi7 = new WideInterval().month(11);
	assert.equal(wi7.getTimeForHumans(), "every week in November");
	
	//Several months
	var wi8 = new WideInterval().month(11,12);
	assert.equal(wi8.getTimeForHumans(), "every week from November to December");
	
	//School holidays
	var wi10 = new WideInterval().holiday("SH");
	assert.equal(wi10.getTimeForHumans(), "every week during school holidays");
	
	//Public holidays
	var wi11 = new WideInterval().holiday("PH");
	assert.equal(wi11.getTimeForHumans(), "every public holidays");
	
	//Easter
	var wi12 = new WideInterval().holiday("easter");
	assert.equal(wi12.getTimeForHumans(), "each easter day");
	
	//All year
	var wi13 = new WideInterval().always();
	assert.equal(wi13.getTimeForHumans(), "every week of year");
});
QUnit.test("Get time selector", function(assert) {
	//Single day
	var wi1 = new WideInterval().day(28, 11);
	assert.equal(wi1.getTimeSelector(), "Nov 28");
	
	//Several days
	var wi2 = new WideInterval().day(28, 11, 3, 12);
	assert.equal(wi2.getTimeSelector(), "Nov 28-Dec 03");
	
	//Single week
	var wi4 = new WideInterval().week(10);
	assert.equal(wi4.getTimeSelector(), "week 10");
	
	//Several weeks
	var wi5 = new WideInterval().week(5,15);
	assert.equal(wi5.getTimeSelector(), "week 05-15");
	
	//Single month
	var wi7 = new WideInterval().month(11);
	assert.equal(wi7.getTimeSelector(), "Nov");
	
	//Several months
	var wi8 = new WideInterval().month(11,12);
	assert.equal(wi8.getTimeSelector(), "Nov-Dec");
	
	//School holidays
	var wi10 = new WideInterval().holiday("SH");
	assert.equal(wi10.getTimeSelector(), "SH");
	
	//Public holidays
	var wi11 = new WideInterval().holiday("PH");
	assert.equal(wi11.getTimeSelector(), "PH");
	
	//Easter
	var wi12 = new WideInterval().holiday("easter");
	assert.equal(wi12.getTimeSelector(), "easter");
	
	//All year
	var wi13 = new WideInterval().always();
	assert.equal(wi13.getTimeSelector(), "");
});
QUnit.test("Is full month", function(assert){
	assert.ok(new WideInterval().month(10).isFullMonth());
	assert.ok(new WideInterval().month(10,10).isFullMonth());
	assert.notOk(new WideInterval().month(10,12).isFullMonth());
	
	assert.ok(new WideInterval().day(1,10,31,10).isFullMonth());
	assert.ok(new WideInterval().day(1,11,30,11).isFullMonth());
	assert.notOk(new WideInterval().day(1,10,30,10).isFullMonth());
	assert.notOk(new WideInterval().day(15,10,31,10).isFullMonth());
	assert.notOk(new WideInterval().month(1,10,31,12).isFullMonth());
	assert.notOk(new WideInterval().month(1,10).isFullMonth());
	
	assert.notOk(new WideInterval().week(8,10).isFullMonth());
});
QUnit.test("Starts month", function(assert) {
	assert.ok(new WideInterval().day(1,10).startsMonth());
	assert.ok(new WideInterval().day(1,10,15,12).startsMonth());
	assert.notOk(new WideInterval().day(3,10,15,12).startsMonth());
	assert.notOk(new WideInterval().day(3,10,15,10).startsMonth());
	assert.notOk(new WideInterval().day(3,10).startsMonth());
	
	assert.ok(new WideInterval().month(10).startsMonth());
	assert.ok(new WideInterval().month(10,12).startsMonth());
	
	assert.ok(new WideInterval().always().startsMonth());
	
	assert.notOk(new WideInterval().week(10).startsMonth());
	assert.notOk(new WideInterval().holiday("PH").startsMonth());
});
QUnit.test("Ends month", function(assert) {
	assert.ok(new WideInterval().day(15,10,31,12).endsMonth());
	assert.notOk(new WideInterval().day(1,10,30,12).endsMonth());
	assert.notOk(new WideInterval().day(3,10,29,10).endsMonth());
	assert.notOk(new WideInterval().day(18,10).endsMonth());
	assert.notOk(new WideInterval().day(30,10).endsMonth());
	
	assert.ok(new WideInterval().month(10).endsMonth());
	assert.ok(new WideInterval().month(10,12).endsMonth());
	
	assert.ok(new WideInterval().always().endsMonth());
	
	assert.notOk(new WideInterval().week(10).endsMonth());
	assert.notOk(new WideInterval().holiday("PH").endsMonth());
});
QUnit.test("Contains single day", function(assert) {
	var wi1 = new WideInterval().day(28, 11);
	assert.notOk(wi1.contains(new WideInterval().day(28, 11)));
	assert.notOk(wi1.contains(new WideInterval().day(28, 11, 29, 11)));
	assert.notOk(wi1.contains(new WideInterval().day(27, 11, 29, 11)));
	assert.notOk(wi1.contains(new WideInterval().week(10)));
	assert.notOk(wi1.contains(new WideInterval().month(11)));
	assert.notOk(wi1.contains(new WideInterval().holiday("PH")));
	assert.notOk(wi1.contains(new WideInterval().always()));
});
QUnit.test("Contains several days", function(assert) {
	var wi2 = new WideInterval().day(28, 11, 3, 12);
	assert.notOk(wi2.contains(new WideInterval().day(28, 11, 3, 12)));
	assert.ok(wi2.contains(new WideInterval().day(29, 11, 3, 12)));
	assert.ok(wi2.contains(new WideInterval().day(29, 11, 2, 12)));
	assert.ok(wi2.contains(new WideInterval().day(29, 11, 30, 11)));
	assert.ok(wi2.contains(new WideInterval().day(29, 11)));
	assert.notOk(wi2.contains(new WideInterval().day(10, 11, 27, 11)));
	assert.notOk(wi2.contains(new WideInterval().day(4, 12, 25, 12)));
	assert.notOk(wi2.contains(new WideInterval().day(4, 11, 25, 12)));
	assert.notOk(wi2.contains(new WideInterval().week(10)));
	assert.notOk(wi2.contains(new WideInterval().month(11)));
	assert.notOk(wi2.contains(new WideInterval().holiday("PH")));
	assert.notOk(wi2.contains(new WideInterval().always()));
});
QUnit.test("Contains single week", function(assert) {
	var wi4 = new WideInterval().week(10);
	assert.notOk(wi4.contains(new WideInterval().week(10)));
	assert.notOk(wi4.contains(new WideInterval().week(10, 15)));
	assert.notOk(wi4.contains(new WideInterval().day(10, 4)));
	assert.notOk(wi4.contains(new WideInterval().day(10, 4, 15, 5)));
	assert.notOk(wi4.contains(new WideInterval().month(11)));
	assert.notOk(wi4.contains(new WideInterval().holiday("PH")));
	assert.notOk(wi4.contains(new WideInterval().always()));
});
QUnit.test("Contains several weeks", function(assert) {
	var wi5 = new WideInterval().week(5, 15);
	assert.notOk(wi5.contains(new WideInterval().week(5, 15)));
	assert.ok(wi5.contains(new WideInterval().week(5, 14)));
	assert.ok(wi5.contains(new WideInterval().week(6, 15)));
	assert.ok(wi5.contains(new WideInterval().week(6, 14)));
	assert.ok(wi5.contains(new WideInterval().week(6)));
	assert.ok(wi5.contains(new WideInterval().week(6, 6)));
	assert.notOk(wi5.contains(new WideInterval().day(10, 4)));
	assert.notOk(wi5.contains(new WideInterval().day(10, 4, 15, 5)));
	assert.notOk(wi5.contains(new WideInterval().month(11)));
	assert.notOk(wi5.contains(new WideInterval().holiday("PH")));
	assert.notOk(wi5.contains(new WideInterval().always()));
});
QUnit.test("Contains single month", function(assert) {
	var wi7 = new WideInterval().month(11);
	assert.notOk(wi7.contains(new WideInterval().month(11)));
	assert.notOk(wi7.contains(new WideInterval().month(11, 11)));
	assert.notOk(wi7.contains(new WideInterval().month(10, 12)));
	assert.ok(wi7.contains(new WideInterval().day(2, 11, 8, 11)));
	assert.notOk(wi7.contains(new WideInterval().day(1, 11, 30, 11)));
	assert.notOk(wi7.contains(new WideInterval().day(5, 11, 15, 12)));
	assert.ok(wi7.contains(new WideInterval().day(5, 11)));
	assert.notOk(wi7.contains(new WideInterval().holiday("PH")));
	assert.notOk(wi7.contains(new WideInterval().always()));
});
QUnit.test("Contains several months", function(assert) {
	var wi8 = new WideInterval().month(11, 12);
	assert.notOk(wi8.contains(new WideInterval().month(11, 12)));
	assert.ok(wi8.contains(new WideInterval().month(11)));
	assert.ok(wi8.contains(new WideInterval().month(11, 11)));
	assert.ok(wi8.contains(new WideInterval().day(2, 11, 30, 12)));
	assert.notOk(wi8.contains(new WideInterval().day(1, 11, 31, 12)));
	assert.ok(wi8.contains(new WideInterval().day(5, 11)));
	assert.ok(wi8.contains(new WideInterval().day(1, 11, 30, 12)));
	assert.ok(wi8.contains(new WideInterval().day(2, 11, 31, 12)));
	assert.notOk(wi8.contains(new WideInterval().week(10, 12)));
	assert.notOk(wi8.contains(new WideInterval().month(10, 12)));
	assert.notOk(wi8.contains(new WideInterval().holiday("PH")));
	assert.notOk(wi8.contains(new WideInterval().always()));
});
QUnit.test("Contains school holidays", function(assert) {
	var wi10 = new WideInterval().holiday("SH");
	assert.notOk(wi10.contains(new WideInterval().holiday("SH")));
	assert.notOk(wi10.contains(new WideInterval().week(10, 12)));
	assert.notOk(wi10.contains(new WideInterval().month(10, 12)));
	assert.notOk(wi10.contains(new WideInterval().month(11, 1, 12, 30)));
	assert.notOk(wi10.contains(new WideInterval().month(11, 1)));
	assert.notOk(wi10.contains(new WideInterval().holiday("PH")));
	assert.notOk(wi10.contains(new WideInterval().always()));
});
QUnit.test("Contains public holidays", function(assert) {
	var wi11 = new WideInterval().holiday("PH");
	assert.notOk(wi11.contains(new WideInterval().holiday("PH")));
	assert.notOk(wi11.contains(new WideInterval().week(10, 12)));
	assert.notOk(wi11.contains(new WideInterval().month(10, 12)));
	assert.notOk(wi11.contains(new WideInterval().day(1, 11, 30, 12)));
	assert.notOk(wi11.contains(new WideInterval().day(1, 11)));
	assert.notOk(wi11.contains(new WideInterval().holiday("SH")));
	assert.notOk(wi11.contains(new WideInterval().always()));
});
QUnit.test("Contains easter", function(assert) {
	var wi12 = new WideInterval().holiday("easter");
	assert.notOk(wi12.contains(new WideInterval().holiday("easter")));
	assert.notOk(wi12.contains(new WideInterval().week(10, 12)));
	assert.notOk(wi12.contains(new WideInterval().month(10, 12)));
	assert.notOk(wi12.contains(new WideInterval().day(1, 11, 30, 12)));
	assert.notOk(wi12.contains(new WideInterval().day(1, 11)));
	assert.notOk(wi12.contains(new WideInterval().holiday("PH")));
	assert.notOk(wi12.contains(new WideInterval().holiday("SH")));
	assert.notOk(wi12.contains(new WideInterval().always()));
});
QUnit.test("Contains all year", function(assert) {
	var wi13 = new WideInterval().always();
	assert.notOk(wi13.contains(new WideInterval().always()));
	assert.ok(wi13.contains(new WideInterval().holiday("easter")));
	assert.ok(wi13.contains(new WideInterval().week(10, 12)));
	assert.ok(wi13.contains(new WideInterval().month(10, 12)));
	assert.ok(wi13.contains(new WideInterval().day(1, 11, 30, 12)));
	assert.ok(wi13.contains(new WideInterval().day(1, 11)));
	assert.ok(wi13.contains(new WideInterval().holiday("PH")));
	assert.ok(wi13.contains(new WideInterval().holiday("SH")));
});
