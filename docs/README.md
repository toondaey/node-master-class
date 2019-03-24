## NodeJS Master Class Assignment 2 - An API for a PIZZA delivery service.

### IMPORTANT
This is a simple API server for a pizza delivery service. To start the server, please copy/rename the `./config/config.js.example` to: `./config/config.js` to run the server with setting the `NODE_ENV` or `./config/[desired_env_name].js` and run by setting the `NODE_ENV` to `desired_env_name` to load config based on environment. After that is done, please fill the stripe and mailgun with appropriate keys generated from the respective service providers otherwise neither services will work.

With the above, to run the server:

- without `desired_env_name`, just run `node index.js`.

- with `desired_env_name`, run `NODE_ENV=[desired_env_name] node index.js`.

Included with this is a log compression feature that compresses the error logs every 24 hrs at **00:00** hours.

It handles the following:

- New users can register onto the platform.

- Existing users can:

  * log in and out of the system;

  * update their profile;

  * view menu items;

  * fill a shopping cart with items; and

  * create an order.


#### Routes

The available **routes** are as follows:

**P.S.**: Bold parameters are required.

1.  **_/users_**

- **[GET]** - Authenticated users can delete their profile and some associated contents. Requires:

  *Headers*:

  * **X-Auth-Token**: Token generated from authentication.

  *Query*: None

  *Parameters*: None

  *Response*:

  * [200] Success: A feedback about the operation.

  * [401] Unauthorized user.

  * [500] Internal server error.

- **[POST]** - Onboard (register) a new user. Requires:

  *Headers*: None.

  *Parameters*:

  * **firstName**: A `String` with more than **4** characters.

  * **lastName**: A `String` with more than **4** characters.

  * **email**: Typically a non-empty `String`. No email format validation present.

  * **address**: A non-empty `String`.

  * **password**: A `String` with more than **5** characters.

  *Response*:

  * [200] Success: An dictionary of user's data.

  * [400] Bad Request: User already exists.

  * [422] Unprocessable Entity: i.e. invalid data provided.

  * [500] Internal server error.


- **[PUT]** - Authenticated users can edit their profile. Requires:

  *Headers*:

  * **X-Auth-Token**: Token generated from authentication.

  *Query*:

  * **email**: User's email.

  *Parameters* <sub>At least one parameter is required</sub>:

  * **firstName**: A `String` with more than **4** characters.

  * **lastName**: A `String` with more than **4** characters.

  * **address**: A non-empty `String`.

  * **password**: A `String` with more than **5** characters.

  *Response*:

  * [200] Success: An dictionary of user's data.

  * [400] Bad Request: User does not exist.

  * [401] Unauthorized user.

  * [403] Forbidden user: i.e. email provided is different from email in token data.

  * [422] Unprocessable Entity: i.e. invalid data provided.

  * [500] Internal server error.

- **[DELETE]** - Authenticated users can delete their profile and some associated contents. Requires:

  *Headers*:

  * **X-Auth-Token**: Token generated from authentication.

  *Query*:

  * **email**: User's email.

  *Response*:

  * [200] Success: A feedback about the operation.

  * [401] Unauthorized user.

  * [403] Forbidden user: i.e. email provided is different from email in token data.

  * [500] Internal server error.

2. **_/tokens_**

- **[POST]** - Authenticate/Log in a user. Requires:

  *Headers*: None.

  *Parameters*:

  * **email**: Typically a non-empty `String`. No email format validation present.

  * **password**: A `String` with more than **5** characters.

  *Response*:

  * [200] Success: An dictionary of user's data.

  * [400] Bad Request: User already exists.

  * [422] Unprocessable Entity: i.e. invalid data provided.

  * [500] Internal server error.

- **[PUT]** - Extend token validity period. Requires:

  *Headers*:

  * **X-Auth-Token**: Token generated from authentication.

  *Query*: None.

  *Parameters*:

  * **extend**: A `Boolean` value which should be true.

  *Response*:

  * [201] Success: Updated token and feedback message.

  * [401] Unauthorized user.

  * [422] Unprocessable Entity: i.e. invalid data provided.

  * [500] Internal server error.

- **[DELETE]** - Authenticated users can log out of their account. Requires:

  *Headers*:

  * **X-Auth-Token**: Token generated from authentication.

  *Query*: None.

  *Parameters*: None.

  *Response*:

  * [200] Success: A feedback about the operation.

  * [401] Unauthorized user.

  * [422] Unprocessable Entity: i.e. invalid data provided.

  * [500] Internal server error.

3. **_/menu_**

- **[GET]** - Authenticated users can view available menu.

  *Headers*:

  * **X-Auth-Token**: Token generated from authentication.

  *Query*: None.

  *Parameters*: None.

  *Responses*:

  * [200] A list of available menu options.

  * [401] Unauthorized user.

  * [500] Internal server error.

4. **/carts**

- **[GET]** - Get current cart list for user.

  *Headers*:

  * **X-Auth-Token**: Token generated from authentication.

  *Query*: None.

  *Parameters*: None.

  *Responses*:

  * [200] Success. Cart list.

  * [401] Unauthorized user.

  * [500] Internal server error.

- **[POST]** - Add an item to a user's cart.

  *Headers*:

  * **X-Auth-Token**: Token generated from authentication.

  *Query*: None.

  *Parameters*:

  * **menu_id**: Must exist in the current list of menu.

  * **qty**: Quantity of the items to be added to cart.

  *Responses*:

  * [200] Success. Feedback as well as cart list.

  * [401] Unauthorized user.

  * [404] Not found i.e. Item could not be found in menu a.k.a. invalid menu_id provided.

  * [422] Unprocessable entity. Invalid data provided.

  * [500] Internal server error.

- **[PUT]** - Modify cart item.

  *Headers*:

  * **X-Auth-Token**: Token generated from authentication.

  *Query*:

  * **menu_id**: Must exist in the current list of cart items.

  *Parameters*:

  * **action**: If to increment qty or decrement Acceptable values are **incr**/**decr**.

  *Responses*:

  * [201] Success. Feedback as well as cart list.

  * [400] Bad Request. Could not update cart item. This could be because the item is not yet in cart.

  * [401] Unauthorized user.

  * [422] Unprocessable Entity. Invalid data provided.

  * [500] Internal server error.

- **[DELETE]** - Delete item from cart.

  *Headers*:

  * **X-Auth-Token**: Token generated from authentication.

  *Query*:

  * **menu_id**: Must exist in the current list of cart items.

  *Parameters*: None.

  *Responses*:

  * [201] Success. Feedback as well as cart list.

  * [401] Unauthorized user.

  * [404] Not Found i.e. Item could not be found in cart.

  * [422] Unprocessable Entity. Invalid data provided.

  * [500] Internal server error.

5. **/order**

- **[GET]** - Calculate user's cart and create an order from it.

  *Headers*:

  * **X-Auth-Token**: Token generated from authentication.

  *Query*: None.

  *Parameters*: None.

  *Responses*:

  * [200] Success. Feedback message as well as the new order.

  * [206] Partial Content. Feedback message with the exception that user's cart may not be deleted successfully as well as the new order.

  * [400] Bad Request. Cart is empty.

  * [401] Unauthorized user.

  * [500] Internal server error.

- **[POST]** - Pay for order.

  *Headers*:

  * **X-Auth-Token**: Token generated from authentication.

  *Query*: None.

  *Parameters*:

  * **card**: User's card details with nested parameters:

  > **number**: User's card number.

  > **exp_month**: User's card expiration month.

  > **exp_year**: User's card expiration year.

  > **cvc**: User's card cvc number.

  * **currency**: `String` 3 letter currency being paid.

  * **order_id**: `String` ID or the order being checked out.

  *Responses*:

  * [201] Success. Feedback as well as cart list.

  * [401] Unauthorized user.

  * [422] Unprocessable Entity. Invalid data provided.

  * [500] Internal server error.
