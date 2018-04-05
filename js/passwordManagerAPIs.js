const passwordSort = (left, right) => {
    return left.description.localeCompare(right.description);
};

class V2API {
    constructor(endpoint) {
        this.endpoint = endpoint;

        this.login = (username, password) => {
            return new Promise((resolve, reject) => {
                fetch(
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
                ).then(
                    response => response.json(),
                    err => reject(err)
                ).then(
                    response => {
                        localStorage.setItem('token', response.token);
                        resolve();
                    },
                    err => reject(err)
                );
            });
        };

        this.getPasswordList = () => {
            return new Promise((resolve, reject) => {
                if(!localStorage.token) {
                    reject('not logged in');
                } else {
                    fetch(
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
                        resolve(response.passwords);
                    }).catch(err => {
                        reject(err);
                    });
                }
            });
        };

        this.createPassword = password => {
            return new Promise((resolve, reject) => {
                fetch(
                    this.endpoint + '/putPassword',
                    {
                        body: JSON.stringify({
                            token: this.token,
                            description: password.description,
                            password: password.password,
                            username: password.username
                        }),
                        headers: new Headers({
                            'content-type': 'application/json'
                        }),
                        method: 'PUT'
                    }
                ).then(
                    () => resolve(),
                    (errors) => reject(errors)
                );
            });
        };

        this.fetchPassword = passwordId => {
            return new Promise((resolve, reject) => {
                fetch(
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
                    resolve({password: response});
                }).catch(err => reject(err));
            });
        };
    }
}

export default V2API;
