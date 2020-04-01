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


/**
 * The URL manager
 */
var URL = function() {
};
	
//ACCESSORS
	/**
	 * @return The opening_hours value in URL, or undefined
	 */
	URL.prototype.getOpeningHours = function() {
		return (this._getParameters().oh != undefined) ? decodeURIComponent(this._getParameters().oh) : "";
	};

//MODIFIERS
	/**
	 * Updates the URL with the given opening_hours value
	 * @param oh The new value
	 */
	URL.prototype.update = function(oh) {
		var params = (oh != undefined && oh.trim().length > 0) ? "oh="+oh.trim() : "";
		var hash = this._getUrlHash();
		
		var allOptions = params + ((hash != "") ? '#' + hash : "");
		var link = this._getUrl() + ((allOptions.length > 0) ? "?" + allOptions : "" );
		
		window.history.replaceState({}, "YoHours", link);
	};

//OTHER METHODS
	/**
	 * @return The URL parameters as an object
	 */
	URL.prototype._getParameters = function() {
		var sPageURL = window.location.search.substring(1);
		var sURLVariables = sPageURL.split('&');
		var params = new Object();
		
		for (var i = 0; i < sURLVariables.length; i++) {
			var sParameterName = sURLVariables[i].split('=');
			params[sParameterName[0]] = sParameterName[1];
		}
		
		return params;
	};
	
	/**
	 * @return The page base URL
	 */
	URL.prototype._getUrl = function() {
		return $(location).attr('href').split('?')[0];
	};
	
	/**
	 * @return The URL hash
	 */
	URL.prototype._getUrlHash = function() {
		var hash = $(location).attr('href').split('#')[1];
		return (hash != undefined) ? hash : "";
	};

module.exports = URL;
