$(document).ready(() => {
    $('#business_proposal').hide();

    const BusinessProposal = {
        data() {
            return {
                name: '',
                note: '',
                type: '',
                creatorSurname: '',
                creatorName: '',
                canApprove: false,
                approvalSignature: '',
                view: 0,
                doc: null,
                typeOptions: {
                    delivery: "Delivery",
                    retail: "Retail"
                }
            }
        },
        methods: {
            sign() {
                $('#business_proposal').hide();
                if (this.view == 1) {
                    $.post('https://mrp_business/close', JSON.stringify({}));
                } else {
                    $.post('https://mrp_business/printForm', JSON.stringify({
                        name: this.name,
                        note: this.note,
                        type: this.type,
                        creatorSignature: this.creatorName + ' ' + this.creatorSurname
                    }));
                }
            },
            approve() {
                if (this.canApprove && this.doc) {
                    $('#business_proposal').hide();
                    //TODO
                }
            },
            resetData() {
                this.name = '';
                this.note = '';
                this.type = '';
                this.view = 0;
                this.creatorName = '';
                this.creatorSurname = '';
                this.approvalSignature = '';
                this.canApprove = false;
            },
            handleMessage(eventData) {
                switch (eventData.type) {
                    case "show":
                        $('#business_proposal').show();
                        this.resetData();
                        this.canApprove = false;
                        this.creatorName = eventData.char.name;
                        this.creatorSurname = eventData.char.surname;
                        break;
                    case "hide":
                        this.resetData();
                        $('#business_proposal').hide();
                        break;
                    case "view":
                        if (!eventData.doc)
                            return;

                        this.doc = eventData.doc;
                        this.view = 1;

                        this.name = eventData.doc.name;
                        this.note = eventData.doc.note;
                        this.type = eventData.doc.type;
                        this.canApprove = eventData.canApprove;
                        let sign = eventData.doc.creatorSignature.split(' ');
                        this.creatorName = sign[0];
                        this.creatorSurname = sign[1];
                        this.approvalSignature = eventData.char.name + ' ' + eventData.char.surname;
                        $('#business_proposal').show();
                        break;
                    default:
                        break;
                }
            }
        }
    }

    let app = Vue.createApp(BusinessProposal);
    let vm = app.mount('#business_proposal');

    window.addEventListener('message', function(event) {
        var eventData = event.data;
        if (eventData)
            vm.handleMessage(eventData);
    });

    $(document).keydown(function(e) {
        //on ESC close
        if (e.keyCode == 27) {
            vm.handleMessage({
                type: 'hide'
            });
            $.post('https://mrp_business/close', JSON.stringify({}));
        }
    });
});