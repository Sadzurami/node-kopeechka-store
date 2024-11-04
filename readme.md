# kopeechka-store

> Simple wrapper around [kopeechka.store](https://faq.kopeechka.store/) api

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

### nstance

#### `.orderEmail(website: string, options: OrderEmailOptions): Promise<string>`

Orders an email address for the specified website.

- `website` (string): The website to order the email address for.
- `options.domains` (string | string[] | KopeechkaDomainGroup | KopeechkaDomainGroup[], optional): Email domain(s) you want to receive.
- `options.regexp` (string, optional): Regular expression for extracting values from the message.
- `options.sender` (string, optional): Email address of the sender.
- `options.subject` (string, optional): Subject of the email.
- `options.password` (boolean, optional): Switch to get the password of the email address.
- `options.invenstor` (boolean, optional): Switch to use an email from your own pool.

#### `.reorderEmail(website: string, email: string, options: ReorderEmailOptions): Promise<string>`

Reorders an email address for the specified website.\
Use this method to retrieve new messages for the requested email address.

- `website` (string): The website to order the email address for.
- `email` (string): The email address to reorder.
- `options.regexp` (string, optional): Regular expression for extracting values from the message.
- `options.subject` (string, optional): Subject of the email.
- `options.password` (boolean, optional): Switch to get the password of the email address.

#### `.cancelEmail(email: string): Promise<void>`

Cancels or releases the specified email address.

- `email` (string): The email address to cancel.

#### `.getEmailId(email: string): string`

Retrieves the ID associated with the email address.

- `email` (string): The email address to retrieve the ID for.

#### `.getEmailPassword(email: string): string`

Retrieves the password associated with the specified email address.\
This password allows access to [web interface](https://webmail.kopeechka.store/) for the specified email address.

- `email` (string): The email address to retrieve the password for.

#### `.getBalance(): Promise<number>`

Retrieves the balance of the account.

#### `.getDomains(website: string, options: GetDomainsOptions): Promise<string[]>`

Retrieves the domains list for the specified website.

- `website` (string): The website to get domains for.
- `options.trusted` (boolean, optional): Switch to get trusted domains. Default is `true`.
- `options.temporary` (boolean, optional): Switch to get temporary domains. Default is `true`.

#### `.getMessage(email: string, options: GetMessageOptions): Promise<string | null>`

Retrieves the message of the specified email address.\
By default, this method returns only a short value of the message if possible.\
You can set the `option.full` to `true` to always get the full message instead.

- `email` (string): The email address to get the message for.
- `options.full` (boolean, optional): Switch to get the full message.

### enums

#### `KopeechkaDomainGroup`

Represents a group of domains which can be used to order an email address.

## Examples

### Order Email

```js
import { Kopeechka, KopeechkaDomainGroup } from '@sadzurami/kopeechka-store';

const gmailEmail = await kopeechka.orderEmail('example.com', {
  domains: 'gmail.com',
  password: true,
});

console.log(`Ordered Gmail Email: ${gmailEmail}`);

const randomTrustedEmail = await kopeechka.orderEmail('example.com', {
  domains: KopeechkaDomainGroup.Trusted,
  password: true,
});

console.log(`Ordered Random Trusted Email: ${randomTrustedEmail}`);

const hotmailOrOutlookEmail = await kopeechka.orderEmail('example.com', {
  domains: ['hotmail.com', 'outlook.com'],
  password: true,
});

console.log(`Ordered Hotmail or Outlook Email: ${hotmailOrOutlookEmail}`);

const kopeechkaDomains = await kopeechka.getDomains('example.com');

console.log(`Kopeechka Domains: ${kopeechkaDomains.join(', ')}`);
```
