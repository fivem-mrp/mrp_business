const config = require('./config/config.json');

let localeConvar = GetConvar("mrp_locale", "en");
let locale = config.locale[localeConvar];

MRP_SERVER = null;

emit('mrp:getSharedObject', obj => MRP_SERVER = obj);

while (MRP_SERVER == null) {
    console.log('Waiting for shared object....');
}

onNet('mrp:business:server:createDocument', (source, data) => {
    if (!data) {
        console.log('Empty data object');
        return;
    }

    let char = MRP_SERVER.getSpawnedCharacter(source);
    if (!char) {
        console.log('No logged character');
        return;
    }

    data.createdBy = char._id;
    data.createdAt = Date.now();

    emit('mrp:bankin:server:pay:cash', source, config.businessProposalPrice);

    MRP_SERVER.create('document', data, (r) => {
        console.log('Created business proposal document');
        emit('mrp:inventory:server:AddItem', 'businessproposal', 1, null, {
            documentId: r.insertedId
        }, source);
    });
});

onNet('mrp:business:server:view', (source, data) => {
    if (!data || !data.info) {
        console.log('Invalid data object received');
        return;
    }

    MRP_SERVER.read('document', {
        _id: data.info.documentId
    }, (doc) => {
        if (!doc) {
            console.log('No document found');
            emitNet('chat:addMessage', source, {
                template: '<div class="chat-message nonemergency">{0}</div>',
                args: [
                    locale.no_document
                ]
            });
            return;
        }

        emitNet('mrp:business:client:view', source, doc);
    });
});