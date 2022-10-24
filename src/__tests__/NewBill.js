/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"

import {ROUTES_PATH} from "../constants/routes.js";
import {loadBillsPage} from "./Bills.js";


describe("Given I am connected as an employee", () => {
    describe("Given I am on NewBills page", () => {
        it("Should highlight the mail icon", async () => {
            await loadBillsPage()
            window.onNavigate(ROUTES_PATH.NewBill)
            await waitFor(() => screen.getByTestId('icon-mail'))
            const mailIcon = screen.getByTestId('icon-mail')
            console.log(mailIcon)
            expect(mailIcon.classList.contains("active-icon")).toBe(true)
        })
    })
})
