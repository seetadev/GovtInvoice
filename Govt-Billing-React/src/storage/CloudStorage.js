import 'whatwg-fetch';

const BASE_URL = 'http://aspiringapps.com/api';

export class Cloud {

	_auth(data){
        let url = BASE_URL+"/login";
        let body = JSON.stringify({ data: data});
        return fetch(url, {
		  method: 'POST',
		  headers: {
		    'Content-Type': 'application/json'
		  },
		  body: body
		}).then(response => {
			console.log('request succeeded with JSON response', response)
		});
    }

    _checkStatus(response) {
		if (response.status >= 200 && response.status < 300) {
			return response
		} else {
			var error = new Error(response.statusText)
			error.response = response
			throw error
		}
	}

	_parseJSON(response) {
  		return response.json()
	}

}