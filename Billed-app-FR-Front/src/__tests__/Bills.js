/**
 * @jest-environment jsdom
 */

// libraries
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

// Mocks
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedBillsStore from "../__mocks__/store.js";

// internal components
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockedBillsStore);

describe('Given I am connected as an employee', () => {
  //  environment setup
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    const root = document.createElement("div");//  add a root div in DOM is necessary to use the fn router()
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
  });

  //  tests teardown
  afterEach(() => {
    document.body.innerHTML = "";
    jest.restoreAllMocks();
  });

  describe("When I am on the Bills Page", () => {
    //* test 1 ( the expect expression was added)
    test("Then bill icon in vertical layout should be highlighted", () => {
      window.onNavigate(ROUTES_PATH.Bills);
      // await waitFor(() => screen.getByTestId('icon-window'));
      const windowIconTested = screen.getByTestId('icon-window');
      //  added expect expression
      expect(windowIconTested.getAttribute("class")).toContain("active-icon");
    });

    //* test 2 (the original test is modified for running with  french format dates)
    test("Then bills should be ordered from earliest to latest, in french date format", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      //  previous code:
      // const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      //const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesTested = screen.getAllByText(/^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => (b - a);
      const datesSorted = [...datesTested].sort(antiChrono);

      expect(datesTested).toEqual(datesSorted);
    });
  });

  describe("When I click on the new bill button", () => {

    //* test 3
    test("a new bill form should appear", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const billsMocked = new Bills({
        document,
        onNavigate,
        store: mockedBillsStore
      });
      const handleClickNewBillSpy = jest.spyOn(billsMocked, 'handleClickNewBill');
      const newBillBtnTested = screen.getByText('Nouvelle note de frais');
      const newBillPageTitleTested = screen.queryByText("Envoyer une note de frais");
      const newBillUploadBtnTested = screen.queryByText("Choisir un fichier");
      const newBillFormTested = screen.findByTestId("form-new-bill");
      newBillBtnTested.addEventListener("click", handleClickNewBillSpy);
      newBillBtnTested.click();

      expect(handleClickNewBillSpy).toHaveBeenCalled();
      expect(newBillPageTitleTested).toBeDefined();
      expect(newBillUploadBtnTested).toBeDefined();
      expect(newBillFormTested).toBeDefined();
    });
  });

  describe('When I click to display the bill (on the eye icon)', () => {

    //* test 4
    test('A modal should open', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const billsMocked = new Bills({
        document,
        onNavigate,
        store: mockedBillsStore
      });

      const spyBillsClickonEye = jest.spyOn(billsMocked, 'handleClickIconEye');

      const eyeIconsNodeList = screen.getAllByTestId("icon-eye");
      eyeIconsNodeList.forEach((eyeIcon) =>
        eyeIcon.addEventListener('click', (e) => spyBillsClickonEye(eyeIcon))
      );
      userEvent.click(eyeIconsNodeList[0]);
      expect(spyBillsClickonEye).toHaveBeenCalled();
      const modal = document.getElementById('modaleFile');
      expect(modal).toBeVisible();
    });
  });

  describe("Given I am connected as an employee, when an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockedBillsStore, "bills");
      window.localStorage.setItem('user', JSON.stringify({ type: "Employee", email: "a@a" }));
    });

    //* test 5
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockedBillsStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      await waitFor(() => {
        const message404Tested = screen.getByText(/Erreur 404/);
        expect(message404Tested).toBeDefined();
      });
    });

    //* test 6
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
      await waitFor(() => {
        const message500Tested = screen.getByText(/Erreur 500/);
        expect(message500Tested).toBeDefined();
      });
    });
  });
});
