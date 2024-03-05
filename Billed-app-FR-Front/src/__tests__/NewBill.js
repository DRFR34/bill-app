/**
 * @jest-environment jsdom
 */

// libraries
import "@testing-library/jest-dom"; //! added
import { fireEvent, screen} from "@testing-library/dom";//! added

// Mocks
import { localStorageMock } from "../__mocks__/localStorage.js";//! added
import mockedBillsStore from "../__mocks__/store";//! added

// internal components
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes";//! added
import router from "../app/Router";//! added

// Mocked data
jest.mock("../app/store", () => mockedBillsStore);


describe("Given I am connected as an employee", () => {

  //* setting environnement
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
  );

  //  add a root div in DOM, necessary to use the fn router()
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();

  describe("When I am on NewBill Page", () => {

    let newBillMocked;

    beforeEach(async () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      await new Promise(process.nextTick); //  prevents the side effects of onNavigate

      newBillMocked = new NewBill({
        document,
        onNavigate,
        mockedBillsStore,
        localStorage: window.localStorage
      });
    });

    afterEach(() => {
      newBillMocked = null; 
    });

    //* test 1
    // test("Then the div containing the text 'Envoyer une note de frais' is available", async () => {
    test("Then the div containing the text 'Envoyer une note de frais' is available", () => {
      const pageTitleTested =  screen.getByText("Envoyer une note de frais");
      const formNewBillTested = screen.getByTestId("form-new-bill");
      expect(pageTitleTested).toBeVisible();
      expect(formNewBillTested).toBeDefined();
    });

    //* test 2
    test("Then mail icon in vertical layout should be highlighted", () => {
      const mailIconTested  = screen.getByTestId("icon-mail");
      expect(mailIconTested ).toBeVisible();
    });

    //* test 3
    test("all the form's fields should be empty", () => {
      expect(screen.getByTestId("expense-name").value).toBe("");
      expect(screen.getByTestId("datepicker").value).toBe("");
      expect(screen.getByTestId("amount").value).toBe("");
      expect(screen.getByTestId("vat").value).toBe("");
      expect(screen.getByTestId("pct").value).toBe("");
      expect(screen.getByTestId("file").value).toBe("");
    })

    //* test 4 
    test("I should stay on the new Bill page, if I submit the form with empty fields", () => {
      const formNewBillTested = screen.getByTestId("form-new-bill");
      const handleSubmitSpy = jest.spyOn(newBillMocked, 'handleSubmit');
      formNewBillTested.addEventListener("submit", handleSubmitSpy);
      fireEvent.submit(formNewBillTested);

      expect(handleSubmitSpy).toHaveBeenCalled();
      expect(formNewBillTested).toBeDefined();
    });

    describe("when the user load a file with the wrong format", () => {

      //* test 5
      test("Then the error message should be displayed, and the submit button should be disabled", () => {
        document.body.innerHTML = NewBillUI();
        const file = new File(["invalid format"], "invalid format.pdf", { type: "document/pdf" });
        const inputFileTested = screen.getByTestId("file");
        const handleChangeFileSpy = jest.spyOn(newBillMocked, 'handleChangeFile');
        inputFileTested.addEventListener("change", handleChangeFileSpy);

        fireEvent.change(inputFileTested, { target: { files: [file] } });

        let errorMessageTested = screen.getByTestId('error-message');
        expect(errorMessageTested.textContent).toEqual("Seuls les formats : jpg , jpeg et png sont acceptés")

        const SubmitBtnTested = screen.getByText('Envoyer')
        expect(SubmitBtnTested).toBeDisabled()
      });
    });
  });
});

