"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const got_1 = __importDefault(require("got"));
const https_1 = require("https");
const p_queue_1 = __importDefault(require("p-queue"));
const ttlcache_1 = __importDefault(require("@isaacs/ttlcache"));
const kopeechka_error_code_enum_1 = require("./enums/kopeechka.error.code.enum");
const requestsQueue = new p_queue_1.default({ interval: 100, intervalCap: 1 });
class Kopeechka {
    baseApiUrl = 'https://api.kopeechka.store';
    clientToken;
    clientPartnerId = '7';
    cache = new ttlcache_1.default({ ttl: 15 * 60 * 1000 });
    httpAgent;
    httpClient;
    constructor(options) {
        this.baseApiUrl = options.baseUrl || this.baseApiUrl;
        this.clientToken = options.key;
        this.clientPartnerId = options.partner || this.clientPartnerId;
        this.httpAgent = options.httpsAgent || this.createHttpAgent();
        this.httpClient = this.createHttpClient();
    }
    async orderEmail(website, options = {}) {
        try {
            const domains = Array.isArray(options.domains) ? options.domains.join(',') : options.domains;
            const { status, value, id, mail, password } = await this.httpClient
                .get('mailbox-get-email', {
                searchParams: {
                    site: website,
                    regex: options.regexp,
                    sender: options.sender,
                    subject: options.subject,
                    password: options.password ? 1 : undefined,
                    invenstor: options.invenstor ? 1 : undefined,
                    mail_type: domains,
                    soft: this.clientPartnerId,
                },
            })
                .json();
            if (status !== 'OK')
                throw new Error((value && kopeechka_error_code_enum_1.KopeechkaErrorCode[value]) || value || 'Bad server response');
            this.cache.set(mail, id);
            if (password)
                this.cache.set(`${mail}:password`, password);
            return mail;
        }
        catch (error) {
            throw new Error('Failed to order email address', { cause: error });
        }
    }
    async reorderEmail(website, email, options = {}) {
        try {
            const { status, value, id, mail, password } = await this.httpClient
                .get('mailbox-reorder', {
                searchParams: {
                    site: website,
                    email: email,
                    regex: options.regexp,
                    subject: options.subject,
                    password: options.password ? 1 : undefined,
                },
            })
                .json();
            if (status !== 'OK')
                throw new Error((value && kopeechka_error_code_enum_1.KopeechkaErrorCode[value]) || value || 'Bad server response');
            this.cache.set(mail, id);
            if (password)
                this.cache.set(`${mail}:password`, password);
        }
        catch (error) {
            throw new Error('Failed to reorder email address', { cause: error });
        }
    }
    async cancelEmail(email) {
        try {
            const id = this.getEmailId(email);
            const { status, value } = await this.httpClient
                .get('mailbox-cancel', { searchParams: { id } })
                .json();
            if (status !== 'OK')
                throw new Error((value && kopeechka_error_code_enum_1.KopeechkaErrorCode[value]) || value || 'Bad server response');
            this.cache.delete(id);
            this.cache.delete(`${email}:password`);
        }
        catch (error) {
            throw new Error('Failed to cancel email address', { cause: error });
        }
    }
    getEmailId(email) {
        if (!this.cache.has(email))
            throw new Error('Email id not found');
        return this.cache.get(email);
    }
    getEmailPassword(email) {
        if (!this.cache.has(`${email}:password`))
            throw new Error('Email password not found');
        return this.cache.get(`${email}:password`);
    }
    async getBalance() {
        try {
            const { status, value, balance } = await this.httpClient
                .get('user-balance')
                .json();
            if (status !== 'OK')
                throw new Error((value && kopeechka_error_code_enum_1.KopeechkaErrorCode[value]) || value || 'Bad server response');
            return balance;
        }
        catch (error) {
            throw new Error('Failed to get balance', { cause: error });
        }
    }
    async getMessage(email, options = {}) {
        try {
            const id = this.getEmailId(email);
            const { status, value, fullmessage } = await this.httpClient
                .get('mailbox-get-message', { searchParams: { id, full: options.full ? 1 : undefined } })
                .json();
            if (status !== 'OK') {
                if (value === 'WAIT_LINK')
                    return null;
                throw new Error((value && kopeechka_error_code_enum_1.KopeechkaErrorCode[value]) || value || 'Bad server response');
            }
            return options.full || !value ? fullmessage : value;
        }
        catch (error) {
            throw new Error('Failed to get message', { cause: error });
        }
    }
    async getDomains(website, options = { trusted: true, temporary: true }) {
        try {
            const promises = [];
            if (options.trusted)
                promises.push(this.fetchTrustedDomains(website));
            if (options.temporary)
                promises.push(this.fetchTemporaryDomains(website));
            return (await Promise.all(promises)).flat();
        }
        catch (error) {
            throw new Error('Failed to get domains', { cause: error });
        }
    }
    async fetchTrustedDomains(website) {
        try {
            const { status, value, popular } = await this.httpClient
                .get('mailbox-zones', { searchParams: { site: website, popular: 1 } })
                .json();
            if (status !== 'OK')
                throw new Error((value && kopeechka_error_code_enum_1.KopeechkaErrorCode[value]) || value || 'Bad server response');
            return popular.map((entry) => entry.name);
        }
        catch (error) {
            throw new Error('Failed to fetch trusted domains', { cause: error });
        }
    }
    async fetchTemporaryDomains(website) {
        try {
            const { status, value, domains } = await this.httpClient
                .get('mailbox-get-domains', { searchParams: { site: website } })
                .json();
            if (status !== 'OK')
                throw new Error((value && kopeechka_error_code_enum_1.KopeechkaErrorCode[value]) || value || 'Bad server response');
            return domains;
        }
        catch (error) {
            throw new Error('Failed to fetch temporary domains', { cause: error });
        }
    }
    createHttpAgent() {
        const agent = new https_1.Agent({ keepAlive: true, timeout: 65000, maxSockets: 50 });
        return agent;
    }
    createHttpClient() {
        const client = got_1.default.extend({
            prefixUrl: 'https://api.kopeechka.store',
            headers: {
                accept: 'application/json',
                'user-agent': 'node-kopeechka-store/1.0',
            },
            searchParams: { token: this.clientToken, type: 'JSON', api: '2.0' },
            agent: { https: this.httpAgent },
            hooks: { beforeRequest: [() => requestsQueue.add(() => { })] },
            timeout: 10000,
            responseType: 'json',
            throwHttpErrors: true,
        });
        return client;
    }
}
exports.default = Kopeechka;
