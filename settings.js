window.addEventListener('DOMContentLoaded', () => {
    let settings = {};

    function addOption(mapping, key, optionShortName, optionValue){
        if (optionShortName === "") {
            return;
        }
        mapping[key] = {
            ...mapping[key],
            [optionShortName]: optionValue,
        }
        renderSettings();
    }

    function deleteOption(mapping, key, optionShortName){
        delete mapping[key][optionShortName];
        renderSettings();
    }

    function renderMapping(mappingContainer, mapping){
        mappingContainer.innerHTML = "";

        for (let [key, options] of Object.entries(mapping)) {
            options = Object.entries(options).sort()
            options.push(["", ""]);  // Adds a new empty line that can be filled in to add a new option

            const keyContainer = document.createElement('div');
            keyContainer.className = 'key-container';
            mappingContainer.appendChild(keyContainer);

            const keyLabel = document.createElement('div');
            keyLabel.className = 'mapping-key';
            keyLabel.textContent = key;
            keyContainer.appendChild(keyLabel);

            const showLabel = document.createElement('label');
            showLabel.textContent = "Show";
            keyContainer.appendChild(showLabel);

            const showKeyCheckbox = document.createElement('input');
            showKeyCheckbox.type = "checkbox";
            showKeyCheckbox.checked = mapping[key]["show"];
            showKeyCheckbox.addEventListener('change', (e) => mapping[key]["show"] = e.target.checked);
            showLabel.appendChild(showKeyCheckbox);

            const deleteKeyButton = document.createElement('button');
            deleteKeyButton.textContent = "Delete mapping";
            deleteKeyButton.addEventListener('click', () => {
                delete mapping[key];
                renderSettings();
            });
            keyContainer.appendChild(deleteKeyButton);

            for (const [optionShortName, optionValue] of options) {
                if (optionShortName === "show"){
                    continue;
                }

                const optionContainer = document.createElement('div');
                optionContainer.className = 'option-container';
                keyContainer.appendChild(optionContainer);

                const optionShortNameInput = document.createElement('input');
                optionShortNameInput.type = 'text';
                optionShortNameInput.value = optionShortName;
                optionShortNameInput.placeholder = "Short name";
                optionContainer.appendChild(optionShortNameInput);

                const optionValueInput = document.createElement('input');
                optionValueInput.type = 'text';
                optionValueInput.value = optionValue;
                optionValueInput.placeholder = "Value";
                optionContainer.appendChild(optionValueInput);

                if (optionShortName === ""){
                    const addButton = document.createElement('button');
                    addButton.textContent = "Add option";
                    addButton.addEventListener('click', () => addOption(mapping, key, optionShortNameInput.value, optionValueInput.value));
                    optionContainer.appendChild(addButton);
                } else {
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = "Delete option";
                    deleteButton.addEventListener('click', () => deleteOption(mapping, key, optionShortNameInput.value));
                    optionContainer.appendChild(deleteButton);
                }
            }
        }
    }

    function renderSettings() {
        // Config Params
        const configParamsShowCheckbox = document.getElementById('config-parameters-show-checkbox')
        configParamsShowCheckbox.checked = settings.configParamsShow;
        configParamsShowCheckbox.addEventListener('change', () => {
            settings["configParamsShow"] = configParamsShowCheckbox.checked;
        });
        document.getElementById('config-parameters-new-button').addEventListener('click', () => {
            settings['configParamsMapping'][document.getElementById('config-parameters-new-input').value] = {
                "show": true,
            };
            renderSettings();
        });
        renderMapping(document.getElementById('config-parameters-mapping-container'), settings.configParamsMapping);

        // IAP Accounts
        const iapAccountsShowCheckbox = document.getElementById('iap-accounts-show-checkbox')
        iapAccountsShowCheckbox.checked = settings.configParamsShow;
        iapAccountsShowCheckbox.addEventListener('change', () => {
            settings["iapAccountsShow"] = iapAccountsShowCheckbox.checked;
        });
        document.getElementById('iap-accounts-new-button').addEventListener('click', () => {
            settings['iapAccountsMapping'][document.getElementById('iap-accounts-new-input').value] = {
                "show": true,
            };
            renderSettings();
        });
        renderMapping(document.getElementById('iap-accounts-mapping-container'), settings.iapAccountsMapping);
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

    function setup(){
        chrome.storage.sync.get('settings', (result) => {
            if (result.settings) {
                settings = result.settings;
            } else {
                settings = DEFAULT_SETTINGS;
            }
            renderSettings();
        });

        document.getElementById('reset-button').addEventListener('click', () => {
            resetSettings();
        });

        document.getElementById('save-button').addEventListener('click', () => {
            saveSettings();
        });
    }

    setup();
});
