'use strict';
(function() {

	// переменная для хранения объявлений, полученных при успешной загрузке данных с сервера:
	var adverts = null;
	// флаг активации сайта:
	var siteActivated = false;
	// карта:
	var map = document.querySelector('.map');
	// карта для меток:
	var pinsMap = map.querySelector('.map__pins');
	// главная метка:
	var pinMain = document.querySelector('.map__pin--main');
	// предварительно установим обработчики событий для активации карты и формы
	pinMain.tabIndex = 1;
	// для исключения конфликта уберем обработчик браузера по умолчанию 'drag&drop':
	pinMain.ondragstart = function() {
		return false;
	};
	// установим обработчик механизма 'drag&drop' на главную метку:
	pinMain.addEventListener('mousedown', activateSite);

	Object.defineProperty(window, 'map', {
		value: {
			adverts: adverts,
			enableMap: enableMap,
			disableMap: disableMap,
			resetPinMain: resetPinMain
		}
	});
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ФУНКЦИИ:
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ОБРАБОТЧИК СОБЫТИЯ: РАЗБЛОКИРОВКА КАРТЫ И ФОРМЫ:
	function activateSite(evt) {
		var startX = evt.clientX;
		var startY = evt.clientY;
		var dragged = false;

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);

		function onMouseMove(evt) {
			var shiftX = startX - evt.clientX;
			var shiftY = startY - evt.clientY;

			startX = evt.clientX;
			startY = evt.clientY;

			var left = pinMain.offsetLeft - shiftX;
			var top = pinMain.offsetTop - shiftY;

			if (left < pinMain.offsetWidth / 2) {
				left = pinMain.offsetWidth / 2;
			}
			if (left > pinsMap.offsetWidth - pinMain.offsetWidth / 2) {
				left = pinsMap.offsetWidth - pinMain.offsetWidth / 2;
			}

			pinMain.style.left = left + 'px';

			if (top < window.data.yMin) {
				top = window.data.yMin;
			}
			if (top > window.data.yMax) {
				top = window.data.yMax;
			}

			pinMain.style.top = top + 'px';

			window.noticeForm.enterCurrentAddressCoords();
			dragged = true;
		}

		function onMouseUp() {

			if (!siteActivated && dragged) {
				// подгружаем с сервера данные и вставляем метки в блок '.map__pins':
				window.backend.load('https://js.dump.academy/keksobooking/data', function(response) {
					window.map.adverts = response;
					window.filterForm.filterAdverts();
					window.filterForm.enableFilterForm();
					window.noticeForm.enableNoticeForm();
					enableMap();
				});
			}

			window.noticeForm.enterCurrentAddressCoords();

			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//  РАЗБЛОКИРОВКА КАРТЫ '.map':
	function enableMap() {
		map.classList.remove('map--faded');
		siteActivated = true;
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//  БЛОКИРОВКА КАРТЫ '.map':
	function disableMap() {
		map.classList.add('map--faded');
		siteActivated = false;
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//  УСТАНОВКА ГЛАВНОЙ МЕТКИ '.map__pin--main' В ИСХОДНОЕ ПОЛОЖЕНИЕ:
	function resetPinMain() {
		pinMain.style.left = window.data.pinMainStartLeft + 'px';
		pinMain.style.top = window.data.pinMainStartTop + 'px';
	}

})();
