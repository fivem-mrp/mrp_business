/**
 * need to have module mrp_business loaded
 * 
 * @memberof MRP_SERVER
 * @namespace business
 */

const config = require('./config/config.json');

let localeConvar = GetConvar("mrp_locale", "en");
let locale = config.locale[localeConvar];

MRP_SERVER = null;

const BUSINESS_TYPES = {
    DELIVERY: "Delivery",
    RETAIL: "Retail",
    CARGO: "Cargo"
};

emit('mrp:getSharedObject', obj => MRP_SERVER = obj);

while (MRP_SERVER == null) {
    console.log('Waiting for shared object....');
}

/**
 * Create document event
 * @event MRP_SERVER.business#mrp:business:server:createDocument
 * @type {object}
 * @property {Document} data      document to create
 * @fires MRP_SERVER.bankin#mrp:bankin:server:pay:cash
 * @fires MRP_SERVER.inventory#mrp:inventory:server:AddItem
 */
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

/**
 * View document event
 * @event MRP_SERVER.business#mrp:business:server:view
 * @type {object}
 * @property {Item} data      item of the document to view
 * @fires MRP_CLIENT.business#mrp:business:client:view
 */
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

        emitNet('mrp:business:client:view', source, doc, data);
    });
});

/**
 * Create business event
 * @event MRP_SERVER.business#mrp:business:server:create
 * @type {object}
 * @property {Document} doc      document that's used as a base for business creation
 */
onNet('mrp:business:server:create', (source, doc) => {
    //create the actual business
    MRP_SERVER.read('character', {
        _id: doc.createdBy
    }, (char) => {
        if (!char) {
            console.log(`Unable to find a character with id [${doc.createdBy}]`);
            return;
        }
        let owner = char;

        let business = {
            name: doc.name,
            type: doc.type,
            note: doc.note,
            roles: [{
                name: config.ownerRole,
                canHire: true,
                canFire: true,
                canAddRole: true,
                canDeleteRole: true,
                canChangeRole: true,
                canPromote: true,
                canCreateJobs: true,
                hasBankAccess: true,
                isDefault: false
            }]
        };

        if (doc.type == BUSINESS_TYPES.DELIVERY || doc.type == BUSINESS_TYPES.CARGO) {
            business.canCreateJobs = true;
        }

        MRP_SERVER.create('business', business, (r) => {
            if (r.insertedId) {
                console.log(`Created business ${business.name}`);
                emit('mrp:employment:server:addEmployment', source, char.stateId, r.insertedId, config.ownerRole);

                emit('mrp:bankin:server:createAccount', source, {
                    type: 'business',
                    account_name: business.name,
                    owner: r.insertedId,
                    default: true
                }, 'no_need_for_uuid');

                MRP_SERVER.update('document', {
                    businessId: r.insertedId
                }, {
                    _id: doc._id,
                }, null, r => {});
            }
        });
    });
});

/**
 * Approve document event
 * @event MRP_SERVER.business#mrp:business:server:update
 * @type {object}
 * @property {Business} business      business to update
 */
onNet('mrp:business:server:update', (source, business, uuid) => {
    console.log(`Update business ${JSON.stringify(business)}`);
    if (!business) {
        console.log('Tried updating an empty business object');
        return;
    }

    MRP_SERVER.update('business', business, {
        _id: business._id
    }, null, (r) => {
        if (r.modifiedCount < 1) {
            console.log('Error updating business');
        }
        emitNet('mrp:business:server:update:response', source, r, uuid);
    });
});

/**
 * Approve document event
 * @event MRP_SERVER.business#mrp:business:server:approve
 * @type {object}
 * @property {Document} doc      document to approve
 * @property {Item} item         item to approve and remove after
 */
onNet('mrp:business:server:approve', (source, doc, item) => {
    console.log(`Approve document ${JSON.stringify(doc)}`);
    let approver = MRP_SERVER.getSpawnedCharacter(source);

    doc.approvedBy = approver._id;
    doc.approvedAt = Date.now();
    MRP_SERVER.update('document', doc, {
        _id: doc._id
    }, null, (r) => {
        console.log('Approved business proposal document');
        emit('mrp:inventory:server:RemoveItem', 'businessproposal', 1, item.slot, {}, source);

        emit('mrp:business:server:create', source, doc);

        emitNet('chat:addMessage', source, {
            template: '<div class="chat-message nonemergency">{0}</div>',
            args: [
                locale.documentApproved
            ]
        });
    });
});