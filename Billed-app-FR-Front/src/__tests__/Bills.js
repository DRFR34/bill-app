/**
 * @jest-environment jsdom
 */

/*-------ADDING THE FOLLOWING LINE------*/
import "@testing-library/jest-dom";
import { screen, waitFor} from "@testing-library/dom"; //! added
import userEvent from "@testing-library/user-event"; //! added
import Bills from "../containers/Bills.js"; //! added
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"; //! added
import { ROUTES } from "../constants/routes.js";//! added
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore); //! added

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
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

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => (b - a);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    })
  })
})
