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

// toaster
let toaster = {
    error: (words) => {
        notice_toast.querySelector('.toast-body').textContent = words;
        bootstrap.Toast.getOrCreateInstance(notice_toast).show();
    },
    success: (words) => {
        success_toast.querySelector('.toast-body').textContent = words;
        bootstrap.Toast.getOrCreateInstance(success_toast).show();
    },
    rate: (words) => {
        rate_toast.querySelector('.toast-body').textContent = words;
        bootstrap.Toast.getOrCreateInstance(rate_toast).show();
    },
}
window.electron.errorMsg(toaster.error);

function tab(id) {
    let el = document.getElementById(id);
    if (el) {
        let tab = new bootstrap.Tab(el);
        tab.show();
    }
}

// click handler
document.addEventListener('click', (e) => {
    if (e.target.tagName == 'A') {
        if (e.target.getAttribute('href').startsWith('http')) {
            e.preventDefault();
            window.electron.openWeb(e.target.getAttribute('href'));
            return;
        }
    }

    // action processor
});

// response handling
window.electron.twitchAPIResult((data) => {
    master_loading.classList.remove('is_loading');

    if (data.hasOwnProperty('route')) {
        switch (data.route) {
            case 'getConduits':
                drawConduits(data.data);
                break;
            // all three here need a reload
            case 'createConduits':
            case 'deleteConduits':
            case 'updateConduits':
                updateConduits(data);
                // request full reload
                master_loading.classList.add('is_loading');
                window.electron.twitchAPI('getConduits');
                break;


            case 'getConduitShards':
                drawConduitShards(data);
                break;
            case 'gotAndFilterSubscriptions':
                drawEventSubcriptions(data);
                break;

            case 'createSubscriptionResult':
                createSubscriptionResult(data);
                break;
            case 'deletedSubscription':
                deletedSubscription(data);
                break;
        }
    }

    toaster.rate(`HTTP: ${data.status} Ratelimit: ${data.ratelimitRemain}/${data.ratelimitLimit}`);
});
window.electron.twitchAPIRate((data) => {
    toaster.rate(`HTTP: ${data.status} Ratelimit: ${data.ratelimitRemain}/${data.ratelimitLimit}`);
});

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

let actuallyRemoveAction = false;
actuallyRemove.addEventListener('click', (e) => {
    // the modal remove button was clicked
    if (!actuallyRemoveAction) {
        return;
    }
    actuallyRemoveAction();
    actuallyRemoveAction = false;
});