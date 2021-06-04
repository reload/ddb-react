describe("Order material", () => {
  it("Should display message if library does not support ILL", () => {
    cy.server();

    cy.route({
      method: "GET",
      url: "https://openplatform.dbc.dk/v3/libraries*",
      status: 200,
      response: {
        statusCode: 200,
        data: [{ willReceiveIll: "0" }]
      }
    });

    cy.route({
      method: "GET",
      url: "https://lollandbib.dk/ding_ill/openholdingstatus/*",
      status: 200,
      response: { canBeOrdered: false }
    });

    cy.visit("/iframe.html?id=apps-order-material--entry");

    cy.contains("Bestil materiale").should("not.exist");
    cy.contains("Dit afhentningsbibliotek modtager ikke fjernlån");
  });

  [
    {
      title: "Should display message if a single material can't be ordered",
      orderable: false,
      openholdingstatus: { canBeOrdered: false}
    },
    {
      title: "Should display message if a single material can't be lent",
      orderable: false,
      openholdingstatus: { canBeOrdered: false}
    },
    {
      title: "Should display message if a set of materials can't be ordered",
      orderable: false,
      openholdingstatus: { canBeOrdered: false}
    },
    {
      title: "Should display button if a single material can be ordered",
      orderable: true,
      openholdingstatus: { canBeOrdered: true}
    },
    {
      title: "Should display button if a set of materials can be ordered",
      orderable: true,
      openholdingstatus: { canBeOrdered: true}
    }
  ].forEach(scenario => {
    it(scenario.title, () => {
      cy.server();
      cy.route({
        method: "GET",
        url: "https://openplatform.dbc.dk/v3/libraries*",
        status: 200,
        response: {
          statusCode: 200,
          data: [{ willReceiveIll: "1" }]
        }
      });

      cy.route({
        method: "GET",
        url: "https://lollandbib.dk/ding_ill/openholdingstatus*",
        status: 200,
        response: scenario.openholdingstatus
      });

      cy.visit("/iframe.html?id=apps-order-material--entry");

      if (scenario.orderable) {
        cy.contains("Bestil materiale");
      } else {
        cy.contains("Bestil materiale").should("not.exist");
        cy.contains("Kan ikke fjernlånes");
      }
    });
  });

  it("Should send order request to OpenPlatform when clicked", () => {
    cy.server();
    cy.route({
      method: "GET",
      url: "https://openplatform.dbc.dk/v3/libraries*",
      status: 200,
      response: {
        statusCode: 200,
        data: [
          {
            willReceiveIll: "1",
            orderParameters: ["name", "address", "email", "phone"]
          }
        ]
      }
    });

    cy.route({
      method: "GET",
      url: "https://openplatform.dbc.dk/v3/user*",
      status: 200,
      response: {
        statusCode: 200,
        data: [
          {
            name: "name",
            address: "address",
            mail: "mail"
          }
        ]
      }
    });

    cy.route({
      method: "POST",
      url: "https://openplatform.dbc.dk/v3/order*",
      status: 200,
      response: {
        statusCode: 200,
        data: []
      }
    }).as("orderRequest");

    cy.visit("/iframe.html?id=apps-order-material--entry");

    cy.contains("Bestil materiale").click();
    cy.contains("Bestilt");
  });
});
