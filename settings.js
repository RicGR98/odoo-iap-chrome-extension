window.addEventListener('DOMContentLoaded', () => {
    const configParamsShowCheckboxEl = document.getElementById('config-parameters-show-checkbox');
    const iapAccountsShowCheckboxEl = document.getElementById('iap-accounts-show-checkbox');

    const configParamsStatusMessageOkEl = document.getElementById('config-parameters-status-message-ok');
    const configParamsStatusMessageNokEl = document.getElementById('config-parameters-status-message-nok');
    const iapAccountsStatusMessageOkEl = document.getElementById('iap-accounts-status-message-ok');
    const iapAccountsStatusMessageNokEl = document.getElementById('iap-accounts-status-message-nok');

    const configParamsMappingEl = document.getElementById('config-parameters-mapping');
    const iapAccountsMappingEl = document.getElementById('iap-accounts-mapping');

    const resetButtonEl = document.getElementById('reset-button');
    const saveButtonEl = document.getElementById('save-button');

    let settings = {};

    function renderSettings() {
        configParamsShowCheckboxEl.checked = settings["configParamsShow"];
        iapAccountsShowCheckboxEl.checked = settings["iapAccountsShow"];

        configParamsMappingEl.value = JSON.stringify(settings["configParamsMapping"], null, 4);
        iapAccountsMappingEl.value = JSON.stringify(settings["iapAccountsMapping"], null, 4);
    }

    function resetSettings() {
        settings = DEFAULT_SETTINGS;
        renderSettings();
    }

    function saveSettings() {
        chrome.storage.sync.set({ settings: settings }, () => {
            console.log('Settings saved to chrome.storage.sync');
        });
    }

    function onInput(settingKey, mappingEl, statusMessageOkEl, statusMessageNokEl) {
        try {
            settings[settingKey] = JSON.parse(mappingEl.value);
            statusMessageOkEl.style.display = "block";
            statusMessageNokEl.style.display = "none";
            saveButtonEl.disabled = false;
        } catch (e) {
            console.error(e);
            statusMessageOkEl.style.display = "none";
            statusMessageNokEl.style.display = "block";
            saveButtonEl.disabled = true;
        }
    }

    function setup(){
        chrome.storage.sync.get('settings', (result) => {
            if (result.settings) {
                settings = result.settings;
            } else {
                settings = DEFAULT_SETTINGS;
            }
            renderSettings();
        });

        resetButtonEl.addEventListener('click', () => {
            resetSettings();
        });
        saveButtonEl.addEventListener('click', () => {
            saveSettings();
        });

        configParamsShowCheckboxEl.addEventListener('change', () => {
            settings["configParamsShow"] = configParamsShowCheckboxEl.checked;
        });
        iapAccountsShowCheckboxEl.addEventListener('change', () => {
            settings["iapAccountsShow"] = iapAccountsShowCheckboxEl.checked;
        });

        configParamsMappingEl.addEventListener('input', () => {
            onInput("configParamsMapping", configParamsMappingEl, configParamsStatusMessageOkEl, configParamsStatusMessageNokEl);
        });
        iapAccountsMappingEl.addEventListener('input', () => {
            onInput("iapAccountsMapping", iapAccountsMappingEl, iapAccountsStatusMessageOkEl, iapAccountsStatusMessageNokEl);
        });

        document.querySelectorAll('textarea').forEach(el => el.addEventListener('keydown', function(e) {
            if (e.key == 'Tab') {
                e.preventDefault();
                var start = this.selectionStart;
                var end = this.selectionEnd;

                this.value = this.value.substring(0, start) + "    " + this.value.substring(end);

                this.selectionStart = this.selectionEnd = start + 4;
            }
        }));
    }

    setup();
});
