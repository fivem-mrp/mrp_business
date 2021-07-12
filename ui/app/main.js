$(document).ready(() => {
    $('#business_proposal').hide();
    const BusinessProposal = {
        data() {
            return {
                name: 'name',
                note: 'note',
                type: null
            }
        },
        methods: {
            sign() {
                $('#business_proposal').hide();
                $.post('https://mrp_business/close', JSON.stringify({}));
            },
            handleMessage(data) {
                switch (data.type) {
                    case "show":
                        $('#business_proposal').show();
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

    Vue.createApp(BusinessProposal).mount('#business_proposal');

    window.addEventListener('message', function(event) {
        var data = event.data;
        if (data)
            BusinessProposal.methods.handleMessage(data);
    });
});