let settings = {};

window.addEventListener('DOMContentLoaded', async () => {

    /*
     * Execute a function with its arguments in the current tab (instead of in the popup)
     */
    async function executeFunctionInCurrentTab(func, args){
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: func,
            args: args
        });
        return response[0].result;
    }

    /*
     * Add rpcCall method to the current tab so that it can be called by other methods
     * interacting with the current tab (fetching records, setting value, ...)
     */
    function addRpcCallMethod(){
        async function rpcCall(model, method, args, kwargs){
            const originUrl = window.location.origin;
            return await fetch(
                new Request(originUrl + `/web/dataset/call_kw/${model}/${method}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: 1,
                        method: 'call',
                        jsonrpc: '2.0',
                        params: {
                            model: model,
                            method: method,
                            args: args || [],
                            kwargs: kwargs || {},
                        }
                    }),
                })
            );
        }
        window.rpcCall = rpcCall;
    }


    /*
     * Load mapping and records in the popup
     */
    async function renderRecords(mapping, containerId, fetchFunc, setFunc, deleteFunc, filterFunc, valueFieldName){
        // Get container
        const container = document.getElementById(containerId);

        // Fetch IAP accounts from the current tab
        const responseJson = await executeFunctionInCurrentTab(fetchFunc, [mapping]);
        if (responseJson.error !== undefined) {
            if (responseJson.error?.data?.message)  // Error message from Odoo (not logged in, access rights, ...)
                container.textContent = responseJson.error.data.message;
            else
                container.textContent = "This page does not use Odoo";
            return;
        }
        const records = responseJson.result;

        // Insert records in the popup
        container.innerHTML = '';
        for (const [key, choices] of Object.entries(mapping)) {
            if (!choices.show){
                continue;
            }

            let record = filterFunc(records, key);
            if (record.length >= 1){
                record = record[0];
            }

            const recordContainer = document.createElement('div');
            recordContainer.className = 'record-container';
            container.appendChild(recordContainer);

            const label = document.createElement('div');
            label.className = 'record-key';
            label.textContent = key;
            recordContainer.appendChild(label);

            const currentValueElem = document.createElement('p');
            currentValueElem.textContent = "Current value: " + (record.id ? record[valueFieldName] : 'Does not exist');
            recordContainer.appendChild(currentValueElem);

            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'button-group';
            recordContainer.appendChild(buttonGroup);

            for (const choice of Object.keys(choices).filter(value => value !== 'show')){
                const button = document.createElement('button');
                button.textContent = choice;

                // Select by default the current value
                if (record[valueFieldName] === mapping[key][choice]) {
                    button.classList.add('selected');
                }

                // Handle click
                button.addEventListener('click', async () => {
                    await executeFunctionInCurrentTab(setFunc, [record, mapping[key][choice], key]);
                    window.location.reload();
                });

                buttonGroup.appendChild(button);
            }

            // Delete button
            if (deleteFunc) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = "Delete";
                deleteButton.className = 'delete-button';
                if (!record.id) {
                    deleteButton.classList.add('display-none');
                }
                deleteButton.addEventListener('click', async () => {
                    await executeFunctionInCurrentTab(deleteFunc, [record]);
                    window.location.reload();
                });
                buttonGroup.appendChild(deleteButton);
            }
        }
    }


    /*
     * Load Config Params in the popup
     */
    async function renderConfigParams(){

        async function fetchConfigParams(mapping) {
            const response = await window.rpcCall("ir.config_parameter", "search_read", [], {
                domain: [['key', 'in', Object.keys(mapping)]],
                fields: ['key', 'value'],
            });
            if (!response.ok) {
                return {
                    error: response.statusText,
                };
            }
            return await response.json();
        }

        async function setConfigParam(record, value, key) {
            const method = record.id ? "write" : "create";
            const args = record.id ? [[record.id], {'value': value}] : [{'key': key, 'value': value}];
            return await window.rpcCall("ir.config_parameter", method, args, {});
        }

        async function deleteConfigParam(record) {
            return await window.rpcCall("ir.config_parameter", "unlink", [[record.id]], {});
        }

        function filterFunc(records, fieldValue) {
            return records.filter((record) => record.key === fieldValue);
        }

        if (!settings.configParamsShow) {
            document.getElementById("config-parameters-section").classList.add("display-none");
            document.getElementById("records-section").style.width = "400px";
            document.getElementById("iap-accounts-section").style.width = "100%";
        }

        renderRecords(
            settings.configParamsMapping, 'container-config-params',
            fetchConfigParams, setConfigParam, deleteConfigParam,
            filterFunc, "value",
        );
    }


    /*
     * Load IAP Accounts in the popup
     */
    async function renderIapAccounts(){

        async function fetchIapAccounts(mapping) {
            const response = await window.rpcCall("iap.account", "search_read", [], {
                domain: [['service_name', 'in', Object.keys(mapping)]],
                fields: ['account_token', 'service_name'],
            });
            if (!response.ok) {
                return {
                    error: response.statusText,
                };
            }
            return await response.json();
        }

        async function setIAPAccountToken(record, accountToken, serviceName) {
            if (record.id) {
                return await window.rpcCall("iap.account", "write", [[record.id], {'account_token': accountToken}], {});
            } else {
                const above18 = window.location.pathname.startsWith('/odoo');
                if (above18){
                    const response = await window.rpcCall("iap.service", "search_read", [], {
                        domain: [['technical_name', '=', serviceName]],
                        fields: ['id'],
                    });
                    const responseJson = (await response.json()).result;
                    if (responseJson.error?.data?.message || responseJson.length === 0){
                        console.error(`No service found with the name ${serviceName}`);
                        return;
                    }
                    const serviceId = responseJson[0].id;
                    return await window.rpcCall("iap.account", "create", [{'service_name': serviceName, 'service_id': serviceId, 'account_token': accountToken}], {});
                } else {
                    return await window.rpcCall("iap.account", "create", [{'service_name': serviceName, 'account_token': accountToken}], {});
                }
            }
        }

        function filterFunc(records, fieldValue) {
            return records.filter((record) => record.service_name === fieldValue);
        }

        if (!settings.iapAccountsShow) {
            document.getElementById("iap-accounts-section").classList.add("display-none");
            document.getElementById("records-section").style.width = "400px";
            document.getElementById("config-parameters-section").style.width = "100%";
        }

        renderRecords(
            settings.iapAccountsMapping, 'container-iap-accounts',
            fetchIapAccounts, setIAPAccountToken, null,
            filterFunc, "account_token",
        );
    }

    async function setup(){
        await executeFunctionInCurrentTab(addRpcCallMethod, []);

        chrome.storage.sync.get('settings', (result) => {
            if (result.settings) {
                settings = result.settings;
            } else {
                settings = DEFAULT_SETTINGS;
            }
            renderConfigParams();
            renderIapAccounts();
        });

        document.querySelector('#settings-button').addEventListener('click', function() {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('settings.html'));
            }
        });
    }

    await setup();
});
