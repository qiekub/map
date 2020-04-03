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
let Calendar = require("./Calendar");
let HoursInput = require("./HoursInput");
let DateRange = require("./DateRange");


/**
 * MainView, view class for the main page
 * @param ctrl The MainController
 */
var MainView = function(ctrl) {
//ATTRIBUTES
	/** The application controller **/
	this._ctrl = ctrl;
	
	/** The week view **/
	this._calendarView = new Calendar(this);
	
	/** The hours input view **/
	this._hoursInputView = new HoursInput(this);
	
	/** The date range modal **/
	this._dateRangeView = new DateRange(this);
	
	/** The help dialog **/
	this._helpView = null;
	
	/** Is the view in minimal mode ? **/
	this._minimal = false;
};

//ACCESSORS
	/**
	 * @return The hours input view
	 */
	MainView.prototype.getHoursInputView = function() {
		return this._hoursInputView;
	};
	
	/**
	 * @return The date range view
	 */
	MainView.prototype.getDateRangeView = function() {
		return this._dateRangeView;
	};
	
	/**
	 * @return The calendar view
	 */
	MainView.prototype.getCalendarView = function() {
		return this._calendarView;
	};
	
	/**
	 * @return The controller
	 */
	MainView.prototype.getController = function() {
		return this._ctrl;
	};
	
	/**
	 * Minimal mode ?
	 */
	MainView.prototype.isMinimal = function() {
		return this._minimal;
	};

//OTHER METHODS
	/**
	 * Initializes the view
	 * @param minimal Is the view in minimal mode (iframe) ?
	 */
	MainView.prototype.init = function(minimal) {
		var ohInputVal = this._hoursInputView.getValue();
		this._minimal = minimal || false;
		if(ohInputVal != undefined && ohInputVal.trim() != "") {
			this._ctrl.showHours(ohInputVal);
		}
		else {
			this._calendarView.show(this._ctrl.getFirstDateRange());
		}
		
		//Init help dialog
		this._helpView = $("#modal-help");
		$("#help-link").click(function() { this._helpView.modal("show"); }.bind(this));
		
		$("#oh-clear").click(function() { this._ctrl.clear(); }.bind(this));
	};
	
	/**
	 * Refreshes the view
	 */
	MainView.prototype.refresh = function() {
		this._hoursInputView.setValue(this._ctrl.getOpeningHours());
	};

module.exports = MainView;
