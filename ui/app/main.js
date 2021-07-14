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
                typeOptions: {
                    delivery: "Delivery",
                    retail: "Retail"
                }
            }
        },
        methods: {
            sign() {
                $('#business_proposal').hide();
                $.post('https://mrp_business/printForm', JSON.stringify({
                    name: this.name,
                    note: this.note,
                    type: this.type,
                    creatorSignature: this.creatorName + ' ' + this.creatorSurname
                }));
            },
            handleMessage(eventData) {
                switch (eventData.type) {
                    case "show":
                        $('#business_proposal').show();
                        this.creatorName = eventData.char.name;
                        this.creatorSurname = eventData.char.surname;
                        break;
                    case "hide":
                        $('#business_proposal').hide();
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
});