Changes history
===============

1 september 2015
----------------
* WideInterval class replaces old system
* PH as weekday bug fix
* Weekdays grouped when continous over week-end (ex: "Sa-Tu")

27 august 2015
--------------
* Bug fix for school holidays hours not applied all week
* opening_hours.js update (supports null location to check values with holidays)
* Rule simplification algorithm improved

24 august 2015
--------------
* opening_hours.js used to check if user input is valid (even if not readable by YoHours)
* YoHoursChecker added to verify simply if an opening_hours value will be readable by YoHours

21 august 2015
--------------
* Optional colon separator for wide range selector removed

19 august 2015
--------------
* Version 2.0 published

14 august 2015
--------------
* Test suite for model classes

13 august 2015
--------------
* User input for opening_hours supports seasons

12 august 2015
--------------
* Season system added
* Page style changed
* Bug fix for sunday 23:59

7 august 2015
-------------
* Following intervals are now merged

6 august 2015
-------------
* Continuous time for night intervals (for example "Mo 23:00-03:00")
* Off days merged when possible (for example "Mo-Su 07:00-08:00; Tu,Th-Sa off")
* Clear button added
* Parse opening_hours when inserted in text field

18 june 2015
------------
* FullCalendary lib retrieved
* Resize event from start enabled

17 june 2015
------------
* Calendar widget (FullCalendar) added
* Boostrap theme for main page
* Completely new style
* Opening hours parser handles 24/7 syntax

15 june 2015
------------
* Code refactoring and cleaning

12 june 2015
------------
* Initial release