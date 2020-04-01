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
global.$ = require("jquery");
require("fullcalendar");
let moment = require("moment");
let Constants = require("../model/Constants");
let Interval = require("../model/Interval");


/**
 * The calendar view, with its navigation bar
 */
var Calendar = function(main) {
//ATTRIBUTES
	/** The main view **/
	this._mainView = main;
	
	/** The currently shown date range **/
	this._dateRange = null;

//CONSTRUCTOR
	$("#range-edit").click(function() { this._mainView.getDateRangeView().show(true); }.bind(this));
	$("#range-delete").click(function() {
		this._mainView.getController().deleteCurrentRange();
		this._mainView.getCalendarView().show(this._mainView.getController().getFirstDateRange());
	}.bind(this));
	$("#range-nav-new").click(function() { this._mainView.getDateRangeView().show(false); }.bind(this))
};

//ACCESSORS
	/**
	 * @return The currently shown date range
	 */
	Calendar.prototype.getDateRange = function() {
		return this._dateRange;
	};

//MODIFIERS
	/**
	 * Updates the date range navigation bar
	 */
	Calendar.prototype.updateRangeNavigationBar = function() {
		//Remove previous tabs
		$("#range-nav li.rnav").remove();
		
		//Create tabs
		var dateRanges = this._mainView.getController().getDateRanges();
		var dateRange, timeName;
		var navHtml = '';
		for(var i=0, l=dateRanges.length; i < l; i++) {
			dateRange = dateRanges[i];
			if(dateRange != undefined) {
				timeName = dateRange.getInterval().getTimeSelector();
				if(timeName.length == 0) { timeName = "All year"; }
				navHtml += '<li role="presentation" id="range-nav-'+i+'" class="rnav';
				if(dateRange === this._dateRange) { navHtml += ' active'; }
				navHtml += '"><a onClick="yh.getView().getCalendarView().tab(\''+i+'\')">'+timeName+'</a></li>';
			}
		}
		
		//Add to DOM
		$("#range-nav").prepend(navHtml);
	};
	
	/**
	 * Updates the label showing the human readable date range
	 */
	Calendar.prototype.updateDateRangeLabel = function() {
		$("#range-txt-label").html(this._dateRange.getInterval().getTimeForHumans());
	};
	
	/**
	 * Click handler for navigation tabs
	 * @param id The date range id to show
	 */
	Calendar.prototype.tab = function(id) {
		this.show(this._mainView.getController().getDateRanges()[id]);
		$("#range-nav li.active").removeClass("active");
		$("#range-nav-"+id).addClass("active");
	};
	
	/**
	 * Displays the given typical week or day
	 * @param dateRange The date range to display
	 */
	Calendar.prototype.show = function(dateRange) {
		this._dateRange = dateRange;
		$("#calendar").fullCalendar('destroy');
		
		var intervals = this._dateRange.getTypical().getIntervals();
		var events = [];
		var interval, weekId, eventData, to, eventConstraint, defaultView, colFormat;
		var fctSelect, fctEdit;
		
		/*
		 * Variables depending of the kind of typical day/week
		 */
		//Week
		if(this._dateRange.definesTypicalWeek()) {
			//Create intervals array
			for(var i = 0; i < intervals.length; i++) {
				interval = intervals[i];
				
				if(interval != undefined) {
					//Single minute event
					if(interval.getStartDay() == interval.getEndDay() && interval.getFrom() == interval.getTo()) {
						to = moment().startOf("isoweek").day("Monday").hour(0).minute(0).second(0).milliseconds(0).add(interval.getEndDay(), 'days').add(interval.getTo()+1, 'minutes');
					}
					else {
						to = moment().startOf("isoweek").day("Monday").hour(0).minute(0).second(0).milliseconds(0).add(interval.getEndDay(), 'days').add(interval.getTo(), 'minutes');
					}
					
					//Add event on calendar
					eventData = {
						id: i,
						start: moment().startOf("isoweek").day("Monday").hour(0).minute(0).second(0).milliseconds(0).add(interval.getStartDay(), 'days').add(interval.getFrom(), 'minutes'),
						end: to,
					};
					events.push(eventData);
				}
			}
			
			eventConstraint = { start: moment().startOf("isoweek").day("Monday").format("YYYY-MM-DD[T00:00:00]"), end: moment().startOf("isoweek").day("Monday").add(7, "days").format("YYYY-MM-DD[T00:00:00]") };
			defaultView = "agendaWeek";
			colFormat = (this._mainView.isMinimal()) ? "dd" : "dddd";
			fctSelect = function(start, end) {
				//Add event to week intervals
				var minStart = parseInt(start.format("H"),10) * 60 + parseInt(start.format("m"),10);
				var minEnd = parseInt(end.format("H"),10) * 60 + parseInt(end.format("m"),10);
				var dayStart = this.swDayToMwDay(start.format("d"));
				var dayEnd = this.swDayToMwDay(end.format("d"));
				
				//All day interval
				if(minStart == 0 && minEnd == 0 && dayEnd - dayStart >= 1) {
					minEnd = Constants.MINUTES_MAX;
					dayEnd--;
				}
				
				var weekId = this._dateRange.getTypical().addInterval(
					new Interval(
						dayStart,
						dayEnd,
						minStart,
						minEnd
					)
				);
				
				//Add event on calendar
				eventData = {
					id: weekId,
					start: start,
					end: end
				};
				$('#calendar').fullCalendar('renderEvent', eventData, true);
				
				this._mainView.refresh();
				
				//Simulate click event to display resizer
				this.simulateClick();
			}.bind(this);
			
			fctEdit = function(event, delta, revertFunc, jsEvent, ui, view) {
				var minStart = parseInt(event.start.format("H"),10) * 60 + parseInt(event.start.format("m"),10);
				var minEnd = parseInt(event.end.format("H"),10) * 60 + parseInt(event.end.format("m"),10);
				var dayStart = this.swDayToMwDay(event.start.format("d"));
				var dayEnd = this.swDayToMwDay(event.end.format("d"));
				
				//All day interval
				if(minStart == 0 && minEnd == 0 && dayEnd - dayStart >= 1) {
					minEnd = Constants.MINUTES_MAX;
					dayEnd--;
				}
				
				this._dateRange.getTypical().editInterval(
					event.id,
					new Interval(
						dayStart,
						dayEnd,
						minStart,
						minEnd
					)
				);
				this._mainView.refresh();
			}.bind(this);
		}
		//Day
		else {
			//Create intervals array
			for(var i = 0; i < intervals.length; i++) {
				interval = intervals[i];
				
				if(interval != undefined) {
					//Single minute event
					if(interval.getFrom() == interval.getTo()) {
						to = moment().hour(0).minute(0).second(0).milliseconds(0).add(interval.getTo()+1, 'minutes');
					}
					else {
						to = moment().hour(0).minute(0).second(0).milliseconds(0).add(interval.getTo(), 'minutes');
					}
					
					//Add event on calendar
					eventData = {
						id: i,
						start: moment().hour(0).minute(0).second(0).milliseconds(0).add(interval.getFrom(), 'minutes'),
						end: to
					};
					events.push(eventData);
				}
			}
			
			eventConstraint = { start: moment().format("YYYY-MM-DD[T00:00:00]"), end: moment().add(1, "days").format("YYYY-MM-DD[T00:00:00]") };
			defaultView = "agendaDay";
			colFormat = "[Day]";
			fctSelect = function(start, end) {
				//Add event to week intervals
				var minStart = parseInt(start.format("H",10)) * 60 + parseInt(start.format("m"),10);
				var minEnd = parseInt(end.format("H"),10) * 60 + parseInt(end.format("m"),10);
				var weekId = this._dateRange.getTypical().addInterval(
					new Interval(
						0,
						0,
						minStart,
						minEnd
					)
				);
				
				//Add event on calendar
				eventData = {
					id: weekId,
					start: start,
					end: end
				};
				$('#calendar').fullCalendar('renderEvent', eventData, true);
				
				this._mainView.refresh();
				
				//Simulate click event to display resizer
				this.simulateClick();
			}.bind(this);
			
			fctEdit = function(event, delta, revertFunc, jsEvent, ui, view) {
				var minStart = parseInt(event.start.format("H"),10) * 60 + parseInt(event.start.format("m"),10);
				var minEnd = parseInt(event.end.format("H"),10) * 60 + parseInt(event.end.format("m"),10);
				this._dateRange.getTypical().editInterval(
					event.id,
					new Interval(
						0,
						0,
						minStart,
						minEnd
					)
				);
				this._mainView.refresh();
			}.bind(this);
		}
		
		//Create calendar
		$("#calendar").fullCalendar({
			header: {
				left: '',
				center: '',
				right: ''
			},
			defaultView: defaultView,
			editable: true,
			height: "auto",
			columnFormat: colFormat,
			timeFormat: 'HH:mm',
			axisFormat: 'HH:mm',
			allDayText: '24/24',
			allDaySlot: false,
			slotDuration: '00:15:00',
			firstDay: 1,
			eventOverlap: false,
			events: events,
			eventConstraint: eventConstraint,
			selectable: true,
			selectHelper: true,
			selectOverlap: false,
			select: fctSelect,
			eventClick: function(calEvent, jsEvent, view) {
				this._dateRange.getTypical().removeInterval(calEvent._id);
				$('#calendar').fullCalendar('removeEvents', calEvent._id);
				this._mainView.refresh();
			}.bind(this),
			eventResize: fctEdit,
			eventDrop: fctEdit
		});
		
		this.updateDateRangeLabel();
		this.updateRangeNavigationBar();
	};
	
	/**
	 * Simulates a mouse click over the calendar
	 */
	Calendar.prototype.simulateClick = function() {
		var $el = $("#calendar");
		var offset = $el.offset();
		var event = $.Event("mousedown", {
			which: 1,
			pageX: offset.left,
			pageY: offset.top
		});
		$el.trigger(event);
	};
	
	/**
	 * Converts the day code from a sunday-starting week into the day code of a monday-starting week
	 * @param d The sunday-starting week day (as string)
	 * @return The monday-starting week day
	 */
	Calendar.prototype.swDayToMwDay = function(d) {
		var day = parseInt(d,10);
		return (day == 0) ? 6 : day - 1;
	};

module.exports = Calendar;
