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
- `options.currency` (string, optional): Currency to use for the prices.
- `options.baseUrl` (string, optional): Base url of the api.
- `options.timeout` (number, optional): Api requests timeout in milliseconds.
- `options.httpAgent`(https.Agent | http.Agent, optional): Http agent to use for requests.

### instance

#### `.orderEmail(website: string, options?: OrderEmailOptions): Promise<string>`

Orders an email address for the specified website.

- `website` (string): The website to order the email address for.
- `options.domains` (string | string[], optional): Email domain(s) you want to receive.
- `options.regexp` (string, optional): Regular expression for extracting values from the message.
- `options.sender` (string, optional): Email address of the sender.
- `options.subject` (string, optional): Subject of the email.
- `options.password` (boolean, optional): Switch to get the password of the email address.
- `options.invenstor` (boolean, optional): Switch to use an email from your own pool.

#### `.reorderEmail(website: string, email: string, options?: ReorderEmailOptions): Promise<void>`

Reorders an email address for the specified website.\
Use this method to retrieve additional messages for the requested email address.

- `website` (string): The website to order the email address for.
- `email` (string): The email address to reorder.
- `options.regexp` (string, optional): Regular expression for extracting values from the message.
- `options.subject` (string, optional): Subject of the email.
- `options.password` (boolean, optional): Switch to get the password of the email address.

#### `.cancelEmail(email: string): Promise<void>`

Cancels or releases the specified email address.

- `email` (string): The email address to cancel.

#### `.getEmailId(email: string): string`

Retrieves the id associated with the email address.

- `email` (string): The email address to retrieve the id for.

#### `.getEmailPassword(email: string): string`

Retrieves the password associated with the specified email address.\
This password allows access to [web interface](https://webmail.kopeechka.store/) for the specified email address.

- `email` (string): The email address to retrieve the password for.

#### `.refreshEmailId(website: string, email: string): Promise<void>`

Refreshes the id associated with the email address.

- `website` (string): The website to refresh email address for.
- `email` (string): The email address to refresh the id for.

#### `.getBalance(): Promise<number>`

Retrieves the balance of the account.

#### `.getDomains(website?: string, options?: GetDomainsOptions): Promise<string[]>`

Retrieves the domains list for the specified website.

- `website` (string, optional): The website to get domains for.
- `options.trusted` (boolean, optional): Switch to get trusted domains. Default is `true`.
- `options.kopeechka` (boolean, optional): Switch to get Kopeechka domains. Default is `true`.
- `options.count.min` (number, optional): Minimum count of the domain.
- `options.count.max` (number, optional): Maximum count of the domain.
- `options.price.min` (number, optional): Minimum price of the domain.
- `options.price.max` (number, optional): Maximum price of the domain.

#### `.getMessage(email: string, options?: GetMessageOptions): Promise<string | null>`

Retrieves the message of the specified email address.\
By default, this method returns only a short value of the message if possible.\
You can set the `option.full` to `true` to always get the full message instead.

- `email` (string): The email address to get the message for.
- `options.full` (boolean, optional): Switch to get the full message.

#### `.waitMessage(email: string, options?: WaitMessageOptions): Promise<string>`

Like `.getMessage()` but waits for the message and throws if it's not found.

- `email` (string): The email address to wait for the message for.
- `options.full` (boolean, optional): Switch to get the full message.
- `options.timeout` (number, optional): Timeout in milliseconds to wait for the message.

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
