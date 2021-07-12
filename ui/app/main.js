$(document).ready(() => {
    $('#business_proposal').hide();

    const BusinessProposal = {
        data() {
            return {
                name: 'name',
                note: 'note',
                type: '',
                creatorSurname: '',
                creatorName: ''
            }
        },
        methods: {
            sign() {
                $('#business_proposal').hide();
                $.post('https://mrp_business/close', JSON.stringify({}));
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
        console.log(vm.name);
        var eventData = event.data;
        if (eventData)
            vm.handleMessage(eventData);
    });
});