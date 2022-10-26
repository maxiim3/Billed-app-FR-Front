/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router, {loadBillsUI} from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import billsUI from "../views/BillsUI.js";
import Router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import store from "../app/Store.js";


export async function antiChrono(a, b) {
    const [year_a, month_a, day_a] = a.split('-')
    const [year_b, month_b, day_b] = b.split('-')
    if (year_a !== year_b) return year_b - year_a
    if (month_a !== month_b) return month_b - month_a
    return day_b - day_a
}


export async function connectAsEmployee() {
    Object.defineProperty(window, 'localStorage', {value: localStorageMock})
    window.localStorage.setItem('user', JSON.stringify({type: "Employee"}))
}

export async function loadRoutes(path) {
    await connectAsEmployee()
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)

    router()
    window.onNavigate(path)
}

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page, and the page is loaded", () => {
        test("Then the window icon should be highlighted", async () => {
            await loadRoutes(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            expect(windowIcon.className).toEqual("active-icon")
        })
        test("Then the table should have as much tableRows as mocked data", async () => {
            await connectAsEmployee()
            document.body.innerHTML = billsUI({data: bills, error: false, loading: false})
            await waitFor(() => screen.getByTestId('tbody'))
            const tBody = screen.getByTestId('tbody')
            const getRows = [...tBody.childNodes].filter(node => node instanceof HTMLTableRowElement)
            expect(getRows).toHaveLength(bills.length)
        })
        test("Then the bills should be ordered from earliest to latest", async () => {
            await connectAsEmployee()
            document.body.innerHTML = await BillsUI({data: bills, error: false, loading: false})

            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
            const datesSorted = dates.sort((a, b) => antiChrono(a, b))
            expect(dates).toEqual(datesSorted)
        })
    })
    describe('When I am on Bills page, and I click the button to create a New Bill', () => {
        test('Then I navigate to /#employee/bill/new', async () => {
            await connectAsEmployee()
            document.body.innerHTML = await BillsUI({data: bills, error: false, loading: false})

            await waitFor(() => screen.getByTestId("btn-new-bill"))
            const btn = screen.getByTestId("btn-new-bill")
            const mockFn = jest.fn(async () => await loadRoutes(ROUTES_PATH.NewBill))
            btn.onclick = () => mockFn()

            await userEvent.click(btn)
            expect(mockFn).toHaveBeenCalled()
            expect(window.location.hash === "#employee/bill/new").toBeTruthy()
        })
    })
    describe('When I am on Bills page, and I call handleClickNewBill from container/Bills', () => {
        test('Then I navigate to /#employee/bill/new', async () => {
            await loadRoutes(ROUTES_PATH.Bills)
            const onNavigate = () => window.onNavigate(ROUTES_PATH['NewBill'])
            const containerBills = new Bills({document, onNavigate, store, localStorage})
            const mockHandleClickNewBill = jest.fn(() => containerBills.handleClickNewBill())
            mockHandleClickNewBill()
            expect(window.location.hash === "#employee/bill/new").toBeTruthy()
        })
    })
    describe("Given i added a new bill is properly", () => {
        test.todo("Then it should be added to the BillsUI")
        test.todo("Then the bills' name should be correct")
        test.todo("Then the bills' date should be correct")
        test.todo("Then the bills' price should be correct")
        test.todo("Then the bills' status should be 'Pending'")
        describe("when I click on the eye icon of the new bill", () => {
            test.todo("then the modal should be open")
            test.todo("then the bill's image should be displayed in the modal")
        })
    })
})
