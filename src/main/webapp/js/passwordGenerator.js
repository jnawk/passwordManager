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
function addCriteria() {
	var passwordGenerator = $('#passwordGenerator');
	var passwordLength = passwordGenerator.find('input[name="passwordLength"]');
	var body = passwordGenerator.find('table tbody');
	var tr = $('<tr>');
	body.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.append($('<input>').attr('type', 'checkbox').attr('name', 'lower').attr(
			'checked', 'checked'));
	td = $('<td>');
	tr.append(td);
	td.append($('<input>').attr('type', 'checkbox').attr('name', 'upper').attr(
			'checked', 'checked'));
	td = $('<td>');
	tr.append(td);
	td.append($('<input>').attr('type', 'checkbox').attr('name', 'number')
			.attr('checked', 'checked'));
	td = $('<td>');
	tr.append(td);
	td.append($('<input>').attr('type', 'checkbox').attr('name', 'symbol')
			.attr('checked', 'checked'));
	td = $('<td>');
	tr.append(td);
	var minimum = $('<input>');
	td.append(minimum.attr('name', 'minimum').val(0));
	minimum.spinner({
		min : 0,
		max : passwordLength.val(),
		change : function(event, ui) {
			var max = $(this).spinner('option', 'max');
			if ($(this).val() > max) {
				$(this).val(max);
			}
			$(this).parents('tr').find('input[name="maximum"]').spinner(
					'option', 'min', $(this).val());
		},
		spin : function(event, ui) {
			$(this).parents('tr').find('input[name="maximum"]').spinner(
					'option', 'min', ui.value);
		}
	});
	td = $('<td>');
	tr.append(td);
	var maximum = $('<input>');
	td.append(maximum.attr('name', 'maximum').val(passwordLength.val()));
	maximum.spinner({
		min : 0,
		max : passwordLength.val(),
		change : function(event, ui) {
			var max = $(this).spinner('option', 'max');
			if ($(this).val() > max) {
				$(this).val(max);
			}
			$(this).parents('tr').find('input[name="minimum"]').spinner(
					'option', 'max', $(this).val());
		},
		spin : function(event, ui) {
			$(this).parents('tr').find('input[name="minimum"]').spinner(
					'option', 'max', ui.value);
		}
	});
	td = $('<td>');
	tr.append(td);
	td.append($('<span>').addClass('deletePasswordRule').text('Delete').click(
			function() {
				$(this).parents('tr').remove();
			}));

}

function changePasswordLength(length) {
	var passwordGenerator = $('#passwordGenerator');
	passwordGenerator.find('input[name="minimum"]').spinner('option', 'max',
			length);
	passwordGenerator.find('input[name="maximum"]').each(
			function(index, value) {
				$(value).spinner('option', 'max', length);
				if ($(value).val() == (length - 1)) {
					$(value).val(length);
				}
			});
}

function generatePassword() {
	var passwordGenerator = $('#passwordGenerator');
	var passwordLength = passwordGenerator.find('input[name="passwordLength"]')
			.val();
	var criteria = [];
	passwordGenerator.find('tbody tr').each(function(index, value) {
		var lower = $(value).find('input[name="lower"]');
		var upper = $(value).find('input[name="upper"]');
		var number = $(value).find('input[name="number"]');
		var symbol = $(value).find('input[name="symbol"]');
		var minimum = $(value).find('input[name="minimum"]');
		var maximum = $(value).find('input[name="maximum"]');
		criteria.push({
			lower : lower.is(':checked'),
			upper : upper.is(':checked'),
			number : number.is(':checked'),
			symbol : symbol.is(':checked'),
			minimum : minimum.val(),
			maximum : maximum.val()
		});
	});
	$.ajax({
		type : 'POST',
		url : 'json/anonymous/passwordGenerator',
		data : JSON.stringify({
			passwordLength : passwordLength,
			criteria : criteria
		}),
		contentType : 'application/json',
		dataType : 'json',
		success : function(data, testStatus, jqXHR) {
			if (data.errors.length == 0) {
				var generatedPassword = $('#generatedPassword');
				generatedPassword.val(data.password);
				var newPasswordForm = $('#newPasswordForm');
				var editPassword = $('#editPassword');
				var newPassword = generatedPassword.val();

				if (newPasswordForm.dialog('isOpen')) {
					passwordGenerator.dialog('option', 'buttons', {
						"Use for new password" : function() {
							newPasswordForm.find('input[name="password"]').val(
									newPassword);
							passwordGenerator.dialog('close');
						},
						"Add Criteria" : addCriteria,
						"Generate Password" : generatePassword,
						"Close" : closeThisDialog
					});
				} else if (editPassword.is(':visible')) {
					passwordGenerator.dialog('option', 'buttons', {
						"Change existing password" : function() {
							editPassword.find('input[name="password"]').val(
									newPassword);
							passwordGenerator.dialog('close');
						},
						"Add Criteria" : addCriteria,
						"Generate Password" : generatePassword,
						"Close" : closeThisDialog
					});
				}
			}
		}
	});
}

function passwordGenerator() {
	$('#passwordGenerator').dialog('open');
}

function openPasswordGenerator() {
	$('#generatedPassword').val('');
	var passwordGenerator = $('#passwordGenerator');
	passwordGenerator.dialog('option', 'buttons', {
		"Add Criteria" : addCriteria,
		"Generate Password" : generatePassword,
		"Close" : closeThisDialog
	});

	if (0 == passwordGenerator.find('tbody tr').length) {
		addCriteria();
	}
}
