/**
 * @file This script sends a templated HOTP to a user via the IDM's configured email service
 * using the openidm binding in next-gen scripting
 * NOTE - The use of SendGrid is not supported in Production and must be changed to your own email service
 * Steps are here: https://backstage.forgerock.com/docs/idcloud/latest/tenants/email-provider.html#external_smtp_email_server
 * @version 0.2.0
 * @keywords email mail hotp sharedState transientState templateService
 */

/**
 * Script configuration
*/

// Initialise the logger called ds-node-logger-lib library script
XLogger = require("ds-node-logger-lib").XLogger;
logger = new XLogger(this);

var config = {
    /**
     * @property {string} templateID - Identifier of email template
     * @property {string} idmEndpoint - IDM Endpoint used to send templated emails
     * @property {string} idmAction - IDM action executed against the idmEndpoint
     */

    templateID: "otp",
    idmEndpoint: "external/email",
    idmAction: "sendTemplate"
};

/**
 * Node outcomes
*/
var nodeOutcome = {
    PASS: "sent",
    FAIL: "noMail",
    ERROR: "error"
};

/**
 * Send email via the IDM Email Service openidm binding in next-gen scripting
 * 
 * @param {string} hotp - HOTP retrieved from transientState
 * @param {string} mail - mail attribute retrieved from the idRepository. Note if this is a registration journey acquire mail from sharedState
 * @param {string} givenName - givenName attribute retrieved from the idRepository. Note if this is a registration journey acquire givenName from sharedState
 */

function sendMail(hotp, mail, givenName) {
    try {
        var params = new Object();
        params.templateName = config.templateID;
        params.to = mail;
        params.object = {
            "givenName": givenName,
            "otp": hotp
        };
        openidm.action(config.idmEndpoint, config.idmAction, params);
        logger.error("Email send successfully");
        return nodeOutcome.PASS;
    }
    catch (e) {
        logger.error("Failed to call IDM Email endpoint using template. Exception is: " + e);
        return nodeOutcome.ERROR;
    }
};

/**
 * Main function
 */

(function () {
    logger.error("Node execution started");
    var id;
    var hotp;
    var mail;

    if (!(id = nodeState.get("_id"))) {
        logger.error("Unable to retrieve Identity");
        action.goTo(nodeOutcome.ERROR);
        return;
    } else {
        var identity = idRepository.getIdentity(id);
    }

    if (!(hotp = nodeState.get("oneTimePassword"))) {
        logger.error("Unable to retrieve HOTP from state");
        action.goTo(nodeOutcome.ERROR);
        return;
    }

    //If this is a registration journey adapt the following to try retrieve from nodeState
    if (!(mail = identity.getAttributeValues("mail").toArray()[0])) {
        logger.error("Unable to retrieve mail attribute from the idRepository");
        action.goTo(nodeOutcome.FAIL);
        return;
    }

    //If this is a registration journey adapt the following to try retrieve from nodeState
    //Be sure to set givenName against the user
    if (!(givenName = identity.getAttributeValues("givenName").toArray()[0])) {
        logger.error("Unable to retrieve givenName attribute from the idRepository");
        action.goTo(nodeOutcome.FAIL);
        return;
    }

    //Execute function to send mail
    outcome = sendMail(hotp, mail, givenName);
})();