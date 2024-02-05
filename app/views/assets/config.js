window.electron.config.location((loc) => {
    document.getElementById('config_location').textContent = loc;
});


document.getElementById('create_button').addEventListener('click', (e) => {
    e.preventDefault();

    // validate
    let required = [
        'name',
        'client_id',
        'client_secret'
    ];
    let valid = true;

    required.forEach(field => {
        document.getElementById(field).classList.remove('is-invalid');
        if (document.getElementById(field).value == '') {
            document.getElementById(field).classList.add('is-invalid');
            valid = false;
        }
    });

    if (!valid) {
        return;
    }

    window.electron.config.create({
        name: document.getElementById('name').value,
        client_id: document.getElementById('client_id').value,
        client_secret: document.getElementById('client_secret').value
    });
});
window.electron.config.loadedForEdit((extension) => {
    // @todo future barry problem
});
window.electron.config.clients((data) => {
    // dismiss dialog
    let modal = bootstrap.Modal.getOrCreateInstance('#add_new_configuration_modal');
    modal.hide();

    let { clients, active_client_id } = data;

    // draw
    let dropdown = document.getElementById('extension_select');
    dropdown.textContent = '';
    let el = document.getElementById('existing_extensions').getElementsByTagName('tbody')[0];
    el.textContent = '';

    if (!clients || Object.keys(clients).length == 0) {
        let row = el.insertRow();
        var cell = row.insertCell();
        cell.textContent = 'You have no Clients Configured. Click "Add New Configuration" to add a configuration';
        cell.classList.add('text-center');
        cell.classList.add('text-danger');
        cell.setAttribute('colspan', 4);
        // and force nudge
        let modal = new bootstrap.Modal(document.getElementById('add_new_configuration_modal'));
        modal.show();
        // extra nudge
        errorMsg('You have no Client Configurations. Add one to continue');
        return;
    }

    // reset entry form
    let inputs = document.getElementById('config_form').getElementsByTagName('input');
    for (let x=0;x<inputs.length;x++) {
        if (inputs[x].getAttribute('type') != 'submit' && inputs[x].getAttribute('type') != 'button') {
            inputs[x].value = '';
        }
    }
    document.getElementById('create_button').value = "Create Client Configuration";

    for (var ref in clients) {
        let { client_id, name } = clients[ref];

        let row = el.insertRow();

        var cell = row.insertCell();
        cell.textContent = name;

        var cell = row.insertCell();
        cell.classList.add('monospace');
        cell.textContent = client_id;

        var cell = row.insertCell();
        let grp = document.createElement('div');
        cell.append(grp);

        grp.classList.add('btn-group');

        let usethis = document.createElement('button');
        usethis.classList.add('btn');
        usethis.classList.add('btn-sm');
        usethis.classList.add('btn-outline-success');
        //usethis.textContent = 'Use';

        usethis.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>';

        usethis.setAttribute('title', 'Use this Client configuration');
        usethis.setAttribute('data-client_id', client_id);

        bindUse(usethis);
        grp.append(usethis);

        let a_settings = document.createElement('a');
        a_settings.classList.add('btn');
        a_settings.classList.add('btn-sm');
        a_settings.classList.add('btn-outline-primary');
        a_settings.classList.add('website');
        a_settings.setAttribute('href', `https://dev.twitch.tv/console/apps/${client_id}`);
        a_settings.setAttribute('title', 'View Client Settings for this Client on the Dev Console');
        a_settings.textContent = 'Settings';

        grp.append(a_settings);

        // @todo: future barry problem



        let li = document.createElement('li');
        dropdown.append(li);
        let li_a = document.createElement('a');
        li.append(li_a);
        li_a.classList.add('dropdown-item');
        li_a.setAttribute('href', '#clientid');
        li_a.setAttribute('data-client_id', client_id);
        li_a.textContent = name;
    }
});

function bindUse(el) {
    el.addEventListener('click', (e) => {
        // load parameters for use
        window.electron.config.select(e.currentTarget.getAttribute('data-client_id'));
    });
}
function bindEdit(el) {
    el.addEventListener('click', (e) => {
        // load parameters for edit
        window.electron.config.loadForEdit(e.currentTarget.getAttribute('data-client_id'));
    });
}
function bindRevoke(el, ext) {
    el.addEventListener('click', (e) => {
        // load parameters for edit
        window.electron.config.revokeToken(e.currentTarget.getAttribute('data-client_id'));
    });
}
function bindRemove(el, ext) {
    el.addEventListener('click', (e) => {
        document.getElementById('remove_name').textContent = ext.name;
        document.getElementById('actuallyRemove').setAttribute('data-client_id', ext.client_id);
        let modal = new bootstrap.Modal(document.getElementById('rusure_modal'));
        modal.show();
    });
}
document.getElementById('actuallyRemove').addEventListener('click', (e) => {
    window.electron.config.remove(e.currentTarget.getAttribute('data-client_id'));
});


function markDropdown(client_id) {
    let items = document.getElementsByClassName('dropdown-item');
    for (let x=0;x<items.length;x++) {
        items[x].classList.remove('bg-primary');
        if (client_id || client_id == '') {
            if (items[x].getAttribute('data-client_id') == client_id) {
                items[x].classList.add('bg-primary');
                select_active_extension.textContent = items[x].textContent;
            }
        }
    }
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// an extension was loaded!
window.electron.config.selected((conf) => {
    let { name } = conf;
    console.log('selected', name);

    // API response so differing
    document.getElementById('run-tab').classList.remove('disabled');
    // change to run requests
    tab('run-tab');

    //markDropdown(extension_details.id);
    buildLayout(conf);
});
