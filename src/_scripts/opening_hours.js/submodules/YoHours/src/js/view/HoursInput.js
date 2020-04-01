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
global.jQuery = require("jquery");
require("jquery-caret");
let URL = require("./URL");


/**
 * The opening hours text input field
 */
var HoursInput = function(main) {
//ATTRIBUTES
	/** The main view **/
	this._mainView = main;

	/** The input field **/
	this._field = $("#oh");
	
	/** The delay to wait before trying to parse input **/
	this._delay = 700;
	
	/** The timer **/
	this._timer;
	
	/** The URL view **/
	this._vUrl = new URL(main);
	
//CONSTRUCTOR
	//Get opening_hours from URL
	var urlOh = this._vUrl.getOpeningHours();
	if(urlOh != undefined) {
		//Handle special case of parameter passed with '+' instead of ' ' delimiter
		if(urlOh.split("+").length > urlOh.split(" ").length) {
			urlOh = urlOh.replace(/([0-9]{2})\+$/g, "$1#ownplus#"); //Things like "22:00+" at the end of the line
			urlOh = urlOh.replace(/([0-9]{2})\+([^A-Za-z0-9])/g, "$1#ownplus#$2"); //Things like "22:00+" followed by any not alpha-numeric char
			urlOh = urlOh.replace(/\+\+([0-9])/g, " #ownplus#$1"); //Things like " +2 days"
			urlOh = urlOh.replace(/\+/g, " "); //All remaining spaces
			urlOh = urlOh.replace("#ownplus#", "+"); //Custom '+'
		}
		this.setValue(urlOh);
	}
	else {
		this.setValue("");
	}
	
	//Add triggers
	this._field.bind("input propertychange", function() {
		window.clearTimeout(this._timer);
		this._timer = window.setTimeout(
			this.changed.bind(this),
			this._delay
		);
	}.bind(this));
	this._field.keydown(function(event){
		if(event.keyCode == 13) {
			event.preventDefault();
			window.clearTimeout(this._timer);
			this.changed();
		}
	}.bind(this));
};

//ACCESSORS
	/**
	 * @return The opening_hours value
	 */
	HoursInput.prototype.getValue = function() {
		return this._field.val();
	};
	
//MODIFIERS
	/**
	 * Changes the input value
	 */
	HoursInput.prototype.setValue = function(val) {
		if(val != this._field.val()) {
			this._field.val(val);
			this._vUrl.update(val);
		}
	};
	
	/**
	 * Sets if the contained value is correct or not
	 * @param valid Is the value valid
	 * @param ohValid Is the value valid according to opening_hours.js
	 */
	HoursInput.prototype.setValid = function(valid, ohValid) {
		ohValid = ohValid || null;
		
		$("#oh-valid-alert").addClass("hide");
		
		if(valid) {
			$("#oh-form").removeClass("has-error");
		}
		else {
			$("#oh-form").addClass("has-error");
			if(ohValid) {
				$("#oh-valid-alert").removeClass("hide");
				$("#oh-valid-alert a").attr("href", "http://openingh.openstreetmap.de/evaluation_tool/?EXP="+this._field.val());
			}
		}
	};
	
	/**
	 * Called when input value changed to check it, and update calendar
	 */
	HoursInput.prototype.changed = function() {
		var caretPos = this._field.caret();
		this._field.val(this._field.val().replace(/␣/gi, ' ')); //Allow to paste directly from Taginfo
		this._vUrl.update(this._field.val());
		this._mainView.getController().showHours(this._field.val());
		this._field.caret(caretPos);
	};

module.exports = HoursInput;
