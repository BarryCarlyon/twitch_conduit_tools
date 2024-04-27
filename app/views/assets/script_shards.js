function drawConduitShards(resp) {
    if (document.querySelector('#func_get_conduit_shards_header button').getAttribute('aria-expanded') === 'false') {
        document.querySelector('#func_get_conduit_shards_header button').click();
    }

    let { data } = resp;

    getConduitShardsDisplay.textContent = '';

    for (var x = 0;x<data.length;x++) {
        let { id, status, transport } = data[x];
        let { method, session_id, callback } = transport;

        // build ui
        let r = getConduitShardsDisplay.insertRow();
        r.setAttribute('data-shard-id', id);

        let idCell = r.insertCell();
        idCell.textContent = id;
        let statusCell = r.insertCell();
        statusCell.textContent = status;

        let methodCell = r.insertCell();

        let methodDiv = document.createElement('div');
        methodCell.append(methodDiv);
        methodDiv.textContent = method;
        methodDiv.classList.add('btn');
        methodDiv.classList.add('btn-sm');
        methodDiv.classList.add('btn-outline-secondary');
        methodDiv.setAttribute('data-bs-toggle', 'popover');
        methodDiv.setAttribute('data-bs-title', method);
        methodDiv.setAttribute('data-bs-content', (session_id ? session_id : callback));
        new bootstrap.Popover(methodDiv);

        let buttonCell = r.insertCell();
        let btn = document.createElement('div');
        btn.classList.add('btn');
        btn.classList.add('btn-sm');
        btn.classList.add('btn-outline-primary');
        btn.textContent = 'Edit Shard';
        btn.addEventListener('click', openEditConduitShard);
        buttonCell.append(btn);

        btn.setAttribute('data-method', method);
        btn.setAttribute('data-session-id', (session_id ? session_id : ''));
        btn.setAttribute('data-callback', (callback ? callback : ''));
    }
}

function openEditConduitShard(e) {
    let modal = bootstrap.Modal.getOrCreateInstance('#EditConduitShard_modal');
    modal.show();

    let r = e.target.closest('tr');

    editshard_shard_id.value = r.getAttribute('data-shard-id');
    editshard_shard_id.setAttribute('readonly', 'readonly');

    EditConduitShard_modal.querySelector('.modal-title').textContent = `Update Shard ${editshard_shard_id.value} on ${editshard_conduit_id.value}`;

    // @todo: future barry problem
    // load the live details

    let method = e.currentTarget.getAttribute('data-method');
    editshard_transport_callback.value = e.currentTarget.getAttribute('data-callback');
    editshard_transport_session_id.value = e.currentTarget.getAttribute('data-session-id');

    if (method == 'websocket') {
        editshard_transport_method_websocket.checked = true;
    } else {
        editshard_transport_method_webhook.checked = true;
    }
    toggleShardOptions({
        target: {
            value: method
        }
    })
}
function openEditCreateConduitShard() {
    let modal = bootstrap.Modal.getOrCreateInstance('#EditConduitShard_modal');
    modal.show();

    editshard_shard_id.removeAttribute('readonly');

    editshard_transport_callback.value = '';
    editshard_transport_session_id.value = '';

    editshard_transport_method_websocket.checked = true;
    toggleShardOptions({
        target: {
            value: 'websocket'
        }
    })
}

func_edit_shard_manual.addEventListener('click', openEditCreateConduitShard);

editshard_transport_method_webhook.addEventListener('change', toggleShardOptions);
editshard_transport_method_websocket.addEventListener('change', toggleShardOptions);
function toggleShardOptions(e) {
    if (e.target.value == 'websocket') {
        editshard_transport_method_webhook_options.classList.add('d-none');
        editshard_transport_method_websocket_options.classList.remove('d-none');
    } else {
        editshard_transport_method_webhook_options.classList.remove('d-none');
        editshard_transport_method_websocket_options.classList.add('d-none');
    }
}

shard_form.addEventListener('submit', (e) => {
    e.preventDefault();
    master_loading.classList.add('is_loading');
    window.electron.twitchAPI(
        'updateConduitShards',
        {
            shard_id:   shard_form['editshard_shard_id'].value,
            transport:  shard_form['editshard_transport_method'].value,
            callback:   shard_form['editshard_transport_callback'].value,
            secret:     shard_form['editshard_transport_secret'].value,
            session_id: shard_form['editshard_transport_session_id'].value
        }
    );
});