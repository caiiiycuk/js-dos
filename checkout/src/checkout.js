function checkout(accessToken, sandbox = true) {
    let invoice = "";
    return new Promise((resolve, reject) => {
        try {
            XPayStationWidget.init({
                access_token: accessToken,
                sandbox,
            });
            XPayStationWidget.off();
            XPayStationWidget.on(XPayStationWidget.eventTypes.CLOSE, () => {
                XPayStationWidget.off();
                if (invoice.length > 0) {
                    resolve(invoice);
                }
                else {
                    reject(new Error("Transaction ID to assigned"));
                }
            });
            XPayStationWidget.on(XPayStationWidget.eventTypes.STATUS, function (event, data) {
                const status = data.paymentInfo.status;
                invoice = data.paymentInfo.invoice;
                console.log("on(STATUS) status: '" + status + "', invoice: '" + invoice + "'");
            });
            XPayStationWidget.open();
        }
        catch (e) {
            console.error(e);
            reject(new Error("Popup blocked, unable to open pay station"));
        }
    });
}
;
