var os = require('os');
if (os.platform() == 'win32') {
    if (os.arch() == 'ia32') {
        var chilkat = require('@chilkat/ck-node11-win-ia32');
    } else {
        var chilkat = require('@chilkat/ck-node11-win64');
    }
} else if (os.platform() == 'linux') {
    if (os.arch() == 'arm') {
        var chilkat = require('@chilkat/ck-node11-arm');
    } else if (os.arch() == 'x86') {
        var chilkat = require('@chilkat/ck-node11-linux32');
    } else {
        var chilkat = require('@chilkat/ck-node11-linux64');
    }
} else if (os.platform() == 'darwin') {
    var chilkat = require('@chilkat/ck-node11-macosx');
}

function chilkatExample() {

    // This example requires the Chilkat API to have been previously unlocked.
    // See Global Unlock Sample for sample code.

    // First create a new contact XML.
    var xml = new chilkat.Xml();
    xml.Tag = "atom:entry";
    xml.AddAttribute("xmlns:atom", "http://www.w3.org/2005/Atom");
    xml.AddAttribute("xmlns:gd", "http://schemas.google.com/g/2005");
    xml.UpdateAttrAt("atom:category", true, "scheme", "http://schemas.google.com/g/2005#kind");
    xml.UpdateAttrAt("atom:category", true, "term", "http://schemas.google.com/contact/2008#contact");
    xml.UpdateChildContent("gd:name|gd:givenName", "Elizabeth");
    xml.UpdateChildContent("gd:name|gd:familyName", "Bennet");
    xml.UpdateChildContent("gd:name|gd:fullName", "Elizabeth Bennet");
    xml.UpdateAttrAt("atom:content", true, "type", "text");
    xml.UpdateChildContent("atom:content", "Notes");
    xml.UpdateAttrAt("gd:email", true, "rel", "http://schemas.google.com/g/2005#work");
    xml.UpdateAttrAt("gd:email", true, "primary", "true");
    xml.UpdateAttrAt("gd:email", true, "address", "liz@gmail.com");
    xml.UpdateAttrAt("gd:email", true, "displayName", "E. Bennet");
    xml.UpdateAttrAt("gd:email", true, "rel", "http://schemas.google.com/g/2005#home");
    xml.UpdateAttrAt("gd:email", true, "address", "liz@example.org");
    xml.UpdateAttrAt("gd:phoneNumber", true, "rel", "http://schemas.google.com/g/2005#work");
    xml.UpdateAttrAt("gd:phoneNumber", true, "primary", "true");
    xml.UpdateChildContent("gd:phoneNumber", "(206)555-1212");
    xml.UpdateAttrAt("gd:phoneNumber", true, "rel", "http://schemas.google.com/g/2005#home");
    xml.UpdateChildContent("gd:phoneNumber", "(206)555-1213");
    xml.UpdateAttrAt("gd:im", true, "address", "liz@gmail.com");
    xml.UpdateAttrAt("gd:im", true, "protocol", "http://schemas.google.com/g/2005#GOOGLE_TALK");
    xml.UpdateAttrAt("gd:im", true, "primary", "true");
    xml.UpdateAttrAt("gd:im", true, "rel", "http://schemas.google.com/g/2005#home");
    xml.UpdateAttrAt("gd:structuredPostalAddress", true, "rel", "http://schemas.google.com/g/2005#work");
    xml.UpdateAttrAt("gd:structuredPostalAddress", true, "primary", "true");
    xml.UpdateChildContent("gd:structuredPostalAddress|gd:city", "Mountain View");
    xml.UpdateChildContent("gd:structuredPostalAddress|gd:street", "1600 Amphitheatre Pkwy");
    xml.UpdateChildContent("gd:structuredPostalAddress|gd:region", "CA");
    xml.UpdateChildContent("gd:structuredPostalAddress|gd:postcode", "94043");
    xml.UpdateChildContent("gd:structuredPostalAddress|gd:country", "United States");
    xml.UpdateChildContent("gd:structuredPostalAddress|gd:formattedAddress", "1600 Amphitheatre Pkwy Mountain View");

    console.log(xml.GetXml());

    // Created the following XML:

    // 	<?xml version="1.0" encoding="utf-8" ?>
    // 	<atom:entry xmlns:atom="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005">
    // 	    <atom:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/contact/2008#contact" />
    // 	    <gd:name>
    // 	        <gd:givenName>Elizabeth</gd:givenName>
    // 	        <gd:familyName>Bennet</gd:familyName>
    // 	        <gd:fullName>Elizabeth Bennet</gd:fullName>
    // 	    </gd:name>
    // 	    <atom:content type="text">Notes</atom:content>
    // 	    <gd:email primary="true" displayName="E. Bennet" rel="http://schemas.google.com/g/2005#home" address="liz@example.org" />
    // 	    <gd:phoneNumber primary="true" rel="http://schemas.google.com/g/2005#home">(206)555-1213</gd:phoneNumber>
    // 	    <gd:im address="liz@gmail.com" protocol="http://schemas.google.com/g/2005#GOOGLE_TALK" primary="true" rel="http://schemas.google.com/g/2005#home" />
    // 	    <gd:structuredPostalAddress rel="http://schemas.google.com/g/2005#work" primary="true">
    // 	        <gd:city>Mountain View</gd:city>
    // 	        <gd:street>1600 Amphitheatre Pkwy</gd:street>
    // 	        <gd:region>CA</gd:region>
    // 	        <gd:postcode>94043</gd:postcode>
    // 	        <gd:country>United States</gd:country>
    // 	        <gd:formattedAddress>1600 Amphitheatre Pkwy Mountain View</gd:formattedAddress>
    // 	    </gd:structuredPostalAddress>
    // 	</atom:entry>

    // --------------------------------------------------------------------------------------------------------
    // Note: The code for setting up the Chilkat REST object and making the initial connection can be done once.
    // Once connected, the REST object may be re-used for many REST API calls.
    // (It's a good idea to put the connection setup code in a separate function/subroutine.)
    // --------------------------------------------------------------------------------------------------------

    // It is assumed we previously obtained an OAuth2 access token.
    // This example loads the JSON access token file 
    // saved by this example: Get Google Contacts OAuth2 Access Token

    var jsonToken = new chilkat.JsonObject();
    var success = jsonToken.LoadFile("qa_data/tokens/googleContacts.json");
    if (success !== true) {
        console.log("Failed to load googleContacts.json");
        return;
    }

    var gAuth = new chilkat.AuthGoogle();
    gAuth.AccessToken = jsonToken.StringOf("access_token");

    var rest = new chilkat.Rest();

    // Connect using TLS.
    var bAutoReconnect = true;
    success = rest.Connect("www.google.com", 443, true, bAutoReconnect);

    // Provide the authentication credentials (i.e. the access token)
    rest.SetAuthGoogle(gAuth);

    // ----------------------------------------------
    // OK, the REST connection setup is completed..
    // ----------------------------------------------

    // To create a contact, we need to send the following:

    // 	POST /m8/feeds/contacts/default/full
    // 	Content-Type: application/atom+xml
    // 	GData-Version: 3.0

    rest.AddHeader("Content-Type", "application/atom+xml");
    rest.AddHeader("GData-Version", "3.0");

    var sbRequestBody = new chilkat.StringBuilder();
    var sbResponseBody = new chilkat.StringBuilder();
    xml.GetXmlSb(sbRequestBody);
    success = rest.FullRequestSb("POST", "/m8/feeds/contacts/default/full", sbRequestBody, sbResponseBody);
    if (success !== true) {
        console.log(rest.LastErrorText);
        return;
    }

    // A successful response will have a status code equal to 201.
    if (rest.ResponseStatusCode !== 201) {
        console.log("response status code = " + rest.ResponseStatusCode);
        console.log("response status text = " + rest.ResponseStatusText);
        console.log("response header: " + rest.ResponseHeader);
        console.log("response body: " + sbResponseBody.GetAsString());
        return;
    }

    // If the 201 response was received, then the contact was successfully created,
    // and there is no response body.
    console.log("Contact created.");

}

chilkatExample();
