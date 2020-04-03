/*
 * This file is part of YoHours.
 * 
 * YoHours is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * 
 * YoHours is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with YoHours.  If not, see <http://www.gnu.org/licenses/>.
 */

//IMPORTS
let $ = require("jquery");
let DateRangeModel = require("../model/DateRange");
let WideIntervalModel = require("../model/WideInterval");
require("bootstrap");


/**
 * The date range modal component
 */
var DateRange = function(main) {
//ATTRIBUTES
	/** Is the modal shown to edit some date range ? True = edit, false = add */
	this._editMode = false;
	
	/** Date range type **/
	this._rangeType = null;
	
	/** The main view **/
	this._mainView = main;

//CONSTRUCTOR
	$("#modal-range-valid").click(this.valid.bind(this));
};

//MODIFIERS
	/**
	 * Shows the modal
	 * @param edit Edit mode ? (optional)
	 */
	DateRange.prototype.show = function(edit) {
		this._editMode = edit || false;
		
		//Reset navigation
		$("#modal-range-nav li").removeClass("active");
		$("#modal-range-form > div").hide();
		$("#modal-range-alert").hide();
		
		//Reset inputs
		$("#range-day-startday").val("");
		$("#range-day-startmonth").val(1);
		$("#range-day-endday").val("");
		$("#range-day-endmonth").val(0);
		$("#range-week-start").val(1);
		$("#range-week-end").val("");
		$("#range-month-start").val(1);
		$("#range-month-end").val(0);
		$("input[name=range-holiday-type]").prop("checked", false);
		$("#range-copy").hide();
		$("#range-copy-box").attr("checked", true);
		
		//Edit interval
		if(this._editMode) {
			//Show modes that defines week or day only, depending of previous typical
			if(this._mainView.getCalendarView().getDateRange().definesTypicalWeek()) {
				$("#modal-range-nav-always").show();
				$("#modal-range-nav-month").show();
				$("#modal-range-nav-week").show();
				$("#range-day-end").show();
				$("#range-day .text-info").hide();
				$("#range-holiday-sh").show();
				$("#range-holiday-ph").hide();
				$("#range-holiday-easter").hide();
			}
			else {
				$("#modal-range-nav-always").hide();
				$("#modal-range-nav-month").hide();
				$("#modal-range-nav-week").hide();
				$("#range-day-end").hide();
				$("#range-day .text-info").hide();
				$("#range-holiday-sh").hide();
				$("#range-holiday-ph").show();
				$("#range-holiday-easter").show();
			}
			
			var start = this._mainView.getCalendarView().getDateRange().getInterval().getStart();
			var end = this._mainView.getCalendarView().getDateRange().getInterval().getEnd();
			var type = this._mainView.getCalendarView().getDateRange().getInterval().getType();
			
			switch(type) {
				case "day":
					$("#range-day-startday").val(start.day);
					$("#range-day-startmonth").val(start.month);
					if(end != null) {
						$("#range-day-endday").val(end.day);
						$("#range-day-endmonth").val(end.month);
					}
					else {
						$("#range-day-endday").val("");
						$("#range-day-endmonth").val(0);
					}
					break;

				case "week":
					$("#range-week-start").val(start.week);
					if(end != null) {
						$("#range-week-end").val(end.week);
					}
					else {
						$("#range-week-end").val("");
					}
					break;

				case "month":
					$("#range-month-start").val(start.month);
					if(end != null) {
						$("#range-month-end").val(end.month);
					}
					else {
						$("#range-month-end").val(0);
					}
					break;

				case "holiday":
					$("input[name=range-holiday-type]").prop("checked", false);
					$("input[name=range-holiday-type][value="+start.holiday+"]").prop("checked", true);
					break;

				case "always":
					break;
			}
			
			$("#modal-range-nav-"+type).addClass("active");
			$("#range-"+type).show();
		}
		//New wide interval
		else {
			//Show all inputs
			$("#modal-range-nav-always").show();
			$("#modal-range-nav-month").show();
			$("#modal-range-nav-week").show();
			$("#range-day-end").show();
			$("#range-day .text-info").show();
			$("#range-holiday > div > label").show();
			
			//Set first tab as active
			$("#modal-range-nav li:first").addClass("active");
			this._rangeType = $("#modal-range-nav li:first").attr("id").substr("modal-range-nav-".length);
			
			if(this._rangeType != "always") {
				$("#range-copy").show();
			}
			
			//Show associated div
			$("#modal-range-form > div:first").show();
		}
		
		$("#modal-range").modal("show");
	};
	
	/**
	 * Changes the currently shown tab
	 */
	DateRange.prototype.tab = function(type) {
		$("#modal-range-nav li.active").removeClass("active");
		$("#modal-range-nav-"+type).addClass("active");
		$("#modal-range-form > div:visible").hide();
		$("#range-"+type).show();
		$("#modal-range-alert").hide();
		this._rangeType = type;
		
		if(this._rangeType != "always" && !this._editMode) {
			$("#range-copy").show();
		}
		else {
			$("#range-copy").hide();
		}
	};
	
	/**
	 * Actions to perform when the modal was validated
	 */
	DateRange.prototype.valid = function() {
		//Create start and end objects
		var wInterval, startVal, endVal, startVal2, endVal2;
		
		try {
			switch(this._rangeType) {
				case "month":
					//Start
					startVal = parseInt($("#range-month-start").val(),10);
					if(isNaN(startVal)) { throw new Error("Invalid start month"); }
					
					//End
					endVal = parseInt($("#range-month-end").val(),10);
					if(!isNaN(endVal) && endVal > 0) {
						wInterval = new WideIntervalModel().month(startVal, endVal);
					}
					else {
						wInterval = new WideIntervalModel().month(startVal);
					}
					
					break;
				case "week":
					//Start
					startVal = parseInt($("#range-week-start").val(),10);
					if(isNaN(startVal) || startVal < 1) { throw new Error("Invalid start week"); }
					
					//End
					endVal = parseInt($("#range-week-end").val(),10);
					if(!isNaN(endVal) && endVal > 0) {
						wInterval = new WideIntervalModel().week(startVal, endVal);
					}
					else {
						wInterval = new WideIntervalModel().week(startVal);
					}
					
					break;
				case "day":
					//Start
					startVal = parseInt($("#range-day-startday").val(),10);
					if(isNaN(startVal) || startVal < 1) { throw new Error("Invalid start day"); }
					startVal2 = parseInt($("#range-day-startmonth").val(),10);
					if(isNaN(startVal2) || startVal2 < 1) { throw new Error("Invalid start month"); }
					
					//End
					endVal = parseInt($("#range-day-endday").val(),10);
					endVal2 = parseInt($("#range-day-endmonth").val(),10);
					if(!isNaN(endVal) && endVal > 0 && !isNaN(endVal2) && endVal2 > 0) {
						wInterval = new WideIntervalModel().day(startVal, startVal2, endVal, endVal2);
					}
					else if(this._editMode && this._mainView.getCalendarView().getDateRange().definesTypicalWeek()) {
						throw new Error("Missing end day");
					}
					else {
						wInterval = new WideIntervalModel().day(startVal, startVal2);
					}
					
					break;
				case "holiday":
					startVal = $("input[name=range-holiday-type]:checked").val();
					if(startVal != "PH" && startVal != "SH" && startVal != "easter") { throw new Error("Invalid holiday type"); }
					wInterval = new WideIntervalModel().holiday(startVal);
					
					break;

				case "always":
				default:
					wInterval = new WideIntervalModel().always();
			}
			
			//Check if not overlapping another date range
			var overlap = false;
			var ranges = this._mainView.getController().getDateRanges();
			var l = ranges.length, i=0;
			var generalRange = -1; //Wider date range which can be copied if needed
			
			while(i < l) {
				if(ranges[i] != undefined && ranges[i].getInterval().equals(wInterval)) {
					throw new Error("This time range is identical to another one");
				}
				else {
					if(ranges[i] != undefined && ranges[i].isGeneralFor(new DateRangeModel(wInterval))) {
						generalRange = i;
					}
					i++;
				}
			}
			
			//Edit currently shown calendar
			if(this._editMode) {
				this._mainView.getCalendarView().getDateRange().updateRange(wInterval);
				this._mainView.getCalendarView().show(this._mainView.getCalendarView().getDateRange());
				this._mainView.refresh();
			}
			//Create new calendar
			else {
				//Copy wider date range intervals
				if($("#range-copy-box").is(":checked") && generalRange >= 0) {
					this._mainView.getCalendarView().show(this._mainView.getController().newRange(wInterval, ranges[generalRange].getTypical().getIntervals()));
				}
				else {
					this._mainView.getCalendarView().show(this._mainView.getController().newRange(wInterval));
				}
			}
			$("#modal-range").modal("hide");
		}
		catch(e) {
			$("#modal-range-alert").show();
			$("#modal-range-alert-label").html(e);
			console.error(e);
		}
	};

module.exports = DateRange;
