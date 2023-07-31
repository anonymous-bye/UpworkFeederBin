// ==UserScript==
// @name         Upwork Feeder
// @namespace    http://valloon.me/
// @version      23.07.15
// @description  automatically apply on upwork jobs
// @author       Valloon
// @match        https://www.upwork.com/*
// @match        http://web.valloon.me/*
// @match        http://localhost/*
// @icon         https://www.upwork.com/favicons.ico
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

// @require http://code.jquery.com/jquery-latest.js


const SERVER_URL = "http://localhost";
// const SERVER_URL = "http://web.valloon.me";
const CHANNELS = 0;


(async function() {
    'use strict';
    GM_addStyle(`.up-placeholder-shape{animation: none !important;background: #e1f2d9 !important;}.up-modal-backdrop{background: none !important;}`);

    function alertBig(message) {
        let alertBox=document.querySelector("#zzz-alert-big");
        if(alertBox){
            alertBox.innerText=message;
        }else{
            alertBox = document.createElement("button");
            alertBox.id="zzz-alert-big";
            alertBox.style.cssText = "position: fixed;bottom: 10rem;right: 2rem;min-width: 4rem;height: 4rem;border-radius: 10rem;text-align: center;font-size: 1.5rem;color: rgb(255, 255, 255);background: #ff0000a0;z-index: 999999;"
            alertBox.innerText = message;
            alertBox.onclick=function(e){
                if(this.stop){
                    this.stop=false;
                    alertBox.style.opacity="1";
                }else{
                    this.stop=true;
                    alertBox.style.opacity=".5";
                }
            }
            alertBox.oncontextmenu=function(e){
                e.preventDefault();
                alert("Click OK to continue");
            }
            document.body.appendChild(alertBox);
        }
        return alertBox.stop;
    }

    function alertMessage(message, onclick) {
        let alertMessage=document.querySelector("#zzz-alert-message");
        if(!message){
            alertMessage && alertMessage.remove();
        } else if(alertMessage){
            alertMessage.innerText=message;
            document.title=message;
        }else{
            alertMessage = document.createElement("label");
            alertMessage.id="zzz-alert-message";
            alertMessage.style.cssText = "position: fixed;top: 7rem;right: 0.5rem;padding: 0.25rem 0.75rem;border-radius: 1rem;color: #fff;background: #00f;opacity: .75;z-index: 999999;pointer-events: none;"
            alertMessage.innerText = message;
            (typeof onclick==="function") && (alertMessage.onclick=onclick);
            document.body.appendChild(alertMessage);
            document.title=message;
        }
    }

    function alertMessageNext(message, onclick) {
        let alreadyCount=document.querySelectorAll(".zzz-alert-messages").length;
        let alertMessage = document.createElement("label");
        alertMessage.className="zzz-alert-messages";
        alertMessage.style.cssText = `position: fixed;top: ${9+alreadyCount*2}rem;right: 0.5rem;padding: 0.25rem 0.75rem;border-radius: 1rem;color: #fff;background: #00f;opacity: .75;z-index: 999999;pointer-events: none;`
        alertMessage.innerText = message;
        (typeof onclick==="function") && (alertMessage.onclick=onclick);
        document.body.appendChild(alertMessage);
        document.title=message;
    }

    let exitTimeout=-1;
    (async function(){
        while (true) {
            if(exitTimeout>=0){
                if(!alertBig(exitTimeout)){
                    if(exitTimeout==0){
                        location.href=`${SERVER_URL}/api/v2/apply/history/today`;
                        await new Promise(resolve => setTimeout(resolve, 30000));
                        return;
                    }
                    exitTimeout--;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    })();

    async function putApplyState(applyData, state) {
        try {
            const response = await fetch(`${SERVER_URL}/api/v2/apply/${applyData.email}/${applyData.jobId}/state`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    state: state,
                })
            });
            const data = await response.json();
            console.log(`putApplyState (${state}):`);
            console.log(data);
            !data.success && alertMessage(`failed to put apply state: ${data.error}`);
            return data;
        } catch (error) {
            console.error('Error:', error);
            alertMessage(error);
            return false;
        }
    }

    async function deleteApply(applyData, message) {
        try {
            const response = await fetch(`${SERVER_URL}/api/v2/apply/${applyData.email}/${applyData.jobId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    message: message,
                })
            });
            const data = await response.json();
            console.log(`deleteApply (${message}):`);
            console.log(data);
            !data.success && alertMessage(`failed to delete apply: ${data.error}`);
            return data;
        } catch (error) {
            console.error('Error:', error);
            alertMessage(error);
            return false;
        }
    }

    async function applyNextEmail(applyData, reason) {
        try {
            const response = await fetch(`${SERVER_URL}/api/v2/apply/${applyData.email}/${applyData.jobId}/nextEmail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    reason: reason,
                })
            });
            const data = await response.json();
            console.log(`applyNextEmail: ${data.email} -> ${data.newEmail}`);
            console.log(data);
            if(data.success){
                alertMessageNext(`${data.email.split("@")[0]} -> ${data.newEmail.split("@")[0]}`);
            }else{
                alertMessageNext(`failed to apply next: ${data.error}`);
            }
            return data;
        } catch (error) {
            console.error('Error:', error);
            alertMessage(error);
            return error;
        }
    }

    if(location.href.startsWith(SERVER_URL)){
        GM_deleteValue("applyData");
        let tryCount=0;
        while (true) {
            if(!alertBig(tryCount)){
                if(tryCount>0){
                    console.log(`Retrying to get apply data... ${tryCount}`);
                    try {
                        const response = await fetch(`${SERVER_URL}/api/v2/apply/next?channels=${CHANNELS}&try=${tryCount}`);
                        const applyData = await response.json();
                        if (applyData.success) {
                            alertMessage(`${applyData.jobId}`);
                            let url = `https://www.upwork.com/ab/account-security/login?redir=%2Fab%2Fproposals%2Fjob%2F${applyData.jobId}%2Fapply%2F`;
                            location.href=url;
                            return;
                        }
                        alertMessage();
                        document.title=`${tryCount} on channel ${CHANNELS}`;
                    } catch (error) {
                        console.error(`Error (${tryCount}):`, error);
                        alertMessage(`${error} (${tryCount})`);
                    }
                }
                tryCount++;
            }
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }else if(location.pathname.includes('/account-security/login')){
        exitTimeout=30;
        try {
            const response = await fetch(`${SERVER_URL}/api/v2/apply/next?channels=${CHANNELS}`);
            const applyData = await response.json();
            if (applyData.success) {
                if(!location.href.includes(`/account-security/login?redir=%2Fab%2Fproposals%2Fjob%2F${applyData.jobId}%2Fapply%2F`)){
                    let url = `https://www.upwork.com/ab/account-security/login?redir=%2Fab%2Fproposals%2Fjob%2F${applyData.jobId}%2Fapply%2F`;
                    location.href=url;
                    await new Promise(resolve => setTimeout(resolve, 30000));
                    return;
                }
                GM_setValue("applyData", applyData);
                for (let i = 0; i < 10; i++) {
                    let emailInput = document.querySelector("#login_username");
                    let passwordInput = document.querySelector("#login_password");
                    let loginPasswordCountinueButton = document.querySelector("#login_password_continue");
                    let loginControlContinueButton = document.querySelector("#login_control_continue");
                    if (emailInput && !emailInput.disabled && loginPasswordCountinueButton && !loginPasswordCountinueButton.disabled) {
                        if ([...document.querySelectorAll("span")].filter(a => a.innerText.includes("Username is incorrect")).length) {
                            alertMessage(`not-exist: ${applyData.email}`);
                            await applyNextEmail(applyData, "not-exist");
                            exitTimeout=1;
                            break;
                        }
                        if([...document.querySelectorAll("[role=alert]")].filter(a => a.innerText.includes("Your account is suspended")).length){
                            alertMessage(`suspended: ${applyData.email}`);
                            await applyNextEmail(applyData, "suspended");
                            exitTimeout=1;
                            break;
                        }
                        emailInput.value = applyData.email;
                        emailInput.dispatchEvent(new Event("input"));
                        loginPasswordCountinueButton.click();
                    } else if (passwordInput && !passwordInput.disabled && loginControlContinueButton && !loginControlContinueButton.disabled) {
                        if ([...document.querySelectorAll("span")].filter(a => a.innerText.includes("Password is incorrect")).length) {
                            alertMessage(`password-invalid: ${applyData.email}`);
                            await applyNextEmail(applyData, "password-invalid");
                            exitTimeout=1;
                            break;
                        }
                        if (document.querySelectorAll("[role=alert]").length) {
                            document.querySelector(".not-you").click();
                        } else {
                            passwordInput.value = applyData.password;
                            document.querySelector("#login_rememberme").checked = true;
                            passwordInput.dispatchEvent(new Event("input"));
                            await putApplyState(applyData, "$logined");
                            loginControlContinueButton.click();
                            await new Promise(resolve => setTimeout(resolve, 3000));
                        }
                    } else {
                        console.log(`Retrying to login... ${i}`);
                    }
                    [...document.querySelectorAll("button")].filter(a => a.innerText.trim() == "Accept All").forEach(a => a.click());
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }else{
                exitTimeout=3;
            }
        } catch (error) {
            console.error('Error:', error);
            alertMessage(error);
        }
    } else if (location.pathname.includes('/proposals/job/')) {
        exitTimeout=60;
        let applyData=GM_getValue("applyData");
        let checkBreakConfirmed;
        let scrollToBottomTimeout = setTimeout(function () { unsafeWindow.scrollTo(0, document.body.scrollHeight); }, 6000);
        {
            let emailLabel = document.createElement("label");
            emailLabel.style.cssText = "position: fixed;top: 4rem;right: 0.5rem;padding: 0.25rem 0.75rem;border-radius: 1rem;color: #fff;background: #f00;opacity: .75;z-index: 999999;"
            emailLabel.innerText = applyData.email;
            document.body.appendChild(emailLabel);
        }

        async function checkBreak() {
            [...document.querySelectorAll("button")].filter(a => a.innerText.trim() == "Close").forEach(a => a.click());
            [...document.querySelectorAll("button")].filter(a => a.innerText.trim() == "Accept All").forEach(a => a.click());
            document.querySelectorAll(".nav-popover-close-btn").forEach(a => a.click());

            if (checkBreakConfirmed) return true;
            if ([...document.querySelectorAll("[role=alert]")].filter(a => a.innerText.includes("This job is no longer available.")).length
                || [...document.querySelectorAll("[role=alert]")].filter(a => a.innerText.includes("This Job posting was removed")).length
                || [...document.querySelectorAll("[role=alert]")].filter(a => a.innerText.includes("This job is private. Only freelancers invited by client can view this job.")).length
                || [...document.querySelectorAll("p")].filter(a => a.innerText.includes("This job is private. Only freelancers invited by client can view this job.")).length
                || [...document.querySelectorAll("p")].filter(a => a.innerText.includes("You can't submit a proposal if you don't meet")).length) {
                checkBreakConfirmed = true;
                clearTimeout(scrollToBottomTimeout);
                unsafeWindow.scrollTo(0, 0);
                console.log("unavailable or private job");
                alertMessage("unavailable or private job")
                await deleteApply(applyData, "unavailable or private job");
                exitTimeout=3;
                return true;
            }
            if ([...document.querySelectorAll("p")].filter(a => a.innerText.includes("You don’t have enough Connects to submit this proposal.") || a.innerText.includes("Your available connects is less than required")).length
                || [...document.querySelectorAll("span.error-label")].filter(a => a.innerText.includes("Insufficient connects to submit proposal for the job.")).length) {
                checkBreakConfirmed = true;
                clearTimeout(scrollToBottomTimeout);
                unsafeWindow.scrollTo(0, 0);
                let connectsBalance=null;
                try{
                    connectsBalance=unsafeWindow.$nuxt.$store._vm.$data.$$state['job-apply'].selectedContractorJobApplyPriceInfo.connects;
                }catch(error){}
                console.log(`Insufficient connects: ${connectsBalance}`);
                alertMessage(`connects=${connectsBalance}: ${applyData.email}`)
                await applyNextEmail(applyData, `connects=${connectsBalance}`);
                exitTimeout=3;
                return true;
            }
            if ([...document.querySelectorAll("p")].filter(a => a.innerText.includes("You can't submit a proposal because your account is suspended.")).length
                || [...document.querySelectorAll("[role=alert]")].filter(a => a.innerText.includes("Your account has been suspended")).length
                || [...document.querySelectorAll("[role=alert]")].filter(a => a.innerText.includes("Your account is on hold")).length
                || [...document.querySelectorAll("[role=alert]")].filter(a => a.innerText.includes("Your account has been restricted")).length
                || [...document.querySelectorAll("[role=alert]")].filter(a => a.innerText.includes("Financial transactions for") && a.innerText.includes("have been limited")).length) {
                checkBreakConfirmed = true;
                clearTimeout(scrollToBottomTimeout);
                unsafeWindow.scrollTo(0, 0);
                console.log("Account suspended.");
                alertMessage(`suspended: ${applyData.email}`)
                await applyNextEmail(applyData, "suspended");
                exitTimeout=3;
                return true;
            }
            if ([...document.querySelectorAll("h3")].filter(a => a.innerText.includes("Sorry, we were unable to save your application.")).length) {
                checkBreakConfirmed = true;
                clearTimeout(scrollToBottomTimeout);
                unsafeWindow.scrollTo(0, 0);
                console.log("Something went wrong.");
                alertMessage("Something went wrong.")
                await putApplyState(applyData, "something-wrong");
                return true;
            }
        }
        (async function(){
            while (true) {
                let checkBreakResult=await checkBreak();
                if(checkBreakResult)break;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        })();
        let proposalData = applyData.proposalData;
        loop_1: while (true) {
            while (!proposalData) {
                try {
                    if (checkBreakConfirmed) break loop_1;
                    const response = await fetch(`${SERVER_URL}/api/v2/apply/${applyData.email}/${applyData.jobId}/`);
                    const data = await response.json();
                    console.log("applyData:");
                    console.log(data);
                    if (data.proposalJson && data.state!="something-missed") {
                        applyData = data;
                        proposalData = JSON.parse(data.proposalJson);
                        break;
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alertMessage(error);
                }
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            while (true) {
                let btnSubmit = [...document.querySelectorAll("button")].filter(a => a.innerText.includes("Send for ") || a.innerText.includes("Submit"))[0];
                if (btnSubmit && !btnSubmit.disabled) {
                    console.log("Ready");
                    break;
                }
                await new Promise(r => setTimeout(r, 1000));
            }

            applyData.jobTitle=document.querySelector(".fe-job-details h3").innerText.trim();
            GM_setValue("applyData", applyData);

            let vueData = unsafeWindow.$nuxt.$store._vm.$data.$$state['job-apply'];
            if (vueData.ciphertext != applyData.jobId) alert(`JobId is different with applyJson\n${vueData.ciphertext}\n${applyData.jobId}`);

            [...document.querySelectorAll("p")].filter(a => a.innerText.includes("Please fix the errors below")).forEach(a => a.remove());

            while (true) {
                let hourlyRateInput = document.querySelector("#step-rate");
                let projectModeRadio = document.querySelectorAll("input[type=radio][name=milestoneMode]")[1];
                let fixedBudgetInput = document.querySelector("#charged-amount-id");
                if (hourlyRateInput) {		// if (data.openingsCache[data.ciphertext].opening.hourlyBudgetType == 1) {
                    if (proposalData.hourlyRate) {
                        vueData.chargedAmount = proposalData.hourlyRate;
                        console.log("Hourly Rate Change into: " + proposalData.hourlyRate);
                    } else {
                        console.log("Hourly Rate Not Changed");
                    }
                    break;
                } else if (projectModeRadio || fixedBudgetInput) {		// } else if (data.openingsCache[data.ciphertext].opening.hourlyBudgetType == 2) {
                    vueData.fixedPricePaymentMode = "default";
                    if (proposalData.fixedBudget) {
                        vueData.chargedAmount = proposalData.fixedBudget;
                        console.log("Fixed Budget Change into: " + proposalData.hourlyRate);
                    } else {
                        console.log("Fixed Budget Not Changed");
                    }
                    let dropdownDiv = document.querySelector(".fe-proposal-job-estimated-duration [data-test=dropdown-toggle]");
                    dropdownDiv.click();
                    console.log("Click Dropdown Div");
                    while (true) {
                        let lessThan1Month = document.querySelector(".fe-proposal-job-estimated-duration .up-dropdown-menu-container ul[role=listbox] li:last-child");
                        if (lessThan1Month) {
                            lessThan1Month.click();
                            console.log("Click Less Than 1 Month");
                            break;
                        }
                        await new Promise(r => setTimeout(r, 500));
                    }
                    break;
                } else {
                    // console.log("Unknown Budget Type: " + data.openingsCache[data.ciphertext].opening.hourlyBudgetType);
                    console.log("Budget Type Not Found, Retry...");
                }
                await new Promise(r => setTimeout(r, 500));
            }

            await new Promise(r => setTimeout(r, 1000));
            // vueData.coverLetter = proposalData.proposal;
            var proposalTextarea = document.querySelector("textarea[aria-labelledby=cover_letter_label]");
            proposalTextarea.value = proposalData.proposal;
            proposalTextarea.dispatchEvent(new Event("input"));
            proposalTextarea.dispatchEvent(new Event("change"));
            proposalTextarea.dispatchEvent(new Event("blur"));
            console.log("Set Proposal Textarea");
            // let questionsCount=data.jobDetails.opening.questions.length;
            let questionTextareas = document.querySelectorAll(".fe-proposal-job-questions textarea.up-textarea");
            let questionTextareasCount = questionTextareas.length;
            if (questionTextareasCount && (!proposalData.questions || proposalData.questions.length < questionTextareasCount)) {
                questionTextareas[0].focus();
                await putApplyState(applyData, "something-missed-questions");
                proposalData=null;
                continue;
            }
            for (let i = 0; i < questionTextareasCount; i++) {
                questionTextareas[i].value = proposalData.questions[i];
                questionTextareas[i].dispatchEvent(new Event("input"));
                questionTextareas[i].dispatchEvent(new Event("change"));
                questionTextareas[i].dispatchEvent(new Event("blur"));
                console.log("Set Question Textarea " + i);
            }
            await new Promise(r => setTimeout(r, 1000));

            let btnBoost = [...document.querySelectorAll("button")].filter(a => a.innerText.trim() == "Set a bid")[0];
            let boost=proposalData.boost || 50;
            let btnSubmit = [...document.querySelectorAll("button")].filter(a => a.innerText.includes(`Send for ${boost} Connects`))[0];
            if (btnSubmit) {
                console.log("Already Boosted, Click Submit Button");
                btnSubmit.click();
            } else if (btnBoost) {
                vueData.isBoostConfirmed = true;
                vueData.connectsChargeAmount = boost;
                console.log("Boosted and Click Submit Button");
                while (true) {
                    btnSubmit = [...document.querySelectorAll("button")].filter(a => a.innerText.includes(`Send for ${boost} Connects`))[0];
                    if (btnSubmit && !btnSubmit.disabled) {
                        btnSubmit.click();
                        break;
                    }
                    await new Promise(r => setTimeout(r, 500));
                }
            } else {
                console.log("Boost Button Not Found");
                while (true) {
                    btnSubmit = [...document.querySelectorAll("button")].filter(a => a.innerText.includes(`Send for `) || a.innerText.includes(`Submit a Proposal`) || a.innerText.includes(`Submit a proposal`))[0];
                    if (btnSubmit && !btnSubmit.disabled) {
                        btnSubmit.click();
                        break;
                    }
                    await new Promise(r => setTimeout(r, 500));
                }
                // break;
            }

            for (let i = 0; i < 10; i++) {
                await new Promise(r => setTimeout(r, 1000));
                console.log(`Waiting for submit confirm dialog... ${i}`);

                if ([...document.querySelectorAll("p")].filter(a => a.innerText.includes("Please fix the errors below")).length) {
                    window.scrollTo(0, 0);
                    console.log("Someting missed.");
                    alertMessage("Something missed.")
                    await putApplyState(applyData,"something-missed");
                    proposalData=null;
                    continue loop_1;
                }
                if (checkBreakConfirmed) break loop_1;

                let btnSubmitConfirm = [...document.querySelectorAll(".fe-proposal-disintermediation-dialog button")].filter(a => a.innerText.trim() == "Submit")[0];
                if (btnSubmitConfirm) {

                    btnSubmitConfirm.disabled = false;
                    btnSubmitConfirm.click();
                    console.log("Click Final Submit Button");
                    break;
                }
            }

            for (let i = 0; i < 5; i++) {
                let btnSubmit = [...document.querySelectorAll("button")].filter(a => a.innerText.trim() == "Continue\nto submit")[0];
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.click();
                    console.log("Click Continue Submit Button");
                    break;
                }
                await new Promise(r => setTimeout(r, 500));
            }

            break;
        }
    } else if (location.pathname.includes('/ab/proposals/')) {
        exitTimeout=10;
        (async function(){
            while (true) {
                [...document.querySelectorAll("button")].filter(a => a.innerText.includes("Close the dialogue")).forEach(a => a.click());
                document.querySelector("button[data-ev-label=snackbar_close")?.click()
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        })();
        let applyData=GM_getValue("applyData");
        try {
            const response = await fetch(`${SERVER_URL}/api/v2/apply/${applyData.email}/${applyData.jobId}/success`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    jobTitle: applyData.jobTitle,
                })
            });
            const data = await response.json();
            console.log("reported:");
            console.log(data);
            alertMessage(`OK: ${applyData.email}`);
            exitTimeout=1;
            for(let i=0;i<10;i++){
                document.title=`OK: ${applyData.email}`;
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            console.error('Error:', error);
            alertMessage(error);
        }
    } else if (location.pathname.includes('/nx/plans/membership/')) {
        document.querySelector("#selectPlanButton20Desktop") && document.querySelector("#selectPlanButton20Desktop").click();
        exitTimeout=15;
    } else if (location.pathname.includes('/nx/plans/')) {
        let applyData=GM_getValue("applyData");
        location.href=`https://www.upwork.com/ab/proposals/job/${applyData.jobId}/apply/`;
        exitTimeout=15;
    } else if (location.pathname.includes('/jobs/')) {
        let applyData=GM_getValue("applyData");
        if(applyData) {
            let emailLabel = document.createElement("label");
            emailLabel.style.cssText = "position: fixed;top: 4rem;right: 0.5rem;padding: 0.25rem 0.75rem;border-radius: 1rem;color: #fff;background: #f00;opacity: .75;z-index: 999999;"
            emailLabel.innerText = applyData.email;
            document.body.appendChild(emailLabel);
            alertMessage(`bad-profile: ${applyData.email}`);
            await applyNextEmail(applyData, "bad-profile");
        }
        exitTimeout=1;
    } else {
        exitTimeout=10;
    }
})();