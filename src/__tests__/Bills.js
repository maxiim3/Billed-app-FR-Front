/**
 * @jest-environment jsdom
 */

import {findAllByTestId, fireEvent, getAllByTestId, getByTestId, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import {ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";

import router from "../app/Router.js";
// todo Pourquoi le fichier ne s'appelle pas bills.test.unit.js  ou bills.test.js ?


describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        it("Should highlight the window icon", async () => {
            await loadBillsPage()
            await waitFor(() => getByTestId('icon-window'))
            const windowIcon = getByTestId('icon-window')
            expect(windowIcon.classList.contains("active-icon")).toBe(true)
        })
        it("Should ordered order the bills from earliest to latest", async () => {
            await loadBillsUIOnly()
            const dates = await getDates();
            const datesSorted = dates.sort((a, b) => antiChrono(a, b))
            expect(dates).toEqual(datesSorted)
        })
        it('should open the modal', async function () {
            await loadBillsPage()
            await waitFor(() => getByTestId('icon-window'))
            const windowIcon = getByTestId('icon-window')
            expect(windowIcon.classList.contains("active-icon")).toBe(true)

        });
    })

})

export async function antiChrono(a, b) {
    const [year_a, month_a, day_a] = a.split('-')
    const [year_b, month_b, day_b] = b.split('-')
    if (year_a !== year_b) return year_b - year_a
    if (month_a !== month_b) return month_b - month_a
    return day_b - day_a
}

export async function getDates() {
    let regExp = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i;
    return screen.getAllByText(regExp).map(a => a.innerHTML);
}

export async function loadBillsPage() {
    Object.defineProperty(window, 'localStorage', {value: localStorageMock})
    window.localStorage.setItem('user', JSON.stringify({type: "Employee"}))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    return window.onNavigate(ROUTES_PATH.Bills)
}

export async function loadBillsUIOnly() {
    return document.body.innerHTML = BillsUI({data: bills})
}

