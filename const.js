const DEFAULT_SETTINGS = {
    "configParamsShow": true,
    "configParamsMapping": {
        'iap.endpoint': {
            'show': true,
            'prod': 'https://iap.odoo.com',
            'test': 'https://iap-test.odoo.com',
            'local': 'http://localhost:8469',
        },
        'iap_services.endpoint': {
            'show': true,
            'prod': 'https://iap-services.odoo.com',
            'test': 'https://iap-services-test.odoo.com',
            'local': 'http://localhost:8469',
        },
        'sms.endpoint': {
            'show': true,
            'prod': 'https://sms.api.odoo.com',
            'local': 'http://localhost:8469',
        },
        'snailmail.endpoint': {
            'show': true,
            'prod': 'https://iap-snailmail.odoo.com',
            'local': 'http://localhost:8469',
        },
        'iap.partner_autocomplete.endpoint': {
            'show': true,
            'prod': 'https://iap-services.odoo.com',
            'test': 'https://iap-services-test.odoo.com',
            'local': 'http://localhost:8469',
        },
        'database.uuid': {
            'show': true,
            'skip_sub': 'skip_check_subscription',
        },
    },
    "iapAccountsShow": true,
    "iapAccountsMapping": {
        'partner_autocomplete': {
            'show': true,
            'short': 'my_partner_autocomplete_account_token',
            'dummy': 'dummy',
        },
        'sms': {
            'show': true,
            'short': 'my_sms_account_token',
            'dummy': 'dummy',
        },
        'invoice_ocr': {
            'show': true,
            'short': 'my_invoice_ocr_account_token',
            'dummy': 'dummy',
        },
    },
};
