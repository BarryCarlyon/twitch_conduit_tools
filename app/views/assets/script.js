let updater_reset = false;
window.electron.onUpdater((data) => {
    var u = document.getElementById('updater');

    u.classList.add('updating');
    clearTimeout(updater_reset);
    updater_reset = setTimeout(() => {
        u.classList.remove('updating');
    }, 10000);

    switch (data.event) {
        case 'noupdater':
            u.classList.add('d-none');
            break;
        case 'update-error':
            u.innerHTML = 'Update Error';
            break;
        case 'checking-for-update':
            u.innerHTML = 'Checking';
            break;
        case 'update-available':
            u.innerHTML = 'Update Available';
            break;
        case 'update-not-available':
            u.innerHTML = 'Up to Date';
            break;
        case 'download-progress':
            u.innerHTML = 'DL: ' + data.data.percent.toFixed(1) + '%';
            break;
        case 'update-downloaded':
            u.innerHTML = 'Downloaded! Click to restart';
            u.classList.remove('updating');
            u.classList.add('update_available');
            u.classList.remove('btn-outline-primary');
            u.classList.add('btn-outline-success');
            break;
    }
});
window.electron.ready();
document.getElementById('updater').addEventListener('click', window.electron.updateCheck);

// so lazy
let links = document.getElementsByTagName('a');
for (let x=0;x<links.length;x++) {
    if (links[x].getAttribute('href').startsWith('https://')) {
        links[x].classList.add('website');
    }
}



document.addEventListener('click', (e) => {
    if (e.target.tagName == 'A') {
        if (e.target.getAttribute('href').startsWith('#')) {
            if (e.target.hasAttribute('data-client_id')) {
                window.electron.config.select(e.target.getAttribute('data-client_id'));
                // change to extension tag
                tab('config-tab');
                document.getElementById('run-tab').classList.add('disabled');
            }
            return;
        }
        e.preventDefault();
        window.electron.openWeb(e.target.getAttribute('href'));
    }
});



function tab(id) {
    let el = document.getElementById(id);
    if (el) {
        let tab = new bootstrap.Tab(el);
        tab.show();
    }
}


function resetLoadings() {
    let loadings = document.getElementsByClassName('loading');
    for (var x=0;x<loadings.length;x++) {
        loadings[x].classList.remove('loading');
    }
}
window.electron.errorMsg(words => {
    // reset all loadings
    resetLoadings();
    // draw
    errorMsg(words);
});
function errorMsg(words) {
    let alert = document.getElementById('alert');

    if (!alert) {
        alert = document.createElement('div');
        alert.setAttribute('id', 'alert');

        alert.classList.add('alert');
        alert.classList.add('alert-warning');
        alert.classList.add('alert-dismissable');
        alert.classList.add('fade');
        alert.classList.add('show');
        //alert.classList.add('bg-warning');

        let b = document.createElement('button');
        b.classList.add('btn-close');
        b.setAttribute('data-bs-dismiss', 'alert');
        alert.append(b);
        document.body.append(alert);
    }

    let sp = document.createElement('p');
    sp.textContent = words;
    alert.append(sp);

    setTimeout(() => {
        sp.remove();
        let ps = alert.getElementsByTagName('p');
        if (ps && ps.length > 0) {
            return;
        }
        let ins = bootstrap.Alert.getOrCreateInstance(alert);
        ins.close();
    }, 10000);
}

function buildLayout(details) {
    let { client_id, name } = details;

    // use name somewhere but I forget where

    let active_client_id = document.getElementsByClassName('active_client_id');
    for (let x=0;x<active_client_id.length;x++) {
        active_client_id[x].value = client_id;
        active_client_id[x].setAttribute('readonly', 'readonly');
    }
}





function resetLoadings() {
    let loadings = document.getElementsByClassName('loading');
    for (var x=0;x<loadings.length;x++) {
        loadings[x].classList.remove('loading');
    }
}
document.getElementById('func_get_conduits_go').addEventListener('click', (e) => {
    window.electron.twitchAPI('getConduits');
});
window.electron.twitchAPIResult((data) => {
    resetLoadings();

    if (data.hasOwnProperty('route')) {
        switch (data.route) {
            case 'getConduits':
                drawConduits(data.data);
                break;

            case 'createConduits':
                // reload conduits
                //window.electron.twitchAPI('getConduits');
                //break;
            case 'deleteConduits':
            case 'updateConduits':
                // call full reload
                window.electron.twitchAPI('getConduits');
                break;

            case 'getConduitShards':
                drawConduitShards(data);
                break;
        }
    }

    errorMsg(`HTTP: ${data.status} Ratelimit: ${data.ratelimitRemain}/${data.ratelimitLimit}`);
});

function drawConduits(conduits) {
    getConduitsDisplay.textContent = '';

    for (var x=0;x<conduits.length;x++) {
        let { id, shard_count } = conduits[x];

        let r = getConduitsDisplay.insertRow();
        r.setAttribute('id', id);

        let tdid = r.insertCell();
        tdid.classList.add('monospace');
        tdid.textContent = id;
        // @todo: add field to give name
        // and display name locally

        let midCell = r.insertCell();

        let igroup = document.createElement('div');
        midCell.append(igroup);
        igroup.classList.add('input-group');

        //midCell.textContent = shard_count;
        let inp = document.createElement('input');
        inp.classList.add('form-control');
        inp.setAttribute('id', `${id}_shardcount`);
        inp.setAttribute('name', 'shardcount');
        inp.setAttribute('type', 'number');
        inp.setAttribute('min', 1);
        inp.setAttribute('max', 20000);
        inp.value = shard_count;
        igroup.append(inp);

        // add button for edit shard count
        let btn = document.createElement('div');
        btn.classList.add('btn');
        btn.classList.add('btn-outline-warning');
        btn.textContent = 'Update Count';
        igroup.append(btn);
        btn.addEventListener('click', updateConduits);
        // add button for delete conduit
        let xBtn = document.createElement('div');
        xBtn.classList.add('btn');
        xBtn.classList.add('btn-outline-danger');
        //xBtn.textContent = 'Update Count';
        xBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>';
        igroup.append(xBtn);
        xBtn.addEventListener('click', deleteConduits);

        let rightCell = r.insertCell();
        let getShards = document.createElement('div');
        getShards.classList.add('btn');
        getShards.classList.add('btn-outline-primary');
        getShards.textContent = 'Shards';
        getShards.addEventListener('click', getConduitShards);
        rightCell.append(getShards);
    }
    let conduitMax = 5;
    for (x=x;x<conduitMax;x++) {
        let r = getConduitsDisplay.insertRow();
        let tdid = r.insertCell();
        tdid.textContent = 'Empty';
        let rightCell = r.insertCell();
        // add create button

        let igroup = document.createElement('div');
        rightCell.append(igroup);
        igroup.classList.add('input-group');

        let inp = document.createElement('input');
        inp.classList.add('form-control');
        inp.setAttribute('id', `${x}_shardcount`);
        inp.setAttribute('name', 'shardcount');
        inp.setAttribute('type', 'number');
        inp.setAttribute('min', 1);
        inp.setAttribute('max', 20000);
        inp.value = '1';
        igroup.append(inp);

        let btn = document.createElement('div');
        btn.classList.add('btn');
        btn.classList.add('btn-outline-primary');
        btn.textContent = 'Create';
        btn.addEventListener('click', createConduits);
        igroup.append(btn);
    }
}

function createConduits(e) {
    let r = e.target.closest('tr');

    window.electron.twitchAPI(
        'createConduits',
        {
            shard_count: parseInt(r.querySelector('input[name="shardcount"]').value)
        }
    );
}
function deleteConduits(e) {
    let r = e.target.closest('tr');

    window.electron.twitchAPI(
        'deleteConduits',
        {
            id: r.getAttribute('id')
        }
    );
}

function updateConduits(e) {
    let r = e.target.closest('tr');

    window.electron.twitchAPI(
        'updateConduits',
        {
            id: r.getAttribute('id'),
            shard_count: parseInt(r.querySelector('input[name="shardcount"]').value)
        }
    );
}
function getConduitShards(e) {
    let r = e.target.closest('tr');
    window.electron.twitchAPI(
        'getConduitShards',
        {
            id: r.getAttribute('id')
        }
    );
    getConduitShardsDisplayHeader.textContent = r.getAttribute('id');
}

/*
const triggerTabList = document.querySelectorAll('#myTab button')
triggerTabList.forEach(triggerEl => {
  const tabTrigger = new bootstrap.Tab(triggerEl)

  triggerEl.addEventListener('click', event => {
    event.preventDefault()
    tabTrigger.show()
  })
})
*/


function drawConduitShards(resp) {
    document.querySelector('#func_get_conduit_shards_header button').click();

    let { data, pagination } = resp;

    getConduitShardsDisplay.textContent = '';

    for (var x = 0;x<data.length;x++) {
        let { id, status, transport } = data[x];
        let { method, session_id, callback } = transport;

        // build ui
        let r = getConduitShardsDisplay.insertRow();
        r.setAttribute('data-conduit-id', getConduitShardsDisplayHeader.textContent);
        r.setAttribute('data-shard-id', id);

        let idCell = r.insertCell();
        idCell.textContent = id;
        let statusCell = r.insertCell();
        statusCell.textContent = status;
        let methodCell = r.insertCell();
        methodCell.textContent = method;

        let buttonCell = r.insertCell();
        let btn = document.createElement('div');
        btn.classList.add('btn');
        btn.classList.add('btn-sm');
        btn.classList.add('btn-outline-primary');
        btn.textContent = 'Edit';
        btn.addEventListener('click', openEditConduitShard);
        buttonCell.append(btn);

        btn.setAttribute('data-method', method);
        btn.setAttribute('data-session-id', (session_id ? session_id : ''));
        btn.setAttribute('data-callback', (callback ? callback : ''));
    }
}
function openEditConduitShard(e) {
    let r = e.target.closest('tr');

    editshard_conduit_id.value = r.getAttribute('data-conduit-id');
    editshard_shard_id.value = r.getAttribute('data-shard-id');

    let modal = bootstrap.Modal.getOrCreateInstance('#EditConduitShard_modal');
    modal.show();

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

    window.electron.twitchAPI(
        'updateConduitShards',
        {
            conduit_id: shard_form['editshard_conduit_id'].value,
            shard_id:   shard_form['editshard_shard_id'].value,
            transport:  shard_form['editshard_transport_method'].value,
            callback:   shard_form['editshard_transport_callback'].value,
            secret:     shard_form['editshard_transport_secret'].value,
            session_id: shard_form['editshard_transport_session_id'].value
        }
    );
});
