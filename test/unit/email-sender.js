const assert = require("assert");
const simple = require("simple-mock");
const querystring = require("querystring");

const emailSender = require("../../src/email-sender");
const apiClient = {request() {}};

describe("Email Sender - Unit", () => {

  it("should invoke external API to send email", () => {

    simple.mock(apiClient, "request").resolveWith({
      status: 200,
      body: '{"success": true}'
    });

    const parameters = {
      from: "support@risevision.com",
      fromName: "Rise Vision Support",
      recipients: "b@example.com",
      subject: "Display Monitoring: Main Hall disconnected and is now offline"
    };

    return emailSender.send(parameters, 'content', apiClient)
      .then(() => {
        assert.ok(apiClient.request.called);

        const {url, data} = apiClient.request.lastCall.arg;

        const [resource, parameterString] = url.split('?');
        assert.equal(resource, "https://rvaserver2.appspot.com/_ah/api/rise/v0/email");

        const queryParams = querystring.parse(parameterString);

        assert.equal(queryParams.from, "support@risevision.com");
        assert.equal(queryParams.fromName, "Rise Vision Support");
        assert.equal(queryParams.recipients, 'b@example.com');
        assert.equal(queryParams.subject, "Display Monitoring: Main Hall disconnected and is now offline");

        assert.equal(data.text, 'content');
      });
  });

});
