const passwordSort = (left, right) => {
    return left.description.localeCompare(right.description);
};

class V2API {
    constructor(endpoint) {
        this.endpoint = endpoint;

        this.login = (username, password) => {
            return fetch(
                this.endpoint + '/login',
                {
                    body: JSON.stringify({
                        username: username,
                        password: password
                    }),
                    method: 'POST',
                    headers: new Headers({
                        'content-type': 'application/json'
                    })
                }
            ).then(response => response.json()
            ).then(response => localStorage.setItem('token', response.token));
        };

        this.sortPasswords = passwordList => {
            passwordList.sort(passwordSort);
            return passwordList;
        };

        this.getPasswordList = () => {
            if(!localStorage.token) {
                return Promise.reject('not logged in');
            } else {
                return fetch(
                    this.endpoint + '/getPasswords',
                    {
                        body: JSON.stringify({token: localStorage.token}),
                        headers: new Headers({
                            'content-type': 'application/json'
                        }),
                        method: 'POST'
                    }
                ).then(response => response.json()
                ).then(response => {
                    localStorage.setItem('token', response.token);
                    response.passwords.sort(passwordSort);
                    return response.passwords;
                });
            }
        };

        this.createPassword = password => {
            return fetch(
                this.endpoint + '/putPassword',
                {
                    body: JSON.stringify({
                        token: localStorage.token,
                        description: password.description,
                        password: password.password,
                        username: password.username
                    }),
                    headers: new Headers({
                        'content-type': 'application/json'
                    }),
                    method: 'PUT'
                }
            ).then(response => response.json()
            ).then(response => {
              localStorage.setItem('token', response.token);
              return response;
            });
        };

        this.updatePassword = (passwordId, password) => {
            return fetch(
                this.endpoint + '/putPassword',
                {
                    body: JSON.stringify({
                        token: localStorage.token,
                        description: password.description,
                        password: password.password,
                        username: password.username,
                        passwordId: passwordId
                    }),
                    headers: new Headers({
                        'content-type': 'application/json'
                    }),
                    method: 'PUT'
                }
            ).then(response => response.json()
            ).then(response => localStorage.setItem('token', response.token));
        };

        this.fetchPassword = passwordId => {
            return fetch(
                this.endpoint + '/get-password-details',
                {
                    body: JSON.stringify({
                        token: localStorage.token,
                        passwordId: passwordId
                    }),
                    headers: new Headers({
                        'content-type': 'application/json'
                    }),
                    method: 'POST'
                }
            ).then(response => response.json()).then(response => {
                localStorage.setItem('token', response.token);
                delete response.token;
                response['passwordId'] = btoa(passwordId);
                return {password: response};
            });
        };
    }
}

export default V2API;
