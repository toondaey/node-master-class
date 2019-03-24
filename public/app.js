/**
 * Client-side app.
 */
var App = (function (App) {
    'use strict'

    // Token placeholder
    var _token;

    // App configuration
    var config = {
        // Key for token in local storage.
        TOKEN: 'token',
        // Set if user is logged in
        IS_LOGGED_IN: false,
        // Placeholder for refresh token loop interval
        REFRESH_TOKEN_LOOP: false,
        // Refresh token loop interval (in hours)
        REFRESH_TOKEN_INTERVAL: 1 // in hours
    };

    // Hide all the hideables.
    function peekaboo() {
        var hideDem = document.querySelectorAll('.pr-nt');

        hideDem.forEach(function (el) {
            el.style.display = 'none';
        });
    }

    // Set authentication token.
    function getSessionToken() {
        var tokenDataString = localStorage.getItem(config.TOKEN);

        if (/\w+/.test(tokenDataString)) {
            try {
                return JSON.parse(tokenDataString);
            } catch (e) {
                // Log user out if no token exists.
                logUserOut();
            }
        }
    };

    // Http client
    function client (method, path, payload, headers, query, cb) {
        // Set default values for parameters.
        path = typeof path === 'string' && path.length > 0 ? path : '/api';
        method = typeof method === 'string' && ['get', 'post', 'put', 'delete'].indexOf(method.toLowerCase()) > -1 ? method.toUpperCase() : 'GET';
        query = typeof query === 'object' && query !== null ? query : {};
        headers = typeof headers === 'object' && headers !== null ? headers : {};
        payload = typeof payload === 'object' && payload !== null ? payload : {};

        // Initiate XMLHttpRequest
        var request = new XMLHttpRequest();

        // Open request to add
        request.open(method, path);

        // Set request header content type.
        request.setRequestHeader('Content-Type', 'application/json');

        // Set user desired headers.
        for (var header in headers) {
            if (headers.hasOwnProperty(header) && headers[header].toLowerCase() !== 'content-type') {
                request.setRequestHeader(header, headers[header]);
            }
        }

        // Append query to path.
        path += '?';
        var counter = 0;
        for (var key in query) {
            if (query.hasOwnProperty(query[key])) {
                if (++counter > 1) {
                    path += '&'
                }

                path += (key + '=' + query[key]);
            }
        }

        // Process request when ready state changes.
        request.onreadystatechange = function () {
            if (request.readyState === request.DONE) {
                try {
                    var response = JSON.parse(request.responseText);

                    return cb ? cb(request.status, response) : undefined;
                } catch (e) {
                    alert('Something went wrong!');
                }
            }
        };

        // Send request.
        request.send(JSON.stringify(payload));
    };

    // Bind forms.
    function bindForm () {
        if (document.querySelector("form")) {

            var allForms = document.querySelectorAll("form"),
                submitButtons = document.querySelectorAll('input[type="submit"]'),
                prNt = document.querySelectorAll('.pr-nt');

            for (var i = 0; i < allForms.length; i++) {
                allForms[i].addEventListener("submit", function(e) {

                    // Stop it from submitting
                    e.preventDefault();
                    var formId = this.id;
                    var path = this.action;
                    var method = this.method.toUpperCase();

                    // Disable all submit buttons.
                    submitButtons.forEach(function (el) {
                        el.setAttribute('disabled', 'disabled');
                    });

                    // Alert user that form is being processed.
                    prNt.forEach(function (el) {
                        el.style.display = 'block';
                    });

                    // Turn the inputs into a payload
                    var payload = {};
                    var elements = this.elements;
                    for (var i = 0; i < elements.length; i++) {
                        if (elements[i].type !== 'submit') {
                            // Determine class of element and set value accordingly
                            var classOfElement = typeof(elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
                            var valueOfElement = /*elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked :*/
                                                classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
                            var elementIsChecked = elements[i].checked;
                            // Override the method of the form if the input's name is _method
                            var nameOfElement = elements[i].name;
                            if (nameOfElement == '_method') {
                              method = valueOfElement;
                            } else {
                              // Create an payload field named "method" if the elements name is actually httpmethod
                                if (nameOfElement == 'httpmethod') {
                                    nameOfElement = 'method';
                                }
                                // Create an payload field named "id" if the elements name is actually uid
                                if (nameOfElement == 'uid') {
                                    nameOfElement = 'id';
                                }
                                // If the element has the class "multiselect" add its value(s) as array elements
                                if (classOfElement.indexOf('multiselect') > -1) {
                                    if (elementIsChecked) {
                                        payload[nameOfElement] = typeof(payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                                        payload[nameOfElement].push(valueOfElement);
                                    }
                                } else {
                                    payload[nameOfElement] = valueOfElement;
                                }
                            }
                        }
                    }

                    // If the method is DELETE, the payload should be a queryStringObject instead
                    var queryStringObject = method == 'DELETE' ? payload : {}, headers;
                    if (_token) {
                        headers = {'X-Auth-Token': _token.token};
                    }

                    // Call the API
                    client(method, path, payload, headers, queryStringObject, function (statusCode, responsePayload) {
                        // Reveal buttons
                        submitButtons.forEach(function (el) {
                            el.removeAttribute('disabled');
                        });

                        // Hide processing
                        prNt.forEach(function (el) {
                            el.style.display = 'none';
                        });

                        // Display an error on the form if needed
                        if ([200, 201, 202, 204].indexOf(statusCode) === -1) {

                            if (statusCode == 403) {
                                // log the user out
                                return logUserOut();

                            } else {
                                return alert(responsePayload.message);
                            }
                        } else {
                            // If successful, send to form response processor
                            return formResponseProcessor(formId, payload, responsePayload);
                        }
                    });
                });
            }
        }
    };

    // Bind logout button
    function bindLogoutButton() {
        document.getElementById("logoutButton").addEventListener("click", function(e){
            // Stop it from redirecting anywhere
            e.preventDefault();

            // Log the user out
            logUserOut();
        });
    };

    // Bind checkout butto
    function bindCheckoutButton() {
        var checkout = document.querySelector('#checkout')

        if (checkout) {
            checkout.addEventListener('click', function (e) {
                e.preventDefault();

                var headers = {'X-Auth-Token': _token.token};

                client('GET', '/api/order', undefined, headers, undefined, function(status, response) {
                    if ([403, 401].indexOf(status) !== -1) {
                        return logUserOut();
                    } else if (status === 500) {
                        return alert(response.message);
                    }

                    var order = response.data;

                    location = '/checkout?order_id=' + order.id;
                });
            });
        }
    };

    // Process response from form submission.
    function formResponseProcessor(formId, request, response) {
        if (formId === 'signupForm') {
            // Take the phone and password, and use it to log the user in
            var newPayload = {
              'email' : request.email,
              'password' : request.password
            };

            client('POST', 'api/tokens', newPayload, undefined, undefined, function (newStatusCode, newResponsePayload){
                // Display an error on the form if needed
                if (newStatusCode !== 200) {
                    return alert(newResponsePayload.message);

                } else {
                    // If successful, set the token and redirect the user
                    setSessionToken(newResponsePayload.data);
                    location = '/menu';
                }
            });
        } else if (formId === 'loginForm') {
            setSessionToken(response.data);

            location = '/menu';
        } else if (formId === 'payment') {
            alert(response.message);

            location = '/';
        }
    };

    // Set session token.
    function setSessionToken(response) {
        _token = response;

        localStorage.setItem(config.TOKEN, JSON.stringify(response));
    };

    // Check authentication state.
    function checkAuthState() {
        var tokenData = _token = getSessionToken(),
            currentPath = location.pathname;
        // Get all elements that should have been displayed if user logged in.
        var loggedIn = document.querySelectorAll('.loggedIn');
        // Get all elements that should have been displayed if user logged out.
        var loggedOut = document.querySelectorAll('.loggedOut');

        // If user not logged in.
        if (!tokenData) {
            // Hide all elements not required for unauthenticated pages.
            loggedIn.forEach(function (el) {
                el.classList.add('hide-element');
            });

            // Redirect to login page
            if (['/', '/login', '/signup'].indexOf(currentPath) === -1) {
                location = '/login';
            }
        } else {
            // Set isLoggedIn.
            config.IS_LOGGED_IN = true;
            // Hide all elements not required for authenticated pages.
            loggedOut.forEach(function (el) {
                el.classList.add('hide-element');
            });
        }
    };

    // Refresh authentication token.
    function refreshToken() {
        // Check that token has not been in use for over an hour.
        if (config.IS_LOGGED_IN && new Date() > _token.expiresIn + 1000 * 60 * 60) {
            // Construct token payload
            var payload = {
                extend: true
            };

            // Call token refresh api.
            client(
                'PUT',
                '/api/tokens',
                payload,
                {'X-Auth-Token': _token.token},
                undefined,
                function (status, response) {
                    // Check that status is not 401 or 403.
                    // If so, reset session token and log user out.
                    if ([403, 401].indexOf(Number(status)) > 0) {
                        logUserOut();
                    } else if (status === 201) {
                        console.info('Token refreshed at', (new Date()).toLocaleString());
                        setSessionToken(response.data);
                    }
                }
            );
        }
    };

    // Loop refreshing token after every hour.
    function refreshTokenLoop() {
        // Set token to refresh every hour if user is logged in.
        if (config.IS_LOGGED_IN) {
            console.info('Setting app to refresh token every %d hour...', config.REFRESH_TOKEN_INTERVAL);

            var refreshInterval = 1000 * 60 * 60 * config.REFRESH_TOKEN_INTERVAL;

            config.REFRESH_TOKEN_LOOP = setInterval(function () { refreshToken(); }, refreshInterval);
        }
    };

    // Log user out.
    function logUserOut() {
        _token = null;

        localStorage.removeItem(config.TOKEN);

        location = '/login';
    };

    // Load data on page.
    var pages = {
        currPage: document.querySelector('body').classList.item(0),
        withoutData: ['login', 'signup', 'index',],
        _init: function () {
            pages[
                pages.withoutData.indexOf(pages.currPage) === -1 ? pages.currPage : '_empty'
            ]();
        },
        _empty: function () {
            //
        },
        menu: function () {
            var headers = { 'X-Auth-Token': _token.token };

            // Get the list of menu items.
            client('GET', '/api/menu', undefined, headers, undefined, function (status, response) {
                // Check that user is properly authenticated and
                // has permissions to carry out action.
                if ([401, 403].indexOf(status) !== -1) {
                    return logUserOut();
                }

                // Destructor-ish the menu data from the response;
                var menu = response.data,
                // Get the table on the page to display the menu items.
                    table = document.querySelector('table tbody');

                // For each menu item, display a table row.
                menu.forEach(function (item) {
                    // Create the necessary elements for the table.
                    var row = document.createElement('tr'),
                        name = document.createElement('td'),
                        price = document.createElement('td'),
                        action = document.createElement('td'),
                        link = document.createElement('a');

                    // Display the name of the item.
                    name.innerHTML = item.name;
                    // Display the price of the item.
                    price.innerHTML = '$' + item.price;
                    // Construct an onclick listener event for adding item to cart.
                    link.onclick = function () {
                        event.preventDefault();
                        var menu_id = this.getAttribute('data-id'),
                            payload = {
                                menu_id: menu_id,
                                qty: 1
                            };

                        client('POST', '/api/carts', payload, headers, undefined, function (status, payload) {
                            if ([401, 403].indexOf(status) > -1) {
                                return logUserOut();
                            }

                            if ([404, 422].indexOf(status) > -1) {
                                return alert(payload.message);
                            }

                            alert('1 ' + item.name + ' added to cart.');
                        });
                    };
                    link.href = 'javascript:void(0)';
                    // Include menu id in link for adding to cart.
                    link.setAttribute('data-id', item.menu_id);
                    // Add text for context.
                    link.innerHTML = 'Add to Cart';

                    // Display link to add to cart.
                    action.appendChild(link);

                    // Append all elements to table body.
                    row.appendChild(name);
                    row.appendChild(price);
                    row.appendChild(action);
                    table.appendChild(row);
                });
            });
        },
        cart: function () {
            var headers = { 'X-Auth-Token': _token.token };

            // Get the list of menu items.
            client('GET', '/api/carts', undefined, headers, undefined, function (status, response) {
                // Check that user is properly authenticated and
                // has permissions to carry out action.
                if ([401, 403].indexOf(status) !== -1) return logUserOut();

                // Check that cart is not empty,
                // otherwise, return user to index page.
                if (response.data.length < 1) {
                    alert('Your cart seems to be empty.');

                    return location = '/menu';
                }

                // Parse and fill cart display in cart table accordingly.
                var tableBody = document.querySelector('table tbody'),
                    totalElementRow = document.createElement('tr'),
                    totalNameElementData = document.createElement('td'),
                    totalValueElementData = document.createElement('td'),
                    cart = response.data,
                    total = cart.reduce(function (total, object) {
                        var row = document.createElement('tr'),
                            name = document.createElement('td'),
                            price = document.createElement('td');

                        name.innerHTML = object.name;
                        price.innerHTML = '$' + object.price;

                        row.appendChild(name);
                        row.appendChild(price);
                        tableBody.appendChild(row);

                        return total += object.price;
                    }, 0);

                    totalNameElementData.innerText = 'Total';
                    totalNameElementData.style.fontWeight = 'bold';
                    totalElementRow.append(totalNameElementData);
                    totalValueElementData.innerText = '$' + total;
                    totalValueElementData.style.fontWeight = 'bold';
                    totalElementRow.append(totalValueElementData);
                    tableBody.append(totalElementRow);
            });
        },
        checkout: function () {
            // Get queries to get order id.
            var queries = location.search.substring(1).split('&');

            // Parse queries and decode to readable object.
            queries = queries.reduce((t, v) => {
                v = v.split('=');

                var obj = { [decodeURIComponent(v[0])]: decodeURIComponent(v[1]) };

                t.push(obj);

                return t;
            }, []);

            // Fix order id in field.
            document.querySelector('[name="order_id"]').value = queries[0].order_id;
        }
    };

    // Initializer.
    App.init = function () {
        // Hide all hideables
        peekaboo();

        // Bind form where necessary.
        bindForm();

        // Bind logout button.
        bindLogoutButton();

        // Bind checkout button
        bindCheckoutButton();

        // Check authentication state on every load.
        checkAuthState();

        // Refresh token.
        refreshToken();

        // Refresh token loop.
        refreshTokenLoop();

        // Load data based on the current page.
        pages._init();
    };

    return App;
})(App || {});

App.init();
