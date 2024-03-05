/**
 * @jest-environment jsdom
 */

// libraries
import "@testing-library/jest-dom";  //! added
import { screen, waitFor } from "@testing-library/dom"; //! added
import userEvent from "@testing-library/user-event"; //! added

// Mocks
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedBillsStore from "../__mocks__/store.js"; //! added

// internal components
import Bills from "../containers/Bills.js"; //! added
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { ROUTES } from "../constants/routes.js";//! added
import router from "../app/Router.js";

jest.mock("../app/store", () => mockedBillsStore); //! added

describe("When I am on the Bills Page", () => {
  test("Then bill icon in vertical layout should be highlighted", async () => {

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.Bills)
    await waitFor(() => screen.getByTestId('icon-window'))
    const windowIcon = screen.getByTestId('icon-window')
    //to-do write expect expression
    expect(windowIcon.getAttribute("class")).toContain("active-icon"); //! added

  })
  test("Then bills should be ordered from earliest to latest, in french date format", () => {
    document.body.innerHTML = BillsUI({ data: bills });
    const dates = screen.getAllByText(/^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/i).map(a => a.innerHTML);
    const antiChrono = (a, b) => (b - a);
    const datesSorted = [...dates].sort(antiChrono);
    expect(dates).toEqual(datesSorted);
  })
})


describe("When I click on the new bill button", () => {
  //* test 1
  test("a new bill form should appear", () => {

    //*  Setting of test environnement
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    const mockedBills = new Bills({
      document,
      onNavigate,
      store: mockedBillsStore
    });
    document.body.innerHTML = BillsUI({ data: bills });


    const mockHandleClickNewBill = jest.fn((e) => mockedBills.handleClickNewBill(e));
    const newBillBtn = screen.getByText('Nouvelle note de frais');
    newBillBtn.addEventListener("click", mockHandleClickNewBill);
    newBillBtn.click();
    expect(mockHandleClickNewBill).toHaveBeenCalled();
    const newBillPageTitle = screen.queryByText("Envoyer une note de frais");
    expect(newBillPageTitle).toBeDefined();
    document.body.innerHTML = "";
  });
});


describe('When I click to display the bill (on the eye icon)', () => {

  //* test 2
  test('A modal should open', async () => {

    //* setting test
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    window.localStorage.setItem("user", JSON.stringify({ type: "Employee", }));
    document.body.innerHTML = BillsUI({ data: bills });
    const mockedBills = new Bills({
      document,
      onNavigate,
      store: mockedBillsStore
    });

    const spyBillsClickonEye = jest.spyOn(mockedBills, 'handleClickIconEye');

    const eyeIconsNodeList = screen.getAllByTestId("icon-eye");
    eyeIconsNodeList.forEach((eyeIcon) =>
      eyeIcon.addEventListener('click', (e) => spyBillsClickonEye(eyeIcon))
    );
    userEvent.click(eyeIconsNodeList[0]);
    expect(spyBillsClickonEye).toHaveBeenCalled();
    await waitFor(() => document.getElementById("modaleFile"));
    const modal = document.getElementById('modaleFile');
    expect(modal).toBeVisible();
  });
});


//* testing errors of loading page (inspired from dashboard.js tests)
describe("Given I am connected as an employee, when an error occurs on API", () => {

  //* Preparing the environment for tests 3 and 4
  beforeEach(() => {
    jest.spyOn(mockedBillsStore, "bills");
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({ type: "Employee", email: "a@a" }));
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);
    router();
  });

  //* test 3
  test("fetches bills from an API and fails with 404 message error", async () => {

    mockedBillsStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });
    window.onNavigate(ROUTES_PATH.Bills);
    // process.nextTick is a fn Node.js : Allows to wait for all pending promises to be resolved before verifying the test results
    await new Promise(process.nextTick);
    const message404 = await screen.getByText(/Erreur 404/);
    expect(message404).toBeDefined();
  });

  //* test 4 
  test("fetches messages from an API and fails with 500 message error", async () => {
    mockedBillsStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });
    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message500 = await screen.getByText(/Erreur 500/);
    expect(message500).toBeDefined();
  });
});
