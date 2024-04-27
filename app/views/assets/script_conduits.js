function drawConduits(conduits) {
    getConduitsDisplay.textContent = '';
    // reset other zones
    getConduitShardsDisplay.textContent = '';
    getConduitSubscriptionsDisplay.textContent = '';

    for (var x=0;x<conduits.length;x++) {
        let { id, shard_count } = conduits[x];

        let r = getConduitsDisplay.insertRow();
        r.setAttribute('id', id);
        //r.setAttribute('data-shardCount', shard_count);

        let tdid = r.insertCell();
        tdid.classList.add('monospace');
        let cid = document.createElement('input');
        cid.classList.add('form-control');
        cid.setAttribute('type', 'text');
        cid.setAttribute('readonly', 'readonly');
        cid.value = id;
        tdid.append(cid);// add a copy to clipboard button?
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
        //btn.textContent = 'Update Shard Count';
        btn.setAttribute('title', 'Update Shard Count');
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>';
        igroup.append(btn);
        btn.addEventListener('click', updateConduit);
        // add button for delete conduit
        let xBtn = document.createElement('div');
        xBtn.classList.add('btn');
        xBtn.classList.add('btn-outline-danger');
        xBtn.setAttribute('title', 'Delete Conduit');
        xBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>';
        igroup.append(xBtn);
        xBtn.addEventListener('click', deleteConduit);

        igroup.classList.add('btn-group');
        igroup.classList.add('d-flex');

        let getShards = document.createElement('div');
        getShards.classList.add('btn');
        getShards.classList.add('btn-outline-primary');
        getShards.textContent = 'Shards';
        getShards.setAttribute('data-conduit_id', id);
        getShards.setAttribute('data-shardCount', shard_count);
        getShards.addEventListener('click', setAndGetConduitShards);
        igroup.append(getShards);

        let useConduit = document.createElement('div');
        useConduit.classList.add('btn');
        useConduit.classList.add('btn-outline-primary');
        useConduit.textContent = 'Subs';
        useConduit.setAttribute('data-conduit_id', id);
        useConduit.setAttribute('data-shardCount', shard_count);
        useConduit.addEventListener('click', setAndGetConduitSubscriptions);
        igroup.append(useConduit);
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
        btn.addEventListener('click', createConduit);
        igroup.append(btn);
    }
}


func_get_conduits_go.addEventListener('click', (e) => {
    master_loading.classList.add('is_loading');
    window.electron.twitchAPI('getConduits');
});

function createConduit(e) {
    master_loading.classList.add('is_loading');

    let r = e.target.closest('tr');
    window.electron.twitchAPI(
        'createConduits',
        {
            shard_count: parseInt(r.querySelector('input[name="shardcount"]').value)
        }
    );
}
function updateConduit(e) {
    master_loading.classList.add('is_loading');

    let r = e.target.closest('tr');
    window.electron.twitchAPI(
        'updateConduits',
        {
            id: r.getAttribute('id'),
            shard_count: parseInt(r.querySelector('input[name="shardcount"]').value)
        }
    );
}
    function updateConduits(data) {
        if (data.status == 200 || data.status == 204) {
            toaster.success('Conduit Updated');
        } else {
            // error
            toaster.error(`Failed to update the Conduit: ${data.message}`);
        }
    }
function deleteConduit(e) {
    let r = e.target.closest('tr');

    let modal = new bootstrap.Modal(document.getElementById('rusure_modal'));
    modal.show();

    remove_name.textContent = `Conduit of ID: ${r.getAttribute('id')}`;
    actuallyRemoveAction = function() {
        master_loading.classList.add('is_loading');

        window.electron.twitchAPI(
            'deleteConduits',
            {
                id: r.getAttribute('id')
            }
        );
    }
}

window.electron.config.selectedConduit((conduit_id) => {
    // section titles
    getConduitShardsDisplayHeader.textContent = conduit_id;
    getConduitSubscriptionsDisplayHeader.textContent = conduit_id;

    // form titles
    editshard_conduit_id.value = conduit_id;
    EditConduitShard_modal.querySelector('.modal-title').textContent = `Touch Shard on ${conduit_id}`;

    // buttons
    func_edit_shard_manual.classList.remove('disabled');
    func_refresh_shards.classList.remove('disabled');

    // reset zones
    getConduitShardsDisplay.textContent = '';
    getConduitSubscriptionsDisplay.textContent = '';
});


let nextTask = '';
window.electron.config.selectedConduit(() => {
    console.log('selectedConduit triggered');
    if (nextTask == 'getConduitSubscriptions') {
        getConduitSubscriptions();
    } else {
        getConduitShards();
    }
});

function selectConduit(e) {
    console.log(e.target.getAttribute('data-conduit_id'));
    window.electron.config.selectConduit(e.target.getAttribute('data-conduit_id'));
    editshard_maxshard_count.textContent = `/${e.target.getAttribute('data-shardCount')}`;
}
function setAndGetConduitShards(e) {
    nextTask = 'getConduitShards';
    selectConduit(e);
    //getConduitShards();
}
function getConduitShards() {
    master_loading.classList.add('is_loading');
    window.electron.twitchAPI(
        'getConduitShards'
    );
}
    func_refresh_shards.addEventListener('click', getConduitShards);

function setAndGetConduitSubscriptions(e) {
    nextTask = 'getConduitSubscriptions';
    selectConduit(e);
    //getConduitSubscriptions();
}
function getConduitSubscriptions() {
    master_loading.classList.add('is_loading');
    window.electron.twitchAPI(
        'getAndFilterSubscriptions'
    );
}
    func_load_subscription.addEventListener('click', getConduitSubscriptions);