const DEFAULT_SETTINGS = {
    "configParamsShow": true,
    "configParamsMapping": {
        'iap.endpoint': {
            'show': true,
            'prod': 'https://iap.odoo.com',
            'test': 'https://iap-test.odoo.com',
            'local': 'http://localhost:8469',
        },
        'iap.partner_autocomplete.endpoint': {
            'show': true,
            'prod': 'https://iap-services.odoo.com',
            'test': 'https://iap-services-test.odoo.com',
            'local': 'http://localhost:8469',
        },
    },
    "iapAccountsShow": true,
    "iapAccountsMapping": {
        'Partner Autocomplete': {
            'show': true,
            'short': 'my_partner_autocomplete_account_token',
            '(None)': '',
        },
        'SMS': {
            'show': true,
            'short': 'my_sms_account_token',
            '(None)': '',
        },
        'Document Digitization': {
            'show': true,
            'short': 'my_invoice_ocr_account_token',
            '(None)': '',
        },
    },
};
