MRP_CLIENT = null;

emit('mrp:getSharedObject', obj => MRP_CLIENT = obj);

while (MRP_CLIENT == null) {
    print('Waiting for shared object....');
}

let localeConvar = GetConvar("mrp_locale", "en");

eval(LoadResourceFile('mrp_core', 'client/helpers.js'));

configFile = LoadResourceFile(GetCurrentResourceName(), 'config/config.json');

config = JSON.parse(configFile);

locale = config.locale[localeConvar];

if (config.showBlips) {
    MRP_CLIENT.addBlips(config.locations);
}

on('onClientResourceStart', (name) => {
    if (name != GetCurrentResourceName())
        return;

    for (let location of config.locations) {
        MRP_CLIENT.spawnSharedNPC({
            model: location.ped,
            x: location.x,
            y: location.y,
            z: location.z,
            heading: location.heading
        });
    }
});

setInterval(() => {
    for (let location of config.locations) {
        let ped = PlayerPedId();
        let modelHash = GetHashKey(location.shopkeeperPed);
        if (MRP_CLIENT.isNearLocation(ped, location.x, location.y, location.z) && MRP_CLIENT.isPedNearCoords(location.x, location.y, location.z, null, modelHash)) {
            //check if looking at shop keeper
            let pedInFront = MRP_CLIENT.getPedInFront();
            if (pedInFront > 0) {
                emit('mrp:thirdeye:addMenuItem', {
                    locationId: location.id,
                    id: 'cityhall',
                    text: locale.file,
                    action: 'https://mrp_business/openFileForm'
                });
            } else {
                currentLocation = null;
                emit('mrp:thirdeye:removeMenuItem', {
                    id: 'cityhall'
                });
            }
        }
    }
}, 0);

RegisterNuiCallbackType('openFileForm');
on('__cfx_nui:openFileForm', (data, cb) => {
    cb({});

    console.log('Open file form');
    MRP_CLIENT.setPlayerMetadata("inMenu", true);

    SetNuiFocus(true, true);
    SendNuiMessage(JSON.stringify({
        type: 'show',
        char: MRP_CLIENT.GetPlayerData()
    }));
});

RegisterNuiCallbackType('close');
on('__cfx_nui:close', (data, cb) => {
    cb({});

    SetNuiFocus(false, false);
    MRP_CLIENT.setPlayerMetadata("inMenu", false);
});