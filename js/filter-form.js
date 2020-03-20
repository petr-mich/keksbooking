'use strict';
(function() {

	var advertsFiltered = null;
	var filterForm = document.forms.filter;
	// при запуске страницы форма 'noticeForm' не доступна для пользователя:
	disableFilterForm();
	// объект для хранения динамически создаваемых значений селектов и чекбоксов формы:
	var filterValues = {};
	// с помощью приема делегирования установим обработчики событий для полей формы:
	filterForm.addEventListener('change', function(evt) {
		var target = evt.target.closest('select[id|=housing], #housing-features input[type=checkbox]');

		if (!target || !this.contains(target)) {
			return;
		}

		var prop = target.id.slice(target.id.indexOf('-') + 1);

		if (target.tagName === 'SELECT') {
			filterValues[prop] = target.value;
		} else {
			filterValues[prop] = target.checked;
		}

		filterAdverts();
	});
	// для предотвращения "дребезга" функция для вставки меток будет выполняться через 0.5 сек после ее вызова:
	var insertPins = debounce(window.pin.insertPins, 500);

	Object.defineProperty(window, 'filterForm', {
		value: {
			advertsFiltered: advertsFiltered,
			filterAdverts: filterAdverts,
			enableFilterForm: enableFilterForm,
			disableFilterForm: disableFilterForm,
			resetFilterForm: resetFilterForm
		}
	});
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ФУНКЦИИ:
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//  РАЗБЛОКИРОВКА ФОРМЫ 'filter':
	function enableFilterForm() {
		for (var i = 0; i < filterForm.elements.length; i++) {
			filterForm.elements[i].disabled = false;
		}
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//  БЛОКИРОВКА ФОРМЫ 'filter':
	function disableFilterForm() {
		for (var i = 0; i < filterForm.elements.length; i++) {
			filterForm.elements[i].disabled = true;
		}
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// УСТАНОВКА ЗНАЧЕНИЙ ПОЛЕЙ ФОРМЫ ПО УМОЛЧАНИЮ:
	function resetFilterForm() {

		for (var key in filterValues) {
			if (!filterValues.hasOwnProperty(key)) {
				continue;
			}
			delete filterValues[key];
		}

		filterForm.reset();
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//  ФИЛЬТР ПО ПОЛЯМ ФОРМЫ 'filterForm':
	function filterAdverts() {
		window.pin.removePins();
		window.advert.closeAdvert();

		var adverts = window.map.adverts.slice();
		var formFields = filterForm.querySelectorAll('select[id|=housing], #housing-features input[type=checkbox]');

		for (var i = 0; i < formFields.length; i++) {
			var prop = formFields[i].id.slice(formFields[i].id.indexOf('-') + 1);

			if (formFields[i].tagName === 'INPUT') {
				adverts = adverts.filter(function(item) {
					return !filterValues[prop] ? true :
						!!(~item.offer.features.indexOf(prop)) === !!(filterValues[prop]);
				});
			} else if (formFields[i].tagName === 'SELECT') {
				if (prop === 'price') {
					adverts = adverts.filter(function(item) {
						switch (filterValues.price) {
							case undefined:
								return true;
							case 'any':
								return true;
							case 'low':
								return item.offer.price < 10000;
							case 'middle':
								return 10000 <= item.offer.price && item.offer.price < 50000;
							case 'high':
								return item.offer.price >= 50000;
						}
					});
				} else {
					adverts = adverts.filter(function(item) {
						return (!filterValues[prop] || filterValues[prop] === 'any') ?
							true : item.offer[prop] == filterValues[prop];
					});
				}
			}
		}

		adverts.sort(function(a, b) {
			return a.offer.features.length - b.offer.features.length;
		});

		if (adverts.length > 5) {
			adverts.length = 5;
		}

		window.filterForm.advertsFiltered = adverts;

		insertPins(window.filterForm.advertsFiltered);
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//  УСТРАНЕНИЕ "ДРЕБЕЗГА":
	function debounce(func, ms) {
		var timerID = null;

		function wrapper() {
			clearTimeout(timerID);
			var refThis = this;
			var arg = arguments;
			timerID = setTimeout(function() {
				func.apply(refThis, arg);
			}, ms);
		}

		return wrapper;
	}

})();
