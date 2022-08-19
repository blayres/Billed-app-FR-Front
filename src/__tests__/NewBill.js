/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event';
import BillsUI from '../views/BillsUI.js';
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import '@testing-library/jest-dom';
import { localStorageMock } from '../__mocks__/localStorage';
import Store from '../app/Store.js'
import store from '../__mocks__/store';
import { ROUTES, ROUTES_PATH } from '../constants/routes';
import mockStore from "../__mocks__/store"
import { bills, newBill } from "../fixtures/bills.js";

// jest.mock("../app/store", () => mockStore)

// init onNavigate
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

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


 // TEST : handle attached file format
describe('When I am on NewBill Page and I add an attached file', () => {
  test('Then the file handler should be run', () => {
    document.body.innerHTML = NewBillUI();
    const newBill = new NewBill({
      document,
      onNavigate,
      Store: Store,
      localStorage: window.localStorage,
    });

    const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
    const attachedFile = screen.getByTestId('file');
    attachedFile.addEventListener('change', handleChangeFile);
    fireEvent.change(attachedFile, {
      target: {
        files: [new File(['file.txt'], 'file.txt', { type: 'text/txt' })],
      },
    });

    const numberOfFile = screen.getByTestId('file').files.length;
    expect(numberOfFile).toEqual(1);
  });
});


// TEST : submit correct form and attached file
describe('WHEN I am on NewBill page and I submit a correct form', () => {
  test('THEN I should be redirected to Bills page', () => {
    document.body.innerHTML = NewBillUI();
    const newBillContainer = new NewBill({
      document,
      onNavigate,
      Store: null,
      localStorage: window.localStorage,
    });

    const handleSubmit = jest.fn(newBillContainer.handleSubmit);
    newBillContainer.fileName = 'image.jpg';

    const newBillForm = screen.getByTestId('form-new-bill');
    newBillForm.addEventListener('submit', handleSubmit);
    fireEvent.submit(newBillForm);

    expect(handleSubmit).toHaveBeenCalled();
    expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
  });
});



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





// POST TESTS
describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page and submit the form', () => {
    test('Then it should generate a new bill', async () => {
      // spy
      // Cannot spy the post property because it is not a function
      // undefined given instead
      const postSpy = jest.spyOn(mockStore, 'bills');

      // new bill to submit
      const newBill = {
        id: '47qAXb6fIm2zOKkLzMro',
        vat: '80',
        fileUrl:
          'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
        status: 'pending',
        type: 'Hôtel et logement',
        commentary: 'séminaire billed',
        name: 'fake new bill',
        fileName: 'preview-facture-free-201801-pdf-1.jpg',
        date: '2004-04-04',
        frenchDate: '04-04-2004',
        amount: 400,
        commentAdmin: 'ok',
        email: 'a@a',
        pct: 20,
      };

      // get bills and the new bill
      const bills = await mockStore.post(newBill);

      // expected results
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(bills).toBe('fake new bill received');
    });

    // TEST : newBill fetch failure => 404 error
    test('Then the bill is added to the API but fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test('then it posts to API and fails with 500 message error on Bills page', async () => {
      // cannot read property 'mockImplementationOnce' of undefined
      mockStore.bills.mockImplementationOnce(() =>
        Promise.reject(new Error('Erreur 500'))
      );

      // DOM construction
      document.body.innerHTML = BillsUI({ error: 'Erreur 500' });

      // await for response
      const message = screen.getByText(/Erreur 500/);

      // expected result
      expect(message).toBeTruthy();
    });
  });
});





