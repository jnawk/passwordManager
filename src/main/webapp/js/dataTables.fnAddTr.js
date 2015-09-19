/*
 * #%L
 * Password Manager
 * %%
 * Copyright (C) 2013 BAF Technologies Limited
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the 
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public 
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.html>.
 * #L%
 */

// Body of function ripped from http://datatables.net/plug-ins/api

$(function() {
    $.fn.dataTableExt.oApi.fnAddTr = function(oSettings, nTr, bRedraw) {
	if (typeof bRedraw == 'undefined') {
	    bRedraw = true;
	}

	var nTds = nTr.getElementsByTagName('td');
	if (nTds.length != oSettings.aoColumns.length) {
	    console
		    .warn('Warning: not adding new TR - columns and TD elements must match');
	    console.log('nTds.length: ' + nTds.length);
	    console.log('oSettings.aoColumns.length:'
		    + oSettings.aoColumns.length);
	    return;
	}

	var aData = [];
	var aInvisible = [];
	for ( var i = 0; i < nTds.length; i++) {
	    aData.push(nTds[i].innerHTML);
	    if (!oSettings.aoColumns[i].bVisible) {
		aInvisible.push(i);
	    }
	}

	/* Add the data and then replace DataTable's generated TR with ours */
	var iIndex = this.oApi._fnAddData(oSettings, aData);
	nTr._DT_RowIndex = iIndex;
	oSettings.aoData[iIndex].nTr = nTr;

	oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();

	// Hidding invisible columns
	for ( var i = (aInvisible.length - 1); i >= 0; i--) {
	    oSettings.aoData[iIndex]._anHidden[i] = nTds[aInvisible[i]];
	    nTr.removeChild(nTds[aInvisible[i]]);
	}

	// Redraw
	if (bRedraw) {
	    this.oApi._fnReDraw(oSettings);
	}
    }
});
