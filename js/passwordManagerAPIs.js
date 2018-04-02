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
                            // TODO convert to a standard form
                            resolve(response.passwords);
                        }
                    },
                    err => reject(err)
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
                        resolve(response.passwords);
                    },
                    err => reject(err)
                );
            });
        };
    }
}

export {
    V1API,
    V2API
};
