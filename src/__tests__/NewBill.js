/**
 * @jest-environment jsdom
 */

 import { screen, fireEvent, waitFor } from "@testing-library/dom"
 import NewBillUI from "../views/NewBillUI.js"
 import NewBill from "../containers/NewBill.js"
 import { localStorageMock } from "../__mocks__/localStorage.js"
 import mockStore from "../__mocks__/store"
 import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
 import userEvent from "@testing-library/user-event";
 import router from "../app/Router";

 jest.mock("../app/Store", () => mockStore)


// init onNavigate
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

beforeEach(() => {
  //On simule la connection sur la page Employee en parametrant le localStorage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee',
    email: 'employee@test.tld'
  }))
  // Afficher la page nouvelle note de frais
  document.body.innerHTML = NewBillUI()
})

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the newBill page should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
    
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );

      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
    })
 
    test('Then a form with nine fields should be rendered', () => {
      document.body.innerHTML = NewBillUI();
      const form = document.querySelector('form');
      expect(form.length).toEqual(9);
    });
  })
})



describe('When I am on NewBill page and I submit a wrong attached file format', () => {
  // TEST : wrong attached file format
  test('Then the error message should be displayed', () => {});

  // DOM construction
  document.body.innerHTML = NewBillUI();

  // get DOM element
  const newBillContainer = new NewBill({
    document,
    onNavigate,
    Store: null,
    localStorage: window.localStorage,
  });

  const handleChangeFile = jest.fn(newBillContainer.handleChangeFile);

  const attachedFile = screen.getByTestId('file');
  attachedFile.addEventListener('change', handleChangeFile);
  fireEvent.change(attachedFile, {
    target: {
      files: [
        new File(['document.pdf'], 'document.pdf', {
          type: 'application/pdf',
        }),
      ],
    },
  });

  // expected results
  expect(handleChangeFile).toHaveBeenCalled();
  expect(attachedFile.files[0].name).toBe('document.pdf');

  // get DOM element
  const errorMessage = screen.getByTestId('fileFormat-errorMessage');

  // expected results
  expect(errorMessage.textContent).toEqual(
    expect.stringContaining(
      'Votre justificatif doit être une image de format (.jpg) ou (.jpeg) ou (.png)'
    )
  );
});



// POST TEST submit form
describe("NewBill Integration Test Suites", () => {
  describe("Given I am a user connected as an employee", () => {
    describe("When I am on NewBill", () => {
      test("Then I submit completed NewBill form and I am redirected on Bill, methode Post", async() => {
      // route
      document.body.innerHTML = `<div id="root"></div>`;
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      // value for Expense-name
      const expenseName = screen.getByTestId("expense-name")
      expenseName.value = 'vol'
      // value for Datepicker
      const datepicker = screen.getByTestId("datepicker")
      datepicker.value = '2022-08-22'
      // value for Amount
      const amount = screen.getByTestId("amount")
      amount.value = '300'
      // value for Vat
      const vat = screen.getByTestId("vat")
      vat.value ='40'
      // value for Pct
      const pct = screen.getByTestId("pct")
      pct.value ='50'
      // File and fireEvent
      const file = screen.getByTestId("file")
      fireEvent.change(file, {
        target: {
          files: [new File(['image.png'], 'image.png', { type: 'image/png'})],
        },
      })
      // Form Submission
      const formSubmission = screen.getByTestId("form-new-bill")
      const newBillEmulation = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
     
      const handleSubmit = jest.fn((e) => newBillEmulation.handleSubmit(e))
      // addEventListener on form
      formSubmission.addEventListener('submit', handleSubmit)
      fireEvent.submit(formSubmission)
      expect(handleSubmit).toHaveBeenCalled()
      await waitFor(() => screen.getAllByText("Mes notes de frais"))
      expect(screen.getByTestId('btn-new-bill')).toBeTruthy()
     })
    })
  })
})




