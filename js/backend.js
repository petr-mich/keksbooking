'use strict';
(function() {

	Object.defineProperty(window, 'backend', {
		value: {
			load: load,
			save: save
		}
	});
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ФУНКЦИИ:
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ЗАГРУЗКА ДАННЫХ С СЕРВЕРА С ПОМОЩЬЮ ОБЪЕКТА 'XMLHttpRequest':
	function load(url, onSuccessFunc, onErrorFunc) {
		onErrorFunc = onErrorFunc || showErrorMessage;

		var xhr = new XMLHttpRequest();

		xhr.open('get', url);
		xhr.responseType = 'json';

		xhr.addEventListener('load', function() {
			if (xhr.status !== 200) {
				onErrorFunc('Произошла ошибка соединения', 'Статус ответа: ' + xhr.status + ' ' + xhr.statusText);
			} else if (xhr.response === null) {
				onErrorFunc('Произошла ошибка соединения', 'Некорректный json-файл');
			} else if (!isMatchedObjectToTemplate(window.randomAdverts[0], xhr.response)) {
				onErrorFunc('Произошла ошибка соединения', 'Отсутствует свойство в json-файле');
			} else {
				onSuccessFunc(xhr.response);
			}
		});

		xhr.addEventListener('error', function() {
			onErrorFunc('Произошла ошибка соединения');
		});

		xhr.send();
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ОТПРАВКА ДАННЫХ НА СЕРВЕР С ПОМОЩЬЮ ОБЪЕКТА 'XMLHttpRequest':
	function save(url, data, onSuccessFunc, onErrorFunc) {
		onErrorFunc = onErrorFunc || showErrorMessage;

		var xhr = new XMLHttpRequest();

		xhr.open('POST', url);

		xhr.addEventListener('load', function() {
			if (xhr.status !== 200) {
				onErrorFunc('Произошла ошибка соединения', 'Статус ответа: ' + xhr.status + ' ' + xhr.statusText);
			} else {
				onSuccessFunc();
				showSuccessMessage('Данные успешно отправлены');
			}
		});

		xhr.addEventListener('error', function() {
			onErrorFunc('Произошла ошибка соединения');
		});

		xhr.send(data);
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ГЕНЕРАЦИЯ ОПОВЕЩЕНИЯ ПРИ УСПЕШНОЙ ОТПРАВКЕ ФОРМЫ:
	function showSuccessMessage(successText) {
		var successMessage = document.createElement('div');
		successMessage.style = 'display: inline-block; position: fixed; z-index: 9999; padding: 0 20px;' +
			'background-color: #fff; line-height: 50px; text-align: center; font-size: 30px; color: #30BF30;' +
			'border: 3px solid #30BF30; border-radius: 15px;';
		successMessage.textContent = successText;

		document.body.append(successMessage);

		successMessage.style.top = document.documentElement.clientHeight / 3 -
			successMessage.offsetHeight / 2 + 'px';
		successMessage.style.left = document.documentElement.clientWidth / 2 -
			successMessage.offsetWidth / 2 + 'px';

		setTimeout(function() {
			successMessage.remove();
		}, 5000);
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ГЕНЕРАЦИЯ ОПОВЕЩЕНИЯ ПРИ ВОЗНИКНОВЕНИИ ОШИБКИ:
	function showErrorMessage(errorText, consoleError) {
		consoleError = consoleError || errorText;

		var errorMessage = document.createElement('div');
		errorMessage.style = 'display: inline-block; position: fixed; z-index: 9999; padding: 0 20px;' +
			'background-color: #fff; line-height: 50px; text-align: center; font-size: 30px; color: #BF3030;' +
			'border: 3px solid #BF3030; border-radius: 15px;';
		errorMessage.textContent = errorText;

		document.body.append(errorMessage);

		errorMessage.style.top = document.documentElement.clientHeight / 3 -
			errorMessage.offsetHeight / 2 + 'px';
		errorMessage.style.left = document.documentElement.clientWidth / 2 -
			errorMessage.offsetWidth / 2 + 'px';

		console.error(consoleError);

		setTimeout(function() {
			errorMessage.remove();
		}, 5000);
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ПРОВЕРКА JSON-ФАЙЛА НА НАЛИЧИЕ ВСЕХ НЕОБХОДИМЫХ СВОЙСТВ:
	function isMatchedObjectToTemplate(objTemplate, jsonLoaded) {
		var templateProps = getObjProps(objTemplate);

		for (var i = 0; i < jsonLoaded.length; i++) {
			var objLoadedProps = getObjProps(jsonLoaded[i]);

			for (var j = 0; j < templateProps.length; j++) {
				if (!(~objLoadedProps.indexOf(templateProps[j]))) {
					return false;
				}
			}

		}
		return true;

		function getObjProps(obj) {
			var objProps = [];

			iterateProp(obj);
			return objProps;

			function iterateProp(obj) {
				for (var key in obj) {
					if (obj[key] instanceof Object) {
						iterateProp(obj[key]);
					} else if (!(obj instanceof Array)) {
						objProps.push(key);
					}
				}
			}
		}
	}

})();
