# kopeechka-store

> Simple wrapper around [kopeechka.store](https://kopeechka.store/) api

## Install

```sh
npm install @sadzurami/kopeechka-store
```

## Usage

```js
import { Kopeechka } from '@sadzurami/kopeechka-store';

const key = 'your-api-key';
const kopeechka = new Kopeechka({ key });

(async () => {
  const email = await kopeechka.orderEmail('example.com');
  console.log(`Ordered Email: ${email}`);

  const message = await kopeechka.getMessage(email);
  console.log(`Message: ${message}`);

  await kopeechka.cancelEmail(email);
})();
```

## API

### constructor(options: ConstructorOptions)

Returns a new instance of `Kopeechka`.

- `options.key` (string): Api access key.
- `options.partner` (string | number, optional): Affiliate program id.
- `options.currency` (string, optional): Currency for balance and prices.
- `options.baseUrl` (string, optional): Base url for api requests.
- `options.timeout` (number, optional): Api requests timeout in milliseconds.
- `options.httpAgent`(https.Agent | http.Agent, optional): Http agent instance for requests.

### instance

#### `.orderEmail(website: string, options?: OrderEmailOptions): Promise<string>`

Orders an email for the specified website.

- `website` (string): The website to order the email for.
- `options.domains` (string | string[], optional): Email domain(s) to receive.
- `options.regexp` (string, optional): Regular expression to extract values from the message.
- `options.sender` (string, optional): Email of the sender.
- `options.subject` (string, optional): Subject of the email.
- `options.password` (boolean, optional): Switch to get the email's password for [web access](https://webmail.kopeechka.store/).
- `options.invenstor` (boolean, optional): Switch to use an email from your pool.

#### `.reorderEmail(website: string, email: string, options?: ReorderEmailOptions): Promise<void>`

Reorders an email for the specified website.\
Use to retrieve additional messages for the requested email.

- `website` (string): The website to order the email for.
- `email` (string): The email to reorder.
- `options.regexp` (string, optional): Switch to get the email's password for [web access](https://webmail.kopeechka.store/).
- `options.subject` (string, optional): Subject of the email.
- `options.password` (boolean, optional): Switch to get the password of the email address.

#### `.cancelEmail(email: string): Promise<void>`

Cancels or releases the specified email.

- `email` (string): Email to cancel.

#### `.getEmailId(email: string): string`

Retrieves the id associated with the email.

- `email` (string): The email to retrieve the id for.

#### `.refreshEmailId(website: string, email: string): Promise<void>`

Refreshes the id associated with the specified email.

- `website` (string): The website to refresh the email id for.
- `email` (string): The email to refresh the id for.

#### `.getEmailPassword(email: string): string`

Retrieves the password associated with the specified email.
This password allows access to [web interface](https://webmail.kopeechka.store/) for the specified email.

- `email` (string): The email to retrieve the password for.

#### `.getBalance(): Promise<number>`

Retrieves the account balance.

#### `.getMessage(email: string, options?: GetMessageOptions): Promise<string | null>`

Retrieves the message of the specified email.\
By default, returns a short value of the message if possible.\
Set `option.full` to `true` to always get the full message.

- `email` (string): The email to get the message for.
- `options.full` (boolean, optional): Switch to get the full message.

#### `.waitMessage(email: string, options?: WaitMessageOptions): Promise<string>`

Like `.getMessage()` but waits for the message and throws if not found.

- `email` (string): The email to get the message for.
- `options.full` (boolean, optional): Switch to get the full message.
- `options.timeout` (number, optional): Timeout in milliseconds.

#### `.getDomains(website?: string, options?: GetDomainsOptions): Promise<string[]>`

Retrieves the domains list.

- `website` (string, optional): The website to get domains for.
- `options.kopeechka` (boolean, optional): Switch to get Kopeechka domains.
- `options.trusted` (boolean, optional): Switch to get trusted domains.
- `options.count.min` (number, optional): Minimum count of the domain.
- `options.count.max` (number, optional): Maximum count of the domain.
- `options.price.min` (number, optional): Minimum price of the domain.
- `options.price.max` (number, optional): Maximum price of the domain.

### errors

#### `KopeechkaError`

Error class for errors thrown by the api.

- `code` (string): Error code returned by the api.

### enums

#### `DomainGroup`

Shortcuts for domain groups.

#### `ErrorCode`

Error codes returned by the api.

#### `ErrorMessage`

Mapped error messages for the error codes.

#### `StatusCode`

Status codes returned by the api.

## Related

- [kopeechka-s](https://github.com/Sadzurami/kopeechka-s) - Browser Automation Studio wrapper around the kopeechka.store api
