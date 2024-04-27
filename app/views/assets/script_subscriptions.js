function drawEventSubcriptions(resp) {
    getConduitSubscriptionsDisplay.textContent = '';

    if (document.querySelector('#func_got_conduit_subscriptions_header button').getAttribute('aria-expanded') === 'false') {
        document.querySelector('#func_got_conduit_subscriptions_header button').click();
    }

    let { data } = resp;
    //console.log(data);return;
    for (var x=0;x<data.length;x++) {
        let { id, type, version, condition, status } = data[x];
        let r = getConduitSubscriptionsDisplay.insertRow();
        r.setAttribute('id', id);

        var d = r.insertCell();
        d.textContent = type;
        var d = r.insertCell();
        d.textContent = version;
        var d = r.insertCell();
        d.textContent = JSON.stringify(condition);
        var d = r.insertCell();
        d.textContent = status;;

        var d = r.insertCell();

        let a_remove = document.createElement('button');
        a_remove.classList.add('btn');
        a_remove.classList.add('btn-sm');
        a_remove.classList.add('btn-outline-danger');
        a_remove.setAttribute('title', 'Remove this subscription');
        a_remove.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/></svg>'
        d.append(a_remove);

        a_remove.addEventListener('click', deleteSubscription);
    }
}

let deletedSubscriptionId = '';
function deleteSubscription(e) {
    let r = e.target.closest('tr');

    let modal = new bootstrap.Modal(document.getElementById('rusure_modal'));
    modal.show();

    remove_name.textContent = `Subscription of ID: ${r.getAttribute('id')}`;
    actuallyRemoveAction = function() {
        master_loading.classList.add('is_loading');

        deletedSubscriptionId = r.getAttribute('id');

        window.electron.twitchAPI(
            'deleteSubscription',
            {
                id: r.getAttribute('id')
            }
        );
    }
}
function deletedSubscription(pl) {
    console.log('in delete', deletedSubscriptionId);
    let { status, message } = pl;
    let { ratelimitRemain, ratelimitLimit } = pl;

    if (status == 204) {
        // toast
        toastSuccess(`Deleted: ${status} Ratelimit: ${ratelimitRemain}/${ratelimitLimit}`);
        let el = document.getElementById(deletedSubscriptionId);
        console.log(el);
        if (el) {
            el.remove();
        }
    } else {
        toastWarning(`Failed: ${status} - ${message}`);
    }
}



func_create_subscription.addEventListener('click', (e) => {
    let modal = bootstrap.Modal.getOrCreateInstance('#CreateSubscription_modal');
    modal.show();

    // populate
    create_subscription_conduit_id.value = conduitOperatingOn;
});
create_subscription_condition_add.addEventListener('click', (e) => {
    e.preventDefault();

    let el = e.currentTarget.parentElement.cloneNode(true);
    //console.log(el);
    let items = el.querySelectorAll('input');
    items.forEach(subEl => {
        subEl.value = '';
    });

    let add = el.querySelector('#create_subscription_condition_add');
    add.removeAttribute('id');
    add.classList.remove('btn-outline-primary');
    add.classList.add('btn-outline-danger');
    add.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/></svg>';
    add.setAttribute('data-has-action', 'removeSubscriptionCondition');

    create_subscription_condition.append(el);

    items[0].focus();
});
create_subscription_form.addEventListener('reset', (e) => {
    let cond = create_subscription_conduit_id.value;
    setTimeout(() => {
        create_subscription_conduit_id.value = cond;
    }, 100);
});
create_subscription_form.addEventListener('submit', (e) => {
    e.preventDefault();

    // collect the form
    let payload = {
        type: create_subscription_type.value,
        version: create_subscription_version.value,
        condition: {
        },
        transport: {
            method: 'conduit',
            conduit_id: conduitOperatingOn
        }
    }

    let fields = create_subscription_condition.querySelectorAll('input[name="create_subscription_condition_field[]"]');
    let values = create_subscription_condition.querySelectorAll('input[name="create_subscription_condition_value[]"]');

    for (var x=0;x<fields.length;x++) {
        let field = fields[x].value;
        let value = values[x].value;
        if (field != '' && value != '') {
            payload.condition[field] = value;
        }
    }

    // and dispatch
    console.log(payload);

    master_loading.classList.add('is_loading');

    // dimiss?
    window.electron.twitchAPI('createSubscription', payload);
});
function createSubscriptionResult(pl) {
    let { status, message } = pl;
    let { ratelimitRemain, ratelimitLimit } = pl;

    if (status == 202) {
        // toast
        toastSuccess(`Created: ${status} Ratelimit: ${ratelimitRemain}/${ratelimitLimit}`);
        // dismissmodal
        let modal = bootstrap.Modal.getOrCreateInstance('#CreateSubscription_modal');
        modal.hide();
    } else {
        toastWarning(`Failed: ${status} - ${message}`);
    }
}
