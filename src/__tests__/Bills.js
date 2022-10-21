/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import {ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        it("Should highlight the window icon", async () => {

            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            window.localStorage.setItem('user', JSON.stringify({
                                                                   type: "Employee",
                                                                   password: "employee",
                                                                   email: "employee@test.tld",
                                                                   status: "connected"
                                                               }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            expect(windowIcon.className).toBe("active-icon")
        })
        it("Should ordered order the bills from earliest to latest", () => {
                 document.body.innerHTML = BillsUI({data: bills})
                 let regExp = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i;
                 const antiChrono = (a, b) => {
                     const [year_a, month_a, day_a] = a.split('-')
                     const [year_b, month_b, day_b] = b.split('-')
                     if (year_a !== year_b) return year_b - year_a
                     if (month_a !== month_b) return month_b - month_a
                     return day_b - day_a
                 }
                 const dates = screen.getAllByText(regExp).map(a => a.innerHTML)
                 const datesSorted = dates.sort(antiChrono)
                 expect(dates).toEqual(datesSorted)
             }
        )
    })
})

