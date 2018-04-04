class V1API {
    constructor(endpoint) {
        this.endpoint = endpoint;

        this.login = (username, password) => {
            return new Promise((resolve, reject) => {
                fetch(
                    this.endpoint + '/anonymous/login',
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
                        if(response.errors.size) {
                            reject(response.errors);
                        } else {
                            this.token = response.loginToken;
                            resolve();
                        }
                    },
                    err => reject(err)
                );
            });
        };

        this.getPasswordList = () => {
            return new Promise((resolve, reject) => {
                fetch(
                    this.endpoint + '/getPasswords',
                    {
                        headers: new Headers({
                            'content-type': 'application/json',
                            'authorization': 'Basic ' + btoa(this.token.username + ':' + this.token.password)
                        })
                    }
                ).then(
                    response => response.json(),
                    err => reject(err)
                ).then(
                    response => {
                        if(response.errors.size) {
                            reject(response.errors);
                        } else {
                            response.passwords.sort((left, right) => {
                                return left.description.localeCompare(right.description);
                            });
                            resolve(response.passwords);
                        }
                    },
                    err => reject(err)
                );
            });
        };

        this.fetchPassword = (id) => {
            return new Promise((resolve, reject) => {
                fetch(
                    this.endpoint + '/getPasswordDetails',
                    {
                        body: JSON.stringify({passwordId: id}),
                        headers: new Headers({
                            'content-type': 'application/json',
                            'authorization': 'Basic ' + btoa(this.token.username + ':' + this.token.password)
                        }),
                        method: 'POST'
                    }
                ).then(
                    response => response.json(),
                    (errors) => reject(errors)
                ).then(
                    (response) => {
                        delete response.details.id;
                        resolve(response.details);
                    },
                    (errors) => reject(errors)
                );
            });
        };
    }
}

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
                        this.token = response.token;
                        resolve();
                    },
                    err => reject(err)
                );
            });
        };

        this.getPasswordList = () => {
            return new Promise((resolve, reject) => {
                fetch(
                    this.endpoint + '/getPasswords',
                    {
                        body: JSON.stringify({token: this.token}),
                        headers: new Headers({
                            'content-type': 'application/json'
                        }),
                        method: 'POST'
                    }
                ).then(
                    response => response.json(),
                    err => reject(err)
                ).then(
                    response => {
                        this.token = response.token;
                        response.passwords.sort((left, right) => {
                            return left.description.localeCompare(right.description);
                        });
                        response.passwords = response.passwords.map((password) => {
                            password.id = password.passwordId;
                            delete password.passwordId;
                            return password;
                        });
                        resolve(response.passwords);
                    },
                    err => reject(err)
                );
            });
        };

        this.createPassword = (password) => {
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
    }
}

export {
    V1API,
    V2API
};
